"""ดึงลำดับการเขียนสระจากวิดีโอสอนเขียนสระ (ผู้ใช้ส่งลิงก์มาเป็นแบบอ้างอิง 25 ต.ค. 2569: YouTube 6nicrlT9aiw ช่อง Aimphan) ให้เกม Techno Aksorn
วิธี: เล่นวิดีโอ จับภาพบริเวณกระดานทุก ~0.1 วินาที ตรวจพิกเซลสีดำ (หมึก) แล้วเก็บ 'เวลาที่พิกเซลนั้นปรากฏถาวร' (cap.js ในโฟลเดอร์ scratchpad ทำขั้นนี้)
ไฟล์นี้แปลง (x, y, เวลา) เป็นเส้นลากที่เรียงตามเวลา: จัดกลุ่มพิกเซลตามเวลา › ใช้จุดกึ่งกลางของแต่ละกลุ่มเป็นจุดบนเส้น › แยกเส้นเมื่อจุดกระโดดไกล (ยกปากกา)
› ทำให้เรียบ ลดจุด › เก็บขีดกลางสีเทา (ที่ของพยัญชนะ ไม่ต้องเขียน) แยกต่างหาก ผลคือ vowel_video_strokes.json (พิกัดครึ่งความละเอียดของกระดานในวิดีโอ ขนาด 260x175)
รัน: python tools/games/aksorn/video_strokes.py <segs.json> [<segs_b.json>] — ลำดับสระในวิดีโอ (ต้องตรวจป้ายชื่อสระจากภาพก่อน) อยู่ที่ ORDER_A / ORDER_B"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from scipy import ndimage

HERE = Path(__file__).resolve().parent
W, H = 260, 175
# ลำดับสระในวิดีโอ 6nicrlT9aiw (ตรวจจากป้ายชื่อ ‘สระ…’ ของแต่ละช่วง)
ORDER_A = ['–า', '–ี', '–ื', '–ู', 'เ–', 'แ–', 'โ–', '–อ', 'เ–อ', 'เ–ีย', '–ะ', '–ิ', '–ึ', '–ุ', 'เ–ะ', 'แ–ะ', 'โ–ะ', 'เ–าะ', '–ำ', 'ใ–', 'ไ–', 'เ–า']
ORDER_B = []        # วิดีโอตอนที่สอง (ถ้ามี) ใส่หลังตรวจป้ายชื่อ


def centroid_chunks(xs, ys, prev):
    """พิกเซลของหนึ่งช่วงเวลา › จุดกึ่งกลาง (ถ้ากลุ่มยาวมากให้แบ่งตามแกนหลักเป็นหลายจุด เรียงให้ต่อกับจุดก่อนหน้า)"""
    n = len(xs)
    if n <= 16:
        return [(xs.mean(), ys.mean())]
    pts = np.stack([xs, ys], 1).astype(float)
    c = pts.mean(0); u, s, vt = np.linalg.svd(pts - c, full_matrices=False); ax = vt[0]
    proj = (pts - c) @ ax; order = np.argsort(proj); pts = pts[order]
    k = max(2, n // 8); chunks = [pts[i * n // k:(i + 1) * n // k].mean(0) for i in range(k)]
    if prev is not None and math.dist(prev, chunks[0]) > math.dist(prev, chunks[-1]):
        chunks.reverse()
    return [tuple(c) for c in chunks]


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0]), np.array(pts[-1]); ab = b - a; L = np.linalg.norm(ab)
    d = [np.linalg.norm(np.array(p) - a) if L == 0 else abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / L for p in pts[1:-1]]
    i = int(np.argmax(d)) + 1
    if d[i - 1] > eps:
        return rdp(pts[:i + 1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]


def resample(pts, step):
    out = [pts[0]]; acc = 0.0
    for i in range(1, len(pts)):
        a, b = out[-1], pts[i]
        d = math.dist(a, b)
        while d >= step:
            t = step / d; a = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t); out.append(a); d = math.dist(a, b)
    if math.dist(out[-1], pts[-1]) > step * 0.4:
        out.append(pts[-1])
    return out


def analyse(seg):
    """ขั้นที่ 1: หาเส้นกลางของรอยที่เขียนในวิดีโอ แล้วแบ่งเป็น 'เส้นสั้น' (edge) ระหว่างปลายเส้น/จุดแยก เรียงเลขตามเวลาที่ปรากฏก่อน
    คืน edges (พิกเซล (y,x) ตามทิศที่เวลาเพิ่มขึ้น) และขีดกลาง ขั้นที่ 2 (build) ต่อเส้นสั้นเป็นเส้นลากตามสูตรใน vowel_recipes.json ที่ตรวจดูจากภาพแล้ว"""
    from trace_extract import zhang_suen, clean_corners, prune, graph
    flag = np.zeros((H, W), bool)
    for x, y, t, dash in seg['px']:
        if dash:
            flag[y, x] = True
    # ขีดกลาง = แถวพิกเซลแนวนอนยาวต่อเนื่อง ≥ 12 ที่ซ้อนกันไม่เกิน 5 แถว (เลือกกลุ่มที่ยาวที่สุด) ส่วนที่เหลือของ dash=1 คือเส้นประนำ
    runs = []
    for y in range(H):
        x = 0
        while x < W:
            if flag[y, x]:
                x0 = x
                while x < W and flag[y, x]:
                    x += 1
                if x - x0 >= 12:
                    runs.append((y, x0, x - 1))
            else:
                x += 1
    groups = []
    for r in runs:
        for g in groups:
            if abs(g[-1][0] - r[0]) <= 1 and min(g[-1][2], r[2]) - max(g[-1][1], r[1]) > 6:
                g.append(r); break
        else:
            groups.append([r])
    groups = [g for g in groups if len(g) <= 5]
    dash_px = set()
    if groups:
        best = max(groups, key=lambda g: sum(r[2] - r[1] + 1 for r in g))
        for y, x0, x1 in best:
            for x in range(x0, x1 + 1):
                dash_px.add((x, y))
    guide = flag.copy()
    for x, y in dash_px:
        guide[y, x] = False
    px = [(x, y, t) for x, y, t, dash in seg['px'] if (x, y) not in dash_px]
    dpx = list(dash_px)
    mask = np.zeros((H, W), bool); T = np.zeros((H, W), float)
    for x, y, t in px:
        mask[y, x] = True; T[y, x] = t
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    for i in range(1, n + 1):
        if (lab == i).sum() < 10:
            mask[lab == i] = False
    closed = ndimage.binary_closing(mask, structure=np.ones((3, 3))) | mask
    valid = mask & ~guide
    idx = ndimage.distance_transform_edt(~valid, return_distances=False, return_indices=True)
    T = ndimage.median_filter(T[idx[0], idx[1]], size=3)
    sk = prune(clean_corners(zhang_suen(closed)), minlen=9)
    edges, cluster, deg = graph(sk)
    E = []
    for e in edges:
        pts = e['pts']
        if len(pts) < 3:
            continue
        ts = np.array([T[y, x] for y, x in pts]); k = max(1, int(len(ts) * 0.35))
        f, l = float(np.median(ts[:k])), float(np.median(ts[-k:]))
        rev = f > l + 0.5
        if rev:
            pts = pts[::-1]; ts = ts[::-1]; f, l = l, f
            e = {'a': e['b'], 'b': e['a'], 'pts': pts}
        E.append({'a': e['a'], 'b': e['b'], 'pts': pts, 'first': f, 'last': l, 'med': float(np.median(ts))})
    E.sort(key=lambda e: (e['med'], e['first']))
    for i, e in enumerate(E):
        e['id'] = i + 1
    dash = None
    if dpx:
        xs = [p[0] for p in dpx]; ys = [p[1] for p in dpx]
        dash = [min(xs), float(np.mean(ys)), max(xs)]
    return {'edges': E, 'dash': dash, 'mask': mask}


def build(an, recipe):
    """ขั้นที่ 2: recipe = [[รหัสเส้นสั้น ติดลบ = เดินย้อนทิศ, ...], ...] หนึ่งรายการต่อหนึ่งเส้นที่ลาก (ยกปากกา = เริ่มรายการใหม่)"""
    from trace_extract import smooth_simplify
    by = {e['id']: e for e in an['edges']}; out = []
    for st in recipe:
        pts = []
        for r in st:
            e = by[abs(r)]; seg_pts = e['pts'] if r > 0 else e['pts'][::-1]
            if pts and math.dist(pts[-1], seg_pts[0]) > math.dist(pts[-1], seg_pts[-1]):
                seg_pts = seg_pts[::-1]
            pts += seg_pts if not pts else seg_pts[1:]
        sm = smooth_simplify(pts, step=3)
        out.append([[round(x, 1), round(y, 1)] for x, y in sm])
    return out


def extract_auto(seg):
    """เส้นกลางของรอยที่เขียน (Zhang-Suen) › เริ่มเดินที่ปลายเส้นที่ปรากฏก่อนสุด › เลี้ยวน้อยที่สุดตรงจุดแยก › เส้นที่เหลือเริ่มจากปลายที่ปรากฏก่อน
    ใช้ได้ดีกับรูปเปิด (า เ แ โ ใ ไ ะ อำ) รูปปิดอย่างโดมของ ิ ี ึ ื ต้องแก้ด้วยมือใน vowel_trace.py"""
    from trace_extract import zhang_suen, clean_corners, prune, smooth_simplify, deg_in, N8
    an = analyse(seg); mask = an['mask']
    # วาดมาสก์ใหม่พร้อมเวลา (analyse ไม่คืนเวลา จึงคำนวณซ้ำแบบเดียวกัน)
    T = np.zeros((H, W), float)
    for x, y, t, dash in seg['px']:
        T[y, x] = t
    valid = mask
    idx = ndimage.distance_transform_edt(~valid, return_distances=False, return_indices=True)
    T = ndimage.median_filter(T[idx[0], idx[1]], size=3)
    closed = ndimage.binary_closing(mask, structure=np.ones((3, 3))) | mask
    sk = prune(clean_corners(zhang_suen(closed)), minlen=4)
    left = set(zip(*np.nonzero(sk))); strokes = []
    while left:
        ends = [q for q in left if deg_in(q, left) <= 1]
        pool = ends or list(left)
        cur = min(pool, key=lambda q: (T[q], q[1])); path = [cur]; left.discard(cur)
        while True:
            y, x = path[-1]
            nb = [(y + dy, x + dx) for dy, dx in N8 if (y + dy, x + dx) in left]
            if not nb:
                break
            if len(path) < 3:
                nxt = min(nb, key=lambda q: (T[q], deg_in(q, left)))
            else:
                k = min(len(path) - 1, 5); h = math.atan2(path[-1][0] - path[-1 - k][0], path[-1][1] - path[-1 - k][1])
                nxt = min(nb, key=lambda q: abs((math.atan2(q[0] - y, q[1] - x) - h + math.pi) % (2 * math.pi) - math.pi))
            path.append(nxt); left.discard(nxt)
        if len(path) >= 6:
            strokes.append(path)
    strokes.sort(key=lambda pth: float(np.median([T[q] for q in pth[:6]])))
    return [[[round(x, 1), round(y, 1)] for x, y in smooth_simplify(pts, step=3)] for pts in strokes], an['dash']


def main():
    """python video_strokes.py <การจับภาพครั้งที่ 2 (ดี)> [<ครั้งที่ 1 ใช้เติมขีดกลางที่หาย/รูปที่ครั้งที่ 2 เสีย>]"""
    segs2 = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    segs1 = json.loads(Path(sys.argv[2]).read_text(encoding='utf-8')) if len(sys.argv) > 2 else None
    res = {}
    for i, key in enumerate(ORDER_A):
        strokes, dash = extract_auto(segs2[i]); src = 2
        npts = sum(len(q) for q in strokes)
        if segs1 and (dash is None or npts < 25):
            s1, d1 = extract_auto(segs1[i])
            if sum(len(q) for q in s1) > npts:
                strokes, src = s1, 1
            if dash is None:
                dash = d1
            elif src == 1 and d1:
                dash = d1
        res[key] = {'strokes': strokes, 'dash': [float(v) for v in dash] if dash else None}
        print(key, 'strokes', len(strokes), [len(q) for q in strokes], 'capture', src, 'dash', 'ok' if dash else 'NONE')
    (HERE / 'vowel_video_strokes.json').write_text(json.dumps(res, ensure_ascii=False), encoding='utf-8')
    print('saved', len(res))


if __name__ == '__main__':
    main()
