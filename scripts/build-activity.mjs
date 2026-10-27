import { mkdir, writeFile } from 'node:fs/promises';

const query = `query { user(login: "tahmidkhanshuvo") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'Tahmid-Profile-Activity' },
  body: JSON.stringify({ query }),
});
if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
const result = await response.json();
if (result.errors || !result.data?.user) throw new Error('GitHub activity could not be retrieved.');
const calendar = result.data.user.contributionsCollection.contributionCalendar;
const weeks = calendar.weeks.slice(-52);
const levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
const days = weeks.flatMap((week, x) => week.contributionDays.map((day, y) => ({ ...day, x, y, level: Math.max(0, levels.indexOf(day.contributionLevel)) })));
const data = { generatedAt: new Date().toISOString(), total: days.reduce((sum, day) => sum + day.contributionCount, 0), days };
await mkdir('arcade', { recursive: true });
await mkdir('assets', { recursive: true });
await writeFile('arcade/activity.json', JSON.stringify(data));
const colors = ['#21332d', '#3d7659', '#6aa375', '#a0d78b', '#d9f578'];
const cubes = days.map(day => {
  const x = 70 + day.x * 17 + day.y * 9, y = 95 + day.y * 13, h = day.level * 10 + 2;
  const title = `${day.date}: ${day.contributionCount} contributions`;
  return `<g><title>${title}</title><path d="M${x} ${y-h}l15 0 8 7-15 0z" fill="${colors[day.level]}"/><path d="M${x} ${y-h}l8 7v${h}l-8-7z" fill="${colors[day.level]}" opacity=".7"/><path d="M${x+8} ${y+7-h}h15v${h}h-15z" fill="${colors[day.level]}" opacity=".45"/></g>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="300" viewBox="0 0 1120 300" role="img" aria-labelledby="title desc"><title id="title">Tahmid's contribution skyline</title><desc id="desc">An isometric view of ${data.total} GitHub contributions over the displayed 52 weeks, generated ${data.generatedAt.slice(0,10)}. Open the arcade to play Snake.</desc><style>@keyframes scan{from{transform:translateX(0)}to{transform:translateX(930px)}}.scan{animation:scan 12s ease-in-out infinite alternate}@media(prefers-reduced-motion:reduce){.scan{animation:none}}</style><defs><linearGradient id="beam"><stop stop-color="#d9f578" stop-opacity="0"/><stop offset=".5" stop-color="#d9f578" stop-opacity=".14"/><stop offset="1" stop-color="#d9f578" stop-opacity="0"/></linearGradient></defs><rect width="1120" height="300" rx="22" fill="#101815"/><text x="48" y="43" fill="#d9f578" font-family="monospace" font-size="12" letter-spacing="3">THE CONTRIBUTION SKYLINE</text><g transform="translate(0,20)">${cubes}</g><rect class="scan" x="30" y="73" width="90" height="150" fill="url(#beam)"/><text x="48" y="257" fill="#e5f0e4" font-family="Arial,sans-serif" font-size="18">${data.total.toLocaleString()} contributions · 52 weeks of building</text><text x="48" y="281" fill="#8ea797" font-family="monospace" font-size="11">${data.generatedAt.slice(0,10)} UTC · GitHub activity snapshot</text><text x="1070" y="266" text-anchor="end" fill="#d9f578" font-family="monospace" font-size="12">PLAY THE GRID ↗</text></svg>`;
await writeFile('assets/contribution-city.svg', svg);
await writeFile('arcade/contribution-city.svg', svg);
console.log(`Generated ${days.length} cells from public profile activity.`);
