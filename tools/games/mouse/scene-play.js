/* ===== ฉากเล่น ผจญภัยเมาส์: ใช้ฐานกลาง KG.kit.PlayBase (นับถอยหลัง ดาว สรุปผล พักเกม) แล้วเลือกตัวเกมตามชนิดของด่าน ===== */
const ENG = { field: FieldEng, drag: DragEng, path: PathEng, scroll: ScrollEng, boss: BossEng };
const BOSS_LOOK = ['storm', 'bot_click', 'bot_repair', 'bot_code', 'bot_puzzle', 'bot_repair', 'bot_click', 'boss_brain'];
class PlayScene extends KG.kit.PlayBase {
  build() {
    const L = this.L; this.field = null;
    if (L.boss && L.k !== 'boss') this.mkBoss();
    this.eng = new ENG[L.k](this, L.p);
    KG.kit.cursorTrail(this);
  }
  mkBoss() {
    const s = this, k = BOSS_LOOK[this.wi % 8], isStorm = k === 'storm'; this.field = { x1: 1090 };
    this.bossImg = s.add.image(1186, 222, isStorm ? MA.storm(s, 130) : k).setOrigin(0.5, 1).setDepth(9); if (isStorm) this.bossImg.setDisplaySize(182, 169); else this.bossImg.setScale(150 / this.bossImg.height);
    this.bossX = this.bossImg.x; s.tweens.add({ targets: this.bossImg, y: this.bossImg.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.bossHp = s.add.graphics().setDepth(10); this.drawBossHp(1);
  }
  drawBossHp(f) { const g = this.bossHp; g.clear(); g.fillStyle(0xd8dff2, 1); g.fillRoundedRect(1112, 230, 150, 16, 6); g.fillStyle(0xff4d5e, 1); g.fillRoundedRect(1112, 230, Math.max(0, 150 * f), 16, 6); g.lineStyle(3, 0x2d2a5e, 1); g.strokeRoundedRect(1112, 230, 150, 16, 6); }
  ok(x, y, o) {
    super.ok(x, y, o);
    if (this.bossImg && this.goal) { this.drawBossHp(Math.max(0, 1 - this.done / this.goal)); const b = this.bossImg; this.tweens.add({ targets: b, x: this.bossX + 10, duration: 40, yoyo: true, repeat: 2, onComplete: () => b.setX(this.bossX) }); }
  }
  win() {
    if (this.bossImg && !this.over) { const b = this.bossImg; KG.audio.play('kill'); K_boomRing(this, b.x, b.y - 70); this.tweens.add({ targets: b, angle: 540, scaleX: 0.01, scaleY: 0.01, alpha: 0, duration: 700 }); }
    super.win();
  }
  starsFor() { const m = this.mist, g = Math.max(4, this.starN || this.goal || 6); return m <= Math.floor(g * 0.12) ? 3 : m <= Math.floor(g * 0.4) ? 2 : 1; }
}
