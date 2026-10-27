/* ===== Techno Talk: ลากวาง (ลากการ์ดคำมาเรียงต่อเป็นประโยค มีการ์ดลวงที่ใช้ไม่ได้) 6 ประโยค ===== */
const TILE_FILL = ['#ffe0ee', '#dcebff', '#d6f8ef', '#fff0d2', '#eee2ff'];
class BuildScene extends ActBase {
  constructor() { super('Build'); this.ACT = 'build'; }
  init(d) { super.init(d); this.rounds = TK.makeBuild(this.unit, (Date.now() & 0xfffffff) + 7, 6); this.ri = 0; this.objs = []; this.slots = []; this.tiles = []; this.filled = 0; this.locking = false; }
  create() {
    this.begin(); this.HOW = '1. ดูภาพและคำแปลภาษาไทย แล้วต่อประโยคภาษาอังกฤษให้ตรงกัน\n2. ลากการ์ดคำจากด้านล่างไปวางในช่องตามลำดับ หรือแตะการ์ดให้ไปเข้าช่องว่างช่องแรก\n3. มีการ์ดลวงที่ใช้ไม่ได้ปนอยู่ เช่น am is are ผิดตัว ดูให้ดีว่าประธานคือใคร\n4. กดปุ่ม ‘ฟังประโยค’ เพื่อฟังเสียงอ่านเป็นแนวทาง';
    this.makePips(this.rounds.length, 600); this.startRound();
  }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.slots = []; this.tiles = []; this.filled = 0; this.locking = false;
    const b = this.cur = this.rounds[this.ri], add = o => { this.objs.push(o); return o; };
    // ภาพ + คำแปล
    add(addCard(this, 222, 258, 360, 300, { r: 30, fill: ['#fffdf2', '#ffefc2'], shadow: 8 }).setDepth(3)); add(pic(this, b.pic, 222, 258, 330, 270).setDepth(4));
    const thW = Math.min(780, Math.ceil(KG.measure(b.th, '600 42px Kanit')) + 80);   // ป้ายขาวรองประโยคไทย อ่านชัดทั้งฉากสว่างและฉากกลางคืน
    add(addCard(this, 840, 156, thW, 116, { r: 30, shadow: 6, lw: 3.5, fill: ['#ffffff', '#f6f0ff'] }).setDepth(2));
    add(KG.txt(this, 840, 114, 'ประโยคภาษาไทย', { size: 16, weight: 400, color: '#6a64a0', center: true, ox: 0.5 }).setDepth(3));
    add(fitText(KG.txt(this, 840, 166, b.th, { size: 40, color: TKC.ink, center: true, middle: true }).setDepth(3), thW - 50));
    const lb = add(new KG.ui.Button(this, 222, 442, 250, 54, { label: SPEECH.exists ? 'ฟังประโยค' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 24, slant: 8, onClick: () => this.speak(b.en) })); lb.setEnabled(SPEECH.exists);
    // ช่องวาง
    const font = '600 38px Kanit', gap = 16, h = 70, ws = b.tokens.map(t => Math.max(96, Math.ceil(KG.measure(t, font)) + 50)), maxW = 780, lines = []; let cur = [], w = 0;
    ws.forEach((wi, i) => { if (cur.length && w + gap + wi > maxW) { lines.push({ idx: cur, w }); cur = []; w = 0; } w += (cur.length ? gap : 0) + wi; cur.push(i); }); lines.push({ idx: cur, w });
    const y0 = lines.length > 1 ? 250 : 292, lh = h + 16;
    lines.forEach((ln, li) => { let x = 840 - ln.w / 2; ln.idx.forEach(i => { const cx = x + ws[i] / 2, cy = y0 + li * lh, rect = { x: cx - ws[i] / 2 - 8, y: cy - h / 2 - 8, w: ws[i] + 16, h: h + 16 }; const img = add(this.add.image(cx, cy, cardTex(this, ws[i], h, { r: 24, lw: 3, shadow: 0, dash: true, fill: ['#ffffffa0', '#ffffff60'], edge: '#8a84c0' }).key).setDisplaySize(ws[i] + 24, h + 24).setDepth(3)); this.slots.push({ i, cx, cy, w: ws[i], h, rect, img, tile: null }); x += ws[i] + gap; }); });
    // ถาดการ์ดคำ
    add(addCard(this, GW / 2, 548, PLAY.w, 168, { r: 28, fill: ['#ffffffd0', '#efe6ffd0'], shadow: 6, lw: 3, dash: true }).setDepth(1));
    const tw = b.tiles.map(t => Math.max(96, Math.ceil(KG.measure(t.text, font)) + 50)), rowsT = []; cur = []; w = 0;
    tw.forEach((wi, i) => { if (cur.length && w + gap + wi > 1000) { rowsT.push({ idx: cur, w }); cur = []; w = 0; } w += (cur.length ? gap : 0) + wi; cur.push(i); }); rowsT.push({ idx: cur, w });
    const ty0 = 548 - (rowsT.length - 1) * (h + 12) / 2;
    rowsT.forEach((ln, li) => { let x = GW / 2 - ln.w / 2; ln.idx.forEach(i => { const t = b.tiles[i], cx = x + tw[i] / 2, cy = ty0 + li * (h + 12); this.makeTile(t, cx, cy, tw[i], h, i); x += tw[i] + gap; }); });
    this.setPips(this.ri); this.say('ประโยคที่ ' + (this.ri + 1) + '/' + this.rounds.length + ': ลากการ์ดคำมาต่อเป็นประโยคภาษาอังกฤษนะ', 'laptop');
  }
  makeTile(t, x, y, w, h, i) {
    const c = this.add.container(x, y).setDepth(10); this.objs.push(c); c.home = { x, y }; c.tile = t;
    c.add(addCard(this, 0, 0, w, h, { r: 24, fill: ['#ffffff', TILE_FILL[i % TILE_FILL.length]], shadow: 6, lw: 3.5 })); c.add(KG.txt(this, 0, -1, t.text, { size: 38, color: TKC.ink, center: true, middle: true }));
    this.tiles.push(c);
    dragify(this, c, w, h, {
      start: () => { if (this.busy()) return; c.setDepth(60); c.setScale(1.1); KG.audio.play('pop'); },
      drop: (x2, y2) => { c.setScale(1); if (this.busy()) { this.back(c); return; } const s = this.slotAt(x2, y2); if (s) this.tryPlace(c, s); else this.back(c); },
      tap: () => { if (this.busy()) return; const s = this.slots.find(q => !q.tile); if (s) this.tryPlace(c, s); }
    });
  }
  busy() { return this._modal || this.done || this.paused || this.locking; }
  slotAt(x, y) { return this.slots.find(s => !s.tile && inBox(x, y, s.rect)) || null; }
  back(c, shake) { this.homeBack(c, shake); }
  tryPlace(c, s) {
    const r = TK.buildDrop(this.cur, s.i, c.tile);
    if (r.ok) {
      s.tile = c; this.filled++; c.disableInteractive(); c.setDepth(20); this.tweens.add({ targets: c, x: s.cx, y: s.cy, scaleX: 1, scaleY: 1, duration: 220, ease: 'Back.easeOut' }); KG.audio.play('drop');
      if (this.filled === this.slots.length) this.complete(); else this.say('ถูกต้อง! ต่อคำถัดไปเลย', 'happy');
    } else { this.mistakes++; this.bad(null); this.back(c, true); this.say(r.why, 'sad'); }
  }
  complete() {
    this.locking = true; const b = this.cur; this.setPips(this.ri + 1); this.good(840, this.slots[0].cy); KG.fx.confetti(this, { ms: 500 });
    this.slots.forEach((s, k) => this.tweens.add({ targets: s.tile, scaleX: 1.08, scaleY: 1.08, duration: 140, yoyo: true, delay: k * 80 })); this.speak(b.en); this.say('เยี่ยมมาก! ' + b.en + ' = ' + b.th, 'happy');
    this.time.delayedCall(1900, () => { this.ri++; if (this.ri >= this.rounds.length) this.finish([['ต่อประโยคสำเร็จ', this.rounds.length + ' ประโยค']]); else this.startRound(); });
  }
  hint() {
    if (this.done || this.locking) return; const s = this.slots.find(q => !q.tile); if (!s) return; const need = this.cur.tokens[s.i], c = this.tiles.find(q => q.input && q.input.enabled && q.tile.text === need); if (!c) return;
    this.hints++; KG.audio.play('pop'); const g = this.add.graphics().setDepth(70); g.lineStyle(7, 0xffc82e, 1); g.strokeRoundedRect(s.rect.x, s.rect.y, s.rect.w, s.rect.h, 24); this.objs.push(g);
    this.tweens.add({ targets: c, y: c.home.y - 16, duration: 200, yoyo: true, repeat: 3 }); this.tweens.add({ targets: g, alpha: 0.25, duration: 300, yoyo: true, repeat: 3, onComplete: () => g.destroy() });
    this.say('คำใบ้: ช่องที่มีกรอบเหลืองต้องการคำว่า “' + need.replace(/[.,?!]/g, '') + '” (การ์ดที่กระโดดอยู่)', 'open');
  }
}
