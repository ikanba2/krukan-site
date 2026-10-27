# สคริปต์ฝังเกมลง Google Sites

Google Sites ไม่มี API สำหรับใส่โค้ดฝัง สคริปต์นี้จึงควบคุม Chrome แทนมือ: เปิดหน้าแก้ไข กดดินสอแก้ไขการฝัง ใส่โค้ดใหม่ ถัดไป บันทึก (และเผยแพร่ถ้าสั่ง)

## ตั้งค่าครั้งแรก (ทำครั้งเดียว)

1. `pip install playwright` (ไม่ต้องโหลดเบราว์เซอร์เพิ่ม ใช้ Chrome ที่มีในเครื่อง)
2. รันคำสั่งใดก็ได้ที่ต้องต่อเว็บ เช่น `python tools/sites-embed/sites_embed.py --review` สคริปต์จะเปิด **Chrome อีกโปรไฟล์หนึ่ง** (เก็บที่ `%LOCALAPPDATA%\krukan-sites-profile`)
3. ล็อกอิน Google เองในหน้าต่างนั้น (บัญชีที่แก้เว็บ krukan.in.th ได้) ระบบจำให้ ครั้งต่อไปไม่ต้องล็อกอินอีก สคริปต์ไม่เก็บและไม่แตะรหัสผ่าน

## ใช้งานประจำ

| ต้องการ | คำสั่ง |
|---|---|
| ดูรายการหน้า | `python tools/sites-embed/sites_embed.py --list` |
| build เกมใหม่ + ฝังเกมทุกเกมลงฉบับร่าง | `python tools/sites-embed/sites_embed.py --games --build` |
| ฝังเฉพาะบางหน้า | `python tools/sites-embed/sites_embed.py net-patrol type-hero` |
| ดูรายการที่จะเผยแพร่ (ยังไม่เผยแพร่) | `python tools/sites-embed/sites_embed.py --review` |
| เผยแพร่ฉบับร่างที่ฝังไว้แล้ว + ตรวจเว็บจริง | `python tools/sites-embed/sites_embed.py --publish-only --verify-live` |
| ฝังทุกหน้า เผยแพร่ ตรวจเว็บจริง ในคำสั่งเดียว | `python tools/sites-embed/sites_embed.py --all --build --publish --verify-live` |

- ค่าตั้งต้น **แก้เฉพาะฉบับร่าง ไม่เผยแพร่** ต้องใส่ `--publish` หรือสั่ง `--publish-only` เองถึงจะขึ้นเว็บจริง
- โค้ดที่เหมือนกับที่ฝังอยู่แล้วจะข้าม (ใส่ `--force` ถ้าอยากฝังทับ)
- หลังบันทึกจะเปิดกล่องแก้ไขการฝังซ้ำเทียบกับไฟล์ (ข้ามได้ด้วย `--no-verify`)
- `--verify-live` เปิดหน้าจริงแล้วเทียบรหัสรุ่น: เกมทุกไฟล์มี `<meta name="kg-build">` ที่ `tools/build-games.py` ใส่ให้ตอน build หน้า home และ /etc ตรวจจากข้อความอ้างอิงใน `pages.json`
- หน้าแรกประกอบจาก `Home-Play-Learn-Lite.html` และแทน `mangaCover` ด้วยภาพ base64 ตัวสดจาก `tools/games/covers/_live-home-embed.html` ให้เอง

## เพิ่มหน้าใหม่

เพิ่มรายการใน `pages.json`: `id` คือรหัสหน้าในลิงก์ตอนเปิดหน้านั้นในโหมดแก้ไข (`.../p/<id>/edit`) `file` คือไฟล์ที่จะฝัง `live` คือเส้นทางบนเว็บจริง และ `build` คือชื่อเกมใน `tools/build-games.py`
หน้าใหม่ต้องสร้างด้วยมือก่อนครั้งหนึ่ง (ปุ่ม <> ฝังทั้งหน้า) หรือใช้ 'ทำซ้ำหน้าเว็บ' จากหน้าเกมที่มีอยู่ใต้ 'บทเรียนอื่นๆ' แล้วค่อยใช้สคริปต์ใส่โค้ด

สร้างหน้าเกมใหม่ด้วยสคริปต์: `python tools/sites-embed/create_page.py "Techno Steps" techno-steps` (ทำซ้ำจากหน้า Net Patrol ตั้งชื่อและเส้นทางให้ ไม่เผยแพร่) ได้รหัสหน้ามาใส่ `pages.json` หน้า techno-steps (24 ต.ค. 2569) สร้างด้วยสคริปต์ทดลองรุ่นก่อน ส่วน techno-folder (24 ต.ค. 2569) สร้างด้วย create_page.py ตัวนี้จริงและใช้ได้ผล

## ถ้าสคริปต์พัง

Google เปลี่ยนหน้าตาปุ่มได้ ข้อความปุ่มและตัวเลือกอยู่ที่ต้นไฟล์ `sites_embed.py` (`T_EDIT`, `T_NEXT`, `T_SAVE`, `T_PUBLISH`) และฟังก์ชัน `open_embed_editor` / `update_page` / `publish`
ถ้าพอร์ตดีบัก 9333 ชน ตั้ง `KRUKAN_CDP_PORT` เป็นเลขอื่นได้
