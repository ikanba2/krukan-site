'use strict';
// Read-only evaluation of the current grading pipeline with synthetic data.
// No Google API is called, and no live credentials or student submissions are read.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const proto=path.resolve(__dirname,'..');
const gas=path.resolve(proto,'../../ราละเอียดวิชา/gas-dt-m1/Code.gs');
const app=fs.readFileSync(path.join(proto,'app.js'),'utf8');
const server=fs.readFileSync(gas,'utf8');
const fieldStart=app.indexOf('const workFields=');
assert(fieldStart>=0);
const fieldContext={};vm.createContext(fieldContext);
vm.runInContext(app.slice(fieldStart,app.indexOf('function work(',fieldStart)).replace('const workFields=','globalThis.fields='),fieldContext);
const fields=fieldContext.fields;
const dataContext={window:{}};vm.createContext(dataContext);vm.runInContext(fs.readFileSync(path.join(proto,'course-data.js'),'utf8'),dataContext);
const D=dataContext.window.DT_DATA;
const block=server.slice(server.indexOf('const DT_AI_SYSTEM'),server.indexOf('const DT_AUTO_FN'));
assert(block.includes('function dtAiCore_'));
const rubric=[{criterion:'ตอบปัญหาจากหลักฐาน',points:40},{criterion:'อธิบายเหตุผล',points:25},{criterion:'ทดสอบ',points:20},{criterion:'สื่อสาร',points:15}];
function probe(fieldsPayload,labs,reply){
  let captured=null;
  const row=['audit-only','','','','',1,'','','',JSON.stringify({fields:fieldsPayload,labs})];
  const store={GEMINI_API_KEY:'AUDIT_DUMMY_NOT_A_REAL_KEY'};
  const ctx={
    dtSafe_:(x,n)=>String(x==null?'':x).trim().slice(0,n||100),dtProps_:()=>({getProperty:k=>store[k],setProperty:(k,v)=>store[k]=v}),
    dtRows_:()=>[row],dtNow_:()=> '2026-10-18T00:00:00.000Z',
    CacheService:{getScriptCache:()=>({get:()=>null,put:()=>{}})},
    UrlFetchApp:{fetch:(_url,opt)=>{captured=JSON.parse(opt.payload);return{getResponseCode:()=>200,getContentText:()=>JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(reply)}]}}]})};}}
  };
  vm.createContext(ctx);vm.runInContext(block,ctx);
  const result=ctx.dtAiCore_('audit-only',rubric,{observations:'คำถามที่เห็นบนเว็บ'},true);
  return {result,prompt:captured.contents[0].parts[0].text,system:captured.systemInstruction.parts[0].text};
}
const findings=[];
const r=probe({observations:'คำตอบสังเคราะห์สำหรับตรวจระบบ'}, {auditLab:{reason:'UNIQUE_LAB_EVIDENCE_MARKER',values:{width:19,depth:12},strokes:[[[0,0],[1,1]]]}},{scores:[20,10,10,5],comment:'ร่างสังเคราะห์'});
assert(!r.prompt.includes('UNIQUE_LAB_EVIDENCE_MARKER'));
findings.push({id:'API_NO_LABS',confirmed:true,observation:'Labs are stored with submission but omitted from model request.'});
assert(!r.prompt.includes(D.course.chapters[0].assignment));
findings.push({id:'API_NO_TASK_BRIEF',confirmed:true,observation:'Request contains rubric titles and answers, not the chapter assignment, constraints, field guidance or criterion level descriptions.'});
const long=probe({observations:'ก'.repeat(1550)+'TAIL_EVIDENCE_MARKER'}, {},{scores:[1,1,1,1],comment:'ร่าง'});
assert(!long.prompt.includes('TAIL_EVIDENCE_MARKER'));
findings.push({id:'SILENT_TRUNCATION',confirmed:true,uiLimit:12000,perFieldModelLimit:1500,combinedLimit:9000});
const missing=probe({observations:'ตัวอย่าง'}, {},{scores:[40],comment:'มีเพียงเกณฑ์แรก'});
assert.deepStrictEqual(Array.from(missing.result.scores),[40,0,0,0]);
findings.push({id:'MISSING_SCORES_BECOME_ZERO',confirmed:true,returnedScores:Array.from(missing.result.scores)});
const invalid=probe({observations:'ตัวอย่าง'}, {},{scores:['not-a-number',999,-20,15],comment:'ข้อมูลผิดรูปแบบ'});
assert.deepStrictEqual(Array.from(invalid.result.scores),[0,25,0,15]);
findings.push({id:'INVALID_SCORES_SILENTLY_COERCED',confirmed:true,returnedScores:Array.from(invalid.result.scores)});
const combined={evidenceMode:'รูปแบบหลักฐาน'};Object.values(fields).forEach(list=>list.forEach(([k,t])=>combined[k]=t));
const duplicates=[];
for(const[ch,list]of Object.entries(fields))for(const[k,title]of list)if(combined[k]!==title)duplicates.push({chapter:Number(ch),key:k,titleOnStudentPage:title,titleSentInAutoMode:combined[k]});
assert(duplicates.some(x=>x.chapter===1&&x.key==='problem'));
findings.push({id:'AUTO_LABEL_COLLISION',confirmed:true,duplicates});
assert(r.system.includes('เขียนสั้นเกินไป'));
findings.push({id:'LENGTH_PENALTY',confirmed:true,observation:'System prompt explicitly asks for a low score when text is too short, without criterion-specific sufficiency.'});
const chapters=D.course.chapters.map(c=>({id:c.id,title:c.title,assignment:c.assignment,starter:D.projects[c.id].starter,requirements:D.projects[c.id].requirements,acceptance:D.projects[c.id].acceptance,rubric:c.rubric,fields:fields[c.number].map(([key,title,guide])=>({key,title,guide}))}));
const artifact={date:'2026-10-18',type:'source-and-mocked-request-audit',realApiCalls:0,liveStudentDataRead:false,counts:{chapters:chapters.length,fields:Object.values(fields).reduce((n,a)=>n+a.length,0),confirmedFindings:findings.length},findings,chapters,sourceHashes:[gas,path.join(proto,'app.js'),path.join(proto,'teacher-queue.js'),path.join(proto,'cloud.js')].map(f=>({file:path.relative(proto,f),sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')}))};
fs.writeFileSync(path.join(proto,'WORK_QUESTION_AUDIT_EVIDENCE.json'),JSON.stringify(artifact,null,2)+'\n','utf8');
console.log(JSON.stringify({pass:true,...artifact.counts,realApiCalls:0,findings:findings.map(x=>x.id)},null,2));
