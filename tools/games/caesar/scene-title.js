/* ===== หน้าแรก Cipher Breaker ===== */
function matrixRain(scene, color, alpha, depth) {
  const cols = 26, g = [];
  for (let i = 0; i < cols; i++) {
    const chars = Array.from({ length: 14 }, () => LET[Math.floor(Math.random() * 26)]).join('\n');
    const t = KG.txt(scene, 24 + i * 50, -500, chars, { size: 24, color: color || '#4ef4d2', center: true, ox: 0.5, weight: 600, lineSpacing: 8 }).setAlpha(alpha || 0.16).setDepth(depth == null ? 1 : depth);
    t.y = -Phaser.Math.Between(300, 900);
    scene.tweens.add({ targets: t, y: GH + 200, duration: Phaser.Math.Between(9000, 17000), repeat: -1, delay: Phaser.Math.Between(0, 8000), onRepeat: () => { t.y = -520; t.setText(Array.from({ length: 14 }, () => LET[Math.floor(Math.random() * 26)]).join('\n')); } });
    g.push(t);
  }
  return g;
}

function showHowTo(scene) {
  KG.ui.modal(scene, {
    title: 'วิธีเล่น', w: 900, accent: KG.C.cyan,
    body: '1. วงล้อชั้นนอกคือตัวอักษรในรหัส วงในสีชมพูคือตัวอักษรจริง ลากวงในหรือกดลูกศรเพื่อหมุน\n2. ตัวเลขกุญแจคือจำนวนตำแหน่งที่เลื่อน กุญแจ 3 แปลว่า A ในข้อความจริงกลายเป็น D ในรหัส\n3. แถวล่างของกระดานแสดงข้อความที่ถอดได้ตามกุญแจตอนนี้ เมื่ออ่านออกให้กดยืนยัน\n4. ยืนยันผิดจะเสียพลังชีวิต ใช้เบาะแสและเครื่องมือวิเคราะห์ช่วยได้\n5. ผ่านภารกิจครบแต่ละ SECTOR แล้วลงสนามป้องกัน พิมพ์ถอดรหัสศัตรูแบบเรียลไทม์',
    buttons: [{ label: 'เล่นบทสอน', style: 'cyan', icon: 'play', onClick: () => scene.go('Mission', { i: 0, tutor: true }) }, { label: 'เข้าใจแล้ว', style: 'primary', icon: 'check', pulse: true }]
  });
}

class TitleScene extends KG.Scene {
  constructor() { super('Title'); }
  create() {
    this.setup(); KG.audio.music('menu');
    const bg = this.add.image(GW / 2, GH / 2, 'arena_ice').setDisplaySize(GW * 1.08, GH * 1.08);
    this.tweens.add({ targets: bg, scaleX: bg.scaleX * 1.05, scaleY: bg.scaleY * 1.05, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'ctitleshade', GW, GH, ctx => {
      ctx.fillStyle = KG.ui.lin(ctx, 0, 0, GW, 0, [[0, 'rgba(3,8,30,.94)'], [0.5, 'rgba(3,8,30,.74)'], [1, 'rgba(3,8,30,.5)']]); ctx.fillRect(0, 0, GW, GH);
      ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(3,8,30,.5)'], [0.4, 'rgba(3,8,30,0)'], [0.8, 'rgba(3,8,30,0)'], [1, 'rgba(3,8,30,.8)']]); ctx.fillRect(0, 0, GW, GH);
    })).setDisplaySize(GW, GH);
    matrixRain(this, '#4ef4d2', 0.2, 1);
    KG.fx.ambient(this, { freq: 160, colors: [0x4ef4d2, 0xffffff, 0xffd34f] });

    const glow = this.add.image(330, 380, 'fx_glow').setTint(0x4ef4d2).setBlendMode('ADD').setAlpha(0).setDisplaySize(800, 800);
    const ground = this.add.ellipse(330, 668, 360, 40, 0x000000, 0.45).setAlpha(0);
    const hero = this.add.image(330, 690, KG.hasTitlePose(this) ? 'title_pose' : 'title_techno').setOrigin(0.5, 1);   // ไรเดอร์ท่าประจำเกม ไม่ถือดาบ (title_pose) hero.setScale(Math.min(560 / hero.height, 470 / hero.width));
    const hx = hero.scaleX, hy = hero.scaleY; hero.setAlpha(0).x = 130;
    this.tweens.add({ targets: hero, x: 330, alpha: 1, duration: 800, ease: 'Cubic.easeOut', delay: 150 });
    this.tweens.add({ targets: [glow, ground], alpha: 1, duration: 900, delay: 300 });
    this.tweens.add({ targets: hero, scaleY: hy * 1.018, scaleX: hx * 0.992, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1000 });
    hero.setInteractive({ useHandCursor: true }).on('pointerdown', () => { KG.audio.play('star'); KG.fx.burst(this, 330, 360, { colors: [0x4ef4d2, 0xffffff, 0xffd34f], n: 22, max: 360, depth: 40 }); KG.fx.ring(this, 330, 400, KG.C.cyan, { size: 3.5, w: 0.6 }); });

    const logo = KG.ui.logo(this, 600, 24, [
      { t: 'CIPHER', grad: [[0, '#ffffff'], [1, '#bff7ff']], glow: '#4ef4d2', deep: '#0a2a44' },
      { t: 'BREAKER', grad: [[0, '#fff3b0'], [1, '#ffb000']], glow: '#ffd34f', deep: '#3a2a00' }
    ], { size: 100, w: 680 });
    logo.setAlpha(0).y -= 90;
    this.tweens.add({ targets: logo, y: logo.y + 90, alpha: 1, duration: 650, ease: 'Bounce.easeOut', delay: 350, onComplete: () => { KG.fx.flash(this, 0xffffff, 120); KG.audio.play('go'); KG.fx.shake(this, 160, 0.004); } });
    const sub = this.txt(612, 262, 'ปฏิบัติการแกะรหัสซีซาร์', { size: 34, color: '#ffd34f', stroke: true, shadow: 2 });
    const tag = this.txt(612, 306, 'หมุนวงล้อ ถอดรหัสศัตรู แล้วลงสนามป้องกันเพื่อพิมพ์ถอดรหัสให้ทัน', { size: 22, weight: 400, color: '#cdd7f2', width: 560, stroke: true });
    [sub, tag].forEach((t, i) => { t.setAlpha(0).x += 40; this.tweens.add({ targets: t, x: t.x - 40, alpha: 1, duration: 500, delay: 800 + i * 120, ease: 'Cubic.easeOut' }); });

    const play = new KG.ui.Button(this, 900, 436, 400, 88, { label: SAVE.data.stars[0] ? 'เล่นต่อ' : 'เริ่มภารกิจ', icon: 'play', style: 'primary', size: 36, onClick: () => this.go('Mission', { i: nextMission() }) });
    const sel = new KG.ui.Button(this, 900, 536, 400, 68, { label: 'เลือกด่านและสนามป้องกัน', icon: 'flag', style: 'cyan', size: 27, onClick: () => this.go('Select') });
    const how = new KG.ui.Button(this, 900, 614, 400, 60, { label: 'วิธีเล่น', icon: 'help', style: 'ghost', size: 26, onClick: () => showHowTo(this) });
    [play, sel, how].forEach((b, i) => { b.setAlpha(0).x += 360; this.tweens.add({ targets: b, x: b.x - 360, alpha: 1, duration: 520, delay: 1000 + i * 110, ease: 'Back.easeOut' }); });
    this.time.delayedCall(1700, () => play.pulse());
    const sys = addSystemButtons(this, 1060, 52); sys.forEach((b, i) => { b.setAlpha(0); this.tweens.add({ targets: b, alpha: b.alpha || 1, duration: 400, delay: 1300 + i * 80 }); });
    this.time.delayedCall(1500, () => promptFullscreen(this, () => askPlayerOnce(this)));
    addPlayerChip(this, 246, 44).setDepth(5);
    const stars = this.txt(36, 676, 'ดาวสะสม ' + totalStars() + ' / ' + maxStars(), { size: 22, color: '#ffd34f', stroke: true }); stars.setAlpha(0); this.tweens.add({ targets: stars, alpha: 1, delay: 1500, duration: 400 });
    this.txt(GW - 36, 686, 'KruKan.in.th · วิทยาการคำนวณ', { size: 18, weight: 400, color: '#9fb0d8', ox: 1 });
  }
}
