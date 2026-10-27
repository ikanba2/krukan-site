/* ตัวช่วยทดสอบในเบราว์เซอร์ของภารกิจแป้นพิมพ์ (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/kbq/_ui_test.js')).text())
   __lv(โลก, ด่าน) เริ่มด่านแล้วรอจนนับถอยหลังจบ คืนฉากเล่น · __bot(ฉาก, มิลลิวินาทีสูงสุด, ผิดก่อนหนึ่งครั้ง) บอทกดปุ่มที่ถูกตาม eng.exp */
(function () {
  window.__lv = async (w, l) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } return g.getScene('Play');
  };
  // ส่งปุ่มเข้าตัวเกมเหมือนคีย์บอร์ดจริง (ผ่าน feed) · wrong = กดปุ่มผิดก่อนหนึ่งครั้งในรอบ
  window.__bot = async (s, maxMs, wrong) => {
    const t0 = performance.now(); let n = 0; const kinds = []; let lastKey = '';
    while (!s.over && performance.now() - t0 < (maxMs || 40000)) {
      const e = s.eng; if (e && e.curKind) { const k = e.round + ':' + e.curKind; if (lastKey !== k) { lastKey = k; kinds.push(e.curKind); e.didWrong = false; } }
      if (e && e.running && !e.busy) {
        if (wrong && !e.didWrong && e.exp && e.curKind !== 'light') { e.didWrong = true; e.feed(e.curKind === 'combo' ? 'KeyQ' : e.curKind === 'space' ? 'KeyQ' : (e.exp.code === 'KeyQ' ? 'KeyW' : 'KeyQ'), {}); }
        else if (e.exp) e.feed(e.exp.code, { shift: !!e.exp.shift, ctrl: !!e.exp.ctrl });
      }
      await __frames(5); n++;
    }
    return [s.over, s.done + '/' + s.goal, 'mist ' + s.mist, 'it ' + n, kinds.join(',')];
  };
  window.__state = () => { const s = KG.game.scene.getScene('Play'); return { over: s.over, done: s.done, goal: s.goal, mist: s.mist, running: s.running, kind: s.eng && s.eng.curKind, round: s.eng && s.eng.round, exp: s.eng && s.eng.exp }; };
})();
