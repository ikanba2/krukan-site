# AI COVER JOB: generate 5 game cover images (read this whole file first)

You are an image-generation assistant with access to local files. Do the job below **without asking questions**: generate **5 separate images**, one per game, in the order listed. Everything you need is in this file.

## Global rules (apply to every image)

- **Aspect ratio 16:9 landscape, 1920x1080 px, PNG.** (If the tool cannot do 16:9, use 3:2 or 7:4 and keep the title and the hero inside the central 84% of the height.)
- **The Thai game title is the headline of every image**: huge, in the upper left, spelled EXACTLY as written inside each prompt (Thai vowels and tone marks must be correct and readable). The English title is only a smaller subtitle below it. If you cannot render the Thai text correctly, generate the image **with no text at all** and leave the upper-left area (about 58% of the width and 38% of the height) calm and empty, then say which images need a title overlay.
- For each game, **attach the reference images in the exact order listed** (the prompt refers to them as "reference image 1, 2, 3 ..."). Keep the hero rider's design identical to the references (helmet always on, face never visible, magenta-and-black armor). Exactly one hero rider per image.
- Keep the top-right corner (25% width x 40% height) and the bottom-left corner (35% width x 18% height) calm and low-detail; 4% safe margin on every edge. The image will be shown as a 270x152 px card, so the title and the hero must stay readable when tiny.
- Save each finished image to the **exact output path** given under its job. Create the folder if it does not exist. After saving, reply with a short list: game, file path, and whether the Thai title came out correct.

Base folder of the project: `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan`

---

## JOB 1 of 5 · ก้าวแรกของนักเขียนโปรแกรม (TECHNO STEPS)

- **Thai title to render (headline):** `ก้าวแรกของนักเขียนโปรแกรม`
- **English subtitle (smaller):** `TECHNO STEPS`
- **Save the result as:** `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\generated-2026-10-24\techno-steps-cover.png`
- **Reference images, attach in this order:**
  1. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-steps\ref1-rider-sword-ready.png`
  2. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-steps\ref2-rider-sword-attack.png`
  3. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-steps\ref3-monster-lion.png`
  4. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-steps\ref4-monster-boar.png`
  5. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-steps\ref5-monster-ram.png`
  6. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-steps\ref6-monster-manta.png`
  7. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-steps\ref7-bg-sunny-ruins.jpg`

**Prompt for job 1:**

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

## JOB 2 of 5 · จัดโฟลเดอร์กับเทคโน (TECHNO FOLDER)

- **Thai title to render (headline):** `จัดโฟลเดอร์กับเทคโน`
- **English subtitle (smaller):** `TECHNO FOLDER`
- **Save the result as:** `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\generated-2026-10-24\techno-folder-cover.png`
- **Reference images, attach in this order:**
  1. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-folder\ref1-rider-sword-ready.png`
  2. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-folder\ref2-rider-sword-attack.png`
  3. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-folder\ref3-monster-mushroom-titan.png`
  4. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-folder\ref4-bg-sunny-ruins.jpg`
  5. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-folder\ref5-game-window.png`

**Prompt for job 2:**

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

## JOB 3 of 5 · ช่างประกอบคอม (TECHNO PARTS)

- **Thai title to render (headline):** `ช่างประกอบคอม`
- **English subtitle (smaller):** `TECHNO PARTS`
- **Save the result as:** `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\generated-2026-10-24\techno-parts-cover.png`
- **Reference images, attach in this order:**
  1. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-parts\ref1-rider-sword-ready.png`
  2. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-parts\ref2-rider-sword-attack.png`
  3. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-parts\ref3-game-build-board.png`
  4. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-parts\ref4-game-ports-board.png`

**Prompt for job 3:**

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

## JOB 4 of 5 · ช่างแบ่งพิซซ่า (TECHNO SLICE)

- **Thai title to render (headline):** `ช่างแบ่งพิซซ่า`
- **English subtitle (smaller):** `TECHNO SLICE`
- **Save the result as:** `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\generated-2026-10-24\techno-slice-cover.png`
- **Reference images, attach in this order:**
  1. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-slice\ref1-rider-sword-ready.png`
  2. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-slice\ref2-rider-sword-attack.png`
  3. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-slice\ref3-game-cut-plate.png`
  4. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-slice\ref4-game-match-pies.png`

**Prompt for job 4:**

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

## JOB 5 of 5 · ประโยคอังกฤษประจำวัน (TECHNO TALK)

- **Thai title to render (headline):** `ประโยคอังกฤษประจำวัน`
- **English subtitle (smaller):** `TECHNO TALK`
- **Save the result as:** `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\generated-2026-10-24\techno-talk-cover.png`
- **Reference images, attach in this order:**
  1. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-talk\ref1-mascot-wave.png`
  2. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-talk\ref2-mascot-cheer.png`
  3. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-talk\ref3-mascot-juggle-code-blocks.png`
  4. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-talk\ref4-mascot-point.png`
  5. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-talk\ref5-game-title-screen.png`
  6. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-talk\ref6-game-sort-board.png`
  7. `C:\Users\ikan\OneDrive\0วัดท่าชุมนุม\00Programer\KruKan\tools\games\covers\refs\techno-talk\ref7-game-quiz.png`

**Prompt for job 5:**

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

## When all 5 are done

Tell the user the five saved file names. The user will then run `python tools/games/_covers_apply.py new` to put the covers on the website (the script resizes to 640x360 and skips any missing file).
