from pathlib import Path
import json, shutil
folder=Path(__file__).resolve().parent
p=folder/'offline.source.html'
s=p.read_text(encoding='utf-8')
s=s.replace("classList.remove('battle-mode');lessonOpen=false", "classList.remove('battle-mode','preview-mode');lessonOpen=false")
s=s.replace("${state.complete?'↻ เล่นหน่วย 2 อีกครั้ง':state.lesson&&state.lesson.step>0?'▶ เล่นภารกิจต่อ':'▶ เริ่มภารกิจหน่วย 2'}", "${state.lesson&&state.lesson.step>0&&state.lesson.step<8?'▶ เล่นภารกิจต่อ':state.complete?'↻ เล่นหน่วย 2 อีกครั้ง':'▶ เริ่มภารกิจหน่วย 2'}")
s=s.replace('หน่วย 2 · ขั้น ${step+1} จาก ${stepLabels.length}', "${battlePreview?'สนามฝึก · ผลเกมแยกจากบทเรียน':'หน่วย 2 · ขั้น '+(step+1)+' จาก '+stepLabels.length}")
s=s.replace("$('#app').classList.toggle('battle-mode',step===7);", "$('#app').classList.toggle('battle-mode',step===7);$('#app').classList.toggle('preview-mode',battlePreview);")
p.write_text(s,encoding='utf-8')
catalogPath=folder.parent/'คลังภาพเว็บ.json'
catalog=json.loads(catalogPath.read_text(encoding='utf-8'))
new=json.loads((folder/'assets/drive-files.json').read_text(encoding='utf-8'))
ids={x['id'] for x in catalog['files']}
catalog['files'] += [{**f,'mime_type':'application/json' if f['title'].endswith('.json') else 'image/png'} for f in new if f['id'] not in ids]
catalog['shooter_assets_verified']='2026-10-10: generated sheet + 6 pose PNGs + manifest found in authorized Drive folder via connector'
catalogPath.write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copy2(Path('C:/Users/ikan/Downloads/Techno-P1-ผลทั้งห้อง.json'),folder/'qa-demo-export.json')
(folder/'อ่านก่อน.md').write_text('''# ต้นแบบออฟไลน์ ป.1 · Rider Login + Phaser

เปิด Techno-P1-Offline.html ด้วย Chrome หรือ Edge ภาพและ Phaser รวมอยู่ในไฟล์ ไม่ต้องต่ออินเทอร์เน็ตระหว่างใช้งาน

1. เลือก Rider 01–20 (ชื่อสมมติสำหรับทดลอง)
2. ใส่รหัสนักเรียน 1234 แล้วจึงเห็นชื่อ
3. ตรวจชื่อ แล้วกดไปดาวสายฟ้า
4. ลองบทเรียนหน่วย 2 หรือปุ่มลองสู้มอนสเตอร์

สำหรับครู: กดปุ่มสำหรับครู ใส่รหัส 2468 ดูผลทั้งห้อง ดาวน์โหลด JSON และตั้งค่ารายชื่อ/รหัสร่วมได้ รายชื่อหนึ่งคนต่อบรรทัด เรียงเป็น Rider 01, 02, … อย่าสลับลำดับรหัสเมื่อมีคะแนนแล้ว

บันทึกอัตโนมัติแยกแต่ละ Rider: คำตอบและคะแนน 0–4 ก่อน/ระหว่าง/หลังเรียน คำใบ้ สะท้อนคิด ครูยืนยัน ภาพที่จัดค้างไว้ และผลเกมที่จบรอบ การพักหรือออกจากเกมที่ยังไม่จบไม่ถือเป็นผลแพ้ ข้อมูลต่างเครื่องหรือคนละเบราว์เซอร์ยังไม่รวมกัน และการล้างข้อมูลเบราว์เซอร์จะทำให้ข้อมูลที่เก็บหายได้ ดาวน์โหลดผลสำรองในหน้าครู

หน่วย 2 เล่นครบ 9 ขั้น: ก่อนเรียน เรื่องราว ดูตัวอย่าง ฝึก ลงมือทำกับเพื่อน โจทย์ใหม่ สะท้อนคิด สู้มอนสเตอร์ รับรางวัล หน่วยอื่นเป็นโครงร่างตามหลักสูตร

เกมใช้ Phaser 3.90.0 พร้อมภาพ Techno ใหม่ 6 ท่าและ Golden Parasite ต้นฉบับ เลือกท่าโจมตี เจ็บ และแพ้ตามเหตุการณ์ ปุ่มระบุแป้นในตัว: ←, →, Space, S มีพัก/เล่นต่อ ลองใหม่ และข้าม คะแนนเกมแยกจากการเรียน

สร้างภาพด้วย built-in image_gen จากภาพอ้างอิงผู้ใช้ บันทึกชีตและ PNG แยกท่าใน G:/My Drive/krukan/Pic/Techno asset ตรวจพบไฟล์บนคลัง Drive แล้ว และมีสำเนาใน assets ของต้นแบบ คำสั่งภาพเต็มอยู่ assets/คำสั่งสร้างภาพ_Techno.md

ไฟล์สำหรับแก้ไข: offline.source.html, login.js, login.css, battle-phaser.js, battle-phaser.css และ assets แก้แล้วเรียก build.py ด้วย Python เพื่อรวมเป็น HTML เดียว vendor เก็บ Phaser และใบอนุญาต MIT battle.js/battle.css เป็นรุ่นเดิม ไม่ได้โหลดในรุ่นนี้ update_minigame.py/upgrade_rider.py เป็นสคริปต์ย้ายซอร์ส ไม่ต้องเรียกซ้ำ

รหัสผ่านและรหัสครูรุ่นนี้เป็นการสาธิตฝั่งหน้าเว็บ ยังไม่ป้องกันข้อมูลด้วยเซิร์ฟเวอร์ ใช้ชื่อสมมติก่อน เมื่อขึ้น GAS ต้องตรวจรหัสและสิทธิ์ฝั่งเซิร์ฟเวอร์ ผูก token กับ Rider และเชื่อมบันทึกผลกลาง ไม่ควรเผยแพร่ต้นแบบที่ใส่รายชื่อจริงเป็นหน้าสาธารณะ

ยังไม่มีเสียงอ่าน ยังไม่ได้ทดลองกับนักเรียนจริงหรือหลายอุปกรณ์ ตัวเลขใน qa-demo-export.json และภาพผลทดสอบเป็นการตรวจระบบ ไม่ใช่หลักฐานผลสัมฤทธิ์เด็กจริง รายละเอียดอยู่ บันทึกการพัฒนา_Rider_Phaser.md และ ผลตรวจ_Rider_Phaser.md
''',encoding='utf-8')
print('Updated preview label, catalogue and offline documentation')
