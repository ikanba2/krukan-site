/* ===== Techno Aksorn: จับคู่ภาพ (ลากตัวอักษรจากถาดไปวางที่ภาพที่เป็นคู่กัน หรือแตะตัวอักษรแล้วแตะภาพ) 2 รอบ รอบละ 3-4 คู่ ===== */
class MatchScene extends ActBase {
  constructor() { super('Match'); this.ACT = 'match'; }
  init(d) { super.init(d); this.rounds = AK.makeMatch(this.lesson, this.lv, (Date.now() & 0xfffffff) + 41); this.ri = 0; this.objs = []; this.sel = null; this.done_ = 0; this.total = this.rounds.reduce((n, r) => n + r.pairs.length, 0); this.placedAll = 0; }
  create() {
    this.begin();
    this.HOW = '1. ดูภาพด้านบน แล้วหาตัวอักษรหรือคำที่ใช้กับภาพนั้นในถาดด้านล่าง\n2. ลากตัวอักษรไปวางที่ภาพ หรือแตะตัวอักษรก่อนแล้วแตะที่ภาพก็ได้\n3. ถ้าวางผิด ตัวอักษรจะเด้งกลับและบอกว่าภาพนี้คือคำอะไร\n4. จับคู่ครบทั้ง 2 รอบจึงผ่าน';
    this.makePips(this.total, 470); this.pipObjs.forEach((c, i) => { c.setRadius(8); c.x = 470 + i * 24; });
    this.startRound();
  }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.sel = null; this.done_ = 0; this.locking = false;
    const R = this.rounds[this.ri], n = R.pairs.length, cw = 252, ch = 250, gx = 22; this.slots = []; this.chips = [];
    this.objs.push(this.txt(GW / 2, 94, 'รอบ ' + (this.ri + 1) + ' จาก ' + this.rounds.length + ' · ลากตัวอักษรไปวางที่ภาพ', { size: 26, center: true, ox: 0.5, stroke: true, sw: 5 }));
    R.pairs.forEach((k, i) => {
      const inf = AK.info(k), x = GW / 2 + (i - (n - 1) / 2) * (cw + gx), y = 262, c = this.add.container(x, y).setDepth(5);
      c.add(addCard(this, 0, 0, cw, ch, { r: 28, fill: ['#fffaf0', '#fff0cf'], shadow: 8, lw: 4 })); c.add(pic(this, inf.pic, 0, R.blind ? -4 : -34, 170, R.blind ? 190 : 150)); if (!R.blind) c.add(richText(this, 0, 80, inf.sub, 38, { maxW: cw - 24 }));
      const hole = this.add.rectangle(-cw / 2 + 36, -ch / 2 + 36, 56, 56, 0xffffff, 0.9).setStrokeStyle(4, 0x2d2a5e); c.add(hole); c.add(KG.txt(this, -cw / 2 + 36, -ch / 2 + 36, '?', { size: 34, color: '#b9b0e8', center: true, middle: true }));
      const slot = { key: k, c, hole, x, y, w: cw, h: ch, done: false }; this.slots.push(slot); this.objs.push(c);
      c.setSize(cw, ch).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { if (this.sel && !c._moved) this.tryPlace(this.sel, slot); });
    });
    const order = R.order, m = order.length, tw = R.blind ? 190 : 150, th = 128, ty = 540;
    this.objs.push(addCard(this, GW / 2, ty, 1180, 156, { r: 30, fill: ['#ffffffd8', '#efe6ffd8'], shadow: 6, lw: 3, dash: true }).setDepth(1));
    order.forEach((k, i) => {
      const inf = AK.info(k), x = GW / 2 + (i - (m - 1) / 2) * (tw + 24), c = this.add.container(x, ty).setDepth(10); c.home = { x, y: ty }; c.key = k; this.chips.push(c); this.objs.push(c);
      c.add(addCard(this, 0, 0, tw, th, { r: 24, fill: ['#ffffff', '#fff6dc'], shadow: 6, lw: 4 })); if (inf.kind === 'w') c.add(richText(this, 0, 0, inf.text, 64, { maxW: tw - 20 })); else c.add(glyph(this, 0, 0, inf.text, 84, TKC.ink));
      dragify(this, c, tw, th, {
        start: () => { if (this.busy()) return; this.select(null); c.setDepth(60); c.setScale(1.12); KG.audio.play('pop'); this.speak(inf.say); },
        drop: (x2, y2) => { if (this.busy()) { this.homeBack(c); return; } c.setScale(1); const s = this.slots.find(q => !q.done && inBox(x2, y2, { x: q.x - q.w / 2, y: q.y - q.h / 2, w: q.w, h: q.h })); if (s) this.tryPlace(c, s); else this.homeBack(c); },
        tap: () => { if (this.busy()) return; this.select(this.sel === c ? null : c); KG.audio.play('tap'); this.speak(inf.say); }
      });
    });
    this.say('ลากตัวอักษรไปวางที่ภาพที่ใช่ แตะตัวอักษรเพื่อฟังชื่อได้', 'smile');
  }
  busy() { return this._modal || this.done || this.paused || this.locking; }
  select(c) {
    if (this.sel) { this.tweens.add({ targets: this.sel, y: this.sel.home.y, scaleX: 1, scaleY: 1, duration: 120 }); this.sel.list[0].setTint(0xffffff); }
    this.sel = c; if (c) { this.tweens.add({ targets: c, y: c.home.y - 12, scaleX: 1.08, scaleY: 1.08, duration: 120 }); c.list[0].setTint(0xffe58a); }
  }
  tryPlace(c, slot) {
    const inf = AK.info(c.key), sinf = AK.info(slot.key);
    if (c.key === slot.key) {
      slot.done = true; this.done_++; this.placedAll++; this.setPips(this.placedAll); if (this.sel === c) this.sel = null; c.list[0].setTint(0xc8ffd2); c.disableInteractive();
      this.tweens.add({ targets: c, x: slot.x - slot.w / 2 + 36, y: slot.y - slot.h / 2 + 36, scaleX: 0.5, scaleY: 0.5, duration: 260, ease: 'Back.easeOut' }); c.setDepth(30);
      slot.hole.setFillStyle(0xc8ffd2); slot.c.list[0].setTint(0xdfffe5); this.good(slot.x, slot.y); this.speak(inf.say);
      this.say(this.rounds[this.ri].blind ? 'ถูกต้อง! ' + inf.label + ' คู่กับภาพนี้' : 'ถูกต้อง! ' + inf.label + ' คู่กับภาพ' + inf.sub, 'happy');
      if (this.done_ === this.rounds[this.ri].pairs.length) { this.locking = true; this.time.delayedCall(1000, () => { this.ri++; if (this.ri >= this.rounds.length) this.finish([['จับคู่ถูก', this.total + ' คู่']]); else { KG.banner(this, 'รอบที่ 2', '#ffffff', 1, 330); this.time.delayedCall(700, () => this.startRound()); } }); }
    } else {
      this.mistakes++; this.bad(null); this.select(null); this.homeBack(c, true); this.tweens.add({ targets: slot.c, x: slot.x + 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { slot.c.x = slot.x; } });
      this.say(this.rounds[this.ri].blind ? 'ใบนี้คือ “' + inf.label + '” ยังไม่ตรงกับภาพนี้ ลองฟังหรืออ่านใหม่นะ' : 'ภาพนี้คือ “' + sinf.sub + '” ใช้คู่กับ ' + sinf.say + ' ส่วนใบนี้คือ ' + inf.say + ' ลองใหม่นะ', 'sad');
    }
  }
  hint() {
    if (this.busy()) return; const s = this.slots.find(q => !q.done); if (!s) return; const c = this.chips.find(q => q.key === s.key); this.hints++; KG.audio.play('pop');
    const g = this.add.graphics().setDepth(70); g.lineStyle(7, 0xffc82e, 1); g.strokeRoundedRect(s.x - s.w / 2 - 4, s.y - s.h / 2 - 4, s.w + 8, s.h + 8, 30); g.strokeRoundedRect(c.home.x - 79, c.home.y - 68, 158, 136, 26);
    this.tweens.add({ targets: g, alpha: 0.3, duration: 300, yoyo: true, repeat: 4, onComplete: () => g.destroy() }); this.speak(AK.info(s.key).say); this.say(this.rounds[this.ri].blind ? 'คำใบ้: ดูกรอบสีเหลือง ใบที่มีกรอบเหลืองคือคำของภาพนี้' : 'คำใบ้: ดูกรอบสีเหลือง ภาพนี้คือ “' + AK.info(s.key).sub + '” ใช้คู่กับตัวที่มีกรอบเหลือง', 'open');
  }
}
