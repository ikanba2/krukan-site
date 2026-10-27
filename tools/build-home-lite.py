"""สร้าง Home-Play-Learn-Lite.html (หน้า home เวอร์ชันเบา) จากข้อมูลจริงในหน้า home เดิม โดยไม่แก้ไฟล์เดิม
ข้อมูล (ชั้นเรียน กิจกรรม เครื่องมือ วิดีโอ เมนู บันทึกอัปเดต) ดึงมาจาก Home-Play-Learn-Gaming.html เพื่อให้ตรงกันเสมอ
ภาพ base64 ก้อนใหญ่ของกิจกรรมถูกตัดทิ้ง (เวอร์ชันนี้ใช้ไอคอน/สีแทน) ส่วนฉากโหลด (มอเตอร์ไซค์) ใช้ชุดเดียวกับหน้าเดิม
รัน: python tools/build-home-lite.py"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / 'Home-Play-Learn-Gaming.html').read_text(encoding='utf-8')
tpl = (root / 'tools' / 'home-lite' / 'template.html').read_text(encoding='utf-8')
style = (root / 'tools' / 'home-lite' / 'style.css').read_text(encoding='utf-8')

# ---- 1) config blocks from the old page's main script (evaluated by Node, output as JSON)
a = src.index("const SITE_BASE=")
b = src.index("const $=(s,r=document)")
cfg_js = src[a:b]
runner = cfg_js + """
const out={SITE_MENU,TRANSFORM,SITE_INFO,DATA:{classes:DATA.classes,
  activities:DATA.activities.map(x=>({title:x.title,url:x.url,new:!!x.new,image:x.image||''})),tools:DATA.tools},
  ACTIVITY_INFO,GROUP_LABELS,TOOL_GROUPS};
process.stdout.write(JSON.stringify(out));
"""
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
    f.write(runner)
    tmp = f.name
res = subprocess.run(['node', tmp], capture_output=True, text=True, encoding='utf-8')
if res.returncode != 0:
    sys.exit('node failed: ' + res.stderr[:600])
data = json.loads(res.stdout)

# ---- 1a) หน้าใหม่ที่ยังไม่อยู่ใน SITE_MENU ของหน้า home หลัก: เพิ่มเข้าแผนที่เว็บไซต์ของฉบับเบา (ข้ามถ้ามี url เดียวกันอยู่แล้ว)
#      id ต้องมีไอคอนใน MEMO ของ tools/home-lite/template.html
EXTRA_MENU = [
    {'id': 'manga', 'title': 'มังงะ', 'en': 'MANGA', 'url': '/Techno-Manga-Reader', 'icon': 'book', 'c': '#f43f5e', 'isNew': True},
    {'id': 'origin', 'title': 'ที่มาของเว็บ', 'en': 'ORIGIN', 'url': '/Innovation-Model-KruKan', 'icon': 'compass', 'c': '#a3e635', 'isNew': True},
]
menu = data['SITE_MENU']
at = next((i + 1 for i, m in enumerate(menu) if m.get('id') == 'domain'), len(menu))
for item in EXTRA_MENU:
    if not any(m.get('url', '').rstrip('/').lower() == item['url'].lower() for m in menu):
        menu.insert(at, item)
        at += 1

# ---- 1b) keep the pictures but make them light: lh3 links -> smaller size; base64 images -> small WebP thumbnails
import base64, io
from PIL import Image
for x in data['DATA']['activities']:
    im = x.get('image') or ''
    if im.startswith('data:'):
        raw = base64.b64decode(im.split(',', 1)[1])
        pic = Image.open(io.BytesIO(raw)).convert('RGB'); pic.thumbnail((480, 270))
        buf = io.BytesIO(); pic.save(buf, 'WEBP', quality=62, method=6)
        x['image'] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
    elif im:
        x['image'] = re.sub(r'=w\d+$', '=w480', im)
for c in data['DATA']['classes']:
    c['deco'] = re.sub(r'=w\d+$', '=w320', c.get('deco', ''))

# ---- 2) videos (id / title / topic / colour) from the old HTML
vids = []
topics = re.findall(r'<span class="video-topic">([^<]+)</span>', src)
for i, m in enumerate(re.finditer(r'class="video-card[^"]*"[^>]*style="--vc:([^"]+)"[^>]*href="[^"]*v=([^"&]+)"[^>]*aria-label="เปิดวิดีโอ (.*?) บน YouTube"', src)):
    vids.append({'id': m.group(2), 'title': m.group(3), 'topic': topics[i] if i < len(topics) else '', 'c': m.group(1)})
assert len(vids) == 8, len(vids)

# ---- 3) fixed small blocks (text copied from the old page)
base = data['SITE_MENU'] and 'https://www.krukan.in.th'
quick = [
    {'k': 'MANGA', 't': 'มังงะ', 'e': '📖', 'c': '#b78cff', 'url': base + '/Techno-Manga-Reader'},
    {'k': 'ORIGIN', 't': 'ที่มาของเว็บ', 'e': '🧭', 'c': '#5ca9ff', 'url': base + '/Innovation-Model-KruKan'},
    {'k': 'CONTACT', 't': 'ช่องทางการติดต่อ', 'e': '✉️', 'c': '#ff5e9f', 'url': base + '/contact'},
]
missions = [
    {'k': 'MISSION 01 · MAIN QUEST', 't': 'ตรวจสอบคะแนนและผลการเรียนรู้', 'd': 'ใช้ผลคะแนนช่วยเลือกเรื่องที่จะกลับไปทบทวน', 'xp': '+100 XP', 'b': 'เปิดดูคะแนน', 'c': '#ff3d91', 'url': base + '/score_1'},
    {'k': 'MISSION 02 · SIDE QUEST', 't': 'แบบสอบถามและความคิดเห็นจากผู้ใช้งาน', 'd': 'บอกสิ่งที่ชอบ จุดที่ติดขัด และสิ่งที่อยากให้พัฒนา', 'xp': '+50 XP', 'b': 'แสดงความคิดเห็น', 'c': '#4ef4d2', 'url': base + '/poll'},
    {'k': 'MISSION 03 · KNOWLEDGE QUEST', 't': 'ตัวชี้วัดของแต่ละรายวิชา', 'd': 'เลือกวิชาและระดับชั้น เพื่อดูตัวชี้วัดที่เกี่ยวข้อง', 'xp': '+75 XP', 'b': 'เปิดดูตัวชี้วัด', 'c': '#5ca9ff', 'url': base + '/indicator'},
]
domains = [
    {'e': '🚩', 'c': '#5ca9ff', 't': 'โดเมนประจำประเทศไทย', 'd': '.th และ .ไทย เป็นชื่อโดเมนระดับบนสุดของประเทศไทย บอกได้ทันทีว่าเป็นเว็บไซต์ของคนไทย'},
    {'e': '🛡️', 'c': '#4ef4d2', 't': 'ตรวจสอบตัวตนผู้จดทะเบียน', 'd': 'ผู้จดทะเบียนต้องยืนยันตัวตนด้วยเอกสาร ผู้เรียนและผู้ปกครองจึงมั่นใจได้ว่าเว็บนี้เป็นของครูจริง'},
    {'e': '🔤', 'c': '#ffd34f', 't': '.ไทย ชื่อเว็บภาษาไทย', 'd': 'ตั้งชื่อเว็บเป็นภาษาไทยได้ทั้งหมด จำง่าย พิมพ์ง่าย เหมาะกับผู้เรียนตัวเล็ก'},
]
fresh = [x['title'] for x in data['DATA']['activities'] if x['new']]
ticker = ['SEASON 2026 · National Stage', '9 Learning Stages · ป.1–ม.3', f"ARCADE · {len(data['DATA']['activities'])} เกมการเรียนรู้"] + ['NEW GAME · ' + t for t in fresh[:6]] + ['LEARNING TRANSFORM · แปลงร่างการเรียนรู้', 'รู้จัก .th และ .ไทย']

blob = 'const SITE_BASE=%s;\n' % json.dumps(base)
# ภาพจากโฟลเดอร์ภาพของครู (ย่อเป็น WebP ฝังในไฟล์) — ดู tools/home-lite/assets.py
sys.path.insert(0, str(root / 'tools' / 'home-lite'))
import assets as _assets
ASSETS = _assets.build(data['DATA']['activities'])
blob += 'const ASSETS=%s;\n' % json.dumps(ASSETS, separators=(',', ':'))
for k in ('SITE_MENU', 'TRANSFORM', 'SITE_INFO', 'DATA', 'ACTIVITY_INFO', 'GROUP_LABELS', 'TOOL_GROUPS'):
    blob += 'const %s=%s;\n' % (k, json.dumps(data[k], ensure_ascii=False, separators=(',', ':')))
for k, v in (('VIDEOS', vids), ('QUICK', quick), ('MISSIONS', missions), ('DOMAINS', domains), ('TICKER', ticker)):
    blob += 'const %s=%s;\n' % (k, json.dumps(v, ensure_ascii=False, separators=(',', ':')))

# ---- 4) boot scene (same as the main page) : css, html, js
ba = src.index('/* ===== Boot screen ===== */')
bb = src.index('\n', src.index('@media(prefers-reduced-motion:reduce){.bs-stars'))
boot_css = src[ba:bb]
boot_html = re.search(r'<div class="boot" id="boot".*?\n  </div>\n', src, re.S).group(0)
boot_js = re.search(r'function runBoot\(\)\{.*?\n    \}\n', src, re.S).group(0)
boot_js = boot_js.replace('boot.classList.add(\'is-out\')', "boot.classList.add('is-out')")

# portraits (lh3 links already used by the main page)
here_img = root / 'tools' / 'home-lite' / 'img'
imgs = re.findall(r'class="portrait portrait-(?:front|back)">.*?<img src="([^"]+)"', src, re.S)
if len(imgs) < 2:
    imgs = re.findall(r'<img src="(https://lh3\.googleusercontent\.com/d/[^"]+)" alt="(?:นายยุทธการ[^"]*|ภาพโปรไฟล์อีกด้าน[^"]*)"', src)
front, back = imgs[0], imgs[1]
# ภาพโปรไฟล์ธีมสว่าง: ใช้ภาพที่ครูเลือก (หน้า=ครู, หลัง=ไซเบอร์ไรเดอร์) ฝังเป็น WebP แทนลิงก์ Drive
front = _assets.webp(here_img / 'profile-front.webp', (480, 600), 70) or front
back = _assets.webp(here_img / 'profile-back.webp', (480, 600), 70) or back

out = (tpl.replace('/*__STYLE__*/', style).replace('/*__DATA__*/', blob).replace('/*__BOOT_CSS__*/', boot_css).replace('<!--__BOOT_HTML__-->', boot_html)
          .replace('/*__BOOT_JS__*/', boot_js).replace('__SITE_BASE__', base).replace('__PORTRAIT_FRONT__', front).replace('__PORTRAIT_BACK__', back))
(root / 'Home-Play-Learn-Lite.html').write_text(out, encoding='utf-8')
print('built Home-Play-Learn-Lite.html', len(out.encode('utf-8')) // 1024, 'KB', '| old', len(src.encode('utf-8')) // 1024, 'KB')
