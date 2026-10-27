"""เตรียมภาพสำหรับเกมหน้าเดียว แล้วแปลงเป็น data URI (base64 webp) ให้ build-games.py ฝังลงไฟล์
- ภาพเคลื่อนไหว (ฮีโร่ h0_/h1_, มอนสเตอร์ m{N}_{เฟรม}, ฉาก arena_*) มาจาก tools/games/art/ ซึ่ง prepare_art.py สร้างจากคลังภาพเกมเก่า
- title_techno ตัดจากสไปรต์ในแอปวิชา CS-M1 (ต้นแบบเว็บ_CS-M1_Offline/assets)
ฟังก์ชัน data_uri(name) และ art_meta(names) ใช้ใน build-games.py ส่วนการรันตรง ๆ จะพิมพ์ขนาดของภาพให้ดู"""
import base64
import io
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ART = HERE / 'art'
ROOT = HERE.parents[1]
SRC = ROOT / 'MyIPST_CS_M1-M3_DT_M2-M3' / 'ต้นแบบเว็บ_CS-M1_Offline' / 'assets'

HERO_KEYS = ['idle', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'up', 'fall', 'dash', 'a1', 'a2', 'a3', 'hurt']
ARENAS = ['arena_thunder', 'arena_nature', 'arena_fire', 'arena_ice']


HERO_LITE = ['idle', 'a1', 'a2', 'a3', 'hurt', 'dash', 'up']   # ท่าที่เกมแบบไม่วิ่ง (ตัดสิน/สลับสวิตช์) ใช้ เล็กกว่าชุดเต็มมาก
MON_LITE = [0, 6, 7]                                            # ยืน · โจมตี · โดนตี


def hero(prefix, keys=None):
    return [f'{prefix}_{k}' for k in (keys or HERO_KEYS)]


def monsters(*ids, frames=None):
    return [f'm{m}_{f}' for m in ids for f in (frames if frames is not None else range(8))]


def arenas(*names):
    return [f'arena_{n}' for n in names]


# ชุดท่าทาง 9 ช่อง (prepare_art9.py): ไรเดอร์ s0-s3 = ดาบ/ปืน/หอก/มีดคู่  มอนสเตอร์ b12..b32 (15 ตัว)
HERO9_KEYS = ['idle', 'step', 'a1', 'a2', 'hurt', 'power', 'defeat']
MON9_IDS = [12, 13, 14, 15, 17, 20, 23, 24, 25, 26, 28, 29, 30, 31, 32]
MON9_FRAMES = [0, 4, 5, 8]


def hero9(*prefixes):
    return [f'{p}_{k}' for p in prefixes for k in HERO9_KEYS]


def monsters9(*ids):
    return [f'b{m}_{f}' for m in (ids or MON9_IDS) for f in MON9_FRAMES]


# ชุดเต็ม (prepare_art9.py --full) ทุกท่าเป็นภาพคนละภาพ: ไรเดอร์ r0-r3 9 ท่า · มอนสเตอร์ c12..c32 8 ท่า
HERO_FULL_KEYS = ['idle', 'step', 'dash', 'a1', 'a2', 'hurt', 'power', 'jump', 'defeat']
MON_FULL_FRAMES = [0, 1, 3, 4, 5, 6, 7, 8]


def hero_full(*ids):
    return [f'r{i}_{k}' for i in (ids or (0, 1, 2, 3)) for k in HERO_FULL_KEYS]


def monsters_full(*ids):
    return [f'c{m}_{f}' for m in (ids or MON9_IDS) for f in MON_FULL_FRAMES]


def _uri(raw):
    return 'data:image/webp;base64,' + base64.b64encode(raw).decode('ascii')


def _title():
    im = Image.open(SRC / 'techno-sword.webp').convert('RGBA')
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.thumbnail((360, 360), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=76, method=6)
    return buf.getvalue()


def raw(name):
    p = ART / f'{name}.webp'
    return p.read_bytes() if p.exists() else _title()


def data_uri(name):
    if name != 'title_techno' and not (ART / f'{name}.webp').exists():
        raise KeyError(f'ไม่มีภาพ {name} ใน art/ (รัน prepare_art.py)')
    return _uri(raw(name))


def art_meta(names):
    """ข้อมูลจุดยึดเท้า/ขนาดลำตัวของฮีโร่และมอนสเตอร์ที่ใช้ในเกมนั้น ๆ"""
    meta = json.loads((ART / 'meta.json').read_text(encoding='utf-8'))
    m9 = ART / 'meta9.json'
    if m9.exists():                      # ชุด 9 ช่อง (prepare_art9.py) เก็บแยกไฟล์ ไม่ให้ prepare_art.py ทับ
        extra = json.loads(m9.read_text(encoding='utf-8'))
        meta['hero'].update(extra['hero']); meta['mon'].update(extra['mon'])
    out = {}
    for n in names:
        prefix = n.split('_')[0]
        if prefix in meta['hero']:
            out[prefix] = meta['hero'][prefix]
        elif prefix in meta['mon']:
            out[prefix] = meta['mon'][prefix]
    return out


if __name__ == '__main__':
    names = hero('h0') + hero('h1') + monsters(*range(8)) + ARENAS + ['title_techno']
    total = sum(len(raw(n)) for n in names)
    print(f'{len(names)} ภาพ รวม {total / 1024:.0f} KB raw (~{total * 4 / 3 / 1024:.0f} KB base64)')
