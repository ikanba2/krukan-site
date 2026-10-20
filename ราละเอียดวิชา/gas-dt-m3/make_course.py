"""สร้างเว็บ DT-M3 (การออกแบบและเทคโนโลยี ม.3) จากชุดใช้ร่วมของ DT-M1 + เนื้อหาที่เขียนใหม่ตามแผน สสวท. (course_content.py)
ใช้: python make_course.py            (สร้าง/อัปเดตโฟลเดอร์ ต้นแบบเว็บ_DT-M3_Offline)
     python make_course.py --shared   (คัดลอกเฉพาะไฟล์ส่วนกลางจาก DT-M1 มาทับ เมื่อแก้ส่วนกลางที่ DT-M1)
ไฟล์ข้อมูลเฉพาะวิชา (practice-data.js, prepost-data.js, labs-data.js, final-exam-data.js ฯลฯ) เขียนแยกในโฟลเดอร์ DT-M3 ไม่ถูกทับ"""
import json, re, shutil, sys, csv, io
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent / 'MyIPST_CS_M1-M3_DT_M2-M3'
SRC = ROOT / 'ต้นแบบเว็บ_DT-M1_Offline'
DST = ROOT / 'ต้นแบบเว็บ_DT-M3_Offline'
PLAN = ROOT / 'แผนพัฒนาบทเรียนเว็บ_ม1-ม3_6วิชา'
GD = Path(r'G:/My Drive/krukan/Pic/Techno asset')
CODE = 'DT-M3'
SUBJECT_FILES = ['course-config.js', 'subject-data.js', 'sims-data.js', 'course-data.js', 'lesson-text.js', 'extra-lessons.js', 'worksheet-v5-data.js', 'task-text.js', 'drive-images.js', 'practice-data.js', 'practice-text.js', 'prepost-data.js', 'final-exam-data.js', 'worksheet-data.js', 'planet-theme.css', 'gas-sim.js']
# บท: (ไฟล์พื้นหลังต่อสู้เดิม, รหัส Drive) · ดาวสุริยคราส โทนทองส้มแดง ทรายและความร้อน
# บท 1 หมาจิ้งจอกสุริยะ #48 เส้นทางขนส่งสุริยัน (ทางหินกลางทะเลทราย) · บท 2 ไก่นักขี่เงา #90 + กุหลาบหนาม #76 โรงงานรุ่งชาด
# บท 3 หมูนักขี่เงา #92 ตลาดเขี้ยวเหล็ก
ARENA = {1: ('arena-rock.webp', '1artdfQEFOtlFbd9YvUuzlcS19LHzmK8f'), 2: ('arena-dt-m1-c07.webp', '1A2b_72JMCtH25GM0Np5TJ1yQfiu_EHjU'),
         3: ('arena-dt-m1-c03.webp', '1VTt49jqO-3Ko9IZO5WdwQq3EfQx373NC')}
NEW_MODULES = ['DT-M3-C02-M06']  # หัวข้อใหม่ตามใบความรู้ 7.1–7.4 ยังไม่มีภาพ

SHARED = ['app.js', 'boss-game.js', 'chapter-review.js', 'cloud.js', 'combat-ui.js', 'dt-m1.css', 'final.js', 'fullscreen.js', 'fun-tools.js',
          'gaming.js', 'hscroll.js', 'practice.js', 'prepost.js', 'profile.js', 'report-export.js', 'sector-fx.js', 'teacher-dash.js',
          'teacher-queue.js', 'ui-split.js', 'worksheet.js', 'labs.js', 'sims.js', 'question-figs.js', 'boss-taunt.js']

def copy_shared():
    DST.mkdir(exist_ok=True)
    for f in SHARED:
        shutil.copy2(SRC / f, DST / f)
    html = (SRC / 'Techno-DT-M1-Offline.html').read_text(encoding='utf-8')
    html = html.replace('ออกแบบและเทคโนโลยี ม.1', 'ออกแบบและเทคโนโลยี ม.3').replace('Techno-DT-M1', 'Techno-DT-M3')
    html = html.replace('data-portal-grade="m1"', 'data-portal-grade="m3"').replace('การออกแบบและเทคโนโลยี ม.1', 'การออกแบบและเทคโนโลยี ม.3')
    html = html.replace('KRUKAN · ม.1', 'KRUKAN · ม.3')
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
    (DST / 'Techno-DT-M3-Offline.html').write_text(html, encoding='utf-8')
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
    for n in nums:
        pack = GD / ('Monsters-41-80-production' if n <= 80 else 'Zodiac-Dark-Riders-81-92-production')
        src = next((pack / 'raw').glob(f'{n}-*-3x3.png'))
        Image.open(src).convert('RGBA').resize((900, 900), Image.LANCZOS).save(a / f'sheet-{n}.webp', quality=86)
        fr = pack / 'frames' / src.stem / '00-idle-front.png'
        Image.open(fr).convert('RGBA').resize((512, 512), Image.LANCZOS).save(a / f'boss-{n}.webp', quality=86)
    # ฉากต่อสู้: ใช้พื้นหลังต่อสู้ที่มีอยู่แล้ว (ไม่มีตัวละครในภาพ) เลือกให้เข้ากับบอสแต่ละบท
    # ถ้ามีฉากของ ม.3 โดยเฉพาะใน DT-M3-Course-Assets/arena-dt-m3-c0N.webp จะใช้ไฟล์นั้นแทน
    for i, (src, _id) in ARENA.items():
        own = GD / 'DT-M3-Course-Assets' / f'arena-dt-m3-c0{i}.webp'
        shutil.copy2(own if own.exists() else GD / 'M1-Course-Assets' / src, a / f'arena-dt-m3-c0{i}.webp')
    print('assets ok · bosses', nums)
    return nums

def drive_ids():
    j = json.loads((HERE / 'drive_dtm3.json').read_text(encoding='utf-8'))
    return {f['name']: f['id'] for f in j}

def build_data(nums):
    plan = json.loads((PLAN / 'ปรับแผนเทียบต้นแบบ_DT-M1_V4' / 'COURSE_PLAN_V4.json').read_text(encoding='utf-8'))
    course = next(c for c in plan['courses'] if c['id'] == CODE)
    v4 = json.loads((PLAN / 'ปรับแผนเทียบต้นแบบ_DT-M1_V4' / 'STUDENT_LESSONS_V4.json').read_text(encoding='utf-8'))
    enc = json.loads((PLAN / 'แผนบอสและส่งต่องานAI' / 'BATTLE_ENCOUNTERS.json').read_text(encoding='utf-8'))
    encs = [e for e in (enc if isinstance(enc, list) else enc.values()) if e.get('courseId') == CODE]
    roster = json.loads((PLAN / 'แผนบอสและส่งต่องานAI' / 'BOSS_ROSTER.json').read_text(encoding='utf-8'))
    rl = roster if isinstance(roster, list) else (roster.get('bosses') or list(roster.values()))
    ids = drive_ids()
    sys.path.insert(0, str(HERE)); import course_content as CC
    kind = ['IDEA', 'EXAMPLE', 'MISTAKE']
    lessons, acts = {}, []
    for ch in course['chapters']:
        ch.update(CC.CHAPTERS[ch['id']])
        ch['rubric'] = [{'criterion': t, 'points': p} for t, p in zip(ch['assessmentCriteria'], (40, 25, 20, 15))]
        old = {m['id']: m for m in ch['modules']}
        mods = []
        for mid in CC.ORDER[ch['id']]:
            c = CC.M[mid]
            m = dict(old.get(mid, {}))
            m.update({'id': mid, 'title': c['title'], 'hours': c['hours'], 'teach': c['teach'], 'interactive': c['acts'][1][1],
                      'workedExample': c['workedSteps'][0], 'checkpoint': c['selfCheck']['prompt']})
            m.pop('simulationSpecId', None); m.pop('visualQuestionAsset', None)
            mods.append(m)
            v = v4.get(mid, {})
            briefs = [p.get('brief', '') for p in v.get('imagePanels', [])] or list(c.get('briefs', ['', '', '']))
            panels = [{'id': f'{mid}-FIG{k + 1}', 'brief': briefs[k] if k < len(briefs) else '', 'purpose': '', 'caption': c['captions'][k],
                       'fileName': f'{mid}-{kind[k]}.webp'} for k in range(3)]
            ga = [{'activityId': f'{mid}-A{k + 1}', 'title': t, 'role': 'ฝึกหลัก' if k == 0 else 'ลงมือทำ', 'prompt': pr} for k, (t, pr) in enumerate(c['acts'])]
            lessons[mid] = {'moduleId': mid, 'prerequisite': c['prerequisite'], 'goal': c['goal'], 'glossary': c['glossary'], 'explanation': c['explanation'],
                            'workedSteps': c['workedSteps'], 'commonMistake': c['commonMistake'], 'selfCheck': c['selfCheck'], 'guidedActivities': ga, 'imagePanels': panels}
            for a in ga:
                acts.append({'id': a['activityId'], 'title': a['title'], 'interaction': 'steps', 'role': a['role'], 'studentPrompt': a['prompt'],
                             'courseId': CODE, 'chapterId': ch['id'], 'moduleId': mid})
        ch['modules'] = mods
        ch['hours'] = sum(m['hours'] for m in mods)
    projects = {ch['id']: {'starter': ch.get('assignment', ''), 'requirements': ch.get('assessmentCriteria', []), 'acceptance': [ch.get('evidence', '')]} for ch in course['chapters']}
    bosses = []
    for n in nums:
        b = next((x for x in rl if int(x.get('number', 0)) == n), {})
        bosses.append({'number': n, 'thaiName': b.get('thaiName') or b.get('thai') or b.get('name', f'บอส {n}'), 'chapterId': next((e['chapterId'] for e in encs if e['mainBoss'] == n or e.get('subBoss') == n), ''),
                       'role': 'main' if any(e['mainBoss'] == n for e in encs) else 'sub'})
    course = {k: v for k, v in course.items() if k != 'detailPlan'}
    data = {'course': course, 'lessons': lessons, 'activities': acts, 'projects': projects, 'encounters': encs, 'bosses': bosses}
    (DST / 'course-data.js').write_text('/* สร้างจาก gas-dt-m3/make_course.py + course_content.py ห้ามแก้มือ · แก้เนื้อหาที่ course_content.py */\nwindow.DT_DATA = ' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
    # ภาพจาก Drive
    covers = {'course': {'id': ids.get(f'{CODE}-CLASS-COVER.webp', ''), 'title': 'ปกชั้นเรียน ม.3 · ออกแบบและเทคโนโลยี'}}
    for ch in course['chapters']:
        covers[f"c0{ch['number']}"] = {'id': ids.get(f"{CODE}-C0{ch['number']}-COVER.webp", ''), 'title': f"บทที่ {ch['number']} · {ch['title']}", 'w': 748, 'h': 496}
    figs = {}
    for mid, L in lessons.items():
        for p in L.get('imagePanels', []):
            figs[p['id']] = {'id': ids.get(p['fileName'], ''), 'title': p.get('brief', ''), 'caption': p.get('caption', '')}
    tpl = (SRC / 'drive-images.js').read_text(encoding='utf-8')
    i = tpl.index('window.DT_IMG=(function(){var C='); j = tpl.index('function url(id,w)')
    js = tpl[:i] + 'window.DT_IMG=(function(){var C=' + json.dumps(covers, ensure_ascii=False) + ';\nvar F=' + json.dumps(figs, ensure_ascii=False) + ';\n' + tpl[j:]
    (DST / 'drive-images.js').write_text(js, encoding='utf-8')
    miss = [k for k, v in figs.items() if not v['id']] + [k for k, v in covers.items() if not v['id']]
    print('course-data ok · lessons', len(lessons), '· activities', len(acts), '· figs', len(figs), '· missing ids', miss)

def stubs():
    S = {
        'course-config.js': None,
        'lesson-text.js': '/* ปรับถ้อยคำบทเรียน ม.3 (ทับค่าใน course-data.js) */\n(function () { const D = window.DT_DATA; if (!D) return; })();\n',
        'extra-lessons.js': '/* ม.3 ยังไม่มีหัวข้อเพิ่ม */\n',
        'task-text.js': '/* โจทย์ภารกิจของบท ม.3 (ทับค่าใน course-data.js) */\n',
        'practice-text.js': '/* ม.3 เขียนคำอธิบายไว้ใน practice-data.js แล้ว */\n',
        'question-figs.js': '/* ม.3 ยังไม่มีภาพประกอบโจทย์ */\nwindow.DT_QFIG = { M: {} };\n',
        'worksheet-data.js': '/* ม.3 ใช้ใบงาน V5 (worksheet-v5-data.js) */\nwindow.DT_WORK_GUIDE = { taskVersion: "none", fields: {}, chapters: {} };\n',
    }
    for f, body in S.items():
        p = DST / f
        if body is not None and not p.exists():
            p.write_text(body, encoding='utf-8')
    cfg = DST / 'course-config.js'
    if not cfg.exists():
        cfg.write_text("""/* ค่าประจำวิชา ม.3 */
window.DT_CFG = {
  code: 'DT-M3', slug: 'dt-m3', grade: 'ม.3', subject: 'การออกแบบและเทคโนโลยี',
  full: 'การออกแบบและเทคโนโลยี ม.3', short: 'ออกแบบและเทคโนโลยี ม.3', room: 'ม.3/1', key: 'krukan-dt-m3',
  chapters: 3, finalNo: 4, appUrl: ''
};
""", encoding='utf-8')

if __name__ == '__main__':
    copy_shared()
    if '--shared' not in sys.argv:
        nums = copy_assets()
        stubs()
        build_data(nums)
