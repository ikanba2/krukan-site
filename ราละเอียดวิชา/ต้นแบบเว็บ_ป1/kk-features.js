/* ฟีเจอร์เสริม ป.1: คะแนนของฉัน · ผลงานสร้างสรรค์ (ออกแบบแผน/วาดแผนที่) · ส่งออก Excel · ให้ข้อเสนอแนะ
   ไม่แตะตรรกะเส้นทาง 17 ด่านเดิม (ผลงานสร้างสรรค์แยกเป็นหน้าของตัวเอง เปิดจากแผนที่) */
(function(){
  /* ===================== สถิติของผู้เรียนหนึ่งคน (ใช้ทั้งหน้าคะแนนและ Excel) ===================== */
  const MAX_ENERGY=170;
  const allMax=()=>MAX_ENERGY+(typeof ALL_UNITS_DATA!=='undefined'?ALL_UNITS_DATA.filter((_,i)=>i!==1).reduce((a,u)=>a+u.stages*10,0):0);
  function stats(s){
    s=s||blankState();
    const att=s.attempts||[];
    const before=att.find(a=>a.kind==='before');
    const after=att.filter(a=>a.kind==='challenge').at(-1);
    const keys=(typeof unitTaskKeys!=='undefined'?unitTaskKeys:[]);
    const practiceMax=keys.reduce((n,k)=>n+(tasks[k]?tasks[k].cards.length:0),0);
    const practice=keys.reduce((n,k)=>n+Math.max(0,...att.filter(a=>a.activityId===k&&(a.kind==='practice'||a.kind==='challenge')).map(a=>a.points||0)),0);
    const ledger=s.stageScores||{};
    const energy=Object.values(ledger).reduce((n,x)=>n+(x.points||0),0);
    const topic=att.filter(a=>a.kind==='topic-before');
    const games=s.skillGames||[];
    const best=t=>{const g=games.filter(x=>x.type===t);return g.length?Math.max(...g.map(x=>x.points||0)):null};
    const battles=s.battles||[];
    const works=s.works||{},rev=s.teacherReview||{};
    return {
      before:before?before.points:null,beforeMax:before?before.maxPoints:4,
      after:after?after.points:null,afterMax:after?after.maxPoints:4,
      gain:before&&after?after.points-before.points:null,
      topicPts:topic.reduce((n,a)=>n+a.points,0),topicMax:topic.reduce((n,a)=>n+a.maxPoints,0),topicN:topic.length,
      practice,practiceMax,practiceRounds:att.filter(a=>a.kind==='practice').length,
      energy,stagesDone:Object.keys(ledger).length,
      unitsEnergy:(hasUnits()?ALL_UNITS_DATA.map((_,i)=>i+1).filter(n=>n!==2).reduce((a,n)=>a+unitSummary(s,n).energy,0):0),
      unitsDone:(hasUnits()?ALL_UNITS_DATA.map((_,i)=>i+1).filter(n=>n!==2).reduce((a,n)=>a+unitSummary(s,n).done,0):0),
      hints:s.hintCount||0,
      mouseBest:best('mouse'),mouseN:games.filter(x=>x.type==='mouse').length,
      typingBest:best('typing'),typingN:games.filter(x=>x.type==='typing').length,
      bossWon:battles.filter(b=>b.won).length,bossN:battles.length,
      design:works.design||null,draw:works.draw||null,
      designLevel:rev.design?.level??null,drawLevel:rev.draw?.level??null,
      message:rev.message||'',reviewer:rev.by||'',
      check:Boolean(s.teacherCheck),explain:Boolean(s.teacherExplain),
      reflection:s.reflection||'',complete:Boolean(s.complete),
      updatedAt:s.updatedAt||''
    };
  }
  /* ผลรายด่าน: ทุกบทเรียนในภารกิจ 2 (17 ด่าน) + โครงรองรับภารกิจอื่นเมื่อเปิดใช้ */
  function stageRows(s){
    s=s||blankState();
    const att=s.attempts||[],games=s.skillGames||[],battles=s.battles||[],ledger=s.stageScores||{};
    return lessonRoute.map((r,i)=>{
      const key='u2-'+(r.task||r.type);
      const pre=att.filter(a=>a.kind==='topic-before'&&a.activityId===key).at(-1)||null;
      let score=null,max=null,detail='';
      if(r.type==='task'){
        const t=tasks[r.task],tries=att.filter(a=>a.activityId===r.task&&['practice','challenge','before'].includes(a.kind));
        if(tries.length){score=Math.max(...tries.map(a=>a.points||0));max=t.cards.length;detail=tries.length+' ครั้ง'}
      }else if(r.type==='mouse'||r.type==='typing'){
        const g=games.filter(x=>x.type===r.type);
        if(g.length){score=Math.max(...g.map(x=>x.points||0));max=8;detail=g.length+' ครั้ง'}
      }else if(r.type==='battle'){
        const b=battles.filter(x=>x.mode!=='preview');
        if(b.length){score=b.reduce((m,x)=>Math.max(m,x.hits||0),0);max=12;detail=b.filter(x=>x.won).length+'/'+b.length+' ชนะ'}
      }
      const e=ledger[i];
      return {i,label:r.label,type:r.type,pre:pre?{p:pre.points,m:pre.maxPoints}:null,score,max,detail,energy:e?e.points:null};
    });
  }
  /* ภารกิจ 1, 3–9 (all-units-v6): ข้อมูลอยู่ที่ state.units.uNN */
  const hasUnits=()=>typeof ALL_UNITS_DATA!=='undefined'&&Array.isArray(ALL_UNITS_DATA);
  function unitSummary(s,n){
    const u=(s&&s.units&&s.units['u'+String(n).padStart(2,'0')])||null,plan=hasUnits()?ALL_UNITS_DATA[n-1]:null;
    const stages=plan?plan.stages:0,sc=u?u.stageScores||{}:{};
    const energy=Object.values(sc).reduce((a,x)=>a+(x.points||0),0);
    const topicPre=u?Object.values(u.topicPre||{}):[];
    return {n,stages,energy,max:stages*10,done:Object.keys(sc).length,pre:u&&u.pre?u.pre.points:null,post:u&&u.post?u.post.points:null,
      topicPts:topicPre.reduce((a,x)=>a+(x.points||0),0),topicN:topicPre.length,topicMax:plan?plan.topics.length:0,
      boss:u&&u.boss?(u.boss.skipped?'ข้าม':u.boss.won?'ชนะ':'ยังไม่ชนะ'):'ยังไม่เล่น',complete:Boolean(u&&u.complete),started:Boolean(u),
      title:plan?plan.missionTitle:'',rows:plan?Array.from({length:stages},(_,i)=>({i,label:(plan.pages.find(p=>p.stage===i+1||p.stageIndex===i)||{}).title||('ด่าน '+(i+1)),energy:sc[i]?sc[i].points:null})):[]};
  }
  const dash=v=>v==null?'—':v;
  function stageTableHTML(s){
    const rows=stageRows(s);
    return `<div class="scroll-table"><table class="kk-stage-table"><thead><tr><th>ด่าน</th><th>ทดสอบก่อนเรียน</th><th>ฝึก / เกม</th><th>พลัง</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.energy?'done':''}"><td><b>${r.i+1}</b> ${esc(r.label)}</td><td>${r.pre?r.pre.p+' / '+r.pre.m:'—'}</td><td>${r.score==null?'—':r.score+' / '+r.max}${r.detail?'<small>'+esc(r.detail)+'</small>':''}</td><td>${r.energy==null?'—':r.energy+' / 10'}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function unitBlock(s,n){
    if(!hasUnits())return `<div class="kk-mission locked"><span>ภารกิจ ${n} · ${esc(missions[n-1])}</span><b>🔒 เร็ว ๆ นี้</b></div>`;
    const u=unitSummary(s,n);
    const stageLabel=(i)=>{try{return u6StageLabel(n,i)}catch(e){return 'ด่าน '+(i+1)}};
    const kind=(i)=>{try{return u6StageKind(n,i)}catch(e){return ''}};
    const KN={'unit-pre':'ทดสอบก่อนบท','story':'เรื่องราว','topic':'เรียนรู้ + ฝึก','real':'งานจริง','unit-post':'ทดสอบหลังบท','reflect':'สะท้อนคิด','boss':'บอส','summary':'สรุป'};
    const sc=((s.units||{})['u'+String(n).padStart(2,'0')]||{}).stageScores||{};
    return `<details class="kk-mission"><summary><span>ภารกิจ ${n} · ${esc(missions[n-1])}</span><b>${u.energy} / ${u.max} พลัง</b></summary>
      <p class="kk-unit-line">ก่อนบท ${u.pre==null?'—':u.pre+' / 4'} · หลังบท ${u.post==null?'—':u.post+' / 4'} · ทดสอบรายเรื่อง ${u.topicN?u.topicPts+' / '+u.topicMax:'—'} · บอส ${u.boss}</p>
      <div class="scroll-table"><table class="kk-stage-table"><thead><tr><th>ด่าน</th><th>ประเภท</th><th>พลัง</th></tr></thead><tbody>${Array.from({length:u.stages},(_,i)=>`<tr class="${sc[i]?'done':''}"><td><b>${i+1}</b> ${esc(stageLabel(i))}</td><td>${KN[kind(i)]||''}</td><td>${sc[i]?sc[i].points+' / 10':'—'}</td></tr>`).join('')}</tbody></table></div></details>`;
  }
  function missionsHTML(s,x){
    return `<h3>คะแนนทุกบทเรียน แยกตามภารกิจ</h3><div class="kk-missions">${CURRICULUM.units.map((u,i)=>i===1
      ?`<details class="kk-mission open" open><summary><span>ภารกิจ 2 · ${esc(missions[1])}</span><b>${x.energy} / ${MAX_ENERGY} พลัง</b></summary>${stageTableHTML(s)}</details>`
      :unitBlock(s,i+1)).join('')}</div>`;
  }
  const LEVELS=['0 · ยังไม่เห็นลำดับ','1 · ทำได้เมื่อมีคนช่วย','2 · ทำได้เอง','3 · ทำได้เองและเล่าเหตุผลได้'];
  const MESSAGES=['','⭐ เก่งมาก ลำดับถูกต้อง','🌟 ลองดูขั้นที่ 2 อีกครั้งนะ','💪 พยายามดีมาก ครั้งหน้าลองเล่าเหตุผลด้วย','🎉 ไอเดียสร้างสรรค์มาก'];
  const stars=n=>n==null?'—':'⭐'.repeat(n)+'☆'.repeat(Math.max(0,3-n));

  /* ===================== คะแนนของฉัน (หน้าผู้เรียน) ===================== */
  function myScoreHTML(){
    const x=stats(state),guest=currentRider?.guest;
    const row=(k,v)=>`<div class="kk-row"><span>${k}</span><b>${v}</b></div>`;
    return `<div class="kk-score">
      <div class="kk-tiles">
        <div class="kk-tile t1"><span>⭐</span><b>${x.energy+x.unitsEnergy}</b><small>/ ${allMax()} พลัง</small></div>
        <div class="kk-tile t2"><span>📝</span><b>${x.practice}</b><small>/ ${x.practiceMax} คะแนนฝึก (ภารกิจ 2)</small></div>
        <div class="kk-tile t3"><span>🚀</span><b>${x.before==null?'—':x.before}→${x.after==null?'—':x.after}</b><small>ก่อน → หลังเรียน (เต็ม 4)</small></div>
      </div>
      ${x.gain!=null?`<p class="kk-gain">${x.gain>0?'🎉 เก่งขึ้น '+x.gain+' คะแนน!':x.gain===0?'💪 ได้เท่าเดิม ลองฝึกอีกนะ':'🌱 ลองฝึกเพิ่มอีกนิดนะ'}</p>`:''}
      <div class="kk-rows">
        ${row('ด่านที่ได้พลัง (ภารกิจ 2)',x.stagesDone+' / 17 ด่าน')}
        ${row('ทดสอบก่อนรายเรื่อง (ภารกิจ 2)',x.topicN?x.topicPts+' / '+x.topicMax:'ยังไม่ได้ทำ')}
        ${row('ฝึกเมาส์ (ดีที่สุด)',x.mouseBest==null?'ยังไม่ได้เล่น':x.mouseBest+' / 8')}
        ${row('ฝึกกดแป้น (ดีที่สุด)',x.typingBest==null?'ยังไม่ได้เล่น':x.typingBest+' / 8')}
        ${row('สู้บอส ชนะ / เล่น',x.bossWon+' / '+x.bossN)}
        ${row('ขอคำใบ้',x.hints+' ครั้ง')}
      </div>
      ${missionsHTML(state,x)}
      <h3>ผลงานของฉัน</h3>
      <div class="kk-rows">
        ${row('ออกแบบแผนของฉัน',x.design?'ส่งแล้ว ✓ '+stars(x.designLevel):'ยังไม่ได้ทำ')}
        ${row('วาดแผนที่กู้ดาว',x.draw?'ส่งแล้ว ✓ '+stars(x.drawLevel):'ยังไม่ได้ทำ')}
      </div>
      ${x.message?`<div class="kk-teacher-msg"><small>ครูบอกว่า</small><b>${esc(x.message)}</b></div>`:''}
      ${guest?'<p class="small muted">ผู้เข้าชม · ผลอยู่ในรอบนี้เท่านั้น</p>':''}
      <div class="play-actions"><button class="secondary" id="kk-open-works">ไปที่ผลงานของฉัน</button><button class="primary" id="kk-close-score">ปิด</button></div>
    </div>`;
  }
  function showMyScore(){
    modal({title:'คะแนนของฉัน',body:myScoreHTML()});
    $('#kk-close-score').onclick=closeModal;
    $('#kk-open-works').onclick=()=>{closeModal();openWorks()};
  }

  /* ===================== ผลงานสร้างสรรค์ ===================== */
  const GOALS=[
    {id:'school',emoji:'🎒',title:'เตรียมไปโรงเรียน',chain:['socks','shoe','tie'],pool:[['socks','ใส่ถุงเท้า'],['shoe','ใส่รองเท้า'],['tie','ผูกเชือก'],['book','ใส่หนังสือ'],['pencil','ใส่ดินสอ'],['carry','ถือกระเป๋า']]},
    {id:'plant',emoji:'🌱',title:'ปลูกต้นไม้',chain:['soil','hole','seed','water'],pool:[['soil','ใส่ดิน'],['hole','ทำหลุม'],['seed','วางเมล็ด'],['water','รดน้ำ'],['flower','ดอกไม้บาน'],['leaf','ใบใหม่งอก']]},
    {id:'wash',emoji:'🧼',title:'ล้างมือ',chain:['wet','soap','rinse','towel'],pool:[['wet','ทำมือเปียก'],['soap','ถูสบู่'],['wash','ถูให้ทั่ว'],['rinse','ล้างออก'],['towel','เช็ดมือ'],['water','เปิดน้ำ']]}
  ];
  const STICKERS=['🚀','⭐','🐱','🌈','🦄','🤖'];
  let dz=null; // สถานะกำลังออกแบบ

  function worksHTML(){
    const x=stats(state);
    const card=(id,emoji,title,desc,done,level)=>`<button class="kk-work-card ${done?'done':''}" id="${id}"><span class="kk-work-ico">${emoji}</span><span><b>${title}</b><small>${desc}</small></span><span class="kk-work-state">${done?'ส่งแล้ว ✓<br>'+stars(level):'ยังไม่ได้ทำ'}</span></button>`;
    return `<div class="lesson-top"><button class="quiet" id="kk-back">แผนที่</button><span class="step-caption">ผลงานของฉัน</span></div>
      <div class="lesson-heading"><div><div class="eyebrow">สร้างด้วยตัวเอง</div><h1>ผลงานของฉัน</h1></div></div>
      <section class="playfield kk-works">
        <p class="child-instruction">เลือกงานที่อยากทำ · ทำซ้ำเพื่อเปลี่ยนงานได้</p>
        <div class="kk-work-grid">
          ${card('kk-go-design','🧩','ออกแบบแผนของฉัน','เลือกภาพมาเรียงเป็นแผนของเราเอง',Boolean(x.design),x.designLevel)}
          ${card('kk-go-draw','🖍️','วาดแผนที่กู้ดาว','ใช้เมาส์วาดทางไปดาวสายฟ้า',Boolean(x.draw),x.drawLevel)}
        </div>
        ${x.message?`<div class="kk-teacher-msg"><small>ครูบอกว่า</small><b>${esc(x.message)}</b></div>`:''}
        ${currentRider?.guest?'<p class="small muted">ผู้เข้าชม · ผลงานอยู่ในรอบนี้เท่านั้น</p>':''}
      </section>${footer()}`;
  }
  function frame(){lessonOpen=false;stopBattle();stopSkillGame();globalThis.speechSynthesis?.cancel?.();$('#app').classList.remove('battle-mode','preview-mode')}
  function openWorks(){
    if(!currentRider)return renderLogin();
    frame();$('#app').innerHTML=worksHTML();
    $('#kk-back').onclick=renderMap;
    $('#kk-go-design').onclick=()=>openDesign();
    $('#kk-go-draw').onclick=()=>openDraw();
    window.scrollTo(0,0);
  }

  /* ---------- ออกแบบแผน ---------- */
  function openDesign(){
    const old=state.works?.design;
    const g=old?GOALS.find(x=>x.id===old.goal):null;
    dz={goal:g?.id||'',order:old?old.cards.map(c=>c.id):[],sticker:old?.sticker||'🚀',saved:false};
    renderDesign();window.scrollTo(0,0);
  }
  function renderDesign(){
    frame();
    const g=GOALS.find(x=>x.id===dz.goal);
    let body;
    if(!g){
      body=`<h2>เลือกเป้าหมายของแผน</h2><p class="child-instruction">อยากวางแผนเรื่องอะไร?</p>
        <div class="kk-work-grid">${GOALS.map(x=>`<button class="kk-work-card" data-goal="${x.id}"><span class="kk-work-ico">${x.emoji}</span><span><b>${x.title}</b><small>เลือกภาพ 3–5 ใบ มาเรียงเอง</small></span></button>`).join('')}</div>`;
    }else{
      const label=id=>g.pool.find(c=>c[0]===id)?.[1]||id;
      const n=dz.order.length,ok=n>=3;
      body=`<h2>${g.emoji} ${g.title}</h2><p class="child-instruction">เลือกภาพ 3–5 ใบ แล้วเรียงเป็นแผนของเรา</p>
        <div class="order-slots" style="--cards:5">${Array.from({length:5},(_,i)=>{const id=dz.order[i];return `<button class="slot ${id?'filled':''}" data-slot="${i}" aria-label="ช่อง ${i+1}${id?' '+label(id)+' เอาออก':''}"><span class="num">${i+1}</span>${id?art(id,'','card-art')+`<span class="card-title">${esc(label(id))}</span>`:'<span class="empty-slot">＋</span>'}</button>`}).join('')}</div>
        <p class="bank-label">เลือกภาพ</p>
        <div class="bank" style="--cards:6">${g.pool.map(([id,l])=>{const used=dz.order.includes(id);return `<button class="choice ${used?'used':''}" data-card="${id}" ${used||n>=5?'disabled':''} aria-label="เลือก ${l}">${art(id,'','card-art')}<span class="card-title">${esc(l)}</span></button>`}).join('')}</div>
        <p class="bank-label">เลือกสติกเกอร์ให้แผนของเรา</p>
        <div class="kk-stickers">${STICKERS.map(s=>`<button type="button" class="kk-sticker ${s===dz.sticker?'on':''}" data-sticker="${s}" aria-pressed="${s===dz.sticker}">${s}</button>`).join('')}</div>
        ${dz.saved?`<div class="feedback good" role="status"><strong>เก็บแผนของเราแล้ว!</strong><p>ลองเล่าให้เพื่อนหรือครูฟังนะ ว่าทำไมเรียงแบบนี้</p></div>`:''}
        <div class="play-actions"><button class="secondary" id="kk-clear">↻ เริ่มใหม่</button><button class="secondary" id="kk-change-goal">เปลี่ยนเป้าหมาย</button><button class="primary" id="kk-save-design" ${ok?'':'disabled'}>⭐ เก็บแผนของฉัน</button></div>`;
    }
    $('#app').innerHTML=`<div class="lesson-top"><button class="quiet" id="kk-back">ผลงานของฉัน</button><span class="step-caption">ออกแบบเอง</span></div>
      <div class="lesson-heading"><div><div class="eyebrow">สร้างด้วยตัวเอง</div><h1>ออกแบบแผนของฉัน</h1></div><button class="secondary" id="kk-listen">🔊 ฟัง</button></div>
      <section class="playfield kk-design">${body}</section>${footer()}`;
    $('#kk-back').onclick=openWorks;
    $('#kk-listen').onclick=()=>speakInstruction('ออกแบบแผนของฉัน. เลือกภาพ สามถึงห้าใบ แล้วเรียงเป็นแผนของเรา');
    document.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{dz.goal=b.dataset.goal;dz.order=[];dz.saved=false;renderDesign()});
    if(!g)return;
    document.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{if(dz.order.length<5){dz.order.push(b.dataset.card);dz.saved=false;renderDesign()}});
    document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.slot);if(dz.order[i]){dz.order.splice(i,1);dz.saved=false;renderDesign()}});
    document.querySelectorAll('[data-sticker]').forEach(b=>b.onclick=()=>{dz.sticker=b.dataset.sticker;dz.saved=false;renderDesign()});
    $('#kk-clear').onclick=()=>{dz.order=[];dz.saved=false;renderDesign()};
    $('#kk-change-goal').onclick=()=>{dz.goal='';dz.order=[];dz.saved=false;renderDesign()};
    $('#kk-save-design').onclick=()=>{
      // ตรวจเบา ๆ: ภาพที่อยู่ในสายลำดับหลักต้องเรียงจากน้อยไปมาก (ใช้เป็นข้อมูลให้ครู ไม่ตัดสินแทนครู)
      const idx=dz.order.map(id=>g.chain.indexOf(id)).filter(i=>i>=0);
      const reasonable=idx.every((v,i)=>i===0||v>idx[i-1]);
      state.works=state.works||{};
      state.works.design={goal:g.id,goalTitle:g.title,sticker:dz.sticker,cards:dz.order.map(id=>({id,label:g.pool.find(c=>c[0]===id)[1]})),reasonable,at:new Date().toISOString()};
      persist();dz.saved=true;renderDesign();toast('เก็บแผนของเราแล้ว ⭐');
    };
  }

  /* ---------- วาดแผนที่กู้ดาว ---------- */
  const COLORS=['#ffd23f','#ff5fa2','#3ee0b0','#5ca9ff','#ffffff','#ff9f43'];
  const STAMPS=['⭐','🪐','🚀','👾','⚡','🏁','➡️'];
  function openDraw(){
    frame();
    $('#app').innerHTML=`<div class="lesson-top"><button class="quiet" id="kk-back">ผลงานของฉัน</button><span class="step-caption">วาดเอง</span></div>
      <div class="lesson-heading"><div><div class="eyebrow">สร้างด้วยตัวเอง</div><h1>วาดแผนที่กู้ดาว</h1></div><button class="secondary" id="kk-listen">🔊 ฟัง</button></div>
      <section class="playfield kk-draw">
        <p class="child-instruction">วาดทางจาก 🏁 ไปถึงดาวสายฟ้า · แตะแสตมป์แล้วแตะบนภาพ</p>
        <div class="kk-tools">
          <div class="kk-tool-group" role="group" aria-label="สี">${COLORS.map((c,i)=>`<button type="button" class="kk-color ${i===0?'on':''}" data-color="${c}" style="--c:${c}" aria-label="สี ${i+1}"></button>`).join('')}</div>
          <div class="kk-tool-group" role="group" aria-label="ขนาดพู่กัน"><button type="button" class="kk-size" data-size="4" aria-label="เส้นเล็ก"><i style="--s:4px"></i></button><button type="button" class="kk-size on" data-size="9" aria-label="เส้นกลาง"><i style="--s:9px"></i></button><button type="button" class="kk-size" data-size="16" aria-label="เส้นใหญ่"><i style="--s:16px"></i></button></div>
          <div class="kk-tool-group" role="group" aria-label="แสตมป์">${STAMPS.map(s=>`<button type="button" class="kk-stamp" data-stamp="${s}" aria-label="แสตมป์ ${s}">${s}</button>`).join('')}</div>
          <div class="kk-tool-group"><button type="button" class="secondary" id="kk-undo">↶ ย้อน</button><button type="button" class="secondary" id="kk-wipe">ลบทั้งหมด</button></div>
        </div>
        <canvas id="kk-canvas" width="720" height="420" aria-label="กระดานวาดแผนที่"></canvas>
        <div class="play-actions"><span class="small muted" id="kk-draw-note">เมาส์หรือนิ้ววาดได้</span><button class="primary" id="kk-save-draw">⭐ เก็บผลงานของฉัน</button></div>
      </section>${footer()}`;
    $('#kk-back').onclick=openWorks;
    $('#kk-listen').onclick=()=>speakInstruction('วาดแผนที่กู้ดาว. วาดทางจากธงไปถึงดาวสายฟ้า');
    const cv=$('#kk-canvas'),ctx=cv.getContext('2d');
    let color=COLORS[0],size=9,stamp='',drawing=false,last=null,history=[],dirty=false;
    function base(){
      const g=ctx.createLinearGradient(0,0,0,cv.height);g.addColorStop(0,'#2c2b9a');g.addColorStop(1,'#5a3fc9');
      ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle='rgba(255,255,255,.85)';
      for(let i=0;i<70;i++){const x=(i*173)%cv.width,y=(i*97)%cv.height;ctx.fillRect(x,y,i%5===0?3:2,i%5===0?3:2)}
      ctx.font='56px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';
      ctx.fillText('🏁',70,cv.height-70);ctx.fillText('🪐',cv.width-80,80);
      ctx.font='700 20px Kanit,Tahoma,sans-serif';ctx.fillStyle='#fff';ctx.fillText('เริ่ม',70,cv.height-24);ctx.fillText('ดาวสายฟ้า',cv.width-80,30);
    }
    function snapshot(){history.push(ctx.getImageData(0,0,cv.width,cv.height));if(history.length>25)history.shift()}
    function restore(){
      const d=state.works?.draw?.img;
      if(!d){base();return}
      const img=new Image();img.onload=()=>{ctx.drawImage(img,0,0,cv.width,cv.height)};img.onerror=base;img.src=d;
    }
    function pos(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}}
    cv.addEventListener('pointerdown',e=>{
      e.preventDefault();cv.setPointerCapture?.(e.pointerId);snapshot();dirty=true;const p=pos(e);
      if(stamp){ctx.font='54px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(stamp,p.x,p.y);return}
      drawing=true;last=p;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,size/2,0,Math.PI*2);ctx.fill();
    });
    cv.addEventListener('pointermove',e=>{
      if(!drawing)return;e.preventDefault();const p=pos(e);
      ctx.strokeStyle=color;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;
    });
    const end=()=>{drawing=false;last=null};
    cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);cv.addEventListener('pointerleave',end);
    document.querySelectorAll('.kk-color').forEach(b=>b.onclick=()=>{color=b.dataset.color;stamp='';document.querySelectorAll('.kk-color').forEach(c=>c.classList.toggle('on',c===b));document.querySelectorAll('.kk-stamp').forEach(c=>c.classList.remove('on'))});
    document.querySelectorAll('.kk-size').forEach(b=>b.onclick=()=>{size=Number(b.dataset.size);stamp='';document.querySelectorAll('.kk-size').forEach(c=>c.classList.toggle('on',c===b));document.querySelectorAll('.kk-stamp').forEach(c=>c.classList.remove('on'))});
    document.querySelectorAll('.kk-stamp').forEach(b=>b.onclick=()=>{stamp=b.dataset.stamp;document.querySelectorAll('.kk-stamp').forEach(c=>c.classList.toggle('on',c===b))});
    $('#kk-undo').onclick=()=>{const h=history.pop();if(h)ctx.putImageData(h,0,0)};
    $('#kk-wipe').onclick=()=>{snapshot();base();dirty=true};
    $('#kk-save-draw').onclick=()=>{
      try{
        state.works=state.works||{};
        state.works.draw={img:cv.toDataURL('image/jpeg',.82),at:new Date().toISOString()};
        persist();dirty=false;$('#kk-draw-note').textContent='เก็บผลงานแล้ว ✓ ลองเล่าให้เพื่อนฟังนะ';toast('เก็บผลงานแล้ว ⭐');
      }catch(e){toast('เก็บไม่ได้ ลองใหม่อีกครั้ง')}
    };
    restore();window.scrollTo(0,0);
  }

  /* ===================== ส่วนของครู: Excel / CSV / แกลเลอรีผลงาน ===================== */
  function yearRows(year){
    const y=schoolDB.years[year];
    return y.roster.map(r=>{
      const s=currentRider?.enrollmentId===r.enrollmentId?state:StudentRepository.load(r.id,year);
      return {r,s,x:stats(s)};
    });
  }
  const HEAD=['เลขที่','ชื่อ-สกุล','สถานะ','ก่อนเรียน (คะแนน)','ก่อนเรียน (เต็ม)','หลังเรียน (คะแนน)','หลังเรียน (เต็ม)','พัฒนาการ (หลัง−ก่อน)',
    'ทดสอบก่อนรายเรื่อง (คะแนน)','ทดสอบก่อนรายเรื่อง (เต็ม)','จำนวนเรื่องที่ทำ','คะแนนฝึกรวม','คะแนนฝึกเต็ม','รอบฝึก','พลังสะสม','พลังเต็ม','ด่านที่ได้พลัง',
    'ขอคำใบ้ (ครั้ง)','ฝึกเมาส์ ครั้ง','ฝึกเมาส์ ดีที่สุด (เต็ม 8)','ฝึกแป้น ครั้ง','ฝึกแป้น ดีที่สุด (เต็ม 8)','บอส ชนะ','บอส เล่น',
    'ผลงาน: ออกแบบแผน','ผลงาน: วาดแผนที่','ระดับงานออกแบบ (0-3)','ระดับงานวาด (0-3)','ข้อความถึงเด็ก','ครูยืนยัน: ตรวจ/ปรับวิธีได้','ครูยืนยัน: เล่าเหตุผลได้','สะท้อนคิด','อัปเดตล่าสุด'];
  function dataSheet(year){
    return [HEAD].concat(yearRows(year).map(({r,s,x})=>[
      Number(r.id.slice(1)),r.name,r.active?'เรียนอยู่':'พักบัญชี',
      x.before,x.beforeMax,x.after,x.afterMax,x.gain,
      x.topicN?x.topicPts:null,x.topicN?x.topicMax:null,x.topicN,x.practice,x.practiceMax,x.practiceRounds,x.energy,MAX_ENERGY,x.stagesDone,
      x.hints,x.mouseN,x.mouseBest,x.typingN,x.typingBest,x.bossWon,x.bossN,
      x.design?'ส่งแล้ว':'ยังไม่ส่ง',x.draw?'ส่งแล้ว':'ยังไม่ส่ง',x.designLevel,x.drawLevel,x.message,
      x.check?'ใช่':'',x.explain?'ใช่':'',x.reflection,x.updatedAt?String(x.updatedAt).replace('T',' ').slice(0,16):''
    ]));
  }
  function summarySheet(year){
    const rows=yearRows(year).filter(o=>o.r.active),xs=rows.map(o=>o.x);
    const avg=a=>{const v=a.filter(n=>n!=null);return v.length?Math.round(v.reduce((s,n)=>s+n,0)/v.length*100)/100:null};
    const played=xs.filter(x=>x.stagesDone>0||x.before!=null||x.design||x.draw).length;
    const both=xs.filter(x=>x.before!=null&&x.after!=null);
    return [
      ['สรุปผลห้องเรียน · ป.1/1 ปีการศึกษา '+year],
      ['หมายเหตุ','ไฟล์นี้มีผลรายบุคคล เก็บเป็นความลับ ห้ามเผยแพร่ ใช้แสดงต่อสาธารณะเฉพาะค่ารวมที่ไม่ระบุตัว (PDPA)'],
      [],
      ['รายการ','ค่า'],
      ['จำนวนนักเรียนทั้งหมด',rows.length],
      ['นักเรียนที่เริ่มใช้งานแล้ว',played],
      ['มีข้อมูลก่อน–หลังครบ',both.length],
      ['คะแนนก่อนเรียนเฉลี่ย (เต็ม 4)',avg(xs.map(x=>x.before))],
      ['คะแนนหลังเรียนเฉลี่ย (เต็ม 4)',avg(xs.map(x=>x.after))],
      ['พัฒนาการเฉลี่ย (หลัง−ก่อน)',avg(both.map(x=>x.gain))],
      ['จำนวนคนที่คะแนนหลังเรียนสูงขึ้น',both.filter(x=>x.gain>0).length],
      ['จำนวนคนที่ได้เท่าเดิม',both.filter(x=>x.gain===0).length],
      ['จำนวนคนที่ต่ำลง',both.filter(x=>x.gain<0).length],
      ['คะแนนฝึกเฉลี่ย (เต็ม '+(xs[0]?xs[0].practiceMax:31)+')',avg(xs.map(x=>x.practice))],
      ['พลังสะสมเฉลี่ย (เต็ม '+MAX_ENERGY+')',avg(xs.map(x=>x.energy))],
      ['ส่งผลงาน: ออกแบบแผน',xs.filter(x=>x.design).length],
      ['ส่งผลงาน: วาดแผนที่',xs.filter(x=>x.draw).length],
      ['ผลงานที่ครูให้ระดับ 2–3 (ออกแบบ)',xs.filter(x=>x.designLevel>=2).length],
      ['ผลงานที่ครูให้ระดับ 2–3 (วาด)',xs.filter(x=>x.drawLevel>=2).length],
      [],
      ['ส่งออกเมื่อ',new Date().toLocaleString('th-TH')]
    ];
  }
  // ---- ตัวเขียน .xlsx แบบไม่ต้องพึ่งไลบรารี (zip แบบ store) ----
  const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
  const crc32=u8=>{let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
  function zipStore(files){
    const enc=new TextEncoder(),chunks=[],central=[];let offset=0;
    const d=new Date(),time=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),date=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
    files.forEach(f=>{
      const name=enc.encode(f.name),data=enc.encode(f.text),crc=crc32(data),size=data.length;
      const lh=new DataView(new ArrayBuffer(30));
      lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,time,true);lh.setUint16(12,date,true);
      lh.setUint32(14,crc,true);lh.setUint32(18,size,true);lh.setUint32(22,size,true);lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
      chunks.push(new Uint8Array(lh.buffer),name,data);
      const ch=new DataView(new ArrayBuffer(46));
      ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,time,true);ch.setUint16(14,date,true);
      ch.setUint32(16,crc,true);ch.setUint32(20,size,true);ch.setUint32(24,size,true);ch.setUint16(28,name.length,true);ch.setUint32(42,offset,true);
      central.push(new Uint8Array(ch.buffer),name);
      offset+=30+name.length+size;
    });
    const cd=central.reduce((n,c)=>n+c.length,0),end=new DataView(new ArrayBuffer(22));
    end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cd,true);end.setUint32(16,offset,true);
    return new Blob([...chunks,...central,new Uint8Array(end.buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  const xml=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const colName=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
  function sheetXML(rows,headerRow){
    const widths=[];
    const body=rows.map((row,ri)=>{
      const cells=row.map((v,ci)=>{
        if(v==null||v==='')return '';
        const ref=colName(ci)+(ri+1),len=String(v).length;
        widths[ci]=Math.max(widths[ci]||8,Math.min(40,len*1.3+2));
        const st=ri===headerRow?' s="1"':'';
        return typeof v==='number'&&isFinite(v)?`<c r="${ref}"${st}><v>${v}</v></c>`:`<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
      }).join('');
      return `<row r="${ri+1}">${cells}</row>`;
    }).join('');
    const cols=widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${(w||8).toFixed(1)}" customWidth="1"/>`).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0">${headerRow===0?'<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>':''}</sheetView></sheetViews><cols>${cols}</cols><sheetData>${body}</sheetData></worksheet>`;
  }
  function buildXlsx(sheets){
    const files=[
      {name:'[Content_Types].xml',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`},
      {name:'_rels/.rels',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`},
      {name:'xl/workbook.xml',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`},
      {name:'xl/_rels/workbook.xml.rels',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`},
      {name:'xl/styles.xml',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Tahoma"/></font><font><b/><sz val="11"/><name val="Tahoma"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFE9A8"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment wrapText="1" vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`}
    ].concat(sheets.map((s,i)=>({name:`xl/worksheets/sheet${i+1}.xml`,text:sheetXML(s.rows,s.header)})));
    return zipStore(files);
  }
  function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)}
  function exportXlsx(year){
    const blob=buildXlsx([{name:'คะแนนรายคน',rows:dataSheet(year),header:0},{name:'ทุกภารกิจ',rows:unitsSheet(year),header:0},{name:'พลังรายด่าน (ภารกิจ 2)',rows:stagesSheet(year),header:0},{name:'รายเรื่อง ทดสอบ-ฝึก',rows:topicsSheet(year),header:0},{name:'สรุปห้อง',rows:summarySheet(year),header:3}]);
    save(blob,`Techno-P1-คะแนนห้อง-ปี${year}.xlsx`);toast('ดาวน์โหลดไฟล์ Excel แล้ว');
  }
  function exportCsv(year){
    const q=v=>{const s=v==null?'':String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
    const text='﻿'+dataSheet(year).map(r=>r.map(q).join(',')).join('\r\n');
    save(new Blob([text],{type:'text/csv;charset=utf-8'}),`Techno-P1-คะแนนห้อง-ปี${year}.csv`);toast('ดาวน์โหลดไฟล์ CSV แล้ว');
  }
  window.kkBuildXlsx=buildXlsx; // ให้ทดสอบจากภายนอกได้

  function showStudentDetail(r){
    const s=currentRider?.enrollmentId===r.enrollmentId?state:StudentRepository.load(r.id,teacherViewYear),x=stats(s);
    const row=(k,v)=>`<div class="kk-row"><span>${k}</span><b>${v}</b></div>`;
    modal({title:`เลขที่ ${r.id.slice(1)} · ${esc(r.name)}`,body:`<div class="kk-tiles">
      <div class="kk-tile t1"><span>⭐</span><b>${x.energy+x.unitsEnergy}</b><small>/ ${allMax()} พลัง</small></div>
      <div class="kk-tile t2"><span>📝</span><b>${x.practice}</b><small>/ ${x.practiceMax} คะแนนฝึก (ภารกิจ 2)</small></div>
      <div class="kk-tile t3"><span>🚀</span><b>${dash(x.before)}→${dash(x.after)}</b><small>ก่อน → หลังเรียน</small></div></div>
      <div class="kk-rows">${row('ทดสอบก่อนรายเรื่อง',x.topicN?x.topicPts+' / '+x.topicMax+' ('+x.topicN+' เรื่อง)':'ยังไม่ได้ทำ')}${row('ขอคำใบ้',x.hints+' ครั้ง')}${row('ฝึกเมาส์ ดีที่สุด',x.mouseBest==null?'—':x.mouseBest+' / 8 ('+x.mouseN+' ครั้ง)')}${row('ฝึกแป้น ดีที่สุด',x.typingBest==null?'—':x.typingBest+' / 8 ('+x.typingN+' ครั้ง)')}${row('สู้บอส ชนะ / เล่น',x.bossWon+' / '+x.bossN)}${row('ผลงานออกแบบ',x.design?'ส่งแล้ว · ระดับ '+dash(x.designLevel):'ยังไม่ส่ง')}${row('ผลงานวาด',x.draw?'ส่งแล้ว · ระดับ '+dash(x.drawLevel):'ยังไม่ส่ง')}</div>
      ${missionsHTML(s,x)}
      <div class="play-actions"><button class="secondary" id="kk-back-dash">กลับหน้าครู</button></div>`});
    $('#kk-back-dash').onclick=teacherDashboard;
  }
  function classUnitsHTML(rows){
    if(!hasUnits())return '';
    const n=rows.length;
    const per=ALL_UNITS_DATA.map((u,i)=>{
      const k=i+1;
      const list=rows.map(o=>k===2?{energy:o.x.energy,done:o.x.stagesDone,post:o.x.after,max:170,stages:17}:Object.assign(unitSummary(o.s,k),{max:u.stages*10}));
      const started=list.filter(a=>a.done>0).length;
      const avg=started?Math.round(list.filter(a=>a.done>0).reduce((a,b)=>a+b.energy,0)/started*10)/10:null;
      const fin=list.filter(a=>a.stages&&a.done>=a.stages).length;
      return {k,title:missions[i],stages:k===2?17:u.stages,started,fin,avg,max:k===2?170:u.stages*10};
    });
    return `<h3>ภาพรวมรายภารกิจ</h3><div class="scroll-table"><table class="kk-stage-table"><thead><tr><th>ภารกิจ</th><th>เริ่มแล้ว</th><th>ครบทุกด่าน</th><th>พลังเฉลี่ย</th></tr></thead><tbody>${per.map(p=>`<tr><td><b>${p.k}</b> ${esc(p.title)}</td><td>${p.started} / ${n}</td><td>${p.fin} / ${n}</td><td>${p.avg==null?'—':p.avg+' / '+p.max}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function showClassStages(){
    const rows=yearRows(teacherViewYear).filter(o=>o.r.active),n=rows.length;
    const per=lessonRoute.map((r,i)=>{
      const sr=rows.map(o=>stageRows(o.s)[i]);
      const did=sr.filter(a=>a.energy!=null||a.score!=null||a.pre).length;
      const avg=f=>{const v=sr.map(f).filter(a=>a!=null);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10:null};
      return {i,label:r.label,did,energy:avg(a=>a.energy),pre:avg(a=>a.pre?a.pre.p/a.pre.m*100:null),score:avg(a=>a.score!=null?a.score/a.max*100:null)};
    });
    modal({title:`ภาพรวมรายด่านของห้อง · ปี ${esc(teacherViewYear)}`,body:`<div class="note">เฉลี่ยจากนักเรียนที่เข้าเรียนอยู่ ${n} คน (ไม่นับคนที่ยังไม่ได้ทำด่านนั้น) ใช้ดูว่าด่านไหนเด็กทำได้ดีหรือยาก</div>${classUnitsHTML(rows)}<h3>รายด่านของภารกิจ 2</h3>
      <div class="scroll-table"><table class="kk-stage-table"><thead><tr><th>ด่าน</th><th>ทำแล้ว</th><th>พลังเฉลี่ย (/10)</th><th>ทดสอบก่อน (%)</th><th>ฝึก/เกม (%)</th></tr></thead><tbody>${per.map(p=>`<tr><td><b>${p.i+1}</b> ${esc(p.label)}</td><td>${p.did} / ${n}</td><td>${dash(p.energy)}</td><td>${p.pre==null?'—':Math.round(p.pre)}</td><td>${p.score==null?'—':Math.round(p.score)}</td></tr>`).join('')}</tbody></table></div>
      <div class="play-actions"><button class="secondary" id="kk-back-dash">กลับหน้าครู</button></div>`});
    $('#kk-back-dash').onclick=teacherDashboard;
  }
  function unitsSheet(year){
    if(!hasUnits())return [['ยังไม่มีข้อมูลภารกิจอื่น']];
    const head=['เลขที่','ชื่อ-สกุล'];
    ALL_UNITS_DATA.forEach((u,i)=>{const n=i+1,l='ภารกิจ '+n+' '+missions[i];head.push(l+' · พลัง (เต็ม '+(n===2?170:u.stages*10)+')',l+' · ด่านที่ทำ (จาก '+u.stages+')',l+' · ทดสอบก่อนบท (เต็ม 4)',l+' · ทดสอบหลังบท (เต็ม 4)',l+' · ทดสอบรายเรื่อง',l+' · บอส')});
    head.push('พลังรวมทุกภารกิจ','พลังเต็มรวม');
    const data=yearRows(year).map(({r,s,x})=>{
      const row=[Number(r.id.slice(1)),r.name];let sum=0;
      ALL_UNITS_DATA.forEach((u,i)=>{
        const n=i+1;
        if(n===2){row.push(x.energy,x.stagesDone,x.before,x.after,x.topicN?x.topicPts+'/'+x.topicMax:null,x.bossN?(x.bossWon?'ชนะ':'ยังไม่ชนะ'):null);sum+=x.energy}
        else{const a=unitSummary(s,n);row.push(a.energy,a.done,a.pre,a.post,a.topicN?a.topicPts+'/'+a.topicMax:null,a.started?a.boss:null);sum+=a.energy}
      });
      row.push(sum,allMax());return row;
    });
    return [head,...data];
  }
  function stagesSheet(year){
    const names=lessonRoute.map((r,i)=>(i+1)+' '+r.label);
    const head=['เลขที่','ชื่อ-สกุล',...names.map(n=>n+' · พลัง (เต็ม 10)'),'พลังรวม (เต็ม 170)'];
    const data=yearRows(year).map(({r,s,x})=>{const st=stageRows(s);return [Number(r.id.slice(1)),r.name,...st.map(a=>a.energy),x.energy]});
    return [head,...data];
  }
  function topicsSheet(year){
    const idx=lessonRoute.map((r,i)=>i).filter(i=>{const r=lessonRoute[i];return topicData[r.task||r.type]});
    const head=['เลขที่','ชื่อ-สกุล'];
    idx.forEach(i=>{const l=(i+1)+' '+lessonRoute[i].label;head.push(l+' · ทดสอบก่อน (คะแนน)',l+' · ทดสอบก่อน (เต็ม)',l+' · ฝึก/เกมดีที่สุด',l+' · ฝึก/เกม (เต็ม)',l+' · จำนวนครั้ง')});
    const data=yearRows(year).map(({r,s})=>{const st=stageRows(s),row=[Number(r.id.slice(1)),r.name];idx.forEach(i=>{const a=st[i];row.push(a.pre?a.pre.p:null,a.pre?a.pre.m:null,a.score,a.max,a.detail?parseInt(a.detail):null)});return row});
    return [head,...data];
  }
  // ---- แกลเลอรีผลงาน + ให้ระดับ + ข้อความถึงเด็ก ----
  function saveReview(r,patch){
    const live=currentRider?.enrollmentId===r.enrollmentId,s=live?state:StudentRepository.load(r.id,teacherViewYear);
    s.teacherReview=Object.assign({},s.teacherReview,patch,{by:staffSession?.name||'ครู',at:new Date().toISOString()});
    if(live){persist();return}
    localStorage.setItem(RESULT_KEY+r.enrollmentId,JSON.stringify({...s,studentId:r.studentId,enrollmentId:r.enrollmentId,riderCode:r.id,academicYear:teacherViewYear,updatedAt:new Date().toISOString()}));
  }
  /* งานจริงของภารกิจ 1, 3–9 ที่เด็กกดว่าทำแล้ว รอครูยืนยันก่อนได้ครบ 10 พลัง */
  function pendingReal(s){
    const out=[];
    if(!s||!s.units||!hasUnits())return out;
    Object.keys(s.units).forEach(key=>{
      const u=s.units[key],n=Number(key.slice(1));
      Object.entries(u.realConfirm||{}).forEach(([stage,v])=>out.push({n,stage:Number(stage),confirmed:Boolean(v.confirmed),key}));
    });
    return out;
  }
  function artifactOf(s){
    const u9=s&&s.units&&s.units.u09;
    return u9&&u9.artifact&&u9.artifact.image?u9.artifact:null;
  }
  function confirmReal(r,item,ok){
    const live=currentRider?.enrollmentId===r.enrollmentId,s=live?state:StudentRepository.load(r.id,teacherViewYear);
    const u=s.units&&s.units[item.key];if(!u)return;
    u.realConfirm[item.stage].confirmed=ok;
    const sc=u.stageScores||(u.stageScores={});
    sc[item.stage]={points:ok?10:5,maxPoints:10,at:new Date().toISOString(),kind:'teacher'};
    if(live){persist();return}
    localStorage.setItem(RESULT_KEY+r.enrollmentId,JSON.stringify({...s,studentId:r.studentId,enrollmentId:r.enrollmentId,riderCode:r.id,academicYear:teacherViewYear,updatedAt:new Date().toISOString()}));
  }
  function showGallery(){
    const rows=yearRows(teacherViewYear).filter(o=>o.r.active);
    const rowsFull=rows;
    const lvl=(id,v)=>`<select id="${id}" aria-label="ระดับ"><option value="">ยังไม่ให้ระดับ</option>${LEVELS.map((l,i)=>`<option value="${i}" ${v===i?'selected':''}>${l}</option>`).join('')}</select>`;
    modal({title:`ผลงานนักเรียน · ปี ${esc(teacherViewYear)}`,body:`<div class="note">ให้ระดับ 0–3 ตามพฤติกรรมในแนวทาง (ไม่ให้คะแนนความสวยงาม) แล้วเลือกข้อความที่เด็กจะเห็นในหน้า “คะแนนของฉัน”</div>
      <div class="kk-gallery">${rows.map((o,i)=>{const {r,x}=o;return `<article class="kk-g-item" data-i="${i}">
        <h3>เลขที่ ${r.id.slice(1)} · ${esc(r.name)}</h3>
        <div class="kk-g-body">
          <div><small>ออกแบบแผน</small>${x.design?`<p>${x.design.sticker} ${esc(x.design.goalTitle)}<br>${x.design.cards.map((c,k)=>(k+1)+'. '+esc(c.label)).join('<br>')}<br><small>${x.design.reasonable?'ลำดับสมเหตุสมผล (ตรวจเบื้องต้น)':'ควรตรวจลำดับ'}</small></p>`:'<p class="muted">ยังไม่ส่ง</p>'}</div>
          <div><small>วาดแผนที่</small>${x.draw?`<img class="kk-g-img" src="${x.draw.img}" alt="ผลงานวาดของเลขที่ ${r.id.slice(1)}">`:'<p class="muted">ยังไม่ส่ง</p>'}</div>
        </div>
        ${(()=>{
          const art=artifactOf(o.s),pend=pendingReal(o.s);
          let h='';
          if(art)h+=`<div class="kk-g-extra"><small>ผลงานภารกิจ 9 · ${esc(art.name||'สถานีของฉัน')}</small><img class="kk-g-img" src="${art.image}" alt="ผลงานภารกิจ 9 ของเลขที่ ${r.id.slice(1)}"></div>`;
          if(pend.length)h+=`<div class="kk-g-extra"><small>งานจริงรอครูยืนยัน</small>${pend.map((q,qi)=>`<label class="kk-confirm"><input type="checkbox" data-real="${i}:${qi}" ${q.confirmed?'checked':''}> ภารกิจ ${q.n} · ด่าน ${q.stage+1} ${esc((()=>{try{return u6StageLabel(q.n,q.stage)}catch(e){return ''}})())}</label>`).join('')}</div>`;
          return h;
        })()}
        <div class="kk-g-form">
          <label>ระดับงานออกแบบ ${lvl('d'+i,x.designLevel)}</label>
          <label>ระดับงานวาด ${lvl('w'+i,x.drawLevel)}</label>
          <label>ข้อความถึงเด็ก <select id="m${i}">${MESSAGES.map(m=>`<option ${m===x.message?'selected':''} value="${esc(m)}">${m||'— ไม่มี —'}</option>`).join('')}</select></label>
          <button class="secondary" data-save="${i}">บันทึก</button>
        </div></article>`}).join('')||'<p>ปีนี้ยังไม่มีรายชื่อ</p>'}</div>`});
    document.querySelectorAll('[data-real]').forEach(c=>c.onchange=()=>{
      const [i,qi]=c.dataset.real.split(':').map(Number),o=rows[i],item=pendingReal(o.s)[qi];
      if(!item)return;confirmReal(o.r,item,c.checked);toast(c.checked?'ยืนยันงานจริงแล้ว +5 พลัง':'ยกเลิกการยืนยัน');
    });
    document.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{
      const i=Number(b.dataset.save),r=rows[i].r,v=id=>{const e=document.getElementById(id);return e&&e.value!==''?Number(e.value):null};
      saveReview(r,{design:{level:v('d'+i)},draw:{level:v('w'+i)},message:document.getElementById('m'+i).value});
      toast('บันทึกให้เลขที่ '+r.id.slice(1)+' แล้ว');
    });
  }
  const baseDashboard=teacherDashboard;
  teacherDashboard=function(){
    baseDashboard();
    const anchor=document.getElementById('export-class');if(!anchor)return;
    anchor.insertAdjacentHTML('beforebegin',`<div class="kk-teacher-actions">
      <button class="primary" id="kk-xlsx">📊 ดาวน์โหลดคะแนนห้อง (Excel)</button>
      <button class="secondary" id="kk-csv">CSV</button>
      <button class="secondary" id="kk-stages">📚 ภาพรวมรายด่านของห้อง</button>
      <button class="secondary" id="kk-gallery">🖼️ ผลงานนักเรียน · ให้ข้อเสนอแนะ</button></div>`);
    $('#kk-stages').onclick=showClassStages;
    const roster=schoolDB.years[teacherViewYear].roster,table=document.querySelector('.teacher-table');
    if(table){
      const trs=[...table.querySelectorAll('tr')];
      trs[0].insertAdjacentHTML('beforeend','<th>รายด่าน</th>');
      trs.slice(1).forEach((tr,i)=>{if(!roster[i])return;tr.insertAdjacentHTML('beforeend',`<td><button class="secondary kk-detail-btn" data-detail="${i}">ดูรายด่าน</button></td>`)});
      table.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>showStudentDetail(roster[Number(b.dataset.detail)]));
    }
    $('#kk-xlsx').onclick=()=>exportXlsx(teacherViewYear);
    $('#kk-csv').onclick=()=>exportCsv(teacherViewYear);
    $('#kk-gallery').onclick=showGallery;
    anchor.textContent='ดาวน์โหลดข้อมูลดิบ (JSON)';anchor.className='secondary';
  };

  /* ===================== แผนที่: การ์ดของฉัน + ขอบเขตสำหรับครู ===================== */
  window.scopeAll=function(){
    modal({title:'ขอบเขต 9 ภารกิจ (สำหรับครู)',body:`<p class="small muted">เปิดเล่นได้ครบทั้ง 9 ภารกิจ</p>${CURRICULUM.units.map((u,i)=>`<h3>ภารกิจ ${i+1} · ${esc(missions[i])}</h3><p class="small">${esc(u.new)} · เทียบคู่มือ สสวท.: ${esc(u.old)}</p><ul>${u.obj.map(o=>'<li>'+esc(o)+'</li>').join('')}</ul><p class="small"><b>ชิ้นงาน:</b> ${esc(u.task)}</p>`).join('')}`});
  };
  function mapExtras(){
    const hero=document.querySelector('.compact-hero');if(!hero||document.querySelector('.kk-me'))return;
    const x=stats(state);
    hero.insertAdjacentHTML('afterend',`<section class="kk-me" aria-label="ของฉัน">
      <div class="kk-me-stat"><span>⭐</span><b>${x.energy+x.unitsEnergy}</b><small>/ ${allMax()} พลัง</small></div>
      <div class="kk-me-stat"><span>📝</span><b>${x.practice}</b><small>/ ${x.practiceMax} คะแนนฝึก (ภารกิจ 2)</small></div>
      <button class="secondary" id="kk-score-btn">📊 คะแนนของฉัน</button>
      <button class="secondary" id="kk-works-btn">🎨 ผลงานของฉัน</button></section>`);
    $('#kk-score-btn').onclick=showMyScore;$('#kk-works-btn').onclick=openWorks;
  }
  const baseMap=renderMap;
  renderMap=function(){const r=baseMap.apply(this,arguments);try{mapExtras()}catch(e){}return r};

  /* ===================== ตอนของด่าน + ข้อความ ===================== */
  const CHAPTERS=[[0,2,'ตอนที่ 1 · เริ่มต้น'],[3,8,'ตอนที่ 2 · ฝึกมือกับเมาส์และแป้น'],[9,11,'ตอนที่ 3 · ใช้ความคิดวางแผน'],[12,14,'ตอนที่ 4 · ทำกับเพื่อนและลองเอง'],[15,16,'ตอนที่ 5 · สู้บอสและรับดาว']];
  const baseLesson=renderLesson;
  renderLesson=function(){
    const r=baseLesson.apply(this,arguments);
    try{
      const ch=CHAPTERS.find(c=>step>=c[0]&&step<=c[1]);
      const cap=document.querySelector('.lesson-top>span');
      if(ch&&cap&&!battlePreview&&!skillStandalone)cap.textContent=ch[2]+' · ด่าน '+(step+1)+' / '+lessonRoute.length;
    }catch(e){}
    return r;
  };

  /* ===================== หน้าล็อกอิน/ต้อนรับ: ท้ายหน้าและทางเข้าครู ===================== */
  function addFooter(){const app=document.getElementById('app');if(app&&!app.querySelector('.kk-credits'))app.insertAdjacentHTML('beforeend',creditsHTML())}
  const baseLogin=renderLogin;renderLogin=function(){const r=baseLogin.apply(this,arguments);try{addFooter()}catch(e){}return r};
  const baseWelcome=renderWelcome;renderWelcome=function(){const r=baseWelcome.apply(this,arguments);try{addFooter()}catch(e){}return r};
})();
