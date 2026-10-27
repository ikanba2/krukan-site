/* ===== Techno Math (สมรภูมิคณิต ป.1–ป.4): ตัวสร้างโจทย์และวิธีทำทีละขั้น (ตรรกะล้วน ไม่แตะหน้าจอ ทดสอบด้วย node test_math.js) =====
   หัวข้อ (TOPICS) อยู่ในโลก (WORLDS) แต่ละหัวข้อมี 5 ระดับ ยากขึ้นตามระดับ · MG.make(หัวข้อ, ระดับ, rng) คืนโจทย์หนึ่งข้อ
   ทุกโจทย์มี mode (วิธีทำบนกระดาษ) และ cells = ช่องที่ต้องเขียนเรียงตามลำดับที่เขียนจริงบนกระดาษ
     cell: { id, ans, ask (คำถามนำ ไม่บอกคำตอบ), why (วิธีคิดพร้อมคำตอบ ใช้เป็นคำใบ้และตอนดูวิธีทำ), num (ตรวจแบบค่าเท่ากัน เช่น 12.5 = 12.50) }
   mode: type   = เติมคำตอบในกล่อง (q เป็นชิ้น ๆ: ข้อความ | {slot:i} | {frac:[บน, ล่าง]} | {mixed:[เต็ม, บน, ล่าง]} | {under:ข้อความ, k} | {br:1}) อาจมีภาพประกอบ fig
         choice = เลือกคำตอบ (opts: [{id, label}])
         shade  = แตะระบายชิ้นของรูปให้ได้เศษส่วนที่สั่ง
         column = ตั้งบวก ลบ คูณเลข 1 หลัก (ทศนิยมจัดจุดตรงกัน) เขียนผลลัพธ์จากหลักขวาไปซ้าย ตัวทดเขียนให้เอง การยืมแสดงตามระดับ
         mul2   = ตั้งคูณเลข 2 หลัก (ผลคูณย่อยสองแถว แล้วบวก)
         sdiv   = หารสั้น · ldiv = หารยาว (ผลหาร ผลคูณ ผลลบ ดึงลงให้เอง)
   ภาพ fig: blocks (หลักทรัพย์ฐานสิบ) dots (กรอบสิบ) frac (รูปเศษส่วน) clock coins ruler pict (แผนภูมิรูปภาพ) bars (แผนภูมิแท่ง) */
(function (root) {
  'use strict';
  /* ---------- สุ่ม ---------- */
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
  const shuf = (R, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nd = (R, n) => ri(R, Math.pow(10, n - 1), Math.pow(10, n) - 1);      // จำนวน n หลัก
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const rev = s => String(s).split('').reverse().map(Number);

  /* ---------- ตัวเลขและคำอ่านภาษาไทย ---------- */
  const TH_DIGIT = '๐๑๒๓๔๕๖๗๘๙';
  const thaiDigits = s => String(s).replace(/[0-9]/g, d => TH_DIGIT[+d]);
  const comma = n => String(n).replace(/^(\d+)/, m => m.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  const W_DIG = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'], W_POS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  // คำอ่านจำนวนนับ: หลักสิบใช้ สิบ ยี่สิบ · เลข 1 ในหลักหน่วยที่ตามหลังหลักสิบ (ที่ไม่ใช่ 0) อ่าน เอ็ด
  function thaiWords(n) {
    n = Math.floor(n); if (n === 0) return 'ศูนย์';
    if (n >= 1000000) { const hi = Math.floor(n / 1000000), lo = n % 1000000; return thaiWords(hi) + 'ล้าน' + (lo ? thaiWords(lo) : ''); }
    const ds = String(n).split('').map(Number), L = ds.length; let out = '';
    ds.forEach((d, i) => {
      const pos = L - 1 - i; if (d === 0) return;
      if (pos === 1) out += (d === 1 ? '' : d === 2 ? 'ยี่' : W_DIG[d]) + 'สิบ';
      else if (pos === 0) out += (d === 1 && L > 1 && ds[L - 2] !== 0 ? 'เอ็ด' : W_DIG[d]);
      else out += W_DIG[d] + W_POS[pos];
    });
    return out;
  }
  // อ่านแบบผิดที่พบบ่อย: อ่านตรงตัวทุกหลัก (สองสิบหนึ่ง หนึ่งสิบห้า) ใช้เป็นตัวลวง
  const naiveWords = n => String(n).split('').map((d, i, a) => (+d ? W_DIG[+d] + W_POS[a.length - 1 - i] : '')).join('') || 'ศูนย์';
  const PLACE_TH = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  const PLACE_V = [1, 10, 100, 1000, 10000, 100000, 1000000];
  const decWords = s => { const [i, f] = String(s).split('.'); return thaiWords(+i) + (f ? 'จุด' + f.split('').map(c => W_DIG[+c]).join('') : ''); };

  /* ---------- ชิ้นส่วนโจทย์ ---------- */
  const slot = i => ({ slot: i });
  // โจทย์แบบเติมกล่อง: slots = [{ ans, w (จำนวนตัวอักษรของช่อง), ask, why, num }]
  const typeQ = (head, q, slots, extra) => Object.assign({ mode: 'type', head, q, cells: slots.map((s, i) => ({ id: 's' + i, slot: i, ans: String(s.ans), w: s.w || Math.max(2, String(s.ans).length), ask: s.ask || '', why: s.why || '', num: !!s.num })), answer: slots.map(s => String(s.ans)).join(' , ') }, extra || {});
  const choiceQ = (head, q, opts, ans, ask, why, extra) => Object.assign({ mode: 'choice', head, q, opts, cells: [{ id: 'c', ans: String(ans), ask, why }], answer: String((opts.find(o => o.id === String(ans)) || {}).label || ans) }, extra || {});
  const CMP_OPTS = [{ id: '<', label: '<' }, { id: '=', label: '=' }, { id: '>', label: '>' }];
  const cmpWord = a => (a === '>' ? 'มากกว่า' : a === '<' ? 'น้อยกว่า' : 'เท่ากับ');

  /* ---------- ตั้งบวก ลบ คูณเลขหลักเดียว (แบบเขียนบนกระดาษ) ---------- */
  // ชื่อหลักของคอลัมน์ k (นับจากขวาสุด 0) เมื่อมีทศนิยม dp ตำแหน่ง
  const colName = (k, dp) => (k < dp ? 'ทศนิยมตำแหน่งที่ ' + (dp - k) : 'หลัก' + (PLACE_TH[k - dp] || ''));
  // rows = ตัวตั้งเป็นสตริง (มีจุดทศนิยมได้) · op '+' | '-' | '×' (ตัวคูณหลักเดียว) · showBorrow = แสดงการยืมให้ทันทีเมื่อถึงหลักนั้น
  function columnQ(head, rows, op, showBorrow) {
    const dp = op === '×' ? 0 : Math.max(...rows.map(s => (s.split('.')[1] || '').length));
    const pad = rows.map(s => { const [a, b] = s.split('.'); return dp ? a + '.' + (b || '').padEnd(dp, '0') : a; });   // เติม 0 ท้ายทศนิยมให้ตำแหน่งเท่ากัน
    const D = pad.map(s => rev(s.replace('.', '')));
    const cells = [], carry = {}, marks = {};   // carry[k] = ตัวทดที่เขียนเหนือหลัก k · marks[k] = การยืมที่ต้องแสดงเมื่อถึงหลัก k [{col, val}]
    const res = [];
    // หลักซ้ายสุดที่ได้ผลตั้งแต่ 10 เขียนลงไปทั้งจำนวน (แยกเป็นช่องละหลัก)
    const pushTop = (last, label) => { const ls = last.d.split('').reverse(); ls.forEach((ch, j) => res.push({ d: ch, ask: j ? label + ' ได้ ' + last.d + ' เขียนเลขหน้าต่อไปทางซ้าย' : last.ask, why: last.why + (ls.length > 1 ? ' เขียนลงไปทั้ง ' + last.d : '') })); };
    if (op === '+') {
      const n = Math.max(...D.map(d => d.length)); let c = 0;
      for (let k = 0; k < n; k++) {
        const parts = D.map(d => d[k] || 0), s = parts.reduce((a, b) => a + b, 0) + c, top = k === n - 1, ex = parts.join(' + ') + (c ? ' + ' + c + ' (ตัวทด)' : '');
        const r = { d: top ? String(s) : String(s % 10), ask: colName(k, dp) + ': ' + ex + ' = ?', why: colName(k, dp) + ': ' + ex + ' = ' + s + (s >= 10 && !top ? ' เขียน ' + (s % 10) + ' ทด ' + Math.floor(s / 10) + ' ไป' + colName(k + 1, dp) : '') };
        c = Math.floor(s / 10); if (c && !top) carry[k + 1] = c;
        if (top) pushTop(r, 'ผลบวกของ' + colName(k, dp)); else res.push(r);
      }
    } else if (op === '-') {
      const a = D[0], b = D[1], cur = a.slice();
      for (let k = 0; k < a.length; k++) {
        const bk = b[k] || 0; let note = '', ask;
        if (cur[k] < bk) {
          let j = k + 1; while (cur[j] === 0) j++;
          const mk = []; for (let t = j; t > k; t--) { cur[t] -= 1; cur[t - 1] += 10; mk.push({ col: t, val: cur[t] }); }
          mk.push({ col: k, val: cur[k] }); marks[k] = mk;
          note = ' (' + colName(k, dp) + 'ไม่พอลบ ยืมจาก' + colName(j, dp) + ' 1 ได้ 10' + (j > k + 1 ? ' หลักที่เป็น 0 ระหว่างทางกลายเป็น 9' : '') + ')';
          ask = colName(k, dp) + ': ' + (cur[k] - 10) + ' ลบ ' + bk + ' ไม่พอ ต้องยืม › ' + cur[k] + ' − ' + bk + ' = ?';
        } else ask = colName(k, dp) + ': ' + cur[k] + ' − ' + bk + ' = ?';
        res.push({ d: String(cur[k] - bk), ask, why: colName(k, dp) + ': ' + cur[k] + ' − ' + bk + ' = ' + (cur[k] - bk) + note });
      }
      while (res.length > dp + 1 && res[res.length - 1].d === '0') res.pop();   // ศูนย์นำหน้าไม่ต้องเขียน
    } else {
      const a = D[0], m = +rows[1]; let c = 0;
      for (let k = 0; k < a.length; k++) {
        const s = a[k] * m + c, top = k === a.length - 1, ex = a[k] + ' × ' + m + (c ? ' + ' + c + ' (ตัวทด)' : '');
        const r = { d: top ? String(s) : String(s % 10), ask: colName(k, 0) + ': ' + ex + ' = ?', why: colName(k, 0) + ': ' + ex + ' = ' + s + (s >= 10 && !top ? ' เขียน ' + (s % 10) + ' ทด ' + Math.floor(s / 10) : '') };
        c = Math.floor(s / 10); if (c && !top) carry[k + 1] = c;
        if (top) pushTop(r, 'ผลคูณหลักซ้ายสุด'); else res.push(r);
      }
    }
    res.forEach((r, k) => cells.push({ id: 'r' + k, ans: r.d, row: 'res', col: k, ask: r.ask, why: r.why }));
    const resV = res.map(r => r.d).reverse().join(''), resS = dp ? (resV.slice(0, -dp) || '0') + '.' + resV.slice(-dp) : resV;
    return { mode: 'column', head, op, rows, pad, dp, res: resS, carry, marks, showBorrow: !!showBorrow, cells, answer: comma(resS), q: [rows.map(comma).join(' ' + (op === '-' ? '−' : op) + ' ') + ' = ?'] };
  }

  /* ---------- คูณเลข 2 หลัก ---------- */
  function mulSteps(a, m, label, shift) {   // คูณ a ด้วยเลขหลักเดียว m ทีละหลัก (เลื่อนไป shift หลัก)
    const ds = rev(a), out = []; let c = 0;
    ds.forEach((d, k) => {
      const s = d * m + c, top = k === ds.length - 1, ex = d + ' × ' + m + (c ? ' + ' + c + ' (ตัวทด)' : ''), w = top ? String(s) : String(s % 10);
      w.split('').reverse().forEach((ch, j) => out.push({ d: ch, col: k + j + shift, ask: label + ' ' + colName(k + shift, 0) + ': ' + ex + ' = ?', why: label + ': ' + ex + ' = ' + s + (s >= 10 && !top ? ' เขียน ' + (s % 10) + ' ทด ' + Math.floor(s / 10) : (top && s >= 10 ? ' เขียนลงไปทั้ง ' + s : '')) }));
      c = Math.floor(s / 10);
    });
    return out;
  }
  function mul2Q(head, a, b) {
    const b0 = b % 10, b1 = Math.floor(b / 10), p1 = a * b0, p2 = a * b1 * 10, tot = a * b, cells = [];
    mulSteps(a, b0, 'แถวที่ 1 (× ' + b0 + ')', 0).forEach((s, i) => cells.push({ id: 'p1_' + i, ans: s.d, row: 'p1', col: s.col, ask: s.ask, why: s.why }));
    mulSteps(a, b1, 'แถวที่ 2 (× ' + b1 + '0)', 1).forEach((s, i) => cells.push({ id: 'p2_' + i, ans: s.d, row: 'p2', col: s.col, ask: s.ask, why: s.why + (i === 0 ? ' (แถวนี้คูณด้วย ' + b1 + '0 หลักหน่วยจึงเป็น 0 แล้วเริ่มเขียนที่หลักสิบ)' : '') }));
    const A = rev(p1), B = rev(p2), Tt = rev(tot); let c = 0;
    Tt.forEach((d, k) => { const s = (A[k] || 0) + (B[k] || 0) + c, ex = (A[k] || 0) + ' + ' + (B[k] || 0) + (c ? ' + ' + c + ' (ตัวทด)' : ''); cells.push({ id: 's_' + k, ans: String(d), row: 'sum', col: k, ask: 'บวกสองแถว ' + colName(k, 0) + ': ' + ex + ' = ?', why: 'บวกสองแถว ' + colName(k, 0) + ': ' + ex + ' = ' + s + (s >= 10 && k < Tt.length - 1 ? ' เขียน ' + (s % 10) + ' ทด 1' : '') }); c = Math.floor(s / 10); });
    return { mode: 'mul2', head, a: String(a), b: String(b), p1: String(p1), p2: String(p2), res: String(tot), cells, answer: comma(tot), q: [comma(a) + ' × ' + b + ' = ?'] };
  }

  /* ---------- หารสั้น ---------- */
  function sdivQ(head, n, d) {
    const ds = String(n).split('').map(Number), cells = [], rem = {}; let r = 0, started = false;
    ds.forEach((x, i) => {
      const cur = r * 10 + x, q = Math.floor(cur / d); r = cur % d;
      if (r && i < ds.length - 1) rem[i + 1] = r;      // เศษเขียนเล็ก ๆ หน้าหลักถัดไป
      if (q === 0 && !started && i < ds.length - 1) return;   // หลักแรกน้อยกว่าตัวหาร ไม่ต้องเขียนผลหาร รวมกับหลักถัดไป
      started = true;
      cells.push({ id: 'q' + i, ans: String(q), row: 'q', col: i, ask: cur + ' ÷ ' + d + ' ได้เท่าไร (ท่องแม่ ' + d + ' หาตัวที่ใกล้ ' + cur + ' ที่สุดโดยไม่เกิน)', why: d + ' × ' + q + ' = ' + d * q + ' จึงได้ ' + q + (r ? ' เหลือเศษ ' + r + (i < ds.length - 1 ? ' เขียนเศษเล็ก ๆ หน้าหลักถัดไป' : '') : ' ไม่มีเศษ') });
    });
    const Q = Math.floor(n / d), R0 = n % d;
    if (R0) cells.push({ id: 'rem', ans: String(R0), row: 'rem', ask: 'หลักสุดท้ายหารแล้วเหลือเศษเท่าไร', why: 'หลักสุดท้ายเหลือเศษ ' + R0 + ' จึงตอบ ' + Q + ' เศษ ' + R0 });
    return { mode: 'sdiv', head, n: String(n), d: String(d), rem, quot: String(Q), r: R0, cells, answer: comma(Q) + (R0 ? ' เศษ ' + R0 : ''), q: [comma(n) + ' ÷ ' + d + ' = ?'] };
  }

  /* ---------- หารยาว ---------- */
  // หาร คูณ ลบ ดึงลง: lines = แถวที่เขียนใต้ตัวตั้ง [{ kind: 'mul'|'diff', s, end (หลักขวาสุดของแถว), ids, down: [หลักที่ดึงลงมาต่อท้าย] }]
  // ผลลบที่เป็น 0 แล้วยังมีหลักให้ดึงลง ไม่ต้องเขียน 0 (ดึงหลักถัดไปลงมาเลย แบบหนังสือเรียน)
  function ldivQ(head, n, d) {
    const ds = String(n), cells = [], lines = [], L = ds.length; let cur = 0, first = true, pend = null;
    for (let i = 0; i < L; i++) {
      cur = cur * 10 + +ds[i];
      if (first && cur < d && i < L - 1) continue;
      const q = Math.floor(cur / d), prod = q * d, diff = cur - prod, last = i === L - 1;
      cells.push({ id: 'q' + i, ans: String(q), row: 'q', col: i, ask: (first ? 'เริ่มที่ ' : 'ตอนนี้ได้ ') + cur + ' ÷ ' + d + ' ได้เท่าไร (หา ' + d + ' × ? ที่ใกล้ ' + cur + ' ที่สุดโดยไม่เกิน)', why: d + ' × ' + q + ' = ' + prod + ' ไม่เกิน ' + cur + ' แต่ ' + d + ' × ' + (q + 1) + ' = ' + d * (q + 1) + ' เกิน จึงได้ ' + q + (q === 0 ? ' แล้วดึงหลักถัดไปลงมา' : '') });
      if (q > 0) {
        const ml = { kind: 'mul', s: String(prod), end: i, ids: [] }; lines.push(ml);
        String(prod).split('').forEach((c, k) => { const id = 'm' + i + '_' + k; ml.ids.push(id); cells.push({ id, ans: c, row: 'mul', line: lines.length - 1, k, ask: 'คูณกลับ: ' + d + ' × ' + q + ' = ? (เขียนใต้ ' + cur + ')', why: d + ' × ' + q + ' = ' + prod + ' เขียนใต้ ' + cur + ' ให้หลักตรงกัน' }); });
        const dl = { kind: 'diff', s: diff === 0 && !last ? '' : String(diff), end: i, ids: [], down: [] }; lines.push(dl);
        if (dl.s) dl.s.split('').forEach((c, k) => { const id = 'd' + i + '_' + k; dl.ids.push(id); cells.push({ id, ans: c, row: 'diff', line: lines.length - 1, k, ask: 'ลบ: ' + cur + ' − ' + prod + ' = ?', why: cur + ' − ' + prod + ' = ' + diff + (last ? (diff ? ' เป็นเศษ' : ' หารลงตัว') : ' แล้วดึง ' + ds[i + 1] + ' ลงมา') }); });
        pend = dl;
      }
      if (!last && pend) pend.down.push(i + 1);   // ดึงหลักถัดไปลงมาต่อท้ายแถวผลลบล่าสุด
      first = false; cur = diff;
    }
    const Q = Math.floor(n / d), R0 = n % d;
    return { mode: 'ldiv', head, n: ds, d: String(d), lines, quot: String(Q), r: R0, cells, answer: comma(Q) + (R0 ? ' เศษ ' + R0 : ''), q: [comma(n) + ' ÷ ' + d + ' = ?'] };
  }

  /* ---------- โลก ---------- */
  const WORLDS = [
    { id: 'num', th: 'เมืองตัวเลข', en: 'NUMBER CITY', color: '#3d8bff', icon: '123', arena: 'sky', hero: 'r0', boss: 15, mons: [13, 23, 24] },
    { id: 'add', th: 'ป้อมบวกลบ', en: 'PLUS FORT', color: '#17c4a8', icon: '+−', arena: 'nature', hero: 'r2', boss: 31, mons: [14, 20, 28] },
    { id: 'mul', th: 'หอคอยคูณ', en: 'TIMES TOWER', color: '#ff8a1e', icon: '×', arena: 'fire', hero: 'r3', boss: 12, mons: [26, 29, 13] },
    { id: 'div', th: 'ถ้ำหาร', en: 'DIVIDE CAVE', color: '#9a5ae8', icon: '÷', arena: 'ice', hero: 'r1', boss: 30, mons: [17, 25, 23] },
    { id: 'frac', th: 'ป่าเศษส่วน', en: 'FRACTION FOREST', color: '#ff5aa6', icon: '½', arena: 'autumn', hero: 'r2', boss: 26, mons: [20, 24, 14] },
    { id: 'dec', th: 'ทะเลทศนิยม', en: 'DECIMAL SEA', color: '#27b4e8', icon: '0.5', arena: 'reef', hero: 'r1', boss: 32, mons: [25, 17, 30] },
    { id: 'life', th: 'ตลาดชีวิตจริง', en: 'REAL-LIFE MARKET', color: '#ffb800', icon: '฿', arena: 'sun', hero: 'r0', boss: 28, mons: [23, 29, 13] },
    { id: 'mix', th: 'ปราสาทโจทย์', en: 'PUZZLE CASTLE', color: '#ee4a4a', icon: '?', arena: 'thunder', hero: 'r3', boss: 15, mons: [12, 26, 31] }
  ];
  const T = [];
  const topic = o => { T.push(o); return o; };

  /* ===== เมืองตัวเลข ===== */
  topic({ id: 'count', world: 'num', th: 'นับจำนวน', en: 'Counting', grade: 1, lv: ['นับ 1–10', 'นับ 11–20', 'สิบกับหน่วย', 'ร้อย สิบ หน่วย', 'หลักพัน'],
    tip: 'นับเป็นกลุ่มจะเร็วกว่านับทีละอัน: แท่งยาว 1 แท่ง = 10 · แผ่น 1 แผ่น = 100 · ก้อนใหญ่ 1 ก้อน = 1,000 แล้วนำมารวมกัน',
    make(L, R) {
      if (L <= 2) { const n = L === 1 ? ri(R, 1, 10) : ri(R, 11, 20); return typeQ('นับจุดแล้วเขียนเป็นตัวเลข', ['มีจุดทั้งหมด ', slot(0), ' จุด'], [{ ans: n, ask: 'กรอบหนึ่งมี 10 ช่อง นับช่องที่มีจุด', why: (n > 10 ? 'กรอบแรกเต็ม 10 กับกรอบที่สองอีก ' + (n - 10) + ' ได้ ' : 'นับได้ ') + n }], { fig: { kind: 'dots', n } }); }
      const n = L === 3 ? ri(R, 21, 99) : L === 4 ? ri(R, 101, 999) : ri(R, 1001, 4999), th = Math.floor(n / 1000), h = Math.floor(n / 100) % 10, t = Math.floor(n / 10) % 10, o = n % 10;
      const parts = [[th, 1000, 'ก้อนพัน'], [h, 100, 'แผ่นร้อย'], [t, 10, 'แท่งสิบ'], [o, 1, 'ก้อนหน่วย']].filter(p => p[0]);
      return typeQ('นับหลักทรัพย์แล้วเขียนเป็นตัวเลข', ['รวมทั้งหมด ', slot(0)], [{ ans: n, w: String(n).length + 1, ask: 'นับแต่ละแบบ: ' + parts.map(p => p[2] + 'มีกี่ชิ้น').join(' '), why: parts.map(p => p[0] + ' ' + p[2] + ' = ' + comma(p[0] * p[1])).join(' · ') + ' รวม ' + comma(n) }], { fig: { kind: 'blocks', th, h, t, o } }); } });
  // ตัวเลือกคำอ่านที่ผิดแบบที่นักเรียนพลาดบ่อย
  function wordOpts(R, n) {
    const ok = thaiWords(n), out = new Set([ok]), s = String(n), tries = [
      () => naiveWords(n), () => ok.replace('เอ็ด', 'หนึ่ง'), () => ok.replace(/หนึ่ง$/, 'เอ็ด'), () => ok.replace('ยี่สิบ', 'สองสิบ'),
      () => thaiWords(+s.split('').reverse().join('') || n + 1), () => thaiWords(n + pick(R, [1, 10, 100])), () => thaiWords(Math.max(1, n - pick(R, [1, 10]))), () => thaiWords(+(s[0] + '0' + s.slice(1)))];
    shuf(R, tries).forEach(f => { if (out.size >= 4) return; const w = f(); if (w && w !== ok) out.add(w); });
    let k = 2; while (out.size < 4) out.add(thaiWords(n + k++));
    return shuf(R, [...out]).map(w => ({ id: w, label: w }));
  }
  topic({ id: 'write', world: 'num', th: 'อ่านเขียนตัวเลข', en: 'Read & write numbers', grade: 1, lv: ['0–20', 'คำอ่านถึง 100', 'ถึง 1,000 และเลขไทย', 'คำอ่านถึงหลักแสน', 'ถึงหลักล้าน'],
    tip: 'เขียนจากหลักซ้ายสุดไปขวา หลักที่ไม่มีค่าให้เขียน 0 · เลข 1 ในหลักหน่วยที่ตามหลังหลักสิบอ่านว่า เอ็ด · 20 อ่านว่า ยี่สิบ',
    make(L, R) {
      if (L === 2 || L === 4) { const n = L === 2 ? ri(R, 11, 100) : ri(R, 1001, 999999); return choiceQ('เลือกคำอ่านที่ถูกต้อง', [comma(n) + ' อ่านว่า', { br: 1 }, slot(0)], wordOpts(R, n), thaiWords(n), 'อ่านทีละหลักจากซ้าย บอกชื่อหลักทุกครั้ง', comma(n) + ' อ่านว่า ' + thaiWords(n), { wide: true }); }
      const n = L === 1 ? ri(R, 0, 20) : L === 3 ? ri(R, 101, 1000) : ri(R, 100001, 9999999), asThai = L === 3 && R() < 0.5;
      return typeQ(asThai ? 'เขียนเลขไทยเป็นตัวเลขฮินดูอารบิก' : 'เขียนคำอ่านเป็นตัวเลข', [asThai ? thaiDigits(comma(n)) : thaiWords(n), ' = ', slot(0)], [{ ans: n, w: String(n).length + 1, ask: asThai ? 'เทียบเลขไทยทีละตัว ๑=1 ๒=2 ๓=3 …' : 'หาชื่อหลักในคำอ่าน หลักไหนไม่ได้อ่านให้เขียน 0', why: (asThai ? thaiDigits(comma(n)) : thaiWords(n)) + ' เขียนเป็น ' + comma(n) }]); } });
  topic({ id: 'place', world: 'num', th: 'ค่าประจำหลัก', en: 'Place value', grade: 1, lv: ['2 หลัก', '3 หลัก', '4 หลัก', '5–6 หลัก', '7 หลัก'],
    tip: 'ค่าของตัวเลข = ตัวเลข × ค่าของหลัก เช่น 7 ในหลักร้อยมีค่า 700 · หลักเรียงจากขวา: หน่วย สิบ ร้อย พัน หมื่น แสน ล้าน',
    make(L, R) { const n = nd(R, [2, 3, 4, ri(R, 5, 6), 7][L - 1]), s = String(n); let k; do { k = ri(R, 0, s.length - 1); } while (s[s.length - 1 - k] === '0');
      const dg = +s[s.length - 1 - k], v = dg * PLACE_V[k];
      return typeQ('ตัวเลขที่ขีดเส้นใต้มีค่าเท่าไร', [{ under: comma(n), k }, { br: 1 }, 'ตัว ' + dg + ' มีค่า ', slot(0)], [{ ans: v, w: String(v).length + 1, ask: 'นับหลักจากขวา หน่วย สิบ ร้อย … ตัว ' + dg + ' อยู่หลักไหน', why: dg + ' อยู่หลัก' + PLACE_TH[k] + ' มีค่า ' + dg + ' × ' + comma(PLACE_V[k]) + ' = ' + comma(v) }]); } });
  topic({ id: 'expand', world: 'num', th: 'รูปกระจาย', en: 'Expanded form', grade: 2, lv: ['2 หลัก', '3 หลัก', '4 หลัก', '5 หลัก', 'กลับเป็นจำนวน'],
    tip: 'แยกตัวเลขแต่ละหลักตามค่าประจำหลัก เช่น 4,352 = 4,000 + 300 + 50 + 2 หลักที่เป็น 0 ไม่ต้องเขียน',
    make(L, R) { const n = nd(R, [2, 3, 4, 5, ri(R, 4, 6)][L - 1]), s = String(n), parts = s.split('').map((d, i) => +d * Math.pow(10, s.length - 1 - i)).filter(v => v > 0);
      if (L === 5) return typeQ('เขียนรูปกระจายเป็นจำนวน', [parts.map(comma).join(' + ') + ' = ', slot(0)], [{ ans: n, w: s.length + 1, ask: 'ใส่ตัวเลขแต่ละหลักลงตามตำแหน่ง หลักที่ไม่มีใส่ 0', why: 'รวมค่าทุกหลัก ' + parts.map(comma).join(' + ') + ' = ' + comma(n) }]);
      const q = [comma(n) + ' = ']; parts.forEach((v, i) => { if (i) q.push(' + '); q.push(slot(i)); });
      return typeQ('เขียน ' + comma(n) + ' ในรูปกระจาย', q, parts.map(v => { const k = String(v).length - 1; return { ans: v, w: String(v).length + 1, ask: 'ช่องนี้คือหลัก' + PLACE_TH[k] + ' ตัวเลขหลัก' + PLACE_TH[k] + 'มีค่าเท่าไร', why: 'ตัว ' + String(v)[0] + ' อยู่หลัก' + PLACE_TH[k] + ' มีค่า ' + comma(v) }; })); } });
  topic({ id: 'compare', world: 'num', th: 'เปรียบเทียบเรียงลำดับ', en: 'Compare & order', grade: 1, lv: ['1–2 หลัก', '3 หลัก', '4 หลัก', '5–6 หลัก', 'มากที่สุด น้อยที่สุด'],
    tip: 'จำนวนที่มีหลักมากกว่ามีค่ามากกว่า ถ้าจำนวนหลักเท่ากัน ให้เทียบหลักซ้ายสุดก่อน ถ้าเท่ากันค่อยเทียบหลักถัดไปทางขวา',
    make(L, R) {
      if (L === 5) { const k = ri(R, 3, 5), xs = []; while (xs.length < 4) { const v = R() < 0.5 && xs.length ? Number(String(xs[0]).slice(0, 2) + String(nd(R, k)).slice(2)) : nd(R, k); if (!xs.includes(v)) xs.push(v); } const big = R() < 0.5, ans = big ? Math.max(...xs) : Math.min(...xs);
        return choiceQ('จำนวนใด' + (big ? 'มากที่สุด' : 'น้อยที่สุด'), [slot(0)], xs.map(v => ({ id: String(v), label: comma(v) })), ans, 'เทียบหลักซ้ายสุดของทุกจำนวนก่อน ถ้าเท่ากันเทียบหลักถัดไป', comma(ans) + (big ? ' มากที่สุด' : ' น้อยที่สุด')); }
      const dig = [ri(R, 1, 2), 3, 4, ri(R, 5, 6)][L - 1], a = nd(R, dig), b = R() < 0.15 ? a : (R() < 0.55 ? Number(String(a).slice(0, -1) + ri(R, 0, 9)) : nd(R, dig)), ans = a > b ? '>' : a < b ? '<' : '=';
      return choiceQ('เลือกเครื่องหมาย < = >', [comma(a), ' ', slot(0), ' ', comma(b)], CMP_OPTS, ans, 'เทียบทีละหลักจากซ้าย หลักแรกที่ต่างกันบอกว่าจำนวนไหนมากกว่า', comma(a) + ' ' + cmpWord(ans) + ' ' + comma(b), { cmp: true }); } });
  topic({ id: 'round', world: 'num', th: 'ค่าประมาณ', en: 'Rounding', grade: 3, lv: ['เต็มสิบ', 'เต็มร้อย', 'เต็มพัน', 'เต็มหมื่น', 'ประมาณผลบวก'],
    tip: 'ดูหลักที่อยู่ถัดไปทางขวาของหลักที่จะปัด ถ้าน้อยกว่า 5 ปัดลง ถ้าตั้งแต่ 5 ขึ้นไปปัดขึ้น หลักทางขวาทั้งหมดกลายเป็น 0',
    make(L, R) {
      if (L === 5) { const a = nd(R, 3), b = nd(R, 3), ra = Math.floor(a / 100 + 0.5) * 100, rb = Math.floor(b / 100 + 0.5) * 100; return typeQ('ประมาณแต่ละจำนวนเป็นเต็มร้อยก่อน แล้วบวกกัน', [comma(a) + ' + ' + comma(b) + ' ≈ ', slot(0)], [{ ans: ra + rb, w: 5, ask: 'ปัด ' + comma(a) + ' และ ' + comma(b) + ' เป็นเต็มร้อยก่อน', why: comma(a) + ' ≈ ' + comma(ra) + ' และ ' + comma(b) + ' ≈ ' + comma(rb) + ' รวมกัน ≈ ' + comma(ra + rb) }]); }
      const p = [10, 100, 1000, 10000][L - 1], n = ri(R, p + 1, p * 100 - 1), r = Math.floor(n / p + 0.5) * p, nm = ['สิบ', 'ร้อย', 'พัน', 'หมื่น'][L - 1], nxt = Math.floor(n / (p / 10)) % 10;
      return typeQ('ค่าประมาณเป็นจำนวนเต็ม' + nm, [comma(n) + ' ≈ ', slot(0)], [{ ans: r, w: String(r).length + 1, ask: 'ดูตัวเลขหลักถัดไปทางขวาของหลัก' + nm + ' น้อยกว่า 5 หรือไม่', why: 'หลักถัดไปทางขวาของหลัก' + nm + 'คือ ' + nxt + (nxt >= 5 ? ' ตั้งแต่ 5 ปัดขึ้น' : ' น้อยกว่า 5 ปัดลง') + ' ได้ ' + comma(r) }]); } });
  topic({ id: 'pattern', world: 'num', th: 'แบบรูปของจำนวน', en: 'Number patterns', grade: 1, lv: ['ทีละ 1 ทีละ 2', 'ทีละ 5 ทีละ 10', 'ลดลงทีละเท่ากัน', 'ทีละ 25 50 100', 'หลายช่องว่าง'],
    tip: 'ดูสองจำนวนที่อยู่ติดกันว่าเพิ่มขึ้นหรือลดลงเท่าไร แล้วทำแบบเดียวกันต่อไป',
    make(L, R) {
      const st = [() => pick(R, [1, 2]), () => pick(R, [5, 10]), () => -pick(R, [2, 5, 10, 3]), () => pick(R, [25, 50, 100, -100]), () => pick(R, [3, 4, 6, 20, -25, 200])][L - 1](), len = 6, as = Math.abs(st);
      const start = st > 0 ? ri(R, 1, L >= 4 ? 300 : 40) * (as >= 25 ? as : 1) : ri(R, as * len + 10, as * len + 120);
      const seq = Array.from({ length: len }, (_, i) => start + st * i), blanks = L === 5 ? shuf(R, [2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b) : [ri(R, 2, 5)];
      const q = [], slots = []; seq.forEach((v, i) => { if (i) q.push(' , '); if (blanks.includes(i)) { q.push(slot(slots.length)); slots.push({ ans: v, w: String(v).length + 1, ask: 'จำนวนเพิ่มหรือลดทีละเท่าไร ดูจาก ' + comma(seq[0]) + ' กับ ' + comma(seq[1]), why: (st > 0 ? 'เพิ่มขึ้นทีละ ' + st : 'ลดลงทีละ ' + as) + ' จึงได้ ' + comma(v) }); } else q.push(comma(v)); });
      return typeQ('เติมจำนวนที่หายไปในแบบรูป', q, slots); } });

  /* ===== ป้อมบวกลบ ===== */
  topic({ id: 'addh', world: 'add', th: 'บวกในใจ', en: 'Mental addition', grade: 1, lv: ['ไม่เกิน 10', 'ไม่เกิน 20', '2 หลัก + 1 หลัก', '2 หลัก + 2 หลัก', '3 หลัก + 2 หลัก'],
    tip: 'บวกหลักหน่วยก่อน ถ้าได้ตั้งแต่ 10 ทด 1 ไปหลักสิบ หรือเติมให้ครบสิบก่อน เช่น 8 + 5 = 8 + 2 + 3 = 13',
    make(L, R) { let a, b; if (L === 1) { a = ri(R, 0, 9); b = ri(R, 0, 10 - a); } else if (L === 2) { a = ri(R, 2, 9); b = ri(R, 11 - a, 9); } else if (L === 3) { a = ri(R, 11, 89); b = ri(R, 1, 9); } else if (L === 4) { a = nd(R, 2); b = nd(R, 2); } else { a = nd(R, 3); b = nd(R, 2); }
      const s = a + b, tens = L === 2 ? ' (เติม ' + a + ' ให้ครบ 10 ด้วย ' + (10 - a) + ' แล้วเหลืออีก ' + (b - 10 + a) + ')' : '';
      return typeQ('หาผลบวก', [a + ' + ' + b + ' = ', slot(0)], [{ ans: s, ask: L >= 3 ? 'บวกหลักหน่วยก่อน ' + (a % 10) + ' + ' + (b % 10) + ' แล้วบวกหลักสิบ' : 'นับต่อจาก ' + a + ' ไปอีก ' + b, why: a + ' + ' + b + ' = ' + s + tens }], { fast: true }); } });
  topic({ id: 'addv', world: 'add', th: 'ตั้งบวก', en: 'Column addition', grade: 1, lv: ['2 หลักไม่ทด', '2 หลักมีทด', '3 หลัก', '4 หลัก', '5 หลัก / 3 จำนวน'],
    tip: 'ตั้งหลักให้ตรงกัน บวกจากหลักหน่วยไปทางซ้าย ผลบวกหลักใดตั้งแต่ 10 ให้เขียนหลักหน่วยแล้วทด 1 ไปบวกในหลักถัดไป',
    make(L, R) { let rows;
      if (L === 1) { const a = nd(R, 2), b0 = ri(R, 0, 9 - a % 10), b1 = ri(R, 1, 9 - Math.floor(a / 10) || 1); rows = [a, Math.max(10, b1 * 10 + b0)]; if (a % 10 + rows[1] % 10 > 9 || a + rows[1] > 99) rows = [ri(R, 1, 4) * 10 + ri(R, 0, 4), ri(R, 1, 4) * 10 + ri(R, 0, 5)]; }
      else if (L === 2) { let a, b; do { a = nd(R, 2); b = nd(R, 2); } while (a % 10 + b % 10 < 10); rows = [a, b]; }
      else if (L === 3) rows = [nd(R, 3), nd(R, ri(R, 2, 3))]; else if (L === 4) rows = [nd(R, 4), nd(R, ri(R, 3, 4))]; else rows = R() < 0.5 ? [nd(R, 5), nd(R, ri(R, 4, 5))] : [nd(R, 3), nd(R, 3), nd(R, 2)];
      return columnQ('ตั้งบวก', rows.map(String), '+'); } });
  topic({ id: 'subh', world: 'add', th: 'ลบในใจ', en: 'Mental subtraction', grade: 1, lv: ['ไม่เกิน 10', 'ไม่เกิน 20', '2 หลัก − 1 หลัก', '2 หลัก − 2 หลัก', '3 หลัก − 2 หลัก'],
    tip: 'ลบหลักหน่วยก่อน ถ้าตัวตั้งน้อยกว่าตัวลบ ให้ยืม 1 สิบมาเป็น 10 หน่วย หรือนับถอยหลัง',
    make(L, R) { let a, b; if (L === 1) { a = ri(R, 1, 10); b = ri(R, 0, a); } else if (L === 2) { a = ri(R, 11, 18); b = ri(R, a - 9, 9); } else if (L === 3) { a = ri(R, 20, 99); b = ri(R, 1, 9); } else if (L === 4) { a = ri(R, 30, 99); b = ri(R, 10, a - 1); } else { a = nd(R, 3); b = ri(R, 10, 99); }
      return typeQ('หาผลลบ', [a + ' − ' + b + ' = ', slot(0)], [{ ans: a - b, ask: L >= 3 ? 'ลบหลักหน่วยก่อน ' + (a % 10) + ' − ' + (b % 10) + (a % 10 < b % 10 ? ' ไม่พอ ต้องยืม' : '') : 'นับถอยหลังจาก ' + a + ' ไป ' + b + ' ครั้ง', why: a + ' − ' + b + ' = ' + (a - b) }], { fast: true }); } });
  topic({ id: 'subv', world: 'add', th: 'ตั้งลบ', en: 'Column subtraction', grade: 1, lv: ['2 หลักไม่ยืม', '2 หลักมีการยืม', '3 หลัก', '4 หลัก', 'มี 0 ในตัวตั้ง'],
    tip: 'ตั้งหลักให้ตรงกัน ลบจากหลักหน่วย ถ้าตัวบนน้อยกว่าตัวล่าง ยืมจากหลักถัดไป 1 มาเป็น 10 (หลักที่ให้ยืมลดลง 1)',
    make(L, R) { let a, b;
      if (L === 1) { do { a = nd(R, 2); b = ri(R, 1, Math.floor(a / 10)) * 10 + ri(R, 0, a % 10); } while (b >= a || b < 10); }
      else if (L === 2) { do { a = nd(R, 2); b = nd(R, 2); } while (a <= b || a % 10 >= b % 10); }
      else if (L === 3) { do { a = nd(R, 3); b = nd(R, ri(R, 2, 3)); } while (a <= b); }
      else if (L === 4) { do { a = nd(R, 4); b = nd(R, ri(R, 3, 4)); } while (a <= b); }
      else { a = ri(R, 1, 9) * 1000 + pick(R, [0, 3, 5, 7, 40, 60, 200, 405, 702]); do { b = nd(R, ri(R, 3, 4)); } while (b >= a); }
      return columnQ('ตั้งลบ', [String(a), String(b)], '-', L <= 2); } });
  topic({ id: 'missing', world: 'add', th: 'หาตัวไม่ทราบค่า', en: 'Missing number', grade: 1, lv: ['บวกไม่เกิน 20', 'ลบไม่เกิน 20', 'บวกลบ 2 หลัก', 'คูณหาร', 'บวกลบ 3–4 หลัก'],
    tip: 'ใช้ความสัมพันธ์ของการบวกกับการลบ (และการคูณกับการหาร) เช่น □ + 5 = 12 จะได้ □ = 12 − 5',
    make(L, R) { let q, x, why, ask;
      if (L === 1) { const a = ri(R, 1, 9); x = ri(R, 1, 10); q = R() < 0.5 ? [a + ' + ', slot(0), ' = ' + (a + x)] : [slot(0), ' + ' + a + ' = ' + (a + x)]; ask = 'ตัวที่หายไปบวก ' + a + ' แล้วได้ ' + (a + x) + ' ลองคิด ' + (a + x) + ' − ' + a; why = (a + x) + ' − ' + a + ' = ' + x; }
      else if (L === 2) { const a = ri(R, 10, 20); x = ri(R, 1, a - 1); q = [a + ' − ', slot(0), ' = ' + (a - x)]; ask = 'นำ ' + a + ' ลบด้วยผลลบ ' + (a - x); why = a + ' − ' + (a - x) + ' = ' + x; }
      else if (L === 3) { const a = nd(R, 2); x = nd(R, 2); if (R() < 0.5) { q = [slot(0), ' + ' + a + ' = ' + (a + x)]; ask = 'ผลบวกลบด้วยตัวที่รู้ ' + (a + x) + ' − ' + a; why = (a + x) + ' − ' + a + ' = ' + x; } else { q = [slot(0), ' − ' + a + ' = ' + x]; ask = 'ตัวตั้ง = ผลลบ + ตัวลบ'; why = x + ' + ' + a + ' = ' + (x + a); x = x + a; } }
      else if (L === 4) { const a = ri(R, 2, 9); x = ri(R, 2, 12); if (R() < 0.5) { q = [a + ' × ', slot(0), ' = ' + a * x]; ask = 'ใช้การหาร ' + (a * x) + ' ÷ ' + a; why = (a * x) + ' ÷ ' + a + ' = ' + x; } else { q = [slot(0), ' ÷ ' + a + ' = ' + x]; ask = 'ตัวตั้ง = ผลหาร × ตัวหาร'; why = x + ' × ' + a + ' = ' + (a * x); x = a * x; } }
      else { const a = nd(R, 3); x = nd(R, ri(R, 3, 4)); q = [comma(x + a) + ' − ', slot(0), ' = ' + comma(a)]; ask = 'นำตัวตั้งลบผลลบ'; why = comma(x + a) + ' − ' + comma(a) + ' = ' + comma(x); }
      return typeQ('หาจำนวนที่หายไปในกล่อง', q, [{ ans: x, ask, why }]); } });

  /* ===== หอคอยคูณ ===== */
  const TABLES = [[2, 5, 10], [3, 4], [6, 7], [8, 9], [11, 12]];
  topic({ id: 'times', world: 'mul', th: 'สูตรคูณ', en: 'Times tables', grade: 2, lv: ['แม่ 2 5 10', 'แม่ 3 4', 'แม่ 6 7', 'แม่ 8 9', 'แม่ 2–12 ผสม'],
    tip: 'ท่องสูตรคูณให้คล่อง ถ้าจำไม่ได้ใช้การบวกซ้ำ เช่น 6 × 4 = 6 + 6 + 6 + 6 หรือสลับที่ 4 × 6 ได้ผลเท่ากัน',
    make(L, R) { const t = L === 5 ? pick(R, [3, 4, 6, 7, 8, 9, 11, 12]) : pick(R, TABLES[L - 1]), m = ri(R, 1, 12), sw = R() < 0.3;
      return typeQ('สูตรคูณแม่ ' + t, [(sw ? m + ' × ' + t : t + ' × ' + m) + ' = ', slot(0)], [{ ans: t * m, ask: 'ท่องแม่ ' + t + ' ไปจนถึงตัวที่ ' + m, why: t + ' × ' + m + ' = ' + t * m + (m <= 6 ? ' (' + Array(m).fill(t).join(' + ') + ')' : '') }], { fast: true }); } });
  topic({ id: 'mul10', world: 'mul', th: 'คูณจำนวนเต็มสิบ', en: 'Multiply by tens', grade: 3, lv: ['× 10', '× 100 และ 1,000', '× 20 ถึง 90', 'เต็มสิบ × เต็มสิบ', 'เต็มร้อย × เต็มสิบ'],
    tip: 'คูณตัวเลขที่ไม่ใช่ 0 ก่อน แล้วเติม 0 ตามจำนวน 0 ที่มีทั้งหมด เช่น 30 × 40 = 3 × 4 = 12 แล้วเติม 00 ได้ 1,200',
    make(L, R) { let a, b; if (L === 1) { a = nd(R, ri(R, 1, 2)); b = 10; } else if (L === 2) { a = nd(R, ri(R, 1, 2)); b = pick(R, [100, 1000]); } else if (L === 3) { a = nd(R, ri(R, 1, 2)); b = ri(R, 2, 9) * 10; } else if (L === 4) { a = ri(R, 2, 9) * 10; b = ri(R, 2, 9) * 10; } else { a = ri(R, 2, 9) * 100; b = ri(R, 2, 9) * 10; }
      const z = v => (String(v).match(/0+$/) || [''])[0].length, za = z(a), zb = z(b), ca = a / Math.pow(10, za), cb = b / Math.pow(10, zb);
      return typeQ('หาผลคูณ', [comma(a) + ' × ' + comma(b) + ' = ', slot(0)], [{ ans: a * b, w: String(a * b).length + 1, ask: 'คูณ ' + ca + ' × ' + cb + ' ก่อน แล้วนับ 0 ทั้งหมด (' + (za + zb) + ' ตัว)', why: ca + ' × ' + cb + ' = ' + ca * cb + ' แล้วเติม 0 อีก ' + (za + zb) + ' ตัว ได้ ' + comma(a * b) }]); } });
  topic({ id: 'mul1', world: 'mul', th: 'ตั้งคูณเลข 1 หลัก', en: '× 1-digit', grade: 3, lv: ['2 หลัก ไม่ทด', '2 หลัก มีทด', '3 หลัก', '4 หลัก', 'มี 0 ในตัวตั้ง'],
    tip: 'คูณจากหลักหน่วยไปทางซ้าย ผลคูณหลักใดตั้งแต่ 10 เขียนหลักหน่วยแล้วทดไปบวกกับผลคูณของหลักถัดไป',
    make(L, R) { let a, m;
      if (L === 1) { m = ri(R, 2, 4); a = ri(R, 1, Math.floor(9 / m)) * 10 + ri(R, 1, Math.floor(9 / m)); }
      else if (L === 2) { m = ri(R, 3, 9); do { a = nd(R, 2); } while ((a % 10) * m < 10); }
      else if (L === 3) { m = ri(R, 2, 9); a = nd(R, 3); } else if (L === 4) { m = ri(R, 2, 9); a = nd(R, 4); } else { m = ri(R, 3, 9); a = pick(R, [105, 206, 307, 408, 509, 1020, 2006, 3040, 5009, 4080, 7060]); }
      return columnQ('ตั้งคูณ', [String(a), String(m)], '×'); } });
  topic({ id: 'mul2', world: 'mul', th: 'ตั้งคูณเลข 2 หลัก', en: '× 2-digit', grade: 4, lv: ['2 หลัก × 11–19', '2 หลัก × 2 หลัก', '3 หลัก × 2 หลัก', 'มีทดหลายตัว', '3 หลัก × 2 หลัก (ยาก)'],
    tip: 'คูณด้วยหลักหน่วยของตัวคูณได้แถวที่ 1 · คูณด้วยหลักสิบได้แถวที่ 2 (หลักหน่วยเป็น 0 จึงเริ่มเขียนที่หลักสิบ) · แล้วบวกสองแถว',
    make(L, R) { let a, b; if (L === 1) { a = nd(R, 2); b = ri(R, 11, 19); } else if (L === 2) { a = nd(R, 2); b = ri(R, 21, 99); } else if (L === 3) { a = nd(R, 3); b = ri(R, 11, 39); } else if (L === 4) { a = ri(R, 56, 99); b = ri(R, 6, 9) * 10 + ri(R, 6, 9); } else { a = nd(R, 3); b = ri(R, 40, 99); }
      if (b % 10 === 0) b += 1; return mul2Q('ตั้งคูณ', a, b); } });

  /* ===== ถ้ำหาร ===== */
  topic({ id: 'divf', world: 'div', th: 'หารพื้นฐาน', en: 'Division facts', grade: 2, lv: ['หาร 2 5 10', 'หาร 3 4', 'หาร 6 ถึง 9', 'หารมีเศษ', 'ผสม'],
    tip: 'การหารคือการคูณย้อนกลับ 56 ÷ 7 ให้คิดว่า 7 คูณอะไรได้ 56 · ถ้าหารไม่ลงตัว หาผลคูณที่ใกล้ที่สุดโดยไม่เกิน ส่วนที่เหลือคือเศษ',
    make(L, R) { const d = L === 1 ? pick(R, [2, 5, 10]) : L === 2 ? pick(R, [3, 4]) : ri(R, L === 5 ? 2 : (L === 4 ? 3 : 6), 9), q = ri(R, 1, L === 5 ? 12 : 10);
      if (L === 4) { const r = ri(R, 1, d - 1), n = d * q + r; return typeQ('หาผลหารและเศษ', [n + ' ÷ ' + d + ' = ', slot(0), ' เศษ ', slot(1)], [{ ans: q, ask: d + ' คูณอะไรได้ใกล้ ' + n + ' ที่สุดโดยไม่เกิน', why: d + ' × ' + q + ' = ' + d * q + ' ใกล้ ' + n + ' ที่สุดโดยไม่เกิน' }, { ans: r, ask: n + ' − ' + d * q + ' = ?', why: n + ' − ' + d * q + ' = ' + r }]); }
      return typeQ('หาผลหาร', [(d * q) + ' ÷ ' + d + ' = ', slot(0)], [{ ans: q, ask: d + ' × ? = ' + d * q, why: d + ' × ' + q + ' = ' + d * q + ' ดังนั้น ' + (d * q) + ' ÷ ' + d + ' = ' + q }], { fast: true }); } });
  topic({ id: 'sdiv', world: 'div', th: 'หารสั้น', en: 'Short division', grade: 3, lv: ['2 หลัก ÷ 1 หลัก', '3 หลัก ÷ 1 หลัก', 'มีเศษ', '4 หลัก ÷ 1 หลัก', '4 หลัก มีเศษ'],
    tip: 'หารจากหลักซ้ายสุดทีละหลัก ผลหารเขียนใต้เส้น เศษที่เหลือเขียนเล็ก ๆ หน้าหลักถัดไป (กลายเป็นสิบของหลักถัดไป)',
    make(L, R) { const d = ri(R, 2, 9); let n; if (L === 1) n = d * ri(R, Math.ceil(10 / d), Math.floor(99 / d)); else if (L === 2) n = d * ri(R, Math.ceil(100 / d), Math.floor(999 / d)); else if (L === 3) { do { n = nd(R, 3); } while (n % d === 0); } else if (L === 4) n = d * ri(R, Math.ceil(1000 / d), Math.floor(9999 / d)); else { do { n = nd(R, 4); } while (n % d === 0); }
      return sdivQ('หารสั้น', n, d); } });
  topic({ id: 'ldiv', world: 'div', th: 'หารยาว', en: 'Long division', grade: 4, lv: ['3 หลัก ÷ 1 หลัก', 'มีเศษ', '4 หลัก ÷ 1 หลัก', '3 หลัก ÷ 2 หลัก', '4 หลัก ÷ 2 หลัก'],
    tip: 'ทำซ้ำ 4 ขั้น: หาร (หาผลหาร 1 หลัก) › คูณ (คูณกลับ) › ลบ › ดึงหลักถัดไปลงมา จนครบทุกหลัก ผลลบสุดท้ายคือเศษ',
    make(L, R) { let d, n; if (L === 1) { d = ri(R, 2, 9); n = d * ri(R, Math.ceil(100 / d), Math.floor(999 / d)); } else if (L === 2) { d = ri(R, 3, 9); do { n = nd(R, 3); } while (n % d === 0); } else if (L === 3) { d = ri(R, 2, 9); n = nd(R, 4); } else if (L === 4) { d = ri(R, 11, 25); n = d * ri(R, Math.ceil(100 / d), Math.floor(999 / d)); } else { d = ri(R, 12, 48); n = nd(R, 4); }
      return ldivQ('หารยาว', n, d); } });

  /* ===== ป่าเศษส่วน ===== */
  topic({ id: 'fread', world: 'frac', th: 'เศษส่วนจากภาพ', en: 'Fractions in pictures', grade: 3, lv: ['ครึ่งและเศษหนึ่งส่วนสี่', 'ส่วน 2 ถึง 6', 'ระบายสีตามสั่ง', 'ส่วน 6 ถึง 10', 'ระบายสี (ยาก)'],
    tip: 'ตัวส่วน (ตัวล่าง) = จำนวนส่วนที่แบ่งเท่า ๆ กันทั้งหมด · ตัวเศษ (ตัวบน) = จำนวนส่วนที่ระบายหรือเลือก',
    make(L, R) { const den = L === 1 ? pick(R, [2, 4]) : L === 2 ? ri(R, 2, 6) : L === 3 ? ri(R, 3, 8) : ri(R, 6, 10), num = ri(R, 1, den - 1), shape = pick(R, den <= 8 ? ['circle', 'bar', 'grid'] : ['bar', 'grid']);
      if (L === 3 || L === 5) return { mode: 'shade', head: 'แตะชิ้นส่วนเพื่อระบายสีให้ได้ ' + num + '/' + den + ' แล้วกดตรวจ', fig: { kind: 'frac', den, num: 0, shape, live: true }, target: num, q: [{ frac: [String(num), String(den)] }], cells: [{ id: 'sh', ans: String(num), ask: 'ตัวเศษคือ ' + num + ' ต้องระบายกี่ชิ้น', why: 'ระบาย ' + num + ' ชิ้นจากทั้งหมด ' + den + ' ชิ้น' }], answer: num + '/' + den };
      return typeQ('ภาพนี้ระบายสีไว้เป็นเศษส่วนเท่าไร', [{ frac: [slot(0), slot(1)] }], [{ ans: num, ask: 'นับชิ้นที่ระบายสี', why: 'ระบายสีไว้ ' + num + ' ชิ้น เป็นตัวเศษ' }, { ans: den, ask: 'นับชิ้นทั้งหมดที่แบ่งเท่า ๆ กัน', why: 'แบ่งเท่า ๆ กันทั้งหมด ' + den + ' ชิ้น เป็นตัวส่วน' }], { fig: { kind: 'frac', den, num, shape } }); } });
  topic({ id: 'feq', world: 'frac', th: 'เศษส่วนที่เท่ากัน', en: 'Equivalent fractions', grade: 4, lv: ['คูณ 2', 'คูณ 2 ถึง 5', 'หาตัวส่วน', 'ทำเป็นอย่างต่ำ', 'ผสม'],
    tip: 'คูณหรือหารทั้งตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน (ที่ไม่ใช่ 0) จะได้เศษส่วนที่มีค่าเท่าเดิม',
    make(L, R) { let den = ri(R, 2, 9), num = ri(R, 1, den - 1); const g = gcd(num, den); num /= g; den /= g; const k = L === 1 ? 2 : ri(R, 2, 5), mode = L === 5 ? pick(R, [2, 3, 4]) : L;
      if (mode === 4) return typeQ('ทำเป็นเศษส่วนอย่างต่ำ', [{ frac: [String(num * k), String(den * k)] }, ' = ', { frac: [slot(0), slot(1)] }], [{ ans: num, ask: 'หาจำนวนที่หารทั้ง ' + num * k + ' และ ' + den * k + ' ลงตัว', why: 'หารทั้งเศษและส่วนด้วย ' + k + ' ได้ ' + num + '/' + den }, { ans: den, ask: 'หารตัวส่วนด้วยจำนวนเดียวกัน', why: den * k + ' ÷ ' + k + ' = ' + den }]);
      if (mode === 3) return typeQ('หาตัวส่วนที่หายไป', [{ frac: [String(num), String(den)] }, ' = ', { frac: [String(num * k), slot(0)] }], [{ ans: den * k, ask: 'ตัวเศษ ' + num + ' กลายเป็น ' + num * k + ' คูณด้วยอะไร', why: num + ' × ' + k + ' = ' + num * k + ' ตัวส่วนต้อง × ' + k + ' ด้วย ได้ ' + den * k }]);
      return typeQ('หาตัวเศษที่หายไป', [{ frac: [String(num), String(den)] }, ' = ', { frac: [slot(0), String(den * k)] }], [{ ans: num * k, ask: 'ตัวส่วน ' + den + ' กลายเป็น ' + den * k + ' คูณด้วยอะไร', why: den + ' × ' + k + ' = ' + den * k + ' ตัวเศษต้อง × ' + k + ' ด้วย ได้ ' + num * k }]); } });
  topic({ id: 'fcmp', world: 'frac', th: 'เปรียบเทียบเศษส่วน', en: 'Compare fractions', grade: 3, lv: ['ตัวส่วนเท่ากัน', 'ตัวเศษเท่ากัน', 'ตัวส่วนเป็นพหุคูณ', 'ผสม', 'น้อยที่สุด'],
    tip: 'ตัวส่วนเท่ากัน ตัวเศษมากกว่ามีค่ามากกว่า · ตัวเศษเท่ากัน ตัวส่วนน้อยกว่ามีค่ามากกว่า (แบ่งน้อยชิ้น ชิ้นจึงใหญ่กว่า) · ตัวส่วนไม่เท่า ทำให้เท่ากันก่อน',
    make(L, R) {
      if (L === 5) { const den = ri(R, 5, 12), xs = shuf(R, Array.from({ length: den - 1 }, (_, i) => i + 1)).slice(0, 4), sm = Math.min(...xs); return choiceQ('เศษส่วนใดน้อยที่สุด', [slot(0)], xs.map(x => ({ id: String(x), label: x + '/' + den })), sm, 'ตัวส่วนเท่ากันหมด ดูตัวเศษ', 'ตัวส่วนเท่ากัน ตัวเศษ ' + sm + ' น้อยที่สุด จึงเป็น ' + sm + '/' + den); }
      let a, b, c, d; const mode = L === 4 ? ri(R, 1, 3) : L;
      if (mode === 1) { b = d = ri(R, 3, 12); a = ri(R, 1, b - 1); c = ri(R, 1, d - 1); } else if (mode === 2) { a = c = ri(R, 1, 5); b = ri(R, a + 1, 12); d = ri(R, a + 1, 12); } else { b = ri(R, 2, 6); d = b * ri(R, 2, 3); a = ri(R, 1, b - 1); c = ri(R, 1, d - 1); }
      if (R() < 0.5) { [a, c] = [c, a]; [b, d] = [d, b]; }
      const ans = a * d === c * b ? '=' : a * d > c * b ? '>' : '<', big = Math.max(b, d), sm = Math.min(b, d);
      const why = mode === 1 ? 'ตัวส่วนเท่ากัน เทียบตัวเศษ ' + a + ' กับ ' + c : mode === 2 ? 'ตัวเศษเท่ากัน ตัวส่วนน้อยกว่ามีค่ามากกว่า' : 'ทำตัวส่วนให้เท่ากันเป็น ' + big + ' (คูณ ' + (big / sm) + ') แล้วเทียบตัวเศษ';
      return choiceQ('เลือกเครื่องหมาย < = >', [{ frac: [String(a), String(b)] }, ' ', slot(0), ' ', { frac: [String(c), String(d)] }], CMP_OPTS, ans, mode === 1 ? 'ตัวส่วนเท่ากันไหม ถ้าเท่า ดูตัวเศษ' : mode === 2 ? 'ตัวเศษเท่ากัน ชิ้นไหนใหญ่กว่า' : 'ทำตัวส่วนให้เท่ากันก่อน', why + ' จึงได้ ' + a + '/' + b + ' ' + cmpWord(ans) + ' ' + c + '/' + d, { cmp: true }); } });
  topic({ id: 'fadd', world: 'frac', th: 'บวกลบเศษส่วน', en: 'Add & subtract fractions', grade: 4, lv: ['บวก ตัวส่วนเท่ากัน', 'ลบ ตัวส่วนเท่ากัน', 'เศษเกินเป็นจำนวนคละ', 'จำนวนคละเป็นเศษเกิน', 'บวกได้จำนวนคละ'],
    tip: 'ตัวส่วนเท่ากัน นำตัวเศษมาบวกหรือลบกัน ตัวส่วนคงเดิม · เศษเกินเปลี่ยนเป็นจำนวนคละโดยหารตัวเศษด้วยตัวส่วน (ผลหาร = จำนวนเต็ม เศษ = ตัวเศษใหม่)',
    make(L, R) { const d = ri(R, 3, 12), F = (n, dd) => ({ frac: [String(n), String(dd)] });
      if (L === 1) { const a = ri(R, 1, d - 2), b = ri(R, 1, d - 1 - a); return typeQ('หาผลบวก', [F(a, d), ' + ', F(b, d), ' = ', { frac: [slot(0), String(d)] }], [{ ans: a + b, ask: 'ตัวส่วนเท่ากัน บวกเฉพาะตัวเศษ ' + a + ' + ' + b, why: 'ตัวส่วนเท่ากัน บวกตัวเศษ ' + a + ' + ' + b + ' = ' + (a + b) + ' ตัวส่วนยังเป็น ' + d }]); }
      if (L === 2) { const a = ri(R, 2, d - 1), b = ri(R, 1, a - 1); return typeQ('หาผลลบ', [F(a, d), ' − ', F(b, d), ' = ', { frac: [slot(0), String(d)] }], [{ ans: a - b, ask: 'ตัวส่วนเท่ากัน ลบเฉพาะตัวเศษ ' + a + ' − ' + b, why: 'ลบตัวเศษ ' + a + ' − ' + b + ' = ' + (a - b) + ' ตัวส่วนยังเป็น ' + d }]); }
      if (L === 3) { const w = ri(R, 1, 4), r = ri(R, 1, d - 1), n = w * d + r; return typeQ('เขียนเศษเกินเป็นจำนวนคละ', [F(n, d), ' = ', { mixed: [slot(0), slot(1), String(d)] }], [{ ans: w, ask: n + ' ÷ ' + d + ' ได้กี่ (จำนวนเต็ม)', why: n + ' ÷ ' + d + ' = ' + w + ' เศษ ' + r + ' จำนวนเต็มคือ ' + w }, { ans: r, ask: 'เศษที่เหลือเป็นตัวเศษ', why: 'เศษ ' + r + ' เป็นตัวเศษ ได้ ' + w + ' กับ ' + r + '/' + d }]); }
      if (L === 4) { const w = ri(R, 1, 4), r = ri(R, 1, d - 1); return typeQ('เขียนจำนวนคละเป็นเศษเกิน', [{ mixed: [String(w), String(r), String(d)] }, ' = ', { frac: [slot(0), String(d)] }], [{ ans: w * d + r, ask: 'จำนวนเต็ม × ตัวส่วน แล้วบวกตัวเศษ', why: w + ' × ' + d + ' + ' + r + ' = ' + (w * d + r) }]); }
      const a = ri(R, 2, d - 1), b = ri(R, d - a + 1, d - 1), s = a + b; return typeQ('หาผลบวก ตอบเป็นจำนวนคละ', [F(a, d), ' + ', F(b, d), ' = ', { mixed: [slot(0), slot(1), String(d)] }], [{ ans: Math.floor(s / d), ask: 'บวกตัวเศษได้ ' + s + '/' + d + ' แล้วหาร ' + s + ' ÷ ' + d, why: a + ' + ' + b + ' = ' + s + ' ได้ ' + s + '/' + d + ' = ' + Math.floor(s / d) + ' กับ ' + (s % d) + '/' + d }, { ans: s % d, ask: 'เศษที่เหลือเป็นตัวเศษ', why: 'เศษ ' + (s % d) }]); } });

  /* ===== ทะเลทศนิยม ===== */
  const decStr = (R, ip, dp) => { const i = ip === 0 ? 0 : nd(R, ip); let f = ''; for (let k = 0; k < dp; k++) f += k === dp - 1 ? ri(R, 1, 9) : ri(R, 0, 9); return i + '.' + f; };
  topic({ id: 'dread', world: 'dec', th: 'อ่านเขียนทศนิยม', en: 'Read & write decimals', grade: 4, lv: ['1 ตำแหน่ง', '2 ตำแหน่ง', 'เศษส่วนเป็นทศนิยม', '3 ตำแหน่ง', 'ค่าประจำหลัก'],
    tip: 'ทศนิยม 1 ตำแหน่ง = ส่วนสิบ · 2 ตำแหน่ง = ส่วนร้อย · 3 ตำแหน่ง = ส่วนพัน · อ่านตัวเลขหลังจุดทีละตัว เช่น 2.45 อ่านว่า สองจุดสี่ห้า',
    make(L, R) {
      if (L === 3) { const den = pick(R, [10, 100, 1000]), z = String(den).length - 1; let num; do { num = ri(R, 1, den - 1); } while (num % 10 === 0 && den > 10); const s = (num / den).toFixed(z); return typeQ('เขียนเศษส่วนเป็นทศนิยม', [{ frac: [String(num), String(den)] }, ' = ', slot(0)], [{ ans: s, num: true, w: s.length + 1, ask: 'ตัวส่วน ' + den + ' มี 0 กี่ตัว ทศนิยมก็มีกี่ตำแหน่ง', why: 'ตัวส่วน ' + den + ' มี 0 ' + z + ' ตัว จึงเป็นทศนิยม ' + z + ' ตำแหน่ง ได้ ' + s }]); }
      if (L === 5) { const s = decStr(R, 1, 3), f = s.split('.')[1]; let k; do { k = ri(R, 0, 2); } while (f[k] === '0'); const v = (+f[k] / Math.pow(10, k + 1)).toFixed(k + 1); return typeQ('ตัวเลขที่ขีดเส้นใต้มีค่าเท่าไร (ตอบเป็นทศนิยม)', [{ under: s, k: 2 - k }, { br: 1 }, 'ตัว ' + f[k] + ' มีค่า ', slot(0)], [{ ans: v, num: true, w: v.length + 1, ask: 'ตำแหน่งที่ ' + (k + 1) + ' หลังจุดคือส่วน' + ['สิบ', 'ร้อย', 'พัน'][k], why: 'ตำแหน่งที่ ' + (k + 1) + ' หลังจุดคือส่วน' + ['สิบ', 'ร้อย', 'พัน'][k] + ' ' + f[k] + ' จึงมีค่า ' + v }]); }
      const s = decStr(R, ri(R, 0, 2), [1, 2, 0, 3][L - 1]); return typeQ('เขียนคำอ่านเป็นตัวเลขทศนิยม', [decWords(s) + ' = ', slot(0)], [{ ans: s, num: true, w: s.length + 1, ask: 'คำก่อน จุด คือจำนวนเต็ม คำหลัง จุด เขียนทีละตัว', why: decWords(s) + ' เขียนเป็น ' + s }]); } });
  topic({ id: 'dcmp', world: 'dec', th: 'เปรียบเทียบทศนิยม', en: 'Compare decimals', grade: 4, lv: ['1 ตำแหน่ง', '2 ตำแหน่ง', 'จำนวนตำแหน่งไม่เท่ากัน', 'มีจำนวนเต็ม', 'มากที่สุด'],
    tip: 'เทียบจำนวนเต็มก่อน ถ้าเท่ากัน เทียบหลังจุดทีละตำแหน่งจากซ้าย (เติม 0 ท้ายให้จำนวนตำแหน่งเท่ากันก่อนก็ได้ เช่น 0.5 = 0.50)',
    make(L, R) {
      if (L === 5) { const xs = []; while (xs.length < 4) { const s = decStr(R, 1, ri(R, 1, 2)); if (!xs.some(x => +x === +s)) xs.push(s); } const big = xs.reduce((m, s) => (+s > +m ? s : m)); return choiceQ('ทศนิยมใดมากที่สุด', [slot(0)], xs.map(s => ({ id: s, label: s })), big, 'เทียบจำนวนเต็มก่อน แล้วเทียบหลังจุดทีละตำแหน่ง', big + ' มากที่สุด'); }
      const dpA = L === 1 ? 1 : L === 2 ? 2 : ri(R, 1, 2), dpB = L === 3 ? 3 - dpA : dpA, ip = L === 4 ? 1 : 0, a = decStr(R, ip, dpA); let b = R() < 0.12 ? a : decStr(R, ip, dpB); if (ip && R() < 0.6) b = a.split('.')[0] + '.' + b.split('.')[1];
      const ans = +a > +b ? '>' : +a < +b ? '<' : '=';
      return choiceQ('เลือกเครื่องหมาย < = >', [a, ' ', slot(0), ' ', b], CMP_OPTS, ans, 'เติม 0 ท้ายให้ตำแหน่งเท่ากัน แล้วเทียบทีละหลักจากซ้าย', a + ' ' + cmpWord(ans) + ' ' + b, { cmp: true }); } });
  topic({ id: 'dadd', world: 'dec', th: 'ตั้งบวกลบทศนิยม', en: 'Add & subtract decimals', grade: 4, lv: ['บวก 1 ตำแหน่ง', 'ลบ 1 ตำแหน่ง', 'บวก 2 ตำแหน่ง', 'ลบ 2 ตำแหน่ง', 'ตำแหน่งไม่เท่ากัน'],
    tip: 'ตั้งจุดทศนิยมให้ตรงกัน (เติม 0 ท้ายให้ตำแหน่งเท่ากัน) แล้วบวกลบเหมือนจำนวนนับ ใส่จุดในผลลัพธ์ตรงกับจุดของตัวตั้ง',
    make(L, R) { const dpA = L <= 2 ? 1 : 2, dpB = L === 5 ? 1 : dpA, add = L === 5 ? R() < 0.5 : L % 2 === 1; let a = decStr(R, ri(R, 1, 2), dpA); const b = decStr(R, 1, dpB);
      if (!add && +a <= +b) a = (+b + ri(R, 2, 30) + 0.1).toFixed(dpA);
      return columnQ(add ? 'ตั้งบวกทศนิยม' : 'ตั้งลบทศนิยม', [a, b], add ? '+' : '-', L === 2); } });

  /* ===== ตลาดชีวิตจริง ===== */
  const COINS = [1, 2, 5, 10], NOTES = [20, 50, 100, 500, 1000];
  topic({ id: 'money', world: 'life', th: 'เงิน', en: 'Money', grade: 1, lv: ['นับเหรียญ', 'เหรียญและธนบัตร', 'เงินทอน', 'บาทกับสตางค์', 'เขียนเงินแบบมีจุด'],
    tip: '1 บาท = 100 สตางค์ · นับเงินเริ่มจากค่ามากไปค่าน้อย · เงินทอน = เงินที่จ่าย − ราคาของ · 12 บาท 50 สตางค์ เขียนได้ 12.50 บาท',
    make(L, R) {
      if (L <= 2) { const pool = L === 1 ? COINS : COINS.concat(NOTES.slice(0, 3)), k = ri(R, 3, L === 1 ? 6 : 5), items = Array.from({ length: k }, () => pick(R, pool)).sort((a, b) => b - a), sum = items.reduce((a, b) => a + b, 0);
        return typeQ('นับเงินทั้งหมด', ['รวมเป็นเงิน ', slot(0), ' บาท'], [{ ans: sum, ask: 'เริ่มนับจากค่ามากที่สุดก่อน', why: items.join(' + ') + ' = ' + sum + ' บาท' }], { fig: { kind: 'coins', items } }); }
      if (L === 3) { const pay = pick(R, [20, 50, 100, 500, 1000]), price = ri(R, Math.ceil(pay * 0.2), pay - 1); return typeQ('หาเงินทอน', ['ซื้อของราคา ' + comma(price) + ' บาท จ่ายด้วยธนบัตร ' + comma(pay) + ' บาท', { br: 1 }, 'ได้เงินทอน ', slot(0), ' บาท'], [{ ans: pay - price, ask: 'เงินทอน = เงินที่จ่าย − ราคา', why: comma(pay) + ' − ' + comma(price) + ' = ' + comma(pay - price) + ' บาท' }], { fig: { kind: 'coins', items: [pay] } }); }
      if (L === 4) { const b = ri(R, 1, 30), s = pick(R, [25, 50, 75, 10, 5, 95]); if (R() < 0.5) return typeQ('เปลี่ยนเป็นสตางค์', [b + ' บาท ' + s + ' สตางค์ = ', slot(0), ' สตางค์'], [{ ans: b * 100 + s, ask: '1 บาท = 100 สตางค์ ' + b + ' บาท = ? สตางค์', why: b + ' × 100 = ' + b * 100 + ' แล้วบวก ' + s + ' ได้ ' + (b * 100 + s) + ' สตางค์' }]);
        return typeQ('เปลี่ยนเป็นบาทและสตางค์', [(b * 100 + s) + ' สตางค์ = ', slot(0), ' บาท ', slot(1), ' สตางค์'], [{ ans: b, ask: 'ทุก 100 สตางค์ = 1 บาท', why: (b * 100 + s) + ' สตางค์ แยกเป็น ' + b * 100 + ' สตางค์ = ' + b + ' บาท' }, { ans: s, ask: 'ที่เหลือคือสตางค์', why: 'เหลือ ' + s + ' สตางค์' }]); }
      const b = ri(R, 1, 99), s = pick(R, [25, 50, 75, 5, 10, 60]), dec = b + '.' + String(s).padStart(2, '0');
      if (R() < 0.5) return typeQ('เขียนจำนวนเงินโดยใช้จุด', [b + ' บาท ' + s + ' สตางค์ = ', slot(0), ' บาท'], [{ ans: dec, num: true, w: dec.length + 1, ask: 'บาทอยู่หน้าจุด สตางค์เขียน 2 หลักหลังจุด', why: b + ' บาท ' + s + ' สตางค์ เขียนเป็น ' + dec + ' บาท' }]);
      return typeQ('อ่านจำนวนเงิน', [dec + ' บาท = ', slot(0), ' บาท ', slot(1), ' สตางค์'], [{ ans: b, ask: 'ตัวเลขหน้าจุดคือบาท', why: 'หน้าจุดคือ ' + b + ' บาท' }, { ans: s, ask: 'สองหลักหลังจุดคือสตางค์', why: 'หลังจุดคือ ' + String(s).padStart(2, '0') + ' สตางค์' }]); } });
  topic({ id: 'clock', world: 'life', th: 'เวลา', en: 'Time', grade: 2, lv: ['ชั่วโมงและครึ่งชั่วโมง', 'ทีละ 5 นาที', 'ทุกนาที', 'แปลงหน่วยเวลา', 'ระยะเวลา'],
    tip: 'เข็มสั้นบอกชั่วโมง เข็มยาวบอกนาที (ตัวเลขละ 5 นาที) · 1 ชั่วโมง = 60 นาที · 1 นาที = 60 วินาที · 1 วัน = 24 ชั่วโมง',
    make(L, R) {
      if (L <= 3) { const h = ri(R, 1, 12), m = L === 1 ? pick(R, [0, 30]) : L === 2 ? ri(R, 0, 11) * 5 : ri(R, 0, 59), mm = String(m).padStart(2, '0');
        return typeQ('นาฬิกาบอกเวลาเท่าไร', ['เวลา ', slot(0), ' . ', slot(1), ' น.'], [{ ans: h, num: true, ask: 'เข็มสั้นชี้เลขอะไร (ถ้าอยู่ระหว่างสองตัว ใช้ตัวที่เพิ่งผ่านมา)', why: 'เข็มสั้นชี้ ' + h + (m ? ' (เลยมาเล็กน้อย)' : '') + ' จึงเป็น ' + h + ' นาฬิกา' }, { ans: mm, num: true, w: 2, ask: 'เข็มยาวชี้ตัวเลขใด แต่ละตัวเลขคือ 5 นาที', why: 'เข็มยาว' + (m % 5 ? 'เลยเลข ' + (Math.floor(m / 5) || 12) + ' ไป ' + (m % 5) + ' ขีด ได้ ' : 'ชี้เลข ' + (m / 5 || 12) + ' = ') + m + ' นาที' }], { fig: { kind: 'clock', h, m } }); }
      if (L === 4) { const kinds = [['ชั่วโมง', 'นาที', 60], ['นาที', 'วินาที', 60], ['วัน', 'ชั่วโมง', 24], ['สัปดาห์', 'วัน', 7], ['ปี', 'เดือน', 12]], [a, b, k] = pick(R, kinds), n = ri(R, 2, 9);
        if (R() < 0.4 && k === 60) { const x = ri(R, 5, 55); return typeQ('แปลงหน่วยเวลา', [n + ' ' + a + ' ' + x + ' ' + b + ' = ', slot(0), ' ' + b], [{ ans: n * k + x, ask: '1 ' + a + ' = ' + k + ' ' + b + ' แล้วบวกส่วนที่เหลือ', why: n + ' × ' + k + ' = ' + n * k + ' บวก ' + x + ' = ' + (n * k + x) + ' ' + b }]); }
        return typeQ('แปลงหน่วยเวลา', [n + ' ' + a + ' = ', slot(0), ' ' + b], [{ ans: n * k, ask: '1 ' + a + ' = ' + k + ' ' + b, why: n + ' × ' + k + ' = ' + n * k + ' ' + b }]); }
      const h = ri(R, 6, 18), m = ri(R, 0, 11) * 5, d = pick(R, [15, 20, 25, 35, 40, 45, 50, 75, 90]), end = h * 60 + m + d, eh = Math.floor(end / 60), em = end % 60;
      return typeQ('หาเวลาที่เสร็จ', ['เริ่มทำการบ้านเวลา ' + h + '.' + String(m).padStart(2, '0') + ' น. ใช้เวลา ' + d + ' นาที', { br: 1 }, 'เสร็จเวลา ', slot(0), ' . ', slot(1), ' น.'], [{ ans: eh, num: true, ask: 'นับนาทีต่อจาก ' + m + ' ถ้าถึง 60 นาทีให้ขึ้นชั่วโมงใหม่', why: m + ' + ' + d + ' = ' + (m + d) + ' นาที' + (m + d >= 60 ? ' = ' + Math.floor((m + d) / 60) + ' ชั่วโมง ' + ((m + d) % 60) + ' นาที' : '') + ' จึงเป็น ' + eh + ' นาฬิกา' }, { ans: String(em).padStart(2, '0'), num: true, w: 2, ask: 'นาทีที่เหลือหลังขึ้นชั่วโมงใหม่', why: 'เสร็จเวลา ' + eh + '.' + String(em).padStart(2, '0') + ' น.' }]); } });
  topic({ id: 'measure', world: 'life', th: 'การวัด', en: 'Measurement', grade: 2, lv: ['อ่านไม้บรรทัด', 'เมตรกับเซนติเมตร', 'กิโลกรัมกับกรัม', 'ลิตรกับมิลลิลิตร', 'บวกความยาวต่างหน่วย'],
    tip: '1 เมตร = 100 เซนติเมตร · 1 กิโลกรัม = 1,000 กรัม · 1 ลิตร = 1,000 มิลลิลิตร · อ่านไม้บรรทัดจากปลายหนึ่งถึงอีกปลายหนึ่ง',
    make(L, R) {
      if (L === 1) { const a = R() < 0.6 ? 0 : ri(R, 1, 4), len = ri(R, 3, 10); return typeQ('ดินสอยาวกี่เซนติเมตร', ['ยาว ', slot(0), ' เซนติเมตร'], [{ ans: len, ask: a ? 'ปลายดินสอไม่ได้เริ่มที่ 0 ให้นำเลขปลายขวาลบเลขปลายซ้าย' : 'อ่านเลขที่ปลายดินสอ', why: a ? (a + len) + ' − ' + a + ' = ' + len + ' เซนติเมตร' : 'ปลายดินสออยู่ที่ ' + len + ' จึงยาว ' + len + ' เซนติเมตร' }], { fig: { kind: 'ruler', a, len } }); }
      if (L <= 4) { const [a, b, k] = [0, 0, ['เมตร', 'เซนติเมตร', 100], ['กิโลกรัม', 'กรัม', 1000], ['ลิตร', 'มิลลิลิตร', 1000]][L], n = ri(R, 1, 9), x = k === 100 ? ri(R, 5, 95) : pick(R, [50, 125, 250, 300, 500, 750, ri(R, 10, 990)]), mode = ri(R, 0, 2);
        if (mode === 0) return typeQ('แปลงหน่วย', [n + ' ' + a + ' = ', slot(0), ' ' + b], [{ ans: n * k, w: String(n * k).length + 1, ask: '1 ' + a + ' = ' + comma(k) + ' ' + b, why: n + ' × ' + comma(k) + ' = ' + comma(n * k) + ' ' + b }]);
        if (mode === 1) return typeQ('แปลงหน่วย', [n + ' ' + a + ' ' + x + ' ' + b + ' = ', slot(0), ' ' + b], [{ ans: n * k + x, w: String(n * k + x).length + 1, ask: 'เปลี่ยน ' + n + ' ' + a + ' เป็น' + b + 'ก่อน แล้วบวก ' + x, why: n + ' × ' + comma(k) + ' + ' + x + ' = ' + comma(n * k + x) + ' ' + b }]);
        return typeQ('แปลงหน่วย', [comma(n * k + x) + ' ' + b + ' = ', slot(0), ' ' + a + ' ', slot(1), ' ' + b], [{ ans: n, ask: 'ทุก ' + comma(k) + ' ' + b + ' = 1 ' + a, why: comma(n * k) + ' ' + b + ' = ' + n + ' ' + a }, { ans: x, ask: 'ส่วนที่เหลือเป็น' + b, why: 'เหลือ ' + x + ' ' + b }]); }
      const a1 = ri(R, 1, 5), b1 = ri(R, 10, 90), a2 = ri(R, 1, 4), b2 = ri(R, 10, 90), tb = b1 + b2, ca = a1 + a2 + Math.floor(tb / 100), cb = tb % 100;
      return typeQ('หาผลบวกความยาว', [a1 + ' ม. ' + b1 + ' ซม. + ' + a2 + ' ม. ' + b2 + ' ซม. = ', slot(0), ' ม. ', slot(1), ' ซม.'], [{ ans: ca, ask: 'บวกเซนติเมตรก่อน ' + b1 + ' + ' + b2 + ' ถ้าถึง 100 ทดเป็น 1 เมตร', why: b1 + ' + ' + b2 + ' = ' + tb + ' ซม.' + (tb >= 100 ? ' = 1 ม. ' + cb + ' ซม.' : '') + ' เมตรรวม ' + a1 + ' + ' + a2 + (tb >= 100 ? ' + 1' : '') + ' = ' + ca }, { ans: cb, ask: 'เซนติเมตรที่เหลือ', why: 'เหลือ ' + cb + ' ซม.' }]); } });
  const CHART_SETS = [['มะม่วง', 'กล้วย', 'ส้ม', 'แตงโม'], ['ฟุตบอล', 'ว่ายน้ำ', 'แบดมินตัน', 'วิ่ง'], ['สีแดง', 'สีฟ้า', 'สีเขียว', 'สีเหลือง'], ['แมว', 'สุนัข', 'ปลา', 'นก']];
  const CHART_TITLE = ['ผลไม้ที่นักเรียนชอบ', 'กีฬาที่นักเรียนชอบ', 'สีที่นักเรียนชอบ', 'สัตว์เลี้ยงของนักเรียน'];
  topic({ id: 'chart', world: 'life', th: 'อ่านแผนภูมิ', en: 'Charts', grade: 2, lv: ['รูปภาพ 1 รูปแทน 1', 'รูปภาพ 1 รูปแทนหลายคน', 'แผนภูมิแท่ง', 'มากกว่ากี่คน', 'รวมทั้งหมด'],
    tip: 'ดูว่าหนึ่งรูปหรือหนึ่งช่องแทนจำนวนเท่าไรก่อน แล้วนับ · ถามว่ามากกว่ากันเท่าไร ใช้การลบ · ถามว่ารวมกัน ใช้การบวก',
    make(L, R) { const si = ri(R, 0, 3), cats = CHART_SETS[si], unit = L === 1 ? 1 : L === 2 ? pick(R, [2, 5]) : pick(R, [2, 5, 10]), vals = cats.map(() => ri(R, 1, L === 1 ? 8 : 9) * unit);
      const fig = { kind: L <= 2 ? 'pict' : 'bars', cats, vals, unit, title: CHART_TITLE[si] }, i = ri(R, 0, 3);
      if (L <= 3) return typeQ('อ่านแผนภูมิ', [cats[i] + ' มีกี่คน  ', slot(0), ' คน'], [{ ans: vals[i], ask: L <= 2 ? (unit > 1 ? 'หนึ่งรูปแทน ' + unit + ' คน นับรูปแล้วคูณ ' + unit : 'นับรูปในแถว' + cats[i]) : 'ดูยอดแท่งเทียบกับเส้นตัวเลขด้านซ้าย', why: cats[i] + ' ' + (L <= 2 && unit > 1 ? (vals[i] / unit) + ' รูป × ' + unit + ' = ' : '') + vals[i] + ' คน' }], { fig });
      if (L === 4) { let j; do { j = ri(R, 0, 3); } while (vals[j] === vals[i]); const [x, y] = vals[i] > vals[j] ? [i, j] : [j, i]; return typeQ('อ่านแผนภูมิ', [cats[x] + ' มากกว่า ' + cats[y] + ' กี่คน  ', slot(0), ' คน'], [{ ans: vals[x] - vals[y], ask: 'อ่านค่าทั้งสองแล้วลบกัน', why: vals[x] + ' − ' + vals[y] + ' = ' + (vals[x] - vals[y]) + ' คน' }], { fig }); }
      const tot = vals.reduce((a, b) => a + b, 0); return typeQ('อ่านแผนภูมิ', ['นักเรียนทั้งหมดกี่คน  ', slot(0), ' คน'], [{ ans: tot, ask: 'อ่านค่าทุกแท่งแล้วบวกรวมกัน', why: vals.join(' + ') + ' = ' + tot + ' คน' }], { fig }); } });

  /* ===== ปราสาทโจทย์ ===== */
  topic({ id: 'order', world: 'mix', th: 'บวกลบคูณหารระคน', en: 'Order of operations', grade: 3, lv: ['บวกลบ 3 จำนวน', 'วงเล็บ', 'คูณก่อนบวก', 'หารก่อนลบ', 'ผสม'],
    tip: 'ทำในวงเล็บก่อน แล้วคูณหาร (จากซ้ายไปขวา) แล้วจึงบวกลบ (จากซ้ายไปขวา)',
    make(L, R) { let e, v, why, ask;
      if (L === 1) { const a = ri(R, 20, 60), b = ri(R, 5, 30), c = ri(R, 1, 20); e = a + ' + ' + b + ' − ' + c; v = a + b - c; ask = 'บวกลบจากซ้ายไปขวา'; why = a + ' + ' + b + ' = ' + (a + b) + ' แล้ว − ' + c + ' = ' + v; }
      else if (L === 2) { const a = ri(R, 2, 20), b = ri(R, 2, 20), c = ri(R, 2, 9); e = '(' + a + ' + ' + b + ') × ' + c; v = (a + b) * c; ask = 'ทำในวงเล็บก่อน'; why = 'ในวงเล็บก่อน ' + a + ' + ' + b + ' = ' + (a + b) + ' แล้ว × ' + c + ' = ' + v; }
      else if (L === 3) { const a = ri(R, 2, 50), b = ri(R, 2, 9), c = ri(R, 2, 9); e = a + ' + ' + b + ' × ' + c; v = a + b * c; ask = 'คูณก่อนบวก'; why = 'คูณก่อน ' + b + ' × ' + c + ' = ' + b * c + ' แล้ว ' + a + ' + ' + b * c + ' = ' + v; }
      else if (L === 4) { const c = ri(R, 2, 9), q = ri(R, 2, 9), a = ri(R, q + 1, 60); e = a + ' − ' + (c * q) + ' ÷ ' + c; v = a - q; ask = 'หารก่อนลบ'; why = 'หารก่อน ' + c * q + ' ÷ ' + c + ' = ' + q + ' แล้ว ' + a + ' − ' + q + ' = ' + v; }
      else { const a = ri(R, 2, 9), b = ri(R, 2, 9), c = ri(R, 10, 40), d = ri(R, 2, 5); e = a + ' × ' + b + ' + (' + c + ' − ' + d + ')'; v = a * b + (c - d); ask = 'วงเล็บก่อน แล้วคูณ แล้วบวก'; why = 'วงเล็บ ' + c + ' − ' + d + ' = ' + (c - d) + ' · คูณ ' + a + ' × ' + b + ' = ' + a * b + ' · บวกกันได้ ' + v; }
      return typeQ('หาผลลัพธ์ (ทำตามลำดับ)', [e + ' = ', slot(0)], [{ ans: v, ask, why }]); } });
  const WORD = [
    [R => { const a = ri(R, 12, 60), b = ri(R, 5, 30); return { t: 'น้องมีลูกแก้ว ' + a + ' ลูก แม่ให้เพิ่มอีก ' + b + ' ลูก น้องมีลูกแก้วทั้งหมดกี่ลูก', v: a + b, unit: 'ลูก', e: a + ' + ' + b, k: 'รวมกัน ใช้การบวก' }; },
      R => { const a = ri(R, 100, 400), b = ri(R, 50, 300); return { t: 'ห้องสมุดมีหนังสือนิทาน ' + a + ' เล่ม หนังสือการ์ตูน ' + b + ' เล่ม มีหนังสือทั้งหมดกี่เล่ม', v: a + b, unit: 'เล่ม', e: a + ' + ' + b, k: 'รวมกัน ใช้การบวก' }; }],
    [R => { const a = ri(R, 40, 99), b = ri(R, 10, a - 5); return { t: 'มีไข่ ' + a + ' ฟอง ทำขนมใช้ไป ' + b + ' ฟอง เหลือไข่กี่ฟอง', v: a - b, unit: 'ฟอง', e: a + ' − ' + b, k: 'เหลือ ใช้การลบ' }; },
      R => { const a = ri(R, 120, 500), b = ri(R, 30, 110); return { t: 'ต้นมะพร้าวสูง ' + a + ' เซนติเมตร ต้นกล้วยสูง ' + b + ' เซนติเมตร ต้นมะพร้าวสูงกว่ากี่เซนติเมตร', v: a - b, unit: 'เซนติเมตร', e: a + ' − ' + b, k: 'หาผลต่าง ใช้การลบ' }; }],
    [R => { const a = ri(R, 3, 9), b = ri(R, 4, 12); return { t: 'ห้องเรียนมีโต๊ะ ' + a + ' แถว แถวละ ' + b + ' ตัว มีโต๊ะทั้งหมดกี่ตัว', v: a * b, unit: 'ตัว', e: a + ' × ' + b, k: 'กลุ่มละเท่ากันหลายกลุ่ม ใช้การคูณ' }; },
      R => { const a = ri(R, 12, 45), b = ri(R, 3, 9); return { t: 'ดินสอกล่องละ ' + a + ' แท่ง มี ' + b + ' กล่อง มีดินสอทั้งหมดกี่แท่ง', v: a * b, unit: 'แท่ง', e: a + ' × ' + b, k: 'กลุ่มละเท่ากันหลายกลุ่ม ใช้การคูณ' }; }],
    [R => { const b = ri(R, 3, 9), q = ri(R, 3, 12); return { t: 'มีขนม ' + b * q + ' ชิ้น แบ่งให้เพื่อน ' + b + ' คนเท่า ๆ กัน ได้คนละกี่ชิ้น', v: q, unit: 'ชิ้น', e: (b * q) + ' ÷ ' + b, k: 'แบ่งเท่า ๆ กัน ใช้การหาร' }; },
      R => { const b = ri(R, 4, 8), q = ri(R, 5, 15); return { t: 'นักเรียน ' + b * q + ' คน จัดกลุ่มละ ' + b + ' คน ได้กี่กลุ่ม', v: q, unit: 'กลุ่ม', e: (b * q) + ' ÷ ' + b, k: 'จัดกลุ่มละเท่ากัน ใช้การหาร' }; }],
    [R => { const p = ri(R, 12, 45), n = ri(R, 2, 6), m = pick(R, [100, 200, 500]); return { t: 'ซื้อดินสอแท่งละ ' + p + ' บาท ' + n + ' แท่ง จ่ายเงิน ' + m + ' บาท ได้เงินทอนกี่บาท', v: m - p * n, unit: 'บาท', e: m + ' − (' + p + ' × ' + n + ')', k: 'สองขั้น: หาราคารวมด้วยการคูณ แล้วหาเงินทอนด้วยการลบ' }; },
      R => { const a = ri(R, 20, 60), b = ri(R, 2, 5), c = ri(R, 5, 25); return { t: 'มีลูกอม ' + a + ' เม็ด ได้เพิ่มอีก ' + b + ' ถุง ถุงละ ' + c + ' เม็ด มีลูกอมทั้งหมดกี่เม็ด', v: a + b * c, unit: 'เม็ด', e: a + ' + (' + b + ' × ' + c + ')', k: 'สองขั้น: คูณหาลูกอมในถุงก่อน แล้วบวก' }; }]
  ];
  topic({ id: 'word', world: 'mix', th: 'โจทย์ปัญหา', en: 'Word problems', grade: 1, lv: ['บวก', 'ลบ', 'คูณ', 'หาร', 'สองขั้นตอน'],
    tip: 'อ่านโจทย์ หาว่าโจทย์ถามอะไร ให้อะไรมา แล้วเลือกวิธีคิด: รวมกัน = บวก · เหลือหรือต่างกัน = ลบ · กลุ่มละเท่ากันหลายกลุ่ม = คูณ · แบ่งเท่ากัน = หาร',
    make(L, R) { let w; do { w = pick(R, WORD[L - 1])(R); } while (w.v <= 0);
      return typeQ('อ่านโจทย์แล้วหาคำตอบ', [w.t, { br: 1 }, 'ตอบ ', slot(0), ' ' + w.unit], [{ ans: w.v, ask: w.k, why: 'ประโยคสัญลักษณ์ ' + w.e + ' = ' + w.v + ' ' + w.unit }], { long: true }); } });
  topic({ id: 'speed', world: 'mix', th: 'คิดเลขเร็ว', en: 'Speed math', grade: 1, speed: true, lv: ['ป.1 บวกลบถึง 20', 'ป.2 บวกลบ 2 หลัก', 'ป.3 สูตรคูณและหาร', 'ป.4 คูณหารจำนวนเต็มสิบ', 'ผสมทุกอย่าง'],
    tip: 'ตอบให้เร็วและแม่นภายใน 60 วินาที ตอบถูกติดกันได้คอมโบ ยิ่งตอบเร็วไรเดอร์ยิ่งโจมตีแรง',
    make(L, R) { const k1 = [['addh', 2], ['subh', 2]], k2 = [['addh', 4], ['subh', 4], ['addh', 3]], k3 = [['times', ri(R, 1, 5)], ['divf', ri(R, 1, 3)]], k4 = [['times', 5], ['divf', 5], ['mul10', ri(R, 1, 4)]];
      const [tid, lv] = pick(R, [k1, k2, k3, k4, k1.concat(k2, k3, k4)][L - 1]), q = TOP[tid].make(lv, R); q.head = 'คิดเลขเร็ว · ' + q.head; q.fast = true; return q; } });

  /* ===== คิดเลขเร็ว โหมดกำหนดเอง (ผู้ใช้ขอ 26 ต.ค. 2569): เลือกวิธี บวก ลบ คูณ หาร (หลายอย่างได้) ระดับชั้น ป.1–ป.4 จำนวนข้อ และจับเวลาหรือไม่ =====
     แต่ละวิธีมีชุดหัวข้อ [หัวข้อ, ระดับ] ตามชั้น สุ่มวิธีก่อนแล้วสุ่มหัวข้อ จึงได้สัดส่วนวิธีละเท่า ๆ กัน */
  const SPEED_OPS = [
    { id: 'add', th: 'บวก', sym: '+', lv: ['ไม่เกิน 20', '2 หลัก', '2–3 หลัก', '3 หลัก + 2 หลัก'], pool: [[['addh', 1], ['addh', 2]], [['addh', 3], ['addh', 4]], [['addh', 4], ['addh', 5]], [['addh', 5]]] },
    { id: 'sub', th: 'ลบ', sym: '−', lv: ['ไม่เกิน 20', '2 หลัก', '2–3 หลัก', '3 หลัก − 2 หลัก'], pool: [[['subh', 1], ['subh', 2]], [['subh', 3], ['subh', 4]], [['subh', 4], ['subh', 5]], [['subh', 5]]] },
    { id: 'mul', th: 'คูณ', sym: '×', lv: ['แม่ 2 5 10', 'แม่ 2 ถึง 9', 'แม่ 2 ถึง 12 และ × 10', 'คูณเต็มสิบ เต็มร้อย'], pool: [[['times', 1]], [['times', 1], ['times', 2], ['times', 3], ['times', 4]], [['times', 5], ['mul10', 1]], [['times', 5], ['mul10', 2], ['mul10', 3], ['mul10', 4]]] },
    { id: 'div', th: 'หาร', sym: '÷', lv: ['หาร 2 5 10', 'หาร 2 ถึง 9', 'หาร 6 ถึง 9 และผสม', 'หารผสม ผลหารถึง 12'], pool: [[['divf', 1]], [['divf', 1], ['divf', 2], ['divf', 3]], [['divf', 3], ['divf', 5]], [['divf', 5]]] }
  ];
  function speedQ(ops, grade, R) {
    const list = SPEED_OPS.filter(o => ops.indexOf(o.id) >= 0), op = pick(R, list.length ? list : SPEED_OPS), g = Math.max(1, Math.min(4, grade || 1)), tl = pick(R, op.pool[g - 1]);
    const q = make(tl[0], tl[1], R); q.head = 'คิดเลขเร็ว · ' + q.head; q.fast = true; q.op = op.id; return q;
  }
  // ชุดโจทย์ n ข้อ ไม่ซ้ำกัน (ถ้าโจทย์ที่เป็นไปได้มีน้อยกว่า n เช่น บวกไม่เกิน 20 จึงยอมให้ซ้ำแต่ไม่ติดกัน)
  function speedSet(ops, grade, n, seed) {
    const R = rng(seed), out = [], seen = new Set(), key = q => JSON.stringify(q.q);
    for (let k = 0; out.length < n && k < n * 40; k++) { const q = speedQ(ops, grade, R), kk = key(q); if (seen.has(kk)) continue; seen.add(kk); out.push(q); }
    while (out.length < n) { const q = speedQ(ops, grade, R); if (key(q) !== key(out[out.length - 1])) out.push(q); }
    return out;
  }

  const TOP = {}; T.forEach(t => { TOP[t.id] = t; });
  // โจทย์หนึ่งข้อ
  function make(topicId, level, R) { const t = TOP[topicId], q = t.make(level, R); q.topic = topicId; q.level = level; q.tip = t.tip; return q; }
  const QCOUNT = { column: 4, mul2: 3, sdiv: 4, ldiv: 3, shade: 6, choice: 8, type: 8 };
  // ชุดโจทย์ของด่าน (ไม่ซ้ำกัน) จำนวนข้อตามชนิดของวิธีทำ
  function set(topicId, level, seed, n) {
    const R = rng(seed), out = [], seen = new Set(), first = make(topicId, level, R); n = n || QCOUNT[first.mode] || 6;
    const key = q => JSON.stringify(q.q) + '|' + q.cells.map(c => c.ans).join(',') + '|' + JSON.stringify(q.fig || '');
    out.push(first); seen.add(key(first));
    for (let k = 0; out.length < n && k < n * 40; k++) { const q = make(topicId, level, R), kk = key(q); if (seen.has(kk)) continue; seen.add(kk); out.push(q); }
    while (out.length < n) out.push(make(topicId, level, R));
    return out;
  }
  // ตรวจช่องหนึ่ง (ไม่สนช่องว่าง/จุลภาค · ช่องที่ num = true เทียบค่า เช่น 0.5 = 0.50 และ 05 = 5)
  const norm = s => String(s).replace(/[\s,]/g, '');
  const check = (cell, val) => { const a = norm(val), b = norm(cell.ans); if (a === b) return true; if (cell.num && /^\d*\.?\d+$/.test(a) && /^\d*\.?\d+$/.test(b)) return Math.abs(parseFloat(a) - parseFloat(b)) < 1e-9; return false; };

  const api = { WORLDS, TOPICS: T, TOP, QCOUNT, SPEED_OPS, speedQ, speedSet, make, set, check, norm, rng, thaiWords, naiveWords, thaiDigits, decWords, comma, columnQ, mul2Q, sdivQ, ldivQ, PLACE_TH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MG = api;
})(typeof window !== 'undefined' ? window : globalThis);
