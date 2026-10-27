/* ===== สนามต่อสู้มุมขวาบน: ไรเดอร์ (ซ้าย หันขวา) สู้มอนสเตอร์ (ขวา กลับด้านให้หันซ้าย) =====
   ใช้ชุดภาพท่าทางเต็ม (python tools/games/prepare_art9.py --full) ทุกท่าของตัวละครแต่ละตัวเป็นภาพคนละภาพ
   ไรเดอร์ r0-r3 9 ท่า: idle ยืนพร้อม · step ก้าว · dash พุ่ง · a1 ง้าง · a2 ฟัน/ยิง · hurt เจ็บ · power รวมพลัง · jump กระโดดฟัน · defeat แพ้
   มอนสเตอร์ c12..c32 8 ท่า: 0 ยืนหน้า · 1 ยืนหันข้าง (ท่าพักหลัก) · 3 ตั้งการ์ด · 4 โจมตี · 5 เจ็บ · 6 ใช้พลัง · 7 กระโดด · 8 แพ้
   ทุกท่าเป็นลำดับจังหวะ (ง้าง › ปล่อย › ค้าง › กลับ) ผ่าน seq() เริ่มลำดับใหม่ของตัวไหนก็ยกเลิกลำดับเก่าของตัวนั้น ภาพจึงไม่ค้างผิดท่า
   ตอบถูกทีละช่อง = ฟันเบา · ทำข้อเสร็จ = ท่าไม้ตาย (พุ่ง › กระโดดฟัน) ลดพลังมอนสเตอร์ 1 ขีด · ตอบผิด = มอนสเตอร์โจมตี (บอสรวมพลังแล้วกระโดดทุบ)
   ไรเดอร์ปืน (r1) ภาพท่ายิงเป็นภาพนิ่ง จึงสร้างกระสุนพลังงานวิ่งไปหามอนสเตอร์ตอนเล่น */
const GUN_RIDER = 'r1';
class Battle {
  constructor(scene, r, world, o) {
    this.s = scene; this.r = r; this.W = world; this.o = o || {}; this.maxHearts = 5; this.hearts = 5; this.hp = 1; this.maxHp = 1; this.dead = false;
    this.rSeq = 0; this.mSeq = 0; this.rBusy = false; this.mBusy = false;
    const s = scene, col = hexInt(world.color);
    KG.ui.panel(s, r.x, r.y, r.w, r.h, { accent: world.color, accent2: '#ffffff', cuts: [18, 0, 18, 0], fill: ['#101a4a', '#070b22'] }).setDepth(2);
    const bg = s.add.image(r.x + r.w / 2, r.y + r.h / 2 + 10, 'arena_' + world.arena).setDepth(3), k = Math.max((r.w - 8) / bg.width, (r.h - 8) / bg.height) * 1.08; bg.setScale(k);
    const mg = s.make.graphics({ add: false }); mg.fillStyle(0xffffff); mg.fillRect(r.x + 5, r.y + 5, r.w - 10, r.h - 10); this.mask = mg.createGeometryMask(); bg.setMask(this.mask);
    const sh = s.add.graphics().setDepth(4); sh.fillGradientStyle(0x050818, 0x050818, 0x050818, 0x050818, 0.65, 0.65, 0, 0); sh.fillRect(r.x + 5, r.y + 5, r.w - 10, 62); sh.fillGradientStyle(0x050818, 0x050818, 0x050818, 0x050818, 0, 0, 0.55, 0.55); sh.fillRect(r.x + 5, r.y + r.h - 70, r.w - 10, 65);
    this.floor = r.y + r.h - 22;
    this.rider = new KG.Rider(s, r.x + 86, this.floor, { forms: [world.hero], bodyH: 112, depth: 20 });
    this.rx = r.x + 86; this.col = KG.FORMS[world.hero].color;
    this.aura = s.add.image(this.rx, this.floor - 56, 'fx_glow').setTint(this.col).setBlendMode('ADD').setDisplaySize(200, 200).setAlpha(0).setDepth(19);
    // หัวใจของไรเดอร์ (ซ้ายบน) · ชื่อและพลังของมอนสเตอร์ (ขวาบน)
    this.heartI = []; for (let i = 0; i < this.maxHearts; i++) this.heartI.push(KG.ui.icon(s, 'heart', r.x + 26 + i * 27, r.y + 26, 24, 0xff4d6d).setDepth(25));
    this.monName = KG.txt(s, r.x + r.w - 18, r.y + 12, '', { size: 16, color: '#ffd34f', ox: 1, stroke: '#050818', sw: 4 }).setDepth(25);
    this.hpBar = KG.ui.bar(s, r.x + r.w - 168, r.y + 38, 150, 16, { color: 0xff4d5e, value: 1 }).setDepth(25);
    this.comboT = KG.txt(s, r.x + r.w / 2, r.y + 74, '', { size: 30, color: '#ffd34f', center: true, middle: true, stroke: '#050818', sw: 6 }).setDepth(26).setAlpha(0);
    this.ring = s.add.graphics().setDepth(4); this.ring.lineStyle(2, col, 0.5); this.ring.strokeEllipse(r.x + r.w / 2, this.floor + 2, r.w - 60, 26);
    // ขยับตัวเองระหว่างรอ: ไรเดอร์ถ่ายน้ำหนักเท้า · มอนสเตอร์สลับท่าพัก/ตั้งการ์ด (บอสโชว์พลังบ้าง)
    s.time.addEvent({ delay: 3300, loop: true, callback: () => this.riderFidget() });
    s.time.addEvent({ delay: 2100, loop: true, callback: () => this.monFidget() });
  }

  /* ---------- ตัวช่วยจังหวะท่า ---------- */
  // ลำดับท่าของ who ('r' ไรเดอร์ · 'm' มอนสเตอร์): [[เวลา ms, ฟังก์ชัน]] เริ่มลำดับใหม่ = ยกเลิกลำดับเก่าของตัวนั้น
  seq(who, steps) { const k = who + 'Seq', id = ++this[k]; steps.forEach(([t, f]) => this.s.time.delayedCall(t, () => { if (this[k] === id) f(); })); return id; }
  rf(f) { this.rider.frame(f); }
  mf(f, force) { if (this.mon && (!this.dead || force)) KG.art.frame(this.mon, f); }
  // วางไรเดอร์/มอนสเตอร์กลับที่ (หยุดการเคลื่อนที่ค้าง) ก่อนเริ่มท่าใหม่
  riderHome() { const r = this.rider; if (this.rMove) { this.rMove.stop(); this.rMove = null; } r.img.setPosition(this.rx, this.floor); r.shadow.setPosition(this.rx, this.floor + 4).setScale(1); r.img.setAlpha(1); }
  monHome() { if (!this.mon) return; if (this.mMove) { this.mMove.stop(); this.mMove = null; } this.mon.setPosition(this.mx, this.floor); this.monSh.setPosition(this.mx, this.floor + 2).setScale(1); this.mon.clearTint(); this.mon.setAlpha(1); }
  // เคลื่อนที่เป็นเส้นโค้ง (กระโดด) จาก (x0,y0) ไป (x1,y1) สูง h
  arc(img, shadow, x0, y0, x1, y1, h, ms, ease) {
    return this.s.tweens.addCounter({ from: 0, to: 1, duration: ms, ease: ease || 'Sine.easeInOut', onUpdate: tw => { const t = tw.getValue(), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * h; img.setPosition(x, y); if (shadow) shadow.setPosition(x, (shadow === this.monSh ? this.floor + 2 : this.floor + 4)).setScale(1 - Math.sin(Math.PI * t) * 0.35, 1); } });
  }
  slide(img, shadow, x, ms, ease) { return this.s.tweens.add({ targets: shadow ? [img, shadow] : img, x, duration: ms, ease: ease || 'Quad.easeOut' }); }
  dust(x, n) { KG.fx.burst(this.s, x, this.floor - 4, { colors: [0xd9c7a3, 0xb7a17c, 0xffffff], n: n || 10, max: 150, depth: 21, life: 420, a0: 180, a1: 360 }); }
  hitFx(x, y, big) {
    const s = this.s; KG.fx.ring(s, x, y, this.col, { size: big ? 2.2 : 1.2, w: 0.45, depth: 41 });
    KG.fx.burst(s, x, y, { colors: [this.col, 0xffffff, 0xffd34f], n: big ? 26 : 10, max: big ? 330 : 200, depth: 42, life: big ? 600 : 380 });
  }
  // กระสุนพลังงานของไรเดอร์ปืน วิ่งจากปากกระบอกไปที่มอนสเตอร์ แล้วเรียก hit
  bullet(big, hit) {
    const s = this.s, m = this.mon, x0 = this.rx + 52, y0 = this.floor - 64, x1 = m.x - 26, y1 = m.y - 48;
    const b = s.add.image(x0, y0, 'fx_glow').setTint(this.col).setBlendMode('ADD').setDisplaySize(big ? 60 : 34, big ? 34 : 20).setDepth(43);
    const core = s.add.ellipse(x0, y0, big ? 26 : 14, big ? 10 : 6, 0xffffff).setDepth(44);
    KG.fx.burst(s, x0, y0, { colors: [this.col, 0xffffff], n: big ? 12 : 6, max: 160, depth: 43, life: 260 });
    s.tweens.add({ targets: [b, core], x: x1, y: y1, duration: big ? 170 : 120, ease: 'Quad.easeIn', onComplete: () => { b.destroy(); core.destroy(); hit(); } });
  }

  /* ---------- มอนสเตอร์ ---------- */
  setMonster(id, boss, hp) {
    const s = this.s, r = this.r; this.mSeq++;
    if (this.mon) { s.tweens.killTweensOf(this.mon); this.mon.destroy(); this.monSh.destroy(); }
    this.monId = id; this.boss = !!boss; this.maxHp = this.hp = hp; this.dead = false; this.mBusy = true;
    const mx = this.mx = r.x + r.w - 84;
    this.monSh = s.add.ellipse(mx, this.floor + 2, boss ? 120 : 92, 14, 0x000000, 0.45).setDepth(19);
    const m = this.mon = KG.art.make(s, mx + 150, this.floor - 60, 'c' + id, 7, boss ? 122 : 98).setDepth(20).setFlipX(true).setAlpha(0);
    m.setMask(this.mask);
    // กระโดดเข้าฉาก › ลงพื้นตั้งการ์ด › คำราม (ใช้พลัง) สำหรับบอส › ยืนพัก
    s.tweens.add({ targets: m, alpha: 1, duration: 160 });
    this.mMove = this.arc(m, this.monSh, mx + 150, this.floor - 60, mx, this.floor, 70, 460, 'Quad.easeOut');
    this.seq('m', [
      [460, () => { this.mf(3); this.dust(mx, 14); KG.fx.shake(s, 110, 0.003); KG.audio.play('hit'); }],
      [boss ? 760 : 820, () => { if (boss) { this.mf(6); KG.fx.glow(s, mx, this.floor - 60, 0xff4d5e, 260, 520); KG.audio.play('zap'); } else this.mf(1); }],
      [boss ? 1400 : 900, () => { this.mf(1); this.mBusy = false; }]
    ]);
    this.monBob = s.tweens.add({ targets: m, scaleY: m.artScale * 1.03, duration: 860, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.monName.setText((boss ? 'บอส · ' : '') + (MON_NAME[id] || 'อสูรตัวเลข')); this.hpBar.setValue(1, 300);
  }
  // ระหว่างรอ: ส่วนใหญ่ยืนหันข้าง บางครั้งตั้งการ์ด หันหน้า หรือ (บอส) รวมพลังขู่
  monFidget() {
    if (!this.mon || this.dead || this.mBusy) return; const p = Math.random();
    if (this.boss && p < 0.2) { this.seq('m', [[0, () => { this.mf(6); KG.fx.glow(this.s, this.mx, this.floor - 60, 0xff4d5e, 200, 420); }], [560, () => this.mf(1)]]); return; }
    const f = p < 0.55 ? 3 : p < 0.75 ? 0 : 1; this.seq('m', [[0, () => this.mf(f)], [700 + Math.random() * 500, () => this.mf(1)]]);
  }
  // โดนฟันเบา: เจ็บ เซถอย แล้วตั้งการ์ด
  monFlinch(big) {
    if (!this.mon || this.dead) return; const s = this.s, m = this.mon; this.monHome(); this.mBusy = true;
    this.mf(5); m.setTint(0xffffff); this.mMove = this.slide(m, this.monSh, this.mx + (big ? 26 : 12), 90);
    this.seq('m', [[90, () => { m.clearTint(); this.mMove = this.slide(m, this.monSh, this.mx, 220, 'Sine.easeInOut'); }], [big ? 420 : 300, () => this.mf(3)], [big ? 900 : 760, () => { this.mf(1); this.mBusy = false; }]]);
  }
  setHearts(n) { this.hearts = n; this.heartI.forEach((h, i) => { h.setAlpha(i < n ? 1 : 0.18); }); }

  /* ---------- ไรเดอร์ ---------- */
  riderFidget() { if (this.rBusy || this.rider.dead) return; this.seq('r', [[0, () => this.rf('step')], [280, () => this.rf('idle')]]); }
  // ตอบถูกหนึ่งช่อง: ง้าง › ฟันเบา (ปืน = ยิงหนึ่งนัด)
  hitSmall() {
    if (!this.mon || this.dead) return; const s = this.s, r = this.rider; this.riderHome(); this.rBusy = true; KG.audio.play('slice');
    if (this.W.hero === GUN_RIDER) {
      this.seq('r', [[0, () => this.rf('a1')], [80, () => { this.rf('a2'); this.bullet(false, () => { this.hitFx(this.mon.x - 20, this.mon.y - 50); this.monFlinch(); }); }], [300, () => { this.rf('idle'); this.rBusy = false; }]]);
      return;
    }
    this.seq('r', [
      [0, () => this.rf('a1')],
      [80, () => { this.rf('a2'); this.rMove = s.tweens.add({ targets: [r.img, r.shadow], x: this.rx + 44, duration: 90, yoyo: true, ease: 'Quad.easeOut' }); this.hitFx(this.mon.x - 20, this.mon.y - 50); this.monFlinch(); }],
      [320, () => { this.rf('idle'); this.rBusy = false; }]
    ]);
  }
  // ท่าไม้ตายเมื่อทำข้อเสร็จ: ลดพลัง 1 ขีด คืน true ถ้ามอนสเตอร์แพ้
  //   ดาบ หอก มีดคู่: พุ่ง › กระโดดฟันลงใส่ › ก้าวถอยกลับ · ปืน: เล็ง › รวมพลัง › ยิงลำแสงใหญ่
  finisher(power) {
    if (!this.mon || this.dead) return false; const s = this.s, m = this.mon, r = this.rider;
    this.hp = Math.max(0, this.hp - 1); const win = this.hp === 0, crit = power > 1; this.riderHome(); this.rBusy = true;
    const impact = () => {
      KG.audio.play(win ? 'kill' : 'hit'); this.hitFx(m.x - 10, m.y - 50, true); KG.fx.shake(s, 140, 0.004);
      KG.fx.pop(s, m.x, m.y - 110, crit ? 'CRITICAL!' : 'HIT!', { size: crit ? 30 : 26, color: crit ? '#ffd34f' : '#ffffff', depth: 60 });
      if (crit) KG.fx.ring(s, m.x - 10, m.y - 50, 0xffd34f, { size: 3, w: 0.5, depth: 41 });
      this.hpBar.setValue(this.hp / this.maxHp, 260);
      if (win) this.defeatMon(); else this.monFlinch(true);
    };
    if (this.W.hero === GUN_RIDER) {
      this.seq('r', [
        [0, () => { this.rf('a1'); KG.audio.play('swing'); }],
        [140, () => { this.rf('power'); KG.fx.glow(s, this.rx + 50, this.floor - 64, this.col, 160, 300); }],
        [330, () => { this.rf('a2'); this.rMove = s.tweens.add({ targets: [r.img, r.shadow], x: this.rx - 16, duration: 80, yoyo: true }); this.bullet(true, impact); }],
        [700, () => { this.rf('idle'); this.rBusy = false; }]
      ]);
      return win;
    }
    const tx = m.x - 70;
    this.seq('r', [
      [0, () => { this.rf('dash'); KG.audio.play('swing'); this.dust(this.rx, 8); this.rMove = this.slide(r.img, r.shadow, this.rx + 70, 150); }],
      [150, () => { this.rf('jump'); this.rMove = this.arc(r.img, r.shadow, this.rx + 70, this.floor, tx, this.floor, 58, 230, 'Sine.easeOut'); }],
      [380, () => { this.rf('a2'); impact(); this.dust(tx, 8); }],
      [560, () => { this.rf('step'); this.rMove = this.slide(r.img, r.shadow, this.rx, 240, 'Sine.easeInOut'); }],
      [820, () => { this.rf('idle'); this.rBusy = false; }]
    ]);
    return win;
  }
  defeatMon() {
    const s = this.s, m = this.mon, sh = this.monSh; this.dead = true; this.mBusy = true; if (this.monBob) this.monBob.remove();
    KG.fx.flash(s, 0xffffff, 120); this.mf(5, true); m.setTint(0xff9a9a);
    this.seq('m', [
      [180, () => { m.clearTint(); this.mf(8, true); KG.fx.burst(s, m.x, m.y - 40, { colors: [0xffd34f, 0xffffff, 0xff4d5e], n: 40, max: 420, depth: 42, life: 900 }); this.dust(m.x, 16); }],
      [560, () => s.tweens.add({ targets: [m, sh], alpha: 0, y: '+=12', duration: 600 })]
    ]);
    this.s.time.delayedCall(700, () => this.cheer());
  }
  // มอนสเตอร์โจมตี (ตอบผิด) lose = เสียหัวใจไหม
  monsterAttack(lose) {
    if (!this.mon || this.dead) return; const s = this.s, m = this.mon; this.monHome(); this.mBusy = true;
    const strike = () => {
      this.riderHurt(); KG.fx.burst(s, this.rx + 10, this.floor - 56, { colors: [0xff4d5e, 0xffffff], n: 12, max: 220, depth: 40 }); KG.fx.flash(s, 0xff2040, 90);
      if (lose && this.hearts > 0) { const h = this.heartI[this.hearts - 1]; this.setHearts(this.hearts - 1); KG.fx.burst(s, h.x, h.y, { colors: [0xff4d6d, 0xffffff], n: 10, max: 160, depth: 40 }); s.tweens.add({ targets: h, scaleX: h.scaleX * 1.6, scaleY: h.scaleY * 1.6, duration: 120, yoyo: true }); }
    };
    if (this.boss) {   // บอส: รวมพลัง › กระโดดข้ามไปทุบ › กระโดดกลับ
      const tx = this.rx + 78;
      this.seq('m', [
        [0, () => { this.mf(6); KG.audio.play('zap'); KG.fx.glow(s, this.mx, this.floor - 60, 0xff4d5e, 240, 380); }],
        [300, () => { this.mf(7); this.mMove = this.arc(m, this.monSh, this.mx, this.floor, tx, this.floor, 64, 260, 'Sine.easeIn'); }],
        [560, () => { this.mf(4); strike(); KG.fx.shake(s, 160, 0.006); this.dust(tx, 12); }],
        [760, () => { this.mf(7); this.mMove = this.arc(m, this.monSh, tx, this.floor, this.mx, this.floor, 50, 280); }],
        [1040, () => { this.mf(3); this.dust(this.mx, 8); }],
        [1420, () => { this.mf(1); this.mBusy = false; }]
      ]);
      return;
    }
    this.seq('m', [
      [0, () => this.mf(3)],
      [150, () => { this.mf(4); KG.audio.play('zap'); this.mMove = this.slide(m, this.monSh, this.mx - 72, 120, 'Quad.easeIn'); }],
      [270, () => { strike(); this.mMove = this.slide(m, this.monSh, this.mx, 220, 'Sine.easeInOut'); }],
      [520, () => this.mf(3)],
      [900, () => { this.mf(1); this.mBusy = false; }]
    ]);
  }
  riderHurt() {
    const s = this.s, r = this.rider; if (r.dead) return; this.riderHome(); this.rBusy = true; KG.audio.play('hurt'); this.rf('hurt');
    this.rMove = s.tweens.add({ targets: [r.img, r.shadow], x: this.rx - 20, duration: 90, yoyo: true, ease: 'Quad.easeOut' });
    s.tweens.add({ targets: r.img, alpha: 0.5, duration: 70, yoyo: true, repeat: 3, onComplete: () => r.img.setAlpha(1) });
    this.seq('r', [[440, () => { this.rf('idle'); this.rBusy = false; }]]);
  }
  // ดีใจ: รวมพลัง › กระโดด › ลงยืน
  cheer() {
    const r = this.rider; if (r.dead) return; this.riderHome(); this.rBusy = true;
    this.seq('r', [[0, () => this.rf('power')], [160, () => { this.rf('jump'); this.rMove = this.arc(r.img, r.shadow, this.rx, this.floor, this.rx, this.floor, 44, 360); }], [520, () => { this.rf('power'); this.dust(this.rx, 6); }], [900, () => { this.rf('idle'); this.rBusy = false; }]]);
  }
  // คอมโบ: ป้ายตัวเลข + ทุก 5 คอมโบไรเดอร์รวมพลัง (ออร่าและเปลี่ยนร่าง)
  combo(n) {
    const s = this.s, t = this.comboT; if (n < 2) { s.tweens.add({ targets: t, alpha: 0, duration: 200 }); this.aura.setAlpha(0); return; }
    t.setText('COMBO ×' + n).setAlpha(1).setScale(1.5); s.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 220, ease: 'Back.easeOut' });
    if (n % 5 === 0) {   // เอฟเฟกต์รวมพลัง (ไม่ใช้ rider.henshin เพราะท่านั้นหยุดทวีนทุกตัวของภาพ ทำให้ท่าพุ่งที่กำลังเล่นค้างกลางทาง)
      const x = this.rx, y = this.floor - 56; KG.audio.play('henshin'); KG.fx.flash(s, 0xffffff, 140); KG.fx.ring(s, x, y, this.col, { size: 3.4, w: 0.6, depth: 60 }); KG.fx.ring(s, x, y, 0xffffff, { size: 2.2, w: 0.45, depth: 61 });
      KG.fx.burst(s, x, y, { colors: [this.col, 0xffffff, 0xffd34f], n: 30, max: 360, depth: 62, life: 700 }); KG.audio.play('combo'); this.aura.setAlpha(0.5); s.tweens.add({ targets: this.aura, alpha: 0.85, duration: 600, yoyo: true, repeat: -1 });
      if (!this.rBusy) { this.rBusy = true; this.seq('r', [[0, () => this.rf('power')], [560, () => { this.rf('idle'); this.rBusy = false; }]]); }
    }
  }
  victory() { this.cheer(); this.s.time.delayedCall(1000, () => this.cheer()); }
  defeat() {
    const r = this.rider; this.riderHome(); this.rf('hurt'); KG.audio.play('lose');
    this.seq('r', [[260, () => { this.rf('defeat'); r.dead = true; this.dust(this.rx, 8); }]]);
    if (this.mon && !this.dead) { this.mBusy = true; this.seq('m', [[300, () => this.mf(6)], [900, () => this.mf(1)]]); }
  }
}
