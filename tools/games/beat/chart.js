/* ===== จอมจังหวะ: ตัวสร้างโน้ต (ไม่แตะภาพ ใช้ทั้งในเกมและในการทดสอบด้วย Node) =====
   BCHART.make(P, seed) คืน { notes: [{ beat, lane, len, pair }], beats } เรียงตามเวลา
   P: { lanes 1–4, bars, style: beat|rest|slow|eighth|sync|mix, pairs 0–1 (โอกาสกดสองปุ่มพร้อมกัน), holds 0–1 (โอกาสโน้ตยาว) }
   ทำให้ท่วงทำนองซ้ำเป็นวลี (บาร์ที่ 3–4 มักซ้ำบาร์ที่ 1–2) เด็กจะจำแบบได้ และโน้ตเลนเดียวกันห่างกันไม่ต่ำกว่าที่นิ้วกดทัน */
(function (root) {
  const rng = seed => { let s = (seed >>> 0) || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const GRID = {
    q4: [0, 1, 2, 3], q3a: [0, 1, 3], q3b: [0, 2, 3], q2: [0, 2], q2b: [0, 1], q1: [0], e8: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], e6: [0, 0.5, 1, 2, 2.5, 3], e5: [0, 1, 1.5, 2, 3],
    sy1: [0, 1.5, 2, 3.5], sy2: [0, 0.5, 2, 2.5], sy3: [0.5, 1.5, 2.5, 3.5]
  };
  const POOL = { beat: ['q4'], rest: ['q4', 'q3a', 'q3b', 'q4', 'q2'], slow: ['q2', 'q2b', 'q4', 'q3a'], hold: ['q2', 'q2', 'q2', 'q3a', 'q1', 'q2b'], eighth: ['e6', 'q4', 'e5', 'e8'], sync: ['q4', 'sy1', 'sy2', 'sy3', 'q3a'], mix: ['q4', 'e6', 'sy1', 'q3b', 'e5', 'sy2', 'e8'] };
  const TMPL = { 1: [[0]], 2: [[0, 1], [1, 0], [0, 0, 1, 1], [1, 1, 0, 0], [0, 1, 1, 0]], 3: [[0, 1, 2], [2, 1, 0], [0, 2, 1], [1, 0, 2, 1], [0, 1, 2, 1]], 4: [[0, 1, 2, 3], [3, 2, 1, 0], [0, 2, 1, 3], [1, 0, 3, 2], [0, 1, 0, 3], [2, 3, 1, 0]] };
  function make(P, seed) {
    const R = rng(seed || 7), L = Math.max(1, Math.min(4, P.lanes || 2)), bars = P.bars || 8, pool = POOL[P.style || 'beat'] || POOL.beat, tm = TMPL[L], plan = [];
    for (let b = 0; b < bars; b++) {
      if (b >= 2 && R() < 0.65) { plan.push(plan[b - 2]); continue; }
      const grid = GRID[pool[Math.floor(R() * pool.length)]], t = tm[Math.floor(R() * tm.length)]; plan.push({ grid, t });
    }
    const notes = [];
    plan.forEach((pb, b) => {
      pb.grid.forEach((off, i) => { const lane = pb.t[(i + (b % 2 === 1 && pb.t.length % 2 === 0 ? 0 : 0)) % pb.t.length]; notes.push({ beat: b * 4 + off, lane, len: 0, pair: false }); });
    });
    // เติมเลนที่ยังไม่ถูกใช้ในบาร์แรก ๆ ให้เด็กเห็นครบทุกเลน (ไม่เกินหนึ่งโน้ตต่อเลนที่ขาด)
    for (let ln = 0; ln < L; ln++) if (!notes.some(n => n.lane === ln) && notes.length) notes[Math.min(notes.length - 1, 2 + ln)].lane = ln;
    // โน้ตคู่: กดสองปุ่มพร้อมกัน (เลนนอกสุดหรือสุ่ม) ที่จังหวะหนักของบาร์
    if (L >= 2 && P.pairs) {
      const extra = [];
      notes.forEach(n => { if (n.beat % 2 === 0 && !n.pair && R() < P.pairs) { let l2 = n.lane === 0 ? L - 1 : (n.lane === L - 1 ? 0 : (n.lane + 1 + Math.floor(R() * (L - 1))) % L); if (l2 === n.lane) l2 = (n.lane + 1) % L; n.pair = true; extra.push({ beat: n.beat, lane: l2, len: 0, pair: true }); } });
      extra.forEach(e => notes.push(e));
    }
    notes.sort((a, b) => a.beat - b.beat || a.lane - b.lane);
    // โน้ตยาว: ช่องว่างข้างหน้ายาวพอ และเลนนั้นว่างตลอดความยาว
    if (P.holds) notes.forEach((n, i) => {
      if (n.pair || n.beat % 1 !== 0 || R() > P.holds) return; let gap = 99; for (let j = i + 1; j < notes.length; j++) if (notes[j].beat > n.beat) { gap = notes[j].beat - n.beat; break; }
      const len = Math.min(2, gap - 0.5); if (len >= 1) n.len = len;
    });
    return { notes, beats: bars * 4 };
  }
  root.BCHART = { make, rng, GRID, POOL };
})(typeof window !== 'undefined' ? window : globalThis);
