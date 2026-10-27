/* ตัวช่วยทดสอบในเบราว์เซอร์ของเลขโรมัน (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/roman/_ui_test.js')).text())
   __lv(โลก, ด่าน) เริ่มด่านแล้วรอจนนับถอยหลังจบ · __bot(ฉาก, มิลลิวินาทีสูงสุด, wrong) บอทเล่นจนจบด่าน · __world(โลก, wrong) เล่นทั้งโลก */
(function () {
  window.__lv = async (w, l) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } return g.getScene('Play');
  };
  window.__step = async (e, wrong) => {
    if (!e.running || e.busy) return;
    if (e.mode === 'build') {
      const q = e.q; if (wrong && !e.didWrong) { e.didWrong = true; e.built = ['I']; if (q.roman === 'I') e.built = ['V']; e.redrawBuilt(); e.checkBuild(); e.built = []; e.redrawBuilt(); return 'wrong'; }
      if (e.built.join('') !== q.roman) { e.built = q.roman.split(''); e.redrawBuilt(); await __frames(2); } e.checkBuild(); return;
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
      await __step(e, wrong); await __frames(6); n++;
    }
    return [s.over, s.done + '/' + s.goal, 'mist ' + s.mist, 'it ' + n, kinds.join(',')];
  };
  window.__world = async (w, wrong) => { const out = []; const W = RM_LV.WORLDS[w]; for (let l = 0; l < W.levels.length; l++) { const s = await __lv(w, l); const r = await __bot(s, 25000, wrong); out.push(w + '-' + l + ':' + r[0] + ':' + r[1] + ':m' + r[2].slice(5)); if (!r[0]) break; } return out; };
  window.__state = () => { const s = KG.game.scene.getScene('Play'); return { over: s.over, done: s.done, goal: s.goal, mist: s.mist, running: s.running, kind: s.eng && s.eng.curKind, round: s.eng && s.eng.round }; };
})();
