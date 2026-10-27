import base64, io, re
from pathlib import Path
root = Path(__file__).resolve().parents[2]
p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
cov = root / 'tools' / 'games' / 'covers'
def uri(name):
    return 'data:image/webp;base64,' + base64.b64encode((cov / f'cover-{name}.webp').read_bytes()).decode('ascii')

GAMES = [
    ('Code Runner · เกมสั่งการ Techno', 'code-runner', 'code-runner', 'coding', 'ต่อการ์ดคำสั่งพา Techno ผ่านด่าน เรียนลำดับ ลูป เงื่อนไข ฟังก์ชัน แล้วลงสนามวิ่งจริง', 'ม.1 วิทยาการคำนวณ'),
    ('Techno Grid · เขาวงกตสั่งโค้ด', 'techno-grid', 'techno-grid', 'coding', 'เขียนโปรแกรมบล็อกพา Techno ฝ่าเขาวงกต 16 ด่าน แล้วลงสนามไล่ล่าเก็บแกนพลังงานแบบเรียลไทม์', 'ม.1–ม.3 วิทยาการคำนวณ'),
    ('Cipher Breaker · แกะรหัสซีซาร์', 'caesar-cipher', 'cipher-breaker', 'digital', 'หมุนวงล้อถอดรหัสซีซาร์ แล้วลงสนามป้องกันพิมพ์ถอดรหัสศัตรูแบบเรียลไทม์', 'ม.2–ม.3 ความปลอดภัยข้อมูล'),
    ('Type Hero · ฝึกพิมพ์ไทย-อังกฤษ', 'type-hero', 'type-hero', 'computer', 'พิมพ์ตามคำที่ขึ้นมา กด Enter ยืนยัน สะสมคอมโบจังหวะมันส์ มีโหมดจับเวลาและไม่จับเวลา', 'ทุกระดับชั้น'),
]
if "'Code Runner · เกมสั่งการ Techno'" in s:
    print('already patched'); raise SystemExit

# 1) การ์ดกิจกรรม (ใส่ไว้หน้าสุด ติดป้าย NEW)
cards = ''
for title, cov_name, path, grp, desc, aud in GAMES:
    cards += "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (title, path, uri(cov_name))
a = "      activities:[\n"
assert s.count(a) == 1
s = s.replace(a, a + cards)

# 2) คำอธิบายและกลุ่ม
info = ''
for title, cov_name, path, grp, desc, aud in GAMES:
    info += "      '%s':{group:'%s',desc:'%s',audience:'%s'},\n" % (title, grp, desc, aud)
a = "    const ACTIVITY_INFO={\n"
assert s.count(a) == 1
s = s.replace(a, a + info)
a = "const GROUP_LABELS={computer:'ฝึกใช้คอม',"
assert s.count(a) == 1
s = s.replace(a, "const GROUP_LABELS={coding:'เขียนโค้ด',computer:'ฝึกใช้คอม',")

# 3) บันทึกการอัปเดต (วันใหม่ = เพิ่มรายการใหม่ด้านบน เก็บวันก่อนหน้าไว้)
a = "    const SITE_INFO={\n      history:[\n"
assert s.count(a) == 1
notes = [
    'เพิ่มเกมใหม่ 4 เกมในหมวด “บทเรียนอื่นๆ”: Code Runner, Techno Grid, Cipher Breaker และ Type Hero สร้างด้วย Phaser เล่นได้ทั้งคอมพิวเตอร์และมือถือ',
    'ทุกเกมมีบทสอนเล่นในด่านแรก ปุ่มเต็มจอ ช่องใส่ชื่อ (ไม่ใส่ก็ได้) และหน้าสรุปคะแนนที่แสดงชื่อผู้เล่น',
    'Type Hero ฝึกพิมพ์ไทย-อังกฤษ 10 ด่าน มีโหมดจับเวลาและไม่จับเวลา ปุ่ม Enter กะพริบเขียวเมื่อพิมพ์ถูก มีเอฟเฟกต์และเสียงทุกปุ่ม',
    'ติดป้าย NEW ให้เกมใหม่ทั้ง 4 เกมในคลังเกม',
]
entry = "        {date:'2026-10-23', version:'2.6.0', notes:[\n" + ',\n'.join("          '%s'" % n for n in notes) + "\n        ]},\n"
s = s.replace(a, a + entry)
io.open(p, 'w', encoding='utf-8').write(s)
print('ok', len(s))
