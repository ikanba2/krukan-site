/* ===== ด่านบอสรวมทักษะ (โลก 8): ไล่เล่นหลายรอบ แต่ละรอบเป็นตัวเกมย่อย (field · drag · path · scroll) ผ่านหนึ่งรอบ = บอสเสียพลังหนึ่งขีด =====
   BossEng เป็น 'host' ของตัวเกมย่อย: ส่งต่อ ok/bad/setCard ให้ฉากเล่น และรับ roundDone() เมื่อรอบนั้นจบ */
class BossEng {
  constructor(s, p) {
    this.s = s; this.p = p; this.rounds = p.rounds; this.ri = -1; this.sub = null; this.alive = true; this.running = false; this.hp = this.rounds.length;
    s.setGoal(0); s.starN = this.rounds.length * 4; s.field = { x1: 1090 };
    this.mkBoss(); this.drawHp();
  }
  mkBoss() {
    const s = this.s, k = 'boss_brain'; this.boss = s.add.image(1186, 196, k).setOrigin(0.5, 1).setDepth(9); this.boss.setScale(150 / this.boss.height);
    this.bx = this.boss.x; s.tweens.add({ targets: this.boss, y: this.boss.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.hpG = s.add.graphics().setDepth(10);
  }
  drawHp() { const g = this.hpG; g.clear(); const n = this.rounds.length, w = 150 / n; for (let i = 0; i < n; i++) { g.fillStyle(i < this.hp ? 0xff4d5e : 0xd8dff2, 1); g.fillRoundedRect(1112 + i * w, 206, w - 5, 16, 6); g.lineStyle(3, 0x2d2a5e, 1); g.strokeRoundedRect(1112 + i * w, 206, w - 5, 16, 6); } }
  /* ---------- ตัวแทนฉาก (host ของตัวเกมย่อย) ---------- */
  get R() { return this.s.R; }
  ok(x, y, o) { this.s.ok(x, y, o); }
  bad(x, y, m) { this.s.bad(x, y, m); }
  setCard(t, o) { o = o || {}; o.dx = -60; o.w = 700; this.s.setCard('รอบ ' + (this.ri + 1) + '/' + this.rounds.length + ' · ' + t, o); }
  start() { this.running = true; this.nextRound(); }
  stop() { this.running = false; if (this.sub && this.sub.stop) this.sub.stop(); }
  nextRound() {
    if (!this.alive || this.s.over) return; this.ri++; const s = this.s;
    if (this.sub) { try { this.sub.destroy(); } catch (e) { /* ไม่เป็นไร */ } this.sub = null; }
    if (this.ri >= this.rounds.length) { this.defeat(); return; }
    const r = this.rounds[this.ri], C = { field: FieldEng, drag: DragEng, path: PathEng, scroll: ScrollEng }[r[0]];
    KG.kit.banner(s, 'รอบที่ ' + (this.ri + 1), '#ffffff', 700); KG.audio.play('go');
    s.time.delayedCall(450, () => { if (!this.alive || s.over) return; this.sub = new C(s, r[1], this); this.sub.start(); });
  }
  roundDone() {
    const s = this.s; if (!this.alive || s.over) return; this.hp = Math.max(0, this.hp - 1); this.drawHp(); this.hit();
    s.time.delayedCall(900, () => this.nextRound());
  }
  hit() {
    const s = this.s, b = this.boss; KG.audio.play('hit'); KG.fx.shake(s, 160, 0.005); KG.fx.burst(s, b.x, b.y - 80, { colors: [0xff4d5e, 0xffd34f, 0xffffff], n: 24, max: 360, life: 600, depth: 62 }); KG.fx.ring(s, b.x, b.y - 80, 0xff4d5e, { size: 2.4, w: 0.5, depth: 61 });
    s.tweens.add({ targets: b, x: this.bx + 14, duration: 40, yoyo: true, repeat: 5, onComplete: () => b.setX(this.bx) }); s.tweens.add({ targets: b, alpha: 0.4, duration: 60, yoyo: true, repeat: 3, onComplete: () => b.setAlpha(1) });
    s.coach.react('good');
  }
  defeat() {
    const s = this.s, b = this.boss; this.running = false; KG.audio.play('kill'); KG.fx.flash(s, 0xffffff, 200); K_boomRing(s, b.x, b.y - 80);
    s.tweens.add({ targets: b, angle: 540, scaleX: 0.01, scaleY: 0.01, alpha: 0, duration: 800, ease: 'Cubic.easeIn' }); s.time.delayedCall(700, () => s.win());
  }
  update(t, dt) { if (this.sub && this.sub.update) this.sub.update(t, dt); }
  destroy() { this.alive = false; if (this.sub) { try { this.sub.destroy(); } catch (e) { /* ไม่เป็นไร */ } } [this.boss, this.hpG].forEach(o => { if (o && o.destroy) o.destroy(); }); }
}
