/* ===== ตัวเกม 'ลากแล้ววาง' ของผจญภัยเมาส์ =====
   mode: battery (ลากแบตให้หุ่น ทีละรอบ) · color (จับคู่แบตกับหุ่นสีเดียวกัน) · sort2 (แยกผลไม้/สัตว์ 2 ถัง) · order (เรียงเลข) · build (ประกอบหุ่นยนต์) · sort4 (จัด 4 ถัง) · n จำนวนรอบ/ชิ้น
   ลากด้วยเมาส์หรือนิ้ว: ปล่อยที่ถังถูก = ล็อกเข้าที่ ปล่อยผิดถัง = เด้งกลับ (นับเป็นพลาด) ปล่อยนอกถัง = กลับที่เดิมไม่นับพลาด */
const DRG = { x0: 200, y0: 160, x1: 1244, y1: 704 };
class DragEng {
  constructor(s, p, host) {
    this.s = s; this.h = host || s; this.p = Object.assign({ n: 3 }, p); this.R = s.R; this.items = []; this.targets = []; this.objs = []; this.got = 0; this.alive = true; this.running = false; this.round = 0; const P = this.p;
    if (!host) { s.setGoal(P.n); if (P.time) s.setTimer(P.time); }
    this.onStart = (pt, o) => this.dragStart(pt, o); this.onDrag = (pt, o, x, y) => this.dragMove(pt, o, x, y); this.onEnd = (pt, o) => this.dragEnd(pt, o);
    s.input.on('dragstart', this.onStart); s.input.on('drag', this.onDrag); s.input.on('dragend', this.onEnd);
    this.gfx = s.add.graphics().setDepth(6); this.setup();
  }
  /* ---------- วางฉากตามโหมด ---------- */
  setup() {
    const m = this.p.mode; this.clear();
    if (m === 'battery') this.setupBattery(); else if (m === 'color') this.setupColor(); else if (m === 'sort2') this.setupSort(['fruit', 'animal'], this.p.n); else if (m === 'sort4') this.setupSort(['fruit', 'animal', 'school', 'food'], this.p.n);
    else if (m === 'order') this.setupOrder(); else if (m === 'build') this.setupBuild();
  }
  clear() { this.objs.forEach(o => { if (o && o.destroy) o.destroy(); }); this.objs = []; this.items = []; this.targets = []; this.gfx.clear(); }
  card(t, icon) { this.h.setCard(t, { icon: icon ? this.s.add.image(0, 0, MA.mouseIcon(this.s, 'drag', 56)).setDisplaySize(64, 64) : undefined, say: t }); }
  add(o) { this.objs.push(o); return o; }
  // ทำให้ชิ้นนี้ลากได้ home = จุดเดิม kind = ข้อมูลของชิ้น
  drag(img, data) {
    img.setInteractive({ draggable: true, useHandCursor: true }); img.dd = Object.assign({ home: { x: img.x, y: img.y }, locked: false, sc: img.scaleX }, data); this.items.push(img); return img;
  }
  dragStart(pt, o) { if (!this.running || !o.dd || o.dd.locked) return; o.setDepth(60); this.s.tweens.killTweensOf(o); o.dd.held = true; this.lift(o, true); KG.audio.play('pop'); if (this.hintObj) { this.hintObj.destroy(); this.hintObj = null; } }
  dragMove(pt, o, x, y) { if (!o.dd || o.dd.locked || !this.running) return; o.x = x; o.y = y; const t = this.targetAt(o); this.targets.forEach(g => this.glow(g, g === t)); }
  dragEnd(pt, o) {
    if (!o.dd || o.dd.locked) return; o.dd.held = false; this.targets.forEach(g => this.glow(g, false)); const t = this.targetAt(o);
    if (!this.running || this.s.over || this.s.paused) { this.back(o); return; }
    if (!t) { this.back(o); return; }
    if (t.accept(o)) this.drop(o, t); else { this.s.tweens.add({ targets: t.obj || o, angle: { from: -4, to: 4 }, duration: 60, yoyo: true, repeat: 2, onComplete: () => { if (t.obj) t.obj.setAngle(0); } }); this.h.bad(o.x, o.y, t.wrong || 'ยังไม่ใช่ที่นี่'); this.back(o); }
  }
  lift(o, on) { this.s.tweens.add({ targets: o, scaleX: o.dd.sc * (on ? 1.14 : 1), scaleY: o.dd.sc * (on ? 1.14 : 1), duration: 110 }); }
  back(o) { const s = this.s; o.setDepth(20); this.lift(o, false); s.tweens.add({ targets: o, x: o.dd.home.x, y: o.dd.home.y, duration: 260, ease: 'Back.easeOut' }); }
  targetAt(o) { let best = null, bd = 1e9; this.targets.forEach(g => { if (g.done) return; const dx = Math.abs(o.x - g.x), dy = Math.abs(o.y - g.y); if (dx <= g.rw / 2 + 12 && dy <= g.rh / 2 + 12) { const d = dx + dy; if (d < bd) { bd = d; best = g; } } }); return best; }
  glow(g, on) { if (g.hl) g.hl.setAlpha(on ? 0.9 : 0); }
  // ทำเป้า: rect กลาง (x,y) กว้าง rw สูง rh · accept(item) คืนจริงถ้าวางถูก
  target(x, y, rw, rh, accept, o) {
    o = o || {}; const s = this.s, g = { x, y, rw, rh, accept, wrong: o.wrong, done: false, obj: o.obj };
    g.hl = this.add(s.add.rectangle(x, y, rw + 18, rh + 18, 0xffe566, 0.55).setStrokeStyle(5, 0xffc400).setDepth(5).setAlpha(0)); this.targets.push(g); return g;
  }
  drop(o, t) {
    const s = this.s; o.dd.locked = true; o.disableInteractive(); t.hits = (t.hits || 0) + 1; if (t.single) t.done = true;
    if (t.onDrop) t.onDrop(o, t);   // ตั้งช่องวางจริง (t.slot) ได้ในนี้
    const x = t.slot ? t.slot.x : t.x, y = t.slot ? t.slot.y : t.y; KG.audio.play(t.sfx || 'drop'); K_ringFx(s, x, y); o.setDepth(15);
    s.tweens.add({ targets: o, x, y, scaleX: o.dd.sc * (t.fit || 0.9), scaleY: o.dd.sc * (t.fit || 0.9), duration: 160, ease: 'Back.easeOut' });
    this.got++; this.h.ok(x, y, { colors: [0x5ef08a, 0xffd34f, 0xffffff], sfx: 'good', text: false });
    if (this.p.mode === 'battery') return;   // ด่านแบตเตอรี่ไปรอบถัดไปเอง
    if (this.got >= this.total && this.h.roundDone) { this.running = false; s.time.delayedCall(600, () => this.h.roundDone()); }
  }
  /* ---------- โหมด battery: 1 แบต › 1 หุ่นยนต์ ต่อรอบ ---------- */
  setupBattery() {
    const s = this.s; this.total = this.p.n; this.card('ลากแบตเตอรี่ไปให้หุ่นยนต์ (กดค้าง ลาก แล้วปล่อย)', true);
    const c = this.pickColor(), rx = 930, ry = 520, bx = 460, by = 560;
    this.add(s.add.ellipse(rx, ry + 8, 220, 26, 0x2d2a5e, 0.2).setDepth(4)); const robot = this.add(s.add.image(rx, ry, 'robot' + c).setOrigin(0.5, 1).setDepth(8)); robot.setScale(330 / robot.height); this.robot = robot;
    s.tweens.add({ targets: robot, scaleY: robot.scaleY * 1.025, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bat = this.add(s.add.image(bx, by, 'battery' + c).setDepth(20)); bat.setScale(170 / bat.height); this.drag(bat, { color: c });
    this.target(rx, ry - 160, 250, 330, o => true, { wrong: 'ส่งให้หุ่นยนต์นะ' }).after = null;
    const t = this.targets[0]; t.single = true; t.slot = { x: rx - 4, y: ry - 150 }; t.fit = 0.5; t.sfx = 'charge'; t.onDrop = o => this.charged(o);
    this.hintArrow(bx + 70, by - 40, rx - 130, ry - 160);
    this.round++;
  }
  pickColor() { const c = Math.floor(this.R() * 4); return c; }
  charged(o) {
    const s = this.s, rb = this.robot; K_boomRing(s, rb.x, rb.y - 160); KG.fx.glow(s, rb.x, rb.y - 160, 0xffe566, 360, 600); s.tweens.add({ targets: rb, y: rb.y - 40, duration: 180, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    s.time.delayedCall(250, () => o.destroy()); this.s.coach.act('thumbs', 1200);
    if (this.got < this.p.n) s.time.delayedCall(900, () => { if (this.alive) { this.setup(); this.running = true; } }); else if (this.h.roundDone) { this.running = false; s.time.delayedCall(700, () => this.h.roundDone()); }
  }
  hintArrow(x0, y0, x1, y1) {
    const s = this.s, g = this.hintObj = s.add.graphics().setDepth(7); this.add(g); g.lineStyle(8, 0xffc400, 0.8); const n = 12; for (let i = 0; i < n; i += 2) { g.lineBetween(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, x0 + (x1 - x0) * (i + 1) / n, y0 + (y1 - y0) * (i + 1) / n); }
    g.fillStyle(0xffc400, 0.9); const a = Math.atan2(y1 - y0, x1 - x0); g.fillTriangle(x1, y1, x1 - Math.cos(a - 0.45) * 36, y1 - Math.sin(a - 0.45) * 36, x1 - Math.cos(a + 0.45) * 36, y1 - Math.sin(a + 0.45) * 36); s.tweens.add({ targets: g, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
  }
  /* ---------- โหมด color: จับคู่แบตเตอรี่กับหุ่นยนต์ ---------- */
  setupColor() {
    const s = this.s, n = this.p.n; this.total = n; this.card('ลากแบตเตอรี่ไปหาหุ่นยนต์ที่มีสีเดียวกัน', true);
    const cols = K_shuffle(this.R, [0, 1, 2, 3]).slice(0, n), xs = i => 330 + (i + 0.5) * (850 / n), batOrder = K_shuffle(this.R, cols);
    cols.forEach((c, i) => { const x = xs(i); this.add(s.add.ellipse(x, 462, 150, 20, 0x2d2a5e, 0.2).setDepth(4)); const r = this.add(s.add.image(x, 456, 'robot' + c).setOrigin(0.5, 1).setDepth(8)); r.setScale(250 / r.height); const g = this.target(x, 330, 190, 270, o => o.dd.color === c, { wrong: 'สีไม่ตรงกัน' }); g.slot = { x: x + 2, y: 350 }; g.fit = 0.42; g.sfx = 'charge'; g.single = true; g.onDrop = () => { KG.fx.glow(s, x, 340, 0xffe566, 280, 500); s.tweens.add({ targets: r, y: r.y - 26, duration: 160, yoyo: true }); }; });
    batOrder.forEach((c, i) => { const x = xs(i), b = this.add(s.add.image(x, 610, 'battery' + c).setDepth(20)); b.setScale(130 / b.height); this.drag(b, { color: c }); });
  }
  /* ---------- โหมด sort: แยกหมวด (ผลไม้/สัตว์ หรือ 4 หมวด) ---------- */
  setupSort(cats, n) {
    const s = this.s, bank = KG.kit.bank(), many = cats.length; this.total = n; this.card(many === 2 ? 'ผลไม้ลงถังผลไม้ สัตว์ลงถังสัตว์' : 'จัดของลงถังให้ถูกประเภท', true);
    const bw = many === 2 ? 330 : 236, gap = many === 2 ? 250 : 22, tot = many * bw + (many - 1) * gap, x0 = 730 - tot / 2 + bw / 2, colors = ['#ff9a2e', '#3d8bff', '#9a6af0', '#3fbf6a'];
    cats.forEach((c, i) => {
      const x = x0 + i * (bw + gap), y = 300, bh = many === 2 ? 210 : 170, col = colors[i % 4];
      const tex = KG.tex(s, ['dbin', bw, bh, col].join('|'), bw + 24, bh + 28, ctx => { const m = 12; KG.ui.rrect(ctx, m, m + 8, bw, bh, 22); ctx.fillStyle = 'rgba(45,42,94,.25)'; ctx.fill(); KG.ui.rrect(ctx, m, m, bw, bh, 22); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.save(); KG.ui.rrect(ctx, m, m, bw, bh, 22); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(m, m, bw, 50); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(m, m, bw, 8); ctx.restore(); KG.ui.rrect(ctx, m, m, bw, bh, 22); ctx.lineWidth = 5; ctx.strokeStyle = '#2d2a5e'; ctx.stroke(); });
      const img = this.add(s.add.image(x, y, tex).setDisplaySize(bw + 24, bh + 28).setDepth(5)); this.add(KG.txt(s, x, y - bh / 2 + 25, bank[c].th, { size: many === 2 ? 30 : 23, color: '#ffffff', center: true, middle: true, stroke: '#2d2a5e', sw: 5 }).setDepth(6));
      const sample = bank[c].items[0]; this.add(KG.kit.itemImage(s, sample, x, y + 36, many === 2 ? 90 : 64).setAlpha(0.28).setDepth(6));
      const g = this.target(x, y, bw, bh, o => o.dd.cat === c, { wrong: 'ไม่ใช่' + bank[c].th, obj: img }); g.cnt = 0; g.col = c;
      g.slot = null; g.sfx = 'drop'; g.fit = 0.5; g.onDrop = (o, tg) => { tg.cnt++; const k = tg.cnt - 1, cols = many === 2 ? 4 : 3; tg.slot = { x: x - bw / 2 + 44 + (k % cols) * (many === 2 ? 74 : 66), y: y + 4 + Math.floor(k / cols) * 52 + (many === 2 ? 12 : 8) }; };
    });
    const per = Math.ceil(n / 2), use = KG.kit.pickItems(this.R, cats, 40), pickList = [];
    // เลือกให้ได้จำนวนใกล้เคียงกันทุกหมวด
    const byCat = {}; cats.forEach(c => { byCat[c] = K_shuffle(this.R, bank[c].items); }); for (let i = 0; pickList.length < n; i++) { const c = cats[i % many]; if (byCat[c].length) pickList.push(byCat[c].shift()); else if (i > 60) break; }
    K_shuffle(this.R, pickList).forEach((it, i) => {
      const row = i < per ? 0 : 1, col = row ? i - per : i, cnt = row ? n - per : per, x = 330 + (col + 0.5) * (900 / cnt), y = 520 + row * 100, sz = many === 2 ? 98 : 84;
      const sh = this.add(s.add.ellipse(x + 6, y + 36, sz * 0.8, sz * 0.18, 0x2d2a5e, 0.2).setDepth(9)); const im = this.add(KG.kit.itemImage(s, it, x, y, sz).setDepth(20)); this.drag(im, { cat: it.cat, id: it.id }); im.dd.shadow = sh;
      im.on('dragstart', () => { sh.setAlpha(0); }); im.on('dragend', () => { if (!im.dd.locked) sh.setAlpha(1); });
    });
  }
  /* ---------- โหมด order: เรียงเลข 1..n ---------- */
  setupOrder() {
    const s = this.s, n = this.p.n; this.total = n; this.card('ลากตัวเลขไปวางเรียงจากน้อยไปมาก 1 2 3 …', true);
    const w = 130, sx = i => 720 + 40 + (i - (n - 1) / 2) * (w + 24), cols = ['#ff4a4a', '#ff9a2e', '#ffc82e', '#3fbf6a', '#3d8bff', '#9a6af0', '#ff7ab8'];
    const slotTex = KG.tex(s, 'dslot|' + w, w + 14, w + 14, c => { KG.ui.rrect(c, 7, 7, w, w, 20); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); c.setLineDash([10, 8]); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; c.stroke(); });
    for (let i = 0; i < n; i++) {
      const x = sx(i), y = 330; this.add(s.add.image(x, y, slotTex).setDisplaySize(w + 14, w + 14).setDepth(5));
      for (let d = 0; d < i + 1; d++) { const dot = this.add(s.add.circle(x - (i * 7) + d * 14, y + 50, 4.5, 0x2d2a5e, 0.45).setDepth(6)); }
      const g = this.target(x, y, w, w, o => o.dd.num === i + 1, { wrong: 'ยังไม่ใช่ลำดับนี้' }); g.single = true; g.slot = { x, y }; g.fit = 1;
    }
    K_shuffle(this.R, Array.from({ length: n }, (_, i) => i + 1)).forEach((v, i) => {
      const x = sx(i), y = 580, col = cols[(v - 1) % 7], tex = KG.tex(s, ['dnum', v, col].join('|'), w + 14, w + 14, c => { KG.ui.rrect(c, 7, 13, w, w, 20); c.fillStyle = 'rgba(45,42,94,.25)'; c.fill(); KG.ui.rrect(c, 7, 7, w, w, 20); c.fillStyle = KG.ui.lin(c, 0, 7, 0, 7 + w, [[0, KG.kit.shade(col, 1.2)], [1, KG.kit.shade(col, 0.86)]]); c.fill(); c.lineWidth = 5; c.strokeStyle = '#2d2a5e'; c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(14, 14, w - 14, 12); c.font = '600 80px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8; c.strokeStyle = '#2d2a5e'; c.strokeText(String(v), w / 2 + 7, w / 2 + 12); c.fillStyle = '#fff'; c.fillText(String(v), w / 2 + 7, w / 2 + 12); });
      const im = this.add(s.add.image(x, y, tex).setDisplaySize(w + 14, w + 14).setDepth(20)); this.drag(im, { num: v });
    });
  }
  /* ---------- โหมด build: ประกอบหุ่นยนต์ ---------- */
  setupBuild() {
    const s = this.s; this.total = 4; this.card('ลากชิ้นส่วนไปใส่หุ่นยนต์ให้ครบ', true);
    const cx = 720, cy = 450, tex = KG.tex(s, 'drobot', 300, 440, c => {
      const ink = '#2d2a5e', body = '#a8c4ff', dark = '#7a98e0';
      c.lineJoin = 'round'; const R = (x, y, w, h, r, f) => { KG.ui.rrect(c, x, y, w, h, r); c.fillStyle = f; c.fill(); c.lineWidth = 5; c.strokeStyle = ink; c.stroke(); };
      R(100, 340, 38, 80, 10, dark); R(162, 340, 38, 80, 10, dark); R(88, 410, 62, 24, 10, '#5a74c8'); R(150, 410, 62, 24, 10, '#5a74c8');
      R(20, 190, 40, 120, 18, dark); R(240, 190, 40, 120, 18, dark); R(55, 170, 190, 180, 24, KG.ui.lin(c, 0, 170, 0, 350, [[0, '#c4d8ff'], [1, body]]));
      R(70, 40, 160, 120, 26, KG.ui.lin(c, 0, 40, 0, 160, [[0, '#c4d8ff'], [1, body]])); R(135, 160, 30, 16, 4, dark);
      c.fillStyle = '#10163a'; KG.ui.rrect(c, 92, 66, 116, 56, 14); c.fill(); c.fillStyle = '#2a3566'; c.beginPath(); c.arc(124, 94, 11, 0, 7); c.arc(176, 94, 11, 0, 7); c.fill();
      c.beginPath(); c.moveTo(140, 40); c.lineTo(140, 20); c.lineWidth = 5; c.strokeStyle = ink; c.stroke(); c.beginPath(); c.arc(140, 14, 0.01, 0, 7);
    });
    this.rob = this.add(s.add.image(cx, cy, tex).setDisplaySize(300 * 0.95, 440 * 0.95).setDepth(5)); const sc = 0.95, ox = cx - 150 * sc, oy = cy - 220 * sc;
    const slots = [{ k: 'antenna', x: ox + 150 * sc, y: oy + 6 * sc, w: 70, h: 70 }, { k: 'chip', x: ox + 150 * sc, y: oy + 100 * sc, w: 110, h: 66 }, { k: 'battery', x: ox + 150 * sc, y: oy + 258 * sc, w: 120, h: 120 }, { k: 'gear', x: ox + 150 * sc, y: oy + 392 * sc, w: 90, h: 70 }];
    const outl = KG.tex(s, 'dbslot', 130, 130, c => { KG.ui.rrect(c, 5, 5, 120, 120, 18); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); c.setLineDash([9, 7]); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; c.stroke(); });
    slots.forEach(sl => { this.add(s.add.image(sl.x, sl.y, outl).setDisplaySize(sl.w + 14, sl.h + 14).setDepth(6)); const g = this.target(sl.x, sl.y, sl.w, sl.h, o => o.dd.part === sl.k, { wrong: 'ใส่ตรงนี้ไม่ได้' }); g.single = true; g.slot = { x: sl.x, y: sl.y }; g.fit = 0.62; g.onDrop = () => { if (this.targets.every(t => t.done)) this.alive_(); }; });
    const parts = ['antenna', 'chip', 'battery', 'gear'], names = { antenna: 'item_antenna', chip: 'item_chip', battery: 'item_battery', gear: 'item_gear' };
    K_shuffle(this.R, parts).forEach((k, i) => { const left = i % 2 === 0, x = left ? 360 : 1090, y = 280 + Math.floor(i / 2) * 230 + (left ? 0 : 60), im = this.add(s.add.image(x, y, names[k]).setDepth(20)); im.setScale(120 / im.height); this.drag(im, { part: k }); });
  }
  alive_() { const s = this.s, r = this.rob; KG.fx.glow(s, r.x, r.y - 60, 0x7fe0ff, 520, 800); s.tweens.add({ targets: r, y: r.y - 30, duration: 200, yoyo: true, repeat: 2, ease: 'Quad.easeOut' }); K_boomRing(s, r.x, r.y - 80); this.s.coach.act('victory', 1500); KG.audio.play('henshin'); }
  start() { this.running = true; }
  stop() { this.running = false; }
  update() { }
  destroy() { this.alive = false; this.running = false; const s = this.s; s.input.off('dragstart', this.onStart); s.input.off('drag', this.onDrag); s.input.off('dragend', this.onEnd); this.clear(); this.gfx.destroy(); }
}
const K_ringFx = (s, x, y) => { KG.fx.ring(s, x, y, 0x5ef08a, { size: 1.6, w: 0.45, depth: 61 }); KG.fx.burst(s, x, y, { colors: [0x5ef08a, 0xffffff], n: 12, max: 220, life: 500, depth: 62 }); };
const K_boomRing = (s, x, y) => { KG.fx.ring(s, x, y, 0xffd34f, { size: 3.2, w: 0.6, depth: 61 }); KG.fx.ring(s, x, y, 0xffffff, { size: 2, w: 0.4, depth: 61 }); KG.fx.burst(s, x, y, { colors: [0xffd34f, 0x7fe0ff, 0xffffff], n: 30, max: 420, tex: 'fx_star', rot: true, life: 800, depth: 62 }); };
