/* ===== สมบัติพลังบวก (นักล่าพลังบวก): RunEng เกมวิ่งกระโดดข้ามฉาก (ฟิสิกส์เขียนเองแบบเบา ไม่ใช้ Arcade) =====
   โลกกว้างเลื่อนตามผู้เล่น · พื้นเป็นช่วง ๆ (เว้นหลุม) · แท่นลอย (ยืนได้จากด้านบน) · หนาม · เจ้าตัวเมือก (เหยียบหัวเพื่อกำจัด) · เหรียญ + · ประตูโจทย์
   ประตูโจทย์: ลูกพลังคำตอบวางกระจายบนพื้น/แท่นลอย เก็บอันที่ถูก = ประตูพลังเปิดและเดินต่อได้ · เก็บผิด = ลูกแตก เสียหัวใจ 1 และนับว่าพลาด · ครบทุกประตูแล้วเปิดหีบสมบัติที่ปลายทาง = ผ่านด่าน
   ปุ่ม: ลูกศรซ้าย/ขวา หรือ A D เดิน · Space ลูกศรขึ้น W กระโดด · จอสัมผัส: ปุ่มบนจอ (ซ้าย ขวา กระโดด)
   สำหรับทดสอบ: this.player this.gates this.enemies this.hearts this.auto (บอทเล่นเอง) */
const RN_GROUND = 600, RN_G = 2300, RN_JUMP = 860, RN_SPEED = 340;
class RunEng {
  constructor(s, p) {
    this.s = s; this.p = Object.assign({ gates: 3, hearts: 5, pits: 0, spikes: 0, enemies: 0, coins: 6, q: { k: 'addsub', op: '+', lo: 1, hi: 5, max: 10, opts: 3 } }, p); this.R = s.R; this.alive = true; this.running = false; this.objs = [];
    this.hearts = this.p.hearts; this.maxHearts = this.p.hearts; this.cleared = 0; this.keys = {}; this.touch = {}; this.invul = 0; this.stats = { hits: 0, stomps: 0, coins: 0, falls: 0, wrong: 0 }; this.auto = false; this.over = false;
    s.setGoal(this.p.gates); this.buildLevel(); this.buildHud(); this.bindInput(); this.lastCard = -1;
  }
  start() { this.running = true; this.showQuestion(0); }
  stop() { this.running = false; }
  destroy() { this.alive = false; this.running = false; this.s.input.keyboard.off('keydown', this.kd); this.s.input.keyboard.off('keyup', this.ku); }
  add(o) { this.objs.push(o); this.W.add(o); return o; }
  /* ---------- สร้างด่าน ---------- */
  buildLevel() {
    const s = this.s, P = this.p, R = this.R, W = this.W = s.add.container(0, 0).setDepth(6), col = s.W.color, gates = [], grounds = [], plats = [], spikes = [], enemies = [], coins = [], pits = [];
    let x = 0; const seg = (x0, x1) => { grounds.push({ x0, x1 }); };
    // วางอุปสรรคให้กระจายตามจำนวนประตู
    const spread = n => { const a = Array(P.gates).fill(0); for (let i = 0; i < n; i++) a[Math.floor(R() * P.gates)]++; return a; }, pp = spread(P.pits), sp = spread(P.spikes), en = spread(P.enemies);
    seg(-300, 900); x = 900;
    for (let g = 0; g < P.gates; g++) {
      // ช่วงเดินเข้าหาประตู: อุปสรรคเรียงตามลำดับ (หลุม หนาม ศัตรู) เว้นระยะเท่า ๆ กัน
      const obs = []; for (let i = 0; i < pp[g]; i++) obs.push('pit'); for (let i = 0; i < sp[g]; i++) obs.push('spike'); for (let i = 0; i < en[g]; i++) obs.push('enemy'); obs.sort(() => R() - 0.5);
      const approach = 520 + obs.length * 330; let cx = x;
      obs.forEach(kind => {
        const gx = cx + 240; seg(cx, gx);
        if (kind === 'pit') { const gap = 120 + Math.floor(R() * 60); pits.push({ x0: gx, x1: gx + gap }); cx = gx + gap; }
        else if (kind === 'spike') { spikes.push({ x: gx, w: 56 }); seg(gx, gx + 90); cx = gx + 90; }
        else { enemies.push({ x: gx, y: RN_GROUND, x0: gx - 110, x1: gx + 110, vx: (R() < 0.5 ? -1 : 1) * (60 + R() * 30), alive: true }); seg(gx, gx + 150); cx = gx + 150; }
        for (let k = 0; k < 2; k++) if (R() < 0.7) coins.push({ x: gx - 30 + k * 60, y: RN_GROUND - 200 + (kind === 'pit' ? -30 : 0) });
      });
      // ช่วงประตู
      const nOpt = P.q.opts || 3, zoneW = 420 + nOpt * 150, zx0 = Math.max(cx, x) + 160; if (cx < zx0) { seg(cx, zx0); cx = zx0; }
      const q = MKS.make(R, P.q), opts = q.opts.slice(0, nOpt); if (opts.indexOf(q.ans) < 0) opts[Math.floor(R() * opts.length)] = q.ans; const orbs = [], shuffled = MKS.shuf(R, opts), heights = MKS.shuf(R, [0, 1, 0, 1, 0]).slice(0, nOpt);
      if (heights.indexOf(1) < 0) heights[Math.floor(R() * nOpt)] = 1;
      shuffled.forEach((v, i) => {
        const ox = zx0 + 130 + i * 150, hi = heights[i] === 1; if (hi) plats.push({ x: ox - 60, y: RN_GROUND - 130, w: 120 });
        orbs.push({ x: ox, y: hi ? RN_GROUND - 130 - 62 : RN_GROUND - 66, v, right: v === q.ans, taken: false });
      });
      seg(cx, zx0 + zoneW); const doorX = zx0 + zoneW - 40; gates.push({ q, orbs, zx0, doorX, cleared: false, door: null, x0: Math.max(x, cx - approach) }); x = zx0 + zoneW;
      if (g < P.gates - 1) { /* ต่อด้วยพื้นช่วงถัดไป */ }
    }
    seg(x, x + 800); this.endX = x + 560; this.worldW = x + 800; this.grounds = grounds; this.plats = plats; this.spikes = spikes; this.enemies = enemies; this.coins = coins; this.gates = gates; this.pits = pits;
    this.drawWorld(col);
    // ผู้เล่น
    this.pl = { x: 160, y: RN_GROUND, vx: 0, vy: 0, on: true, face: 1, coyote: 0, buffer: 0, w: 44, h: 112 }; this.checkX = 160; this.pimg = s.add.image(160, RN_GROUND, 'pose_ready').setOrigin(0.5, 1).setDepth(7); this.W.add(this.pimg); this.setPose('ready');
    this.camX = 0; this.worldBg();
  }
  worldBg() {
    const s = this.s, key = s.textures.exists('bg_islands') ? 'bg_islands' : 'bg_sky'; this.bgs = []; const T = s.textures.get(key), src = T.getSourceImage(); if (!T.has('rncrop')) T.add('rncrop', 0, 3, 0, src.width - 6, src.height);   // ตัดขอบภาพข้างละ 3 พิกเซล (ขอบสว่างทำให้เห็นเส้นรอยต่อ)
    const sc = Math.max(GW / (src.width - 6), GH / src.height) * 1.04, w = (src.width - 6) * sc;
    this.bgW = Math.floor(w) - 3; for (let i = 0; i < 4; i++) { const im = s.add.image(i * this.bgW, 0, key, 'rncrop').setOrigin(0, 0).setScale(sc).setDepth(-9).setFlipX(i % 2 === 1); this.bgs.push(im); } s.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.18).setDepth(-8);
  }
  setPose(n) { if (this.pose === n || !this.s.textures.exists('pose_' + n)) return; this.pose = n; this.pimg.setTexture('pose_' + n); this.pimg.setScale(142 / this.pimg.height); }
  drawWorld(col) {
    const s = this.s, K = KG.kit, g = this.add(s.add.graphics()), rgb = str => { const v = str.match(/\d+/g).map(Number); return (v[0] << 16) | (v[1] << 8) | v[2]; }, dark = rgb(K.shade(col, 0.5)), mid = rgb(K.shade(col, 0.8)), light = rgb(K.shade(col, 1.2));
    this.grounds.forEach(sg => { const w = sg.x1 - sg.x0; g.fillStyle(0x6b4a2a, 1); g.fillRect(sg.x0, RN_GROUND, w, 260); g.fillStyle(0x84603a, 1); for (let i = 0; i < w; i += 70) g.fillRect(sg.x0 + i, RN_GROUND + 26 + (i % 140 ? 40 : 0), 34, 18); g.fillStyle(0x2d2a5e, 1); g.fillRect(sg.x0, RN_GROUND - 3, w, 5); g.fillStyle(mid, 1); g.fillRect(sg.x0, RN_GROUND, w, 18); g.fillStyle(light, 1); g.fillRect(sg.x0, RN_GROUND, w, 7); g.fillStyle(dark, 1); for (let i = 0; i < w; i += 26) g.fillTriangle(sg.x0 + i, RN_GROUND + 18, sg.x0 + i + 13, RN_GROUND + 18, sg.x0 + i + 6, RN_GROUND + 28); });
    this.plats.forEach(p => { g.fillStyle(0x2d2a5e, 0.25); g.fillRoundedRect(p.x + 4, p.y + 8, p.w, 28, 8); g.fillStyle(0x8a8fa8, 1); g.fillRoundedRect(p.x, p.y, p.w, 28, 8); g.fillStyle(mid, 1); g.fillRoundedRect(p.x, p.y, p.w, 12, { tl: 8, tr: 8, bl: 0, br: 0 }); g.lineStyle(3, 0x2d2a5e, 1); g.strokeRoundedRect(p.x, p.y, p.w, 28, 8); });
    this.spikes.forEach(sp => { const n = Math.round(sp.w / 28); for (let i = 0; i < n; i++) { const x0 = sp.x + i * 28; g.fillStyle(0xd7dbea, 1); g.fillTriangle(x0, RN_GROUND, x0 + 28, RN_GROUND, x0 + 14, RN_GROUND - 34); g.lineStyle(3, 0x2d2a5e, 1); g.strokeTriangle(x0, RN_GROUND, x0 + 28, RN_GROUND, x0 + 14, RN_GROUND - 34); g.fillStyle(0xe0243d, 1); g.fillTriangle(x0 + 8, RN_GROUND - 20, x0 + 20, RN_GROUND - 20, x0 + 14, RN_GROUND - 34); } });
    // ประตูพลัง + ป้ายโจทย์ + ลูกพลังคำตอบ
    this.gates.forEach((gt, gi) => {
      const door = s.add.rectangle(gt.doorX, RN_GROUND - 190, 40, 380, 0x7fe0ff, 0.6).setOrigin(0.5, 0.5); door.setStrokeStyle(6, 0xffffff, 0.95); this.add(door); s.tweens.add({ targets: door, alpha: 0.9, duration: 500, yoyo: true, repeat: -1 }); gt.door = door;
      const sign = this.add(s.add.container(gt.zx0 + 130 + (gt.orbs.length - 1) * 75, RN_GROUND - 300)); const t = KG.txt(s, 0, 0, gt.q.kind === 'story' ? 'ประตู ' + (gi + 1) : gt.q.text, { size: gt.q.text.length > 12 ? 34 : 44, color: '#2d2a5e', center: true, middle: true });
      const w = Math.max(190, t.width + 44); sign.add(KG.ui.panel(s, -w / 2, -34, w, 68, { accent: '#ffc400', cuts: [12, 0, 12, 0], glow: false, alpha: 1 })); sign.add(t); s.tweens.add({ targets: sign, y: sign.y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); gt.sign = sign;
      gt.orbs.forEach((o, i) => { const c = this.add(s.add.container(o.x, o.y)), colr = ['#3d8bff', '#ff9a2e', '#8a5cf0', '#ff5a8a', '#18b8a0'][i % 5]; const im = s.add.image(0, 0, this.orbTex(colr)).setDisplaySize(86, 86), t2 = KG.txt(s, 0, -2, MKS.comma(o.v), { size: String(MKS.comma(o.v)).length > 3 ? 26 : 34, color: '#ffffff', center: true, middle: true, stroke: K.shade(colr, 0.45), sw: 5 }); c.add([im, t2]); o.g = c; s.tweens.add({ targets: c, y: o.y - 8, duration: 700 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); });
    });
    this.coins.forEach(c => { const m = this.add(s.add.container(c.x, c.y)); m.add(s.add.image(0, 0, this.coinTex()).setDisplaySize(40, 40)); c.g = m; c.taken = false; s.tweens.add({ targets: m, y: c.y - 6, duration: 600, yoyo: true, repeat: -1, delay: Math.random() * 400 }); });
    this.enemies.forEach(e => { const m = this.add(s.add.image(e.x, e.y, this.slimeTex()).setOrigin(0.5, 1).setDisplaySize(72, 56)); e.g = m; s.tweens.add({ targets: m, scaleY: m.scaleY * 0.9, duration: 260, yoyo: true, repeat: -1 }); });
    // หีบสมบัติปลายทาง
    this.chest = this.add(s.add.image(this.endX, RN_GROUND, this.chestTex(false)).setOrigin(0.5, 1).setDisplaySize(130, 112)); this.chestLock = this.add(KG.ui.icon(s, 'lock', this.endX, RN_GROUND - 130, 40, 0xd4900a)); this.chestOpen = false;
    this.add(s.add.rectangle(-320, 400, 6, 800, 0xffffff, 0));
  }
  orbTex(colr) { const K = KG.kit; return KG.tex(this.s, 'rnorb|' + colr, 100, 100, c => { c.beginPath(); c.arc(50, 54, 40, 0, 7); c.fillStyle = 'rgba(45,42,94,.25)'; c.fill(); c.beginPath(); c.arc(50, 50, 40, 0, 7); c.fillStyle = KG.ui.lin(c, 0, 10, 0, 90, [[0, K.shade(colr, 1.3)], [1, K.shade(colr, 0.85)]]); c.fill(); c.lineWidth = 5; c.strokeStyle = '#2d2a5e'; c.stroke(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(36, 30, 14, 8, -0.5, 0, 7); c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(50, 50, 46, 0, 7); c.stroke(); }); }
  coinTex() { return KG.tex(this.s, 'rncoin', 48, 48, c => { c.beginPath(); c.arc(24, 24, 20, 0, 7); c.fillStyle = '#ffc82e'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; c.stroke(); c.fillStyle = '#fff5b0'; c.fillRect(21, 11, 6, 26); c.fillRect(11, 21, 26, 6); }); }
  slimeTex() { return KG.tex(this.s, 'rnslime', 80, 64, c => { c.beginPath(); c.moveTo(6, 58); c.bezierCurveTo(2, 26, 24, 6, 40, 6); c.bezierCurveTo(58, 6, 78, 26, 74, 58); c.closePath(); c.fillStyle = KG.ui.lin(c, 0, 6, 0, 58, [[0, '#c8ffa8'], [1, '#3fbf6a']]); c.fill(); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; c.stroke(); [[28, 32], [52, 32]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 9, 0, 7); c.fillStyle = '#fff'; c.fill(); c.stroke(); c.beginPath(); c.arc(p[0] + 2, p[1] + 1, 4, 0, 7); c.fillStyle = '#111'; c.fill(); }); c.beginPath(); c.arc(40, 46, 7, 0.1, Math.PI - 0.1); c.lineWidth = 3; c.stroke(); }); }
  chestTex(open) { return KG.tex(this.s, 'rnchest|' + open, 140, 120, c => { c.fillStyle = '#8a4a1a'; KG.ui.rrect(c, 12, 50, 116, 62, 8); c.fill(); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; c.stroke(); c.fillStyle = '#b36a2a'; if (open) { c.save(); c.translate(70, 54); c.rotate(-0.9); KG.ui.rrect(c, -58, -44, 116, 44, 8); c.fill(); c.stroke(); c.restore(); c.fillStyle = '#ffe28a'; c.beginPath(); c.ellipse(70, 52, 48, 12, 0, 0, 7); c.fill(); [[40, 40], [70, 32], [100, 40], [55, 28], [85, 28]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 9, 0, 7); c.fillStyle = '#ffc82e'; c.fill(); c.stroke(); }); } else { KG.ui.rrect(c, 12, 18, 116, 44, 8); c.fill(); c.stroke(); } c.fillStyle = '#ffc82e'; c.fillRect(60, 50, 20, 22); c.strokeRect(60, 50, 20, 22); c.fillRect(12, 56, 116, 8); }); }
  /* ---------- HUD บนจอ: หัวใจ ปุ่มสัมผัส ---------- */
  buildHud() {
    const s = this.s; this.heartIcons = []; for (let i = 0; i < this.maxHearts; i++) { const h = KG.ui.icon(s, 'heart', 38 + i * 36, 112, 30, 0xe0243d).setDepth(26); this.heartIcons.push(h); }
    const mk = (x, y, icon, key, r) => { const g = s.add.graphics().setDepth(40).setAlpha(0.7); g.fillStyle(0xffffff, 0.75); g.fillCircle(x, y, r); g.lineStyle(5, 0x2d2a5e, 0.9); g.strokeCircle(x, y, r); const ic = KG.ui.icon(s, icon, x, y, r * 1.1, 0x2d2a5e).setDepth(41); const z = s.add.zone(x, y, r * 2.4, r * 2.4).setInteractive().setDepth(42);
      z.on('pointerdown', () => { this.touch[key] = true; g.setAlpha(1); if (key === 'jump') this.pl.buffer = 0.14; }); const up = () => { this.touch[key] = false; g.setAlpha(0.7); }; z.on('pointerup', up); z.on('pointerout', up); z.on('pointerupoutside', up); this.objsHud = (this.objsHud || []).concat([g, ic, z]); };
    s.input.addPointer(2); mk(300, 636, 'chevL', 'left', 48); mk(430, 636, 'chevR', 'right', 48); mk(1170, 636, 'chevU', 'jump', 56);
  }
  bindInput() {
    const s = this.s; this.kd = e => { this.keys[e.code] = true; if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !e.repeat) this.pl.buffer = 0.14; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) >= 0) { try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } } }; this.ku = e => { this.keys[e.code] = false; };
    s.input.keyboard.on('keydown', this.kd); s.input.keyboard.on('keyup', this.ku);
  }
  dir() { if (this.auto) return this.autoDir || 0; const K = this.keys, T = this.touch; return ((K.ArrowRight || K.KeyD || T.right) ? 1 : 0) - ((K.ArrowLeft || K.KeyA || T.left) ? 1 : 0); }
  jumpHeld() { const K = this.keys; return !!(K.Space || K.ArrowUp || K.KeyW || this.touch.jump || this.autoJump); }
  /* ---------- คำถามบนการ์ดด้านบน ---------- */
  showQuestion(gi) {
    const gt = this.gates[gi]; if (!gt || this.lastCard === gi) return; this.lastCard = gi; const q = gt.q; this.s.setCard('ประตู ' + (gi + 1) + '/' + this.gates.length + ': ' + q.text + (q.kind === 'story' ? '' : ''), { say: q.spoken, w: 760, size: q.kind === 'story' ? 21 : 26 }); if (this.running) KG.kit.voice.say(q.spoken);
  }
  curGate() { return this.gates.findIndex(g => !g.cleared); }
  /* ---------- วงจรเกมต่อเฟรม ---------- */
  update(t, dtms) {
    if (!this.running || this.over) return; const dt = Math.min(0.033, dtms / 1000), pl = this.pl, s = this.s;
    if (this.auto) this.autoPlay();
    const d = this.dir(); pl.vx += (d * RN_SPEED - pl.vx) * Math.min(1, dt * (pl.on ? 14 : 7)); if (d) pl.face = d;
    pl.buffer = Math.max(0, pl.buffer - dt); pl.coyote = pl.on ? 0.1 : Math.max(0, pl.coyote - dt);
    if (pl.buffer > 0 && (pl.on || pl.coyote > 0)) { pl.vy = -RN_JUMP; pl.on = false; pl.coyote = 0; pl.buffer = 0; KG.audio.play('jump'); this.s.tweens.add({ targets: this.pimg, scaleY: this.pimg.scaleY * 1.12, duration: 90, yoyo: true }); }
    if (!this.jumpHeld() && pl.vy < -260) pl.vy += 3600 * dt;   // ปล่อยปุ่ม: กระโดดเตี้ยลง
    const px = pl.x, py = pl.y; pl.vy += RN_G * dt; pl.x += pl.vx * dt; pl.y += pl.vy * dt; pl.on = false;
    // ขอบซ้าย + ประตูพลัง (กำแพงจนกว่าจะเก็บคำตอบ)
    if (pl.x < 40) { pl.x = 40; pl.vx = 0; } const cg = this.curGate(); if (cg >= 0) { const dx = this.gates[cg].doorX - 22; if (pl.x > dx) { pl.x = dx; pl.vx = 0; } }
    const fx0 = pl.x - 12, fx1 = pl.x + 12;   // ส่วนเท้าที่ใช้ยืน
    if (pl.vy >= 0) {
      let top = null; this.grounds.forEach(sg => { if (fx1 > sg.x0 && fx0 < sg.x1 && py <= RN_GROUND + 6 && pl.y >= RN_GROUND) top = RN_GROUND; });
      this.plats.forEach(p => { if (fx1 > p.x && fx0 < p.x + p.w && py <= p.y + 6 && pl.y >= p.y && (top == null || p.y < top)) top = p.y; });
      if (top != null) { pl.y = top; if (pl.vy > 300 && !pl.landed) { /* ฝุ่นตอนลงพื้น */ KG.fx.burst(s, pl.x - this.camX, top, { colors: [0xffffff, 0xe8d9a8], n: 6, max: 140, depth: 60, life: 360 }); } pl.vy = 0; pl.on = true; }
    }
    if (pl.y > 900) { this.fall(); return; }
    this.invul = Math.max(0, this.invul - dt); this.pimg.setAlpha(this.invul > 0 ? (Math.floor(this.invul * 14) % 2 ? 0.35 : 1) : 1);
    // ท่าทาง
    if (!pl.on) this.setPose(pl.vy < 0 ? 'jump' : 'land'); else if (Math.abs(pl.vx) > 60) { this.runT = (this.runT || 0) + dt; this.setPose(Math.floor(this.runT * 8) % 2 ? 'runR' : 'ready'); } else this.setPose('ready');
    this.pimg.setPosition(pl.x, pl.y); this.pimg.setFlipX(pl.face < 0 && this.pose !== 'ready' ? true : pl.face < 0);
    this.stepEnemies(dt); this.checkHits(); this.checkGateZone();
    // กล้อง
    const target = Math.max(0, Math.min(this.worldW - GW, pl.x - 420)); this.camX += (target - this.camX) * Math.min(1, dt * 7); this.W.x = -this.camX; const off = Math.round((this.camX * 0.22) % (this.bgW * 2)); this.bgs.forEach((b, i) => { b.x = i * this.bgW - off; });   // ตำแหน่งเป็นจำนวนเต็มและซ้อนกัน 3 พิกเซล ไม่ให้เห็นรอยต่อ
  }
  stepEnemies(dt) { this.enemies.forEach(e => { if (!e.alive) return; e.x += e.vx * dt; if (e.x < e.x0 || e.x > e.x1) { e.vx = -e.vx; e.x = Math.max(e.x0, Math.min(e.x1, e.x)); } e.g.x = e.x; e.g.setFlipX(e.vx > 0); }); }
  hurt(why) {
    if (this.invul > 0 || this.over) return; const s = this.s, pl = this.pl; this.hearts--; this.stats.hits++; this.invul = 1.3; pl.vy = -460; pl.vx = -pl.face * 240; KG.audio.play('wrong'); KG.fx.shake(s, 140, 0.004); s.coach.react('bad', why || 'โอ๊ย!'); this.updateHearts();
    KG.fx.pop(s, pl.x - this.camX, pl.y - 120, '−1', { size: 34, color: '#e0243d', depth: 80 }); if (this.hearts <= 0) this.lose();
  }
  lose() { this.over = true; this.running = false; this.s.lose('หัวใจหมดแล้ว'); }
  fall() { const s = this.s, pl = this.pl; this.stats.falls++; this.hearts--; this.updateHearts(); KG.audio.play('wrong'); KG.fx.shake(s, 160, 0.005); if (this.hearts <= 0) { this.lose(); return; } const gx = this.safeX(this.checkX); pl.x = gx; pl.y = RN_GROUND - 400; pl.vx = 0; pl.vy = 0; this.invul = 1.6; this.pimg.setPosition(pl.x, pl.y); s.coach.react('bad', 'ตกหลุม! ลองใหม่'); }
  safeX(x) { let best = null, bd = 1e9; this.grounds.forEach(sg => { const lo = sg.x0 + 60, hi = sg.x1 - 60; if (hi < lo) return; const cx = Math.max(lo, Math.min(hi, x)), d = Math.abs(cx - x); if (d < bd) { bd = d; best = cx; } }); return best == null ? 160 : best; }
  updateHearts() { this.heartIcons.forEach((h, i) => { h.setTint ? h.setTint(i < this.hearts ? 0xe0243d : 0x9aa6d8) : null; h.setAlpha(i < this.hearts ? 1 : 0.4); }); }
  checkHits() {
    const pl = this.pl, s = this.s, bx0 = pl.x - 20, bx1 = pl.x + 20, by0 = pl.y - 108, by1 = pl.y;
    this.spikes.forEach(sp => { if (bx1 > sp.x + 6 && bx0 < sp.x + sp.w - 6 && by1 > RN_GROUND - 28) this.hurt('หนามแหลม!'); });
    this.enemies.forEach(e => {
      if (!e.alive) return; const ex0 = e.x - 32, ex1 = e.x + 32, ey0 = e.y - 52, ey1 = e.y; if (bx1 > ex0 && bx0 < ex1 && by1 > ey0 && by0 < ey1) {
        if (pl.vy > 120 && by1 < ey0 + 30) { e.alive = false; pl.vy = -560; this.stats.stomps++; s.score += 15; s.refreshPips(); KG.audio.play('kill'); KG.kit.stars(s, e.x - this.camX, e.y - 30, [0x9bf0a8, 0xffffff, 0xffd34f], 12); s.tweens.add({ targets: e.g, scaleY: 0.1, alpha: 0, duration: 200, onComplete: () => e.g.destroy() }); }
        else this.hurt('โดนเจ้าตัวเมือก!');
      }
    });
    this.coins.forEach(c => { if (!c.taken && Math.abs(c.x - pl.x) < 40 && Math.abs(c.y - (pl.y - 60)) < 70) { c.taken = true; this.stats.coins++; s.score += 5; s.refreshPips(); KG.audio.play('coin'); KG.kit.stars(s, c.x - this.camX, c.y, [0xffd34f, 0xffffff], 8); c.g.destroy(); } });
    const g = this.curGate(); if (g >= 0) this.gates[g].orbs.forEach(o => { if (o.taken) return; const cx = Math.max(bx0, Math.min(bx1, o.x)), cy = Math.max(by0 + 10, Math.min(by1, o.y)); if (Math.hypot(o.x - cx, o.y - cy) < 38) this.takeOrb(this.gates[g], g, o); });
    if (g < 0 && Math.abs(pl.x - this.endX) < 70 && !this.chestOpen) this.openChest();
  }
  takeOrb(gt, gi, o) {
    const s = this.s, pl = this.pl; o.taken = true; const wx = o.x - this.camX, wy = o.y;
    if (o.right) {
      gt.cleared = true; this.cleared++; KG.audio.play('chest'); gt.orbs.forEach(x => { if (x !== o && x.g) s.tweens.add({ targets: x.g, alpha: 0, scale: 0.2, duration: 300, onComplete: () => x.g.destroy() }); }); s.tweens.add({ targets: o.g, scale: 2.2, alpha: 0, duration: 420, onComplete: () => o.g.destroy() });
      s.tweens.add({ targets: gt.door, scaleY: 0, alpha: 0, duration: 500, onComplete: () => gt.door.destroy() }); KG.kit.ripple(s, wx, wy, 0x7fe0ff); KG.fx.burst(s, wx, wy, { colors: [0x7fe0ff, 0xffd34f, 0xffffff], n: 28, max: 420, tex: 'fx_star', rot: true, depth: 70 }); this.checkX = gt.doorX + 90; s.ok(wx, wy - 40, { delay: 3600000 }); this.showNext(gi + 1);
    } else { this.stats.wrong++; if (o.g) { KG.kit.stars(s, wx, wy, [0xff4d5e, 0xffffff], 10); s.tweens.add({ targets: o.g, scale: 0, alpha: 0, duration: 200, onComplete: () => o.g.destroy() }); } s.bad(wx, wy - 40, 'ยังไม่ใช่!'); this.hurt('ผิดนะ ลองอีกที'); void pl; }
  }
  showNext(gi) { if (gi < this.gates.length) this.s.time.delayedCall(600, () => { this.showQuestion(gi); }); else this.s.setCard('เปิดหีบสมบัติที่ปลายทางเลย!', { say: 'เปิดหีบสมบัติที่ปลายทางเลย', w: 700 }); }
  checkGateZone() { const g = this.curGate(); if (g >= 0 && this.pl.x > this.gates[g].x0 - 100) this.showQuestion(g); }
  openChest() {
    const s = this.s; this.chestOpen = true; this.over = true; this.running = false; this.chest.setTexture(this.chestTex(true)); this.chestLock.destroy(); KG.audio.play('chest'); KG.fx.burst(s, this.endX - this.camX, RN_GROUND - 80, { colors: [0xffd34f, 0xffffff, 0xff7ab8], n: 50, max: 600, tex: 'fx_star', rot: true, depth: 70 });
    s.time.delayedCall(900, () => s.win());
  }
  /* ---------- บอทสำหรับทดสอบ: วิ่งขวา กระโดดเมื่อเจออุปสรรค และไปเก็บลูกพลังที่ถูก ---------- */
  autoPlay() {
    const pl = this.pl, g = this.curGate(); this.autoDir = 1; let jump = false;
    const ahead = x0 => this.grounds.some(sg => pl.x + x0 >= sg.x0 && pl.x + x0 <= sg.x1);
    if (pl.on) { if (!ahead(42)) jump = true; this.spikes.forEach(sp => { if (sp.x - pl.x > -30 && sp.x - pl.x < 140) jump = true; }); this.enemies.forEach(e => { if (e.alive && Math.abs(e.x - pl.x) < 150 && e.x - pl.x > -70) jump = true; }); }
    if (g >= 0) { const gt = this.gates[g]; if (pl.x > gt.zx0 - 40) { const o = gt.orbs.find(z => z.right && !z.taken); if (o) { pl.x = o.x; const pf = this.plats.find(p => o.x >= p.x && o.x <= p.x + p.w); pl.y = pf ? pf.y : RN_GROUND; pl.vy = 0; pl.vx = 0; jump = false; } } }
    if (jump) { pl.buffer = 0.14; this.autoJump = true; } else this.autoJump = !pl.on && pl.vy < 0;
  }
}
