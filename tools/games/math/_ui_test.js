/* ตัวช่วยทดสอบหน้าจอ Techno Math ในเบราว์เซอร์ (โหลดหลัง _harness.js):
   (0,eval)(await (await fetch('/tools/games/math/_ui_test.js')).text())
   __go(หัวข้อ, ระดับ) เปิดฉากเล่น (ข้ามหน้าต่างแนะนำ) · __key(code) กดปุ่มจริง · __solveQ(p, wrongFirst) ตอบข้อปัจจุบันด้วยคีย์บอร์ด · __hiK(k) ความละเอียดภาพ */
(function () {
  window.__hiK = async k => { KG.computeK = () => k; KG.relayout(); await __frames(40); await __settle(); };
  window.__key = async (code, o) => { window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ code, key: code, bubbles: true }, o || {}))); await __frames(2); window.dispatchEvent(new KeyboardEvent('keyup', Object.assign({ code, key: code, bubbles: true }, o || {}))); await __frames(2); };
  window.__go = async (topic, level) => {
    const s = KG.game.scene.getScenes(true)[0]; if (s) { s.scene.stop(); await __frames(5); }
    KG.game.scene.start('Play', { topic, level }); await __frames(60); await __settle();
    const p = KG.game.scene.getScene('Play');
    for (let k = 0; k < 20 && !p.cur; k++) { if (p._modal && !p._modal.closed && p.modalKeys && p.modalKeys.Space) { const f = p.modalKeys.Space; p.modalKeys = null; p._modal.close(); f(); } await __frames(10); await __wait(100); }
    await __settle(); return p;
  };
  const codeOf = ch => (ch === '.' ? 'Period' : 'Digit' + ch);
  // ตอบข้อปัจจุบันให้ครบด้วยการกดปุ่ม (wrongFirst = ใส่ผิดหนึ่งครั้งก่อนในช่องแรก)
  window.__solveQ = async (p, wrongFirst) => {
    const cur = p.cur, q = cur.q;
    if (q.mode === 'choice') { if (wrongFirst) { const w = q.opts.find(o => o.id !== q.cells[0].ans); p.pick(w.id); await __frames(10); } p.pick(q.cells[0].ans); await __frames(10); return; }
    if (q.mode === 'shade') { p.paper.live.set(q.target); await __key('Enter'); await __frames(10); return; }
    for (let i = 0; i < q.cells.length; i++) {
      if (cur.state !== 'play') break;
      const c = q.cells[cur.i];
      if (wrongFirst && i === 0) { const bad = c.ans === '9' ? '8' : '9'; if (q.mode === 'type') { await __key('Digit' + bad); await __key('Digit' + bad); await __key('Enter'); } else await __key('Digit' + bad); await __frames(40); await __wait(500); await __frames(10); }
      if (q.mode === 'type') { for (const ch of c.ans) await __key(codeOf(ch)); await __key('Enter'); } else await __key(codeOf(c.ans));
      await __frames(6);
    }
  };
  return 'math ui test ready';
})();
