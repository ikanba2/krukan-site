"""สร้างเส้นเขียนตามรอยของสระ (เฉพาะรูปสระ ไม่รวมพยัญชนะ) จากวิดีโอสอนเขียนสระที่ครูส่งมา (ดู video_strokes.py) แล้วเติมรูปที่วิดีโอไม่มีด้วยการประกอบชิ้นส่วน
หน่วยตอนคำนวณ: พิกเซลครึ่งความละเอียดของกระดานในวิดีโอ ย้ายให้ขีดกลาง (ที่ของพยัญชนะ) อยู่ที่ (0,0) ท้ายสุดคูณ SCALE และจัดกึ่งกลางในกรอบ 360 ผลที่ vowel_trace.json (ใช้โดย trace_extract.build_js)
กติกาที่ครูบอก (25 ต.ค. 2569): เขียนเฉพาะสระ ขีดกลางแค่แสดงตำแหน่งพยัญชนะ ไม่ต้องเขียน · อิ ไม่มีขีดบน · อี = อิ + ขีดบน · อือ = อี + อีกหนึ่งขีด
รูปโดม (ิ ี ึ ื) วาดใหม่ด้วยสูตรวงรีตามขนาดที่วัดจากวิดีโอ (เส้นกลางจากภาพมีรอยหยัก) ที่เหลือใช้เส้นจากวิดีโอโดยตรง
รัน: python tools/games/aksorn/vowel_trace.py   (ต้องมี vowel_video_strokes.json จาก video_strokes.py ก่อน)"""
import json
import math
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
SCALE = 2.0
GAP = 14.0                 # ช่องว่างระหว่างชิ้นที่เขียนต่อกันทางขวา


def rel(vid, key):
    """ย้ายเส้นของสระ key ให้ขีดกลางอยู่ที่ (0,0): คืน (strokes, dash[x0,x1])"""
    e = vid[key]; d = e['dash']; cx, cy = (d[0] + d[2]) / 2, d[1]
    return [[[x - cx, y - cy] for x, y in s] for s in e['strokes']], [d[0] - cx, d[2] - cx]


def bbox(strokes):
    pts = [p for s in strokes for p in s]
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return min(xs), max(xs), min(ys), max(ys)


def shift(strokes, dx, dy=0.0):
    return [[[x + dx, y + dy] for x, y in s] for s in strokes]


def line(a, b, step=3.0):
    n = max(2, int(math.dist(a, b) / step) + 1)
    return [[a[0] + (b[0] - a[0]) * i / (n - 1), a[1] + (b[1] - a[1]) * i / (n - 1)] for i in range(n)]


def ellarc(cx, cy, rx, ry, a0, a1, n=18):
    """ส่วนโค้งของวงรี มุมเป็นองศา 180 = ซ้ายสุด 270 = บนสุด 360 = ขวาสุด (แกน y ชี้ลง)"""
    out = []
    for i in range(n):
        a = math.radians(a0 + (a1 - a0) * i / (n - 1)); out.append([cx + rx * math.cos(a), cy + ry * math.sin(a)])
    return out


def circle(c, r, start=270.0, turns=1.0, n=16):
    """วงกลมเขียนทวนเข็ม (ในแกนที่ y ชี้ลง: มุมลดลง)"""
    return [[c[0] + r * math.cos(math.radians(start - 360 * turns * i / (n - 1))), c[1] + r * math.sin(math.radians(start - 360 * turns * i / (n - 1)))] for i in range(n)]


def dome(kind):
    """โดมของ ิ ี ึ ื (ครึ่งวงรี + ฐานเฉียง + ขีดตั้ง): ลำดับที่เขียน = โค้งซ้าย›ขวา ● ฐานซ้าย›ขวา ● ขีดตั้งล่าง›บน (ขีดสุดท้ายปากกาจบที่ขอบบน ตามวิดีโอ)"""
    if kind == 'i':          # ิ ไม่มีขีดบน โค้งจบที่มุมขวาล่างเลย
        L, C = (-33.0, -72.0), (25.0, -59.0)
        arc = ellarc(-4.0, -72.0, 29.0, 16.0, 180, 360) + [[25.0, -66.0], list(C)]
        return [arc, line(L, C)], L, C
    if kind == 'ii':         # ี = ิ + ขีดบน (ขีดตั้งทางขวายื่นขึ้นไปเหนือโค้ง)
        L, C, A = (-31.0, -66.0), (22.0, -53.0), (22.0, -86.0)
        return [ellarc(-4.5, -66.0, 26.5, 18.0, 180, 350), line(L, C), line(C, A)], L, C
    if kind == 'ue':         # ึ = โดมเล็ก + วงกลมเล็กทางขวาบน
        L, C = (-36.0, -62.0), (19.0, -51.0)
        arc = ellarc(-8.5, -62.0, 27.5, 16.0, 180, 360) + [[19.0, -57.0], list(C)]
        return [arc, line(L, C), circle((15.5, -78.0), 9.0, start=90.0, turns=1.05)], L, C
    # 'uue' ื = ี + อีกหนึ่งขีด (ขีดซ้ายเขียนก่อน ขีดขวาเป็นขีดสุดท้าย)
    L, C, A = (-28.0, -65.0), (24.0, -52.0), (24.0, -85.0)
    arc = ellarc(-2.0, -65.0, 26.0, 19.0, 180, 350)
    lx = 13.0; ya = min(arc, key=lambda p: abs(p[0] - lx))[1]
    return [arc, line(L, C), line([lx, ya + 1.0], [lx, A[1]]), line(C, A)], L, C


def build_video_based():
    vid = json.loads((HERE / 'vowel_video_strokes.json').read_text(encoding='utf-8'))
    P = {k: rel(vid, k) for k in vid}                      # ชิ้นส่วนจากวิดีโอ (ขีดกลางที่ 0,0)
    V = {}
    for k in ['–า', '–อ', 'เ–', 'แ–', 'โ–', 'ใ–', 'ไ–', '–ะ', 'เ–อ', 'เ–ะ', 'แ–ะ', 'โ–ะ', 'เ–าะ', '–ำ', '–ุ', '–ู']:
        V[k] = (P[k][0], P[k][1])
    for key, kind in (('–ิ', 'i'), ('–ี', 'ii'), ('–ึ', 'ue'), ('–ื', 'uue')):
        V[key] = (dome(kind)[0], P[key][1])
    sa = P['–ะ'][0]; sa_x0 = bbox(sa)[0]
    e_prim = P['เ–'][0]; e_bb = bbox(e_prim)
    # เ–า: ในวิดีโอเส้นตั้งของ เ หายไป (ถูกกลืนกับเส้นประ) ใช้ เ จากสระเอ จัดวงห่วงให้ตรงกับห่วงเดิม
    ao = P['เ–า'][0]; loop = bbox([ao[0]])
    V['เ–า'] = ([shift(e_prim, loop[1] - e_bb[1], loop[3] - e_bb[3])[0], ao[1]], P['เ–า'][1])
    # เ–ีย: เ และ ย จากวิดีโอ (จับภาพรอบแรก) โดมของ ี วาดใหม่ตามตำแหน่งในวิดีโอ
    ia = P['เ–ีย'][0]; dm = dome('ii')[0]; dm_bb = bbox(dm); vd_bb = bbox([ia[1]])
    dx, dy = (vd_bb[0] + vd_bb[1]) / 2 - (dm_bb[0] + dm_bb[1]) / 2, (vd_bb[2] + vd_bb[3]) / 2 - (dm_bb[2] + dm_bb[3]) / 2
    V['เ–ีย'] = ([ia[0]] + shift(dm, dx, dy) + [ia[2]], P['เ–ีย'][1])
    ia_right = bbox([ia[2]])[1]
    V['เ–ียะ'] = (V['เ–ีย'][0] + shift(sa, ia_right + GAP - sa_x0), P['เ–ีย'][1])
    # เ–อะ / เ–ือ / เ–ือะ: ประกอบจาก เ และ อ ของสระเออ + ะ + โดมของ ื
    oe = P['เ–อ'][0]; o_right = bbox([oe[1]])[1]
    V['เ–อะ'] = (oe + shift(sa, o_right + GAP - sa_x0), P['เ–อ'][1])
    uue = dome('uue')[0]
    V['เ–ือ'] = ([oe[0]] + uue + [oe[1]], P['เ–อ'][1])
    V['เ–ือะ'] = (V['เ–ือ'][0] + shift(sa, o_right + GAP - sa_x0), P['เ–อ'][1])
    return V


def build_mali_based():
    """–ัว –ัวะ: วิดีโอไม่มี จึงใช้เส้นจากฟอนต์ Mali ตัด อ ตัวฐานออก แล้วใส่ขีดกลางตรงที่ อ เคยอยู่ (หน่วยสุดท้ายแล้ว)"""
    from trace_extract import extract
    out = {}
    for key, src in (('–ัว', 'อัว'), ('–ัวะ', 'อัวะ')):
        _, _, strokes = extract(src)
        base = strokes[0]; xs = [p[0] for p in base]; ys = [p[1] for p in base]
        cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        rest = [[[x - cx, y - cy] for x, y in s] for s in strokes[1:]]
        out[key] = (rest, [-30.0, 30.0])           # หน่วยสุดท้ายอยู่แล้ว (ขีดกว้าง 60)
    return out


def build_change_forms(V):
    """สระเปลี่ยนรูป (ใช้เมื่อมีตัวสะกด): –ั (ไม้หันอากาศ) –็ (ไม้ไต่คู้) เ–็ แ–็ –็อ เ–ิ –ว  ประกอบจากชิ้นส่วนสระจากวิดีโอ (หน่วยสุดท้าย) + เครื่องหมายจากฟอนต์ Mali"""
    from trace_extract import extract

    def mark(src):
        _, _, st = extract(src); b = st[0]; xs = [p[0] for p in b]; ys = [p[1] for p in b]; cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        return [[x - cx, y - cy] for x, y in st[1]], (cx, cy)
    han, _ = mark('อั'); tai, _ = mark('อ็')
    _, _, wst = extract('ว'); wx = [p[0] for p in wst[0]]; wy = [p[1] for p in wst[0]]; wcx, wcy = (min(wx) + max(wx)) / 2, (min(wy) + max(wy)) / 2
    wo = [[x - wcx + 105, y - wcy] for x, y in wst[0]]
    sc = lambda st: [[[x * SCALE, y * SCALE] for x, y in s] for s in st]
    dash = [-30.0, 30.0]

    def tone(ch, plus=False):
        """รูปวรรณยุกต์เขียนคู่ขีดแทนที่ของพยัญชนะ (ครูบอก 25 ต.ค. 2569: ไม่ใช้ อ เป็นฐาน): เส้นของเครื่องหมายจากฟอนต์ Mali อิงกึ่งกลางของ อ ที่เคยเป็นฐาน
        ไม้จัตวา (บวก) ฟอนต์แตกเป็นเส้นสั้น ๆ 3 เส้น จึงวาดใหม่เป็นแนวนอน 1 เส้นแล้วแนวตั้ง 1 เส้น"""
        _, _, st = extract('อ' + ch); b = st[0]; xs = [p[0] for p in b]; ys = [p[1] for p in b]; cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        rest = st[1:]
        if plus:
            pts = [p for q in rest for p in q]; x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts); y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts); mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            rest = [[[x0 + (x1 - x0) * i / 9, my] for i in range(10)], [[mx, y0 + (y1 - y0) * i / 9] for i in range(10)]]
        return [[[x - cx, y - cy] for x, y in q] for q in rest]
    tones = {'–่': tone('่'), '–้': tone('้'), '–๊': tone('๊'), '–๋': tone('๋', plus=True)}
    return dict({k: (v, dash) for k, v in tones.items()}, **{
        '–ั': ([han], dash), '–็': ([tai], dash), '–ว': ([wo], dash),
        'เ–็': (sc(V['เ–'][0]) + [tai], dash), 'แ–็': (sc(V['แ–'][0]) + [tai], dash),
        '–็อ': ([tai] + sc(V['–อ'][0]), dash), 'เ–ิ': (sc(V['เ–'][0]) + sc(V['–ิ'][0]), dash)})


def finalize():
    V = build_video_based(); res = {}
    for k, (st, d) in V.items():
        res[k] = ([[[x * SCALE, y * SCALE] for x, y in s] for s in st], [d[0] * SCALE, d[1] * SCALE])
    res.update(build_mali_based())
    res.update(build_change_forms(V))
    out = {}
    for k, (st, d) in res.items():
        pts = [p for s in st for p in s] + [[d[0], 0.0], [d[1], 0.0]]
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        ox, oy = 300.0 - (min(xs) + max(xs)) / 2, 180.0 - (min(ys) + max(ys)) / 2
        out[k] = {'strokes': [[round(v) for p in s for v in (p[0] + ox, p[1] + oy)] for s in st], 'dash': [round(d[0] + ox), round(d[1] + ox), round(oy)]}
    return out


if __name__ == '__main__':
    out = finalize()
    (HERE / 'vowel_trace.json').write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
    print('ok', len(out), ' '.join(f'{k}:{len(v["strokes"])}' for k, v in out.items()))
