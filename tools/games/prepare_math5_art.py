"""เตรียมภาพของ 5 เกมคณิต (บันไดงู เรียงลำดับ แนวตั้ง โรมัน นักล่าพลังบวก) จากภาพเดิมที่ดึงจากหน้า Sites (tools/math5/assets)
ย่อเป็น webp รุ่นเบาไว้ที่ tools/games/math5-art/ ไม่เจนภาพใหม่"""
import os, sys
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'math5', 'assets'); OUT = os.path.join(HERE, 'math5-art'); os.makedirs(OUT, exist_ok=True)
JOBS = {   # ชื่อใหม่: (ไฟล์เดิม, กว้างสูงสุด, คุณภาพ)
    'bg_forest': ('funmath_00.webp', 1280, 72), 'pose_cmdr': ('funmath_01.webp', 420, 85),
    'bg_islands': ('marioplus_00.webp', 1280, 72), 'pose_rocket': ('marioplus_01.webp', 420, 85),
    'bg_forum': ('roman_00.webp', 1280, 70), 'bg_square': ('roman_01.webp', 1280, 70), 'pose_iv': ('roman_02.webp', 420, 85), 'bg_arena': ('roman_03.webp', 1280, 70),
    'bg_numroad': ('sortnumber_00.webp', 1280, 72),
}
tot = 0
for k, (f, mw, q) in JOBS.items():
    im = Image.open(os.path.join(SRC, f)); im = im.convert('RGBA' if k.startswith('pose') else 'RGB')
    if k.startswith('bg_'): im = im.crop((6, 0, im.width - 6, im.height))   # ภาพเดิมมีขอบซ้ายหรือขวาเป็นแถบขาวบาง ตัดทิ้ง (ไม่งั้นตอนเลื่อนต่อกันเห็นเป็นเส้นขาว)
    if im.width > mw: im = im.resize((mw, round(im.height * mw / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, k + '.webp'); im.save(p, 'WEBP', quality=q, method=6); tot += os.path.getsize(p); print(k, im.size, os.path.getsize(p) // 1024, 'KB')
print('รวม', tot // 1024, 'KB')
# ท่าไรเดอร์ประจำเกม (ใช้เป็น title_pose ของหน้าแรก): ตัดขอบโปร่งใสให้ชิดตัว สูงไม่เกิน 600
TP = os.path.join(HERE, 'title-poses')
for name, f in {'roman': 'roman_02.webp', 'colmath': 'funmath_01.webp', 'plusrun': 'marioplus_01.webp'}.items():
    im = Image.open(os.path.join(SRC, f)).convert('RGBA'); bb = im.getchannel('A').point(lambda v: 255 if v > 16 else 0).getbbox(); im = im.crop(bb)
    if im.height > 600: im = im.resize((round(im.width * 600 / im.height), 600), Image.LANCZOS)
    p = os.path.join(TP, name + '.webp'); im.save(p, 'WEBP', quality=88, method=6); print('title-pose', name, im.size, os.path.getsize(p) // 1024, 'KB')
