/* ===== ฉากเล่น ภารกิจถอดรหัสเลขโรมัน: ฐานกลาง KG.mk.BossPlay ตัวเกมคือ RomanEng ===== */
class PlayScene extends KG.mk.BossPlay {
  build() {
    this.bossImg = null; if (this.L.boss) this.mkBoss();
    this.eng = new RomanEng(this, this.L.p);
    KG.kit.cursorTrail(this);
  }
  // ด่านประกอบเลขโรมันใช้ปุ่มตัวอักษรบนคีย์บอร์ด (ไม่มีปุ่มลัดพักเกม P)
  onKeyBase(e) { if (e.code === 'KeyP' && !(this.eng && this.eng.mode === 'build')) this.pause(); }
}
PlayScene.looks = ['bot_puzzle', 'bot_click', 'boss_brain', 'bot_code', 'bot_puzzle', 'boss_brain', 'bot_repair', 'boss_brain'];
