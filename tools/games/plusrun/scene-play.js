/* ===== ฉากเล่น สมบัติพลังบวก: ฐานกลาง KG.mk.BossPlay ตัวเกมคือ RunEng (วิ่งกระโดด ประตูโจทย์ หีบสมบัติ) =====
   ดาวคิดจากหัวใจที่เสียไป (หลุม หนาม เจ้าตัวเมือก และเก็บลูกพลังผิด) · ด่านบอส: แถบพลังบอสลดลงทุกครั้งที่ผ่านประตู */
class PlayScene extends KG.mk.BossPlay {
  build() {
    this.bossImg = null; if (this.L.boss) this.mkBoss();
    this.eng = new RunEng(this, this.L.p);
    KG.kit.cursorTrail(this);
  }
  starsFor() { const e = this.eng, lost = e.maxHearts - e.hearts, f = lost / e.maxHearts; return f <= 0.21 ? 3 : f <= 0.61 ? 2 : 1; }
  resultRows() { const e = this.eng, st = e.stats, secs = Math.round((this.time.now - this.t0) / 1000); return [['ผ่านประตู', e.cleared + ' / ' + e.gates.length], ['เก็บลูกพลังผิด', st.wrong], ['เหยียบเจ้าตัวเมือก', st.stomps], ['เก็บเหรียญบวก', st.coins], ['หัวใจที่เหลือ', e.hearts + ' / ' + e.maxHearts], ['เวลา', secs + ' วินาที']]; }
}
PlayScene.looks = ['bot_puzzle', 'bot_click', 'boss_brain', 'bot_code', 'bot_puzzle', 'boss_brain', 'bot_repair', 'boss_brain'];
