/* ===== ฉากพิมพ์: คำขึ้นกลางจอ พิมพ์ตาม เมื่อถูกทั้งคำปุ่ม ENTER กะพริบเขียว กด Enter เพื่อยืนยัน (สไตล์เกมจังหวะ) =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y8-70 · ป้ายคำ y90-290 · ช่องพิมพ์ y304-376 + ปุ่ม ENTER · แถบบทสอนแคบ y384-440 · แป้นพิมพ์ y448-698 */
const PY = { CARD: { x: 150, y: 90, w: 980, h: 200 }, INPUT: { x: 180, y: 304, w: 700, h: 72 }, ENTER: { x: 910, y: 304, w: 220, h: 72 }, KB: { x: 190, y: 448 } };
const COMBO_COLORS = [0x4ef4d2, 0x4ef4d2, 0xff3d8b, 0xffd34f, 0xffffff];   // สีไฟตามช่วงคอมโบ
const HID = 'h0';

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.course = data.course || null;   // โหมดหัดพิมพ์สัมผัส { lesson (นับจาก 0), stage 1–4 }
    this.lv = this.course ? 0 : (data.level || 1); this.lang = data.lang || SAVE.data.lang; this.mode = (this.lv === 1 || this.course) ? 'free' : (data.mode || SAVE.data.mode);
    this.tutorial = this.lv === 1; this._restartData = this.course ? { course: this.course, lang: this.lang } : { level: this.lv, lang: this.lang, mode: data.mode || SAVE.data.mode, tutor: data.tutor };
    this._modal = null; this.vShift = false; this.handG = null; this.handLab = null; this._enterAction = null;
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music('groove');
    if (this.course) {
      const C = this.course, CLs = CL[this.lang][C.lesson], S = TY_COURSE.stageOf(this.lang, C.lesson, C.stage);
      this.words = TY_COURSE.deck(this.lang, C.lesson, C.stage, (Date.now() % 100000) + 1); this.blind = !!S.blind; this.targetWpm = TY_COURSE.targetWpm(this.lang, C.lesson);
      this.L = { id: 0, title: (CLs.final ? '' : 'บทที่ ' + (C.lesson + 1) + ' · ') + CLs.title, desc: CLs.tip, n: this.words.length };
    } else { this.blind = false; this.L = LEVELS[this.lv - 1]; this.words = TY.deck(this.lang, this.lv); }
    const L = this.L; this.idx = 0; this.target = this.words[0]; this.typed = ''; this.ready = false; this.readyAt = 0;
    this.score = 0; this.combo = 0; this.maxCombo = 0; this.hits = 0; this.misses = 0; this.wordMiss = 0; this.wordStart = 0; this.errKeys = {}; this.backs = 0; this.charsDone = 0; this.perfects = 0; this.elapsed = 0;
    this.timeLimit = this.mode === 'time' ? TY.timeLimit(this.lang, this.lv, this.words) : 0; this.timeLeft = this.timeLimit;
    this.state = 'intro'; this._modal = null; this.caps = false; this.tutor = null; this.wordObjs = []; this.lastTick = 0; this.beatN = 0;
    this.buildBackground(); this.buildHud(); this.buildCard(); this.buildInput(); this.buildEnter(); this.buildHero(); this.buildKeyboard(); this.buildSide();
    this.kb.onTap = code => this.tapKey(code); if (this.blind) this.kb.setBlind(true);
    if (this.course && !this.blind) this.buildHands();
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.input.keyboard.on('keyup', e => { if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && this.kb) this.kb.setShiftHeld(this.vShift); });   // ปล่อย Shift: ปุ่มเด้งกลับ ตัวอักษรบนปุ่มกลับเป็นตัวปกติ
    this.loadWord(0, true);
    if (this.tutorial) this.time.delayedCall(500, () => this.startTutor()); else if (this.course) this.courseIntro(); else this.showIntro();
  }
  onEscape() {
    if (this._modal && !this._modal.closed) { if (this.state === 'pause') { this._modal.close(); this.state = 'play'; } else if (this.state === 'intro' || this.state === 'done') { this._modal.close(); this.leave(); } return; }
    if (this.state === 'play') this.pause();
  }
  leave() { if (this.course) this.go('Course', { lang: this.lang, lesson: this.course.lesson, stage: this.course.stage }); else this.go('Select', { level: this.lv }); }

  /* ---------- ฉากหลังแบบไฮเวย์ ไฟเวที ---------- */
  buildBackground() {
    const arena = ['thunder', 'nature', 'fire', 'ice'][(this.course ? this.course.lesson : this.lv - 1) % 4];
    this.add.image(GW / 2, GH / 2, 'arena_' + arena).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'typlay', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(4,6,22,.9)'], [0.55, 'rgba(4,6,22,.78)'], [1, 'rgba(4,6,22,.95)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);
    this.hw = this.add.graphics().setDepth(1); this.hwOff = 0;
    const beam = KG.tex(this, 'tybeam', 140, 720, ctx => { const g = ctx.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(80, 0); ctx.lineTo(140, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill(); });
    this.beams = [[40, -10, 0.3, 0x4ef4d2], [GW - 40, -10, -0.3, 0xff3d8b], [GW / 2, -30, 0, 0xffd34f]].map((b, i) => {
      const im = this.add.image(b[0], b[1], beam).setOrigin(0.5, 0).setBlendMode('ADD').setTint(b[3]).setAlpha(0.12).setDepth(2).setScale(i === 2 ? 1.6 : 1.2, 1); im.baseA = b[2]; im.setRotation(b[2]);
      this.tweens.add({ targets: im, rotation: b[2] + (i % 2 ? -0.35 : 0.35), duration: 3200 + i * 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); return im;
    });
    this.pulse = this.add.image(GW / 2, 200, 'fx_glow').setTint(0xffd34f).setBlendMode('ADD').setDisplaySize(1200, 700).setAlpha(0).setDepth(2);
    this.embers = this.add.particles(0, GH + 10, 'fx_spark', { x: { min: 0, max: GW }, speedY: { min: -260, max: -120 }, speedX: { min: -30, max: 30 }, scale: { start: 0.5, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 1700, frequency: 40, tint: [0xff7a59, 0xffd34f, 0xff3d8b], blendMode: 'ADD', emitting: false }).setDepth(3);
    this.time.addEvent({ delay: Math.round(60000 / 114), loop: true, callback: () => this.onBeat() });
  }
  onBeat() {
    if (this.state !== 'play') return; this.beatN++;
    const lvl = this.comboLevel(); this.pulse.setTint(COMBO_COLORS[lvl]).setAlpha(0.1 + lvl * 0.05); this.tweens.add({ targets: this.pulse, alpha: 0, duration: 380 });
    this.beams.forEach(b => b.setTint(COMBO_COLORS[(lvl + this.beatN) % COMBO_COLORS.length]).setAlpha(0.1 + lvl * 0.06));
  }
  comboLevel() { return this.combo >= 20 ? 4 : this.combo >= 10 ? 3 : this.combo >= 5 ? 2 : this.combo >= 2 ? 1 : 0; }
  drawHighway(dt) {
    const g = this.hw, lvl = this.comboLevel(), col = COMBO_COLORS[lvl], vx = GW / 2, vy = 78, by = 444;
    this.hwOff = (this.hwOff + dt * (0.35 + this.combo * 0.04)) % 1; g.clear();
    for (let i = -9; i <= 9; i++) { g.lineStyle(2, col, 0.16); g.beginPath(); g.moveTo(vx + i * 22, vy); g.lineTo(vx + i * 150, by); g.strokePath(); }
    for (let k = 0; k < 14; k++) { const t = Math.pow((k + this.hwOff) / 14, 2.2), y = vy + t * (by - vy), half = 22 * 9 + t * (150 - 22) * 9; g.lineStyle(2, col, 0.05 + t * 0.2); g.beginPath(); g.moveTo(vx - half, y); g.lineTo(vx + half, y); g.strokePath(); }
  }

  /* ---------- HUD ---------- */
  buildHud() {
    const L = this.L;
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52, depth: 30 });
    this.txt(100, 6, (this.course ? 'หัดพิมพ์สัมผัส · ด่าน ' + this.course.stage + ' ' + TY_COURSE.stageOf(this.lang, this.course.lesson, this.course.stage).name : this.tutorial ? 'บทสอน' : 'ด่าน ' + L.id) + ' · ' + LANG_NAME[this.lang], { size: 18, color: this.blind ? '#ff9ac8' : '#ffd34f' }).setDepth(30);
    const tt = this.txt(100, 26, L.title, { size: 30, stroke: true }).setDepth(30); if (this.course) tt.setScale(Math.min(1, 380 / tt.width));   // ชื่อบทยาว: ย่อไม่ให้ทับข้อความเวลาตรงกลาง
    this.timeBar = KG.ui.bar(this, 470, 26, 340, 18, { value: 1, color: KG.C.green, edge: KG.C.green }); this.timeBar.setDepth(30);
    this.timeTxt = this.txt(640, 58, '', { size: 20, color: '#ffffff', center: true, ox: 0.5, stroke: true }).setDepth(30);
    this.txt(1032, 4, 'คะแนน', { size: 15, color: '#9fb0d8', ox: 1 }).setDepth(30);
    this.scoreTxt = this.txt(1032, 18, '0', { size: 36, color: '#ffffff', stroke: true, ox: 1 }).setDepth(30);
    addSystemButtons(this, 1084, 40, 0, ['sfx']).forEach(b => b.setDepth(30));
    iconButton(this, 1148, 40, 'expand', () => { if (this.state === 'play' && KG.canPopOut()) { this.state = 'pause'; KG.fullscreen(() => { this.state = 'play'; }); } else KG.fullscreen(); }, { w: 60, h: 52, depth: 30 });   // ฝังใน Sites: หยุดเกมระหว่างเปิดหน้าต่างแนะนำเต็มจอ
    iconButton(this, 1218, 40, 'pause', () => this.pause(), { w: 60, h: 52, depth: 30 });
    if (this.mode !== 'time') { this.timeBar.setVisible(false); this.timeTxt.setPosition(this.course ? 700 : 640, 36).setText(this.tutorial ? 'บทสอน ไม่จับเวลา' : this.course ? (this.blind ? 'ไม่ดูแป้น · เป้า ' + this.targetWpm + ' คำ/นาที' : 'เน้นแม่นยำ ไม่จับเวลา') : 'โหมดไม่จับเวลา'); }
    this.capsTxt = this.txt(640, 392, 'Caps Lock เปิดอยู่', { size: 22, color: '#ff7a8a', center: true, ox: 0.5, stroke: true }).setDepth(40).setVisible(false);
  }
  buildSide() {
    this.txt(1210, 100, 'คำ/นาที', { size: 15, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(30); this.wpmTxt = this.txt(1210, 116, '0', { size: 36, color: '#4ef4d2', center: true, ox: 0.5, stroke: true }).setDepth(30);
    this.txt(1210, 170, 'แม่นยำ', { size: 15, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(30); this.accTxt = this.txt(1210, 186, '100%', { size: 32, color: '#ffd34f', center: true, ox: 0.5, stroke: true }).setDepth(30);
    this.txt(1210, 238, 'คำที่เหลือ', { size: 15, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(30); this.leftTxt = this.txt(1210, 254, '', { size: 30, color: '#ffffff', center: true, ox: 0.5, stroke: true }).setDepth(30);
    this.comboLab = this.txt(70, 100, 'COMBO', { size: 18, color: '#ff9ac8', center: true, ox: 0.5 }).setDepth(30);
    this.comboTxt = this.txt(70, 134, '0', { size: 64, color: '#ffffff', center: true, ox: 0.5, stroke: true, sw: 8 }).setDepth(30);
    this.flame = this.add.particles(70, 190, 'fx_spark', { speedY: { min: -140, max: -60 }, speedX: { min: -24, max: 24 }, scale: { start: 0.6, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 700, frequency: 60, tint: [0xff7a59, 0xffd34f], blendMode: 'ADD', emitting: false }).setDepth(29);
    this.time.addEvent({ delay: 250, loop: true, callback: () => this.refreshStats() });
    this.refreshStats();
  }
  refreshStats() {
    const ms = this.elapsed * 1000; this.wpmTxt.setText(String(TY.wpm(this.hits, ms)));
    this.accTxt.setText(TY.accuracy(this.hits, this.misses) + '%'); this.leftTxt.setText(String(this.words.length - this.idx));
  }

  /* ---------- ป้ายคำ ช่องพิมพ์ ปุ่ม ENTER ---------- */
  buildCard() {
    const C = PY.CARD;
    KG.ui.panel(this, C.x, C.y, C.w, C.h, { accent: '#ffd34f', cuts: [26, 0, 26, 0], fill: ['#161f66', '#080d2c'] }).setDepth(10);
    this.cardGlow = this.add.graphics().setDepth(11);
    this.counterTxt = this.txt(C.x + 22, C.y + 12, '', { size: 18, color: '#ffd34f' }).setDepth(12);
    this.langTag = this.txt(C.x + C.w - 22, C.y + 12, LANG_NAME[this.lang], { size: 18, color: '#9fb0d8', ox: 1 }).setDepth(12);
    this.meaningTxt = this.txt(C.x + C.w / 2, C.y + C.h - 40, '', { size: 24, weight: 400, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(12);
    this.wcaret = this.add.graphics().setDepth(12);
    this.drawCardGlow();
  }
  drawCardGlow() {
    const C = PY.CARD, col = COMBO_COLORS[this.comboLevel()], g = this.cardGlow; g.clear();
    g.lineStyle(5, col, 0.9); g.strokeRect(C.x + 2, C.y + 2, C.w - 4, C.h - 4); g.lineStyle(14, col, 0.18); g.strokeRect(C.x - 3, C.y - 3, C.w + 6, C.h + 6);
  }
  buildInput() {
    const I = PY.INPUT;
    KG.ui.panel(this, I.x, I.y, I.w, I.h, { accent: '#4ef4d2', cuts: [16, 0, 16, 0], fill: ['#0b1450', '#060a24'] }).setDepth(10);
    this.inOk = this.txt(I.x + 26, I.y + I.h / 2, '', { size: 38, color: '#9bffc0', oy: 0.5 }).setDepth(12);
    this.inBad = this.txt(I.x + 26, I.y + I.h / 2, '', { size: 38, color: '#ff6b7b', oy: 0.5 }).setDepth(12);
    this.inHint = this.txt(I.x + 26, I.y + I.h / 2, 'พิมพ์ตามคำด้านบน…', { size: 26, weight: 400, color: '#5a6bb8', oy: 0.5 }).setDepth(12);
    this.inCaret = this.add.rectangle(I.x + 26, I.y + I.h / 2, 3, 44, 0x4ef4d2).setDepth(12); this.tweens.add({ targets: this.inCaret, alpha: 0.1, duration: 450, yoyo: true, repeat: -1 });
  }
  buildEnter() {
    const E = PY.ENTER, cx = E.x + E.w / 2, cy = E.y + E.h / 2;
    this.enterRoot = this.add.container(cx, cy).setDepth(14);
    this.enterGlow = this.add.image(0, 0, 'fx_glow').setTint(0x5ef08a).setBlendMode('ADD').setDisplaySize(E.w * 2.4, E.h * 4).setAlpha(0);
    this.enterFace = this.add.image(0, 3, keyFace(this, E.w, E.h, 'idle')).setDisplaySize(E.w + 12, E.h + 16);
    this.enterLab = KG.txt(this, 0, -8, 'ENTER', { size: 34, color: '#7b9c86', center: true, middle: true });
    this.enterSub = KG.txt(this, 0, 18, 'กดยืนยัน', { size: 16, weight: 400, color: '#5f7a69', center: true, middle: true });
    this.enterRoot.add([this.enterGlow, this.enterFace, this.enterLab, this.enterSub]);
    this.enterCall = this.txt(cx, E.y - 20, 'กด ENTER!', { size: 24, color: '#9bffc0', center: true, ox: 0.5, stroke: true }).setDepth(15).setVisible(false);
    this.enterEm = this.add.particles(cx, cy + E.h / 2, 'fx_spark', { x: { min: -E.w / 2, max: E.w / 2 }, speedY: { min: -170, max: -70 }, scale: { start: 0.5, end: 0 }, alpha: { start: 0.95, end: 0 }, lifespan: 750, frequency: 40, tint: [0x5ef08a, 0xc8ffd8, 0xffffff], blendMode: 'ADD', emitting: false }).setDepth(15);
  }
  setReady(on) {
    if (on === this.ready && (this._enterTw || !on)) return;
    this.ready = on; const E = PY.ENTER, cx = E.x + E.w / 2, cy = E.y + E.h / 2;
    ['_enterTw', '_enterFlash', '_enterRing'].forEach(k => { if (this[k]) { this[k].remove ? this[k].remove() : this[k].destroy(); this[k] = null; } });
    this.tweens.killTweensOf(this.enterRoot); this.enterRoot.setScale(1);
    if (!on) {
      this.enterFace.setTexture(keyFace(this, E.w, E.h, 'idle')); this.enterLab.setColor('#7b9c86'); this.enterSub.setColor('#5f7a69'); this.enterGlow.setAlpha(0); this.enterCall.setVisible(false); this.enterEm.stop(); this.kb && this.kb.clearHint(); return;
    }
    this.readyAt = this.time.now; KG.audio.play('ready');
    let flip = false; this.enterLab.setColor('#04210f'); this.enterSub.setColor('#0a4a22'); this.enterCall.setVisible(true); this.enterEm.start();
    const flash = () => { flip = !flip; this.enterFace.setTexture(keyFace(this, E.w, E.h, flip ? 'enter2' : 'enter')); this.enterGlow.setAlpha(flip ? 1 : 0.55); this.enterCall.setAlpha(flip ? 1 : 0.55); };
    flash(); this._enterFlash = this.time.addEvent({ delay: 150, loop: true, callback: flash });
    this._enterTw = this.tweens.add({ targets: this.enterRoot, scaleX: 1.07, scaleY: 1.07, duration: 230, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this._enterRing = this.time.addEvent({ delay: 380, loop: true, callback: () => KG.fx.ring(this, cx, cy, 0x5ef08a, { size: 2.4, w: 0.55, depth: 16 }) });
    KG.fx.ring(this, cx, cy, 0xffffff, { size: 3.2, w: 0.5, depth: 16 }); KG.fx.burst(this, cx, cy, { colors: [0x5ef08a, 0xffffff], n: 18, max: 300, depth: 16 });
    if (!this.blind) this.kb.hint(['Enter']);
  }

  /* ---------- ฮีโร่และแป้นพิมพ์ ---------- */
  buildHero() {
    this.heroShadow = this.add.ellipse(84, 432, 90, 14, 0x000000, 0.45).setDepth(8);
    this.hero = KG.art.make(this, 84, 430, HID, 'idle', 112).setDepth(9); this.heroY = this.hero.y;
    this.tweens.add({ targets: this.hero, scaleY: this.hero.scaleY * 1.02, scaleX: this.hero.scaleX * 0.992, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  heroPose(name, ms) { KG.art.frame(this.hero, name); if (this._hp) this._hp.remove(); this._hp = this.time.delayedCall(ms || 220, () => KG.art.frame(this.hero, 'idle')); }
  buildKeyboard() { this.kb = new OnScreenKeyboard(this, PY.KB.x, PY.KB.y, this.lang); this.kb.root.setDepth(20); }

  /* ---------- โหลดคำ ---------- */
  loadWord(i, first) {
    this.idx = i; this.target = this.words[i]; this.typed = ''; this.wordMiss = 0; this.wordStart = this.time.now; this.setReady(false);
    const C = PY.CARD, t = this.target, size = t.length <= 8 ? 104 : t.length <= 14 ? 84 : t.length <= 22 ? 64 : 50;
    this.wordObjs.forEach(o => o.destroy()); this.wordObjs = [];
    const base = KG.txt(this, 0, C.y + 94, t, { size, color: '#ffffff', oy: 0.5, stroke: true, sw: 8 }).setDepth(12), done = KG.txt(this, 0, C.y + 94, '', { size, color: '#4ef4d2', oy: 0.5, stroke: true, sw: 8 }).setDepth(13);
    const sc = Math.min(1, 900 / base.width), x0 = C.x + C.w / 2 - base.width * sc / 2;
    base.setScale(sc).setX(x0); done.setScale(sc).setX(x0); this.wordObjs.push(base, done);
    this.wordBase = base; this.wordDone = done; this.wordFont = '600 ' + size + 'px Kanit'; this.wordSc = sc; this.wordX0 = x0; this.wordSize = size;
    if (!first) { base.setAlpha(0).setScale(sc * 1.25); this.tweens.add({ targets: base, alpha: 1, scaleX: sc, scaleY: sc, duration: 260, ease: 'Back.easeOut' }); }
    this.meaningTxt.setText(this.lang === 'en' && TY_DATA_M(t) ? 'แปลว่า ' + TY_DATA_M(t) : '');
    this.counterTxt.setText((this.course ? 'ชุดที่ ' : 'คำที่ ') + (i + 1) + ' / ' + this.words.length);
    this.updateInput(); this.updateWord(); this.refreshStats();
  }
  updateWord() {
    const t = this.target, p = TY.lcp(t, this.typed), C = PY.CARD;
    this.wordDone.setText(t.slice(0, p));
    const g = this.wcaret; g.clear();
    if (p < t.length) {
      const px = this.wordX0 + KG.measure(t.slice(0, p), this.wordFont) * this.wordSc, w = Math.max(14, KG.measure(t[p], this.wordFont) * this.wordSc), bad = this.typed.length > p;
      g.fillStyle(bad ? 0xff4d5e : 0xffd34f, 1); g.fillRect(px, C.y + 94 + this.wordSize * 0.6 * this.wordSc, w, 6);
      g.fillStyle(bad ? 0xff4d5e : 0xffd34f, 0.25); g.fillRect(px - 2, C.y + 94 + this.wordSize * 0.6 * this.wordSc - 2, w + 4, 10);
    }
    const nk = TY.nextKey(this.lang, t, this.typed);
    if (this.kb && !this.ready && !this.blind) { const codes = []; if (nk) { codes.push(nk.code); if (nk.shift) codes.push(TY.shiftFor(nk.code)); } this.kb.hint(codes); }
    if (this.handG) this.updateHands(this.ready ? { code: 'Enter' } : nk);
  }
  updateInput() {
    const I = PY.INPUT, p = TY.lcp(this.target, this.typed), ok = this.typed.slice(0, p), bad = this.typed.slice(p);
    this.inOk.setText(ok); this.inBad.setText(bad); this.inBad.setX(I.x + 26 + (ok ? this.inOk.width - 4 : 0)); this.inHint.setVisible(!this.typed.length);
    this.inCaret.setX(I.x + 26 + (this.typed.length ? this.inOk.width + (bad ? this.inBad.width : 0) - 4 : 0) + 6);
    this.inOk.setColor(this.ready ? '#c8ffd8' : '#9bffc0');
  }

  /* ---------- การพิมพ์ ---------- */
  onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // คีย์ลัดในหน้าต่าง: Enter (หรือ Space) = ปุ่มหลัก (เริ่ม / ด่านถัดไป / เล่นต่อ) · R = เล่นด่านนี้ใหม่ · Q = ออก · Esc อยู่ที่ onEscape
    if (this._modal && !this._modal.closed && !e.repeat && (this.state === 'intro' || this.state === 'done' || this.state === 'pause')) {
      const c = e.code, enter = c === 'Enter' || c === 'NumpadEnter' || c === 'Space';
      if (this.state === 'pause') { if (enter) { e.preventDefault(); this._modal.close(); this.state = 'play'; } else if (c === 'KeyR') { this._modal.close(); this.go('Play', this._restartData); } else if (c === 'KeyQ') { this._modal.close(); this.leave(); } return; }
      if (this.state === 'intro' && this._modeChoice) { const m = enter ? this.mode : (c === 'Digit1' || c === 'Numpad1' || c === 'KeyT') ? 'time' : (c === 'Digit2' || c === 'Numpad2' || c === 'KeyF') ? 'free' : null; if (m) { e.preventDefault(); this._modal.close(); this.startMode(m); } return; }
      if (enter) { e.preventDefault(); const f = this.state === 'intro' ? (() => this.countdown()) : this._enterAction; if (f) { this._modal.close(); this._enterAction = null; f(); } return; }
      if (c === 'KeyR' && this.state === 'done') { this._modal.close(); this.go('Play', this._restartData); }
      return;
    }
    if (this.state !== 'play') return;
    const code = e.code; if (!code) return;
    if (e.getModifierState) { const caps = e.getModifierState('CapsLock'); if (caps !== this.caps) { this.caps = caps; this.capsTxt.setVisible(caps && this.lang === 'en'); this.kb.setCapsLed(caps); if (caps) KG.audio.play('capsOn'); } }
    if (code === 'ShiftLeft' || code === 'ShiftRight') { if (!e.repeat) { KG.audio.play('shift'); this.kb.setShiftHeld(true); this.kb.press(code); } e.preventDefault(); return; }
    this.kb.setShiftHeld(!!e.shiftKey || this.vShift);   // เผื่อปล่อย Shift ตอนอยู่นอกหน้าต่างเกม
    if (code === 'CapsLock' || code === 'Tab' || code.indexOf('Arrow') === 0) { e.preventDefault(); return; }
    if (code === 'Backspace') { e.preventDefault(); this.backspace(); return; }
    if (code === 'Enter' || code === 'NumpadEnter') { e.preventDefault(); if (!e.repeat) this.pressEnter(); return; }
    const ch = TY.charFor(this.lang, code, e.shiftKey, this.caps); if (ch == null) return;
    e.preventDefault(); if (e.repeat) return;
    this.typeChar(ch, code);
  }
  // แตะปุ่มบนแป้นพิมพ์จำลอง: ทำงานเหมือนกดปุ่มจริง (Shift/Caps แตะครั้งเดียวค้างไว้ Shift ปล่อยเองหลังพิมพ์หนึ่งตัว)
  tapKey(code) {
    if (this.state !== 'play') return; KG.audio.resume();
    if (code === 'ShiftLeft' || code === 'ShiftRight') { this.vShift = !this.vShift; KG.audio.play('shift'); this.kb.press(code); this.kb.setLatch(['ShiftLeft', 'ShiftRight'], this.vShift); return; }
    if (code === 'CapsLock') { this.caps = !this.caps; this.capsTxt.setVisible(this.caps && this.lang === 'en'); KG.audio.play(this.caps ? 'capsOn' : 'tap'); this.kb.setLatch(['CapsLock'], this.caps); return; }
    if (code === 'Tab') { this.kb.press(code); return; }
    if (code === 'Backspace') { this.backspace(); return; }
    if (code === 'Enter') { this.pressEnter(); return; }
    const ch = TY.charFor(this.lang, code, this.vShift, this.caps); if (ch == null) return;
    this.typeChar(ch, code);
    if (this.vShift) { this.vShift = false; this.kb.setLatch(['ShiftLeft', 'ShiftRight'], false); }
  }
  keyIndex(code) { for (let r = 0; r < TY.ROWS.length; r++) { const c = TY.ROWS[r].findIndex(k => k[0] === code); if (c >= 0) return c + r * 2; } return 0; }
  typeChar(ch, code) {
    if (this.typed.length >= this.target.length + 8) { KG.audio.play('denied'); return; }
    this.typed += ch; const p = TY.lcp(this.target, this.typed), good = p === this.typed.length;
    if (good) {
      this.hits++; this.afterGood(ch, code);
    } else {
      this.misses++; this.wordMiss++; this.errKeys[this.target[Math.min(p, this.target.length - 1)]] = (this.errKeys[this.target[Math.min(p, this.target.length - 1)]] || 0) + 1;
      if (this.combo > 1) this.banner('คอมโบขาด!', '#ff7a8a', 0.8); this.combo = 0; this.setCombo(false);
      if (ch === ' ') KG.audio.play('wrong'); else KG.audio.play('wrong');
      this.kb.press(code, false); KG.fx.shake(this, 120, 0.003); KG.fx.flash(this, 0xff4d5e, 90);
      this.tweens.add({ targets: [this.inBad, this.inOk], x: '+=6', duration: 40, yoyo: true, repeat: 2 }); this.heroPose('hurt', 260);
    }
    this.setReady(good && this.typed === this.target);
    this.updateInput(); this.updateWord();
  }
  afterGood(ch, code) {
    const i = this.keyIndex(code);
    if (ch === ' ') KG.audio.play('space'); else KG.audio.play('type', { i });
    this.kb.press(code, true);
    // ตัวอักษรบินจากปุ่มเข้าช่องพิมพ์
    const kp = this.kb.world(code), I = PY.INPUT, color = TY.fingerColor(code);
    const tx = I.x + 26 + this.inOk.width + 8, ty = I.y + I.h / 2;
    if (ch !== ' ') {
      const f = KG.txt(this, kp.x, kp.y, ch, { size: 40, color: '#' + color.toString(16).padStart(6, '0'), center: true, middle: true, stroke: true }).setDepth(40);
      this.tweens.add({ targets: f, x: tx, y: ty, scaleX: 1.5, scaleY: 1.5, alpha: 0.2, duration: 220, ease: 'Cubic.easeIn', onComplete: () => { f.destroy(); KG.fx.burst(this, tx, ty, { colors: [color, 0xffffff], n: 7, max: 160, depth: 41 }); } });
    }
    // ประกายที่ตัวอักษรในป้ายคำ
    const p = TY.lcp(this.target, this.typed), wx = this.wordX0 + KG.measure(this.target.slice(0, p), this.wordFont) * this.wordSc, wy = PY.CARD.y + 94;
    KG.fx.burst(this, wx, wy, { colors: [0x4ef4d2, 0xffffff, color], n: 10, max: 230, depth: 41 });
    this.tweens.add({ targets: this.hero, y: this.heroY - 10, duration: 70, yoyo: true }); KG.art.frame(this.hero, 'w' + (1 + (this.typed.length % 6))); this.time.delayedCall(180, () => KG.art.frame(this.hero, 'idle'));
  }
  backspace() {
    if (!this.typed.length) { KG.audio.play('denied'); this.kb.press('Backspace'); return; }
    const wasBad = this.typed.length > TY.lcp(this.target, this.typed); this.typed = this.typed.slice(0, -1); this.backs++;
    KG.audio.play('back'); this.kb.press('Backspace');
    const I = PY.INPUT; KG.fx.burst(this, I.x + 26 + this.inOk.width + this.inBad.width, I.y + I.h / 2, { colors: wasBad ? [0xff6b7b, 0xffffff] : [0x9fb0d8, 0xffffff], n: 8, max: 160, depth: 41, a0: 120, a1: 240 });
    this.setReady(this.typed === this.target); this.updateInput(); this.updateWord();
  }
  pressEnter() {
    this.kb.press('Enter', this.ready ? true : undefined);
    if (!this.ready) {
      KG.audio.play('denied'); KG.fx.shake(this, 100, 0.003); this.tweens.add({ targets: this.enterRoot, x: this.enterRoot.x + 8, duration: 40, yoyo: true, repeat: 3 });
      if (this.typed.length) { const t = KG.ui.toast(this, this.typed === '' ? '' : 'ยังพิมพ์ไม่ครบหรือยังมีตัวที่ผิดอยู่', { ms: 900, accent: '#ff4d5e', sfx: 'tick' }); }
      return;
    }
    this.acceptWord();
  }

  /* ---------- ยืนยันคำ: เอฟเฟกต์เต็มระบบ ---------- */
  acceptWord() {
    const t = this.target, len = t.length, ms = this.time.now - this.wordStart, since = this.time.now - this.readyAt, perfect = this.wordMiss === 0;
    if (perfect) { this.combo++; this.perfects++; } else this.combo = Math.max(0, this.combo);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    let pts = TY.wordScore(len, ms, this.combo, perfect); const grade = since < 450 && perfect ? 'PERFECT!' : (perfect ? 'GREAT!' : 'GOOD');
    if (grade === 'PERFECT!') pts += 30; this.score += pts; this.scoreTxt.setText(String(this.score)); this.charsDone += len;
    this.state = 'between'; const E = PY.ENTER, cx = PY.CARD.x + PY.CARD.w / 2, cy = PY.CARD.y + 94;
    KG.audio.play('enterOk', { combo: this.combo }); if (grade === 'PERFECT!') KG.audio.play('perfect');
    this.setReady(false);
    // ระเบิดคำ: ตัวอักษรกระเด็นออกเป็นชิ้น
    // แยกเป็นกลุ่มตัวอักษร (พยัญชนะพร้อมสระบน/ล่างและวรรณยุกต์ที่ซ้อนอยู่) ไม่ให้เครื่องหมายหลุดออกมาลอยเดี่ยว ๆ
    let pre = ''; (t.match(/.[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]*/gu) || []).forEach((chr, k) => {
      const before = pre; pre += chr; if (chr === ' ') return;
      const px = this.wordX0 + (KG.measure(before, this.wordFont) + KG.measure(chr, this.wordFont) / 2) * this.wordSc;
      const f = KG.txt(this, px, cy, chr, { size: this.wordSize * this.wordSc, color: '#7ffbe7', center: true, middle: true, stroke: true, sw: 8 }).setDepth(45);
      const ang = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-80, 80)), d = Phaser.Math.Between(180, 420);
      this.tweens.add({ targets: f, x: px + Math.cos(ang) * d, y: cy + Math.sin(ang) * d + 120, angle: Phaser.Math.Between(-360, 360), alpha: 0, scaleX: 0.3, scaleY: 0.3, duration: 700, ease: 'Cubic.easeOut', onComplete: () => f.destroy() });
    });
    this.wordBase.setAlpha(0); this.wordDone.setText(''); this.wcaret.clear();
    const hot = [COMBO_COLORS[this.comboLevel()], 0xffffff, 0xffd34f, 0xff3d8b];
    KG.fx.burst(this, cx, cy, { colors: hot, n: 46, max: 560, depth: 44, life: 900 }); KG.fx.burst(this, cx, cy, { colors: [0xffffff], n: 16, max: 300, depth: 44, tex: 'fx_star', rot: true });
    KG.fx.ring(this, cx, cy, 0xffffff, { size: 5, w: 0.7, depth: 46 }); KG.fx.ring(this, cx, cy, COMBO_COLORS[this.comboLevel()], { size: 8, w: 0.9, depth: 46 }); KG.fx.glow(this, cx, cy, 0xffd34f, 900, 600);
    KG.fx.burst(this, E.x + E.w / 2, E.y + E.h / 2, { colors: [0x5ef08a, 0xffffff], n: 30, max: 420, depth: 46 }); KG.fx.shake(this, 160, 0.005 + this.comboLevel() * 0.002); KG.fx.flash(this, 0xffffff, 80);
    this.lightning(E.x + E.w / 2, E.y + E.h / 2, cx, cy); this.lightning(E.x + E.w / 2, E.y + E.h / 2, cx - 260, cy); this.rays(cx, cy);
    // ฮีโร่ฟันผ่านคำ
    this.heroPose('a2', 330); KG.art.frame(this.hero, 'a1'); this.time.delayedCall(80, () => KG.art.frame(this.hero, 'a2')); this.time.delayedCall(220, () => KG.art.frame(this.hero, 'a3'));
    const sl = this.add.image(120, cy, 'fx_ring').setTint(0xffffff).setBlendMode('ADD').setScale(0.2, 0.6).setAlpha(0.95).setDepth(47);
    this.tweens.add({ targets: sl, x: 1140, scaleX: 3.4, scaleY: 1.2, alpha: 0, duration: 380, ease: 'Cubic.easeOut', onComplete: () => sl.destroy() });
    this.tweens.add({ targets: this.hero, x: this.hero.x + 36, duration: 90, yoyo: true });
    KG.fx.pop(this, cx, cy - 70, '+' + pts, { size: 46, color: '#ffd34f', rise: 90, ms: 900 }); this.banner(grade, grade === 'PERFECT!' ? '#ffd34f' : (grade === 'GREAT!' ? '#7ffbe7' : '#ffffff'));
    this.setCombo(true); this.cardPunch();
    // คอมโบถึงหลักสำคัญ
    if ([5, 10, 15, 20, 30, 40, 50].includes(this.combo) && perfect) this.milestone();
    this.time.delayedCall(720, () => {
      if (this.state === 'done') return;
      if (this.idx + 1 >= this.words.length) { this.idx = this.words.length; this.refreshStats(); this.finish(true); return; }
      this.state = 'play'; this.loadWord(this.idx + 1);
    });
  }
  // สายฟ้าจากปุ่ม ENTER พุ่งเข้าคำ
  lightning(x0, y0, x1, y1) {
    const g = this.add.graphics().setDepth(48).setBlendMode('ADD'), n = 9, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    for (let k = 0; k < 3; k++) {
      const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, off = i === 0 || i === n ? 0 : Phaser.Math.Between(-30, 30); pts.push({ x: x0 + dx * t + nx * off, y: y0 + dy * t + ny * off }); }
      g.lineStyle(11, 0x4ef4d2, 0.45); g.strokePoints(pts, false); g.lineStyle(3, 0xffffff, 1); g.strokePoints(pts, false);
    }
    this.tweens.add({ targets: g, alpha: 0, duration: 280, onComplete: () => g.destroy() });
  }
  // แสงสาดออกจากกลางคำ
  rays(x, y) {
    for (let i = 0; i < 14; i++) {
      const r = this.add.image(x, y, 'fx_streak').setBlendMode('ADD').setTint(i % 2 ? 0xffd34f : 0x7ffbe7).setDepth(43).setRotation(i * Math.PI / 7).setOrigin(0.5, 1).setScale(1.4, 0.2).setAlpha(0.9);
      this.tweens.add({ targets: r, scaleY: 9, scaleX: 0.5, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => r.destroy() });
    }
  }
  cardPunch() {
    const parts = [this.cardGlow]; this.tweens.add({ targets: this.cardGlow, alpha: 0.2, duration: 80, yoyo: true, repeat: 2 }); this.drawCardGlow();
  }
  milestone() {
    const names = { 5: 'ไฟเริ่มติด!', 10: 'สุดยอด!', 15: 'ไม่หยุดแล้ว!', 20: 'อัศจรรย์!', 30: 'ตำนาน!', 40: 'เหนือมนุษย์!', 50: 'พิมพ์ทะลุจักรวาล!' };
    KG.audio.play('combo', { i: Math.floor(this.combo / 5) }); KG.fx.confetti(this, { ms: 900 }); KG.fx.flash(this, COMBO_COLORS[this.comboLevel()], 160);
    const t = KG.txt(this, GW / 2, 330, names[this.combo] + '  ×' + this.combo, { size: 64, color: '#ffd34f', center: true, middle: true, stroke: true, sw: 10 }).setDepth(200).setScale(0.3).setAlpha(0);
    this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' }); this.tweens.add({ targets: t, alpha: 0, y: 290, delay: 1100, duration: 400, onComplete: () => t.destroy() });
    KG.fx.shake(this, 260, 0.008);
  }
  setCombo(up) {
    this.comboTxt.setText(String(this.combo)); const lvl = this.comboLevel();
    this.comboTxt.setColor(['#ffffff', '#7ffbe7', '#ff9ac8', '#ffd34f', '#ffffff'][lvl]);
    this.tweens.killTweensOf(this.comboTxt); this.comboTxt.setScale(up ? 1.7 : 0.7);
    this.tweens.add({ targets: this.comboTxt, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' });
    if (this.combo >= 3) { this.flame.setFrequency(Math.max(15, 70 - this.combo * 3)); this.flame.start(); } else this.flame.stop();
    if (this.combo >= 10) this.embers.start(); else this.embers.stop();
    this.drawCardGlow();
  }
  banner(str, color, k) {
    const t = KG.txt(this, GW / 2, 296, str, { size: 58 * (k || 1), color: color || '#ffffff', center: true, middle: true, stroke: true, sw: 9 }).setDepth(200).setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' }); this.tweens.add({ targets: t, alpha: 0, y: 262, delay: 520, duration: 320, onComplete: () => t.destroy() });
  }

  /* ---------- เริ่ม พัก จบ ---------- */
  // หน้าต่างก่อนเริ่มด่าน: ให้เลือกโหมดก่อนทุกครั้ง (การ์ดใหญ่ 2 ใบ แตะเลือกแล้วเริ่มนับถอยหลังเลย) การ์ดของโหมดที่เล่นล่าสุดมีป้าย Enter
  showIntro() {
    const L = this.L, secs = TY.timeLimit(this.lang, this.lv, this.words); this._modeChoice = true;
    KG.ui.modal(this, { title: 'ด่าน ' + L.id + ' · ' + L.title, w: 860, accent: KG.C.sun, extraH: 236, body: L.desc,
      buttons: [{ label: 'กลับ (Esc)', style: 'ghost', icon: 'chevL', onClick: () => this.leave() }],
      build: (box, g) => {
        const y = g.top + 2;
        box.add(KG.txt(this, 0, y, this.words.length + ' คำ  ·  ' + LANG_NAME[this.lang] + '  ·  เลือกโหมดก่อนเริ่ม', { size: 22, color: '#ffd34f', center: true, ox: 0.5 }));
        const card = (x, m, icon, title, desc, key, col) => {
          const c = this.add.container(x, y + 128), cw = 360, ch = 168, last = m === this.mode;
          c.add(KG.ui.panel(this, -cw / 2, -ch / 2, cw, ch, { accent: last ? '#ffd34f' : col, cuts: [18, 0, 18, 0], fill: last ? ['#2a2f7a', '#121647'] : ['#1a2060', '#0b0f38'] }));
          c.add(KG.ui.icon(this, icon, -cw / 2 + 50, -26, 46, Phaser.Display.Color.HexStringToColor(col).color));
          c.add(KG.txt(this, -cw / 2 + 92, -54, title, { size: 32, stroke: true }));
          c.add(KG.txt(this, -cw / 2 + 92, -10, desc, { size: 17, weight: 400, color: '#cdd7f2', width: cw - 112 }));
          c.add(KG.txt(this, cw / 2 - 14, ch / 2 - 12, 'กด ' + key + (last ? ' หรือ Enter' : ''), { size: 15, color: last ? '#ffd34f' : '#9fb0d8', ox: 1, oy: 1 }));
          if (last) { const tag = KG.txt(this, cw / 2 - 16, -ch / 2 + 12, 'เล่นล่าสุด', { size: 14, color: '#2a1c00', ox: 1 }).setBackgroundColor('#ffd34f').setPadding(8, 1, 8, 1); c.add(tag); }
          const z = this.add.zone(0, 0, cw, ch).setInteractive({ useHandCursor: true }); c.add(z);
          z.on('pointerover', () => { this.tweens.add({ targets: c, scaleX: 1.04, scaleY: 1.04, duration: 110 }); KG.audio.play('hover'); });
          z.on('pointerout', () => this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 110 }));
          z.on('pointerup', () => { if (!this._modal || this._modal.closed) return; this._modal.close(); this.startMode(m); });
          box.add(c);
          if (last) this.tweens.add({ targets: c, scaleX: 1.025, scaleY: 1.025, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        };
        card(-190, 'time', 'bolt', 'จับเวลา', 'มีเวลา ' + secs + ' วินาที พิมพ์เร็วและเหลือเวลามากได้ดาวมาก', '1', '#ff8a24');
        card(190, 'free', 'book', 'ไม่จับเวลา', 'พิมพ์ช้า ๆ ได้ไม่รีบ เน้นพิมพ์ให้ถูก ดาวดูจากความแม่นยำ', '2', '#4ef4d2');
      } });
  }
  // เริ่มด่านด้วยโหมดที่เลือก: จำไว้เป็นค่าเริ่มต้นครั้งหน้า ตั้งเวลาและแถบเวลาบนหัวจอ แล้วนับถอยหลัง
  startMode(m) {
    this._modeChoice = false; this.mode = m; SAVE.data.mode = m; SAVE.save(); this._restartData.mode = m;
    this.timeLimit = m === 'time' ? TY.timeLimit(this.lang, this.lv, this.words) : 0; this.timeLeft = this.timeLimit;
    this.timeBar.setVisible(m === 'time');
    if (m === 'time') { this.timeBar.setValue(1, 0); this.timeTxt.setPosition(640, 58).setText('เหลือ ' + this.timeLimit + ' วินาที').setColor('#ffffff'); }
    else this.timeTxt.setPosition(640, 36).setText('โหมดไม่จับเวลา').setColor('#ffffff');
    KG.audio.play('confirm'); this.countdown();
  }
  countdown() {
    this.state = 'count'; let n = 3;
    const show = () => {
      const lab = n > 0 ? String(n) : 'พิมพ์!';
      const t = KG.txt(this, GW / 2, 330, lab, { size: n > 0 ? 160 : 110, color: n > 0 ? '#ffffff' : '#9bffc0', center: true, middle: true, stroke: true, sw: 14 }).setDepth(200).setScale(1.8).setAlpha(0);
      this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' }); this.tweens.add({ targets: t, alpha: 0, delay: 560, duration: 200, onComplete: () => t.destroy() });
      KG.audio.play(n > 0 ? 'count' : 'go'); KG.fx.ring(this, GW / 2, 330, n > 0 ? 0xffd34f : 0x5ef08a, { size: 5, w: 0.6, depth: 190 });
      if (n === 0) { this.state = 'play'; this.wordStart = this.time.now; return; }
      n--; this.time.delayedCall(800, show);
    };
    show();
  }
  pause() {
    if (this.state !== 'play') return; this.state = 'pause';
    KG.ui.modal(this, { title: 'พักเกม', w: 760, accent: KG.C.cyan, body: 'Enter เล่นต่อ · R เริ่มใหม่ · Q ออก', buttons: [{ label: 'ออก (Q)', style: 'danger', icon: 'home', onClick: () => this.leave() }, { label: 'เริ่มใหม่ (R)', style: 'cyan', icon: 'reset', onClick: () => this.go('Play', this._restartData) }, { label: 'เล่นต่อ (Enter)', style: 'primary', icon: 'play', onClick: () => { this.state = 'play'; } }] });
  }
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000); this.drawHighway(dt);
    if (this.state === 'play' || this.state === 'between') {
      if (this.state === 'play') this.elapsed += dt;
      if (this.mode === 'time' && this.state === 'play') {
        this.timeLeft = Math.max(0, this.timeLeft - dt); const f = this.timeLeft / this.timeLimit;
        this.timeBar.setValue(f, 0); this.timeBar.setAlpha(f < 0.2 ? (Math.floor(time / 160) % 2 ? 0.55 : 1) : 1);
        this.timeTxt.setText('เหลือ ' + Math.ceil(this.timeLeft) + ' วินาที').setColor(f < 0.2 ? '#ff7a8a' : '#ffffff');
        if (this.timeLeft < 10 && Math.ceil(this.timeLeft) !== this.lastTick) { this.lastTick = Math.ceil(this.timeLeft); KG.audio.play('tick', { p: 1.4 }); KG.fx.flash(this, 0xff4d5e, 60); }
        if (this.timeLeft <= 0) this.finish(false);
      } else if (this.mode !== 'time' && !this.tutorial && this.state === 'play') this.timeTxt.setText('เวลา ' + Math.floor(this.elapsed) + ' วินาที' + (this.blind ? ' · เป้า ' + this.targetWpm + ' คำ/นาที' : ''));
    }
  }
  finish(win) {
    if (this.state === 'done') return; this.state = 'done'; this.setReady(false); if (this.tutor) { this.tutor.destroy(); this.tutor = null; }
    if (this.course) { this.finishCourse(); return; }
    const acc = TY.accuracy(this.hits, this.misses), ms = this.elapsed * 1000, wpm = TY.wpm(this.charsDone, ms), frac = this.timeLimit ? this.timeLeft / this.timeLimit : 0;
    let stars = win ? TY.stars(this.mode, acc, frac) : 0; if (this.tutorial && win) stars = Math.max(1, stars);
    const best = SAVE.data.best[this.lang][this.lv] || { score: 0, wpm: 0 }, newBest = win && this.score > best.score;
    if (win) {
      if (stars > levelStars(this.lang, this.lv)) SAVE.data.stars[this.lang][this.lv] = stars;
      if (newBest) SAVE.data.best[this.lang][this.lv] = { score: this.score, wpm: Math.max(wpm, best.wpm), acc };
      if (this.tutorial) SAVE.data.tutorDone = true; SAVE.save();
    }
    KG.stats.record({ lvl: this.lang + ':' + this.lv, stars: win ? stars : 0, score: this.score, m: this.misses, secs: Math.round((Date.now() - this._t0) / 1000) });
    KG.audio.play(win ? 'fanfare' : 'lose'); if (win) { KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 200); }
    const err = Object.keys(this.errKeys).sort((a, b) => this.errKeys[b] - this.errKeys[a]).slice(0, 3);
    const nextOk = win && this.lv < LEVELS.length;
    this._enterAction = nextOk ? () => this.go('Play', { level: this.lv + 1, lang: this.lang, mode: SAVE.data.mode }) : () => this.go('Play', this._restartData);
    this.time.delayedCall(win ? 800 : 300, () => KG.ui.modal(this, {
      title: win ? (this.tutorial ? 'จบบทสอน!' : 'ผ่านด่าน ' + this.lv + '!') : 'หมดเวลา', w: 860, accent: win ? KG.C.sun : KG.C.red, extraH: 310,
      body: withPlayer('คะแนน ' + this.score + (newBest ? '  (สถิติใหม่!)' : '') + '  ·  ' + wpm + ' คำ/นาที  ·  แม่นยำ ' + acc + '%'),
      buttons: [{ label: 'เลือกด่าน (Esc)', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { level: this.lv }) }, { label: (win ? 'เล่นอีกครั้ง' : 'ลองใหม่') + (nextOk ? ' (R)' : ' (Enter)'), style: 'cyan', icon: 'reset', onClick: () => this.go('Play', this._restartData) }].concat(nextOk ? [{ label: 'ด่านถัดไป (Enter)', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Play', { level: this.lv + 1, lang: this.lang, mode: SAVE.data.mode }) }] : []),
      build: (box, g) => {
        const st = KG.ui.stars(this, 0, g.top + 48, 0, 3, 60); box.add(st); this.time.delayedCall(350, () => st.setStars(stars, true));
        const rows = [['คอมโบสูงสุด', '×' + this.maxCombo], ['พิมพ์สมบูรณ์แบบ', this.perfects + ' / ' + this.words.length + ' คำ'], ['เวลาที่ใช้', Math.round(this.elapsed) + ' วินาที'], ['ตัวที่พลาดบ่อย', err.length ? err.map(c => c === ' ' ? 'เว้นวรรค' : c).join('  ') : 'ไม่มี']];
        rows.forEach((r, i) => { box.add(KG.txt(this, -300, g.top + 104 + i * 38, r[0], { size: 22, color: '#9fb0d8' })); box.add(KG.txt(this, 300, g.top + 104 + i * 38, r[1], { size: 24, color: '#ffffff', ox: 1 })); });
        box.add(KG.txt(this, 0, g.top + 262, win ? 'ยิ่งพิมพ์แม่นต่อเนื่อง คอมโบยิ่งสูง คะแนนยิ่งคูณ ลองไล่ทำสถิติใหม่ดูนะ' : 'ลองพิมพ์ให้แม่นก่อนแล้วค่อยเร่งความเร็ว ฝึกซ้ำได้เสมอ', { size: 20, weight: 400, color: '#4ef4d2', center: true, ox: 0.5, width: 760 }));
      }
    }));
  }

  /* ---------- หัดพิมพ์สัมผัส: หน้าต่างเริ่ม แผงมือบอกนิ้ว และสรุปผล ---------- */
  courseIntro() {
    const C = this.course, L = CL[this.lang][C.lesson], S = TY_COURSE.stageOf(this.lang, C.lesson, C.stage), keys = L.final ? [] : [...L.keys].slice(0, 12), rows = Math.ceil(keys.length / 4);
    KG.ui.modal(this, { title: this.L.title, w: 900, accent: S.blind ? KG.C.pink : KG.C.cyan, extraH: rows * 50 + 76, body: markText(L.tip),
      buttons: [{ label: 'กลับ (Esc)', style: 'ghost', icon: 'chevL', onClick: () => this.leave() }, { label: 'เริ่มเลย! (Enter)', style: 'primary', icon: 'play', pulse: true, onClick: () => this.countdown() }],
      build: (box, g) => {
        keys.forEach((ch, k) => {
          const kk = TY.keyOf(this.lang, ch), f = kk && TY_COURSE.fingerOf(kk.code), col = kk ? TY.fingerColor(kk.code) : 0x9fb0d8, x = -400 + (k % 4) * 200, y = g.top + 6 + Math.floor(k / 4) * 50;
          const gr = this.add.graphics(); gr.fillStyle(0x0b1240, 1); gr.fillRoundedRect(x, y, 190, 42, 8); gr.lineStyle(2, col, 1); gr.strokeRoundedRect(x, y, 190, 42, 8); gr.fillStyle(col, 1); gr.fillRect(x + 6, y + 37, 178, 3); box.add(gr);
          box.add(KG.txt(this, x + 26, y + 20, keyLabel(ch), { size: 24, center: true, middle: true })); box.add(KG.txt(this, x + 50, y + 21, (f ? f.name : '') + (kk && kk.shift ? ' + Shift' : ''), { size: 15, color: '#cdd7f2', oy: 0.5 }));
        });
        box.add(KG.txt(this, 0, g.top + rows * 50 + 16, 'ด่าน ' + S.id + ' ' + S.name + ': ' + S.desc + (S.blind ? ' · 3 ดาว: แม่นยำ 96% และเร็ว ' + this.targetWpm + ' คำ/นาที' : ' · 3 ดาว: แม่นยำ 98%'), { size: 18, weight: 400, color: S.blind ? '#ff9ac8' : '#4ef4d2', center: true, ox: 0.5, width: 820 }));
      } });
  }
  buildHands() {
    const X = 1098, Y = 448, W = 176;
    KG.ui.panel(this, X, Y, W, 250, { accent: '#4ef4d2', cuts: [14, 0, 14, 0], fill: ['#101a4a', '#070b22'] }).setDepth(20);
    this.txt(X + W / 2, Y + 8, 'นิ้วที่ต้องใช้', { size: 15, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(21);
    this.handG = this.add.graphics().setDepth(21);
    this.handName = this.txt(X + W / 2, Y + 172, '', { size: 17, color: '#ffffff', center: true, ox: 0.5 }).setDepth(21);
    this.handMove = this.txt(X + W / 2, Y + 200, '', { size: 14, weight: 400, color: '#ffd34f', center: true, ox: 0.5, lineSpacing: 2 }).setDepth(21);
    this.drawHands([]);
  }
  // มือซ้ายขวาแบบง่าย นิ้วระบายสีตามสีนิ้วบนแป้นพิมพ์ นิ้วที่ต้องใช้สว่างมีขอบขาว (hot = ['L3', 'R0'] ...)
  drawHands(hot) {
    const g = this.handG, X = 1098, Y = 448, F = { L: [['L0', 34], ['L1', 46], ['L2', 52], ['L3', 46]], R: [['R3', 46], ['R2', 52], ['R1', 46], ['R0', 34]] }; g.clear();
    ['L', 'R'].forEach((hand, hi) => {
      const x0 = X + 14 + hi * 82, py = Y + 96;
      F[hand].forEach(([fk, h], i) => {
        const fx = x0 + i * 15, col = TY.fingerColor(TY_COURSE.HOME[fk]), on = hot.includes(fk);
        if (on) { g.fillStyle(col, 0.3); g.fillRoundedRect(fx - 4, py - h - 2, 20, h + 14, 9); }
        g.fillStyle(col, on ? 1 : 0.3); g.fillRoundedRect(fx, py - h + 4, 12, h + 4, 6); if (on) { g.lineStyle(2.5, 0xffffff, 1); g.strokeRoundedRect(fx, py - h + 4, 12, h + 4, 6); }
      });
      const tOn = hot.includes('T4'), tc = TY.fingerColor('Space'), tx = hand === 'L' ? x0 + 52 : x0 - 14;
      g.fillStyle(tc, tOn ? 1 : 0.3); g.fillRoundedRect(tx, py + 18, 22, 13, 6); if (tOn) { g.lineStyle(2.5, 0xffffff, 1); g.strokeRoundedRect(tx, py + 18, 22, 13, 6); }
      g.fillStyle(0x2a3a8a, 1); g.fillRoundedRect(x0 - 3, py + 6, 64, 44, 13); g.lineStyle(1.5, 0x5c70d8, 1); g.strokeRoundedRect(x0 - 3, py + 6, 64, 44, 13);
      this.handLab = this.handLab || {}; if (!this.handLab[hand]) this.handLab[hand] = this.txt(x0 + 29, py + 28, hand === 'L' ? 'ซ้าย' : 'ขวา', { size: 13, color: '#9fb0d8', center: true, middle: true }).setDepth(22);
    });
  }
  updateHands(nk) {
    if (!nk) { this.drawHands([]); this.handName.setText(''); this.handMove.setText(''); return; }
    const f = TY_COURSE.fingerOf(nk.code); if (!f) return; const hot = [f.key]; let sh = null;
    if (nk.shift) { sh = TY_COURSE.fingerOf(TY.shiftFor(nk.code)); if (sh) hot.push(sh.key); }
    this.drawHands(hot);
    const what = nk.code === 'Enter' ? 'Enter' : nk.code === 'Backspace' ? 'ลบตัวผิด' : nk.code === 'Space' ? 'เว้นวรรค' : keyLabel(nk.ch || '');
    this.handName.setText(what + ' › ' + f.name);
    this.handMove.setText((nk.code === 'Enter' || nk.code === 'Backspace' ? 'ก้อยขวาเอื้อมไปทางขวา' : TY_COURSE.moveHint(nk.code)) + (sh ? '\n+ Shift ด้วย' + sh.name : ''));
  }
  finishCourse() {
    const C = this.course, S = TY_COURSE.stageOf(this.lang, C.lesson, C.stage), acc = TY.accuracy(this.hits, this.misses), ms = this.elapsed * 1000, wpm = TY.wpm(this.charsDone, ms);
    const stars = TY_COURSE.stars(C.stage, acc, wpm, this.targetWpm), k = ckey(C.lesson, C.stage), prev = courseStars(this.lang, C.lesson, C.stage), best = SAVE.data.cbest[this.lang][k];
    if (stars > prev) SAVE.data.course[this.lang][k] = stars;
    if (stars && (!best || wpm > best.wpm)) SAVE.data.cbest[this.lang][k] = { wpm, acc };
    SAVE.save();
    KG.stats.record({ lvl: 'c' + this.lang + ':' + (C.lesson + 1) + '-' + C.stage, stars, score: this.score, m: this.misses, secs: Math.round((Date.now() - this._t0) / 1000) });
    KG.audio.play(stars ? 'fanfare' : 'lose'); if (stars) { KG.fx.confetti(this, { ms: 1400 }); KG.fx.flash(this, 0xffffff, 160); }
    const n = CL[this.lang].length, next = C.stage < 4 ? { lesson: C.lesson, stage: C.stage + 1 } : C.lesson < n - 1 ? { lesson: C.lesson + 1, stage: 1 } : null;
    const err = Object.keys(this.errKeys).sort((a, b) => this.errKeys[b] - this.errKeys[a]).slice(0, 4);
    const goNext = () => this.go('Play', { course: next, lang: this.lang }), retry = () => this.go('Play', this._restartData);
    this._enterAction = stars && next ? goNext : retry;
    const tip = !stars ? 'ยังไม่ผ่าน ต้องแม่นยำ 85% ขึ้นไป ลองพิมพ์ช้าลง ดูนิ้วที่แผงมือ แล้วดึงนิ้วกลับแป้นเหย้าทุกครั้ง'
      : S.blind ? (wpm >= this.targetWpm ? 'พิมพ์สัมผัสได้ทั้งแม่นและเร็วถึงเป้า ไปบทต่อไปได้เลย' : 'ผ่านแล้ว ฝึกซ้ำให้ได้ ' + this.targetWpm + ' คำ/นาที เพื่อเก็บ 3 ดาว')
      : stars < 3 ? 'ผ่านแล้ว ถ้าพิมพ์ไม่ผิดเลยจะได้ 3 ดาว' : 'ไม่ผิดเลย! ด่านต่อไปจะยากขึ้นอีกนิด';
    this.time.delayedCall(stars ? 700 : 300, () => KG.ui.modal(this, {
      title: stars ? 'ผ่านด่าน ' + S.id + ' ' + S.name + '!' : 'ลองอีกครั้งนะ', w: 880, accent: stars ? KG.C.sun : KG.C.red, extraH: 300,
      body: withPlayer(this.L.title + '  ·  ' + wpm + ' คำ/นาที  ·  แม่นยำ ' + acc + '%'),
      buttons: [{ label: 'เลือกบทเรียน (Esc)', style: 'ghost', icon: 'flag', onClick: () => this.leave() }, { label: 'ฝึกอีกครั้ง' + (stars && next ? ' (R)' : ' (Enter)'), style: stars && next ? 'cyan' : 'primary', icon: 'reset', pulse: !(stars && next), onClick: retry }].concat(stars && next ? [{ label: (next.stage === 1 ? 'บทต่อไป' : 'ด่านต่อไป') + ' (Enter)', style: 'primary', icon: 'chevR', pulse: true, onClick: goNext }] : []),
      build: (box, g) => {
        const st = KG.ui.stars(this, 0, g.top + 48, 0, 3, 60); box.add(st); this.time.delayedCall(350, () => st.setStars(stars, true));
        const rows = [['ความแม่นยำ', acc + '%  (ผ่าน 85% · 3 ดาว ' + (S.blind ? '96' : '98') + '%)'], ['ความเร็ว', wpm + ' คำ/นาที' + (S.blind ? '  (เป้า ' + this.targetWpm + ')' : '')], ['คอมโบสูงสุด', '×' + this.maxCombo], ['ตัวที่พลาดบ่อย', err.length ? err.map(c => (c === ' ' ? 'เว้นวรรค' : keyLabel(c))).join('  ') : 'ไม่มี']];
        rows.forEach((r, i) => { box.add(KG.txt(this, -320, g.top + 104 + i * 38, r[0], { size: 22, color: '#9fb0d8' })); box.add(KG.txt(this, 320, g.top + 104 + i * 38, r[1], { size: 22, color: '#ffffff', ox: 1 })); });
        box.add(KG.txt(this, 0, g.top + 262, tip, { size: 19, weight: 400, color: '#4ef4d2', center: true, ox: 0.5, width: 800 }));
      }
    }));
  }

  /* ---------- บทสอนเล่น (ด่าน 1) ---------- */
  startTutor() {
    if (this.tutor) return; this.state = 'play';
    const W = this.words, C = PY.CARD, I = PY.INPUT, E = PY.ENTER, th = this.lang === 'th';
    const bar = { compact: true, dim: false };
    this.tutor = new KG.Tutor(this, [
      { text: 'ยินดีต้อนรับสู่ Type Hero! เกมนี้ฝึกพิมพ์ให้แม่นและเร็ว คำจะขึ้นกลางจอ ให้พิมพ์ตามแล้วกด Enter ยืนยัน ลองทำตามทีละขั้นนะ' },
      { text: 'นี่คือคำที่ต้องพิมพ์ ตัวอักษรที่พิมพ์ถูกจะเรืองเป็นสีฟ้า และมีขีดสีทองบอกตัวต่อไป', target: { x: C.x, y: C.y, w: C.w, h: C.h }, pad: 4, pos: 'bottom' },
      { text: 'ปุ่มที่ต้องกดต่อไปจะเรืองแสงบนแป้นพิมพ์ แถบสีที่ขอบปุ่มบอกว่าควรใช้นิ้วไหน วางนิ้วไว้ที่แถวกลางเสมอ', target: { x: PY.KB.x - 4, y: PY.KB.y - 4, w: 908, h: 258 }, pad: 2, pos: 'top', dim: false },
      Object.assign({ text: 'ลองพิมพ์คำว่า "' + W[0] + '" ทีละตัวอักษรตามปุ่มที่เรืองแสง', target: { x: I.x, y: I.y, w: I.w, h: I.h }, mode: 'wait', block: false, until: () => this.idx === 0 && this.ready }, bar),
      Object.assign({ text: 'พิมพ์ถูกทั้งคำแล้ว! ดูสิ ปุ่ม ENTER กะพริบสีเขียว กดปุ่ม Enter เพื่อยืนยัน', target: { x: E.x, y: E.y, w: E.w, h: E.h }, mode: 'wait', block: false, until: () => this.idx >= 1 }, bar),
      Object.assign({ text: th ? 'คำนี้ตัวแรกต้องใช้ Shift กด Shift ค้างไว้แล้วกดตัวอักษร (ดูปุ่ม Shift ที่เรืองแสง) ลองพิมพ์ "' + W[1] + '"' : 'คำนี้ขึ้นต้นด้วยตัวพิมพ์ใหญ่ ต้องกด Shift ค้างไว้แล้วกดตัวอักษร (ดูปุ่ม Shift ที่เรืองแสง) ลองพิมพ์ "' + W[1] + '"', target: { x: I.x, y: I.y, w: I.w, h: I.h }, mode: 'wait', block: false, until: () => this.idx === 1 && this.ready }, bar),
      Object.assign({ text: 'เยี่ยม! กด Enter อีกครั้ง', target: { x: E.x, y: E.y, w: E.w, h: E.h }, mode: 'wait', block: false, until: () => this.idx >= 2 }, bar),
      Object.assign({ text: 'ถ้าพิมพ์ผิดอย่าตกใจ กด Backspace เพื่อลบ ลองกดตัวอักษรผิดสักตัว แล้วกด Backspace ลบ', target: { x: I.x, y: I.y, w: I.w, h: I.h }, mode: 'wait', block: false, until: () => this.backs >= 1 }, bar),
      Object.assign({ text: 'คำสุดท้ายแล้ว พิมพ์ "' + W[2] + '" ให้ถูกแล้วกด Enter ได้เลย พิมพ์ถูกติดกันจะเกิดคอมโบ ไฟจะลุก!', target: { x: I.x, y: I.y, w: I.w + E.w + 30, h: I.h }, mode: 'wait', block: false, until: () => this.state === 'done' || this.idx >= 3 || (this.idx === 2 && this.state === 'between') }, bar)
    ], { onDone: () => { this.tutor = null; } });
  }
}
function TY_DATA_M(w) { return window.TY_DATA.MEANING[w] || ''; }
