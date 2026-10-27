/* ทดสอบ Techno Folder: กติการะบบไฟล์จำลอง + ทุกด่านของทุกโลกด้วยหลาย seed
   ทุกด่านต้อง: เริ่มต้นยังไม่ผ่าน · plan() ทำตามแล้วผ่านโดยไม่มีความผิดพลาด · ไม่มีชื่อซ้ำในโฟลเดอร์เดียวกัน · เช็กลิสต์ครอบคลุมเป้าหมายทุกข้อ · ตัวเลือกชื่อมีชื่อที่ถูก
   และการกระทำผิดที่คาดไว้ต้องถูก judge จับได้ (ย้ายผิดหมวด ลบไฟล์ที่ยังใช้ ย้ายไฟล์ที่ต้องคัดลอก ตั้งชื่อกว้างเกินไป ตั้งชื่อซ้ำ) */
'use strict';
const E = require('./engine.js');
const LV = require('./levels.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

/* ---------- กติการะบบไฟล์ ---------- */
{
  const fs = E.make([{ n: 'A', c: [], k: 'A' }, { n: 'B', c: [{ n: 'B1', c: [], k: 'B1' }], k: 'B' }, { n: 'ไฟล์1', f: 'doc', k: 'f1' }, { n: 'ไฟล์2', f: 'img', k: 'f2' }], [{ n: 'ถังเก่า', f: 'doc', k: 'old', from: 'A' }]);
  const id = k => fs.keys[k];
  eq(E.kids(fs, 'root').map(i => fs.nodes[i].name), ['A', 'B', 'ไฟล์1', 'ไฟล์2'], 'โฟลเดอร์มาก่อนไฟล์');
  let r = E.move(fs, [id('f1')], id('A')); ok(r.ok && fs.nodes[id('f1')].parent === id('A'), 'ย้ายไฟล์เข้าโฟลเดอร์');
  eq(E.kids(fs, id('A')).length, 1, 'โฟลเดอร์ A มี 1 ไฟล์'); eq(E.kids(fs, 'root').length, 3, 'เดสก์ท็อปเหลือ 3');
  r = E.move(fs, [id('B')], id('B1')); eq(r.why, 'self', 'ย้ายโฟลเดอร์เข้าตัวเอง/ลูกตัวเองไม่ได้');
  r = E.move(fs, [id('f1')], id('A')); eq(r.why, 'same', 'ย้ายไปที่เดิม = same');
  r = E.copy(fs, [id('f2')], 'root'); ok(r.ok && fs.nodes[r.ids[0]].name === 'ไฟล์2 - สำเนา', 'คัดลอกในที่เดิมได้ชื่อ - สำเนา');
  r = E.copy(fs, [id('f2')], 'root'); ok(r.ok && fs.nodes[r.ids[0]].name === 'ไฟล์2 - สำเนา (2)', 'คัดลอกซ้ำได้ (2)');
  r = E.copy(fs, [id('f2')], id('B')); ok(r.ok && fs.nodes[r.ids[0]].name === 'ไฟล์2' && fs.nodes[r.ids[0]].copyOf === id('f2'), 'คัดลอกไปที่อื่นชื่อเดิม และจำต้นฉบับ');
  r = E.del(fs, [id('f2')]); ok(r.ok && fs.nodes[id('f2')].parent === 'bin' && fs.nodes[id('f2')].from === 'root', 'ลบแล้วไปอยู่ถังรีไซเคิล จำที่เดิม');
  r = E.restore(fs, [id('f2')]); ok(r.ok && fs.nodes[id('f2')].parent === 'root', 'กู้คืนกลับที่เดิม');
  r = E.restore(fs, [id('old')]); ok(r.ok && fs.nodes[id('old')].parent === id('A'), 'กู้คืนกลับโฟลเดอร์ที่จำไว้ (A)');
  r = E.newFolder(fs, 'root'); eq(fs.nodes[r.id].name, 'โฟลเดอร์ใหม่', 'สร้างโฟลเดอร์ใหม่ได้ชื่อมาตรฐาน');
  r = E.newFolder(fs, 'root'); eq(fs.nodes[r.id].name, 'โฟลเดอร์ใหม่ (2)', 'โฟลเดอร์ใหม่ใบที่สองได้ (2)');
  r = E.rename(fs, id('A'), 'B'); eq(r.why, 'dup', 'ตั้งชื่อซ้ำไม่ได้'); r = E.rename(fs, id('A'), 'ก/ข'); eq(r.why, 'chars', 'ชื่อมีอักขระต้องห้ามไม่ได้');
  r = E.rename(fs, id('A'), 'เอ'); ok(r.ok, 'เปลี่ยนชื่อได้');
  E.del(fs, [id('B')]); eq(E.inBin(fs, id('B1')), true, 'ลบโฟลเดอร์ ลูกอยู่ในถังด้วย'); r = E.restore(fs, [id('B')]); ok(r.ok && E.kids(fs, id('B')).includes(id('B1')), 'กู้โฟลเดอร์ ลูกกลับมาด้วย');
  E.setClip(fs, 'cut', [id('f1')]); r = E.paste(fs, id('B')); ok(r.ok && fs.nodes[id('f1')].parent === id('B') && !fs.clip, 'ตัดแล้ววาง = ย้าย และเคลียร์คลิปบอร์ด');
  E.setClip(fs, 'copy', [id('f1')]); r = E.paste(fs, 'root'); ok(r.ok && fs.clip, 'คัดลอกแล้ววาง คลิปบอร์ดยังอยู่');
  eq(E.pathNames(fs, id('B1')), ['เดสก์ท็อป', 'B', 'B1'], 'เส้นทางของ B1');
}

/* ---------- ทุกด่านทุกโลก ---------- */
let levelsChecked = 0, planTotal = 0;
function runLevel(L, label) {
  const fs = E.init(L); const st0 = E.status(L, fs);
  ok(!st0.done, label + ': เริ่มต้นต้องยังไม่ผ่าน');
  ok(L.goals.length > 0 && L.checks.length > 0, label + ': มีเป้าหมายและเช็กลิสต์');
  const cov = new Set(); L.checks.forEach(c => c.goals.forEach(i => cov.add(i))); ok(L.goals.every((g, i) => cov.has(i)), label + ': เช็กลิสต์ครอบคลุมทุกเป้าหมาย');
  const dupCheck = f => { Object.values(f.nodes).forEach(n => { const names = n.kids.map(i => f.nodes[i].name.toLowerCase()); if (new Set(names).size !== names.length) ok(false, label + ': ชื่อซ้ำใน ' + n.name + ' ' + names.join(',')); }); };
  dupCheck(fs); ok(L.spec.length > 0 || L.kind === 'create', label + ': มีไฟล์ในด่าน');
  const ops = E.plan(L, fs); ok(ops.length > 0, label + ': plan ไม่ว่าง'); planTotal += ops.length;
  const refs = {}; let step = 0;
  for (const op of ops) {
    const r = E.applyOp(L, fs, op, refs); step++;
    if (!r.ok) { ok(false, label + ': ขั้นที่ ' + step + ' ' + op.t + ' ผิดพลาด ' + (r.mistake || r.why)); break; }
  }
  const st = E.status(L, fs); ok(st.done, label + ': ทำตาม plan แล้วต้องผ่าน (เหลือ ' + st.left + ')');
  dupCheck(fs);
  eq(E.plan(L, fs), [], label + ': ผ่านแล้ว plan ต้องว่าง');
  const fs2 = E.init(L);
  L.goals.forEach(g => {
    if (g.t === 'name') {
      const id = E.idOf(fs2, g.k), ch = E.nameChoices(L, fs2, id);
      ok(ch.includes(g.names[0]) && ch.length >= 3 && ch.length <= 6, label + ': ตัวเลือกชื่อของ ' + g.k + ' = ' + ch.join('|'));
      ok(E.judgeName(L, fs2, id, g.names[0]) === null, label + ': ชื่อที่ถูกต้องผ่าน judgeName'); ok(E.judgeName(L, fs2, id, 'งาน') !== null, label + ': ชื่อ งาน ต้องผิด');
    }
  });
  levelsChecked++;
}
for (let w = 1; w <= 4; w++) for (let n = 1; n <= 10; n++) {
  runLevel(LV.getLevel(w, n), `โลก${w} ด่าน${n}`);
  for (const seed of [5, 77, 4242, 98765, 31337]) runLevel(LV.makeLevel(w, n, seed), `โลก${w} ด่าน${n} seed${seed}`);
}
ok(levelsChecked === 4 * 10 * 6, 'ตรวจครบ 240 ด่าน (ได้ ' + levelsChecked + ')');

/* ---------- ตัวตรวจความผิดพลาดที่คาดไว้ ---------- */
{
  const L = LV.getLevel(1, 1), fs = E.init(L), f0 = fs.keys.f0, f1 = fs.keys.f1, a = fs.keys.x00;
  let j = E.judge(L, fs, { t: 'move', ids: [a], dest: f1 }); ok(j && /ควรอยู่ในโฟลเดอร์/.test(j.why), 'ย้ายผิดหมวดโดนจับ: ' + (j && j.why));
  j = E.judge(L, fs, { t: 'move', ids: [a], dest: f0 }); eq(j, null, 'ย้ายถูกหมวดไม่ผิด');
  j = E.judge(L, fs, { t: 'del', ids: [a] }); ok(j && /ไม่ต้องลบ/.test(j.why), 'ลบไฟล์ที่ยังใช้โดนจับ');
  j = E.judge(L, fs, { t: 'copy', ids: [a], dest: f0 }); ok(!!j, 'โลก 1 ห้ามคัดลอก');
  j = E.judge(L, fs, { t: 'new', p: 'root' }); ok(!!j, 'โลก 1 ห้ามสร้างโฟลเดอร์');
}
{
  const L = LV.getLevel(3, 2), fs = E.init(L), c0 = fs.keys.c0, fc = fs.keys.fc;
  let j = E.judge(L, fs, { t: 'move', ids: [c0], dest: fc }); ok(j && /ต้องคัดลอก/.test(j.why), 'ไฟล์ที่ต้องคัดลอกห้ามย้าย');
  j = E.judge(L, fs, { t: 'copy', ids: [c0], dest: fc }); eq(j, null, 'คัดลอกถูก');
}
{
  const L = LV.getLevel(3, 5), fs = E.init(L), b0 = fs.keys.b0, r0 = fs.keys.r0;
  let j = E.judge(L, fs, { t: 'restore', ids: [b0] }); ok(j && /ปล่อยไว้ในถังรีไซเคิล/.test(j.why), 'ห้ามกู้ไฟล์ที่ลบถูกแล้ว'); j = E.judge(L, fs, { t: 'restore', ids: [r0] }); eq(j, null, 'กู้ไฟล์ที่เผลอลบได้');
  const L4 = LV.getLevel(3, 4), fs4 = E.init(L4); j = E.judge(L4, fs4, { t: 'del', ids: [fs4.keys.k0] }); ok(j && /ยังต้องใช้/.test(j.why), 'ลบไฟล์ที่ยังใช้โดนจับ'); j = E.judge(L4, fs4, { t: 'del', ids: [fs4.keys.j0] }); eq(j, null, 'ลบไฟล์ที่ไม่ใช้ได้');
}
{
  const L = LV.getLevel(2, 7), fs = E.init(L), nf = E.newFolder(fs, 'root'), j = E.judgeName(L, fs, nf.id, 'ภาพสัตว์'); ok(j && j.dup, 'ตั้งชื่อซ้ำโดนจับ');
  ok(E.judgeName(L, fs, nf.id, 'ภาพสัตว์น้ำ') === null, 'ชื่อภาพสัตว์น้ำผ่าน'); ok(!!E.judgeName(L, fs, nf.id, 'ใหม่1'), 'ชื่อ ใหม่1 ผิด');
}
{
  const L = LV.getLevel(2, 3), fs = E.init(L), id = fs.keys.p0, g = L.goals[0], wrong = g.bad.find(b => !E.VAGUE.includes(b));
  const j = E.judgeName(L, fs, id, wrong); ok(j && /ไม่ตรงกับสิ่งที่อยู่ข้างใน/.test(j.why), 'ชื่อผิดหมวดโดนจับ: ' + wrong);
}
for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) { const L = LV.makeLevel(4, 5, seed), q = L.quiz[0]; ok(q.choices.length === 3 && new Set(q.choices).size === 3 && q.ans >= 0, 'ตัวเลือกที่อยู่ไม่ซ้ำ seed' + seed); }
console.log(`ทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ · ตรวจ ${levelsChecked} ด่าน · ขั้นตอนเฉลยรวม ${planTotal}`);
process.exit(fail ? 1 : 0);
