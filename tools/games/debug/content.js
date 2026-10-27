/* Bug Buster: โจทย์จับบั๊ก 44 ข้อ สร้างจาก gen_content.py (โค้ดทุกข้อรันตรวจด้วยไพทอนจริงแล้ว) ห้ามแก้ไฟล์นี้ตรง ๆ */
(function (root) {
  'use strict';
  const api = {
 "LEVELS": [
  {
   "id": 1,
   "title": "บทสอน: รู้จักบั๊ก",
   "tag": "บทสอน",
   "icon": "help",
   "mon": "bug-mush",
   "desc": "ด่านสอนเล่น เรียนรู้ว่าบั๊กคืออะไร และวิธีหาบรรทัดที่ผิดแล้วแก้"
  },
  {
   "id": 2,
   "title": "ตัวแปรและการคำนวณ",
   "tag": "ตัวแปร",
   "icon": "plus",
   "mon": "bug-boar",
   "desc": "ตัวแปร เครื่องหมายคำนวณ และลำดับการคำนวณ ผิดนิดเดียวผลก็เปลี่ยน"
  },
  {
   "id": 3,
   "title": "เงื่อนไข if",
   "tag": "เงื่อนไข",
   "icon": "branch",
   "mon": "bug-beetle",
   "desc": "เครื่องหมายเปรียบเทียบ และ/หรือ และการย่อหน้าในเงื่อนไข"
  },
  {
   "id": 4,
   "title": "ลูปวนซ้ำ",
   "tag": "ลูป",
   "icon": "repeat",
   "mon": "bug-crab",
   "desc": "ลูป for และ while ที่วนผิดจำนวน หรือวนไม่จบ"
  },
  {
   "id": 5,
   "title": "ลิสต์",
   "tag": "ลิสต์",
   "icon": "book",
   "mon": "bug-lizard",
   "desc": "ตำแหน่งในลิสต์ที่นับจาก 0 และคำสั่งจัดการลิสต์"
  },
  {
   "id": 6,
   "title": "ฟังก์ชัน",
   "tag": "ฟังก์ชัน",
   "icon": "func",
   "mon": "bug-fox",
   "desc": "return การเรียกใช้ และลำดับพารามิเตอร์ของฟังก์ชัน"
  },
  {
   "id": 7,
   "title": "ข้อความ",
   "tag": "ข้อความ",
   "icon": "eye",
   "mon": "bug-jelly",
   "desc": "ข้อความ ตัวเลข และเมธอดของข้อความ"
  },
  {
   "id": 8,
   "title": "ตรรกะที่มักพลาด",
   "tag": "ตรรกะ",
   "icon": "bulb",
   "mon": "bug-dragon",
   "desc": "สูตรคำนวณที่เครื่องหมายผิด และกฎที่ต้องคิดให้รอบคอบ"
  },
  {
   "id": 9,
   "title": "ผสมยากขึ้น",
   "tag": "ยาก",
   "icon": "skull",
   "mon": "bug-imp",
   "desc": "โค้ดยาวขึ้นผสมหลายเรื่อง ต้องอ่านทีละบรรทัด"
  },
  {
   "id": 10,
   "title": "ด่านบอส: ราชาบั๊ก",
   "tag": "บอส",
   "icon": "sword",
   "mon": "bug-boss",
   "desc": "สุ่มโจทย์ยากจากด่าน 4-9 ทั้งหมด 8 ข้อ ต่อสู้กับราชาบั๊กตัวใหญ่"
  }
 ],
 "ROUNDS": [
  {
   "id": "b01",
   "lv": 1,
   "title": "ทักทายเพื่อน",
   "task": "โปรแกรมควรพิมพ์ว่า Hello Techno",
   "lines": [
    "name = \"Techno\"",
    "prnt(\"Hello \" + name)"
   ],
   "bug": 1,
   "opts": [
    "print(\"Hello \" + name)",
    "print(\"Hello \" - name)  ",
    "print(Hello + name)  "
   ],
   "expected": "Hello Techno",
   "actual": "ข้อผิดพลาด NameError: name 'prnt' is not defined",
   "err": true,
   "why": "คำสั่งแสดงผลต้องเขียนว่า print พิมพ์ผิดเป็น prnt คอมพิวเตอร์จึงไม่รู้จักคำสั่งนี้",
   "kind": "typo"
  },
  {
   "id": "b02",
   "lv": 1,
   "title": "นับแต้มเกม",
   "task": "ควรแสดงคะแนนรวมเป็น 30",
   "lines": [
    "coin = 10",
    "bonus = 20",
    "total = coin + bonus",
    "print(Total)"
   ],
   "bug": 3,
   "opts": [
    "print(total)",
    "print(\"total\")",
    "print(coin + bonus + 1)"
   ],
   "expected": "30",
   "actual": "ข้อผิดพลาด NameError: name 'Total' is not defined",
   "err": true,
   "why": "Python แยกตัวพิมพ์เล็กใหญ่ total กับ Total จึงเป็นคนละชื่อกัน",
   "kind": "case"
  },
  {
   "id": "b03",
   "lv": 1,
   "title": "บอกอายุ",
   "task": "ควรพิมพ์ว่า I am 12 years old",
   "lines": [
    "age = 12",
    "print(\"I am \" + age + \" years old\")"
   ],
   "bug": 1,
   "opts": [
    "print(\"I am \" + str(age) + \" years old\")",
    "print(\"I am \" + \"{age}\" + \" years old!\")",
    "print(\"I am \" * age + \" years old\" * 2)"
   ],
   "expected": "I am 12 years old",
   "actual": "ข้อผิดพลาด TypeError: can only concatenate str (not \"int\") to str",
   "err": true,
   "why": "บวกข้อความกับตัวเลขตรง ๆ ไม่ได้ ต้องแปลงตัวเลขเป็นข้อความด้วย str() ก่อน",
   "kind": "type"
  },
  {
   "id": "b04",
   "lv": 2,
   "title": "คิดเงินค่าขนม",
   "task": "ขนมชิ้นละ 15 บาท ซื้อ 4 ชิ้น ควรจ่าย 60 บาท",
   "lines": [
    "price = 15",
    "count = 4",
    "total = price + count",
    "print(total)"
   ],
   "bug": 2,
   "opts": [
    "total = price * count",
    "total = price ** count",
    "total = price / count "
   ],
   "expected": "60",
   "actual": "19",
   "err": false,
   "why": "ราคารวมคือราคาต่อชิ้นคูณจำนวนชิ้น ไม่ใช่เอามาบวกกัน",
   "kind": "operator"
  },
  {
   "id": "b05",
   "lv": 2,
   "title": "ค่าเฉลี่ยคะแนน",
   "task": "คะแนน 80 กับ 90 ค่าเฉลี่ยควรเป็น 85.0",
   "lines": [
    "a = 80",
    "b = 90",
    "avg = a + b / 2",
    "print(avg)"
   ],
   "bug": 2,
   "opts": [
    "avg = (a + b) / 2",
    "avg = a + b // 2 ",
    "avg = (a + b) * 2 "
   ],
   "expected": "85.0",
   "actual": "125.0",
   "err": false,
   "why": "การหารทำก่อนการบวก ต้องใส่วงเล็บให้บวกก่อน (a + b) แล้วค่อยหาร 2",
   "kind": "precedence"
  },
  {
   "id": "b06",
   "lv": 2,
   "title": "แปลงนาทีเป็นชั่วโมง",
   "task": "150 นาทีควรได้ 2.5 ชั่วโมง",
   "lines": [
    "minutes = 150",
    "hours = minutes * 60",
    "print(hours)"
   ],
   "bug": 1,
   "opts": [
    "hours = minutes / 60",
    "hours = minutes // 60 ",
    "hours = minutes % 60  "
   ],
   "expected": "2.5",
   "actual": "9000",
   "err": false,
   "why": "1 ชั่วโมงมี 60 นาที จึงต้องหารด้วย 60 ไม่ใช่คูณ",
   "kind": "operator"
  },
  {
   "id": "b07",
   "lv": 2,
   "title": "ต่อชื่อ",
   "task": "ควรพิมพ์ว่า KruKan ติดกัน",
   "lines": [
    "first = \"Kru\"",
    "last = \"Kan\"",
    "print(first last)"
   ],
   "bug": 2,
   "opts": [
    "print(first + last)",
    "print(first, last)  ",
    "print(first - last)  "
   ],
   "expected": "KruKan",
   "actual": "ข้อผิดพลาด SyntaxError: invalid syntax",
   "err": true,
   "why": "การต่อข้อความต้องใช้เครื่องหมาย + เขียนตัวแปรสองตัวติดกันเฉย ๆ ไม่ได้",
   "kind": "syntax"
  },
  {
   "id": "b08",
   "lv": 2,
   "title": "เพิ่มคะแนน",
   "task": "คะแนนเริ่มต้น 10 เพิ่มอีก 5 ควรได้ 15",
   "lines": [
    "score = 10",
    "score + 5",
    "print(score)"
   ],
   "bug": 1,
   "opts": [
    "score = score + 5",
    "score == 5            ",
    "score + 5 == score  "
   ],
   "expected": "15",
   "actual": "10",
   "err": false,
   "why": "ต้องเก็บผลบวกกลับเข้าตัวแปรด้วยเครื่องหมาย = ไม่อย่างนั้นค่าเดิมไม่เปลี่ยน",
   "kind": "logic"
  },
  {
   "id": "b09",
   "lv": 3,
   "title": "ตัดเกรด",
   "task": "คะแนน 75 ผ่านเกณฑ์ 50 ควรพิมพ์ pass",
   "lines": [
    "score = 75",
    "if score = 50:",
    "    print(\"pass\")",
    "else:",
    "    print(\"fail\")"
   ],
   "bug": 1,
   "opts": [
    "if score >= 50:",
    "if score => 50:",
    "if score == 50:"
   ],
   "expected": "pass",
   "actual": "ข้อผิดพลาด SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?",
   "err": true,
   "why": "เครื่องหมาย = ใช้กำหนดค่า ถ้าจะเปรียบเทียบต้องใช้ >= ที่เขียนเครื่องหมายมากกว่าก่อนเท่ากับ",
   "kind": "operator"
  },
  {
   "id": "b10",
   "lv": 3,
   "title": "ตรวจอายุเข้าโรงหนัง",
   "task": "อายุ 13 ปีขึ้นไปเข้าได้ อายุ 15 ควรพิมพ์ enter",
   "lines": [
    "age = 15",
    "if age > 18:",
    "    print(\"enter\")",
    "else:",
    "    print(\"wait\")"
   ],
   "bug": 1,
   "opts": [
    "if age >= 13:",
    "if age <= 13:",
    "if age == 13:"
   ],
   "expected": "enter",
   "actual": "wait",
   "err": false,
   "why": "เกณฑ์คือ 13 ปีขึ้นไป ต้องเปรียบเทียบกับ 13 และใช้ >= ไม่ใช่ 18",
   "kind": "logic"
  },
  {
   "id": "b11",
   "lv": 3,
   "title": "ฝนตกไหม",
   "task": "ถ้าฝนตกควรพิมพ์ umbrella",
   "lines": [
    "rain = True",
    "if rain",
    "    print(\"umbrella\")"
   ],
   "bug": 1,
   "opts": [
    "if rain:",
    "if rain ==:",
    "if (rain)"
   ],
   "expected": "umbrella",
   "actual": "ข้อผิดพลาด SyntaxError: expected ':'",
   "err": true,
   "why": "หลังเงื่อนไข if ต้องมีเครื่องหมายทวิภาค : ปิดท้ายเสมอ",
   "kind": "syntax"
  },
  {
   "id": "b12",
   "lv": 3,
   "title": "สอบผ่านทั้งสองวิชา",
   "task": "ต้องได้ 50 ขึ้นไปทั้งสองวิชาจึงผ่าน คะแนน 60 กับ 30 ควรพิมพ์ fail",
   "lines": [
    "math = 60",
    "sci = 30",
    "if math >= 50 or sci >= 50:",
    "    print(\"pass\")",
    "else:",
    "    print(\"fail\")"
   ],
   "bug": 2,
   "opts": [
    "if math >= 50 and sci >= 50:",
    "if math >= 50 and sci <= 50:",
    "if math >= 50 or sci <= 50:   "
   ],
   "expected": "fail",
   "actual": "pass",
   "err": false,
   "why": "ต้องผ่านทั้งสองวิชาจึงต้องใช้ and (ทั้งคู่จริง) ไม่ใช่ or (จริงข้อใดข้อหนึ่งก็พอ)",
   "kind": "logic"
  },
  {
   "id": "b13",
   "lv": 3,
   "title": "ตรวจรหัสผ่าน",
   "task": "รหัสผิด ควรพิมพ์ wrong password",
   "lines": [
    "password = \"xyz999\"",
    "if password == \"abc123\":",
    "    print(\"welcome\")",
    "else:",
    "print(\"wrong password\")"
   ],
   "bug": 4,
   "opts": [
    "    print(\"wrong password\")",
    "    print(\"welcome to the system\")",
    "    pass                    "
   ],
   "expected": "wrong password",
   "actual": "ข้อผิดพลาด IndentationError: expected an indented block after 'else' statement on line 4",
   "err": true,
   "why": "บรรทัดที่อยู่ใต้ else: ต้องย่อหน้าเข้ามาเพื่อบอกว่าเป็นคำสั่งในเงื่อนไขนั้น",
   "kind": "indent"
  },
  {
   "id": "b14",
   "lv": 4,
   "title": "นับ 1 ถึง 5",
   "task": "ควรพิมพ์เลข 1 2 3 4 5",
   "lines": [
    "for i in range(1, 5):",
    "    print(i)"
   ],
   "bug": 0,
   "opts": [
    "for i in range(1, 6):",
    "for i in range(5):    ",
    "for i in range(1, 5, 2):"
   ],
   "expected": "1\n2\n3\n4\n5",
   "actual": "1\n2\n3\n4",
   "err": false,
   "why": "range(1, 5) หยุดก่อนถึง 5 จึงได้ 1 ถึง 4 ถ้าต้องการถึง 5 ต้องใส่ตัวหยุดเป็น 6",
   "kind": "offbyone"
  },
  {
   "id": "b15",
   "lv": 4,
   "title": "รวมเลข 1 ถึง 4",
   "task": "ผลรวม 1+2+3+4 ควรได้ 10",
   "lines": [
    "total = 0",
    "for n in range(1, 5):",
    "    total = n",
    "print(total)"
   ],
   "bug": 2,
   "opts": [
    "    total = total + n",
    "    total = total - n",
    "    total = n + n    "
   ],
   "expected": "10",
   "actual": "4",
   "err": false,
   "why": "ต้องเอาค่าเดิมมาบวกเพิ่มทุกรอบ ถ้าเขียน total = n ค่าเก่าจะถูกทับหมด",
   "kind": "logic"
  },
  {
   "id": "b16",
   "lv": 4,
   "title": "นับถอยหลัง",
   "task": "ควรพิมพ์ 3 2 1 แล้วหยุด",
   "lines": [
    "n = 3",
    "while n > 0:",
    "    print(n)",
    "    n = n + 1"
   ],
   "bug": 3,
   "opts": [
    "    n = n - 1",
    "    n = n * 1",
    "    n = n - 2"
   ],
   "expected": "3\n2\n1",
   "actual": "โปรแกรมวนซ้ำไม่จบ (ค้าง)",
   "err": true,
   "why": "นับถอยหลังต้องลดค่า n ทุกรอบ ถ้าเพิ่มค่าขึ้นเรื่อย ๆ เงื่อนไข n > 0 จะจริงตลอดและโปรแกรมไม่ยอมหยุด",
   "kind": "loop"
  },
  {
   "id": "b17",
   "lv": 4,
   "title": "สูตรคูณแม่ 2",
   "task": "ควรพิมพ์ 2 4 6",
   "lines": [
    "for i in range(1, 4):",
    "    print(2 + i)"
   ],
   "bug": 1,
   "opts": [
    "    print(2 * i)",
    "    print(2 ** i)",
    "    print(i * i)"
   ],
   "expected": "2\n4\n6",
   "actual": "3\n4\n5",
   "err": false,
   "why": "สูตรคูณต้องใช้เครื่องหมายคูณ * ไม่ใช่บวก",
   "kind": "operator"
  },
  {
   "id": "b18",
   "lv": 4,
   "title": "พิมพ์ซ้ำแล้วจบ",
   "task": "ควรพิมพ์ Go! สามครั้ง แล้วพิมพ์ Done หนึ่งครั้ง",
   "lines": [
    "for i in range(3):",
    "print(\"Go!\")",
    "print(\"Done\")"
   ],
   "bug": 1,
   "opts": [
    "    print(\"Go!\")",
    "    print(\"Done\")",
    "    pass         "
   ],
   "expected": "Go!\nGo!\nGo!\nDone",
   "actual": "ข้อผิดพลาด IndentationError: expected an indented block after 'for' statement on line 1",
   "err": true,
   "why": "คำสั่งที่ต้องวนซ้ำต้องย่อหน้าเข้ามาใต้ for ส่วนคำสั่งที่ไม่ย่อหน้าจะทำเพียงครั้งเดียวหลังวนจบ",
   "kind": "indent"
  },
  {
   "id": "b19",
   "lv": 5,
   "title": "เพื่อนคนที่ 3",
   "task": "ควรพิมพ์ชื่อคนสุดท้ายในลิสต์ คือ Cat",
   "lines": [
    "names = [\"Ann\", \"Bob\", \"Cat\"]",
    "print(names[3])"
   ],
   "bug": 1,
   "opts": [
    "print(names[2])",
    "print(names[1])",
    "print(names[-3])"
   ],
   "expected": "Cat",
   "actual": "ข้อผิดพลาด IndexError: list index out of range",
   "err": true,
   "why": "ตำแหน่งในลิสต์นับจาก 0 สมาชิก 3 คนมีตำแหน่ง 0 1 2 ตำแหน่ง 3 จึงไม่มีอยู่",
   "kind": "index"
  },
  {
   "id": "b20",
   "lv": 5,
   "title": "เพิ่มของลงตะกร้า",
   "task": "เพิ่ม book แล้วควรมีของ 2 ชิ้น",
   "lines": [
    "cart = [\"pen\"]",
    "cart.add(\"book\")",
    "print(len(cart))"
   ],
   "bug": 1,
   "opts": [
    "cart.append(\"book\")",
    "cart.insert(\"book\")",
    "cart + [\"book\"]     "
   ],
   "expected": "2",
   "actual": "ข้อผิดพลาด AttributeError: 'list' object has no attribute 'add'",
   "err": true,
   "why": "คำสั่งเพิ่มสมาชิกท้ายลิสต์ชื่อ append ไม่ใช่ add",
   "kind": "method"
  },
  {
   "id": "b21",
   "lv": 5,
   "title": "ตรวจคะแนนทุกคน",
   "task": "ควรพิมพ์ 60 40 80 ทีละบรรทัด",
   "lines": [
    "scores = [60, 40, 80]",
    "for s in scores:",
    "    print(scores)"
   ],
   "bug": 2,
   "opts": [
    "    print(s)",
    "    print(scores[s])",
    "    print(len(scores))"
   ],
   "expected": "60\n40\n80",
   "actual": "[60, 40, 80]\n[60, 40, 80]\n[60, 40, 80]",
   "err": false,
   "why": "ตัวแปร s คือสมาชิกแต่ละตัวในรอบนั้น ต้องพิมพ์ s ไม่ใช่ทั้งลิสต์",
   "kind": "logic"
  },
  {
   "id": "b22",
   "lv": 5,
   "title": "คะแนนสูงสุด",
   "task": "ควรพิมพ์ 80",
   "lines": [
    "scores = [60, 40, 80]",
    "best = 0",
    "for s in scores:",
    "    if s < best:",
    "        best = s",
    "print(best)"
   ],
   "bug": 3,
   "opts": [
    "    if s > best:",
    "    if s == best:",
    "    if s >= 100: "
   ],
   "expected": "80",
   "actual": "0",
   "err": false,
   "why": "ตัวที่มากกว่าค่าสูงสุดเดิมจึงต้องแทนที่ ใช้ > ไม่ใช่ <",
   "kind": "logic"
  },
  {
   "id": "b23",
   "lv": 5,
   "title": "จำนวนสมาชิก",
   "task": "ทีมมี 3 คน ควรพิมพ์ 3",
   "lines": [
    "team = [\"A\", \"B\", \"C\"]",
    "count = len(team) + 1",
    "print(count)"
   ],
   "bug": 1,
   "opts": [
    "count = len(team)",
    "count = len(team) - 1",
    "count = team           "
   ],
   "expected": "3",
   "actual": "4",
   "err": false,
   "why": "len() บอกจำนวนสมาชิกอยู่แล้ว ไม่ต้องบวกเพิ่ม",
   "kind": "logic"
  },
  {
   "id": "b24",
   "lv": 6,
   "title": "ฟังก์ชันบวก",
   "task": "add(2, 3) ควรได้ 5",
   "lines": [
    "def add(a, b):",
    "    a + b",
    "print(add(2, 3))"
   ],
   "bug": 1,
   "opts": [
    "    return a + b",
    "    print(a + b) ",
    "    return a     "
   ],
   "expected": "5",
   "actual": "None",
   "err": false,
   "why": "ฟังก์ชันจะส่งผลลัพธ์ออกมาให้ต้องใช้ return ถ้าไม่มี จะได้ None",
   "kind": "return"
  },
  {
   "id": "b25",
   "lv": 6,
   "title": "เรียกใช้ฟังก์ชัน",
   "task": "ควรพิมพ์ Hi",
   "lines": [
    "def hello():",
    "    print(\"Hi\")",
    "hello"
   ],
   "bug": 2,
   "opts": [
    "hello()",
    "hello(1)",
    "print(hello)"
   ],
   "expected": "Hi",
   "actual": "ไม่มีอะไรแสดงขึ้นเลย",
   "err": false,
   "why": "การเรียกใช้ฟังก์ชันต้องมีวงเล็บต่อท้ายชื่อ เขียนแค่ชื่อไม่ได้เรียกให้ทำงาน",
   "kind": "call"
  },
  {
   "id": "b26",
   "lv": 6,
   "title": "ลำดับพารามิเตอร์",
   "task": "ควรพิมพ์ Good morning Ann",
   "lines": [
    "def greet(name, time):",
    "    print(\"Good \" + time + \" \" + name)",
    "greet(\"morning\", \"Ann\")"
   ],
   "bug": 2,
   "opts": [
    "greet(\"Ann\", \"morning\")",
    "greet(\"Ann\")            ",
    "greet(\"morning\", \"Ann\", \"!\")"
   ],
   "expected": "Good morning Ann",
   "actual": "Good Ann morning",
   "err": false,
   "why": "ค่าที่ส่งเข้าฟังก์ชันต้องเรียงตามลำดับพารามิเตอร์ ตัวแรกคือ name ตัวที่สองคือ time",
   "kind": "args"
  },
  {
   "id": "b27",
   "lv": 6,
   "title": "ผลรวมในฟังก์ชัน",
   "task": "total([1, 2, 3]) ควรได้ 6",
   "lines": [
    "def total(nums):",
    "    s = 0",
    "    for n in nums:",
    "        s = s + n",
    "        return s",
    "print(total([1, 2, 3]))"
   ],
   "bug": 4,
   "opts": [
    "    return s",
    "        pass",
    "        return n"
   ],
   "expected": "6",
   "actual": "1",
   "err": false,
   "why": "return อยู่ในลูปจะหยุดฟังก์ชันตั้งแต่รอบแรก ต้องย่อหน้าออกมาให้อยู่หลังลูปจบ",
   "kind": "return"
  },
  {
   "id": "b28",
   "lv": 6,
   "title": "ฟังก์ชันสองเท่า",
   "task": "double(4) ควรได้ 8",
   "lines": [
    "def double(x):",
    "    return x * 3",
    "print(double(4))"
   ],
   "bug": 1,
   "opts": [
    "    return x * 2",
    "    return x + 2",
    "    return x ** 2"
   ],
   "expected": "8",
   "actual": "12",
   "err": false,
   "why": "สองเท่าคือคูณ 2 เขียนคูณ 3 จะได้สามเท่า",
   "kind": "logic"
  },
  {
   "id": "b29",
   "lv": 7,
   "title": "ตัวใหญ่ทั้งหมด",
   "task": "ควรพิมพ์ TECHNO",
   "lines": [
    "word = \"techno\"",
    "print(word.upper)"
   ],
   "bug": 1,
   "opts": [
    "print(word.upper())",
    "print(word.Upper())",
    "print(upper(word)) "
   ],
   "expected": "TECHNO",
   "actual": "<built-in method upper of str object at 0x0000026151541650>",
   "err": false,
   "why": "ฟังก์ชันของข้อความต้องมีวงเล็บเรียกใช้ .upper() ถ้าไม่มีวงเล็บจะได้แค่ตัวฟังก์ชัน",
   "kind": "call"
  },
  {
   "id": "b30",
   "lv": 7,
   "title": "ตัวอักษรแรก",
   "task": "ควรพิมพ์ P",
   "lines": [
    "word = \"Python\"",
    "print(word[1])"
   ],
   "bug": 1,
   "opts": [
    "print(word[0])",
    "print(word[-1])",
    "print(word[6])"
   ],
   "expected": "P",
   "actual": "y",
   "err": false,
   "why": "ตำแหน่งแรกของข้อความคือ 0 ไม่ใช่ 1",
   "kind": "index"
  },
  {
   "id": "b31",
   "lv": 7,
   "title": "ความยาวชื่อ",
   "task": "ควรพิมพ์ Length: 6",
   "lines": [
    "name = \"Techno\"",
    "print(\"Length: \" + len(name))"
   ],
   "bug": 1,
   "opts": [
    "print(\"Length: \" + str(len(name)))",
    "print(\"Length: \" + name + str(len(name)))",
    "print(\"Length: \", len(name))        "
   ],
   "expected": "Length: 6",
   "actual": "ข้อผิดพลาด TypeError: can only concatenate str (not \"int\") to str",
   "err": true,
   "why": "len(name) ได้ตัวเลข ต้องแปลงเป็นข้อความด้วย str() ก่อนนำไปต่อกับข้อความ",
   "kind": "type"
  },
  {
   "id": "b32",
   "lv": 7,
   "title": "ข้อความมีตัวแปร",
   "task": "ควรพิมพ์ Hello Kan",
   "lines": [
    "name = \"Kan\"",
    "print(\"Hello {name}\")"
   ],
   "bug": 1,
   "opts": [
    "print(f\"Hello {name}\")",
    "print(\"Hello\" + {name}) ",
    "print(\"Hello name\")    "
   ],
   "expected": "Hello Kan",
   "actual": "Hello {name}",
   "err": false,
   "why": "ถ้าจะใส่ค่าตัวแปรในข้อความด้วย {} ต้องมีตัว f นำหน้าเครื่องหมายคำพูด",
   "kind": "syntax"
  },
  {
   "id": "b33",
   "lv": 7,
   "title": "ขีดคั่น",
   "task": "ควรพิมพ์ขีดห้าตัว -----",
   "lines": [
    "line = \"-\" + 5",
    "print(line)"
   ],
   "bug": 0,
   "opts": [
    "line = \"-\" * 5",
    "line = \"-\" ** 5",
    "line = \"-\" , 5  "
   ],
   "expected": "-----",
   "actual": "ข้อผิดพลาด TypeError: can only concatenate str (not \"int\") to str",
   "err": true,
   "why": "ถ้าต้องการให้ข้อความซ้ำกี่ครั้งให้ใช้เครื่องหมายคูณ * กับจำนวนครั้ง",
   "kind": "operator"
  },
  {
   "id": "b34",
   "lv": 8,
   "title": "เซลเซียสเป็นฟาเรนไฮต์",
   "task": "100 องศาเซลเซียสควรได้ 212.0 องศาฟาเรนไฮต์",
   "lines": [
    "c = 100",
    "f = c * 9 / 5 - 32",
    "print(f)"
   ],
   "bug": 1,
   "opts": [
    "f = c * 9 / 5 + 32",
    "f = c * 5 / 9 + 32",
    "f = (c + 32) * 9 / 5"
   ],
   "expected": "212.0",
   "actual": "148.0",
   "err": false,
   "why": "สูตรคือ C คูณ 9 หาร 5 แล้วบวก 32 เครื่องหมายต้องเป็นบวก ไม่ใช่ลบ",
   "kind": "operator"
  },
  {
   "id": "b35",
   "lv": 8,
   "title": "ปีอธิกสุรทิน",
   "task": "ปี 2100 ไม่ใช่ปีอธิกสุรทิน ควรพิมพ์ False",
   "lines": [
    "y = 2100",
    "leap = y % 4 == 0",
    "print(leap)"
   ],
   "bug": 1,
   "opts": [
    "leap = y % 4 == 0 and y % 100 != 0 or y % 400 == 0",
    "leap = y % 4 == 0 or y % 100 == 0 or y % 400 == 0 or y > 1",
    "leap = y % 4 == 0 and y % 100 == 0"
   ],
   "expected": "False",
   "actual": "True",
   "err": false,
   "why": "ปีที่หาร 100 ลงตัวต้องหาร 400 ลงตัวด้วยจึงจะเป็นปีอธิกสุรทิน ปี 2100 หาร 400 ไม่ลงตัว",
   "kind": "logic"
  },
  {
   "id": "b36",
   "lv": 8,
   "title": "ส่วนลด 20 เปอร์เซ็นต์",
   "task": "สินค้า 500 บาท ลด 20% ควรจ่าย 400.0",
   "lines": [
    "price = 500",
    "discount = price * 20",
    "pay = price - discount",
    "print(pay)"
   ],
   "bug": 1,
   "opts": [
    "discount = price * 20 / 100",
    "discount = price * 20 / 100 * 2",
    "discount = price / 20         "
   ],
   "expected": "400.0",
   "actual": "-9500",
   "err": false,
   "why": "20 เปอร์เซ็นต์คือ 20 ส่วนใน 100 ต้องคูณ 20 แล้วหาร 100",
   "kind": "operator"
  },
  {
   "id": "b37",
   "lv": 8,
   "title": "เลขคู่",
   "task": "ควรพิมพ์เลขคู่ 2 4 6",
   "lines": [
    "for i in range(1, 7):",
    "    if i % 2 == 1:",
    "        print(i)"
   ],
   "bug": 1,
   "opts": [
    "    if i % 2 == 0:",
    "    if i / 2 == 0:",
    "    if i % 2 == 2:"
   ],
   "expected": "2\n4\n6",
   "actual": "1\n3\n5",
   "err": false,
   "why": "เลขคู่หารด้วย 2 แล้วเศษเป็น 0 ส่วนเศษ 1 คือเลขคี่",
   "kind": "logic"
  },
  {
   "id": "b38",
   "lv": 8,
   "title": "เลขหลักหน่วย",
   "task": "เลข 1234 ควรได้เลขท้ายคือ 4",
   "lines": [
    "n = 1234",
    "last = n // 10",
    "print(last)"
   ],
   "bug": 1,
   "opts": [
    "last = n % 10",
    "last = n / 10 ",
    "last = n - 10"
   ],
   "expected": "4",
   "actual": "123",
   "err": false,
   "why": "เศษจากการหารด้วย 10 คือเลขหลักหน่วย ใช้ % ไม่ใช่ // ที่หารเอาส่วนเต็ม",
   "kind": "operator"
  },
  {
   "id": "b39",
   "lv": 9,
   "title": "ค้นหาเลข 15",
   "task": "พบเลข 15 ในลิสต์แล้วควรพิมพ์ True",
   "lines": [
    "nums = [4, 8, 15, 16]",
    "found = False",
    "for n in nums:",
    "    if n == 15:",
    "        found = False",
    "print(found)"
   ],
   "bug": 4,
   "opts": [
    "        found = True",
    "        found = \"found\"",
    "        break       "
   ],
   "expected": "True",
   "actual": "False",
   "err": false,
   "why": "เมื่อเจอเลข 15 ต้องเปลี่ยนค่าตัวแปรบอกผลเป็น True",
   "kind": "logic"
  },
  {
   "id": "b40",
   "lv": 9,
   "title": "นับตัวอักษร a",
   "task": "คำว่า banana มี a 3 ตัว",
   "lines": [
    "word = \"banana\"",
    "count = 0",
    "for ch in word:",
    "    if ch == \"a\":",
    "        count = 1",
    "print(count)"
   ],
   "bug": 4,
   "opts": [
    "        count = count + 1",
    "        count = count - 1",
    "        count = ch       "
   ],
   "expected": "3",
   "actual": "1",
   "err": false,
   "why": "นับจำนวนต้องบวกเพิ่มจากค่าเดิมทุกครั้งที่เจอ ถ้ากำหนดเป็น 1 ซ้ำ ๆ จะได้ 1 เสมอ",
   "kind": "logic"
  },
  {
   "id": "b41",
   "lv": 9,
   "title": "ค่าเฉลี่ยของลิสต์",
   "task": "ค่าเฉลี่ยของ 2 4 6 ควรได้ 4.0",
   "lines": [
    "nums = [2, 4, 6]",
    "total = 0",
    "for n in nums:",
    "    total = total + n",
    "print(total / len(nums) + 1)"
   ],
   "bug": 4,
   "opts": [
    "print(total / len(nums))",
    "print(total / len(nums) - 1)",
    "print(total // len(nums))"
   ],
   "expected": "4.0",
   "actual": "5.0",
   "err": false,
   "why": "ค่าเฉลี่ยคือผลรวมหารจำนวน ไม่ต้องบวกเพิ่มอีก 1",
   "kind": "logic"
  },
  {
   "id": "b42",
   "lv": 9,
   "title": "นับถอยหลังในฟังก์ชัน",
   "task": "countdown(3) ควรพิมพ์ 3 2 1",
   "lines": [
    "def countdown(n):",
    "    while n > 0:",
    "        print(n)",
    "        n = n + 1",
    "countdown(3)"
   ],
   "bug": 3,
   "opts": [
    "        n = n - 1",
    "        n = n - 2",
    "        n = n * 2"
   ],
   "expected": "3\n2\n1",
   "actual": "โปรแกรมวนซ้ำไม่จบ (ค้าง)",
   "err": true,
   "why": "ต้องลดค่า n ลงทุกรอบจึงจะหยุดเมื่อ n ถึง 0",
   "kind": "loop"
  },
  {
   "id": "b43",
   "lv": 9,
   "title": "ผลรวมเลขคี่",
   "task": "ผลรวมเลขคี่ 1 ถึง 5 คือ 1+3+5 = 9",
   "lines": [
    "total = 0",
    "for i in range(1, 6):",
    "    if i % 2 == 0:",
    "        total = total + i",
    "print(total)"
   ],
   "bug": 2,
   "opts": [
    "    if i % 2 == 1:",
    "    if i % 2 == 2:",
    "    if i % 2 != 1:"
   ],
   "expected": "9",
   "actual": "6",
   "err": false,
   "why": "เลขคี่หารสองเหลือเศษ 1 เงื่อนไข == 0 กลับไปนับเลขคู่แทน",
   "kind": "logic"
  },
  {
   "id": "b44",
   "lv": 9,
   "title": "ค่ามากกว่า",
   "task": "bigger(7, 3) ควรได้ 7",
   "lines": [
    "def bigger(a, b):",
    "    if a > b:",
    "        return b",
    "    return b",
    "print(bigger(7, 3))"
   ],
   "bug": 2,
   "opts": [
    "        return a",
    "        return a + b",
    "        return 0    "
   ],
   "expected": "7",
   "actual": "3",
   "err": false,
   "why": "ถ้า a มากกว่า b ผลที่ถูกต้องคือ a ส่งค่า b กลับไปจึงผิด",
   "kind": "return"
  }
 ],
 "KIND": {
  "typo": "พิมพ์ผิด",
  "case": "ตัวพิมพ์ใหญ่เล็ก",
  "type": "ชนิดข้อมูล",
  "operator": "เครื่องหมายคำนวณ",
  "precedence": "ลำดับการคำนวณ",
  "syntax": "ไวยากรณ์",
  "logic": "ตรรกะ",
  "indent": "ย่อหน้า",
  "offbyone": "นับเกิน/ขาดหนึ่ง",
  "loop": "ลูปไม่จบ",
  "index": "ตำแหน่งในลิสต์",
  "method": "ชื่อคำสั่ง",
  "return": "return",
  "call": "การเรียกใช้",
  "args": "ลำดับอาร์กิวเมนต์"
 }
};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BB_DATA = api;
})(typeof window !== 'undefined' ? window : globalThis);
