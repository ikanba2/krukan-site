from pathlib import Path
import shutil
p=Path(__file__).parent
f=p/'prepare_learning_assets.py';s=f.read_text(encoding='utf-8').replace('exec-df54d722-e58c-4c02-9865-27d710b69aa5.png','exec-f46a5690-b7a0-4d0f-8e15-f451c50354ce.png');f.write_text(s,encoding='utf-8')
f=p/'mission-learning.js';s=f.read_text(encoding='utf-8')
start=s.index("if(stage?.type==='model'){");end=s.index("if(stage?.type==='story')",start)
s=s[:start]+s[end:]
s+='''
tasks.model={...tasks.shoes,title:'ลองเรียงภาพทีละขั้น',goal:'เรียงภาพ แล้วเล่าให้ Techno ฟัง'};
const taskResolverV3=taskForStep;
taskForStep=function(){return lessonRoute[step]?.type==='model'?'model':taskResolverV3()};
'''
s=s.replace('ครูใช้ตัวอย่างนี้เพื่อฝึกคิดเรื่องขั้นตอน ไม่ใช้แทนคำแนะนำสุขภาพเฉพาะบุคคล','เราฝึกอธิบายเหตุผลว่าทำไมขั้นเตรียมจึงต้องมาก่อนขั้นใช้งาน')
f.write_text(s,encoding='utf-8')
f=p/'login-school.js';s=f.read_text(encoding='utf-8')
s=s.replace("after=s.attempts.filter(a=>a.kind==='challenge').at(-1);", "after=s.attempts.filter(a=>a.kind==='challenge').at(-1),topicTests=s.attempts.filter(a=>a.kind==='topic-before');")
s=s.replace("<td>${s.attempts.filter(a=>a.kind==='practice').length}</td>", "<td>${topicTests.length?topicTests.reduce((n,a)=>n+a.points,0)+'/'+topicTests.reduce((n,a)=>n+a.maxPoints,0):'—'}<br><small>${topicTests.length} เรื่อง</small></td><td>${s.attempts.filter(a=>a.kind==='practice').length}</td>")
s=s.replace('<th>รอบฝึก</th>', '<th>ก่อนรายเรื่อง</th><th>รอบฝึก</th>').replace('colspan="6"','colspan="7"')
f.write_text(s,encoding='utf-8')
f=p/'mission-ui-v4.css';s=f.read_text(encoding='utf-8')+'\n.skill-intro span .edu-art{width:100px;height:100px}.skill-intro>span{line-height:1}\n';f.write_text(s,encoding='utf-8')
print('Patched model practice and per-topic pretest reporting')
