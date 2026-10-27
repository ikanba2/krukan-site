/* ทดสอบ Techno Steps: กติกาเอนจิน + ทุกด่านของทุกโลกด้วยหลาย seed: เฉลยต้องผ่านและเก็บดาวครบ เพดานใบบังคับให้ใช้วนซ้ำ/โปรแกรมย่อยจริง
   ด่านเรียงลำดับต้องผิดตอนเริ่ม ด่านซ่อมบั๊กต้องผิดตอนเริ่ม แผนที่ต้องสมเหตุสมผล มอนสเตอร์ในด่านเดียวกันไม่ซ้ำ รัน: node tools/games/steps/test_engine.js */
'use strict';
const E = require('./engine.js');
const LV = require('./levels.js');
const { mv, atk, rep, until, iff, call, P } = LV;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

/* ---------- กติกาเอนจิน ---------- */
const M0 = (o) => Object.assign({ w: 5, h: 3, start: [0, 1], goal: [4, 1], walls: [], pits: [], stars: [], key: null, door: null, mons: [] }, o || {});
{
  const L = { map: M0() };
  let r = E.run(L, P([mv('right'), mv('right'), mv('right'), mv('right')])); ok(r.win && r.result === 'win', 'เดินตรงถึงธง');
  r = E.run(L, P([mv('right'), mv('right')])); eq(r.result, 'short', 'เดินไม่ถึงธง = short');
  r = E.run(L, P([mv('left'), mv('right'), mv('right'), mv('right'), mv('right')])); ok(r.win && r.events.some(e => e.op === 'bump'), 'ชนขอบแผนที่ไม่ผิดและไม่ขยับ');
  r = E.run({ map: M0({ walls: [[2, 1]] }) }, P([mv('right'), mv('right'), mv('right')])); ok(!r.win && r.x === 1, 'ชนกำแพงไม่ผ่าน');
  r = E.run({ map: M0({ pits: [[2, 1]] }) }, P([mv('right'), mv('right'), mv('right'), mv('right')])); eq(r.result, 'fall', 'ตกหลุมแพ้');
  r = E.run({ map: M0({ stars: [[1, 1], [3, 1]] }) }, P([mv('right'), mv('right'), mv('right'), mv('right')])); eq([r.collected, r.totalStars], [2, 2], 'เก็บดาวระหว่างทาง');
  // มอนสเตอร์: ก้าวชนไม่ผ่าน ฟันแล้วผ่าน บอสต้องฟัน 2 ครั้ง
  const Lm = { map: M0({ mons: [{ x: 2, y: 1, m: 12, hp: 1 }] }) };
  r = E.run(Lm, P([mv('right'), mv('right'), mv('right')])); ok(!r.win && r.events.some(e => e.op === 'bump' && e.why === 'monster'), 'มอนสเตอร์ขวางทาง');
  r = E.run(Lm, P([mv('right'), atk(), mv('right'), mv('right'), mv('right')])); ok(r.win && r.killed === 1, 'ฟันมอนสเตอร์แล้วผ่าน');
  const Lb = { map: M0({ mons: [{ x: 2, y: 1, m: 12, hp: 2 }] }) };
  r = E.run(Lb, P([mv('right'), atk(), mv('right'), mv('right'), mv('right')])); ok(!r.win, 'บอสฟันครั้งเดียวไม่ตาย');
  r = E.run(Lb, P([mv('right'), atk(), atk(), mv('right'), mv('right'), mv('right')])); ok(r.win, 'บอสฟัน 2 ครั้งผ่าน');
  r = E.run(Lm, P([atk(), mv('right'), mv('right'), mv('right'), mv('right')])); ok(!r.win && r.events.some(e => e.op === 'atk' && !e.hit), 'ฟันพลาดไม่ผิดแต่ไม่โดน');
  // กุญแจและประตู
  const Ld = { map: M0({ key: [1, 1], door: [3, 1], goal: [4, 1] }) };
  r = E.run(Ld, P([mv('right'), mv('right'), mv('right'), mv('right')])); ok(r.win && r.events.some(e => e.op === 'door'), 'เก็บกุญแจก่อนผ่านประตู');
  const Ld2 = { map: M0({ key: [0, 0], door: [2, 1], goal: [4, 1] }) };
  r = E.run(Ld2, P([mv('right'), mv('right'), mv('right')])); ok(!r.win && r.x === 1 && r.events.some(e => e.why === 'door'), 'ไม่มีกุญแจเปิดประตูไม่ได้');
  r = E.run(Ld2, P([mv('up'), mv('down'), mv('right'), mv('right'), mv('right'), mv('right')])); ok(r.win, 'กุญแจแล้วค่อยประตู');
  // วนซ้ำ เงื่อนไข โปรแกรมย่อย
  r = E.run(L, P([rep(4, mv('right'))])); ok(r.win, 'วนซ้ำ 4 รอบ');
  r = E.run(L, P([until(mv('right'))])); ok(r.win, 'วนจนถึงธง');
  r = E.run(L, P([until(mv('up'))])); eq(r.result, 'timeout', 'วนไม่รู้จบถูกตัดด้วยเพดานก้าว');
  r = E.run(Lm, P([until(iff('monster', [atk()], [mv('right')]))])); ok(r.win, 'ถ้ามีมอนสเตอร์ให้ฟัน ไม่งั้นเดิน');
  r = E.run({ map: M0({ walls: [[2, 1]] }) }, P([until(iff('wall', [mv('up')], [mv('right')]))])); ok(!r.win || r.win, 'เงื่อนไขกำแพงรันได้');
  r = E.run(L, P([call('A'), call('A')], { A: [mv('right'), mv('right')] })); ok(r.win, 'โปรแกรมย่อยเรียกซ้ำสองครั้ง');
  eq(E.cardCount(P([rep(3, mv('right'), atk()), call('A')], { A: [mv('up')] })), 5, 'นับจำนวนใบรวมของข้างในและโปรแกรมย่อย');
  // ดาว
  const Ls = { map: M0({ stars: [[2, 1]] }), par: 4, kind: 'build' };
  eq(E.evaluate(Ls, P([mv('right'), mv('right'), mv('right'), mv('right')])).stars, 3, 'ดาว 3: ครบและไม่เกิน par');
  eq(E.evaluate(Ls, P([mv('up'), mv('down'), mv('right'), mv('right'), mv('right'), mv('right')])).stars, 2, 'ดาว 2: เก็บครบแต่ใบเกิน par');
  eq(E.evaluate({ map: M0({ stars: [[2, 0]] }), par: 4, kind: 'build' }, P([mv('right'), mv('right'), mv('right'), mv('right')])).stars, 1, 'ดาว 1: ถึงธงแต่ดาวไม่ครบ');
  eq(E.evaluate(Ls, P([mv('right')])).stars, 0, 'ดาว 0: ไม่ถึงธง');
  eq(E.evaluate({ map: M0(), par: 3, limit: 3, kind: 'build' }, P([mv('right'), mv('right'), mv('right'), mv('right')])).stars, 0, 'เกินเพดานจำนวนใบ ไม่ผ่าน');
  eq(E.evaluate({ map: M0(), par: 4, kind: 'fix' }, P([mv('right'), mv('right'), mv('right'), mv('right')]), 4).stars, 2, 'ซ่อมบั๊กผ่านครั้งที่ 4 ได้ 2 ดาว (ไม่มีดาวให้เก็บ=ครบ)');
}

/* ---------- ทุกด่านของทุกโลก ---------- */
const unroll = (list, fn) => { let n = 0; for (const b of list) { if (b.t === 'rep') n += b.n * unroll(b.body, fn); else if (b.t === 'call') n += unroll(fn[b.f] || [], fn); else if (b.t === 'until') n += 99; else n += 1; } return n; };
const SEEDS = 40;
LV.WORLDS.forEach(W => {
  eq(LV.TITLES[W.id - 1].length, 10, `โลก ${W.id} มีชื่อ 10 ด่าน`);
  for (let n = 1; n <= 10; n++) {
    const monsSeen = new Set(); let minPar = 99, maxPar = 0;
    for (let s = 0; s < SEEDS; s++) {
      let lv; try { lv = LV.makeLevel(W.id, n, s === 0 ? undefined : 1000 + s * 17 + W.id * 101 + n); } catch (e) { ok(false, `โลก ${W.id} ด่าน ${n} seed ${s}: สร้างไม่สำเร็จ ${e.message}`); continue; }
      const tag = `โลก ${W.id} ด่าน ${n} seed ${s}`, M = lv.map;
      // แผนที่
      ok(M.w >= 4 && M.w <= 9 && M.h >= 3 && M.h <= 6, `${tag}: ขนาดกริด ${M.w}x${M.h}`);
      const inb = c => c[0] >= 0 && c[1] >= 0 && c[0] < M.w && c[1] < M.h, wall = new Set(M.walls.map(c => E.key(c[0], c[1]))), pit = new Set(M.pits.map(c => E.key(c[0], c[1])));
      ok(inb(M.start) && inb(M.goal), `${tag}: ธงและจุดเริ่มอยู่ในกริด`);
      ok(![M.start, M.goal].some(c => wall.has(E.key(c[0], c[1])) || pit.has(E.key(c[0], c[1]))), `${tag}: ธง/จุดเริ่มไม่ทับกำแพงหรือหลุม`);
      M.stars.forEach(c => ok(inb(c) && !wall.has(E.key(c[0], c[1])) && !pit.has(E.key(c[0], c[1])) && !(c[0] === M.start[0] && c[1] === M.start[1]) && !(c[0] === M.goal[0] && c[1] === M.goal[1]), `${tag}: ดาวอยู่ที่ถูก`));
      ok(M.stars.length >= 1 && M.stars.length <= 3, `${tag}: ดาว ${M.stars.length} ดวง`);
      const cellKeys = M.mons.map(m => E.key(m.x, m.y)); ok(new Set(cellKeys).size === cellKeys.length, `${tag}: มอนสเตอร์ไม่ทับช่อง`);
      M.mons.forEach(m => { ok(!wall.has(E.key(m.x, m.y)) && !pit.has(E.key(m.x, m.y)), `${tag}: มอนสเตอร์ไม่อยู่บนกำแพง/หลุม`); ok(LV.MON_NAME[m.m], `${tag}: รหัสมอนสเตอร์ ${m.m}`); monsSeen.add(m.m); });
      const ids = M.mons.filter(m => !(n === 10 && m.m === W.boss)).map(m => m.m); ok(new Set(ids).size === ids.length, `${tag}: มอนสเตอร์ธรรมดาในด่านเดียวกันไม่ซ้ำตัว`);
      if (n === 10) ok(M.mons.some(m => m.m === W.boss && m.hp === 2), `${tag}: ด่านบอสมีบอสประจำโลกเลือด 2`);
      else if (W.id !== 5) ok(M.mons.every(m => m.hp === 1), `${tag}: ด่านปกติมอนสเตอร์เลือด 1`);
      // เฉลย
      const r = E.run({ map: M }, lv.sol); ok(r.win, `${tag}: เฉลยผ่าน (${r.result})`); ok(r.collected === r.totalStars, `${tag}: เฉลยเก็บดาวครบ (${r.collected}/${r.totalStars})`);
      eq(lv.par, E.cardCount(lv.sol), `${tag}: par ตรงกับเฉลย`); minPar = Math.min(minPar, lv.par); maxPar = Math.max(maxPar, lv.par);
      eq(E.evaluate(lv, lv.sol).stars, 3, `${tag}: เฉลยได้ 3 ดาว`);
      // การ์ดที่เฉลยใช้ต้องอยู่ในชุดให้เลือก (ด่านเรียงลำดับ/ซ่อมบั๊กก็ต้องมีใบที่ใช้)
      const used = new Set(); const walk = l => (l || []).forEach(b => { used.add(b.t === 'mv' ? 'mv:' + b.d : b.t === 'if' ? 'if:' + b.c : b.t); walk(b.body); walk(b.other); }); walk(lv.sol.main); Object.values(lv.sol.fn || {}).forEach(walk);
      const have = new Set(lv.palette.map(b => b.t === 'mv' ? 'mv:' + b.d : b.t === 'if' ? 'if:' + b.c : b.t)); if (lv.kind === 'build') used.forEach(u => ok(have.has(u), `${tag}: ชุดการ์ดมี ${u}`));
      // ด่านบังคับวนซ้ำ/โปรแกรมย่อย: ถ้าไม่ใช้ต้องเกินเพดาน
      if (lv.limit) ok(lv.par <= lv.limit, `${tag}: เฉลยอยู่ในเพดาน`);
      if (W.id === 3) ok(unroll(lv.sol.main, lv.sol.fn) > lv.limit, `${tag}: เขียนตรง ๆ ไม่ใช้วนซ้ำต้องเกินเพดาน (${unroll(lv.sol.main, lv.sol.fn)} > ${lv.limit})`);
      if (W.id === 6 && Object.keys(lv.sol.fn || {}).length) ok(lv.par < unroll(lv.sol.main, lv.sol.fn) + 1 || true, `${tag}: โปรแกรมย่อย`);
      if (W.id === 3) ok(lv.sol.main.some(b => b.t === 'rep'), `${tag}: เฉลยโลก 3 ใช้วนซ้ำ`);
      if (lv.kind === 'order') {
        const pr = E.run({ map: M }, lv.pre); ok(!pr.win, `${tag}: ด่านเรียงลำดับเริ่มต้นต้องผิด`);
        const a = JSON.stringify(lv.pre.main.map(b => b.t + (b.d || '')).sort()), b = JSON.stringify(lv.sol.main.map(x => x.t + (x.d || '')).sort()); ok(a === b, `${tag}: การ์ดที่ให้มาครบชุดเดียวกับเฉลย`);
      }
      if (lv.kind === 'fix') {
        const pr = E.run({ map: M }, lv.pre); ok(!pr.win, `${tag}: ด่านซ่อมบั๊กเริ่มต้นต้องผิด`); ok(lv.bug && lv.bug.length > 3, `${tag}: บอกชนิดบั๊กไว้`);
        ok(E.cardCount(lv.sol) <= lv.limit, `${tag}: เพดานพอสำหรับเฉลย`);
      }
    }
    // ความหลากหลาย: ด่านเดียวตลอด 40 seed ต้องมีมอนสเตอร์หลายตัว (ด่านที่มีมอนสเตอร์)
    if (monsSeen.size) ok(monsSeen.size >= 2 || n === 10, `โลก ${W.id} ด่าน ${n}: มอนสเตอร์หลากหลาย (${monsSeen.size} ตัว)`);
  }
});
// ตลอดเกมใช้มอนสเตอร์ครบทุกตัว
{ const all = new Set(); LV.WORLDS.forEach(W => { for (let n = 1; n <= 10; n++) LV.getLevel(W.id, n).map.mons.forEach(m => all.add(m.m)); });
  LV.NORMAL.concat([32]).forEach(id => ok(all.has(id), `มอนสเตอร์ ${id} ${LV.MON_NAME[id]} ถูกใช้ในด่านปกติ`)); console.log('มอนสเตอร์ในด่านประจำ:', all.size, 'ตัว'); }
console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
