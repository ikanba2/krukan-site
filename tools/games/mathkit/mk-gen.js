/* ===== MK: ตัวสร้างโจทย์กลางของ 5 เกมคณิต (บันไดงู · เรียงลำดับ · แนวตั้ง · เลขโรมัน · นักล่าพลังบวก) =====
   ตรรกะล้วน ไม่แตะหน้าจอ ใช้ทั้งในเกม (window.MK) และทดสอบด้วย Node (node tools/games/mathkit/test_mk.js)
   ทุกฟังก์ชันรับ R = ตัวสุ่มแบบมีเมล็ด (K.rng) แล้วคืนโจทย์เป็น object ธรรมดา */
(function (root) {
  'use strict';
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (R, a) => a[Math.floor(R() * a.length)];
  const shuf = (R, a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = x[i]; x[i] = x[j]; x[j] = t; } return x; };
  const uniq = a => a.filter((v, i) => a.indexOf(v) === i);

  /* ---------- คำอ่านไทย (ใช้ให้เสียงพูดอ่านโจทย์) ---------- */
  const W_DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'], W_POS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  function words(n) {
    n = Math.floor(n); if (n < 0) return 'ลบ' + words(-n); if (n === 0) return 'ศูนย์';
    if (n >= 1000000) return words(Math.floor(n / 1000000)) + 'ล้าน' + (n % 1000000 ? words(n % 1000000) : '');
    const ds = String(n).split('').map(Number), L = ds.length; let out = '';
    ds.forEach((d, i) => {
      const pos = L - 1 - i; if (d === 0) return;
      if (pos === 1) out += (d === 1 ? '' : d === 2 ? 'ยี่' : W_DIG[d]) + 'สิบ';
      else if (pos === 0) out += (d === 1 && L > 1 && ds[L - 2] !== 0 ? 'เอ็ด' : W_DIG[d]);
      else out += W_DIG[d] + W_POS[pos];
    });
    return out;
  }
  const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  /* ---------- ตัวเลือกลวง: ใกล้เคียงคำตอบแต่ไม่ซ้ำ ---------- */
  function distract(R, ans, n, o) {
    o = o || {}; const lo = o.lo == null ? 0 : o.lo, hi = o.hi == null ? Infinity : o.hi, spread = o.spread || Math.max(3, Math.round(Math.abs(ans) * 0.15));
    const pool = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans + spread, ans - spread].concat(o.extra || []);
    if (ans >= 10 && ans <= 99) { const t = Math.floor(ans / 10), u = ans % 10; if (t !== u) pool.push(u * 10 + t); }
    const seen = { [ans]: 1 }, out = [];
    shuf(R, pool).forEach(v => { if (out.length < n - 1 && v >= lo && v <= hi && !seen[v]) { seen[v] = 1; out.push(v); } });
    let g = 0; while (out.length < n - 1 && g++ < 60) { const v = ans + ri(R, -spread - 3, spread + 3); if (v >= lo && v <= hi && !seen[v]) { seen[v] = 1; out.push(v); } }
    g = 0; while (out.length < n - 1 && g++ < 60) { const v = ans + ri(R, -spread - 6, spread + 6); if (v >= 0 && !seen[v]) { seen[v] = 1; out.push(v); } }   // ช่วงแคบเกินไป: ขยายออกเล็กน้อย
    return shuf(R, out.concat([ans]));
  }

  /* ---------- บวกลบ ----------
     o: { op: '+' | '-' | 'mix', lo, hi (ช่วงตัวตั้ง/ตัวบวก), max (ผลรวมสูงสุด), carry: true|false|null (ต้องทด/ไม่ทด/ไม่สน), form: 'res' | 'b' | 'a' (ช่องว่างอยู่ที่ผลลัพธ์/ตัวหลัง/ตัวหน้า) } */
  function addsub(R, o) {
    o = Object.assign({ op: '+', lo: 1, hi: 10, max: 99, carry: null, form: 'res', opts: 4 }, o);
    for (let tries = 0; tries < 300; tries++) {
      const op = o.op === 'mix' ? pick(R, ['+', '-']) : o.op; let a, b, c; const rv = (x, y) => (o.step10 ? ri(R, Math.ceil(x / 10), Math.floor(y / 10)) * 10 : ri(R, x, y));   // step10: ใช้เฉพาะเลขเต็มสิบ
      if (op === '+') { a = rv(o.lo, o.hi); b = rv(o.lo, o.hi); c = a + b; if (c > o.max) continue; if (o.carry === true && !hasCarry(a, b)) continue; if (o.carry === false && hasCarry(a, b)) continue; }
      else { c = rv(o.lo, o.hi); b = rv(o.lo > 0 ? Math.min(o.lo, c) : 0, Math.min(c, o.hi)); a = c; c = a - b; if (a - b < 0) continue; if (o.carry === true && !hasBorrow(a, b)) continue; if (o.carry === false && hasBorrow(a, b)) continue; if (o.noZero && (b === 0 || c === 0)) continue; }
      if (o.noZero && (a === 0 || b === 0)) continue;
      const form = o.form === 'mix' ? pick(R, ['res', 'res', 'b', 'a']) : o.form; return mkAddSub(R, op, a, b, c, form, o);
    }
    return mkAddSub(R, '+', 3, 4, 7, 'res', o);
  }
  function hasCarry(a, b) { while (a > 0 || b > 0) { if ((a % 10) + (b % 10) >= 10) return true; a = Math.floor(a / 10); b = Math.floor(b / 10); } return false; }
  function hasBorrow(a, b) { while (a > 0 || b > 0) { if ((a % 10) < (b % 10)) return true; a = Math.floor(a / 10); b = Math.floor(b / 10); } return false; }
  function mkAddSub(R, op, a, b, c, form, o) {
    const sym = op === '+' ? '+' : '−', say = op === '+' ? 'บวก' : 'ลบ'; let ans, text, spoken;
    if (form === 'res') { ans = c; text = a + ' ' + sym + ' ' + b + ' = ?'; spoken = words(a) + say + words(b) + 'เท่ากับเท่าไร'; }
    else if (form === 'b') { ans = b; text = a + ' ' + sym + ' ? = ' + c; spoken = words(a) + say + 'อะไร เท่ากับ' + words(c); }
    else { ans = a; text = '? ' + sym + ' ' + b + ' = ' + c; spoken = 'อะไร' + say + words(b) + 'เท่ากับ' + words(c); }
    const q = { kind: 'addsub', op, a, b, c, form, ans, text, spoken, hasCarry: op === '+' ? hasCarry(a, b) : hasBorrow(a, b) };
    q.opts = distract(R, ans, o.opts || 4, { lo: 0, hi: o.max, extra: form === 'res' ? [op === '+' ? Math.abs(a - b) : a + b] : [] }); return q;
  }

  /* ---------- โจทย์ปัญหา (เรื่องสั้น) ---------- */
  const STORY = {
    '+': [['ในตะกร้ามีส้ม', 'ลูก แม่ใส่เพิ่มอีก', 'ลูก ตอนนี้มีส้มกี่ลูก'], ['เทคโนเก็บเหรียญได้', 'เหรียญ แล้วเก็บเพิ่มอีก', 'เหรียญ รวมได้กี่เหรียญ'], ['บนต้นไม้มีนก', 'ตัว บินมาอีก', 'ตัว มีนกทั้งหมดกี่ตัว'], ['กล่องแรกมีลูกบอล', 'ลูก กล่องที่สองมี', 'ลูก รวมมีลูกบอลกี่ลูก']],
    '-': [['มีขนม', 'ชิ้น กินไป', 'ชิ้น เหลือขนมกี่ชิ้น'], ['เทคโนมีดาว', 'ดวง ให้เพื่อนไป', 'ดวง เหลือดาวกี่ดวง'], ['ในสระมีปลา', 'ตัว ว่ายหนีไป', 'ตัว เหลือปลากี่ตัว'], ['ร้านมีหนังสือ', 'เล่ม ขายไป', 'เล่ม เหลือหนังสือกี่เล่ม']]
  };
  function story(R, o) {
    const q = addsub(R, Object.assign({}, o, { form: 'res' })), s = pick(R, STORY[q.op]); q.kind = 'story';
    q.text = s[0] + ' ' + q.a + ' ' + s[1] + ' ' + q.b + ' ' + s[2]; q.spoken = s[0] + words(q.a) + s[1] + words(q.b) + s[2]; return q;
  }

  /* ---------- แนวตั้ง (ตั้งบวก/ลบ) ----------
     o: { op, d1, d2 (จำนวนหลักของตัวบน/ตัวล่าง), carry: 'none'|'some'|'chain'|null, min }
     คืน digits ของแต่ละหลักจากขวาไปซ้าย พร้อมตัวทด/ยืมที่ต้องเขียน */
  function column(R, o) {
    o = Object.assign({ op: '+', d1: 2, d2: 2, carry: null }, o);
    for (let tries = 0; tries < 600; tries++) {
      const op = o.op === 'mix' ? pick(R, ['+', '-']) : o.op, nd = n => ri(R, n === 1 ? 1 : Math.pow(10, n - 1), Math.pow(10, n) - 1);
      let a = nd(o.d1), b = nd(o.d2); if (op === '-' && (a < b || (o.d1 === o.d2 && a === b))) { const t = a; a = b; b = t; if (a === b) continue; }
      if (op === '-' && o.d1 < o.d2) continue; const st = steps(op, a, b), nC = st.filter(s => s.mark).length;
      if (o.carry === 'none' && nC) continue; if (o.carry === 'some' && nC !== 1 && nC !== 2) continue; if (o.carry === 'chain' && nC < 2) continue; if (o.carry === 'any' && !nC) continue;
      const ans = op === '+' ? a + b : a - b, spoken = words(a) + (op === '+' ? 'บวก' : 'ลบ') + words(b) + 'เท่ากับเท่าไร';
      return { kind: 'column', op, a, b, ans, steps: st, len: String(ans).length, spoken, text: a + ' ' + (op === '+' ? '+' : '−') + ' ' + b };
    }
    return { kind: 'column', op: '+', a: 12, b: 13, ans: 25, steps: steps('+', 12, 13), len: 2, spoken: 'สิบสองบวกสิบสามเท่ากับเท่าไร', text: '12 + 13' };
  }
  // ขั้นตอนแต่ละหลัก (จากขวา): { place, x (หลักตัวบน), y (หลักตัวล่าง), in (ตัวทดเข้า/ยืมแล้ว), digit (ผลของหลักนี้), mark (ตัวทด/ยืมที่ต้องเขียนไปหลักถัดไป) }
  function steps(op, a, b) {
    const A = String(a).split('').reverse().map(Number), B = String(b).split('').reverse().map(Number), n = Math.max(A.length, B.length), out = []; let carry = 0;
    for (let i = 0; i < n; i++) {
      const x = A[i] || 0, y = B[i] || 0;
      if (op === '+') { const s = x + y + carry; out.push({ place: i, x, y, in: carry, digit: s % 10, mark: s >= 10 ? 1 : 0 }); carry = s >= 10 ? 1 : 0; }
      else { let xx = x - carry; let bor = 0; if (xx < y) { xx += 10; bor = 1; } out.push({ place: i, x, y, in: carry, digit: xx - y, mark: bor, xEff: xx }); carry = bor; }
    }
    if (op === '+' && carry) out.push({ place: n, x: 0, y: 0, in: carry, digit: 1, mark: 0, lead: true });
    return out;
  }

  /* ---------- เรียงลำดับ / เปรียบเทียบ ---------- */
  function numSet(R, n, lo, hi, step) {
    step = step || 1; const cand = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) cand.push(v);
    if (cand.length < n) return cand; return shuf(R, cand).slice(0, n);
  }
  // sort: เรียงเลขชุดหนึ่ง asc/desc · o: { n, lo, hi, step, dir: 'asc'|'desc'|'mix', close: true (เลขใกล้กัน หลักร้อยเท่ากัน) }
  function sortQ(R, o) {
    o = Object.assign({ n: 4, lo: 1, hi: 20, step: 1, dir: 'asc' }, o); const dir = o.dir === 'mix' ? pick(R, ['asc', 'desc']) : o.dir; let nums;
    if (o.close) { const h = Math.floor(ri(R, o.lo, o.hi) / 100) * 100; nums = uniq(Array.from({ length: o.n * 4 }, () => h + ri(R, 0, 99))).slice(0, o.n); if (nums.length < o.n) nums = numSet(R, o.n, o.lo, o.hi, o.step); }
    else nums = numSet(R, o.n, o.lo, o.hi, o.step);
    const sorted = nums.slice().sort((p, q) => dir === 'asc' ? p - q : q - p), th = dir === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย';
    return { kind: 'sort', dir, nums: shuf(R, nums), sorted, text: th, spoken: th };
  }
  // cmp: เลือก > < = หรือ "อันไหนมากกว่า" · o: { lo, hi, equal: ความน่าจะเป็นที่เท่ากัน, mode: 'sign' | 'which' | 'less' }
  function cmpQ(R, o) {
    o = Object.assign({ lo: 1, hi: 20, equal: 0.12, mode: 'sign' }, o); const a = ri(R, o.lo, o.hi); let b = R() < o.equal ? a : ri(R, o.lo, o.hi);
    if (o.mode !== 'sign' && a === b) b = a === o.hi ? a - 1 : a + 1; if (o.near) { b = a + pick(R, (o.hi - o.lo) > 500 ? [-100, -10, -1, 1, 10, 100, -3, 3] : [-3, -2, -1, 1, 2, 3]); b = Math.max(o.lo, Math.min(o.hi, b)); if (o.mode !== 'sign' && a === b) b = a + 1; }
    if (o.mode === 'sign') return { kind: 'cmp', mode: 'sign', a, b, ans: a > b ? '>' : a < b ? '<' : '=', text: a + '  ?  ' + b, spoken: words(a) + ' กับ ' + words(b) + ' ใช้เครื่องหมายอะไร' };
    const less = o.mode === 'less'; return { kind: 'cmp', mode: o.mode, a, b, ans: less ? Math.min(a, b) : Math.max(a, b), text: less ? 'เลขไหนน้อยกว่า' : 'เลขไหนมากกว่า', spoken: less ? 'เลขไหนน้อยกว่ากัน' : 'เลขไหนมากกว่ากัน', opts: shuf(R, [a, b]) };
  }
  // maxmin: เลือกเลขที่มากที่สุด/น้อยที่สุดจากหลายตัว
  function maxminQ(R, o) {
    o = Object.assign({ n: 4, lo: 1, hi: 99, min: null }, o); const base = o.lo + 100 * ri(R, 0, Math.max(0, Math.floor((o.hi - o.lo + 1) / 100) - 1)), nums = o.close ? numSet(R, o.n, base, base + 99, 1) : numSet(R, o.n, o.lo, o.hi, o.step), isMin = o.min == null ? R() < 0.5 : o.min;
    return { kind: 'maxmin', min: isMin, opts: shuf(R, nums), ans: isMin ? Math.min.apply(null, nums) : Math.max.apply(null, nums), text: isMin ? 'เลขไหนน้อยที่สุด' : 'เลขไหนมากที่สุด', spoken: isMin ? 'เลขไหนน้อยที่สุด' : 'เลขไหนมากที่สุด' };
  }
  // neighbor: ก่อนหน้า / ถัดไป (step ใดก็ได้ เช่น ถัดไปทีละ 10 · 100)
  function neighborQ(R, o) {
    o = Object.assign({ lo: 2, hi: 50, step: 1, side: 'mix', opts: 4 }, o); const n = ri(R, Math.ceil((o.lo + o.step) / o.step), Math.floor((o.hi - o.step) / o.step)) * o.step, side = o.side === 'mix' ? pick(R, ['before', 'after']) : o.side;
    const ans = side === 'after' ? n + o.step : n - o.step, nm = o.step === 1 ? '' : (o.step === 10 ? ' (ทีละสิบ)' : o.step === 100 ? ' (ทีละร้อย)' : ' (ทีละ ' + o.step + ')');
    const txt = side === 'after' ? 'เลขที่มาหลัง ' + n + ' คือ?' + nm : 'เลขที่มาก่อน ' + n + ' คือ?' + nm, sp = side === 'after' ? 'เลขที่มาหลัง' + words(n) + 'คือเลขอะไร' : 'เลขที่มาก่อน' + words(n) + 'คือเลขอะไร';
    return { kind: 'neighbor', n, side, ans, text: txt, spoken: sp, opts: distract(R, ans, o.opts, { lo: Math.max(0, o.lo - o.step), hi: o.hi + o.step, extra: [side === 'after' ? n - o.step : n + o.step, n], spread: o.step }) };
  }
  // missing: แถวเลขที่เว้นว่างหนึ่งช่อง (ระยะห่าง step · up/down)
  function missingQ(R, o) {
    o = Object.assign({ len: 5, lo: 1, hi: 40, step: 1, dir: 'up', opts: 4 }, o); const dir = o.dir === 'mix' ? pick(R, ['up', 'down']) : o.dir, span = o.step * (o.len - 1);
    const start = ri(R, Math.ceil(o.lo / o.step), Math.max(Math.ceil(o.lo / o.step), Math.floor((o.hi - span) / o.step))) * o.step, seq = []; for (let i = 0; i < o.len; i++) seq.push(dir === 'up' ? start + i * o.step : start + span - i * o.step);
    const hole = ri(R, 1, o.len - 2), ans = seq[hole], row = seq.slice(); row[hole] = null; const nm = o.step === 1 ? '' : ' ทีละ ' + o.step;
    return { kind: 'missing', seq: row, full: seq, hole, ans, step: o.step, dir, text: 'เลขที่หายไปคือ?' + nm, spoken: 'เลขที่หายไปคือเลขอะไร', opts: distract(R, ans, o.opts, { lo: Math.max(0, o.lo - o.step), hi: o.hi + o.step, spread: o.step, extra: [ans + o.step, ans - o.step] }) };
  }
  // skip: นับเพิ่มทีละ step ต่อให้ครบ แล้วเลือกเลขถัดไป
  function skipQ(R, o) {
    o = Object.assign({ step: 2, lo: 0, hi: 60, dir: 'up', opts: 4, show: 4 }, o); const dir = o.dir === 'mix' ? pick(R, ['up', 'down']) : o.dir, s = o.step, span = s * o.show;
    const start = ri(R, Math.ceil(o.lo / s), Math.max(Math.ceil(o.lo / s), Math.floor((o.hi - span) / s))) * s, seq = []; for (let i = 0; i <= o.show; i++) seq.push(dir === 'up' ? start + i * s : start + span - i * s);
    const ans = seq.pop(); return { kind: 'skip', seq, ans, step: s, dir, text: 'นับทีละ ' + s + (dir === 'up' ? ' ต่อไปเลขอะไร' : ' ถอยหลัง ต่อไปเลขอะไร'), spoken: 'นับทีละ' + words(s) + (dir === 'up' ? 'เพิ่มขึ้น' : 'ถอยหลัง') + 'ต่อไปเลขอะไร', opts: distract(R, ans, o.opts, { lo: Math.max(0, o.lo - s), hi: o.hi + s, spread: s, extra: [ans + s, ans - s] }) };
  }
  // between: เลขที่อยู่ระหว่าง
  function betweenQ(R, o) {
    o = Object.assign({ lo: 1, hi: 99, gap: 10, opts: 4 }, o); const a = ri(R, o.lo, o.hi - o.gap), b = a + o.gap, ans = ri(R, a + 1, b - 1), out = [ans];
    let g = 0; while (out.length < o.opts && g++ < 80) { const v = ri(R, Math.max(o.lo, a - o.gap), Math.min(o.hi, b + o.gap)); if ((v <= a || v >= b) && out.indexOf(v) < 0) out.push(v); }
    g = 0; while (out.length < o.opts && g++ < 80) { const v = ri(R, Math.max(0, a - o.gap * 2), b + o.gap * 2); if ((v <= a || v >= b) && out.indexOf(v) < 0) out.push(v); }
    return { kind: 'between', a, b, ans, text: 'เลขไหนอยู่ระหว่าง ' + a + ' กับ ' + b, spoken: 'เลขไหนอยู่ระหว่าง' + words(a) + 'กับ' + words(b), opts: shuf(R, out) };
  }
  // place: หลักของเลข (ค่าของหลัก / ตัวเลขในหลัก)
  function placeQ(R, o) {
    o = Object.assign({ digits: 3, opts: 4 }, o); const n = ri(R, Math.pow(10, o.digits - 1), Math.pow(10, o.digits) - 1), s = String(n), p = ri(R, 0, o.digits - 1), names = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น'];
    const mode = o.mode === 'value' ? 'value' : (o.mode === 'mix' ? pick(R, ['digit', 'value']) : 'digit'), d = +s[s.length - 1 - p];
    if (mode === 'digit') return { kind: 'place', mode, n, pos: p, ans: d, text: 'เลข ' + n + ' มีเลขอะไรอยู่ในหลัก' + names[p], spoken: 'เลข' + words(n) + 'มีเลขอะไรอยู่ในหลัก' + names[p], opts: distract(R, d, 4, { lo: 0, hi: 9, spread: 3 }) };
    const v = d * Math.pow(10, p); return { kind: 'place', mode, n, pos: p, ans: v, text: 'เลข ' + d + ' ในหลัก' + names[p] + 'ของ ' + n + ' มีค่าเท่าไร', spoken: 'เลข' + words(d) + 'ในหลัก' + names[p] + 'มีค่าเท่าไร', opts: distract(R, v, 4, { lo: 0, spread: Math.pow(10, p) * 2, extra: [d, d * 10, d * 100].filter(x => x !== v) }) };
  }

  /* ---------- เลขโรมัน ---------- */
  const RV = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  const RS = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  function toRoman(n) { let s = ''; RV.forEach(p => { while (n >= p[0]) { s += p[1]; n -= p[0]; } }); return s; }
  function fromRoman(s) { let t = 0; for (let i = 0; i < s.length; i++) { const v = RS[s[i]], nx = RS[s[i + 1]] || 0; t += v < nx ? -v : v; } return t; }
  const validRoman = s => /^[IVXLCDM]+$/.test(s) && /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s);
  // แตกเป็นชิ้นส่วนเพื่ออธิบาย: 'XLIV' › [['XL',40],['IV',4]]
  function romanParts(n) { const out = []; RV.forEach(p => { while (n >= p[0]) { out.push([p[1], p[0]]); n -= p[0]; } }); return out; }
  // อธิบายการแยกเลขโรมัน: 44 › 'XLIV = XL + IV = 40 + 4 = 44' (ตัวเดียว: 'V = 5')
  function explainRoman(n) {
    const parts = romanParts(n), r = toRoman(n); if (parts.length === 1) return r + ' = ' + n;
    return r + ' = ' + parts.map(p => p[0]).join(' + ') + ' = ' + parts.map(p => p[1]).join(' + ') + ' = ' + n;
  }
  // ตัวเลือกลวงของเลขโรมัน: แบบที่เด็กมักเข้าใจผิด (IIII, VX, สลับลำดับ)
  function romanDistract(R, n, k) {
    const ans = toRoman(n), pool = [toRoman(n + 1), toRoman(Math.max(1, n - 1)), toRoman(n + 10), toRoman(Math.max(1, n - 10)), toRoman(n + 5), toRoman(Math.max(1, n - 5))];
    const parts = romanParts(n); if (parts.length >= 2) { const sw = parts.map(p => p[0]); const t = sw[0]; sw[0] = sw[sw.length - 1]; sw[sw.length - 1] = t; pool.push(sw.join('')); pool.push(parts.map(p => p[0]).reverse().join('')); }
    const bad = uniq(pool).filter(x => x && x !== ans); const out = shuf(R, bad).slice(0, k - 1); return shuf(R, out.concat([ans]));
  }
  // o: { mode: 'r2n' (เลขโรมัน › เลข) | 'n2r' (เลข › เลขโรมัน เลือกตอบ) | 'build' (ประกอบ) | 'sym' | 'rule' | 'fix' | 'arith' | 'clock', lo, hi }
  function romanQ(R, o) {
    o = Object.assign({ mode: 'r2n', lo: 1, hi: 20 }, o); const n = ri(R, o.lo, o.hi), r = toRoman(n);
    if (o.mode === 'sym') { const k = pick(R, ['I', 'V', 'X', 'L', 'C', 'D', 'M'].slice(0, o.syms || 7)), v = RS[k]; return { kind: 'sym', sym: k, ans: v, text: 'สัญลักษณ์ ' + k + ' มีค่าเท่าไร', spoken: 'สัญลักษณ์' + k + 'มีค่าเท่าไร', opts: distract(R, v, 4, { lo: 1, spread: v, extra: [1, 5, 10, 50, 100, 500, 1000].filter(x => x !== v) }) }; }
    if (mode(o, 'symrev')) { const k = pick(R, ['I', 'V', 'X', 'L', 'C', 'D', 'M'].slice(0, o.syms || 7)); return { kind: 'symrev', ans: k, n: RS[k], text: 'ค่า ' + RS[k] + ' เขียนด้วยสัญลักษณ์ใด', spoken: 'ค่า' + words(RS[k]) + 'เขียนด้วยสัญลักษณ์ใด', opts: shuf(R, ['I', 'V', 'X', 'L', 'C', 'D', 'M'].filter(x => x !== k)).slice(0, 3).concat([k]).sort(() => R() - 0.5) }; }
    if (o.mode === 'r2n') return { kind: 'r2n', n, roman: r, ans: n, text: 'เลขโรมัน ' + r + ' คือเลขอะไร', spoken: 'เลขโรมัน ' + r.split('').join(' ') + ' คือเลขอะไร', opts: distract(R, n, 4, { lo: 1, hi: 3999, spread: Math.max(2, Math.round(n * 0.1)) }) };
    if (o.mode === 'n2r') return { kind: 'n2r', n, roman: r, ans: r, text: 'เลข ' + n + ' เขียนเป็นเลขโรมันได้อย่างไร', spoken: 'เลข' + words(n) + 'เขียนเป็นเลขโรมันได้อย่างไร', opts: romanDistract(R, n, 4) };
    if (o.mode === 'build') return { kind: 'build', n, roman: r, ans: r, text: 'ประกอบเลขโรมันของ ' + n, spoken: 'ประกอบเลขโรมันของ' + words(n), tiles: ['I', 'V', 'X', 'L', 'C', 'D', 'M'].slice(0, o.tiles || 3) };
    if (o.mode === 'rule') { // บวกหรือลบ: ดูคู่ตัวอักษร
      const pairs = [['VI', 'add'], ['XI', 'add'], ['IV', 'sub'], ['IX', 'sub'], ['XV', 'add'], ['XL', 'sub'], ['LX', 'add'], ['XC', 'sub'], ['CX', 'add'], ['CD', 'sub'], ['DC', 'add'], ['CM', 'sub'], ['II', 'add'], ['XX', 'add']];
      const p = pick(R, pairs.slice(0, o.pairs || pairs.length)), v = fromRoman(p[0]); return { kind: 'rule', roman: p[0], rule: p[1], n: v, ans: p[1], text: 'ในเลขโรมัน ' + p[0] + ' ต้องบวกหรือลบ', spoken: 'ในเลขโรมัน ' + p[0].split('').join(' ') + ' ต้องบวกหรือลบ' };
    }
    if (o.mode === 'fix') { // เขียนผิดอันไหน
      const wrong = pick(R, ['IIII', 'VV', 'VX', 'IL', 'IC', 'XXXX', 'LL', 'IXI', 'VIV', 'DD', 'IM']), good = [toRoman(ri(R, o.lo, o.hi)), toRoman(ri(R, o.lo, o.hi)), toRoman(ri(R, o.lo, o.hi))].filter(x => x !== wrong); const opts = uniq(good).slice(0, 3);
      while (opts.length < 3) { const v = toRoman(ri(R, 2, 39)); if (opts.indexOf(v) < 0) opts.push(v); } return { kind: 'fix', ans: wrong, text: 'เลขโรมันข้อไหนเขียนผิดกติกา', spoken: 'เลขโรมันข้อไหนเขียนผิดกติกา', opts: shuf(R, opts.concat([wrong])) };
    }
    if (o.mode === 'arith') { const a = ri(R, 1, Math.max(1, Math.floor(o.hi / 2))), b = ri(R, 1, o.hi - a), plus = o.minus ? R() < 0.5 : true; const x = plus ? a : a + b, y = b, res = plus ? a + b : a; return { kind: 'arith', a: toRoman(x), b: toRoman(y), plus, ans: toRoman(res), n: res, text: toRoman(x) + (plus ? ' + ' : ' − ') + toRoman(y) + ' = ?', spoken: 'เลขโรมัน ' + toRoman(x) + (plus ? ' บวก ' : ' ลบ ') + toRoman(y) + ' เท่ากับเท่าไร', opts: romanDistract(R, res, 4) }; }
    if (o.mode === 'clock') { const h = ri(R, 1, 12); return { kind: 'clock', hour: h, roman: toRoman(h), ans: toRoman(h), text: 'เข็มสั้นชี้เลขโรมันอะไร', spoken: 'เข็มสั้นชี้เลขโรมันอะไร', opts: shuf(R, uniq([toRoman(h), toRoman(h % 12 + 1), toRoman((h + 10) % 12 + 1), toRoman((h + 5) % 12 + 1), toRoman((h + 2) % 12 + 1)]).slice(0, 4).concat(toRoman(h))).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4) }; }
    if (o.mode === 'year') { const y = ri(R, o.lo, o.hi), ry = toRoman(y); return { kind: 'year', n: y, roman: ry, ans: y, text: 'จารึกบนอาคารเขียนว่า ' + ry + ' ปีอะไร', spoken: 'จารึกบนอาคารเขียนว่า ' + ry.split('').join(' ') + ' ปีอะไร', opts: distract(R, y, 4, { lo: 1, hi: 3999, spread: 10 * ri(R, 1, 9) }) }; }
    return { kind: 'r2n', n, roman: r, ans: n, text: r, spoken: r, opts: distract(R, n, 4) };
  }
  function mode(o, m) { return o.mode === m; }

  /* ---------- กระดานบันไดงู ---------- */
  // cells: จำนวนช่อง (cols × rows) · คืน { cols, rows, cells, snakes: {จาก: ไป}, ladders: {จาก: ไป} }
  function board(R, o) {
    o = Object.assign({ cols: 5, rows: 6, snakes: 3, ladders: 3 }, o); const n = o.cols * o.rows, used = {}, snakes = {}, ladders = {}; used[1] = used[n] = 1;
    const minSpan = Math.max(o.cols - 1, 3); let g = 0;
    const put = (map, up) => { let t = 0; while (t++ < 200) { const a = ri(R, 2, n - 1), len = ri(R, minSpan, Math.max(minSpan + 1, Math.min(o.cols * 3, o.cols + 12))), b = up ? a + len : a - len; if (b < 2 || b > n - 1 || used[a] || used[b] || Math.floor((a - 1) / o.cols) === Math.floor((b - 1) / o.cols)) continue; if (up && a < 2) continue; used[a] = used[b] = 1; map[a] = b; return true; } return false; };
    for (let i = 0; i < o.ladders && g++ < 50; i++) put(ladders, true);
    for (let i = 0; i < o.snakes && g++ < 100; i++) { // งูเริ่มจากช่องสูง ลงไปช่องต่ำ
      let t = 0; while (t++ < 200) { const a = ri(R, Math.min(n - 1, o.cols * 2), n - 1), len = ri(R, minSpan, Math.max(minSpan + 1, Math.min(o.cols * 3, o.cols + 12))), b = a - len; if (b < 2 || used[a] || used[b] || Math.floor((a - 1) / o.cols) === Math.floor((b - 1) / o.cols)) continue; used[a] = used[b] = 1; snakes[a] = b; break; }
    }
    return { cols: o.cols, rows: o.rows, n, snakes, ladders };
  }

  /* ---------- ฝึกบวกลบ: โจทย์ตามระดับสำหรับนักล่าพลังบวก / บันไดงู ---------- */
  // bond: ทำสิบ (a + ? = 10) · double: บวกเลขซ้ำ · tens: บวกเลขเต็มสิบ
  function bondQ(R, o) {
    o = Object.assign({ target: 10, opts: 4 }, o); const t = o.target, a = ri(R, o.target >= 100 ? 10 : 0, t - (o.target >= 100 ? 10 : 0)), step = o.target >= 100 ? 10 : 1, aa = Math.round(a / step) * step, b = t - aa;
    return { kind: 'bond', a: aa, ans: b, text: aa + ' + ? = ' + t, spoken: words(aa) + 'บวกอะไรเท่ากับ' + words(t), opts: distract(R, b, o.opts, { lo: 0, hi: t, spread: step * 2 }) };
  }

  /* ---------- ตัวเลือกโจทย์ตามชื่อชนิด (ใช้กับข้อมูลด่าน: spec = { k: 'sort' | 'cmp' | ... , พารามิเตอร์ }) ---------- */
  function make(R, spec) {
    switch (spec.k) {
      case 'sort': return sortQ(R, spec); case 'cmp': return cmpQ(R, spec); case 'maxmin': return maxminQ(R, spec); case 'neighbor': return neighborQ(R, spec); case 'missing': return missingQ(R, spec);
      case 'skip': return skipQ(R, spec); case 'between': return betweenQ(R, spec); case 'place': return placeQ(R, spec); case 'addsub': return addsub(R, spec); case 'story': return story(R, spec);
      case 'column': return column(R, spec); case 'roman': return romanQ(R, spec); case 'bond': return bondQ(R, spec);
    }
    throw new Error('ไม่รู้จักชนิดโจทย์ ' + spec.k);
  }

  const api = { make, ri, pick, shuf, uniq, words, comma, distract, addsub, story, column, steps, hasCarry, hasBorrow, numSet, sortQ, cmpQ, maxminQ, neighborQ, missingQ, skipQ, betweenQ, placeQ, toRoman, fromRoman, validRoman, romanParts, explainRoman, romanDistract, romanQ, RS, board, bondQ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MK = api;
})(typeof window !== 'undefined' ? window : globalThis);
