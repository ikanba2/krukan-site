"""เพิ่มเกม Techno Parts (ป.2–ป.4 ประกอบคอมพิวเตอร์) ลงหน้าแรกฉบับเต็มและหน้า Etc-Side-Quests รันซ้ำได้ (ถ้าใส่แล้วจะข้าม)
ปกอ่านจาก tools/games/covers/cover-techno-parts.webp (ตอนนี้เป็นปกชั่วคราวจากหน้าแรกของเกม เมื่อได้ภาพ AI แล้วใช้ _covers_apply.py แทน)
บันทึกการอัปเดต: วันเดียวกับรายการล่าสุดจะต่อท้ายรายการเดิม (ตามกติกา patch notes) วันใหม่จะเพิ่มรายการใหม่
ต่อด้วย python tools/build-home-lite.py เพื่อสร้างฉบับเบาที่ฝังใน Google Sites"""
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
TITLE = 'ช่างประกอบคอม (Techno Parts)'
PATH = 'techno-parts'
DESC = 'จัดกลุ่มอุปกรณ์คอมพิวเตอร์ เสียบสายให้ตรงช่อง ประกอบชิ้นส่วนเข้าเครื่อง รับงานลูกค้า และซ่อมเครื่องที่สายหลุด 4 โลก 40 ด่านที่ฝึกซ้ำจนชำนาญ'
AUD = 'ป.2–ป.4'
BRIEF = 'จัดอุปกรณ์เข้ากลุ่ม เสียบสาย ประกอบเครื่อง และซ่อมคอมของลูกค้า'
DATE, VERSION = '2026-10-24', '2.8.0'
NOTES = [
    'เพิ่มเกมใหม่สำหรับ ป.2–ป.4: Techno Parts ช่างประกอบคอม รู้จักอุปกรณ์คอมพิวเตอร์ เสียบสายให้ถูกช่อง ประกอบชิ้นส่วนเข้าเครื่อง เรียงขั้นตอนเปิดปิดเครื่อง เลือกอุปกรณ์ให้ตรงกับงานของลูกค้า และซ่อมเครื่องที่สายหลุดหรือเสียบผิดช่อง มี 4 โลก 40 ด่านและปุ่มฝึกสุ่ม',
    'หน้าตาของเกมเป็นทรงมนแบบใหม่ ใบสั่งงานเป็นตั๋ว ชิ้นส่วนเป็นหกเหลี่ยม ลากวางได้หรือแตะชิ้นส่วนแล้วแตะที่วางก็ได้ วางผิดจะบอกเหตุผลให้ทันที',
]

# 1) หน้าแรก
p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if "title:'%s'" % TITLE in s:
    print('home: already patched')
else:
    uri = 'data:image/webp;base64,' + base64.b64encode((root / 'tools' / 'games' / 'covers' / 'cover-techno-parts.webp').read_bytes()).decode('ascii')
    a = "      activities:[\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (TITLE, PATH, uri))
    a = "    const ACTIVITY_INFO={\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "      '%s':{group:'computer',desc:'%s',audience:'%s',brief:'%s'},\n" % (TITLE, DESC, AUD, BRIEF))
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
row = "      ['ช่างประกอบคอม (Techno Parts)','techno-parts','code','🖥️'],\n"
if "'techno-parts'" in t:
    print('etc: already patched')
else:
    a = "      ['นักจัดแฟ้ม (Techno Folder)','techno-folder','code','📁'],\n"
    assert t.count(a) == 1
    t = t.replace(a, a + row)
    io.open(q, 'w', encoding='utf-8', newline='').write(t)
    print('etc: ok')
