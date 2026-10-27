/* ===== ภาพประกอบบนกระดาษทด: กรอบสิบ หลักทรัพย์ฐานสิบ รูปเศษส่วน นาฬิกา เงิน ไม้บรรทัด แผนภูมิรูปภาพ แผนภูมิแท่ง =====
   FIG.draw(scene, cont, fig, cx, top, maxW, maxH) วาดลงคอนเทนเนอร์ของโจทย์ (ลบทิ้งพร้อมโจทย์) คืน { h: ความสูงที่ใช้, live: ตัวควบคุมรูประบายสี } */
const FIG = (function () {
  'use strict';
  const C = { ink: 0x27324f, line: 0x9fb3d6, red: 0xe8452c, orange: 0xff8a3d, blue: 0x3d7bff, green: 0x22b45a, purple: 0x8a5cf0, gold: 0xffc23d, white: 0xffffff };
  const mt = (scene, x, y, s, size, color, o) => { o = o || {}; const t = scene.add.text(x, y, String(s), { fontFamily: MFONT, fontSize: size + 'px', fontStyle: o.weight || '600', color: color || INK.text, resolution: KG.K, padding: { left: 2, right: 2, top: Math.ceil(size * 0.25), bottom: Math.ceil(size * 0.15) } }); t.setOrigin(o.ox == null ? 0.5 : o.ox, o.oy == null ? 0.5 : o.oy); return t; };
  const F = {};

  /* ---------- กรอบสิบ (นับ 1–20) ---------- */
  F.dots = (s, cont, f, cx, top) => {
    const n = f.n, frames = n > 10 ? 2 : 1, cs = 44, fw = cs * 5, gap = 34, tw = frames * fw + (frames - 1) * gap, g = s.add.graphics(); cont.add(g);
    for (let fi = 0; fi < frames; fi++) {
      const x0 = cx - tw / 2 + fi * (fw + gap), y0 = top + 6;
      g.fillStyle(0xffffff, 1); g.fillRoundedRect(x0, y0, fw, cs * 2, 8); g.lineStyle(3, C.ink, 1); g.strokeRoundedRect(x0, y0, fw, cs * 2, 8);
      g.lineStyle(2, C.line, 1); for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x0 + i * cs, y0); g.lineTo(x0 + i * cs, y0 + cs * 2); g.strokePath(); } g.beginPath(); g.moveTo(x0, y0 + cs); g.lineTo(x0 + fw, y0 + cs); g.strokePath();
      const k = Math.min(10, n - fi * 10);
      for (let i = 0; i < k; i++) { const x = x0 + (i % 5) * cs + cs / 2, y = y0 + Math.floor(i / 5) * cs + cs / 2; g.fillStyle(0xb0281e, 1); g.fillCircle(x + 1, y + 2, 15); g.fillStyle(C.red, 1); g.fillCircle(x, y, 15); g.fillStyle(0xffffff, 0.45); g.fillCircle(x - 5, y - 5, 5); }
    }
    return { h: cs * 2 + 16 };
  };

  /* ---------- หลักทรัพย์ฐานสิบ: ก้อนพัน แผ่นร้อย แท่งสิบ ก้อนหน่วย ---------- */
  F.blocks = (s, cont, f, cx, top) => {
    const g = s.add.graphics(); cont.add(g);
    const groups = [], gap = 40;
    const cube = (x, y) => { const a = 46, d = 18; g.fillStyle(0xb79cff, 1); g.fillRect(x, y + d, a, a); g.fillStyle(0xd7c8ff, 1); g.fillPoints([{ x, y: y + d }, { x: x + d, y }, { x: x + a + d, y }, { x: x + a, y: y + d }], true); g.fillStyle(0x8a5cf0, 1); g.fillPoints([{ x: x + a, y: y + d }, { x: x + a + d, y }, { x: x + a + d, y: y + a }, { x: x + a, y: y + a + d }], true); g.lineStyle(2, 0x3b1f88, 1); g.strokeRect(x, y + d, a, a); g.lineStyle(1, 0x3b1f88, 0.35); for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x + i * a / 5, y + d); g.lineTo(x + i * a / 5, y + d + a); g.strokePath(); g.beginPath(); g.moveTo(x, y + d + i * a / 5); g.lineTo(x + a, y + d + i * a / 5); g.strokePath(); } };
    const flat = (x, y) => { const a = 54; g.fillStyle(0x8fb8ff, 1); g.fillRect(x, y, a, a); g.lineStyle(1, 0x1f4fbf, 0.45); for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(x + i * a / 10, y); g.lineTo(x + i * a / 10, y + a); g.strokePath(); g.beginPath(); g.moveTo(x, y + i * a / 10); g.lineTo(x + a, y + i * a / 10); g.strokePath(); } g.lineStyle(2.5, 0x1f4fbf, 1); g.strokeRect(x, y, a, a); };
    const rod = (x, y) => { const w = 11, h = 64; g.fillStyle(0x7fe0a0, 1); g.fillRect(x, y, w, h); g.lineStyle(1, 0x137a3c, 0.6); for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(x, y + i * h / 10); g.lineTo(x + w, y + i * h / 10); g.strokePath(); } g.lineStyle(2, 0x137a3c, 1); g.strokeRect(x, y, w, h); };
    const one = (x, y) => { g.fillStyle(0xffb36b, 1); g.fillRect(x, y, 13, 13); g.lineStyle(2, 0xb05a10, 1); g.strokeRect(x, y, 13, 13); };
    if (f.th) groups.push({ w: Math.min(f.th, 2) * 70, h: Math.ceil(f.th / 2) * 70, draw: (x, y) => { for (let i = 0; i < f.th; i++) cube(x + (i % 2) * 70, y + Math.floor(i / 2) * 70); }, label: 'พัน' });
    if (f.h) groups.push({ w: Math.min(f.h, 3) * 62, h: Math.ceil(f.h / 3) * 62, draw: (x, y) => { for (let i = 0; i < f.h; i++) flat(x + (i % 3) * 62, y + Math.floor(i / 3) * 62); }, label: 'ร้อย' });
    if (f.t) groups.push({ w: f.t * 17, h: 64, draw: (x, y) => { for (let i = 0; i < f.t; i++) rod(x + i * 17, y); }, label: 'สิบ' });
    if (f.o) groups.push({ w: Math.min(f.o, 3) * 18, h: Math.ceil(f.o / 3) * 18, draw: (x, y) => { for (let i = 0; i < f.o; i++) one(x + (i % 3) * 18, y + Math.floor(i / 3) * 18); }, label: 'หน่วย' });
    const tw = groups.reduce((a, gr) => a + gr.w, 0) + gap * (groups.length - 1), H = Math.max(...groups.map(gr => gr.h));
    let x = cx - tw / 2; groups.forEach(gr => { gr.draw(x, top + 6 + (H - gr.h) / 2); x += gr.w + gap; });
    return { h: H + 16 };
  };

  /* ---------- รูปเศษส่วน (วงกลม แถบ ตาราง) ---------- */
  const GRID = { 4: [2, 2], 6: [2, 3], 8: [2, 4], 9: [3, 3], 10: [2, 5], 12: [3, 4] };
  F.frac = (s, cont, f, cx, top, maxW, maxH) => {
    const den = f.den, g = s.add.graphics(); cont.add(g);
    const on = Array.from({ length: den }, (_, i) => i < f.num); let focus = -1;
    let shape = f.shape; if (shape === 'grid' && !GRID[den]) shape = 'bar';
    let geo;
    if (shape === 'circle') { const R = Math.min(118, maxH / 2 - 8); geo = { R, cx, cy: top + R + 6, h: R * 2 + 14 }; }
    else if (shape === 'bar') { const w = Math.min(maxW * 0.8, 560), h = 92; geo = { x: cx - w / 2, y: top + 8, w, h, cw: w / den, h2: h + 18 }; geo.h = h + 18; }
    else { const [r, c] = GRID[den], cs = Math.min(70, (maxH - 20) / r); geo = { x: cx - c * cs / 2, y: top + 8, r, c, cs, h: r * cs + 18 }; }
    const draw = () => {
      g.clear();
      for (let i = 0; i < den; i++) {
        const col = on[i] ? C.orange : C.white;
        if (shape === 'circle') { const a0 = -Math.PI / 2 + i * Math.PI * 2 / den, a1 = a0 + Math.PI * 2 / den; g.fillStyle(col, 1); g.slice(geo.cx, geo.cy, geo.R, a0, a1, false); g.fillPath(); g.lineStyle(3, C.ink, 1); g.slice(geo.cx, geo.cy, geo.R, a0, a1, false); g.strokePath(); }
        else if (shape === 'bar') { g.fillStyle(col, 1); g.fillRect(geo.x + i * geo.cw, geo.y, geo.cw, 92); g.lineStyle(3, C.ink, 1); g.strokeRect(geo.x + i * geo.cw, geo.y, geo.cw, 92); }
        else { const x = geo.x + (i % geo.c) * geo.cs, y = geo.y + Math.floor(i / geo.c) * geo.cs; g.fillStyle(col, 1); g.fillRect(x, y, geo.cs, geo.cs); g.lineStyle(3, C.ink, 1); g.strokeRect(x, y, geo.cs, geo.cs); }
      }
      if (focus >= 0) { g.lineStyle(5, 0x22b45a, 1); const i = focus; if (shape === 'circle') { const a0 = -Math.PI / 2 + i * Math.PI * 2 / den; g.slice(geo.cx, geo.cy, geo.R + 2, a0, a0 + Math.PI * 2 / den, false); g.strokePath(); } else if (shape === 'bar') g.strokeRect(geo.x + i * geo.cw + 2, geo.y + 2, geo.cw - 4, 88); else g.strokeRect(geo.x + (i % geo.c) * geo.cs + 2, geo.y + Math.floor(i / geo.c) * geo.cs + 2, geo.cs - 4, geo.cs - 4); }
    };
    draw();
    const out = { h: geo.h };
    if (f.live) {
      const pieceAt = (x, y) => {
        if (shape === 'circle') { const dx = x - geo.cx, dy = y - geo.cy; if (Math.hypot(dx, dy) > geo.R) return -1; let a = Math.atan2(dy, dx) + Math.PI / 2; if (a < 0) a += Math.PI * 2; return Math.min(den - 1, Math.floor(a / (Math.PI * 2 / den))); }
        if (shape === 'bar') { if (y < geo.y || y > geo.y + 92 || x < geo.x || x > geo.x + geo.cw * den) return -1; return Math.min(den - 1, Math.floor((x - geo.x) / geo.cw)); }
        const c = Math.floor((x - geo.x) / geo.cs), r = Math.floor((y - geo.y) / geo.cs); if (c < 0 || r < 0 || c >= geo.c || r >= geo.r) return -1; return r * geo.c + c;
      };
      const bw = shape === 'circle' ? geo.R * 2 : shape === 'bar' ? geo.cw * den : geo.c * geo.cs, bh = shape === 'circle' ? geo.R * 2 : shape === 'bar' ? 92 : geo.r * geo.cs, bx = shape === 'circle' ? geo.cx - geo.R : geo.x, by = shape === 'circle' ? geo.cy - geo.R : geo.y;
      const z = s.add.zone(bx + bw / 2, by + bh / 2, bw, bh).setInteractive({ useHandCursor: true }); cont.add(z);
      out.live = {
        count: () => on.filter(Boolean).length, n: den,
        toggle(i) { if (i < 0 || i >= den) return; on[i] = !on[i]; draw(); KG.audio.play(on[i] ? 'pop' : 'remove'); if (out.live.onChange) out.live.onChange(); },
        focus(i) { focus = i; draw(); }, get focused() { return focus; },
        set(n) { for (let i = 0; i < den; i++) on[i] = i < n; draw(); }, lock() { z.disableInteractive(); focus = -1; draw(); }
      };
      z.on('pointerdown', p => { const w = cont.getWorldTransformMatrix(); out.live.toggle(pieceAt(p.worldX - w.tx, p.worldY - w.ty)); });
    }
    return out;
  };

  /* ---------- นาฬิกา ---------- */
  F.clock = (s, cont, f, cx, top, maxW, maxH) => {
    const R = Math.min(122, maxH / 2 - 6), cy = top + R + 4, g = s.add.graphics(); cont.add(g);
    g.fillStyle(0x3d7bff, 1); g.fillCircle(cx, cy, R + 10); g.fillStyle(0xffffff, 1); g.fillCircle(cx, cy, R); g.lineStyle(3, C.ink, 1); g.strokeCircle(cx, cy, R);
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, big = i % 5 === 0, r0 = R - (big ? 14 : 7); g.lineStyle(big ? 3 : 1.5, C.ink, big ? 1 : 0.6); g.beginPath(); g.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); g.lineTo(cx + Math.sin(a) * (R - 2), cy - Math.cos(a) * (R - 2)); g.strokePath(); }
    for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; cont.add(mt(s, cx + Math.sin(a) * (R - 32), cy - Math.cos(a) * (R - 32), i, 26, '#1b2a6b')); }
    const ha = ((f.h % 12) + f.m / 60) * Math.PI / 6, ma = f.m * Math.PI / 30;
    const hand = (a, len, w, col) => { g.lineStyle(w, col, 1); g.beginPath(); g.moveTo(cx - Math.sin(a) * 12, cy + Math.cos(a) * 12); g.lineTo(cx + Math.sin(a) * len, cy - Math.cos(a) * len); g.strokePath(); g.fillStyle(col, 1); g.fillCircle(cx + Math.sin(a) * len, cy - Math.cos(a) * len, w / 2); };
    hand(ha, R * 0.52, 10, 0x1f3d99); hand(ma, R * 0.82, 6, 0xd63a2f); g.fillStyle(C.ink, 1); g.fillCircle(cx, cy, 8);
    cont.add(mt(s, cx + R + 26, cy - 22, 'เข็มสั้น = ชั่วโมง', 17, '#1f3d99', { ox: 0, weight: '400' })); cont.add(mt(s, cx + R + 26, cy + 8, 'เข็มยาว = นาที', 17, '#d63a2f', { ox: 0, weight: '400' }));
    return { h: R * 2 + 18 };
  };

  /* ---------- เงิน: เหรียญและธนบัตร ---------- */
  const NOTE_COL = { 20: [0x7fd28a, 0x1d7a35], 50: [0x8fc4ff, 0x1f5fbf], 100: [0xff9a8a, 0xb5281e], 500: [0xc9a6ff, 0x5b2fb0], 1000: [0xd9b48a, 0x7a4a1a] };
  F.coins = (s, cont, f, cx, top, maxW) => {
    const g = s.add.graphics(); cont.add(g); const items = f.items.map(v => (v >= 20 ? { v, w: 128, h: 64 } : { v, w: [0, 46, 50, 0, 0, 56, 0, 0, 0, 0, 62][v], h: [0, 46, 50, 0, 0, 56, 0, 0, 0, 0, 62][v] }));
    const rows = []; let row = [], rw = 0; items.forEach(it => { if (rw + it.w > maxW - 20 && row.length) { rows.push(row); row = []; rw = 0; } row.push(it); rw += it.w + 16; }); rows.push(row);
    let y = top + 6;
    rows.forEach(r => {
      const w = r.reduce((a, it) => a + it.w + 16, -16), hh = Math.max(...r.map(it => it.h)); let x = cx - w / 2;
      r.forEach(it => {
        const mx = x + it.w / 2, my = y + hh / 2;
        if (it.v >= 20) { const [c1, c2] = NOTE_COL[it.v]; g.fillStyle(c2, 1); g.fillRoundedRect(x + 2, my - it.h / 2 + 4, it.w, it.h, 8); g.fillStyle(c1, 1); g.fillRoundedRect(x, my - it.h / 2, it.w, it.h, 8); g.lineStyle(2.5, c2, 1); g.strokeRoundedRect(x, my - it.h / 2, it.w, it.h, 8); g.lineStyle(1.5, c2, 0.5); g.strokeCircle(x + 26, my, 16); cont.add(mt(s, x + it.w - 34, my, it.v, 26, KG.hex(c2))); cont.add(mt(s, x + 26, my, '฿', 18, KG.hex(c2))); }
        else { const r2 = it.w / 2, bi = it.v === 10, gold = it.v === 2; g.fillStyle(0x6b6b6b, 0.35); g.fillCircle(mx + 2, my + 3, r2); g.fillStyle(bi ? 0xd9d9d9 : gold ? 0xf2c14e : 0xd9dde6, 1); g.fillCircle(mx, my, r2); if (bi) { g.fillStyle(0xf2c14e, 1); g.fillCircle(mx, my, r2 * 0.68); } if (it.v === 5) { g.lineStyle(4, 0xc77b3d, 1); g.strokeCircle(mx, my, r2 - 3); } g.lineStyle(2, 0x5a5a5a, 1); g.strokeCircle(mx, my, r2); cont.add(mt(s, mx, my, it.v, it.v === 10 ? 24 : 21, '#3a3a3a')); }
        x += it.w + 16;
      });
      y += hh + 14;
    });
    return { h: y - top + 2 };
  };

  /* ---------- ไม้บรรทัด + ดินสอ ---------- */
  F.ruler = (s, cont, f, cx, top, maxW) => {
    const N = 15, px = Math.min(46, (maxW - 60) / N), w = px * N, x0 = cx - w / 2, ry = top + 92, g = s.add.graphics(); cont.add(g);
    g.fillStyle(0xffe08a, 1); g.fillRoundedRect(x0 - 16, ry, w + 32, 64, 6); g.lineStyle(2.5, 0xa07a1a, 1); g.strokeRoundedRect(x0 - 16, ry, w + 32, 64, 6);
    for (let i = 0; i <= N * 10; i++) { const x = x0 + i * px / 10, big = i % 10 === 0, mid = i % 5 === 0; g.lineStyle(big ? 2.5 : 1.2, 0x5a4400, 1); g.beginPath(); g.moveTo(x, ry); g.lineTo(x, ry + (big ? 24 : mid ? 16 : 9)); g.strokePath(); if (big) cont.add(mt(s, x, ry + 42, i / 10, 19, '#5a4400')); }
    cont.add(mt(s, cx, ry + 80, 'ไม้บรรทัดหน่วยเซนติเมตร (ซม.) ช่องเล็กช่องละ 1 มิลลิเมตร', 15, '#7a6420', { weight: '400' }));
    const pa = x0 + f.a * px, pb = x0 + (f.a + f.len) * px, py = top + 40;
    g.fillStyle(0xffc23d, 1); g.fillRect(pa + 18, py - 13, pb - pa - 36, 26); g.fillStyle(0xe8a21a, 1); g.fillRect(pa + 18, py + 4, pb - pa - 36, 9);
    g.fillStyle(0xff8aa6, 1); g.fillRect(pa, py - 13, 18, 26); g.fillStyle(0xbfc6d6, 1); g.fillRect(pa + 14, py - 13, 6, 26);
    g.fillStyle(0xf3d9b0, 1); g.fillTriangle(pb - 18, py - 13, pb - 18, py + 13, pb, py); g.fillStyle(0x333333, 1); g.fillTriangle(pb - 6, py - 4, pb - 6, py + 4, pb, py);
    g.lineStyle(2, C.ink, 1); g.strokeRect(pa, py - 13, pb - pa - 18, 26);
    g.lineStyle(2, 0xd63a2f, 0.8); [pa, pb].forEach(x => { for (let y = py + 16; y < ry; y += 10) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, Math.min(ry, y + 5)); g.strokePath(); } });
    return { h: 186 };
  };

  /* ---------- แผนภูมิรูปภาพ ---------- */
  const CAT_COL = [0xff6b5a, 0xffc23d, 0x3dbf7a, 0x3d8bff];
  F.pict = (s, cont, f, cx, top, maxW) => {
    const g = s.add.graphics(); cont.add(g); const lw = 150, per = f.vals.map(v => v / f.unit), mx = Math.max(...per), iconS = Math.min(40, (maxW - lw - 80) / Math.max(8, mx)), w = lw + iconS * Math.max(8, mx) + 30, x0 = cx - w / 2;
    cont.add(mt(s, cx, top + 14, f.title, 22, INK.head));
    f.cats.forEach((c, i) => {
      const y = top + 50 + i * 46; g.fillStyle(i % 2 ? 0xf2f6ff : 0xffffff, 1); g.fillRect(x0, y - 20, w, 44); g.lineStyle(1.5, C.line, 1); g.strokeRect(x0, y - 20, w, 44); g.beginPath(); g.moveTo(x0 + lw, y - 20); g.lineTo(x0 + lw, y + 24); g.strokePath();
      cont.add(mt(s, x0 + 12, y + 2, c, 20, INK.text, { ox: 0 }));
      for (let k = 0; k < per[i]; k++) { const ix = x0 + lw + 14 + k * iconS + iconS / 2, r = iconS * 0.38; g.fillStyle(CAT_COL[i], 1); g.fillCircle(ix, y + 2, r); g.fillStyle(0x27324f, 1); g.fillCircle(ix - r * 0.35, y - r * 0.15, r * 0.13); g.fillCircle(ix + r * 0.35, y - r * 0.15, r * 0.13); g.lineStyle(2, 0x27324f, 1); g.beginPath(); g.arc(ix, y + r * 0.1, r * 0.45, 0.3, Math.PI - 0.3); g.strokePath(); }
    });
    const ly = top + 50 + 4 * 46 + 4, r = 12; g.fillStyle(CAT_COL[0], 1); g.fillCircle(cx - 90, ly + 4, r); cont.add(mt(s, cx - 70, ly + 6, '1 รูป แทน ' + f.unit + ' คน', 20, '#d63a2f', { ox: 0 }));
    return { h: ly - top + 30 };
  };

  /* ---------- แผนภูมิแท่ง ---------- */
  F.bars = (s, cont, f, cx, top, maxW, maxH) => {
    const g = s.add.graphics(); cont.add(g); const mxv = Math.max(...f.vals), steps = Math.ceil(mxv / f.unit) + 1, ch = Math.min(200, maxH - 80), cw = Math.min(520, maxW - 140), x0 = cx - cw / 2 + 30, y0 = top + 40 + ch;
    cont.add(mt(s, cx, top + 14, f.title, 22, INK.head));
    const every = steps > 10 ? 2 : 1;
    for (let k = 0; k <= steps; k += every) { const y = y0 - k / steps * ch; g.lineStyle(1, C.line, 0.9); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + cw, y); g.strokePath(); cont.add(mt(s, x0 - 10, y, k * f.unit, 17, INK.text, { ox: 1 })); }
    g.lineStyle(3, C.ink, 1); g.beginPath(); g.moveTo(x0, y0 - ch - 6); g.lineTo(x0, y0); g.lineTo(x0 + cw + 6, y0); g.strokePath();
    const bw = cw / f.cats.length;
    f.cats.forEach((c, i) => { const h = f.vals[i] / (steps * f.unit) * ch, x = x0 + i * bw + bw * 0.2; g.fillStyle(CAT_COL[i], 1); g.fillRect(x, y0 - h, bw * 0.6, h); g.lineStyle(2, C.ink, 1); g.strokeRect(x, y0 - h, bw * 0.6, h); cont.add(mt(s, x + bw * 0.3, y0 + 18, c, 18, INK.text)); });
    cont.add(mt(s, x0 - 44, top + 22, 'จำนวน (คน)', 14, INK.text, { ox: 0.2 }));
    return { h: ch + 80 };
  };

  return {
    draw(s, cont, fig, cx, top, maxW, maxH) { const fn = F[fig.kind]; return fn ? fn(s, cont, fig, cx, top, maxW, maxH) : { h: 0 }; },
    mt
  };
})();
