/* ทดสอบตรรกะรหัสซีซาร์และความถูกต้องของภารกิจ รัน: node tools/games/caesar/test_engine.js */
'use strict';
const CC = require('./engine.js');
const { MISSIONS, WORLDS } = require('./missions.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

// พื้นฐาน
eq(CC.encrypt('HELLO', 3), 'KHOOR', 'HELLO + 3');
eq(CC.decrypt('KHOOR', 3), 'HELLO', 'ถอด KHOOR');
eq(CC.encrypt('XYZ', 3), 'ABC', 'วนกลับจาก Z ไป A');
eq(CC.decrypt('ABC', 3), 'XYZ', 'ถอดวนกลับ');
eq(CC.encrypt('A B-1!', 5), 'F G-1!', 'ช่องว่างและเครื่องหมายไม่เปลี่ยน');
eq(CC.encrypt('hello', 3), 'KHOOR', 'ตัวพิมพ์เล็กถูกแปลงเป็นพิมพ์ใหญ่');
for (let k = 0; k < 26; k++) ok(CC.decrypt(CC.encrypt('THE QUICK BROWN FOX', k), k) === 'THE QUICK BROWN FOX', 'ถอดกลับได้ทุกกุญแจ ' + k);
eq(CC.encrypt(CC.encrypt('SECRET', 13), 13), 'SECRET', 'ROT13 ซ้ำสองครั้งกลับที่เดิม');
eq(CC.encrypt(CC.encrypt('LAYERS', 3), 5), CC.encrypt('LAYERS', 8), 'ซีซาร์ซ้อนสองชั้นเท่ากับกุญแจรวม');
eq(CC.mod(-1, 26), 25, 'mod ค่าติดลบ');
eq(CC.freq('AABZ')[0], 2, 'นับความถี่ A');
eq(CC.peakKey(CC.encrypt('EEEE TTT', 5)).key, 5, 'peakKey หา E');

// ภารกิจ
const ids = new Set(WORLDS.map(w => w.id));
MISSIONS.forEach((m, i) => {
  const name = `ภารกิจ ${i + 1} ${m.title}`;
  ok(ids.has(m.world), name + ' อยู่ใน SECTOR ที่มี');
  ok(m.story && m.hint && m.learn, name + ' ต้องมีเรื่อง คำใบ้ และสิ่งที่เรียนรู้');
  if (m.plain) {
    ok(/^[A-Z ]+$/.test(m.plain), name + ' ข้อความจริงต้องเป็น A-Z และช่องว่าง');
    if (m.key != null) { const c = CC.encrypt(m.plain, m.key); eq(CC.decrypt(c, m.key), m.plain, name + ' ถอดกลับได้'); ok(c !== m.plain, name + ' รหัสต้องต่างจากข้อความจริง'); }
  }
  if (m.type === 'crack' || m.type === 'final') { eq(CC.bestKey(CC.encrypt(m.plain, m.key)), m.key, name + ' เครื่องลองทุกกุญแจต้องหากุญแจได้'); }
  if (m.crib) ok(CC.encrypt(m.plain, m.key).startsWith(CC.encrypt(m.crib, m.key)) && m.plain.startsWith(m.crib), name + ' crib ต้องเป็นคำแรก');
  if (m.tools && m.tools.includes('freq') && m.plain) { const pk = CC.peakKey(CC.encrypt(m.plain, m.key)); eq(pk.key, m.key, name + ' ตัวพบบ่อยสุดต้องเป็น E'); ok(!pk.tie, name + ' ต้องไม่มีตัวอักษรเสมอกัน'); }
  if (m.type === 'layers') { const [a, b] = m.layers, c = CC.encrypt(CC.encrypt(m.plain, a), b); eq(CC.decrypt(CC.decrypt(c, b), a), m.plain, name + ' ปลดสองชั้น'); eq(CC.decrypt(c, a + b), m.plain, name + ' เท่ากับกุญแจรวม'); }
  if (m.clue) { ok(CC.encrypt('A', m.key) === 'H', name + ' เบาะแส A กลายเป็น H'); }
  if (m.rot13) eq(m.key, 13, name + ' ต้องใช้กุญแจ 13');
  if (m.lines) m.lines.forEach(l => { for (let k = 1; k < 26; k++) if (k !== 13) eq(CC.bestKey(CC.encrypt(l.text, k)), k, name + ' บอสบรรทัด ' + l.text + ' กุญแจ ' + k); });
});
// ข้อความสุ่มของโหมดจับเวลา ต้องแกะได้ด้วยเครื่องลองทุกกุญแจเสมอ
CC.BANK.forEach(b => { for (let k = 1; k < 26; k++) if (k !== 13) eq(CC.bestKey(CC.encrypt(b.text, k)), k, 'BANK ' + b.text + ' กุญแจ ' + k); ok(/^[A-Z ]+$/.test(b.text), 'BANK ' + b.text + ' ต้องเป็น A-Z'); ok(b.th, 'BANK ต้องมีคำแปลไทย'); });
Object.values(CC.TECH_WORDS).flat().forEach(w => ok(/^[A-Z]+$/.test(w), 'คำศัพท์ ' + w + ' ต้องเป็น A-Z'));

console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
