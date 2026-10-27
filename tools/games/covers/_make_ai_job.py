"""สร้าง AI_COVER_JOB.md: ไฟล์งานเดียวที่ส่งให้ AI (ที่เปิดไฟล์ในเครื่องได้) แล้วให้เจนปกทั้ง 5 เกมในรอบเดียว
ดึง prompt ของแต่ละเกมจาก COVER_PROMPTS_5_NEW_GAMES.md (แก้ prompt ที่ไฟล์นั้นแล้วรันสคริปต์นี้ใหม่) ใส่เส้นทางเต็มของภาพอ้างอิงตามลำดับ และเส้นทางเซฟผลลัพธ์
รัน: python tools/games/covers/_make_ai_job.py"""
import io
import re
from pathlib import Path

cov = Path(__file__).resolve().parent
root = cov.parent.parent.parent
src = io.open(cov / 'COVER_PROMPTS_5_NEW_GAMES.md', encoding='utf-8').read()
OUT = cov / 'generated-2026-10-24'

GAMES = [
    ('techno-steps', 'ก้าวแรกของนักเขียนโปรแกรม', 'TECHNO STEPS', ['ref1-rider-sword-ready.png', 'ref2-rider-sword-attack.png', 'ref3-monster-lion.png', 'ref4-monster-boar.png', 'ref5-monster-ram.png', 'ref6-monster-manta.png', 'ref7-bg-sunny-ruins.jpg']),
    ('techno-folder', 'จัดโฟลเดอร์กับเทคโน', 'TECHNO FOLDER', ['ref1-rider-sword-ready.png', 'ref2-rider-sword-attack.png', 'ref3-monster-mushroom-titan.png', 'ref4-bg-sunny-ruins.jpg', 'ref5-game-window.png']),
    ('techno-parts', 'ช่างประกอบคอม', 'TECHNO PARTS', ['ref1-rider-sword-ready.png', 'ref2-rider-sword-attack.png', 'ref3-game-build-board.png', 'ref4-game-ports-board.png']),
    ('techno-slice', 'ช่างแบ่งพิซซ่า', 'TECHNO SLICE', ['ref1-rider-sword-ready.png', 'ref2-rider-sword-attack.png', 'ref3-game-cut-plate.png', 'ref4-game-match-pies.png']),
    ('techno-talk', 'ประโยคอังกฤษประจำวัน', 'TECHNO TALK', ['ref1-mascot-wave.png', 'ref2-mascot-cheer.png', 'ref3-mascot-juggle-code-blocks.png', 'ref4-mascot-point.png', 'ref5-game-title-screen.png', 'ref6-game-sort-board.png', 'ref7-game-quiz.png']),
]
blocks = re.findall(r'## เกมที่ \d[^\n]*\n.*?```\n(.*?)```', src, re.S)
assert len(blocks) == 5, len(blocks)

out = f"""# AI COVER JOB: generate 5 game cover images (read this whole file first)

You are an image-generation assistant with access to local files. Do the job below **without asking questions**: generate **5 separate images**, one per game, in the order listed. Everything you need is in this file.

## Global rules (apply to every image)

- **Aspect ratio 16:9 landscape, 1920x1080 px, PNG.** (If the tool cannot do 16:9, use 3:2 or 7:4 and keep the title and the hero inside the central 84% of the height.)
- **The Thai game title is the headline of every image**: huge, in the upper left, spelled EXACTLY as written inside each prompt (Thai vowels and tone marks must be correct and readable). The English title is only a smaller subtitle below it. If you cannot render the Thai text correctly, generate the image **with no text at all** and leave the upper-left area (about 58% of the width and 38% of the height) calm and empty, then say which images need a title overlay.
- For each game, **attach the reference images in the exact order listed** (the prompt refers to them as "reference image 1, 2, 3 ..."). Keep the hero rider's design identical to the references (helmet always on, face never visible, magenta-and-black armor). Exactly one hero rider per image.
- Keep the top-right corner (25% width x 40% height) and the bottom-left corner (35% width x 18% height) calm and low-detail; 4% safe margin on every edge. The image will be shown as a 270x152 px card, so the title and the hero must stay readable when tiny.
- Save each finished image to the **exact output path** given under its job. Create the folder if it does not exist. After saving, reply with a short list: game, file path, and whether the Thai title came out correct.

Base folder of the project: `{root}`

"""
for i, (slug, th, en, refs) in enumerate(GAMES):
    out += f"""---

## JOB {i + 1} of 5 · {th} ({en})

- **Thai title to render (headline):** `{th}`
- **English subtitle (smaller):** `{en}`
- **Save the result as:** `{OUT / (slug + '-cover.png')}`
- **Reference images, attach in this order:**
"""
    for k, r in enumerate(refs, 1):
        out += f"  {k}. `{cov / 'refs' / slug / r}`\n"
    out += f"\n**Prompt for job {i + 1}:**\n\n```\n{blocks[i].strip()}\n```\n\n"
out += """---

## When all 5 are done

Tell the user the five saved file names. The user will then run `python tools/games/_covers_apply.py new` to put the covers on the website (the script resizes to 640x360 and skips any missing file).
"""
io.open(cov / 'AI_COVER_JOB.md', 'w', encoding='utf-8', newline='').write(out)
print('AI_COVER_JOB.md', len(out), 'chars')
