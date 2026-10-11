/* Techno ป.2 · แกนหลัก: ข้อมูลผู้เรียน, เข้าสู่ระบบ, แผนที่ภารกิจ, ตัวเล่นด่าน, คะแนน, รายงาน, หน้าครู */
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=(a,seed)=>{const r=a.map((x,i)=>[x,i]);let s=seed??Math.floor(Math.random()*1e9);const rnd=()=>(s=(s*1664525+1013904223)%4294967296)/4294967296;for(let i=r.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r.map(x=>x[0])};
const permFor=(s,n)=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)}return shuffle([...Array(n).keys()],(h>>>0)%4294967296)};
const img=(k,cls='',alt='')=>`<img class="${cls}" src="${ASSETS[k]||''}" alt="${esc(alt)}">`;
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const KEY='krukan-p2-v1';
/* ---- โหมด GAS (เมื่อวางบน Apps Script ของ ป.2): ผู้เรียนบันทึกลง Google Sheets ผ่านเซิร์ฟเวอร์ ---- */
const GAS=typeof google!=='undefined'&&!!google.script&&!!google.script.run;
const gas=(name,...args)=>new Promise((ok,fail)=>{google.script.run.withSuccessHandler(ok).withFailureHandler(e=>fail(e))[name](...args)});
let Token='',StaffToken='',CFG=null,saveTimer=0,saving=false,saveAgain=false;
const UNITS=P2DATA.units;
const unit=n=>UNITS[n-1];

/* ---------- ทะเบียนห้อง (ฝั่งเครื่องนี้ · ต่อ GAS ป.2 ภายหลังผ่าน adapter เดียวกัน) ---------- */
const School=LS.get(KEY+':school',null)||(()=>{const s={display:'2569',years:{'2569':{className:'ป.2/1',password:'1234',roster:Array.from({length:20},(_,i)=>({id:String(i+1).padStart(2,'0'),name:'',active:true}))}},teachers:[{user:'teacher',pin:'2468',role:'admin'}]};LS.set(KEY+':school',s);return s})();
const saveSchool=()=>LS.set(KEY+':school',School);
const YEAR=()=>School.years[School.display];
const rKey=(year,id)=>`${KEY}:r:${year}:${id}`;
const blank=()=>({u:{},sound:true,cur:{n:0,s:0}});
let Rider=null,S=blank(),Staff=null;
const load=(year,id)=>{const s=LS.get(rKey(year,id),null);return s&&s.u?s:blank()};
const persist=()=>{if(!Rider||Rider.guest)return;if(!GAS){LS.set(rKey(School.display,Rider.id),S);return}
  clearTimeout(saveTimer);saveTimer=setTimeout(flush,700)};
function flush(){if(!GAS||!Token||!Rider||Rider.guest)return;if(saving){saveAgain=true;return}saving=true;
  const snap=JSON.parse(JSON.stringify(S));
  gas('saveProgress',Token,snap).then(()=>{saving=false;if(saveAgain){saveAgain=false;flush()}}).catch(e=>{saving=false;toast((e&&e.message)||'ยังบันทึกไม่ได้ จะลองใหม่');saveTimer=setTimeout(flush,5000)})}
const U=(n,st=S)=>st.u[n]||(st.u[n]={pre:null,post:null,story:false,topics:{},diag:{},games:{},lab:null,real:null,boss:null,ph:{},reportSeen:false});

/* ---------- โครงด่าน ---------- */
const plan=n=>{const u=unit(n);let ti=0,gi=0;return u.stages.map((s,i)=>{const o={i,kind:s.kind,title:s.title,pages:s.pages};if(s.kind==='topic')o.ti=ti++;if(s.kind==='minigame')o.gi=gi++;return o})};
const PLAN={};UNITS.forEach(u=>PLAN[u.number]=plan(u.number));
const nTopics=n=>PLAN[n].filter(x=>x.kind==='topic').length;
const hasLab=n=>PLAN[n].some(x=>x.kind==='lab');
const KIND_ICON={pretest:'📝',story:'📖',topic:'⭐',minigame:'🎮',lab:'🔬','real-task':'🤝',posttest:'✅',boss:'👾',report:'🏆'};
const KIND_NAME={pretest:'ลองก่อนเรียน',story:'เรื่องเปิด',topic:'ฝึก',minigame:'เกม',lab:'ห้องทดลอง','real-task':'งานจริง',posttest:'ลองหลังเรียน',boss:'ดวลบอส',report:'สรุป'};
function stageDone(n,i,st=S){const o=PLAN[n][i],u=U(n,st);switch(o.kind){case'pretest':return !!u.pre;case'posttest':return !!u.post;case'story':return u.story;case'topic':return !!u.topics[o.ti]?.done;case'minigame':return !!u.games[o.gi]?.done;case'lab':return !!u.lab?.done;case'real-task':return !!u.real?.self;case'boss':return !!u.boss?.done;case'report':return u.reportSeen}return false}
const doneCount=(n,st=S)=>PLAN[n].filter((o,i)=>stageDone(n,i,st)).length;
const nextStage=(n,st=S)=>{const k=PLAN[n].findIndex((o,i)=>!stageDone(n,i,st));return k<0?0:k};

/* ---------- คะแนนวิชา 100 ต่อภารกิจ (ก่อนเรียนไม่คิด · พลังเกมแยก) ---------- */
function scoreOf(n,st=S){
  const u=U(n,st),t=nTopics(n),lab=hasLab(n),gMax=lab?6:12;
  let topics=0,games=0,energy=0;
  Object.values(u.topics).forEach(x=>topics+=x.score||0);
  Object.values(u.games).forEach(x=>{games+=x.score||0;energy+=x.energy||0});
  const labS=u.lab?.score||0,real=u.real?(u.real.teacher?20:u.real.self?10:0):0,post=u.post?.score||0;
  const boss=u.boss?.energy||0;
  return {topics,topicsMax:t*6,games,gamesMax:gMax*2,lab:labS,labMax:lab?6:0,real,realMax:20,post,postMax:20,boss,bossMax:20,energy,
    total:topics+games+labS+real+post,max:t*6+gMax*2+(lab?6:0)+40};
}
const allScore=(st=S)=>{let a=0,e=0;for(let n=1;n<=9;n++){const s=scoreOf(n,st);a+=s.total;e+=s.energy+s.boss}return {score:a,energy:e}};

/* ---------- เสียง / พูด ---------- */
let AC=null;
function beep(kind){if(!S.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const seq={ok:[[660,.09],[880,.12]],bad:[[220,.18]],click:[[520,.04]],win:[[523,.1],[659,.1],[784,.1],[1047,.2]],hit:[[140,.15]]}[kind]||[];let t=AC.currentTime;seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d);t+=d})}catch(e){}}
function speak(text){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='th-TH';u.rate=.9;speechSynthesis.speak(u)}catch(e){}}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2200)}
const Loading={show(t){this.hide();const e=document.createElement('div');e.className='loading';e.id='loading';e.innerHTML=`<div class="lc"><div class="dots"><i></i><i></i><i></i></div><div>${esc(t||'กำลังโหลด…')}</div></div>`;document.body.append(e)},hide(){$('#loading')?.remove()}};
function modal(title,body,wide){closeModal();const m=document.createElement('div');m.className='modal-bg';m.id='modal';m.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><button class="x" aria-label="ปิด">×</button><h2>${title}</h2>${body}</section>`;document.body.append(m);m.onclick=e=>{if(e.target===m)closeModal()};$('.x',m).onclick=closeModal;return m}
const closeModal=()=>$('#modal')?.remove();

/* ---------- ยานของ Techno (มาสคอตมุมขวาล่าง) ท่าตาม technoMotion ---------- */
const TS={idle:'P2-TS-01-idle',bankLeft:'P2-TS-02-bank-left',bankRight:'P2-TS-03-bank-right',boost:'P2-TS-04-boost',scan:'P2-TS-05-scan',shield:'P2-TS-06-shield',tagShot:'P2-TS-07-tag-shot',hit:'P2-TS-08-hit',landing:'P2-TS-09-landing',victory:'P2-TS-10-victory'};
const Mascot={el:null,t:0,
  mount(){if(this.el)return;const e=document.createElement('div');e.className='mascot';e.innerHTML='<div class="say"></div><img alt="ยานของ Techno">';document.body.append(e);this.el=e;this.set('idle')},
  set(state,say,ms=2600){this.mount();$('img',this.el).src=ASSETS[TS[state]||TS.idle];const s=$('.say',this.el);clearTimeout(this.t);if(say){s.textContent=say;s.classList.add('on');this.t=setTimeout(()=>s.classList.remove('on'),ms)}else s.classList.remove('on')},
  react(ok,say){this.set(ok?'victory':'hit',say,2400);clearTimeout(this._r);this._r=setTimeout(()=>this.set(this.base||'idle'),2400)}};

/* ---------- เปลี่ยนหน้า ---------- */
const view=html=>{$('#main').innerHTML=html;window.scrollTo(0,0)};
function bar(){const a=$('#bar-right');a.innerHTML=(Rider?`<span class="chip">${Rider.guest?'ผู้เข้าชม':'เลขที่ '+Rider.id}</span><button class="chip" id="b-sound">${S.sound?'🔊 เสียง':'🔇 ปิดเสียง'}</button><button class="chip" id="b-out">ออก</button>`:'')+`<button class="chip" id="b-teacher">🔒 สำหรับครู</button>`;
  $('#b-sound')&&($('#b-sound').onclick=()=>{S.sound=!S.sound;persist();bar()});$('#b-out')&&($('#b-out').onclick=logout);$('#b-teacher').onclick=teacher}
function logout(){persist();if(GAS)flush();Rider=null;Token='';S=blank();Mascot.el&&(Mascot.el.style.display='none');bar();renderLogin()}

/* ---------- เข้าสู่ระบบ: เลขที่เล็ก ๆ เห็นพร้อมกัน ---------- */
function renderLogin(){
  if(GAS&&!CFG){Loading.show('กำลังเปิดห้องเรียน');gas('getPublicConfig').then(c=>{CFG=c;Loading.hide();renderLogin()}).catch(e=>{Loading.hide();view(`<section class="lg"><div class="lg-card"><h2>ยังเปิดห้องเรียนไม่ได้</h2><p>${esc(e&&e.message||'เชื่อมต่อไม่สำเร็จ')}</p><button class="btn" id="rt">ลองใหม่</button> <button class="btn sec" id="gs">ลองเล่นก่อน</button></div></section>`);$('#rt').onclick=renderLogin;$('#gs').onclick=()=>{Rider={id:'GUEST',guest:true};S=blank();enter()}});return}
  const y=GAS?{className:CFG.className,roster:CFG.codes.map(c=>({id:c.id,active:true})),password:null}:YEAR(),yearLabel=GAS?CFG.year:School.display,roster=y.roster.filter(r=>r.active);let pick=roster[0]?.id||'';
  view(`<section class="lg"><div class="lg-card">
    <div class="lg-top">${img('pose-wave','','Techno')}<div class="lg-bubble">สวัสดี! แตะ<b>เลขที่ของเรา</b> แล้วใส่รหัสนะ</div><span class="chip" style="background:#e6fbff;color:#0a4d7a;border-color:#bfe9f3">${esc(y.className)} · ปี ${esc(yearLabel)}</span></div>
    <div class="lg-pick"><h2>1 · แตะเลขที่ของเรา</h2><div class="nums">${roster.map(r=>`<button data-id="${r.id}" class="${r.id===pick?'sel':''}">${r.id}</button>`).join('')}</div></div>
    <form class="lg-form" id="lf"><h2>2 · ใส่รหัส</h2><input id="pw" type="password" inputmode="numeric" maxlength="8" placeholder="รหัสที่ครูให้" autocomplete="off"><div class="err" id="le"></div><button class="btn" style="width:100%">เข้าเรียน <i class="arr"></i></button></form>
    <div class="lg-guest"><span>หรือ</span><button class="btn sec" id="guest" type="button" style="flex:1">ลองเล่นก่อน</button></div>
  </div></section>`);
  $$('.nums button').forEach(b=>b.onclick=()=>{pick=b.dataset.id;$$('.nums button').forEach(x=>x.classList.toggle('sel',x===b));$('#le').textContent=''});
  $('#lf').onsubmit=e=>{e.preventDefault();
    if(GAS){const btn=$('#lf .btn');btn.disabled=true;Loading.show('กำลังเช็กรหัส');
      gas('loginStudent',pick,$('#pw').value).then(r=>{Loading.hide();Token=r.token;Rider={id:r.rider.id,guest:false,name:r.rider.name};S=r.state&&r.state.u?r.state:blank();enter()})
        .catch(err=>{Loading.hide();btn.disabled=false;$('#le').textContent=(err&&err.message)||'เข้าเรียนไม่ได้';$('#pw').value=''});return}
    if($('#pw').value!==y.password){$('#le').textContent='รหัสยังไม่ถูก ลองใหม่นะ';$('#pw').value='';return}
    Rider={id:pick,guest:false};S=load(School.display,pick);enter()};
  $('#guest').onclick=()=>{Rider={id:'GUEST',guest:true};S=blank();enter()};
}
function enter(){bar();Mascot.mount();Mascot.el.style.display='';Loading.show('กำลังเปิดห้องเรียน');setTimeout(()=>{Loading.hide();renderHome()},350)}

/* ---------- หน้าเลือกภารกิจ ---------- */
function renderHome(){
  document.body.dataset.u='';Mascot.base='idle';Mascot.set('idle','เลือกภารกิจได้เลย!');
  const tot=allScore(),done=[...Array(9)].map((_,i)=>{const n=i+1;return PLAN[n].every((o,k)=>stageDone(n,k))}).filter(Boolean).length;
  const first=(()=>{for(let n=1;n<=9;n++)if(doneCount(n)<PLAN[n].length)return n;return 1})();
  view(`<section class="hero"><div><div class="kick" style="color:var(--mint)">TECHNO ACADEMY · ดาวธาตุน้ำ · ป.2</div><h1>เลือกภารกิจ</h1><p>เรียนรู้ · เล่นเกม · ดวลบอส เพื่อคืนน้ำใสให้ดวงดาว</p>
    <button class="btn warm" id="go">${doneCount(first)?'ไปต่อภารกิจ '+first:'เริ่มภารกิจ 1'} <i class="arr"></i></button>
    <div class="stats"><div class="stat"><b>${tot.score}</b>/ 900 คะแนนวิชา</div><div class="stat"><b>${tot.energy}</b>พลังเกม</div><div class="stat"><b>${done}</b>/ 9 ภารกิจครบ</div><button class="btn sec sm" id="mine">📊 คะแนนของฉัน</button></div></div>
    ${img('P2-TS-01-idle','craft','ยานของ Techno')}</section>
    <div class="missions">${UNITS.map(u=>{const n=u.number,d=doneCount(n),t=PLAN[n].length,sc=scoreOf(n);return `<button class="mcard" data-u="${n}" data-n="${n}"><div class="imw">${img(u.scene,'im',u.title)}<span class="bossb" style="background-image:url(${ASSETS['boss0'+n]})" title="บอสประจำภารกิจ"></span>${d>=t?'<span class="done-r">ครบแล้ว ✓</span>':d>0?'<span class="cont-r">เล่นต่อ ▶</span>':'<span class="new-r">ใหม่!</span>'}</div><div class="tx"><small>ภารกิจ ${n}</small><h3>${esc(u.title)}</h3><div class="bar-p"><i style="width:${Math.round(d/t*100)}%"></i></div><div class="meta"><span>ด่าน ${d}/${t}</span><span>${sc.total}/100 คะแนน</span></div></div></button>`}).join('')}</div>`);
  $('#go').onclick=()=>openStage(first,nextStage(first));$('#mine').onclick=showMine;
  $$('.mcard').forEach(b=>b.onclick=()=>openStage(Number(b.dataset.n),nextStage(Number(b.dataset.n))));
}
function showMine(st=S,title='คะแนนของฉัน'){
  const rows=UNITS.map(u=>{const s=scoreOf(u.number,st);return `<tr><td>ภารกิจ ${u.number} · ${esc(u.title)}</td><td>${s.topics}/${s.topicsMax}</td><td>${s.games+s.lab}/${s.gamesMax+s.labMax}</td><td>${s.real}/20</td><td>${s.post}/20</td><td><b>${s.total}/100</b></td><td>${s.energy+s.boss}</td></tr>`}).join('');
  modal(title,`<div style="overflow:auto"><table class="tbl"><tr><th>ภารกิจ</th><th>ฝึก</th><th>เกม/ทดลอง</th><th>งานจริง</th><th>หลังเรียน</th><th>รวม</th><th>พลังเกม</th></tr>${rows}</table></div><p class="note">คะแนนวิชาไม่ใช้ความเร็วตัดสิน · พลังเกมนับแยก</p>`);
}

/* ---------- ตัวเล่นด่าน ---------- */
let CUR={n:1,i:0};
function openStage(n,i){CUR={n,i};S.cur={n,s:i};persist();renderStage()}
function head(n,i,o,extra=''){
  const u=unit(n),pos=`ภารกิจ ${n} · ด่าน ${i+1}/${PLAN[n].length}`;
  return `<div class="st-top"><button class="back" id="back">เลือกภารกิจ</button><span class="st-pos">${pos}</span></div>
  <div class="st-head"><div><small>${KIND_ICON[o.kind]} ${KIND_NAME[o.kind]} · ${esc(u.title)}</small><h1>${esc(o.title)}</h1></div><button class="btn sec" id="listen">🔊 ฟัง</button></div>
  <nav class="tl">${PLAN[n].map((x,k)=>`<button data-k="${k}" class="${stageDone(n,k)?'done':''} ${k===i?'cur':''}" title="${esc(KIND_NAME[x.kind]+': '+x.title)}">${k+1}</button>`).join('')}</nav>
  <div class="hud"><span>⭐ <b>${scoreOf(n).total}</b>/100 คะแนน</span><span class="grow"></span><span>⚡ พลังเกม <b>${scoreOf(n).energy+scoreOf(n).boss}</b></span></div>${extra}`;
}
function bindHead(n,i,speakText){
  $('#back').onclick=renderHome;
  $$('.tl button').forEach(b=>b.onclick=()=>openStage(n,Number(b.dataset.k)));
  $('#listen').onclick=()=>speak(speakText()||$('.panel')?.innerText||'');
}
function renderStage(){
  const {n,i}=CUR,o=PLAN[n][i];document.body.dataset.u=n;Mascot.base=motion(n,i,0);Mascot.set(Mascot.base);
  const fn={pretest:stageQuiz,posttest:stageQuiz,story:stageStory,topic:stageTopic,minigame:stageGame,lab:stageLab,'real-task':stageReal,boss:stageBoss,report:stageReport}[o.kind];
  fn(n,i,o);
}
const motion=(n,i,p)=>{const pg=unit(n).stages[i].pages[p]||unit(n).stages[i].pages[0];return pg?.technoMotion?.primaryState||'idle'};
const toNext=(n,i)=>{const k=i+1;if(k<PLAN[n].length)openStage(n,k);else renderHome()};
const nextBtn=(label='ไปต่อ')=>`<button class="btn" id="next">${label} <i class="arr"></i></button>`;

/* --- ก่อน/หลังเรียน --- */
function stageQuiz(n,i,o){
  const u=unit(n),post=o.kind==='posttest',qs=post?u.postQuestions:u.preQuestions,ST=U(n),ans=[];let k=0;
  view(head(n,i,o)+`<section class="panel" id="pn"></section>`);bindHead(n,i,()=>qs[Math.min(k,3)]?.question);
  const done=(post?ST.post:ST.pre);
  if(done){return showQuizResult(n,i,o,qs,done)}
  const draw=()=>{const q=qs[k];
    $('#pn').innerHTML=`<div class="cols">${img(u.scene,'art',u.title)}<div><div class="track" aria-hidden="true">${[0,1,2,3].map(x=>`<i class="${x<k?'ok':''} ${x===k?'cur':''}">${x+1}</i>`).join('<b></b>')}<img src="${ASSETS['P2-TS-01-idle']}" style="left:${k*33.3}%" alt=""></div><div class="kick">${post?'ข้อสอบหลังเรียน':'ลองคิดก่อนเรียน'} · ข้อ ${k+1}/4 · ${post?'ทำให้ครบทั้ง 4 ข้อ ไม่ต้องรีบ':'ตอบตามที่คิด ยังไม่ต้องรู้ทุกข้อก็ได้'}</div><p class="q big">${esc(q.question)}</p><div class="opts">${permFor(q.question,q.choices.length).map(x=>`<button class="opt ${ans[k]===x?'sel':''}" data-x="${x}">${esc(q.choices[x])}</button>`).join('')}</div>
      <div class="fb idle"></div><div class="actions">${k>0?'<button class="btn sec sec-l" id="prev">ย้อนข้อ</button>':''}<button class="btn" id="go" ${ans[k]==null?'disabled':''}>${k<3?'ข้อต่อไป':'ส่งคำตอบ'} <i class="arr"></i></button></div></div></div>`;
    $$('.opt').forEach(b=>b.onclick=()=>{ans[k]=Number(b.dataset.x);beep('click');draw()});
    $('#prev')&&($('#prev').onclick=()=>{k--;draw()});
    $('#go').onclick=()=>{if(k<3){k++;draw();return}
      const per=post?5:1,sc=ans.reduce((s,a,x)=>s+(a===qs[x].answerIndex?per:0),0);
      const rec={a:[...ans],score:sc,at:Date.now()};if(post)ST.post=rec;else ST.pre=rec;persist();beep(sc>=(post?15:3)?'win':'ok');showQuizResult(n,i,o,qs,rec)};
  };draw();
}
function showQuizResult(n,i,o,qs,rec){
  const post=o.kind==='posttest',u=unit(n),good=rec.a.filter((a,x)=>a===qs[x].answerIndex).length;
  Mascot.react(good>=3,good>=3?'เก่งมาก!':'ไม่เป็นไร เรียนต่อได้เลย');
  $('#pn').innerHTML=`<div class="cols">${img(post?'pose-trophy':'pose-thumbs','art contain','Techno')}<div><div class="kick">${post?'หลังเรียน':'ก่อนเรียน'}</div><h2>ตอบถูก ${good} จาก 4 ข้อ</h2>${post?`<p class="note">ได้ <b>${rec.score}/20</b> คะแนน</p>`:'<p class="note">ข้อสอบก่อนเรียนช่วยให้รู้จุดเริ่มต้น ไม่คิดคะแนน</p>'}
    ${qs.map((q,x)=>`<div class="note ${rec.a[x]===q.answerIndex?'':'ex'}"><b>${x+1}. ${esc(q.question)}</b><br>${rec.a[x]===q.answerIndex?'✅':'💡'} ${esc(q.choices[q.answerIndex])} · ${esc(q.reason)}</div>`).join('')}
    <div class="actions">${nextBtn()}</div></div></div>`;
  $('#next').onclick=()=>toNext(n,i);
}

/* --- เรื่องเปิด --- */
function stageStory(n,i,o){
  const u=unit(n),pg=o.pages[0],lines=String(pg.body).replace(/^เรื่องเปิด:\s*/,'').split(/ · เป้าหมาย: | \/ /).map(s=>s.trim()).filter(Boolean);
  view(head(n,i,o)+`<section class="panel"><div class="cols">${img(u.scene,'art',u.title)}<div><div class="kick">เรื่องเปิด</div><h2>${esc(pg.title)}</h2>
    ${lines[0].trim()===String(pg.title).trim()?'':`<p class="big">${esc(lines[0])}</p>`}<div class="note"><b>เป้าหมายของเรา</b><ul style="margin:6px 0 0;padding-left:22px">${lines.slice(1).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div style="display:flex;align-items:center;gap:12px">${img('pose-present','',' ').replace('<img','<img style="width:90px"')}<span>Techno พร้อมช่วยเราแล้ว!</span></div>
    <div class="actions">${nextBtn('เริ่มภารกิจ')}</div></div></div></section>`);
  bindHead(n,i,()=>lines.join(' '));
  $('#next').onclick=()=>{U(n).story=true;persist();toNext(n,i)};
}

/* --- หัวข้อ: ลองคิด → เรียนรู้ → รับภารกิจ → ลงมือ --- */
const PH=['diagnose','learn','brief','activity'],PHN=['1 ลองคิด','2 เรียนรู้','3 รับภารกิจ','4 ลงมือ'];
function stageTopic(n,i,o){
  const u=unit(n),t=u.topics[o.ti],st=U(n),C=P2C[n]?.t?.[o.ti]||{},ph=st.ph[o.ti]||0;
  Mascot.base=motion(n,i,ph);Mascot.set(Mascot.base);
  const phases=`<div class="phases">${PHN.map((x,k)=>`<span class="${k===ph?'on':k<ph||st.topics[o.ti]?.done?'ok':''}">${x}</span>`).join('')}</div>`;
  view(head(n,i,o,phases)+`<section class="panel" id="pn"></section>`);
  bindHead(n,i,()=>({0:t.diagnostic,1:t.teach+' '+t.example,2:t.mission,3:t.mission}[ph]));
  const setPh=k=>{st.ph[o.ti]=k;persist();renderStage()};
  const pn=$('#pn'),art=C.art||t.art||u.scene;
  if(ph===0){
    const ch=String(unit(n).stages[i].pages[0].body).split('ตัวเลือก:')[1].split('/').map(s=>s.trim()),right=C.diag??0;let tries=0;
    pn.innerHTML=`<div class="cols">${img(art,'art contain',t.name)}<div><div class="kick">ลองคิดก่อนนะ</div><p class="q big">${esc(t.diagnostic)}</p><div class="opts">${permFor(t.diagnostic,ch.length).map(x=>`<button class="opt" data-x="${x}">${esc(ch[x])}</button>`).join('')}</div><div class="fb idle"></div><div class="actions">${nextBtn('ไปเรียนรู้')}</div></div></div>`;
    $('#next').disabled=!(st.diag[o.ti]!=null);
    $$('.opt').forEach(b=>b.onclick=()=>{const x=Number(b.dataset.x);tries++;const ok=x===right;if(st.diag[o.ti]==null)st.diag[o.ti]={first:ok};persist();
      b.classList.add(ok?'right':'wrong');const fb=$('.fb');fb.className='fb '+(ok?'good':'bad');fb.textContent=(ok?'ถูกแล้ว! ':'ยังไม่ใช่ ลองอีกที · ')+(C.why||'');beep(ok?'ok':'bad');Mascot.react(ok,ok?'เยี่ยม!':'ลองใหม่นะ');
      if(ok){$$('.opt').forEach(z=>z.disabled=true);$('#next').disabled=false}});
    $('#next').onclick=()=>setPh(1);
  }else if(ph===1){
    pn.innerHTML=`<div class="cols">${img(art,'art contain',t.name)}<div><div class="kick">เรียนรู้</div><h2>${esc(t.name)}</h2><p class="big">${esc(t.teach)}</p><div class="note ex"><b>ตัวอย่าง</b> · ${esc(t.example)}</div><div style="display:flex;align-items:center;gap:10px">${img('pose-'+(C.pose||'present'),'',' ').replace('<img','<img style="width:86px"')}<span class="note" style="margin:0">จำไว้: ${esc(t.success)}</span></div><div class="actions"><button class="btn sec sec-l" id="prev">ย้อนกลับ</button>${nextBtn('รับภารกิจ')}</div></div></div>`;
    $('#prev').onclick=()=>setPh(0);$('#next').onclick=()=>setPh(2);
  }else if(ph===2){
    pn.innerHTML=`<div class="cols">${img(u.scene,'art',u.title)}<div><div class="kick">ภารกิจจริง</div><h2>${esc(t.mission)}</h2><div class="note"><b>ผ่านเมื่อ</b> · ${esc(t.success)}</div><p class="note ex">โจทย์นี้ไม่ซ้ำกับตัวอย่าง ลองคิดเองก่อนนะ · ผิดได้ ลองใหม่ได้</p><div class="actions"><button class="btn sec sec-l" id="prev">ย้อนกลับ</button>${nextBtn('ลงมือทำ')}</div></div></div>`;
    $('#prev').onclick=()=>setPh(1);$('#next').onclick=()=>setPh(3);
  }else{
    const rec=st.topics[o.ti];
    const isQuest=C.act?.t==='quest';
    pn.innerHTML=`<div class="kick">ลงมือทำ · ${esc(t.name)}</div>${isQuest?'':'<div class="ghud"><span>ภารกิจย่อย</span><span class="grow"></span><span id="streak"></span><span id="hearts" title="พลังยาน">❤️❤️❤️</span></div>'}<div id="act"></div><div class="fb idle" id="fb"></div><div class="actions"><button class="btn sec sec-l" id="prev">ย้อนกลับ</button><button class="btn sec" id="hint">💡 ขอใบ้</button>${nextBtn('ไปต่อ')}</div>`;
    $('#next').disabled=!rec?.done;
    $('#prev').onclick=()=>setPh(2);
    let hints=0;$('#hint').onclick=()=>{hints++;const fb=$('#fb');fb.className='fb hint';fb.textContent='💡 '+t.hint;Mascot.set('scan','ดูใบ้ก่อนนะ')};
    $('#next').onclick=()=>toNext(n,i);
    let hearts=3,restarts=0,streak=0;
    const drawHearts=()=>{const h=$('#hearts');if(h)h.textContent='❤️'.repeat(hearts)+'🖤'.repeat(3-hearts);const s=$('#streak');if(s)s.textContent=streak>=2?'🔥 ถูกติดกัน '+streak:''};
    const runAct=()=>{hearts=3;streak=0;drawHearts();(ACT[C.act?.t]||ACT.fallback)($('#act'),C.act||{},ctx,t)};
    const ctx={n,hint:()=>hints,say:(ok,m)=>{beep(ok?'ok':'bad');Mascot.react(ok,m);
        if(isQuest)return;
        if(ok){streak++;drawHearts();return}
        streak=0;hearts--;drawHearts();const a=$('#act');a&&(a.classList.remove('shake'),void a.offsetWidth,a.classList.add('shake'));
        if(hearts<=0){restarts++;ctx.fb('warn','พลังยานหมดแล้ว! ยานชาร์จพลังใหม่ แล้วเริ่มรอบนี้อีกครั้งนะ');setTimeout(runAct,1400)}},
      fb:(cls,m)=>{const f=$('#fb');f.className='fb '+cls;f.textContent=m},
      done:(err0)=>{const err=err0+restarts*2;const first=st.diag[o.ti]?.first?1:0;const base=3+(err===0?2:err<=2?1:0)+first;const sc=Math.min(6,base);reward(sc,6);
        const old=st.topics[o.ti];st.topics[o.ti]={done:true,score:Math.max(old?.score||0,sc),err,hints,at:Date.now()};persist();beep('win');Mascot.set(unit(n).stages[i].pages[3].technoMotion.onSuccess,'ผ่านแล้ว! +'+sc+' คะแนน');
        $('#next').disabled=false;ctx.fb('good','ผ่านแล้ว! ได้ '+sc+'/6 คะแนน · '+t.success);$$('.tl button')[i].classList.add('done');$('.hud').innerHTML=`<span>⭐ <b>${scoreOf(n).total}</b>/100 คะแนน</span><span class="grow"></span><span>⚡ พลังเกม <b>${scoreOf(n).energy+scoreOf(n).boss}</b></span>`}};
    runAct();
  }
}
/* ผลตอบรับเมื่อผ่านด่านย่อย: ดาว + คะแนน เด้งขึ้นกลางจอสั้น ๆ */
function reward(sc,max){
  const r=document.createElement('div');r.className='reward';
  r.innerHTML=`<div class="rw-card"><div class="rw-stars">${'⭐'.repeat(Math.max(1,Math.round(sc/max*3)))}</div><div class="rw-pt">+${sc} คะแนน</div></div>`;
  document.body.append(r);setTimeout(()=>r.remove(),1700);
}

/* --- เกมแทรก / ห้องทดลอง / บอส / งานจริง ใช้ตัวเล่นในไฟล์อื่น --- */
function stageGame(n,i,o){
  const u=unit(n),g=u.games[o.gi],st=U(n),C=P2C[n]?.g?.[o.gi],ph=st.ph['g'+o.gi]||0;
  Mascot.base=motion(n,i,ph);Mascot.set(Mascot.base);
  view(head(n,i,o)+`<section class="panel" id="pn"></section>`);bindHead(n,i,()=>g[2]);
  const rec=st.games[o.gi];
  if(ph===0){
    $('#pn').innerHTML=`<div class="cols">${img(g[4].startsWith('P2-')?g[4]:u.scene,'art contain',g[0])}<div><div class="kick">เกม ${o.gi+1} · ${esc(u.title)}</div><h2>${esc(g[0])}</h2><p class="big">${esc(g[2])}</p><div class="note"><b>ผ่านเมื่อ</b> · ${esc(g[3])}</div><p class="note ex">มีปุ่มหยุดพัก · เวลามีผลแค่โบนัส ไม่ตัดคะแนนวิชา</p>${rec?.done?`<p class="note">เคยเล่นแล้ว: ${rec.score} คะแนนวิชา · พลัง ${rec.energy}</p>`:''}<div class="actions">${nextBtn('เริ่มเล่น')}</div></div></div>`;
    $('#next').onclick=()=>{st.ph['g'+o.gi]=1;persist();renderStage()};
  }else{
    $('#pn').innerHTML=`<div id="act"></div><div class="actions"><button class="btn sec sec-l" id="prev">ย้อนกลับ</button></div>`;
    $('#prev').onclick=()=>{st.ph['g'+o.gi]=0;persist();renderStage()};
    const max=hasLab(n)?6:12;
    const fin=(res)=>{const old=st.games[o.gi];st.games[o.gi]={done:true,score:Math.max(old?.score||0,res.score),energy:Math.max(old?.energy||0,res.energy),at:Date.now()};persist();
        $('#pn').innerHTML=`<div class="cols">${img('pose-victory','art contain','')}<div><div class="kick">จบเกม</div><h2>${res.score>=max*.8?'เยี่ยมมาก!':'ผ่านแล้ว!'}</h2><p class="note">คะแนนวิชา <b>${res.score}/${max}</b> · พลังเกม <b>${res.energy}/10</b></p><p class="note ex">${esc(res.note||'')}</p><div class="actions"><button class="btn sec sec-l" id="again">เล่นอีกรอบ</button>${nextBtn()}</div></div></div>`;
        beep('win');Mascot.set('victory','ยอดเยี่ยม!');$('#next').onclick=()=>toNext(n,i);$('#again').onclick=()=>renderStage()};
    if(C&&C.pack){
      const unitTitle=g[0];
      ACT.quest($('#act'),{pack:C.pack},{say:(ok,m)=>{beep(ok?'ok':'bad');Mascot.react(ok,m)},done:(err)=>fin({score:Math.max(Math.ceil(max*.55),max-Math.round(err*max/8)),energy:Math.max(3,10-err),note:err?`พลาด ${err} ครั้ง ลองเล่นอีกรอบเพื่อได้คะแนนเต็ม`:'ผ่านทุกด่านโดยไม่พลาดเลย!'})});
      return;
    }
    ARC.game($('#act'),C||{rounds:[]},{n,gi:o.gi,max,title:g[0],
      finish:(res)=>{const old=st.games[o.gi];st.games[o.gi]={done:true,score:Math.max(old?.score||0,res.score),energy:Math.max(old?.energy||0,res.energy),at:Date.now()};persist();
        $('#pn').innerHTML=`<div class="cols">${img('pose-victory','art contain','')}<div><div class="kick">จบเกม</div><h2>${res.score>=max*.8?'เยี่ยมมาก!':'ผ่านแล้ว!'}</h2><p class="note">คะแนนวิชา <b>${res.score}/${max}</b> · พลังเกม <b>${res.energy}/10</b></p><p class="note ex">${esc(res.note||'')}</p><div class="actions"><button class="btn sec sec-l" id="again">เล่นอีกรอบ</button>${nextBtn()}</div></div></div>`;
        beep('win');Mascot.set('victory','ยอดเยี่ยม!');$('#next').onclick=()=>toNext(n,i);$('#again').onclick=()=>renderStage()}});
  }
}
function stageLab(n,i,o){
  const u=unit(n),st=U(n),C=P2C[n]?.lab;
  view(head(n,i,o)+`<section class="panel" id="pn"></section>`);bindHead(n,i,()=>u.lab);
  const rec=st.lab,go=()=>{
    $('#pn').innerHTML=`<div class="kick">ห้องทดลอง · ${esc(u.title)}</div><div id="act"></div><div class="fb idle" id="fb"></div><div class="actions"><button class="btn sec sec-l" id="prev">ย้อนกลับ</button><button class="btn sec" id="hint">💡 ขอใบ้</button>${nextBtn('ไปต่อ')}</div>`;
    $('#next').disabled=!rec?.done;$('#next').onclick=()=>toNext(n,i);$('#prev').onclick=()=>renderStage();
    $('#hint').onclick=()=>{const f=$('#fb');f.className='fb hint';f.textContent='💡 ทำนายก่อน แล้วค่อยดูผล · ถ้าไม่ตรง ให้ดูว่าคำสั่งใบไหนทำให้ต่าง'};
    const ctx={n,say:(ok,m)=>{beep(ok?'ok':'bad');Mascot.react(ok,m)},fb:(c,m)=>{const f=$('#fb');f.className='fb '+c;f.textContent=m},hint:()=>0,
      done:(err)=>{const sc=Math.max(3,6-Math.min(3,err));const old=st.lab;st.lab={done:true,score:Math.max(old?.score||0,sc),err,at:Date.now()};persist();beep('win');$('#next').disabled=false;ctx.fb('good','บันทึกผลทดลองแล้ว! ได้ '+sc+'/6 คะแนน');$$('.tl button')[i].classList.add('done')}};
    (ACT[C?.t]||ACT.fallback)($('#act'),C||{},ctx,{name:'ห้องทดลอง'});
  };
  $('#pn').innerHTML=`<div class="cols">${img(unit(n).scene,'art',u.title)}<div><div class="kick">ห้องทดลอง</div><h2>${esc(o.title)}</h2><p class="big">${esc(u.lab)}</p><p class="note ex">ทำนายก่อน แล้วค่อยดูผลจริง · ผิดได้ เรียนรู้จากผลทดลอง</p><div class="actions">${nextBtn('เริ่มทดลอง')}</div></div></div>`;
  $('#next').onclick=go;
}
function stageReal(n,i,o){
  const u=unit(n),st=U(n),C=P2C[n]?.real||{},rec=st.real,checks=C.checks||['ทำกับเพื่อนหรือครู','เล่าสิ่งที่ทำให้ฟัง','ช่วยกันตรวจผล'];
  view(head(n,i,o)+`<section class="panel"><div class="cols">${img('pose-'+(C.pose||'board'),'art contain','Techno')}<div><div class="kick">ภารกิจนอกจอ · ลงมือจริงกับเพื่อน</div><h2>${esc(o.title)}</h2><p class="big">${esc(C.say||u.real)}</p>
    <div class="note"><b>ทำให้ครบทีละข้อ แล้วแตะเครื่องหมายถูก</b>${checks.map((c,x)=>`<label style="display:flex;gap:10px;align-items:center;margin:8px 0;font-size:19px"><input type="checkbox" data-x="${x}" style="width:24px;height:24px" ${rec?.checks?.[x]?'checked':''}> ${esc(c)}</label>`).join('')}</div>
    <p class="note ex">กดแล้วได้ 10 คะแนน · ครูมาดูตอนทำจริงแล้วยืนยัน จะได้ครบ 20 คะแนน ${rec?.teacher?'· <b>ครูยืนยันแล้ว ✅</b>':''}</p>
    <div class="actions"><button class="btn" id="ok" disabled>เสร็จแล้ว <i class="arr"></i></button></div></div></div></section>`);
  bindHead(n,i,()=>u.real);
  const upd=()=>{$('#ok').disabled=!$$('input[type=checkbox]').every(c=>c.checked)};upd();
  $$('input[type=checkbox]').forEach(c=>c.onchange=upd);
  $('#ok').onclick=()=>{st.real={self:true,teacher:rec?.teacher||false,checks:$$('input[type=checkbox]').map(c=>c.checked),at:Date.now()};persist();beep('win');Mascot.set('landing','เก่งมาก!');toNext(n,i)};
}
function stageBoss(n,i,o){
  const u=unit(n),st=U(n),C=P2C[n]?.boss;
  view(head(n,i,o)+`<section class="panel" id="pn"></section>`);bindHead(n,i,()=>u.bossRules);
  const intro=()=>{$('#pn').innerHTML=`<div class="cols"><div class="arena" style="height:300px"><div class="boss-s" id="bs" style="background-image:url(${ASSETS['boss0'+n]});background-position:0 0"></div></div><div><div class="kick">ดวลบอสประจำภารกิจ ${n}</div><h2>${esc(C?.name||'บอสประจำบท')}</h2><p class="big">${esc(u.bossRules)}</p><p class="note ex">ชนะเมื่อตอบถูกให้ได้ตามกำหนด · ใช้เวลาคิดได้ · มีปุ่มพัก</p>${st.boss?.done?`<p class="note">เคยสู้แล้ว: ${st.boss.won?'ชนะ':'ยังไม่ชนะ'} · พลัง ${st.boss.energy}/20</p>`:''}<div class="actions">${nextBtn(st.boss?.done?'สู้อีกครั้ง':'เข้าสู่สนามดวล')}</div></div></div>`;
    $('#next').onclick=fight};
  const fight=()=>{$('#pn').innerHTML='<div id="act"></div>';
    ARC.boss($('#act'),C||{rounds:[]},{n,done:(res)=>{const old=st.boss;st.boss={done:true,won:res.won||old?.won,energy:Math.max(old?.energy||0,res.energy),tries:(old?.tries||0)+1,at:Date.now()};persist();
      $('#pn').innerHTML=`<div class="cols">${img(res.won?'pose-trophy':'pose-help','art contain','')}<div><div class="kick">${res.won?'ชนะแล้ว!':'ยังไม่ชนะ'}</div><h2>${res.won?'เยี่ยมมาก Techno ชนะบอส!':'ไม่เป็นไร ลองใหม่ได้'}</h2><p class="note">พลังเกม <b>${res.energy}/20</b> · ตอบถูก ${res.hits}/${res.total}</p><div class="actions"><button class="btn sec sec-l" id="again">สู้อีกครั้ง</button>${nextBtn()}</div></div></div>`;
      beep(res.won?'win':'hit');Mascot.set(res.won?'victory':'hit',res.won?'ชนะแล้ว!':'สู้ใหม่ได้');$('#next').onclick=()=>toNext(n,i);$('#again').onclick=()=>renderStage()}})};
  intro();
}
function stageReport(n,i,o){
  const u=unit(n),sc=scoreOf(n),st=U(n);st.reportSeen=true;persist();
  const stars=sc.total>=85?3:sc.total>=60?2:sc.total>=30?1:0;
  view(head(n,i,o)+`<section class="panel"><div class="cols">${img('pose-'+(stars>=2?'trophy':'thumbs'),'art contain','')}<div><div class="kick">สรุปภารกิจ ${n}</div><h2>${esc(u.title)}</h2><p class="big">ได้ <b>${sc.total}</b> จาก 100 คะแนน ${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</p>
    <table class="tbl"><tr><th>ส่วน</th><th>คะแนน</th></tr><tr><td>ฝึกทีละเรื่อง</td><td>${sc.topics}/${sc.topicsMax}</td></tr><tr><td>เกมแทรก</td><td>${sc.games}/${sc.gamesMax}</td></tr>${sc.labMax?`<tr><td>ห้องทดลอง</td><td>${sc.lab}/${sc.labMax}</td></tr>`:''}<tr><td>งานจริงกับเพื่อน</td><td>${sc.real}/20</td></tr><tr><td>ลองหลังเรียน</td><td>${sc.post}/20</td></tr><tr><td>พลังเกม + บอส (แยก)</td><td>${sc.energy+sc.boss}</td></tr></table>
    ${st.pre&&st.post?`<p class="note">ก่อนเรียน ${st.pre.score}/4 → หลังเรียน ${st.post.score/5}/4 ข้อ</p>`:''}
    <div class="actions"><button class="btn sec sec-l" id="review">ดูด่านที่ยังไม่ทำ</button>${n<9?`<button class="btn" id="nx">ภารกิจ ${n+1} <i class="arr"></i></button>`:'<button class="btn" id="nx">กลับหน้าหลัก</button>'}</div></div></div></section>`);
  bindHead(n,i,()=>`ได้ ${sc.total} จาก 100 คะแนน`);
  $('#review').onclick=()=>{const k=nextStage(n);if(k===i)toast('ทำครบทุกด่านแล้ว!');else openStage(n,k)};
  $('#nx').onclick=()=>n<9?openStage(n+1,nextStage(n+1)):renderHome();
  Mascot.set('victory','จบภารกิจแล้ว!');
}

/* ---------- ครู ---------- */
function teacher(){if(GAS)return teacherGas();Staff?teacherPanel():modal('สำหรับครู',`<form id="tf"><label>ชื่อผู้ใช้<input id="tu" class="lgi" style="width:100%;min-height:46px;border:3px solid var(--line);border-radius:12px;font:inherit;padding:2px 12px"></label><label style="display:block;margin-top:8px">รหัสผ่าน<input id="tp" type="password" style="width:100%;min-height:46px;border:3px solid var(--line);border-radius:12px;font:inherit;padding:2px 12px"></label><p class="err" id="te"></p><button class="btn">เข้าหน้าครู</button><p class="note">ทดลอง: teacher / 2468 (เปลี่ยนได้เมื่อเชื่อม GAS ป.2)</p></form>`);
  $('#tf')&&($('#tf').onsubmit=e=>{e.preventDefault();const t=School.teachers.find(x=>x.user===$('#tu').value.trim()&&x.pin===$('#tp').value);if(!t){$('#te').textContent='ชื่อหรือรหัสไม่ถูก';return}Staff=t;teacherPanel()})}
function teacherPanel(){
  const y=YEAR(),rows=y.roster.map(r=>{const st=load(School.display,r.id),a=allScore(st);return {r,st,a}});
  const csv=()=>{const h=['เลขที่','ชื่อ',...UNITS.map(u=>'ภารกิจ'+u.number),'รวม','พลังเกม'];const L=[h,...rows.map(({r,st,a})=>[r.id,r.name,...UNITS.map(u=>scoreOf(u.number,st).total),a.score,a.energy])].map(l=>l.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const b=new Blob(['﻿'+L],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`Techno-P2-ปี${School.display}-คะแนน.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  modal(`ครู · ห้อง ${esc(y.className)} ปี ${esc(School.display)}`,`<div style="overflow:auto"><table class="tbl"><tr><th>เลขที่</th>${UNITS.map(u=>`<th>${u.number}</th>`).join('')}<th>รวม/900</th><th>งานจริงรอยืนยัน</th></tr>
    ${rows.map(({r,st,a})=>{const pend=UNITS.filter(u=>{const x=U(u.number,st).real;return x?.self&&!x.teacher}).map(u=>u.number);return `<tr><td>${r.id}${r.name?' '+esc(r.name):''}</td>${UNITS.map(u=>`<td>${scoreOf(u.number,st).total}</td>`).join('')}<td><b>${a.score}</b></td><td>${pend.map(p=>`<button class="btn sm sec" data-c="${r.id}:${p}">ยืนยันภารกิจ ${p}</button>`).join(' ')||'—'}</td></tr>`}).join('')}</table></div>
    <div class="actions"><button class="btn sec sec-l" id="tout">ออกจากบัญชีครู</button><button class="btn" id="csv">ดาวน์โหลด Excel (CSV)</button></div>`,true);
  $('#csv').onclick=csv;$('#tout').onclick=()=>{Staff=null;closeModal()};
  $$('[data-c]').forEach(b=>b.onclick=()=>{const [id,n]=b.dataset.c.split(':'),st=load(School.display,id);U(Number(n),st).real.teacher=true;LS.set(rKey(School.display,id),st);if(Rider&&Rider.id===id)S=st;toast('ยืนยันงานจริงแล้ว');teacherPanel()});
}

function teacherGas(){
  if(StaffToken)return loadReport();
  modal('สำหรับครู',`<form id="tf"><label>ชื่อผู้ใช้<input id="tu" style="width:100%;min-height:46px;border:3px solid var(--line);border-radius:12px;font:inherit;padding:2px 12px"></label><label style="display:block;margin-top:8px">รหัสผ่าน<input id="tp" type="password" style="width:100%;min-height:46px;border:3px solid var(--line);border-radius:12px;font:inherit;padding:2px 12px"></label><p class="err" id="te"></p><button class="btn">เข้าหน้าครู</button></form>`);
  $('#tf').onsubmit=e=>{e.preventDefault();Loading.show('กำลังเช็กรหัส');gas('loginStaff',$('#tu').value.trim(),$('#tp').value).then(r=>{Loading.hide();StaffToken=r.token;loadReport()}).catch(err=>{Loading.hide();$('#te').textContent=(err&&err.message)||'เข้าไม่ได้'})};
}
function loadReport(year){
  Loading.show('กำลังเปิดคะแนนห้อง');
  gas('getTeacherReport',StaffToken,year||'').then(r=>{Loading.hide();reportPanel(r)}).catch(err=>{Loading.hide();StaffToken='';toast((err&&err.message)||'เปิดไม่ได้');teacherGas()});
}
function reportPanel(r){
  const rows=r.roster.map(x=>{const us=UNITS.map(u=>x.units.find(z=>Number(z.unit)===u.number)||{});const total=us.reduce((s,z)=>s+(Number(z.total)||0),0);return {x,us,total}});
  const csv=()=>{const h=['เลขที่','ชื่อ',...UNITS.map(u=>'ภารกิจ'+u.number),'รวม'];const L=[h,...rows.map(({x,us,total})=>[x.code,x.name,...us.map(z=>z.total||0),total])].map(l=>l.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const b=new Blob(['\ufeff'+L],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='Techno-P2-ปี'+r.year+'-คะแนน.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  modal(`${r.role==='admin'?'แอดมิน':'ครู'} · ปี ${esc(r.year)}`,`<label>ดูปีการศึกษา <select id="ry">${r.years.map(y=>`<option ${y===r.year?'selected':''}>${esc(y)}</option>`).join('')}</select></label>
    <div style="overflow:auto"><table class="tbl"><tr><th>เลขที่/ชื่อ</th>${UNITS.map(u=>`<th>${u.number}</th>`).join('')}<th>รวม/900</th><th>งานจริงรอยืนยัน</th></tr>
    ${rows.map(({x,us,total})=>`<tr><td>${esc(x.code)} ${esc(x.name)}${x.active?'':' (พัก)'}</td>${us.map(z=>`<td>${z.total??0}</td>`).join('')}<td><b>${total}</b></td><td>${us.filter(z=>z.self&&!z.teacher).map(z=>`<button class="btn sm sec" data-c="${esc(x.code)}:${z.unit}">ยืนยันภารกิจ ${z.unit}</button>`).join(' ')||'—'}</td></tr>`).join('')}</table></div>
    ${r.role==='admin'?`<details><summary>เพิ่มนักเรียน</summary><textarea id="names" rows="3" style="width:100%" placeholder="หนึ่งชื่อต่อหนึ่งบรรทัด"></textarea><button class="btn sm sec" id="addn">เพิ่มรายชื่อ</button></details>`:''}
    <div class="actions"><button class="btn sec sec-l" id="tout">ออกจากบัญชีครู</button><button class="btn" id="csv">ดาวน์โหลด Excel (CSV)</button></div>`,true);
  $('#csv').onclick=csv;$('#tout').onclick=()=>{StaffToken='';closeModal()};$('#ry').onchange=e=>loadReport(e.target.value);
  $$('[data-c]').forEach(b=>b.onclick=()=>{const [code,u]=b.dataset.c.split(':');Loading.show('กำลังบันทึก');gas('teacherConfirmReal',StaffToken,r.year,code,Number(u)).then(()=>{Loading.hide();toast('ยืนยันงานจริงแล้ว');loadReport(r.year)}).catch(e=>{Loading.hide();toast(e&&e.message||'บันทึกไม่ได้')})});
  if($('#addn'))$('#addn').onclick=async()=>{const names=$('#names').value.split('\n').map(s=>s.trim()).filter(Boolean);if(!names.length)return;Loading.show('กำลังเพิ่มรายชื่อ');try{for(const n of names)await gas('upsertStudent',StaffToken,r.year,'',n,true);Loading.hide();toast('เพิ่มรายชื่อแล้ว');CFG=null;loadReport(r.year)}catch(e){Loading.hide();toast(e&&e.message||'เพิ่มไม่ได้')}};
}

/* ---------- เริ่มต้น ---------- */
(function init(){
  for(let k=0;k<14;k++){const b=document.createElement('i'),s=10+Math.random()*30;b.style.cssText=`left:${Math.random()*100}%;width:${s}px;height:${s}px;animation-duration:${14+Math.random()*18}s;animation-delay:${-Math.random()*20}s`;$('#sea').append(b)}
  bar();renderLogin();
})();
