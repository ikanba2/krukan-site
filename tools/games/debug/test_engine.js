/* ทดสอบ Bug Buster: โจทย์ครบถ้วน ตัวเลือกไม่ซ้ำ คำตอบถูกไม่ยาวที่สุด ด่านมีโจทย์พอ การสลับตัวเลือกยังชี้คำตอบถูก คะแนน/ดาว/การแยกคำ รัน: node tools/games/debug/test_engine.js
   (การรันโค้ดไพทอนจริงตรวจที่ gen_content.py แล้ว ไฟล์นี้ตรวจโครงสร้างและตรรกะฝั่งเกม) */
'use strict';
const BB = require('./engine.js');
const D = require('./content.js');
BB.bind(D);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

const ids = new Set();
D.ROUNDS.forEach(r => {
  ok(!ids.has(r.id), 'รหัสไม่ซ้ำ ' + r.id); ids.add(r.id);
  ok(r.lv >= 1 && r.lv <= 9, r.id + ' ด่านถูกต้อง');
  ok(r.lines.length >= 2 && r.lines.length <= 8, r.id + ' โค้ด 2-8 บรรทัด (' + r.lines.length + ')');
  ok(r.bug >= 0 && r.bug < r.lines.length, r.id + ' ตำแหน่งบั๊กอยู่ในโค้ด');
  ok(r.opts.length === 3 && new Set(r.opts.map(o => o.trim())).size === 3, r.id + ' มีสามตัวเลือกไม่ซ้ำ');
  ok(r.opts[0].replace(/\s+$/, '') !== r.lines[r.bug].replace(/\s+$/, ''), r.id + ' คำตอบถูกต่างจากบรรทัดที่มีบั๊ก');
  const L = r.opts.map(o => o.trim().length); ok(L[0] <= Math.max(L[1], L[2]), r.id + ' คำตอบถูกไม่ยาวที่สุด');
  ok(r.expected && r.expected.length <= 60, r.id + ' ผลที่ควรได้สั้นพอ');
  ok(r.actual && r.actual.length <= 120 && r.actual !== r.expected, r.id + ' ผลจริงต่างจากที่ควรได้');
  ok(r.task.length <= 80 && r.title.length <= 28 && r.why.length >= 25 && r.why.length <= 160, r.id + ' ข้อความสั้นพอดี');
  ok(D.KIND[r.kind], r.id + ' ชนิดบั๊กรู้จัก');
  ok(!/[→↗←↘]/.test(r.title + r.task + r.why), r.id + ' ไม่มีลูกศรยาว');
  r.lines.concat(r.opts).forEach(l => { ok(l.length <= 60, r.id + ' บรรทัดโค้ดไม่ยาวเกิน 60'); ok(BB.tokenize(l).map(t => t.s).join('') === l, r.id + ' แยกคำแล้วต่อกลับได้เหมือนเดิม: ' + l); });
});
eq(D.LEVELS.length, 10, 'มี 10 ด่าน');
D.LEVELS.forEach((L, i) => {
  eq(L.id, i + 1, 'id ด่าน ' + (i + 1)); ok(!/[→↗←↘]/.test(L.title + L.desc), 'ด่าน ' + L.id + ' ไม่มีลูกศรยาว');
  for (let s = 1; s <= 30; s++) {
    const rs = BB.roundsFor(L.id, BB.rngOf(s * 7)), want = L.id === 1 ? 3 : L.id === 10 ? 8 : D.ROUNDS.filter(r => r.lv === L.id).length;
    eq(rs.length, want, `ด่าน ${L.id} seed ${s} จำนวนโจทย์`);
    eq(new Set(rs.map(r => r.id)).size, rs.length, `ด่าน ${L.id} seed ${s} ไม่ซ้ำ`);
    rs.forEach(r => { ok(BB.checkOption(r, r.ans) && r.shown[r.ans].trim() === r.opts[0].trim(), r.id + ' ตัวเลือกที่สลับแล้วยังชี้คำตอบถูก'); ok(r.shown.filter((o, k) => BB.checkOption(r, k)).length === 1, r.id + ' มีคำตอบถูกข้อเดียว'); ok(r.fixedLines[r.bug].trim() === r.opts[0].trim(), r.id + ' โค้ดหลังแก้ใช้บรรทัดที่ถูก'); });
  }
  ok(D.ROUNDS.filter(r => r.lv === L.id).length >= 3 || L.id === 10, 'ด่าน ' + L.id + ' มีโจทย์ ≥ 3');
});
// สลับตัวเลือกจริง (ตำแหน่งคำตอบไม่ตายตัว)
{ const pos = new Set(); for (let s = 1; s <= 80; s++) BB.roundsFor(4, BB.rngOf(s)).forEach(r => pos.add(r.ans)); eq([...pos].sort(), [0, 1, 2], 'คำตอบถูกวางสลับทั้งสามตำแหน่ง'); }
// ด่านบอสสุ่มจากด่าน 4-9
BB.roundsFor(10, BB.rngOf(3)).forEach(r => ok(r.lv >= 4 && r.lv <= 9, 'บอสใช้โจทย์ด่าน 4-9'));
// คะแนน ดาว ร่าง
eq([0, 1, 2, 3, 4, 5, 20].map(s => BB.points(s, 0)), [100, 100, 200, 200, 300, 300, 500], 'คะแนนตามคอมโบ');
ok(BB.points(0, 1) > BB.points(0, 0), 'ตอบเร็วได้โบนัส');
eq([0, 1, 2, 3, 4, 5, 6, 9].map(BB.formTier), [0, 0, 1, 1, 2, 2, 3, 3], 'ร่างตามคอมโบ');
eq([BB.stars(true, 100), BB.stars(true, 90), BB.stars(true, 89), BB.stars(true, 70), BB.stars(true, 69), BB.stars(false, 100)], [3, 3, 2, 2, 1, 0], 'ดาว');
eq([BB.accuracy(5, 0), BB.accuracy(5, 5), BB.accuracy(0, 0)], [100, 50, 0], 'ความแม่น');
ok(BB.secsFor(2) > BB.secsFor(10), 'ด่านสูงเวลาแน่นกว่า');
// แยกคำ
eq(BB.tokenize('for i in range(1, 6):').map(t => t.t + ':' + t.s).filter(s => !s.startsWith('ws')), ['kw:for', 'id:i', 'kw:in', 'fn:range', 'op:(', 'num:1', 'op:,', 'num:6', 'op:)', 'op::'], 'แยกคำ for');
eq(BB.tokenize('print("Hi")').map(t => t.t), ['fn', 'op', 'str', 'op'], 'แยกคำ print');
eq(BB.tokenize('    x = 5  # note').map(t => t.t).filter(t => t !== 'ws'), ['id', 'op', 'num', 'cm'], 'แยกคำคอมเมนต์');

console.log(`โจทย์ ${D.ROUNDS.length} ข้อ`);
console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
