/* ===== ฉากเล่น คิดเลขแสนสนุก: ฐานกลาง KG.mk.BossPlay ตัวเกมคือ ColEng ===== */
class PlayScene extends KG.mk.BossPlay {
  build() {
    this.bossImg = null; if (this.L.boss) this.mkBoss();
    this.eng = new ColEng(this, this.L.p);
    KG.kit.cursorTrail(this);
  }
  // ด่านตั้งแนวตั้งใช้ปุ่มตัวเลข/Enter ของคีย์บอร์ด จึงไม่ใช้ปุ่ม P พักเกม (พักด้วยปุ่มหยุดมุมซ้ายบนหรือ Esc)
  onKeyBase() { }
  starsFor() { const m = this.mist + Math.floor(this.hints / 2), g = Math.max(4, this.goal || 5); return m <= Math.floor(g * 0.3) ? 3 : m <= Math.floor(g * 0.9) ? 2 : 1; }
}
PlayScene.looks = ['bot_puzzle', 'bot_click', 'boss_brain', 'bot_code', 'bot_puzzle', 'boss_brain', 'bot_repair', 'boss_brain'];
