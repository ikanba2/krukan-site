"""ดึงเส้นทางเขียนตามรอย (เส้นกลาง + ลำดับการลากเส้น) ของตัวอักษรไทยจากฟอนต์ Mali (OFL) ให้เกม Techno Aksorn
ขั้นตอน: วาดตัวอักษรใหญ่ › ทำเส้นกลางด้วย Zhang-Suen › แปลงเป็นกราฟ (ปลายเส้น/จุดแยก/ห่วงหัว) › เดินเส้นโดยเริ่มที่หัว (ถ้ามี)
› ทำให้เรียบและลดจุด › เขียน trace-data.js (พิกัด 0..1000 ในกรอบเดียวกันทุกตัว เส้นฐานอยู่ตำแหน่งเดียวกัน) + ภาพตรวจ trace-review.png
แก้ลำดับรายตัวได้ที่ OVR (เริ่มที่ปลายไหน กลับทิศ แบ่งเส้น)
รัน: python tools/games/aksorn/trace_extract.py"""
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = Path(__file__).resolve().parent
FONT = HERE / 'fonts' / 'Mali-Regular.ttf'
S = 360                     # ขนาดภาพที่ใช้คำนวณ (พิกเซล)
FS = 250                    # ขนาดฟอนต์
BASE = 250                  # ตำแหน่งเส้นฐาน (y) ในภาพ
CONS = [chr(c) for c in range(0x0E01, 0x0E2F) if c not in (0x0E24, 0x0E26)]   # พยัญชนะ 44 ตัว (ไม่รวม ฤ ฦ)


def render(text):
    f = ImageFont.truetype(str(FONT), FS)
    asc, _ = f.getmetrics()
    tmp = ImageDraw.Draw(Image.new('L', (8, 8)))
    bb = tmp.textbbox((0, 0), text, font=f)
    W = max(S, (bb[2] - bb[0]) + 70)
    im = Image.new('L', (W, S), 0)
    d = ImageDraw.Draw(im)
    x = (W - (bb[2] - bb[0])) / 2 - bb[0]
    d.text((x, BASE - asc), text, font=f, fill=255)
    return np.array(im) > 128


def zhang_suen(img):
    img = img.copy().astype(np.uint8)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            p = np.pad(img, 1)
            P2, P3, P4, P5 = p[:-2, 1:-1], p[:-2, 2:], p[1:-1, 2:], p[2:, 2:]
            P6, P7, P8, P9 = p[2:, 1:-1], p[2:, :-2], p[1:-1, :-2], p[:-2, :-2]
            nb = [P2, P3, P4, P5, P6, P7, P8, P9]
            B = sum(n.astype(int) for n in nb)
            A = sum(((nb[i] == 0) & (nb[(i + 1) % 8] == 1)).astype(int) for i in range(8))
            if step == 0:
                c = (P2 * P4 * P6 == 0) & (P4 * P6 * P8 == 0)
            else:
                c = (P2 * P4 * P8 == 0) & (P2 * P6 * P8 == 0)
            m = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c
            if m.any():
                img[m] = 0
                changed = True
    return img.astype(bool)


N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def neighbors(sk, y, x):
    out = []
    for dy, dx in N8:
        yy, xx = y + dy, x + dx
        if 0 <= yy < sk.shape[0] and 0 <= xx < sk.shape[1] and sk[yy, xx]:
            out.append((yy, xx))
    return out


def clean_corners(sk):
    """ลบพิกเซลมุมบันไดที่ทำให้จุดธรรมดากลายเป็นจุดแยกปลอม (พิกเซลที่ลบแล้วเส้นยังต่อกันเหมือนเดิม)"""
    sk = sk.copy()
    for _ in range(2):
        ys, xs = np.nonzero(sk)
        for y, x in zip(ys, xs):
            nb = neighbors(sk, y, x)
            if len(nb) < 3:
                continue
            sk[y, x] = False
            lab, n = ndimage.label(sk[max(0, y - 2):y + 3, max(0, x - 2):x + 3], structure=np.ones((3, 3)))
            # ถ้าเอาออกแล้วเพื่อนบ้านยังต่อกันเป็นกลุ่มเดียว แปลว่าพิกเซลนี้ซ้ำซ้อน
            sub_nb = [(yy - max(0, y - 2), xx - max(0, x - 2)) for yy, xx in nb]
            ids = {lab[a, b] for a, b in sub_nb}
            if len(ids) != 1:
                sk[y, x] = True
    return sk


def prune(sk, minlen=10):
    """ตัดกิ่งสั้น ๆ ที่งอกจากจุดแยก (เกิดจากมุมของตัวอักษร)"""
    sk = sk.copy()
    for _ in range(3):
        ys, xs = np.nonzero(sk)
        ends = [(y, x) for y, x in zip(ys, xs) if len(neighbors(sk, y, x)) == 1]
        removed = False
        for e in ends:
            path = [e]; prev = None; cur = e
            while True:
                nb = [n for n in neighbors(sk, *cur) if n != prev and n not in path]
                if len(nb) != 1:
                    break
                prev, cur = cur, nb[0]
                if len(neighbors(sk, *cur)) >= 3:
                    break
                path.append(cur)
                if len(path) > minlen:
                    break
            if len(path) <= minlen and len(neighbors(sk, *cur)) >= 3:
                for p in path:
                    sk[p] = False
                removed = True
        if not removed:
            break
    return sk


def graph(sk):
    """แยกเส้นกลางเป็นโหนด (ปลายเส้น จุดแยก) และเส้นเชื่อม (ลำดับพิกเซล)"""
    pts = set(zip(*np.nonzero(sk)))
    deg = {p: len(neighbors(sk, *p)) for p in pts}
    nodes = {p for p in pts if deg[p] != 2}
    # รวมพิกเซลจุดแยกที่ติดกันเป็นโหนดเดียว
    cluster = {}
    cid = 0
    for p in nodes:
        if p in cluster:
            continue
        stack = [p]; cluster[p] = cid
        while stack:
            q = stack.pop()
            for n in neighbors(sk, *q):
                if n in nodes and n not in cluster and deg[n] >= 3 and deg[q] >= 3:
                    cluster[n] = cid; stack.append(n)
        cid += 1
    edges = []
    seen = set()
    for p in nodes:
        for n in neighbors(sk, *p):
            if n in nodes:
                if cluster[n] != cluster[p] and (p, n) not in seen and (n, p) not in seen:
                    seen.add((p, n)); edges.append([p, n])
                continue
            if (p, n) in seen:
                continue
            path = [p, n]; prev, cur = p, n
            while cur not in nodes:
                nb = [m for m in neighbors(sk, *cur) if m != prev and m not in path[-3:]]
                if not nb:
                    break
                prev, cur = cur, nb[0]
                path.append(cur)
            seen.add((p, path[1])); seen.add((path[-1], path[-2]))
            edges.append(path)
    # ห่วงล้วน (ไม่มีโหนด)
    rest = pts - {q for e in edges for q in e}
    while rest:
        s = next(iter(rest)); path = [s]; prev = None; cur = s
        while True:
            nb = [m for m in neighbors(sk, *cur) if m != prev and m in rest and m not in path]
            if not nb:
                break
            prev, cur = cur, nb[0]; path.append(cur)
        path.append(s)
        rest -= set(path)
        edges.append(path)
    # แปลงปลายเส้นเป็นรหัสโหนด
    out = []
    for e in edges:
        a = cluster.get(e[0], ('p', e[0])); b = cluster.get(e[-1], ('p', e[-1]))
        out.append({'a': a, 'b': b, 'pts': e})
    return out, cluster, deg


def holes(mask):
    lab, n = ndimage.label(~mask)
    out = []
    for i in range(1, n + 1):
        m = lab == i
        if m[0, :].any() or m[-1, :].any() or m[:, 0].any() or m[:, -1].any():
            continue
        ys, xs = np.nonzero(m)
        out.append({'area': int(m.sum()), 'cy': float(ys.mean()), 'cx': float(xs.mean())})
    return out


def edge_len(e):
    p = e['pts']
    return sum(math.dist(p[i], p[i + 1]) for i in range(len(p) - 1))


def smooth_simplify(pts, step=6):
    """เฉลี่ยเคลื่อนที่ แล้วเก็บจุดทุก ๆ ระยะ step พิกเซลตามความยาวเส้น"""
    a = np.array(pts, dtype=float)
    if len(a) > 4:
        k = 2
        b = a.copy()
        for i in range(len(a)):
            lo, hi = max(0, i - k), min(len(a), i + k + 1)
            b[i] = a[lo:hi].mean(axis=0)
        b[0], b[-1] = a[0], a[-1]
        a = b
    out = [a[0]]
    acc = 0.0
    for i in range(1, len(a)):
        acc += math.dist(a[i - 1], a[i])
        if acc >= step:
            out.append(a[i]); acc = 0.0
    if math.dist(out[-1], a[-1]) > 1:
        out.append(a[-1])
    return [(float(p[1]), float(p[0])) for p in out]   # (x, y)


def order_strokes(edges, hs, ovr):
    """เดินเส้นทั้งหมดของตัวอักษร: เริ่มที่หัว (ห่วงรอบรูเล็ก) ถ้ามี ไม่มีก็เริ่มที่ปลายเส้นตามกติกา แล้วเดินต่อเส้นที่เลี้ยวน้อยที่สุด"""
    used = [False] * len(edges)
    strokes = []

    def ends_of(i):
        return edges[i]['a'], edges[i]['b']

    def heading(path, at_end):
        p = path[-1] if at_end else path[0]
        q = path[-6] if at_end and len(path) > 6 else (path[5] if not at_end and len(path) > 5 else (path[0] if at_end else path[-1]))
        return math.atan2(p[0] - q[0], p[1] - q[1])

    def walk(start_edge, reverse):
        e = edges[start_edge]; used[start_edge] = True
        path = list(reversed(e['pts'])) if reverse else list(e['pts'])
        node = e['a'] if reverse else e['b']
        while True:
            h = heading(path, True)
            best = None
            for i, f in enumerate(edges):
                if used[i]:
                    continue
                for rev in (False, True):
                    st = f['b'] if rev else f['a']
                    if st != node:
                        continue
                    pts = list(reversed(f['pts'])) if rev else f['pts']
                    q = pts[min(5, len(pts) - 1)]
                    h2 = math.atan2(q[0] - pts[0][0], q[1] - pts[0][1])
                    turn = abs((h2 - h + math.pi) % (2 * math.pi) - math.pi)
                    if best is None or turn < best[0]:
                        best = (turn, i, rev, pts)
            if best is None:
                break
            _, i, rev, pts = best
            used[i] = True
            path += list(pts[1:])
            node = edges[i]['a'] if rev else edges[i]['b']
        return path

    # หาหัว: เส้นเชื่อมที่เป็นห่วง (a == b) ล้อมรูเล็ก
    small = [h for h in hs if h['area'] < ovr.get('head_area', 900)]
    head = None
    for i, e in enumerate(edges):
        if e['a'] == e['b'] and len(e['pts']) > 8:
            ys = [p[0] for p in e['pts']]; xs = [p[1] for p in e['pts']]
            for h in small:
                if min(ys) < h['cy'] < max(ys) and min(xs) < h['cx'] < max(xs):
                    head = (i, h)
    order = []
    if head is not None and not ovr.get('nohead'):
        i, h = head
        e = edges[i]
        # ทิศการวนหัว: เลือกทิศที่ออกจากหัวแล้วเลี้ยวน้อยที่สุดไปยังเส้นถัดไป
        best = None
        for rev in (False, True):
            used_try = used[:]
            path = list(reversed(e['pts'])) if rev else list(e['pts'])
            hdir = math.atan2(path[-1][0] - path[-6][0], path[-1][1] - path[-6][1])
            for j, f in enumerate(edges):
                if j == i:
                    continue
                for frev in (False, True):
                    st = f['b'] if frev else f['a']
                    if st != e['a']:
                        continue
                    pts = list(reversed(f['pts'])) if frev else f['pts']
                    q = pts[min(5, len(pts) - 1)]
                    h2 = math.atan2(q[0] - pts[0][0], q[1] - pts[0][1])
                    turn = abs((h2 - hdir + math.pi) % (2 * math.pi) - math.pi)
                    if best is None or turn < best[0]:
                        best = (turn, rev)
        rev = ovr.get('head_rev', best[1] if best else False)
        strokes.append(walk(i, rev))
    # เส้นที่เหลือ: เริ่มจากปลายเส้น (โหนดที่มีเส้นเดียว) ตามกติกา
    while not all(used):
        cands = []
        for i, e in enumerate(edges):
            if used[i]:
                continue
            for rev in (False, True):
                st = e['b'] if rev else e['a']
                pt = e['pts'][-1] if rev else e['pts'][0]
                deg = sum(1 for f in edges if f['a'] == st or f['b'] == st)
                cands.append((deg, pt, i, rev))
        rule = ovr.get('start', 'left')
        def key(c):
            deg, pt, i, rev = c
            score = {'left': pt[1], 'right': -pt[1], 'top': pt[0], 'bottom': -pt[0], 'topleft': pt[0] + pt[1], 'bottomleft': -pt[0] + pt[1]}[rule]
            return (deg != 1, score)
        cands.sort(key=key)
        _, _, i, rev = cands[0]
        strokes.append(walk(i, rev))
    if ovr.get('reverse'):
        strokes = [list(reversed(s)) for s in strokes]
    return strokes


OVR = {}   # ตัวที่ต้องแก้: {'start': 'left'|'right'|'top'|'bottom', 'nohead': True, 'rev': True}


def deg_in(p, pts):
    y, x = p
    return sum((y + dy, x + dx) in pts for dy, dx in N8)


def walk_all(pts, start, first_dir=None, rule='left'):
    """เดินทุกพิกเซลของเส้นกลาง: เริ่มที่ start ไปทางที่เลี้ยวน้อยที่สุดเสมอ ถ้าตันแล้วยังเหลือ ยกปากกาไปเริ่มที่ปลายเส้นที่ยังไม่ได้เดิน"""
    left = set(pts); strokes = []; turn_sum = 0.0
    cur = start
    while left:
        if cur is None:
            free = [p for p in left if deg_in(p, left) <= 1]
            pool = free or list(left)
            key = {'left': lambda p: p[1], 'right': lambda p: -p[1], 'top': lambda p: p[0], 'bottom': lambda p: -p[0]}[rule]
            if strokes:
                last = strokes[-1][-1]
                cur = min(pool, key=lambda p: math.dist(p, last))
            else:
                cur = min(pool, key=key)
        path = [cur]; left.discard(cur)
        first = True
        while True:
            y, x = path[-1]
            nb = [(y + dy, x + dx) for dy, dx in N8 if (y + dy, x + dx) in left]
            if not nb:
                break
            if first and first_dir is not None and first_dir in nb:
                nxt = first_dir
            elif len(path) < 2:
                nxt = min(nb, key=lambda q: (deg_in(q, left), q))
            else:
                k = min(len(path) - 1, 5)
                hy, hx = path[-1][0] - path[-1 - k][0], path[-1][1] - path[-1 - k][1]
                h = math.atan2(hy, hx)
                def turn(q):
                    t = math.atan2(q[0] - y, q[1] - x)
                    return abs((t - h + math.pi) % (2 * math.pi) - math.pi)
                nxt = min(nb, key=turn)
                turn_sum += turn(nxt)
            first = False
            path.append(nxt); left.discard(nxt)
        if len(path) >= 8:
            strokes.append(path)
        cur = None; first_dir = None
    return strokes, turn_sum


_MET = {}


def lines():
    if not _MET:
        for k, t, i in (('x', 'ก', 0), ('base', 'ก', 1)):
            m = render(t); ys = np.nonzero(m.any(axis=1))[0]; _MET[k] = int(ys.min() if i == 0 else ys.max())
    return _MET


def walk_component(pts, mask_holes, ovr):
    """เดินเส้นของชิ้นส่วนเดียว: มีหัว (รูเล็กซ้ายสุด) = เริ่มที่จุดหัวต่อลำตัว วนหัวแล้วลากต่อ · ไม่มีหัว = เริ่มที่ปลายเส้นบนซ้าย"""
    ys = [p[0] for p in pts]; xs = [p[1] for p in pts]
    y0, y1, x0, x1 = min(ys), max(ys), min(xs), max(xs)
    hs = [h for h in mask_holes if x0 <= h['cx'] <= x1 and y0 <= h['cy'] <= y1]
    best = None
    if hs and not ovr.get('nohead'):
        h = min(hs, key=lambda h: h['cx'])   # หัวคือห่วงที่อยู่ซ้ายสุด (ห่วงด้านขวามักเป็นม้วนท้าย เช่น น ม ฉ ณ)
        r = math.sqrt(h['area'] / math.pi) + 16
        ring = {p for p in pts if math.dist(p, (h['cy'], h['cx'])) <= r}
        joints = [p for p in ring if any((p[0] + dy, p[1] + dx) in pts and (p[0] + dy, p[1] + dx) not in ring for dy, dx in N8)]
        starts = joints or sorted(ring)[::3]
        for start in starts:
            for nb in [(start[0] + dy, start[1] + dx) for dy, dx in N8 if (start[0] + dy, start[1] + dx) in ring and (start[0] + dy, start[1] + dx) not in joints]:
                strokes, ts = walk_all(pts, start, nb, 'left')
                score = (len(strokes), ts)
                if best is None or score < best[0]:
                    best = (score, strokes)
    if best is None:
        ends = [p for p in pts if deg_in(p, pts) <= 1] or list(pts)
        start = min(ends, key=lambda p: p[0] + 0.9 * p[1]) if ovr.get('start') != 'bottom' else max(ends, key=lambda p: p[0])
        strokes, _ = walk_all(pts, start, None, 'left')
    else:
        strokes = best[1]
    merged = []   # เส้นถัดไปที่เริ่มติดปลายเส้นก่อน (วนหัวครบแล้วลากต่อ) คือการลากต่อเนื่อง
    for st in strokes:
        if merged and math.dist(merged[-1][-1], st[0]) <= 20:
            merged[-1] = merged[-1] + st
        else:
            merged.append(st)
    return merged


def extract(ch, ovr=None):
    ovr = ovr or OVR.get(ch, {})
    mask = render(ch)
    sk = prune(clean_corners(zhang_suen(mask)))
    lab, n = ndimage.label(sk, structure=np.ones((3, 3)))
    L = lines()
    comps = []
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        if len(ys) < 8:
            continue
        c = {'pts': set(zip(ys.tolist(), xs.tolist())), 'x0': int(xs.min()), 'x1': int(xs.max()), 'y0': int(ys.min()), 'y1': int(ys.max())}
        c['mark'] = c['y1'] < L['x'] + 6 or c['y0'] > L['base'] - 6     # ชิ้นที่อยู่เหนือเส้นหัวหรือใต้เส้นฐานทั้งชิ้น: สระบน/ล่าง วรรณยุกต์ หาง
        comps.append(c)
    bases = [c for c in comps if not c['mark']] or comps
    for c in comps:
        if c in bases:
            c['key'] = c['x0']
        else:
            ov = max(bases, key=lambda b: min(b['x1'], c['x1']) - max(b['x0'], c['x0']))
            c['key'] = ov['x0'] + (0.5 if c['y1'] < L['x'] + 6 else 0.75)
    comps.sort(key=lambda c: c['key'])
    if ovr.get('order'):
        comps = [comps[i] for i in ovr['order']]
    mh = [h for h in holes(mask) if 30 < h['area'] < ovr.get('head_area', 1500)]
    strokes = []
    for c in comps:
        strokes += walk_component(c['pts'], mh, ovr)
    if ovr.get('rev'):
        strokes = [list(reversed(s)) for s in reversed(strokes)]
    strokes = [smooth_simplify(s) for s in strokes]
    return mask, sk, strokes


def review(chars, out):
    cell = 180
    cols = 8
    rows = math.ceil(len(chars) / cols)
    im = Image.new('RGB', (cols * cell, rows * cell), 'white')
    d = ImageDraw.Draw(im)
    data = {}
    for k, ch in enumerate(chars):
        mask, sk, strokes = extract(ch)
        data[ch] = strokes
        ox, oy = (k % cols) * cell, (k // cols) * cell
        W = mask.shape[1]; sc = cell / max(W, S); cw, chh = round(W * sc), round(S * sc)
        bg = Image.new('RGB', (cw, chh), (225, 225, 235))
        im.paste(bg, (ox, oy), Image.fromarray((mask * 255).astype(np.uint8)).resize((cw, chh)))
        cols_ = [(230, 40, 120), (30, 120, 230), (20, 160, 90), (240, 140, 20)]
        for si, s in enumerate(strokes):
            c = cols_[si % 4]
            pts = [(ox + x * sc, oy + y * sc) for x, y in s]
            d.line(pts, fill=c, width=3)
            # จุดเริ่มและลูกศรกลางเส้น
            x0, y0 = pts[0]; d.ellipse((x0 - 6, y0 - 6, x0 + 6, y0 + 6), fill=c)
            d.text((x0 + 6, y0 - 14), str(si + 1), fill=c)
            mid = len(pts) // 3
            if mid + 1 < len(pts):
                (x1, y1), (x2, y2) = pts[mid], pts[mid + 1]
                a = math.atan2(y2 - y1, x2 - x1)
                d.polygon([(x2, y2), (x2 - 10 * math.cos(a - 0.5), y2 - 10 * math.sin(a - 0.5)), (x2 - 10 * math.cos(a + 0.5), y2 - 10 * math.sin(a + 0.5))], fill=c)
        d.text((ox + 4, oy + 4), ch, fill='black')
    im.save(out)
    return data


# สระ 32 รูป (เขียนคู่กับ อ) วรรณยุกต์ 4 รูป (คู่กับ อ) และเลขไทย ๐–๙
VOWELS = ['อะ', 'อา', 'อิ', 'อี', 'อึ', 'อือ', 'อุ', 'อู', 'เอะ', 'เอ', 'แอะ', 'แอ', 'โอะ', 'โอ', 'เอาะ', 'ออ', 'เออะ', 'เออ', 'เอียะ', 'เอีย', 'เอือะ', 'เอือ', 'อัวะ', 'อัว', 'อำ', 'ใอ', 'ไอ', 'เอา', 'ฤ', 'ฤๅ', 'ฦ', 'ฦๅ']
TONES = ['อ่', 'อ้', 'อ๊', 'อ๋']
DIGITS = list('๐๑๒๓๔๕๖๗๘๙')


def metrics():
    """เส้นบรรทัดสำหรับกรอบคัดลายมือ: บนสุด (สระบน/วรรณยุกต์) · หัวตัวสูง · เส้นหัว (ความสูงตัวอักษร) · เส้นฐาน · ล่างสุด (สระล่าง/หาง)"""
    def top(t):
        m = render(t); ys = np.nonzero(m.any(axis=1))[0]; return int(ys.min()), int(ys.max())
    return {'S': S, 'base': top('ก')[1], 'x': top('ก')[0], 'asc': top('ป')[0], 'top': top('อ๋')[0], 'desc': top('ญ')[1]}


VOWELS_MALI = ['ฤ', 'ฤๅ', 'ฦ', 'ฦๅ']          # สระที่ยังใช้เส้นจากฟอนต์ Mali (ตัวเดี่ยว ไม่มีขีดแทนพยัญชนะ) สระอื่นมาจากวิดีโอ: vowel_trace.json


def build_js(out):
    data = {}
    for group in (CONS, VOWELS_MALI, DIGITS):          # รูปวรรณยุกต์ –่ –้ –๊ –๋ มาจาก vowel_trace.json (เขียนเป็นขีดแทนพยัญชนะ ไม่ใช้ อ่ อ้ อ๊ อ๋ แล้ว)
        for ch in group:
            _, _, strokes = extract(ch)
            data[ch] = [[round(v) for xy in st for v in xy] for st in strokes]
    dash = {}
    vt = HERE / 'vowel_trace.json'          # สระ 28 รูปที่เขียนเป็นรูปขีดแทนพยัญชนะ (–ะ เ–ีย ฯลฯ) ดึงจากวิดีโอสอนเขียนสระ ดู video_strokes.py / vowel_trace.py
    if vt.exists():
        for k, v in json.loads(vt.read_text(encoding='utf-8')).items():
            data[k] = v['strokes']; dash[k] = v['dash']
    so = HERE / 'stroke_overrides.json'         # ลายเส้นที่ครูเขียนเองในห้องลองเขียน (Aksorn-Stroke-Lab.html › บันทึกไฟล์ลายเส้น) ทับค่าอัตโนมัติทั้งหมด: out = {ตัวอักษร: {strokes, dash?}}
    if so.exists():
        for k, v in json.loads(so.read_text(encoding='utf-8')).get('out', {}).items():
            data[k] = v['strokes']
            if 'dash' in v: dash[k] = v['dash']
            elif k in dash: del dash[k]
    NL = chr(10)
    js = ('/* ===== Techno Aksorn: เส้นทางเขียนตามรอย (สร้างอัตโนมัติด้วย trace_extract.py ห้ามแก้มือ) =====' + NL +
          '   พยัญชนะ วรรณยุกต์ เลขไทย ฤ ฦ: เส้นกลางจากฟอนต์ Mali (OFL) · สระที่เขียนคู่ขีดกลาง (–ะ –า เ–ีย ฯลฯ): ลำดับและรูปเส้นจากวิดีโอสอนเขียนสระที่ครูส่งมา (vowel_trace.py) · ตัวที่ครูเขียนเองในห้องลองเขียนทับทั้งหมด (stroke_overrides.json)' + NL +
          '   TRACE[ตัวอักษร] = [เส้นที่ 1, เส้นที่ 2, ...] แต่ละเส้นคือ [x0,y0,x1,y1,...] ในกรอบ S×S เริ่มที่หัวตามลำดับการเขียน' + NL +
          '   TRACE_D[รูปสระ] = [x0, x1, y] ขีดกลางสีเทาที่แสดงตำแหน่งของพยัญชนะ (ไม่ต้องเขียน) ' + NL +
          '   TRACE_M = เส้นบรรทัด (base = เส้นฐาน, x = เส้นหัวตัวอักษร, asc = ตัวสูง, top = บนสุด, desc = ล่างสุด) */' + NL)
    js += 'const TRACE_M = ' + json.dumps(metrics()) + ';' + NL
    js += 'const TRACE = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';' + NL
    js += 'const TRACE_D = ' + json.dumps(dash, ensure_ascii=False, separators=(',', ':')) + ';' + NL
    Path(out).write_text(js, encoding='utf-8')
    return data


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'review':
        out = Path(sys.argv[2])
        chars = {'cons': CONS, 'vowels': VOWELS, 'tones': TONES + DIGITS}[sys.argv[3] if len(sys.argv) > 3 else 'cons']
        data = review(chars, out)
        print('ok', len(data), 'stroke counts:', ' '.join(f'{k}{len(v)}' for k, v in data.items()))
    else:
        data = build_js(HERE / 'trace-data.js')
        print('trace-data.js', len(data), 'ตัว', (HERE / 'trace-data.js').stat().st_size // 1024, 'KB', metrics())
