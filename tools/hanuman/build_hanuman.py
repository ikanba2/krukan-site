"""สร้างเกม 'หนุมานพิชิตเส้นทาง 3D' รุ่นอัปเกรด (27 ต.ค. 2569) เป็นไฟล์เดียว Game-Hanuman-Path.html ที่รากโปรเจกต์
ที่มา: original.html คือโค้ดฝังเดิมที่ดึงจากหน้า Sites /etc/Hanuman (ห้ามแก้) · แก้ที่ไฟล์เหล่านี้แล้วรันสคริปต์นี้ใหม่:
  app3d.src.js   โค้ดแอปส่วน three.js (ตัวละคร ฉาก กระดาน แสง) ที่อยู่ท้ายสคริปต์ใหญ่ของไฟล์เดิม (แยกและจัดรูปแล้ว) ต้องอยู่ในฟังก์ชันเดียวกับ three.js เดิม
  upgrade.css    ชั้นตกแต่ง UI วางต่อท้าย CSS เดิม (ไม่เปลี่ยนขนาด/ตำแหน่งของกล่อง เพื่อไม่ให้เลย์เอาต์ 1920x1080 พัง)
  กติกาสร้างด่านเอง (ด่าน Y001): ทางเดินรวมจุดเริ่มต้นและประตูอย่างน้อย 7 ช่อง (เดิม 8) ส่วนอื่นเหมือนเดิม (รหัสไม่เกิน 8 ช่อง ยักษ์ 2 ตัว) ดู PATCHES
รัน: python tools/hanuman/build_hanuman.py"""
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'Game-Hanuman-Path.html'

# (ข้อความเดิม, ข้อความใหม่, จำนวนครั้งที่ต้องเจอ) ทุกข้อต้องเจอตามจำนวน ไม่งั้นหยุด (กันพลาดเมื่อไฟล์เดิมเปลี่ยน)
PATCHES = [
    # กติกา Y001: ทางเดินอย่างน้อย 7 ช่อง
    ('<b>ทางต้องยาวอย่างน้อย 8 ช่อง</b>', '<b>ทางต้องยาวอย่างน้อย 7 ช่อง</b>', 1),
    ('ทางยาว 8 ช่องขึ้นไป แต่เขียนรหัสได้ไม่เกิน 8 ช่อง โดย wr กับ wa กินไปแล้ว 2 ช่อง จึงเหลือเพียง 6 ช่องสำหรับการเดินและการหันทิศ <b>ไม่ใช้ re จะทำสำเร็จไม่ได้</b>',
     'ทางยาว 7 ช่องขึ้นไป (เดิน 6 ก้าว) แต่เขียนรหัสได้ไม่เกิน 8 ช่อง โดย wr กับ wa กินไปแล้ว 2 ช่อง จึงเหลือเพียง 6 ช่องสำหรับการเดินและการหันทิศ <b>ถ้าทางมีทางเลี้ยว ไม่ใช้ re จะทำสำเร็จไม่ได้</b>', 1),
    ('ให้ครบอย่างน้อย 8 ช่อง และวางยักษ์ 2 ตัวนอกเส้นทาง', 'ให้ครบอย่างน้อย 7 ช่อง และวางยักษ์ 2 ตัวนอกเส้นทาง', 1),
    ('เส้นทางรวมจุดเริ่มต้นและประตูอย่างน้อย <b>8 ช่อง</b>', 'เส้นทางรวมจุดเริ่มต้นและประตูอย่างน้อย <b>7 ช่อง</b>', 1),
    ('if(path.size<8){feedback', 'if(path.size<7){feedback', 1),
    ('ต้องมีอย่างน้อย 8 ช่อง', 'ต้องมีอย่างน้อย 7 ช่อง', 1),
    ("else if(path.size<8) progress.textContent='ขั้นที่ 3/4 · ระบายทางเดินอีก '+(8-path.size)+' ช่อง ให้รวมอย่างน้อย 8 ช่อง'",
     "else if(path.size<7) progress.textContent='ขั้นที่ 3/4 · ระบายทางเดินอีก '+(7-path.size)+' ช่อง ให้รวมอย่างน้อย 7 ช่อง'", 1),
    # ชื่อหน้า
    ('<title>หนุมานพิชิตเส้นทาง 3D · สื่อฉายหน้าชั้น ป.4</title>', '<title>หนุมานพิชิตเส้นทาง 3D · สื่อฉายหน้าชั้น ป.4 | KruKan.in.th</title>', 1),
]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;700;800&display=swap" rel="stylesheet">\n')


def main():
    s = (HERE / 'original.html').read_text(encoding='utf-8')
    for old, new, n in PATCHES:
        c = s.count(old)
        if c != n:
            sys.exit('ไม่พบข้อความที่ต้องแก้ (%d ครั้ง ควรเป็น %d): %s' % (c, n, old[:70]))
        s = s.replace(old, new)
    # โค้ดแอป three.js: แทนส่วนท้ายของสคริปต์ใหญ่ ตั้งแต่ 'var vt=(i,t=document)' จนจบ
    i = s.index('var vt=(i,t=document)')
    j = s.index('</script>', i)
    app = (HERE / 'app3d.src.js').read_text(encoding='utf-8')
    s = s[:i] + app + '\n})();\n' + s[j:]
    css = (HERE / 'upgrade.css').read_text(encoding='utf-8')
    k = s.index('</style>') + len('</style>')
    s = s[:k] + '\n<style id="upgrade">\n' + css + '\n</style>' + s[k:]
    h = s.index('</head>')
    s = s[:h] + FONTS + s[h:]
    import hashlib   # รหัสรุ่นของไฟล์ (เหมือนเกมอื่น ใช้ตรวจว่าเว็บจริงเป็นรุ่นล่าสุด)
    s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="kg-build" content="/*B*/">', 1)
    s = s.replace('/*B*/', hashlib.sha1(s.encode('utf-8')).hexdigest()[:10], 1)
    OUT.write_text(s, encoding='utf-8')
    print('สร้าง', OUT.name, len(s), 'ตัวอักษร')


if __name__ == '__main__':
    main()
