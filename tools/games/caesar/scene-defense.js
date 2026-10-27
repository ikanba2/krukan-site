/* ===== สนามป้องกัน: พิมพ์ถอดรหัสศัตรูให้ทันก่อนถึงฐาน (เกมแอ็กชันเรียลไทม์) =====
   ศัตรูเดินเข้าหาฐานพร้อมคำที่เข้ารหัสซีซาร์ ผู้เล่นมองแถบถอดรหัสแล้วพิมพ์คำจริง Techno ยิงทำลายเมื่อพิมพ์ครบ
   SECTOR 1: รู้กุญแจ · SECTOR 2: ซ่อนกุญแจ มีศัตรูตัวช่วยบอกคำจริง · SECTOR 3: ซ่อนกุญแจ เร็วขึ้น คำยาวขึ้น · ท้ายสุดมีบอส */
const DEF = {
  GY: 478, HX: 214, BASE_X: 150, lanes: [392, 440, 488], scales: [0.8, 0.9, 1.0],
  waves: 5, perWave: [5, 6, 7, 8, 1],
  speed: { 1: 54, 2: 62, 3: 70 }, gap: { 1: 4.6, 2: 4.0, 3: 3.5 }
};

class DefenseScene extends KG.Scene {
  constructor() { super('Defense'); }
  init(data) { this.wid = data && data.world ? data.world : 1; this._restartData = { world: this.wid }; }

  create() {
    this.setup(); KG.audio.music('action');
    this.ring = null; this.target = null; this._modal = null;
    const W = this.W = WORLDS[this.wid - 1];
    this.state = 'intro'; this.wave = 0; this.lives = 3; this.score = 0; this.combo = 0; this.bestCombo = 0; this.words = 0; this.letters = 0; this.misses = 0;
    this.enemies = []; this.target = null; this.refKey = 0; this.waveKey = 3; this.keyShown = true; this.spawnQ = []; this.t = 0; this.waveClear = false; this.hurtT = 0;
    this.buildStage(); this.buildHud(); this.buildStrip(); this.buildKeys();
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.showIntro();
  }
  onEscape() { if (this.state === 'play') this.pause(); }

  /* ---------- ฉาก ---------- */
  buildStage() {
    const W = this.W;
    this.bg = this.add.image(GW / 2, 300, 'arena_' + W.arena).setDisplaySize(GW * 1.15, GW * 1.15 * 0.5625);
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'dshade' + this.wid, GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(4,8,28,.55)'], [0.6, 'rgba(4,8,28,.2)'], [1, 'rgba(4,8,28,.92)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);
    matrixRain(this, '#4ef4d2', 0.1, 1);
    const T = this.T = THEMES_C[this.wid];
    // พื้น 3 เลน
    const gtex = KG.tex(this, 'dground' + this.wid, 1280, 150, ctx => {
      ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, 150, [[0, T.top], [1, '#05071a']]); ctx.fillRect(0, 0, 1280, 150); ctx.fillStyle = T.accent; ctx.fillRect(0, 0, 1280, 4);
      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 2; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(0, 50 + i * 46); ctx.lineTo(1280, 50 + i * 46); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; for (let x = 0; x < 1280; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 60, 150); ctx.stroke(); }
    });
    this.add.image(GW / 2, 372, gtex).setOrigin(0.5, 0).setDisplaySize(1280, 150).setDepth(2);
    // กำแพงฐานและฮีโร่
    this.base = this.add.image(DEF.BASE_X - 40, 506, KG.tex(this, 'dbase', 70, 230, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 70, 0, [[0, '#6d7fd0'], [1, '#2b3270']]); ctx.fillRect(4, 4, 62, 222); ctx.fillStyle = '#4ef4d2'; for (let i = 0; i < 5; i++) ctx.fillRect(8, 16 + i * 44, 54, 4); ctx.strokeStyle = '#0a0d2a'; ctx.lineWidth = 3; ctx.strokeRect(4, 4, 62, 222); })).setOrigin(0.5, 1).setDepth(6);
    this.shield = this.add.image(DEF.BASE_X + 10, 410, 'fx_glow').setTint(0x4ef4d2).setBlendMode('ADD').setDisplaySize(160, 360).setAlpha(0.35).setDepth(5);
    this.tweens.add({ targets: this.shield, alpha: 0.6, duration: 900, yoyo: true, repeat: -1 });
    this.heroShadow = this.add.ellipse(DEF.HX, 488, 100, 16, 0x000000, 0.45).setDepth(7);
    this.hero = KG.art.make(this, DEF.HX, 492, HID, 'idle', 150).setDepth(30);
    this.tweens.add({ targets: this.hero, scaleY: this.hero.scaleY * 1.02, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.input.on('pointerdown', (p, objs) => { /* แตะศัตรูเพื่อเลือกเป้า จัดการที่ตัวศัตรู */ });
  }

  /* ---------- HUD ---------- */
  buildHud() {
    this.hearts = []; for (let i = 0; i < 3; i++) { const h = KG.ui.icon(this, 'heart', 52 + i * 52, 44, 40, 0xff4d5e).setDepth(100); this.hearts.push(h); }
    this.waveTxt = this.txt(GW / 2, 22, '', { size: 28, color: '#ffffff', center: true, ox: 0.5, stroke: true }).setDepth(100);
    this.keyTxt = this.txt(GW / 2, 58, '', { size: 21, color: '#ffd34f', center: true, ox: 0.5, stroke: true }).setDepth(100);
    this.scoreTxt = this.txt(GW - 250, 20, '0', { size: 38, color: '#ffffff', stroke: true, ox: 1 }).setDepth(100);
    this.txt(GW - 242, 36, 'คะแนน', { size: 17, color: '#9fb0d8' }).setDepth(100);
    this.comboTxt = this.txt(GW - 250, 66, '', { size: 24, color: '#ffd34f', stroke: true, ox: 1 }).setDepth(100);
    iconButton(this, GW - 56, 44, 'pause', () => this.pause(), { w: 60, h: 52, depth: 101 }); iconButton(this, GW - 126, 44, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 101 });
  }
  setHearts() { this.hearts.forEach((h, i) => h.setTint(i < this.lives ? 0xff4d5e : 0x3a2a44)); }

  /* ---------- แถบถอดรหัส (ตัวช่วยอ่านรหัส) ---------- */
  buildStrip() {
    const y0 = 538, x0 = 64, cw = 44;
    this.stripPanel = KG.ui.panel(this, 24, 504, 1232, 86, { accent: '#4ef4d2', cuts: [14, 0, 14, 0], glow: false }).setDepth(40);
    this.txt(36, 516, 'รหัส', { size: 17, color: '#4ef4d2' }).setDepth(41);
    this.txt(36, 552, 'ตัวจริง', { size: 17, color: '#ff9ac8' }).setDepth(41);
    this.stripTop = []; this.stripBot = [];
    for (let i = 0; i < 26; i++) {
      this.stripTop.push(KG.txt(this, 118 + i * 38, 530, LET[i], { size: 25, color: '#4ef4d2', center: true, ox: 0.5, oy: 0.5 }).setDepth(41));
      this.stripBot.push(KG.txt(this, 118 + i * 38, 566, '', { size: 25, color: '#ffd6ea', center: true, ox: 0.5, oy: 0.5 }).setDepth(41));
    }
    this.stripKey = this.txt(1172, 548, '', { size: 20, color: '#ffd34f', center: true, ox: 0.5, oy: 0.5 }).setDepth(41);
    this.btnKL = new KG.ui.Button(this, 1124, 548, 44, 56, { label: '', icon: 'chevL', style: 'ghost', slant: 6, onClick: () => this.setRef(this.refKey - 1) }).setDepth(42);
    this.btnKR = new KG.ui.Button(this, 1224, 548, 44, 56, { label: '', icon: 'chevR', style: 'ghost', slant: 6, onClick: () => this.setRef(this.refKey + 1) }).setDepth(42);
    this.setRef(0);
  }
  setRef(k) {
    this.refKey = CC.mod(k, 26);
    this.stripBot.forEach((t, i) => t.setText(LET[CC.mod(i - this.refKey, 26)]));
    this.stripKey.setText('กุญแจ\n' + this.refKey).setScale(1);
    this.tweens.add({ targets: this.stripKey, scaleX: 1.15, scaleY: 1.15, duration: 70, yoyo: true }); KG.audio.play('tick', { p: 0.9 + this.refKey * 0.01 });
  }
  setStripLocked(locked) { this.btnKL.setEnabled(!locked); this.btnKR.setEnabled(!locked); }

  /* ---------- คีย์บอร์ด A-Z สองแถว ---------- */
  buildKeys() {
    this.keyBtns = {};
    for (let r = 0; r < 2; r++) for (let i = 0; i < 13; i++) {
      const ch = LET[r * 13 + i], x = 640 + (i - 6) * 94, y = 620 + r * 58;
      const b = new KG.ui.Button(this, x, y, 88, 50, { label: ch, style: 'ghost', size: 26, slant: 6, sfx: 'key', onClick: () => this.typeLetter(ch), depth: 50 }); this.keyBtns[ch] = b;
    }
  }
  onKey(e) {
    if (this.state !== 'play') return; const k = e.key;
    if (/^[a-zA-Z]$/.test(k)) this.typeLetter(k.toUpperCase());
    else if (k === 'Backspace' || k === 'Escape') { this.releaseTarget(); }
    else if (k === 'ArrowLeft' && !this.btnKL.zone.input.enabled === false) this.setRef(this.refKey - 1);
    else if (k === 'ArrowRight') this.setRef(this.refKey + 1);
  }

  /* ---------- เริ่ม ---------- */
  showIntro() {
    const W = this.W;
    KG.ui.modal(this, { title: 'สนามป้องกัน ' + W.name, w: 840, accent: W.color, extraH: 140,
      body: this.wid === 1 ? 'ศัตรูถือคำรหัสซีซาร์ที่รู้กุญแจแล้ว ดูแถบถอดรหัสด้านล่างเพื่อแปลง แล้วพิมพ์ข้อความจริง' : (this.wid === 2 ? 'กุญแจถูกซ่อน แต่ศัตรูตัวช่วยจะบอกคำจริงของตัวเอง ใช้มันหากุญแจแล้วตั้งแถบถอดรหัสเอง' : 'กุญแจซ่อนและเปลี่ยนทุกคลื่น ศัตรูเร็วขึ้น คำยาวขึ้น และมีบอสปิดท้าย'),
      buttons: [{ label: 'กลับ', style: 'ghost', icon: 'chevL', onClick: () => this.go('Select', { world: this.wid }) }, { label: 'เริ่มป้องกัน', style: 'primary', icon: 'play', onClick: () => this.start() }],
      build: (box, g) => {
        const y = g.top + 4;
        box.add(KG.txt(this, 0, y, 'วิธีเล่น: ดูคำรหัสเหนือหัวศัตรู › หาตัวอักษรบนแถบ › พิมพ์ตัวอักษรจริง', { size: 22, color: '#ffd34f', center: true, ox: 0.5, width: 760 }));
        box.add(KG.txt(this, 0, y + 62, 'แตะที่ศัตรูเพื่อเลือกเป้าหมาย · Backspace เพื่อยกเลิกเป้า · ศัตรูถึงฐานเสียหัวใจ 1 ดวง', { size: 19, weight: 400, color: '#cdd7f2', center: true, ox: 0.5, width: 760 }));
      } });
  }
  start() { this.state = 'play'; this.startWave(1); }
  pause() {
    if (this.state !== 'play') return; this.state = 'pause';
    KG.ui.modal(this, { title: 'พักเกม', w: 560, accent: KG.C.cyan, buttons: [{ label: 'ออก', style: 'danger', icon: 'home', onClick: () => this.go('Select', { world: this.wid }) }, { label: 'เริ่มใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Defense', { world: this.wid }) }, { label: 'เล่นต่อ', style: 'primary', icon: 'play', onClick: () => { this.state = 'play'; } }] });
  }

  /* ---------- คลื่นศัตรู ---------- */
  startWave(w) {
    this.wave = w; this.waveClear = false; const wid = this.wid, boss = w === DEF.waves;
    const keys = [3, 5, 7, 4, 6, 9, 11, 14, 17, 20]; this.waveKey = KG.pick(keys.filter(k => k !== this.waveKey));
    this.keyShown = wid === 1;
    this.waveTxt.setText(boss ? 'คลื่นบอส!' : 'คลื่นที่ ' + w + '/' + DEF.waves);
    this.keyTxt.setText(this.keyShown ? 'กุญแจรอบนี้คือ ' + this.waveKey : 'กุญแจถูกซ่อน · หาจากศัตรูตัวช่วย');
    if (this.keyShown) { this.setRef(this.waveKey); this.setStripLocked(true); } else { this.setRef(0); this.setStripLocked(false); }
    const banner = KG.txt(this, GW / 2, 250, boss ? 'บอสผู้คุมสัญญาณ!' : 'คลื่นที่ ' + w, { size: 74, color: boss ? '#ff7ab2' : '#ffffff', center: true, middle: true, stroke: true, sw: 9 }).setDepth(200).setScale(2).setAlpha(0);
    this.tweens.add({ targets: banner, scaleX: 1, scaleY: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' }); this.tweens.add({ targets: banner, alpha: 0, delay: 1100, duration: 400, onComplete: () => banner.destroy() });
    KG.audio.play(boss ? 'alarm' : 'go');
    // กำหนดคิวศัตรู
    const pool = w <= 2 ? CC.TECH_WORDS.easy.concat(wid >= 2 ? CC.TECH_WORDS.mid.slice(0, 4) : []) : (w <= 4 ? CC.TECH_WORDS.mid.concat(CC.TECH_WORDS.easy) : CC.TECH_WORDS.hard);
    const gap = Math.max(2.6, DEF.gap[wid] - w * 0.25), words = KG.shuffle(pool); this.spawnQ = [];
    let t = 1.2;
    if (!this.keyShown && !boss) { this.spawnQ.push({ at: t, tip: true, plain: KG.pick(['TECHNO', 'CODE', 'DATA', 'KEY']) }); t += gap * 0.8; }
    if (boss) this.spawnQ.push({ at: 1.6, boss: true, plain: KG.pick([['SECRET', 'MESSAGE', 'TO', 'HQ'], ['OPEN', 'THE', 'FIREWALL', 'NOW']]) });
    else for (let i = 0; i < DEF.perWave[w - 1] + (wid - 1); i++) { this.spawnQ.push({ at: t, plain: words[i % words.length] }); t += gap * KG.rnd(0.8, 1.2); }
    this.waveT = 0; this.waveTotal = this.spawnQ.length;
  }
  spawn(q) {
    const lane = q.boss ? 1 : Phaser.Math.Between(0, 2), y = DEF.lanes[lane], sc = DEF.scales[lane], wid = this.wid;
    const plain = q.boss ? q.plain.join(' ') : q.plain, cipher = CC.encrypt(plain, this.waveKey);
    const id = q.boss ? 'm6' : FOES[(Math.floor(Math.random() * 7) + wid) % FOES.length];
    const c = this.add.container(GW + 80, y).setDepth(10 + lane * 3);
    const img = KG.art.make(this, 0, 0, id, 1, (q.boss ? 230 : 116) * sc);
    const sh = this.add.ellipse(0, 4, (q.boss ? 150 : 84) * sc, 14, 0x000000, 0.4);
    const cw = Math.max(110, cipher.replace(/ /g, '').length * 28 + (q.boss ? 20 : 34)), lh = q.boss ? 74 : 62;
    const top = -(q.boss ? 250 : 140) * sc - lh - 10;
    const pan = KG.ui.panel(this, -cw / 2, top, cw, lh, { cuts: [8, 8, 8, 8], accent: q.tip ? '#ffd34f' : '#4ef4d2', fill: ['#12206e', '#080f2c'], glow: false, bracket: false });
    const ct = KG.txt(this, 0, top + 6, cipher.split('').join(' '), { size: q.boss ? 24 : 26, color: q.tip ? '#ffd34f' : '#4ef4d2', center: true, ox: 0.5 });
    const pt = KG.txt(this, 0, top + lh - 28, plain.replace(/[A-Z]/g, '·'), { size: 22, color: '#9bffc0', center: true, ox: 0.5 });
    c.add([sh, img, pan, ct, pt]);
    if (q.tip) { const tip = KG.txt(this, 0, top - 30, 'ตัวช่วย: คำจริงคือ ' + plain, { size: 21, color: '#ffd34f', center: true, ox: 0.5, stroke: true }); c.add(tip); c.tipTxt = tip; }
    c.setSize(Math.max(cw, 120), 260).setInteractive(new Phaser.Geom.Rectangle(-Math.max(cw, 120) / 2, top, Math.max(cw, 120), -top + 10), Phaser.Geom.Rectangle.Contains);
    const e = { phase: Math.random() * 3, hitT: 0, c, img, pt, plain, cipher, tip: !!q.tip, boss: !!q.boss, lane, y, x: c.x, typed: 0, speed: (DEF.speed[wid] + this.wave * 6) * (q.boss ? 0.5 : (q.tip ? 0.75 : 1)) * (0.9 + Math.random() * 0.2), words: q.boss ? q.plain : null, wi: 0, hp: q.boss ? q.plain.length : 1 };
    c.on('pointerdown', () => { if (this.state === 'play') this.lock(e); });
    this.enemies.push(e); return e;
  }

  /* ---------- การพิมพ์และการยิง ---------- */
  lock(e) { if (!e || e.dead) return; if (this.target === e) return; this.releaseTarget(true); this.target = e; e.c.list.forEach(o => { if (o.setTint && o.type === 'Image') o.setTint(0xcfe8ff); }); KG.audio.play('tap'); this.targetRing(e); }
  targetRing(e) { if (this.ring) this.ring.destroy(); this.ring = this.add.image(e.c.x, e.y - 40, 'fx_ring').setTint(0xffd34f).setBlendMode('ADD').setDisplaySize(150, 150).setDepth(60).setAlpha(0.9); this.tweens.add({ targets: this.ring, angle: 360, duration: 2200, repeat: -1 }); }
  releaseTarget(keep) { if (this.target) { this.target.img.clearTint(); this.target = null; } if (this.ring) { this.ring.destroy(); this.ring = null; } }
  expectedLetter(e) { return e.boss ? e.words[e.wi][e.typed] : e.plain[e.typed]; }
  typeLetter(ch) {
    if (this.state !== 'play') return;
    let e = this.target;
    if (!e) {
      const cands = this.enemies.filter(q => !q.dead && !q.tip && this.expectedLetter(q) === ch).sort((a, b) => a.c.x - b.c.x);
      const tipC = this.enemies.filter(q => !q.dead && q.tip && this.expectedLetter(q) === ch);
      e = cands[0] || tipC[0]; if (e) this.lock(e);
    }
    if (!e) { this.miss(); return; }
    if (this.expectedLetter(e) !== ch) { this.miss(); return; }
    e.typed++; this.letters++; KG.audio.play('key');
    const shown = (e.boss ? e.words.join(' ') : e.plain), done = e.boss ? e.words.slice(0, e.wi).join(' ').length + (e.wi ? 1 : 0) + e.typed : e.typed;
    e.pt.setText(shown.split('').map((c, i) => c === ' ' ? ' ' : (i < done ? c : '·')).join(''));
    KG.fx.burst(this, e.c.x, e.y - 90, { colors: [0x9bffc0, 0xffffff], n: 5, max: 140, depth: 70 });
    const wlen = e.boss ? e.words[e.wi].length : e.plain.length;
    if (e.typed >= wlen) this.wordDone(e);
  }
  miss() {
    this.misses++; this.combo = 0; this.comboTxt.setText(''); KG.audio.play('error'); KG.fx.shake(this, 90, 0.003);
    const t = KG.txt(this, 640, 330, 'พิมพ์ผิด!', { size: 30, color: '#ff7a8a', center: true, middle: true, stroke: true }).setDepth(150); this.tweens.add({ targets: t, y: 290, alpha: 0, duration: 500, onComplete: () => t.destroy() });
  }
  wordDone(e) {
    this.fire(e);
    if (e.boss && e.wi + 1 < e.words.length) { e.wi++; e.typed = 0; e.hp--; this.bossHit(e); this.words++; this.addScore(100, e.c.x, e.y - 200); return; }
    this.kill(e);
  }
  bossHit(e) { e.hitT = 0.3; KG.fx.shake(this, 220, 0.008); KG.fx.flash(this, 0xffffff, 90); this.tweens.add({ targets: e.img, x: 18, duration: 60, yoyo: true, repeat: 2 }); this.tweens.add({ targets: e.c, x: e.c.x + 40, duration: 220, ease: 'Cubic.easeOut' }); }
  fire(e) {
    KG.art.frame(this.hero, 'a1'); this.time.delayedCall(90, () => KG.art.frame(this.hero, 'a2')); this.time.delayedCall(250, () => KG.art.frame(this.hero, 'a3')); this.time.delayedCall(420, () => KG.art.frame(this.hero, 'idle'));
    e.hitT = 0.18;
    KG.audio.play('zap');
    const x0 = DEF.HX + 70, y0 = 430, x1 = e.c.x, y1 = e.y - 70;
    const g = this.add.graphics().setDepth(55).setBlendMode('ADD'); g.lineStyle(10, 0x4ef4d2, 0.9); g.lineBetween(x0, y0, x1, y1); g.lineStyle(4, 0xffffff, 1); g.lineBetween(x0, y0, x1, y1);
    this.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() });
    KG.fx.burst(this, x0, y0, { colors: [0x4ef4d2, 0xffffff], n: 10, max: 220, depth: 60 });
  }
  kill(e) {
    e.dead = true; this.words++; this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.releaseTarget(); this.comboTxt.setText(this.combo >= 2 ? 'คอมโบ ×' + this.combo : '');
    const pts = (e.tip ? 30 : 60 + e.plain.length * 10) * Math.min(5, Math.max(1, this.combo)); this.addScore(pts, e.c.x, e.y - 150);
    KG.audio.play('kill'); KG.fx.burst(this, e.c.x, e.y - 70, { colors: [0xffffff, 0xff3d8b, 0xffd34f, 0x4ef4d2], n: e.boss ? 50 : 28, max: 420, depth: 70 }); KG.fx.ring(this, e.c.x, e.y - 70, 0xff3d8b, { size: 2.6, w: 0.5 });
    if (e.boss) { KG.fx.confetti(this, { ms: 1300 }); KG.fx.shake(this, 400, 0.01); }
    this.tweens.add({ targets: e.c, alpha: 0, scaleX: 1.15, scaleY: 0.6, duration: 260, onComplete: () => e.c.destroy() });
  }
  addScore(n, x, y) { this.score += n; this.scoreTxt.setText(String(this.score)); if (x != null) KG.fx.pop(this, x, y, '+' + n, { size: 26, color: '#ffd34f' }); }

  /* ---------- ลูปหลัก ---------- */
  update(time, delta) {
    if (this.state !== 'play') return;
    const dt = Math.min(0.05, delta / 1000); this.t += dt; this.waveT += dt;
    while (this.spawnQ.length && this.spawnQ[0].at <= this.waveT) this.spawn(this.spawnQ.shift());
    this.enemies.forEach(e => {
      if (e.dead) return; e.x -= e.speed * dt; e.c.x = e.x;
      e.hitT = Math.max(0, e.hitT - dt); KG.art.frame(e.img, e.hitT > 0 ? 7 : KG.art.monsterWalk(this.t + e.phase));
      if (e.c.x < DEF.BASE_X + 20) { this.breach(e); }
    });
    if (this.ring && this.target) { this.ring.x = this.target.c.x; }
    this.enemies = this.enemies.filter(e => !e.dead);
    this.bg.x = GW / 2 - (this.t * 4) % 60;
    if (!this.spawnQ.length && !this.enemies.some(e => !e.tip) && !this.waveClear && this.state === 'play') {
      this.waveClear = true; this.enemies.forEach(e => { e.dead = true; e.c.destroy(); }); this.enemies = [];
      if (this.wave >= DEF.waves) this.time.delayedCall(900, () => this.end(true));
      else { KG.audio.play('portal'); this.say('เคลียร์คลื่นที่ ' + this.wave + '!'); this.time.delayedCall(1800, () => { if (this.state === 'play') this.startWave(this.wave + 1); }); }
    }
  }
  say(t) { const x = KG.txt(this, 640, 150, t, { size: 40, color: '#9bffc0', center: true, middle: true, stroke: true }).setDepth(150).setAlpha(0); this.tweens.add({ targets: x, alpha: 1, y: 130, duration: 300 }); this.tweens.add({ targets: x, alpha: 0, delay: 1300, duration: 300, onComplete: () => x.destroy() }); }
  breach(e) {
    if (e.dead) return; e.dead = true; if (this.target === e) this.releaseTarget();
    if (e.tip) { this.tweens.add({ targets: e.c, alpha: 0, duration: 200, onComplete: () => e.c.destroy() }); return; }
    this.lives--; this.setHearts(); this.combo = 0; this.comboTxt.setText(''); KG.audio.play('hurt'); KG.fx.flash(this, 0xff4d5e, 200); KG.fx.shake(this, 300, 0.01);
    KG.fx.burst(this, DEF.BASE_X + 10, e.y - 60, { colors: [0xff4d5e, 0xffffff, 0xffd34f], n: 30, max: 400, depth: 80 }); KG.art.frame(this.hero, 'hurt'); this.time.delayedCall(450, () => KG.art.frame(this.hero, 'idle'));
    e.c.destroy();
    if (this.lives <= 0) this.end(false);
  }

  /* ---------- จบเกม ---------- */
  end(win) {
    if (this.state === 'done') return; this.state = 'done'; this.releaseTarget(); this.enemies.forEach(e => e.c.destroy()); this.enemies = [];
    const stars = win ? Math.max(1, this.lives) : 0, best = SAVE.data.best[this.wid] || 0, newBest = this.score > best;
    if (win && stars > defenseStars(this.wid)) SAVE.data.defense[this.wid] = stars; if (newBest) SAVE.data.best[this.wid] = this.score; SAVE.save();
    KG.audio.play(win ? 'win' : 'lose'); const acc = this.letters + this.misses > 0 ? Math.round(100 * this.letters / (this.letters + this.misses)) : 100;
    KG.ui.modal(this, { title: win ? 'ป้องกันสำเร็จ!' : 'ฐานถูกบุก', w: 820, accent: win ? KG.C.sun : KG.C.red, extraH: 190,
      body: withPlayer('คะแนน ' + this.score + (newBest ? '  (สถิติใหม่!)' : '') + '  ·  ถอดได้ ' + this.words + ' คำ  ·  แม่นยำ ' + acc + '%  ·  คอมโบสูงสุด ×' + this.bestCombo),
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { world: this.wid }) }, { label: win ? 'เล่นอีกครั้ง' : 'ลองใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Defense', { world: this.wid }) }].concat(win && this.wid < 3 ? [{ label: 'SECTOR ถัดไป', style: 'primary', icon: 'chevR', onClick: () => this.go('Select', { world: this.wid + 1 }) }] : []),
      build: (box, g) => {
        const st = KG.ui.stars(this, 0, g.top + 48, 0, 3, 60); box.add(st); this.time.delayedCall(350, () => st.setStars(stars, true));
        box.add(KG.txt(this, 0, g.top + 100, win ? 'คุณถอดรหัสซีซาร์ได้เร็วกว่าการลองทุกกุญแจ เพราะรู้วิธีอ่านแถบและเดากุญแจจากเบาะแส' : 'ลองดูแถบถอดรหัสให้ไว แล้วพิมพ์ทีละตัวอักษร อย่าลืมแตะศัตรูตัวที่ใกล้ฐานที่สุดก่อน', { size: 21, weight: 400, color: '#4ef4d2', center: true, ox: 0.5, width: 720 }));
      } });
  }
}
const THEMES_C = {
  1: { accent: '#ffd34f', top: '#2a3478' },
  2: { accent: '#ff7a59', top: '#5a2a30' },
  3: { accent: '#8ec5ff', top: '#27497c' }
};
const FOES = ['m1', 'm3', 'm5', 'm7'];   // มอนสเตอร์ประจำสนาม (หันซ้าย เดินเข้าหาฐาน) บอสคือ m6
const HID = 'h1';
