"""สร้างข้อมูลตั้งต้นของห้องลองเขียน (Aksorn-Stroke-Lab.html): แยกสระที่ขีดแทนพยัญชนะ (–ะ เ–ีย ฯลฯ) ออกเป็น 'ชิ้นส่วน' ที่ใช้ร่วมกันได้
หลักการที่ครูบอก: รูปที่หน้าตาเหมือนกันต้องเขียนเหมือนกันทุกที่ เช่น ะ กับไม้หันอากาศ (ไม้หันอากาศ = ขีดบนของ ะ ขีดเดียว) · อี = อิ + ขีดบน · อือ = อี + อีกหนึ่งขีด · แอ = เอ สองตัว
ชิ้นส่วนแต่ละชิ้นเขียนครั้งเดียว ทุกรูปสระที่ใช้ชิ้นนั้นเปลี่ยนตามอัตโนมัติ (ตำแหน่ง/ขนาดของแต่ละรูปเก็บเป็น [สเกล, เลื่อน x, เลื่อน y] ที่คำนวณจากข้อมูลเดิมครั้งแรก)
พิกัดทั้งหมดอิงจุดกึ่งกลางขีดแทนพยัญชนะ (0,0) แกน y ชี้ลง · ผลที่ stroke_parts_init.json (ใช้โดย build_stroke_lab.py) ต้นทางคือ vowel_trace.json
รัน: python tools/games/aksorn/stroke_parts_init.py"""
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
cur = json.loads((HERE / 'vowel_trace.json').read_text(encoding='utf-8'))


def rel(key):
    e = cur[key]; d = e['dash']; cx, cy = (d[0] + d[1]) / 2, d[2]
    st = [[[s[i] - cx, s[i + 1] - cy] for i in range(0, len(s), 2)] for s in e['strokes']]
    return st, [d[0] - cx, d[1] - cx]


def bbox(strokes):
    pts = [p for s in strokes for p in s]; xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return min(xs), max(xs), min(ys), max(ys)


def flat(s):
    return [round(v, 1) for p in s for v in p]


# ---------- ชิ้นส่วนที่ดึงจากข้อมูลเดิม (รูปต้นทาง, เลขเส้น) ----------
PART_SRC = {
    'เ': ('เ–', [0]), 'โ': ('โ–', [0]), 'ใ': ('ใ–', [0]), 'ไ': ('ไ–', [0]),
    'า': ('–า', [0]), 'อ': ('–อ', [0]), 'ะ': ('–ะ', [0, 1]), 'ว': ('–ว', [0]), '็': ('–็', [0]),
    'ุ': ('–ุ', [0]), 'ู': ('–ู', [0]), 'ย': ('เ–ีย', [4]), 'ํ': ('–ำ', [0]), 'ิ': ('–ิ', [0, 1]),
    '่': ('–่', [0]), '้': ('–้', [0]), '๊': ('–๊', [0]), '๋': ('–๋', [0, 1]),
}
PART_NAME = {
    'เ': 'ตัว เ (ใช้ใน เอ แอ เอะ เอีย เอา ฯลฯ)', 'โ': 'ตัว โ', 'ใ': 'ตัว ใ', 'ไ': 'ตัว ไ', 'า': 'ตัว า (ลากเสียง)', 'อ': 'ตัว อ (ในสระ ออ เออ เอือ)',
    'ะ': 'วิสรรชนีย์ ะ (2 ขีด ขีดแรกคือขีดบน ใช้เป็นไม้หันอากาศด้วย)', 'ว': 'ตัว ว (ในสระ อัว)', '็': 'ไม้ไต่คู้', 'ุ': 'สระอุ', 'ู': 'สระอู', 'ย': 'ตัว ย (ในสระ เอีย)',
    'ํ': 'นิคหิต (วงกลมของสระอำ)', 'ิ': 'สระอิ (โค้ง + ฐาน ใช้เป็นฐานของ อี อึ อื ด้วย)', 'ขีดบน': 'ขีดตั้งขวาของ อี อื (ที่เพิ่มจากอิ)',
    'ขีดเพิ่ม': 'ขีดตั้งซ้ายที่เพิ่มของ อือ',
    '่': 'ไม้เอก', '้': 'ไม้โท', '๊': 'ไม้ตรี', '๋': 'ไม้จัตวา (2 ขีด)', 'วงบน': 'วงกลมเล็กของ อึ',
}
parts = {}
for name, (key, idx) in PART_SRC.items():
    st, _ = rel(key); parts[name] = [st[i] for i in idx]

# ชิ้นส่วนที่ทำเพิ่มบนฐานโดมของ อิ: ขีดบน (ขีดตั้งที่ปลายขวา) · ขีดเพิ่ม (ขีดตั้งซ้ายของ อือ) · วงบน (วงกลมของ อึ)
arc, base = parts['ิ']
C = base[-1]                                                     # ปลายขวาล่างของโดม
parts['ขีดบน'] = [[[C[0], C[1] - k * 66.0 / 11] for k in range(12)]]
lx = C[0] - 22.0; ya = min(arc, key=lambda p: abs(p[0] - lx))[1]
parts['ขีดเพิ่ม'] = [[[lx, ya + 2.0], [lx, (ya + C[1] - 66.0) / 2 + 1.0], [lx, C[1] - 66.0]]]
ring = [[C[0] - 7 + 18 * math.cos(math.radians(90 - 360 * 1.05 * i / 15)), C[1] - 54 + 18 * math.sin(math.radians(90 - 360 * 1.05 * i / 15))] for i in range(16)]
parts['วงบน'] = [ring]


def partsel(spec):
    """'ะ:0' = เฉพาะเส้นที่ 0 ของชิ้น ะ"""
    if ':' in spec:
        n, i = spec.split(':'); return n, [int(v) for v in i.split(',')]
    return spec, None


def home(items):
    out = []
    for spec in items:
        n, i = partsel(spec); st = parts[n]; out += [st[k] for k in (i if i is not None else range(len(st)))]
    return out


def fit(target, items):
    """สเกล+เลื่อนที่ทำให้กล่องของชิ้นส่วน (ตามที่วางเดิม) ทับกล่องของเส้นเดิมในข้อมูลเดิม: p' = s*p + (dx,dy)"""
    h = bbox(home(items)); t = bbox(target)
    hw, hh, tw, th = h[1] - h[0], h[3] - h[2], t[1] - t[0], t[3] - t[2]
    r = []
    if hw > 8 and tw > 2: r.append(tw / hw)
    if hh > 8 and th > 2: r.append(th / hh)
    s = sum(r) / len(r) if r else 1.0
    if abs(s - 1) < 0.04: s = 1.0
    hc = ((h[0] + h[1]) / 2, (h[2] + h[3]) / 2); tc = ((t[0] + t[1]) / 2, (t[2] + t[3]) / 2)
    return [round(s, 3), round(tc[0] - s * hc[0], 1), round(tc[1] - s * hc[1], 1)]


# ---------- รูปสระ: บล็อก = (ชิ้นส่วนที่ใช้, เลขเส้นของรูปเดิมที่เป็นเป้า, ปรับตำแหน่ง/ขนาดตามเดิมไหม) ----------
DOME_I = ['ิ']; DOME_II = ['ิ', 'ขีดบน']; DOME_UUE = ['ิ', 'ขีดเพิ่ม', 'ขีดบน']
FORMS = {
    '–า': [(['า'], [0], 0)], '–อ': [(['อ'], [0], 0)], 'เ–': [(['เ'], [0], 0)],
    'แ–': [(['เ'], [0], 1), (['เ'], [1], 1)], 'โ–': [(['โ'], [0], 0)], 'ใ–': [(['ใ'], [0], 0)], 'ไ–': [(['ไ'], [0], 0)],
    '–ะ': [(['ะ'], [0, 1], 0)],
    'เ–อ': [(['เ'], [0], 1), (['อ'], [1], 1)],
    'เ–ะ': [(['เ'], [0], 1), (['ะ'], [1, 2], 1)],
    'แ–ะ': [(['เ'], [0], 1), (['เ'], [1], 1), (['ะ'], [2, 3], 1)],
    'โ–ะ': [(['โ'], [0], 1), (['ะ'], [1, 2], 1)],
    'เ–าะ': [(['เ'], [0], 1), (['า'], [1], 1), (['ะ'], [2, 3], 1)],
    '–ำ': [(['ํ'], [0], 0), (['า'], [1], 1)],
    '–ุ': [(['ุ'], [0], 0)], '–ู': [(['ู'], [0], 0)],
    '–ิ': [(DOME_I, [0, 1], 0)], '–ี': [(DOME_II, [0, 1, 2], 0)], '–ึ': [(['ิ', 'วงบน'], [0, 1, 2], 0)], '–ื': [(DOME_UUE, [0, 1, 2, 3], 0)],
    'เ–า': [(['เ'], [0], 1), (['า'], [1], 1)],
    'เ–ีย': [(['เ'], [0], 1), (DOME_II, [1, 2, 3], 1), (['ย'], [4], 0)],
    'เ–ียะ': [(['เ'], [0], 1), (DOME_II, [1, 2, 3], 1), (['ย'], [4], 0), (['ะ'], [5, 6], 1)],
    'เ–อะ': [(['เ'], [0], 1), (['อ'], [1], 1), (['ะ'], [2, 3], 1)],
    'เ–ือ': [(['เ'], [0], 1), (DOME_UUE, [1, 2, 3, 4], 1), (['อ'], [5], 1)],
    'เ–ือะ': [(['เ'], [0], 1), (DOME_UUE, [1, 2, 3, 4], 1), (['อ'], [5], 1), (['ะ'], [6, 7], 1)],
    '–ัว': [(['ะ:0'], [0], 1), (['ว'], [1], 1)],
    '–ัวะ': [(['ะ:0'], [0], 1), (['ว'], [1], 1), (['ะ'], [2, 3], 1)],
    '–ั': [(['ะ:0'], [0], 1)], '–็': [(['็'], [0], 0)], '–ว': [(['ว'], [0], 0)],
    'เ–็': [(['เ'], [0], 1), (['็'], [1], 1)],
    'แ–็': [(['เ'], [0], 1), (['เ'], [1], 1), (['็'], [2], 1)],
    '–็อ': [(['็'], [0], 1), (['อ'], [1], 1)],
    'เ–ิ': [(['เ'], [0], 1), (DOME_I, [1, 2], 1)],
    '–่': [(['่'], [0], 0)], '–้': [(['้'], [0], 0)], '–๊': [(['๊'], [0], 0)], '–๋': [(['๋'], [0, 1], 0)],      # รูปวรรณยุกต์ เขียนเป็นขีดเฉย ๆ (ไม่มี อ)
}
assert set(FORMS) == set(cur), set(cur) ^ set(FORMS)


def assemble(blocks):
    out = []
    for items, T, _ in blocks:
        s, dx, dy = T
        for spec in items:
            n, i = partsel(spec); st = parts[n]
            for k in (i if i is not None else range(len(st))):
                out.append([[s * x + dx, s * y + dy] for x, y in st[k]])
    return out


def dist(a, b):
    """ระยะเฉลี่ยจากจุดของ a ไปจุดที่ใกล้สุดของ b (px) ใช้ตรวจว่าประกอบแล้วใกล้ของเดิมแค่ไหน"""
    return sum(min(math.dist(p, q) for q in b) for p in a) / len(a)


forms = {}; report = []
ext = {'xmin': 1e9, 'xmax': -1e9, 'ymin': 1e9, 'ymax': -1e9}


def conv(items, T, dofit):
    """รูปแบบที่ห้องลองเขียนใช้: บล็อกที่ปรับตามช่อง (fit) วางด้วย p' = t + s*(p - c) โดย c = จุดกึ่งกลางกล่องของชิ้นแรกในบล็อกตามที่เขียนอยู่ตอนนี้
    (ครูเขียนชิ้นเลื่อนไปจากเดิมเล็กน้อย รูปอื่นที่ใช้ชิ้นนี้ก็ยังอยู่ในช่องของตัวเอง) · บล็อกที่ไม่ปรับ (รูปต้นทางของชิ้น) วางตามที่เขียนตรง ๆ"""
    its = [{'p': partsel(sp)[0], 'i': partsel(sp)[1]} for sp in items]
    if not dofit: return {'items': its, 'T': [1, 0, 0], 'fit': False}
    h = bbox(home(items[:1])); cx, cy = (h[0] + h[1]) / 2, (h[2] + h[3]) / 2
    return {'items': its, 'T': [T[0], round(T[0] * cx + T[1], 1), round(T[0] * cy + T[2], 1)], 'fit': True}


for key, spec in FORMS.items():
    st, dash = rel(key); blocks = []
    for items, src, dofit in spec:
        T = fit([st[k] for k in src], items) if dofit else [1.0, 0.0, 0.0]
        blocks.append((items, T, src))
    asm = assemble(blocks); pts_cur = [p for s in st for p in s]; pts_new = [p for s in asm for p in s]
    err = max(dist(pts_new, pts_cur), dist(pts_cur, pts_new))
    report.append((err, key))
    for x, y in pts_new + [(dash[0], 0), (dash[1], 0)]:
        ext['xmin'] = min(ext['xmin'], x); ext['xmax'] = max(ext['xmax'], x); ext['ymin'] = min(ext['ymin'], y); ext['ymax'] = max(ext['ymax'], y)
    forms[key] = {'dash': [round(dash[0], 1), round(dash[1], 1)], 'blocks': [conv(items, T, spec[n][2]) for n, (items, T, _) in enumerate(blocks)]}
print('ระยะเฉลี่ยที่ต่างจากข้อมูลเดิม (px, มากไปน้อย):', ' '.join('%s=%.1f' % (k, e) for e, k in sorted(report, reverse=True)[:12]))
print('ขอบเขตรวมของทุกรูป:', {k: round(v) for k, v in ext.items()})

out = {'parts': {n: [flat(s) for s in st] for n, st in parts.items()}, 'partNames': PART_NAME, 'forms': forms, 'extent': {k: round(v) for k, v in ext.items()}}
(HERE / 'stroke_parts_init.json').write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
print('ok ชิ้นส่วน', len(parts), 'รูปสระ', len(forms))
