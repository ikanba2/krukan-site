/* Techno ป.2 · เครื่องมือกิจกรรม (ใช้ซ้ำทุกภารกิจ): choose order sort find robot table tree grid
   ทุกตัวเรียก ctx.done(จำนวนครั้งที่พลาด) เมื่อสำเร็จ · ผิดแล้วแสดงเหตุผลสั้น ๆ และลองใหม่ได้ ไม่ล็อก */
const Drag={
  attach(el,getTargets,onDrop,onTap){
    el.addEventListener('pointerdown',e=>{
      if(e.button>0)return;const sx=e.clientX,sy=e.clientY;let g=null;
      const over=(x,y)=>getTargets().find(t=>{const r=t.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom});
      const mv=ev=>{
        if(!g&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<7)return;
        if(!g){g=el.cloneNode(true);g.classList.add('ghost');g.style.width=el.offsetWidth+'px';document.body.append(g);el.style.opacity='.35'}
        g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px';
        const t=over(ev.clientX,ev.clientY);getTargets().forEach(x=>x.classList.toggle('over',x===t));
      };
      const up=ev=>{
        window.removeEventListener('pointermove',mv);
        if(g){g.remove();el.style.opacity='';const t=over(ev.clientX,ev.clientY);getTargets().forEach(x=>x.classList.remove('over'));if(t)onDrop(el,t)}
        else onTap&&onTap(el);
      };
      window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up,{once:true});
    });
  }
};
const em=(x,e)=>`${e?`<span class="em">${e}</span>`:''}${esc(x)}`;
const ACT={};
/* รอบโบนัสสร้างจากข้อมูลเดิม: ขั้นไหนหายไป / ขั้นไหนมาก่อน (ยากขึ้นแต่ยังตรงเรื่อง) */
function orderBonus(P,ctx){
  const it=P.items,n=it.length;if(n<3)return [];
  const gi=(P.groups||[]).flat(),cand=it.map((_,i)=>i).filter(i=>!gi.includes(i));
  const out=[];
  if(cand.length){
    const miss=cand[Math.floor((cand.length-1)/2)],pool=[];
    for(const k in P2C)(P2C[k].t||[]).forEach(c=>{if(c.act&&c.act.items)c.act.items.forEach(x=>{if(x.x&&!it.some(y=>y.x===x.x))pool.push(x.x)})});
    const wrong=shuffle(pool,miss*17+n).slice(0,2);
    if(wrong.length>=1)out.push({q:'โจทย์เดิม: '+it.map((x,i)=>i===miss?'___':x.x).join(' → ')+'\nขั้นที่หายไปคือขั้นไหน?',o:[it[miss].x,...wrong],a:0,why:'ขั้นนี้ต้องอยู่ตรงช่องว่าง จึงต่อกันได้'});
  }
  const i=cand.find(k=>k+1<n&&!gi.includes(k+1));
  if(i!=null)out.push({q:'ขั้นไหนต้องทำ “ก่อน”?',o:[it[i].x,it[i+1].x],a:0,why:'“'+it[i].x+'” ต้องมาก่อน “'+it[i+1].x+'”'});
  return out;
}
function sortBonus(P){
  const its=shuffle(P.items.map((x,i)=>({...x,i})),P.items.length*13+7).slice(0,2);
  return its.map(it=>({q:'ท้าทาย! “'+it.x+'” อยู่หมวดไหน?',o:P.bins.slice(),a:it.b,why:it.why||'ถูกต้อง'}));
}

/* ---- เลือกคำตอบทีละข้อ ---- */
ACT.choose=(host,P,ctx)=>{
  const qs=P.qs||[];let k=0,err=0;
  const draw=()=>{
    const q=qs[k];
    host.innerHTML=`<div class="qn">ข้อ ${k+1}/${qs.length}</div>${q.img?img(q.img,'art contain').replace('class="art','style="max-height:220px;width:auto" class="art'):''}<p class="q">${esc(q.q)}</p><div class="opts">${permFor(q.q,q.o.length).map(x=>`<button class="opt" data-x="${x}">${esc(q.o[x])}</button>`).join('')}</div>`;
    $$('.opt',host).forEach(b=>b.onclick=()=>{
      const x=Number(b.dataset.x);
      if(x===q.a){b.classList.add('right');$$('.opt',host).forEach(z=>z.disabled=true);ctx.say(true,'ถูกต้อง!');ctx.fb('good','✅ '+(q.why||'ถูกต้อง'));
        setTimeout(()=>{k++;if(k>=qs.length){host.innerHTML='<p class="note">ตอบครบทุกข้อแล้ว</p>';ctx.done(err)}else{ctx.fb('idle','');draw()}},1100)}
      else{err++;b.classList.add('wrong');b.disabled=true;ctx.say(false,'ลองอีกที');ctx.fb('bad','💡 '+(q.hint||'ยังไม่ใช่ ลองดูใหม่อีกที'))}
    });
  };
  if(!qs.length){host.innerHTML='<p class="note">กำลังเตรียมกิจกรรม</p>';return ctx.done(0)}
  draw();
};

/* ---- เรียงลำดับ (groups = ตำแหน่งที่สลับกันได้) ---- */
ACT.order=(host,P,ctx)=>{
  const items=P.items,n=items.length,groups=P.groups||[],err={n:0};
  const all=[...items,...(P.decoys||[]).map(x=>({x,e:'🎴'}))];
  const same=(a,b)=>a===b||groups.some(g=>g.includes(a)&&g.includes(b));
  let order=shuffle(all.map((_,i)=>i));if(order.slice(0,n).every((v,i)=>v===i))order.reverse();
  const slots=Array(n).fill(null);
  const draw=()=>{
    host.innerHTML=`<p class="q">${esc(P.prompt||'เรียงลำดับให้ถูก')}</p><div class="board"><div class="slots">${slots.map((v,k)=>`<div class="slot" data-k="${k}"><i>${k+1}</i>${v!=null?`<div class="card" data-s="${k}">${em(all[v].x,all[v].e)}</div>`:''}</div>`).join('')}</div></div>
    <div class="cards" id="bank">${order.filter(v=>!slots.includes(v)).map(v=>`<div class="card" data-v="${v}">${em(all[v].x,all[v].e)}</div>`).join('')}</div>
    <div class="actions"><button class="btn sm" id="chk" ${slots.includes(null)?'disabled':''}>ตรวจคำตอบ</button></div>`;
    const targets=()=>$$('.slot',host);
    $$('#bank .card',host).forEach(c=>Drag.attach(c,targets,(el,t)=>{put(Number(el.dataset.v),Number(t.dataset.k))},el=>{const k=slots.indexOf(null);if(k>=0)put(Number(el.dataset.v),k)}));
    $$('.slot .card',host).forEach(c=>c.onclick=()=>{slots[Number(c.dataset.s)]=null;beep('click');draw()});
    $('#chk').onclick=check;
  };
  const put=(v,k)=>{if(slots[k]!=null){const old=slots[k];slots[k]=v}else slots[k]=v;beep('click');draw()};
  const check=()=>{
    const bad=slots.map((v,k)=>!same(v,k));
    if(!bad.some(Boolean)){ctx.say(true,'เรียงถูกแล้ว!');ctx.fb('good','✅ '+(P.why||'เรียงถูกต้อง'));
      $$('.slot .card',host).forEach(c=>c.classList.add('right'));
      const qs=[...(P.then?[P.then]:[]),...orderBonus(P,ctx)];
      if(qs.length)setTimeout(()=>ACT.choose(host,{qs},{...ctx,done:e=>ctx.done(err.n+e)}),1200);else ctx.done(err.n);return}
    err.n++;ctx.say(false,'ยังไม่ถูก ลองดูอีกที');ctx.fb('bad','💡 '+(P.hint||'ดูว่าอะไรต้องมาก่อน อะไรมาหลัง'));
    bad.forEach((b,k)=>{if(b){$(`.slot[data-k="${k}"] .card`,host)?.classList.add('wrong')}});
    setTimeout(()=>{bad.forEach((b,k)=>{if(b)slots[k]=null});draw()},1100);
  };
  draw();
};

/* ---- จัดหมวด ---- */
ACT.sort=(host,P,ctx)=>{
  const items=shuffle(P.items.map((x,i)=>({...x,i}))),placed={};let err=0;
  const draw=()=>{
    host.innerHTML=`<p class="q">${esc(P.prompt||'จัดเข้าหมวดให้ถูก')}</p><div class="bins">${P.bins.map((b,k)=>`<div class="bin" data-b="${k}"><h3>${esc(b)}</h3><div class="cards">${items.filter(it=>placed[it.i]===k).map(it=>`<div class="card right">${em(it.x,it.e)}</div>`).join('')}</div></div>`).join('')}</div>
    <div class="board"><div class="cards" id="bank">${items.filter(it=>placed[it.i]==null).map(it=>`<div class="card" data-i="${it.i}">${em(it.x,it.e)}</div>`).join('')||'<span>จัดครบแล้ว!</span>'}</div></div>`;
    const targets=()=>$$('.bin',host);let sel=null;
    $$('#bank .card',host).forEach(c=>Drag.attach(c,targets,(el,t)=>drop(Number(el.dataset.i),Number(t.dataset.b)),el=>{sel=Number(el.dataset.i);$$('#bank .card',host).forEach(z=>z.classList.toggle('sel',z===el));ctx.fb('hint','เลือกการ์ดแล้ว · แตะหมวดที่ถูกต้อง')}));
    $$('.bin',host).forEach(b=>b.onclick=()=>{if(sel!=null){drop(sel,Number(b.dataset.b));sel=null}});
  };
  const drop=(i,b)=>{
    const it=P.items[i];
    if(it.b===b){placed[i]=b;beep('ok');ctx.fb('good','✅ '+(it.why||'ถูกหมวด'));
      if(Object.keys(placed).length===items.length){ctx.say(true,'จัดครบแล้ว!');const qs=[...(P.then?[P.then]:[]),...sortBonus(P)];if(qs.length)setTimeout(()=>ACT.choose(host,{qs},{...ctx,done:e=>ctx.done(err+e)}),900);else ctx.done(err)}else draw()}
    else{err++;ctx.say(false,'ลองหมวดอื่น');ctx.fb('bad','💡 '+(it.hint||'ยังไม่ใช่หมวดนี้ · ลองอ่านชื่อหมวดอีกที'));beep('bad')}
  };
  draw();
};

/* ---- หาจุด/เลือกให้ครบ (เลือกหลายอัน) ---- */
ACT.find=(host,P,ctx)=>{
  const items=P.items,sel=new Set();let err=0;
  const draw=()=>{
    host.innerHTML=`<p class="q">${esc(P.prompt||'แตะทุกอันที่เข้าเงื่อนไข')}</p><div class="board"><div class="tok">${items.map((it,i)=>`<button data-i="${i}" class="${sel.has(i)?'sel':''}">${em(it.x,it.e)}</button>`).join('')}</div></div><div class="actions"><button class="btn sm" id="chk">ตรวจคำตอบ</button></div>`;
    $$('.tok button',host).forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);sel.has(i)?sel.delete(i):sel.add(i);beep('click');b.classList.toggle('sel')});
    $('#chk').onclick=()=>{
      const miss=items.map((it,i)=>it.yes&&!sel.has(i)?i:-1).filter(i=>i>=0),extra=[...sel].filter(i=>!items[i].yes);
      if(!miss.length&&!extra.length){$$('.tok button',host).forEach((b,i)=>{if(items[i].yes)b.classList.add('right')});ctx.say(true,'ครบแล้ว!');
        ctx.fb('good','✅ '+(P.why||items.filter(x=>x.yes).map(x=>x.why).filter(Boolean).join(' · ')||'เลือกครบถูกต้อง'));
        if(P.then)setTimeout(()=>ACT.choose(host,{qs:[P.then]},{...ctx,done:e=>ctx.done(err+e)}),1200);else ctx.done(err);return}
      err++;extra.forEach(i=>$(`.tok button[data-i="${i}"]`,host).classList.add('wrong'));
      ctx.say(false,'ลองดูอีกที');ctx.fb('bad',extra.length?'💡 มีอันที่ยังไม่เข้าเงื่อนไข: '+items[extra[0]].x+(items[extra[0]].no?' · '+items[extra[0]].no:''):'💡 ยังขาดอีก '+miss.length+' อัน ลองหาเพิ่ม');
      setTimeout(()=>{extra.forEach(i=>sel.delete(i));draw()},1000);
    };
  };draw();
};

/* ---- หุ่นเดินบนตาราง: build | trace | debug | two | branch ---- */
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]],DGL=['▲','▶','▼','◀'];
const PC={F:{g:'↑',n:'เดินหน้า',c:'#2fd4e6'},L:{g:'↰',n:'เลี้ยวซ้าย',c:'#ffd34f'},R:{g:'↱',n:'เลี้ยวขวา',c:'#ff9a7a'}};
function simulate(map,prog){
  let [x,y,d]=map.start;const seen=[[x,y,d]],got=new Set();let fail=null,at=-1;
  for(let k=0;k<prog.length;k++){
    const c=prog[k];
    if(c==='L')d=(d+3)%4;else if(c==='R')d=(d+1)%4;
    else{const nx=x+DIRS[d][0],ny=y+DIRS[d][1];
      if(nx<0||ny<0||nx>=map.w||ny>=map.h||(map.walls||[]).some(w=>w[0]===nx&&w[1]===ny)){fail='ชน';at=k;seen.push([x,y,d,true]);break}
      x=nx;y=ny}
    (map.items||[]).forEach((it,i)=>{if(it[0]===x&&it[1]===y)got.add(i)});
    seen.push([x,y,d]);
  }
  const reached=x===map.goal[0]&&y===map.goal[1],all=!(map.items||[]).length||got.size===map.items.length;
  return {path:seen,end:[x,y,d],fail,at,ok:!fail&&reached&&all,reached,got,all};
}
function gridHTML(map,pos,visited,pick){
  let h=`<div class="grid" style="grid-template-columns:repeat(${map.w},auto)">`;
  for(let yy=0;yy<map.h;yy++)for(let xx=0;xx<map.w;xx++){
    const wall=(map.walls||[]).some(w=>w[0]===xx&&w[1]===yy),gate=map.gate&&map.gate[0]===xx&&map.gate[1]===yy,goal=map.goal[0]===xx&&map.goal[1]===yy,it=(map.items||[]).findIndex(w=>w[0]===xx&&w[1]===yy);
    const here=pos&&pos[0]===xx&&pos[1]===yy;
    h+=`<div class="cell ${wall?'wall':''} ${goal?'goal':''} ${pick&&pick[0]===xx&&pick[1]===yy?'pick':''}" data-x="${xx}" data-y="${yy}">${wall?(gate?'🧱':(map.wi||'🪨')):gate?'🚪':goal?(map.gi||'🔋'):it>=0&&!(visited&&visited.has(it))?'⭐':''}${here?`<span class="robot" style="transform:rotate(${pos[2]*90-0}deg)">🤖</span>`:''}${here?`<small style="position:absolute;right:3px;top:1px;font-size:14px;color:#0a4d7a">${DGL[pos[2]]}</small>`:''}</div>`;
  }
  return h+'</div>';
}
ACT.robot=(host,P,ctx)=>{
  const mode=P.mode||'build',maps=P.maps||[P],cards=P.cards||['F','L','R'],err={n:0};
  const views=()=>mode==='branch'?[{...maps[0],name:'ประตูเปิด'},{...maps[0],walls:[...(maps[0].walls||[]),maps[0].gate],name:'ประตูปิด'}]:maps;
  let prog=[...(P.pre||[])],selIdx=-1,row=0;const progs=mode==='branch'?[[...(P.preA||[])],[...(P.preB||[])]]:null;
  let predicted=null,busy=false;
  const cur=()=>mode==='branch'?progs[row]:prog;
  const palette=()=>`<div class="pal">${cards.map(c=>`<button class="pcard" data-c="${c}" style="--c:${PC[c].c}" title="${PC[c].n}">${PC[c].g}</button>`).join('')}</div><div style="text-align:center;font-size:15px;color:var(--soft)">${cards.map(c=>PC[c].g+' '+PC[c].n).join(' · ')}</div>`;
  const progRow=(arr,idx,title)=>`${title?`<div class="qn">${title}</div>`:''}<div class="prog" data-row="${idx}">${arr.map((c,k)=>`<button class="pcard ${k===selIdx&&idx===row?'run':''}" data-k="${k}" data-r="${idx}" style="--c:${PC[c].c}">${PC[c].g}</button>`).join('')||'<span style="color:var(--soft)">แตะการ์ดด้านล่างเพื่อวางคำสั่ง</span>'}</div>`;
  const draw=(simStates)=>{
    const V=views(),g=V.map((m,k)=>{const pos=simStates?.[k]??m.start;return `<div>${V.length>1?`<div class="qn" style="text-align:center">${esc(m.name||'แผนที่ '+(k+1))}</div>`:''}${gridHTML(m,pos,null,mode==='trace'?predicted:null)}</div>`}).join('');
    host.innerHTML=`<p class="q">${esc(P.prompt||'')}</p><div style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center">${g}</div>
      ${mode==='trace'&&!predicted?'<p class="note ex" style="text-align:center">1) แตะช่องที่คิดว่าหุ่นจะไปหยุด 2) แล้วกด ▶ รัน</p>':''}
      ${mode==='branch'?progRow(progs[0],0,'🚪 ถ้าประตูเปิด ให้ทำ')+progRow(progs[1],1,'🧱 ถ้าประตูปิด ให้ทำ'):progRow(prog,0,mode==='debug'?'โปรแกรมของหุ่น (แตะบัตรเพื่อเลือก แก้ได้)':'โปรแกรมของเรา')}
      ${mode==='trace'?'':palette()}
      <div class="actions"><span class="sec-l" style="font-size:16px;color:var(--soft)">บัตร ${mode==='branch'?progs[0].length+progs[1].length:prog.length}${P.max?'/'+P.max:''}</span>
        ${mode!=='trace'?'<button class="btn sec sm" id="del">ลบใบที่เลือก</button><button class="btn sec sm" id="mvl">◀ ย้าย</button><button class="btn sec sm" id="mvr">ย้าย ▶</button><button class="btn sec sm" id="clr">เริ่มใหม่</button>':''}
        <button class="btn" id="run" ${busy?'disabled':''}>▶ รัน</button></div>`;
    if(mode!=='trace'){
      $$('.pal .pcard',host).forEach(b=>b.onclick=()=>{const a=cur();if(P.max&&(mode==='branch'?progs[0].length+progs[1].length:prog.length)>=P.max){ctx.fb('hint','ใช้บัตรครบจำนวนแล้ว ลองลบบัตรที่ไม่จำเป็น');return}
        const at=selIdx>=0&&selIdx<a.length?selIdx+1:a.length;a.splice(at,0,b.dataset.c);selIdx=at;beep('click');draw()});
      $$('.prog .pcard',host).forEach(b=>b.onclick=()=>{row=Number(b.dataset.r);selIdx=Number(b.dataset.k);draw()});
      $('#del').onclick=()=>{const a=cur();if(selIdx>=0){a.splice(selIdx,1);selIdx=Math.min(selIdx,a.length-1);draw()}};
      $('#mvl').onclick=()=>{const a=cur();if(selIdx>0){[a[selIdx-1],a[selIdx]]=[a[selIdx],a[selIdx-1]];selIdx--;draw()}};
      $('#mvr').onclick=()=>{const a=cur();if(selIdx>=0&&selIdx<a.length-1){[a[selIdx+1],a[selIdx]]=[a[selIdx],a[selIdx+1]];selIdx++;draw()}};
      $('#clr').onclick=()=>{if(mode==='branch'){progs[0]=[];progs[1]=[]}else prog=[...(P.pre&&mode==='debug'?P.pre:[])];selIdx=-1;draw()};
    }else{$$('.cell',host).forEach(c=>c.onclick=()=>{predicted=[Number(c.dataset.x),Number(c.dataset.y)];draw()})}
    $('#run').onclick=run;
  };
  const run=async()=>{
    if(mode==='trace'&&!predicted){ctx.fb('hint','แตะช่องที่คิดว่าหุ่นจะหยุดก่อน แล้วค่อยกดรัน');return}
    busy=true;
    const V=views(),lists=mode==='branch'?V.map((m,r)=>({m,p:progs[r]})):V.map(m=>({m,p:mode==='trace'?P.pre:prog}));
    const sims=lists.map(x=>simulate(x.m,x.p));const steps=Math.max(...sims.map(s=>s.path.length));
    for(let k=0;k<steps;k++){
      host.querySelectorAll('.grid').forEach((gEl,gi)=>{const s=sims[gi],pos=s.path[Math.min(k,s.path.length-1)];const holder=gEl.parentElement;holder.innerHTML=(V.length>1?`<div class="qn" style="text-align:center">${esc(V[gi].name||'แผนที่ '+(gi+1))}</div>`:'')+gridHTML(lists[gi].m,pos,null,predicted)});
      await new Promise(r=>setTimeout(r,330));
    }
    busy=false;
    const allOk=sims.every(s=>s.ok);
    if(mode==='trace'){
      const e=sims[0].end,match=predicted[0]===e[0]&&predicted[1]===e[1];
      if(match){ctx.say(true,'ทายถูก!');ctx.fb('good','✅ ทายตรงกับที่หุ่นเดินจริง · '+(P.why||''));ctx.done(err.n)}
      else{err.n++;predicted=null;ctx.say(false,'ลองทายใหม่');ctx.fb('bad','💡 หุ่นหยุดที่อีกช่อง ลองอ่านบัตรทีละใบแล้วทายใหม่');draw()}
      return;
    }
    if(allOk){ctx.say(true,'ถึงเป้าหมายแล้ว!');ctx.fb('good','✅ '+(P.why||'หุ่นถึงเป้าหมายอย่างปลอดภัย'));
      if(P.then)setTimeout(()=>ACT.choose(host,{qs:[P.then]},{...ctx,done:e=>ctx.done(err.n+e)}),1300);else ctx.done(err.n);return}
    err.n++;
    const bad=sims.findIndex(s=>!s.ok),s=sims[bad];
    ctx.say(false,'ลองแก้อีกที');
    ctx.fb('bad',s.fail?`💡 หุ่นชนที่บัตรใบที่ ${s.at+1} ${V.length>1?'('+(V[bad].name||'แผนที่ '+(bad+1))+')':''} ลองแก้ใบนั้น`:!s.reached?`💡 หุ่นยังไม่ถึงเป้าหมาย${V.length>1?' ('+V[bad].name+')':''} ตรวจบัตรที่ขาดหรือเกิน`:'💡 ยังเก็บ ⭐ ไม่ครบ ลองเดินผ่านทุกดาว');
    draw(sims.map(x=>x.path.at(-1)));
  };
  draw();
};

/* ---- ตารางผลทดลอง/ตารางทดสอบ ---- */
ACT.table=(host,P,ctx)=>{
  const ans={};let err=0;
  const draw=()=>{
    host.innerHTML=`<p class="q">${esc(P.prompt||'เลือกผลให้ครบทุกแถว')}</p><div style="overflow:auto"><table class="tbl"><tr><th>${esc(P.first||'กรณี')}</th>${P.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>
    ${P.rows.map((r,i)=>`<tr><td>${esc(r.x)}</td>${r.cells.map((c,j)=>`<td>${permFor(r.x+'|'+j,c.o.length).map(x=>`<button class="opt ${ans[i+':'+j]===x?'sel':''}" data-k="${i}:${j}" data-x="${x}">${esc(c.o[x])}</button>`).join(' ')}</td>`).join('')}</tr>`).join('')}</table></div><div class="actions"><button class="btn sm" id="chk">ตรวจตาราง</button></div>`;
    $$('.opt',host).forEach(b=>b.onclick=()=>{ans[b.dataset.k]=Number(b.dataset.x);beep('click');draw()});
    $('#chk').onclick=()=>{
      const total=P.rows.reduce((s,r)=>s+r.cells.length,0);
      if(Object.keys(ans).length<total){ctx.fb('hint','ยังเลือกไม่ครบทุกช่อง');return}
      const bad=[];P.rows.forEach((r,i)=>r.cells.forEach((c,j)=>{if(ans[i+':'+j]!==c.a)bad.push([i,j])}));
      if(!bad.length){ctx.say(true,'ตารางถูกทุกช่อง!');ctx.fb('good','✅ '+(P.why||'ผลถูกต้องทุกแถว'));$$('.opt.sel',host).forEach(b=>b.classList.add('right'));ctx.done(err);return}
      err++;bad.forEach(([i,j])=>{const b=$(`.opt[data-k="${i}:${j}"].sel`,host);b&&b.classList.add('wrong')});
      const [i,j]=bad[0];ctx.say(false,'มีช่องที่ยังไม่ตรง');ctx.fb('bad','💡 แถว “'+P.rows[i].x+'” '+(P.rows[i].cells[j].why||'ลองคิดอีกครั้ง'));
      bad.forEach(([i,j])=>delete ans[i+':'+j]);
    };
  };draw();
};

/* ---- ขนของข้ามสะพาน: เลือกของไม่เกินความจุ ขนให้ครบด้วยเที่ยวน้อยที่สุด ---- */
ACT.cargo=(host,P,ctx)=>{
  const cap=P.capacity,items=P.items,min=P.minimum;let sel=[],sent=[],trips=0,err=0;
  const w=i=>items[i][1];
  const draw=()=>{
    const load=sel.reduce((a,i)=>a+w(i),0);
    host.innerHTML=`<p class="q">สะพานรับได้เที่ยวละ ${cap} หน่วย · ขนให้ครบ ${items.length} ชิ้น ด้วยเที่ยวน้อยที่สุด</p>
      <div class="ghud" style="background:linear-gradient(90deg,#1f7a48,#3da35d)"><span>เที่ยวที่ ${trips+1}</span><span class="grow"></span><span>น้ำหนัก ${load}/${cap}</span><span>ส่งแล้ว ${sent.length}/${items.length}</span></div>
      <div class="board"><div class="cards">${items.map((it,i)=>`<div class="card ${sel.includes(i)?'sel':''} ${sent.includes(i)?'used':''}" data-i="${i}"><span class="em">📦</span>${esc(it[0])}<br><b>${it[1]} หน่วย</b></div>`).join('')}</div></div>
      <div class="bar-p" style="height:18px;margin:8px 0"><i style="width:${Math.min(100,load/cap*100)}%;background:${load>cap?'#ef5b6a':''}"></i></div>
      <div class="actions"><button class="btn sec sm" id="clr">เลือกใหม่</button><button class="btn" id="send">🚚 ส่งของข้ามสะพาน</button></div>`;
    $$('.card',host).forEach(c=>c.onclick=()=>{const i=Number(c.dataset.i);if(sent.includes(i))return;
      if(sel.includes(i))sel=sel.filter(x=>x!==i);
      else if(load+w(i)>cap){err++;ctx.say(false,'หนักเกินสะพาน');ctx.fb('bad','💡 รวมแล้วเกิน '+cap+' หน่วย ลองเลือกชิ้นอื่น หรือส่งแยกเที่ยว');return}
      else sel.push(i);
      beep('click');draw()});
    $('#clr').onclick=()=>{sel=[];draw()};
    $('#send').onclick=()=>{
      if(!sel.length){ctx.fb('hint','เลือกของก่อนส่ง');return}
      sent.push(...sel);sel=[];trips++;ctx.say(true,'ส่งข้ามแล้ว!');
      if(sent.length>=items.length){
        const extra=Math.max(0,trips-min);err+=extra;
        if(extra){ctx.fb('hint','ครบแล้ว! แต่ใช้ '+trips+' เที่ยว ลองจัดให้เหลือ '+min+' เที่ยวนะ')}
        else ctx.fb('good','✅ ครบทุกชิ้นด้วย '+trips+' เที่ยว ซึ่งน้อยที่สุด!');
        draw();ctx.done(err);return}
      draw();
    };
  };draw();
};

/* ---- แฟ้มและโฟลเดอร์ ---- */
ACT.tree=(host,P,ctx)=>{
  let open=new Set(P.open||[]),sel='',err=0,bin=false;
  const walk=(node,path,depth)=>{
    const here=path?path+'/'+(node.n||node.f):(node.n||node.f);
    if(node.f!=null)return `<button class="node kid ${sel===here?'sel':''}" data-p="${esc(here)}" data-t="f">📄 ${esc(node.f)}</button>`;
    const isOpen=open.has(here)||depth===0;
    return `<div><button class="node ${depth?'kid':''} ${sel===here?'sel':''}" data-p="${esc(here)}" data-t="d">${isOpen?'📂':'📁'} ${esc(node.n)}</button>${isOpen?`<div class="kid">${(node.k||[]).map(k=>walk(k,here,depth+1)).join('')}</div>`:''}</div>`;
  };
  const draw=()=>{
    host.innerHTML=`<p class="q">${esc(P.prompt||'')}</p>${P.file?`<div class="note ex">📄 ไฟล์: <b>${esc(P.file)}</b></div>`:''}<div class="tree">${walk(P.tree,'',0)}</div>
      <div class="actions"><span class="sec-l" style="font-size:16px;color:var(--soft)">${P.mode==='save'?'แตะโฟลเดอร์ แล้วกด “บันทึกที่นี่”':'แตะโฟลเดอร์เพื่อเปิด · แตะไฟล์เพื่อเลือก'}</span><button class="btn sm" id="ok">${P.mode==='save'?'บันทึกที่นี่':P.mode==='restore'?'กู้ไฟล์นี้':'เปิดไฟล์นี้'}</button></div>`;
    $$('.node',host).forEach(b=>b.onclick=()=>{const p=b.dataset.p;sel=p;if(b.dataset.t==='d'){open.has(p)?open.delete(p):open.add(p)}beep('click');draw()});
    $('#ok').onclick=()=>{
      if(!sel){ctx.fb('hint','แตะเลือกก่อนนะ');return}
      const ok=P.mode==='save'?sel===P.target:sel.endsWith('/'+P.target)||sel===P.target;
      if(ok){ctx.say(true,'ถูกต้อง!');ctx.fb('good','✅ '+(P.why||'ถูกที่แล้ว'));ctx.done(err)}
      else{err++;ctx.say(false,'ยังไม่ใช่');ctx.fb('bad','💡 '+(P.hint||'ลองอ่านชื่อให้ละเอียด หรือเปิดตรวจก่อน'))}
    };
  };draw();
};

/* ---- ค้นหาในผังหมอก (ทำเครื่องหมายช่องที่ตรวจแล้ว) ---- */
ACT.grid=(host,P,ctx)=>{
  const vis=new Set();let err=0,found=false;
  const draw=()=>{
    let h=`<p class="q">${esc(P.prompt||'ค้นหาให้เจอโดยไม่ตรวจซ้ำ')}</p><div class="grid" style="grid-template-columns:repeat(${P.w},auto)">`;
    for(let y=0;y<P.h;y++)for(let x=0;x<P.w;x++){const k=x+','+y,v=vis.has(k),t=P.target[0]===x&&P.target[1]===y;
      h+=`<button class="cell ${v?(t?'goal':'vis'):'fog'}" data-k="${k}" style="border:0;font-size:30px">${v?(t?(P.ti||'⭐'):'✓'):'?'}</button>`}
    host.innerHTML=h+`</div><div class="actions"><span class="sec-l" style="color:var(--soft)">ตรวจแล้ว ${vis.size} ช่อง · ตรวจซ้ำ ${err} ครั้ง</span></div>`;
    $$('.cell',host).forEach(c=>c.onclick=()=>{
      if(found)return;const k=c.dataset.k;
      if(vis.has(k)){err++;ctx.say(false,'ช่องนี้ตรวจแล้ว');ctx.fb('hint','ช่องนี้ตรวจแล้ว ไปตรวจช่องใหม่ดีกว่า');return}
      vis.add(k);beep('click');
      if(k===P.target.join(',')){found=true;draw();ctx.say(true,'เจอแล้ว!');ctx.fb('good','✅ เจอแล้ว! ตรวจ '+vis.size+' ช่อง '+(err?'(ตรวจซ้ำ '+err+' ครั้ง)':'ไม่ตรวจซ้ำเลย'));ctx.done(err)}
      else draw();
    });
  };draw();
};

/* ---- เผื่อยังไม่มีเนื้อหาเฉพาะ ---- */
ACT.fallback=(host,P,ctx,t)=>{
  host.innerHTML=`<p class="big">${esc(t?.mission||'ทำภารกิจตามที่ครูบอก')}</p><label class="note" style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="c" style="width:24px;height:24px"> ฉันทำภารกิจนี้สำเร็จแล้ว</label>`;
  $('#c').onchange=e=>{if(e.target.checked)ctx.done(0)};
};
