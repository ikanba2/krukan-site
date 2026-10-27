/* ===== Techno Aksorn: ฟังแล้วแตะ (ได้ยินชื่อตัวอักษร แล้วแตะตัวที่ได้ยิน) 6 ข้อ ===== */
class ListenScene extends ActBase {
  constructor() { super('Listen'); this.ACT = 'listen'; }
  init(d) { super.init(d); this.rounds = AK.makeListen(this.lesson, this.lv, (Date.now() & 0xfffffff) + 21); this.ri = 0; this.locked = false; this.objs = []; this.wrongKeys = {}; }
  create() {
    this.begin();
    this.HOW = '1. กดปุ่มลำโพงเพื่อฟังชื่อตัวอักษร (ถ้าเครื่องไม่มีเสียงอ่าน จะมีชื่อเขียนบอกที่หน้าจอ)\n2. แตะการ์ดที่เป็นตัวอักษรตามที่ได้ยิน\n3. ถ้าแตะผิด จะมีเสียงบอกว่าการ์ดนั้นคือตัวอะไร แล้วลองใหม่ได้\n4. ตอบครบ 6 ข้อจึงผ่าน';
    this.makePips(this.rounds.length, 520); this.startRound();
  }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.locked = false; this.wrongKeys = {};
    const R = this.rounds[this.ri], tinf = AK.info(R.target), voice = SPEECH.exists, n = R.opts.length; this.target = R.target; this.cards = [];
    const top = addCard(this, 640, 176, 780, 150, { r: 32, fill: ['#ffffff', '#f6f0ff'], shadow: 8 }); this.objs.push(top);
    if (voice) {
      const b = new KG.ui.Button(this, 640, 176, 340, 92, { label: 'ฟังเสียง', icon: 'sound', style: 'primary', size: 34, onClick: () => this.replay() }); this.objs.push(b); b.pulse();
      this.objs.push(this.txt(640, 124, 'ข้อ ' + (this.ri + 1) + ' จาก ' + this.rounds.length + ' · แตะตัวที่ได้ยิน', { size: 22, weight: 400, color: '#6a64a0', center: true, ox: 0.5 }));
    } else {
      this.objs.push(this.txt(640, 122, 'ข้อ ' + (this.ri + 1) + ' · หาตัวอักษรที่ชื่อว่า', { size: 22, weight: 400, color: '#6a64a0', center: true, ox: 0.5 }));
      this.objs.push(fitText(KG.txt(this, 640, 186, tinf.label, { size: 56, color: TKC.ink, center: true, middle: true }), 700));
    }
    const cols = n <= 4 ? n : 3, rows = Math.ceil(n / cols), cw = rows === 1 ? 232 : 270, ch = rows === 1 ? 250 : 150, gx = 28, gy = 22, y0 = rows === 1 ? 470 : 360;
    R.opts.forEach((k, i) => {
      const r = Math.floor(i / cols), c = i % cols, cnt = r === rows - 1 ? n - cols * (rows - 1) : cols, x = 640 + (c - (cnt - 1) / 2) * (cw + gx), y = y0 + (r - (rows - 1) / 2) * (ch + gy) + (rows === 1 ? 0 : 70);
      const inf = AK.info(k), card = this.add.container(x, y).setDepth(5); card.key = k; card.home = { x, y };
      card.add(addCard(this, 0, 0, cw, ch, { r: 28, fill: ['#ffffff', '#f6f0ff'], shadow: 8, lw: 4 })); card.bg = card.list[0];
      card.add(glyph(this, 0, 0, inf.text, rows === 1 ? (inf.text.length > 3 ? 78 : 118) : (inf.text.length > 3 ? 54 : 82), TKC.ink));
      card.setSize(cw, ch).setInteractive({ useHandCursor: true }); card.on('pointerup', () => this.choose(card));
      card.setScale(0); this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 260, delay: 60 * i, ease: 'Back.easeOut' }); this.cards.push(card); this.objs.push(card);
    });
    this.say(voice ? 'ฟังให้ดีนะ แล้วแตะตัวที่ได้ยิน' : 'อ่านชื่อ “' + tinf.label + '” แล้วแตะตัวอักษรที่ใช่', 'smile'); this.setPips(this.ri);
    this.time.delayedCall(450, () => { if (this.target === R.target) this.replay(); });
  }
  replay() { this.speak(AK.info(this.target).say); }
  choose(card) {
    if (this.locked || this.done || this.paused || this._modal) return; const inf = AK.info(card.key);
    if (card.key === this.target) {
      this.locked = true; this.good(card.x, card.y); card.bg.setTint(0xc8ffd2); this.tweens.add({ targets: card, scaleX: 1.1, scaleY: 1.1, duration: 140, yoyo: true });
      this.speak(inf.say); this.say('ถูกต้อง! นี่คือ ' + inf.label, 'happy'); this.setPips(this.ri + 1);
      this.time.delayedCall(1100, () => { this.ri++; if (this.ri >= this.rounds.length) this.finish([['ตอบถูก', this.rounds.length + ' ข้อ']]); else this.startRound(); });
    } else {
      this.mistakes++; this.bad(card); card.bg.setTint(0xffb8b8); this.wrongKeys[card.key] = 1; this.tweens.add({ targets: card, alpha: 0.45, duration: 200 });
      this.speak(inf.say); this.say('ใบนี้คือ ' + inf.label + ' ยังไม่ใช่ ฟังอีกครั้งแล้วลองใหม่นะ', 'sad');
      this.time.delayedCall(1500, () => { if (!this.locked) this.replay(); });
    }
  }
  hint() {
    if (this.done || this.locked) return; const c = this.cards.find(k => k.key !== this.target && !this.wrongKeys[k.key]); if (!c) return; this.hints++; this.wrongKeys[c.key] = 1; KG.audio.play('pop'); this.tweens.add({ targets: c, alpha: 0.25, duration: 220 }); c.disableInteractive(); this.replay();
    this.say('คำใบ้: ตัดตัวเลือกที่ไม่ใช่ออกให้หนึ่งใบ ฟังอีกครั้งนะ', 'open');
  }
}
