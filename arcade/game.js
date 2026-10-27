const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const $ = selector => document.querySelector(selector);
const columns = 52, rows = 30, cell = 15;
let activity = [], snake, direction, nextDirection, food, score = 0, best = 0, running = false, paused = false, changed = false, timer;
try { best = Number(localStorage.getItem('pulse-grid.best')) || 0; } catch {}
$('#best').textContent = best;
$('#year').textContent = new Date().getFullYear();
fetch('activity.json').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => {
  activity = data.days;
  $('#activity-status').textContent = `${data.total.toLocaleString()} contributions in this snapshot · Updated ${new Date(data.generatedAt).toLocaleDateString(undefined,{dateStyle:'long'})} · Public GitHub activity`;
  draw();
}).catch(() => { $('#activity-status').textContent = 'Activity snapshot is unavailable. The arcade still works; view the current calendar on GitHub.'; });
function randomFood() {
  const free = [];
  for (let y=0;y<rows;y++) for (let x=0;x<columns;x++) if (!snake.some(segment=>segment.x===x&&segment.y===y)) free.push({x,y});
  return free.length ? free[Math.floor(Math.random()*free.length)] : null;
}
function reset() {
  clearInterval(timer); snake = [{x:12,y:15},{x:11,y:15},{x:10,y:15},{x:9,y:15}];
  direction = nextDirection = {x:1,y:0}; score=0; changed=false; paused=false; food=randomFood();
  $('#score').textContent='0'; $('#pause').textContent='Pause'; draw();
}
function schedule() { clearInterval(timer); timer=setInterval(tick,Number($('#speed').value)); }
function start() { reset(); running=true; $('#overlay').hidden=true; $('#pause').disabled=false; $('#game-status').textContent='Find the glow. Keep moving.'; schedule(); canvas.focus({preventScroll:true}); }
function end(won=false) {
  running=false; clearInterval(timer); $('#pause').disabled=true;
  $('#overlay h3').innerHTML=won?'You filled the grid.':'One more run?';
  $('#overlay .eyebrow').textContent=won?'GRID COMPLETE':`SCORE ${score} · BEST ${best}`;
  $('#overlay p').textContent='Every experiment teaches you something.';
  $('#start').textContent='Play again ↗'; $('#overlay').hidden=false;
  $('#game-status').textContent=won?'Grid complete. You win!':`Game over. Final score ${score}.`;
}
function tick() {
  if (!running||paused) return;
  direction=nextDirection; changed=false;
  const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};
  const eats=head.x===food.x&&head.y===food.y;
  const body=eats?snake:snake.slice(0,-1);
  if (head.x<0||head.x>=columns||head.y<0||head.y>=rows||body.some(segment=>segment.x===head.x&&segment.y===head.y)) return end();
  snake.unshift(head);
  if (eats) {
    score+=10; $('#score').textContent=score;
    if(score>best){best=score;$('#best').textContent=best;try{localStorage.setItem('pulse-grid.best',String(best));}catch{}}
    food=randomFood(); if(!food)return end(true);
  } else snake.pop();
  draw();
}
function draw() {
  ctx.fillStyle='#0e1712';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let x=0;x<columns;x++)for(let y=0;y<rows;y++){
    const day=activity.find(day=>day.x===x&&day.y===y%7);
    ctx.fillStyle=['#17251d','#203628','#2b4932','#37583b','#4b7043'][day?.level||0];
    ctx.globalAlpha=y<7?0.65:0.18;ctx.fillRect(x*cell+1,y*cell+1,cell-2,cell-2);
  }
  ctx.globalAlpha=1;
  if(food){ctx.shadowBlur=18;ctx.shadowColor='#d9f578';ctx.fillStyle='#d9f578';ctx.beginPath();ctx.arc(food.x*cell+7.5,food.y*cell+7.5,4.7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  snake?.forEach((segment,i)=>{ctx.fillStyle=i===0?'#efffbd':`hsl(${96+i%20},40%,${Math.max(30,65-i*.9)}%)`;ctx.beginPath();ctx.roundRect(segment.x*cell+1,segment.y*cell+1,cell-2,cell-2,i===0?4:3);ctx.fill();});
}
const directions={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
function turn(name){const candidate=directions[name];if(!candidate||!running||paused||changed||(candidate.x===-direction.x&&candidate.y===-direction.y))return;nextDirection=candidate;changed=true;}
function pause(){if(!running)return;paused=!paused;$('#pause').textContent=paused?'Resume':'Pause';$('#game-status').textContent=paused?'Paused. Take your time.':'Back in the grid.';draw();if(paused){ctx.fillStyle='#101815aa';ctx.fillRect(0,0,780,450);ctx.fillStyle='#d9f578';ctx.font='24px system-ui';ctx.textAlign='center';ctx.fillText('PAUSED',390,225);}}
canvas.addEventListener('keydown',event=>{const name={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'}[event.key];if(name){event.preventDefault();turn(name);}else if(event.code==='Space'){event.preventDefault();pause();}else if(event.key.toLowerCase()==='r')start();});
document.querySelectorAll('[data-dir]').forEach(button=>button.addEventListener('click',()=>turn(button.dataset.dir)));
$('#start').addEventListener('click',start);$('#restart').addEventListener('click',start);$('#pause').addEventListener('click',pause);$('#speed').addEventListener('change',()=>{if(running)schedule();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pause();});
let touch;
canvas.addEventListener('touchstart',event=>{touch={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};},{passive:true});
canvas.addEventListener('touchend',event=>{if(!touch)return;const x=event.changedTouches[0].clientX-touch.x,y=event.changedTouches[0].clientY-touch.y;if(Math.max(Math.abs(x),Math.abs(y))>12)turn(Math.abs(x)>Math.abs(y)?x>0?'right':'left':y>0?'down':'up');touch=null;},{passive:true});
reset();
