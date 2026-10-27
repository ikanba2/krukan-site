/* ===== ฉากเล่น Net Patrol: การ์ดข้อความเข้ามาทีละใบ ปัดซ้ายทิ้ง ปัดขวาผ่าน ไรเดอร์เปลี่ยนร่างตามคอมโบ =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y8-70 · แถบเวลา y84-100 · การ์ด/เหตุผลกลางจอ ศูนย์กลาง (640,268) · ปุ่มตัดสิน y600 · แผงสถานะซ้าย · กล่องข้อความปลอดภัยขวา */
const CARD = { x: 640, y: 268, w: 640, h: 330 };
const BTN_Y = 604;

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.lv = data.level || 1; this.tutorial = this.lv === 1; this.mode = this.tutorial ? 'free' : (data.mode || SAVE.data.mode);
    this._restartData = { level: this.lv, mode: data.mode || SAVE.data.mode, tutor: data.tutor };
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music(this.mode === 'time' ? 'bounce' : 'sunny');
    const L = this.L = LEVELS[this.lv - 1];
    this.cards = NP.deck(this.lv); this.idx = 0; this.score = 0; this.streak = 0; this.maxStreak = 0; this.right = 0; this.lives = 3; this.missed = []; this.times = [];
    this.state = 'intro'; this.cur = null; this.cardC = null; this.revealC = null; this.tutor = null; this.tier = 0; this.timeMax = NP.timeLimit(this.lv, this.mode); this.timeLeft = 0; this.drag = null; this.tutDecided = 0; this.lastTick = 0;
    this.buildBackground(); this.buildHud(); this.buildSide(); this.buildButtons();
    this.rider = new KG.Rider(this, 140, 696, { forms: FORMS, form: 0, bodyH: 250, depth: 20 });
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.input.on('pointermove', p => this.onDrag(p)); this.input.on('pointerup', p => this.onRelease(p));
    this.refreshStatus();
    if (this.tutorial) this.time.delayedCall(500, () => this.startTutor()); else this.showIntro();
  }
  onEscape() { if (this.state === 'wait' || this.state === 'reveal') this.pause(); }
  leave() { this.go('Select', { level: this.lv }); }

  /* ---------- ฉากหลัง HUD แผงสถานะ ---------- */
  buildBackground() {
    const arena = ['sky', 'sun', 'ice', 'nature'][(this.lv - 1) % 4];
    this.add.image(GW / 2, GH / 2, 'arena_' + arena).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.18);
    KG.fx.ambient(this, { freq: 320, colors: [0xffffff, 0xffd34f, 0x4cc4ff], s: 0.35, alpha: 0.8 });
    // กล่องข้อความปลอดภัย (ฝั่งขวา) ที่การ์ดที่ผ่านจะบินเข้าไป
    this.inbox = this.add.container(1112, 262);
    this.inbox.add(KG.ui.panel(this, -78, -92, 156, 184, { accent: '#22b45a', accent2: '#7ae29a', cuts: [16, 0, 16, 0], fill: ['#f2fff6', '#d4f6df'] }));
    this.inbox.add(KG.ui.icon(this, 'shield', 0, -26, 66, 0x22b45a));
    this.inbox.add(KG.txt(this, 0, 28, 'ปลอดภัย', { size: 22, color: '#14803f', center: true, ox: 0.5 }));
    this.inbox.add(KG.txt(this, 0, 56, 'ผ่านได้', { size: 18, weight: 400, color: '#3d8f5c', center: true, ox: 0.5 }));
    this.tweens.add({ targets: this.inbox, y: 270, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  buildHud() {
    const L = this.L;
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52, depth: 30 });
    this.txt(100, 6, (this.tutorial ? 'บทสอน' : 'ด่าน ' + L.id) + ' · ' + (this.mode === 'time' ? 'ท้าทาย' : 'ฝึก'), { size: 18, color: KG.SKIN.hi }).setDepth(30);
    this.txt(100, 26, L.title, { size: 30, stroke: true }).setDepth(30);
    this.txt(1032, 4, 'คะแนน', { size: 15, color: '#ffffff', stroke: true, ox: 1 }).setDepth(30);
    this.scoreTxt = this.txt(1032, 18, '0', { size: 36, stroke: true, ox: 1 }).setDepth(30);
    addSystemButtons(this, 1084, 40, 0, ['sfx']).forEach(b => b.setDepth(30));
    iconButton(this, 1148, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 30 });
    iconButton(this, 1218, 40, 'pause', () => this.pause(), { w: 60, h: 52, depth: 30 });
    this.timeBar = KG.ui.bar(this, CARD.x - 320, 84, 640, 16, { value: 1, color: 0x22b45a }); this.timeBar.setDepth(30);
    this.timeTxt = this.txt(CARD.x, 108 - 6, '', { size: 18, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(30);
    if (this.mode !== 'time') { this.timeBar.setVisible(false); this.timeTxt.setPosition(CARD.x, 84).setText(this.tutorial ? 'บทสอน ไม่จับเวลา ไม่เสียหัวใจ' : 'โหมดฝึก ไม่จับเวลา ไม่เสียหัวใจ'); }
  }
  buildSide() {
    const D = 25;
    KG.ui.panel(this, 24, 84, 176, 300, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [16, 0, 16, 0] }).setDepth(D - 1);
    this.heartLab = this.txt(112, 96, 'หัวใจ', { size: 16, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D); if (this.mode !== 'time') this.heartLab.setText('โหมดฝึก');
    this.hearts = [0, 1, 2].map(i => KG.ui.icon(this, 'heart', 58 + i * 54, 138, 44, 0xff4d6a).setDepth(D));
    this.txt(112, 170, 'คอมโบ', { size: 16, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D);
    this.comboTxt = this.txt(112, 190, '0', { size: 58, center: true, ox: 0.5 }).setDepth(D);
    this.multTxt = this.txt(112, 254, 'x1', { size: 24, color: '#d9560a', center: true, ox: 0.5 }).setDepth(D);
    this.formBar = KG.ui.bar(this, 44, 292, 136, 14, { value: 0, color: 0xff8a2b }); this.formBar.setDepth(D);
    this.formTxt = this.txt(112, 314, '', { size: 17, center: true, ox: 0.5 }).setDepth(D);
    KG.ui.panel(this, 1086, 396, 170, 108, { accent: '#2b8cff', accent2: '#7cc4ff', cuts: [0, 16, 0, 16] }).setDepth(D - 1);
    this.txt(1171, 404, 'ใบที่', { size: 16, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D);
    this.progTxt = this.txt(1171, 424, '', { size: 34, center: true, ox: 0.5 }).setDepth(D);
    this.accTxt = this.txt(1171, 470, '', { size: 18, color: '#1a8f6a', center: true, ox: 0.5 }).setDepth(D);
  }
  buildButtons() {
    this.blockBtn = new KG.ui.Button(this, 450, BTN_Y, 340, 96, { label: 'ปัดทิ้ง', icon: 'close', style: 'danger', size: 38, onClick: () => this.decide('block') }); this.blockBtn.setDepth(30);
    this.allowBtn = new KG.ui.Button(this, 830, BTN_Y, 340, 96, { label: 'ผ่าน', icon: 'check', style: 'green', size: 38, onClick: () => this.decide('allow') }); this.allowBtn.setDepth(30);
    this.hintL = this.txt(450, 668, KG.isTouch ? 'ปัดการ์ดไปทางซ้าย' : 'ปุ่ม ← หรือ A', { size: 18, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(30);
    this.hintR = this.txt(830, 668, KG.isTouch ? 'ปัดการ์ดไปทางขวา' : 'ปุ่ม → หรือ D', { size: 18, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(30);
    this.nextBtn = new KG.ui.Button(this, 640, BTN_Y, 380, 92, { label: 'ต่อไป', icon: 'chevR', style: 'primary', size: 36, onClick: () => this.proceed() }); this.nextBtn.setDepth(30).setVisible(false); this.nextBtn.setEnabled(false);
    this.nextHint = this.txt(640, 668, KG.isTouch ? '' : 'กด Enter หรือเว้นวรรค', { size: 18, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(30).setVisible(false);
  }
  setChoice(on) {
    [this.blockBtn, this.allowBtn].forEach(b => { b.setVisible(on); b.setEnabled(on); });
    this.hintL.setVisible(on); this.hintR.setVisible(on);
  }
  setNext(on) { this.nextBtn.setVisible(on); this.nextBtn.setEnabled(on); this.nextHint.setVisible(on); }
  refreshStatus() {
    const mult = NP.multiplier(this.streak), tier = NP.formTier(this.streak), tot = this.cards.length;
    this.comboTxt.setText(String(this.streak)); this.multTxt.setText('คะแนน x' + mult);
    this.hearts.forEach((h, i) => h.setTint(i < this.lives ? 0xff4d6a : 0xc9d3ec));
    this.formBar.setValue(tier >= 3 ? 1 : (this.streak % 3) / 3, 150);
    this.formTxt.setText(tier >= 3 ? 'ร่างสุดยอด!' : 'อีก ' + (3 - (this.streak % 3)) + ' ใบเปลี่ยนร่าง');
    this.scoreTxt.setText(String(this.score));
    this.progTxt.setText(Math.min(this.idx + 1, tot) + '/' + tot);
    this.accTxt.setText('แม่น ' + NP.accuracy(this.right, this.idx + (this.state === 'resolve' || this.state === 'reveal' ? 1 : 0)) + '%');
    this.hearts.forEach(h => h.setVisible(this.mode === 'time'));
  }

  /* ---------- สร้างการ์ดข้อความ ---------- */
  chip(x, y, str, hex, size) {
    const c = this.add.container(x, y), w = KG.measure(str, '600 ' + size + 'px Kanit') + 26, h = size + 14, col = Phaser.Display.Color.HexStringToColor(hex).color, g = this.add.graphics();
    g.fillStyle(col, 0.16); g.fillPoints([{ x: 8, y: 0 }, { x: w, y: 0 }, { x: w - 8, y: h }, { x: 0, y: h }], true);
    g.lineStyle(2, col, 1); g.strokePoints([{ x: 8, y: 0 }, { x: w, y: 0 }, { x: w - 8, y: h }, { x: 0, y: h }], true);
    c.add(g); c.add(KG.txt(this, w / 2, h / 2, str, { size, color: hex, center: true, middle: true })); c.chipW = w; c.chipH = h; return c;
  }
  makeCard(card) {
    const W = CARD.w, H = CARD.h, col = APP_COLOR[card.app], colInt = Phaser.Display.Color.HexStringToColor(col).color, c = this.add.container(CARD.x, CARD.y);
    c.add(KG.ui.panel(this, -W / 2, -H / 2, W, H, { accent: col, accent2: col, cuts: [22, 0, 22, 0], fill: ['#ffffff', '#f3f8ff'] }));
    const L = -W / 2 + 30, top = -H / 2 + 26;
    c.add(KG.ui.icon(this, APP_ICON[card.app], L + 14, top + 14, 30, colInt));
    c.add(KG.txt(this, L + 40, top + 2, APPS[card.app], { size: 20, color: col }));
    let y = top + 42;
    const from = KG.txt(this, L, y, 'จาก: ' + card.from, { size: 21, color: '#1b2a6b', width: W - 60 }); c.add(from); y += from.height + 6;
    c.add(this.add.rectangle(0, y, W - 56, 2, 0xd0def5).setOrigin(0.5, 0)); y += 12;
    // พื้นที่ท้ายการ์ด: ลิงก์ ไฟล์แนบ บริบท
    let bottom = H / 2 - 18; const tail = [];
    if (card.ctx) { const t = KG.txt(this, L + 12, 0, 'ที่คุณรู้: ' + card.ctx, { size: 18, weight: 400, color: '#6b4a00', width: W - 90 }); const h = t.height + 12; tail.push({ kind: 'ctx', t, h }); }
    if (card.attach) { const t = KG.txt(this, 0, 0, 'ไฟล์แนบ: ' + card.attach, { size: 20, color: '#8a1f2d' }); tail.push({ kind: 'att', t, h: t.height + 8 }); }
    if (card.link) { const t = KG.txt(this, 0, 0, 'ลิงก์: ' + card.link, { size: 21, color: '#1767d1' }); tail.push({ kind: 'lnk', t, h: t.height + 6 }); }
    tail.forEach(e => {
      bottom -= e.h;
      if (e.kind === 'ctx') { const bg = this.add.rectangle(0, bottom, W - 52, e.h, 0xfff3c4).setOrigin(0.5, 0); e.t.setPosition(L + 2, bottom + 5); c.add(bg); c.add(e.t); }
      else if (e.kind === 'att') { const bg = this.add.rectangle(L - 2, bottom, e.t.width + 20, e.h, 0xffe3e6).setOrigin(0, 0); e.t.setPosition(L + 8, bottom + 3); c.add(bg); c.add(e.t); }
      else { e.t.setPosition(L, bottom + 1); c.add(e.t); const u = this.add.rectangle(L, bottom + e.h - 2, e.t.width, 2, 0x1767d1).setOrigin(0, 0); c.add(u); }
      bottom -= 6;
    });
    const room = bottom - y - 4; let size = 26, body;
    do { body = KG.txt(this, L, y, card.body, { size, weight: 600, color: '#1b2a6b', width: W - 62, lineSpacing: 6 }); if (body.height <= room || size <= 19) break; body.destroy(); size -= 2; } while (true);
    c.add(body);
    // ป้ายตอนลากการ์ดไปซ้าย/ขวา
    c.stampL = KG.txt(this, -W / 2 + 120, -H / 2 + 80, 'ปัดทิ้ง', { size: 52, color: '#e0243d', center: true, middle: true, stroke: '#ffffff', sw: 10 }).setAngle(-12).setAlpha(0);
    c.stampR = KG.txt(this, W / 2 - 110, -H / 2 + 80, 'ผ่าน', { size: 52, color: '#1f9e4f', center: true, middle: true, stroke: '#ffffff', sw: 10 }).setAngle(12).setAlpha(0);
    c.add([c.stampL, c.stampR]);
    c.setDepth(18); c.zone = this.add.zone(0, 0, W, H).setInteractive({ useHandCursor: true }); c.add(c.zone);
    c.zone.on('pointerdown', p => { if (this.state === 'wait') this.drag = { x0: p.x, id: p.id, moved: 0 }; });
    return c;
  }

  /* ---------- ลำดับของใบ ---------- */
  showCard() {
    const card = this.cur = this.cards[this.idx]; this.state = 'enter'; this.refreshStatus();
    const c = this.cardC = this.makeCard(card);
    c.setPosition(CARD.x, -240).setAlpha(0).setAngle(-6);
    this.setChoice(true); this.setNext(false); KG.audio.play('pop');
    this.tweens.add({ targets: c, y: CARD.y, alpha: 1, angle: 0, duration: 420, ease: 'Back.easeOut', onComplete: () => { this.state = 'wait'; this.cardStart = this.time.now; this.timeLeft = this.timeMax; if (this.mode === 'time') { this.timeBar.setValue(1, 0); } } });
  }
  onKey(e) {
    if (this.state === 'wait') { if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.decide('block'); else if (e.code === 'ArrowRight' || e.code === 'KeyD') this.decide('allow'); }
    else if (this.state === 'reveal' && (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter')) this.proceed();
  }
  onDrag(p) {
    if (!this.drag || this.state !== 'wait' || !this.cardC) return;
    const dx = KG.clamp((p.x - this.drag.x0) / KG.K, -380, 380); this.drag.moved = Math.max(this.drag.moved, Math.abs(dx));
    this.cardC.x = CARD.x + dx; this.cardC.angle = dx / 22; this.cardC.stampL.setAlpha(KG.clamp(-dx / 120, 0, 1)); this.cardC.stampR.setAlpha(KG.clamp(dx / 120, 0, 1));
  }
  onRelease() {
    if (!this.drag) return; const dx = this.cardC ? this.cardC.x - CARD.x : 0; this.drag = null;
    if (this.state !== 'wait' || !this.cardC) return;
    if (dx < -110) this.decide('block'); else if (dx > 110) this.decide('allow');
    else this.tweens.add({ targets: this.cardC, x: CARD.x, angle: 0, duration: 200, ease: 'Back.easeOut', onUpdate: () => { const d = this.cardC.x - CARD.x; this.cardC.stampL.setAlpha(KG.clamp(-d / 120, 0, 1)); this.cardC.stampR.setAlpha(KG.clamp(d / 120, 0, 1)); } });
  }

  /* ---------- ตัดสิน ---------- */
  decide(choice) {
    if (this.state !== 'wait') return;
    const card = this.cur, res = NP.judge(card, choice), c = this.cardC;
    if (this.tutorial && !res.ok) { this.tutorWrong(card); return; }
    this.state = 'resolve'; this.drag = null; this.setChoice(false);
    const frac = this.timeMax ? Math.max(0, this.timeLeft / this.timeMax) : 0.5;
    this.times.push((this.time.now - this.cardStart) / 1000);
    c.stampL.setAlpha(choice === 'block' ? 1 : 0); c.stampR.setAlpha(choice === 'allow' ? 1 : 0);
    if (res.ok) {
      this.right++; this.streak++; this.maxStreak = Math.max(this.maxStreak, this.streak); const gain = NP.points(this.streak - 1, frac); this.score += gain;
      KG.fx.pop(this, CARD.x, CARD.y - 120, '+' + gain, { color: '#ff7a1a', size: 44 });
    } else {
      this.streak = 0; this.missed.push(card); if (this.mode === 'time') this.lives--;
    }
    // ไรเดอร์และการ์ดตามทางที่เลือก
    if (choice === 'block') this.flyBlock(card, res);
    else if (choice === 'allow') this.flyAllow(card, res);
    else this.flyTimeout(card, res);
    this.time.delayedCall(res.ok ? 560 : 700, () => this.reveal(card, res, choice));
    this.afterTier(res.ok);
    this.refreshStatus();
  }
  flyBlock(card, res) {
    const c = this.cardC, tx = 250, ty = 520;
    this.tweens.add({ targets: c, x: tx + 40, y: ty, angle: -28, scaleX: 0.55, scaleY: 0.55, duration: 230, ease: 'Cubic.easeIn' });
    this.time.delayedCall(150, () => this.rider.attack(() => {
      this.shatter(c, card);
      if (!res.ok) { KG.audio.play('error'); KG.fx.pop(this, 280, 470, 'ของจริง!', { color: '#e0243d', size: 36 }); }
    }, 70));
    if (!res.ok) this.time.delayedCall(420, () => { KG.fx.shake(this, 160, 0.004); this.rider.hurt(); });
  }
  flyAllow(card, res) {
    const c = this.cardC;
    this.tweens.add({ targets: c, x: this.inbox.x, y: this.inbox.y + 6, angle: 14, scaleX: 0.3, scaleY: 0.3, duration: 300, ease: 'Cubic.easeIn', onComplete: () => {
      c.setVisible(false);
      if (res.ok) { KG.audio.play('good'); KG.fx.burst(this, this.inbox.x, this.inbox.y, { colors: [0x22b45a, 0xffd34f, 0xffffff], n: 22, max: 300, depth: 60 }); KG.fx.ring(this, this.inbox.x, this.inbox.y, 0x22b45a, { size: 3, w: 0.5, depth: 60 }); this.rider.cheer(); }
      else { KG.audio.play('error'); KG.fx.flash(this, 0xff4d5e, 160); KG.fx.shake(this, 260, 0.007); KG.fx.burst(this, this.inbox.x, this.inbox.y, { colors: [0xe0243d, 0x1b2a6b], n: 26, max: 320, depth: 60 }); this.rider.hurt(); }
    } });
  }
  flyTimeout(card, res) {
    const c = this.cardC; KG.audio.play('error'); KG.fx.flash(this, 0xff4d5e, 140);
    this.tweens.add({ targets: c, y: CARD.y + 40, alpha: 0.5, angle: 4, duration: 260 }); this.rider.hurt();
  }
  shatter(c, card) {
    KG.audio.play('hit'); KG.fx.burst(this, c.x, c.y, { tex: 'fx_square', colors: [Phaser.Display.Color.HexStringToColor(APP_COLOR[card.app]).color, 0xffffff, 0xffd34f], n: 30, max: 420, depth: 60, rot: true, g: 400, life: 700, add: false });
    KG.fx.ring(this, c.x, c.y, 0xff7a1a, { size: 3, w: 0.4, depth: 61 }); c.setVisible(false);
  }
  afterTier(ok) {
    const tier = NP.formTier(this.streak);
    if (ok && tier > this.tier) { this.tier = tier; this.time.delayedCall(260, () => { this.rider.setForm(tier, true); KG.banner(this, 'เปลี่ยนร่าง! ' + KG.FORMS[FORMS[tier]].name, '#ffffff', 0.8, 150); }); }
    else if (!ok && this.tier > 0) { this.tier = 0; this.rider.setForm(0, false); }
  }

  /* ---------- หน้าเฉลยเหตุผล ---------- */
  reveal(card, res, choice) {
    if (this.cardC) { this.cardC.destroy(); this.cardC = null; }
    this.state = 'reveal'; const ok = res.ok, W = 780, H = 320, col = ok ? '#22b45a' : '#e0243d', colInt = ok ? 0x22b45a : 0xe0243d;
    const r = this.revealC = this.add.container(CARD.x, CARD.y).setDepth(19);
    r.add(KG.ui.panel(this, -W / 2, -H / 2, W, H, { accent: col, accent2: ok ? '#7ae29a' : '#ff9aa3', cuts: [22, 0, 22, 0], fill: ok ? ['#ffffff', '#e9fbef'] : ['#ffffff', '#ffecee'] }));
    const circ = this.add.circle(-W / 2 + 70, -H / 2 + 76, 38, colInt).setStrokeStyle(4, 0x1b2a6b); r.add(circ);
    r.add(KG.ui.icon(this, ok ? 'check' : 'close', -W / 2 + 70, -H / 2 + 76, 38, 0xffffff));
    const title = ok ? (card.scam ? 'ปัดทิ้งถูกต้อง! นี่คืออันตราย' : 'ผ่านถูกต้อง! นี่ปลอดภัย') : (res.miss === 'passed' ? 'พลาด! นี่คืออันตราย' : res.miss === 'blocked' ? 'เสียของดี! อันนี้ปลอดภัยจริง' : 'หมดเวลา!');
    r.add(KG.txt(this, -W / 2 + 130, -H / 2 + 36, title, { size: 32, color: ok ? '#14803f' : '#c0152d' }));
    const why = KG.txt(this, -W / 2 + 130, -H / 2 + 86, card.why, { size: 23, weight: 400, color: '#1b2a6b', width: W - 170, lineSpacing: 7 }); r.add(why);
    // ชิปสัญญาณ
    let cx = -W / 2 + 40; const cy = H / 2 - 66;
    r.add(KG.txt(this, cx, cy - 30, card.scam ? 'สัญญาณเตือนที่เจอในใบนี้' : 'ทำไมถึงปลอดภัย', { size: 17, color: KG.SKIN.mute }));
    card.tags.forEach(t => { const ch = this.chip(cx, cy, CLUES[t], card.scam ? '#e0243d' : '#14803f', 20); r.add(ch); cx += ch.chipW + 12; });
    r.setAlpha(0).setScale(0.92); this.tweens.add({ targets: r, alpha: 1, scaleX: 1, scaleY: 1, duration: 220, ease: 'Back.easeOut' });
    if (ok) { KG.audio.play('stamp'); } this.refreshStatus();
    if (this.lives <= 0 && this.mode === 'time') { this.setNext(false); this.time.delayedCall(2200, () => this.finish(false)); return; }
    const manual = this.mode !== 'time';
    this.setNext(manual); this.nextBtn.setLabel(this.idx + 1 >= this.cards.length ? 'ดูสรุปผล' : 'ต่อไป'); if (manual) this.nextBtn.pulse();
    if (!manual) this.autoNext = this.time.delayedCall(2300, () => this.proceed());
    this.cardRes = res;
  }
  proceed() {
    if (this.state !== 'reveal') return; if (this.autoNext) { this.autoNext.remove(); this.autoNext = null; }
    this.tweens.killTweensOf(this.nextBtn); this.nextBtn.setScale(1);
    this.state = 'between'; this.setNext(false);
    const r = this.revealC; this.revealC = null; if (r) this.tweens.add({ targets: r, alpha: 0, y: CARD.y + 20, duration: 160, onComplete: () => r.destroy() });
    this.idx++; this.refreshStatus();
    if (this.idx >= this.cards.length) this.time.delayedCall(220, () => this.finish(true)); else this.time.delayedCall(240, () => this.showCard());
  }

  /* ---------- เริ่ม พัก จบ ---------- */
  showIntro() {
    const L = this.L;
    KG.ui.modal(this, { title: 'ด่าน ' + L.id + ' · ' + L.title, w: 800, accent: KG.C.sun, extraH: 160, body: L.desc,
      buttons: [{ label: 'กลับ', style: 'ghost', icon: 'chevL', onClick: () => this.leave() }, { label: 'เริ่มเลย!', style: 'primary', icon: 'play', pulse: true, onClick: () => this.start() }],
      build: (box, g) => {
        const y = g.top + 8;
        box.add(KG.txt(this, 0, y, this.cards.length + ' ใบ  ·  ' + (this.mode === 'time' ? 'ใบละ ' + this.timeMax + ' วินาที  ·  หัวใจ 3 ดวง' : 'โหมดฝึก ไม่จับเวลา'), { size: 24, color: KG.SKIN.hi, center: true, ox: 0.5 }));
        box.add(KG.txt(this, 0, y + 46, L.boss ? 'ด่านบอส: ไม่มีคำใบ้ ใช้ทุกสิ่งที่เรียนมา!' : 'สัญญาณที่ควรระวังในด่านนี้: ' + L.guide.map(t => CLUES[t]).join(' · '), { size: 21, weight: 400, color: KG.SKIN.body, center: true, ox: 0.5, width: 700 }));
      } });
  }
  start() { this.state = 'count'; KG.countdown(this, 'ตรวจเลย!', () => this.showCard()); }
  pause() {
    if (this.state !== 'wait' && this.state !== 'reveal') return; const back = this.state; this.state = 'pause'; this.pausedAt = this.time.now;
    KG.pauseMenu(this, { onExit: () => this.leave(), onRestart: () => this.go('Play', this._restartData), onResume: () => { this.cardStart += this.time.now - this.pausedAt; this.state = back; } });
  }
  update(time, delta) {
    if (this.state === 'wait' && this.timeMax > 0) {
      this.timeLeft = Math.max(0, this.timeLeft - Math.min(0.05, delta / 1000)); const f = this.timeLeft / this.timeMax;
      this.timeBar.setValue(f, 0); this.timeBar.setAlpha(f < 0.3 ? (Math.floor(time / 160) % 2 ? 0.55 : 1) : 1);
      this.timeTxt.setText(Math.ceil(this.timeLeft) + ' วินาที');
      if (this.timeLeft < 3 && Math.ceil(this.timeLeft) !== this.lastTick) { this.lastTick = Math.ceil(this.timeLeft); KG.audio.play('tick', { p: 1.4 }); }
      if (this.timeLeft <= 0) this.decide('timeout');
    }
  }
  finish(win) {
    if (this.state === 'done') return; this.state = 'done'; this.setChoice(false); this.setNext(false); if (this.tutor) { this.tutor.destroy(); this.tutor = null; }
    const total = this.cards.length, acc = NP.accuracy(this.right, win ? total : this.idx + 1), stars = NP.stars(win, acc);
    const best = SAVE.data.best[this.lv] || { score: 0 }, newBest = win && this.score > best.score;
    if (win) {
      if (stars > levelStars(this.lv)) SAVE.data.stars[this.lv] = stars;
      if (newBest) SAVE.data.best[this.lv] = { score: this.score, acc, combo: this.maxStreak };
      if (this.tutorial) SAVE.data.tutorDone = true; SAVE.save();
    }
    KG.audio.play(win ? 'fanfare' : 'lose'); if (win) { KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 200); this.rider.cheer(); }
    const avg = this.times.length ? (this.times.reduce((a, b) => a + b, 0) / this.times.length).toFixed(1) : '0.0', missBad = this.missed.filter(c => c.scam), missGood = this.missed.filter(c => !c.scam);
    const miss = missBad.length ? CLUES[NP.missedClues(missBad)[0]] : missGood.length ? 'ปัดทิ้งของจริง ดูแหล่งที่มา' : 'ไม่มี ตัดสินแม่นมาก';
    const nextOk = win && this.lv < LEVELS.length;
    this.time.delayedCall(win ? 800 : 300, () => KG.results(this, { stat: { lvl: String(this.lv), stars: win ? stars : 0, score: this.score, m: Math.max(0, (win ? total : this.idx + 1) - this.right), secs: Math.round((Date.now() - this._t0) / 1000) },
      win, stars, title: win ? (this.tutorial ? 'จบบทสอน!' : 'ผ่านด่าน ' + this.lv + '!') : 'หัวใจหมด', body: 'คะแนน ' + this.score + (newBest ? '  (สถิติใหม่!)' : ''),
      rows: [['ตัดสินถูก', this.right + ' / ' + (win ? total : this.idx + 1) + ' ใบ (' + acc + '%)'], ['คอมโบสูงสุด', 'x' + this.maxStreak], ['เวลาตัดสินเฉลี่ย', avg + ' วินาที'], ['สัญญาณที่ควรระวัง', miss]],
      tip: win ? 'จำไว้: หยุดคิดก่อนกดลิงก์ เช็กผู้ส่งและชื่อเว็บ และไม่บอกรหัสให้ใคร' : 'ไม่เป็นไร ลองโหมดฝึกเพื่ออ่านเหตุผลทีละใบ แล้วค่อยกลับมาท้าทายใหม่',
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { level: this.lv }) }, { label: win ? 'เล่นอีกครั้ง' : 'ลองใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Play', this._restartData) }]
        .concat(nextOk ? [{ label: 'ด่านถัดไป', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Play', { level: this.lv + 1, mode: SAVE.data.mode }) }] : [])
    }));
  }

  /* ---------- บทสอนเล่น (ด่าน 1) ---------- */
  tutorWrong(card) {
    KG.audio.play('error'); KG.fx.shake(this, 140, 0.004);
    KG.ui.toast(this, 'ลองดูอีกที ใบนี้ต้องกด "' + (card.scam ? 'ปัดทิ้ง' : 'ผ่าน') + '" นะ', { sfx: 'error' });
    this.tweens.add({ targets: this.cardC, x: CARD.x, angle: 0, duration: 200, ease: 'Back.easeOut' }); this.cardC.stampL.setAlpha(0); this.cardC.stampR.setAlpha(0); this.drag = null;
  }
  startTutor() {
    if (this.tutor) return; this.state = 'count';
    const R = { x: CARD.x - CARD.w / 2, y: CARD.y - CARD.h / 2, w: CARD.w, h: CARD.h };
    this.tutor = new KG.Tutor(this, [
      { text: 'ยินดีต้อนรับสู่ Net Patrol! โลกออนไลน์มีทั้งข้อความจริงและข้อความหลอก หน้าที่ของคุณคือตรวจทีละใบ แล้วตัดสินว่าต้อง "ปัดทิ้ง" หรือ "ผ่าน"', before: () => { this.showCard(); } },
      { text: 'แผงนี้บอกหัวใจ คอมโบ และตัวคูณคะแนน ตัดสินถูกติดกัน 3 ใบ ไรเดอร์จะเปลี่ยนร่าง ตัดสินผิดจะเสียหัวใจ (ในบทสอนไม่เสียนะ)', target: { x: 24, y: 84, w: 176, h: 300 }, pad: 4 },
      { text: 'นี่คือข้อความที่เข้ามา ดูผู้ส่ง เนื้อหา และลิงก์ให้ดี ใบนี้บอกว่าถูกรางวัลจากเบอร์แปลก พร้อมเร่งให้รีบกดลิงก์ น่าสงสัยไหมนะ', target: R, pad: 6, pos: 'bottom' },
      { text: 'รางวัลที่ไม่ได้สมัครรับ จากเบอร์แปลก และเร่งให้กดลิงก์ คือของหลอก! กดปุ่ม "ปัดทิ้ง" (หรือกดลูกศรซ้าย หรือปัดการ์ดไปทางซ้าย)', target: this.blockBtn, mode: 'wait', block: false, pos: 'top', until: () => this.state === 'reveal' && this.idx === 0 },
      { text: 'แผงนี้บอกเหตุผลและสัญญาณเตือนที่เจอ อ่านแล้วกด "ต่อไป" (หรือกด Enter)', target: { x: CARD.x - 390, y: CARD.y - 160, w: 780, h: 320 }, pad: 2, mode: 'wait', block: false, compact: true, dim: false, at: { y: 452 }, until: () => this.state === 'between' || this.state === 'enter' || this.idx >= 1 },
      { text: 'ใบนี้มาจากครูที่เรารู้จักจริง เรื่องตรงกับตารางเรียน ไม่ขอรหัสและไม่มีลิงก์แปลก คือของปลอดภัย กด "ผ่าน" (หรือลูกศรขวา)', target: this.allowBtn, mode: 'wait', block: false, pos: 'top', until: () => this.idx >= 1 && this.state === 'reveal' },
      { text: 'เยี่ยม! อ่านเหตุผลแล้วกด "ต่อไป" เพื่อไปใบสุดท้าย', mode: 'wait', block: false, target: { x: CARD.x - 390, y: CARD.y - 160, w: 780, h: 320 }, pad: 2, compact: true, dim: false, at: { y: 452 }, until: () => this.idx >= 2 },
      { text: 'ใบนี้ขอรหัส OTP ซึ่งเป็นกุญแจลับ ห้ามให้ใครเด็ดขาด แม้จะอ้างว่าเป็นธนาคาร ปัดทิ้งเลย!', target: this.blockBtn, mode: 'wait', block: false, pos: 'top', until: () => this.state === 'done' || (this.idx === 2 && this.state === 'reveal') },
      { text: 'ครบแล้ว! ในด่านจริงถ้าเลือกโหมดท้าทายจะมีเวลาต่อใบและหัวใจ 3 ดวง ส่วนโหมดฝึกไม่จับเวลา ลุยกันเลย!' }
    ], { hero: 'h0', onDone: () => { this.tutor = null; if (this.state === 'reveal' && this.idx === 2) { /* ให้ผู้เล่นกดต่อไปเพื่อดูสรุปเอง */ } } });
  }
}
