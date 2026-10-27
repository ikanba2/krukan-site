/* ตัวช่วยทดสอบหน้าจอ Techno Slice ในเบราว์เซอร์ (ใช้คู่กับ ../_harness.js): โหลดด้วย
   (0, eval)(await (await fetch('/tools/games/slice/_ui_test.js')).text())
   __solve(n) ลากตามเฉลยด้วยเมาส์จำลองไม่เกิน n ขั้น (ไม่ใส่ = จนจบ) คืนสถานะ
   __solveLv(โลก, ด่าน, seed?) เล่นเฉลยผ่าน tryDrop ของฉากจริงจนจบด่าน (เร็ว ใช้ทดสอบทั้งชุด)
   __solveRange([[โลก,ด่าน,seed?],...]) เรียกต่อกันหลายด่าน (ไม่เกิน ~8 ด่านต่อคำสั่ง แผงเบราว์เซอร์ค้างถ้านานไป) */
(function () {
  window.__solve = async n => {
    const ps = KG.game.scene.getScene('Play');
    for (let k = 0; k < (n || 99); k++) { const ops = SL.plan(ps.lv, ps.st); if (!ops.length || ps.done) break; const op = ops[0], v = ps.views[op.item], r = ps.zr[op.zone]; await __drag(v.x, v.y, r.x + r.w / 2, r.y + r.h / 2); await __settle(); }
    return { ops: ps.ops, mistakes: ps.mistakes, done: ps.done };
  };
  window.__solveLv = async (w, l, seed) => {
    await __play(w, l, seed); const ps = KG.game.scene.getScene('Play'); let guard = 0;
    while (!ps.done && guard++ < 80) { const ops = SL.plan(ps.lv, ps.st); if (!ops.length) break; const op = ops[0]; ps.tryDrop(op.item, op.zone); await __frames(3); }
    const saved = JSON.parse(localStorage.getItem('krukan_game_slice_v1') || '{}').stars || {};
    return { w, l, seed: seed || null, done: ps.done, mistakes: ps.mistakes, ops: ps.ops, par: ps.lv.par, star: saved[w + ':' + l] || null, errs: __errs.length };
  };
  window.__solveRange = async list => { const out = []; for (const [w, l, s] of list) out.push(await __solveLv(w, l, s)); return out; };
  return 'ui test ready';
})()
