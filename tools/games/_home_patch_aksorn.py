"""เพิ่มเกม Techno Aksorn (ตะลุยเมืองอักษร เกมภาษาไทย อนุบาล–ป.3) ลงหน้าแรกฉบับเต็ม รันซ้ำได้ (ถ้าใส่แล้วจะข้าม)
หมวด 'การอ่าน' (reading) ตอนนี้มีแต่เกมภาษาไทย จึงเปลี่ยนชื่อหมวดเป็น 'ภาษาไทย' (ตัวกรองบนหน้าแรกและหน้า Etc) แล้วใส่เกมใหม่ในหมวดนี้
ปกอ่านจาก tools/games/covers/cover-techno-aksorn.webp (ตอนนี้เป็นปกชั่วคราวจากหน้าแรกของเกมจริง เมื่อได้ภาพ AI แล้วใช้ _covers_apply.py new)
บันทึกการอัปเดต: วันเดียวกับรายการล่าสุดจะต่อท้ายรายการเดิม วันใหม่จะเพิ่มรายการใหม่ด้านบน
หน้า Etc-Side-Quests สร้างโดย tools/build-etc-page.py (เพิ่มแถวใน tools/etc-page/quests.json) · ต่อด้วย python tools/build-home-lite.py"""
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
TITLE = 'ตะลุยเมืองอักษร (Techno Aksorn)'
PATH = 'techno-aksorn'
DESC = 'เรียนพยัญชนะ ก–ฮ และสระ ฟังเสียงอ่าน เขียนตามรอยด้วยนิ้วหรือเมาส์ แล้วเล่นมินิเกม ฟังแล้วแตะ จับคู่ภาพ ยิงลูกโป่ง ตกปลาสระ เปิดป้าย แยกหมู่อักษร ประสมคำ เก็บดาวและเหรียญไปซื้อหมวก เสื้อ สัตว์เลี้ยงแต่งตัวละคร มี 4 ระดับ อนุบาลถึง ป.3'
AUD = 'อนุบาล–ป.3'
BRIEF = 'เขียนตามรอย ฟังเสียงไทย มินิเกม 9 แบบ ร้านค้าแต่งตัวละคร บันทึกในเครื่อง'
DATE, VERSION = '2026-10-25', '2.9.0'
NOTES = [
    'เพิ่มเกมภาษาไทยใหม่ ตะลุยเมืองอักษร (Techno Aksorn) สำหรับอนุบาลถึง ป.3 เรียนพยัญชนะ 44 ตัว สระ 32 รูป พร้อมเสียงอ่านภาษาไทยของเบราว์เซอร์ และ ‘เขียนตามรอย’ ทุกตัวอักษร (พยัญชนะ สระ วรรณยุกต์ เลขไทย) ลากตามเส้นนำที่เริ่มจากหัวตัวอักษร ระดับอนุบาลมีลูกศรนำ ระดับ ป.3 เหลือแค่จุดเริ่ม',
    'ในแต่ละบทมีเรียนรู้ เขียนตามรอย และมินิเกม ฟังแล้วแตะ จับคู่ภาพ ยิงลูกโป่ง ตกปลาสระ เปิดป้าย แยกหมู่อักษรและสระสั้นยาว ประสมคำ เก็บดาวและเหรียญไปซื้อหมวก สีเสื้อ ทรงผม สัตว์เลี้ยงที่ร้านค้า เขียนสำเร็จได้สติกเกอร์ใส่สมุด มีบ้านคัดลายมือฝึกเขียนซ้ำได้ไม่จำกัด ความคืบหน้าบันทึกไว้ในเครื่องผู้เล่น เล่นต่อได้ทุกครั้ง',
    'เปลี่ยนชื่อหมวด ‘การอ่าน’ เป็น ‘ภาษาไทย’ ในตัวกรองกิจกรรม',
]

p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if "title:'%s'" % TITLE in s:
    print('home: already patched')
else:
    uri = 'data:image/webp;base64,' + base64.b64encode((root / 'tools' / 'games' / 'covers' / 'cover-techno-aksorn.webp').read_bytes()).decode('ascii')
    a = "      activities:[\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (TITLE, PATH, uri))
    a = "    const ACTIVITY_INFO={\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "      '%s':{group:'reading',desc:'%s',audience:'%s',brief:'%s'},\n" % (TITLE, DESC, AUD, BRIEF))
    a = "reading:'การอ่าน',"
    assert s.count(a) == 1
    s = s.replace(a, "reading:'ภาษาไทย',")
    a = 'data-activity-filter="reading" aria-controls="poster-grid" aria-pressed="false">การอ่าน</button>'
    assert s.count(a) == 1
    s = s.replace(a, 'data-activity-filter="reading" aria-controls="poster-grid" aria-pressed="false">ภาษาไทย</button>')
    head = "{date:'%s', version:'%s', notes:[\n" % (DATE, VERSION)
    add = ',\n'.join("          '%s'" % n for n in NOTES)
    if head in s:
        i = s.index(head); j = s.index('\n        ]}', i)
        s = s[:j] + ',\n' + add + s[j:]
    else:
        a = "    const SITE_INFO={\n      history:[\n"
        assert s.count(a) == 1
        s = s.replace(a, a + "        " + head + add + "\n        ]},\n")
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('home: ok')

# หน้า Etc: เปลี่ยนชื่อหมวด reading เป็น ภาษาไทย ในแม่แบบ (ทั้งแม่แบบที่สร้างแล้วและต้นทาง) แล้วเพิ่มแถวเกมใน quests.json
import json
for f in ('template.html', 'template.js.txt'):
    q = root / 'tools' / 'etc-page' / f
    t = io.open(q, encoding='utf-8').read()
    a = "reading: {name:'การอ่าน',       en:'READING',   emoji:'📖', color:'#f472b6'}"
    if a in t:
        io.open(q, 'w', encoding='utf-8', newline='').write(t.replace(a, "reading: {name:'ภาษาไทย',       en:'THAI',      emoji:'📖', color:'#f472b6'}")); print(f, 'label ok')
qj = root / 'tools' / 'etc-page' / 'quests.json'
rows = json.load(io.open(qj, encoding='utf-8'))
if not any(r['p'] == PATH for r in rows):
    rows.append({'t': TITLE, 'p': PATH, 'c': 'thai', 'e': '🔤'})
    io.open(qj, 'w', encoding='utf-8', newline='').write(json.dumps(rows, ensure_ascii=False, indent=1)); print('quests: added')
