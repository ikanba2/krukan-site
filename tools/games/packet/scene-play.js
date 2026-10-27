/* ===== ฉากเล่น Packet Express: แพ็กเก็ตวิ่งตามสายเคเบิล แตะสวิตช์เราเตอร์เพื่อเลือกทางไปเซิร์ฟเวอร์ที่ถูก =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y8-70 · กระดานเครือข่าย x150-1230 y108-590 · แผงสถานะซ้าย x12-142 · แถบล่าง y600-700 */
const BOARD = { x: 150, y: 108, w: 1080, h: 484 };
const ARENAS = ['ice', 'nature', 'sky', 'sun'];
const CABLE = { line: 0x2b3f9c, base: 0xdcebff, hot: 0xffb347, cut: 0xe0243d, good: 0x22b45a };

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.lv = data.level || 1; this.tutorial = this.lv === 1; this.mode = this.tutorial ? 'free' : (data.mode || SAVE.data.mode);
    this._restartData = { level: this.lv, mode: data.mode || SAVE.data.mode, tutor: data.tutor };
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music(this.mode === 'time' ? 'bounce' : 'sunny');
    const L = this.L = LEVELS[this.lv - 1];
    this.run = this.pickRun(); this.S = PX.newState(this.run); this.G = this.run.G;
    this.state = 'intro'; this.lives = 3; this.ff = 1; this.acc = 0; this.evIdx = 0; this.pv = {}; this.tier = 0; this.toggles = 0; this.tutor = null; this.warned = {}; this.hintTx = {};
    this.speedMul = MODE_SPEED[this.mode]; this.hints = this.mode === 'free';
    this.buildBackground(); this.buildNet(); this.buildHud(); this.buildSide(); this.buildBar();
    this.rider = new KG.Rider(this, 78, 706, { forms: FORMS, form: 0, bodyH: 230, depth: 20 });
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.refreshStatus();
    if (this.tutorial) this.time.delayedCall(500, () => this.startTutor()); else this.showIntro();
  }
  onEscape() { if (this.state === 'play') this.pause(); }
  leave() { this.go('Select', { level: this.lv }); }
  pickRun() {
    const L = this.L; let seed = Math.floor(Math.random() * 1e9);
    if (this.tutorial) { for (let s = 1; s < 400; s++) { const r = PX.makeRun(L, s); if (r.ok && r.schedule[0].dest === 'A' && r.schedule[1].dest === 'B') return r; } }
    return PX.makeRun(L, seed);
  }

  /* ---------- ฉากหลัง กระดาน สายเคเบิล โหนด ---------- */
  buildBackground() {
    this.add.image(GW / 2, GH / 2, 'arena_' + ARENAS[(this.lv - 1) % ARENAS.length]).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.2);
    KG.fx.ambient(this, { freq: 360, colors: [0xffffff, 0x7fe0ff, 0xffd34f], s: 0.3, alpha: 0.7 });
    KG.ui.panel(this, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { accent: '#2b8cff', accent2: '#7fe0ff', cuts: [22, 0, 22, 0], fill: ['#f6fbff', '#dcecff'], alpha: 0.96 }).setDepth(1);
    const g = this.add.graphics().setDepth(1.5); g.fillStyle(0x9db4e6, 0.35);
    for (let x = BOARD.x + 30; x < BOARD.x + BOARD.w - 10; x += 36) for (let y = BOARD.y + 26; y < BOARD.y + BOARD.h - 10; y += 36) g.fillCircle(x, y, 1.6);
  }
  buildNet() {
    const G = this.G, g = this.cables = this.add.graphics().setDepth(2); this.flow = this.add.graphics().setDepth(3); this.nodeV = {}; this.routerNo = {};
    Object.keys(G.edges).forEach(id => this.strokeEdge(g, G.edges[id], 18, CABLE.line, 1)); Object.keys(G.edges).forEach(id => this.strokeEdge(g, G.edges[id], 11, CABLE.base, 1));
    G.routers.forEach((rid, i) => { this.routerNo[rid] = i + 1; });
    Object.keys(G.nodes).forEach(id => this.makeNode(G.nodes[id]));
    this.buildEdgeSyms();
    if (this.L.dns) this.buildDnsBook();
  }
  // แปะสัญลักษณ์ของเซิร์ฟเวอร์ที่ไปถึงได้ไว้บนสายที่ออกจากเราเตอร์ทุกเส้น ผู้เล่นเทียบกับสัญลักษณ์บนซองแล้วเลือกทางได้ทันที
  edgeSym(g, d, x, y) {
    const S = SYMS[d];
    if (S) { this.symShape(g, S.shape, x, y, 9, 0x1b2a6b); this.symShape(g, S.shape, x, y, 6.5, S.color); }
    else { g.fillStyle(0x2a2f45, 1); g.fillRect(x - 9, y - 8, 18, 16); g.lineStyle(2.5, 0xff4d5e, 1); g.strokeRect(x - 9, y - 8, 18, 16); g.fillStyle(0xffffff, 1); g.fillCircle(x - 3.5, y - 1.5, 2.2); g.fillCircle(x + 3.5, y - 1.5, 2.2); g.fillRect(x - 3, y + 3, 6, 2); }
  }
  buildEdgeSyms() {
    const G = this.G, g = this.add.graphics().setDepth(4);
    G.routers.forEach(rid => G.nodes[rid].outs.forEach(eid => {
      const e = G.edges[eid], list = e.dests, n = list.length, last = e.seg[e.seg.length - 1], end = G.nodes[e.to].t === 'rtr' ? 46 : 64;
      let lo = e.len - last + 26, hi = e.len - end; if (hi - lo < (n - 1) * 24) { lo = 54; hi = e.len - end; }
      const sp = Math.min(26, n > 1 ? (hi - lo) / (n - 1) : 0), mid = (lo + hi) / 2;
      list.forEach((d, k) => { const p = PX.posOn(G, eid, mid - sp * (n - 1) / 2 + sp * k); this.edgeSym(g, d, p.x, p.y); });
    }));
  }
  strokeEdge(g, e, w, col, a) {
    g.lineStyle(w, col, a); g.beginPath(); g.moveTo(e.pts[0][0], e.pts[0][1]); for (let i = 1; i < e.pts.length; i++) g.lineTo(e.pts[i][0], e.pts[i][1]); g.strokePath();
    g.fillStyle(col, a); e.pts.forEach(p => g.fillCircle(p[0], p[1], w / 2));
  }
  symShape(g, shape, x, y, r, color) {
    g.fillStyle(color, 1);
    if (shape === 'circle') g.fillCircle(x, y, r);
    else if (shape === 'tri') g.fillTriangle(x, y - r * 1.1, x + r * 1.05, y + r * 0.8, x - r * 1.05, y + r * 0.8);
    else if (shape === 'square') g.fillRect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8);
    else g.fillPoints([{ x, y: y - r * 1.15 }, { x: x + r * 1.05, y }, { x, y: y + r * 1.15 }, { x: x - r * 1.05, y }], true);
  }
  makeNode(n) {
    const c = this.add.container(n.x, n.y).setDepth(5), g = this.add.graphics(); c.add(g); this.nodeV[n.id] = c; c.g = g;
    if (n.t === 'src') {
      g.fillStyle(0x2b3f9c, 1); g.fillPoints([{ x: -34, y: -26 }, { x: 40, y: -26 }, { x: 34, y: 26 }, { x: -40, y: 26 }], true);
      g.fillStyle(0xa8e4ff, 1); g.fillPoints([{ x: -28, y: -19 }, { x: 33, y: -19 }, { x: 28, y: 19 }, { x: -33, y: 19 }], true);
      g.fillStyle(0x2b3f9c, 1); g.fillRect(-12, 26, 24, 8); g.fillRect(-26, 33, 52, 6);
      c.add(KG.ui.icon(this, 'bolt', 0, 0, 30, 0xff8a2b)); c.add(KG.txt(this, 0, 46, 'เครื่องส่ง', { size: 17, color: '#1b2a6b', center: true, ox: 0.5 }));
    } else if (n.t === 'rtr') {
      g.fillStyle(0x1b2a6b, 0.28); g.fillCircle(3, 6, 36); g.fillStyle(0xffffff, 1); g.fillCircle(0, 0, 34); g.lineStyle(5, 0x2b3f9c, 1); g.strokeCircle(0, 0, 34);
      c.arrow = this.add.graphics(); c.add(c.arrow); c.sym = this.add.graphics(); c.add(c.sym);
      const bg = this.add.circle(-30, -30, 14, 0x2b3f9c).setStrokeStyle(2, 0xffffff); c.add(bg); c.add(KG.txt(this, -30, -30, String(this.routerNo[n.id]), { size: 17, color: '#ffffff', center: true, middle: true }));
      c.zone = this.add.zone(0, 0, 92, 92).setInteractive({ useHandCursor: true }); c.add(c.zone); c.zone.on('pointerdown', () => this.tapRouter(n.id));
      this.drawRouter(n.id);
    } else if (n.t === 'relay') { g.fillStyle(0x2b3f9c, 1); g.fillCircle(0, 0, 13); g.fillStyle(0xffffff, 1); g.fillCircle(0, 0, 6); }
    else if (n.t === 'srv') {
      const S = SYMS[n.sym];
      g.fillStyle(0x1b2a6b, 0.25); g.fillPoints([{ x: -46, y: -34 }, { x: 54, y: -34 }, { x: 50, y: 44 }, { x: -50, y: 44 }], true);
      g.fillStyle(0xffffff, 1); g.fillPoints([{ x: -50, y: -40 }, { x: 50, y: -40 }, { x: 46, y: 38 }, { x: -46, y: 38 }], true);
      g.fillStyle(S.color, 1); g.fillPoints([{ x: -50, y: -40 }, { x: 50, y: -40 }, { x: 49, y: -24 }, { x: -49, y: -24 }], true);
      g.lineStyle(4, 0x2b3f9c, 1); g.strokePoints([{ x: -50, y: -40 }, { x: 50, y: -40 }, { x: 46, y: 38 }, { x: -46, y: 38 }], true);
      this.symShape(g, S.shape, 0, -32, 6, 0xffffff);
      const sg = this.add.graphics(); this.symShape(sg, S.shape, 0, 0, 13, S.color); c.add(sg); sg.setPosition(0, -8);
      c.add(KG.txt(this, 0, 9, 'เซิร์ฟเวอร์ ' + n.sym, { size: 15, color: '#1b2a6b', center: true, ox: 0.5 }));
    } else if (n.t === 'fw') {
      g.fillStyle(0x1b2a6b, 0.25); g.fillRect(-48, -30, 100, 80);
      g.fillStyle(0xff6a1a, 1); g.fillRect(-50, -36, 100, 76); g.fillStyle(0xffb347, 1); for (let i = 0; i < 4; i++) g.fillRect(-50, -36 + i * 20, 100, 8);
      g.lineStyle(4, 0x7a2b00, 1); g.strokeRect(-50, -36, 100, 76);
      c.add(KG.ui.icon(this, 'shield', 0, -10, 40, 0xffffff)); c.add(KG.txt(this, 0, 54, 'ไฟร์วอลล์', { size: 17, color: '#7a2b00', center: true, ox: 0.5 }));
    }
  }
  // สวิตช์: ลูกศรสีส้มนอกวงกลมชี้ตามสายที่เลือก (ทางออกแต่ละทางออกคนละทิศ) จุดเทาคือทางที่ปิดอยู่ ตรงกลางวงกลมโชว์เซิร์ฟเวอร์ที่ทางนั้นไปถึงตอนนี้
  drawRouter(rid) {
    const G = this.G, n = G.nodes[rid], c = this.nodeV[rid], a = c.arrow, sg = c.sym; a.clear(); sg.clear();
    n.outs.forEach((eid, i) => {
      const e = G.edges[eid], p0 = e.pts[0], p1 = e.pts[1], ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), on = this.S.outs[rid] === i;
      const cx = Math.cos(ang), cy = Math.sin(ang), px = -cy, py = cx;
      if (on) {
        a.fillStyle(0xff7a1a, 1); a.fillTriangle(cx * 54, cy * 54, cx * 36 + px * 14, cy * 36 + py * 14, cx * 36 - px * 14, cy * 36 - py * 14);
        a.lineStyle(2.5, 0x9c3a08, 1); a.strokeTriangle(cx * 54, cy * 54, cx * 36 + px * 14, cy * 36 + py * 14, cx * 36 - px * 14, cy * 36 - py * 14);
      } else { a.fillStyle(0x8da2d6, 1); a.fillCircle(cx * 46, cy * 46, 5); a.lineStyle(2, 0x1b2a6b, 1); a.strokeCircle(cx * 46, cy * 46, 5); }
    });
    const d = PX.finalDest(this.S, rid);
    if (SYMS[d]) { this.symShape(sg, SYMS[d].shape, 0, 1, 15, 0x1b2a6b); this.symShape(sg, SYMS[d].shape, 0, 1, 11.5, SYMS[d].color); }
    else if (d === 'virus') { sg.fillStyle(0x2a2f45, 1); sg.fillRect(-13, -11, 26, 24); sg.lineStyle(3, 0xff4d5e, 1); sg.strokeRect(-13, -11, 26, 24); sg.fillStyle(0xffffff, 1); sg.fillCircle(-4.5, 0, 2.6); sg.fillCircle(4.5, 0, 2.6); sg.fillRect(-3.5, 6, 7, 2.5); }
  }
  buildDnsBook() {
    const book = PX.dnsBook(this.L), rowH = this.L.boss ? 60 : 46, w = 176, h = 52 + book.length * rowH, x = BOARD.x + BOARD.w - w - 8, y = BOARD.y + 24;
    KG.ui.panel(this, x, y, w, h, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [14, 0, 14, 0] }).setDepth(4);
    this.txt(x + w / 2, y + 12, 'สมุด DNS', { size: 20, color: '#d9560a', center: true, ox: 0.5 }).setDepth(5);
    book.forEach((b, i) => {
      const yy = y + 52 + i * rowH, sg = this.add.graphics().setDepth(5); sg.lineStyle(2, 0x1b2a6b, 1); this.symShape(sg, SYMS[b.sym].shape, x + 28, yy + rowH / 2 - 6, 11, SYMS[b.sym].color);
      b.names.forEach((nm, k) => this.txt(x + 54, yy + 4 + k * 24, nm, { size: 19, color: '#1b2a6b' }).setDepth(5));
    });
  }

  /* ---------- HUD แผงสถานะ แถบล่าง ---------- */
  buildHud() {
    const L = this.L;
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52, depth: 30 });
    this.txt(100, 6, (this.tutorial ? 'บทสอน' : 'ด่าน ' + L.id) + ' · ' + (this.mode === 'time' ? 'ท้าทาย' : 'ฝึก'), { size: 18, color: KG.SKIN.hi }).setDepth(30);
    this.txt(100, 26, L.title, { size: 30, stroke: true }).setDepth(30);
    this.txt(1032, 4, 'คะแนน', { size: 15, color: '#ffffff', stroke: true, ox: 1 }).setDepth(30);
    this.scoreTxt = this.txt(1032, 18, '0', { size: 36, stroke: true, ox: 1 }).setDepth(30);
    addSystemButtons(this, 1084, 40, 0, ['sfx']).forEach(b => b.setDepth(30));
    iconButton(this, 1148, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 30 });
    iconButton(this, 1218, 40, 'pause', () => this.pause(), { w: 60, h: 52, depth: 30 });
    this.progBar = KG.ui.bar(this, 470, 76, 340, 16, { value: 0, color: 0x22b45a }); this.progBar.setDepth(30);
    this.progTxt = this.txt(640, 52, '', { size: 20, stroke: true, center: true, ox: 0.5 }).setDepth(30);
  }
  buildSide() {
    const D = 25;
    KG.ui.panel(this, 12, 108, 132, 296, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [14, 0, 14, 0] }).setDepth(D - 1);
    this.heartLab = this.txt(78, 118, this.mode === 'time' ? 'หัวใจ' : 'โหมดฝึก', { size: 16, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D);
    this.hearts = [0, 1, 2].map(i => KG.ui.icon(this, 'heart', 38 + i * 40, 156, 34, 0xff4d6a).setDepth(D));
    this.txt(78, 192, 'คอมโบ', { size: 16, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D);
    this.comboTxt = this.txt(78, 208, '0', { size: 52, center: true, ox: 0.5 }).setDepth(D);
    this.formBar = KG.ui.bar(this, 24, 286, 108, 12, { value: 0, color: 0xff8a2b }).setDepth(D);
    this.formTxt = this.txt(78, 306, '', { size: 15, center: true, ox: 0.5 }).setDepth(D);
    this.multTxt = this.txt(78, 340, '', { size: 18, color: '#d9560a', center: true, ox: 0.5 }).setDepth(D);
    this.txt(78, 366, 'ผิด ' + 0, { size: 14, color: KG.SKIN.mute, center: true, ox: 0.5 }).setDepth(D).setVisible(false);
  }
  buildBar() {
    const cy = 646;
    this.ffBtn = new KG.ui.Button(this, 1086, cy, 250, 64, { label: 'เร่ง x2', icon: 'chevR', style: 'cyan', size: 26, onClick: () => this.toggleFf() }); this.ffBtn.setDepth(30);
    this.txt(640, cy - 44, KG.isTouch ? 'แตะวงกลมสวิตช์เพื่อเปลี่ยนทางของแพ็กเก็ต' : 'แตะวงกลมสวิตช์ หรือกดเลข 1-9 ที่ป้ายมุมวงกลม เพื่อเปลี่ยนทาง', { size: 21, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(30);
    this.txt(640, cy - 17, 'สัญลักษณ์กลางวงกลม = เซิร์ฟเวอร์ที่ทางนั้นไปถึง ให้ตรงกับซองแพ็กเก็ต', { size: 20, color: '#ffe38a', stroke: true, center: true, ox: 0.5 }).setDepth(30);
    this.txt(640, cy + 12, this.hints ? 'ไฟสีเขียวบอกทางที่ควรเลือก' : 'ไม่มีคำใบ้ ดูสีและสัญลักษณ์ให้แม่น', { size: 18, weight: 400, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(30);
    this.txt(250, cy - 6, 'ส่งแล้วถูก', { size: 15, color: '#ffffff', stroke: true, center: true, ox: 0.5 }).setDepth(30).setVisible(false);
  }
  refreshStatus() {
    const S = this.S, tot = this.run.schedule.length;
    this.scoreTxt.setText(String(S.score)); this.comboTxt.setText(String(S.streak));
    this.hearts.forEach((h, i) => { h.setTint(i < this.lives ? 0xff4d6a : 0xc9d3ec); h.setVisible(this.mode === 'time'); });
    const t = PX.formTier(S.streak); this.formBar.setValue(t >= 3 ? 1 : (S.streak % 4) / 4, 150); this.formTxt.setText(t >= 3 ? 'ร่างสุดยอด!' : 'อีก ' + (4 - (S.streak % 4)) + ' ตัวเปลี่ยนร่าง');
    this.multTxt.setText('คะแนน x' + Math.min(5, 1 + Math.floor(S.streak / 4)));
    this.progTxt.setText('ส่งแล้ว ' + S.delivered + ' / ' + tot); this.progBar.setValue(S.delivered / tot, 150);
  }
  toggleFf() { this.ff = this.ff === 1 ? 2 : 1; KG.audio.play('tap'); this.ffBtn.setLabel(this.ff === 2 ? 'ปกติ x1' : 'เร่ง x2'); }

  /* ---------- ควบคุมสวิตช์ ---------- */
  tapRouter(rid) {
    if (this.state !== 'play' && this.state !== 'tutwait') return;
    PX.toggle(this.S, rid); this.toggles++; this.G.routers.forEach(r => this.drawRouter(r)); KG.audio.play('turn');
    const c = this.nodeV[rid]; KG.fx.ring(this, c.x, c.y, 0xff7a1a, { size: 1.6, w: 0.35, depth: 12 });
    this.tweens.add({ targets: c, scaleX: 1.15, scaleY: 1.15, duration: 90, yoyo: true });
  }
  onKey(e) {
    if (this.state !== 'play' && this.state !== 'tutwait') return;
    const m = /^(Digit|Numpad)([1-9])$/.exec(e.code); if (m) { const rid = this.G.routers[+m[2] - 1]; if (rid) this.tapRouter(rid); }
    else if (e.code === 'Space') { e.preventDefault && e.preventDefault(); if (this.state === 'play') this.pause(); }
  }

  /* ---------- แพ็กเก็ต ---------- */
  makePacket(p) {
    const c = this.add.container(0, 0).setDepth(8), g = this.add.graphics(); c.add(g); c.g = g;
    const S = SYMS[p.dest], col = S ? S.color : 0x2a2f45, W = 46, H = 34;
    g.fillStyle(0x1b2a6b, 0.28); g.fillRect(-W / 2 + 2, -H / 2 + 4, W, H);
    g.fillStyle(col, 1); g.fillRect(-W / 2, -H / 2, W, H); g.lineStyle(3, p.dest === 'virus' ? 0xff4d5e : 0x1b2a6b, 1); g.strokeRect(-W / 2, -H / 2, W, H);
    g.lineStyle(2, 0xffffff, 0.55); g.beginPath(); g.moveTo(-W / 2, -H / 2); g.lineTo(0, 2); g.lineTo(W / 2, -H / 2); g.strokePath();
    if (p.dest === 'virus') c.add(KG.ui.icon(this, 'skull', 0, 5, 22, 0xffffff));
    else if (!p.name) { const sg = this.add.graphics(); this.symShape(sg, S.shape, 0, 5, 7, 0xffffff); c.add(sg); }
    else {
      const t = KG.txt(this, 0, -H / 2 - 13, p.name, { size: 16, color: '#1b2a6b', center: true, middle: true }), bg = this.add.rectangle(0, -H / 2 - 13, t.width + 10, 22, 0xffffff).setStrokeStyle(2, 0x2b3f9c); c.add(bg); c.add(t);
      const q = this.add.circle(0, 5, 6, 0xffffff); c.add(q);
    }
    this.pv[p.id] = c; return c;
  }
  syncPackets() {
    const S = this.S, live = {};
    S.packets.forEach(p => { live[p.id] = true; const c = this.pv[p.id] || this.makePacket(p), pos = PX.posOn(this.G, p.edge, p.d); c.setPosition(pos.x, pos.y - 2); });
    Object.keys(this.pv).forEach(id => { if (!live[id]) { const c = this.pv[id]; delete this.pv[id]; this.tweens.add({ targets: c, scaleX: 0, scaleY: 0, alpha: 0, duration: 160, onComplete: () => c.destroy() }); } });
  }
  handleEvents() {
    const S = this.S; while (this.evIdx < S.events.length) {
      const ev = S.events[this.evIdx++], c = this.nodeV[ev.node], sym = SYMS[ev.dest], col = sym ? sym.color : 0x2a2f45;
      if (ev.ok) {
        KG.audio.play('good'); KG.fx.burst(this, ev.x, ev.y, { colors: [col, 0xffffff, 0xffd34f], n: 22, max: 300, depth: 40, add: false }); KG.fx.ring(this, ev.x, ev.y, 0x22b45a, { size: 2.6, w: 0.45, depth: 41 });
        const gain = PX.points(S.streak - 1); KG.fx.pop(this, ev.x, ev.y - 52, '+' + gain, { color: '#ff7a1a', size: 36, depth: 60 });
        if (c) this.tweens.add({ targets: c, scaleX: 1.12, scaleY: 1.12, duration: 110, yoyo: true });
        const tier = PX.formTier(S.streak);
        if (tier > this.tier) { this.tier = tier; this.rider.setForm(tier, true); KG.banner(this, 'เปลี่ยนร่าง! ' + KG.FORMS[FORMS[tier]].name, '#ffffff', 0.8, 150); } else if (S.streak % 2 === 0) this.rider.cheer();
      } else {
        KG.audio.play('error'); KG.fx.flash(this, 0xff4d5e, 130); KG.fx.shake(this, 200, 0.005); this.rider.hurt();
        KG.fx.burst(this, ev.x, ev.y, { colors: [0xe0243d, 0x1b2a6b, 0xffffff], n: 18, max: 260, depth: 40, add: false });
        const x = KG.ui.icon(this, 'close', ev.x, ev.y - 30, 44, 0xe0243d).setDepth(60); this.tweens.add({ targets: x, y: x.y - 36, alpha: 0, duration: 900, onComplete: () => x.destroy() });
        KG.fx.pop(this, ev.x, ev.y - 70, ev.why === 'cut' ? 'สายขาด!' : (ev.dest === 'virus' ? 'ไวรัสเข้า!' : 'ผิดที่!'), { color: '#e0243d', size: 30, depth: 60 });
        if (this.tier > 0) { this.tier = 0; this.rider.setForm(0, false); }
        if (this.mode === 'time') { this.lives = Math.max(0, this.lives - 1); }
      }
      this.refreshStatus();
    }
  }

  /* ---------- ภาพสายเคเบิลที่เคลื่อนไหว ---------- */
  drawFlow(time) {
    const g = this.flow, S = this.S, G = this.G, run = this.run; g.clear();
    // เส้นทางสดตามสวิตช์ตอนนี้ (จากเครื่องส่งถึงเซิร์ฟเวอร์) สีส้มเข้ม ส่วนทางที่สวิตช์เลือกไว้แต่ยังไม่มีแพ็กเก็ตมาทางนั้นสีส้มจาง
    const live = PX.liveEdges(S);
    Object.keys(live).forEach(id => { if (!S.cutNow[id]) this.strokeEdge(g, G.edges[id], 11, CABLE.hot, 0.95); });
    G.routers.forEach(rid => { const e = G.edges[G.nodes[rid].outs[S.outs[rid]]]; if (!live[e.id] && !S.cutNow[e.id]) this.strokeEdge(g, e, 11, CABLE.hot, 0.3); });
    // คำใบ้โหมดฝึก: สายที่ควรเลือกสีเขียว + วงแหวนที่เราเตอร์ที่ต้องหมุน
    this.hintMap = {};
    if (this.hints && (this.state === 'play' || this.state === 'tutwait')) PX.advise(S).forEach(a => {
      if (a.need !== a.cur) { const e = G.edges[G.nodes[a.id].outs[a.need]]; this.strokeEdge(g, e, 8, CABLE.good, 0.9); const n = G.nodes[a.id]; const r = 40 + 4 * Math.sin(time / 120); g.lineStyle(4, CABLE.good, 1); g.strokeCircle(n.x, n.y, r); this.hintMap[a.id] = true; }
    });
    // สายขาด / ใกล้ขาด
    run.cuts.forEach(c => {
      const e = G.edges[c.edge], cutting = S.cutNow[c.edge], warn = !cutting && S.t < c.t0 && c.t0 - S.t < 2.2;
      if (cutting || warn) {
        const blink = warn ? (Math.floor(time / 180) % 2 ? 1 : 0.3) : 1;
        g.lineStyle(10, CABLE.cut, 0.9 * blink); g.beginPath(); for (let d = 0; d < e.len; d += 26) { const a = PX.posOn(G, e.id, d), b = PX.posOn(G, e.id, Math.min(e.len, d + 13)); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); } g.strokePath();
        const m = PX.posOn(G, e.id, e.len * 0.55); g.fillStyle(0xffd34f, blink); g.fillCircle(m.x, m.y, 11); g.lineStyle(3, 0x1b2a6b, 1); g.strokeCircle(m.x, m.y, 11);
        if (cutting && Math.random() < 0.18) KG.fx.burst(this, m.x, m.y, { colors: [0xffd34f, 0xff7a1a], n: 3, max: 140, depth: 12, life: 300, add: false });
      }
      if (warn && !this.warned[c.edge + 'w']) { this.warned[c.edge + 'w'] = true; KG.ui.toast(this, 'สายเคเบิลกำลังจะขาด! เตรียมเลี่ยงเส้นทางนี้', { accent: '#ff7a1a', sfx: 'alarm' }); }
      if (cutting && !this.warned[c.edge + 'c']) { this.warned[c.edge + 'c'] = true; KG.fx.shake(this, 200, 0.004); KG.audio.play('zap'); }
      if (!cutting && S.t >= c.t1 && this.warned[c.edge + 'c'] && !this.warned[c.edge + 'r']) { this.warned[c.edge + 'r'] = true; KG.ui.toast(this, 'ซ่อมสายเสร็จแล้ว', { accent: '#22b45a', sfx: 'unlock' }); }
    });
    // ลูกศรไหลตามสาย
    g.fillStyle(0x2b8cff, 0.55); const off = (time * 0.05) % 38;
    Object.keys(G.edges).forEach(id => { const e = G.edges[id]; if (S.cutNow[id]) return; for (let d = off; d < e.len - 14; d += 38) { const p = PX.posOn(G, id, d), cx = Math.cos(p.a), cy = Math.sin(p.a); g.fillTriangle(p.x + cx * 6, p.y + cy * 6, p.x - cx * 4 - cy * 5, p.y - cy * 4 + cx * 5, p.x - cx * 4 + cy * 5, p.y - cy * 4 - cx * 5); } });
  }

  /* ---------- เริ่ม พัก จบ ---------- */
  showIntro() {
    const L = this.L;
    KG.ui.modal(this, { title: 'ด่าน ' + L.id + ' · ' + L.title, w: 820, accent: KG.C.sun, extraH: 190, body: L.desc,
      buttons: [{ label: 'กลับ', style: 'ghost', icon: 'chevL', onClick: () => this.leave() }, { label: 'เริ่มเลย!', style: 'primary', icon: 'play', pulse: true, onClick: () => this.start() }],
      build: (box, g) => {
        const y = g.top + 6;
        box.add(KG.txt(this, 0, y, L.count + ' แพ็กเก็ต  ·  ' + (this.mode === 'time' ? 'ความเร็วปกติ  ·  หัวใจ 3 ดวง' : 'โหมดฝึก ช้าลง มีคำใบ้'), { size: 24, color: KG.SKIN.hi, center: true, ox: 0.5 }));
        box.add(KG.txt(this, 0, y + 44, 'ความรู้: ' + L.concept, { size: 21, weight: 400, color: KG.SKIN.body, center: true, ox: 0.5, width: 740 }));
        box.add(KG.txt(this, 0, y + 124, 'คำศัพท์: ' + L.vocab.join(' · '), { size: 20, color: '#0a74c8', center: true, ox: 0.5 }));
      } });
  }
  start() { this.state = 'count'; KG.countdown(this, 'ส่ง!', () => { this.state = 'play'; }); }
  pause() {
    if (this.state !== 'play') return; this.state = 'pause';
    KG.pauseMenu(this, { onExit: () => this.leave(), onRestart: () => this.go('Play', this._restartData), onResume: () => { this.state = 'play'; } });
  }
  update(time, delta) {
    this.drawFlow(time);
    if (this.state !== 'play') return;
    this.acc += Math.min(0.05, delta / 1000) * this.speedMul * this.ff; const H = 1 / 60; let n = 0;
    while (this.acc >= H && n++ < 8) { PX.step(this.S, H); this.acc -= H; }
    this.syncPackets(); this.handleEvents();
    if (this.mode === 'time' && this.lives <= 0) this.finish(false);
    else if (PX.isDone(this.S)) this.finish(true);
  }
  finish(win) {
    if (this.state === 'done') return; this.state = 'done'; if (this.tutor) { this.tutor.destroy(); this.tutor = null; }
    const S = this.S, total = this.run.schedule.length, acc = PX.accuracy(S.correct, total), stars = PX.stars(win, acc);
    const best = SAVE.data.best[this.lv] || { score: 0 }, newBest = win && S.score > best.score;
    if (win) { if (stars > levelStars(this.lv)) SAVE.data.stars[this.lv] = stars; if (newBest) SAVE.data.best[this.lv] = { score: S.score, acc, combo: S.bestStreak }; if (this.tutorial) SAVE.data.tutorDone = true; SAVE.save(); }
    KG.audio.play(win ? 'fanfare' : 'lose'); if (win) { KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 200); this.rider.cheer(); }
    const cuts = S.events.filter(e => e.why === 'cut').length, virus = S.events.filter(e => e.dest === 'virus' && !e.ok).length, nextOk = win && this.lv < LEVELS.length;
    this.time.delayedCall(win ? 800 : 300, () => KG.results(this, { stat: { lvl: String(this.lv), stars: win ? stars : 0, score: S.score, m: Math.max(0, total - S.correct), secs: Math.round((Date.now() - this._t0) / 1000) },
      win, stars, title: win ? (this.tutorial ? 'จบบทสอน!' : 'ผ่านด่าน ' + this.lv + '!') : 'หัวใจหมด', body: 'คะแนน ' + S.score + (newBest ? '  (สถิติใหม่!)' : ''),
      rows: [['ส่งถึงถูกที่', S.correct + ' / ' + total + ' แพ็กเก็ต (' + acc + '%)'], ['คอมโบสูงสุด', 'x' + S.bestStreak], ['ส่งผิดที่', String(S.wrong - cuts - virus)], ['สายขาดและไวรัสหลุด', cuts + ' / ' + virus]],
      tip: win ? 'ความรู้: ' + this.L.concept : 'ไม่เป็นไร ลองโหมดฝึกที่ช้ากว่าและมีคำใบ้ แล้วค่อยกลับมาท้าทายใหม่',
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { level: this.lv }) }, { label: win ? 'เล่นอีกครั้ง' : 'ลองใหม่', style: 'cyan', icon: 'reset', onClick: () => this.go('Play', this._restartData) }]
        .concat(nextOk ? [{ label: 'ด่านถัดไป', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Play', { level: this.lv + 1, mode: SAVE.data.mode }) }] : [])
    }));
  }

  /* ---------- บทสอนเล่น (ด่าน 1) ---------- */
  nodeRect(id, w, h) { const n = this.G.nodes[id]; return { x: n.x - w / 2, y: n.y - h / 2, w, h }; }
  startTutor() {
    if (this.tutor) return; this.state = 'tutwait'; const G = this.G;
    const srv = { x: G.nodes.A.x - 62, y: G.nodes.A.y - 56, w: 124, h: G.nodes.B.y - G.nodes.A.y + 130 };
    this.tutor = new KG.Tutor(this, [
      { text: 'ยินดีต้อนรับสู่ Packet Express! เกมนี้จำลองการส่งข้อมูลผ่านอินเทอร์เน็ต หน้าที่ของคุณคือสลับสวิตช์ให้แพ็กเก็ตไปถึงปลายทางที่ถูกต้อง' },
      { text: 'นี่คือเครื่องส่ง จะปล่อยแพ็กเก็ตออกไปตามสายเคเบิล แพ็กเก็ตคือซองข้อมูลที่ติดที่อยู่ปลายทางไว้ ดูสีและสัญลักษณ์บนซองให้ดี', target: this.nodeRect('S1', 100, 110), pad: 6, pos: 'bottom' },
      { text: 'ปลายทางคือเซิร์ฟเวอร์ แต่ละเครื่องมีสีและสัญลักษณ์ของตัวเอง แพ็กเก็ตต้องไปถึงเครื่องที่สีและสัญลักษณ์ตรงกัน', target: srv, pad: 4, pos: 'top' },
      { text: 'วงกลมนี้คือสวิตช์ของเราเตอร์ ลูกศรสีส้มชี้ว่าแพ็กเก็ตจะไปทางไหน เส้นสีส้มคือเส้นทางที่เปิดอยู่ และสัญลักษณ์กลางวงกลมบอกว่าทางนั้นไปถึงเซิร์ฟเวอร์ไหน แตะที่วงกลมเพื่อเปลี่ยนทาง ลองแตะดูสักครั้ง', target: this.nodeRect('R1', 100, 100), pad: 6, mode: 'wait', block: false, pos: 'bottom', until: () => this.toggles >= 1 },
      { text: 'ดีมาก! แพ็กเก็ตแรกกำลังมา ซองสีแดงรูปวงกลมต้องไปเซิร์ฟเวอร์ A ปรับสวิตช์จนสัญลักษณ์กลางวงกลมเป็นวงกลมสีแดงเหมือนบนซอง ก่อนที่มันจะถึงสวิตช์ (เส้นสีเขียวช่วยบอกทาง)', target: this.nodeRect('R1', 100, 100), pad: 6, mode: 'wait', block: false, pos: 'bottom', before: () => { this.state = 'play'; }, until: () => this.S.delivered >= 1 },
      { text: 'ส่งถึงแล้ว! ได้คะแนนและคอมโบ ต่อไปแพ็กเก็ตจะสลับสีไปมา ดูสีก่อนแล้วปรับสวิตช์ให้ทัน ส่งถูกติดกัน 4 ตัวไรเดอร์จะเปลี่ยนร่าง!', pos: 'bottom', at: { y: 470 }, dim: false, target: { x: 12, y: 108, w: 132, h: 296 }, pad: 2 },
      { text: 'ส่งให้ครบทุกแพ็กเก็ตเพื่อผ่านบทสอน โหมดฝึกไม่เสียหัวใจ และมีเส้นสีเขียวคอยช่วย ลุยเลย!', pos: 'bottom', at: { y: 470 }, dim: false }
    ], { hero: 'h1', onDone: () => { this.tutor = null; if (this.state === 'tutwait') this.state = 'play'; } });
  }
}
