/* ตัวช่วยทดสอบในเบราว์เซอร์ของคิดเลขแสนสนุก (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/colmath/_ui_test.js')).text())
   __lv(โลก, ด่าน) เริ่มด่านแล้วรอจนนับถอยหลังจบ · __bot(ฉาก, มิลลิวินาทีสูงสุด, wrong) บอทเล่นจนจบด่าน · __world(โลก, wrong) เล่นทั้งโลก */
(function () {
  window.__lv = async (w, l) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } return g.getScene('Play');
  };
  window.__step = async (e, wrong) => {
    if (!e.running || e.busy) return;
    if (e.cmode) {
      const tg = e.target; if (!tg) return; const c = e.cells[e.cur];
      if (wrong && !e.didWrong) { e.didWrong = true; e.type(tg.type === 'carry' ? '7' : String((c.st.digit + 1) % 10)); return 'wrong'; }
      e.type(tg.type === 'carry' ? '1' : String(c.st.digit)); return;
    }
    if (e.chooser) {
      const shown = e.q.shown, ch = e.chooser, k = shown.findIndex(v => e.isRight(v));
      if (wrong && !e.didWrong) { const w = shown.findIndex(v => !e.isRight(v)); e.didWrong = true; ch.pick(w); return 'wrong'; } ch.pick(k);
    }
  };
  window.__bot = async (s, maxMs, wrong) => {
    const t0 = performance.now(); let n = 0, seen = {}; const kinds = [];
    while (!s.over && performance.now() - t0 < (maxMs || 30000)) {
      const e = s.eng; if (e && e.curKind && !seen[e.round + ':' + e.curKind]) { seen[e.round + ':' + e.curKind] = 1; kinds.push(e.curKind); if (wrong) e.didWrong = false; }
      await __step(e, wrong); await __frames(8); n++;
    }
    return [s.over, s.done + '/' + s.goal, 'mist ' + s.mist, 'it ' + n, kinds.join(',')];
  };
  window.__world = async (w, wrong) => { const out = []; const W = CM_LV.WORLDS[w]; for (let l = 0; l < W.levels.length; l++) { const s = await __lv(w, l); const r = await __bot(s, 25000, wrong); out.push(w + '-' + l + ':' + r[0] + ':' + r[1] + ':m' + r[2].slice(5)); if (!r[0]) break; } return out; };
  window.__state = () => { const s = KG.game.scene.getScene('Play'); return { over: s.over, done: s.done, goal: s.goal, mist: s.mist, running: s.running, kind: s.eng && s.eng.curKind, round: s.eng && s.eng.round }; };
})();
