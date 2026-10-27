/* ===== หน้าแรก ===== */
class TitleScene extends KG.Scene {
  constructor() { super('Title'); }
  onEscape() { if (this._modal && !this._modal.closed) this._modal.close(); }
  create() {
    this.setup();
    KG.audio.music('menu');
    const C = KG.C;
    // พื้นหลังฉากสนามรบ ซูมช้า ๆ
    const bg = this.add.image(GW / 2, GH / 2, 'arena_thunder').setDisplaySize(GW * 1.08, GH * 1.08);
    this.tweens.add({ targets: bg, scaleX: bg.scaleX * 1.05, scaleY: bg.scaleY * 1.05, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const shade = KG.tex(this, 'titleshade', GW, GH, ctx => {
      ctx.fillStyle = KG.ui.lin(ctx, 0, 0, GW, 0, [[0, 'rgba(4,6,24,.94)'], [0.45, 'rgba(4,6,24,.72)'], [1, 'rgba(4,6,24,.38)']]); ctx.fillRect(0, 0, GW, GH);
      ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(4,6,24,.55)'], [0.35, 'rgba(4,6,24,0)'], [0.75, 'rgba(4,6,24,0)'], [1, 'rgba(4,6,24,.8)']]); ctx.fillRect(0, 0, GW, GH);
    });
    this.add.image(GW / 2, GH / 2, shade).setDisplaySize(GW, GH);
    KG.fx.ambient(this, { freq: 140 });

    // ฮีโร่ + แสงด้านหลัง
    const glow = this.add.image(330, 380, 'fx_glow').setTint(0xff3d8b).setBlendMode('ADD').setAlpha(0).setDisplaySize(820, 820);
    const ground = this.add.ellipse(330, 668, 360, 40, 0x000000, 0.45);
    const hero = this.add.image(330, 690, KG.hasTitlePose(this) ? 'title_pose' : 'title_techno').setOrigin(0.5, 1);   // ไรเดอร์ท่าประจำเกม ไม่ถือดาบ (title_pose)
    hero.setScale(Math.min(560 / hero.height, 470 / hero.width));
    const hx = hero.scaleX, hy = hero.scaleY;
    hero.setAlpha(0).x = 130; ground.setAlpha(0);
    this.tweens.add({ targets: hero, x: 330, alpha: 1, duration: 800, ease: 'Cubic.easeOut', delay: 150 });
    this.tweens.add({ targets: [glow, ground], alpha: { from: 0, to: 1 }, duration: 900, delay: 300 });
    this.tweens.add({ targets: hero, scaleY: hy * 1.018, scaleX: hx * 0.992, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1000 });
    this.tweens.add({ targets: glow, scaleX: glow.scaleX * 1.08, scaleY: glow.scaleY * 1.08, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    hero.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      KG.audio.play('star'); KG.fx.burst(this, 330, 360, { colors: [0xff3d8b, 0xffffff, 0xffd34f], n: 22, max: 360, depth: 40 });
      KG.fx.ring(this, 330, 400, C.pink, { size: 3.5, w: 0.6 });
      this.tweens.add({ targets: hero, y: 672, duration: 90, yoyo: true });
    });

    // โลโก้
    const logo = KG.ui.logo(this, 600, 24, [
      { t: 'TYPE', grad: [[0, '#ffffff'], [1, '#b9c6ff']], glow: '#6f8cff', deep: '#15123f' },
      { t: 'HERO', grad: [[0, '#fff3b0'], [1, '#ffb000']], glow: '#ffd34f', deep: '#3a2a00' }
    ], { size: 104, w: 660 });
    logo.setAlpha(0).y -= 90;
    this.tweens.add({ targets: logo, y: logo.y + 90, alpha: 1, duration: 650, ease: 'Bounce.easeOut', delay: 350, onComplete: () => { KG.fx.flash(this, 0xffffff, 120); KG.audio.play('go'); KG.fx.shake(this, 160, 0.004); } });
    const sub = this.txt(612, 262, 'ฝึกพิมพ์ไทย-อังกฤษ จังหวะมันส์', { size: 34, color: '#4ef4d2', stroke: true, shadow: 2 });
    const tag = this.txt(612, 306, 'พิมพ์ตามคำที่ขึ้นมา กด Enter ยืนยัน สะสมคอมโบให้ไฟลุก', { size: 22, weight: 400, color: '#cdd7f2', width: 560, stroke: true });
    [sub, tag].forEach((t, i) => { t.setAlpha(0).x += 40; this.tweens.add({ targets: t, x: t.x - 40, alpha: 1, duration: 500, delay: 800 + i * 120, ease: 'Cubic.easeOut' }); });

    // ปุ่มเมนู
    const play = new KG.ui.Button(this, 900, 420, 400, 80, { label: (totalStars() ? 'เล่นต่อ' : 'เริ่มเล่น') + ' (Enter)', icon: 'play', style: 'primary', size: 32, onClick: () => this.go(totalStars() ? 'Select' : 'Play', { level: 1, lang: SAVE.data.lang, mode: SAVE.data.mode, tutor: true }) });
    const course = new KG.ui.Button(this, 900, 504, 400, 66, { label: 'หัดพิมพ์สัมผัส (C)', icon: 'key', style: 'violet', size: 28, onClick: () => this.go('Course') });
    const sel = new KG.ui.Button(this, 900, 580, 400, 58, { label: 'เลือกภาษาและด่าน (S)', icon: 'flag', style: 'cyan', size: 24, onClick: () => this.go('Select') });
    const how = new KG.ui.Button(this, 900, 648, 400, 52, { label: 'วิธีเล่น (H)', icon: 'help', style: 'ghost', size: 22, onClick: () => showHowTo(this) });
    const newTag = this.txt(1082, 474, 'ใหม่', { size: 14, color: '#2a1c00' }).setBackgroundColor('#ffd34f').setPadding(6, 1, 6, 1).setDepth(40).setAlpha(0); this.time.delayedCall(1500, () => newTag.setAlpha(1));
    [play, course, sel, how].forEach((b, i) => { b.setAlpha(0).x += 360; this.tweens.add({ targets: b, x: b.x - 360, alpha: 1, duration: 520, delay: 1000 + i * 110, ease: 'Back.easeOut' }); });
    this.time.delayedCall(1700, () => play.pulse());
    // คีย์ลัดหน้าแรก (บอกไว้ในวงเล็บบนปุ่ม): Enter เล่น · C หัดพิมพ์สัมผัส · S เลือกด่าน · H วิธีเล่น · F เต็มจอ
    const goPlay = () => this.go(totalStars() ? 'Select' : 'Play', { level: 1, lang: SAVE.data.lang, mode: SAVE.data.mode, tutor: true });
    this.input.keyboard.on('keydown', e => {
      if (e.repeat) return; const c = e.code;
      if (this._modal && !this._modal.closed) { if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') this._modal.close(); return; }
      if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') goPlay(); else if (c === 'KeyC') this.go('Course'); else if (c === 'KeyS') this.go('Select');
      else if (c === 'KeyH') showHowTo(this); else if (c === 'KeyF') KG.fullscreen();
    });

    const sys = addSystemButtons(this, 1060, 52);
    sys.forEach((b, i) => { b.setAlpha(0); this.tweens.add({ targets: b, alpha: b.alpha || 1, duration: 400, delay: 1300 + i * 80 }); });

    // ดาวรวมและเครดิต
    this.time.delayedCall(1500, () => promptFullscreen(this, () => askPlayerOnce(this)));
    addPlayerChip(this, 246, 44).setDepth(5);
    const stars = this.txt(36, 676, 'ดาวสะสม ' + totalStars() + ' / ' + maxStars(), { size: 22, color: '#ffd34f', stroke: true });
    this.txt(GW - 36, 686, 'KruKan.in.th · ฝึกพิมพ์', { size: 18, weight: 400, color: '#9fb0d8', ox: 1 });
    stars.setAlpha(0); this.tweens.add({ targets: stars, alpha: 1, delay: 1500, duration: 400 });
  }
}

function showHowTo(scene) {
  KG.ui.modal(scene, {
    title: 'วิธีเล่น', w: 940, accent: KG.C.cyan,
    body: '1. คำจะขึ้นกลางจอ ให้พิมพ์ตามทีละตัวอักษร ตัวที่ถูกจะเรืองแสง ปุ่มที่ต้องกดต่อไปจะเรืองบนแป้นพิมพ์\n2. พิมพ์ถูกทั้งคำแล้ว ปุ่ม ENTER จะกะพริบสีเขียว กด Enter เพื่อยืนยันและไปคำถัดไป\n3. พิมพ์ผิดกด Backspace ลบ ตัวพิมพ์ใหญ่หรืออักษรบนปุ่ม Shift ให้กด Shift ค้างไว้\n4. พิมพ์ถูกต่อเนื่องไม่พลาดเลยจะได้คอมโบ ยิ่งสูงยิ่งได้คะแนนคูณ และฉากจะลุกเป็นไฟ\n5. เลือกภาษาไทยหรืออังกฤษได้ที่หน้าเลือกด่าน และก่อนเริ่มทุกด่านเลือกโหมดจับเวลาหรือไม่จับเวลา ด่านต่ำพิมพ์น้อย ด่านสูงพิมพ์มากขึ้น',
    buttons: [{ label: 'เล่นบทสอน', style: 'cyan', icon: 'play', onClick: () => scene.go('Play', { level: 1, lang: SAVE.data.lang, mode: SAVE.data.mode, tutor: true }) }, { label: 'เข้าใจแล้ว', style: 'primary', icon: 'check', pulse: true }]
  });
}
