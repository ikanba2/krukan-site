/* ===== ตัวเกม 'สนามเป้า' ของผจญภัยเมาส์ (เลื่อน · คลิกซ้าย · ดับเบิลคลิก · คลิกขวา · เมนูคลิกขวา · ซ้ายสลับขวา) =====
   พารามิเตอร์ p: act (hover|click|dbl|right|menu|lr) · look (star|balloon|chest|lamp|box|gem|bot) · n จำนวนเป้าที่ต้องทำ · r รัศมี
   spawn (seq ทีละอัน|all ทั้งหมดพร้อมกัน|stream ทยอยเกิด conc อันพร้อมกัน) · move (none|drift|rise) · speed พิกเซลต่อวินาที · decoy {kind storm|bomb|rock, n จำนวนคงที่ หรือ rate โอกาสเกิดในสตรีม}
   order (hover ตามลำดับ) · ask 'color' + colors (คลิกเฉพาะสีที่สั่ง) · dblMs ช่วงเวลาดับเบิลคลิก · menu (open|color)
   host = ฉากเล่น (ด่านเดี่ยว) หรือ BossEng (ด่านบอส) ต้องมี ok(x,y,o) bad(x,y,msg) setCard(text,o) และ roundDone() (เฉพาะบอส) */
const FLD = { x0: 200, y0: 172, x1: 1244, y1: 704 };
const LONGPRESS_MS = 460;
class FieldEng {
  constructor(s, p, host) {
    this.s = s; this.h = host || s; this.boss = !!host; this.p = Object.assign({ n: 5, r: 56, spawn: 'all', conc: 5, move: 'none', speed: 40, dblMs: 700 }, p); const P = this.p;
    this.F = Object.assign({}, FLD, s.field || {}); this.ents = []; this.spawned = 0; this.got = 0; this.nextIdx = 0; this.cool = 0; this.lp = null; this.menu = null; this.tipAt = 0; this.alive = true; this.running = false; this.spT = 0; this.R = s.R;
    this.needRight = P.act === 'right' || P.act === 'menu' || P.act === 'lr';
    if (!host) { s.setGoal(P.n); if (P.time) s.setTimer(P.time); }
    if (P.ask === 'color') { this.askCol = P.colors[0]; }
    if (P.act === 'menu' && P.menu === 'color') this.askCol = K_pick(this.R, ['red', 'blue', 'green', 'purple'].slice(0, 4));
    this.gfx = s.add.graphics().setDepth(4); this.ringG = s.add.graphics().setDepth(14);
    this.cardInit();
    this.dn = (pt, over) => this.onDown(pt, over); this.up = pt => this.onUp(pt);
    s.input.on('pointerdown', this.dn); s.input.on('pointerup', this.up);
    if (P.spawn !== 'stream') this.layout();
  }
  /* ---------- ป้ายคำสั่ง ---------- */
  cardInit() {
    const P = this.p, s = this.s; let t = '', ic = null, mode = 'left';
    if (P.act === 'hover') { t = P.order ? 'เลื่อนเมาส์ไปแตะดาวที่สว่าง ตามลำดับ (ไม่ต้องกด)' : P.decoy ? 'เลื่อนเมาส์แตะดาว (ไม่ต้องกด) หลบเมฆพายุ' : 'เลื่อนเมาส์ไปแตะดาว (ไม่ต้องกดปุ่ม)'; mode = 'move'; }
    else if (P.act === 'click') { t = P.look === 'bot' ? 'คลิกซ้ายที่หุ่นยนต์ อย่าคลิกระเบิด' : P.ask === 'color' ? 'คลิกลูกโป่ง' + K_COLNAME(this.askCol) : P.decoy ? 'คลิกลูกโป่ง หลบระเบิด' : 'คลิกซ้ายที่ลูกโป่งให้แตก'; }
    else if (P.act === 'dbl') { t = P.decoy ? 'ดับเบิลคลิกเปิดหีบ (อย่าคลิกก้อนหิน)' : 'ดับเบิลคลิก = คลิกซ้ายสองครั้งติดกัน'; mode = 'dbl'; }
    else if (P.act === 'right') { t = P.look === 'lamp' ? 'คลิกปุ่มขวาที่โคมไฟ' : 'คลิกปุ่มขวาที่กล่องเวทมนตร์'; mode = 'right'; }
    else if (P.act === 'menu') { t = P.menu === 'open' ? 'คลิกขวาที่กล่อง แล้วเลือกคำว่า เปิด' : 'คลิกขวาที่ดาว แล้วเลือก' + K_COLNAME(this.askCol); mode = 'right'; }
    else if (P.act === 'lr') { t = 'ดาวสีฟ้า คลิกซ้าย · ดาวสีแดง คลิกขวา'; mode = 'both'; }
    this.cardText = t; this.mode = mode;
    this.h.setCard(t, { icon: s.add.image(0, 0, MA.mouseIcon(s, mode, 56, mode === 'right' ? '#ff5a8a' : undefined)).setDisplaySize(64, 64), say: t });
  }
  askText() { return 'คลิกลูกโป่ง' + K_COLNAME(this.askCol); }
  /* ---------- วางเป้า ---------- */
  place(r) {
    const F = this.F; let best = null, bd = -1;
    for (let k = 0; k < 40; k++) {
      const x = F.x0 + r + this.R() * (F.x1 - F.x0 - r * 2), y = F.y0 + r + this.R() * (F.y1 - F.y0 - r * 2); let d = 1e9;
      this.ents.forEach(e => { d = Math.min(d, Math.hypot(e.x - x, e.y - y) - (e.r + r)); });
      if (d > 14) return { x, y }; if (d > bd) { bd = d; best = { x, y }; }
    }
    return best;
  }
  texFor(look, color, state) {
    const s = this.s, r = this.p.r, sz = Math.round(r * 2.1);
    switch (look) {
      case 'star': return KG.kit.shapeTex(s, 'star', color || 'yellow', sz);
      case 'balloon': return KG.kit.balloonTex(s, color || 'red', sz);
      case 'chest': return MA.chest(s, state === 'open', sz);
      case 'lamp': return MA.lamp(s, state === 'open', sz);
      case 'box': return MA.magicBox(s, state === 'open', sz);
      case 'gem': return KG.kit.shapeTex(s, 'diamond', color || 'blue', sz);
      case 'bot': return 'bot_' + (color || 'click');
      case 'storm': return MA.storm(s, Math.round(r * 2.3));
      case 'bomb': return MA.bomb(s, Math.round(r * 2.1));
      case 'rock': return MA.rock(s, Math.round(r * 2.1));
      default: return KG.kit.shapeTex(s, 'star', 'yellow', sz);
    }
  }
  make(look, good, o) {
    o = o || {}; const s = this.s, P = this.p, r = good ? P.r : Math.round(P.r * (look === 'storm' ? 1.12 : 0.95)); const pos = o.pos || this.place(r);
    let color = o.color; if (look === 'gem') color = o.color || (this.R() < 0.5 ? 'blue' : 'red');
    if (look === 'balloon') { if (good && P.ask === 'color') color = o.color || (this.R() < 0.55 ? this.askCol : K_pick(this.R, P.colors)); else color = o.color || K_pick(this.R, ['red', 'blue', 'yellow', 'green', 'pink', 'orange']); }
    if (look === 'bot') color = o.color || K_pick(this.R, ['click', 'code', 'puzzle', 'repair']);
    if (look === 'star' && P.act === 'menu') color = 'yellow';
    const e = { good, look, color, r, x: pos.x, y: pos.y, vx: 0, vy: 0, state: 'idle', id: ++this.spawned, ttl: o.ttl || 0, t: 0, idx: o.idx == null ? -1 : o.idx };
    const img = e.img = s.add.image(e.x, e.y, this.texFor(look, color)).setDepth(good ? 10 : 11); this.fitImg(e);
    e.sc = img.scaleX; img.setScale(0.01); s.tweens.add({ targets: img, scaleX: e.sc, scaleY: e.sc, duration: 260, ease: 'Back.easeOut', delay: o.delay || 0 });
    const sp = P.speed || 40, mv = P.move;
    if (mv === 'drift' || (mv !== 'rise' && !good && look === 'storm')) { const a = this.R() * Math.PI * 2; e.vx = Math.cos(a) * sp; e.vy = Math.sin(a) * sp; }
    if (mv === 'rise') { e.vy = -sp * (0.8 + this.R() * 0.5); e.vx = (this.R() - 0.5) * 24; }
    e.ph = this.R() * 6.28; this.ents.push(e); return e;
  }
  fitImg(e) {   // ตั้งขนาดภาพตามรัศมี (ภาพวาดมีขอบโปร่งใส จึงใช้อัตราส่วนความกว้างยาวคงที่ต่อชนิด)
    const img = e.img, r = e.r; if (e.look === 'bot') { img.setScale((r * 2.5) / img.height); return; }
    const sz = Math.round(r * (e.look === 'storm' ? 2.3 : 2.1)), D = { chest: [1.2, 1.2], lamp: [1.5, 1.5], box: [1.3, 1.4], balloon: [0.95, 1.3], storm: [1.4, 1.3], bomb: [1.2, 1.3], rock: [1.2, 1.1] }[e.look];
    if (D) img.setDisplaySize(sz * D[0], sz * D[1]); else img.setDisplaySize(sz + 20, sz + 20);
  }
  layout() {
    const P = this.p;
    if (P.spawn === 'seq') { this.spawnNext(); return; }
    const n = P.n; for (let i = 0; i < n; i++) this.make(P.look, true, { idx: i, delay: i * 60 });
    if (P.decoy && P.decoy.n) for (let i = 0; i < P.decoy.n; i++) this.make(P.decoy.kind, false, { delay: 200 + i * 60 });
    if (P.order) this.refreshOrder();
  }
  spawnNext() { if (!this.alive || this.got + this.liveGood() >= this.p.n) return; this.make(this.p.look, true); }
  liveGood() { return this.ents.filter(e => e.good && e.state !== 'gone').length; }
  refreshOrder() {
    const g = this.gfx; g.clear(); const list = this.ents.filter(e => e.good).sort((a, b) => a.idx - b.idx);
    g.lineStyle(5, 0xffc400, 0.55);
    for (let i = 0; i < list.length - 1; i++) { if (list[i].state === 'gone') continue; const a = list[i], b = list[i + 1], d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.floor(d / 22); for (let k = 0; k < n; k += 2) { const t0 = k / n, t1 = Math.min(1, (k + 1) / n); g.lineBetween(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0, a.x + (b.x - a.x) * t1, a.y + (b.y - a.y) * t1); } }
    list.forEach(e => { if (e.state === 'gone') return; const next = e.idx === this.nextIdx; e.img.setAlpha(next ? 1 : 0.5); if (next && !e.pulse) { e.pulse = this.s.tweens.add({ targets: e.img, scaleX: e.sc * 1.18, scaleY: e.sc * 1.18, duration: 380, yoyo: true, repeat: -1 }); } });
  }
  start() { this.running = true; this.s.input.setDefaultCursor && 0; }
  stop() { this.running = false; }
  /* ---------- วนอัปเดต ---------- */
  update(t, dt) {
    if (!this.running || !this.alive) return; const P = this.p, F = this.F, d = dt / 1000, now = this.s.time.now, ptr = this.s.input.activePointer;
    this.cool = Math.max(0, this.cool - d);
    // สตรีม: ทยอยเกิดเป้า
    if (P.spawn === 'stream') {
      this.spT -= d;
      if (this.spT <= 0) {
        const live = this.ents.filter(e => e.good && e.state !== 'gone').length, need = P.n - this.got - live;
        if (live < P.conc && need > 0) { const dec = P.decoy && P.decoy.rate && this.R() < P.decoy.rate; if (dec) this.make(P.decoy.kind, false, { ttl: 6 + this.R() * 3 }); else { const pos = P.move === 'rise' ? { x: F.x0 + P.r + this.R() * (F.x1 - F.x0 - P.r * 2), y: F.y1 + P.r * 1.6 } : null; this.make(P.look, true, { pos }); } }
        this.spT = (P.move === 'rise' ? 0.55 : 0.7) + this.R() * 0.4;
        this.ensureAsk();
      }
    }
    // เคลื่อนที่
    this.ents.forEach(e => {
      if (e.state === 'gone') return; e.t += d;
      if (e.ttl && e.t > e.ttl) { this.vanish(e); return; }
      if (e.vx || e.vy) {
        e.x += e.vx * d; e.y += e.vy * d;
        if (P.move === 'rise') { if (e.y < F.y0 - e.r * 1.2) { e.y = F.y1 + e.r * 1.6; e.x = F.x0 + e.r + this.R() * (F.x1 - F.x0 - e.r * 2); if (e.look === 'balloon' && e.good && P.ask === 'color') { /* เปลี่ยนสีใหม่ให้มีสีที่สั่งอยู่เสมอ */ } } if (e.x < F.x0 + e.r) e.vx = Math.abs(e.vx); if (e.x > F.x1 - e.r) e.vx = -Math.abs(e.vx); }
        else { if (e.x < F.x0 + e.r) { e.x = F.x0 + e.r; e.vx = Math.abs(e.vx); } if (e.x > F.x1 - e.r) { e.x = F.x1 - e.r; e.vx = -Math.abs(e.vx); } if (e.y < F.y0 + e.r) { e.y = F.y0 + e.r; e.vy = Math.abs(e.vy); } if (e.y > F.y1 - e.r) { e.y = F.y1 - e.r; e.vy = -Math.abs(e.vy); } }
      }
      e.img.setPosition(e.x, e.y + Math.sin(now / 420 + e.ph) * (e.good ? 3 : 2));
      if (e.state === 'armed' && now - e.armT > P.dblMs) this.disarm(e, true);
    });
    // เลื่อนเมาส์ (ไม่ต้องกด)
    if (P.act === 'hover' && (ptr.isDown || !ptr.wasTouch) && this.s.input.isOver !== false) {
      const px = ptr.worldX, py = ptr.worldY;
      for (const e of this.ents) {
        if (e.state === 'gone' || Math.hypot(e.x - px, e.y - py) > e.r * 0.92) continue;
        if (e.good) { if (P.order && e.idx !== this.nextIdx) continue; this.collect(e); }
        else if (this.cool <= 0) { this.cool = 1.4; this.hitBad(e, 'โดนเมฆพายุ!'); }
      }
    }
    // กดค้างบนจอสัมผัส = คลิกขวา
    if (this.lp && now - this.lp.t >= LONGPRESS_MS && !this.lp.done) { this.lp.done = true; this.act(this.lp.x, this.lp.y, 2); }
    if (this.ringG && this.armedCount) this.drawRings(now);
  }
  // ด่านลูกโป่งสีที่สั่ง: ต้องมีลูกโป่งสีที่สั่งบนจออยู่เสมอ (ถ้าไม่มี เปลี่ยนสีลูกหนึ่งให้)
  ensureAsk() {
    if (this.p.ask !== 'color') return; const goods = this.ents.filter(e => e.good && e.state !== 'gone'); if (!goods.length || goods.some(e => e.color === this.askCol)) return;
    const e = goods[Math.floor(this.R() * goods.length)]; e.color = this.askCol; e.img.setTexture(this.texFor('balloon', this.askCol)); this.fitImg(e);
  }
  hit(x, y) {
    let best = null, bd = 1e9;
    this.ents.forEach(e => { if (e.state === 'gone') return; const d = Math.hypot(e.x - x, e.y - y); if (d <= e.r * 1.02 && (e.img.depth > (best ? best.img.depth : -1) || (d < bd && (!best || e.img.depth === best.img.depth)))) { best = e; bd = d; } });
    return best;
  }
  /* ---------- อินพุต ---------- */
  onDown(pt, over) {
    if (!this.running || !this.alive || this.s.over || this.s.paused) return;
    if (over && over.length) return;   // ปุ่มบนจอ/เมนู จัดการเอง
    if (this.menu) { this.closeMenu(); }
    if (this.p.act === 'hover') return;
    if (pt.wasTouch && this.needRight) { this.lp = { x: pt.worldX, y: pt.worldY, t: this.s.time.now, done: false }; return; }
    this.act(pt.worldX, pt.worldY, pt.button === 2 ? 2 : 0);
  }
  onUp(pt) {
    if (this.lp) { const lp = this.lp; this.lp = null; if (!lp.done && this.running && !this.s.over) this.act(lp.x, lp.y, 0); }
  }
  act(x, y, btn) {
    const P = this.p, e = this.hit(x, y), a = P.act;
    if (!e) { if (btn === 0 && a === 'click') this.tip('คลิกให้ตรงลูกโป่ง', x, y); return; }
    if (a === 'click') {
      if (btn !== 0) { this.tip('ใช้ปุ่มซ้ายนะ', x, y); return; }
      if (!e.good) { this.hitBad(e, e.look === 'bomb' ? 'ระเบิด!' : 'อันนี้ไม่ใช่'); return; }
      if (P.ask === 'color' && e.color !== this.askCol) { this.hitBad(e, K_COLNAME(this.askCol) + 'เท่านั้น', true); return; }
      this.collect(e);
    } else if (a === 'dbl') {
      if (btn !== 0) { this.tip('ใช้ปุ่มซ้ายนะ', x, y); return; }
      if (!e.good) { this.hitBad(e, 'ก้อนหิน เปิดไม่ได้'); return; }
      if (e.state === 'armed') { if (this.s.time.now - e.armT <= P.dblMs) { this.disarm(e, false); this.collect(e); } else this.arm(e); } else this.arm(e);
    } else if (a === 'right') {
      if (!e.good) return;
      if (btn !== 2) { this.tip('ต้องคลิกปุ่มขวา', x, y, true); return; }
      this.collect(e);
    } else if (a === 'menu') {
      if (!e.good) return;
      if (btn !== 2) { this.tip('ต้องคลิกปุ่มขวา', x, y, true); return; }
      this.openMenu(e);
    } else if (a === 'lr') {
      if (!e.good) return; const want = e.color === 'blue' ? 0 : 2;
      if (btn !== want) { this.hitBad(e, want === 0 ? 'สีฟ้าต้องคลิกซ้าย' : 'สีแดงต้องคลิกขวา', true); return; }
      this.collect(e);
    }
  }
  tip(msg, x, y, hint) {
    const now = this.s.time.now; if (now - this.tipAt < 900) return; this.tipAt = now; KG.fx.pop(this.s, x, y - 30, msg, { size: 24, color: '#e8920a', depth: 80 }); KG.audio.play('denied');
    if (hint) { const im = this.s.add.image(x + 60, y - 60, MA.mouseIcon(this.s, 'right', 60, '#ff5a8a')).setDepth(85).setDisplaySize(72, 72).setAlpha(0); this.s.tweens.add({ targets: im, alpha: 1, y: y - 90, duration: 240 }); this.s.tweens.add({ targets: im, alpha: 0, delay: 900, duration: 250, onComplete: () => im.destroy() }); }
  }
  hitBad(e, msg, keep) {
    const s = this.s; this.h.bad(e.x, e.y, msg); this.shake(e);
    if (!keep && !e.good) { if (e.look === 'bomb') { KG.audio.play('hit'); K_boom(s, e.x, e.y); this.vanish(e, true); } }
  }
  shake(e) { const s = this.s, x = e.x; s.tweens.add({ targets: e.img, angle: { from: -10, to: 10 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => e.img.setAngle(0) }); }
  /* ---------- ดับเบิลคลิก ---------- */
  arm(e) {
    e.state = 'armed'; e.armT = this.s.time.now; this.armedCount = (this.armedCount || 0) + 1; KG.audio.play('tap'); this.s.tweens.add({ targets: e.img, scaleX: e.sc * 1.12, scaleY: e.sc * 0.92, duration: 90, yoyo: true });
  }
  disarm(e, timeout) { e.state = 'idle'; this.armedCount = Math.max(0, (this.armedCount || 1) - 1); if (!this.armedCount) this.ringG.clear(); if (timeout) { KG.fx.pop(this.s, e.x, e.y - e.r - 14, 'สองครั้งติดกันนะ', { size: 22, color: '#e8920a', depth: 80 }); this.s.tweens.add({ targets: e.img, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => e.img.setAngle(0) }); } }
  drawRings(now) {
    const g = this.ringG; g.clear(); this.ents.forEach(e => { if (e.state !== 'armed') return; const f = 1 - (now - e.armT) / this.p.dblMs; if (f <= 0) return; g.lineStyle(7, 0xffc400, 0.95); g.beginPath(); g.arc(e.x, e.y, e.r * 1.1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f, false); g.strokePath(); });
  }
  /* ---------- เมนูคลิกขวา ---------- */
  openMenu(e) {
    const s = this.s, P = this.p; let opts;
    if (P.menu === 'open') opts = K_shuffle(this.R, [{ t: 'เปิด', ok: true }, { t: 'ลบ', ok: false }, { t: 'ซ่อน', ok: false }]);
    else { const cols = K_shuffle(this.R, ['red', 'blue', 'green', 'purple'].filter(c => c !== this.askCol)).slice(0, 2).concat([this.askCol]); opts = K_shuffle(this.R, cols).map(c => ({ t: K_COLNAME(c), c, ok: c === this.askCol })); }
    const bw = 190, bh = 52, w = bw + 20, h = opts.length * (bh + 8) + 20; let mx = Phaser.Math.Clamp(e.x + e.r * 0.4, 20, 1260 - w), my = Phaser.Math.Clamp(e.y - 20, 150, 710 - h);
    const c = this.menu = s.add.container(mx, my).setDepth(100); const bg = s.add.graphics(); bg.fillStyle(0x2d2a5e, 0.25); bg.fillRoundedRect(4, 6, w, h, 14); bg.fillStyle(0xffffff, 1); bg.fillRoundedRect(0, 0, w, h, 14); bg.lineStyle(4, 0x2d2a5e, 1); bg.strokeRoundedRect(0, 0, w, h, 14); c.add(bg);
    opts.forEach((o, i) => {
      const y = 10 + i * (bh + 8), b = s.add.graphics(); b.fillStyle(o.c ? K_hex(KG.kit.COL[o.c]) : 0xe8f1ff, 1); b.fillRoundedRect(10, y, bw, bh, 10); b.lineStyle(3, 0x2d2a5e, 1); b.strokeRoundedRect(10, y, bw, bh, 10); c.add(b);
      c.add(KG.txt(s, 10 + bw / 2, y + bh / 2, o.t, { size: 26, color: o.c ? '#ffffff' : '#2d2a5e', center: true, middle: true, stroke: o.c ? '#2d2a5e' : false, sw: 5 }));
      const z = s.add.zone(10 + bw / 2, y + bh / 2, bw, bh).setInteractive({ useHandCursor: true }); c.add(z);
      z.on('pointerover', () => { b.setAlpha(0.8); KG.audio.play('hover'); }); z.on('pointerout', () => b.setAlpha(1));
      z.on('pointerdown', () => { KG.audio.play('tap'); this.closeMenu(); if (!this.running) return; if (o.ok) { if (P.menu === 'color') { e.img.setTexture(this.texFor('star', this.askCol)); } this.collect(e); } else this.hitBad(e, 'ไม่ใช่อันนี้', true); });
    });
    c.setScale(0.5).setAlpha(0); s.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 150, ease: 'Back.easeOut' }); KG.audio.play('pop');
  }
  closeMenu() { if (this.menu) { this.menu.destroy(true); this.menu = null; } }
  /* ---------- เก็บแต้ม / หายไป ---------- */
  collect(e) {
    if (e.state === 'gone' || !e.good) return; const s = this.s, P = this.p; e.state = 'gone'; this.got++; if (e.pulse) e.pulse.remove();
    const x = e.x, y = e.y; let col = [0xffd34f, 0xffffff, 0xff7ab8];
    if (e.look === 'balloon') { KG.audio.play('balloon'); col = [K_hex(KG.kit.COL[e.color] || '#ff4a4a'), 0xffffff]; KG.fx.burst(s, x, y, { colors: col, n: 20, max: 340, tex: 'fx_dot', life: 600, depth: 61, g: 300 }); this.pop(e); }
    else if (e.look === 'star') { KG.audio.play('coin', { i: Math.min(8, this.got) }); this.fly(e); }
    else if (e.look === 'chest' || e.look === 'box') { KG.audio.play(e.look === 'chest' ? 'chest' : 'magic'); e.img.setTexture(this.texFor(e.look, null, 'open')); KG.fx.glow(s, x, y, 0xffe566, 260, 500); K_coins(s, x, y); s.tweens.add({ targets: e.img, alpha: 0, delay: 650, duration: 300, onComplete: () => e.img.destroy() }); }
    else if (e.look === 'lamp') { KG.audio.play('magic'); e.img.setTexture(this.texFor('lamp', null, 'open')); KG.fx.glow(s, x, y - 10, 0xfff08a, 300, 700); s.tweens.add({ targets: e.img, scaleX: e.sc * 1.12, scaleY: e.sc * 1.12, duration: 160, yoyo: true }); s.time.delayedCall(900, () => s.tweens.add({ targets: e.img, alpha: 0, duration: 260, onComplete: () => e.img.destroy() })); }
    else if (e.look === 'gem') { KG.audio.play('ding'); col = [K_hex(KG.kit.COL[e.color]), 0xffffff]; KG.fx.burst(s, x, y, { colors: col, n: 16, max: 280, tex: 'fx_shard', rot: true, life: 600, depth: 61 }); this.pop(e); }
    else { KG.audio.play('good'); s.tweens.add({ targets: e.img, y: y - 70, angle: 360, alpha: 0, duration: 380, onComplete: () => e.img.destroy() }); }
    this.h.ok(x, y, { colors: col, sfx: 'pop', text: false });
    if (P.order) { this.nextIdx++; this.refreshOrder(); }
    if (P.ask === 'color' && this.got % 3 === 0 && this.got < P.n) { this.askCol = K_pick(this.R, P.colors.filter(c => c !== this.askCol)); this.h.setCard(this.askText(), { icon: s.add.image(0, 0, MA.mouseIcon(s, 'left', 56)).setDisplaySize(64, 64), say: this.askText() }); K_voice(this.askText()); this.ensureAsk(); }
    if (P.act === 'menu' && P.menu === 'color' && false) { /* สีที่สั่งคงเดิมตลอดด่าน */ }
    if (P.spawn === 'seq') s.time.delayedCall(520, () => this.spawnNext());
    if (this.got >= P.n && this.h.roundDone) { this.running = false; s.time.delayedCall(500, () => this.h.roundDone()); }
  }
  pop(e) { const s = this.s; s.tweens.add({ targets: e.img, scaleX: e.sc * 1.5, scaleY: e.sc * 1.5, alpha: 0, duration: 140, onComplete: () => e.img.destroy() }); }
  fly(e) { const s = this.s; KG.fx.burst(s, e.x, e.y, { colors: [0xffd34f, 0xffffff], n: 14, max: 260, tex: 'fx_star', rot: true, life: 600, depth: 61 }); s.tweens.add({ targets: e.img, scaleX: e.sc * 1.6, scaleY: e.sc * 1.6, alpha: 0, angle: 180, duration: 260, onComplete: () => e.img.destroy() }); }
  vanish(e, quick) { if (e.state === 'gone') return; e.state = 'gone'; this.s.tweens.add({ targets: e.img, alpha: 0, scaleX: 0.01, scaleY: 0.01, duration: quick ? 120 : 260, onComplete: () => e.img.destroy() }); }
  destroy() {
    this.alive = false; this.running = false; const s = this.s; s.input.off('pointerdown', this.dn); s.input.off('pointerup', this.up); this.closeMenu();
    this.ents.forEach(e => { if (e.img && e.img.scene) e.img.destroy(); }); this.ents = []; if (this.gfx) this.gfx.destroy(); if (this.ringG) this.ringG.destroy();
  }
}
// ตัวช่วยเล็ก ๆ (ใช้ร่วมกับ eng อื่น)
const K_pick = (R, a) => a[Math.floor(R() * a.length)];
const K_shuffle = (R, a) => KG.kit.shuffle(R, a);
const K_COLNAME = c => (KG.kit.COLNAME[c] || c);
const K_hex = s => KG.kit.hexInt(s);
const K_voice = t => KG.kit.voice.say(t);
const K_boom = (s, x, y) => { KG.fx.flash(s, 0xffffff, 100); KG.fx.shake(s, 180, 0.006); KG.fx.burst(s, x, y, { colors: [0xff5a3a, 0xffd34f, 0x59607e], n: 26, max: 420, life: 700, depth: 62 }); KG.fx.ring(s, x, y, 0xffd34f, { size: 3, w: 0.5, depth: 61 }); };
const K_coins = (s, x, y) => KG.fx.burst(s, x, y - 10, { colors: [0xffd34f, 0xffe566, 0xffffff], n: 22, max: 360, tex: 'fx_dot', life: 800, depth: 62, g: 520, a0: 200, a1: 340 });
