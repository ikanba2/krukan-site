"""เพิ่มเกม Techno Slice (ป.4 เศษส่วน) ลงหน้าแรกฉบับเต็มและหน้า Etc-Side-Quests รันซ้ำได้ (ถ้าใส่แล้วจะข้าม)
ปกอ่านจาก tools/games/covers/cover-techno-slice.webp (ตอนนี้เป็นปกชั่วคราวจากหน้าแรกของเกม เมื่อได้ภาพ AI แล้วใช้ _covers_apply.py แทน)
บันทึกการอัปเดต: วันเดียวกับรายการล่าสุดจะต่อท้ายรายการเดิม (ตามกติกา patch notes) วันใหม่จะเพิ่มรายการใหม่
ต่อด้วย python tools/build-home-lite.py เพื่อสร้างฉบับเบาที่ฝังใน Google Sites"""
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
TITLE = 'ช่างแบ่งพิซซ่า (Techno Slice)'
PATH = 'techno-slice'
DESC = 'ฝึกเศษส่วน ป.4 กับร้านพิซซ่า ตัดพิซซ่าตามออเดอร์ จับคู่เศษส่วนกับภาพ เรียงลำดับ วางบนเส้นจำนวน แปลงเศษเกินเป็นจำนวนคละ และบวกลบเศษส่วน 4 โลก 40 ด่านที่ฝึกซ้ำจนชำนาญ'
AUD = 'ป.4'
BRIEF = 'ตัดพิซซ่าตามออเดอร์ จับคู่ เรียงลำดับ แปลงเศษเกิน และบวกลบเศษส่วน'
DATE, VERSION = '2026-10-24', '2.8.0'
NOTES = [
    'เพิ่มเกมคณิตศาสตร์ใหม่สำหรับ ป.4: Techno Slice ช่างแบ่งพิซซ่า ฝึกเศษส่วนกับร้านพิซซ่า ตัดพิซซ่าตามที่ลูกค้าสั่ง จับคู่เศษส่วนกับภาพ เรียงลำดับ วางบนเส้นจำนวน จับคู่เศษส่วนที่ค่าเท่ากัน ใส่ชิ้นลงกล่องแล้วแปลงเศษเกินเป็นจำนวนคละ และบวกลบเศษส่วนที่ตัวส่วนเท่ากัน มี 4 โลก 40 ด่านและปุ่มฝึกสุ่มที่สร้างโจทย์ใหม่ไม่ซ้ำ',
    'ธีมเกมเป็นโทนร้านพิซซ่าทรงมน วางผิดจะบอกเหตุผลทางคณิตศาสตร์ทันที ลากวางหรือแตะแล้วแตะที่วางก็ได้ และมีอันดับดาวสะสมในหน้าสรุปผล',
]

# 1) หน้าแรก
p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if "title:'%s'" % TITLE in s:
    print('home: already patched')
else:
    uri = 'data:image/webp;base64,' + base64.b64encode((root / 'tools' / 'games' / 'covers' / 'cover-techno-slice.webp').read_bytes()).decode('ascii')
    a = "      activities:[\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (TITLE, PATH, uri))
    a = "    const ACTIVITY_INFO={\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "      '%s':{group:'math',desc:'%s',audience:'%s',brief:'%s'},\n" % (TITLE, DESC, AUD, BRIEF))
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

# 2) หน้าบทเรียนอื่นๆ (Etc-Side-Quests): ต่อท้ายแถวเกมเศษส่วนที่เท่ากัน (หมวดคณิตศาสตร์)
q = root / 'Etc-Side-Quests.html'
t = io.open(q, encoding='utf-8').read()
row = "      ['ช่างแบ่งพิซซ่า (Techno Slice)','techno-slice','math','\U0001F355'],\n"
if "'techno-slice'" in t:
    print('etc: already patched')
else:
    a = "      ['เกมเศษส่วนที่เท่ากัน','sankefaction','math','\U0001F355'],\n"
    assert t.count(a) == 1, 'ไม่พบแถวเกมเศษส่วนที่เท่ากัน'
    t = t.replace(a, a + row)
    io.open(q, 'w', encoding='utf-8', newline='').write(t)
    print('etc: ok')
