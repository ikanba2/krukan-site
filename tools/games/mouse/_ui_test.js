/* ตัวช่วยทดสอบในเบราว์เซอร์ของผจญภัยเมาส์ (ใช้คู่กับ _harness.js): (0,eval)(await (await fetch('/tools/games/mouse/_ui_test.js')).text())
   __lv(โลก, ด่าน) เริ่มด่านแล้วรอจนนับถอยหลังจบ คืนฉากเล่น · __click(x,y,ปุ่ม) ส่งคลิกเข้าตัวเกม · __state() สรุปสถานะ */
(function () {
  window.__lv = async (w, l) => {
    const g = KG.game.scene; g.getScenes(true).forEach(s => g.stop(s.scene.key)); await __frames(8); g.start('Play', { w, l }); await __frames(30); await __wait(300);
    let n = 0; while (!(g.getScene('Play') && g.getScene('Play').running) && n < 80) { await __frames(25); await __wait(60); n++; } return g.getScene('Play');
  };
  window.__ptr = (x, y, btn, touch) => ({ worldX: x, worldY: y, button: btn || 0, wasTouch: !!touch, isDown: true });
  window.__click = async (x, y, btn) => { const s = KG.game.scene.getScene('Play'), e = s.eng; e.onDown(__ptr(x, y, btn), []); if (e.onUp) e.onUp(__ptr(x, y, btn)); await __frames(4); };
  window.__state = () => { const s = KG.game.scene.getScene('Play'); return { over: s.over, done: s.done, goal: s.goal, mist: s.mist, running: s.running, ents: s.eng && s.eng.ents ? s.eng.ents.filter(e => e.state !== 'gone').length : null }; };
  // บอทเล่นแทน: ไล่คลิก/ดับเบิลคลิก/คลิกขวา/เลื่อนเมาส์ ตามชนิดของด่าน (เวลาจริงไม่เกิน maxMs)
  window.__bot = async (s, maxMs) => {
    const t0 = performance.now(); let n = 0; const e0 = s.eng;
    while (!s.over && performance.now() - t0 < (maxMs || 6000)) {
      const e = s.eng; if (e.p && e.p.act) {
        const a = e.p.act, ptr = s.input.activePointer;
        const live = e.ents.filter(x => x.good && x.state !== 'gone' && (a !== 'click' || e.p.ask !== 'color' || x.color === e.askCol) && (!e.p.order || x.idx === e.nextIdx));
        const tgt = live[0];
        if (tgt) {
          if (a === 'hover') { ptr.worldX = tgt.x; ptr.worldY = tgt.y; }
          else if (a === 'dbl') { e.onDown(__ptr(tgt.x, tgt.y, 0), []); await __frames(2); e.onDown(__ptr(tgt.x, tgt.y, 0), []); }
          else if (a === 'right') e.onDown(__ptr(tgt.x, tgt.y, 2), []);
          else if (a === 'menu') { if (!e.menu) e.onDown(__ptr(tgt.x, tgt.y, 2), []); else { const mi = e.menu.list.filter(o => o.input); const ok = e.menu.list.find(o => o.type === 'Text' && o.text === (e.p.menu === 'open' ? 'เปิด' : KG.kit.COLNAME[e.askCol])); const z = mi.find(o => Math.abs(o.y - (ok ? ok.y : 0)) < 5); if (z) z.emit('pointerdown'); } }
          else if (a === 'lr') e.onDown(__ptr(tgt.x, tgt.y, tgt.color === 'blue' ? 0 : 2), []);
          else e.onDown(__ptr(tgt.x, tgt.y, 0), []);
        }
      }
      await __frames(4); n++;
    }
    return [s.over, s.done + '/' + s.goal, 'mist ' + s.mist, 'it ' + n];
  };
  // บอทลากวาง: ไล่ลากชิ้นที่ยังไม่ล็อกไปยังเป้าที่รับชิ้นนั้น (wrong = ลากผิดเป้าก่อนหนึ่งครั้งเพื่อทดสอบการเด้งกลับ)
  window.__dragBot = async (s, maxMs, wrong) => {
    const t0 = performance.now(); let n = 0, tried = !wrong;
    while (!s.over && performance.now() - t0 < (maxMs || 8000)) {
      const e = s.eng; const it = (e.items || []).find(o => o.dd && !o.dd.locked && o.active);
      if (it) {
        const tg = e.targets.filter(g => !g.done); const good = tg.find(g => g.accept(it)), bad = tg.find(g => !g.accept(it));
        const dest = (!tried && bad) ? bad : good; if (!tried && bad) tried = true;
        if (dest) { e.dragStart({}, it); it.x = dest.x; it.y = dest.y; e.dragEnd({}, it); }
      }
      await __frames(30); n++;
    }
    return [s.over, s.done + '/' + s.goal, 'mist ' + s.mist, 'it ' + n];
  };
  // บอทลากตามทาง: เลื่อนเมาส์ไปตามเส้นกลางทางทีละน้อย (ถ้า stray = เบี่ยงออกนอกทางหนึ่งครั้งเพื่อทดสอบการหลุดทาง)
  window.__pathBot = async (s, maxMs, stray) => {
    const t0 = performance.now(); const e = s.eng, ptr = s.input.activePointer; let n = 0, did = !stray;
    ptr.isDown = true; ptr.worldX = e.rider.x; ptr.worldY = e.rider.y - 40; e.onDown({ worldX: e.rider.x, worldY: e.rider.y - 40, button: 0, wasTouch: false }, []);
    let sp = 0;
    while (!s.over && performance.now() - t0 < (maxMs || 9000)) {
      sp += 16; const q = e.at(sp); if (!did && sp > e.len * 0.5) { did = true; ptr.worldX = q[0]; ptr.worldY = q[1] + 400; await __frames(2); e.onDown({ worldX: e.rider.x, worldY: e.rider.y - 40, button: 0, wasTouch: false }, []); sp = e.s0; continue; }
      ptr.worldX = q[0]; ptr.worldY = q[1]; await __frames(1); n++; if (!e.dragging && !e.fin) { e.onDown({ worldX: e.rider.x, worldY: e.rider.y - 40, button: 0, wasTouch: false }, []); sp = e.s0; }
    }
    ptr.isDown = false; return [s.over, s.done + '/' + s.goal, 'mist ' + s.mist, 'it ' + n, 'outs ' + e.outs];
  };
  // บอทบอส: ไล่เล่นทุกรอบของด่านบอสรวมทักษะ
  window.__bossBot = async (s, maxMs) => {
    const t0 = performance.now(); let n = 0, last = null, pathStarted = false;
    while (!s.over && performance.now() - t0 < (maxMs || 40000)) {
      const b = s.eng, sub = b.sub; n++;
      if (!sub) { await __frames(10); continue; }
      if (sub.constructor.name === 'FieldEng') { const fake = { eng: sub, over: false, input: s.input }; const a = sub.p.act; const live = sub.ents.filter(x => x.good && x.state !== 'gone' && (a !== 'click' || sub.p.ask !== 'color' || x.color === sub.askCol) && (!sub.p.order || x.idx === sub.nextIdx)); const tgt = live[0]; if (tgt && sub.running) { if (a === 'hover') { s.input.activePointer.worldX = tgt.x; s.input.activePointer.worldY = tgt.y; } else if (a === 'dbl') { sub.onDown(__ptr(tgt.x, tgt.y, 0), []); await __frames(2); sub.onDown(__ptr(tgt.x, tgt.y, 0), []); } else if (a === 'right') sub.onDown(__ptr(tgt.x, tgt.y, 2), []); else if (a === 'lr') sub.onDown(__ptr(tgt.x, tgt.y, tgt.color === 'blue' ? 0 : 2), []); else sub.onDown(__ptr(tgt.x, tgt.y, 0), []); } }
      else if (sub.constructor.name === 'DragEng') { const it = sub.items.find(o => o.dd && !o.dd.locked && o.active); if (it && sub.running) { const g = sub.targets.find(g => !g.done && g.accept(it)); if (g) { sub.dragStart({}, it); it.x = g.x; it.y = g.y; sub.dragEnd({}, it); } } }
      else if (sub.constructor.name === 'PathEng') { const ptr = s.input.activePointer; if (sub.running && !sub.fin) { if (!sub.dragging) { ptr.isDown = true; sub.onDown({ worldX: sub.rider.x, worldY: sub.rider.y - 40, button: 0, wasTouch: false }, []); } const q = sub.at(Math.min(sub.len, sub.s0 + 18)); ptr.worldX = q[0]; ptr.worldY = q[1]; } }
      else if (sub.constructor.name === 'ScrollEng') { const P = sub.p; if (sub.running) { if (P.mode === 'wheel') { if (sub.val < sub.target) sub.scroll(1); else if (sub.val > sub.target) sub.scroll(-1); else sub.confirm(); } } }
      await __frames(4);
    }
    s.input.activePointer.isDown = false; return [s.over, 'round ' + (s.eng.ri + 1) + '/' + s.eng.rounds.length, 'hp ' + s.eng.hp, 'mist ' + s.mist, 'it ' + n];
  };
})();
