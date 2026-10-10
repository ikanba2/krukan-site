# -*- coding: utf-8 -*-
"""Build the subject-select "galaxy" page for every grade (ป.1–ม.3).

Class-P1-Subject-Galaxy.html is the master design. This script copies it and swaps in
each grade's STAGE and SUBJECTS data, writing Class-<GRADE>-Subject-Galaxy.html.

Run from the repo root:  python tools/build-subject-pages.py
Edit the GRADES table below to add/open subjects, then run again.
"""
import json, re, pathlib, io, base64, urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
MASTER = ROOT / 'Class-P1-Subject-Galaxy.html'

# MaskRider Techno spaceship poses (Drive file IDs in "Techno asset")
SHIPS = {
    'ufo': '182dPIjqL2ZMx7LmnkXenhKxj8nr9YZoJ',        # techno-048
    'scooter': '1I5HZj-3ntt6F4gFg2mrJ7iSrnC5CbfnF',    # techno-044
    'rocket': '1IZ42hbamLG9C4p8BPtgZhat4e4XzJO7s',     # techno-046
    'pointer': '1MZ0ANXfwJvZgVI0w3ruMfXweMgdEH2K_',    # techno-047
    'surf': '1GnwEMZ8ObfqAUk-NA9ulY_WTn1qnVzVI',       # techno-050
    'jetpack': '1MWKujcBSC_ThaW2L78Xdecn1fTz2Fjs1',    # techno-051
    'fighter': '1Hb4pbsNb5Fg4H7dWN2kgsVk-OorsCbo2',    # techno-045
    'hover': '15X2qa6d-BOeCjXF_SF5pswV_9XFu05GN',      # techno-049
    'astro': '1qC9EPLouilnbGaWXuRtRyNCGA0CJsR8W',      # techno-052
}
# Monster sprite sheets (3x3) in "Techno asset"
MON = {
    'golden': ('1PXrxzjUSVevLig4AQM-RUsMq_hriu_ft', 'Golden Parasite'),
    'shark': ('1HQREjaTYxRRc3Skq-BmCVNR_TytWvLen', 'Abyss Shark'),
    'mantis': ('16PV_wTjdAFYxhsPOf2JgCCHP01zf1pmh', 'Venom Mantis'),
    'ember': ('1yXsvevW8_fr6vkyszqiKgVQpDYga0F--', 'Ember Maw'),
    'frost': ('1vq9TxA1RckBESp6GtMDl8oqZ2ByybMir', 'Frost Wraith'),
    'scorpion': ('1ZcVCHupK-QWqB5o618qG8uqsUvdb7RhJ', 'Rust Scorpion'),
    'obsidian': ('1QlYHQVxQLk5lRxC7VBw5xmQOv09G8EOw', 'Obsidian Regent'),
    'toad': ('1I6z21CYVdYK5O-_odWNNgBF8jrNqlaQZ', 'Plague Toad'),
    'ivory': ('1XFE56CB5cfh8ih6P_x4_YV7BWLkwCJ-L', 'Ivory Phantom'),
    'scarlet': ('1LUJpu33jz8mnigFfqiHgKshtP9R1yQ_O', 'Scarlet Coil'),
    'ram': ('122-I3Klt-IWO53kdHc0yS0D3BFxuptBH', 'Thunder Ram'),
    'cobalt': ('1RIg6xLzi0c53BH6pxVQhW4evyti494v6', 'Cobalt Brute'),
}
# Subjects not opened yet (no monster until they open). Elements rotate per grade so every grade looks different.
SOON = [('คณิตศาสตร์', 'calculator'), ('ภาษาไทย', 'book-open-text'), ('ภาษาอังกฤษ', 'languages')]
POOL = ['fire', 'water', 'nature', 'ice', 'rock', 'light', 'toxic', 'wind', 'dark', 'thunder']

def opened(title, path, element, monster, icon, ring=False, meta=None, theme=None):
    s = {'title': title, 'icon': icon, 'element': element, 'ring': ring,
         'monster': {'id': MON[monster][0], 'name': MON[monster][1]}, 'url': path, 'status': 'open'}
    if theme: s['theme'] = theme
    if meta: s['meta'] = meta
    return s

GRADES = [
    # file key, index, code, short, name, colour, ship, open subjects (links checked against krukan.in.th on 10 Oct 2569)
    ('P1', 1, 'PRIMARY 1', 'ป.1', 'ประถมศึกษาปีที่ 1', '#06b6d4', 'ufo', [
        opened('วิทยาการคำนวณ', '/Class/Primary1/P1-Technology-', 'thunder', 'golden', 'wand-sparkles', ring=True,
               theme='แผนการเดินทางสู่จอมขมังเวทน้อย', meta=['9 บทเรียน', '2 ภาคเรียน'])]),
    ('P2', 2, 'PRIMARY 2', 'ป.2', 'ประถมศึกษาปีที่ 2', '#3b82f6', 'scooter', [
        opened('วิทยาการคำนวณ', '/Class/Primary2/P2-Technology-', 'water', 'shark', 'mouse-pointer-click', meta=['10 บทเรียน'])]),
    ('P3', 3, 'PRIMARY 3', 'ป.3', 'ประถมศึกษาปีที่ 3', '#14b8a6', 'rocket', [
        opened('วิทยาการคำนวณ', '/Class/Primary3/p3-technology', 'nature', 'mantis', 'code-2')]),
    ('P4', 4, 'PRIMARY 4', 'ป.4', 'ประถมศึกษาปีที่ 4', '#f59e0b', 'pointer', [
        opened('วิทยาการคำนวณ', '/Class/Primary4/P4-Technology-', 'fire', 'ember', 'shield-check', meta=['9 บทเรียน'])]),
    ('P5', 5, 'PRIMARY 5', 'ป.5', 'ประถมศึกษาปีที่ 5', '#f97316', 'surf', [
        opened('วิทยาการคำนวณ', '/Class/Primary5/P5-Technology-', 'ice', 'frost', 'database', ring=True)]),
    ('P6', 6, 'PRIMARY 6', 'ป.6', 'ประถมศึกษาปีที่ 6', '#eab308', 'jetpack', [
        opened('วิทยาการคำนวณ', '/Class/Primary6/P6-Technology-', 'rock', 'scorpion', 'globe-2', meta=['9 บทเรียน'])]),
    ('M1', 7, 'SECONDARY 1', 'ม.1', 'มัธยมศึกษาปีที่ 1', '#ec4899', 'fighter', [
        opened('เทคโนโลยีวิทยาการคำนวณ', '/Class/Secondary1/M1-Technology-', 'dark', 'obsidian', 'server', ring=True, meta=['6 บทเรียน']),
        opened('คอมพิวเตอร์ซอฟต์แวร์', '/Class/Secondary1/comSoftwareM1', 'toxic', 'toad', 'app-window')]),
    ('M2', 8, 'SECONDARY 2', 'ม.2', 'มัธยมศึกษาปีที่ 2', '#8b5cf6', 'hover', [
        opened('วิทยาการคำนวณ', '/Class/Secondary2/M2-Technology-', 'light', 'ivory', 'brain-circuit', ring=True),
        opened('เทคโนโลยีสารสนเทศ 1', '/Class/Secondary2/information-1', 'wind', 'scarlet', 'network')]),
    ('M3', 9, 'SECONDARY 3', 'ม.3', 'มัธยมศึกษาปีที่ 3', '#d946ef', 'astro', [
        opened('วิทยาการคำนวณ', '/Class/Secondary3/M3-Technology-', 'thunder', 'ram', 'satellite-dish', meta=['6 บทเรียน']),
        opened('เทคโนโลยีสารสนเทศ 3', '/Class/Secondary3/information3', 'water', 'cobalt', 'wifi', ring=True)]),
]

CACHE = ROOT / 'tools' / '.asset-cache'

def embed(drive_id, width, quality=80):
    """Download a Drive image once (cached), shrink it, and return a WebP data: URI so pages
    don't depend on Drive links at view time (Drive throttles many quick image loads)."""
    CACHE.mkdir(exist_ok=True)
    raw = CACHE / f'{drive_id}-{width}.png'
    if not raw.exists():
        with urllib.request.urlopen(f'https://lh3.googleusercontent.com/d/{drive_id}=w{width}', timeout=60) as r:
            raw.write_bytes(r.read())
    buf = io.BytesIO()
    Image.open(raw).convert('RGBA').save(buf, 'WEBP', quality=quality, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

TECHNO_POSES = {'idle': SHIPS['fighter'], 'open': SHIPS['pointer'], 'soon': SHIPS['rocket']}
techno_re = re.compile(r"    const TECHNO_POSES=\{.*?\};")

def js(v):
    return json.dumps(v, ensure_ascii=False)

def subject_js(s):
    keys = ['title', 'icon', 'element', 'ring', 'theme', 'meta', 'monster', 'url', 'status']
    parts = [f"{k}:{js(s[k])}" for k in keys if k in s and s[k] not in (None, False, [])]
    if s.get('monster') is False: parts.append('monster:false')
    elif s.get('monster'):  # embed the sprite sheet in the page
        m = s['monster']
        parts = [p if not p.startswith('monster:') else 'monster:' + js({'name': m['name'], 'id': m['id'], 'src': embed(m['id'], 600)}) for p in parts]
    return '      {' + ', '.join(parts) + '}'

master = MASTER.read_text(encoding='utf-8')
stage_re = re.compile(r"    const STAGE=\{.*?\n    \};", re.S)
subj_re = re.compile(r"    const SUBJECTS=\[.*?\n    \];", re.S)
assert stage_re.search(master) and subj_re.search(master)

for key, idx, code, short, name, color, ship, subjects in GRADES:
    used = {s['element'] for s in subjects}
    pool = [e for e in POOL[idx % len(POOL):] + POOL[:idx % len(POOL)] if e not in used]
    soon = [{'title': t, 'icon': ic, 'element': pool[k], 'ring': (k + idx) % 3 == 0, 'monster': False, 'url': '', 'status': 'soon'}
            for k, (t, ic) in enumerate(SOON)]
    stage = ("    const STAGE={\n"
             f"      index:{idx}, seed:{idx},\n"
             f"      code:{js(code)},\n      short:{js(short)},\n      name:{js(name)},\n      color:{js(color)},\n"
             f"      mascot:'{embed(SHIPS[ship], 240)}', // MaskRider Techno ({ship}), embedded\n"
             f"      url:'/Class/{'Primary' if key[0]=='P' else 'Secondary'}{key[1]}'\n    }};")
    subj = "    const SUBJECTS=[\n" + ",\n".join(subject_js(s) for s in subjects + soon) + \
           "\n      // เมื่อวิชาไหนพร้อม: ใส่ url, monster และเปลี่ยน status เป็น 'open' (หรือแก้ใน tools/build-subject-pages.py แล้วรันใหม่)\n    ];"
    page = subj_re.sub(lambda m: subj, stage_re.sub(lambda m: stage, master, 1), 1)
    page = page.replace('<title>ประถมศึกษาปีที่ 1 · เลือกวิชา', f'<title>{name} · เลือกวิชา')
    poses = '    const TECHNO_POSES={' + ','.join(f"{k}:'{embed(v, 320)}'" for k, v in TECHNO_POSES.items()) + '};'
    page = techno_re.sub(lambda m: poses, page, 1)
    out = ROOT / f'Class-{key}-Subject-Galaxy.html'
    out.write_text(page, encoding='utf-8', newline='\n')
    print(out.name, len(subjects), 'open,', len(soon), 'soon,', round(len(page.encode()) / 1024), 'KB')


# ---------- Class select page (star map of all grades) ----------
def between(text, start, end):
    i = text.index(start); j = text.index(end, i)
    return text[i:j]

master = MASTER.read_text(encoding='utf-8')
tpl = (ROOT / 'tools' / 'class-map.template.html').read_text(encoding='utf-8')
grades = []
for key, idx, code, short, name, color, ship, subjects in GRADES:
    first = subjects[0]
    grades.append({
        'key': key, 'short': short, 'name': name, 'code': code, 'color': color, 'seed': idx,
        'zone': 'primary' if key[0] == 'P' else 'secondary',
        'url': f"/Class/{'Primary' if key[0]=='P' else 'Secondary'}{key[1]}",
        'element': first['element'], 'ring': bool(first.get('ring')),
        'subjects': [s['title'] for s in subjects],
        'monster': {'name': first['monster']['name'], 'src': embed(first['monster']['id'], 300)},
    })
fill = {
    '/*@@BASE_CSS@@*/': between(master, '    :root{', '    /* ===== Orbit stage ===== */'),
    '/*@@PLANET_CSS@@*/': between(master, '    /* Planet */', '    /* Monster slot'),
    '/*@@ELEMENTS@@*/': re.search(r"    const ELEMENTS=\{.*?\n    \};", master, re.S).group(0),
    '/*@@TEXTURE_JS@@*/': between(master, '    const TEX_W=', '    // Bring monsters to life').replace('TEX_W=512,TEX_H=256', 'TEX_W=256,TEX_H=128'),
    '/*@@GRADES@@*/': json.dumps(grades, ensure_ascii=False),
    '/*@@UPDATED@@*/': js(re.search(r"const UPDATED='([^']+)'", master).group(1)),
    '/*@@AVATAR@@*/': js(embed(SHIPS['pointer'], 240)),
    '/*@@SHIP@@*/': js(embed(SHIPS['fighter'], 240)),
}
page = tpl
for k, v in fill.items():
    assert k in page, k
    page = page.replace(k, v)
out = ROOT / 'Class-Select-Galaxy.html'
out.write_text(page, encoding='utf-8', newline='\n')
print(out.name, round(len(page.encode()) / 1024), 'KB')
