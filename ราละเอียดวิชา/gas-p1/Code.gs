/** Techno Academy ป.1 — GAS server. All private records are checked here. */
const P1_SHEET_ID='1W9sm2yJiJHfnoIWNE1Hyfxl9YLuRRo-Hiu0-KJxcoiU';
const P1_PARENT_ID='1psKNgInM76xYBMq72zyJ9dEi57N6XDZu';
const P1_HEADERS={
  Settings:['key','value','updatedAt'],
  AcademicYears:['yearId','year','label','active','createdAt'],
  Classes:['classId','yearId','name','pinSalt','pinHash','active'],
  Students:['studentId','fullName','active','createdAt'],
  Enrollments:['enrollmentId','studentId','classId','riderCode','active','createdAt'],
  StaffUsers:['staffId','username','name','role','salt','passwordHash','active','createdAt'],
  Progress:['enrollmentId','year','riderCode','unit','preScore','postScore','stageScore','stageMax','stagesDone','complete','boss','fileId','updatedAt'],
  Attempts:['attemptId','enrollmentId','year','unit','stage','kind','points','maxPoints','detailJson','createdAt'],
  Files:['fileId','enrollmentId','unit','kind','name','mimeType','createdAt'],
  AuditLog:['at','actor','action','detail']
};

function doGet(){
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Techno Academy · วิทยาการคำนวณ ป.1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(name){return HtmlService.createHtmlOutputFromFile(name).getContent()}
function p1Book_(){return SpreadsheetApp.openById(P1_SHEET_ID)}
function p1Tab_(name){return p1Book_().getSheetByName(name)}
function p1Rows_(name){const sh=p1Tab_(name);if(!sh)return [];const n=sh.getLastRow();return n<2?[]:sh.getRange(2,1,n-1,P1_HEADERS[name].length).getValues()}
function p1Now_(){return new Date().toISOString()}
function p1Hash_(value,salt){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(salt)+':'+String(value));return bytes.map(x=>('0'+(x&255).toString(16)).slice(-2)).join('')}
function p1Eq_(a,b){a=String(a||'');b=String(b||'');let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0}
function p1Safe_(x,max=100){return String(x||'').trim().slice(0,max)}
function p1Audit_(actor,action,detail){p1Tab_('AuditLog').appendRow([p1Now_(),actor,action,p1Safe_(detail,500)])}
function p1Setting_(key){const row=p1Rows_('Settings').find(r=>r[0]===key);return row?String(row[1]):''}
function p1SetSetting_(key,value){const sh=p1Tab_('Settings'),rows=p1Rows_('Settings'),idx=rows.findIndex(r=>r[0]===key);if(idx<0)sh.appendRow([key,value,p1Now_()]);else sh.getRange(idx+2,2,1,2).setValues([[value,p1Now_()]])}
function p1Folder_(){const key='dataFolderId';let id=p1Setting_(key);if(id){try{return DriveApp.getFolderById(id)}catch(e){}}
  const parent=DriveApp.getFolderById(P1_PARENT_ID),folder=parent.createFolder('Techno-P1-Data');p1SetSetting_(key,folder.getId());return folder}
function p1Setup_(){
  const book=p1Book_(),lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const old=book.getSheetByName('ชีต1');if(old&&old.getLastRow()===0&&!book.getSheetByName('Settings'))old.setName('Settings');
    Object.keys(P1_HEADERS).forEach(name=>{let sh=book.getSheetByName(name);if(!sh)sh=book.insertSheet(name);const head=P1_HEADERS[name];if(sh.getLastRow()===0){sh.getRange(1,1,1,head.length).setValues([head]);sh.setFrozenRows(1);sh.getRange(1,1,1,head.length).setBackground('#211739').setFontColor('#ffffff').setFontWeight('bold');sh.autoResizeColumns(1,head.length)}});
    if(!p1Setting_('displayYear')){
      p1SetSetting_('displayYear','2569');p1SetSetting_('schemaVersion','1');
      const t=p1Now_();p1Tab_('AcademicYears').getRange(2,1,2,5).setValues([['year2569','2569','ปีการศึกษา 2569',true,t],['year2570','2570','ปีการศึกษา 2570',true,t]]);
      const salt='p1-class-2569',salt2='p1-class-2570';
      p1Tab_('Classes').getRange(2,1,2,6).setValues([['p1-1-2569','year2569','ป.1/1',salt,p1Hash_('1234',salt),true],['p1-1-2570','year2570','ป.1/1',salt2,p1Hash_('1234',salt2),true]]);
      const students=[],enrollments=[];for(let i=1;i<=20;i++){const n=String(i).padStart(2,'0');students.push(['sample-student-'+n,'นักเรียนตัวอย่าง '+n,true,t]);enrollments.push(['sample-enrollment-2569-'+n,'sample-student-'+n,'p1-1-2569','R'+n,true,t])}
      p1Tab_('Students').getRange(2,1,students.length,4).setValues(students);
      p1Tab_('Enrollments').getRange(2,1,enrollments.length,6).setValues(enrollments);
      // The bootstrap password is delivered separately; only its salted digest is stored.
      p1Tab_('StaffUsers').appendRow(['staff-admin','admin','ผู้ดูแลระบบ','admin','978d33bba72863db7187980dcf9e6515','dd8d140366ba6da8a12391363c858823c0892c42e27e6d528725198b4076daae',true,t]);
      p1Audit_('system','setup','Created schema and 20 fictional sample students');
    }
  }finally{lock.releaseLock()}
}
function getPublicConfig(){p1Setup_();const year=p1Setting_('displayYear'),yr=p1Rows_('AcademicYears').find(r=>String(r[1])===year),cl=p1Rows_('Classes').find(r=>r[1]===yr?.[0]&&r[5]===true),codes=p1Rows_('Enrollments').filter(r=>r[2]===cl?.[0]&&r[4]===true).map(r=>({id:r[3]})).sort((a,b)=>a.id.localeCompare(b.id));return {year,className:cl?.[2]||'ป.1/1',codes}}
function p1Throttle_(key,good){const c=CacheService.getScriptCache(),n=Number(c.get('fail:'+key)||0);if(good){if(n>=8)throw new Error('ลองใหม่ภายหลัง หรือแจ้งครู');return}c.put('fail:'+key,String(n+1),600)}
function p1ThrottleClear_(key){CacheService.getScriptCache().remove('fail:'+key)}
function p1Session_(token,role){const raw=CacheService.getScriptCache().get('session:'+p1Safe_(token,80));if(!raw)throw new Error('หมดเวลาเข้าใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง');const s=JSON.parse(raw);if(role&&s.role!==role&&s.role!=='admin')throw new Error('ไม่มีสิทธิ์ใช้งาน');return s}
function p1NewSession_(record){const token=Utilities.getUuid();CacheService.getScriptCache().put('session:'+token,JSON.stringify(record),21600);return token}
function loginStudent(code,pin){p1Setup_();const cfg=getPublicConfig(),classRow=p1Rows_('Classes').find(r=>r[2]===cfg.className&&r[1]==='year'+cfg.year),key='student:'+cfg.year+':'+p1Safe_(code,5);p1Throttle_(key,true);
  const match=p1Rows_('Enrollments').find(r=>r[2]===classRow?.[0]&&r[3]===code&&r[4]===true),valid=match&&p1Eq_(p1Hash_(pin,classRow[3]),classRow[4]);if(!valid){p1Throttle_(key,false);throw new Error('รหัสยังไม่ถูก ลองใหม่หรือถามครู')}
  const student=p1Rows_('Students').find(r=>r[0]===match[1]&&r[2]===true);if(!student)throw new Error('บัญชีนี้ยังเข้าเรียนไม่ได้');p1ThrottleClear_(key);const token=p1NewSession_({role:'student',enrollmentId:match[0],studentId:match[1],classId:match[2],code:match[3],year:cfg.year});p1Audit_(match[0],'student_login','');return {token,rider:{id:match[3],studentId:match[1],enrollmentId:match[0],name:student[1],academicYear:cfg.year,academicYearId:'year'+cfg.year,classId:match[2]},state:p1LoadState_(match[0])}}
function loginStaff(username,password){p1Setup_();username=p1Safe_(username,30);const key='staff:'+username;p1Throttle_(key,true);const user=p1Rows_('StaffUsers').find(r=>r[1]===username&&r[6]===true);if(!user||!p1Eq_(p1Hash_(password,user[4]),user[5])){p1Throttle_(key,false);throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')}
  p1ThrottleClear_(key);const token=p1NewSession_({role:user[3],staffId:user[0],name:user[2]});p1Audit_(user[0],'staff_login','');return {token,staff:{id:user[0],name:user[2],role:user[3]}}}
function p1LoadState_(enrollmentId){const r=p1Rows_('Progress').find(row=>row[0]===enrollmentId&&row[3]==='STATE');if(!r||!r[11])return null;try{return JSON.parse(DriveApp.getFileById(r[11]).getBlob().getDataAsString('UTF-8'))}catch(e){return null}}
function getMyProgress(token){const s=p1Session_(token,'student');return p1LoadState_(s.enrollmentId)}
function p1UpsertProgress_(row){const sh=p1Tab_('Progress'),all=p1Rows_('Progress'),i=all.findIndex(r=>r[0]===row[0]&&String(r[3])===String(row[3]));if(i<0)sh.appendRow(row);else sh.getRange(i+2,1,1,row.length).setValues([row])}
function saveProgress(token,state){const s=p1Session_(token,'student');if(!state||state.version!==3)throw new Error('ข้อมูลผลเรียนไม่ถูกต้อง');let json=JSON.stringify(state);if(json.length>450000)throw new Error('ข้อมูลใหญ่เกินไป กรุณาแจ้งครู');const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{const artifact=state.units?.u09?.artifact,match=typeof artifact?.image==='string'&&artifact.image.match(/^data:(image\/png|image\/webp);base64,([A-Za-z0-9+/=]+)$/);
    if(match&&artifact.at&&!p1Rows_('Files').some(r=>r[1]===s.enrollmentId&&r[3]==='unit9-artifact'&&r[4]===artifact.at)){
      const mime=match[1],ext=mime==='image/png'?'png':'webp',blob=Utilities.newBlob(Utilities.base64Decode(match[2]),mime,'Techno-'+s.code+'-'+s.year+'.'+ext),imageFile=p1Folder_().createFile(blob);
      p1Tab_('Files').appendRow([imageFile.getId(),s.enrollmentId,9,'unit9-artifact',artifact.at,mime,p1Now()]);
    }
    const old=p1Rows_('Progress').find(r=>r[0]===s.enrollmentId&&r[3]==='STATE'),file=old?.[11]?DriveApp.getFileById(old[11]):p1Folder_().createFile('progress-'+s.enrollmentId+'.json',json,MimeType.PLAIN_TEXT);if(old?.[11])file.setContent(json);
    p1UpsertProgress_([s.enrollmentId,s.year,s.code,'STATE','','','','','',false,'',file.getId(),p1Now()]);
    const stageCounts=[12,17,12,13,13,13,12,12,13];
    for(let n=1;n<=9;n++){const d=state.units?.['u'+String(n).padStart(2,'0')],scores=n===2?(state.stageScores||{}):(d?.stageScores||{}),max=stageCounts[n-1]*10;let points=Object.values(scores).reduce((v,x)=>v+(Number(x.points)||0),0),done=Object.keys(scores).length;
      p1UpsertProgress_([s.enrollmentId,s.year,s.code,n,d?.pre?.points??'',d?.post?.points??'',points,max,done,Boolean(d?.complete||(n===2&&state.complete)),d?.boss?.won?'ชนะ':d?.boss?.skipped?'ข้าม':'',file.getId(),p1Now()]);
    }
    const attempts=[...(Array.isArray(state.attempts)?state.attempts.map(a=>({...a,unit:2})):[]),...Object.values(state.units||{}).flatMap(d=>Array.isArray(d.attempts)?d.attempts:[])];const known=new Set(p1Rows_('Attempts').filter(r=>r[1]===s.enrollmentId).map(r=>r[0]));const fresh=attempts.filter(a=>a.attemptId&&!known.has(a.attemptId)).slice(-100);if(fresh.length)p1Tab_('Attempts').getRange(p1Tab_('Attempts').getLastRow()+1,1,fresh.length,10).setValues(fresh.map(a=>[a.attemptId,s.enrollmentId,s.year,a.unit||2,a.stage??'',a.kind||'',a.points??'',a.maxPoints??'',JSON.stringify(a).slice(0,30000),a.at||p1Now()]));
    return {ok:true,savedAt:p1Now(),attemptsAdded:fresh.length}
  }finally{lock.releaseLock()}}
function getTeacherReport(token,year){const s=p1Session_(token,'teacher');p1Setup_();const years=p1Rows_('AcademicYears').map(r=>String(r[1]));year=years.includes(String(year))?String(year):p1Setting_('displayYear');const cl=p1Rows_('Classes').find(r=>r[1]==='year'+year),people=new Map(p1Rows_('Students').map(r=>[r[0],r])),progress=p1Rows_('Progress');const roster=p1Rows_('Enrollments').filter(r=>r[2]===cl?.[0]).map(r=>({enrollmentId:r[0],code:r[3],name:people.get(r[1])?.[1]||'',active:r[4]===true,units:progress.filter(p=>p[0]===r[0]&&p[3]!=='STATE').map(p=>({unit:p[3],pre:p[4],post:p[5],score:p[6],max:p[7],done:p[8],complete:p[9],boss:p[10]}))}));return {year,displayYear:p1Setting_('displayYear'),years,roster,role:s.role,staffName:s.name}}
function upsertStudent(token,year,code,name,active){const s=p1Session_(token,'teacher');year=p1Safe_(year,4);name=p1Safe_(name,100);if(!/^\d{4}$/.test(year)||!name)throw new Error('กรอกปีและชื่อให้ครบ');const cl=p1Rows_('Classes').find(r=>r[1]==='year'+year);if(!cl)throw new Error('ไม่พบปีการศึกษา');const roster=p1Rows_('Enrollments'),match=roster.find(r=>r[2]===cl[0]&&r[3]===code);if(match){const sh=p1Tab_('Students'),all=p1Rows_('Students'),i=all.findIndex(r=>r[0]===match[1]);if(i<0)throw new Error('ไม่พบผู้เรียน');sh.getRange(i+2,2).setValue(name);sh.getRange(i+2,3).setValue(Boolean(active));const en=p1Tab_('Enrollments'),j=roster.findIndex(r=>r[0]===match[0]);en.getRange(j+2,5).setValue(Boolean(active));p1Audit_(s.staffId,'edit_student',match[0]);return {ok:true,code}}
  const used=roster.filter(r=>r[2]===cl[0]).map(r=>Number(String(r[3]).slice(1))),number=used.length?Math.max(...used)+1:1;if(number>99)throw new Error('เต็ม 99 รหัสแล้ว');const rider='R'+String(number).padStart(2,'0'),studentId=Utilities.getUuid(),enrollmentId=Utilities.getUuid();p1Tab_('Students').appendRow([studentId,name,true,p1Now_()]);p1Tab_('Enrollments').appendRow([enrollmentId,studentId,cl[0],rider,true,p1Now_()]);p1Audit_(s.staffId,'add_student',enrollmentId);return {ok:true,code:rider}}
function addAcademicYear(token,year){const s=p1Session_(token,'admin');year=p1Safe_(year,4);if(!/^\d{4}$/.test(year)||p1Rows_('AcademicYears').some(r=>String(r[1])===year))throw new Error('ปีการศึกษาต้องเป็นเลข 4 หลักที่ยังไม่มี');const id='year'+year,salt=Utilities.getUuid();p1Tab_('AcademicYears').appendRow([id,year,'ปีการศึกษา '+year,true,p1Now_()]);p1Tab_('Classes').appendRow(['p1-1-'+year,id,'ป.1/1',salt,p1Hash_('1234',salt),true]);p1Audit_(s.staffId,'add_year',year);return {ok:true,year}}
function setDisplayYear(token,year){const s=p1Session_(token,'admin');year=p1Safe_(year,4);if(!p1Rows_('AcademicYears').some(r=>String(r[1])===year))throw new Error('ไม่พบปีการศึกษา');p1SetSetting_('displayYear',year);p1Audit_(s.staffId,'display_year',year);return {ok:true,year}}
function addTeacher(token,username,name,password){const s=p1Session_(token,'admin');username=p1Safe_(username,30);name=p1Safe_(name,100);if(!/^[a-zA-Z0-9_-]{3,30}$/.test(username)||!name||String(password).length<10)throw new Error('ชื่อบัญชีหรือรหัสไม่ถูกต้อง (รหัสอย่างน้อย 10 ตัว)');if(p1Rows_('StaffUsers').some(r=>r[1]===username))throw new Error('มีบัญชีนี้แล้ว');const salt=Utilities.getUuid();p1Tab_('StaffUsers').appendRow([Utilities.getUuid(),username,name,'teacher',salt,p1Hash_(password,salt),true,p1Now_()]);p1Audit_(s.staffId,'add_teacher',username);return {ok:true}}
