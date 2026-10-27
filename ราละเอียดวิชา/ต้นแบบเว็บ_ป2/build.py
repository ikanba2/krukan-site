"""รวม Techno ป.2 เป็นไฟล์เดียว Techno-P2-Offline.html : python build.py"""
from pathlib import Path
import base64, json, sys
sys.stdout.reconfigure(encoding='utf-8')
here = Path(__file__).resolve().parent
plan = json.loads((here.parent / 'แผนพัฒนาเว็บ_ป2_9บท_ส่งต่อAI' / 'course-plan.json').read_text(encoding='utf-8'))
KEEP = ['number', 'title', 'missionTitle', 'scene', 'boss', 'objectives', 'content', 'games', 'lab', 'real', 'bossRules', 'preQuestions', 'postQuestions']

# ภารกิจ 2 และ 7: ระดับ ป.2 ใช้ลูกศรบอกทิศ ↑ ↓ ← → (ไม่ใช้คำสั่ง "เดินหน้า/เลี้ยว")
ARROW_FIX = [
    ('บัตรเดินหน้า 2 ใบ หุ่นเดินกี่ช่อง', 'ลูกศร → 2 ตัว หุ่นเดินกี่ช่อง'),
    ('บัตรเดินหน้า 1 ใบทำให้หุ่นเคลื่อนกี่ช่อง?', 'ลูกศร → 1 ตัวทำให้หุ่นเคลื่อนกี่ช่อง?'),
    ('ด้วยบัตรเดินหน้า 2 ใบ', 'ด้วยลูกศร 2 ตัว'),
    ('เดินหน้า 1 ช่องแล้วดูตำแหน่ง', 'ลูกศร → 1 ตัว หุ่นไป 1 ช่อง แล้วดูตำแหน่ง'),
    ('เดินหน้า เลี้ยวขวา แล้วเดินหน้า', 'ลูกศร → ลูกศร ↓ แล้วลูกศร →'),
    ('บัตรเลี้ยวแล้วเดิน หุ่นควรทำอะไรก่อน', 'ลูกศร ↑ ตามด้วยลูกศร → หุ่นควรไปทางไหนก่อน'),
    ('เลี้ยวก่อนเดินทำให้ชนกำแพง', 'ไปผิดทิศก่อน ทำให้ชนกำแพง'),
    ('บัตรก่อนแก้เดินเลย ต่อมาเอาออกหนึ่งใบ', 'ก่อนแก้มีลูกศรเกิน ต่อมาเอาออกหนึ่งตัว'),
    ('ใช้ลูกศรนิ้วตามบัตร', 'ใช้นิ้วลากตามลูกศร'),
    ('เดินหน้า 2 ช่อง', 'เดินต่อไป 2 ช่อง'),
    ('เพิ่มเดินหน้า', 'เพิ่มลูกศร'),
    ('ลบบัตรเดิน', 'ลบลูกศร'),
    ('บัตรคำสั่ง', 'ลูกศรคำสั่ง'),
    ('บัตร', 'ลูกศร'),
]
ARROW_EXACT = {'เลี้ยว': 'ขึ้น (↑)', 'เดิน': 'ขวา (→)'}


def arrow_fix(o):
    if isinstance(o, str):
        if o in ARROW_EXACT:
            return ARROW_EXACT[o]
        for a, b in ARROW_FIX:
            o = o.replace(a, b)
        return o
    if isinstance(o, list):
        return [arrow_fix(x) for x in o]
    if isinstance(o, dict):
        return {k: arrow_fix(v) for k, v in o.items()}
    return o

units = []
for u in plan['units']:
    o = {k: u.get(k, '') for k in KEEP}
    o['topics'] = [{k: t.get(k, '') for k in ['name', 'teach', 'example', 'mission', 'success', 'hint', 'art', 'diagnostic', 'mechanic']} for t in u['topics']]
    o['stages'] = [{'kind': s['kind'], 'title': s['title'], 'pages': [{'role': p['role'], 'title': p['title'], 'body': p['body'], 'technoMotion': {k: p['technoMotion'][k] for k in ['primaryState', 'onSuccess', 'onWrong']}} for p in s['pages']]} for s in u['stages']]
    if u['number'] in (2, 7):
        o = arrow_fix(o)
    units.append(o)
manifest = json.loads((here / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
assets = {k: 'data:image/webp;base64,' + base64.b64encode((here / 'assets' / v).read_bytes()).decode('ascii') for k, v in manifest.items()}
data = 'const P2DATA=' + json.dumps({'units': units}, ensure_ascii=False) + ';\nconst ASSETS=' + json.dumps(assets) + ';'
css = (here / 'p2.css').read_text(encoding='utf-8')
js = '\n'.join((here / n).read_text(encoding='utf-8') for n in ['p2-act.js', 'p2-quest.js', 'p2-arcade.js'] + sorted(p.name for p in here.glob('p2-content-*.js')) + ['p2-core.js'])
html = (here / 'p2.source.html').read_text(encoding='utf-8')
html = html.replace('/*__CSS__*/', css).replace('/*__DATA__*/', data.replace('</', '<' + chr(92) + '/')).replace('/*__JS__*/', js.replace('</script', '<' + chr(92) + '/script'))
out = here / 'Techno-P2-Offline.html'
out.write_text(html, encoding='utf-8')
print('สร้างแล้ว', out.name, round(out.stat().st_size / 1e6, 1), 'MB')
