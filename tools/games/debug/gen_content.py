"""สร้าง content.js ของ Bug Buster (จับบั๊กโค้ด) และ "ตรวจด้วยการรันโค้ดจริง" ทุกข้อ
- โค้ดที่แก้แล้วต้องพิมพ์ผลตรงกับ expected  โค้ดที่มีบั๊กต้องพิมพ์ผลต่างหรือเกิดข้อผิดพลาด
- ตัวเลือกผิดทั้งสองข้อต้องไม่ให้ผลตรงกับ expected (กันมีคำตอบถูกซ้อน)
- ตัวเลือกที่ถูกต้องห้ามยาวที่สุดในสามตัวเลือก (กติกาข้อสอบของผู้ใช้)
รัน: python tools/games/debug/gen_content.py  (ถ้ามีข้อผิดพลาดจะแจ้งและไม่เขียนไฟล์)"""
import json
import subprocess
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent / 'content.js'
S = []


def add(lv, title, task, lines, bug, opts, why, kind):
    """opts[0] = บรรทัดที่ถูกต้อง  opts[1], opts[2] = ตัวเลือกที่ผิดแต่ดูสมเหตุสมผล"""
    S.append(dict(lv=lv, title=title, task=task, lines=lines, bug=bug, opts=opts, why=why, kind=kind))


# ---------- ด่าน 1 บทสอน ----------
add(1, 'ทักทายเพื่อน', 'โปรแกรมควรพิมพ์ว่า Hello Techno', ['name = "Techno"', 'prnt("Hello " + name)'], 1,
    ['print("Hello " + name)', 'print("Hello " - name)  ', 'print(Hello + name)  '], 'คำสั่งแสดงผลต้องเขียนว่า print พิมพ์ผิดเป็น prnt คอมพิวเตอร์จึงไม่รู้จักคำสั่งนี้', 'typo')
add(1, 'นับแต้มเกม', 'ควรแสดงคะแนนรวมเป็น 30', ['coin = 10', 'bonus = 20', 'total = coin + bonus', 'print(Total)'], 3,
    ['print(total)', 'print("total")', 'print(coin + bonus + 1)'], 'Python แยกตัวพิมพ์เล็กใหญ่ total กับ Total จึงเป็นคนละชื่อกัน', 'case')
add(1, 'บอกอายุ', 'ควรพิมพ์ว่า I am 12 years old', ['age = 12', 'print("I am " + age + " years old")'], 1,
    ['print("I am " + str(age) + " years old")', 'print("I am " + "{age}" + " years old!")', 'print("I am " * age + " years old" * 2)'], 'บวกข้อความกับตัวเลขตรง ๆ ไม่ได้ ต้องแปลงตัวเลขเป็นข้อความด้วย str() ก่อน', 'type')

# ---------- ด่าน 2 ตัวแปรและการคำนวณ ----------
add(2, 'คิดเงินค่าขนม', 'ขนมชิ้นละ 15 บาท ซื้อ 4 ชิ้น ควรจ่าย 60 บาท', ['price = 15', 'count = 4', 'total = price + count', 'print(total)'], 2,
    ['total = price * count', 'total = price ** count', 'total = price / count '], 'ราคารวมคือราคาต่อชิ้นคูณจำนวนชิ้น ไม่ใช่เอามาบวกกัน', 'operator')
add(2, 'ค่าเฉลี่ยคะแนน', 'คะแนน 80 กับ 90 ค่าเฉลี่ยควรเป็น 85.0', ['a = 80', 'b = 90', 'avg = a + b / 2', 'print(avg)'], 2,
    ['avg = (a + b) / 2', 'avg = a + b // 2 ', 'avg = (a + b) * 2 '], 'การหารทำก่อนการบวก ต้องใส่วงเล็บให้บวกก่อน (a + b) แล้วค่อยหาร 2', 'precedence')
add(2, 'แปลงนาทีเป็นชั่วโมง', '150 นาทีควรได้ 2.5 ชั่วโมง', ['minutes = 150', 'hours = minutes * 60', 'print(hours)'], 1,
    ['hours = minutes / 60', 'hours = minutes // 60 ', 'hours = minutes % 60  '], '1 ชั่วโมงมี 60 นาที จึงต้องหารด้วย 60 ไม่ใช่คูณ', 'operator')
add(2, 'ต่อชื่อ', 'ควรพิมพ์ว่า KruKan ติดกัน', ['first = "Kru"', 'last = "Kan"', 'print(first last)'], 2,
    ['print(first + last)', 'print(first, last)  ', 'print(first - last)  '], 'การต่อข้อความต้องใช้เครื่องหมาย + เขียนตัวแปรสองตัวติดกันเฉย ๆ ไม่ได้', 'syntax')
add(2, 'เพิ่มคะแนน', 'คะแนนเริ่มต้น 10 เพิ่มอีก 5 ควรได้ 15', ['score = 10', 'score + 5', 'print(score)'], 1,
    ['score = score + 5', 'score == 5            ', 'score + 5 == score  '], 'ต้องเก็บผลบวกกลับเข้าตัวแปรด้วยเครื่องหมาย = ไม่อย่างนั้นค่าเดิมไม่เปลี่ยน', 'logic')

# ---------- ด่าน 3 เงื่อนไข ----------
add(3, 'ตัดเกรด', 'คะแนน 75 ผ่านเกณฑ์ 50 ควรพิมพ์ pass', ['score = 75', 'if score = 50:', '    print("pass")', 'else:', '    print("fail")'], 1,
    ['if score >= 50:', 'if score => 50:', 'if score == 50:'], 'เครื่องหมาย = ใช้กำหนดค่า ถ้าจะเปรียบเทียบต้องใช้ >= ที่เขียนเครื่องหมายมากกว่าก่อนเท่ากับ', 'operator')
add(3, 'ตรวจอายุเข้าโรงหนัง', 'อายุ 13 ปีขึ้นไปเข้าได้ อายุ 15 ควรพิมพ์ enter', ['age = 15', 'if age > 18:', '    print("enter")', 'else:', '    print("wait")'], 1,
    ['if age >= 13:', 'if age <= 13:', 'if age == 13:'], 'เกณฑ์คือ 13 ปีขึ้นไป ต้องเปรียบเทียบกับ 13 และใช้ >= ไม่ใช่ 18', 'logic')
add(3, 'ฝนตกไหม', 'ถ้าฝนตกควรพิมพ์ umbrella', ['rain = True', 'if rain', '    print("umbrella")'], 1,
    ['if rain:', 'if rain ==:', 'if (rain)'], 'หลังเงื่อนไข if ต้องมีเครื่องหมายทวิภาค : ปิดท้ายเสมอ', 'syntax')
add(3, 'สอบผ่านทั้งสองวิชา', 'ต้องได้ 50 ขึ้นไปทั้งสองวิชาจึงผ่าน คะแนน 60 กับ 30 ควรพิมพ์ fail', ['math = 60', 'sci = 30', 'if math >= 50 or sci >= 50:', '    print("pass")', 'else:', '    print("fail")'], 2,
    ['if math >= 50 and sci >= 50:', 'if math >= 50 and sci <= 50:', 'if math >= 50 or sci <= 50:   '], 'ต้องผ่านทั้งสองวิชาจึงต้องใช้ and (ทั้งคู่จริง) ไม่ใช่ or (จริงข้อใดข้อหนึ่งก็พอ)', 'logic')
add(3, 'ตรวจรหัสผ่าน', 'รหัสผิด ควรพิมพ์ wrong password', ['password = "xyz999"', 'if password == "abc123":', '    print("welcome")', 'else:', 'print("wrong password")'], 4,
    ['    print("wrong password")', '    print("welcome to the system")', '    pass                    '], 'บรรทัดที่อยู่ใต้ else: ต้องย่อหน้าเข้ามาเพื่อบอกว่าเป็นคำสั่งในเงื่อนไขนั้น', 'indent')

# ---------- ด่าน 4 การวนซ้ำ ----------
add(4, 'นับ 1 ถึง 5', 'ควรพิมพ์เลข 1 2 3 4 5', ['for i in range(1, 5):', '    print(i)'], 0,
    ['for i in range(1, 6):', 'for i in range(5):    ', 'for i in range(1, 5, 2):'], 'range(1, 5) หยุดก่อนถึง 5 จึงได้ 1 ถึง 4 ถ้าต้องการถึง 5 ต้องใส่ตัวหยุดเป็น 6', 'offbyone')
add(4, 'รวมเลข 1 ถึง 4', 'ผลรวม 1+2+3+4 ควรได้ 10', ['total = 0', 'for n in range(1, 5):', '    total = n', 'print(total)'], 2,
    ['    total = total + n', '    total = total - n', '    total = n + n    '], 'ต้องเอาค่าเดิมมาบวกเพิ่มทุกรอบ ถ้าเขียน total = n ค่าเก่าจะถูกทับหมด', 'logic')
add(4, 'นับถอยหลัง', 'ควรพิมพ์ 3 2 1 แล้วหยุด', ['n = 3', 'while n > 0:', '    print(n)', '    n = n + 1'], 3,
    ['    n = n - 1', '    n = n * 1', '    n = n - 2'], 'นับถอยหลังต้องลดค่า n ทุกรอบ ถ้าเพิ่มค่าขึ้นเรื่อย ๆ เงื่อนไข n > 0 จะจริงตลอดและโปรแกรมไม่ยอมหยุด', 'loop')
add(4, 'สูตรคูณแม่ 2', 'ควรพิมพ์ 2 4 6', ['for i in range(1, 4):', '    print(2 + i)'], 1,
    ['    print(2 * i)', '    print(2 ** i)', '    print(i * i)'], 'สูตรคูณต้องใช้เครื่องหมายคูณ * ไม่ใช่บวก', 'operator')
add(4, 'พิมพ์ซ้ำแล้วจบ', 'ควรพิมพ์ Go! สามครั้ง แล้วพิมพ์ Done หนึ่งครั้ง', ['for i in range(3):', 'print("Go!")', 'print("Done")'], 1,
    ['    print("Go!")', '    print("Done")', '    pass         '], 'คำสั่งที่ต้องวนซ้ำต้องย่อหน้าเข้ามาใต้ for ส่วนคำสั่งที่ไม่ย่อหน้าจะทำเพียงครั้งเดียวหลังวนจบ', 'indent')

# ---------- ด่าน 5 ลิสต์ ----------
add(5, 'เพื่อนคนที่ 3', 'ควรพิมพ์ชื่อคนสุดท้ายในลิสต์ คือ Cat', ['names = ["Ann", "Bob", "Cat"]', 'print(names[3])'], 1,
    ['print(names[2])', 'print(names[1])', 'print(names[-3])'], 'ตำแหน่งในลิสต์นับจาก 0 สมาชิก 3 คนมีตำแหน่ง 0 1 2 ตำแหน่ง 3 จึงไม่มีอยู่', 'index')
add(5, 'เพิ่มของลงตะกร้า', 'เพิ่ม book แล้วควรมีของ 2 ชิ้น', ['cart = ["pen"]', 'cart.add("book")', 'print(len(cart))'], 1,
    ['cart.append("book")', 'cart.insert("book")', 'cart + ["book"]     '], 'คำสั่งเพิ่มสมาชิกท้ายลิสต์ชื่อ append ไม่ใช่ add', 'method')
add(5, 'ตรวจคะแนนทุกคน', 'ควรพิมพ์ 60 40 80 ทีละบรรทัด', ['scores = [60, 40, 80]', 'for s in scores:', '    print(scores)'], 2,
    ['    print(s)', '    print(scores[s])', '    print(len(scores))'], 'ตัวแปร s คือสมาชิกแต่ละตัวในรอบนั้น ต้องพิมพ์ s ไม่ใช่ทั้งลิสต์', 'logic')
add(5, 'คะแนนสูงสุด', 'ควรพิมพ์ 80', ['scores = [60, 40, 80]', 'best = 0', 'for s in scores:', '    if s < best:', '        best = s', 'print(best)'], 3,
    ['    if s > best:', '    if s == best:', '    if s >= 100: '], 'ตัวที่มากกว่าค่าสูงสุดเดิมจึงต้องแทนที่ ใช้ > ไม่ใช่ <', 'logic')
add(5, 'จำนวนสมาชิก', 'ทีมมี 3 คน ควรพิมพ์ 3', ['team = ["A", "B", "C"]', 'count = len(team) + 1', 'print(count)'], 1,
    ['count = len(team)', 'count = len(team) - 1', 'count = team           '], 'len() บอกจำนวนสมาชิกอยู่แล้ว ไม่ต้องบวกเพิ่ม', 'logic')

# ---------- ด่าน 6 ฟังก์ชัน ----------
add(6, 'ฟังก์ชันบวก', 'add(2, 3) ควรได้ 5', ['def add(a, b):', '    a + b', 'print(add(2, 3))'], 1,
    ['    return a + b', '    print(a + b) ', '    return a     '], 'ฟังก์ชันจะส่งผลลัพธ์ออกมาให้ต้องใช้ return ถ้าไม่มี จะได้ None', 'return')
add(6, 'เรียกใช้ฟังก์ชัน', 'ควรพิมพ์ Hi', ['def hello():', '    print("Hi")', 'hello'], 2,
    ['hello()', 'hello(1)', 'print(hello)'], 'การเรียกใช้ฟังก์ชันต้องมีวงเล็บต่อท้ายชื่อ เขียนแค่ชื่อไม่ได้เรียกให้ทำงาน', 'call')
add(6, 'ลำดับพารามิเตอร์', 'ควรพิมพ์ Good morning Ann', ['def greet(name, time):', '    print("Good " + time + " " + name)', 'greet("morning", "Ann")'], 2,
    ['greet("Ann", "morning")', 'greet("Ann")            ', 'greet("morning", "Ann", "!")'], 'ค่าที่ส่งเข้าฟังก์ชันต้องเรียงตามลำดับพารามิเตอร์ ตัวแรกคือ name ตัวที่สองคือ time', 'args')
add(6, 'ผลรวมในฟังก์ชัน', 'total([1, 2, 3]) ควรได้ 6', ['def total(nums):', '    s = 0', '    for n in nums:', '        s = s + n', '        return s', 'print(total([1, 2, 3]))'], 4,
    ['    return s', '        pass', '        return n'], 'return อยู่ในลูปจะหยุดฟังก์ชันตั้งแต่รอบแรก ต้องย่อหน้าออกมาให้อยู่หลังลูปจบ', 'return')
add(6, 'ฟังก์ชันสองเท่า', 'double(4) ควรได้ 8', ['def double(x):', '    return x * 3', 'print(double(4))'], 1,
    ['    return x * 2', '    return x + 2', '    return x ** 2'], 'สองเท่าคือคูณ 2 เขียนคูณ 3 จะได้สามเท่า', 'logic')

# ---------- ด่าน 7 ข้อความ ----------
add(7, 'ตัวใหญ่ทั้งหมด', 'ควรพิมพ์ TECHNO', ['word = "techno"', 'print(word.upper)'], 1,
    ['print(word.upper())', 'print(word.Upper())', 'print(upper(word)) '], 'ฟังก์ชันของข้อความต้องมีวงเล็บเรียกใช้ .upper() ถ้าไม่มีวงเล็บจะได้แค่ตัวฟังก์ชัน', 'call')
add(7, 'ตัวอักษรแรก', 'ควรพิมพ์ P', ['word = "Python"', 'print(word[1])'], 1,
    ['print(word[0])', 'print(word[-1])', 'print(word[6])'], 'ตำแหน่งแรกของข้อความคือ 0 ไม่ใช่ 1', 'index')
add(7, 'ความยาวชื่อ', 'ควรพิมพ์ Length: 6', ['name = "Techno"', 'print("Length: " + len(name))'], 1,
    ['print("Length: " + str(len(name)))', 'print("Length: " + name + str(len(name)))', 'print("Length: ", len(name))        '], 'len(name) ได้ตัวเลข ต้องแปลงเป็นข้อความด้วย str() ก่อนนำไปต่อกับข้อความ', 'type')
add(7, 'ข้อความมีตัวแปร', 'ควรพิมพ์ Hello Kan', ['name = "Kan"', 'print("Hello {name}")'], 1,
    ['print(f"Hello {name}")', 'print("Hello" + {name}) ', 'print("Hello name")    '], 'ถ้าจะใส่ค่าตัวแปรในข้อความด้วย {} ต้องมีตัว f นำหน้าเครื่องหมายคำพูด', 'syntax')
add(7, 'ขีดคั่น', 'ควรพิมพ์ขีดห้าตัว -----', ['line = "-" + 5', 'print(line)'], 0,
    ['line = "-" * 5', 'line = "-" ** 5', 'line = "-" , 5  '], 'ถ้าต้องการให้ข้อความซ้ำกี่ครั้งให้ใช้เครื่องหมายคูณ * กับจำนวนครั้ง', 'operator')

# ---------- ด่าน 8 ตรรกะที่มักพลาด ----------
add(8, 'เซลเซียสเป็นฟาเรนไฮต์', '100 องศาเซลเซียสควรได้ 212.0 องศาฟาเรนไฮต์', ['c = 100', 'f = c * 9 / 5 - 32', 'print(f)'], 1,
    ['f = c * 9 / 5 + 32', 'f = c * 5 / 9 + 32', 'f = (c + 32) * 9 / 5'], 'สูตรคือ C คูณ 9 หาร 5 แล้วบวก 32 เครื่องหมายต้องเป็นบวก ไม่ใช่ลบ', 'operator')
add(8, 'ปีอธิกสุรทิน', 'ปี 2100 ไม่ใช่ปีอธิกสุรทิน ควรพิมพ์ False', ['y = 2100', 'leap = y % 4 == 0', 'print(leap)'], 1,
    ['leap = y % 4 == 0 and y % 100 != 0 or y % 400 == 0', 'leap = y % 4 == 0 or y % 100 == 0 or y % 400 == 0 or y > 1', 'leap = y % 4 == 0 and y % 100 == 0'], 'ปีที่หาร 100 ลงตัวต้องหาร 400 ลงตัวด้วยจึงจะเป็นปีอธิกสุรทิน ปี 2100 หาร 400 ไม่ลงตัว', 'logic')
add(8, 'ส่วนลด 20 เปอร์เซ็นต์', 'สินค้า 500 บาท ลด 20% ควรจ่าย 400.0', ['price = 500', 'discount = price * 20', 'pay = price - discount', 'print(pay)'], 1,
    ['discount = price * 20 / 100', 'discount = price * 20 / 100 * 2', 'discount = price / 20         '], '20 เปอร์เซ็นต์คือ 20 ส่วนใน 100 ต้องคูณ 20 แล้วหาร 100', 'operator')
add(8, 'เลขคู่', 'ควรพิมพ์เลขคู่ 2 4 6', ['for i in range(1, 7):', '    if i % 2 == 1:', '        print(i)'], 1,
    ['    if i % 2 == 0:', '    if i / 2 == 0:', '    if i % 2 == 2:'], 'เลขคู่หารด้วย 2 แล้วเศษเป็น 0 ส่วนเศษ 1 คือเลขคี่', 'logic')
add(8, 'เลขหลักหน่วย', 'เลข 1234 ควรได้เลขท้ายคือ 4', ['n = 1234', 'last = n // 10', 'print(last)'], 1,
    ['last = n % 10', 'last = n / 10 ', 'last = n - 10'], 'เศษจากการหารด้วย 10 คือเลขหลักหน่วย ใช้ % ไม่ใช่ // ที่หารเอาส่วนเต็ม', 'operator')

# ---------- ด่าน 9 ผสมยากขึ้น ----------
add(9, 'ค้นหาเลข 15', 'พบเลข 15 ในลิสต์แล้วควรพิมพ์ True', ['nums = [4, 8, 15, 16]', 'found = False', 'for n in nums:', '    if n == 15:', '        found = False', 'print(found)'], 4,
    ['        found = True', '        found = "found"', '        break       '], 'เมื่อเจอเลข 15 ต้องเปลี่ยนค่าตัวแปรบอกผลเป็น True', 'logic')
add(9, 'นับตัวอักษร a', 'คำว่า banana มี a 3 ตัว', ['word = "banana"', 'count = 0', 'for ch in word:', '    if ch == "a":', '        count = 1', 'print(count)'], 4,
    ['        count = count + 1', '        count = count - 1', '        count = ch       '], 'นับจำนวนต้องบวกเพิ่มจากค่าเดิมทุกครั้งที่เจอ ถ้ากำหนดเป็น 1 ซ้ำ ๆ จะได้ 1 เสมอ', 'logic')
add(9, 'ค่าเฉลี่ยของลิสต์', 'ค่าเฉลี่ยของ 2 4 6 ควรได้ 4.0', ['nums = [2, 4, 6]', 'total = 0', 'for n in nums:', '    total = total + n', 'print(total / len(nums) + 1)'], 4,
    ['print(total / len(nums))', 'print(total / len(nums) - 1)', 'print(total // len(nums))'], 'ค่าเฉลี่ยคือผลรวมหารจำนวน ไม่ต้องบวกเพิ่มอีก 1', 'logic')
add(9, 'นับถอยหลังในฟังก์ชัน', 'countdown(3) ควรพิมพ์ 3 2 1', ['def countdown(n):', '    while n > 0:', '        print(n)', '        n = n + 1', 'countdown(3)'], 3,
    ['        n = n - 1', '        n = n - 2', '        n = n * 2'], 'ต้องลดค่า n ลงทุกรอบจึงจะหยุดเมื่อ n ถึง 0', 'loop')
add(9, 'ผลรวมเลขคี่', 'ผลรวมเลขคี่ 1 ถึง 5 คือ 1+3+5 = 9', ['total = 0', 'for i in range(1, 6):', '    if i % 2 == 0:', '        total = total + i', 'print(total)'], 2,
    ['    if i % 2 == 1:', '    if i % 2 == 2:', '    if i % 2 != 1:'], 'เลขคี่หารสองเหลือเศษ 1 เงื่อนไข == 0 กลับไปนับเลขคู่แทน', 'logic')
add(9, 'ค่ามากกว่า', 'bigger(7, 3) ควรได้ 7', ['def bigger(a, b):', '    if a > b:', '        return b', '    return b', 'print(bigger(7, 3))'], 2,
    ['        return a', '        return a + b', '        return 0    '], 'ถ้า a มากกว่า b ผลที่ถูกต้องคือ a ส่งค่า b กลับไปจึงผิด', 'return')


def run(lines):
    """รันโค้ดไพทอนจริงในโปรเซสแยก คืน (ผลที่พิมพ์, ข้อความผิดพลาดบรรทัดสุดท้าย หรือ None, หมดเวลาหรือไม่)"""
    try:
        p = subprocess.run([sys.executable, '-I', '-c', '\n'.join(lines)], capture_output=True, text=True, timeout=2, encoding='utf-8')
    except subprocess.TimeoutExpired:
        return '', None, True
    err = None
    if p.returncode:
        tail = [l for l in p.stderr.strip().splitlines() if l.strip()]
        err = tail[-1] if tail else 'Error'
        for cut in ('. Did you mean', '. Perhaps'):   # ตัดคำแนะนำของไพทอนรุ่นใหม่ ซึ่งเฉลยคำตอบและต่างกันตามรุ่น
            err = err.split(cut)[0]
    return p.stdout.strip(), err, False


def replace(lines, i, new):
    out = list(lines); out[i] = new.rstrip() if new.strip() else new; return out


errors, out = [], []
for k, s in enumerate(S):
    sid = 'b%02d' % (k + 1)
    exp, err, to = run(replace(s['lines'], s['bug'], s['opts'][0]))
    if err or to or not exp:
        errors.append(f'{sid} โค้ดที่แก้แล้วรันไม่ผ่าน: {err or "timeout" if (err or to) else "ไม่พิมพ์อะไร"}'); continue
    act, aerr, ato = run(s['lines'])
    if not (aerr or ato) and act == exp:
        errors.append(f'{sid} โค้ดที่มีบั๊กดันให้ผลถูกต้อง')
    for j in (1, 2):
        o, oerr, oto = run(replace(s['lines'], s['bug'], s['opts'][j]))
        if not (oerr or oto) and o == exp:
            errors.append(f'{sid} ตัวเลือกผิดข้อ {j} ให้ผลถูกต้อง: {s["opts"][j].strip()}')
    L = [len(o.strip()) for o in s['opts']]
    if L[0] > max(L[1], L[2]):
        errors.append(f'{sid} คำตอบถูกยาวที่สุด ({L[0]} เทียบ {L[1]}, {L[2]}): {s["opts"][0].strip()}')
    if max(len(x) for x in s['lines'] + [o for o in s['opts']]) > 60:
        errors.append(f'{sid} บรรทัดโค้ดยาวเกิน 60 ตัวอักษร')
    if '→' in ''.join(s.values() if False else [s['title'], s['task'], s['why']]):
        errors.append(f'{sid} มีลูกศรยาว')
    out.append(dict(id=sid, lv=s['lv'], title=s['title'], task=s['task'], lines=s['lines'], bug=s['bug'], opts=[o for o in s['opts']], expected=exp,
                    actual=('ข้อผิดพลาด ' + aerr) if aerr else ('โปรแกรมวนซ้ำไม่จบ (ค้าง)' if ato else (act or 'ไม่มีอะไรแสดงขึ้นเลย')), err=bool(aerr or ato), why=s['why'], kind=s['kind']))

if errors:
    print('พบข้อผิดพลาด', len(errors), 'ข้อ:')
    for e in errors:
        print(' -', e)
    sys.exit(1)

LEVELS = [
    (1, 'บทสอน: รู้จักบั๊ก', 'บทสอน', 'help', 'bug-mush', 'ด่านสอนเล่น เรียนรู้ว่าบั๊กคืออะไร และวิธีหาบรรทัดที่ผิดแล้วแก้'),
    (2, 'ตัวแปรและการคำนวณ', 'ตัวแปร', 'plus', 'bug-boar', 'ตัวแปร เครื่องหมายคำนวณ และลำดับการคำนวณ ผิดนิดเดียวผลก็เปลี่ยน'),
    (3, 'เงื่อนไข if', 'เงื่อนไข', 'branch', 'bug-beetle', 'เครื่องหมายเปรียบเทียบ และ/หรือ และการย่อหน้าในเงื่อนไข'),
    (4, 'ลูปวนซ้ำ', 'ลูป', 'repeat', 'bug-crab', 'ลูป for และ while ที่วนผิดจำนวน หรือวนไม่จบ'),
    (5, 'ลิสต์', 'ลิสต์', 'book', 'bug-lizard', 'ตำแหน่งในลิสต์ที่นับจาก 0 และคำสั่งจัดการลิสต์'),
    (6, 'ฟังก์ชัน', 'ฟังก์ชัน', 'func', 'bug-fox', 'return การเรียกใช้ และลำดับพารามิเตอร์ของฟังก์ชัน'),
    (7, 'ข้อความ', 'ข้อความ', 'eye', 'bug-jelly', 'ข้อความ ตัวเลข และเมธอดของข้อความ'),
    (8, 'ตรรกะที่มักพลาด', 'ตรรกะ', 'bulb', 'bug-dragon', 'สูตรคำนวณที่เครื่องหมายผิด และกฎที่ต้องคิดให้รอบคอบ'),
    (9, 'ผสมยากขึ้น', 'ยาก', 'skull', 'bug-imp', 'โค้ดยาวขึ้นผสมหลายเรื่อง ต้องอ่านทีละบรรทัด'),
    (10, 'ด่านบอส: ราชาบั๊ก', 'บอส', 'sword', 'bug-boss', 'สุ่มโจทย์ยากจากด่าน 4-9 ทั้งหมด 8 ข้อ ต่อสู้กับราชาบั๊กตัวใหญ่'),
]
KIND = {'typo': 'พิมพ์ผิด', 'case': 'ตัวพิมพ์ใหญ่เล็ก', 'type': 'ชนิดข้อมูล', 'operator': 'เครื่องหมายคำนวณ', 'precedence': 'ลำดับการคำนวณ', 'syntax': 'ไวยากรณ์', 'logic': 'ตรรกะ', 'indent': 'ย่อหน้า',
        'offbyone': 'นับเกิน/ขาดหนึ่ง', 'loop': 'ลูปไม่จบ', 'index': 'ตำแหน่งในลิสต์', 'method': 'ชื่อคำสั่ง', 'return': 'return', 'call': 'การเรียกใช้', 'args': 'ลำดับอาร์กิวเมนต์'}
data = dict(LEVELS=[dict(id=a, title=b, tag=c, icon=d, mon=e, desc=f) for a, b, c, d, e, f in LEVELS], ROUNDS=out, KIND=KIND)
src = ('/* Bug Buster: โจทย์จับบั๊ก 44 ข้อ สร้างจาก gen_content.py (โค้ดทุกข้อรันตรวจด้วยไพทอนจริงแล้ว) ห้ามแก้ไฟล์นี้ตรง ๆ */\n(function (root) {\n  \'use strict\';\n  const api = '
       + json.dumps(data, ensure_ascii=False, indent=1) + ';\n  if (typeof module !== \'undefined\' && module.exports) module.exports = api;\n  else root.BB_DATA = api;\n})(typeof window !== \'undefined\' ? window : globalThis);\n')
OUT.write_text(src, encoding='utf-8')
print('ตรวจครบ', len(out), 'ข้อ เขียน', OUT.name, len(src) // 1024, 'KB')
