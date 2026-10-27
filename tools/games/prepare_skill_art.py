"""เตรียมภาพสำหรับ 4 เกมฝึกทักษะ (เมืองสีรุ้ง · จอมจังหวะ · ภารกิจแป้นพิมพ์ · ผจญภัยเมาส์) ไม่ต้องเจนภาพใหม่ ใช้ของที่มีอยู่แล้วทั้งหมด:
- ท่าไรเดอร์เทคโน 100 ท่า (Drive: Pic/Techno asset/techno-NNN-*.png 512x512 พื้นโปร่งใส) › skill-art/poses/<ชื่อ>.webp ตัดขอบ สูง 320
- เมืองสีรุ้ง: หุ่นยนต์ 4 สี แบตเตอรี่ 4 สี ดาวคริสตัล 4 สี ชุดภาพเรียงลำดับ 4 ชุด (Pic/rainbow-city-techno-*-v6.webp) › skill-art/rb/
- เพื่อนหุ่นยนต์ ไอเท็ม และบอสสมองของผจญภัยเมาส์ (Pic/game1_assets) › skill-art/bots/
- ฉาก: เมือง ท้องฟ้า โรงงาน (Pic/game1_assets/bg_*.webp) › skill-art/bg/ ย่อให้เล็กลงพอดีฉากหลัง
build-games.py ฝังเฉพาะภาพที่แต่ละเกมระบุไว้ (key 'skill_art') รัน: python tools/games/prepare_skill_art.py (ผลลัพธ์อยู่ใน repo แล้ว ใช้เมื่อเปลี่ยนภาพเท่านั้น)"""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
PIC = Path('G:/My Drive/krukan/Pic')
TA = PIC / 'Techno asset'
G1 = PIC / 'game1_assets'
OUT = HERE / 'skill-art'

# ชื่อท่า : เลขไฟล์ใน Techno asset (ทุกท่าไม่ถือดาบ ยกเว้นระบุ)
POSES = {
    'wave': 2, 'thumbs': 3, 'wai': 4, 'pointL': 5, 'pointR': 6, 'pointUp': 7, 'pointDown': 8, 'present': 9, 'palms': 10, 'runR': 11, 'runL': 12,
    'jump': 13, 'land': 14, 'leap': 15, 'victory': 16, 'ready': 17, 'kick': 18, 'charge': 36, 'beam': 37, 'board': 49, 'jetpack': 51, 'float': 52,
    'planet': 53, 'scope': 55, 'typing': 56, 'laptop': 57, 'mouse': 58, 'keyboard': 59, 'tablet': 60, 'phone': 61, 'pad': 62, 'phones': 63,
    'circuit': 64, 'magnifier': 65, 'shield': 66, 'umbrella': 67, 'bugnet': 68, 'toolbox': 69, 'repair': 70, 'book': 71, 'pencil': 72,
    'sign': 73, 'trophy': 74, 'medal': 75, 'balloons': 76, 'gift': 77, 'confetti': 78, 'heart': 79, 'star': 80, 'rainbow': 81, 'highfive': 82,
    'think': 83, 'chin': 84, 'puzzled': 85, 'hips': 86, 'arms': 87, 'kneel': 88, 'cart': 89, 'bubble': 90, 'peek': 91, 'stool': 98, 'dance': 100,
}


def crop_alpha(im):
    im = im.convert('RGBA'); bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(bb) if bb else im


def fit(im, h=None, w=None):
    if h and im.height > h:
        im = im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)
    if w and im.width > w:
        im = im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)
    return im


def save(im, p, q=80):
    p.parent.mkdir(parents=True, exist_ok=True); im.save(p, 'WEBP', quality=q, method=6); return p.stat().st_size // 1024


def main():
    total = 0
    for name, n in POSES.items():
        f = next(TA.glob('techno-%03d-*.png' % n)); im = fit(crop_alpha(Image.open(f)), h=320)
        total += save(im, OUT / 'poses' / (name + '.webp'), 74)
    print('poses', len(POSES), total, 'KB')
    k = 0
    for c in range(4):
        for pre, tag, box in (('robot', 'robot', 230), ('battery', 'battery', 230), ('star', 'star', 200)):
            f = PIC / ('rainbow-city-techno-%s%d-v6.webp' % (pre, c)); im = fit(crop_alpha(Image.open(f)), h=box); k += save(im, OUT / 'rb' / ('%s%d.webp' % (tag, c)), 82)
    for r in range(4):
        for i in range(3):
            f = PIC / ('rainbow-city-techno-seq%d-%d-v6.webp' % (r, i)); im = Image.open(f).convert('RGB'); w, h = im.size; m = int(min(w, h) * 0.06)
            im = fit(im.crop((m, m, w - m, h - m)), h=240); k += save(im, OUT / 'rb' / ('seq%d_%d.webp' % (r, i)), 80)
    print('rb', k, 'KB')
    k = 0
    for n in ('bot_click', 'bot_code', 'bot_puzzle', 'bot_repair', 'boss_brain', 'item_antenna', 'item_battery', 'item_chip', 'item_crystal', 'item_gear', 'item_heart', 'item_star'):
        im = fit(crop_alpha(Image.open(G1 / (n + '.webp'))), h=260 if n.startswith(('bot', 'boss')) else 150); k += save(im, OUT / 'bots' / (n + '.webp'), 80)
    print('bots', k, 'KB')
    k = 0
    for n in ('bg_city', 'bg_sky', 'bg_workshop'):
        im = Image.open(G1 / (n + '.webp')).convert('RGB'); im = fit(im, w=800); k += save(im, OUT / 'bg' / (n + '.webp'), 66)
    print('bg', k, 'KB')


if __name__ == '__main__':
    main()
