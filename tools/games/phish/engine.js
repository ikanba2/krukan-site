/* Net Patrol: ตรรกะของเกม (ไม่แตะภาพ) ใช้ทั้งในเกมและในการทดสอบด้วย Node */
(function (root) {
  'use strict';
  let D = null;
  const bind = d => { D = d; };

  // สุ่มแบบกำหนด seed ได้ (ทดสอบซ้ำได้) ถ้าไม่ส่งมาใช้ Math.random
  const rngOf = seed => { if (seed == null) return Math.random; let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const shuffle = (arr, rng) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const byId = id => D.CARDS.find(c => c.id === id);
  const cardsFor = lv => D.CARDS.filter(c => c.lv === lv);

  const maxRun = list => { let run = 1, mx = list.length ? 1 : 0; for (let k = 1; k < list.length; k++) { run = list[k].scam === list[k - 1].scam ? run + 1 : 1; mx = Math.max(mx, run); } return mx; };
  // จัดลำดับแบบสุ่มโดยไม่ให้คำตอบเดียวกันติดกันเกิน 3 ใบ: สร้างทีละใบ (ถ้าติดกัน 3 แล้วเลือกชนิดตรงข้าม) ลองซ้ำจนผ่าน
  function arrange(list, rng) {
    let best = null;
    for (let t = 0; t < 80; t++) {
      const rest = shuffle(list, rng), out = [];
      while (rest.length) {
        const n = out.length, run3 = n >= 3 && out[n - 1].scam === out[n - 2].scam && out[n - 2].scam === out[n - 3].scam;
        let i = run3 ? rest.findIndex(c => c.scam !== out[n - 1].scam) : 0; if (i < 0) i = 0;
        out.push(rest.splice(i, 1)[0]);
      }
      if (!best || maxRun(out) < maxRun(best)) best = out;
      if (maxRun(best) <= 3) break;
    }
    return best;
  }

  // กองการ์ดของด่าน: ด่าน 1 เรียงตามบทสอน ด่าน 10 สุ่ม 12 ใบจากด่าน 2-9 (อันตรายและปลอดภัยอย่างน้อยอย่างละ 4) ด่านอื่นสลับลำดับการ์ดของด่านนั้น
  function deck(lv, rng) {
    rng = rng || Math.random;
    if (lv === 1) return D.TUTORIAL.map(byId);
    if (lv === 10) {
      const pool = D.CARDS.filter(c => c.lv >= 2 && c.lv <= 9), bad = shuffle(pool.filter(c => c.scam), rng), good = shuffle(pool.filter(c => !c.scam), rng);
      const nBad = 5 + Math.floor(rng() * 3), pick = bad.slice(0, nBad).concat(good.slice(0, 12 - nBad));
      return arrange(pick, rng);
    }
    return arrange(cardsFor(lv), rng);
  }

  // ตัดสิน choice = 'block' | 'allow' | 'timeout'
  function judge(card, choice) {
    if (choice === 'timeout') return { ok: false, miss: 'timeout' };
    const ok = choice === 'block' ? card.scam : !card.scam;
    return { ok, miss: ok ? null : (card.scam ? 'passed' : 'blocked') };
  }
  const multiplier = streak => 1 + Math.min(4, Math.floor(streak / 3));
  const formTier = streak => (streak >= 9 ? 3 : streak >= 6 ? 2 : streak >= 3 ? 1 : 0);
  // คะแนนต่อใบ: ฐาน 100 x ตัวคูณคอมโบ + โบนัสตัดสินเร็ว (frac = เวลาที่เหลือ 0..1)
  const points = (streak, frac) => Math.round(100 * multiplier(streak) + 60 * Math.max(0, Math.min(1, frac || 0)));
  const timeLimit = (lv, mode) => (mode === 'time' ? D.LEVELS[lv - 1].sec : 0);
  const accuracy = (right, total) => (total ? Math.round(right * 100 / total) : 100);
  // ดาว: ผ่านด่าน (ไม่หมดหัวใจ) ได้ 1 ดาว แม่น >= 75% ได้ 2 ดาว แม่น >= 90% ได้ 3 ดาว
  const stars = (win, acc) => (!win ? 0 : acc >= 90 ? 3 : acc >= 75 ? 2 : 1);
  // สัญญาณเตือนที่พลาดบ่อยจากการ์ดที่ตอบผิด (เรียงมากไปน้อย)
  function missedClues(cards) {
    const n = {}; cards.forEach(c => c.tags.forEach(t => { n[t] = (n[t] || 0) + 1; }));
    return Object.keys(n).sort((a, b) => n[b] - n[a]);
  }

  const api = { bind, rngOf, shuffle, byId, cardsFor, deck, judge, multiplier, formTier, points, timeLimit, accuracy, stars, missedClues };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NP = api;
})(typeof window !== 'undefined' ? window : globalThis);
