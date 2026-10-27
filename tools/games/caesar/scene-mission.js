/* ===== ภารกิจแกะรหัส =====
   โครงหน้าจอ (ตำแหน่งตายตัว): หัวเรื่อง y8-64 · วงล้อ (ซ้าย) x24-476 · กระดานข้อความ (ขวาบน) x492-1256 y76-422 · บทสนทนา/เครื่องมือ/คีย์บอร์ด (ขวาล่าง) y434-704 */
const KB_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

class MissionScene extends KG.Scene {
  constructor() { super('Mission'); }
  init(data) { this.mi = data && data.i != null ? data.i : 0; this.forceTutor = !!(data && data.tutor); this._restartData = { i: this.mi }; }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music('think');
    this.roundTxt = null; this.bossBar = null; this.bossImg = null; this.portrait = null; this.bubble = null; this.btnOk = null; this.kbHint = null; this.toolsRoot = null; this._pt = null; this.timerOn = false; this._modal = null; this._say = 0;
    const M = this.M = MISSIONS[this.mi], W = this.W = WORLDS[M.world - 1];
    this.lives = M.lives; this.maxLives = M.lives; this.wrong = 0; this.busy = false; this.done = false; this.roundIdx = 0; this.stage = 0; this.t0 = null; this.typedWrong = 0;
    this.rounds = this.makeRounds();
    this.timeLeft = M.seconds || 0;

    this.add.image(GW / 2, GH / 2, 'arena_' + W.arena).setDisplaySize(GW * 1.1, GH * 1.1).setAlpha(0.5);
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'cmishade', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.8)'], [1, 'rgba(5,8,28,.94)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);
    matrixRain(this, '#4ef4d2', 0.07, 1);
    this.buildHeader(); this.buildWheelPanel(); this.buildConsole(); this.buildBottom();
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.startRound(true);
    this.tutor = null;
    if (this.mi === 0 && (this.forceTutor || !SAVE.data.tutorDone)) this.time.delayedCall(700, () => this.startTutor());
  }
  /* ---------- บทสอนเล่น (ภารกิจแรก) ---------- */
  startTutor() {
    if (this.tutor || this._modal) return; this.clearPoint && this.clearPoint();
    this.tutor = new KG.Tutor(this, [
      { text: 'ยินดีต้อนรับสู่ Cipher Breaker! Techno ดักสัญญาณลับของศัตรูได้ แต่ข้อความถูกเข้ารหัสด้วยรหัสซีซาร์ เรามาถอดรหัสไปด้วยกัน' },
      { text: 'นี่คือกระดานข้อความ แถวบนคือข้อความที่ดักได้ในรูปรหัส (KHOOR) ส่วนแถวล่างจะแสดงข้อความที่ถอดได้ตามกุญแจที่ตั้งไว้', target: { x: 492, y: 76, w: 764, h: 346 }, pad: 0, pos: 'bottom' },
      { text: 'วงล้อรหัสคือเครื่องมือถอดรหัส วงนอกคือตัวอักษรในรหัส วงในสีชมพูคือตัวอักษรจริง ตัวเลขกลางวงคือกุญแจ ซึ่งบอกว่าตัวอักษรถูกเลื่อนไปกี่ตำแหน่ง', target: { x: 24, y: 76, w: 452, h: 628 }, pad: 0, pos: 'bottom' },
      { text: 'ภารกิจบอกว่ากุญแจคือ 3 กดลูกศรขวาที่ปุ่มข้างวงล้อ 3 ครั้ง หรือใช้เมาส์ลากวงล้อชั้นในก็ได้', target: this.btnR, mode: 'wait', until: () => this.wheel.key === 3, at: { x: 500, y: 436 } },
      { text: 'ดูแถวล่างของกระดาน ข้อความอ่านออกเป็นคำว่า HELLO แล้ว นั่นคือคำว่า สวัสดี', target: { x: 492, y: 76, w: 764, h: 346 }, pad: 0, pos: 'bottom' },
      { text: 'กดปุ่ม "ยืนยันกุญแจ" เพื่อปลดล็อกข้อความ', target: this.btnOk, mode: 'wait', until: () => this.done, at: { x: 500, y: 436 } }
    ], { onDone: () => { SAVE.data.tutorDone = true; SAVE.save(); this.tutor = null; } });
  }

  onEscape() { if (!this._modal) this.leave(); }
  leave() { this.go('Select', { world: this.M.world }); }
  makeRounds() {
    const M = this.M;
    if (M.type === 'timed') {
      const keys = KG.shuffle([3, 5, 7, 9, 11, 14, 17, 19, 21, 23, 4, 6, 8]); const bank = KG.shuffle(CC.BANK);
      return Array.from({ length: M.rounds }, (_, i) => ({ plain: bank[i].text, th: bank[i].th, key: keys[i] }));
    }
    if (M.type === 'boss') {
      const keys = KG.shuffle([4, 6, 8, 10, 12, 15, 18, 20, 22, 24]);
      return M.lines.map((l, i) => ({ plain: l.text, th: l.th, key: keys[i] }));
    }
    return [{ plain: M.plain, th: M.meaning, key: M.key != null ? M.key : 0, layers: M.layers }];
  }

  /* ---------- หัวเรื่อง ---------- */
  buildHeader() {
    const M = this.M, W = this.W;
    iconButton(this, 56, 36, 'home', () => this.leave(), { w: 60, h: 52 });
    this.txt(100, 6, W.name + ' · ภารกิจ ' + (this.mi + 1), { size: 18, color: W.tint });
    this.txt(100, 26, M.title, { size: 30, stroke: true });
    this.hearts = []; for (let i = 0; i < M.lives; i++) { const h = KG.ui.icon(this, 'heart', 560 + i * 46, 36, 38, 0xff4d5e); this.hearts.push(h); }
    this.timerTxt = this.txt(800, 36, '', { size: 34, color: '#ffd34f', stroke: true, ox: 0, oy: 0.5 });
    this.timerBar = null;
    this.btnHint = iconButton(this, 1030, 36, 'bulb', () => this.showHint(), { w: 60, h: 52 });
    addSystemButtons(this, 1096, 36, 0, ['sfx']); iconButton(this, 1162, 36, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, 1226, 36, 'help', () => showHowTo(this), { w: 56, h: 52 });
  }
  setLives(n, hurt) {
    this.lives = n;
    this.hearts.forEach((h, i) => { h.setTint(i < n ? 0xff4d5e : 0x3a2a44); });
    if (hurt) { const h = this.hearts[n]; if (h) { KG.fx.burst(this, h.x, h.y, { colors: [0xff4d5e, 0xffffff], n: 12, max: 200, depth: 90 }); this.tweens.add({ targets: h, scaleX: 1.6, scaleY: 1.6, duration: 120, yoyo: true }); } }
  }

  /* ---------- วงล้อ ---------- */
  buildWheelPanel() {
    KG.ui.panel(this, 24, 76, 452, 628, { accent: css(this.W.color), cuts: [24, 0, 24, 0] }).setDepth(2);
    this.txt(250, 88, 'วงล้อรหัส', { size: 20, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(3);
    this.wheel = new CipherWheel(this, 250, 326, 160, { onChange: k => this.onKeyChange(k) }); this.wheel.setDepth(3);
    this.btnL = new KG.ui.Button(this, 118, 546, 100, 62, { label: '', icon: 'chevL', style: 'ghost', slant: 8, onClick: () => this.wheel.step(-1) }); this.btnL.setDepth(3);
    this.btnR = new KG.ui.Button(this, 382, 546, 100, 62, { label: '', icon: 'chevR', style: 'ghost', slant: 8, onClick: () => this.wheel.step(1) }); this.btnR.setDepth(3);
    this.txt(250, 546, 'ลากวงล้อ\nหรือกดปุ่ม', { size: 17, weight: 400, color: '#9fb0d8', center: true, ox: 0.5, oy: 0.5 }).setDepth(3);
    this.btnOk = new KG.ui.Button(this, 250, 636, 410, 80, { label: 'ยืนยันกุญแจ', icon: 'key', style: 'primary', size: 30, onClick: () => this.confirm() }); this.btnOk.setDepth(3);
    this.input.on('wheel', (p, objs, dx, dy) => { if (p.worldX < 480 && !this._modal) this.wheel.step(dy > 0 ? 1 : -1); });
  }
  onKeyChange(k) {
    this.board.setKey(k);
    if (this.M.tutorial && this.tutStep === 0) { this.tutStep = 1; this.say('ดีมาก! ดูแถวล่างของกระดาน ตัวอักษรเปลี่ยนไปตามกุญแจ หมุนต่อจนกุญแจเป็น 3', 'hint'); }
    if (this.M.tutorial && k === 3 && this.tutStep < 2) { this.tutStep = 2; this.say('ข้อความอ่านออกแล้ว คือ HELLO! กดปุ่ม "ยืนยันกุญแจ" เพื่อปลดล็อก', 'good'); this.pointAt(this.btnOk, 'up'); }
    this.liveHelp(k);
  }
  liveHelp(k) { if (this.done || this.busy) return; this.lastText = CC.decrypt(this.round.cipher, k); }

  /* ---------- กระดานข้อความ ---------- */
  buildConsole() {
    KG.ui.panel(this, 492, 76, 764, 346, { accent: '#4ef4d2', cuts: [0, 24, 0, 24] }).setDepth(2);
    this.consoleTitle = this.txt(516, 86, 'สัญญาณที่ดักได้', { size: 20, color: '#4ef4d2' }).setDepth(3);
    this.consoleSub = this.txt(1232, 86, '', { size: 19, color: '#9fb0d8', ox: 1 }).setDepth(3);
    this.board = new MessageBoard(this, 874, 262, 720, 270, { mode: this.M.type === 'encrypt' ? 'encrypt' : 'decode', onTile: (ch) => { if (this.M.type !== 'encrypt') this.wheel.pair(ch); } }); this.board.setDepth(3);
    this.statusTxt = this.txt(874, 404, '', { size: 19, color: '#ffd34f', center: true, ox: 0.5, oy: 1, stroke: true }).setDepth(3);
  }

  /* ---------- ส่วนล่างขวา: บทสนทนา เครื่องมือ หรือคีย์บอร์ด ---------- */
  buildBottom() {
    const M = this.M;
    if (M.type === 'encrypt') { this.buildKeyboard(); return; }
    KG.ui.panel(this, 492, 434, 420, 270, { accent: '#6f8cff', cuts: [0, 20, 0, 20] }).setDepth(2);
    this.add.image(556, 640, KG.tex(this, 'cportrait', 96, 100, ctx => { KG.ui.cutPath(ctx, 2, 2, 92, 96, [14, 0, 14, 0]); ctx.fillStyle = '#0a1030'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#4ef4d2'; ctx.stroke(); })).setDisplaySize(96, 100).setDepth(3);
    this.portrait = KG.art.make(this, 556, 688, HID, 'idle', 74).setDepth(4);
    this.bubble = this.txt(620, 452, '', { size: 21, weight: 400, color: '#e6edff', width: 270, lineSpacing: 5 }).setDepth(3);
    KG.ui.panel(this, 924, 434, 332, 270, { accent: css(this.W.color), cuts: [20, 0, 20, 0] }).setDepth(2);
    this.toolsRoot = this.add.container(0, 0).setDepth(3);
    this.buildTools();
    this.say(M.story, 'story');
  }
  buildTools() {
    const M = this.M, r = this.toolsRoot; let y = 466;
    r.add(this.txt(940, 444, 'เครื่องมือ', { size: 18, color: '#9fb0d8' }));
    const tools = M.tools || [];
    if (tools.includes('freq')) { const b = new KG.ui.Button(this, 1090, y + 14, 300, 56, { label: 'วิเคราะห์ความถี่', icon: 'chart', style: 'violet', size: 22, onClick: () => this.openFreq() }); r.add(b); y += 66; }
    if (tools.includes('brute')) { const b = new KG.ui.Button(this, 1090, y + 14, 300, 56, { label: 'ลองทุกกุญแจ', icon: 'bolt', style: 'sun', size: 22, onClick: () => this.openBrute() }); r.add(b); y += 66; }
    this.chipLines = []; const add = (icon, t, color) => { const ic = KG.ui.icon(this, icon, 954, y + 14, 26, color); const tx = this.txt(974, y + 14, t, { size: 18, color: '#e6edff', oy: 0.5, width: 262 }); r.add(ic); r.add(tx); y += Math.max(34, tx.height + 6); return tx; };
    if (M.clue) add('eye', 'เบาะแส: ' + M.clue, 0xffd34f);
    if (M.crib) add('key', 'คำแรกคือ ' + M.crib, 0xffd34f);
    if (M.type === 'timed' || M.type === 'boss') this.roundTxt = add('flag', '', 0x4ef4d2);
    if (M.type === 'layers') this.roundTxt = add('wheel', '', 0x4ef4d2);
    if (M.type === 'boss') {
      this.bossImg = KG.art.make(this, 1210, 642, 'm6', 0, 104); r.add(this.bossImg);
      this.bossBar = KG.ui.bar(this, 950, 676, 220, 16, { value: 1, color: 0xff3d8b }); r.add(this.bossBar);
    }
    if (!tools.length && !M.clue && !M.crib && M.type !== 'layers') { r.add(this.txt(940, 480, M.type === 'decode' ? 'ภารกิจนี้ไม่มีเครื่องมือพิเศษ\nใช้วงล้อและสายตาของคุณ' : 'ฝึกใช้วงล้อให้คล่อง', { size: 19, weight: 400, color: '#9fb0d8', width: 290 })); }
    this.say2 = null;
  }

  /* ---------- คีย์บอร์ดบนหน้าจอ (ภารกิจเข้ารหัส) ---------- */
  buildKeyboard() {
    KG.ui.panel(this, 492, 434, 764, 270, { accent: '#6f8cff', cuts: [0, 20, 0, 20] }).setDepth(2);
    this.consoleSub.setText('พิมพ์ตัวอักษรรหัสทีละตัว');
    this.kbHint = this.txt(874, 440, '', { size: 20, color: '#ffd34f', center: true, ox: 0.5, stroke: true }).setDepth(3);
    this.keys = {};
    KB_ROWS.forEach((row, ri) => {
      const n = row.length, w = 64, g = 8, total = n * w + (n - 1) * g, x0 = 874 - total / 2 + w / 2, y = 488 + ri * 60;
      for (let i = 0; i < n; i++) {
        const ch = row[i], b = new KG.ui.Button(this, x0 + i * (w + g), y, w, 52, { label: ch, style: 'ghost', size: 26, slant: 6, sfx: 'key', onClick: () => this.typeKey(ch) }); b.setDepth(3); this.keys[ch] = b;
      }
    });
    const bs = new KG.ui.Button(this, 1194, 608, 96, 52, { label: '', icon: 'chevL', style: 'danger', slant: 6, onClick: () => this.backspace() }); bs.setDepth(3);
    this.portrait = KG.art.make(this, 548, 698, HID, 'idle', 64).setDepth(4);
    this.bubble = this.txt(608, 648, '', { size: 19, weight: 400, color: '#e6edff', width: 620, lineSpacing: 3 }).setDepth(3).setVisible(false);
    this.say(this.M.story, 'story');
  }
  onKey(e) {
    if (this._modal || this.busy) return; const k = e.key;
    if (this.M.type === 'encrypt') { if (/^[a-zA-Z]$/.test(k)) this.typeKey(k.toUpperCase()); else if (k === 'Backspace') this.backspace(); }
    if (k === 'ArrowLeft') this.wheel.step(-1); else if (k === 'ArrowRight') this.wheel.step(1); else if (k === 'Enter' && this.M.type !== 'encrypt') this.confirm();
  }

  /* ---------- บทสนทนา ---------- */
  say(text, kind) {
    if (!this.bubble) return;
    const width = this.M.type === 'encrypt' ? 620 : 270, size = this.M.type === 'encrypt' ? 19 : 21;
    this._say = (this._say || 0) + 1; const id = this._say; const str = KG.wrap(text, width, '400 ' + size + 'px Kanit');
    this.bubble.setVisible(true).setText('').setColor(kind === 'bad' ? '#ffb3bd' : kind === 'hint' ? '#ffd34f' : kind === 'good' ? '#9bffc0' : '#e6edff');
    let i = 0; const step = () => { if (id !== this._say) return; i += 2; this.bubble.setText(str.slice(0, i)); if (i < str.length) this.time.delayedCall(14, step); }; step();
    if (this.portrait) { this.tweens.add({ targets: this.portrait, y: this.portrait.y - 6, duration: 110, yoyo: true, repeat: 1 }); KG.art.frame(this.portrait, kind === 'bad' ? 'hurt' : kind === 'good' ? 'a2' : 'idle'); }
  }
  showHint() { this.say('คำใบ้: ' + this.M.hint, 'hint'); KG.audio.play('pop'); }
  pointAt(target, dir, off) {
    this.clearPoint(); const o = off == null ? 56 : off; const a = KG.ui.icon(this, dir === 'up' ? 'chevU' : 'chevD', target.x, target.y + (dir === 'up' ? o : -o), 44, 0xffd34f).setDepth(40);
    this._pt = a; this.tweens.add({ targets: a, y: a.y + (dir === 'up' ? 12 : -12), duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  clearPoint() { if (this._pt) { this._pt.destroy(); this._pt = null; } }

  /* ---------- รอบของภารกิจ ---------- */
  get round() { return this.cur; }
  startRound(first) {
    const M = this.M, R = this.rounds[this.roundIdx];
    this.cur = Object.assign({}, R); this.stage = 0;
    this.cur.cipher = R.layers ? CC.encrypt(CC.encrypt(R.plain, R.layers[0]), R.layers[1]) : (M.type === 'encrypt' ? CC.encrypt(R.plain, R.key) : CC.encrypt(R.plain, R.key));
    this.cur.target = R.layers ? R.layers[1] : R.key;
    this.busy = false;
    if (M.type === 'encrypt') {
      this.board.setText(R.plain, null); this.board.setKey(0, true); this.expected = CC.encrypt(R.plain, R.key).replace(/ /g, ''); this.board.typedCount = 0;
      this.consoleTitle.setText('ข้อความที่ต้องส่ง (ข้อความจริง)'); this.kbHint.setText('กุญแจที่ใช้: ' + R.key + ' · ตั้งวงล้อให้เป็น ' + R.key);
      if (this.btnOk) { this.btnOk.destroy(); this.btnOk = null; }
    } else {
      this.board.setText(this.cur.cipher, null); this.board.setKey(this.wheel.key, true);
      this.consoleTitle.setText('สัญญาณที่ดักได้ · ข้อความรหัส');
      if (M.crib) this.board.markCrib(M.crib.length);
    }
    this.consoleSub.setText(M.type === 'timed' || M.type === 'boss' ? 'ข้อความ ' + (this.roundIdx + 1) + '/' + this.rounds.length : (M.showKey ? 'กุญแจ ' + (R.layers ? 'ชั้นละค่า' : R.key) : 'ไม่ทราบกุญแจ'));
    if (M.showKey && !R.layers && M.type !== 'encrypt') this.statusTxt.setText('กุญแจที่ใช้เข้ารหัสคือ ' + R.key + ' · ตั้งวงล้อให้เป็นกุญแจนี้แล้วถอดรหัส'); else this.statusTxt.setText('');
    if (R.layers) this.statusTxt.setText('รหัสสองชั้น ปลดชั้นนอก (กุญแจ ' + R.layers[1] + ') ก่อน แล้วค่อยปลดชั้นใน (กุญแจ ' + R.layers[0] + ')');
    if (this.roundTxt) this.roundTxt.setText(M.type === 'layers' ? 'ชั้นที่ ' + (this.stage + 1) + '/2' : 'ข้อความที่ ' + (this.roundIdx + 1) + ' จาก ' + this.rounds.length);
    if (first && M.tutorial) { this.tutStep = 0; this.pointAt(this.wheel, 'up', 196); this.time.delayedCall(2500, () => { if (this.tutStep === 0) this.say('ลองลากวงชั้นในสีชมพู หรือกดปุ่มลูกศรด้านล่าง เพื่อหมุนวงล้อ', 'hint'); }); }
    if ((M.type === 'timed' || M.type === 'boss') && first) this.startTimer();
    if (M.type === 'timed' || M.type === 'boss') { if (!first) this.say('ข้อความใหม่เข้ามาแล้ว กุญแจเปลี่ยน แกะให้ทัน!', 'hint'); }
    KG.audio.play('alarm');
    this.glitch();
  }
  glitch() { this.cameras.main.flash(120, 40, 244, 210, true); KG.fx.ring(this, this.board.x, this.board.y, KG.C.cyan, { size: 4, w: 0.7 }); }
  startTimer() { this.t0 = this.time.now; this.timerOn = true; }
  update(time, dt) {
    if (!this.timerOn || this.done || this._modal) return;
    this.timeLeft -= dt / 1000; const s = Math.max(0, Math.ceil(this.timeLeft));
    this.timerTxt.setText('เวลา ' + s).setColor(s <= 15 ? '#ff7a8a' : '#ffd34f');
    if (this.timeLeft <= 0) { this.timerOn = false; this.fail('หมดเวลา! สัญญาณถูกตัดก่อนแกะรหัสสำเร็จ'); }
  }

  /* ---------- ยืนยันกุญแจ ---------- */
  confirm() {
    if (this.busy || this.done || this.M.type === 'encrypt') return;
    this.clearPoint(); const k = this.wheel.key;
    if (k === this.cur.target) this.onCorrect(); else this.onWrong(k);
  }
  onWrong(k) {
    this.wrong++; KG.audio.play('alarm'); KG.fx.flash(this, 0xff4d5e, 160); KG.fx.shake(this, 280, 0.007); this.board.shake();
    this.setLives(this.lives - 1, true);
    const t = CC.decrypt(this.cur.cipher, k);
    this.say('กุญแจ ' + k + ' ถอดได้ "' + t.slice(0, 18) + (t.length > 18 ? '…' : '') + '" ซึ่งยังไม่ใช่ภาษาอังกฤษที่อ่านออก ลองใหม่ ' + (this.lives > 0 ? '(เหลือ ' + this.lives + ' โอกาส)' : ''), 'bad');
    if (this.lives <= 0) this.time.delayedCall(700, () => this.fail('พลังหมด! ระบบตรวจพบการเดาผิดหลายครั้งและล็อกตัวเอง'));
  }
  async onCorrect() {
    const M = this.M; this.busy = true; const R = this.cur;
    KG.audio.play('unlock'); KG.fx.ring(this, 250, 326, KG.C.green, { size: 3, w: 0.7 }); KG.fx.burst(this, 250, 326, { colors: [0x5ef08a, 0xffffff, 0xffd34f], n: 30, max: 420, depth: 90 });
    if (R.layers && this.stage === 0) {
      // ปลดชั้นนอก: ข้อความในกระดานกลายเป็นรหัสชั้นใน
      this.stage = 1; const inner = CC.encrypt(R.plain, R.layers[0]); this.cur.cipher = inner; this.cur.target = R.layers[0];
      this.board.setText(inner, null, { entrance: false }); this.board.setKey(this.wheel.key, true);
      this.statusTxt.setText('ปลดชั้นนอกสำเร็จ! เหลืออีกชั้น กุญแจ ' + R.layers[0]); this.roundTxt && this.roundTxt.setText('ชั้นที่ 2/2'); this.say('ชั้นนอกหลุดแล้ว เหลือชั้นใน ตั้งกุญแจ ' + R.layers[0] + ' แล้วยืนยันอีกครั้ง', 'good');
      this.busy = false; return;
    }
    this.board.setKey(R.target, false); this.board.reveal(R.plain.replace(/ /g, ''), '#9bffc0');
    this.statusTxt.setText(R.th ? 'ความหมาย: ' + R.th : '');
    if (R.th) this.say('ถอดสำเร็จ! ความหมายคือ "' + R.th + '"', 'good');
    if (M.type === 'boss' && this.bossBar) { this.bossBar.setValue(1 - (this.roundIdx + 1) / this.rounds.length, 500); KG.fx.shake(this, 300, 0.01); KG.audio.play('kill'); this.tweens.add({ targets: this.bossImg, alpha: 0.4, duration: 80, yoyo: true, repeat: 3 }); KG.art.frame(this.bossImg, 7); this.time.delayedCall(420, () => { if (this.bossImg && this.bossImg.scene) KG.art.frame(this.bossImg, 0); }); }
    await wait(this, 1400 + R.plain.length * 25);
    if (this.roundIdx + 1 < this.rounds.length) { this.roundIdx++; this.startRound(false); return; }
    this.win();
  }
  fail(msg) {
    if (this.done) return; this.done = true; this.timerOn = false; KG.audio.play('lose');
    KG.ui.modal(this, { title: 'ภารกิจล้มเหลว', w: 700, accent: KG.C.red, body: msg + ' ลองใหม่ได้เสมอ นักถอดรหัสเก่ง ๆ ก็พลาดมาก่อน', buttons: [{ label: 'เลือกภารกิจ', style: 'ghost', icon: 'flag', onClick: () => this.leave() }, { label: 'ลองใหม่', style: 'primary', icon: 'reset', pulse: true, onClick: () => this.go('Mission', { i: this.mi }) }] });
  }
  async win() {
    const M = this.M; this.done = true; this.timerOn = false;
    let stars = this.wrong === 0 ? 3 : this.wrong === 1 ? 2 : 1;
    if (M.type === 'timed' || M.type === 'boss') { const used = (M.seconds - this.timeLeft) / M.seconds; stars = Math.min(this.lives >= this.maxLives ? 3 : this.lives >= 2 ? 2 : 1, used < 0.55 ? 3 : used < 0.8 ? 2 : 1); stars = Math.max(1, stars); }
    if (this.typedWrong > 0 && M.type === 'encrypt') stars = this.typedWrong === 1 ? 2 : (this.typedWrong === 2 ? 2 : 1);
    if (stars > missionStars(this.mi)) { SAVE.data.stars[this.mi] = stars; SAVE.save(); }
    KG.stats.record({ lvl: 'm' + (this.mi + 1), stars, m: this.wrong, secs: Math.round((Date.now() - this._t0) / 1000) });
    KG.audio.play('win'); KG.fx.confetti(this, { ms: 1100 }); KG.fx.shake(this, 200, 0.004);
    await wait(this, 700);
    const last = this.mi + 1 >= MISSIONS.length || MISSIONS[this.mi + 1].world !== M.world, defenseNow = last && defenseOpen(M.world);
    const lines = KG.wrap(M.learn, 600, '400 22px Kanit').split('\n').length;
    const buttons = [];
    if (defenseNow) buttons.push({ label: 'ลงสนามป้องกัน', style: 'primary', icon: 'shield', pulse: true, onClick: () => this.go('Defense', { world: M.world }) });
    if (this.mi + 1 < MISSIONS.length) buttons.push({ label: last ? 'SECTOR ถัดไป' : 'ภารกิจถัดไป', style: defenseNow ? 'ghost' : 'primary', icon: 'chevR', pulse: !defenseNow, onClick: () => this.go('Mission', { i: this.mi + 1 }) });
    buttons.push({ label: 'เล่นซ้ำ', style: 'cyan', icon: 'reset', onClick: () => this.go('Mission', { i: this.mi }) });
    buttons.push({ label: 'เลือกภารกิจ', style: 'ghost', icon: 'flag', onClick: () => this.leave() });
    const afterModal = () => KG.ui.modal(this, {
      title: this.mi === MISSIONS.length - 1 ? 'ภารกิจสำเร็จทั้งหมด!' : 'ภารกิจสำเร็จ!', w: 800, extraH: 96 + lines * 30 + 24, accent: KG.C.sun,
      body: withPlayer(M.type === 'timed' || M.type === 'boss' ? 'เวลาที่ใช้ ' + Math.round(M.seconds - this.timeLeft) + ' วินาที · พลังชีวิตเหลือ ' + this.lives : (this.wrong === 0 ? 'ไม่พลาดเลย ยอดเยี่ยม!' : 'เดาผิด ' + this.wrong + ' ครั้ง ลองไม่พลาดเลยเพื่อรับ 3 ดาว')),
      buttons: buttons.slice(0, 4),
      build: (box, g) => {
        const st = KG.ui.stars(this, 0, g.top + 52, 0, 3, 64); box.add(st); this.time.delayedCall(350, () => st.setStars(stars, true));
        const ly = g.top + 106; box.add(KG.ui.panel(this, -300, ly, 600, lines * 30 + 22, { cuts: [10, 10, 10, 10], accent: '#4ef4d2', fill: ['#0e1b52', '#08102e'], glow: false, bracket: false }));
        box.add(KG.txt(this, 0, ly + 8, 'สิ่งที่ได้เรียนรู้: ' + M.learn, { size: 22, weight: 400, color: '#dbe4ff', center: true, ox: 0.5, width: 560 }));
      }
    });
    if (M.rot13) { this.showRot13(afterModal); return; }
    if (M.type === 'final') { this.showFinalQuiz(afterModal); return; }
    afterModal();
  }
  showRot13(next) {
    KG.ui.modal(this, { title: 'ลองเข้ารหัสซ้ำ', w: 720, accent: KG.C.cyan, extraH: 120, body: 'ข้อความที่ถอดได้คือ "' + this.cur.plain + '" ลองเข้ารหัสมันอีกครั้งด้วยกุญแจ 13 เหมือนเดิมแล้วดูว่าได้อะไร',
      build: (box, g) => { box.add(KG.txt(this, 0, g.top + 10, CC.encrypt(this.cur.plain, 13), { size: 30, color: '#4ef4d2', center: true, ox: 0.5, stroke: true })); box.add(KG.txt(this, 0, g.top + 56, 'ได้รหัสเดิมกลับมาทุกตัวอักษร! กุญแจ 13 เข้าและถอดด้วยตัวเดียวกัน', { size: 21, weight: 400, color: '#ffd34f', center: true, ox: 0.5, width: 640 })); },
      buttons: [{ label: 'เข้าใจแล้ว', style: 'primary', icon: 'check', onClick: () => next() }] });
  }
  showFinalQuiz(next) {
    const opts = [{ label: 'ใช้กุญแจที่ยาวและเดายากกว่า 25 แบบ', ok: true }, { label: 'เขียนข้อความให้สั้นลง', ok: false }, { label: 'เลื่อนตัวอักษรหลายรอบด้วยกุญแจเล็ก ๆ', ok: false }];
    const modal = KG.ui.modal(this, { title: 'คำถามสุดท้าย', w: 820, accent: KG.C.sun, extraH: 160, body: 'รหัสซีซาร์แกะได้เพราะมีกุญแจแค่ 25 แบบ ทางไหนช่วยให้ปลอดภัยขึ้นจริง?',
      build: (box, g) => {
        opts.forEach((o, i) => {
          const b = new KG.ui.Button(this, 0, g.top + 30 + i * 70, 700, 58, { label: o.label, style: 'ghost', size: 22, slant: 8, onClick: () => {
            if (o.ok) { KG.audio.play('win'); modal.close(); next(); } else { KG.audio.play('error'); KG.fx.shake(this, 160, 0.005); this.tweens.add({ targets: b, x: 12, duration: 40, yoyo: true, repeat: 4 }); b.setEnabled(false); }
          } }); box.add(b);
        });
      }, buttons: [] });
  }

  /* ---------- เครื่องมือ ---------- */
  openFreq() {
    const cipher = this.cur.cipher;
    const modal = KG.ui.modal(this, { title: 'วิเคราะห์ความถี่ตัวอักษร', w: 820, accent: KG.C.vio, extraH: 330, body: 'แท่งสีทองคือตัวที่พบบ่อยที่สุด ถ้าเดาว่ามันคือ E แตะแท่งนั้นเพื่อให้วงล้อตั้งกุญแจให้',
      build: (box, g) => {
        const chart = new FreqChart(this, -366, g.top + 6, 732, 280, { onBar: i => { const k = CC.mod(i - 4, 26); this.wheel.setKey(k); modal.close(); this.say('ตั้งกุญแจ ' + k + ' ตามที่สมมติว่า ' + LET[i] + ' คือ E ดูแถวล่างว่าอ่านออกไหม ถ้าไม่ใช่ ลองตัวอื่น', 'hint'); } });
        chart.setData(cipher); box.add(chart);
      }, buttons: [{ label: 'ปิด', style: 'ghost', icon: 'close' }] });
  }
  openBrute() {
    const cipher = this.cur.cipher, rows = CC.crackAll(cipher).slice().sort((a, b) => a.key - b.key), best = CC.bestKey(cipher);
    const modal = KG.ui.modal(this, { title: 'เครื่องลองทุกกุญแจ', w: 1000, accent: KG.C.sun, extraH: 380, body: 'เครื่องลองครบ 26 กุญแจในพริบตา แถวที่อ่านออกจะถูกเน้น แตะแถวเพื่อให้วงล้อตั้งกุญแจนั้น',
      build: (box, g) => {
        const rowsBox = [];
        rows.forEach((r, i) => {
          const col = i < 13 ? 0 : 1, row = i % 13, x = col ? 12 : -480, y = g.top + 8 + row * 28;
          const bgR = this.add.rectangle(x + 232, y + 12, 464, 26, 0x1c2a78, 0.6).setInteractive({ useHandCursor: true }); const t = KG.txt(this, x + 6, y, String(r.key).padStart(2, '0') + '  ' + r.text.slice(0, 30) + (r.text.length > 30 ? '…' : ''), { size: 18, color: '#cdd7f2', weight: 400 });
          box.add([bgR, t]); rowsBox.push({ bgR, t, r });
          bgR.on('pointerup', () => { this.wheel.setKey(r.key); modal.close(); this.say('ตั้งกุญแจ ' + r.key + ' แล้ว ถ้าข้อความอ่านออกก็กดยืนยันได้เลย', 'hint'); });
        });
        rowsBox.forEach((o, i) => { o.bgR.setAlpha(0.2); this.time.delayedCall(i * 55, () => { KG.audio.play('tick', { p: 0.8 + i * 0.03 }); o.bgR.setAlpha(1); this.tweens.add({ targets: o.bgR, fillAlpha: 0.9, duration: 80 }); if (o.r.key === best && i >= 0) { } }); });
        this.time.delayedCall(rowsBox.length * 55 + 200, () => { const o = rowsBox.find(q => q.r.key === best); if (o) { o.bgR.setFillStyle(0xffb000, 0.95); o.t.setColor('#10122b'); KG.audio.play('coin', { i: 3 }); this.tweens.add({ targets: o.bgR, scaleY: 1.2, duration: 120, yoyo: true, repeat: 2 }); } });
      }, buttons: [{ label: 'ปิด', style: 'ghost', icon: 'close' }] });
  }

  /* ---------- พิมพ์ตัวอักษรรหัส (ภารกิจเข้ารหัส) ---------- */
  typeKey(ch) {
    if (this.busy || this.done || this.M.type !== 'encrypt') return;
    const idx = this.board.nextIndex(); if (idx < 0) return;
    const exp = this.expected[idx], btn = this.keys[ch];
    if (btn) { this.tweens.add({ targets: btn, scaleX: 0.9, scaleY: 0.9, duration: 60, yoyo: true }); }
    if (ch === exp) {
      this.board.typeNext(ch); KG.audio.play('coin', { i: idx % 6 }); this.kbHint.setText(''); this.clearPoint();
      if (this.board.nextIndex() < 0) { this.busy = true; this.time.delayedCall(500, () => { this.statusTxt.setText('ส่งข้อความรหัสสำเร็จ!'); this.say('ส่งสำเร็จ! ข้อความรหัสคือ ' + CC.encrypt(this.cur.plain, this.cur.key) + ' พันธมิตรถอดด้วยกุญแจ ' + this.cur.key + ' ก็อ่านได้', 'good'); this.win(); }); }
    } else {
      this.typedWrong++; this.wrong++; KG.audio.play('error'); KG.fx.shake(this, 160, 0.005); this.board.shake(); this.setLives(this.lives - 1, true);
      this.say('ตัวอักษร ' + ch + ' ยังไม่ถูก ตัวจริงตัวนี้คือ ' + this.cur.plain.replace(/ /g, '')[idx] + ' ใช้กุญแจ ' + this.cur.key + ' ต้องเลื่อนไปอีกกี่ตำแหน่ง ดูวงล้อ', 'bad');
      if (this.lives <= 0) this.time.delayedCall(600, () => this.fail('พิมพ์ผิดจนพลังหมด'));
    }
  }
  backspace() { if (this.busy || this.done) return; this.board.undoLast(); KG.audio.play('remove'); }
}
