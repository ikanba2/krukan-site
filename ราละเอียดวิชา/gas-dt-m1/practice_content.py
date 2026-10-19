"""รวมแบบฝึก ม.1: ข้อเดิม (_old_practice.json) + ข้อใหม่ (m1_practice_part) + บอสใหม่ + ก่อน/หลังเรียน (m1_prepost_part)
เขียน practice-data.js และ prepost-data.js ลงโฟลเดอร์แอป  รัน: python practice_content.py"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import m1_practice_part as PP, m1_prepost_part as PQ
APP = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'MyIPST_CS_M1-M3_DT_M2-M3', 'ต้นแบบเว็บ_DT-M1_Offline'))
ROT = (0, 2, 3, 1)
old = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '_old_practice.json'), encoding='utf-8'))

def rot(q, n):
    if 'opts' not in q or q.get('t') == 'pick': return q
    opts = list(q['opts']); right = opts[q['ans']]; wrong = [o for i, o in enumerate(opts) if i != q['ans']]
    p = ROT[n % 4]; wrong.insert(p, right); q = dict(q); q['opts'] = wrong; q['ans'] = p; return q

def fix(q):
    if q.get('t') == 'choice' and q['q'] in PP.FIX_OLD:
        r, w = PP.FIX_OLD[q['q']]; q = dict(q); q['opts'] = [r] + list(w); q['ans'] = 0
    return q

P = {}
n = 0
for c in range(1, 8):
    o = old['practice'][str(c)]
    items = [fix(x) for x in o['items']] + PP.NEW_ITEMS[c]
    out = []
    for x in items:
        if x.get('t') == 'choice': x = rot(x, n); n += 1
        out.append(x)
    bat = []
    for b in PP.BATTLE[c]: bat.append(rot(b, n)); n += 1
    P[c] = {'intro': o['intro'], 'items': out, 'battle': bat}

PRE = {}
for c in range(1, 8):
    PRE[c] = {}
    for k in ('pre', 'post'):
        l = []
        for q in PQ.PREPOST[c][k]: l.append(rot(q, n)); n += 1
        PRE[c][k] = l

def js(o): return json.dumps(o, ensure_ascii=False, indent=1)
def stat():
    tot = lon = 0
    for c in range(1, 8):
        qs = [x for x in P[c]['items'] if x.get('t') == 'choice'] + P[c]['battle'] + PRE[c]['pre'] + PRE[c]['post']
        for q in qs:
            L = [len(o) for o in q['opts']]; tot += 1
            if L[q['ans']] == max(L) and L.count(max(L)) == 1: lon += 1
    return tot, lon
tot, lon = stat(); print('ข้อเลือกตอบ', tot, 'คำตอบถูกยาวสุดชัดเจน', lon, '= %.0f%%' % (100 * lon / tot))

ph = open(os.path.join(APP, 'practice-data.js'), encoding='utf-8').read()
head = ph[:ph.index('window.DT_PRACTICE')]
open(os.path.join(APP, 'practice-data.js'), 'w', encoding='utf-8').write(head + 'window.DT_PRACTICE = ' + js(P) + ';\n')
pp = open(os.path.join(APP, 'prepost-data.js'), encoding='utf-8').read()
phead = pp[:pp.index('window.DT_PREPOST')].replace('บทละ 4 ข้อ ก่อน 4 หลัง', 'บทละ 5 ข้อ ก่อน 5 หลัง')
tail = pp[pp.index('/* ข้อความสะท้อนคิดท้ายบท'):]
open(os.path.join(APP, 'prepost-data.js'), 'w', encoding='utf-8').write(phead + 'window.DT_PREPOST = ' + js(PRE) + ';\n' + tail)
print('written')
