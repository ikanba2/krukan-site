from pathlib import Path
from io import BytesIO
from PIL import Image
import base64, json

folder = Path(__file__).resolve().parent
root = folder.parent.parent
assets = root / 'tools' / '.asset-cache'
html = (folder / 'offline.source.html').read_text(encoding='utf-8')
html = html.replace('__BATTLE_STYLE__', (folder / 'battle-phaser.css').read_text(encoding='utf-8'))
html = html.replace('__BATTLE_SCRIPT__', (folder / 'battle-phaser.js').read_text(encoding='utf-8'))
html = html.replace('__LOGIN_STYLE__', (folder / 'login.css').read_text(encoding='utf-8'))
html = html.replace('__LOGIN_SCRIPT__', (folder / 'login-school.js').read_text(encoding='utf-8'))
html = html.replace('__EXPANDED_SCRIPT__', '\n'.join((folder / name).read_text(encoding='utf-8') for name in ['kk-loader.js','kk-boss.js','skill-games.js','learning-expanded.js','lesson-content.js','mission-learning.js','mission-score-v5.js','hero-planet.js','kk-features.js','pose-variety.js']))
html = html.replace('__ALL_UNITS_SCRIPT__', (folder / 'all-units-v6.js').read_text(encoding='utf-8') + '\n' + (folder / 'code-quest.js').read_text(encoding='utf-8') + '\n' + (folder / 'kid-text.js').read_text(encoding='utf-8'))
html = html.replace('__EXPANDED_STYLE__', '\n'.join((folder / name).read_text(encoding='utf-8') for name in ['learning-expanded.css','lesson-content.css','shared-planet.css','mission-ui-v4.css','mission-score-v5.css','hero-planet.css','krukan-theme.css','readability.css']))
html = html.replace('__ALL_UNITS_STYLE__', '\n'.join((folder / n).read_text(encoding='utf-8') for n in ['all-units-v6.css','units-ui.css','code-quest.css','compact.css']))
course_plan = json.loads((folder.parent / 'แผนพัฒนาเว็บ_ป1_9บท_ส่งต่อAI' / 'course-plan.json').read_text(encoding='utf-8'))
course_units = [{k: u[k] for k in ['unitId','number','academicTitle','guideTitle','missionTitle','objectives','topics','stages','pageCount','endIndicators','interimIndicators','pages']} for u in course_plan['units']]
html = html.replace('__ALL_UNITS_DATA__', json.dumps(course_units, ensure_ascii=False).replace('</', '<\\/'))
extra = folder.parent / 'แผนพัฒนาเว็บ_ป1_9บท_ส่งต่อAI' / 'assets-output'
unit_assets = {}
for sub in ['learning-cards','scenes','backgrounds']:
    for file in sorted((extra / sub).glob('*.png')):
        with Image.open(file) as img:
            img.thumbnail({'learning-cards':(340,340),'scenes':(760,760),'backgrounds':(960,600)}[sub], Image.Resampling.LANCZOS)
            output = BytesIO()
            img.save(output, format='WEBP', quality=82, method=5)
        unit_assets[file.stem] = 'data:image/webp;base64,' + base64.b64encode(output.getvalue()).decode('ascii')
html = html.replace('__ALL_UNITS_ASSETS__', json.dumps(unit_assets).replace('</', '<\\/'))
learning_assets = {}
for file in (folder / 'assets/learning-v4').iterdir():
    if file.suffix in ['.png','.jpg'] and not file.name.startswith(('activity-atlas','contact-sheet')):
        with Image.open(file) as img:
            output=BytesIO()
            img.save(output,format='WEBP',quality=80,method=5)
        learning_assets[file.stem]='data:image/webp;base64,'+base64.b64encode(output.getvalue()).decode('ascii')
# ท่า MaskRider Techno เพิ่มเติม (ขับยาน/ท่าสู้) จาก prepare_poses.py -> คีย์ techno-ship-*, techno-shot-*
for file in sorted((folder / 'assets/poses').glob('*.webp')):
    learning_assets['techno-'+file.stem]='data:image/webp;base64,'+base64.b64encode(file.read_bytes()).decode('ascii')
html = html.replace('__LEARNING_ASSETS__', json.dumps(learning_assets,ensure_ascii=False))
html = html.replace('__PHASER_LIBRARY__', (folder / 'vendor/phaser-3.90.0.min.js').read_text(encoding='utf-8').replace('</script', '<\\/script'))
for token, name in {
    '__BOSS_FULL__': 'golden-parasite-3x3.png',
    '__SHOOTER__': 'maskrider-techno-shooter-3x2-v1.png',
    '__PORTRAIT__': 'techno-003-thumbs-up.png'
}.items():
    with Image.open(folder / 'assets' / name) as img:
        output=BytesIO()
        img.save(output,format='WEBP',quality=82,method=5)
    html = html.replace(token, 'data:image/webp;base64,' + base64.b64encode(output.getvalue()).decode('ascii'))
for token, name in {
    '__BOSS__': '1PXrxzjUSVevLig4AQM-RUsMq_hriu_ft-600.png',
    '__SHIP__': '182dPIjqL2ZMx7LmnkXenhKxj8nr9YZoJ-240.png',
    '__TECHNO__': '1MZ0ANXfwJvZgVI0w3ruMfXweMgdEH2K_-320.png'
}.items():
    with Image.open(assets / name) as img:
        output=BytesIO()
        img.save(output,format='WEBP',quality=80,method=5)
    html = html.replace(token, 'data:image/webp;base64,' + base64.b64encode(output.getvalue()).decode('ascii'))
curriculum = json.loads((folder.parent / 'curriculum-data.json').read_text(encoding='utf-8'))['1']
html = html.replace('__CURRICULUM__', json.dumps(curriculum, ensure_ascii=False).replace('</', '<\\/'))
(folder / 'Techno-P1-Offline.html').write_text(html, encoding='utf-8')
print('Built standalone offline HTML:', folder / 'Techno-P1-Offline.html')
