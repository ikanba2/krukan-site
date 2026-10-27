/** Techno Academy ป.3. Separate spreadsheet, script and learner records. */
const P3_HEAD={
  Settings:['key','value','updatedAt'],
  Years:['year','className','studentPinSalt','studentPinHash','active','createdAt'],
  Students:['enrollmentId','year','code','fullName','active','createdAt'],
  Staff:['staffId','username','fullName','role','salt','passwordHash','active'],
  States:['enrollmentId','stateJson','updatedAt'],
  Progress:['enrollmentId','year','code','unit','pre','post','score','stagesDone','productSubmitted','productConfirmed','updatedAt'],
  StageScores:['enrollmentId','year','code','unit','stage','score','completedAt'],
  ProductReview:['enrollmentId','unit','confirmed','staffId','updatedAt'],
  Audit:['at','actor','action','detail']
};
const P3_MAX={1:0,2:0,3:0,4:0,5:15,6:5,7:0,8:0,9:15,10:5,11:20,12:20,13:20,14:0};
const P3_PROP='P3_SHEET_ID';
function doGet(){return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Techno Academy ป.3 · ดาวธาตุพฤกษา').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)}
function include(name){return HtmlService.createHtmlOutputFromFile(name).getContent()}
function p3Book_(){const id=PropertiesService.getScriptProperties().getProperty(P3_PROP);if(!id)throw new Error('กรุณารัน setupP3 ใน Apps Script ก่อนเปิดเว็บ');return SpreadsheetApp.openById(id)}
function p3Tab_(name){return p3Book_().getSheetByName(name)}
function p3Rows_(name){const sh=p3Tab_(name),last=sh.getLastRow();return last<2?[]:sh.getRange(2,1,last-1,P3_HEAD[name].length).getValues()}
function p3Now_(){return new Date().toISOString()}
function p3Txt_(s,n){return String(s??'').trim().slice(0,n||120)}
function p3Hash_(value,salt){const b=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(salt)+':'+String(value));return b.map(x=>('0'+(x&255).toString(16)).slice(-2)).join('')}
function p3Equal_(a,b){a=String(a||'');b=String(b||'');let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0}
function p3Setting_(key){const r=p3Rows_('Settings').find(x=>x[0]===key);return r?String(r[1]):''}
function p3SetSetting_(key,value){const sh=p3Tab_('Settings'),r=p3Rows_('Settings'),i=r.findIndex(x=>x[0]===key);if(i<0)sh.appendRow([key,value,p3Now_()]);else sh.getRange(i+2,2,1,2).setValues([[value,p3Now_()]])}
function p3Upsert_(name,find,row){const sh=p3Tab_(name),i=p3Rows_(name).findIndex(find);if(i<0)sh.appendRow(row);else sh.getRange(i+2,1,1,row.length).setValues([row])}
function p3Audit_(who,action,detail){p3Tab_('Audit').appendRow([p3Now_(),who,action,p3Txt_(detail,250)])}
/** Run once from Apps Script editor with a private initial admin password.
    Example: setupP3('admin', 'your-long-private-password').
    This creates a NEW sheet and an asset folder beside it in My Drive. */
function setupP3(username,password){
  if(PropertiesService.getScriptProperties().getProperty(P3_PROP))return {ready:true,sheetId:PropertiesService.getScriptProperties().getProperty(P3_PROP)};
  username=p3Txt_(username,30);password=String(password||'');
  if(!/^[A-Za-z0-9_-]{3,30}$/.test(username)||password.length<12)throw new Error('บัญชีผู้ดูแลต้องมีชื่อ 3–30 ตัว และรหัสผ่านอย่างน้อย 12 ตัว');
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    if(PropertiesService.getScriptProperties().getProperty(P3_PROP))return {ready:true,sheetId:PropertiesService.getScriptProperties().getProperty(P3_PROP)};
    const book=SpreadsheetApp.create('KruKan-Techno-P3'),id=book.getId();
    PropertiesService.getScriptProperties().setProperty(P3_PROP,id);
    const defaultTab=book.getSheets()[0];
    Object.keys(P3_HEAD).forEach((name,i)=>{const sh=i===0?defaultTab.setName(name):book.insertSheet(name);const head=P3_HEAD[name];sh.getRange(1,1,1,head.length).setValues([head]).setBackground('#124a46').setFontColor('#ffffff').setFontWeight('bold');sh.setFrozenRows(1)});
    const parent=DriveApp.getFileById(id).getParents();const folder=(parent.hasNext()?parent.next():DriveApp.getRootFolder()).createFolder('KruKan-Techno-P3-Assets');
    p3SetSetting_('displayYear','2569');p3SetSetting_('assetFolderId',folder.getId());p3SetSetting_('schema','1');p3SetSetting_('course','techno-p3');
    const t=p3Now_(),yearSalt=Utilities.getUuid();
    p3Tab_('Years').appendRow(['2569','ป.3/1',yearSalt,p3Hash_('1234',yearSalt),true,t]);
    const rows=[];for(let i=1;i<=20;i++){const code=String(i).padStart(2,'0');rows.push([Utilities.getUuid(),'2569',code,'นักเรียนตัวอย่าง '+code,true,t])}
    p3Tab_('Students').getRange(2,1,rows.length,6).setValues(rows);
    const salt=Utilities.getUuid();p3Tab_('Staff').appendRow([Utilities.getUuid(),username,'ผู้ดูแลระบบ','admin',salt,p3Hash_(password,salt),true]);
    p3Audit_('system','setup','สร้างระบบ ป.3 พร้อมข้อมูลสมมติ 20 คน');
    return {ready:true,sheetId:id,assetFolderId:folder.getId()};
  }finally{lock.releaseLock()}
}
function p3Throttle_(key,check){const c=CacheService.getScriptCache(),k='fail:'+key,n=Number(c.get(k)||0);if(check){if(n>=8)throw new Error('ลองใหม่ภายหลังหรือแจ้งครู');return}c.put(k,String(n+1),600)}
function p3ThrottleClear_(key){CacheService.getScriptCache().remove('fail:'+key)}
function p3Session_(token,role){const raw=CacheService.getScriptCache().get('session:'+p3Txt_(token,80));if(!raw)throw new Error('หมดเวลาเข้าใช้งาน กรุณาเข้าใหม่');const s=JSON.parse(raw);if(role&&s.role!==role&&s.role!=='admin')throw new Error('ไม่มีสิทธิ์');return s}
function p3NewSession_(data){const token=Utilities.getUuid();CacheService.getScriptCache().put('session:'+token,JSON.stringify(data),21600);return token}
function getPublicConfig(){const year=p3Setting_('displayYear'),y=p3Rows_('Years').find(r=>String(r[0])===year),students=p3Rows_('Students').filter(r=>String(r[1])===year&&r[4]===true).map(r=>({code:String(r[2])}));return {displayYear:year,className:y?y[1]:'ป.3/1',codes:students}}
function loginStudent(code,pin){
  const conf=getPublicConfig(),year=conf.displayYear,key='student:'+year+':'+p3Txt_(code,5);p3Throttle_(key,true);
  const yr=p3Rows_('Years').find(r=>String(r[0])===year&&r[4]===true),row=p3Rows_('Students').find(r=>String(r[1])===year&&String(r[2])===String(code)&&r[4]===true);
  if(!yr||!row||!p3Equal_(p3Hash_(pin,yr[2]),yr[3])){p3Throttle_(key,false);throw new Error('Rider Code หรือรหัสยังไม่ถูก')}
  p3ThrottleClear_(key);const token=p3NewSession_({role:'student',enrollmentId:row[0],year,code:String(row[2])}),saved=p3Rows_('States').find(r=>r[0]===row[0]);
  p3Audit_(row[0],'login','');return {token,rider:{code:String(row[2]),name:row[3],year},state:saved?JSON.parse(saved[1]):null}
}
function loginStaff(username,password){username=p3Txt_(username,30);const key='staff:'+username,rows=p3Rows_('Staff'),r=rows.find(x=>x[1]===username&&x[6]===true);p3Throttle_(key,true);if(!r||!p3Equal_(p3Hash_(password,r[4]),r[5])){p3Throttle_(key,false);throw new Error('บัญชีครูหรือรหัสผ่านไม่ถูกต้อง')}p3ThrottleClear_(key);p3Audit_(r[0],'staff_login','');return {token:p3NewSession_({role:r[3],staffId:r[0],name:r[2]}),staff:{name:r[2],role:r[3]}}}
function p3CleanState_(src,enrollmentId){
  if(!src||typeof src!=='object')throw new Error('ข้อมูลไม่ถูกต้อง');
  const confirms=new Set(p3Rows_('ProductReview').filter(r=>r[0]===enrollmentId&&r[2]===true).map(r=>Number(r[1])));
  const clean={units:{},sound:!!src.sound};for(let n=1;n<=9;n++){
    const raw=(src.units||{})[n]||{},u={done:{},scores:{},pre:null,post:null,product:p3Txt_(raw.product,3000),teacherConfirmed:confirms.has(n),attempts:{},reflections:{}};
    for(let s=1;s<=14;s++){if(raw.done&&raw.done[s])u.done[s]=true;const val=Math.floor(Number(raw.scores&&raw.scores[s])||0),max=s===11&&!u.teacherConfirmed?15:P3_MAX[s];if(u.done[s]&&val>0)u.scores[s]=Math.max(0,Math.min(max,val))}
    for(const k of ['pre','post'])if(raw[k]!==null&&raw[k]!==undefined)u[k]=Math.max(0,Math.min(20,Math.floor(Number(raw[k])||0)));
    for(const s of [1,3,4,7])if(raw.reflections&&raw.reflections[s])u.reflections[s]=p3Txt_(raw.reflections[s],500);
    if(u.teacherConfirmed&&u.product&&u.done[11])u.scores[11]=20;
    clean.units[n]=u;
  }
  return clean;
}
function saveProgress(token,raw){
  const ss=p3Session_(token,'student'),lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const clean=p3CleanState_(raw,ss.enrollmentId),json=JSON.stringify(clean);if(json.length>48000)throw new Error('ข้อมูลใหญ่เกินไป');
    const t=p3Now_();p3Upsert_('States',r=>r[0]===ss.enrollmentId,[ss.enrollmentId,json,t]);
    const oldStage=p3Rows_('StageScores'),stageIndex=new Map(oldStage.map((r,i)=>[r[0]+':'+r[3]+':'+r[4],i]));
    for(let n=1;n<=9;n++){const u=clean.units[n],score=Object.values(u.scores).reduce((a,b)=>a+Number(b),0),count=Object.keys(u.done).length;
      p3Upsert_('Progress',r=>r[0]===ss.enrollmentId&&Number(r[3])===n,[ss.enrollmentId,ss.year,ss.code,n,u.pre??'',u.post??'',score,count,!!u.product,u.teacherConfirmed,t]);
      for(const [stage,value] of Object.entries(u.scores)){const key=ss.enrollmentId+':'+n+':'+stage,i=stageIndex.get(key),record=[ss.enrollmentId,ss.year,ss.code,n,Number(stage),value,t];if(i===undefined)p3Tab_('StageScores').appendRow(record);else if(Number(oldStage[i][5])!==Number(value))p3Tab_('StageScores').getRange(i+2,1,1,record.length).setValues([record])}
    }
    return {ok:true,savedAt:t,state:clean};
  }finally{lock.releaseLock()}
}
function getTeacherReport(token,year){
  const staff=p3Session_(token,'teacher'),years=p3Rows_('Years').map(r=>String(r[0]));year=years.includes(String(year))?String(year):p3Setting_('displayYear');
  const prog=p3Rows_('Progress'),saved=new Map(p3Rows_('States').map(r=>[r[0],r[1]])),roster=p3Rows_('Students').filter(r=>String(r[1])===year).map(r=>{let data={units:{}};try{data=JSON.parse(saved.get(r[0])||'{"units":{}}')}catch(e){}const units=prog.filter(p=>p[0]===r[0]).map(p=>({unit:Number(p[3]),pre:p[4],post:p[5],score:p[6],done:p[7],submitted:p[8]===true,confirmed:p[9]===true})),products=[],reflections=[];for(let n=1;n<=9;n++){const u=data.units?.[n];if(!u)continue;if(u.product)products.push({unit:n,text:p3Txt_(u.product,3000)});for(const [s,text] of Object.entries(u.reflections||{}))reflections.push({unit:n,stage:Number(s),text:p3Txt_(text,500)})}return {code:String(r[2]),name:r[3],active:r[4]===true,units,products,reflections}});
  return {years,year,displayYear:p3Setting_('displayYear'),roster,role:staff.role};
}
function saveStudent(token,year,code,name,active){
  const st=p3Session_(token,'teacher');year=p3Txt_(year,4);name=p3Txt_(name,100);if(!name||!p3Rows_('Years').some(r=>String(r[0])===year))throw new Error('ปีหรือชื่อไม่ถูกต้อง');
  const rows=p3Rows_('Students'),i=rows.findIndex(r=>String(r[1])===year&&String(r[2])===String(code));
  if(i>=0){p3Tab_('Students').getRange(i+2,4,1,2).setValues([[name,!!active]]);p3Audit_(st.staffId,'student_edit',year+':'+code);return {code:String(code)}}
  const codes=rows.filter(r=>String(r[1])===year).map(r=>Number(r[2])||0),newCode=String(Math.max(0,...codes)+1).padStart(2,'0');if(Number(newCode)>99)throw new Error('รหัสเต็มแล้ว');
  p3Tab_('Students').appendRow([Utilities.getUuid(),year,newCode,name,!!active,p3Now_()]);p3Audit_(st.staffId,'student_add',year+':'+newCode);return {code:newCode};
}
function saveRoster(token,year,updates){
  const st=p3Session_(token,'teacher');year=p3Txt_(year,4);
  if(!Array.isArray(updates)||updates.length>99)throw new Error('จำนวนรายชื่อไม่ถูกต้อง');
  const rows=p3Rows_('Students'),changes=new Map(updates.map(x=>[p3Txt_(x.code,5),{name:p3Txt_(x.name,100),active:!!x.active}]));
  for(const r of rows)if(String(r[1])===year&&changes.has(String(r[2]))){const x=changes.get(String(r[2]));if(!x.name)throw new Error('กรอกชื่อนักเรียนให้ครบ');r[3]=x.name;r[4]=x.active}
  if(rows.length)p3Tab_('Students').getRange(2,1,rows.length,6).setValues(rows);
  p3Audit_(st.staffId,'roster_save',year+':'+updates.length);return {ok:true};
}
function addAcademicYear(token,year,className,pin){
  const st=p3Session_(token,'admin');year=p3Txt_(year,4);className=p3Txt_(className,40)||'ป.3/1';
  if(!/^25\d{2}$/.test(year)||p3Rows_('Years').some(r=>String(r[0])===year))throw new Error('ปีการศึกษาไม่ถูกต้องหรือมีแล้ว');
  if(!/^\d{4,8}$/.test(String(pin)))throw new Error('รหัสนักเรียนต้องเป็นตัวเลข 4–8 หลัก');
  const salt=Utilities.getUuid();p3Tab_('Years').appendRow([year,className,salt,p3Hash_(pin,salt),true,p3Now_()]);p3Audit_(st.staffId,'year_add',year);return {year};
}
function addTeacher(token,username,name,password){
  const st=p3Session_(token,'admin');username=p3Txt_(username,30);name=p3Txt_(name,100);password=String(password||'');
  if(!/^[A-Za-z0-9_-]{3,30}$/.test(username)||!name||password.length<12)throw new Error('ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง รหัสต้องยาวอย่างน้อย 12 ตัว');
  if(p3Rows_('Staff').some(r=>r[1]===username))throw new Error('ชื่อบัญชีนี้มีแล้ว');
  const salt=Utilities.getUuid();p3Tab_('Staff').appendRow([Utilities.getUuid(),username,name,'teacher',salt,p3Hash_(password,salt),true]);p3Audit_(st.staffId,'teacher_add',username);return {ok:true};
}
function setDisplayYear(token,year){const st=p3Session_(token,'admin');year=p3Txt_(year,4);if(!p3Rows_('Years').some(r=>String(r[0])===year))throw new Error('ไม่มีปีนี้');p3SetSetting_('displayYear',year);p3Audit_(st.staffId,'display_year',year);return {year}}
function confirmProduct(token,year,code,unit){
  const st=p3Session_(token,'teacher');unit=Number(unit);if(unit<1||unit>9)throw new Error('บทไม่ถูกต้อง');
  const person=p3Rows_('Students').find(r=>String(r[1])===String(year)&&String(r[2])===String(code));if(!person)throw new Error('ไม่พบนักเรียน');
  const before=p3Rows_('States').find(r=>r[0]===person[0]);if(!before)throw new Error('ยังไม่มีชิ้นงานให้ตรวจ');
  const submitted=JSON.parse(before[1]).units?.[unit];if(!submitted||!submitted.product||!submitted.done?.[11])throw new Error('นักเรียนยังไม่ส่งชิ้นงานบทนี้');
  p3Upsert_('ProductReview',r=>r[0]===person[0]&&Number(r[1])===unit,[person[0],unit,true,st.staffId,p3Now_()]);
  const row=p3Rows_('States').find(r=>r[0]===person[0]);if(row){const raw=JSON.parse(row[1]);if(raw.units&&raw.units[unit]){const u=raw.units[unit];u.teacherConfirmed=true;if(u.done&&u.done[11])u.scores[11]=20;const t=p3Now_(),score=Object.values(u.scores||{}).reduce((a,b)=>a+(Number(b)||0),0);p3Upsert_('States',r=>r[0]===person[0],[person[0],JSON.stringify(raw),t]);p3Upsert_('Progress',r=>r[0]===person[0]&&Number(r[3])===unit,[person[0],year,code,unit,u.pre??'',u.post??'',score,Object.keys(u.done||{}).length,!!u.product,true,t]);if(u.done&&u.done[11])p3Upsert_('StageScores',r=>r[0]===person[0]&&Number(r[3])===unit&&Number(r[4])===11,[person[0],year,code,unit,11,20,t])}}
  p3Audit_(st.staffId,'product_confirm',year+':'+code+':'+unit);return {ok:true};
}
