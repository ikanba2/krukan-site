/* ===== Techno Talk: ถามตอบ 8 ข้อ (เลือกคำตอบ: ภาพ › ประโยค · ไทย › อังกฤษ · เติมคำ · ฟังแล้วเลือกภาพ · ถาม › ตอบ) =====
   โครงหน้าจอ: แถบโจทย์ทรงแคปซูลด้านบน (เลขข้อ + คำสั่ง + ปุ่มฟัง) · ใต้แถบแบ่งตามชนิดโจทย์
     มีภาพประกอบ: ภาพการ์ดใหญ่ซ้าย · ตัวเลือกเรียงลงทางขวา
     ไม่มีภาพ: การ์ดข้อความโจทย์ตรงกลาง · ตัวเลือกเป็นกระเบื้อง 2 x 2
     ตัวเลือกเป็นภาพ: ปุ่มฟัง/คำโจทย์ตรงกลาง · การ์ดภาพเรียงแถว
   ทุกตัวเลือกมีเลขในวงกลมสี กดเลข 1–4 บนคีย์บอร์ดเลือกได้ · Space ฟังอีกครั้ง (โจทย์ที่ฟังได้) */
const QZ_COL = ['#ff7ab2', '#4aa8ff', '#ffb02e', '#58c864'];
const QZ_TOP = 168, QZ_BOT = 628;   // พื้นที่ใต้แถบโจทย์ ถึงเหนือแถบโค้ช
class QuizScene extends ActBase {
  constructor() { super('Quiz'); this.ACT = 'quiz'; }
  init(d) { super.init(d); this.qs = TK.makeQuiz(this.unit, (Date.now() & 0xfffffff) + 11, SPEECH.can, 8); this.qi = 0; this.objs = []; this.btns = []; this.locked = false; this.firstTry = 0; this.qMistake = false; }
  create() {
    this.begin(); this.HOW = '1. อ่านหรือฟังโจทย์ แล้วแตะคำตอบที่ถูกต้อง มีทั้งหมด 8 ข้อ\n2. โจทย์มีหลายแบบ: ภาพกับประโยค แปลไทยเป็นอังกฤษ เติมคำ ฟังแล้วเลือกภาพ และถามตอบ\n3. กดเลข 1–4 บนคีย์บอร์ดเพื่อเลือกคำตอบได้ โจทย์ที่มีเสียงกด Space ฟังอีกครั้ง\n4. ถ้าตอบผิด จะมีเหตุผลบอกและเลือกใหม่ได้ แต่นับเป็นพลาด 1 ครั้ง\n5. ตอบถูกจะอ่านประโยคให้ฟังด้วย';
    this.makePips(8, 560); this.show();
    this.input.keyboard.on('keydown', e => {
      if (this.done || this.paused || this._modal) return; const m = /^(Digit|Numpad)([1-9])$/.exec(e.code);
      if (m) { const b = this.btns[+m[2] - 1]; if (b) this.choose(b); } else if (e.code === 'Space' && this.canHear(this.cur)) this.speak(this.cur.say);
    });
  }
  // โจทย์ที่ฟังได้โดยไม่บอกคำตอบ: ฟังแล้วเลือกภาพ · คำที่ให้เลือกภาพ · คำถามของถามตอบ
  canHear(q) { return !!(q && q.say && (q.type === 'listen' || q.type === 'wordpic' || q.type === 'qa')); }
  show() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.btns = []; this.locked = false; this.qMistake = false;
    const q = this.cur = this.qs[this.qi], add = o => { this.objs.push(o); return o; }, hasPic = !!q.pic, isPicOpts = q.opts[0].pic != null;
    this.head(q, add);
    if (isPicOpts) this.layoutPicOpts(q, add);
    else if (hasPic) this.layoutPicLeft(q, add);
    else this.layoutGrid(q, add);
    this.setPips(this.qi); this.say('ข้อ ' + (this.qi + 1) + ': ' + q.prompt + (q.type === 'listen' ? ' ฟังเสียงให้ดีนะ' : q.type === 'qa' ? ' ดูประธานและคำช่วยให้ตรงกับคำถาม' : q.type === 'grammar' ? ' ดูประธานของประโยคให้ดี' : ''), 'smile');
    if (this.canHear(q)) this.time.delayedCall(350, () => { if (this.cur === q) this.speak(q.say); });
  }
  // แถบโจทย์: ป้ายเลขข้อ + คำสั่ง + ปุ่มฟัง (ถ้าฟังได้)
  head(q, add) {
    const c = add(this.add.container(0, 0).setDepth(6)), x0 = 40, w = 1200, y = 126;
    c.add(addCard(this, x0 + w / 2, y, w, 64, { r: 32, lw: 3.5, shadow: 5, fill: ['#ffffff', '#fff3fa'] }));
    const lab = 'ข้อ ' + (this.qi + 1) + '/' + this.qs.length, lw = KG.measure(lab, '600 22px Kanit') + 36;
    c.add(addCard(this, x0 + 18 + lw / 2, y, lw, 44, { r: 22, lw: 3, shadow: 0, fill: [TKC.purple, shade(TKC.purple, 0.88)] }));
    c.add(KG.txt(this, x0 + 18 + lw / 2, y, lab, { size: 22, color: '#ffffff', center: true, middle: true }));
    // ฟังแล้วเลือกภาพมีปุ่มฟังใหญ่กลางจออยู่แล้ว ไม่ต้องมีปุ่มฟังที่แถบโจทย์
    const hear = this.canHear(q) && q.type !== 'listen', t = KG.txt(this, x0 + lw + 38, y, q.prompt, { size: 27, color: TKC.ink, oy: 0.5 }); fitText(t, w - lw - (hear ? 210 : 70)); c.add(t);
    if (hear) { const b = new KG.ui.Button(this, x0 + w - 90, y, 150, 46, { label: 'ฟัง', icon: 'sound', style: 'cyan', size: 21, slant: 6, onClick: () => this.speak(q.say) }); c.add(b); }
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 200 });
  }
  // การ์ดข้อความโจทย์ (ประโยค คำ คำถาม) + คำแปลบรรทัดล่าง
  textCard(q, x, y, maxW, add) {
    const size = q.type === 'th2en' ? 40 : 46, tw = Math.min(maxW, Math.max(300, KG.measure(q.text, '600 ' + size + 'px Kanit') + 90)), h = q.sub ? 124 : 92;
    add(addCard(this, x, y, tw, h, { r: 32, lw: 4, shadow: 7, fill: ['#ffffff', '#f3ecff'] }).setDepth(3));
    add(fitText(KG.txt(this, x, y - (q.sub ? 16 : 0), q.text, { size, color: TKC.ink, center: true, ox: 0.5, oy: 0.5 }).setDepth(4), tw - 60));
    if (q.sub) add(fitText(KG.txt(this, x, y + 36, q.sub, { size: 24, weight: 400, color: '#6a64a0', center: true, ox: 0.5, oy: 0.5 }).setDepth(4), tw - 60));
    return h;
  }
  // มีภาพประกอบ: ภาพซ้าย ตัวเลือกเรียงลงขวา (มีข้อความโจทย์ก็วางเหนือตัวเลือก)
  layoutPicLeft(q, add) {
    const px = 290, py = (QZ_TOP + QZ_BOT) / 2, pw = 460, ph = 420;
    add(addCard(this, px, py, pw, ph, { r: 36, lw: 4, shadow: 9, fill: ['#fffdf2', '#ffe9b8'] }).setDepth(3));
    add(this.add.circle(px, py - 6, 170, 0xffffff, 0.55).setDepth(3)); add(pic(this, q.pic, px, py - 6, pw - 50, ph - 60).setDepth(4));
    const rx = 900, rw = 640; let top = QZ_TOP;
    if (q.text) { const h = this.textCard(q, rx, top + 62, rw, add); top += h + 34; }
    const n = q.opts.length, oh = Math.min(92, (QZ_BOT - top - (n - 1) * 14) / n), total = n * oh + (n - 1) * 14, y0 = top + Math.max(0, (QZ_BOT - top - total) / 2);
    q.opts.forEach((o, i) => this.makeOpt(o, rx, y0 + i * (oh + 14) + oh / 2, rw, oh, i));
  }
  // ไม่มีภาพ: การ์ดโจทย์ตรงกลาง ตัวเลือกเป็นกระเบื้อง 2 x 2
  layoutGrid(q, add) {
    let top = QZ_TOP;
    if (q.text) { const h = this.textCard(q, GW / 2, top + 70, 1080, add); top += h + 44; }
    const n = q.opts.length, cols = n <= 2 ? n : 2, rows = Math.ceil(n / cols), gw = 556, gap = 22, gh = Math.min(120, (QZ_BOT - top - (rows - 1) * gap) / rows), totH = rows * gh + (rows - 1) * gap, y0 = top + Math.max(0, (QZ_BOT - top - totH) / 2);
    q.opts.forEach((o, i) => { const r = Math.floor(i / cols), c = i % cols, rowN = Math.min(cols, n - r * cols), x = GW / 2 + (c - (rowN - 1) / 2) * (gw + gap); this.makeOpt(o, x, y0 + r * (gh + gap) + gh / 2, gw, gh, i); });
  }
  // ตัวเลือกเป็นภาพ: ปุ่มฟังใหญ่ (ฟังแล้วเลือก) หรือการ์ดคำ แล้วการ์ดภาพเรียงแถว
  layoutPicOpts(q, add) {
    let top = QZ_TOP;
    if (q.type === 'listen') {
      const b = add(new KG.ui.Button(this, GW / 2, top + 58, 330, 88, { label: SPEECH.can ? 'ฟังอีกครั้ง' : 'ฟัง', icon: 'sound', style: 'cyan', size: 32, onClick: () => this.speak(q.say) }).setDepth(5)); b.pulse(); top += 130;
    } else if (q.text) { const h = this.textCard(q, GW / 2, top + 66, 900, add); top += h + 40; }
    const n = q.opts.length, cw = Math.min(270, (1180 - (n - 1) * 26) / n), ch = Math.min(280, QZ_BOT - top - 10), x0 = GW / 2 - ((n - 1) * (cw + 26)) / 2, y = top + (QZ_BOT - top) / 2;
    q.opts.forEach((o, i) => this.makeOpt(o, x0 + i * (cw + 26), y, cw, ch, i));
  }
  // ตัวเลือก: การ์ดสีพาสเทลตามลำดับ มีเลขในวงกลมสี (ข้อความชิดซ้ายถัดจากเลข · ภาพอยู่กลางการ์ด เลขที่มุมซ้ายบน)
  makeOpt(o, x, y, w, h, i) {
    const c = this.add.container(x, y).setDepth(8), col = QZ_COL[i % QZ_COL.length]; this.objs.push(c); this.btns.push(c); c.o = o; c.w = w; c.h = h;
    c.bg = addCard(this, 0, 0, w, h, { r: o.pic ? 30 : Math.min(28, h / 2), fill: [mixWhite(col, 0.9), mixWhite(col, 0.76)], shadow: 7, lw: 4 }); c.add(c.bg);
    const bx = o.pic ? -w / 2 + 30 : -w / 2 + 38, by = o.pic ? -h / 2 + 30 : 0, br = o.pic ? 20 : Math.min(24, h * 0.3);
    if (o.pic) c.add(pic(this, o.pic, 0, 6, w - 30, h - 40));
    else { const t = KG.txt(this, -w / 2 + 38 + br + 22, 0, o.text, { size: 36, color: TKC.ink, oy: 0.5 }); fitText(t, w - (38 + br + 22) - 30); c.add(t); c.label = t; }
    c.badge = this.add.circle(bx, by, br, colN(col)).setStrokeStyle(3, 0x2d2a5e); c.add(c.badge);
    c.add(KG.txt(this, bx, by, String(i + 1), { size: Math.round(br * 1.15), color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }));
    c.setSize(w, h).setInteractive({ useHandCursor: true }); c.on('pointerup', () => this.choose(c));
    c.on('pointerover', () => { if (!c.used && !this.locked) this.tweens.add({ targets: c, scaleX: 1.03, scaleY: 1.03, duration: 110 }); });
    c.on('pointerout', () => { if (!c.used) this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 110 }); });
    c.setAlpha(0).setScale(0.9); this.tweens.add({ targets: c, alpha: 1, scaleX: 1, scaleY: 1, duration: 240, delay: 70 * i, ease: 'Back.easeOut' });
  }
  choose(c) {
    if (this.locked || this.done || this.paused || this._modal || c.used) return; const q = this.cur;
    if (c.o.ok) {
      this.locked = true; c.bg.setTint(0xb8ffc8); c.badge.setFillStyle(0x3fb54a); this.good(c.x, c.y); if (!this.qMistake) this.firstTry++;
      const ic = this.add.container(c.w / 2 - 34, c.o.pic ? -c.h / 2 + 32 : 0); ic.add(this.add.circle(0, 0, 22, 0xffffff).setStrokeStyle(3, 0x3fb54a)); ic.add(KG.ui.icon(this, 'check', 0, 0, 30, 0x3fb54a)); c.add(ic);
      this.tweens.add({ targets: c, scaleX: 1.06, scaleY: 1.06, duration: 150, yoyo: true });
      this.btns.forEach(b => { if (b !== c && !b.used) this.tweens.add({ targets: b, alpha: 0.4, duration: 220 }); });
      const full = q.type === 'grammar' ? q.answerSentence : q.say; if (full) this.speak(full);
      this.say(q.type === 'grammar' ? 'ถูกต้อง! ' + q.answerSentence : q.type === 'word' || q.type === 'wordpic' ? 'ถูกต้อง! ' + q.say + ' แปลว่า ' + q.th : q.type === 'listen' ? 'ถูกต้อง! ' + q.en + ' = ' + q.th : q.type === 'qa' ? 'ถูกต้อง! ' + c.o.text : 'ถูกต้อง! ' + (q.th ? q.say + ' = ' + q.th : q.say), 'happy');
      this.setPips(this.qi + 1); this.time.delayedCall(1700, () => { this.qi++; if (this.qi >= this.qs.length) this.finish([['ตอบถูกในครั้งแรก', this.firstTry + '/' + this.qs.length + ' ข้อ']]); else this.show(); });
    } else {
      this.mistakes++; this.qMistake = true; c.used = true; c.bg.setTint(0xffb8b8); c.badge.setFillStyle(0xee4a4a); c.setScale(1); c.setAlpha(0.6); this.bad(c); this.say(c.o.why || 'ยังไม่ถูก ลองดูอีกครั้งนะ', 'sad'); c.disableInteractive();
      const x = this.add.container(c.w / 2 - 34, c.o.pic ? -c.h / 2 + 32 : 0); x.add(this.add.circle(0, 0, 22, 0xffffff).setStrokeStyle(3, 0xee4a4a)); x.add(KG.ui.icon(this, 'close', 0, 0, 26, 0xee4a4a)); c.add(x);
    }
  }
  hint() {
    if (this.done || this.locked) return; const left = this.btns.filter(b => !b.used && !b.o.ok); if (!left.length) return; this.hints++; KG.audio.play('pop');
    const b = left[0]; b.used = true; b.setAlpha(0.35); b.disableInteractive(); this.say('คำใบ้: ตัดตัวเลือกที่ผิดออกให้ 1 ข้อแล้ว', 'open');
  }
}
