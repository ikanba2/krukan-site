/* ===== ฉากเล่น Techno Slice: โต๊ะร้านพิซซ่า (ซ้ายบน) + แถบข้อความ + ถาดชิ้นส่วน (ซ้ายล่าง) · ใบสั่งงานทรงตั๋ว สนามเทคโน และแผงดาว (คอลัมน์ขวา) =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y0-76 · โต๊ะ x24-904 y84-436 · แถบข้อความ y444-500 · ถาด y508-710 · คอลัมน์ขวา x920-1256
   (สลับด้านกับ Techno Parts ที่คอลัมน์อยู่ซ้าย) ไฟล์นี้เป็นแกนของฉาก (สร้างหน้าจอและวาดใหม่) ส่วนการแตะ/ลากวางอยู่ที่ play-input.js และการวาง/คำใบ้/ชนะ/บทสอนอยู่ที่ play-ops.js */
const AREA = {
  stage: { x: 24, y: 84, w: 880, h: 352 }, msg: { x: 24, y: 444, w: 880, h: 56 }, tray: { x: 24, y: 508, w: 880, h: 202 },
  ticket: { x: 920, y: 84, w: 336, h: 264 }, arena: { x: 920, y: 356, w: 336, h: 150 }, ctrl: { x: 920, y: 514, w: 336, h: 196 }
};
const inRect = (x, y, r) => (r.circle ? Math.hypot(x - (r.x + r.w / 2), y - (r.y + r.h / 2)) <= r.w / 2 : x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
function gwrap(str, w, font) {
  const NL = String.fromCharCode(10), L = KG.wrap(str, w, font).split(NL);
  for (let i = 0; i < L.length - 1; i++) if (/“$/.test(L[i])) { L[i] = L[i].slice(0, -1).trimEnd(); L[i + 1] = '“' + L[i + 1]; }
  return L.join(NL);
}
const fitW = (t, maxW) => { t.setScale(1); if (t.width > maxW) t.setScale(maxW / t.width); return t; };
// อ่านเศษส่วนออกเสียงเป็นภาษาไทย: 3/8 = สามส่วนแปด · 2 3/4 = สองกับสามส่วนสี่
const spokenFrac = s => String(s).replace(/(\d+)\s+(\d+)\/(\d+)/g, '$1 กับ $2 ส่วน $3').replace(/(\d+)\/(\d+)/g, '$1 ส่วน $2');
const toneOf = den => den % 4;

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.W = data.world || SAVE.data.world || 1; this.N = data.level || 1; this.seed = data.seed || null; this.wantTutor = !!data.tutor;
    this._restartData = { world: this.W, level: this.N, seed: this.seed };
    this.tutor = null; this._modal = null; this.press = null; this.drag = null; this.hl = null; this.bubble = null; this.hero = null; this.mon = null;
    this.leftTxt = null; this.views = {}; this.zr = {}; this.zoneObjs = []; this.zoneGfx = {}; this.plates = {}; this.pips = []; this.checkDone = []; this.selItem = null; this.hlG = null; this.hlTw = null;
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music(['sunny', 'breeze', 'bounce'][(this.W - 1) % 3]);
    this.lv = this.seed ? makeLevel(this.W, this.N, this.seed) : getLevel(this.W, this.N); this.st = SL.init(this.lv);
    this.mistakes = 0; this.hints = 0; this.ops = 0; this.done = false; this.paused = false; this.state = 'play';
    this.buildBackground(); this.buildStage(); this.buildTicket(); this.buildHud(); this.buildControls(); this.buildArena(); this.buildMsg();
    this.dropHL = this.add.graphics().setDepth(300);
    this.input.on('pointermove', p => this.onMove(p)); this.input.on('pointerup', p => this.onUp(p));
    this.renderItems(); this.refreshMission(true); this.refreshStats();
    this.setMessage(this.lv.desc, 'info');
    if (this.wantTutor && this.W === 1 && this.N === 1) this.time.delayedCall(500, () => this.startTutor());
    else if (this.N === 1 && !this.seed && !SAVE.data.tutorDone[this.W]) this.time.delayedCall(700, () => this.showIntro());
  }
  onEscape() { if (this.selItem) { this.selItem = null; this.renderItems(); } else this.pause(); }
  leave() { this.go('Select', { level: this.N }); }
  itemOf(id) { return SL.itemOf(this.lv, id); }
  zoneOf(id) { return SL.zoneOf(this.lv, id); }

  /* ---------- ฉากหลัง ---------- */
  buildBackground() {
    const WD = WORLDS[this.W - 1], A = AREA; this.add.image(GW / 2, GH / 2, 'arena_' + WD.bg).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xfff3df, 0.28);
    KG.fx.ambient(this, { freq: 360, colors: [0xffffff, 0xffd34f, 0xffb15a], s: 0.3, alpha: 0.6 });
    KG.ui.panel(this, A.stage.x, A.stage.y, A.stage.w, A.stage.h, { accent: WD.color, accent2: '#ffb347', cuts: [20, 0, 20, 0], fill: ['#fffaf0', '#ffeccf'], alpha: 0.97 }).setDepth(1);
    KG.ui.panel(this, A.msg.x, A.msg.y, A.msg.w, A.msg.h, { accent: '#ffb347', cuts: [16, 0, 16, 0], fill: ['#ffffff', '#fff0da'], alpha: 0.97, shadow: 5 }).setDepth(1);
    KG.ui.panel(this, A.tray.x, A.tray.y, A.tray.w, A.tray.h, { accent: '#22a04a', accent2: '#8ae08a', cuts: [18, 0, 18, 0], fill: ['#f6fff0', '#dff3d2'], alpha: 0.97 }).setDepth(1);
    KG.ui.panel(this, A.arena.x, A.arena.y, A.arena.w, A.arena.h, { accent: '#ffcf33', accent2: '#ff8a2b', cuts: [18, 0, 18, 0], fill: ['#fffaf0', '#fff0d2'], alpha: 0.97 }).setDepth(1);
    KG.ui.panel(this, A.ctrl.x, A.ctrl.y, A.ctrl.w, A.ctrl.h, { accent: '#e8452c', accent2: '#ffb347', cuts: [18, 0, 18, 0], fill: ['#ffffff', '#ffeed8'], alpha: 0.97 }).setDepth(1);
  }

  /* ---------- โต๊ะร้านพิซซ่า: สร้างที่วางตามชนิดด่าน ---------- */
  addZone(zoneId, rect) { this.zr[zoneId] = rect; const z = this.add.zone(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h).setDepth(3).setInteractive({ useHandCursor: true }); z.on('pointerup', () => this.tapZone(zoneId)); this.zoneObjs.push(z); }
  buildStage() {
    const S = AREA.stage, k = this.lv.kind;
    if (k === 'cut') this.stageCut(S); else if (k === 'match' || k === 'eq') this.stageMatch(S); else if (k === 'line') this.stageLine(S);
    else if (k === 'order') this.stageOrder(S); else if (k === 'pack') this.stagePack(S); else if (k === 'conv') this.stageConv(S); else if (k === 'calc') this.stageCalc(S);
    this.addZone('tray', { x: AREA.tray.x, y: AREA.tray.y, w: AREA.tray.w, h: AREA.tray.h });
  }
  // จานหรือกล่องกลม: วงรัศมี R แบ่ง den ส่วนด้วยเส้นประ ชิ้นที่ใส่แล้วจะเติมทีละช่องตามลำดับ
  makePlate(zid, cx, cy, R, den, box) {
    const g = this.add.graphics().setDepth(2);
    if (box) { const s = R + 22; g.fillStyle(0x4a2412, 0.25); g.fillRoundedRect(cx - s + 4, cy - s + 9, 2 * s, 2 * s, 22); g.fillStyle(0xe6b676, 1); g.fillRoundedRect(cx - s, cy - s, 2 * s, 2 * s, 22); g.lineStyle(4, 0x7a3b1f, 1); g.strokeRoundedRect(cx - s, cy - s, 2 * s, 2 * s, 22); g.fillStyle(0xd4a05c, 1); g.fillRect(cx - s + 8, cy - s + 8, 2 * s - 16, 10); }
    else { g.fillStyle(0x4a2412, 0.25); g.fillCircle(cx + 3, cy + 9, R + 16); g.fillStyle(0xffffff, 1); g.fillCircle(cx, cy, R + 16); g.lineStyle(4, 0x7a3b1f, 1); g.strokeCircle(cx, cy, R + 16); g.lineStyle(2, 0xe0c9a8, 1); g.strokeCircle(cx, cy, R + 7); }
    g.fillStyle(0xfff0d2, 1); g.fillCircle(cx, cy, R); g.lineStyle(3, 0xc98a54, 1); g.strokeCircle(cx, cy, R);
    const a0 = -Math.PI / 2, step = Math.PI * 2 / den; g.lineStyle(2.4, 0xc98a54, 0.9);
    for (let i = 0; i < den; i++) { const a = a0 + i * step, dash = 10, gap = 7; for (let t = 0; t < R; t += dash + gap) { g.beginPath(); g.moveTo(cx + Math.cos(a) * t, cy + Math.sin(a) * t); const e = Math.min(t + dash, R); g.lineTo(cx + Math.cos(a) * e, cy + Math.sin(a) * e); g.strokePath(); } }
    const ring = this.add.graphics().setDepth(2).setVisible(false); ring.lineStyle(7, 0x22a04a, 1); ring.strokeCircle(cx, cy, R + 12); ring.fillStyle(0x22a04a, 0.12); ring.fillCircle(cx, cy, R + 12);
    this.plates[zid] = { cx, cy, R, den }; this.zoneGfx[zid] = { ring, plate: true };
    const sq = R + (box ? 22 : 16); this.addZone(zid, { x: cx - sq, y: cy - sq, w: 2 * sq, h: 2 * sq, circle: !box });
  }
  // ป้ายลูกค้าสั่ง (หน้า + กล่องข้อความ + เศษส่วนใหญ่)
  orderSlip(x, y, w, h, o, face, small) {
    KG.ui.panel(this, x, y, w, h, { accent: '#e8452c', accent2: '#ffb347', cuts: [20, 0, 20, 0], fill: ['#ffffff', '#fff4e0'], alpha: 0.98, shadow: 5 }).setDepth(2);
    this.add.image(x + (small ? 44 : 62), y + (small ? 44 : 62), faceTex(this, face, 128)).setDisplaySize(small ? 70 : 96, small ? 70 : 96).setDepth(4);
    this.txt(x + (small ? 92 : 126), y + 12, 'ลูกค้าสั่งพิซซ่า', { size: small ? 16 : 20, color: '#c9301a' }).setDepth(4);
    const f = fracObj(this, x + (small ? 150 : 192), y + (small ? 62 : 92), o.a, o.b, small ? 34 : 54, INK); f.setDepth(4);
    this.txt(x + (small ? 188 : 244), y + (small ? 50 : 76), 'ถาด', { size: small ? 22 : 30, color: INK }).setDepth(4);
    if (!small) { this.txt(x + 18, y + 142, 'ใช้ชิ้นที่ตัดจากพิซซ่าแบ่ง ' + o.b + ' ส่วน (ชิ้นละ 1/' + o.b + ') ใส่จานให้ได้ ' + o.a + ' ชิ้น', { size: 18, weight: 400, color: '#6b3b25', width: w - 36 }).setDepth(4).setLineSpacing(3); }
  }
  stageCut(S) {
    const n = this.lv.orders.length;
    this.lv.orders.forEach((o, i) => {
      const zid = n === 1 ? 'plate' : 'plate' + (i + 1), R = n === 1 ? 126 : 100, cx = n === 1 ? S.x + 230 : S.x + 230 + i * 420, cy = S.y + (n === 1 ? 176 : 138);
      this.makePlate(zid, cx, cy, R, o.b, false);
      if (n === 1) this.orderSlip(S.x + 500, S.y + 32, 360, 270, o, (this.N + this.W) % 6, false);
      else this.orderSlip(cx - 175, S.y + 258, 350, 84, o, (this.N + i * 2) % 6, true);
    });
  }
  stageMatch(S) {
    const pics = this.lv.zones.filter(z => z.kind === 'pic'), N = pics.length, sw = Math.min(158, Math.floor((S.w - 24) / N)), x0 = S.x + (S.w - N * sw) / 2, size = N <= 3 ? 130 : N === 4 ? 118 : N === 5 ? 100 : 88;
    pics.forEach((z, i) => {
      const cx = x0 + i * sw + sw / 2, p = z.pic;
      if (p.shape === 'bar') this.add.image(cx, S.y + 90, barTex(this, p.d, p.n, Math.min(sw - 16, 150), 46)).setDisplaySize(Math.min(sw - 16, 150) + 12, 60).setDepth(3);
      else this.add.image(cx, S.y + 90, pieTex(this, p.d, p.n, size, toneOf(p.d))).setDisplaySize(size + 10, size + 10).setDepth(3);
      const rect = { x: cx - 52, y: S.y + 188, w: 104, h: 92 }; this.addZone(z.id, rect); const gr = this.add.graphics().setDepth(3); this.zoneGfx[z.id] = { gr, rect }; slotFrame(gr, rect, 'normal');
      this.txt(cx, S.y + 292, 'ภาพที่ ' + (i + 1), { size: 16, color: '#8a6a58', center: true, ox: 0.5 }).setDepth(3);
    });
  }
  stageLine(S) {
    const { d, R } = this.lv.line, x0 = S.x + 70, x1 = S.x + S.w - 70, y0 = S.y + 240, len = x1 - x0, g = this.add.graphics().setDepth(2);
    g.fillStyle(0x4a2412, 0.2); g.fillRoundedRect(x0 - 24, y0 - 3, len + 48, 14, 7); g.fillStyle(0xffffff, 1); g.fillRoundedRect(x0 - 28, y0 - 8, len + 56, 12, 6); g.lineStyle(3, 0x7a3b1f, 1); g.strokeRoundedRect(x0 - 28, y0 - 8, len + 56, 12, 6);
    for (let i = 0; i <= R * d; i++) { const x = x0 + i / (R * d) * len, whole = i % d === 0; g.lineStyle(whole ? 5 : 3, 0x7a3b1f, 1); g.beginPath(); g.moveTo(x, y0 - 8); g.lineTo(x, y0 - 8 + (whole ? 40 : 24)); g.strokePath(); }
    for (let w = 0; w <= R; w++) this.txt(x0 + w / R * len, y0 + 34, String(w), { size: 26, color: INK, center: true, ox: 0.5 }).setDepth(3);
    this.lv.zones.filter(z => z.kind === 'tick').forEach(z => {
      const x = x0 + z.tick.i / (R * d) * len, rect = { x: x - 36, y: y0 - 150, w: 72, h: 110 }; this.addZone(z.id, rect); const gr = this.add.graphics().setDepth(3); this.zoneGfx[z.id] = { gr, rect }; slotFrame(gr, rect, 'normal');
      g.lineStyle(3, 0xc9301a, 1); g.beginPath(); g.moveTo(x, y0 - 40); g.lineTo(x, y0 - 8); g.strokePath(); g.fillStyle(0xc9301a, 1); g.fillCircle(x, y0 - 8, 6);
    });
    this.txt(S.x + S.w / 2, S.y + 18, 'ช่องเล็กบนเส้นเท่ากันทุกช่อง ช่องละ 1/' + d, { size: 18, weight: 400, color: '#8a6a58', center: true, ox: 0.5 }).setDepth(3);
  }
  stageOrder(S) {
    const rks = this.lv.zones.filter(z => z.kind === 'rank'), K = rks.length, sw = Math.min(150, Math.floor((S.w - 60) / K)), x0 = S.x + (S.w - K * sw) / 2, g = this.add.graphics().setDepth(2);
    rks.forEach((z, i) => {
      const rect = { x: x0 + i * sw + 6, y: S.y + 90, w: sw - 12, h: this.lv.help ? 136 : 112 }; this.addZone(z.id, rect); const gr = this.add.graphics().setDepth(3); this.zoneGfx[z.id] = { gr, rect }; slotFrame(gr, rect, 'normal');
      this.txt(rect.x + rect.w / 2, rect.y + rect.h + 8, String(i + 1), { size: 20, color: '#8a6a58', center: true, ox: 0.5 }).setDepth(3);
    });
    g.fillStyle(0x22a04a, 1); g.fillTriangle(x0 + 4, S.y + 330, x0 + 24, S.y + 318, x0 + 24, S.y + 342); g.fillRect(x0 + 24, S.y + 326, K * sw - 56, 8); g.fillTriangle(x0 + K * sw - 4, S.y + 330, x0 + K * sw - 24, S.y + 318, x0 + K * sw - 24, S.y + 342);
    this.txt(x0 + 8, S.y + 24, 'น้อยที่สุด', { size: 22, color: '#22a04a' }).setDepth(3); this.txt(x0 + K * sw - 8, S.y + 24, 'มากที่สุด', { size: 22, color: '#c9301a', ox: 1 }).setDepth(3);
  }
  stagePack(S) {
    const P = this.lv.pack, k = P.k, R = k === 1 ? 118 : k === 2 ? 96 : 78, areaW = S.w - 270;
    this.lv.zones.filter(z => z.kind === 'box').forEach((z, i) => { const cx = S.x + 20 + areaW / k * (i + 0.5), cy = S.y + 168; this.makePlate(z.id, cx, cy, R, P.b, true); this.txt(cx, cy + R + 36, z.label, { size: 18, color: INK, center: true, ox: 0.5 }).setDepth(3); });
    const bx = S.x + S.w - 250, by = S.y + 24;
    KG.ui.panel(this, bx, by, 230, 304, { accent: '#ffb347', cuts: [18, 0, 18, 0], fill: ['#ffffff', '#fff1db'], alpha: 0.98, shadow: 5 }).setDepth(2);
    this.add.image(bx + 115, by + 74, pieTex(this, P.b, P.b, 96, toneOf(P.b))).setDisplaySize(106, 106).setDepth(4);
    this.txt(bx + 115, by + 138, 'พิซซ่า 1 กล่อง = ' + P.b + ' ชิ้น', { size: 20, color: INK, center: true, ox: 0.5 }).setDepth(4);
    this.txt(bx + 115, by + 168, 'ชิ้นละ 1/' + P.b, { size: 18, weight: 400, color: '#6b3b25', center: true, ox: 0.5 }).setDepth(4);
    this.leftTxt = this.txt(bx + 115, by + 220, '', { size: 18, weight: 400, color: '#c9301a', center: true, ox: 0.5, width: 200 }).setDepth(4);
  }
  stageConv(S) {
    const groups = this.lv.zones.filter(z => z.slot === 'imp'), N = groups.length, gw = Math.min(158, Math.floor((S.w - 24) / N)), x0 = S.x + (S.w - N * gw) / 2;
    groups.forEach((z, i) => {
      const cx = x0 + i * gw + gw / 2, p = z.pic, np = p.whole + 1, ps = Math.min(44, Math.floor((gw - 12) / np));
      for (let j = 0; j < np; j++) { const k = j < p.whole ? p.d : p.rest; this.add.image(cx - (np * ps) / 2 + ps * (j + 0.5), S.y + 34, pieTex(this, p.d, k, ps, toneOf(p.d))).setDisplaySize(ps + 8, ps + 8).setDepth(3); }
      this.txt(cx, S.y + 60, 'ภาพที่ ' + (i + 1), { size: 14, color: '#8a6a58', center: true, ox: 0.5 }).setDepth(3);
      [['imp', 'เศษเกิน', 122], ['mix', 'จำนวนคละ', 226]].forEach(([sl, label, yy]) => {
        const zid = sl + (i + 1), rect = { x: cx - (gw - 14) / 2, y: S.y + yy, w: gw - 14, h: 74 }; this.addZone(zid, rect); const gr = this.add.graphics().setDepth(3); this.zoneGfx[zid] = { gr, rect }; slotFrame(gr, rect, 'normal');
        this.txt(cx, S.y + yy - 22, label, { size: 15, color: '#6b3b25', center: true, ox: 0.5 }).setDepth(3);
      });
    });
  }
  stageCalc(S) {
    const qs = this.lv.qs, n = qs.length, rh = Math.floor((S.h - 16) / n);
    qs.forEach((q, i) => {
      const y = S.y + 8 + i * rh, x = S.x + 12, w = S.w - 24;
      KG.ui.panel(this, x, y + 2, w, rh - 8, { accent: '#ffb347', cuts: [14, 0, 14, 0], fill: ['#ffffff', '#fff3e0'], alpha: 0.98, shadow: 3 }).setDepth(2);
      this.txt(x + 14, y + 8, 'ข้อ ' + (i + 1), { size: 16, color: '#c9301a' }).setDepth(4);
      // ภาพโจทย์ (พิซซ่าย่อ + เครื่องหมาย)
      const ps = n === 3 ? 42 : 52; let px = x + 20;
      q.pics.forEach(p => { if (typeof p === 'string') { this.txt(px + 14, y + 4 + (rh - 8) / 2, p, { size: 30, color: INK, center: true, middle: true }).setDepth(4); px += 30; } else { this.add.image(px + ps / 2, y + 4 + (rh - 8) / 2 + 2, pieTex(this, p.d, p.n, ps, toneOf(p.d))).setDisplaySize(ps + 8, ps + 8).setDepth(4); this.txt(px + ps / 2, y + (rh - 8) / 2 + 4 + ps / 2 + 2, p.n + '/' + p.d, { size: 14, weight: 400, color: '#6b3b25', center: true, ox: 0.5 }).setDepth(4); px += ps + 8; } });
      const tx = x + 20 + (n === 3 ? 230 : 270), t = this.txt(tx, y + 12, q.text, { size: 17, weight: 400, color: INK, width: w - (tx - x) - 230 }).setDepth(4); t.setLineSpacing(2); if (t.displayHeight > rh - 24) t.setScale((rh - 24) / t.displayHeight);
      // ช่องคำตอบ: [เลขเต็ม] ตัวเศษ/ตัวส่วน
      const ax = x + w - 214, ay = y + 4 + (rh - 8) / 2; this.txt(ax - 4, ay, '=', { size: 30, color: INK, center: true, middle: true }).setDepth(4);
      let sx = ax + 20; const hasW = q.ans.w !== undefined, S2 = 54, sh = Math.min(50, Math.floor((rh - 8 - 24) / 2)), mk = (suf, rect) => { const zid = 'q' + (i + 1) + suf; this.addZone(zid, rect); const gr = this.add.graphics().setDepth(3); this.zoneGfx[zid] = { gr, rect }; slotFrame(gr, rect, 'normal'); };
      if (hasW) { mk('_w', { x: sx, y: ay - sh - 4, w: S2, h: 2 * sh + 8 }); sx += S2 + 12; }
      mk('_n', { x: sx, y: ay - sh - 8, w: 70, h: sh }); mk('_d', { x: sx, y: ay + 8, w: 70, h: sh });
      const g = this.add.graphics().setDepth(4); g.fillStyle(0x4a2412, 1); g.fillRect(sx - 2, ay - 2, 74, 4);
    });
  }

  /* ---------- ใบสั่งงานทรงตั๋ว ---------- */
  buildTicket() {
    const T = AREA.ticket, WD = WORLDS[this.W - 1], headH = 46, x = T.x, w = T.w, L = this.lv;
    this.add.image(x - 12, T.y - 12, ticketTex(this, w, T.h, headH, WD.color)).setOrigin(0, 0).setDisplaySize(w + 24, T.h + 28).setDepth(1);
    this.txt(x + 20, T.y + 7, 'ใบสั่งงาน', { size: 22, color: '#ffffff', shadow: 2, shadowColor: 'rgba(0,0,0,.3)' }).setDepth(6);
    this.txt(x + w - 20, T.y + 12, (this.seed ? 'ฝึกสุ่ม · ' : '') + 'ด่าน ' + this.N, { size: 16, color: '#ffffff', ox: 1 }).setDepth(6);
    const cx = x + 20, cw = w - 40 - 44, top = T.y + headH + 10, avail = T.h - headH - 20;
    this.checkRows = []; let sz = 18, rows;
    for (; sz >= 13; sz--) {
      rows = L.checks.map(ck => { const t = KG.txt(this, cx + 38, 0, gwrap(ck.text, cw, '600 ' + sz + 'px Kanit'), { size: sz, color: INK }).setDepth(6); t.setLineSpacing(-1); return { t, h: Math.max(sz + 12, t.displayHeight - 4), ck }; });
      const total = rows.reduce((n, r) => n + r.h + 4, 0); if (total <= avail || sz === 13) break; rows.forEach(r => r.t.destroy());
    }
    let y = top; rows.forEach(r => { r.t.setY(y + (r.h - r.t.displayHeight) / 2); r.box = this.add.graphics().setDepth(6); r.rad = Math.min(14, Math.floor((r.h - 2) / 2)); r.tick = KG.ui.icon(this, 'check', cx + 15, y + r.h / 2, r.rad * 1.4, 0x22b45a).setDepth(7).setAlpha(0); r.y = y; this.checkRows.push(r); y += r.h + 4; });
  }
  drawBox(r, done) {
    const x = AREA.ticket.x + 20; r.box.clear(); r.box.fillStyle(done ? 0xdff7e6 : 0xffffff, 1); r.box.fillCircle(x + 15, r.y + r.h / 2, r.rad); r.box.lineStyle(3, done ? 0x22b45a : 0x7a3b1f, 1); r.box.strokeCircle(x + 15, r.y + r.h / 2, r.rad);
    r.tick.setAlpha(done ? 1 : 0); r.t.setColor(done ? '#13804a' : INK);
  }

  /* ---------- HUD ---------- */
  buildHud() {
    const WD = WORLDS[this.W - 1];
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52, depth: 30 });
    this.txt(100, 6, 'โลก ' + this.W + ' · ' + WD.grade + (this.seed ? ' · ฝึกสุ่ม' : ''), { size: 18, color: KG.SKIN.hi }).setDepth(30);
    this.txt(100, 26, 'ด่าน ' + this.N + ' · ' + this.lv.title, { size: 30, stroke: true }).setDepth(30);
    addSystemButtons(this, 1084, 40, 0, ['sfx']).forEach(b => b.setDepth(30));
    iconButton(this, 1148, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 30 });
    iconButton(this, 1218, 40, 'pause', () => this.pause(), { w: 60, h: 52, depth: 30 });
  }
  buildControls() {
    const C = AREA.ctrl;
    this.txt(C.x + 20, C.y + 12, 'ดาวตอนนี้', { size: 15, weight: 400, color: '#8a6a58' }).setDepth(30);
    this.starIcons = [0, 1, 2].map(i => KG.ui.icon(this, 'star', C.x + 38 + i * 46, C.y + 54, 40, 0xffb800).setDepth(30));
    this.statsTxt = this.txt(C.x + 190, C.y + 30, '', { size: 18, color: INK, width: 130 }).setDepth(30);
    this.hintBtn = new KG.ui.Button(this, C.x + C.w / 2, C.y + 114, 296, 52, { label: 'คำใบ้', icon: 'bulb', style: 'sun', size: 22, onClick: () => this.showHint() }).setDepth(30);
    this.resetBtn = new KG.ui.Button(this, C.x + C.w / 2, C.y + 168, 296, 44, { label: 'เริ่มด่านใหม่', icon: 'reset', style: 'ghost', size: 20, onClick: () => this.go('Play', this._restartData) }).setDepth(30);
  }
  refreshStats() {
    this.statsTxt.setText('พลาด ' + this.mistakes + ' ครั้ง' + String.fromCharCode(10) + 'ใช้คำใบ้ ' + this.hints + ' ครั้ง'); const pen = this.mistakes + this.hints, n = pen <= 1 ? 3 : pen <= 3 ? 2 : 1;
    this.starIcons.forEach((ic, i) => ic.setTint(i < n ? 0xffb800 : 0xd9c6ac));
  }
  buildArena() {
    const A = AREA.arena, m = this.lv.monsters[0], boss = this.lv.boss, fy = A.y + A.h - 10, hx = A.x + 90, mx = A.x + 248, WD = WORLDS[this.W - 1];
    this.heroSh = this.add.ellipse(hx, fy - 2, 78, 13, 0x4a2412, 0.28).setDepth(7); this.monSh = this.add.ellipse(mx, fy - 2, boss ? 112 : 88, 13, 0x4a2412, 0.28).setDepth(7);
    this.hero = KG.art.make(this, hx, fy, WD.hero, 'idle', 104).setDepth(8);
    this.mon = KG.art.make(this, mx, fy, 'b' + m, 0, boss ? 126 : 100).setDepth(8).setFlipX(true);
    this.tweens.add({ targets: this.hero, scaleY: this.hero.artScale * 1.025, duration: 780, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.mon, scaleY: this.mon.artScale * 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.txt(mx, A.y + 6, MON_NAME[m] || 'ตัวป่วน', { size: 14, color: '#c9202f', center: true, ox: 0.5 }).setDepth(9);
    const n = this.lv.checks.length; this.pips = [];
    for (let i = 0; i < n; i++) this.pips.push(KG.ui.icon(this, 'heart', mx + (i - (n - 1) / 2) * 20, A.y + 38, 18, 0xe0243d).setDepth(9));
  }
  buildMsg() {
    const M = AREA.msg;
    this.msgTxt = this.txt(M.x + 20, M.y + 8, '', { size: 20, color: INK, width: 780 }).setDepth(30);
    this.speakBtn = iconButton(this, M.x + M.w - 44, M.y + M.h / 2 - 2, 'sound', () => this.speak(this.msgPlain || ''), { w: 56, h: 44, depth: 30 });
  }
  setMessage(str, kind) {
    this.msgPlain = str; this.msgTxt.setText(gwrap(str, 780, '600 20px Kanit')); this.msgTxt.setColor(kind === 'bad' ? '#c9202f' : kind === 'good' ? '#13804a' : INK);
    this.msgTxt.setScale(1); const lh = this.msgTxt.displayHeight; if (lh > 44) this.msgTxt.setScale(44 / lh); this.msgTxt.y = AREA.msg.y + 6 + (44 - this.msgTxt.displayHeight) / 2 + 2;
  }
  speak(text) {
    try {
      if (!window.speechSynthesis || !text) return; window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(spokenFrac(text).replace(/[·›“”•=]/g, ' ')); u.lang = 'th-TH'; u.rate = 0.9;
      const v = (window.speechSynthesis.getVoices() || []).find(x => /^th/i.test(x.lang)); if (v) u.voice = v; window.speechSynthesis.speak(u);
    } catch (e) { /* ไม่มีเสียงอ่านก็ไม่เป็นไร */ }
  }

  /* ---------- วาดชิ้นของทั้งหมดใหม่ตามสถานะ ---------- */
  renderItems() {
    Object.keys(this.views).forEach(id => { if (this.views[id]) this.views[id].destroy(true); }); this.views = {};
    const L = this.lv, st = this.st, trayIds = L.items.filter(i => !st.loc[i.id]).map(i => i.id);
    this.trayPos = {}; this.layoutTray(trayIds);
    trayIds.forEach(id => this.views[id] = this.makeView(this.itemOf(id), 'tray', this.trayPos[id]));
    L.zones.forEach(z => {
      if (z.kind === 'tray') return; const ids = L.items.filter(i => st.loc[i.id] === z.id).map(i => i.id); if (!ids.length) return; const r = this.zr[z.id];
      ids.forEach((id, k) => { const it = this.itemOf(id), pos = this.placedPos(z, r, k); this.views[id] = this.makeView(it, pos.mode, pos); });
    });
    if (this.leftTxt) { const left = trayIds.length; this.leftTxt.setText(left ? 'ชิ้นที่เหลือนอกกล่อง ' + left + ' ชิ้น' : ''); }
    if (this.selItem && !this.views[this.selItem]) this.selItem = null;
    this.paintSel(); this.paintZones();
  }
  trayDims(it) {
    if (it.kind === 'slice') return { w: 100, h: 94, per: 8 };
    if (it.kind === 'num') return { w: 72, h: 78, per: 12 };
    return { w: 112, h: this.lv.help ? 98 : 88, per: 7 };
  }
  layoutTray(ids) {
    const T = AREA.tray, n = ids.length; if (!n) return; const d = this.trayDims(this.itemOf(ids[0])), rows = Math.ceil(n / d.per), perRow = Math.ceil(n / rows), off = rows === 1 ? (T.h - d.h) / 2 : 9, gap = 6;
    ids.forEach((id, i) => { const r = Math.floor(i / perRow), c = i % perRow, inRow = Math.min(perRow, n - r * perRow), x0 = T.x + T.w / 2 - (inRow * (d.w + gap) - gap) / 2 + d.w / 2; this.trayPos[id] = { x: x0 + c * (d.w + gap), y: T.y + off + r * (d.h + 4) + d.h / 2, w: d.w, h: d.h, mode: 'tray' }; });
  }
  placedPos(z, r, k) {
    if (z.kind === 'plate' || z.kind === 'box') { const p = this.plates[z.id]; return { mode: 'wedge', x: p.cx, y: p.cy, w: 56, h: 56, idx: k, R: p.R, den: p.den }; }
    if (z.kind === 'ans') { const d = Math.min(44, r.h - 4); return { mode: 'coin', x: r.x + r.w / 2, y: r.y + r.h / 2, w: d, h: d }; }
    return { mode: 'card', x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w - 10, h: r.h - 8 };
  }
  // ตัวชิ้นของหนึ่งชิ้นตามโหมด: tray (ชิ้นพิซซ่า/การ์ด/เหรียญ) · wedge (ชิ้นบนจาน) · card (การ์ดบนช่อง) · coin (เหรียญบนช่องคำตอบ)
  makeView(it, mode, pos) {
    const c = this.add.container(pos.x, pos.y).setDepth(10), w = pos.w, h = pos.h; c.item = it; c.mode = mode; c.box = { x: pos.x - w / 2, y: pos.y - h / 2, w, h };
    if (mode === 'wedge') {
      const R = pos.R, den = pos.den, ang = (pos.idx + 0.5) * Math.PI * 2 / den, o = wedgeOrigin(R), img = this.add.image(0, 0, wedgeTex(this, den, R, toneOf(den))).setOrigin(o.x, o.y).setRotation(ang).setDisplaySize(2 * R + 10, R + 10); c.add(img); c.wedge = img;
      const mx = Math.sin(ang) * R * 0.62, my = -Math.cos(ang) * R * 0.62; c.box = { x: pos.x + mx - 24, y: pos.y + my - 24, w: 48, h: 48 };
      const z = this.add.zone(mx, my, 54, 54).setInteractive({ useHandCursor: true }); c.add(z); c.hit = z; this.hookView(c, z, it);
      return c;
    }
    if (mode === 'coin') {
      const kk = w / 44; c.add(this.add.image(-3 * kk, -3 * kk, coinTex(this, 44)).setOrigin(0.5, 0.5).setDisplaySize(56 * kk, 58 * kk)); c.add(KG.txt(this, 0, -2 * kk, it.n, { size: Math.round(26 * kk), color: INK, center: true, ox: 0.5, oy: 0.5 }));
    } else if (mode === 'tray' && it.kind === 'num') {
      const img = this.add.image(-3, -3, coinTex(this, 56)).setOrigin(0.5, 0.5).setDisplaySize(68, 70); c.add(img); c.bg = img; c.add(KG.txt(this, 0, -2, it.n, { size: 32, color: INK, center: true, ox: 0.5, oy: 0.5 }));
    } else if (mode === 'tray' && it.kind === 'slice') {
      const bg = this.add.image(-(w / 2 + 6), -(h / 2 + 4), tileBg(this, w, h, 'normal')).setOrigin(0, 0).setDisplaySize(w + 12, h + 14); c.add(bg); c.bg = bg;
      const R = 42, o = wedgeOrigin(R); c.add(this.add.image(0, 16, wedgeTex(this, it.f.den, R, toneOf(it.f.den))).setOrigin(o.x, o.y).setDisplaySize(2 * R + 10, R + 10));
      c.add(KG.txt(this, 0, h / 2 - 22, '1/' + it.f.den, { size: 20, color: INK, center: true, ox: 0.5, oy: 0.5 }));
    } else {   // การ์ดเศษส่วน (ถาด หรือวางบนช่อง)
      const bg = this.add.image(-(w / 2 + 6), -(h / 2 + 4), cardBg(this, w, h, 'normal')).setOrigin(0, 0).setDisplaySize(w + 12, h + 14); c.add(bg); c.bg = bg;
      const fs = mode === 'tray' ? 28 : Math.min(26, Math.floor(h * 0.42)), lab = itemLabel(this, it, 0, (this.lv.help && it.f.rank && mode === 'tray') ? -10 : 0, fs); c.add(lab);
      if (lab.w > w - 12) lab.setScale((w - 12) / lab.w);
      if (this.lv.help && it.kind === 'card' && it.num != null && (mode === 'tray' || mode === 'card')) c.add(this.add.image(0, h / 2 - 20, barTex(this, it.den, it.num, Math.min(w - 26, 92), 14)).setDisplaySize(Math.min(w - 26, 92) + 12, 28));
    }
    const z = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true }); c.add(z); c.hit = z; this.hookView(c, z, it);
    if (this.drag && this.drag.id === it.id) c.setAlpha(0.35);
    return c;
  }
  hookView(c, z, it) {
    z.on('pointerdown', p => this.itemDown(it.id, p));
    z.on('pointerover', () => { if (!this.drag && c.bg && c.mode !== 'coin' && this.selItem !== it.id && !this.hlItem(it.id)) this.restyle(c, 'hover'); });
    z.on('pointerout', () => { if (!this.drag && c.bg) this.restyle(c, this.selItem === it.id ? 'sel' : 'normal'); });
  }
  hlItem(id) { return this.hl && this.hl.item === id; }
  restyle(c, state) {
    if (!c.bg || !c.bg.scene) return; const it = c.item, w = c.box.w, h = c.box.h;
    if (c.mode === 'tray' && it.kind === 'slice') c.bg.setTexture(tileBg(this, w, h, state));
    else if (c.mode === 'tray' && it.kind === 'num') c.bg.setTint(state === 'sel' ? 0xfff0a0 : state === 'hint' ? 0xffb87a : 0xffffff);
    else if (c.bg) c.bg.setTexture(cardBg(this, w, h, state));
  }
  paintSel() { Object.keys(this.views).forEach(id => { const c = this.views[id]; if (c) this.restyle(c, this.selItem === id ? 'sel' : this.hlItem(id) ? 'hint' : 'normal'); }); }
  paintZones() {
    const sel = this.selItem && this.itemOf(this.selItem);
    this.lv.zones.forEach(z => { if (z.kind === 'tray' || !this.zoneGfx[z.id]) return; const ok = !!sel && SL.canDrop(this.lv, this.st, sel.id, z.id).ok; this.styleZone(z.id, ok ? 'hl' : 'normal'); });
  }
  styleZone(id, mode) {
    const g = this.zoneGfx[id]; if (!g) return;
    if (g.plate) g.ring.setVisible(mode === 'hl'); else if (g.gr) slotFrame(g.gr, g.rect, mode === 'hl' ? 'hl' : 'normal');
  }
}
