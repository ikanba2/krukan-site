/* ===== Techno Aksorn: เปิดป้าย (จับคู่ความจำ 6 คู่ พยัญชนะ: ตัวอักษร ‹› ภาพ · สระ: รูปสระ ‹› พยางค์ตัวอย่าง) ===== */
const MEM_COL = ['#ff5aa6', '#3d8bff', '#17c4a8', '#ffa21e', '#9a5ae8', '#3fb54a'];
function signBackTex(scene, w, h, col) {
  return KG.tex(scene, 'ak-sign|' + w + 'x' + h + '|' + col, w + 24, h + 24, c => {
    c.translate(12, 12); c.lineJoin = 'round';
    KG.ui.rrect(c, 0, 8, w, h, 22); c.fillStyle = 'rgba(45,42,94,.3)'; c.fill();
    KG.ui.rrect(c, 0, 0, w, h, 22); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, col); g.addColorStop(1, shade(col, 0.78)); c.fillStyle = g; c.fill();
    c.save(); KG.ui.rrect(c, 0, 0, w, h, 22); c.clip(); c.globalAlpha = 0.16; c.fillStyle = '#ffffff'; for (let i = -h; i < w + h; i += 34) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 17, 0); c.lineTo(i + 17 - h, h); c.lineTo(i - h, h); c.closePath(); c.fill(); } c.restore();
    KG.ui.rrect(c, 2, 2, w - 4, h - 4, 21); c.lineWidth = 4; c.strokeStyle = TKC.ink; c.stroke();
    c.font = '700 ' + Math.round(h * 0.5) + "px Mali, Kanit, sans-serif"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8; c.strokeStyle = TKC.ink; c.strokeText('ก', w / 2, h * 0.56); c.fillStyle = '#ffffff'; c.fillText('ก', w / 2, h * 0.56);
  });
}
class MemoryScene extends ActBase {
  constructor() { super('Memory'); this.ACT = 'memory'; }
  init(d) { super.init(d); this.deck = AK.makeMemory(this.lesson, this.lv, (Date.now() & 0xfffffff) + 51); this.open = []; this.matched = 0; this.locking = false; this.cards = []; this.tries = 0; }
  create() {
    this.begin(); this.HOW = '1. แตะป้ายเพื่อเปิดดูตัวอักษรหรือภาพข้างใน เปิดได้ทีละ 2 ป้าย\n2. ถ้าสองป้ายเป็นคู่กัน (เช่น ตัวอักษรกับภาพของมัน) ป้ายจะค้างเปิดไว้\n3. ถ้าไม่ใช่คู่กัน ป้ายจะพลิกกลับ จำตำแหน่งไว้ให้ดี\n4. เปิดครบทุกคู่จึงผ่าน';
    const NP = this.deck.pairs; this.makePips(NP, 560); this.triesTxt = this.txt(GW - 36, 76, '', { size: 20, ox: 1, color: '#ffffff', stroke: TKC.ink, sw: 5 });
    const W = 250, H = 156, total = this.deck.cards.length, rowsN = Math.ceil(total / 4), ys = rowsN === 3 ? [178, 350, 522] : [264, 436];
    this.deck.cards.forEach((cd, i) => {
      const rr = Math.floor(i / 4), cnt = rr === rowsN - 1 ? total - 4 * (rowsN - 1) : 4, x = 640 + ((i % 4) - (cnt - 1) / 2) * 272, y = ys[rr], col = MEM_COL[i % MEM_COL.length], c = this.add.container(x, y).setDepth(5), k = { cd, c, up: false, matched: false, x, y, W, H, col };
      const back = this.add.image(0, 4, signBackTex(this, W, H, col)).setDisplaySize(W + 24, H + 24), front = this.add.container(0, 0).setVisible(false);
      front.add(addCard(this, 0, 0, W, H, { r: 22, fill: ['#ffffff', '#fff7df'], shadow: 8, lw: 4 }));
      if (cd.kind === 'pic') { front.add(pic(this, cd.spec, 0, -12, W - 80, H - 54)); front.add(fitText(KG.txt(this, 0, H / 2 - 24, cd.say || '', { size: 24, color: TKC.ink, center: true, middle: true }), W - 24)); }
      else if (cd.text.length > 8) front.add(KG.txt(this, 0, 0, cd.text, { size: 27, color: TKC.ink, center: true, middle: true, width: W - 28 }));
      else if (cd.roles !== false && /[่้๊๋]/.test(cd.text) && cd.text.length <= 6) front.add(richText(this, 0, cd.sub ? -12 : 0, cd.text, cd.text.length > 4 ? 56 : 78, { maxW: W - 24 }));
      else front.add(glyph(this, 0, cd.sub ? -12 : 0, cd.text, cd.text.length > 4 ? 52 : cd.text.length > 2 ? 70 : 92, TKC.ink));
      if (cd.kind === 'text' && cd.sub) front.add(KG.txt(this, 0, H / 2 - 22, cd.sub, { size: 18, weight: 400, color: '#6a64a0', center: true, middle: true }));
      c.add([back, front]); k.back = back; k.front = front; c.setSize(W, H).setInteractive({ useHandCursor: true }); c.on('pointerup', () => this.flip(k));
      c.setScale(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 280, delay: 40 * i, ease: 'Back.easeOut' }); this.cards.push(k);
    });
    this.say('แตะป้ายเพื่อเปิด หาคู่ที่เข้ากันให้ครบ ' + NP + ' คู่', 'smile'); this.refreshInfo();
  }
  refreshInfo() { this.triesTxt.setText('เปิดคู่แล้ว ' + this.tries + ' ครั้ง · พลาด ' + this.mistakes); this.setPips(this.matched); }
  turn(k, up, cb) {
    this.tweens.add({ targets: k.c, scaleX: 0.02, duration: 110, ease: 'Sine.easeIn', onComplete: () => { k.back.setVisible(!up); k.front.setVisible(up); this.tweens.add({ targets: k.c, scaleX: 1, duration: 140, ease: 'Sine.easeOut', onComplete: () => { if (cb) cb(); } }); } });
  }
  flip(k) {
    if (this.locking || this.done || this.paused || this._modal || k.up || k.matched || this.open.length >= 2) return;
    k.up = true; this.open.push(k); KG.audio.play('tick', { p: 1.2 }); this.turn(k, true); this.speak(k.cd.say);
    if (this.open.length === 2) { this.locking = true; this.time.delayedCall(950, () => this.judge()); }
  }
  judge() {
    const [a, b] = this.open; this.open = []; this.tries++;
    if (a.cd.pair === b.cd.pair) {
      a.matched = b.matched = true; this.matched++;
      [a, b].forEach(k => { this.tweens.killTweensOf(k.c); k.c.setScale(1); k.back.setVisible(false); k.front.setVisible(true); k.front.list[0].setTint(0xc8ffd2); const g = this.add.graphics().setDepth(6); g.lineStyle(7, 0x3fb54a, 1); g.strokeRoundedRect(k.x - k.W / 2 - 2, k.y - k.H / 2 - 2, k.W + 4, k.H + 4, 24); this.tweens.add({ targets: k.c, scaleX: 1.06, scaleY: 1.06, duration: 150, yoyo: true }); });
      this.good(a.x, a.y); this.good(b.x, b.y); const t = a.cd.kind === 'text' ? a : b, o = t === a ? b : a;
      this.say('เจอคู่แล้ว! ' + t.cd.text + ' คู่กับ ' + (o.cd.kind === 'pic' ? 'ภาพ' + (o.cd.say || '') : o.cd.text), 'happy'); this.locking = false; this.refreshInfo();
      if (this.matched === this.deck.pairs) this.time.delayedCall(700, () => this.finish([['เปิดคู่ทั้งหมด', this.tries + ' ครั้ง']]));
    } else {
      this.mistakes++; this.bad(null); KG.audio.play('wrong'); this.say('ยังไม่ใช่คู่กัน จำตำแหน่งไว้แล้วลองใหม่นะ', 'sad'); this.refreshInfo();
      let n = 0; [a, b].forEach(k => this.turn(k, false, () => { k.up = false; if (++n === 2) this.locking = false; }));
    }
  }
  starsFor(m, h) { return AK.starsFor(m, h, true); }
  hint() {
    if (this.done || this.locking || this.open.length) return; const k = this.cards.find(c => !c.matched); if (!k) return; const partner = this.cards.find(c => c.cd.pair === k.cd.pair && c !== k);
    this.hints++; this.locking = true; KG.audio.play('pop'); this.turn(k, true); this.turn(partner, true); this.say('คำใบ้: ดูสองป้ายนี้ไว้ให้ดี มันเป็นคู่กัน!', 'open');
    this.time.delayedCall(1800, () => { let n = 0; [k, partner].forEach(q => this.turn(q, false, () => { if (++n === 2) this.locking = false; })); });
  }
}
