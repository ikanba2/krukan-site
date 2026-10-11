from pathlib import Path
import re
folder=Path(__file__).resolve().parent
p=folder/'offline.source.html'
s=p.read_text(encoding='utf-8')
if '__EXPANDED_SCRIPT__' not in s:
    (folder/'offline.v2.source.backup.html').write_text(s,encoding='utf-8')
    s=s.replace('__LOGIN_STYLE__','__LOGIN_STYLE__\n__EXPANDED_STYLE__')
    s=s.replace('__LOGIN_SCRIPT__','__LOGIN_SCRIPT__\n__EXPANDED_SCRIPT__')
    s=re.sub(r"const stepLabels=\[.*?\];",'let stepLabels=[];',s)
    start=s.index('function persist(){')
    end=s.index('function toast(',start)
    s=s[:start]+'''function persist(){if(!currentRider)return;const guest=currentRider.guest;if(!guest){try{StudentRepository.save(currentRider.id,state);storageOK=true}catch(e){storageOK=false}}const status=$('#save-status');if(status){status.textContent=guest?'ผู้เข้าชม · ผลอยู่ในรอบนี้':storageOK?'✓ บันทึกในเครื่อง':'บันทึกไม่ได้ · แจ้งครู';status.classList.toggle('failed',!guest&&!storageOK)}}
'''+s[end:]
    start=s.index('function footer(){')
    end=s.index('function renderMap(',start)
    s=s[:start]+'''function footer(){return `<span id="save-status" class="save-status-pill">${currentRider?.guest?'ผู้เข้าชม · ผลอยู่ในรอบนี้':storageOK?'✓ บันทึกในเครื่อง':'บันทึกไม่ได้ · แจ้งครู'}</span><div class="footer"><span>ต้นแบบ · หน่วย 2 มี 17 ด่าน · ปี ${esc(currentRider?.academicYear||schoolDB.displayYear)}</span><span>ยังไม่ส่งข้อมูลขึ้น Google Sheets / GAS</span></div>`}
'''+s[end:]
    s=s.replace("state.lesson.step<8","state.lesson.step<lessonRoute.length-1")
    s=s.replace('battlePreview=true;step=7;','battlePreview=true;skillStandalone=false;step=lessonRoute.findIndex(r=>r.type===\'battle\');')
    s=s.replace("function modal(html){pauseBattle();","function modal(html){pauseBattle();pauseSkillGame();")
    s=s.replace("if(lessonOpen&&step===8)","if(lessonOpen&&step===lessonRoute.length-1)")
    p.write_text(s,encoding='utf-8')
b=folder/'battle-phaser.js'
t=b.read_text(encoding='utf-8')
t=t.replace("${storageOK?'บันทึกให้ Rider '+currentRider.id.slice(1)+' แล้ว':'ยังบันทึกไม่ได้ กรุณาให้ครูดาวน์โหลดผล'}", "${currentRider.guest?'ผู้เข้าชม · ผลอยู่ในรอบนี้':storageOK?'บันทึกให้ Rider '+currentRider.id.slice(1)+' แล้ว':'ยังบันทึกไม่ได้ ให้ครูดาวน์โหลดผล'}")
b.write_text(t,encoding='utf-8')
e=folder/'learning-expanded.js'
t=e.read_text(encoding='utf-8').replace('speechSynthesis?.cancel?.();','globalThis.speechSynthesis?.cancel?.();')
e.write_text(t,encoding='utf-8')
print('Updated offline prototype: guest, academic years, expanded learning and two skill games')
