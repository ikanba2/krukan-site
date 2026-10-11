/** Techno Academy ป.2 — GAS server (แยกจาก ป.1: ชีต/สคริปต์/คะแนน/ปีการศึกษา/สิทธิ์ครู). ข้อมูลส่วนตัวตรวจที่เซิร์ฟเวอร์เท่านั้น */
const P2_SHEET_ID='1QqcRJ6XVRrX-s7XnwJmqTlLmq7Jmz7UnzqzDYQtL4sU';
const P2_HEADERS={
  Settings:['key','value','updatedAt'],
  AcademicYears:['yearId','year','label','active','createdAt'],
  Classes:['classId','yearId','name','pinSalt','pinHash','active'],
  Students:['studentId','fullName','active','createdAt'],
  Enrollments:['enrollmentId','studentId','classId','code','active','createdAt'],
  StaffUsers:['staffId','username','name','role','salt','passwordHash','active','createdAt'],
  States:['enrollmentId','stateJson','updatedAt'],
  Progress:['enrollmentId','year','code','unit','topics','games','lab','realPoints','post','total','energy','boss','pre','stagesDone','realSelf','realTeacher','updatedAt'],
  RealConfirm:['enrollmentId','unit','confirmedBy','at'],
  AuditLog:['at','actor','action','detail']
};
/* จำนวนหัวข้อ/ห้องทดลองต่อภารกิจ (ให้ตรงกับ course-plan.json ป.2) */
const P2_CFG={1:{t:6,lab:0,stages:14},2:{t:7,lab:1,stages:16},3:{t:6,lab:0,stages:14},4:{t:7,lab:1,stages:16},5:{t:6,lab:0,stages:14},6:{t:6,lab:0,stages:14},7:{t:7,lab:1,stages:16},8:{t:7,lab:1,stages:16},9:{t:6,lab:0,stages:14}};

function doGet(){
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Techno Academy · วิทยาการคำนวณ ป.2')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(name){return HtmlService.createHtmlOutputFromFile(name).getContent()}
function p2Book_(){return SpreadsheetApp.openById(P2_SHEET_ID)}
function p2Tab_(name){return p2Book_().getSheetByName(name)}
function p2Rows_(name){const sh=p2Tab_(name);if(!sh)return [];const n=sh.getLastRow();return n<2?[]:sh.getRange(2,1,n-1,P2_HEADERS[name].length).getValues()}
function p2Now_(){return new Date().toISOString()}
function p2Hash_(value,salt){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(salt)+':'+String(value));return bytes.map(x=>('0'+(x&255).toString(16)).slice(-2)).join('')}
function p2Eq_(a,b){a=String(a||'');b=String(b||'');let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0}
function p2Safe_(x,max){return String(x||'').trim().slice(0,max||100)}
function p2Audit_(actor,action,detail){p2Tab_('AuditLog').appendRow([p2Now_(),actor,action,p2Safe_(detail,500)])}
function p2Setting_(key){const row=p2Rows_('Settings').find(r=>r[0]===key);return row?String(row[1]):''}
function p2SetSetting_(key,value){const sh=p2Tab_('Settings'),rows=p2Rows_('Settings'),idx=rows.findIndex(r=>r[0]===key);if(idx<0)sh.appendRow([key,value,p2Now_()]);else sh.getRange(idx+2,2,1,2).setValues([[value,p2Now_()]])}

function p2Setup_(){
  const book=p2Book_(),lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const old=book.getSheetByName('ชีต1')||book.getSheetByName('Sheet1');
    if(old&&old.getLastRow()===0&&!book.getSheetByName('Settings'))old.setName('Settings');
    Object.keys(P2_HEADERS).forEach(name=>{
      let sh=book.getSheetByName(name);if(!sh)sh=book.insertSheet(name);
      const head=P2_HEADERS[name];
      if(sh.getLastRow()===0){sh.getRange(1,1,1,head.length).setValues([head]);sh.setFrozenRows(1);sh.getRange(1,1,1,head.length).setBackground('#06304f').setFontColor('#ffffff').setFontWeight('bold')}
    });
    if(!p2SettingRaw_('displayYear')){
      p2SetSetting_('displayYear','2569');p2SetSetting_('schemaVersion','1');p2SetSetting_('course','krukan-techno-p2');
      const t=p2Now_();
      p2Tab_('AcademicYears').getRange(2,1,2,5).setValues([['year2569','2569','ปีการศึกษา 2569',true,t],['year2570','2570','ปีการศึกษา 2570',true,t]]);
      const s1='p2-class-2569',s2='p2-class-2570';
      p2Tab_('Classes').getRange(2,1,2,6).setValues([['p2-1-2569','year2569','ป.2/1',s1,p2Hash_('1234',s1),true],['p2-1-2570','year2570','ป.2/1',s2,p2Hash_('1234',s2),true]]);
      const st=[],en=[];
      for(let i=1;i<=20;i++){const n=String(i).padStart(2,'0');st.push(['p2-sample-student-'+n,'นักเรียนตัวอย่าง '+n,true,t]);en.push(['p2-sample-enrollment-2569-'+n,'p2-sample-student-'+n,'p2-1-2569',n,true,t])}
      p2Tab_('Students').getRange(2,1,st.length,4).setValues(st);
      p2Tab_('Enrollments').getRange(2,1,en.length,6).setValues(en);
      // รหัสแอดมินเริ่มต้นส่งแยก เก็บเฉพาะค่าแฮช
      p2Tab_('StaffUsers').appendRow(['p2-staff-admin','admin','ผู้ดูแลระบบ','admin','3af5301d66f440eb57006a4f94706287','b831f609f8d01fec7823ed54730bbf6394b1f4ce4118ef00ea86536121c1018d',true,t]);
      p2Audit_('system','setup','สร้างชีต ป.2 และนักเรียนตัวอย่างสมมติ 20 คน');
    }
  }finally{lock.releaseLock()}
}
function p2SettingRaw_(key){const sh=p2Tab_('Settings');if(!sh||sh.getLastRow()<2)return '';const r=sh.getRange(2,1,sh.getLastRow()-1,2).getValues().find(x=>x[0]===key);return r?String(r[1]):''}

function getPublicConfig(){
  p2Setup_();
  const year=p2Setting_('displayYear'),yr=p2Rows_('AcademicYears').find(r=>String(r[1])===year),
    cl=p2Rows_('Classes').find(r=>r[1]===yr?.[0]&&r[5]===true),
    codes=p2Rows_('Enrollments').filter(r=>r[2]===cl?.[0]&&r[4]===true).map(r=>({id:String(r[3])})).sort((a,b)=>a.id.localeCompare(b.id));
  return {year,className:cl?.[2]||'ป.2/1',codes};
}
function p2Throttle_(key,check){const c=CacheService.getScriptCache(),n=Number(c.get('fail:'+key)||0);if(check){if(n>=8)throw new Error('ลองใหม่ภายหลัง หรือแจ้งครู');return}c.put('fail:'+key,String(n+1),600)}
function p2ThrottleClear_(key){CacheService.getScriptCache().remove('fail:'+key)}
function p2Session_(token,role){
  const raw=CacheService.getScriptCache().get('session:'+p2Safe_(token,80));
  if(!raw)throw new Error('หมดเวลาเข้าใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง');
  const s=JSON.parse(raw);if(role&&s.role!==role&&s.role!=='admin')throw new Error('ไม่มีสิทธิ์ใช้งาน');return s;
}
function p2NewSession_(record){const token=Utilities.getUuid();CacheService.getScriptCache().put('session:'+token,JSON.stringify(record),21600);return token}

function p2Confirms_(enrollmentId){return new Set(p2Rows_('RealConfirm').filter(r=>r[0]===enrollmentId).map(r=>Number(r[1])))}
function p2LoadState_(enrollmentId){
  const r=p2Rows_('States').find(x=>x[0]===enrollmentId);if(!r||!r[1])return null;
  try{const st=JSON.parse(r[1]);p2ApplyConfirms_(st,enrollmentId);return st}catch(e){return null}
}
function p2ApplyConfirms_(st,enrollmentId){
  const ok=p2Confirms_(enrollmentId);st.u=st.u||{};
  for(let n=1;n<=9;n++){const u=st.u[n];if(u&&u.real){u.real.teacher=ok.has(n)}}
}
function loginStudent(code,pin){
  p2Setup_();const cfg=getPublicConfig(),year=cfg.year;code=p2Safe_(code,5);
  const cl=p2Rows_('Classes').find(r=>r[2]===cfg.className&&r[1]==='year'+year),key='student:'+year+':'+code;
  p2Throttle_(key,true);
  const match=p2Rows_('Enrollments').find(r=>r[2]===cl?.[0]&&String(r[3])===code&&r[4]===true),valid=match&&p2Eq_(p2Hash_(pin,cl[3]),cl[4]);
  if(!valid){p2Throttle_(key,false);throw new Error('รหัสยังไม่ถูก ลองใหม่หรือถามครู')}
  const student=p2Rows_('Students').find(r=>r[0]===match[1]&&r[2]===true);if(!student)throw new Error('บัญชีนี้ยังเข้าเรียนไม่ได้');
  p2ThrottleClear_(key);
  const token=p2NewSession_({role:'student',enrollmentId:match[0],studentId:match[1],classId:match[2],code:String(match[3]),year});
  p2Audit_(match[0],'student_login','');
  return {token,rider:{id:String(match[3]),name:student[1],year},state:p2LoadState_(match[0])};
}
function loginStaff(username,password){
  p2Setup_();username=p2Safe_(username,30);const key='staff:'+username;p2Throttle_(key,true);
  const user=p2Rows_('StaffUsers').find(r=>r[1]===username&&r[6]===true);
  if(!user||!p2Eq_(p2Hash_(password,user[4]),user[5])){p2Throttle_(key,false);throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')}
  p2ThrottleClear_(key);
  const token=p2NewSession_({role:user[3],staffId:user[0],name:user[2]});p2Audit_(user[0],'staff_login','');
  return {token,staff:{id:user[0],name:user[2],role:user[3]}};
}

/* คำนวณคะแนนต่อภารกิจจากสถานะที่ผู้เรียนส่งมา (ตัดค่าให้อยู่ในช่วงที่เป็นไปได้) */
function p2Calc_(st,n,confirmed){
  const cfg=P2_CFG[n],u=(st.u&&st.u[n])||{},gMax=cfg.lab?6:12;
  const num=(v,max)=>Math.max(0,Math.min(max,Number(v)||0));
  let topics=0,games=0,energy=0,done=0;
  Object.keys(u.topics||{}).forEach(k=>{if(Number(k)<cfg.t&&u.topics[k]&&u.topics[k].done){topics+=num(u.topics[k].score,6);done++}});
  Object.keys(u.games||{}).forEach(k=>{if(Number(k)<2&&u.games[k]&&u.games[k].done){games+=num(u.games[k].score,gMax);energy+=num(u.games[k].energy,10);done++}});
  const lab=cfg.lab&&u.lab&&u.lab.done?num(u.lab.score,6):0;if(cfg.lab&&u.lab&&u.lab.done)done++;
  const self=!!(u.real&&u.real.self),teacher=!!confirmed,real=teacher?20:self?10:0;if(self)done++;
  const post=u.post?num(u.post.score,20):0;if(u.post)done++;
  const pre=u.pre?num(u.pre.score,4):'';if(u.pre)done++;
  const boss=u.boss&&u.boss.done?num(u.boss.energy,20):0;if(u.boss&&u.boss.done)done++;
  if(u.story)done++;
  return {topics,games,lab,real,post,total:topics+games+lab+real+post,energy,boss,pre,done,self,teacher};
}
function p2UpsertRow_(sheetName,keyFn,row){
  const sh=p2Tab_(sheetName),all=p2Rows_(sheetName),i=all.findIndex(keyFn);
  if(i<0)sh.appendRow(row);else sh.getRange(i+2,1,1,row.length).setValues([row]);
}
function saveProgress(token,state){
  const s=p2Session_(token,'student');
  if(!state||typeof state!=='object'||!state.u||typeof state.u!=='object')throw new Error('ข้อมูลผลเรียนไม่ถูกต้อง');
  const clean={u:state.u,sound:!!state.sound,cur:state.cur||{}};
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    p2ApplyConfirms_(clean,s.enrollmentId);
    const json=JSON.stringify(clean);
    if(json.length>48000)throw new Error('ข้อมูลใหญ่เกินไป กรุณาแจ้งครู');
    const confirmed=p2Confirms_(s.enrollmentId),t=p2Now_();
    p2UpsertRow_('States',r=>r[0]===s.enrollmentId,[s.enrollmentId,json,t]);
    for(let n=1;n<=9;n++){
      const c=p2Calc_(clean,n,confirmed.has(n));
      p2UpsertRow_('Progress',r=>r[0]===s.enrollmentId&&Number(r[3])===n,[s.enrollmentId,s.year,s.code,n,c.topics,c.games,c.lab,c.real,c.post,c.total,c.energy,c.boss,c.pre,c.done,c.self,c.teacher,t]);
    }
    return {ok:true,savedAt:t};
  }finally{lock.releaseLock()}
}
function getTeacherReport(token,year){
  const s=p2Session_(token,'teacher');p2Setup_();
  const years=p2Rows_('AcademicYears').map(r=>String(r[1]));
  year=years.includes(String(year))?String(year):p2Setting_('displayYear');
  const cl=p2Rows_('Classes').find(r=>r[1]==='year'+year),people=new Map(p2Rows_('Students').map(r=>[r[0],r])),progress=p2Rows_('Progress');
  const roster=p2Rows_('Enrollments').filter(r=>r[2]===cl?.[0]).map(r=>({
    enrollmentId:r[0],code:String(r[3]),name:(people.get(r[1])||[])[1]||'',active:r[4]===true,
    units:progress.filter(p=>p[0]===r[0]).map(p=>({unit:Number(p[3]),total:p[9],energy:p[10],boss:p[11],pre:p[12],done:p[13],self:p[14]===true,teacher:p[15]===true}))
  }));
  return {year,displayYear:p2Setting_('displayYear'),years,roster,role:s.role,staffName:s.name};
}
function teacherConfirmReal(token,year,code,unit){
  const s=p2Session_(token,'teacher');unit=Number(unit);
  if(!(unit>=1&&unit<=9))throw new Error('ภารกิจไม่ถูกต้อง');
  const cl=p2Rows_('Classes').find(r=>r[1]==='year'+year);if(!cl)throw new Error('ไม่พบปีการศึกษา');
  const en=p2Rows_('Enrollments').find(r=>r[2]===cl[0]&&String(r[3])===String(code));if(!en)throw new Error('ไม่พบเลขที่นี้');
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    if(!p2Rows_('RealConfirm').some(r=>r[0]===en[0]&&Number(r[1])===unit))p2Tab_('RealConfirm').appendRow([en[0],unit,s.staffId,p2Now_()]);
    const st=p2LoadState_(en[0])||{u:{}},t=p2Now_();
    const c=p2Calc_(st,unit,true);
    p2UpsertRow_('Progress',r=>r[0]===en[0]&&Number(r[3])===unit,[en[0],year,String(en[3]),unit,c.topics,c.games,c.lab,c.real,c.post,c.total,c.energy,c.boss,c.pre,c.done,c.self,true,t]);
    p2Audit_(s.staffId,'confirm_real',en[0]+':'+unit);
    return {ok:true};
  }finally{lock.releaseLock()}
}
function upsertStudent(token,year,code,name,active){
  const s=p2Session_(token,'teacher');year=p2Safe_(year,4);name=p2Safe_(name,100);
  if(!/^\d{4}$/.test(year)||!name)throw new Error('กรอกปีและชื่อให้ครบ');
  const cl=p2Rows_('Classes').find(r=>r[1]==='year'+year);if(!cl)throw new Error('ไม่พบปีการศึกษา');
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const roster=p2Rows_('Enrollments'),match=code?roster.find(r=>r[2]===cl[0]&&String(r[3])===String(code)):null;
    if(match){
      const sh=p2Tab_('Students'),all=p2Rows_('Students'),i=all.findIndex(r=>r[0]===match[1]);if(i<0)throw new Error('ไม่พบผู้เรียน');
      sh.getRange(i+2,2).setValue(name);sh.getRange(i+2,3).setValue(Boolean(active));
      const j=roster.findIndex(r=>r[0]===match[0]);p2Tab_('Enrollments').getRange(j+2,5).setValue(Boolean(active));
      p2Audit_(s.staffId,'edit_student',match[0]);return {ok:true,code:String(match[3])};
    }
    const used=roster.filter(r=>r[2]===cl[0]).map(r=>Number(r[3])||0),number=used.length?Math.max.apply(null,used)+1:1;
    if(number>99)throw new Error('เต็ม 99 เลขที่แล้ว');
    const c=String(number).padStart(2,'0'),t=p2Now_(),sid=Utilities.getUuid(),eid=Utilities.getUuid();
    p2Tab_('Students').appendRow([sid,name,Boolean(active),t]);
    p2Tab_('Enrollments').appendRow([eid,sid,cl[0],c,Boolean(active),t]);
    p2Audit_(s.staffId,'add_student',eid);return {ok:true,code:c};
  }finally{lock.releaseLock()}
}
function addAcademicYear(token,year){
  const s=p2Session_(token,'admin');year=p2Safe_(year,4);
  if(!/^\d{4}$/.test(year)||p2Rows_('AcademicYears').some(r=>String(r[1])===year))throw new Error('ปีการศึกษาต้องเป็นเลข 4 หลักที่ยังไม่มี');
  const id='year'+year,salt=Utilities.getUuid();
  p2Tab_('AcademicYears').appendRow([id,year,'ปีการศึกษา '+year,true,p2Now_()]);
  p2Tab_('Classes').appendRow(['p2-1-'+year,id,'ป.2/1',salt,p2Hash_('1234',salt),true]);
  p2Audit_(s.staffId,'add_year',year);return {ok:true,year};
}
function setDisplayYear(token,year){
  const s=p2Session_(token,'admin');year=p2Safe_(year,4);
  if(!p2Rows_('AcademicYears').some(r=>String(r[1])===year))throw new Error('ไม่พบปีการศึกษา');
  p2SetSetting_('displayYear',year);p2Audit_(s.staffId,'display_year',year);return {ok:true,year};
}
function addTeacher(token,username,name,password){
  const s=p2Session_(token,'admin');username=p2Safe_(username,30);name=p2Safe_(name,100);
  if(!/^[a-zA-Z0-9_-]{3,30}$/.test(username)||!name||String(password).length<10)throw new Error('ชื่อบัญชีหรือรหัสไม่ถูกต้อง (รหัสอย่างน้อย 10 ตัว)');
  if(p2Rows_('StaffUsers').some(r=>r[1]===username))throw new Error('มีบัญชีนี้แล้ว');
  const salt=Utilities.getUuid();
  p2Tab_('StaffUsers').appendRow([Utilities.getUuid(),username,name,'teacher',salt,p2Hash_(password,salt),true,p2Now_()]);
  p2Audit_(s.staffId,'add_teacher',username);return {ok:true};
}
