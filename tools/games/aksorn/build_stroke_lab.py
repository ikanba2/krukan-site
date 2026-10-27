"""สร้างหน้า Aksorn-Stroke-Lab.html (ห้องลองเขียน) ที่โฟลเดอร์หลักของเว็บ: ไฟล์เดียว เปิดได้เลยโดยไม่ต้องมีเซิร์ฟเวอร์ ฝังฟอนต์ ข้อมูลตั้งต้น และลายเส้นที่ครูบันทึกไว้ล่าสุด (stroke_overrides.json) ถ้ามี
ครูเขียนลายเส้นในหน้านี้ › ปุ่ม 'บันทึกไฟล์ลายเส้น' ได้ stroke_overrides.json › วางไว้ที่โฟลเดอร์นี้ › python tools/games/aksorn/trace_extract.py (ผสานเข้า trace-data.js) › python tools/build-games.py aksorn
แกนประกอบสระ: stroke-lab-core.js (ทดสอบด้วย test_stroke_lab.js) · ข้อมูลตั้งต้น: stroke_parts_init.py
รัน: python tools/games/aksorn/build_stroke_lab.py"""
import base64
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = ROOT / 'Aksorn-Stroke-Lab.html'

LABEL_JS = r"""
const vm=require('vm'),fs=require('fs');
const ctx={TP_:()=>null,K_:()=>null,A_:()=>null,T_:()=>null,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[1],'utf8')+';this.__o={CONS:CONS.map(r=>r.slice(0,4)),VOWELS:VOWELS.map(r=>r.slice(0,7)),CHANGES,TONE_NAME,DIGIT_NAME}',ctx);
console.log(JSON.stringify(ctx.__o));
"""


def thai_tables():
    r = subprocess.run(['node', '-e', LABEL_JS, str(HERE / 'thai-data.js')], capture_output=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


def trace_data():
    s = (HERE / 'trace-data.js').read_text(encoding='utf-8')
    def grab(name):
        i = s.index('const %s = ' % name) + len('const %s = ' % name); j = s.index(';\n', i); return json.loads(s[i:j])
    return grab('TRACE'), grab('TRACE_D'), grab('TRACE_M')


def font_css():
    css = ''
    for fam, f in (('AkMali', 'Mali-subset.woff2'), ('AkSarabun', 'Sarabun-subset.woff2')):
        b = base64.b64encode((HERE / 'fonts' / f).read_bytes()).decode('ascii')
        css += "@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:100 900;font-display:block}\n" % (fam, b)
    return css


def main():
    init = json.loads((HERE / 'stroke_parts_init.json').read_text(encoding='utf-8'))
    T = thai_tables(); TRACE, TRACE_D, TRACE_M = trace_data()
    forms = set(init['forms'])
    init['glyphs'] = {k: v for k, v in TRACE.items() if k not in forms}
    labels = {}; groups = []
    cons = [r[0] for r in T['CONS']]
    for r in T['CONS']: labels[r[0]] = {'name': r[1], 'sample': r[0], 'hint': 'พยัญชนะ'}
    groups.append({'id': 'cons', 'name': 'พยัญชนะ', 'keys': cons})
    vow = []
    for r in T['VOWELS']:
        vow.append(r[1]); ex = r[5]
        labels[r[1]] = {'name': r[2], 'sample': ' '.join(ex[:3]), 'hint': 'เสียงสั้น' if r[3] == 's' else 'เสียงยาว' if r[3] == 'l' else ''}
    ch = ['–ั', 'เ–็', 'แ–็', '–็อ', 'เ–ิ', '–ว', '–็']
    for r in T['CHANGES']:
        if r[2] not in forms: continue
        pairs = r[5]; word = lambda p: r[2].replace('–', p[0]) + p[1]
        labels[r[2]] = {'name': 'ว (ลดรูปของสระอัว)' if r[3] == 'ว' else r[3], 'sample': ' '.join(word(p) for p in pairs[:3]), 'hint': r[4]}
    labels['–็'] = {'name': 'ไม้ไต่คู้', 'sample': 'ก็ เด็ก', 'hint': 'ไม้ไต่คู้ที่ใช้ในสระเปลี่ยนรูป'}
    left = [k for k in init['forms'] if k not in vow and k not in ch and k not in T['TONE_NAME']]
    if left: print('รูปสระที่ไม่อยู่ในตารางสระ (ใส่ท้ายหมวดสระ):', left); vow += left
    groups.append({'id': 'vow', 'name': 'สระ', 'keys': vow})
    groups.append({'id': 'chg', 'name': 'สระเปลี่ยนรูป', 'keys': ch})
    tones = list(T['TONE_NAME']); digits = list(T['DIGIT_NAME'])
    for k, v in T['TONE_NAME'].items(): labels[k] = {'name': v, 'sample': k, 'hint': 'เขียนเฉพาะรูปวรรณยุกต์ ขีดกลางคือที่ของพยัญชนะ (ไม่ต้องเขียน)'}
    for k, v in T['DIGIT_NAME'].items(): labels[k] = {'name': 'เลข ' + v, 'sample': k, 'hint': ''}
    groups.append({'id': 'tone', 'name': 'วรรณยุกต์', 'keys': tones}); groups.append({'id': 'digit', 'name': 'เลขไทย', 'keys': digits})
    missing = [k for g in groups for k in g['keys'] if k not in TRACE]
    if missing: print('ไม่พบเส้นของ:', missing)
    saved = None; sp = HERE / 'stroke_overrides.json'
    if sp.exists(): saved = json.loads(sp.read_text(encoding='utf-8')); saved.pop('out', None)
    data = ('const INIT = %s;\nconst SAVED = %s;\nconst LABELS = %s;\nconst GROUPS = %s;\nconst TMET = %s;\n' % tuple(json.dumps(v, ensure_ascii=False, separators=(',', ':')) for v in (init, saved, labels, groups, TRACE_M))).replace('</', '<' + chr(92) + '/')
    html = (HERE / 'stroke-lab.html').read_text(encoding='utf-8')
    for tag, val in (('/*__FONTS__*/', font_css()), ('/*__CORE__*/', (HERE / 'stroke-lab-core.js').read_text(encoding='utf-8')), ('/*__DATA__*/', data)):
        assert html.count(tag) == 1, tag
        html = html.replace(tag, val)
    OUT.write_text(html, encoding='utf-8', newline='')
    print(OUT.name, OUT.stat().st_size // 1024, 'KB', '· กลุ่ม', ' '.join('%s=%d' % (g['id'], len(g['keys'])) for g in groups), '· มีลายเส้นที่บันทึกไว้' if saved else '')


main()
