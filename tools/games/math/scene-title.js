/* ===== หน้าแรก Techno Math: โลโก้ ไรเดอร์เผชิญหน้าบอส สัญลักษณ์คณิตลอย ปุ่มเริ่ม คีย์ลัด (Enter เริ่ม · S คิดเลขเร็ว · K คีย์ลัด · H วิธีเล่น) ===== */
class TitleScene extends KG.Scene {
  constructor() { super('Title'); }
  create() {
    this._modal = null; this.setup('#060a1e'); KG.audio.music('menu');
    const bg = this.add.image(GW / 2, GH / 2, 'arena_thunder').setDisplaySize(GW * 1.1, GH * 1.1);
    this.tweens.add({ targets: bg, scaleX: bg.scaleX * 1.05, scaleY: bg.scaleY * 1.05, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const sh = this.add.graphics(); sh.fillGradientStyle(0x050818, 0x050818, 0x050818, 0x050818, 0.35, 0.35, 0.92, 0.92); sh.fillRect(0, 0, GW, GH);
    const g = this.add.graphics(); g.lineStyle(1, 0x4ef4d2, 0.08); for (let x = 0; x < GW; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, GH); g.strokePath(); }
    // สัญลักษณ์คณิตลอยขึ้น
    const SYM = ['+', '−', '×', '÷', '=', '½', '0.5', '7', '3', '9', '<', '>', '¾', '100'];
    for (let i = 0; i < 18; i++) {
      const t = this.add.text(KG.rnd(40, GW - 40), KG.rnd(80, GH), KG.pick(SYM), { fontFamily: MFONT, fontSize: Math.round(KG.rnd(28, 70)) + 'px', fontStyle: '600', color: KG.pick(['#4ef4d2', '#ffd34f', '#ff3d8b', '#a78bfa']), resolution: KG.K }).setOrigin(0.5).setAlpha(KG.rnd(0.12, 0.3)).setAngle(KG.rnd(-20, 20));
      this.tweens.add({ targets: t, y: t.y - KG.rnd(120, 260), angle: t.angle + KG.rnd(-30, 30), duration: KG.rnd(6000, 11000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    KG.fx.ambient(this, { freq: 180, colors: [0x4ef4d2, 0xffd34f, 0xff3d8b], s: 0.4, alpha: 0.7 });
    // ไรเดอร์ (ซ้าย) กับบอส (ขวา)
    const b = KG.art.make(this, 1080, 690, 'c15', 3, 250).setFlipX(true).setAlpha(0); b.x = 1240;
    const flinch = () => { KG.art.frame(b, 5); this.time.delayedCall(320, () => KG.art.frame(b, 3)); };
    // ไรเดอร์ท่าประจำเกม (ไม่ถือดาบ) ถ้าไม่มีภาพใช้ไรเดอร์ร่างต่อสู้แบบเดิม
    const pose = KG.titlePose(this, 230, 696, { h: 400, w: 330, shadow: 0.45, colors: [0x4ef4d2, 0xffd34f, 0xffffff], onTap: flinch });
    if (!pose) {
      const rider = this.rider = new KG.Rider(this, 220, 690, { forms: ['r0', 'r1', 'r2', 'r3'], form: 0, bodyH: 300 });
      rider.img.setAlpha(0).x = 40; this.tweens.add({ targets: rider.img, x: 220, alpha: 1, duration: 800, delay: 150, ease: 'Cubic.easeOut', onComplete: () => rider.setPos(220, 690) });
      this.add.zone(220, 540, 240, 320).setInteractive({ useHandCursor: true }).on('pointerdown', () => { if (rider.busy) return; rider.attack(() => { rider.nextForm(true); flinch(); }, 60); });
      this.add.ellipse(220, 694, 230, 26, 0x000000, 0.45).setDepth(0);
    }
    // บอสหน้าแรกสลับท่า: หันข้าง › ตั้งการ์ด › รวมพลัง › หันหน้า (แต่ละท่าเป็นภาพคนละภาพ)
    let bp = 0; this.time.addEvent({ delay: 1500, loop: true, callback: () => { bp = (bp + 1) % 4; KG.art.frame(b, [1, 3, 6, 0][bp]); if (bp === 2) KG.fx.glow(this, b.x, b.y - 130, 0xff9a3c, 360, 500); } });
    this.tweens.add({ targets: b, x: 1080, alpha: 1, duration: 900, delay: 300, ease: 'Cubic.easeOut' }); this.tweens.add({ targets: b, scaleY: b.artScale * 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.ellipse(1080, 694, 220, 26, 0x000000, 0.45);
    // โลโก้
    const logo = KG.ui.logo(this, GW / 2, 64, [{ t: 'TECHNO MATH', grad: [[0, '#ffffff'], [0.5, '#9ffcea'], [1, '#4ef4d2']], glow: '#4ef4d2', deep: '#062a2a' }], { size: 96, w: 900, align: 'center', ox: 0.5 });
    logo.setAlpha(0).y -= 60; this.tweens.add({ targets: logo, y: logo.y + 60, alpha: 1, duration: 650, delay: 300, ease: 'Bounce.easeOut', onComplete: () => { KG.fx.flash(this, 0xffffff, 100); KG.audio.play('go'); } });
    const sub = this.txt(GW / 2, 206, 'สมรภูมิคณิต ป.1 – ป.4', { size: 44, color: '#ffd34f', center: true, ox: 0.5, stroke: '#1a0a3a', sw: 8 });
    const tag = this.txt(GW / 2, 262, 'ตั้งเลขบนกระดาษทดทีละขั้น สู้มอนสเตอร์ไปกับไรเดอร์เทคโน · ' + MT.length + ' หัวข้อ ' + MT.length * 5 + ' ระดับ', { size: 21, weight: 400, color: '#dbe4ff', center: true, ox: 0.5 });
    [sub, tag].forEach((t, i) => { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 500, delay: 800 + i * 150 }); });
    // ปุ่ม
    const mkKey = (x, y, k) => this.txt(x, y, k, { size: 14, color: '#050818' }).setBackgroundColor('#ffd34f').setPadding(5, 0, 5, 0).setDepth(30);
    const start = new KG.ui.Button(this, GW / 2, 378, 420, 88, { label: totalStars() ? 'ผจญภัยต่อ' : 'เริ่มผจญภัย', icon: 'play', style: 'primary', size: 36, onClick: () => this.go('Map') });
    const speed = new KG.ui.Button(this, GW / 2, 476, 420, 70, { label: 'คิดเลขเร็ว · กำหนดเอง', icon: 'bolt', style: 'cyan', size: 26, onClick: () => this.go('Speed') });
    const how = new KG.ui.Button(this, GW / 2 - 108, 560, 204, 60, { label: 'วิธีเล่น', icon: 'help', style: 'ghost', size: 22, onClick: () => this.howTo() });
    const keys = new KG.ui.Button(this, GW / 2 + 108, 560, 204, 60, { label: 'คีย์ลัด', icon: 'key', style: 'ghost', size: 22, onClick: () => showKeys(this) });
    [start, speed, how, keys].forEach((b2, i) => { b2.setAlpha(0).y += 40; this.tweens.add({ targets: b2, y: b2.y - 40, alpha: 1, duration: 480, delay: 1000 + i * 100, ease: 'Back.easeOut' }); });
    [[GW / 2 + 196, 338, 'Enter'], [GW / 2 + 196, 444, 'S'], [GW / 2 - 18, 532, 'H'], [GW / 2 + 198, 532, 'K']].forEach(([x, y, k]) => mkKey(x, y, k).setAlpha(0).setData('k', 1));
    this.time.delayedCall(1500, () => { this.children.list.filter(o => o.getData && o.getData('k')).forEach(o => o.setAlpha(1)); start.pulse(); });
    addSystemButtons(this, 1060, 44).forEach(b2 => b2.setDepth(20));
    addPlayerChip(this, 236, 40).setDepth(20);
    this.txt(28, 688, 'ดาวสะสม ' + totalStars() + ' / ' + maxStars(), { size: 22, color: '#ffd34f', stroke: '#050818', oy: 0.5 }).setDepth(20);
    this.txt(GW - 28, 688, 'KruKan.in.th · ครูการ', { size: 17, weight: 400, color: '#9fb0d8', ox: 1, oy: 0.5 }).setDepth(20);
    this.time.delayedCall(1500, () => promptFullscreen(this, () => askPlayerOnce(this)));
    this.input.keyboard.on('keydown', e => {
      if (this._modal && !this._modal.closed) { if (e.code === 'Enter' || e.code === 'NumpadEnter') this._modal.close(); return; }
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') this.go('Map'); else if (e.code === 'KeyS') this.go('Speed');
      else if (e.code === 'KeyK') showKeys(this); else if (e.code === 'KeyH') this.howTo(); else if (e.code === 'KeyF') KG.fullscreen();
    });
  }
  onEscape() { if (this._modal && !this._modal.closed) this._modal.close(); }
  howTo() {
    KG.howTo(this, { title: 'วิธีเล่น Techno Math', body: '1) เลือกโลกและหัวข้อ แต่ละหัวข้อมี 5 ระดับ ระดับ 5 เป็นด่านบอส (ป้าย ป.1–ป.4 บอกชั้นที่เริ่มเรียน)\n2) เขียนคำตอบลงช่องสีเหลืองบนกระดาษทดทีละช่อง เหมือนทำในสมุด: ตั้งบวกลบคูณเขียนจากหลักหน่วยไปทางซ้าย ตัวทดและการยืมขึ้นให้เห็น หารยาวทำ หาร คูณ ลบ ดึงลง\n3) ตอบถูก ไรเดอร์โจมตี ทำข้อเสร็จได้ท่าไม้ตาย ตอบผิดมอนสเตอร์ตีกลับ เสียหัวใจ (มี 5 ดวง)\n4) ติดตรงไหน กด H ดูคำถามนำและวิธีคิด หรือกด S ให้ครูไรเดอร์สาธิตทีละขั้นแล้วลองข้อใหม่เอง\n5) ไม่พลาดเลยได้ 3 ดาว · กด K ดูคีย์ลัดทั้งหมด ใช้คีย์บอร์ดเล่นได้ทั้งเกม\n6) คิดเลขเร็ว กำหนดเอง: เลือกวิธี บวก ลบ คูณ หาร ระดับชั้น จำนวนข้อ และจับเวลาหรือไม่จับเวลาได้เอง' });
  }
}
