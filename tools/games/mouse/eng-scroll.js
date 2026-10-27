/* ===== ตัวเกม 'ลูกกลิ้งเมาส์' ของผจญภัยเมาส์ =====
   อินพุตเลื่อน: ลูกกลิ้งเมาส์ (wheel) · ปุ่มลูกศรบนจอ ▲▼ · ปัดนิ้ว/ลากบนจอสัมผัส · ปุ่มลูกศรบนคีย์บอร์ด (สำหรับคนที่ไม่มีลูกกลิ้ง)
   mode: tall (หน้ายาวหลายจอ หาดาว) · wheel (วงล้อตัวเลข หมุนให้ตรงเป้าแล้วกดตกลง) · list (เลื่อนรายการหาสัตว์) · lift (ลิฟต์ เลือกชั้น) */
class ScrollInput {
  // เรียก onScroll(dy) เมื่อมีการเลื่อน (บวก = ลง)
  constructor(s, onScroll, o) {
    this.s = s; this.cb = onScroll; o = o || {}; this.area = o.area || { x0: 0, y0: 0, x1: 1280, y1: 720 }; this.drag = null;
    this.wh = (pt, over, dx, dy) => { if (!s.running || s.over || s.paused) return; this.cb(Math.sign(dy) * (o.step || 1) * Math.min(3, Math.max(1, Math.abs(dy) / 100)), 'wheel'); };
    this.kd = e => { if (!s.running || s.over || s.paused) return; if (e.code === 'ArrowDown') { this.cb(1, 'key'); try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } } else if (e.code === 'ArrowUp') { this.cb(-1, 'key'); try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } } };
    this.moved = false; this.dn = (pt, over) => { this.moved = false; if (over && over.length) return; if (pt.wasTouch) this.drag = { y: pt.worldY, acc: 0 }; };
    this.mv = pt => { if (!this.drag || !pt.isDown) return; const dy = this.drag.y - pt.worldY; this.drag.y = pt.worldY; this.drag.acc += dy; const st = (o.pxPerStep || 60); while (Math.abs(this.drag.acc) >= st) { this.moved = true; this.cb(Math.sign(this.drag.acc), 'drag'); this.drag.acc -= Math.sign(this.drag.acc) * st; } };
    this.up = () => { this.drag = null; };
    s.input.on('wheel', this.wh); s.input.keyboard.on('keydown', this.kd); s.input.on('pointerdown', this.dn); s.input.on('pointermove', this.mv); s.input.on('pointerup', this.up);
  }
  destroy() { const s = this.s; s.input.off('wheel', this.wh); s.input.keyboard.off('keydown', this.kd); s.input.off('pointerdown', this.dn); s.input.off('pointermove', this.mv); s.input.off('pointerup', this.up); }
}
class ScrollEng {
  constructor(s, p, host) {
    this.s = s; this.h = host || s; this.p = Object.assign({ mode: 'tall' }, p); this.R = s.R; this.alive = true; this.running = false; this.objs = []; this.got = 0; const P = this.p;
    this.rounds = P.mode === 'tall' ? P.stars : P.n; if (!host) { s.setGoal(this.rounds); if (P.time) s.setTimer(P.time); }
    this.hh = this.h;
    if (P.mode === 'tall') this.setupTall(); else if (P.mode === 'wheel') this.setupWheel(); else if (P.mode === 'list') this.setupList(); else this.setupLift();
    this.arrows();
  }
  add(o) { this.objs.push(o); return o; }
  card(t, mode) { this.h.setCard(t, { icon: this.s.add.image(0, 0, MA.mouseIcon(this.s, mode || 'wheel', 56, '#e8a010')).setDisplaySize(64, 64), say: t }); }
  // ปุ่ม ▲ ▼ บนจอ (หน้าจอสัมผัสหรือเครื่องไม่มีลูกกลิ้ง)
  arrows() {
    const s = this.s, mk = (y, up) => { const b = new KG.ui.Button(s, 1200, y, 78, 78, { label: '', icon: up ? 'chevU' : 'chevD', style: 'sun', slant: 8, onClick: () => { if (this.running) this.scroll(up ? -1 : 1, 'btn'); } }); b.setDepth(40); this.add(b); return b; };
    mk(320, true); mk(420, false); this.add(KG.txt(s, 1200, 480, 'หรือหมุน\nลูกกลิ้ง', { size: 16, weight: 400, color: '#2d2a5e', center: true, ox: 0.5, lineSpacing: 2 }).setDepth(40));
    this.inp = new ScrollInput(s, (d, src) => this.scroll(d, src), { step: 1, pxPerStep: 56 });
  }
  scroll(d, src) { /* แทนที่ตามโหมด */ }
  /* ---------- tall: หน้ายาว ---------- */
  setupTall() {
    const s = this.s, P = this.p, H = 720 * P.screens; this.card('หมุนลูกกลิ้งเมาส์เลื่อนหน้าจอลง แล้วคลิกดาว', 'wheel'); this.scrollY = 0; this.maxY = H - 720 + 60;
    this.world = s.add.container(0, 0).setDepth(3); this.add(this.world);
    const bg = s.add.graphics(); const cols = [0xcfeaff, 0xdff6d8, 0xfff0c9, 0xffdfe8, 0xe6dcff, 0xd8f4f0];
    for (let i = 0; i < P.screens; i++) { bg.fillStyle(cols[i % cols.length], 0.92); bg.fillRect(0, 168 + i * 720 - 96, 1280, 720); bg.lineStyle(0, 0, 0); }
    for (let y = 168; y < H + 168; y += 120) { bg.fillStyle(0x2d2a5e, 0.08); bg.fillRect(40, y, 1090, 6); }
    this.world.add(bg);
    for (let i = 0; i < 24; i++) { const k = KG.kit.pickItems(this.R, ['animal', 'nature', 'fruit'], 1)[0], x = 220 + this.R() * 880, y = 220 + this.R() * (H - 260), im = KG.kit.itemImage(s, k, x, y, 70).setAlpha(0.8); this.world.add(im); }
    const spots = []; for (let i = 0; i < P.stars; i++) spots.push(P.stars === 1 ? 720 * (P.screens - 1) + 400 : 360 + i * ((H - 640) / Math.max(1, P.stars)) + this.R() * 90);
    this.sstars = spots.map((y, i) => { const x = 300 + this.R() * 680, im = s.add.image(x, y, KG.kit.shapeTex(s, 'star', 'yellow', 88)).setDisplaySize(108, 108); s.tweens.add({ targets: im, angle: { from: -12, to: 12 }, duration: 700, yoyo: true, repeat: -1 }); this.world.add(im); return { im, got: false }; });
    this.bar = s.add.graphics().setDepth(41); this.add(this.bar); this.drawBar();
    this.dn = (pt) => { if (!this.running || this.inp.moved) return; const wx = pt.worldX, wy = pt.worldY + this.scrollY; for (const st of this.sstars) { if (!st.got && Math.hypot(st.im.x - wx, st.im.y - wy) < 66) { this.takeStar(st); break; } } };
    s.input.on('pointerup', this.dn);
  }
  drawBar() { const g = this.bar; g.clear(); g.fillStyle(0xffffff, 0.8); g.fillRoundedRect(1136, 190, 14, 330, 7); const f = this.scrollY / (this.maxY || 1); g.fillStyle(0xe8a010, 1); g.fillRoundedRect(1132, 190 + f * 290, 22, 40, 8); g.lineStyle(3, 0x2d2a5e, 1); g.strokeRoundedRect(1132, 190 + f * 290, 22, 40, 8); }
  takeStar(st) { st.got = true; const s = this.s, x = st.im.x, y = st.im.y - this.scrollY; KG.audio.play('coin', { i: this.got }); KG.fx.burst(s, x, y, { colors: [0xffd34f, 0xffffff], n: 16, max: 280, tex: 'fx_star', rot: true, life: 700, depth: 61 }); s.tweens.add({ targets: st.im, scaleX: 0.01, scaleY: 0.01, duration: 200 }); this.got++; this.h.ok(x, y, { text: false, sfx: 'coin' }); if (this.got >= this.rounds && this.h.roundDone) { this.running = false; s.time.delayedCall(500, () => this.h.roundDone()); } }
  /* ---------- wheel: วงล้อตัวเลข ---------- */
  setupWheel() {
    const s = this.s, P = this.p; this.card('หมุนลูกกลิ้งให้ตัวเลขตรงกับเป้า แล้วกดปุ่มตกลง', 'wheel'); this.val = 0; this.max = P.max || 9; this.newTarget();
    const x = 720, y = 430; this.add(s.add.rectangle(x, y, 250, 260, 0xffffff, 1).setStrokeStyle(6, 0x2d2a5e).setDepth(5)); this.add(s.add.rectangle(x, y, 210, 100, 0xfff0a8, 1).setStrokeStyle(4, 0xe8a010).setDepth(6));
    this.numT = this.add(KG.txt(s, x, y, '0', { size: 110, color: '#2d2a5e', center: true, middle: true }).setDepth(8)); this.upT = this.add(KG.txt(s, x, y - 90, '', { size: 56, color: '#9aa6d8', center: true, middle: true }).setDepth(7)); this.dnT = this.add(KG.txt(s, x, y + 90, '', { size: 56, color: '#9aa6d8', center: true, middle: true }).setDepth(7));
    this.add(s.add.image(x - 190, y, MA.mouseIcon(s, 'wheel', 120, '#e8a010')).setDisplaySize(144, 144).setDepth(6));
    this.tgtT = this.add(KG.txt(s, 1010, 360, '', { size: 36, color: '#2d2a5e', center: true, middle: true }).setDepth(8)); this.tgtN = this.add(KG.txt(s, 1010, 440, '', { size: 120, color: '#ff5a8a', center: true, middle: true, stroke: '#ffffff', sw: 10 }).setDepth(8)); this.tgtT.setText('ให้ได้เลข'); this.tgtN.setText(String(this.target));
    const ok = new KG.ui.Button(s, 720, 620, 280, 76, { label: 'ตกลง', icon: 'check', style: 'green', size: 32, onClick: () => { if (this.running) this.confirm(); } }); ok.setDepth(30); this.add(ok); this.showVal();
  }
  newTarget() { let t; do { t = Math.floor(this.R() * (this.max + 1)); } while (t === this.val && this.max > 1); this.target = t; if (this.tgtN) { this.tgtT.setText('ให้ได้เลข'); this.tgtN.setText(String(t)); this.s.tweens.add({ targets: this.tgtN, scaleX: { from: 1.5, to: 1 }, scaleY: { from: 1.5, to: 1 }, duration: 260, ease: 'Back.easeOut' }); } }
  showVal() { const n = this.max + 1; this.numT.setText(String(this.val)); this.upT.setText(this.val > 0 ? String(this.val - 1) : ''); this.dnT.setText(this.val < this.max ? String(this.val + 1) : ''); }
  confirm() {
    const s = this.s; if (this.val === this.target) { KG.audio.play('ding'); K_boomRing(s, 720, 430); this.got++; this.h.ok(720, 380, { text: false }); this.newTarget(); if (this.got >= this.rounds && this.h.roundDone) { this.running = false; s.time.delayedCall(500, () => this.h.roundDone()); } }
    else { this.h.bad(720, 380, this.val < this.target ? 'น้อยไป หมุนลง' : 'มากไป หมุนขึ้น'); s.tweens.add({ targets: this.numT, x: { from: 700, to: 740 }, duration: 50, yoyo: true, repeat: 3, onComplete: () => this.numT.setX(720) }); }
  }
  /* ---------- list: รายการสัตว์ยาว ---------- */
  setupList() {
    const s = this.s, bank = KG.kit.bank(), pool = K_shuffle(this.R, bank.animal.items.concat(bank.fruit.items, bank.food.items)).slice(0, 14); this.list = pool; this.pos = 0; this.rowH = 96; this.vis = 4; this.newAsk();
    this.card('เลื่อนรายการหาคำที่บอก แล้วคลิกที่รูปนั้น', 'wheel');
    this.add(s.add.rectangle(640, 440, 600, this.rowH * this.vis + 24, 0xffffff, 1).setStrokeStyle(6, 0x2d2a5e).setDepth(5)); this.rows = [];
    for (let i = 0; i < this.vis; i++) { const c = s.add.container(640, 0).setDepth(7); const bg = s.add.rectangle(0, 0, 560, this.rowH - 10, 0xf0f6ff, 1).setStrokeStyle(3, 0x9aa6d8); const t = KG.txt(s, 40, 0, '', { size: 34, color: '#2d2a5e', middle: true }); const pic = s.add.image(-210, 0, KG.kit.itemTex(s, pool[0], 80)).setDisplaySize(80, 80); c.add([bg, pic, t]); c.rowBg = bg; c.pic = pic; c.txt = t; this.rows.push(c); this.add(c); }
    this.tgtT = this.add(KG.txt(s, 1060, 330, 'หาคำนี้', { size: 28, color: '#2d2a5e', center: true, middle: true }).setDepth(8)); this.tgtN = this.add(KG.txt(s, 1060, 400, '', { size: 50, color: '#ff5a8a', center: true, middle: true, stroke: '#ffffff', sw: 8, width: 200 }).setDepth(8)); this.askShow();
    this.layoutList(); this.dn = (pt) => { if (!this.running || this.inp.moved) return; this.rows.forEach((r, k) => { const idx = this.pos + k; if (idx >= this.list.length) return; if (Math.abs(pt.worldX - r.x) < 280 && Math.abs(pt.worldY - r.y) < this.rowH / 2 - 3) this.pickRow(r, idx); }); }; s.input.on('pointerup', this.dn);
  }
  newAsk() { this.ask = this.list[Math.floor(this.R() * this.list.length)]; if (this.tgtN) this.askShow(); }
  askShow() { this.tgtN.setText(this.ask.th); K_voice('หา ' + this.ask.th); this.s.tweens.add({ targets: this.tgtN, scaleX: { from: 1.4, to: 1 }, scaleY: { from: 1.4, to: 1 }, duration: 260, ease: 'Back.easeOut' }); }
  layoutList() { this.rows.forEach((r, k) => { const idx = this.pos + k; r.y = 440 - this.rowH * this.vis / 2 + (k + 0.5) * this.rowH; if (idx < this.list.length) { r.setVisible(true); r.pic.setTexture(KG.kit.itemTex(this.s, this.list[idx], 80)).setDisplaySize(80, 80); r.txt.setText(this.list[idx].th); r.rowBg.setFillStyle(0xf0f6ff); } else r.setVisible(false); }); }
  pickRow(r, idx) {
    const s = this.s, it = this.list[idx]; if (it.id === this.ask.id) { KG.audio.play('ding'); r.rowBg.setFillStyle(0xbff3c8); K_ringFx(s, r.x, r.y); this.got++; this.h.ok(r.x, r.y, { text: false }); if (this.got >= this.rounds && this.h.roundDone) { this.running = false; s.time.delayedCall(500, () => this.h.roundDone()); } else { this.newAsk(); } }
    else { r.rowBg.setFillStyle(0xffd0d0); this.h.bad(r.x, r.y, 'ไม่ใช่ ' + it.th); s.time.delayedCall(300, () => r.rowBg.setFillStyle(0xf0f6ff)); }
  }
  /* ---------- lift: ลิฟต์เลือกชั้น ---------- */
  setupLift() {
    const s = this.s, P = this.p, N = P.floors || 8; this.fl = 1; this.N = N; this.card('หมุนลูกกลิ้งขึ้นลง เลือกชั้นที่ต้องการ แล้วกดปุ่มไป', 'wheel'); this.newFloor();
    const x0 = 520, y0 = 190, fh = 50; for (let i = 0; i < N; i++) { const y = y0 + (N - 1 - i) * fh, c = [0xffe0e8, 0xe0f0ff, 0xfff4c9, 0xdff6d8][i % 4]; this.add(s.add.rectangle(x0, y + fh / 2, 300, fh - 4, c, 1).setStrokeStyle(3, 0x2d2a5e).setDepth(5)); this.add(KG.txt(s, x0 - 130, y + fh / 2, 'ชั้น ' + (i + 1), { size: 24, color: '#2d2a5e', middle: true }).setDepth(6)); for (let k = 0; k < 3; k++) this.add(s.add.rectangle(x0 + 20 + k * 40, y + fh / 2, 26, 22, 0x9fd8ff, 1).setStrokeStyle(2, 0x2d2a5e).setDepth(6)); }
    this.cab = this.add(s.add.rectangle(x0 + 175, y0 + (N - 1) * fh + fh / 2, 52, fh - 10, 0xffc400, 1).setStrokeStyle(4, 0x2d2a5e).setDepth(9)); this.cabT = this.add(KG.txt(s, x0 + 175, this.cab.y, '1', { size: 26, color: '#2d2a5e', center: true, middle: true }).setDepth(10));
    this.y0 = y0; this.fh = fh; this.tgtT = this.add(KG.txt(s, 1000, 350, 'ไปชั้น', { size: 32, color: '#2d2a5e', center: true, middle: true }).setDepth(8)); this.tgtN = this.add(KG.txt(s, 1000, 430, String(this.targetF), { size: 130, color: '#ff5a8a', center: true, middle: true, stroke: '#ffffff', sw: 10 }).setDepth(8));
    const go = new KG.ui.Button(s, 1000, 560, 260, 70, { label: 'ไปเลย', icon: 'play', style: 'green', size: 30, onClick: () => { if (this.running) this.liftGo(); } }); go.setDepth(30); this.add(go);
  }
  newFloor() { let t; do { t = 1 + Math.floor(this.R() * this.N); } while (t === this.fl); this.targetF = t; if (this.tgtN) { this.tgtN.setText(String(t)); K_voice('ไปชั้น ' + t); this.s.tweens.add({ targets: this.tgtN, scaleX: { from: 1.5, to: 1 }, scaleY: { from: 1.5, to: 1 }, duration: 260, ease: 'Back.easeOut' }); } }
  liftGo() {
    const s = this.s; if (this.fl === this.targetF) { KG.audio.play('ding'); K_boomRing(s, this.cab.x, this.cab.y); this.got++; this.h.ok(this.cab.x, this.cab.y, { text: false }); if (this.got >= this.rounds && this.h.roundDone) { this.running = false; s.time.delayedCall(500, () => this.h.roundDone()); } else this.newFloor(); }
    else { this.h.bad(this.cab.x, this.cab.y, 'ยังไม่ใช่ชั้นที่ ' + this.targetF); }
  }
  /* ---------- รับการเลื่อน ---------- */
  scroll(d, src) {
    const P = this.p, s = this.s; if (!this.running) return;
    if (P.mode === 'tall') { this.scrollY = Phaser.Math.Clamp(this.scrollY + d * 90, 0, this.maxY); this.world.y = -this.scrollY; this.drawBar(); KG.audio.play('tick', { p: 0.8 }); }
    else if (P.mode === 'wheel') { const nv = Phaser.Math.Clamp(this.val + (d > 0 ? 1 : -1), 0, this.max); if (nv !== this.val) { this.val = nv; this.showVal(); KG.audio.play('tick', { p: 0.9 + nv * 0.06 }); s.tweens.add({ targets: this.numT, scaleX: { from: 1.2, to: 1 }, scaleY: { from: 1.2, to: 1 }, duration: 120 }); } }
    else if (P.mode === 'list') { const np = Phaser.Math.Clamp(this.pos + (d > 0 ? 1 : -1), 0, Math.max(0, this.list.length - this.vis)); if (np !== this.pos) { this.pos = np; this.layoutList(); KG.audio.play('tick', { p: 0.9 }); } }
    else { const nf = Phaser.Math.Clamp(this.fl + (d > 0 ? -1 : 1), 1, this.N); if (nf !== this.fl) { this.fl = nf; KG.audio.play('tick', { p: 0.8 + nf * 0.05 }); s.tweens.add({ targets: [this.cab, this.cabT], y: this.y0 + (this.N - this.fl) * this.fh + this.fh / 2, duration: 160, ease: 'Sine.easeOut' }); this.cabT.setText(String(this.fl)); } }
  }
  start() { this.running = true; }
  stop() { this.running = false; }
  update() { }
  destroy() { this.alive = false; this.running = false; if (this.inp) this.inp.destroy(); if (this.dn) this.s.input.off('pointerup', this.dn); this.objs.forEach(o => { if (o && o.destroy) o.destroy(); }); }
}
