/* ===== Techno Code Quest: เกมเดินแผนที่แบบ code.org (ลากก้อนคำสั่ง · กดรัน · ยานเดินจริงบนฉาก) =====
   ใช้แทนเกมช่องสี่เหลี่ยมเดิมของภารกิจ 3, 4, 8 (โหมด grid / command) ทุกด่านสร้างด้วยตัวสร้างแผนที่ที่มีตัวแก้เฉลย
   ด่านจึงแก้ได้จริงเสมอ · ผลต่อด่านเก็บใน state.units.uNN.drafts[ด่าน].cq */
(function(){
  const LEVELS_PER_STAGE=12;
  const DIRS={U:{dx:0,dy:-1,label:'ขึ้น',glyph:'↑',rot:-90},D:{dx:0,dy:1,label:'ลง',glyph:'↓',rot:90},L:{dx:-1,dy:0,label:'ซ้าย',glyph:'←',rot:180},R:{dx:1,dy:0,label:'ขวา',glyph:'→',rot:0}};
  const DIR_KEYS=['U','D','L','R'];

  /* ---------------- ชุดด่าน: กำหนดความยากต่อด่านย่อย ---------------- */
  const PACKS={
    'u3t1':{title:'ลองเดินหาทาง',theme:'garden',item:'star',itemName:'ดาว',kind:'grid',
      size:[4,4,4,4,5,5,5,5,5,6,6,6],obst:[1,2,3,3,4,5,5,6,7,8,9,10],items:[0,0,0,1,0,1,1,2,1,2,2,3],haz:[0,0,0,0,0,0,0,0,0,0,0,0],repeatFrom:99,bug:[]},
    'u3t3':{title:'ย้อนทางและแก้แผน',theme:'garden',item:'star',itemName:'ดาว',kind:'grid',
      size:[4,4,5,5,5,5,5,6,6,6,6,6],obst:[2,3,4,4,5,6,6,7,8,9,10,11],items:[0,1,0,1,1,1,2,2,2,2,3,3],haz:[0,0,0,0,0,0,0,0,0,0,0,0],repeatFrom:99,bug:[2,5,8,11]},
    'u4t1':{title:'ลูกศรบอกทาง',theme:'station',item:'gem',itemName:'แกน',kind:'command',
      size:[3,3,3,3,3,4,4,4,4,4,5,5],obst:[0,1,1,2,2,3,3,4,4,5,6,6],items:[0,0,0,0,1,0,1,1,1,2,2,2],haz:[0,0,0,0,0,0,0,0,0,0,0,0],repeatFrom:99,bug:[]},
    'u4t2':{title:'ต่อคำสั่งให้ถึงประตู',theme:'station',item:'gem',itemName:'แกน',kind:'command',
      size:[3,3,4,4,4,4,4,5,5,5,5,5],obst:[1,2,3,3,4,4,5,6,6,7,8,8],items:[0,0,0,1,0,1,1,1,2,2,2,3],haz:[0,0,0,0,0,0,0,0,0,0,0,0],repeatFrom:99,bug:[3,7,11]},
    'u4t4':{title:'ลำดับก่อนหลัง',theme:'station',item:'gem',itemName:'แกน',kind:'command',
      size:[4,4,4,5,5,5,5,5,6,6,6,6],obst:[2,3,4,4,5,6,7,8,8,9,10,11],items:[1,1,1,1,2,2,2,2,2,3,3,3],haz:[0,0,0,0,0,0,0,0,0,0,0,0],repeatFrom:99,bug:[4,8]},
    'u4t5':{title:'ทำซ้ำให้สั้นลง',theme:'station',item:'gem',itemName:'แกน',kind:'command',
      size:[4,4,5,5,5,5,6,6,6,6,6,6],obst:[1,2,2,3,3,4,4,5,5,6,7,8],items:[0,0,0,0,1,1,1,1,2,2,2,3],haz:[0,0,0,0,0,0,0,0,0,0,0,0],repeatFrom:0,bug:[]},
    'u8t1':{title:'หลบเสาพายุ',theme:'storm',item:'shield',itemName:'โล่',kind:'grid',
      size:[4,4,4,5,5,5,5,5,6,6,6,6],obst:[0,0,1,1,1,2,2,2,3,3,4,4],items:[0,0,0,0,1,0,1,1,1,1,2,2],haz:[2,3,3,3,4,5,5,6,6,7,8,8],repeatFrom:99,bug:[]},
    'u8t2':{title:'รับโล่ก่อนถึงประตู',theme:'storm',item:'shield',itemName:'โล่',kind:'grid',
      size:[4,4,5,5,5,5,5,6,6,6,6,6],obst:[1,1,2,2,3,3,3,4,4,5,5,6],items:[1,1,1,1,1,2,2,2,2,3,3,3],haz:[2,3,3,4,4,5,5,6,6,7,7,8],repeatFrom:99,bug:[]},
    'u8t4':{title:'เลือกทางที่ปลอดภัย',theme:'storm',item:'shield',itemName:'โล่',kind:'grid',
      size:[5,5,5,5,6,6,6,6,6,6,6,6],obst:[2,2,3,3,4,4,5,5,6,6,7,7],items:[1,1,1,2,2,2,2,2,3,3,3,3],haz:[3,4,4,5,6,6,7,8,8,9,10,10],repeatFrom:4,bug:[6,11]}
  };
  const packKey=(u,topic)=>'u'+u+'t'+topic;
  const packFor=(u,topic)=>PACKS[packKey(u,topic)]||null;

  /* ---------------- ตัวสร้างด่าน (สุ่มแบบกำหนดซ้ำได้ + ตรวจเฉลยด้วยการค้นหา) ---------------- */
  function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
  const keyOf=(x,y)=>x+','+y;

  // หาเส้นทางสั้นสุดที่เก็บของครบ (ผูกเลี้ยวน้อยสุด) · คืน {moves:[...]} หรือ null
  function solve(L){
    const W=L.w,H=L.h,items=L.items,N=items.length,full=(1<<N)-1;
    const itemAt={};items.forEach((p,i)=>itemAt[keyOf(p.x,p.y)]=i);
    const block=new Set([...L.rocks,...L.storms].map(p=>keyOf(p.x,p.y)));
    const start={x:L.start.x,y:L.start.y,m:0,d:''};
    if(itemAt[keyOf(start.x,start.y)]!=null)start.m|=1<<itemAt[keyOf(start.x,start.y)];
    const dist=new Map(),q=[{...start,c:0,path:[]}];
    const id=s=>s.x+','+s.y+','+s.m+','+s.d;
    dist.set(id(start),0);
    // Dijkstra แบบง่าย: ต้นทุน 1 ต่อก้าว + 0.01 ต่อการเปลี่ยนทิศ
    const pq=[{...start,c:0,path:[]}];
    let best=null;
    while(pq.length){
      pq.sort((a,b)=>a.c-b.c);const s=pq.shift();
      if(dist.get(id(s))<s.c-1e-9)continue;
      if(s.x===L.goal.x&&s.y===L.goal.y&&s.m===full){best=s;break}
      for(const k of DIR_KEYS){
        const nx=s.x+DIRS[k].dx,ny=s.y+DIRS[k].dy;
        if(nx<0||ny<0||nx>=W||ny>=H||block.has(keyOf(nx,ny)))continue;
        let m=s.m;const ii=itemAt[keyOf(nx,ny)];if(ii!=null)m|=1<<ii;
        const c=s.c+1+(s.d&&s.d!==k?0.01:0),n={x:nx,y:ny,m,d:k,c,path:[...s.path,k]},nid=id(n);
        if(!dist.has(nid)||dist.get(nid)>c+1e-9){dist.set(nid,c);pq.push(n)}
      }
    }
    return best?best.path:null;
  }
  // นับจำนวนก้อนเมื่อใช้ "ทำซ้ำ" รวมเส้นตรงที่ยาวกว่า 1
  function repeatCost(path){let blocks=0,i=0;while(i<path.length){let j=i;while(j<path.length&&path[j]===path[i])j++;const len=j-i;blocks+=len>1?2:1;i=j}return blocks}
  function runLength(path){const out=[];let i=0;while(i<path.length){let j=i;while(j<path.length&&path[j]===path[i])j++;out.push({k:path[i],n:j-i});i=j}return out}

  function buildLevel(unit,topic,index){
    const P=packFor(unit,topic);
    for(let attempt=0;attempt<60;attempt++){
      const r=rng(unit*100003+topic*7919+index*104729+attempt*31+17);
      const size=P.size[index],w=size,h=size;
      const startOnBorder=()=>{const e=Math.floor(r()*4);return e===0?{x:0,y:Math.floor(r()*h)}:e===1?{x:w-1,y:Math.floor(r()*h)}:e===2?{x:Math.floor(r()*w),y:0}:{x:Math.floor(r()*w),y:h-1}};
      const start=startOnBorder();
      // เดินสุ่มแบบไม่ซ้ำช่องเพื่อสร้างเส้นทางหลัก
      const targetLen=Math.min(w*h-2,Math.round(size*1.4+index*0.45)+2);
      const visited=new Set([keyOf(start.x,start.y)]);
      const cells=[{x:start.x,y:start.y}];
      let cur=start,dirPrev=null,stuck=0;
      while(cells.length<targetLen+1&&stuck<80){
        const opts=DIR_KEYS.filter(k=>{const nx=cur.x+DIRS[k].dx,ny=cur.y+DIRS[k].dy;return nx>=0&&ny>=0&&nx<w&&ny<h&&!visited.has(keyOf(nx,ny))});
        if(!opts.length){break}
        // ชอบเดินต่อทิศเดิม เพื่อให้เห็นเส้นตรงยาวสำหรับการทำซ้ำ
        const weighted=opts.flatMap(k=>k===dirPrev?[k,k,k]:[k]);
        const k=weighted[Math.floor(r()*weighted.length)];
        cur={x:cur.x+DIRS[k].dx,y:cur.y+DIRS[k].dy};visited.add(keyOf(cur.x,cur.y));cells.push(cur);dirPrev=k;stuck++;
      }
      if(cells.length<Math.max(4,Math.min(targetLen,6)))continue;
      const goal=cells[cells.length-1];
      // วางของเก็บบนเส้นทางหลัก (ไม่ซ้ำจุดเริ่ม/ประตู)
      const mid=cells.slice(1,-1).sort(()=>r()-.5);
      const nItems=Math.min(P.items[index],mid.length);
      const items=mid.slice(0,nItems).map(c=>({x:c.x,y:c.y}));
      // อุปสรรค/พายุ วางนอกเส้นทางหลัก
      const free=[];
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!visited.has(keyOf(x,y)))free.push({x,y});
      free.sort(()=>r()-.5);
      // วางใกล้เส้นทางก่อน เพื่อให้ "ล่อ" ให้เดินผิด
      const near=p=>cells.reduce((m,c)=>Math.min(m,Math.abs(c.x-p.x)+Math.abs(c.y-p.y)),99);
      free.sort((a,b)=>near(a)-near(b)+(r()-.5)*1.5);
      const nStorm=Math.min(P.haz[index],free.length),nRock=Math.min(P.obst[index],Math.max(0,free.length-nStorm));
      const storms=free.slice(0,nStorm),rocks=free.slice(nStorm,nStorm+nRock);
      const L={w,h,start:{x:start.x,y:start.y},goal:{x:goal.x,y:goal.y},items,rocks,storms};
      const sol=solve(L);
      if(!sol)continue;
      const useRepeat=index>=P.repeatFrom;
      const par=useRepeat?repeatCost(sol):sol.length;
      if(useRepeat&&runLength(sol).every(s=>s.n<2))continue; // ต้องมีเส้นตรงให้ทำซ้ำได้
      const limit=useRepeat?par+1:Math.min(14,sol.length+3);
      L.solution=sol;L.par=par;L.limit=limit;L.repeat=useRepeat;
      L.theme=P.theme;L.item=P.item;L.itemName=P.itemName;L.index=index;
      // ด่านแก้บั๊ก: มีโปรแกรมที่ผิดหนึ่งก้อนให้แก้
      if(P.bug.includes(index)&&sol.length>=3&&!useRepeat){
        for(let t=0;t<12;t++){
          const pos=Math.floor(r()*sol.length),orig=sol[pos],alts=DIR_KEYS.filter(k=>k!==orig);
          const bad=sol.slice();bad[pos]=alts[Math.floor(r()*alts.length)];
          if(!simulate(L,bad.map(k=>({t:'M',k}))).ok){L.prefill=bad.map(k=>({t:'M',k}));L.bugPos=pos;break}
        }
      }
      return L;
    }
    // สำรอง: ด่านง่ายที่แก้ได้แน่นอน
    const L={w:4,h:4,start:{x:0,y:3},goal:{x:3,y:0},items:[],rocks:[{x:1,y:1}],storms:[],theme:P.theme,item:P.item,itemName:P.itemName,index};
    L.solution=['R','R','R','U','U','U'];L.par=6;L.limit=8;L.repeat=false;return L;
  }

  /* ---------------- จำลองการรันโปรแกรม ---------------- */
  // program: [{t:'M',k}|{t:'R',n,body:[...]}]  · คืนรายการเหตุการณ์ทีละก้าว
  function flatten(program,out=[],path=[]){
    program.forEach((b,i)=>{
      if(b.t==='M')out.push({k:b.k,path:[...path,i]});
      else{for(let n=0;n<b.n;n++)flatten(b.body,out,[...path,i])}
    });
    return out;
  }
  function simulate(L,program){
    const steps=flatten(program);
    const block=new Map();L.rocks.forEach(p=>block.set(keyOf(p.x,p.y),'rock'));L.storms.forEach(p=>block.set(keyOf(p.x,p.y),'storm'));
    const got=new Set();let x=L.start.x,y=L.start.y;
    const ev=[];
    const grab=()=>{L.items.forEach((p,i)=>{if(p.x===x&&p.y===y&&!got.has(i)){got.add(i);ev.push({type:'grab',i,x,y})}})};
    grab();
    for(let s=0;s<steps.length;s++){
      const st=steps[s],d=DIRS[st.k],nx=x+d.dx,ny=y+d.dy;
      if(nx<0||ny<0||nx>=L.w||ny>=L.h){ev.push({type:'bump',k:st.k,x,y,why:'edge',path:st.path});return {ok:false,why:'edge',events:ev,x,y}}
      const b=block.get(keyOf(nx,ny));
      if(b){ev.push({type:'bump',k:st.k,x,y,tx:nx,ty:ny,why:b,path:st.path});return {ok:false,why:b,events:ev,x,y}}
      ev.push({type:'move',k:st.k,fx:x,fy:y,tx:nx,ty:ny,path:st.path});x=nx;y=ny;grab();
    }
    const atGoal=x===L.goal.x&&y===L.goal.y,all=got.size===L.items.length;
    const ok=atGoal&&all;
    return {ok,why:ok?'ok':!atGoal?'short':'items',events:ev,x,y,got:got.size};
  }

  /* ---------------- ภาพ: วาดบน canvas ---------------- */
  const THEMES={
    garden:{sky:['#1b3a8c','#3b7ad8'],plate:['#6f8fd6','#4a68b8'],edge:'#2e4688',glow:'#7cf0c8'},
    station:{sky:['#2a1c78','#5b3fd0'],plate:['#7c70d8','#5648b4'],edge:'#352a86',glow:'#ffd23f'},
    storm:{sky:['#150f3c','#3a2a8e'],plate:['#5f5aa8','#403a82'],edge:'#241e5c',glow:'#ff7ab8'}
  };
  const SPRITE={};
  function sprite(key){
    if(SPRITE[key])return SPRITE[key];
    const img=new Image();img.src=(typeof LEARNING_ASSETS!=='undefined'&&LEARNING_ASSETS[key])||'';SPRITE[key]=img;return img;
  }
  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

  class Scene{
    constructor(canvas,L){
      this.cv=canvas;this.ctx=canvas.getContext('2d');this.L=L;this.t=0;this.px=L.start.x;this.py=L.start.y;this.rot=0;this.gotSet=new Set();
      this.sparks=[];this.shake=0;this.flash=0;this.shrink=1;this.win=0;this.fail=0;this.dir='R';this.trail=[];
      this.stars=Array.from({length:70},(_,i)=>({x:(i*97%600)+(i%7),y:(i*53%600)+(i%5),r:i%5===0?2:1,p:i*0.7}));
      this.layout();
    }
    layout(){
      const S=600,pad=34,L=this.L,cell=Math.floor((S-pad*2)/Math.max(L.w,L.h));
      this.cell=cell;this.ox=Math.round((S-cell*L.w)/2);this.oy=Math.round((S-cell*L.h)/2);
    }
    reset(){this.px=this.L.start.x;this.py=this.L.start.y;this.gotSet=new Set();this.face=1;this.dirKey='R';this.rot=0;this.shrink=1;this.win=0;this.fail=0;this.sparks=[];this.shake=0;this.flash=0;this.trail=[]}
    dirRot(k){if(k==='L')this.face=-1;else if(k==='R')this.face=1;this.dirKey=k;return DIRS[k].rot}
    cx(x){return this.ox+x*this.cell+this.cell/2}
    cy(y){return this.oy+y*this.cell+this.cell/2}
    burst(x,y,color,n=14){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=40+Math.random()*120;this.sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.6+Math.random()*.4,c:color})}}
    draw(dt){
      const ctx=this.ctx,L=this.L,c=this.cell,th=THEMES[L.theme]||THEMES.station;this.t+=dt;
      ctx.save();
      if(this.shake>0){ctx.translate((Math.random()-.5)*this.shake*10,(Math.random()-.5)*this.shake*10);this.shake=Math.max(0,this.shake-dt*3)}
      // ท้องฟ้า
      const g=ctx.createLinearGradient(0,0,0,600);g.addColorStop(0,th.sky[0]);g.addColorStop(1,th.sky[1]);ctx.fillStyle=g;ctx.fillRect(-20,-20,640,640);
      const neb=ctx.createRadialGradient(480,110,10,480,110,260);neb.addColorStop(0,'rgba(255,140,200,.35)');neb.addColorStop(1,'rgba(255,140,200,0)');ctx.fillStyle=neb;ctx.fillRect(0,0,600,600);
      const neb2=ctx.createRadialGradient(80,520,10,80,520,260);neb2.addColorStop(0,'rgba(80,230,200,.3)');neb2.addColorStop(1,'rgba(80,230,200,0)');ctx.fillStyle=neb2;ctx.fillRect(0,0,600,600);
      this.stars.forEach(s=>{ctx.globalAlpha=.4+.6*Math.abs(Math.sin(this.t*1.3+s.p));ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,s.r,s.r)});ctx.globalAlpha=1;
      // ดาวเคราะห์มุมบน
      const pg=ctx.createRadialGradient(540,70,5,545,75,60);pg.addColorStop(0,'#ffe9a8');pg.addColorStop(.5,'#ff9fd0');pg.addColorStop(1,'#7a4fd8');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(545,70,52,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(545,72,84,18,-.35,0,6.283);ctx.stroke();
      // แท่นลอย
      const bx=this.ox-14,by=this.oy-14,bw=c*L.w+28,bh=c*L.h+28;
      ctx.fillStyle='rgba(8,6,40,.45)';rr(ctx,bx+6,by+14,bw,bh,22);ctx.fill();
      const bg=ctx.createLinearGradient(0,by,0,by+bh);bg.addColorStop(0,'#9aa9f0');bg.addColorStop(1,th.edge);ctx.fillStyle=bg;rr(ctx,bx,by,bw,bh,22);ctx.fill();
      ctx.fillStyle='rgba(10,8,50,.55)';rr(ctx,bx+8,by+8,bw-16,bh-16,16);ctx.fill();
      // แผ่นพื้น
      for(let y=0;y<L.h;y++)for(let x=0;x<L.w;x++){
        const px=this.ox+x*c,py=this.oy+y*c,m=3;
        const alt=(x+y)%2===0;
        const pgd=ctx.createLinearGradient(px,py,px,py+c);pgd.addColorStop(0,alt?th.plate[0]:th.plate[1]);pgd.addColorStop(1,alt?th.plate[1]:th.edge);
        ctx.fillStyle=pgd;rr(ctx,px+m,py+m,c-m*2,c-m*2,Math.max(6,c*.1));ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px+m+8,py+m+1.5);ctx.lineTo(px+c-m-8,py+m+1.5);ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.55)';[[10,10],[c-10,10],[10,c-10],[c-10,c-10]].forEach(([ax,ay])=>{ctx.beginPath();ctx.arc(px+ax,py+ay,2.2,0,6.283);ctx.fill()});
      }
      // จุดเริ่ม
      {const sx=this.cx(L.start.x),sy=this.cy(L.start.y);ctx.strokeStyle='rgba(120,255,190,.95)';ctx.lineWidth=4;ctx.setLineDash([8,6]);ctx.lineDashOffset=-this.t*18;rr(ctx,sx-c/2+8,sy-c/2+8,c-16,c-16,12);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='rgba(120,255,190,.95)';ctx.font='700 '+Math.round(c*.18)+'px Kanit,Tahoma,sans-serif';ctx.textAlign='center';ctx.fillText('เริ่ม',sx,sy+c/2-12)}
      // ประตู (พอร์ทัล)
      this.drawPortal(this.cx(L.goal.x),this.cy(L.goal.y),c*.38);
      // อุปสรรค
      L.rocks.forEach(p=>this.drawRock(this.cx(p.x),this.cy(p.y),c*.36,p.x*7+p.y*3));
      L.storms.forEach(p=>this.drawStorm(this.cx(p.x),this.cy(p.y),c*.4,p.x*5+p.y));
      // ของเก็บ
      L.items.forEach((p,i)=>{if(!this.gotSet.has(i))this.drawItem(this.cx(p.x),this.cy(p.y)+Math.sin(this.t*2.4+i)*3,c*.3,L.item)});
      // ยาน
      this.drawShip();
      // ประกาย
      this.sparks=this.sparks.filter(s=>{s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=140*dt;ctx.globalAlpha=Math.max(0,s.life*1.6);ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x,s.y,3.2,0,6.283);ctx.fill();ctx.globalAlpha=1;return s.life>0});
      if(this.flash>0){ctx.fillStyle='rgba(255,70,110,'+(this.flash*.4)+')';ctx.fillRect(-20,-20,640,640);this.flash=Math.max(0,this.flash-dt*2.2)}
      ctx.restore();
    }
    drawPortal(x,y,r){
      const ctx=this.ctx,t=this.t,pulse=this.win?1+Math.sin(t*14)*.08:1;
      const gl=ctx.createRadialGradient(x,y,2,x,y,r*1.9);gl.addColorStop(0,'rgba(255,230,120,.8)');gl.addColorStop(.5,'rgba(120,240,255,.35)');gl.addColorStop(1,'rgba(120,240,255,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x,y,r*1.9*pulse,0,6.283);ctx.fill();
      const hole=ctx.createRadialGradient(x,y,1,x,y,r);hole.addColorStop(0,'#fff6c8');hole.addColorStop(.35,'#3a1a8a');hole.addColorStop(1,'#0a0630');ctx.fillStyle=hole;ctx.beginPath();ctx.arc(x,y,r*pulse,0,6.283);ctx.fill();
      for(let i=0;i<3;i++){ctx.strokeStyle=['#7cf0ff','#ff7ab8','#ffd23f'][i];ctx.lineWidth=3.5-i*.6;ctx.beginPath();ctx.arc(x,y,r*(.95-i*.2)*pulse,t*(1.6+i*.5)+i*2,t*(1.6+i*.5)+i*2+3.2);ctx.stroke()}
      ctx.fillStyle='#fff';ctx.font='700 '+Math.round(r*.5)+'px Kanit,Tahoma,sans-serif';ctx.textAlign='center';ctx.fillText('ประตู',x,y+r+16);
    }
    drawRock(x,y,r,seed){
      const ctx=this.ctx;
      ctx.fillStyle='rgba(0,0,30,.35)';ctx.beginPath();ctx.ellipse(x+4,y+r*.75,r*.95,r*.35,0,0,6.283);ctx.fill();
      const pts=[];for(let i=0;i<9;i++){const a=i/9*6.283,k=.78+((seed*(i+3))%7)/22;pts.push([x+Math.cos(a)*r*k,y+Math.sin(a)*r*k*.9-r*.1])}
      const g=ctx.createLinearGradient(x-r,y-r,x+r,y+r);g.addColorStop(0,'#c9b8a4');g.addColorStop(.5,'#8d7a6e');g.addColorStop(1,'#4d4150');
      ctx.fillStyle=g;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(30,20,40,.55)';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='rgba(40,28,50,.45)';[[-.25,-.1,.2],[.2,.15,.15],[.0,.3,.1]].forEach(([ox,oy,k])=>{ctx.beginPath();ctx.ellipse(x+ox*r,y+oy*r,r*k,r*k*.7,0,0,6.283);ctx.fill()});
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(x-r*.3,y-r*.45,r*.28,r*.12,-.5,0,6.283);ctx.fill();
    }
    drawStorm(x,y,r,seed){
      const ctx=this.ctx,t=this.t;
      ctx.fillStyle='rgba(0,0,30,.35)';ctx.beginPath();ctx.ellipse(x,y+r*.8,r*.9,r*.28,0,0,6.283);ctx.fill();
      const blobs=[[-.45,.1,.5],[0,-.2,.62],[.45,.1,.5],[0,.2,.55]];
      blobs.forEach(([ox,oy,k],i)=>{const bob=Math.sin(t*2+seed+i)*2;const g=ctx.createRadialGradient(x+ox*r,y+oy*r+bob,2,x+ox*r,y+oy*r+bob,r*k);g.addColorStop(0,'#c7a8ff');g.addColorStop(1,'#4a2d98');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+ox*r,y+oy*r+bob,r*k,0,6.283);ctx.fill()});
      const on=Math.sin(t*5+seed)>.2;
      if(on){ctx.fillStyle='#fff6a0';ctx.strokeStyle='#ff9f1c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+r*.1,y-r*.1);ctx.lineTo(x-r*.18,y+r*.35);ctx.lineTo(x+r*.02,y+r*.35);ctx.lineTo(x-r*.12,y+r*.85);ctx.lineTo(x+r*.3,y+r*.2);ctx.lineTo(x+r*.1,y+r*.2);ctx.closePath();ctx.fill();ctx.stroke()}
    }
    drawItem(x,y,r,kind){
      const ctx=this.ctx;
      const gl=ctx.createRadialGradient(x,y,1,x,y,r*2);gl.addColorStop(0,'rgba(255,255,255,.75)');gl.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x,y,r*2,0,6.283);ctx.fill();
      if(kind==='star'){
        ctx.fillStyle='#ffd23f';ctx.strokeStyle='#c58a00';ctx.lineWidth=2;ctx.beginPath();
        for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.5:r*1.05;ctx.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k)}
        ctx.closePath();ctx.fill();ctx.stroke();
      }else if(kind==='shield'){
        const g=ctx.createLinearGradient(x,y-r,x,y+r);g.addColorStop(0,'#9fe8ff');g.addColorStop(1,'#2f7ae0');ctx.fillStyle=g;ctx.strokeStyle='#fff';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.9,y-r*.55);ctx.lineTo(x+r*.8,y+r*.3);ctx.quadraticCurveTo(x,y+r*1.15,x,y+r*1.15);ctx.quadraticCurveTo(x,y+r*1.15,x-r*.8,y+r*.3);ctx.lineTo(x-r*.9,y-r*.55);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(x-r*.1,y-r*.5,r*.2,r*1);ctx.fillRect(x-r*.5,y-r*.1,r,r*.2);
      }else{
        const g=ctx.createLinearGradient(x-r,y-r,x+r,y+r);g.addColorStop(0,'#ffffff');g.addColorStop(.35,'#7be8ff');g.addColorStop(1,'#2563ff');ctx.fillStyle=g;ctx.strokeStyle='#e8fbff';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(x,y-r*1.1);ctx.lineTo(x+r*.9,y-r*.25);ctx.lineTo(x+r*.55,y+r*.95);ctx.lineTo(x-r*.55,y+r*.95);ctx.lineTo(x-r*.9,y-r*.25);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.moveTo(x-r*.9,y-r*.25);ctx.lineTo(x+r*.9,y-r*.25);ctx.moveTo(x,y-r*1.1);ctx.lineTo(x-r*.2,y+r*.95);ctx.stroke();
      }
    }
    drawShip(){
      const ctx=this.ctx,c=this.cell,x=this.cx(this.px),y=this.cy(this.py),img=sprite('techno-ship-fighter'),s=c*.92*this.shrink;
      ctx.save();
      ctx.fillStyle='rgba(0,0,30,.35)';ctx.beginPath();ctx.ellipse(x+3,y+c*.34,s*.32,s*.1,0,0,6.283);ctx.fill();
      const face=this.face||1,k=this.dirKey||'R',tilt=(k==='U'?-24:k==='D'?24:0)*face;
      ctx.translate(x,y+Math.sin(this.t*3)*2);ctx.scale(face,1);ctx.rotate((tilt+(face<0?0:0))*Math.PI/180*(face<0?1:1));
      if(this.moving){ // เปลวท้ายยาน
        const fl=ctx.createLinearGradient(-s*.45,0,-s*.95,0);fl.addColorStop(0,'rgba(255,230,120,.95)');fl.addColorStop(1,'rgba(255,90,160,0)');ctx.fillStyle=fl;ctx.beginPath();ctx.moveTo(-s*.4,-s*.09);ctx.lineTo(-s*(.75+Math.random()*.25),0);ctx.lineTo(-s*.4,s*.09);ctx.closePath();ctx.fill();
      }
      if(img.complete&&img.naturalWidth){ctx.rotate(0.0);const w=s*1.1,h=w*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,-w/2,-h/2,w,h)}
      else{ctx.fillStyle='#ff5fa2';ctx.beginPath();ctx.moveTo(s*.4,0);ctx.lineTo(-s*.3,-s*.25);ctx.lineTo(-s*.3,s*.25);ctx.closePath();ctx.fill()}
      ctx.restore();
    }
  }

  /* ---------------- ส่วนติดต่อผู้ใช้ ---------------- */
  const BLOCK_COLORS={U:'#4aa8ff',D:'#3ec9a0',L:'#ff9f43',R:'#ff6fb4',REP:'#a67cff'};
  function blockHTML(b,path,focusPath,running){
    const p=path.join('.');
    if(b.t==='M')return `<div class="cq-block" data-p="${p}" style="--bc:${BLOCK_COLORS[b.k]}" role="listitem"><span class="cq-glyph">${DIRS[b.k].glyph}</span><span>${DIRS[b.k].label}</span><button class="cq-x" data-del="${p}" aria-label="เอาออก">✕</button></div>`;
    const focus=focusPath===p;
    return `<div class="cq-block cq-rep ${focus?'focus':''}" data-p="${p}" style="--bc:${BLOCK_COLORS.REP}" role="listitem">
      <div class="cq-rep-head"><span>🔁 ทำซ้ำ</span><span class="cq-count"><button data-n="${p}" data-d="-1" aria-label="ลดจำนวนครั้ง">−</button><b>${b.n}</b><button data-n="${p}" data-d="1" aria-label="เพิ่มจำนวนครั้ง">+</button></span><span>ครั้ง</span><button class="cq-x" data-del="${p}" aria-label="เอาออก">✕</button></div>
      <div class="cq-rep-body" data-body="${p}">${b.body.length?b.body.map((c,i)=>blockHTML(c,[...path,'b',i],focusPath,running)).join(''):'<em>แตะก้อนคำสั่ง แล้วใส่ที่นี่</em>'}</div></div>`;
  }
  const getAt=(program,path)=>{ // path เช่น [2] หรือ [2,'b',0]
    let list=program,node=null;
    for(let i=0;i<path.length;i++){
      if(path[i]==='b'){list=node.body;continue}
      node=list[path[i]];if(i===path.length-1)return {list,index:path[i],node};
    }
    return {list,index:-1,node};
  };
  const parsePath=s=>String(s).split('.').map(v=>v==='b'?'b':Number(v));
  const countBlocks=prog=>prog.reduce((n,b)=>n+1+(b.t==='R'?countBlocks(b.body):0),0);

  function render(root,unit,topic,g,d){
    const P=packFor(unit,topic);
    d.cq=d.cq||{level:0,stars:[],tries:{}};
    const cq=d.cq;
    const N=LEVELS_PER_STAGE;
    let level=Math.min(cq.level||0,N-1);
    let L=buildLevel(unit,topic,level);
    let program=L.prefill?JSON.parse(JSON.stringify(L.prefill)):[];
    let focus='',running=false,runToken=0,stepIdx=0,hintShown=false,fails=cq.tries[level]||0,solved=false;
    const done=()=>cq.stars.filter(v=>v>0).length;
    const nextOpen=()=>Math.min(N-1,cq.stars.length);

    root.innerHTML=`<div class="cq" id="cq">
      <div class="cq-head"><div><span class="academic-kicker">ลงมือทำ · ${esc(P.title)}</span><h2>${esc(P.title)}</h2></div><div class="cq-levels" id="cq-levels" role="tablist" aria-label="เลือกด่านย่อย"></div></div>
      <div class="cq-msg" id="cq-msg" role="status" aria-live="polite"></div>
      <div class="cq-main">
        <div class="cq-board"><canvas id="cq-canvas" width="600" height="600" role="img" aria-label="แผนที่เกม"></canvas><div class="cq-board-tag" id="cq-tag"></div></div>
        <div class="cq-side">
          <div class="cq-goal" id="cq-goal"></div>
          <div class="cq-tools"><div class="cq-palette" id="cq-palette" aria-label="ก้อนคำสั่ง"></div></div>
          <div class="cq-program-wrap"><div class="cq-program-title"><b>โปรแกรมของเรา</b><span id="cq-count"></span></div><div class="cq-program" id="cq-program" role="list"></div></div>
          <div class="cq-actions"><button class="primary" id="cq-run">▶ รัน</button><button class="secondary" id="cq-step">ทีละก้าว</button><button class="secondary" id="cq-reset">↺ เริ่มใหม่</button><button class="secondary" id="cq-hint">💡 ใบ้</button></div>
        </div>
      </div>
    </div>`;
    const cv=root.querySelector('#cq-canvas'),scene=new Scene(cv,L);
    scene.reset();
    const $q=s=>root.querySelector(s);
    const setMsg=(t,kind='')=>{const m=$q('#cq-msg');m.className='cq-msg '+kind;m.textContent=t||' '};

    function drawLevelsBar(){
      const el=$q('#cq-levels');
      el.innerHTML=Array.from({length:N},(_,i)=>{
        const st=cq.stars[i]||0,open=i<=cq.stars.length;
        return `<button class="cq-lv ${i===level?'cur':''} ${st?'done':''}" data-lv="${i}" ${open?'':'disabled'} aria-label="ด่านย่อย ${i+1}${st?' ได้ '+st+' ดาว':''}" role="tab"><b>${i+1}</b><span>${st?'⭐'.repeat(st):'☆'}</span></button>`;
      }).join('');
      el.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>load(Number(b.dataset.lv)));
    }
    function drawPalette(){
      const el=$q('#cq-palette');
      el.innerHTML=DIR_KEYS.map(k=>`<button class="cq-pal" data-add="${k}" style="--bc:${BLOCK_COLORS[k]}" aria-label="${DIRS[k].label}"><span class="cq-glyph">${DIRS[k].glyph}</span><small>${DIRS[k].label}</small></button>`).join('')
        +(L.repeat?`<button class="cq-pal" data-add="REP" style="--bc:${BLOCK_COLORS.REP}" aria-label="ทำซ้ำ"><span class="cq-glyph">🔁</span><small>ทำซ้ำ</small></button>`:'');
      el.querySelectorAll('[data-add]').forEach(b=>{
        b.onclick=e=>{if(e.detail===0)addBlock(b.dataset.add)};
        b.onpointerdown=e=>startDrag(e,b.dataset.add,null);
      });
    }
    function drawGoal(){
      const need=L.items.length;
      $q('#cq-goal').innerHTML=`<div class="cq-goal-row"><span>🎯 พาไปถึง <b>ประตู</b></span>${need?`<span>${itemIcon(L.item)} เก็บ${esc(L.itemName)}ให้ครบ <b>${need}</b></span>`:''}${L.storms.length?'<span>⚡ หลีกเลี่ยงพายุ</span>':''}${L.prefill?'<span>🔧 แก้ก้อนที่ผิด 1 ก้อน</span>':''}</div>`;
      $q('#cq-tag').textContent='ด่านย่อย '+(level+1)+' / '+N;
    }
    const itemIcon=k=>k==='star'?'⭐':k==='shield'?'🛡️':'💎';
    function drawProgram(){
      const el=$q('#cq-program');
      el.innerHTML=program.length?program.map((b,i)=>blockHTML(b,[i],focus,running)).join(''):'<div class="cq-empty">แตะหรือลากก้อนคำสั่งมาวางตรงนี้</div>';
      const used=countBlocks(program),over=used>L.limit;
      $q('#cq-count').textContent='ใช้ '+used+' / '+L.limit+' ก้อน';
      $q('#cq-count').className=over?'over':'';
      el.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(running)return;const {list,index}=getAt(program,parsePath(b.dataset.del));list.splice(index,1);if(focus&&!getAt(program,parsePath(focus)).node)focus='';drawProgram()});
      el.querySelectorAll('[data-n]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(running)return;const nd=getAt(program,parsePath(b.dataset.n)).node;nd.n=Math.max(2,Math.min(5,nd.n+Number(b.dataset.d)));drawProgram()});
      el.querySelectorAll('.cq-rep').forEach(r=>r.onclick=e=>{if(e.target.closest('button'))return;if(running)return;e.stopPropagation();focus=focus===r.dataset.p?'':r.dataset.p;drawProgram()});
      el.querySelectorAll('.cq-block').forEach(bl=>{bl.onpointerdown=e=>{if(e.target.closest('button'))return;if(running)return;e.stopPropagation();startDrag(e,null,bl.dataset.p)}});
    }
    function highlight(path){
      root.querySelectorAll('.cq-block.run').forEach(b=>b.classList.remove('run'));
      if(!path)return;
      const el=root.querySelector(`.cq-block[data-p="${path.join('.')}"]`);if(el){el.classList.add('run');el.scrollIntoView&&el.scrollIntoView({block:'nearest'})}
    }
    function containerList(){
      if(focus){const n=getAt(program,parsePath(focus)).node;if(n&&n.t==='R')return n.body}
      return program;
    }
    function addBlock(k,list=null,at=null){
      if(running)return;
      const target=list||containerList();
      if(countBlocks(program)>=L.limit+3){setMsg('ก้อนเต็มแล้ว ลองเอาออกบางก้อนนะ','warn');return}
      if(k==='REP'&&target!==program){setMsg('ใส่ทำซ้ำซ้อนกันไม่ได้นะ วางไว้ด้านนอกแทน','warn');return}
      const blk=k==='REP'?{t:'R',n:3,body:[]}:{t:'M',k};
      if(at==null||at>target.length)target.push(blk);else target.splice(at,0,blk);
      if(k==='REP')focus=String(program.indexOf(blk));
      drawProgram();
    }

    /* ----- ลากวาง ----- */
    function startDrag(e,newKind,fromPath){
      if(running)return;
      const sx=e.clientX,sy=e.clientY;let ghost=null,moved=false;
      const programEl=$q('#cq-program');
      const src=fromPath!=null?getAt(program,parsePath(fromPath)):null;
      const move=ev=>{
        if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<7)return;
        if(!moved){moved=true;ghost=document.createElement('div');ghost.className='cq-ghost';
          const k=newKind||(src.node.t==='M'?src.node.k:'REP');ghost.style.setProperty('--bc',BLOCK_COLORS[k]);ghost.textContent=k==='REP'?'🔁 ทำซ้ำ':DIRS[k].glyph+' '+DIRS[k].label;document.body.append(ghost)}
        ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';
        const over=programEl.getBoundingClientRect();
        programEl.classList.toggle('drop',ev.clientX>over.left&&ev.clientX<over.right&&ev.clientY>over.top&&ev.clientY<over.bottom);
      };
      const up=ev=>{
        document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);
        programEl.classList.remove('drop');
        if(ghost)ghost.remove();
        if(!moved){if(newKind)addBlock(newKind);return}
        const r=programEl.getBoundingClientRect(),inside=ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom;
        // ตำแหน่งแทรก: ดูก้อนระดับบนสุดที่อยู่ใต้เมาส์
        let list=program,at=program.length;
        const bodyHit=document.elementsFromPoint(ev.clientX,ev.clientY).find(el=>el.classList&&el.classList.contains('cq-rep-body'));
        if(bodyHit){const n=getAt(program,parsePath(bodyHit.dataset.body)).node;if(n){list=n.body;at=list.length}}
        else{
          const kids=[...programEl.children].filter(c=>c.classList.contains('cq-block'));
          at=kids.length;
          for(let i=0;i<kids.length;i++){const b=kids[i].getBoundingClientRect();if(ev.clientY<b.top+b.height/2){at=i;break}}
        }
        if(fromPath!=null){
          if(!inside){src.list.splice(src.index,1);drawProgram();return}
          const moving=src.list.splice(src.index,1)[0];
          if(src.list===list&&src.index<at)at--;
          if(moving===getAt(program,[]).node){}
          list.splice(Math.min(at,list.length),0,moving);drawProgram();return;
        }
        if(inside){addBlock(newKind,list,at)}
      };
      document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);
      e.preventDefault();
    }

    /* ----- รัน ----- */
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    async function animateMove(ev,tok,speed){
      const dur=speed;const f={x:ev.fx,y:ev.fy},t={x:ev.tx,y:ev.ty};
      scene.dirRot(ev.k);scene.moving=true;
      const t0=performance.now();
      while(true){
        if(tok!==runToken)return false;
        const k=Math.min(1,(performance.now()-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
        scene.px=f.x+(t.x-f.x)*e;scene.py=f.y+(t.y-f.y)*e;
        if(k>=1)break;await sleep(16);
      }
      scene.moving=false;return true;
    }
    function resetScene(){runToken++;scene.reset();running=false;highlight(null);$q('#cq-run').disabled=false;$q('#cq-step').disabled=false;stepIdx=0;stepState=null}
    let stepState=null;
    async function execute(auto){
      if(running)return;
      if($q('#cq-run').dataset.mode==='next')restoreRun();
      const tok=++runToken;
      if(!stepState){
        scene.reset();
        const sim=simulate(L,program);
        stepState={sim,i:0};
        if(!program.length){setMsg('ยังไม่มีก้อนคำสั่ง ลากมาวางก่อนนะ','warn');stepState=null;return}
      }
      running=true;$q('#cq-run').disabled=true;$q('#cq-step').disabled=true;
      const {sim}=stepState;
      const speed=420;
      for(;stepState.i<sim.events.length;stepState.i++){
        if(tok!==runToken){running=false;return}
        const ev=sim.events[stepState.i];
        if(ev.path)highlight(ev.path);
        if(ev.type==='move'){const ok=await animateMove(ev,tok,speed);if(!ok){running=false;return}}
        else if(ev.type==='grab'){scene.gotSet.add(ev.i);scene.burst(scene.cx(ev.x),scene.cy(ev.y),'#ffe27a',16)}
        else if(ev.type==='bump'){
          scene.dirRot(ev.k);
          const tx=ev.tx!=null?ev.tx:ev.x+DIRS[ev.k].dx,ty=ev.ty!=null?ev.ty:ev.y+DIRS[ev.k].dy;
          const sx=scene.px,sy=scene.py;
          for(let s=0;s<=6;s++){scene.px=sx+(tx-sx)*.35*Math.sin(s/6*Math.PI);scene.py=sy+(ty-sy)*.35*Math.sin(s/6*Math.PI);await sleep(30)}
          scene.px=sx;scene.py=sy;scene.shake=1;scene.flash=1;scene.burst(scene.cx(tx),scene.cy(ty),ev.why==='storm'?'#c7a8ff':'#c9b8a4',12);
        }
        if(!auto){stepState.i++;running=false;$q('#cq-run').disabled=false;$q('#cq-step').disabled=false;
          if(stepState.i>=sim.events.length)finish(sim);return}
        await sleep(90);
      }
      running=false;
      finish(sim);
    }
    function finish(sim){
      stepState=null;running=false;$q('#cq-run').disabled=false;$q('#cq-step').disabled=false;highlight(null);
      if(sim.ok){levelDone()}
      else{
        fails++;cq.tries[level]=fails;persist();
        const msg={rock:'ชนหิน! ลองแก้ลูกศร แล้วกดรันอีกครั้ง',storm:'โดนพายุ! เลือกทางอ้อมที่ปลอดภัยนะ',edge:'ออกนอกแท่นแล้ว ลองนับช่องอีกที',short:'ยังไม่ถึงประตู ลองเพิ่มก้อนคำสั่ง',items:'ยังเก็บ'+L.itemName+'ไม่ครบ ลองเดินผ่านให้ครบนะ'}[sim.why]||'ลองใหม่อีกครั้ง';
        scene.fail=1;if(sim.why==='short'||sim.why==='items'){scene.flash=.5}
        setMsg(msg+(fails>=3?' · แตะ 💡 ใบ้ได้':''),'bad');
        if(fails>=3)$q('#cq-hint').classList.add('pulse');
      }
    }
    function levelDone(){
      const used=countBlocks(program);
      const stars=!L.repeat?(used<=L.par?3:used<=L.par+2?2:1):(used<=L.par?3:used<=L.par+2?2:1);
      const old=cq.stars[level]||0;
      cq.stars[level]=Math.max(old,stars);
      scene.win=1;scene.burst(scene.cx(L.goal.x),scene.cy(L.goal.y),'#7cf0ff',30);scene.burst(scene.cx(L.goal.x),scene.cy(L.goal.y),'#ffd23f',30);
      if(typeof playRewardSound==='function')playRewardSound();
      persist();
      const last=level>=N-1;
      setMsg('ผ่านแล้ว! '+('⭐'.repeat(stars))+(stars===3?' เก่งมาก ใช้ก้อนน้อยที่สุด':' ลองใช้ให้น้อยลงเพื่อได้ 3 ดาว'),'ok');
      drawLevelsBar();
      const runBtn=$q('#cq-run');
      runBtn.disabled=false;runBtn.textContent=last?'จบภารกิจ ⭐':'ด่านต่อไป →';runBtn.classList.add('cq-next');runBtn.dataset.mode='next';
      runBtn.onclick=()=>{
        if(last&&cq.stars.filter(v=>v>0).length>=N){
          const avg=cq.stars.reduce((a,b)=>a+b,0)/(N*3);
          u6Complete(Math.round(6+4*avg),{levels:cq.stars.slice(),tries:{...cq.tries}});
        }else if(last){setMsg('ยังมีด่านย่อยที่ยังไม่ผ่าน เลือกจากแถบด้านบนได้เลย','warn')}
        else load(level+1);
      };
      // ผ่านครบทั้งหมดอาจไม่ได้อยู่ด่านสุดท้าย
      if(!last&&cq.stars.filter(v=>v>0).length>=N){/* ปล่อยให้กดต่อ */}
    }
    function restoreRun(){const b=$q('#cq-run');b.textContent='▶ รัน';b.classList.remove('cq-next');delete b.dataset.mode;b.onclick=()=>execute(true)}
    function load(i){
      runToken++;level=Math.max(0,Math.min(N-1,i));cq.level=level;fails=cq.tries[level]||0;persist();
      L=buildLevel(unit,topic,level);scene.L=L;scene.layout();scene.reset();
      program=L.prefill?JSON.parse(JSON.stringify(L.prefill)):[];focus='';running=false;stepState=null;
      restoreRun();
      drawLevelsBar();drawPalette();drawGoal();drawProgram();
      $q('#cq-run').disabled=false;$q('#cq-step').disabled=false;$q('#cq-hint').classList.remove('pulse');
      setMsg(L.prefill?'โปรแกรมนี้มีก้อนที่ผิด 1 ก้อน ลองรันแล้วแก้ให้ถึงประตู':(level===0?'ลากหรือแตะก้อนลูกศรเพื่อสร้างโปรแกรม แล้วกด ▶ รัน':'พร้อมแล้ว ลองสร้างโปรแกรมของด่านนี้'));
    }
    $q('#cq-run').onclick=()=>execute(true);
    $q('#cq-step').onclick=()=>execute(false);
    $q('#cq-reset').onclick=()=>{restoreRun();resetScene();program=L.prefill?JSON.parse(JSON.stringify(L.prefill)):[];focus='';drawProgram();setMsg('เริ่มใหม่แล้ว')};
    $q('#cq-hint').onclick=()=>{
      // ใบ้: บอกก้อนถัดไปจากเฉลย (นับจากก้อนที่ตรงต่อเนื่อง)
      const flat=flatten(program).map(s=>s.k),sol=L.solution;let m=0;while(m<flat.length&&flat[m]===sol[m])m++;
      const nextK=sol[m];
      if(!nextK){setMsg('ลองกด ▶ รันดูนะ ถูกทางแล้ว','ok');return}
      setMsg('ใบ้: ก้อนถัดไปคือ '+DIRS[nextK].glyph+' '+DIRS[nextK].label+(m>0?' (ก้อนที่ '+(m+1)+')':''),'hint');
      const b=root.querySelector(`[data-add="${nextK}"]`);if(b){b.classList.add('blink');setTimeout(()=>b.classList.remove('blink'),2500)}
    };

    // วงวาดภาพ: หยุดอัตโนมัติเมื่อหน้าถูกเปลี่ยน
    let last=performance.now();
    (function loop(now){
      if(!cv.isConnected)return;
      const dt=Math.min(.05,(now-last)/1000);last=now;
      scene.draw(dt);
      requestAnimationFrame(loop);
    })(last);

    drawLevelsBar();drawPalette();drawGoal();drawProgram();
    // เริ่มจากด่านที่ยังไม่ผ่านอันแรก
    if(cq.stars.length&&cq.level===undefined)cq.level=nextOpen();
    if(level!==Math.min(cq.level||0,N-1))load(cq.level||0);
    setMsg(L.prefill?'โปรแกรมนี้มีก้อนที่ผิด 1 ก้อน ลองรันแล้วแก้ให้ถึงประตู':'ลากหรือแตะก้อนลูกศรเพื่อสร้างโปรแกรม แล้วกด ▶ รัน');
  }

  /* ---------------- เชื่อมเข้ากับระบบด่านเดิม ---------------- */
  const baseRenderGame=u6RenderGame;
  u6RenderGame=function(){
    const topic=u6TopicIndex(u6Unit,u6Stage),g=U6_GAMES[u6Unit][topic],d=u6Draft();
    if(d.done||!g||(g.mode!=='grid'&&g.mode!=='command')||!packFor(u6Unit,topic))return baseRenderGame.apply(this,arguments);
    const root=$('#u6-page');
    root.innerHTML='';
    render(root,u6Unit,topic,g,d);
    const key=u6Unit+':'+u6Stage;
    if(window.__cqLast!==key){window.__cqLast=key;try{const r=root.getBoundingClientRect();window.scrollTo({top:Math.max(0,window.scrollY+r.top-72),behavior:'auto'})}catch(e){}}
    root.insertAdjacentHTML('beforeend','<div class="u6-actions"><button class="quiet" id="u6-game-read">อ่านเนื้อหาอีกครั้ง</button></div>');
    $('#u6-game-read').onclick=()=>u6Phase('content');
  };
  window.CQ={buildLevel,simulate,solve,PACKS,LEVELS_PER_STAGE};
})();
