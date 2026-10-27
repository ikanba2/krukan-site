/* ===== ไรเดอร์ Techno หลายร่าง (ใช้ซ้ำในเกมธีมสว่าง) =====
   ภาพเคลื่อนไหวมาจากคลังภาพเกมเก่า ฟอร์ม h0 มาเจนต้า (ฐาน) · h1 ฟ้าน้ำเงิน · h2 ทอง · h3 แดง
   KG.Rider ถือภาพหนึ่งตัวที่เท้าอยู่ที่ (x, y) เปลี่ยนร่างได้ (henshin) ฟัน (attack) โดนตี (hurt) พุ่ง (dash) ดีใจ (cheer) และมีท่ายืนหายใจเอง */
KG.FORMS = {
  h0: { name: 'ร่างมาเจนต้า', color: 0xff3d8b, css: '#ff3d8b' },
  h1: { name: 'ร่างฟ้าน้ำเงิน', color: 0x2aa8ff, css: '#2aa8ff' },
  h2: { name: 'ร่างทอง', color: 0xffb800, css: '#ffb800' },
  h3: { name: 'ร่างแดง', color: 0xff3b3b, css: '#ff3b3b' }
};
// ตั้งภาพให้เป็นฟอร์ม id (หัวใจคือจุดยึดเท้า oy ที่ต่างกันตามฟอร์ม)
KG.art.setId = function (img, id, bodyH) {
  const a = KG.ART[id]; img.artId = id; img.artScale = bodyH / a.body; img.setOrigin(0.5, a.oy).setScale(img.artScale); return img;
};

KG.Rider = class {
  constructor(scene, x, y, o) {
    o = o || {}; this.scene = scene; this.forms = o.forms || ['h0']; this.fi = o.form || 0; this.bodyH = o.bodyH || 200; this.baseX = x; this.baseY = y; this.dir = o.dir || 1;
    this.id = this.forms[this.fi];
    this.img = KG.art.make(scene, x, y, this.id, 'idle', this.bodyH); this.img.setDepth(o.depth == null ? 20 : o.depth);
    this.shadow = scene.add.ellipse(x, y + 4, this.bodyH * 0.9, this.bodyH * 0.14, 0x1b2a6b, KG.SKIN.pop ? 0.25 : 0.45).setDepth((o.depth == null ? 20 : o.depth) - 1);
    this.busy = false; this.dead = false; this.bobT = scene.tweens.add({ targets: this.img, scaleY: this.img.scaleY * 1.02, scaleX: this.img.scaleX * 0.99, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.setFlip(this.dir < 0);
    this.wf = 0;
  }
  get x() { return this.img.x; }
  get y() { return this.img.y; }
  get form() { return KG.FORMS[this.id]; }
  setFlip(f) { this.img.setFlipX(!!f); }
  setPos(x, y) { this.img.setPosition(x, y); this.shadow.setPosition(x, y + 4); this.baseX = x; this.baseY = y; }
  frame(f) { if (!this.dead) KG.art.frame(this.img, f); }
  retarget() { // หลังเปลี่ยนร่าง/ขนาด ให้ท่ายืนหายใจอ้างอิงสเกลใหม่
    if (this.bobT) this.bobT.remove(); this.scene.tweens.killTweensOf(this.img);
    this.img.setScale(this.img.artScale);
    this.bobT = this.scene.tweens.add({ targets: this.img, scaleY: this.img.artScale * 1.02, scaleX: this.img.artScale * 0.99, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  // เปลี่ยนร่างทันที (ไม่มีเอฟเฟกต์) หรือพร้อมเอฟเฟกต์ถ้า fx = true
  setForm(i, fx) {
    this.fi = ((i % this.forms.length) + this.forms.length) % this.forms.length; this.id = this.forms[this.fi];
    KG.art.setId(this.img, this.id, this.bodyH); this.frame('idle'); this.retarget();
    if (fx) this.henshin();
  }
  henshin() {
    const s = this.scene, c = KG.FORMS[this.id].color, x = this.img.x, y = this.img.y - this.bodyH * 0.5;
    KG.audio.play('henshin'); KG.fx.flash(s, 0xffffff, 140); KG.fx.ring(s, x, y, c, { size: 5, w: 0.7, depth: 60 }); KG.fx.ring(s, x, y, 0xffffff, { size: 3.2, w: 0.5, depth: 61 });
    KG.fx.burst(s, x, y, { colors: [c, 0xffffff, 0xffd34f], n: 34, max: 460, depth: 62, life: 800 });
    KG.fx.glow(s, x, y, c, this.bodyH * 3, 600);
    s.tweens.add({ targets: this.img, scaleX: this.img.artScale * 1.28, scaleY: this.img.artScale * 1.28, duration: 150, yoyo: true, ease: 'Back.easeOut', onComplete: () => this.retarget() });
  }
  nextForm(fx) { this.setForm(this.fi + 1, fx !== false); }
  // ท่าฟัน: a1 › a2 › a3 แล้วกลับท่ายืน cb เรียกตอนฟันโดน (เฟรม a2)
  attack(cb, dx) {
    if (this.dead) return; const s = this.scene, ox = this.baseX; this.busy = true;
    KG.audio.play('slice');
    const seq = ['a1', 'a2', 'a3']; seq.forEach((f, i) => s.time.delayedCall(i * 70, () => { this.frame(f); if (i === 1 && cb) cb(); }));
    s.tweens.add({ targets: [this.img, this.shadow], x: ox + (dx == null ? 40 : dx) * this.dir, duration: 100, yoyo: true, ease: 'Quad.easeOut' });
    s.time.delayedCall(320, () => { this.frame('idle'); this.busy = false; });
  }
  hurt() {
    if (this.dead) return; const s = this.scene; this.frame('hurt'); KG.audio.play('hurt');
    s.tweens.add({ targets: this.img, x: this.baseX - 22 * this.dir, duration: 70, yoyo: true, repeat: 2, onComplete: () => { this.img.x = this.baseX; } });
    s.tweens.add({ targets: this.img, alpha: 0.5, duration: 70, yoyo: true, repeat: 3 });
    s.time.delayedCall(420, () => { this.frame('idle'); this.img.setAlpha(1); });
  }
  dash(dx) {
    if (this.dead) return; const s = this.scene, ox = this.baseX; this.frame('dash');
    s.tweens.add({ targets: [this.img, this.shadow], x: ox + (dx || 60) * this.dir, duration: 120, yoyo: true, ease: 'Quad.easeOut' });
    s.time.delayedCall(260, () => this.frame('idle'));
  }
  cheer() {
    if (this.dead) return; const s = this.scene; this.frame('up');
    s.tweens.add({ targets: this.img, y: this.baseY - 46, duration: 190, yoyo: true, ease: 'Quad.easeOut', onComplete: () => { this.img.y = this.baseY; this.frame('idle'); } });
  }
  destroy() { this.dead = true; if (this.bobT) this.bobT.remove(); this.img.destroy(); this.shadow.destroy(); }
};
