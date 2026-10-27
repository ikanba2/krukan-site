/* ===== Techno Talk: โยงเส้น (ลากเส้นจากการ์ดซ้ายไปการ์ดขวาที่คู่กัน หรือแตะซ้ายแล้วแตะขวา) 2 รอบ รอบละ 5 คู่ ===== */
const MATCH_COL = ['#ff5aa6', '#3d8bff', '#17c4a8', '#ffa21e', '#9a5ae8'];
class MatchScene extends ActBase {
  constructor() { super('Match'); this.ACT = 'match'; }
  init(d) { super.init(d); this.round = 0; this.seed = (Date.now() & 0xfffffff) + 3; this.objs = []; this.drag = null; this.selected = null; this.matched = 0; this.total = 0; }
  create() {
    this.begin(); this.HOW = '1. ลากเส้นจากการ์ดทางซ้ายไปหาการ์ดทางขวาที่เป็นคู่กัน (กดค้างที่การ์ดหรือจุดกลมแล้วลากไปปล่อย)\n2. หรือแตะการ์ดซ้ายก่อน แล้วแตะการ์ดขวาที่คู่กัน\n3. ถ้าโยงผิด เส้นจะหายไปและมีเหตุผลบอก มีทั้งหมด 2 รอบ รอบละ 5 คู่';
    this.makePips(10, 470); this.lines = this.add.graphics().setDepth(4); this.rub = this.add.graphics().setDepth(30);
    this.input.on('pointerdown', p => this.onDown(p)); this.input.on('pointermove', p => this.onMove(p)); this.input.on('pointerup', p => this.onUp(p));
    this.startRound();
  }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.lines.clear(); this.selected = null; this.matched = 0;
    const M = this.M = TK.makeMatch(this.unit, this.round, this.seed + this.round * 977), P = M.pairs; this.cards = []; this.hintPair = null;
    const rowsY = P.map((_, i) => 188 + i * 92);
    const bt = this.txt(GW / 2, 96, 'รอบ ' + (this.round + 1) + '/2 · ' + M.title, { size: 27, center: true, ox: 0.5, stroke: true, sw: 5 }); this.objs.push(bt);
    const tl = P[0].L.kind === 'text', LW = tl ? 420 : 300, LX = tl ? 330 : 300, RW = tl ? 520 : 560, RX = tl ? 980 : 930;   // ซ้ายเป็นข้อความ: ขยายการ์ดให้ประโยคอยู่บรรทัดเดียว
    P.forEach((p, i) => this.makeCard('L', p, LX, rowsY[i], LW, 84, p.L));
    M.rightOrder.forEach((pid, i) => this.makeCard('R', P.find(p => p.id === pid), RX, rowsY[i], RW, 84, P.find(p => p.id === pid).R));
    this.say(M.hint, 'smile'); this.setPips(this.round * 5);
  }
  makeCard(side, pair, x, y, w, h, face) {
    const c = this.add.container(x, y).setDepth(6); this.objs.push(c);
    c.add(addCard(this, 0, 0, w, h, { r: 22, fill: ['#ffffff', '#f6f0ff'], shadow: 6, lw: 3.5 }));
    if (face.kind === 'pic') c.add(pic(this, face.spec, 0, 0, w - 20, h - 12));
    else {
      const big = face.sub ? 36 : 30, t = fitText(KG.txt(this, 0, face.sub ? -13 : 0, face.text, { size: big, color: TKC.ink, center: true, middle: true }), w - 44); c.add(t);
      if (face.sub) c.add(fitText(KG.txt(this, 0, 25, face.sub, { size: 19, weight: 400, color: '#6a64a0', center: true, middle: true }), w - 44));
    }
    const dx = side === 'L' ? w / 2 + 22 : -w / 2 - 22, dot = this.add.circle(x + dx, y, 13, 0xffffff).setStrokeStyle(4, 0x2d2a5e).setDepth(7); this.objs.push(dot);
    const card = { side, pair, c, dot, x, y, w, h, cx: x + dx, cy: y, done: false, face }; this.cards.push(card); return card;
  }
  hit(x, y) { return this.cards.find(k => !k.done && (inBox(x, y, { x: k.x - k.w / 2, y: k.y - k.h / 2, w: k.w, h: k.h }) || Math.hypot(x - k.cx, y - k.cy) < 26)) || null; }
  busy() { return this._modal || this.done || this.paused || this.locking; }
  onDown(p) {
    if (this.busy()) return; const k = this.hit(p.worldX, p.worldY); if (!k) return;
    if (this.selected && this.selected.side !== k.side) { const a = this.selected; this.selected = null; this.mark(null); this.tryPair(a, k); return; }
    this.drag = { from: k, moved: false, x0: p.worldX, y0: p.worldY }; this.mark(k);
  }
  onMove(p) {
    if (!this.drag) return; const d = this.drag; if (!d.moved && Math.hypot(p.worldX - d.x0, p.worldY - d.y0) > 10) d.moved = true;
    if (d.moved) { this.rub.clear(); this.rub.lineStyle(14, 0x2d2a5e, 1); this.rub.lineBetween(d.from.cx, d.from.cy, p.worldX, p.worldY); this.rub.lineStyle(8, 0xffc82e, 1); this.rub.lineBetween(d.from.cx, d.from.cy, p.worldX, p.worldY); }
  }
  onUp(p) {
    if (!this.drag) return; const d = this.drag; this.drag = null; this.rub.clear();
    if (this.busy()) return; const t = this.hit(p.worldX, p.worldY);
    if (d.moved) { this.mark(null); if (t && t.side !== d.from.side) this.tryPair(d.from, t); }
    else { if (this.selected === d.from) { this.selected = null; this.mark(null); } else { this.selected = d.from; this.mark(d.from); KG.audio.play('tap'); } }
  }
  mark(k) { this.cards.forEach(c => { if (!c.done) { c.dot.setFillStyle(c === k ? 0xffc82e : 0xffffff); c.c.setScale(c === k ? 1.04 : 1); } }); }
  tryPair(a, b) {
    const L = a.side === 'L' ? a : b, R = a.side === 'L' ? b : a;
    if (L.pair.id === R.pair.id) {
      const col = Phaser.Display.Color.HexStringToColor(MATCH_COL[this.matched % 5]).color; L.done = R.done = true; this.matched++; this.setPips(this.round * 5 + this.matched);
      this.lines.lineStyle(14, 0x2d2a5e, 1); this.lines.lineBetween(L.cx, L.cy, R.cx, R.cy); this.lines.lineStyle(8, col, 1); this.lines.lineBetween(L.cx, L.cy, R.cx, R.cy);
      [L, R].forEach(k => { k.dot.setFillStyle(col); k.c.setScale(1); const g = this.add.graphics().setDepth(7); g.lineStyle(6, col, 1); g.strokeRoundedRect(k.x - k.w / 2, k.y - k.h / 2, k.w, k.h, 22); this.objs.push(g); const bd = this.add.circle(k.x + (k.side === 'L' ? -k.w / 2 + 6 : k.w / 2 - 6), k.y - k.h / 2 + 6, 17, 0x3fb54a).setStrokeStyle(3, 0x2d2a5e).setDepth(8); const ck = KG.ui.icon(this, 'check', bd.x, bd.y, 20, 0xffffff).setDepth(9); this.objs.push(bd, ck); });
      this.good(R.cx, R.cy); this.speak(R.pair.en);
      this.say('ถูกต้อง! ' + R.pair.en + (R.pair.th ? ' แปลว่า ' + R.pair.th : ''), 'happy');
      if (this.matched === 5) { this.locking = true; this.time.delayedCall(900, () => { this.locking = false; this.round++; if (this.round >= 2) this.finish([['โยงถูก', '10 คู่']]); else { KG.banner(this, 'รอบที่ 2', '#ffffff', 1, 330); this.time.delayedCall(700, () => this.startRound()); } }); }
    } else {
      this.mistakes++; this.bad(null); const tgt = R.pair, g = this.add.graphics().setDepth(31); g.lineStyle(12, 0x2d2a5e, 1); g.lineBetween(L.cx, L.cy, R.cx, R.cy); g.lineStyle(7, 0xee4a4a, 1); g.lineBetween(L.cx, L.cy, R.cx, R.cy);
      this.tweens.add({ targets: g, alpha: 0, duration: 500, delay: 250, onComplete: () => g.destroy() }); [L, R].forEach(k => this.tweens.add({ targets: k.c, x: k.x + 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { k.c.x = k.x; } }));
      let why;
      if (this.M.mode === 'qa') why = 'คำตอบนี้ตอบคำถามอื่น ดูประธานและคำช่วยของคำถามให้ตรงกันอีกครั้ง';
      else if (this.M.mode === 'qpic') why = 'คำถามนี้ไม่ตรงกับภาพ (“' + tgt.en + '” แปลว่า ' + tgt.th + ')';
      else if (this.M.mode === 'th') why = '“' + tgt.en + '” แปลว่า ' + tgt.th + ' ไม่ตรงกับประโยคไทยที่เลือก';
      else why = '“' + tgt.en + '” แปลว่า ' + tgt.th + ' ไม่ตรงกับภาพนี้';
      this.say(why, 'sad'); this.selected = null; this.mark(null);
    }
  }
  hint() {
    if (this.done || this.locking) return; const k = this.cards.find(c => c.side === 'L' && !c.done); if (!k) return; this.hints++; KG.audio.play('pop');
    const r = this.cards.find(c => c.side === 'R' && c.pair.id === k.pair.id), g = this.add.graphics().setDepth(32); [k, r].forEach(q => { g.lineStyle(7, 0xffc82e, 1); g.strokeRoundedRect(q.x - q.w / 2 - 4, q.y - q.h / 2 - 4, q.w + 8, q.h + 8, 24); });
    this.tweens.add({ targets: g, alpha: 0.3, duration: 300, yoyo: true, repeat: 4, onComplete: () => g.destroy() }); this.say('คำใบ้: ลองโยงสองการ์ดที่มีกรอบเหลืองดู', 'open');
  }
}
