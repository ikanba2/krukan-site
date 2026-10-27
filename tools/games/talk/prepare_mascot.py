"""เตรียมภาพมาสคอตไรเดอร์เทคโนหลายท่าทางจาก Google Drive (G:/My Drive/krukan/Pic) ให้เป็นโค้ชบอกโจทย์ในเกม Techno Talk
ตัดขอบโปร่งใสให้ชิดตัว ย่อสูง 300px เก็บเป็น webp ไว้ที่ tools/games/talk/mascot/<ท่า>.webp (build-games.py ฝังลงเกมเป็น base64)
รัน: python tools/games/talk/prepare_mascot.py   (ใช้เฉพาะเมื่ออยากเปลี่ยนชุดภาพ ไฟล์ผลลัพธ์อยู่ใน repo แล้ว)"""
from pathlib import Path
from PIL import Image

SRC = Path('G:/My Drive/krukan/Pic')
OUT = Path(__file__).resolve().parent / 'mascot'
# ชื่อท่า (ใช้ในเกม) : ไฟล์ต้นฉบับ
POSES = {
    'wave': 'home-class-techno-01-wave.webp',          # โบกมือทักทาย
    'book': 'home-class-techno-02-book.webp',          # ถือหนังสือ (ตอนเรียน)
    'tablet': 'home-class-techno-03-tablet.webp',      # นั่งอ่านแท็บเล็ต (ตอนให้คำใบ้)
    'shield': 'home-class-techno-04-shield.webp',      # ถือโล่
    'magnifier': 'home-class-techno-05-magnifier.webp',  # แว่นขยาย (ตอนตอบผิด: ลองสังเกตดูอีกที)
    'laptop': 'home-class-techno-06-laptop.webp',      # นั่งใช้แล็ปท็อป (ตอนลากวาง)
    'code': 'home-class-techno-07-code.webp',          # โยนบล็อกโค้ด (ตอนจัดกลุ่ม)
    'rocket': 'home-class-techno-08-rocket.webp',      # ขี่จรวด
    'trophy': 'home-class-techno-09-trophy.webp',      # ถือถ้วย (ตอนจบด่าน)
    'cheer': 'rainbow-city-techno-cheer-v6.webp',      # ชูกำปั้นดีใจ (ตอบถูก)
    'point': 'rainbow-city-techno-point-v6.webp',      # ชี้ (ตอนบอกโจทย์) ในเกมจะกลับซ้ายขวาให้ชี้ไปทางเนื้อหา
    'action': 'rainbow-city-techno-action-v6.webp',    # ท่าพร้อมลุย
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, fn in POSES.items():
        im = Image.open(SRC / fn).convert('RGBA')
        bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        im = im.crop(bb)
        h = 300
        im = im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)
        im.save(OUT / (name + '.webp'), 'WEBP', quality=82, method=6)
        print(name, im.size, (OUT / (name + '.webp')).stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
