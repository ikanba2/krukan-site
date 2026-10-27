"""เตรียมภาพเคลื่อนไหวจากคลังภาพเกมเก่า (Techno Dimension) ให้เกมหน้าเดียวใช้
อ่านจากโฟลเดอร์ dist/assets ของโปรเจกต์เกมเก่า ตัดขอบว่าง ย่อขนาด แล้วเก็บเป็น webp เล็ก ๆ ใน tools/games/art/
พร้อม art/meta.json (จุดยึดเท้า ขนาดลำตัว) ให้ assets.py และ build-games.py ใช้ต่อ
รันเองเฉพาะตอนต้องการเปลี่ยนชุดภาพ: python tools/games/prepare_art.py   (ไม่ต้องมีโฟลเดอร์ต้นทางตอน build)"""
import json
from pathlib import Path

from PIL import Image

PACK = Path('C:/Users/ikan/Documents/Codex/2026-10-06/https-maskrider-techno-story-ikanba-chatgpt/work/work/site/dist')
OUT = Path(__file__).resolve().parent / 'art'

# เฟรมของฮีโร่ในคลังเดิม: 0 ยืน, 1-6 วิ่ง, 7 กระโดดขึ้น, 8 ตกลง, 9 พุ่ง, 10-12 ฟันเบา, 15 โดนตี
HERO_FRAMES = {'idle': 0, 'w1': 1, 'w2': 2, 'w3': 3, 'w4': 4, 'w5': 5, 'w6': 6, 'up': 7, 'fall': 8, 'dash': 9,
               'a1': 10, 'a2': 11, 'a3': 12, 'hurt': 15}
HERO_FORMS = [0, 1, 2, 3]      # 0 = ชุดดำเงินชมพูแมเจนตา (ฐาน)  1 = ชุดน้ำเงินฟ้า  2 = ชุดทอง  3 = ชุดแดง
HERO_SCALE = 0.55
MONSTERS = [0, 1, 2, 3, 4, 5, 6, 7]  # 0 ก้อนเจลน้ำแข็ง 1 โดรนคริสตัล 2 แมงป่อง 3 วิญญาณน้ำแข็ง 4 โกเลมคริสตัล 5 แมงมุม 6 อัศวินน้ำแข็ง 7 จอมเวทมืด
# ชุดสีสดใสสำหรับเกมธีมสว่าง: 8 เห็ดคริสตัล 9 หมูป่าใบไม้ 10 ด้วงฟ้า 11 ค้างคาวม่วง 12 ปูทราย 13 กิ้งก่าไฟ 14 เพนกวินคริสตัล 15 พ่อมดม่วง
# และชุดขยาย v25: 16 ปูปะการัง 17 แมงกะพรุน 18 มังกรชมพู 19 จิ้งจอกใบไม้ 21 มังกรเขียวมิ้นต์ 25 ภูตไฟ 34 หมาป่าน้ำแข็ง 35 นกฟ้า 36 กริฟฟินฟ้า 40 ทานตะวัน 41 ผึ้งทอง 43 ภูตลาวา
MONSTERS_BRIGHT = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 25, 34, 35, 36, 40, 41, 43]
MON_SCALE = 0.45
MON_SCALE_V25 = 0.9      # ภาพชุด v25 ต้นฉบับ 256 พิกเซล (ชุดแรก 512) จึงย่อน้อยกว่า
BGS = {'thunder': 1, 'nature': 0, 'fire': 10, 'ice': 3,   # ฉากเมืองไซเบอร์ ป่าคริสตัล ปราสาทลาวา ปราสาทน้ำแข็ง
       'sky': 2, 'sun': 14, 'autumn': 13, 'reef': 5}       # ฉากสว่าง: ท้องฟ้าสดใส ทานตะวันทอง ใบไม้แดง ใต้ทะเลสีฟ้า
BG_W = 880


def save(im, name, q):
    OUT.mkdir(exist_ok=True)
    im.save(OUT / f'{name}.webp', 'WEBP', quality=q, method=6)


def union_box(frames, mid=256):
    """กรอบรวมของทุกเฟรม ขยายให้สมมาตรรอบแกนกลาง (x = mid) ส่วนล่างตัดที่ขอบภาพเพื่อให้จุดยึดเท้าเท่ากันทุกเฟรม"""
    x0, y0, x1, y1 = mid * 2, mid * 2, 0, 0
    for im in frames:
        b = im.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
        if b:
            x0, y0, x1, y1 = min(x0, b[0]), min(y0, b[1]), max(x1, b[2]), max(y1, b[3])
    half = max(mid - x0, x1 - mid) + 4
    return mid - half, max(0, y0 - 4), mid + half, mid * 2


def build():
    s = (PACK / 'game.js').read_text(encoding='utf-8', errors='replace')
    meta_src = json.JSONDecoder().raw_decode(s[s.index('ANIM_META=') + len('ANIM_META='):])[0]
    meta = {'hero': {}, 'mon': {}, 'bg': list(BGS)}
    for form in HERO_FORMS:
        ims = {k: Image.open(PACK / 'assets' / f'hero-anim-{form}-{f}.webp').convert('RGBA') for k, f in HERO_FRAMES.items()}
        box = union_box(ims.values())
        w, h = box[2] - box[0], box[3] - box[1]
        size = (round(w * HERO_SCALE), round(h * HERO_SCALE))
        for k, im in ims.items():
            save(im.crop(box).resize(size, Image.LANCZOS), f'h{form}_{k}', 68)
        base = meta_src['hero'][str(form)]
        meta['hero'][f'h{form}'] = {'oy': round((base['baseline'] - box[1]) / h, 4), 'body': base['bodyHeight'] * HERO_SCALE,
                                    'w': size[0], 'h': size[1]}
    # ข้อมูลขนาดของมอนสเตอร์ชุดขยาย v25 (16-45) อยู่ในบรรทัดที่ 4 ของ game.js แยกจากชุดแรก
    exp = json.JSONDecoder().raw_decode(s[s.index('Object.assign(ANIM_META.monster,') + len('Object.assign(ANIM_META.monster,'):])[0]
    meta_src['monster'].update(exp)
    for m in MONSTERS + MONSTERS_BRIGHT:
        v25 = m >= 16
        sc = MON_SCALE_V25 if v25 else MON_SCALE
        name = (lambda f: f'monster-v25-{m}-{f}.webp') if v25 else (lambda f: f'monster-anim-{m}-{f}.webp')
        ims = {f: Image.open(PACK / 'assets' / name(f)).convert('RGBA') for f in range(8)}
        box = union_box(ims.values(), 128 if v25 else 256)
        w, h = box[2] - box[0], box[3] - box[1]
        size = (round(w * sc), round(h * sc))
        for f, im in ims.items():
            save(im.crop(box).resize(size, Image.LANCZOS), f'm{m}_{f}', 60)
        base = meta_src['monster'][str(m)]
        meta['mon'][f'm{m}'] = {'oy': round((base['baseline'] - box[1]) / h, 4), 'body': base['bodyHeight'] * sc,
                                'bw': base['bodyWidth'] * sc, 'w': size[0], 'h': size[1]}
    for name, n in BGS.items():
        im = Image.open(PACK / 'assets' / f'bg-{n}.webp').convert('RGB')
        save(im.resize((BG_W, round(BG_W * im.height / im.width)), Image.LANCZOS), f'arena_{name}', 46)
    (OUT / 'meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    total = sum(p.stat().st_size for p in OUT.glob('*.webp'))
    print(f'เสร็จ {len(list(OUT.glob("*.webp")))} ไฟล์ รวม {total / 1024:.0f} KB')


if __name__ == '__main__':
    build()
