/* ===== ฉากเล่น Techno Math: กระดาษทด (ซ้าย) · แป้นตัวเลข (ซ้ายล่าง) · สนามต่อสู้ ครูไรเดอร์ ปุ่มคำใบ้ (ขวา) =====
   โครงหน้าจอตายตัว: HUD y0–72 · กระดาษ x20–888 y80–602 · แป้น y612–710 · สนาม x900–1260 y80–342 · ครู y352–602 · ปุ่ม y612–710
   ทุกอย่างทำได้ด้วยคีย์บอร์ด (อ่านปุ่มจาก KeyboardEvent.code จึงพิมพ์ตัวเลขได้แม้แป้นเป็นภาษาไทย) และแตะบนจอ */
// กระดาษทดสูงเต็มจอ (หารยาวตัวใหญ่) · แป้นตัวเลขแบบ Numpad แนวตั้งข้างกระดาษ (มีปุ่มคำใบ้/สาธิตด้านบน) · ขวา: สนามต่อสู้ + ครูไรเดอร์
const AREA = { paper: { x: 20, y: 80, w: 604, h: 630 }, pad: { x: 632, y: 80, w: 258, h: 630 }, battle: { x: 900, y: 80, w: 360, h: 262 }, teach: { x: 900, y: 352, w: 360, h: 358 } };
const DIGIT_MODES = { column: 1, mul2: 1, sdiv: 1, ldiv: 1 };
const SPEED_SECS = 60;

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(d) {
    d = d || {}; this.tid = d.topic || 'count'; this.L = d.level || 1; this.wantDemo = !!d.demo; this.cfg = d.cfg || null; this._restartData = { topic: this.tid, level: this.L, cfg: this.cfg };
    this._modal = null; this.paper = null; this.battle = null; this.cur = null; this.modalKeys = null; this.padBtns = {}; this.pips = []; this.timerBar = null; this.demoing = false; this.paused = false; this.over = false; this.stampImg = null;
  }
  create() {
    this.T = MG.TOP[this.tid]; this.Wd = worldOf(this.T.world); this.speed = !!this.T.speed; this.custom = !!(this.speed && this.cfg); const wi = MW.indexOf(this.Wd);   // custom = คิดเลขเร็วโหมดกำหนดเอง (ชุดโจทย์ n ข้อ เวลาจำกัดหรือไม่จับเวลา)
    this.setup('#060a1e'); KG.audio.music(this.speed ? 'action' : ['groove', 'think', 'bounce', 'breeze'][wi % 4]);
    this.seed = (Date.now() % 1000000007) >>> 0; this.R = MG.rng(this.seed + 17);
    this.qs = this.custom ? MG.speedSet(this.cfg.ops, this.cfg.grade, this.cfg.n, this.seed) : this.speed ? [] : MG.set(this.tid, this.L, this.seed); this.N = this.qs.length;
    this.qi = 0; this.mist = 0; this.hints = 0; this.shown = 0; this.combo = 0; this.bestCombo = 0; this.score = 0; this.solved = 0; this.kills = 0; this.t0 = Date.now(); this.timeLimit = this.custom ? this.cfg.secs : SPEED_SECS; this.timeLeft = this.timeLimit; this.correct = 0; this.elapsed = 0;
    this.buildBg(); this.buildHud(); this.buildPaperBg(); this.buildPad(); this.buildTeach(); this.buildActs();
    this.battle = new Battle(this, AREA.battle, this.Wd);
    this.spawnMonster(true);
    this.input.keyboard.on('keydown', e => this.onKey(e));
    if (this.speed) { this.state = 'ready'; this.time.delayedCall(500, () => KG.countdown(this, 'GO!', () => { this.state = 'play'; this.startQ(); })); }
    else if (!SAVE.data.seen[this.tid]) { this.state = 'ready'; this.time.delayedCall(450, () => this.showIntro()); }
    else { this.state = 'play'; this.startQ(); if (this.wantDemo) this.time.delayedCall(600, () => this.demo()); }
  }
  spawnMonster(first) {
    const W = this.Wd, boss = !this.speed && this.L === 5, id = boss ? W.boss : W.mons[(this.L + this.kills) % W.mons.length];
    this.battle.setMonster(id, boss, this.speed ? 5 : this.N);
    if (!first) KG.ui.toast(this, 'มอนสเตอร์ตัวใหม่มาแล้ว!', { ms: 1200 });
  }

  /* ---------- ฉากหลัง HUD กระดาษ ---------- */
  buildBg() {
    const bg = this.add.image(GW / 2, GH / 2, 'arena_' + this.Wd.arena).setDisplaySize(GW * 1.1, GH * 1.1).setAlpha(0.55);
    this.tweens.add({ targets: bg, scaleX: bg.scaleX * 1.04, scaleY: bg.scaleY * 1.04, duration: 14000, yoyo: true, repeat: -1 });
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x050818, 0.72);
    const g = this.add.graphics(); g.lineStyle(1, hexInt(this.Wd.color), 0.08); for (let x = 0; x < GW; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, GH); g.strokePath(); } for (let y = 0; y < GH; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(GW, y); g.strokePath(); }
    KG.fx.ambient(this, { freq: 300, colors: [hexInt(this.Wd.color), 0xffffff, 0x4ef4d2], s: 0.3, alpha: 0.5 });
  }
  buildHud() {
    const g = this.add.graphics().setDepth(1); g.fillStyle(0x050818, 0.88); g.fillRect(0, 0, GW, 72); g.fillStyle(hexInt(this.Wd.color), 1); g.fillRect(0, 70, GW, 3);
    iconButton(this, 44, 36, 'pause', () => this.pause(), { w: 56, h: 50, depth: 5 });
    this.txt(86, 4, this.custom ? speedLabel(this.cfg) : this.Wd.th + ' · ' + this.Wd.en + ' · เหมาะกับ ' + gradeTag(this.T.grade) + ' ขึ้นไป', { size: 15, color: this.Wd.color }).setDepth(5);
    const tt = this.txt(86, 22, this.custom ? 'คิดเลขเร็ว · กำหนดเอง' : this.T.th + '  ระดับ ' + this.L, { size: 30, stroke: true }).setDepth(5);
    if (!this.custom) this.txt(96 + tt.width, 34, this.T.lv[this.L - 1], { size: 18, color: '#9fb0d8' }).setDepth(5);
    this.scoreT = this.txt(1040, 36, '0', { size: 30, color: '#ffd34f', ox: 1, oy: 0.5, stroke: '#050818' }).setDepth(5);
    this.txt(1040, 8, 'คะแนน', { size: 13, color: '#9fb0d8', ox: 1 }).setDepth(5);
    addSystemButtons(this, 1086, 36, 64, ['sfx', 'music', 'fs']).forEach(b => b.setDepth(5).setScale(0.86));
    if (this.speed) {
      if (this.timeLimit) this.timerBar = KG.ui.bar(this, 560, 22, 300, 26, { color: 0x4ef4d2, value: 1 }).setDepth(5);
      this.timerT = this.txt(this.timeLimit ? 870 : 560, this.timeLimit ? 36 : 30, !this.custom ? SPEED_SECS + ' วิ' : this.timeLimit ? mmss(this.timeLimit) : 'เวลา 0:00', { size: 24, color: '#4ef4d2', oy: 0.5 }).setDepth(5);
      this.killT = this.txt(560, 50, this.custom ? 'ข้อที่ 1 / ' + this.N : '', { size: 14, color: '#9fb0d8' }).setDepth(5);
    } else {
      const n = this.N, x0 = 720 - n * 14;
      for (let i = 0; i < n; i++) { const p = this.add.graphics().setDepth(5); p.x = x0 + i * 28; p.y = 36; this.pips.push(p); }
      this.drawPips();
    }
  }
  drawPips() {
    this.pips.forEach((p, i) => { p.clear(); const st = i < this.qi ? 2 : i === this.qi ? 1 : 0, col = st === 2 ? 0x5ef08a : st === 1 ? 0xffd34f : 0x2f3d84; p.fillStyle(col, 1); p.fillPoints([{ x: 0, y: -11 }, { x: 10, y: 0 }, { x: 0, y: 11 }, { x: -10, y: 0 }], true); if (st === 1) { p.lineStyle(2, 0xffffff, 1); p.strokePoints([{ x: 0, y: -14 }, { x: 13, y: 0 }, { x: 0, y: 14 }, { x: -13, y: 0 }], true); } });
  }
  buildPaperBg() {
    const P = AREA.paper; KG.ui.panel(this, P.x, P.y, P.w, P.h, { accent: this.Wd.color, accent2: '#4ef4d2', cuts: [18, 0, 18, 0] }).setDepth(2);
    const g = this.add.graphics().setDepth(3), x = P.x + 8, y = P.y + 8, w = P.w - 16, h = P.h - 16;
    g.fillStyle(0xfbf8ef, 1); g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(1, 0xd8e5f6, 1); for (let gx = x + 60; gx < x + w; gx += 30) { g.beginPath(); g.moveTo(gx, y + 4); g.lineTo(gx, y + h - 4); g.strokePath(); } for (let gy = y + 30; gy < y + h; gy += 30) { g.beginPath(); g.moveTo(x + 4, gy); g.lineTo(x + w - 4, gy); g.strokePath(); }
    g.lineStyle(2.5, 0xf2a0a0, 1); g.beginPath(); g.moveTo(x + 50, y + 2); g.lineTo(x + 50, y + h - 2); g.strokePath();
    for (let hy = y + 60; hy < y + h - 20; hy += 110) { g.fillStyle(0x0b1240, 1); g.fillCircle(x + 24, hy, 9); g.lineStyle(2, 0xc9d3e8, 1); g.strokeCircle(x + 24, hy, 9); }
  }
  /* ---------- แป้นตัวเลขแบบ Numpad ของคีย์บอร์ดจริง: 7 8 9 อยู่บน · 0 กว้างสองช่อง · ⌫ และ Enter (ตรวจ) สูงสองแถวทางขวา ---------- */
  buildPad() {
    const A = AREA.pad, col = hexInt(this.Wd.color); KG.ui.panel(this, A.x, A.y, A.w, A.h, { accent: this.Wd.color, cuts: [16, 0, 16, 0] }).setDepth(2);
    // หัวแผงแบบแป้นจริง: ไฟ NUM ติด + ชื่อแผง + ปุ่มดูคีย์ลัด
    const led = this.add.circle(A.x + 22, A.y + 26, 6, 0x5ef08a).setDepth(5); this.tweens.add({ targets: led, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
    this.txt(A.x + 34, A.y + 26, 'NUM', { size: 14, color: '#5ef08a', oy: 0.5 }).setDepth(5); this.txt(A.x + 78, A.y + 26, 'แป้นตัวเลข', { size: 18, color: '#dbe4ff', oy: 0.5 }).setDepth(5);
    const mk = (x, w, label, icon, style, key, fn) => { const b = new KG.ui.Button(this, x, A.y + 82, w, 54, { label, icon, style, size: 19, slant: 6, onClick: fn }).setDepth(5); this.txt(x + w / 2 - 6, A.y + 52, key, { size: 13, color: '#050818', ox: 1 }).setDepth(7).setBackgroundColor('#ffd34f').setPadding(4, 0, 4, 0); return b; };
    this.keysBtn = new KG.ui.Button(this, A.x + A.w - 34, A.y + 26, 46, 34, { icon: 'key', style: 'ghost', size: 16, slant: 4, onClick: () => this.openKeys() }).setDepth(5);
    this.hintBtn = mk(A.x + 68, 118, 'คำใบ้', 'bulb', 'sun', 'H', () => this.hint());
    this.demoBtn = mk(A.x + A.w - 68, 118, 'สาธิต', 'eye', 'cyan', 'S', () => this.demo());
    if (this.speed) this.demoBtn.setEnabled(false);
    // จอเล็กแบบเครื่องคิดเลข: บอกวิธีกดของโจทย์ข้อนี้
    const sc = this.add.graphics().setDepth(4), sy = A.y + 132, sh = 120; sc.fillStyle(0x06102e, 1).fillRoundedRect(A.x + 12, sy, A.w - 24, sh, 12); sc.lineStyle(2, col, 0.6).strokeRoundedRect(A.x + 12, sy, A.w - 24, sh, 12);
    sc.fillStyle(0x4ef4d2, 0.06).fillRoundedRect(A.x + 16, sy + 4, A.w - 32, sh / 2 - 4, 10);
    this.padNote = this.txt(A.x + A.w / 2, sy + sh / 2, '', { size: 18, color: '#9ffcea', center: true, middle: true, lineSpacing: 4 }).setDepth(6); this.padNoteW = A.w - 44;
    // ปุ่ม: [แถว, คอลัมน์, กว้างกี่ช่อง, สูงกี่แถว]
    const KW = 56, KH = 68, G = 6, x0 = A.x + (A.w - (KW * 4 + G * 3)) / 2, y0 = A.y + A.h - 12 - (KH * 4 + G * 3);
    const LAYOUT = { 7: [0, 0], 8: [0, 1], 9: [0, 2], 4: [1, 0], 5: [1, 1], 6: [1, 2], 1: [2, 0], 2: [2, 1], 3: [2, 2], 0: [3, 0, 2], '.': [3, 2], '⌫': [0, 3, 1, 2], '✓': [2, 3, 1, 2] };
    Object.keys(LAYOUT).forEach(k => {
      const [r, c, cw, rh] = LAYOUT[k], w = KW * (cw || 1) + G * ((cw || 1) - 1), h = KH * (rh || 1) + G * ((rh || 1) - 1);
      this.padBtns[k] = this.keycap(x0 + c * (KW + G) + w / 2, y0 + r * (KH + G) + h / 2, w, h, k, col);
    });
  }
  // ปุ่มแบบปุ่มคีย์บอร์ดจริง: หน้าปุ่มมนมีขอบล่างหนา กดแล้วยุบลง (แตะ/คลิก หรือกดปุ่มจริงบนคีย์บอร์ดก็ยุบตาม)
  keycap(x, y, w, h, k, col) {
    const enter = k === '✓', back = k === '⌫', face = enter ? [0x2fd27a, 0x1a9b55, 0x0d5c33] : back ? [0xff6b7b, 0xd63a4c, 0x7d1d2a] : [0x2a3a8a, 0x1b2766, 0x0b1240];
    const c = this.add.container(x, y).setDepth(5), base = this.add.graphics(), top = this.add.container(0, 0), g = this.add.graphics();
    base.fillStyle(0x050818, 0.55).fillRoundedRect(-w / 2, -h / 2 + 7, w, h, 11); base.fillStyle(face[2], 1).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 11);
    g.fillStyle(face[1], 1).fillRoundedRect(-w / 2, -h / 2, w, h - 2, 11); g.fillStyle(face[0], 1).fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h - 12, 9);
    g.lineStyle(2, k === '✓' || k === '⌫' ? 0xffffff : col, k === '✓' || k === '⌫' ? 0.35 : 0.55).strokeRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h - 12, 9);
    const label = KG.txt(this, 0, enter ? -16 : back ? -10 : -4, enter ? 'ตรวจ' : back ? '⌫' : k, { size: enter ? 22 : back ? 30 : 34, color: '#ffffff', center: true, middle: true, stroke: '#050818', sw: 4 });
    top.add([g, label]);
    if (enter || back) top.add(KG.txt(this, 0, enter ? 16 : 22, enter ? 'Enter' : 'ลบ', { size: 14, color: '#e8f0ff', center: true, middle: true }));
    c.add([base, top]); c.label = label; c.top = top;
    const z = this.add.zone(0, 0, w, h + 6).setInteractive({ useHandCursor: true }); c.add(z);
    z.on('pointerdown', () => { if (!c.enabled) return; KG.audio.play('type'); this.pressCap(c); this.key(k); });
    c.enabled = true;
    c.setEnabled = on => { c.enabled = on; c.setAlpha(on ? 1 : 0.32); return c; };
    c.setLabel = t => { label.setText(t).setScale(1); if (label.width > w - 12) label.setScale((w - 12) / label.width); return c; };   // ข้อความยาว (เช่น 'ล้าง') ย่อให้พอดีปุ่ม
    return c;
  }
  pressCap(c) { if (!c || !c.visible) return; this.tweens.killTweensOf(c.top); c.top.y = 4; this.tweens.add({ targets: c.top, y: 0, duration: 120, delay: 60, ease: 'Quad.easeOut' }); }
  setPad(mode) {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'], q = this.cur && this.cur.q;
    if (mode === 'choice') {   // เลือกคำตอบ: ใช้ปุ่มเลข 1–n แทนการ์ดตัวเลือก (เปรียบเทียบ 1 < · 2 = · 3 >)
      const n = q && q.cmp ? 3 : q && q.opts ? q.opts.length : 4;
      digits.forEach(k => this.padBtns[k].setVisible(true).setEnabled(k !== '0' && k !== '.' && +k <= n));
      this.padBtns['⌫'].setVisible(false); this.padBtns['✓'].setVisible(false);
    } else if (mode === 'shade') {
      digits.forEach(k => this.padBtns[k].setVisible(true).setEnabled(false));
      this.padBtns['⌫'].setVisible(true).setEnabled(true).setLabel('ล้าง'); this.padBtns['✓'].setVisible(true).setEnabled(true);
    } else {
      digits.forEach(k => this.padBtns[k].setVisible(true).setEnabled(!(DIGIT_MODES[mode] && k === '.')));
      this.padBtns['⌫'].setVisible(true).setEnabled(true).setLabel('⌫'); this.padBtns['✓'].setVisible(true).setEnabled(!DIGIT_MODES[mode]);
    }
    this.padNote.setText(KG.wrap(mode === 'choice' ? (q && q.cmp ? 'แตะคำตอบบนกระดาษ หรือกดเลข\n1 คือ <   2 คือ =   3 คือ >' : 'แตะคำตอบบนกระดาษ หรือกดเลขที่มุมการ์ดคำตอบ') : mode === 'shade' ? 'แตะชิ้นส่วนบนกระดาษเพื่อระบาย (ปุ่มลูกศรเลือกชิ้น Space ระบาย) แล้วกด Enter ตรวจ' : DIGIT_MODES[mode] ? 'กดตัวเลขทีละหลัก ระบบตรวจให้ทันที' : 'กดตัวเลขให้ครบ แล้วกด Enter ตรวจ', this.padNoteW, '600 18px Kanit'));
  }
  buildTeach() {
    const A = AREA.teach; KG.ui.panel(this, A.x, A.y, A.w, A.h, { accent: '#4ef4d2', accent2: this.Wd.color, cuts: [18, 0, 18, 0] }).setDepth(2);
    const ring = this.add.graphics().setDepth(3); ring.fillStyle(0x0b1240, 1); ring.fillCircle(A.x + 44, A.y + 42, 32); ring.lineStyle(3, hexInt(this.Wd.color), 1); ring.strokeCircle(A.x + 44, A.y + 42, 32);
    const h = KG.art.make(this, A.x + 46, A.y + 74, this.Wd.hero, 'idle', 58).setDepth(4); this.tweens.add({ targets: h, y: h.y - 3, duration: 600, yoyo: true, repeat: -1 });
    this.txt(A.x + 88, A.y + 12, 'ครูไรเดอร์', { size: 22, color: '#4ef4d2' }).setDepth(4);
    this.teachSub = this.txt(A.x + 88, A.y + 42, 'คำถามนำทีละขั้น', { size: 15, color: '#9fb0d8' }).setDepth(4);
    this.askT = this.txt(A.x + 18, A.y + 86, '', { size: 21, color: '#ffffff', lineSpacing: 4 }).setDepth(4);
    this.whyT = this.txt(A.x + 18, A.y + 150, '', { size: 19, color: '#ffd34f', lineSpacing: 3 }).setDepth(4);
  }
  setTeach(ask, why, whyColor) {
    const A = AREA.teach, wrapW = A.w - 36;
    this.askT.setText(ask ? KG.wrap(ask, wrapW, '600 21px Kanit') : '');
    const lim = 11 - Math.min(4, this.askT.text.split('\n').length);   // แผงครูสูงขึ้น (358) แสดงวิธีคิดได้ยาวขึ้น
    let w = why ? KG.wrap(why, wrapW, '600 19px Kanit') : ''; const wl = w.split('\n'); if (wl.length > lim) w = wl.slice(0, lim).join('\n') + '…';
    this.whyT.setText(w).setColor(whyColor || '#ffd34f').setY(this.askT.y + this.askT.height + 6);
  }
  buildActs() { }   // ปุ่มคำใบ้ สาธิต คีย์ลัด อยู่ในแผงแป้นตัวเลข (buildPad)


  /* ---------- โจทย์ ---------- */
  startQ() {
    if (this.over) return;
    const q = this.speed && !this.custom ? MG.make(this.tid, this.L, this.R) : this.qs[this.qi];
    const old = this.paper; if (old) { this.tweens.add({ targets: old.root, x: -60, alpha: 0, duration: 220, onComplete: () => old.destroy() }); }
    const p = this.paper = new Paper(this, AREA.paper, q, { index: this.speed && !this.custom ? this.solved + 1 : this.qi + 1, total: this.speed && !this.custom ? 0 : this.N, scaffold: this.L <= 2, color: this.Wd.color });
    p.root.x = 70; p.root.alpha = 0; this.tweens.add({ targets: p.root, x: 0, alpha: 1, duration: 260, ease: 'Cubic.easeOut' });
    this.cur = { q, i: 0, typed: '', wrong: {}, hint: 0, t: Date.now(), state: 'play', focus: 0 };
    this.setPad(q.mode); this.drawPips();
    if (q.mode === 'choice') p.onPick = id => this.pick(id);
    if (q.mode === 'shade') { p.live.focus(0); }
    if (q.mode !== 'shade') p.setActive(0);
    this.refreshTeach();
  }
  get cell() { const c = this.cur; return c ? c.q.cells[c.i] : null; }
  refreshTeach() {
    const c = this.cur; if (!c) return; const cell = this.cell;
    if (c.state === 'solved') return;
    const showAsk = this.L <= 3 || c.hint >= 1;
    const ask = cell ? (showAsk ? '› ' + cell.ask : 'ลองคิดเองก่อนนะ ถ้าติดกด H เพื่อดูคำถามนำ') : '';
    this.setTeach(ask, c.hint >= 2 && cell ? cell.why : (showAsk ? '' : 'หลักคิด: ' + c.q.tip), c.hint >= 2 ? '#ffd34f' : '#9fb0d8');
    this.teachSub.setText(c.q.mode === 'type' || c.q.mode === 'choice' ? 'คำถามนำ' : 'ช่องที่ ' + (c.i + 1) + ' จาก ' + c.q.cells.length);
  }

  /* ---------- อินพุต ---------- */
  onKey(e) {
    const code = e.code, cur = this.cur;
    if (['Tab', 'Space', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'NumpadEnter'].includes(code) || /^(Digit|Numpad)/.test(code)) { try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } }
    { const dgk = /^(Digit|Numpad)(\d)$/.exec(e.code || ''), pk = dgk ? dgk[2] : { Period: '.', NumpadDecimal: '.', Backspace: '⌫', Enter: '✓', NumpadEnter: '✓' }[e.code]; if (pk && this.padBtns[pk] && !e.repeat) this.pressCap(this.padBtns[pk]); }   // ปุ่มบนจอยุบตามปุ่มจริงที่กด
    if (code === 'Escape') return;   // KG.Scene ส่งไป onEscape แล้ว
    if (this._modal && !this._modal.closed) { const f = this.modalKeys && (this.modalKeys[code] || (code === 'NumpadEnter' && this.modalKeys.Enter)); if (f) { this.modalKeys = null; f(); } return; }
    if (code === 'KeyP') { this.pause(); return; }
    if (code === 'KeyM') { KG.prefs.data.sfx = !KG.prefs.data.sfx; KG.prefs.save(); KG.audio.setSfx(KG.prefs.data.sfx); KG.ui.toast(this, KG.prefs.data.sfx ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์', { ms: 900 }); return; }
    if (code === 'KeyB') { KG.prefs.data.music = !KG.prefs.data.music; KG.prefs.save(); KG.audio.setMusic(KG.prefs.data.music); KG.ui.toast(this, KG.prefs.data.music ? 'เปิดเพลง' : 'ปิดเพลง', { ms: 900 }); return; }
    if (code === 'KeyF') { KG.fullscreen(); return; }
    if (code === 'KeyK') { this.openKeys(); return; }
    if (!cur || this.state !== 'play' || this.demoing) return;
    if (code === 'KeyH') { this.hint(); return; }
    if (code === 'KeyS') { this.demo(); return; }
    if (cur.state === 'solved') { if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') this.next(); return; }
    const m = cur.q.mode, dg = /^(Digit|Numpad)(\d)$/.exec(code);
    if (m === 'choice') {
      if (cur.q.cmp) { const map = { Comma: '<', Equal: '=', Period: '>', NumpadSubtract: '<', NumpadAdd: '>', Digit1: '<', Digit2: '=', Digit3: '>', Numpad1: '<', Numpad2: '=', Numpad3: '>' }; if (map[code]) this.pick(map[code]); return; }
      if (dg) { const o = cur.q.opts[+dg[2] - 1]; if (o) this.pick(o.id); } return;
    }
    if (m === 'shade') {
      const lv = this.paper.live; if (!lv) return;
      if (code === 'ArrowRight' || code === 'ArrowDown') lv.focus((lv.focused + 1) % lv.n); else if (code === 'ArrowLeft' || code === 'ArrowUp') lv.focus((lv.focused - 1 + lv.n) % lv.n);
      else if (code === 'Space') lv.toggle(lv.focused); else if (code === 'Enter' || code === 'NumpadEnter') this.key('✓'); else if (code === 'Backspace' || code === 'Delete') this.key('⌫');
      return;
    }
    if (dg) this.key(dg[2]); else if (code === 'Period' || code === 'NumpadDecimal') this.key('.');
    else if (code === 'Backspace') this.key('⌫'); else if (code === 'Delete') { cur.typed = ''; this.paper.type(cur.i, ''); }
    else if (code === 'Enter' || code === 'NumpadEnter') this.key('✓');
    else if (m === 'type' && (code === 'Tab' || code === 'ArrowRight' || code === 'ArrowLeft')) this.moveSlot(code === 'ArrowLeft' || e.shiftKey ? -1 : 1);
  }
  key(k) {
    const cur = this.cur; if (!cur || this.state !== 'play' || this.demoing) return;
    if (cur.state === 'solved') { if (k === '✓') this.next(); return; }
    const m = cur.q.mode;
    if (m === 'shade') { if (k === '✓') this.checkShade(); else if (k === '⌫') this.paper.live.set(0); return; }
    if (m === 'choice') { if (/^\d$/.test(k)) { if (cur.q.cmp) { const c = { 1: '<', 2: '=', 3: '>' }[k]; if (c) this.pick(c); } else { const o = cur.q.opts[+k - 1]; if (o) this.pick(o.id); } } return; }
    if (k === '⌫') { cur.typed = cur.typed.slice(0, -1); this.paper.type(cur.i, cur.typed); return; }
    if (k === '✓') { if (DIGIT_MODES[m]) return; this.checkSlot(); return; }
    // ตัวเลขหรือจุด
    if (DIGIT_MODES[m]) { if (k === '.') return; KG.audio.play('type'); this.paper.type(cur.i, k); this.judge(k); return; }
    const cell = this.cell; if (cur.typed.length >= (cell.w || 3) + 3) return; if (k === '.' && cur.typed.includes('.')) return;
    cur.typed += k; KG.audio.play('type'); this.paper.type(cur.i, cur.typed);
    const v = this.paper.views[cur.i]; if (v) this.tweens.add({ targets: v.t, scaleX: 1.15, scaleY: 1.15, duration: 60, yoyo: true });
  }
  moveSlot(dir) {
    const cur = this.cur, n = cur.q.cells.length; if (n < 2) return;
    let j = cur.i; for (let k = 0; k < n; k++) { j = (j + dir + n) % n; if (this.paper.views[j].state !== 'done' && this.paper.views[j].state !== 'demo') break; }
    if (j === cur.i) return; const v = this.paper.views[cur.i]; v.val = cur.typed; cur.i = j; cur.typed = this.paper.views[j].val || ''; this.paper.setActive(j); KG.audio.play('tap'); this.refreshTeach();
  }
  checkSlot() { const cur = this.cur; if (!cur.typed) { KG.audio.play('denied'); this.shakeCell(cur.i); return; } this.judge(cur.typed); }
  checkShade() {
    const cur = this.cur, lv = this.paper.live, n = lv.count();
    if (n === cur.q.target) { lv.lock(); this.right(0, true); }
    else { this.wrong(0); KG.ui.toast(this, n < cur.q.target ? 'ระบายน้อยไป ต้องได้ ' + cur.q.target + ' ชิ้น' : 'ระบายมากไป ต้องได้ ' + cur.q.target + ' ชิ้น', { ms: 1500, sfx: 'error' }); }
  }
  pick(id) {
    const cur = this.cur; if (!cur || cur.state !== 'play' || this.state !== 'play' || this.demoing) return;
    if (MG.check(cur.q.cells[0], id)) { this.paper.optState(id, 'right'); this.paper.choose(cur.q.opts.find(o => o.id === id).label); this.right(0, true); }
    else { if (cur.picked && cur.picked[id]) return; (cur.picked = cur.picked || {})[id] = true; this.paper.optState(id, 'wrong'); this.wrong(0); }
  }
  judge(val) {
    const cur = this.cur, cell = this.cell;
    if (MG.check(cell, val)) this.right(cur.i); else this.wrong(cur.i, val);
  }
  shakeCell(i) { const v = this.paper.views[i]; if (!v) return; this.tweens.add({ targets: [v.t], x: v.x + 6, duration: 40, yoyo: true, repeat: 3, onComplete: () => { v.t.x = v.x; } }); }

  /* ---------- ถูก / ผิด ---------- */
  right(i, whole) {
    const cur = this.cur, p = this.paper, pos = p.pos(i);
    if (cur.q.mode !== 'choice' && cur.q.mode !== 'shade') p.mark(i, 'done');
    this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.addScore(10 + Math.min(20, this.combo * 2));
    KG.audio.play('good', { i: Math.min(6, this.combo) }); KG.fx.burst(this, pos.x, pos.y, { colors: [0x1f3d99, 0x4ef4d2, 0xffd34f], n: 8, max: 150, depth: 40, life: 380, add: false });
    this.battle.combo(this.combo);
    const last = whole || this.isLast();
    if (!last) { this.battle.hitSmall(); this.nextCell(); } else this.solvedQ();
  }
  isLast() { const cur = this.cur; return cur.q.mode === 'type' ? this.allDone() : cur.i >= cur.q.cells.length - 1; }
  allDone() { const v = this.paper.views; return v.length && v.every((x, k) => k === this.cur.i || x.state === 'done' || x.state === 'demo'); }
  nextCell() {
    const cur = this.cur, n = cur.q.cells.length; let j = cur.i + 1;
    if (cur.q.mode === 'type') { for (let k = 1; k <= n; k++) { const jj = (cur.i + k) % n, st = this.paper.views[jj].state; if (st !== 'done' && st !== 'demo') { j = jj; break; } } }
    cur.i = j; cur.typed = (this.paper.views[j] && this.paper.views[j].val && cur.q.mode === 'type') ? this.paper.views[j].val : ''; cur.hint = Math.min(cur.hint, 1); if (this.L > 3) cur.hint = 0;
    this.paper.setActive(j); this.refreshTeach();
  }
  wrong(i, val) {
    const cur = this.cur, w = cur.wrong[i] = (cur.wrong[i] || 0) + 1, p = this.paper, pos = p.pos(i);
    this.combo = 0; this.battle.combo(0); KG.audio.play('wrong'); KG.fx.shake(this, 120, 0.003);
    if (cur.q.mode !== 'choice' && cur.q.mode !== 'shade') {
      p.mark(i, 'wrong'); this.shakeCell(i);
      this.time.delayedCall(420, () => { if (this.cur !== cur || cur.state !== 'play') return; cur.typed = ''; p.type(i, ''); if (cur.i === i) p.setActive(i); else p.mark(i, 'idle'); });
    }
    KG.fx.pop(this, pos.x, pos.y - 40, w === 1 ? 'ลองอีกที' : 'ใกล้แล้ว!', { size: 22, color: '#d63a2f', depth: 60 });
    if (w === 1) { this.mist++; this.battle.monsterAttack(!this.speed); } else this.battle.monsterAttack(false);
    if (cur.q.mode === 'column' && cur.q.marks && cur.q.marks[this.cell.col]) p.showBorrow(this.cell.col);
    cur.hint = Math.max(cur.hint, Math.min(2, w));
    if (w >= 3 && cur.q.mode !== 'choice' && cur.q.mode !== 'shade' && (!this.speed || this.custom)) { this.time.delayedCall(450, () => this.revealCell()); }
    this.refreshTeach();
    if (!this.speed && this.battle.hearts <= 0) this.time.delayedCall(700, () => this.fail());
  }
  // ผิดหลายครั้ง: ครูไรเดอร์เขียนช่องนี้ให้ดู (สีเขียว) แล้วทำช่องต่อไปเอง
  revealCell() {
    const cur = this.cur; if (!cur || cur.state !== 'play') return; const c = this.cell;
    this.shown++; this.paper.type(cur.i, c.ans); this.paper.mark(cur.i, 'demo'); this.setTeach('ครูเขียนช่องนี้ให้ดูนะ', c.why, '#5ef08a'); KG.audio.play('pop');
    this.time.delayedCall(900, () => { if (this.cur !== cur) return; if (this.isLast()) this.solvedQ(); else this.nextCell(); });
  }
  solvedQ() {
    const cur = this.cur; if (cur.state !== 'play') return; cur.state = 'solved'; this.paper.done();
    const secs = (Date.now() - cur.t) / 1000, fast = cur.q.fast && secs < 6, perfect = !Object.keys(cur.wrong).length;
    this.solved++; this.addScore(50 + (fast ? 30 : 0) + (perfect ? 20 : 0));
    if (fast) KG.fx.pop(this, AREA.paper.x + AREA.paper.w - 150, AREA.paper.y + 200, 'เร็วมาก! +30', { size: 26, color: '#0a8a5c', depth: 60 });
    this.stamp(perfect ? 'เยี่ยม!' : 'ถูกต้อง');
    this.setTeach('คำตอบ: ' + cur.q.answer, perfect ? 'ทำได้ถูกทุกขั้น เก่งมาก!' : 'ดูขั้นที่พลาดอีกครั้ง แล้วลุยข้อต่อไป', '#5ef08a');
    this.teachSub.setText('ทำข้อนี้เสร็จแล้ว · Enter ไปต่อ');
    const win = this.battle.finisher(this.combo >= 5 ? 2 : 1);
    if (this.custom) {   // นับข้อ ข้อที่ไม่ผิดเลยนับว่าถูก ครบทุกข้อแล้วจบ
      this.qi++; if (perfect) this.correct++; if (win) { this.kills++; this.time.delayedCall(900, () => { if (!this.over) this.spawnMonster(); }); }
      this.killT.setText('ข้อที่ ' + Math.min(this.qi + 1, this.N) + ' / ' + this.N + ' · ถูก ' + this.correct + ' ข้อ · ล้มมอนสเตอร์ ' + this.kills + ' ตัว');
      if (this.qi >= this.N) { this.time.delayedCall(700, () => this.customOver(false)); return; }
      this.time.delayedCall(420, () => { if (this.cur === cur && !this.over) this.next(); }); return;
    }
    if (this.speed) { if (win) { this.kills++; this.killT.setText('ล้มมอนสเตอร์ได้ ' + this.kills + ' ตัว'); this.time.delayedCall(900, () => { if (!this.over) this.spawnMonster(); }); } this.time.delayedCall(420, () => { if (this.cur === cur && !this.over) this.next(); }); return; }
    this.qi++; this.drawPips();
    if (this.qi >= this.N) { this.time.delayedCall(1000, () => this.win()); return; }
    this.time.delayedCall(1300, () => { if (this.cur === cur && !this.over && this.state === 'play') this.next(); });
  }
  next() { const cur = this.cur; if (!cur || cur.state !== 'solved' || this.over) return; cur.state = 'gone'; if ((!this.speed || this.custom) && this.qi >= this.N) return; this.startQ(); }
  stamp(label) {
    const key = KG.tex(this, 'stamp|' + label, 200, 200, ctx => {
      ctx.translate(100, 100); ctx.strokeStyle = '#d63a2f'; ctx.fillStyle = '#d63a2f'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 88, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 76, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '600 46px Kanit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 6); ctx.font = '600 15px Kanit'; ctx.fillText('TECHNO MATH', 0, -46); ctx.fillText('★ ★ ★', 0, 52);
    });
    const P = AREA.paper, img = this.add.image(P.x + P.w - 120, P.y + 130, key).setAngle(-14).setScale(2.2).setAlpha(0); this.paper.root.add(img);
    this.tweens.add({ targets: img, scaleX: 0.8, scaleY: 0.8, alpha: 0.9, duration: 230, ease: 'Back.easeOut' }); KG.audio.play('stamp');
  }
  addScore(n) { this.score += n; this.scoreT.setText(String(this.score)); this.tweens.add({ targets: this.scoreT, scaleX: 1.2, scaleY: 1.2, duration: 80, yoyo: true }); }

  /* ---------- คำใบ้ และครูสาธิต ---------- */
  hint() {
    const cur = this.cur; if (!cur || cur.state !== 'play' || this.demoing || this.state !== 'play') return;
    if (cur.hint >= 2) { KG.ui.toast(this, 'ยังคิดไม่ออก กด S ให้ครูไรเดอร์สาธิตได้เลย', { ms: 1600 }); return; }
    const need = this.L <= 3 && cur.hint === 0 ? 2 : cur.hint + 1; cur.hint = need; if (need >= 2) this.hints++;
    KG.audio.play('charge'); this.refreshTeach(); const A = AREA.teach; KG.fx.ring(this, A.x + A.w / 2, A.y + 120, 0xffd34f, { size: 3, w: 0.4, depth: 30 });
  }
  demo() {
    const cur = this.cur; if (!cur || cur.state !== 'play' || this.demoing || this.speed || this.state !== 'play') return;
    this.demoing = true; this.hints++; this.shown++; const q = cur.q, p = this.paper; KG.audio.play('ready');
    this.teachSub.setText('ครูไรเดอร์สาธิตวิธีทำ');
    const steps = [];
    if (q.mode === 'choice') steps.push(() => { this.setTeach('› ' + q.cells[0].ask, q.cells[0].why, '#5ef08a'); p.optState(q.cells[0].ans, 'right'); p.choose(q.opts.find(o => o.id === q.cells[0].ans).label, 'demo'); });
    else if (q.mode === 'shade') steps.push(() => { this.setTeach('› ' + q.cells[0].ask, q.cells[0].why, '#5ef08a'); p.live.set(q.target); p.live.lock(); });
    else q.cells.forEach((c, k) => { if (p.views[k].state === 'done') return; steps.push(() => { p.setActive(k); this.setTeach('› ' + c.ask, c.why, '#5ef08a'); this.time.delayedCall(420, () => { p.type(k, c.ans); p.mark(k, 'demo'); KG.audio.play('type'); const ps = p.pos(k); KG.fx.burst(this, ps.x, ps.y, { colors: [0x22b45a, 0xffffff], n: 6, max: 110, depth: 40, add: false }); }); }); });
    const gap = q.cells.length > 6 ? 1100 : 1500;
    steps.forEach((f, k) => this.time.delayedCall(k * gap, () => { if (this.cur === cur) f(); }));
    this.time.delayedCall(steps.length * gap + 600, () => {
      if (this.cur !== cur) { this.demoing = false; return; }
      p.done(); KG.banner(this, 'ตาเราบ้าง! ลองข้อใหม่แบบเดียวกัน', '#5ef08a', 0.7, 330);
      this.time.delayedCall(1300, () => { this.demoing = false; if (this.cur !== cur || this.over) return; this.qs[this.qi] = MG.make(this.tid, this.L, this.R); cur.state = 'gone'; this.startQ(); });
    });
  }

  /* ---------- จบด่าน ---------- */
  update(t, dt) {
    if (!this.speed || this.state !== 'play' || this.over || this.paused || (this._modal && !this._modal.closed)) return;
    this.elapsed += dt / 1000;
    if (!this.timeLimit) { if (!this._barT || t - this._barT > 250) { this._barT = t; this.timerT.setText('เวลา ' + mmss(Math.floor(this.elapsed))); } return; }
    this.timeLeft -= dt / 1000; const v = Math.max(0, this.timeLeft / this.timeLimit);
    if (!this._barT || t - this._barT > 120) { this._barT = t; this.timerBar.setValue(v, 100); } this.timerT.setText(this.custom ? mmss(Math.ceil(Math.max(0, this.timeLeft))) : Math.ceil(Math.max(0, this.timeLeft)) + ' วิ').setColor(this.timeLeft < 10 ? '#ff4d5e' : '#4ef4d2');
    if (this.timeLeft <= 10 && Math.floor(this.timeLeft) !== this._lastTick) { this._lastTick = Math.floor(this.timeLeft); KG.audio.play('tick'); }
    if (this.timeLeft <= 0) { if (this.custom) this.customOver(true); else this.speedOver(); }
  }
  speedOver() {
    if (this.over) return; this.over = true; this.state = 'over'; KG.banner(this, 'หมดเวลา!', '#ffd34f', 1.2, 300); KG.audio.play('alarm');
    const n = this.solved, stars = n >= 15 ? 3 : n >= 10 ? 2 : n >= 5 ? 1 : 0, k = skey(this.tid, this.L), best = SAVE.data.best[k] || 0;
    if (stars > starsOf(this.tid, this.L)) SAVE.data.stars[k] = stars; if (n > best) SAVE.data.best[k] = n; SAVE.save();
    this.time.delayedCall(1300, () => this.results(stars > 0, stars, [['ตอบถูก', n + ' ข้อ'], ['สถิติเดิม', Math.max(best, n) + ' ข้อ' + (n > best && best ? ' (ใหม่!)' : '')], ['ล้มมอนสเตอร์', this.kills + ' ตัว'], ['คอมโบสูงสุด', this.bestCombo], ['คะแนน', this.score]], stars ? 'ได้ ' + n + ' ข้อใน 60 วินาที' : 'ได้ ' + n + ' ข้อ ต้องได้ 5 ข้อขึ้นไปจึงได้ดาว', 'เป้าหมาย: 5 ข้อ = 1 ดาว · 10 ข้อ = 2 ดาว · 15 ข้อ = 3 ดาว'));
  }
  // จบคิดเลขเร็วโหมดกำหนดเอง: ดาวตามสัดส่วนข้อที่ถูกตั้งแต่ครั้งแรก (50% 1 ดาว · 70% 2 ดาว · 90% 3 ดาว) สถิติดีสุดแยกตามชุดค่าที่เลือก
  customOver(timeout) {
    if (this.over) return; this.over = true; this.state = 'over';
    const C = this.cfg, N = this.N, c = this.correct, done = this.qi, used = Math.round(this.timeLimit ? this.timeLimit - Math.max(0, this.timeLeft) : this.elapsed);
    if (timeout) { KG.banner(this, 'หมดเวลา!', '#ffd34f', 1.2, 300); KG.audio.play('alarm'); } else { this.battle.victory(); KG.fx.confetti(this); KG.audio.play('fanfare'); }
    const r = c / N, stars = r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0, key = speedKey(C), best = speedBest(C), better = !best || c > best.c || (c === best.c && used < best.secs);
    if (better) { SAVE.data.speedBest = SAVE.data.speedBest || {}; SAVE.data.speedBest[key] = { c, secs: used, score: this.score }; SAVE.save(); }
    const rows = [['ตอบถูกตั้งแต่ครั้งแรก', c + ' / ' + N + ' ข้อ'], ['ทำไปแล้ว', done + ' / ' + N + ' ข้อ'], ['เวลาที่ใช้', mmssTh(used)], ['คอมโบสูงสุด', this.bestCombo], ['คะแนน', this.score]];
    rows.push(['สถิติดีสุดของชุดนี้', better ? (best ? 'ทำลายสถิติเดิม!' : 'สถิติแรก') : best.c + ' ข้อ · ' + mmssTh(best.secs)]);
    const again = () => this.scene.restart(this._restartData), setup = () => this.go('Speed');
    const btns = [{ label: 'เล่นอีกครั้ง', style: 'primary', icon: 'reset', pulse: true, onClick: again }, { label: 'ตั้งค่าใหม่', style: 'cyan', icon: 'flag', onClick: setup }, { label: 'หน้าแรก', style: 'ghost', icon: 'home', onClick: () => this.go('Title') }];
    this.modalKeys = { Enter: again, KeyR: again, Escape: setup };
    this.time.delayedCall(timeout ? 1300 : 900, () => KG.results(this, { win: stars > 0, title: timeout ? 'หมดเวลา! ทำได้ ' + done + ' ข้อ' : 'ครบ ' + N + ' ข้อแล้ว!', body: 'คิดเลขเร็ว กำหนดเอง · ' + speedLabel(C), stars, rows, buttons: btns,
      tip: stars === 3 ? 'สุดยอด! ลองเพิ่มจำนวนข้อ หรือจับเวลาให้ท้าทายขึ้น' : 'ตอบถูกตั้งแต่ครั้งแรก 50% ได้ 1 ดาว · 70% ได้ 2 ดาว · 90% ได้ 3 ดาว',
      stat: { lvl: 'speedc:' + key.replace(/\|/g, ':'), stars, score: this.score, m: this.mist, h: this.hints, secs: used, practice: true } }));
  }
  win() {
    if (this.over) return; this.over = true; this.state = 'over'; this.battle.victory(); KG.fx.confetti(this); KG.audio.play('fanfare');
    let stars = this.mist === 0 ? 3 : this.mist <= 2 ? 2 : 1; if (this.shown > 0) stars = Math.min(stars, 2);
    const k = skey(this.tid, this.L), prev = starsOf(this.tid, this.L); if (stars > prev) { SAVE.data.stars[k] = stars; SAVE.save(); }
    const secs = Math.round((Date.now() - this.t0) / 1000);
    this.time.delayedCall(900, () => this.results(true, stars, [['ทำได้', this.N + ' ข้อ'], ['ตอบผิด', this.mist + ' ครั้ง'], ['ใช้คำใบ้ / ดูสาธิต', this.hints + ' ครั้ง'], ['คอมโบสูงสุด', this.bestCombo], ['เวลา', Math.floor(secs / 60) + ' นาที ' + (secs % 60) + ' วินาที'], ['คะแนน', this.score]],
      'ชนะ ' + (MON_NAME[this.battle.monId] || 'มอนสเตอร์') + ' แล้ว!', stars === 3 ? 'สุดยอด! ไม่พลาดเลยสักครั้ง' : stars === 2 ? 'เก่งมาก ลองอีกรอบให้ไม่พลาดเพื่อเก็บ 3 ดาว' : 'ผ่านแล้ว ลองทำช้า ๆ ทีละขั้นจะได้ดาวมากขึ้น'));
  }
  fail() {
    if (this.over) return; this.over = true; this.state = 'over'; this.battle.defeat();
    this.modalKeys = { Enter: () => this.scene.restart(this._restartData), KeyR: () => this.scene.restart(this._restartData), Escape: () => this.go('Map') };
    KG.ui.modal(this, { title: 'ไรเดอร์หมดพลัง', w: 720, accent: KG.C.red, body: 'ไม่เป็นไร! ลองใหม่อีกครั้ง ทำช้า ๆ ทีละช่อง ถ้าติดกด H ดูคำใบ้ หรือกด S ให้ครูไรเดอร์สาธิตก่อน', buttons: [
      { label: 'ลองใหม่', style: 'primary', icon: 'reset', pulse: true, onClick: () => this.scene.restart(this._restartData) },
      { label: 'ดูครูสาธิตก่อน', style: 'cyan', icon: 'eye', onClick: () => this.scene.restart(Object.assign({ demo: true }, this._restartData)) },
      { label: 'เลือกภารกิจ', style: 'ghost', icon: 'flag', onClick: () => this.go('Map') }] });
  }
  results(win, stars, rows, title, tip) {
    const hasNext = this.L < 5, nextData = { topic: this.tid, level: this.L + 1 };
    const btns = [];
    if (hasNext && stars) btns.push({ label: 'ระดับ ' + (this.L + 1), style: 'primary', icon: 'play', pulse: true, onClick: () => this.go('Play', nextData) });
    btns.push({ label: 'เล่นอีกครั้ง', style: hasNext && stars ? 'cyan' : 'primary', icon: 'reset', pulse: !(hasNext && stars), onClick: () => this.scene.restart(this._restartData) });
    btns.push({ label: 'เลือกภารกิจ', style: 'ghost', icon: 'flag', onClick: () => this.go('Map', { topic: this.tid }) });
    this.modalKeys = { Enter: btns[0].onClick, KeyR: () => this.scene.restart(this._restartData), Escape: () => this.go('Map', { topic: this.tid }) };
    if (hasNext && stars) this.modalKeys.KeyN = btns[0].onClick;
    const secs = Math.round((Date.now() - this.t0) / 1000);
    KG.results(this, { win, title, body: this.T.th + ' · ระดับ ' + this.L + ' (' + this.T.lv[this.L - 1] + ')', stars, rows, tip, buttons: btns,
      stat: { lvl: this.tid + '-' + this.L, stars, score: this.score, m: this.mist, h: this.hints, secs, practice: false } });
  }

  /* ---------- พัก / แนะนำ / คีย์ลัด ---------- */
  onEscape() { if (this._modal && !this._modal.closed) { const f = this.modalKeys && this.modalKeys.Escape; if (f) { this.modalKeys = null; f(); } return; } this.pause(); }
  pause() {
    if (this.over || (this._modal && !this._modal.closed)) return; this.paused = true;
    const resume = () => { this.paused = false; this.modalKeys = null; };
    this.modalKeys = { Enter: () => { this._modal.close(); resume(); }, Escape: () => { this._modal.close(); resume(); }, KeyP: () => { this._modal.close(); resume(); }, KeyR: () => this.scene.restart(this._restartData) };
    KG.pauseMenu(this, { onResume: resume, onRestart: () => this.scene.restart(this._restartData), onExit: () => (this.custom ? this.go('Speed') : this.go('Map', { topic: this.tid })) });
  }
  openKeys() { if (this._modal && !this._modal.closed) return; this.paused = true; this.modalKeys = { Enter: () => { this._modal.close(); this.paused = false; }, Escape: () => { this._modal.close(); this.paused = false; }, KeyK: () => { this._modal.close(); this.paused = false; } }; const m = showKeys(this); const b = m.box.list.find(o => o instanceof KG.ui.Button); if (b) { const cb = b.cb; b.cb = x => { this.paused = false; if (cb) cb(x); }; } }
  showIntro() {
    SAVE.data.seen[this.tid] = true; SAVE.save();
    const go = demo => { this.modalKeys = null; this.state = 'play'; this.startQ(); if (demo) this.time.delayedCall(500, () => this.demo()); };
    this.modalKeys = { Enter: () => { this._modal.close(); go(true); }, Space: () => { this._modal.close(); go(false); }, Escape: () => { this._modal.close(); go(false); } };
    KG.ui.modal(this, { title: this.T.th, w: 860, accent: hexInt(this.Wd.color), body: this.T.tip + '\n\nระดับนี้: ' + this.T.lv[this.L - 1] + ' · ข้อแรกให้ครูไรเดอร์สาธิตให้ดูก่อนได้ แล้วค่อยลงมือเอง', buttons: [
      { label: 'ดูครูสาธิต (Enter)', style: 'cyan', icon: 'eye', pulse: true, onClick: () => go(true) },
      { label: 'ลุยเองเลย (Space)', style: 'primary', icon: 'play', onClick: () => go(false) }] });
  }
}
