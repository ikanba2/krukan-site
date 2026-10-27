/* ทดสอบตัวสร้างโจทย์ MK ด้วย Node: node tools/games/mathkit/test_mk.js */
const MK = require('./mk-gen.js');
let seed = 12345; const R = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
let fails = 0; const fail = (m, q) => { fails++; if (fails < 25) console.log('FAIL', m, JSON.stringify(q)); };
const N = 3000;
const optsOk = (q, name) => { if (!q.opts) return; if (q.opts.indexOf(q.ans) < 0) fail(name + ' ไม่มีเฉลยในตัวเลือก', q); if (new Set(q.opts).size !== q.opts.length) fail(name + ' ตัวเลือกซ้ำ', q); };
for (let i = 0; i < N; i++) {
  const cfgs = [{ op: '+', lo: 1, hi: 5, max: 10 }, { op: '-', lo: 1, hi: 10 }, { op: 'mix', lo: 0, hi: 20, max: 20, form: 'mix' }, { op: '+', lo: 10, hi: 99, max: 99, carry: true }, { op: '-', lo: 10, hi: 99, carry: true }, { op: '+', lo: 10, hi: 99, max: 99, carry: false }, { op: '-', lo: 10, hi: 99, carry: false, form: 'b' }, { op: 'mix', lo: 100, hi: 999, max: 999, form: 'a' }];
  cfgs.forEach(c => {
    const q = MK.addsub(R, c); const calc = q.op === '+' ? q.a + q.b : q.a - q.b;
    if (calc !== q.c) fail('addsub ผลไม่ตรง', q); if (q.c < 0 || q.b < 0 || q.a < 0) fail('addsub ติดลบ', q);
    const want = q.form === 'res' ? q.c : q.form === 'b' ? q.b : q.a; if (q.ans !== want) fail('ans ไม่ตรงช่องว่าง', q);
    if (c.carry === true && !q.hasCarry) fail('ต้องทดแต่ไม่ทด', q); if (c.carry === false && q.hasCarry) fail('ห้ามทดแต่ทด', q); if (q.c > (c.max || 99) && q.op === '+') fail('เกินค่าสูงสุด', q); optsOk(q, 'addsub');
  });
  [['+', 1, 1, 'none'], ['+', 2, 2, 'none'], ['+', 2, 2, 'some'], ['+', 3, 3, 'chain'], ['-', 2, 1, 'none'], ['-', 2, 2, 'some'], ['-', 3, 3, 'chain'], ['-', 4, 3, 'any'], ['+', 4, 4, 'any']].forEach(c => {
    const q = MK.column(R, { op: c[0], d1: c[1], d2: c[2], carry: c[3] }); const calc = c[0] === '+' ? q.a + q.b : q.a - q.b; if (calc !== q.ans) fail('column ผลไม่ตรง', q);
    const digits = q.steps.map(s => s.digit).reverse().join(''); if (+digits !== q.ans && !(q.ans < Math.pow(10, q.steps.length - 1))) fail('column หลักไม่ตรง ' + digits, q);
    if (c[3] === 'none' && q.steps.some(s => s.mark)) fail('column none แต่มีทด', q); if (c[3] === 'chain' && q.steps.filter(s => s.mark).length < 2) fail('column chain น้อยไป', q);
    if (c[0] === '-' && q.a < q.b) fail('column ลบแล้วติดลบ', q);
  });
  let q = MK.sortQ(R, { n: 5, lo: 1, hi: 99, dir: 'mix' }); if (q.sorted.length !== 5 || new Set(q.nums).size !== 5) fail('sort', q);
  q = MK.sortQ(R, { n: 4, lo: 100, hi: 999, close: true }); if (new Set(q.nums.map(x => Math.floor(x / 100))).size !== 1 || new Set(q.nums).size !== q.nums.length) fail('sort close', q);
  q = MK.cmpQ(R, { lo: 1, hi: 20 }); if (q.ans !== (q.a > q.b ? '>' : q.a < q.b ? '<' : '=')) fail('cmp', q);
  q = MK.cmpQ(R, { lo: 1, hi: 20, mode: 'which', near: true }); if (q.a === q.b || q.ans !== Math.max(q.a, q.b)) fail('cmp which', q);
  q = MK.maxminQ(R, { n: 4, lo: 1, hi: 99 }); optsOk(q, 'maxmin'); if (new Set(q.opts).size !== 4) fail('maxmin', q);
  q = MK.maxminQ(R, { n: 4, lo: 100, hi: 999, close: true }); if (new Set(q.opts.map(x => Math.floor(x / 100))).size > 1) fail('maxmin close', q);
  [1, 10, 100].forEach(st => { q = MK.neighborQ(R, { lo: st === 100 ? 200 : 2, hi: st === 100 ? 900 : 50, step: st }); optsOk(q, 'neighbor'); if (q.ans !== (q.side === 'after' ? q.n + st : q.n - st)) fail('neighbor', q); if (q.ans < 0) fail('neighbor neg', q); });
  [1, 2, 5, 10, 100].forEach(st => { q = MK.missingQ(R, { len: 5, lo: 0, hi: st === 100 ? 1000 : 100, step: st, dir: 'mix' }); optsOk(q, 'missing'); if (q.full[q.hole] !== q.ans) fail('missing', q); const d = q.full[1] - q.full[0]; if (Math.abs(d) !== st) fail('missing step', q); if (Math.min.apply(null, q.full) < 0) fail('missing neg', q); });
  [2, 3, 5, 10].forEach(st => { q = MK.skipQ(R, { step: st, hi: 100, dir: 'mix' }); optsOk(q, 'skip'); const all = q.seq.concat([q.ans]); for (let k = 1; k < all.length; k++) if (Math.abs(all[k] - all[k - 1]) !== st) fail('skip step', q); if (Math.min.apply(null, all) < 0) fail('skip neg', q); });
  q = MK.betweenQ(R, { lo: 1, hi: 99, gap: 10 }); optsOk(q, 'between'); if (!(q.ans > q.a && q.ans < q.b)) fail('between', q); if (q.opts.filter(v => v > q.a && v < q.b).length !== 1) fail('between หลายเฉลย', q);
  q = MK.placeQ(R, { digits: 3, mode: 'mix' }); optsOk(q, 'place');
  q = MK.bondQ(R, { target: 10 }); optsOk(q, 'bond'); if (q.a + q.ans !== 10) fail('bond', q);
  q = MK.bondQ(R, { target: 100 }); optsOk(q, 'bond100'); if (q.a + q.ans !== 100) fail('bond100', q);
  q = MK.story(R, { op: 'mix', lo: 1, hi: 20, max: 30 }); optsOk(q, 'story');
}
// โรมัน: แปลงไป-กลับครบ 1..3999
for (let n = 1; n <= 3999; n++) { const r = MK.toRoman(n); if (MK.fromRoman(r) !== n) fail('roman roundtrip ' + n, r); if (!MK.validRoman(r)) fail('roman valid ' + n, r); }
['IIII', 'VV', 'VX', 'IL', 'IC', 'XXXX', 'LL', 'IXI', 'VIV', 'DD', 'IM'].forEach(w => { if (MK.validRoman(w)) fail('ควรผิดกติกา ' + w, w); });
const known = { 4: 'IV', 9: 'IX', 14: 'XIV', 40: 'XL', 90: 'XC', 400: 'CD', 1994: 'MCMXCIV', 2026: 'MMXXVI', 3999: 'MMMCMXCIX' }; Object.keys(known).forEach(k => { if (MK.toRoman(+k) !== known[k]) fail('roman known ' + k, MK.toRoman(+k)); });
for (let i = 0; i < N; i++) {
  ['r2n', 'n2r', 'build', 'sym', 'symrev', 'rule', 'fix', 'arith', 'clock', 'year'].forEach(m => {
    const q = MK.romanQ(R, { mode: m, lo: m === 'year' ? 1900 : 1, hi: m === 'year' ? 2100 : (i % 2 ? 399 : 20), syms: 4 + (i % 4), minus: true, tiles: 3 + (i % 5) });
    optsOk(q, 'roman ' + m); if (q.kind === 'r2n' && MK.fromRoman(q.roman) !== q.ans) fail('r2n', q); if (q.kind === 'n2r' && MK.fromRoman(q.ans) !== q.n) fail('n2r', q);
    if (q.kind === 'arith') { const v = MK.fromRoman(q.a) + (q.plus ? 1 : -1) * MK.fromRoman(q.b); if (v !== MK.fromRoman(q.ans) || v < 1) fail('arith', q); }
    if (q.kind === 'fix' && MK.validRoman(q.ans)) fail('fix เฉลยต้องผิดกติกา', q); if (q.kind === 'fix') q.opts.filter(o => o !== q.ans).forEach(o => { if (!MK.validRoman(o)) fail('fix ตัวเลือกควรถูก ' + o, q); });
    if (q.kind === 'clock' && q.opts.length !== 4) fail('clock opts ' + q.opts.length, q);
    if (q.kind === 'rule') { const p = q.roman; const v = MK.fromRoman(p), s = p.split('').reduce((t, c) => t + MK.RS[c], 0); if ((q.rule === 'add') !== (v === s)) fail('rule', q); }
  });
}
// กระดาน
for (let i = 0; i < 500; i++) {
  [[5, 4, 2, 2], [5, 6, 3, 3], [6, 8, 5, 5], [10, 10, 8, 8]].forEach(c => { const b = MK.board(R, { cols: c[0], rows: c[1], snakes: c[2], ladders: c[3] });
    const ends = Object.keys(b.snakes).concat(Object.keys(b.ladders)).concat(Object.values(b.snakes)).concat(Object.values(b.ladders)).map(Number); if (new Set(ends).size !== ends.length) fail('board ทับกัน', b);
    Object.keys(b.snakes).forEach(a => { if (b.snakes[a] >= +a) fail('งูต้องลง', b); }); Object.keys(b.ladders).forEach(a => { if (b.ladders[a] <= +a) fail('บันไดต้องขึ้น', b); });
    if (ends.some(e => e < 2 || e > b.n - 1)) fail('board ขอบ', b); if (Object.keys(b.snakes).length < c[2] - 1 || Object.keys(b.ladders).length < c[3] - 1) fail('board จำนวนไม่ครบ', [b, c]); });
}
console.log(fails ? 'ล้มเหลว ' + fails + ' รายการ' : 'ผ่านทั้งหมด (โจทย์สุ่ม ' + N + ' รอบ × ทุกชนิด + โรมัน 1–3999 + กระดาน)');
process.exit(fails ? 1 : 0);
