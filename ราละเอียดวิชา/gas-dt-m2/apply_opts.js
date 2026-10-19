// ใช้ครั้งเดียวกับ M2: node apply_opts.js <โฟลเดอร์แอป> <opts_fix.json>  แก้ตัวเลือกในไฟล์ practice-data.js / prepost-data.js ให้ยาวใกล้กัน
const fs=require('fs'),path=require('path');
const [,, app, fixf]=process.argv;const fix=JSON.parse(fs.readFileSync(fixf,'utf8'));
const files={practice:['practice-data.js','DT_PRACTICE'],prepost:['prepost-data.js','DT_PREPOST']};
const data={};
for(const [k,[f,v]] of Object.entries(files)){global.window={};const src=fs.readFileSync(path.join(app,f),'utf8');eval(src);data[k]={f,v,src,obj:window[v]};}
let n=0,miss=[];
for(const [key,arr] of Object.entries(fix)){
  const [w,c,i]=key.split('.');const d=(w==='pre'||w==='post')?data.prepost:data.practice;
  const list=d.obj[c]&&d.obj[c][w==='items'?'items':w==='battle'?'battle':w];const q=list&&list[+i];
  if(!q||!q.opts||q.opts.length!==arr.length){miss.push(key);continue;}
  const [r,...wr]=arr;const a=q.ans;wr.splice(a,0,r);q.opts=wr;n++;
}
for(const d of Object.values(data)){
  const head=d.src.slice(0,d.src.indexOf('window.'+d.v));
  // คงส่วนท้ายไฟล์ที่ตามหลังอ็อบเจ็กต์หลัก (เช่น DT_REFLECT) ถ้ามี
  const rest=d.src.slice(d.src.indexOf('window.'+d.v));
  const m=rest.match(/\n};\n([\s\S]*)$/);const tail=m?m[1]:'';
  fs.writeFileSync(path.join(app,d.f),head+'window.'+d.v+' = '+JSON.stringify(d.obj,null,1)+';\n'+tail);
}
console.log('applied',n,'missing',miss);
