"""เพิ่มเกม Techno Steps (ป.1–ป.6 วิทยาการคำนวณ) ลงหน้าแรกฉบับเต็มและหน้า Etc-Side-Quests รันซ้ำได้ (ถ้าใส่แล้วจะข้าม)
ปกอ่านจาก tools/games/covers/cover-techno-steps.webp (ตอนนี้เป็นปกชั่วคราวจากหน้าแรกของเกม เมื่อได้ภาพ AI แล้วให้ใช้ _covers_apply.py แทนภาพการ์ด)
ต่อด้วย python tools/build-home-lite.py เพื่อสร้างฉบับเบาที่ฝังใน Google Sites"""
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
TITLE = 'ก้าวคำสั่ง (Techno Steps)'
PATH = 'techno-steps'
DESC = 'เรียงการ์ดคำสั่งพาไรเดอร์ไปถึงธง ฟันมอนสเตอร์ เก็บดาว 6 โลก 60 ด่านที่ฝึกซ้ำจนชำนาญ ตั้งแต่ลำดับคำสั่ง วนซ้ำ เงื่อนไข หาบั๊ก ไปจนถึงโปรแกรมย่อย'
AUD = 'ป.1–ป.6 วิทยาการคำนวณ'
DATE, VERSION = '2026-10-24', '2.8.0'
NOTES = [
    'เพิ่มเกมใหม่สำหรับนักเรียนประถม: Techno Steps เรียงการ์ดคำสั่งพาไรเดอร์ไปถึงธง มี 6 โลกตามชั้น ป.1 ถึง ป.6 โลกละ 10 ด่านที่คล้ายกันเพื่อฝึกซ้ำจนชำนาญ',
    'ในเกมมีมอนสเตอร์ 15 แบบ ไรเดอร์ 4 อาวุธ มีโหมดทีละคำสั่ง ปุ่มปรับความเร็ว คำใบ้ และปุ่มฝึกสุ่มที่สร้างด่านใหม่ในรูปแบบเดิมได้ไม่รู้จบ',
    'ปรับเวลาในเกมทุกเกมให้นานขึ้น และทำเส้นทางของ Packet Express ให้ชัดเจนขึ้น',
]

# 1) หน้าแรก
p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if "title:'%s'" % TITLE in s:
    print('home: already patched')
else:
    uri = 'data:image/webp;base64,' + base64.b64encode((root / 'tools' / 'games' / 'covers' / 'cover-techno-steps.webp').read_bytes()).decode('ascii')
    a = "      activities:[\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (TITLE, PATH, uri))
    a = "    const ACTIVITY_INFO={\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "      '%s':{group:'coding',desc:'%s',audience:'%s'},\n" % (TITLE, DESC, AUD))
    a = "    const SITE_INFO={\n      history:[\n"
    assert s.count(a) == 1
    entry = "        {date:'%s', version:'%s', notes:[\n" % (DATE, VERSION) + ',\n'.join("          '%s'" % n for n in NOTES) + "\n        ]},\n"
    s = s.replace(a, a + entry)
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('home: ok')

# 2) หน้าบทเรียนอื่นๆ (Etc-Side-Quests)
q = root / 'Etc-Side-Quests.html'
t = io.open(q, encoding='utf-8').read()
row = "      ['Techno Steps · ก้าวแรกนักเขียนโปรแกรม','techno-steps','code','👣'],\n"
if "'techno-steps'" in t:
    print('etc: already patched')
else:
    a = "      ['Techno Grid · เขาวงกตสั่งโค้ด','techno-grid','code','🧩'],\n"
    assert t.count(a) == 1
    t = t.replace(a, a + row)
    io.open(q, 'w', encoding='utf-8', newline='').write(t)
    print('etc: ok')
