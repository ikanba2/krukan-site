/* ===== ด่านเขาวงกต: ต่อการ์ดคำสั่งให้ Techno เดินจากจุดเริ่มไปประตู =====
   โครงหน้าจอ (ตำแหน่งตายตัว ไม่เลื่อน): หัวเรื่อง/ปุ่มควบคุม y8-64 · แผนที่ซ้าย x24-600 y76-604 · คลังการ์ด x612-1256 y76-196 · โปรแกรม x612-1256 y206-604 · ข้อความ y612-704 */
function palTex(scene, w, h, c, dark) {
  return KG.tex(scene, ['pal', w, h, c].join('|'), w + 14, h + 14, ctx => {
    ctx.translate(7, 7);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; KG.ui.cutPath(ctx, 0, 0, w, h, [0, 12, 0, 12]); ctx.fillStyle = css(dark); ctx.fill(); ctx.restore();
    KG.ui.cutPath(ctx, 0, 0, w, h, [0, 12, 0, 12]); ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, h, [[0, css(c)], [1, css(dark)]]); ctx.fill();
    ctx.save(); KG.ui.cutPath(ctx, 0, 0, w, h, [0, 12, 0, 12]); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, 0, w, 3);
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, h * 0.5, [[0, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h * 0.5); ctx.restore();
    KG.ui.cutPath(ctx, 1, 1, w - 2, h - 2, [0, 12, 0, 12]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
  });
}

class MissionScene extends KG.Scene {
  constructor() { super('Mission'); }
  init(data) { this.li = data && data.i != null ? data.i : 0; this.forceTutor = !!(data && data.tutor); this._restartData = { i: this.li }; }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music('think');
    this._pt = null; this._modal = null; this._say = 0; this.view = null; this.editor = null; this.tabBtns = {};
    const L = this.level = LEVELS[this.li], W = this.world = WORLDS[L.world - 1];
    this.state = 'idle'; this.token = 0; this.fails = 0; this.usedSol = false; this.spdIdx = 1;

    this.add.image(GW / 2, GH / 2, 'arena_' + W.arena).setDisplaySize(GW * 1.1, GH * 1.1).setAlpha(0.55);
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'gmissionshade', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.8)'], [1, 'rgba(5,8,28,.95)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);

    this.buildHeader(); this.buildStage(); this.buildEditor(); this.buildPalette(); this.buildStory();
    this.editor.render(true); this.updateHud();
    this.input.keyboard.on('keydown-SPACE', () => this.onRun());
    this.input.keyboard.on('keydown-ENTER', () => this.onRun());
    this.input.keyboard.on('keydown-BACKSPACE', () => this.editor.deleteBack());
    this.input.keyboard.on('keydown-R', () => this.onReset());
    this.say(L.story, 'story');
    this.tutor = null;
    if (this.li === 0 && (this.forceTutor || !SAVE.data.tutorDone)) this.time.delayedCall(500, () => this.startTutor());
  }
  onEscape() { if (this._modal) return; this.leave(); }
  leave() { this.token++; this.go('Select', { world: this.level.world }); }

  /* ---------- หัวเรื่องและปุ่มควบคุม ---------- */
  buildHeader() {
    const L = this.level, W = this.world;
    iconButton(this, 56, 36, 'home', () => this.leave(), { w: 60, h: 52 });
    this.txt(100, 6, W.name + ' · ด่าน ' + (this.li + 1), { size: 18, color: W.tint, weight: 600 });
    this.txt(100, 26, L.title, { size: 30, color: '#ffffff', stroke: true });
    const y = 36;
    this.btnRun = new KG.ui.Button(this, 504, y, 172, 56, { label: 'รัน', icon: 'play', style: 'primary', size: 26, onClick: () => this.onRun() });
    this.btnStep = new KG.ui.Button(this, 682, y, 148, 56, { label: 'ทีละขั้น', icon: 'step', style: 'cyan', size: 22, onClick: () => this.onStep() });
    this.btnReset = new KG.ui.Button(this, 826, y, 130, 56, { label: 'รีเซ็ต', icon: 'reset', style: 'ghost', size: 22, onClick: () => this.onReset() });
    this.btnSpd = new KG.ui.Button(this, 928, y, 76, 56, { label: '×2', style: 'ghost', size: 24, onClick: () => this.cycleSpeed() });
    this.btnHint = iconButton(this, 1030, y, 'bulb', () => this.showHint(), { w: 60, h: 52 });
    addSystemButtons(this, 1096, y, 0, ['sfx']); iconButton(this, 1162, y, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    this.btnRun.pulse(); this.btnRun.pulseOn = true; this.btnReset.setEnabled(false);
    this.cycleSpeed(true);
    iconButton(this, 1226, y, 'help', () => showHowTo(this), { w: 56, h: 52 });
  }
  cycleSpeed(init) {
    if (!init) this.spdIdx = (this.spdIdx + 1) % 3;
    const v = [0.65, 1, 1.7][this.spdIdx];
    this.btnSpd.setLabel(['×1', '×2', '×3'][this.spdIdx]); if (this.view) this.view.setSpeed(v); this.spd = v;
  }

  /* ---------- แผนที่ ---------- */
  buildStage() {
    this.view = new GridView(this, { x: 28, y: 80, w: 568, h: 520 }, this.level, this.level.world);
    this.view.setSpeed(this.spd || 1);
    this.view.onGem = () => this.updateHud();
    frameBox(this, 24, 76, 576, 528, this.world.tint).setDepth(30);
    const total = this.view.map.gems.length;
    const tag = this.txt(44, 90, total ? 'ภารกิจ: เก็บแกนพลังงาน ' + total + ' ดวง แล้วเข้าประตู' : 'ภารกิจ: เดินไปให้ถึงประตู', { size: 20, color: '#ffffff', stroke: true }).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: tag, alpha: 1, duration: 500, delay: 500 });
    this.tweens.add({ targets: tag, alpha: 0, duration: 600, delay: 5200 });
  }

  /* ---------- โปรแกรม ---------- */
  buildEditor() {
    const L = this.level, W = this.world;
    KG.ui.panel(this, 612, 206, 644, 398, { accent: css(W.color), cuts: [20, 0, 20, 0] }).setDepth(5);
    const hasFn = L.allow.includes('call');
    if (hasFn) {
      this.tabBtns.main = new KG.ui.Button(this, 694, 232, 140, 38, { label: 'หน้าหลัก', style: 'cyan', size: 19, slant: 8, depth: 7, onClick: () => this.switchTab('main') });
      this.tabBtns.fn = new KG.ui.Button(this, 846, 232, 140, 38, { label: 'ท่า A', icon: 'func', style: 'ghost', size: 19, slant: 8, depth: 7, onClick: () => this.switchTab('fn') });
    } else this.txt(634, 214, 'โปรแกรม', { size: 24, stroke: true }).setDepth(7);
    this.cardCount = this.txt(1000, 232, '', { size: 18, color: '#9fb0d8', ox: 0, oy: 0.5 }).setDepth(7);
    this.btnDel = new KG.ui.Button(this, 1184, 232, 70, 38, { label: '', icon: 'trash', style: 'danger', slant: 8, depth: 7, onClick: () => this.editor.deleteBack() });
    this.btnClear = new KG.ui.Button(this, 1108, 232, 70, 38, { label: '', icon: 'close', style: 'ghost', slant: 8, depth: 7, onClick: () => this.editor.clear() });
    this.editor = new ScriptEditor(this, { x: 624, y: 256, w: 580, h: 338 }, { allow: L.allow, maxBlocks: L.maxBlocks, onChange: () => this.updateHud() });
    this.scrollUp = iconButton(this, 1226, 282, 'chevU', () => this.editor.scrollBy(-120), { w: 34, h: 40 }); this.scrollUp.setDepth(8);
    this.scrollDn = iconButton(this, 1226, 570, 'chevD', () => this.editor.scrollBy(120), { w: 34, h: 40 }); this.scrollDn.setDepth(8);
  }
  switchTab(name) {
    if (this.state !== 'idle' || this.editor.tab === name) return;
    this.editor.switchTab(name);
    Object.keys(this.tabBtns).forEach(k => this.tabBtns[k].setActive(k === name)); this.renderPalette(); KG.audio.play('tap');
  }
  buildPalette() {
    KG.ui.panel(this, 612, 76, 644, 120, { accent: '#6f8cff', cuts: [0, 20, 0, 20] }).setDepth(5);
    this.txt(634, 80, 'คลังคำสั่ง · แตะเพื่อเพิ่มลงโปรแกรม', { size: 16, color: '#9fb0d8', weight: 400 }).setDepth(7);
    const order = PAL_ORDER.filter(t => this.level.allow.includes(t));
    this.palOrder = order; this.palBtns = {};
    const n = order.length, usable = 616, w = Math.min(104, Math.floor((usable - (n - 1) * 8) / n)), h = 84, x0 = 612 + 14 + w / 2 + (usable - (n * w + (n - 1) * 8)) / 2;
    order.forEach((t, i) => {
      const x = x0 + i * (w + 8), y = 148, B = BLK[t];
      const c = this.add.container(x, y).setDepth(7);
      c.add(this.add.image(0, 0, palTex(this, w, h, B.c, B.dark)).setDisplaySize(w + 14, h + 14));
      c.add(KG.ui.icon(this, B.icon, 0, -h * 0.17, Math.round(h * 0.42), B.ink));
      const lab = KG.txt(this, 0, h * 0.3, PAL_LABEL[t] || B.label, { size: 17, color: B.ink, center: true, middle: true });
      const fit = (w - 8) / lab.width; if (fit < 1) lab.setScale(fit); c.add(lab);
      c.setInteractive(new Phaser.Geom.Rectangle(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4), Phaser.Geom.Rectangle.Contains);
      c.on('pointerover', () => { if (this.state === 'idle') { this.tweens.add({ targets: c, y: y - 4, duration: 100 }); KG.audio.play('hover'); } });
      c.on('pointerout', () => { this.tweens.add({ targets: c, y, duration: 120 }); c.setScale(1); });
      c.on('pointerdown', () => c.setScale(0.95));
      c.on('pointerup', () => { c.setScale(1); this.insertBlock(t, { x: c.x, y: c.y }); });
      c.cw = w; c.ch = h; this.palBtns[t] = c;
    });
    this.renderPalette();
  }
  renderPalette() {
    const full = this.editor.count() >= this.level.maxBlocks;
    this.palOrder.forEach(t => { const dis = (t === 'call' && this.editor.tab === 'fn') || this.state !== 'idle'; this.palBtns[t].setAlpha(dis ? 0.35 : (full ? 0.6 : 1)); });
  }
  insertBlock(t, from) { if (this.editor.insert(t, from)) { this.clearPoint(); this.renderPalette(); } }

  /* ---------- บทสอนเล่น (ด่านแรก) ---------- */
  startTutor() {
    if (this.tutor || this._modal) return;
    const ed = this.editor, card = t => () => { const c = this.palBtns[t]; return { x: c.x - c.cw / 2, y: c.y - c.ch / 2, w: c.cw, h: c.ch }; };
    const seq = () => ed.list().map(b => b.t).join('');
    this.tutor = new KG.Tutor(this, [
      { text: 'ยินดีต้อนรับสู่ Techno Grid! ภารกิจคือเขียนโปรแกรมพา Techno เดินในเขาวงกตไปที่ประตู ลองทำตามทีละขั้นนะ' },
      { text: 'นี่คือแผนที่ Techno ยืนอยู่ที่จุดเริ่ม ประตูอยู่มุมล่างขวา ต้องเก็บแกนพลังงานสีฟ้าให้ครบ ประตูจึงจะเปิด', target: { x: 24, y: 76, w: 576, h: 528 }, pad: 0, pos: 'bottom' },
      { text: 'ตอนนี้ไปทางขวาก่อน แตะการ์ด "ขวา" หนึ่งครั้งเพื่อสั่งให้ Techno เดินไปทางขวา 1 ช่อง', target: card('e'), mode: 'wait', until: () => seq().length >= 1 && seq()[0] === 'e' },
      { text: 'ดีมาก! การ์ดไปอยู่ในรายการโปรแกรมแล้ว ต้องเดินขวาทั้งหมด 4 ช่อง แตะ "ขวา" เพิ่มอีก 3 ครั้ง', target: card('e'), mode: 'wait', until: () => seq() === 'eeee' },
      { text: 'ถึงมุมแล้ว ต้องลงล่างอีก 2 ช่องจึงถึงประตู แตะการ์ด "ลง" สองครั้ง', target: card('s'), mode: 'wait', until: () => seq() === 'eeeess' },
      { text: 'โปรแกรมของเราคือ ขวา 4 ครั้ง ลง 2 ครั้ง คอมพิวเตอร์จะทำทีละบรรทัดจากบนลงล่าง ถ้าวางผิด แตะปุ่มถังขยะสีแดงเพื่อลบการ์ดล่าสุด', target: { x: 612, y: 206, w: 644, h: 398 }, pad: 0, pos: 'top' },
      { text: 'กดปุ่ม "รัน" เพื่อให้ Techno เดินตามโปรแกรม', target: this.btnRun, mode: 'wait', until: () => this.state !== 'idle' },
      { text: 'ดูสิ! การ์ดที่เรืองแสงคือคำสั่งที่กำลังทำ ส่วน Techno เดินตามไปเก็บแกนพลังงานแล้วเข้าประตู', mode: 'wait', block: false, pos: 'top', until: () => this.state === 'done' },
      { text: 'เก่งมาก! ด่านต่อไปจะมีสิ่งกีดขวางและต้องคิดวางแผนมากขึ้น ใช้การ์ดให้น้อยที่สุดเพื่อได้ดาวเต็ม 3 ดวง' }
    ], { onDone: () => { SAVE.data.tutorDone = true; SAVE.save(); this.tutor = null; } });
  }

  /* ---------- แถบข้อความและสถานะ ---------- */
  buildStory() {
    KG.ui.panel(this, 24, 612, 1232, 92, { accent: '#4ef4d2', cuts: [0, 0, 0, 0], glow: true }).setDepth(5);
    this.add.image(86, 660, KG.tex(this, 'gportraitframe', 92, 76, ctx => { KG.ui.cutPath(ctx, 2, 2, 88, 72, [14, 0, 14, 0]); ctx.fillStyle = '#0a1030'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#4ef4d2'; ctx.stroke(); })).setDisplaySize(92, 76).setDepth(6);
    this.portrait = KG.art.make(this, 86, 696, HID, 'idle', 56).setDepth(7);
    this.bubble = this.txt(150, 620, '', { size: 21, weight: 400, color: '#e6edff', width: 740, lineSpacing: 5 }).setDepth(7);
    this.bubbleSolBtn = new KG.ui.Button(this, 760, 688, 150, 30, { label: 'ดูเฉลย', style: 'ghost', size: 16, slant: 6, onClick: () => this.showSolution() }).setDepth(9).setVisible(false);
    const x0 = 920;
    this.chipGem = this.makeChip(x0, 636, 'gem', 0x4ef4d2); this.chipGate = this.makeChip(x0 + 170, 636, 'lock', 0xffd34f);
    this.chipCards = this.makeChip(x0, 676, 'wheel', 0x6f8cff); this.chipStar = this.makeChip(x0 + 170, 676, 'star', 0xffd34f);
  }
  makeChip(x, y, icon, color) {
    const ic = KG.ui.icon(this, icon, x + 14, y, 26, color).setDepth(7), t = this.txt(x + 36, y, '', { size: 19, color: '#e6edff', oy: 0.5 }).setDepth(7);
    return { ic, t };
  }
  updateHud() {
    if (!this.chipGem || !this.view || !this.editor) return;
    const total = this.view.map.gems.length, n = this.editor.count();
    this.chipGem.t.setText('แกน ' + this.view.gemsGot + '/' + total);
    this.chipGate.t.setText(this.view.gateOpen ? 'ประตูเปิด' : 'ประตูปิด');
    this.chipGate.ic.setTexture(KG.ui.iconKey(this, this.view.gateOpen ? 'flag' : 'lock')).setTint(this.view.gateOpen ? 0x5ef08a : 0xffd34f);
    this.chipCards.t.setText('การ์ด ' + n + '/' + this.level.maxBlocks).setColor(n >= this.level.maxBlocks ? '#ff7a8a' : '#e6edff');
    this.chipStar.t.setText('3 ดาว ≤ ' + this.level.par);
    if (this.cardCount) this.cardCount.setText(n + ' การ์ด');
    if (this.palBtns) this.renderPalette();
  }
  say(text, kind) {
    this._say = (this._say || 0) + 1; const id = this._say;
    const str = KG.wrap(text, 740, '400 21px Kanit'); this.bubble.setText(''); this.bubble.setColor(kind === 'bad' ? '#ffb3bd' : kind === 'hint' ? '#ffd34f' : kind === 'good' ? '#9bffc0' : '#e6edff');
    let i = 0; const step = () => { if (id !== this._say) return; i += 2; this.bubble.setText(str.slice(0, i)); if (i < str.length) this.time.delayedCall(16, step); }; step();
    this.tweens.add({ targets: this.portrait, y: this.portrait.y - 6, duration: 110, yoyo: true, repeat: 1 });
    KG.art.frame(this.portrait, kind === 'bad' ? 'hurt' : kind === 'good' ? 'a2' : 'idle');
    if (kind !== 'bad' && this.bubbleSolBtn) this.bubbleSolBtn.setVisible(false);
  }
  showHint() {
    this.say('คำใบ้: ' + this.level.hint, 'hint'); KG.audio.play('pop');
    this.tweens.add({ targets: this.cardCount, scaleX: 1.15, scaleY: 1.15, duration: 100, yoyo: true });
  }
  showSolution() {
    if (this.state !== 'idle') this.onReset();
    this.usedSol = true; this.editor.load(GR.cloneProgram(this.level.sol)); this.renderPalette();
    this.say('นี่คือตัวอย่างโปรแกรม ลองกดรันดูว่าทำงานอย่างไร (ดาวจะได้ 1 ดวง)', 'hint'); this.bubbleSolBtn.setVisible(false);
  }
  pointAt(target) {
    this.clearPoint(); if (!target) return;
    const a = KG.ui.icon(this, 'chevD', target.x, target.y - 70, 40, 0xffd34f).setDepth(40);
    this._pt = a; this.tweens.add({ targets: a, y: a.y + 12, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  clearPoint() { if (this._pt) { this._pt.destroy(); this._pt = null; } }

  /* ---------- การรันโปรแกรม ---------- */
  setState(s) {
    this.state = s;
    this.btnRun.setLabel(s === 'playing' ? 'พัก' : (s === 'paused' ? 'เล่นต่อ' : 'รัน'));
    this.btnRun.icon.setTexture(KG.ui.iconKey(this, s === 'playing' ? 'pause' : 'play'));
    this.btnStep.setEnabled(s !== 'playing' && s !== 'done'); this.btnReset.setEnabled(s !== 'idle'); this.btnRun.setEnabled(s !== 'done');
    this.btnDel.setEnabled(s === 'idle'); this.btnClear.setEnabled(s === 'idle');
    this.editor.setLocked(s !== 'idle'); this.renderPalette();
  }
  prepare() {
    this.view.reset(); this.updateHud();
    this.res = GR.run(this.level, this.editor.prog); this.events = this.res.events; this.idx = 0; this.token++;
    this.say('กำลังรันโปรแกรม…', 'story');
  }
  async stepEvent() {
    const t = this.token, ev = this.events[this.idx++];
    this.editor.highlight(ev.id, ev.op, ev.ok);
    if (ev.op === 'end') return { done: true, ev };
    await this.view.playEvent(ev);
    if (t !== this.token) return { cancelled: true };
    return { done: ev.op === 'fail', ev };
  }
  async loop() {
    const t = this.token;
    while (this.state === 'playing' && t === this.token) {
      const r = await this.stepEvent(); if (r.cancelled || t !== this.token) return;
      if (r.done) { await this.finish(r.ev); return; }
    }
  }
  onRun() {
    if (this.state === 'playing') { this.setState('paused'); return; }
    if (this.state === 'done') return;
    if (this.state === 'idle') {
      if (!this.editor.count()) { toast_(this, 'ยังไม่มีการ์ด แตะการ์ดในคลังคำสั่งเพื่อเริ่มต่อโปรแกรม'); KG.audio.play('error'); return; }
      this.prepare(); SAVE.data.seenHow = true; SAVE.save(); this.clearPoint();
    }
    if (this.btnRun.pulseOn) { this.btnRun.pulseOn = false; this.tweens.killTweensOf(this.btnRun); this.btnRun.setScale(1); }
    this.setState('playing'); KG.audio.play('go'); this.loop();
  }
  async onStep() {
    if (this.state === 'idle') {
      if (!this.editor.count()) { toast_(this, 'ยังไม่มีการ์ด แตะการ์ดในคลังคำสั่งเพื่อเริ่มต่อโปรแกรม'); KG.audio.play('error'); return; }
      this.prepare(); this.clearPoint();
    }
    if (this.state === 'done' || this._busy) return;
    this.setState('paused'); this._busy = true; const t = this.token;
    let r;
    do { r = await this.stepEvent(); if (r.cancelled || t !== this.token) { this._busy = false; return; } } while (!r.done && !['move', 'turn', 'attack'].includes(r.ev.op));
    this._busy = false;
    if (r.done) await this.finish(r.ev);
  }
  onReset() {
    this.token++; this._busy = false; this.editor.highlight(null);
    this.view.reset(); this.setState('idle'); this.updateHud(); KG.audio.play('back');
    this.say(this.fails >= 2 ? 'คำใบ้: ' + this.level.hint : this.level.story, this.fails >= 2 ? 'hint' : 'story');
  }
  async finish(ev) {
    const r = this.res; this.setState('done'); this.editor.highlight(null);
    if (ev.op === 'fail') this.editor.markBad(ev.id);
    if (r.result === 'win') { await this.winSequence(); return; }
    this.fails++;
    const MSG = {
      bump: 'Techno ชนสิ่งกีดขวาง การ์ดที่ผิดเป็นสีแดง ลองใช้ "โจมตี" ถ้าเป็นลังหรือศัตรู หรือเลือกทางอ้อม',
      void: 'Techno เดินออกนอกเส้นทางแล้วตกขอบ ตรวจดูว่าก้าวสุดท้ายควรเปลี่ยนทิศหรือหยุดก่อน ดูเส้นทางสีฟ้าที่เดินผ่านมา',
      water: 'Techno ตกน้ำ ต้องเดินอ้อมบ่อน้ำ ลองหาทางอ้อมที่ไม่มีน้ำ',
      spike: 'Techno โดนหนาม ห้ามเหยียบช่องหนาม ลองเดินอ้อม',
      timeout: 'โปรแกรมทำงานนานเกินไป น่าจะวนซ้ำไม่รู้จบ ตรวจเงื่อนไขของลูปอีกครั้ง',
      goal: 'โปรแกรมจบแล้วแต่ Techno ยังไม่ถึงประตู ลองเพิ่มคำสั่งให้ไปต่อ',
      gems: 'ถึงประตูแล้วแต่เก็บแกนพลังงานไม่ครบ (เก็บได้ ' + r.gems + ' จาก ' + r.totalGems + ' ดวง) ประตูจะเปิดต่อเมื่อเก็บครบ'
    };
    if (r.result === 'goal' || r.result === 'gems') { this.view.flash(0xffd34f, 0.18); KG.audio.play('error'); this.view.popText(r.result === 'gems' ? 'แกนไม่ครบ' : 'ยังไม่ถึงประตู', '#ffd34f'); }
    this.say(MSG[r.result] || 'ลองใหม่อีกครั้ง', 'bad');
    KG.audio.play('lose');
    this.btnReset.pulse(); this.time.delayedCall(2600, () => { if (this.btnReset && this.state === 'done') { this.tweens.killTweensOf(this.btnReset); this.btnReset.setScale(1); } });
    if (this.fails >= 4) this.bubbleSolBtn.setVisible(true);
  }
  async winSequence() {
    const n = this.res.blocks, L = this.level; let s = n <= L.par ? 3 : (n <= L.par + 2 ? 2 : 1); if (this.usedSol) s = 1;
    if (s > missionStars(this.li)) { SAVE.data.stars[this.li] = s; SAVE.save(); }
    KG.stats.record({ lvl: 'm' + (this.li + 1), stars: s, m: this.fails, h: this.usedSol ? 1 : 0, secs: Math.round((Date.now() - this._t0) / 1000) });
    this.say('สำเร็จ! ' + L.learn, 'good');
    await this.view.win(); KG.fx.confetti(this, { ms: 1100 }); KG.audio.play('win'); KG.fx.shake(this, 200, 0.004);
    await wait(this, 450);
    const lastOfWorld = this.li + 1 >= LEVELS.length || LEVELS[this.li + 1].world !== L.world;
    const lines = KG.wrap(L.learn, 540, '400 22px Kanit').split('\n').length;
    const arcadeNow = lastOfWorld && arcadeOpen(L.world);
    const buttons = [];
    if (this.li + 1 < LEVELS.length) buttons.push({ label: lastOfWorld ? 'SECTOR ถัดไป' : 'ด่านถัดไป', style: arcadeNow ? 'ghost' : 'primary', icon: 'chevR', pulse: !arcadeNow, onClick: () => this.go('Mission', { i: this.li + 1 }) });
    if (arcadeNow) buttons.unshift({ label: 'ลงสนามไล่ล่า', style: 'primary', icon: 'bolt', pulse: true, onClick: () => this.go('Arcade', { world: L.world }) });
    buttons.push({ label: 'เล่นซ้ำ', style: 'cyan', icon: 'reset', onClick: () => this.go('Mission', { i: this.li }) });
    buttons.push({ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { world: L.world }) });
    KG.ui.modal(this, {
      title: lastOfWorld ? 'ผ่าน ' + this.world.name + '!' : 'ผ่านด่าน!', w: 760, extraH: 96 + lines * 30 + 24, accent: KG.C.sun,
      body: withPlayer('ใช้ ' + n + ' การ์ด  ·  ได้ 3 ดาวเมื่อใช้ไม่เกิน ' + L.par + ' การ์ด'), buttons: buttons,
      build: (box, g) => {
        const st = KG.ui.stars(this, 0, g.top + 52, 0, 3, 64); box.add(st);
        this.time.delayedCall(350, () => st.setStars(s, true));
        const ly = g.top + 106;
        box.add(KG.ui.panel(this, -300, ly, 600, lines * 30 + 22, { cuts: [10, 10, 10, 10], accent: '#4ef4d2', fill: ['#0e1b52', '#08102e'], glow: false, bracket: false }));
        box.add(KG.txt(this, 0, ly + 8, 'สิ่งที่ได้เรียนรู้: ' + L.learn, { size: 22, weight: 400, color: '#dbe4ff', center: true, ox: 0.5, width: 560 }));
      }
    });
  }
}
