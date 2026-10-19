"""สร้าง gas-sim.js: เซิร์ฟเวอร์จำลอง (รันโค้ด Code.gs ตัวจริงในเบราว์เซอร์ เก็บข้อมูลใน localStorage)
ทำให้ไฟล์ออฟไลน์ทำงานผ่านเส้นทางออนไลน์เดียวกับระบบจริงทุกอย่าง (เข้าด้วยเลขที่+รหัส ส่งงาน ครูตรวจ ฯลฯ)
ใช้: python build_sim.py  → เขียน ../../MyIPST_CS_M1-M3_DT_M2-M3/ต้นแบบเว็บ_DT-M2_Offline/gas-sim.js"""
from pathlib import Path
import json
here = Path(__file__).resolve().parent
out = here.parent.parent / 'MyIPST_CS_M1-M3_DT_M2-M3' / 'ต้นแบบเว็บ_DT-M2_Offline' / 'gas-sim.js'
code = (here / 'Code.gs').read_text(encoding='utf-8')
mock = (here / 'gas-mock.js').read_text(encoding='utf-8')
fns = ['saveDraft', 'getPublicConfig', 'loginStudent', 'loginStaff', 'pushSubmission', 'pushPractice', 'pullMine', 'pullAll', 'saveReviews', 'upsertStudents', 'setConfig', 'changeStaffPassword', 'aiDraftReview', 'setAutoDraft', 'getAutoDraft', 'dtAutoDraftTick', 'getMyFinal', 'startFinal', 'submitFinal', 'gradeFinalPreview', 'resetFinal']
js = ('/* สร้างอัตโนมัติจาก gas-dt-m2/build_sim.py — เซิร์ฟเวอร์จำลองสำหรับเปิดไฟล์ในเครื่อง (ไม่ใช้ใน Apps Script) */\n' + mock +
 '\n;(function(){var KEY="krukan-dt-m2-sim-server",env=window.makeGasEnv();'
 'function load(){try{env.load(JSON.parse(localStorage.getItem(KEY)))}catch(e){}}function save(){try{localStorage.setItem(KEY,JSON.stringify(env.dump()))}catch(e){}}load();'
 'env.ctx.__fetch=function(url,opt){var n=JSON.parse(opt.payload).contents[0].parts[0].text.split(String.fromCharCode(10)).filter(function(l){return /^[0-9]+[.] /.test(l)}).length||4;var sc=[];for(var i=0;i<n;i++)sc.push(i%2?12:15);var t=JSON.stringify({scores:sc,comment:"[ตัวอย่างจำลองสำหรับทดสอบหน้าจอ ไม่ได้มาจาก AI จริง] สิ่งที่ทำได้ดี: เขียนปัญหาและเหตุผลต่อเนื่องกัน จุดที่ยังขาด: ยังไม่มีตัวเลขขนาดพร้อมหน่วยและผลทดสอบที่ตรวจสอบได้ ขั้นต่อไป: เพิ่มขนาดพร้อมหน่วย และบันทึกผลทดสอบ 3 รอบตามจริง"});return {getResponseCode:function(){return 200},getContentText:function(){return JSON.stringify({candidates:[{content:{parts:[{text:t}]}}]})}}};function ensureKey(){var pp=env.ctx.PropertiesService.getScriptProperties();if(!pp.getProperty("GEMINI_API_KEY"))pp.setProperty("GEMINI_API_KEY","SIM-ONLY")}'
 'var names=Object.keys(env.ctx).filter(function(k){return["console","JSON","Math","String","Number","Array","Object","Date","Error"].indexOf(k)<0});'
 'var api=new Function(names.join(","),' + json.dumps(code + '\nreturn {' + ','.join(fns) + '};') + ').apply(null,names.map(function(n){return env.ctx[n]}));'
 'var w={};Object.keys(api).forEach(function(k){w[k]=function(){load();ensureKey();try{return api[k].apply(null,arguments)}finally{save()}}});'
 'window.DT_CLOUD_SHIM=w;setInterval(function(){try{w.dtAutoDraftTick()}catch(e){}},20000);window.DT_SIM_MODE=true;window.DT_SIM_RESET=function(){localStorage.removeItem(KEY);location.reload()}})();\n')
out.write_text(js, encoding='utf-8')
print('wrote', out.name, round(len(js) / 1024), 'KB')
