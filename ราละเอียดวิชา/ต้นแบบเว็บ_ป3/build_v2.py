"""สร้าง Techno-P3-Offline.html (ไฟล์เดียว) : python build_v2.py
ใช้ engine ร่วมกับ ป.2 (../ต้นแบบเว็บ_ป2: p2-act / p2-quest / p2-arcade / p2.css) + ข้อมูลโจทย์ ป.3 ใน p3v2-banks.json
ภาพ ป.3 ใน assets/ ; ท่า Techno / บอส / เอฟเฟกต์ ใช้ชุดเดียวกับ ป.2"""
from pathlib import Path
import base64, json, sys
sys.stdout.reconfigure(encoding='utf-8')
here = Path(__file__).resolve().parent
p2 = here.parent / 'ต้นแบบเว็บ_ป2'
plan = json.loads((here.parent / 'แผนพัฒนาเว็บ_ป3_9บท_ส่งต่อAI' / 'course-plan.json').read_text(encoding='utf-8'))
banks = json.loads((here / 'p3v2-banks.json').read_text(encoding='utf-8'))
assets = {}
m3 = json.loads((here / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
for k, v in m3.items():
    assets[k] = (here / 'assets' / v).read_bytes()
m2 = json.loads((p2 / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
for k, v in m2.items():
    if k.startswith('pose-') or k.startswith('P2-FX-') or k == 'boss03':
        assets[k] = (p2 / 'assets' / v).read_bytes()
ALIAS = {'P2-TS-01-idle': 'pose-ready', 'P2-TS-06-shield': 'pose-shield', 'P2-TS-07-tag-shot': 'pose-beam', 'P2-TS-08-hit': 'pose-puzzled', 'P2-TS-04-boost': 'pose-runR'}
for a, b in ALIAS.items():
    assets[a] = assets[b]
A = {k: 'data:image/webp;base64,' + base64.b64encode(v).decode('ascii') for k, v in assets.items()}
units = [{k: u[k] for k in ['id', 'number', 'academic', 'manual', 'indicator', 'background', 'goal', 'stages']} for u in plan['units']]
data = 'const P3DATA=' + json.dumps({'units': units}, ensure_ascii=False) + ';\nconst P3V2=' + json.dumps(banks, ensure_ascii=False) + ';\nconst ASSETS=' + json.dumps(A) + ';'
css = (p2 / 'p2.css').read_text(encoding='utf-8') + '\n' + (here / 'p3v2.css').read_text(encoding='utf-8')
js = '\nconst P2C={};\n' + '\n'.join(src.read_text(encoding='utf-8') for src in [here / '_legacy_v1' / 'p3-gas.js', p2 / 'p2-act.js', p2 / 'p2-quest.js', p2 / 'p2-arcade.js', here / 'p3v2-packs.js', here / 'p3v2-core.js'])
html = (here / 'p3v2.source.html').read_text(encoding='utf-8')
bs = chr(92)
html = html.replace('/*__CSS__*/', css).replace('/*__DATA__*/', data.replace('</', '<' + bs + '/')).replace('/*__JS__*/', js.replace('</script', '<' + bs + '/script'))
out = here / 'Techno-P3-Offline.html'
out.write_text(html, encoding='utf-8')
print('สร้างแล้ว', out.name, round(out.stat().st_size / 1e6, 1), 'MB ·', len(A), 'ภาพ')
