/* ===== Techno Slice: ภาพวาดเวกเตอร์ของเกม (พิซซ่า แท่งช็อกโกแลต ชิ้นพิซซ่า เหรียญตัวเลข การ์ด ตั๋ว ป้ายเศษส่วน) =====
   ทุกภาพเป็น Canvas เท็กซ์เจอร์ที่คมตามความละเอียดจริง (KG.tex) ขนาดที่ระบุเป็นหน่วยออกแบบ (1280x720) */
const CHEESE = ['#ffd34f', '#ffb15a', '#ffe27a', '#f6c06a'], CRUSTS = ['#d9964a', '#c96f3a', '#e0b060', '#b8793a'], BROWN = '#7a3b1f', INKB = '#4a2412';

/* ---------- พิซซ่าทั้งถาด: แบ่ง n ส่วน ระบายชีส k ส่วน (เริ่มจากบนสุด วนตามเข็มนาฬิกา) ---------- */
function drawPie(c, cx, cy, r, n, k, tone) {
  const t = (tone || 0) % 4, step = Math.PI * 2 / n, a0 = -Math.PI / 2, crustW = Math.max(3, r * 0.12);
  c.beginPath(); c.arc(cx, cy + 3, r + 2, 0, 7); c.fillStyle = 'rgba(74,36,18,.26)'; c.fill();
  c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = '#fff3da'; c.fill();
  for (let i = 0; i < k; i++) {
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r - crustW * 0.4, a0 + i * step, a0 + (i + 1) * step); c.closePath();
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, '#ffe98a'); g.addColorStop(1, CHEESE[t]); c.fillStyle = g; c.fill();
  }
  for (let i = 0; i < k; i++) {
    const mid = a0 + (i + 0.5) * step, rad = Math.min(r * 0.14, r * 0.6 * Math.sin(Math.min(step / 2, 1.4)) * 0.62);
    if (rad < 2) continue; const spots = r * 0.62 * step > rad * 5 ? [0.36, 0.68] : [0.55];
    spots.forEach(f => { const px = cx + Math.cos(mid) * r * f, py = cy + Math.sin(mid) * r * f; c.beginPath(); c.arc(px, py, rad, 0, 7); c.fillStyle = '#d9301a'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#8a1f0a'; c.stroke(); c.beginPath(); c.arc(px - rad * 0.3, py - rad * 0.3, rad * 0.28, 0, 7); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill(); });
    const bx = cx + Math.cos(mid + step * 0.22) * r * 0.82, by = cy + Math.sin(mid + step * 0.22) * r * 0.82; if (step > 0.45) { c.beginPath(); c.ellipse(bx, by, rad * 0.5, rad * 0.28, mid, 0, 7); c.fillStyle = '#3aa84a'; c.fill(); }
  }
  c.beginPath(); c.arc(cx, cy, r - crustW / 2, 0, 7); c.lineWidth = crustW; c.strokeStyle = CRUSTS[t]; c.stroke();
  if (n > 1) for (let i = 0; i < n; i++) { const a = a0 + i * step; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.lineWidth = Math.max(1.4, r * 0.025); c.strokeStyle = 'rgba(122,59,31,.75)'; c.stroke(); }
  c.beginPath(); c.arc(cx, cy, r, 0, 7); c.lineWidth = 2.2; c.strokeStyle = BROWN; c.stroke();
}
function pieTex(scene, n, k, size, tone) {
  return KG.tex(scene, ['sl-pie', n, k, size, tone || 0].join('|'), size + 10, size + 10, c => { c.lineJoin = 'round'; drawPie(c, (size + 10) / 2, (size + 10) / 2 - 1, size / 2 - 1, n, k, tone); });
}
/* ---------- แท่งช็อกโกแลต แบ่ง n ช่อง ระบาย k ช่อง ---------- */
function barTex(scene, n, k, w, h) {
  return KG.tex(scene, ['sl-bar', n, k, w, h].join('|'), w + 12, h + 14, c => {
    c.lineJoin = 'round'; const x = 6, y = 4, sw = w / n;
    KG.ui.rrect(c, x, y + 5, w, h, 9); c.fillStyle = 'rgba(74,36,18,.26)'; c.fill();
    c.save(); KG.ui.rrect(c, x, y, w, h, 9); c.clip();
    for (let i = 0; i < n; i++) {
      c.fillStyle = i < k ? KG.ui.lin(c, 0, y, 0, y + h, [[0, '#a8643a'], [1, '#6a3418']]) : '#fff3da'; c.fillRect(x + i * sw, y, sw + 0.5, h);
      if (i < k) { c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x + i * sw + sw * 0.12, y + h * 0.14, sw * 0.76, h * 0.18); }
    }
    c.restore();
    for (let i = 1; i < n; i++) { c.beginPath(); c.moveTo(x + i * sw, y); c.lineTo(x + i * sw, y + h); c.lineWidth = 2; c.strokeStyle = BROWN; c.stroke(); }
    KG.ui.rrect(c, x, y, w, h, 9); c.lineWidth = 3; c.strokeStyle = BROWN; c.stroke();
  });
}
/* ---------- ชิ้นพิซซ่า 1/den (ปลายแหลมอยู่ล่างกลาง ชี้ขึ้น) รัศมี R ---------- */
function wedgeTex(scene, den, R, tone) {
  const W = Math.ceil(2 * R + 10), H = Math.ceil(R + 10);
  return KG.tex(scene, ['sl-wedge', den, R, tone || 0].join('|'), W, H, c => {
    c.lineJoin = 'round'; const cx = W / 2, cy = H - 5, th = Math.PI * 2 / den, a1 = -Math.PI / 2 - th / 2, a2 = -Math.PI / 2 + th / 2, t = (tone || 0) % 4, crustW = Math.max(3, R * 0.14);
    c.beginPath(); c.moveTo(cx, cy + 3); c.arc(cx, cy + 3, R, a1, a2); c.closePath(); c.fillStyle = 'rgba(74,36,18,.26)'; c.fill();
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R - crustW * 0.4, a1, a2); c.closePath(); const g = c.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, '#ffe98a'); g.addColorStop(1, CHEESE[t]); c.fillStyle = g; c.fill();
    const mid = -Math.PI / 2, rad = Math.min(R * 0.16, R * 0.6 * Math.sin(Math.min(th / 2, 1.4)) * 0.62);
    if (rad >= 2) [0.4, 0.7].filter((f, i) => R * f * th > rad * 4 || i === 1).forEach(f => { const px = cx + Math.cos(mid) * R * f, py = cy + Math.sin(mid) * R * f; c.beginPath(); c.arc(px, py, rad, 0, 7); c.fillStyle = '#d9301a'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#8a1f0a'; c.stroke(); });
    c.beginPath(); c.arc(cx, cy, R - crustW / 2, a1, a2); c.lineWidth = crustW; c.strokeStyle = CRUSTS[t]; c.lineCap = 'butt'; c.stroke();
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a1, a2); c.closePath(); c.lineWidth = 2.2; c.strokeStyle = BROWN; c.stroke();
  });
}
// ค่าสัดส่วนจุดปลายแหลมในภาพชิ้นพิซซ่า (ใช้ตั้ง origin ให้หมุนรอบปลายชิ้น)
const wedgeOrigin = R => ({ x: 0.5, y: (R + 5) / (R + 10) });

/* ---------- เหรียญตัวเลข (ใช้ตอบข้อบวกลบ) ---------- */
function coinTex(scene, size) {
  return KG.tex(scene, 'sl-coin|' + size, size + 12, size + 14, c => {
    const cx = (size + 12) / 2, cy = (size + 14) / 2 - 2, r = size / 2;
    c.beginPath(); c.arc(cx, cy + 5, r, 0, 7); c.fillStyle = 'rgba(74,36,18,.3)'; c.fill();
    c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = KG.ui.lin(c, 0, cy - r, 0, cy + r, [[0, '#fff2a8'], [1, '#ffc82e']]); c.fill(); c.lineWidth = 3.5; c.strokeStyle = BROWN; c.stroke();
    c.beginPath(); c.arc(cx, cy, r * 0.76, 0, 7); c.lineWidth = 2; c.strokeStyle = 'rgba(122,59,31,.5)'; c.stroke();
  });
}
/* ---------- การ์ด/ชิปพื้นหลัง ---------- */
function cardBg(scene, w, h, state) {
  return KG.tex(scene, ['sl-card', w, h, state].join('|'), w + 12, h + 14, c => {
    KG.ui.rrect(c, 6, 10, w, h, 16); c.fillStyle = 'rgba(74,36,18,.28)'; c.fill();
    KG.ui.rrect(c, 6, 4, w, h, 16); c.fillStyle = KG.ui.lin(c, 0, 4, 0, 4 + h, state === 'sel' ? [[0, '#fff7c9'], [1, '#ffe27a']] : state === 'hint' ? [[0, '#ffe9d2'], [1, '#ffb87a']] : state === 'hover' ? [[0, '#ffffff'], [1, '#ffe2bd']] : [[0, '#ffffff'], [1, '#ffeed6']]); c.fill();
    KG.ui.rrect(c, 6, 4, w, h, 16); c.lineWidth = state === 'normal' ? 3.5 : 5; c.strokeStyle = state === 'sel' ? '#ff9a1a' : state === 'hint' ? '#ff6a1a' : state === 'hover' ? '#22a04a' : BROWN; c.stroke();
  });
}
function tileBg(scene, w, h, state) {   // ชิ้นพิซซ่าในถาด: แคปซูลมนสีครีม
  return KG.tex(scene, ['sl-tile', w, h, state].join('|'), w + 12, h + 14, c => {
    KG.ui.rrect(c, 6, 10, w, h, h / 2.6); c.fillStyle = 'rgba(74,36,18,.28)'; c.fill();
    KG.ui.rrect(c, 6, 4, w, h, h / 2.6); c.fillStyle = KG.ui.lin(c, 0, 4, 0, 4 + h, state === 'sel' ? [[0, '#fff7c9'], [1, '#ffe27a']] : state === 'hint' ? [[0, '#ffe9d2'], [1, '#ffb87a']] : [[0, '#fffaf0'], [1, '#ffe9c8']]); c.fill();
    KG.ui.rrect(c, 6, 4, w, h, h / 2.6); c.lineWidth = state === 'normal' ? 3.5 : 5; c.strokeStyle = state === 'sel' ? '#ff9a1a' : state === 'hint' ? '#ff6a1a' : state === 'hover' ? '#22a04a' : BROWN; c.stroke();
  });
}
// ช่องรับการ์ด (เส้นประ) และสถานะไฮไลต์
function slotFrame(g, r, mode, circle) {
  g.clear(); g.fillStyle(mode === 'hl' ? 0xcdf5d0 : 0xffffff, mode === 'hl' ? 0.9 : 0.55);
  if (circle) g.fillCircle(r.x + r.w / 2, r.y + r.h / 2, r.w / 2); else g.fillRoundedRect(r.x, r.y, r.w, r.h, 16);
  g.lineStyle(mode === 'hl' ? 5 : 3, mode === 'hl' ? 0x22a04a : 0xc98a54, 1);
  if (circle) { g.strokeCircle(r.x + r.w / 2, r.y + r.h / 2, r.w / 2); return; }
  const dash = 9, gap = 6, edge = (x1, y1, x2, y2) => { const len = Math.hypot(x2 - x1, y2 - y1), dx = (x2 - x1) / len, dy = (y2 - y1) / len; for (let t = 0; t < len; t += dash + gap) { g.beginPath(); g.moveTo(x1 + dx * t, y1 + dy * t); const e = Math.min(t + dash, len); g.lineTo(x1 + dx * e, y1 + dy * e); g.strokePath(); } };
  edge(r.x + 14, r.y, r.x + r.w - 14, r.y); edge(r.x + 14, r.y + r.h, r.x + r.w - 14, r.y + r.h); edge(r.x, r.y + 14, r.x, r.y + r.h - 14); edge(r.x + r.w, r.y + 14, r.x + r.w, r.y + r.h - 14);
}
/* ---------- ตั๋วใบสั่งงาน (ขอบบากครึ่งวงกลม + เส้นปรุ) ---------- */
function ticketTex(scene, w, h, headH, color) {
  return KG.tex(scene, ['sl-ticket', w, h, headH, color].join('|'), w + 24, h + 28, c => {
    const m = 12, r = 12, path = (dx, dy) => {
      c.beginPath(); c.moveTo(m + 20 + dx, m + dy); c.lineTo(m + w - 20 + dx, m + dy); c.arcTo(m + w + dx, m + dy, m + w + dx, m + 20 + dy, 20); c.lineTo(m + w + dx, m + headH - r + dy); c.arc(m + w + dx, m + headH + dy, r, -Math.PI / 2, Math.PI / 2, true);
      c.lineTo(m + w + dx, m + h - 20 + dy); c.arcTo(m + w + dx, m + h + dy, m + w - 20 + dx, m + h + dy, 20); c.lineTo(m + 20 + dx, m + h + dy); c.arcTo(m + dx, m + h + dy, m + dx, m + h - 20 + dy, 20); c.lineTo(m + dx, m + headH + r + dy); c.arc(m + dx, m + headH + dy, r, Math.PI / 2, -Math.PI / 2, true);
      c.lineTo(m + dx, m + 20 + dy); c.arcTo(m + dx, m + dy, m + 20 + dx, m + dy, 20); c.closePath();
    };
    path(0, 8); c.fillStyle = 'rgba(74,36,18,.30)'; c.fill();
    path(0, 0); c.fillStyle = KG.ui.lin(c, 0, m, 0, m + h, [[0, '#fffdf2'], [1, '#fff0cc']]); c.fill();
    c.save(); path(0, 0); c.clip(); c.fillStyle = color; c.fillRect(m, m, w, headH);
    c.fillStyle = 'rgba(255,255,255,.28)'; for (let x = m; x < m + w; x += 24) { c.fillRect(x, m, 12, headH / 2); c.fillRect(x + 12, m + headH / 2, 12, headH / 2); }   // ลายตารางผ้าปูโต๊ะ
    c.restore();
    c.setLineDash([7, 6]); c.beginPath(); c.moveTo(m + r + 4, m + headH); c.lineTo(m + w - r - 4, m + headH); c.lineWidth = 2.4; c.strokeStyle = 'rgba(74,36,18,.55)'; c.stroke(); c.setLineDash([]);
    path(0, 0); c.lineWidth = 3.5; c.strokeStyle = BROWN; c.stroke();
  });
}
// แผ่นป้ายมนสำหรับพื้นที่ (ใช้กับป้ายโจทย์) ทำผ่าน KG.ui.panel ที่ธีมมนอยู่แล้ว

/* ---------- ป้ายเศษส่วน: ตัวเศษอยู่บน เส้นคั่น ตัวส่วนอยู่ล่าง (จำนวนคละมีเลขเต็มข้างหน้า) ---------- */
// คืน container ที่มี .w .h  num/den เป็นข้อความหรือตัวเลข ถ้าใส่ whole จะวาดเลขเต็มทางซ้าย
function fracObj(scene, x, y, num, den, size, color, whole) {
  const c = scene.add.container(x, y), col = color || INKB, nt = KG.txt(scene, 0, -size * 0.52, String(num), { size, color: col, center: true, ox: 0.5, oy: 0.5 }), dt = KG.txt(scene, 0, size * 0.55, String(den), { size, color: col, center: true, ox: 0.5, oy: 0.5 });
  const lw = Math.max(nt.width, dt.width) * 1 + 8, line = scene.add.rectangle(0, 0, lw, Math.max(3, size * 0.1), Phaser.Display.Color.HexStringToColor(col).color); c.add([nt, dt, line]);
  let w = lw;
  if (whole != null && whole !== '') { const wt = KG.txt(scene, -lw / 2 - 6, 0, String(whole), { size: Math.round(size * 1.35), color: col, ox: 1, oy: 0.5 }); c.add(wt); w += wt.width + 6; c.x = x + (wt.width + 6) / 2; }
  c.w = w; c.h = size * 2.1; return c;
}
// ตัวเลข/คำ: ใช้การ์ดของชิ้น it วาดป้ายตามชนิด (เศษส่วนปกติ เศษเกิน จำนวนคละ ตัวเลขเดี่ยว) ขนาดตัวอักษร size
function itemLabel(scene, it, x, y, size, color) {
  if (it.mix) return it.mix.n ? fracObj(scene, x, y, it.mix.n, it.mix.d, size * 0.78, color, it.mix.w) : (() => { const c = scene.add.container(x, y); c.add(KG.txt(scene, 0, 0, String(it.mix.w), { size: size * 1.2, color: color || INKB, center: true, ox: 0.5, oy: 0.5 })); c.w = 30; c.h = size; return c; })();
  if (it.num != null) return fracObj(scene, x, y, it.num, it.den, size, color);
  const c = scene.add.container(x, y); c.add(KG.txt(scene, 0, 0, it.n, { size: size * 1.1, color: color || INKB, center: true, ox: 0.5, oy: 0.5 })); c.w = 30; c.h = size; return c;
}

/* ---------- หน้าลูกค้า (6 แบบ) วาดบนกริด 64x64 ---------- */
const FACES = [
  { skin: '#ffd7b0', hair: '#4a2a14', style: 'bob', shirt: '#ff7aa8' }, { skin: '#f2c08d', hair: '#cfcfd8', style: 'bald', shirt: '#4cd8ff' },
  { skin: '#ffd7b0', hair: '#1f1f2e', style: 'short', shirt: '#ffd34f' }, { skin: '#e8b48a', hair: '#8c8c9a', style: 'bun', shirt: '#b794ff' },
  { skin: '#f2c08d', hair: '#1f1f2e', style: 'short', shirt: '#5ef08a' }, { skin: '#ffd7b0', hair: '#7a3a14', style: 'pony', shirt: '#ff8a2b' }
];
function faceTex(scene, idx, size) {
  const F = FACES[idx % FACES.length];
  return KG.tex(scene, ['sl-face', idx % FACES.length, size].join('|'), size, size, c => {
    c.scale(size / 64, size / 64); c.lineJoin = 'round'; c.lineCap = 'round';
    const box = (x, y, w, h, r, fill, ns) => { KG.ui.rrect(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); if (!ns) { c.lineWidth = 2.4; c.strokeStyle = '#1f2d5c'; c.stroke(); } };
    const ball = (x, y, r, fill, ns) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = fill; c.fill(); if (!ns) { c.lineWidth = 2.2; c.strokeStyle = '#1f2d5c'; c.stroke(); } };
    box(12, 46, 40, 16, 8, F.shirt); box(26, 40, 12, 10, 3, F.skin, true);
    if (F.style === 'bob') box(10, 8, 44, 36, 16, F.hair); if (F.style === 'bun') { ball(32, 5, 8, F.hair); box(12, 10, 40, 24, 14, F.hair); } if (F.style === 'pony') { ball(52, 22, 7, F.hair); box(12, 8, 40, 26, 14, F.hair); }
    ball(32, 28, 17, F.skin);
    if (F.style === 'short') { c.beginPath(); c.arc(32, 25, 18, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(48, 24); c.quadraticCurveTo(32, 12, 16, 24); c.closePath(); c.fillStyle = F.hair; c.fill(); c.lineWidth = 2.2; c.strokeStyle = '#1f2d5c'; c.stroke(); }
    if (F.style === 'bob' || F.style === 'bun' || F.style === 'pony') { c.beginPath(); c.arc(32, 24, 17.5, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(32, 15, 15.5, 25); c.closePath(); c.fillStyle = F.hair; c.fill(); c.lineWidth = 2; c.strokeStyle = '#1f2d5c'; c.stroke(); }
    ball(25.5, 30, 2.2, '#1f2d5c', true); ball(38.5, 30, 2.2, '#1f2d5c', true); c.beginPath(); c.arc(32, 34, 6, 0.2 * Math.PI, 0.8 * Math.PI); c.lineWidth = 2.2; c.strokeStyle = '#1f2d5c'; c.stroke();
    ball(21, 34, 2.6, 'rgba(255,94,138,.4)', true); ball(43, 34, 2.6, 'rgba(255,94,138,.4)', true);
  });
}
