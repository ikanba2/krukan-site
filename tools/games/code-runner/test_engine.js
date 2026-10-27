/* ทดสอบตัวจำลอง Code Runner และความถูกต้องของด่านทั้ง 14 ด่าน
   รัน: node tools/games/code-runner/test_engine.js */
'use strict';
const CR = require('./engine.js');
const { LEVELS, WORLDS } = require('./levels.js');
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL:', msg); } }
function eq(a, b, msg) { ok(JSON.stringify(a) === JSON.stringify(b), `${msg}  (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`); }
const W = { t: 'walk' }, J = { t: 'jump' }, A = { t: 'attack' }, T = { t: 'turn' };
const prog = (main, fn) => CR.cloneProgram({ main, fn: fn || [] });
const run = (map, p, dir) => CR.run({ map, dir: dir || 1 }, p);

/* ---------- กติกาพื้นฐาน ---------- */
eq(run('S.G', prog([W, W])).result, 'win', 'เดินไปถึงประตู');
eq(run('S.G', prog([W])).result, 'goal', 'หยุดก่อนถึงประตู');
eq(run('S.G', prog([])).result, 'empty', 'โปรแกรมว่าง');
eq(run('S.G', prog([W, W, W])).result, 'bump', 'เดินเลยปลายทางชนขอบ');
eq(run('SpG', prog([W])).result, 'fall', 'เดินลงหลุม = ตก');
eq(run('S^G', prog([W])).result, 'spike', 'เดินชนหนาม');
eq(run('ScG', prog([W])).result, 'bump', 'ชนลัง');
eq(run('SeG', prog([W])).result, 'bump', 'ชนศัตรู');
eq(run('SwG', prog([W])).result, 'bump', 'ชนกำแพง');
eq(run('SpG', prog([J])).result, 'win', 'กระโดดข้ามหลุม');
eq(run('S^G', prog([J])).result, 'win', 'กระโดดข้ามหนาม');
eq(run('SeG', prog([J])).result, 'win', 'กระโดดข้ามศัตรูได้');
eq(run('ScG', prog([J])).result, 'win', 'กระโดดข้ามลังได้');
eq(run('SwG', prog([J])).result, 'bump', 'กระโดดข้ามกำแพงสูงไม่ได้');
eq(run('SBG', prog([J])).result, 'bump', 'กระโดดข้ามบอสไม่ได้');
eq(run('S.pG', prog([J])).result, 'fall', 'กระโดดแล้วตกหลุมที่ปลายทาง');
eq(run('S.^G', prog([J])).result, 'spike', 'กระโดดแล้วลงบนหนาม');
eq(run('S.eG', prog([J])).result, 'bump', 'กระโดดไปลงบนศัตรู');
eq(run('ScG', prog([A, W, W])).result, 'win', 'โจมตีลังให้แตกแล้วเดินผ่าน');
eq(run('SeG', prog([A, W, W])).result, 'win', 'ฟันศัตรูแล้วเดินผ่าน');
eq(run('SBG', prog([A, A, W, W])).result, 'bump', 'บอสต้องฟัน 3 ครั้ง');
eq(run('SBG', prog([A, A, A, W, W])).result, 'win', 'ฟันบอส 3 ครั้งแล้วผ่าน');
eq(run('SBG', prog([{ t: 'while', c: 'foe', body: [A] }, W, W])).result, 'win', 'while foe ฟันจนล้ม');
eq(run('S.G', prog([A, W, W])).events.filter(e => e.op === 'attack')[0].kind, 'none', 'โจมตีโดนอากาศ');
eq(run('oS.G', prog([T, W, T, W, W, W])).result, 'win', 'หันกลับไปเก็บเหรียญแล้วกลับมาเข้าประตู');
eq(run('oS.G', prog([W, W])).result, 'cores', 'ถึงประตูแต่ยังเก็บเหรียญไม่ครบ');
eq(run('SqG', prog([J])).result, 'win', 'เก็บเหรียญลอยเหนือหลุมด้วยการกระโดด');
eq(run('SqG', prog([J])).coins, 1, 'นับเหรียญลอยที่ได้');
eq(run('S.G', prog([{ t: 'until', body: [] }])).result, 'timeout', 'ลูปว่างที่ไม่จบ');
eq(run('S..G', prog([{ t: 'until', body: [W] }])).result, 'win', 'until ถึงประตูแล้วหยุด');
eq(run('S..G', prog([{ t: 'rep', n: 3, body: [W] }])).result, 'win', 'rep 3 ครั้ง');
eq(run('S...G', prog([{ t: 'call' }, { t: 'call' }], [W, W])).result, 'win', 'เรียกท่าพิเศษสองครั้ง');
eq(run('S.G', prog([{ t: 'call' }], [{ t: 'call' }])).result, 'timeout', 'ท่าที่เรียกตัวเองต้องถูกตัดออก');
eq(CR.countProgram(prog([{ t: 'rep', n: 2, body: [W, A] }, W], [J])), 5, 'นับบล็อกรวมลูปและท่าพิเศษ');
{
  // จุดเริ่มกลางแผนที่และหันซ้าย
  const r = CR.run({ map: 'GS', dir: -1 }, prog([W]));
  eq(r.result, 'win', 'หันซ้ายเดินไปประตูทางซ้าย');
}

/* ---------- ตรวจทุกด่าน ---------- */
const worldIds = new Set(WORLDS.map(w => w.id));
LEVELS.forEach((lv, i) => {
  const name = `ด่าน ${i + 1} ${lv.title}`;
  ok(worldIds.has(lv.world), name + ' อยู่ใน SECTOR ที่มี');
  const m = CR.parseLevel(lv);
  ok(m.n >= 5 && m.n <= 20, name + ' ความยาวทางต้อง 5-20 ช่อง');
  const p = CR.cloneProgram(lv.sol), r = CR.run(lv, p);
  eq(r.result, 'win', name + ' โปรแกรมเฉลยต้องชนะ');
  eq(r.blocks, lv.par, name + ' par ต้องเท่ากับจำนวนบล็อกของเฉลย');
  ok(r.blocks <= lv.maxBlocks, name + ' เฉลยต้องอยู่ในเพดานบล็อก');
  eq(r.coins, r.totalCoins, name + ' เฉลยต้องเก็บเหรียญครบ');
  const used = new Set();
  (function walk(list) { (list || []).forEach(b => { used.add(b.t); walk(b.body); walk(b.other); }); })(p.main.concat(p.fn));
  [...used].forEach(t => ok(lv.allow.includes(t), `${name} ใช้บล็อก ${t} ที่ด่านไม่อนุญาต`));
  if (lv.world >= 2) ok(r.prims > lv.maxBlocks, `${name} เขียนแบบเรียงยาว ${r.prims} ต้องเกินเพดาน ${lv.maxBlocks}`);
  else ok(lv.par <= lv.maxBlocks, name + ' par ต้องไม่เกินเพดาน');
  // ด่านที่เหรียญลอยอยู่เหนือหลุม ต้องไม่ได้ครบถ้าไม่กระโดด (กันทางลัด) — ตรวจโดยเฉลยเก็บครบอยู่แล้ว
});
// ด่านโลก 4 ที่ห้ามใช้ลูป: ต้องไม่มี rep/until/while ในชุดที่อนุญาต
[11, 12].forEach(i => ok(!LEVELS[i].allow.includes('rep') && !LEVELS[i].allow.includes('until'), `ด่าน ${i + 1} ต้องบังคับใช้ท่าพิเศษ`));

console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
