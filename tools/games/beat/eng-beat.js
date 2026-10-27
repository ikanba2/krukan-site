/* ===== จอมจังหวะ: ตัวเกมเพลงจังหวะ =====
   โน้ตตกจากบนลงล่างตามเลน ถึงวงกลมด้านล่างให้กดปุ่มตามเลน (เลน 1–4 ใช้ Space · F J · F Space J · D F J K หรือแตะบนจอ)
   ดนตรีประกอบสร้างสดด้วย WebAudio (กลอง เบส คอร์ด) ตามจังหวะ ส่วนท่วงทำนองมาจากโน้ตที่ผู้เล่นกดถูก
   เวลาของเกมนับจาก update(dt) แล้วจัดเสียงล่วงหน้าไม่เกิน 0.14 วินาที จึงหยุดพักเกมได้และเสียงหยุดตาม
   ตัดสิน: เป๊ะ ≤ 0.075×win · ดี ≤ 0.13×win · พอใช้ ≤ 0.22×win (win ยิ่งมากยิ่งง่าย) · กดโน้ตยาวค้างจนจบแท่ง
   ไม่มีแพ้ตั้งแต่ความแม่นยำ 35% ขึ้นไป (ผ่าน 1 ดาว) · 75% ได้ 2 ดาว · 90% ได้ 3 ดาว */
const BT_KEYS = { 1: [['Space', 'KeyF', 'KeyJ', 'Enter']], 2: [['KeyF', 'ArrowLeft'], ['KeyJ', 'ArrowRight']], 3: [['KeyF', 'ArrowLeft'], ['Space', 'ArrowDown'], ['KeyJ', 'ArrowRight']], 4: [['KeyD', 'ArrowLeft'], ['KeyF', 'ArrowDown'], ['KeyJ', 'ArrowUp'], ['KeyK', 'ArrowRight']] };
const BT_LABEL = { 1: ['Space'], 2: ['F', 'J'], 3: ['F', 'Space', 'J'], 4: ['D', 'F', 'J', 'K'] };
const BT_COL = { 1: [0xff9a2e], 2: [0xff5a8a, 0x3d8bff], 3: [0xff5a8a, 0xffc82e, 0x3d8bff], 4: [0xff5a8a, 0xffc82e, 0x3fe0a0, 0x3d8bff] };
const BT_LW = { 1: 200, 2: 170, 3: 150, 4: 136 };
const BT_HITY = 600, BT_SPAWN = 170, BT_PADR = 48;
const BT_PROG = { M: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']], m: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']] };
const btMidi = n => 440 * Math.pow(2, (n - 69) / 12);
class BeatEng {
  constructor(s, p) {
    this.s = s; this.P = p; this.L = p.lanes; this.spb = 60 / p.bpm; this.lead = p.lead; this.win = p.win; this.laneW = BT_LW[this.L]; this.cols = BT_COL[this.L]; this.keys = BT_KEYS[this.L]; this.labels = BT_LABEL[this.L];
    this.pps = (BT_HITY - BT_SPAWN) / this.lead; this.x0 = 640 - (this.L - 1) * this.laneW / 2; this.prog = BT_PROG[p.minor ? 'm' : 'M'];
    const ch = BCHART.make(p, s.wi * 100 + s.li + 1); this.notes = ch.notes.map((n, i) => ({ id: i, t: n.beat * this.spb, lane: n.lane, len: n.len * this.spb, pair: n.pair, state: 'wait', spr: null, tail: null }));
    this.total = this.notes.length; this.endT = ch.beats * this.spb + 1.0; this.t = -4 * this.spb - 0.35; this.running = false; this.done = false;
    this.stats = { perfect: 0, great: 0, ok: 0, miss: 0, spur: 0 }; this.combo = 0; this.best = 0; this.score = 0; this.meter = 0; this.feverT = 0; this.hits = 0; this.down = {}; this.beatNo = -99; this.nextStep = Math.ceil(this.t / (this.spb / 2)); this.acc = 0; this.sprs = [];
    this.keyLane = {}; this.keys.forEach((arr, ln) => arr.forEach(c => { this.keyLane[c] = ln; }));
    this.build(); this.nd = e => this.nativeDown(e); this.nu = e => this.nativeUp(e); window.addEventListener('keydown', this.nd, true); window.addEventListener('keyup', this.nu, true);
    s.input.addPointer(3); const txt = this.L === 1 ? 'กดปุ่มเว้นวรรคตามจังหวะ เมื่อโน้ตตกถึงวงกลมด้านล่าง' : 'กด ' + this.labels.join(' ') + ' ตามโน้ต เมื่อโน้ตตกถึงวงกลมด้านล่าง'; s.setCard(txt, { say: this.L === 1 ? 'กดปุ่มเว้นวรรคตามจังหวะ เมื่อโน้ตตกถึงวงกลมด้านล่าง' : 'กดปุ่ม ' + this.labels.join(' ') + ' ตามโน้ต เมื่อโน้ตตกถึงวงกลมด้านล่าง' });
  }
  /* ---------- ภาพ ---------- */
  build() {
    const s = this.s, L = this.L, W = this.laneW, hw = L * W / 2 + 18;
    // ไฟสปอตไลต์หมุนช้า ๆ หลังเวที
    this.beams = []; [[200, 76, 0.5], [640, 76, 0], [1080, 76, -0.5]].forEach((b, i) => { const g = s.add.graphics().setDepth(2).setBlendMode('ADD').setAlpha(0.14); g.fillStyle([0xff7ab8, 0x7fe0ff, 0xffd34f][i], 1); g.fillTriangle(0, 0, -150, 760, 150, 760); g.setPosition(b[0], b[1]).setRotation(b[2]); s.tweens.add({ targets: g, rotation: b[2] + (i % 2 ? -0.5 : 0.5), duration: 2600 + i * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.beams.push(g); });
    // ถนนโน้ต
    const g = this.hw = s.add.graphics().setDepth(3); g.fillStyle(0x140c38, 0.82); g.fillRoundedRect(640 - hw, 150, hw * 2, 560, 26); g.lineStyle(5, 0xffffff, 0.5); g.strokeRoundedRect(640 - hw, 150, hw * 2, 560, 26);
    for (let i = 0; i < L; i++) { const cx = this.x0 + i * W; g.fillStyle(this.cols[i], 0.1 + (i % 2) * 0.05); g.fillRect(cx - W / 2 + 3, 156, W - 6, 548); g.fillStyle(this.cols[i], 0.55); g.fillRect(cx - W / 2 + 3, 156, 3, 548); g.fillRect(cx + W / 2 - 6, 156, 3, 548); }
    g.fillStyle(0xffffff, 0.9); g.fillRect(640 - hw + 8, BT_HITY - 3, hw * 2 - 16, 6); this.glowLine = s.add.rectangle(640, BT_HITY, hw * 2 - 10, 24, 0xffffff, 0.2).setDepth(4).setBlendMode('ADD');
    this.lines = s.add.graphics().setDepth(5);
    // วงกลมปุ่ม (แตะบนจอได้ทั้งเลน)
    this.pads = []; for (let i = 0; i < L; i++) {
      const cx = this.x0 + i * W, c = this.cols[i], pad = s.add.container(cx, BT_HITY).setDepth(12);
      const tex = KG.tex(s, 'btpad|' + c + '|' + (this.labels[i] === 'Space' ? 'S' : 'K'), BT_PADR * 2 + 24, BT_PADR * 2 + 28, ctx => { const m = 12, r = BT_PADR; ctx.beginPath(); ctx.arc(m + r, m + r + 7, r, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(); ctx.beginPath(); ctx.arc(m + r, m + r, r, 0, 7); ctx.fillStyle = KG.ui.lin(ctx, 0, m, 0, m + 2 * r, [[0, '#ffffff'], [1, btShade(c, 0.78)]]); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = btCss(c); ctx.stroke(); ctx.beginPath(); ctx.arc(m + r, m + r, r - 11, 0, 7); ctx.fillStyle = 'rgba(20,12,56,.78)'; ctx.fill(); });
      const img = s.add.image(0, 0, tex).setDisplaySize(BT_PADR * 2 + 24, BT_PADR * 2 + 28), lab = KG.txt(s, 0, -2, this.labels[i], { size: this.labels[i] === 'Space' ? 24 : 42, color: '#ffffff', center: true, middle: true, stroke: '#140c38', sw: 6 });
      const glow = s.add.image(0, 0, 'fx_glow').setTint(c).setBlendMode('ADD').setDisplaySize(190, 190).setAlpha(0); pad.add([glow, img, lab]); pad.glow = glow; pad.img = img; this.pads.push(pad);
      const z = s.add.zone(cx, 430, W - 4, 560).setInteractive({ useHandCursor: true }).setDepth(14); z.on('pointerdown', () => this.press(i)); z.on('pointerup', () => this.release(i)); z.on('pointerout', () => this.release(i));
    }
    // ผู้ชมหุ่นยนต์เต้นตามจังหวะ
    this.fans = []; const lx = 640 - hw - 40, rx = 640 + hw + 40, pos = [[lx - 250, 340], [lx - 130, 420], [lx - 20, 340], [rx + 20, 340], [rx + 130, 420], [rx + 250, 340]];
    pos.forEach((q, i) => { const r = s.add.image(q[0], q[1], 'robot' + (i % 4)).setDepth(6); r.setScale(96 / r.height); r.by = q[1]; this.fans.push(r); });
    // คอมโบ ไฟเฟเวอร์ และความแม่นยำ (ขวาล่าง)
    this.cmbLab = KG.txt(s, 1100, 500, 'คอมโบ', { size: 22, color: '#ffffff', center: true, middle: true, stroke: '#140c38', sw: 6 }).setDepth(9); this.cmbT = KG.txt(s, 1100, 560, '0', { size: 76, color: '#ffd34f', center: true, middle: true, stroke: '#140c38', sw: 10 }).setDepth(9);
    this.fvBar = KG.ui.bar(s, 1008, 630, 184, 18, { value: 0, color: 0xff7ab8 }).setDepth(9); this.fvT = KG.txt(s, 1100, 664, 'FEVER', { size: 20, color: '#ffffff', center: true, middle: true, stroke: '#140c38', sw: 6 }).setDepth(9);
    // แถบความคืบหน้าของเพลงใต้ป้ายคำสั่ง
    this.pg = s.add.graphics().setDepth(9);
  }
  /* ---------- เริ่ม / หยุด ---------- */
  start() { this.running = true; }
  stop() { this.running = false; }
  destroy() { this.running = false; window.removeEventListener('keydown', this.nd, true); window.removeEventListener('keyup', this.nu, true); this.sprs.forEach(o => { if (o && o.scene) o.destroy(); }); }
  nativeDown(e) {
    const s = this.s, ln = this.keyLane[e.code]; if (ln == null) return; if (s.over || s.paused || (s._modal && !s._modal.closed)) return; e.preventDefault(); if (e.repeat || !this.running) return; this.press(ln);
  }
  nativeUp(e) { const ln = this.keyLane[e.code]; if (ln == null) return; this.release(ln); }
  /* ---------- กดและตัดสิน ---------- */
  press(ln) {
    if (!this.running || this.done || this.down[ln]) return; this.down[ln] = true; this.padFx(ln, true); const w = this.win; let best = null, bd = 9;
    this.notes.forEach(n => { if (n.lane === ln && n.state === 'fly') { const ad = Math.abs(this.t - n.t); if (ad <= 0.22 * w && ad < bd) { best = n; bd = ad; } } });
    if (!best) { this.stats.spur++; KG.audio.play('tap'); return; }
    const g = bd <= 0.075 * w ? 'perfect' : bd <= 0.13 * w ? 'great' : 'ok'; this.hit(best, g);
  }
  release(ln) {
    if (!this.down[ln]) return; this.down[ln] = false; this.padFx(ln, false);
    this.notes.forEach(n => { if (n.lane === ln && n.state === 'hold') { const early = this.t < n.t + n.len - 0.2 * this.win; this.endHold(n, !early); } });
  }
  hit(n, g) {
    const s = this.s, x = this.x0 + n.lane * this.laneW; this.stats[g]++; this.hits++; this.combo++; this.best = Math.max(this.best, this.combo);
    const base = g === 'perfect' ? 100 : g === 'great' ? 70 : 40, mul = (1 + Math.min(this.combo, 40) * 0.02) * (this.feverT > 0 ? 2 : 1); this.score += Math.round(base * mul); s.score = this.score;
    this.meter = Math.min(20, this.meter + (g === 'perfect' ? 2 : 1)); if (this.meter >= 20 && this.feverT <= 0) this.startFever();
    this.melody(n); const col = this.cols[n.lane], txt = g === 'perfect' ? 'เป๊ะเลย!' : g === 'great' ? 'ดีมาก' : 'โอเค';
    KG.fx.pop(s, x, BT_HITY - 96, txt, { size: g === 'perfect' ? 34 : 28, color: g === 'perfect' ? '#ffd34f' : g === 'great' ? '#7fe0ff' : '#ffffff', depth: 80 }); KG.fx.ring(s, x, BT_HITY, col, { size: g === 'perfect' ? 1.9 : 1.4, w: 0.4, depth: 61 }); KG.fx.burst(s, x, BT_HITY, { colors: [col, 0xffffff, 0xffd34f], n: g === 'perfect' ? 16 : 9, max: 280, depth: 62, life: 520 });
    if (n.len > 0) { n.state = 'hold'; n.held = this.t; } else { n.state = 'done'; this.kill(n, true); }
    if (this.combo % 10 === 0) { KG.audio.play('combo', { i: this.combo / 10 }); s.coach.react('good'); }
    this.bump(); s.refreshPips(); if (s.onHit) s.onHit(this);
  }
  endHold(n, ok) { n.state = 'done'; if (ok) { this.score += 60; this.s.score = this.score; KG.fx.pop(this.s, this.x0 + n.lane * this.laneW, BT_HITY - 130, 'ค้างได้สุดยอด', { size: 26, color: '#7fe0ff', depth: 80 }); KG.audio.play('coin'); } this.kill(n, ok); }
  kill(n, good) { const s = this.s; if (n.spr) { const o = n.spr; n.spr = null; s.tweens.killTweensOf(o); s.tweens.add({ targets: o, scaleX: good ? 1.7 : 0.6, scaleY: good ? 1.7 : 0.6, alpha: 0, duration: 200, onComplete: () => o.destroy() }); } if (n.tail) { const t = n.tail; n.tail = null; t.destroy(); } }
  missNote(n) {
    n.state = 'miss'; this.stats.miss++; this.combo = 0; this.meter = Math.max(0, this.meter - 3); if (this.feverT > 0) { this.feverT = 0; this.endFever(); } const s = this.s, x = this.x0 + n.lane * this.laneW;
    if (n.spr) { const o = n.spr; n.spr = null; o.setTint(0x888899); s.tweens.add({ targets: o, alpha: 0, y: o.y + 70, duration: 380, onComplete: () => o.destroy() }); } if (n.tail) { const t = n.tail; n.tail = null; s.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() }); }
    KG.audio.play('wrong'); KG.fx.pop(s, x, BT_HITY - 90, 'พลาด', { size: 26, color: '#ff6b7a', depth: 80 }); s.mist = this.stats.miss; this.bump();
  }
  padFx(ln, on) { const p = this.pads[ln]; if (on) { const fl = this.s.add.rectangle(this.x0 + ln * this.laneW, BT_HITY - 150, this.laneW - 8, 320, this.cols[ln], 0.38).setDepth(6).setBlendMode('ADD'); this.s.tweens.add({ targets: fl, alpha: 0, duration: 260, onComplete: () => fl.destroy() }); } this.s.tweens.killTweensOf(p); this.s.tweens.add({ targets: p, scaleX: on ? 0.88 : 1, scaleY: on ? 0.88 : 1, duration: 70 }); p.glow.setAlpha(on ? 0.9 : 0); }
  bump() { this.cmbT.setText(String(this.combo)); this.cmbT.setColor(this.feverT > 0 ? '#ff7ab8' : '#ffd34f'); this.s.tweens.killTweensOf(this.cmbT); this.cmbT.setScale(1.25); this.s.tweens.add({ targets: this.cmbT, scaleX: 1, scaleY: 1, duration: 160 }); this.fvBar.setValue(this.feverT > 0 ? this.feverT / 8 : this.meter / 20, 120); }
  startFever() { this.feverT = 8; KG.audio.play('magic'); this.s.coach.act('dance', 2400); KG.kit.banner(this.s, 'เฟเวอร์! คะแนนสองเท่า', '#ff7ab8', 1100); KG.fx.confetti(this.s, { ms: 900 }); this.hw.setAlpha(1); this.fans.forEach(f => this.s.tweens.add({ targets: f, scaleX: f.scaleX * 1.15, scaleY: f.scaleY * 1.15, duration: 160, yoyo: true, repeat: 3 })); this.fvT.setText('FEVER x2').setColor('#ff7ab8'); }
  endFever() { this.meter = 0; this.fvT.setText('FEVER').setColor('#ffffff'); this.fvBar.setValue(0, 200); }
  /* ---------- เสียงท่วงทำนองที่ผู้เล่นกดถูก ---------- */
  chordAt(bar) { const c = this.prog[((bar % 4) + 4) % 4], third = c[1] === 'm' ? 3 : 4; return { off: c[0], tones: [0, third, 7, 12] }; }
  melody(n) {
    const A = KG.audio; if (!A.ready || !A.sfxOn) return; const bar = Math.floor(n.t / (this.spb * 4)), c = this.chordAt(bar), idx = this.L === 1 ? [0, 1, 2, 1][n.id % 4] : (this.L === 2 ? [0, 2][n.lane] : (this.L === 3 ? [0, 1, 2][n.lane] : n.lane)), f = btMidi(this.P.root + c.off + c.tones[idx] + 12);
    A.tone({ f, t: 0.34, type: 'triangle', vol: 0.17 }); A.tone({ f: f * 2, t: 0.18, type: 'sine', vol: 0.05 });
  }
  /* ---------- ดนตรีประกอบ (จัดล่วงหน้าตามเวลาเกม) ---------- */
  sched() {
    const A = KG.audio; if (!A.ready || !A.musOn) { this.nextStep = Math.ceil((this.t + 0.14) / (this.spb / 2)); return; } const half = this.spb / 2, until = this.t + 0.14, bus = A.musBus;
    while (this.nextStep * half <= until) {
      const k = this.nextStep++, at = k * half, delay = Math.max(0, at - this.t);
      if (k < 0) { if (k % 2 === 0) A.tone({ f: k % 4 === 0 ? 1500 : 1000, t: 0.05, type: 'square', vol: 0.09, delay, bus }); continue; }
      const st = k % 8, bar = Math.floor(k / 8), ch = this.chordAt(bar), dance = this.P.bpm >= 96;
      if (st === 0 || st === 4 || (dance && (st === 2 || st === 6))) A.tone({ f: 150, f2: 42, t: 0.17, type: 'sine', vol: 0.5, delay, bus });
      if (st === 2 || st === 6) A.noise({ f: 1900, t: 0.12, vol: 0.2, q: 0.8, delay, bus });
      if (st % 2 === 1) A.noise({ f: 8000, t: 0.04, vol: 0.07, ft: 'highpass', delay, bus }); else if (st % 4 === 0) A.noise({ f: 8000, t: 0.03, vol: 0.035, ft: 'highpass', delay, bus });
      if (st === 0 || st === 4) A.tone({ f: btMidi(this.P.root + ch.off - 24), t: this.spb * 1.9, type: 'triangle', vol: 0.24, delay, bus });
      if (st === 0) [0, ch.tones[1], 7].forEach(iv => A.tone({ f: btMidi(this.P.root + ch.off + iv), t: this.spb * 3.6, type: 'sine', vol: 0.045, a: 0.06, delay, bus }));
      if (this.feverT > 0 && st % 2 === 1) A.noise({ f: 5200, t: 0.06, vol: 0.06, ft: 'bandpass', delay, bus });
    }
  }
  /* ---------- ทุกเฟรม ---------- */
  update(tm, dt) {
    if (!this.running || this.done) return; const s = this.s; this.t += Math.min(dt, 50) / 1000; this.sched();
    const spawnT = this.t + this.lead;
    this.notes.forEach(n => {
      if (n.state === 'wait' && n.t <= spawnT) this.spawn(n);
      if (n.state === 'fly') { if (this.t - n.t > 0.22 * this.win) this.missNote(n); else this.place(n); }
      else if (n.state === 'hold') { this.place(n, true); if (this.t >= n.t + n.len) this.endHold(n, !!this.down[n.lane]); }
    });
    // เส้นจังหวะที่เลื่อนลงมา + จังหวะของผู้ชม
    const g = this.lines; g.clear(); const b0 = Math.ceil((this.t - 0.1) / this.spb); for (let b = b0; b * this.spb <= spawnT; b++) { const y = BT_HITY - (b * this.spb - this.t) * this.pps; if (y < 156 || y > 700) continue; g.lineStyle(b % 4 === 0 ? 4 : 2, 0xffffff, b % 4 === 0 ? 0.4 : 0.16); g.lineBetween(640 - this.L * this.laneW / 2, y, 640 + this.L * this.laneW / 2, y); }
    const bn = Math.floor(this.t / this.spb); if (bn !== this.beatNo) { this.beatNo = bn; this.onBeat(bn); }
    if (this.feverT > 0) { this.feverT -= dt / 1000; this.fvBar.setValue(Math.max(0, this.feverT / 8), 0); this.hw.setAlpha(0.8 + Math.sin(this.t * 14) * 0.2); if (this.feverT <= 0) this.endFever(); }
    // ความคืบหน้าของเพลง
    const f = Math.max(0, Math.min(1, this.t / (this.endT - 1))); this.pg.clear(); this.pg.fillStyle(0xffffff, 0.45); this.pg.fillRoundedRect(380, 152, 520, 8, 4); this.pg.fillStyle(0xffd34f, 1); this.pg.fillRoundedRect(380, 152, 520 * f, 8, 4);
    if (this.t >= this.endT) this.finish();
  }
  spawn(n) {
    const s = this.s, c = this.cols[n.lane], x = this.x0 + n.lane * this.laneW; n.state = 'fly';
    const tex = KG.tex(s, 'btnote|' + c, 100, 104, ctx => { const m = 6, r = 44; ctx.beginPath(); ctx.arc(m + r, m + r + 5, r, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill(); ctx.beginPath(); ctx.arc(m + r, m + r, r, 0, 7); ctx.fillStyle = KG.ui.lin(ctx, 0, m, 0, m + 2 * r, [[0, btShade(c, 1.3)], [1, btShade(c, 0.82)]]); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(m + r - 10, m + r - 20, 22, 11, -0.4, 0, 7); ctx.fill(); });
    const o = s.add.image(x, BT_SPAWN, tex).setDepth(8).setDisplaySize(96, 100); n.spr = o; this.sprs.push(o);
    if (n.len > 0) { const len = n.len * this.pps, t = s.add.graphics().setDepth(7); t.fillStyle(c, 0.85); t.fillRoundedRect(-24, -len, 48, len, 24); t.lineStyle(4, 0xffffff, 0.9); t.strokeRoundedRect(-24, -len, 48, len, 24); n.tail = t; this.sprs.push(t); }
    this.place(n);
  }
  place(n, holding) {
    const x = this.x0 + n.lane * this.laneW, y = holding ? BT_HITY : BT_HITY - (n.t - this.t) * this.pps; if (n.spr) n.spr.setPosition(x, y); if (n.tail) { n.tail.setPosition(x, y); if (holding) { n.tail.setScale(1, Math.max(0.01, (n.t + n.len - this.t) / n.len)); } }
  }
  onBeat(b) {
    this.glowLine.setAlpha(0.5); this.s.tweens.add({ targets: this.glowLine, alpha: 0.2, duration: 260 }); const amp = this.feverT > 0 ? 18 : 10;
    this.fans.forEach((f, i) => { this.s.tweens.killTweensOf(f); f.y = f.by; this.s.tweens.add({ targets: f, y: f.by - amp, angle: (i % 2 ? 6 : -6) * (b % 2 ? 1 : -1), duration: 110, yoyo: true, onComplete: () => f.setAngle(0) }); });
  }
  finish() {
    if (this.done) return; this.done = true; this.running = false; const st = this.stats; this.acc = this.total ? (st.perfect + st.great * 0.8 + st.ok * 0.55) / this.total : 1; this.s.finishSong(this);
  }
}
const btCss = c => '#' + c.toString(16).padStart(6, '0');
const btShade = (c, k) => { const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return 'rgb(' + f(c >> 16) + ',' + f((c >> 8) & 255) + ',' + f(c & 255) + ')'; };
