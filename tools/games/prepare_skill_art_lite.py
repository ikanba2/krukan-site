"""ทำภาพรุ่นเบาของเกมทักษะ 4 เกม (เมืองสีรุ้ง จอมจังหวะ ภารกิจแป้นพิมพ์ ผจญภัยเมาส์) จาก tools/games/skill-art/ ไปที่ tools/games/skill-art-lite/
เหตุผล: Google Sites จำกัดตัวอักษรทั้งเว็บ ~40 ล้านตัว (ดู sites-char-limit) ภาพฝังเป็น base64 กินที่ที่สุด จึงลดขนาดภาพ (ความสูงท่า 240 · วัตถุ 170 · ฉากหลังกว้าง 640)
build-games.py skill_images() ใช้โฟลเดอร์ -lite รัน: python tools/games/prepare_skill_art_lite.py"""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC, DST = HERE / 'skill-art', HERE / 'skill-art-lite'
# (โฟลเดอร์, ความสูงสูงสุด, ความกว้างสูงสุด, คุณภาพ)
RULES = {'poses': (240, None, 62), 'rb': (170, None, 70), 'bots': (170, None, 62), 'bg': (None, 640, 56)}


def main():
    tot0 = tot1 = 0
    for d, (mh, mw, q) in RULES.items():
        (DST / d).mkdir(parents=True, exist_ok=True)
        for f in sorted((SRC / d).glob('*.webp')):
            im = Image.open(f); im.load()
            w, h = im.size; k = 1.0
            if mh and h > mh: k = min(k, mh / h)
            if mw and w > mw: k = min(k, mw / w)
            if k < 1: im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
            if d == 'rb' and f.name.startswith('seq'):
                pass
            out = DST / d / f.name
            im.save(out, 'WEBP', quality=q, method=6, alpha_quality=70)
            tot0 += f.stat().st_size; tot1 += out.stat().st_size
    print('ก่อน %d KB › หลัง %d KB' % (tot0 // 1024, tot1 // 1024))


if __name__ == '__main__':
    main()
