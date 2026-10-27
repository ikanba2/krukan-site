/* ===== ภารกิจถอดรหัสเลขโรมัน: RomanEng สืบทอดจาก MathEng =====
   โจทย์: sym · symrev · r2n · n2r · rule · fix · arith · clock · year (เลือกคำตอบ) และ build (แตะแผ่นตัวอักษรประกอบเลขโรมัน แล้วกดตรวจ)
   ตอบถูกแล้วโชว์วิธีแยกตัวอักษร (เช่น XLIV = XL + IV = 40 + 4) เพื่อให้เรียนรู้ทุกข้อ · สีตัวอักษรคงที่ทุกที่ (I เขียว V ฟ้า X ส้ม L ม่วง C ชมพู D เขียวมินต์ M แดง) */
const RM_COL = { I: '#3fbf6a', V: '#3d8bff', X: '#ff9a2e', L: '#8a5cf0', C: '#ff5a8a', D: '#18b8a0', M: '#d63a4c' };
const RM_WORD = { I: 'ไอ', V: 'วี', X: 'เอกซ์', L: 'แอล', C: 'ซี', D: 'ดี', M: 'เอ็ม' };
const RM_FIX_WHY = {
  IIII: 'I ซ้ำได้ไม่เกินสามตัว ต้องเขียน IV', VV: 'V ห้ามเขียนซ้ำ ต้องเขียน X', VX: 'V ห้ามอยู่หน้าเป็นตัวลบ', IL: 'I ลบได้เฉพาะ V กับ X เท่านั้น', IC: 'I ลบได้เฉพาะ V กับ X เท่านั้น', XXXX: 'X ซ้ำได้ไม่เกินสามตัว ต้องเขียน XL',
  LL: 'L ห้ามเขียนซ้ำ ต้องเขียน C', IXI: 'ต้องเขียนเป็น XI (ลบแล้วห้ามมีตัวมาต่อท้ายซ้อน)', VIV: 'V ห้ามซ้ำ ต้องเขียน IX', DD: 'D ห้ามเขียนซ้ำ ต้องเขียน M', IM: 'I ลบได้เฉพาะ V กับ X เท่านั้น'
};
class RomanEng extends MathEng {
  constructor(s, p) { super(s, p); this.built = []; this.tray = []; this.pal = []; this.livet = null; this.btns = []; this.onKeyRaw = e => this.buildKey(e); MKU.onKeys(s, this.onKeyRaw); }
  clear() { super.clear(); this.built = []; this.tray = []; this.pal = []; this.livet = null; this.btns = []; this.mode = null; }
  /* ---------- ตัวอักษรโรมันเป็นแผ่นสี ---------- */
  letters(str, x, y, o) {
    o = Object.assign({ h: 96, wmax: 780 }, o); const n = str.length, w = Math.min(78, Math.floor(o.wmax / n) - 8), f = Math.min(1, w / 70), out = [];
    str.split('').forEach((c, i) => { const t = this.mkTile(x + (i - (n - 1) / 2) * (w + 8), y, c, { w, h: o.h * f + 6, size: Math.round(60 * Math.max(0.6, f)), color: RM_COL[c] || '#d4a017' }); out.push(t); }); this.popIn(out, 60); return out;
  }
  explain(text, y) {
    const t = this.txt(660, y || 420, text, { size: 25, color: '#2d2a5e', width: 760, align: 'center' }); t.setAlpha(0); this.s.tweens.add({ targets: t, alpha: 1, y: t.y - 6, duration: 260 }); return t;
  }
  onRight(x, y) {
    const q = this.q; let why = null, wait = 1700;
    if (q.kind === 'r2n' || q.kind === 'n2r' || q.kind === 'year') why = MKS.explainRoman(q.n); else if (q.kind === 'clock') why = 'เข็มสั้นชี้ ' + q.roman + ' = ' + q.hour + ' นาฬิกา';
    else if (q.kind === 'rule') { const a = MKS.RS[q.roman[0]], b = MKS.RS[q.roman[1]]; why = q.rule === 'add' ? q.roman[0] + ' (' + a + ') มากกว่าหรือเท่า ' + q.roman[1] + ' (' + b + ') จึงบวก ' + a + ' + ' + b + ' = ' + (a + b) : q.roman[0] + ' (' + a + ') น้อยกว่า ' + q.roman[1] + ' (' + b + ') จึงลบ ' + b + ' − ' + a + ' = ' + (b - a); }
    else if (q.kind === 'arith') why = MKS.fromRoman(q.a) + (q.plus ? ' + ' : ' − ') + MKS.fromRoman(q.b) + ' = ' + q.n + ' = ' + q.ans; else if (q.kind === 'fix') why = q.ans + ' ผิดกติกา: ' + (RM_FIX_WHY[q.ans] || 'เขียนไม่ตรงกฎ'); else if (q.kind === 'sym') why = q.sym + ' = ' + q.ans; else wait = 1100;
    if (why) this.explain(why, q.kind === 'clock' ? 470 : 410); this.roundDone(x, y, wait);
  }
  wrongMsg() { const k = this.q.kind; return k === 'rule' ? 'ดูว่าตัวไหนใหญ่กว่า' : k === 'fix' ? 'ดูกฎการซ้ำและการลบ' : k === 'sym' || k === 'symrev' ? 'ลองจำค่าของสัญลักษณ์ใหม่' : 'ลองแยกเป็นส่วน ๆ ดูนะ'; }
  hintText() { const q = this.q; if (q.n && q.kind !== 'sym') return 'ลองแยก: ' + MKS.romanParts(q.n).map(p => p[1]).join(' + '); return undefined; }
  /* ---------- โจทย์เลือกคำตอบ ---------- */
  r_sym(q) { this.setPrompt(q.text, q.spoken); this.ansText = null; this.letters(q.sym, 660, 290, { h: 130 }); this.txt(660, 395, 'อ่านว่า ' + (RM_WORD[q.sym] || q.sym), { size: 22 }); this.choose(q, { y: 520, h: 100, size: 52 }); }
  r_symrev(q) { this.setPrompt(q.text, q.spoken); this.ansText = null; this.mkTile(660, 290, MKS.comma(q.n), { w: Math.max(150, MKS.comma(q.n).length * 40 + 50), h: 130, size: 70, color: '#3d8bff' }); this.choose(q, { y: 520, w: 170, h: 100, size: 56, styles: ['ghost'], keys: true }); }
  r_r2n(q) { this.setPrompt(q.text, q.spoken); this.ansText = null; this.letters(q.roman, 660, 290); this.choose(q, { y: 520, h: 100, size: 52 }); }
  r_n2r(q) { this.setPrompt(q.text, q.spoken); this.ansText = null; this.mkTile(660, 285, MKS.comma(q.n), { w: Math.max(150, MKS.comma(q.n).length * 40 + 50), h: 120, size: 66, color: '#3d8bff' }); this.choose(q, { y: 515, h: 100, size: 44, autoW: true, cols: q.opts.some(v => v.length > 7) ? 2 : 4, w: 190 }); }
  r_rule(q) {
    this.setPrompt(q.text, q.spoken); this.ansText = null; const ls = this.letters(q.roman, 660, 280, { h: 110 }), n = q.roman.length;
    q.roman.split('').forEach((c, i) => this.txt(660 + (i - (n - 1) / 2) * 86, 358, String(MKS.RS[c]), { size: 24, color: RM_COL[c] }));
    this.choose(q, { y: 515, w: 250, h: 110, size: 46, cols: 2, opts: ['บวก', 'ลบ'], styles: ['green', 'primary'] }); this.chooser.opts2 = q; void ls;
  }
  isRight(v) { const q = this.q; if (q.kind === 'rule') return (v === 'บวก') === (q.rule === 'add'); return v === q.ans; }
  r_fix(q) { this.setPrompt(q.text, q.spoken); this.ansText = null; this.txt(660, 270, 'ข้อไหนเขียนผิดกติกา', { size: 44, color: '#e0243d', stroke: '#ffffff', sw: 8 }); this.txt(660, 335, 'จำไว้: I X C ซ้ำได้ไม่เกิน 3 ตัว · V L D ห้ามซ้ำ', { size: 22 }); this.choose(q, { y: 510, w: 190, h: 100, size: 44, cols: 2, autoW: true }); }
  r_arith(q) {
    this.setPrompt('คำนวณแล้วตอบเป็นเลขโรมัน', q.spoken); this.ansText = null; const a = this.letters(q.a, 440, 285, { wmax: 280 }), b = this.letters(q.b, 880, 285, { wmax: 280 });
    this.txt(660, 285, q.plus ? '+' : '−', { size: 76, color: q.plus ? '#22b45a' : '#e0243d', stroke: '#ffffff', sw: 8 }); this.choose(q, { y: 515, h: 100, size: 42, cols: 2, autoW: true, w: 220 }); void a; void b;
  }
  clockTex(h) {
    return KG.tex(this.s, 'rmclock|' + h, 280, 280, c => {
      const cx = 140, cy = 140; c.fillStyle = 'rgba(45,42,94,.25)'; c.beginPath(); c.arc(cx + 3, cy + 6, 128, 0, 7); c.fill();
      c.fillStyle = '#fff8e0'; c.beginPath(); c.arc(cx, cy, 126, 0, 7); c.fill(); c.lineWidth = 8; c.strokeStyle = '#c98a1a'; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#2d2a5e'; c.beginPath(); c.arc(cx, cy, 134, 0, 7); c.stroke();
      c.font = '600 27px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2d2a5e'; for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; c.fillText(MKS.toRoman(i), cx + Math.cos(a) * 94, cy + Math.sin(a) * 94); }
      c.lineCap = 'round'; const ha = ((h % 12) / 12) * Math.PI * 2 - Math.PI / 2; c.strokeStyle = '#d63a4c'; c.lineWidth = 9; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ha) * 58, cy + Math.sin(ha) * 58); c.stroke();
      c.strokeStyle = '#2d2a5e'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 78); c.stroke(); c.fillStyle = '#2d2a5e'; c.beginPath(); c.arc(cx, cy, 9, 0, 7); c.fill();
    });
  }
  r_clock(q) {
    this.setPrompt('เข็มสั้นชี้เลขโรมันอะไร', q.spoken); this.ansText = null; const im = this.add(this.s.add.image(660, 318, this.clockTex(q.hour)).setDepth(9).setDisplaySize(240, 240)); this.popIn([im], 40);
    this.txt(900, 300, 'เข็มยาวชี้ XII\nเข็มสั้นสีแดง', { size: 22, align: 'center' }); this.choose(q, { y: 560, h: 92, size: 40, autoW: true, w: 150, gap: 16 });
  }
  r_year(q) { this.setPrompt(q.text, q.spoken); this.ansText = null; this.txt(660, 214, 'จารึกบนอาคารโรมัน', { size: 24, color: '#9a7a20' }); this.letters(q.roman, 660, 300, { wmax: 760 }); this.choose(q, { y: 520, h: 100, size: 48 }); }
  /* ---------- ประกอบเลขโรมัน ---------- */
  r_build(q, spec) {
    const s = this.s, n = q.tiles.length; this.mode = 'build'; this.live = spec.live !== false; this.setPrompt('ประกอบเลขโรมันของ ' + q.n, q.spoken); this.ansText = null;
    this.mkTile(660, 262, MKS.comma(q.n), { w: Math.max(150, MKS.comma(q.n).length * 40 + 50), h: 100, size: 58, color: '#3d8bff' });
    this.trayY = 392; this.trayImg = this.add(s.add.image(660, this.trayY, this.slotTex(780, 100)).setDepth(6)); this.txt(660, this.trayY + 76, '', { size: 22 }); this.livet = this.objs[this.objs.length - 1];
    const step = Math.min(104, 700 / n), x0 = 590 - (n - 1) * step / 2;
    this.pal = q.tiles.map((c, i) => {
      const t = this.mkTile(x0 + i * step, 548, c, { w: 80, h: 92, size: 56, color: RM_COL[c] }); t.setSize(80, 92); t.setInteractive({ useHandCursor: true }); t.on('pointerdown', () => this.addLetter(c, t)); this.txt(x0 + i * step, 618, String(MKS.RS[c]), { size: 22, color: RM_COL[c] }); return t;
    }); this.popIn(this.pal, 100);
    this.btnBack = this.add(new KG.ui.Button(s, 1008, 522, 120, 66, { label: '', icon: 'bksp', style: 'danger', size: 26, slant: 6, onClick: () => this.delLetter() }).setDepth(9)); this.btnOk = this.add(new KG.ui.Button(s, 1008, 604, 120, 66, { label: 'ตรวจ', icon: 'check', style: 'green', size: 26, slant: 6, onClick: () => this.checkBuild() }).setDepth(9));
    this.txt(660, 205, 'แตะแผ่นตัวอักษรเรียงให้เป็นเลขโรมัน แล้วกดตรวจ', { size: 20, weight: 400, color: '#7a77a8' }); this.redrawBuilt();
  }
  buildKey(e) {
    if (this.mode !== 'build' || !this.running || this.busy) return; const c = e.code || '', m = /^Key([IVXLCDM])$/.exec(c);
    if (m && this.q.tiles.indexOf(m[1]) >= 0) { const t = this.pal[this.q.tiles.indexOf(m[1])]; this.addLetter(m[1], t); } else if (c === 'Backspace') this.delLetter(); else if (c === 'Enter' || c === 'NumpadEnter') this.checkBuild();
  }
  addLetter(c, from) { if (!this.running || this.busy || this.built.length >= 16) return; this.built.push(c); KG.audio.play('tap'); if (from) this.s.tweens.add({ targets: from, scaleX: 0.88, scaleY: 0.88, duration: 70, yoyo: true }); this.redrawBuilt(true); }
  delLetter() { if (!this.running || this.busy || !this.built.length) return; this.built.pop(); KG.audio.play('tap'); this.redrawBuilt(); }
  redrawBuilt(pop) {
    this.tray.forEach(t => t.destroy()); this.tray = []; const n = this.built.length, w = Math.min(70, Math.floor(740 / Math.max(1, n)) - 6);
    this.built.forEach((c, i) => { const t = this.mkTile(660 + (i - (n - 1) / 2) * (w + 6), this.trayY, c, { w, h: 84, size: Math.round(54 * Math.min(1, w / 62)), color: RM_COL[c], depth: 11 }); this.tray.push(t); if (pop && i === n - 1) { t.setScale(0.2); this.s.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 180, ease: 'Back.easeOut' }); } });
    if (this.livet) this.livet.setText(this.live && n ? 'ตอนนี้ได้ ' + MKS.fromRoman(this.built.join('')) : (n ? '' : 'ยังไม่มีตัวอักษร'));
  }
  checkBuild() {
    if (!this.running || this.busy) return; const s = this.s, str = this.built.join(''), q = this.q; if (!str) { s.bad(660, this.trayY, 'ยังไม่ได้ใส่ตัวอักษร'); return; }
    const v = MKS.fromRoman(str);
    if (str === q.roman) { this.busy = true; this.tray.forEach((t, i) => s.time.delayedCall(i * 60, () => s.tweens.add({ targets: t, y: t.y - 22, duration: 120, yoyo: true }))); this.explain(MKS.explainRoman(q.n), 470); this.hintObj && this.hintObj.destroy(); this.roundDone(660, this.trayY, 1700); return; }
    this.wrong++; this.tray.forEach(t => s.tweens.add({ targets: t, x: t.x + 8, duration: 50, yoyo: true, repeat: 3 }));
    const msg = v === q.n ? 'ค่าถูกแล้ว แต่เขียนไม่ตรงกติกา ลองเขียนให้สั้นลง' : (v > q.n ? 'ค่ามากเกินไป (ได้ ' + v + ')' : 'ค่าน้อยเกินไป (ได้ ' + v + ')'); s.bad(660, this.trayY - 30, msg);
    if (this.wrong >= 2) { s.hints++; s.coach.react('hint', 'ลองแยก: ' + MKS.romanParts(q.n).map(p => p[1]).join(' + ')); }
  }
}
