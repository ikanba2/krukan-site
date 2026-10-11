/* เกมฝึกเมาส์ / คีย์บอร์ด (รุ่นท้าทาย): 8 ด่านย่อยที่ต่างกัน ยากขึ้นตามลำดับ
   - เมาส์: คลิกแกน · แกนวิ่ง · แยกสี · เป้าเล็ก · ลากใส่เครื่อง · คลิกตามเลข · แกนแวบ · ฝูงแกนหลบพายุ
   - คีย์บอร์ด: ตัวเดียว · สองตัว · ฝนตัวอักษร · คำลับ · เร็วหน่อย · ห้ามกดสีแดง · จำให้ได้ · บอสคีย์
   คะแนนยังเต็ม 8 (1 คะแนนต่อด่านย่อยที่ผ่าน) เพื่อให้ระบบพลัง/ผลครูทำงานเหมือนเดิม */
let skillGame=null,skillStandalone=false;
const SG_SPEED={slow:1.6,normal:1,fast:.7};
const SG_GEM=[['#ff7ab8','#d6246e'],['#6fd3ff','#2b79ff'],['#7dffb4','#14a860'],['#ffe27a','#ff9f1c']];
const SG_GEM_NAME=['ชมพู','ฟ้า','เขียว','เหลือง'];
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const gemHTML=(c,extra='',style='')=>`<span class="sg-gem" style="--g1:${SG_GEM[c][0]};--g2:${SG_GEM[c][1]};${style}" ${extra}></span>`;

function sgBeep(ok){if(state.soundOff)return;try{sgBeep.ctx=sgBeep.ctx||new (window.AudioContext||window.webkitAudioContext)();const c=sgBeep.ctx;c.resume();const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type=ok?'triangle':'sawtooth';o.frequency.setValueAtTime(ok?660:180,t);if(ok)o.frequency.linearRampToValueAtTime(990,t+.12);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.22)}catch(e){}}
function sgPop(x,y,text,bad){const a=document.getElementById('skill-arena');if(!a)return;const e=document.createElement('span');e.className='sg-pop'+(bad?' bad':'');e.textContent=text;e.style.left=x+'%';e.style.top=y+'%';a.append(e);setTimeout(()=>e.remove(),700)}
function sgShake(){const a=document.getElementById('skill-arena');if(!a)return;a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}

function stopSkillGame(){if(!skillGame)return;cancelAnimationFrame(skillGame.raf);clearTimeout(skillGame.nextTimer);skillGame.running=false;skillGame=null;document.removeEventListener('keydown',skillKey)}

function skillUI(type){
  const mouse=type==='mouse';
  const list=(mouse?MOUSE_ROUNDS:TYPING_ROUNDS).map((r,i)=>`<li><b>${i+1}</b> ${r.icon} ${r.name}</li>`).join('');
  return `<div class="skill-title"><img src="${LEARNING_ASSETS['techno-'+(mouse?'mouse':'keys')]}" alt="Techno"><div><h2>${mouse?'ภารกิจเก็บแกนพลัง':'ภารกิจส่งพลังด้วยแป้น'}</h2><p class="child-instruction">${mouse?'8 ด่านย่อย · ยิ่งไปยิ่งท้าทาย':'8 ด่านย่อย · มองให้ไว กดให้ตรง'}</p></div></div>
  <div class="skill-settings"><label>ความเร็ว <select id="skill-speed"><option value="slow">ช้า · มีเวลาเยอะ</option><option value="normal" selected>ปกติ</option><option value="fast">เร็ว · ท้าทาย</option></select></label>${mouse?'':'<label>ตัวอักษร <select id="skill-alphabet"><option value="en">A S D F</option><option value="th">ก ด ส า</option></select></label>'}</div>
  <div class="skill-hud"><span id="skill-round">ด่าน 0 / 8</span><b id="skill-score">${art('star','','hud-art')} 0</b><span id="skill-time">พร้อมเล่น</span></div>
  <div class="skill-arena sg-arena ${mouse?'':'typing-arena'}" id="skill-arena" tabindex="0"><div class="skill-intro"><span>${art(mouse?'mouse':'keyboard')}</span><p>${mouse?'เลื่อนเมาส์ · คลิกให้โดน · ลากให้ถึง':'มองตัวอักษร · กดแป้นนั้นให้ทัน'}</p><ol class="sg-list">${list}</ol><button class="primary" id="skill-start">▶ เริ่มเล่น</button></div></div>
  ${mouse?'':'<div class="typing-keys" id="typing-keys"></div><p class="small muted">ใช้คีย์บอร์ด หรือแตะปุ่มบนจอได้</p>'}
  <p class="skill-feedback" id="skill-feedback" role="status" aria-live="polite">Techno รอเราอยู่!</p>
  <div class="play-actions"><button class="secondary" id="skill-pause" disabled>Ⅱ พัก</button><button class="primary" id="skill-next">${skillStandalone?'กลับแผนที่':'ไปต่อ →'}</button></div>`;
}

function bindSkillGame(type){
  stopSkillGame();
  skillGame={type,running:false,paused:false,finished:false,round:0,correct:0,wrong:0,timeouts:0,elapsed:0,age:0,last:0,limit:10000,mult:1,cur:null,locked:false,results:[],reactions:[],inputs:{keyboard:0,onscreen:0,pointer:0},raf:null,nextTimer:0};
  $('#skill-start').onclick=startSkillGame;
  $('#skill-next').onclick=()=>{stopSkillGame();skillStandalone?renderMap():nextStep()};
  $('#skill-pause').onclick=()=>{if(skillGame.paused){skillGame.paused=false;skillGame.last=performance.now();$('#skill-pause').textContent='Ⅱ พัก';$('#skill-feedback').textContent='พร้อมแล้ว ไปกันเลย'}else pauseSkillGame()};
  document.addEventListener('keydown',skillKey);
}

function startSkillGame(){
  const g=skillGame;if(!g)return;
  g.running=true;g.mult=SG_SPEED[$('#skill-speed').value]||1;
  g.alphabet=g.type==='typing'&&$('#skill-alphabet').value==='th'?['ก','ด','ส','า']:['A','S','D','F'];
  $('#skill-speed').disabled=true;if($('#skill-alphabet'))$('#skill-alphabet').disabled=true;$('#skill-pause').disabled=false;
  g.startedAt=new Date().toISOString();g.last=performance.now();
  nextSkillRound();
  g.raf=requestAnimationFrame(skillFrame);
  $('#skill-arena').focus({preventScroll:true});
}

function nextSkillRound(){
  const g=skillGame;if(!g)return;
  if(g.round>=8){finishSkillGame();return}
  const def=(g.type==='mouse'?MOUSE_ROUNDS:TYPING_ROUNDS)[g.round];
  g.round++;g.age=0;g.locked=false;g.cur={def,onFrame:null,onKey:null,done:false,hits:0,miss:0};
  g.limit=Math.round(def.time*g.mult);
  const arena=$('#skill-arena');arena.className='skill-arena sg-arena '+(g.type==='typing'?'typing-arena ':'')+'sg-r'+g.round;
  arena.innerHTML=`<div class="sg-banner"><b>${def.icon} ${esc(def.name)}</b><span>${esc(def.hint)}</span></div><div class="sg-field" id="sg-field"></div>`;
  $('#skill-round').textContent=`ด่าน ${g.round} / 8 · ${def.name}`;
  $('#skill-score').innerHTML=art('star','','hud-art')+' '+g.correct;
  $('#skill-time').textContent=Math.ceil(g.limit/1000)+' วิ';
  $('#skill-feedback').textContent=def.hint;
  def.setup(g,$('#sg-field'));
}

/* จบด่านย่อย: ok=true ได้ 1 ดาว แล้วไปด่านถัดไปหลังหน่วงสั้น ๆ ให้เด็กเห็นผล */
function sgFinishRound(ok,why){
  const g=skillGame;if(!g||!g.running||g.locked)return;
  g.locked=true;
  if(ok){g.correct++;g.reactions.push(Math.round(g.age))}else if(why==='time')g.timeouts++;
  g.results.push({round:g.round,name:g.cur.def.name,ok,ms:Math.round(g.age),hits:g.cur.hits,miss:g.cur.miss});
  sgBeep(ok);
  $('#skill-score').innerHTML=art('star','','hud-art')+' '+g.correct;
  $('#skill-feedback').textContent=ok?['เก่งมาก!','ยอดเยี่ยม!','ทำได้แล้ว!','ไวมาก!'][rnd(4)]:(why==='time'?'หมดเวลา · ไม่เป็นไร ลองด่านต่อไป':'ยังไม่ผ่าน · ลองด่านต่อไปนะ');
  const f=$('#sg-field');if(f)f.insertAdjacentHTML('beforeend',`<div class="sg-result ${ok?'ok':'no'}">${ok?'⭐ ผ่าน!':'💪 ลองใหม่ด่านหน้า'}</div>`);
  if(ok&&typeof rewardBurst==='function'&&g.correct===8)rewardBurst(1);
  clearTimeout(g.nextTimer);
  g.nextTimer=setTimeout(()=>{if(skillGame===g&&g.running)nextSkillRound()},ok?750:950);
}

function skillFrame(time){
  const g=skillGame;if(!g||!g.running)return;
  const dt=Math.min(100,Math.max(0,time-g.last));g.last=time;
  if(!g.paused&&!g.locked&&g.cur){
    g.age+=dt;g.elapsed+=dt;
    $('#skill-time').textContent=Math.max(0,Math.ceil((g.limit-g.age)/1000))+' วิ';
    if(g.cur.onFrame)g.cur.onFrame(dt,g.age);
    if(!g.locked&&g.age>=g.limit){const ev=g.cur.def.timeout?g.cur.def.timeout(g):false;sgFinishRound(ev,'time')}
  }
  if(skillGame===g&&g.running)g.raf=requestAnimationFrame(skillFrame);
}

/* ---------- รับค่าจากแป้น/ปุ่มบนจอ ---------- */
function skillInput(value,mode){
  const g=skillGame;if(!g?.running||g.paused||g.locked||g.type!=='typing'||!g.cur?.onKey)return;
  g.inputs[mode]=(g.inputs[mode]||0)+1;
  g.cur.onKey(String(value).toUpperCase(),mode);
}
function skillKey(e){
  const g=skillGame;
  if(!g?.running||g.paused||g.type!=='typing'||$('.modal')||e.target.closest('input,select,textarea')||e.repeat)return;
  if(e.key.length===1&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();skillInput(e.key,'keyboard')}
}
function sgKeyButtons(g){
  const box=$('#typing-keys');if(!box)return;
  box.innerHTML=g.alphabet.map(v=>`<button data-key="${esc(v)}" aria-label="แตะ ${esc(v)}">${esc(v)}</button>`).join('');
  box.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>skillInput(b.dataset.key,'onscreen'));
}
function sgWrong(g,msg){g.wrong++;g.cur.miss++;sgBeep(false);sgShake();$('#skill-feedback').textContent=msg}

/* ============================ เมาส์ ============================ */
function sgCell(i,cols,rows){return {x:(i%cols+.5)*100/cols,y:(Math.floor(i/cols)+.5)*100/rows}}
const MOUSE_ROUNDS=[
 {icon:'🎯',name:'คลิกแกน',hint:'คลิกแกนที่เรืองแสง',time:10000,setup(g,f){
   const t=rnd(9),junk=['rock','leaf','moon'];
   f.innerHTML=`<div class="mouse-grid">${Array.from({length:9},(_,i)=>`<button class="mouse-item ${i===t?'target':''}" data-i="${i}" aria-label="${i===t?'แกนพลัง':'สิ่งอื่น'}">${i===t?art('crystal'):art(junk[i%3])}</button>`).join('')}</div>`;
   f.querySelectorAll('[data-i]').forEach(b=>b.onclick=e=>{if(g.locked||g.paused)return;if(Number(b.dataset.i)===t){g.cur.hits++;g.inputs.pointer++;sgFinishRound(true)}else sgWrong(g,'ดูแกนที่เรืองแสงนะ')});
 }},
 {icon:'🌠',name:'แกนวิ่ง',hint:'แกนกำลังเด้งไปมา · คลิกให้โดน 3 ครั้ง',time:14000,setup(g,f){
   f.innerHTML=`<button class="sg-target sg-mover" id="sg-mover" aria-label="แกนที่วิ่ง">${gemHTML(1,'','--s:64px')}</button><div class="sg-counter" id="sg-count">0 / 3</div>`;
   const m=$('#sg-mover');let x=40,y=40,vx=.032*(rnd(2)?1:-1),vy=.026;
   g.cur.onFrame=dt=>{x+=vx*dt;y+=vy*dt;if(x<6||x>94)vx=-vx;if(y<8||y>90)vy=-vy;x=Math.max(5,Math.min(95,x));y=Math.max(7,Math.min(91,y));m.style.left=x+'%';m.style.top=y+'%'};
   m.onclick=()=>{if(g.locked||g.paused)return;g.cur.hits++;g.inputs.pointer++;sgPop(x,y,'+1');$('#sg-count').textContent=g.cur.hits+' / 3';const s=Math.hypot(vx,vy)*1.18;vx=Math.sign(vx||1)*Math.min(.075,Math.abs(vx)*1.2);vy=Math.sign(vy||1)*Math.min(.06,Math.abs(vy)*1.2);if(g.cur.hits>=3)sgFinishRound(true)};
 }},
 {icon:'🎨',name:'แยกสี',hint:'',time:12000,setup(g,f){
   const want=rnd(4),items=shuffle([want,want,want,...[0,1,2,3].filter(c=>c!==want).flatMap(c=>[c,c]).slice(0,6)]);
   $('#skill-feedback').textContent=`คลิกแกนสี${SG_GEM_NAME[want]}ให้ครบ 3 ดวง`;
   $('.sg-banner span').textContent=`คลิกแกนสี${SG_GEM_NAME[want]}ให้ครบ 3 ดวง`;
   f.innerHTML=`<div class="sg-want">${gemHTML(want,'','--s:44px')} สี${SG_GEM_NAME[want]}</div><div class="mouse-grid sg-gems">${items.map((c,i)=>`<button class="mouse-item" data-c="${c}" aria-label="แกนสี${SG_GEM_NAME[c]}">${gemHTML(c,'','--s:62px')}</button>`).join('')}</div>`;
   f.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{if(g.locked||g.paused||b.disabled)return;if(Number(b.dataset.c)===want){b.disabled=true;b.classList.add('got');g.cur.hits++;g.inputs.pointer++;if(g.cur.hits>=3)sgFinishRound(true)}else sgWrong(g,'สีนี้ไม่ใช่นะ · ดูสีที่ต้องเก็บ')});
 }},
 {icon:'🔍',name:'เป้าเล็ก',hint:'แกนเล็กปนอยู่กับหินเยอะ ๆ',time:11000,setup(g,f){
   const n=20,t=rnd(n);
   f.innerHTML=`<div class="sg-dense">${Array.from({length:n},(_,i)=>`<button class="sg-small ${i===t?'is-target':''}" data-i="${i}" aria-label="${i===t?'แกนพลัง':'หิน'}">${i===t?'💎':['🪨','⭐','🌑'][i%3]}</button>`).join('')}</div>`;
   f.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{if(g.locked||g.paused)return;if(Number(b.dataset.i)===t){g.cur.hits++;g.inputs.pointer++;sgFinishRound(true)}else sgWrong(g,'ยังไม่ใช่ · หาแกน 💎')});
 }},
 {icon:'🧲',name:'ลากใส่เครื่อง',hint:'กดค้าง ลากแกนไปวางในเครื่องพลัง 3 ดวง',time:20000,setup(g,f){
   f.innerHTML=`<div class="sg-machine" id="sg-machine"><span>⚙️</span><small>เครื่องพลัง</small></div>${[0,1,2].map(i=>`<span class="sg-drag" data-d="${i}" style="left:${18+i*26}%;top:70%">${gemHTML([0,1,2][i],'','--s:58px')}</span>`).join('')}<div class="sg-counter" id="sg-count">0 / 3</div>`;
   const field=f,machine=$('#sg-machine');
   f.querySelectorAll('.sg-drag').forEach(el=>{
     let dragging=false,ox=0,oy=0,home={l:el.style.left,t:el.style.top};
     el.addEventListener('pointerdown',e=>{if(g.locked||g.paused)return;e.preventDefault();dragging=true;try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('drag')});
     el.addEventListener('pointermove',e=>{if(!dragging)return;const r=field.getBoundingClientRect();el.style.left=((e.clientX-r.left)/r.width*100)+'%';el.style.top=((e.clientY-r.top)/r.height*100)+'%'});
     const end=e=>{if(!dragging)return;dragging=false;el.classList.remove('drag');const a=el.getBoundingClientRect(),b=machine.getBoundingClientRect();
       const cx=a.left+a.width/2,cy=a.top+a.height/2;
       if(cx>b.left&&cx<b.right&&cy>b.top&&cy<b.bottom){el.remove();g.cur.hits++;g.inputs.pointer++;$('#sg-count').textContent=g.cur.hits+' / 3';machine.classList.add('flash');setTimeout(()=>machine.classList.remove('flash'),250);if(g.cur.hits>=3)sgFinishRound(true)}
       else{el.style.left=home.l;el.style.top=home.t;g.cur.miss++}};
     el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
   });
 }},
 {icon:'🔢',name:'คลิกตามเลข',hint:'คลิกแกนตามลำดับ 1 → 2 → 3 → 4 → 5',time:14000,setup(g,f){
   const spots=shuffle(Array.from({length:12},(_,i)=>sgCell(i,4,3))).slice(0,5);
   f.innerHTML=spots.map((p,i)=>`<button class="sg-target sg-num" data-n="${i+1}" style="left:${p.x}%;top:${p.y}%" aria-label="แกนหมายเลข ${i+1}">${gemHTML(i%4,'','--s:60px')}<b>${i+1}</b></button>`).join('');
   let next=1;
   f.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{if(g.locked||g.paused)return;const n=Number(b.dataset.n);if(n===next){b.classList.add('got');b.disabled=true;g.cur.hits++;g.inputs.pointer++;next++;if(next>5)sgFinishRound(true)}else sgWrong(g,'ต้องคลิกเลข '+next+' ก่อนนะ')});
 }},
 {icon:'⚡',name:'แกนแวบ',hint:'แกนโผล่แล้วหายไว · เก็บให้ได้ 4 จาก 6',time:16000,setup(g,f){
   const total=6,life=Math.round(1700*g.mult);let spawned=0,gone=0,hits=0,lastAt=-9999;
   $('#skill-feedback').textContent='เก็บให้ได้ 4 จาก 6 ดวง';
   f.innerHTML='<div class="sg-counter" id="sg-count">0 / 4</div>';
   g.cur.timeout=null;
   const spawn=()=>{
     const p={x:10+rnd(80),y:16+rnd(70)},el=document.createElement('button');
     el.className='sg-target sg-flash';el.style.left=p.x+'%';el.style.top=p.y+'%';el.innerHTML=gemHTML(spawned%4,'','--s:58px');el.setAttribute('aria-label','แกนที่แวบ');
     f.append(el);spawned++;
     let alive=true;
     const fin=hit=>{if(!alive)return;alive=false;el.remove();gone++;if(hit){hits++;g.cur.hits=hits;g.inputs.pointer++;sgPop(p.x,p.y,'+1');$('#sg-count').textContent=hits+' / 4'}else g.cur.miss++;
       if(hits>=4)sgFinishRound(true);else if(gone>=total)sgFinishRound(hits>=4,'time')};
     el.onclick=()=>{if(!g.locked&&!g.paused)fin(true)};
     el._exp=life;el._fin=fin;
   };
   let sinceSpawn=Infinity;
   g.cur.onFrame=dt=>{
     sinceSpawn+=dt;
     f.querySelectorAll('.sg-flash').forEach(el=>{el._exp-=dt;if(el._exp<=0)el._fin(false)});
     if(spawned<total&&sinceSpawn>=Math.round(1000*g.mult)+300){sinceSpawn=0;spawn()}
   };
 }},
 {icon:'🌪️',name:'ฝูงแกนหลบพายุ',hint:'เก็บแกน 💎 ให้ครบ 5 ดวง · อย่าคลิกพายุ ⚡',time:14000,setup(g,f){
   const n=16,gems=new Set(shuffle([...Array(n).keys()]).slice(0,5)),storms=new Set(shuffle([...Array(n).keys()].filter(i=>!gems.has(i))).slice(0,4));
   let bad=0;
   f.innerHTML=`<div class="sg-dense sg-swarm">${Array.from({length:n},(_,i)=>`<button class="sg-small ${gems.has(i)?'is-gem':storms.has(i)?'is-storm':''}" data-i="${i}" aria-label="${gems.has(i)?'แกน':storms.has(i)?'พายุ':'หิน'}">${gems.has(i)?'💎':storms.has(i)?'⚡':'🪨'}</button>`).join('')}</div><div class="sg-counter" id="sg-count">0 / 5</div>`;
   f.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
     if(g.locked||g.paused||b.disabled)return;const i=Number(b.dataset.i);
     if(gems.has(i)){b.disabled=true;b.classList.add('got');g.cur.hits++;g.inputs.pointer++;$('#sg-count').textContent=g.cur.hits+' / 5';if(g.cur.hits>=5)sgFinishRound(true)}
     else if(storms.has(i)){b.disabled=true;b.classList.add('boom');bad++;sgWrong(g,'โดนพายุ! ('+bad+'/2)');if(bad>=2)sgFinishRound(false,'storm')}
     else{sgWrong(g,'นั่นคือหิน · หาแกน 💎')}
   });
 }}
];

/* ============================ แป้นพิมพ์ ============================ */
function sgLaneX(g,ch){return 12.5+g.alphabet.indexOf(ch)*25}
/* สตรีมตัวอักษรที่ตกลงมา: items=[{ch,at,life,decoy}] ผ่านเมื่อถูกอย่างน้อย need ตัว และไม่โดนตัวหลอกเกิน maxBad */
function sgStream(g,f,items,need,maxBad=1){
  f.innerHTML=`<div class="typing-tracks">${g.alphabet.map(v=>`<div class="typing-lane"><span>${esc(v)}</span></div>`).join('')}</div><div class="hit-line"></div><div class="sg-counter" id="sg-count">0 / ${need}</div>`;
  items.forEach(it=>{it.state='wait';it.el=null});
  let t=0,hits=0,bad=0;
  const doneCheck=()=>{
    if(hits>=need){sgFinishRound(true);return true}
    if(bad>maxBad){sgFinishRound(false,'bad');return true}
    const open=items.filter(i=>!i.decoy&&i.state!=='hit'&&i.state!=='lost').length;
    if(items.every(i=>i.state==='hit'||i.state==='lost'||i.state==='ok')){sgFinishRound(hits>=need,'time');return true}
    if(hits+open<need){sgFinishRound(false,'time');return true}
    return false;
  };
  g.cur.onFrame=dt=>{
    t+=dt;
    items.forEach(it=>{
      if(it.state==='wait'&&t>=it.at){it.state='fall';it.t0=t;const e=document.createElement('div');e.className='falling-key'+(it.decoy?' decoy':'');e.style.left=sgLaneX(g,it.ch)+'%';e.textContent=it.ch;f.append(e);it.el=e}
      if(it.state==='fall'){
        const p=(t-it.t0)/it.life;it.el.style.top=(8+p*66)+'%';
        if(p>=1){it.el.remove();if(it.decoy){it.state='ok'}else{it.state='lost';g.timeouts++;g.cur.miss++}}
      }
    });
    doneCheck();
  };
  g.cur.onKey=(v,mode)=>{
    const live=items.filter(i=>i.state==='fall'&&i.ch.toUpperCase()===v).sort((a,b)=>b.el.offsetTop-a.el.offsetTop)[0];
    if(!live){sgWrong(g,'ยังไม่ถึงตัวนี้ · ดูตัวที่ตกลงมา');return}
    if(live.decoy){live.state='lost';live.el.classList.add('boom');setTimeout(()=>live.el.remove(),250);bad++;g.cur.miss++;sgBeep(false);sgShake();$('#skill-feedback').textContent='นั่นตัวสีแดง · ห้ามกด! ('+bad+'/'+(maxBad+1)+')';doneCheck();return}
    live.state='hit';live.el.classList.add('hit');setTimeout(()=>live.el.remove(),250);hits++;g.cur.hits=hits;
    $('#sg-count').textContent=hits+' / '+need;sgPop(sgLaneX(g,live.ch),70,'+1');
    doneCheck();
  };
}
/* ลำดับที่ต้องพิมพ์ตามลำดับ (แสดงตลอด หรือแสดงสั้น ๆ แล้วซ่อนสำหรับ "จำให้ได้") */
function sgSequence(g,f,seq,hideAfterMs){
  let idx=0;
  const draw=hidden=>{f.innerHTML=`<div class="sg-seq ${hidden?'covered':''}">${seq.map((c,i)=>`<span class="sg-seq-key ${i<idx?'done':''} ${i===idx&&!hidden?'now':''}">${hidden&&i>=idx?'?':esc(c)}</span>`).join('')}</div><p class="sg-seq-note">${hidden?'จำตัวอักษรที่เห็น แล้วพิมพ์ตามลำดับ':'พิมพ์ตามลำดับจากซ้ายไปขวา'}</p>`};
  let hidden=false;draw(false);
  if(hideAfterMs){setTimeout(()=>{if(skillGame===g&&!g.locked){hidden=true;draw(true);$('#skill-feedback').textContent='ตัวอักษรหายแล้ว · พิมพ์ตามที่จำได้'}},hideAfterMs)}
  g.cur.onKey=(v)=>{
    if(v===seq[idx].toUpperCase()){idx++;g.cur.hits=idx;if(idx>=seq.length){draw(false);f.querySelectorAll('.sg-seq-key').forEach(k=>k.classList.add('done'));sgFinishRound(true)}else draw(hidden)}
    else sgWrong(g,'ลองใหม่ · ตัวต่อไปคือ '+(hidden?'(จำให้ได้)':seq[idx]));
  };
}
function sgPick(g,n){return Array.from({length:n},()=>g.alphabet[rnd(4)])}
const TYPING_ROUNDS=[
 {icon:'🔤',name:'ตัวเดียว',hint:'ตัวอักษรตกลงมา · กดให้ตรงก่อนถึงเส้น',time:10000,setup(g,f){sgKeyButtons(g);sgStream(g,f,[{ch:g.alphabet[rnd(4)],at:200,life:Math.round(8500*g.mult)}],1)}},
 {icon:'✌️',name:'สองตัว',hint:'กดสองตัวตามลำดับ',time:12000,setup(g,f){sgKeyButtons(g);let s=sgPick(g,2);sgSequence(g,f,s)}},
 {icon:'🌧️',name:'ฝนตัวอักษร',hint:'มี 4 ตัวตกลงมาทีละตัว · กดให้ทัน 3 ตัว',time:20000,setup(g,f){
   sgKeyButtons(g);const life=Math.round(5200*g.mult);sgStream(g,f,Array.from({length:4},(_,i)=>({ch:g.alphabet[rnd(4)],at:200+i*Math.round(2800*g.mult),life})),3,9)}},
 {icon:'🔐',name:'คำลับ',hint:'พิมพ์รหัสลับ 3 ตัวตามลำดับ',time:16000,setup(g,f){sgKeyButtons(g);sgSequence(g,f,sgPick(g,3))}},
 {icon:'🚀',name:'เร็วหน่อย',hint:'ตัวอักษรตกเร็ว 4 ตัว · กดให้ทันอย่างน้อย 3',time:15000,setup(g,f){
   sgKeyButtons(g);const life=Math.round(3000*g.mult);sgStream(g,f,Array.from({length:4},(_,i)=>({ch:g.alphabet[rnd(4)],at:150+i*Math.round(1500*g.mult),life})),3,9)}},
 {icon:'🚫',name:'ห้ามกดสีแดง',hint:'ตัวสีเขียวกด · ตัวสีแดงห้ามกด รอให้ผ่านไป',time:20000,setup(g,f){
   sgKeyButtons(g);const life=Math.round(4000*g.mult),order=shuffle([false,false,false,true,true]);
   sgStream(g,f,order.map((d,i)=>({ch:g.alphabet[rnd(4)],at:200+i*Math.round(2400*g.mult),life,decoy:d})),3,1)}},
 {icon:'🧠',name:'จำให้ได้',hint:'ดูตัวอักษร 2 วินาที แล้วพิมพ์ตามที่จำได้',time:18000,setup(g,f){sgKeyButtons(g);sgSequence(g,f,sgPick(g,3),Math.round(2200*g.mult))}},
 {icon:'👑',name:'บอสคีย์',hint:'ตัวอักษรรัว 6 ตัว · กดให้ทันอย่างน้อย 5',time:20000,setup(g,f){
   sgKeyButtons(g);const life=Math.round(3200*g.mult);sgStream(g,f,Array.from({length:6},(_,i)=>({ch:g.alphabet[rnd(4)],at:150+i*Math.round(1300*g.mult),life})),5,9)}}
];
function pauseSkillGame(){if(!skillGame?.running||skillGame.paused)return;skillGame.paused=true;$('#skill-pause').textContent='▶ เล่นต่อ';$('#skill-feedback').textContent='พักอยู่ · ไม่จับเวลา'}
function finishSkillGame(){
  const g=skillGame;g.running=false;g.finished=true;cancelAnimationFrame(g.raf);clearTimeout(g.nextTimer);
  state.skillGames.push({attemptId:uid('skill'),unit:2,type:g.type,points:g.correct,maxPoints:8,wrongPresses:g.wrong,timeouts:g.timeouts,speedMs:Math.round(g.mult*100)/100,alphabet:g.type==='typing'?g.alphabet.join(' '):null,inputCounts:{...g.inputs},reactionMs:g.reactions,rounds:g.results,seconds:Math.round(g.elapsed/1000),startedAt:g.startedAt,finishedAt:new Date().toISOString()});
  persist();
  $('#skill-pause').disabled=true;$('#skill-score').innerHTML=art('star','','hud-art')+' '+g.correct;$('#skill-time').textContent='จบแล้ว';
  $('#skill-arena').className='skill-arena sg-arena';
  $('#skill-arena').innerHTML=`<div class="skill-intro"><img src="${LEARNING_ASSETS['techno-reward']}" alt="Techno รับรางวัล"><h2>ได้ ${g.correct} ดาว จาก 8!</h2><div class="sg-stars" aria-label="ผลแต่ละด่าน">${g.results.map(r=>`<span class="${r.ok?'ok':'no'}" title="${esc(r.name)}">${r.ok?'⭐':'☆'}</span>`).join('')}</div><p>${currentRider.guest?'ลองเล่น · ผลอยู่ในรอบนี้':'บันทึกให้เลขที่ '+currentRider.id.slice(1)+' แล้ว'}</p><button class="secondary" id="skill-again">↻ เล่นอีก</button></div>`;
  $('#skill-again').onclick=()=>{$('#playfield').innerHTML=skillUI(g.type);bindSkillGame(g.type)};
  if($('#typing-keys'))$('#typing-keys').innerHTML='';
  $('#skill-feedback').textContent=g.correct>=7?'สุดยอด! เก่งมากเลย':g.correct>=4?'เก่งมาก! ลองเล่นอีกให้ได้ครบนะ':'ไม่เป็นไร ค่อย ๆ ฝึกได้';
  $('#skill-next').textContent=skillStandalone?'กลับแผนที่':'ไปต่อ →';
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseSkillGame()});
