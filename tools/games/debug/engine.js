/* Bug Buster: ตรรกะของเกม (ไม่แตะภาพ) ใช้ทั้งในเกมและในการทดสอบด้วย Node */
(function (root) {
  'use strict';
  let D = null;
  const bind = d => { D = d; };
  const rngOf = seed => { if (seed == null) return Math.random; let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const shuffle = (arr, rng) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // เตรียมโจทย์หนึ่งข้อ: สลับลำดับตัวเลือก จำตำแหน่งคำตอบที่ถูก (ans) และบรรทัดหลังแก้ (fixed)
  function prepare(r, rng) {
    const order = shuffle([0, 1, 2], rng), opts = order.map(i => r.opts[i]), ans = order.indexOf(0);
    const fixed = r.lines.slice(); fixed[r.bug] = r.opts[0].replace(/\s+$/, '');
    return Object.assign({}, r, { shown: opts, ans, fixedLines: fixed });
  }
  // โจทย์ของด่าน: ด่าน 1 เรียงตามบทสอน ด่าน 10 สุ่ม 8 ข้อจากด่าน 4-9 ด่านอื่นสลับลำดับ
  function roundsFor(lv, rng) {
    rng = rng || Math.random;
    let list;
    if (lv === 1) list = D.ROUNDS.filter(r => r.lv === 1);
    else if (lv === 10) list = shuffle(D.ROUNDS.filter(r => r.lv >= 4 && r.lv <= 9), rng).slice(0, 8);
    else list = shuffle(D.ROUNDS.filter(r => r.lv === lv), rng);
    return list.map(r => prepare(r, rng));
  }
  const checkLine = (r, i) => i === r.bug;
  const checkOption = (r, k) => k === r.ans;
  const points = (streak, frac) => 100 * Math.min(5, 1 + Math.floor(streak / 2)) + Math.round(60 * Math.max(0, Math.min(1, frac || 0)));
  const formTier = streak => (streak >= 6 ? 3 : streak >= 4 ? 2 : streak >= 2 ? 1 : 0);
  const accuracy = (rounds, mistakes) => Math.round(rounds * 100 / Math.max(1, rounds + mistakes));
  const stars = (win, acc) => (!win ? 0 : acc >= 90 ? 3 : acc >= 70 ? 2 : 1);
  const secsFor = lv => [0, 60, 54, 51, 51, 51, 51, 48, 48, 45][lv - 1] || 45;

  // แยกคำในบรรทัดโค้ดเพื่อไฮไลต์สี ต่อกลับต้องได้บรรทัดเดิมเป๊ะ
  const KW = new Set(['if', 'elif', 'else', 'for', 'while', 'in', 'def', 'return', 'and', 'or', 'not', 'break', 'pass', 'True', 'False', 'None']);
  const FN = new Set(['print', 'range', 'len', 'str', 'int', 'float']);
  function tokenize(line) {
    const out = []; const re = /(\s+)|(#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\d+\.?\d*)|([A-Za-z_][A-Za-z_0-9]*)|(==|!=|<=|>=|\*\*|\/\/|[-+*\/%=<>:,.()\[\]{}!])|(.)/g; let m;
    while ((m = re.exec(line))) {
      if (m[1]) out.push({ t: 'ws', s: m[1] }); else if (m[2]) out.push({ t: 'cm', s: m[2] }); else if (m[3]) out.push({ t: 'str', s: m[3] });
      else if (m[4]) out.push({ t: 'num', s: m[4] }); else if (m[5]) out.push({ t: KW.has(m[5]) ? 'kw' : FN.has(m[5]) ? 'fn' : 'id', s: m[5] });
      else out.push({ t: 'op', s: m[0] });
    }
    return out;
  }
  const api = { bind, rngOf, shuffle, prepare, roundsFor, checkLine, checkOption, points, formTier, accuracy, stars, secsFor, tokenize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BB = api;
})(typeof window !== 'undefined' ? window : globalThis);
