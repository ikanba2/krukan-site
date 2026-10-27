/* ===== ตัวเกม 'ลากตามทาง' ของผจญภัยเมาส์: กดค้างที่ไรเดอร์แล้วลากไปตามทางถึงธง ไม่ให้หลุดออกนอกทาง =====
   shape: line · wave · zig · spiral · maze · narrow · w ความกว้างทาง · stars จำนวนดาวที่ต้องเก็บตามทาง · time เวลาจำกัด
   ไรเดอร์เดินตามความคืบหน้าบนเส้นกลางทาง (ตัดทางลัดไม่ได้เพราะหาจุดใกล้สุดเฉพาะช่วงข้างหน้า) หลุดทาง = กลับไปจุดเช็กพอยต์ล่าสุด (ทุก 1/3 ของทาง) */
function pathPoints(shape) {
  const P = [], add = (x, y) => P.push([x, y]);
  if (shape === 'line') { add(270, 440); add(1170, 440); }
  else if (shape === 'wave') { for (let i = 0; i <= 60; i++) { const t = i / 60; add(270 + t * 900, 440 + Math.sin(t * Math.PI * 3) * 130); } }
  else if (shape === 'zig') { [[270, 440], [430, 270], [590, 600], [750, 270], [910, 600], [1070, 270], [1180, 440]].forEach(p => add(p[0], p[1])); }
  else if (shape === 'spiral') { const cx = 720, cy = 440; for (let i = 0; i <= 110; i++) { const t = i / 110, a = Math.PI + t * Math.PI * 4.6, r = 250 - t * 215; add(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r); } }
  else if (shape === 'maze') { [[250, 260], [560, 260], [560, 440], [330, 440], [330, 620], [800, 620], [800, 340], [1030, 340], [1030, 600], [1190, 600]].forEach(p => add(p[0], p[1])); }
  else { for (let i = 0; i <= 90; i++) { const t = i / 90; add(270 + t * 920, 440 + Math.sin(t * Math.PI * 4.2) * 120 + Math.sin(t * Math.PI * 9) * 26); } }   // narrow
  return P;
}
class PathEng {
  constructor(s, p, host) {
    this.s = s; this.h = host || s; this.p = Object.assign({ shape: 'line', w: 110, stars: 0 }, p); const P = this.p; this.R = s.R; this.alive = true; this.running = false; this.dragging = false; this.s0 = 0; this.cp = 0; this.outs = 0; this.fin = false;
    this.pts = pathPoints(P.shape); this.cum = [0]; for (let i = 1; i < this.pts.length; i++) this.cum.push(this.cum[i - 1] + Math.hypot(this.pts[i][0] - this.pts[i - 1][0], this.pts[i][1] - this.pts[i - 1][1])); this.len = this.cum[this.cum.length - 1];
    if (!host) { s.setGoal(1 + P.stars); s.starN = 8; if (P.time) s.setTimer(P.time); }
    this.h.setCard(P.stars ? 'กดค้างที่ไรเดอร์ ลากตามทาง เก็บดาวให้ครบ แล้วไปถึงธง' : 'กดค้างที่ไรเดอร์ ลากไปตามทางให้ถึงธง (อย่าหลุดทางนะ)', { icon: s.add.image(0, 0, MA.mouseIcon(s, 'drag', 56)).setDisplaySize(64, 64), say: 'กดค้างที่ไรเดอร์ แล้วลากไปตามทางให้ถึงธง' });
    this.draw(); this.mkRider(); this.stars = [];
    for (let i = 0; i < P.stars; i++) { const sp = this.len * (0.14 + 0.8 * i / Math.max(1, P.stars - 1) * 0.95), pt = this.at(sp), im = s.add.image(pt[0], pt[1], KG.kit.shapeTex(s, 'star', 'yellow', 56)).setDepth(12).setDisplaySize(76, 76); s.tweens.add({ targets: im, angle: 360, duration: 3200, repeat: -1 }); this.stars.push({ sp, im, got: false }); }
    this.dn = (pt, over) => this.onDown(pt, over); s.input.on('pointerdown', this.dn);
  }
  at(sp) {
    sp = Math.max(0, Math.min(this.len, sp)); let i = 1; while (i < this.cum.length - 1 && this.cum[i] < sp) i++;
    const a = this.pts[i - 1], b = this.pts[i], t = (sp - this.cum[i - 1]) / ((this.cum[i] - this.cum[i - 1]) || 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  draw() {
    const s = this.s, P = this.p, g = this.g = s.add.graphics().setDepth(4), w = P.w; const pts = this.pts.map(p => new Phaser.Math.Vector2(p[0], p[1]));
    g.lineStyle(w + 16, 0x2d2a5e, 1); g.strokePoints(pts, false, false); g.lineStyle(w + 5, 0x2d2a5e, 0.2); g.strokePoints(pts.map(p => new Phaser.Math.Vector2(p.x + 5, p.y + 8)), false, false);
    g.lineStyle(w, 0xfff4c9, 1); g.strokePoints(pts, false, false); g.lineStyle(w * 0.62, 0xffffff, 0.55); g.strokePoints(pts, false, false);
    // เส้นประกลางทาง + ลูกศรบอกทิศ
    const d = 56; for (let sp = 40; sp < this.len - 30; sp += d) { const a = this.at(sp), b = this.at(sp + 3), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); g.fillStyle(0xffc400, 0.85); g.fillTriangle(a[0] + Math.cos(ang) * 11, a[1] + Math.sin(ang) * 11, a[0] + Math.cos(ang + 2.5) * 9, a[1] + Math.sin(ang + 2.5) * 9, a[0] + Math.cos(ang - 2.5) * 9, a[1] + Math.sin(ang - 2.5) * 9); }
    // จุดเริ่มและธง
    const st = this.pts[0], en = this.pts[this.pts.length - 1];
    g.fillStyle(0x3fbf6a, 1); g.fillCircle(st[0], st[1], w * 0.42); g.lineStyle(5, 0x2d2a5e, 1); g.strokeCircle(st[0], st[1], w * 0.42);
    this.flag = s.add.container(en[0], en[1]).setDepth(13); const fg = s.add.graphics(); fg.fillStyle(0x2d2a5e, 1); fg.fillRect(-4, -78, 8, 90); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { fg.fillStyle((r + c) % 2 ? 0xffffff : 0x2d2a5e, 1); fg.fillRect(4 + c * 15, -78 + r * 15, 15, 15); } fg.lineStyle(3, 0x2d2a5e, 1); fg.strokeRect(4, -78, 60, 60); this.flag.add(fg); s.tweens.add({ targets: this.flag, angle: { from: -3, to: 3 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const lb = KG.txt(s, st[0], st[1] + w * 0.42 + 12, 'เริ่ม', { size: 22, color: '#ffffff', center: true, ox: 0.5, stroke: '#2d2a5e', sw: 5 }).setDepth(13); this.lbl = lb;
  }
  mkRider() {
    const s = this.s, st = this.pts[0]; this.rider = s.add.container(st[0], st[1]).setDepth(30);
    this.rsh = s.add.ellipse(0, 6, 76, 16, 0x2d2a5e, 0.25); this.rider.add(this.rsh);
    this.rimg = K_poseImg(s, 'runR', 0, 14, 112); this.rider.add(this.rimg); this.ring = s.add.circle(0, -44, 62, 0xffe566, 0.0).setStrokeStyle(5, 0xffc400, 0.9); this.rider.add(this.ring);
    s.tweens.add({ targets: this.ring, scaleX: 1.15, scaleY: 1.15, alpha: 0.3, duration: 650, yoyo: true, repeat: -1 });
  }
  start() { this.running = true; }
  stop() { this.running = false; }
  onDown(pt, over) {
    if (!this.running || this.fin || this.s.over || this.s.paused || (over && over.length)) return;
    const d = Math.hypot(pt.worldX - this.rider.x, pt.worldY - this.rider.y + 40);
    if (d <= 95) { this.dragging = true; this.ring.setVisible(false); KG.audio.play('pop'); this.tickT = 0; } else { KG.fx.pop(this.s, pt.worldX, pt.worldY - 24, 'กดที่ไรเดอร์', { size: 22, color: '#e8920a', depth: 80 }); KG.audio.play('denied'); }
  }
  // หาความคืบหน้าบนเส้นทางที่ใกล้เมาส์ที่สุด (เฉพาะช่วงใกล้ ๆ ความคืบหน้าปัจจุบัน)
  nearest(px, py) {
    let best = null; const lo = this.s0 - 60, hi = this.s0 + 170;
    for (let i = 1; i < this.pts.length; i++) {
      if (this.cum[i] < lo || this.cum[i - 1] > hi) continue; const a = this.pts[i - 1], b = this.pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1; let t = ((px - a[0]) * dx + (py - a[1]) * dy) / l2; t = Math.max(0, Math.min(1, t));
      const qx = a[0] + dx * t, qy = a[1] + dy * t, d = Math.hypot(px - qx, py - qy), sp = this.cum[i - 1] + (this.cum[i] - this.cum[i - 1]) * t;
      if (sp < lo || sp > hi) continue; if (!best || d < best.d) best = { d, sp };
    }
    return best;
  }
  update(t, dt) {
    if (!this.running || !this.dragging || this.fin) return; const s = this.s, ptr = s.input.activePointer;
    if (!ptr.isDown) { this.dragging = false; this.ring.setVisible(true); return; }
    const hit = this.nearest(ptr.worldX, ptr.worldY), half = this.p.w / 2 + 6;
    if (!hit || hit.d > half) { this.out(); return; }
    this.s0 = Math.max(this.s0, hit.sp);   // ไม่ถอยหลัง
    const q = this.at(this.s0), prev = this.rider.x; this.rider.setPosition(q[0], q[1]); this.rimg.setFlipX(q[0] < prev - 0.5 ? true : this.rimg.flipX && q[0] < prev + 0.5);
    this.tickT = (this.tickT || 0) + dt; if (this.tickT > 70) { this.tickT = 0; KG.fx.burst(s, q[0], q[1] - 6, { colors: [0xffd34f, 0xff7ab8, 0xffffff], n: 2, max: 90, life: 420, depth: 20 }); }
    const cpi = Math.floor(this.s0 / (this.len / 3)); if (cpi > this.cp && cpi < 3) { this.cp = cpi; KG.fx.pop(s, q[0], q[1] - 70, 'จุดเช็กพอยต์!', { size: 26, color: '#2fb8ff', depth: 80 }); KG.audio.play('star', { i: cpi }); K_ringFx(s, q[0], q[1]); }
    this.stars.forEach(st => { if (!st.got && this.s0 >= st.sp - 10) { st.got = true; KG.audio.play('coin', { i: 3 }); KG.fx.burst(s, st.im.x, st.im.y, { colors: [0xffd34f, 0xffffff], n: 14, max: 260, tex: 'fx_star', rot: true, life: 600, depth: 61 }); s.tweens.add({ targets: st.im, scaleX: 0.01, scaleY: 0.01, duration: 200 }); this.h.ok(st.im.x, st.im.y, { text: false, sfx: 'coin' }); } });
    if (this.s0 >= this.len - 14) this.finish();
  }
  out() {
    const s = this.s; this.dragging = false; const q = this.at(this.s0); this.outs++; this.h.bad(q[0], q[1], 'หลุดทาง!'); KG.fx.flash(s, 0xff4d5e, 90);
    const back = this.cp * this.len / 3; this.s0 = back; const b = this.at(back); s.tweens.add({ targets: this.rider, x: b[0], y: b[1], duration: 320, ease: 'Back.easeOut', onComplete: () => this.ring.setVisible(true) }); s.tweens.add({ targets: this.rimg, angle: { from: -12, to: 12 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => this.rimg.setAngle(0) });
    this.stars.forEach(st => { if (st.got && st.sp > back) { st.got = false; st.im.setScale(1).setDisplaySize(76, 76); s.done = Math.max(0, s.done - 1); s.refreshPips(); } });
  }
  finish() {
    this.fin = true; this.dragging = false; const s = this.s, q = this.at(this.len); KG.audio.play('fanfare'); K_boomRing(s, q[0], q[1] - 30); KG.fx.confetti(s, { ms: 800 }); this.rimg.setTexture(K_hasPose(s, 'victory') ? 'pose_victory' : 'pose_runR'); this.rimg.setScale(112 / this.rimg.height);
    this.h.ok(q[0], q[1] - 30, { text: false, sfx: 'fanfare', cheer: true }); if (this.h.roundDone) { this.running = false; s.time.delayedCall(700, () => this.h.roundDone()); }
  }
  destroy() { this.alive = false; this.running = false; this.s.input.off('pointerdown', this.dn); [this.g, this.flag, this.lbl, this.rider].forEach(o => { if (o && o.destroy) o.destroy(); }); this.stars.forEach(st => st.im && st.im.destroy()); }
}
const K_hasPose = (s, n) => s.textures.exists('pose_' + n);
const K_poseImg = (s, n, x, y, h) => { const im = s.add.image(x, y, 'pose_' + n).setOrigin(0.5, 1); im.setScale(h / im.height); return im; };
