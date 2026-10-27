/* ตัวช่วยทดสอบในเบราว์เซอร์ของเมืองสีรุ้ง (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/rainbow/_ui_test.js')).text())
   __lv(โลก, ด่าน) เริ่มด่านแล้วรอจนนับถอยหลังจบ คืนฉากเล่น · __bot(ฉาก, มิลลิวินาทีสูงสุด, ผิดก่อนหนึ่งครั้ง) บอทเล่นให้ถูกทุกโจทย์ */
(function () {
  window.__lv = async (w, l) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } return g.getScene('Play');
  };
  const tapZ = o => o && o.z && o.z.emit('pointerdown');
  // ทำโจทย์ของรอบปัจจุบันหนึ่งก้าว (ถ้า wrong = ทำผิดก่อนหนึ่งครั้งเพื่อทดสอบการแจ้งผิด)
  window.__step = async (e, wrong) => {
    if (!e.running || e.busy) return; const k = e.curKind;
    if (['tapColor', 'tapShape', 'numeral', 'pattern', 'odd', 'big'].includes(k)) {
      if (wrong && !e.didWrong) { const w = e.items.find(i => !i.right && !i.dead); if (w) { e.didWrong = true; tapZ(w); return 'wrong'; } }
      tapZ(e.items.find(i => i.right && !i.dead));
    } else if (k === 'tapCount') tapZ(e.items.find(i => !i.dead));
    else if (k === 'more') e.moreZ.emit('pointerdown');
    else if (k === 'memory') {
      if (e.lock || e.flipped.length >= 2) return; const open = e.cards.filter(c => !c.matched && !c.faceUp);
      if (e.flipped.length === 1) { const a = e.flipped[0], b = open.find(c => c.it.id === a.it.id); if (b) e.flip(b, b.list[0], b.list[1]); }
      else if (wrong && !e.didWrong) { e.didWrong = true; const a = open[0], b = open.find(c => c.it.id !== a.it.id); e.flip(a, a.list[0], a.list[1]); e.flip(b, b.list[0], b.list[1]); }
      else { const a = open[0]; e.flip(a, a.list[0], a.list[1]); }
    } else if (k === 'connect') {
      const l = e.cL.find(o => !o.done), r = e.cR.find(o => o.c === l.c && !o.done);
      if (wrong && !e.didWrong) { e.didWrong = true; const r2 = e.cR.find(o => o.c !== l.c && !o.done); e.cDown({ worldX: l.x, worldY: l.y }); e.cUp({ worldX: r2.x, worldY: r2.y }); return 'wrong'; }
      e.cDown({ worldX: l.x, worldY: l.y }); e.cMove({ worldX: (l.x + r.x) / 2, worldY: l.y }); e.cUp({ worldX: r.x, worldY: r.y });
    } else {   // pair · shapeSlot · sort · basket · seq: ลากวาง
      const it = e.items.find(o => o.dd && !o.dd.locked && o.active); if (!it) return; const tg = e.targets.filter(g => !g.done), good = tg.find(g => g.accept(it)), bad = tg.find(g => !g.accept(it));
      const dest = wrong && !e.didWrong && bad ? (e.didWrong = true, bad) : good; if (!dest) return; e.dragStart({}, it); it.x = dest.x; it.y = dest.y; it.dd.moved = true; e.dragEnd({}, it); if (dest === bad) return 'wrong';
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
