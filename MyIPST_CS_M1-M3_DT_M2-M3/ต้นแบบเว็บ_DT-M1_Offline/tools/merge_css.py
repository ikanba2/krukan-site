"""รวม CSS ทั้ง 6 ไฟล์เป็น dt-m1.css (ลำดับเดิม = ผลการทับกันเหมือนเดิม) และตัดกฎที่ใช้ class/id ที่ไม่มีในโค้ดแล้ว
ใช้: python tools/merge_css.py  · ไฟล์ต้นฉบับย้ายไปเก็บที่ qa/legacy/css/ หลังรวมสำเร็จ (ใส่ --move)
กฎตัดแบบระวัง: เก็บไว้ถ้าชื่อ class/id ปรากฏที่ใดก็ได้ในไฟล์ .js/.html หรือขึ้นต้นด้วยส่วนที่โค้ดประกอบชื่อแบบไดนามิก เช่น `pr-${...}`"""
import re, sys, glob, os, shutil
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ['app.css', 'combat-ui.css', 'gaming.css', 'sims.css', 'comic.css', 'ui-clean.css']
src = ''
for f in glob.glob(os.path.join(HERE, '*.js')) + glob.glob(os.path.join(HERE, '*.html')):
    if os.path.basename(f) in ('gas-sim.js',) or os.path.basename(f).startswith('_'): continue
    src += open(f, encoding='utf-8').read() + '\n'
dyn = set(re.findall(r'([A-Za-z][\w-]*[-_])\$\{', src)) | set(re.findall(r"([A-Za-z][\w-]*[-_])['\"] *\+", src))

def alive(tok):
    if tok in src: return True
    return any(tok.startswith(p) for p in dyn)

def split_sel(s):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([': depth += 1
        elif ch in ')]': depth -= 1
        if ch == ',' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur); return [x.strip() for x in out if x.strip()]

def sel_alive(sel):
    toks = re.findall(r'[.#]([A-Za-z_][\w-]*)', re.sub(r'\[[^\]]*\]', '', sel))
    return all(alive(t) for t in toks)

def strip_comments(css): return re.sub(r'/\*.*?\*/', '', css, flags=re.S)

stats = {'kept': 0, 'dropped': 0}
def process(css):
    out, i, n = [], 0, len(css)
    while i < n:
        while i < n and css[i] in ' \t\r\n': i += 1
        if i >= n: break
        j = css.find('{', i); k = css.find(';', i)
        if css[i] == '@' and (k != -1 and (j == -1 or k < j)):  # @import / @charset
            out.append(css[i:k + 1]); i = k + 1; continue
        if j == -1: break
        head = css[i:j].strip()
        depth, m = 1, j + 1
        while m < n and depth:
            if css[m] == '{': depth += 1
            elif css[m] == '}': depth -= 1
            m += 1
        body = css[j + 1:m - 1]
        if head.startswith('@media') or head.startswith('@supports'):
            inner = process(body)
            if inner.strip(): out.append(head + '{' + inner + '}')
        elif head.startswith('@'):
            out.append(head + '{' + body + '}')
        else:
            sels = split_sel(head); keep = [s for s in sels if sel_alive(s)]
            if keep: out.append(','.join(keep) + '{' + body.strip() + '}'); stats['kept'] += 1
            else: stats['dropped'] += 1
        i = m
    return '\n'.join(out)

parts = []
for f in ORDER:
    css = strip_comments(open(os.path.join(HERE, f), encoding='utf-8').read())
    parts.append('/* ===== จาก ' + f + ' ===== */\n' + process(css))
merged = '/* dt-m1.css · รวมจาก ' + ', '.join(ORDER) + ' โดย tools/merge_css.py (อย่าแก้ไฟล์ต้นฉบับเดิม ให้แก้ที่ไฟล์นี้) */\n' + '\n'.join(parts) + '\n'
open(os.path.join(HERE, 'dt-m1.css'), 'w', encoding='utf-8').write(merged)
print('rules kept', stats['kept'], 'dropped', stats['dropped'], 'size', len(merged.encode('utf-8')))
if '--move' in sys.argv:
    dst = os.path.join(HERE, 'qa', 'legacy', 'css'); os.makedirs(dst, exist_ok=True)
    for f in ORDER: shutil.move(os.path.join(HERE, f), os.path.join(dst, f))
    print('moved originals to qa/legacy/css')
