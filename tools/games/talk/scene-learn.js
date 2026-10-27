/* ===== Techno Talk: เรียนคำศัพท์และประโยคของหน่วย (บัตรคำใหญ่ ภาพ + เสียง + คำแปล) ===== */
class LearnScene extends ActBase {
  constructor() { super('Learn'); this.ACT = 'learn'; }
  init(d) {
    super.init(d); const dk = TK.learnDeck(this.unit);
    this.cards = dk.words.map(w => ({ k: 'word', w })).concat(dk.sents.map(s => ({ k: 'sent', s })));
    this.nWords = dk.words.length; this.i = 0; this.cc = null;
  }
  create() {
    this.begin(); this.hintBtn.setVisible(false);
    this.HOW = '1. ดูภาพ อ่านคำหรือประโยค แล้วกดปุ่มลำโพงเพื่อฟังเสียงอ่านภาษาอังกฤษ\n2. พูดตามออกเสียงดัง ๆ ได้เลย\n3. กด ‘ถัดไป’ ไปทีละใบ ช่วงหลังเป็นประโยค สังเกตคำสีที่เป็นสรรพนามประธาน\n4. เรียนครบแล้วไปเล่นกิจกรรมต่อ';
    this.makePips(this.cards.length, 450, { r: 8, gap: 26 });
    this.prev = new KG.ui.Button(this, 330, 590, 250, 66, { label: 'ก่อนหน้า', icon: 'chevL', style: 'ghost', size: 26, onClick: () => { if (this.i > 0) this.show(this.i - 1, -1); } });
    this.next = new KG.ui.Button(this, 950, 590, 300, 74, { label: 'ถัดไป', icon: 'chevR', style: 'primary', size: 30, onClick: () => this.advance() });
    this.show(0, 1);
  }
  advance() { if (this.i < this.cards.length - 1) this.show(this.i + 1, 1); else this.finishLearn(); }
  show(i, dir) {
    this.i = i; const cd = this.cards[i], isW = cd.k === 'word', col = this.LV.color, old = this.cc;
    if (old) { this.tweens.add({ targets: old, x: -dir * 120, alpha: 0, duration: 160, onComplete: () => old.destroy(true) }); }
    const cc = this.cc = this.add.container(0, 0).setDepth(5); cc.add(addCard(this, 640, 330, 1130, 400, { r: 34, shadow: 10, fill: ['#ffffff', '#f7f1ff'] }));
    // ป้ายหมวด
    const chip = (x, label, on) => { cc.add(this.add.image(x, 156, cardTex(this, 170, 40, { r: 20, lw: 3, shadow: 0, fill: on ? [col, col] : ['#ffffff', '#eee7ff'], edge: TKC.ink }).key).setDisplaySize(194, 64)); cc.add(KG.txt(this, x, 156, label, { size: 21, color: on ? '#ffffff' : TKC.ink, center: true, middle: true })); };
    chip(176, 'คำศัพท์ ' + (isW ? (i + 1) + '/' + this.nWords : '✓'), isW); chip(380, 'ประโยค ' + (isW ? '' : (i - this.nWords + 1) + '/' + (this.cards.length - this.nWords)), !isW);
    // ภาพ
    cc.add(this.add.image(330, 340, cardTex(this, 440, 300, { r: 28, lw: 3, shadow: 0, fill: ['#fff8e1', '#ffeab8'] }).key).setDisplaySize(464, 324));
    cc.add(pic(this, isW ? cd.w.pic : cd.s.pic, 330, 340, 410, 280));
    // ข้อความ
    if (isW) {
      const w = cd.w, big = KG.txt(this, 880, 270, w.en, { size: 100, color: PCOL[w.en] || TKC.ink, center: true, middle: true, stroke: false }); fitText(big, 480); cc.add(big);
      cc.add(KG.txt(this, 880, 372, w.th, { size: 46, color: '#6a64a0', center: true, middle: true, width: 480 }));
      this.curEn = w.en;
    } else {
      const s = cd.s, pr = PCOL[s.p] || TKC.ink;
      cc.add(this.add.image(880, 214, cardTex(this, 220, 40, { r: 20, lw: 3, shadow: 0, fill: [pr, pr] }).key).setDisplaySize(244, 64)); cc.add(KG.txt(this, 880, 214, s.p + ' = ' + PN_TH[s.p], { size: 22, color: '#ffffff', center: true, middle: true }));
      const rs = richSentence(this, 880, 290, s.en, s.p, s.en.length > 18 ? 46 : 54, 520); cc.add(rs);
      cc.add(KG.txt(this, 880, 290 + (rs.lines - 1) * rs.lh / 2 + 64, s.th, { size: 34, color: '#6a64a0', center: true, middle: true, width: 520 }));
      this.curEn = s.en;
    }
    // ปุ่มฟัง
    this.listen = new KG.ui.Button(this, 880, 470, 260, 62, { label: SPEECH.exists ? 'ฟังเสียง' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 26, onClick: () => { this.speak(this.curEn); this.tweens.add({ targets: this.listen, scaleX: 1.06, scaleY: 1.06, duration: 120, yoyo: true }); } });
    this.listen.setEnabled(SPEECH.exists); cc.add(this.listen);
    cc.setAlpha(0).x = dir * 120; this.tweens.add({ targets: cc, x: 0, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.setPips(i + 1); this.prev.setEnabled(i > 0); this.next.setLabel(i === this.cards.length - 1 ? 'เรียนครบแล้ว' : 'ถัดไป'); KG.audio.play('tap');
    this.say(isW ? 'ฟังแล้วพูดตามนะ: ' + cd.w.en + ' แปลว่า ' + cd.w.th : 'อ่านประโยคนี้ดูนะ สังเกตคำสี ' + cd.s.p + ' ที่เป็นประธาน', isW ? 'book' : 'smile');
    this.time.delayedCall(320, () => { if (this.cc === cc && SPEECH.can) this.speak(this.curEn); });
  }
  finishLearn() {
    SAVE.data.learn[this.unit.id] = true; SAVE.data.unit = this.unit.id; SAVE.data.level = this.unit.level; SAVE.save(); KG.audio.play('win'); KG.fx.confetti(this, { ms: 1200 });
    this.say('เรียนครบแล้ว! ต่อด้วยหลักภาษากันนะ', 'happy');
    const nxt = nextActOf('learn');
    KG.ui.modal(this, { title: 'เรียนครบแล้ว!', w: 760, accent: 0x8a5cf0, body: 'เก่งมาก! ทบทวนคำศัพท์ ' + this.nWords + ' คำ และประโยคของหน่วย “' + this.unit.en + '” แล้ว\nต่อไปเรียน ‘' + nxt.th + '’ ดูว่าคำไหนใช้คู่กับคำไหน',
      buttons: [{ label: 'เรียนอีกรอบ', style: 'ghost', icon: 'reset', onClick: () => this.show(0, -1) }, { label: 'กลับหน่วย', style: 'cyan', icon: 'flag', onClick: () => this.leave() }, { label: nxt.th, style: 'primary', icon: 'play', pulse: true, onClick: () => this.go(nxt.scene, { unit: this.unit.id }) }] });
  }
}
