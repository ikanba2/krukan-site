"""ข้อสอบปลายภาค (Sector 4) วิชาการออกแบบและเทคโนโลยี ม.3 · 60 ข้อ ตัวเลือก 4 ตัว
เนื้อหาข้อสอบอยู่ที่ final_exam_q.py · แก้ที่นั่นแล้วรัน  python final_exam.py  (ก่อน build_gas.py)
สร้าง 3 อย่าง: final-exam-data.js (ไม่มีเฉลย) · บล็อก DT_FINAL_KEY ใน Code.gs · ข้อสอบปลายภาค_DT-M3_เฉลย.md (เอกสารครู)"""
import json, re
from pathlib import Path
from final_exam_q import SUMMARY, Q

HERE = Path(__file__).resolve().parent
WEB = HERE.parent.parent / 'MyIPST_CS_M1-M3_DT_M2-M3' / 'ต้นแบบเว็บ_DT-M3_Offline'
CODE = 'DT-M3'
SECTOR = 4
FIG_DIR = 'assets/generated-lessons/DT-M3/final/'
FIGS = {}

def main():
    assert len(Q) == 60, len(Q)
    from opts_fix import FIX
    from new_q import REPL
    for k, q in REPL.items(): Q[int(k[1:]) - 1] = q
    for k, (r, w) in FIX.items():
        if k in REPL: continue
        q = Q[int(k[1:]) - 1]; q['opts'] = [r] + w; q['ans'] = 0
    # กระจายตำแหน่งคำตอบที่ถูกในเอกสารครูให้ใกล้เคียงกัน (ตอนสอบระบบสุ่มลำดับตัวเลือกอีกชั้น)
    for i, q in enumerate(Q):
        t = (0, 2, 3, 1)[i % 4]; a = q['opts'][q['ans']]; rest = [o for j, o in enumerate(q['opts']) if j != q['ans']]
        rest.insert(t, a); q['opts'], q['ans'] = rest, t
    out_q, key, md = [], {}, []
    count = {}
    for i, q in enumerate(Q):
        qid = 'F%02d' % (i + 1)
        assert len(q['opts']) == 4 and 0 <= q['ans'] < 4, qid
        assert len(set(q['opts'])) == 4, qid
        assert not re.search('→|←|↗', json.dumps(q, ensure_ascii=False)), qid
        count[q['ch']] = count.get(q['ch'], 0) + 1
        o = {'id': qid, 'ch': q['ch'], 'ctx': q['ctx'], 'q': q['q'], 'opts': q['opts']}
        if q.get('tbl'): o['tbl'] = q['tbl']
        if q.get('fig'): o['fig'] = q['fig']
        out_q.append(o); key[qid] = [q['ch'], q['ans']]
    figs = {}
    old = WEB / 'final-exam-data.js'
    if old.exists():  # คงรหัสไฟล์ Drive ที่ครูใส่ไว้แล้ว
        m = re.search(r'"figs":\s*(\{[^}]*\})', old.read_text(encoding='utf-8'))
        if m: figs = json.loads(m.group(1))
    figs = {f: figs.get(f, '') for f in FIGS}
    data = {'version': 1, 'count': len(Q), 'byChapter': count, 'summary': SUMMARY, 'figs': figs, 'figDir': FIG_DIR, 'questions': out_q}
    js = (f'/* สร้างอัตโนมัติจาก ราละเอียดวิชา/gas-dt-m3/final_exam.py — ห้ามแก้มือ\n'
          f'   ข้อสอบปลายภาค Sector {SECTOR} (60 ข้อ) สรุปบทเรียน และการ์ดคำประจำบท · ไม่มีเฉลยในไฟล์นี้ เซิร์ฟเวอร์เป็นผู้ตรวจคะแนน */\n'
          'window.DT_FINAL = ' + json.dumps(data, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
    old.write_text(js, encoding='utf-8')
    code_p = HERE / 'Code.gs'; code = code_p.read_text(encoding='utf-8')
    block = '/* FINAL-KEY-BEGIN (สร้างจาก final_exam.py ห้ามแก้มือ) เฉลยข้อสอบปลายภาค: รหัสข้อ: [บท, ตัวเลือกที่ถูก] */\nconst DT_FINAL_KEY = ' + json.dumps(key, separators=(',', ':')) + ';\n/* FINAL-KEY-END */'
    if 'FINAL-KEY-BEGIN' in code:
        code = re.sub(r'/\* FINAL-KEY-BEGIN.*?/\* FINAL-KEY-END \*/', lambda m: block, code, flags=re.S)
    else:
        code = code.rstrip('\n') + '\n\n' + block + '\n'
    code_p.write_text(code, encoding='utf-8', newline='')
    TH = 'กขคง'
    md.append(f'# ข้อสอบปลายภาค (Sector {SECTOR}) · การออกแบบและเทคโนโลยี ม.3 · ฉบับครู (มีเฉลย)\n')
    md.append('> สร้างอัตโนมัติจาก `ราละเอียดวิชา/gas-dt-m3/final_exam.py` ห้ามแก้ไฟล์นี้ ถ้าจะแก้ข้อสอบ แก้ที่ final_exam.py แล้วรัน `python final_exam.py`\n')
    md.append('- จำนวน 60 ข้อ ตัวเลือก 4 ตัว ตรวจคะแนนที่เซิร์ฟเวอร์ · ระบบสุ่มลำดับข้อและลำดับตัวเลือกให้นักเรียนแต่ละคน (ตัว ก–ง ในเอกสารนี้คือลำดับต้นฉบับ)')
    md.append('- จำนวนข้อรายบท: ' + ' · '.join(f'บท {c} = {n} ข้อ' for c, n in sorted(count.items())))
    md.append(f'- ข้อที่นำมาจากแบบทดสอบรายบท: {sum(1 for q in Q if q.get("from_"))} ข้อ (ระบุไว้ท้ายข้อ)')
    md.append('- ภาพประกอบ: ชุดนี้ไม่ต้องใช้ภาพ ข้อมูลตัวเลขที่ต้องเปรียบเทียบอยู่ในตารางของโจทย์ · สถานการณ์ทั้งหมดเป็นข้อมูลสมมติ\n')
    for c in sorted(count):
        md.append(f'\n## บทที่ {c} · {SUMMARY[c - 1]["title"]}\n')
        for i, q in enumerate(Q):
            if q['ch'] != c: continue
            qid = 'F%02d' % (i + 1)
            md.append(f'**{qid}** · เรื่องที่ถาม: {q["ctx"]}\n')
            md.append(q['q'] + '\n')
            if q.get('tbl'):
                t = q['tbl']; md.append('| ' + ' | '.join(t[0]) + ' |\n|' + '---|' * len(t[0]))
                for r in t[1:]: md.append('| ' + ' | '.join(r) + ' |')
                md.append('')
            for j, o in enumerate(q['opts']): md.append(f'- {TH[j]}. {o}' + (' ✅' if j == q['ans'] else ''))
            md.append(f'\n> เฉลย {TH[q["ans"]]} · เหตุผล: {q["why"]}' + (f' · ที่มา: {q["from_"]}' if q.get('from_') else '') + '\n')
    (WEB / f'ข้อสอบปลายภาค_{CODE}_เฉลย.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
    ansdist = [sum(1 for q in Q if q['ans'] == k) for k in range(4)]
    print('ok', len(Q), count, 'ans dist', ansdist, 'reused', sum(1 for q in Q if q.get('from_')))

if __name__ == '__main__':
    main()
