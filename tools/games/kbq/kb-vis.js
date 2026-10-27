/* ===== ภารกิจแป้นพิมพ์: ภาพช่วยสอน (ลูกศร มือ 10 นิ้ว ปุ่มกด ไฟจราจร จรวด หน้าต่างเอกสาร) วาดเองด้วย Canvas/กราฟิก ไม่ใช้ภาพใหม่ ===== */
const KV = (function () {
  const K = KG.kit, INK = '#2d2a5e';
  const DIRS = { ArrowUp: { dx: 0, dy: -1, col: '#3fbf6a', th: 'ขึ้น' }, ArrowDown: { dx: 0, dy: 1, col: '#ff9a2e', th: 'ลง' }, ArrowLeft: { dx: -1, dy: 0, col: '#3d8bff', th: 'ซ้าย' }, ArrowRight: { dx: 1, dy: 0, col: '#ff6fae', th: 'ขวา' } };
  const FCODE = { L0: 'KeyA', L1: 'KeyS', L2: 'KeyD', L3: 'KeyF', R3: 'KeyJ', R2: 'KeyK', R1: 'KeyL', R0: 'Semicolon', T4: 'Space' };
  const FNAME = ['ก้อย', 'นาง', 'กลาง', 'ชี้', 'หัวแม่มือ'];
  const code2ch = ch => /^[a-z]$/i.test(ch) ? 'Key' + ch.toUpperCase() : /^[0-9]$/.test(ch) ? 'Digit' + ch : ({ ';': 'Semicolon', ',': 'Comma', '.': 'Period', '/': 'Slash', ' ': 'Space', '!': 'Digit1', '@': 'Digit2', '#': 'Digit3' }[ch] || null);
  const ch2label = code => /^Key[A-Z]$/.test(code) ? code[3] : /^Digit\d$/.test(code) ? code[5] : ({ Semicolon: ';', Comma: ',', Period: '.', Slash: '/', Space: 'Space', Enter: 'Enter', Backspace: 'Backspace', Tab: 'Tab', Escape: 'Esc', ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ArrowUp: 'ขึ้น', ArrowDown: 'ลง', ArrowLeft: 'ซ้าย', ArrowRight: 'ขวา' }[code] || code);
  // ปุ่มลูกศร: สี่เหลี่ยมมนสีตามทิศ มีลูกศรสีขาว
  function arrowTex(scene, code, size) {
    const d = DIRS[code];
    return KG.tex(scene, ['kvarrow', code, size].join('|'), size + 18, size + 22, c => {
      KG.ui.rrect(c, 9, 15, size, size, 20); c.fillStyle = 'rgba(45,42,94,.28)'; c.fill(); KG.ui.rrect(c, 9, 9, size, size, 20); c.fillStyle = KG.ui.lin(c, 0, 9, 0, 9 + size, [[0, K.shade(d.col, 1.2)], [1, K.shade(d.col, 0.86)]]); c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
      c.save(); KG.ui.rrect(c, 9, 9, size, size, 20); c.clip(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(9, 9, size, size * 0.16); c.restore();
      c.translate(9 + size / 2, 9 + size / 2); c.rotate(Math.atan2(d.dy, d.dx)); const r = size * 0.3;
      c.beginPath(); c.moveTo(r, 0); c.lineTo(-r * 0.2, -r * 0.95); c.lineTo(-r * 0.2, -r * 0.4); c.lineTo(-r * 1.0, -r * 0.4); c.lineTo(-r * 1.0, r * 0.4); c.lineTo(-r * 0.2, r * 0.4); c.lineTo(-r * 0.2, r * 0.95); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke();
    });
  }
  // ปุ่มคีย์บอร์ดใบเดียว (ใช้เท็กซ์เจอร์หน้าปุ่มของแป้นพิมพ์จริง) state: norm/next/ok/bad
  function cap(scene, x, y, w, h, label, state, o) {
    o = o || {}; const c = scene.add.container(x, y);
    const face = scene.add.image(0, 3, keyFace(scene, w, h, state || 'next')).setDisplaySize(w + 12, h + 16); const t = KG.txt(scene, 0, -2, label, { size: o.size || Math.round(h * 0.5), color: KEY_PAL[state || 'next'][4], center: true, middle: true });
    if (t.width > w - 16) t.setScale((w - 16) / t.width); c.add([face, t]); c.face = face; c.label = t; c.w = w; c.h = h; c.state = state || 'next';
    c.setState2 = st => { c.state = st; face.setTexture(keyFace(scene, w, h, st)); t.setColor(KEY_PAL[st][4]); };
    if (o.onTap) { const z = scene.add.zone(0, 2, w + 8, h + 8).setInteractive({ useHandCursor: true }); c.add(z); z.on('pointerdown', () => o.onTap(c)); c.z = z; }
    return c;
  }
  // มือสองข้าง: ไฮไลต์นิ้วที่ต้องใช้ตามรหัสปุ่ม (วาดซ้ำทุกครั้งที่เปลี่ยน)
  function hands(scene, x, y) {
    const c = scene.add.container(x, y), g = scene.add.graphics(); c.add(g); const lab = KG.txt(scene, 0, 112, '', { size: 24, color: '#2d2a5e', center: true, middle: true, stroke: '#ffffff', sw: 6 }); c.add(lab);
    const spec = (hx, hand) => [{ f: 0, dx: -54, len: 52 }, { f: 1, dx: -27, len: 68 }, { f: 2, dx: 0, len: 76 }, { f: 3, dx: 27, len: 64 }].map(o => ({ f: o.f, hand, x: hx + (hand === 'L' ? o.dx : -o.dx), len: o.len })).concat([{ f: 4, hand: 'T', x: hx + (hand === 'L' ? 62 : -62), len: 44, th: true }]);
    const draw = code => {
      g.clear(); const fi = TY.FINGER[code] || null, sel = fi ? fi.hand + fi.f : null;
      [[-170, 'L'], [170, 'R']].forEach(h => {
        g.fillStyle(0xffe0c2, 1); g.fillRoundedRect(h[0] - 70, 12, 140, 84, 30); g.lineStyle(4, 0x2d2a5e, 1); g.strokeRoundedRect(h[0] - 70, 12, 140, 84, 30);
        spec(h[0], h[1]).forEach(o => {
          const key = o.th ? 'T4' : o.hand + o.f; const on = key === sel || (o.th && sel === 'T4' && o.hand === 'T' && h[1] === 'L'); const col = TY.fingerColor(FCODE[key] || 'Space');
          const wdt = o.th ? 26 : 24, y0 = 18, top = y0 - o.len + (o.th ? 40 : 0);
          g.fillStyle(on ? col : 0xffe0c2, 1); g.fillRoundedRect(o.x - wdt / 2, top, wdt, o.len + (o.th ? 0 : 14), 11); g.lineStyle(on ? 5 : 3.5, on ? 0x2d2a5e : 0x7a5a48, 1); g.strokeRoundedRect(o.x - wdt / 2, top, wdt, o.len + (o.th ? 0 : 14), 11);
          if (!on) { g.fillStyle(col, 0.85); g.fillCircle(o.x, top + 11, 6); }
        });
      });
      if (fi) lab.setText('ใช้นิ้ว' + FNAME[fi.f] + (fi.hand === 'L' ? 'ซ้าย' : fi.hand === 'R' ? 'ขวา' : '')); else lab.setText('');
    };
    c.show = draw; draw(null); return c;
  }
  // ไฟจราจร: state 'red' | 'green' | 'off'
  function light(scene, x, y) {
    const c = scene.add.container(x, y), g = scene.add.graphics(); c.add(g); const draw = st => {
      g.clear(); g.fillStyle(0x2d2a5e, 1); g.fillRoundedRect(-60, -110, 120, 220, 30); g.fillStyle(0x3a3a6e, 1); g.fillRoundedRect(-52, -102, 104, 204, 26);
      g.fillStyle(st === 'red' ? 0xff3b3b : 0x5a2a3a, 1); g.fillCircle(0, -52, 38); g.fillStyle(st === 'green' ? 0x3fe070 : 0x1f4a34, 1); g.fillCircle(0, 52, 38);
      if (st === 'red') { g.fillStyle(0xffffff, 0.35); g.fillCircle(-12, -66, 11); } if (st === 'green') { g.fillStyle(0xffffff, 0.35); g.fillCircle(-12, 38, 11); }
    };
    c.set = st => { c.st = st; draw(st); }; c.set('off'); return c;
  }
  // จรวดขีดเส้นจากกราฟิก: ตัวจรวด + ไฟพ่น
  function rocket(scene, x, y) {
    const c = scene.add.container(x, y), g = scene.add.graphics(); c.add(g);
    g.fillStyle(0xff9a2e, 1); g.fillTriangle(-34, 26, -62, 78, -20, 56); g.fillTriangle(34, 26, 62, 78, 20, 56); g.lineStyle(4, 0x2d2a5e, 1); g.strokeTriangle(-34, 26, -62, 78, -20, 56); g.strokeTriangle(34, 26, 62, 78, 20, 56);
    g.fillStyle(0xf4f6fb, 1); g.fillRoundedRect(-36, -70, 72, 140, 34); g.lineStyle(5, 0x2d2a5e, 1); g.strokeRoundedRect(-36, -70, 72, 140, 34);
    g.fillStyle(0xff4a4a, 1); g.beginPath(); g.moveTo(-36, -34); g.lineTo(0, -108); g.lineTo(36, -34); g.closePath(); g.fillPath(); g.lineStyle(5, 0x2d2a5e, 1); g.strokePath();
    g.fillStyle(0x7fe0ff, 1); g.fillCircle(0, -4, 20); g.lineStyle(5, 0x2d2a5e, 1); g.strokeCircle(0, -4, 20); g.fillStyle(0xffffff, 0.6); g.fillCircle(-7, -11, 6);
    const fire = scene.add.graphics(); fire.fillStyle(0xffc82e, 1); fire.fillTriangle(-22, 70, 22, 70, 0, 128); fire.fillStyle(0xff5a2e, 1); fire.fillTriangle(-12, 70, 12, 70, 0, 100); c.add(fire); fire.setVisible(false); c.fire = fire; c.sendToBack(fire); return c;
  }
  // หน้าต่างเอกสารจำลอง (ใช้สอนคีย์ลัด): หัวข้อ + บรรทัดข้อความ
  function doc(scene, x, y) {
    const c = scene.add.container(x, y), g = scene.add.graphics(); c.add(g); c.lines = []; c.sel = false;
    g.fillStyle(0x000000, 0.18); g.fillRoundedRect(-244, -128, 496, 270, 18); g.fillStyle(0xffffff, 1); g.fillRoundedRect(-250, -136, 500, 270, 18); g.lineStyle(5, 0x2d2a5e, 1); g.strokeRoundedRect(-250, -136, 500, 270, 18);
    g.fillStyle(0x8a5cf0, 1); g.fillRoundedRect(-250, -136, 500, 40, { tl: 18, tr: 18, bl: 0, br: 0 }); g.fillStyle(0xffffff, 1); g.fillCircle(-224, -116, 7); g.fillCircle(-202, -116, 7); g.fillCircle(-180, -116, 7);
    c.add(KG.txt(scene, 0, -116, 'เอกสารของฉัน', { size: 22, color: '#ffffff', center: true, middle: true }));
    c.hl = scene.add.graphics(); c.add(c.hl);
    c.render = (lines, sel) => {
      c.lines.forEach(t => t.destroy()); c.lines = []; c.hl.clear();
      lines.forEach((ln, i) => { const t = KG.txt(scene, -220, -76 + i * 44, ln, { size: 30, color: '#2d2a5e', middle: true }); c.add(t); c.lines.push(t); });
      if (sel && lines.length) { c.hl.fillStyle(0x7fb8ff, 0.5); c.hl.fillRoundedRect(-232, -98, 464, lines.length * 44 + 8, 10); }
    };
    return c;
  }
  return { DIRS, FNAME, code2ch, ch2label, arrowTex, cap, hands, light, rocket, doc };
})();
