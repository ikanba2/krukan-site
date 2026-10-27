/* ทดสอบ Techno Parts: กติกาที่วาง + ทุกด่านของทุกโลกด้วยหลาย seed
   ทุกด่านต้อง: เริ่มต้นยังไม่ผ่าน · plan() ทำตามแล้วผ่านโดยไม่มีข้อผิดเลย · ชิ้นทุกชิ้นมีที่ให้วางจริง · วางผิดที่ถูกจับได้พร้อมเหตุผล
   รัน: node tools/games/parts/test_engine.js */
'use strict';
const E = require('./engine.js');
const LV = require('./levels.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

/* ---------- กติกาพื้นฐานด้วยด่านเล็กที่สร้างเอง ---------- */
{
  const lv = {
    zones: [{ id: 'in', kind: 'bin', acc: { k: 'grp', v: 'in' } }, { id: 'out', kind: 'bin', acc: { k: 'grp', v: 'out' } }, { id: 'usb1', kind: 'port', acc: { k: 'port', v: 'usb' } }, { id: 'usb2', kind: 'port', acc: { k: 'port', v: 'usb' } }, { id: 'hdmi', kind: 'port', acc: { k: 'port', v: 'hdmi' } }, { id: 'tray', kind: 'tray' }],
    items: [E.mkItem('a', 'mouse', { grp: 'in', port: 'usb' }), E.mkItem('b', 'monitor', { grp: 'out', port: 'hdmi' }), E.mkItem('c', 'keyboard', { grp: 'in', port: 'usb' }), E.mkItem('d', 'printer', { port: 'usb' })],
    checks: [{ text: 'ถัง', items: ['a', 'b'] }], pre: {}
  };
  const st = E.init(lv); eq(E.status(lv, st).done, false, 'เริ่มต้นยังไม่ผ่าน');
  let r = E.drop(lv, st, 'a', 'out'); ok(!r.ok && r.why === 'wrong' && !r.soft && /ส่วนรับข้อมูลเข้า/.test(r.msg) && /ส่วนแสดงผล/.test(r.msg), 'วางผิดถังถูกจับ มีเหตุผลบอกกลุ่มจริง: ' + r.msg);
  eq(st.loc.a, null, 'วางผิดแล้วชิ้นยังอยู่ในถาด');
  r = E.drop(lv, st, 'a', 'in'); ok(r.ok && st.loc.a === 'in', 'วางถูกถัง'); eq(E.itemOk(lv, st, 'a'), true, 'ชิ้นถูกที่');
  r = E.drop(lv, st, 'a', 'in'); ok(!r.ok && r.why === 'same' && r.soft, 'วางที่เดิมซ้ำ = same ไม่นับผิด');
  r = E.drop(lv, st, 'c', 'hdmi'); ok(!r.ok && !r.soft && /HDMI/.test(r.msg) && /USB/.test(r.msg), 'แป้นพิมพ์เสียบ HDMI ผิด บอกว่าต้อง USB: ' + r.msg);
  r = E.drop(lv, st, 'c', 'usb1'); ok(r.ok, 'แป้นพิมพ์เสียบ USB ได้');
  r = E.drop(lv, st, 'a', 'usb1'); ok(!r.ok && r.why === 'full' && r.soft, 'ช่อง USB เต็มแล้ว ไม่นับผิด');
  r = E.drop(lv, st, 'd', 'usb2'); ok(r.ok, 'เครื่องพิมพ์เสียบ USB ช่องที่สอง');
  r = E.drop(lv, st, 'c', 'tray'); ok(r.ok && st.loc.c === null, 'ลากกลับถาดได้เสมอ');
  r = E.drop(lv, st, 'b', 'hdmi'); ok(r.ok, 'จอเสียบ HDMI'); eq(E.status(lv, st).done, true, 'a อยู่ถังรับเข้า b เสียบ HDMI ถูกที่ทั้งคู่ เช็กข้อเดียวผ่าน'); E.drop(lv, st, 'b', 'tray'); eq(E.status(lv, st).done, false, 'ดึง b กลับถาด เช็กลิสต์ไม่ครบ');
}
// ด่านงานลูกค้า: any-of + ซ้ำหน้าที่ไม่นับผิด
{
  const lv = { zones: [{ id: 'cart', kind: 'cart', acc: { k: 'need' }, cap: 99 }, { id: 'tray', kind: 'tray' }], items: [E.mkItem('s', 'speaker', { need: 'sound' }), E.mkItem('h', 'headphones', { need: 'sound' }), E.mkItem('p', 'printer', {})], checks: [{ text: 'เสียง', items: ['s', 'h'], any: true }], xwhy: { printer: 'ไม่ต้องใช้เครื่องพิมพ์' } };
  const st = E.init(lv); let r = E.drop(lv, st, 'p', 'cart'); ok(!r.ok && !r.soft && r.msg === 'ไม่ต้องใช้เครื่องพิมพ์', 'ตัวหลอกมีคำอธิบายพิเศษ');
  r = E.drop(lv, st, 's', 'cart'); ok(r.ok, 'ลำโพงตอบโจทย์เสียง'); eq(E.status(lv, st).done, true, 'ชิ้นเดียวพอ (any)');
  r = E.drop(lv, st, 'h', 'cart'); ok(!r.ok && r.why === 'dup' && r.soft, 'หูฟังซ้ำหน้าที่ ไม่นับผิด');
}
// ด่านซ่อม: เสียบผิดช่องต้องย้ายออกก่อนผ่าน
{
  const L = LV.getLevel(4, 9); const st = E.init(L);
  const sp = L.items.find(i => i.dev === 'speaker'); eq(st.loc[sp.id], 'mic', 'ลำโพงเริ่มเสียบผิดช่องไมค์'); ok(E.wrongPlaced(L, st).includes(sp.id), 'ถูกนับเป็นเสียบผิดที่');
  ok(!E.status(L, st).done, 'ด่านซ่อมเริ่มต้นยังไม่ผ่าน');
}

/* ---------- ทุกด่าน ---------- */
const SEEDS = [null, 101, 202, 303, 404, 505, 606, 707, 808, 909, 1010, 1111];
let levels = 0;
for (let w = 1; w <= 4; w++) for (let n = 1; n <= 10; n++) for (const seed of SEEDS) {
  const L = seed == null ? LV.getLevel(w, n) : LV.makeLevel(w, n, seed), tag = `โลก ${w} ด่าน ${n}${seed ? ' seed ' + seed : ''} (${L.kind})`; levels++;
  ok(L.title && L.desc && L.kind, tag + ' มีชื่อ คำอธิบาย ชนิด');
  ok(L.items.length >= 3 && L.items.length <= 14, tag + ' จำนวนชิ้น 3-14 (ถาดวางได้) ได้ ' + L.items.length);
  ok(L.checks.length >= 1 && L.checks.length <= 6, tag + ' เช็กลิสต์ 1-6 ข้อ (แผงภารกิจพอดี) ได้ ' + L.checks.length);
  ok(new Set(L.items.map(i => i.id)).size === L.items.length, tag + ' รหัสชิ้นไม่ซ้ำ');
  ok(new Set(L.zones.map(z => z.id)).size === L.zones.length, tag + ' รหัสที่วางไม่ซ้ำ');
  L.checks.forEach(c => c.items.forEach(id => ok(E.itemOf(L, id), tag + ' ชิ้นในเช็กลิสต์มีจริง ' + id)));
  const st0 = E.init(L); ok(!E.status(L, st0).done, tag + ' เริ่มต้นยังไม่ผ่าน');
  ok(E.solves(L), tag + ' plan() ทำตามแล้วผ่านโดยไม่ผิดเลย');
  ok(L.par >= 1 && L.par <= 14, tag + ' par สมเหตุสมผล ' + L.par);
  // ชิ้นที่ต้องใช้ทุกชิ้นต้องมีที่วางที่ถูกต้องอย่างน้อยหนึ่งแห่ง
  E.needed(L) && E.needed(L).forEach(id => { const it = E.itemOf(L, id); ok(L.zones.some(z => z.kind !== 'tray' && E.fits(L, it, z)), tag + ' ชิ้น ' + it.n + ' มีที่ให้วาง'); });
  // ความจุ: จำนวนชิ้นที่ต้องใช้ในแต่ละชนิดช่องต้องไม่เกินจำนวนช่อง (ด่านเสียบสาย/ประกอบ/เรียง)
  if (['plug', 'fix', 'build', 'order'].includes(L.kind)) {
    const key = { plug: 'port', fix: 'port', build: 'part', order: 'step' }[L.kind], need = {}, have = {};
    L.items.forEach(it => { if (E.needed(L).has(it.id) || L.pre && L.pre[it.id]) { const v = it.f[key]; if (v !== undefined) need[v] = (need[v] || 0) + 1; } });
    L.zones.forEach(z => { if (z.kind !== 'tray') have[z.acc.v] = (have[z.acc.v] || 0) + 1; });
    Object.keys(need).forEach(v => ok(need[v] <= (have[v] || 0), tag + ` ช่อง ${v} พอ (ต้องใช้ ${need[v]} มี ${have[v] || 0})`));
  }
  // วางผิดที่ต้องถูกจับ: ลองทุกชิ้นกับทุกที่วางที่ไม่ตรง ต้องถูกปฏิเสธ (wrong ไม่ soft) พร้อมข้อความ
  L.items.slice(0, 6).forEach(it => L.zones.filter(z => z.kind !== 'tray' && !E.fits(L, it, z)).slice(0, 3).forEach(z => {
    const st = E.init(L), r = E.canDrop(L, st, it.id, z.id);
    ok(!r.ok && r.why === 'wrong' && !r.soft && r.msg && r.msg.length > 8, tag + ` วาง ${it.n} ที่ ${z.id} ต้องถูกจับ`);
  }));
  // ด่านซ่อม: ต้องมีของที่เสียบผิดหรือหลุดอย่างน้อยหนึ่งอย่างตามจำนวนอาการ
  if (L.kind === 'fix') { const unplugged = L.items.filter(i => !st0.loc[i.id]).length, wrong = E.wrongPlaced(L, st0).length; eq(unplugged + wrong, L.checks.length, tag + ' จำนวนอาการ = ชิ้นที่หลุดหรือเสียบผิด'); }
  // ชิ้นที่วางอยู่ในถังของด่านจัดกลุ่มต้องแบ่งสมดุล: ทุกถังมีของ
  if (L.kind === 'sort') L.zones.filter(z => z.kind === 'bin').forEach(z => ok(L.items.some(i => i.f.grp === z.acc.v), tag + ' ถัง ' + z.acc.v + ' มีของ'));
  // ข้อมูลดิบต้องซีเรียลไลซ์ได้ (ไม่มีฟังก์ชัน) เพราะเกมเก็บ/ส่งต่อได้
  ok(JSON.stringify(L).length > 50, tag + ' ซีเรียลไลซ์ได้');
}
// ด่านปกติต้องคงที่ทุกครั้ง (ทุกคนเจอเหมือนกัน) ส่วน seed ต่างกันได้ของต่างกัน
eq(JSON.stringify(LV.makeLevel(1, 5)), JSON.stringify(LV.makeLevel(1, 5)), 'ด่านปกติคงที่');
ok(JSON.stringify(LV.makeLevel(1, 6, 1)) !== JSON.stringify(LV.makeLevel(1, 6, 2)), 'ฝึกสุ่มต่าง seed ได้ของต่างกัน');
// ด่านบอสมีมอนสเตอร์บอส
for (let w = 1; w <= 4; w++) { const L = LV.getLevel(w, 10); ok(L.boss && L.monsters[0] === LV.WORLDS[w - 1].boss, `บอสโลก ${w}`); }
// ความหลากหลายของโลก 1: ทุกชนิดอุปกรณ์ปรากฏในด่านปกติอย่างน้อยหนึ่งครั้ง (ไม่ใช่เล่นแต่ของเดิม)
{ const seen = new Set(); for (let n = 1; n <= 10; n++) LV.getLevel(1, n).items.forEach(i => seen.add(i.dev)); ok(seen.size >= 18, 'โลก 1 ใช้อุปกรณ์หลากหลาย (' + seen.size + ' ชนิด)'); }
// ข้อความอธิบายบน พจนานุกรมอุปกรณ์ครบ
Object.keys(E.DEV).forEach(k => ok(E.DEV[k].n && E.DEV[k].ic && E.DEV[k].use, 'อุปกรณ์ ' + k + ' มีชื่อ ไอคอน หน้าที่'));
console.log(`ทดสอบ ${levels} ด่าน · ผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`); process.exit(fail ? 1 : 0);
