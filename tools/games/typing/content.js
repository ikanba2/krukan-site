/* Type Hero: ด่านฝึกพิมพ์ 10 ด่าน คลังคำไทย/อังกฤษ และความหมาย (ใช้ตรวจใน test_engine.js ว่าทุกตัวอักษรพิมพ์ได้จริงบนแป้นพิมพ์)
   n = จำนวนคำในด่าน (ด่านต่ำพิมพ์น้อย) pool = ชื่อคลังคำ  factor = ตัวคูณเวลาในโหมดจับเวลา (ยิ่งน้อยยิ่งเร็ว) */
(function (root) {
  'use strict';
  const LEVELS = [
    { id: 1, title: 'บทสอน: รู้จักแป้นพิมพ์', desc: 'ด่านสอนเล่น ทำตามขั้นตอนเพื่อรู้จักคำ แป้นพิมพ์ นิ้ว Shift และปุ่ม Enter', n: 3, pool: 'tutorial', factor: 2.2 },
    { id: 2, title: 'คำสั้นแถวหลัก', desc: 'คำสั้น ๆ ที่ใช้นิ้วอยู่กับที่ ฝึกให้มือคุ้นแป้น', n: 5, pool: 'p2', factor: 1.7 },
    { id: 3, title: 'คำง่าย ๆ', desc: 'คำพื้นฐานที่เจอทุกวัน พิมพ์ได้โดยไม่ต้องใช้ Shift', n: 6, pool: 'p3', factor: 1.5 },
    { id: 4, title: 'คำในโรงเรียน', desc: 'คำเกี่ยวกับห้องเรียน ยาวขึ้นเล็กน้อย', n: 7, pool: 'p4', factor: 1.4 },
    { id: 5, title: 'ฝึกใช้ Shift', desc: 'คำที่ต้องกด Shift (อังกฤษคือตัวพิมพ์ใหญ่ ไทยคือตัวอักษรบนปุ่ม Shift)', n: 8, pool: 'p5', factor: 1.35 },
    { id: 6, title: 'คำยาวขึ้น', desc: 'คำเทคโนโลยีที่ยาวกว่าเดิม ต้องมีสมาธิ', n: 8, pool: 'p6', factor: 1.3 },
    { id: 7, title: 'วลีสั้น ๆ', desc: 'พิมพ์เป็นวลีหลายคำ มีเว้นวรรค', n: 6, pool: 'phrases', factor: 1.3 },
    { id: 8, title: 'เร่งความเร็ว', desc: 'คำมากขึ้น เวลาแน่นขึ้น ผสมทุกแบบ', n: 12, pool: 'mix', factor: 1.1 },
    { id: 9, title: 'ประโยค', desc: 'ประโยคเต็ม ต้องพิมพ์ต่อเนื่องและแม่นยำ', n: 6, pool: 'sentences', factor: 1.2 },
    { id: 10, title: 'ตำนานนักพิมพ์', desc: 'ด่านสุดท้าย ผสมทุกอย่าง จำนวนมากที่สุด เวลาเข้มที่สุด', n: 14, pool: 'legend', factor: 1.0 }
  ];

  const TUTORIAL = { en: ['ask', 'Go', 'cat'], th: ['กา', 'โต', 'ปลา'] };
  const WORDS = {
    en: {
      p2: ['dad', 'sad', 'ask', 'all', 'fall', 'glad', 'flag', 'hall', 'lass', 'salad', 'slash', 'flask'],
      p3: ['cat', 'dog', 'sun', 'bus', 'red', 'map', 'pen', 'cup', 'ice', 'egg', 'fish', 'tree', 'bird', 'milk', 'rain'],
      p4: ['school', 'pencil', 'teacher', 'student', 'paper', 'desk', 'book', 'class', 'robot', 'mouse', 'screen', 'lesson'],
      p5: ['Bangkok', 'Monday', 'Thailand', 'Python', 'Scratch', 'Techno', 'Google', 'Sunday', 'English', 'March', 'Friday', 'Siam'],
      p6: ['keyboard', 'homework', 'computer', 'internet', 'algorithm', 'database', 'password', 'network', 'software', 'hardware', 'program', 'function'],
      phrases: ['good morning', 'thank you', 'see you soon', 'I love coding', 'open the door', 'type with fun', 'hello teacher', 'study hard', 'play and learn', 'save your file'],
      sentences: ['Practice makes perfect.', 'Typing is a useful skill.', 'The quick brown fox jumps.', 'Code every day, improve every day.', 'Keep your fingers on the home row.', 'Never give up on your goals.', 'Computers follow every instruction.', 'Learning to type is fun!']
    },
    th: {
      p2: ['กา', 'หา', 'งา', 'ดาว', 'ฟ้า', 'ป่า', 'น้ำ', 'ปลา', 'นก', 'หมา', 'กด', 'สวย'],
      p3: ['แมว', 'ไก่', 'ข้าว', 'เสือ', 'วัด', 'ถนน', 'ตลาด', 'สนาม', 'มะม่วง', 'กล้วย', 'ส้ม', 'ผลไม้'],
      p4: ['ดินสอ', 'ปากกา', 'หนังสือ', 'นักเรียน', 'ห้องเรียน', 'เพื่อน', 'ไม้บรรทัด', 'ยางลบ', 'กระดาน', 'สมุด', 'โต๊ะ', 'เก้าอี้'],
      p5: ['โรงเรียน', 'โปรแกรม', 'ครู', 'ข้อมูล', 'เกมส์', 'โรงอาหาร', 'โทรศัพท์', 'ธงชาติ', 'ฉลาด', 'ฮีโร่', 'ศาลา', 'ซอสมะเขือเทศ'],
      p6: ['คอมพิวเตอร์', 'อินเทอร์เน็ต', 'คีย์บอร์ด', 'โปรแกรมเมอร์', 'ฐานข้อมูล', 'อัลกอริทึม', 'เครือข่าย', 'ซอฟต์แวร์', 'วิทยาศาสตร์', 'เทคโนโลยี'],
      phrases: ['ฉันรักโรงเรียน', 'แมวกินปลา', 'นกบินบนฟ้า', 'ดาวอยู่บนฟ้า', 'เด็กดีมีวินัย', 'เพื่อนรักกัน', 'ครูใจดี', 'วันนี้อากาศดี', 'เรียนรู้ทุกวัน', 'พิมพ์ดีดสนุกมาก'],
      sentences: ['การพิมพ์สัมผัสช่วยให้เรียนรู้เร็ว', 'ฝึกฝนทุกวันแล้วจะเก่งขึ้น', 'วางนิ้วที่แถวหลักเสมอ', 'อย่าท้อถอยจนกว่าจะสำเร็จ', 'คอมพิวเตอร์ทำตามคำสั่งของเรา', 'พิมพ์ให้แม่นก่อนแล้วค่อยเร็ว', 'ความพยายามนำไปสู่ความสำเร็จ', 'ทุกคนพัฒนาได้ด้วยการฝึกฝน']
    }
  };
  // ความหมายภาษาไทยของคำอังกฤษ (แสดงใต้คำให้ได้ศัพท์ไปด้วย)
  const MEANING = {
    ask: 'ถาม', all: 'ทั้งหมด', fall: 'ตก ฤดูใบไม้ร่วง', glad: 'ดีใจ', flag: 'ธง', hall: 'ห้องโถง', salad: 'สลัด', slash: 'ฟัน ขีด', flask: 'ขวดแก้ว',
    dad: 'พ่อ', sad: 'เศร้า', cat: 'แมว', dog: 'หมา', sun: 'ดวงอาทิตย์', bus: 'รถเมล์', red: 'สีแดง', map: 'แผนที่', pen: 'ปากกา', cup: 'ถ้วย', ice: 'น้ำแข็ง', egg: 'ไข่', fish: 'ปลา', tree: 'ต้นไม้', bird: 'นก', milk: 'นม', rain: 'ฝน',
    school: 'โรงเรียน', pencil: 'ดินสอ', teacher: 'ครู', student: 'นักเรียน', paper: 'กระดาษ', desk: 'โต๊ะเรียน', book: 'หนังสือ', class: 'ห้องเรียน', robot: 'หุ่นยนต์', mouse: 'เมาส์ หนู', screen: 'หน้าจอ', lesson: 'บทเรียน',
    Bangkok: 'กรุงเทพฯ', Monday: 'วันจันทร์', Thailand: 'ประเทศไทย', Python: 'ภาษาไพทอน', Scratch: 'ภาษาสแครช', Techno: 'เทคโน', Google: 'กูเกิล', Sunday: 'วันอาทิตย์', English: 'ภาษาอังกฤษ', March: 'เดือนมีนาคม', Friday: 'วันศุกร์', Siam: 'สยาม',
    keyboard: 'แป้นพิมพ์', homework: 'การบ้าน', computer: 'คอมพิวเตอร์', internet: 'อินเทอร์เน็ต', algorithm: 'อัลกอริทึม', database: 'ฐานข้อมูล', password: 'รหัสผ่าน', network: 'เครือข่าย', software: 'ซอฟต์แวร์', hardware: 'ฮาร์ดแวร์', program: 'โปรแกรม', function: 'ฟังก์ชัน',
    'good morning': 'สวัสดีตอนเช้า', 'thank you': 'ขอบคุณ', 'see you soon': 'แล้วพบกันเร็ว ๆ นี้', 'I love coding': 'ฉันรักการเขียนโค้ด', 'open the door': 'เปิดประตู', 'type with fun': 'พิมพ์อย่างสนุก', 'hello teacher': 'สวัสดีครับ/ค่ะ คุณครู', 'study hard': 'ตั้งใจเรียน', 'play and learn': 'เล่นแล้วเรียนรู้', 'save your file': 'บันทึกไฟล์ของคุณ',
    'Practice makes perfect.': 'ฝึกฝนทำให้สมบูรณ์แบบ', 'Typing is a useful skill.': 'การพิมพ์เป็นทักษะที่มีประโยชน์', 'The quick brown fox jumps.': 'สุนัขจิ้งจอกสีน้ำตาลกระโดดเร็ว', 'Code every day, improve every day.': 'เขียนโค้ดทุกวัน พัฒนาทุกวัน', 'Keep your fingers on the home row.': 'วางนิ้วไว้ที่แถวหลักเสมอ', 'Never give up on your goals.': 'อย่าล้มเลิกเป้าหมาย', 'Computers follow every instruction.': 'คอมพิวเตอร์ทำตามทุกคำสั่ง', 'Learning to type is fun!': 'การหัดพิมพ์สนุกนะ'
  };

  const api = { LEVELS, WORDS, TUTORIAL, MEANING };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TY_DATA = api;
})(typeof window !== 'undefined' ? window : globalThis);
