/* ===== ฉากเล่น Techno Parts: โต๊ะช่าง (กลางขวา) + ใบสั่งงานทรงตั๋ว (ซ้ายบน) + สนามเทคโน (ซ้ายกลาง) + แผงดาวและปุ่ม (ซ้ายล่าง) + ถาดชิ้นส่วน (ล่าง) =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y0-76 · คอลัมน์ซ้าย x24-336 · โต๊ะช่าง x352-1256 y84-436 · แถบข้อความ y444-500 · ถาดชิ้นส่วน y508-710
   ไฟล์นี้เป็นแกนของฉาก (สร้างหน้าจอและวาดใหม่) ส่วนการแตะ/ลากวางอยู่ที่ play-input.js และการวาง/คำใบ้/ชนะ/บทสอนอยู่ที่ play-ops.js
   ลักษณะเด่นของเกมนี้คือรูปทรงมน: ใบสั่งงานเป็นตั๋ว ถังเป็นแคปซูล ชิ้นส่วนในถาดเป็นหกเหลี่ยม ชิ้นที่วางแล้วเป็นชิป */
const AREA = {
  ticket: { x: 24, y: 84, w: 312, h: 264 }, arena: { x: 24, y: 356, w: 312, h: 150 }, ctrl: { x: 24, y: 514, w: 312, h: 196 },
  stage: { x: 352, y: 84, w: 904, h: 352 }, msg: { x: 352, y: 444, w: 904, h: 56 }, tray: { x: 352, y: 508, w: 904, h: 202 }
};
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
// ตัดคำภาษาไทยแล้วย้ายเครื่องหมาย “ ที่ค้างท้ายบรรทัดไปไว้หน้าคำถัดไป
function gwrap(str, w, font) {
  const NL = String.fromCharCode(10), L = KG.wrap(str, w, font).split(NL);
  for (let i = 0; i < L.length - 1; i++) if (/“$/.test(L[i])) { L[i] = L[i].slice(0, -1).trimEnd(); L[i + 1] = '“' + L[i + 1]; }
  return L.join(NL);
}
const fitW = (t, maxW) => { t.setScale(1); if (t.width > maxW) t.setScale(maxW / t.width); return t; };
// ป้ายชื่อในชิ้นส่วน: ตัดคำให้ไม่เกิน 2 บรรทัด ถ้าเกินก็ลดขนาดตัวอักษร
function nameLabel(scene, name, maxW, size, color) {
  let sz = size, s = gwrap(name, maxW, '600 ' + sz + 'px Kanit');
  const widest = str => Math.max.apply(null, str.split(String.fromCharCode(10)).map(l => KG.measure(l, '600 ' + sz + 'px Kanit')));
  while ((s.split(String.fromCharCode(10)).length > 2 || widest(s) > maxW) && sz > 10) { sz--; s = gwrap(name, maxW, '600 ' + sz + 'px Kanit'); }
  const t = KG.txt(scene, 0, 0, s, { size: sz, color: color || INK, center: true, ox: 0.5 }); t.setLineSpacing(-3); return t;
}
// ตำแหน่งช่องในตัวเครื่องของด่านประกอบ (x,y,w,h เทียบมุมซ้ายบนของตัวเครื่อง)
const SLOT_POS = {
  cpu: [24, 24, 128, 128], ram1: [176, 24, 300, 60], ram2: [176, 96, 300, 60], fan: [500, 24, 128, 128], st1: [652, 24, 184, 60], st2: [652, 96, 184, 60], gpu: [24, 176, 452, 64], psu: [500, 176, 336, 100]
};
const CASE = { x: 374, y: 98, w: 860, h: 324 };

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.W = data.world || SAVE.data.world || 1; this.N = data.level || 1; this.seed = data.seed || null; this.wantTutor = !!data.tutor;
    this._restartData = { world: this.W, level: this.N, seed: this.seed };
    // ฉากถูกใช้ซ้ำเมื่อเริ่มใหม่ ต้องล้างของเดิมที่ค้างจากรอบก่อนทั้งหมด
    this.tutor = null; this._modal = null; this.press = null; this.drag = null; this.hl = null; this.bubble = null; this.hero = null; this.mon = null;
    this.views = {}; this.zr = {}; this.zoneObjs = []; this.statics = []; this.pips = []; this.checkDone = []; this.selItem = null; this.hlG = null; this.hlTw = null;
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); const WD = WORLDS[this.W - 1]; KG.audio.music(['sunny', 'breeze', 'bounce'][(this.W - 1) % 3]);
    this.lv = this.seed ? makeLevel(this.W, this.N, this.seed) : getLevel(this.W, this.N); this.st = PT.init(this.lv);
    this.mistakes = 0; this.hints = 0; this.ops = 0; this.done = false; this.paused = false; this.state = 'play';
    this.buildBackground(); this.buildStage(); this.buildTicket(); this.buildHud(); this.buildControls(); this.buildArena(); this.buildTrayAndMsg();
    this.dropHL = this.add.graphics().setDepth(300);
    this.input.on('pointermove', p => this.onMove(p)); this.input.on('pointerup', p => this.onUp(p));
    this.renderItems(); this.refreshMission(true); this.refreshStats();
    this.setMessage(this.lv.kind === 'job' ? 'อ่านที่ลูกค้าพูดทางซ้ายของโต๊ะ แล้วเลือกอุปกรณ์ใส่ตะกร้า' : this.lv.desc, 'info');
    if (this.wantTutor && this.W === 1 && this.N === 1) this.time.delayedCall(500, () => this.startTutor());
    else if (this.N === 1 && !this.seed && !SAVE.data.tutorDone[this.W]) this.time.delayedCall(700, () => this.showIntro());
  }
  onEscape() { if (this.selItem) { this.selItem = null; this.renderItems(); } else this.pause(); }
  leave() { this.go('Select', { level: this.N }); }
  itemOf(id) { return PT.itemOf(this.lv, id); }
  zoneOf(id) { return PT.zoneOf(this.lv, id); }

  /* ---------- ฉากหลัง ---------- */
  buildBackground() {
    const WD = WORLDS[this.W - 1]; this.add.image(GW / 2, GH / 2, 'arena_' + WD.bg).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.22);
    KG.fx.ambient(this, { freq: 360, colors: [0xffffff, 0xffd34f, 0x7fe0ff], s: 0.3, alpha: 0.6 });
    const A = AREA;
    KG.ui.panel(this, A.stage.x, A.stage.y, A.stage.w, A.stage.h, { accent: WD.color, accent2: WD.color, cuts: [20, 0, 20, 0], fill: ['#f6fbff', '#d8ecff'], alpha: 0.97 }).setDepth(1);
    KG.ui.panel(this, A.arena.x, A.arena.y, A.arena.w, A.arena.h, { accent: '#ffcf33', accent2: '#ff8a2b', cuts: [18, 0, 18, 0], fill: ['#fffaf0', '#fff0d2'], alpha: 0.97 }).setDepth(1);
    KG.ui.panel(this, A.ctrl.x, A.ctrl.y, A.ctrl.w, A.ctrl.h, { accent: '#16c7a8', accent2: '#7fe3ff', cuts: [18, 0, 18, 0], fill: ['#ffffff', '#e2f1ff'], alpha: 0.97 }).setDepth(1);
    KG.ui.panel(this, A.msg.x, A.msg.y, A.msg.w, A.msg.h, { accent: '#2b8cff', cuts: [16, 0, 16, 0], fill: ['#ffffff', '#e6f1ff'], alpha: 0.97, shadow: 5 }).setDepth(1);
    KG.ui.panel(this, A.tray.x, A.tray.y, A.tray.w, A.tray.h, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [18, 0, 18, 0], fill: ['#fffaf0', '#ffeccb'], alpha: 0.97 }).setDepth(1);
  }

  /* ---------- โต๊ะช่าง: สร้างที่วางตามชนิดด่าน ---------- */
  addZone(zoneId, rect, tint) { this.zr[zoneId] = rect; const z = this.add.zone(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h).setDepth(3).setInteractive({ useHandCursor: true }); z.on('pointerup', () => this.tapZone(zoneId)); this.zoneObjs.push(z); }
  buildStage() {
    const S = AREA.stage, L = this.lv, WD = WORLDS[this.W - 1];
    this.zr = {}; const bins = L.zones.filter(z => z.kind === 'bin'), ports = L.zones.filter(z => z.kind === 'port'), slots = L.zones.filter(z => z.kind === 'slot'), steps = L.zones.filter(z => z.kind === 'step'), cart = L.zones.find(z => z.kind === 'cart');
    this.zoneGfx = {};
    if (bins.length) this.stageBins(bins, S);
    else if (ports.length) this.stagePorts(ports, S);
    else if (slots.length) this.stageSlots(slots);
    else if (steps.length) this.stageSteps(steps, S);
    else if (cart) this.stageJob(cart, S);
    // ถาดชิ้นส่วนเป็นที่วางเสมอ (ลากกลับมาได้)
    this.addZone('tray', { x: AREA.tray.x, y: AREA.tray.y, w: AREA.tray.w, h: AREA.tray.h });
  }
  stageBins(bins, S) {
    const nb = bins.length, gap = 14, w = Math.floor((S.w - 32 - gap * (nb - 1)) / nb), h = S.h - 32, y = S.y + 16;
    bins.forEach((z, i) => {
      const x = S.x + 16 + i * (w + gap), rect = { x, y, w, h }; this.addZone(z.id, rect);
      const img = this.add.image(x - 10, y - 10, binTex(this, w, h, z.color, 'normal')).setOrigin(0, 0).setDisplaySize(w + 20, h + 22).setDepth(2); this.zoneGfx[z.id] = { img, w, h, color: z.color };
      this.add.image(x + 30, y + 24, PTI.tex(this, GROUP_ICON[z.acc.v] || 'cpu', 64)).setDisplaySize(40, 40).setDepth(4);
      const nm = KG.txt(this, x + 58, y + 6, z.label, { size: 22, color: '#ffffff', shadow: 2, shadowColor: 'rgba(0,0,0,.35)' }).setDepth(4); fitW(nm, w - 68);
      if (w >= 200) { const sb = KG.txt(this, x + 58, y + 36, z.sub || '', { size: 14, weight: 400, color: '#ffffff', width: w - 70 }).setDepth(4); sb.setLineSpacing(-3); }
      z.rect = rect;
    });
  }
  stagePorts(ports, S) {
    const L = this.lv, P = { x: S.x + 264, y: S.y + 16, w: S.w - 264 - 16, h: S.h - 32 };
    // ซ้าย: ลูกค้าพร้อมคำบอกอาการ (ด่านซ่อม) หรือรูปเครื่องคอมพิวเตอร์ (ด่านเสียบสาย)
    const lx = S.x + 18, g = this.add.graphics().setDepth(2);
    if (L.kind === 'fix') {
      this.add.image(lx + 54, S.y + 74, PTI.tex(this, 'face-' + ((this.N + this.W) % PTI.FACE_COUNT), 128)).setDisplaySize(96, 96).setDepth(3);
      const bw = 232, bx = lx, by = S.y + 128; KG.ui.panel(this, bx, by, bw, 188, { accent: '#ff7a1a', accent2: '#ffcf33', cuts: [18, 0, 18, 0], fill: ['#ffffff', '#fff4dd'], alpha: 0.98, shadow: 4 }).setDepth(2);
      this.txt(bx + 14, by + 12, 'ลูกค้าบอกอาการ', { size: 15, color: '#d9560a' }).setDepth(4);
      this.txt(bx + 14, by + 36, L.symptom.split(' · ').map(s => '• ' + s).join(String.fromCharCode(10)), { size: 17, weight: 400, color: INK, width: bw - 28 }).setDepth(4).setLineSpacing(2);
    } else {
      g.fillStyle(0x000000, 0.12); g.fillRoundedRect(lx + 36, S.y + 56, 150, 252, 22); g.fillStyle(0xe8eefb, 1); g.fillRoundedRect(lx + 30, S.y + 46, 150, 252, 22); g.lineStyle(4, 0x2b3f9c, 1); g.strokeRoundedRect(lx + 30, S.y + 46, 150, 252, 22);
      g.fillStyle(0xcfd8ee, 1); g.fillRoundedRect(lx + 46, S.y + 64, 118, 22, 8); g.fillRoundedRect(lx + 46, S.y + 94, 118, 22, 8); g.fillStyle(0x16c7a8, 1); g.fillCircle(lx + 74, S.y + 144, 14); g.lineStyle(3, 0x2b3f9c, 1); g.strokeCircle(lx + 74, S.y + 144, 14);
      g.fillStyle(0x7fd8ff, 1); g.fillCircle(lx + 105, S.y + 250, 36); g.lineStyle(3, 0x2b3f9c, 1); g.strokeCircle(lx + 105, S.y + 250, 36); g.fillStyle(0xffffff, 0.7); g.fillCircle(lx + 105, S.y + 250, 8);
      this.txt(lx + 105, S.y + 308, 'ด้านหลังเครื่องคอม', { size: 16, color: '#33456f', center: true, ox: 0.5 }).setDepth(3);
    }
    // ขวา: แผงด้านหลังเครื่อง (ตารางช่องเสียบ)
    KG.ui.panel(this, P.x, P.y, P.w, P.h, { accent: '#6a7bd0', accent2: '#9aa7c4', cuts: [18, 0, 18, 0], fill: ['#eef2fb', '#c9d3ea'], alpha: 0.99, shadow: 5 }).setDepth(2);
    const n = ports.length, cols = n > 5 ? Math.ceil(n / 2) : n, rows = n > 5 ? 2 : 1, cw = Math.floor((P.w - 24) / cols), ch = rows === 2 ? 148 : 190, gx = P.x + 12, gy = P.y + (P.h - ch * rows) / 2 + (rows === 1 ? -4 : 6);
    const SK = { power: [74, 52], hdmi: [70, 38], usb: [60, 40], audio: [46, 46], mic: [46, 46], lan: [58, 48] };
    ports.forEach((z, i) => {
      const col = i % cols, row = Math.floor(i / cols), cx = gx + col * cw + cw / 2, top = gy + row * ch, kind = z.acc.v, sz = SK[kind];
      const rect = { x: gx + col * cw + 3, y: top + 2, w: cw - 6, h: ch - 4 }; this.addZone(z.id, rect);
      const sg = this.add.image(cx - (sz[0] + 12) / 2, top + 10, socketTex(this, kind, sz[0], sz[1], 'normal')).setOrigin(0, 0).setDisplaySize(sz[0] + 12, sz[1] + 12).setDepth(3); this.zoneGfx[z.id] = { sg, kind, sz, cx, top };
      if (L.labels === 'full') { const t = KG.txt(this, cx, top + sz[1] + 20, E_PORTS[kind].n.replace(' (สีเขียว)', '').replace(' (สีชมพู)', ''), { size: 14, color: '#33456f', center: true, ox: 0.5, width: cw - 10 }).setDepth(3); t.setLineSpacing(-3); if (kind === 'audio' || kind === 'mic') this.add.rectangle(cx, top + sz[1] + 15, cw - 20, 3, E_PORTS[kind].col ? Phaser.Display.Color.HexStringToColor(E_PORTS[kind].col).color : 0x888888).setDepth(3); }
      else if (L.labels === 'sym') this.add.image(cx, top + sz[1] + 34, PTI.tex(this, { power: 'plug-power', hdmi: 'plug-hdmi', usb: 'plug-usb', audio: 'plug-audio', mic: 'plug-mic', lan: 'plug-lan' }[kind], 48)).setDisplaySize(34, 34).setAlpha(0.6).setDepth(3);
      z.rect = rect;
    });
    this.portGeo = { cw, ch, cols };
  }
  stageSlots(slots) {
    const c = CASE, g = this.add.graphics().setDepth(2);
    g.fillStyle(0x10204f, 0.28); g.fillRoundedRect(c.x + 4, c.y + 8, c.w, c.h, 30); g.fillStyle(0xe6edfb, 1); g.fillRoundedRect(c.x, c.y, c.w, c.h, 30); g.lineStyle(5, 0x2b3f9c, 1); g.strokeRoundedRect(c.x, c.y, c.w, c.h, 30);
    g.fillStyle(0xcfe9dd, 1); g.fillRoundedRect(c.x + 12, c.y + 12, c.w - 24, c.h - 24, 22);   // แผงวงจรหลักสีเขียวอ่อน
    this.txt(c.x + 28, c.y + c.h - 54, 'ตัวเครื่องคอมพิวเตอร์ (เปิดฝาข้างแล้ว)', { size: 16, color: '#33456f' }).setDepth(3);
    slots.forEach(z => {
      const p = SLOT_POS[z.id], rect = { x: c.x + p[0], y: c.y + p[1], w: p[2], h: p[3] }; this.addZone(z.id, rect);
      const gr = this.add.graphics().setDepth(3); this.zoneGfx[z.id] = { gr, rect }; this.drawSlot(z.id, 'normal');
      const nm = this.lv.clue ? z.clue : z.label; z.rect = rect;
      this.zoneGfx[z.id].lab = KG.txt(this, rect.x + 10, rect.y + 5, nm, { size: 15, color: '#33456f', width: rect.w - 20 }).setDepth(4);
    });
  }
  drawSlot(id, mode) {
    const o = this.zoneGfx[id], r = o.rect, g = o.gr; g.clear(); g.fillStyle(mode === 'hl' ? 0xbff3e3 : 0xffffff, mode === 'hl' ? 0.9 : 0.6); g.fillRoundedRect(r.x, r.y, r.w, r.h, 16);
    g.lineStyle(mode === 'hl' ? 5 : 3, mode === 'hl' ? 0x16c7a8 : 0x6f8cff, 1);
    // เส้นประรอบช่อง
    const dash = 9, gap = 6; const edge = (x1, y1, x2, y2) => { const len = Math.hypot(x2 - x1, y2 - y1), dx = (x2 - x1) / len, dy = (y2 - y1) / len; for (let t = 0; t < len; t += dash + gap) { g.beginPath(); g.moveTo(x1 + dx * t, y1 + dy * t); const e = Math.min(t + dash, len); g.lineTo(x1 + dx * e, y1 + dy * e); g.strokePath(); } };
    edge(r.x + 14, r.y, r.x + r.w - 14, r.y); edge(r.x + 14, r.y + r.h, r.x + r.w - 14, r.y + r.h); edge(r.x, r.y + 14, r.x, r.y + r.h - 14); edge(r.x + r.w, r.y + 14, r.x + r.w, r.y + r.h - 14);
  }
  stageSteps(steps, S) {
    const lx = S.x + 18, g = this.add.graphics().setDepth(2), SQ = PT_LV_SEQ(this.lv.seq);
    g.fillStyle(0x16c7a8, 0.18); g.fillRoundedRect(lx, S.y + 22, 250, 300, 26); g.lineStyle(3, 0x16c7a8, 1); g.strokeRoundedRect(lx, S.y + 22, 250, 300, 26);
    this.add.image(lx + 125, S.y + 100, PTI.tex(this, 'sw-os', 128)).setDisplaySize(116, 116).setDepth(3);
    this.txt(lx + 125, S.y + 170, SQ.title, { size: 22, color: INK, center: true, ox: 0.5, width: 220 }).setDepth(3);
    this.txt(lx + 125, S.y + 250, 'ขั้นตอนมีลำดับ ทำสลับกันไม่ได้ ลองคิดว่าอะไรต้องมาก่อน', { size: 16, weight: 400, color: '#33456f', center: true, ox: 0.5, width: 212 }).setDepth(3);
    const x = S.x + 290, w = S.w - 290 - 18, n = steps.length, rh = Math.min(46, Math.floor(316 / n) - 4);
    steps.forEach((z, i) => {
      const y = S.y + 18 + i * (rh + 5), rect = { x, y, w, h: rh }; this.addZone(z.id, rect); z.rect = rect;
      const gr = this.add.graphics().setDepth(3); this.zoneGfx[z.id] = { gr, rect }; this.drawSlot(z.id, 'normal');
      this.add.image(x + 22, y + rh / 2, KG.tex(this, 'pt-num|' + rh, 44, 44, c => { c.beginPath(); c.arc(22, 22, 19, 0, 7); c.fillStyle = TEAL; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1b2a6b'; c.stroke(); })).setDisplaySize(36, 36).setDepth(4);
      this.txt(x + 22, y + rh / 2, String(i + 1), { size: 20, color: '#ffffff', center: true, middle: true }).setDepth(5);
    });
  }
  stageJob(cart, S) {
    const J = this.lv.job, g = this.add.graphics().setDepth(2);
    this.add.image(S.x + 66, S.y + 80, PTI.tex(this, 'face-' + J.face, 128)).setDisplaySize(104, 104).setDepth(3);
    this.txt(S.x + 66, S.y + 140, J.who, { size: 18, color: INK, center: true, ox: 0.5, width: 120 }).setDepth(3);
    const bx = S.x + 130, by = S.y + 24, bw = 304; KG.ui.panel(this, bx, by, bw, 292, { accent: '#ff7a1a', accent2: '#ffcf33', cuts: [20, 0, 20, 0], fill: ['#ffffff', '#fff4dd'], alpha: 0.98, shadow: 5 }).setDepth(2);
    this.txt(bx + 18, by + 16, 'ลูกค้าบอกว่า', { size: 15, color: '#d9560a' }).setDepth(4);
    const t = this.txt(bx + 18, by + 42, '“' + J.line + '”', { size: 20, weight: 400, color: INK, width: bw - 36 }).setDepth(4); t.setLineSpacing(3);
    if (t.displayHeight > 232) t.setScale(232 / t.displayHeight);
    const rect = { x: S.x + 458, y: S.y + 16, w: S.w - 458 - 16, h: S.h - 32 }; this.addZone(cart.id, rect); cart.rect = rect;
    const img = this.add.image(rect.x - 10, rect.y - 10, binTex(this, rect.w, rect.h, '#ff8a2b', 'normal')).setOrigin(0, 0).setDisplaySize(rect.w + 20, rect.h + 22).setDepth(2); this.zoneGfx[cart.id] = { img, w: rect.w, h: rect.h, color: '#ff8a2b' };
    this.add.image(rect.x + 34, rect.y + 28, KG.tex(this, 'pt-basket', 60, 60, c => { c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.moveTo(6, 22); c.lineTo(54, 22); c.lineTo(46, 52); c.lineTo(14, 52); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 3.4; c.strokeStyle = '#1f2d5c'; c.stroke(); c.beginPath(); c.moveTo(16, 22); c.lineTo(24, 8); c.moveTo(44, 22); c.lineTo(36, 8); c.lineWidth = 3.4; c.stroke(); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(20 + i * 10, 28); c.lineTo(22 + i * 8, 46); c.lineWidth = 2; c.stroke(); } })).setDisplaySize(52, 52).setDepth(4);
    KG.txt(this, rect.x + 70, rect.y + 6, 'ตะกร้าของลูกค้า', { size: 22, color: '#ffffff', shadow: 2, shadowColor: 'rgba(0,0,0,.35)' }).setDepth(4);
    KG.txt(this, rect.x + 70, rect.y + 36, 'ลากอุปกรณ์ที่ลูกค้าต้องใช้มาใส่', { size: 14, weight: 400, color: '#ffffff' }).setDepth(4);
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
    const x = AREA.ticket.x + 20; r.box.clear(); r.box.fillStyle(done ? 0xdff7e6 : 0xffffff, 1); r.box.fillCircle(x + 15, r.y + r.h / 2, r.rad); r.box.lineStyle(3, done ? 0x22b45a : 0x2b3f9c, 1); r.box.strokeCircle(x + 15, r.y + r.h / 2, r.rad);
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

  /* ---------- แผงดาวและปุ่มคำใบ้ ---------- */
  buildControls() {
    const C = AREA.ctrl;
    this.txt(C.x + 20, C.y + 12, 'ดาวตอนนี้', { size: 15, weight: 400, color: '#5b6c9a' }).setDepth(30);
    this.starIcons = [0, 1, 2].map(i => KG.ui.icon(this, 'star', C.x + 38 + i * 46, C.y + 54, 40, 0xffb800).setDepth(30));
    this.statsTxt = this.txt(C.x + 176, C.y + 30, '', { size: 18, color: INK, width: 130 }).setDepth(30);
    this.hintBtn = new KG.ui.Button(this, C.x + C.w / 2, C.y + 114, 280, 52, { label: 'คำใบ้', icon: 'bulb', style: 'sun', size: 22, onClick: () => this.showHint() }).setDepth(30);
    this.resetBtn = new KG.ui.Button(this, C.x + C.w / 2, C.y + 168, 280, 44, { label: 'เริ่มด่านใหม่', icon: 'reset', style: 'ghost', size: 20, onClick: () => this.go('Play', this._restartData) }).setDepth(30);
  }
  refreshStats() {
    this.statsTxt.setText('พลาด ' + this.mistakes + ' ครั้ง' + String.fromCharCode(10) + 'ใช้คำใบ้ ' + this.hints + ' ครั้ง'); const pen = this.mistakes + this.hints, n = pen <= 1 ? 3 : pen <= 3 ? 2 : 1;
    this.starIcons.forEach((ic, i) => ic.setTint(i < n ? 0xffb800 : 0xc5cde6));
  }

  /* ---------- สนามเทคโน ---------- */
  buildArena() {
    const A = AREA.arena, m = this.lv.monsters[0], boss = this.lv.boss, fy = A.y + A.h - 10, hx = A.x + 84, mx = A.x + 226, WD = WORLDS[this.W - 1];
    this.heroSh = this.add.ellipse(hx, fy - 2, 78, 13, 0x1b2a6b, 0.28).setDepth(7); this.monSh = this.add.ellipse(mx, fy - 2, boss ? 112 : 88, 13, 0x1b2a6b, 0.28).setDepth(7);
    this.hero = KG.art.make(this, hx, fy, WD.hero, 'idle', 104).setDepth(8);
    this.mon = KG.art.make(this, mx, fy, 'b' + m, 0, boss ? 126 : 100).setDepth(8).setFlipX(true);
    this.tweens.add({ targets: this.hero, scaleY: this.hero.artScale * 1.025, duration: 780, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.mon, scaleY: this.mon.artScale * 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.txt(mx, A.y + 6, MON_NAME[m] || 'ตัวป่วน', { size: 14, color: '#c9202f', center: true, ox: 0.5 }).setDepth(9);
    const n = this.lv.checks.length; this.pips = [];
    for (let i = 0; i < n; i++) this.pips.push(KG.ui.icon(this, 'heart', mx + (i - (n - 1) / 2) * 20, A.y + 38, 18, 0xe0243d).setDepth(9));
  }

  /* ---------- ถาดชิ้นส่วนและแถบข้อความ ---------- */
  buildTrayAndMsg() {
    const M = AREA.msg;
    this.msgTxt = this.txt(M.x + 20, M.y + 8, '', { size: 20, color: INK, width: 760 }).setDepth(30);
    this.speakBtn = iconButton(this, M.x + M.w - 44, M.y + M.h / 2 - 2, 'sound', () => this.speak(this.msgPlain || ''), { w: 56, h: 44, depth: 30 });
  }
  setMessage(str, kind) {
    this.msgPlain = str; this.msgTxt.setText(gwrap(str, 760, '600 20px Kanit')); this.msgTxt.setColor(kind === 'bad' ? '#c9202f' : kind === 'good' ? '#13804a' : INK);
    this.msgTxt.setScale(1); const lh = this.msgTxt.displayHeight; if (lh > 44) this.msgTxt.setScale(44 / lh); this.msgTxt.y = AREA.msg.y + 6 + (44 - this.msgTxt.displayHeight) / 2 + 2;
  }
  speak(text) {
    try {
      if (!window.speechSynthesis || !text) return; window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[·›“”•]/g, ' ')); u.lang = 'th-TH'; u.rate = 0.9;
      const v = (window.speechSynthesis.getVoices() || []).find(x => /^th/i.test(x.lang)); if (v) u.voice = v; window.speechSynthesis.speak(u);
    } catch (e) { /* ไม่มีเสียงอ่านก็ไม่เป็นไร */ }
  }

  /* ---------- วาดชิ้นของทั้งหมดใหม่ตามสถานะ ---------- */
  renderItems() {
    Object.keys(this.views).forEach(id => { if (this.views[id]) this.views[id].destroy(true); }); this.views = {};
    const L = this.lv, st = this.st, trayIds = L.items.filter(i => !st.loc[i.id]).map(i => i.id);
    this.trayPos = {}; this.layoutTray(trayIds);
    trayIds.forEach(id => this.views[id] = this.makeView(this.itemOf(id), 'tray', this.trayPos[id]));
    // ชิ้นที่วางแล้ว: จัดตามชนิดของที่วาง
    L.zones.forEach(z => {
      if (z.kind === 'tray') return; const ids = L.items.filter(i => st.loc[i.id] === z.id).map(i => i.id); if (!ids.length) return; const r = this.zr[z.id];
      ids.forEach((id, k) => { const it = this.itemOf(id), pos = this.placedPos(z, r, k, ids.length); this.views[id] = this.makeView(it, pos.mode, pos); });
    });
    if (this.selItem && !this.views[this.selItem]) this.selItem = null;
    this.paintSel(); this.paintZones();
  }
  layoutTray(ids) {
    const T = AREA.tray, n = ids.length; if (!n) return; const isCard = this.lv.kind === 'order';
    if (isCard) { const cw = 210, ch = 84, cols = 4, rows = Math.ceil(n / cols), top = rows === 1 ? (T.h - ch) / 2 : 14; ids.forEach((id, i) => { const c = i % cols, r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols); this.trayPos[id] = { x: T.x + T.w / 2 - (inRow * (cw + 8) - 8) / 2 + c * (cw + 8) + cw / 2, y: T.y + top + r * (ch + 8) + ch / 2, w: cw, h: ch, mode: 'tray' }; }); return; }
    const tw = 112, th = 90, per = 7, rows = Math.ceil(n / per), perRow = Math.ceil(n / rows), off = rows === 1 ? (T.h - th) / 2 : 11;
    ids.forEach((id, i) => { const r = Math.floor(i / perRow), c = i % perRow, inRow = Math.min(perRow, n - r * perRow), x0 = T.x + T.w / 2 - (inRow * (tw + 6)) / 2 + tw / 2 + 3; this.trayPos[id] = { x: x0 + c * (tw + 6), y: T.y + off + r * (th + 4) + th / 2, w: tw, h: th, mode: 'tray' }; });
  }
  // ตำแหน่งชิ้นที่วางแล้วภายในที่วาง
  placedPos(z, r, k, n) {
    if (z.kind === 'bin' || z.kind === 'cart') {
      const cw = Math.min(r.w - 20, z.kind === 'cart' ? 214 : 176), ch = 52, cols = Math.max(1, Math.floor((r.w - 10) / (cw + 8))), top = r.y + (z.kind === 'cart' ? 70 : 82), c = k % cols, row = Math.floor(k / cols), inRow = Math.min(cols, n - row * cols);
      return { mode: 'chip', x: r.x + r.w / 2 - (inRow * (cw + 8) - 8) / 2 + c * (cw + 8) + cw / 2, y: top + row * (ch + 8) + ch / 2, w: cw, h: ch };
    }
    if (z.kind === 'port') { const g = this.zoneGfx[z.id]; return { mode: 'tag', x: r.x + r.w / 2, y: g.top + g.sz[1] + 78, w: Math.min(r.w - 4, 108), h: 56 }; }
    if (z.kind === 'slot') return { mode: 'slot', x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w, h: r.h };
    if (z.kind === 'step') return { mode: 'row', x: r.x + r.w / 2 + 22, y: r.y + r.h / 2, w: r.w - 52, h: r.h - 6 };
    return { mode: 'chip', x: r.x + r.w / 2, y: r.y + r.h / 2, w: 150, h: 52 };
  }
  // ตัวชิ้นของหนึ่งชิ้นตามโหมด: tray (หกเหลี่ยมหรือการ์ด) · chip · tag · slot · row
  makeView(it, mode, pos) {
    const c = this.add.container(pos.x, pos.y).setDepth(10), isStep = !it.dev, w = pos.w, h = pos.h; c.item = it; c.mode = mode; c.box = { x: pos.x - w / 2, y: pos.y - h / 2, w, h };
    if (mode === 'tray' && !isStep) {
      const img = this.add.image(-(w / 2 + 6), -(h / 2 + 4), hexTile(this, w, h, 'normal')).setOrigin(0, 0).setDisplaySize(w + 12, h + 16); c.add(img); c.bg = img;
      const plugTile = ['plug', 'fix'].includes(this.lv.kind) && it.f.port;
      c.add(this.add.image(plugTile ? -10 : 0, -17, PTI.tex(this, it.ic, 96)).setDisplaySize(44, 44));
      const lb = nameLabel(this, it.n, w - 26, 13); lb.setPosition(0, 8); c.add(lb);
      if (plugTile) { c.add(this.add.circle(w / 2 - 28, -h / 2 + 24, 15, 0xffffff).setStrokeStyle(2.5, 0x2b3f9c)); c.add(this.add.image(w / 2 - 28, -h / 2 + 24, PTI.tex(this, { power: 'plug-power', hdmi: 'plug-hdmi', usb: 'plug-usb', audio: 'plug-audio', mic: 'plug-mic', lan: 'plug-lan' }[it.f.port], 48)).setDisplaySize(24, 24)); }
    } else if (isStep) {
      const img = this.add.image(-(w / 2 + 6), -(h / 2 + 4), cardTex(this, w, h, 'normal')).setOrigin(0, 0).setDisplaySize(w + 12, h + 14); c.add(img); c.bg = img;
      const t = KG.txt(this, 6, 0, gwrap(it.n, w - 44, '600 17px Kanit'), { size: 17, color: INK, center: true, ox: 0.5, oy: 0.5 }); t.setLineSpacing(-2); if (t.displayHeight > h - 10) t.setScale((h - 10) / t.displayHeight); c.add(t);
      if (mode === 'row') { t.setX(0); const ww = w - 24; fitW(t, ww); }
    } else if (mode === 'chip' || mode === 'tag') {
      const tag = mode === 'tag', img = this.add.image(-(w / 2 + 5), -(h / 2 + 4), chipTex(this, w, h, tag ? '#e4f1ff' : '#dff0ff')).setOrigin(0, 0).setDisplaySize(w + 10, h + 12); c.add(img); c.bg = img;
      c.add(this.add.image(-w / 2 + (tag ? 24 : 30), 0, PTI.tex(this, it.ic, 96)).setDisplaySize(tag ? 34 : 38, tag ? 34 : 38));
      const lb = KG.txt(this, (tag ? 16 : 22), 0, gwrap(it.n, w - (tag ? 56 : 64), '600 ' + (tag ? 13 : 15) + 'px Kanit'), { size: tag ? 13 : 15, color: INK, center: true, ox: 0.5, oy: 0.5 }); lb.setLineSpacing(-3);
      if (lb.displayHeight > h - 8) lb.setScale((h - 8) / lb.displayHeight); c.add(lb);
    } else if (mode === 'slot') {
      const lab = 22, ch = h - lab, sz = Math.min(ch - 2, 84), cy = lab / 2 + 1;   // ชื่อ/คำบอกหน้าที่ของช่องอยู่แถบบน ชิ้นที่ใส่แล้วอยู่ใต้แถบนั้น
      c.add(this.add.image(-w / 2 + sz / 2 + 12, cy, PTI.tex(this, it.ic, 96)).setDisplaySize(sz, sz));
      const lb = KG.txt(this, -w / 2 + sz + 22, cy, gwrap(it.n, w - sz - 40, '600 17px Kanit'), { size: 17, color: INK, ox: 0, oy: 0.5 }); lb.setLineSpacing(-2); if (lb.displayHeight > ch - 4) lb.setScale((ch - 4) / lb.displayHeight); c.add(lb);
    }
    // โซนจับการแตะ/ลาก
    const z = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true }); c.add(z); c.hit = z;
    z.on('pointerdown', p => this.itemDown(it.id, p));
    z.on('pointerover', () => { if (!this.drag && c.bg && mode !== 'slot' && this.selItem !== it.id && !this.hlItem(it.id)) this.restyle(c, 'hover'); });
    z.on('pointerout', () => { if (!this.drag && c.bg) this.restyle(c, this.selItem === it.id ? 'sel' : 'normal'); });
    if (this.drag && this.drag.id === it.id) c.setAlpha(0.35);
    return c;
  }
  hlItem(id) { return this.hl && this.hl.item === id; }
  // เปลี่ยนสไตล์พื้นหลังชิ้น (ปกติ/ชี้/เลือก/ใบ้)
  restyle(c, state) {
    if (!c.bg || !c.bg.scene) return; const it = c.item, w = c.box.w, h = c.box.h;
    if (c.mode === 'tray' && it.dev) c.bg.setTexture(hexTile(this, w, h, state)); else if (!it.dev && (c.mode === 'tray' || c.mode === 'row')) c.bg.setTexture(cardTex(this, w, h, state));
    else if (c.mode === 'chip' || c.mode === 'tag') c.bg.setTexture(chipTex(this, w, h, state === 'sel' ? '#ffe27a' : state === 'hint' ? '#ffb87a' : state === 'hover' ? '#cfeee6' : '#dff0ff'));
  }
  paintSel() { Object.keys(this.views).forEach(id => { const c = this.views[id]; if (c) this.restyle(c, this.selItem === id ? 'sel' : this.hlItem(id) ? 'hint' : 'normal'); }); }
  // ที่วางที่ว่างอยู่แต่มีสิ่งที่ถูกเลือกไว้: ไฮไลต์เบา ๆ ให้รู้ว่าแตะวางได้
  paintZones() {
    const sel = this.selItem && this.itemOf(this.selItem);
    this.lv.zones.forEach(z => {
      if (z.kind === 'tray' || !this.zoneGfx[z.id]) return; const ok = !!sel && PT.canDrop(this.lv, this.st, sel.id, z.id).ok; this.styleZone(z.id, ok ? 'hl' : 'normal');
    });
  }
  styleZone(id, mode) {
    const g = this.zoneGfx[id], z = this.zoneOf(id); if (!g || !z) return;
    if (z.kind === 'bin' || z.kind === 'cart') g.img.setTexture(binTex(this, g.w, g.h, g.color, mode === 'hl' ? 'hl' : 'normal'));
    else if (z.kind === 'port') g.sg.setTexture(socketTex(this, g.kind, g.sz[0], g.sz[1], mode === 'hl' ? 'hl' : 'normal'));
    else if (g.gr) this.drawSlot(id, mode === 'hl' ? 'hl' : 'normal');
  }
}
const PT_LV_SEQ = key => window.PT_LV.SEQS[key] || window.PT_LV.SEQS.assemble;
