/* ===== คลังความรู้เลขโรมัน (ฉาก Lesson): 4 แท็บ ความเป็นมา · สัญลักษณ์ · หลักการ · เครื่องมือแปลง =====
   เนื้อหาย้ายมาจากหน้าเดิมของเว็บ (เลขโรมันรอบตัว สัญลักษณ์เจ็ดตัว บวก/ลบ ตัวแปลง 1–3,999) แล้วทำให้แตะเล่นได้ในเกม */
const RML_SYMS = [['I', 1, 'ไอ'], ['V', 5, 'วี'], ['X', 10, 'เอกซ์'], ['L', 50, 'แอล'], ['C', 100, 'ซี'], ['D', 500, 'ดี'], ['M', 1000, 'เอ็ม']];
class LessonScene extends KG.Scene {
  constructor() { super('Lesson'); }
  init(d) { d = d || {}; this.backTo = d.back || 'Title'; this.tabNo = d.tab || 0; this._modal = null; this.tabBtns = []; this.content = null; this.scanned = {}; }
  create() {
    this.setup('#f3e8c8'); KG.audio.music('sunny'); KG.kit.bg(this, 'bg_forum', { veil: [0xffffff, 0.6], drift: false });
    const g = this.add.graphics().setDepth(3); g.fillStyle(0xffffff, 0.92); g.fillRect(0, 0, GW, 72); g.fillStyle(0xd4a017, 1); g.fillRect(0, 69, GW, 5);
    iconButton(this, 44, 36, 'home', () => this.go(this.backTo), { w: 56, h: 50, depth: 5 }); this.txt(86, 4, 'ROMAN CODEX', { size: 15, color: '#c98a1a' }).setDepth(5); this.txt(86, 22, 'คลังความรู้เลขโรมัน', { size: 30, stroke: true }).setDepth(5);
    addSystemButtons(this, 1100, 36, 62, ['sfx', 'music', 'fs']).forEach(b => b.setDepth(5).setScale(0.86));
    KG.ui.panel(this, 40, 150, 1200, 550, { accent: '#d4a017', accent2: '#ffc400', cuts: [22, 0, 22, 0], glow: false, alpha: 0.93 }).setDepth(2);
    ['ความเป็นมา', 'สัญลักษณ์', 'หลักการ', 'เครื่องมือแปลง'].forEach((n, i) => { const b = new KG.ui.Button(this, 190 + i * 300, 108, 270, 56, { label: n, style: 'ghost', size: 24, slant: 8, onClick: () => this.setTab(i) }).setDepth(5); this.tabBtns.push(b); });
    this.input.keyboard.on('keydown', e => this.onKey(e)); this.setTab(this.tabNo, true);
  }
  onEscape() { this.go(this.backTo); }
  onKey(e) { if (this.keyFn) this.keyFn(e); }
  setTab(i, first) {
    this.tabNo = i; this.tabBtns.forEach((b, k) => { b.setActive(k === i); }); if (this.content) this.content.destroy(true); this.keyFn = null; this.content = this.add.container(0, 0).setDepth(4); if (!first) KG.audio.play('whoosh');
    [this.tabHistory, this.tabSymbols, this.tabRules, this.tabTool][i].call(this); this.content.setAlpha(0); this.tweens.add({ targets: this.content, alpha: 1, duration: 200 });
  }
  T(x, y, s, o) { const t = KG.txt(this, x, y, s, o); this.content.add(t); return t; }
  tile(x, y, c, w, h, size) { const t = KG.mk.tile(this, x, y, c, { w, h, size, color: RM_COL[c] || '#d4a017', depth: 4 }); this.content.add(t); return t; }
  letters(str, x, y, w, h, size, gap) { const n = str.length; return str.split('').map((c, i) => this.tile(x + (i - (n - 1) / 2) * (w + (gap || 8)), y, c, w, h, size)); }
  /* ---------- 1) ความเป็นมา ---------- */
  tabHistory() {
    this.T(70, 178, 'ระบบตัวเลขจากกรุงโรมโบราณ', { size: 34, color: '#a8730a' });
    this.T(70, 224, 'เลขโรมันพัฒนามาจากเครื่องหมายที่ใช้ในการนับ ก่อนปรับเป็นตัวอักษรละติน ระบบนี้ไม่ใช้ค่าประจำหลักแบบเลขฮินดูอารบิก จึงต้องอ่านจากลำดับและความสัมพันธ์ของสัญลักษณ์', { size: 22, weight: 400, color: '#4a4780', width: 1120 });
    const cards = [['หน้าปัดนาฬิกา', 'บอกชั่วโมงด้วย I ถึง XII', 'IV', 'clockI'], ['ชื่อกษัตริย์', 'ระบุลำดับของพระนาม เช่น หลุยส์ที่ XIV', 'XIV', 'crown'], ['สารบัญและบท', 'ใช้แบ่งภาคหรือลำดับตอน เช่น บทที่ III', 'III', 'book'], ['ปีบนอาคาร', 'จารึกปีที่สร้างอนุสรณ์ เช่น MMXXVI', 'MMXXVI', 'flag']];
    cards.forEach((c, i) => {
      const x = 70 + (i % 2) * 580, y = 330 + Math.floor(i / 2) * 175, g = this.add.graphics(); g.fillStyle(0xfff6d6, 1); g.fillRoundedRect(x, y, 560, 160, 18); g.lineStyle(4, 0xd4a017, 1); g.strokeRoundedRect(x, y, 560, 160, 18); this.content.add(g);
      this.content.add(KG.ui.icon(this, c[3], x + 52, y + 56, 56, 0xc98a1a)); this.T(x + 100, y + 20, c[0], { size: 28 }); this.T(x + 100, y + 62, c[1], { size: 20, weight: 400, color: '#4a4780', width: 440 });
      const ls = c[2].length, w = Math.min(46, 330 / ls); this.letters(c[2], x + 280, y + 122, w, 40, 26, 4);
    });
  }
  /* ---------- 2) สัญลักษณ์ ---------- */
  tabSymbols() {
    this.T(70, 178, 'สัญลักษณ์หลัก 7 ตัว', { size: 34, color: '#a8730a' }); this.T(70, 224, 'แตะการ์ดเพื่อสแกนค่าของสัญลักษณ์ ครบทั้ง 7 ตัวจะได้รางวัล', { size: 22, weight: 400, color: '#4a4780' });
    this.cards = []; RML_SYMS.forEach((s, i) => {
      const x = 130 + i * 170, y = 380, c = this.add.container(x, y); this.content.add(c); const g = this.add.graphics(); c.add(g); c.g = g; c.s = s; c.sel = false;
      const draw = on => { g.clear(); g.fillStyle(0xfff6d6, 1); g.fillRoundedRect(-72, -110, 144, 220, 18); g.lineStyle(on ? 7 : 4, on ? 0xff5a8a : 0xd4a017, 1); g.strokeRoundedRect(-72, -110, 144, 220, 18); }; draw(false); c.draw = draw;
      c.add(KG.mk.tile(this, 0, -34, s[0], { w: 96, h: 110, size: 72, color: RM_COL[s[0]], depth: 4 })); c.add(KG.txt(this, 0, 52, '?', { size: 40, color: '#8a5cf0', center: true, middle: true })); c.q = c.list[c.list.length - 1]; c.add(KG.txt(this, 0, 90, 'อ่านว่า ' + s[2], { size: 18, weight: 400, color: '#7a77a8', center: true, middle: true }));
      const z = this.add.zone(0, 0, 144, 220).setInteractive({ useHandCursor: true }); c.add(z); z.on('pointerup', () => this.scan(c)); this.cards.push(c);
    });
    this.info = this.T(640, 560, 'เลือกการ์ดเพื่อเริ่มสแกน', { size: 28, ox: 0.5, color: '#2d2a5e' }); this.T(640, 618, 'จำค่าพื้นฐาน 1, 5 และ 10 ก่อน แล้วค่อยต่อยอด · ค่าหลักใหญ่คือ 50, 100, 500 และ 1,000', { size: 21, weight: 400, color: '#4a4780', ox: 0.5, width: 1100, align: 'center' });
    this.prog = this.T(1190, 186, '0 / 7', { size: 24, ox: 1, color: '#22b45a' });
  }
  scan(c) {
    KG.audio.play('good', { i: 3 }); this.cards.forEach(o => { o.sel = o === c; o.draw(o.sel); }); this.scanned[c.s[0]] = 1; c.q.setText(String(c.s[1])).setColor('#22b45a'); KG.fx.ring(this, c.x, c.y, 0xffd34f, { size: 1.2, w: 0.4, depth: 60 });
    this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true }); this.info.setText('สัญลักษณ์ ' + c.s[0] + ' มีค่า ' + MKS.comma(c.s[1])); const n = Object.keys(this.scanned).length; this.prog.setText(n + ' / 7');
    if (n === 7 && !this.rewarded) { this.rewarded = true; KG.fx.confetti(this, { ms: 1400 }); KG.audio.play('fanfare'); this.info.setText('สแกนครบทั้ง 7 ตัวแล้ว เก่งมาก!'); }
  }
  /* ---------- 3) หลักการ ---------- */
  tabRules() {
    this.T(70, 176, 'อ่านจากซ้ายไปขวา แล้วตัดสินใจว่าจะบวกหรือลบ', { size: 30, color: '#a8730a' });
    const box = (x, y, w, h, col) => { const g = this.add.graphics(); g.fillStyle(0xfff6d6, 1); g.fillRoundedRect(x, y, w, h, 18); g.lineStyle(4, col, 1); g.strokeRoundedRect(x, y, w, h, 18); this.content.add(g); };
    box(70, 228, 560, 200, 0x22b45a); this.T(96, 240, 'หลักการบวก', { size: 28, color: '#22a050' }); this.T(96, 282, 'ค่ามากอยู่หน้า หรือค่าทางขวาไม่มากกว่า ให้นำค่ามาบวกกัน', { size: 20, weight: 400, color: '#4a4780', width: 510 }); this.letters('VI', 190, 372, 62, 70, 40); this.T(330, 372, '5 + 1 = 6', { size: 36, oy: 0.5, color: '#22a050' });
    box(650, 228, 560, 200, 0xe0243d); this.T(676, 240, 'หลักการลบ', { size: 28, color: '#d63a4c' }); this.T(676, 282, 'ค่าน้อยอยู่หน้าค่ามากกว่า ให้นำค่าน้อยลบออกจากค่ามาก', { size: 20, weight: 400, color: '#4a4780', width: 510 }); this.letters('IV', 770, 372, 62, 70, 40); this.T(910, 372, '5 − 1 = 4', { size: 36, oy: 0.5, color: '#d63a4c' });
    this.T(70, 446, 'กติกาการเขียน', { size: 24, color: '#a8730a' }); this.T(70, 482, 'I X C ซ้ำได้ไม่เกินสามตัว (III XXX CCC) · V L D ห้ามซ้ำ · ลบได้เฉพาะ I หน้า V X · X หน้า L C · C หน้า D M', { size: 20, weight: 400, color: '#4a4780', width: 1130 });
    box(70, 540, 1140, 150, 0xd4a017); this.T(96, 550, 'ต้องใช้หลักการใด?', { size: 24, color: '#a8730a' });
    this.quizLetters = []; this.quizMsg = this.T(96, 640, 'เลือกคำตอบเพื่อตรวจ', { size: 20, weight: 400, color: '#7a77a8' }); this.newQuiz();
    const mk = (label, style, ans, x) => { const b = new KG.ui.Button(this, x, 600, 190, 66, { label, style, size: 26, slant: 8, onClick: () => this.quizAns(ans) }); this.content.add(b.setDepth(6)); }; mk('บวก', 'green', 'add', 880); mk('ลบ', 'primary', 'sub', 1090);
  }
  newQuiz() {
    this.quizLetters.forEach(t => t.destroy()); const pairs = ['VI', 'IV', 'XI', 'IX', 'XV', 'XL', 'LX', 'XC', 'CX', 'CD', 'DC', 'CM'], p = pairs[Math.floor(Math.random() * pairs.length)]; this.quizPair = p; this.quizLetters = this.letters(p, 360, 608, 62, 70, 40);
    this.quizLetters.forEach(t => t.setDepth(6)); this.quizRule = RML_SYMS.find(s => s[0] === p[0])[1] < RML_SYMS.find(s => s[0] === p[1])[1] ? 'sub' : 'add';
  }
  quizAns(a) {
    const p = this.quizPair, x = MKS.RS[p[0]], y = MKS.RS[p[1]];
    if (a === this.quizRule) { KG.audio.play('good', { i: 3 }); this.quizMsg.setText(p + ' = ' + (a === 'add' ? x + ' + ' + y + ' = ' + (x + y) : y + ' − ' + x + ' = ' + (y - x)) + ' ถูกต้อง!').setColor('#22a050'); this.time.delayedCall(1400, () => { this.newQuiz(); this.quizMsg.setText('เลือกคำตอบเพื่อตรวจ').setColor('#7a77a8'); }); }
    else { KG.audio.play('wrong'); this.quizMsg.setText('ลองสังเกตอีกครั้ง ' + (x < y ? 'ตัวน้อยอยู่หน้าตัวมาก' : 'ตัวมากอยู่หน้า') + ' ต้องใช้หลักการใด').setColor('#e0243d'); }
  }
  /* ---------- 4) เครื่องมือแปลง ---------- */
  tabTool() {
    this.T(70, 176, 'ทดลองแปลงค่าได้สองทิศทาง พร้อมดูขั้นตอนการถอดรหัส', { size: 28, color: '#a8730a' }); this.toolMode = 0; this.numStr = ''; this.romStr = '';
    this.modeBtns = ['แปลงเลขเป็นเลขโรมัน', 'แปลงเลขโรมันเป็นเลข'].map((l, i) => { const b = new KG.ui.Button(this, 250 + i * 340, 262, 320, 52, { label: l, style: 'cyan', size: 22, slant: 8, onClick: () => this.setMode(i) }); this.content.add(b.setDepth(6)); return b; });
    this.toolBody = this.add.container(0, 0); this.content.add(this.toolBody); this.setMode(0, true);
  }
  setMode(m, first) {
    this.toolMode = m; this.modeBtns.forEach((b, i) => b.setActive(i === m)); this.toolBody.removeAll(true); const B = this.toolBody, add = o => { B.add(o); return o; };
    this.outTiles = []; this.outInfo = null;
    if (m === 0) {
      this.numBox = add(KG.mk.answerBox(this, 330, 380, 300, 90, { size: 58, max: 4 })); this.numBox.set(this.numStr); add(KG.txt(this, 330, 322, 'กรอกจำนวนเต็ม 1 ถึง 3,999', { size: 20, color: '#7a77a8', center: true, middle: true }));
      this.pad = KG.mk.numpad(this, 960, 470, { kw: 84, kh: 60, gap: 8, depth: 6, onDigit: d => { this.numBox.type(d); this.numStr = this.numBox.val; this.refreshTool(); }, onBack: () => { this.numBox.back(); this.numStr = this.numBox.val; this.refreshTool(); }, enterIcon: 'reset', enterStyle: 'cyan', onEnter: () => { this.numBox.clearVal(); this.numStr = ''; this.refreshTool(); } }); B.add(this.pad);
      this.keyFn = e => { const k = KG.mk.keyOf(e); if (k) this.pad.press(k); };
    } else {
      this.romBox = add(KG.txt(this, 640, 400, '', { size: 24, color: '#7a77a8', center: true, middle: true })); this.romBox.setText('แตะแผ่นตัวอักษรเพื่อสร้างเลขโรมัน');
      this.palT = RML_SYMS.map((s, i) => { const t = KG.mk.tile(this, 150 + i * 98, 600, s[0], { w: 80, h: 84, size: 52, color: RM_COL[s[0]], depth: 6 }); t.setSize(80, 84); t.setInteractive({ useHandCursor: true }); t.on('pointerdown', () => this.romAdd(s[0])); B.add(t); return t; });
      B.add(new KG.ui.Button(this, 1000, 600, 130, 64, { label: '', icon: 'bksp', style: 'danger', size: 24, slant: 6, onClick: () => this.romDel() }).setDepth(6)); B.add(new KG.ui.Button(this, 1140, 600, 130, 64, { label: 'ล้าง', style: 'ghost', size: 24, slant: 6, onClick: () => { this.romStr = ''; this.refreshTool(); } }).setDepth(6));
      this.keyFn = e => { const m2 = /^Key([IVXLCDM])$/.exec(e.code || ''); if (m2) this.romAdd(m2[1]); else if (e.code === 'Backspace') this.romDel(); };
    }
    const m0 = m === 0; this.outInfo = add(KG.txt(this, m0 ? 330 : 640, m0 ? 585 : 505, '', { size: 23, color: '#2d2a5e', center: true, middle: true, width: m0 ? 520 : 1000, align: 'center' })); this.refreshTool();
  }
  romAdd(c) { if (this.romStr.length >= 16) return; this.romStr += c; KG.audio.play('tap'); this.refreshTool(); }
  romDel() { this.romStr = this.romStr.slice(0, -1); KG.audio.play('tap'); this.refreshTool(); }
  refreshTool() {
    this.outTiles.forEach(t => t.destroy()); this.outTiles = []; const B = this.toolBody; let info = '', letters = '';
    if (this.toolMode === 0) {
      const n = +this.numStr; if (!this.numStr) info = 'พิมพ์ตัวเลขเพื่อดูเลขโรมัน'; else if (n < 1 || n > 3999) info = 'ตัวเลขอยู่นอกขอบเขตภารกิจ (1 ถึง 3,999)'; else { letters = MKS.toRoman(n); info = MKS.explainRoman(n); }
    } else {
      const s = this.romStr; this.romBox.setText(s ? '' : 'แตะแผ่นตัวอักษรเพื่อสร้างเลขโรมัน'); letters = s;
      if (!s) info = ''; else if (!MKS.validRoman(s)) info = 'รูปแบบเลขโรมันไม่ถูกต้อง ใช้ I V X L C D M และเรียงตามกฎมาตรฐาน (ตอนนี้อ่านได้ ' + MKS.fromRoman(s) + ')'; else { const v = MKS.fromRoman(s); info = MKS.explainRoman(v); }
    }
    if (letters) {
      const n = letters.length, m0 = this.toolMode === 0, w = Math.min(70, Math.floor((m0 ? 500 : 900) / n) - 6), y = m0 ? 482 : 400, cx = m0 ? 330 : 640;
      letters.split('').forEach((c, i) => { const t = KG.mk.tile(this, cx + (i - (n - 1) / 2) * (w + 6), y, c, { w, h: 76, size: Math.round(50 * Math.min(1, w / 62)), color: RM_COL[c], depth: 6 }); this.outTiles.push(t); B.add(t); });
    }
    if (this.outInfo) this.outInfo.setText(info).setColor(/ไม่ถูกต้อง|นอกขอบเขต/.test(info) ? '#e0243d' : '#2d2a5e');
  }
}
