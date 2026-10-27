/* ตัวช่วยทดสอบในเบราว์เซอร์ของบันไดงูบวกลบเลข (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/snake/_ui_test.js')).text())
   __lv(โลก, ด่าน, เร่ง) เริ่มด่าน (เร่ง = ตัวคูณความเร็วเวลา/ทวีน) · __bot(ฉาก, มิลลิวินาทีสูงสุด, wrong) บอทตอบถูกทุกตา (wrong = ตอบผิดก่อนหนึ่งครั้งต่อด่าน) · __world(โลก, wrong) */
(function () {
  window.__lv = async (w, l, fast) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } const s = g.getScene('Play'); if (fast) { s.time.timeScale = fast; s.tweens.timeScale = fast; } return s;
  };
  window.__step = async (e, wrong) => {
    if (!e.running || !e.waiting || e.over) return; const q = e.q, ch = e.chooser; if (!ch) return;
    if (wrong && !e.didWrong) { e.didWrong = true; ch.pick(q.opts.findIndex(v => v !== q.ans)); return 'wrong'; } ch.pick(q.opts.indexOf(q.ans));
  };
  window.__bot = async (s, maxMs, wrong) => {
    const t0 = performance.now(); let n = 0; const e = s.eng; if (wrong) e.didWrong = false;
    while (!s.over && performance.now() - t0 < (maxMs || 30000)) { await __step(e, wrong); await __frames(10); n++; }
    return [s.over, 'pos ' + e.players.map(p => p.pos).join('/') + ' of ' + e.n, 'mist ' + s.mist, 'it ' + n, 'win ' + (e.winner && e.winner.name)];
  };
  window.__world = async (w, wrong, fast) => { const out = []; const W = SL_LV.WORLDS[w]; for (let l = 0; l < W.levels.length; l++) { const s = await __lv(w, l, fast || 8); const r = await __bot(s, 30000, wrong); out.push(w + '-' + l + ':' + r[0] + ':' + r[1] + ':' + r[4].slice(4)); } return out; };
  window.__state = () => { const s = KG.game.scene.getScene('Play'); return { over: s.over, mist: s.mist, running: s.running, pos: s.eng && s.eng.players.map(p => p.pos), waiting: s.eng && s.eng.waiting }; };
})();
