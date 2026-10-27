"""ภาพสำหรับหน้า home (เวอร์ชันเบา): อ่านจากโฟลเดอร์ภาพใน Google Drive ของครู แล้วย่อเป็น WebP เล็กๆ ฝังในไฟล์
ถ้าเครื่องไหนไม่มีโฟลเดอร์ภาพ จะได้ค่าว่าง และหน้าเว็บใช้ไอคอน/สีแทนอัตโนมัติ"""
import base64, io, json
from pathlib import Path
from PIL import Image

PIC = Path(r'G:/My Drive/krukan/Pic')
TA = PIC / 'Techno asset'
_cache = {}

def webp(path, box, q=72, crop=None):
    """ย่อภาพให้อยู่ในกรอบ box (w,h) แล้วคืน data URI · crop=(w,h) = ตัดให้พอดีสัดส่วนก่อน"""
    p = Path(path)
    if not p.exists():
        return ''
    key = (str(p), box, q, crop)
    if key in _cache:
        return _cache[key]
    im = Image.open(p)
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if crop:
        cw, ch = crop
        r = cw / ch
        w, h = im.size
        if w / h > r:
            nw = int(h * r); x = (w - nw) // 2; im = im.crop((x, 0, x + nw, h))
        else:
            nh = int(w / r); y = (h - nh) // 2; im = im.crop((0, y, w, y + nh))
    im.thumbnail(box, Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=6)
    uri = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
    _cache[key] = uri
    return uri

def pose(num, box=(190, 190)):
    hits = sorted(TA.glob(f'techno-{num:03d}-*.png'))
    return webp(hits[0], box, 70) if hits else ''

# ปกเกม: จับคู่ตามชื่อท้าย URL ของเกม
COVER_FILES = {
    'technorun': 'TechnoRun-cover-character-corrected.png', 'techno-story': 'Dimension-Quest-cover-character-corrected.png',
    'DIGITAL-CITIZEN-MISSION': 'home-play-cyber-detective.webp', 'korkai': 'home-play-16x9-01-kor-kai.webp',
    'reading2': 'home-play-16x9-02-reading-2.webp', 'secreat': 'home-play-16x9-03-cyberguardian.webp',
    'vvv': 'home-play-16x9-04-onet-tutor.webp', 'plussnake': 'home-play-16x9-05-math-snake.webp',
    'mathMix': 'home-play-16x9-06-math-arena.webp', 'demox': 'home-play-16x9-07-monster-subtract.webp',
    'sortnumber': 'home-play-16x9-08-number-sort.webp', 'readthai': 'home-play-16x9-09-thai-reading.webp',
    'mathplus': 'home-play-16x9-10-math-plus.webp', 'marioplus': 'home-play-16x9-11-power-plus.webp',
    'wordfamily': 'home-play-16x9-12-word-family.webp', 'funmath': 'home-play-16x9-13-fun-math.webp',
    'Reading-Adventure': 'home-play-16x9-14-reading-adventure.webp', 'roman': 'home-play-16x9-15-roman-numerals.webp',
    'base-number': 'home-play-16x9-16-binary-quest.webp', 'beat-hero': 'Home-Cover-beat-hero.webp',
    'techno-keyboard-quest': 'Home-Cover-techno-keyboard-quest.webp', '-TechnoMouseAdventure': 'Home-Cover-TechnoMouseAdventure.webp',
    'rainbow-city-techno': 'Rainbow-City-Game-city.webp',
}

def build(activities, embed=8):
    """ฝังปกเฉพาะ embed เกมแรก (ที่แสดงตั้งต้น) ที่เหลือใช้ลิงก์ภาพเดิมเมื่อกดดูทั้งหมด เพื่อให้ไฟล์เบา"""
    covers = {}
    for a in activities[:embed]:
        slug = a['url'].rstrip('/').split('/')[-1]
        f = COVER_FILES.get(slug)
        if f:
            covers[a['url']] = webp(PIC / f, (384, 216), 58, crop=(16, 9))
    worlds = [webp(TA / 'BossArena-P1-P6-v1' / f'boss-arena-p{g}-{k}.webp', (400, 500), 52)
              for g, k in ((1, 'thunder'), (2, 'water'), (3, 'nature'), (4, 'fire'), (5, 'ice'), (6, 'rock'))]
    # ม.1–ม.3: ฉากต่อสู้ของวิชาออกแบบฯ (ในโฟลเดอร์ต้นแบบเว็บของโปรเจกต์) ตัดเป็นสัดส่วนตั้งให้พอดีการ์ด
    sec = Path(__file__).resolve().parents[2] / 'MyIPST_CS_M1-M3_DT_M2-M3'
    worlds += [webp(sec / d / 'assets' / f, (400, 500), 52, crop=(4, 5)) for d, f in (
        ('ต้นแบบเว็บ_DT-M1_Offline', 'arena-dt-m1-c05.webp'), ('ต้นแบบเว็บ_DT-M1_Offline', 'arena-dt-m1-c06.webp'), ('ต้นแบบเว็บ_DT-M1_Offline', 'arena-dt-m1-c02.webp'))]  # ไม่ซ้ำกับฉาก ป.1–ป.6 และไม่ซ้ำกันเอง
    chars = [webp(f, (210, 210), 68) for f in sorted(PIC.glob('home-class-techno-0[1-9]-*.webp'))]
    # ป๊อปอัปของแถบทางลัด: ปกมังงะ = ปกเต็มฉบับจริง (ไฟล์เดียวกับที่หน้า Techno-Manga-Reader ใช้) ·
    # ภาพ 'ที่มาของเว็บ' = ภาพหน้าจอส่วนบนของหน้า Innovation-Model-KruKan (ถ่ายด้วย Chrome headless, เก็บไว้ใน tools/home-lite/img/)
    here = Path(__file__).resolve().parent
    manga = Path(__file__).resolve().parents[2] / 'นิยายมังงะ_มาสไรเดอร์เทคโน' / 'แผนภาพและCharacterAssets' / 'covers' / 'มาสไรเดอร์เทคโน_ปกเต็ม_A4_v3.png'
    result = {
        'mangaCover': webp(here / 'img' / 'manga-cover.webp', (440, 622), 56),
        'originShot': webp(here / 'img' / 'origin-shot.png', (640, 310), 58),
        'logo': webp(PIC / 'Logo.png', (112, 112), 80),
        'hero': webp(TA / 'LoginCovers-P1-P6-v1' / 'p1-login-battle.png', (1100, 620), 56),
        'posePlayer': pose(86, (200, 200)), 'heroPose': pose(15, (440, 440)), 'guide': pose(49, (240, 240)), 'guideOpen': pose(7, (220, 220)),
        'poseTransform': pose(15), 'poseStage': pose(47), 'poseGames': pose(62), 'poseCinema': pose(63),
        'poseMission': pose(74), 'poseTools': pose(69), 'poseDomain': pose(66), 'poseDomainArt': pose(53, (220, 220)),
        'poseNews': pose(73), 'poseNewsBubble': pose(90, (200, 200)), 'poseWave': pose(2, (220, 220)),
        'worlds': worlds, 'chars': chars, 'covers': covers,
        'missions': [webp(PIC / f'maskrider-techno-{k}.webp', (360, 270), 62) for k in ('score', 'poll', 'indicator')],
    }
    manifest = Path(__file__).resolve().parents[2] / 'images/home-cyberrider-2026-10-21/lite/manifest.json'
    if manifest.exists():
        fresh = json.loads(manifest.read_text(encoding='utf-8'))['assets']
        result['mangaCover'] = fresh['manga-cover-v2']['url']
        result['covers']['https://www.krukan.in.th/etc/techno-story'] = fresh['dimension-quest-cover-titled']['url']
        result['missions'] = [fresh[name]['url'] for name in ('mission-score', 'mission-feedback', 'mission-indicators')]
    return result
