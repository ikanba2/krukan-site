/* ===== GridView: เขาวงกตตารางมุมมองเฉียง 2.5 มิติ (วาดและเคลื่อนไหวตามเหตุการณ์จากตัวจำลอง GR.run) =====
   ก้อนพื้นลอยอยู่เหนือฉากหลัง มีหน้าข้างและเงา ตัวละครยืนบนกึ่งกลางก้อน ภาพเคลื่อนไหวใช้ฮีโร่ h0 และมอนสเตอร์จากคลังภาพ
   หน่วยเป็นพิกเซลออกแบบ ตำแหน่งตายตัวในกรอบ ไม่เลื่อนกล้อง */
const CELL_MAX = 68, FH = 14, WH = 30;
const HID = 'h0';
const FOES = ['m0', 'm2', 'm5', 'm1'];
const GTHEME = {
  1: { accent: '#ffd34f', glow: 0xffd34f, top: ['#4452b8', '#222c6e'], side: '#141b4c', edge: '#9db0ff', water: ['#1d4f9e', '#0b2358'] },
  2: { accent: '#5ef08a', glow: 0x5ef08a, top: ['#3b9470', '#1c4c3c'], side: '#0e3024', edge: '#8cf0c0', water: ['#1e8fa0', '#0a4552'] },
  3: { accent: '#ff7a59', glow: 0xff7a59, top: ['#94404f', '#481a28'], side: '#2a1019', edge: '#ffb08c', water: ['#b4421e', '#5a1608'] },
  4: { accent: '#8ec5ff', glow: 0x8ec5ff, top: ['#4a84cc', '#224a82'], side: '#142a50', edge: '#c8e6ff', water: ['#2a64b8', '#0c2a5a'] }
};
const DX4 = GR.DX, DY4 = GR.DY;

/* ---------- เท็กซ์เจอร์ของก้อนพื้นและวัตถุ (วาดด้วย Canvas ตามธีมของ SECTOR) ---------- */
function makeGridTextures(scene, world, C) {
  const T = GTHEME[world], k = {}, M = 10, id = world + '|' + C;
  const shadow = (ctx, w, h) => { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 8; ctx.fillStyle = '#000'; ctx.fillRect(3, 5, w - 6, h - 8); ctx.restore(); };
  const top = (ctx, y0, alt, tint, lift) => {
    const g = KG.ui.lin(ctx, 0, y0, 0, y0 + C, tint || [[0, T.top[1]], [1, '#080b28']]);
    ctx.fillStyle = g; ctx.fillRect(0, y0, C, C);
    ctx.fillStyle = alt ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'; ctx.fillRect(0, y0, C, C);
    if (lift) { ctx.fillStyle = 'rgba(255,255,255,' + lift + ')'; ctx.fillRect(0, y0, C, C); }
    ctx.fillStyle = KG.ui.lin(ctx, 0, y0, 0, y0 + C * 0.5, [[0, 'rgba(255,255,255,.16)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, y0, C, C * 0.5);
    ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1.5; ctx.strokeRect(C * 0.16, y0 + C * 0.16, C * 0.68, C * 0.68);
    ctx.strokeStyle = T.edge; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.strokeRect(1, y0 + 1, C - 2, C - 2); ctx.globalAlpha = 1;
    ctx.fillStyle = T.accent; ctx.globalAlpha = 0.6; [[4, 4], [C - 8, 4], [4, C - 8], [C - 8, C - 8]].forEach(p => ctx.fillRect(p[0], y0 + p[1], 4, 4)); ctx.globalAlpha = 1;
  };
  const side = (ctx, y0, h) => {
    ctx.fillStyle = KG.ui.lin(ctx, 0, y0, 0, y0 + h, [[0, T.side], [1, '#05071a']]); ctx.fillRect(0, y0, C, h);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, y0, C, 2);
    ctx.fillStyle = T.accent; ctx.globalAlpha = 0.55; ctx.fillRect(0, y0 + h - 3, C, 3); ctx.globalAlpha = 1;
  };
  const tile = (key, alt) => KG.tex(scene, 'gtile|' + key + '|' + id, C + M * 2, C + FH + M * 2, ctx => { ctx.translate(M, M); shadow(ctx, C, C + FH); side(ctx, C - 1, FH + 1); top(ctx, 0, alt); });
  k.tileA = tile('a', true); k.tileB = tile('b', false);
  k.wall = KG.tex(scene, 'gwall|' + id, C + M * 2, C + WH + FH + M * 2, ctx => {
    ctx.translate(M, M); shadow(ctx, C, C + WH + FH);
    side(ctx, C - 1, WH + FH + 1);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let y = C + 8; y < C + WH + FH - 2; y += 10) ctx.fillRect(0, y, C, 2);
    ctx.fillStyle = T.accent; ctx.globalAlpha = 0.8; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(i * C / 5, C); ctx.lineTo(i * C / 5 + C / 10, C); ctx.lineTo(i * C / 5, C + 10); ctx.closePath(); ctx.fill(); } ctx.globalAlpha = 1;
    top(ctx, 0, true, [[0, T.top[0]], [1, T.top[0]]], 0.2);
  });
  k.water = KG.tex(scene, 'gwater|' + id, C + M * 2, C + FH + M * 2, ctx => {
    ctx.translate(M, M); shadow(ctx, C, C + FH); side(ctx, C - 1, FH + 1);
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, C, [[0, T.water[0]], [1, T.water[1]]]); ctx.fillRect(0, 0, C, C);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2.5; for (let r = 0; r < 3; r++) { ctx.beginPath(); for (let x = 6; x <= C - 6; x += 4) ctx.lineTo(x, C * (0.25 + r * 0.25) + Math.sin((x + r * 9) / 5) * 3); ctx.stroke(); }
    ctx.strokeStyle = T.edge; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.strokeRect(1, 1, C - 2, C - 2); ctx.globalAlpha = 1;
  });
  k.shine = KG.tex(scene, 'gshine|' + id, C, C, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, C, C, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, C, C); });
  k.spike = KG.tex(scene, 'gspike|' + id, C, C * 0.8, ctx => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) {
      const x = C * (0.2 + i * 0.3) + (r ? C * 0.05 : -C * 0.02), y = C * (0.34 + r * 0.32), w = C * 0.16;
      ctx.fillStyle = KG.ui.lin(ctx, x - w, 0, x + w, 0, [[0, '#f4f7ff'], [0.55, '#9fb0d8'], [1, '#56627f']]);
      ctx.beginPath(); ctx.moveTo(x, y - C * 0.28); ctx.lineTo(x + w, y); ctx.lineTo(x - w, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff4d5e'; ctx.beginPath(); ctx.moveTo(x, y - C * 0.28); ctx.lineTo(x + w * 0.45, y - C * 0.1); ctx.lineTo(x - w * 0.45, y - C * 0.1); ctx.closePath(); ctx.fill();
    }
  });
  k.crate = KG.tex(scene, 'gcrate|' + id, C, C * 1.1, ctx => {
    const h = C * 1.1, s = C * 0.78, x0 = (C - s) / 2, yT = C * 0.12;
    ctx.fillStyle = '#2a3480'; ctx.fillRect(x0, yT + s * 0.45, s, s * 0.55);
    ctx.fillStyle = KG.ui.lin(ctx, 0, yT, 0, yT + s * 0.5, [[0, '#7083d8'], [1, '#4a5aa8']]); ctx.fillRect(x0, yT, s, s * 0.5);
    ctx.strokeStyle = T.accent; ctx.lineWidth = 3; ctx.strokeRect(x0 + 1.5, yT + 1.5, s - 3, s - 3);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 6, yT + 6); ctx.lineTo(x0 + s - 6, yT + s - 6); ctx.moveTo(x0 + s - 6, yT + 6); ctx.lineTo(x0 + 6, yT + s - 6); ctx.stroke();
  });
  k.gem = KG.tex(scene, 'ggem', 48, 58, ctx => {
    ctx.beginPath(); ctx.moveTo(24, 3); ctx.lineTo(44, 16); ctx.lineTo(44, 42); ctx.lineTo(24, 55); ctx.lineTo(4, 42); ctx.lineTo(4, 16); ctx.closePath();
    ctx.fillStyle = KG.ui.lin(ctx, 4, 3, 44, 55, [[0, '#ffffff'], [0.4, '#7ffbe7'], [1, '#17b79a']]); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#0a4f46'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(24, 3); ctx.lineTo(44, 16); ctx.lineTo(24, 26); ctx.lineTo(4, 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.moveTo(24, 26); ctx.lineTo(44, 16); ctx.lineTo(44, 42); ctx.lineTo(24, 55); ctx.closePath(); ctx.fill();
  });
  k.portal = KG.tex(scene, 'gportal|' + world, 150, 210, ctx => {
    ctx.save(); ctx.shadowColor = T.accent; ctx.shadowBlur = 22; ctx.lineWidth = 12;
    ctx.strokeStyle = KG.ui.lin(ctx, 0, 0, 150, 210, [[0, '#ffffff'], [0.5, T.accent], [1, '#ff3d8b']]);
    ctx.beginPath(); ctx.ellipse(75, 105, 56, 88, 0, 0, 7); ctx.stroke(); ctx.restore();
    const g = ctx.createRadialGradient(75, 105, 4, 75, 105, 80); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.35, T.accent); g.addColorStop(1, 'rgba(10,12,40,.85)');
    ctx.globalAlpha = 0.65; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(75, 105, 48, 80, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; [0.3, 0.55, 0.8].forEach(s => { ctx.beginPath(); ctx.ellipse(75, 105, 48 * s, 80 * s, 0, 0.3, 4.2); ctx.stroke(); });
  });
  k.pad = KG.tex(scene, 'gpad|' + world, 64, 64, ctx => {
    ctx.strokeStyle = T.accent; ctx.lineWidth = 4; ctx.globalAlpha = 0.9;
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; ctx.lineTo(32 + Math.cos(a) * 26, 32 + Math.sin(a) * 26); } ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 0.25; ctx.fillStyle = T.accent; ctx.fill();
  });
  k.arrow = KG.tex(scene, 'garrow', 40, 40, ctx => {
    ctx.save(); ctx.shadowColor = '#4ef4d2'; ctx.shadowBlur = 8; ctx.fillStyle = '#7ffbe7';
    ctx.beginPath(); ctx.moveTo(34, 20); ctx.lineTo(10, 6); ctx.lineTo(16, 20); ctx.lineTo(10, 34); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#0a4f46'; ctx.lineWidth = 2; ctx.stroke();
  });
  k.slash = KG.tex(scene, 'gslash', 180, 180, ctx => {
    ctx.save(); ctx.translate(90, 90); ctx.shadowColor = '#ff3d8b'; ctx.shadowBlur = 18;
    ctx.fillStyle = KG.ui.lin(ctx, -80, -80, 80, 80, [[0, 'rgba(255,255,255,0)'], [0.55, '#ffffff'], [1, '#ff7ab2']]);
    ctx.beginPath(); ctx.arc(0, 0, 78, -1.1, 1.1); ctx.arc(-26, 0, 70, 0.95, -0.95, true); ctx.closePath(); ctx.fill(); ctx.restore();
  });
  return k;
}

class GridView {
  constructor(scene, rect, level, worldId) {
    this.scene = scene; this.rect = rect; this.level = level; this.wid = worldId; this.map = GR.parseMap(level);
    this.spd = 1; this.dead = false; this.T = GTHEME[worldId];
    // กรอบของช่องที่มีพื้นจริง ให้ตั้งกลางกรอบและเลือกขนาดช่องให้พอดี
    let x0 = 99, y0 = 99, x1 = -1, y1 = -1;
    this.map.cells.forEach((row, y) => row.forEach((t, x) => { if (t !== 'void') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
    this.bx0 = x0; this.by0 = y0; this.cols = x1 - x0 + 1; this.rows = y1 - y0 + 1;
    this.C = Math.max(40, Math.min(CELL_MAX, Math.floor((rect.w - 40) / this.cols), Math.floor((rect.h - 56 - WH) / this.rows)));
    this.ox = Math.round((rect.w - this.cols * this.C) / 2) - x0 * this.C;
    this.oy = Math.round((rect.h - this.rows * this.C + WH - FH) / 2) - y0 * this.C;
    this.tex = makeGridTextures(scene, worldId, this.C);
    this.build();
  }
  px(x) { return this.ox + x * this.C + this.C / 2; }
  py(y) { return this.oy + y * this.C + this.C / 2; }
  build() {
    const s = this.scene, r = this.rect, T = this.T, C = this.C, m = this.map;
    this.root = s.add.container(r.x, r.y);
    const mg = s.make.graphics({ x: 0, y: 0, add: false }); mg.fillStyle(0xffffff); mg.fillRect(r.x, r.y, r.w, r.h);
    this.root.setMask(mg.createGeometryMask());
    const arena = WORLDS[this.wid - 1].arena;
    this.bg = s.add.image(r.w / 2, r.h / 2, 'arena_' + arena); this.bg.setDisplaySize(r.h * 1.8 * 1.08, r.h * 1.08);
    this.root.add(this.bg);
    this.root.add(s.add.rectangle(r.w / 2, r.h / 2, r.w, r.h, 0x050822, 0.5));
    this.world = s.add.container(0, 0); this.root.add(this.world);
    this.trail = s.add.graphics(); this.world.add(this.trail); this.trail.setDepth(-1);
    this.tileImgs = [];
    // ก้อนพื้น กำแพง น้ำ หนาม (วางเรียงตามแถว ให้ลำดับการซ้อนถูกต้อง)
    m.cells.forEach((row, y) => row.forEach((t, x) => {
      if (t === 'void') return;
      const cx = this.ox + x * C - 10, cy = this.oy + y * C - 10;
      if (t === 'wall') {
        const w = s.add.image(cx, cy - WH, this.tex.wall).setOrigin(0, 0).setDisplaySize(C + 20, C + WH + FH + 20); w.setDepth(y * 10 + 3); this.world.add(w);
      } else {
        const key = t === 'water' ? this.tex.water : ((x + y) % 2 ? this.tex.tileA : this.tex.tileB);
        const img = s.add.image(cx, cy, key).setOrigin(0, 0).setDisplaySize(C + 20, C + FH + 20); img.setDepth(y * 10); this.world.add(img); this.tileImgs.push(img);
        if (t === 'water') {
          const sh = s.add.image(this.ox + x * C, this.oy + y * C, this.tex.shine).setOrigin(0, 0).setDisplaySize(C, C).setBlendMode('ADD').setAlpha(0.2).setDepth(y * 10 + 1); this.world.add(sh);
          s.tweens.add({ targets: sh, alpha: 0.5, duration: 900 + ((x * 7 + y * 3) % 5) * 120, yoyo: true, repeat: -1 });
        }
        if (t === 'spike') { const sp = s.add.image(this.px(x), this.oy + y * C + C * 0.9, this.tex.spike).setOrigin(0.5, 1).setDisplaySize(C * 0.9, C * 0.72).setDepth(y * 10 + 2); this.world.add(sp); }
      }
    }));
    // จุดเริ่ม
    this.startPad = s.add.image(this.px(m.start.x), this.py(m.start.y), this.tex.pad).setDisplaySize(C * 0.78, C * 0.78).setDepth(m.start.y * 10 + 1); this.world.add(this.startPad);
    s.tweens.add({ targets: this.startPad, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });
    this.spawnObjects();
    // ประตู
    const gx = this.px(m.goal.x), gy = this.oy + m.goal.y * C + C * 0.78;
    this.goalPad = s.add.image(gx, this.py(m.goal.y), this.tex.pad).setDisplaySize(C * 0.9, C * 0.9).setDepth(m.goal.y * 10 + 1).setTint(0xffd34f); this.world.add(this.goalPad);
    this.portalGlow = s.add.image(gx, gy - C * 0.62, 'fx_glow').setTint(T.glow).setBlendMode('ADD').setDisplaySize(C * 2.1, C * 2.1).setAlpha(0.5).setDepth(m.goal.y * 10 + 2);
    this.portal = s.add.image(gx, gy, this.tex.portal).setOrigin(0.5, 1).setDisplaySize(C * 0.92, C * 1.28).setDepth(m.goal.y * 10 + 2);
    this.lockIcon = KG.ui.icon(s, 'lock', gx, gy - C * 0.62, Math.round(C * 0.46), 0xffffff).setDepth(m.goal.y * 10 + 4);
    this.world.add([this.portalGlow, this.portal, this.lockIcon]); this.pSx = this.portal.scaleX; this.pSy = this.portal.scaleY;
    s.tweens.add({ targets: this.portalGlow, alpha: 0.9, scaleX: this.portalGlow.scaleX * 1.1, scaleY: this.portalGlow.scaleY * 1.1, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    s.tweens.add({ targets: this.portal, scaleX: this.portal.scaleX * 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // ฮีโร่ ลูกศรบอกทิศ เงา
    this.shadow = s.add.ellipse(0, 0, C * 0.62, C * 0.2, 0x000000, 0.45); this.world.add(this.shadow);
    this.arrow = s.add.image(0, 0, this.tex.arrow).setDisplaySize(C * 0.4, C * 0.4).setAlpha(0.95); this.world.add(this.arrow);
    s.tweens.add({ targets: this.arrow, alpha: 0.55, duration: 520, yoyo: true, repeat: -1 });
    this.body = Math.round(C * 1.5);
    this.hero = KG.art.make(s, 0, 0, HID, 'idle', this.body); this.hs = this.hero.artScale; this.world.add(this.hero);
    this.fxLayer = s.add.container(0, 0); this.fxLayer.setDepth(9000); this.world.add(this.fxLayer);
    this.vig = s.add.image(r.w / 2, r.h / 2, KG.tex(s, 'gvig|' + r.w + '|' + r.h, r.w, r.h, ctx => {
      ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, r.h, [[0, 'rgba(4,6,22,.5)'], [0.25, 'rgba(4,6,22,0)'], [0.8, 'rgba(4,6,22,0)'], [1, 'rgba(4,6,22,.45)']]); ctx.fillRect(0, 0, r.w, r.h);
      ctx.fillStyle = KG.ui.lin(ctx, 0, 0, r.w, 0, [[0, 'rgba(4,6,22,.45)'], [0.1, 'rgba(4,6,22,0)'], [0.9, 'rgba(4,6,22,0)'], [1, 'rgba(4,6,22,.45)']]); ctx.fillRect(0, 0, r.w, r.h);
    })).setDisplaySize(r.w, r.h); this.root.add(this.vig);
    this.flashRect = s.add.rectangle(r.w / 2, r.h / 2, r.w, r.h, 0xff4d5e, 0); this.root.add(this.flashRect);
    this.hx = m.start.x; this.hy = m.start.y; this.dir = m.dir; this.hz = 0; this.flip = m.dir === 3;
    this.placeHero(); this.setFrame('idle'); this.startIdle(); this.updateGate(false);
  }

  /* ---------- วัตถุในฉาก: แกนพลังงาน ศัตรู ลัง ---------- */
  spawnObjects() {
    const s = this.scene, m = this.map, C = this.C;
    (this.gemObjs || []).forEach(o => o && o.destroy()); (this.foeObjs || []).forEach(o => o && o.destroy());
    this.gemObjs = m.gems.map((g, i) => {
      const c = s.add.container(this.px(g.x), this.py(g.y) - C * 0.18).setDepth(g.y * 10 + 6);
      const glow = s.add.image(0, 0, 'fx_glow').setTint(0x4ef4d2).setBlendMode('ADD').setDisplaySize(C * 1.1, C * 1.1).setAlpha(0.6);
      const img = s.add.image(0, 0, this.tex.gem).setDisplaySize(C * 0.42, C * 0.5);
      c.add([glow, img]); this.world.add(c);
      s.tweens.add({ targets: c, y: c.y - 5, duration: 900 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      s.tweens.add({ targets: img, scaleX: img.scaleX * 0.35, duration: 700 + i * 40, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      c.got = false; return c;
    });
    this.gemsGot = 0;
    this.foeObjs = m.enemies.map((e, i) => {
      const c = s.add.container(this.px(e.x), this.oy + e.y * C + C * 0.78).setDepth(e.y * 10 + 5);
      if (e.crate) {
        const img = s.add.image(0, 0, this.tex.crate).setOrigin(0.5, 1).setDisplaySize(C * 0.86, C * 0.95);
        c.add(img); c.img = img; c.crate = true;
      } else {
        const id = e.boss ? 'm4' : FOES[(e.x + e.y + this.wid) % FOES.length], a = KG.ART[id];
        const h = Math.min(e.boss ? C * 2.1 : C * 1.3, (e.boss ? 1.7 : 1.05) * C * a.body / a.bw);
        const sh = s.add.ellipse(0, 2, e.boss ? C * 1.4 : C * 0.8, C * 0.18, 0x000000, 0.4);
        const img = KG.art.make(s, 0, 4, id, 0, h);
        c.add([sh, img]); c.img = img; c.base = img.scaleX;
        if (e.boss) { c.pips = []; for (let k = 0; k < e.hp; k++) { const p = s.add.rectangle((k - (e.hp - 1) / 2) * 16, -h - 10, 12, 8, 0xff4d5e).setStrokeStyle(2, 0x000000); c.add(p); c.pips.push(p); } }
        s.tweens.add({ targets: img, scaleY: img.scaleY * 1.03, scaleX: img.scaleX * 0.985, duration: 900 + (i % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      c.hp = e.hp; c.idx = i; c.busy = false; this.world.add(c); return c;
    });
  }
  updateGate(open, anim) {
    const T = this.T; this.gateOpen = open;
    this.lockIcon.setVisible(!open);
    this.portal.setTint(open ? 0xffffff : 0x7a7f9a); this.portalGlow.setTint(open ? T.glow : 0x6a6f90).setAlpha(open ? 0.8 : 0.3);
    if (open && anim) { KG.audio.play('unlock'); KG.fx.ring(this.scene, this.abs(this.px(this.map.goal.x), this.py(this.map.goal.y)).x, this.abs(0, this.py(this.map.goal.y)).y, T.glow, { size: 2.6, w: 0.7 }); }
  }
  abs(wx, wy) { return { x: this.rect.x + this.world.x + wx, y: this.rect.y + this.world.y + wy }; }
  allGems() { return this.gemsGot >= this.map.gems.length; }

  /* ---------- ฮีโร่ ---------- */
  placeHero() {
    const C = this.C, x = this.px(this.hx), y = this.oy + this.hy * C + C * 0.68;
    this.hero.setPosition(x, y - this.hz).setFlipX(this.flip);
    this.shadow.setPosition(x, y + 1).setScale(1 - Math.min(0.4, this.hz / 160), 1);
    const a = this.dir;
    this.arrow.setPosition(x + DX4[a] * C * 0.5, this.oy + this.hy * C + C * 0.5 + DY4[a] * C * 0.5).setRotation([-Math.PI / 2, 0, Math.PI / 2, Math.PI][a]);
    this.hero.setDepth(Math.round(this.hy) * 10 + 5); this.shadow.setDepth(Math.round(this.hy) * 10 + 4); this.arrow.setDepth(Math.round(this.hy) * 10 + 4);
    this.world.sort('depth');
    this.faceFoes();
  }
  faceFoes() {
    (this.foeObjs || []).forEach((c, i) => {
      if (!c || !c.active || !c.img || c.crate || c.busy) return;
      const e = this.map.enemies[i]; c.img.setFlipX(this.hx > e.x);
      const near = Math.abs(this.hx - e.x) + Math.abs(this.hy - e.y) < 2.3, want = near ? 5 : 0;
      if (c.pose !== want) { c.pose = want; KG.art.frame(c.img, want); }
    });
  }
  setFrame(name) { KG.art.frame(this.hero, name); }
  fixScale() { this.hero.setScale(this.hs, this.hs); }
  startIdle() {
    this.stopIdle(); this.fixScale();
    const sy = this.hero.scaleY, sx = this.hero.scaleX;
    this.idleTween = this.scene.tweens.add({ targets: this.hero, scaleY: sy * 1.022, scaleX: sx * 0.992, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  stopIdle() { if (this.idleTween) { this.idleTween.remove(); this.idleTween = null; } this.fixScale(); }
  setSpeed(v) { this.spd = v; }
  d(ms) { return ms / this.spd; }
  popText(str, color, dy) {
    const s = this.scene, t = KG.txt(s, this.px(this.hx), this.oy + this.hy * this.C - this.body * 0.7 + (dy || 0), str, { size: 26, color: color || '#ffffff', center: true, middle: true, stroke: true });
    this.fxLayer.add(t); t.setScale(0.4);
    s.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 160, ease: 'Back.easeOut' });
    s.tweens.add({ targets: t, y: t.y - 40, alpha: 0, delay: 500, duration: 600, onComplete: () => t.destroy() });
  }
  flash(color, a) { this.flashRect.setFillStyle(color, a || 0.35).setAlpha(1); this.scene.tweens.add({ targets: this.flashRect, alpha: 0, duration: 420 }); }
  shake(ms, amt) { this.scene.tweens.add({ targets: this.root, x: { from: this.rect.x - (amt || 5), to: this.rect.x + (amt || 5) }, duration: 45, yoyo: true, repeat: Math.round((ms || 240) / 90), onComplete: () => { this.root.x = this.rect.x; } }); }
  dust(x, y, n) {
    const s = this.scene, em = s.add.particles(x, y, 'fx_spark', { speed: { min: 20, max: 70 }, angle: { min: 180, max: 360 }, scale: { start: 0.5, end: 0 }, alpha: { start: 0.55, end: 0 }, lifespan: 380, tint: [0xdfe6ff, 0x9fb0d8], emitting: false });
    this.fxLayer.add(em); em.explode(n || 5); s.time.delayedCall(560, () => em.destroy());
  }
  mark(x0, y0, x1, y1) {   // เส้นทางที่เดินผ่านมา ยังอยู่หลังรันเพื่อให้ย้อนดูได้
    const g = this.trail, C = this.C, ax = this.px(x0), ay = this.oy + y0 * C + C * 0.62, bx = this.px(x1), by = this.oy + y1 * C + C * 0.62;
    g.lineStyle(7, 0x4ef4d2, 0.28); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.strokePath();
    g.fillStyle(0x7ffbe7, 0.55); g.fillCircle(bx, by, 5);
  }

  collect(i) {
    const g = this.gemObjs[i]; if (!g || g.got) return;
    g.got = true; this.gemsGot++;
    const s = this.scene, p = this.abs(g.x, g.y);
    KG.audio.play('coin', { i: this.gemsGot - 1 });
    KG.fx.burst(s, p.x, p.y, { colors: [0x4ef4d2, 0xffffff], n: 14, max: 220, depth: 60 });
    KG.fx.pop(s, p.x, p.y - 20, '+1', { color: '#4ef4d2', size: 30 });
    s.tweens.add({ targets: g, y: g.y - 50, alpha: 0, scaleX: 1.6, scaleY: 1.6, duration: 380, ease: 'Cubic.easeOut', onComplete: () => g.destroy() });
    if (this.onGem) this.onGem(this.gemsGot, this.map.gems.length, p);
    if (this.allGems()) this.updateGate(true, true);
  }

  /* ---------- เคลื่อนไหวตามเหตุการณ์ ---------- */
  async playEvent(ev) {
    if (this.dead) return;
    switch (ev.op) {
      case 'move': return this.move(ev);
      case 'turn': return this.turn(ev);
      case 'attack': return this.attack(ev);
      case 'fail': return this.fail(ev);
      default: return null;
    }
  }
  setFace(d) { this.dir = d; if (d === 1) this.flip = false; else if (d === 3) this.flip = true; }
  async walkTo(x1, y1, dur, collectAt) {
    const s = this.scene, x0 = this.hx, y0 = this.hy; let lastF = '', done = false;
    await tween(s, {
      targets: { p: 0 }, p: 1, duration: dur, ease: 'Linear',
      onUpdate: (tw, o) => {
        const p = o.p; this.hx = x0 + (x1 - x0) * p; this.hy = y0 + (y1 - y0) * p; this.hz = Math.abs(Math.sin(p * Math.PI * 2)) * 3; this.placeHero();
        const f = KG.art.walkFrame(p); if (f !== lastF) { lastF = f; this.setFrame(f); }
        if (collectAt != null && p > 0.7 && !done) { done = true; this.collect(collectAt); }
      }
    });
    this.hx = x1; this.hy = y1; this.hz = 0; this.placeHero();
  }
  async move(ev) {
    this.stopIdle(); KG.audio.play('step'); const C = this.C;
    this.setFace(ev.moveDir); this.placeHero();
    this.dust(this.px(this.hx), this.oy + this.hy * C + C * 0.82, 4);
    await this.walkTo(ev.to.x, ev.to.y, this.d(440), ev.gem >= 0 ? ev.gem : null);
    this.mark(ev.from.x, ev.from.y, ev.to.x, ev.to.y);
    this.setFrame('idle'); this.startIdle();
  }
  async turn(ev) {
    this.stopIdle(); KG.audio.play('turn'); const s = this.scene;
    await tween(s, { targets: this, hz: 14, duration: this.d(100), ease: 'Sine.easeOut', onUpdate: () => this.placeHero() });
    this.setFace(ev.dir); this.placeHero();
    const ring = s.add.image(this.px(this.hx), this.oy + this.hy * this.C + this.C * 0.7, 'fx_ring').setTint(0x7ffbe7).setBlendMode('ADD').setScale(0.2).setAlpha(0.8); this.fxLayer.add(ring);
    s.tweens.add({ targets: ring, scaleX: 0.7, scaleY: 0.35, alpha: 0, duration: this.d(260), onComplete: () => ring.destroy() });
    s.tweens.add({ targets: this.arrow, scaleX: this.arrow.scaleX * 1.5, scaleY: this.arrow.scaleY * 1.5, duration: this.d(120), yoyo: true });
    await tween(s, { targets: this, hz: 0, duration: this.d(110), ease: 'Bounce.easeOut', onUpdate: () => this.placeHero() });
    this.startIdle();
  }
  async attack(ev) {
    const s = this.scene, C = this.C, d = this.dir; this.stopIdle();
    this.setFrame('a1'); KG.audio.play('swing');
    await wait(s, this.d(140));
    this.setFrame('a2');
    const sx = this.px(this.hx) + DX4[d] * C * 0.7, sy = this.oy + this.hy * C + C * 0.45 + DY4[d] * C * 0.7;
    const sl = s.add.image(sx, sy, this.tex.slash).setBlendMode('ADD').setDisplaySize(C * 1.9, C * 1.9).setAlpha(0.95).setScale(0.3).setRotation([-Math.PI / 2, 0, Math.PI / 2, Math.PI][d]); this.fxLayer.add(sl);
    s.tweens.add({ targets: sl, scaleX: C * 0.0105, scaleY: C * 0.0105, alpha: 0, duration: this.d(280), ease: 'Cubic.easeOut', onComplete: () => sl.destroy() });
    await wait(s, this.d(90)); this.setFrame('a3');
    if (ev.kind === 'enemy' || ev.kind === 'boss') await this.hitFoe(ev);
    else if (ev.kind === 'crate') await this.breakCrate(ev);
    else { this.popText('พลาด', '#9fb0d8', 6); KG.audio.play('tick'); }
    await wait(s, this.d(120));
    this.setFrame('idle'); this.startIdle();
  }
  async hitFoe(ev) {
    const s = this.scene, g = this.foeObjs[ev.idx]; if (!g || !g.active) return;
    const p = this.abs(g.x, g.y - this.C * 0.5); KG.audio.play(ev.killed ? 'kill' : 'hit'); g.hp = ev.hp;
    if (g.pips) g.pips.forEach((pp, i) => pp.setFillStyle(i < g.hp ? 0xff4d5e : 0x3a2a40));
    this.shake(160, 4); KG.fx.burst(s, p.x, p.y, { colors: [0xffffff, 0xff3d8b, 0xffd34f], n: ev.killed ? 26 : 12, max: 320, depth: 60 });
    KG.fx.ring(s, p.x, p.y, 0xff3d8b, { size: 1.6, w: 0.4 });
    g.busy = true; KG.art.frame(g.img, 7); g.img.setTintFill(0xffffff); s.time.delayedCall(90, () => g.img && g.img.clearTint && g.img.clearTint());
    if (ev.killed) {
      this.popText('เยี่ยม!', '#ffd34f', -10);
      await tween(s, { targets: g, x: g.x + DX4[this.dir] * 26, y: g.y + DY4[this.dir] * 26, alpha: 0, duration: this.d(380), ease: 'Cubic.easeOut' });
      g.destroy();
    } else {
      await tween(s, { targets: g, x: g.x + DX4[this.dir] * 12, y: g.y + DY4[this.dir] * 12, duration: this.d(80), yoyo: true });
      await wait(s, this.d(140)); g.busy = false; g.pose = -1; this.faceFoes();
    }
  }
  async breakCrate(ev) {
    const s = this.scene, c = this.foeObjs[ev.idx]; KG.audio.play('crate'); if (!c || !c.active) return;
    const p = this.abs(c.x, c.y - this.C * 0.4);
    KG.fx.burst(s, p.x, p.y, { colors: [0x4a5aa8, 0xffd34f, 0xffffff], tex: 'fx_shard', n: 16, max: 340, g: 700, rot: true, add: false, depth: 60 });
    this.shake(180, 5);
    await tween(s, { targets: c, alpha: 0, scaleX: 1.25, scaleY: 0.5, duration: this.d(160) }); c.destroy();
  }
  async foeStrike(ev) {
    const g = this.foeObjs.find(o => o && o.active && this.map.enemies[o.idx].x === ev.at.x && this.map.enemies[o.idx].y === ev.at.y); if (!g || g.crate) return;
    const s = this.scene, x0 = g.x, y0 = g.y, dx = ev.moveDir == null ? 0 : -DX4[ev.moveDir], dy = ev.moveDir == null ? 0 : -DY4[ev.moveDir];
    g.busy = true; KG.art.frame(g.img, 6);
    await tween(s, { targets: g, x: x0 + dx * 18, y: y0 + dy * 18, duration: this.d(110), ease: 'Cubic.easeOut', yoyo: true });
    g.x = x0; g.y = y0; await wait(s, this.d(220)); g.busy = false; g.pose = -1; this.faceFoes();
  }
  async fail(ev) {
    const s = this.scene, C = this.C, d = ev.moveDir; this.stopIdle(); KG.audio.play('error');
    if (d != null) { this.setFace(d); this.placeHero(); }
    if (ev.code === 'bump') {
      const msg = ev.kind === 'enemy' || ev.kind === 'boss' ? 'ชนศัตรู!' : (ev.kind === 'crate' ? 'ชนลัง!' : 'ชนกำแพง!');
      await tween(s, { targets: this, hx: this.hx + DX4[d] * 0.3, hy: this.hy + DY4[d] * 0.3, duration: this.d(110), onUpdate: () => this.placeHero() });
      this.setFrame('hurt'); KG.audio.play('hit'); this.flash(0xff4d5e, 0.3); this.shake(260, 6); this.popText(msg, '#ff7a8a');
      if (ev.kind === 'enemy' || ev.kind === 'boss') this.foeStrike(ev);
      await tween(s, { targets: this, hx: this.hx - DX4[d] * 0.3, hy: this.hy - DY4[d] * 0.3, duration: this.d(200), ease: 'Cubic.easeOut', onUpdate: () => this.placeHero() });
      return;
    }
    if (ev.code === 'void') {
      await this.walkTo(ev.at.x - DX4[d] * 0.35, ev.at.y - DY4[d] * 0.35, this.d(300));
      this.setFrame('hurt'); KG.audio.play('fall'); this.popText('ตกขอบ!', '#ff7a8a'); this.flash(0xff4d5e, 0.25);
      this.scene.tweens.add({ targets: this.hero, scaleX: this.hs * 0.5, scaleY: this.hs * 0.5, alpha: 0, angle: (d === 3 ? -1 : 1) * 140, duration: this.d(650), ease: 'Cubic.easeIn' });
      await tween(s, { targets: this, hz: -C * 1.7, hx: ev.at.x - DX4[d] * 0.1, hy: ev.at.y - DY4[d] * 0.1, duration: this.d(650), ease: 'Cubic.easeIn', onUpdate: () => this.placeHero() });
      this.shake(240, 5); return;
    }
    if (ev.code === 'water') {
      await this.walkTo(ev.at.x, ev.at.y, this.d(380));
      KG.audio.play('drop'); this.popText('ตกน้ำ!', '#7ec8ff'); this.flash(0x2a8cff, 0.3);
      const p = this.abs(this.px(ev.at.x), this.oy + ev.at.y * C + C * 0.6); KG.fx.burst(s, p.x, p.y, { colors: [0x7ec8ff, 0xffffff], n: 22, max: 260, depth: 60, g: 400 });
      KG.fx.ring(s, p.x, p.y, 0x7ec8ff, { size: 1.8, w: 0.5 }); this.setFrame('hurt');
      await tween(s, { targets: this.hero, alpha: 0, scaleY: this.hs * 0.2, duration: this.d(500), ease: 'Cubic.easeIn' }); this.shake(200, 4); return;
    }
    if (ev.code === 'spike') {
      await this.walkTo(ev.at.x, ev.at.y, this.d(360));
      this.setFrame('hurt'); KG.audio.play('hurt'); this.flash(0xff4d5e, 0.4); this.shake(300, 7); this.popText('โดนหนาม!', '#ff7a8a');
      const p = this.abs(this.px(this.hx), this.oy + this.hy * C + C * 0.4); KG.fx.burst(s, p.x, p.y, { colors: [0xff4d5e, 0xffffff], n: 20, max: 300, depth: 60 });
      await tween(s, { targets: this, hz: 36, duration: this.d(240), ease: 'Cubic.easeOut', onUpdate: () => this.placeHero() });
      await tween(s, { targets: this, hz: 0, duration: this.d(220), ease: 'Bounce.easeOut', onUpdate: () => this.placeHero() });
      return;
    }
    if (ev.code === 'timeout') { this.setFrame('hurt'); this.popText('วนไม่จบ!', '#ffd34f'); this.flash(0xffd34f, 0.2); this.startIdle(); }
  }
  async win() {
    const s = this.scene, C = this.C; this.stopIdle(); this.fixScale(); KG.audio.play('portal');
    const gx = this.px(this.map.goal.x), gy = this.oy + this.map.goal.y * C + C * 0.4, p = this.abs(gx, gy - C * 0.5);
    this.portal.clearTint(); this.portalGlow.setTint(this.T.glow).setAlpha(1);
    KG.fx.ring(s, p.x, p.y, this.T.glow, { size: 4, w: 0.8 }); KG.fx.glow(s, p.x, p.y, 0xffffff, 460, 700);
    this.setFrame('up'); KG.audio.play('jump');
    s.tweens.add({ targets: this.hero, scaleX: this.hs * 0.18, scaleY: this.hs * 0.18, angle: 540, alpha: 0, duration: this.d(720), ease: 'Cubic.easeIn' });
    s.tweens.add({ targets: this.shadow, scaleX: 0.1, alpha: 0, duration: this.d(600) });
    const swirl = s.add.particles(gx, gy - C * 0.3, 'fx_spark', { speed: { min: 60, max: 200 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 600, tint: [this.T.glow, 0xffffff, 0xff3d8b], blendMode: 'ADD', emitting: false });
    this.fxLayer.add(swirl); swirl.explode(36); s.time.delayedCall(900, () => swirl.destroy());
    await tween(s, { targets: this, hz: C * 0.9, duration: this.d(720), ease: 'Cubic.easeIn', onUpdate: () => this.placeHero() });
    KG.fx.ring(s, p.x, p.y, 0xffffff, { size: 3, w: 0.5 }); this.flash(0xffffff, 0.35);
    await tween(s, { targets: this.portal, scaleX: this.portal.scaleX * 1.12, scaleY: this.portal.scaleY * 1.12, duration: this.d(160), yoyo: true });
  }
  reset() {
    const s = this.scene; s.tweens.killTweensOf(this.hero); s.tweens.killTweensOf(this);
    this.trail.clear(); this.hero.setAlpha(1).setAngle(0); this.fixScale();
    this.hx = this.map.start.x; this.hy = this.map.start.y; this.hz = 0; this.setFace(this.level.dir == null ? 1 : this.level.dir); this.dir = this.level.dir == null ? 1 : this.level.dir;
    this.shadow.setAlpha(0.45).setScale(1); this.portal.setScale(this.pSx, this.pSy);
    this.spawnObjects(); this.updateGate(false); this.setFrame('idle'); this.placeHero(); this.startIdle();
  }
  destroy() { this.dead = true; this.scene.tweens.killTweensOf(this.hero); this.root.destroy(true); }
}
