"""ตั้งชื่อเกมบนหน้า home และหน้า Etc ให้เป็นรูปแบบ 'ชื่อไทย (English Name)' ชื่อไทยสั้น สื่อความหมาย ไม่ทับศัพท์ (ยกเว้นคำที่ไม่มีคำไทยที่คนใช้จริง เช่น เมาส์ เน็ต)
จับคู่เกมด้วยลิงก์ /etc/<slug> (ไม่สนตัวพิมพ์เล็กใหญ่) รันซ้ำได้: ถ้าชื่อเป็นรูปแบบใหม่อยู่แล้วจะข้าม
ต่อด้วย python tools/build-home-lite.py  (ฉบับเบาดึงชื่อจากหน้า home หลัก)"""
import io
import json
import re
import subprocess
import tempfile
import os
from pathlib import Path

root = Path(__file__).resolve().parents[2]
NAMES = {   # slug : ชื่อใหม่
    'techno-folder': 'นักจัดแฟ้ม (Techno Folder)',
    'techno-steps': 'ก้าวคำสั่ง (Techno Steps)',
    'net-patrol': 'สายตรวจเน็ต (Net Patrol)',
    'packet-express': 'ไปรษณีย์ข้อมูล (Packet Express)',
    'bug-buster': 'จับผิดโปรแกรม (Bug Buster)',
    'code-runner': 'วิ่งตามคำสั่ง (Code Runner)',
    'techno-grid': 'เขาวงกตคำสั่ง (Techno Grid)',
    'cipher-breaker': 'แกะรหัสซีซาร์ (Cipher Breaker)',
    'type-hero': 'จอมพิมพ์ (Type Hero)',
    'math2': 'สงครามตัวเลข (Number War)',
    'technorun': 'วิ่งเก็บคำตอบ (TechnoRun)',
    'techno-story': 'ผจญภัยข้ามมิติ (Dimension Quest)',
    'rainbow-city-techno': 'เมืองสีรุ้ง (Rainbow City)',
    'beat-hero': 'จอมจังหวะ (Beat Hero)',
    'techno-keyboard-quest': 'ภารกิจแป้นพิมพ์ (Keyboard Quest)',
    '-technomouseadventure': 'ผจญภัยเมาส์ (Mouse Adventure)',
    'hanuman': 'หนุมานพิชิตเส้นทาง (Hanuman Path Quest)',
    'digital-citizen-mission': 'นักสืบโลกเน็ต (Cyber Detective)',
    'korkai': 'ฝึกอ่าน ก.ไก่ (Thai Alphabet)',
    'reading2': 'ฝึกอ่านอังกฤษ 2 (Reading 2)',
    'secreat': 'ผู้พิทักษ์โลกเน็ต (CyberGuardian)',
    'vvv': 'ติวสอบระดับชาติ ป.6 (O-NET Tutor P.6)',
    'plussnake': 'บันไดงูบวกลบเลข (Snakes and Ladders Math)',
    'mathmix': 'สังเวียนคิดเลข (Math Arena)',
    'demox': 'ลบเลขสู้อสูร (Monster Subtraction)',
    'sortnumber': 'เรียงลำดับตัวเลข (Number Order)',
    'readthai': 'ฝึกอ่านภาษาไทย (Thai Reading)',
    'mathplus': 'สนุกกับการบวกเลข (Fun Addition)',
    'marioplus': 'สมบัติพลังบวก (Plus Power Treasure)',
    'wordfamily': 'ครอบครัวคำ (Word Family)',
    'funmath': 'คิดเลขแสนสนุก (Fun Math)',
    'reading-adventure': 'ผจญภัยการอ่าน (Reading Adventure)',
    'roman': 'เลขโรมัน (Roman Numerals)',
    'base-number': 'เลขฐาน 2 (Binary Numbers)',
}
NEW = set(NAMES.values())
slug = lambda url: url.rstrip('/').split('/')[-1].lower()

hp = root / 'Home-Play-Learn-Gaming.html'
s = io.open(hp, encoding='utf-8').read()
a = s.index('const SITE_BASE='); b = s.index('const $=(s,r=document)')
runner = s[a:b] + "\nprocess.stdout.write(JSON.stringify(DATA.activities.map(x=>[x.title,x.url])));"
tf = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8'); tf.write(runner); tf.close()
res = subprocess.run(['node', tf.name], capture_output=True, text=True, encoding='utf-8'); os.unlink(tf.name)
acts = json.loads(res.stdout)
changed = 0
for old, url in acts:
    new = NAMES.get(slug(url))
    if not new:
        print('ไม่มีชื่อใหม่ให้', url, old); continue
    if old == new: continue
    n = 0
    for q in ("'", '"'):
        k = q + old + q
        if k in s: n += s.count(k); s = s.replace(k, q + new + q)
    assert n >= 2, ('หาชื่อไม่เจอ/ไม่ครบ', old, n)      # ต้องเจออย่างน้อย 2 ที่ (รายการกิจกรรม + ACTIVITY_INFO)
    changed += 1
io.open(hp, 'w', encoding='utf-8', newline='').write(s)

# หน้า Etc: เปลี่ยนป้ายของรายการที่ตรงกับเกมในหน้า home (จับด้วย slug)
ep = root / 'Etc-Side-Quests.html'
t = io.open(ep, encoding='utf-8').read(); e = 0
def fix(m):
    global e
    new = NAMES.get(m.group(2).lower())
    if not new or m.group(1) == new: return m.group(0)
    e += 1; return "['%s','%s'" % (new, m.group(2))
t = re.sub(r"\['([^'\]]+)','([^'\]]+)'", fix, t)
io.open(ep, 'w', encoding='utf-8', newline='').write(t)

# สคริปต์ผนวกเกมแบบครั้งเดียว: ให้ตรวจ 'ใส่แล้ว' ด้วยชื่อใหม่
for f, old, new in [('_home_patch_steps.py', "TITLE = 'Techno Steps · ก้าวแรกนักเขียนโปรแกรม'", "TITLE = 'ก้าวคำสั่ง (Techno Steps)'"), ('_home_patch_folder.py', "TITLE = 'Techno Folder · จัดโฟลเดอร์กับเทคโน'", "TITLE = 'นักจัดแฟ้ม (Techno Folder)'")]:
    p = root / 'tools' / 'games' / f; x = io.open(p, encoding='utf-8').read()
    if old in x: io.open(p, 'w', encoding='utf-8', newline='').write(x.replace(old, new))
print('หน้า home เปลี่ยน', changed, 'เกม · หน้า Etc เปลี่ยน', e, 'รายการ')
