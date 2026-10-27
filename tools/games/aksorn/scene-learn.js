/* ===== Techno Aksorn: เรียนรู้ (บัตรตัวอักษรใบใหญ่ ภาพ ชื่อ เสียงอ่าน หมู่อักษร/เสียงสั้นยาว) ===== */
class LearnScene extends ActBase {
  constructor() { super('Learn'); this.ACT = 'learn'; }
  init(d) { super.init(d); this.deck = AK.itemsOf(this.lesson, this.lv); this.i = 0; this.cc = null; }
  create() {
    this.begin(); this.hintBtn.setVisible(false);
    this.HOW = '1. ดูตัวอักษรใบใหญ่ ภาพ และคำที่ใช้จำ แล้วกดปุ่มลำโพงเพื่อฟังเสียงอ่าน\n2. พูดตามออกเสียงดัง ๆ ได้เลย\n3. กด ‘ถัดไป’ ไปทีละใบจนครบ\n4. เรียนครบแล้วไปเล่นเขียนตามรอยและเกมต่อ';
    this.makePips(this.deck.length, 520); this.pipObjs.forEach((c, i) => { c.setRadius(8); c.x = 520 + i * 26; });
    this.prev = new KG.ui.Button(this, 300, 596, 230, 62, { label: 'ก่อนหน้า', icon: 'chevL', style: 'ghost', size: 24, onClick: () => { if (this.i > 0) this.show(this.i - 1, -1); } });
    this.next = new KG.ui.Button(this, 930, 592, 300, 70, { label: 'ถัดไป', icon: 'chevR', style: 'primary', size: 28, onClick: () => this.advance() });
    this.show(0, 1);
  }
  advance() { if (this.i < this.deck.length - 1) this.show(this.i + 1, 1); else this.finishLearn(); }
  show(i, dir) {
    this.i = i; const inf = AK.info(this.deck[i]), old = this.cc, isC = inf.kind === 'c', col = isC ? '#ff7ab2' : '#3d8bff';
    if (inf.kind === 'h') { this.showChange(i, dir, inf, old); return; }
    const R2SHOW = { g: 'showMark', n: 'showTone', f: 'showFamily', k: 'showRule', m: 'showMatra', w: 'showWord', s: 'showSent' }[inf.kind]; if (R2SHOW) { this[R2SHOW](i, dir, inf, old); return; }
    if (old) this.tweens.add({ targets: old, x: -dir * 120, alpha: 0, duration: 160, onComplete: () => old.destroy(true) });
    const cc = this.cc = this.add.container(0, 0).setDepth(5);
    // ซ้าย: ตัวอักษรใบใหญ่
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: col }, fill: ['#ffffff', '#f7f1ff'], shadow: 10 }));
    cc.add(glyph(this, 290, 312, inf.text, inf.text.includes('–') ? (inf.text.length > 3 ? 150 : 170) : (inf.text.length > 2 ? 190 : 250), isC ? ROLE_COL.c : ROLE_COL.v));
    cc.add(fitText(KG.txt(this, 290, 482, inf.label, { size: 38, color: TKC.ink, center: true, middle: true }), 450));
    if (this.lv >= 1) {
      const lab = isC ? CLASS_TH[inf.cls] : (inf.len === 's' ? 'เสียงสั้น' : inf.len === 'l' ? 'เสียงยาว' : 'สระพิเศษ'), cc2 = isC ? { m: '#3d8bff', h: '#ff5a8a', l: '#3fb54a' }[inf.cls] : (inf.len === 's' ? '#ff8a1e' : inf.len === 'l' ? '#3d8bff' : '#9a5ae8');
      cc.add(addCard(this, 290, 130, 200, 40, { r: 20, lw: 3, shadow: 0, fill: [cc2, cc2] })); cc.add(KG.txt(this, 290, 130, lab, { size: 22, color: '#ffffff', center: true, middle: true }));
    }
    // ขวา: ภาพ/คำ หรือพยางค์ตัวอย่าง
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    if (inf.pic) {
      cc.add(pic(this, inf.pic, 740, 320, 300, 300));
      cc.add(richText(this, 1032, 286, inf.sub, 78, { maxW: 290 }));
      cc.add(KG.txt(this, 1032, 372, isC ? 'ใช้ ' + inf.text + ' ' + inf.sub : 'เช่น ' + inf.sub, { size: 26, weight: 400, color: '#6a64a0', center: true, middle: true }));
    } else {
      cc.add(KG.txt(this, 906, 176, 'ตัวอย่างพยางค์ แตะเพื่อฟัง', { size: 26, color: '#6a64a0', center: true, middle: true }));
      const ex = (inf.ex || []).slice(0, 3), n = ex.length;
      ex.forEach((s, k) => {
        const x = 906 + (k - (n - 1) / 2) * 210, c = this.add.container(x, 330); c.add(addCard(this, 0, 0, 190, 170, { r: 26, lw: 3.5, shadow: 6, fill: ['#ffffff', '#f6f0ff'] })); c.add(richText(this, 0, 0, s, s.length > 3 ? 56 : 80, { maxW: 176 }));
        c.setSize(190, 170).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { this.speak(s); KG.audio.play('pop'); this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true }); }); cc.add(c);
      });
      if (inf.sub && inf.sub !== inf.text) { cc.add(KG.txt(this, 800, 466, 'คำตัวอย่าง', { size: 26, color: '#6a64a0', center: true, middle: true })); cc.add(richText(this, 960, 462, inf.sub, 50, { maxW: 200 })); }
    }
    // คำอธิบายสี (เฉพาะสีที่มีในคำหรือพยางค์บนบัตรนี้)
    { const wd = inf.pic ? inf.sub : (inf.ex || [])[0] || inf.sub || '', roles = [...new Set(Array.from(rolesOf(wd)))].filter(r => ROLE_TH[r]); if (roles.length) cc.add(colorLegend(this, 906, 548, { which: ['c', 'v', 'f', 't'].filter(r => roles.includes(r)), size: 17 })); }
    this.listen = new KG.ui.Button(this, 906, 505, 280, 58, { label: SPEECH.exists ? 'ฟังเสียง' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 25, onClick: () => { this.speak(inf.say); this.tweens.add({ targets: this.listen, scaleX: 1.06, scaleY: 1.06, duration: 120, yoyo: true }); } });
    this.listen.setEnabled(SPEECH.exists); cc.add(this.listen);
    cc.setAlpha(0).x = dir * 120; this.tweens.add({ targets: cc, x: 0, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.setPips(i + 1); this.prev.setEnabled(i > 0); this.next.setLabel(i === this.deck.length - 1 ? 'เรียนครบแล้ว' : 'ถัดไป'); KG.audio.play('tap');
    this.say('นี่คือ ' + inf.label + ' ฟังแล้วพูดตามนะ', 'book');
    this.time.delayedCall(320, () => { if (this.cc === cc && SPEECH.can) this.speak(inf.say); });
  }
  // บัตรสระเปลี่ยนรูป: รูปเดิม › รูปใหม่ + คำอธิบาย + คำตัวอย่าง 3 คำ (แตะฟังได้ ระบายสี พยัญชนะ สระ ตัวสะกด)
  showChange(i, dir, inf, old) {
    if (old) this.tweens.add({ targets: old, x: -dir * 120, alpha: 0, duration: 160, onComplete: () => old.destroy(true) });
    const cc = this.cc = this.add.container(0, 0).setDepth(5), h = inf.chg, none = h.to === '–';
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: '#e8452c' }, fill: ['#ffffff', '#fff3ee'], shadow: 10 }));
    cc.add(KG.txt(this, 290, 150, 'สระนี้เปลี่ยนรูป', { size: 24, color: '#e8452c', center: true, middle: true }));
    cc.add(glyph(this, 290, 232, inf.from, 96, ROLE_COL.v)); cc.add(KG.ui.icon(this, 'chevD', 290, 322, 44, 0xe8452c));
    if (none) cc.add(KG.txt(this, 290, 414, 'ไม่มีรูป', { size: 62, color: ROLE_COL.v, center: true, middle: true })); else cc.add(glyph(this, 290, 412, inf.text, inf.text.length > 2 ? 84 : 104, ROLE_COL.v));
    cc.add(fitText(KG.txt(this, 290, 512, dashify(h.name), { size: 32, color: TKC.ink, center: true, middle: true }), 450));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    cc.add(KG.txt(this, 906, 172, inf.label, { size: 28, color: TKC.ink, center: true, middle: true, width: 640 }));
    cc.add(KG.txt(this, 906, 240, 'ตัวอย่าง แตะเพื่อฟัง', { size: 22, color: '#6a64a0', center: true, middle: true }));
    h.cf.forEach((p, k) => {
      const w = changeWord(h, p[0], p[1]), x = 906 + (k - 1) * 210, c = this.add.container(x, 360);
      c.add(addCard(this, 0, 0, 190, 190, { r: 26, lw: 3.5, shadow: 6, fill: ['#ffffff', '#f6f0ff'] })); c.add(richText(this, 0, -22, w, 66, { maxW: 170 }));
      c.add(fitText(KG.txt(this, 0, 62, changeBase(h, p[0]) + ' + ' + p[1], { size: 24, weight: 400, color: '#6a64a0', center: true, middle: true }), 170));
      c.setSize(190, 190).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { this.speak(w); KG.audio.play('pop'); this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true }); }); cc.add(c);
    });
    cc.add(colorLegend(this, 906, 482, { which: none ? ['c', 'f'] : ['c', 'v', 'f'], size: 17 }));
    this.listen = new KG.ui.Button(this, 906, 526, 220, 44, { label: SPEECH.exists ? 'ฟังกฎ' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 20, onClick: () => this.speak(inf.say) }); this.listen.setEnabled(SPEECH.exists); cc.add(this.listen);
    cc.setAlpha(0).x = dir * 120; this.tweens.add({ targets: cc, x: 0, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.setPips(i + 1); this.prev.setEnabled(i > 0); this.next.setLabel(i === this.deck.length - 1 ? 'เรียนครบแล้ว' : 'ถัดไป'); KG.audio.play('tap');
    this.say('เมื่อมีตัวสะกด ' + inf.from.replace('–', 'พยัญชนะ') + ' จะเปลี่ยนไป ดูตัวอย่างแล้วฟังนะ', 'book');
    this.time.delayedCall(320, () => { if (this.cc === cc && SPEECH.can) this.speak(inf.say); });
  }
  finishLearn() {
    const k = this.lessonId, first = !SAVE.data.learned[k]; SAVE.data.learned[k] = 1; if (first) SAVE.data.coins = (SAVE.data.coins || 0) + 5; SAVE.save(); KG.audio.play('win'); KG.fx.confetti(this, { ms: 1200 });
    const acts = AK.activities(this.lesson, this.lv), nxt = acts[1], nm = AK.ACT_META[nxt], tr = nxt === 'trace';
    this.say(tr ? 'เรียนครบแล้ว! ไปเขียนต่อได้เลย' : 'เรียนครบแล้ว! ไปเล่นเกมต่อได้เลย', 'happy');
    KG.ui.modal(this, {
      title: 'เรียนครบแล้ว!', w: 760, accent: 0xff7a3c, body: 'เก่งมาก! ทบทวน ' + this.deck.length + ' ตัวในบทนี้แล้ว' + (first ? ' ได้เหรียญ +5' : '') + (tr ? '\nต่อไปลองเขียนและเล่นเกมให้คล่องกัน' : '\nต่อไปลองเล่นเกมให้คล่องกัน'),
      buttons: [{ label: 'เรียนอีกรอบ', style: 'ghost', icon: 'reset', onClick: () => this.show(0, -1) }, { label: 'กลับบทเรียน', style: 'cyan', icon: 'flag', onClick: () => this.leave() }, { label: nm.th, style: 'primary', icon: 'play', pulse: true, onClick: () => this.go(ACT_SCENE[nxt], { lesson: this.lessonId, act: nxt }) }]
    });
  }
}
