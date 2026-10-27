/* ตัวช่วยทดสอบในเบราว์เซอร์ของจอมจังหวะ (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/beat/_ui_test.js')).text())
   __lv(โลก, ด่าน) เริ่มเพลงแล้วรอจนนับถอยหลังจบ คืนฉากเล่น
   __bot(ฉาก, มิลลิวินาทีสูงสุด, ออฟเซ็ตวินาที, อัตราพลาด) บอทกดตามโน้ต: ออฟเซ็ตทำให้กดช้า/เร็ว (0 = เป๊ะ) · อัตราพลาด = โอกาสที่จะข้ามโน้ตนั้น */
(function () {
  window.__lv = async (w, l) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } return g.getScene('Play');
  };
  window.__bot = async (s, maxMs, off, skip) => {
    const t0 = performance.now(), e = s.eng; let n = 0; const R = BCHART.rng(11), plan = new Map();
    while (!s.over && performance.now() - t0 < (maxMs || 90000)) {
      e.notes.forEach(nt => {
        if (!plan.has(nt.id)) plan.set(nt.id, { skip: R() < (skip || 0), pressed: false, rel: false });
        const p = plan.get(nt.id); if (p.skip || nt.state === 'wait') return;
        if (!p.pressed && nt.state === 'fly' && e.t >= nt.t + (off || 0)) { p.pressed = true; e.press(nt.lane); if (!nt.len) setTimeout(() => e.release(nt.lane), 0); }
        if (nt.len && p.pressed && !p.rel && e.t >= nt.t + nt.len) { p.rel = true; e.release(nt.lane); }
      });
      await __frames(1); n++;
    }
    const st = e.stats; return [s.over, 'acc ' + Math.round(e.acc * 100), 'P' + st.perfect + ' G' + st.great + ' O' + st.ok + ' M' + st.miss, 'combo ' + e.best, 'it ' + n, 'notes ' + e.total];
  };
  window.__state = () => { const s = KG.game.scene.getScene('Play'), e = s.eng; return { over: s.over, running: s.running, t: e && e.t.toFixed(2), total: e && e.total, stats: e && e.stats, combo: e && e.combo }; };
})();
