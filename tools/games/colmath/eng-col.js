/* ===== คิดเลขแสนสนุก (ภารกิจคำนวณแนวตั้ง): ColEng สืบทอดจาก MathEng =====
   column: ตั้งบวก/ลบแนวตั้งบนกระดาษ เขียนคำตอบทีละหลักจากหลักหน่วย ถูกแล้วขยับไปหลักถัดไปเอง
           บวก: ตัวทดขึ้นให้เอง หรือ (mark: true) ต้องพิมพ์ 1 ในช่องตัวทดเหนือหลักถัดไป · ลบ: ขึ้นตัวตั้งใหม่หลังยืม (ขีดฆ่าตัวเดิม) ก่อนให้ลบ
   addsub / story / bond: โจทย์เลือกคำตอบ · พลาดสองครั้งในช่องเดียวจะแสดงวิธีคิดของหลักนั้น · ปุ่มหลอดไฟบนแป้นตัวเลข = คำใบ้ */
const CM_PLACE = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น'];
class ColEng extends MathEng {
  constructor(s, p) { super(s, p); this.cells = []; this.cmode = false; }
  clear() { super.clear(); this.cells = []; this.pad = null; this.target = null; this.cmode = false; }
  onKey(e) { super.onKey(e); if (!this.cmode || !this.running || this.busy) return; const k = MKU.keyOf(e); if (k && this.pad) this.pad.press(k); }
  /* ---------- ตั้งบวก/ลบแนวตั้ง ---------- */
  r_column(q, spec) {
    const s = this.s, ds = q.steps, A = String(q.a), B = String(q.b), nAns = String(q.ans).length, ncols = Math.max(A.length, B.length, nAns), colW = ncols <= 3 ? 84 : ncols === 4 ? 76 : ncols === 5 ? 68 : 60;
    this.cmode = true; this.mark = !!spec.mark && q.op === '+'; this.setPrompt((q.op === '+' ? 'ตั้งบวก ' : 'ตั้งลบ ') + q.text, q.spoken); this.ansText = null;
    const X1 = 646, cx = i => X1 - colW / 2 - i * colW, rowCarry = 258, rowTop = 340, rowBot = 418, rowLine = 462, rowAns = 530, g = this.add(s.add.graphics().setDepth(5));
    // กระดาษ
    g.fillStyle(0x2d2a5e, 0.18); g.fillRoundedRect(268, 200, 428, 480, 18); g.fillStyle(0xfffbea, 1); g.fillRoundedRect(262, 192, 428, 480, 18); g.lineStyle(4, 0xc9a85a, 1); g.strokeRoundedRect(262, 192, 428, 480, 18);
    g.lineStyle(1.5, 0xe8d9a8, 1); for (let y = 232; y < 660; y += 38) g.lineBetween(280, y, 672, y); g.lineStyle(2.5, 0xf2a0a0, 1); g.lineBetween(298, 200, 298, 664);
    this.txt(300, 212, 'ตั้งหลักให้ตรงกัน เริ่มจากหลักหน่วย', { size: 18, weight: 400, color: '#9a7a20', ox: 0 }).setOrigin(0, 0.5);
    this.topT = []; this.botT = []; this.carryT = []; this.strike = []; this.boxes = {}; this.cbox = {};
    const dg = (str, i) => (i < str.length ? str[str.length - 1 - i] : '');
    for (let i = 0; i < ncols; i++) {
      const t = this.txt(cx(i), rowTop, dg(A, i), { size: 64, color: '#2d2a5e' }), b = this.txt(cx(i), rowBot, dg(B, i), { size: 64, color: '#2d2a5e' }); this.topT.push(t); this.botT.push(b); [t, b].forEach(o => { o.setScale(0); s.tweens.add({ targets: o, scale: 1, duration: 240, delay: 60 * (ncols - i), ease: 'Back.easeOut' }); });
    }
    this.txt(X1 - ncols * colW - 22, rowBot, q.op === '+' ? '+' : '−', { size: 64, color: q.op === '+' ? '#22b45a' : '#e0243d' });
    g.lineStyle(7, 0x2d2a5e, 1); g.lineBetween(X1 - ncols * colW - 52, rowLine, X1 + 8, rowLine);
    // ช่องคำตอบและช่องตัวทด
    this.cells = ds.filter(st => st.place < nAns).map(st => {
      const i = st.place, bw = colW - 10, bh = 84, gr = this.add(s.add.graphics().setDepth(6)), t = this.txt(cx(i), rowAns, '', { size: 64, color: '#2d2a5e' }), cell = { st, i, gr, t, x: cx(i), y: rowAns, w: bw, h: bh, done: false };
      this.drawCell(cell, 'idle'); this.boxes[i] = cell; return cell;
    });
    if (q.op === '+') ds.forEach(st => { if (st.mark) { const i = st.place + 1, gr = this.add(s.add.graphics().setDepth(6)), t = this.txt(cx(i), rowCarry, '', { size: 30, color: '#e0243d' }); this.cbox[i] = { i, gr, t, x: cx(i), y: rowCarry, w: 44, h: 38, done: false }; if (this.mark) this.drawCarry(this.cbox[i], 'idle'); } });
    this.layout = { cx, rowCarry, rowTop, rowBot, rowAns, colW, ncols, X1, rowLine };
    // แผงขวา: คำสั่งของหลักนี้ + แป้นตัวเลข
    this.stepBox = this.add(KG.ui.panel(s, 722, 196, 340, 100, { accent: '#ffc400', accent2: '#ffc400', cuts: [14, 0, 14, 0], glow: false, alpha: 0.96 }).setDepth(6)); this.stepT = this.txt(892, 246, '', { size: 28, color: '#2d2a5e', width: 300, align: 'center' });
    this.pad = this.add(MKU.numpad(s, 892, 470, { kw: 88, kh: 66, gap: 8, depth: 8, noBack: true, enterIcon: 'bulb', enterStyle: 'sun', onDigit: d => this.type(d), onEnter: () => this.showHint(true) })); this.pad.setAlpha(0); s.tweens.add({ targets: this.pad, alpha: 1, duration: 260, delay: 300 });
    this.txt(892, 648, 'ปุ่มหลอดไฟ = คำใบ้', { size: 18, weight: 400, color: '#7a77a8' });
    this.hintLine = this.txt(480, 612, '', { size: 21, color: '#e0243d', width: 400, align: 'center' });
    this.focus(0);
  }
  // หลักที่กำลังทำ: ไฮไลต์ช่อง บอกคำสั่ง และขึ้นตัวช่วยของหลักนั้น (ตัวทด/ตัวตั้งใหม่หลังยืม)
  focus(idx) {
    const q = this.q, c = this.cells[idx]; this.cur = idx; this.target = null; this.hintLine.setText(''); this.wrongHere = 0; if (!c) return;
    const st = c.st, L = this.layout, prev = idx > 0 ? this.cells[idx - 1].st : null;
    if (q.op === '+') {
      if (st.in) { if (this.mark) { this.target = { type: 'carry', place: c.i }; this.drawCarry(this.cbox[c.i], 'active'); this.stepT.setText('ตัวทด: มีอะไรทดมาจากหลัก' + CM_PLACE[c.i - 1] + '? พิมพ์ตัวทด'); return; } this.putCarry(c.i, true); }
      this.stepT.setText(st.lead ? 'หลัก' + CM_PLACE[c.i] + ': ตัวทดลงมา' : 'หลัก' + CM_PLACE[c.i] + ': ' + st.x + ' + ' + st.y + (st.in ? ' + ' + st.in : '') + ' = ?');
    } else {
      if (st.in || st.mark) { const xe = st.xEff == null ? st.x - st.in : st.xEff; this.strikeTop(c.i, xe); this.stepT.setText('หลัก' + CM_PLACE[c.i] + ': ' + xe + ' − ' + st.y + ' = ?'); } else this.stepT.setText('หลัก' + CM_PLACE[c.i] + ': ' + st.x + ' − ' + st.y + ' = ?');
    }
    this.target = { type: 'ans', place: c.i }; this.drawCell(c, 'active'); void L; void prev;
  }
  drawCell(c, state) {
    const g = c.gr; g.clear(); const f = { idle: [0xeef4ff, 0xa9c0e8, 2], active: [0xfff4b8, 0xff9d00, 4], wrong: [0xffe0dc, 0xe8452c, 4], done: [0xe3fff1, 0x22b45a, 3] }[state];
    if (state === 'active') { g.lineStyle(10, 0xffc400, 0.3); g.strokeRoundedRect(c.x - c.w / 2 - 4, c.y - c.h / 2 - 4, c.w + 8, c.h + 8, 14); this.s.tweens.killTweensOf(c.gr); this.s.tweens.add({ targets: c.gr, alpha: { from: 1, to: 0.7 }, duration: 480, yoyo: true, repeat: -1 }); } else { this.s.tweens.killTweensOf(c.gr); c.gr.setAlpha(1); }
    g.fillStyle(f[0], 1); g.fillRoundedRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 12); g.lineStyle(f[2], f[1], 1); g.strokeRoundedRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 12);
  }
  drawCarry(c, state) {
    const g = c.gr; g.clear(); const f = { idle: [0xfff0f0, 0xe8a0a0, 2], active: [0xfff4b8, 0xff9d00, 3.5], done: null }[state]; this.s.tweens.killTweensOf(g); g.setAlpha(1); if (!f) return;
    g.fillStyle(f[0], 1); g.fillRoundedRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 9); g.lineStyle(f[2], f[1], 1); g.strokeRoundedRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 9); if (state === 'active') this.s.tweens.add({ targets: g, alpha: 0.65, duration: 440, yoyo: true, repeat: -1 });
  }
  putCarry(place, anim) { const c = this.cbox[place]; if (!c) return; c.done = true; this.drawCarry(c, 'done'); c.t.setText('1').setAlpha(1); if (anim) { c.t.setScale(0.2); this.s.tweens.add({ targets: c.t, scale: 1, duration: 260, ease: 'Back.easeOut' }); KG.audio.play('pop'); } }
  // ลบ: ขีดฆ่าตัวตั้งเดิม ขึ้นตัวตั้งใหม่ (หลังยืม/ถูกยืม) เหนือหลักนั้น
  strikeTop(place, newVal) {
    const L = this.layout, t = this.topT[place]; if (!t || !t.text) return; const g = this.add(this.s.add.graphics().setDepth(7)); g.lineStyle(6, 0xe0243d, 1); g.lineBetween(L.cx(place) - 24, L.rowTop + 24, L.cx(place) + 24, L.rowTop - 24); this.strike.push(g);
    const n = this.txt(L.cx(place), L.rowCarry, String(newVal), { size: 34, color: '#e0243d' }); n.setScale(0.2); this.s.tweens.add({ targets: n, scale: 1, duration: 260, ease: 'Back.easeOut' }); KG.audio.play('pop');
  }
  // รับตัวเลขจากแป้น/คีย์บอร์ด
  type(d) {
    if (!this.running || this.busy || !this.target) return; const q = this.q, tg = this.target;
    if (tg.type === 'carry') {
      const c = this.cbox[tg.place]; if (d === '1') { this.putCarry(tg.place, true); this.target = { type: 'ans', place: tg.place }; this.drawCell(this.cells[this.cur], 'active'); const st = this.cells[this.cur].st; this.stepT.setText(st.lead ? 'หลัก' + CM_PLACE[tg.place] + ': ตัวทดลงมา' : 'หลัก' + CM_PLACE[tg.place] + ': ' + st.x + ' + ' + st.y + ' + 1 = ?'); }
      else { this.s.bad(c.x, c.y, 'ตัวทดคือ 1'); this.wrong++; this.s.tweens.add({ targets: c.gr, x: 8, duration: 50, yoyo: true, repeat: 3 }); }
      return;
    }
    const c = this.cells[this.cur], st = c.st;
    if (d === String(st.digit)) {
      this.target = null; c.done = true; this.drawCell(c, 'done'); c.t.setText(d).setColor('#16833a'); c.t.setScale(0.3); this.s.tweens.add({ targets: c.t, scale: 1, duration: 220, ease: 'Back.easeOut' });
      KG.audio.tone({ f: KG.kit.mtof(64 + this.cur * 2), t: 0.2, type: 'triangle', vol: 0.12 }); mkRing(this.s, c.x, c.y, 0x22b45a);
      if (this.cur + 1 >= this.cells.length) { this.finish(); return; }
      this.s.time.delayedCall(180, () => { if (this.alive && !this.s.over && this.round && this.cells[this.cur] === c) this.focus(this.cur + 1); });
    } else {
      this.wrong++; this.wrongHere++; this.drawCell(c, 'wrong'); c.t.setText(d).setColor('#e0243d'); this.s.bad(c.x, c.y - 50, 'ยังไม่ใช่ ลองอีกที'); this.s.tweens.add({ targets: c.t, x: c.x + 8, duration: 45, yoyo: true, repeat: 3 });
      this.s.time.delayedCall(420, () => { if (!c.done && this.cells[this.cur] === c) { c.t.setText('').setColor('#2d2a5e'); this.drawCell(c, 'active'); } });
      if (this.wrongHere >= 2) this.showHint(false);
    }
  }
  explainStep(st) {
    if (this.q.op === '+') return st.lead ? 'ตัวทดลงมา เขียน 1' : st.x + ' + ' + st.y + (st.in ? ' + ' + st.in + ' (ตัวทด)' : '') + ' = ' + (st.x + st.y + st.in) + (st.mark ? ' เขียน ' + st.digit + ' ทด 1' : ' เขียน ' + st.digit);
    const xe = st.xEff == null ? st.x - st.in : st.xEff; return (st.in ? st.x + ' ถูกยืมไป 1 เหลือ ' + (st.x - 1) + ' ' : '') + (st.mark ? 'ลบไม่ได้ ยืม 10 มาเป็น ' + xe + ' ' : '') + xe + ' − ' + st.y + ' = ' + st.digit;
  }
  showHint(manual) {
    if (!this.cmode || !this.running || this.busy || !this.cells[this.cur]) return; const c = this.cells[this.cur]; this.hintLine.setText(this.explainStep(c.st)); this.s.hints++; this.s.coach.react('hint', c.st.digit === 0 ? 'ลองคิดดูอีกที' : undefined); void manual;
  }
  finish() {
    this.busy = true; const q = this.q, s = this.s; this.hintLine.setText('');
    this.cells.forEach((c, i) => s.time.delayedCall(i * 90, () => s.tweens.add({ targets: c.t, y: c.y - 14, duration: 110, yoyo: true })));
    this.stepT.setText('ถูกต้อง! ' + MKS.comma(q.a) + (q.op === '+' ? ' + ' : ' − ') + MKS.comma(q.b) + ' = ' + MKS.comma(q.ans)); this.roundDone(this.layout.X1 - 100, this.layout.rowAns, 1300);
  }
  /* ---------- โจทย์เลือกคำตอบ ---------- */
  eq(q) { return q.text.replace('?', MKS.comma(q.ans)); }
  onRight(x, y) { const q = this.q; if (q.kind === 'addsub' || q.kind === 'story' || q.kind === 'bond') this.explain(q.kind === 'story' ? MKS.comma(q.a) + (q.op === '+' ? ' + ' : ' − ') + MKS.comma(q.b) + ' = ' + MKS.comma(q.c) : this.eq(q)); this.roundDone(x, y, 1500); }
  explain(t) { const x = this.txt(660, 420, t, { size: 30, color: '#16833a', width: 760, align: 'center' }); x.setAlpha(0); this.s.tweens.add({ targets: x, alpha: 1, duration: 240 }); }
  hintText() { const q = this.q; if (q.kind === 'addsub' && q.form === 'res') return q.op === '+' ? 'ลองนับเพิ่มจากเลขแรก' : 'ลองนับถอยหลังจากเลขแรก'; return 'ลองใช้การบวกหรือลบย้อนกลับ'; }
  r_addsub(q) { this.setPrompt('คำนวณแล้วเลือกคำตอบ', q.spoken); this.ansText = null; this.add(MKU.exprBox(this.s, 660, 290, 760, 150, q.text, { size: 80, color: '#3d8bff' })); this.choose(q, { y: 520, h: 100, size: 52 }); }
  r_story(q) {
    this.setPrompt('อ่านเรื่อง แล้วเลือกคำตอบ', q.spoken); this.ansText = null; const p = KG.ui.panel(this.s, 280, 214, 760, 170, { accent: '#ff9a2e', accent2: '#ffc400', cuts: [16, 0, 16, 0], glow: false, alpha: 0.98 }).setDepth(6); this.add(p);
    this.txt(660, 299, q.text, { size: 34, color: '#2d2a5e', width: 690, align: 'center' }); this.choose(q, { y: 520, h: 100, size: 52 });
  }
  r_bond(q) {
    this.setPrompt('เลขอะไรบวกกันได้ ' + MKS.comma(q.a + q.ans), q.spoken); this.ansText = null; this.add(MKU.exprBox(this.s, 660, 270, 700, 120, q.text, { size: 70, color: '#3fbf6a' }));
    if (q.a + q.ans === 10) { // กรอบสิบ: จุดสีฟ้าคือตัวตั้ง ช่องเว้นคือที่ต้องเติม
      const g = this.add(this.s.add.graphics().setDepth(7)); for (let i = 0; i < 10; i++) { const x = 660 + (i % 5 - 2) * 56, y = 372 + Math.floor(i / 5) * 56; g.fillStyle(i < q.a ? 0x3d8bff : 0xffffff, 1); g.fillCircle(x, y, 21); g.lineStyle(3, 0x2d2a5e, 1); g.strokeCircle(x, y, 21); }
    }
    this.choose(q, { y: 560, h: 92, size: 50, w: 150 });
  }
}
