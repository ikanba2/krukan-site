"""เพิ่มเกม Techno Folder (ป.2–ป.3 จัดการไฟล์ในโฟลเดอร์) ลงหน้าแรกฉบับเต็มและหน้า Etc-Side-Quests รันซ้ำได้ (ถ้าใส่แล้วจะข้าม)
ปกอ่านจาก tools/games/covers/cover-techno-folder.webp (ตอนนี้เป็นภาพจับจากตัวเกม เมื่อได้ภาพ AI แล้วใช้ _covers_apply.py แทน)
บันทึกการอัปเดต: วันเดียวกับรายการล่าสุดจะต่อท้ายรายการเดิม (ตามกติกา patch notes) วันใหม่จะเพิ่มรายการใหม่ด้านบน
ต่อด้วย python tools/build-home-lite.py เพื่อสร้างฉบับเบาที่ฝังใน Google Sites"""
import base64
import io
import re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
TITLE = 'นักจัดแฟ้ม (Techno Folder)'
PATH = 'techno-folder'
DESC = 'จัดไฟล์ในหน้าต่างโฟลเดอร์แบบ Windows ลากวาง สร้างและตั้งชื่อโฟลเดอร์ ย้าย คัดลอก ลบ กู้คืน และเปิดโฟลเดอร์ซ้อนกัน 4 โลก 40 ด่านที่ฝึกซ้ำจนชำนาญ'
AUD = 'ป.2–ป.3 ฝึกใช้คอม'
DATE, VERSION = '2026-10-24', '2.8.0'
NOTES = [
    'เพิ่มเกมใหม่สำหรับ ป.2–ป.3: Techno Folder จัดการไฟล์ในโฟลเดอร์ ใช้หน้าต่างโฟลเดอร์จำลองแบบ Windows ไม่แตะไฟล์จริงในเครื่อง มี 4 โลก 40 ด่านที่คล้ายกันเพื่อฝึกซ้ำ',
    'ฝึกลากไฟล์เข้าโฟลเดอร์ตามหมวด สร้างและตั้งชื่อโฟลเดอร์ ตัด คัดลอก วาง ลบ กู้คืนจากถังรีไซเคิล และโฟลเดอร์ซ้อนกันหลายชั้น มีคำใบ้ เสียงอ่านโจทย์ และปุ่มฝึกสุ่ม',
]

# 1) หน้าแรก
p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if "title:'%s'" % TITLE in s:
    print('home: already patched')
else:
    uri = 'data:image/webp;base64,' + base64.b64encode((root / 'tools' / 'games' / 'covers' / 'cover-techno-folder.webp').read_bytes()).decode('ascii')
    a = "      activities:[\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (TITLE, PATH, uri))
    a = "    const ACTIVITY_INFO={\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "      '%s':{group:'computer',desc:'%s',audience:'%s'},\n" % (TITLE, DESC, AUD))
    head = "{date:'%s', version:'%s', notes:[\n" % (DATE, VERSION)
    add = ',\n'.join("          '%s'" % n for n in NOTES)
    if head in s:   # วันเดียวกัน: ต่อท้ายรายการเดิม
        i = s.index(head); j = s.index('\n        ]}', i)
        s = s[:j] + ',\n' + add + s[j:]
    else:           # วันใหม่: เพิ่มรายการใหม่ด้านบน
        a = "    const SITE_INFO={\n      history:[\n"
        assert s.count(a) == 1
        s = s.replace(a, a + "        " + head + add + "\n        ]},\n")
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('home: ok')

# 2) หน้าบทเรียนอื่นๆ (Etc-Side-Quests)
q = root / 'Etc-Side-Quests.html'
t = io.open(q, encoding='utf-8').read()
row = "      ['Techno Folder · จัดโฟลเดอร์กับเทคโน','techno-folder','code','📁'],\n"
if "'techno-folder'" in t:
    print('etc: already patched')
else:
    a = "      ['Techno Steps · ก้าวแรกนักเขียนโปรแกรม','techno-steps','code','👣'],\n"
    assert t.count(a) == 1
    t = t.replace(a, a + row)
    io.open(q, 'w', encoding='utf-8', newline='').write(t)
    print('etc: ok')
