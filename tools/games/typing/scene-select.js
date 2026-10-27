/* ===== เลือกภาษา โหมด และด่านฝึกพิมพ์ ===== */
class SelectScene extends KG.Scene {
  constructor() { super('Select'); }
  init(data) { this.sel = data && data.level ? data.level : null; this._restartData = { level: this.sel }; }
  create() {
    this.setup(); KG.audio.music('menu');
    this.lang = SAVE.data.lang; this.mode = SAVE.data.mode; this.nodes = []; this.detail = null; this.ring = null;
    if (!this.sel) this.sel = nextLevel(this.lang);
    this.add.image(GW / 2, GH / 2, 'arena_thunder').setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'tyselshade', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.88)'], [1, 'rgba(5,8,28,.95)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);
    KG.fx.ambient(this, { freq: 200, colors: [0x4ef4d2, 0xffd34f, 0xffffff] });
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 });
    this.txt(100, 6, 'TYPE HERO', { size: 18, color: '#ffd34f' }); this.txt(100, 26, 'เลือกภาษาและด่าน', { size: 32, stroke: true });
    this.txt(GW - 330, 24, 'ดาวสะสม ' + totalStars() + '/' + maxStars(), { size: 24, color: '#ffd34f', stroke: true, ox: 1 });
    KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffd34f);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => showHowTo(this), { w: 56, h: 52 });

    // ตัวเลือกภาษาและโหมด
    this.txt(36, 98, 'ภาษา', { size: 22, color: '#9fb0d8' });
    this.langBtns = {
      th: new KG.ui.Button(this, 200, 120, 170, 52, { label: 'ไทย', style: 'ghost', size: 26, slant: 10, onClick: () => this.setLang('th') }),
      en: new KG.ui.Button(this, 392, 120, 190, 52, { label: 'English', style: 'ghost', size: 26, slant: 10, onClick: () => this.setLang('en') })
    };
    this.txt(640, 108, 'เลือกโหมดจับเวลาหรือไม่จับเวลาได้ตอนเริ่มด่าน', { size: 20, weight: 400, color: '#9fb0d8' });
    KG.ui.panel(this, 24, 168, 1232, 360, { accent: '#6f8cff', cuts: [24, 0, 24, 0] });
    KG.ui.panel(this, 24, 540, 1232, 164, { accent: '#ffd34f', cuts: [0, 24, 0, 24] });
    this.board = this.add.container(0, 0);
    this.refreshToggles(); this.buildBoard(false);
    // คีย์ลัด: ลูกศรหรือเลข 1–9, 0 (= ด่าน 10) เลือกด่าน · Enter/Space เริ่ม · L สลับภาษา · Esc กลับ (โหมดเลือกตอนเริ่มด่าน)
    this.txt(102, 70, 'คีย์ลัด: ลูกศรหรือเลข เลือกด่าน · Enter เริ่ม · L ภาษา · Esc กลับ', { size: 14, weight: 400, color: '#9fb0d8' });
    this.input.keyboard.on('keydown', e => this.onKey(e));
  }
  onEscape() { if (this._modal && !this._modal.closed) { this._modal.close(); return; } this.go('Title'); }
  onKey(e) {
    const c = e.code; if (c === 'Escape' || e.repeat) return;
    if (this._modal && !this._modal.closed) { if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') this._modal.close(); return; }
    const i = this.nodes.indexOf(this.selNode), dg = /^(Digit|Numpad)(\d)$/.exec(c);
    const step = d => { for (let k = i + d; k >= 0 && k < this.nodes.length; k += d) if (this.nodes[k].open) { this.pick(this.nodes[k]); return; } KG.audio.play('denied'); };
    if (c === 'ArrowRight' || c === 'ArrowDown') step(1); else if (c === 'ArrowLeft' || c === 'ArrowUp') step(-1);
    else if (dg) { const n = +dg[2] || 10, nd = this.nodes.find(o => o.L.id === n); if (nd) this.pick(nd); }
    else if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') { e.preventDefault && e.preventDefault(); this.startSel(); }
    else if (c === 'KeyL') this.setLang(this.lang === 'th' ? 'en' : 'th');
  }
  startSel() { const nd = this.selNode; if (!nd || !nd.open) return; const L = nd.L; this.go('Play', { level: L.id, lang: this.lang, mode: this.mode, tutor: L.id === 1 }); }
  setLang(l) { if (l === this.lang) return; this.lang = l; SAVE.data.lang = l; SAVE.save(); KG.audio.play('tap'); this.sel = nextLevel(l); this.refreshToggles(); this.buildBoard(true); }
  refreshToggles() {
    Object.keys(this.langBtns).forEach(k => { this.langBtns[k].setActive(k === this.lang); this.langBtns[k].label.setColor(k === this.lang ? '#ffd34f' : '#f4f7ff'); });
  }
  pos(i) { const row = Math.floor(i / 5), col = i % 5, x = 190 + (row ? 4 - col : col) * 225; return { x, y: 270 + row * 170 }; }
  buildBoard(anim) {
    this.board.removeAll(true); this.nodes = [];
    const path = this.add.graphics(); this.board.add(path);
    for (let i = 0; i < LEVELS.length - 1; i++) {
      const a = this.pos(i), b = this.pos(i + 1), lit = levelStars(this.lang, LEVELS[i].id) > 0;
      path.lineStyle(10, lit ? 0xffd34f : 0x25306a, lit ? 0.9 : 0.8); path.beginPath(); path.moveTo(a.x, a.y); path.lineTo(b.x, b.y); path.strokePath();
      if (lit) { path.lineStyle(3, 0xffffff, 0.8); path.beginPath(); path.moveTo(a.x, a.y); path.lineTo(b.x, b.y); path.strokePath(); }
    }
    LEVELS.forEach((L, i) => this.makeNode(L, this.pos(i), anim, i));
    const first = this.nodes.find(n => n.L.id === this.sel && n.open) || this.nodes.find(n => n.open && !n.stars) || this.nodes[0];
    this.pick(first, true);
  }
  makeNode(L, p, anim, k) {
    const open = levelOpen(this.lang, L.id), stars = levelStars(this.lang, L.id), r = 52;
    const c = this.add.container(p.x, p.y); this.board.add(c);
    const hex = this.add.image(0, 0, hexTex(this, r, '#ffd34f', '#a07800', open ? 'open' : 'locked')); c.add(hex);
    if (open) { const glow = this.add.image(0, 0, 'fx_glow').setTint(0xffd34f).setBlendMode('ADD').setDisplaySize(r * 3.4, r * 3.4).setAlpha(stars ? 0.25 : 0.5); c.addAt(glow, 0); this.tweens.add({ targets: glow, alpha: stars ? 0.45 : 0.85, duration: 1100, yoyo: true, repeat: -1 }); }
    if (!open) c.add(KG.ui.icon(this, 'lock', 0, 0, 34, 0x6f7fc9));
    else if (L.id === 1) c.add(KG.ui.icon(this, 'book', 0, -2, 40, 0x10122b));
    else c.add(KG.txt(this, 0, -4, String(L.id), { size: 42, color: '#10122b', center: true, middle: true }));
    c.add(KG.txt(this, 0, r + 4, L.id === 1 ? 'บทสอน' : 'ด่าน ' + L.id, { size: 19, color: open ? '#dbe4ff' : '#6f7fc9', center: true, ox: 0.5, stroke: true }));
    if (open) for (let i = 0; i < 3; i++) c.add(KG.ui.icon(this, i < stars ? 'star' : 'starO', (i - 1) * 22, r + 38, 20, i < stars ? 0xffd34f : 0x4a5aa8));
    const zone = this.add.zone(0, 0, r * 2, r * 1.9).setInteractive({ useHandCursor: true }); c.add(zone);
    const nd = { c, L, open, stars, r, hex };
    zone.on('pointerover', () => { if (open) { this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120 }); KG.audio.play('hover'); } });
    zone.on('pointerout', () => this.tweens.add({ targets: c, scaleX: this.selNode === nd ? 1.12 : 1, scaleY: this.selNode === nd ? 1.12 : 1, duration: 120 }));
    zone.on('pointerup', () => this.pick(nd));
    if (anim) { c.setScale(0).setAlpha(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 320, delay: 80 + k * 60, ease: 'Back.easeOut' }); }
    this.nodes.push(nd);
  }
  pick(nd, silent) {
    if (!nd) return;
    if (!nd.open) { KG.audio.play('error'); KG.ui.toast(this, 'ผ่านด่านก่อนหน้าให้ได้อย่างน้อย 1 ดาว จึงจะเปิดด่านนี้'); this.tweens.add({ targets: nd.c, x: nd.c.x + 6, duration: 50, yoyo: true, repeat: 3 }); return; }
    this.selNode = nd; this.sel = nd.L.id; if (!silent) KG.audio.play('tap');
    this.nodes.forEach(o => this.tweens.add({ targets: o.c, scaleX: o === nd ? 1.12 : 1, scaleY: o === nd ? 1.12 : 1, duration: 140 }));
    if (this.ring) this.ring.destroy(); this.ring = KG.ui.icon(this, 'chevD', nd.c.x, nd.c.y - nd.r - 34, 34, 0xffd34f); this.board.add(this.ring);
    this.tweens.add({ targets: this.ring, y: this.ring.y + 10, duration: 420, yoyo: true, repeat: -1 });
    this.renderDetail(nd);
  }
  renderDetail(nd) {
    if (this.detail) this.detail.destroy(true);
    const L = nd.L, c = this.detail = this.add.container(0, 0), best = SAVE.data.best[this.lang][L.id];
    const sample = TY.deck(this.lang, L.id), secs = TY.timeLimit(this.lang, L.id, sample);
    c.add(KG.txt(this, 60, 556, (L.id === 1 ? '' : 'ด่าน ' + L.id + ' · ') + L.title, { size: 32, stroke: true }));
    c.add(KG.txt(this, 60, 604, L.desc, { size: 22, weight: 400, color: '#dbe4ff', width: 780 }));
    c.add(KG.txt(this, 60, 664, L.n + ' คำ · ' + LANG_NAME[this.lang] + ' · ' + (L.id === 1 ? 'ไม่จับเวลา (ด่านสอน)' : 'จับเวลาประมาณ ' + secs + ' วินาที หรือไม่จับเวลา') + (best ? '  ·  สถิติ ' + best.score + ' คะแนน ' + best.wpm + ' คำ/นาที' : ''), { size: 18, weight: 400, color: '#9fb0d8' }));
    for (let i = 0; i < 3; i++) c.add(KG.ui.icon(this, i < nd.stars ? 'star' : 'starO', 930 + i * 46, 588, 36, i < nd.stars ? 0xffd34f : 0x4a5aa8));
    const go = new KG.ui.Button(this, 1090, 650, 300, 84, { label: (L.id === 1 ? 'เริ่มบทสอน' : (nd.stars ? 'เล่นอีกครั้ง' : 'เริ่มด่านนี้')) + ' (Enter)', icon: 'play', style: 'primary', size: 26, onClick: () => this.startSel() });
    c.add(go); go.pulse(); c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 200 });
  }
}
