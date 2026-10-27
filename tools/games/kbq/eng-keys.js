/* ===== ภารกิจแป้นพิมพ์: ตัวเกมแบบหลายรอบ ทุกด่านเป็นชุดโจทย์ (kinds) วนตามจำนวนรอบ (rounds) =====
   โจทย์ที่มี: key (หาปุ่ม) · arrow (ลูกศร) · space (กดเว้นวรรคตามจำนวน) · light (รอไฟเขียว) · word (พิมพ์คำจากภาพ) · sum (กดคำตอบเลข)
              special (Enter/Backspace/Tab/Esc) · shift (ตัวพิมพ์ใหญ่) · combo (คีย์ลัด Ctrl + ตัวอักษร)
   รับปุ่มจากคีย์บอร์ดจริง (ฟัง keydown ที่ window แล้วห้ามค่าปริยายของเบราว์เซอร์) และจากการแตะแป้น/ปุ่มบนจอ (สำหรับจอสัมผัส)
   พลาดไม่ตกด่าน: พลาดครบสองครั้งในรอบเดียวจะมีไฟใบ้ปุ่มที่ถูก · ด่านมี time = จับเวลา · this.exp = ปุ่มถัดไปที่ต้องกด (บอททดสอบใช้) */
const KQ_NUM = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ'];
const KQ_LET = { a: 'เอ', b: 'บี', c: 'ซี', d: 'ดี', e: 'อี', f: 'เอฟ', g: 'จี', h: 'เอช', i: 'ไอ', j: 'เจ', k: 'เค', l: 'แอล', m: 'เอ็ม', n: 'เอ็น', o: 'โอ', p: 'พี', q: 'คิว', r: 'อาร์', s: 'เอส', t: 'ที', u: 'ยู', v: 'วี', w: 'ดับเบิลยู', x: 'เอ็กซ์', y: 'วาย', z: 'แซด' };
const KQ_SAY = { ';': 'เครื่องหมายอัฒภาค', Enter: 'เอ็นเทอร์', Backspace: 'แบ็คสเปซ', Tab: 'แท็บ', Esc: 'เอสเคป', Shift: 'ชิฟต์', Ctrl: 'คอนโทรล', Space: 'เว้นวรรค' };
const kqSay = lb => /^[a-z]$/i.test(lb) ? KQ_LET[lb.toLowerCase()] : /^[0-9]$/.test(lb) ? KQ_NUM[+lb] : (KQ_SAY[lb] || lb);
const KQ_MOD = { ShiftLeft: 1, ShiftRight: 1, ControlLeft: 1, ControlRight: 1, AltLeft: 1, AltRight: 1, MetaLeft: 1, MetaRight: 1, CapsLock: 1 };
const KQ_COMBO = {
  copy: { code: 'KeyC', th: 'คัดลอก', en: 'Copy', say: 'คัดลอกข้อความ' }, paste: { code: 'KeyV', th: 'วาง', en: 'Paste', say: 'วางข้อความ' }, undo: { code: 'KeyZ', th: 'ย้อนกลับ', en: 'Undo', say: 'ย้อนกลับ' },
  save: { code: 'KeyS', th: 'บันทึก', en: 'Save', say: 'บันทึกงาน' }, all: { code: 'KeyA', th: 'เลือกทั้งหมด', en: 'Select All', say: 'เลือกข้อความทั้งหมด' }
};
const kqPick = (R, a) => a[Math.floor(R() * a.length)];
class KeyEng {
  constructor(s, p) {
    this.s = s; this.p = Object.assign({ rounds: 4, kinds: [] }, p); this.R = s.R; this.objs = []; this.round = 0; this.alive = true; this.running = false; this.busy = false; this.kb = null; this.kbOn = false; this.exp = null; this.curKind = null; this.used = {};
    s.setGoal(this.p.rounds); if (this.p.time) s.setTimer(this.p.time);
    this.nat = e => this.nativeDown(e); this.natUp = e => this.nativeUp(e); window.addEventListener('keydown', this.nat, true); window.addEventListener('keyup', this.natUp, true);
    this.latchShift = false; this.latchCtrl = false; this.setPrompt('พร้อมแล้ว กดปุ่มให้ถูกนะ');
  }
  start() { this.running = true; this.nextRound(); }
  stop() { this.running = false; }
  destroy() { this.alive = false; this.running = false; window.removeEventListener('keydown', this.nat, true); window.removeEventListener('keyup', this.natUp, true); this.clear(); if (this.kb) { this.kb.destroy(); this.kb = null; } }
  add(o) { this.objs.push(o); return o; }
  clear() { this.objs.forEach(o => { if (o && o.scene) { this.s.tweens.killTweensOf(o); o.destroy(); } }); this.objs = []; if (this.kb) this.kb.clearHint(); }
  setPrompt(text, say) { this.curSay = say || text; this.s.setCard(text, { say: this.curSay }); }
  wantsEsc() { return this.running && this.curKind === 'special' && this.curSpecial === 'Escape'; }
  /* ---------- รับปุ่ม ---------- */
  nativeDown(e) {
    const s = this.s; if (!this.alive) return; const tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA') return;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { if (this.kb && this.kbOn) this.kb.setShiftHeld(true); }
    if (!this.running || this.busy || s.over || s.paused || (s._modal && !s._modal.closed)) return;
    const ctl = e.ctrlKey || e.metaKey; if ((!ctl || /^Key[CVZSAX]$/.test(e.code)) && !e.altKey && !/^F\d+$/.test(e.code)) { if (e.code !== 'Escape' || this.wantsEsc()) e.preventDefault(); }
    if (e.repeat) return; this.feed(e.code, { shift: e.shiftKey, ctrl: ctl, caps: !!(e.getModifierState && e.getModifierState('CapsLock')) });
  }
  nativeUp(e) { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { if (this.kb && this.kbOn && !this.latchShift) this.kb.setShiftHeld(false); } }
  feed(code, m) {
    if (!this.running || this.busy || this.s.over) return; m = m || {}; if (/^Numpad\d$/.test(code)) code = 'Digit' + code[6];
    if (this.kb && this.kbOn && KQ_MOD[code] && /^(Shift|Control)/.test(code)) this.kb.press(code);
    const fn = this['k_' + this.curKind]; if (fn) fn.call(this, code, m);
  }
  // แตะแป้นบนจอ (จอสัมผัส): Shift/Ctrl เป็นปุ่มค้าง แตะหนึ่งครั้งแล้วอักษรถัดไปจะใช้ร่วมกัน
  tap(code) {
    if (!this.running || this.busy) return;
    if (code === 'ShiftLeft' || code === 'ShiftRight') { this.latchShift = !this.latchShift; if (this.kb) { this.kb.setLatch(['ShiftLeft', 'ShiftRight'], this.latchShift); } return; }
    const m = { shift: this.latchShift }; if (this.latchShift && !/^Shift/.test(code)) { this.latchShift = false; if (this.kb) this.kb.setLatch(['ShiftLeft', 'ShiftRight'], false); } this.feed(code, m);
  }
  update(t, dt) {
    if (this.curKind === 'light' && this.lightSt === 'red' && !this.busy) { this.wait -= dt; if (this.wait <= 0) this.turnGreen(); }
  }
  /* ---------- วนรอบ ---------- */
  nextRound() {
    if (!this.alive || this.s.over) return; this.clear(); this.busy = false; this.exp = null; this.lightSt = null; this.hands = null; this.chips = null; this.errs = 0; this.latchCtrl = false; const k = this.p.kinds[this.round % this.p.kinds.length], fn = this['r_' + k.k]; this.curKind = k.k; this.curSpecial = k.key || null; this.P = k;
    if (!fn) { this.roundOk(640, 400); return; }
    fn.call(this, k); if (this.curSay) KG.kit.voice.say(this.curSay);
  }
  roundOk(x, y, o) {
    if (this.busy) return; this.busy = true; this.exp = null; const s = this.s; this.round++; s.ok(x, y, Object.assign({ cheer: true }, o || {}));
    if (this.round >= this.p.rounds) return;
    s.time.delayedCall(1000, () => { if (this.alive && !s.over) this.nextRound(); });
  }
  bad(x, y, m, obj) {
    this.errs = (this.errs || 0) + 1; this.s.bad(x, y, m); if (obj && obj.scene) { this.s.tweens.killTweensOf(obj); const o = obj, sx = o.x; this.s.tweens.add({ targets: o, x: sx + 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => o.setX(sx) }); }
  }
  showKb(on) {
    if (on) { if (!this.kb) { this.kb = new OnScreenKeyboard(this.s, 262, 448, 'en'); this.kb.root.setDepth(20); this.kb.onTap = code => this.tap(code); [['Backspace', 'Backspace'], ['Enter', 'Enter'], ['Space', 'เว้นวรรค (Space)'], ['CapsLock', 'Caps Lock']].forEach(a => { const k = this.kb.keys[a[0]]; if (k) { k.special = a[1]; this.kb.legend(k, false); } }); } this.kb.root.setVisible(true); this.kb.setShiftHeld(false); this.latchShift = false; this.kb.setLatch(['ShiftLeft', 'ShiftRight'], false); }
    else if (this.kb) { this.kb.clearHint(); this.kb.root.setVisible(false); } this.kbOn = on;
  }
  label(text, x, y, size, color, st) { return this.add(KG.txt(this.s, x, y, text, { size: size || 34, color: color || '#2d2a5e', center: true, middle: true, stroke: st || '#ffffff', sw: 7 }).setDepth(12)); }
  panel(x, y, w, h) { const g = this.add(this.s.add.graphics().setDepth(4)); g.fillStyle(0xffffff, 0.6); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 26); g.lineStyle(4, 0x2d2a5e, 0.35); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 26); return g; }
  /* ===================== หาปุ่ม ===================== */
  r_key(P) {
    const s = this.s, R = this.R, set = Array.isArray(P.set) ? P.set : P.set.split(''), n = P.seq || 1, seq = []; let last = this.lastKey;
    for (let i = 0; i < n; i++) { let c, g = 0; do { c = kqPick(R, set); } while (set.length > 1 && c === last && g++ < 12); seq.push(KV.code2ch(c)); last = c; } this.lastKey = last;
    this.seq = seq; this.i = 0; this.hintOn = !!P.hint; const labels = seq.map(c => KV.ch2label(c));
    this.setPrompt(n === 1 ? 'กดปุ่ม ' + labels[0].toUpperCase() + ' บนแป้นพิมพ์' : 'กดปุ่ม ' + labels.map(l => l.toUpperCase()).join(' ') + ' ตามลำดับ', n === 1 ? 'กดปุ่ม ' + kqSay(labels[0]) + ' บนแป้นพิมพ์' : 'กดปุ่มตามลำดับ ' + labels.map(kqSay).join(' '));
    this.showKb(true); const fin = !!P.finger, w = n === 1 ? 170 : 116, h = n === 1 ? 130 : 96, gap = 18, tot = n * (w + gap), cx = fin ? 400 : 720, x0 = cx - tot / 2 + (w + gap) / 2, y = fin ? 270 : 262;
    this.panel(cx, y, Math.max(tot + 60, 300), h + 70);
    this.chips = labels.map((lb, i) => { const c = this.add(KV.cap(s, x0 + i * (w + gap), y, w, h, lb.toUpperCase(), i === 0 ? 'next' : 'norm', { size: n === 1 ? 84 : 54 })); c.setDepth(12); return c; });
    this.pulse(this.chips[0]); this.hands = fin ? this.add(KV.hands(s, 880, 226)) : null; if (this.hands) this.hands.setDepth(12).setScale(1.12); this.refresh();
  }
  pulse(c) { if (!c) return; this.s.tweens.killTweensOf(c); c.setScale(1); this.s.tweens.add({ targets: c, scaleX: 1.07, scaleY: 1.07, duration: 420, yoyo: true, repeat: -1 }); }
  refresh() {
    const code = this.seq && this.seq[this.i]; this.exp = code ? { code } : null;
    if (this.kb && this.kbOn) { if (code && (this.hintOn || this.errs >= 2)) this.kb.hint([code]); else this.kb.clearHint(); } if (this.hands && code) this.hands.show(code);
  }
  k_key(code, m) {
    if (KQ_MOD[code]) return; const want = this.seq[this.i], c = this.chips[this.i];
    if (code === want) {
      if (this.kb) this.kb.press(code, true); this.s.tweens.killTweensOf(c); c.setScale(1); c.setState2('ok'); KG.audio.play('coin', { i: this.i }); KG.kit.stars(this.s, c.x, c.y, undefined, 8); this.i++;
      if (this.i >= this.seq.length) { this.exp = null; this.roundOk(c.x, c.y); } else { this.chips[this.i].setState2('next'); this.pulse(this.chips[this.i]); this.refresh(); }
    } else { if (this.kb) this.kb.press(code, false); this.bad(c.x, c.y, 'ยังไม่ใช่ปุ่มนี้', c); if (this.errs === 2) this.refresh(); }
  }
  /* ===================== ลูกศร ===================== */
  r_arrow(P) {
    const s = this.s, R = this.R, codes = { ud: ['ArrowUp', 'ArrowDown'], lr: ['ArrowLeft', 'ArrowRight'], udlr: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] }[P.dirs || 'udlr'], C = 6, Rw = 3, cell = 84, len = P.len || 3;
    let st, path, end, tries = 0;
    do {
      st = { x: P.dirs === 'ud' ? 1 + Math.floor(R() * 4) : Math.floor(R() * C), y: P.dirs === 'lr' ? 1 : Math.floor(R() * Rw) }; path = []; let p = { x: st.x, y: st.y };
      for (let i = 0; i < len; i++) { const opts = codes.filter(c => { const d = KV.DIRS[c], nx = p.x + d.dx, ny = p.y + d.dy; return nx >= 0 && nx < C && ny >= 0 && ny < Rw && !(path.length && c === this.rev(path[path.length - 1])); }); const c = kqPick(R, opts.length ? opts : codes.filter(c => { const d = KV.DIRS[c], nx = p.x + d.dx, ny = p.y + d.dy; return nx >= 0 && nx < C && ny >= 0 && ny < Rw; })); path.push(c); p = { x: p.x + KV.DIRS[c].dx, y: p.y + KV.DIRS[c].dy }; }
      end = p;
    } while (end.x === st.x && end.y === st.y && tries++ < 30);
    this.seq = path; this.i = 0; this.pos = { x: st.x, y: st.y }; this.showKb(false);
    this.setPrompt('กดลูกศรตามลำดับ พาหุ่นยนต์ไปเก็บดาว', 'กดลูกศรตามลำดับ พาหุ่นยนต์ไปเก็บดาว');
    const x0 = 720 - C * cell / 2, y0 = 330, cx = c => x0 + c * cell + cell / 2, cy = r => y0 + r * cell + cell / 2; this.cx = cx; this.cy = cy;
    const g = this.add(s.add.graphics().setDepth(4)); for (let r = 0; r < Rw; r++) for (let c = 0; c < C; c++) { g.fillStyle((r + c) % 2 ? 0xdff3ff : 0xffffff, 0.82); g.fillRoundedRect(x0 + c * cell + 3, y0 + r * cell + 3, cell - 6, cell - 6, 14); }
    g.lineStyle(4, 0x2d2a5e, 0.45); g.strokeRoundedRect(x0 - 2, y0 - 2, C * cell + 4, Rw * cell + 4, 20);
    this.star = this.add(s.add.image(cx(end.x), cy(end.y), 'star2').setDepth(8)); this.star.setScale(60 / this.star.height); s.tweens.add({ targets: this.star, angle: { from: -10, to: 10 }, duration: 600, yoyo: true, repeat: -1 });
    this.bot = this.add(s.add.image(cx(st.x), cy(st.y), 'robot0').setDepth(9)); this.bot.setScale(74 / this.bot.height);
    const sz = 84, gap = 14, tot = len * (sz + gap), cx0 = 720 - tot / 2 + (sz + gap) / 2; this.chips = path.map((c, i) => { const im = this.add(s.add.image(cx0 + i * (sz + gap), 232, KV.arrowTex(s, c, sz)).setDisplaySize(sz + 18, sz + 22).setDepth(12)); if (i) im.setAlpha(0.8); return im; }); this.pulseImg(this.chips[0]);
    this.arrowBtns();
    this.refreshArrow();
  }
  rev(c) { return { ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp', ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' }[c]; }
  pulseImg(im) { if (!im) return; this.s.tweens.killTweensOf(im); im.setScale(im.scaleX); const sx = im.scaleX, sy = im.scaleY; this.s.tweens.add({ targets: im, scaleX: sx * 1.1, scaleY: sy * 1.1, duration: 420, yoyo: true, repeat: -1 }); }
  arrowBtns() {
    const s = this.s, sz = 66, pos = { ArrowUp: [1150, 540], ArrowLeft: [1074, 618], ArrowDown: [1150, 618], ArrowRight: [1226, 618] }; this.abtn = {};
    Object.keys(pos).forEach(c => { const im = this.add(s.add.image(pos[c][0], pos[c][1], KV.arrowTex(s, c, sz)).setDisplaySize(sz + 14, sz + 18).setDepth(12)); im.setInteractive({ useHandCursor: true }); im.on('pointerdown', () => { if (this.running && !this.busy) this.feed(c, {}); }); this.abtn[c] = im; });
  }
  refreshArrow() { const c = this.seq[this.i]; this.exp = c ? { code: c } : null; Object.keys(this.abtn).forEach(k => { const im = this.abtn[k]; this.s.tweens.killTweensOf(im); im.setScale(im.scaleX > 0 ? 1 : 1); im.setDisplaySize(84, 84); if (c && k === c && this.errs >= 2) this.s.tweens.add({ targets: im, scaleX: im.scaleX * 1.18, scaleY: im.scaleY * 1.18, duration: 260, yoyo: true, repeat: -1 }); }); }
  k_arrow(code) {
    if (!KV.DIRS[code]) { if (!KQ_MOD[code]) this.bad(this.bot.x, this.bot.y, 'กดปุ่มลูกศรนะ', this.chips[this.i]); return; }
    const want = this.seq[this.i], im = this.chips[this.i];
    if (code === want) {
      const d = KV.DIRS[code]; this.pos = { x: this.pos.x + d.dx, y: this.pos.y + d.dy }; this.s.tweens.killTweensOf(im); im.setAlpha(0.3); KG.audio.play('coin', { i: this.i }); this.i++;
      this.s.tweens.add({ targets: this.bot, x: this.cx(this.pos.x), y: this.cy(this.pos.y), duration: 220, ease: 'Back.easeOut' }); KG.kit.stars(this.s, this.bot.x, this.bot.y, undefined, 6);
      if (this.i >= this.seq.length) { this.exp = null; this.s.time.delayedCall(240, () => { KG.audio.play('star'); KG.kit.stars(this.s, this.star.x, this.star.y, [0xffd34f, 0xffffff], 18); this.star.setVisible(false); }); this.roundOk(this.cx(this.pos.x), this.cy(this.pos.y)); }
      else { this.pulseImg(this.chips[this.i]); this.chips[this.i].setAlpha(1); this.refreshArrow(); }
    } else { this.bad(this.bot.x, this.bot.y, 'ลองดูทิศอีกที', im); if (this.errs === 2) this.refreshArrow(); }
  }
  /* ===================== กดเว้นวรรคตามจำนวน ===================== */
  spaceBtn(y) {
    const s = this.s, b = this.add(KV.cap(s, 720, y, 460, 72, 'เว้นวรรค (Space)', 'next', { size: 32, onTap: () => { if (this.running && !this.busy) this.feed('Space', {}); } })); b.setDepth(12); return b;
  }
  r_space(P) {
    const s = this.s, n = P.n || 3; this.n = n; this.cnt = 0; this.showKb(false);
    this.setPrompt('กดปุ่มเว้นวรรค ' + n + ' ครั้ง ให้จรวดพุ่งขึ้น', 'กดปุ่มเว้นวรรค ' + KQ_NUM[n] + ' ครั้ง ให้จรวดพุ่งขึ้น');
    this.rk = this.add(KV.rocket(s, 720, 400)); this.rk.setDepth(10); this.rk.setScale(1.05); this.dots = [];
    const gap = 54, x0 = 720 - (n - 1) * gap / 2; for (let i = 0; i < n; i++) { const d = this.add(s.add.circle(x0 + i * gap, 196, 20, 0xffffff).setStrokeStyle(5, 0x2d2a5e).setDepth(12)); this.dots.push(d); }
    this.spc = this.spaceBtn(640); this.pulse(this.spc); this.exp = { code: 'Space' };
  }
  k_space(code) {
    if (KQ_MOD[code]) return; if (code !== 'Space') { this.bad(this.rk.x, this.rk.y, 'ต้องกดปุ่มเว้นวรรค', this.rk); return; }
    const s = this.s, d = this.dots[this.cnt]; this.cnt++; d.setFillStyle(0xffc82e); KG.audio.play('coin', { i: this.cnt }); KG.kit.stars(s, d.x, d.y, undefined, 8); s.tweens.add({ targets: d, scaleX: 1.5, scaleY: 1.5, duration: 120, yoyo: true });
    s.tweens.add({ targets: this.rk, y: this.rk.y - 14, duration: 90, yoyo: true }); this.rk.fire.setVisible(true);
    if (this.cnt >= this.n) { this.exp = null; KG.audio.play('charge'); this.rk.fire.setVisible(true); s.tweens.add({ targets: this.rk, y: -220, duration: 900, ease: 'Cubic.easeIn' }); KG.fx.shake(s, 300, 0.005); this.roundOk(720, 300); }
    else s.time.delayedCall(180, () => { if (this.rk && this.rk.scene) this.rk.fire.setVisible(false); });
  }
  /* ===================== รอไฟเขียว ===================== */
  r_light(P) {
    const s = this.s; this.showKb(false); this.setPrompt('รอไฟเขียว แล้วกดปุ่มเว้นวรรค ถ้าไฟแดงห้ามกดนะ', 'รอไฟเขียวก่อน แล้วค่อยกดปุ่มเว้นวรรค ถ้าไฟแดงห้ามกด');
    this.tl = this.add(KV.light(s, 520, 400)); this.tl.setDepth(10); this.tl.setScale(1.15); this.msg = this.label('รอก่อน', 920, 340, 52, '#e0243d');
    this.rbt = this.add(s.add.image(880, 520, 'robot1').setDepth(9)); this.rbt.setScale(150 / this.rbt.height); this.spc = this.spaceBtn(640);
    this.lightSt = 'red'; this.tl.set('red'); this.wait = 1300 + this.R() * 2200; this.exp = null;
  }
  turnGreen() { this.lightSt = 'green'; this.tl.set('green'); this.msg.setText('กดเลย!').setColor('#22b45a'); KG.audio.play('ding'); this.exp = { code: 'Space' }; this.s.tweens.add({ targets: this.spc, scaleX: 1.08, scaleY: 1.08, duration: 220, yoyo: true, repeat: -1 }); this.pulseImg(this.rbt); }
  k_light(code) {
    if (KQ_MOD[code]) return; const s = this;
    if (this.lightSt === 'green' && code === 'Space') { this.lightSt = 'done'; this.exp = null; this.s.tweens.killTweensOf(this.spc); this.spc.setScale(1); KG.audio.play('zip'); this.s.tweens.killTweensOf(this.rbt); this.s.tweens.add({ targets: this.rbt, x: 1360, duration: 700, ease: 'Cubic.easeIn' }); KG.kit.stars(this.s, this.tl.x, this.tl.y, undefined, 14); this.roundOk(this.tl.x, this.tl.y); }
    else if (this.lightSt === 'red') { this.bad(this.tl.x, this.tl.y, 'ไฟแดง ยังไม่ถึงเวลา', this.tl); this.wait = 1300 + this.R() * 2200; }
    else if (code !== 'Space') this.bad(this.tl.x, this.tl.y, 'กดปุ่มเว้นวรรคนะ', this.tl);
  }
  /* ===================== พิมพ์คำจากภาพ ===================== */
  pickWord(lo, hi) {
    const bank = KG.kit.bank(), all = []; Object.keys(bank).forEach(c => bank[c].items.forEach(it => { if (/^[a-z]+$/.test(it.id) && it.id.length >= lo && it.id.length <= hi) all.push(it); }));
    const fresh = all.filter(it => !this.used[it.id]); const it = kqPick(this.R, fresh.length ? fresh : all); this.used[it.id] = 1; return it;
  }
  r_word(P) {
    const s = this.s, lo = P.len ? P.len[0] : 3, hi = P.len ? P.len[1] : 4, it = this.pickWord(lo, hi), w = it.id.toUpperCase(), n = w.length; this.word = w; this.seq = w.split('').map(ch => 'Key' + ch); this.i = 0; this.hintOn = !!P.hint;
    this.setPrompt('พิมพ์ชื่อภาษาอังกฤษของ ' + it.th, 'พิมพ์ชื่อภาษาอังกฤษของ ' + it.th + ' ทีละตัวอักษร'); this.showKb(true);
    this.panel(250, 275, 290, 250); this.add(KG.kit.itemImage(s, it, 250, 262, 190).setDepth(10)); this.label(it.th, 250, 372, 32);
    const cw = Math.min(92, Math.floor(760 / n) - 10), ch = Math.round(cw * 1.2), gap = 10, tot = n * (cw + gap), cx = 760, x0 = cx - tot / 2 + (cw + gap) / 2; this.panel(cx, 275, Math.max(tot + 50, 300), ch + 80);
    this.chips = this.seq.map((c, i) => { const k = this.add(KV.cap(s, x0 + i * (cw + gap), 275, cw, ch, w[i], i === 0 ? 'next' : 'norm', { size: Math.round(cw * 0.6) })); k.setDepth(12); return k; }); this.pulse(this.chips[0]); this.refresh();
  }
  k_word(code, m) { this.k_key(code, m); }
  /* ===================== บวกเลข ===================== */
  r_sum(P) {
    const s = this.s, R = this.R, mx = Math.min(9, P.max || 5); let a, b, g = 0; do { a = 1 + Math.floor(R() * (mx - 1)); b = 1 + Math.floor(R() * (mx - 1)); } while ((a + b > mx || a + b === this.lastSum) && g++ < 40); this.lastSum = a + b; const ans = a + b; this.seq = ['Digit' + ans]; this.i = 0; this.hintOn = false; this.ans = ans;
    this.setPrompt(a + ' + ' + b + ' เท่ากับเท่าไร กดตัวเลขคำตอบ', a + ' บวก ' + b + ' เท่ากับเท่าไร กดตัวเลขคำตอบบนแป้นพิมพ์'); this.showKb(true); this.panel(720, 270, 780, 200);
    const item = kqPick(R, KG.kit.bank().fruit.items); const grp = (n, x) => { for (let i = 0; i < n; i++) this.add(KG.kit.itemImage(s, item, x + (i % 5) * 56, 232 + Math.floor(i / 5) * 56, 52).setDepth(10)); };
    grp(a, 410); this.label('+', 640, 262, 64); grp(b, 700); this.label('=  ?', 1040, 262, 56, '#ff5a8a');
    this.refresh();
  }
  k_sum(code, m) { if (KQ_MOD[code]) return; const want = this.seq[0]; if (code === want) { if (this.kb) this.kb.press(code, true); KG.audio.play('coin'); KG.kit.stars(this.s, 1040, 262, undefined, 12); this.label(String(this.ans), 1040, 262, 64, '#22b45a'); this.exp = null; this.roundOk(1040, 262); } else { if (this.kb) this.kb.press(code, false); this.bad(1040, 262, 'ลองนับดูอีกที', null); if (this.errs === 2) { this.hintOn = true; this.refresh(); } } }
  /* ===================== ตัวพิมพ์ใหญ่ด้วย Shift ===================== */
  r_shift(P) {
    const s = this.s, set = P.set.split(''); let c, g = 0; do { c = kqPick(this.R, set); } while (set.length > 1 && c === this.lastKey && g++ < 12); this.lastKey = c; const code = 'Key' + c.toUpperCase(); this.code = code; this.shiftCode = TY.shiftFor(code);
    this.setPrompt('พิมพ์ตัวอักษร ' + c.toUpperCase() + ' ตัวใหญ่ โดยกด Shift ค้างไว้', 'พิมพ์ตัวอักษร ' + kqSay(c) + ' ตัวใหญ่ โดยกดปุ่มชิฟต์ค้างไว้ แล้วกดตัวอักษร'); this.showKb(true); this.panel(720, 270, 640, 210);
    this.big = this.add(KV.cap(s, 560, 270, 170, 130, c.toUpperCase(), 'next', { size: 88 })); this.big.setDepth(12); this.pulse(this.big); this.label('=  Shift  +  ' + c.toUpperCase(), 940, 270, 36); this.seq = [code]; this.i = 0; this.hintOn = true;
    this.exp = { code, shift: true }; this.kb.hint([this.shiftCode, code]);
  }
  k_shift(code, m) {
    if (KQ_MOD[code]) return; const kb = this.kb;
    if (code === this.code && m.shift) { kb.press(code, true); this.big.setState2('ok'); this.s.tweens.killTweensOf(this.big); KG.audio.play('coin'); KG.kit.stars(this.s, this.big.x, this.big.y, undefined, 12); this.exp = null; this.roundOk(this.big.x, this.big.y); }
    else if (code === this.code) { kb.press(code, false); this.bad(this.big.x, this.big.y, 'ต้องกด Shift ค้างไว้ด้วย', this.big); }
    else { kb.press(code, false); this.bad(this.big.x, this.big.y, 'ยังไม่ใช่ปุ่มนี้', this.big); }
  }
  /* ===================== ปุ่มพิเศษ ===================== */
  r_special(P) {
    const s = this.s, R = this.R, key = P.key; this.sp = key; this.hintOn = P.hint !== false; this.showKb(key !== 'Escape');
    if (key === 'Enter') {
      const w = kqPick(R, ['HELLO', 'HI TECHNO', 'GOOD JOB', 'I AM HERE']); this.setPrompt('พิมพ์ข้อความเสร็จแล้ว กด Enter เพื่อส่ง', 'พิมพ์ข้อความเสร็จแล้ว กดปุ่มเอ็นเทอร์ เพื่อส่ง'); this.panel(720, 270, 760, 200); this.field = this.chatField(w); this.exp = { code: 'Enter' }; if (this.kb && this.hintOn) this.kb.hint(['Enter']);
    } else if (key === 'Backspace') {
      const words = ['CAT', 'DOG', 'SUN', 'PIG', 'BOOK', 'DUCK', 'FISH'], w = kqPick(R, words), wrong = w.slice(0, -1) + kqPick(R, 'XQZ'.split('')); this.fixTo = w; this.fixCode = 'Key' + w[w.length - 1]; this.step = 0;
      this.setPrompt('ตัวสุดท้ายพิมพ์ผิด กด Backspace ลบ แล้วพิมพ์ตัวที่ถูก', 'ตัวสุดท้ายพิมพ์ผิด กดปุ่มแบ็คสเปซเพื่อลบ แล้วพิมพ์ตัวที่ถูก'); this.panel(720, 270, 760, 200); this.field = this.chatField(wrong); this.label('ต้องพิมพ์ให้ได้คำว่า  ' + w, 720, 372, 30, '#ff5a8a'); this.exp = { code: 'Backspace' }; if (this.kb && this.hintOn) this.kb.hint(['Backspace']);
    } else if (key === 'Tab') {
      this.setPrompt('กด Tab เพื่อย้ายไปช่องถัดไป ทำให้ถึงช่องสุดท้าย', 'กดปุ่มแท็บ เพื่อย้ายไปช่องถัดไป ทำให้ถึงช่องสุดท้าย'); this.panel(720, 290, 700, 250); this.tabN = 0; this.fields = ['ชื่อ', 'ห้องเรียน', 'โรงเรียน'].map((t, i) => { const y = 215 + i * 70, g = this.add(s.add.graphics().setDepth(8)); this.add(KG.txt(s, 430, y, t, { size: 26, color: '#2d2a5e', middle: true }).setDepth(9)); return { g, y }; }); this.drawFields(); this.exp = { code: 'Tab' }; if (this.kb && this.hintOn) this.kb.hint(['Tab']);
    } else {
      this.setPrompt('มีหน้าต่างเด้งขึ้นมา กด Esc เพื่อปิด', 'มีหน้าต่างเด้งขึ้นมา กดปุ่มเอสเคป เพื่อปิด'); const win = this.add(s.add.container(720, 320).setDepth(10)), g = s.add.graphics(); g.fillStyle(0x000000, 0.2); g.fillRoundedRect(-230, -140, 470, 290, 20); g.fillStyle(0xffffff, 1); g.fillRoundedRect(-240, -150, 480, 290, 20); g.lineStyle(5, 0x2d2a5e, 1); g.strokeRoundedRect(-240, -150, 480, 290, 20); g.fillStyle(0xff5a8a, 1); g.fillRoundedRect(-240, -150, 480, 46, { tl: 20, tr: 20, bl: 0, br: 0 });
      win.add([g, KG.txt(s, -214, -127, 'ข้อความจากเทคโน', { size: 24, color: '#ffffff', middle: true }), KG.txt(s, 0, -10, 'ปิดหน้าต่างนี้ด้วยปุ่ม Esc', { size: 34, color: '#2d2a5e', center: true, middle: true })]); const xb = s.add.circle(212, -127, 18, 0xffffff).setStrokeStyle(3, 0x2d2a5e); win.add([xb, KG.txt(s, 212, -127, 'X', { size: 22, color: '#ff3b3b', center: true, middle: true })]); this.win = win; win.setScale(0.2); s.tweens.add({ targets: win, scaleX: 1, scaleY: 1, duration: 280, ease: 'Back.easeOut' });
      this.escBtn = this.add(KV.cap(s, 720, 600, 200, 72, 'Esc', 'next', { size: 38, onTap: () => { if (this.running && !this.busy) this.feed('Escape', {}); } })); this.escBtn.setDepth(12); this.pulse(this.escBtn); this.exp = { code: 'Escape' };
    }
  }
  chatField(text) {
    const s = this.s, g = this.add(s.add.graphics().setDepth(8)); g.fillStyle(0xf4f7ff, 1); g.fillRoundedRect(430, 232, 560, 64, 16); g.lineStyle(4, 0x2d2a5e, 1); g.strokeRoundedRect(430, 232, 560, 64, 16);
    const t = this.add(KG.txt(s, 452, 264, text, { size: 38, color: '#2d2a5e', middle: true }).setDepth(9)); const send = this.add(KG.txt(s, 880, 190, 'ช่องพิมพ์ข้อความ', { size: 22, color: '#7a86b8', middle: true }).setDepth(9)); return { t, g, text };
  }
  drawFields() { this.fields.forEach((f, i) => { f.g.clear(); f.g.fillStyle(i === this.tabN ? 0xfff3b0 : 0xf4f7ff, 1); f.g.fillRoundedRect(560, f.y - 26, 380, 52, 12); f.g.lineStyle(i === this.tabN ? 6 : 3, i === this.tabN ? 0xffc400 : 0x2d2a5e, 1); f.g.strokeRoundedRect(560, f.y - 26, 380, 52, 12); }); }
  k_special(code, m) {
    if (KQ_MOD[code]) return; const s = this.s, kb = this.kb, k = this.sp;
    if (k === 'Enter') {
      if (code === 'Enter') { kb.press(code, true); KG.audio.play('whoosh'); const t = this.field.t, b = this.add(KG.txt(s, 452, 264, this.field.text, { size: 38, color: '#ffffff', middle: true, stroke: '#3d8bff', sw: 8 }).setDepth(20)); t.setText(''); s.tweens.add({ targets: b, x: 880, y: 150, alpha: 0, scaleX: 0.5, scaleY: 0.5, duration: 700, ease: 'Cubic.easeIn' }); KG.kit.stars(s, 720, 264, undefined, 14); this.exp = null; this.roundOk(720, 264); }
      else { kb.press(code, false); this.bad(720, 264, 'กดปุ่ม Enter นะ', this.field.t); }
    } else if (k === 'Backspace') {
      if (this.step === 0) {
        if (code === 'Backspace') { kb.press(code, true); KG.audio.play('pop'); this.step = 1; this.field.t.setText(this.fixTo.slice(0, -1)); this.exp = { code: this.fixCode }; if (this.hintOn) kb.hint([this.fixCode]); else kb.clearHint(); }
        else { kb.press(code, false); this.bad(720, 264, 'กด Backspace เพื่อลบตัวสุดท้าย', this.field.t); }
      } else if (code === this.fixCode) { kb.press(code, true); this.field.t.setText(this.fixTo); this.field.t.setColor('#22b45a'); KG.audio.play('coin'); KG.kit.stars(s, 720, 264, undefined, 12); this.exp = null; this.roundOk(720, 264); }
      else { kb.press(code, false); this.bad(720, 264, 'ตัวสุดท้ายคือ ' + this.fixTo.slice(-1), this.field.t); }
    } else if (k === 'Tab') {
      if (code === 'Tab') { kb.press(code, true); KG.audio.play('tap'); this.tabN++; this.drawFields(); if (this.tabN >= 2) { KG.kit.stars(s, 750, this.fields[2].y, undefined, 14); this.exp = null; this.roundOk(750, this.fields[2].y); } }
      else { kb.press(code, false); this.bad(720, 290, 'กดปุ่ม Tab นะ', null); }
    } else {
      if (code === 'Escape') { KG.audio.play('whoosh'); this.exp = null; s.tweens.add({ targets: this.win, scaleX: 0.05, scaleY: 0.05, alpha: 0, duration: 260 }); KG.kit.stars(s, 720, 320, undefined, 14); this.roundOk(720, 320); }
      else this.bad(720, 320, 'กดปุ่ม Esc นะ', this.win);
    }
  }
  /* ===================== คีย์ลัด ===================== */
  r_combo(P) {
    const s = this.s, R = this.R, ops = P.ops; let op; if (P.ordered) op = ops[this.round % ops.length]; else { let g = 0; do { op = kqPick(R, ops); } while (ops.length > 1 && op === this.lastOp && g++ < 12); } this.lastOp = op; const o = KQ_COMBO[op]; this.op = op; this.opd = o; this.hintOn = !!P.hint; this.showKb(false);
    this.setPrompt(o.th + ' (' + o.en + ') กดคีย์ลัดอะไร', o.say + ' ต้องกดคีย์ลัดอะไร'); this.doc = this.add(KV.doc(s, 560, 310)); this.doc.setDepth(10); this.clip = false;
    const base = ['สวัสดีเทคโน', 'ฉันชอบพิมพ์', 'เก่งมาก']; if (op === 'copy') this.doc.render([base[0]], true); else if (op === 'paste') { this.doc.render([base[0]], false); this.clip = true; this.clipT = this.add(KG.txt(s, 990, 252, base[0], { size: 28, color: '#2d2a5e', middle: true, center: true }).setDepth(9)); this.label('อยู่ในคลิปบอร์ด', 990, 214, 22); }
    else if (op === 'undo') this.doc.render([base[0], base[1]], false); else if (op === 'save') this.doc.render(base.slice(0, 2), false); else this.doc.render(base, false);
    if (op === 'undo') this.label('บรรทัดล่างเพิ่งพิมพ์ผิด', 990, 252, 26, '#e0243d'); if (op === 'all') this.label('เลือกให้ครบทุกบรรทัด', 990, 252, 26);
    const y = 600, cw = 170, ch = 78; this.capC = this.add(KV.cap(s, 590, y, cw, ch, 'Ctrl', 'norm', { size: 36, onTap: () => { if (!this.running || this.busy) return; this.latchCtrl = !this.latchCtrl; this.capC.setState2(this.latchCtrl ? 'ok' : 'norm'); } })); this.capL = this.add(KV.cap(s, 850, y, 120, ch, o.code[3], 'norm', { size: 46, onTap: () => { if (this.running && !this.busy) { const c = this.latchCtrl; this.latchCtrl = false; this.capC.setState2('norm'); this.feed(o.code, { ctrl: c }); } } })); this.plus = this.label('+', 720, y, 46); [this.capC, this.capL, this.plus].forEach(c => c.setDepth(12));
    this.exp = { code: o.code, ctrl: true }; this.refreshCombo();
  }
  refreshCombo() { const show = this.hintOn || this.errs >= 2; this.capC.setState2(show ? 'next' : (this.latchCtrl ? 'ok' : 'norm')); this.capL.setState2(show ? 'next' : 'norm'); if (show) { this.pulse(this.capC); this.pulse(this.capL); } }
  k_combo(code, m) {
    const s = this.s, o = this.opd;
    if (KQ_MOD[code]) { if (/^Control|^Meta/.test(code)) { this.capC.setState2('ok'); KG.audio.play('tap'); } return; }
    if (code === o.code && m.ctrl) {
      this.capC.setState2('ok'); this.capL.setState2('ok'); KG.audio.play('coin'); const d = this.doc, base = ['สวัสดีเทคโน', 'ฉันชอบพิมพ์', 'เก่งมาก'];
      if (this.op === 'copy') { this.add(KG.txt(s, 560, 232, base[0], { size: 30, color: '#2d2a5e', middle: true, center: true }).setDepth(20)); const gh = this.objs[this.objs.length - 1]; s.tweens.add({ targets: gh, x: 990, y: 252, duration: 500, ease: 'Cubic.easeOut' }); this.label('คัดลอกแล้ว', 990, 214, 28, '#22b45a'); }
      else if (this.op === 'paste') { d.render([base[0], base[0]], false); s.tweens.add({ targets: d.lines[1], alpha: { from: 0, to: 1 }, duration: 300 }); }
      else if (this.op === 'undo') { d.render([base[0]], false); this.label('ย้อนกลับแล้ว', 990, 214, 28, '#22b45a'); }
      else if (this.op === 'save') { this.label('บันทึกแล้ว', 990, 250, 40, '#22b45a'); const disk = this.add(s.add.graphics().setDepth(10)); disk.fillStyle(0x3d8bff, 1); disk.fillRoundedRect(940, 290, 100, 100, 10); disk.fillStyle(0xffffff, 1); disk.fillRect(956, 296, 68, 34); disk.fillStyle(0x2d2a5e, 1); disk.fillRect(962, 354, 56, 34); disk.lineStyle(4, 0x2d2a5e, 1); disk.strokeRoundedRect(940, 290, 100, 100, 10); }
      else { d.render(base, true); }
      KG.kit.stars(s, 560, 300, undefined, 14); this.exp = null; this.roundOk(560, 300);
    } else if (code === o.code) { this.bad(560, 300, 'ต้องกด Ctrl ค้างไว้ด้วย', this.doc); if (this.errs >= 2) this.refreshCombo(); }
    else { this.bad(560, 300, m.ctrl ? 'ตัวอักษรยังไม่ใช่' : 'ต้องกด Ctrl กับตัวอักษร', this.doc); if (this.errs >= 2) this.refreshCombo(); }
  }
}
