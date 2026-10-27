/* ===== ฉากเล่น ภารกิจแป้นพิมพ์: ใช้ฐานกลาง KG.kit.PlayBase (นับถอยหลัง ดาว สรุปผล พักเกม) ตัวเกมคือ KeyEng (หลายรอบ รับปุ่มจากคีย์บอร์ดจริง) ===== */
const BOSS_LOOK = ['bot_click', 'bot_code', 'boss_brain', 'bot_code', 'bot_repair', 'bot_puzzle', 'bot_code', 'boss_brain'];
class PlayScene extends KG.kit.PlayBase {
  build() {
    const L = this.L; this.bossImg = null;
    if (L.boss) this.mkBoss();
    this.eng = new KeyEng(this, L.p);
    KG.kit.cursorTrail(this);
  }
  // ตัวอักษร P กับ Esc เป็นปุ่มที่ใช้เล่นในเกมนี้ จึงไม่ใช้ P พักเกม และ Esc พักเกมเฉพาะตอนโจทย์ไม่ต้องใช้ Esc
  onKeyBase() { }
  onEscape() { if (this.eng && this.eng.wantsEsc && this.eng.wantsEsc() && !(this._modal && !this._modal.closed)) return; super.onEscape(); }
  mkBoss() {
    const s = this, k = BOSS_LOOK[this.wi % BOSS_LOOK.length];
    this.bossImg = s.add.image(1190, 226, k).setOrigin(0.5, 1).setDepth(9); this.bossImg.setScale(140 / this.bossImg.height); this.bossX = this.bossImg.x;
    s.tweens.add({ targets: this.bossImg, y: this.bossImg.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.bossHp = s.add.graphics().setDepth(10); this.drawBossHp(1);
  }
  drawBossHp(f) { const g = this.bossHp; g.clear(); g.fillStyle(0xd8dff2, 1); g.fillRoundedRect(1118, 234, 144, 16, 6); g.fillStyle(0xff4d5e, 1); g.fillRoundedRect(1118, 234, Math.max(0, 144 * f), 16, 6); g.lineStyle(3, 0x2d2a5e, 1); g.strokeRoundedRect(1118, 234, 144, 16, 6); }
  ok(x, y, o) {
    super.ok(x, y, o);
    if (this.bossImg && this.goal) { this.drawBossHp(Math.max(0, 1 - this.done / this.goal)); const b = this.bossImg; this.tweens.add({ targets: b, x: this.bossX + 10, duration: 40, yoyo: true, repeat: 2, onComplete: () => b.setX(this.bossX) }); }
  }
  win() {
    if (this.bossImg && !this.over) { const b = this.bossImg; KG.audio.play('kill'); KG.kit.ripple(this, b.x, b.y - 70, 0xffd34f); this.tweens.add({ targets: b, angle: 540, scaleX: 0.01, scaleY: 0.01, alpha: 0, duration: 700 }); }
    super.win();
  }
  starsFor() { const m = this.mist, g = Math.max(4, this.goal || 5); return m <= Math.floor(g * 0.25) ? 3 : m <= Math.floor(g * 0.7) ? 2 : 1; }
}
