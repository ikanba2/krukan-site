/* ===== ฉากเล่น Techno Steps: กระดานตาราง + ตัวต่อโปรแกรมด้วยการแตะการ์ด + เล่นผลทีละคำสั่ง =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y8-70 · กระดาน x24-700 y84-600 · แผงโปรแกรม x716-1256 y84-600 · แถบล่าง y606-714 */
const BOARD = { x: 24, y: 84, w: 676, h: 516 };
const PANEL = { x: 716, y: 84, w: 540, h: 516 };
const PROG = { x: 728, y: 152, w: 516, h: 262 };      // พื้นที่แสดงโปรแกรม (ตัดส่วนเกินและเลื่อนได้)
const PAL_Y = 420;                                     // แถวแรกของแถบการ์ดให้เลือก
const CARD = 60, GAP = 8;

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.W = data.world || SAVE.data.world || 1; this.N = data.level || 1; this.seed = data.seed || null; this.wantTutor = !!data.tutor;
    this._restartData = { world: this.W, level: this.N, seed: this.seed };
    // ฉากถูกใช้ซ้ำเมื่อเริ่มใหม่ ต้องล้างของเดิมที่ค้างจากรอบก่อนทั้งหมด
    this.tutor = null; this.sbar = null; this.palLabel = null; this.hlObj = null; this.hlTw = null; this.bubble = null; this.stepWait = null; this.hintPulse = false; this.dyn = []; this.monObj = []; this.hero = null; this.lastRes = null; this.tabBtns = {}; this._modal = null;
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); const WD = WORLDS[this.W - 1]; KG.audio.music(['sunny', 'breeze', 'bounce'][(this.W - 1) % 3]);
    this.lv = this.seed ? makeLevel(this.W, this.N, this.seed) : getLevel(this.W, this.N);
    this.prog = this.lv.pre ? ST.cloneProg(this.lv.pre) : ST.emptyProg(); this.nextId = 1; this.assignIds(this.prog);
    this.tab = 'main'; this.sel = null; this.cursor = null; this.attempts = 0; this.fails = 0; this.usedSol = false; this.running = false; this.runId = 0; this.speed = 1; this.stepMode = false; this.paused = false; this.scroll = 0; this.dirty = false; this.cardObj = {};
    this.state = 'edit'; this.cursor = { list: this.prog.main, idx: this.prog.main.length };
    this.buildBackground(); this.buildBoard(); this.buildHud(); this.buildPanel(); this.buildBar();
    this.renderProgram(); this.resetBoard(); this.refreshChips();
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.input.on('wheel', (p, o, dx, dy) => { if (this.overProg(p)) this.scrollBy(dy * 0.6); });
    if (this.lv.kind === 'order') this.setMessage('แตะการ์ดสองใบเพื่อสลับที่กัน แล้วกดรัน', 'info');
    else if (this.lv.kind === 'fix') this.setMessage('โปรแกรมนี้มีบั๊ก กดรันดูว่าพลาดตรงไหน แล้วแก้ให้ผ่าน', 'info');
    else this.setMessage(this.goalText(), 'info');
    if (this.wantTutor && this.N === 1) this.time.delayedCall(500, () => this.startTutor()); else if (this.N === 1 && !this.seed && !SAVE.data.tutorDone[this.W]) this.time.delayedCall(700, () => this.showIntro());
  }
  onEscape() { if (this.running) this.stopRun(); else this.pause(); }
  leave() { this.runId++; this.go('Select', { level: this.N }); }

  goalText() {
    const M = this.lv.map, parts = ['พาไรเดอร์ไปที่ธง'];
    if (M.stars.length) parts.push('เก็บดาวให้ครบ');
    if (M.key) parts.push('เก็บกุญแจก่อนผ่านประตู');
    if (M.mons.length) parts.push('ฟันมอนสเตอร์ที่ขวางทาง');
    if (this.lv.limit) parts.push('ใช้การ์ดไม่เกิน ' + this.lv.limit + ' ใบ');
    return parts.join(' · ');
  }
  assignIds(prog) { const walk = l => (l || []).forEach(b => { b.id = this.nextId++; walk(b.body); walk(b.other); }); walk(prog.main); Object.keys(prog.fn || {}).forEach(k => walk(prog.fn[k])); }
  curList() { if (this.tab === 'main') return this.prog.main; if (!this.prog.fn[this.tab]) this.prog.fn[this.tab] = []; return this.prog.fn[this.tab]; }
  sleep(ms) { return new Promise(res => this.time.delayedCall(Math.max(1, ms / this.speed), res)); }
  tw(cfg) { return new Promise(res => this.tweens.add(Object.assign({}, cfg, { duration: Math.max(1, (cfg.duration || 300) / this.speed), onComplete: res }))); }

  /* ---------- ฉากหลังและกระดาน ---------- */
  buildBackground() {
    const WD = WORLDS[this.W - 1]; this.add.image(GW / 2, GH / 2, 'arena_' + WD.bg).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.22);
    KG.fx.ambient(this, { freq: 360, colors: [0xffffff, 0xffd34f, 0x7fe0ff], s: 0.3, alpha: 0.6 });
    KG.ui.panel(this, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { accent: WD.color, accent2: WD.color, cuts: [22, 0, 22, 0], fill: ['#f6fbff', '#dcecff'], alpha: 0.96 }).setDepth(1);
    KG.ui.panel(this, PANEL.x, PANEL.y, PANEL.w, PANEL.h, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [0, 22, 0, 22], fill: ['#fffaf0', '#fff0d2'], alpha: 0.97 }).setDepth(1);
  }
  cellXY(c, r) { return { x: this.bx + c * this.T + this.T / 2, y: this.by + r * this.T + this.T / 2 }; }
  buildBoard() {
    const M = this.lv.map, WD = WORLDS[this.W - 1], tc = TILE[WD.bg];
    const T = this.T = Math.floor(Math.min((BOARD.w - 48) / M.w, (BOARD.h - 130) / M.h, 108));
    this.bx = BOARD.x + (BOARD.w - T * M.w) / 2; this.by = BOARD.y + 92 + (BOARD.h - 112 - T * M.h) / 2;
    const g = this.add.graphics().setDepth(2); this.tilesG = g; const wallKeys = new Set(M.walls.map(c => ST.key(c[0], c[1]))), pitKeys = new Set(M.pits.map(c => ST.key(c[0], c[1])));
    for (let r = 0; r < M.h; r++) for (let c = 0; c < M.w; c++) {
      const x = this.bx + c * T, y = this.by + r * T, k = ST.key(c, r), wall = wallKeys.has(k), pit = pitKeys.has(k);
      if (wall) continue;
      g.fillStyle(Phaser.Display.Color.HexStringToColor(tc[2]).color, 1); g.fillRoundedRect(x + 3, y + 8, T - 6, T - 8, 12);
      g.fillStyle(Phaser.Display.Color.HexStringToColor((c + r) % 2 ? tc[0] : tc[1]).color, 1); g.fillRoundedRect(x + 3, y + 3, T - 6, T - 10, 12);
      g.fillStyle(0xffffff, 0.35); g.fillRoundedRect(x + 8, y + 6, T - 16, 6, 3);
      if (pit) {
        g.fillStyle(0x1b2a6b, 1); g.fillEllipse(x + T / 2, y + T * 0.52, T * 0.66, T * 0.42); g.fillStyle(0x070d2e, 1); g.fillEllipse(x + T / 2, y + T * 0.56, T * 0.5, T * 0.28);
        g.lineStyle(3, 0xff7a1a, 1); g.strokeEllipse(x + T / 2, y + T * 0.52, T * 0.7, T * 0.46);
      }
    }
    // กำแพงเป็นก้อนหินสูง วาดในชั้นเรียงตามแถว (ทับตัวละครด้านหลังได้ถูกลำดับ)
    M.walls.forEach(([c, r]) => {
      const x = this.bx + c * T, y = this.by + r * T, w = this.add.graphics().setDepth(10 + r * 10);
      w.fillStyle(0x59627e, 1); w.fillRoundedRect(x + 4, y - T * 0.28, T - 8, T * 0.28 + T - 2, 10);
      w.fillStyle(0x8793b8, 1); w.fillRoundedRect(x + 4, y - T * 0.28, T - 8, T * 0.46, 10);
      w.fillStyle(0xc4cdea, 0.8); w.fillRoundedRect(x + 10, y - T * 0.28 + 5, T - 20, 6, 3);
      w.lineStyle(2, 0x3b4466, 0.8); w.beginPath(); w.moveTo(x + 4, y + T * 0.2); w.lineTo(x + T - 4, y + T * 0.2); w.moveTo(x + T / 2, y + T * 0.2); w.lineTo(x + T / 2, y + T - 2); w.strokePath();
    });
    // ธงปลายทาง
    const gp = this.cellXY(M.goal[0], M.goal[1]);
    this.goalGlow = this.add.image(gp.x, gp.y, 'fx_glow').setTint(0xffd34f).setDisplaySize(T * 1.5, T * 1.5).setAlpha(0.7).setDepth(3).setBlendMode('NORMAL');
    this.tweens.add({ targets: this.goalGlow, alpha: 0.25, duration: 800, yoyo: true, repeat: -1 });
    this.goalFlag = KG.ui.icon(this, 'flag', gp.x, gp.y - T * 0.04, T * 0.62, 0xe0243d).setDepth(11 + M.goal[1] * 10);
    // ป้ายสถานะบนกระดาน
    this.chipStar = this.txt(BOARD.x + 22, BOARD.y + 14, '', { size: 24, color: '#d9560a' }).setDepth(30);
    this.chipKey = this.txt(BOARD.x + 190, BOARD.y + 14, '', { size: 24, color: '#1b2a6b' }).setDepth(30);
    this.chipMon = this.txt(BOARD.x + 340, BOARD.y + 14, '', { size: 24, color: '#e0243d' }).setDepth(30);
    this.chipCards = this.txt(BOARD.x + BOARD.w - 22, BOARD.y + 14, '', { size: 24, color: '#1b2a6b', ox: 1 }).setDepth(30);
  }

  /* สร้างตัวละครและของบนกระดานใหม่ทั้งหมด (ตอนเริ่มด่านและตอนรีเซ็ต) */
  resetBoard() {
    (this.dyn || []).forEach(o => { if (o && o.destroy) o.destroy(); }); this.dyn = []; this.monObj = []; this.starObj = {}; this.keyObj = null; this.doorObj = null; this.bubble = null;
    const M = this.lv.map, T = this.T, WD = WORLDS[this.W - 1]; this.state = this.state === 'done' ? 'edit' : this.state; this.dirty = false;
    this.hp = M.mons.map(m => m.hp || 1); this.got = 0; this.haveKey = false; this.killed = 0;
    M.stars.forEach(([c, r]) => {
      const p = this.cellXY(c, r), s = KG.ui.icon(this, 'star', p.x, p.y - T * 0.12, T * 0.46, 0xffb800).setDepth(12 + r * 10); this.dyn.push(s); this.starObj[ST.key(c, r)] = s;
      this.tweens.add({ targets: s, y: s.y - 5, duration: 700 + c * 60, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    if (M.key) { const p = this.cellXY(M.key[0], M.key[1]), s = KG.ui.icon(this, 'key', p.x, p.y - T * 0.1, T * 0.5, 0xff8a2b).setDepth(12 + M.key[1] * 10); this.dyn.push(s); this.keyObj = s; this.tweens.add({ targets: s, y: s.y - 5, duration: 640, yoyo: true, repeat: -1 }); }
    if (M.door) {
      const p = this.cellXY(M.door[0], M.door[1]), c = this.add.container(p.x, p.y).setDepth(11 + M.door[1] * 10), g = this.add.graphics();
      g.fillStyle(0x7a4a1a, 1); g.fillRoundedRect(-T * 0.4, -T * 0.52, T * 0.8, T * 0.96, 10); g.fillStyle(0xb67a34, 1); g.fillRoundedRect(-T * 0.4, -T * 0.52, T * 0.8, T * 0.7, 10);
      g.lineStyle(3, 0x4a2a0a, 1); g.strokeRoundedRect(-T * 0.4, -T * 0.52, T * 0.8, T * 0.96, 10); c.add(g); c.add(KG.ui.icon(this, 'lock', 0, -T * 0.08, T * 0.36, 0xffd34f)); this.dyn.push(c); this.doorObj = c;
    }
    const sp = this.cellXY(M.start[0], M.start[1]);
    this.heroShadow = this.add.ellipse(sp.x, sp.y + T * 0.34, T * 0.62, T * 0.16, 0x1b2a6b, 0.28).setDepth(5); this.dyn.push(this.heroShadow);
    this.hero = KG.art.make(this, sp.x, sp.y + T * 0.34, WD.hero, 'idle', T * 1.18).setDepth(13 + M.start[1] * 10); this.dyn.push(this.hero);
    this.heroAt = { c: M.start[0], r: M.start[1] }; this.facing = 'right'; this.hero.setFlipX(false);
    this.heroBob = this.tweens.add({ targets: this.hero, scaleY: this.hero.artScale * 1.025, duration: 780, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.dyn.push({ destroy: () => this.heroBob && this.heroBob.remove() });
    M.mons.forEach((m, i) => {
      const p = this.cellXY(m.x, m.y), boss = (m.hp || 1) > 1, body = T * (boss ? 1.5 : 1.12);
      const sh = this.add.ellipse(p.x, p.y + T * 0.34, T * (boss ? 0.78 : 0.6), T * 0.16, 0x1b2a6b, 0.28).setDepth(5);
      const img = KG.art.make(this, p.x, p.y + T * 0.34, 'b' + m.m, 0, body).setDepth(12 + m.y * 10).setFlipX(true);
      const tw = this.tweens.add({ targets: img, scaleY: img.artScale * 1.03, duration: 900 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      const pips = []; for (let k = 0; k < (m.hp || 1); k++) pips.push(KG.ui.icon(this, 'heart', p.x + (k - ((m.hp || 1) - 1) / 2) * 18, p.y - T * (boss ? 1.5 : 1.02), 18, 0xe0243d).setDepth(60));
      const o = { img, sh, tw, pips, m, i, alive: true }; this.monObj.push(o); this.dyn.push(img, sh, { destroy: () => { tw.remove(); pips.forEach(x => x.destroy()); } });
    });
    this.clearHighlight(); this.refreshChips();
  }
  refreshChips() {
    const M = this.lv.map; this.chipStar.setText('ดาว ' + (this.got || 0) + '/' + M.stars.length).setVisible(M.stars.length > 0);
    this.chipKey.setText(M.key ? 'กุญแจ ' + (this.haveKey ? 'ได้แล้ว' : 'ยังไม่ได้') : '');
    this.chipMon.setText(M.mons.length ? 'มอนสเตอร์ ' + (this.killed || 0) + '/' + M.mons.length : '');
    const n = ST.cardCount(this.prog), lim = this.lv.limit;
    this.chipCards.setText('ใช้การ์ด ' + n + (lim ? '/' + lim : '') + ' ใบ').setColor(lim && n >= lim ? '#e0243d' : '#1b2a6b');
    if (this.heroChips) this.heroChips();
  }

  /* ---------- HUD และแถบล่าง ---------- */
  buildHud() {
    const WD = WORLDS[this.W - 1];
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52, depth: 30 });
    this.txt(100, 6, 'โลก ' + this.W + ' · ' + WD.grade + (this.seed ? ' · ฝึกสุ่ม' : ''), { size: 18, color: KG.SKIN.hi }).setDepth(30);
    this.txt(100, 26, 'ด่าน ' + this.N + ' · ' + this.lv.title, { size: 30, stroke: true }).setDepth(30);
    addSystemButtons(this, 1084, 40, 0, ['sfx']).forEach(b => b.setDepth(30));
    iconButton(this, 1148, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 30 });
    iconButton(this, 1218, 40, 'pause', () => this.pause(), { w: 60, h: 52, depth: 30 });
  }
  buildBar() {
    const y = 658;
    this.msgBg = KG.ui.panel(this, 24, 610, 676, 98, { accent: '#2b8cff', cuts: [14, 0, 14, 0], fill: ['#ffffff', '#e6f1ff'], alpha: 0.96 }).setDepth(20);
    this.msgTxt = this.txt(46, 624, '', { size: 24, color: '#1b2a6b', width: 560 }).setDepth(30);
    this.speakBtn = iconButton(this, 658, 658, 'sound', () => this.speak(this.msgPlain || ''), { w: 56, h: 52, depth: 30 });
    this.runBtn = new KG.ui.Button(this, 888, y, 270, 76, { label: 'รัน', icon: 'play', style: 'green', size: 36, onClick: () => (this.running ? this.stopRun() : this.runProgram()) }).setDepth(30);
    this.stepBtn = new KG.ui.Button(this, 1086, y - 14, 120, 48, { label: 'ทีละคำสั่ง', icon: 'step', style: 'ghost', size: 16, slant: 8, onClick: () => this.toggleStep() }).setDepth(30);
    this.speedBtn = new KG.ui.Button(this, 1086, y + 30, 120, 40, { label: 'เร็ว x1', style: 'ghost', size: 18, slant: 8, onClick: () => this.toggleSpeed() }).setDepth(30);
    this.clearBtn = new KG.ui.Button(this, 1196, y - 14, 90, 48, { icon: 'trash', style: 'danger', size: 20, slant: 8, onClick: () => this.clearProgram() }).setDepth(30);
    this.hintBtn = new KG.ui.Button(this, 1196, y + 30, 90, 40, { icon: 'bulb', style: 'sun', size: 20, slant: 8, onClick: () => this.showHint() }).setDepth(30);
  }
  setMessage(str, kind) {
    this.msgPlain = str; this.msgTxt.setText(KG.wrap(str, 560, '600 24px Kanit')); this.msgTxt.setColor(kind === 'bad' ? '#c9202f' : kind === 'good' ? '#13804a' : '#1b2a6b');
    if (this.msgTxt.displayHeight > 80) this.msgTxt.setScale(80 / this.msgTxt.displayHeight * this.msgTxt.scaleX); else this.msgTxt.setScale(1);
  }
  speak(text) {
    try {
      if (!window.speechSynthesis || !text) return; window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[·]/g, ' ')); u.lang = 'th-TH'; u.rate = 0.9;
      const v = (window.speechSynthesis.getVoices() || []).find(x => /^th/i.test(x.lang)); if (v) u.voice = v; window.speechSynthesis.speak(u);
    } catch (e) { /* ไม่มีเสียงอ่านก็ไม่เป็นไร */ }
  }
  toggleStep() { this.stepMode = !this.stepMode; this.stepBtn.setActive(this.stepMode); KG.audio.play('tap'); this.setMessage(this.stepMode ? 'โหมดทีละคำสั่ง: กดรันแล้วกดปุ่มรันซ้ำเพื่อไปคำสั่งถัดไป' : this.goalText(), 'info'); }
  toggleSpeed() { this.speed = this.speed === 1 ? 2 : this.speed === 2 ? 0.5 : 1; this.speedBtn.setLabel('เร็ว x' + this.speed); KG.audio.play('tap'); }

  /* ---------- แผงโปรแกรม ---------- */
  buildPanel() {
    this.txt(PANEL.x + 20, PANEL.y + 12, this.lv.kind === 'order' ? 'จัดลำดับการ์ด' : this.lv.kind === 'fix' ? 'โปรแกรม (มีบั๊ก)' : 'โปรแกรมของเรา', { size: 28, color: '#d9560a' }).setDepth(30);
    this.tabBtns = {};
    if (this.lv.hasFn) {
      this.tabBtns.main = new KG.ui.Button(this, PANEL.x + 330, PANEL.y + 30, 120, 40, { label: 'หลัก', style: 'ghost', size: 20, slant: 8, onClick: () => this.setTab('main') }).setDepth(30);
      this.tabBtns.A = new KG.ui.Button(this, PANEL.x + 462, PANEL.y + 30, 120, 40, { label: 'ท่า A', icon: 'func', style: 'ghost', size: 20, slant: 8, onClick: () => this.setTab('A') }).setDepth(30);
      this.refreshTabs();
    }
    this.progC = this.add.container(0, 0).setDepth(25);
    const mg = this.make.graphics({ x: 0, y: 0 }); mg.fillStyle(0xffffff, 1); mg.fillRect(PROG.x, PROG.y, PROG.w, PROG.h); this.progC.setMask(mg.createGeometryMask());
    this.progBg = this.add.rectangle(PROG.x + PROG.w / 2, PROG.y + PROG.h / 2, PROG.w, PROG.h, 0xffffff, 0.6).setStrokeStyle(2, 0xe0c58a).setDepth(24).setInteractive();
    this.progBg.on('pointerdown', () => { if (this.state !== 'edit') return; this.cursor = { list: this.curList(), idx: this.curList().length }; this.sel = null; this.renderProgram(); });
    let drag = null;
    this.input.on('pointerdown', p => { if (this.overProg(p)) drag = { y: p.y, s: this.scroll, moved: false }; });
    this.input.on('pointermove', p => { if (drag && p.isDown) { const d = (p.y - drag.y) / KG.K; if (Math.abs(d) > 6) drag.moved = true; if (drag.moved) { this.dragMoved = true; this.scroll = drag.s + d; this.clampScroll(); this.progC.y = this.scroll; this.drawScrollbar(); } } });
    this.input.on('pointerup', () => { drag = null; this.time.delayedCall(40, () => { this.dragMoved = false; }); });
    this.palC = this.add.container(0, 0).setDepth(26); this.buildPalette();
  }
  overProg(p) { const x = p.worldX != null ? p.worldX : p.x, y = p.worldY != null ? p.worldY : p.y; return x >= PROG.x && x <= PROG.x + PROG.w && y >= PROG.y && y <= PROG.y + PROG.h; }
  clampScroll() { const min = Math.min(0, PROG.h - (this.contentH || 0) - 12); this.scroll = Math.max(min, Math.min(0, this.scroll)); }
  scrollBy(d) { this.scroll -= d; this.clampScroll(); this.progC.y = this.scroll; this.drawScrollbar(); }
  setTab(t) { if (this.state !== 'edit') return; this.tab = t; this.sel = null; this.cursor = { list: this.curList(), idx: this.curList().length }; this.scroll = 0; this.refreshTabs(); this.renderProgram(); this.buildPalette(); KG.audio.play('tap'); }
  refreshTabs() { Object.keys(this.tabBtns).forEach(k => { this.tabBtns[k].setActive(this.tab === k); this.tabBtns[k].label.setColor(this.tab === k ? '#ffd34f' : '#f4f7ff'); }); }

  // แถบการ์ดให้เลือก (ด่านเรียงลำดับไม่มี)
  buildPalette() {
    this.palC.removeAll(true);
    this.palLabel && this.palLabel.destroy();
    if (this.lv.kind === 'order') { this.palLabel = this.txt(PANEL.x + PANEL.w / 2, PAL_Y + 60, 'แตะการ์ดสองใบ เพื่อสลับที่กัน', { size: 28, color: '#d9560a', center: true, ox: 0.5 }).setDepth(30); return; }
    const pal = this.lv.palette.filter(b => !(this.tab !== 'main' && b.t === 'call'));
    const cw = 66, ch = 76, gap = 7, perRow = Math.floor((PANEL.w - 24 + gap) / (cw + gap));
    pal.forEach((spec, i) => {
      const row = Math.floor(i / perRow), col = i % perRow, n = Math.min(perRow, pal.length - row * perRow), x0 = PANEL.x + PANEL.w / 2 - (n * (cw + gap) - gap) / 2;
      const x = x0 + col * (cw + gap) + cw / 2, y = PAL_Y + 8 + row * (ch + 7) + ch / 2, c = this.drawCardFace(spec, x, y, cw, ch, true);
      c.zone = this.add.zone(x, y, cw, ch).setInteractive({ useHandCursor: true }); c.add(c.zone); this.palC.add(c);
      c.zone.on('pointerover', () => { if (this.state === 'edit') { this.tweens.add({ targets: c, scaleX: 1.07, scaleY: 1.07, duration: 100 }); KG.audio.play('hover'); } });
      c.zone.on('pointerout', () => this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 100 }));
      c.zone.on('pointerup', () => this.addCard(spec));
    });
  }
  // ใบการ์ดหนึ่งใบ (ใช้ทั้งแถบเลือกและในโปรแกรม): ไอคอน + ชื่อสั้น
  drawCardFace(b, x, y, w, h, big) {
    const c = this.add.container(x, y), col = CARD_COLOR[b.t], css = CARD_CSS[b.t];
    const bg = this.add.graphics(); c.bg = bg;
    const draw = (stroke, sw) => { bg.clear(); bg.fillStyle(0x1b2a6b, 0.25); bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 5, w, h, 12); bg.fillStyle(0xffffff, 1); bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12); bg.fillStyle(col, 1); bg.fillRoundedRect(-w / 2, -h / 2, w, h * 0.56, { tl: 12, tr: 12, bl: 0, br: 0 }); bg.lineStyle(sw || 3, stroke == null ? 0x1b2a6b : stroke, 1); bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12); };
    c.draw = draw; draw();
    let icon, label;
    if (b.t === 'mv') { icon = MOVE_ICON[b.d]; label = MOVE_LABEL[b.d]; } else if (b.t === 'atk') { icon = 'sword'; label = 'ฟัน'; } else if (b.t === 'rep') { icon = 'repeat'; label = 'วนซ้ำ'; }
    else if (b.t === 'until') { icon = 'until'; label = 'จนถึงธง'; } else if (b.t === 'if') { icon = 'branch'; label = 'ถ้า'; } else { icon = 'func'; label = 'ท่า ' + (b.f || 'A'); }
    const isIf = b.t === 'if', small = h < 56;
    c.add(bg); c.add(KG.ui.icon(this, icon, 0, isIf ? -h * 0.22 : -h * 0.17, h * (isIf ? 0.34 : 0.46), 0xffffff));
    c.add(KG.txt(this, 0, isIf ? -h * 0.02 : h * 0.075, label, { size: small ? 12 : big ? 17 : 15, color: css, center: true, ox: 0.5, oy: 0 }));
    if (b.t === 'if') c.add(KG.txt(this, 0, -h * 0.02 + (small ? 11 : big ? 17 : 14), b.c === 'monster' ? 'มอนสเตอร์' : b.c === 'wall' ? 'กำแพง' : b.c === 'pit' ? 'หลุม' : 'ทางโล่ง', { size: small ? 10 : big ? 12 : 11, weight: 400, color: '#33456f', center: true, ox: 0.5, oy: 0 }));
    return c;
  }

  /* ---------- แก้โปรแกรม ---------- */
  touch() { if (this.dirty || this.state === 'done' || this.hero) { this.resetBoardSoft(); } this.refreshChips(); }
  resetBoardSoft() { if (this.running) return; if (this.dirty) this.resetBoard(); }
  addCard(spec) {
    if (this.state !== 'edit') return;
    if (this.lv.limit && ST.cardCount(this.prog) >= this.lv.limit) { KG.audio.play('denied'); KG.ui.toast(this, 'การ์ดเต็มแล้ว ใช้ได้ไม่เกิน ' + this.lv.limit + ' ใบ ลองใช้วนซ้ำให้สั้นลง', { accent: '#e0243d' }); return; }
    if (this.tab !== 'main' && spec.t === 'call') { KG.audio.play('denied'); KG.ui.toast(this, 'ในท่า A เรียกท่า A ซ้ำไม่ได้'); return; }
    const b = JSON.parse(JSON.stringify(spec)); b.id = this.nextId++; if (b.t === 'rep') { b.n = 3; b.body = []; } if (b.t === 'until') b.body = []; if (b.t === 'if') { b.body = []; b.other = []; }
    if (this.cursor.list !== this.curList() && !this.listAlive(this.cursor.list)) this.cursor = { list: this.curList(), idx: this.curList().length };
    this.cursor.list.splice(this.cursor.idx, 0, b); this.cursor.idx++; this.sel = null;
    if (b.body) this.cursor = { list: b.body, idx: 0 };
    KG.audio.play('pop'); this.markDirty(); this.renderProgram(); this.ensureVisible(b.id);
  }
  listAlive(list) { const seen = [this.prog.main].concat(Object.keys(this.prog.fn).map(k => this.prog.fn[k])); const walk = l => (l || []).some(b => b.body === list || b.other === list || walk(b.body) || walk(b.other)); return seen.some(l => l === list || walk(l)); }
  removeBlock(list, idx) {
    if (this.state !== 'edit') return; const b = list[idx]; list.splice(idx, 1);
    if (this.cursor.list === list) this.cursor.idx = Math.min(this.cursor.idx, list.length);
    if (!this.listAlive(this.cursor.list)) this.cursor = { list: this.curList(), idx: this.curList().length };
    this.sel = null; KG.audio.play('remove'); this.markDirty(); this.renderProgram();
  }
  moveBlock(list, idx, d) { const j = idx + d; if (j < 0 || j >= list.length) return; const t = list[idx]; list[idx] = list[j]; list[j] = t; this.sel = { list, idx: j }; KG.audio.play('tap'); this.markDirty(); this.renderProgram(); }
  tapBlock(list, idx) {
    if (this.state !== 'edit') return;
    if (this.lv.kind === 'order') {
      if (this.sel && this.sel.list === list && this.sel.idx !== idx) { const t = list[this.sel.idx]; list[this.sel.idx] = list[idx]; list[idx] = t; this.sel = null; KG.audio.play('turn'); this.markDirty(); this.renderProgram(); return; }
      this.sel = (this.sel && this.sel.list === list && this.sel.idx === idx) ? null : { list, idx }; KG.audio.play('tap'); this.renderProgram(); return;
    }
    if (this.sel && this.sel.list === list && this.sel.idx === idx) { this.sel = null; this.cursor = { list, idx: idx + 1 }; }
    else { this.sel = { list, idx }; this.cursor = { list, idx: idx + 1 }; }
    KG.audio.play('tap'); this.renderProgram();
  }
  setCount(b, d) { if (this.state !== 'edit') return; b.n = Math.max(2, Math.min(9, b.n + d)); KG.audio.play('tap'); this.markDirty(); this.renderProgram(); }
  markDirty() { this.dirty = true; this.resetBoard(); this.dirty = false; this.refreshChips(); if (this.msgPlain && /ยัง|พลาด|ตก|วนไม่จบ|ไม่ถึง/.test(this.msgPlain)) this.setMessage(this.lv.kind === 'build' ? this.goalText() : 'แก้โปรแกรมแล้วกดรันอีกครั้ง', 'info'); }
  clearProgram() {
    if (this.state !== 'edit') return;
    this.prog = this.lv.pre ? ST.cloneProg(this.lv.pre) : ST.emptyProg(); this.assignIds(this.prog); this.tab = 'main'; this.sel = null; this.scroll = 0;
    this.cursor = { list: this.prog.main, idx: this.prog.main.length }; KG.audio.play('remove'); this.markDirty(); this.refreshTabs && this.tabBtns.main && this.refreshTabs(); this.buildPalette(); this.renderProgram();
  }

  /* ---------- วาดโปรแกรม (แถวการ์ดซ้อนกล่องวนซ้ำ/เงื่อนไข) ---------- */
  renderProgram() {
    this.progC.removeAll(true); this.cardObj = {};
    const list = this.curList(), x0 = PROG.x + 12, w = PROG.w - 24, endY = this.layoutList(list, x0, PROG.y + 10, w, 0);
    if (!list.length && !(this.cursor && this.cursor.list === list && false)) {
      const t = this.txt(PROG.x + PROG.w / 2, PROG.y + 100, this.lv.kind === 'order' ? '' : 'แตะการ์ดด้านล่างเพื่อวางที่นี่', { size: 26, weight: 400, color: '#b09a6a', center: true, ox: 0.5 }); this.progC.add(t);
    }
    this.contentH = endY - PROG.y; this.clampScroll(); this.progC.y = this.scroll; this.refreshChips(); this.drawScrollbar();
  }
  drawScrollbar() {
    if (!this.sbar) this.sbar = this.add.rectangle(PROG.x + PROG.w - 5, PROG.y + 20, 6, 40, 0xff8a2b, 0.9).setDepth(27);
    const over = (this.contentH || 0) > PROG.h; this.sbar.setVisible(over); if (!over) return;
    const th = Math.max(30, PROG.h * PROG.h / this.contentH), range = PROG.h - th, p = this.contentH - PROG.h > 0 ? -this.scroll / (this.contentH - PROG.h) : 0;
    this.sbar.setSize(6, th).setPosition(PROG.x + PROG.w - 5, PROG.y + th / 2 + range * Math.max(0, Math.min(1, p)));
  }
  caret(x, y, h) {
    const r = this.add.rectangle(x, y + h / 2, 7, h + 4, 0xff7a1a, 1).setStrokeStyle(1, 0xffffff); this.progC.add(r); this.tweens.add({ targets: r, alpha: 0.25, duration: 420, yoyo: true, repeat: -1 }); return r;
  }
  layoutList(list, x0, y0, w, depth) {
    const CS = depth ? 50 : CARD; let x = x0, y = y0, rowH = 0; const isCur = i => this.cursor && this.cursor.list === list && this.cursor.idx === i && this.state === 'edit' && this.lv.kind !== 'order';
    for (let i = 0; i <= list.length; i++) {
      if (isCur(i)) this.caret(x - 5, y, i < list.length && ['rep', 'until', 'if'].includes(list[i].t) ? 20 : CS);
      if (i === list.length) break;
      const b = list[i], cont = b.t === 'rep' || b.t === 'until' || b.t === 'if';
      if (cont) {
        if (x !== x0) { y += rowH + GAP; x = x0; rowH = 0; }
        const hh = this.drawContainer(b, list, i, x0, y, w, depth); y += hh + GAP; x = x0; rowH = 0;
      } else {
        if (x + CS > x0 + w) { y += rowH + GAP; x = x0; rowH = 0; }
        this.drawBlock(b, list, i, x + CS / 2, y + CS / 2, CS); x += CS + GAP; rowH = Math.max(rowH, CS);
      }
    }
    // พื้นที่ว่างท้ายรายการ: แตะเพื่อวางต่อท้าย
    const tailW = Math.max(40, x0 + w - x);
    const z = this.add.rectangle(x + tailW / 2, y + (rowH || CS) / 2, tailW, rowH || CS, 0xffffff, 0.001).setInteractive({ useHandCursor: true }); this.progC.add(z); z.setDepth(-1);
    z.on('pointerup', () => { if (this.state !== 'edit' || (this.dragMoved)) return; this.cursor = { list, idx: list.length }; this.sel = null; KG.audio.play('tap'); this.renderProgram(); });
    if (!list.length && depth === 0 && this.lv.kind !== 'order') return y + CS;
    return y + (rowH || (list.length ? 0 : CS));
  }
  drawBlock(b, list, idx, cx, cy, cs) {
    cs = cs || CARD; const c = this.drawCardFace(b, cx, cy, cs, cs, false), selected = this.sel && this.sel.list === list && this.sel.idx === idx; this.progC.add(c); this.cardObj[b.id] = c;
    if (b.t === 'if') { /* ถ้าแบบการ์ดเดี่ยวไม่ใช้ */ }
    if (selected) { c.draw(0xffd34f, 5); this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120 }); this.selectBadges(c, list, idx, cs); }
    c.zone = this.add.zone(0, 0, cs, cs).setInteractive({ useHandCursor: true }); c.add(c.zone); c.zone.on('pointerup', () => { if (!this.dragMoved) this.tapBlock(list, idx); });
    return c;
  }
  selectBadges(c, list, idx, cw) {
    if (this.lv.kind === 'order') return;
    const del = this.add.container(cw / 2 - 2, -cw / 2 + 2), dbg = this.add.circle(0, 0, 15, 0xe0243d).setStrokeStyle(3, 0xffffff); del.add(dbg); del.add(KG.ui.icon(this, 'close', 0, 0, 16, 0xffffff)); c.add(del);
    del.setSize(32, 32).setInteractive({ useHandCursor: true }); del.on('pointerup', () => this.removeBlock(list, idx));
    if (idx > 0) { const l = this.add.container(-cw / 2 + 4, cw / 2 + 14), lb = this.add.circle(0, 0, 14, 0x2b8cff).setStrokeStyle(3, 0xffffff); l.add(lb); l.add(KG.ui.icon(this, 'chevL', 0, 0, 16, 0xffffff)); c.add(l); l.setSize(30, 30).setInteractive({ useHandCursor: true }); l.on('pointerup', () => this.moveBlock(list, idx, -1)); }
    if (idx < list.length - 1) { const r = this.add.container(cw / 2 - 4, cw / 2 + 14), rb = this.add.circle(0, 0, 14, 0x2b8cff).setStrokeStyle(3, 0xffffff); r.add(rb); r.add(KG.ui.icon(this, 'chevR', 0, 0, 16, 0xffffff)); c.add(r); r.setSize(30, 30).setInteractive({ useHandCursor: true }); r.on('pointerup', () => this.moveBlock(list, idx, 1)); }
  }
  drawContainer(b, list, idx, x0, y0, w, depth) {
    const col = CARD_COLOR[b.t], css = CARD_CSS[b.t], HH = 38, selected = this.sel && this.sel.list === list && this.sel.idx === idx;
    const g = this.add.graphics(); this.progC.add(g); this.cardObj[b.id] = g; g.hl = false;
    const inner = x0 + 14, iw = w - 28; let y = y0 + HH + 6;
    // ลำดับวาด: หัวกล่อง แล้วเนื้อใน (คำนวณความสูงก่อนแล้ววาดพื้นหลังทีหลังเพื่อให้อยู่ใต้การ์ด)
    const objsBefore = this.progC.length;
    const head = this.add.container(x0, y0); this.progC.add(head);
    let title = b.t === 'rep' ? 'วนซ้ำ' : b.t === 'until' ? 'ทำซ้ำจนกว่าจะถึงธง' : 'ถ้า ' + COND_LABEL[b.c];
    head.add(KG.ui.icon(this, b.t === 'rep' ? 'repeat' : b.t === 'until' ? 'until' : 'branch', 24, HH / 2, 28, 0xffffff));
    head.add(KG.txt(this, 46, HH / 2, title, { size: b.t === 'if' ? 18 : 22, color: '#ffffff', middle: true, oy: 0.5 }));
    if (b.t === 'rep') {
      const mk = (x, sym, d) => { const bb = this.add.circle(x, HH / 2, 15, 0xffffff).setStrokeStyle(2, 0x1b2a6b); head.add(bb); head.add(KG.ui.icon(this, sym, x, HH / 2, 16, col)); bb.setInteractive({ useHandCursor: true }); bb.on('pointerup', () => this.setCount(b, d)); };
      mk(w - 124, 'minus', -1); head.add(KG.txt(this, w - 88, HH / 2, '× ' + b.n, { size: 26, color: '#ffffff', center: true, middle: true })); mk(w - 52, 'plus', 1);
    }
    const hz = this.add.zone(w / 2 - (b.t === 'rep' ? 70 : 0), HH / 2, w - (b.t === 'rep' ? 160 : 60), HH).setInteractive({ useHandCursor: true }); head.add(hz); hz.on('pointerup', () => { if (!this.dragMoved) this.tapBlock(list, idx); });
    if (selected) this.containerBadges(head, list, idx, w);
    const bodyY = y0 + HH + 6; let bh = this.layoutList(b.body, inner, bodyY, iw, depth + 1) - bodyY; if (!b.body.length) bh = Math.max(bh, 0); const bodyMin = 40; bh = Math.max(bh, bodyMin); y = bodyY + bh + 6;
    let total = HH + 6 + bh + 10;
    let elseY = 0, eh = 0;
    if (b.t === 'if') {
      elseY = y; const eHead = this.add.container(x0, elseY); this.progC.add(eHead); eHead.add(KG.txt(this, 20, 17, 'ไม่งั้น', { size: 20, color: '#ffffff', middle: true, oy: 0.5 }));
      const ey = elseY + 34; eh = Math.max(this.layoutList(b.other, inner, ey, iw, depth + 1) - ey, bodyMin); total = (ey + eh + 10) - y0; this.cardObj[b.id + ':else'] = eHead;
      g.clear(); g.fillStyle(col, 1); g.fillRoundedRect(x0, y0, w, total, 14); g.fillStyle(0xffffff, 0.92); g.fillRoundedRect(x0 + 6, bodyY - 2, w - 12, bh + 4, 10); g.fillRoundedRect(x0 + 6, ey - 2, w - 12, eh + 4, 10);
      g.fillStyle(col, 1); g.fillRoundedRect(x0, elseY, w, 30, 4); g.lineStyle(selected ? 5 : 3, selected ? 0xffd34f : 0x1b2a6b, 1); g.strokeRoundedRect(x0, y0, w, total, 14);
    } else {
      g.clear(); g.fillStyle(col, 1); g.fillRoundedRect(x0, y0, w, total, 14); g.fillStyle(0xffffff, 0.92); g.fillRoundedRect(x0 + 6, bodyY - 2, w - 12, bh + 4, 10);
      g.lineStyle(selected ? 5 : 3, selected ? 0xffd34f : 0x1b2a6b, 1); g.strokeRoundedRect(x0, y0, w, total, 14);
    }
    // ย้ายพื้นหลังไว้หลังเนื้อหา แต่เหนือพื้นที่ว่างท้ายรายการ
    this.progC.sendToBack(g); this.progC.bringToTop(head);
    if (b.t === 'if') { this.progC.bringToTop(this.cardObj[b.id + ':else']); }
    // ช่องว่างในกล่องที่ยังไม่มีการ์ด: แตะเพื่อวางที่นี่
    const slot = (list, sy, sh, label) => { if (list.length) return; const z = this.add.rectangle(inner + iw / 2, sy + sh / 2, iw, sh, 0xfff6dd, 0.9).setStrokeStyle(2, col); this.progC.add(z); z.setInteractive({ useHandCursor: true }); const lab = this.txt(inner + iw / 2, sy + sh / 2, label, { size: 20, weight: 400, color: css, center: true, middle: true }); this.progC.add(lab); z.on('pointerup', () => { if (this.state !== 'edit' || this.dragMoved) return; this.cursor = { list, idx: 0 }; this.sel = null; KG.audio.play('tap'); this.renderProgram(); }); };
    slot(b.body, bodyY, bh, this.cursor && this.cursor.list === b.body ? 'วางการ์ดข้างในนี้' : 'แตะเพื่อวางการ์ดตรงนี้');
    if (b.t === 'if') slot(b.other, elseY + 34, eh, this.cursor && this.cursor.list === b.other ? 'วางการ์ดข้างในนี้' : 'แตะเพื่อวางการ์ดตรงนี้');
    if (!b.body.length && this.cursor && this.cursor.list === b.body) this.caret(inner - 4, bodyY + 8, 40);
    if (b.t === 'if' && !b.other.length && this.cursor && this.cursor.list === b.other) this.caret(inner - 4, elseY + 34 + 8, 40);
    return total;
  }
  containerBadges(head, list, idx, w) {
    const del = this.add.container(w - 14, -4), dbg = this.add.circle(0, 0, 15, 0xe0243d).setStrokeStyle(3, 0xffffff); del.add(dbg); del.add(KG.ui.icon(this, 'close', 0, 0, 16, 0xffffff)); head.add(del); del.setSize(32, 32).setInteractive({ useHandCursor: true }); del.on('pointerup', () => this.removeBlock(list, idx));
    if (idx > 0) { const l = this.add.container(w - 62, -4), lb = this.add.circle(0, 0, 14, 0x2b8cff).setStrokeStyle(3, 0xffffff); l.add(lb); l.add(KG.ui.icon(this, 'chevU', 0, 0, 16, 0xffffff)); head.add(l); l.setSize(30, 30).setInteractive({ useHandCursor: true }); l.on('pointerup', () => this.moveBlock(list, idx, -1)); }
    if (idx < list.length - 1) { const r = this.add.container(w - 38, -4), rb = this.add.circle(0, 0, 14, 0x2b8cff).setStrokeStyle(3, 0xffffff); r.add(rb); r.add(KG.ui.icon(this, 'chevD', 0, 0, 16, 0xffffff)); head.add(r); r.setSize(30, 30).setInteractive({ useHandCursor: true }); r.on('pointerup', () => this.moveBlock(list, idx, 1)); }
  }
  ensureVisible(id) {
    const o = this.cardObj[id]; if (!o) return; const by = (o.y != null ? o.y : 0) + this.scroll;
    if (by > PROG.y + PROG.h - 70) { this.scroll -= (by - (PROG.y + PROG.h - 70)); this.clampScroll(); this.progC.y = this.scroll; }
  }
  clearHighlight() { if (this.hlObj) { try { this.hlObj.draw && this.hlObj.draw(0x1b2a6b, 3); } catch (e) { /* ใบถูกวาดใหม่แล้ว */ } this.hlObj = null; } if (this.hlTw) { this.hlTw.remove(); this.hlTw = null; } }
  highlight(id) {
    this.clearHighlight(); if (id == null) return; const o = this.cardObj[id]; if (!o) return;
    this.hlObj = o; if (o.draw) { o.draw(0xffd34f, 6); } else if (o.lineStyle) { /* กล่องเป็นกราฟิก: กะพริบด้วยความโปร่งใส */ }
    this.hlTw = this.tweens.add({ targets: o, alpha: 0.55, duration: 160, yoyo: true, repeat: 1, onComplete: () => o.setAlpha && o.setAlpha(1) });
    const by = (o.y != null ? o.y : 0) + this.scroll; if (by < PROG.y + 4 || by > PROG.y + PROG.h - 60) { this.scroll = -(by - this.scroll - PROG.y - 30); this.clampScroll(); this.progC.y = this.scroll; }
  }

  /* ---------- รันโปรแกรมและเล่นภาพ ---------- */
  setRunning(v) {
    this.running = v; this.state = v ? 'run' : 'edit'; this.runBtn.setLabel(v ? 'หยุด' : 'รัน'); this.runBtn.icon.setTexture(KG.ui.iconKey(this, v ? 'stop' : 'play'));
    this.palC.setAlpha(v ? 0.45 : 1); if (v) { this.sel = null; }
  }
  stopRun() { this.runId++; this.setRunning(false); this.waitNext = null; this.resetBoard(); this.renderProgram(); this.setMessage(this.goalText(), 'info'); }
  async runProgram() {
    if (this.running) return;
    if (this.stepWait) { const f = this.stepWait; this.stepWait = null; f(); return; }
    if (!this.prog.main.length && this.lv.kind !== 'order') { KG.audio.play('denied'); KG.ui.toast(this, 'วางการ์ดลงในโปรแกรมก่อนนะ'); return; }
    if (this.lv.limit && ST.cardCount(this.prog) > this.lv.limit) { KG.audio.play('denied'); KG.ui.toast(this, 'ใช้การ์ดเกิน ' + this.lv.limit + ' ใบ'); return; }
    this.resetBoard(); this.attempts++; const id = ++this.runId; this.setRunning(true); this.renderProgram(); this.sel = null;
    const res = ST.evaluate(this.lv, this.prog, this.attempts); this.lastRes = res;
    this.setMessage('กำลังทำงาน...', 'info');
    try { await this.playEvents(res.events, id); } catch (e) { if (e !== 'cancel') throw e; return; }
    if (id !== this.runId) return;
    this.clearHighlight(); this.setRunning(false); this.finishRun(res);
  }
  async playEvents(events, id) {
    for (const ev of events) {
      if (id !== this.runId) throw 'cancel';
      while (this.paused) { await new Promise(r => this.time.delayedCall(120, r)); if (id !== this.runId) throw 'cancel'; }
      await this.playEvent(ev, id);
    }
  }
  async playEvent(ev, id) {
    const T = this.T, hero = this.hero, WD = WORLDS[this.W - 1];
    switch (ev.op) {
      case 'enter': {
        this.highlight(ev.id);
        if (this.stepMode) { this.setMessage('แตะ "รัน" เพื่อไปคำสั่งถัดไป', 'info'); await new Promise(r => { this.stepWait = r; }); if (id !== this.runId) throw 'cancel'; }
        else await this.sleep(110);
        break;
      }
      case 'loop': await this.sleep(60); break;
      case 'test': await this.sayBubble(ev.yes ? 'ใช่' : 'ไม่ใช่', ev.yes ? 0x22b45a : 0xe0243d, 480); break;
      case 'move': {
        const dir = ev.dir; this.face(dir); const p = this.cellXY(ev.to[0], ev.to[1]), r = ev.to[1];
        KG.audio.play('step'); KG.art.frame(hero, 'step'); hero.setDepth(13 + r * 10);
        await Promise.all([this.tw({ targets: hero, x: p.x, y: p.y + T * 0.34, duration: 340, ease: 'Sine.easeInOut' }), this.tw({ targets: this.heroShadow, x: p.x, y: p.y + T * 0.34, duration: 340, ease: 'Sine.easeInOut' })]);
        KG.art.frame(hero, 'idle'); this.heroAt = { c: ev.to[0], r: ev.to[1] }; break;
      }
      case 'bump': {
        this.face(ev.dir); const [dx, dy] = ST.DIRS[ev.dir]; const hx = hero.x, hy = hero.y; KG.audio.play(ev.why === 'monster' ? 'denied' : 'denied');
        await this.tw({ targets: hero, x: hx + dx * T * 0.14, y: hy + dy * T * 0.1, duration: 90, yoyo: true });
        await this.sayBubble(ev.why === 'monster' ? 'ต้องฟันก่อน' : ev.why === 'door' ? 'ประตูล็อก' : 'ชนกำแพง', 0xff8a2b, 520); break;
      }
      case 'atk': await this.doAttack(ev); break;
      case 'star': { const s = this.starObj[ST.key(ev.x, ev.y)]; this.got++; this.refreshChips(); KG.audio.play('star', { i: this.got - 1 }); if (s) { KG.fx.burst(this, s.x, s.y, { colors: [0xffd34f, 0xffffff], n: 14, max: 260, depth: 60 }); this.tweens.add({ targets: s, y: s.y - 40, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 360, onComplete: () => s.destroy() }); } await this.sleep(120); break; }
      case 'key': { this.haveKey = true; this.refreshChips(); KG.audio.play('unlock'); if (this.keyObj) { const k = this.keyObj; this.tweens.add({ targets: k, y: k.y - 50, alpha: 0, duration: 400, onComplete: () => k.destroy() }); } await this.sayBubble('ได้กุญแจ!', 0xff8a2b, 500); break; }
      case 'door': { KG.audio.play('unlock'); if (this.doorObj) { const d = this.doorObj; this.tweens.add({ targets: d, alpha: 0, scaleX: 0.2, duration: 360, onComplete: () => d.destroy() }); } await this.sleep(240); break; }
      case 'fall': { KG.audio.play('fall'); KG.art.frame(hero, 'defeat'); await Promise.all([this.tw({ targets: hero, y: hero.y + T * 0.5, alpha: 0.2, scaleX: hero.scaleX * 0.5, scaleY: hero.scaleY * 0.5, duration: 560 }), this.tw({ targets: this.heroShadow, alpha: 0, duration: 400 })]); break; }
      case 'goal': { KG.art.frame(hero, 'power'); KG.audio.play('win'); KG.fx.burst(this, hero.x, hero.y - T * 0.5, { colors: [0xffd34f, 0xffffff, 0xff3d8b], n: 30, max: 380, depth: 60 }); await this.sleep(480); break; }
      case 'timeout': { KG.art.frame(hero, 'hurt'); KG.audio.play('error'); await this.sayBubble('วนไม่จบ!', 0xe0243d, 700); break; }
    }
  }
  face(dir) { if (dir === 'left') this.hero.setFlipX(true); else if (dir === 'right') this.hero.setFlipX(false); this.facing = dir; }
  async doAttack(ev) {
    const hero = this.hero, T = this.T, dx = ST.DIRS[ev.dir][0], dy = ST.DIRS[ev.dir][1];
    KG.audio.play('swing'); KG.art.frame(hero, 'a1'); await this.sleep(90); KG.art.frame(hero, 'a2');
    const hx = hero.x; this.tw({ targets: hero, x: hx + dx * T * 0.2, y: hero.y + dy * T * 0.08, duration: 90, yoyo: true });
    const p = this.cellXY(ev.x, ev.y); KG.fx.burst(this, p.x, p.y - T * 0.3, { colors: ev.hit ? [0xffffff, 0xff3d8b, 0xffd34f] : [0xffffff], n: ev.hit ? 18 : 6, max: ev.hit ? 320 : 160, depth: 60 });
    if (ev.hit) {
      const o = this.monObj[ev.mon]; this.hp[ev.mon]--; KG.audio.play(ev.dead ? 'kill' : 'hit'); KG.fx.shake(this, 120, 0.003);
      KG.art.frame(o.img, 5); o.img.setTint(0xffffff); this.time.delayedCall(120, () => { if (o.img && o.img.scene) o.img.clearTint(); });
      const pip = o.pips[this.hp[ev.mon]]; if (pip) this.tweens.add({ targets: pip, alpha: 0.15, scaleX: 0.6, scaleY: 0.6, duration: 160 });
      await this.sleep(220);
      if (ev.dead) {
        o.alive = false; this.killed++; this.refreshChips(); KG.art.frame(o.img, 8); await this.tw({ targets: [o.img, o.sh], alpha: 0, y: '+=' + T * 0.1, duration: 420 });
        o.pips.forEach(x => x.setAlpha(0));
      } else { KG.art.frame(o.img, 0); }
    } else { await this.sayBubble('ฟันไม่โดน', 0xff8a2b, 420); }
    KG.art.frame(hero, 'idle'); await this.sleep(60);
  }
  sayBubble(str, color, ms) {
    if (this.bubble) { this.bubble.destroy(); this.bubble = null; }
    const T = this.T, h = this.hero, w = Math.max(100, KG.measure(str, '600 22px Kanit') + 30), c = this.add.container(h.x, h.y - T * 1.35).setDepth(500);
    const bg = this.add.rectangle(0, 0, w, 40, 0xffffff).setStrokeStyle(3, color); const t = KG.txt(this, 0, 0, str, { size: 22, color: '#' + color.toString(16).padStart(6, '0'), center: true, middle: true }); c.add([bg, t]); this.bubble = c; c.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 120 });
    return new Promise(res => this.time.delayedCall(ms / this.speed, () => { this.tweens.add({ targets: c, alpha: 0, duration: 120, onComplete: () => { c.destroy(); if (this.bubble === c) this.bubble = null; res(); } }); }));
  }

  /* ---------- สรุปผลหลังรัน ---------- */
  finishRun(res) {
    const lv = this.lv, WD = WORLDS[this.W - 1];
    if (res.win) {
      if (this.tutor) this.tutor.finish(true);
      let stars = this.usedSol ? Math.min(1, res.stars) : res.stars;
      const key = skey(this.W, this.N); let newBest = false;
      if (!this.seed) { if (stars > (SAVE.data.stars[key] || 0)) { SAVE.data.stars[key] = stars; newBest = true; } } else SAVE.data.practice = (SAVE.data.practice || 0) + 1; SAVE.save();
      KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 160); this.setMessage('ถึงธงแล้ว เก่งมาก!', 'good');
      const next = this.N < 10 && !this.seed, rows = [['ดาวที่เก็บได้', res.collected + ' / ' + res.totalStars], ['จำนวนการ์ดที่ใช้', res.cards + ' ใบ (3 ดาวต้องไม่เกิน ' + lv.par + ')'], ['ครั้งที่ลอง', String(this.attempts)]];
      const tip = (this.N === 10 && !this.seed ? 'จบโลก ' + WD.title + ' แล้ว! ' : '') + 'ความรู้: ' + WD.concept;
      this.time.delayedCall(700, () => KG.results(this, { stat: { lvl: this.W + ':' + this.N, stars, m: this.fails, h: this.usedSol ? 1 : 0, secs: Math.round((Date.now() - this._t0) / 1000), practice: !!this.seed },
        win: true, stars, title: this.seed ? 'ผ่านด่านฝึกสุ่ม!' : 'ผ่านด่าน ' + this.N + '!', body: stars === 3 ? 'สมบูรณ์แบบ ใช้การ์ดน้อยที่สุด' : stars === 2 ? 'เก็บดาวครบ ลองใช้การ์ดให้น้อยลงเพื่อ 3 ดาว' : 'ถึงธงแล้ว ลองเก็บดาวให้ครบ' , rows, tip,
        buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { level: this.N }) }, this.seed ? { label: 'สุ่มใหม่', style: 'violet', icon: 'reset', onClick: () => this.go('Play', { world: this.W, level: this.N, seed: 1 + Math.floor(Math.random() * 1e8) }) } : { label: 'เล่นอีกครั้ง', style: 'cyan', icon: 'reset', onClick: () => this.go('Play', { world: this.W, level: this.N }) }].concat(next ? [{ label: 'ด่านถัดไป', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Play', { world: this.W, level: this.N + 1 }) }] : [])
      }));
      return;
    }
    this.fails++; KG.art.frame(this.hero, res.result === 'fall' ? 'defeat' : 'hurt'); this.state = 'edit'; this.dirty = true;
    const msg = res.result === 'fall' ? 'ตกหลุม! ลองหลบหลุมแล้วรันอีกครั้ง' : res.result === 'timeout' ? 'โปรแกรมวนไม่จบ ตรวจการ์ดวนซ้ำและเงื่อนไขอีกครั้ง' : res.result === 'win' ? '' : res.collected < res.totalStars && res.x === lv.map.goal[0] ? 'ยังเก็บดาวไม่ครบ' : 'ยังไปไม่ถึงธง ดูว่าไรเดอร์หยุดตรงไหน แล้วแก้โปรแกรม';
    this.setMessage(msg, 'bad'); KG.audio.play('lose');
    if (this.fails >= 2) this.hintBtn.pulse && !this.hintPulse && (this.hintPulse = true, this.hintBtn.pulse());
  }
  showHint() {
    if (this.state !== 'edit') return; const lv = this.lv, btns = [{ label: 'เข้าใจแล้ว', style: 'primary', icon: 'check', pulse: true }];
    let body = lv.hint + (lv.kind === 'fix' && this.fails >= 2 && lv.bug ? '\nบั๊กของด่านนี้: ' + lv.bug : '');
    if (this.fails >= 3) btns.unshift({ label: 'ดูเฉลย', style: 'danger', icon: 'bulb', onClick: () => this.showSolution() });
    KG.ui.modal(this, { title: 'คำใบ้', w: 760, accent: KG.C.sun, body, buttons: btns });
  }
  showSolution() {
    this.usedSol = true; this.prog = ST.cloneProg(this.lv.sol); this.nextId = 1; this.assignIds(this.prog); this.tab = 'main'; this.sel = null; this.scroll = 0;
    this.cursor = { list: this.prog.main, idx: this.prog.main.length }; this.resetBoard(); this.buildPalette(); if (this.tabBtns.main) this.refreshTabs(); this.renderProgram();
    this.setMessage('นี่คือโปรแกรมเฉลย กดรันดูว่าทำงานอย่างไร (ดูเฉลยแล้วจะได้ 1 ดาว)', 'info');
  }
  pause() {
    if (this.state === 'pause' || this._modal) return; const prev = this.state; this.paused = true;
    KG.pauseMenu(this, { onExit: () => this.leave(), onRestart: () => this.go('Play', this._restartData), onResume: () => { this.paused = false; } });
  }
  onKey(e) {
    if (this._modal || this.state === 'run' && e.code !== 'Space') return;
    const M = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.code];
    if (M && this.state === 'edit' && this.lv.kind !== 'order') { e.preventDefault && e.preventDefault(); this.addCard({ t: 'mv', d: M }); }
    else if (e.code === 'KeyA' && this.state === 'edit' && this.lv.palette.some(b => b.t === 'atk')) this.addCard({ t: 'atk' });
    else if (e.code === 'Enter' && this.state === 'edit') this.runProgram();
    else if ((e.code === 'Backspace' || e.code === 'Delete') && this.state === 'edit') { e.preventDefault && e.preventDefault(); if (this.sel) this.removeBlock(this.sel.list, this.sel.idx); else if (this.cursor && this.cursor.idx > 0) this.removeBlock(this.cursor.list, this.cursor.idx - 1); }
    else if (e.code === 'Space') { e.preventDefault && e.preventDefault(); if (this.running) this.stopRun(); }
  }

  /* ---------- บทสอนเล่น (ด่านแรกของแต่ละโลก) ---------- */
  showIntro() {
    const WD = WORLDS[this.W - 1];
    KG.ui.modal(this, { title: 'โลก ' + this.W + ' · ' + WD.skill, w: 820, accent: Phaser.Display.Color.HexStringToColor(WD.color).color, body: WD.concept + '\n\n' + WD.desc, buttons: [{ label: 'เล่นบทสอน', style: 'cyan', icon: 'play', onClick: () => this.time.delayedCall(250, () => this.startTutor()) }, { label: 'เริ่มเลย', style: 'primary', icon: 'check', pulse: true, onClick: () => { SAVE.data.tutorDone[this.W] = true; SAVE.save(); } }] });
  }
  startTutor() {
    if (this.tutor) return; const M = this.lv.map, W = this.W, R = (x, y, w, h) => ({ x, y, w, h }), steps = [];
    const boardRect = R(BOARD.x, BOARD.y + 40, BOARD.w, BOARD.h - 40);
    steps.push({ text: 'ยินดีต้อนรับสู่ Techno Steps! งานของเราคือเรียงการ์ดคำสั่งให้ไรเดอร์เดินไปถึงธงสีแดง', target: boardRect, pad: 2, pos: 'bottom' });
    if (W <= 2 || true) steps.push({ text: 'แตะการ์ดลูกศรด้านล่างเพื่อวางลงในโปรแกรม ลองวางสัก 2 ใบ ไรเดอร์จะทำตามลำดับที่เราวางไว้', target: R(PANEL.x, PAL_Y, PANEL.w, 170), pad: 4, mode: 'wait', block: false, pos: 'top', until: () => ST.cardCount(this.prog) >= 2 });
    steps.push({ text: 'การ์ดที่วางแล้วจะอยู่ในกรอบนี้ แตะการ์ดเพื่อเลือก แล้วกด ✕ เพื่อลบ หรือกดลูกศรเล็กเพื่อย้ายที่', target: R(PROG.x, PROG.y, PROG.w, PROG.h), pad: 4, pos: 'bottom' });
    steps.push({ text: 'พร้อมแล้วกดปุ่ม "รัน" ดูไรเดอร์ทำตามโปรแกรมทีละใบ ถ้าไม่ถึงธง ก็แก้การ์ดแล้วลองใหม่ได้ไม่จำกัด', target: R(760, 620, 270, 80), pad: 6, mode: 'wait', block: false, pos: 'top', until: () => this.attempts >= 1 });
    steps.push({ text: 'ดาวบนกระดานให้เก็บระหว่างทาง ใช้การ์ดน้อยที่สุดจะได้ 3 ดาว ลองดูนะ สู้ ๆ!', pos: 'bottom', at: { x: 716, y: 440 }, dim: false });
    this.tutor = new KG.Tutor(this, steps, { hero: WORLDS[W - 1].hero, onDone: () => { this.tutor = null; SAVE.data.tutorDone[W] = true; SAVE.save(); } });
  }
}
