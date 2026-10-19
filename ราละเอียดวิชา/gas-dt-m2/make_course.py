"""สร้างเว็บ DT-M2 (การออกแบบและเทคโนโลยี ม.2) จากชุดใช้ร่วมของ DT-M1 + ข้อมูลแผน V4/V6
ใช้: python make_course.py            (สร้าง/อัปเดตโฟลเดอร์ ต้นแบบเว็บ_DT-M2_Offline)
     python make_course.py --shared   (คัดลอกเฉพาะไฟล์ส่วนกลางจาก DT-M1 มาทับ เมื่อแก้ส่วนกลางที่ DT-M1)
ไฟล์ข้อมูลเฉพาะวิชา (practice-data.js, prepost-data.js, labs-data.js, final-exam-data.js ฯลฯ) เขียนแยกในโฟลเดอร์ DT-M2 ไม่ถูกทับ"""
import json, re, shutil, sys, csv, io
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent / 'MyIPST_CS_M1-M3_DT_M2-M3'
SRC = ROOT / 'ต้นแบบเว็บ_DT-M1_Offline'
DST = ROOT / 'ต้นแบบเว็บ_DT-M2_Offline'
PLAN = ROOT / 'แผนพัฒนาบทเรียนเว็บ_ม1-ม3_6วิชา'
GD = Path(r'G:/My Drive/krukan/Pic/Techno asset')
CODE = 'DT-M2'
SUBJECT_FILES = ['course-config.js', 'subject-data.js', 'sims-data.js', 'course-data.js', 'lesson-text.js', 'extra-lessons.js', 'worksheet-v5-data.js', 'task-text.js', 'drive-images.js', 'practice-data.js', 'practice-text.js', 'prepost-data.js', 'final-exam-data.js', 'worksheet-data.js', 'planet-theme.css', 'gas-sim.js']
# บท: (ไฟล์พื้นหลังต่อสู้เดิม, รหัส Drive) · บท 1 ผีเสื้อกลางคืนนิล #46 หุบยามพลบค่ำ · บท 2 นักขุดดินแดง #56 ถ้ำเหมืองแร่
# บท 3 ปูไพลิน #73 + เม่นถ่านไฟ #72 เมืองโดมใต้น้ำ · บท 4 ภูตโอปอล #79 ซุ้มวงแหวนหินลอยโทนม่วง
ARENA = {1: ('arena-thunder.webp', '1fZxNVgy215Sw5ktisk2HOLpY9E4t1cHS'), 2: ('arena-dt-m1-c04.webp', '130l4LFhuSC3pk2iujpx3oeOXLxfmikm0'),
         3: ('arena-water.webp', '181ed_UwpsuIKoMea9itf0VUuwcRvazvl'), 4: ('arena-dt-m1-c06.webp', '1mCGIncxaHMxjJLNT2B7Uh_m_Z56HuK_F')}
EXTRA_MODULES = ['DT-M2-C01-M03', 'DT-M2-C02-M04', 'DT-M2-C03-M04', 'DT-M2-C04-M03', 'DT-M2-C04-M04']

SHARED = ['app.js', 'boss-game.js', 'chapter-review.js', 'cloud.js', 'combat-ui.js', 'dt-m1.css', 'final.js', 'fullscreen.js', 'fun-tools.js',
          'gaming.js', 'hscroll.js', 'practice.js', 'prepost.js', 'profile.js', 'report-export.js', 'sector-fx.js', 'teacher-dash.js',
          'teacher-queue.js', 'ui-split.js', 'worksheet.js', 'labs.js', 'sims.js', 'question-figs.js']

def copy_shared():
    DST.mkdir(exist_ok=True)
    for f in SHARED:
        shutil.copy2(SRC / f, DST / f)
    html = (SRC / 'Techno-DT-M1-Offline.html').read_text(encoding='utf-8')
    html = html.replace('ออกแบบและเทคโนโลยี ม.1', 'ออกแบบและเทคโนโลยี ม.2').replace('Techno-DT-M1', 'Techno-DT-M2')
    html = html.replace('data-portal-grade="m1"', 'data-portal-grade="m2"').replace('การออกแบบและเทคโนโลยี ม.1', 'การออกแบบและเทคโนโลยี ม.2')
    html = html.replace('KRUKAN · ม.1', 'KRUKAN · ม.2')
    a = '<script src="course-config.js?v=1" defer></script>'
    assert a in html
    html = html.replace(a, a + '\n  <script src="subject-data.js?v=1" defer></script>\n  <script src="sims-data.js?v=1" defer></script>')
    # ธีมดาวอุตสาหกรรมวารี (ไฟล์เฉพาะวิชา) โหลดต่อจาก dt-m1.css
    k = html.index('href="dt-m1.css'); k = html.index('>', k) + 1
    html = html[:k] + chr(10) + '  <link rel="stylesheet" href="planet-theme.css?v=3">' + html[k:]
    assert 'planet-theme.css' in html
    # ไฟล์เฉพาะวิชา: ใส่เลขเวอร์ชันจากเวลาแก้ไขไฟล์ เพื่อให้เบราว์เซอร์โหลดของใหม่ทุกครั้งที่แก้
    for f in SUBJECT_FILES + SHARED:
        fp = DST / f
        if fp.exists():
            v = str(int(fp.stat().st_mtime))
            html = re.sub(r'((?:src|href)="' + re.escape(f) + r')(\?v=[^"]*)?"', lambda m: m.group(1) + '?v=' + v + '"', html)
    (DST / 'Techno-DT-M2-Offline.html').write_text(html, encoding='utf-8')
    print('shared files copied:', len(SHARED) + 1)

def copy_assets():
    a = DST / 'assets'; a.mkdir(exist_ok=True)
    skip = re.compile(r'^(arena-dt-m1-|boss-\d+|sheet-\d+)')
    for p in (SRC / 'assets').iterdir():
        if p.is_file() and not skip.match(p.name) and p.suffix in ('.webp', '.png', '.jpg', '.svg'):
            shutil.copy2(p, a / p.name)
    from PIL import Image
    enc = json.loads((PLAN / 'แผนบอสและส่งต่องานAI' / 'BATTLE_ENCOUNTERS.json').read_text(encoding='utf-8'))
    encs = [e for e in (enc if isinstance(enc, list) else enc.values()) if e.get('courseId') == CODE]
    nums = sorted({e['mainBoss'] for e in encs} | {e['subBoss'] for e in encs if e.get('subBoss')})
    raw = GD / 'Monsters-41-80-production' / 'raw'
    for n in nums:
        src = next(raw.glob(f'{n}-*-3x3.png'))
        Image.open(src).convert('RGBA').resize((900, 900), Image.LANCZOS).save(a / f'sheet-{n}.webp', quality=86)
        fr = GD / 'Monsters-41-80-production' / 'frames' / src.stem / '00-idle-front.png'
        Image.open(fr).convert('RGBA').resize((512, 512), Image.LANCZOS).save(a / f'boss-{n}.webp', quality=86)
    # ฉากต่อสู้: ใช้พื้นหลังต่อสู้ที่มีอยู่แล้ว (ไม่มีตัวละครในภาพ) เลือกให้เข้ากับบอสแต่ละบท
    # ถ้ามีฉากของ ม.2 โดยเฉพาะใน DT-M2-Course-Assets/arena-dt-m2-c0N.webp จะใช้ไฟล์นั้นแทน
    for i, (src, _id) in ARENA.items():
        own = GD / 'DT-M2-Course-Assets' / f'arena-dt-m2-c0{i}.webp'
        shutil.copy2(own if own.exists() else GD / 'M1-Course-Assets' / src, a / f'arena-dt-m2-c0{i}.webp')
    print('assets ok · bosses', nums)
    return nums

def captions():
    """คำใต้ภาพจาก ภาพประกอบ_V6/DT-M2.md (IDEA / MISTAKE) """
    md = (PLAN / 'ภาพประกอบ_V6' / 'DT-M2.md').read_text(encoding='utf-8')
    cap = {}
    for m in re.finditer(r'\*\*(IDEA|EXAMPLE|MISTAKE)\*\* `(DT-M2-C\d\d-M\d\d)-\w+\.webp`([^*]*?)- คำใต้ภาพ: ([^\n]+)', md, re.S):
        cap[(m.group(2), m.group(1))] = m.group(4).strip()
    return cap

def drive_ids():
    j = json.loads((HERE / 'drive_dtm2.json').read_text(encoding='utf-8'))
    return {f['name']: f['id'] for f in j}

def build_data(nums):
    plan = json.loads((PLAN / 'ปรับแผนเทียบต้นแบบ_DT-M1_V4' / 'COURSE_PLAN_V4.json').read_text(encoding='utf-8'))
    course = next(c for c in plan['courses'] if c['id'] == CODE)
    v4 = json.loads((PLAN / 'ปรับแผนเทียบต้นแบบ_DT-M1_V4' / 'STUDENT_LESSONS_V4.json').read_text(encoding='utf-8'))
    enc = json.loads((PLAN / 'แผนบอสและส่งต่องานAI' / 'BATTLE_ENCOUNTERS.json').read_text(encoding='utf-8'))
    encs = [e for e in (enc if isinstance(enc, list) else enc.values()) if e.get('courseId') == CODE]
    roster = json.loads((PLAN / 'แผนบอสและส่งต่องานAI' / 'BOSS_ROSTER.json').read_text(encoding='utf-8'))
    rl = roster if isinstance(roster, list) else (roster.get('bosses') or list(roster.values()))
    ids, cap = drive_ids(), captions()
    keep = ['moduleId', 'prerequisite', 'goal', 'glossary', 'explanation', 'workedSteps', 'commonMistake', 'selfCheck', 'guidedActivities', 'imagePanels']
    lessons, acts = {}, []
    kind = {1: 'IDEA', 2: 'EXAMPLE', 3: 'MISTAKE'}
    for ch in course['chapters']:
        for m in ch['modules']:
            L = {k: v4[m['id']][k] for k in keep if k in v4[m['id']]}
            for i, p in enumerate(L.get('imagePanels', []), 1):
                p['fileName'] = f"{m['id']}-{kind.get(i, 'IDEA')}.webp"
                p['caption'] = cap.get((m['id'], kind.get(i)), p.get('caption', ''))
            lessons[m['id']] = L
            for a in L.get('guidedActivities', []):
                acts.append({'id': a['activityId'], 'title': a['title'], 'interaction': 'steps', 'role': a.get('role', ''), 'studentPrompt': a.get('prompt', ''),
                             'courseId': CODE, 'chapterId': ch['id'], 'moduleId': m['id']})
    projects = {ch['id']: {'starter': ch.get('assignment', ''), 'requirements': ch.get('assessmentCriteria', []), 'acceptance': [ch.get('evidence', '')]} for ch in course['chapters']}
    bosses = []
    for n in nums:
        b = next((x for x in rl if int(x.get('number', 0)) == n), {})
        bosses.append({'number': n, 'thaiName': b.get('thaiName') or b.get('thai') or b.get('name', f'บอส {n}'), 'chapterId': next((e['chapterId'] for e in encs if e['mainBoss'] == n or e.get('subBoss') == n), ''),
                       'role': 'main' if any(e['mainBoss'] == n for e in encs) else 'sub'})
    course = {k: v for k, v in course.items() if k != 'detailPlan'}
    data = {'course': course, 'lessons': lessons, 'activities': acts, 'projects': projects, 'encounters': encs, 'bosses': bosses}
    (DST / 'course-data.js').write_text('/* สร้างจาก gas-dt-m2/make_course.py (แผน V4 + บอส + ภาพ) ห้ามแก้มือ · แก้เนื้อหาที่ lesson-text.js */\nwindow.DT_DATA = ' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
    # ภาพจาก Drive
    covers = {'course': {'id': ids.get(f'{CODE}-CLASS-COVER.webp', ''), 'title': 'ปกชั้นเรียน ม.2 · ออกแบบและเทคโนโลยี'}}
    for ch in course['chapters']:
        covers[f"c0{ch['number']}"] = {'id': ids.get(f"{CODE}-C0{ch['number']}-COVER.webp", ''), 'title': f"บทที่ {ch['number']} · {ch['title']}", 'w': 748, 'h': 496}
    figs = {}
    for mid, L in lessons.items():
        for p in L.get('imagePanels', []):
            figs[p['id']] = {'id': ids.get(p['fileName'], ''), 'title': p.get('brief', ''), 'caption': p.get('caption', '')}
    # หัวข้อเพิ่มตามแผน สสวท. (อยู่ใน extra-lessons.js) ภาพละ 3 แบบ ชื่อไฟล์ <หัวข้อ>-IDEA/EXAMPLE/MISTAKE.webp
    for mid in EXTRA_MODULES:
        for k, kind in enumerate(['IDEA', 'EXAMPLE', 'MISTAKE'], 1):
            figs[f'{mid}-FIG{k}'] = {'id': ids.get(f'{mid}-{kind}.webp', ''), 'title': '', 'caption': cap.get((mid, kind), '')}
    tpl = (SRC / 'drive-images.js').read_text(encoding='utf-8')
    i = tpl.index('window.DT_IMG=(function(){var C='); j = tpl.index('function url(id,w)')
    js = tpl[:i] + 'window.DT_IMG=(function(){var C=' + json.dumps(covers, ensure_ascii=False) + ';\nvar F=' + json.dumps(figs, ensure_ascii=False) + ';\n' + tpl[j:]
    (DST / 'drive-images.js').write_text(js, encoding='utf-8')
    miss = [k for k, v in figs.items() if not v['id']] + [k for k, v in covers.items() if not v['id']]
    print('course-data ok · lessons', len(lessons), '· activities', len(acts), '· figs', len(figs), '· missing ids', miss)

def stubs():
    S = {
        'course-config.js': None,
        'lesson-text.js': '/* ปรับถ้อยคำบทเรียน ม.2 (ทับค่าใน course-data.js) */\n(function () { const D = window.DT_DATA; if (!D) return; })();\n',
        'extra-lessons.js': '/* ม.2 ยังไม่มีหัวข้อเพิ่ม */\n',
        'task-text.js': '/* โจทย์ภารกิจของบท ม.2 (ทับค่าใน course-data.js) */\n',
        'practice-text.js': '/* ม.2 เขียนคำอธิบายไว้ใน practice-data.js แล้ว */\n',
        'question-figs.js': '/* ม.2 ยังไม่มีภาพประกอบโจทย์ */\nwindow.DT_QFIG = { M: {} };\n',
        'worksheet-data.js': '/* ม.2 ใช้ใบงาน V5 (worksheet-v5-data.js) */\nwindow.DT_WORK_GUIDE = { taskVersion: "none", fields: {}, chapters: {} };\n',
    }
    for f, body in S.items():
        p = DST / f
        if body is not None and not p.exists():
            p.write_text(body, encoding='utf-8')
    cfg = DST / 'course-config.js'
    if not cfg.exists():
        cfg.write_text("""/* ค่าประจำวิชา ม.2 */
window.DT_CFG = {
  code: 'DT-M2', slug: 'dt-m2', grade: 'ม.2', subject: 'การออกแบบและเทคโนโลยี',
  full: 'การออกแบบและเทคโนโลยี ม.2', short: 'ออกแบบและเทคโนโลยี ม.2', room: 'ม.2/1', key: 'krukan-dt-m2',
  chapters: 4, finalNo: 5, appUrl: ''
};
""", encoding='utf-8')

if __name__ == '__main__':
    copy_shared()
    if '--shared' not in sys.argv:
        nums = copy_assets()
        stubs()
        build_data(nums)
