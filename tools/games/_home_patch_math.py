"""เพิ่มเกม Techno Math สมรภูมิคณิต (ป.1–ป.4) ลงหน้าแรกฉบับเต็ม + แถวในหน้าบทเรียนอื่นๆ (tools/etc-page/quests.json) รันซ้ำได้ (ใส่แล้วจะข้าม)
ปกอ่านจาก tools/games/covers/cover-techno-math.webp (ตอนนี้เป็นปกชั่วคราวจากหน้าแรกของเกม เมื่อได้ภาพ AI แล้วใช้ _covers_apply.py new แทน)
บันทึกการอัปเดต: วันเดียวกับรายการล่าสุดต่อท้ายรายการเดิม (2026-10-25 v2.9.0) ตามกติกา patch notes
ต่อด้วย python tools/build-home-lite.py และ python tools/build-etc-page.py"""
import base64
import io
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
TITLE = 'สมรภูมิคณิต (Techno Math)'
PATH = 'techno-math'
DESC = 'คณิตศาสตร์ ป.1–ป.4 ครบในเกมเดียว 8 โลก 33 หัวข้อ 165 ระดับ ตั้งแต่นับและเขียนตัวเลข รูปกระจาย ค่าประมาณ บวกลบแนวตั้งแนวนอน สูตรคูณ คูณ 1–2 หลัก หารสั้น หารยาว เศษส่วน ทศนิยม เงิน เวลา การวัด แผนภูมิ โจทย์ปัญหา และคิดเลขเร็ว เขียนคำตอบบนกระดาษทดทีละขั้นเหมือนทำในสมุด สู้มอนสเตอร์ไปกับไรเดอร์เทคโน มีคำถามนำและครูไรเดอร์สาธิตวิธีทำ ใช้คีย์ลัดเล่นได้ทั้งเกม'
AUD = 'ป.1–ป.4'
BRIEF = 'ตั้งเลขบนกระดาษทด หารยาว เศษส่วน ทศนิยม คิดเลขเร็ว สู้มอนสเตอร์ คีย์ลัดครบ'
DATE, VERSION = '2026-10-25', '2.9.0'
NOTES = [
    'เพิ่มเกมคณิตศาสตร์ใหม่ สมรภูมิคณิต (Techno Math) สำหรับ ป.1–ป.4: 8 โลก 33 หัวข้อ หัวข้อละ 5 ระดับ ตั้งแต่นับจำนวน อ่านเขียนตัวเลข รูปกระจาย ค่าประมาณ บวกลบในใจและตั้งบวกตั้งลบ สูตรคูณ คูณจำนวนเต็มสิบ คูณ 1–2 หลัก หารสั้น หารยาว เศษส่วน ทศนิยม เงิน เวลา การวัด แผนภูมิ โจทย์ปัญหา และคิดเลขเร็ว 60 วินาที',
    'Techno Math เขียนคำตอบบนกระดาษทดทีละช่องเหมือนทำในสมุด ตัวทดและการยืมขึ้นให้เห็น หารยาวทำ หาร คูณ ลบ ดึงลง ทีละขั้น ติดตรงไหนกด H ดูคำถามนำ หรือกด S ให้ครูไรเดอร์สาธิตแล้วลองข้อใหม่เอง ตอบถูกไรเดอร์โจมตีมอนสเตอร์ มีคีย์ลัดครบทั้งเกม (พิมพ์ตัวเลขได้แม้แป้นเป็นภาษาไทย) และเก็บเกมไว้บน GitHub แล้วฝังด้วยลิงก์ จึงไม่กินพื้นที่เว็บไซต์',
]

# 1) หน้าแรก
p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if "title:'%s'" % TITLE in s:
    print('home: already patched')
else:
    uri = 'data:image/webp;base64,' + base64.b64encode((root / 'tools' / 'games' / 'covers' / 'cover-techno-math.webp').read_bytes()).decode('ascii')
    a = "      activities:[\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (TITLE, PATH, uri))
    a = "    const ACTIVITY_INFO={\n"
    assert s.count(a) == 1
    s = s.replace(a, a + "      '%s':{group:'math',desc:'%s',audience:'%s',brief:'%s'},\n" % (TITLE, DESC, AUD, BRIEF))
    head = "{date:'%s', version:'%s', notes:[\n" % (DATE, VERSION)
    add = ',\n'.join("          '%s'" % n for n in NOTES)
    assert s.count(head) == 1, 'ไม่พบบันทึกการอัปเดตของวันนี้'
    i = s.index(head); j = s.index('\n        ]}', i)
    s = s[:j] + ',\n' + add + s[j:]
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('home: ok')

# 2) หน้าบทเรียนอื่นๆ: เพิ่มแถวต่อจาก Techno Slice (หมวดคณิตศาสตร์)
q = root / 'tools' / 'etc-page' / 'quests.json'
rows = json.loads(q.read_text(encoding='utf-8'))
if any(r['p'] == PATH for r in rows):
    print('etc: already patched')
else:
    k = next(i for i, r in enumerate(rows) if r['p'] == 'techno-slice')
    rows.insert(k + 1, {'t': TITLE, 'p': PATH, 'c': 'math', 'e': '➗'})
    q.write_bytes(json.dumps(rows, ensure_ascii=False, indent=2).encode('utf-8'))   # LF และไม่มีบรรทัดว่างท้ายไฟล์ เหมือนไฟล์เดิม
    print('etc: ok')
