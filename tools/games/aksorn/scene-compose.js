/* ===== Techno Aksorn: ประสมคำ (พยัญชนะ + สระ = พยางค์) 6 ข้อ · ฟังเสียงพยางค์แล้วเลือกสระที่ทำให้ได้คำนั้น ===== */
class ComposeScene extends ActBase {
  constructor() { super('Compose'); this.ACT = 'compose'; }
  init(d) { super.init(d); this.rounds = AK.makeCompose(this.lesson, this.lv, (Date.now() & 0xfffffff) + 71); this.ri = 0; this.locked = false; this.objs = []; this.wrong = {}; }
  create() {
    this.begin();
    this.HOW = '1. กดปุ่มลำโพงฟังเสียงพยางค์ (ถ้าเครื่องไม่มีเสียงอ่าน จะมีคำเขียนบอกที่หน้าจอ)\n2. ดูพยัญชนะทางซ้าย แล้วเลือกสระที่ทำให้พยัญชนะกับสระประสมเป็นพยางค์ที่ได้ยิน\n3. เลือกถูก พยางค์จะประกอบเสร็จให้ดู ถ้าผิดจะบอกว่าสระนั้นประสมแล้วได้พยางค์อะไร\n4. ตอบครบ 6 ข้อจึงผ่าน';
    this.makePips(this.rounds.length, 520); this.startRound();
  }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.locked = false; this.wrong = {}; this.opts = [];
    const R = this.rounds[this.ri], voice = SPEECH.exists, cinf = AK.info(R.c), n = R.opts.length; this.R = R;
    // สมการ: พยัญชนะ + [ช่องสระ] = [ช่องพยางค์]
    const eq = this.add.container(640, 190).setDepth(5); this.objs.push(eq); eq.add(addCard(this, 0, 0, 1000, 220, { r: 34, fill: ['#ffffff', '#f6f0ff'], shadow: 9 }));
    const tile = (x, ch, col) => { eq.add(addCard(this, x, 0, 170, 150, { r: 26, lw: 4, shadow: 6, fill: col })); if (ch) eq.add(glyph(this, x, 0, ch, 90, ROLE_COL.c)); };
    tile(-330, R.c, ['#ffffff', '#ffe8f2']); eq.add(KG.txt(this, -205, 2, '+', { size: 70, color: TKC.ink, center: true, middle: true }));
    this.slotV = this.add.container(-80, 0); eq.add(this.slotV); this.slotV.add(addCard(this, 0, 0, 170, 150, { r: 26, lw: 4, shadow: 0, dash: true, fill: ['#fffdf2', '#fff6cf'] })); this.slotV.add(KG.txt(this, 0, 0, '?', { size: 76, color: '#d0c2ff', center: true, middle: true }));
    eq.add(KG.txt(this, 45, 2, '=', { size: 70, color: TKC.ink, center: true, middle: true }));
    this.slotW = this.add.container(190, 0); eq.add(this.slotW); this.slotW.add(addCard(this, 0, 0, 230, 150, { r: 26, lw: 4, shadow: 0, dash: true, fill: ['#fffdf2', '#fff6cf'] }));
    if (voice) { this.slotW.add(KG.txt(this, 0, 0, '?', { size: 76, color: '#d0c2ff', center: true, middle: true })); this.listenBtn = new KG.ui.Button(this, 400, 0, 120, 92, { label: '', icon: 'sound', style: 'primary', size: 26, onClick: () => this.replay() }); eq.add(this.listenBtn); this.listenBtn.pulse(); }
    else this.slotW.add(glyph(this, 0, 0, R.word, 84, '#b9b0e8'));
    this.objs.push(this.txt(640, 306, voice ? 'ข้อ ' + (this.ri + 1) + ' · ฟังพยางค์แล้วเลือกสระ' : 'ข้อ ' + (this.ri + 1) + ' · พยางค์นี้ใช้สระอะไร', { size: 24, color: '#ffffff', stroke: TKC.ink, sw: 5, center: true, ox: 0.5 }));
    const cw = n <= 3 ? 250 : 210, ch = 150, gx = 28;
    R.opts.forEach((v, i) => {
      const inf = AK.info(v), x = 640 + (i - (n - 1) / 2) * (cw + gx), y = 470, c = this.add.container(x, y).setDepth(6); c.v = v; c.home = { x, y }; this.objs.push(c); this.opts.push(c);
      c.add(addCard(this, 0, 0, cw, ch, { r: 28, fill: ['#ffffff', '#f6f0ff'], shadow: 8, lw: 4 })); c.bg = c.list[0]; c.add(glyph(this, 0, -8, inf.text, inf.text.length > 3 ? 62 : 86, ROLE_COL.v)); c.add(fitText(KG.txt(this, 0, ch / 2 - 22, inf.label, { size: 20, weight: 400, color: '#6a64a0', center: true, middle: true }), cw - 20));
      c.setSize(cw, ch).setInteractive({ useHandCursor: true }); c.on('pointerup', () => this.choose(c)); c.setScale(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 260, delay: 60 * i, ease: 'Back.easeOut' });
    });
    this.say(voice ? 'ฟังเสียงพยางค์ แล้วเลือกสระที่ประสมกับ ' + cinf.label + ' ให้ได้คำนั้น' : 'พยางค์ ' + R.word + ' ใช้สระอะไร เลือกสระที่อยู่ในพยางค์นั้น', 'smile'); this.setPips(this.ri);
    this.time.delayedCall(500, () => { if (this.R === R) this.replay(); });
  }
  replay() { this.speak(this.R.word); }
  choose(c) {
    if (this.locked || this.done || this.paused || this._modal) return; const R = this.R, vinf = AK.info(c.v), made = AK.compose(R.c, c.v);
    if (c.v === R.v) {
      this.locked = true; this.good(c.x, c.y); c.bg.setTint(0xc8ffd2); this.tweens.add({ targets: c, scaleX: 1.1, scaleY: 1.1, duration: 140, yoyo: true });
      this.slotV.removeAll(true); this.slotV.add(addCard(this, 0, 0, 170, 150, { r: 26, lw: 4, shadow: 4, fill: ['#e6ffe9', '#c8ffd2'] })); this.slotV.add(glyph(this, 0, 0, vinf.text, vinf.text.length > 3 ? 56 : 80, ROLE_COL.v));
      this.slotW.removeAll(true); this.slotW.add(addCard(this, 0, 0, 230, 150, { r: 26, lw: 4, shadow: 4, fill: ['#e6ffe9', '#c8ffd2'] })); this.slotW.add(richText(this, 0, 0, R.word, 90, { roles: composeRoles(R.c, vinf.text).roles, maxW: 210 })); this.tweens.add({ targets: this.slotW, scaleX: 1.12, scaleY: 1.12, duration: 160, yoyo: true });
      this.speak(R.word); this.say('ถูกต้อง! ' + AK.info(R.c).text + ' + ' + vinf.text + ' = ' + R.word, 'happy'); this.setPips(this.ri + 1);
      this.time.delayedCall(1500, () => { this.ri++; if (this.ri >= this.rounds.length) this.finish([['ประสมคำถูก', this.rounds.length + ' คำ']]); else this.startRound(); });
    } else {
      this.mistakes++; this.bad(c); c.bg.setTint(0xffb8b8); this.wrong[c.v] = 1; this.tweens.add({ targets: c, alpha: 0.45, duration: 200 });
      this.speak(made || vinf.say); this.say(made ? 'ใส่สระนี้จะได้ “' + made + '” ยังไม่ใช่เสียงที่ได้ยิน ฟังอีกครั้งแล้วลองใหม่นะ' : 'สระนี้ประสมไม่ได้ ลองใหม่นะ', 'sad');
      this.time.delayedCall(1700, () => { if (!this.locked) this.replay(); });
    }
  }
  hint() {
    if (this.done || this.locked) return; const c = this.opts.find(k => k.v !== this.R.v && !this.wrong[k.v]); if (!c) return; this.hints++; this.wrong[c.v] = 1; KG.audio.play('pop'); this.tweens.add({ targets: c, alpha: 0.25, duration: 220 }); c.disableInteractive(); this.replay();
    this.say('คำใบ้: ตัดสระที่ไม่ใช่ออกให้หนึ่งใบ ฟังอีกครั้งนะ', 'open');
  }
}
