/* ทดสอบ Techno Folder ผ่านหน้าจอจริงในเบราว์เซอร์ (ใช้ร่วมกับ tools/games/_harness.js)
   โหลด:  (0,eval)(await (await fetch('/tools/games/_harness.js')).text()); (0,eval)(await (await fetch('/tools/games/folder/_ui_test.js')).text())
   __solve(ps)        ให้ฉากเล่นเฉลยเองผ่านเมธอดของ UI (doMove/doPaste/doDelete/askName ฯลฯ) คืนรายการขั้นตอน
   __solveAll(ws)     เล่นเฉลยทุกด่านของโลกในรายการ ผลลัพธ์ที่ window.__out / __done (ตรวจด้วยการโพลทีละคำสั่ง ห้ามรอเกิน ~40 วินาทีต่อคำสั่ง) */
window.__solve = async ps => {
  const log = []; let guard = 0;
  while (!ps.done && guard++ < 40) {
    const ops = FD.plan(ps.lv, ps.fs); if (!ops.length) break; const op = ops[0]; log.push(op.t); const before = ps.mistakes;
    if (op.t === 'move') ps.doMove(op.ids, op.dest);
    else if (op.t === 'copy') { ps.sel = op.ids.slice(); ps.doCopyBtn(); ps.nav(op.dest); ps.doPaste(); }
    else if (op.t === 'del') ps.doDelete(op.ids);
    else if (op.t === 'restore') { ps.nav(FD.BIN); ps.sel = op.ids.slice(); ps.doRestoreBtn(); }
    else if (op.t === 'open') ps.nav(op.id);
    else if (op.t === 'answer') { ps.openQuiz(op.q); ps.closeDialog(); ps.fs.answers[op.q] = true; ps.okOp('ตอบถูก', true); }
    else if (op.t === 'new') { ps.nav(op.p); ps.doNewFolder(); const id = ps.sel[0]; ps.closeDialog(); if (!id || !ps.pickName(id, op.name)) { log.push('NEWFAIL'); break; } }
    else if (op.t === 'rename') { if (!ps.pickName(op.id, op.name)) { log.push('RENFAIL'); break; } }
    await __frames(3);
    if (ps.mistakes > before) { log.push('MISTAKE:' + ps.msgPlain); break; }
  }
  return log.join(',');
};
window.__solveAll = async ws => {
  window.__out = []; window.__done = false;
  try {
    for (const w of ws) for (let l = 1; l <= 10; l++) {
      const ps = await __play(w, l), steps = await __solve(ps); await __frames(10);
      window.__out.push(`${w}:${l} ${ps.done ? 'WIN' : 'NO'} m${ps.mistakes} ops${ps.ops}/par${ps.lv.par}${ps.done ? '' : ' [' + steps.slice(-80) + ']'}`);
    }
  } catch (e) { window.__errs.push('top:' + e + ' ' + (e.stack || '').slice(0, 300)); }
  window.__done = true;
};
'ui test ready'
