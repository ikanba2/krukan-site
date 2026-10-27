"""ตัดภาพ 'ท่าทาง 9 ช่อง' (ชีต 3x3 ช่องละ 512x512 พื้นโปร่งใส) เป็นเฟรมเดี่ยว ๆ สำหรับเกมประถม (Techno Steps)
- ไรเดอร์ 4 อาวุธ: s0 ดาบ · s1 ปืน · s2 หอก · s3 มีดคู่ (เท้าอยู่ที่ y=480 กึ่งกลาง x=256 ทุกท่า)
  ลำดับช่อง 0-8: ready, step, dash, windup, attack, hurt, power, jump-attack, defeat
  เก็บเป็นชื่อเฟรมที่ KG.Rider ใช้: idle=ready · a1=windup · a2=attack · hurt · step · power · defeat (a3=a2 · dash=step · up=power เป็นชื่อแทนใน meta9.json)
- มอนสเตอร์ 15 ตัว: b12..b32 ตามเลขชุด (เท้าอยู่ที่ y=472) ช่อง 0 ยืนหน้า 4 โจมตี 5 เจ็บ 8 แพ้ เก็บเฉพาะ 4 เฟรมนี้เพื่อให้ไฟล์เกมไม่ใหญ่เกิน
ใช้ครอปกรอบเดียวกันทุกเฟรมของตัวเดียวกัน เท้าจึงอยู่ที่เดิมเสมอ (origin y = oy) ผลลัพธ์อยู่ใน art/ (ไฟล์ s*_* และ b*_*) และ art/meta9.json
อ่านภาพต้นฉบับจากโฟลเดอร์ชุดภาพในโปรเจกต์ (ต้นทางไม่ต้องมีตอน build): python tools/games/prepare_art9.py"""
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = HERE / 'art'
HERO_DIR = ROOT / 'MyIPST_CS_M1-M3_DT_M2-M3' / 'แผนพัฒนาบทเรียนเว็บ_ม1-ม3_6วิชา' / 'assets' / 'techno-secondary-4weapons'
MON_DIR = ROOT / 'ราละเอียดวิชา' / 'บอสเพิ่ม_20_ชุด_3x3' / 'assets'

HEROES = {'s0': 'sword', 's1': 'gun', 's2': 'spear', 's3': 'dual-daggers'}
HERO_FRAMES = {'idle': 0, 'step': 1, 'a1': 3, 'a2': 4, 'hurt': 5, 'power': 6, 'defeat': 8}   # ไม่เก็บ dash และ jump-attack เพื่อให้ไฟล์เกมเล็ก (ชื่อ dash/up ใช้ภาพ step/power แทนผ่าน alias)
HERO_ALIAS = {'a3': 'a2', 'dash': 'step', 'up': 'power'}
HERO_SCALE = 0.50
MONS = {12: 'sunmane-lion', 13: 'thunder-ram', 14: 'mossback-tortoise', 15: 'cloud-phoenix', 17: 'lantern-jellyfish', 20: 'mushroom-titan',
        23: 'moon-rabbit', 24: 'prism-peacock', 25: 'reef-snail', 26: 'swamp-boar', 28: 'stone-yak', 29: 'mangrove-crocodile',
        30: 'aurora-manta', 31: 'moon-stag', 32: 'dark-rider'}
MON_FRAMES = [0, 4, 5, 8]   # ยืนหน้า · โจมตี · เจ็บ · แพ้
MON_SCALE = 0.30
CELL = 512


def cell(im, i):
    return im.crop(((i % 3) * CELL, (i // 3) * CELL, (i % 3) * CELL + CELL, (i // 3) * CELL + CELL))


def bbox(c):
    return c.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()


def cut(sheet, idxs, baseline, scale, prefix, names, q):
    """ครอปทุกเฟรมด้วยกรอบรวม (สมมาตรรอบ x=256 ล่างสุดที่เส้นเท้า) แล้วย่อ คืน meta"""
    im = Image.open(sheet).convert('RGBA'); cells = [cell(im, i) for i in range(9)]
    boxes = [bbox(c) for c in cells]
    pick = [boxes[i] for i in idxs]
    half = max(max(256 - b[0], b[2] - 256) for b in pick) + 6
    top = max(0, min(b[1] for b in pick) - 6)
    box = (256 - half, top, 256 + half, baseline + 4)
    w, h = box[2] - box[0], box[3] - box[1]; size = (round(w * scale), round(h * scale))
    for idx, name in zip(idxs, names):
        cells[idx].crop(box).resize(size, Image.LANCZOS).save(OUT / f'{prefix}_{name}.webp', 'WEBP', quality=q, method=6)
    idle = boxes[0]
    return {'oy': round((baseline - box[1]) / h, 4), 'body': round((baseline - idle[1]) * scale, 2), 'w': size[0], 'h': size[1]}


# ชุดเต็ม (ใช้ในเกมที่ต้องการท่าทางสมจริง เช่น Techno Math) แยกชื่อจากชุดเดิม ไม่ทับไฟล์ของเกมอื่น
#   ไรเดอร์ r0-r3 ครบ 9 ท่า: idle step dash a1(windup) a2(attack) hurt power jump(jump-attack) defeat
#   มอนสเตอร์ c12..c32 8 ท่า (ไม่เอาท่าหันหลัง): 0 ยืนหน้า · 1 ยืนหันข้าง · 3 ตั้งการ์ด · 4 โจมตี · 5 เจ็บ · 6 ใช้พลัง · 7 กระโดด · 8 แพ้
FULL_HERO_FRAMES = {'idle': 0, 'step': 1, 'dash': 2, 'a1': 3, 'a2': 4, 'hurt': 5, 'power': 6, 'jump': 7, 'defeat': 8}
FULL_HERO_ALIAS = {'a3': 'a2', 'up': 'power'}
FULL_MON_FRAMES = [0, 1, 3, 4, 5, 6, 7, 8]


def build_full():
    """เขียนเฉพาะชุดเต็ม r*/c* แล้วรวมเข้า meta9.json (ไม่แตะชุด s*/b* เดิม): python tools/games/prepare_art9.py --full"""
    OUT.mkdir(exist_ok=True)
    meta = json.loads((OUT / 'meta9.json').read_text(encoding='utf-8'))
    for hid, wname in HEROES.items():
        rid = 'r' + hid[1:]
        m = cut(HERO_DIR / f'techno-secondary-{wname}-3x3-v1.png', list(FULL_HERO_FRAMES.values()), 480, HERO_SCALE, rid, list(FULL_HERO_FRAMES), 55)
        m['alias'] = FULL_HERO_ALIAS; meta['hero'][rid] = m
    for n, name in MONS.items():
        meta['mon'][f'c{n}'] = cut(MON_DIR / f'{n}-{name}-3x3.png', FULL_MON_FRAMES, 472, MON_SCALE, f'c{n}', FULL_MON_FRAMES, 52)
    (OUT / 'meta9.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    files = [p for p in OUT.glob('*.webp') if p.name[0] in 'rc' and p.name[1].isdigit()]
    print(f'ชุดเต็ม {len(files)} ไฟล์ รวม {sum(p.stat().st_size for p in files) / 1024:.0f} KB')


def build():
    OUT.mkdir(exist_ok=True)
    meta = {'hero': {}, 'mon': {}, 'alias': HERO_ALIAS}
    for hid, wname in HEROES.items():
        sheet = HERO_DIR / f'techno-secondary-{wname}-3x3-v1.png'
        m = cut(sheet, list(HERO_FRAMES.values()), 480, HERO_SCALE, hid, list(HERO_FRAMES), 55)
        m['alias'] = HERO_ALIAS; meta['hero'][hid] = m
    for n, name in MONS.items():
        sheet = MON_DIR / f'{n}-{name}-3x3.png'
        meta['mon'][f'b{n}'] = cut(sheet, MON_FRAMES, 472, MON_SCALE, f'b{n}', MON_FRAMES, 52)
    (OUT / 'meta9.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    files = [p for p in OUT.glob('*.webp') if p.name[0] in 'sb' and p.name[1].isdigit()]
    print(f'เสร็จ {len(files)} ไฟล์ รวม {sum(p.stat().st_size for p in files) / 1024:.0f} KB')


if __name__ == '__main__':
    import sys
    build_full() if '--full' in sys.argv else build()
