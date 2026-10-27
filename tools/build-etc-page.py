"""สร้างหน้า 'บทเรียนอื่นๆ' (Etc-Side-Quests.html) แบบมีภาพปกเกม แยกหมวดแบบเดียวกับหน้า home
แหล่งข้อมูล: tools/etc-page/quests.json (รายการทุกหน้าใต้ /etc/ : ชื่อ path อีโมจิ) + หน้า Home-Play-Learn-Gaming.html (ภาพปก หมวด ชั้นที่เหมาะ คำอธิบายสั้น ของเกมที่มีการ์ดบน home)
แม่แบบ: tools/etc-page/template.html (แก้หน้าตาที่นี่) · เพิ่มเกมใหม่: ใส่การ์ดบน home (tools/games/_home_patch_*.py) แล้วเพิ่มแถวใน quests.json
รัน: python tools/build-etc-page.py   (ผลลัพธ์เขียนทับ Etc-Side-Quests.html ที่รากโปรเจกต์ อย่าแก้ไฟล์ผลลัพธ์ตรง ๆ)"""
import datetime
import io
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
here = root / 'tools' / 'etc-page'

# หมวดเดิมของหน้านี้ › หมวดแบบหน้า home (ใช้เมื่อหน้านั้นไม่มีการ์ดบน home)
OLD2NEW = {'math': 'math', 'thai': 'reading', 'eng': 'english', 'code': 'coding', 'techno': 'adventure', 'other': 'other'}
# แก้หมวดรายหน้า (ชนะทุกอย่าง): ภาษาอังกฤษทั้งหมดอยู่หมวด 'ภาษาอังกฤษ' และหน้าที่ไม่มีการ์ดบน home จัดตามเนื้อหา
FORCE = {
    'reading2': 'english', 'wordfamily': 'english', 'Reading-Adventure': 'english', 'techno-talk': 'english',
    'techno-keyboard-quest': 'computer', '-TechnoMouseAdventure': 'computer', 'M1-2-2': 'computer', 'M1-2-3': 'computer', 'information-3': 'computer',
    'speechthai': 'reading', 'อานไทย-อ-2': 'reading', 'textthai': 'reading',
}


def home_data():
    s = io.open(root / 'Home-Play-Learn-Gaming.html', encoding='utf-8').read()
    i = s.index('activities:[')
    k = s.index('const ACTIVITY_INFO={')
    acts = {}
    for m in re.finditer(r"\{title:'([^']+)',url:'https://www\.krukan\.in\.th/etc/([^']+)',image:'([^']*)'([^}]*)\}", s[i:k]):
        title, path, image, rest = m.groups()
        acts[path] = {'title': title, 'image': image, 'new': 'newBadge:true' in rest}
    e = s.index('\n    };', k)
    info = {}
    for m in re.finditer(r"'([^']+)':\{group:'(\w+)',desc:'([^']*)',audience:'([^']*)',brief:'([^']*)'", s[k:e]):
        info[m.group(1)] = {'group': m.group(2), 'audience': m.group(4), 'brief': m.group(5)}
    return acts, info


def main():
    quests = json.loads((here / 'quests.json').read_text(encoding='utf-8'))
    acts, info = home_data()
    out = []
    for q in quests:
        a = acts.get(q['p']); inf = info.get(a['title']) if a else None
        g = FORCE.get(q['p']) or (inf['group'] if inf else OLD2NEW.get(q['c'], 'other'))
        row = {'t': q['t'], 'p': q['p'], 'g': g}
        if q.get('e'):
            row['e'] = q['e']
        if inf:
            row['a'] = inf['audience']; row['b'] = inf['brief']
        if a and a['image']:
            row['img'] = a['image']
            if a['new']:
                row['nw'] = 1
        out.append(row)
    # เรียงในหมวด: มีภาพปก (ใหม่ก่อน) ตามด้วยที่ไม่มีภาพ คงลำดับเดิมของ quests.json
    tpl = (here / 'template.html').read_text(encoding='utf-8')
    data = 'const QUESTS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';'
    html = tpl.replace('/*__DATA__*/', data).replace('/*__UPDATED__*/', datetime.date.today().isoformat())
    (root / 'Etc-Side-Quests.html').write_text(html, encoding='utf-8', newline='')
    covered = sum(1 for r in out if r.get('img'))
    groups = {}
    for r in out:
        groups[r['g']] = groups.get(r['g'], 0) + 1
    print(f'Etc-Side-Quests.html: {len(html) / 1024:.0f} KB · {len(out)} ภารกิจ · มีภาพปก {covered} · หมวด {groups}')


if __name__ == '__main__':
    main()
