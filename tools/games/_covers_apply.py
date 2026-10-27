"""ใส่ปกเกมชุดใหม่ (ภาพ AI 16:9 ใน tools/games/covers/generated-2026-10-23/) ลงหน้าแรกฉบับเต็ม Home-Play-Learn-Gaming.html
ย่อเป็น 640x360 webp เก็บเป็น tools/games/covers/cover-<ชื่อ>.webp (ไฟล์เดิม 640x400 สำรองไว้ใน covers/_old-640x400/) แล้วแทนภาพของการ์ดเกมแต่ละใบ (หาจาก url) รันซ้ำได้
ต่อด้วย python tools/build-home-lite.py เพื่อสร้างฉบับเบาที่ฝังใน Google Sites"""
import base64
import io
import re
import shutil
import sys
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[2]
cov = root / 'tools' / 'games' / 'covers'
src = cov / 'generated-2026-10-23'
old = cov / '_old-640x400'
W, H, Q = 512, 288, 74   # ย่อจาก 640x360 q78 (25 ต.ค. 2569) เพราะ Google Sites ทั้งไซต์ชนเพดาน 40 ล้านอักขระ การ์ดแสดงกว้างราว 270px

# (ไฟล์ต้นฉบับ, ชื่อไฟล์ปกที่เก็บ, เส้นทางของการ์ดบนเว็บ)
GAMES = [
    ('net-patrol', 'net-patrol', 'net-patrol'),
    ('packet-express', 'packet-express', 'packet-express'),
    ('bug-buster', 'bug-buster', 'bug-buster'),
    ('code-runner', 'code-runner', 'code-runner'),
    ('techno-grid', 'techno-grid', 'techno-grid'),
    ('cipher-breaker', 'caesar-cipher', 'cipher-breaker'),
    ('type-hero', 'type-hero', 'type-hero'),
]

# โหมดชุดใหม่: python tools/games/_covers_apply.py new  ใช้ภาพจาก covers/generated-2026-10-24/<เกม>-cover.png (5 เกมที่ปกเดิมเป็นปกชั่วคราว) ข้ามเกมที่ยังไม่มีไฟล์
if len(sys.argv) > 1 and sys.argv[1] == 'new':
    # ใช้ได้ทั้งแบบเดิม (python _covers_apply.py new) และแบบระบุโฟลเดอร์วันที่กับเกม เช่น  python _covers_apply.py new 2026-10-25 techno-aksorn
    src = cov / ('generated-' + sys.argv[2] if len(sys.argv) > 2 else 'generated-2026-10-24')
    names = sys.argv[3:] or ['techno-steps', 'techno-folder', 'techno-parts', 'techno-slice', 'techno-talk', 'techno-aksorn']
    COVNAME = {'cipher-breaker': 'caesar-cipher'}      # ชื่อไฟล์ปกที่เก็บของเกมนี้ต่างจากชื่อหน้าเว็บ
    GAMES = [(g, COVNAME.get(g, g), g) for g in names if (src / f'{g}-cover.png').exists()]
    print('ชุดใหม่ พบภาพ', [g[0] for g in GAMES])

p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
old.mkdir(exist_ok=True)
for srcname, covname, path in GAMES:
    im = Image.open(src / f'{srcname}-cover.png').convert('RGB')
    if abs(im.width / im.height - 16 / 9) > 0.02:                      # กันกรณีได้ภาพสัดส่วนอื่น: ตัดกลางให้เป็น 16:9
        h = round(im.width * 9 / 16); y = (im.height - h) // 2; im = im.crop((0, y, im.width, y + h))
    im = im.resize((W, H), Image.LANCZOS)
    out = cov / f'cover-{covname}.webp'
    if out.exists() and not (old / out.name).exists():
        shutil.copy2(out, old / out.name)
    im.save(out, 'WEBP', quality=Q, method=6)
    uri = 'data:image/webp;base64,' + base64.b64encode(out.read_bytes()).decode('ascii')
    pat = re.compile(r"(url:'https://www\.krukan\.in\.th/etc/%s',image:')data:image/webp;base64,[A-Za-z0-9+/=]+(')" % re.escape(path))
    if len(pat.findall(s)) != 1:
        sys.exit(f'หาการ์ด {path} ไม่เจอหรือเจอซ้ำในหน้าแรก')
    s = pat.sub(lambda m: m.group(1) + uri + m.group(2), s)
    print(f'{covname}: {out.stat().st_size // 1024} KB')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok', len(s))
