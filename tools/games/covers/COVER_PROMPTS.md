# Prompt ทำปกเกม (9 เกม) · 23–24 ต.ค. 2569

> **ปกที่ยังต้องการภาพ AI จริง (Steps, Folder, Parts, Slice, Talk) ให้ใช้ไฟล์ [COVER_PROMPTS_5_NEW_GAMES.md](COVER_PROMPTS_5_NEW_GAMES.md)** prompt ครบในตัว ชื่อไทยนำหน้า ระบุอัตราส่วน ref และที่เซฟ (หัวข้อ 8–12 ด้านล่างเป็นฉบับเก่าที่ชื่อโลโก้เป็นอังกฤษอย่างเดียว)


## อัตราส่วนและขนาด

| รายการ | ค่า |
|---|---|
| **อัตราส่วนที่ต้องการ** | **16:9 แนวนอน** (การ์ดบนหน้า home ตั้งค่า `aspect-ratio:16/9` และตัดภาพแบบ cover) |
| ขนาดที่ขอจากเครื่องมือ | 1920×1080 (ขั้นต่ำ 1280×720) |
| ขนาดที่ใช้จริงบนเว็บ | ผมจะย่อเป็น 640×360 webp (เดิม 640×400 ถูกการ์ดตัดเป็น 16:9 อยู่แล้ว) |
| ขนาดที่ผู้เล่นเห็นจริง | การ์ดกว้างราว 270 px สูงราว 152 px ดังนั้นต้องมีตัวเอกชัดเจนหนึ่งจุด เส้นขอบหนา อ่านออกแม้ย่อเล็ก |

ถ้าเครื่องมือเลือก 16:9 ไม่ได้:
- Midjourney ใส่ `--ar 16:9`, Gemini/Imagen เลือก 16:9 ได้ตรง ๆ
- ChatGPT ให้ได้ 3:2 (1536×1024): ผมจะตัดบนล่างออกราวร้อยละ 8 ต่อด้าน ดังนั้นของสำคัญต้องอยู่ในแถบกลางร้อยละ 84 ของความสูง
- ภาพ 7:4 (1792×1024) ตัดแทบไม่เสียอะไร

**พื้นที่ที่ต้องเว้นว่าง (มีป้ายของการ์ดทับ):**
- มุมขวาบน กว้างราวร้อยละ 25 สูงราวร้อยละ 40: ป้าย NEW รูปดาวระเบิดทับอยู่ ให้เป็นฉากโล่งไม่มีรายละเอียดสำคัญ
- มุมซ้ายล่าง กว้างราวร้อยละ 35 สูงราวร้อยละ 18: ป้ายหมวด (ดิจิทัล/เขียนโค้ด) ทับอยู่
- ขอบทั้งสี่ด้านเว้นราวร้อยละ 4 เพราะเอาเมาส์ชี้แล้วภาพซูม 1.08 เท่า

## วิธีใช้

1. เปิดโฟลเดอร์ `tools/games/covers/refs/<ชื่อเกม>/` แล้วแนบภาพอ้างอิงตามเลขลำดับ (ref1, ref2, ...) พร้อมกับ prompt
2. วาง **บล็อกสไตล์กลาง** ก่อน แล้วต่อด้วย prompt ของเกมนั้น
3. ได้ภาพแล้วส่งมา ผมจะตัดเป็น 16:9 ย่อเป็น webp ใส่ลง `tools/games/covers/` แล้วอัปเดตหน้า home ให้

ภาพอ้างอิงทั้งหมดเป็นภาพจริงที่ใช้ในเกม แปลงจากโฟลเดอร์ต้นทาง `C:\Users\ikan\Documents\Codex\2026-10-06\https-maskrider-techno-story-ikanba-chatgpt\work\work\site\dist\assets` (ชุดภาพเกม Techno Dimension) โดยตัดขอบ วางบนพื้นเทาอ่อนเรียบ (เพราะเครื่องมือหลายตัวแปลงพื้นโปร่งใสเป็นสีดำจนตัวละครกลืนหาย) และขยายให้ใหญ่พอ ชื่อไฟล์เดิมคือ `hero-anim-<ร่าง>-<เฟรม>.webp`, `bg-<เลข>.webp`, `monster-anim-<เลข>-0.webp`

ตัวละครหลักใช้ไรเดอร์ **ชิบิตามสไปรต์ในเกม** ไม่ใช่ฉบับสัดส่วนผู้ใหญ่ในนิยาย เพื่อให้ปกตรงกับตัวที่ผู้เล่นเจอในเกม (ถ้าอยากได้ฉบับจริงจังภายหลัง ชีตออกแบบอยู่ที่ `นิยายมังงะ_มาสไรเดอร์เทคโน/แผนภาพและCharacterAssets/assets-v4/C02-techno-base.png`)

---

## บล็อกสไตล์กลาง (วางไว้หน้า prompt ของทุกเกม)

```
Premium mobile-game key art / splash cover, landscape 16:9. Bright, vivid, saturated colors, clean cel-shaded anime look with confident dark ink outlines, glossy metallic armor highlights, soft volumetric light, painted background with depth and atmospheric perspective, dynamic diagonal composition, one clear focal subject with a bold readable silhouette that still reads when shrunk to 270x152 pixels.
The hero is the armored rider from the attached character reference images: a chibi-proportioned (about 3 heads tall) fully helmeted armored hero. The face is NEVER visible: black helmet with two V-shaped horn antennae, round glowing ear pods and a glowing visor. Keep the helmet, armor plates, split cape-coat tails, boots and sword design and the exact armor color scheme identical to the reference; only the pose, camera angle and lighting may change. Exactly one rider in the picture.
Keep the top-right corner (about 25% of the width and 40% of the height) and the bottom-left corner (about 35% of the width and 18% of the height) calm and low-detail, and keep a 4% safe margin on all edges.
The only text allowed is the game title logo described below, in chunky beveled game-logo lettering. No other words, no watermark, no real brand logos, no photorealism, no plastic toy look, no crowd, no extra heroes, no gore.
```

---

## 1. NET PATROL · สายตรวจเน็ต (ม.1–ม.3 รู้เท่าทันออนไลน์)

**ภาพอ้างอิง** `tools/games/covers/refs/net-patrol/`
- `ref1-rider-gold-f0.png` ไรเดอร์ร่างทอง ท่ายืน (ใช้เป็นตัวหลัก ดีไซน์ต้องตรงตัวนี้)
- `ref2-rider-gold-f11.png` ท่าฟันไปข้างหน้า (ใช้ดูท่าและดาบสายฟ้า)
- `ref3-bg-sunny-desert-gears.jpg` ฉากท้องฟ้าสดใส เมฆขาว ซากเฟืองทอง (ใช้เป็นบรรยากาศและโทนสี)

```
Reference images in order: 1 = gold rider character design (exact match), 2 = gold rider slash pose, 3 = background mood.
Cover for the educational game "NET PATROL", about spotting scam messages, phishing links and fake pop-ups. The gold-and-black armored rider leaps forward at the left-center in a mid-air slash, his golden lightning sword cutting a glowing fake message card in half; the card has a red border, a fish-hook icon and a warning triangle and bursts into pixel shards and golden sparks. In a swirling arc around him float holographic phone message cards and pop-up windows: the scam ones have red borders and warning or hook icons, the safe ones have green borders and check marks; all card contents are abstract colored bars and icons with no readable words. Behind the rider a huge translucent holographic shield with a magnifying-glass emblem glows in cyan. Background in the style of reference 3: sunny blue sky with big white clouds and ancient golden gear ruins on the horizon, warm sunlight from the top-left. Palette: gold, sky blue and white with red warning accents. Title logo "NET PATROL" on two stacked lines at the top-left, exact spelling N-E-T and P-A-T-R-O-L, cream letters with navy outline and a gold lower edge.
```

## 2. PACKET EXPRESS · ไปรษณีย์ข้อมูล (ม.1–ม.3 เครือข่ายและอินเทอร์เน็ต)

**ภาพอ้างอิง** `tools/games/covers/refs/packet-express/`
- `ref1-rider-blue-f0.png` ไรเดอร์ร่างฟ้าน้ำแข็ง ท่ายืน (ตัวหลัก)
- `ref2-rider-blue-f9.png` ท่าพุ่งวิ่งเร็ว (ดูท่าทาง)
- `ref3-bg-ice-sky-castle.jpg` ปราสาทน้ำแข็งลอยฟ้า เมฆขาว (บรรยากาศและโทนสี)

```
Reference images in order: 1 = ice-blue rider character design (exact match), 2 = dash pose, 3 = background mood.
Cover for the educational game "PACKET EXPRESS", about sending data packets through routers to the right server. The ice-blue-and-black armored rider dashes from left to right along a glowing neon-cyan data rail that crosses the middle of the picture like a delivery courier, with speed streaks behind him. A stream of cute glowing parcel boxes (data packets) in orange, green, pink and yellow fly beside him with light trails. Ahead, the rail splits at a chunky router junction box with a big lever switch and blinking indicator lights; one branch is lit and leads to a crystal server tower standing on a floating sky island. Background in the style of reference 3: bright white-blue floating ice castles and sky islands among clouds, airy and cheerful, with the warm orange and yellow of the packets as contrast. Palette: ice blue, white, cyan with orange accents. Title logo "PACKET EXPRESS" on two stacked lines at the top-left, exact spelling P-A-C-K-E-T and E-X-P-R-E-S-S, white letters with deep blue outline and a cyan lower edge.
```

## 3. BUG BUSTER · จับบั๊กโค้ด (ม.2–ม.3 วิทยาการคำนวณ)

**ภาพอ้างอิง** `tools/games/covers/refs/bug-buster/`
- `ref1-rider-red-f0.png` ไรเดอร์ร่างแดง ท่ายืน (ตัวหลัก)
- `ref2-rider-red-f11.png` ท่าก้าวฟันดาบใหญ่ (ดูท่าและดาบ)
- `ref3-bg-sunset-waterfall-valley.jpg` หุบเขาน้ำตกยามอาทิตย์ตก (บรรยากาศและโทนสี)
- `ref4-monster-blue-beetle.png` ด้วงคริสตัลฟ้า (ตัว "บั๊ก" ตัวใหญ่)
- `ref5-monster-fire-lizard.png` กิ้งก่าไฟ (บั๊กตัวรอง)
- `ref6-monster-leaf-mushroom.png` เห็ดคริสตัลใบไม้ (บั๊กตัวรอง)

```
Reference images in order: 1 = red rider character design (exact match), 2 = lunge pose with the red greatsword, 3 = background mood, 4 = blue crystal beetle monster, 5 = fire lizard monster, 6 = leaf mushroom monster.
Cover for the educational game "BUG BUSTER", about finding the faulty line in Python code and fixing it. The crimson-and-black armored rider is in a powerful forward lunge at the left-center, swinging his red serrated greatsword at a giant glowing blue crystal beetle (monster 4) that is glitching apart into green pixel fragments, a literal software bug. Two smaller bug monsters (fire lizard 5 and leaf mushroom 6) scramble away in the mid-ground. Floating in the air between the rider and the beetle are translucent holographic code panels showing several lines of colorful syntax-highlighted code; one line is highlighted in red with a small bug icon. The code is abstract colored text bars and simple symbols such as ( ) { } = with no readable words. Background in the style of reference 3: golden-hour valley with waterfalls and floating crystal rocks, warm orange and pink sky. Palette: crimson, gold, teal and sunset orange. Title logo "BUG BUSTER" on two stacked lines at the top-left, exact spelling B-U-G and B-U-S-T-E-R, cream letters with dark red outline and an orange lower edge.
```

## 4. CODE RUNNER · เกมสั่งการ Techno (ม.1 วิทยาการคำนวณ)

**ภาพอ้างอิง** `tools/games/covers/refs/code-runner/`
- `ref1-rider-magenta-f0.png` ไรเดอร์ร่างฐาน ดำเงินชมพูแมเจนตา ท่ายืน (ตัวหลัก)
- `ref2-rider-magenta-f3.png` ท่าวิ่ง
- `ref3-bg-purple-cyber-city.jpg` เมืองไซเบอร์ยามค่ำ ดาวเคราะห์ใหญ่ (บรรยากาศและโทนสี)
- `ref4-monster-crystal-drone.png` โดรนคริสตัล
- `ref5-monster-ice-jelly.png` ก้อนเจลน้ำแข็ง

```
Reference images in order: 1 = magenta-and-black rider character design (exact match), 2 = running pose, 3 = background mood, 4 = crystal drone monster, 5 = ice jelly monster.
Cover for the educational game "CODE RUNNER", about programming a hero with command blocks (sequence, loops, conditions) to run through levels. The magenta-and-black armored rider sprints at full speed from left to right along a glowing track made of large lit-up command tiles carrying icons (a forward arrow, a jump arrow, a circular loop symbol, a repeat counter); the tiles light up in sequence behind him. He is about to leap over a hovering crystal drone (monster 4) and an ice jelly (monster 5). Above, colorful rounded puzzle blocks like Scratch code blocks float and snap together in the sky. Background in the style of reference 3: neon cyber city at dusk with a huge planet and a moon, speed lines, rim light on the rider. Palette: deep purple, magenta, cyan neon with yellow accents, high contrast so it stays readable when small. Title logo "CODE RUNNER" on two stacked lines at the top-left, exact spelling C-O-D-E and R-U-N-N-E-R, white letters with dark purple outline and a magenta lower edge.
```

## 5. TECHNO GRID · เขาวงกตสั่งโค้ด (ม.1–ม.3 วิทยาการคำนวณ)

**ภาพอ้างอิง** `tools/games/covers/refs/techno-grid/`
- `ref1-rider-magenta-f0.png` ไรเดอร์ร่างฐาน ท่ายืน (ตัวหลัก)
- `ref2-rider-magenta-f11.png` ท่าก้าวฟัน
- `ref3-bg-clockwork-hall.jpg` ห้องโถงเฟืองนาฬิกาทอง (บรรยากาศและโทนสี)
- `ref4-monster-crystal-drone.png` โดรนคริสตัล (ผู้เฝ้าเขาวงกต)

```
Reference images in order: 1 = magenta-and-black rider character design (exact match), 2 = lunge pose, 3 = background mood, 4 = crystal drone monster.
Cover for the educational game "TECHNO GRID", a maze game where the player writes code to guide the hero through a grid maze to collect energy crystals. Over-the-shoulder low-angle composition: the magenta-and-black armored rider stands large in the left foreground on the edge of a glowing neon circuit-board maze floor that spreads away to the right in strong perspective, with raised glowing walls and a cyan waypoint trail winding through it toward a big pink energy crystal on a pedestal at the center. A crystal drone (monster 4) patrols a corridor. Above the maze, holographic code blocks (colored rounded puzzle pieces with arrow icons) float and stack. Background in the style of reference 3: a golden clockwork hall with huge gears and an astrolabe, soft bokeh. Palette: warm gold and navy with magenta and cyan neon accents. Title logo "TECHNO GRID" on two stacked lines at the top-left, exact spelling T-E-C-H-N-O and G-R-I-D, white letters with navy outline and a gold lower edge.
```

## 6. CIPHER BREAKER · แกะรหัสซีซาร์ (ม.2–ม.3 ความปลอดภัยข้อมูล)

**ภาพอ้างอิง** `tools/games/covers/refs/cipher-breaker/`
- `ref1-rider-blue-f0.png` ไรเดอร์ร่างฟ้าน้ำแข็ง ท่ายืน (ตัวหลัก)
- `ref2-rider-blue-f11.png` ท่าก้าวฟัน
- `ref3-bg-blue-mirror-hall.jpg` ห้องโถงกระจกสีน้ำเงิน (บรรยากาศและโทนสี)
- `ref4-monster-dark-mage.png` จอมเวทมืด (บอส)
- `ref5-monster-ice-knight.png` อัศวินน้ำแข็ง
- `ref6-monster-ice-spirit.png` วิญญาณน้ำแข็ง

```
Reference images in order: 1 = ice-blue rider character design (exact match), 2 = lunge pose, 3 = background mood, 4 = dark mage boss, 5 = ice knight, 6 = ice spirit.
Cover for the educational game "CIPHER BREAKER", about cracking Caesar ciphers with a rotating cipher wheel. A giant glowing brass-and-cyan Caesar cipher wheel, two concentric rings engraved with stylized capital letters A to Z with the outer ring slightly rotated, hovers behind the rider as a huge circular hologram with beams of light and a golden padlock and key motif at its center. The ice-blue-and-black armored rider stands in the left foreground in a three-quarter view with his glowing ice sword raised, scanning. On the right the cloaked dark mage boss (monster 4) looms with floating encrypted letter blocks around him, while an ice knight (5) and an ice spirit (6) approach. Scattered glowing letter tiles drift through the air. Background in the style of reference 3: a tall blue mirror hall with glowing arches. Palette: deep blue, cyan, brass gold with violet accents. Title logo "CIPHER BREAKER" on two stacked lines at the top-left, exact spelling C-I-P-H-E-R and B-R-E-A-K-E-R, white letters with navy outline and a cyan lower edge.
```

## 7. TYPE HERO · ฝึกพิมพ์ไทย-อังกฤษ (ทุกระดับชั้น)

**ภาพอ้างอิง** `tools/games/covers/refs/type-hero/`
- `ref1-rider-magenta-f0.png` ไรเดอร์ร่างฐาน ท่ายืน (ตัวหลัก)
- `ref2-rider-magenta-f12.png` ท่าฟันกวาด
- `ref3-bg-storm-cloud-sky.jpg` ท้องฟ้าเมฆพายุสายฟ้า (บรรยากาศและโทนสี)

```
Reference images in order: 1 = magenta-and-black rider character design (exact match), 2 = sweeping slash pose, 3 = background mood.
Cover for the educational game "TYPE HERO", a Thai and English typing practice game. Giant glossy 3D keyboard keycaps with bold single capital letters such as A, S, D, F and one large ENTER key form a staircase of platforms rising through storm clouds. The magenta-and-black armored rider leaps along the keycaps at the center-left, his sword sweeping in a bright arc; every slash sprays glowing letters (A, K, T, Z) into the air like sparks and electric lightning. Keycap legends use only simple Latin capital letters, nothing else. Background in the style of reference 3: dramatic blue and violet storm clouds with lightning and light rays breaking through. Palette: violet, electric blue, magenta with white-yellow lightning, high contrast so it stays readable when small. Title logo "TYPE HERO" on two stacked lines at the top-left, exact spelling T-Y-P-E and H-E-R-O, white letters with deep purple outline and a magenta lower edge.
```

---

## 8. TECHNO STEPS · ก้าวแรกนักเขียนโปรแกรม (ป.1–ป.6 วิทยาการคำนวณ)

ปกชั่วคราวที่ใช้อยู่ตอนนี้ตัดมาจากหน้าแรกของเกม (ไรเดอร์ดาบ + มอนสเตอร์ 4 ตัว) ถ้าได้ภาพ AI แล้วให้แทนที่ `cover-techno-steps` ใน `tools/games/_covers_apply.py` (เพิ่มรายการ `('techno-steps', 'techno-steps', 'techno-steps')`)

**ภาพอ้างอิง** `tools/games/covers/refs/techno-steps/`
- `ref1-rider-sword-ready.png` ไรเดอร์ถือดาบ ท่ายืน (ตัวหลัก ใช้สีชมพูแมเจนตาเดิม)
- `ref2-rider-sword-attack.png` ท่าฟัน
- `ref3-monster-lion.png` สิงโตแผงสีส้ม · `ref4-monster-boar.png` หมูป่าเกราะใบไม้ · `ref5-monster-ram.png` แกะฟ้าผ่า · `ref6-monster-manta.png` ปลากระเบนออโรรา (มอนสเตอร์ในเกม ใช้ 3-4 ตัวก็พอ)
- `ref7-bg-sunny-ruins.jpg` ซากเมืองเฟืองยามกลางวัน ท้องฟ้าสดใส (บรรยากาศและโทนสี)

```
Reference images in order: 1 = magenta-and-black armored rider with sword (exact match), 2 = sword attack pose, 3 = lion monster, 4 = boar monster, 5 = ram monster, 6 = manta monster, 7 = background mood.
Cover for the children's educational game "TECHNO STEPS", where kids line up arrow command cards to walk a hero across a tile grid to a red flag, collecting stars and slashing monsters. Bright daytime scene: the magenta-and-black armored rider stands large on the left foreground, sword raised, on a floating grid of square pastel tiles that stretches to the right in perspective. A trail of big glowing arrow cards (right arrow, up arrow, a loop symbol) lies on the tiles like stepping stones leading to a red flag on the far side, with three golden stars hovering along the path. The lion and the ram (monsters 3 and 5) guard the path on the right, a small boar (monster 4) in the middle ground. Sunny blue sky, soft white clouds and golden gear ruins in the distance. Playful, welcoming, not scary. Title logo "TECHNO STEPS" in chunky beveled lettering: TECHNO in golden yellow with orange glow, STEPS in white with blue glow, placed in the upper left
```

## 9. TECHNO FOLDER · จัดโฟลเดอร์กับเทคโน (ป.2–ป.3 ฝึกใช้คอม)

ปกชั่วคราวที่ใช้อยู่ตอนนี้ประกอบจากภาพหน้าต่างโฟลเดอร์ในเกม + ไรเดอร์ + เห็ดยักษ์ ถ้าได้ภาพ AI แล้วให้เพิ่มรายการ `('techno-folder', 'techno-folder', 'techno-folder')` ใน `tools/games/_covers_apply.py` แล้วรันใหม่

**ภาพอ้างอิง** `tools/games/covers/refs/techno-folder/`
- `ref1-rider-sword-ready.png` ไรเดอร์ถือดาบ ท่ายืน (ตัวหลัก ใช้สีชมพูแมเจนตาเดิม) · `ref2-rider-sword-attack.png` ท่าฟัน
- `ref3-monster-mushroom-titan.png` เห็ดยักษ์ (ตัวรกที่ทำให้ไฟล์กระจัดกระจาย)
- `ref4-bg-sunny-ruins.jpg` ซากเมืองเฟืองยามกลางวัน (บรรยากาศและโทนสี)
- `ref5-game-window.png` หน้าต่างโฟลเดอร์ในเกม (ให้หน้าตาโฟลเดอร์สีเหลืองและไอคอนไฟล์คล้ายของจริง)

```
Reference images in order: 1 = magenta-and-black armored rider with sword (exact match), 2 = sword attack pose, 3 = mushroom giant monster, 4 = background mood, 5 = the in-game folder window UI (use for the look of the yellow folders and the file icons).
Cover for the children's educational game "TECHNO FOLDER", where kids tidy files into folders on a Windows-style desktop. Bright daytime scene: the magenta-and-black armored rider stands large on the left foreground with the sword raised, in front of a big floating glowing folder window (clean white and blue, with a yellow folder icon row like reference 5). Paper-like file icons (a document with blue lines, a picture with a green hill, a music note, a video play button) fly in a swirling trail from the mess on the right into the open yellow folders, sparkling as they land. The mushroom giant (monster 3) sits on the right in a heap of scattered messy files, looking annoyed. Sunny sky, soft clouds and golden gear ruins far behind. Playful, welcoming, not scary. Title logo "TECHNO FOLDER" in chunky beveled lettering: TECHNO in golden yellow with orange glow, FOLDER in white with blue glow, placed in the upper left
```

## 10. TECHNO PARTS · ช่างประกอบคอม (ป.2–ป.4 อุปกรณ์คอมพิวเตอร์)

ปกชั่วคราวที่ใช้อยู่ตอนนี้ประกอบจากหน้าแรกของเกม (โลโก้ + ไรเดอร์) กับไอคอนอุปกรณ์ที่วาดในเกม ถ้าได้ภาพ AI แล้วให้บันทึกเป็น `tools/games/covers/generated-.../techno-parts.png` เพิ่มรายการ ('techno-parts','techno-parts','techno-parts') ใน `_covers_apply.py` แล้วรัน `python tools/build-home-lite.py`

**ภาพอ้างอิง** `tools/games/covers/refs/techno-parts/`
- `ref1-rider-sword-ready.png` ไรเดอร์ถือดาบ ท่ายืน (ตัวหลัก ใช้สีชมพูแมเจนตาเดิม) · `ref2-rider-sword-attack.png` ท่าฟัน
- `ref3-game-build-board.png` โต๊ะประกอบเครื่องในเกม (ใช้เป็นแบบของหน้าตาชิ้นส่วนคอมแบบการ์ตูนและกรอบมน) · `ref4-game-ports-board.png` แผงช่องเสียบหลังเครื่อง

```
Reference images in order: 1 = magenta-and-black armored rider with sword (exact match), 2 = sword attack pose, 3 = the in-game build board (cartoon computer parts with rounded UI), 4 = the in-game back-panel ports board.
Cover for the children's educational game "TECHNO PARTS", where kids learn computer parts by sorting devices, plugging cables into the right ports, assembling a PC and repairing it for customers. Bright cheerful daytime workshop scene: the magenta-and-black armored rider stands large on the left foreground holding the sword, the helmet locked on with a glowing visor, chibi super-deformed proportions. On the right, a big friendly cartoon desktop computer case opened on a workbench with colorful floating parts around it: a CPU chip, a green RAM stick, an SSD, a graphics card with two fans, a monitor, a keyboard, a mouse and neat colored cables (HDMI, USB, green and pink audio jacks, LAN). Soft rounded cartoon style with thick navy outlines, warm sunlit workshop with shelves of tools in the background, a small cute monster peeking from behind the case. Title logo at the top reading exactly "TECHNO PARTS" in big glossy teal and gold letters. 16:9, no other text.
```

## 11. TECHNO SLICE · ช่างแบ่งพิซซ่า (ป.4 เศษส่วน)

ปกชั่วคราวที่ใช้อยู่ตอนนี้ประกอบจากหน้าแรกของเกม (โลโก้ + ไรเดอร์) กับภาพพิซซ่าที่ระบายบางส่วนและป้ายเศษส่วนที่วาดในเกม ถ้าได้ภาพ AI แล้วให้เพิ่มรายการ ('techno-slice','techno-slice','techno-slice') ใน `_covers_apply.py` แล้วรัน `python tools/build-home-lite.py`

**ภาพอ้างอิง** `tools/games/covers/refs/techno-slice/`
- `ref1-rider-sword-ready.png` ไรเดอร์ถือดาบ ท่ายืน (ตัวหลัก ใช้สีชมพูแมเจนตาเดิม) · `ref2-rider-sword-attack.png` ท่าฟัน
- `ref3-game-cut-plate.png` หน้าเล่นตัดพิซซ่าลงจาน (ใช้เป็นแบบของพิซซ่าการ์ตูนมีเส้นแบ่งชิ้นและเปปเปอโรนี) · `ref4-game-match-pies.png` หน้าจับคู่การ์ดเศษส่วนกับภาพพิซซ่า

```
Reference images in order: 1 = magenta-and-black armored rider with sword (exact match), 2 = sword attack pose, 3 = in-game pizza on a plate being cut into equal slices, 4 = in-game pizzas shaded to show fractions with fraction cards.
Cover for the children's math game "TECHNO SLICE", where kids practice fractions by slicing pizzas for customers. Warm sunny pizzeria scene: the magenta-and-black armored rider stands large on the left foreground with the sword, the helmet locked on with a glowing visor, chibi super-deformed proportions, a tiny chef scarf is fine. On the right, a big round pizza cut into 8 equal slices with 3 slices lifted out and floating, more pizzas and a chocolate bar divided into equal parts around, and round white badges with fractions 3/8, 1/4 and 5/12. Cartoon style with thick brown outlines, red-and-white checkered cloth and wooden counter in the background, a cute monster peeking over the counter. Title logo at the top reading exactly "TECHNO SLICE" in big glossy tomato-red and golden letters. 16:9, no other text.
```

## 12. TECHNO TALK · ประโยคอังกฤษประจำวัน (อนุบาล–ป.3)

ปกชั่วคราวที่ใช้อยู่ตอนนี้ประกอบจากหน้าแรกของเกมจริง: ภาพมาสไรเดอร์เทคโนสองท่า (โบกมือ / ชูกำปั้น จากโฟลเดอร์ Drive `krukan/Pic` ชุด home-class-techno และ rainbow-city-techno) + โลโก้ + เด็ก 4 คนกับป้ายพูด I am Tom / You are Mei / He is Ben / She is Anna บนทุ่งหญ้า

**ภาพอ้างอิงแนะนำ** `tools/games/talk/mascot/wave.webp` `cheer.webp` (ไรเดอร์ครึ่งตัวหลายท่า) และภาพหน้าแรกของเกม

```
Cover for the children's English game "TECHNO TALK" for kindergarten to grade 3. Bright cheerful meadow scene with soft clouds and a smiling sun. The magenta-and-black armored rider (exact match to the reference, helmet locked on with a glowing visor, chibi proportions) stands large on the left waving, and a second pose cheering with a raised fist on the right. In the middle four cute round-faced kids (two boys, two girls, different hair) each with a speech bubble: "I am Tom." "You are Mei." "He is Ben." "She is Anna." Floating colorful alphabet blocks T A L K around the big colorful rounded logo text "TECHNO TALK". Flat vector style with thick dark-navy outlines, candy colors, no real photos. 16:9.
```

## ถ้าผลลัพธ์ไม่ตรง

- ตัวอักษรชื่อเกมสะกดผิด: ให้สั่งสร้างใหม่ หรือลบประโยคเรื่อง Title logo ออกแล้วบอกผม เดี๋ยวผมซ้อนโลโก้เองตอนตัดภาพ (หลีกเลี่ยงปัญหาตัวสะกดและเว้นที่ตามต้องการ)
- ไรเดอร์เห็นหน้าหรือถอดหมวก: ผิดกติกาเรื่อง ให้เติมท้าย prompt ว่า `the helmet is locked on, a glowing visor covers the face completely`
- ไรเดอร์ผิดสี: เติมว่า `armor colors must match reference image 1 exactly: <สีของร่างนั้น>`
- ไรเดอร์สัดส่วนผู้ใหญ่: เติมว่า `chibi super-deformed proportions, big head, short legs, about 3 heads tall`
- หน้าตัวหนังสือในจอโค้ดหรือเครื่องหมายอ่านไม่ออก: ปกติและตั้งใจไว้ ให้เป็นแท่งสีนามธรรม
