/* ===== ฉากเล่น เรียงลำดับตัวเลข: ฐานกลาง KG.mk.BossPlay (นับถอยหลัง ดาว บอส สรุปผล พักเกม) ตัวเกมคือ SortEng ===== */
class PlayScene extends KG.mk.BossPlay {
  build() {
    this.bossImg = null; if (this.L.boss) this.mkBoss();
    this.eng = new SortEng(this, this.L.p);
    KG.kit.cursorTrail(this);
  }
}
PlayScene.looks = ['bot_puzzle', 'bot_click', 'boss_brain', 'bot_code', 'bot_puzzle', 'boss_brain', 'bot_repair', 'boss_brain'];
