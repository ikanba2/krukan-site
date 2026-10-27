"""เตรียมภาพมาสไรเดอร์ 'ท่าประจำเกม' สำหรับหน้าแรกของทุกเกม (ผู้ใช้ขอ 26 ต.ค. 2569: เอาตัวสวย ๆ ไม่ถือดาบ ท่าทางเหมาะกับเกมนั้น ๆ)
ตัดขอบโปร่งใสให้ชิดตัว ย่อไม่เกินสูง 720px เก็บเป็น webp ที่ tools/games/title-poses/<ท่า>.webp
build-games.py ฝังเป็นเท็กซ์เจอร์ title_pose ตามค่า 'title_pose' ของแต่ละเกม (ใช้ไฟล์แรกที่มี) แล้ว KG.titlePose (shared/common.js) วางบนหน้าแรก
ภาพที่เจนใหม่จาก ChatGPT (covers/rider-poses/*.png) ถ้าพื้นหลังเป็นสีขาวล้วนจะลบพื้นขาวที่ต่อกับขอบภาพให้โปร่งใส
รัน: python tools/games/prepare_title_poses.py   (ไฟล์ผลลัพธ์อยู่ใน repo แล้ว ใช้เมื่อเปลี่ยนภาพเท่านั้น)"""
from collections import deque
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
PIC = Path('G:/My Drive/krukan/Pic')
NEW = HERE / 'covers' / 'rider-poses'
OUT = HERE / 'title-poses'
MAX_H = 600   # จอเกมสูง 720 หน่วย ภาพยืนสูงไม่เกิน ~520 หน่วย (ประหยัดตัวอักษรรวมของ Google Sites)

TA = PIC / 'Techno asset'   # คลังท่าไรเดอร์ 100 ท่า (techno-NNN-*.png 512x512 พื้นโปร่งใส)

# ชื่อท่า : ไฟล์ต้นฉบับ (ทุกท่าไม่ถือดาบ) · เกมไหนใช้ท่าไหนกำหนดที่ 'title_pose' ใน build-games.py
POSES = {
    'code': PIC / 'home-class-techno-07-code.webp',            # โยนบล็อกโค้ด (Code Runner)
    'tablet': PIC / 'home-class-techno-03-tablet.webp',        # คุกเข่าวางแผนบนแท็บเล็ต (Techno Grid)
    'typing': TA / 'techno-056-type-on-laptop-seated-at-small-desk.png',   # นั่งพิมพ์แล็ปท็อปที่โต๊ะ (Type Hero)
    'shield': PIC / 'home-class-techno-04-shield.webp',        # โล่แม่กุญแจ (Net Patrol)
    'rocket': PIC / 'home-class-techno-08-rocket.webp',        # ขี่จรวดส่งด่วน (Packet Express)
    'bugnet': TA / 'techno-068-catch-a-tiny-cyber-bug-in-net.png',         # สวิงจับบั๊กตัวจิ๋ว (Bug Buster)
    'pointright': TA / 'techno-006-point-right-with-straight-arm.png',     # ชี้ทางไปข้างหน้า (Techno Steps)
    'mouse': TA / 'techno-058-use-computer-mouse-at-small-desk.png',       # ใช้เมาส์ที่โต๊ะคอม (สำรองของ Techno Folder)
    'circuit': TA / 'techno-064-hold-glowing-circuit-board.png',           # ถือแผงวงจร (สำรองของ Techno Parts)
    'cheer': PIC / 'rainbow-city-techno-cheer-v6.webp',        # ชูกำปั้นดีใจ (สำรองของ Techno Slice)
    'bubble': TA / 'techno-090-hold-blank-rounded-speech-bubble-sign.png', # ถือป้ายคำพูด เกมเขียน Hello! ทับ (Techno Talk)
    'writing': TA / 'techno-072-hold-pencil-writing-in-notebook.png',      # จับดินสอเขียนสมุด (ตะลุยเมืองอักษร)
    'stats': PIC / 'maskrider-techno-stats.webp',              # กราฟพุ่ง (สำรองของ Techno Math)
    'detective': TA / 'techno-065-hold-magnifying-glass-detective-pose.png',  # นักสืบแว่นขยาย (Cipher Breaker)
    'rainbow': TA / 'techno-081-hold-rainbow-arch-prop.png',               # ถือโค้งรุ้ง (เมืองสีรุ้ง)
    'kbd': TA / 'techno-059-hold-keyboard-proudly.png',                    # ถือคีย์บอร์ดอย่างภูมิใจ (ภารกิจแป้นพิมพ์)
    'phones': TA / 'techno-063-wear-small-headphones-over-original-helmet.png',  # ใส่หูฟัง (จอมจังหวะ)
    # เจนใหม่จาก ChatGPT ตาม covers/AI_RIDER_POSES_JOB.md
    'parts': NEW / 'parts.png',     # ไขควง + ชิ้นส่วนคอม (Techno Parts)
    'slice': NEW / 'slice.png',     # ถือพิซซ่าดึงชิ้นออก (Techno Slice)
    'math': NEW / 'math.png',       # ดินสอยักษ์ + สัญลักษณ์คณิต (Techno Math)
    'folder': NEW / 'folder.png',   # โฟลเดอร์ไฟล์ + ชูนิ้วโป้ง (Techno Folder)
}


def clear_white_bg(im):
    """ภาพพื้นขาว (ไม่มีช่องโปร่งใส): ลบพื้นขาวที่ต่อจากขอบภาพ (flood fill) ไม่แตะสีขาวในตัวไรเดอร์ที่มีเส้นขอบล้อม"""
    px = im.load(); w, h = im.size
    if any(px[x, y][3] < 250 for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))):
        return im   # มีพื้นโปร่งใสอยู่แล้ว
    white = lambda p: p[0] > 236 and p[1] > 236 and p[2] > 236
    seen = bytearray(w * h); q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]:
            continue
        seen[y * w + x] = 1
        if not white(px[x, y]):
            continue
        px[x, y] = (255, 255, 255, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


def main():
    import sys
    OUT.mkdir(exist_ok=True)
    only = set(sys.argv[1:])   # ระบุชื่อท่าเพื่อทำเฉพาะท่านั้น (ไม่ระบุ = ทุกท่า)
    for name, src in POSES.items():
        if only and name not in only:
            continue
        if not src.exists():
            print('ข้าม (ยังไม่มีไฟล์)', name, src)
            continue
        im = clear_white_bg(Image.open(src).convert('RGBA'))
        im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
        if im.height > MAX_H:
            im = im.resize((round(im.width * MAX_H / im.height), MAX_H), Image.LANCZOS)
        im.save(OUT / (name + '.webp'), 'WEBP', quality=84, method=6)
        print(name, im.size, (OUT / (name + '.webp')).stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
