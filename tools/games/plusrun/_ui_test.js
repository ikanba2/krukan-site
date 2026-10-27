/* ตัวช่วยทดสอบในเบราว์เซอร์ของสมบัติพลังบวก (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/plusrun/_ui_test.js')).text())
   __lv(โลก, ด่าน, เร่ง) เริ่มด่าน (เร่ง = ตัวคูณเวลา) แล้วเปิดโหมดบอท (e.auto: วิ่งขวา กระโดดข้ามหลุมหนามเมือก และวาร์ปไปเก็บลูกพลังที่ถูก)
   __bot(ฉาก, มิลลิวินาทีสูงสุด) รอจนจบด่าน · __world(โลก, เร่ง) เล่นทั้งโลก */
(function () {
  window.__lv = async (w, l, fast) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } const s = g.getScene('Play'); s.eng.auto = true; if (fast) { s.time.timeScale = fast; s.tweens.timeScale = fast; } return s;
  };
  window.__bot = async (s, maxMs) => {
    const t0 = performance.now(); let n = 0; const e = s.eng;
    while (!s.over && performance.now() - t0 < (maxMs || 30000)) { await __frames(10); n++; }
    return [s.over, 'gates ' + e.cleared + '/' + e.gates.length, 'hearts ' + e.hearts + '/' + e.maxHearts, 'hits ' + e.stats.hits + ' falls ' + e.stats.falls + ' stomps ' + e.stats.stomps, 'x ' + Math.round(e.pl.x) + '/' + Math.round(e.endX)];
  };
  window.__world = async (w, fast) => { const out = []; const W = PR_LV.WORLDS[w]; for (let l = 0; l < W.levels.length; l++) { const s = await __lv(w, l, fast || 2); const r = await __bot(s, 30000); out.push(w + '-' + l + ':' + r.join(' ')); } return out; };
  window.__state = () => { const s = KG.game.scene.getScene('Play'), e = s.eng; return { over: s.over, done: s.done, goal: s.goal, mist: s.mist, running: s.running, hearts: e && e.hearts, x: e && Math.round(e.pl.x) }; };
})();
