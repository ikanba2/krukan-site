/* ===== LaneView: ทางวิ่งด้านข้างของภารกิจ (วาดและเคลื่อนไหวตามเหตุการณ์จากตัวจำลอง) =====
   หน่วยเป็นพิกเซลออกแบบ ตำแหน่งตายตัว กล้องเลื่อนตามฮีโร่ภายในกรอบที่ตัดด้วยมาสก์ */
const TW = 92;            // ความกว้างหนึ่งช่อง
const GROUND = 206;       // เส้นพื้น (พิกัดในกรอบ)
const HERO_BODY = 132;    // ความสูงลำตัวฮีโร่ในฉาก (หน่วยออกแบบ) ภาพเคลื่อนไหว h0 ทุกเฟรมจุดเท้าเท่ากัน
const HID = 'h0';
const THEMES = {
  1: { accent: '#ffd34f', glow: 0xffd34f, top: ['#39449a', '#1a2257'], bodyA: '#232c68', bodyB: '#141a42', pit: '#ffd34f', fog: 0x2a2f78 },
  2: { accent: '#5ef08a', glow: 0x5ef08a, top: ['#2f7a5c', '#173f33'], bodyA: '#1c4538', bodyB: '#0e2a22', pit: '#5ef08a', fog: 0x1a5a46 },
  3: { accent: '#ff7a59', glow: 0xff7a59, top: ['#7a3342', '#3a1522'], bodyA: '#47202c', bodyB: '#240f18', pit: '#ff6a3a', fog: 0x6a2a30 },
  4: { accent: '#8ec5ff', glow: 0x8ec5ff, top: ['#3d72b8', '#1c3a6c'], bodyA: '#27497c', bodyB: '#122446', pit: '#8ec5ff', fog: 0x2a4f86 }
};
const FOES = ['m0', 'm2', 'm5', 'm1'];   // มอนสเตอร์ประจำฉาก (หันซ้ายตามภาพต้นฉบับ) บอสคือ m4

function makeLaneTextures(scene, world) {
  const T = THEMES[world], k = {};
  const groundTex = (key, light) => KG.tex(scene, key + world, TW, 120, ctx => {
    ctx.fillStyle = '#03051a'; ctx.fillRect(0, 0, TW, 120);                                    // ร่องแบ่งช่อง
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, 120, [[0, light ? T.top[0] : T.top[1]], [0.14, light ? T.bodyA : T.bodyB], [1, light ? T.bodyB : '#080c26']]); ctx.fillRect(4, 0, TW - 8, 120);
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, 18, [[0, T.top[0]], [1, T.top[1]]]); ctx.fillRect(4, 0, TW - 8, 18);   // หน้าบนของช่อง
    ctx.fillStyle = T.accent; ctx.fillRect(4, 0, TW - 8, 5); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(4, 0, TW - 8, 2);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(4, 18, 3, 102); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(TW - 7, 18, 3, 102);
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.strokeRect(14, 34, TW - 28, 56);   // กรอบป้ายตัวเลขช่อง
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(15, 35, TW - 30, 54);
    ctx.fillStyle = T.accent; ctx.globalAlpha = 0.55; [[10, 24], [TW - 17, 24]].forEach(p => ctx.fillRect(p[0], p[1], 6, 6)); ctx.globalAlpha = 1;
    ctx.fillStyle = KG.ui.lin(ctx, 0, 80, 0, 120, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.55)']]); ctx.fillRect(4, 80, TW - 8, 40);
  });
  k.groundA = groundTex('lane_gA', true);
  k.groundB = groundTex('lane_gB', false);
  k.pit = KG.tex(scene, 'lane_pit' + world, TW, 120, ctx => {
    ctx.fillStyle = '#04050d'; ctx.fillRect(0, 0, TW, 120);
    const g = ctx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, T.pit); ctx.globalAlpha = 0.65; ctx.fillStyle = g; ctx.fillRect(0, 0, TW, 120); ctx.globalAlpha = 1;
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 14, 0, [[0, 'rgba(0,0,0,.9)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, 14, 120);
    ctx.fillStyle = KG.ui.lin(ctx, TW - 14, 0, TW, 0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.9)']]); ctx.fillRect(TW - 14, 0, 14, 120);
    ctx.fillStyle = T.accent; ctx.globalAlpha = 0.9; ctx.fillRect(0, 0, 5, 5); ctx.fillRect(TW - 5, 0, 5, 5); ctx.globalAlpha = 1;
  });
  k.spike = KG.tex(scene, 'lane_spike' + world, TW, 44, ctx => {
    for (let i = 0; i < 5; i++) {
      const x = 4 + i * 16.5;
      ctx.fillStyle = KG.ui.lin(ctx, x, 0, x + 16, 0, [[0, '#f4f7ff'], [0.55, '#9fb0d8'], [1, '#56627f']]);
      ctx.beginPath(); ctx.moveTo(x + 8, 2); ctx.lineTo(x + 16, 42); ctx.lineTo(x, 42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff4d5e'; ctx.beginPath(); ctx.moveTo(x + 8, 2); ctx.lineTo(x + 11.5, 14); ctx.lineTo(x + 4.5, 14); ctx.closePath(); ctx.fill();
    }
  });
  k.crate = KG.tex(scene, 'lane_crate' + world, 74, 74, ctx => {
    ctx.fillStyle = KG.ui.lin(ctx, 0, 4, 0, 72, [[0, '#4a5aa8'], [1, '#222c68']]); ctx.fillRect(4, 4, 66, 66);
    ctx.strokeStyle = T.accent; ctx.lineWidth = 4; ctx.strokeRect(6, 6, 62, 62);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(64, 64); ctx.moveTo(64, 10); ctx.lineTo(10, 64); ctx.stroke();
    ctx.fillStyle = T.accent; [[8, 8], [62, 8], [8, 62], [62, 62]].forEach(p => ctx.fillRect(p[0] - 2, p[1] - 2, 5, 5));
  });
  k.wall = KG.tex(scene, 'lane_wall' + world, 72, 170, ctx => {
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 72, 0, [[0, '#59639c'], [1, '#2b3270']]); ctx.fillRect(4, 4, 64, 166);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 30; y < 170; y += 34) ctx.fillRect(4, y, 64, 3);
    ctx.fillStyle = T.accent; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(4 + i * 12, 4); ctx.lineTo(16 + i * 12, 4); ctx.lineTo(4 + i * 12, 16); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = '#0a0d2a'; ctx.lineWidth = 3; ctx.strokeRect(4, 4, 64, 166);
  });
  k.coin = KG.tex(scene, 'lane_coin' + world, 48, 58, ctx => {
    ctx.beginPath(); ctx.moveTo(24, 3); ctx.lineTo(44, 16); ctx.lineTo(44, 42); ctx.lineTo(24, 55); ctx.lineTo(4, 42); ctx.lineTo(4, 16); ctx.closePath();
    ctx.fillStyle = KG.ui.lin(ctx, 4, 3, 44, 55, [[0, '#ffffff'], [0.4, '#7ffbe7'], [1, '#17b79a']]); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#0a4f46'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(24, 3); ctx.lineTo(44, 16); ctx.lineTo(24, 26); ctx.lineTo(4, 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.moveTo(24, 26); ctx.lineTo(44, 16); ctx.lineTo(44, 42); ctx.lineTo(24, 55); ctx.closePath(); ctx.fill();
  });
  k.portal = KG.tex(scene, 'lane_portal' + world, 150, 210, ctx => {
    ctx.save(); ctx.shadowColor = T.accent; ctx.shadowBlur = 22; ctx.lineWidth = 12;
    ctx.strokeStyle = KG.ui.lin(ctx, 0, 0, 150, 210, [[0, '#ffffff'], [0.5, T.accent], [1, '#ff3d8b']]);
    ctx.beginPath(); ctx.ellipse(75, 105, 56, 88, 0, 0, 7); ctx.stroke(); ctx.restore();
    const g = ctx.createRadialGradient(75, 105, 4, 75, 105, 80); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.35, T.accent); g.addColorStop(1, 'rgba(10,12,40,.85)');
    ctx.globalAlpha = 0.65; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(75, 105, 48, 80, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; [0.3, 0.55, 0.8].forEach(s => { ctx.beginPath(); ctx.ellipse(75, 105, 48 * s, 80 * s, 0, 0.3, 4.2); ctx.stroke(); });
  });
  k.pad = KG.tex(scene, 'lane_pad' + world, TW, 18, ctx => {
    ctx.fillStyle = T.accent; ctx.globalAlpha = 0.85;
    for (let i = 0; i < 3; i++) { const x = 16 + i * 22; ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x + 12, 9); ctx.lineTo(x, 15); ctx.lineTo(x + 5, 9); ctx.closePath(); ctx.fill(); }
  });
  k.slash = KG.tex(scene, 'lane_slash', 180, 180, ctx => {
    ctx.save(); ctx.translate(90, 90); ctx.shadowColor = '#ff3d8b'; ctx.shadowBlur = 18;
    ctx.fillStyle = KG.ui.lin(ctx, -80, -80, 80, 80, [[0, 'rgba(255,255,255,0)'], [0.55, '#ffffff'], [1, '#ff7ab2']]);
    ctx.beginPath(); ctx.arc(0, 0, 78, -1.1, 1.1); ctx.arc(-26, 0, 70, 0.95, -0.95, true); ctx.closePath(); ctx.fill(); ctx.restore();
  });
  k.vignette = KG.tex(scene, 'lane_vig', 1232, 300, ctx => {
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, 300, [[0, 'rgba(4,6,22,.55)'], [0.3, 'rgba(4,6,22,0)'], [0.75, 'rgba(4,6,22,0)'], [1, 'rgba(4,6,22,.5)']]); ctx.fillRect(0, 0, 1232, 300);
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 1232, 0, [[0, 'rgba(4,6,22,.5)'], [0.1, 'rgba(4,6,22,0)'], [0.9, 'rgba(4,6,22,0)'], [1, 'rgba(4,6,22,.5)']]); ctx.fillRect(0, 0, 1232, 300);
  });
  return k;
}


class LaneView {
  constructor(scene, rect, level, worldId) {
    this.scene = scene; this.rect = rect; this.level = level; this.wid = worldId; this.map = CR.parseLevel(level);
    this.spd = 1; this.dead = false; this.scroll = 0; this.dir = level.dir || 1; this.col = this.map.start;
    this.tex = makeLaneTextures(scene, worldId);
    this.theme = THEMES[worldId];
    this.worldW = this.map.n * TW;
    this.build();
  }

  /* ---------- สร้างฉาก ---------- */
  build() {
    const s = this.scene, r = this.rect, T = this.theme;
    this.root = s.add.container(r.x, r.y);
    // มาสก์ตัดภาพให้อยู่ในกรอบ
    const mg = s.make.graphics({ x: 0, y: 0, add: false }); mg.fillStyle(0xffffff); mg.fillRect(r.x, r.y, r.w, r.h);
    this.root.setMask(mg.createGeometryMask());
    // ฉากหลัง
    const arena = WORLDS[this.wid - 1].arena;
    this.bg = s.add.image(r.w / 2, r.h * 0.42, 'arena_' + arena); this.bg.setDisplaySize(r.w * 1.18, r.w * 1.18 * 0.5625);
    this.root.add(this.bg);
    const shade = s.add.rectangle(r.w / 2, r.h / 2, r.w, r.h, 0x060822, 0.38); this.root.add(shade);
    this.world = s.add.container(0, 0); this.root.add(this.world);
    this.fogs = [];
    // พื้นทางวิ่ง
    this.tiles = [];
    for (let x = 0; x < this.map.n; x++) {
      const c = this.map.cols[x];
      const key = c.t === 'pit' ? this.tex.pit : (x % 2 ? this.tex.groundB : this.tex.groundA);
      const t = s.add.image(x * TW, GROUND, key).setOrigin(0, 0).setDisplaySize(TW + 0.6, 120); this.world.add(t); this.tiles.push(t);
    }
    // แถบช่องสลับสีและเส้นแบ่งช่อง ให้เห็นชัดว่า 1 ช่องกว้างเท่าไร
    const lanes = s.add.graphics();
    for (let x = 0; x < this.map.n; x++) {
      if (x % 2 === 0) { lanes.fillStyle(0xffffff, 0.045); lanes.fillRect(x * TW, 0, TW, GROUND); }
      lanes.lineStyle(2, 0xffffff, 0.16);
      for (let y = 6; y < GROUND; y += 14) { lanes.beginPath(); lanes.moveTo(x * TW, y); lanes.lineTo(x * TW, y + 7); lanes.strokePath(); }
    }
    lanes.lineStyle(2, 0xffffff, 0.16); for (let y = 6; y < GROUND; y += 14) { lanes.beginPath(); lanes.moveTo(this.map.n * TW, y); lanes.lineTo(this.map.n * TW, y + 7); lanes.strokePath(); }
    this.world.add(lanes);
    // หมายเลขช่อง (นับ 1,2,3 จากซ้าย) ช่วยนับก้าวและตำแหน่งหลุม/ศัตรู
    this.cellNums = [];
    for (let x = 0; x < this.map.n; x++) {
      const c = this.map.cols[x]; if (c.t === 'pit') continue;
      const lab = x === this.map.start ? 'เริ่ม' : (x === this.map.goal ? 'ประตู' : String(x + 1));
      const t = KG.txt(s, x * TW + TW / 2, GROUND + 62, lab, { size: lab.length > 2 ? 20 : 26, color: x === this.map.goal ? '#ffd34f' : (x === this.map.start ? T.accent : '#dbe4ff'), center: true, middle: true, stroke: true, sw: 4 }); t.setAlpha(0.95);
      this.world.add(t); this.cellNums.push(t);
    }
    // ไม้บรรทัดวัด 1 ช่อง ใต้ช่องเริ่ม
    { const sx = this.map.start * TW, ry = GROUND + 100, br = s.add.graphics(); br.lineStyle(3, 0xffd34f, 1);
      br.beginPath(); br.moveTo(sx + 4, ry - 10); br.lineTo(sx + 4, ry + 10); br.moveTo(sx + 4, ry); br.lineTo(sx + TW - 4, ry); br.moveTo(sx + TW - 4, ry - 10); br.lineTo(sx + TW - 4, ry + 10); br.strokePath();
      this.world.add(br); this.world.add(KG.txt(s, sx + TW / 2, ry + 14, '1 ช่อง', { size: 18, color: '#ffd34f', center: true, ox: 0.5, stroke: true, sw: 4 })); }
    // กรอบเน้นช่องที่ Techno ยืนอยู่ และกรอบประตู
    this.cursor = s.add.graphics(); this.cursor.fillStyle(0x4ef4d2, 0.26); this.cursor.fillRect(5, GROUND - 2, TW - 10, 20); this.cursor.lineStyle(4, 0x4ef4d2, 1); this.cursor.strokeRect(5, GROUND - 2, TW - 10, 20);
    this.cursor.fillStyle(0x4ef4d2, 0.1); this.cursor.fillRect(0, 0, TW, GROUND); this.cursor.lineStyle(3, 0x4ef4d2, 0.9); this.cursor.strokeRect(2, GROUND - 4, TW - 4, 126);
    this.world.add(this.cursor); s.tweens.add({ targets: this.cursor, alpha: 0.55, duration: 600, yoyo: true, repeat: -1 });
    const gg = s.add.graphics(); gg.lineStyle(4, 0xffd34f, 1); gg.strokeRect(this.map.goal * TW + 2, GROUND - 4, TW - 4, 126); this.world.add(gg); s.tweens.add({ targets: gg, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });
    // ขอบโลกซ้ายขวา
    [-1, this.map.n].forEach(x => { const w = s.add.image(x * TW + TW / 2, GROUND + 4, this.tex.wall).setOrigin(0.5, 1).setDisplaySize(72, 170).setAlpha(0.9); this.world.add(w); });
    [-2, -3, this.map.n + 1, this.map.n + 2].forEach(x => { const t = s.add.image(x * TW, GROUND, this.tex.groundB).setOrigin(0, 0).setDisplaySize(TW + 0.6, 120); this.world.add(t); });
    this.items = { coins: [], foes: [], props: [] };
    this.pitEmbers = [];
    this.spawnObjects();
    // ประตู
    const gx = this.colX(this.map.goal);
    this.portalGlow = s.add.image(gx, GROUND - 100, 'fx_glow').setTint(T.glow).setBlendMode('ADD').setDisplaySize(260, 260).setAlpha(0.55);
    this.portal = s.add.image(gx, GROUND + 2, this.tex.portal).setOrigin(0.5, 1).setDisplaySize(130, 182);
    this.lockIcon = KG.ui.icon(s, 'lock', gx, GROUND - 92, 40, 0xffffff);
    this.world.add([this.portalGlow, this.portal, this.lockIcon]);
    s.tweens.add({ targets: this.portalGlow, alpha: 0.9, scaleX: this.portalGlow.scaleX * 1.1, scaleY: this.portalGlow.scaleY * 1.1, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    s.tweens.add({ targets: this.portal, scaleX: this.portal.scaleX * 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.portalEm = s.add.particles(gx, GROUND - 100, 'fx_spark', { speed: { min: 20, max: 60 }, angle: { min: 0, max: 360 }, scale: { start: 0.32, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 900, frequency: 90, tint: [T.glow, 0xffffff, 0xff3d8b], blendMode: 'ADD', emitZone: { type: 'edge', source: new Phaser.Geom.Ellipse(0, 0, 100, 160), quantity: 24 } });
    this.world.add(this.portalEm);
    // จุดเริ่ม
    const pad = s.add.image(this.colX(this.map.start), GROUND + 1, this.tex.pad).setOrigin(0.5, 0.2); this.world.add(pad);
    // เงาและฮีโร่
    this.shadow = s.add.ellipse(0, GROUND + 4, 96, 16, 0x000000, 0.45); this.world.add(this.shadow);
    this.hero = KG.art.make(s, 0, GROUND + 2, HID, 'idle', HERO_BODY); this.hs = this.hero.artScale;
    this.world.add(this.hero);
    this.heroX = this.colX(this.col); this.heroY = 0;
    this.placeHero();
    this.idleTween = null; this.startIdle();
    this.fxLayer = s.add.container(0, 0); this.world.add(this.fxLayer);
    // เส้นขอบและเอฟเฟกต์ซ้อนหน้า
    this.vig = s.add.image(r.w / 2, r.h / 2, this.tex.vignette).setDisplaySize(r.w, r.h); this.root.add(this.vig);
    this.flashRect = s.add.rectangle(r.w / 2, r.h / 2, r.w, r.h, 0xff4d5e, 0).setBlendMode('NORMAL'); this.root.add(this.flashRect);
    // ไฟลอยในฉาก
    const em = s.add.particles(0, 0, 'fx_spark', { x: { min: 0, max: r.w }, y: { min: 20, max: r.h - 40 }, speedX: { min: -10, max: 10 }, speedY: { min: -22, max: -6 }, scale: { start: 0.22, end: 0 }, alpha: { start: 0, end: 0.5 }, lifespan: { min: 2500, max: 5000 }, frequency: 220, tint: [T.glow, 0xffffff], blendMode: 'ADD' });
    this.root.add(em); this.ambient = em;
    this.updateGate(false);
    this.snapCamera();
  }
  colX(c) { return c * TW + TW / 2; }
  spawnObjects() {
    const s = this.scene, m = this.map, T = this.theme;
    (this.coinObjs || []).forEach(o => o && o.destroy()); this.items.foes.forEach(o => o && o.destroy()); this.items.props.forEach(o => o && o.destroy());
    this.items = { coins: [], foes: [], props: [] };
    m.cols.forEach((c, x) => {
      const cx = this.colX(x);
      if (c.t === 'spike') { const sp = s.add.image(cx, GROUND + 2, this.tex.spike).setOrigin(0.5, 1).setDisplaySize(TW - 4, 44); this.world.add(sp); this.items.props.push(sp); }
      if (c.t === 'crate') { const cr = s.add.image(cx, GROUND + 1, this.tex.crate).setOrigin(0.5, 1).setDisplaySize(74, 74); this.world.add(cr); cr._col = x; this.items.props.push(cr); }
      if (c.t === 'wall') { const w = s.add.image(cx, GROUND + 2, this.tex.wall).setOrigin(0.5, 1).setDisplaySize(72, 170); this.world.add(w); this.items.props.push(w); }
      if (c.t === 'enemy') {
        const boss = c.boss, id = boss ? 'm4' : FOES[(x + this.wid) % FOES.length];
        const a = KG.ART[id], h = Math.min(boss ? 196 : 112, (boss ? 3.2 : 1.25) * TW * a.body / a.bw), img = KG.art.make(s, 0, GROUND + 3, id, 0, h);   // ตัวกว้างไม่เกิน ~1 ช่อง ให้เห็นชัดว่าอยู่ช่องไหน
        const g = s.add.container(cx, 0); const sh = s.add.ellipse(0, GROUND + 4, boss ? 150 : 90, 14, 0x000000, 0.4);
        g.add([sh, img]); g.img = img; g.hp = c.hp; g.maxHp = c.hp; g.col = x; g.boss = boss; g.baseScale = img.scaleX; g.busy = false;
        if (boss) { g.pips = []; for (let i = 0; i < c.hp; i++) { const p = s.add.rectangle((i - (c.hp - 1) / 2) * 20, GROUND - h - 14, 14, 9, 0xff4d5e).setStrokeStyle(2, 0x000000); g.add(p); g.pips.push(p); } }
        s.tweens.add({ targets: img, scaleY: img.scaleY * 1.03, scaleX: img.scaleX * 0.985, duration: 900 + (x % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.world.add(g); this.items.foes[x] = g;
      }
      if (c.t === 'pit') {
        const em = s.add.particles(cx, GROUND + 100, 'fx_spark', { x: { min: -26, max: 26 }, speedY: { min: -80, max: -30 }, scale: { start: 0.3, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 1000, frequency: 160, tint: [T.glow, 0xffffff], blendMode: 'ADD' });
        this.world.add(em); this.items.props.push(em);
      }
    });
    this.coinObjs = m.coins.map((cn, i) => {
      const cx = this.colX(cn.x), y = cn.air ? GROUND - 128 : GROUND - 46;
      const g = s.add.container(cx, y);
      const glow = s.add.image(0, 0, 'fx_glow').setTint(0x4ef4d2).setBlendMode('ADD').setDisplaySize(86, 86).setAlpha(0.6);
      const img = s.add.image(0, 0, this.tex.coin).setDisplaySize(38, 46);
      g.add([glow, img]); this.world.add(g);
      s.tweens.add({ targets: g, y: y - 7, duration: 900 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      s.tweens.add({ targets: img, scaleX: img.scaleX * 0.35, duration: 700 + i * 40, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      g.img = img; g.glow = glow; g.got = false; return g;
    });
    this.coinsGot = 0;
  }
  updateGate(open, anim) {
    const T = this.theme;
    this.gateOpen = open;
    this.lockIcon.setVisible(!open);
    this.portal.setTint(open ? 0xffffff : 0x7a7f9a); this.portalGlow.setTint(open ? T.glow : 0x6a6f90).setAlpha(open ? 0.8 : 0.3);
    this.portalEm.setVisible(open);
    if (open && anim) {
      KG.audio.play('unlock'); KG.fx.ring(this.scene, this.abs(this.colX(this.map.goal), GROUND - 100).x, this.abs(0, GROUND - 100).y, T.glow, { size: 2.6, w: 0.7 });
    }
  }
  abs(wx, wy) { return { x: this.rect.x + this.world.x + wx, y: this.rect.y + wy }; }
  allCoins() { return this.coinsGot >= this.map.coins.length; }

  /* ---------- กล้อง ---------- */
  targetScroll() {
    const view = this.rect.w;
    if (this.worldW + 2 * TW <= view) return -(view - this.worldW) / 2;
    return KG.clamp(this.heroX - view * 0.38, -TW * 1.2, this.worldW + TW * 1.2 - view);
  }
  snapCamera() { this.scroll = this.targetScroll(); this.world.x = -this.scroll; this.bg.x = this.rect.w / 2 - this.scroll * 0.06; }
  followCamera(ms) {
    const t = this.targetScroll();
    if (Math.abs(t - this.scroll) < 1) return;
    this.scene.tweens.add({ targets: this, scroll: t, duration: ms || 420, ease: 'Sine.easeInOut', onUpdate: () => { this.world.x = -this.scroll; this.bg.x = this.rect.w / 2 - this.scroll * 0.06; } });
  }

  /* ---------- ฮีโร่ ---------- */
  placeHero() {
    this.hero.setPosition(this.heroX, GROUND + 5 + this.heroY).setFlipX(this.dir < 0);
    if (this.cursor) this.cursor.x = KG.clamp(Math.round((this.heroX - TW / 2) / TW), 0, this.map.n - 1) * TW;
    this.shadow.setPosition(this.heroX, GROUND + 4);
    this.shadow.setScale(1 - Math.min(0.4, -this.heroY / 400), 1);
    this.scroll += (this.targetScroll() - this.scroll) * 0.09; this.world.x = -this.scroll; this.bg.x = this.rect.w / 2 - this.scroll * 0.06;
    this.faceFoes();
  }
  // มอนสเตอร์หันหน้าหาฮีโร่เสมอ (ภาพต้นฉบับหันซ้าย) และชูท่าเตือนเมื่อฮีโร่เข้าใกล้
  faceFoes() {
    (this.items.foes || []).forEach(g => {
      if (!g || !g.img || g.busy) return;
      g.img.setFlipX(this.heroX > g.x);
      const near = Math.abs(this.heroX - g.x) < TW * 2.4;
      const want = near ? 5 : 0; if (g.pose !== want) { g.pose = want; KG.art.frame(g.img, want); }
    });
  }
  frame(name) { KG.art.frame(this.hero, name); }
  startIdle() {
    this.stopIdle(); this.followCamera(380);
    this.fixScale();
    const sy = this.hero.scaleY, sx = this.hero.scaleX;
    this.idleTween = this.scene.tweens.add({ targets: this.hero, scaleY: sy * 1.022, scaleX: sx * 0.992, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  stopIdle() { if (this.idleTween) { this.idleTween.remove(); this.idleTween = null; } this.fixScale(); }
  fixScale() { this.hero.setScale(this.hs, this.hs); }
  setSpeed(v) { this.spd = v; }
  d(ms) { return ms / this.spd; }

  dust(x, n, dirBias) {
    const s = this.scene;
    const em = s.add.particles(x, GROUND + 2, 'fx_spark', { speedX: { min: -50 + (dirBias || 0) * 40, max: 50 + (dirBias || 0) * 40 }, speedY: { min: -60, max: -10 }, scale: { start: 0.55, end: 0 }, alpha: { start: 0.55, end: 0 }, lifespan: 420, tint: [0xdfe6ff, 0x9fb0d8], emitting: false });
    this.fxLayer.add(em); em.explode(n || 6); s.time.delayedCall(600, () => em.destroy());
  }
  popText(str, color, dy) {
    const s = this.scene, t = KG.txt(s, this.heroX, GROUND - 190 + (dy || 0), str, { size: 30, color: color || '#ffffff', center: true, middle: true, stroke: true });
    this.fxLayer.add(t); t.setScale(0.4);
    s.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 160, ease: 'Back.easeOut' });
    s.tweens.add({ targets: t, y: t.y - 46, alpha: 0, delay: 500, duration: 600, onComplete: () => t.destroy() });
  }
  flash(color, a) {
    this.flashRect.setFillStyle(color, a || 0.35).setAlpha(1);
    this.scene.tweens.add({ targets: this.flashRect, alpha: 0, duration: 420 });
  }
  shake(ms, amt) { this.scene.tweens.add({ targets: this.root, x: { from: this.rect.x - (amt || 5), to: this.rect.x + (amt || 5) }, duration: 45, yoyo: true, repeat: Math.round((ms || 240) / 90), onComplete: () => { this.root.x = this.rect.x; } }); }

  collect(i, order) {
    const g = this.coinObjs[i]; if (!g || g.got) return;
    g.got = true; this.coinsGot++;
    const s = this.scene, p = this.abs(g.x, g.y);
    KG.audio.play('coin', { i: this.coinsGot - 1 });
    KG.fx.burst(s, p.x, p.y, { colors: [0x4ef4d2, 0xffffff], n: 14, max: 220, depth: 60 });
    KG.fx.pop(s, p.x, p.y - 20, '+1', { color: '#4ef4d2', size: 30 });
    s.tweens.add({ targets: g, y: g.y - 60, alpha: 0, scaleX: 1.6, scaleY: 1.6, duration: 380, ease: 'Cubic.easeOut', onComplete: () => g.destroy() });
    if (this.onCoin) this.onCoin(this.coinsGot, this.map.coins.length, p);
    if (this.allCoins()) this.updateGate(true, true);
  }

  /* ---------- เคลื่อนไหวตามเหตุการณ์ ---------- */
  async walk(ev) {
    const s = this.scene, dir = this.dir, x0 = this.heroX, x1 = this.colX(ev.from + dir), dur = this.d(500);
    this.stopIdle(); this.fixScale(); KG.audio.play('step'); this.dust(x0 - dir * 18, 4, -dir);
    let lastF = '', coinDone = false, st2 = false;
    await tween(s, {
      targets: { p: 0 }, p: 1, duration: dur, ease: 'Linear',
      onUpdate: (tw, o) => {
        const p = o.p;
        this.heroX = x0 + (x1 - x0) * p; this.heroY = -Math.abs(Math.sin(p * Math.PI * 2)) * 3; this.placeHero();
        const f = KG.art.walkFrame(p);
        if (f !== lastF) { lastF = f; this.frame(f); }
        if (p > 0.5 && !st2) { st2 = true; KG.audio.play('step'); }
        if (p > 0.78 && !coinDone) { coinDone = true; (ev.coins || []).forEach(i => this.collect(i)); }
      }
    });
    this.col = ev.from + dir; this.heroX = x1; this.heroY = 0; this.frame('idle'); this.placeHero(); this.startIdle();
  }
  async jump(ev) {
    const s = this.scene, dir = this.dir, x0 = this.heroX, x1 = this.colX(ev.from + 2 * dir), dur = this.d(700), H = 132;
    this.stopIdle(); this.fixScale(); this.frame('idle'); KG.audio.play('jump'); this.dust(x0, 7, 0);
    await tween(s, { targets: this.hero, scaleY: this.hero.scaleY * 0.86, scaleX: this.hero.scaleX * 1.06, duration: this.d(90), yoyo: true });
    this.fixScale(); this.frame('up');
    const coins = (ev.coins || []).slice(), mid = this.colX(ev.from + dir);
    await tween(s, {
      targets: { p: 0 }, p: 1, duration: dur, ease: 'Linear',
      onUpdate: (tw, o) => {
        const p = o.p;
        this.heroX = x0 + (x1 - x0) * p; this.heroY = -Math.sin(p * Math.PI) * H; this.placeHero();
        this.hero.setAngle((this.dir > 0 ? 1 : -1) * (p < 0.5 ? -5 : 4) * Math.sin(p * Math.PI));
        this.frame(p < 0.5 ? 'up' : 'fall');
        if (p >= 0.48 && coins.length) { coins.splice(0).forEach(i => this.collect(i)); }
        if (Math.abs(this.heroX - mid) < 26 && !this._swoosh) { this._swoosh = true; }
      }
    });
    this._swoosh = false; this.hero.setAngle(0);
    this.col = ev.from + 2 * dir; this.heroX = x1; this.heroY = 0; this.placeHero(); KG.audio.play('land'); this.dust(x1, 8, 0);
    KG.fx.ring(s, this.abs(x1, GROUND + 6).x, this.abs(0, GROUND + 6).y, 0xffffff, { size: 1.1, w: 0.35 });
    this.frame('idle'); this.fixScale();
    await tween(s, { targets: this.hero, scaleY: this.hero.scaleY * 0.9, scaleX: this.hero.scaleX * 1.05, duration: this.d(90), yoyo: true });
    this.fixScale(); this.startIdle();
  }
  async attack(ev) {
    const s = this.scene, dir = this.dir; this.stopIdle(); this.fixScale();
    this.frame('a1'); KG.audio.play('swing');
    await tween(s, { targets: this, heroX: this.heroX - dir * 10, duration: this.d(130), ease: 'Sine.easeOut', onUpdate: () => this.placeHero() });
    this.frame('a2');
    const tx = this.colX(ev.at), fx = this.heroX;
    const sl = s.add.image(this.heroX + dir * 70, GROUND - 78, this.tex.slash).setBlendMode('ADD').setDisplaySize(170, 170).setAlpha(0.95).setScale(0.3 * (dir < 0 ? -1 : 1), 0.3);
    sl.setFlipX(dir < 0); this.fxLayer.add(sl);
    s.tweens.add({ targets: sl, scaleX: (dir < 0 ? -1 : 1) * 1.05, scaleY: 1.05, alpha: 0, duration: this.d(260), ease: 'Cubic.easeOut', onComplete: () => sl.destroy() });
    await tween(s, { targets: this, heroX: fx + dir * 34, duration: this.d(90), ease: 'Cubic.easeOut', onUpdate: () => this.placeHero() });
    this.frame('a3');
    if (ev.kind === 'enemy' || ev.kind === 'boss') await this.hitFoe(ev);
    else if (ev.kind === 'crate') await this.breakCrate(ev);
    else { this.popText('พลาด', '#9fb0d8', 10); KG.audio.play('tick'); }
    await wait(s, this.d(80));
    await tween(s, { targets: this, heroX: this.colX(this.col), duration: this.d(160), ease: 'Sine.easeInOut', onUpdate: () => this.placeHero() });
    this.frame('idle'); this.startIdle();
  }
  async hitFoe(ev) {
    const s = this.scene, g = this.items.foes[ev.at]; if (!g) return;
    const p = this.abs(g.x, GROUND - 70); KG.audio.play(ev.killed ? 'kill' : 'hit');
    g.hp = ev.hp;
    if (g.pips) g.pips.forEach((pp, i) => pp.setFillStyle(i < g.hp ? 0xff4d5e : 0x3a2a40));
    this.shake(160, 4); KG.fx.burst(s, p.x, p.y, { colors: [0xffffff, 0xff3d8b, 0xffd34f], n: ev.killed ? 26 : 12, max: 320, depth: 60 });
    KG.fx.ring(s, p.x, p.y, 0xff3d8b, { size: 1.6, w: 0.4 });
    g.busy = true; KG.art.frame(g.img, 7); g.img.setTintFill(0xffffff); s.time.delayedCall(90, () => g.img && g.img.clearTint());
    if (ev.killed) {
      this.popText('เยี่ยม!', '#ffd34f', -10);
      await tween(s, { targets: g, x: g.x + this.dir * 40, alpha: 0, duration: this.d(380), ease: 'Cubic.easeOut' });
      g.destroy(); this.items.foes[ev.at] = null;
    } else {
      await tween(s, { targets: g, x: g.x + this.dir * 14, duration: this.d(80), yoyo: true });
      await wait(s, this.d(140)); g.busy = false; g.pose = -1; this.faceFoes();
    }
  }
  async breakCrate(ev) {
    const s = this.scene, c = this.items.props.find(o => o && o._col === ev.at); KG.audio.play('crate');
    if (!c) return;
    const p = this.abs(c.x, GROUND - 40);
    KG.fx.burst(s, p.x, p.y, { colors: [0x4a5aa8, 0xffd34f, 0xffffff], tex: 'fx_shard', n: 16, max: 340, g: 700, rot: true, add: false, depth: 60 });
    this.shake(180, 5);
    await tween(s, { targets: c, alpha: 0, scaleX: 1.25, scaleY: 0.5, duration: this.d(160) });
    c.destroy();
  }
  async turn() {
    const s = this.scene; this.stopIdle(); this.fixScale(); KG.audio.play('turn');
    await tween(s, { targets: this, heroY: -18, duration: this.d(110), ease: 'Sine.easeOut', onUpdate: () => this.placeHero() });
    this.dir = -this.dir; this.placeHero();
    const a = s.add.image(this.heroX, GROUND - 70, 'fx_ring').setTint(0xffffff).setBlendMode('ADD').setScale(0.2).setAlpha(0.7); this.fxLayer.add(a);
    s.tweens.add({ targets: a, scaleX: 0.9, scaleY: 0.5, alpha: 0, duration: this.d(260), onComplete: () => a.destroy() });
    await tween(s, { targets: this, heroY: 0, duration: this.d(110), ease: 'Bounce.easeOut', onUpdate: () => this.placeHero() });
    this.startIdle();
  }
  async fail(ev) {
    const s = this.scene, dir = this.dir; this.stopIdle(); this.fixScale(); KG.audio.play('error');
    if (ev.code === 'bump') {
      const msg = ev.kind === 'enemy' || ev.kind === 'boss' ? 'ชนศัตรู!' : (ev.kind === 'crate' ? 'ชนลัง!' : 'ชนกำแพง!');
      if (ev.jump) { await this.jumpPartial(ev, false); }
      else { await tween(s, { targets: this, heroX: this.heroX + dir * 16, duration: this.d(90), onUpdate: () => this.placeHero() }); }
      this.frame('hurt'); KG.audio.play('hit'); this.flash(0xff4d5e, 0.3); this.shake(260, 6); this.popText(msg, '#ff7a8a');
      if (ev.kind === 'enemy' || ev.kind === 'boss') this.foeStrike(ev.at);
      await tween(s, { targets: this, heroX: this.heroX - dir * 28, duration: this.d(200), ease: 'Cubic.easeOut', onUpdate: () => this.placeHero() });
      return;
    }
    if (ev.code === 'fall') {
      const x1 = this.colX(ev.at);
      if (ev.jump) { await this.jumpPartial(ev, true); }
      else { await this.walkTo(x1, this.d(380)); }
      this.frame('hurt'); KG.audio.play('fall'); this.popText('ตกหลุม!', '#ff7a8a'); this.flash(0xff4d5e, 0.25);
      const p = this.abs(x1, GROUND + 40); KG.fx.burst(s, p.x, p.y, { colors: [this.theme.glow, 0xffffff], n: 18, max: 260, depth: 60 });
      await tween(s, { targets: this.hero, y: this.hero.y + 330, angle: dir * 140, alpha: 0, duration: this.d(650), ease: 'Cubic.easeIn' });
      this.shake(240, 5); return;
    }
    if (ev.code === 'spike') {
      const x1 = this.colX(ev.at);
      if (ev.jump) { await this.jumpPartial(ev, true); }
      else { await this.walkTo(x1 - dir * 20, this.d(360)); }
      this.frame('hurt'); KG.audio.play('hurt'); this.flash(0xff4d5e, 0.4); this.shake(300, 7); this.popText('โดนหนาม!', '#ff7a8a');
      const p = this.abs(this.heroX, GROUND - 40); KG.fx.burst(s, p.x, p.y, { colors: [0xff4d5e, 0xffffff], n: 20, max: 300, depth: 60 });
      await tween(s, { targets: this, heroY: -70, heroX: this.heroX - dir * 40, duration: this.d(260), ease: 'Cubic.easeOut', onUpdate: () => this.placeHero() });
      await tween(s, { targets: this, heroY: 0, duration: this.d(220), ease: 'Bounce.easeOut', onUpdate: () => this.placeHero() });
      return;
    }
    if (ev.code === 'timeout') { this.frame('hurt'); this.popText('วนไม่จบ!', '#ffd34f'); this.flash(0xffd34f, 0.2); }
  }
  async jumpPartial(ev, toTarget) {
    const s = this.scene, dir = this.dir, x0 = this.heroX, x1 = toTarget ? this.colX(ev.at) : this.colX(ev.from + dir) + dir * 8, dur = this.d(toTarget ? 640 : 380), H = 120;
    this.frame('up'); KG.audio.play('jump');
    await tween(s, {
      targets: { p: 0 }, p: 1, duration: dur, ease: 'Linear',
      onUpdate: (tw, o) => { const p = o.p; this.heroX = x0 + (x1 - x0) * p; this.heroY = -Math.sin(p * Math.PI * (toTarget ? 1 : 0.7)) * H; this.placeHero(); this.frame(p < 0.5 ? 'up' : 'fall'); }
    });
    if (!toTarget) { this.frame('hurt'); KG.audio.play('hit'); await tween(s, { targets: this, heroY: 0, duration: this.d(180), onUpdate: () => this.placeHero() }); }
    else { this.heroY = 0; this.placeHero(); }
  }
  // เดินด้วยท่าเดินครบรอบเท้าต่อระยะ (ใช้ตอนเดินชนหลุม/หนามและเดินเข้าประตู)
  async walkTo(x1, dur) {
    const x0 = this.heroX;
    await tween(this.scene, { targets: { p: 0 }, p: 1, duration: dur, ease: 'Linear', onUpdate: (tw, o) => { this.heroX = x0 + (x1 - x0) * o.p; this.placeHero(); this.frame(KG.art.walkFrame(o.p)); } });
  }
  // ศัตรูที่ถูกชนสวนกลับ: ชูท่าโจมตีแล้วพุ่งเข้าหาฮีโร่นิดเดียว
  async foeStrike(col) {
    const g = this.items.foes[col], s = this.scene; if (!g || !g.img) return;
    g.busy = true; KG.art.frame(g.img, 6); const x0 = g.x, dir = this.heroX < g.x ? -1 : 1;
    await tween(s, { targets: g, x: x0 + dir * 22, duration: this.d(110), ease: 'Cubic.easeOut', yoyo: true });
    g.x = x0; await wait(s, this.d(240)); g.busy = false; g.pose = -1; this.faceFoes();
  }
  async win() {
    const s = this.scene; this.stopIdle(); this.fixScale(); KG.audio.play('portal');
    const gx = this.colX(this.map.goal), dir = this.dir, base = this.hs, py = GROUND - 92;
    const p = this.abs(gx, py);
    this.portal.clearTint(); this.portalGlow.setTint(this.theme.glow).setAlpha(1); this.portalEm.setVisible(true);
    KG.fx.ring(s, p.x, p.y, this.theme.glow, { size: 4, w: 0.8 }); KG.fx.glow(s, p.x, p.y, 0xffffff, 560, 700);
    await this.walkTo(gx, this.d(300));   // เดินให้ถึงกลางประตู
    this.frame('up'); KG.audio.play('jump');
    // ถูกดูดเข้าประตู: หมุนวนและหดเล็กลงตามแรงวาป
    s.tweens.add({ targets: this.hero, scaleX: base * 0.18, scaleY: base * 0.18, angle: dir * 540, alpha: 0, duration: this.d(720), ease: 'Cubic.easeIn' });
    s.tweens.add({ targets: this.shadow, scaleX: 0.1, alpha: 0, duration: this.d(600) });
    const swirl = s.add.particles(gx, py, 'fx_spark', { speed: { min: 60, max: 200 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 600, tint: [this.theme.glow, 0xffffff, 0xff3d8b], blendMode: 'ADD', gravityX: 0, emitting: false });
    this.fxLayer.add(swirl); swirl.explode(36); s.time.delayedCall(900, () => swirl.destroy());
    await tween(s, { targets: this, heroY: -(GROUND - py) + 8, heroX: gx + dir * 6, duration: this.d(720), ease: 'Cubic.easeIn', onUpdate: () => this.placeHero() });
    KG.fx.ring(s, p.x, p.y, 0xffffff, { size: 3, w: 0.5 }); this.flash(0xffffff, 0.35);
    await tween(s, { targets: this.portal, scaleX: this.portal.scaleX * 1.12, scaleY: this.portal.scaleY * 1.12, duration: this.d(160), yoyo: true });
  }
  async playEvent(ev) {
    if (this.dead) return;
    switch (ev.op) {
      case 'walk': return this.walk(ev);
      case 'jump': return this.jump(ev);
      case 'attack': return this.attack(ev);
      case 'turn': return this.turn();
      case 'fail': return this.fail(ev);
      default: return null;
    }
  }
  reset() {
    this.scene.tweens.killTweensOf(this.hero); this.scene.tweens.killTweensOf(this);
    this.hero.setAlpha(1).setAngle(0); this.dir = this.level.dir || 1; this.col = this.map.start; this.heroX = this.colX(this.col); this.heroY = 0;
    this.spawnObjects(); this.updateGate(false); this.frame('idle'); this.fixScale(); this.placeHero(); this.startIdle(); this.scroll = this.targetScroll(); this.world.x = -this.scroll;
  }
  destroy() { this.dead = true; this.scene.tweens.killTweensOf(this.hero); this.root.destroy(true); }
}
