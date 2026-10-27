/* ===== ฉากเล่น Bug Buster: แตะบรรทัดโค้ดที่มีบั๊ก เลือกวิธีแก้ แล้วไรเดอร์ฟันมอนสเตอร์บั๊ก =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y8-70 · แถบเวลา y84-100 · แผงโค้ด x30-830 y100-470 · แผงโจทย์/ตัวเลือก x850-1250 y100-470 · เวทีต่อสู้ y480-710 */
const CODE = { x: 30, y: 100, w: 800, h: 370, top: 152, rowH: 38 };
const SIDE = { x: 850, y: 100, w: 400, h: 370 };
const FLOOR = 702;

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.lv = data.level || 1; this.tutorial = this.lv === 1; this.mode = this.tutorial ? 'free' : (data.mode || SAVE.data.mode);
    this._restartData = { level: this.lv, mode: data.mode || SAVE.data.mode, tutor: data.tutor };
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music(this.mode === 'time' ? 'bounce' : 'sunny');
    const L = this.L = LEVELS[this.lv - 1], M = this.M = MONS[L.mon];
    this.rounds = BB.roundsFor(this.lv); this.idx = 0; this.score = 0; this.streak = 0; this.maxStreak = 0; this.mistakes = 0; this.lives = 3; this.tier = 0; this.solved = []; this.hp = this.rounds.length;
    this.state = 'intro'; this.rows = []; this.side = null; this.cursor = 0; this.timeMax = this.mode === 'time' ? BB.secsFor(this.lv) : 0; this.timeLeft = 0; this.lineMiss = 0; this.tutor = null; this.lastTick = 0;
    this.cw = KG.measure('0', '600 20px ' + CODE_FONT);
    this.buildBackground(); this.buildHud(); this.buildStage();
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.refreshStatus();
    if (this.tutorial) this.time.delayedCall(500, () => this.startTutor()); else this.showIntro();
  }
  onEscape() { if (this.state === 'find' || this.state === 'fix') this.pause(); }
  leave() { this.go('Select', { level: this.lv }); }
  codeTxt(x, y, s, color, size) { return this.add.text(x, y, s, { fontFamily: CODE_FONT, fontSize: (size || 20) + 'px', fontStyle: '600', color: color || '#1b2a6b', resolution: KG.K, padding: { top: 4, bottom: 2 } }); }

  /* ---------- ฉากหลัง HUD เวที ---------- */
  buildBackground() {
    this.add.image(GW / 2, GH / 2, 'arena_' + BG[(this.lv - 1) % BG.length]).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.12);
    KG.fx.ambient(this, { freq: 360, colors: [0xffffff, 0xffd34f, 0xff6a8a], s: 0.3, alpha: 0.7 });
    KG.ui.panel(this, CODE.x, CODE.y, CODE.w, CODE.h, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [22, 0, 22, 0], fill: ['#ffffff', '#f1f6ff'] }).setDepth(2);
    this.codeTitle = this.txt(CODE.x + 52, CODE.y + 18, 'main.py', { size: 20, color: '#d9560a' }).setDepth(5);
    KG.ui.icon(this, 'book', CODE.x + 30, CODE.y + 32, 26, 0xd9560a).setDepth(5);
    this.roundTxt = this.txt(CODE.x + CODE.w - 34, CODE.y + 18, '', { size: 18, color: KG.SKIN.mute, ox: 1 }).setDepth(5);
    this.add.rectangle(CODE.x + CODE.w / 2, CODE.y + 56, CODE.w - 40, 2, 0xd0def5).setDepth(5);
    KG.ui.panel(this, SIDE.x, SIDE.y, SIDE.w, SIDE.h, { accent: '#2b8cff', accent2: '#7fe0ff', cuts: [0, 22, 0, 22], fill: ['#ffffff', '#eaf4ff'] }).setDepth(2);
    this.hintBtn = null;
    if (this.mode === 'free') { this.hintBtn = new KG.ui.Button(this, CODE.x + CODE.w - 100, CODE.y + 330 + 0, 150, 44, { label: 'คำใบ้', icon: 'bulb', style: 'sun', size: 20, slant: 6, onClick: () => this.hint() }); this.hintBtn.setDepth(30); this.hintBtn.setVisible(false); }
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
    this.timeBar = KG.ui.bar(this, CODE.x, 80, CODE.w, 14, { value: 1, color: 0x22b45a }).setDepth(30);
    this.timeTxt = this.txt(CODE.x + CODE.w / 2, 80, '', { size: 15, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(31);
    if (this.mode !== 'time') { this.timeBar.setVisible(false); this.timeTxt.setPosition(CODE.x + CODE.w / 2, 78).setText(this.tutorial ? 'บทสอน ไม่จับเวลา ไม่เสียหัวใจ' : 'โหมดฝึก ไม่จับเวลา ไม่เสียหัวใจ').setColor('#ffffff'); }
  }
  buildStage() {
    const M = this.M;
    this.rider = new KG.Rider(this, 150, FLOOR, { forms: FORMS, form: 0, bodyH: 230, depth: 20 });
    const sh = this.add.ellipse(1090, FLOOR + 4, M.body * 0.9, M.body * 0.12, 0x1b2a6b, 0.28).setDepth(19); this.monShadow = sh;
    this.mon = KG.art.make(this, 1090, FLOOR, M.id, 0, M.body).setDepth(20);
    this.monBase = { x: 1090, y: FLOOR, sx: this.mon.scaleX, sy: this.mon.scaleY };
    this.monIdle = this.tweens.add({ targets: this.mon, scaleY: this.mon.scaleY * 1.025, scaleX: this.mon.scaleX * 0.985, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.txt(1060, 478, M.name, { size: 22, stroke: true, center: true, ox: 0.5 }).setDepth(30);
    this.hpBar = KG.ui.bar(this, 900, 508, 320, 18, { value: 1, color: 0xe0243d }).setDepth(30);
    // แผงสถานะกลางเวที
    const D = 28; KG.ui.panel(this, 310, 520, 540, 170, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [18, 0, 18, 0] }).setDepth(D - 1);
    this.heartLab = this.txt(380, 532, this.mode === 'time' ? 'หัวใจ' : 'โหมดฝึก', { size: 16, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D);
    this.hearts = [0, 1, 2].map(i => KG.ui.icon(this, 'heart', 340 + i * 42, 582, 36, 0xff4d6a).setDepth(D));
    this.txt(580, 532, 'คอมโบ', { size: 16, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D);
    this.comboTxt = this.txt(580, 548, '0', { size: 58, center: true, ox: 0.5 }).setDepth(D);
    this.formBar = KG.ui.bar(this, 340, 650, 200, 14, { value: 0, color: 0xff8a2b }).setDepth(D);
    this.formTxt = this.txt(440, 666, '', { size: 15, center: true, ox: 0.5 }).setDepth(D).setY(668);
    this.multTxt = this.txt(740, 560, '', { size: 20, color: '#d9560a', center: true, ox: 0.5 }).setDepth(D);
    this.progTxt = this.txt(740, 596, '', { size: 22, center: true, ox: 0.5 }).setDepth(D);
    this.accTxt = this.txt(740, 634, '', { size: 17, color: '#1a8f6a', center: true, ox: 0.5 }).setDepth(D);
  }
  refreshStatus() {
    const tot = this.rounds.length, done = this.idx + (this.state === 'reveal' || this.state === 'resolve' ? 1 : 0);
    this.scoreTxt.setText(String(this.score)); this.comboTxt.setText(String(this.streak));
    this.hearts.forEach((h, i) => { h.setTint(i < this.lives ? 0xff4d6a : 0xc9d3ec); h.setVisible(this.mode === 'time'); });
    const t = BB.formTier(this.streak); this.formBar.setValue(t >= 3 ? 1 : (this.streak % 2) / 2, 150); this.formTxt.setText(t >= 3 ? 'ร่างสุดยอด!' : 'อีก ' + (2 - (this.streak % 2)) + ' ข้อเปลี่ยนร่าง');
    this.multTxt.setText('คะแนน x' + Math.min(5, 1 + Math.floor(this.streak / 2)));
    this.progTxt.setText('ข้อ ' + Math.min(this.idx + 1, tot) + ' / ' + tot); this.accTxt.setText('แม่น ' + BB.accuracy(this.solved.length, this.mistakes) + '%');
    this.roundTxt.setText('ข้อ ' + Math.min(this.idx + 1, tot) + ' / ' + tot);
  }

  /* ---------- วาดโค้ด ---------- */
  clearRows() { this.rows.forEach(r => r.destroy(true)); this.rows = []; }
  drawCode(lines) {
    this.clearRows(); const r = this.cur;
    // โค้ดสั้นใช้ตัวใหญ่และแถวสูง โค้ดยาวใช้ตัวเล็กลงให้พอดีแผง
    const fs = lines.length <= 3 ? 28 : lines.length <= 5 ? 24 : lines.length <= 6 ? 22 : 20; this.fs = fs; this.rowH = fs + 18; this.cw = KG.measure('0', '600 ' + fs + 'px ' + CODE_FONT);
    lines.forEach((ln, i) => {
      const y = CODE.top + i * this.rowH, c = this.add.container(CODE.x, y).setDepth(6); this.rows.push(c);
      c.bg = this.add.rectangle(20, 0, CODE.w - 40, this.rowH - 4, 0xffe9c7, 0).setOrigin(0, 0); c.add(c.bg);
      c.add(this.codeTxt(30, 6, String(i + 1), '#a9b6d3', Math.round(fs * 0.85)).setOrigin(0, 0));
      c.add(this.add.rectangle(66, 2, 2, this.rowH - 8, 0xd0def5).setOrigin(0, 0));
      c.toks = this.drawTokens(c, ln, 82, 6);
      c.zone = this.add.zone(20, 0, CODE.w - 40, this.rowH - 2).setOrigin(0, 0).setInteractive({ useHandCursor: true }); c.add(c.zone);
      c.zone.on('pointerover', () => { this.cursor = i; this.paintCursor(); }); c.zone.on('pointerdown', () => this.pickLine(i));
    });
    this.paintCursor();
  }
  drawTokens(c, ln, x0, y0) {
    const out = []; let col = 0;
    BB.tokenize(ln).forEach(tk => { if (tk.t !== 'ws') { const t = this.codeTxt(x0 + col * this.cw, y0, tk.s, TOKEN_COLOR[tk.t], this.fs).setOrigin(0, 0); c.add(t); out.push(t); } col += tk.s.length; });
    return out;
  }
  paintCursor() { this.rows.forEach((c, i) => { if (c.mark) return; c.bg.setFillStyle(i === this.cursor && (this.state === 'find') ? 0xdff0ff : 0xffe9c7, i === this.cursor && this.state === 'find' ? 1 : 0); }); }
  markRow(i, color, alpha) { const c = this.rows[i]; if (!c) return; c.mark = true; c.bg.setFillStyle(color, alpha == null ? 1 : alpha); }

  /* ---------- แผงโจทย์/ตัวเลือก/เฉลย ---------- */
  clearSide() { if (this.side) { this.side.destroy(true); this.side = null; } }
  boxText(c, x, y, w, label, text, col, mono) {
    const lab = KG.txt(this, x, y, label, { size: 16, color: KG.SKIN.mute }); c.add(lab);
    const t = mono ? this.codeTxt(x + 12, y + 24, text, '#1b2a6b', 19).setWordWrapWidth(w - 28) : KG.txt(this, x + 12, y + 24, text, { size: 19, width: w - 28 }); c.add(t);
    const h = t.height + 36, g = this.add.graphics(); g.fillStyle(col, 0.1); g.fillRect(x, y + 20, w, h - 16); g.lineStyle(3, col, 1); g.strokeRect(x, y + 20, w, h - 16); c.addAt(g, 0);
    return y + h + 8;
  }
  fmtOut(s) {
    const NL = String.fromCharCode(10), L = s.split(NL); if (L.length > 1 && L.join('  ').length <= 34) return L.join('  ');
    return L.length > 4 ? L.slice(0, 3).join(NL) + NL + '...' : s;
  }
  showTask() {
    this.clearSide(); const r = this.cur, c = this.side = this.add.container(SIDE.x, SIDE.y).setDepth(6); const X = 22, W = SIDE.w - 44;
    c.add(KG.txt(this, X, 14, r.title, { size: 26, color: '#d9560a' }));
    const task = KG.txt(this, X, 54, r.task, { size: 20, weight: 400, width: W, color: '#1b2a6b' }); c.add(task);
    let y = 58 + task.height + 6;
    y = this.boxText(c, X, y, W, 'ผลที่ควรได้', this.fmtOut(r.expected), 0x22b45a, true);
    y = this.boxText(c, X, y, W, 'ผลที่ได้ตอนนี้ (มีบั๊ก!)', this.fmtOut(r.actual), 0xe0243d, true);
    this.findHint = KG.txt(this, SIDE.w / 2, SIDE.h - 28, 'แตะบรรทัดโค้ดที่คิดว่ามีบั๊ก', { size: 19, color: '#2b8cff', center: true, ox: 0.5 }); c.add(this.findHint);
    this.tweens.add({ targets: this.findHint, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
  }
  showOptions() {
    this.clearSide(); const r = this.cur, c = this.side = this.add.container(SIDE.x, SIDE.y).setDepth(6); const X = 20, W = SIDE.w - 40; this.optViews = [];
    c.add(KG.txt(this, X, 14, 'เลือกวิธีแก้บรรทัดที่ ' + (r.bug + 1), { size: 24, color: '#d9560a' }));
    c.add(KG.txt(this, X, 50, 'ต้องได้ผล: ' + this.fmtOut(r.expected), { size: 18, weight: 400, color: KG.SKIN.mute, width: W }));
    r.shown.forEach((o, k) => {
      const y = 100 + k * 88, oc = this.add.container(X, y); c.add(oc); const g = this.add.graphics(); oc.add(g); oc.g = g; oc.used = false;
      const paint = hot => { g.clear(); g.fillStyle(0x1b2a6b, 0.2); g.fillRect(3, 5, W, 76); g.fillStyle(hot ? 0xfff0d6 : 0xffffff, 1); g.fillRect(0, 0, W, 76); g.lineStyle(3, hot ? 0xff8a2b : 0x2b3f9c, 1); g.strokeRect(0, 0, W, 76); }; paint(false); oc.paint = paint;
      oc.add(this.add.circle(26, 38, 17, 0x2b3f9c)); oc.add(KG.txt(this, 26, 38, String(k + 1), { size: 20, color: '#ffffff', center: true, middle: true }));
      const t = this.codeTxt(56, 38, o.replace(/^ +/, s => ' '.repeat(s.length)).trim() === '' ? '(ว่าง)' : o.replace(/^ +/, s => ' '.repeat(s.length)), '#1b2a6b', 17).setOrigin(0, 0.5).setWordWrapWidth(W - 70); oc.add(t); oc.t = t;
      oc.zone = this.add.zone(0, 0, W, 76).setOrigin(0, 0).setInteractive({ useHandCursor: true }); oc.add(oc.zone);
      oc.zone.on('pointerover', () => { if (!oc.used && this.state === 'fix') { paint(true); KG.audio.play('hover'); } }); oc.zone.on('pointerout', () => { if (!oc.used) paint(false); }); oc.zone.on('pointerdown', () => this.pickOption(k));
      this.optViews.push(oc);
    });
  }
  showReveal(r, solved) {
    this.clearSide(); const c = this.side = this.add.container(SIDE.x, SIDE.y).setDepth(6); const X = 22, W = SIDE.w - 44;
    c.add(KG.txt(this, X, 14, solved ? 'แก้ถูกแล้ว!' : 'เฉลย', { size: 28, color: solved ? '#14803f' : '#c0152d' }));
    const chip = KG.txt(this, SIDE.w - 24, 20, 'ชนิดบั๊ก: ' + KIND[r.kind], { size: 17, color: '#0a74c8', ox: 1 }); c.add(chip);
    const why = KG.txt(this, X, 58, r.why, { size: 20, weight: 400, width: W, color: '#1b2a6b', lineSpacing: 6 }); c.add(why);
    let y = 62 + why.height + 10;
    c.add(KG.txt(this, X, y, 'บรรทัดเดิม (ผิด)', { size: 16, color: '#c0152d' })); const bad = this.codeTxt(X + 8, y + 22, r.lines[r.bug].replace(/^ +/, s => ' '.repeat(s.length)), '#c0152d', 18).setWordWrapWidth(W - 16); c.add(bad); y += 28 + bad.height + 8;
    c.add(KG.txt(this, X, y, 'บรรทัดที่แก้แล้ว (ถูก)', { size: 16, color: '#14803f' })); const good = this.codeTxt(X + 8, y + 22, r.fixedLines[r.bug].replace(/^ +/, s => ' '.repeat(s.length)), '#14803f', 18).setWordWrapWidth(W - 16); c.add(good);
    const last = this.idx + 1 >= this.rounds.length, manual = this.mode !== 'time' || this.tutorial;
    this.nextBtn = new KG.ui.Button(this, SIDE.x + SIDE.w / 2, SIDE.y + SIDE.h - 44, 300, 62, { label: last ? 'ดูสรุปผล' : 'ต่อไป', icon: 'chevR', style: 'primary', size: 28, onClick: () => this.proceed() }); this.nextBtn.setDepth(7);
    if (manual) this.nextBtn.pulse(); else { this.nextBtn.setLabel(last ? 'ดูสรุปผล' : 'ต่อไป'); this.autoNext = this.time.delayedCall(3400, () => this.proceed()); }
  }

  /* ---------- ลำดับของข้อ ---------- */
  loadRound() {
    const r = this.cur = this.rounds[this.idx]; this.state = 'find'; this.lineMiss = 0; this.cursor = 0;
    this.drawCode(r.lines); this.showTask(); this.refreshStatus(); this.timeLeft = this.timeMax; if (this.hintBtn) this.hintBtn.setVisible(true);
    if (this.timeMax) this.timeBar.setValue(1, 0);
    this.rows.forEach((c, i) => { c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 200, delay: i * 40 }); });
  }
  onKey(e) {
    if (this.state === 'find') {
      if (e.code === 'ArrowDown') { this.cursor = Math.min(this.rows.length - 1, this.cursor + 1); this.paintCursor(); KG.audio.play('hover'); }
      else if (e.code === 'ArrowUp') { this.cursor = Math.max(0, this.cursor - 1); this.paintCursor(); KG.audio.play('hover'); }
      else if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') this.pickLine(this.cursor);
    } else if (this.state === 'fix') { const m = /^(Digit|Numpad)([1-3])$/.exec(e.code); if (m) this.pickOption(+m[2] - 1); }
    else if (this.state === 'reveal' && (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter')) this.proceed();
  }
  pickLine(i) {
    if (this.state !== 'find') return; const r = this.cur;
    if (BB.checkLine(r, i)) {
      this.state = 'fix'; this.markRow(i, 0xffd9a8, 1); this.paintCursor(); KG.audio.play('confirm'); KG.fx.ring(this, CODE.x + 400, CODE.top + i * this.rowH + 16, 0xff8a2b, { size: 2.4, w: 0.4, depth: 12 });
      if (this.hintBtn) this.hintBtn.setVisible(false); this.showOptions();
    } else {
      this.lineMiss++; this.penalty('line');
      const c = this.rows[i]; c.mark = true; c.bg.setFillStyle(0xffc9d0, 1); this.tweens.add({ targets: c, x: CODE.x + 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { c.x = CODE.x; if (this.state === 'find') { c.mark = false; this.paintCursor(); } } });
      KG.ui.toast(this, 'ยังไม่ใช่บรรทัดนี้ อ่านผลที่ควรได้เทียบอีกครั้ง', { sfx: 'error' });
      if (this.mode === 'free' && this.lineMiss >= 2) this.hint();
    }
  }
  hint() {
    if (this.state !== 'find' || !this.cur) return; const i = this.cur.bug, c = this.rows[i]; KG.audio.play('pop');
    this.tweens.add({ targets: c.bg, alpha: 0.25, duration: 260, yoyo: true, repeat: 3 }); c.bg.setFillStyle(0xb9f3cc, 1); this.time.delayedCall(1700, () => { if (this.state === 'find' && !c.mark) { c.bg.setAlpha(1); this.paintCursor(); } });
    KG.fx.ring(this, CODE.x + 60, CODE.top + i * this.rowH + 16, 0x22b45a, { size: 2, w: 0.5, depth: 12 });
  }
  pickOption(k) {
    if (this.state !== 'fix') return; const r = this.cur, oc = this.optViews[k]; if (oc.used) return;
    if (BB.checkOption(r, k)) {
      this.state = 'resolve'; oc.paint(true); this.optViews.forEach(o => { o.used = true; });
      // แทนที่บรรทัดที่มีบั๊กด้วยบรรทัดที่แก้แล้ว
      const row = this.rows[r.bug]; row.toks.forEach(t => t.destroy()); row.toks = this.drawTokens(row, r.fixedLines[r.bug], 82, 6); this.markRow(r.bug, 0xb9f3cc, 1);
      KG.audio.play('good'); KG.fx.burst(this, CODE.x + 420, CODE.top + r.bug * this.rowH + 16, { colors: [0x22b45a, 0xffd34f, 0xffffff], n: 20, max: 260, depth: 40, add: false });
      this.win(r);
    } else {
      oc.used = true; oc.g.clear(); oc.g.fillStyle(0xe6e9f2, 1); oc.g.fillRect(0, 0, SIDE.w - 40, 76); oc.g.lineStyle(3, 0xb0b8cc, 1); oc.g.strokeRect(0, 0, SIDE.w - 40, 76); oc.t.setAlpha(0.4);
      oc.add(KG.ui.icon(this, 'close', SIDE.w - 70, 38, 30, 0xe0243d)); this.tweens.add({ targets: oc, x: oc.x + 8, duration: 50, yoyo: true, repeat: 3 });
      KG.ui.toast(this, 'ยังไม่ถูก ลองดูผลที่ควรได้ แล้วเลือกใหม่', { sfx: 'error' }); this.penalty('opt');
    }
  }

  /* ---------- ถูก / ผิด ---------- */
  win(r) {
    const frac = this.timeMax ? Math.max(0, this.timeLeft / this.timeMax) : 0.4; this.streak++; this.maxStreak = Math.max(this.maxStreak, this.streak); this.solved.push(r);
    const gain = BB.points(this.streak - 1, frac); this.score += gain;
    this.slash(() => { this.monHit(); KG.fx.pop(this, 1010, FLOOR - 250, '+' + gain, { color: '#ff7a1a', size: 44, depth: 60 }); });
    const tier = BB.formTier(this.streak);
    if (tier > this.tier) { this.tier = tier; this.time.delayedCall(700, () => { this.rider.setForm(tier, true); KG.banner(this, 'เปลี่ยนร่าง! ' + KG.FORMS[FORMS[tier]].name, '#ffffff', 0.8, 150); }); }
    this.time.delayedCall(950, () => { this.state = 'reveal'; this.refreshStatus(); this.showReveal(r, true); });
  }
  penalty(kind) {
    this.mistakes++; if (this.streak > 0 || this.tier > 0) { this.streak = 0; if (this.tier > 0) { this.tier = 0; this.rider.setForm(0, false); } }
    KG.fx.flash(this, 0xff4d5e, 120); KG.fx.shake(this, 160, 0.004); this.monAttack();
    if (this.mode === 'time') { this.lives = Math.max(0, this.lives - 1); this.refreshStatus(); if (this.lives <= 0 && this.state !== 'done') this.time.delayedCall(900, () => this.finish(false)); } else this.refreshStatus();
  }
  slash(cb) {
    const r = this.rider, x0 = r.baseX; r.frame('dash'); KG.audio.play('whoosh');
    this.tweens.add({ targets: [r.img, r.shadow], x: x0 + 700, duration: 150, ease: 'Quad.easeIn', onComplete: () => {
      r.frame('a1'); this.time.delayedCall(60, () => { r.frame('a2'); KG.audio.play('slice'); if (cb) cb(); }); this.time.delayedCall(150, () => r.frame('a3'));
      this.time.delayedCall(300, () => this.tweens.add({ targets: [r.img, r.shadow], x: x0, duration: 240, ease: 'Quad.easeOut', onComplete: () => r.frame('idle') }));
    } });
  }
  monHit() {
    this.hp = Math.max(0, this.hp - 1); this.hpBar.setValue(this.hp / this.rounds.length, 260); KG.audio.play('hit'); KG.art.frame(this.mon, 7);
    KG.fx.burst(this, 1040, FLOOR - 120, { colors: [0xffd34f, 0xff7a1a, 0xffffff], n: 26, max: 380, depth: 40, add: false }); KG.fx.ring(this, 1040, FLOOR - 120, 0xff7a1a, { size: 3, w: 0.4, depth: 41 }); KG.fx.shake(this, 160, 0.006);
    this.tweens.add({ targets: this.mon, x: 1130, duration: 70, yoyo: true, onComplete: () => { this.mon.x = 1090; } });
    this.time.delayedCall(280, () => { if (this.hp > 0) KG.art.frame(this.mon, 0); });
  }
  monAttack() {
    if (this.hp <= 0) return; const m = this.mon;
    this.tweens.add({ targets: m, scaleY: m.scaleY * 0.92, duration: 120, yoyo: true });
    this.time.delayedCall(220, () => { KG.art.frame(m, 6); this.tweens.add({ targets: [m, this.monShadow], x: 800, duration: 130, yoyo: true, ease: 'Quad.easeOut', onYoyo: () => { this.rider.hurt(); } }); });
    this.time.delayedCall(700, () => { if (this.hp > 0) KG.art.frame(m, 0); m.x = 1090; this.monShadow.x = 1090; });
  }
  monDie() {
    KG.audio.play('kill'); KG.art.frame(this.mon, 7); this.monIdle.remove();
    KG.fx.burst(this, 1090, FLOOR - 120, { colors: [0xffd34f, 0xff7a1a, 0xff4d5e, 0xffffff], n: 50, max: 520, depth: 60, life: 900, add: false }); KG.fx.ring(this, 1090, FLOOR - 120, 0xffd34f, { size: 6, w: 0.7, depth: 61 }); KG.fx.shake(this, 320, 0.01);
    this.tweens.add({ targets: [this.mon, this.monShadow], alpha: 0, scaleX: this.mon.scaleX * 1.3, scaleY: 0.1, duration: 700, ease: 'Quad.easeIn' });
  }
  proceed() {
    if (this.state !== 'reveal') return; if (this.autoNext) { this.autoNext.remove(); this.autoNext = null; }
    if (this.nextBtn) { this.tweens.killTweensOf(this.nextBtn); this.nextBtn.destroy(); this.nextBtn = null; }
    this.idx++;
    if (this.idx >= this.rounds.length) { this.state = 'between'; this.clearSide(); this.monDie(); this.time.delayedCall(1100, () => this.finish(true)); return; }
    this.state = 'between'; this.clearSide(); this.time.delayedCall(200, () => this.loadRound());
  }
  timedOut() {
    const r = this.cur; this.state = 'resolve'; this.penalty('time'); this.markRow(r.bug, 0xffd9a8, 1);
    const row = this.rows[r.bug]; row.toks.forEach(t => t.destroy()); row.toks = this.drawTokens(row, r.fixedLines[r.bug], 82, 6);
    KG.ui.toast(this, 'หมดเวลา! ดูเฉลยแล้วไปข้อต่อไป', { sfx: 'error' });
    this.time.delayedCall(900, () => { if (this.state === 'done') return; this.state = 'reveal'; this.refreshStatus(); this.showReveal(r, false); });
  }

  /* ---------- เริ่ม พัก จบ ---------- */
  showIntro() {
    const L = this.L, M = this.M;
    KG.ui.modal(this, { title: 'ด่าน ' + L.id + ' · ' + L.title, w: 820, accent: KG.C.sun, extraH: 150, body: L.desc,
      buttons: [{ label: 'กลับ', style: 'ghost', icon: 'chevL', onClick: () => this.leave() }, { label: 'สู้เลย!', style: 'primary', icon: 'play', pulse: true, onClick: () => this.start() }],
      build: (box, g) => {
        const y = g.top + 6;
        box.add(KG.txt(this, 0, y, 'ศัตรู: ' + M.name + '  ·  ' + this.rounds.length + ' ข้อ', { size: 26, color: KG.SKIN.hi, center: true, ox: 0.5 }));
        box.add(KG.txt(this, 0, y + 46, this.mode === 'time' ? 'ข้อละ ' + this.timeMax + ' วินาที  ·  หัวใจ 3 ดวง  ·  แตะผิดหรือเลือกผิดเสียหัวใจ' : 'โหมดฝึก ไม่จับเวลา ไม่เสียหัวใจ มีปุ่มคำใบ้ช่วย', { size: 21, weight: 400, color: KG.SKIN.body, center: true, ox: 0.5, width: 720 }));
      } });
  }
  start() { this.state = 'count'; KG.countdown(this, 'ลุย!', () => this.loadRound()); }
  pause() {
    if (this.state !== 'find' && this.state !== 'fix') return; const back = this.state; this.state = 'pause';
    KG.pauseMenu(this, { onExit: () => this.leave(), onRestart: () => this.go('Play', this._restartData), onResume: () => { this.state = back; } });
  }
  update(time, delta) {
    if ((this.state === 'find' || this.state === 'fix') && this.timeMax > 0) {
      this.timeLeft = Math.max(0, this.timeLeft - Math.min(0.05, delta / 1000)); const f = this.timeLeft / this.timeMax;
      this.timeBar.setValue(f, 0); this.timeBar.setAlpha(f < 0.25 ? (Math.floor(time / 160) % 2 ? 0.55 : 1) : 1); this.timeTxt.setText(Math.ceil(this.timeLeft) + ' วินาที');
      if (this.timeLeft < 5 && Math.ceil(this.timeLeft) !== this.lastTick) { this.lastTick = Math.ceil(this.timeLeft); KG.audio.play('tick', { p: 1.4 }); }
      if (this.timeLeft <= 0) this.timedOut();
    }
  }
  finish(win) {
    if (this.state === 'done') return; this.state = 'done'; if (this.tutor) { this.tutor.destroy(); this.tutor = null; } this.clearSide();
    const tot = this.rounds.length, got = this.solved.length, acc = BB.accuracy(got, this.mistakes), stars = BB.stars(win, acc);
    const best = SAVE.data.best[this.lv] || { score: 0 }, newBest = win && this.score > best.score;
    if (win) { if (stars > levelStars(this.lv)) SAVE.data.stars[this.lv] = stars; if (newBest) SAVE.data.best[this.lv] = { score: this.score, acc, combo: this.maxStreak }; if (this.tutorial) SAVE.data.tutorDone = true; SAVE.save(); }
    KG.audio.play(win ? 'fanfare' : 'lose'); if (win) { KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 200); this.rider.cheer(); }
    const kinds = {}; this.solved.forEach(r => { kinds[r.kind] = (kinds[r.kind] || 0) + 1; }); const top = Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a]).slice(0, 2).map(k => KIND[k]);
    const nextOk = win && this.lv < LEVELS.length;
    this.time.delayedCall(win ? 400 : 300, () => KG.results(this, { stat: { lvl: String(this.lv), stars: win ? stars : 0, score: this.score, m: this.mistakes, secs: Math.round((Date.now() - this._t0) / 1000) },
      win, stars, title: win ? (this.tutorial ? 'จบบทสอน!' : 'ปราบ' + this.M.name + 'แล้ว!') : 'หัวใจหมด', body: 'คะแนน ' + this.score + (newBest ? '  (สถิติใหม่!)' : ''),
      rows: [['แก้บั๊กถูก', got + ' / ' + tot + ' ข้อ (' + acc + '%)'], ['พลาด', this.mistakes + ' ครั้ง'], ['คอมโบสูงสุด', 'x' + this.maxStreak], ['ชนิดบั๊กที่เจอ', top.length ? top.join(' · ') : 'ยังไม่มี']],
      tip: win ? 'บั๊กคือข้อผิดพลาดในโปรแกรม โปรแกรมเมอร์ทุกคนเจอ และเก่งขึ้นจากการไล่หามันทีละบรรทัด' : 'ไม่เป็นไร ลองโหมดฝึกที่ไม่จับเวลาและมีคำใบ้ แล้วค่อยกลับมาท้าทายใหม่',
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { level: this.lv }) }, { label: win ? 'เล่นอีกครั้ง' : 'ลองใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Play', this._restartData) }]
        .concat(nextOk ? [{ label: 'ด่านถัดไป', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Play', { level: this.lv + 1, mode: SAVE.data.mode }) }] : [])
    }));
  }

  /* ---------- บทสอนเล่น (ด่าน 1) ---------- */
  startTutor() {
    if (this.tutor) return; this.state = 'count';
    const codeR = { x: CODE.x, y: CODE.y, w: CODE.w, h: CODE.h }, sideR = { x: SIDE.x, y: SIDE.y, w: SIDE.w, h: SIDE.h };
    this.tutor = new KG.Tutor(this, [
      { text: 'ยินดีต้อนรับสู่ Bug Buster! บั๊ก (bug) คือข้อผิดพลาดที่ซ่อนอยู่ในโปรแกรม หน้าที่ของเราคือหามันให้เจอ แก้ให้ถูก แล้วให้ไรเดอร์ฟันมอนสเตอร์บั๊ก', before: () => { this.loadRound(); this.state = 'count'; } },
      { text: 'นี่คือโค้ดโปรแกรมไพทอน อ่านทีละบรรทัดจากบนลงล่าง โปรแกรมนี้มีบั๊กซ่อนอยู่หนึ่งบรรทัด', target: codeR, pad: 4, pos: 'bottom', at: { x: 80, y: 478 } },
      { text: 'แผงนี้บอกว่าโปรแกรมควรทำอะไร ผลที่ควรได้ และผลที่ได้ตอนนี้ ถ้าสองอย่างไม่ตรงกันแปลว่ามีบั๊ก', target: sideR, pad: 4, pos: 'bottom', at: { x: 400, y: 478 } },
      { text: 'ลองหาบรรทัดที่ผิด ใบ้: คำสั่งแสดงผลของไพทอนต้องเขียนว่า print แตะบรรทัดนั้นเลย', target: codeR, pad: 4, mode: 'wait', block: false, pos: 'bottom', at: { x: 80, y: 478 }, before: () => { this.state = 'find'; }, until: () => this.state === 'fix' || this.state === 'resolve' || this.state === 'reveal' },
      { text: 'ถูกต้อง! ตอนนี้เลือกวิธีแก้ที่ถูกจากตัวเลือก 3 ข้อ (กดเลข 1-3 ก็ได้)', target: sideR, pad: 4, mode: 'wait', block: false, pos: 'bottom', at: { x: 400, y: 478 }, until: () => this.state === 'resolve' || this.state === 'reveal' },
      { text: 'ไรเดอร์ฟันบั๊กแล้ว! อ่านคำอธิบายว่าบั๊กเกิดจากอะไร แล้วกด "ต่อไป"', target: sideR, pad: 4, mode: 'wait', block: false, pos: 'bottom', at: { x: 400, y: 478 }, until: () => this.idx >= 1 },
      { text: 'ที่เหลืออีก 2 ข้อลองทำเองได้เลย แก้ถูกติดกัน 2 ข้อไรเดอร์จะเปลี่ยนร่าง ถ้าติดให้กดปุ่มคำใบ้ ลุยเลย!', pos: 'bottom', at: { y: 478 }, dim: false }
    ], { hero: 'h2', onDone: () => { this.tutor = null; if (this.state === 'count') this.state = 'find'; } });
  }
}
