/* ทดสอบตัวสร้างโจทย์ Techno Math: node tools/games/math/test_math.js
   ตรวจคำอ่านภาษาไทย · ทุกหัวข้อทุกระดับหลายเมล็ดสุ่ม: คำตอบถูกจริง (คำนวณซ้ำ) ช่องครบ ไม่มี undefined/NaN ไม่มีลูกศรยาว · ชุดโจทย์ไม่ซ้ำ */
const MG = require('./mathgen.js');
let pass = 0, fail = 0;
const seenF = new Set(); const ok = (c, msg) => { if (c) pass++; else { fail++; const k = String(msg).split(' ').slice(0, 2).join(' ') + String(msg).replace(/ s\d+/, '').split(' ').slice(3, 5).join(' '); if (!seenF.has(k) && seenF.size < 40) { seenF.add(k); console.log('FAIL', msg); } } };

/* ---------- คำอ่าน ---------- */
[[0, 'ศูนย์'], [1, 'หนึ่ง'], [10, 'สิบ'], [11, 'สิบเอ็ด'], [20, 'ยี่สิบ'], [21, 'ยี่สิบเอ็ด'], [99, 'เก้าสิบเก้า'], [100, 'หนึ่งร้อย'], [101, 'หนึ่งร้อยหนึ่ง'], [111, 'หนึ่งร้อยสิบเอ็ด'],
  [1001, 'หนึ่งพันหนึ่ง'], [2021, 'สองพันยี่สิบเอ็ด'], [10000, 'หนึ่งหมื่น'], [105000, 'หนึ่งแสนห้าพัน'], [1000000, 'หนึ่งล้าน'], [1000001, 'หนึ่งล้านหนึ่ง'], [2500000, 'สองล้านห้าแสน'], [21000000, 'ยี่สิบเอ็ดล้าน']]
  .forEach(([n, w]) => ok(MG.thaiWords(n) === w, 'thaiWords ' + n + ' = ' + MG.thaiWords(n)));
ok(MG.naiveWords(21) === 'สองสิบหนึ่ง', 'naive 21');
ok(MG.decWords('2.45') === 'สองจุดสี่ห้า', 'decWords');
ok(MG.thaiDigits('1,205') === '๑,๒๐๕', 'thaiDigits');
ok(MG.comma(1234567) === '1,234,567' && MG.comma('12345.67') === '12,345.67', 'comma');
ok(MG.check({ ans: '0.50', num: true }, '0.5') && MG.check({ ans: '1234' }, '1,234') && !MG.check({ ans: '12' }, '21') && MG.check({ ans: '05', num: true }, '5'), 'check');

/* ---------- คำนวณซ้ำ ---------- */
const evalExpr = s => { const e = s.replace(/,/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/'); if (!e.trim() || !/^[\d\s+\-*/().]+$/.test(e)) return null; try { return Function('return (' + e + ')')(); } catch (er) { return null; } };
const qText = (q, cells) => q.q.map(p => (typeof p === 'string' ? p : p.slot != null ? (cells[p.slot] || {}).ans : p.under || '')).join('');
const digitsOf = (cells, row) => cells.filter(c => c.row === row);
function verify(q, tag) {
  const all = JSON.stringify(q);
  ok(!/undefined|NaN|null|→|↗|←/.test(all.replace(/"(slot|fig)":null/g, '')), tag + ' bad text ' + all.slice(0, 160));
  ok(q.cells.length > 0 && q.cells.every(c => c.ans !== '' && c.ans != null && c.why), tag + ' empty cell');
  ok(q.cells.every(c => c.ask), tag + ' missing ask');
  ok(new Set(q.cells.map(c => c.id)).size === q.cells.length, tag + ' dup ids');
  if (q.mode === 'column') {
    const ints = q.pad.map(s => +s.replace('.', '')), dp = q.dp, res = q.op === '+' ? ints.reduce((a, b) => a + b, 0) : q.op === '-' ? ints[0] - ints[1] : ints[0] * ints[1];
    const got = +digitsOf(q.cells, 'res').map(c => c.ans).reverse().join('');
    ok(got === res, tag + ' column ' + q.rows + q.op + ' got ' + got + ' want ' + res);
    ok(+q.res.replace('.', '') === res && (dp === 0 || q.res.split('.')[1].length === dp), tag + ' res str ' + q.res);
    q.cells.forEach(c => ok(/^\d$/.test(c.ans), tag + ' digit ' + c.ans));
    if (q.op === '-') ok(ints[0] >= ints[1], tag + ' sub neg');
  } else if (q.mode === 'mul2') {
    const a = +q.a, b = +q.b; ok(+q.p1 === a * (b % 10) && +q.p2 === a * Math.floor(b / 10) * 10 && +q.res === a * b, tag + ' mul2 parts');
    const num = row => +digitsOf(q.cells, row).sort((x, y) => x.col - y.col).map(c => c.ans).reverse().join('');
    ok(num('p1') === +q.p1, tag + ' p1 cells'); ok(num('p2') * 10 === +q.p2, tag + ' p2 cells ' + num('p2')); ok(num('sum') === a * b, tag + ' sum cells');
    ok(Math.min(...digitsOf(q.cells, 'p2').map(c => c.col)) === 1, tag + ' p2 shift');
  } else if (q.mode === 'sdiv') {
    const n = +q.n, d = +q.d, qd = digitsOf(q.cells, 'q').map(c => c.ans).join('');
    ok(+qd === Math.floor(n / d) && qd[0] !== '0' || (Math.floor(n / d) === 0), tag + ' sdiv quot ' + qd);
    ok(q.r === n % d && (n % d === 0 ? !q.cells.some(c => c.row === 'rem') : q.cells.find(c => c.row === 'rem').ans === String(n % d)), tag + ' sdiv rem');
  } else if (q.mode === 'ldiv') {
    const n = +q.n, d = +q.d, qd = digitsOf(q.cells, 'q').map(c => c.ans).join('');
    ok(+qd === Math.floor(n / d) && (qd.length === 1 || qd[0] !== '0'), tag + ' ldiv quot ' + qd);
    // จำลองหารยาวจาก lines: ผลคูณทุกแถวต้องเป็นผลคูณของตัวหาร และแถวผลลบสุดท้ายคือเศษ
    q.lines.filter(l => l.kind === 'mul').forEach(l => ok(+l.s % d === 0 && +l.s > 0, tag + ' ldiv mul line ' + l.s));
    const lastDiff = q.lines.filter(l => l.kind === 'diff').pop(); const tail = lastDiff ? +(lastDiff.s + lastDiff.down.map(i => q.n[i]).join('') || '0') : n;
    ok(tail === n % d || (lastDiff && lastDiff.down.length && tail % d === n % d && Math.floor(tail / d) === 0), tag + ' ldiv rem tail ' + tail + ' r ' + (n % d));
    ok(q.r === n % d, tag + ' ldiv r');
    q.cells.filter(c => c.row === 'mul' || c.row === 'diff').forEach(c => { const l = q.lines[c.line]; ok(l && l.s[c.k] === c.ans, tag + ' ldiv cell ' + c.id); });
  } else if (q.mode === 'choice') {
    const ids = q.opts.map(o => o.id); ok(ids.includes(q.cells[0].ans), tag + ' choice ans in opts'); ok(new Set(ids).size === ids.length, tag + ' choice dup opts');
    if (q.cmp && q.topic !== 'fcmp') { const parts = q.q.filter(p => typeof p === 'string' && p.trim()); const a = +parts[0].replace(/,/g, ''), b = +parts[1].replace(/,/g, ''); ok((a > b ? '>' : a < b ? '<' : '=') === q.cells[0].ans, tag + ' cmp ' + a + ' ' + b); }
    if (q.topic === 'fcmp' && q.cmp) { const [f1, f2] = q.q.filter(p => p.frac).map(p => +p.frac[0] / +p.frac[1]); ok((Math.abs(f1 - f2) < 1e-9 ? '=' : f1 > f2 ? '>' : '<') === q.cells[0].ans, tag + ' fcmp'); }
  } else if (q.mode === 'shade') {
    ok(q.target >= 1 && q.target < q.fig.den, tag + ' shade target');
  } else if (q.mode === 'type') {
    const s = qText(q, q.cells), eq = s.split('=');
    if (eq.length === 2 && !q.fig && !/[ก-๙]/.test(s)) { const L = evalExpr(eq[0]), R = evalExpr(eq[1].replace('≈', '')); if (L != null && R != null) ok(Math.abs(L - R) < 1e-9, tag + ' eval ' + s); }
    const f = q.fig;
    if (f && f.kind === 'dots') ok(+q.cells[0].ans === f.n, tag + ' dots');
    if (f && f.kind === 'blocks') ok(+q.cells[0].ans === f.th * 1000 + f.h * 100 + f.t * 10 + f.o, tag + ' blocks');
    if (f && f.kind === 'coins' && q.level <= 2) ok(+q.cells[0].ans === f.items.reduce((a, b) => a + b, 0), tag + ' coins');
    if (f && f.kind === 'clock') ok(+q.cells[0].ans === f.h && +q.cells[1].ans === f.m, tag + ' clock');
    if (f && f.kind === 'ruler') ok(+q.cells[0].ans === f.len, tag + ' ruler');
    if (f && f.kind === 'frac') ok(+q.cells[0].ans === f.num && +q.cells[1].ans === f.den, tag + ' frac pic');
    if (f && (f.kind === 'pict' || f.kind === 'bars')) ok(f.vals.every(v => v % f.unit === 0 && v > 0), tag + ' chart vals');
    if (q.topic === 'feq') { const fr = q.q.filter(p => p.frac).map(p => p.frac.map(x => (typeof x === 'string' ? +x : +q.cells[x.slot].ans))); ok(fr[0][0] * fr[1][1] === fr[1][0] * fr[0][1], tag + ' feq equal'); }
    if (q.topic === 'pattern') { const nums = q.q.filter(p => p !== ' , ').map(p => (typeof p === 'string' ? +p.replace(/,/g, '') : +q.cells[p.slot].ans)); const st = nums[1] - nums[0]; ok(nums.every((v, i) => !i || v - nums[i - 1] === st) && nums.every(v => v > 0), tag + ' pattern ' + nums); }
    q.cells.forEach(c => ok(c.w >= String(c.ans).length, tag + ' slot width'));
  }
}

let total = 0;
MG.TOPICS.forEach(t => {
  ok(t.lv.length === 5 && t.tip && MG.WORLDS.some(w => w.id === t.world), 'topic meta ' + t.id);
  for (let L = 1; L <= 5; L++) for (let s = 1; s <= 120; s++) {
    const R = MG.rng(s * 7919 + L * 101 + t.id.length), q = MG.make(t.id, L, R); total++;
    try { verify(q, t.id + ' L' + L + ' s' + s); } catch (e) { ok(false, t.id + ' L' + L + ' s' + s + ' threw ' + e.message); }
  }
  for (let L = 1; L <= 5; L++) { const S = MG.set(t.id, L, 1234 + L); ok(S.length >= 3, t.id + ' set size'); }
});
// ชุดโจทย์ของด่าน: ไม่ซ้ำกันในด่าน และเมล็ดเดียวกันได้ชุดเดิม
const A = MG.set('addv', 3, 99), B = MG.set('addv', 3, 99); ok(JSON.stringify(A) === JSON.stringify(B), 'set deterministic');
ok(new Set(MG.set('times', 1, 5).map(q => JSON.stringify(q.q))).size === MG.set('times', 1, 5).length, 'set unique');
// กรณีพิเศษที่ต้องถูกแน่นอน
const c1 = MG.columnQ('t', ['503', '498'], '-'); ok(c1.res === '5' && c1.cells.length === 1, 'sub leading zeros ' + c1.res);
const c2 = MG.columnQ('t', ['4003', '1257'], '-'); ok(c2.res === '2746' && c2.marks[0].length === 4, 'borrow chain ' + JSON.stringify(c2.marks));
const c3 = MG.columnQ('t', ['12.5', '3.75'], '+'); ok(c3.res === '16.25' && c3.pad[0] === '12.50', 'dec add ' + c3.res);
const c4 = MG.columnQ('t', ['95', '17'], '+'); ok(c4.res === '112' && c4.cells.length === 3 && c4.carry[1] === 1, 'add carry top');
const c5 = MG.columnQ('t', ['407', '8'], '×'); ok(c5.res === '3256', 'mul1 ' + c5.res);
const l1 = MG.ldivQ('t', 714, 7); ok(l1.quot === '102' && l1.cells.filter(c => c.row === 'q').map(c => c.ans).join('') === '102', 'ldiv 714/7 ' + JSON.stringify(l1.lines));
const l2 = MG.ldivQ('t', 5678, 23); ok(l2.quot === '246' && l2.r === 20, 'ldiv 5678/23');
const s1 = MG.sdivQ('t', 245, 7); ok(s1.quot === '35' && s1.rem[1] === 2 && s1.rem[2] === 3, 'sdiv 245/7 ' + JSON.stringify(s1.rem));
const m1 = MG.mul2Q('t', 47, 36); ok(m1.p1 === '282' && m1.p2 === '1410' && m1.res === '1692', 'mul2 47x36');
console.log('ตรวจโจทย์ ' + total + ' ข้อ · ผ่าน ' + pass + ' · ไม่ผ่าน ' + fail);
process.exit(fail ? 1 : 0);
