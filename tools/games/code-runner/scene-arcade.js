/* ===== สนามวิ่ง: เกมแอ็กชันเรียลไทม์ใช้ความรู้จากภารกิจ =====
   Techno วิ่งเองอัตโนมัติ ผู้เล่นกด "กระโดด" และ "โจมตี" ให้ทันสถานการณ์ ท้ายด่านมีบอส (ฟันลูกพลังงานให้สะท้อนกลับไปโดนบอส)
   ดาว = หัวใจที่เหลือเมื่อชนะ (ไม่โดนเลย = 3 ดาว) */
const ARC = {
  GY: 560, HERO_X: 300, TWc: 92,
  speed: [0, 330, 370, 410, 450],          // ความเร็วพื้น ต่อ SECTOR
  length: [0, 52, 62, 72, 82],              // จำนวนช่องก่อนถึงบอส
  weights: {                                  // ชนิดอุปสรรคที่ออกได้ต่อ SECTOR (น้ำหนักความถี่)
    1: { pit: 5, spike: 4 },
    2: { pit: 3, spike: 2, foe: 4, crate: 3 },
    3: { pit: 3, spike: 2, foe: 3, crate: 2, barrier: 3 },
    4: { pit: 3, spike: 2, foe: 3, crate: 2, barrier: 3, pair: 3 }
  }
};

class ArcadeScene extends KG.Scene {
  constructor() { super('Arcade'); }
  init(data) { this.wid = data && data.world ? data.world : 1; this._restartData = { world: this.wid }; }

  create() {
    this.setup(); KG.audio.music('action'); this._modal = null; this.bossBar = null; this.bossLbl = null; this.bossShadow = null;
    const W = this.W = WORLDS[this.wid - 1], T = this.T = THEMES[this.wid], C = KG.C;
    this.tex = makeLaneTextures(this, this.wid);
    this.state = 'intro'; this.t = 0; this.scroll = 0; this.v = 0; this.lives = 3; this.score = 0; this.combo = 0; this.bestCombo = 0; this.coins = 0; this.kills = 0;
    this.hy = 0; this.vy = 0; this.onGround = true; this.coyote = 0; this.jumpBuf = 0; this.atkT = 0; this.atkCd = 0; this.invuln = 0; this.hurtT = 0; this.falling = false;
    this.stats = { pit: [0, 0], spike: [0, 0], foe: [0, 0], crate: [0, 0], barrier: [0, 0] };
    this.objs = []; this.boss = null; this.projs = []; this.keys = {};

    this.buildBackground(); this.buildWorld(); this.buildHero(); this.buildHud(); this.buildControls();
    this.showIntro();
  }
  onEscape() { if (this.state === 'play') this.pause(); }

  /* ---------- ฉากหลังหลายชั้น ---------- */
  buildBackground() {
    const W = this.W, T = this.T;
    this.bg = this.add.image(GW / 2, GH * 0.42, 'arena_' + W.arena).setDisplaySize(GW * 1.25, GW * 1.25 * 0.5625);
    const sh = KG.tex(this, 'arcshade' + this.wid, GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.5)'], [0.55, 'rgba(5,8,28,.15)'], [1, 'rgba(5,8,28,.7)']]); ctx.fillRect(0, 0, GW, GH); });
    this.add.image(GW / 2, GH / 2, sh).setDisplaySize(GW, GH);
    const mid = KG.tex(this, 'arcmid' + this.wid, 1280, 260, ctx => {
      ctx.fillStyle = 'rgba(8,10,36,.92)'; ctx.beginPath(); ctx.moveTo(0, 260);
      let x = 0; const rnd = (i) => (Math.sin(i * 91.7) * 43758.5453) % 1;
      for (let i = 0; i < 16; i++) { const w = 80, h = 80 + Math.abs(rnd(i)) * 130; ctx.lineTo(x, 260 - h); ctx.lineTo(x + w * 0.85, 260 - h); ctx.lineTo(x + w * 0.85, 260 - h + 14); ctx.lineTo(x + w, 260 - h + 14); x += w; }
      ctx.lineTo(1280, 260); ctx.closePath(); ctx.fill();
      ctx.fillStyle = T.accent; ctx.globalAlpha = 0.5; for (let i = 0; i < 40; i++) { ctx.fillRect((i * 97) % 1280, 120 + ((i * 53) % 130), 4, 4); } ctx.globalAlpha = 1;
    });
    this.midLayer = this.add.tileSprite(GW / 2, ARC.GY - 90, GW, 260, mid).setTileScale(1, 1);
    this.midLayer.setAlpha(0.8);
    this.speedEm = this.add.particles(0, 0, 'fx_streak', { x: GW + 20, y: { min: 120, max: ARC.GY - 20 }, speedX: { min: -900, max: -1400 }, scaleY: { min: 0.4, max: 1.2 }, scaleX: 1, rotate: 90, alpha: { start: 0.18, end: 0 }, lifespan: 900, frequency: 70, tint: [T.glow, 0xffffff], blendMode: 'ADD' });
    this.speedEm.setDepth(2);
  }

  /* ---------- ทางวิ่งและอุปสรรค ---------- */
  buildWorld() {
    const T = this.T, TWc = ARC.TWc, GY = ARC.GY, wid = this.wid, N = ARC.length[wid];
    this.world = this.add.container(0, 0).setDepth(10);
    // แผนที่ช่อง: 'g' พื้น 'p' หลุม ฯลฯ
    const cols = []; for (let i = 0; i < N + 28; i++) cols.push({ t: 'g' });
    const wts = ARC.weights[wid], keys = Object.keys(wts), tot = keys.reduce((a, k) => a + wts[k], 0);
    const pick = () => { let r = Math.random() * tot; for (const k of keys) { r -= wts[k]; if (r <= 0) return k; } return keys[0]; };
    let c = 12; let last = '';
    while (c < N - 4) {
      let k = pick(); if (k === last && Math.random() < 0.55) k = pick(); last = k;
      if (k === 'pair') { cols[c] = { t: 'p' }; cols[c + 3] = { t: 'foe' }; c += 3 + Phaser.Math.Between(5, 7); continue; }
      cols[c] = { t: k === 'foe' ? 'foe' : k === 'crate' ? 'crate' : k === 'barrier' ? 'barrier' : k === 'spike' ? 's' : 'p' };
      if (k === 'pit' && wid >= 3 && Math.random() < 0.35) { cols[c + 1] = { t: 'p' }; c += 1; }
      c += Phaser.Math.Between(5, 7) - (wid >= 3 ? 1 : 0);
    }
    this.cols = cols; this.pitRects = []; this.spikeRects = []; this.coinObjs = [];
    this.bossStartX = (N + 4) * TWc;
    // พื้น
    for (let i = -3; i < cols.length + 12; i++) {
      const x = i * TWc, cc = cols[i];
      const isPit = cc && cc.t === 'p';
      const img = this.add.image(x, GY, isPit ? this.tex.pit : (i % 2 ? this.tex.groundB : this.tex.groundA)).setOrigin(0, 0).setDisplaySize(TWc + 0.8, 170); this.world.add(img);
      if (isPit) {
        this.pitRects.push({ x0: x, x1: x + TWc, hit: false });
        const em = this.add.particles(x + TWc / 2, GY + 110, 'fx_spark', { x: { min: -26, max: 26 }, speedY: { min: -90, max: -30 }, scale: { start: 0.3, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 900, frequency: 180, tint: [T.glow, 0xffffff], blendMode: 'ADD' }); this.world.add(em);
      }
      if (!cc) continue;
      const cx = x + TWc / 2;
      if (cc.t === 's') { const sp = this.add.image(cx, GY + 2, this.tex.spike).setOrigin(0.5, 1).setDisplaySize(TWc - 4, 44); this.world.add(sp); this.spikeRects.push({ x0: x + 10, x1: x + TWc - 10, hit: false }); }
      if (cc.t === 'crate') { const o = this.makeObj('crate', cx, 74, 74, this.add.image(cx, GY + 1, this.tex.crate).setOrigin(0.5, 1).setDisplaySize(74, 74)); }
      if (cc.t === 'barrier') { const o = this.makeObj('barrier', cx, 72, 176, this.add.image(cx, GY + 2, this.tex.wall).setOrigin(0.5, 1).setDisplaySize(72, 176)); }
      if (cc.t === 'foe') {
        const img = KG.art.make(this, 0, 3, FOES[(i + wid) % FOES.length], 1, 112);
        const g = this.add.container(cx, GY); g.add([this.add.ellipse(0, 4, 90, 14, 0x000000, 0.4), img]); g.img = img; this.world.add(g);
        this.makeObj('foe', cx, 64, 120, g, true);
      }
    }
    // เหรียญ: ลอยเป็นโค้งเหนือหลุม/หนาม และเรียงบนพื้น
    cols.forEach((cc, i) => {
      const x = i * TWc + TWc / 2;
      if (cc.t === 'p' || cc.t === 's') [-1, 0, 1].forEach(d => this.addCoin(x + d * 56, GY - 120 - (d === 0 ? 40 : 0)));
      else if (cc.t === 'g' && i > 10 && i < N && i % 11 === 4) [0, 1, 2].forEach(d => this.addCoin(x + d * 56, GY - 54));
    });
    // ประตูท้ายด่าน (เส้นเริ่มบอส)
    const gx = this.bossStartX - 60; const gate = this.add.image(gx, GY + 2, this.tex.portal).setOrigin(0.5, 1).setDisplaySize(130, 182).setAlpha(0.85); this.world.add(gate);
  }
  makeObj(kind, cx, w, h, go, walks) {
    const o = { kind, x: cx, w, h, go, alive: true, walks: !!walks, hp: 1 }; if (!walks) this.world.add(go); this.objs.push(o); return o;
  }
  addCoin(x, y) {
    const g = this.add.container(x, y); const glow = this.add.image(0, 0, 'fx_glow').setTint(0x4ef4d2).setBlendMode('ADD').setDisplaySize(70, 70).setAlpha(0.5);
    const img = this.add.image(0, 0, this.tex.coin).setDisplaySize(34, 41); g.add([glow, img]); this.world.add(g);
    this.tweens.add({ targets: img, scaleX: img.scaleX * 0.3, duration: 520, yoyo: true, repeat: -1, delay: Math.random() * 400 });
    this.coinObjs.push({ x, y, g, got: false });
  }

  /* ---------- ฮีโร่ ---------- */
  buildHero() {
    this.shadow = this.add.ellipse(ARC.HERO_X, ARC.GY + 4, 96, 16, 0x000000, 0.45).setDepth(19);
    this.hero = KG.art.make(this, ARC.HERO_X, ARC.GY + 2, HID, 'w1', 152).setDepth(20);
    this.runFrame = 0; this.runT = 0;
  }
  setPose(name) { KG.art.frame(this.hero, name); }

  /* ---------- HUD ---------- */
  buildHud() {
    this.hud = this.add.container(0, 0).setDepth(100);
    this.hearts = []; for (let i = 0; i < 3; i++) { const h = KG.ui.icon(this, 'heart', 52 + i * 52, 46, 40, 0xff4d5e); this.hud.add(h); this.hearts.push(h); }
    this.scoreTxt = this.txt(GW - 250, 24, '0', { size: 38, color: '#ffffff', stroke: true, ox: 1, oy: 0 }); this.hud.add(this.scoreTxt);
    this.hud.add(this.txt(GW - 242, 38, 'คะแนน', { size: 17, color: '#9fb0d8', oy: 0 }));
    this.comboTxt = this.txt(GW - 250, 70, '', { size: 26, color: '#ffd34f', stroke: true, ox: 1 }); this.hud.add(this.comboTxt);
    this.hud.add(this.txt(52, 78, this.W.name, { size: 17, color: this.W.tint }));
    // แถบความคืบหน้า
    this.progBar = KG.ui.bar(this, 360, 30, 480, 18, { value: 0, color: this.W.color }); this.hud.add(this.progBar);
    this.progHero = KG.ui.icon(this, 'flag', 360, 39, 26, 0xffffff); this.hud.add(this.progHero);
    this.hud.add(KG.ui.icon(this, 'skull', 862, 39, 30, 0xff4d5e));
    this.pauseBtn = iconButton(this, GW - 56, 44, 'pause', () => this.pause(), { w: 60, h: 52, depth: 101 }); iconButton(this, GW - 126, 44, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 101 });
    this.bossBar = null;
  }
  setHearts() { this.hearts.forEach((h, i) => { h.setTint(i < this.lives ? 0xff4d5e : 0x3a2a44); }); }
  addScore(n, x, y, label) {
    this.score += n; this.scoreTxt.setText(String(this.score));
    if (x != null) KG.fx.pop(this, x, y, (label || '') + '+' + n, { size: 26, color: '#ffd34f' });
  }

  /* ---------- ปุ่มควบคุม ---------- */
  buildControls() {
    const mk = (x, y, icon, label, color, down) => {
      const c = this.add.container(x, y).setDepth(102);
      const hex = this.add.image(0, 0, hexTex(this, 78, css(color), css(Phaser.Display.Color.ValueToColor(color).darken(40).color), 'open')).setAlpha(0.88);
      const ic = KG.ui.icon(this, icon, 0, -10, 62, 0x10122b); const tx = KG.txt(this, 0, 46, label, { size: 22, color: '#ffffff', center: true, ox: 0.5, stroke: true });
      c.add([hex, ic, tx]); c.setSize(180, 180); c.setInteractive(new Phaser.Geom.Circle(0, 0, 100), Phaser.Geom.Circle.Contains);
      c.on('pointerdown', () => { c.setScale(0.92); down(); }); c.on('pointerup', () => c.setScale(1)); c.on('pointerout', () => c.setScale(1)); return c;
    };
    this.btnAtk = mk(150, 612, 'sword', 'โจมตี', KG.C.pink, () => this.doAttack());
    this.btnJump = mk(GW - 150, 612, 'jump', 'กระโดด', KG.C.green, () => this.doJump());
    this.input.keyboard.on('keydown', e => {
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'arrowup' || k === 'w') { e.preventDefault && e.preventDefault(); this.doJump(); }
      else if (k === 'z' || k === 'x' || k === 'j' || k === 'arrowright' || k === 'd') this.doAttack();
      else if (k === 'p') this.pause();
    });
    this.keyHint = this.txt(GW / 2, 690, KG.isTouch ? '' : 'Space / ↑ กระโดด     Z / → โจมตี     P หยุดเกม', { size: 20, color: '#9fb0d8', center: true, ox: 0.5, stroke: true }).setDepth(100);
  }

  /* ---------- เริ่มเกม ---------- */
  showIntro() {
    const W = this.W;
    KG.ui.modal(this, {
      title: 'สนามวิ่ง ' + W.name, w: 800, accent: W.color, extraH: 150,
      body: 'หลักการของ SECTOR นี้: ' + W.rule,
      buttons: [{ label: 'กลับ', style: 'ghost', icon: 'chevL', onClick: () => this.go('Select', { world: this.wid }) }, { label: 'เริ่มวิ่ง!', style: 'primary', icon: 'play', pulse: false, onClick: () => this.countdown() }],
      build: (box, g) => {
        const y = g.top + 6;
        box.add(KG.txt(this, 0, y, W.arcadeRule, { size: 24, color: '#ffd34f', center: true, ox: 0.5, width: 700, weight: 600 }));
        const row = y + 78;
        [['jump', 'กระโดด', 'ข้ามหลุมและหนาม', -250], ['sword', 'โจมตี', 'ฟันศัตรู ลัง และลูกพลังงาน', 20]].forEach(a => {
          box.add(KG.ui.icon(this, a[0], a[3] - 60, row + 14, 44, a[0] === 'jump' ? 0x5ef08a : 0xff6aa8));
          box.add(KG.txt(this, a[3] - 28, row - 6, a[1], { size: 24, color: '#ffffff', oy: 0 })); box.add(KG.txt(this, a[3] - 28, row + 24, a[2], { size: 18, weight: 400, color: '#cdd7f2', oy: 0 }));
        });
      }
    });
  }
  async countdown() {
    this.state = 'count';
    for (const n of ['3', '2', '1', 'ลุย!']) {
      KG.audio.play(n === 'ลุย!' ? 'go' : 'count');
      const t = KG.txt(this, GW / 2, GH / 2 - 40, n, { size: n === 'ลุย!' ? 150 : 190, color: n === 'ลุย!' ? '#ffd34f' : '#ffffff', center: true, middle: true, stroke: true, sw: 12 }).setDepth(200).setScale(2.4).setAlpha(0);
      this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
      this.tweens.add({ targets: t, alpha: 0, scaleX: 0.7, scaleY: 0.7, delay: 560, duration: 240, onComplete: () => t.destroy() });
      KG.fx.ring(this, GW / 2, GH / 2 - 40, 0xffffff, { size: 5, w: 0.7 });
      await wait(this, 820);
    }
    this.state = 'play'; this.v = ARC.speed[this.wid];
  }
  pause() {
    if (this.state !== 'play') return; this.state = 'pause';
    KG.ui.modal(this, { title: 'พักเกม', w: 560, accent: KG.C.cyan, buttons: [
      { label: 'ออก', style: 'danger', icon: 'home', onClick: () => this.go('Select', { world: this.wid }) },
      { label: 'เริ่มใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Arcade', { world: this.wid }) },
      { label: 'เล่นต่อ', style: 'primary', icon: 'play', onClick: () => { this.state = 'play'; } }] });
  }

  /* ---------- การกระทำ ---------- */
  doJump() {
    if (this.state !== 'play') return;
    if (this.onGround || this.coyote > 0) {
      this.vy = -960; this.onGround = false; this.coyote = 0; this.falling = false; KG.audio.play('jump');
      KG.fx.burst(this, ARC.HERO_X, ARC.GY, { colors: [0xdfe6ff], n: 6, max: 140, a0: 200, a1: 340, depth: 18 });
    } else this.jumpBuf = 0.12;
  }
  doAttack() {
    if (this.state !== 'play' || this.atkCd > 0) return;
    this.atkT = 0.34; this.atkCd = 0.38; KG.audio.play('swing'); this.slashed = false;
    const feet = ARC.GY + this.hy; const sl = this.add.image(ARC.HERO_X + 96, feet - 86, this.tex.slash).setBlendMode('ADD').setDisplaySize(180, 180).setAlpha(0.95).setScale(0.3).setDepth(30);
    this.tweens.add({ targets: sl, scaleX: 1.1, scaleY: 1.1, alpha: 0, duration: 260, ease: 'Cubic.easeOut', onComplete: () => sl.destroy() });
  }
  hurt(kind) {
    if (this.invuln > 0 || this.state !== 'play') return;
    this.lives--; this.setHearts(); this.invuln = 1.5; this.hurtT = 0.4; this.combo = 0; this.comboTxt.setText('');
    KG.audio.play('hurt'); KG.fx.flash(this, 0xff4d5e, 160); KG.fx.shake(this, 280, 0.009);
    KG.fx.burst(this, ARC.HERO_X, ARC.GY + this.hy - 80, { colors: [0xff4d5e, 0xffffff], n: 20, max: 340, depth: 90 });
    this.vy = -520; this.onGround = false;
    if (this.stats[kind]) { /* เก็บสถิติว่าพลาดกับอุปสรรคชนิดใด */ }
    if (this.lives <= 0) this.end(false);
  }

  /* ---------- ลูปหลัก ---------- */
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000);
    if (this.state === 'play' || this.state === 'bossdone') this.step(dt);
    else this.idleAnim(dt);
  }
  idleAnim(dt) { this.runT += dt; this.setPose('idle'); this.hero.y = ARC.GY + 2 + Math.sin(this.runT * 3) * 2; }
  step(dt) {
    const GY = ARC.GY, hx = ARC.HERO_X;
    this.t += dt;
    const bossActive = !!this.boss && this.boss.active;
    if (!bossActive && this.state === 'play') { this.scroll += this.v * dt; }
    this.world.x = -this.scroll; this.midLayer.tilePositionX = this.scroll * 0.25; this.bg.x = GW / 2 - (this.scroll * 0.03) % 80;
    if (this.scroll >= this.bossStartX - hx - 200 && !this.boss && this.state === 'play') this.startBoss();
    const px = this.scroll + hx;
    this.atkT = Math.max(0, this.atkT - dt); this.atkCd = Math.max(0, this.atkCd - dt); this.invuln = Math.max(0, this.invuln - dt); this.hurtT = Math.max(0, this.hurtT - dt); this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    // ฟิสิกส์แนวตั้ง
    const overPit = this.pitRects.some(p => px > p.x0 + 24 && px < p.x1 - 24);
    this.vy += 2700 * dt; this.hy += this.vy * dt;
    if (this.falling) { if (this.hy > 340) this.fallDie(); }
    else if (this.hy >= 0) {
      if (overPit && this.state === 'play') { this.falling = true; this.onGround = false; }
      else {
        if (!this.onGround && this.vy > 220) { KG.audio.play('land'); KG.fx.burst(this, hx, GY, { colors: [0xdfe6ff], n: 8, max: 160, a0: 190, a1: 350, depth: 18 }); }
        this.hy = 0; this.vy = 0;
        if (!this.onGround) { this.onGround = true; if (this.jumpBuf > 0) { this.jumpBuf = 0; this.doJump(); } }
      }
    }
    // ท่าของฮีโร่
    const feet = GY + this.hy; this.hero.y = feet; this.shadow.setScale(Math.max(0.4, 1 + this.hy / 420), 1).setAlpha(this.falling ? 0 : 0.45);
    this.hero.setAlpha(this.invuln > 0 && Math.floor(this.t * 16) % 2 === 0 ? 0.35 : 1).setAngle(this.onGround ? 0 : Phaser.Math.Clamp(this.vy / 120, -8, 10));
    if (this.hurtT > 0) this.setPose('hurt');
    else if (this.atkT > 0) this.setPose(this.atkT > 0.26 ? 'a1' : this.atkT > 0.12 ? 'a2' : 'a3');
    else if (!this.onGround) this.setPose(this.vy < 0 ? 'up' : 'fall');
    else {
      this.runT += dt * (this.v / 330); const f = Math.floor(this.runT * 11.5) % 6; this.setPose('w' + (1 + f));
      this.hero.y = feet + 2 - Math.abs(Math.sin(this.runT * 11.5 * Math.PI / 3)) * 3; const st = f % 3 === 0; if (st && !this._st) { this._st = true; KG.audio.play('step'); } if (!st) this._st = false;
    }
    this.stepObjects(dt, px, feet);
    if (this.boss) this.stepBoss(dt, px, feet);
    const total = this.bossStartX - hx, pr = Math.min(1, this.scroll / total); this.progBar.setValue(pr, 0); this.progHero.x = 360 + 480 * pr;
    // นับสถิติหลุม/หนามที่ผ่านพ้นไป
    this.pitRects.forEach(p => { if (!p.hit && px > p.x1 + 10) { p.hit = true; this.stats.pit[1]++; if (!p.fail) this.stats.pit[0]++; } });
    this.spikeRects.forEach(sp => { if (!sp.hit && px > sp.x1 + 10) { sp.hit = true; this.stats.spike[1]++; this.stats.spike[0]++; } });
  }
  fallDie() {
    if (this.state !== 'play') return;
    const px = this.scroll + ARC.HERO_X, p = this.pitRects.find(q => px > q.x0 && px < q.x1 + 1);
    if (p) { p.fail = true; p.hit = true; this.stats.pit[1]++; }
    this.lives--; this.setHearts(); KG.audio.play('fall'); KG.fx.flash(this, 0xff4d5e, 200); KG.fx.shake(this, 300, 0.008); this.combo = 0; this.comboTxt.setText('');
    if (this.lives <= 0) { this.end(false); return; }
    if (p) this.scroll = p.x1 + 60 - ARC.HERO_X;
    this.hy = -240; this.vy = 0; this.falling = false; this.onGround = false; this.invuln = 1.6;
  }
  stepObjects(dt, px, feet) {
    const GY = ARC.GY;
    const hitbox = this.atkT > 0.06 && this.atkT < 0.3 ? { x0: px + 6, x1: px + 150, y0: feet - 160, y1: feet + 10 } : null;
    const heroR = { x0: px - 24, x1: px + 24, y0: feet - 124, y1: feet };
    this.objs.forEach(o => {
      if (!o.alive) return;
      if (o.walks) { o.x -= 62 * dt; o.go.x = o.x; if (o.go.img && !o.struck) KG.art.frame(o.go.img, KG.art.monsterWalk(this.t + o.x * 0.013)); }
      if (o.x < px - 400) { o.alive = false; this.stats[o.kind][1]++; this.stats[o.kind][0]++; return; }
      const r = { x0: o.x - o.w / 2, x1: o.x + o.w / 2, y0: GY - o.h, y1: GY };
      if (hitbox && r.x1 > hitbox.x0 && r.x0 < hitbox.x1 && r.y1 > hitbox.y0 && r.y0 < hitbox.y1) {
        o.alive = false; const sx = o.x - this.scroll, sy = GY - o.h / 2; this.stats[o.kind][0]++; this.stats[o.kind][1]++; this.combo++;
        if (o.kind === 'foe') { this.kills++; this.addScore(50 * Math.max(1, this.combo), sx, sy - 40); KG.audio.play('kill'); KG.fx.burst(this, sx, sy, { colors: [0xffffff, 0xff3d8b, 0xffd34f], n: 26, max: 360, depth: 60 }); o.struck = true; if (o.go.img) KG.art.frame(o.go.img, 7); this.tweens.add({ targets: o.go, x: o.go.x + 60, alpha: 0, duration: 300, onComplete: () => o.go.destroy() }); }
        else { this.addScore(o.kind === 'barrier' ? 40 : 25, sx, sy - 30); KG.audio.play('crate'); KG.fx.burst(this, sx, sy, { colors: [0x4a5aa8, 0xffd34f, 0xffffff], tex: 'fx_shard', n: 18, max: 380, g: 800, rot: true, add: false, depth: 60 }); o.go.destroy(); }
        this.bestCombo = Math.max(this.bestCombo, this.combo); this.comboTxt.setText(this.combo >= 2 ? 'คอมโบ ×' + this.combo : ''); KG.fx.shake(this, 120, 0.004); return;
      }
      if (r.x1 > heroR.x0 && r.x0 < heroR.x1 && r.y1 > heroR.y0 + 8 && r.y0 < heroR.y1 - 4 && this.invuln <= 0) {
        o.alive = false; this.stats[o.kind][1]++; this.hurt(o.kind); KG.fx.burst(this, o.x - this.scroll, GY - 40, { colors: [0xffffff], n: 10, max: 200, depth: 60 }); if (o.go) { o.struck = true; if (o.go.img) KG.art.frame(o.go.img, 6); o.go.setAlpha(0.3); }
      }
    });
    this.spikeRects.forEach(sp => {
      if (px > sp.x0 && px < sp.x1 && feet > GY - 26 && this.invuln <= 0 && !sp.hit) { sp.hit = true; this.stats.spike[1]++; this.hurt('spike'); }
    });
    this.coinObjs.forEach(c => {
      if (c.got) return;
      if (Math.abs(c.x - px) < 46 && Math.abs(c.y - (feet - 64)) < 80) {
        c.got = true; this.coins++; this.addScore(10); KG.audio.play('coin', { i: this.coins % 8 }); KG.fx.burst(this, c.x - this.scroll, c.y, { colors: [0x4ef4d2, 0xffffff], n: 8, max: 180, depth: 60 });
        this.tweens.add({ targets: c.g, y: c.y - 50, alpha: 0, duration: 260, onComplete: () => c.g.destroy() });
      }
    });
  }

  /* ---------- บอส ---------- */
  startBoss() {
    const W = this.W; this.boss = { active: true, hp: 6 + this.wid, maxHp: 6 + this.wid, t: 1.6, phase: 0, state: 'idle', telegraph: 0 };
    KG.audio.play('alarm'); KG.fx.flash(this, 0xff3d8b, 240); KG.fx.shake(this, 400, 0.01);
    const bx = GW - 250; const img = KG.art.make(this, bx + 300, ARC.GY + 4, 'm4', 0, 300).setDepth(15);
    this.boss.img = img; this.boss.x = bx; this.boss.baseScale = img.scaleX;
    this.tweens.add({ targets: img, x: bx, duration: 800, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: img, scaleY: img.scaleY * 1.025, duration: 700, yoyo: true, repeat: -1 });
    this.bossShadow = this.add.ellipse(bx, ARC.GY + 4, 220, 22, 0x000000, 0.45).setDepth(14);
    this.bossBar = KG.ui.bar(this, GW / 2 - 260, 78, 520, 22, { value: 1, color: 0xff3d8b, edge: 0xff3d8b }); this.bossBar.setDepth(101);
    this.bossLbl = this.txt(GW / 2, 104, 'บอสผู้คุมประตู · ฟันลูกพลังงานให้สะท้อนกลับ!', { size: 22, color: '#ffb3d6', center: true, ox: 0.5, stroke: true }).setDepth(101);
    this.speedEm.stop();
    const t = KG.txt(this, GW / 2, 260, 'บอสมาแล้ว!', { size: 84, color: '#ff7ab2', center: true, middle: true, stroke: true, sw: 10 }).setDepth(200).setScale(2).setAlpha(0);
    this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' }); this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 400, onComplete: () => t.destroy() });
  }
  stepBoss(dt, px, feet) {
    const B = this.boss, GY = ARC.GY;
    if (!B.active && this.state !== 'bossdone') return;
    B.t -= dt;
    if (this.state === 'play' && B.active) {
      if (B.state === 'idle' && B.t <= 0) { B.state = 'tele'; B.t = 0.75; KG.art.frame(B.img, 5); B.kind = ['ground', 'mid', 'mid', 'ground', 'triple'][B.phase++ % 5]; KG.audio.play('charge'); B.glow = this.add.image(B.x - 70, GY - (B.kind === 'ground' ? 40 : 120), 'fx_glow').setTint(0xff3d8b).setBlendMode('ADD').setDisplaySize(10, 10).setDepth(16); this.tweens.add({ targets: B.glow, displayWidth: 190, displayHeight: 190, duration: 700 }); this.bossSay(B.kind === 'ground' ? 'ลูกไฟพื้น กระโดดหรือฟัน!' : 'ลูกพลังงาน ฟันสะท้อนกลับ!'); }
      else if (B.state === 'tele' && B.t <= 0) { B.state = 'idle'; B.t = Math.max(1.1, 2.0 - this.wid * 0.15); if (B.glow) { B.glow.destroy(); B.glow = null; } this.fire(B.kind); KG.art.frame(B.img, 6); this.time.delayedCall(420, () => { if (B.img && B.img.scene && B.state === 'idle') KG.art.frame(B.img, 0); }); }
    }
    // ลูกพลังงาน
    this.projs.forEach(p => {
      if (!p.alive) return; p.x += p.vx * dt; p.img.x = p.x; p.glow.x = p.x; p.spin += dt * 8; p.img.setAngle(p.spin * 40);
      const heroR = { x0: ARC.HERO_X - 24, x1: ARC.HERO_X + 24, y0: feet - 124, y1: feet };
      const hb = this.atkT > 0.06 && this.atkT < 0.3 ? { x0: ARC.HERO_X + 6, x1: ARC.HERO_X + 156, y0: feet - 170, y1: feet + 10 } : null;
      if (!p.reflected) {
        if (hb && p.x > hb.x0 - 20 && p.x < hb.x1 && p.y > hb.y0 && p.y < hb.y1) { p.reflected = true; p.vx = 760; KG.audio.play('zap'); this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.comboTxt.setText(this.combo >= 2 ? 'คอมโบ ×' + this.combo : ''); this.addScore(30, p.x, p.y - 30); KG.fx.ring(this, p.x, p.y, 0xffffff, { size: 2, w: 0.4 }); KG.fx.burst(this, p.x, p.y, { colors: [0xffffff, 0xff3d8b], n: 14, max: 300, depth: 60 }); p.glow.setTint(0x4ef4d2); p.img.setTint(0x4ef4d2); }
        else if (p.x < ARC.HERO_X + 28 && p.x > ARC.HERO_X - 28 && p.y > heroR.y0 && p.y < heroR.y1) { p.alive = false; p.img.destroy(); p.glow.destroy(); this.hurt('boss'); }
        else if (p.x < -60) { p.alive = false; p.img.destroy(); p.glow.destroy(); }
      } else if (p.x > B.x - 70) { p.alive = false; p.img.destroy(); p.glow.destroy(); this.hitBoss(); }
    });
    this.projs = this.projs.filter(p => p.alive);
  }
  bossSay(s) { if (this.bossLbl) this.bossLbl.setText(s); }
  fire(kind) {
    const B = this.boss, GY = ARC.GY, mk = (y, vx) => {
      const glow = this.add.image(B.x - 80, y, 'fx_glow').setTint(0xff3d8b).setBlendMode('ADD').setDisplaySize(110, 110).setDepth(16);
      const img = this.add.image(B.x - 80, y, 'fx_spark').setTint(0xffffff).setDisplaySize(54, 54).setDepth(17);
      this.projs.push({ x: B.x - 80, y, vx, glow, img, alive: true, reflected: false, spin: 0 });
    };
    KG.audio.play('zap'); KG.fx.shake(this, 120, 0.004);
    const spd = 440 + this.wid * 30;
    if (kind === 'ground') mk(GY - 30, -spd); else if (kind === 'mid') mk(GY - 108, -spd * 0.9);
    else { mk(GY - 30, -spd); this.time.delayedCall(420, () => { if (this.boss && this.boss.active) mk(GY - 108, -spd * 0.9); }); this.time.delayedCall(840, () => { if (this.boss && this.boss.active) mk(GY - 30, -spd); }); }
  }
  hitBoss() {
    const B = this.boss; B.hp--; this.bossBar.setValue(B.hp / B.maxHp, 250);
    KG.audio.play('kill'); KG.fx.flash(this, 0xffffff, 100); KG.fx.shake(this, 260, 0.008);
    B.img.setTintFill(0xffffff); KG.art.frame(B.img, 7); this.time.delayedCall(90, () => B.img && B.img.clearTint()); this.time.delayedCall(320, () => { if (B.img && B.img.scene && B.state !== 'tele') KG.art.frame(B.img, 0); });
    KG.fx.burst(this, B.x, ARC.GY - 160, { colors: [0xffffff, 0xff3d8b, 0xffd34f], n: 30, max: 420, depth: 60 }); KG.fx.ring(this, B.x, ARC.GY - 160, 0xff3d8b, { size: 3, w: 0.5 });
    this.addScore(120, B.x, ARC.GY - 250, 'บอส ');
    this.tweens.add({ targets: B.img, x: B.x + 24, duration: 80, yoyo: true });
    if (B.hp <= 0) this.bossDown();
  }
  bossDown() {
    const B = this.boss; B.active = false; this.state = 'bossdone'; this.projs.forEach(p => { p.img.destroy(); p.glow.destroy(); }); this.projs = [];
    KG.audio.play('win'); KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 300);
    this.tweens.timeScale = 0.45;
    for (let i = 0; i < 6; i++) this.time.delayedCall(i * 160, () => { KG.fx.burst(this, B.x + Phaser.Math.Between(-90, 90), ARC.GY - Phaser.Math.Between(60, 300), { colors: [0xff3d8b, 0xffd34f, 0xffffff], n: 24, max: 460, depth: 70 }); KG.audio.play('kill'); });
    this.tweens.add({ targets: B.img, alpha: 0, scaleY: B.img.scaleY * 0.6, duration: 1100 });
    this.time.delayedCall(1700, () => { this.tweens.timeScale = 1; this.end(true); });
  }

  /* ---------- จบเกม ---------- */
  end(win) {
    if (this.state === 'done') return; this.state = 'done'; this.v = 0; this.hero.setAlpha(1); this.setPose(win ? 'a2' : 'hurt');
    const stars = win ? Math.max(1, this.lives) : 0, best = SAVE.data.best[this.wid] || 0;
    if (win) { if (stars > arcadeStars(this.wid)) { SAVE.data.arcade[this.wid] = stars; } }
    const newBest = this.score > best; if (newBest) SAVE.data.best[this.wid] = this.score; SAVE.save();
    KG.audio.play(win ? 'win' : 'lose');
    const rows = [['pit', 'หลุม', 'กระโดด'], ['spike', 'หนาม', 'กระโดด'], ['foe', 'ศัตรู', 'โจมตี'], ['crate', 'ลัง', 'โจมตี'], ['barrier', 'แท่งพลังงาน', 'โจมตี']].filter(r => this.stats[r[0]][1] > 0);
    const rowsShown = rows.slice(0, 4);
    const nextW = this.wid < 4;
    KG.ui.modal(this, {
      title: win ? 'ชนะบอส!' : 'พลังหมด', w: 820, accent: win ? KG.C.sun : KG.C.red, extraH: 250 + rowsShown.length * 34,
      body: withPlayer('คะแนน ' + this.score + (newBest ? '  (สถิติใหม่!)' : '') + '  ·  เหรียญ ' + this.coins + '  ·  คอมโบสูงสุด ×' + this.bestCombo),
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { world: this.wid }) }, { label: win ? 'เล่นอีกครั้ง' : 'ลองใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Arcade', { world: this.wid }) }].concat(win && nextW ? [{ label: 'SECTOR ถัดไป', style: 'primary', icon: 'chevR', onClick: () => this.go('Select', { world: this.wid + 1 }) }] : []),
      build: (box, g) => {
        const st = KG.ui.stars(this, 0, g.top + 48, 0, 3, 60); box.add(st); this.time.delayedCall(350, () => st.setStars(stars, true));
        let y = g.top + 100; box.add(KG.txt(this, 0, y, win ? 'ในสนามวิ่ง คุณตัดสินใจเหมือนการเขียนเงื่อนไข "ถ้า…ก็…" ตลอดเวลา' : 'ลองดูสิ่งที่ผ่านมา แล้วตัดสินใจให้เร็วขึ้นอีกนิด', { size: 21, color: '#4ef4d2', center: true, ox: 0.5, width: 720, weight: 400 }));
        y += 44;
        rowsShown.forEach(r => { const s = this.stats[r[0]]; box.add(KG.txt(this, -320, y, 'ถ้าเจอ ' + r[1] + ' › ' + r[2], { size: 21, color: '#ffffff' })); box.add(KG.txt(this, 320, y, 'ทำถูก ' + Math.min(s[0], s[1]) + ' / ' + s[1], { size: 21, color: s[0] >= s[1] ? '#9bffc0' : '#ffd34f', ox: 1 })); y += 34; });
      }
    });
  }
}
