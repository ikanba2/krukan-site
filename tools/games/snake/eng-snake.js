/* ===== บันไดงูบวกลบเลข: SnakeEng สืบทอดจาก MathEng (ใช้แผงเวที/ตัวช่วยร่วม) =====
   กระดาน cols × rows เดินเป็นรูปงู (บนซ้ายไปขวา แล้วย้อนกลับ) สร้างงู/บันไดด้วย MK.board · ผู้เล่นจริง 1 คน + คู่แข่งคอมพิวเตอร์ หรือผู้เล่นจริง 2–4 คนผลัดกัน (โลก 8)
   ตาเดิน: ตอบโจทย์ (4 ตัวเลือก) ถูก › ทอยเต๋าเดิน (เจอบันไดขึ้น เจองูลง) · ผิด › อยู่ที่เดิม คำตอบที่ถูกจะโชว์ให้เรียนรู้ · ถึงช่องสุดท้ายก่อนใครชนะ
   สำหรับทดสอบ: this.waiting (รอคำตอบจากผู้เล่นจริง) this.q this.chooser this.players this.turn */
const SL_COLORS = ['#e83a8e', '#18b8a0', '#ff9a2e', '#8a5cf0'], SL_NAMES = ['ผู้เล่น 1', 'ผู้เล่น 2', 'ผู้เล่น 3', 'ผู้เล่น 4'], SL_SNAKE = [['#3fbf6a', '#c8ffa8'], ['#ff7a3a', '#ffd9a8'], ['#8a5cf0', '#d8c8ff'], ['#e0243d', '#ffc0c8'], ['#18a0c8', '#b8f0ff']];
class SnakeEng extends MathEng {
  constructor(s, p) {
    super(s, Object.assign({ noGoal: true, rounds: 0, kinds: [] }, p)); this.stats = { right: 0, wrong: 0, snakes: 0, ladders: 0, rolls: 0 }; this.waiting = false; this.rolling = false; this.turn = 0; this.players = []; this.over = false;
    const P = this.p, n = P.cols * P.rows; this.n = n; this.board = MKS.board(this.R, { cols: P.cols, rows: P.rows, snakes: P.snakes, ladders: P.ladders });
    this.cell = Math.min(Math.floor(560 / P.cols), Math.floor(500 / P.rows)); this.bw = this.cell * P.cols; this.bh = this.cell * P.rows; this.bx = 252 + (560 - this.bw) / 2; this.by = 176 + (500 - this.bh) / 2;
    this.humans = P.humans || 1; this.party = this.humans > 1; this.dice2 = n >= 64; this.drawBoard(); this.makePlayers(); this.buildPanel();
    s.goal = n - 1; s.done = 0; s.pbar = KG.ui.bar(s, 470, 26, 300, 20, { value: 0, color: KG.kit.hexInt(s.W.color) }).setDepth(25); s.refreshPips();
  }
  dly(ms) { return ms; }
  destroy() { this.over = true; super.destroy(); }
  /* ---------- กระดาน ---------- */
  center(idx) { const P = this.p, r = Math.floor((idx - 1) / P.cols); let c = (idx - 1) % P.cols; if (r % 2) c = P.cols - 1 - c; return { x: this.bx + c * this.cell + this.cell / 2, y: this.by + this.bh - (r + 1) * this.cell + this.cell / 2 }; }
  drawBoard() {
    const s = this.s, P = this.p, g = this.add(s.add.graphics().setDepth(4)), cell = this.cell, col = this.s.W.color, K = KG.kit;
    const rgb = str => { if (str[0] === '#') return K.hexInt(str); const v = str.match(/\d+/g).map(Number); return (v[0] << 16) | (v[1] << 8) | v[2]; };
    g.fillStyle(0x2d2a5e, 0.22); g.fillRoundedRect(this.bx - 4, this.by - 2, this.bw + 8, this.bh + 10, 16); g.fillStyle(K.hexInt(K.shade(col, 0.55)), 1); g.fillRoundedRect(this.bx - 8, this.by - 8, this.bw + 16, this.bh + 16, 16);
    for (let i = 1; i <= this.n; i++) {
      const c = this.center(i), alt = (Math.floor((i - 1) / P.cols) + (i - 1)) % 2 === 0, tint = i === 1 ? '#bff5c8' : i === this.n ? '#ffe28a' : (alt ? '#fff8ea' : pastel(col));
      g.fillStyle(rgb(tint), 1);
      g.fillRoundedRect(c.x - cell / 2 + 1.5, c.y - cell / 2 + 1.5, cell - 3, cell - 3, Math.min(10, cell * 0.16));
      this.add(KG.txt(s, c.x - cell / 2 + 5, c.y - cell / 2 + 2, String(i), { size: Math.max(11, Math.round(cell * 0.27)), color: '#2d2a5e', weight: 600 }).setDepth(4.5));
    }
    const a = this.center(1), z = this.center(this.n); this.add(KG.txt(s, a.x, a.y + cell * 0.14, 'เริ่ม', { size: Math.max(12, cell * 0.28), color: '#16833a', center: true, middle: true }).setDepth(4.6)); this.add(KG.ui.icon(s, 'flag', z.x, z.y + cell * 0.1, cell * 0.5, 0xd4900a).setDepth(4.6));
    // บันไดก่อน งูทับ
    const g2 = this.add(s.add.graphics().setDepth(5)); this.snakePath = {};
    Object.keys(this.board.ladders).forEach(k => this.ladder(g2, +k, this.board.ladders[k]));
    Object.keys(this.board.snakes).forEach((k, i) => this.snake(g2, +k, this.board.snakes[k], SL_SNAKE[i % SL_SNAKE.length]));
  }
  ladder(g, from, to) {
    const a = this.center(from), b = this.center(to), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, w = Math.min(10, this.cell * 0.17);
    g.lineStyle(7, 0x5a3010, 1); g.lineBetween(a.x + nx * w, a.y + ny * w, b.x + nx * w, b.y + ny * w); g.lineBetween(a.x - nx * w, a.y - ny * w, b.x - nx * w, b.y - ny * w);
    g.lineStyle(4.5, 0xc98a3a, 1); g.lineBetween(a.x + nx * w, a.y + ny * w, b.x + nx * w, b.y + ny * w); g.lineBetween(a.x - nx * w, a.y - ny * w, b.x - nx * w, b.y - ny * w);
    const rungs = Math.max(3, Math.floor(L / 16)); for (let i = 1; i < rungs; i++) { const t = i / rungs, x = a.x + dx * t, y = a.y + dy * t; g.lineStyle(5, 0x5a3010, 1); g.lineBetween(x + nx * w, y + ny * w, x - nx * w, y - ny * w); g.lineStyle(3, 0xe0a85a, 1); g.lineBetween(x + nx * w, y + ny * w, x - nx * w, y - ny * w); }
  }
  bez(P, t) { const u = 1 - t; return { x: u * u * u * P[0].x + 3 * u * u * t * P[1].x + 3 * u * t * t * P[2].x + t * t * t * P[3].x, y: u * u * u * P[0].y + 3 * u * u * t * P[1].y + 3 * u * t * t * P[2].y + t * t * t * P[3].y }; }
  snake(g, from, to, cols) {
    const a = this.center(from), b = this.center(to), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, amp = Math.min(70, L * 0.3), sgn = (from + to) % 2 ? 1 : -1;
    const P = [a, { x: a.x + dx * 0.33 + nx * amp * sgn, y: a.y + dy * 0.33 + ny * amp * sgn }, { x: a.x + dx * 0.66 - nx * amp * sgn, y: a.y + dy * 0.66 - ny * amp * sgn }, b]; this.snakePath[from] = P; const K = KG.kit, c1 = K.hexInt(cols[0]), c2 = K.hexInt(cols[1]), N = Math.max(14, Math.floor(L / 7)), wd = Math.max(7, this.cell * 0.2);
    for (let i = N; i >= 0; i--) { const q = this.bez(P, i / N), r = wd * (0.55 + 0.45 * (1 - i / N)); g.fillStyle(0x2d2a5e, 1); g.fillCircle(q.x, q.y, r + 2.5); }
    for (let i = N; i >= 0; i--) { const q = this.bez(P, i / N), r = wd * (0.55 + 0.45 * (1 - i / N)); g.fillStyle(i % 4 < 2 ? c1 : c2, 1); g.fillCircle(q.x, q.y, r); }
    const h = this.bez(P, 0), h2 = this.bez(P, 0.04), ang = Math.atan2(h.y - h2.y, h.x - h2.x), er = Math.max(2.4, wd * 0.32);   // หัวงู (ที่ช่องบน)
    g.fillStyle(0x2d2a5e, 1); g.fillCircle(h.x, h.y, wd * 1.2 + 2.5); g.fillStyle(c1, 1); g.fillCircle(h.x, h.y, wd * 1.2); [-1, 1].forEach(sd => { const ex = h.x + Math.cos(ang + sd * 0.9) * wd * 0.7, ey = h.y + Math.sin(ang + sd * 0.9) * wd * 0.7; g.fillStyle(0xffffff, 1); g.fillCircle(ex, ey, er + 1); g.fillStyle(0x111111, 1); g.fillCircle(ex + Math.cos(ang) * 1, ey + Math.sin(ang) * 1, er * 0.55); });
    g.lineStyle(2.5, 0xe0243d, 1); g.lineBetween(h.x + Math.cos(ang) * wd * 1.2, h.y + Math.sin(ang) * wd * 1.2, h.x + Math.cos(ang) * wd * 2, h.y + Math.sin(ang) * wd * 2);
  }
  /* ---------- ผู้เล่นและตัวหมาก ---------- */
  pawnTex(hex) {
    return KG.tex(this.s, 'slpawn|' + hex, 44, 62, c => {
      const K = KG.kit; c.fillStyle = 'rgba(45,42,94,.28)'; c.beginPath(); c.ellipse(22, 56, 15, 5, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(8, 52); c.quadraticCurveTo(8, 28, 22, 28); c.quadraticCurveTo(36, 28, 36, 52); c.closePath(); c.fillStyle = KG.ui.lin(c, 0, 28, 0, 52, [[0, K.shade(hex, 1.25)], [1, K.shade(hex, 0.85)]]); c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#2d2a5e'; c.stroke();
      c.beginPath(); c.arc(22, 20, 14, 0, 7); c.fillStyle = KG.ui.lin(c, 0, 6, 0, 34, [[0, '#4a4780'], [1, '#2d2a5e']]); c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#2d2a5e'; c.stroke();
      c.fillStyle = hex; KG.ui.rrect(c, 11, 15, 22, 9, 4); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; KG.ui.rrect(c, 14, 16, 10, 3, 1.5); c.fill();
    });
  }
  makePlayers() {
    const P = this.p, hum = this.humans; this.players = [];
    for (let i = 0; i < hum; i++) this.players.push({ name: hum > 1 ? SL_NAMES[i] : 'คุณ', color: SL_COLORS[i], bot: false, pos: 1, i });
    (P.rivals || []).forEach((acc, k) => this.players.push({ name: this.s.L.boss ? 'บอส' : 'คู่แข่ง' + ((P.rivals.length > 1) ? ' ' + (k + 1) : ''), color: SL_COLORS[hum + k], bot: true, acc, pos: 1, i: hum + k }));
    this.players.forEach((pl, k) => {
      const c = this.center(1), o = this.off(k), body = this.s.add.image(0, 0, this.pawnTex(pl.color)).setOrigin(0.5, 0.88), sc = Math.max(0.5, Math.min(1, this.cell / 62)); body.setScale(sc);
      const t = this.s.add.container(c.x + o.x, c.y + o.y, [body]).setDepth(8 + k * 0.1); t.body = body; pl.tok = t; this.add(t); t.setScale(0); this.s.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 300, delay: 200 + k * 100, ease: 'Back.easeOut' });
    });
  }
  off(k) { const o = this.cell * 0.22; return [{ x: -o, y: o * 0.2 }, { x: o, y: o * 0.2 }, { x: -o, y: o * 0.9 }, { x: o, y: o * 0.9 }][k % 4]; }
  /* ---------- แผงขวา: ตา โจทย์ ตัวเลือก ลูกเต๋า ---------- */
  buildPanel() {
    const s = this.s; this.panelX = 952; this.hdr = this.txt(this.panelX, 198, '', { size: 26, color: '#2d2a5e', width: 230 }); this.hdr2 = this.txt(this.panelX, 228, '', { size: 18, weight: 400, color: '#7a77a8', width: 230 });
    this.dot = this.add(s.add.image(this.panelX - 100, 198, this.pawnTex('#e83a8e')).setDepth(9).setScale(0.62)); this.dieImg = this.add(s.add.image(this.panelX - (this.dice2 ? 46 : 0), 618, this.dieTex(1)).setDepth(9).setDisplaySize(this.dice2 ? 74 : 86, this.dice2 ? 74 : 86)); this.dieImg2 = this.dice2 ? this.add(s.add.image(this.panelX + 46, 618, this.dieTex(1)).setDepth(9).setDisplaySize(74, 74)) : null;
    this.dieNote = this.txt(this.panelX, 668, 'ตอบถูกแล้วจะได้ทอยเต๋า', { size: 17, weight: 400, color: '#7a77a8', width: 240 });
  }
  dieTex(n) {
    return KG.tex(this.s, 'sldie|' + n, 92, 100, c => {
      c.fillStyle = 'rgba(45,42,94,.3)'; KG.ui.rrect(c, 6, 14, 80, 80, 16); c.fill(); c.fillStyle = '#ffffff'; KG.ui.rrect(c, 4, 6, 80, 80, 16); c.fill(); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; c.stroke();
      const pips = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[n] || []; c.fillStyle = '#e83a8e';
      pips.forEach(p => { c.beginPath(); c.arc(44 + p[0] * 20, 46 + p[1] * 20, 7.5, 0, 7); c.fill(); });
    });
  }
  /* ---------- ลำดับตา ---------- */
  start() { this.running = true; this.startTurn(); }
  startTurn() {
    if (!this.alive || this.over || this.s.over) return; const pl = this.players[this.turn]; this.cur = pl; this.clearAsk(); this.hdr.setText(pl.bot ? pl.name + ' กำลังคิด...' : 'ตาของ ' + pl.name); this.hdr2.setText(''); this.dot.setTexture(this.pawnTex(pl.color));
    this.s.tweens.add({ targets: pl.tok, y: pl.tok.y - 10, duration: 160, yoyo: true, repeat: 1 });
    if (pl.bot) { this.waiting = false; this.setPrompt('ตาของ' + pl.name, 'ตาของ' + pl.name); this.s.time.delayedCall(this.dly(1100 + this.R() * 700), () => this.botAnswer(pl)); } else this.ask(pl);
  }
  clearAsk() { if (this.askObjs) this.askObjs.forEach(o => { if (o && o.scene) { this.s.tweens.killTweensOf(o); o.destroy(); } }); this.askObjs = []; this.chooser = null; this.hintObj = null; }
  ask(pl) {
    const s = this.s, q = this.q = MKS.make(this.R, this.p.q), A = o => { this.askObjs.push(o); return o; }; this.waiting = true; this.setPrompt(q.kind === 'story' ? 'อ่านเรื่องแล้วเลือกคำตอบ' : (q.kind === 'bond' ? 'เลขอะไรบวกกันได้ ' + MKS.comma(q.a + q.ans) : 'คำนวณแล้วเลือกคำตอบ'), q.spoken);
    if (q.kind === 'story') { const p = A(KG.ui.panel(s, 832, 252, 240, 210, { accent: '#ff9a2e', cuts: [12, 0, 12, 0], glow: false, alpha: 0.98 }).setDepth(6)); A(this.txt(this.panelX, 357, q.text, { size: 20, color: '#2d2a5e', width: 214, align: 'center' })); void p; }
    else { A(MKU.exprBox(s, this.panelX, 298, 240, 100, q.text, { size: q.text.length > 12 ? 36 : 46, color: this.s.W.color })); }
    const top = q.kind === 'story' ? 520 : 440; this.chooser = A(MKU.choices(s, this.panelX, top, q.opts, { cols: 2, w: 114, h: 74, gap: 12, size: 38, keys: true, onPick: (v, i) => this.answer(v, i) })); q.shown = q.opts; this.chooser.setAlpha(0); s.tweens.add({ targets: this.chooser, alpha: 1, duration: 220, delay: 120 });
    this.hdr2.setText(pl.name === 'คุณ' ? 'เลือกคำตอบ แล้วจะได้ทอยเต๋า' : 'ผลัดกันตอบ ถูกแล้วทอยเต๋า'); void top;
  }
  answer(v, i) {
    if (!this.running || !this.waiting || this.over) return; const s = this.s, q = this.q, ch = this.chooser, b = ch.btns[i], x = ch.x + b.x, y = ch.y + b.y, pl = this.cur;
    this.waiting = false; ch.setEnabled(false);
    if (v === q.ans) { this.stats.right++; ch.mark(i, true); s.score += 10; s.combo++; s.bestCombo = Math.max(s.bestCombo, s.combo); s.refreshPips(); KG.audio.play('good', { i: Math.min(6, s.combo) }); if (s.combo % 3 === 0) s.coach.react('good'); this.hdr2.setText('ถูกต้อง! ทอยเต๋าเลย'); s.time.delayedCall(this.dly(500), () => this.roll(pl)); }
    else { this.stats.wrong++; s.combo = 0; ch.mark(i, false); const ri = q.opts.indexOf(q.ans); if (ri >= 0) { const bb = ch.btns[ri]; this.hintObj = null; s.tweens.add({ targets: bb, scaleX: 1.1, scaleY: 1.1, duration: 200, yoyo: true, repeat: 2 }); } s.bad(x, y, 'ยังไม่ถูก'); this.hdr2.setText('คำตอบคือ ' + MKS.comma(q.ans) + ' ตาต่อไป'); s.time.delayedCall(this.dly(1600), () => this.nextTurn()); }
  }
  botAnswer(pl) {
    if (!this.alive || this.over || this.s.over) return; const ok = this.R() < pl.acc; this.hdr.setText(pl.name + (ok ? ' ตอบถูก!' : ' ตอบผิด')); KG.audio.play(ok ? 'tick' : 'wrong', { p: 1.1 });
    if (ok) this.s.time.delayedCall(this.dly(600), () => this.roll(pl)); else this.s.time.delayedCall(this.dly(1000), () => this.nextTurn());
  }
  nextTurn() { if (!this.alive || this.over) return; this.turn = (this.turn + 1) % this.players.length; this.startTurn(); }
  /* ---------- ทอยเต๋า เดิน บันได งู ---------- */
  roll(pl) {
    if (!this.alive || this.over) return; const s = this.s, d = this.p.dice || 6, two = !!this.dice2; this.rolling = true; this.stats.rolls++; let k = 0; const v1 = 1 + Math.floor(this.R() * d), v2 = two ? 1 + Math.floor(this.R() * d) : 0, val = v1 + v2; this.hdr2.setText('กำลังทอยเต๋า...');
    const spin = () => {
      k++; this.dieImg.setTexture(this.dieTex(1 + Math.floor(Math.random() * d))).setAngle((Math.random() - 0.5) * 40); if (two) this.dieImg2.setTexture(this.dieTex(1 + Math.floor(Math.random() * d))).setAngle((Math.random() - 0.5) * 40); KG.audio.play('tick', { p: 0.8 + k * 0.05 });
      if (k < 9) s.time.delayedCall(this.dly(70 + k * 12), spin);
      else { this.dieImg.setTexture(this.dieTex(v1)).setAngle(0); if (two) this.dieImg2.setTexture(this.dieTex(v2)).setAngle(0); [this.dieImg, this.dieImg2].forEach(im => { if (im) s.tweens.add({ targets: im, scaleX: 1.3 * im.scaleX, scaleY: 1.3 * im.scaleY, duration: 140, yoyo: true }); }); this.hdr2.setText(pl.name + ' ทอยได้ ' + (two ? v1 + ' + ' + v2 + ' = ' + val : val)); s.time.delayedCall(this.dly(420), () => this.moveBy(pl, val)); }
    };
    spin();
  }
  moveBy(pl, steps) {
    const target = Math.min(this.n, pl.pos + steps); let p = pl.pos; const hop = () => {
      if (!this.alive || this.over) return; if (p >= target) { this.landed(pl); return; } p++; this.hopTo(pl, p, () => { KG.audio.tone({ f: KG.kit.mtof(60 + (p % 8) * 2), t: 0.12, type: 'triangle', vol: 0.08 }); hop(); });
    }; hop();
  }
  hopTo(pl, idx, cb) {
    const s = this.s, c = this.center(idx), o = this.off(pl.i); pl.pos = idx; s.tweens.add({ targets: pl.tok, x: c.x + o.x, y: c.y + o.y, duration: this.dly(190), ease: 'Sine.easeInOut', onComplete: cb }); s.tweens.add({ targets: pl.tok.body, y: -16, duration: this.dly(95), yoyo: true, ease: 'Quad.easeOut' });
  }
  landed(pl) {
    const s = this.s, B = this.board, pos = pl.pos;
    if (pos >= this.n) { this.finish(pl); return; }
    if (B.ladders[pos]) { this.stats.ladders++; this.climb(pl, B.ladders[pos]); }
    else if (B.snakes[pos]) { this.stats.snakes++; this.slide(pl, B.snakes[pos]); }
    else this.after(pl);
  }
  climb(pl, to) {
    const s = this.s, c = this.center(to), o = this.off(pl.i); KG.audio.play('magic'); this.hdr2.setText('บันไดช่วย! ขึ้นไปช่อง ' + to); K_pop(s, pl.tok.x, pl.tok.y - 40, 'บันได!', '#22a050'); pl.pos = to;
    s.tweens.add({ targets: pl.tok, x: c.x + o.x, y: c.y + o.y, duration: this.dly(750), ease: 'Cubic.easeInOut', onComplete: () => { KG.kit.stars(s, pl.tok.x, pl.tok.y, [0x9bf0a8, 0xffffff, 0xffd34f], 14); this.after(pl); } });
  }
  slide(pl, to) {
    const s = this.s, from = pl.pos, P = this.snakePath[from], o = this.off(pl.i); KG.audio.play('wrong'); this.hdr2.setText('โดนงูกลืน! ตกลงไปช่อง ' + to); K_pop(s, pl.tok.x, pl.tok.y - 40, 'งู!', '#e0243d'); pl.pos = to; if (!pl.bot) s.coach.react('bad', 'ไม่เป็นไร สู้ ๆ');
    s.tweens.addCounter({ from: 0, to: 1, duration: this.dly(950), ease: 'Sine.easeIn', onUpdate: tw => { const q = this.bez(P, tw.getValue()); pl.tok.x = q.x + o.x; pl.tok.y = q.y + o.y; }, onComplete: () => { const c = this.center(to); pl.tok.setPosition(c.x + o.x, c.y + o.y); this.after(pl); } });
  }
  after(pl) {
    const s = this.s; if (!pl.bot && !this.party) { s.done = pl.pos - 1; s.refreshPips(); if (s.bossImg) s.hitBoss(1 - (pl.pos - 1) / (this.n - 1)); } else if (!pl.bot) { s.done = Math.max(s.done, pl.pos - 1); s.refreshPips(); }
    this.rolling = false; s.time.delayedCall(this.dly(650), () => this.nextTurn());
  }
  finish(pl) {
    const s = this.s; this.over = true; this.busy = true; this.waiting = false; this.clearAsk(); this.hdr.setText(pl.name + ' ถึงเส้นชัย!'); this.hdr2.setText(''); KG.audio.play('fanfare'); KG.fx.burst(s, pl.tok.x, pl.tok.y - 20, { colors: [0xffd34f, 0xffffff, 0xff7ab8, 0x7fe0ff], n: 40, max: 520, tex: 'fx_star', rot: true, depth: 70 });
    s.tweens.add({ targets: pl.tok, y: pl.tok.y - 30, duration: 220, yoyo: true, repeat: 3 }); this.winner = pl;
    if (!pl.bot) { s.done = this.n - 1; s.refreshPips(); }
    s.time.delayedCall(this.dly(1300), () => { if (this.party) { KG.kit.banner(s, pl.name + ' ชนะ!', pl.color, 1400); s.time.delayedCall(this.dly(1000), () => s.win()); } else if (pl.bot) s.lose(pl.name + 'ถึงเส้นชัยก่อน'); else s.win(); });
  }
}
// สีพาสเทล: ผสมสีโลกกับขาว 78%
function pastel(hex) { const n = parseInt(hex.slice(1), 16), f = v => Math.round(v * 0.22 + 255 * 0.78); return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')'; }
function K_pop(s, x, y, text, color) { KG.fx.pop(s, x, y, text, { size: 30, color, depth: 80 }); }
