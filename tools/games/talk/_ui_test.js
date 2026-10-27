/* ตัวช่วยทดสอบหน้าจอ Techno Talk ในเบราว์เซอร์ (ใช้คู่กับ ../_harness.js): โหลดด้วย
   (0, eval)(await (await fetch('/tools/games/talk/_ui_test.js')).text())
   __go(ฉาก, ข้อมูล) ไปฉากแล้วปิดกล่องแนะนำ · __solve(ชื่อกิจกรรม, หน่วย) เล่นเฉลยผ่านฟังก์ชันของฉากจริงจนจบ แล้วคืนสถานะ */
(function () {
  const sc = k => KG.game.scene.getScene(k);
  window.__go = async (key, data) => { const s = KG.game.scene.getScenes(true)[0]; s.scene.start(key, data); await __frames(90); await __settle(); const c = sc(key); if (c._modal) { c._modal.close(); await __settle(); } return __scenes(); };
  const stars = () => (JSON.parse(localStorage.getItem('krukan_game_talk_v1') || '{}').stars || {});
  const out = (act, unit, s) => ({ act, unit, done: s.done, m: s.mistakes, h: s.hints, star: stars()[unit + ':' + act] || null, errs: __errs.length });
  const solvers = {
    async learn(s) { for (let i = 0; i < 40 && !s._modal; i++) { s.advance(); await __frames(20); } },
    async rule(s) { for (let i = 0; i < 10 && !s._modal; i++) { s.advance(); await __frames(20); } },
    async sort(s) { for (const it of s.set.items) { s.tryPlace(s.cardOf[it.id], it.g); await __frames(12); } await __frames(80); },
    async match(s) { for (let r = 0; r < 2; r++) { for (const L of s.cards.filter(c => c.side === 'L' && !c.done)) { const R = s.cards.find(c => c.side === 'R' && c.pair.id === L.pair.id); s.tryPair(L, R); await __frames(6); } await __frames(110); } await __frames(80); },
    async flip(s) { const by = {}; s.cards.forEach(k => { (by[k.cd.pair] = by[k.cd.pair] || []).push(k); }); for (const p of Object.keys(by)) { s.flip(by[p][0]); await __frames(14); s.flip(by[p][1]); await __frames(70); } await __frames(80); },
    async build(s) { for (let r = 0; r < s.rounds.length; r++) { const b = s.cur; for (let j = 0; j < b.tokens.length; j++) { const tile = s.tiles.find(t => t.tile.text === b.tokens[j] && t.input && t.input.enabled); s.tryPlace(tile, s.slots[j]); await __frames(10); } await __frames(125); } await __frames(80); },
    // เขียนตามรอย: ส่งตำแหน่งนิ้วตามจุดของเส้นจริงทุกเส้นทุกตัวจนครบทุกคำ (wobble = เยื้องจากเส้นกี่พิกเซล)
    async write(s, wobble) {
      for (let guard = 0; guard < 400 && !s.done; guard++) {
        if (s.demoing) s.stopDemo(); const st = s.stroke(); if (!st) { await __frames(40); continue; }
        const P = (q, k) => ({ worldX: q.x + (wobble ? Math.sin(k) * wobble : 0), worldY: q.y + (wobble ? Math.cos(k) * wobble : 0) });
        s.onDown(P(st.pts[0], 0), []);
        if (!st.dot) { for (let i = 2; i < st.pts.length; i += 3) s.onMove(P(st.pts[i], i)); s.onMove(P(st.pts[st.pts.length - 1], 99)); s.onUp(); }
        await __frames(6);
      }
      await __frames(120);
    },
    async quiz(s) { for (let q = 0; q < s.qs.length; q++) { const c = s.btns.find(b => b.o.ok); s.choose(c); await __frames(110); } await __frames(80); }
  };
  window.__solve = async (act, unit) => {
    await __go(actKeyOf(act), { unit }); const s = sc(actKeyOf(act)); await solvers[act](s); if (s._modal) { await __settle(); }
    return out(act, unit, s);
  };
  const actKeyOf = a => ({ learn: 'Learn', rule: 'Rule', write: 'Write', sort: 'Sort', match: 'Match', flip: 'Flip', build: 'Build', quiz: 'Quiz' })[a];
  window.__solveWrite = async (cat, wobble) => { await __go('Write', { cat }); const s = sc('Write'); await solvers.write(s, wobble || 0); if (s._modal) await __settle(); const st = JSON.parse(localStorage.getItem('krukan_game_talk_v1') || '{}'); return { cat, done: s.done, m: s.mistakes, h: s.hints, combo: s.bestCombo, star: (st.write || {})[cat] || null, wrote: Object.keys(st.wrote || {}).length, errs: __errs.length }; };
  window.__solveUnit = async unit => { const r = []; for (const a of ['write', 'sort', 'match', 'flip', 'build', 'quiz']) r.push(await __solve(a, unit)); return r; };
  return 'ui test ready';
})()
