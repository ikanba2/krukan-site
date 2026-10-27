/* ===== Techno Aksorn: ยิงลูกโป่ง (พยัญชนะ) และตกปลาสระ (สระ) =====
   เป้าหมาย 3 ตัว ตัวละ 3 ครั้ง ลูกโป่ง/ปลาที่มีตัวตามโจทย์ผสมกับตัวลวงที่หน้าตาคล้ายกัน แตะผิด = พลาด */
const BAL_COL = ['#ff5a8a', '#3d8bff', '#ffa21e', '#17c4a8', '#9a5ae8', '#3fb54a'];
function balloonTex(scene, col) {
  return KG.tex(scene, 'ak-balloon|' + col, 150, 190, c => {
    c.translate(75, 8); c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 140); c.quadraticCurveTo(-8, 160, 6, 176); c.lineWidth = 3.5; c.strokeStyle = '#2d2a5e'; c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-64, 0, -66, 96, 0, 132); c.bezierCurveTo(66, 96, 64, 0, 0, 0); c.closePath();
    const g = c.createRadialGradient(-22, 34, 6, 0, 66, 84); g.addColorStop(0, shade(col, 1.35)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, 0.78)); c.fillStyle = g; c.fill(); c.lineWidth = 4.5; c.strokeStyle = '#2d2a5e'; c.stroke();
    c.beginPath(); c.moveTo(-8, 132); c.lineTo(8, 132); c.lineTo(0, 144); c.closePath(); c.fillStyle = shade(col, 0.78); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-30, 36, 9, 17, 0.5, 0, 7); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
  });
}
function fishTex(scene, col) {
  return KG.tex(scene, 'ak-fish|' + col, 220, 150, c => {
    c.translate(10, 10); c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); c.moveTo(150, 65); c.lineTo(200, 22); c.quadraticCurveTo(190, 65, 200, 108); c.closePath(); c.fillStyle = shade(col, 0.82); c.fill(); c.lineWidth = 4.5; c.strokeStyle = '#2d2a5e'; c.stroke();
    c.beginPath(); c.moveTo(70, 14); c.quadraticCurveTo(95, -6, 120, 16); c.closePath(); c.fillStyle = shade(col, 0.82); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(86, 65, 82, 52, 0, 0, 7); const g = c.createLinearGradient(0, 14, 0, 116); g.addColorStop(0, shade(col, 1.3)); g.addColorStop(1, col); c.fillStyle = g; c.fill(); c.lineWidth = 4.5; c.stroke();
    c.beginPath(); c.arc(30, 52, 9, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 3; c.stroke(); c.beginPath(); c.arc(28, 52, 4, 0, 7); c.fillStyle = '#2d2a5e'; c.fill();
    c.beginPath(); c.arc(14, 80, 7, 0.2, 2.8); c.lineWidth = 3.5; c.stroke();
  });
}
class ShooterScene extends ActBase {
  constructor() { super('Shooter'); }
  init(d) {
    d = d || {}; const L = lessonOf(d.lesson); this.ACT = d.act || (L && L.zone === 'vow' ? 'fish' : 'balloon'); super.init(d); this.kind = this.ACT;
    this.targets = AK.makeShooter(this.lesson, this.lv, (Date.now() & 0xfffffff) + 31); this.ti = 0; this.got = 0; this.items = []; this.spawnT = 0; this.locked = true; this.col = 0; this.ring = null;
  }
  create() {
    this.begin(); const fish = this.kind === 'fish';
    this.HOW = fish ? '1. ฟังหรืออ่านโจทย์ด้านบนว่าต้องจับสระตัวไหน\n2. ปลาว่ายผ่านมา แตะปลาที่มีสระตามโจทย์ให้ครบ 3 ตัว\n3. ถ้าแตะปลาตัวอื่นจะนับว่าพลาด\n4. ทำครบ 3 สระจึงผ่าน' : '1. ฟังหรืออ่านโจทย์ด้านบนว่าต้องยิงตัวไหน\n2. ลูกโป่งลอยขึ้นมา แตะลูกโป่งที่มีตัวตามโจทย์ให้ครบ 3 ลูก\n3. ถ้าแตะลูกโป่งตัวอื่นจะนับว่าพลาด\n4. ทำครบ 3 ตัวจึงผ่าน';
    if (fish) { this.add.rectangle(GW / 2, 400, GW, 460, 0x2a9fe8, 0.42).setDepth(1); const w = this.add.graphics().setDepth(1); w.lineStyle(5, 0xffffff, 0.7); w.beginPath(); for (let x = 0; x <= GW; x += 20) { const y = 176 + Math.sin(x / 38) * 6; x ? w.lineTo(x, y) : w.moveTo(x, y); } w.strokePath(); }
    this.promptC = this.add.container(0, 0).setDepth(20); this.makePips(9, 640); this.pipObjs.forEach((c, i) => { c.setRadius(8); c.x = 640 + i * 26; });
    this.startTarget(); this.say(fish ? 'ปลาจะว่ายผ่านมา แตะปลาที่มีสระตามโจทย์นะ' : 'ลูกโป่งจะลอยขึ้นมา แตะลูกโป่งที่มีตัวตามโจทย์นะ', 'smile');
  }
  startTarget() {
    this.items.forEach(it => it.c.destroy(true)); this.items = []; this.promptC.removeAll(true); this.got = 0; this.locked = true; this.spawnT = 0;
    const T = this.targets[this.ti], inf = AK.info(T.target), fish = this.kind === 'fish'; this.T = T;
    // แถบโจทย์ แบ่งช่องไม่ให้ทับกัน (เดิมปุ่มลำโพงทับรูปสระ/ข้อความบนจอมือถือ): ข้อความ | ตัวอักษรเป้าหมาย | ปุ่มลำโพง | จุดนับ 3 ดวง อยู่ในแถบเดียวกัน
    this.promptC.add(addCard(this, 640, 132, 880, 84, { r: 30, fill: ['#ffffff', '#fff6dc'], shadow: 7 }));
    this.promptC.add(fitText(KG.txt(this, 224, 132, (T.prompt || (fish ? 'จับปลาที่มี' : 'ยิงลูกโป่งที่มี')) + ' ' + inf.label, { size: 30, color: TKC.ink, ox: 0, oy: 0.5 }), 400));
    this.promptC.add(fitText(glyph(this, 772, 132, inf.text, 62, '#e83a8e'), 190));
    const sp = iconButton(this, 928, 132, 'sound', () => this.speak(inf.say), { w: 56, h: 48 }); sp.setEnabled(SPEECH.exists); this.promptC.add(sp);
    this.dots = []; for (let k = 0; k < 3; k++) { const d = this.add.circle(1002 + k * 30, 132, 11, 0xffffff).setStrokeStyle(4, 0x2d2a5e).setDepth(21); this.dots.push(d); this.promptC.add(d); }
    this.speak(inf.say); KG.banner(this, 'ตัวที่ ' + (this.ti + 1) + ' จาก 3', '#ffffff', 0.8, 330);
    this.time.delayedCall(900, () => { this.locked = false; });
  }
  spawn() {
    const T = this.T, fish = this.kind === 'fish', haveT = this.items.some(i => i.tgt), tgt = !haveT || Math.random() < 0.42, key = tgt ? KG.pick(T.goods || [T.target]) : KG.pick(T.decoys), inf = AK.info(key), col = BAL_COL[this.col++ % BAL_COL.length];
    let x, y, vx = 0, vy = 0; const sp = T.speed;
    if (fish) { const dir = Math.random() < 0.5 ? 1 : -1; y = 250 + Math.random() * 330; x = dir > 0 ? -120 : GW + 120; vx = dir * (95 + Math.random() * 45) * sp; if (this.items.some(i => Math.abs(i.c.y - y) < 80 && Math.abs(i.c.x - x) < 190)) return; }
    else { x = 110 + Math.random() * (GW - 220); y = 700; vy = -(78 + Math.random() * 34) * sp; if (this.items.some(i => Math.abs(i.c.x - x) < 120 && i.c.y > 560)) return; }
    const c = this.add.container(x, y).setDepth(10); const body = this.add.image(0, fish ? 0 : 6, fish ? fishTex(this, col) : balloonTex(this, col)).setDisplaySize(fish ? 220 : 150, fish ? 150 : 190); if (fish && vx < 0) { /* หันหน้าไปทางซ้ายตามภาพต้นฉบับ */ } else if (fish) body.setFlipX(true);
    c.add(body); c.add(glyph(this, fish ? (vx < 0 ? -12 : 12) : 0, fish ? 4 : -26, inf.text, inf.text.length > 3 ? 40 : 66, '#ffffff', { stroke: '#2d2a5e', sw: 7 }));
    c.setSize(fish ? 190 : 130, fish ? 120 : 150); c.setInteractive({ useHandCursor: true }); c.on('pointerdown', () => this.pop(it));
    const it = { c, key, tgt, vx, vy, ph: Math.random() * 6 }; c.setScale(0.2); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' }); this.items.push(it);
  }
  update(time, dt) {
    if (this.paused || this.done || this._modal || this.locked || !this.items) return; const s = dt / 1000; this.spawnT -= s;
    if (this.spawnT <= 0 && this.items.length < 8) { this.spawn(); this.spawnT = (this.kind === 'fish' ? 0.8 : 0.95) / this.T.speed; }
    this.items.forEach(it => { it.ph += s * 2.2; it.c.x += it.vx * s + (this.kind === 'balloon' ? Math.sin(it.ph) * 0.7 : 0); it.c.y += it.vy * s + (this.kind === 'fish' ? Math.sin(it.ph) * 0.9 : 0); });
    this.items = this.items.filter(it => { const out = this.kind === 'fish' ? (it.vx > 0 ? it.c.x > GW + 150 : it.c.x < -150) : it.c.y < 170; if (out) it.c.destroy(true); return !out; });
  }
  pop(it) {
    if (this.locked || this.done || this.paused || this._modal || !this.items.includes(it)) return; const inf = AK.info(it.key);
    this.items = this.items.filter(i => i !== it); it.c.disableInteractive();
    if (it.tgt) {
      KG.fx.burst(this, it.c.x, it.c.y, { colors: [0xffd34f, 0xff7ab2, 0x4ef4d2, 0xffffff], n: 18, max: 260, depth: 3000 }); KG.audio.play('good'); this.tweens.add({ targets: it.c, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 200, onComplete: () => it.c.destroy(true) });
      this.dots[this.got].setFillStyle(0xffc82e); this.got++; this.setPips(this.ti * 3 + this.got); this.speak(inf.say); this.say('ถูกต้อง! ' + inf.label, 'happy');
      if (this.got >= 3) { this.locked = true; this.ti++; this.time.delayedCall(900, () => { if (this.ti >= this.targets.length) this.finish([[this.kind === 'fish' ? 'จับปลาถูก' : 'ยิงลูกโป่งถูก', '9 ครั้ง']]); else this.startTarget(); }); }
    } else {
      this.mistakes++; KG.audio.play('error'); KG.fx.burst(this, it.c.x, it.c.y, { colors: [0xee4a4a, 0xffffff], n: 10, max: 160, depth: 3000 }); this.tweens.add({ targets: it.c, scaleX: 0.2, scaleY: 0.2, alpha: 0, duration: 200, onComplete: () => it.c.destroy(true) });
      this.speak(inf.say); this.say('ใบนั้นคือ ' + inf.label + ' ยังไม่ใช่ตัวที่หา ลองดูโจทย์ด้านบนอีกครั้งนะ', 'sad'); this.time.delayedCall(1500, () => { if (!this.done) this.speak(AK.info(this.T.target).say); });
    }
  }
  hint() {
    if (this.done || this.locked) return; const it = this.items.find(i => i.tgt); if (!it) return; this.hints++; KG.audio.play('pop');
    if (this.ring) this.ring.destroy(); const r = this.ring = this.add.circle(0, 0, 90).setStrokeStyle(8, 0xffc82e).setDepth(30); this.tweens.add({ targets: r, scaleX: 1.25, scaleY: 1.25, duration: 220, yoyo: true, repeat: 6, onUpdate: () => { if (it.c.active) r.setPosition(it.c.x, it.c.y); }, onComplete: () => r.destroy() });
    this.say('คำใบ้: ดูวงกลมสีเหลือง นั่นคือตัวที่ต้องแตะ', 'open');
  }
}
