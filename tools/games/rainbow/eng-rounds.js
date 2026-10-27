/* ===== เมืองสีรุ้ง: ตัวเกมแบบหลายรอบ ทุกด่านเป็นชุดโจทย์ (kinds) วนตามจำนวนรอบ (rounds) =====
   แต่ละโจทย์ = { k: ชนิด, ...พารามิเตอร์ } ชนิดที่มี:
   tapColor · tapShape · tapCount · numeral · more · pattern · odd · big   (แตะคำตอบ)
   pair · shapeSlot · sort · basket · seq · connect                           (ลากวาง/เรียง/ต่อสาย)
   memory                                                                      (พลิกการ์ดจับคู่)
   พลาดไม่ตกด่าน: ใบ้และเสียงบอก นับเป็นพลาดสำหรับดาว · ด่านมี time = จับเวลา (ภารกิจเมือง) */
const RBX = { x0: 190, x1: 1244, y0: 168, y1: 704 };
class RoundEng {
  constructor(s, p, host) {
    this.s = s; this.h = host || s; this.p = Object.assign({ rounds: 4, kinds: [] }, p); this.R = s.R; this.objs = []; this.items = []; this.targets = []; this.round = 0; this.alive = true; this.running = false; this.busy = false; this.sel = null;
    if (!host) { s.setGoal(this.p.rounds); if (this.p.time) s.setTimer(this.p.time); }
    this.onStart = (pt, o) => this.dragStart(pt, o); this.onDrag = (pt, o, x, y) => this.dragMove(pt, o, x, y); this.onEnd = (pt, o) => this.dragEnd(pt, o);
    s.input.on('dragstart', this.onStart); s.input.on('drag', this.onDrag); s.input.on('dragend', this.onEnd);
    this.gfx = s.add.graphics().setDepth(5); this.prep();
  }
  prep() { const k = this.p.kinds[0]; this.cardFor(k.card || 'พร้อมแล้ว ไปกันเลย!'); }
  start() { this.running = true; this.nextRound(); }
  stop() { this.running = false; }
  update() { }
  destroy() { this.alive = false; this.running = false; const s = this.s; s.input.off('dragstart', this.onStart); s.input.off('drag', this.onDrag); s.input.off('dragend', this.onEnd); this.clear(); this.gfx.destroy(); }
  add(o) { this.objs.push(o); return o; }
  clear() { this.objs.forEach(o => { if (o && o.scene) { this.s.tweens.killTweensOf(o); o.destroy(); } }); this.objs = []; this.items = []; this.targets = []; this.gfx.clear(); this.sel = null; }
  cardFor(text, say, icon) { this.h.setCard(text, { say: say || text, icon: icon ? this.add(this.s.add.image(0, 0, icon).setDisplaySize(64, 64)) : undefined }); }
  voice(t) { KG.kit.voice.say(t); }
  /* ---------- ลำดับรอบ ---------- */
  nextRound() {
    if (!this.alive || this.s.over) return; this.clear(); this.busy = false; this.rm = 0; const k = this.p.kinds[this.round % this.p.kinds.length], fn = this['r_' + k.k]; this.curKind = k.k; if (!fn) { this.roundOk(640, 400); return; }
    if (this.h.roundNo) this.h.roundNo(this.round + 1, this.p.rounds);
    fn.call(this, k); const t = this.curSay; if (t) this.voice(t);
  }
  rainbowArc(x, y, r0) {
    const s = this.s, g = s.add.graphics().setDepth(55), cols = [0xff4a4a, 0xff9a2e, 0xffc82e, 0x3fbf6a, 0x3d8bff, 0x9a6af0]; r0 = r0 || 150;
    cols.forEach((c, i) => { g.lineStyle(14, c, 0.9); g.beginPath(); g.arc(0, 0, r0 - i * 13, Math.PI, 0, false); g.strokePath(); }); g.setPosition(x, y).setScale(0.2).setAlpha(0);
    s.tweens.add({ targets: g, scaleX: 1, scaleY: 1, alpha: 1, duration: 380, ease: 'Back.easeOut' }); s.tweens.add({ targets: g, alpha: 0, y: y - 30, delay: 760, duration: 360, onComplete: () => g.destroy() });
  }
  roundOk(x, y, o) {
    if (this.busy) return; this.busy = true; if (this.p.rounds > 1) this.rainbowArc(x == null ? 720 : Math.max(300, Math.min(1000, x)), Math.max(330, Math.min(520, (y || 420) + 70))); const s = this.s; this.round++; this.h.ok(x, y, Object.assign({ cheer: true }, o || {}));
    if (this.round >= this.p.rounds) { if (this.h.roundDone) { this.running = false; s.time.delayedCall(600, () => this.h.roundDone()); } return; }
    s.time.delayedCall(950, () => { if (this.alive && !s.over) this.nextRound(); });
  }
  bad(x, y, m, obj) { this.h.bad(x, y, m); if (obj && obj.scene) { const o = obj; this.s.tweens.add({ targets: o, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => o.setAngle(0) }); if (o.v) this.hintFor(null); } }
  setPrompt(text, say) { this.curSay = say || text; this.cardFor(text, say); }
  /* ---------- ตัวช่วยวางภาพ ---------- */
  gridPos(n, cx, cy, w, h, maxCols) {
    const cols = Math.min(n, maxCols || (n <= 4 ? n : n <= 6 ? 3 : n <= 8 ? 4 : 5)), rows = Math.ceil(n / cols), out = [], gx = w / cols, gy = h / rows;
    for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - r * cols : cols; out.push({ x: cx - w / 2 + gx * (c + 0.5) + (cols - inRow) * gx / 2, y: cy - h / 2 + gy * (r + 0.5) + (R_jit(this.R, 10)) }); }
    return out;
  }
  // ตัวเลือกแตะได้: คืน container ที่มี .v (ข้อมูลภาพ) และเรียก onTap(obj)
  opt(v, x, y, size, onTap, o) {
    o = o || {}; const s = this.s, c = this.add(s.add.container(x, y).setDepth(12)), g = RB.vis(s, v, size); c.add(g); c.g = g; c.v = v; c.base = 1; c.size = size; c.right = !!o.right;
    const z = s.add.zone(0, 0, size + 24, size + 24).setInteractive({ useHandCursor: true }); c.add(z); c.z = z;
    z.on('pointerover', () => { if (this.running && !c.dead) { s.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 100 }); KG.audio.play('hover'); } }); z.on('pointerout', () => { if (!c.dead) s.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 100 }); });
    z.on('pointerdown', () => { if (!this.running || this.busy || c.dead || s.over || s.paused) return; onTap(c); });
    c.setScale(0.01); s.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 260, delay: o.delay || 0, ease: 'Back.easeOut' });
    if (!o.still) s.tweens.add({ targets: g, y: { from: -3, to: 3 }, duration: 900 + this.R() * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: this.R() * 600 });
    return c;
  }
  popOpt(c, good) { const s = this.s; c.dead = true; const x = c.x, y = c.y; if (good) { KG.audio.play('coin', { i: this.tapped || 0 }); KG.kit.stars(s, x, y, undefined, 10); s.tweens.add({ targets: c, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 220 }); } }
  // แผ่นป้ายตัวหนังสือบนเวที
  label(text, x, y, size, color) { return this.add(KG.txt(this.s, x, y, text, { size: size || 34, color: color || '#2d2a5e', center: true, middle: true, stroke: color === '#ffffff' ? '#2d2a5e' : '#ffffff', sw: 7 }).setDepth(9)); }
  stage(x, y, w, h, tint) { const s = this.s, g = this.add(s.add.graphics().setDepth(4)); g.fillStyle(0xffffff, 0.55); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 26); g.lineStyle(4, 0x2d2a5e, 0.35); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 26); return g; }
  distract(list, n, notFn) { const out = []; K_shuf(this.R, list).forEach(x => { if (out.length < n && notFn(x)) out.push(x); }); return out; }
  /* ===================== แตะสี ===================== */
  r_tapColor(P) {
    const s = this.s, R = this.R, ncol = Math.min(P.colors || 3, P.look === 'shape' ? 7 : 4), cols = (P.look === 'shape' ? RB.COLS7 : RB.COLS4).slice(0, Math.max(2, ncol)), want = K_pick(R, cols), need = P.need || 2, total = Math.max(need + 2, P.opts || need + 4), say = P.say, th = KG.kit.COLNAME[want];
    const mk = c => P.look === 'shape' ? { t: 'shape', shape: 'circle', color: c } : { t: 'star', c: RB.COLS4.indexOf(c) };
    const text = say ? 'แตะ' + (P.look === 'shape' ? 'วงกลม' : 'ดาว') + th + ' ' + need + ' ดวง' : 'แตะให้เหมือนตัวอย่าง ' + need + ' ดวง'; this.setPrompt(text, 'แตะ' + (P.look === 'shape' ? 'ลูกบอล' : 'ดาว') + th + ' ' + need + ' ' + (P.look === 'shape' ? 'ลูก' : 'ดวง'));
    this.stage(720, 250, 380, 150);
    if (say) { const chip = this.add(s.add.graphics().setDepth(8)); chip.fillStyle(KG.kit.hexInt(KG.kit.COL[want]), 1); chip.fillRoundedRect(560, 210, 320, 80, 40); chip.lineStyle(5, 0x2d2a5e, 1); chip.strokeRoundedRect(560, 210, 320, 80, 40); this.label(th, 720, 250, 44, '#ffffff'); }
    else { const smp = this.add(RB.vis(s, mk(want), 100)); smp.setPosition(720, 248).setDepth(9); s.tweens.add({ targets: smp, angle: { from: -8, to: 8 }, duration: 700, yoyo: true, repeat: -1 }); }
    this.count = 0; this.needN = need; this.cnt = this.label('0 / ' + need, 960, 250, 36);
    const list = []; for (let i = 0; i < need; i++) list.push(want); const others = cols.filter(c => c !== want); while (list.length < total) list.push(K_pick(R, others));
    const pos = this.gridPos(total, 715, 520, 880, 260, total <= 6 ? 3 : 5); K_shuf(R, list).forEach((c, i) => {
      const o = this.opt(mk(c), pos[i].x, pos[i].y, P.size || (total <= 6 ? 112 : 92), ob => {
        if (c === want) { this.tapped = this.count; this.popOpt(ob, true); this.count++; this.cnt.setText(this.count + ' / ' + need); this.h.tick && this.h.tick(); if (this.count >= need) this.roundOk(ob.x, ob.y); }
        else { this.bad(ob.x, ob.y, 'ไม่ใช่' + th, ob); }
      }, { delay: i * 50, right: c === want }); this.items.push(o);
    });
  }
  /* ===================== แตะรูปทรง ===================== */
  r_tapShape(P) {
    const s = this.s, R = this.R, shapes = KG.kit.SHAPES.slice(0, P.shapes || 4), want = K_pick(R, shapes), need = P.need || 2, total = Math.max(need + 2, P.opts || need + 4), say = P.say, name = KG.kit.SHAPENAME[want];
    this.setPrompt(say ? 'แตะรูป' + name + ' ' + need + ' อัน' : 'แตะรูปที่เหมือนตัวอย่าง ' + need + ' อัน', 'แตะรูป' + name + ' ' + need + ' อัน');
    this.stage(720, 250, 380, 150);
    if (say) this.label(name, 720, 250, 56); else { const smp = this.add(RB.vis(s, { t: 'shape', shape: want, color: 'purple' }, 100)); smp.setPosition(720, 248).setDepth(9); s.tweens.add({ targets: smp, angle: { from: -8, to: 8 }, duration: 700, yoyo: true, repeat: -1 }); }
    this.count = 0; this.cnt = this.label('0 / ' + need, 960, 250, 36);
    const list = []; for (let i = 0; i < need; i++) list.push(want); const others = shapes.filter(c => c !== want); while (list.length < total) list.push(K_pick(R, others));
    const pos = this.gridPos(total, 715, 520, 880, 260, total <= 6 ? 3 : 5);
    K_shuf(R, list).forEach((sh, i) => { const col = K_pick(R, RB.COLS7), o = this.opt({ t: 'shape', shape: sh, color: col }, pos[i].x, pos[i].y, total <= 6 ? 112 : 92, ob => { if (sh === want) { this.popOpt(ob, true); this.count++; this.cnt.setText(this.count + ' / ' + need); if (this.count >= need) this.roundOk(ob.x, ob.y); } else this.bad(ob.x, ob.y, 'ไม่ใช่รูป' + name, ob); }, { delay: i * 50, right: sh === want }); this.items.push(o); });
  }
  /* ===================== แตะนับ ===================== */
  r_tapCount(P) {
    const s = this.s, R = this.R, max = P.max || 5, n = 1 + Math.floor(R() * max), item = K_pick(R, KG.kit.bank().fruit.items.concat(KG.kit.bank().animal.items.slice(0, 6))), total = Math.min(10, n + 3 + Math.floor(R() * 2));
    this.setPrompt('แตะ ' + item.th + ' ให้ได้ ' + n + ' ชิ้น', 'แตะ ' + item.th + ' ' + RB.NUMTH[n] + ' ชิ้น'); this.stage(720, 250, 380, 150); this.label(String(n), 640, 250, 96, '#ff5a8a'); this.add(KG.kit.itemImage(s, item, 800, 250, 100).setDepth(9));
    this.count = 0; this.cnt = this.label('แตะแล้ว 0', 1000, 250, 28);
    const pos = this.gridPos(total, 715, 520, 880, 260, 5);
    for (let i = 0; i < total; i++) { const o = this.opt({ t: 'bare', item }, pos[i].x, pos[i].y, 96, ob => { this.popOpt(ob, true); this.count++; this.cnt.setText('แตะแล้ว ' + this.count); const bub = this.add(KG.txt(s, ob.x, ob.y - 20, String(this.count), { size: 50, color: '#ff5a8a', center: true, middle: true, stroke: '#ffffff', sw: 8 }).setDepth(30)); s.tweens.add({ targets: bub, y: ob.y - 70, alpha: 0, duration: 800 }); this.voiceNum(this.count); if (this.count >= n) this.roundOk(ob.x, ob.y); }, { delay: i * 50 }); this.items.push(o); }
  }
  voiceNum(n) { KG.kit.voice.say(RB.NUMTH[n] || String(n), 1.0); }
  /* ===================== ตัวเลขกับจำนวน ===================== */
  r_numeral(P) {
    const s = this.s, R = this.R, max = P.max || 5, n = 1 + Math.floor(R() * max), dots = P.mode === 'dots', item = K_pick(R, KG.kit.bank().animal.items.concat(KG.kit.bank().fruit.items));
    this.setPrompt(dots ? 'นับจุด แล้วแตะตัวเลขที่ตรงกัน' : 'นับ' + item.th + ' แล้วแตะตัวเลขที่ตรงกัน', dots ? 'นับจุดว่ามีกี่จุด แล้วแตะตัวเลข' : 'มี' + item.th + 'กี่ตัว แตะตัวเลขที่ตรงกัน'); this.stage(720, 270, 620, 190);
    if (dots) { const d = this.add(RB.vis(s, { t: 'dots', n, color: K_pick(R, ['blue', 'pink', 'orange']) }, 160)); d.setPosition(720, 270).setDepth(9); } else { const g = this.add(RB.vis(s, { t: 'group', item, n, sz: 84 }, 300)); g.setPosition(720, 270).setDepth(9); }
    const nums = [n]; while (nums.length < 3) { const m = 1 + Math.floor(R() * Math.max(max, 3)); if (!nums.includes(m)) nums.push(m); } const cols = ['pink', 'blue', 'green', 'orange', 'purple'];
    K_shuf(R, nums).forEach((v, i) => { const o = this.opt({ t: 'num', n: v, color: cols[v % 5] }, 460 + i * 260, 560, 150, ob => { if (v === n) { this.popOpt(ob, true); this.voiceNum(n); this.roundOk(ob.x, ob.y); } else this.bad(ob.x, ob.y, 'นับอีกทีนะ', ob); }, { delay: i * 80, right: v === n }); this.items.push(o); });
  }
  /* ===================== กลุ่มไหนมากกว่า/น้อยกว่า ===================== */
  r_more(P) {
    const s = this.s, R = this.R, max = P.max || 7, less = !!P.less; let a = 1 + Math.floor(R() * max), b; do { b = 1 + Math.floor(R() * max); } while (b === a);
    const item = K_pick(R, KG.kit.bank().fruit.items.concat(KG.kit.bank().animal.items.slice(0, 6))); this.setPrompt(less ? 'กลุ่มไหนน้อยกว่า แตะกลุ่มนั้น' : 'กลุ่มไหนมากกว่า แตะกลุ่มนั้น', less ? 'กลุ่มไหนน้อยกว่ากัน' : 'กลุ่มไหนมากกว่ากัน');
    [a, b].forEach((n, i) => {
      const x = 470 + i * 500, y = 430, ok0 = less ? a < b : a > b, panel = this.add(s.add.container(x, y).setDepth(8)), g = s.add.graphics(); g.fillStyle(0xffffff, 0.9); g.fillRoundedRect(-230, -150, 460, 300, 30); g.lineStyle(5, 0x2d2a5e, 1); g.strokeRoundedRect(-230, -150, 460, 300, 30); panel.add(g); const grp = RB.vis(s, { t: 'group', item, n, sz: 68 }, 380); panel.add(grp);
      const z = s.add.zone(0, 0, 460, 300).setInteractive({ useHandCursor: true }); panel.add(z); if (ok0 === (i === 0)) this.moreZ = z; z.on('pointerover', () => { s.tweens.add({ targets: panel, scaleX: 1.04, scaleY: 1.04, duration: 100 }); KG.audio.play('hover'); }); z.on('pointerout', () => s.tweens.add({ targets: panel, scaleX: 1, scaleY: 1, duration: 100 }));
      z.on('pointerdown', () => { if (!this.running || this.busy) return; const ok = less ? n < (i ? a : b) : n > (i ? a : b); if (ok) { g.clear(); g.fillStyle(0xbff3c8, 1); g.fillRoundedRect(-230, -150, 460, 300, 30); g.lineStyle(6, 0x22b45a, 1); g.strokeRoundedRect(-230, -150, 460, 300, 30); this.label(String(n), x, y + 180, 50, '#22b45a'); this.roundOk(x, y); } else { this.bad(x, y, 'นับดูอีกทีนะ', panel); } });
    });
  }
  /* ===================== ต่อแบบ ===================== */
  r_pattern(P) {
    const s = this.s, R = this.R, kind = P.pat || K_pick(R, ['AB', 'ABC', 'AAB', 'ABB']), look = P.look || 'color'; let elems = [];
    if (look === 'shape') elems = K_shuf(R, KG.kit.SHAPES).slice(0, 3).map((sh, i) => ({ t: 'shape', shape: sh, color: RB.COLS7[(i * 2 + Math.floor(R() * 2)) % 7] }));
    else if (look === 'pic') elems = K_shuf(R, KG.kit.bank().animal.items.concat(KG.kit.bank().fruit.items)).slice(0, 3).map(it => ({ t: 'pic', item: it }));
    else elems = K_shuf(R, RB.COLS4.concat(['pink', 'orange'])).slice(0, 3).map(c => ({ t: 'shape', shape: 'circle', color: c }));
    const map = { AB: [0, 1], ABC: [0, 1, 2], AAB: [0, 0, 1], ABB: [0, 1, 1] }, unit = map[kind], len = kind === 'ABC' ? 7 : 6, seq = []; for (let i = 0; i < len; i++) seq.push(elems[unit[i % unit.length]]);
    const ans = seq[len - 1]; this.setPrompt('ดูแบบ แล้วเลือกอันที่ต้องต่อ', 'ดูแบบ แล้วเลือกอันที่ต้องต่อ'); const sz = 92, gap = 18, total = len * (sz + gap), x0 = 720 - total / 2 + (sz + gap) / 2; this.stage(720, 290, total + 60, 150);
    seq.forEach((v, i) => { const last = i === len - 1, o = this.add(RB.vis(s, last ? { t: 'q' } : v, sz)); o.setPosition(x0 + i * (sz + gap), 290).setDepth(9); if (last) { this.slotQ = o; s.tweens.add({ targets: o, scaleX: 1.08, scaleY: 1.08, duration: 500, yoyo: true, repeat: -1 }); } });
    const opts = [ans]; elems.forEach(e => { if (!RB.same(e, ans) && opts.length < 3) opts.push(e); }); K_shuf(R, opts).forEach((v, i) => { const o = this.opt(v, 500 + i * 220, 540, 132, ob => { if (RB.same(v, ans)) { this.popOpt(ob, true); s.tweens.add({ targets: ob, x: this.slotQ.x, y: 290, duration: 280, ease: 'Back.easeOut' }); this.roundOk(this.slotQ.x, 290); } else this.bad(ob.x, ob.y, 'ลองดูแบบอีกที', ob); }, { delay: i * 80, right: RB.same(v, ans) }); this.items.push(o); });
  }
  /* ===================== ตัวไหนไม่เหมือน ===================== */
  r_odd(P) {
    const s = this.s, R = this.R, by = P.by || K_pick(R, ['color', 'shape', 'size']), n = P.n || 4; let base, odd, mkv; const bank = KG.kit.bank();
    if (by === 'cat') { const cats = K_shuf(R, ['animal', 'fruit', 'food', 'school']), a = bank[cats[0]], b = bank[cats[1]], pool = K_shuf(R, a.items).slice(0, n - 1); odd = K_shuf(R, b.items)[0]; mkv = pool.map(it => ({ t: 'pic', item: it })); mkv.push({ t: 'pic', item: odd }); this.setPrompt('อันไหนไม่อยู่พวกเดียวกัน แตะอันนั้น', 'อันไหนไม่อยู่พวกเดียวกับเพื่อน'); this.oddIdx = n - 1; }
    else if (by === 'color') { const cs = K_shuf(R, RB.COLS7); mkv = []; for (let i = 0; i < n - 1; i++) mkv.push({ t: 'shape', shape: 'circle', color: cs[0] }); mkv.push({ t: 'shape', shape: 'circle', color: cs[1] }); this.setPrompt('อันไหนสีไม่เหมือนเพื่อน แตะอันนั้น', 'อันไหนสีไม่เหมือนเพื่อน'); this.oddIdx = n - 1; }
    else if (by === 'shape') { const sh = K_shuf(R, KG.kit.SHAPES), col = K_pick(R, RB.COLS7); mkv = []; for (let i = 0; i < n - 1; i++) mkv.push({ t: 'shape', shape: sh[0], color: col }); mkv.push({ t: 'shape', shape: sh[1], color: col }); this.setPrompt('อันไหนรูปทรงไม่เหมือนเพื่อน แตะอันนั้น', 'อันไหนรูปทรงไม่เหมือนเพื่อน'); this.oddIdx = n - 1; }
    else { const it = K_pick(R, bank.animal.items); mkv = []; for (let i = 0; i < n - 1; i++) mkv.push({ t: 'pic', item: it, big: false }); mkv.push({ t: 'pic', item: it, big: true }); this.setPrompt('อันไหนใหญ่ไม่เท่าเพื่อน แตะอันนั้น', 'อันไหนขนาดไม่เหมือนเพื่อน'); this.oddIdx = n - 1; }
    const order = K_shuf(R, mkv.map((v, i) => i)), pos = this.gridPos(n, 715, 440, 900, 240, n); order.forEach((idx, k) => {
      const v = mkv[idx], sz = v.big ? 168 : (by === 'size' ? 100 : 128), o = this.opt(v, pos[k].x, pos[k].y, sz, ob => { if (idx === this.oddIdx) { this.popOpt(ob, true); this.label('ใช่แล้ว!', ob.x, ob.y - 110, 40, '#22b45a'); this.roundOk(ob.x, ob.y); } else this.bad(ob.x, ob.y, 'เหมือนเพื่อนนะ', ob); }, { delay: k * 70, right: idx === this.oddIdx }); this.items.push(o);
    });
  }
  /* ===================== อันไหนใหญ่/เล็กกว่า ===================== */
  r_big(P) {
    const s = this.s, R = this.R, small = !!P.small, item = K_pick(R, KG.kit.bank().animal.items.concat(KG.kit.bank().fruit.items)); this.setPrompt(small ? 'อันไหนเล็กกว่า แตะอันนั้น' : 'อันไหนใหญ่กว่า แตะอันนั้น', small ? 'อันไหนตัวเล็กกว่า' : 'อันไหนตัวใหญ่กว่า');
    const bigOnLeft = R() < 0.5, sizes = [190, 110]; [0, 1].forEach(i => { const isBig = bigOnLeft ? i === 0 : i === 1, sz = isBig ? sizes[0] : sizes[1], o = this.opt({ t: 'pic', item }, 520 + i * 400, 450, sz, ob => { if (isBig !== small) { this.popOpt(ob, true); this.roundOk(ob.x, ob.y); } else this.bad(ob.x, ob.y, 'ดูขนาดอีกทีนะ', ob); }, { delay: i * 80, right: isBig !== small }); this.items.push(o); });
  }
  /* ===================== ลากวาง: ตัวช่วย (ลากได้ หรือแตะของแล้วแตะที่วางก็ได้ สำหรับเด็กที่ยังลากไม่คล่อง) ===================== */
  mkDrag(img, data) {
    img.setInteractive({ draggable: true, useHandCursor: true }); img.dd = Object.assign({ home: { x: img.x, y: img.y }, locked: false, sc: img.scaleX, moved: false }, data);
    img.on('pointerup', () => { if (!img.dd.moved) this.selectItem(img); }); this.items.push(img); return img;
  }
  // ลากได้สำหรับ container (ต้องกำหนดขนาดก่อน)
  mkDragC(c, w, h, data) {
    c.setSize(w, h); c.setInteractive({ draggable: true, useHandCursor: true }); c.dd = Object.assign({ home: { x: c.x, y: c.y }, locked: false, sc: c.scaleX, moved: false }, data);
    c.on('pointerup', () => { if (!c.dd.moved) this.selectItem(c); }); this.items.push(c); return c;
  }
  clearSel() { if (this.sel && this.sel.hl2) { this.sel.hl2.destroy(); this.sel.hl2 = null; } this.sel = null; }
  selectItem(o) {
    if (!this.running || this.busy || this.s.over || this.s.paused || o.dd.locked) return; if (this.sel === o) { this.clearSel(); return; } this.clearSel(); this.sel = o; KG.audio.play('tap');
    const w = (o.displayWidth || o.width || 100) + 16, h = (o.displayHeight || o.height || 100) + 16; o.hl2 = this.s.add.rectangle(o.x, o.y, w, h, 0xffe566, 0.4).setStrokeStyle(5, 0xffc400).setDepth(19); this.objs.push(o.hl2);
    this.s.tweens.add({ targets: o.hl2, alpha: 0.9, duration: 380, yoyo: true, repeat: -1 });
  }
  dragStart(pt, o) { if (!this.running || !o.dd || o.dd.locked || this.busy) return; this.clearSel(); o.dd.moved = false; o.dd.p0 = { x: o.x, y: o.y }; o.setDepth(60); this.s.tweens.killTweensOf(o); this.s.tweens.add({ targets: o, scaleX: o.dd.sc * 1.14, scaleY: o.dd.sc * 1.14, duration: 110 }); KG.audio.play('pop'); }
  dragMove(pt, o, x, y) {
    if (!o.dd || o.dd.locked || !this.running) return; o.x = x; o.y = y; if (o.dd.p0 && Math.hypot(x - o.dd.p0.x, y - o.dd.p0.y) > 12) o.dd.moved = true;
    const t = this.targetAt(o); this.targets.forEach(g => { if (g.hl) g.hl.setAlpha(g === t ? 0.9 : 0); });
  }
  dragEnd(pt, o) {
    if (!o.dd || o.dd.locked) return; this.targets.forEach(g => { if (g.hl) g.hl.setAlpha(0); }); const t = this.targetAt(o);
    if (!o.dd.moved) { this.back(o); return; }   // แค่แตะ ไม่ได้ลาก: ให้ตัวจัดการแตะเลือกทำงานแทน
    if (!this.running || this.s.over || this.s.paused || !t) { this.back(o); return; }
    if (t.accept(o)) this.drop(o, t); else { this.wrongDrop(o, t); this.back(o); }
  }
  wrongDrop(o, t) { this.bad(o.x, o.y, t.wrong || 'ยังไม่ใช่ที่นี่', t.obj); this.hintFor(o); }
  back(o) { o.setDepth(20); this.s.tweens.killTweensOf(o); this.s.tweens.add({ targets: o, scaleX: o.dd.sc, scaleY: o.dd.sc, x: o.dd.home.x, y: o.dd.home.y, duration: 260, ease: 'Back.easeOut' }); }
  targetAt(o) { let best = null, bd = 1e9; this.targets.forEach(g => { if (g.done) return; const dx = Math.abs(o.x - g.x), dy = Math.abs(o.y - g.y); if (dx <= g.rw / 2 + 14 && dy <= g.rh / 2 + 14 && dx + dy < bd) { bd = dx + dy; best = g; } }); return best; }
  mkTarget(x, y, rw, rh, accept, o) {
    o = o || {}; const g = { x, y, rw, rh, accept, wrong: o.wrong, done: false, obj: o.obj, onDrop: o.onDrop, fit: o.fit || 0.9, slot: o.slot, multi: !!o.multi };
    g.hl = this.add(this.s.add.rectangle(x, y, rw + 18, rh + 18, 0xffe566, 0.5).setStrokeStyle(5, 0xffc400).setDepth(5).setAlpha(0));
    g.zone = this.add(this.s.add.zone(x, y, rw, rh).setInteractive({ useHandCursor: true }).setDepth(4)); g.zone.on('pointerup', () => this.tapTarget(g)); this.targets.push(g); return g;
  }
  tapTarget(t) {
    if (!this.sel || !this.running || this.busy || this.s.over || this.s.paused || t.done) return; const o = this.sel; this.clearSel();
    if (t.accept(o)) this.drop(o, t); else this.wrongDrop(o, t);
  }
  // ใบ้: พลาดสองครั้งในรอบเดียว ให้ที่วางที่ถูกกะพริบ (หรือคำตอบที่ถูกเด้ง)
  hintFor(o) {
    this.rm = (this.rm || 0) + 1; if (this.rm < 2) return; this.rm = 0; if (this.h.hints != null) this.h.hints++;
    const g = o && o.dd ? this.targets.find(t => !t.done && t.accept(o)) : null; if (g && g.hl) { this.s.tweens.add({ targets: g.hl, alpha: 0.95, duration: 200, yoyo: true, repeat: 3, onComplete: () => g.hl.setAlpha(0) }); return; }
    this.items.filter(i => i.right && !i.dead).forEach(i => this.s.tweens.add({ targets: i, scaleX: 1.3, scaleY: 1.3, duration: 220, yoyo: true, repeat: 2 }));
  }
  drop(o, t) {
    const s = this.s; o.dd.locked = true; o.disableInteractive(); this.clearSel(); if (!t.multi) t.done = true; t.cnt = (t.cnt || 0) + 1; if (t.onDrop) t.onDrop(o, t); const x = t.slot ? t.slot.x : t.x, y = t.slot ? t.slot.y : t.y; o.setDepth(15);
    KG.audio.play('drop'); KG.fx.ring(s, x, y, 0x5ef08a, { size: 1.5, w: 0.4, depth: 61 }); KG.kit.stars(s, x, y, [0x5ef08a, 0xffd34f, 0xffffff], 10);
    s.tweens.killTweensOf(o); s.tweens.add({ targets: o, x, y, scaleX: o.dd.sc * t.fit, scaleY: o.dd.sc * t.fit, duration: 160, ease: 'Back.easeOut' }); this.placed = (this.placed || 0) + 1; this.afterDrop(o, t);
  }
  afterDrop(o, t) { if (this.placed >= this.needPlace) { this.roundOk(t.x, t.y); } }
  /* ===================== จับคู่แบตเตอรี่กับหุ่นยนต์ ===================== */
  r_pair(P) {
    const s = this.s, R = this.R, n = P.n || 3, cols = K_shuf(R, [0, 1, 2, 3]).slice(0, n); this.placed = 0; this.needPlace = n; this.setPrompt('ลากแบตเตอรี่ไปหาหุ่นยนต์ที่สีเหมือนกัน', 'ลากแบตเตอรี่ไปหาหุ่นยนต์สีเดียวกัน');
    const xs = i => 720 + (i - (n - 1) / 2) * Math.min(260, 900 / n);
    cols.forEach((c, i) => { const x = xs(i); this.add(s.add.ellipse(x, 462, 150, 20, 0x2d2a5e, 0.2).setDepth(4)); const r = this.add(s.add.image(x, 456, 'robot' + c).setOrigin(0.5, 1).setDepth(8)); r.setScale(240 / r.height); this.mkTarget(x, 340, 200, 260, o => o.dd.c === c, { wrong: 'สีไม่ตรงกัน', obj: r, slot: { x: x + 2, y: 360 }, fit: 0.4, onDrop: () => { KG.fx.glow(s, x, 350, 0xffe566, 280, 500); s.tweens.add({ targets: r, y: r.y - 24, duration: 160, yoyo: true }); KG.audio.play('charge'); } }); });
    K_shuf(R, cols).forEach((c, i) => { const x = xs(i), b = this.add(s.add.image(x, 610, 'battery' + c).setDepth(20)); b.setScale(128 / b.height); this.mkDrag(b, { c }); });
  }
  /* ===================== วางรูปทรงให้ตรงช่อง ===================== */
  r_shapeSlot(P) {
    const s = this.s, R = this.R, n = P.n || 3, shapes = K_shuf(R, KG.kit.SHAPES.slice(0, Math.max(n, 4))).slice(0, n); this.placed = 0; this.needPlace = n; this.setPrompt('ลากรูปทรงไปวางให้ตรงกับช่อง', 'ลากรูปทรงไปวางให้ตรงกับช่องเงา');
    const xs = i => 720 + (i - (n - 1) / 2) * Math.min(220, 880 / n); shapes.forEach((sh, i) => { const x = xs(i); this.add(s.add.image(x, 340, KG.kit.shapeTex(s, sh, 'purple', 120, 'outline')).setDisplaySize(140, 140).setDepth(5)); this.mkTarget(x, 340, 130, 130, o => o.dd.sh === sh, { wrong: 'ไม่ตรงช่อง', fit: 1, slot: { x, y: 340 } }); });
    K_shuf(R, shapes).forEach((sh, i) => { const x = xs(i), col = RB.COLS7[(i * 3 + 1) % 7], im = this.add(s.add.image(x, 600, KG.kit.shapeTex(s, sh, col, 120)).setDisplaySize(140, 140).setDepth(20)); this.mkDrag(im, { sh }); });
  }
  /* ===================== แยกหมวด (สี/รูปทรง/ประเภท) ===================== */
  r_sort(P) {
    const s = this.s, R = this.R, by = P.by || 'cat', nb = P.bins || 2, bank = KG.kit.bank(); const per = Math.min(P.per || 3, by === 'cat' ? 3 : 9); let bins = [], items = [];
    if (by === 'color') { const cs = K_shuf(R, RB.COLS4).slice(0, nb); bins = cs.map(c => ({ id: c, label: KG.kit.COLNAME[c], tint: c })); cs.forEach(c => { for (let i = 0; i < per; i++) items.push({ id: c, v: { t: 'shape', shape: K_pick(R, ['circle', 'star', 'heart', 'square']), color: c } }); }); }
    else if (by === 'shape') { const ss = K_shuf(R, KG.kit.SHAPES.slice(0, 5)).slice(0, nb); bins = ss.map(sh => ({ id: sh, label: KG.kit.SHAPENAME[sh], shape: sh })); ss.forEach(sh => { for (let i = 0; i < per; i++) items.push({ id: sh, v: { t: 'shape', shape: sh, color: K_pick(R, RB.COLS7) } }); }); }
    else { const cs = K_shuf(R, P.cats || ['animal', 'fruit', 'school', 'food']).slice(0, nb); bins = cs.map(c => ({ id: c, label: bank[c].th })); cs.forEach(c => { K_shuf(R, bank[c].items).slice(0, per).forEach(it => items.push({ id: c, v: { t: 'bare', item: it } })); }); }
    this.placed = 0; this.needPlace = items.length; this.setPrompt(by === 'color' ? 'ลากของไปใส่ตะกร้าที่สีเหมือนกัน' : by === 'shape' ? 'ลากรูปทรงไปใส่ช่องที่รูปเหมือนกัน' : 'ลากของไปใส่ให้ถูกหมวด', by === 'color' ? 'ลากของไปใส่ตะกร้าสีเดียวกัน' : by === 'shape' ? 'ลากรูปทรงไปใส่ช่องที่เหมือนกัน' : 'ลากของไปใส่ให้ถูกหมวด');
    const bw = nb === 2 ? 330 : nb === 3 ? 270 : 230, gap = nb === 2 ? 200 : 40, tot = nb * bw + (nb - 1) * gap, bx = i => 720 - tot / 2 + bw / 2 + i * (bw + gap), BH = 190;
    bins.forEach((b, i) => {
      const x = bx(i), y = 285, col = b.tint ? KG.kit.COL[b.tint] : ['#ff9a2e', '#3d8bff', '#9a6af0', '#3fbf6a'][i % 4], tex = KG.tex(s, ['rbbin', bw, BH, col].join('|'), bw + 24, BH + 28, ctx => { const m = 12; KG.ui.rrect(ctx, m, m + 8, bw, BH, 22); ctx.fillStyle = 'rgba(45,42,94,.25)'; ctx.fill(); KG.ui.rrect(ctx, m, m, bw, BH, 22); ctx.fillStyle = b.tint ? K_tintBg(col) : '#ffffff'; ctx.fill(); ctx.save(); KG.ui.rrect(ctx, m, m, bw, BH, 22); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(m, m, bw, 50); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(m, m, bw, 8); ctx.restore(); KG.ui.rrect(ctx, m, m, bw, BH, 22); ctx.lineWidth = 5; ctx.strokeStyle = '#2d2a5e'; ctx.stroke(); });
      const img = this.add(s.add.image(x, y, tex).setDisplaySize(bw + 24, BH + 28).setDepth(5)); this.label(b.label, x, y - BH / 2 + 25, nb === 2 ? 30 : 24, '#ffffff'); if (b.shape) this.add(s.add.image(x, y + 38, KG.kit.shapeTex(s, b.shape, 'purple', 70, 'outline')).setDisplaySize(90, 90).setDepth(6)); const cols = nb === 2 ? 4 : 3;
      this.mkTarget(x, y, bw, BH, o => o.dd.id === b.id, { wrong: 'ไม่ใช่ ' + b.label, obj: img, multi: true, fit: 0.5, onDrop: (o, t) => { const k = t.cnt - 1; t.slot = { x: x - bw / 2 + 46 + (k % cols) * (nb === 2 ? 74 : 62), y: y + 8 + Math.floor(k / cols) * 54 }; } });
    });
    const N = items.length, rows = N > 6 ? 2 : 1, perRow = Math.ceil(N / rows); K_shuf(R, items).forEach((it, i) => { const r = Math.floor(i / perRow), c = i % perRow, cnt = r === rows - 1 ? N - r * perRow : perRow, x = 720 + (c - (cnt - 1) / 2) * Math.min(150, 960 / perRow), y = 535 + r * 124, g = RB.vis(s, it.v, 100), hit = this.add(s.add.container(x, y).setDepth(20)); hit.add(g); this.mkDragC(hit, 112, 112, { id: it.id }); });
  }
  /* ===================== ใส่ตะกร้าตามจำนวน ===================== */
  r_basket(P) {
    const s = this.s, R = this.R, max = P.max || 5, n = 1 + Math.floor(R() * max), item = K_pick(R, KG.kit.bank().fruit.items.concat(KG.kit.bank().school.items.slice(0, 3))); this.placed = 0; this.needPlace = n;
    this.setPrompt('ใส่' + item.th + ' ' + n + ' ชิ้นลงตะกร้า', 'ใส่' + item.th + ' ' + RB.NUMTH[n] + ' ชิ้นลงตะกร้า'); this.stage(720, 280, 340, 220); const tex = KG.tex(s, 'rbbasket', 330, 200, c => { c.beginPath(); c.moveTo(10, 40); c.lineTo(320, 40); c.lineTo(290, 190); c.lineTo(40, 190); c.closePath(); c.fillStyle = KG.ui.lin(c, 0, 40, 0, 190, [[0, '#e8b070'], [1, '#b87a3a']]); c.fill(); c.lineWidth = 5; c.strokeStyle = '#2d2a5e'; c.stroke(); c.lineWidth = 3; c.strokeStyle = 'rgba(45,42,94,.4)'; for (let x = 60; x < 300; x += 40) { c.beginPath(); c.moveTo(x, 44); c.lineTo(x - 10, 188); c.stroke(); } c.beginPath(); c.moveTo(10, 40); c.quadraticCurveTo(165, -20, 320, 40); c.lineWidth = 8; c.stroke(); });
    const bk = this.add(s.add.image(720, 290, tex).setDisplaySize(330, 200).setDepth(6)); this.label('0 / ' + n, 720, 400, 40); this.cnt = this.objs[this.objs.length - 1];
    this.mkTarget(720, 300, 320, 220, o => this.placed < n, { wrong: 'พอแล้ว!', obj: bk, multi: true, fit: 0.46, onDrop: (o, t) => { const k = t.cnt - 1; t.slot = { x: 720 + (k - (n - 1) / 2) * 52 - (n > 5 ? 0 : 0), y: 304 + (k % 2) * 6 }; this.cnt.setText(Math.min(n, t.cnt) + ' / ' + n); KG.kit.voice.say(RB.NUMTH[t.cnt], 1.0); } });
    const total = Math.min(9, n + 3), pos = this.gridPos(total, 720, 590, 900, 150, 9); for (let i = 0; i < total; i++) { const im = this.add(KG.kit.itemImage(s, item, pos[i].x, pos[i].y, 88).setDepth(20)); this.mkDrag(im, {}); }
  }
  /* ===================== เรียงลำดับภาพ ===================== */
  r_seq(P) {
    const s = this.s, R = this.R; let cards = [];
    if (P.set === 'day') { const all = ['wakeup', 'brush', 'breakfast', 'school', 'homework', 'bath', 'bed'], len = P.len || 4, start = Math.floor(R() * (all.length - len + 1)); const pick = P.len >= 7 ? all : all.slice(start, start + len); cards = pick.map(id => ({ t: 'day', id })); this.say = 'เรียงกิจกรรมของวันตามลำดับ'; }
    else { const r = P.set != null ? P.set : Math.floor(R() * 4); cards = [0, 1, 2].map(i => ({ t: 'seq', r, i })); }
    const n = cards.length; this.placed = 0; this.needPlace = n; this.setPrompt(P.set === 'day' ? 'เรียงกิจกรรมตามลำดับ ก่อนไปหลัง' : 'เรียงภาพตามลำดับ จากซ้ายไปขวา', P.set === 'day' ? 'เรียงกิจกรรมตามลำดับ ก่อนไปหลัง' : 'ดูว่าอะไรเกิดก่อน อะไรเกิดทีหลัง แล้วเรียงภาพจากซ้ายไปขวา');
    const sz = n <= 3 ? 190 : n === 4 ? 160 : n === 5 ? 140 : 118, gap = 24, tot = n * (sz + gap), x0 = 720 - tot / 2 + (sz + gap) / 2; const slotTex = KG.tex(s, 'rbslot|' + sz, sz + 18, sz + 22, c => { KG.ui.rrect(c, 9, 9, sz, sz, 18); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); c.setLineDash([11, 8]); c.lineWidth = 4.5; c.strokeStyle = '#2d2a5e'; c.stroke(); });
    for (let i = 0; i < n; i++) { const x = x0 + i * (sz + gap); this.add(s.add.image(x, 300, slotTex).setDisplaySize(sz + 18, sz + 22).setDepth(5)); this.label(String(i + 1), x, 300 - sz / 2 - 24, 34, '#ff5a8a'); if (i < n - 1) this.label('›', x + (sz + gap) / 2, 300, 40, '#2d2a5e'); this.mkTarget(x, 300, sz, sz, o => o.dd.i === i, { wrong: 'ยังไม่ใช่ลำดับนี้', fit: 1, slot: { x, y: 300 }, onDrop: (o, t) => { KG.audio.play('star', { i }); } }); }
    K_shuf(R, cards.map((c, i) => i)).forEach((ci, k) => { const x = x0 + k * (sz + gap), g = RB.vis(s, cards[ci], sz), c = this.add(s.add.container(x, 570).setDepth(20)); c.add(g); this.mkDragC(c, sz + 20, sz + 20, { i: ci }); });
  }
  /* ===================== พลิกการ์ดหาคู่ ===================== */
  r_memory(P) {
    const s = this.s, R = this.R, cols = P.cols || 3, rows = P.rows || 2, n = cols * rows, pairs = n / 2, bank = KG.kit.bank(); this.setPrompt('พลิกการ์ดสองใบ หาภาพที่เหมือนกัน', 'พลิกการ์ดทีละสองใบ หาภาพที่เหมือนกัน');
    const pool = K_shuf(R, bank.animal.items.concat(bank.fruit.items, bank.food.items, bank.school.items)).slice(0, pairs), deck = K_shuf(R, pool.concat(pool)), cw = Math.min(150, 760 / cols, 440 / rows), gap = 16; this.flipped = []; this.found = 0; this.lock = false; this.mismatch = 0; this.cards = [];
    const gx = (cw + gap) * cols, gy = (cw + gap) * rows, backTex = KG.tex(s, 'rbback|' + Math.round(cw), cw + 18, cw + 22, c => { KG.ui.rrect(c, 9, 15, cw, cw, 18); c.fillStyle = 'rgba(45,42,94,.25)'; c.fill(); KG.ui.rrect(c, 9, 9, cw, cw, 18); c.fillStyle = KG.ui.lin(c, 0, 9, 0, 9 + cw, [[0, '#c9b0ff'], [1, '#8a5cf0']]); c.fill(); c.lineWidth = 4.5; c.strokeStyle = '#2d2a5e'; c.stroke(); c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '600 ' + Math.round(cw * 0.6) + 'px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 9 + cw / 2, 9 + cw / 2 + 4); });
    deck.forEach((it, i) => {
      const r = Math.floor(i / cols), c0 = i % cols, x = 720 - gx / 2 + (cw + gap) * (c0 + 0.5), y = 440 - gy / 2 + (cw + gap) * (r + 0.5), cont = this.add(s.add.container(x, y).setDepth(10)), face = RB.vis(s, { t: 'pic', item: it }, cw), back = s.add.image(0, 0, backTex).setDisplaySize(cw + 18, cw + 22); face.setVisible(false); cont.add([face, back]); cont.it = it; cont.faceUp = false; cont.matched = false; this.cards.push(cont);
      const z = s.add.zone(0, 0, cw + 10, cw + 10).setInteractive({ useHandCursor: true }); cont.add(z); z.on('pointerdown', () => this.flip(cont, face, back)); cont.setScale(0.01); s.tweens.add({ targets: cont, scaleX: 1, scaleY: 1, duration: 260, delay: i * 40, ease: 'Back.easeOut' });
    });
    this.needPairs = pairs;
  }
  flip(cont, face, back) {
    if (!this.running || this.busy || this.lock || cont.faceUp || cont.matched || this.s.over || this.s.paused) return; const s = this.s; cont.faceUp = true; this.flipped.push(cont); KG.audio.play('tap');
    s.tweens.add({ targets: cont, scaleX: 0.02, duration: 110, onComplete: () => { face.setVisible(true); back.setVisible(false); s.tweens.add({ targets: cont, scaleX: 1, duration: 110 }); } });
    if (this.flipped.length === 2) {
      const [a, b] = this.flipped; this.lock = true;
      if (a.it.id === b.it.id) { s.time.delayedCall(420, () => { a.matched = b.matched = true; this.found++; this.flipped = []; this.lock = false; KG.audio.play('good', { i: this.found }); [a, b].forEach(c => { KG.kit.stars(s, c.x, c.y, undefined, 10); s.tweens.add({ targets: c, scaleX: 1.15, scaleY: 1.15, duration: 150, yoyo: true }); }); if (this.found >= this.needPairs) this.roundOk(720, 440); }); }
      else { s.time.delayedCall(900, () => { [a, b].forEach(c => { const f = c.list[0], bk = c.list[1]; s.tweens.add({ targets: c, scaleX: 0.02, duration: 110, onComplete: () => { f.setVisible(false); bk.setVisible(true); c.faceUp = false; s.tweens.add({ targets: c, scaleX: 1, duration: 110 }); } }); }); this.flipped = []; this.lock = false; }); this.mismatch = (this.mismatch || 0) + 1; if (this.mismatch > this.needPairs + 1) this.h.bad(a.x, a.y, 'ไม่เหมือนกัน', null); else { KG.audio.play('wrong'); KG.fx.pop(s, (a.x + b.x) / 2, (a.y + b.y) / 2 - 30, 'ไม่เหมือนกัน', { size: 26, color: '#e0243d', depth: 80 }); } }
    }
  }
  /* ===================== ต่อสายแบตเตอรี่กับหุ่นยนต์ ===================== */
  r_connect(P) {
    const s = this.s, R = this.R, n = P.n || 3, cols = K_shuf(R, [0, 1, 2, 3]).slice(0, n), order = K_shuf(R, cols); this.setPrompt('ลากเส้นจากแบตเตอรี่ไปหาหุ่นยนต์ที่สีเหมือนกัน', 'ลากสายจากแบตเตอรี่ ไปหาหุ่นยนต์สีเดียวกัน'); this.done = 0; this.links = [];
    const step = Math.min(132, 410 / n), ys = i => 250 + i * step + (n < 4 ? 30 : 0), bsz = Math.min(120, step - 6), L = [], Rr = [];
    cols.forEach((c, i) => { const b = this.add(s.add.image(400, ys(i), 'battery' + c).setDepth(10)); b.setScale(bsz / b.height); b.col = c; const dot = this.add(s.add.circle(530, ys(i), 17, 0xffffff).setStrokeStyle(5, 0x2d2a5e).setDepth(11)); L.push({ c, x: 530, y: ys(i), dot, done: false }); });
    order.forEach((c, i) => { const r = this.add(s.add.image(960, ys(i), 'robot' + c).setDepth(10)); r.setScale(bsz / r.height); const dot = this.add(s.add.circle(850, ys(i), 17, 0xffffff).setStrokeStyle(5, 0x2d2a5e).setDepth(11)); Rr.push({ c, x: 850, y: ys(i), dot, done: false }); });
    this.cL = L; this.cR = Rr; this.wire = null; this.wg = this.add(s.add.graphics().setDepth(9)); this.lineG = this.add(s.add.graphics().setDepth(8));
    this.cDown = pt => { if (!this.running || this.busy) return; const n0 = L.find(o => !o.done && Math.hypot(o.x - pt.worldX, o.y - pt.worldY) < 60); if (n0) { this.wire = n0; KG.audio.play('pop'); } };
    this.cMove = pt => { if (!this.wire) return; this.wg.clear(); this.wg.lineStyle(10, K_hex(KG.kit.COL[RB.COLS4[this.wire.c]]), 0.9); this.wg.lineBetween(this.wire.x, this.wire.y, pt.worldX, pt.worldY); this.wg.fillStyle(0xffffff, 1); this.wg.fillCircle(pt.worldX, pt.worldY, 11); };
    this.cUp = pt => {
      if (!this.wire) return; const w = this.wire; this.wire = null; this.wg.clear(); const t = Rr.find(o => !o.done && Math.hypot(o.x - pt.worldX, o.y - pt.worldY) < 64); if (!t) return;
      if (t.c === w.c) { w.done = t.done = true; this.done++; const col = K_hex(KG.kit.COL[RB.COLS4[w.c]]); this.lineG.lineStyle(12, col, 1); this.lineG.lineBetween(w.x, w.y, t.x, t.y); this.lineG.lineStyle(4, 0xffffff, 0.7); this.lineG.lineBetween(w.x, w.y, t.x, t.y); [w.dot, t.dot].forEach(d => d.setFillStyle(col)); KG.audio.play('charge'); KG.fx.glow(s, t.x + 70, t.y, 0xffe566, 240, 500); KG.kit.stars(s, t.x, t.y, undefined, 10); if (this.done >= n) this.roundOk(700, 400); }
      else { this.bad(t.x, t.y, 'สีไม่ตรงกัน', t.dot); }
    };
    s.input.on('pointerdown', this.cDown); s.input.on('pointermove', this.cMove); s.input.on('pointerup', this.cUp); this.extra = () => { s.input.off('pointerdown', this.cDown); s.input.off('pointermove', this.cMove); s.input.off('pointerup', this.cUp); };
  }
}
const K_pick = (R, a) => a[Math.floor(R() * a.length)];
const K_shuf = (R, a) => KG.kit.shuffle(R, a);
const K_hex = s => KG.kit.hexInt(s);
const R_jit = (R, a) => (R() - 0.5) * a;
const K_tintBg = hex => { const n = parseInt(String(hex).replace('#', ''), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',.2)'; };
