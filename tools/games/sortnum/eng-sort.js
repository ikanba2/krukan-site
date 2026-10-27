/* ===== เรียงลำดับตัวเลข: SortEng สืบทอดจาก MathEng (mathkit/mk-eng.js) =====
   โจทย์: sort (แตะเลขตามลำดับ หรือลากไปวางในช่อง) · cmp (> < = หรือเลือกอันที่มากกว่า) · maxmin · neighbor · missing · skip · between · place
   ตัวสร้างโจทย์อยู่ที่ mathkit/mk-gen.js (MK.make) · พลาดไม่ตกด่าน นับเป็นพลาดเพื่อคิดดาว · พลาดครบสองครั้งในรอบเดียวจะมีแสงใบ้ */
const SN_PLACE = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น'];
class SortEng extends MathEng {
  constructor(s, p) {
    super(s, p); this.tiles = []; this.slots = []; this.placed = 0;
    this.onStart = (pt, o) => this.dragStart(pt, o); this.onDrag = (pt, o, x, y) => this.dragMove(pt, o, x, y); this.onEnd = (pt, o) => this.dragEnd(pt, o);
    s.input.on('dragstart', this.onStart); s.input.on('drag', this.onDrag); s.input.on('dragend', this.onEnd);
  }
  destroy() { const s = this.s; s.input.off('dragstart', this.onStart); s.input.off('drag', this.onDrag); s.input.off('dragend', this.onEnd); super.destroy(); }
  clear() { super.clear(); this.tiles = []; this.slots = []; this.placed = 0; }
  /* ---------- เรียงเลข ---------- */
  r_sort(q) {
    const s = this.s, n = q.nums.length, u = n <= 3 ? 1.4 : n === 4 ? 1.25 : n === 5 ? 1.1 : 1, tw0 = Math.max(...q.nums.map(v => this.digW(v))) * u, th0 = 100 * u, f = Math.min(1, 800 / (n * (tw0 + 16))), tw = tw0 * f, th = th0 * f, asc = q.dir === 'asc';
    this.setPrompt(q.text, q.spoken); this.txt(660, 196, 'แตะเลขตามลำดับ หรือลากไปวางในช่อง', { size: 20, weight: 400, color: '#7a77a8' });
    const sy = 548, gap = Math.min(tw + 18, 800 / n), x0 = 660 - (n - 1) * gap / 2, xe = x0 + (n - 1) * gap;
    for (let i = 0; i < n; i++) {
      const im = this.add(s.add.image(x0 + i * gap, sy, this.slotTex(tw0, th0)).setDepth(6).setScale(f)); const no = this.add(KG.txt(s, x0 + i * gap, sy + th / 2 + 24, String(i + 1), { size: 20, color: '#7a77a8', center: true, middle: true }).setDepth(7));
      this.slots.push({ x: x0 + i * gap, y: sy, w: tw, h: th, filled: null, im, no });
    }
    // ป้ายซ้ายขวาของแถว (ทิศการเรียง) พร้อมลูกศรสั้นกลางแถว
    const ly = sy - th / 2 - 30, lt = this.add(KG.txt(s, x0 - tw / 2, ly, asc ? 'น้อยที่สุด' : 'มากที่สุด', { size: 24, color: asc ? '#3d8bff' : '#e0243d', oy: 0.5 }).setDepth(7)), rt = this.add(KG.txt(s, xe + tw / 2, ly, asc ? 'มากที่สุด' : 'น้อยที่สุด', { size: 24, color: asc ? '#e0243d' : '#3d8bff', ox: 1, oy: 0.5 }).setDepth(7));
    const ax0 = x0 - tw / 2 + lt.width + 14, ax1 = xe + tw / 2 - rt.width - 14; if (ax1 - ax0 > 60) { const ar = this.add(s.add.graphics().setDepth(5)); ar.lineStyle(5, 0x8a5cf0, 0.5); ar.lineBetween(ax0, ly, ax1 - 10, ly); ar.fillStyle(0x8a5cf0, 0.6); ar.fillTriangle(ax1 - 14, ly - 11, ax1 - 14, ly + 11, ax1 + 4, ly); }
    // กองเลขที่ต้องเรียง
    const cols = n <= 4 ? n : Math.ceil(n / 2), rows = n <= 4 ? 1 : 2, pg = Math.min(tw + 44, 790 / cols), py = rows === 1 ? 320 : 262;
    this.tiles = q.nums.map((v, i) => {
      const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols), x = 660 + (c - (inRow - 1) / 2) * pg + KG.rnd(-10, 10), y = py + r * (th + 40) + KG.rnd(-12, 12);
      const t = this.mkTile(x, y, v, { w: tw0, h: th0, color: this.colorFor(i), size: Math.round(Math.min(60 * u, (tw0 - 20) / Math.max(2, String(v).length) * 1.7)) }); t.setScale(f); t.setAngle(KG.rnd(-5, 5)); t.setSize(tw0, th0); t.setInteractive({ draggable: true, useHandCursor: true });
      t.dd = { home: { x, y }, ang: t.angle, locked: false, moved: false, sc: f, v }; t.on('pointerup', () => { if (!t.dd.moved) this.tapTile(t); }); return t;
    });
    this.popIn(this.tiles, 120); this.tiles.forEach(t => s.tweens.add({ targets: t, y: t.y - 6, duration: 1100 + KG.rnd(0, 500), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
    this.tw = tw; this.th = th; this.f = f;
  }
  nextFree() { return this.slots.findIndex(sl => !sl.filled); }
  dragStart(pt, o) { if (!this.running || this.busy || !o.dd || o.dd.locked) return; o.dd.moved = false; o.dd.p0 = { x: o.x, y: o.y }; o.setDepth(60); this.s.tweens.killTweensOf(o); this.s.tweens.add({ targets: o, scaleX: o.dd.sc * 1.12, scaleY: o.dd.sc * 1.12, angle: 0, duration: 110 }); KG.audio.play('pop'); }
  dragMove(pt, o, x, y) { if (!o.dd || o.dd.locked || !this.running) return; o.x = x; o.y = y; if (o.dd.p0 && Math.hypot(x - o.dd.p0.x, y - o.dd.p0.y) > 12) o.dd.moved = true; }
  dragEnd(pt, o) {
    if (!o.dd || o.dd.locked) return; if (!o.dd.moved) { this.back(o); return; }
    let best = -1, bd = 1e9; this.slots.forEach((sl, i) => { const d = Math.hypot(o.x - sl.x, o.y - sl.y); if (d < bd && d < Math.max(sl.w, sl.h) * 0.9) { bd = d; best = i; } });
    if (best < 0) { this.back(o); return; } this.put(o, best, true);
  }
  back(o) { o.setDepth(12); this.s.tweens.killTweensOf(o); this.s.tweens.add({ targets: o, scaleX: o.dd.sc, scaleY: o.dd.sc, x: o.dd.home.x, y: o.dd.home.y, angle: o.dd.ang, duration: 260, ease: 'Back.easeOut' }); }
  tapTile(t) { if (!this.running || this.busy || t.dd.locked) return; const i = this.nextFree(); if (i >= 0) this.put(t, i, false); }
  // วางเลขลงช่อง: ถูกเมื่อเป็นเลขที่ควรอยู่ช่องนั้น
  put(t, idx, dragged) {
    const s = this.s, sl = this.slots[idx]; if (!sl || sl.filled) { this.back(t); return; }
    if (t.dd.v === this.q.sorted[idx]) {
      t.dd.locked = true; t.disableInteractive(); sl.filled = t; this.placed++; s.tweens.killTweensOf(t); t.setDepth(14);
      s.tweens.add({ targets: t, x: sl.x, y: sl.y, scaleX: this.f, scaleY: this.f, angle: 0, duration: 200, ease: 'Back.easeOut', onComplete: () => { mkRing(s, sl.x, sl.y, KG.kit.hexInt(t.color)); } });
      KG.audio.tone({ f: KG.kit.mtof(62 + idx * 2), t: 0.22, type: 'triangle', vol: 0.13 }); KG.audio.tone({ f: KG.kit.mtof(74 + idx * 2), t: 0.16, type: 'sine', vol: 0.05, delay: 0.04 });
      if (this.hintObj) { this.hintObj.destroy(); this.hintObj = null; }
      if (this.placed === this.slots.length) this.finishSort();
    } else {
      this.wrong++; this.back(t); const asc = this.q.dir === 'asc';
      s.bad(t.x, t.y, dragged ? 'ช่องนี้ยังไม่ใช่ที่ของเลขนี้' : (asc ? 'ยังมีเลขที่น้อยกว่านี้อยู่' : 'ยังมีเลขที่มากกว่านี้อยู่'));
      s.tweens.add({ targets: t, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 2, onComplete: () => t.setAngle(t.dd.ang) });
      if (this.wrong >= 2) this.hintSort();
    }
  }
  hintSort() {
    const i = this.nextFree(); if (i < 0) return; const t = this.tiles.find(o => !o.dd.locked && o.dd.v === this.q.sorted[i]); if (!t) return;
    if (this.hintObj) this.hintObj.destroy(); const r = this.s.add.image(t.x, t.y, 'fx_glow').setTint(0xffd34f).setDisplaySize(t.tw * 1.9, t.th * 2.3).setDepth(11).setAlpha(0); this.hintObj = this.add(r);
    this.s.tweens.add({ targets: r, alpha: 0.95, duration: 380, yoyo: true, repeat: -1 }); this.s.hints++; this.s.coach.react('hint', this.q.dir === 'asc' ? 'เริ่มจากเลขที่เล็กที่สุดนะ' : 'เริ่มจากเลขที่ใหญ่ที่สุดนะ');
  }
  finishSort() {
    const s = this.s; this.busy = true; if (this.hintObj) { this.hintObj.destroy(); this.hintObj = null; }
    // ไล่เสียงขึ้นเป็นบันไดเสียง ตัวเลขกระโดดเป็นคลื่น
    this.slots.forEach((sl, i) => s.time.delayedCall(i * 110, () => { s.tweens.add({ targets: sl.filled, y: sl.y - 26, duration: 130, yoyo: true, ease: 'Quad.easeOut' }); KG.audio.tone({ f: KG.kit.mtof(72 + i * 2), t: 0.18, type: 'triangle', vol: 0.1 }); }));
    s.time.delayedCall(this.slots.length * 110 + 80, () => { if (!this.alive) return; this.busy = false; this.roundDone(660, 470); });
  }
  /* ---------- โจทย์เลือกคำตอบ ---------- */
  wrongMsg() { const k = this.q.kind; return k === 'cmp' ? 'ลองดูเลขที่ใหญ่กว่านะ' : k === 'neighbor' ? 'ลองนับถอยหลังหรือไปข้างหน้า' : k === 'missing' || k === 'skip' ? 'ดูว่าเพิ่มหรือลดทีละเท่าไร' : 'ลองอีกที'; }
  r_cmp(q) {
    if (q.mode === 'sign') {
      this.setPrompt('เลือกเครื่องหมายให้ถูก', q.spoken); const w = Math.max(this.digW(q.a), this.digW(q.b), 130), a = this.mkTile(430, 310, q.a, { w, h: 130, size: 66, color: '#3d8bff' }), b = this.mkTile(890, 310, q.b, { w, h: 130, size: 66, color: '#ff9a2e' });
      this.qBox(660, 310, 130, 130); this.ansText = q.ans; this.popIn([a, b], 80); this.txt(660, 420, 'ปากจระเข้ หันไปทางเลขที่มากกว่า', { size: 22 });
      this.choose(q, { y: 540, w: 200, h: 104, size: 68, cols: 3, opts: ['>', '<', '='] });
    } else {
      this.setPrompt(q.text, q.spoken); this.ansText = null; this.txt(660, 280, q.text, { size: 46, color: '#2d2a5e' });
      this.choose(q, { y: 450, w: 230, h: 150, size: 78 });
    }
  }
  r_maxmin(q) { this.setPrompt(q.text, q.spoken); this.ansText = null; this.txt(660, 290, q.text, { size: 54, color: q.min ? '#3d8bff' : '#e0243d', stroke: '#ffffff', sw: 8 }); this.choose(q, { y: 470, h: 120, size: 56 }); }
  /* ---------- เลขที่มาก่อน/หลัง · ที่หายไป · นับข้าม · ระหว่าง ---------- */
  r_neighbor(q) {
    const s = this.s; this.setPrompt(q.text, q.spoken); const w = Math.max(this.digW(q.n), 120), n = this.mkTile(q.side === 'after' ? 520 : 800, 300, q.n, { w, h: 120, size: 60, color: '#3d8bff' });
    this.qBox(q.side === 'after' ? 800 : 520, 300, w, 120); this.ansText = MKS.comma(q.ans); this.popIn([n], 80);
    this.add(KG.ui.icon(s, 'chevR', 660, 300, 56, 0x8a5cf0).setDepth(9)); this.txt(q.side === 'after' ? 800 : 520, 400, q.side === 'after' ? 'มาหลัง' : 'มาก่อน', { size: 24, color: '#e0243d' });
    this.choose(q, { y: 530, h: 100, size: 52 });
  }
  row(q, seq, y) {
    const n = seq.length, tw = Math.max(...seq.map(v => (v == null ? 0 : this.digW(v))), 100), f = Math.min(1, 800 / (n * (tw + 24))), gap = Math.min((tw + 24) * f, 800 / n), x0 = 660 - (n - 1) * gap / 2, tiles = [];
    seq.forEach((v, i) => {
      const x = x0 + i * gap; if (v == null) { this.qBox(x, y, tw * f, 110 * f); this.ansText = MKS.comma(q.ans); } else { const t = this.mkTile(x, y, v, { w: tw, h: 110, size: 52, color: this.colorFor(i) }); t.setScale(f); tiles.push(t); }
    });
    this.popIn(tiles, 80); return { x0, gap, f, tw };
  }
  r_missing(q) { this.setPrompt(q.text, q.spoken); this.row(q, q.seq, 310); this.choose(q, { y: 520, h: 100, size: 52 }); }
  r_skip(q) {
    const s = this.s; this.setPrompt(q.text, q.spoken); const seq = q.seq.concat([null]), r = this.row(q, seq, 330), up = q.dir === 'up';
    for (let i = 0; i < seq.length - 1; i++) {
      const x = r.x0 + i * r.gap + r.gap / 2;
      this.add(s.add.image(x, 250, KG.tex(s, 'snjump|' + (up ? '+' : '-') + q.step, 84, 44, c => { KG.ui.rrect(c, 2, 2, 80, 36, 18); c.fillStyle = up ? '#ffe28a' : '#ffc0d0'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2d2a5e'; c.stroke(); c.font = '600 22px Kanit'; c.fillStyle = '#2d2a5e'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText((up ? '+' : '−') + MKS.comma(q.step), 42, 22); })).setDepth(9));
    }
    this.choose(q, { y: 540, h: 100, size: 52 });
  }
  r_between(q) {
    this.setPrompt(q.text, q.spoken); const w = Math.max(this.digW(q.a), this.digW(q.b)), a = this.mkTile(440, 300, q.a, { w, h: 120, size: 56, color: '#3d8bff' }), b = this.mkTile(880, 300, q.b, { w, h: 120, size: 56, color: '#ff9a2e' });
    this.qBox(660, 300, w, 120); this.ansText = MKS.comma(q.ans); this.popIn([a, b], 80); this.txt(660, 400, 'อยู่ระหว่างสองเลขนี้', { size: 22 });
    this.choose(q, { y: 530, h: 100, size: 52 });
  }
  r_place(q) {
    this.setPrompt(q.text, q.spoken); this.ansText = null; const ds = String(q.n).split(''), n = ds.length, gap = 130, x0 = 660 - (n - 1) * gap / 2;
    ds.forEach((d, i) => {
      const pos = n - 1 - i, hl = q.mode === 'value' && pos === q.pos, t = this.mkTile(x0 + i * gap, 290, d, { w: 104, h: 110, size: 58, color: hl ? '#ff5a8a' : this.colorFor(i + 1) }); this.popIn([t], i * 40);
      this.txt(x0 + i * gap, 370, 'หลัก' + SN_PLACE[pos], { size: 21, color: hl ? '#e0243d' : '#4a4780' });
    });
    this.choose(q, { y: 520, h: 100, size: 52 });
  }
}
