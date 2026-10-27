/* ===== กระดาษทด: วาดโจทย์หนึ่งข้อลงกระดาษแบบที่เขียนจริงในสมุด (ตั้งหลักตรงกัน ตัวทด การยืม หารสั้น หารยาว เศษส่วน) =====
   new Paper(scene, area, q, opt) · ช่องที่ต้องเขียนเรียงตาม q.cells · ฉากเล่นสั่ง setActive / type / mark แล้ว Paper วาดสิ่งที่ต้องเห็นตามขั้น (ตัวทด การยืม เศษ ดึงลง)
   opt: { index, total, scaffold (ระดับง่าย: ป้ายชื่อหลัก แสดงการยืม), color } */
const BOX = { idle: [0xeef4ff, 0xa9c0e8, 2], active: [0xfff4b8, 0xff9d00, 3.5], wrong: [0xffe0dc, 0xe8452c, 3.5], demo: [0xe3fff1, 0x22b45a, 2.5], done: null, ghost: [0xf6f8fd, 0xd3deef, 1.5] };
class Paper {
  constructor(scene, area, q, opt) {
    this.s = scene; this.a = area; this.q = q; this.o = opt || {}; this.views = []; this.byId = {}; this.active = -1; this.extra = {}; this.shownBorrow = {};
    this.root = scene.add.container(0, 0).setDepth(10);
    this.x0 = area.x + 70; this.x1 = area.x + area.w - 28; this.cw = this.x1 - this.x0; this.cx = (this.x0 + this.x1) / 2; this.top = area.y + 66; this.bot = area.y + area.h - 16;
    this.header();
    const m = q.mode; if (m === 'column') this.buildColumn(); else if (m === 'mul2') this.buildMul2(); else if (m === 'sdiv') this.buildSdiv(); else if (m === 'ldiv') this.buildLdiv(); else this.buildFlow();
    this.caret = scene.add.rectangle(0, 0, 3, 34, 0x1f3d99, 1).setVisible(false); this.root.add(this.caret);
    this.caretTw = scene.tweens.add({ targets: this.caret, alpha: 0.1, duration: 420, yoyo: true, repeat: -1 });
  }
  t(x, y, s, size, color, o) { const t = FIG.mt(this.s, x, y, s, size, color, o); this.root.add(t); return t; }
  g() { const g = this.s.add.graphics(); this.root.add(g); return g; }
  header() {
    const a = this.a, o = this.o, lab = o.total ? 'ข้อ ' + o.index + '/' + o.total : 'ข้อ ' + o.index, w = KG.measure(lab, '600 20px Kanit') + 28, g = this.g();
    g.fillStyle(hexInt(o.color || '#3d8bff'), 1); g.fillRoundedRect(a.x + 18, a.y + 14, w, 36, 18);
    this.root.add(KG.txt(this.s, a.x + 18 + w / 2, a.y + 32, lab, { size: 20, color: '#ffffff', center: true, middle: true }));
    this.root.add(KG.txt(this.s, a.x + 30 + w, a.y + 32, this.q.head, { size: 24, color: INK.head, oy: 0.5, width: a.w - w - 70 }));
  }
  /* ---------- ช่องเขียน ---------- */
  addCell(def, x, y, w, h, size) {
    const v = { def, x, y, w, h, size, val: '', state: 'idle', g: this.g() };
    v.t = this.t(x, y, '', size, INK.pen); v.i = this.views.length; this.views.push(v); this.byId[def.id] = v; this.drawBox(v); return v;
  }
  drawBox(v) {
    const st = BOX[v.state]; v.g.clear(); if (!st || v.hidden) return;
    if (v.state === 'active') { v.g.lineStyle(9, 0xffc400, 0.25); v.g.strokeRoundedRect(v.x - v.w / 2 - 4, v.y - v.h / 2 - 4, v.w + 8, v.h + 8, 12); }
    v.g.fillStyle(st[0], 1); v.g.fillRoundedRect(v.x - v.w / 2, v.y - v.h / 2, v.w, v.h, 9); v.g.lineStyle(st[2], st[1], 1); v.g.strokeRoundedRect(v.x - v.w / 2, v.y - v.h / 2, v.w, v.h, 9);
  }
  setState(v, st) { v.state = st; this.drawBox(v); v.t.setColor(st === 'demo' ? INK.demo : st === 'wrong' ? INK.red : INK.pen); }
  setHidden(v, h) { v.hidden = h; v.t.setVisible(!h); this.drawBox(v); }
  type(i, s) { const v = this.views[i]; if (!v) return; v.val = s; v.t.setText(s); this.placeCaret(); }
  placeCaret() { const v = this.views[this.active]; if (!v || v.def.choice || this.q.mode === 'shade') { this.caret.setVisible(false); return; } this.caret.setVisible(true).setSize(3, v.h * 0.62); this.caret.setPosition(v.val ? v.x + v.t.width / 2 + 4 : v.x, v.y); }
  mark(i, st) { const v = this.views[i]; if (v) this.setState(v, st); }
  pos(i) { const v = this.views[i]; return v ? { x: v.x, y: v.y } : { x: this.cx, y: this.top + 100 }; }
  setActive(i) {
    const prev = this.views[this.active]; if (prev && prev.state === 'active') this.setState(prev, prev.val ? 'done' : 'idle');
    this.active = i; const v = this.views[i];
    if (v) { if (v.hidden) this.setHidden(v, false); this.setState(v, 'active'); }
    this.progress(i); this.placeCaret();
  }
  done() { this.active = this.views.length; this.progress(this.views.length); this.caret.setVisible(false); }

  /* ---------- โจทย์แบบข้อความ + ช่องเติม / ตัวเลือก / รูประบายสี ---------- */
  buildFlow() {
    const q = this.q, s = this.s; let top = this.top, bottom = this.bot;
    if (q.fig) { const big = q.fig.kind === 'pict' || q.fig.kind === 'bars'; const r = FIG.draw(s, this.root, q.fig, this.cx, top + 4, this.cw, big ? 290 : 262); top += r.h + 14; this.live = r.live || null; }
    if (q.mode === 'choice') bottom -= q.wide ? 172 : 112;
    const size = q.long ? 30 : q.fig ? 34 : 42, font = '600 ' + size + 'px Mali', fsz = Math.round(size * 0.82);
    // ชิ้นส่วนเป็นโทเค็น: text / slot / frac / mixed / under / br
    const toks = [];
    q.q.forEach(p => {
      if (typeof p === 'string') { let segs; try { segs = [...new Intl.Segmenter('th', { granularity: 'word' }).segment(p)].map(x => x.segment); } catch (e) { segs = p.split(/(?<=\s)/); } segs.forEach(sg => toks.push({ k: 'text', s: sg, w: KG.measure(sg, font) })); }
      else if (p.br) toks.push({ k: 'br' });
      else if (p.slot != null) toks.push({ k: 'slot', i: p.slot, w: this.slotW(p.slot, size) });
      else if (p.frac) toks.push({ k: 'frac', p: p.frac, w: Math.max(this.partW(p.frac[0], fsz), this.partW(p.frac[1], fsz)) + 18, tall: true });
      else if (p.mixed) { const fw = Math.max(this.partW(p.mixed[1], fsz), this.partW(p.mixed[2], fsz)) + 18; toks.push({ k: 'mixed', p: p.mixed, ww: this.partW(p.mixed[0], size), fw, w: this.partW(p.mixed[0], size) + 8 + fw, tall: true }); }
      else if (p.under) toks.push({ k: 'under', s: p.under, d: p.k, w: KG.measure(p.under, font) });
    });
    // ตัดบรรทัด
    const lines = [[]]; let x = 0;
    toks.forEach(tk => { if (tk.k === 'br') { lines.push([]); x = 0; return; } const L = lines[lines.length - 1]; if (x + tk.w > this.cw && L.length) { if (tk.k === 'text' && !tk.s.trim()) return; lines.push([tk]); x = tk.w; } else { L.push(tk); x += tk.w; } });
    const lh = L => (L.some(tk => tk.tall) ? fsz * 2.2 + 74 : size * 1.75), H = lines.reduce((a, L) => a + lh(L), 0);
    let y = top + Math.max(0, (bottom - top - H) / 2);
    lines.forEach(L => {
      const w = L.reduce((a, tk) => a + tk.w, 0), h = lh(L); let x = this.cx - w / 2; const cy = y + h / 2;
      L.forEach(tk => { this.drawTok(tk, x, cy, size, fsz); x += tk.w; });
      y += h;
    });
    if (q.mode === 'choice') this.buildOpts(bottom + 8);
    if (q.mode === 'shade' && this.live) { const ct = this.t(this.cx, this.bot - 26, '', 22, INK.pen); const up = () => ct.setText('ระบายแล้ว ' + this.live.count() + ' ชิ้น จาก ' + this.live.n + ' ชิ้น'); this.live.onChange = () => { up(); if (this.onShade) this.onShade(); }; up(); }
  }
  cellOf(i) { return this.q.cells[i]; }
  slotW(i, size) { const c = this.q.mode === 'choice' ? { w: this.q.cmp ? 1 : 3 } : this.cellOf(i); return Math.max(this.q.mode === 'choice' && this.q.wide ? 560 : 74, (c.w || 2) * size * 0.6 + 30); }
  partW(p, size) { return typeof p === 'string' ? KG.measure(p, '600 ' + size + 'px Mali') : this.slotW(p.slot, size); }
  drawPart(p, x, y, size) { if (typeof p === 'string') { this.t(x, y, p, size, INK.text); return; } this.slotCell(p.slot, x, y, this.slotW(p.slot, size), size + 18, size); }
  slotCell(i, x, y, w, h, size) {
    if (this.q.mode === 'choice') { const c = this.q.cells[0], v = this.addCell(Object.assign({ choice: true }, c), x, y, w, h, size); v.t.setText('?').setColor('#9aa8c8'); return v; }
    if (this.q.mode === 'shade') return null;
    return this.addCell(this.q.cells[i], x, y, w, h, size);
  }
  drawTok(tk, x, cy, size, fsz) {
    if (tk.k === 'text') { if (tk.s.trim()) this.t(x, cy, tk.s, size, INK.text, { ox: 0 }); return; }
    if (tk.k === 'slot') { this.slotCell(tk.i, x + tk.w / 2, cy, tk.w - 10, size + 22, size); return; }
    if (tk.k === 'under') {
      const font = '600 ' + size + 'px Mali'; let cnt = -1, at = -1; for (let j = tk.s.length - 1; j >= 0; j--) if (/\d/.test(tk.s[j])) { cnt++; if (cnt === tk.d) { at = j; break; } }
      const pre = tk.s.slice(0, at), ch = tk.s[at], post = tk.s.slice(at + 1), wp = KG.measure(pre, font), wc = KG.measure(ch, font);
      this.t(x, cy, pre, size, INK.text, { ox: 0 }); this.t(x + wp, cy, ch, size, INK.red, { ox: 0 }); this.t(x + wp + wc, cy, post, size, INK.text, { ox: 0 });
      const g = this.g(); g.lineStyle(4, 0xd63a2f, 1); g.beginPath(); g.moveTo(x + wp - 2, cy + size * 0.55); g.lineTo(x + wp + wc + 2, cy + size * 0.55); g.strokePath(); return;
    }
    const frac = (p, fx, fw) => { const g = this.g(); g.lineStyle(3.5, 0x27324f, 1); g.beginPath(); g.moveTo(fx - fw / 2 + 4, cy); g.lineTo(fx + fw / 2 - 4, cy); g.strokePath(); this.drawPart(p[0], fx, cy - fsz * 0.5 - 22, fsz); this.drawPart(p[1], fx, cy + fsz * 0.5 + 24, fsz); };
    if (tk.k === 'frac') { frac(tk.p, x + tk.w / 2, tk.w); return; }
    if (tk.k === 'mixed') { this.drawPart(tk.p[0], x + tk.ww / 2, cy, size); frac([tk.p[1], tk.p[2]], x + tk.ww + 8 + tk.fw / 2, tk.fw); }
  }
  // ตัวเลือก: การ์ดกระดาษใหญ่ มีเลขคีย์ลัดมุมซ้าย
  buildOpts(y0) {
    const q = this.q, n = q.opts.length, wide = q.wide, cols = wide ? 2 : n, rows = Math.ceil(n / cols), gap = 18, w = wide ? (this.cw - gap) / 2 : Math.min(q.cmp ? 130 : 190, (this.cw - gap * (n - 1)) / n), h = wide ? 70 : 88;
    this.opts = [];
    q.opts.forEach((op, i) => {
      const c = i % cols, r = Math.floor(i / cols), tw = cols * w + (cols - 1) * gap, x = this.cx - tw / 2 + c * (w + gap) + w / 2, y = y0 + r * (h + 12) + h / 2;
      const g = this.g(), key = q.cmp ? [',', '=', '.'][i] : String(i + 1);
      const draw = st => { g.clear(); const col = { idle: [0xffffff, 0x3d5aa8], hover: [0xfff7d0, 0xff9d00], right: [0xdcffe9, 0x22b45a], wrong: [0xffe0dc, 0xe8452c], dim: [0xf3f5fa, 0xc3cde3] }[st]; g.fillStyle(0x1b2a6b, 0.18); g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 6, w, h, 14); g.fillStyle(col[0], 1); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14); g.lineStyle(3, col[1], 1); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14); };
      draw('idle');
      const lab = this.t(x + (wide ? 14 : 0), y + 1, op.label, q.cmp ? 52 : wide ? 25 : 34, INK.text); if (lab.width > w - 50) lab.setScale((w - 50) / lab.width);
      const kb = this.g(); kb.fillStyle(0x1b2a6b, 1); kb.fillRoundedRect(x - w / 2 + 8, y - h / 2 + 8, 26, 26, 6); this.root.add(KG.txt(this.s, x - w / 2 + 21, y - h / 2 + 21, key, { size: 16, color: '#ffffff', center: true, middle: true }));
      const z = this.s.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }); this.root.add(z);
      const o = { id: op.id, label: op.label, x, y, w, h, draw, z, state: 'idle' };
      z.on('pointerover', () => { if (o.state === 'idle') { draw('hover'); KG.audio.play('hover'); } }); z.on('pointerout', () => { if (o.state === 'idle') draw('idle'); });
      z.on('pointerup', () => { if (this.onPick) this.onPick(o.id); });
      this.opts.push(o);
    });
  }
  optState(id, st) { const o = this.opts && this.opts.find(x => x.id === id); if (o) { o.state = st === 'hover' ? 'idle' : st; o.draw(st); } }
  choose(label, st) { const v = this.views[0]; if (!v) return; v.t.setText(label).setColor(st === 'demo' ? INK.demo : INK.pen); v.t.setScale(1); if (v.t.width > v.w - 12) v.t.setScale((v.w - 12) / v.t.width); }

  /* ---------- ตั้งบวก ลบ คูณ ---------- */
  buildColumn() {
    const q = this.q, rows = q.pad, op = q.op, dp = q.dp, digits = rows.map(r => r.replace('.', '')), nres = q.cells.length, ncol = Math.max(...digits.map(d => d.length), nres) + 1;
    const nr = rows.length, G = Math.min(80, (this.bot - this.top - 30) / (nr + 3.2), this.cw / (ncol + 0.6)), size = Math.round(G * 0.72), bw = ncol * G, xr = this.cx + bw / 2, X = k => xr - (k + 0.5) * G;
    const y0 = this.top + G * (this.o.scaffold ? 1.95 : 1.4), Y = r => y0 + r * G, yRes = Y(nr) + G * 0.25, g = this.g();
    this.G = G; this.X = X; this.y0 = y0;
    // ตารางช่วยตั้งหลัก
    g.fillStyle(0xdfe9fb, 0.55); for (let k = 0; k < ncol - 1; k++) for (let r = 0; r <= nr; r++) { const yy = r < nr ? Y(r) : yRes; g.fillRect(X(k) - G / 2 + 2, yy - G / 2 + 2, G - 4, G - 4); }
    if (this.o.scaffold) for (let k = 0; k < ncol - 1; k++) this.t(X(k), y0 - G * 1.25, k < dp ? ['ส่วนสิบ', 'ส่วนร้อย', 'ส่วนพัน'][dp - k - 1] : MG.PLACE_TH[k - dp] || '', Math.min(15, G * 0.26), '#6f7fa8', { weight: '400' });
    this.digitT = [];
    rows.forEach((r, ri) => {
      const ds = digits[ri].split('').reverse(), [ip, fp] = r.split('.'), padN = fp ? r.split('.')[1].length - (q.rows[ri].split('.')[1] || '').length : 0;
      this.digitT[ri] = ds.map((d, k) => this.t(X(k), Y(ri), d, size, k < padN ? INK.aid : INK.text));
      if (dp) this.t(xr - dp * G, Y(ri) + G * 0.2, '.', size, INK.text);
    });
    this.t(X(ncol - 1), Y(nr - 1), op === '-' ? '−' : op, size, INK.text);
    g.lineStyle(3.5, 0x27324f, 1); g.beginPath(); g.moveTo(xr - bw + 6, Y(nr - 1) + G * 0.52); g.lineTo(xr, Y(nr - 1) + G * 0.52); g.strokePath();
    [0, 7].forEach(d => { g.beginPath(); g.moveTo(xr - bw + 6, yRes + G * 0.55 + d); g.lineTo(xr, yRes + G * 0.55 + d); g.strokePath(); });
    if (dp) this.resDot = this.t(xr - dp * G, yRes + G * 0.2, '.', size, INK.pen).setAlpha(0.25);
    q.cells.forEach(c => this.addCell(c, X(c.col), yRes, G - 10, G - 8, size));
    this.carryT = {}; Object.keys(q.carry).forEach(k => { this.carryT[k] = this.t(X(+k) - G * 0.18, Y(0) - G * 0.62, q.carry[k], Math.round(size * 0.55), INK.red).setVisible(false); });
    this.markG = this.g(); this.markT = [];
  }
  showBorrow(k) {
    const q = this.q; if (this.shownBorrow[k] || !q.marks || !q.marks[k]) return; this.shownBorrow[k] = true;
    const G = this.G, g = this.markG;
    q.marks[k].forEach(m => {
      const x = this.X(m.col), y = this.y0, d = this.digitT[0][m.col]; if (d) d.setAlpha(0.55);
      g.lineStyle(3, 0xd63a2f, 1); g.beginPath(); g.moveTo(x - G * 0.26, y + G * 0.3); g.lineTo(x + G * 0.26, y - G * 0.3); g.strokePath();
      const t = this.t(x + (m.val >= 10 ? -G * 0.05 : 0), y - G * 0.66, m.val, Math.round(G * 0.42), INK.red).setScale(0.2); this.s.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' });
    });
    KG.audio.play('stamp');
  }

  /* ---------- คูณเลข 2 หลัก ---------- */
  buildMul2() {
    const q = this.q, ncol = Math.max(q.a.length, q.b.length, q.p2.length, q.res.length) + 1, G = Math.min(64, (this.bot - this.top - 20) / 6.3, this.cw / (ncol + 0.6)), size = Math.round(G * 0.72), bw = ncol * G, xr = this.cx + bw / 2, X = k => xr - (k + 0.5) * G;
    const y0 = this.top + G * 0.9, Y = r => y0 + r * G * 1.02, g = this.g(); this.G = G; this.X = X;
    g.fillStyle(0xdfe9fb, 0.55); for (let k = 0; k < ncol - 1; k++) for (let r = 0; r < 5; r++) g.fillRect(X(k) - G / 2 + 2, Y(r) + (r >= 2 ? G * 0.2 : 0) + (r >= 4 ? G * 0.2 : 0) - G / 2 + 2, G - 4, G - 4);
    q.a.split('').reverse().forEach((d, k) => this.t(X(k), Y(0), d, size, INK.text));
    q.b.split('').reverse().forEach((d, k) => this.t(X(k), Y(1), d, size, INK.text)); this.t(X(ncol - 1), Y(1), '×', size, INK.text);
    const line = y => { g.lineStyle(3.5, 0x27324f, 1); g.beginPath(); g.moveTo(xr - bw + 6, y); g.lineTo(xr, y); g.strokePath(); };
    line(Y(1) + G * 0.55); const yp1 = Y(2) + G * 0.2, yp2 = Y(3) + G * 0.2, ys = Y(4) + G * 0.4; line(yp2 + G * 0.55); line(ys + G * 0.55); line(ys + G * 0.55 + 7);
    this.t(X(ncol - 1), yp2, '+', size, INK.text);
    this.zero = this.t(X(0), yp2, '0', size, INK.aid).setVisible(false);
    q.cells.forEach(c => this.addCell(c, X(c.col), c.row === 'p1' ? yp1 : c.row === 'p2' ? yp2 : ys, G - 10, G - 8, size));
    this.rowLab = [['แถวที่ 1 (× ' + q.b[1] + ')', yp1], ['แถวที่ 2 (× ' + q.b[0] + '0)', yp2], ['ผลคูณ', ys]].map(([s, y]) => this.t(xr - bw - 16, y, s, 16, '#6f7fa8', { ox: 1, weight: '400' }));
  }

  /* ---------- หารสั้น ---------- */
  buildSdiv() {
    const q = this.q, n = q.n, G = Math.min(66, this.cw / (n.length + 2.2 + q.d.length * 0.7)), size = Math.round(G * 0.73), w = (n.length + 1.6 + q.d.length * 0.7) * G, xd = this.cx - w / 2 + (q.d.length * 0.7 + 1.1) * G, y = this.top + 110, g = this.g(), X = i => xd + (i + 0.5) * G;
    this.X = X; this.G = G;
    this.t(xd - G * 0.75, y, q.d, size, INK.text, { ox: 1 });
    g.lineStyle(4, 0x27324f, 1); g.beginPath(); g.arc(xd - G * 0.95, y, G * 0.62, -0.75, 0.75); g.strokePath();
    n.split('').forEach((d, i) => this.t(X(i), y, d, size, INK.text));
    g.beginPath(); g.moveTo(xd - G * 0.2, y + G * 0.55); g.lineTo(xd + n.length * G + 10, y + G * 0.55); g.strokePath();
    const yq = y + G * 1.2; this.remT = {}; Object.keys(q.rem).forEach(i => { this.remT[i] = this.t(X(+i) - G * 0.36, y - G * 0.34, q.rem[i], 24, INK.red).setVisible(false); });
    q.cells.forEach(c => { if (c.row === 'q') this.addCell(c, X(c.col), yq, G - 12, G - 6, size); });
    const rc = q.cells.find(c => c.row === 'rem');
    // เศษ: บรรทัดใต้ผลหาร ช่องอยู่ตรงหลักขวาสุด (ไม่ต่อท้ายตัวตั้ง เพราะกระดาษแคบแล้วจะล้นขอบ)
    if (rc) { const xr = X(n.length - 1), yr = yq + G * 1.25; this.t(xr - G * 0.6 - 10, yr, 'เศษ', 30, INK.text, { ox: 1 }); this.addCell(rc, xr, yr, G - 10, G - 6, size); }
  }

  /* ---------- หารยาว ---------- */
  buildLdiv() {
    const q = this.q, n = q.n, rowsN = q.lines.length + 2, G = Math.min(58, (this.bot - this.top - 10) / (rowsN + 0.4), this.cw / (n.length + q.d.length + 2)), size = Math.round(G * 0.72), dl = q.d.length;
    const w = (n.length + dl + 1.4) * G, xd = this.cx - w / 2 + (dl + 1.4) * G, X = i => xd + (i + 0.5) * G, yq = this.top + G * 0.6, y1 = yq + G * 1.05, Y = li => y1 + (li + 1) * G, g = this.g();
    this.X = X; this.G = G; this.Y = Y; this.y1 = y1;
    g.fillStyle(0xdfe9fb, 0.5); for (let i = 0; i < n.length; i++) for (let r = -1; r <= q.lines.length; r++) g.fillRect(X(i) - G / 2 + 2, (r < 0 ? yq : r === 0 ? y1 : Y(r - 1)) - G / 2 + 2, G - 4, G - 4);
    this.t(xd - G * 0.55, y1, q.d, size, INK.text, { ox: 1 });
    g.lineStyle(4, 0x27324f, 1); g.beginPath(); g.arc(xd - G * 0.75, y1, G * 0.56, -0.8, 0.8); g.strokePath();
    g.beginPath(); g.moveTo(xd - G * 0.3, y1 - G * 0.55); g.lineTo(xd + n.length * G + 6, y1 - G * 0.55); g.strokePath();
    this.divT = n.split('').map((d, i) => this.t(X(i), y1, d, size, INK.text));
    this.lineG = this.g(); this.lineShown = {}; this.downT = {};
    q.cells.forEach(c => {
      if (c.row === 'q') { this.addCell(c, X(c.col), yq, G - 10, G - 8, size); return; }
      const L = q.lines[c.line], col = L.end - (L.s.length - 1 - c.k), v = this.addCell(c, X(col), Y(c.line), G - 10, G - 8, size); this.setHidden(v, true);
    });
    q.lines.forEach((L, li) => L.kind === 'diff' && L.down.forEach(col => { this.downT[col] = { li, t: this.t(X(col), Y(li), n[col], size, INK.aid).setVisible(false) }; }));
  }
  ldivLine(li) {
    if (this.lineShown[li]) return; this.lineShown[li] = true; const L = this.q.lines[li]; if (L.kind !== 'mul') return;
    const G = this.G, x0 = this.X(L.end - L.s.length + 1) - G / 2 - 4, x1 = this.X(L.end) + G / 2, y = this.Y(li), g = this.lineG;
    this.t(x0 - G * 0.25, y, '−', Math.round(G * 0.62), INK.text); g.lineStyle(3, 0x27324f, 1); g.beginPath(); g.moveTo(x0 - G * 0.45, y + G * 0.5); g.lineTo(x1, y + G * 0.5); g.strokePath();
  }
  bringDown(col) {
    const d = this.downT[col]; if (!d || d.t.visible) return; const G = this.G, x = this.X(col), ya = this.y1 + G * 0.45, yb = this.Y(d.li) - G * 0.45;
    const ar = this.g(); ar.lineStyle(2.5, 0x3d7bff, 0.9); for (let yy = ya; yy < yb - 6; yy += 9) { ar.beginPath(); ar.moveTo(x + G * 0.38, yy); ar.lineTo(x + G * 0.38, Math.min(yb - 6, yy + 5)); ar.strokePath(); } ar.fillStyle(0x3d7bff, 0.9); ar.fillTriangle(x + G * 0.38 - 6, yb - 8, x + G * 0.38 + 6, yb - 8, x + G * 0.38, yb);
    d.t.setVisible(true).setAlpha(0).setY(d.t.y - 14); this.s.tweens.add({ targets: d.t, alpha: 1, y: d.t.y + 14, duration: 320, ease: 'Back.easeOut' }); KG.audio.play('drop');
    if (this.divT[col]) this.s.tweens.add({ targets: this.divT[col], scaleX: 1.25, scaleY: 1.25, duration: 160, yoyo: true });
  }

  /* ---------- แสดงสิ่งที่เกมเขียนให้ตามขั้น ---------- */
  progress(i) {
    const q = this.q, all = i >= this.views.length, c = all ? null : this.views[i].def;
    if (q.mode === 'column') {
      const k = all ? 99 : c.col; Object.keys(this.carryT).forEach(j => { if (+j <= k && !this.carryT[j].visible) { const t = this.carryT[j].setVisible(true).setScale(0.2); this.s.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 240, ease: 'Back.easeOut' }); } });
      if (q.marks) Object.keys(q.marks).forEach(j => { if (+j < k || (+j === k && q.showBorrow)) this.showBorrow(+j); });
      if (this.resDot && (all || k >= q.dp)) this.resDot.setAlpha(1);
    } else if (q.mode === 'mul2') { if (all || c.row !== 'p1') this.zero.setVisible(true); }
    else if (q.mode === 'sdiv') { const k = all || c.row === 'rem' ? 99 : c.col; Object.keys(this.remT).forEach(j => { if (+j <= k) this.remT[j].setVisible(true); }); }
    else if (q.mode === 'ldiv') {
      const upto = all ? 99 : c.row === 'q' ? c.col : q.lines[c.line].end;
      Object.keys(this.downT).forEach(col => { if (+col <= upto) this.bringDown(+col); });
      if (!all && c.line != null) { this.ldivLine(c.line); const L = q.lines[c.line]; L.ids.forEach(id => { const v = this.byId[id]; if (v.hidden) this.setHidden(v, false); }); }
      if (all) { q.lines.forEach((L, li) => this.ldivLine(li)); if (!this.remLab) { const G = this.G; this.remLab = this.t(this.X(q.n.length - 1) + G * 0.9, this.top + G * 0.6, q.r ? 'เศษ ' + q.r : 'ลงตัว', Math.round(G * 0.5), INK.red, { ox: 0 }); } }
    }
  }
  destroy() { if (this.caretTw) this.caretTw.remove(); this.root.destroy(true); }
}
