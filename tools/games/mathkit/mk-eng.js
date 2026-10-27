/* ===== MathEng: ตัวเกมแบบหลายรอบ (ฐานของเรียงลำดับตัวเลข · เลขโรมัน ฯลฯ) =====
   ทุกด่านคือชุดโจทย์ (p.kinds) วนตามจำนวนรอบ (p.rounds) · แต่ละรอบสร้างโจทย์ด้วย MK.make แล้วเรียก this['r_' + ชนิด](q, spec) วาดหน้าจอ
   โจทย์เลือกคำตอบใช้ this.choose(q, ตัวเลือกการวาง) · ตอบถูก/ผิดผ่าน this.answer(v, i) · พลาดครบสองครั้งในรอบเดียวมีแสงใบ้
   สำหรับทดสอบ: this.q (โจทย์) this.chooser this.curKind this.round */
const MKS = window.MK, MKU = KG.mk;
class MathEng {
  constructor(s, p) {
    this.s = s; this.p = Object.assign({ rounds: 4, kinds: [] }, p); this.R = s.R; this.objs = []; this.round = 0; this.alive = true; this.running = false; this.busy = false; this.curKind = null; this.q = null;
    this.chooser = null; this.wrong = 0; this.hintObj = null; this.qbox = null;
    if (!this.p.noGoal) s.setGoal(this.p.rounds); if (this.p.time) s.setTimer(this.p.time);
    this.stage = KG.ui.panel(s, 232, 166, 856, 524, { accent: s.W.color, accent2: '#ffc400', cuts: [22, 0, 22, 0], glow: false, alpha: KG.kit.game.stageAlpha || 0.82 }).setDepth(3);
    MKU.onKeys(s, e => this.onKey(e));
  }
  start() { this.running = true; this.nextRound(); }
  stop() { this.running = false; }
  destroy() { this.alive = false; this.running = false; this.clear(); }
  add(o) { this.objs.push(o); return o; }
  clear() { this.objs.forEach(o => { if (o && o.scene) { this.s.tweens.killTweensOf(o); o.destroy(); } }); this.objs = []; this.chooser = null; this.hintObj = null; this.qbox = null; }
  setPrompt(text, say) { this.s.setCard(text, { say: say || text, w: 700 }); }
  onKey(e) { if (!this.running || this.busy) return; const dg = /^(Digit|Numpad)([1-9])$/.exec(e.code || ''); if (dg && this.chooser) this.chooser.pick(+dg[2] - 1); }
  nextRound() {
    if (!this.alive || this.round >= this.p.rounds) return; const spec = this.p.kinds[this.round % this.p.kinds.length]; this.spec = spec; this.q = MKS.make(this.R, spec); this.curKind = this.q.kind;
    this.round++; this.wrong = 0; this.busy = false; this.clear(); this.beginRound(this.q, spec);
  }
  beginRound(q, spec) { this['r_' + q.kind](q, spec); }
  // จบรอบ: นับถูกหนึ่งข้อ แล้วรอให้เห็นผลก่อนขึ้นข้อถัดไป
  roundDone(x, y, wait) {
    this.busy = true; this.s.ok(x == null ? 660 : x, y == null ? 380 : y, { delay: 650 });
    this.s.time.delayedCall(wait || 950, () => { if (this.alive && !this.s.over) this.nextRound(); });
  }
  /* ---------- ชิ้นส่วนวาด ---------- */
  slotTex(w, h, solid) {
    return KG.tex(this.s, ['mkslot', w, h, solid ? 1 : 0].join('|'), w + 12, h + 12, c => {
      KG.ui.rrect(c, 6, 6, w, h, Math.min(22, h * 0.26)); c.fillStyle = solid ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.45)'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; if (!solid) c.setLineDash([10, 8]); c.stroke();
    });
  }
  mkTile(x, y, v, o) { const t = MKU.tile(this.s, x, y, typeof v === 'number' ? MKS.comma(v) : v, Object.assign({ depth: 12 }, o)); this.add(t); return t; }
  qBox(x, y, w, h) {
    const im = this.s.add.image(x, y, this.slotTex(w, h)).setDepth(8).setDisplaySize(w + 12, h + 12); this.add(im); const t = KG.txt(this.s, x, y, '?', { size: Math.round(h * 0.6), color: '#8a5cf0', center: true, middle: true }).setDepth(9); this.add(t);
    this.s.tweens.add({ targets: t, scale: 1.18, duration: 520, yoyo: true, repeat: -1 }); im.qt = t; this.qbox = im; return im;
  }
  popIn(list, delay) { list.forEach((o, i) => { const sx = o.scaleX, sy = o.scaleY; o.setScale(0); this.s.tweens.add({ targets: o, scaleX: sx, scaleY: sy, duration: 260, delay: (delay || 0) + i * 70, ease: 'Back.easeOut' }); }); }
  digW(n) { return Math.max(104, String(n).length * 36 + 48); }
  colorFor(i) { return MKU.TILE_COLORS[i % MKU.TILE_COLORS.length]; }
  txt(x, y, s, o) { const t = KG.txt(this.s, x, y, s, Object.assign({ center: true, middle: true, color: '#4a4780' }, o)).setDepth(9); this.add(t); return t; }
  /* ---------- โจทย์เลือกคำตอบ ---------- */
  choose(q, o) {
    o = Object.assign({ y: 520, w: 180, h: 100, size: 50, gap: 20 }, o); const s = this.s, opts = o.opts || q.opts, n = opts.length, tw = Math.max(...opts.map(v => String(v).length)); q.shown = opts;
    if (typeof opts[0] === 'number') o.w = Math.max(o.w, tw * 34 + 70); else if (o.autoW) o.w = Math.max(o.w, tw * 30 + 60);
    const maxW = 800, cols = o.cols || n; if (cols * o.w + (cols - 1) * o.gap > maxW) o.w = Math.floor((maxW - (cols - 1) * o.gap) / cols);
    this.chooser = this.add(MKU.choices(s, 660, o.y, opts, Object.assign({ fmt: v => (typeof v === 'number' ? MKS.comma(v) : String(v)), onPick: (v, i) => this.answer(v, i) }, o)));
    const ch = this.chooser; ch.setAlpha(0); s.tweens.add({ targets: ch, alpha: 1, duration: 260, delay: 200 }); return ch;
  }
  isRight(v) { return v === this.q.ans; }
  answer(v, i) {
    if (!this.running || this.busy) return; const s = this.s, ch = this.chooser, b = ch.btns[i], x = ch.x + b.x, y = ch.y + b.y;
    if (this.isRight(v)) { this.busy = true; ch.mark(i, true); ch.setEnabled(false); this.fillAnswer(); this.onRight(x, y); }
    else { this.wrong++; ch.mark(i, false); s.bad(x, y, this.wrongMsg(v)); this.onWrong(v); if (this.wrong >= 2) this.hintChoice(); }
  }
  onRight(x, y) { this.roundDone(x, y); }
  onWrong() { }
  wrongMsg() { return 'ลองอีกที'; }
  hintChoice() {
    const ch = this.chooser; if (!ch || this.hintObj) return; const i = this.q.shown.findIndex(v => this.isRight(v)), b = ch.btns[i]; if (!b) return; const r = this.s.add.image(ch.x + b.x, ch.y + b.y, 'fx_glow').setTint(0xffd34f).setDisplaySize(b.w * 1.6, b.h * 2).setDepth(7).setAlpha(0);
    this.hintObj = this.add(r); this.s.tweens.add({ targets: r, alpha: 0.9, duration: 380, yoyo: true, repeat: -1 }); this.s.hints++; this.s.coach.react('hint', this.hintText());
  }
  hintText() { return undefined; }
  fillAnswer() { const qb = this.qbox; if (!qb || this.ansText == null) return; const t = KG.txt(this.s, qb.x, qb.y, String(this.ansText), { size: 56, color: '#22b45a', center: true, middle: true }).setDepth(10); this.add(t); if (qb.qt) qb.qt.setVisible(false); t.setScale(0.2); this.s.tweens.add({ targets: t, scale: 1, duration: 260, ease: 'Back.easeOut' }); }
  update() { }
}
function mkRing(s, x, y, color) { KG.kit.ripple(s, x, y, color); KG.kit.stars(s, x, y, [color, 0xffffff, 0xffd34f], 8); }
