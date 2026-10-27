"""เพิ่มเกมใหม่อีก 3 เกม (Net Patrol, Packet Express, Bug Buster) ลงหน้าแรกฉบับเต็ม Home-Play-Learn-Gaming.html (รันซ้ำได้ ถ้าเคยใส่แล้วจะข้าม)
ต่อด้วย python tools/build-home-lite.py เพื่อสร้างฉบับเบาที่ฝังใน Google Sites"""
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
cov = root / 'tools' / 'games' / 'covers'


def uri(name):
    return 'data:image/webp;base64,' + base64.b64encode((cov / f'cover-{name}.webp').read_bytes()).decode('ascii')


GAMES = [
    ('Net Patrol · สายตรวจเน็ต', 'net-patrol', 'net-patrol', 'digital', 'ตรวจข้อความ ลิงก์ และป๊อปอัปทีละใบ ปัดทิ้งของหลอก ปล่อยผ่านของจริง ตัดสินถูกติดกันไรเดอร์เปลี่ยนร่าง', 'ม.1–ม.3 รู้เท่าทันออนไลน์'),
    ('Packet Express · ไปรษณีย์ข้อมูล', 'packet-express', 'packet-express', 'digital', 'สลับสวิตช์เราเตอร์ให้แพ็กเก็ตวิ่งไปถึงเซิร์ฟเวอร์ที่ถูก เรียนแพ็กเก็ต DNS ไฟร์วอลล์และเส้นทางสำรอง', 'ม.1–ม.3 เครือข่ายและอินเทอร์เน็ต'),
    ('Bug Buster · จับบั๊กโค้ด', 'bug-buster', 'bug-buster', 'coding', 'หาบรรทัดโค้ดไพทอนที่ผิด เลือกวิธีแก้ที่ถูก แล้วให้ไรเดอร์ฟันมอนสเตอร์บั๊ก 44 โจทย์ตรวจด้วยการรันจริง', 'ม.2–ม.3 วิทยาการคำนวณ'),
]
if "'Net Patrol · สายตรวจเน็ต'" in s:
    print('already patched'); raise SystemExit

cards = ''
for title, cov_name, path, grp, desc, aud in GAMES:
    cards += "        {title:'%s',url:'https://www.krukan.in.th/etc/%s',image:'%s',new:true,newBadge:true},\n" % (title, path, uri(cov_name))
a = "      activities:[\n"
assert s.count(a) == 1
s = s.replace(a, a + cards)

info = ''
for title, cov_name, path, grp, desc, aud in GAMES:
    info += "      '%s':{group:'%s',desc:'%s',audience:'%s'},\n" % (title, grp, desc, aud)
a = "    const ACTIVITY_INFO={\n"
assert s.count(a) == 1
s = s.replace(a, a + info)

a = "{date:'2026-10-23', version:'2.6.0', notes:["
assert s.count(a) == 1
s = s.replace(a, "{date:'2026-10-23', version:'2.7.0', notes:[")
tail = "          'ติดป้าย NEW ให้เกมใหม่ทั้ง 4 เกมในคลังเกม'\n        ]},"
assert s.count(tail) == 1
more = [
    'เพิ่มเกมธีมสีสดใสอีก 3 เกม: Net Patrol (ตัดสินข้อความหลอกลวงว่าอันตรายหรือปลอดภัย), Packet Express (สลับสวิตช์ส่งแพ็กเก็ตข้อมูลไปถึงเซิร์ฟเวอร์) และ Bug Buster (จับบั๊กโค้ดไพทอนแล้วฟันมอนสเตอร์)',
    'ไรเดอร์เปลี่ยนร่างได้ 4 สี (มาเจนต้า ฟ้า ทอง แดง) ตามคอมโบในเกมใหม่ทั้ง 3 เกม ทุกเกมมีบทสอน ช่องใส่ชื่อ หน้าสรุปคะแนน และปุ่มเต็มจอ',
    'แก้ปุ่มเต็มจอของเกมบน Google Sites: เกมเปิดเป็นแท็บใหม่ที่เต็มจอได้จริง หน้าเดิมหยุดเกมและปิดเสียงให้อัตโนมัติ เพลงไม่ตีกัน',
]
s = s.replace(tail, "          'ติดป้าย NEW ให้เกมใหม่ทั้ง 4 เกมในคลังเกม',\n" + ',\n'.join("          '%s'" % n for n in more) + "\n        ]},")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok', len(s))
