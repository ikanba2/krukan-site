# Prompt ปกเกม 5 เกมที่ยังไม่มีปกจริง · 24 ต.ค. 2569

> **ส่งให้ AI เจนทั้ง 5 ปกในรอบเดียว (AI ที่เปิดไฟล์ในเครื่องได้):** ให้ไปอ่านไฟล์ [AI_COVER_JOB.md](AI_COVER_JOB.md) ไฟล์เดียวพอ (มี prompt ทั้ง 5 เกม เส้นทาง ref ตามลำดับ และที่เซฟครบ) คำสั่งสั้นที่พิมพ์บอก AI:
>
> `อ่านไฟล์ C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\AI_COVER_JOB.md ให้ครบทั้งไฟล์ แล้วสร้างภาพปกทั้ง 5 ภาพตามนั้น แนบภาพอ้างอิงตามลำดับที่ระบุในแต่ละงาน เซฟตามเส้นทางที่ระบุ ไม่ต้องถามกลับ`
>
> ถ้า AI เปิดไฟล์ในเครื่องไม่ได้ ให้คัดลอก prompt จากไฟล์นี้ทีละเกมแทน แล้วแนบ ref ด้วยมือ (แก้ prompt ในไฟล์นี้แล้วรัน `python tools/games/covers/_make_ai_job.py` เพื่อสร้าง AI_COVER_JOB.md ใหม่)

เกมที่ยังใช้ปกชั่วคราว (ประกอบจากหน้าจอเกม) และรอภาพ AI: **ก้าวแรกของนักเขียนโปรแกรม (Techno Steps)** · **จัดโฟลเดอร์กับเทคโน (Techno Folder)** · **ช่างประกอบคอม (Techno Parts)** · **ช่างแบ่งพิซซ่า (Techno Slice)** · **ประโยคอังกฤษประจำวัน (Techno Talk)**
ทุก prompt ด้านล่าง **ครบในตัวเอง** คัดลอกทั้งกล่องไปวางได้เลย (ไม่ต้องต่อบล็อกสไตล์กลางจาก COVER_PROMPTS.md แล้ว) ชื่อภาษาไทยเป็นพระเอกของภาพ อยู่ซ้ายบน ใหญ่ที่สุด อ่านก่อนสิ่งอื่น ส่วนชื่ออังกฤษเป็นรอง

## 1) อัตราส่วนและขนาด

| รายการ | ค่า |
|---|---|
| **อัตราส่วน** | **16:9 แนวนอน** (การ์ดบนหน้า home ตั้ง `aspect-ratio:16/9`) |
| ขนาดที่ขอ | **1920×1080 px** (ขั้นต่ำ 1280×720) ไฟล์ PNG |
| ขนาดที่ผมใช้จริงบนเว็บ | ย่อเป็น 640×360 webp การ์ดที่ผู้เล่นเห็นกว้างราว 270 px จึง **ต้องอ่านชื่อไทยออกแม้ย่อเล็ก** (ตัวอักษรหนา ใหญ่ ขอบเข้ม) |
| Gemini / Imagen | เลือกสัดส่วน 16:9 ได้ตรง ๆ |
| Midjourney | ใส่ท้าย prompt `--ar 16:9` |
| ChatGPT (ให้ภาพ 3:2) | ใช้ได้ ผมจะตัดบนล่างด้านละราว 8% ดังนั้นชื่อไทยและตัวเอกต้องอยู่ในแถบกลาง 84% ของความสูง |

**พื้นที่ที่การ์ดบนเว็บทับ (ให้ภาพเบาตรงนี้):** มุมขวาบน กว้าง 25% สูง 40% (ป้าย NEW) · มุมซ้ายล่าง กว้าง 35% สูง 18% (ป้ายหมวด) · เว้นขอบทุกด้าน 4% **ชื่อไทยจึงวางซ้ายบน ไม่ล้ำไปมุมขวาบน**

## 2) เซฟภาพไว้ที่ไหน

โฟลเดอร์ที่ใช้เก็บภาพที่ AI เจนมา (สร้างไว้ให้แล้ว):

```
C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\generated-2026-10-24\
```

ตั้งชื่อไฟล์ตามนี้เป๊ะ ๆ (ตัวพิมพ์เล็ก ขีดกลาง):

| เกม | ชื่อไฟล์ที่เซฟ |
|---|---|
| ก้าวแรกของนักเขียนโปรแกรม | `techno-steps-cover.png` |
| จัดโฟลเดอร์กับเทคโน | `techno-folder-cover.png` |
| ช่างประกอบคอม | `techno-parts-cover.png` |
| ช่างแบ่งพิซซ่า | `techno-slice-cover.png` |
| ประโยคอังกฤษประจำวัน | `techno-talk-cover.png` |

เซฟครบทั้งหมดหรือเซฟแค่บางเกมก็ได้ แล้วบอกผม (หรือรัน `python tools/games/_covers_apply.py new` แล้วต่อด้วย `python tools/build-home-lite.py`) ระบบจะตัดเป็น 16:9 ย่อ 640×360 webp ใส่ `tools/games/covers/cover-<เกม>.webp` และเปลี่ยนการ์ดบนหน้า home ให้ทันที ข้ามเกมที่ยังไม่มีไฟล์

## 3) ภาพอ้างอิง (ref) ที่ต้องแนบ

โฟลเดอร์ `tools/games/covers/refs/<เกม>/` เปิดแล้วแนบ **ตามเลขลำดับ ref1 ref2 ...** พร้อม prompt (ทุก prompt เขียน "Reference images in order" ไว้ตรงกัน)

| เกม | โฟลเดอร์ ref | ไฟล์ |
|---|---|---|
| ก้าวแรกของนักเขียนโปรแกรม | `refs/techno-steps/` | ref1 ไรเดอร์ถือดาบยืน · ref2 ท่าฟัน · ref3 สิงโต · ref4 หมูป่า · ref5 แกะฟ้าผ่า · ref6 ปลากระเบน · ref7 ฉากซากเมืองกลางวัน |
| จัดโฟลเดอร์กับเทคโน | `refs/techno-folder/` | ref1 ไรเดอร์ยืน · ref2 ท่าฟัน · ref3 เห็ดยักษ์ · ref4 ฉากซากเมือง · ref5 หน้าต่างโฟลเดอร์ในเกม |
| ช่างประกอบคอม | `refs/techno-parts/` | ref1 ไรเดอร์ยืน · ref2 ท่าฟัน · ref3 โต๊ะประกอบเครื่องในเกม · ref4 กระดานเสียบสายในเกม |
| ช่างแบ่งพิซซ่า | `refs/techno-slice/` | ref1 ไรเดอร์ยืน · ref2 ท่าฟัน · ref3 หน้าตัดพิซซ่าในเกม · ref4 หน้าจับคู่พิซซ่าเศษส่วนในเกม |
| ประโยคอังกฤษประจำวัน | `refs/techno-talk/` | ref1 มาสไรเดอร์โบกมือ · ref2 ชูกำปั้นดีใจ · ref3 โยนบล็อกโค้ด · ref4 ชี้ · ref5 หน้าแรกของเกม (ใช้ดูโทนสีและเด็ก 4 คน) · ref6 หน้าจัดกลุ่ม · ref7 หน้าถามตอบ |

กติกาตัวละคร (ต้องตรงทุกภาพ): ไรเดอร์สวมหมวกเสมอ ห้ามเห็นหน้า (ช่องมองเรืองแสงปิดหน้าทั้งหมด) · สีเกราะเป็นสีมาเจนต้าดำเดิมตามภาพ ref · สัดส่วนชิบิ ราว 3 หัว · มีไรเดอร์ตัวเอกคนเดียวต่อภาพ

## 4) ถ้า AI สะกดชื่อไทยเพี้ยน (สำคัญ)

AI ส่วนใหญ่ยังสะกดภาษาไทยผิดบ่อย (สระลอย วรรณยุกต์หาย) ถ้าได้ภาพที่ตัวไทยเพี้ยน ให้ **สั่งใหม่ด้วยฉบับไม่มีตัวอักษร**: ในกล่อง prompt ให้ลบย่อหน้า `TEXT IN THE IMAGE ...` ทั้งย่อหน้า แล้วใส่ย่อหน้านี้แทน

```
NO TEXT AT ALL in the image. Leave the upper-left area (about 58% of the width and 38% of the height) as calm, low-detail sky/space, because the title will be added afterwards.
```

แล้วส่งภาพมา **ผมจะซ้อนชื่อไทยด้วยฟอนต์ Kanit หนาพร้อมขอบและเงา** ให้ตรงตามตัวสะกดทุกตัวอักษร (ชื่อไทยอ่านชัดแน่นอน)

---

## เกมที่ 1 · ก้าวแรกของนักเขียนโปรแกรม (Techno Steps) · ป.1–ป.6 วิทยาการคำนวณ

เซฟเป็น `tools/games/covers/generated-2026-10-24/techno-steps-cover.png` · แนบ `refs/techno-steps/ref1`–`ref7`

```
Reference images in order: 1 = the magenta-and-black armored rider standing with a sword (exact design match), 2 = the same rider's sword attack pose, 3 = lion monster, 4 = boar monster, 5 = ram monster, 6 = manta ray monster, 7 = background mood (sunny gear-city ruins).

FORMAT: landscape 16:9, 1920x1080, premium mobile-game key art / splash cover for a children's educational game.

TEXT IN THE IMAGE (the most important element, the first thing the eye reads): the Thai title «ก้าวแรกของนักเขียนโปรแกรม» in the upper left, on two lines: «ก้าวแรกของ» then «นักเขียนโปรแกรม». Huge extra-bold rounded Thai display lettering (Kanit Black / Prompt ExtraBold style), warm cream-yellow fill, thick dark navy outline and a soft orange drop shadow, about 55% of the image width, every vowel and tone mark clearly separated and spelled exactly as written here: ก้าวแรกของนักเขียนโปรแกรม. Directly under it, much smaller (about one third of the Thai title's height), the English subtitle «TECHNO STEPS» in chunky beveled game-logo letters (TECHNO golden yellow, STEPS white with blue glow). No other text, no watermark.

HERO: the armored rider exactly as in reference 1 (chibi, about 3 heads tall, fully helmeted, black helmet with two V-shaped horn antennae, round glowing ear pods, glowing visor that hides the face completely, magenta-and-black armor, split cape-coat tails, boots, sword). Only the pose, camera angle and lighting may change. Exactly one rider, large, on the left foreground, sword raised, standing on a floating grid of square pastel tiles that stretches to the right in perspective.

SCENE: a trail of big glowing command-arrow cards (right arrow, up arrow, a loop symbol) lies on the tiles like stepping stones leading to a red goal flag on the far side, with three golden stars hovering along the path. The lion and the ram (references 3 and 5) guard the path on the right, a small boar (reference 4) in the middle ground, the manta ray (reference 6) floats in the sky. Sunny blue sky, soft white clouds, golden gear ruins in the distance (reference 7). Playful, welcoming, never scary.

STYLE: bright vivid saturated colors, clean cel-shaded anime look with confident dark ink outlines, glossy metallic armor highlights, soft volumetric light, painted background with depth, dynamic diagonal composition, one clear focal subject, a bold silhouette that still reads when shrunk to 270x152 pixels.
SAFE ZONES: keep the top-right corner (25% width x 40% height) and the bottom-left corner (35% width x 18% height) calm and low-detail; keep a 4% safe margin on all edges.
AVOID: photorealism, plastic toy look, crowds, extra heroes, gore, real brand logos, any text other than the two titles above.
```

---

## เกมที่ 2 · จัดโฟลเดอร์กับเทคโน (Techno Folder) · ป.2–ป.3 ฝึกใช้คอมพิวเตอร์

เซฟเป็น `tools/games/covers/generated-2026-10-24/techno-folder-cover.png` · แนบ `refs/techno-folder/ref1`–`ref5`

```
Reference images in order: 1 = the magenta-and-black armored rider standing with a sword (exact design match), 2 = the same rider's sword attack pose, 3 = giant mushroom monster, 4 = background mood (sunny gear-city ruins), 5 = the in-game folder window UI (use it for the look of the yellow folders and the file icons).

FORMAT: landscape 16:9, 1920x1080, premium mobile-game key art / splash cover for a children's educational game.

TEXT IN THE IMAGE (the most important element, the first thing the eye reads): the Thai title «จัดโฟลเดอร์กับเทคโน» in the upper left, on two lines: «จัดโฟลเดอร์» then «กับเทคโน». Huge extra-bold rounded Thai display lettering (Kanit Black / Prompt ExtraBold style), warm cream-yellow fill, thick dark navy outline and a soft orange drop shadow, about 55% of the image width, every vowel and tone mark clearly separated and spelled exactly as written here: จัดโฟลเดอร์กับเทคโน. Directly under it, much smaller (about one third of the Thai title's height), the English subtitle «TECHNO FOLDER» in chunky beveled game-logo letters (TECHNO golden yellow, FOLDER white with blue glow). No other text, no watermark.

HERO: the armored rider exactly as in reference 1 (chibi, about 3 heads tall, fully helmeted, black helmet with two V-shaped horn antennae, round glowing ear pods, glowing visor that hides the face completely, magenta-and-black armor, split cape-coat tails, boots, sword). Only the pose, camera angle and lighting may change. Exactly one rider, large, on the left foreground with the sword raised, standing in front of a big floating glowing folder window (clean white and blue, with a row of yellow folder icons like reference 5).

SCENE: paper-like file icons (a document with blue lines, a picture with a green hill, a music note, a video play button) fly in a swirling sparkling trail from a messy heap on the right into the open yellow folders. The giant mushroom monster (reference 3) sits in the heap of scattered messy files on the right, looking annoyed but funny. Sunny sky, soft clouds and golden gear ruins far behind (reference 4). Playful, welcoming, never scary.

STYLE: bright vivid saturated colors, clean cel-shaded anime look with confident dark ink outlines, glossy metallic armor highlights, soft volumetric light, painted background with depth, dynamic diagonal composition, one clear focal subject, a bold silhouette that still reads when shrunk to 270x152 pixels.
SAFE ZONES: keep the top-right corner (25% width x 40% height) and the bottom-left corner (35% width x 18% height) calm and low-detail; keep a 4% safe margin on all edges.
AVOID: photorealism, plastic toy look, crowds, extra heroes, gore, real brand logos or real operating-system logos, any text other than the two titles above (file icons carry no letters).
```

---

## เกมที่ 3 · ช่างประกอบคอม (Techno Parts) · ป.2–ป.4 อุปกรณ์คอมพิวเตอร์

เซฟเป็น `tools/games/covers/generated-2026-10-24/techno-parts-cover.png` · แนบ `refs/techno-parts/ref1`–`ref4`

```
Reference images in order: 1 = the magenta-and-black armored rider standing with a sword (exact design match), 2 = the same rider's sword attack pose, 3 = the in-game build board (cartoon computer parts, rounded candy-style UI), 4 = the in-game back-panel ports board.

FORMAT: landscape 16:9, 1920x1080, premium mobile-game key art / splash cover for a children's educational game.

TEXT IN THE IMAGE (the most important element, the first thing the eye reads): the Thai title «ช่างประกอบคอม» in the upper left, one huge line. Extra-bold rounded Thai display lettering (Kanit Black / Prompt ExtraBold style), cream-white fill with a teal-to-gold gradient, thick dark navy outline and a soft teal drop shadow, about 50% of the image width, every vowel and tone mark clearly separated and spelled exactly as written here: ช่างประกอบคอม. Directly under it, much smaller (about one third of the Thai title's height), the English subtitle «TECHNO PARTS» in chunky beveled game-logo letters (glossy teal and gold). No other text, no watermark.

HERO: the armored rider exactly as in reference 1 (chibi, about 3 heads tall, fully helmeted, black helmet with two V-shaped horn antennae, round glowing ear pods, glowing visor that hides the face completely, magenta-and-black armor, split cape-coat tails, boots, sword). Only the pose, camera angle and lighting may change. Exactly one rider, large, on the left foreground holding the sword like a screwdriver-hero, friendly confident pose.

SCENE: warm cheerful daytime workshop. On the right a big friendly cartoon desktop computer case stands open on a wooden workbench, with colorful parts floating around it: a CPU chip, a green RAM stick, an SSD, a graphics card with two fans, a monitor, a keyboard, a mouse and neat colored cables (HDMI, USB, green and pink audio jacks, LAN) taking their places with little sparkles. Shelves of tools in the soft sunlit background; a small cute monster peeks from behind the case. Match the rounded cartoon look of references 3 and 4.

STYLE: bright vivid saturated colors, rounded cartoon shapes with thick dark-navy outlines, clean cel-shaded look, glossy highlights, soft light, painted depth, dynamic diagonal composition, one clear focal subject, a bold silhouette that still reads when shrunk to 270x152 pixels.
SAFE ZONES: keep the top-right corner (25% width x 40% height) and the bottom-left corner (35% width x 18% height) calm and low-detail; keep a 4% safe margin on all edges.
AVOID: photorealism, plastic toy look, crowds, extra heroes, gore, real brand logos (no Intel / NVIDIA / Windows marks), any text other than the two titles above (the computer parts carry no letters).
```

---

## เกมที่ 4 · ช่างแบ่งพิซซ่า (Techno Slice) · ป.4 เศษส่วน

เซฟเป็น `tools/games/covers/generated-2026-10-24/techno-slice-cover.png` · แนบ `refs/techno-slice/ref1`–`ref4`

```
Reference images in order: 1 = the magenta-and-black armored rider standing with a sword (exact design match), 2 = the same rider's sword attack pose, 3 = the in-game pizza on a plate being cut into equal slices, 4 = the in-game pizzas shaded to show fractions with fraction cards.

FORMAT: landscape 16:9, 1920x1080, premium mobile-game key art / splash cover for a children's math game.

TEXT IN THE IMAGE (the most important element, the first thing the eye reads): the Thai title «ช่างแบ่งพิซซ่า» in the upper left, one huge line. Extra-bold rounded Thai display lettering (Kanit Black / Prompt ExtraBold style), cream-white fill with a tomato-red to golden-orange gradient, thick dark brown outline and a soft red drop shadow, about 50% of the image width, every vowel and tone mark clearly separated and spelled exactly as written here: ช่างแบ่งพิซซ่า. Directly under it, much smaller (about one third of the Thai title's height), the English subtitle «TECHNO SLICE» in chunky beveled game-logo letters (glossy tomato red and gold). No other text, no watermark.

HERO: the armored rider exactly as in reference 1 (chibi, about 3 heads tall, fully helmeted, black helmet with two V-shaped horn antennae, round glowing ear pods, glowing visor that hides the face completely, magenta-and-black armor, split cape-coat tails, boots, sword). Only the pose, camera angle and lighting may change; a tiny chef scarf is allowed. Exactly one rider, large, on the left foreground, the sword slicing a pizza with a bright sparkle line.

SCENE: warm sunny pizzeria. On the right a big round pizza cut into 8 equal slices with 3 slices lifted out and floating with melted-cheese strings, more pizzas and a chocolate bar divided into equal parts around it, and round white badges showing the fractions 3/8, 1/4 and 5/12 (digits only, big and clean). Red-and-white checkered cloth and a wooden counter in the background, a cute monster peeking over the counter with a pizza slice in its hands.

STYLE: bright warm saturated colors, cartoon cel-shaded look with thick dark-brown outlines, glossy highlights, soft golden light, painted depth, dynamic diagonal composition, one clear focal subject, a bold silhouette that still reads when shrunk to 270x152 pixels.
SAFE ZONES: keep the top-right corner (25% width x 40% height) and the bottom-left corner (35% width x 18% height) calm and low-detail; keep a 4% safe margin on all edges.
AVOID: photorealism, plastic toy look, crowds, extra heroes, gore, real pizza-brand logos, any text other than the Thai and English titles and the three fraction badges.
```

---

## เกมที่ 5 · ประโยคอังกฤษประจำวัน (Techno Talk) · อนุบาล–ป.3 ภาษาอังกฤษ

เซฟเป็น `tools/games/covers/generated-2026-10-24/techno-talk-cover.png` · แนบ `refs/techno-talk/ref1`–`ref7` (ref1–4 คือมาสไรเดอร์หลายท่าจาก Google Drive โฟลเดอร์ `krukan/Pic` ใช้ดีไซน์เดียวกับในเกม)

```
Reference images in order: 1 = the magenta-and-black armored rider mascot waving (exact design match), 2 = the same rider cheering with a raised fist, 3 = the same rider juggling glowing code blocks, 4 = the same rider pointing, 5 = the game's title screen (use it for the meadow, the sky color palette and the four cute round-faced kids), 6 = the game's sorting board, 7 = the game's quiz screen.

FORMAT: landscape 16:9, 1920x1080, premium mobile-game key art / splash cover for a cheerful English-speaking game for kindergarten to grade 3 children.

TEXT IN THE IMAGE (the most important element, the first thing the eye reads): the Thai title «ประโยคอังกฤษประจำวัน» in the upper left, on two lines: «ประโยคอังกฤษ» then «ประจำวัน». Huge extra-bold rounded Thai display lettering (Kanit Black / Prompt ExtraBold style), cream-white fill with a pink-to-violet gradient, thick dark indigo outline and a soft pink drop shadow, about 55% of the image width, every vowel and tone mark clearly separated and spelled exactly as written here: ประโยคอังกฤษประจำวัน. Directly under it, much smaller (about one third of the Thai title's height), the English subtitle «TECHNO TALK» in chunky beveled game-logo letters (TECHNO pink-gold, TALK sky-blue and white). The only other text allowed: four small speech bubbles that read exactly "I am Tom." "You are Mei." "He is Ben." "She is Anna." in clean bold letters. No watermark.

HERO: the armored rider mascot exactly as in references 1 to 4 (chibi, about 3 heads tall, fully helmeted, black helmet with two V-shaped horn antennae, round glowing ear pods, glowing visor that hides the face completely, magenta-and-black armor, split cape-coat tails, boots). Exactly one rider, large, waving cheerfully on the left foreground (pose like reference 1); the same rider may not appear twice.

SCENE: bright sunny meadow with soft clouds and a smiling sun. In the middle-bottom four cute round-faced kids stand in a row (two boys, two girls, different hair, colorful shirts) as in reference 5, each with a speech bubble above (the four sentences above). Floating colorful alphabet blocks and sparkles drift around, a few big letters A B C in candy colors. On the right a small glowing speech-bubble icon and a tiny sound-wave symbol hint that the game talks. Joyful, welcoming, very friendly for little children, nothing scary.

STYLE: bright vivid saturated colors with a candy-pastel meadow, clean vector-like cel-shaded look with thick dark-indigo outlines (match the kids in reference 5), glossy metallic armor highlights, soft light, depth with rolling hills, one clear focal subject, a bold silhouette that still reads when shrunk to 270x152 pixels.
SAFE ZONES: keep the top-right corner (25% width x 40% height) and the bottom-left corner (35% width x 18% height) calm and low-detail (the sun may sit at the top right but stay soft); keep a 4% safe margin on all edges.
AVOID: photorealism, plastic toy look, crowds beyond the four kids, a second rider, gore, real brand logos, any text other than the Thai title, the English subtitle and the four speech-bubble sentences.
```

---

## ถ้าผลลัพธ์ไม่ตรง

- ชื่อไทยเพี้ยน: ใช้ฉบับไม่มีตัวอักษร (ข้อ 4) แล้วส่งภาพมา ผมซ้อนชื่อไทยให้
- ไรเดอร์เห็นหน้า/ถอดหมวก: เติมท้าย prompt `the helmet is locked on, a glowing visor covers the face completely`
- ไรเดอร์ผิดสี: เติม `armor colors must match reference image 1 exactly: magenta and black with white trim`
- สัดส่วนผู้ใหญ่: เติม `chibi super-deformed proportions, big head, short legs, about 3 heads tall`
- ย่อเป็น 270 px แล้วอ่านชื่อไม่ออก: เติม `make the Thai title 25% bigger with an even thicker outline`
- ชื่อไทยล้ำไปมุมขวาบน: เติม `keep the title strictly inside the left 60% of the image`
