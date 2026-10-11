'use strict';
/* Seven units use five small, playable mechanics. Each stage has its own case.
   These are practice games; the pre/post questions and real missions use other data. */
let specialRun=null;
const SSEQ={
  1:[
    {title:'เรียงแผนเปิดหอสังเกตการณ์',task:'แตะบัตรตามลำดับที่ควรทำ',steps:['อ่านกติกาประตู','นับผลึกในกระเป๋า','เลือกประตูที่เปิดได้'],cards:['เลือกประตูที่เปิดได้','อ่านกติกาประตู','นับผลึกในกระเป๋า','วิ่งโดยไม่ดูข้อมูล']},
    {title:'เรียงแผนตรวจเครื่องส่งสัญญาณ',task:'เมื่อผลลัพธ์ไม่ตรงแผน จะตรวจอย่างไร',steps:['ทำนายผลจากบัตร','ทดลองเดินตามบัตร','เปรียบเทียบผลและแก้บัตร'],cards:['เปรียบเทียบผลและแก้บัตร','ทดลองเดินตามบัตร','เปิดเครื่องทิ้งไว้','ทำนายผลจากบัตร']}
  ],
  5:[
    {title:'ประกอบสไลด์ข้อมูล',task:'แตะองค์ประกอบตามลำดับการทำสไลด์',steps:['ตั้งหัวข้อให้ตรงคำถาม','ใส่จำนวนจากผลสำรวจ','เขียนข้อสรุปจากจำนวน'],cards:['ใส่ภาพตกแต่งจำนวนมาก','เขียนข้อสรุปจากจำนวน','ตั้งหัวข้อให้ตรงคำถาม','ใส่จำนวนจากผลสำรวจ']},
    {title:'ซ่อมสไลด์ของเทคโน',task:'เรียงขั้นตอนก่อนนำเสนอกับเพื่อน',steps:['ตรวจตัวเลขกับบันทึก','ตัดภาพที่ไม่เกี่ยวข้อง','อ่านสไลด์ให้เพื่อนลองฟัง'],cards:['อ่านสไลด์ให้เพื่อนลองฟัง','ตรวจตัวเลขกับบันทึก','เลือกสีอย่างเดียว','ตัดภาพที่ไม่เกี่ยวข้อง']}
  ]
};
const SSEARCH=[
  {title:'หาวิธีทำคั่นหนังสือ',query:'วิธีทำคั่นหนังสือกระดาษ วัสดุ',queries:['งานประดิษฐ์','วิธีทำคั่นหนังสือกระดาษ วัสดุ','รูปภาพสวย'],result:'วิธีทำคั่นหนังสือ: วัสดุและ 4 ขั้นตอน',results:['เกมทายสีหนังสือ','วิธีทำคั่นหนังสือ: วัสดุและ 4 ขั้นตอน','สมัครสมาชิกเพื่อรับของ'],fact:'กระดาษสี กาว และกรรไกร',facts:['กระดาษสี กาว และกรรไกร','รหัสผ่านของผู้ใช้','สีหน้าเว็บ']},
  {title:'หาวิธีพับเรือกระดาษ',query:'วิธีพับเรือกระดาษ ขั้นตอน',queries:['เรือ','เพลงเรือ','วิธีพับเรือกระดาษ ขั้นตอน'],result:'พับเรือกระดาษ 6 ขั้นตอนพร้อมภาพ',results:['พับเรือกระดาษ 6 ขั้นตอนพร้อมภาพ','โฆษณารองเท้า','รวมรูปเรือจริง'],fact:'พับตามภาพทีละขั้นแล้วทดลองลอย',facts:['เลือกภาพที่มีสีมากที่สุด','พับตามภาพทีละขั้นแล้วทดลองลอย','ส่งที่อยู่ก่อนอ่าน']}
];
const SMAIL={
  3:[
    {title:'ศูนย์สัญญาณปลอดภัย',items:[['เกมขอที่อยู่บ้านเพื่อรับรางวัล','หยุดแล้วบอกครู'],['ครูให้เปิดบทเรียนที่รู้จัก','เปิดได้'],['คนไม่รู้จักส่งลิงก์ให้กด','หยุดแล้วบอกครู']]},
    {title:'ตรวจห้องสนทนา',items:[['เพื่อนถามสีที่ชอบในงานกลุ่ม','ตอบได้'],['คนแปลกหน้าขอรหัสผ่าน','หยุดแล้วบอกครู'],['เกมแสดงภาพที่ทำให้กลัว','หยุดแล้วบอกครู']]}
  ],
  8:[
    {title:'นักสืบผลค้นหา',items:[['เว็บตรงหัวข้อ มีชื่อแหล่งและคำอธิบาย','เปิดดู'],['ผลแรกขอเบอร์โทรก่อนอ่าน','ข้าม'],['เพื่อนถามเวลาเปิดตลาดอย่างสุภาพ','ตอบอย่างสุภาพ']]},
    {title:'จดหมายถึงพิพิธภัณฑ์',items:[['ข้อความว่า “บอกมาเดี๋ยวนี้”','แก้เป็นคำสุภาพ'],['เว็บผลค้นหาคนละเรื่อง','ข้าม'],['เว็บตอบคำถาม มีผู้จัดทำชัดเจน','เปิดดู']]}
  ]
};
const SCARGO=[
  {title:'ขนผลึกข้ามสะพาน',capacity:3,items:[['ผลึก A',1],['ผลึก B',2],['ผลึก C',2],['ผลึก D',1]],minimum:2},
  {title:'ส่งชิ้นส่วนซ่อมหอ',capacity:4,items:[['แผงไฟ',2],['กล่องสาย',1],['เครื่องมือ',2],['แบตเตอรี่',3]],minimum:2}
];
const SAR=[
  {title:'ตรวจภาพซ้อนในสวน',base:'ต้นไม้จริงมีใบสีเขียว',layers:[['ภาพใบสีเขียวตรงต้นไม้',false],['ภาพปลาว่ายอยู่บนกิ่ง',true],['ป้ายชื่อพันธุ์ไม้ตรงต้น',false]],answer:'ภาพปลาบนกิ่งไม่ตรงกับสิ่งจริง'},
  {title:'ตรวจภาพซ้อนในพิพิธภัณฑ์',base:'ป้ายจริงเขียนว่า “ฟอสซิลปลา”',layers:[['ป้ายดิจิทัลว่า “ฟอสซิลปลา”',false],['รูปจำลองปลาบนฟอสซิล',false],['คำอธิบายว่าเป็นไดโนเสาร์',true]],answer:'คำอธิบายไดโนเสาร์ขัดกับป้ายจริง'}
];
function sHeader(n,s,title,body){stageShell(n,s,`<span class="pill">เกมฝึกทักษะ · เล่นแล้วคิด</span><h2>${esc(title)}</h2><p class="small-note">${esc(body)}</p><div class="special-scene" id="specialscene"></div><div class="feedback" id="specialfeed" aria-live="polite"></div><div class="stage-actions" id="specialactions"></div>`)}
function sFinish(n,s,run,detail){const max=stage(n,s).scoreMax,points=run.errors===0?max:Math.max(1,max-2);award(n,s,points,detail);$('#specialscene').innerHTML=`<div class="special-finish">${img('p3-techno-victory-shield-v1.webp','มาสไรเดอร์เทคโนชนะเกม')}<div><h3>ผ่านเกมแล้ว!</h3><p>${esc(detail)}</p><strong>${points}/${max} คะแนน</strong></div></div>`;$('#specialfeed').textContent=run.errors?'ผิดพลาดได้ ลองใหม่เพื่อเก็บคะแนนเต็ม':'ยอดเยี่ยม! เราใช้ทักษะนี้ได้แล้ว';$('#specialactions').innerHTML=`<button class="btn alt" id="specialagain">ลองใหม่</button>${nextBtn(n,s)}`;$('#specialagain').onclick=()=>{specialRun=null;renderSpecial(n,s)};bindNext(n,s)}
function renderSpecial(n,s){if(!specialRun||specialRun.n!==n||specialRun.s!==s)specialRun={n,s,step:0,errors:0,selected:[],delivered:[],trips:0};const r=specialRun,v=s===6?0:1;
  if(n===1||n===5)return sSequence(n,s,r,SSEQ[n][v]);
  if(n===4)return sSearch(n,s,r,SSEARCH[v]);
  if(n===3||n===8)return sMail(n,s,r,SMAIL[n][v]);
  if(n===6)return sCargo(n,s,r,SCARGO[v]);
  if(n===9)return sAR(n,s,r,SAR[v]);
}
function sSequence(n,s,r,d){sHeader(n,s,d.title,d.task);$('#specialscene').innerHTML=`<div class="sequence-meter">ขั้น ${Math.min(3,r.step+1)}/3</div><div class="sequence-track">${d.steps.map((x,i)=>`<div class="sequence-slot ${i<r.step?'filled':''}">${i<r.step?esc(x):'ขั้น '+(i+1)}</div>`).join('')}</div><div class="special-options">${d.cards.map((x,i)=>`<button class="special-card" data-i="${i}" ${d.steps.indexOf(x)<r.step&&d.steps.includes(x)?'disabled':''}>${esc(x)}</button>`).join('')}</div>`;
  $$('.special-card').forEach(b=>b.onclick=()=>{const x=d.cards[Number(b.dataset.i)];if(x!==d.steps[r.step]){r.errors++;b.classList.add('wrong');$('#specialfeed').textContent='ลำดับนี้ยังไม่ตรง ลองดูว่าต้องรู้อะไรก่อน';sound('bad');return}r.step++;sound('ok');if(r.step===3)sFinish(n,s,r,'เรียงแผนได้ครบ 3 ขั้น');else sSequence(n,s,r,d)})}
function sSearch(n,s,r,d){const phases=[['เลือกคำค้นที่ตรงคำถาม',d.queries,d.query],['เลือกผลค้นหาที่ตอบโจทย์',d.results,d.result],['เก็บข้อมูลที่นำไปใช้ได้',d.facts,d.fact]];const [label,options,answer]=phases[r.step];sHeader(n,s,d.title,'จำลองการค้นหา: คำค้น → ผลลัพธ์ → ข้อมูลที่ใช้ได้');$('#specialscene').innerHTML=`<div class="search-chrome"><span class="search-glass" aria-hidden="true"></span> ${r.step===0?'พิมพ์คำค้น':esc(d.query)}</div><div class="sequence-meter">${esc(label)} · ${r.step+1}/3</div><div class="special-options">${options.map((x,i)=>`<button class="special-card search-result" data-i="${i}"><small>${r.step===0?'คำค้น':r.step===1?'ผลค้นหา':'ข้อมูล'}</small>${esc(x)}</button>`).join('')}</div>`;
  $$('.special-card').forEach(b=>b.onclick=()=>{if(options[Number(b.dataset.i)]!==answer){r.errors++;b.classList.add('wrong');$('#specialfeed').textContent='ยังไม่ตรงคำถาม ลองอ่านชื่อและข้อความอีกครั้ง';sound('bad');return}r.step++;sound('ok');if(r.step===3)sFinish(n,s,r,'เลือกคำค้นและข้อมูลที่ตรงเป้าหมาย');else sSearch(n,s,r,d)})}
function sMail(n,s,r,d){const item=d.items[r.step];sHeader(n,s,d.title,n===3?'อ่านสถานการณ์แล้วเลือกการกระทำที่ปลอดภัย':'อ่านข้อมูลก่อนตัดสินใจ');const actions=n===3?['เปิดได้','ตอบได้','หยุดแล้วบอกครู']:['เปิดดู','ข้าม','ตอบอย่างสุภาพ','แก้เป็นคำสุภาพ'];$('#specialscene').innerHTML=`<div class="message-window"><small>สัญญาณ ${r.step+1}/3</small><strong>${esc(item[0])}</strong></div><div class="special-options">${actions.map((x,i)=>`<button class="special-card" data-i="${i}">${esc(x)}</button>`).join('')}</div>`;
  $$('.special-card').forEach(b=>b.onclick=()=>{if(actions[Number(b.dataset.i)]!==item[1]){r.errors++;b.classList.add('wrong');$('#specialfeed').textContent='ลองคิดอีกครั้งว่าข้อมูลนี้ปลอดภัยและตรงเรื่องไหม';sound('bad');return}r.step++;sound('ok');if(r.step===3)sFinish(n,s,r,n===3?'แยกสถานการณ์ปลอดภัยและขอความช่วยเหลือได้':'ประเมินผลค้นหาและใช้คำสุภาพได้');else sMail(n,s,r,d)})}
function sCargo(n,s,r,d){sHeader(n,s,d.title,`สะพานรับได้เที่ยวละ ${d.capacity} หน่วย เลือกของแล้วกด “ส่งของ”`);const weight=r.selected.reduce((a,i)=>a+d.items[i][1],0);$('#specialscene').innerHTML=`<div class="cargo-status"><b>เที่ยว ${r.trips+1}</b><span>น้ำหนัก ${weight}/${d.capacity}</span><span>ส่งแล้ว ${r.delivered.length}/${d.items.length}</span></div><div class="special-options">${d.items.map(([x,w],i)=>`<button class="special-card cargo ${r.selected.includes(i)?'active':''}" data-i="${i}" ${r.delivered.includes(i)?'disabled':''}>${esc(x)} <b>${w} หน่วย</b></button>`).join('')}</div>`;$('#specialactions').innerHTML='<button class="btn" id="sendcargo">ส่งของข้ามสะพาน →</button><button class="btn alt" id="clearcargo">ยกเลิกที่เลือก</button>';
  $$('.cargo').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);if(r.selected.includes(i))r.selected=r.selected.filter(x=>x!==i);else if(weight+d.items[i][1]>d.capacity){r.errors++;$('#specialfeed').textContent='น้ำหนักเกินสะพาน ลองจัดของใหม่';sound('bad');return}else r.selected.push(i);sCargo(n,s,r,d)});$('#clearcargo').onclick=()=>{r.selected=[];sCargo(n,s,r,d)};$('#sendcargo').onclick=()=>{if(!r.selected.length){$('#specialfeed').textContent='เลือกของก่อนส่ง';return}r.delivered.push(...r.selected);r.selected=[];r.trips++;sound('ok');if(r.delivered.length===d.items.length){if(r.trips>d.minimum){r.errors++;}sFinish(n,s,r,`ส่งครบ ${d.items.length} ชิ้น ใน ${r.trips} เที่ยว`)}else sCargo(n,s,r,d)}}
function sAR(n,s,r,d){sHeader(n,s,d.title,'เทียบสิ่งจริงกับภาพดิจิทัล แล้วแตะชั้นข้อมูลที่ผิด');$('#specialscene').innerHTML=`<div class="ar-scene"><div class="ar-real">ของจริง: ${esc(d.base)}</div><div class="ar-layers">${d.layers.map(([x],i)=>`<button class="ar-layer" data-i="${i}"><span class="ar-target">${i+1}</span>${esc(x)}</button>`).join('')}</div></div>`;
  $$('.ar-layer').forEach(b=>b.onclick=()=>{const bad=d.layers[Number(b.dataset.i)][1];if(!bad){r.errors++;b.classList.add('wrong');$('#specialfeed').textContent='ชั้นนี้ยังตรงกับสิ่งจริง ลองมองป้ายหรือวัตถุอีกครั้ง';sound('bad');return}sound('win');sFinish(n,s,r,d.answer)})}
