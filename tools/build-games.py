"""สร้างเกมหน้าเดียว (HTML ไฟล์เดียว) ที่เขียนด้วย Phaser 3 จากโค้ดใน tools/games/
ฝังภาพตัวละครเป็น base64 และฟอนต์ Kanit ที่ตัดแล้วเป็น base64
ผลลัพธ์ต่อเกม 2 ไฟล์ที่รากของโปรเจกต์:
  Game-<ชื่อ>.html          โหลด Phaser จาก CDN (ไฟล์เล็ก เหมาะวางฝังใน Google Sites)
  Game-<ชื่อ>-Offline.html  ฝัง Phaser ไว้ในไฟล์ (ใหญ่กว่า ใช้ได้โดยไม่ต้องมีอินเทอร์เน็ต)
รัน: python tools/build-games.py            (สร้างทุกเกม)
     python tools/build-games.py code-runner  (สร้างเฉพาะเกมที่ระบุ)
อย่าแก้ไฟล์ผลลัพธ์ ให้แก้ที่ tools/games/ แล้วรันใหม่ ก่อนสร้างควรรัน node tools/games/<เกม>/test_engine.js"""
import base64
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
games_dir = Path(__file__).resolve().parent / 'games'
sys.path.insert(0, str(games_dir))
import assets  # noqa: E402

SHARED = ['core.js', 'audio.js', 'ui.js', 'fx.js', 'boot.js', 'common.js', 'stats.js', 'tutor.js']
PHASER = 'phaser-3.90.0.min.js'

# สถิติเกมกลาง: ที่อยู่เว็บแอปของชีตกลางกับรหัสอยู่ใน tools/games/stats.json (ว่าง = ปิดระบบ เกมไม่ส่งอะไรเลย)
# ไอดีเกมที่ส่งไปชีตคือชื่อคีย์ใน GAMES (steps, folder, debug, packet, phish, code-runner, grid, typing, caesar)
try:
    STATS = json.loads((games_dir / 'stats.json').read_text(encoding='utf-8'))
except Exception:
    STATS = {'url': '', 'key': ''}



def skill_images(poses=(), rb=False, bots=(), bgs=()):
    """ภาพของเกมฝึกทักษะ (เมาส์ แป้นพิมพ์ จังหวะ เมืองสีรุ้ง) จาก tools/games/skill-art-lite (รุ่นเบา สร้างด้วย prepare_skill_art_lite.py จาก skill-art ที่ prepare_skill_art.py ทำไว้)
    คีย์เท็กซ์เจอร์: pose_<ท่า> robotN batteryN starN seqR_I bg_* bot_* item_*
    rb = True (หุ่น แบต ดาว ภาพเรียงลำดับ ทั้งหมด) หรือรายการ: 'robot' 'battery' 'star' (ทั้ง 4 สี) 'seq' (ครบ 12 ภาพ) หรือคีย์เฉพาะ เช่น 'robot0' 'star2' """
    d = {}
    for n in poses:
        d['pose_' + n] = '../skill-art-lite/poses/%s.webp' % n
    toks = ['robot', 'battery', 'star', 'seq'] if rb is True else list(rb or ())
    keys = []
    for t in toks:
        if t in ('robot', 'battery', 'star'):
            keys += ['%s%d' % (t, c) for c in range(4)]
        elif t == 'seq':
            keys += ['seq%d_%d' % (r, i) for r in range(4) for i in range(3)]
        else:
            keys.append(t)
    for k in keys:
        d[k] = '../skill-art-lite/rb/%s.webp' % k
    for n in bots:
        d[n] = '../skill-art-lite/bots/%s.webp' % n
    for n in bgs:
        d['bg_' + n] = '../skill-art-lite/bg/bg_%s.webp' % n
    return d


COACH = ['ready', 'thumbs', 'victory', 'heart', 'dance', 'puzzled', 'chin', 'pointR', 'trophy']   # ท่าโค้ชที่ฝังในเกมทักษะ (ลดจาก 17 ท่าเพื่อประหยัดที่บน Sites; K.Coach ใช้เฉพาะท่าที่มี)

GAMES = {
    'code-runner': {
        'title_pose': ['code'],
        'title': 'CODE RUNNER · เกมสั่งการ Techno | KruKan.in.th',
        'out': 'Game-Code-Runner',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'files': ['engine.js', 'levels.js', 'arcade-data.js', 'view.js', 'scene-title.js', 'scene-select.js', 'scene-mission.js', 'scene-arcade.js', 'main.js'],
        'assets': assets.hero('h0') + assets.monsters(0, 1, 2, 5, 4) + assets.ARENAS,   # ภาพหน้าแรกใช้ title_pose (ท่าประจำเกม) แทน title_techno แล้ว
    },
    'grid': {
        'title_pose': ['tablet'],
        'title': 'TECHNO GRID · เขาวงกตสั่งโค้ด | KruKan.in.th',
        'out': 'Game-Techno-Grid',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'files': ['engine.js', 'levels.js', 'data.js', 'view.js', 'editor.js', 'scene-title.js', 'scene-select.js', 'scene-mission.js', 'scene-arcade.js', 'main.js'],
        'assets': assets.hero('h0') + assets.monsters(0, 1, 2, 5, 4) + assets.ARENAS,   # ภาพหน้าแรกใช้ title_pose (ท่าประจำเกม) แทน title_techno แล้ว
    },
    'typing': {
        'title_pose': ['typing'],
        'title': 'TYPE HERO · ฝึกพิมพ์ไทย-อังกฤษ | KruKan.in.th',
        'out': 'Game-Type-Hero',
        'ui_font': 'Sarabun',
        'name_pad': True,     # จอสัมผัสพิมพ์ชื่อด้วยแป้นในเกม ไม่เรียกคีย์บอร์ดเครื่อง (กันกรอบเกมเลื่อนค้างบน iPad) ทดลองเกมนี้ก่อน 26 ต.ค. 2569
        'fs_prompt': False,   # ไม่ขึ้นหน้าต่างชวนเปิดเต็มจอตอนเริ่ม (ปุ่มขยายในเกมยังกดเองได้)
        'fs_guide': True,     # ปุ่มขยายบน Sites บอกให้กด F11 แทนการเปิดแท็บใหม่ (จอสัมผัสยังเปิดแท็บใหม่) ทดลองเกมนี้ก่อน 26 ต.ค. 2569
        'files': ['content.js', 'engine.js', 'course.js', 'data.js', 'keyboard.js', 'scene-title.js', 'scene-select.js', 'scene-course.js', 'scene-play.js', 'main.js'],
        'assets': assets.hero('h0') + assets.ARENAS,   # ภาพหน้าแรกใช้ title_pose (ท่าประจำเกม) แทน title_techno แล้ว
    },
    'phish': {
        'title_pose': ['shield'],
        'title': 'NET PATROL · สายตรวจเน็ต | KruKan.in.th',
        'out': 'Game-Net-Patrol',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'bright',
        'extra': ['rider.js', 'scenes.js'],
        'files': ['content.js', 'engine.js', 'data.js', 'scene-title.js', 'scene-play.js', 'main.js'],
        'assets': sum([assets.hero(h, assets.HERO_LITE) for h in ('h0', 'h1', 'h2', 'h3')], []) + assets.arenas('sky', 'sun', 'ice', 'nature'),
    },
    'packet': {
        'title_pose': ['rocket'],
        'title': 'PACKET EXPRESS · ไปรษณีย์ข้อมูล | KruKan.in.th',
        'out': 'Game-Packet-Express',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'bright',
        'extra': ['rider.js', 'scenes.js'],
        'files': ['levels.js', 'engine.js', 'data.js', 'scene-title.js', 'scene-play.js', 'main.js'],
        'assets': sum([assets.hero(h, assets.HERO_LITE) for h in ('h0', 'h1', 'h2', 'h3')], []) + assets.arenas('ice', 'nature', 'sky', 'sun'),
    },
    'debug': {
        'title_pose': ['bugnet'],
        'title': 'BUG BUSTER · จับบั๊กโค้ด | KruKan.in.th',
        'out': 'Game-Bug-Buster',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'bright',
        'extra': ['rider.js', 'scenes.js'],
        'files': ['content.js', 'engine.js', 'data.js', 'scene-title.js', 'scene-play.js', 'main.js'],
        'assets': sum([assets.hero(h, assets.HERO_LITE) for h in ('h0', 'h1', 'h2', 'h3')], []) + assets.monsters(8, 9, 10, 12, 13, 19, 17, 21, 25, 36, frames=assets.MON_LITE) + assets.arenas('nature', 'autumn', 'reef', 'sun'),
    },
    'steps': {
        'title_pose': ['pointright'],
        'title': 'TECHNO STEPS · ก้าวแรกนักเขียนโปรแกรม | KruKan.in.th',
        'out': 'Game-Techno-Steps',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'bright',
        'extra': ['rider.js', 'scenes.js'],
        'files': ['engine.js', 'levels.js', 'data.js', 'scene-title.js', 'scene-play.js', 'main.js'],
        'assets': assets.hero9('s0', 's1', 's2', 's3') + assets.monsters9() + assets.arenas('sky', 'sun', 'ice', 'nature', 'reef', 'autumn'),
    },
    'folder': {
        'title_pose': ['folder', 'mouse'],
        'title': 'TECHNO FOLDER · จัดโฟลเดอร์กับเทคโน | KruKan.in.th',
        'out': 'Game-Techno-Folder',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'bright',
        'extra': ['rider.js', 'scenes.js'],
        'files': ['engine.js', 'levels.js', 'data.js', 'scene-title.js', 'scene-play.js', 'play-input.js', 'play-ops.js', 'main.js'],
        'assets': assets.hero9('s0', 's1', 's2', 's3') + assets.monsters9() + assets.arenas('sky', 'sun', 'nature', 'reef'),
    },
    'parts': {
        'title_pose': ['parts', 'circuit'],
        'title': 'TECHNO PARTS · ช่างประกอบคอม | KruKan.in.th',
        'out': 'Game-Techno-Parts',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'candy',
        'extra': ['rider.js', 'scenes.js'],
        'files': ['engine.js', 'levels.js', 'icons.js', 'data.js', 'scene-title.js', 'scene-play.js', 'play-input.js', 'play-ops.js', 'main.js'],
        'assets': assets.hero9('s0', 's1', 's2', 's3') + assets.monsters9() + assets.arenas('sky', 'nature', 'sun', 'reef'),
    },
    'slice': {
        'title_pose': ['slice', 'cheer'],
        'title': 'TECHNO SLICE · ช่างแบ่งพิซซ่า | KruKan.in.th',
        'out': 'Game-Techno-Slice',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'pizza',
        'extra': ['rider.js', 'scenes.js'],
        'files': ['engine.js', 'levels.js', 'art.js', 'data.js', 'scene-title.js', 'scene-play.js', 'play-input.js', 'play-ops.js', 'main.js'],
        'assets': assets.hero9('s0', 's1', 's2', 's3') + assets.monsters9() + assets.arenas('sun', 'nature', 'autumn', 'reef', 'sky'),
    },
    'talk': {
        'title_pose': ['bubble'],
        'title': 'TECHNO TALK · ประโยคอังกฤษประจำวัน | KruKan.in.th',
        'out': 'Game-Techno-Talk',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'skin': 'kids',
        'loader': True,
        'extra': ['rider.js', 'scenes.js'],
        'files': ['art-kid.js', 'art-things.js', 'art-scene.js', 'content.js', 'rules.js', 'letters.js', 'engine.js', 'data.js', 'speech.js', 'scene-base.js', 'scene-learn.js', 'scene-rule.js', 'scene-sort.js', 'scene-match.js', 'scene-flip.js', 'scene-build.js', 'scene-quiz.js', 'scene-write.js', 'scene-menus.js', 'main.js'],
        'assets': assets.hero9('s0', 's1', 's2', 's3'),
        'images': {'mascot_' + n: 'mascot/' + n + '.webp' for n in ('wave', 'book', 'tablet', 'shield', 'magnifier', 'laptop', 'code', 'rocket', 'trophy', 'cheer', 'point', 'action')},
    },
    'aksorn': {
        'title_pose': ['writing'],
        'title': 'TECHNO AKSORN · ตะลุยเมืองอักษร เกมภาษาไทย | KruKan.in.th',
        'out': 'Game-Techno-Aksorn',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'ui_font': 'Sarabun',
        'skin': 'kids',
        'loader': True,
        'extra': ['rider.js', 'scenes.js'],
        'fonts': {'Mali': {400: 'aksorn/fonts/Mali-subset.woff2', 600: 'aksorn/fonts/Mali-subset-600.woff2'}, 'Sarabun': {400: 'aksorn/fonts/Sarabun-subset.woff2', 700: 'aksorn/fonts/Sarabun-subset-700.woff2'}},
        'files': ['../talk/art-kid.js', '../talk/art-things.js', '../talk/art-scene.js', 'art-thai.js', 'thai-data.js', 'thai-color.js', 'trace-data.js', 'engine.js', 'thai-r2.js', 'data.js', 'scene-base.js', 'scene-trace.js', 'scene-learn.js', 'scene-learn2.js', 'scene-listen.js', 'scene-shooter.js', 'scene-match.js', 'scene-memory.js', 'scene-sort.js', 'scene-compose.js', 'scene-change.js', 'scene-r2.js', 'scene-menus.js', 'scene-extra.js', 'main.js'],
        'assets': assets.hero9('s0', 's1', 's2', 's3'),
        'images': {'mascot_' + n: '../talk/mascot/' + n + '.webp' for n in ('wave', 'book', 'tablet', 'shield', 'magnifier', 'laptop', 'code', 'rocket', 'trophy', 'cheer', 'point', 'action')},
    },
    'math': {
        'title_pose': ['math', 'stats'],
        'title': 'TECHNO MATH · สมรภูมิคณิต ป.1–ป.4 | KruKan.in.th',
        'out': 'Game-Techno-Math',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'ui_font': 'Sarabun',
        'extra': ['rider.js', 'scenes.js'],
        'fonts': {'Mali': {400: 'math/fonts/Mali-math-400.woff2', 600: 'math/fonts/Mali-math-600.woff2'}},
        'files': ['mathgen.js', 'data.js', 'figs.js', 'paper.js', 'battle.js', 'scene-title.js', 'scene-map.js', 'scene-speed.js', 'scene-play.js', 'main.js'],
        'assets': assets.hero_full() + assets.monsters_full() + assets.arenas('sky', 'nature', 'fire', 'ice', 'autumn', 'reef', 'sun', 'thunder'),   # ท่าทางครบชุด (ผู้ใช้ขอ 26 ต.ค. 2569)
    },
    'mouse': {
        'title': 'TECHNO MOUSE · ผจญภัยเมาส์ | KruKan.in.th',
        'out': 'Game-Mouse-Adventure',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,
        'title_pose': ['mouse'],
        'skin': 'candy',
        'extra': ['rider.js', 'scenes.js', 'kit.js', 'kit-items.js'],
        'files': ['../talk/art-kid.js', '../talk/art-things.js', '../talk/art-scene.js', 'levels.js', 'art.js', 'data.js', 'eng-field.js', 'eng-drag.js', 'eng-path.js', 'eng-scroll.js', 'eng-boss.js', 'scene-play.js', 'main.js'],
        'assets': [],
        'images': skill_images(COACH + ['mouse', 'runR'], rb=['robot', 'battery', 'star'], bots=['bot_click', 'bot_code', 'bot_puzzle', 'bot_repair', 'boss_brain', 'item_antenna', 'item_chip', 'item_battery', 'item_gear'], bgs=['city', 'sky', 'workshop']),
    },
    'rainbow': {
        'title': 'RAINBOW CITY · เมืองสีรุ้ง | KruKan.in.th',
        'out': 'Game-Rainbow-City',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,
        'title_pose': ['rainbow'],
        'skin': 'kids',
        'extra': ['rider.js', 'scenes.js', 'kit.js', 'kit-items.js'],
        'files': ['../talk/art-kid.js', '../talk/art-things.js', '../talk/art-scene.js', 'levels.js', 'rb-vis.js', 'data.js', 'eng-rounds.js', 'scene-play.js', 'main.js'],
        'assets': [],
        'images': skill_images(COACH, rb=True, bots=['bot_click', 'bot_code', 'bot_puzzle', 'bot_repair', 'boss_brain'], bgs=['city', 'sky', 'workshop']),
    },
    'kbq': {
        'title': 'KEYBOARD QUEST · ภารกิจแป้นพิมพ์ | KruKan.in.th',
        'out': 'Game-Keyboard-Quest',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,
        'title_pose': ['kbd'],
        'skin': 'kids',
        'extra': ['rider.js', 'scenes.js', 'kit.js', 'kit-items.js'],
        'files': ['../talk/art-kid.js', '../talk/art-things.js', '../talk/art-scene.js', '../typing/engine.js', '../typing/keyboard.js', 'levels.js', 'kb-vis.js', 'data.js', 'eng-keys.js', 'scene-play.js', 'main.js'],
        'assets': [],
        'images': skill_images(COACH, rb=['robot0', 'robot1', 'star2'], bots=['bot_click', 'bot_code', 'bot_puzzle', 'bot_repair', 'boss_brain'], bgs=['city', 'sky', 'workshop']),
    },
    'beat': {
        'title': 'BEAT HERO · จอมจังหวะ | KruKan.in.th',
        'out': 'Game-Beat-Hero',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,
        'title_pose': ['phones'],
        'skin': 'kids',
        'extra': ['rider.js', 'scenes.js', 'kit.js'],
        'files': ['chart.js', 'levels.js', 'data.js', 'eng-beat.js', 'scene-play.js', 'main.js'],
        'assets': [],
        'images': skill_images(COACH, rb=['robot'], bots=['bot_click', 'bot_code', 'bot_puzzle', 'bot_repair', 'boss_brain'], bgs=['city']),
    },
    'caesar': {
        'title_pose': ['detective'],
        'title': 'CIPHER BREAKER · เกมแกะรหัสซีซาร์ | KruKan.in.th',
        'out': 'Game-Caesar-Cipher',
        'name_pad': True, 'fs_prompt': False, 'fs_guide': True,   # iPad: แป้นใส่ชื่อในเกม ไม่ชวนเต็มจอตอนเริ่ม คอมบน Sites บอกให้กด F11 (ใช้ได้จริงกับ Type Hero แล้ว ขยายทุกเกม 26 ต.ค. 2569)
        'files': ['engine.js', 'missions.js', 'data.js', 'wheel.js', 'scene-title.js', 'scene-select.js', 'scene-mission.js', 'scene-defense.js', 'main.js'],
        'assets': assets.hero('h1') + assets.monsters(1, 3, 5, 7, 6) + assets.ARENAS,   # ภาพหน้าแรกใช้ title_pose (ท่าประจำเกม) แทน title_techno แล้ว
    },
}

CDN_LOADER = """window.loadPhaser=function(cb){var urls=['https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js','https://unpkg.com/phaser@3.90.0/dist/phaser.min.js','https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js'],i=0;
function next(){if(window.Phaser){cb();return}
if(i>=urls.length){var m=document.getElementById('load-msg');if(m)m.innerHTML='โหลดเกมไม่สำเร็จ<br>เกมนี้ต้องต่ออินเทอร์เน็ตเพื่อโหลดตัวเกม หรือใช้ไฟล์เวอร์ชันออฟไลน์';return}
var s=document.createElement('script');s.src=urls[i++];s.onload=function(){window.Phaser?cb():next()};s.onerror=next;document.head.appendChild(s)}
next()};"""


def font_css(cfg=None):
    out = []
    ui = (cfg or {}).get('ui_font')   # 'Sarabun' = ฟอนต์หัวกลม (ว กับ า ไม่คล้ายกัน) ใช้แทน Kanit ในเกมสอนอ่าน/พิมพ์ภาษาไทย โดยฝังใช้ชื่อ 'Kanit' เพราะโค้ดกลางเรียกชื่อนี้ (ดู games/make_ui_font.py)
    for weight in (400, 600):
        data = base64.b64encode((games_dir / 'vendor' / (f'UI-{ui}-{weight}.woff2' if ui else f'Kanit-{weight}.woff2')).read_bytes()).decode('ascii')
        out.append(f"@font-face{{font-family:'Kanit';font-weight:{weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,{data}) format('woff2')}}")
    for fam, faces in (cfg or {}).get('fonts', {}).items():   # ฟอนต์เพิ่มของเกม (เช่น Mali ของ Techno Aksorn: อักษรไทยแบบมีหัวสำหรับเขียนตามรอย)
        for weight, rel in faces.items():
            data = base64.b64encode((games_dir / rel).read_bytes()).decode('ascii')
            out.append(f"@font-face{{font-family:'{fam}';font-weight:{weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,{data}) format('woff2')}}")
    return '\n'.join(out)


def safe(js):
    return js.replace('</script', '<\\/script')

# ย่อโค้ด JavaScript ของไฟล์ที่ฝังลง Google Sites (รุ่น CDN) ด้วย terser เพื่อลดตัวอักษรรวมของเว็บ (Sites จำกัดทั้งเว็บ ~40 ล้านตัว)
# ติดตั้งครั้งเดียว: mkdir C:/clasp-tmp/minify && cd C:/clasp-tmp/minify && npm init -y && npm install terser · ไม่มี terser จะข้ามการย่อ (ไฟล์ใหญ่ขึ้นแต่ใช้ได้เหมือนกัน) · ตั้ง KG_NO_MINIFY=1 เพื่อไม่ย่อ
TERSER = os.environ.get('KG_TERSER', 'C:/clasp-tmp/minify/node_modules/terser/bin/terser')


def minify_js(js, label=''):
    if os.environ.get('KG_NO_MINIFY') or not Path(TERSER).exists():
        return js
    r = subprocess.run(['node', TERSER, '-c', '-m', 'keep_classnames=true,keep_fnames=true'], input=js.encode('utf-8'), capture_output=True)
    if r.returncode != 0:
        print('คำเตือน: ย่อโค้ด %s ไม่สำเร็จ ใช้ไฟล์เดิม: %s' % (label, r.stderr.decode('utf-8', 'replace')[:300]))
        return js
    return r.stdout.decode('utf-8')


def build(name, offline):
    cfg = GAMES[name]
    folder = games_dir / name
    shell = (games_dir / 'shared' / 'shell.html').read_text(encoding='utf-8')
    framework = '\n'.join(safe((games_dir / 'shared' / f).read_text(encoding='utf-8')) for f in SHARED + cfg.get('extra', []))
    img = {k: assets.data_uri(k) for k in cfg['assets']}
    for pose in cfg.get('title_pose', []):   # มาสไรเดอร์ท่าประจำเกมบนหน้าแรก (ไม่ถือดาบ) ใช้ไฟล์แรกที่มี ดู games/prepare_title_poses.py
        f = games_dir / 'title-poses' / (pose + '.webp')
        if f.exists():
            img['title_pose'] = 'data:image/webp;base64,' + base64.b64encode(f.read_bytes()).decode('ascii'); break
    for k, f in cfg.get('images', {}).items():   # ภาพเฉพาะเกม (เช่น มาสคอตโค้ชของ Techno Talk) ใต้โฟลเดอร์เกม คีย์ = ชื่อเท็กซ์เจอร์
        img[k] = 'data:image/webp;base64,' + base64.b64encode((folder / f).read_bytes()).decode('ascii')
    game = ("KG.useSkin('%s');\n" % cfg['skin'] if cfg.get('skin') else '') + ('KG.NAME_PAD = true;\n' if cfg.get('name_pad') else '') + ('KG.NO_FS_PROMPT = true;\n' if cfg.get('fs_prompt') is False else '') + ('KG.FS_GUIDE = true;\n' if cfg.get('fs_guide') else '') + 'KG.IMG = ' + json.dumps(img, ensure_ascii=False) + ';\n'
    game += 'KG.ART = ' + json.dumps(assets.art_meta(cfg['assets']), ensure_ascii=False) + ';\n'
    if STATS.get('url') and cfg.get('stats', True):
        game = 'KG.stats.init(' + json.dumps({'url': STATS['url'], 'key': STATS.get('key', ''), 'game': name}) + ');\n' + game
    game +='\n'.join(safe((folder / f).read_text(encoding='utf-8')) for f in cfg['files'] if (folder / f).exists())
    if not offline:
        framework, game = minify_js(framework, name + ' framework'), minify_js(game, name + ' game')
    phaser = (games_dir / 'vendor' / PHASER).read_text(encoding='utf-8') if offline else CDN_LOADER
    if cfg.get('skin'):
        shell = shell.replace('<html lang="th">', '<html lang="th" data-skin="%s" data-shape="%s" data-tone="%s">' % ({'candy': 'bright', 'pizza': 'bright', 'kids': 'bright'}.get(cfg['skin'], cfg['skin']), 'round' if cfg['skin'] in ('candy', 'pizza', 'kids') else 'cut', {'pizza': 'warm', 'kids': 'kids'}.get(cfg['skin'], '')), 1)
    loader_css = ''
    if cfg.get('loader'):   # หน้าโหลดเฉพาะเกม (tools/games/<เกม>/loader.html + loader.css) แทนแถบโหลดมาตรฐาน
        std = '<div id="load"><div id="load-msg">กำลังโหลดเกม</div><div class="bar"><i></i></div></div>'
        assert std in shell, 'shell.html ไม่มีบล็อกโหลดมาตรฐาน'
        shell = shell.replace(std, (folder / 'loader.html').read_text(encoding='utf-8'), 1)
        loader_css = (folder / 'loader.css').read_text(encoding='utf-8')
    shell = shell.replace('/*__LOADER_CSS__*/', loader_css)
    html = (shell.replace('/*__TITLE__*/', cfg['title']).replace('/*__FONTS__*/', font_css(cfg))
            .replace('/*__PHASER__*/', safe(phaser)).replace('/*__FRAMEWORK__*/', framework).replace('/*__GAME__*/', game))
    html = html.replace('/*__BUILD__*/', hashlib.sha1(html.encode('utf-8')).hexdigest()[:10], 1)   # รหัสรุ่นของไฟล์ ใช้ตรวจว่าเว็บจริงเป็นรุ่นล่าสุดหรือยัง (tools/sites-embed)
    out = root / (cfg['out'] + ('-Offline' if offline else '') + '.html')
    out.write_text(html, encoding='utf-8')
    print(f'{name}: {out.name}  {out.stat().st_size / 1024:.0f} KB  (ภาพ {len(img)} ไฟล์)')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    only_cdn = '--cdn-only' in sys.argv
    for n in args or list(GAMES):
        if not (games_dir / n / 'main.js').exists():
            print(f'ข้าม {n}: ยังไม่มี main.js')
            continue
        build(n, False)
        if not only_cdn:
            build(n, True)
