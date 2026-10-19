# ภาพประกอบคำถาม DT-M1 — Drive IDs

สร้างจาก `QUESTION_FIGURE_PROMPTS.md` ด้วย built-in image_gen ตรวจและอัปโหลดครบ 14 ภาพ วันที่18ตุลาคม2569

ไฟล์สุดท้ายอยู่ใน `assets/question-figs/` เป็น WebP1200×750 คุณภาพ85 ทุกไฟล์ต่ำกว่า250KB รวม496,950bytes ข้อความ/ตัวเลขสร้างอยู่ในภาพตั้งแต่การเจน ไม่ได้เขียนข้อความทับด้วยโค้ด

โฟลเดอร์ Drive: https://drive.google.com/drive/folders/1BaK1eEBmtb3dX33r_sBPgr5JayzGVuiX

## ชื่อไฟล์ → Drive file ID

| ชื่อไฟล์ | Drive file ID |
|---|---|
| `qfig-c06-tray-20.webp` | `1TAc5eotrYhpgp8-gSQCsGO9f919glc0i` |
| `qfig-c06-tray-24.webp` | `1i-XxfZWDZJK6rCwadxhDYloMEHxrFDyj` |
| `qfig-c06-desk-area.webp` | `1t37ys7r2C8_mOyqqfLLFgCwb3YO0SjT6` |
| `qfig-c06-views.webp` | `1uJ7RQzcdMexqEvdHNMbQNl9V-wdf25O9` |
| `qfig-c05-circuit-cut.webp` | `1soDHhImazsZ7TpVZ5bir9wB2SoeCRMiG` |
| `qfig-c05-circuit-nobattery.webp` | `1RS8DrghJT59rCHDTf33j4iD_wKFq-JK5` |
| `qfig-c05-circuit-resistor.webp` | `11HB0IgRSVUin9FCkhx65gqjN80UJzPw2` |
| `qfig-c05-wheel-axle.webp` | `1Vicpp0FfMdWFGpPCVJq4MvLoMtOqPp1x` |
| `qfig-c05-circuit-parts.webp` | `127l3VoN1Z6vTUx1DHxL1C3xqnuQkdiWx` |
| `qfig-c03-irrigation.webp` | `10ZTYBOuZZLOuczV4UJoWSecFQLURoqfz` |
| `qfig-c03-pipe-leak.webp` | `1YvI2t-Gcp9zzmHzfPRN4bKxd-kixnee5` |
| `qfig-c04-materials.webp` | `1GZBTYmHeZGEy_zJ--Jh-0Na7Ynbxk726` |
| `qfig-c07-times.webp` | `1wH_w81PNUBl6joLHSbStYkSSv_GCWDH8` |
| `qfig-c07-times-new.webp` | `1_Ckv95r35w9HKkwz_ymTtyikrSf9dxkV` |

## จุดที่ใช้ภาพ

| ภาพ | ใช้กับ |
|---|---|
| `qfig-c06-tray-20.webp` | ด่านฝึกบท 6 ข้อ 3, ก่อนเรียนบท 6 ข้อ 3 |
| `qfig-c06-tray-24.webp` | หลังเรียนบท 6 ข้อ 3 |
| `qfig-c06-desk-area.webp` | หลังเรียนบท 6 ข้อ 2 |
| `qfig-c06-views.webp` | ด่านฝึกบท 6 ข้อ 2 |
| `qfig-c05-circuit-cut.webp` | ก่อนเรียนบท 5 ข้อ 2, คำถามบอสบท 5 ข้อ 2 |
| `qfig-c05-circuit-nobattery.webp` | หลังเรียนบท 5 ข้อ 1 |
| `qfig-c05-circuit-resistor.webp` | หลังเรียนบท 5 ข้อ 2, คำถามบอสบท 5 ข้อ 3 |
| `qfig-c05-wheel-axle.webp` | ด่านฝึกบท 5 ข้อ 3, ก่อนเรียนบท 5 ข้อ 4, หลังเรียนบท 5 ข้อ 4 |
| `qfig-c05-circuit-parts.webp` | ด่านฝึกบท 5 ข้อ 2 (โยงเส้นส่วนประกอบกับหน้าที่) |
| `qfig-c03-irrigation.webp` | ก่อนเรียนบท 3 ข้อ 1, 3, 4 · หลังเรียนบท 3 ข้อ 4 · คำถามบอสบท 3 ข้อ 2, 4 · ด่านฝึกบท 3 ข้อ 3–5 |
| `qfig-c03-pipe-leak.webp` | ด่านฝึกบท 3 ข้อ 3, ก่อนเรียนบท 3 ข้อ 4 |
| `qfig-c04-materials.webp` | ด่านฝึกบท 4 ข้อ 1, ก่อนเรียนบท 4 ข้อ 2, คำถามบอสบท 4 ข้อ 3 |
| `qfig-c07-times.webp` | ก่อนเรียนบท 7 ข้อ 2, ด่านฝึกบท 7 ข้อ 3 |
| `qfig-c07-times-new.webp` | หลังเรียนบท 7 ข้อ 4 |

## ให้ AI ที่ทำเว็บต่อ

- รวม mapping จาก `assets/question-figs/assets-drive-question-figs.json` เข้า `ราละเอียดวิชา/gas-dt-m1/assets-drive.json` แล้วผูกภาพกับข้อที่ตรงกันในด่านฝึก คำถามบอส และข้อสอบก่อน/หลังเรียน
- Offline ใช้ `assets/question-figs/<ชื่อไฟล์>`; ออนไลน์ใช้ Drive ID ในตารางหรือ runtimeUrl ใน manifest ห้ามฝัง Base64
- เขียนคำอธิบายหมายเลขใต้ภาพตามส่วนประกอบจริง ไม่เปลี่ยนหมายเลขในภาพ
- ภาพวงจรมีสวิตช์ปิด: แถบโลหะแนวนอนแตะขั้วทั้งสอง หลอดในภาพคำถามเป็นสีเทากลาง ๆ และเฉพาะ circuit-parts มีแสงตามสเปก
- ภาพระบบรดน้ำใช้①ถัง②ปั๊ม③ท่อ④ดิน/ต้นไม้⑤เซนเซอร์⑥ตัวควบคุม และ⑦จุดท่อหลุด ข้อมูลย้อนกลับชี้จากเซนเซอร์เข้าตัวควบคุม
- ตารางวัสดุตรวจครบ A20/0.3, B50/1, C80/2, D40/0.4, E55/0.8, F70/1.5 เกณฑ์0.5กก./60บาท
- ภาพกราฟตรวจ18/16/17 และ18/14 พร้อมเส้นเกณฑ์15 ไม่มีคำสรุปผ่าน/ไม่ผ่าน
- ดูภาพย่อ360pxที่ `assets/question-figs/QUESTION_FIGURES_MOBILE_PROOF.jpg` และ metadata/usage/hash ที่ `assets/question-figs/manifest.json`
- Promptจริงและประวัติการแก้ภาพอยู่ใน `assets/question-figs/GENERATION_HISTORY.json` ภาพต้นฉบับชุดที่เลือกอยู่ใน `assets/question-figs/source-sheets/`
- ตรวจสิทธิ์ Anyone with link: Reader และขนาดไฟล์บนDriveตรงกับไฟล์ในเครื่องครบ14รายการแล้ว
- สถานะ: เตรียมภาพและmappingครบ พร้อมให้AIอีกตัวผูกคำถาม ยังไม่ได้ปรับโจทย์หรือdeployจากงานสร้างภาพรอบนี้
