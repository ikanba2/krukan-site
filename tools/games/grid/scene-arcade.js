/* ===== สนามไล่ล่า (Maze Rush): บังคับ Techno เองแบบเรียลไทม์ เก็บแกนพลังงานทั้งหมดแล้วเข้าประตู หลบมอนสเตอร์ =====
   วิ่งต่อเนื่องไปทางที่เลือก เลี้ยวได้ทุกแยก (ลูกศร/WASD ปัดนิ้ว หรือปุ่มทิศ) เก็บพลังพิเศษให้มอนสเตอร์กลัวแล้วชนฟันได้ */
const AC = { C: 60, OX: 250, OY: 112, WALKS: 3 };
const ARC_MON = { 1: ['m0', 'm2'], 2: ['m2', 'm5'], 3: ['m5', 'm1'], 4: ['m1', 'm5', 'm0'] };
const DIR_KEYS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3 };

class ArcadeScene extends KG.Scene {
  constructor() { super('Arcade'); }
  init(data) { this.wid = data && data.world ? data.world : 1; this._restartData = { world: this.wid }; }

  create() {
    this.setup(); KG.audio.music('action');
    const W = this.W = WORLDS[this.wid - 1], A = this.A = ARCADE[this.wid - 1], T = this.T = GTHEME[this.wid];
    this.map = GR.parseMap(A); this.tex = makeGridTextures(this, this.wid, AC.C);
    this.state = 'intro'; this._modal = null; this.score = 0; this.lives = 3; this.t = 0; this.gemsGot = 0; this.combo = 0; this.kills = 0; this.burstT = 0; this.invuln = 0;
    this.keys = {}; this.swipe = null;
    this.buildBackground(); this.buildWorld(); this.buildActors(); this.buildHud(); this.buildControls();
    this.showIntro();
  }
  onEscape() { if (this.state === 'play') this.pause(); }

  px(x) { return AC.OX + x * AC.C + AC.C / 2; }
  feetY(y) { return AC.OY + y * AC.C + AC.C * 0.68; }

  /* ---------- ฉาก ---------- */
  buildBackground() {
    this.add.image(GW / 2, GH / 2, 'arena_' + this.W.arena).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'garcshade', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.72)'], [0.5, 'rgba(5,8,28,.5)'], [1, 'rgba(5,8,28,.82)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);
    KG.fx.ambient(this, { freq: 220, colors: [this.T.glow, 0xffffff], depth: 2 });
  }
  buildWorld() {
    const m = this.map, C = AC.C, T = this.T;
    this.world = this.add.container(0, 0).setDepth(10);
    m.cells.forEach((row, y) => row.forEach((t, x) => {
      const cx = AC.OX + x * C - 10, cy = AC.OY + y * C - 10;
      if (t === 'wall') { const w = this.add.image(cx, cy - WH, this.tex.wall).setOrigin(0, 0).setDisplaySize(C + 20, C + WH + FH + 20).setDepth(y * 10 + 3); this.world.add(w); }
      else if (t !== 'void') { const img = this.add.image(cx, cy, (x + y) % 2 ? this.tex.tileA : this.tex.tileB).setOrigin(0, 0).setDisplaySize(C + 20, C + FH + 20).setDepth(y * 10); this.world.add(img); }
    }));
    this.gemObjs = m.gems.map((g, i) => {
      const c = this.add.container(this.px(g.x), AC.OY + g.y * C + C * 0.46).setDepth(g.y * 10 + 2);
      const glow = this.add.image(0, 0, 'fx_glow').setTint(0x4ef4d2).setBlendMode('ADD').setDisplaySize(C * 0.9, C * 0.9).setAlpha(0.55);
      const img = this.add.image(0, 0, this.tex.gem).setDisplaySize(C * 0.34, C * 0.41); c.add([glow, img]); this.world.add(c);
      this.tweens.add({ targets: c, y: c.y - 4, duration: 800 + i * 70, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: img, scaleX: img.scaleX * 0.35, duration: 650 + i * 40, yoyo: true, repeat: -1 });
      c.got = false; return c;
    });
    this.powerObjs = m.powers.map(p => {
      const c = this.add.container(this.px(p.x), AC.OY + p.y * C + C * 0.46).setDepth(p.y * 10 + 2);
      const glow = this.add.image(0, 0, 'fx_glow').setTint(0xffd34f).setBlendMode('ADD').setDisplaySize(C * 1.3, C * 1.3).setAlpha(0.8);
      const core = this.add.image(0, 0, KG.ui.iconKey(this, 'bolt')).setDisplaySize(C * 0.5, C * 0.5).setTint(0xfff3b0); c.add([glow, core]); this.world.add(c);
      this.tweens.add({ targets: glow, alpha: 0.35, scaleX: glow.scaleX * 1.25, scaleY: glow.scaleY * 1.25, duration: 520, yoyo: true, repeat: -1 });
      c.got = false; return c;
    });
    // ประตู
    const g = m.goal, gx = this.px(g.x), gy = AC.OY + g.y * C + C * 0.78;
    this.goalPad = this.add.image(gx, AC.OY + g.y * C + C / 2, this.tex.pad).setDisplaySize(C * 0.9, C * 0.9).setDepth(g.y * 10 + 1).setTint(0xffd34f);
    this.portalGlow = this.add.image(gx, gy - C * 0.6, 'fx_glow').setTint(T.glow).setBlendMode('ADD').setDisplaySize(C * 2, C * 2).setAlpha(0.3).setDepth(g.y * 10 + 2);
    this.portal = this.add.image(gx, gy, this.tex.portal).setOrigin(0.5, 1).setDisplaySize(C * 0.9, C * 1.25).setDepth(g.y * 10 + 2).setTint(0x7a7f9a);
    this.lockIcon = KG.ui.icon(this, 'lock', gx, gy - C * 0.6, Math.round(C * 0.42), 0xffffff).setDepth(g.y * 10 + 4);
    this.world.add([this.goalPad, this.portalGlow, this.portal, this.lockIcon]);
    this.tweens.add({ targets: this.portalGlow, alpha: 0.6, scaleX: this.portalGlow.scaleX * 1.08, scaleY: this.portalGlow.scaleY * 1.08, duration: 1100, yoyo: true, repeat: -1 });
    this.gateOpen = false;
  }
  openGate() {
    this.gateOpen = true; this.lockIcon.setVisible(false); this.portal.clearTint(); this.portalGlow.setAlpha(0.8).setTint(this.T.glow);
    KG.audio.play('unlock'); KG.fx.ring(this, this.px(this.map.goal.x), AC.OY + this.map.goal.y * AC.C + AC.C * 0.3, this.T.glow, { size: 3, w: 0.7 });
    this.banner('ประตูเปิดแล้ว! วิ่งไปที่ประตู', '#ffd34f');
  }

  /* ---------- ตัวละคร ---------- */
  buildActors() {
    const m = this.map, A = this.A, C = AC.C;
    this.hero = { cx: m.start.x, cy: m.start.y, tx: m.start.x, ty: m.start.y, t: 0, dir: -1, want: null, moving: false, flip: false, runT: 0 };
    this.heroShadow = this.add.ellipse(0, 0, C * 0.56, C * 0.18, 0x000000, 0.45); this.world.add(this.heroShadow);
    this.aura = this.add.image(0, 0, 'fx_glow').setTint(0xffd34f).setBlendMode('ADD').setDisplaySize(C * 2.2, C * 2.2).setAlpha(0); this.world.add(this.aura);
    this.heroImg = KG.art.make(this, 0, 0, HID, 'idle', Math.round(C * 1.5)); this.world.add(this.heroImg);
    const ids = ARC_MON[this.wid];
    this.mons = m.monsters.map((s, i) => {
      const id = ids[i % ids.length], a = KG.ART[id];
      const h = Math.min(C * 1.3, 1.05 * C * a.body / a.bw);
      const sh = this.add.ellipse(0, 0, C * 0.6, C * 0.16, 0x000000, 0.4), img = KG.art.make(this, 0, 0, id, 1, h); this.world.add([sh, img]);
      const mo = { id, img, sh, sx: s.x, sy: s.y, cx: s.x, cy: s.y, tx: s.x, ty: s.y, t: 0, dir: -1, moving: false, ai: A.ai[i], alive: true, wake: 0, phase: Math.random() * 3 };
      return mo;
    });
    this.placeAll();
  }
  placeAll() {
    const h = this.hero, x = h.cx + (h.tx - h.cx) * h.t, y = h.cy + (h.ty - h.cy) * h.t;
    this.hx = x; this.hy = y;
    const hz = h.moving ? Math.abs(Math.sin(h.runT * 6)) * 3 : 0;
    this.heroImg.setPosition(this.px(x), this.feetY(y) - hz).setFlipX(h.flip).setDepth(Math.round(y) * 10 + 5);
    this.heroShadow.setPosition(this.px(x), this.feetY(y) + 1).setDepth(Math.round(y) * 10 + 4);
    this.aura.setPosition(this.px(x), this.feetY(y) - AC.C * 0.5).setDepth(Math.round(y) * 10 + 3);
    this.mons.forEach(o => {
      const mx = o.cx + (o.tx - o.cx) * o.t, my = o.cy + (o.ty - o.cy) * o.t; o.x = mx; o.y = my;
      o.img.setPosition(this.px(mx), this.feetY(my)).setDepth(Math.round(my) * 10 + 5); o.sh.setPosition(this.px(mx), this.feetY(my) + 1).setDepth(Math.round(my) * 10 + 4);
    });
    this.world.sort('depth');
  }

  /* ---------- HUD และปุ่มควบคุม ---------- */
  buildHud() {
    this.hud = this.add.container(0, 0).setDepth(100);
    this.hearts = []; for (let i = 0; i < 3; i++) { const h = KG.ui.icon(this, 'heart', 52 + i * 52, 40, 40, 0xff4d5e); this.hud.add(h); this.hearts.push(h); }
    this.scoreTxt = this.txt(GW - 250, 20, '0', { size: 38, color: '#ffffff', stroke: true, ox: 1, oy: 0 }); this.hud.add(this.scoreTxt);
    this.hud.add(this.txt(GW - 242, 34, 'คะแนน', { size: 17, color: '#9fb0d8', oy: 0 }));
    this.gemTxt = this.txt(GW / 2, 18, '', { size: 28, color: '#4ef4d2', center: true, ox: 0.5, stroke: true }); this.hud.add(this.gemTxt);
    this.gemBar = KG.ui.bar(this, GW / 2 - 200, 56, 400, 16, { value: 0, color: 0x4ef4d2, edge: 0x4ef4d2 }); this.hud.add(this.gemBar);
    iconButton(this, GW - 56, 44, 'pause', () => this.pause(), { w: 60, h: 52, depth: 101 }); iconButton(this, GW - 126, 44, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 101 });
    // แผงข้อมูลด้านซ้าย
    KG.ui.panel(this, 22, 112, 204, 330, { accent: css(this.W.color), cuts: [14, 0, 14, 0] }).setDepth(50);
    this.txt(36, 124, this.W.name, { size: 18, color: this.W.tint }).setDepth(51);
    this.txt(36, 146, 'สนามไล่ล่า', { size: 26, stroke: true }).setDepth(51);
    this.txt(36, 192, KG.wrap(this.W.arcadeRule, 176, '400 17px Kanit'), { size: 17, weight: 400, color: '#cdd7f2', lineSpacing: 4 }).setDepth(51);
    this.burstChip = this.txt(36, 396, '', { size: 18, color: '#ffd34f' }).setDepth(51);
    this.burstBar = KG.ui.bar(this, 36, 420, 176, 12, { value: 0, color: 0xffd34f, edge: 0xffd34f }); this.burstBar.setDepth(51);
    this.setHearts(); this.updateGems();
  }
  setHearts() { this.hearts.forEach((h, i) => h.setTint(i < this.lives ? 0xff4d5e : 0x3a2a44)); }
  updateGems() { const n = this.map.gems.length; this.gemTxt.setText('แกนพลังงาน ' + this.gemsGot + ' / ' + n); this.gemBar.setValue(n ? this.gemsGot / n : 1, 200); }
  addScore(n, x, y) { this.score += n; this.scoreTxt.setText(String(this.score)); if (x != null) KG.fx.pop(this, x, y, '+' + n, { size: 26, color: '#ffd34f' }); }
  banner(str, color) {
    const t = KG.txt(this, GW / 2, 230, str, { size: 44, color: color || '#ffffff', center: true, middle: true, stroke: true, sw: 7 }).setDepth(200).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' }); this.tweens.add({ targets: t, alpha: 0, y: 200, delay: 1100, duration: 400, onComplete: () => t.destroy() });
  }
  buildControls() {
    // ปุ่มทิศบนจอ (ใช้กับมือถือหรือเมาส์) ทางขวาของแผนที่
    const cx = 1150, cy = 560, S = 66, mk = (dx, dy, icon, dir) => { const b = new KG.ui.Button(this, cx + dx, cy + dy, S, S, { label: '', icon, style: 'ghost', slant: 8, sfx: 'hover', depth: 60, onClick: () => this.setWant(dir) }); return b; };
    mk(0, -S - 6, 'chevU', 0); mk(S + 6, 0, 'chevR', 1); mk(0, S + 6, 'chevD', 2); mk(-S - 6, 0, 'chevL', 3);
    this.input.keyboard.on('keydown', e => { if (this.state === 'play' && DIR_KEYS[e.key] != null) { this.setWant(DIR_KEYS[e.key]); e.preventDefault && e.preventDefault(); } else if ((e.key === 'p' || e.key === 'P') && this.state === 'play') this.pause(); });
    this.input.on('pointerdown', p => { if (this.state === 'play' && p.worldX > AC.OX - 20 && p.worldX < 1040) this.swipe = { x: p.worldX, y: p.worldY }; });
    this.input.on('pointerup', p => {
      if (!this.swipe || this.state !== 'play') { this.swipe = null; return; }
      const dx = p.worldX - this.swipe.x, dy = p.worldY - this.swipe.y; this.swipe = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) this.setWant(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    });
    this.txt(AC.OX + 390, 686, 'ลูกศร / WASD หรือปัดนิ้วบนแผนที่เพื่อเลี้ยว', { size: 18, weight: 400, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(51);
  }
  setWant(d) { if (this.state !== 'play') return; this.hero.want = d; }

  /* ---------- เริ่ม/พัก ---------- */
  showIntro() {
    const W = this.W;
    KG.ui.modal(this, { title: 'สนามไล่ล่า ' + W.name, w: 860, accent: W.color, extraH: 190,
      body: 'เก็บแกนพลังงานทุกดวง แล้ววิ่งเข้าประตู ระวังมอนสเตอร์!',
      buttons: [{ label: 'กลับ', style: 'ghost', icon: 'chevL', onClick: () => this.go('Select', { world: this.wid }) }, { label: 'เริ่มวิ่ง!', style: 'primary', icon: 'play', pulse: true, onClick: () => this.start() }],
      build: (box, g) => {
        const y = g.top + 6;
        box.add(KG.txt(this, 0, y, W.arcadeRule, { size: 22, color: '#ffd34f', center: true, ox: 0.5, width: 760 }));
        box.add(KG.ui.icon(this, 'bolt', -330, y + 90, 40, 0xffd34f)); box.add(KG.txt(this, -296, y + 66, 'พลังพิเศษ: ' + this.A.burst + ' วินาที', { size: 22 })); box.add(KG.txt(this, -296, y + 98, 'มอนสเตอร์กลัวและโดนฟันได้', { size: 18, weight: 400, color: '#cdd7f2' }));
        box.add(KG.ui.icon(this, 'heart', 90, y + 90, 40, 0xff4d5e)); box.add(KG.txt(this, 124, y + 66, 'ชนมอนสเตอร์เสียหัวใจ 1 ดวง', { size: 22 })); box.add(KG.txt(this, 124, y + 98, 'มีหัวใจ 3 ดวง', { size: 18, weight: 400, color: '#cdd7f2' }));
      } });
  }
  start() { this.state = 'play'; this.t = 0; this.invuln = 1.2; KG.audio.play('go'); this.banner('ไป!', '#ffffff'); }
  pause() {
    if (this.state !== 'play') return; this.state = 'pause';
    KG.ui.modal(this, { title: 'พักเกม', w: 560, accent: KG.C.cyan, buttons: [{ label: 'ออก', style: 'danger', icon: 'home', onClick: () => this.go('Select', { world: this.wid }) }, { label: 'เริ่มใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Arcade', { world: this.wid }) }, { label: 'เล่นต่อ', style: 'primary', icon: 'play', onClick: () => { this.state = 'play'; } }] });
  }

  /* ---------- ลูปหลัก ---------- */
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000);
    if (this.state !== 'play') { this.idleAnim(dt); return; }
    this.t += dt; this.invuln = Math.max(0, this.invuln - dt);
    if (this.burstT > 0) { this.burstT = Math.max(0, this.burstT - dt); this.burstBar.setValue(this.burstT / this.A.burst, 0); if (this.burstT <= 0) this.endBurst(); }
    this.stepHero(dt); this.mons.forEach(o => this.stepMonster(o, dt)); this.collide();
    this.heroImg.setAlpha(this.invuln > 0 && Math.floor(this.t * 14) % 2 === 0 ? 0.4 : 1);
    this.placeAll();
  }
  idleAnim(dt) { KG.art.frame(this.heroImg, 'idle'); this.mons.forEach(o => { KG.art.frame(o.img, 0); }); }

  stepHero(dt) {
    const h = this.hero, m = this.map;
    const open = (x, y) => GR.openCell(m, x, y);
    if (h.moving) {
      // เลี้ยวย้อนกลับได้ทันทีกลางทาง
      if (h.want != null && h.want === (h.dir + 2) % 4) { const ox = h.cx, oy = h.cy; h.cx = h.tx; h.cy = h.ty; h.tx = ox; h.ty = oy; h.t = 1 - h.t; h.dir = h.want; h.want = null; this.faceFor(h.dir); }
      h.t += this.A.hero * dt; h.runT += dt * this.A.hero;
      if (h.t >= 1) { h.t = 0; h.cx = h.tx; h.cy = h.ty; h.moving = false; this.arrive(); this.chooseHero(); }
    } else this.chooseHero();
    // ท่าทาง
    if (this.state !== 'play') return;
    if (h.moving) KG.art.frame(this.heroImg, KG.art.walkFrame((h.runT * 0.9) % 1)); else KG.art.frame(this.heroImg, 'idle');
  }
  faceFor(d) { if (d === 1) this.hero.flip = false; else if (d === 3) this.hero.flip = true; }
  chooseHero() {
    const h = this.hero, m = this.map; let d = -1;
    if (h.want != null && GR.openCell(m, h.cx + GR.DX[h.want], h.cy + GR.DY[h.want])) { d = h.want; }
    else if (h.dir >= 0 && GR.openCell(m, h.cx + GR.DX[h.dir], h.cy + GR.DY[h.dir])) d = h.dir;
    if (d >= 0) { h.dir = d; h.tx = h.cx + GR.DX[d]; h.ty = h.cy + GR.DY[d]; h.t = 0; h.moving = true; this.faceFor(d); if (h.want === d) h.want = null; }
    else { h.moving = false; h.dir = -1; }
  }
  arrive() {
    const h = this.hero, m = this.map;
    if (this.A.hero && Math.floor(h.runT * 0.9) % 3 === 0) KG.audio.play('step');
    const gi = m.gems.findIndex((g, i) => !this.gemObjs[i].got && g.x === h.cx && g.y === h.cy);
    if (gi >= 0) this.takeGem(gi);
    const pi = m.powers.findIndex((p, i) => !this.powerObjs[i].got && p.x === h.cx && p.y === h.cy);
    if (pi >= 0) this.takePower(pi);
    if (h.cx === m.goal.x && h.cy === m.goal.y) {
      if (this.gateOpen) this.win(); else if (!this._warned || this.t - this._warned > 3) { this._warned = this.t; this.banner('เก็บแกนให้ครบก่อน', '#ffd34f'); KG.audio.play('error'); }
    }
  }
  takeGem(i) {
    const g = this.gemObjs[i]; g.got = true; this.gemsGot++; this.addScore(10);
    KG.audio.play('coin', { i: this.gemsGot % 8 }); KG.fx.burst(this, g.x, g.y, { colors: [0x4ef4d2, 0xffffff], n: 10, max: 190, depth: 60 });
    this.tweens.add({ targets: g, y: g.y - 40, alpha: 0, duration: 260, onComplete: () => g.destroy() });
    this.updateGems(); if (this.gemsGot >= this.map.gems.length) this.openGate();
  }
  takePower(i) {
    const p = this.powerObjs[i]; p.got = true; this.burstT = this.A.burst; this.combo = 0;
    KG.audio.play('charge'); KG.fx.burst(this, p.x, p.y, { colors: [0xffd34f, 0xffffff], n: 24, max: 300, depth: 60 }); KG.fx.ring(this, p.x, p.y, 0xffd34f, { size: 3, w: 0.6 });
    this.tweens.add({ targets: p, alpha: 0, scaleX: 2, scaleY: 2, duration: 280, onComplete: () => p.destroy() });
    this.aura.setAlpha(0.7); this.burstChip.setText('พลังพิเศษ!'); this.mons.forEach(o => { if (o.alive) o.img.setTint(0x7ec8ff); });
    this.banner('พลังพิเศษ! ชนมอนสเตอร์ได้เลย', '#ffd34f'); KG.fx.flash(this, 0xffd34f, 120);
  }
  endBurst() { this.aura.setAlpha(0); this.burstChip.setText(''); this.mons.forEach(o => o.img.clearTint()); }

  stepMonster(o, dt) {
    if (!o.alive) { o.wake -= dt; if (o.wake <= 0) this.respawn(o); return; }
    const m = this.map, sp = this.A.speed * (this.burstT > 0 ? 0.7 : 1);
    if (o.moving) { o.t += sp * dt; if (o.t >= 1) { o.t = 0; o.cx = o.tx; o.cy = o.ty; o.moving = false; } }
    if (!o.moving) {
      const ex = GR.exits(m, o.cx, o.cy), back = o.dir >= 0 ? (o.dir + 2) % 4 : -1, opts = ex.filter(k => k !== back);
      let d = -1;
      if (this.burstT > 0 || o.ai === 'wander') {
        if (this.burstT > 0) { // หนีผู้เล่น
          let best = -1, bv = -1; (opts.length ? opts : ex).forEach(k => { const v = Math.abs(o.cx + GR.DX[k] - this.hero.cx) + Math.abs(o.cy + GR.DY[k] - this.hero.cy); if (v > bv) { bv = v; best = k; } }); d = best;
        } else if (opts.length) d = (opts.includes(o.dir) && Math.random() < 0.65) ? o.dir : KG.pick(opts);
        else d = back;
      } else {
        d = GR.stepToward(m, o.cx, o.cy, this.hero.cx, this.hero.cy, o.dir >= 0 ? o.dir : null);
        if (opts.length > 1 && Math.random() < 0.12) d = KG.pick(opts);
      }
      if (d >= 0) { o.dir = d; o.tx = o.cx + GR.DX[d]; o.ty = o.cy + GR.DY[d]; o.t = 0; o.moving = true; o.img.setFlipX(d === 1); }
    }
    KG.art.frame(o.img, KG.art.monsterWalk(this.t + o.phase));
    if (this.burstT > 0 && this.burstT < 1.6) o.img.setAlpha(Math.floor(this.t * 12) % 2 ? 0.55 : 1); else o.img.setAlpha(1);
  }
  respawn(o) { o.alive = true; o.cx = o.tx = o.sx; o.cy = o.ty = o.sy; o.t = 0; o.moving = false; o.dir = -1; o.img.setVisible(true).setAlpha(1); o.sh.setVisible(true); if (this.burstT > 0) o.img.setTint(0x7ec8ff); }

  collide() {
    if (this.state !== 'play') return;
    this.mons.forEach(o => {
      if (!o.alive) return;
      if (Math.hypot(this.hx - o.x, this.hy - o.y) < 0.55) {
        if (this.burstT > 0) {
          o.alive = false; o.wake = 4; o.img.setVisible(false).setAlpha(1); o.sh.setVisible(false); this.kills++; this.combo++;
          const px = this.px(o.x), py = this.feetY(o.y) - 30; KG.audio.play('kill'); KG.fx.burst(this, px, py, { colors: [0xffffff, 0xff3d8b, 0xffd34f], n: 28, max: 360, depth: 70 }); KG.fx.ring(this, px, py, 0xff3d8b, { size: 2.2, w: 0.5 });
          this.addScore(100 * Math.min(4, this.combo), px, py - 30); KG.fx.shake(this, 120, 0.004);
          KG.art.frame(this.heroImg, 'a2');
        } else if (this.invuln <= 0) this.hurt(o);
      }
    });
  }
  hurt(o) {
    this.lives--; this.setHearts(); this.invuln = 2; this.combo = 0; KG.audio.play('hurt'); KG.fx.flash(this, 0xff4d5e, 200); KG.fx.shake(this, 300, 0.009);
    KG.fx.burst(this, this.px(this.hx), this.feetY(this.hy) - 40, { colors: [0xff4d5e, 0xffffff], n: 20, max: 320, depth: 90 });
    KG.art.frame(o.img, 6);
    if (this.lives <= 0) { this.end(false); return; }
    const m = this.map, h = this.hero; h.cx = h.tx = m.start.x; h.cy = h.ty = m.start.y; h.t = 0; h.moving = false; h.dir = -1; h.want = null;
    this.mons.forEach(q => { q.cx = q.tx = q.sx; q.cy = q.ty = q.sy; q.t = 0; q.moving = false; q.dir = -1; });
    this.banner('โดนจับ! เริ่มใหม่ที่จุดเริ่ม', '#ff7a8a');
  }

  /* ---------- จบเกม ---------- */
  win() { if (this.state !== 'play') return; this.state = 'winning'; this.end(true); }
  async end(win) {
    this.state = 'done'; this.endBurst();
    const m = this.map, stars = win ? Math.max(1, this.lives) : 0, best = SAVE.data.best[this.wid] || 0;
    const bonus = win ? this.lives * 100 + Math.max(0, Math.round(90 - this.t)) * 5 : 0; this.score += bonus; this.scoreTxt.setText(String(this.score));
    if (win && stars > arcadeStars(this.wid)) SAVE.data.arcade[this.wid] = stars;
    const newBest = this.score > best; if (newBest) SAVE.data.best[this.wid] = this.score; SAVE.save();
    if (win) {
      KG.audio.play('portal'); KG.art.frame(this.heroImg, 'up');
      const px = this.px(m.goal.x), py = AC.OY + m.goal.y * AC.C + AC.C * 0.3;
      this.tweens.add({ targets: this.heroImg, scaleX: this.heroImg.scaleX * 0.2, scaleY: this.heroImg.scaleY * 0.2, angle: 540, alpha: 0, y: this.heroImg.y - 30, duration: 700, ease: 'Cubic.easeIn' });
      KG.fx.ring(this, px, py, this.T.glow, { size: 4, w: 0.8 }); KG.fx.glow(this, px, py, 0xffffff, 500, 700);
      await wait(this, 800); KG.fx.confetti(this, { ms: 1200 });
    } else { KG.art.frame(this.heroImg, 'hurt'); await wait(this, 500); }
    KG.audio.play(win ? 'win' : 'lose');
    const nextW = win && this.wid < 4;
    KG.ui.modal(this, {
      title: win ? 'ผ่านสนามไล่ล่า!' : 'พลังหมด', w: 800, accent: win ? KG.C.sun : KG.C.red, extraH: 160,
      body: withPlayer('คะแนน ' + this.score + (newBest ? '  (สถิติใหม่!)' : '') + '  ·  แกน ' + this.gemsGot + '/' + m.gems.length + '  ·  ฟันมอนสเตอร์ ' + this.kills + ' ตัว  ·  เวลา ' + Math.round(this.t) + ' วินาที'),
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { world: this.wid }) }, { label: win ? 'เล่นอีกครั้ง' : 'ลองใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Arcade', { world: this.wid }) }].concat(nextW ? [{ label: 'SECTOR ถัดไป', style: 'primary', icon: 'chevR', onClick: () => this.go('Select', { world: this.wid + 1 }) }] : []),
      build: (box, g) => {
        const st = KG.ui.stars(this, 0, g.top + 48, 0, 3, 60); box.add(st); this.time.delayedCall(350, () => st.setStars(stars, true));
        box.add(KG.txt(this, 0, g.top + 100, win ? 'คุณตัดสินใจเลือกทิศทางทุกแยกเอง เหมือนเขียนคำสั่งขึ้น ลง ซ้าย ขวา แบบเรียลไทม์ และใช้พลังพิเศษได้ถูกจังหวะ' : 'ลองสังเกตว่ามอนสเตอร์เดินอย่างไร แล้ววางแผนเส้นทางเก็บแกนให้ปลอดภัยขึ้น', { size: 21, weight: 400, color: '#4ef4d2', center: true, ox: 0.5, width: 720 }));
      }
    });
  }
}
