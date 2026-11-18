(function(){
var $=function(s){return document.querySelector(s)},A=function(s){return[].slice.call(document.querySelectorAll(s))};
var N=[['index.html','Anasayfa','Home'],['about.html','Hakkımda','About'],['projects.html','Projeler','Projects'],['gallery.html','Galeri','Gallery'],['blog.html','Blog','Blog'],['contact.html','İletişim','Contact']];
var cur=(location.pathname.split('/').pop()||'index').replace('.html','');
document.body.insertAdjacentHTML('afterbegin','<a class="skip" href="#main" data-en="Skip to content">İçeriğe geç</a><header><div class="wrap"><a class="brand" href="index.html">Emin Yıldırım</a><nav id="nv">'+N.map(function(n){return'<a href="'+n[0]+'"'+(n[0].replace('.html','')==cur?' class="on" aria-current="page"':'')+' data-en="'+n[2]+'">'+n[1]+'</a>'}).join('')+'</nav><div class="tools"><button id="lg" type="button"></button><button id="mn" type="button" aria-label="Menu">☰</button></div></div></header>');
document.body.insertAdjacentHTML('beforeend','<footer><div class="wrap">© 2026 Emin Yıldırım · <span data-en="Akdeniz University, Computer Programming">Akdeniz Üniversitesi, Bilgisayar Programcılığı</span></div></footer>');
var mnEl=$('main');if(mnEl)mnEl.id='main';
var L='tr';
function lang(l){L=l;document.documentElement.lang=l;try{localStorage.setItem('lang',l)}catch(e){}
A('[data-en]').forEach(function(n){if(n.dataset.tr==null)n.dataset.tr=n.textContent;n.textContent=l=='en'?n.dataset.en:n.dataset.tr});
$('#lg').textContent=l=='en'?'TR':'EN';$('#lg').setAttribute('aria-label',l=='en'?'Türkçe':'English')}
var sv=null;try{sv=localStorage.getItem('lang')}catch(e){}
lang(sv=='en'?'en':'tr');
$('#lg').onclick=function(){lang(L=='en'?'tr':'en')};
var nv=$('#nv'),bt=$('#mn'),lb;function tog(o){nv.classList.toggle('open',o);bt.setAttribute('aria-expanded',nv.classList.contains('open'))}
bt.setAttribute('aria-expanded','false');bt.onclick=function(){tog()};nv.onclick=function(e){if(e.target.closest('a'))tog(false)};
document.addEventListener('keydown',function(e){if(e.key=='Escape'){tog(false);if(lb)lb.hidden=true}});
A('.f').forEach(function(b){b.onclick=function(){A('.f').forEach(function(x){x.classList.remove('on')});b.classList.add('on');var k=b.dataset.f;A('.post').forEach(function(p){p.hidden=k!='all'&&(' '+p.dataset.k+' ').indexOf(' '+k+' ')<0})}});
var cf=$('#cf');if(cf)cf.onsubmit=function(e){e.preventDefault();var f=new FormData(cf),st=$('#st'),en=L=='en';
CMS.contact({n:f.get('n'),e:f.get('e'),s:f.get('s'),m:f.get('m')}).then(function(){cf.reset();st.textContent=en?'Your message was sent, thank you.':'Mesajın gönderildi, teşekkürler.'}).catch(function(x){st.textContent=x=='r'?(en?'Too many messages. Try again in 10 minutes.':'Çok fazla mesaj gönderildi. 10 dakika sonra tekrar dene.'):(en?'The message could not be sent, please try again.':'Mesaj gönderilemedi, lütfen tekrar dene.')})};
lb=document.createElement('div');lb.className='lb';lb.hidden=true;lb.innerHTML='<img alt=""><p></p>';document.body.appendChild(lb);
A('.gal.full figure').forEach(function(f){function o(){var i=f.querySelector('img');if(!i)return;lb.querySelector('img').src=i.src;lb.querySelector('p').textContent=f.querySelector('figcaption').textContent;lb.hidden=false}
f.tabIndex=0;f.setAttribute('role','button');f.onclick=o;f.onkeydown=function(e){if(e.key=='Enter'||e.key==' '){e.preventDefault();o()}}});
lb.onclick=function(){lb.hidden=true};
})();

(function(){
const host=document.getElementById('host');if(!host)return;
const cv=host.querySelector('canvas'),ctx=cv.getContext('2d');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const ST=18,LERP=.14,SPRING=.028,DAMP=.85;
const P={haze:[176,180,190],body:[208,211,219],core:[236,238,243],rest:[96,99,108],rim:[205,209,218],sheen:[255,255,255]};
const mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));
let W=0,H=0,SP=14,rib=[],present=false,lastMove=0,focus=0,hold=false,hb=0,vis=true,running=false,last=performance.now();
const tp={x:0,y:0},ep={x:0,y:0},waves=[];
function build(){SP=W<700?18:14;const cols=Math.ceil(W/SP)+3,rows=Math.ceil(H/ST)+3,ox=(W-(cols-1)*SP)/2,oy=(H-(rows-1)*ST)/2;rib=[];
for(let c=0;c<cols;c++){const hx=ox+c*SP,nodes=[];for(let r=0;r<rows;r++){const hy=oy+r*ST;nodes.push({hx,hy,x:hx,y:hy,vx:0,vy:0})}rib.push({nodes,avg:0})}}
function size(){W=host.clientWidth;H=host.clientHeight;const d=Math.min(devicePixelRatio||1,2);cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);build();mask()}
function mask(){const s=host.querySelector('.stack');if(!s)return;const r=s.getBoundingClientRect(),h=host.getBoundingClientRect();
host.style.setProperty('--mcx',(r.left-h.left+r.width/2)+'px');host.style.setProperty('--mcy',(r.top-h.top+r.height/2)+'px');
host.style.setProperty('--mrx',(r.width*.6)+'px');host.style.setProperty('--mry',(r.height*.62)+'px')}
new ResizeObserver(size).observe(host);new ResizeObserver(mask).observe(host.querySelector('.stack'));size();ep.x=tp.x=W/2;ep.y=tp.y=H/2;
function move(e){const b=host.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
if(x<0||y<0||x>b.width||y>b.height){present=false;return}
if(!present){ep.x=x;ep.y=y}present=true;lastMove=performance.now();tp.x=x;tp.y=y}
addEventListener('pointermove',move,{passive:true});
host.addEventListener('pointerdown',e=>{move(e);hold=true});
addEventListener('pointerup',()=>{if(hold){hold=false;waves.push({x:ep.x,y:ep.y,radius:12,speed:Math.max(W,H)*.82,strength:4.6+hb*3.8,width:58,life:1})}});
addEventListener('pointercancel',()=>{hold=false;present=false});
document.addEventListener('mouseleave',()=>{present=false;hold=false});
function trace(n){ctx.beginPath();ctx.moveTo(n[0].x,n[0].y);for(let r=1;r<n.length-1;r++){const a=n[r],b=n[r+1];ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2)}const l=n[n.length-1];ctx.lineTo(l.x,l.y)}
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(4)})`;
function frame(now){
if(!vis){running=false;return}
const dt=Math.min(.05,(now-last)*.001);last=now;const t=now*.001;
hb+=((hold?1:0)-hb)*.12;
if(present&&!hold&&now-lastMove>1800)present=false;
focus+=((present?1:0)-focus)*.07;const flou=1-focus;
const maxD=Math.hypot(W,H)*.9;
for(let i=waves.length-1;i>=0;i--){const w=waves[i];w.radius+=w.speed*dt;w.life=Math.max(0,1-w.radius/maxD);w.life*=w.life;if(w.life<=.003)waves.splice(i,1)}
ep.x+=(tp.x-ep.x)*LERP;ep.y+=(tp.y-ep.y)*LERP;
const R=(.31+hb*.12)*Math.min(W,H),rSq=R*R,invR=1/R,F=(4.6+hb*3.4)*focus,px=ep.x,py=ep.y;
host.style.setProperty('--px',px.toFixed(1)+'px');host.style.setProperty('--py',py.toFixed(1)+'px');
host.style.setProperty('--focus',focus.toFixed(4));host.style.setProperty('--spot-r',(R*.92).toFixed(1)+'px');
const amb=reduce?0:.045+flou*.18;
for(let c=0;c<rib.length;c++){const nodes=rib[c].nodes;let sum=0;const ph=c*.34;
for(let r=0;r<nodes.length;r++){const n=nodes[r],dx=n.x-px,dy=n.y-py,dSq=dx*dx+dy*dy;
n.vx+=(Math.sin(t*1.15+ph+r*.14)*.7+Math.cos(t*.68-c*.18+r*.09)*.3)*amb;
n.vy+=Math.cos(t*.95+ph+r*.11)*amb*.35;
if(focus>.005&&dSq<rSq){const d=Math.sqrt(dSq),fo=1-d*invR,f=fo*fo*F;
if(d>1e-4){const nx=dx/d,ny=dy/d;n.vx+=nx*f*1.24;n.vy+=ny*f*.52+nx*f*.48}else n.vx+=(c%2?-1:1)*f}
for(let k=0;k<waves.length;k++){const w=waves[k],wx=n.hx-w.x,wy=n.hy-w.y,wd=Math.sqrt(wx*wx+wy*wy),de=wd-w.radius;
if(Math.abs(de)<w.width*2&&wd>1e-3){const env=Math.exp(-(de*de)/(2*w.width*w.width)),pu=Math.sin(de/w.width*Math.PI)*w.strength*env*w.life;n.vx+=wx/wd*pu;n.vy+=wy/wd*pu*.4}}
n.vx+=(n.hx-n.x)*SPRING;n.vy+=(n.hy-n.y)*SPRING;n.vx*=DAMP;n.vy*=DAMP;n.x+=n.vx;n.y+=n.vy;
sum+=Math.hypot(n.x-n.hx,n.y-n.hy)}
rib[c].avg=sum/nodes.length}
ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';
for(let c=0;c<rib.length;c++){const rb=rib[c],n=rb.nodes;if(n.length<2)continue;
const st=Math.min(1,rb.avg/48),dis=Math.max(.05,1-Math.pow(st,1.25)*.9*focus),sh=.5+.5*Math.sin(t*1.35+c*.36);
if(flou>.015){trace(n);ctx.strokeStyle=rgba(P.haze,flou*(.055+sh*.025)*dis);ctx.lineWidth=14*flou+2;ctx.stroke();
ctx.strokeStyle=rgba(P.body,flou*(.085+sh*.035)*dis);ctx.lineWidth=7*flou+1.4;ctx.stroke()}
const sb=mix(P.rest,P.rim,Math.pow(st,.65)),sr=mix(sb,P.sheen,Math.pow(st,1.9)*(.75+hb*.25)),fin=mix(P.core,sr,focus);
const ca=(flou*(.135+sh*.04)+focus*(.48+st*.44+hb*st*.14))*dis,rc=Math.sin(st*Math.PI)*focus;
trace(n);ctx.strokeStyle=rgba(fin,Math.max(.025,ca));ctx.lineWidth=flou*2.2+focus*1.4+rc*(1.25+hb*.55);ctx.stroke()}
if(!reduce)requestAnimationFrame(frame);else running=false}
function start(){if(running)return;running=true;last=performance.now();requestAnimationFrame(frame)}
new IntersectionObserver(([e])=>{vis=e.isIntersecting;if(vis)start()}).observe(host);
})();
