# DT-M1 — ฉากต่อสู้ใหม่ 7 บท

สร้างด้วย built-in image_gen วันที่ 18 ตุลาคม 2569 สไตล์คอมมิกลงสี เจนเป็น contact sheet 2 ชุดแล้วตัดออกเป็น 7 ฉาก ไม่ใช้ฉากเดิมในระบบต่อสู้

| บท | บอส | ฉาก | ไฟล์ | Drive ID |
|---|---|---|---|---|
| 1 | โกเลมพฤกษา #47 | สวนพฤกษากล | `arena-dt-m1-c01.webp` | `1RB2oazN8vmIyF7mWV8OtqK5-Sa_b-ruU` |
| 2 | แรดมอส #65 | ทุ่งมอสเปลี่ยนผ่าน | `arena-dt-m1-c02.webp` | `1dl_ZBKYednzxOkZI2by9s3blHMNRsay_` |
| 3 | กระทิงปฐพี #78 | วงแหวนระบบปฐพี | `arena-dt-m1-c03.webp` | `1VTt49jqO-3Ko9IZO5WdwQq3EfQx373NC` |
| 4 | ด้วงศิลาทอง #69 | เหมืองวัสดุทอง | `arena-dt-m1-c04.webp` | `130l4LFhuSC3pk2iujpx3oeOXLxfmikm0` |
| 5 | เต่าพลาสมา #50 | อู่เต่าพลาสมา | `arena-dt-m1-c05.webp` | `1CnhbAruWlHTYw488wTZn1YFUnuWetd4v` |
| 6 | เลียงผาสายฟ้า #55 | ผาสายฟ้าออกแบบ | `arena-dt-m1-c06.webp` | `1mCGIncxaHMxjJLNT2B7Uh_m_Z56HuK_F` |
| 7 | ยักษ์ตาเพลิง #63 | ลานทดสอบตาเพลิง | `arena-dt-m1-c07.webp` | `1A2b_72JMCtH25GM0Np5TJ1yQfiu_EHjU` |

## การนำไปใช้

- ภาพสุดท้าย 1280×720 WebP อยู่ใน `assets/arena-dt-m1-c01.webp` ถึง `c07.webp` โดยแยกไฟล์ต่อบท
- `boss-game.js` ใช้ภาพใหม่ทั้งหน้าท้าทายและ canvas; `practice.js` ใช้ภาพเดียวกันในโหมดสำรอง
- Offline ใช้ไฟล์ในเครื่อง ส่วน GAS ดึงจาก Drive ด้วย `assets-drive.json` ไม่ฝังฉากเป็น Base64
- Climate มีไว้เลือกอนุภาค/เอฟเฟกต์เท่านั้น ไม่ใช้เลือกรูปฉากอีกต่อไป เต่าพลาสมาใช้อู่เครื่องจักรแห้งและเอฟเฟกต์ไฟฟ้า
- ไฟล์สนามเก่าคงไว้เพื่อย้อนกลับ แต่ถอดออกจาก runtime manifest แล้ว

## ข้อกำหนดภาพและการตรวจ

- ตรวจจากพิกัดในระบบ Offline: canvas 960×540, GROUND=462, sprite bottom=474, Techno x=170/size=320, boss x=770/size=380
- ไม่มีตัวละคร ข้อความ HUD หรือกระสุนฝังอยู่ในภาพฉาก เพื่อให้ระบบวาด sprite และการเตือนโจมตีได้ถูกต้อง
- ครอปด้านซ้าย/ขวาข้างละ 5% และด้านล่าง 10% ให้ขอบหน้าพื้นอยู่ต่ำกว่าแนวเท้าของ sprite
- `arena-combat-preview.jpg` และ `combat-preview-c01.jpg` ถึง `c07.jpg` เป็นภาพจำลอง QA วาง sprite จริงตามพิกัดจากโค้ด ไม่ใช่ screenshot การเล่น
- เบราว์เซอร์เครื่องมือปฏิเสธการเปิด file:// จึงยังไม่ได้ playtest ผ่านเบราว์เซอร์ในรอบนี้ ตรวจภาพประกอบ พิกัด ไฟล์ JS และแพ็ก GAS แทน
- `generation-prompts.json` เก็บ prompt จริง; `arena-source-sheet-01.png` และ `02.png` เก็บภาพต้นฉบับ ช่องที่ 4 ของชุดที่ 2 เป็นภาพสำรองที่ไม่ได้ใช้เป็นฉากบทเรียน
- อัปโหลดภาพทั้งหมดไปยัง https://drive.google.com/drive/folders/1BaK1eEBmtb3dX33r_sBPgr5JayzGVuiX

## ขอบเขต

ปรับเฉพาะฉากและการจับคู่บอสของวิชาออกแบบและเทคโนโลยี ม.1 ระบบควบคุมและคำถามต่อสู้เดิมยังทำงานตามโค้ดเดิม ยังไม่ได้ deploy โปรเจกต์ GAS ออนไลน์
