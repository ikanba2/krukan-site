/* ทดสอบ Techno Slice: กติกาที่วาง + ทุกด่านของทุกโลกด้วยหลาย seed + ตรวจความถูกต้องของโจทย์เลข (คำนวณซ้ำอีกทาง)
   รัน: node tools/games/slice/test_engine.js */
'use strict';
const E = require('./engine.js');
const LV = require('./levels.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

/* ---------- ตัวช่วยเศษส่วน ---------- */
eq(E.vstr(2, 4), '1/2', '2/4 ย่อเป็น 1/2'); eq(E.vstr(6, 8), '3/4', '6/8 ย่อเป็น 3/4'); eq(E.fstr(2, 4), '2/4', 'เขียนตามที่เห็น');
eq(E.mixed(11, 4), { w: 2, n: 3, d: 4 }, '11/4 = 2 3/4'); eq(E.mstr(11, 4), '2 3/4', 'จำนวนคละเขียนเป็นข้อความ'); eq(E.mstr(3, 4), '3/4', 'เศษแท้ไม่มีจำนวนเต็ม'); eq(E.mstr(8, 4), '2', 'หารลงตัว');

/* ---------- กติกาพื้นฐานด้วยด่านเล็กที่สร้างเอง ---------- */
{
  const lv = {
    zones: [{ id: 'plate', kind: 'plate', acc: { k: 'den', v: 8 }, cap: 2, q: { a: 2, b: 8 } }, { id: 'pic1', kind: 'pic', acc: { k: 'frac', v: '3/8' }, pic: { n: 3, d: 8, shape: 'pie' } }, { id: 'tray', kind: 'tray' }],
    items: [E.mkSlice('a', 8), E.mkSlice('b', 8), E.mkSlice('c', 8), E.mkSlice('d', 6), E.mkCard('e', 3, 8), E.mkCard('f', 2, 8)],
    checks: [{ text: 'จาน', full: ['plate'] }, { text: 'ภาพ', items: ['e'] }]
  };
  const st = E.init(lv); eq(E.status(lv, st).done, false, 'เริ่มต้นยังไม่ผ่าน');
  let r = E.drop(lv, st, 'd', 'plate'); ok(!r.ok && r.why === 'wrong' && !r.soft && /6 ส่วน/.test(r.msg) && /2\/8/.test(r.msg), 'ชิ้นผิดตัวส่วนถูกจับ: ' + r.msg);
  r = E.drop(lv, st, 'a', 'plate'); ok(r.ok, 'ชิ้น 1/8 ลงจาน'); r = E.drop(lv, st, 'b', 'plate'); ok(r.ok, 'ชิ้นที่สอง');
  r = E.drop(lv, st, 'c', 'plate'); ok(!r.ok && r.why === 'full' && r.soft, 'จานเต็มแล้ว ไม่นับผิด'); eq(E.status(lv, st).checks, [true, false], 'เช็กจานผ่าน ภาพยังไม่ผ่าน');
  r = E.drop(lv, st, 'f', 'pic1'); ok(!r.ok && !r.soft && /3\/8/.test(r.msg) && /2\/8/.test(r.msg), 'การ์ดผิดถูกจับ บอกเศษส่วนของภาพ: ' + r.msg);
  r = E.drop(lv, st, 'e', 'pic1'); ok(r.ok, 'การ์ดถูก'); eq(E.status(lv, st).done, true, 'ผ่านทุกข้อ');
  E.drop(lv, st, 'a', 'tray'); eq(E.status(lv, st).done, false, 'ดึงชิ้นกลับ จานไม่เต็ม ไม่ผ่านแล้ว');
}
{ // ค่าเท่ากัน: 2/4 ลงภาพ 1/2 ได้
  const lv = { zones: [{ id: 'p', kind: 'pic', acc: { k: 'val', v: '1/2' }, pic: { n: 4, d: 8 }, cap: 1 }, { id: 'tray', kind: 'tray' }], items: [E.mkCard('x', 2, 4), E.mkCard('y', 3, 6), E.mkCard('z', 2, 3)], checks: [{ text: 't', items: ['x'] }] };
  const st = E.init(lv); ok(E.drop(lv, st, 'z', 'p').ok === false, '2/3 ไม่เท่ากับ 4/8'); ok(E.drop(lv, st, 'x', 'p').ok, '2/4 เท่ากับ 4/8'); ok(E.canDrop(lv, st, 'y', 'p').why === 'full', '3/6 เท่ากันแต่ช่องเต็ม');
}

/* ---------- ทุกด่าน ---------- */
const SEEDS = [null, 101, 202, 303, 404, 505, 606, 707, 808, 909, 1010, 1111, 1212, 1313];
let levels = 0;
for (let w = 1; w <= 4; w++) for (let n = 1; n <= 10; n++) for (const seed of SEEDS) {
  const L = seed == null ? LV.getLevel(w, n) : LV.makeLevel(w, n, seed), tag = `โลก ${w} ด่าน ${n}${seed ? ' seed ' + seed : ''} (${L.kind})`; levels++;
  ok(L.title && L.desc && L.kind, tag + ' มีชื่อ คำอธิบาย ชนิด');
  ok(L.items.length >= 3 && L.items.length <= 14, tag + ' จำนวนชิ้น 3-14 ได้ ' + L.items.length);
  ok(L.checks.length >= 1 && L.checks.length <= 6, tag + ' เช็กลิสต์ 1-6 ข้อ ได้ ' + L.checks.length);
  ok(new Set(L.items.map(i => i.id)).size === L.items.length, tag + ' รหัสชิ้นไม่ซ้ำ');
  ok(new Set(L.zones.map(z => z.id)).size === L.zones.length, tag + ' รหัสที่วางไม่ซ้ำ');
  const st0 = E.init(L); ok(!E.status(L, st0).done, tag + ' เริ่มต้นยังไม่ผ่าน');
  ok(E.solves(L), tag + ' plan() ทำตามแล้วผ่านโดยไม่ผิดเลย');
  ok(L.par >= 1 && L.par <= 14, tag + ' par สมเหตุสมผล ' + L.par);
  // วางผิดที่ต้องถูกจับพร้อมข้อความ
  L.items.slice(0, 8).forEach(it => L.zones.filter(z => z.kind !== 'tray' && !E.fits(L, it, z)).slice(0, 3).forEach(z => {
    const r = E.canDrop(L, E.init(L), it.id, z.id); ok(!r.ok && r.why === 'wrong' && !r.soft && r.msg && r.msg.length > 8, tag + ` วาง ${it.n} ที่ ${z.id} ต้องถูกจับ`);
  }));
  const fitCount = it => L.zones.filter(z => z.kind !== 'tray' && E.fits(L, it, z)).length;
  const inChecks = new Set(); L.checks.forEach(c => (c.items || []).forEach(i => inChecks.add(i)));
  if (['match', 'eq', 'line', 'order'].includes(L.kind)) {
    L.items.forEach(it => ok(fitCount(it) <= 1, tag + ' การ์ด ' + it.n + ' ตรงกับที่วางได้ไม่เกิน 1 แห่ง ได้ ' + fitCount(it)));
    L.items.filter(it => inChecks.has(it.id)).forEach(it => ok(fitCount(it) === 1, tag + ' การ์ด ' + it.n + ' ต้องมีที่วางพอดี 1 แห่ง'));
  }
  if (L.kind === 'conv') L.items.forEach(it => ok(fitCount(it) <= 1, tag + ' การ์ด ' + it.n + ' ไม่กำกวม'));
  if (L.kind === 'match') L.zones.filter(z => z.kind === 'pic').forEach(z => { ok(z.pic.n > 0 && z.pic.n < z.pic.d, tag + ' ภาพเป็นเศษส่วนแท้'); });
  if (L.kind === 'line') L.zones.filter(z => z.kind === 'tick').forEach(z => ok(z.tick.i > 0 && z.tick.i < z.tick.R * z.tick.d && (z.tick.i % z.tick.d !== 0), tag + ' ขีดอยู่ในเส้นและไม่ซ้อนจำนวนเต็ม'));
  if (L.kind === 'order') { const rk = L.items.map(i => i.f.rank).sort((a, b) => a - b); eq(rk, rk.map((_, i) => i + 1), tag + ' ลำดับ 1..n ครบ'); }
  if (L.kind === 'order' && L.same === 'den') { const sorted = L.items.slice().sort((a, b) => a.f.rank - b.f.rank); ok(sorted.every((c, i) => i === 0 || c.num > sorted[i - 1].num), tag + ' เรียงตัวเศษถูก'); }
  if (L.kind === 'order' && L.same === 'num') { const sorted = L.items.slice().sort((a, b) => a.f.rank - b.f.rank); ok(sorted.every((c, i) => i === 0 || c.den < sorted[i - 1].den), tag + ' ตัวเศษเท่ากัน ตัวส่วนมากค่าน้อย'); }
  if (L.kind === 'pack') { const P = L.pack; ok(P.total === P.k * P.b + P.r && P.r >= 1 && P.r < P.b && L.items.length === P.total, tag + ' จำนวนชิ้นในกล่องถูก'); }
  if (L.kind === 'cut') L.orders.forEach(o => ok(o.a >= 1 && o.a < o.b && L.items.filter(i => i.f.den === o.b).length >= o.a, tag + ' มีชิ้นพอสำหรับออเดอร์ ' + o.a + '/' + o.b));
  if (L.kind === 'calc') L.qs.forEach((q, qi) => { // คำนวณซ้ำจากเลขในภาพโจทย์อีกทาง
    const nums = q.pics.filter(p => typeof p === 'object').map(p => p.n), ops = q.pics.filter(p => typeof p === 'string');
    let tot = nums[0]; ops.forEach((o, i) => { tot = o === '+' ? tot + nums[i + 1] : tot - nums[i + 1]; });
    const ans = q.ans.w !== undefined ? q.ans.w * q.d + q.ans.n : q.ans.n;
    ok(tot === ans && q.pics.every(p => typeof p === 'string' || p.d === q.d), tag + ` โจทย์ข้อ ${qi + 1} คำตอบถูก (${tot} = ${ans})`);
    ok(q.ans.n > 0 && q.ans.n < q.d + (q.type === 'subwhole' ? 1 : 0), tag + ` ข้อ ${qi + 1} ตัวเศษอยู่ในช่วง`);
    ok(q.ans.w === undefined || (q.ans.w >= 1 && q.ans.n >= 1 && q.ans.n < q.d), tag + ` ข้อ ${qi + 1} จำนวนคละถูกรูปแบบ`);
    ok(q.text.length > 20, tag + ' มีเนื้อโจทย์');
  });
}
eq(JSON.stringify(LV.makeLevel(1, 5)), JSON.stringify(LV.makeLevel(1, 5)), 'ด่านปกติคงที่');
ok(JSON.stringify(LV.makeLevel(1, 6, 1)) !== JSON.stringify(LV.makeLevel(1, 6, 2)), 'ฝึกสุ่มต่าง seed ได้ของต่างกัน');
for (let w = 1; w <= 4; w++) { const L = LV.getLevel(w, 10); ok(L.boss && L.monsters[0] === LV.WORLDS[w - 1].boss, `บอสโลก ${w}`); }
console.log(`ทดสอบ ${levels} ด่าน · ผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`); process.exit(fail ? 1 : 0);
