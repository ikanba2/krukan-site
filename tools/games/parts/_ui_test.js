/* ตัวช่วยทดสอบหน้าจอ Techno Parts ในเบราว์เซอร์ (ใช้คู่กับ ../_harness.js): โหลดด้วย
   (0, eval)(await (await fetch('/tools/games/parts/_ui_test.js')).text())
   __solveLv(โลก, ด่าน, seed?) เล่นเฉลยผ่าน tryDrop ของฉากจริง คืน { done, mistakes, hints, stars }
   __solveRange([[โลก,ด่าน],...]) เรียกต่อกันหลายด่าน (ไม่เกิน ~8 ด่านต่อคำสั่ง) */
(function () {
  window.__solveLv = async (w, l, seed) => {
    await __play(w, l, seed); const ps = KG.game.scene.getScene('Play'); let guard = 0;
    while (!ps.done && guard++ < 60) { const ops = PT.plan(ps.lv, ps.st); if (!ops.length) break; const op = ops[0]; ps.tryDrop(op.item, op.zone); await __frames(3); }
    const saved = JSON.parse(localStorage.getItem('krukan_game_parts_v1') || '{}').stars || {};
    return { w, l, seed: seed || null, done: ps.done, mistakes: ps.mistakes, ops: ps.ops, par: ps.lv.par, star: saved[w + ':' + l] || null, errs: __errs.length };
  };
  window.__solveRange = async list => { const out = []; for (const [w, l, s] of list) out.push(await __solveLv(w, l, s)); return out; };
  return 'ui test ready';
})()
