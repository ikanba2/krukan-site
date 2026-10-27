"""Techno Talk เพิ่มโหมดเขียนคำศัพท์ตามหมวด + หน้าตาแบบเกม (25 ต.ค. 2569) ลงหน้าแรก: แก้คำอธิบายการ์ดเกม + ต่อท้ายบันทึกการอัปเดตของวันที่ 25 ต.ค. 2569 (v2.9.0) รันซ้ำได้
ต่อด้วย python tools/build-home-lite.py และ python tools/build-etc-page.py"""
import io
from pathlib import Path

root = Path(__file__).resolve().parents[2]
OLD_DESC = "desc:'ฝึกประโยคอังกฤษประจำวัน I you he she it we they ตั้งแต่อนุบาลถึง ป.3 เรียนคำศัพท์พร้อมเสียงอ่านก่อน แล้วเล่น 5 แบบ จัดกลุ่ม โยงเส้น เปิดป้าย ลากวาง ถามตอบ มี 3 ระดับ 15 หน่วย'"
NEW_DESC = "desc:'ฝึกประโยคอังกฤษประจำวัน I you he she it we they ตั้งแต่อนุบาลถึง ป.3 เรียนคำศัพท์พร้อมเสียงอ่านก่อน แล้วเล่น 5 แบบ จัดกลุ่ม โยงเส้น เปิดป้าย ลากวาง ถามตอบ มี 3 ระดับ 15 หน่วย และโหมดเขียนคำศัพท์ 9 หมวด เขียนตามลำดับเส้นบนเส้นบรรทัด 4 เส้น'"
OLD_BRIEF = "brief:'ภาพวาดเวกเตอร์ เสียงอ่าน 3 ระดับ 15 หน่วย ไรเดอร์เทคโนเป็นโค้ชบอกโจทย์'"
NEW_BRIEF = "brief:'เสียงอ่าน 3 ระดับ 15 หน่วย เขียนคำศัพท์ 9 หมวด คอมโบ ไรเดอร์เทคโนเป็นโค้ช'"
NOTES = [
    'ประโยคอังกฤษ (Techno Talk) มีโหมดใหม่ ‘เขียนคำศัพท์’ 9 หมวด (สัตว์ อาหาร ของใช้ สี คนรอบตัว ความรู้สึก คำกริยา สถานที่ คำแทนตัว) เขียนทีละตัวตามลำดับเส้นที่ถูกต้องบนเส้นบรรทัด 4 เส้นแบบสมุดคัดภาษาอังกฤษ มีจุดเริ่มสีเขียว ลูกศรบอกทิศ และปุ่มดูวิธีเขียน ถ้าเริ่มผิดจุดหรือลากออกนอกเส้นจะให้เขียนเส้นนั้นใหม่',
    'ปรับหน้าตา Techno Talk ให้เป็นเกมมากขึ้น: ตอบถูกติดกันได้คอมโบพร้อมคำชมเด้งและเสียงที่ตื่นเต้นขึ้น มีป้าย GO! ตอนเริ่มเกม ประกายลอยทั่วฉาก การ์ดกิจกรรมมีแสงวาบ และป้าย PLAY! บอกเกมที่ควรเล่นต่อ'
]

p = root / 'Home-Play-Learn-Gaming.html'
s = io.open(p, encoding='utf-8').read()
if NOTES[0] in s:
    print('home: already patched')
else:
    assert s.count(OLD_DESC) == 1 and s.count(OLD_BRIEF) == 1, (s.count(OLD_DESC), s.count(OLD_BRIEF))
    s = s.replace(OLD_DESC, NEW_DESC).replace(OLD_BRIEF, NEW_BRIEF)
    head = "{date:'2026-10-25', version:'2.9.0', notes:[\n"
    assert s.count(head) == 1
    i = s.index(head); j = s.index('\n        ]}', i)
    s = s[:j] + ',\n' + ',\n'.join("          '%s'" % n for n in NOTES) + s[j:]
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('home: ok')
