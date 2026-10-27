/* ตัวช่วยทดสอบเกม Phaser ในเบราว์เซอร์ที่ rAF ไม่ทำงาน (แท็บพื้นหลัง / แผงเบราว์เซอร์ในตัวที่ซ่อนอยู่)
   โหลดด้วย:  (0, eval)(await (await fetch('/tools/games/_harness.js')).text())
   - หยุดลูปจริง แล้วเดินเฟรมเองด้วย __adv(n) (เวลาเพิ่มเอง ห้ามใช้เวลาเก่าค้าง) และ __frames(n) ที่คั่น await ทุกเฟรม
     (ถ้าไม่คั่น promise/async ในเกมจะไม่ทำงานต่อ และทวีนของ Phaser 3.90 นับตามนาฬิกาจริง จึงต้องรอเวลาจริงด้วย __wait)
   - __shot(ชื่อ) ถ่ายภาพ canvas ส่งไปเซิร์ฟเวอร์รับภาพที่พอร์ต 8801 (เขียน scratchpad/<ชื่อ>.png)  - __errs เก็บ error ทั้งหมด
   - __toTitle() รอจนถึงหน้าแรก · __play(โลก, ด่าน, seed) เริ่มฉาก Play แล้วปิดกล่องแนะนำ */
(function () {
  const g = KG.game; g.loop.stop(); let V = performance.now() + 100000;
  if (KG.stats) KG.stats.on = false;   // ผลจากการทดสอบไม่ส่งเข้าชีตสถิติจริง
  window.__adv = n => { for (let i = 0; i < n; i++) { V += 16.7; g.loop.time = V; g.step(V, 16.7); } };
  const yld = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
  window.__wait = ms => new Promise(r => { const t0 = performance.now(); const f = async () => { if (performance.now() - t0 >= ms) return r(); await yld(); f(); }; f(); });
  window.__frames = async n => { for (let i = 0; i < n; i++) { __adv(1); await yld(); if (i % 4 === 0) await __wait(2); } };
  window.__errs = []; window.addEventListener('error', e => window.__errs.push('err:' + e.message + ' @' + (e.filename || '').slice(-24) + ':' + e.lineno)); window.addEventListener('unhandledrejection', e => window.__errs.push('rej:' + String(e.reason && e.reason.stack || e.reason).slice(0, 500)));
  const ce = console.error; console.error = (...a) => { window.__errs.push('ce:' + a.map(String).join(' ').slice(0, 300)); ce(...a); };
  window.__shot = async name => {
    window.__snap = null; g.renderer.snapshot(img => { window.__snap = img.src; }); __adv(1); await __wait(300);
    const img = new Image(); img.src = window.__snap; await new Promise(r => { img.onload = r; });
    const c = document.createElement('canvas'); c.width = 1280; c.height = 720; c.getContext('2d').drawImage(img, 0, 0, 1280, 720);
    const r = await fetch('http://127.0.0.1:8801/' + name, { method: 'POST', body: c.toDataURL('image/png') }); return await r.text();
  };
  window.__scenes = () => g.scene.getScenes(true).map(s => s.sys.settings.key);
  window.__toTitle = async () => { for (let k = 0; k < 60 && !__scenes().includes('Title'); k++) await __frames(10); await __frames(60); const t = g.scene.getScene('Title'); if (t && t._modal) { t._modal.close(); await __settle(); } return __scenes(); };
  window.__settle = async () => { for (let i = 0; i < 4; i++) { await __wait(150); await __frames(8); } };   // ทวีนนับตามเวลาจริงหลังเริ่มก้าวแรก จึงต้องมีเฟรมคั่นด้วยเวลาจริงต่อเนื่อง
  window.__play = async (w, l, seed) => { const s = g.scene.getScenes(true)[0]; s.scene.start('Play', { world: w, level: l, seed }); await __frames(90); await __settle(); const ps = g.scene.getScene('Play'); if (ps._modal) { ps._modal.close(); await __settle(); } return ps; };
  // จำลองเมาส์จริงบน canvas (พิกัดหน่วยออกแบบ 1280x720) ให้ Phaser ประมวลผลตามปกติ
  window.__mouse = async (type, wx, wy, btn) => {
    const cv = g.canvas, r = cv.getBoundingClientRect(), x = r.left + wx / 1280 * r.width, y = r.top + wy / 720 * r.height;
    const buttons = type === 'mouseup' ? 0 : (btn === 2 ? 2 : 1);
    cv.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, button: btn || 0, buttons, bubbles: true, cancelable: true, view: window }));
    await __frames(2);
  };
  window.__click = async (wx, wy, btn) => { await __mouse('mousemove', wx, wy); await __mouse('mousedown', wx, wy, btn); await __mouse('mouseup', wx, wy, btn); };
  window.__dbl = async (wx, wy) => { await __click(wx, wy); await __click(wx, wy); };
  window.__drag = async (x0, y0, x1, y1) => { await __mouse('mousemove', x0, y0); await __mouse('mousedown', x0, y0); const n = 6; for (let i = 1; i <= n; i++) await __mouse('mousemove', x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); await __mouse('mouseup', x1, y1); };
  return 'harness ready';
})()
