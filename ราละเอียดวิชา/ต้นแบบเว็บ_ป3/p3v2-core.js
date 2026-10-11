/* Techno ป.3 v2 · ดาวธาตุพฤกษา · แกนหลัก: เข้าสู่ระบบ, หน้าบท, ตัวเล่นด่าน 14 ด่าน/บท, คะแนน 100/บท, หน้าครู
   ใช้ engine เดียวกับ ป.2 (ACT/ARC/QUEST) และข้อมูลโจทย์เดิมของ ป.3 (P3V2 = banks) · สถานะผู้เรียนใช้รูปแบบเดิมที่ GAS ป.3 รองรับ */
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=(a,seed)=>{const r=a.map((x,i)=>[x,i]);let s=seed??Math.floor(Math.random()*1e9);const rnd=()=>(s=(s*1664525+1013904223)%4294967296)/4294967296;for(let i=r.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r.map(x=>x[0])};
const permFor=(s,n)=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)}return shuffle([...Array(n).keys()],(h>>>0)%4294967296)};
const img=(k,cls='',alt='')=>`<img class="${cls}" src="${ASSETS[k]||''}" alt="${esc(alt)}">`;
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const KEY='krukan-p3-v2';
const U3=P3DATA.units,D3=P3V2,Bridge=window.P3Bridge||{active:false};
const unit=n=>U3[n-1];
const artOf=n=>unit(n).background.replace(/\.png$|\.webp$/,'');
const KIND_ICON={story:'📖',pretest:'📝',lesson:'💡',worked_example:'🧪',challenge:'⭐',minigame:'🎮',sandbox:'🔬',product:'🎨',posttest:'✅',boss:'👾',report:'🏆'};
const KIND_NAME={story:'เปิดเรื่อง',pretest:'ลองก่อนเรียน',lesson:'เรียนรู้',worked_example:'ดูตัวอย่าง',challenge:'ภารกิจจริง',minigame:'เกม',sandbox:'สนามทดลอง',product:'ชิ้นงาน',posttest:'ลองหลังเรียน',boss:'ดวลบอส',report:'สรุป'};
const MAXP={5:15,6:5,9:15,10:5,11:20,12:20,13:20};
/* ถ้อยคำสำหรับเด็ก ป.3 (ย่อจากเนื้อหาในแผน) */
const KID={
 1:{g:'ตัดสินใจจากกติกาให้ถูก และบอกวิธีคิดให้เพื่อนทำตามได้',t:'คิดอย่างมีเหตุผล · อ่านเงื่อนไขก่อนตัดสินใจ',a:'เงื่อนไขคือกติกา: “ถ้าเกิดเรื่องนี้ ก็ได้ผลแบบนี้” เช่น ประตูเปิดเมื่อมีเหรียญฟ้า 2 เหรียญ ต้องอ่านกติกาให้ครบก่อนตัดสินใจ',b:'แผนที่ดีต้องให้เพื่อนทำตามได้ จึงต้องบอกจุดเริ่ม ตอนที่ต้องเลือก และผลที่จะได้ให้ครบ',ex:'ลองดู: เหรียญ A–A ผ่านประตูทอง ลองเขียนทุกแบบ A–A, A–B, B–A, B–B แล้ววาดทางออก',p:'ผังตัดสินใจ 1 เรื่อง พร้อมเล่าว่าแต่ละทางมาจากเงื่อนไขอะไร'},
 2:{g:'เขียนโปรแกรมให้ครบทุกกรณี ทดลองทีละขั้น แล้วแก้บั๊กให้ได้',t:'โปรแกรมเลือกทาง · หาบั๊กแล้วแก้',a:'โปรแกรมเลือกทางตามสิ่งที่เจอ: ถ้าประตูเปิดไปทางหนึ่ง ถ้าปิดต้องอ้อมไปอีกทาง ต้องลองให้ครบทุกกรณี',b:'ถ้าผลผิด ให้ไล่ดูทีละลูกศร หาจุดแรกที่ไปผิดทาง แก้เฉพาะจุดนั้น แล้วลองใหม่ทุกกรณี',ex:'ลองดู: หุ่นส่งของไปประตูฟ้าหรือชมพู ครูกดเดินทีละคำสั่งให้ดูว่าไปทางไหน',p:'โปรแกรมลูกศร ผังตัดสินใจ และบันทึกก่อน–หลังแก้บั๊ก'},
 3:{g:'ใช้อินเทอร์เน็ตอย่างปลอดภัย และรู้ว่าต้องขอความช่วยเหลือเมื่อไหร่',t:'ใช้อินเทอร์เน็ตอย่างปลอดภัย',a:'ออนไลน์ต้องปลอดภัย: ไม่บอกที่อยู่ เบอร์โทร หรือรหัสผ่านให้คนแปลกหน้า',b:'ถ้าเจอข้อความหรือภาพที่ไม่สบายใจ ให้หยุด แล้วบอกครูหรือผู้ปกครองทันที',ex:'ลองดู: เกมขอที่อยู่บ้านเพื่อแจกรางวัล เราควรทำอย่างไร?',p:'ป้ายกติกาความปลอดภัย 3 ข้อของห้องเรา'},
 4:{g:'ค้นหาให้ตรงเรื่อง แล้วเลือกเก็บข้อมูลที่ใช้ได้',t:'ค้นหาและเลือกข้อมูล',a:'ค้นให้เจอ ต้องเลือกคำค้นที่ตรงเรื่อง แล้วอ่านชื่อ แหล่ง และข้อความย่อก่อนเปิด',b:'เก็บเฉพาะข้อมูลที่ใช้กับงานของเรา ข้อมูลที่ไม่ตรงเรื่องไม่ต้องเก็บ',ex:'ลองดู: อยากพับเรือกระดาษ ควรพิมพ์คำค้นว่าอะไรถึงจะเจอวิธีทำ',p:'ตารางข้อมูลที่ค้นเจอ พร้อมบอกว่าเลือกเพราะอะไร'},
 5:{g:'ทำสไลด์ที่ข้อมูลถูกต้อง อ่านง่าย และสรุปได้ชัด',t:'ทำสไลด์นำเสนอข้อมูล',a:'สไลด์ที่ดีมีหัวข้อตรงคำถาม ข้อความสั้น ตัวเลขถูกต้อง และข้อสรุปที่อ่านแล้วเข้าใจ',b:'ภาพต้องช่วยอธิบายข้อมูล ไม่ใช่แค่ตกแต่ง และต้องตรวจตัวเลขก่อนนำเสนอเสมอ',ex:'ลองดู: ผลสำรวจเดิน 6 คน รถ 4 คน ควรเขียนข้อสรุปว่าอะไร',p:'สไลด์ 3 แผ่น: หัวข้อ ตัวเลข และข้อสรุป'},
 6:{g:'วางแผนให้ขนของครบด้วยจำนวนเที่ยวน้อยที่สุด',t:'วางแผนแก้ปัญหาอย่างเป็นระบบ',a:'ดูข้อจำกัดก่อน เช่น สะพานรับได้กี่หน่วย แล้ววางแผนให้ขนน้อยเที่ยวที่สุด',b:'ลองหลายแผนแล้วเทียบกัน เลือกแผนที่ทำได้จริงและใช้เที่ยวน้อย',ex:'ลองดู: สะพานรับได้ 3 หน่วย มีของ 4 ชิ้น จะแบ่งกี่เที่ยว',p:'แผนขนของ พร้อมเหตุผลว่าทำไมแผนนี้ดีที่สุด'},
 7:{g:'ใช้บัตรทำซ้ำให้โปรแกรมสั้นลง และนับรอบให้ถูก',t:'โปรแกรมทำซ้ำ',a:'ทำซ้ำช่วยให้โปรแกรมสั้นลง เช่น เดิน 4 ครั้ง ใช้บัตรทำซ้ำใบเดียวแทนลูกศร 4 ตัว',b:'ต้องนับรอบให้ถูก ถ้ารอบไม่พอจะไปไม่ถึง ถ้ารอบเกินจะชนหรือเลยจุดหมาย',ex:'ลองดู: เดินไปขวา 4 ช่อง ใช้ทำซ้ำ 4 รอบกับลูกศร →',p:'โปรแกรมที่ใช้ทำซ้ำ พร้อมบอกว่าทำซ้ำกี่รอบ เพราะอะไร'},
 8:{g:'ค้นหาความรู้อย่างสุภาพ และเลือกเว็บที่ปลอดภัย',t:'ค้นหาความรู้อย่างสุภาพ',a:'ค้นหาแล้วต้องใช้คำสุภาพ และตรวจว่าเว็บน่าเชื่อถือ มีชื่อผู้จัดทำชัดเจน ไม่ขอข้อมูลส่วนตัว',b:'ถ้าผลค้นหาขอเบอร์หรือที่อยู่ ให้ข้ามไป และบอกผู้ใหญ่',ex:'ลองดู: เพื่อนถามเวลาเปิดตลาด เราควรตอบอย่างไรให้สุภาพ',p:'ข้อความสุภาพ 3 ข้อความ และรายการเว็บที่เลือกเปิด'},
 9:{g:'ใช้ AR อย่างปลอดภัย และตรวจว่าภาพตรงกับของจริงไหม',t:'เทคโนโลยี AR ตรวจของจริง',a:'AR เอาภาพดิจิทัลมาซ้อนกับของจริง ต้องเทียบว่าภาพตรงกับของจริงไหม',b:'ถ้าภาพบอกไม่ตรงกับป้ายหรือของจริง ให้เชื่อของจริง แล้วตรวจอีกครั้ง',ex:'ลองดู: ในสวนมีต้นไม้ ภาพ AR มีปลาอยู่บนกิ่ง ข้อมูลไหนไม่ตรง',p:'บันทึกการตรวจ AR 1 รายการ: อะไรตรง อะไรไม่ตรง'}
};
const UCOL={1:'#7ed957',2:'#4ef4d2',3:'#ffd34f',4:'#b49bff',5:'#ff8ac1',6:'#6fd3ff',7:'#ffb35c',8:'#ff7a6b',9:'#c6f06b'};

/* ---------- ผู้เรียน/สถานะ ---------- */
let cfg=LS.get(KEY+':cfg',null)||(()=>{const c={displayYear:'2569',years:{'2569':{className:'ป.3/1',pin:'1234',students:Array.from({length:20},(_,i)=>({code:String(i+1).padStart(2,'0'),name:'นักเรียนตัวอย่าง '+String(i+1).padStart(2,'0'),active:true}))}}};LS.set(KEY+':cfg',c);return c})();
const year=()=>cfg.years[cfg.displayYear];
const blank=()=>({units:{},sound:true});
let player=null,S=blank(),staff=null,saveTimer=0,saving=false,again=false,current={n:1,s:1};
const us=n=>S.units[n]||(S.units[n]={done:{},scores:{},pre:null,post:null,product:'',teacherConfirmed:false,reflections:{}});
const isDone=(n,s)=>!!us(n).done[s],total=n=>Object.values(us(n).scores).reduce((a,b)=>a+(Number(b)||0),0);
const complete=n=>Object.keys(us(n).done).length;
const nextOpen=n=>{for(let s=1;s<=14;s++)if(!isDone(n,s))return s;return 14};
const skey=(y,c)=>`${KEY}:${y}:${c}`;
function persist(){
  if(!player||player.guest)return;
  if(!Bridge.active){LS.set(skey(player.year,player.code),S);return}
  clearTimeout(saveTimer);saveTimer=setTimeout(flush,700);
}
function flush(){
  if(!Bridge.active||!player||player.guest||!player.token)return;
  if(saving){again=true;return}saving=true;
  Bridge.saveProgress(player.token,JSON.parse(JSON.stringify(S))).then(()=>{saving=false;if(again){again=false;flush()}}).catch(e=>{saving=false;toast('ยังบันทึกไม่ได้: '+e.message);saveTimer=setTimeout(flush,5000)});
}
function award(n,s,pts){
  const u=us(n),prev=u.scores[s]||0,mx=MAXP[s]||0;
  u.done[s]=true;if(mx)u.scores[s]=Math.max(prev,Math.min(mx,Math.round(pts)));
  persist();const add=(u.scores[s]||0)-prev;
  if(add>0)reward(add,mx);
  return add;
}

/* ---------- เสียง / พูด / โหลด / โมดอล ---------- */
let AC=null;
function beep(k){if(!S.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const seq={ok:[[660,.09],[880,.12]],bad:[[220,.18]],click:[[520,.04]],win:[[523,.1],[659,.1],[784,.1],[1047,.2]],hit:[[140,.15]]}[k]||[];let t=AC.currentTime;seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d);t+=d})}catch(e){}}
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='th-TH';u.rate=.9;speechSynthesis.speak(u)}catch(e){}}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2200)}
const Loading={show(t){this.hide();const e=document.createElement('div');e.className='loading';e.id='loading';e.innerHTML=`<div class="lc"><div class="dots"><i></i><i></i><i></i></div><div>${esc(t||'กำลังโหลด…')}</div></div>`;document.body.append(e)},hide(){$('#loading')?.remove()}};
function modal(title,body){closeModal();const m=document.createElement('div');m.className='modal-bg';m.id='modal';m.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><button class="x" aria-label="ปิด">×</button><h2>${title}</h2>${body}</section>`;document.body.append(m);m.onclick=e=>{if(e.target===m)closeModal()};$('.x',m).onclick=closeModal}
const closeModal=()=>$('#modal')?.remove();
function reward(sc,max){const r=document.createElement('div');r.className='reward';r.innerHTML=`<div class="rw-card"><div class="rw-stars">${'⭐'.repeat(Math.max(1,Math.round(sc/Math.max(1,max)*3)))}</div><div class="rw-pt">+${sc} คะแนน</div></div>`;document.body.append(r);setTimeout(()=>r.remove(),1700)}

/* ---------- Techno มุมจอ (ท่าตามสถานการณ์) ---------- */
const MPOSE={idle:'pose-present',think:'pose-think',ok:'pose-thumbs',bad:'pose-puzzled',win:'pose-victory',scan:'pose-magnifier',lock:'pose-lock',book:'pose-book',run:'pose-runR'};
const Mascot={el:null,t:0,
  mount(){if(this.el)return;const e=document.createElement('div');e.className='mascot';e.innerHTML='<div class="say"></div><img alt="Techno">';document.body.append(e);this.el=e;this.set('idle')},
  set(k,say,ms=2600){this.mount();$('img',this.el).src=ASSETS[MPOSE[k]||MPOSE.idle];const s=$('.say',this.el);clearTimeout(this.t);if(say){s.textContent=say;s.classList.add('on');this.t=setTimeout(()=>s.classList.remove('on'),ms)}else s.classList.remove('on')},
  react(ok,say){this.set(ok?'ok':'bad',say,2400);clearTimeout(this._r);this._r=setTimeout(()=>this.set(this.base||'idle'),2400)}};

/* ---------- โครงหน้า ---------- */
const view=h=>{$('#main').innerHTML=h;window.scrollTo(0,0)};
function bar(){
  const a=$('#bar-right');
  a.innerHTML=(player?`<span class="chip">${player.guest?'ผู้เข้าชม':'เลขที่ '+esc(player.code)}</span><button class="chip" id="b-sound">${S.sound?'🔊 เสียง':'🔇 ปิดเสียง'}</button><button class="chip" id="b-out">ออก</button>`:'')+`<button class="chip" id="b-teacher">🔒 สำหรับครู</button>`;
  $('#b-sound')&&($('#b-sound').onclick=()=>{S.sound=!S.sound;persist();bar()});
  $('#b-out')&&($('#b-out').onclick=logout);$('#b-teacher').onclick=teacherOpen;
}
function logout(){persist();if(Bridge.active)flush();player=null;S=blank();Mascot.el&&(Mascot.el.style.display='none');document.body.dataset.u='';bar();renderLogin()}

/* ---------- เข้าสู่ระบบ ---------- */
let CFGREMOTE=null;
function renderLogin(){
  if(Bridge.active&&!CFGREMOTE){
    Loading.show('กำลังเปิดห้องเรียน');
    Bridge.getPublicConfig().then(r=>{CFGREMOTE={displayYear:r.displayYear,className:r.className,codes:r.codes.map(x=>x.code)};Loading.hide();renderLogin()})
      .catch(e=>{Loading.hide();view(`<section class="lg"><div class="lg-card"><h2>ยังเปิดห้องเรียนไม่ได้</h2><p>${esc(e.message)}</p><button class="btn" id="rt">ลองใหม่</button> <button class="btn sec" id="gs">ลองเล่นก่อน</button></div></section>`);$('#rt').onclick=renderLogin;$('#gs').onclick=()=>{player={guest:true,name:'ผู้เข้าชม',year:cfg.displayYear};S=blank();enter()}});
    return;
  }
  const y=Bridge.active?{className:CFGREMOTE.className,codes:CFGREMOTE.codes}:{className:year().className,codes:year().students.filter(x=>x.active).map(x=>x.code)};
  let pick=y.codes[0]||'';
  view(`<section class="lg"><div class="lg-card">
    <div class="lg-top">${img('pose-wave','','Techno')}<div class="lg-bubble">สวัสดี! แตะ<b>เลขที่ของเรา</b> แล้วใส่รหัสนะ</div><span class="chip" style="background:#eaffd9;color:#1b5a34;border-color:#b6e49a">${esc(y.className)} · ปี ${esc(Bridge.active?CFGREMOTE.displayYear:cfg.displayYear)}</span></div>
    <div class="lg-pick"><h2>1 · แตะเลขที่ของเรา</h2><div class="nums">${y.codes.map(c=>`<button data-id="${esc(c)}" class="${c===pick?'sel':''}">${esc(c)}</button>`).join('')}</div></div>
    <form class="lg-form" id="lf"><h2>2 · ใส่รหัส</h2><input id="pw" type="password" inputmode="numeric" maxlength="12" placeholder="รหัสที่ครูให้" autocomplete="off"><div class="err" id="le"></div><button class="btn" style="width:100%">เข้าเรียน <i class="arr"></i></button></form>
    <div class="lg-guest"><span>หรือ</span><button class="btn sec" id="guest" type="button" style="flex:1">ลองเล่นก่อน</button></div>
  </div></section>`);
  $$('.nums button').forEach(b=>b.onclick=()=>{pick=b.dataset.id;$$('.nums button').forEach(x=>x.classList.toggle('sel',x===b));$('#le').textContent=''});
  $('#lf').onsubmit=e=>{
    e.preventDefault();const pin=$('#pw').value;
    if(Bridge.active){const btn=$('#lf .btn');btn.disabled=true;Loading.show('กำลังเช็กรหัส');
      Bridge.loginStudent(pick,pin).then(r=>{Loading.hide();player={code:r.rider.code,name:r.rider.name,year:r.rider.year,token:r.token,guest:false};S=r.state&&r.state.units?r.state:blank();enter()})
        .catch(err=>{Loading.hide();btn.disabled=false;$('#le').textContent=err.message||'เข้าเรียนไม่ได้';$('#pw').value=''});return}
    if(pin!==year().pin){$('#le').textContent='รหัสยังไม่ถูก ลองใหม่นะ';$('#pw').value='';return}
    const st=year().students.find(x=>x.code===pick);player={code:pick,name:st?st.name:pick,year:cfg.displayYear,guest:false};S=LS.get(skey(player.year,pick),null)||blank();if(!S.units)S=blank();enter();
  };
  $('#guest').onclick=()=>{player={guest:true,name:'ผู้เข้าชม',year:cfg.displayYear};S=blank();enter()};
}
function enter(){bar();Mascot.mount();Mascot.el.style.display='';Loading.show('กำลังเปิดดาวธาตุพฤกษา');setTimeout(()=>{Loading.hide();renderHome()},350)}

/* ---------- หน้าเลือกบท ---------- */
function renderHome(){
  document.body.dataset.u='';Mascot.base='idle';Mascot.set('idle','เลือกภารกิจได้เลย!');
  const sum=U3.reduce((a,u)=>a+total(u.number),0),cleared=U3.filter(u=>complete(u.number)>=14).length;
  const first=U3.find(u=>complete(u.number)<14)?.number||1;
  view(`<section class="hero"><div><div class="kick" style="color:#c6f06b">TECHNO ACADEMY · ดาวธาตุพฤกษา · ป.3</div><h1>ภารกิจพิทักษ์ดาวป่า</h1><p>เรียนรู้ · เล่นเกม · เอาชนะ Venom Mantis เพื่อปกป้องป่าของดวงดาว</p>
    <button class="btn warm" id="go">${complete(first)?'ไปต่อบท '+first:'เริ่มบทที่ 1'} <i class="arr"></i></button>
    <div class="stats"><div class="stat"><b>${sum}</b>/ 900 คะแนน</div><div class="stat"><b>${cleared}</b>/ 9 บทครบ</div><button class="btn sec sm" id="mine">📊 คะแนนของฉัน</button></div></div>
    ${img('p3-techno-explorer-map-v1','craft','Techno')}</section>
    <div class="missions">${U3.map(u=>{const n=u.number,d=complete(n);return `<button class="mcard" data-u="${n}" data-n="${n}"><div class="imw">${img(artOf(n),'im',KID[n].t)}<span class="bossb" style="background-image:url(${ASSETS.boss03})"></span>${d>=14?'<span class="done-r">ครบแล้ว ✓</span>':d>0?'<span class="cont-r">เล่นต่อ ▶</span>':'<span class="new-r">ใหม่!</span>'}</div><div class="tx"><small>บทที่ ${n}</small><h3>${esc(KID[n].t)}</h3><div class="bar-p"><i style="width:${Math.round(d/14*100)}%"></i></div><div class="meta"><span>ด่าน ${d}/14</span><span>${total(n)}/100 คะแนน</span></div></div></button>`}).join('')}</div>`);
  $('#go').onclick=()=>openStage(first,nextOpen(first));$('#mine').onclick=showMine;
  $$('.mcard').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.n);openStage(n,nextOpen(n))});
}
function showMine(){
  const rows=U3.map(u=>{const x=us(u.number);return `<tr><td>บท ${u.number} · ${esc(KID[u.number].t)}</td><td>${x.pre??'–'}</td><td>${x.post??'–'}</td><td><b>${total(u.number)}/100</b></td><td>${complete(u.number)}/14</td></tr>`}).join('');
  modal('คะแนนของฉัน',`<div style="overflow:auto"><table class="tbl"><tr><th>บท</th><th>ก่อน/20</th><th>หลัง/20</th><th>คะแนน</th><th>ด่าน</th></tr>${rows}</table></div><p class="note">คะแนนความรู้ไม่ใช้ความเร็วตัดสิน · ${player&&player.guest?'ผู้เข้าชมไม่เก็บคะแนน':'บันทึกคะแนนของเราไว้แล้ว'}</p>`);
}

/* ---------- ตัวเล่นด่าน ---------- */
function openStage(n,s){n=Math.max(1,Math.min(9,n));s=Math.max(1,Math.min(14,s));current={n,s};renderStage()}
function head(n,s){
  const st=unit(n).stages[s-1];
  return `<div class="st-top"><button class="back" id="back">เลือกบท</button><span class="st-pos">บทที่ ${n} · ด่าน ${s}/14</span></div>
  <div class="st-head"><div><small>${KIND_ICON[st.kind]} ${KIND_NAME[st.kind]} · ${esc(KID[n].t)}</small><h1>${esc(stageTitle(n,s))}</h1></div><button class="btn sec" id="listen">🔊 ฟัง</button></div>
  <nav class="tl">${unit(n).stages.map(x=>`<button data-k="${x.number}" class="${isDone(n,x.number)?'done':''} ${x.number===s?'cur':''}" title="${esc(KIND_NAME[x.kind])}">${x.number}</button>`).join('')}</nav>
  <div class="hud"><span>⭐ <b>${total(n)}</b>/100 คะแนน</span><span class="grow"></span><span>${isDone(n,s)?'✓ ผ่านด่านนี้แล้ว':'● กำลังเล่น'}</span></div>`;
}
const STITLE={story:'รับภารกิจจากเทคโน',pretest:'ลองคิดก่อนเรียน',lesson:'เรียนรู้แนวคิด',worked_example:'ดูตัวอย่างแล้วลองคิด',challenge:'ภารกิจจริง',minigame:'เกมแทรก',sandbox:'สนามทดลอง',product:'สร้างชิ้นงานของเรา',posttest:'ลองคิดหลังเรียน',boss:'ดวลบอส Venom Mantis',report:'สรุปผลของบทนี้'};
const stageTitle=(n,s)=>{const st=unit(n).stages[s-1];if(st.kind==='challenge')return s===5?'ภารกิจจริง A':'ภารกิจจริง B';if(st.kind==='minigame')return s===6?'เกมแทรกที่ 1':'เกมแทรกที่ 2';if(st.kind==='lesson')return s===3?'เรียนรู้ ตอนที่ 1':'เรียนรู้ ตอนที่ 2';return STITLE[st.kind]||st.title};
function bindHead(n,s,txt){
  $('#back').onclick=renderHome;
  $$('.tl button').forEach(b=>b.onclick=()=>openStage(n,Number(b.dataset.k)));
  $('#listen').onclick=()=>speak(typeof txt==='function'?txt():(txt||$('.panel')?.innerText||''));
}
const nextBtn=(label='ไปต่อ')=>`<button class="btn" id="next">${label} <i class="arr"></i></button>`;
const goNext=(n,s)=>s<14?openStage(n,s+1):renderHome();
function renderStage(){
  const {n,s}=current,st=unit(n).stages[s-1];document.body.dataset.u=n;Mascot.base='idle';Mascot.set('idle');
  const grid=(n===2||n===7)&&[5,6,8,9,10,13].includes(s);
  view(head(n,s)+'<section class="panel" id="pn"></section>');
  const k=st.kind;
  if(k==='story'||k==='lesson'||k==='worked_example')return rRead(n,s,k);
  if(k==='pretest'||k==='posttest')return rQuiz(n,s,k);
  if(k==='product')return rProduct(n,s);
  if(k==='report')return rReport(n,s);
  if(k==='sandbox')return grid?rQuest(n,s,'sandbox'):rExplore(n,s);
  if(k==='minigame')return grid?rQuest(n,s,'game'):rGame(n,s);
  if(k==='boss')return grid?rQuest(n,s,'boss'):rBoss(n,s);
  return grid?rQuest(n,s,'mission'):rMission(n,s);
}

/* --- เปิดเรื่อง / เรียนรู้ / ตัวอย่าง (2 หน้า) --- */
function rRead(n,s,k){
  const u=unit(n),st=u.stages[s-1],pg=us(n).reflections?.[s]||'';let page=0;
  const texts={story:[`ภารกิจบทนี้: ${KID[n].t}`,`เป้าหมายของเรา: ${KID[n].g}`],lesson:[s===3?KID[n].a:KID[n].b,'ลองบอกด้วยคำของเราเองสั้นๆ ว่าเข้าใจเรื่องนี้อย่างไร'],worked_example:[KID[n].ex,'ถ้าข้อมูลเปลี่ยน เราจะตรวจคำตอบอย่างไร']}[k];
  const draw=()=>{
    const first=page===0;
    $('#pn').innerHTML=`<div class="cols">${img(artOf(n),'art',KID[n].t)}<div><div class="kick">${KIND_NAME[k]} · หน้า ${page+1}/2</div><h2>${esc(first?(k==='story'?KID[n].t:k==='lesson'?'จำไว้นะ':'ตัวอย่าง'):'ลองคิดด้วยตัวเอง')}</h2><p class="big">${esc(texts[page])}</p>
      ${first?'':`<textarea id="refl" class="field" rows="3" placeholder="เขียนสั้นๆ ด้วยคำของเรา (ไม่มีคำตอบเดียว)">${esc(pg)}</textarea>`}
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">${img(first?'pose-present':'pose-think','','').replace('<img','<img style="width:84px"')}<span class="note" style="margin:0">${first?'อ่านแล้วกดไปต่อได้เลย':'พิมพ์ได้ หรือกดไปต่อเลยก็ได้'}</span></div>
      <div class="actions">${first?'':'<button class="btn sec sec-l" id="prev">ย้อนกลับ</button>'}${nextBtn(first?'อ่านต่อ':'เสร็จแล้ว')}</div></div></div>`;
    if(!first)$('#prev').onclick=()=>{page=0;draw()};
    $('#next').onclick=()=>{
      if(first){page=1;draw();return}
      const v=($('#refl')?.value||'').trim();if(v&&[1,3,4,7].includes(s)){us(n).reflections=us(n).reflections||{};us(n).reflections[s]=v}
      award(n,s,0);beep('win');goNext(n,s);
    };
  };
  bindHead(n,s,()=>texts[page]);draw();
}

/* --- ก่อน/หลังเรียน 5 ข้อ ข้อละ 4 คะแนน --- */
function rQuiz(n,s,k){
  const post=k==='posttest',bank=D3.Q[n],qs=bank.map(q=>({q:post?q[1]:q[0],o:q[2],a:post&&q[4]!==undefined?q[4]:q[3]}));
  const have=post?us(n).post:us(n).pre;let i=0;const ans=[];
  bindHead(n,s,()=>qs[Math.min(i,4)].q);
  const result=(a,sc)=>{
    Mascot.react(sc>=12,sc>=12?'เก่งมาก!':'ไม่เป็นไร เรียนต่อได้เลย');
    $('#pn').innerHTML=`<div class="cols">${img(post?'pose-trophy':'pose-thumbs','art contain','')}<div><div class="kick">${post?'หลังเรียน':'ก่อนเรียน'}</div><h2>ได้ ${sc} จาก 20 คะแนน</h2>
      ${qs.map((q,x)=>`<div class="note ${a[x]===q.a?'':'ex'}"><b>${x+1}. ${esc(q.q)}</b><br>${a[x]===q.a?'✅':'💡'} คำตอบ: ${esc(q.o[q.a])}</div>`).join('')}
      <div class="actions">${nextBtn()}</div></div></div>`;
    $('#next').onclick=()=>goNext(n,s);
  };
  if(have!==null&&have!==undefined&&isDone(n,s)){$('#pn').innerHTML=`<div class="cols">${img(post?'pose-trophy':'pose-thumbs','art contain','')}<div><div class="kick">${post?'หลังเรียน':'ก่อนเรียน'}</div><h2>ด่านนี้ทำแล้ว: ${have}/20</h2><p class="note">${post?'ทำใหม่เพื่อเพิ่มคะแนนได้':'คะแนนก่อนเรียนเก็บไว้เป็นฐานเทียบ ทบทวนได้แต่ไม่เปลี่ยนคะแนนเดิม'}</p><div class="actions">${nextBtn()}${post?'<button class="btn sec" id="redo">ทำใหม่</button>':''}</div></div></div>`;
    $('#next').onclick=()=>goNext(n,s);if($('#redo'))$('#redo').onclick=()=>{us(n).post=null;isDone(n,s)&&(delete us(n).done[s]);rQuiz(n,s,k)};return}
  const draw=()=>{
    const q=qs[i];
    $('#pn').innerHTML=`<div class="cols">${img(artOf(n),'art',KID[n].t)}<div><div class="track">${[0,1,2,3,4].map(x=>`<i class="${x<i?'ok':''} ${x===i?'cur':''}">${x+1}</i>`).join('<b></b>')}<img src="${ASSETS['pose-runR']}" style="left:${i*22.5}%" alt=""></div>
      <div class="kick">${post?'ข้อสอบหลังเรียน':'ลองคิดก่อนเรียน'} · ข้อ ${i+1}/5 · ${post?'ทำให้ครบ ไม่ต้องรีบ':'ตอบตามที่คิด ยังไม่ต้องรู้ทุกข้อก็ได้'}</div>
      <p class="q big">${esc(q.q)}</p><div class="opts">${permFor(q.q,q.o.length).map(x=>`<button class="opt ${ans[i]===x?'sel':''}" data-x="${x}">${esc(q.o[x])}</button>`).join('')}</div>
      <div class="actions">${i>0?'<button class="btn sec sec-l" id="prev">ย้อนข้อ</button>':''}<button class="btn" id="go" ${ans[i]==null?'disabled':''}>${i<4?'ข้อต่อไป':'ส่งคำตอบ'} <i class="arr"></i></button></div></div></div>`;
    $$('.opt').forEach(b=>b.onclick=()=>{ans[i]=Number(b.dataset.x);beep('click');draw()});
    if($('#prev'))$('#prev').onclick=()=>{i--;draw()};
    $('#go').onclick=()=>{if(i<4){i++;draw();return}
      const sc=ans.reduce((t,a,x)=>t+(a===qs[x].a?4:0),0);
      if(post){const u=us(n);u.post=sc;award(n,s,sc)}else{us(n).pre=us(n).pre??sc;award(n,s,0)}
      beep(sc>=12?'win':'ok');persist();result(ans,sc)};
  };
  draw();
}

/* --- ตัวช่วยเล่นกิจกรรม: หัวใจ ความต่อเนื่อง ผลตอบรับ --- */
function playEngine(n,s,kick,run,onDone){
  const pn=$('#pn');
  pn.innerHTML=`<div class="kick">${kick}</div><div class="ghud"><span>ภารกิจย่อย</span><span class="grow"></span><span id="streak"></span><span id="hearts">❤️❤️❤️</span></div><div id="act"></div><div class="fb idle" id="fb"></div><div class="actions"><button class="btn sec" id="hint">💡 ขอใบ้</button>${nextBtn('ไปต่อ')}</div>`;
  let hearts=3,restarts=0,streak=0,finished=isDone(n,s);
  $('#next').disabled=!finished;$('#next').onclick=()=>goNext(n,s);
  const draw=()=>{const h=$('#hearts');if(h)h.textContent='❤️'.repeat(hearts)+'🖤'.repeat(3-hearts);const st=$('#streak');if(st)st.textContent=streak>=2?'🔥 ถูกติดกัน '+streak:''};
  const ctx={n,
    say:(ok,m)=>{beep(ok?'ok':'bad');Mascot.react(ok,m);if(ok){streak++;draw();return}streak=0;hearts--;draw();const a=$('#act');a&&(a.classList.remove('shake'),void a.offsetWidth,a.classList.add('shake'));
      if(hearts<=0){restarts++;ctx.fb('warn','พลังหมดแล้ว! ชาร์จพลังใหม่ แล้วเริ่มรอบนี้อีกครั้งนะ');setTimeout(start,1400)}},
    fb:(c,m)=>{const f=$('#fb');if(f){f.className='fb '+c;f.textContent=m}},
    hint:()=>0,
    done:(err)=>{const e=err+restarts*2;finished=true;onDone(e);$('#next').disabled=false;ctx.fb('good','ผ่านแล้ว!');$$('.tl button')[s-1]?.classList.add('done')}};
  const start=()=>{hearts=3;streak=0;draw();run($('#act'),ctx)};
  $('#hint').onclick=()=>{ctx.fb('hint','💡 ลองอ่านโจทย์อีกที แล้วดูว่าตัวเลือกไหนตรงกติกาที่สุด')};
  start();return ctx;
}
const ptsFor=(max,err,floor)=>Math.max(floor,max-Math.round(err*max/6));

/* --- ภารกิจจริง A/B: 3 ข้อ ข้อละ 5 คะแนน --- */
function rMission(n,s){
  const u=unit(n),bank=(s===5?D3.M:D3.M2)[n]||D3.M[n];
  const qs=bank.map(it=>({q:it[0],o:it[1],a:it[2],why:it[3]}));
  bindHead(n,s,()=>'ภารกิจจริง '+(s===5?'A':'B'));
  $('#pn').innerHTML=`<div class="cols">${img(artOf(n),'art',KID[n].t)}<div><div class="kick">ภารกิจจริง ${s===5?'A':'B'} · ${esc(KID[n].t)}</div><h2>ใช้สิ่งที่เรียนแก้โจทย์ใหม่ 3 ข้อ</h2><p class="big">โจทย์ชุดนี้ไม่ซ้ำกับตัวอย่าง ตอบผิดมีใบ้ ลองใหม่ได้ · ผ่านทั้ง 3 ข้อได้ 15 คะแนน</p>${isDone(n,s)?`<p class="note">ผ่านแล้ว: ${us(n).scores[s]||0}/15 · เล่นซ้ำเพื่อเก็บคะแนนเต็มได้</p>`:''}<div class="actions">${nextBtn('เริ่มภารกิจ')}</div></div></div>`;
  $('#next').onclick=()=>playEngine(n,s,'ภารกิจจริง '+(s===5?'A':'B')+' · '+esc(KID[n].t),(host,ctx)=>ACT.choose(host,{qs},ctx),err=>award(n,s,ptsFor(15,err,6)));
}

/* --- เกมแทรก (ไม่ใช่ตารางเดินช่อง) --- */
function gameSpec(n,s){
  const v=s===6?0:1;
  if(n===1||n===5){const d=D3.SSEQ[n][v];return {kick:'เกมเรียงแผน · '+d.title,intro:d.task,run:(host,ctx)=>ACT.order(host,{prompt:d.title+': '+d.task,items:d.steps.map(x=>({x,e:'🧩'})),decoys:d.cards.filter(c=>!d.steps.includes(c)),why:'เรียงถูกครบ 3 ขั้น',hint:'คิดดูว่าต้องรู้อะไรก่อน แล้วค่อยทำอะไรต่อ'},ctx)}}
  if(n===4){const d=D3.SSEARCH[v];return {kick:'เกมนักสืบค้นหา · '+d.title,intro:'คำค้น → ผลลัพธ์ → ข้อมูลที่ใช้ได้',run:(host,ctx)=>ACT.choose(host,{qs:[
    {q:'ขั้น 1: เลือกคำค้นที่ตรงคำถาม',o:d.queries,a:d.queries.indexOf(d.query),why:'คำค้นต้องบอกสิ่งที่อยากรู้ให้ชัด'},
    {q:'ขั้น 2: เลือกผลค้นหาที่ตอบโจทย์',o:d.results,a:d.results.indexOf(d.result),why:'ดูชื่อเรื่องและข้อความย่อให้ตรงเรื่อง'},
    {q:'ขั้น 3: เก็บข้อมูลที่นำไปใช้ได้',o:d.facts,a:d.facts.indexOf(d.fact),why:'เก็บเฉพาะข้อมูลที่ใช้กับงานของเรา'}]},ctx)}}
  if(n===3||n===8){const d=D3.SMAIL[n][v],acts=n===3?['เปิดได้','ตอบได้','หยุดแล้วบอกครู']:['เปิดดู','ข้าม','ตอบอย่างสุภาพ','แก้เป็นคำสุภาพ'];
    return {kick:(n===3?'เกมศูนย์สัญญาณปลอดภัย · ':'เกมนักสืบผลค้นหา · ')+d.title,intro:n===3?'อ่านสถานการณ์ แล้วเลือกสิ่งที่ปลอดภัย':'อ่านข้อมูลก่อนตัดสินใจ',
      run:(host,ctx)=>ACT.choose(host,{qs:d.items.map((it,i)=>({q:'สัญญาณที่ '+(i+1)+': '+it[0],o:acts,a:acts.indexOf(it[1]),why:'ปลอดภัยและเหมาะสมที่สุด'}))},ctx)}}
  if(n===6){const d=D3.SCARGO[v];return {kick:'เกมขนของข้ามสะพาน · '+d.title,intro:`สะพานรับได้เที่ยวละ ${d.capacity} หน่วย ขนให้ครบด้วยจำนวนเที่ยวน้อยที่สุด`,run:(host,ctx)=>ACT.cargo(host,d,ctx)}}
  if(n===9){const d=D3.SAR[v];return {kick:'เกมตรวจภาพ AR · '+d.title,intro:'เทียบของจริงกับภาพดิจิทัล แล้วแตะชั้นข้อมูลที่ไม่ตรง',run:(host,ctx)=>ACT.find(host,{prompt:'ของจริง: '+d.base+' — แตะชั้นข้อมูลที่ไม่ตรงกับของจริง',items:d.layers.map(l=>({x:l[0],e:'🔮',yes:l[1],no:'ชั้นนี้ยังตรงกับของจริง',why:d.answer})),why:d.answer},ctx)}}
  return {kick:'เกม',intro:'',run:(h,c)=>c.done(0)};
}
function rGame(n,s){
  const g=gameSpec(n,s);bindHead(n,s,()=>g.intro);
  $('#pn').innerHTML=`<div class="cols">${img(artOf(n),'art',KID[n].t)}<div><div class="kick">เกมแทรก · ${esc(KID[n].t)}</div><h2>${esc(g.kick.split(' · ')[0])}</h2><p class="big">${esc(g.intro)}</p><p class="note ex">ผิดได้ ลองใหม่ได้ · มีหัวใจ 3 ดวง · ผ่านได้ 5 คะแนน</p>${isDone(n,s)?`<p class="note">ผ่านแล้ว: ${us(n).scores[s]||0}/5</p>`:''}<div class="actions">${nextBtn('เริ่มเล่น')}</div></div></div>`;
  $('#next').onclick=()=>playEngine(n,s,esc(g.kick),g.run,err=>award(n,s,Math.max(2,5-err)));
}

/* --- สนามทดลอง (ไม่เก็บคะแนน) --- */
function rExplore(n,s){
  const qs=(D3.M2[n]||D3.M[n]).map(it=>({q:it[0],o:it[1],a:it[2],why:it[3]})),seen=new Set();
  bindHead(n,s,()=>'สนามทดลอง ลองเลือกดูผลได้เลย');
  const draw=()=>{
    $('#pn').innerHTML=`<div class="cols">${img(artOf(n),'art',KID[n].t)}<div><div class="kick">สนามทดลอง · ลองเลือกดูผล ไม่มีคะแนน</div><h2>ลองเลือกทุกแบบ แล้วดูว่าเกิดอะไรขึ้น</h2>
      ${qs.map((q,i)=>`<div class="note ${seen.has(i)?'':'ex'}"><b>${i+1}. ${esc(q.q)}</b><div class="opts">${q.o.map((c,x)=>`<button class="opt" data-q="${i}" data-x="${x}">${esc(c)}</button>`).join('')}</div><div class="exp" id="e${i}"></div></div>`).join('')}
      <div class="actions">${nextBtn(seen.size>=qs.length?'ไปต่อ':'ลองให้ครบก่อนนะ')}</div></div></div>`;
    $('#next').disabled=seen.size<qs.length&&!isDone(n,s);
    $$('.opt').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.q),x=Number(b.dataset.x),ok=x===qs[i].a;seen.add(i);beep(ok?'ok':'click');
      $('#e'+i).innerHTML=`<p class="${ok?'fb good':'fb hint'}" style="margin:6px 0 0">${ok?'✅ เหมาะสม · ':'💭 ยังไม่เหมาะ · '}${esc(qs[i].why||'')}</p>`;b.classList.add(ok?'right':'wrong');
      if(seen.size>=qs.length){$('#next').disabled=false;$('#next').textContent='ไปต่อ'}});
    $('#next').onclick=()=>{award(n,s,0);goNext(n,s)};
  };
  draw();
}

/* --- ชิ้นงาน: 15 คะแนนเมื่อส่งเหตุผล · 20 เมื่อครูยืนยัน --- */
function rProduct(n,s){
  const u=us(n);bindHead(n,s,()=>KID[n].p);
  $('#pn').innerHTML=`<div class="cols">${img(artOf(n),'art',KID[n].t)}<div><div class="kick">ชิ้นงานรายบุคคล · ${esc(KID[n].t)}</div><h2>สร้างหลักฐานของเรา</h2><p class="big">${esc(KID[n].p)}</p>
    <textarea id="product" class="field" rows="4" placeholder="เล่าหรือเขียนอธิบายผลงานและเหตุผลของเรา (ให้ครูช่วยพิมพ์ได้)">${esc(u.product||'')}</textarea>
    <div class="opts">${['เพราะข้อมูลบอกว่า…','ฉันเลือกอย่างนี้เพราะ…','ถ้าข้อมูลเปลี่ยน ฉันจะ…'].map(x=>`<button class="opt chip-s">${x}</button>`).join('')}</div>
    <p class="note ex">ส่งแล้วได้ 15 คะแนน · ครูมาดูผลงานจริงแล้วยืนยัน จะได้ครบ 20 คะแนน ${u.teacherConfirmed?'· <b>ครูยืนยันแล้ว ✅</b>':''}</p>
    <div class="actions"><button class="btn" id="save">ส่งชิ้นงาน <i class="arr"></i></button>${isDone(n,s)?nextBtn('ไปต่อ'):''}</div></div></div>`;
  $$('.chip-s').forEach(b=>b.onclick=()=>{const t=$('#product');t.value=(t.value+' '+b.textContent).trim();t.focus()});
  $('#save').onclick=()=>{const v=$('#product').value.trim();if(v.length<12){toast('เล่าเหตุผลให้ยาวขึ้นอีกนิดนะ');return}u.product=v;award(n,s,u.teacherConfirmed?20:15);beep('win');goNext(n,s)};
  if($('#next'))$('#next').onclick=()=>goNext(n,s);
}

/* --- ดวลบอส Venom Mantis --- */
function rBoss(n,s){
  const qs=(D3.B[n]||[]).map(it=>({q:it[0],o:it[1],a:it[2],why:it[3]}));
  bindHead(n,s,()=>'ดวลบอส Venom Mantis');
  const intro=()=>{
    $('#pn').innerHTML=`<div class="cols"><div class="arena" style="height:300px"><div class="boss-s" style="background-image:url(${ASSETS.boss03});background-position:0 0"></div></div><div><div class="kick">ดวลบอสประจำบท ${n}</div><h2>Venom Mantis ปรากฏตัว!</h2><p class="big">ตอบโจทย์ให้ถูกเพื่อโจมตีบอส ตอบผิดบอสจะโจมตียาน · มีโล่ช่วยตัดตัวเลือกผิด 1 ข้อ</p>${isDone(n,s)?`<p class="note">เคยสู้แล้ว: ${us(n).scores[s]||0}/20</p>`:''}<div class="actions">${nextBtn('เข้าสู่สนามดวล')}</div></div></div>`;
    $('#next').onclick=fight;
  };
  const fight=()=>{
    $('#pn').innerHTML='<div id="act"></div>';
    ARC.boss($('#act'),{name:'Venom Mantis',need:2,say:['ข้าเปลี่ยนกติกาแล้ว!','อ่านให้ดีนะ เด็กน้อย','ข้าไม่ยอมแพ้ง่ายๆ!'],rounds:qs},{n:3,done:(res)=>{
      const pts=Math.max(res.won?12:8,res.energy);award(n,s,pts);
      $('#pn').innerHTML=`<div class="cols">${img(res.won?'pose-trophy':'pose-help','art contain','')}<div><div class="kick">${res.won?'ชนะแล้ว!':'ยังไม่ชนะ'}</div><h2>${res.won?'เยี่ยมมาก Techno ชนะบอส!':'ไม่เป็นไร ลองใหม่ได้'}</h2><p class="note">ตอบถูกตั้งแต่ครั้งแรก ${res.hits}/${res.total} · ได้ <b>${Math.max(us(n).scores[s]||0,pts)}/20</b> คะแนน</p><div class="actions"><button class="btn sec sec-l" id="again">สู้อีกครั้ง</button>${nextBtn()}</div></div></div>`;
      beep(res.won?'win':'hit');$('#next').onclick=()=>goNext(n,s);$('#again').onclick=()=>renderStage();
    }});
  };
  intro();
}

/* --- ด่านเดินตามช่อง (บท 2 และ 7) ด้วย Quest --- */
function rQuest(n,s,role){
  const pack={5:'p3u'+n+'a',6:'p3u'+n+'g1',8:'p3u'+n+'sb',9:'p3u'+n+'b',10:'p3u'+n+'g2',13:'p3u'+n+'boss'}[s],max=MAXP[s]||0;
  bindHead(n,s,()=>'ด่านเดินตามช่อง ใช้ลูกศรพาหุ่นไปให้ถึงประตู');
  const kick={mission:'ภารกิจจริง '+(s===5?'A':'B'),game:'เกมแทรก',sandbox:'สนามทดลอง ไม่มีคะแนน',boss:'ดวลบอส Venom Mantis'}[role];
  $('#pn').innerHTML=`<div class="cols">${img(role==='boss'?'pose-ready':artOf(n),'art'+(role==='boss'?' contain':''),KID[n].t)}<div><div class="kick">${kick} · ${esc(KID[n].t)}</div><h2>${esc(QUEST.PACK[pack].title)}</h2><p class="big">${n===7?'ใช้ลูกศรและบัตรทำซ้ำ 🔁 ให้โปรแกรมสั้นที่สุด':'ใช้ลูกศร 4 ทิศ พาหุ่นไปให้ถึงประตู แล้วลองเปลี่ยนกรณีให้ครบ'}</p><p class="note ex">${max?`ผ่านทุกด่านย่อยได้ ${max} คะแนน · พลาดน้อยได้คะแนนมาก`:'ลองเล่นได้ไม่จำกัด ไม่มีคะแนน'}</p>${isDone(n,s)&&max?`<p class="note">ผ่านแล้ว: ${us(n).scores[s]||0}/${max}</p>`:''}<div class="actions">${nextBtn('เริ่มเล่น')}</div></div></div>`;
  $('#next').onclick=()=>{
    $('#pn').innerHTML='<div id="act"></div><div class="actions"><button class="btn sec sec-l" id="back2">ย้อนกลับ</button></div>';
    $('#back2').onclick=()=>renderStage();
    QUEST.mount($('#act'),pack,{say:(ok,m)=>{beep(ok?'ok':'bad');Mascot.react(ok,m)},done:(err)=>{
      const pts=max?Math.max(Math.ceil(max*.45),max-[0,1,2,3][Math.min(3,err)]*Math.max(1,Math.round(max/6))):0;
      award(n,s,pts);
      $('#pn').innerHTML=`<div class="cols">${img('pose-victory','art contain','')}<div><div class="kick">จบด่านแล้ว!</div><h2>เก่งมาก ผ่านทุกด่านย่อย</h2>${max?`<p class="note">ได้ <b>${Math.max(us(n).scores[s]||pts,pts)}/${max}</b> คะแนน</p>`:''}<div class="actions"><button class="btn sec sec-l" id="again">เล่นอีกครั้ง</button>${nextBtn()}</div></div></div>`;
      $('#next').onclick=()=>goNext(n,s);$('#again').onclick=()=>renderStage();beep('win');
    }});
  };
}

/* --- สรุปบท --- */
function rReport(n,s){
  const u=us(n),a=u.pre??0,b=u.post??0,sc=total(n),stars=sc>=85?3:sc>=60?2:sc>=30?1:0;
  bindHead(n,s,()=>`บทนี้ได้ ${sc} จาก 100 คะแนน`);
  award(n,s,0);
  $('#pn').innerHTML=`<div class="cols">${img('pose-'+(stars>=2?'trophy':'thumbs'),'art contain','')}<div><div class="kick">สรุปบทที่ ${n}</div><h2>${esc(KID[n].t)}</h2><p class="big">ได้ <b>${sc}</b> จาก 100 คะแนน ${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</p>
    <table class="tbl"><tr><th>ส่วน</th><th>คะแนน</th></tr><tr><td>ก่อนเรียน (ไม่รวมคะแนน)</td><td>${a}/20</td></tr><tr><td>หลังเรียน</td><td>${b}/20</td></tr><tr><td>ภารกิจ A + B</td><td>${(u.scores[5]||0)+(u.scores[9]||0)}/30</td></tr><tr><td>เกมแทรก 2 เกม</td><td>${(u.scores[6]||0)+(u.scores[10]||0)}/10</td></tr><tr><td>ชิ้นงาน</td><td>${u.scores[11]||0}/20</td></tr><tr><td>ดวลบอส</td><td>${u.scores[13]||0}/20</td></tr></table>
    <p class="note">${b-a>=8?'ดีมาก! ทักษะดีขึ้นชัดเจน':b>=a?'ทักษะดีขึ้นแล้ว ลองกลับไปฝึกด่านที่ยังยาก':'กลับไปดูคำอธิบายแล้วลองอีกครั้งได้เสมอ'}</p>
    <div class="actions"><button class="btn sec sec-l" id="all">ผลทุกบท</button>${n<9?`<button class="btn" id="nx">บทที่ ${n+1} <i class="arr"></i></button>`:'<button class="btn" id="nx">กลับหน้าหลัก</button>'}</div></div></div>`;
  $('#all').onclick=showMine;$('#nx').onclick=()=>n<9?openStage(n+1,1):renderHome();
  Mascot.set(stars>=2?'win':'ok','จบบทแล้ว!');
}

/* ---------- ครู ---------- */
let staffTok='';
function teacherOpen(){
  if(Bridge.active){if(staffTok)return loadReport();
    modal('สำหรับครู',`<form id="tf"><label>ชื่อบัญชี<input id="tu" class="field" autocomplete="username"></label><label style="display:block;margin-top:8px">รหัสผ่าน<input id="tp" type="password" class="field" autocomplete="current-password"></label><p class="err" id="te"></p><button class="btn">เข้าหน้าครู</button></form>`);
    $('#tf').onsubmit=e=>{e.preventDefault();Loading.show('กำลังเช็กรหัส');Bridge.loginStaff($('#tu').value.trim(),$('#tp').value).then(r=>{Loading.hide();staffTok=r.token;loadReport()}).catch(err=>{Loading.hide();$('#te').textContent=err.message})};return}
  if(!staff){modal('สำหรับครู (รุ่นทดลองในเครื่อง)',`<form id="tf"><label>รหัสครู<input id="tp" type="password" class="field"></label><p class="err" id="te"></p><button class="btn">เข้าใช้งาน</button><p class="note">ทดลอง: 2468 · เมื่อเชื่อม GAS จะใช้บัญชีจริงในชีต</p></form>`);
    $('#tf').onsubmit=e=>{e.preventDefault();if($('#tp').value!=='2468'){$('#te').textContent='รหัสไม่ถูก';return}staff=true;localReport()};return}
  localReport();
}
function localReport(){
  const y=year(),rows=y.students.map(st=>{const d=LS.get(skey(cfg.displayYear,st.code),null)||blank();const sc=n=>Object.values(((d.units||{})[n]||{}).scores||{}).reduce((a,b)=>a+(Number(b)||0),0);return {st,sc:U3.map(u=>sc(u.number)),tot:U3.reduce((a,u)=>a+sc(u.number),0)}});
  modal('ครู · ห้อง '+esc(y.className)+' ปี '+esc(cfg.displayYear),`<div style="overflow:auto"><table class="tbl"><tr><th>เลขที่</th>${U3.map(u=>`<th>${u.number}</th>`).join('')}<th>รวม/900</th></tr>${rows.map(r=>`<tr><td>${esc(r.st.code)}</td>${r.sc.map(v=>`<td>${v}</td>`).join('')}<td><b>${r.tot}</b></td></tr>`).join('')}</table></div><div class="actions"><button class="btn sec sec-l" id="tout">ออก</button><button class="btn" id="csv">ดาวน์โหลด Excel (CSV)</button></div>`);
  $('#tout').onclick=()=>{staff=null;closeModal()};
  $('#csv').onclick=()=>csv([['เลขที่','ชื่อ',...U3.map(u=>'บท'+u.number),'รวม'],...rows.map(r=>[r.st.code,r.st.name,...r.sc,r.tot])],'Techno-P3-ปี'+cfg.displayYear+'-คะแนน.csv');
}
function csv(rows,name){const t=rows.map(l=>l.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n'),b=new Blob(['﻿'+t],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function loadReport(yr){
  Loading.show('กำลังเปิดคะแนนห้อง');
  Bridge.getTeacherReport(staffTok,yr||'').then(r=>{Loading.hide();remoteReport(r)}).catch(e=>{Loading.hide();staffTok='';toast(e.message);teacherOpen()});
}
function remoteReport(r){
  const rows=r.roster.map(x=>({x,sc:U3.map(u=>{const z=x.units.find(q=>q.unit===u.number);return z?Number(z.score)||0:0}),tot:x.units.reduce((a,q)=>a+(Number(q.score)||0),0)}));
  modal(`${r.role==='admin'?'แอดมิน':'ครู'} · ปี ${esc(r.year)}`,`<label>ปีการศึกษา <select id="ry">${r.years.map(y=>`<option ${y===r.year?'selected':''}>${esc(y)}</option>`).join('')}</select></label>
    <div style="overflow:auto"><table class="tbl"><tr><th>เลขที่/ชื่อ</th>${U3.map(u=>`<th>${u.number}</th>`).join('')}<th>รวม/900</th><th>ชิ้นงานรอยืนยัน</th></tr>
    ${rows.map(({x,sc,tot})=>`<tr><td>${esc(x.code)} ${esc(x.name)}${x.active?'':' (พัก)'}</td>${sc.map(v=>`<td>${v}</td>`).join('')}<td><b>${tot}</b></td><td>${x.units.filter(q=>q.submitted&&!q.confirmed).map(q=>`<button class="btn sm sec" data-c="${esc(x.code)}:${q.unit}">ยืนยันบท ${q.unit}</button>`).join(' ')||'—'}</td></tr>`).join('')}</table></div>
    ${rows.some(({x})=>x.products&&x.products.length)?'<details><summary>อ่านชิ้นงานของนักเรียน</summary>'+rows.map(({x})=>(x.products||[]).map(p=>`<p class="note"><b>${esc(x.code)} · บท ${p.unit}</b><br>${esc(p.text)}</p>`).join('')).join('')+'</details>':''}
    <div class="actions"><button class="btn sec sec-l" id="tout">ออกจากบัญชีครู</button><button class="btn" id="csv">ดาวน์โหลด Excel (CSV)</button></div>`);
  $('#csv').onclick=()=>csv([['เลขที่','ชื่อ',...U3.map(u=>'บท'+u.number),'รวม'],...rows.map(({x,sc,tot})=>[x.code,x.name,...sc,tot])],'Techno-P3-ปี'+r.year+'-คะแนน.csv');
  $('#tout').onclick=()=>{staffTok='';closeModal()};$('#ry').onchange=e=>loadReport(e.target.value);
  $$('[data-c]').forEach(b=>b.onclick=()=>{const [code,u]=b.dataset.c.split(':');Loading.show('กำลังบันทึก');Bridge.confirmProduct(staffTok,r.year,code,Number(u)).then(()=>{Loading.hide();toast('ยืนยันชิ้นงานแล้ว');loadReport(r.year)}).catch(e=>{Loading.hide();toast(e.message)})});
}

/* ---------- เริ่มต้น ---------- */
(function init(){
  for(let k=0;k<14;k++){const b=document.createElement('i'),z=10+Math.random()*28;b.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${14+Math.random()*18}s;animation-delay:${-Math.random()*20}s`;$('#sea').append(b)}
  QUEST.setTheme({top:'#3da35d',mid:'#1f7a48',bot:'#0b3d2a',ray:'rgba(235,255,200,.55)',wave:'rgba(255,255,255,.07)',bub:'#e6ffb0',deco:'leaf',baseA:'#eaffd9',baseB:'#8fcf7a',well:'#17502f',pa:['#c3f59a','#74c95c'],pb:['#acea82','#5cb44c'],rock:['#d3a97a','#8b6544','#4d3622'],ship:'pose-runR',shipScale:.9,rockName:'พุ่มหนาม',goalName:'ประตูป่า'});
  bar();renderLogin();
})();
