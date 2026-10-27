"""เปลี่ยนฟอนต์ข้อความในเกมตะลุยเมืองอักษรและ Type Hero เป็นแบบมีหัวกลม (Sarabun) ต่อท้ายบันทึกการอัปเดตของวันที่ 25 ต.ค. 2569 (v2.9.0) รันซ้ำได้
ต่อด้วย python tools/build-home-lite.py"""
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
NOTE = 'เปลี่ยนตัวอักษรข้อความทั้งหมดในเกมตะลุยเมืองอักษรและเกมฝึกพิมพ์ Type Hero (รวมแป้นพิมพ์) เป็นฟอนต์แบบมีหัวกลมเหมือนแบบเรียน เพราะฟอนต์เดิมที่ไม่มีหัวทำให้ สระ า กับ ว ดูคล้ายกันจนนักเรียนสับสน'

p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if NOTE in s:
    print('home: already patched')
else:
    head = "{date:'2026-10-25', version:'2.9.0', notes:[\n"
    assert s.count(head) == 1
    i = s.index(head); j = s.index('\n        ]}', i)
    s = s[:j] + ",\n          '" + NOTE + "'" + s[j:]
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('home: ok')
