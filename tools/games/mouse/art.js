/* ===== ภาพวาดเวกเตอร์ของ ผจญภัยเมาส์ (วาดด้วย Canvas เป็นเท็กซ์เจอร์ ไม่ใช้ภาพเพิ่ม): หีบ โคมไฟ ระเบิด เมฆพายุ ก้อนหิน กล่องเวทมนตร์ รูปเมาส์สอนปุ่ม ===== */
const MA = (function () {
  const INK = '#2d2a5e', K = KG.kit;
  const T = (scene, key, w, h, draw) => KG.tex(scene, 'ma|' + key, w, h, draw);
  const stroke = (c, lw) => { c.lineWidth = lw || 3.5; c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke(); };
  const shadowE = (c, cx, y, rx) => { c.beginPath(); c.ellipse(cx, y, rx, rx * 0.16, 0, 0, 7); c.fillStyle = 'rgba(45,42,94,.22)'; c.fill(); };

  // หีบสมบัติ (ปิด/เปิด): ฝาไม้ แถบทอง กุญแจ · เปิด = ฝาเปิด มีแสงและอัญมณี
  function chest(scene, open, size) {
    return T(scene, ['chest', open, size].join('|'), size * 1.2, size * 1.2, c => {
      const s = size / 100, ox = size * 0.1, oy = size * 0.14; c.translate(ox, oy); c.scale(s, s);
      shadowE(c, 50, 92, 40);
      c.beginPath(); c.moveTo(12, 48); c.lineTo(88, 48); c.lineTo(88, 88); c.lineTo(12, 88); c.closePath(); c.fillStyle = KG.ui.lin(c, 0, 48, 0, 88, [[0, '#d9954f'], [1, '#a96428']]); c.fill(); stroke(c);
      [28, 50, 72].forEach(x => { c.fillStyle = 'rgba(80,40,10,.18)'; c.fillRect(x - 1, 50, 2, 36); });
      c.fillStyle = '#ffd34f'; c.fillRect(12, 60, 76, 9); c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(12, 60, 76, 9);
      if (open) {
        const g = c.createRadialGradient(50, 40, 2, 50, 40, 46); g.addColorStop(0, 'rgba(255,240,150,.95)'); g.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(50, 40, 46, 0, 7); c.fill();
        c.beginPath(); c.moveTo(14, 44); c.lineTo(86, 44); c.lineTo(94, 12); c.lineTo(6, 12); c.closePath(); c.fillStyle = KG.ui.lin(c, 0, 12, 0, 44, [[0, '#c27a38'], [1, '#a96428']]); c.fill(); stroke(c);
        [[34, 36, '#ff7ab8'], [50, 30, '#7fe0ff'], [66, 36, '#ffe566']].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 8, 0, 7); c.fillStyle = p[2]; c.fill(); stroke(c, 3); });
      } else {
        c.beginPath(); c.moveTo(12, 48); c.quadraticCurveTo(50, 8, 88, 48); c.closePath(); c.fillStyle = KG.ui.lin(c, 0, 14, 0, 48, [[0, '#e8a860'], [1, '#c27a38']]); c.fill(); stroke(c);
        c.fillStyle = '#ffd34f'; c.beginPath(); c.moveTo(40, 22); c.lineTo(60, 22); c.lineTo(64, 48); c.lineTo(36, 48); c.closePath(); c.fill(); stroke(c, 3);
      }
      c.beginPath(); c.arc(50, 62, 8, 0, 7); c.fillStyle = '#fff4b0'; c.fill(); stroke(c, 3); c.fillStyle = INK; c.fillRect(48, 62, 4, 8);
    });
  }
  // โคมไฟ (ดับ/ติด)
  function lamp(scene, on, size) {
    return T(scene, ['lamp', on, size].join('|'), size * 1.5, size * 1.5, c => {
      const s = size / 100; c.translate(size * 0.25, size * 0.16); c.scale(s, s); shadowE(c, 50, 96, 24);
      if (on) { const g = c.createRadialGradient(50, 40, 4, 50, 40, 70); g.addColorStop(0, 'rgba(255,236,120,.95)'); g.addColorStop(1, 'rgba(255,236,120,0)'); c.fillStyle = g; c.beginPath(); c.arc(50, 40, 70, 0, 7); c.fill(); }
      c.fillStyle = '#7a86c8'; c.fillRect(44, 66, 12, 26); stroke(c, 3); c.beginPath(); c.moveTo(28, 96); c.lineTo(72, 96); c.lineTo(66, 88); c.lineTo(34, 88); c.closePath(); c.fillStyle = '#5a66a8'; c.fill(); stroke(c, 3);
      c.beginPath(); c.arc(50, 40, 28, 0, 7); c.fillStyle = on ? KG.ui.lin(c, 0, 12, 0, 68, [[0, '#fff7b0'], [1, '#ffcf33']]) : KG.ui.lin(c, 0, 12, 0, 68, [[0, '#d7def5'], [1, '#aab6dc']]); c.fill(); stroke(c);
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(40, 30, 7, 11, -0.5, 0, 7); c.fill();
      c.fillStyle = '#7a86c8'; c.fillRect(38, 62, 24, 8); stroke(c, 3);
      if (on) { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(42, 40); c.quadraticCurveTo(50, 28, 58, 40); c.moveTo(50, 40); c.lineTo(50, 62); c.stroke(); }
    });
  }
  function bomb(scene, size) {
    return T(scene, 'bomb|' + size, size * 1.2, size * 1.3, c => {
      const s = size / 100; c.translate(size * 0.1, size * 0.22); c.scale(s, s); shadowE(c, 50, 92, 32);
      c.beginPath(); c.arc(50, 58, 32, 0, 7); c.fillStyle = KG.ui.lin(c, 0, 26, 0, 90, [[0, '#59607e'], [1, '#262a42']]); c.fill(); stroke(c);
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(40, 44, 8, 12, -0.5, 0, 7); c.fill();
      c.fillStyle = '#7a809e'; c.fillRect(42, 20, 16, 12); stroke(c, 3);
      c.beginPath(); c.moveTo(50, 20); c.quadraticCurveTo(60, 4, 72, 10); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(74, 10, 7, 0, 7); c.fillStyle = '#ffd34f'; c.fill(); c.beginPath(); c.arc(74, 10, 3.5, 0, 7); c.fillStyle = '#ff5a3a'; c.fill();
      c.fillStyle = '#ff4d5e'; c.font = '600 22px Kanit'; c.textAlign = 'center'; c.fillText('✕ ✕', 50, 66);
    });
  }
  // เมฆพายุ (หน้าบึ้ง สายฟ้า)
  function storm(scene, size) {
    return T(scene, 'storm|' + size, size * 1.4, size * 1.3, c => {
      const s = size / 100; c.translate(size * 0.12, size * 0.1); c.scale(s, s);
      [[28, 44, 22], [50, 34, 28], [74, 44, 22], [52, 54, 26]].forEach(b => { c.beginPath(); c.arc(b[0], b[1], b[2], 0, 7); c.fillStyle = '#5b6490'; c.fill(); });
      c.beginPath(); [[28, 44, 22], [50, 34, 28], [74, 44, 22], [52, 54, 26]].forEach(b => { c.moveTo(b[0] + b[2], b[1]); c.arc(b[0], b[1], b[2], 0, 7); }); c.lineWidth = 8; c.strokeStyle = INK; c.stroke();
      [[28, 44, 22], [50, 34, 28], [74, 44, 22], [52, 54, 26]].forEach(b => { c.beginPath(); c.arc(b[0], b[1], b[2] - 1, 0, 7); c.fillStyle = KG.ui.lin(c, 0, 8, 0, 80, [[0, '#8590c0'], [1, '#4a5380']]); c.fill(); });
      c.fillStyle = INK; c.beginPath(); c.arc(40, 46, 4.5, 0, 7); c.arc(62, 46, 4.5, 0, 7); c.fill(); c.lineWidth = 4; c.lineCap = 'round'; c.strokeStyle = INK; c.beginPath(); c.moveTo(32, 36); c.lineTo(46, 42); c.moveTo(70, 36); c.lineTo(56, 42); c.stroke(); c.beginPath(); c.arc(51, 62, 8, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      c.beginPath(); c.moveTo(54, 72); c.lineTo(44, 90); c.lineTo(54, 90); c.lineTo(46, 108); c.lineTo(66, 82); c.lineTo(56, 82); c.lineTo(62, 72); c.closePath(); c.fillStyle = '#ffe566'; c.fill(); stroke(c, 3);
    });
  }
  function rock(scene, size) {
    return T(scene, 'rock|' + size, size * 1.2, size * 1.1, c => {
      const s = size / 100; c.translate(size * 0.1, size * 0.14); c.scale(s, s); shadowE(c, 50, 88, 36);
      c.beginPath(); c.moveTo(10, 84); c.lineTo(16, 52); c.lineTo(34, 30); c.lineTo(62, 26); c.lineTo(84, 48); c.lineTo(92, 84); c.closePath(); c.fillStyle = KG.ui.lin(c, 0, 26, 0, 86, [[0, '#b8bdd0'], [1, '#868ca8']]); c.fill(); stroke(c);
      c.strokeStyle = 'rgba(45,42,94,.4)'; c.lineWidth = 3; c.beginPath(); c.moveTo(36, 34); c.lineTo(44, 54); c.lineTo(34, 72); c.moveTo(62, 28); c.lineTo(66, 50); c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(40, 42, 8, 5, -0.6, 0, 7); c.fill();
    });
  }
  // กล่องเวทมนตร์ (ปิด/เปิด)
  function magicBox(scene, open, size) {
    return T(scene, ['mbox', open, size].join('|'), size * 1.3, size * 1.4, c => {
      const s = size / 100; c.translate(size * 0.15, size * 0.3); c.scale(s, s); shadowE(c, 50, 94, 38);
      c.fillStyle = KG.ui.lin(c, 0, 44, 0, 90, [[0, '#a98cff'], [1, '#7447e0']]); c.fillRect(14, 44, 72, 46); stroke(c); c.fillStyle = '#ffd34f'; c.fillRect(44, 44, 12, 46); stroke(c, 3);
      if (open) { c.beginPath(); c.moveTo(8, 44); c.lineTo(92, 44); c.lineTo(100, 18); c.lineTo(0, 18); c.closePath(); c.fillStyle = '#8a64ee'; c.fill(); stroke(c); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45; c.strokeStyle = '#fff3a0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(50 + Math.cos(a) * 24, 36 + Math.sin(a) * 24); c.lineTo(50 + Math.cos(a) * 50, 36 + Math.sin(a) * 50); c.stroke(); } c.beginPath(); c.arc(50, 24, 12, 0, 7); c.fillStyle = '#ffe566'; c.fill(); stroke(c, 3); }
      else { c.fillStyle = KG.ui.lin(c, 0, 26, 0, 46, [[0, '#c0a8ff'], [1, '#8a64ee']]); c.fillRect(8, 28, 84, 18); stroke(c); c.fillStyle = '#ffd34f'; c.fillRect(44, 28, 12, 18); stroke(c, 3); c.beginPath(); c.arc(50, 22, 8, 0, 7); c.fillStyle = '#ff7ab8'; c.fill(); stroke(c, 3); }
      c.fillStyle = '#fff'; [[22, 60], [78, 70], [30, 80]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 3, 0, 7); c.fill(); });
    });
  }
  // รูปเมาส์สอนปุ่ม: mode = left · right · dbl · wheel · move · drag · both  (ปุ่มที่ใช้ระบายสีชัด มีลูกศร/เส้นเคลื่อนที่)
  function mouseIcon(scene, mode, size, tint) {
    return T(scene, ['mouse', mode, size, tint || ''].join('|'), size * 1.2, size * 1.2, c => {
      const s = size / 100; c.translate(size * 0.1, size * 0.08); c.scale(s, s);
      const hot = tint || '#ff7a1a', left = mode === 'left' || mode === 'dbl' || mode === 'drag' || mode === 'both', right = mode === 'right' || mode === 'both', wheel = mode === 'wheel';
      c.beginPath(); c.moveTo(50, 4); c.bezierCurveTo(78, 4, 82, 30, 82, 56); c.bezierCurveTo(82, 84, 68, 98, 50, 98); c.bezierCurveTo(32, 98, 18, 84, 18, 56); c.bezierCurveTo(18, 30, 22, 4, 50, 4); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); stroke(c, 4);
      c.save(); c.clip(); if (left) { c.fillStyle = hot; c.fillRect(10, 0, 40, 44); } if (right) { c.fillStyle = mode === 'both' ? '#ff4d5e' : hot; c.fillRect(50, 0, 42, 44); } c.restore();
      c.beginPath(); c.moveTo(50, 4); c.lineTo(50, 44); c.moveTo(18, 44); c.lineTo(82, 44); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.moveTo(50, 4); c.bezierCurveTo(78, 4, 82, 30, 82, 56); c.bezierCurveTo(82, 84, 68, 98, 50, 98); c.bezierCurveTo(32, 98, 18, 84, 18, 56); c.bezierCurveTo(18, 30, 22, 4, 50, 4); c.closePath(); stroke(c, 4);
      KG.ui.rrect(c, 44, 16, 12, 22, 6); c.fillStyle = wheel ? hot : '#e8ecff'; c.fill(); stroke(c, 3);
      if (mode === 'dbl') { c.font = '600 30px Kanit'; c.textAlign = 'center'; c.fillStyle = '#ffffff'; c.strokeStyle = INK; c.lineWidth = 6; c.strokeText('x2', 32, 36); c.fillText('x2', 32, 36); }
      if (wheel) { c.fillStyle = hot; [[94, 12, -1], [94, 48, 1]].forEach(a => { c.beginPath(); c.moveTo(a[0], a[1] + a[2] * 12); c.lineTo(a[0] - 10, a[1] - a[2] * 6); c.lineTo(a[0] + 10, a[1] - a[2] * 6); c.closePath(); c.fill(); stroke(c, 3); }); }
      if (mode === 'move' || mode === 'drag') { c.strokeStyle = hot; c.lineWidth = 5; c.lineCap = 'round'; [[6, 76, 22, 70], [6, 90, 24, 84]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); }
    });
  }
  return { chest, lamp, bomb, storm, rock, magicBox, mouseIcon, INK };
})();
