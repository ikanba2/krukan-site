"""บันทึกการอัปเดตวันที่ 27 ต.ค. 2569 (วันใหม่ = รายการใหม่บนสุด เก็บของเดิมไว้ ตามกติกา patch notes) + ปรับคำอธิบายการ์ด 4 เกมทักษะ + ที่อยู่หน้าผจญภัยเมาส์
ลงหน้าแรกฉบับเต็ม (Home-Play-Learn-Gaming.html) และ tools/etc-page/quests.json รันซ้ำได้ (ใส่แล้วจะข้าม)
ต่อด้วย python tools/build-home-lite.py และ python tools/build-etc-page.py"""
import io
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
DATE, VERSION = '2026-10-27', '2.11.0'
NOTES = [
    'ปรับปรุงเกมฝึกทักษะคอมพิวเตอร์พื้นฐานทั้ง 4 เกมใหม่หมด เมืองสีรุ้ง จอมจังหวะ ภารกิจแป้นพิมพ์ และผจญภัยเมาส์ ตอนนี้เกมละ 8 โลก โลกละ 6 ด่าน รวม 48 ด่าน (ด่านที่ 6 ของทุกโลกเป็นบอส) มีเสียงอ่านโจทย์ให้ฟัง คอมโบ ดาว เอฟเฟกต์ และมาสไรเดอร์คอยให้กำลังใจ ทำพลาดไม่ตกด่าน เกมจะบอกใบ้ให้ และมีอันดับดาวสะสมในหน้าสรุปผล',
    'เมืองสีรุ้ง (อนุบาล 3–ป.1) ฝึกสี รูปทรง นับเลข เรียงลำดับ ต่อแบบ จับคู่ความจำ แยกหมวด และภารกิจเมืองแบบจับเวลา ลากวางได้ และแตะของแล้วแตะที่วางแทนก็ได้',
    'จอมจังหวะ (อนุบาล 3–ป.3) เพลงจังหวะ 48 เพลง ฝึกกดปุ่มเดียว สองมือ (F และ J) สามเลน สี่นิ้ว (D F J K) กดสองปุ่มพร้อมกัน และกดค้างตามโน้ตยาว มีดนตรีประกอบสร้างสดตามจังหวะ เสียงท่วงทำนองจากโน้ตที่กดถูก และโหมดเฟเวอร์คะแนนสองเท่า',
    'ภารกิจแป้นพิมพ์ (อนุบาล 3–ป.2) ฝึกปุ่มลูกศรกับปุ่มเว้นวรรค หาตัวอักษรและตัวเลขบนแป้น ใช้นิ้วให้ถูกตามสี ปุ่มพิเศษ Enter Backspace Shift Tab Esc พิมพ์ชื่อสิ่งของจากภาพ และคีย์ลัด Ctrl กับ C V Z S A ถ้าไม่มีคีย์บอร์ดแตะปุ่มบนจอแทนได้',
    'ผจญภัยเมาส์ (อนุบาล 2–ป.1) ฝึกเลื่อนเมาส์ คลิก ดับเบิลคลิก คลิกขวา ลากวาง ลากตามทาง และใช้ลูกกลิ้งเมาส์ รวม 48 ด่าน (หน้าเกมนี้กลับมาเปิดใช้อีกครั้งที่ลิงก์ใหม่)',
    'สมรภูมิคณิต (Techno Math) เพิ่มโหมด คิดเลขเร็ว กำหนดเอง เลือกวิธีคิด (บวก ลบ คูณ หาร) ชั้น ป.1–ป.4 จำนวนข้อ 10 20 30 50 และเลือกจับเวลาหรือไม่จับเวลา เก็บสถิติที่ดีที่สุดแยกตามที่เลือก',
]
INFO = {
    'เมืองสีรุ้ง (Rainbow City)': {'desc': 'ฝึกสี รูปทรง นับเลข เรียงลำดับ และลากวาง 48 ด่านไปกับเทคโน', 'brief': 'ฝึกสี รูปทรง นับเลข เรียงลำดับ ต่อแบบ และจัดหมวด 48 ด่าน'},
    'จอมจังหวะ (Beat Hero)': {'desc': 'ฝึกกดคีย์บอร์ดตามจังหวะเพลง 48 เพลง ตั้งแต่ 1 ถึง 4 ปุ่ม', 'brief': 'ฝึกกดปุ่ม 1–4 เลน กดพร้อมกัน และกดค้างตามจังหวะเพลง 48 เพลง'},
    'ภารกิจแป้นพิมพ์ (Keyboard Quest)': {'desc': 'ฝึกหาปุ่ม ลูกศร นิ้วที่ถูก คำสั้น และคีย์ลัด 48 ด่าน', 'brief': 'ฝึกลูกศร ตัวอักษร ตัวเลข ปุ่มพิเศษ พิมพ์คำสั้น และคีย์ลัด 48 ด่าน'},
    'ผจญภัยเมาส์ (Mouse Adventure)': {'desc': 'ฝึกคลิก ดับเบิลคลิก คลิกขวา ลากวาง และลูกกลิ้ง 48 ด่าน', 'brief': 'ฝึกเลื่อนเมาส์ คลิก ลากวาง ลากตามทาง และลูกกลิ้ง 48 ด่าน'},
}
OLD_MOUSE, NEW_MOUSE = 'https://www.krukan.in.th/etc/-TechnoMouseAdventure', 'https://www.krukan.in.th/etc/techno-mouse-adventure'

p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
head = "{date:'%s', version:'%s', notes:[\n" % (DATE, VERSION)
if head in s:
    print('มีบันทึก %s แล้ว ข้าม' % DATE)
else:
    a = "      history:[\n"
    assert s.count(a) == 1, 'ไม่พบรายการบันทึกการอัปเดต'
    entry = "        " + head + ',\n'.join("          '%s'" % n for n in NOTES) + "\n        ]},\n"
    s = s.replace(a, a + entry); print('เพิ่มบันทึก %s v%s แล้ว' % (DATE, VERSION))
# คำอธิบายการ์ด (ACTIVITY_INFO): แทนค่า desc และ brief ของแต่ละเกม
import re
for title, v in INFO.items():
    m = re.search(r'"%s":\{"group":"computer","desc":"([^"]*)","audience":"([^"]*)","brief":"([^"]*)"\}' % re.escape(title), s)
    assert m, 'ไม่พบข้อมูลการ์ด ' + title
    new = '"%s":{"group":"computer","desc":"%s","audience":"%s","brief":"%s"}' % (title, v['desc'], m.group(2), v['brief'])
    if m.group(0) != new:
        s = s.replace(m.group(0), new, 1); print('แก้คำอธิบายการ์ด', title)
if OLD_MOUSE in s:
    s = s.replace(OLD_MOUSE, NEW_MOUSE); print('แก้ลิงก์ผจญภัยเมาส์ ->', NEW_MOUSE)
io.open(p, 'w', encoding='utf-8', newline='').write(s)

# หน้า /etc: เพิ่มภารกิจแป้นพิมพ์ + ผจญภัยเมาส์ (ถูกลบออกเมื่อ 25 ต.ค. ตอนล้างหน้า) กลับเข้ารายการ
q = root / 'tools' / 'etc-page' / 'quests.json'
data = json.loads(io.open(q, encoding='utf-8').read())
have = {x['p'] for x in data}
for it in ({'t': 'ภารกิจแป้นพิมพ์ (Keyboard Quest)', 'p': 'techno-keyboard-quest', 'c': 'techno', 'e': '⌨️'}, {'t': 'ผจญภัยเมาส์ (Mouse Adventure)', 'p': 'techno-mouse-adventure', 'c': 'techno', 'e': '🖱️'}):
    if it['p'] not in have:
        data.append(it); print('เพิ่มใน quests.json:', it['t'])
io.open(q, 'w', encoding='utf-8', newline='').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
