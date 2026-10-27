/* ทดสอบตรรกะเขาวงกต โปรแกรมเฉลยทุกด่าน และแผนที่สนามวิ่ง รัน: node tools/games/grid/test_engine.js */
'use strict';
const GR = require('./engine.js');
const { LEVELS, WORLDS, ARCADE } = require('./levels.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);
const P = (...main) => GR.cloneProgram({ main, fn: [] });
const prog = (main, fn) => GR.cloneProgram({ main, fn: fn || [] });
const lv = (map, extra) => Object.assign({ map }, extra);

// พื้นฐาน: เดินตามทิศสัมบูรณ์
let r = GR.run(lv(['S.G']), P({ t: 'e' }, { t: 'e' }));
eq(r.result, 'win', 'เดินตรงถึงประตู');
r = GR.run(lv(['S.G']), P({ t: 'e' }));
eq(r.result, 'goal', 'หยุดก่อนถึงประตู');
r = GR.run(lv(['S.G']), P({ t: 'w' }));
eq(r.result, 'void', 'เดินออกนอกขอบตกลงไป');
r = GR.run(lv(['S#G']), P({ t: 'e' }));
eq(r.result, 'bump', 'ชนกำแพง');
r = GR.run(lv(['S~G']), P({ t: 'e' }));
eq(r.result, 'water', 'ตกน้ำ');
r = GR.run(lv(['S^G']), P({ t: 'e' }));
eq(r.result, 'spike', 'โดนหนาม');
r = GR.run(lv(['SoG']), P({ t: 'e' }, { t: 'e' }));
eq(r.result, 'win', 'เก็บแกนครบแล้วถึงประตู');
r = GR.run(lv(['S.G', '.o.']), P({ t: 'e' }, { t: 'e' }));
eq(r.result, 'gems', 'ถึงประตูแต่เก็บแกนไม่ครบ');
r = GR.run(lv(['S.G']), P());
eq(r.result, 'empty', 'โปรแกรมว่าง');

// คำสั่งสัมพัทธ์
r = GR.run(lv(['S.', ' G']), P({ t: 'fwd' }, { t: 'tr' }, { t: 'fwd' }));
eq(r.result, 'win', 'เดินหน้า เลี้ยวขวา เดินหน้า');
r = GR.run(lv(['S.', ' G']), P({ t: 'fwd' }, { t: 'tl' }, { t: 'fwd' }));
eq(r.result, 'void', 'เลี้ยวซ้ายแล้วเดินออกขอบ');
r = GR.run(lv(['S.', ' G'], { dir: 2 }), P({ t: 'tl' }, { t: 'fwd' }, { t: 'tr' }, { t: 'fwd' }));
eq(r.result, 'win', 'ตัวเริ่มหันใต้ เลี้ยวซ้ายเป็นหันตะวันออก');

// ศัตรูและลัง
r = GR.run(lv(['SeG']), P({ t: 'e' }));
eq(r.result, 'bump', 'ชนศัตรู');
r = GR.run(lv(['SeG']), P({ t: 'atk' }, { t: 'e' }, { t: 'e' }));
eq(r.result, 'win', 'โจมตีศัตรูแล้วเดินผ่านได้');
r = GR.run(lv(['SBG']), P({ t: 'atk' }, { t: 'atk' }, { t: 'e' }, { t: 'e' }));
eq(r.result, 'bump', 'บอสต้องโจมตี 3 ครั้ง');
r = GR.run(lv(['SBG']), P({ t: 'atk' }, { t: 'atk' }, { t: 'atk' }, { t: 'e' }, { t: 'e' }));
eq(r.result, 'win', 'โจมตีบอส 3 ครั้งแล้วผ่านได้');
r = GR.run(lv(['ScG']), P({ t: 'atk' }, { t: 'e' }, { t: 'e' }));
eq(r.result, 'win', 'ลังแตกแล้วเดินผ่านได้');

// ลูปและเงื่อนไข
r = GR.run(lv(['S...G']), P({ t: 'rep', n: 4, body: [{ t: 'e' }] }));
eq(r.result, 'win', 'ทำซ้ำเดินขวา 4 รอบ');
r = GR.run(lv(['S...G']), P({ t: 'until', body: [{ t: 'fwd' }] }));
eq(r.result, 'win', 'จนถึงประตู เดินหน้า');
r = GR.run(lv(['S...G']), P({ t: 'until', body: [{ t: 'tl' }] }));
eq(r.result, 'timeout', 'ลูปไม่รู้จบถูกตัดด้วย timeout');
r = GR.run(lv(['S.G']), P({ t: 'ifelse', c: 'ahead', body: [{ t: 'e' }, { t: 'e' }], other: [{ t: 'tr' }] }));
eq(r.result, 'win', 'ถ้าข้างหน้าโล่งเดิน');
r = GR.run(lv(['S.G']), P({ t: 'ifelse', c: 'left', body: [{ t: 'e' }], other: [{ t: 'e' }, { t: 'e' }] }));
eq(r.result, 'win', 'ซ้ายไม่โล่งจึงไปกิ่ง else');
r = GR.run(lv(['S.G']), prog([{ t: 'call' }], [{ t: 'e' }, { t: 'e' }]));
eq(r.result, 'win', 'เรียกท่า A');
r = GR.run(lv(['S.G']), prog([{ t: 'call' }], [{ t: 'call' }]));
eq(r.result, 'timeout', 'ท่า A เรียกตัวเองจนลึกเกิน');

// ด่านทั้งหมด: โครงสร้างและเฉลย
const wids = new Set(WORLDS.map(w => w.id));
eq(LEVELS.length, 16, 'มี 16 ด่าน');
LEVELS.forEach((L, i) => {
  const tag = `ด่าน ${i + 1} ${L.title}`;
  ok(wids.has(L.world), tag + ': world ถูกต้อง');
  ['title', 'story', 'hint', 'learn'].forEach(k => ok(typeof L[k] === 'string' && L[k].length > 3, tag + ': มี ' + k));
  ok(!/[→↗←↘]/.test(L.story + L.hint + L.learn), tag + ': ไม่มีลูกศรยาวในข้อความ');
  const m = GR.parseMap(L);
  ok(m.cells.length > 0 && m.start && m.goal, tag + ': มีจุดเริ่มและประตู');
  ok(L.map.some(row => row.includes('S')) && L.map.some(row => row.includes('G')), tag + ': มี S และ G');
  const res = GR.run(L, GR.cloneProgram(L.sol));
  eq(res.result, 'win', tag + ': เฉลยชนะ');
  eq(res.blocks, L.par, tag + ': par ตรงกับจำนวนบล็อกของเฉลย');
  ok(L.par <= L.maxBlocks, tag + ': par ไม่เกินเพดาน');
  // บล็อกในเฉลยต้องอยู่ในรายการที่อนุญาต
  const used = new Set(); (function walk(l) { (l || []).forEach(b => { used.add(b.t); walk(b.body); walk(b.other); }); })(L.sol.main.concat(L.sol.fn || []));
  used.forEach(t => ok(L.allow.includes(t) || (t === 'call' && L.allow.includes('call')), tag + ': เฉลยใช้บล็อกที่ไม่อนุญาต ' + t));
  // ไม่ต้องมีลูป/ท่าก็ผ่านได้ในด่านที่ต้องบังคับใช้แนวคิดนั้น: ความยาวถ้าคลี่ออกต้องเกินเพดาน
  if (L.world >= 2 && (L.allow.includes('rep') || L.allow.includes('call'))) {
    const steps = res.events.filter(e => ['move', 'turn', 'attack'].includes(e.op)).length;
    ok(steps > L.maxBlocks, tag + `: คลี่โปรแกรม (${steps} ก้าว) ต้องเกินเพดาน ${L.maxBlocks} จึงต้องใช้ลูป/ท่า`);
  }
});
// เฉลยในโลกเงื่อนไขต้องใช้ได้กับเงื่อนไข และเลือกผิดต้องไม่ผ่าน
{
  const L = LEVELS[8];
  const bad = GR.run(L, P({ t: 'until', body: [{ t: 'ifelse', c: 'ahead', body: [{ t: 'fwd' }], other: [{ t: 'tl' }] }] }));
  ok(bad.result !== 'win', 'เลี้ยวซ้ายผิดทางในด่านเลี้ยวขวาต้องไม่ผ่าน');
}

// สนามวิ่ง: แผนที่ต่อเนื่อง ครบองค์ประกอบ
eq(ARCADE.length, 4, 'มีสนามวิ่ง 4 สนาม');
ARCADE.forEach((A, i) => {
  const tag = `สนามวิ่ง SECTOR ${i + 1}`;
  const m = GR.parseMap(A);
  eq(A.map.length, 9, tag + ': 9 แถว'); A.map.forEach((r, y) => eq(r.length, 13, tag + ': แถว ' + y + ' กว้าง 13'));
  ok(m.gems.length >= 8 && m.gems.length <= 24, tag + ': จำนวนแกนพลังงาน ' + m.gems.length);
  ok(m.monsters.length >= 2, tag + ': มีมอนสเตอร์อย่างน้อย 2 ตัว');
  eq(A.ai.length, m.monsters.length, tag + ': ai ตรงกับจำนวนมอนสเตอร์');
  ok(m.powers.length >= 1, tag + ': มีพลังพิเศษ');
  const d = GR.distances(m, m.start.x, m.start.y);
  ok(d[m.goal.y][m.goal.x] > 0, tag + ': ไปถึงประตูได้');
  m.gems.forEach((g, k) => ok(d[g.y][g.x] >= 0, tag + ': เก็บแกนที่ ' + k + ' ได้'));
  m.monsters.forEach((g, k) => ok(d[g.y][g.x] >= 0, tag + ': มอนสเตอร์ ' + k + ' อยู่ในเขาวงกตที่ต่อกัน'));
  m.powers.forEach((g, k) => ok(d[g.y][g.x] >= 0, tag + ': พลังพิเศษ ' + k + ' ไปถึงได้'));
  // ช่องเปิดทุกช่องเชื่อมกัน
  let openN = 0, reach = 0; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (GR.openCell(m, x, y)) { openN++; if (d[y][x] >= 0) reach++; }
  eq(reach, openN, tag + ': ทุกช่องเดินถึงกัน');
  // stepToward ไม่ติดค้าง
  const k = GR.stepToward(m, m.monsters[0].x, m.monsters[0].y, m.start.x, m.start.y, null);
  ok(k >= 0, tag + ': มอนสเตอร์หาทางไปหาผู้เล่นได้');
  ok(A.hero > A.speed, tag + ': ผู้เล่นเร็วกว่ามอนสเตอร์');
});

console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
