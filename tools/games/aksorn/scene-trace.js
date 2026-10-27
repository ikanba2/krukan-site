/* ===== Techno Aksorn: เขียนตามรอย =====
   เส้นทางมาจาก trace-data.js (TRACE: เส้นกลางของอักษรจากฟอนต์ Mali เรียงตามลำดับการลากเส้น เริ่มที่หัว)
   วิธีตัดสิน: ความคืบหน้า (pi) เดินไปข้างหน้าได้เฉพาะเมื่อปลายนิ้วอยู่ใกล้จุดถัดไปบนเส้นไม่เกินค่ายอมรับ (tol) ตามระดับชั้น
   ลากออกนอกเส้นไกลเกินไป = พลาด 1 ครั้ง ต้องกลับมาที่จุดสีเหลืองแล้วลากต่อ ยกนิ้วแล้วกดต่อจากจุดเดิมได้ */
const STROKE_COL = ['#ff5aa6', '#3d8bff', '#17c4a8', '#ffa21e', '#9a5ae8', '#3fb54a'];
// ระดับชั้นกำหนด: ค่ายอมรับ (px) · ความเข้มของเส้นนำ · ลูกศรนำ · เลขลำดับเส้น · แสดงจุดเริ่มทุกเส้นพร้อมกัน
const TR_LV = [
  { tol: 46, lane: 0.34, arrows: true, nums: true, all: true },
  { tol: 38, lane: 0.28, arrows: true, nums: true, all: true },
  { tol: 32, lane: 0.18, arrows: false, nums: false, all: false },
  { tol: 28, lane: 0.10, arrows: false, nums: false, all: false }
];
const TR_BOARD = { x: 40, y: 96, w: 860, h: 528 };
// ช่วงนี้ (25 ต.ค. 2569) ให้เขียนได้อย่างอิสระ: ลงหมึกตามนิ้วบนกระดาน มีรอยจาง ๆ เป็นแนวให้เขียนทับหรือไม่ทับก็ได้ ไม่ตรวจลำดับขีด ทิศทาง และจุดเริ่ม
// เพราะลำดับขีดที่ถูกต้องยังรอครูเขียนในห้องลองเขียน (Aksorn-Stroke-Lab.html) เมื่อได้ stroke_overrides.json แล้วเปลี่ยนเป็น false เพื่อกลับไปใช้การตรวจตามรอยเต็มรูปแบบ
const TRACE_FREE = true;
const FREE_HOW = '1. ดูตัวอักษรตัวอย่างทางขวา แล้วเขียนตัวนั้นลงบนกระดาษ จะเขียนทับรอยสีม่วงจาง ๆ หรือเขียนเองเลยก็ได้ ใช้นิ้วหรือเมาส์ลากได้อย่างอิสระ จะเริ่มขีดไหนก่อนก็ได้\n2. เขียนผิดกด ‘ย้อนเส้น’ เพื่อลบเส้นล่าสุด หรือ ‘ลบใหม่’ เพื่อเริ่มตัวนี้ใหม่\n3. เขียนเสร็จแล้วกด ‘เขียนเสร็จแล้ว’ เพื่อเก็บดาว (ถ้ามีขีดสีเทา คือที่ของพยัญชนะ ไม่ต้องเขียน เขียนแค่สระ)';
const TRACE_NODASH = { 'ใ–': 1, 'ไ–': 1 };
const traceKey = x => { const c = cons(x); if (c) return c.ch; const v = vow(x); if (v) return v.form; const h = chg(x); return h ? h.to : x; };
// รูปแบบข้อมูลแสดงผลจากตัวอักษรที่เขียน (พยัญชนะ รูปสระ วรรณยุกต์ เลขไทย)
function infoOfKey(key) { if (cons(key)) return AK.info(key); const v = VOWELS.find(r => r[1] === key); if (v) return AK.info(v[0]); const h = CHANGES.find(r => r[2] === key); return h ? AK.info(h[0]) : AK.info(key); }
// เพิ่มจุดให้เส้นห่างเท่ากัน (px)
function resample(pts, step) {
  const out = [pts[0]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let a = out[out.length - 1], b = pts[i], d = Math.hypot(b.x - a.x, b.y - a.y);
    while (d >= step) { const t = step / d; a = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; out.push(a); d = Math.hypot(b.x - a.x, b.y - a.y); }
  }
  const last = pts[pts.length - 1], q = out[out.length - 1]; if (Math.hypot(last.x - q.x, last.y - q.y) > step * 0.4) out.push(last);
  return out;
}
// ผืนผ้าใบวาดเพิ่มได้ (ความละเอียดตาม KG.K) วางเป็นภาพในฉาก พิกัดวาดเป็นหน่วยออกแบบของจอ
function canvasLayer(scene, x, y, w, h, depth) {
  const key = 'ak-layer-' + (canvasLayer.n = (canvasLayer.n || 0) + 1) + '@' + KG.K;
  const tex = scene.textures.createCanvas(key, Math.ceil(w * KG.K), Math.ceil(h * KG.K)), ctx = tex.getContext(), cv = ctx.canvas;
  const reset = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(KG.K, 0, 0, KG.K, -x * KG.K, -y * KG.K); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; };
  reset(); tex.refresh();
  const img = scene.add.image(x, y, key).setOrigin(0, 0).setDisplaySize(w, h).setDepth(depth || 1);
  return { ctx, img, key, clear() { reset(); tex.refresh(); }, refresh() { tex.refresh(); }, destroy() { try { img.destroy(); } catch (e) { /* ไม่เป็นไร */ } try { scene.textures.remove(key); } catch (e) { /* ไม่เป็นไร */ } } };
}

class TraceScene extends ActBase {
  constructor() { super('Trace'); this.ACT = 'trace'; }
  init(d) {
    d = d || {}; super.init(d); this.writeMode = !!d.set; this.gi = 0; this.gm = 0; this.drawing = false; this.demo = null; this.layers = []; this.free = []; this.fs = null; this.freeMode = TRACE_FREE;
    if (this.writeMode) {
      this.set = WRITE_SETS.find(s => s.id === d.set) || WRITE_SETS[0]; this.setIdx = d.idx || 0; this.lesson = null; this.lessonId = 'write'; this.back = 'Write'; this.list = [this.set.items[this.setIdx]];
      this._restartData = { set: this.set.id, idx: this.setIdx };
    } else {
      const items = AK.itemsOf(this.lesson, this.lv).map(traceKey).filter(k => TRACE[k]), R = AK.rng((Date.now() & 0xfffffff) + 11);
      const fresh = AK.shuf(items.filter(k => !SAVE.data.traced[k]), R), done = AK.shuf(items.filter(k => SAVE.data.traced[k]), R);
      this.list = fresh.concat(done).slice(0, Math.min(4, items.length));
    }
  }
  create() {
    this.begin(); const B = TR_BOARD; this.cfg = TR_LV[this.lv] || TR_LV[0];
    this.HOW = TRACE_FREE ? FREE_HOW : '1. ดูตัวอักษรตัวอย่างทางขวา แล้วเริ่มเขียนที่จุดสีเขียวบนกระดาษ (ขีดสีเทาคือที่ของพยัญชนะ ไม่ต้องเขียน เขียนแค่สระ)\n2. ใช้นิ้วหรือเมาส์ลากไปตามรอยจนสุดเส้น เส้นที่เขียนแล้วจะเป็นสี\n3. ถ้าลากออกนอกรอยไกลเกินไป ให้กลับมาที่จุดสีเหลืองแล้วลากต่อ ยกนิ้วแล้วเริ่มต่อจากจุดเดิมได้\n4. กด ‘ดูตัวอย่าง’ เพื่อดูการเขียนทีละเส้น และกด ‘ลบเขียนใหม่’ ถ้าอยากเริ่มตัวนี้ใหม่';
    addCard(this, B.x + B.w / 2, B.y + B.h / 2, B.w, B.h, { r: 30, fill: ['#ffffff', '#fbf8ff'], shadow: 9 }).setDepth(1);
    this.lane = canvasLayer(this, B.x, B.y, B.w, B.h, 2); this.progInk = canvasLayer(this, B.x, B.y, B.w, B.h, 3); this.progCol = canvasLayer(this, B.x, B.y, B.w, B.h, 3.1); this.demoL = canvasLayer(this, B.x, B.y, B.w, B.h, 3.2);
    this.layers = [this.lane, this.progInk, this.progCol, this.demoL];
    this.events.once('shutdown', () => { this.layers.forEach(l => l.destroy()); this.layers = []; });
    this.dots = []; this.head = this.add.circle(0, 0, 21).setStrokeStyle(6, 0xffc82e).setDepth(7).setVisible(false); this.tweens.add({ targets: this.head, scaleX: 1.25, scaleY: 1.25, duration: 520, yoyo: true, repeat: -1 });
    this.pen = this.add.circle(0, 0, 13, 0xffa21e).setStrokeStyle(4, 0x2d2a5e).setDepth(8).setVisible(false);
    if (!this.writeMode) this.makePips(this.list.length, 520);
    this.input.on('pointerdown', p => this.onDown(p)); this.input.on('pointermove', p => this.onMove(p)); this.input.on('pointerup', p => this.onUp(p));
    this.loadGlyph(0);
  }
  busy() { return this._modal || this.done || this.paused || this.locking; }
  cur() { return this.strokes[this.si]; }
  title() { return this.writeMode ? 'บ้านคัดลายมือ · ' + this.set.th : AkTitleOf(this); }

  /* ---------- เตรียมตัวอักษรหนึ่งตัว ---------- */
  loadGlyph(gi) {
    this.gi = gi; this.gm = 0; this.si = 0; this.pi = 0; this.drawing = false; this.off = false; this.locking = false; this._pend = null; this.cancelDemo();
    const key = this.list[gi], raw = TRACE[key], dsh = TRACE_D[key], B = TR_BOARD; this.key = key; this.inf = infoOfKey(key);
    let minx = 1e9, maxx = -1e9; raw.forEach(st => { for (let i = 0; i < st.length; i += 2) { minx = Math.min(minx, st[i]); maxx = Math.max(maxx, st[i]); } });
    if (dsh) { minx = Math.min(minx, dsh[0]); maxx = Math.max(maxx, dsh[1]); }
    const S = Math.min(1.4, (B.w - 90) / Math.max(120, maxx - minx)), cx = (minx + maxx) / 2, bx = B.x + B.w / 2, oy = B.y + (B.h - 360 * S) / 2;
    this.S = S; this.oy = oy; this.mapY = v => oy + v * S;
    // สระที่เขียนคู่ขีดกลาง: ขีดกลางแสดงที่ของพยัญชนะเท่านั้น ไม่ต้องเขียน (ครูบอก 25 ต.ค. 2569) ไม่ใช้เส้นบรรทัด 4 เส้น
    this.noGuide = !!TRACE_NODASH[key];   // ใ ไ แสดงแค่ตัวสระ ไม่มีขีดกลางและเส้นบรรทัด
    this.dash = dsh && !this.noGuide ? { x0: bx + (dsh[0] - cx) * S, x1: bx + (dsh[1] - cx) * S, y: oy + dsh[2] * S } : null;
    if (this.dashLbl) { this.dashLbl.destroy(); this.dashLbl = null; }
    this.free = []; this.fs = null;
    this.strokes = raw.map((st, k) => {
      const pts = []; for (let i = 0; i < st.length; i += 2) pts.push({ x: bx + (st[i] - cx) * S, y: oy + st[i + 1] * S });
      const rs = resample(pts, 7); return { pts: rs, n: rs.length, col: STROKE_COL[k % STROKE_COL.length] };
    });
    this.progInk.clear(); this.progCol.clear(); this.demoL.clear(); this.drawLane(); this.buildSide(); this.refreshDots();
    this.setPips(gi);
    const cfg = this.cfg, nm = this.inf.say;
    if (TRACE_FREE) this.say('เขียน “' + this.inf.text + '” ได้อย่างอิสระ จะเขียนทับรอยจาง ๆ หรือเขียนเองก็ได้ เสร็จแล้วกด “เขียนเสร็จแล้ว”', 'smile');
    else this.say(this.lv >= 2 ? 'เขียน “' + this.inf.text + '” ตามรอยจาง ๆ เริ่มที่จุดสีเขียว' : 'เขียน “' + this.inf.text + '” ' + (this.strokes.length > 1 ? 'ทีละเส้น ตามเลขที่บอก' : 'ตามลูกศร') + ' เริ่มที่จุดสีเขียว', 'smile');
    if (!TRACE_FREE && this.lv === 0 && gi === 0 && !SAVE.data.traced[key]) this.time.delayedCall(500, () => { if (this.gi === 0 && !this.drawing && !this.demo) this.playDemo(false); });
    if (nm) this.time.delayedCall(250, () => { if (this.key === key) this.speak(nm); });
  }
  // กระดาษสี่เส้นแบบสมุดคัดไทย + รอยให้ลากตาม + ลูกศรบอกทิศทาง
  drawLane() {
    const c = this.lane.ctx, B = TR_BOARD, M = TRACE_M, S = this.S, cfg = this.cfg; this.lane.clear();
    if (!this.dash && !this.noGuide) {
      [['asc', true, '#7aa6ff', 3], ['x', true, '#ff9cc4', 3], ['base', false, '#ff5aa6', 4], ['desc', true, '#7aa6ff', 3]].forEach(l => {
        const y = this.oy + M[l[0]] * S; c.save(); c.setLineDash(l[1] ? [14, 11] : []); c.lineWidth = l[3]; c.strokeStyle = l[2]; c.globalAlpha = l[1] ? 0.7 : 0.85; c.beginPath(); c.moveTo(B.x + 30, y); c.lineTo(B.x + B.w - 30, y); c.stroke(); c.restore();
      });
    } else if (this.dash) {
      const d = this.dash; c.save(); c.lineCap = 'round'; c.lineWidth = 10; c.strokeStyle = '#a9b0c6'; c.beginPath(); c.moveTo(d.x0, d.y); c.lineTo(d.x1, d.y); c.stroke(); c.restore();
      this.dashLbl = KG.txt(this, (d.x0 + d.x1) / 2, d.y + 18, 'ที่ของพยัญชนะ ไม่ต้องเขียน', { size: 17, weight: 400, color: '#8a84b0', center: true, ox: 0.5 }).setDepth(4);
    }
    this.strokes.forEach(st => {
      c.save(); c.beginPath(); st.pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.lineWidth = 38; c.strokeStyle = 'rgba(138,92,240,' + cfg.lane + ')'; c.stroke();
      c.setLineDash([1, 12]); c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,' + Math.min(1, cfg.lane * 3) + ')'; c.stroke(); c.restore();
      if (cfg.arrows && !TRACE_FREE) {
        c.save(); c.fillStyle = shade(st.col, 0.8); c.globalAlpha = 0.95;
        for (let i = 8; i < st.n - 3; i += 9) { const a = st.pts[i - 2], b = st.pts[i + 2], ang = Math.atan2(b.y - a.y, b.x - a.x), p = st.pts[i]; c.save(); c.translate(p.x, p.y); c.rotate(ang); c.beginPath(); c.moveTo(9, 0); c.lineTo(-6, -8); c.lineTo(-6, 8); c.closePath(); c.fill(); c.restore(); }
        c.restore();
      }
    });
    this.lane.refresh();
  }
  // จุดเริ่มเส้น (เขียว) และจุดสีเหลืองที่ค้างอยู่
  refreshDots() {
    this.dots.forEach(d => d.destroy()); this.dots = []; const cfg = this.cfg;
    if (TRACE_FREE) { this.head.setVisible(false); this.updateFreeTxt(); return; }
    this.strokes.forEach((st, k) => {
      if (k < this.si) return; if (!cfg.all && k !== this.si) return; const p = st.pts[0], cur = k === this.si && this.pi === 0, g = this.add.container(p.x, p.y).setDepth(6);
      g.add(this.add.circle(0, 0, 19, k === this.si ? 0x3fb54a : 0x9bd8a2).setStrokeStyle(4, 0x2d2a5e));
      if (cfg.nums && this.strokes.length > 1) g.add(KG.txt(this, 0, 0, String(k + 1), { size: 22, color: '#ffffff', center: true, middle: true }));
      else g.add(this.add.circle(0, 0, 6, 0xffffff));
      if (cur) this.tweens.add({ targets: g, scaleX: 1.18, scaleY: 1.18, duration: 480, yoyo: true, repeat: -1 });
      this.dots.push(g);
    });
    const h = this.cur().pts[this.pi]; this.head.setPosition(h.x, h.y).setVisible(this.pi > 0);
    if (this.strokeTxt) this.strokeTxt.setText(this.strokes.length > 1 ? 'เส้นที่ ' + Math.min(this.si + 1, this.strokes.length) + ' จาก ' + this.strokes.length : 'ลากเส้นเดียวจนสุดรอย');
  }
  // แผงขวา: ตัวอย่างตัวอักษร ชื่อ ภาพ ปุ่มช่วยเหลือ
  buildSide() {
    if (this.side) this.side.destroy(true); const c = this.side = this.add.container(0, 0).setDepth(4), cx = 1088, inf = this.inf;
    c.add(addCard(this, cx, 224, 336, 256, { r: 26, band: { h: 14, color: this.inf.kind === 'v' ? '#3d8bff' : '#ff7ab2' }, fill: ['#ffffff', '#f6f0ff'], shadow: 8 }));
    c.add(fitText(glyph(this, inf.pic ? 1010 : cx, 196, inf.text, inf.text.length > 2 ? 78 : inf.pic ? 112 : 128, inf.kind === 'c' ? ROLE_COL.c : inf.kind === 'g' ? TKC.ink : ROLE_COL.v), inf.pic ? 150 : 300));
    if (inf.pic) c.add(pic(this, inf.pic, 1176, 196, 124));
    else if (inf.ex && inf.ex.length) c.add(fitText(KG.txt(this, cx, 262, 'เช่น ' + inf.ex.join(' '), { size: 22, weight: 400, color: '#6a64a0', center: true, middle: true }), 310));
    c.add(fitText(KG.txt(this, cx, inf.pic ? 304 : 300, inf.label, { size: 26, color: TKC.ink, center: true, middle: true }), 310));
    const sp = iconButton(this, 1226, 130, 'sound', () => this.speak(inf.say), { w: 56, h: 48 }); sp.setEnabled(SPEECH.exists); c.add(sp);
    this.strokeTxt = KG.txt(this, cx, 392, '', { size: 24, color: '#ffffff', stroke: TKC.ink, sw: 5, center: true, middle: true }); c.add(this.strokeTxt);
    if (TRACE_FREE) {
      this.doneBtn = new KG.ui.Button(this, cx, 450, 300, 58, { label: 'เขียนเสร็จแล้ว', icon: 'check', style: 'primary', size: 25, onClick: () => this.finishFree() }); c.add(this.doneBtn);
      c.add(new KG.ui.Button(this, cx - 78, 518, 144, 54, { label: 'ย้อนเส้น', icon: 'chevL', style: 'ghost', size: 21, onClick: () => { if (!this.busy()) this.undoFree(); } }));
      c.add(new KG.ui.Button(this, cx + 78, 518, 144, 54, { label: 'ลบใหม่', icon: 'reset', style: 'ghost', size: 21, onClick: () => { if (!this.busy()) this.resetGlyph(); } }));
    } else {
      c.add(new KG.ui.Button(this, cx, 450, 300, 58, { label: 'ดูตัวอย่าง', icon: 'play', style: 'cyan', size: 25, onClick: () => { if (!this.busy()) this.playDemo(false); } }));
      c.add(new KG.ui.Button(this, cx, 518, 300, 54, { label: 'ลบเขียนใหม่', icon: 'reset', style: 'ghost', size: 23, onClick: () => { if (!this.busy()) this.resetGlyph(); } }));
    }
    if (this.writeMode) { const last = this.setIdx >= this.set.items.length - 1; const nb = new KG.ui.Button(this, cx, 586, 300, 54, { label: 'ตัวถัดไป', icon: 'chevR', style: 'primary', size: 23, onClick: () => { if (!this.busy()) this.go('Trace', { set: this.set.id, idx: this.setIdx + 1 }); } }); nb.setEnabled(!last); c.add(nb); }
    else c.add(new KG.ui.Button(this, cx, 586, 300, 54, { label: 'ข้ามตัวนี้', icon: 'chevR', style: 'ghost', size: 23, onClick: () => { if (!this.busy()) { this.mistakes += 2; this.nextGlyph(); } } }));
  }
  resetGlyph() { this.cancelDemo(); this._pend = null; this.si = 0; this.pi = 0; this.drawing = false; this.off = false; this.free = []; this.fs = null; this.progInk.clear(); this.progCol.clear(); this.refreshDots(); this.say(TRACE_FREE ? 'ลบแล้ว เขียนใหม่ได้เลย' : 'เริ่มใหม่ได้เลย เริ่มที่จุดสีเขียว', 'smile'); }

  /* ---------- การลาก ---------- */
  onDown(p) {
    if (this.busy() || this.drawing) return; const x = p.worldX, y = p.worldY; if (!inBox(x, y, TR_BOARD)) return;
    if (TRACE_FREE) { this.pid = p.id; this.freeDown(x, y); return; }
    this.cancelDemo(); const h = this.cur().pts[this.pi], r = Math.max(this.cfg.tol * 1.5, 58);
    if (Math.hypot(x - h.x, y - h.y) > r) { this.say(this.pi === 0 ? 'ต้องเริ่มที่จุดสีเขียวนะ' : 'ลากต่อจากจุดสีเหลืองนะ', 'open'); this.tweens.add({ targets: this.pi === 0 ? this.dots[0] : this.head, scaleX: 1.5, scaleY: 1.5, duration: 160, yoyo: true, repeat: 1 }); return; }
    this.drawing = true; this.pid = p.id; this.last = { x, y }; this.off = false; if (this.pi === 0) { this.paintDot(this.cur().pts[0], this.cur().col); KG.audio.play('tick', { p: 1.1 }); }
  }
  onMove(p) {
    if (!this.drawing || p.id !== this.pid) return;
    if (TRACE_FREE) { if (!p.isDown || this.busy() || !inBox(p.worldX, p.worldY, TR_BOARD)) this.freeUp(); else this.freeMove(p.worldX, p.worldY); return; }
    if (!p.isDown) { this.drawing = false; return; } if (this.busy()) { this.drawing = false; return; } this.follow(p.worldX, p.worldY);
  }
  onUp(p) { if (this.drawing && p.id === this.pid) { if (TRACE_FREE) this.freeUp(); else this.drawing = false; } }
  // เดินตามปลายนิ้วทีละ 5px เพื่อไม่ให้เส้นขาดเมื่อลากเร็ว
  follow(x, y) {
    const a = this.last, d = Math.hypot(x - a.x, y - a.y), n = Math.max(1, Math.ceil(d / 5));
    for (let i = 1; i <= n && this.drawing; i++) this.step(a.x + (x - a.x) * i / n, a.y + (y - a.y) * i / n);
    this.last = { x, y }; this.flushPaint();   // วาดครั้งเดียวต่อหนึ่งการขยับนิ้ว (อัปโหลดเท็กซ์เจอร์ครั้งเดียว ไม่กระตุกบนแท็บเล็ต)
  }
  step(x, y) {
    // เดินหน้าไปยังจุดที่ไกลที่สุดในช่วง 4 จุดถัดไป (ห่างกันจุดละ 7px) ที่ปลายนิ้วอยู่ในค่ายอมรับ: ปลายเส้นจึงจบได้แม้นิ้วหยุดเยื้องไปเล็กน้อย ไม่ต้องกดตรงเป๊ะ
    const st = this.cur(), tol = this.cfg.tol; let best = this.pi;
    for (let j = this.pi + 1; j <= Math.min(st.n - 1, this.pi + 4); j++) { if (Math.hypot(x - st.pts[j].x, y - st.pts[j].y) <= tol) best = j; }
    if (best > this.pi || Math.hypot(x - st.pts[this.pi].x, y - st.pts[this.pi].y) <= tol) {
      this.off = false; if (best > this.pi) this.advance(best);
    } else {
      const h = st.pts[this.pi], dh = Math.hypot(x - h.x, y - h.y);
      if (dh > tol * 2.2 && !this.off) { this.off = true; this.gm++; this.mistakes++; this.bad(this.head); this.head.setVisible(true); this.say('ออกนอกรอยแล้ว กลับมาที่จุดสีเหลือง แล้วลากต่อนะ', 'sad'); }
      else if (dh <= tol * 1.3) this.off = false;
    }
  }
  advance(to) {
    const st = this.cur(), from = this.pi; this.pi = to; this.queuePaint(st, from, to);
    if (to >= st.n - 1) { this.flushPaint(); this.strokeDone(); } else { const h = st.pts[to]; this.head.setPosition(h.x, h.y).setVisible(true); if (from === 0) this.refreshDots(); }
  }
  // เก็บช่วงเส้นที่ต้องระบายไว้ก่อน แล้วระบายรวดเดียวตอน flushPaint
  queuePaint(st, from, to) { const p = this._pend; if (p && p.st === st && from <= p.to) p.to = to; else { this.flushPaint(); this._pend = { st, from, to }; } }
  flushPaint() { const p = this._pend; if (!p) return; this._pend = null; this.paintSeg(p.st, p.from, p.to); }
  paintDot(p, col) {
    const a = this.progInk.ctx, b = this.progCol.ctx; a.fillStyle = '#2d2a5e'; a.beginPath(); a.arc(p.x, p.y, 16, 0, 7); a.fill(); b.fillStyle = col; b.beginPath(); b.arc(p.x, p.y, 11.5, 0, 7); b.fill(); this.progInk.refresh(); this.progCol.refresh();
  }
  paintSeg(st, from, to) {
    const pass = (l, w, col) => { const c = l.ctx; c.beginPath(); c.moveTo(st.pts[from].x, st.pts[from].y); for (let j = from + 1; j <= to; j++) c.lineTo(st.pts[j].x, st.pts[j].y); c.lineWidth = w; c.strokeStyle = col; c.stroke(); l.refresh(); };
    pass(this.progInk, 32, '#2d2a5e'); pass(this.progCol, 23, st.col);
  }
  strokeDone() {
    this.drawing = false; const st = this.cur(), e = st.pts[st.n - 1]; KG.audio.play('tick', { p: 1.5 }); KG.fx.burst(this, e.x, e.y, { colors: [Phaser.Display.Color.HexStringToColor(st.col).color, 0xffffff], n: 10, max: 160, depth: 3000 });
    this.si++; this.pi = 0; this.off = false;
    if (this.si >= this.strokes.length) { this.head.setVisible(false); this.dots.forEach(d => d.destroy()); this.dots = []; this.glyphDone(); return; }
    this.refreshDots(); this.say('เก่งมาก! เขียนต่อเส้นที่ ' + (this.si + 1) + ' เริ่มที่จุดสีเขียว', 'happy');
  }

  /* ---------- ตัวอย่างการเขียน ---------- */
  playDemo(fromCurrent) {
    this.cancelDemo(); this.demoL.clear(); const list = [];
    this.strokes.forEach((st, k) => { if (fromCurrent ? k >= this.si : true) list.push({ st, from: fromCurrent && k === this.si ? this.pi : 0 }); });
    if (!list.length) return; this.demo = { list, k: 0, t: list[0].from, wait: 0, hold: 0 }; this.pen.setVisible(true).setPosition(list[0].st.pts[list[0].from].x, list[0].st.pts[list[0].from].y);
    this.say('ดูก่อนนะ ลูกศรวงกลมสีส้มจะเขียนให้ดูทีละเส้น', 'open');
  }
  cancelDemo() { if (!this.demo) return; this.demo = null; this.pen.setVisible(false); this.demoL.clear(); }
  update(time, dt) {
    const D = this.demo; if (!D || this.paused || this._modal) return;
    if (D.hold > 0) { D.hold -= dt; if (D.hold <= 0) this.cancelDemo(); return; }
    if (D.wait > 0) { D.wait -= dt; return; }
    const it = D.list[D.k], pts = it.st.pts, c = this.demoL.ctx, t0 = D.t; D.t = Math.min(pts.length - 1, D.t + dt / 1000 * 22);
    const a = Math.floor(t0), b = Math.floor(D.t);
    if (b > a) { c.beginPath(); c.moveTo(pts[a].x, pts[a].y); for (let j = a + 1; j <= b; j++) c.lineTo(pts[j].x, pts[j].y); c.lineWidth = 20; c.strokeStyle = it.st.col; c.globalAlpha = 0.85; c.stroke(); c.globalAlpha = 1; this.demoL.refresh(); }
    this.pen.setPosition(pts[b].x, pts[b].y);
    if (D.t >= pts.length - 1) { D.k++; if (D.k >= D.list.length) D.hold = 900; else { D.t = D.list[D.k].from; D.wait = 380; this.pen.setPosition(D.list[D.k].st.pts[D.t].x, D.list[D.k].st.pts[D.t].y); } }
  }
  hint() {
    if (this.done || this.busy() || this.drawing) return;
    if (TRACE_FREE) { this.say('เขียนทับรอยจาง ๆ หรือเขียนเองก็ได้ เขียนเสร็จแล้วกด “เขียนเสร็จแล้ว”', 'open'); return; }
    this.hints++; this.playDemo(true);
  }

  /* ---------- เขียนอิสระ (TRACE_FREE): ลงหมึกตามนิ้ว ไม่ตรวจลำดับขีด ทิศทาง หรือจุดเริ่ม ---------- */
  freeDown(x, y) {
    this.cancelDemo(); const col = STROKE_COL[this.free.length % STROKE_COL.length];
    this.fs = { pts: [{ x, y }], col }; this.drawing = true; this.last = { x, y }; this.inkDot(this.fs.pts[0], col); KG.audio.play('tick', { p: 1.1 });
  }
  freeMove(x, y) {
    const a = this.last, d = Math.hypot(x - a.x, y - a.y); if (d < 2.5) return;
    const b = { x, y }; this.fs.pts.push(b); this.inkSeg(a, b, this.fs.col); this.last = b;
  }
  freeUp() {
    const s = this.fs; this.fs = null; this.drawing = false; if (!s) return;
    this.free.push(s); this.updateFreeTxt(); if (this.doneBtn && this.freeLen() >= this.modelLen() * 0.35) this.doneBtn.pulse();
  }
  inkDot(p, col) {
    const a = this.progInk.ctx, b = this.progCol.ctx; a.fillStyle = '#2d2a5e'; a.beginPath(); a.arc(p.x, p.y, 14, 0, 7); a.fill(); b.fillStyle = col; b.beginPath(); b.arc(p.x, p.y, 9.5, 0, 7); b.fill(); this.progInk.refresh(); this.progCol.refresh();
  }
  inkSeg(p, q, col) {
    const pass = (l, w, c) => { const g = l.ctx; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.lineWidth = w; g.strokeStyle = c; g.stroke(); l.refresh(); };
    pass(this.progInk, 28, '#2d2a5e'); pass(this.progCol, 19, col);
  }
  redrawFree() {
    this.progInk.clear(); this.progCol.clear();
    this.free.forEach(s => { this.inkDot(s.pts[0], s.col); for (let i = 1; i < s.pts.length; i++) this.inkSeg(s.pts[i - 1], s.pts[i], s.col); });
  }
  undoFree() { if (!this.free.length) return; this.free.pop(); this.redrawFree(); this.updateFreeTxt(); }
  pathLen(list) { let t = 0; list.forEach(pts => { for (let i = 1; i < pts.length; i++) t += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); }); return t; }
  freeLen() { return this.pathLen(this.free.map(s => s.pts)); }
  modelLen() { return this.pathLen(this.strokes.map(s => s.pts)); }
  updateFreeTxt() { if (this.strokeTxt) this.strokeTxt.setText(this.free.length ? 'เขียนแล้ว ' + this.free.length + ' เส้น' : 'เขียนได้อย่างอิสระ'); }
  finishFree() {
    if (this.busy() || this.drawing) return;
    if (!this.free.length || this.freeLen() < this.modelLen() * 0.35) { KG.audio.play('pop'); this.say('ยังเขียนไม่ครบนะ ลองเขียนทับรอยจาง ๆ ให้ครบทั้งตัว แล้วกด “เขียนเสร็จแล้ว”', 'open'); return; }
    this.glyphDone();
  }

  /* ---------- เขียนครบ ---------- */
  glyphDone() {
    this.locking = true; const key = this.key, gs = this.gm <= 1 ? 3 : this.gm <= 3 ? 2 : 1, prev = SAVE.data.traced[key] || 0, first = !prev, inf = this.inf;
    if (gs > prev) SAVE.data.traced[key] = gs; let newSticker = false;
    if (cons(key) && !SAVE.data.stickers[key]) { SAVE.data.stickers[key] = 1; newSticker = true; }
    if (first) SAVE.data.coins = (SAVE.data.coins || 0) + 3; SAVE.save();
    const B = TR_BOARD; KG.audio.play('good'); KG.fx.burst(this, B.x + B.w / 2, B.y + B.h / 2, { colors: [0xffd34f, 0xff7ab2, 0x4ef4d2, 0xffffff], n: 28, max: 320, depth: 3000 });
    this.speak(inf.say); this.say('เขียน “' + inf.text + '” ได้แล้ว! ' + (first ? 'ได้เหรียญ +3' : '') + (newSticker ? ' และได้สติกเกอร์ใหม่!' : ''), 'happy');
    if (this.writeMode) { this.time.delayedCall(800, () => this.writeResult(gs, newSticker)); return; }
    this.setPips(this.gi + 1); this.time.delayedCall(1300, () => this.nextGlyph());
  }
  nextGlyph() {
    this.locking = true;
    if (this.gi + 1 < this.list.length) { this.loadGlyph(this.gi + 1); return; }
    this.finish([['เขียนตามรอย', this.list.length + ' ตัว']]);
  }
  starsFor(m, h) { const p = m + h; return p <= 2 ? 3 : p <= 5 ? 2 : 1; }
  writeResult(gs, newSticker) {
    const last = this.setIdx >= this.set.items.length - 1;
    KG.ui.modal(this, {
      title: 'เขียนได้แล้ว!', w: 760, accent: 0xff7a3c, extraH: 96, body: newSticker ? 'ได้สติกเกอร์ ' + this.inf.label + ' เก็บไว้ในสมุดสติกเกอร์แล้ว' : 'ตัวนี้ได้ ' + gs + ' ดาว เขียนซ้ำเพื่อให้ได้ 3 ดาวนะ',
      build: (box, g) => { const st = KG.ui.stars(this, 0, g.top + 30, 0, 3, 58); box.add(st); this.time.delayedCall(300, () => st.setStars(gs, true)); },
      buttons: [{ label: 'เขียนอีกครั้ง', style: 'ghost', icon: 'reset', onClick: () => this.go('Trace', { set: this.set.id, idx: this.setIdx }) }, { label: 'กลับบ้านคัดลายมือ', style: 'cyan', icon: 'flag', onClick: () => this.leave() }].concat(last ? [] : [{ label: 'ตัวถัดไป', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Trace', { set: this.set.id, idx: this.setIdx + 1 }) }])
    });
  }
  leave() { if (this.writeMode) this.go('Write', { set: this.set.id }); else super.leave(); }
}
function AkTitleOf(s) { return s.lesson ? s.lesson.th : 'บ้านคัดลายมือ'; }
