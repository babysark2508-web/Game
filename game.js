const C=document.getElementById("game"),ctx=C.getContext("2d");
let W,H,dpr,keys={},running=false,last=0,camX=0,camY=0,coins=0,stage=1,msgTimer=0;
const player={x:120,y:300,w:30,h:48,vx:0,vy:0,hp:100,onGround:false,face:1,attack:0,inv:0};
let platforms=[],enemies=[],boss=null,particles=[],worldW=2600,worldH=900;

function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;C.width=W*dpr;C.height=H*dpr;C.style.width=W+"px";C.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize);resize();

function reset(){
 coins=0;stage=1;camX=0;camY=0;player.x=120;player.y=300;player.vx=player.vy=0;player.hp=100;player.inv=0;player.attack=0;boss=null;
 platforms=[
  [0,570,700,60],[780,570,620,60],[1480,570,620,60],[2180,570,600,60],
  [250,430,260,28],[590,330,260,28],[900,430,270,28],[1190,310,250,28],
  [1530,420,250,28],[1790,300,260,28],[2250,420,230,28],[2500,290,220,28],
  [400,190,230,24],[1000,150,240,24],[1650,150,230,24]
 ];
 enemies=[
  enemy(420,520,"slime"),enemy(930,520,"knight"),enemy(1240,260,"bat"),
  enemy(1580,370,"slime"),enemy(1870,250,"knight"),enemy(2290,370,"slime"),enemy(2580,240,"knight")
 ];
 particles=[];
 say("Tầng 1 — Khu rừng bóng đêm",1600);
}
function enemy(x,y,type){return{x,y,w:34,h:46,vx:0,vy:0,hp:type==="knight"?45:28,type,dir:-1,dead:false,onGround:false}}
function say(t,ms=1200){const e=document.getElementById("message");e.textContent=t;e.style.opacity=1;msgTimer=ms}
function spawnBoss(){if(boss)return;boss={x:2440,y:190,w:70,h:92,vx:0,vy:0,hp:320,max:320,dir:-1,onGround:false,hit:0,dead:false};document.getElementById("bossPanel").classList.remove("hidden");say("⚠️ BOSS HẮC KIẾM XUẤT HIỆN!",1800)}

function input(){
 let l=keys.left||keys.a||keys.ArrowLeft,r=keys.right||keys.d||keys.ArrowRight;
 player.vx+=(r-l)*0.75;player.vx*=.82;player.vx=Math.max(-5,Math.min(5,player.vx));
 if(r)player.face=1;if(l)player.face=-1;
}
function jump(){if(player.onGround){player.vy=-12;player.onGround=false}}
function attack(){if(player.attack<=0)player.attack=260}
function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function physics(o){
 o.vy+=.55;o.x+=o.vx;o.y+=o.vy;o.onGround=false;
 for(const p of platforms)if(o.x+o.w>p[0]&&o.x<p[0]+p[2]&&o.y+o.h>p[1]&&o.y+o.h< p[1]+o.vy+8){o.y=p[1]-o.h;o.vy=0;o.onGround=true}
 if(o.x<0)o.x=0;if(o.x+o.w>worldW)o.x=worldW-o.w;if(o.y>worldH+200){o.y=200;o.vy=0}
}
function swordBox(){return{x:player.face>0?player.x+12:player.x-55,y:player.y+4,w:55,h:42}}
function damagePlayer(n){if(player.inv>0)return;player.hp-=n;player.inv=700;player.vx=-player.face*5;player.vy=-4;burst(player.x+15,player.y+20,"#ff4060",8);if(player.hp<=0){player.hp=100;player.x=120;player.y=300;say("Bạn đã ngã! Hồi sinh...",1200)}}
function update(dt){
 input();
 if(keys.jump){jump();keys.jump=false} if(keys.attack){attack();keys.attack=false}
 player.vy+=.55;physics(player);player.attack=Math.max(0,player.attack-dt);player.inv=Math.max(0,player.inv-dt);
 for(const e of enemies){if(e.dead)continue;e.vy+=.55;e.vx+=(e.x<player.x?0.12:-0.12);e.vx*=.9;e.vx=Math.max(-2,Math.min(2,e.vx));e.dir=e.vx<0?-1:1;physics(e);if(rectHit(player,e))damagePlayer(e.type==="knight"?12:7);if(player.attack>90&&rectHit(swordBox(),e)){e.hp-=35;e.vx=player.face*5;burst(e.x+17,e.y+20,"#ffe8a0",7);if(e.hp<=0){e.dead=true;coins+=e.type==="knight"?15:8;burst(e.x+17,e.y+20,"#b85cff",16)}}}
 if(player.x>2350&&!boss)spawnBoss();
 if(boss&&!boss.dead){boss.vy+=.55;boss.vx+=(boss.x<player.x?.08:-.08);boss.vx*=.94;boss.vx=Math.max(-3,Math.min(3,boss.vx));physics(boss);boss.hit=Math.max(0,boss.hit-dt);if(rectHit(player,boss))damagePlayer(18);if(player.attack>90&&rectHit(swordBox(),boss)&&boss.hit<=0){boss.hp-=18;boss.hit=250;boss.vx=player.face*7;burst(boss.x+35,boss.y+40,"#e04cff",12);if(boss.hp<=0){boss.dead=true;coins+=100;burst(boss.x+35,boss.y+45,"#fff",45);say("🏆 HẮC KIẾM ĐÃ BỊ ĐÁNH BẠI!",4000)}}}
 if(player.x>1400)stage=3;else if(player.x>700)stage=2;else stage=1;
 camX+=(player.x-W*.35-camX)*.08;camX=Math.max(0,Math.min(worldW-W,camX));
 camY+=(player.y-H*.45-camY)*.08;camY=Math.max(0,Math.min(worldH-H,camY));
 for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.05;p.life-=dt}particles=particles.filter(p=>p.life>0);
 document.getElementById("hp").style.width=Math.max(0,player.hp)+"%";document.getElementById("bossHp").style.width=(boss?Math.max(0,boss.hp/boss.max*100):0)+"%";document.getElementById("coins").textContent=coins;document.getElementById("stage").textContent=stage;
 if(msgTimer>0){msgTimer-=dt;if(msgTimer<=0)document.getElementById("message").style.opacity=0}
}
function burst(x,y,c,n){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7,life:400+Math.random()*500,c})}

function draw(){
 ctx.clearRect(0,0,W,H);
 // sky
 let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#101a38");g.addColorStop(1,"#090d18");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.translate(-camX,-camY);
 // moon
 ctx.fillStyle="#dfe8ff";ctx.shadowBlur=35;ctx.shadowColor="#9fbaff";ctx.beginPath();ctx.arc(700,120,52,0,7);ctx.fill();ctx.shadowBlur=0;
 // distant mountains
 ctx.fillStyle="#151d35";for(let x=-200;x<worldW+500;x+=380){ctx.beginPath();ctx.moveTo(x,570);ctx.lineTo(x+190,230);ctx.lineTo(x+390,570);ctx.fill()}
 // platforms
 for(const p of platforms){ctx.fillStyle="#242b42";ctx.fillRect(...p);ctx.fillStyle="#4d5979";ctx.fillRect(p[0],p[1],p[2],5);ctx.fillStyle="#161b2b";ctx.fillRect(p[0],p[1]+10,p[2],p[3]-10)}
 // trees
 for(let x=80;x<worldW;x+=230){ctx.fillStyle="#101729";ctx.fillRect(x,380,24,190);ctx.beginPath();ctx.moveTo(x-55,410);ctx.lineTo(x+12,270);ctx.lineTo(x+80,410);ctx.fill();ctx.beginPath();ctx.moveTo(x-70,480);ctx.lineTo(x+12,315);ctx.lineTo(x+95,480);ctx.fill()}
 // enemies
 for(const e of enemies)if(!e.dead)drawEnemy(e);
 if(boss&&!boss.dead)drawBoss(boss);
 drawPlayer();
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/700);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,5,5)}ctx.globalAlpha=1;
 ctx.restore();
}
function drawPlayer(){let x=player.x,y=player.y;ctx.save();ctx.translate(x+15,y+24);ctx.scale(player.face,1);if(player.inv>0&&Math.floor(player.inv/70)%2===0)ctx.globalAlpha=.4;ctx.fillStyle="#151b2c";ctx.fillRect(-14,-10,28,30);ctx.fillStyle="#6d3b9c";ctx.fillRect(-12,-30,24,22);ctx.fillStyle="#f1d0b0";ctx.beginPath();ctx.arc(0,-38,10,0,7);ctx.fill();ctx.fillStyle="#090b13";ctx.fillRect(-10,-47,22,9);ctx.fillStyle="#e23d72";ctx.fillRect(-13,8,10,5);ctx.fillRect(3,8,10,5);if(player.attack>0){ctx.rotate(-.25);ctx.fillStyle="#dceaff";ctx.shadowBlur=14;ctx.shadowColor="#b66cff";ctx.fillRect(10,-3,52,5);ctx.shadowBlur=0}ctx.restore()}
function drawEnemy(e){ctx.save();ctx.translate(e.x+17,e.y+23);ctx.fillStyle=e.type==="knight"?"#29304b":"#4a9b72";ctx.fillRect(-15,-20,30,35);ctx.fillStyle="#d8a37e";ctx.fillRect(-9,-34,18,15);ctx.fillStyle="#171b29";ctx.fillRect(-8,-30,5,4);ctx.fillRect(3,-30,5,4);ctx.restore()}
function drawBoss(b){ctx.save();ctx.translate(b.x+35,b.y+45);ctx.fillStyle=b.hit?"#fff":"#37134f";ctx.shadowBlur=25;ctx.shadowColor="#bd35ff";ctx.fillRect(-32,-35,64,70);ctx.shadowBlur=0;ctx.fillStyle="#e5a47d";ctx.fillRect(-22,-55,44,25);ctx.fillStyle="#ff3e69";ctx.fillRect(-16,-45,9,5);ctx.fillRect(8,-45,9,5);ctx.fillStyle="#dbe8ff";ctx.rotate(-.2);ctx.fillRect(25,-8,70,7);ctx.restore()}

function loop(t){if(!running)return;let dt=Math.min(32,t-last||16);last=t;update(dt);draw();requestAnimationFrame(loop)}
document.getElementById("play").onclick=()=>{document.getElementById("start").style.display="none";reset();running=true;requestAnimationFrame(loop)};
document.querySelectorAll("#touch button").forEach(b=>{let k=b.dataset.key;const on=e=>{e.preventDefault();keys[k]=true};const off=e=>{e.preventDefault();keys[k]=false};b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointercancel",off);b.addEventListener("pointerleave",off)});
addEventListener("keydown",e=>{let k=e.key;keys[k]=true;if(["ArrowLeft","ArrowRight"," ","a","d","j"].includes(k))e.preventDefault();if(k===" ")keys.jump=true;if(k.toLowerCase()==="j")keys.attack=true});
addEventListener("keyup",e=>keys[e.key]=false);
