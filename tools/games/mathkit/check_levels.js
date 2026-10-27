/* ตรวจข้อมูลด่านของเกมคณิตด้วย Node: ทุกด่านสร้างโจทย์ได้ ตัวเลือกถูกต้อง ไม่ซ้ำ ไม่เกินช่วง
   ใช้: node tools/games/mathkit/check_levels.js <โฟลเดอร์เกม> เช่น sortnum roman (อ่าน <โฟลเดอร์>/levels.js ส่งออก WORLDS) */
const MK = require('./mk-gen.js'), dir = process.argv[2], { WORLDS } = require('../' + dir + '/levels.js');
let seed = 777; const R = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; let bad = 0, n = 0;
const say = (...a) => { if (bad++ < 30) console.log(...a); };
WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => {
  const kinds = L.p.kinds || [L.p.q]; if (!L.th || !L.d || !L.p || !kinds.length) say('ข้อมูลไม่ครบ', wi, li);
  if ((li === W.levels.length - 1) !== L.boss) say('บอสต้องเป็นด่านสุดท้าย', wi, li);
  if (W.levels.length !== 6) say('โลกต้องมี 6 ด่าน', wi);
  if (L.p.cols) for (let t = 0; t < 200; t++) { const b = MK.board(R, L.p), ns = Object.keys(b.snakes).length, nl = Object.keys(b.ladders).length; if (ns < L.p.snakes - 1 || nl < L.p.ladders - 1) say('กระดานงู/บันไดไม่ครบ', wi, li, ns, nl, JSON.stringify(L.p)); }
  for (let t = 0; t < 400; t++) kinds.forEach(k => {
    if (!MK.make) return; let q; try { q = MK.make(R, k); } catch (e) { say('สร้างโจทย์ไม่ได้', wi, li, JSON.stringify(k), e.message); return; } n++;
    if (q.opts && q.opts.indexOf(q.ans) < 0) say('ไม่มีเฉลยในตัวเลือก', wi, li, JSON.stringify(q));
    if (q.opts && new Set(q.opts).size !== q.opts.length) say('ตัวเลือกซ้ำ', wi, li, JSON.stringify(q));
    if (q.kind === 'sort' && (new Set(q.nums).size !== q.nums.length || q.nums.length !== k.n)) say('sort จำนวนไม่ตรง', wi, li, JSON.stringify(q));
    if (q.kind === 'column') { const calc = q.op === '+' ? q.a + q.b : q.a - q.b; if (calc !== q.ans) say('column ผลไม่ตรง', wi, li, JSON.stringify(q)); const nC = q.steps.filter(x => x.mark).length; if (k.carry === 'none' && nC) say('ห้ามทดแต่มีทด', wi, li, JSON.stringify(q)); if (k.carry === 'some' && (nC < 1 || nC > 2)) say('some ไม่ตรง', wi, li, JSON.stringify(q)); if (k.carry === 'chain' && nC < 2) say('chain ไม่ตรง', wi, li, JSON.stringify(q)); if (k.carry === 'any' && !nC) say('any ไม่ตรง', wi, li, JSON.stringify(q)); if (String(q.a).length !== k.d1 || String(q.b).length > k.d2 || (q.op === '+' && String(q.b).length !== k.d2 && q.b < Math.pow(10, k.d2 - 1))) say('จำนวนหลักไม่ตรง', wi, li, JSON.stringify(q)); }
    if ((q.kind === 'addsub' || q.kind === 'story') && k.carry === true && !q.hasCarry) say('ต้องทด/ยืม', wi, li, JSON.stringify(q)); if ((q.kind === 'addsub' || q.kind === 'story') && q.op === '+' && q.c > k.max) say('เกินค่าสูงสุด', wi, li, JSON.stringify(q));
    if (q.kind === 'build') { const r = MK.toRoman(q.n); if (r.split('').some(c => q.tiles.indexOf(c) < 0)) say('แผ่นตัวอักษรไม่พอ', wi, li, JSON.stringify(q)); if (q.n < k.lo || q.n > k.hi) say('ช่วงเลขโรมันเกิน', wi, li, JSON.stringify(q)); }
    if ((q.kind === 'r2n' || q.kind === 'n2r') && (q.n < k.lo || q.n > k.hi)) say('ช่วงเลขเกิน', wi, li, JSON.stringify(q));
    if (q.kind === 'arith' && MK.fromRoman(q.ans) > k.hi) say('ผลเกินช่วง', wi, li, JSON.stringify(q));
  });
}));
console.log(bad ? 'ล้มเหลว ' + bad : 'ผ่าน ' + dir + ': ' + WORLDS.length + ' โลก ' + WORLDS.reduce((s, w) => s + w.levels.length, 0) + ' ด่าน โจทย์ ' + n + ' ข้อ'); process.exit(bad ? 1 : 0);
