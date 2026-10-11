"""เตรียมภาพท่า MaskRider Techno เพิ่มเติม (ท่าขับยาน 9 ท่า + ท่าสู้ 5 ท่า) เป็น WebP ใน assets/poses/
ภาพต้นฉบับ: tools/.asset-cache (ดึงจาก Drive โฟลเดอร์ Techno asset) และ assets/maskrider-techno-shooter-3x2-v1.png
รันครั้งเดียวเมื่อต้องการเพิ่ม/เปลี่ยนท่า แล้วรัน build.py"""
from pathlib import Path
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True
here = Path(__file__).resolve().parent
cache = here.parent.parent / 'tools' / '.asset-cache'
out = here / 'assets' / 'poses'
out.mkdir(parents=True, exist_ok=True)

SHIPS = {  # Drive ID -> ชื่อท่า (techno-044..052)
    'ship-scooter': '1I5HZj-3ntt6F4gFg2mrJ7iSrnC5CbfnF',
    'ship-fighter': '1Hb4pbsNb5Fg4H7dWN2kgsVk-OorsCbo2',
    'ship-hover': '15X2qa6d-BOeCjXF_SF5pswV_9XFu05GN',
    'ship-rocket': '1IZ42hbamLG9C4p8BPtgZhat4e4XzJO7s',
    'ship-pointer': '1MZ0ANXfwJvZgVI0w3ruMfXweMgdEH2K_',
    'ship-ufo': '182dPIjqL2ZMx7LmnkXenhKxj8nr9YZoJ',
    'ship-surf': '1GnwEMZ8ObfqAUk-NA9ulY_WTn1qnVzVI',
    'ship-jetpack': '1MWKujcBSC_ThaW2L78Xdecn1fTz2Fjs1',
    'ship-astro': '1qC9EPLouilnbGaWXuRtRyNCGA0CJsR8W',
}


def save(im, name, width=300):
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    im.thumbnail((width, width))
    im.save(out / (name + '.webp'), 'WEBP', quality=86, method=6)


for name, fid in SHIPS.items():
    cands = sorted(cache.glob(fid + '-*.png'), key=lambda p: int(p.stem.rsplit('-', 1)[1]), reverse=True)
    if not cands:
        print('ไม่พบ', name)
        continue
    save(Image.open(cands[0]).convert('RGBA'), name)

sheet = Image.open(here / 'assets' / 'maskrider-techno-shooter-3x2-v1.png').convert('RGBA')
cw, ch = sheet.width // 3, sheet.height // 2
for k, name in enumerate(['shot-ready', 'shot-shoot', 'shot-dodge', 'shot-shield', 'shot-hurt', 'shot-victory']):
    if name == 'shot-hurt':
        continue  # ท่าเจ็บไม่เหมาะกับตัวช่วยสอน
    save(sheet.crop(((k % 3) * cw, (k // 3) * ch, (k % 3 + 1) * cw, (k // 3 + 1) * ch)), name)

print('เสร็จ', sorted(p.name for p in out.glob('*.webp')))
