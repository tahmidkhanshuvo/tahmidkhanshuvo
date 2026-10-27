import { readFile, writeFile } from 'node:fs/promises';
const logoNames = [
  ['react','React'],['next-js','Next.js'],['javascript','JavaScript'],['python','Python'],['flutter','Flutter'],['dart','Dart'],
  ['node-js','Node.js'],['bun','Bun'],['express','Express'],['laravel','Laravel'],['asp-net','ASP.NET'],['php','PHP'],
  ['postgresql','PostgreSQL'],['mongodb','MongoDB'],['mysql','MySQL'],['redis','Redis'],['firebase','Firebase'],['csharp','C#'],
  ['c','C'],['cplusplus','C++'],['arduino','Arduino'],['docker','Docker'],['ubuntu','Linux'],['git','Git'],
  ['github','GitHub'],['github-actions','Actions'],['tailwind-css','Tailwind CSS'],
];
const cards = await Promise.all(logoNames.map(async ([id,label],index)=>{
  const source = await readFile(`assets/stack/${id}.svg`,'utf8');
  const viewBox = source.match(/viewBox="([^"]+)"/)?.[1] || '0 0 128 128';
  let inner = source.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>[\s\S]*$/,'');
  inner = inner.replace(/id="([^"]+)"/g,(_,name)=>`id="${id}-${name}"`).replace(/url\(#([^)]+)\)/g,(_,name)=>`url(#${id}-${name})`);
  const badge = ['next-js','express','github','bun'].includes(id) ? '<rect x="7" y="7" width="48" height="50" rx="10" fill="#f1f5ff"/>' : '';
  const x=36+(index%6)*176,y=94+Math.floor(index/6)*76;
  return `<g transform="translate(${x},${y})"><rect width="166" height="64" rx="12" fill="#121b30" stroke="#ffffff12"/><rect width="166" height="64" rx="12" fill="none" stroke="#65e4f8" opacity="0"><animate attributeName="opacity" values="0;0;.55;0;0" dur="8s" begin="${index*.17}s" repeatCount="indefinite"/></rect>${badge}<svg x="13" y="13" width="36" height="36" viewBox="${viewBox}" fill="${badge?'#111827':'#edf2ff'}">${inner}</svg><text x="60" y="37" fill="#d9e4fb" font-size="12" font-family="Arial,sans-serif">${label}</text></g>`;
}));
await writeFile('assets/stack-panel.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="490" viewBox="0 0 1120 490" role="img" aria-labelledby="title"><title id="title">Tools across my software and systems work: languages, frameworks, data, embedded systems and delivery.</title><defs><radialGradient id="glow"><stop stop-color="#6a4dff" stop-opacity=".2"/><stop offset="1" stop-color="#6a4dff" stop-opacity="0"/></radialGradient></defs><rect width="1120" height="490" rx="24" fill="#0b1021"/><ellipse cx="1000" cy="50" rx="330" ry="200" fill="url(#glow)"><animate attributeName="cx" values="1000;760;1000" dur="18s" repeatCount="indefinite"/></ellipse><text x="36" y="40" fill="#72e9fa" font-size="10" font-family="monospace" letter-spacing="3">THE TOOLKIT / ALWAYS EXPANDING</text><text x="36" y="69" fill="#f1f5ff" font-size="21" font-family="Arial,sans-serif">Different layers. One connected workspace.</text>${cards.join('')}</svg>`);
const data=JSON.parse(await readFile('arcade/activity.json','utf8'));
const points=[];
for(let y=0;y<7;y++) for(let n=0;n<52;n++){const x=y%2?51-n:n;points.push([43+x*20,90+y*20]);}
const path=points.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ');
const colors=['#1b2540','#263861','#365c8f','#4e9cb7','#72e9fa'];
const grid=data.days.map(day=>`<rect x="${35+day.x*20}" y="${82+day.y*20}" width="16" height="16" rx="4" fill="${colors[day.level]}"><title>${day.date}: ${day.contributionCount} contributions</title></rect>`).join('');
const snake=Array.from({length:12},(_,index)=>`<circle r="${index===0?7:6}" fill="${index===0?'#fff4ff':'#b794ff'}" opacity="${1-index*.055}"><animateMotion dur="46s" begin="-${1.5-index*.12}s" repeatCount="indefinite" path="${path}"/></circle>`).reverse().join('');
await writeFile('assets/contribution-snake.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="300" viewBox="0 0 1120 300" role="img" aria-labelledby="title desc"><title id="title">Contribution snake — a profile animation</title><desc id="desc">An animated snake travels through ${data.total} contributions displayed across 52 weeks. Generated ${data.generatedAt.slice(0,10)}. This animation does not modify GitHub activity.</desc><defs><radialGradient id="purple"><stop stop-color="#8a58ff" stop-opacity=".25"/><stop offset="1" stop-color="#8a58ff" stop-opacity="0"/></radialGradient><filter id="soft"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="1120" height="300" rx="24" fill="#0b1021"/><ellipse cx="850" cy="240" rx="370" ry="180" fill="url(#purple)"><animate attributeName="cx" values="850;300;850" dur="20s" repeatCount="indefinite"/></ellipse><text x="36" y="39" fill="#72e9fa" font-family="monospace" font-size="11" letter-spacing="3">CONTRIBUTION SNAKE / ONE SQUARE AT A TIME</text>${grid}${snake}<circle r="9" fill="#b794ff" opacity=".4" filter="url(#soft)"><animateMotion dur="46s" begin="-1.5s" repeatCount="indefinite" path="${path}"/></circle><text x="36" y="260" fill="#edf2ff" font-family="Arial,sans-serif" font-size="18">${data.total} contributions · 52 weeks of curiosity</text><text x="36" y="282" fill="#8091b2" font-family="monospace" font-size="10">ACTIVITY SNAPSHOT ${data.generatedAt.slice(0,10)} UTC</text><text x="1084" y="273" text-anchor="end" fill="#b794ff" font-family="monospace" font-size="11">LEARN → BUILD → EXPLORE → REPEAT</text></svg>`);
console.log('Generated animated stack and contribution panels.');
