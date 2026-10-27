/* ===== Techno Parts: ไอคอนอุปกรณ์คอมพิวเตอร์ วาดเป็นเวกเตอร์ด้วย Canvas2D (กริด 64x64) สไตล์การ์ตูนสีเรียบ ขอบน้ำเงินเข้ม =====
   PTI.draw[ชื่อ](ctx) วาดลงกริด 64x64 (ไม่พึ่ง Phaser ทดสอบดูในหน้าเว็บธรรมดาได้) · PTI.tex(scene, ชื่อ, ขนาด) คืนคีย์เท็กซ์เจอร์ที่แคชแล้ว
   ชื่อไอคอน: ตรงกับ DEV[x].ic ใน engine.js + plug-* (หัวสายของแต่ละช่อง) + face-* (ลูกค้า) */
(function (root) {
  'use strict';
  const INK = '#1f2d5c', D = {};
  /* ---------- ตัวช่วยวาด ---------- */
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r); c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r); c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r); c.closePath();
  }
  const lg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  function box(c, x, y, w, h, r, fill, noStroke) { rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); if (!noStroke) { c.lineWidth = 2.4; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); } }
  function ball(c, x, y, r, fill, noStroke) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (!noStroke) { c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke(); } }
  function poly(c, pts, fill, noStroke) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = fill; c.fill(); if (!noStroke) { c.lineWidth = 2.4; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); } }
  function ln(c, x1, y1, x2, y2, w, col) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.stroke(); }
  const shine = (c, x, y, w, h, r) => { rr(c, x, y, w, h, r); c.fillStyle = 'rgba(255,255,255,.38)'; c.fill(); };
  const GOLD = '#ffd34f', STEEL = '#cfd6e6', STEEL2 = '#9aa7c4', NAVY = '#3a4a7a';

  /* ---------- อุปกรณ์รับข้อมูลเข้า ---------- */
  D.keyboard = c => {
    box(c, 3, 18, 58, 30, 6, lg(c, 18, 48, '#f4f7fd', '#cfd8ee'));
    for (let r = 0; r < 3; r++) for (let i = 0; i < (r === 2 ? 0 : 8); i++) box(c, 8 + i * 6.3, 22 + r * 7.2, 5, 5, 1.2, '#ffffff', true);
    for (let i = 0; i < 8; i++) { c.strokeStyle = STEEL2; c.lineWidth = 1; c.strokeRect(8 + i * 6.3, 22, 5, 5); c.strokeRect(8 + i * 6.3, 29.2, 5, 5); }
    box(c, 17, 38, 30, 6, 2, '#ffffff', true); c.strokeStyle = STEEL2; c.lineWidth = 1; c.strokeRect(17, 38, 30, 6);
    box(c, 8, 38, 7, 6, 1.5, '#ffb347', true); box(c, 49, 38, 7, 6, 1.5, '#ffb347', true);
  };
  D.mouse = c => {
    box(c, 17, 6, 30, 52, 15, lg(c, 6, 58, '#ffffff', '#cfd8ee'));
    c.save(); rr(c, 17, 6, 30, 52, 15); c.clip(); c.fillStyle = '#ffd1a1'; c.fillRect(17, 6, 14.5, 25); c.fillStyle = '#b7e4ff'; c.fillRect(32.5, 6, 14.5, 25); c.restore();
    ln(c, 32, 6, 32, 31, 2.2, INK); ln(c, 17, 31, 47, 31, 2.2, INK); box(c, 29.5, 12, 5, 11, 2.5, '#ff7a1a', true);
    rr(c, 17, 6, 30, 52, 15); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
  };
  D.mic = c => {
    box(c, 22, 4, 20, 30, 10, lg(c, 4, 34, '#d3dbec', '#8c9abb'));
    for (let i = 0; i < 4; i++) ln(c, 24, 11 + i * 6, 40, 11 + i * 6, 1.6, 'rgba(31,45,92,.45)');
    c.beginPath(); c.arc(32, 28, 16, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 3.4; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
    ln(c, 32, 44, 32, 54, 3.4, INK); box(c, 20, 53, 24, 6, 3, NAVY);
  };
  D.webcam = c => {
    box(c, 12, 6, 40, 38, 14, lg(c, 6, 44, '#f4f7fd', '#c9d3ea'));
    ball(c, 32, 24, 13, '#23305e'); ball(c, 32, 24, 8, '#2b8cff'); ball(c, 32, 24, 4, '#0d1b4d', true); ball(c, 29, 21, 2, 'rgba(255,255,255,.85)', true);
    ball(c, 46, 11, 2, '#22b45a', true); box(c, 27, 44, 10, 8, 2, STEEL2); box(c, 17, 51, 30, 7, 3.5, NAVY);
  };
  D.scanner = c => {
    poly(c, [[10, 12], [54, 12], [60, 26], [4, 26]], lg(c, 12, 26, '#ffffff', '#dfe7f8'));
    box(c, 4, 25, 56, 28, 5, lg(c, 25, 53, '#dfe6f4', '#aab7d4')); box(c, 9, 29, 46, 12, 2, '#bfe6ff', true);
    ln(c, 11, 35, 53, 35, 3, '#3cff9a'); ln(c, 11, 35, 53, 35, 1.2, '#ffffff'); ball(c, 52, 47, 1.8, '#5ef08a', true); box(c, 10, 45, 18, 3.5, 1.5, '#8d9bbd', true);
  };
  D.gamepad = c => {
    box(c, 4, 18, 56, 30, 14, lg(c, 18, 48, '#8d7bff', '#5b43d8'));
    box(c, 8, 34, 14, 20, 7, '#5b43d8'); box(c, 42, 34, 14, 20, 7, '#5b43d8');
    box(c, 10, 28, 5, 14, 1.5, '#f4f7ff', true); box(c, 6, 32, 13, 5, 1.5, '#f4f7ff', true);
    ball(c, 44, 28, 3.6, '#ff5e8a'); ball(c, 51, 33, 3.6, '#ffd34f'); ball(c, 37, 33, 3.6, '#4cd8ff'); ball(c, 44, 38, 3.6, '#5ef08a');
    box(c, 26, 28, 12, 5, 2.5, '#2e1f8a', true);
  };
  D.pentablet = c => {
    box(c, 4, 12, 46, 40, 5, lg(c, 12, 52, '#4a5a8c', '#2c3a6e')); box(c, 9, 17, 36, 30, 3, lg(c, 17, 47, '#e6f4ff', '#bfe1ff'), true);
    c.beginPath(); c.moveTo(14, 38); c.quadraticCurveTo(22, 20, 30, 32); c.quadraticCurveTo(36, 40, 40, 24); c.lineWidth = 2.6; c.strokeStyle = '#ff5e8a'; c.lineCap = 'round'; c.stroke();
    c.save(); c.translate(52, 22); c.rotate(0.6); box(c, -3.5, -14, 7, 26, 3, '#ff9a3c'); poly(c, [[-3.5, 12], [3.5, 12], [0, 20]], '#f4e0c8'); ball(c, 0, 20, 1.2, INK, true); c.restore();
  };
  D.barcode = c => {
    box(c, 4, 8, 40, 18, 6, lg(c, 8, 26, '#6a7bd0', '#3a4a9c')); box(c, 18, 24, 15, 32, 5, lg(c, 24, 56, '#5566bb', '#3a4a9c')); box(c, 8, 12, 12, 4, 2, '#cfe0ff', true);
    ln(c, 44, 17, 56, 17, 2.6, '#ff3d4e'); ln(c, 44, 17, 56, 17, 1, '#ffd0d4'); ln(c, 56, 17, 62, 12, 2, '#ff3d4e'); ln(c, 56, 17, 62, 22, 2, '#ff3d4e');
    box(c, 38, 38, 22, 20, 2, '#ffffff'); [0, 2, 3.4, 5.4, 6.6, 8.6, 10.6, 12, 14].forEach((x, k) => ln(c, 41 + x * 1.1, 42, 41 + x * 1.1, 54, k % 2 ? 1 : 1.8, INK));
  };

  /* ---------- อุปกรณ์แสดงผล ---------- */
  D.monitor = c => {
    box(c, 4, 6, 56, 38, 5, lg(c, 6, 44, '#4a5a8c', '#2c3a6e')); box(c, 9, 11, 46, 28, 2, lg(c, 11, 39, '#9fe3ff', '#2b8cff'), true);
    poly(c, [[13, 38], [31, 12], [38, 12], [20, 38]], 'rgba(255,255,255,.28)', true); box(c, 27, 44, 10, 9, 1.5, STEEL2); box(c, 15, 52, 34, 6, 3, lg(c, 52, 58, '#d9e0f0', '#9aa7c4'));
  };
  D.speaker = c => {
    box(c, 12, 4, 40, 56, 7, lg(c, 4, 60, '#4a5a8c', '#2c3a6e'));
    ball(c, 32, 21, 6.5, '#aab6cf'); ball(c, 32, 21, 2.6, '#2c3a6e', true); ball(c, 32, 42, 14, '#aab6cf'); ball(c, 32, 42, 9, '#3a4a7a'); ball(c, 32, 42, 4, '#aab6cf', true);
    ball(c, 44, 10, 1.6, '#5ef08a', true);
  };
  D.headphones = c => {
    c.beginPath(); c.arc(32, 34, 20, Math.PI, 0); c.lineWidth = 8; c.strokeStyle = INK; c.lineCap = 'butt'; c.stroke();
    c.beginPath(); c.arc(32, 34, 20, Math.PI, 0); c.lineWidth = 4; c.strokeStyle = '#7fd8ff'; c.stroke();
    box(c, 6, 32, 14, 24, 6, lg(c, 32, 56, '#ff7aa8', '#e0245f')); box(c, 44, 32, 14, 24, 6, lg(c, 32, 56, '#ff7aa8', '#e0245f'));
    shine(c, 8, 35, 4, 12, 2); shine(c, 46, 35, 4, 12, 2);
  };
  D.printer = c => {
    box(c, 16, 6, 32, 20, 2, '#ffffff'); ln(c, 21, 12, 43, 12, 1.8, STEEL2); ln(c, 21, 17, 38, 17, 1.8, STEEL2);
    box(c, 4, 22, 56, 24, 6, lg(c, 22, 46, '#e8eefb', '#b4c0dd')); box(c, 14, 38, 36, 20, 2, '#ffffff'); ln(c, 19, 44, 45, 44, 1.8, '#2b8cff'); ln(c, 19, 49, 40, 49, 1.8, STEEL2); ln(c, 19, 54, 43, 54, 1.8, STEEL2);
    ball(c, 51, 29, 2.2, '#5ef08a', true); box(c, 9, 28, 20, 3, 1.5, '#8d9bbd', true);
  };
  D.projector = c => {
    box(c, 3, 18, 58, 28, 8, lg(c, 18, 46, '#8d9bd4', '#5a68a8'));
    ball(c, 42, 32, 12, '#23305e'); ball(c, 42, 32, 8, '#7fd8ff'); ball(c, 42, 32, 4, '#ffffff', true); ball(c, 39, 29, 1.8, '#ffffff', true);
    for (let i = 0; i < 4; i++) ln(c, 9, 25 + i * 5, 22, 25 + i * 5, 2, 'rgba(31,45,92,.55)');
    box(c, 9, 44, 8, 6, 2, NAVY); box(c, 47, 44, 8, 6, 2, NAVY);
  };

  /* ---------- อุปกรณ์เก็บข้อมูล ---------- */
  D.hdd = c => {
    box(c, 5, 10, 54, 44, 5, lg(c, 10, 54, '#d6deee', '#98a6c6'));
    ball(c, 29, 31, 17, '#eef2fb'); ball(c, 29, 31, 11, '#c5cfe6', true); ball(c, 29, 31, 3.4, '#6a7aa0'); c.beginPath(); c.arc(29, 31, 14, 0, Math.PI * 2); c.lineWidth = 1.2; c.strokeStyle = STEEL2; c.stroke();
    ln(c, 55, 14, 41, 31, 3.6, INK); ln(c, 55, 14, 41, 31, 1.6, '#ff9a3c'); ball(c, 55, 14, 3, STEEL2);
    box(c, 8, 47, 12, 4, 1.5, GOLD, true);
  };
  D.ssd = c => {
    box(c, 6, 14, 52, 36, 5, lg(c, 14, 50, '#3f9bff', '#1d5fd1'));
    box(c, 12, 20, 22, 8, 2, '#ffffff', true); ln(c, 15, 24, 31, 24, 1.8, '#1d5fd1');
    for (let i = 0; i < 3; i++) box(c, 12 + i * 11, 33, 8, 10, 1.5, '#0c2a6b', true);
    box(c, 40, 20, 12, 8, 2, '#0c2a6b', true); ball(c, 52, 44, 1.6, '#5ef08a', true); for (let i = 0; i < 5; i++) box(c, 8 + i * 4, 47, 2.4, 3, 0.5, GOLD, true);
  };
  D.flash = c => {
    box(c, 19, 24, 26, 36, 6, lg(c, 24, 60, '#ff7a7a', '#d9243d')); box(c, 23, 6, 18, 20, 1.5, lg(c, 6, 26, '#e3e8f4', '#9aa7c4'));
    box(c, 27, 10, 3.6, 7, 1, '#1f2d5c', true); box(c, 34, 10, 3.6, 7, 1, '#1f2d5c', true); ball(c, 32, 50, 3.4, '#ffffff', true); shine(c, 22, 29, 4, 20, 2);
  };
  D.sdcard = c => {
    poly(c, [[14, 4], [42, 4], [52, 14], [52, 60], [14, 60]], lg(c, 4, 60, '#3f9bff', '#1d5fd1'));
    for (let i = 0; i < 5; i++) box(c, 17 + i * 6, 7, 3.6, 10, 0.8, GOLD, true);
    box(c, 20, 30, 24, 18, 3, '#ffffff', true); ln(c, 24, 36, 40, 36, 2, '#1d5fd1'); ln(c, 24, 42, 36, 42, 2, '#1d5fd1'); ln(c, 51, 24, 51, 32, 2.2, '#0c2a6b');
  };
  D.disc = c => {
    ball(c, 32, 32, 27, lg(c, 6, 58, '#f6fbff', '#c3d4ee'));
    const cols = ['#ff5e8a', '#ffd34f', '#5ef08a', '#4cd8ff']; cols.forEach((col, i) => { c.beginPath(); c.arc(32, 32, 20 - i * 2, -0.5 + i * 0.4, 0.7 + i * 0.4); c.lineWidth = 3; c.strokeStyle = col; c.globalAlpha = 0.55; c.lineCap = 'round'; c.stroke(); c.globalAlpha = 1; });
    ball(c, 32, 32, 9, '#e9eefa'); ball(c, 32, 32, 3.6, '#ffffff'); c.beginPath(); c.arc(32, 32, 3.6, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  };

  /* ---------- ชิ้นส่วนในเครื่อง ---------- */
  D.cpu = c => {
    for (let i = 0; i < 6; i++) { box(c, 14 + i * 7.2, 4, 3.6, 8, 1, GOLD, true); box(c, 14 + i * 7.2, 52, 3.6, 8, 1, GOLD, true); box(c, 4, 14 + i * 7.2, 8, 3.6, 1, GOLD, true); box(c, 52, 14 + i * 7.2, 8, 3.6, 1, GOLD, true); }
    box(c, 10, 10, 44, 44, 5, lg(c, 10, 54, '#5a6aa8', '#2c3a6e')); box(c, 19, 19, 26, 26, 3, lg(c, 19, 45, '#e7ecf7', '#aab6cf'));
    ln(c, 24, 28, 40, 28, 1.6, NAVY); ln(c, 24, 33, 40, 33, 1.6, NAVY); ln(c, 24, 38, 34, 38, 1.6, NAVY); ball(c, 13.5, 13.5, 1.6, '#ffd34f', true);
  };
  D.ram = c => {
    box(c, 3, 14, 58, 30, 3, lg(c, 14, 44, '#2fd6b3', '#13987e'));
    for (let i = 0; i < 4; i++) box(c, 8 + i * 13, 18, 10, 14, 1.5, '#1f2d5c', true);
    for (let i = 0; i < 14; i++) box(c, 6 + i * 3.9, 43, 2.4, 6, 0.4, GOLD, true); c.fillStyle = '#eafffa'; c.fillRect(31, 41, 3, 5);
    ln(c, 8, 37, 56, 37, 1.4, 'rgba(255,255,255,.5)');
  };
  D.psu = c => {
    box(c, 6, 10, 52, 44, 5, lg(c, 10, 54, '#7686b8', '#46558a')); ball(c, 26, 32, 15, '#2c3a6e');
    for (let i = 0; i < 4; i++) { c.save(); c.translate(26, 32); c.rotate(i * Math.PI / 2); c.beginPath(); c.ellipse(0, -7, 3.4, 7, 0, 0, Math.PI * 2); c.fillStyle = '#9ab0e8'; c.fill(); c.restore(); }
    ball(c, 26, 32, 3.4, '#cfd6e6'); poly(c, [[47, 18], [41, 33], [46, 33], [43, 46], [53, 28], [47, 28]], '#ffd34f');
  };
  D.fan = c => {
    box(c, 5, 5, 54, 54, 7, lg(c, 5, 59, '#5a6aa8', '#2c3a6e')); ball(c, 32, 32, 21, '#1b2756', true);
    for (let i = 0; i < 5; i++) { c.save(); c.translate(32, 32); c.rotate(i * Math.PI * 2 / 5); c.beginPath(); c.ellipse(5, -12, 6.5, 11, 0.5, 0, Math.PI * 2); c.fillStyle = '#7fd8ff'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); c.restore(); }
    ball(c, 32, 32, 6, '#cfd6e6'); ball(c, 32, 32, 2.4, NAVY, true); [[9, 9], [55, 9], [9, 55], [55, 55]].forEach(p => ball(c, p[0], p[1], 2, '#cfd6e6', true));
  };
  D.gpu = c => {
    box(c, 3, 12, 58, 34, 4, lg(c, 12, 46, '#4a5a8c', '#2c3a6e')); ball(c, 21, 29, 11, '#1b2756', true); ball(c, 43, 29, 11, '#1b2756', true);
    [21, 43].forEach(x => { for (let i = 0; i < 3; i++) { c.save(); c.translate(x, 29); c.rotate(i * Math.PI * 2 / 3); c.beginPath(); c.ellipse(2, -5, 3, 6, 0.4, 0, Math.PI * 2); c.fillStyle = '#ff7aa8'; c.fill(); c.restore(); } ball(c, x, 29, 2.4, '#cfd6e6', true); });
    for (let i = 0; i < 12; i++) box(c, 9 + i * 4, 46, 2.4, 6, 0.4, GOLD, true); box(c, 52, 46, 8, 10, 1, STEEL2);
  };
  D.mobo = c => {
    box(c, 4, 4, 56, 56, 4, lg(c, 4, 60, '#2fd6b3', '#13987e')); box(c, 12, 12, 16, 16, 2, '#cfd6e6'); box(c, 33, 10, 4, 22, 1, '#1f2d5c'); box(c, 40, 10, 4, 22, 1, '#1f2d5c');
    box(c, 12, 36, 38, 5, 1.5, '#1f2d5c'); box(c, 46, 46, 10, 10, 1.5, '#9aa7c4'); for (let i = 0; i < 4; i++) ln(c, 14 + i * 9, 49, 14 + i * 9, 55, 2, GOLD);
  };

  /* ---------- สายและหัวสายของแต่ละช่อง (เป็นไอคอนของอุปกรณ์ power และ lan ด้วย) ---------- */
  D['plug-usb'] = D.usb = c => {
    ln(c, 32, 34, 32, 60, 6, INK); ln(c, 32, 34, 32, 60, 3, '#6a7bd0');
    box(c, 15, 6, 34, 32, 3, lg(c, 6, 38, '#e6ebf6', '#a9b6d3')); box(c, 20, 10, 24, 8, 1.5, '#1f2d5c', true); box(c, 22, 12, 20, 3, 0.8, '#4a5a8c', true);
    for (let i = 0; i < 2; i++) ball(c, 25 + i * 14, 27, 2, '#4a5a8c', true);
  };
  D['plug-hdmi'] = D.hdmi = c => {
    ln(c, 32, 34, 32, 60, 6, INK); ln(c, 32, 34, 32, 60, 3, '#2b8cff');
    poly(c, [[10, 8], [54, 8], [54, 22], [47, 36], [17, 36], [10, 22]], lg(c, 8, 36, '#e6ebf6', '#a9b6d3'));
    poly(c, [[16, 12], [48, 12], [48, 20], [43, 29], [21, 29], [16, 20]], '#1f2d5c', true); for (let i = 0; i < 7; i++) box(c, 20 + i * 3.6, 15, 2, 6, 0.4, GOLD, true);
  };
  D['plug-audio'] = D.audio = c => {
    ln(c, 32, 40, 32, 60, 6, INK); ln(c, 32, 40, 32, 60, 3, '#22b45a');
    box(c, 22, 30, 20, 14, 4, '#22b45a'); box(c, 26, 8, 12, 24, 3, lg(c, 8, 32, '#eef2fb', '#9aa7c4'));
    ln(c, 26, 14, 38, 14, 2, INK); ln(c, 26, 20, 38, 20, 2, INK); poly(c, [[26, 8], [38, 8], [35, 3], [29, 3]], '#cfd6e6');
  };
  D['plug-mic'] = D.micplug = c => {
    ln(c, 32, 40, 32, 60, 6, INK); ln(c, 32, 40, 32, 60, 3, '#ff5ea8');
    box(c, 22, 30, 20, 14, 4, '#ff5ea8'); box(c, 26, 8, 12, 24, 3, lg(c, 8, 32, '#eef2fb', '#9aa7c4'));
    ln(c, 26, 14, 38, 14, 2, INK); ln(c, 26, 20, 38, 20, 2, INK); poly(c, [[26, 8], [38, 8], [35, 3], [29, 3]], '#cfd6e6');
  };
  D['plug-lan'] = D.lan = c => {
    ln(c, 32, 40, 32, 60, 7, INK); ln(c, 32, 40, 32, 60, 4, '#ff8a2b');
    box(c, 14, 14, 36, 30, 4, lg(c, 14, 44, '#f1f4fb', '#b9c4de')); box(c, 20, 6, 24, 14, 2, '#cfd6e6');
    for (let i = 0; i < 8; i++) box(c, 20 + i * 3, 8, 1.8, 8, 0.3, GOLD, true); box(c, 26, 38, 12, 8, 2, '#2c3a6e');
  };
  D['plug-power'] = D.power = c => {
    ln(c, 32, 36, 32, 60, 7, INK); ln(c, 32, 36, 32, 60, 4, '#3a4a7a');
    box(c, 12, 4, 40, 34, 8, lg(c, 4, 38, '#4a5a8c', '#2c3a6e')); box(c, 20, 20, 5, 22, 2.5, '#e3e8f4'); box(c, 39, 20, 5, 22, 2.5, '#e3e8f4');
    poly(c, [[34, 8], [28, 18], [32, 18], [29, 28], [38, 14], [33, 14]], '#ffd34f', true);
  };

  /* ---------- ซอฟต์แวร์ (ไอคอนทั่วไป ไม่เลียนแบบของยี่ห้อใด) ---------- */
  D['sw-doc'] = c => { box(c, 12, 4, 40, 56, 4, '#ffffff'); box(c, 12, 4, 40, 12, 4, '#2b8cff'); for (let i = 0; i < 4; i++) ln(c, 18, 24 + i * 8, i === 3 ? 34 : 46, 24 + i * 8, 2.2, STEEL2); ball(c, 20, 10, 2, '#ffffff', true); };
  D['sw-paint'] = c => {
    c.beginPath(); c.moveTo(32, 6); c.bezierCurveTo(60, 6, 62, 34, 46, 42); c.bezierCurveTo(38, 46, 46, 56, 32, 58); c.bezierCurveTo(10, 58, 2, 28, 18, 14); c.bezierCurveTo(22, 10, 26, 6, 32, 6); c.closePath();
    c.fillStyle = lg(c, 6, 58, '#ffeab0', '#f4c870'); c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
    ball(c, 22, 24, 4.2, '#ff5e8a'); ball(c, 34, 16, 4.2, '#ffd34f'); ball(c, 46, 24, 4.2, '#5ef08a'); ball(c, 22, 40, 4.2, '#4cd8ff'); ball(c, 34, 46, 5, '#f7f1e3');
  };
  D['sw-music'] = c => { ball(c, 32, 32, 28, lg(c, 4, 60, '#c7b4ff', '#7c4af0')); ball(c, 24, 44, 6, '#ffffff'); box(c, 28.5, 16, 4, 28, 1.5, '#ffffff', true); poly(c, [[32.5, 16], [47, 21], [47, 30], [32.5, 25]], '#ffffff'); };
  D['sw-web'] = c => {
    ball(c, 32, 32, 27, lg(c, 5, 59, '#8fe6ff', '#2b8cff')); c.save(); c.beginPath(); c.arc(32, 32, 27, 0, Math.PI * 2); c.clip();
    c.fillStyle = '#5ef08a'; c.beginPath(); c.ellipse(24, 24, 11, 8, -0.4, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(42, 42, 9, 11, 0.4, 0, Math.PI * 2); c.fill(); c.restore();
    c.beginPath(); c.ellipse(32, 32, 12, 27, 0, 0, Math.PI * 2); c.lineWidth = 1.8; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); ln(c, 5, 32, 59, 32, 1.8, 'rgba(255,255,255,.7)'); ball(c, 32, 32, 27, 'rgba(0,0,0,0)'); c.beginPath(); c.arc(32, 32, 27, 0, Math.PI * 2); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
  };
  D['sw-game'] = c => {
    c.beginPath(); c.moveTo(10, 58); c.lineTo(10, 28); c.arc(32, 28, 22, Math.PI, 0); c.lineTo(54, 58); c.lineTo(46, 51); c.lineTo(39, 58); c.lineTo(32, 51); c.lineTo(25, 58); c.lineTo(18, 51); c.closePath();
    c.fillStyle = lg(c, 6, 58, '#ff9ac2', '#e0245f'); c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    ball(c, 24, 28, 6, '#ffffff'); ball(c, 42, 28, 6, '#ffffff'); ball(c, 25.5, 29, 3, INK, true); ball(c, 43.5, 29, 3, INK, true);
  };
  D['sw-os'] = c => {
    box(c, 4, 8, 56, 46, 5, lg(c, 8, 54, '#f4f7fd', '#cdd8ef')); box(c, 4, 8, 56, 11, 5, '#3a4a7a'); ball(c, 11, 13.5, 2, '#ff5e8a', true); ball(c, 18, 13.5, 2, '#ffd34f', true); ball(c, 25, 13.5, 2, '#5ef08a', true);
    ball(c, 32, 38, 11, '#16c7a8'); ball(c, 32, 38, 4, '#f4f7fd'); for (let i = 0; i < 6; i++) { c.save(); c.translate(32, 38); c.rotate(i * Math.PI / 3); box(c, -2.2, -14.5, 4.4, 6, 1, '#16c7a8', true); c.restore(); }
    ball(c, 32, 38, 11, 'rgba(0,0,0,0)'); c.beginPath(); c.arc(32, 38, 11, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); ball(c, 32, 38, 4, '#f4f7fd');
  };
  D.step = c => { ball(c, 32, 32, 26, lg(c, 6, 58, '#ffffff', '#dfe9fb')); };

  /* ---------- หน้าลูกค้า (6 แบบ) ---------- */
  const FACE = [
    { skin: '#ffd7b0', hair: '#4a2a14', style: 'bob', shirt: '#ff7aa8' }, { skin: '#f2c08d', hair: '#cfcfd8', style: 'bald', shirt: '#4cd8ff' },
    { skin: '#ffd7b0', hair: '#1f1f2e', style: 'short', shirt: '#ffd34f' }, { skin: '#e8b48a', hair: '#8c8c9a', style: 'bun', shirt: '#b794ff' },
    { skin: '#f2c08d', hair: '#1f1f2e', style: 'short', shirt: '#5ef08a' }, { skin: '#ffd7b0', hair: '#7a3a14', style: 'pony', shirt: '#ff8a2b' }
  ];
  FACE.forEach((F, i) => {
    D['face-' + i] = c => {
      box(c, 12, 46, 40, 16, 8, F.shirt); box(c, 26, 40, 12, 10, 3, F.skin, true);
      if (F.style === 'bob') box(c, 10, 8, 44, 36, 16, F.hair); if (F.style === 'bun') { ball(c, 32, 5, 8, F.hair); box(c, 12, 10, 40, 24, 14, F.hair); } if (F.style === 'pony') { ball(c, 52, 22, 7, F.hair); box(c, 12, 8, 40, 26, 14, F.hair); }
      ball(c, 32, 28, 17, F.skin);
      if (F.style === 'short') { c.beginPath(); c.arc(32, 25, 18, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(48, 24); c.quadraticCurveTo(32, 12, 16, 24); c.closePath(); c.fillStyle = F.hair; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke(); }
      if (F.style === 'bob' || F.style === 'bun' || F.style === 'pony') { c.beginPath(); c.arc(32, 24, 17.5, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(32, 15, 15.5, 25); c.closePath(); c.fillStyle = F.hair; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); }
      ball(c, 25.5, 30, 2.2, INK, true); ball(c, 38.5, 30, 2.2, INK, true); c.beginPath(); c.arc(32, 34, 6, 0.2 * Math.PI, 0.8 * Math.PI); c.lineWidth = 2.2; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
      ball(c, 21, 34, 2.6, 'rgba(255,94,138,.4)', true); ball(c, 43, 34, 2.6, 'rgba(255,94,138,.4)', true);
      if (i === 1) { ln(c, 22, 30, 28, 30, 1.6, INK); ln(c, 36, 30, 42, 30, 1.6, INK); }
    };
  });

  /* ---------- ใช้กับ Phaser ---------- */
  function tex(scene, name, size) {
    const draw = D[name] || D.step, px = size || 64;
    return KG.tex(scene, 'pti|' + name + '|' + px, px, px, c => { c.scale(px / 64, px / 64); c.lineJoin = 'round'; c.lineCap = 'round'; draw(c); });
  }
  const api = { draw: D, tex, FACE_COUNT: FACE.length, INK };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PTI = api;
})(typeof window !== 'undefined' ? window : globalThis);
