from pathlib import Path
from PIL import Image
import shutil,json
p=Path(__file__).parent
f=p/'login-school.js'
s=f.read_text('utf-8').replace('ไปกันเลย ⚡','ไปกันเลย').replace('🚀 ลองเล่น','ลองเล่น')
f.write_text(s,'utf-8')
f=p/'mission-learning.js'
s=f.read_text('utf-8').replace("function enhanceActivityArt(){", "function enhanceActivityArt(){const tip=$('.guide p');if(lessonRoute[step]?.type==='mouse'&&tip)tip.textContent='คลิกให้โดนแกน';")
f.write_text(s,'utf-8')
design='''# ภารกิจ ป.1 รุ่น 4 — บทเรียนอยู่ในภารกิจ

ต้นแบบนี้พัฒนาเต็มเส้นทางเฉพาะภารกิจ 2 จำนวน 17 ด่าน อีก 8 ภารกิจแสดงขอบเขตเนื้อหาสำหรับพัฒนาต่อ

## เส้นทางการเรียนรู้

แต่ละเรื่องวิชาการมี ก่อนเรียน → เรียนรู้ → รับภารกิจ → ลงมือทำ เนื้อหาอธิบายแนวคิดเชิงวิชาการ พร้อมสรุปคำสั้น ตัวอย่างภาพ และปุ่มฟัง เมื่ออุปกรณ์มีเสียงภาษาไทยที่ใช้ได้ ครูช่วยอ่านได้เมื่อไม่มีเสียง

มี 11 เรื่อง: การจัดลำดับและแสดงขั้นตอน การใช้เมาส์ ใส่รองเท้า เตรียมรับประทานอาหาร แปรงฟัน จัดกระเป๋า ใช้แป้นพิมพ์ เปิดเครื่องพลัง ปลูกดอกไม้ เตรียมนอน และทำงานร่วมกัน แบบทดสอบก่อนรายเรื่องรวม 13 ข้อ แยกจากแบบก่อน/หลังหน่วยเต็ม 4 คะแนน และคะแนนเกม ทดสอบรายเรื่องเป็นการสำรวจความรู้เดิม ไม่ใช้ตัดสินผ่านหน่วยเพียงอย่างเดียว

## เลือกด่านและทำต่อ

Timeline มีเลข 1–17 ทุกปุ่มเลือกได้ ปุ่มไปต่อยังเรียงตามด่านปกติ แสดงด่านปัจจุบันและด่านที่ผ่าน เก็บภาพที่กำลังเรียงเมื่อย้ายด่าน รวมทั้งสถานะก่อนเรียน เนื้อหา และรับภารกิจ กลับมาทำต่อได้ คะแนนก่อนรายเรื่องบันทึกครั้งแรก ไม่เพิ่มซ้ำเพียงเพราะกลับไปดูเนื้อหา

## ภาพและหน้าจอ

หน้าภารกิจปรับเป็นบัตร 9 ใบกระชับ ใช้โค้ดดาวและวงแหวนจาก Class-P1-Subject-Galaxy.html จริง ปรับขนาดและขอบเขตบนมือถือ ใช้ Techno 8 ท่าจากคลังเดิมสลับตามบทบาท ใช้ภาพสร้างใหม่ 36 ชิ้นและฉากบทเรียน 6 ฉาก แทนภาพประกอบอีโมจิในแผนที่ กิจกรรม และเกมฝึก

ภาพ 36 ชิ้นสร้างเป็นแผ่น 6×6 แล้วแยกเป็น PNG โปร่งใส 320×320 จัดกลางกรอบ ขนาดวัตถุสูงสุด 224 พิกเซล เว้นขอบประมาณ 48 พิกเซลทุกด้าน คัดเศษโปร่งใสและชิ้นส่วนเล็กตามขอบออก ภาพรองเท้าแก้เป็นผูกเชือก ภาพนอนลงแยกจากภาพห่มผ้า เพื่อให้ตรงกิจกรรม ภาพฉากประกอบใช้เพื่ออธิบายแนวคิด ไม่แทนคำสั่งขั้นตอนในเกม

## ข้อมูล

ยังเก็บผลในเครื่องตาม enrollmentId และปีการศึกษา ครูเลือกดูปี แอดมินตั้งปีหน้าผู้เรียน ผู้เข้าชมไม่ลงคะแนนในบัญชีจริง ยังไม่ได้เชื่อม Google Sheets/GAS จะเชื่อมเมื่อได้รับ Script ID ตามที่ตกลงไว้ โปรดอ่านโครงสร้างข้อมูล_GAS_GoogleSheets.md ในโฟลเดอร์แม่

ไฟล์ประกอบหลัก: mission-learning.js, mission-ui-v4.css, shared-planet.css และ assets/learning-v4 สร้างไฟล์เดี่ยวด้วย build.py ภาพถูกฝังใน HTML จึงใช้แบบออฟไลน์ได้
'''
(p/'บันทึกการออกแบบ_ภารกิจ_v4.md').write_text(design,'utf-8')
read=p/'อ่านก่อน.md'
read.write_text('# รุ่นล่าสุด: ภารกิจ v4\n\n'+design.split('## เส้นทางการเรียนรู้')[0].split('\n',1)[1]+'\nอ่าน บันทึกการออกแบบ_ภารกิจ_v4.md สำหรับการเรียนภายในภารกิจ แทนหน้าบทเรียนแยกในรุ่นก่อน\n\n'+read.read_text('utf-8'),'utf-8')
old=p/'หน้าบทเรียน_หน่วย2.md'
old.write_text('# หมายเหตุรุ่น 4\n\nเอกสารรุ่นเดิมด้านล่างเป็นประวัติการออกแบบ หน้าบทเรียนแยกถูกแทนด้วยบทเรียนภายในแต่ละด่านแล้ว ดู บันทึกการออกแบบ_ภารกิจ_v4.md\n\n'+old.read_text('utf-8'),'utf-8')
gas=p.parent/'โครงสร้างข้อมูล_GAS_GoogleSheets.md'
gas.write_text(gas.read_text('utf-8')+'''\n\n## เพิ่มเติมรุ่นเนื้อหา 4: เรียนในภารกิจ

Attempts เพิ่ม kind=topic-before และ contentVersion=4 ระบุ activityId=u2-<เรื่อง>, points, max, answers, at รวม 11 เรื่อง 13 ข้อ แยกผลก่อน/หลังหน่วยและเกม รายงานครูแสดงผลรวมก่อนรายเรื่องและจำนวนเรื่อง

Progress/checkpoint ต้องรองรับ missionStages (phase, answers, preSaved, visited, done), stageDrafts (order, hintLevel) และ routeDone พร้อม enrollmentId เดิม ด่านยังใช้ routeVersion=3 เพราะเลขด่านทั้ง 17 ไม่เปลี่ยน การเปลี่ยนชื่อหรือปีที่แสดงต้องไม่เปลี่ยนเจ้าของผล ให้ GAS ตรวจ session/บทบาทและ enrollmentId ฝั่งเซิร์ฟเวอร์ รวมทั้งป้องกันบันทึกซ้ำด้วย attemptId; preSaved ในต้นแบบเป็นเพียงตัวช่วยฝั่งหน้าจอ
''','utf-8')
assets=p/'assets/learning-v4'
ids='socks shoe tie wash meal plate paste brush cup book pencil bag carry crystal insert lid press hole soil seed water flower pillow lie blanket wet soap rinse towel mouse keyboard eye rock leaf moon star'.split()
boxes={}
for name in ids:
    box=Image.open(assets/(name+'.png')).getchannel('A').getbbox()
    assert box and min(box[0],box[1],320-box[2],320-box[3])>=45,(name,box)
    boxes[name]=box
(p/'ผลตรวจ_ภารกิจ_v4.md').write_text('''# ผลตรวจต้นแบบ v4

- เปิดครบ 11 เรื่อง ผ่านก่อนเรียน → เนื้อหา → รับภารกิจ → ลงมือทำ
- มีปุ่มเลือกด่านครบ 17 ปุ่ม เลือกด่าน 17 และย้อนกลับได้ ภาพที่เรียงค้างไว้ยังอยู่
- ทำตัวอย่างเรียงภาพสำเร็จแล้วปุ่มไปต่อไปด่านฝึกเมาส์ตามลำดับ
- ทดสอบ Rider 20 ตอบตัวเลือกแรกทุกข้อ รายงานหลังรีเฟรชยังแสดง 7/13 ครบ 11 เรื่อง
- เกมเมาส์จบ 8 รอบ ได้ 8 ดาว และปรากฏรอบเกม 1 รอบในรายงานครู
- ตรวจหน้าจอ 390×844 และภาพประกอบทั้งหมดมีขอบโปร่งใสไม่น้อยกว่า 45 พิกเซล (กรอบตั้งต้น 48 พิกเซล มีขอบการย่อภาพ)
- ภาพหน้าจอ qa-map-v4.png, qa-content-v4.png, qa-content-mobile-v4.png

การตรวจนี้ใช้รายชื่อสมมติในต้นแบบ ไม่ใช่ผลทดลองกับนักเรียนจริง ระบบ GAS และการรวมข้อมูลข้ามเครื่องยังไม่ได้เปิดใช้
''','utf-8')
prompt='''# คำสั่งและที่มาภาพรุ่น 4

วิธี: built-in image_gen สร้างภาพแบบแผ่นรวมตามคำขอ แล้วแยก/จัดขอบด้วย Pillow ใช้ภาพ Techno ที่ผู้ใช้ให้เป็นภาพอ้างอิงตัวละคร บันทึกต้นฉบับไว้โดยไม่ทับไฟล์ต้นฉบับจากตัวสร้างภาพ

## แผ่นภาพกิจกรรม 6×6

Create a transparent 6 by 6 atlas of 36 separate preschool educational objects in polished soft 3D illustration style, lavender, ivory and cyan accents. Uniform equal-size cells, centered objects, consistent scale, generous empty padding of at least 19 percent inside every cell. No text, no grid lines, no touching neighbouring objects. Row-major subjects: socks, lace-up shoe, tying laces, washing hands, meal, plate; toothpaste, toothbrush, cup, book, pencil, school bag; carrying bag, energy crystal, inserting crystal, lid, pressing button, planting hole; soil, seed, water, flower, pillow, lying in bed; blanket, wet hands, soap, rinse, towel, mouse; keyboard, eye, rock, leaf, moon, star.

## ฉากบทเรียน 3×2

Create a three-column two-row sheet of six separate lesson illustrations for Thai Grade 1. Use the supplied Techno open-hand character reference, preserve black/silver/pink armour, helmet and glowing pink eyes. Consistent soft polished 3D visual style. Six scenes: planning everyday steps; arranging picture cards; finding and fixing a school-bag sequence problem; practicing mouse use; practicing keyboard use; learning and planning together. Ivory gutters with equal padding around every panel, no text, no letters, no grid lines, no panel overlaps.

## แก้แผ่นภาพกิจกรรม

Edit the complete existing atlas, preserve all 36 cell positions and the same visual style. Change the shoe to a lace-up shoe with visible shoelaces, no Velcro. The lying-in-bed image shows the child lying down without the blanket covering the body; keep the separate blanket image for covering the body. Remove unrelated adjacent fragments around the eye. Keep every object isolated with consistent transparent padding, approximately 18 percent in every cell. No text or labels.

## ต้นฉบับ

- แผ่นแรก: C:/Users/ikan/.codex/generated_images/01a12445-4c30-7700-9012-ea66bb6215c8/exec-df54d722-e58c-4c02-9865-27d710b69aa5.png
- ฉาก 6 ภาพ: C:/Users/ikan/.codex/generated_images/01a12445-4c30-7700-9012-ea66bb6215c8/exec-165e341e-29cd-4c05-9c68-6f7e46f35a42.png
- แผ่นที่แก้แล้ว ใช้งานจริง: C:/Users/ikan/.codex/generated_images/01a12445-4c30-7700-9012-ea66bb6215c8/exec-f46a5690-b7a0-4d0f-8e15-f451c50354ce.png

ปลายทาง: assets/learning-v4 ในโครงการ และ G:/My Drive/krukan/Pic/Techno asset/P1-Learning-v4 รายการไฟล์อยู่ใน manifest ใช้ระบุภาพที่สร้างด้วย AI ในเอกสารประกวดได้ ภาพ Techno 8 ท่าเดิมเป็นภาพจากคลังผู้ใช้ ไม่ใช่สร้างใหม่ในรอบนี้
'''
(assets/'คำสั่งสร้างภาพ_v4.md').write_text(prompt,'utf-8')
shutil.copy2(assets/'คำสั่งสร้างภาพ_v4.md',Path('G:/My Drive/krukan/Pic/Techno asset/P1-Learning-v4')/'คำสั่งสร้างภาพ_v4.md')
print('Docs saved; validated transparent padding for',len(boxes),'assets')
