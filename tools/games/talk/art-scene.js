/* ===== Techno Talk: ตัวประกอบภาพ (spec › ภาพ) พื้นหลังเวกเตอร์ และเท็กซ์เจอร์ที่แคชแล้ว =====
   ทุกภาพในเกมอธิบายด้วย "spec" (ข้อมูลล้วน JSON ได้) แล้ว picTex(scene, spec, w, h) วาดเป็นเท็กซ์เจอร์
   spec: { k:'kid', id, mood, pose, o } · { k:'animal', id, n } · { k:'thing', id, n, tint } · { k:'act', id, who } · { k:'day', id, who }
         { k:'pron', id }  ฉากอธิบายสรรพนาม (ผู้พูดชี้ไปที่คนที่พูดถึงพร้อมวงล้อม) · { k:'group', items:[spec...], ring } วางเรียงข้างกัน */
const K_ = (id, mood, pose, o) => ({ k: 'kid', id, mood, pose, o });
const A_ = (id, n) => ({ k: 'animal', id, n: n || 1 });
const T_ = (id, n, tint) => ({ k: 'thing', id, n: n || 1, tint });
const ACT_ = (id, who) => ({ k: 'act', id, who: who || 'tom' });
const DAY_ = (id, who) => ({ k: 'day', id, who: who || 'tom' });
const PR_ = id => ({ k: 'pron', id });
const G_ = (...items) => ({ k: 'group', items });

// วาดชิ้นเดียวลงช่อง 100x100
function drawOne(c, s) {
  switch (s.k) {
    case 'kid': { const base = POSES[s.pose] || {}, o = Object.assign({}, base, s.o || {}); if (s.mood) o.mood = s.mood; if (o.cy == null) o.cy = 54; if (!o.noShadow) shadow(c, 50, 95, 22, 3.4); cast(c, s.id, o); break; }
    case 'animal': ANIMALS[s.id](c); break;
    case 'thing': THINGS[s.id](c, s.tint ? (COLOR_HEX[s.tint] || s.tint) : null); break;
    case 'act': SCENE_ACT[s.id](c, s.who); break;
    case 'day': SCENE_DAY[s.id](c, s.who); break;
    case 'tp': if (typeof THAI_PIC !== 'undefined' && THAI_PIC[s.id]) THAI_PIC[s.id](c); break;
  }
}
// ขยายสำเนา n ชิ้น
function expandItems(items) { const out = []; items.forEach(it => { const n = it.n || 1; for (let i = 0; i < n; i++) out.push(Object.assign({}, it, { n: 1 })); }); return out; }
function drawRing(c, x, y, w, h, col) { c.save(); c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); c.fillStyle = col + '33'; c.fill(); c.setLineDash([10, 7]); c.lineWidth = 4; c.strokeStyle = col; c.stroke(); c.restore(); }
// มือชี้ (นิ้วชี้ยื่นไปทางขวา) ปลายนิ้วอยู่ที่ (tx,ty) หมุน ang เรเดียน ขนาด k · แขนเสื้อยาวออกไปด้านหลังจนพ้นขอบภาพ = มือของ 'คนที่กำลังพูดกับเธอ'
function drawPointer(c, tx, ty, ang, k, sleeve) {
  const skin = SKINS[1]; c.save(); c.translate(tx, ty); c.rotate(ang); c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round';
  rr2(c, -220, -9, 168, 34, 8, sleeve || '#8a5cf0', 3); rr2(c, -64, -10, 11, 36, 4, '#ffffff', 3);
  rr2(c, -56, -7, 30, 32, 12, skin, 3);
  [5, 12, 19].forEach((y, i) => rr2(c, -33 + i, y, 9 - i, 7, 3.5, skin, 2.4));
  rr2(c, -36, -5, 36, 10, 5, skin, 3); c.beginPath(); c.arc(-4.5, 0, 2.6, -1.3, 1.3); c.lineWidth = 1.6; c.strokeStyle = 'rgba(45,42,94,.5)'; c.stroke();
  rr2(c, -50, 1, 17, 8, 4, skin, 2.6);
  c.restore();
}
// ลูกโป่งคำพูด (มีจุดสามจุด) หางชี้ไปที่ผู้พูด (tx,ty)
function drawBubble(c, bx, by, bw, bh, tx, ty) {
  const nx = tx - bx, ny = ty - by, L = Math.hypot(nx, ny) || 1, px = -ny / L, py = nx / L, b0x = bx + nx / L * bh * 0.32, b0y = by + ny / L * bh * 0.32;
  const tail = [[b0x + px * bh * 0.18, b0y + py * bh * 0.18], [tx, ty], [b0x - px * bh * 0.18, b0y - py * bh * 0.18]];
  poly(c, tail, '#ffffff', 3); rrp(c, bx - bw / 2, by - bh / 2, bw, bh, bh / 2); fillStroke(c, '#ffffff', 3);
  c.beginPath(); c.moveTo(tail[0][0], tail[0][1]); c.lineTo(tail[2][0], tail[2][1]); c.lineTo(b0x - nx / L * bh * 0.2, b0y - ny / L * bh * 0.2); c.closePath(); c.fillStyle = '#ffffff'; c.fill();
  [-1, 0, 1].forEach(i => cir(c, bx + i * bw * 0.22, by, Math.max(2, bh * 0.09), INK, 0));
}
// ฉากสรรพนาม (ทอมเป็นคนพูดเสมอ วงล้อมสีชมพู = คนที่คำนั้นหมายถึง)
//   I = ทอมชี้ที่ตัวเอง · we = ทอมกับเหมยด้วยกัน
//   you = ทอมกับเหมยหันหน้าคุยกันสองคน (ลูกโป่งคำพูดไปหาเหมย) › คนที่เรากำลังคุยด้วย
//   he / she / it / they = ทอมกระซิบบอกเหมย แล้วชี้ไปที่อีกคนที่ยืนอยู่ไกลออกไป › คนที่เราพูดถึง ไม่ได้คุยด้วย
function drawPron(c, id, W, H) {
  const col = '#ff5e8a', S = Math.min(H, W / 2.1), cell = (x, s, spec, dy) => { c.save(); c.translate(x - s / 2, H / 2 - s / 2 + 2 + (dy || 0)); c.scale(s / 100, s / 100); drawOne(c, spec); c.restore(); };
  const arrow = (x1, x2, y) => { c.save(); c.lineCap = 'round'; c.setLineDash([1, 13]); c.lineWidth = 9; c.strokeStyle = col; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2 - 10, y); c.stroke(); c.setLineDash([]); poly(c, [[x2 - 16, y - 10], [x2 + 4, y], [x2 - 16, y + 10]], col, 2.6); c.restore(); };
  if (id === 'I') { drawRing(c, W / 2, H / 2, S * 1.05, S * 1.1, col); cell(W / 2, S * 0.92, K_('tom', 'happy', null, { la: 6, ra: -62 })); c.save(); c.translate(W / 2 + S * 0.46, H / 2 - S * 0.1); c.scale(0.5 * S / 100, 0.5 * S / 100); poly(c, [[0, 0], [-30, -8], [-30, 8]], col, 3); c.restore(); }
  else if (id === 'we') { drawRing(c, W / 2, H / 2, S * 1.7, S * 1.1, col); cell(W / 2 - S * 0.42, S * 0.9, K_('tom', 'happy', null, { ra: -62 })); cell(W / 2 + S * 0.42, S * 0.9, K_('mei', 'happy', null, { la: -62 })); }
  else if (id === 'you') {
    const s = S * 0.9, tx = W * 0.27, mx = W * 0.71;
    drawRing(c, mx, H / 2, s * 0.86, s * 1.08, col);
    cell(tx, s, K_('tom', 'happy', null, { ra: 88 })); cell(mx, s, K_('mei', 'happy', null, { la: 140 }));
    drawBubble(c, W * 0.5, H / 2 - s * 0.36, s * 0.42, s * 0.22, tx + s * 0.1, H / 2 - s * 0.22);
  } else {
    const subj = { he: [K_('ben', 'happy')], she: [K_('anna', 'happy')], it: [A_('cat')], they: [K_('ben', 'happy'), K_('anna', 'happy'), K_('brother', 'happy')] }[id], n = subj.length;
    const ss = S * (n > 1 ? 0.6 : 0.74), gx = W * 0.76, spread = n > 1 ? ss * 0.62 : 0, s = S * 0.82, tx = W * 0.27, lx = W * 0.1;
    cell(lx, s * 0.84, K_('mei', 'smile', null, { la: 6, ra: 6 }), s * 0.07); cell(tx, s, K_('tom', 'smile', null, { ra: 92 }));
    drawBubble(c, (lx + tx) / 2 - s * 0.02, H / 2 - s * 0.52, s * 0.3, s * 0.17, tx - s * 0.04, H / 2 - s * 0.3);
    drawRing(c, gx, H / 2 + ss * 0.08, n > 1 ? ss * 2.05 : ss * 0.92, ss * 1.1, col); subj.forEach((sp, i) => cell(gx + (i - (n - 1) / 2) * spread, ss, sp, ss * 0.08));
    arrow(tx + s * 0.4, gx - (n > 1 ? ss * 1.08 : ss * 0.5), H / 2 - s * 0.06);
  }
}
// วาด spec ลงผืนผ้าใบ W x H (หน่วยออกแบบ)
// spec.mark = 'you': เว้นที่มุมซ้ายล่างแล้ววาดมือชี้เข้าหาคนแรกในภาพ (ภาพประโยคที่ขึ้นต้นด้วย you จะได้ไม่เหมือนภาพ he / she)
function drawSpec(c, spec, W, H) {
  if (spec.k === 'pron') { drawPron(c, spec.id, W, H); return; }
  const you = spec.mark === 'you', ox = you ? W * 0.2 : 0, AW = W - ox;
  const items = spec.k === 'group' ? expandItems(spec.items) : expandItems([spec]), n = items.length, s = Math.min(H * (you ? 0.96 : 1), AW / (1 + (n - 1) * 0.78)), total = s * (1 + (n - 1) * 0.78), x0 = ox + (AW - total) / 2;
  if (spec.ring) drawRing(c, W / 2, H / 2, total + 16, s + 10, spec.ring);
  items.forEach((it, i) => { c.save(); c.translate(x0 + i * s * 0.78, (H - s) / 2); c.scale(s / 100, s / 100); c.lineJoin = 'round'; c.lineCap = 'round'; drawOne(c, it); c.restore(); });
  if (you) { const tx = x0 + s * 0.25, ty = (H - s) / 2 + s * 0.5, bx = Math.max(2, ox * 0.1), by = H * 0.99; drawPointer(c, tx, ty, Math.atan2(ty - by, tx - bx), s / 210); }
}
const specKey = s => JSON.stringify(s);
function picTex(scene, spec, w, h) { return KG.tex(scene, 'tk|' + specKey(spec) + '|' + w + 'x' + (h || w), w, h || w, c => drawSpec(c, spec, w, h || w)); }
// ภาพเล็กวางในชิป/ป้าย: คืน Image ที่ตั้งขนาดแล้ว
function picImage(scene, spec, x, y, w, h) { h = h || w; return scene.add.image(x, y, picTex(scene, spec, Math.round(w * 1.25), Math.round(h * 1.25))).setDisplaySize(w, h); }

/* ---------- พื้นหลังเวกเตอร์ 1280x720 (ทุ่งหญ้า / เย็น / กลางคืน) ---------- */
const BG_THEMES = {
  meadow: { sky: ['#6fd0ff', '#d8f6ff'], sun: '#ffe566', far: '#8fe08a', near: '#58c864', ground: '#3fb84a', cloud: '#ffffff' },
  sunset: { sky: ['#ff9a8a', '#ffe9b8'], sun: '#ffb347', far: '#c8d86a', near: '#8ac858', ground: '#58b04a', cloud: '#fff4e6' },
  dusk: { sky: ['#4a3a98', '#ffb88a'], sun: '#fff3b0', far: '#5a7ac0', near: '#3f9a8a', ground: '#2f7a6a', cloud: '#ffd6c8' }
};
function bgTex(scene, theme) {
  return KG.tex(scene, 'tk-bg|' + theme, 1280, 720, c => {
    const T = BG_THEMES[theme] || BG_THEMES.meadow, g = c.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, T.sky[0]); g.addColorStop(1, T.sky[1]); c.fillStyle = g; c.fillRect(0, 0, 1280, 720);
    // พระอาทิตย์/ดวงจันทร์พร้อมรัศมี
    const sx = theme === 'dusk' ? 1020 : 230, sy = theme === 'dusk' ? 150 : 140; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; c.beginPath(); c.moveTo(sx + Math.cos(a - 0.08) * 90, sy + Math.sin(a - 0.08) * 90); c.lineTo(sx + Math.cos(a) * 150, sy + Math.sin(a) * 150); c.lineTo(sx + Math.cos(a + 0.08) * 90, sy + Math.sin(a + 0.08) * 90); c.closePath(); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill(); }
    c.beginPath(); c.arc(sx, sy, 62, 0, 7); c.fillStyle = T.sun; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(45,42,94,.5)'; c.stroke();
    if (theme === 'dusk') { for (let i = 0; i < 40; i++) { const x = (i * 211) % 1280, y = (i * 97) % 300 + 20; c.beginPath(); c.arc(x, y, 1.6 + (i % 3), 0, 7); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); } }
    // เมฆ
    const cloud = (x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); const parts = [[0, 0, 34], [40, -12, 40], [86, 0, 32]]; c.strokeStyle = 'rgba(45,42,94,.35)'; c.lineWidth = 9; c.lineJoin = 'round'; parts.forEach(p => { c.beginPath(); c.arc(p[0], p[1], p[2], 0, 7); c.stroke(); }); c.beginPath(); c.rect(0, 0, 86, 34); c.stroke(); c.fillStyle = T.cloud; parts.forEach(p => { c.beginPath(); c.arc(p[0], p[1], p[2], 0, 7); c.fill(); }); c.fillRect(0, 0, 86, 34); c.restore(); };
    cloud(420, 120, 1); cloud(760, 70, 0.8); cloud(1010, 200, 1.1); cloud(60, 270, 0.7);
    // เนินเขา
    const hill = (y, amp, col, ph) => { c.beginPath(); c.moveTo(0, 720); c.lineTo(0, y); for (let x = 0; x <= 1280; x += 20) c.lineTo(x, y + Math.sin(x / 190 + ph) * amp); c.lineTo(1280, 720); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(45,42,94,.45)'; c.stroke(); };
    hill(470, 34, T.far, 0.4); hill(540, 28, T.near, 2.1); hill(620, 20, T.ground, 4);
    // ดอกไม้และต้นไม้เล็ก
    for (let i = 0; i < 34; i++) { const x = (i * 97 + 31) % 1280, y = 560 + (i * 53) % 150, col = ['#ff7ab8', '#ffd34f', '#ffffff', '#ff9a6a'][i % 4]; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fillStyle = col; c.fill(); c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fillStyle = '#ffb02e'; c.fill(); }
  });
}
