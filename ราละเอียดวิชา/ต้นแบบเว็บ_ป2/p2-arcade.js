/* Techno ป.2 · เกมแทรก (สายพานเลื่อนช้า หยุดพักได้) และดวลบอส
   เวลา/ความเร็วมีผลเฉพาะ "พลังเกม" ไม่ตัดคะแนนวิชา · ตอบผิดมีเหตุผล ลองใหม่ได้ */
const ARC={};
const BOSS_FR={idle:0,guard:3,punch:4,orb:6,claw:7,hurt:8};
const frameXY=f=>`${(f%3)*50}% ${Math.floor(f/3)*50}%`;

ARC.game=(host,P,ctx)=>{
  const R=P.rounds||[];let k=0,paused=false,top=0,first=0,fast=0,miss=0,tries=0,raf=0,last=0,stop=false;
  const DUR=P.sec||16;
  if(!R.length){host.innerHTML='<p class="note">กำลังเตรียมเกม</p>';return ctx.finish({score:ctx.max,energy:5,note:''})}
  const lane=()=>$('.lane',host);
  const round=()=>{
    const r=R[k];tries=0;top=0;
    host.innerHTML=`<div class="hud" style="margin-top:0"><span>${esc(ctx.title)}</span><span class="grow"></span><span>รอบ ${k+1}/${R.length}</span><button class="btn sec sm" id="pz">⏸ พัก</button></div>
      <div class="lane"><div class="goal-line"></div><div class="item card" id="it" style="top:0;min-width:200px">${em(r.item||r.q,r.e||'📦')}</div></div>
      <p class="q" style="margin-top:12px">${esc(r.ask||r.q)}</p><div class="opts">${permFor(r.q+r.o[0],r.o.length).map(x=>`<button class="opt" data-x="${x}">${esc(r.o[x])}</button>`).join('')}</div><div class="fb idle" id="gfb"></div>`;
    $('#pz').onclick=()=>{paused=!paused;$('#pz').textContent=paused?'▶ เล่นต่อ':'⏸ พัก'};
    $$('.opt',host).forEach(b=>b.onclick=()=>pick(b,Number(b.dataset.x),r));
    cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(tick);
  };
  const tick=t=>{
    if(stop)return;const dt=(t-last)/1000;last=t;
    if(!paused){top+=dt/DUR;const L=lane(),it=$('#it',host);
      if(L&&it){const max=L.clientHeight-it.offsetHeight-34;it.style.top=Math.min(top,1)*max+'px'}
      if(top>=1){top=0;miss++;const f=$('#gfb',host);f.className='fb hint';f.textContent='ไม่เป็นไร! ลังกลับไปเริ่มใหม่ ลองตอบอีกที';ctx.mascot?.('hit')}}
    raf=requestAnimationFrame(tick);
  };
  const pick=(b,x,r)=>{
    const f=$('#gfb',host);tries++;
    if(x===r.a){b.classList.add('right');$$('.opt',host).forEach(z=>z.disabled=true);
      if(tries===1){first++;if(top<.6)fast++}
      f.className='fb good';f.textContent='✅ '+(r.why||'ถูกต้อง');beep('ok');Mascot.react(true,'ถูกต้อง!');
      cancelAnimationFrame(raf);
      setTimeout(()=>{k++;if(k>=R.length)end();else round()},1250);
    }else{b.classList.add('wrong');b.disabled=true;f.className='fb bad';f.textContent='💡 '+(r.hint||'ยังไม่ใช่ ลองดูใหม่อีกที');beep('bad');Mascot.react(false,'ลองใหม่!')}
  };
  const end=()=>{
    stop=true;const acc=first/R.length;
    ctx.finish({score:Math.max(Math.ceil(ctx.max*.5),Math.round(ctx.max*acc)),energy:Math.min(10,Math.round(7*acc+3*(fast/R.length))),
      note:`ตอบถูกตั้งแต่ครั้งแรก ${first} จาก ${R.length} รอบ${miss?` · ลังหลุดไป ${miss} ครั้ง ไม่เป็นไร`:''}`});
  };
  round();
};

ARC.boss=(host,P,ctx)=>{
  const R=P.rounds||[],need=P.need||Math.ceil(R.length*.66);
  let k=0,hits=0,lives=3,shield=true,done=false;
  const bossImg=ASSETS['boss0'+ctx.n];
  if(!R.length){return ctx.done({won:true,energy:10,hits:1,total:1})}
  const arena=(frame,say)=>`<div class="arena"><div class="hp"><span>👾 ${esc(P.name||'บอส')}</span><div class="bar-p"><i style="width:${Math.max(0,100-hits/R.length*100)}%"></i></div><span>ยาน ${'❤️'.repeat(lives)}${'🖤'.repeat(3-lives)}</span></div>
    <div class="say" style="${say?'':'display:none'}">${esc(say||'')}</div><div class="boss-s" id="bs" style="background-image:url(${bossImg});background-position:${frameXY(frame)}"></div>
    <img class="craft" id="cf" src="${ASSETS['P2-TS-01-idle']}" alt=""><img class="bolt" id="bolt" src="${ASSETS['P2-FX-02-bolt']}" alt=""></div>`;
  const draw=(frame=BOSS_FR.idle,say='',craft='P2-TS-01-idle')=>{
    const r=R[k];
    host.innerHTML=arena(frame,say)+`<div class="hud" style="margin-top:12px"><span>ด่านบอส ${k+1}/${R.length}</span><span class="grow"></span><button class="btn sec sm" id="sh" ${shield?'':'disabled'}>🛡️ ใช้โล่ (ตัดตัวเลือกผิด 1 ข้อ)</button></div>
      <p class="q">${esc(r.q)}</p><div class="opts">${permFor(r.q+r.o[0],r.o.length).map(x=>`<button class="opt" data-x="${x}">${esc(r.o[x])}</button>`).join('')}</div><div class="fb idle" id="bfb"></div>`;
    $('#cf').src=ASSETS[craft];
    $('#sh').onclick=()=>{if(!shield)return;shield=false;const wrong=[...$$('.opt',host)].filter(b=>Number(b.dataset.x)!==r.a&&!b.disabled);const w=wrong[Math.floor(Math.random()*wrong.length)];w&&(w.disabled=true,w.style.opacity='.35');$('#cf').src=ASSETS['P2-TS-06-shield'];$('#sh').disabled=true;beep('click')};
    $$('.opt',host).forEach(b=>b.onclick=()=>answer(b,Number(b.dataset.x),r));
  };
  const first=new Set();
  const answer=(b,x,r)=>{
    const f=$('#bfb'),bs=$('#bs'),cf=$('#cf'),bolt=$('#bolt');
    if(x===r.a){
      if(!first.has('x'+k+'w'))first.add('k'+k);
      hits++;b.classList.add('right');$$('.opt',host).forEach(z=>z.disabled=true);f.className='fb good';f.textContent='✅ '+(r.why||'ถูกต้อง');beep('ok');
      cf.src=ASSETS['P2-TS-07-tag-shot'];bolt.style.cssText='opacity:1;left:22%;bottom:30%;transition:left .45s linear,bottom .45s linear';requestAnimationFrame(()=>{bolt.style.left='68%';bolt.style.bottom='34%'});
      setTimeout(()=>{bolt.style.opacity=0;bs.style.backgroundPosition=frameXY(BOSS_FR.hurt);bs.classList.add('hurt');beep('hit');$('.hp .bar-p i',host).style.width=Math.max(0,100-hits/R.length*100)+'%'},450);
      setTimeout(()=>{k++;if(k>=R.length)finish();else draw(BOSS_FR.guard,P.say?.[k%P.say.length]||'')},1500);
    }else{
      first.add('x'+k+'w');lives=Math.max(0,lives-1);b.classList.add('wrong');b.disabled=true;f.className='fb bad';f.textContent='💡 '+(r.hint||'ยังไม่ใช่ ลองคิดอีกที · '+(r.why||''));beep('bad');
      bs.style.backgroundPosition=frameXY(BOSS_FR.punch);cf.src=ASSETS['P2-TS-08-hit'];setTimeout(()=>{bs.style.backgroundPosition=frameXY(BOSS_FR.idle);cf.src=ASSETS['P2-TS-01-idle']},800);
      $('.hp span:last-child',host).textContent='ยาน '+'❤️'.repeat(lives)+'🖤'.repeat(3-lives);
      if(lives===0){lives=3;f.textContent='💡 ยานต้องชาร์จพลังใหม่ ลองตอบข้อนี้อีกครั้งนะ · '+(r.why||'')}
    }
  };
  const finish=()=>{
    const clean=R.filter((_,i)=>!first.has('x'+i+'w')).length;
    done=true;const won=clean>=need;
    ctx.done({won,hits:clean,total:R.length,energy:Math.round(20*clean/R.length)});
  };
  draw(BOSS_FR.pose??BOSS_FR.idle,P.say?.[0]||'ข้าจะขวางทางเอง!');
};
