/* ===== ภารกิจ: ต่อการ์ดคำสั่งให้ Techno ผ่านด่าน =====
   โครงหน้าจอ (ตำแหน่งตายตัว ไม่เลื่อน): หัวเรื่อง/ปุ่มควบคุม y8-64 · ฉาก y76-376 · แถบโปรแกรม y388-484 · คลังการ์ด y494-594 · ข้อความ y604-704 */
const BLK = {
  walk: { label: 'เดินหน้า', sub: '1 ช่อง', icon: 'walk', c: 0x22d3ee, dark: 0x0e7490, ink: '#04222a' },
  jump: { label: 'กระโดด', sub: 'ข้าม 2 ช่อง', icon: 'jump', c: 0x5ef08a, dark: 0x15803d, ink: '#04210f' },
  attack: { label: 'โจมตี', sub: 'ช่องข้างหน้า', icon: 'sword', c: 0xff6aa8, dark: 0xa3194f, ink: '#2c0618' },
  turn: { label: 'หันกลับ', icon: 'turn', c: 0xffd34f, dark: 0xa07800, ink: '#2a1c00' },
  rep: { label: 'ทำซ้ำ', icon: 'repeat', c: 0xff9d3d, dark: 0xb45309, ink: '#2e1600', box: true },
  until: { label: 'จนถึงประตู', icon: 'until', c: 0xff9d3d, dark: 0xb45309, ink: '#2e1600', box: true },
  while: { label: 'ขณะที่', icon: 'repeat', c: 0xff9d3d, dark: 0xb45309, ink: '#2e1600', box: true, cond: true },
  if: { label: 'ถ้า', icon: 'branch', c: 0xa78bfa, dark: 0x5b34c8, ink: '#ffffff', box: true, cond: true },
  ifelse: { label: 'ถ้า', icon: 'branch', c: 0xa78bfa, dark: 0x5b34c8, ink: '#ffffff', box: true, cond: true },
  call: { label: 'ท่า A', icon: 'func', c: 0x6ee7b7, dark: 0x0f766e, ink: '#03211b' }
};
const PAL_LABEL = { rep: 'ทำซ้ำ', until: 'จนถึงประตู', while: 'ขณะที่', if: 'ถ้า…', ifelse: 'ถ้า…ไม่งั้น' };
const CONDS = ['gap', 'foe', 'clear', 'wall'];
const COND_LABEL = { gap: 'หลุม/หนาม', foe: 'ศัตรู/ลัง', clear: 'โล่ง', wall: 'กำแพง' };
const REP_STEPS = [2, 3, 4, 5, 6, 7, 8, 10, 12];

function cardTex(scene, w, h, c, dark, role) {
  const cuts = role === 'end' ? [14, 0, 14, 0] : role === 'else' ? [10, 10, 10, 10] : [0, 14, 0, 14];
  return KG.tex(scene, ['card', w, h, c, role].join('|'), w + 16, h + 16, ctx => {
    ctx.translate(8, 8);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; KG.ui.cutPath(ctx, 0, 0, w, h, cuts); ctx.fillStyle = css(dark); ctx.fill(); ctx.restore();
    KG.ui.cutPath(ctx, 0, 0, w, h, cuts);
    ctx.fillStyle = role === 'end' || role === 'else' ? KG.ui.lin(ctx, 0, 0, 0, h, [[0, css(dark)], [1, '#0a0d2a']]) : KG.ui.lin(ctx, 0, 0, 0, h, [[0, css(c)], [1, css(dark)]]);
    ctx.fill();
    ctx.save(); KG.ui.cutPath(ctx, 0, 0, w, h, cuts); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, 0, w, 3);
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, h * 0.5, [[0, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h * 0.5); ctx.restore();
    KG.ui.cutPath(ctx, 1, 1, w - 2, h - 2, cuts); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
  });
}

/* การ์ดหนึ่งใบ (ใช้ทั้งในแถบโปรแกรมและคลังการ์ด) */
class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, h, type, role, o) {
    super(scene, x, y); o = o || {};
    this.w = w; this.h = h; this.type = type; this.role = role || 'leaf';
    const B = BLK[type] || BLK.walk;
    this.glow = scene.add.image(0, 0, 'fx_glow').setTint(0xffffff).setBlendMode('ADD').setDisplaySize(w * 2, h * 2).setAlpha(0);
    this.body = scene.add.image(0, 0, cardTex(scene, w, h, B.c, B.dark, this.role)).setDisplaySize(w + 16, h + 16);
    this.add([this.glow, this.body]);
    const ink = this.role === 'end' || this.role === 'else' ? '#ffffff' : B.ink;
    if (this.role === 'end') {
      this.add(KG.txt(scene, 0, 0, 'จบ', { size: 18, color: '#ffffff', center: true, middle: true }));
    } else if (this.role === 'else') {
      this.add(KG.txt(scene, 0, 0, 'ไม่งั้น', { size: 19, color: '#ffffff', center: true, middle: true }));
    } else {
      const withSub = (B.cond && !o.label) || !!B.sub;
      this.icon = KG.ui.icon(scene, B.icon, 0, withSub ? -h * 0.24 : -h * 0.17, Math.round(h * (withSub ? 0.34 : 0.42)), ink); this.add(this.icon);
      const lab = o.label || B.label;
      this.label = KG.txt(scene, 0, withSub ? h * 0.12 : h * 0.3, lab, { size: o.size || 18, color: ink, center: true, middle: true });
      if (withSub) { this.sub = KG.txt(scene, 0, h * 0.35, B.sub || '', { size: 15, color: ink, center: true, middle: true }); const f = (w - 8) / this.sub.width; if (f < 1) this.sub.setScale(f); this.add(this.sub); }
      const fit = (w - 10) / this.label.width; if (fit < 1) this.label.setScale(fit);
      this.add(this.label);
      this.badge = KG.txt(scene, w / 2 - 6, -h / 2 + 6, '', { size: 21, color: ink, ox: 1, oy: 0 }); this.add(this.badge);
    }
    scene.add.existing(this);
  }
  setBadge(s) { if (this.badge) this.badge.setText(s || ''); return this; }
  setSub(s) { if (this.sub) { this.sub.setText(s || ''); this.sub.setScale(1); const f = (this.w - 8) / this.sub.width; if (f < 1) this.sub.setScale(f); } return this; }
  light(on, color) { this.glow.setTint(color || 0xffffff); this.scene.tweens.killTweensOf(this.glow); this.scene.tweens.add({ targets: this.glow, alpha: on ? 0.85 : 0, duration: on ? 90 : 280 }); }
}

class MissionScene extends KG.Scene {
  constructor() { super('Mission'); }
  init(data) { this.li = data && data.i != null ? data.i : 0; this.forceTutor = !!(data && data.tutor); this._restartData = { i: this.li }; }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); KG.audio.music('think');
    this.tapeCount = null; this.tabBtns = {}; this._pt = null; this._caretTw = null; this._modal = null; this._say = 0; this.view = null;
    const L = this.level = LEVELS[this.li], W = this.world = WORLDS[L.world - 1], C = KG.C;
    this.state = 'idle'; this.token = 0; this.fails = 0; this.usedSol = false; this.spdIdx = 1; this.cards = new Map(); this.tokens = []; this.scrollX = 0;
    this.prog = { main: [], fn: [] }; this.tab = 'main'; this.caret = { list: this.prog.main, idx: 0 }; this.uid = 1;

    // ฉากหลังของทั้งหน้า
    this.add.image(GW / 2, GH / 2, 'arena_' + W.arena).setDisplaySize(GW * 1.1, GH * 1.1).setAlpha(0.55);
    const shade = KG.tex(this, 'missionshade', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.78)'], [1, 'rgba(5,8,28,.95)']]); ctx.fillRect(0, 0, GW, GH); });
    this.add.image(GW / 2, GH / 2, shade).setDisplaySize(GW, GH);

    this.buildHeader(); this.buildStage(); this.buildTape(); this.buildPalette(); this.buildStory();
    this.renderTape(true); this.updateHud();
    this.input.keyboard.on('keydown-SPACE', () => this.onRun());
    this.input.keyboard.on('keydown-ENTER', () => this.onRun());
    this.input.keyboard.on('keydown-BACKSPACE', () => this.deleteBack());
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
    this.btnRun.pulse(); this.btnRun.pulseOn = true;
    this.btnReset.setEnabled(false);
    this.cycleSpeed(true);
    this.btnHelp = iconButton(this, 1226, y, 'help', () => showHowTo(this), { w: 56, h: 52 });
  }
  cycleSpeed(init) {
    if (!init) this.spdIdx = (this.spdIdx + 1) % 3;
    const v = [0.65, 1, 1.7][this.spdIdx], lab = ['×1', '×2', '×3'][this.spdIdx];
    this.btnSpd.setLabel(lab); if (this.view) this.view.setSpeed(v); this.spd = v;
  }

  /* ---------- ฉาก ---------- */
  buildStage() {
    this.view = new LaneView(this, { x: 28, y: 80, w: 1224, h: 292 }, this.level, this.level.world);
    this.view.setSpeed(this.spd || 1);
    this.view.onCoin = (n, total, p) => { this.updateHud(); };
    const frame = frameBox(this, 24, 76, 1232, 300, this.world.tint);
    frame.setDepth(30);
    // ป้ายภารกิจ
    const total = this.view.map.coins.length;
    this.txt(1236, 90, '1 ช่อง = เดินหน้า 1 ก้าว  ·  กระโดด = ข้าม 1 ช่องไปลงช่องที่ 2', { size: 18, weight: 400, color: '#dbe4ff', ox: 1, stroke: true }).setDepth(31);
    const tag = this.txt(48, 90, 'ภารกิจ: เก็บเหรียญ ' + total + ' ดวง แล้วเข้าประตู', { size: 21, color: '#ffffff', stroke: true }).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: tag, alpha: 1, duration: 500, delay: 500 });
    this.tweens.add({ targets: tag, alpha: 0.0, duration: 600, delay: 5200 });
    this.flyTarget = { x: 1160, y: 646 };
  }

  /* ---------- แถบโปรแกรม ---------- */
  buildTape() {
    const P = KG.ui.panel(this, 24, 388, 1232, 96, { accent: css(this.world.color), cuts: [20, 0, 20, 0] }); P.setDepth(5);
    this.tapeX0 = 188; this.tapeW = 1056; this.tapeY = 436;
    this.tabBtns = {};
    if (this.level.allow.includes('call')) {
      this.tabBtns.main = new KG.ui.Button(this, 100, 414, 132, 40, { label: 'หน้าหลัก', style: 'cyan', size: 20, slant: 8, depth: 7, onClick: () => this.switchTab('main') });
      this.tabBtns.fn = new KG.ui.Button(this, 100, 458, 132, 40, { label: 'ท่า A', icon: 'func', style: 'ghost', size: 20, slant: 8, depth: 7, onClick: () => this.switchTab('fn') });
    } else {
      this.txt(100, 420, 'โปรแกรม', { size: 26, center: true, ox: 0.5, stroke: true }).setDepth(7); this.tapeCount = this.txt(100, 454, '', { size: 18, color: '#9fb0d8', center: true, ox: 0.5 }).setDepth(7);
    }
    // พื้นที่แสดงการ์ด (ตัดด้วยมาสก์)
    const mg = this.make.graphics({ x: 0, y: 0, add: false }); mg.fillStyle(0xffffff); mg.fillRect(this.tapeX0 - 6, 392, this.tapeW + 12, 88);
    this.tapeRoot = this.add.container(0, 0).setDepth(6); this.tapeRoot.setMask(mg.createGeometryMask());
    this.caretG = this.add.graphics(); this.tapeRoot.add(this.caretG);
    this.bracketG = this.add.graphics(); this.tapeRoot.add(this.bracketG);
    this.emptyHint = this.txt(this.tapeX0 + this.tapeW / 2, this.tapeY, 'แตะการ์ดจากคลังด้านล่างเพื่อต่อโปรแกรมที่นี่', { size: 22, color: '#6f82c9', center: true, middle: true, weight: 400 }).setDepth(6);
    this.tweens.add({ targets: this.emptyHint, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
    this.scrollL = iconButton(this, this.tapeX0 - 4, this.tapeY, 'chevL', () => this.scrollTape(-300), { w: 34, h: 56 }); this.scrollL.setDepth(8).setVisible(false);
    this.scrollR = iconButton(this, this.tapeX0 + this.tapeW + 2, this.tapeY, 'chevR', () => this.scrollTape(300), { w: 34, h: 56 }); this.scrollR.setDepth(8).setVisible(false);
    this.input.on('wheel', (p, objs, dx, dy) => { if (p.y > 388 && p.y < 484) this.scrollTape(dy); });
  }
  switchTab(name) {
    if (this.state !== 'idle' || this.tab === name) return;
    this.tab = name; this.caret = { list: this.prog[name], idx: this.prog[name].length };
    Object.keys(this.tabBtns).forEach(k => { this.tabBtns[k].setActive(k === name); });
    this.tabBtns.main.setLabel('หน้าหลัก'); this.scrollX = 0; this.renderTape(true); this.renderPalette(); KG.audio.play('tap');
  }
  flatten(list, depth, out, gaps) {
    for (let i = 0; i < list.length; i++) {
      const b = list[i]; gaps.push({ list, idx: i, pos: out.length });
      if (!b.body) out.push({ b, role: 'leaf', depth, list, i });
      else {
        out.push({ b, role: 'open', depth, list, i }); this.flatten(b.body, depth + 1, out, gaps);
        if (b.t === 'ifelse') { out.push({ b, role: 'else', depth, list, i }); this.flatten(b.other, depth + 1, out, gaps); }
        out.push({ b, role: 'end', depth, list, i });
      }
    }
    gaps.push({ list, idx: list.length, pos: out.length });
  }
  count() { return CR.countProgram(this.prog); }
  cardW(t) { return t.role === 'end' ? 50 : t.role === 'else' ? 70 : 78; }
  renderTape(instant, spawnFrom) {
    const toks = [], gaps = []; this.flatten(this.prog[this.tab], 0, toks, gaps);
    this.tokens = toks; this.gaps = gaps;
    const GAP = 8; let x = this.tapeX0, pos = [];
    toks.forEach(t => { pos.push(x); x += this.cardW(t) + GAP; });
    this.tapeTotal = x - this.tapeX0; this.tokPos = pos;
    const keep = new Set();
    toks.forEach((t, k) => {
      const key = t.b.id + ':' + t.role; keep.add(key);
      const w = this.cardW(t), tx = pos[k] + w / 2 - this.scrollX, ty = this.tapeY;
      let c = this.cards.get(key);
      if (!c) {
        c = new Card(this, tx, ty, w, 80, t.b.t, t.role); this.tapeRoot.add(c); this.cards.set(key, c);
        c.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -42, w, 84), Phaser.Geom.Rectangle.Contains);
        c.on('pointerdown', () => { c._down = true; });
        c.on('pointerup', () => { if (c._down) { c._down = false; this.tapToken(c.tok); } });
        c.on('pointerout', () => { c._down = false; });
        if (!instant) {
          const from = spawnFrom || { x: tx, y: ty + 90 };
          c.setPosition(from.x, from.y).setScale(0.6).setAlpha(0.2);
          this.tweens.add({ targets: c, x: tx, y: ty, scaleX: 1, scaleY: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
        }
      } else if (instant) c.setPosition(tx, ty);
      else this.tweens.add({ targets: c, x: tx, y: ty, duration: 200, ease: 'Cubic.easeOut' });
      c.tok = t;
      if (t.role === 'open') { const B = BLK[t.b.t]; c.setBadge(t.b.t === 'rep' ? '×' + t.b.n : ''); if (B.cond) c.setSub(COND_LABEL[t.b.c]); }
    });
    this.cards.forEach((c, key) => { if (!keep.has(key)) { this.cards.delete(key); this.tweens.add({ targets: c, scaleX: 0.2, scaleY: 0.2, alpha: 0, duration: 160, onComplete: () => c.destroy() }); } });
    this.emptyHint.setVisible(!toks.length && this.state === 'idle');
    this.drawBrackets(); this.drawCaret(); this.updateHud();
    this.scrollL.setVisible(this.tapeTotal > this.tapeW); this.scrollR.setVisible(this.tapeTotal > this.tapeW);
  }
  drawBrackets() {
    const g = this.bracketG; g.clear();
    const open = [];
    this.tokens.forEach((t, k) => {
      if (t.role === 'open') open.push({ t, k });
      if (t.role === 'end') {
        const o = open.pop(); if (!o) return;
        const x0 = this.tokPos[o.k] - this.scrollX, x1 = this.tokPos[k] + this.cardW(t) - this.scrollX, y = this.tapeY + 46 - (o.t.depth) * 0;
        const B = BLK[o.t.b.t]; g.fillStyle(B.c, 0.85); g.fillRect(x0, y - 2, x1 - x0, 4);
      }
    });
  }
  caretX() {
    const g = this.gaps.find(q => q.list === this.caret.list && q.idx === this.caret.idx);
    const pos = g ? g.pos : this.tokens.length;
    if (pos < this.tokens.length) return this.tokPos[pos] - 4 - this.scrollX;
    return (this.tokens.length ? this.tokPos[this.tokens.length - 1] + this.cardW(this.tokens[this.tokens.length - 1]) + 4 : this.tapeX0 - 4) - this.scrollX;
  }
  drawCaret() {
    const g = this.caretG; g.clear(); if (this.state !== 'idle') return;
    const x = this.caretX(), y = this.tapeY;
    g.fillStyle(KG.C.cyan, 0.25); g.fillRect(x - 5, y - 44, 10, 88);
    g.fillStyle(KG.C.cyan, 1); g.fillRect(x - 2, y - 44, 4, 88);
    g.fillTriangle(x - 8, y - 44, x + 8, y - 44, x, y - 34); g.fillTriangle(x - 8, y + 44, x + 8, y + 44, x, y + 34);
    if (!this._caretTw) this._caretTw = this.tweens.add({ targets: g, alpha: 0.45, duration: 520, yoyo: true, repeat: -1 });
    // เลื่อนแถบให้เห็นเคอร์เซอร์
    const vis = x + this.scrollX; const maxS = Math.max(0, this.tapeTotal - this.tapeW + 40);
    if (x > this.tapeX0 + this.tapeW - 40) this.scrollTape(x - (this.tapeX0 + this.tapeW - 120), true);
    else if (x < this.tapeX0 + 20 && this.scrollX > 0) this.scrollTape(x - (this.tapeX0 + 140), true);
  }
  scrollTape(d, soft) {
    const maxS = Math.max(0, this.tapeTotal - this.tapeW + 30);
    const t = KG.clamp(this.scrollX + d, 0, maxS); if (t === this.scrollX) return;
    this.scrollX = t; this.renderTape(true);
  }
  tapToken(t) {
    if (this.state !== 'idle' || !t) return; KG.audio.play('tap');
    const b = t.b;
    if (t.role === 'open') {
      if (b.t === 'rep') { const k = REP_STEPS.indexOf(b.n); b.n = REP_STEPS[(k + 1) % REP_STEPS.length]; KG.audio.play('tick', { p: 1.2 }); }
      else if (BLK[b.t].cond) { b.c = CONDS[(CONDS.indexOf(b.c) + 1) % CONDS.length]; KG.audio.play('tick', { p: 1.2 }); }
      this.caret = { list: b.body, idx: 0 };
    } else if (t.role === 'else') this.caret = { list: b.other, idx: 0 };
    else if (t.role === 'end') this.caret = { list: t.list, idx: t.i + 1 };
    else this.caret = { list: t.list, idx: t.i + 1 };
    const c = this.cards.get(b.id + ':' + t.role); if (c) { this.tweens.add({ targets: c, scaleX: 1.1, scaleY: 1.1, duration: 90, yoyo: true }); }
    this.renderTape(true);
  }

  /* ---------- คลังการ์ด ---------- */
  buildPalette() {
    const P = KG.ui.panel(this, 24, 494, 1232, 100, { accent: '#6f8cff', cuts: [0, 20, 0, 20] }); P.setDepth(5);
    const order = ['walk', 'jump', 'attack', 'turn', 'rep', 'until', 'while', 'if', 'ifelse', 'call'].filter(t => this.level.allow.includes(t));
    this.palOrder = order; this.palBtns = {};
    const n = order.length, usable = 1232 - 24 - 100, w = Math.min(112, Math.floor((usable - (n - 1) * 8) / n)), x0 = 24 + 14 + w / 2;
    order.forEach((t, i) => {
      const x = x0 + i * (w + 8), y = 544;
      const c = new Card(this, x, y, w, 84, t, 'leaf', { label: PAL_LABEL[t], size: 18 }); c.setDepth(7);
      c.setInteractive(new Phaser.Geom.Rectangle(-w / 2 - 2, -44, w + 4, 88), Phaser.Geom.Rectangle.Contains);
      c.on('pointerover', () => { if (this.state === 'idle') { this.tweens.add({ targets: c, y: y - 4, duration: 100 }); KG.audio.play('hover'); } });
      c.on('pointerout', () => { this.tweens.add({ targets: c, y, duration: 120 }); c.setScale(1); });
      c.on('pointerdown', () => { c.setScale(0.95); });
      c.on('pointerup', () => { c.setScale(1); this.insertBlock(t, { x: c.x, y: c.y }); });
      c.homeY = y; this.palBtns[t] = c;
    });
    this.btnDel = new KG.ui.Button(this, 24 + 1232 - 14 - 44, 544, 88, 84, { label: '', icon: 'trash', style: 'danger', slant: 8, onClick: () => this.deleteBack() });
    this.btnDel.setDepth(8);
    this.renderPalette();
  }
  renderPalette() {
    const full = this.count() >= this.level.maxBlocks;
    this.palOrder.forEach(t => {
      const c = this.palBtns[t]; const dis = (t === 'call' && this.tab === 'fn') || this.state !== 'idle';
      c.setAlpha(dis ? 0.35 : (full ? 0.6 : 1));
    });
  }
  insertBlock(t, from) {
    if (this.state !== 'idle') { toast_(this, 'กดรีเซ็ตก่อนจึงจะแก้โปรแกรมได้'); return; }
    if (t === 'call' && this.tab === 'fn') { toast_(this, 'ในท่า A เรียกท่า A ซ้ำไม่ได้'); KG.audio.play('error'); return; }
    if (this.count() >= this.level.maxBlocks) { KG.audio.play('error'); toast_(this, 'การ์ดเต็มแล้ว ลองจัดโปรแกรมให้สั้นลง'); KG.fx.shake(this, 120, 0.003); return; }
    const b = { id: 'b' + (this.uid++), t };
    if (t === 'rep') { b.n = 2; b.body = []; } else if (t === 'until') b.body = [];
    else if (t === 'while') { b.c = 'foe'; b.body = []; } else if (t === 'if') { b.c = 'gap'; b.body = []; }
    else if (t === 'ifelse') { b.c = 'gap'; b.body = []; b.other = []; }
    this.caret.list.splice(this.caret.idx, 0, b);
    this.caret = b.body ? { list: b.body, idx: 0 } : { list: this.caret.list, idx: this.caret.idx + 1 };
    KG.audio.play('drop'); this.clearPoint();
    this.renderTape(false, from); this.renderPalette();
    const k = this.cards.get(b.id + ':' + (b.body ? 'open' : 'leaf')); if (k) KG.fx.burst(this, from ? from.x : k.x, from ? from.y : k.y, { colors: [BLK[t].c, 0xffffff], n: 8, max: 160, depth: 40 });
  }
  deleteBack() {
    if (this.state !== 'idle') return;
    const { list, idx } = this.caret;
    if (idx > 0) {
      list.splice(idx - 1, 1); this.caret = { list, idx: idx - 1 };
    } else {
      // เคอร์เซอร์อยู่ต้นของลูป/เงื่อนไข: ถ้าข้างในว่างให้ลบตัวหุ้มทิ้ง
      const owner = this.findOwner(list);
      if (owner && owner.empty) { owner.parent.splice(owner.i, 1); this.caret = { list: owner.parent, idx: owner.i }; }
      else { KG.audio.play('error'); return; }
    }
    KG.audio.play('remove'); this.renderTape(true); this.renderPalette();
  }
  findOwner(list) {
    const search = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        const b = arr[i];
        if (b.body === list || b.other === list) { const empty = b.body.length === 0 && (!b.other || b.other.length === 0); return { parent: arr, i, empty }; }
        const r = (b.body && search(b.body)) || (b.other && search(b.other)); if (r) return r;
      }
      return null;
    };
    return search(this.prog.main) || search(this.prog.fn);
  }
  clearAll() { if (this.state !== 'idle' || !this.count()) return; this.prog = { main: [], fn: [] }; this.caret = { list: this.prog[this.tab], idx: 0 }; this.renderTape(true); this.renderPalette(); KG.audio.play('remove'); }

  /* ---------- บทสอนเล่น (ด่านแรก) ---------- */
  startTutor() {
    if (this.tutor || this._modal) return;
    const walk = () => { const c = this.palBtns.walk, w = c.w || 112; return { x: c.x - w / 2, y: c.y - 42, w: w, h: 84 }; };
    const nWalk = () => this.prog.main.filter(b => b.t === 'walk').length;
    this.tutor = new KG.Tutor(this, [
      { text: 'ยินดีต้อนรับสู่ Code Runner! ภารกิจคือเขียนโปรแกรมด้วยการ์ดคำสั่ง ให้ Techno เดินไปถึงประตูมิติ ลองทำตามทีละขั้นนะ' },
      { text: 'นี่คือทางเดิน แต่ละช่องมีตัวเลขกำกับ Techno อยู่ที่ช่อง "เริ่ม" ประตูอยู่ทางขวา และมีแกนพลังงานสีเขียวให้เก็บให้ครบ ประตูจึงจะเปิด', target: { x: 24, y: 76, w: 1232, h: 300 }, pad: 0, pos: 'bottom' },
      { text: 'การ์ด "เดินหน้า" ใช้สั่งให้ Techno เดิน 1 ช่อง แตะการ์ดนี้ 7 ครั้ง (ประตูอยู่ช่องที่ 8)', target: walk, mode: 'wait', until: () => nWalk() >= 7, pos: 'top' },
      { text: 'การ์ดที่แตะจะเรียงต่อกันในแถบ "โปรแกรม" คอมพิวเตอร์ทำทีละใบจากซ้ายไปขวา ถ้าวางเกินแตะปุ่มถังขยะสีแดงเพื่อลบ', target: { x: 24, y: 388, w: 1232, h: 96 }, pad: 0, pos: 'top' },
      { text: 'กดปุ่ม "รัน" เพื่อให้ Techno เดินตามโปรแกรม', target: this.btnRun, mode: 'wait', until: () => this.state !== 'idle', pos: 'bottom' },
      { text: 'ดูสิ! การ์ดที่เรืองแสงคือคำสั่งที่กำลังทำ Techno เก็บแกนพลังงานแล้วเข้าประตู', mode: 'wait', block: false, pos: 'top', until: () => this.state === 'done' },
      { text: 'ยอดเยี่ยม! ด่านต่อไปจะมีหลุมและสิ่งกีดขวาง ใช้การ์ดให้น้อยที่สุดเพื่อได้ดาวเต็ม 3 ดวง' }
    ], { onDone: () => { SAVE.data.tutorDone = true; SAVE.save(); this.tutor = null; } });
  }

  /* ---------- แถบข้อความและสถานะ ---------- */
  buildStory() {
    KG.ui.panel(this, 24, 604, 1232, 100, { accent: '#4ef4d2', cuts: [0, 0, 0, 0], glow: true }).setDepth(5);
    // ภาพฮีโร่ในกรอบ
    const fr = this.add.image(90, 654, KG.tex(this, 'portraitframe', 96, 84, ctx => { KG.ui.cutPath(ctx, 2, 2, 92, 80, [14, 0, 14, 0]); ctx.fillStyle = '#0a1030'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#4ef4d2'; ctx.stroke(); })).setDisplaySize(96, 84).setDepth(6);
    this.portrait = KG.art.make(this, 90, 698, HID, 'idle', 62).setDepth(7);
    // ซ่อนส่วนที่ล้นกรอบด้วยการวาดซ้ำเฉพาะขอบล่างไม่จำเป็น เพราะกรอบอยู่ภายในแผง
    this.bubble = this.txt(160, 612, '', { size: 21, weight: 400, color: '#e6edff', width: 720, lineSpacing: 5 }).setDepth(7);
    this.bubbleSolBtn = new KG.ui.Button(this, 760, 686, 150, 34, { label: 'ดูเฉลย', style: 'ghost', size: 17, slant: 6, onClick: () => this.showSolution() }).setDepth(9).setVisible(false);
    // ตัวเลขสถานะ ขวา
    const x0 = 904;
    this.chipCoin = this.makeChip(x0, 628, 'gem', 0x4ef4d2); this.chipGate = this.makeChip(x0 + 170, 628, 'lock', 0xffd34f); this.chipCards = this.makeChip(x0, 674, 'wheel', 0x6f8cff); this.chipStar = this.makeChip(x0 + 170, 674, 'star', 0xffd34f);
  }
  makeChip(x, y, icon, color) {
    const ic = KG.ui.icon(this, icon, x + 16, y, 30, color).setDepth(7); const t = this.txt(x + 40, y, '', { size: 21, color: '#e6edff', oy: 0.5 }).setDepth(7);
    return { ic, t };
  }
  updateHud() {
    if (!this.chipCoin) return;
    const total = this.view.map.coins.length;
    this.chipCoin.t.setText('เหรียญ ' + this.view.coinsGot + '/' + total);
    this.chipGate.t.setText(this.view.gateOpen ? 'ประตูเปิด' : 'ประตูปิด');
    this.chipGate.ic.setTexture(KG.ui.iconKey(this, this.view.gateOpen ? 'flag' : 'lock')).setTint(this.view.gateOpen ? 0x5ef08a : 0xffd34f);
    const n = this.count(); this.chipCards.t.setText('การ์ด ' + n + '/' + this.level.maxBlocks).setColor(n >= this.level.maxBlocks ? '#ff7a8a' : '#e6edff');
    this.chipStar.t.setText('3 ดาว ≤ ' + this.level.par);
    if (this.tapeCount) this.tapeCount.setText(n + ' การ์ด');
  }
  say(text, kind) {
    this._say = (this._say || 0) + 1; const id = this._say;
    const str = KG.wrap(text, 720, '400 21px Kanit'); this.bubble.setText(''); this.bubble.setColor(kind === 'bad' ? '#ffb3bd' : kind === 'hint' ? '#ffd34f' : kind === 'good' ? '#9bffc0' : '#e6edff');
    let i = 0; const step = () => { if (id !== this._say) return; i += 2; this.bubble.setText(str.slice(0, i)); if (i < str.length) this.time.delayedCall(16, step); }; step();
    this.tweens.add({ targets: this.portrait, y: this.portrait.y - 6, duration: 110, yoyo: true, repeat: 1 });
    KG.art.frame(this.portrait, kind === 'bad' ? 'hurt' : kind === 'good' ? 'a2' : 'idle');
  }
  showHint() {
    const L = this.level; this.say('คำใบ้: ' + L.hint, 'hint'); KG.audio.play('pop');
    this.tweens.add({ targets: this.chipCards.t, scaleX: 1.15, scaleY: 1.15, duration: 100, yoyo: true });
  }
  showSolution() {
    if (this.state !== 'idle') this.onReset();
    this.usedSol = true; this.prog = CR.cloneProgram(this.level.sol); this.tab = 'main'; this.caret = { list: this.prog.main, idx: this.prog.main.length };
    this.scrollX = 0; this.renderTape(true); this.renderPalette(); this.say('นี่คือตัวอย่างโปรแกรม ลองกดรันดูว่าทำงานอย่างไร (ดาวจะได้ 1 ดวง)', 'hint'); this.bubbleSolBtn.setVisible(false);
  }
  pointAt(target) {
    this.clearPoint();
    const a = KG.ui.icon(this, 'chevD', target.x, target.y - 70, 46, 0xffd34f).setDepth(40);
    this._pt = a; this.tweens.add({ targets: a, y: a.y + 12, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  clearPoint() { if (this._pt) { this._pt.destroy(); this._pt = null; } }

  /* ---------- การรันโปรแกรม ---------- */
  setState(s) {
    this.state = s;
    this.btnRun.setLabel(s === 'playing' ? 'พัก' : (s === 'paused' ? 'เล่นต่อ' : 'รัน'));
    this.btnRun.icon.setTexture(KG.ui.iconKey(this, s === 'playing' ? 'pause' : 'play'));
    this.btnStep.setEnabled(s !== 'playing' && s !== 'done'); this.btnReset.setEnabled(s !== 'idle'); this.btnRun.setEnabled(s !== 'done');
    this.btnDel.setEnabled(s === 'idle');
    this.caretG.setVisible(s === 'idle'); this.drawCaret(); this.renderPalette();
    this.emptyHint.setVisible(s === 'idle' && !this.tokens.length);
  }
  prepare() {
    this.view.reset(); this.updateHud();
    this.res = CR.run(this.level, this.prog); this.events = this.res.events; this.idx = 0; this.token++;
    this.say('กำลังรันโปรแกรม…', 'story');
  }
  highlight(id, op, ok) {
    this.cards.forEach(c => { if (c._lit) { c._lit = false; c.light(false); } });
    if (!id) return;
    [id + ':leaf', id + ':open'].forEach(k => {
      const c = this.cards.get(k); if (!c) return; c._lit = true;
      c.light(true, op === 'cond' ? (ok ? 0x5ef08a : 0xff7a8a) : 0xffffff);
      this.tweens.add({ targets: c, y: this.tapeY - 6, duration: 90, yoyo: true });
      const tk = c.tok; if (tk) { const x = this.tokPos[this.tokens.indexOf(tk)] - this.scrollX; if (x > this.tapeX0 + this.tapeW - 80 || x < this.tapeX0) this.scrollTape(x - this.tapeX0 - 300); }
    });
  }
  async stepEvent() {
    const t = this.token, ev = this.events[this.idx++];
    this.highlight(ev.id, ev.op, ev.ok);
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
      if (!this.count()) { toast_(this, 'ยังไม่มีการ์ด แตะการ์ดในคลังเพื่อเริ่มต่อโปรแกรม'); KG.audio.play('error'); return; }
      this.prepare(); SAVE.data.seenHow = true; SAVE.save(); this.clearPoint();
    }
    if (this.btnRun.pulseOn) { this.btnRun.pulseOn = false; this.tweens.killTweensOf(this.btnRun); this.btnRun.setScale(1); }
    this.setState('playing'); KG.audio.play('go'); this.loop();
  }
  async onStep() {
    if (this.state === 'idle') {
      if (!this.count()) { toast_(this, 'ยังไม่มีการ์ด แตะการ์ดในคลังเพื่อเริ่มต่อโปรแกรม'); KG.audio.play('error'); return; }
      this.prepare(); this.clearPoint();
    }
    if (this.state === 'done' || this._busy) return;
    this.setState('paused'); this._busy = true; const t = this.token;
    let r;
    do { r = await this.stepEvent(); if (r.cancelled || t !== this.token) { this._busy = false; return; } } while (!r.done && !['walk', 'jump', 'attack', 'turn'].includes(r.ev.op));
    this._busy = false;
    if (r.done) await this.finish(r.ev);
  }
  onReset() {
    this.token++; this._busy = false; this.highlight(null);
    this.view.reset(); this.setState('idle'); this.updateHud(); KG.audio.play('back');
    this.say(this.fails >= 2 ? 'คำใบ้: ' + this.level.hint : this.level.story, this.fails >= 2 ? 'hint' : 'story');
  }
  async finish(ev) {
    const t = this.token, r = this.res; this.setState('done'); this.highlight(null);
    if (ev.op === 'fail') { this.markBad(ev.id); }
    if (r.result === 'win') { await this.winSequence(); return; }
    this.fails++;
    const MSG = {
      bump: 'Techno ชนสิ่งกีดขวาง บล็อกที่ผิดเป็นสีแดง ลองใช้ "โจมตี" ถ้าเป็นลังหรือศัตรู หรือ "กระโดด" ถ้าข้ามได้',
      fall: 'Techno ตกหลุม ต้องกระโดดข้ามก่อนถึงหลุมหนึ่งช่อง ลองนับช่องอีกครั้ง',
      spike: 'Techno โดนหนาม ต้องกระโดดข้ามหนาม ห้ามเดินทับ',
      timeout: 'โปรแกรมทำงานนานเกินไป น่าจะวนซ้ำไม่รู้จบ ตรวจเงื่อนไขของลูปอีกครั้ง',
      goal: 'โปรแกรมจบแล้วแต่ Techno ยังไม่ถึงประตู ลองเพิ่มคำสั่งให้ไปต่อ',
      cores: 'ถึงประตูแล้วแต่ยังเก็บเหรียญไม่ครบ (เก็บได้ ' + r.coins + ' จาก ' + r.totalCoins + ' ดวง) ประตูจะเปิดต่อเมื่อเก็บครบ'
    };
    if (r.result === 'goal' || r.result === 'cores') { this.view.flash(0xffd34f, 0.18); KG.audio.play('error'); this.view.popText(r.result === 'cores' ? 'เหรียญไม่ครบ' : 'ยังไม่ถึงประตู', '#ffd34f'); }
    this.say(MSG[r.result] || 'ลองใหม่อีกครั้ง', 'bad');
    KG.audio.play('lose');
    this.btnReset.pulse(); this.time.delayedCall(2600, () => { if (this.btnReset && this.state === 'done') { this.tweens.killTweensOf(this.btnReset); this.btnReset.setScale(1); } });
    if (this.fails >= 4) this.bubbleSolBtn.setVisible(true);
  }
  markBad(id) { const c = this.cards.get(id + ':leaf') || this.cards.get(id + ':open'); if (c) { c.light(true, 0xff4d5e); c._lit = true; this.tweens.add({ targets: c, x: c.x + 6, duration: 50, yoyo: true, repeat: 4 }); } }
  async winSequence() {
    const n = this.res.blocks, L = this.level; let s = n <= L.par ? 3 : (n <= L.par + 2 ? 2 : 1); if (this.usedSol) s = 1;
    const better = s > missionStars(this.li); if (better) { SAVE.data.stars[this.li] = s; SAVE.save(); }
    KG.stats.record({ lvl: 'm' + (this.li + 1), stars: s, m: this.fails, h: this.usedSol ? 1 : 0, secs: Math.round((Date.now() - this._t0) / 1000) });
    this.say('สำเร็จ! ' + L.learn, 'good');
    await this.view.win(); KG.fx.confetti(this, { ms: 1100 }); KG.audio.play('win'); KG.fx.shake(this, 200, 0.004);
    await wait(this, 450);
    const lastOfWorld = this.li + 1 >= LEVELS.length || LEVELS[this.li + 1].world !== L.world;
    const lines = KG.wrap(L.learn, 540, '400 22px Kanit').split('\n').length;
    const arcadeNow = lastOfWorld && arcadeOpen(L.world);
    const buttons = [];
    if (this.li + 1 < LEVELS.length) buttons.push({ label: lastOfWorld ? 'SECTOR ถัดไป' : 'ด่านถัดไป', style: arcadeNow ? 'ghost' : 'primary', icon: 'chevR', pulse: !arcadeNow, onClick: () => this.go('Mission', { i: this.li + 1 }) });
    if (arcadeNow) buttons.unshift({ label: 'ลงสนามวิ่ง', style: 'primary', icon: 'bolt', pulse: true, onClick: () => this.go('Arcade', { world: L.world }) });
    buttons.push({ label: 'เล่นซ้ำ', style: 'cyan', icon: 'reset', onClick: () => this.go('Mission', { i: this.li }) });
    buttons.push({ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { world: L.world }) });
    const modal = KG.ui.modal(this, {
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

