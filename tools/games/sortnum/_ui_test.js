/* ตัวช่วยทดสอบในเบราว์เซอร์ของเรียงลำดับตัวเลข (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/sortnum/_ui_test.js')).text())
   __lv(โลก, ด่าน) เริ่มด่านแล้วรอจนนับถอยหลังจบ คืนฉากเล่น · __bot(ฉาก, มิลลิวินาทีสูงสุด, wrong) บอทเล่นจนจบด่าน (wrong = ทำผิดก่อนหนึ่งครั้งต่อรอบ) */
(function () {
  window.__lv = async (w, l) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } return g.getScene('Play');
  };
  // ทำโจทย์ของรอบปัจจุบันหนึ่งก้าว (wrong = ทำผิดก่อนหนึ่งครั้งเพื่อทดสอบการแจ้งผิด)
  window.__step = async (e, wrong) => {
    if (!e.running || e.busy) return;
    if (e.curKind === 'sort') {
      const i = e.nextFree(); if (i < 0) return;
      if (wrong && !e.didWrong) { const w = e.tiles.find(t => !t.dd.locked && t.dd.v !== e.q.sorted[i]); if (w) { e.didWrong = true; e.tapTile(w); return 'wrong'; } }
      const t = e.tiles.find(o => !o.dd.locked && o.dd.v === e.q.sorted[i]);
      if (e.round % 2) e.tapTile(t); else { e.dragStart({}, t); t.x = e.slots[i].x; t.y = e.slots[i].y; t.dd.moved = true; e.dragEnd({}, t); }
    } else if (e.chooser) {
      const shown = e.q.shown, ch = e.chooser;
      if (wrong && !e.didWrong) { const k = shown.findIndex(v => v !== e.q.ans); e.didWrong = true; ch.pick(k); return 'wrong'; }
      ch.pick(shown.indexOf(e.q.ans));
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
  window.__state = () => { const s = KG.game.scene.getScene('Play'); return { over: s.over, done: s.done, goal: s.goal, mist: s.mist, running: s.running, kind: s.eng && s.eng.curKind, round: s.eng && s.eng.round }; };
})();
