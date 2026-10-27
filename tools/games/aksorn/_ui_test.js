/* ตัวช่วยทดสอบหน้าจอ Techno Aksorn ในเบราว์เซอร์ (ใช้คู่กับ ../_harness.js): โหลดด้วย
   (0, eval)(await (await fetch('/tools/games/aksorn/_ui_test.js')).text())
   __go(ฉาก, ข้อมูล) ไปฉากแล้วปิดกล่องแนะนำ · __solve(กิจกรรม, บทเรียน, ระดับ) เล่นเฉลยผ่านฟังก์ชันของฉากจริงจนจบ แล้วคืนสถานะ */
(function () {
  const sc = k => KG.game.scene.getScene(k);
  const KEY = 'krukan_game_aksorn_v1';
  window.__go = async (key, data) => { const s = KG.game.scene.getScenes(true)[0]; s.scene.start(key, data); await __frames(90); await __settle(); const c = sc(key); if (c._modal) { c._modal.close(); await __settle(); } return c; };
  const save = () => JSON.parse(localStorage.getItem(KEY) || '{}');
  const SCENE = { learn: 'Learn', trace: 'Trace', listen: 'Listen', match: 'Match', balloon: 'Shooter', fish: 'Shooter', memory: 'Memory', classsort: 'Sort', lengthsort: 'Sort', compose: 'Compose', change: 'Change', tlisten: 'Quiz', tname: 'Quiz', mlisten: 'Quiz', mpic: 'Quiz', mfill: 'Quiz', slisten: 'Quiz', spic: 'Quiz', sheard: 'Quiz', sfill: 'Quiz', tsort: 'Sort', msort: 'Sort', lsort: 'Sort', cquiz: 'Quiz', lquiz: 'Quiz', sbuild: 'Order', sletters: 'Order', sentbuild: 'Order' };
  const solvers = {
    async learn(s) { for (let i = 0; i < 40 && !s._modal; i++) { s.advance(); await __frames(20); } },
    async trace(s) {
      for (let g = 0; g < 10 && !s.done && !s._modal; g++) {
        const gi = s.gi; await __frames(10);
        for (let k = 0; k < s.strokes.length; k++) {
          const st = s.strokes[k]; s.cancelDemo(); const p0 = { worldX: st.pts[0].x, worldY: st.pts[0].y, id: 1, isDown: true }; s.onDown(p0);
          for (let i = 1; i < st.pts.length; i++) { s.onMove({ worldX: st.pts[i].x, worldY: st.pts[i].y, id: 1, isDown: true }); }
          s.onUp({ id: 1 }); await __frames(8);
        }
        if (s.freeMode) s.finishFree();   // เขียนอิสระ: ลากครบแล้วกด ‘เขียนเสร็จแล้ว’
        await __frames(120); await __settle(); if (s.gi === gi && !s.done && !s._modal && !s.writeMode) break;
        if (s.writeMode) break;
      }
      await __frames(60);
    },
    async listen(s) { for (let r = 0; r < s.rounds.length; r++) { await __frames(30); const c = s.cards.find(k => k.key === s.target); s.choose(c); await __frames(90); } await __frames(80); },
    async balloon(s) { await solvers.shooter(s); },
    async fish(s) { await solvers.shooter(s); },
    async shooter(s) {
      for (let n = 0; n < 900 && !s.done && !s._modal; n++) { await __frames(6); const it = !s.locked && s.items.find(i => i.tgt && i.c.y > 200 && i.c.x > 60 && i.c.x < 1220); if (it) s.pop(it); }
      await __frames(60);
    },
    async match(s) { for (let r = 0; r < s.rounds.length; r++) { for (const sl of s.slots.slice()) { const c = s.chips.find(k => k.key === sl.key); s.tryPlace(c, sl); await __frames(10); } await __frames(110); } await __frames(60); },
    async memory(s) {
      for (let g = 0; g < 8 && !s.done; g++) { const rest = s.cards.filter(c => !c.matched); if (!rest.length) break; const a = rest[0], b = rest.find(c => c !== a && c.cd.pair === a.cd.pair); s.flip(a); await __frames(30); s.flip(b); await __frames(80); }
      await __frames(60);
    },
    async sort(s) { for (const it of s.set.items) { s.tryPlace(s.cardOf[it.key], it.g); await __frames(12); } await __frames(80); },
    async classsort(s) { await solvers.sort(s); },
    async lengthsort(s) { await solvers.sort(s); },
    async change(s) { for (let r = 0; r < s.rounds.length; r++) { await __frames(20); const c = s.opts.find(k => k.w === s.R.word); s.choose(c); await __frames(150); } await __frames(80); },
    async quiz(s) { for (let r = 0; r < s.rounds.length; r++) { await __frames(30); const c = s.cards.find(k => k.o.id === s.R.answer); s.choose(c); await __frames(150); } await __frames(80); },
    async order(s) { for (let r = 0; r < s.rounds.length; r++) { await __frames(40); const R = s.R; for (let k = 0; k < R.tokens.length; k++) { const c = s.tiles.find(q => !q.placed && q.t === R.tokens[k]); s.tryPlace(c, s.slots[k]); await __frames(14); } await __frames(190); } await __frames(80); },
    async compose(s) { for (let r = 0; r < s.rounds.length; r++) { await __frames(30); const c = s.opts.find(k => k.v === s.R.v); s.choose(c); await __frames(110); } await __frames(80); }
  };
  ['tlisten', 'tname', 'cquiz', 'lquiz', 'mlisten', 'mpic', 'mfill', 'slisten', 'spic', 'sheard', 'sfill'].forEach(k => { solvers[k] = solvers.quiz; }); ['sbuild', 'sletters', 'sentbuild'].forEach(k => { solvers[k] = solvers.order; }); ['tsort', 'msort', 'lsort'].forEach(k => { solvers[k] = solvers.sort; });
  // เล่นกิจกรรมหนึ่งจนจบด้วยการตอบถูกทุกข้อ แล้วคืนผล (done = จบ, star = ดาวที่บันทึก)
  window.__solve = async (act, lesson, level) => {
    const d = save(); d.level = level == null ? (d.level || 0) : level; localStorage.setItem(KEY, JSON.stringify(d));
    __errs.length = 0; const s = await __go(SCENE[act], { lesson, act }); await solvers[act](s); await __settle();
    const st = save(); return { act, lesson, lv: d.level, done: s.done, m: s.mistakes, h: s.hints, star: (st.stars || {})[lesson + ':' + act] || null, modal: !!s._modal, errs: __errs.length };
  };
})();
