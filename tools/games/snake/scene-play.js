/* ===== ฉากเล่น บันไดงูบวกลบเลข: ฐานกลาง KG.mk.BossPlay ตัวเกมคือ SnakeEng (กระดาน ผู้เล่น ลูกเต๋า) =====
   ด่านบอส: บอสเป็นคู่แข่งบนกระดาน แถบพลังบอสลดลงตามที่ผู้เล่นเดินไปใกล้เส้นชัย · โลกเล่นกับเพื่อนไม่มีบอสและได้ 3 ดาวเมื่อเล่นจบ */
class PlayScene extends KG.mk.BossPlay {
  build() {
    this.bossImg = null; if (this.L.boss && !(this.L.p.humans > 1)) this.mkBoss();
    this.eng = new SnakeEng(this, this.L.p);
    KG.kit.cursorTrail(this);
  }
  onKeyBase() { }
  starsFor() { if (this.L.p.humans > 1) return 3; const m = this.mist; return m <= 1 ? 3 : m <= 4 ? 2 : 1; }
  resultRows() { const e = this.eng, st = e.stats, secs = Math.round((this.time.now - this.t0) / 1000); return [['ตอบถูก', st.right], ['ตอบผิด', st.wrong], ['ทอยเต๋า', st.rolls + ' ครั้ง'], ['ขึ้นบันได', st.ladders + ' ครั้ง'], ['ตกงู', st.snakes + ' ครั้ง'], ['เวลา', secs + ' วินาที']]; }
}
PlayScene.looks = ['bot_puzzle', 'bot_click', 'boss_brain', 'bot_code', 'bot_puzzle', 'boss_brain', 'bot_repair', 'boss_brain'];
