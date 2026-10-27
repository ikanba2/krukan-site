/* ===== Techno Talk: เปิดป้าย (เกมจับคู่ความจำ 6 คู่ เปิดทีละสองป้าย ถ้าเป็นคู่กันป้ายจะค้างอยู่) ===== */
const FLIP_COL = ['#ff5aa6', '#3d8bff', '#17c4a8', '#ffa21e', '#9a5ae8', '#3fb54a'];
function signBackTex(scene, w, h, col) {
  return KG.tex(scene, 'tk-sign|' + w + 'x' + h + '|' + col, w + 24, h + 24, c => {
    c.translate(12, 12); c.lineJoin = 'round';
    KG.ui.rrect(c, 0, 8, w, h, 22); c.fillStyle = 'rgba(45,42,94,.3)'; c.fill();
    KG.ui.rrect(c, 0, 0, w, h, 22); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, col); g.addColorStop(1, shade(col, 0.78)); c.fillStyle = g; c.fill();
    c.save(); KG.ui.rrect(c, 0, 0, w, h, 22); c.clip(); c.globalAlpha = 0.16; c.fillStyle = '#ffffff'; for (let i = -h; i < w + h; i += 34) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 17, 0); c.lineTo(i + 17 - h, h); c.lineTo(i - h, h); c.closePath(); c.fill(); } c.restore();
    KG.ui.rrect(c, 2, 2, w - 4, h - 4, 21); c.lineWidth = 4; c.strokeStyle = TKC.ink; c.stroke();
    [[26, 20], [w - 26, 20]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 7, 0, 7); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 3; c.strokeStyle = TKC.ink; c.stroke(); });
    c.font = '700 ' + Math.round(h * 0.56) + 'px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8; c.strokeStyle = TKC.ink; c.strokeText('?', w / 2, h * 0.54); c.fillStyle = '#ffffff'; c.fillText('?', w / 2, h * 0.54);
  });
}
class FlipScene extends ActBase {
  constructor() { super('Flip'); this.ACT = 'flip'; }
  init(d) { super.init(d); this.deck = TK.makeFlip(this.unit, (Date.now() & 0xfffffff) + 5); this.open = []; this.matched = 0; this.locking = false; this.cards = []; this.tries = 0; }
  create() {
    this.begin(); this.HOW = '1. แตะป้ายเพื่อเปิดดูภาพหรือคำข้างใน เปิดได้ทีละ 2 ป้าย\n2. ถ้าสองป้ายเป็นคู่กัน (เช่น ภาพกับคำของภาพนั้น) ป้ายจะค้างเปิดไว้\n3. ถ้าไม่ใช่คู่กัน ป้ายจะพลิกกลับ จำตำแหน่งไว้ให้ดี\n4. เปิดครบ 6 คู่จึงผ่าน พลาดน้อยได้ดาวเยอะ';
    this.makePips(6, 560); this.triesTxt = this.txt(GW - 36, 76, '', { size: 20, ox: 1, color: '#ffffff', stroke: TKC.ink, sw: 5 });
    const W = 250, H = 156, xs = [262, 534, 806, 1078], ys = [178, 350, 522];
    this.deck.cards.forEach((cd, i) => {
      const x = xs[i % 4], y = ys[Math.floor(i / 4)], col = FLIP_COL[i % FLIP_COL.length], c = this.add.container(x, y).setDepth(5), k = { cd, c, up: false, matched: false, x, y, W, H, col };
      const back = this.add.image(0, 4, signBackTex(this, W, H, col)).setDisplaySize(W + 24, H + 24), front = this.add.container(0, 0).setVisible(false);
      front.add(addCard(this, 0, 0, W, H, { r: 22, fill: ['#ffffff', '#fff7df'], shadow: 8, lw: 4 }));
      if (cd.kind === 'pic') front.add(pic(this, cd.spec, 0, 0, W - 26, H - 20));
      else {   // ข้อความ 1-2 บรรทัดกึ่งกลางป้าย (ลดขนาดถ้ายาว) + คำแปลไทยตัวเล็กใต้ข้อความ
        const mk = sz => KG.wrap(cd.text, W - 34, '600 ' + sz + 'px Kanit').split(String.fromCharCode(10)); let size = cd.sub ? 38 : 32, lines = mk(size); while (lines.length > 2 && size > 20) { size -= 2; lines = mk(size); }
        const lh = Math.round(size * 1.25), total = lines.length * lh + (cd.sub ? 30 : 0), t = KG.txt(this, 0, -total / 2 + lines.length * lh / 2, lines.join(String.fromCharCode(10)), { size, color: TKC.ink, center: true, middle: true, lineSpacing: 0 }); front.add(t);
        if (cd.sub) front.add(fitText(KG.txt(this, 0, -total / 2 + lines.length * lh + 14, cd.sub, { size: 20, weight: 400, color: '#6a64a0', center: true, middle: true }), W - 30));
      }
      c.add([back, front]); k.back = back; k.front = front; c.setSize(W, H).setInteractive({ useHandCursor: true }); c.on('pointerup', () => this.flip(k));
      c.setScale(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 280, delay: 40 * i, ease: 'Back.easeOut' }); this.cards.push(k);
    });
    this.say('แตะป้ายเพื่อเปิด หาคู่ที่เหมือนกันให้ครบ 6 คู่', 'wave'); this.refreshInfo();
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
      a.matched = b.matched = true; this.matched++; [a, b].forEach(k => { this.tweens.killTweensOf(k.c); k.c.setScale(1); k.back.setVisible(false); k.front.setVisible(true); k.front.list[0].setTint(0xc8ffd2); const g = this.add.graphics().setDepth(6); g.lineStyle(7, 0x3fb54a, 1); g.strokeRoundedRect(k.x - k.W / 2 - 2, k.y - k.H / 2 - 2, k.W + 4, k.H + 4, 24); k.mark = g; this.tweens.add({ targets: k.c, scaleX: 1.06, scaleY: 1.06, duration: 150, yoyo: true }); });
      this.good(a.x, a.y); this.good(b.x, b.y); const txt = a.cd.kind === 'text' ? a.cd.text : b.cd.text; this.say('เจอคู่แล้ว! ' + txt + (a.cd.sub || b.cd.sub ? ' = ' + (a.cd.sub || b.cd.sub) : ''), 'happy'); this.locking = false; this.refreshInfo();
      if (this.matched === this.deck.pairs) this.time.delayedCall(700, () => this.finish([['เปิดคู่ทั้งหมด', this.tries + ' ครั้ง']]));
    } else {
      this.mistakes++; this.bad(null); KG.audio.play('wrong'); this.say('ยังไม่ใช่คู่กัน จำตำแหน่งไว้แล้วลองใหม่นะ', 'sad'); this.refreshInfo();
      let n = 0; [a, b].forEach(k => this.turn(k, false, () => { k.up = false; if (++n === 2) this.locking = false; }));
    }
  }
  starsFor(m, h) { const pen = m + h; return pen <= 4 ? 3 : pen <= 8 ? 2 : 1; }
  hint() {
    if (this.done || this.locking || this.open.length) return; const k = this.cards.find(c => !c.matched); if (!k) return; const partner = this.cards.find(c => c.cd.pair === k.cd.pair && c !== k);
    this.hints++; this.locking = true; KG.audio.play('pop'); this.turn(k, true); this.turn(partner, true); this.say('คำใบ้: ดูสองป้ายนี้ไว้ให้ดี มันเป็นคู่กัน!', 'open');
    this.time.delayedCall(1800, () => { let n = 0; [k, partner].forEach(q => this.turn(q, false, () => { if (++n === 2) this.locking = false; })); });
  }
}
