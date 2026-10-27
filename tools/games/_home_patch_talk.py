"""เพิ่มเกม Techno Talk (ประโยคอังกฤษประจำวัน อนุบาล–ป.3) ลงหน้าแรกฉบับเต็ม เพิ่มหมวดใหม่ 'ภาษาอังกฤษ' (english) ให้ตัวกรองกิจกรรม รันซ้ำได้ (ถ้าใส่แล้วจะข้าม)
ปกอ่านจาก tools/games/covers/cover-techno-talk.webp (ตอนนี้เป็นปกชั่วคราวจากภาพในเกมจริง: ไรเดอร์เทคโนสองท่า + เด็ก 4 คน เมื่อได้ภาพ AI แล้วใช้ _covers_apply.py แทน)
บันทึกการอัปเดต: วันเดียวกับรายการล่าสุดจะต่อท้ายรายการเดิม (ตามกติกา patch notes) วันใหม่จะเพิ่มรายการใหม่ด้านบน
หน้า Etc-Side-Quests (บทเรียนอื่นๆ) สร้างจากข้อมูลเกมโดย tools/build-etc-page.py แยกต่างหาก
ต่อด้วย python tools/build-home-lite.py เพื่อสร้างฉบับเบาที่ฝังใน Google Sites"""
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
TITLE = 'ประโยคอังกฤษ (Techno Talk)'
PATH = 'techno-talk'
DESC = 'ฝึกประโยคอังกฤษประจำวัน I you he she it we they ตั้งแต่อนุบาลถึง ป.3 เรียนคำศัพท์พร้อมเสียงอ่านก่อน แล้วเล่น 5 แบบ จัดกลุ่ม โยงเส้น เปิดป้าย ลากวาง ถามตอบ มี 3 ระดับ 15 หน่วย'
AUD = 'อนุบาล–ป.3'
BRIEF = 'ภาพวาดเวกเตอร์ เสียงอ่าน 3 ระดับ 15 หน่วย ไรเดอร์เทคโนเป็นโค้ชบอกโจทย์'
DATE, VERSION = '2026-10-24', '2.8.0'
NOTES = [
    'เพิ่มเกมภาษาอังกฤษใหม่ Techno Talk ประโยคอังกฤษประจำวัน สำหรับอนุบาลถึง ป.3 ฝึกสรรพนาม I you he she it we they และประโยค am is are · like likes · have has · can · กิจวัตร · ถามตอบ Do Does Is Are Where What เลือกได้ 3 ระดับ (Starter Explorer Master) รวม 15 หน่วย',
    'ทุกหน่วยเริ่มจากเรียนคำศัพท์และประโยคพร้อมเสียงอ่านภาษาอังกฤษ แล้วเล่นกิจกรรม 5 แบบ ได้แก่ จัดกลุ่ม โยงเส้น เปิดป้าย ลากวาง ถามตอบ ภาพประกอบเป็นภาพวาดเวกเตอร์ทั้งหมด มีไรเดอร์เทคโนครึ่งตัวหลายท่าคอยบอกโจทย์ ตอบผิดมีเหตุผลบอกเสมอ ดาวและความคืบหน้าบันทึกไว้ในเครื่องผู้เล่น เล่นต่อได้ทุกครั้ง',
]

p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if "title:'%s'" % TITLE in s:
    print('home: already patched')
else:
    uri = 'data:image/webp;base64,' + base64.b64encode((root / 'tools' / 'games' / 'covers' / 'cover-techno-talk.webp').read_bytes()).decode('ascii')
    a = "      activities:[\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (TITLE, PATH, uri))
    a = "    const ACTIVITY_INFO={\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "      '%s':{group:'english',desc:'%s',audience:'%s',brief:'%s'},\n" % (TITLE, DESC, AUD, BRIEF))
    # หมวดใหม่: ป้ายหมวด + ปุ่มตัวกรอง (ต่อท้ายหมวดคณิตศาสตร์)
    a = "math:'คณิตศาสตร์',"
    assert s.count(a) == 1
    s = s.replace(a, a + "english:'ภาษาอังกฤษ',")
    a = '<button type="button" class="filter" data-activity-filter="math" aria-controls="poster-grid" aria-pressed="false">คณิตศาสตร์</button>'
    assert s.count(a) == 1
    s = s.replace(a, a + '<button type="button" class="filter" data-activity-filter="english" aria-controls="poster-grid" aria-pressed="false">ภาษาอังกฤษ</button>')
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

# ย้ายเกมอ่าน/คำศัพท์ภาษาอังกฤษเดิม 3 เกมจากหมวด 'การอ่าน' ไปหมวด 'ภาษาอังกฤษ' (ให้ครบกลุ่มเดียวกับ Techno Talk)
s = io.open(p, encoding='utf-8').read()
moved = 0
for t in ('ฝึกอ่านอังกฤษ 2 (Reading 2)', 'ครอบครัวคำ (Word Family)', 'ผจญภัยการอ่าน (Reading Adventure)'):
    a = "'%s':{group:'reading'," % t
    if a in s:
        s = s.replace(a, "'%s':{group:'english'," % t); moved += 1
if moved:
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('english group: moved', moved)
