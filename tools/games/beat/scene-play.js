/* ===== ฉากเล่น จอมจังหวะ: ใช้ฐานกลาง KG.kit.PlayBase (นับถอยหลัง ดาว สรุปผล พักเกม) ตัวเกมคือ BeatEng (เพลงจังหวะ) ===== */
const BOSS_LOOK = ['bot_click', 'bot_puzzle', 'bot_code', 'bot_repair', 'boss_brain', 'bot_click', 'bot_puzzle', 'boss_brain'];
const PASS_ACC = 0.35;
class PlayScene extends KG.kit.PlayBase {
  create() {
    super.create(); const A = KG.audio; A.music('');   // เพลงประกอบของเกมสร้างเองใน BeatEng จึงปิดเพลงพื้นหลังกลางของเกม
    this._setMusic = A.setMusic; A.setMusic = on => { A.musOn = on; if (!on) A.stopMusic(); };   // เปิดเพลงด้วยปุ่มบนจอระหว่างเล่นต้องไม่เรียกเพลงเมนูมาทับ
    this.events.once('shutdown', () => { A.setMusic = this._setMusic; });
  }
  build() {
    const L = this.L; this.bossImg = null; this.acc = 0;
    if (L.boss) this.mkBoss();
    this.eng = new BeatEng(this, L.p);
    KG.kit.cursorTrail(this);
  }
  mkBoss() {
    const s = this, k = BOSS_LOOK[this.wi % BOSS_LOOK.length];
    this.bossImg = s.add.image(1190, 226, k).setOrigin(0.5, 1).setDepth(9); this.bossImg.setScale(140 / this.bossImg.height); this.bossX = this.bossImg.x;
    s.tweens.add({ targets: this.bossImg, y: this.bossImg.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.bossHp = s.add.graphics().setDepth(10); this.drawBossHp(1);
  }
  drawBossHp(f) { const g = this.bossHp; g.clear(); g.fillStyle(0xd8dff2, 1); g.fillRoundedRect(1118, 234, 144, 16, 6); g.fillStyle(0xff4d5e, 1); g.fillRoundedRect(1118, 234, Math.max(0, 144 * f), 16, 6); g.lineStyle(3, 0x2d2a5e, 1); g.strokeRoundedRect(1118, 234, 144, 16, 6); }
  onHit(e) {
    if (!this.bossImg) return; this.drawBossHp(Math.max(0, 1 - e.hits / Math.max(1, e.total))); const b = this.bossImg; this.tweens.add({ targets: b, x: this.bossX + 8, duration: 40, yoyo: true, repeat: 2, onComplete: () => b.setX(this.bossX) });
  }
  // จบเพลง: ผ่านเมื่อแม่นยำถึงเกณฑ์ ดาวตามความแม่นยำ
  finishSong(e) {
    this.acc = e.acc; this.mist = e.stats.miss; this.score = e.score; this.bestCombo = e.best;
    if (e.acc < PASS_ACC) this.lose('เกือบได้แล้ว ฟังจังหวะแล้วลองใหม่นะ'); else this.win();
  }
  win() {
    if (this.bossImg && !this.over) { const b = this.bossImg; KG.audio.play('kill'); KG.kit.ripple(this, b.x, b.y - 70, 0xffd34f); this.tweens.add({ targets: b, angle: 540, scaleX: 0.01, scaleY: 0.01, alpha: 0, duration: 700 }); }
    super.win();
  }
  starsFor() { const a = this.acc; return a >= 0.9 ? 3 : a >= 0.75 ? 2 : 1; }
  resultRows() { const st = this.eng.stats; return [['ความแม่นยำ', Math.round(this.acc * 100) + '%'], ['เป๊ะเลย', st.perfect], ['ดีมาก', st.great], ['โอเค', st.ok], ['พลาด', st.miss], ['คอมโบสูงสุด', this.eng.best], ['คะแนน', this.score]]; }
}
