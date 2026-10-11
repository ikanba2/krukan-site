/* Techno ป.2 · Quest: เกมเดินตามช่องแบบ code.org (ลากบัตรคำสั่ง · กดรัน · ยานเดินจริงบนเกาะลอยกลางทะเล)
   บัตร: เดินหน้า / เลี้ยวซ้าย / เลี้ยวขวา / ทำซ้ำ · โหมด: build · debug · predict · two · branch
   ทุกด่านสร้างด้วยตัวสร้างแผนที่ (seed คงที่) + ตัวแก้เฉลยด้วยการค้นหา จึงแก้ได้จริงเสมอ */
const QUEST=(function(){
  const DIR=[{dx:0,dy:-1},{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0}];            // 0 ขึ้น 1 ขวา 2 ลง 3 ซ้าย
  const CARD={F:{g:'⬆',n:'เดินหน้า',c:'#2fd4e6'},L:{g:'↰',n:'เลี้ยวซ้าย',c:'#ffd34f'},R:{g:'↱',n:'เลี้ยวขวา',c:'#ff9a7a'},REP:{g:'🔁',n:'ทำซ้ำ',c:'#a98bff'},IF:{g:'🚪',n:'ถ้าประตูเปิด',c:'#4ef4d2'}};
  const rng=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
  const K=(x,y)=>x+','+y;

  /* ---------- ชุดด่าน: ตามหัวข้อ ---------- */
  const PACK={
    u2t1:{title:'พาหุ่นไปแท่นชาร์จ',mode:'build',cards:['F'],n:5,size:[4,4,5,5,6],len:[2,3,3,4,5],obst:[0,0,0,1,1],items:[0,0,1,1,2],turn:0},
    u2t2:{title:'ทายก่อนว่าหุ่นจะหยุดตรงไหน',mode:'predict',cards:['F','L','R'],n:6,size:[4,4,5,5,5,6],len:[3,4,4,5,6,7],obst:[0,1,1,2,2,3],items:[0,0,0,0,0,0],turn:1},
    u2t3:{title:'เก็บแบตเตอรี แล้วกลับฐาน',mode:'build',cards:['F','L','R'],n:6,size:[4,4,5,5,6,6],len:[5,6,7,8,9,10],obst:[1,2,3,4,5,6],items:[1,1,2,2,2,3],turn:1,rep:[99,99,99,3,2,1]},
    u2t4:{title:'ซ่อมโปรแกรม: ขาดหรือเกิน',mode:'debug',bug:'del',cards:['F','L','R'],n:6,size:[4,4,5,5,5,6],len:[4,5,6,7,8,9],obst:[1,2,2,3,4,5],items:[0,0,1,1,1,2],turn:1},
    u2t5:{title:'ซ่อมโปรแกรม: บัตรสลับที่',mode:'debug',bug:'swap',cards:['F','L','R'],n:6,size:[4,4,5,5,6,6],len:[5,6,7,8,9,10],obst:[1,2,3,3,4,5],items:[0,1,1,1,2,2],turn:2},
    u2t6:{title:'โปรแกรมเดียว ผ่านสองสนาม',mode:'two',cards:['F','L','R'],n:5,size:[4,5,5,5,6],len:[4,5,6,7,8],obst:[1,2,2,3,3],items:[0,0,1,1,2],turn:1},
    u2g1:{title:'วงจรจับจุดผิด',mode:'debug',bug:'any',cards:['F','L','R'],n:6,size:[5,5,5,6,6,6],len:[6,7,8,9,10,11],obst:[2,3,4,4,5,6],items:[1,1,1,2,2,3],turn:2,lives:3},
    u2g2:{title:'คำสั่งสองสนาม',mode:'two',cards:['F','L','R'],n:6,size:[5,5,5,6,6,6],len:[6,7,8,9,10,11],obst:[2,3,3,4,5,6],items:[1,1,1,2,2,3],turn:2},
    u7t2:{title:'ข้ามประตู: เปิด หรือ ปิด',mode:'branch',cards:['F','L','R'],n:5,size:[4,4,5,5,5],len:[3,4,4,5,5],obst:[0,1,1,2,2],items:[0,0,0,1,1],turn:1},
    u7t4:{title:'เลือกทางแล้วเก็บพลัง',mode:'branch',cards:['F','L','R'],n:5,size:[5,5,5,6,6],len:[5,5,6,6,7],obst:[1,2,2,3,3],items:[1,1,2,2,3],turn:1},
    u7g1:{title:'สะพานสลับสี',mode:'branch',cards:['F','L','R'],n:6,size:[5,5,5,6,6,6],len:[5,6,6,7,7,8],obst:[1,2,2,3,3,4],items:[1,1,1,2,2,2],turn:2}
  };

  /* ---------- ตัวสร้างด่าน ---------- */
  function simulate(L,flat,gateOpen){
    const block=new Set([...(L.rocks||[]),...(L.storms||[])].map(p=>K(p.x,p.y)));
    if(L.gate&&gateOpen===false)block.add(K(L.gate.x,L.gate.y));
    let x=L.start.x,y=L.start.y,d=L.start.d;const got=new Set(),ev=[];
    const grab=()=>(L.items||[]).forEach((p,i)=>{if(p.x===x&&p.y===y&&!got.has(i)){got.add(i);ev.push({t:'grab',i,x,y})}});
    grab();
    for(let s=0;s<flat.length;s++){
      const c=flat[s];
      if(c.k==='L'){d=(d+3)%4;ev.push({t:'turn',d,path:c.path,x,y})}
      else if(c.k==='R'){d=(d+1)%4;ev.push({t:'turn',d,path:c.path,x,y})}
      else{
        const nx=x+DIR[d].dx,ny=y+DIR[d].dy;
        if(nx<0||ny<0||nx>=L.w||ny>=L.h){ev.push({t:'bump',d,x,y,tx:nx,ty:ny,why:'edge',path:c.path});return {ok:false,why:'edge',ev,x,y,d,got}}
        if(block.has(K(nx,ny))){const w=L.storms&&L.storms.some(p=>p.x===nx&&p.y===ny)?'storm':(L.gate&&L.gate.x===nx&&L.gate.y===ny?'gate':'rock');ev.push({t:'bump',d,x,y,tx:nx,ty:ny,why:w,path:c.path});return {ok:false,why:w,ev,x,y,d,got}}
        ev.push({t:'move',d,fx:x,fy:y,tx:nx,ty:ny,path:c.path});x=nx;y=ny;grab();
      }
    }
    const atGoal=!!L.goal&&x===L.goal.x&&y===L.goal.y,all=got.size===(L.items||[]).length;
    return {ok:atGoal&&all,why:atGoal&&all?'ok':!atGoal?'short':'items',ev,x,y,d,got};
  }
  const flatten=(prog,out=[],path=[],env={})=>{
    prog.forEach((b,i)=>{
      if(b.t==='M')out.push({k:b.k,path:[...path,i]});
      else if(b.t==='R'){for(let n=0;n<b.n;n++)flatten(b.body,out,[...path,i,'b'],env)}
      else if(b.t==='IF'){flatten(env.open===false?b.b:b.a,out,[...path,i,env.open===false?'b':'a'],env)}
    });return out;
  };
  // ค้นหาโปรแกรมสั้นสุด (นับก้อน) · BFS บนสถานะ (x,y,ทิศ,ของที่เก็บ)
  function solve(L,gateOpen){
    const N=(L.items||[]).length,full=(1<<N)-1,block=new Set([...(L.rocks||[]),...(L.storms||[])].map(p=>K(p.x,p.y)));
    if(L.gate&&gateOpen===false)block.add(K(L.gate.x,L.gate.y));
    const itemAt={};(L.items||[]).forEach((p,i)=>itemAt[K(p.x,p.y)]=i);
    const mk=(x,y,m)=>{const i=itemAt[K(x,y)];return i!=null?m|1<<i:m};
    const s0={x:L.start.x,y:L.start.y,d:L.start.d,m:mk(L.start.x,L.start.y,0),p:[]},seen=new Set([s0.x+','+s0.y+','+s0.d+','+s0.m]);
    let q=[s0];
    for(let depth=0;depth<40&&q.length;depth++){
      const nq=[];
      for(const s of q){
        if(s.x===L.goal.x&&s.y===L.goal.y&&s.m===full)return s.p;
        const opts=[['L',{x:s.x,y:s.y,d:(s.d+3)%4,m:s.m}],['R',{x:s.x,y:s.y,d:(s.d+1)%4,m:s.m}]];
        const nx=s.x+DIR[s.d].dx,ny=s.y+DIR[s.d].dy;
        if(nx>=0&&ny>=0&&nx<L.w&&ny<L.h&&!block.has(K(nx,ny)))opts.unshift(['F',{x:nx,y:ny,d:s.d,m:mk(nx,ny,s.m)}]);
        for(const [k,n] of opts){const id=n.x+','+n.y+','+n.d+','+n.m;if(seen.has(id))continue;seen.add(id);nq.push({...n,p:[...s.p,k]})}
      }
      q=nq;
    }
    return null;
  }
  const runs=p=>{const o=[];let i=0;while(i<p.length){let j=i;while(j<p.length&&p[j]===p[i])j++;o.push({k:p[i],n:j-i});i=j}return o};
  const repCost=p=>runs(p).reduce((s,r)=>s+(r.k==='F'&&r.n>=3?2:r.n),0);

  function build(packName,index,mapSet){
    const P=PACK[packName];
    for(let attempt=0;attempt<80;attempt++){
      const r=rng(packName.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7)*131+index*7919+attempt*104729+(mapSet||0)*977);
      const w=P.size[index],h=w,target=Math.min(w*h-3,P.len[index]);
      // เส้นทางหลักแบบไม่ซ้ำช่อง (บังคับให้มีเลี้ยวตามระดับ)
      const sx=Math.floor(r()*w),sy=Math.floor(r()*h);
      let cells=[{x:sx,y:sy}],d=Math.floor(r()*4),vis=new Set([K(sx,sy)]),turns=0,ok=true;
      const heads=[d];
      while(cells.length-1<target){
        const cur=cells[cells.length-1],cand=[];
        for(let k=0;k<4;k++){if(P.turn===0&&k!==d)continue;const nx=cur.x+DIR[k].dx,ny=cur.y+DIR[k].dy;if(nx<0||ny<0||nx>=w||ny>=h||vis.has(K(nx,ny)))continue;cand.push(k)}
        if(!cand.length){ok=false;break}
        const prefer=cand.includes(d)&&r()<(P.turn>=2?.45:.7)?d:cand[Math.floor(r()*cand.length)];
        if(prefer!==d){if(Math.abs(prefer-d)===2){const alt=cand.filter(k=>Math.abs(k-d)!==2);if(alt.length)d=alt[Math.floor(r()*alt.length)];else{ok=false;break}}else d=prefer;turns++}
        const nx=cur.x+DIR[d].dx,ny=cur.y+DIR[d].dy;
        if(vis.has(K(nx,ny))||nx<0||ny<0||nx>=w||ny>=h){ok=false;break}
        cells.push({x:nx,y:ny});vis.add(K(nx,ny));heads.push(d);
      }
      if(!ok||cells.length<3)continue;
      if(P.turn>0&&turns<Math.min(P.turn,1+Math.floor(index/2)))continue;
      const start=cells[0],goal=cells[cells.length-1];
      const initD=heads[1]!=null?heads[1]:1;
      const rotate=P.turn>0&&r()<.5?(initD+(r()<.5?1:3))%4:initD;
      const mid=cells.slice(1,-1).sort(()=>r()-.5),items=mid.slice(0,Math.min(P.items[index],mid.length)).map(c=>({x:c.x,y:c.y}));
      const free=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!vis.has(K(x,y)))free.push({x,y});
      free.sort(()=>r()-.5);
      const near=p=>cells.reduce((m,c)=>Math.min(m,Math.abs(c.x-p.x)+Math.abs(c.y-p.y)),99);
      free.sort((a,b)=>near(a)-near(b)+(r()-.5)*1.6);
      const L={w,h,start:{x:start.x,y:start.y,d:P.turn>0?rotate:initD},goal:{x:goal.x,y:goal.y},items,rocks:free.slice(0,Math.min(P.obst[index],free.length)).map(p=>({...p})),storms:[]};
      if(P.mode==='branch'){
        // ประตูอยู่บนเส้นทางหลัก (ไม่ใช่จุดเริ่ม/จุดหมาย/ของ)
        const gc=cells.slice(2,-1).filter(c=>!items.some(i=>i.x===c.x&&i.y===c.y));
        if(!gc.length)continue;
        L.gate={...gc[Math.floor(r()*gc.length)]};
      }
      const solOpen=solve(L,true);if(!solOpen)continue;
      let solClosed=null;
      if(P.mode==='branch'){solClosed=solve(L,false);if(!solClosed||solClosed.join('')===solOpen.join(''))continue}
      L.solution=solOpen;L.solClosed=solClosed;
      const useRep=P.rep?index>=P.rep.findIndex(v=>v<=index+0)&&P.rep[index]<=index:false;
      L.repeat=P.cards.includes('F')&&P.rep!=null&&index>=3;
      L.par=L.repeat?repCost(solOpen):solOpen.length+(solClosed?solClosed.length:0);
      L.limit=Math.min(20,Math.max(solOpen.length,(solClosed||[]).length)+4+(L.repeat?0:2));
      if(P.mode==='two'){
        // สนามที่สอง: อุปสรรคอื่น (ไม่ทับเส้นทางที่แก้ได้) แต่ต้องมีทางเดียวกันที่ผ่านได้ทั้งสอง
        const used=new Set(L.rocks.map(p=>K(p.x,p.y)));
        const free2=free.filter(p=>!used.has(K(p.x,p.y)));
        const L2={...L,rocks:free2.slice(0,Math.min(P.obst[index],free2.length)).map(p=>({...p}))};
        if(!L2.rocks.length)L2.rocks=L.rocks.slice().reverse().slice(0,1);
        const U={...L,rocks:[...L.rocks,...L2.rocks.filter(p=>!L.rocks.some(q=>q.x===p.x&&q.y===p.y))]};
        const sol2=solve(U,true);if(!sol2)continue;
        L.solution=sol2;L.par=sol2.length;L.limit=Math.min(20,sol2.length+5);
        L.second=L2;
      }
      if(P.mode==='debug'){
        const sol=solOpen,kind=P.bug==='any'?(index%2?'swap':'del'):P.bug;
        let bad=null;
        for(let t=0;t<30&&!bad;t++){
          let b=sol.slice();
          if(kind==='del'&&b.length>3){const pos=Math.floor(r()*b.length);b.splice(pos,1);L.bugKind='del';L.bugPos=pos}
          else if(kind==='swap'&&b.length>3){const pos=Math.floor(r()*(b.length-1));if(b[pos]===b[pos+1])continue;[b[pos],b[pos+1]]=[b[pos+1],b[pos]];L.bugKind='swap';L.bugPos=pos}
          else continue;
          if(!simulate(L,b.map((k,i)=>({k,path:[i]})),true).ok)bad=b;
        }
        if(!bad)continue;
        L.prefill=bad.map(k=>({t:'M',k}));
      }
      if(P.mode==='predict'){
        const prog=solOpen;L.prefill=prog.map(k=>({t:'M',k}));
        // ตัวเลือกคำตอบ: จุดหยุดจริง และช่องใกล้เคียง
        const end=simulate(L,prog.map((k,i)=>({k,path:[i]})),true);
        const e={x:end.x,y:end.y},opt=[e];
        const ring=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!(x===e.x&&y===e.y)&&Math.abs(x-e.x)+Math.abs(y-e.y)<=2)ring.push({x,y});
        ring.sort(()=>r()-.5);while(opt.length<3&&ring.length)opt.push(ring.pop());
        L.options=opt.sort(()=>r()-.5);L.answer=e;L.goal=null;
        if(!L.options.length||L.options.length<2)continue;
      }
      L.mode=P.mode;L.index=index;L.packName=packName;return L;
    }
    // สำรองที่แก้ได้แน่นอน
    const L={w:4,h:4,start:{x:0,y:3,d:1},goal:{x:3,y:3},items:[],rocks:[{x:1,y:1}],storms:[],solution:['F','F','F'],par:3,limit:6,mode:P.mode,index,packName};
    if(P.mode==='predict'){L.prefill=[{t:'M',k:'F'},{t:'M',k:'F'}];L.options=[{x:2,y:3},{x:1,y:3},{x:3,y:3}];L.answer={x:2,y:3};L.goal=null}
    if(P.mode==='branch'){L.gate={x:1,y:3};L.solClosed=['L','F','R','F','F','R','F','L'].slice(0,0);L.solClosed=['L','F','R','F','F','R','F']}
    return L;
  }
  const countBlocks=prog=>prog.reduce((n,b)=>n+1+(b.t==='R'?countBlocks(b.body):b.t==='IF'?countBlocks(b.a)+countBlocks(b.b):0),0);
  const flatPlain=(prog,env)=>flatten(prog,[],[],env||{});

  /* ---------- ภาพ: ทะเล เกาะลอย ยานของ Techno ---------- */
  const S={};
  const spr=key=>S[key]||(S[key]=Object.assign(new Image(),{src:ASSETS[key]||''}));
  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
  class Scene{
    constructor(cv,L){this.cv=cv;this.ctx=cv.getContext('2d');this.L=L;this.t=0;this.bub=Array.from({length:22},(_,i)=>({x:(i*83%600),y:(i*131%600),r:3+i%5,s:12+i%9*4,p:i}));this.reset();this.layout()}
    layout(){const S=600,L=this.L,c=Math.floor((S-80)/Math.max(L.w,L.h));this.c=c;this.ox=Math.round((S-c*L.w)/2);this.oy=Math.round((S-c*L.h)/2)}
    reset(){const s=this.L.start;this.px=s.x;this.py=s.y;this.d=s.d;this.got=new Set();this.sp=[];this.shake=0;this.flash=0;this.win=0;this.moving=false;this.face=s.d===3?-1:1}
    cx(x){return this.ox+x*this.c+this.c/2}cy(y){return this.oy+y*this.c+this.c/2}
    burst(x,y,col,n=14){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=40+Math.random()*120;this.sp.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.6+Math.random()*.4,c:col})}}
    draw(dt){
      const ctx=this.ctx,L=this.L,c=this.c;this.t+=dt;ctx.save();
      if(this.shake>0){ctx.translate((Math.random()-.5)*this.shake*10,(Math.random()-.5)*this.shake*10);this.shake=Math.max(0,this.shake-dt*3)}
      const g=ctx.createLinearGradient(0,0,0,600);g.addColorStop(0,'#1a8fb8');g.addColorStop(.55,'#0a5a8a');g.addColorStop(1,'#04284a');ctx.fillStyle=g;ctx.fillRect(-20,-20,640,640);
      // แสงใต้น้ำ + คลื่น
      const ray=ctx.createRadialGradient(300,-40,10,300,-40,520);ray.addColorStop(0,'rgba(190,255,255,.45)');ray.addColorStop(1,'rgba(190,255,255,0)');ctx.fillStyle=ray;ctx.fillRect(0,0,600,600);
      ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=2;for(let k=0;k<6;k++){ctx.beginPath();for(let x=0;x<=600;x+=12){const y=60+k*100+Math.sin(x/38+this.t*1.4+k)*7;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
      this.bub.forEach(b=>{const y=((b.y-this.t*b.s)%640+640)%640;ctx.globalAlpha=.5;ctx.strokeStyle='#bff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x+Math.sin(this.t+b.p)*6,y,b.r,0,6.283);ctx.stroke();ctx.globalAlpha=1});
      // แท่นเกาะ
      const bx=this.ox-14,by=this.oy-14,bw=c*L.w+28,bh=c*L.h+28;
      ctx.fillStyle='rgba(0,20,50,.5)';rr(ctx,bx+6,by+14,bw,bh,24);ctx.fill();
      const bg=ctx.createLinearGradient(0,by,0,by+bh);bg.addColorStop(0,'#e9fbff');bg.addColorStop(1,'#7fc7dc');ctx.fillStyle=bg;rr(ctx,bx,by,bw,bh,24);ctx.fill();
      ctx.fillStyle='#0b4a73';rr(ctx,bx+8,by+8,bw-16,bh-16,18);ctx.fill();
      for(let y=0;y<L.h;y++)for(let x=0;x<L.w;x++){
        const px=this.ox+x*c,py=this.oy+y*c,m=3,alt=(x+y)%2===0;
        const pg=ctx.createLinearGradient(px,py,px,py+c);pg.addColorStop(0,alt?'#9fe9f1':'#7fdbe8');pg.addColorStop(1,alt?'#4fb8cf':'#3a9fbb');
        ctx.fillStyle=pg;rr(ctx,px+m,py+m,c-m*2,c-m*2,Math.max(6,c*.1));ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(px+m+8,py+m+2);ctx.lineTo(px+c-m-8,py+m+2);ctx.stroke();
      }
      // จุดเริ่ม
      {const sx=this.cx(L.start.x),sy=this.cy(L.start.y);ctx.strokeStyle='rgba(255,236,120,.95)';ctx.lineWidth=4;ctx.setLineDash([8,6]);ctx.lineDashOffset=-this.t*18;rr(ctx,sx-c/2+7,sy-c/2+7,c-14,c-14,12);ctx.stroke();ctx.setLineDash([]);}
      if(L.goal)this.portal(this.cx(L.goal.x),this.cy(L.goal.y),c*.36);
      (L.rocks||[]).forEach(p=>this.rock(this.cx(p.x),this.cy(p.y),c*.34,p.x*7+p.y*3));
      (L.storms||[]).forEach(p=>this.whirl(this.cx(p.x),this.cy(p.y),c*.4));
      if(L.gate)this.gateDraw(this.cx(L.gate.x),this.cy(L.gate.y),c*.4,this.gateOpen!==false);
      (L.items||[]).forEach((p,i)=>{if(!this.got.has(i))this.pearl(this.cx(p.x),this.cy(p.y)+Math.sin(this.t*2.4+i)*3,c*.24)});
      // ตัวเลือกคำตอบ (ทายจุดหยุด)
      if(L.options)L.options.forEach((p,i)=>{const x=this.cx(p.x),y=this.cy(p.y),sel=this.pick&&this.pick.x===p.x&&this.pick.y===p.y;
        ctx.fillStyle=sel?'#ffd34f':'rgba(255,255,255,.88)';ctx.beginPath();ctx.arc(x,y,c*.28,0,6.283);ctx.fill();ctx.strokeStyle='#0a4d7a';ctx.lineWidth=3;ctx.stroke();
        ctx.fillStyle='#0a4d7a';ctx.font='800 '+Math.round(c*.3)+'px Kanit,Tahoma,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(['ก','ข','ค'][i],x,y+1)});
      this.ship();
      this.sp=this.sp.filter(s=>{s.l-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=140*dt;ctx.globalAlpha=Math.max(0,s.l*1.6);ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x,s.y,3.2,0,6.283);ctx.fill();ctx.globalAlpha=1;return s.l>0});
      if(this.flash>0){ctx.fillStyle='rgba(255,70,110,'+(this.flash*.35)+')';ctx.fillRect(-20,-20,640,640);this.flash=Math.max(0,this.flash-dt*2.2)}
      ctx.restore();
    }
    portal(x,y,r){const ctx=this.ctx,t=this.t,pu=this.win?1+Math.sin(t*14)*.08:1;
      const gl=ctx.createRadialGradient(x,y,2,x,y,r*1.9);gl.addColorStop(0,'rgba(255,240,150,.85)');gl.addColorStop(.5,'rgba(120,255,230,.4)');gl.addColorStop(1,'rgba(120,255,230,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x,y,r*1.9*pu,0,6.283);ctx.fill();
      const hole=ctx.createRadialGradient(x,y,1,x,y,r);hole.addColorStop(0,'#fffbd0');hole.addColorStop(.4,'#17b8c9');hole.addColorStop(1,'#03324d');ctx.fillStyle=hole;ctx.beginPath();ctx.arc(x,y,r*pu,0,6.283);ctx.fill();
      for(let i=0;i<3;i++){ctx.strokeStyle=['#fff','#4ef4d2','#ffd34f'][i];ctx.lineWidth=3.5-i*.6;ctx.beginPath();ctx.arc(x,y,r*(.95-i*.2)*pu,t*(1.6+i*.5)+i*2,t*(1.6+i*.5)+i*2+3.2);ctx.stroke()}
      ctx.fillStyle='#fff';ctx.font='700 '+Math.round(r*.46)+'px Kanit,Tahoma,sans-serif';ctx.textAlign='center';ctx.fillText('แท่นชาร์จ',x,y+r+14)}
    rock(x,y,r,seed){const ctx=this.ctx;ctx.fillStyle='rgba(0,20,50,.35)';ctx.beginPath();ctx.ellipse(x+4,y+r*.75,r*.95,r*.35,0,0,6.283);ctx.fill();
      const pts=[];for(let i=0;i<9;i++){const a=i/9*6.283,k=.78+((seed*(i+3))%7)/22;pts.push([x+Math.cos(a)*r*k,y+Math.sin(a)*r*k*.9-r*.1])}
      const g=ctx.createLinearGradient(x-r,y-r,x+r,y+r);g.addColorStop(0,'#ff9b8a');g.addColorStop(.5,'#d9585a');g.addColorStop(1,'#7a2f4a');ctx.fillStyle=g;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(60,10,30,.5)';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(x-r*.3,y-r*.45,r*.28,r*.12,-.5,0,6.283);ctx.fill()}
    whirl(x,y,r){const ctx=this.ctx,t=this.t;for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(${120+i*30},${220},255,${.9-i*.2})`;ctx.lineWidth=5-i;ctx.beginPath();ctx.arc(x,y,r*(1-i*.2),t*3+i*1.4,t*3+i*1.4+4);ctx.stroke()}}
    gateDraw(x,y,r,open){const ctx=this.ctx;ctx.fillStyle=open?'rgba(78,244,210,.35)':'#6a2f3a';ctx.strokeStyle=open?'#4ef4d2':'#ffb3a0';ctx.lineWidth=4;rr(ctx,x-r*.8,y-r*.9,r*1.6,r*1.8,10);ctx.fill();ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='700 '+Math.round(r*.9)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(open?'🚪':'🧱',x,y);ctx.textBaseline='alphabetic'}
    pearl(x,y,r){const ctx=this.ctx,g=ctx.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r*1.6);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*1.9,0,6.283);ctx.fill();
      ctx.fillStyle='#ffd34f';ctx.strokeStyle='#c58a00';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.5:r*1.15;ctx.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k)}ctx.closePath();ctx.fill();ctx.stroke()}
    ship(){const ctx=this.ctx,c=this.c,x=this.cx(this.px),y=this.cy(this.py),img=spr('P2-TS-04-boost'),s=c*1.05;
      ctx.save();ctx.fillStyle='rgba(0,20,50,.35)';ctx.beginPath();ctx.ellipse(x+3,y+c*.34,s*.3,s*.09,0,0,6.283);ctx.fill();
      const face=this.face||1,tilt=(this.d===0?-26:this.d===2?26:0)*face;
      ctx.translate(x,y+Math.sin(this.t*3)*2);ctx.scale(face,1);ctx.rotate(tilt*Math.PI/180);
      if(img.complete&&img.naturalWidth){const w=s*1.15,h=w*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,-w/2,-h/2,w,h)}
      else{ctx.fillStyle='#ff5fa2';ctx.beginPath();ctx.moveTo(s*.4,0);ctx.lineTo(-s*.3,-s*.25);ctx.lineTo(-s*.3,s*.25);ctx.closePath();ctx.fill()}
      ctx.restore()}
  }

  /* ---------- ส่วนติดต่อผู้ใช้ ---------- */
  function blockHTML(b,path){
    const p=path.join('.');
    if(b.t==='M')return `<div class="cq-block" data-p="${p}" style="--bc:${CARD[b.k].c}"><span class="cq-glyph">${CARD[b.k].g}</span><span>${CARD[b.k].n}</span><button class="cq-x" data-del="${p}" aria-label="เอาออก">✕</button></div>`;
    return `<div class="cq-block cq-rep" data-p="${p}" style="--bc:${CARD.REP.c}"><div class="cq-rep-head"><span>🔁 ทำซ้ำ</span><span class="cq-count"><button data-n="${p}" data-d="-1">−</button><b>${b.n}</b><button data-n="${p}" data-d="1">+</button></span><span>ครั้ง</span><button class="cq-x" data-del="${p}">✕</button></div>
      <div class="cq-rep-body" data-body="${p}">${b.body.length?b.body.map((c,i)=>blockHTML(c,[...path,'b',i])).join(''):'<em>ลากบัตรมาใส่ตรงนี้</em>'}</div></div>`;
  }
  const getAt=(prog,path)=>{let list=prog,node=null;for(let i=0;i<path.length;i++){if(path[i]==='b'){list=node.body;continue}node=list[path[i]];if(i===path.length-1)return {list,index:path[i],node}}return {list,index:-1,node}};
  const parsePath=s=>String(s).split('.').map(v=>v==='b'?'b':Number(v));

  function mount(root,packName,ctx,opts={}){
    const P=PACK[packName],N=P.n;
    let level=0,L=build(packName,0),program=[],progB=[],row='a',running=false,token=0,fails=0,hearts=P.lives||0,mistakes=0,starsArr=[],pickPred=null,hintsUsed=0,totalErr=0,gateOpenView=true,closedPhase=false;
    const reset=()=>{program=L.prefill?JSON.parse(JSON.stringify(L.prefill)):[];progB=[];row='a'};
    reset();
    root.innerHTML=`<div class="cq" id="cq"><div class="cq-head"><div><span class="kick">เกมเดินตามช่อง · ${esc(P.title)}</span></div><div class="cq-levels" id="cq-levels"></div></div>
      <div class="cq-msg" id="cq-msg"></div>
      <div class="cq-main"><div class="cq-board"><canvas id="cq-cv" width="600" height="600"></canvas><div class="cq-tag" id="cq-tag"></div><div class="cq-hearts" id="cq-hearts"></div></div>
      <div class="cq-side"><div class="cq-goal" id="cq-goal"></div><div class="cq-palette" id="cq-pal"></div>
        <div class="cq-prog-wrap"><div class="cq-prog-title"><b id="cq-pt">โปรแกรมของเรา</b><span id="cq-count"></span></div><div class="cq-program" id="cq-prog"></div></div>
        <div class="cq-actions"><button class="btn" id="cq-run">▶ รัน</button><button class="btn sec" id="cq-step">ทีละก้าว</button><button class="btn sec" id="cq-reset">↺ เริ่มใหม่</button><button class="btn sec" id="cq-hint">💡 ใบ้</button></div></div></div></div>`;
    const $q=s=>root.querySelector(s),cv=$q('#cq-cv'),scene=new Scene(cv,L);
    const setMsg=(t,k='')=>{const m=$q('#cq-msg');m.className='cq-msg '+k;m.textContent=t};
    const drawHearts=()=>{$q('#cq-hearts').textContent=P.lives?'❤️'.repeat(hearts)+'🖤'.repeat(P.lives-hearts):''};

    function levels(){$q('#cq-levels').innerHTML=Array.from({length:N},(_,i)=>`<button class="cq-lv ${i===level?'cur':''} ${starsArr[i]?'done':''}" data-lv="${i}" ${i<=starsArr.length?'':'disabled'}><b>${i+1}</b><span>${starsArr[i]?'⭐'.repeat(starsArr[i]):'☆'}</span></button>`).join('');
      $q('#cq-levels').querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>load(Number(b.dataset.lv)))}
    function palette(){
      const cards=[...P.cards];if(L.repeat&&!cards.includes('REP'))cards.push('REP');
      $q('#cq-pal').innerHTML=(L.mode==='predict'?'':cards.map(k=>`<button class="cq-pal" data-add="${k}" style="--bc:${CARD[k].c}"><span class="cq-glyph">${CARD[k].g}</span><small>${CARD[k].n}</small></button>`).join(''));
      $q('#cq-pal').querySelectorAll('[data-add]').forEach(b=>{b.onclick=e=>{if(e.detail===0)add(b.dataset.add)};b.onpointerdown=e=>drag(e,b.dataset.add,null)});
    }
    function goal(){
      const need=(L.items||[]).length;
      let txt='';
      if(L.mode==='predict')txt='🔮 ดูโปรแกรม แล้วแตะวงกลมที่ <b>หุ่นจะหยุด</b> จากนั้นกด ▶ รัน';
      else txt=`🎯 พาหุ่นไป <b>แท่นชาร์จ</b>${need?` · ⭐ เก็บให้ครบ <b>${need}</b>`:''}${L.mode==='debug'?' · 🔧 โปรแกรมนี้มี <b>ข้อผิด</b> ให้แก้':''}${L.mode==='two'?' · 🗺️ ต้องผ่านทั้ง <b>2 สนาม</b>':''}${L.mode==='branch'?' · 🚪 เขียนทั้งตอน <b>ประตูเปิด</b> และ <b>ประตูปิด</b>':''}`;
      $q('#cq-goal').innerHTML=txt;$q('#cq-tag').textContent=`ด่าน ${level+1}/${N}`;
    }
    function prog(){
      const el=$q('#cq-prog');
      if(L.mode==='branch'){
        el.innerHTML=`<div class="cq-row ${row==='a'?'on':''}" data-row="a"><b>🚪 ถ้าประตูเปิด</b><div class="cq-rowbody">${program.map((b,i)=>blockHTML(b,[i])).join('')||'<em>แตะบัตรด้านบนเพื่อวาง</em>'}</div></div>
          <div class="cq-row ${row==='b'?'on':''}" data-row="b"><b>🧱 ถ้าประตูปิด</b><div class="cq-rowbody">${progB.map((b,i)=>blockHTML(b,['B',i])).join('')||'<em>แตะบัตรด้านบนเพื่อวาง</em>'}</div></div>`;
        el.querySelectorAll('.cq-row').forEach(r=>r.onclick=e=>{if(e.target.closest('button'))return;row=r.dataset.row;prog()});
      }else el.innerHTML=program.length?program.map((b,i)=>blockHTML(b,[i])).join(''):'<div class="cq-empty">แตะหรือลากบัตรมาวางตรงนี้</div>';
      const used=countBlocks(program)+(L.mode==='branch'?countBlocks(progB):0);
      $q('#cq-count').textContent=L.mode==='predict'?'':'ใช้ '+used+' ใบ';
      el.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(running)return;const p=parsePath(b.dataset.del);if(p[0]==='B'){progB.splice(p[1],1)}else{const {list,index}=getAt(program,p);list.splice(index,1)}prog()});
      el.querySelectorAll('[data-n]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(running)return;const n=getAt(program,parsePath(b.dataset.n)).node;n.n=Math.max(2,Math.min(6,n.n+Number(b.dataset.d)));prog()});
      el.querySelectorAll('.cq-block').forEach(bl=>bl.onpointerdown=e=>{if(e.target.closest('button'))return;if(running||L.mode==='predict')return;e.stopPropagation();const p=bl.dataset.p;if(!p.startsWith('B'))drag(e,null,p)});
    }
    const target=()=>L.mode==='branch'&&row==='b'?progB:program;
    function add(k,list,at){
      if(running||L.mode==='predict')return;
      const t=list||target();
      if(countBlocks(program)+(L.mode==='branch'?countBlocks(progB):0)>=L.limit+4){setMsg('บัตรเต็มแล้ว ลองเอาบางใบออกนะ','warn');return}
      if(k==='REP'&&t!==program&&t!==progB){setMsg('ทำซ้ำซ้อนกันไม่ได้นะ','warn');return}
      const blk=k==='REP'?{t:'R',n:3,body:[]}:{t:'M',k};
      if(at==null||at>t.length)t.push(blk);else t.splice(at,0,blk);prog();beep('click');
    }
    function drag(e,newK,fromPath){
      const sx=e.clientX,sy=e.clientY;let g=null,moved=false;const el=$q('#cq-prog');const src=fromPath!=null?getAt(program,parsePath(fromPath)):null;
      const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<7)return;
        if(!moved){moved=true;g=document.createElement('div');g.className='cq-ghost';const k=newK||(src.node.t==='M'?src.node.k:'REP');g.style.setProperty('--bc',CARD[k].c);g.textContent=CARD[k].g+' '+CARD[k].n;document.body.append(g)}
        g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px';const r=el.getBoundingClientRect();el.classList.toggle('drop',ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom)};
      const up=ev=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);el.classList.remove('drop');if(g)g.remove();
        if(!moved){if(newK)add(newK);return}
        const r=el.getBoundingClientRect(),inside=ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom;
        let list=target(),at=list.length;
        const bh=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList&&x.classList.contains('cq-rep-body'));
        if(bh){const n=getAt(program,parsePath(bh.dataset.body)).node;if(n){list=n.body;at=list.length}}
        else{const kids=[...el.querySelectorAll(L.mode==='branch'?`.cq-row.on .cq-rowbody>.cq-block`:':scope>.cq-block')];at=kids.length;for(let i=0;i<kids.length;i++){const b=kids[i].getBoundingClientRect();if(ev.clientY<b.top+b.height/2){at=i;break}}}
        if(fromPath!=null){if(!inside){src.list.splice(src.index,1);prog();return}const m=src.list.splice(src.index,1)[0];if(src.list===list&&src.index<at)at--;list.splice(Math.min(at,list.length),0,m);prog();return}
        if(inside)add(newK,list,at)};
      document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);e.preventDefault();
    }
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    function hl(path){root.querySelectorAll('.cq-block.run').forEach(b=>b.classList.remove('run'));if(!path)return;const p=path.join('.');const el=root.querySelector(`.cq-block[data-p="${p}"]`);el&&el.classList.add('run')}
    async function play(sim,tok,Lview,delay){
      scene.L=Lview;scene.layout();scene.reset();
      for(const ev of sim.ev){
        if(tok!==token)return false;
        if(ev.path)hl(ev.path);
        if(ev.t==='turn'){scene.d=ev.d;if(ev.d===3)scene.face=-1;else if(ev.d===1)scene.face=1;await sleep(delay*.6)}
        else if(ev.t==='move'){
          scene.d=ev.d;if(ev.d===3)scene.face=-1;else if(ev.d===1)scene.face=1;scene.moving=true;const t0=performance.now();
          while(true){if(tok!==token)return false;const k=Math.min(1,(performance.now()-t0)/(delay*1.4)),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scene.px=ev.fx+(ev.tx-ev.fx)*e;scene.py=ev.fy+(ev.ty-ev.fy)*e;if(k>=1)break;await sleep(16)}
          scene.moving=false}
        else if(ev.t==='grab'){scene.got.add(ev.i);scene.burst(scene.cx(ev.x),scene.cy(ev.y),'#ffe27a',16);beep('ok')}
        else if(ev.t==='bump'){const sx=scene.px,sy=scene.py;for(let s=0;s<=6;s++){scene.px=sx+(ev.tx-sx)*.35*Math.sin(s/6*Math.PI);scene.py=sy+(ev.ty-sy)*.35*Math.sin(s/6*Math.PI);await sleep(30)}scene.px=sx;scene.py=sy;scene.shake=1;scene.flash=1;scene.burst(scene.cx(ev.tx),scene.cy(ev.ty),'#ff9aa8',12);beep('bad')}
        await sleep(delay*.25);
      }
      return true;
    }
    function whyMsg(w,L2){return {rock:'ชนปะการัง! ลองแก้บัตร แล้วกดรันอีกครั้ง',storm:'โดนวังน้ำวน! เลือกทางอ้อม',edge:'ออกนอกเกาะแล้ว ลองนับช่องอีกที',gate:'ประตูปิด! ต้องเดินอ้อมทางอื่น',short:'ยังไม่ถึงแท่นชาร์จ ลองเพิ่มบัตร',items:'ยังเก็บ ⭐ ไม่ครบ ลองเดินผ่านให้ครบนะ'}[w]||'ลองใหม่อีกครั้ง'}
    async function run(step){
      if(running)return;
      if($q('#cq-run').dataset.next){nextLevel();return}
      if(L.mode==='predict'&&!pickPred){setMsg('แตะวงกลมที่คิดว่าหุ่นจะหยุดก่อนนะ','warn');return}
      if(L.mode!=='predict'&&!program.length&&!(L.mode==='branch'&&progB.length)){setMsg('ยังไม่มีบัตรคำสั่ง ลากมาวางก่อนนะ','warn');return}
      running=true;const tok=++token;$q('#cq-run').disabled=true;
      const delay=step?640:380;
      let results=[];
      try{
        if(L.mode==='two'){
          for(const [name,Lv] of [['สนาม ก',L],['สนาม ข',L.second]]){
            setMsg('กำลังรัน '+name+'…','hint');
            const sim=simulate(Lv,flatPlain(program),true);results.push(sim);
            const ok=await play(sim,tok,Lv,delay);if(!ok){running=false;return}
            if(!sim.ok){fail(sim,name);return}
            await sleep(300);
          }
          success();
        }else if(L.mode==='branch'){
          const A=simulate(L,flatPlain(program,{open:true}),true),B=simulate(L,flatPlain(progB,{open:false}),false);
          scene.gateOpen=true;setMsg('รันตอนประตูเปิด…','hint');
          let ok=await play(A,tok,L,delay);if(!ok){running=false;return}
          if(!A.ok){scene.gateOpen=true;fail(A,'ตอนประตูเปิด');return}
          scene.gateOpen=false;setMsg('รันตอนประตูปิด…','hint');
          const Lc={...L,rocks:[...L.rocks],storms:[...L.storms]};
          ok=await play(B,tok,Lc,delay);if(!ok){running=false;return}
          if(!B.ok){fail(B,'ตอนประตูปิด');return}
          scene.gateOpen=true;success();
        }else{
          const sim=simulate(L,flatPlain(program),true);
          const ok=await play(sim,tok,L,delay);if(!ok){running=false;return}
          if(L.mode==='predict'){
            const match=pickPred&&pickPred.x===L.answer.x&&pickPred.y===L.answer.y;
            running=false;$q('#cq-run').disabled=false;
            if(match)success();else{wrongPredict()}
            return;
          }
          if(sim.ok)success();else fail(sim);
        }
      }finally{hl(null)}
    }
    function wrongPredict(){fails++;totalErr++;hit();setMsg('ยังไม่ตรงกับที่หุ่นเดินจริง ดูเส้นทางอีกครั้งแล้วเลือกใหม่','bad');pickPred=null;scene.pick=null;scene.reset()}
    function hit(){if(P.lives){hearts=Math.max(0,hearts-1);drawHearts();if(hearts===0){hearts=P.lives;drawHearts();setMsg('พลังหมด! เริ่มด่านนี้ใหม่นะ ไม่เป็นไร','warn');restoreLevel()}}}
    function fail(sim,where){
      fails++;totalErr++;running=false;$q('#cq-run').disabled=false;scene.flash=.5;hit();
      setMsg((where?where+': ':'')+whyMsg(sim.why)+(fails>=3?' · แตะ 💡 ใบ้ได้':''),'bad');if(fails>=3)$q('#cq-hint').classList.add('pulse');
      ctx.say&&ctx.say(false,'ลองใหม่!');
    }
    function success(){
      running=false;$q('#cq-run').disabled=false;
      const used=countBlocks(program)+(L.mode==='branch'?countBlocks(progB):0);
      const stars=fails===0&&(L.mode==='predict'||used<=L.par+0)?3:fails<=1&&(L.mode==='predict'||used<=L.par+2)?2:1;
      starsArr[level]=Math.max(starsArr[level]||0,stars);
      scene.win=1;if(L.goal){scene.burst(scene.cx(L.goal.x),scene.cy(L.goal.y),'#4ef4d2',30);scene.burst(scene.cx(L.goal.x),scene.cy(L.goal.y),'#ffd34f',30)}
      beep('win');ctx.say&&ctx.say(true,'ผ่านด่าน!');levels();
      const last=level>=N-1,b=$q('#cq-run');
      setMsg('ผ่านแล้ว! '+'⭐'.repeat(stars)+(stars===3?' ยอดเยี่ยม':' ลองทำให้ได้ 3 ดาว'),'ok');
      b.textContent=last?'จบด่านนี้ ⭐':'ด่านต่อไป ▶';b.dataset.next='1';b.classList.add('cq-next');
    }
    function nextLevel(){
      const b=$q('#cq-run');delete b.dataset.next;b.classList.remove('cq-next');
      if(level>=N-1){
        if(starsArr.filter(Boolean).length>=N){ctx.done(totalErr>=N*2?3:totalErr>=N?2:totalErr>=2?1:0);return}
        setMsg('ยังมีด่านที่ยังไม่ผ่าน เลือกจากแถบด้านบนได้เลย','warn');return;
      }
      load(level+1);
    }
    function restoreLevel(){scene.L=L;scene.layout();scene.reset();scene.pick=null;pickPred=null;reset();prog();token++;running=false;$q('#cq-run').disabled=false}
    function load(i){
      token++;level=Math.max(0,Math.min(N-1,i));fails=0;L=build(packName,level);scene.L=L;scene.layout();scene.reset();scene.pick=null;pickPred=null;scene.gateOpen=true;
      reset();running=false;const b=$q('#cq-run');b.textContent='▶ รัน';b.classList.remove('cq-next');delete b.dataset.next;b.disabled=false;$q('#cq-hint').classList.remove('pulse');
      levels();palette();goal();prog();drawHearts();
      setMsg(L.mode==='debug'?'โปรแกรมนี้ผิดอยู่ 1 จุด ลองรันดู แล้วแก้ให้ถึงแท่นชาร์จ':L.mode==='predict'?'อ่านบัตรทีละใบ แล้วทายว่าหุ่นจะหยุดตรงไหน':level===0?'ลากหรือแตะบัตรเพื่อสร้างโปรแกรม แล้วกด ▶ รัน':'พร้อมแล้ว! ลองสร้างโปรแกรมของด่านนี้');
    }
    $q('#cq-run').onclick=()=>run(false);
    $q('#cq-step').onclick=()=>run(true);
    $q('#cq-reset').onclick=()=>{token++;running=false;$q('#cq-run').disabled=false;restoreLevel();setMsg('เริ่มใหม่แล้ว')};
    $q('#cq-hint').onclick=()=>{
      hintsUsed++;
      if(L.mode==='predict'){setMsg('ใบ้: เริ่มที่ช่องเริ่ม แล้วอ่านบัตรทีละใบ เดินหน้า = ไป 1 ช่อง เลี้ยว = หันตัว','hint');return}
      const sol=(L.mode==='branch'&&row==='b')?L.solClosed:L.solution,cur=flatPlain(target(),{open:row!=='b'}).map(c=>c.k);let m=0;while(m<cur.length&&cur[m]===sol[m])m++;
      if(L.mode==='debug'&&L.bugKind){setMsg('ใบ้: ผิดที่บัตรใบที่ '+(L.bugPos+1)+' ('+(L.bugKind==='del'?'ขาดบัตรไปใบหนึ่ง':'สองใบนี้สลับที่กัน')+')','hint');return}
      const nk=sol&&sol[m];if(!nk){setMsg('ถูกทางแล้ว ลองกด ▶ รันดูนะ','ok');return}
      setMsg('ใบ้: บัตรถัดไปคือ '+CARD[nk].g+' '+CARD[nk].n,'hint');
      const bt=root.querySelector(`[data-add="${nk}"]`);bt&&(bt.classList.add('blink'),setTimeout(()=>bt.classList.remove('blink'),2400));
    };
    cv.addEventListener('pointerdown',e=>{
      if(L.mode!=='predict'||running)return;
      const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*600/r.width,y=(e.clientY-r.top)*600/r.height;
      const gx=Math.floor((x-scene.ox)/scene.c),gy=Math.floor((y-scene.oy)/scene.c);
      const hit=L.options.find(p=>p.x===gx&&p.y===gy);if(hit){pickPred=hit;scene.pick=hit;beep('click');setMsg('เลือกวงกลม “'+['ก','ข','ค'][L.options.indexOf(hit)]+'” แล้ว กด ▶ รัน เพื่อดูว่าถูกไหม','hint')}
    });
    let last=performance.now();
    (function loop(now){if(!cv.isConnected)return;const dt=Math.min(.05,(now-last)/1000);last=now;scene.draw(dt);requestAnimationFrame(loop)})(last);
    load(0);
  }
  return {mount,build,simulate,solve,flatten:flatPlain,PACK};
})();
ACT.quest=(host,P,ctx)=>QUEST.mount(host,P.pack,ctx);
