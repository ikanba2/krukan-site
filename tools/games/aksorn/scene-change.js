/* ===== Techno Aksorn: เติมตัวสะกด (สระเปลี่ยนรูป) เห็นพยางค์เดิม + ตัวสะกด แล้วเลือกคำที่เขียนถูก 6 ข้อ ===== */
class ChangeScene extends ActBase {
  constructor() { super('Change'); this.ACT = 'change'; }
  init(d) { super.init(d); this.rounds = AK.makeChange(this.lesson, this.lv, (Date.now() & 0xfffffff) + 81); this.ri = 0; this.locked = false; this.objs = []; this.wrong = {}; this.opts = []; }
  create() {
    this.begin();
    this.HOW = '1. ดูพยางค์เดิมกับตัวสะกดที่เติมต่อท้าย (ตัวสะกดสีน้ำเงิน)\n2. เมื่อมีตัวสะกด สระบางตัวต้องเปลี่ยนรูปหรือลดรูป เลือกคำที่เขียนถูกต้อง\n3. ถ้าเลือกผิดจะมีกฎบอกว่าสระนั้นเปลี่ยนเป็นอะไร ลองใหม่ได้\n4. ตอบครบ 6 ข้อจึงผ่าน';
    this.makePips(this.rounds.length, 520); this.startRound();
  }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.locked = false; this.wrong = {}; this.opts = [];
    const R = this.rounds[this.ri], n = R.opts.length; this.R = R;
    const eq = this.add.container(640, 188).setDepth(5); this.objs.push(eq); eq.add(addCard(this, 0, 0, 1040, 214, { r: 34, fill: ['#ffffff', '#fff3ee'], shadow: 9 }));
    eq.add(addCard(this, -330, 0, 250, 150, { r: 26, lw: 4, shadow: 6, fill: ['#ffffff', '#f6f0ff'] })); eq.add(richText(this, -330, 0, R.base, 90, { maxW: 220 }));
    eq.add(KG.txt(this, -160, 2, '+', { size: 64, color: TKC.ink, center: true, middle: true }));
    eq.add(addCard(this, -40, 0, 130, 150, { r: 26, lw: 4, shadow: 6, fill: ['#eef4ff', '#d8e6ff'] })); eq.add(glyph(this, -40, 0, R.f, 90, ROLE_COL.f));
    eq.add(KG.txt(this, 60, 2, '=', { size: 64, color: TKC.ink, center: true, middle: true }));
    this.slotW = this.add.container(260, 0); eq.add(this.slotW); this.slotW.add(addCard(this, 0, 0, 330, 150, { r: 26, lw: 4, shadow: 0, dash: true, fill: ['#fffdf2', '#fff6cf'] })); this.slotW.add(KG.txt(this, 0, 0, '?', { size: 76, color: '#d0c2ff', center: true, middle: true }));
    this.objs.push(this.txt(640, 306, 'ข้อ ' + (this.ri + 1) + ' · เขียนคำนี้ให้ถูกต้อง (เติมตัวสะกดแล้วสระเปลี่ยนรูป)', { size: 24, color: '#ffffff', stroke: TKC.ink, sw: 5, center: true, ox: 0.5 }));
    const cw = n <= 3 ? 250 : n === 4 ? 224 : 200, ch = 160, gx = 22;
    R.opts.forEach((w, i) => {
      const x = 640 + (i - (n - 1) / 2) * (cw + gx), y = 478, c = this.add.container(x, y).setDepth(6); c.w = w; this.objs.push(c); this.opts.push(c);
      c.add(addCard(this, 0, 0, cw, ch, { r: 28, fill: ['#ffffff', '#f6f0ff'], shadow: 8, lw: 4 })); c.bg = c.list[0]; c.add(richText(this, 0, 0, w, 70, { maxW: cw - 24 }));
      c.setSize(cw, ch).setInteractive({ useHandCursor: true }); c.on('pointerup', () => this.choose(c)); c.setScale(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 260, delay: 60 * i, ease: 'Back.easeOut' });
    });
    this.setPips(this.ri); this.say('เติม ' + R.f + ' ต่อท้าย ' + R.base + ' แล้วสระต้องเปลี่ยนรูป เลือกคำที่เขียนถูกนะ', 'smile');
  }
  choose(c) {
    if (this.locked || this.done || this.paused || this._modal) return; const R = this.R;
    if (c.w === R.word) {
      this.locked = true; this.good(c.x, c.y); c.bg.setTint(0xc8ffd2); this.tweens.add({ targets: c, scaleX: 1.1, scaleY: 1.1, duration: 140, yoyo: true });
      this.slotW.removeAll(true); this.slotW.add(addCard(this, 0, 0, 330, 150, { r: 26, lw: 4, shadow: 4, fill: ['#e6ffe9', '#c8ffd2'] })); this.slotW.add(richText(this, 0, 0, R.word, 90, { maxW: 300 })); this.tweens.add({ targets: this.slotW, scaleX: 1.1, scaleY: 1.1, duration: 160, yoyo: true });
      this.speak(R.word); this.say('ถูกต้อง! ' + R.rule, 'happy'); this.setPips(this.ri + 1);
      this.time.delayedCall(2000, () => { this.ri++; if (this.ri >= this.rounds.length) this.finish([['เขียนถูก', this.rounds.length + ' คำ']]); else this.startRound(); });
    } else {
      this.mistakes++; this.bad(c); c.bg.setTint(0xffb8b8); this.wrong[c.w] = 1; this.tweens.add({ targets: c, alpha: 0.45, duration: 200 });
      this.say((c.w === R.unchanged ? 'ยังไม่ได้เปลี่ยนรูปสระ ' : 'นี่เป็นรูปของสระตัวอื่น ') + R.rule + ' ลองใหม่นะ', 'sad');
    }
  }
  hint() {
    if (this.done || this.locked) return; const c = this.opts.find(k => k.w !== this.R.word && !this.wrong[k.w]); if (!c) return; this.hints++; this.wrong[c.w] = 1; KG.audio.play('pop'); this.tweens.add({ targets: c, alpha: 0.25, duration: 220 }); c.disableInteractive();
    this.say('คำใบ้: ' + this.R.rule + ' (ตัดตัวเลือกที่ไม่ใช่ออกให้หนึ่งใบ)', 'open');
  }
}
