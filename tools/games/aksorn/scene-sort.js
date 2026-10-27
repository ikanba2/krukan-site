/* ===== Techno Aksorn: แยกกลุ่ม (พยัญชนะ: อักษรกลาง/สูง/ต่ำ · สระ: เสียงสั้น/เสียงยาว) ลากการ์ดไปใส่ถัง หรือแตะการ์ดแล้วแตะถัง ===== */
const SORT_NOTE = {
  m: 'ก จ ฎ ฏ ด ต บ ป อ', h: 'ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห', l: 'ตัวที่เหลือ 24 ตัว',
  s: '–ะ –ิ –ึ –ุ เ–ะ แ–ะ โ–ะ', lg: '–า –ี –ื –ู เ– แ– โ–'
};
class SortScene extends ActBase {
  constructor() { super('Sort'); }
  init(d) {
    d = d || {}; const L = lessonOf(d.lesson); this.ACT = d.act || (L && L.zone === 'vow' ? 'lengthsort' : 'classsort'); super.init(d);
    this.set = AK.makeSort(this.lesson, this.lv, (Date.now() & 0xfffffff) + 61, this.ACT); this.placed = 0; this.sel = null; this.cardOf = {}; this.cls = this.ACT === 'classsort'; this.r2 = !!this.set.itemWord;
  }
  create() {
    this.begin(); this.HOW = this.r2 ? this.set.how : this.cls
      ? '1. การ์ดตัวอักษรอยู่ในถาดด้านล่าง ลากแต่ละใบไปใส่ถังที่ถูกต้อง\n2. อักษรกลางมี 9 ตัว (ก จ ฎ ฏ ด ต บ ป อ) อักษรสูงมี 11 ตัว ที่เหลือเป็นอักษรต่ำ\n3. ถ้าวางผิด การ์ดจะเด้งกลับและบอกว่าตัวนั้นเป็นอักษรหมู่ไหน\n4. จัดครบทุกใบจึงผ่าน'
      : '1. การ์ดสระอยู่ในถาดด้านล่าง ลากแต่ละใบไปใส่ถังเสียงสั้นหรือเสียงยาว\n2. เสียงสั้นออกเสียงสั้น ๆ เช่น –ะ –ิ –ึ –ุ ส่วนเสียงยาวลากเสียงนาน เช่น –า –ี –ื –ู\n3. ถ้าวางผิด การ์ดจะเด้งกลับและบอกว่าสระนั้นเสียงอะไร\n4. จัดครบทุกใบจึงผ่าน';
    const S = this.set, n = S.groups.length; this.makePips(S.items.length, 470); this.pipObjs.forEach((c, i) => { c.setRadius(8); c.x = 470 + i * 26; });
    const bw = Math.min(390, (PLAY.w - 24 - (n - 1) * 22) / n), bh = 244, y0 = 100; this.buckets = [];
    S.groups.forEach((g, i) => {
      const cx = GW / 2 + (i - (n - 1) / 2) * (bw + 22), rect = { x: cx - bw / 2, y: y0, w: bw, h: bh };
      addCard(this, cx, y0 + bh / 2, bw, bh, { r: 26, band: { h: 58, color: g.color }, fill: ['#ffffff', '#f6f0ff'], shadow: 8 }).setDepth(1);
      fitText(KG.txt(this, cx, y0 + 30, g.th, { size: 34, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 5 }).setDepth(2), bw - 30);
      const note = this.r2 ? this.set.notes[g.id] : this.cls ? SORT_NOTE[g.id] : SORT_NOTE[g.id === 's' ? 's' : 'lg']; fitText(glyph(this, cx, y0 + 90, note, this.r2 ? 21 : this.cls && g.id === 'l' ? 20 : 25, '#6a64a0').setDepth(2), bw - 24);
      const hl = this.add.graphics().setDepth(3); this.buckets.push({ g, rect, cx, hl, count: 0 });
      this.add.zone(cx, y0 + bh / 2, bw, bh).setDepth(4).setInteractive({ useHandCursor: true }).on('pointerup', () => { if (this.sel) this.tryPlace(this.sel, g.id); });
    });
    this.tray = { x: 24, y: 356, w: PLAY.w, h: 276 };
    addCard(this, GW / 2, this.tray.y + this.tray.h / 2, this.tray.w, this.tray.h, { r: 28, fill: ['#ffffffd0', '#efe6ffd0'], shadow: 6, lw: 3, dash: true }).setDepth(1);
    const items = S.items, per = items.length > 5 ? Math.ceil(items.length / 2) : items.length, rows = items.length > 5 ? 2 : 1, cw = 132, ch = 118, gx = 20, gy = 14;
    items.forEach((it, k) => {
      const r = Math.floor(k / per), c = k % per, cnt = r === rows - 1 ? items.length - per * (rows - 1) : per, x = GW / 2 + (c - (cnt - 1) / 2) * (cw + gx), y = this.tray.y + this.tray.h / 2 + (rows === 1 ? 0 : (r - 0.5) * (ch + gy));
      this.makeCard(it, x, y, cw, ch);
    });
    this.say(S.title + ' ลากการ์ดไปใส่ถังที่ถูกต้องนะ มีทั้งหมด ' + items.length + ' ใบ', 'smile'); this.setPips(0);
  }
  makeCard(it, x, y, w, h) {
    const inf = AK.info(it.key), c = this.add.container(x, y).setDepth(10); c.home = { x, y }; c.item = it; c.inf = inf;
    c.add(addCard(this, 0, 0, w, h, { r: 22, fill: ['#ffffff', '#fff6dc'], shadow: 6, lw: 3.5 })); if (inf.kind === 'w') c.add(richText(this, 0, 0, inf.text, inf.text.length > 3 ? 60 : 72, { maxW: w - 16 })); else c.add(glyph(this, 0, 0, inf.text, inf.text.length > 3 ? 50 : inf.text.length > 2 ? 62 : 78, TKC.ink));
    this.cardOf[it.key] = c;
    dragify(this, c, w, h, {
      start: () => { if (this.done || this.paused) return; this.selectCard(null); c.setDepth(60); c.setScale(1.1); KG.audio.play('pop'); this.speak(inf.say); },
      drop: (x2, y2) => { if (this.done || this.paused) { this.homeBack(c); return; } c.setScale(1); const b = this.buckets.find(q => inBox(x2, y2, q.rect)); if (b) this.tryPlace(c, b.g.id); else this.homeBack(c); },
      tap: () => { if (this.done || this.paused) return; this.selectCard(this.sel === c ? null : c); KG.audio.play('tap'); this.speak(inf.say); }
    });
    return c;
  }
  selectCard(c) {
    if (this.sel) { this.tweens.add({ targets: this.sel, y: this.sel.home.y, scaleX: 1, scaleY: 1, duration: 120 }); this.sel.list[0].setTint(0xffffff); }
    this.sel = c; if (c) { this.tweens.add({ targets: c, y: c.home.y - 12, scaleX: 1.08, scaleY: 1.08, duration: 120 }); c.list[0].setTint(0xffe58a); }
  }
  groupTh(gid) { return this.set.groups.find(g => g.id === gid).th; }
  tryPlace(c, gid) {
    const it = c.item, inf = c.inf, b = this.buckets.find(x => x.g.id === gid);
    if (it.g === gid) {
      this.placed++; this.setPips(this.placed); if (this.sel === c) this.sel = null; c.list[0].setTint(0xffffff); c.disableInteractive(); c.setDepth(20);
      const cols = Math.max(2, Math.floor((b.rect.w - 16) / 70)), k = b.count++, col = k % cols, row = Math.floor(k / cols), tx = b.rect.x + (b.rect.w - cols * 70) / 2 + 35 + col * 70, ty = b.rect.y + 138 + row * 56;
      this.tweens.add({ targets: c, x: tx, y: ty, scaleX: 0.5, scaleY: 0.45, duration: 260, ease: 'Back.easeOut' }); this.good(b.cx, b.rect.y + 150); this.speak(inf.say);
      this.say(this.r2 ? 'ถูกต้อง! ' + this.set.why(it.key) : 'ถูกต้อง! ' + inf.label + ' เป็น' + b.g.th + (this.cls ? '' : ' (ออกเสียง' + b.g.th.replace('เสียง', '') + ')'), 'happy');
      if (this.placed === this.set.items.length) this.time.delayedCall(700, () => this.finish([['จัดกลุ่มสำเร็จ', this.placed + ' ใบ']]));
    } else {
      this.mistakes++; this.bad(null); this.selectCard(null); this.homeBack(c, true);
      this.say(this.r2 ? this.set.why(it.key) + ' ไม่ใช่' + this.groupTh(gid) + ' ลองใหม่นะ' : this.cls ? 'ตัว ' + inf.text + ' (' + inf.label + ') เป็น' + this.groupTh(it.g) + ' ไม่ใช่' + this.groupTh(gid) + ' ลองใหม่นะ' : inf.say + ' เป็น' + this.groupTh(it.g) + ' ไม่ใช่' + this.groupTh(gid) + ' ลองออกเสียงดูนะ', 'sad');
      b.hl.clear(); b.hl.lineStyle(6, 0xee4a4a, 1); b.hl.strokeRoundedRect(b.rect.x - 3, b.rect.y - 3, b.rect.w + 6, b.rect.h + 6, 28); this.time.delayedCall(500, () => b.hl.clear());
    }
  }
  hint() {
    if (this.done) return; const it = this.set.items.find(i => this.cardOf[i.key].input && this.cardOf[i.key].input.enabled); if (!it) return;
    this.hints++; const c = this.cardOf[it.key], b = this.buckets.find(x => x.g.id === it.g); KG.audio.play('pop');
    b.hl.clear(); b.hl.lineStyle(6, 0xffc82e, 1); b.hl.strokeRoundedRect(b.rect.x - 3, b.rect.y - 3, b.rect.w + 6, b.rect.h + 6, 28);
    this.tweens.add({ targets: c, y: c.home.y - 14, duration: 200, yoyo: true, repeat: 3 }); this.time.delayedCall(2200, () => b.hl.clear());
    this.say('คำใบ้: ใบที่เด้งอยู่ (' + c.inf.label + ') ไปอยู่ในถัง “' + b.g.th + '” ลองลากไปที่ถังที่มีกรอบเหลือง', 'open');
  }
}
