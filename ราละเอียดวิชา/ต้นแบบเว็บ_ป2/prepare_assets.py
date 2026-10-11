"""เตรียมภาพ ป.2 จากไดรฟ์/แผน -> assets/*.webp (ย่อขนาด) + assets/manifest.json
รันครั้งเดียวเมื่อภาพเปลี่ยน: python prepare_assets.py"""
from pathlib import Path
from PIL import Image
import json, sys

sys.stdout.reconfigure(encoding='utf-8')
here = Path(__file__).resolve().parent
plan = here.parent / 'แผนพัฒนาเว็บ_ป2_9บท_ส่งต่อAI'
drive = Path(r'G:/My Drive/krukan/Pic/Techno asset')
out = here / 'assets'
out.mkdir(exist_ok=True)
manifest = {}


def save(img, key, max_side, q=82):
    img = img.convert('RGBA')
    img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    f = out / (key + '.webp')
    img.save(f, 'WEBP', quality=q, method=6)
    manifest[key] = f.name
    return f.stat().st_size


total = 0
# ฉาก 9 + ไอเทม 18 (ภาพเดี่ยวจากแผน)
for f in sorted((plan / 'assets').glob('P2-*.png')):
    big = 1024 if '-SC-' in f.name else 560
    total += save(Image.open(f), f.stem[:8], big)
# ท่ายาน + เอฟเฟกต์
for f in sorted((plan / 'assets' / 'techno-spacecraft-v1').glob('P2-*.png')):
    total += save(Image.open(f), f.stem, 420)
# บอส 9 ตัว (แผ่น 3x3)
for f in sorted(drive.glob('0[1-9]-*-3x3.png')):
    total += save(Image.open(f), 'boss' + f.name[:2], 1152, 80)
# ท่า Techno ที่ใช้
POSES = {
    'wave': '002', 'thumbs': '003', 'wai': '004', 'pointL': '005', 'pointR': '006', 'pointUp': '007', 'pointDown': '008',
    'present': '009', 'welcome': '010', 'runR': '011', 'runL': '012', 'jump': '013', 'victory': '016', 'ready': '017',
    'crouch': '019', 'shield': '025', 'charge': '036', 'beam': '037', 'astro': '052', 'planet': '053', 'rocket': '054',
    'telescope': '055', 'laptop': '057', 'mouse': '058', 'keyboard': '059', 'tablet': '060', 'phone': '061',
    'game': '062', 'headphones': '063', 'circuit': '064', 'magnifier': '065', 'lock': '066', 'umbrella': '067',
    'bug': '068', 'toolbox': '069', 'repair': '070', 'book': '071', 'write': '072', 'board': '073', 'trophy': '074',
    'medal': '075', 'confetti': '078', 'star': '080', 'highfive': '082', 'think': '084', 'puzzled': '085',
    'hips': '086', 'arms': '087', 'help': '088', 'bubble': '090', 'peek': '091',
}
for key, num in POSES.items():
    hit = sorted(drive.glob(f'techno-{num}-*.png'))
    if not hit:
        print('missing pose', key, num)
        continue
    total += save(Image.open(hit[0]), 'pose-' + key, 420, 82)
(out / 'manifest.json').write_text(json.dumps(manifest, indent=1), encoding='utf-8')
print(len(manifest), 'ภาพ', round(total / 1e6, 1), 'MB')
