/* ===== Techno Talk: จัดกลุ่ม (ลากการ์ดไปใส่ถังที่ถูกต้อง หรือแตะการ์ดแล้วแตะถัง) ===== */
class SortScene extends ActBase {
  constructor() { super('Sort'); this.ACT = 'sort'; }
  init(d) { super.init(d); this.set = TK.makeSort(this.unit, (Date.now() & 0xfffffff) + 1); this.placed = 0; this.sel = null; this.cardOf = {}; this.fill = {}; this.hl = null; }
  create() {
    this.begin(); this.HOW = '1. การ์ดอยู่ในถาดด้านล่าง ลากแต่ละใบไปใส่ถังที่ถูกต้องด้านบน\n2. หรือแตะการ์ดก่อน แล้วแตะที่ถังก็ได้\n3. ถ้าวางผิด การ์ดจะเด้งกลับและบอกเหตุผล ลองใหม่ได้เลย\n4. จัดครบทุกใบจึงผ่าน พลาดน้อยได้ดาวเยอะ';
    const S = this.set, n = S.groups.length; this.makePips(S.items.length, 470, { r: 8, gap: 26 });
    // ถัง
    const bw = Math.min(380, (PLAY.w - 24 - (n - 1) * 22) / n), bh = 244, y0 = 100; this.buckets = [];
    S.groups.forEach((g, i) => {
      const cx = GW / 2 + (i - (n - 1) / 2) * (bw + 22), rect = { x: cx - bw / 2, y: y0, w: bw, h: bh };
      const card = addCard(this, cx, y0 + bh / 2, bw, bh, { r: 26, band: { h: 58, color: g.color }, fill: ['#ffffff', '#f6f0ff'], shadow: 8 }).setDepth(1);
      const t = KG.txt(this, cx, y0 + 30, g.en, { size: 36, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 5 }).setDepth(2); fitText(t, bw - 30);
      this.txt(cx, y0 + 82, g.th, { size: 18, weight: 400, color: '#6a64a0', center: true, ox: 0.5 }).setDepth(2);
      const hl = this.add.graphics().setDepth(3); this.buckets.push({ g, rect, cx, hl, count: 0 });
      const z = this.add.zone(cx, y0 + bh / 2, bw, bh).setDepth(4).setInteractive({ useHandCursor: true }); z.on('pointerup', () => { if (this.sel) this.tryPlace(this.sel, g.id); });
    });
    // ถาดการ์ด
    this.tray = { x: 24, y: 356, w: PLAY.w, h: 276 };
    addCard(this, GW / 2, this.tray.y + this.tray.h / 2, this.tray.w, this.tray.h, { r: 28, fill: ['#ffffffd0', '#efe6ffd0'], shadow: 6, lw: 3, dash: true }).setDepth(1);
    const items = S.items, per = items.length > 5 ? Math.ceil(items.length / 2) : items.length, rows = items.length > 5 ? 2 : 1, cw = 136, ch = 124, gx = 18, gy = 14;
    items.forEach((it, k) => {
      const r = Math.floor(k / per), c = k % per, cnt = r === rows - 1 ? items.length - per * (rows - 1) : per;
      const x = GW / 2 + (c - (cnt - 1) / 2) * (cw + gx), y = this.tray.y + this.tray.h / 2 + (rows === 1 ? 0 : (r - 0.5) * (ch + gy));
      this.makeCard(it, x, y, cw, ch);
    });
    this.say(S.title + ' · ' + S.th + ' ลากการ์ดไปใส่ถังที่ถูกต้องนะ มีทั้งหมด ' + items.length + ' ใบ', 'code'); this.setPips(0);
  }
  makeCard(it, x, y, w, h) {
    const c = this.add.container(x, y).setDepth(10); c.home = { x, y }; c.item = it;
    c.add(addCard(this, 0, 0, w, h, { r: 20, fill: ['#ffffff', '#fff6dc'], shadow: 6, lw: 3.5 }));
    if (it.textOnly) { const long = it.label.length > 6, t = KG.txt(this, 0, 0, it.label, { size: long ? 22 : 46, color: PCOL[it.key] || TKC.ink, center: true, middle: true, width: long ? w - 12 : 0 }); fitText(t, w - 16); c.add(t); }
    else if (it.label) { c.add(pic(this, it.pic, 0, -14, w - 22, h - 46)); const t = KG.txt(this, 0, h / 2 - 20, it.label, { size: 21, color: TKC.ink, center: true, middle: true }); fitText(t, w - 14); c.add(t); }
    else c.add(pic(this, it.pic, 0, 0, w - 16, h - 14));
    this.cardOf[it.id] = c;
    dragify(this, c, w, h, {
      start: () => { if (this.done || this.paused) return; this.selectCard(null); c.setDepth(60); c.setScale(1.1); KG.audio.play('pop'); },
      drop: (x2, y2) => { if (this.done || this.paused) { this.back(c); return; } c.setScale(1); const b = this.bucketAt(x2, y2); if (b) this.tryPlace(c, b.g.id); else { this.back(c); } },
      tap: () => { if (this.done || this.paused) return; this.selectCard(this.sel === c ? null : c); KG.audio.play('tap'); }
    });
    return c;
  }
  bucketAt(x, y) { return this.buckets.find(b => inBox(x, y, b.rect)) || null; }
  back(c, shake) { this.homeBack(c, shake); }
  selectCard(c) {
    if (this.sel) { this.tweens.add({ targets: this.sel, y: this.sel.home.y, scaleX: 1, scaleY: 1, duration: 120 }); this.sel.list[0].setTint(0xffffff); }
    this.sel = c; if (c) { this.tweens.add({ targets: c, y: c.home.y - 12, scaleX: 1.08, scaleY: 1.08, duration: 120 }); c.list[0].setTint(0xffe58a); }
  }
  tryPlace(c, gid) {
    const it = c.item, b = this.buckets.find(x => x.g.id === gid); this.hl = null;
    if (it.g === gid) {
      this.placed++; this.setPips(this.placed); if (this.sel === c) this.sel = null; c.list[0].setTint(0xffffff); c.disableInteractive();
      const k = b.count++, cols = Math.max(2, Math.floor((b.rect.w - 12) / 68)), col = k % cols, row = Math.floor(k / cols), tx = b.rect.x + (b.rect.w - cols * 68) / 2 + 34 + col * 68, ty = b.rect.y + 148 + row * 62;
      c.setDepth(20); if (it.textOnly) this.placeChip(b, it, c); else this.tweens.add({ targets: c, x: tx + 0, y: ty, scaleX: 0.46, scaleY: 0.46, duration: 260, ease: 'Back.easeOut' });
      b.hl.clear(); this.good(b.cx, b.rect.y + 150); if (it.label) this.speak(it.label);
      this.say('ถูกต้อง! ' + (it.label ? it.label + ' ' : 'ใบนี้ ') + 'อยู่ในกลุ่ม “' + b.g.en + '” (' + b.g.th + ')', 'happy');
      if (this.placed === this.set.items.length) this.time.delayedCall(700, () => this.finish([['จัดกลุ่มสำเร็จ', this.placed + ' ใบ']]));
    } else {
      this.mistakes++; this.bad(null); this.say(TK.sortReason(this.set, it, gid), 'sad'); this.selectCard(null); this.back(c, true);
      b.hl.clear(); b.hl.lineStyle(6, 0xee4a4a, 1); b.hl.strokeRoundedRect(b.rect.x - 3, b.rect.y - 3, b.rect.w + 6, b.rect.h + 6, 28); this.time.delayedCall(500, () => b.hl.clear());
    }
  }
  // การ์ดข้อความล้วนที่วางถูกแล้ว: ย่อเป็นป้ายข้อความเรียงต่อกันในถัง (ตัวหนังสืออ่านง่ายกว่าการ์ดย่อ)
  placeChip(b, it, c) {
    const w = Math.ceil(KG.measure(it.label, '600 21px Kanit')) + 28, h = 36; b.flow = b.flow || { x: 0, y: 0 };
    if (b.flow.x + w > b.rect.w - 16) { b.flow.x = 0; b.flow.y += h + 6; }
    const cx = b.rect.x + 10 + b.flow.x + w / 2, cy = b.rect.y + 138 + b.flow.y; b.flow.x += w + 8;
    const chip = this.add.container(c.x, c.y).setDepth(20); chip.add(addCard(this, 0, 0, w, h, { r: 20, lw: 3, shadow: 3, fill: ['#ffffff', '#fff6dc'] })); chip.add(KG.txt(this, 0, 0, it.label, { size: 21, color: PCOL[it.key] || TKC.ink, center: true, middle: true }));
    chip.setScale(0.6); c.setVisible(false); this.tweens.add({ targets: chip, x: cx, y: cy, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' });
  }
  hint() {
    if (this.done) return; const it = this.set.items.find(i => this.cardOf[i.id].input && this.cardOf[i.id].input.enabled); if (!it) return;
    this.hints++; const c = this.cardOf[it.id], b = this.buckets.find(x => x.g.id === it.g); KG.audio.play('pop');
    b.hl.clear(); b.hl.lineStyle(6, 0xffc82e, 1); b.hl.strokeRoundedRect(b.rect.x - 3, b.rect.y - 3, b.rect.w + 6, b.rect.h + 6, 28);
    this.tweens.add({ targets: c, y: c.home.y - 14, duration: 200, yoyo: true, repeat: 3 }); this.time.delayedCall(2200, () => b.hl.clear());
    this.say('คำใบ้: ' + (it.label ? it.label + ' ' : 'ใบที่เด้งอยู่ ') + 'ไปอยู่ในกลุ่ม “' + b.g.en + '” (' + b.g.th + ') ลองลากไปที่ถังที่มีกรอบเหลือง', 'open');
  }
}
