/* ===== Techno Talk: ภาพเวกเตอร์ตัวละครเด็ก (วาดด้วย Canvas2D บนกริด 100x100) =====
   ตัวละครหัวโตสัดส่วนน่ารัก ปรับได้: สีผิว ทรงผม สีเสื้อ สีหน้า (mood) ท่าทางแขนขา (มุมองศา) และของในมือ (prop)
   ใช้ซ้ำทุกฉากของเกม: คำศัพท์ ประโยค ท่าทางคำกริยา สีหน้าความรู้สึก
   kid(c, o)  o = { skin, hairStyle, hair, shirt, pants, mood, la, ra, ll, rl, tilt, scale, cx, cy, flip, prop, glasses, adult }
   มุมแขน/ขา: 0 = ห้อยลง · บวก = กางออกนอกตัว (90 = ขนานพื้น 180 = ชี้ขึ้น) · ลบ = พาดเข้าหาตัว */
const INK = '#2d2a5e';
const SKINS = ['#ffd9b3', '#f6cfa0', '#e8b887', '#cf9a6a'];
function rrp(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r); c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r); c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r); c.closePath();
}
const lgv = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
const lgh = (c, x0, x1, a, b) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
// ART_FX: ใส่แสงเงานุ่ม ๆ ให้ทุกชิ้นส่วน (ไฮไลต์มุมซ้ายบน + เงาด้านล่าง) ภายในรูปทรงเท่านั้น ข้ามสีโปร่งแสงและชิ้นเล็กมาก
const ART_FX = true;
function softShade(c, b) {
  const w = b[2], h = b[3]; if (!ART_FX || Math.min(w, h) < 6) return;
  c.save(); c.clip();
  const hx = b[0] + w * 0.32, hy = b[1] + h * 0.26, hl = c.createRadialGradient(hx, hy, 0, hx, hy, Math.max(w, h) * 0.62);
  hl.addColorStop(0, 'rgba(255,255,255,0.42)'); hl.addColorStop(0.45, 'rgba(255,255,255,0.12)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = hl; c.fillRect(b[0] - 2, b[1] - 2, w + 4, h + 4);
  const sh = c.createLinearGradient(0, b[1] + h * 0.5, 0, b[1] + h); sh.addColorStop(0, 'rgba(40,24,90,0)'); sh.addColorStop(1, 'rgba(40,24,90,0.2)');
  c.fillStyle = sh; c.fillRect(b[0] - 2, b[1] + h * 0.5, w + 4, h * 0.5 + 2);
  c.restore();
}
const solidFill = f => typeof f !== 'string' || !/^rgba\(.*,\s*0?\.\d+\)$/.test(f.replace(/\s/g, ''));
function fillStroke(c, fill, lw, box) { c.fillStyle = fill; c.fill(); if (box && solidFill(fill)) softShade(c, box); if (lw === 0) return; c.lineWidth = lw || 3; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
const rr2 = (c, x, y, w, h, r, fill, lw) => { rrp(c, x, y, w, h, r); fillStroke(c, fill, lw, [x, y, w, h]); };
const ell = (c, x, y, rx, ry, fill, lw, rot) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); if (fill) { const m = Math.max(rx, ry), q = rot ? m : 0; fillStroke(c, fill, lw, [x - (q || rx), y - (q || ry), 2 * (q || rx), 2 * (q || ry)]); } else { c.lineWidth = lw || 3; c.strokeStyle = INK; c.stroke(); } };
const cir = (c, x, y, r, fill, lw) => ell(c, x, y, r, r, fill, lw);
const poly = (c, pts, fill, lw) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys); fillStroke(c, fill, lw, [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0]); };
const line = (c, x1, y1, x2, y2, w, col) => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = w; c.strokeStyle = col || INK; c.lineCap = 'round'; c.stroke(); };
const shade = (hex, k) => { if (typeof hex !== 'string' || hex[0] !== '#') return hex; const n = parseInt(hex.slice(1), 16), r = Math.max(0, Math.min(255, ((n >> 16) & 255) * k)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) * k)), b = Math.max(0, Math.min(255, (n & 255) * k)); return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'; };
const shadow = (c, x, y, rx, ry) => { c.save(); c.translate(x, y); c.scale(1, ry / rx); const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, 'rgba(45,42,94,.3)'); g.addColorStop(0.7, 'rgba(45,42,94,.16)'); g.addColorStop(1, 'rgba(45,42,94,0)'); c.beginPath(); c.arc(0, 0, rx * 1.08, 0, Math.PI * 2); c.fillStyle = g; c.fill(); c.restore(); };

/* ---------- สีหน้า ---------- */
function drawFace(c, mood, skin) {
  const eye = (x, y, r) => {
    r *= 1.18; c.beginPath(); c.ellipse(x, y, r, r * 1.12, 0, 0, Math.PI * 2); c.fillStyle = '#2d2a5e'; c.fill();
    const g = c.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#3a2a5a'); g.addColorStop(1, '#8a5a3a'); c.beginPath(); c.ellipse(x, y + r * 0.12, r * 0.74, r * 0.82, 0, 0, Math.PI * 2); c.fillStyle = g; c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(x - r * 0.32, y - r * 0.38, r * 0.4, r * 0.34, -0.4, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x + r * 0.34, y + r * 0.36, r * 0.17, 0, Math.PI * 2); c.fill();
  };
  const cheek = () => { [-13, 13].forEach(x => { const g = c.createRadialGradient(x, -11.5, 0, x, -11.5, 5.2); g.addColorStop(0, 'rgba(255,105,140,.55)'); g.addColorStop(1, 'rgba(255,105,140,0)'); c.beginPath(); c.arc(x, -11.5, 5.2, 0, Math.PI * 2); c.fillStyle = g; c.fill(); }); [-14.5, 11.5].forEach(x => cir(c, x, -13, 0.9, 'rgba(255,255,255,.8)', 0)); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  const arc = (x, y, r, a1, a2, w, col) => { c.beginPath(); c.arc(x, y, r, a1, a2); c.lineWidth = w; c.strokeStyle = col || INK; c.stroke(); };
  switch (mood) {
    case 'happy': arc(-7, -19, 4, Math.PI * 1.1, Math.PI * 1.9, 2.8); arc(7, -19, 4, Math.PI * 1.1, Math.PI * 1.9, 2.8); c.beginPath(); c.moveTo(-8, -12); c.quadraticCurveTo(0, 0, 8, -12); c.closePath(); fillStroke(c, '#e0405a', 2.4); ell(c, 0, -8, 4, 2.6, '#ff8aa0', 0); cheek(); break;
    case 'sad': eye(-7, -17, 2.6); eye(7, -17, 2.6); line(c, -11, -23, -4, -21, 2.6); line(c, 11, -23, 4, -21, 2.6); arc(0, -6, 5, Math.PI * 1.15, Math.PI * 1.85, 2.8); ell(c, -10, -9, 1.8, 2.8, '#6ec6ff', 1.2); break;
    case 'angry': eye(-7, -16, 2.6); eye(7, -16, 2.6); line(c, -12, -24, -3, -20, 3.4); line(c, 12, -24, 3, -20, 3.4); c.beginPath(); c.moveTo(-6, -7); c.lineTo(-3, -9); c.lineTo(0, -7); c.lineTo(3, -9); c.lineTo(6, -7); c.lineWidth = 2.8; c.strokeStyle = INK; c.stroke(); cir(c, -13, -12, 4.2, 'rgba(255,60,60,.4)', 0); cir(c, 13, -12, 4.2, 'rgba(255,60,60,.4)', 0); break;
    case 'tired': line(c, -11, -17, -4, -17, 2.8); line(c, 11, -17, 4, -17, 2.8); arc(-7, -16, 3, 0.1, Math.PI - 0.1, 0); line(c, -4, -6, 4, -6, 2.8); ell(c, 15, -26, 2, 3.2, '#6ec6ff', 1.2); c.globalAlpha = 0.5; line(c, -11, -13, -4, -13, 2, '#7a6aa8'); line(c, 11, -13, 4, -13, 2, '#7a6aa8'); c.globalAlpha = 1; break;
    case 'hungry': eye(-7, -18, 3); eye(7, -18, 3); line(c, -11, -24, -4, -23, 2.4); line(c, 11, -24, 4, -23, 2.4); ell(c, 0, -7, 5, 5.5, '#e0405a', 2.4); ell(c, 0, -5, 3, 2.4, '#ff8aa0', 0); ell(c, 5, 0, 1.6, 2.6, '#6ec6ff', 1); break;
    case 'scared': ell(c, -7, -17, 4.4, 5, '#ffffff', 2.2); ell(c, 7, -17, 4.4, 5, '#ffffff', 2.2); cir(c, -7, -16, 1.6, INK, 0); cir(c, 7, -16, 1.6, INK, 0); line(c, -12, -25, -4, -23, 2.4); line(c, 12, -25, 4, -23, 2.4); c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(-3, -9, 0, -6); c.quadraticCurveTo(3, -3, 6, -6); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke(); ell(c, 17, -24, 2, 3.2, '#6ec6ff', 1.2); ell(c, -17, -20, 1.8, 2.8, '#6ec6ff', 1.2); break;
    case 'sleep': arc(-7, -17, 4, 0.15, Math.PI - 0.15, 2.8); arc(7, -17, 4, 0.15, Math.PI - 0.15, 2.8); ell(c, 0, -6, 2.6, 2.2, '#e0405a', 2); cheek(); break;
    case 'open': eye(-7, -18, 3); eye(7, -18, 3); ell(c, 0, -7, 4.4, 5, '#e0405a', 2.4); ell(c, 0, -5, 2.6, 2.2, '#ff8aa0', 0); cheek(); break;
    case 'neutral': eye(-7, -17, 2.8); eye(7, -17, 2.8); line(c, -3, -7, 3, -7, 2.6); cheek(); break;
    default: eye(-7, -17, 2.8); eye(7, -17, 2.8); arc(0, -10, 5, 0.2 * Math.PI, 0.8 * Math.PI, 2.8); cheek();
  }
}

/* ---------- ทรงผม ---------- */
function drawHairBack(c, style, col) {
  const d = shade(col, 0.82);
  if (style === 'bob') rr2(c, -23, -42, 46, 40, 16, col, 3);
  if (style === 'long') { rr2(c, -26, -26, 12, 40, 6, col, 3); rr2(c, 14, -26, 12, 40, 6, col, 3); rr2(c, -23, -42, 46, 34, 16, col, 3); }
  if (style === 'pony') { ell(c, 22, -22, 8, 15, col, 3, 0.5); }
  if (style === 'bun') { cir(c, 0, -46, 9, col, 3); }
  if (style === 'curly') { [[-20, -34], [-24, -22], [20, -34], [24, -22], [-12, -41], [12, -41], [0, -43]].forEach(p => cir(c, p[0], p[1], 8, col, 3)); }
  if (style === 'baby') { c.beginPath(); c.moveTo(0, -41); c.quadraticCurveTo(-6, -50, 0, -52); c.quadraticCurveTo(7, -52, 4, -46); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); }
}
function drawHairFront(c, style, col) {
  if (style === 'bald' || style === 'baby') return;
  c.beginPath(); c.arc(0, -20, 20.5, Math.PI * 1.03, Math.PI * 1.97); c.quadraticCurveTo(10, -33, 2, -29); c.quadraticCurveTo(-8, -26, -20.5, -22); c.closePath(); fillStroke(c, col, 3);
  if (style === 'spiky') { poly(c, [[-19, -30], [-13, -46], [-6, -34], [0, -49], [6, -34], [13, -46], [19, -30]], col, 3); }
  if (style === 'short' || style === 'spiky' || style === 'curly') { c.beginPath(); c.moveTo(-9, -36); c.quadraticCurveTo(2, -30, 10, -37); c.lineWidth = 0; }
  c.globalAlpha = 0.28; c.beginPath(); c.ellipse(-8, -34, 6, 2.6, -0.4, 0, Math.PI * 2); c.fillStyle = '#ffffff'; c.fill(); c.globalAlpha = 1;
}

/* ---------- ตัวเด็ก ---------- */
function kid(c, o) {
  o = Object.assign({ skin: SKINS[1], hairStyle: 'short', hair: '#2a1f1a', shirt: '#3d8bff', pants: '#4a5a9c', mood: 'smile', la: 6, ra: 6, ll: 5, rl: 5, tilt: 0, scale: 1, cx: 50, cy: 54, flip: false, prop: null, glasses: false, adult: false, collar: null }, o);
  c.save(); c.translate(o.cx, o.cy); c.rotate(o.tilt * Math.PI / 180); c.scale(o.scale * (o.flip ? -1 : 1), o.scale); c.lineJoin = 'round'; c.lineCap = 'round';
  const L = o.adult ? 19 : 17, rad = a => a * Math.PI / 180, limb = (sx, sy, ang, len, side) => ({ x: sx + side * Math.sin(rad(ang)) * len, y: sy + Math.cos(rad(ang)) * len });
  // ขา
  const hipY = 22, legL = limb(-7, hipY, o.ll, L, -1), legR = limb(7, hipY, o.rl, L, 1);
  [[legL, -7, o.ll], [legR, 7, o.rl]].forEach(([e, sx]) => { line(c, sx, hipY, e.x, e.y, 11.5, INK); line(c, sx, hipY, e.x, e.y, 7.5, o.pants); ell(c, e.x + (sx < 0 ? -1.5 : 1.5), e.y + 2, 6, 3.6, '#ffffff', 2.6); });
  // ลำตัว
  rr2(c, -14, -1, 28, 26, 10, lgv(c, -1, 25, o.shirt, shade(o.shirt, 0.84)), 3);
  if (o.collar) { poly(c, [[-6, -1], [0, 7], [6, -1]], o.collar, 2.2); }
  c.globalAlpha = 0.25; rrp(c, -11, 2, 6, 15, 3); c.fillStyle = '#ffffff'; c.fill(); c.globalAlpha = 1;
  // กระโปรง (ตัวละครผู้หญิง) ให้แยกเด็กผู้หญิงกับเด็กผู้ชายได้ทันทีแม้ภาพเล็ก
  if (o.skirt) { const sy = o.adult ? 13 : 14, sl = o.adult ? 22 : 16; poly(c, [[-13.5, sy], [13.5, sy], [14 + sl * 0.5, sy + sl], [-14 - sl * 0.5, sy + sl]], lgv(c, sy, sy + sl, o.skirt, shade(o.skirt, 0.8)), 3); line(c, -13, sy + 1.5, 13, sy + 1.5, 2.4, shade(o.skirt, 0.7)); }
  // แขน
  const shY = 5, armL = limb(-14, shY, o.la, L - 1, -1), armR = limb(14, shY, o.ra, L - 1, 1);
  [[armL, -14], [armR, 14]].forEach(([e, sx]) => { line(c, sx, shY, e.x, e.y, 10.5, INK); line(c, sx, shY, e.x, e.y, 6.6, o.shirt); cir(c, e.x, e.y, 4.6, o.skin, 2.4); });
  o._hands = { l: armL, r: armR };
  // ศีรษะ
  drawHairBack(c, o.hairStyle, o.hair);
  cir(c, -20, -17, 4.2, o.skin, 2.4); cir(c, 20, -17, 4.2, o.skin, 2.4);
  cir(c, 0, -20, 20, lgv(c, -40, 0, shade(o.skin, 1.05), shade(o.skin, 0.93)), 3);
  drawHairFront(c, o.hairStyle, o.hair);
  if (o.bow) { c.save(); c.translate(o.bowX == null ? 13 : o.bowX, o.bowY == null ? -37 : o.bowY); c.rotate(0.25); poly(c, [[0, 0], [-9, -6], [-9, 6]], o.bow, 2.4); poly(c, [[0, 0], [9, -6], [9, 6]], o.bow, 2.4); cir(c, 0, 0, 3, shade(o.bow, 0.8), 2.2); c.restore(); }
  c.save(); c.translate(0, -3); drawFace(c, o.mood, o.skin); c.restore();
  if (o.glasses) { c.lineWidth = 2.4; c.strokeStyle = INK; cir(c, -7, -20, 6.4, 'rgba(180,225,255,.35)', 2.4); cir(c, 7, -20, 6.4, 'rgba(180,225,255,.35)', 2.4); line(c, -0.6, -20, 0.6, -20, 2.4); }
  if (o.prop) { const P = PROPS[o.prop.k]; if (P) { const h = o._hands[o.prop.hand || 'r']; c.save(); c.translate(h.x + (o.prop.dx || 0), h.y + (o.prop.dy || 0)); c.rotate(rad(o.prop.rot || 0)); c.scale(o.prop.s || 1, o.prop.s || 1); P(c, o.prop); c.restore(); } }
  c.restore();
}

/* ---------- ของในมือ (วาดที่จุดศูนย์กลาง 0,0 = ตำแหน่งมือ) ---------- */
const PROPS = {
  apple: c => { cir(c, 0, 0, 7, lgv(c, -7, 7, '#ff6b6b', '#d83a3a'), 2.4); line(c, 0, -7, 1.5, -11, 2.2, INK); poly(c, [[1.5, -9], [7, -12], [5, -7]], '#4cc26a', 1.8); },
  banana: c => { c.beginPath(); c.moveTo(-8, -3); c.quadraticCurveTo(-1, 9, 9, -6); c.quadraticCurveTo(2, 4, -8, -3); c.closePath(); fillStroke(c, '#ffd84a', 2.4); },
  cup: c => { c.beginPath(); c.moveTo(-6, -7); c.lineTo(6, -7); c.lineTo(4.4, 7); c.lineTo(-4.4, 7); c.closePath(); fillStroke(c, 'rgba(235,248,255,.9)', 2.4); c.beginPath(); c.moveTo(-5.2, -2); c.lineTo(5.2, -2); c.lineTo(4.4, 7); c.lineTo(-4.4, 7); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); },
  milk: c => { rr2(c, -5.5, -7, 11, 15, 2, '#ffffff', 2.4); poly(c, [[-5.5, -7], [0, -12], [5.5, -7]], '#e8f2ff', 2.2); rr2(c, -5.5, -1, 11, 6, 0, '#5aa8ff', 0); c.lineWidth = 2.4; c.strokeStyle = INK; rrp(c, -5.5, -7, 11, 15, 2); c.stroke(); },
  spoon: c => { line(c, 0, 8, 0, -4, 3.4, INK); line(c, 0, 8, 0, -4, 1.6, '#cfd6e6'); ell(c, 0, -8, 4.4, 5.2, '#cfd6e6', 2.2); },
  bowl: c => { c.beginPath(); c.moveTo(-9, -2); c.quadraticCurveTo(-9, 9, 0, 9); c.quadraticCurveTo(9, 9, 9, -2); c.closePath(); fillStroke(c, '#ff9a6a', 2.4); ell(c, 0, -3, 9, 3.4, '#ffffff', 2.2); [[-3, -4], [2, -3.4], [0, -5]].forEach(p => ell(c, p[0], p[1], 1.6, 1, '#f0e6c8', 0)); },
  book: c => { rr2(c, -12, -8, 24, 17, 3, '#ff7aa8', 2.4); line(c, 0, -8, 0, 9, 2, INK); rr2(c, -10.5, -6.5, 9.5, 14, 1.5, '#fff7ea', 1.6); rr2(c, 1, -6.5, 9.5, 14, 1.5, '#fff7ea', 1.6); [-3, 1, 5].forEach(y => { line(c, -9, y, -3, y, 1, '#9aa7d8'); line(c, 2.5, y, 8.5, y, 1, '#9aa7d8'); }); },
  pencil: c => { c.save(); c.rotate(-0.7); rr2(c, -2.6, -10, 5.2, 16, 1, '#ffd34f', 2.2); poly(c, [[-2.6, 6], [2.6, 6], [0, 11]], '#f6d6a8', 2); poly(c, [[-0.9, 9], [0.9, 9], [0, 11]], INK, 1); rr2(c, -2.6, -13, 5.2, 4, 1.4, '#ff7aa8', 2); c.restore(); },
  mic: c => { line(c, 0, 8, 0, -3, 4.2, INK); line(c, 0, 8, 0, -3, 2, '#7a6aa8'); cir(c, 0, -7, 5.6, lgv(c, -12, -2, '#e8eefb', '#9aa7c8'), 2.4); [[-2, -9], [2, -9], [0, -6]].forEach(p => cir(c, p[0], p[1], 0.9, '#7a6aa8', 0)); },
  toothbrush: c => { c.save(); c.rotate(-0.5); rr2(c, -2, -3, 4, 15, 2, '#5aa8ff', 2.2); rr2(c, -3, -10, 6, 8, 1.6, '#ffffff', 2.2); [-1.6, 0, 1.6].forEach(x => line(c, x, -10, x, -13, 1.2, '#4cc26a')); c.restore(); },
  ball: c => { cir(c, 0, 0, 8.4, lgv(c, -8, 8, '#ff7a5a', '#e0432a'), 2.4); c.beginPath(); c.arc(0, 0, 8.4, 0, 7); c.save(); c.clip(); line(c, -9, 0, 9, 0, 1.8, '#ffffff'); c.beginPath(); c.arc(-8, 0, 7, -1.2, 1.2); c.lineWidth = 1.8; c.strokeStyle = '#fff'; c.stroke(); c.beginPath(); c.arc(8, 0, 7, Math.PI - 1.2, Math.PI + 1.2); c.stroke(); c.restore(); },
  egg: c => { ell(c, 0, 0, 6.4, 8.2, lgv(c, -8, 8, '#fffdf5', '#f0e4c8'), 2.4); },
  bread: c => { c.beginPath(); c.moveTo(-9, 5); c.lineTo(-9, -3); c.quadraticCurveTo(-11, -9, -4, -9); c.lineTo(4, -9); c.quadraticCurveTo(11, -9, 9, -3); c.lineTo(9, 5); c.closePath(); fillStroke(c, '#f0b868', 2.4); rr2(c, -6.5, -5, 13, 9, 3, '#fff0cf', 1.6); },
  flag: c => { line(c, -3, 10, -3, -10, 2.6, INK); poly(c, [[-3, -10], [10, -6], [-3, -2]], '#ff5e8a', 2); },
  note: c => { cir(c, -2, 5, 3.6, INK, 0); line(c, 1.4, 5, 1.4, -8, 2.2, INK); c.beginPath(); c.moveTo(1.4, -8); c.quadraticCurveTo(7, -7, 6, -1); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke(); }
};

/* ---------- ตัวละครประจำเกม ---------- */
const CAST = {
  // ผู้ชาย: ผมสั้น กางเกง · ผู้หญิง: ผมยาว/มัดผม โบว์ กระโปรง (เด็กเล็กแยกเพศจากภาพได้ทันที ใช้ตัดสิน he / she)
  tom: { skin: SKINS[1], hairStyle: 'spiky', hair: '#2a1f1a', shirt: '#3d8bff', pants: '#3a4a8c' },
  mei: { skin: SKINS[0], hairStyle: 'bob', hair: '#1f1a2a', shirt: '#ff6fa5', pants: SKINS[0], skirt: '#8a5cf0', bow: '#ff3d7a' },
  ben: { skin: SKINS[2], hairStyle: 'short', hair: '#2a1a10', shirt: '#3fbf6a', pants: '#3a5a7a' },
  anna: { skin: SKINS[0], hairStyle: 'pony', hair: '#6a3a1a', shirt: '#ffb02e', pants: SKINS[0], skirt: '#ff6fa5', bow: '#e8306e', bowX: 20, bowY: -32 },
  mom: { skin: SKINS[1], hairStyle: 'bun', hair: '#2a1f2a', shirt: '#b48cff', pants: SKINS[1], adult: true, skirt: '#7a4ab8' },
  dad: { skin: SKINS[2], hairStyle: 'short', hair: '#2a2a32', shirt: '#4a8cc2', pants: '#3a3a5a', adult: true, collar: '#ffffff' },
  teacherF: { skin: SKINS[1], hairStyle: 'long', hair: '#3a2418', shirt: '#ff7a5a', pants: SKINS[1], adult: true, glasses: true, skirt: '#4a4a8a' },
  teacherM: { skin: SKINS[2], hairStyle: 'short', hair: '#1f1f2a', shirt: '#5a7ad8', pants: '#3a3a5a', adult: true, glasses: true, collar: '#ffffff' },
  baby: { skin: SKINS[0], hairStyle: 'baby', hair: '#4a2a14', shirt: '#ffe27a', pants: '#ffe27a', scale: 0.72 },
  brother: { skin: SKINS[1], hairStyle: 'short', hair: '#2a1f1a', shirt: '#ff8a3c', pants: '#3a4a8c' },
  sister: { skin: SKINS[0], hairStyle: 'long', hair: '#2a1f2a', shirt: '#ff8ac8', pants: SKINS[0], skirt: '#7a5ac8', bow: '#ffd34f' },
  doctor: { skin: SKINS[1], hairStyle: 'short', hair: '#2a1f1a', shirt: '#ffffff', pants: '#5a8ac8', adult: true, collar: '#58c2e8' }
};
function cast(c, id, o) { kid(c, Object.assign({}, CAST[id] || CAST.tom, o || {})); }

/* ---------- ท่าทาง (ชุดมุมแขนขา + การตกแต่งเพิ่ม) ---------- */
const POSES = {
  stand: {}, wave: { ra: 150, mood: 'happy' }, point: { ra: 95 }, hold: { la: -55, ra: -55 },
  run: { tilt: 7, la: 50, ra: -45, ll: 38, rl: -26, mood: 'happy' }, walk: { ll: 20, rl: -18, la: 22, ra: -22 },
  jump: { la: 150, ra: 150, ll: 20, rl: 20, cy: 53, scale: 0.92, mood: 'happy' }, dance: { la: 150, ra: 45, ll: 4, rl: 34, tilt: 6, mood: 'happy' },
  sing: { ra: -128, mood: 'open', prop: { k: 'mic', hand: 'r', dy: -4, dx: -1, s: 1.1 } },
  eat: { ra: -128, mood: 'open', prop: { k: 'apple', hand: 'r', dy: -6, dx: -2 } },
  drink: { ra: -128, mood: 'smile', prop: { k: 'cup', hand: 'r', dy: -6, dx: -1 } },
  read: { la: -62, ra: -62, mood: 'smile' }, write: { ra: -58, la: 10, mood: 'smile', prop: { k: 'pencil', hand: 'r', dy: 2, dx: 1 } },
  play: { la: 40, ra: 40, ll: 18, rl: -8, mood: 'happy' }, brush: { ra: -128, mood: 'open', prop: { k: 'toothbrush', hand: 'r', dy: -5, dx: -1, rot: 40 } }
};

/* ---------- ฉากท่าทางที่ต้องมีของประกอบ ---------- */
const WATER = c => { c.beginPath(); c.moveTo(4, 70); for (let x = 4; x <= 96; x += 10) c.quadraticCurveTo(x + 2.5, 64, x + 5, 70), c.quadraticCurveTo(x + 7.5, 76, x + 10, 70); c.lineTo(96, 96); c.lineTo(4, 96); c.closePath(); c.fillStyle = 'rgba(80,170,255,.8)'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = '#2f7fd4'; c.stroke(); };
const SCENE_ACT = {
  swim: (c, who) => { cast(c, who, { cy: 60, scale: 0.95, la: 105, ra: 70, ll: 8, rl: 8, mood: 'happy' }); WATER(c); [[22, 74], [60, 80], [82, 72]].forEach(p => { cir(c, p[0], p[1], 2.4, 'rgba(255,255,255,.7)', 0); }); },
  sleep: (c, who) => {
    c.save(); c.translate(5, 0); rr2(c, 8, 62, 84, 20, 8, '#8c7ae0', 3); rr2(c, 10, 52, 28, 14, 7, '#ffffff', 3);
    c.save(); c.translate(36, 60); c.rotate(-Math.PI / 2 + 0.06); c.scale(0.8, 0.8);
    kid(c, Object.assign({}, CAST[who] || CAST.tom, { cx: 0, cy: 0, mood: 'sleep', la: 4, ra: 4, ll: 2, rl: 2 })); c.restore();
    rr2(c, 34, 58, 56, 22, 8, 'rgba(255,140,170,.92)', 3); [48, 62, 76].forEach(x => line(c, x, 60, x, 78, 1.6, 'rgba(255,255,255,.5)'));
    c.fillStyle = '#5a7ae8'; c.font = '700 15px Kanit, sans-serif'; c.fillText('Z', 56, 40); c.font = '700 11px Kanit'; c.fillText('z', 70, 30); c.font = '700 8px Kanit'; c.fillText('z', 80, 22); c.restore();
  },
  read: (c, who) => { cast(c, who, { cy: 52, la: -66, ra: -66, mood: 'smile' }); c.save(); c.translate(50, 70); PROPS.book(c); c.restore(); },
  write: (c, who) => { rr2(c, 8, 70, 84, 8, 3, '#d9a066', 3); rr2(c, 14, 78, 8, 18, 2, '#b07a44', 2.4); rr2(c, 78, 78, 8, 18, 2, '#b07a44', 2.4); cast(c, who, { cy: 50, la: -60, ra: -62, mood: 'smile', prop: { k: 'pencil', hand: 'r', dy: 4, dx: -1 } }); rr2(c, 30, 64, 40, 8, 1.6, '#ffffff', 2.4); line(c, 36, 68, 56, 68, 1.4, '#9aa7d8'); },
  play: (c, who) => { shadow(c, 50, 92, 28, 4); cast(c, who, { cy: 52, la: 40, ra: 40, ll: 18, rl: -6, mood: 'happy' }); c.save(); c.translate(76, 84); PROPS.ball(c); c.restore(); },
  eat: (c, who) => { cast(c, who, POSES.eat); },
  drink: (c, who) => { cast(c, who, POSES.drink); },
  sing: (c, who) => { cast(c, who, POSES.sing); [[16, 24, 1], [84, 30, 0.8], [20, 52, 0.7]].forEach(p => { c.save(); c.translate(p[0], p[1]); c.scale(p[2] * 1.5, p[2] * 1.5); PROPS.note(c); c.restore(); }); },
  dance: (c, who) => { cast(c, who, POSES.dance); [[14, 30, 1], [86, 24, 0.9]].forEach(p => { c.save(); c.translate(p[0], p[1]); c.scale(p[2] * 1.5, p[2] * 1.5); PROPS.note(c); c.restore(); }); },
  run: (c, who) => { shadow(c, 50, 92, 26, 4); line(c, 8, 38, 20, 38, 3, 'rgba(120,130,200,.5)'); line(c, 6, 48, 22, 48, 3, 'rgba(120,130,200,.5)'); cast(c, who, Object.assign({}, POSES.run, { cx: 56 })); },
  jump: (c, who) => { shadow(c, 50, 93, 16, 3); cast(c, who, POSES.jump); [[24, 30], [78, 28]].forEach(p => { line(c, p[0], p[1], p[0], p[1] + 6, 2.4, '#f5a623'); }); },
  walk: (c, who) => { shadow(c, 50, 92, 24, 4); cast(c, who, POSES.walk); }
};
/* ---------- กิจวัตรประจำวัน ---------- */
const SCENE_DAY = {
  wakeup: (c, who) => { // ตื่นนอน: นั่งบนเตียง ยืดแขน พระอาทิตย์ขึ้น
    cir(c, 80, 24, 12, '#ffd34f', 3); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, 80 + Math.cos(a) * 16, 24 + Math.sin(a) * 16, 80 + Math.cos(a) * 21, 24 + Math.sin(a) * 21, 3, '#ffb02e'); }
    rr2(c, 6, 66, 88, 26, 8, '#8c7ae0', 3); rr2(c, 8, 52, 24, 18, 8, '#ffffff', 3);
    cast(c, who, { cy: 54, la: 150, ra: 150, mood: 'open', ll: 0, rl: 0 }); rr2(c, 6, 70, 88, 22, 8, 'rgba(255,140,170,.95)', 3); [22, 40, 58, 76].forEach(x => line(c, x, 72, x, 90, 1.6, 'rgba(255,255,255,.5)'));
  },
  brush: (c, who) => { cast(c, who, Object.assign({}, POSES.brush, { cy: 56 })); [[70, 60], [78, 52], [74, 70]].forEach(p => cir(c, p[0], p[1], 2.6, 'rgba(255,255,255,.95)', 1.6)); rr2(c, 6, 84, 88, 10, 4, '#cfe8ff', 3); },
  bath: (c, who) => { cast(c, who, { cy: 46, la: 120, ra: 40, mood: 'happy', hairStyle: 'short', shirt: '#ffffff' }); rr2(c, 6, 60, 88, 30, 14, '#ffffff', 3); rr2(c, 10, 62, 80, 8, 4, '#bfe6ff', 0); [[20, 58, 5], [32, 54, 3], [76, 56, 6], [86, 50, 3], [60, 52, 4]].forEach(p => cir(c, p[0], p[1], p[2], 'rgba(235,248,255,.95)', 1.8)); rr2(c, 18, 90, 10, 6, 2, '#cfd6e6', 2.4); rr2(c, 72, 90, 10, 6, 2, '#cfd6e6', 2.4); },
  breakfast: (c, who) => { cast(c, who, { cy: 48, la: -50, ra: -128, mood: 'open', prop: { k: 'spoon', hand: 'r', dy: -6, dx: -1 } }); rr2(c, 4, 68, 92, 8, 3, '#d9a066', 3); rr2(c, 10, 76, 8, 18, 2, '#b07a44', 2.4); rr2(c, 82, 76, 8, 18, 2, '#b07a44', 2.4); c.save(); c.translate(26, 64); PROPS.bread(c); c.restore(); c.save(); c.translate(50, 62); ell(c, 0, 4, 11, 3.6, '#ffffff', 2.2); PROPS.egg(c); c.restore(); c.save(); c.translate(76, 60); PROPS.milk(c); c.restore(); },
  school: (c, who) => { rr2(c, 56, 20, 38, 44, 3, '#ff9a6a', 3); poly(c, [[52, 20], [75, 4], [98, 20]], '#e0405a', 3); rr2(c, 68, 44, 14, 20, 2, '#7a5a3a', 2.4); [[60, 28], [84, 28]].forEach(p => rr2(c, p[0], p[1], 8, 9, 1, '#bfe6ff', 2)); shadow(c, 38, 92, 22, 4); rr2(c, 6, 40, 28, 34, 8, '#ff5e8a', 3); line(c, 6, 50, 34, 50, 2, '#ffffff'); cast(c, who, Object.assign({}, POSES.walk, { cx: 36, cy: 54, scale: 0.9, mood: 'happy' })); c.save(); c.translate(22, 52); rr2(c, -2, 0, 4, 26, 2, '#ff5e8a', 2); c.restore(); },
  homework: (c, who) => { cast(c, who, { cy: 46, la: -60, ra: -64, mood: 'smile', prop: { k: 'pencil', hand: 'r', dy: 4, dx: -1 } }); rr2(c, 4, 66, 92, 8, 3, '#d9a066', 3); rr2(c, 12, 74, 8, 20, 2, '#b07a44', 2.4); rr2(c, 80, 74, 8, 20, 2, '#b07a44', 2.4); c.save(); c.translate(30, 62); PROPS.book(c); c.restore(); rr2(c, 56, 60, 24, 7, 1.4, '#ffffff', 2.4); line(c, 60, 63, 76, 63, 1.2, '#9aa7d8'); },
  bed: (c, who) => { cir(c, 78, 22, 11, '#fff3b0', 3); cir(c, 83, 19, 9, '#8fd8ff', 0); c.beginPath(); c.arc(78, 22, 11, 0, 7); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); [[18, 20], [34, 12], [58, 26]].forEach(p => poly(c, [[p[0], p[1] - 5], [p[0] + 1.6, p[1] - 1.6], [p[0] + 5, p[1] - 1.6], [p[0] + 2.2, p[1] + 1], [p[0] + 3.2, p[1] + 5], [p[0], p[1] + 2.6], [p[0] - 3.2, p[1] + 5], [p[0] - 2.2, p[1] + 1], [p[0] - 5, p[1] - 1.6], [p[0] - 1.6, p[1] - 1.6]], '#ffd34f', 1.8)); SCENE_ACT.sleep(c, who); }
};
