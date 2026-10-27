/* ===== เลือกด่าน: แท็บ SECTOR + เส้นทางโหนดหกเหลี่ยม (ภารกิจ และสนามวิ่งปลายทาง) ===== */
class SelectScene extends KG.Scene {
  constructor() { super('Select'); }
  init(data) { this.wid = data && data.world ? data.world : (LEVELS[nextMission()].world); this._restartData = { world: this.wid }; }
  create() {
    this.setup(); KG.audio.music('menu');
    this.sel = null; this.nodes = [];
    this.bg = this.add.image(GW / 2, GH / 2, 'arena_thunder').setDisplaySize(GW * 1.1, GH * 1.1);
    this.shade = this.add.image(GW / 2, GH / 2, KG.tex(this, 'selshade', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.86)'], [1, 'rgba(5,8,28,.94)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);
    KG.fx.ambient(this, { freq: 220, alpha: 0.35 });

    // หัวเรื่อง
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 });
    this.txt(100, 6, 'MISSION SELECT', { size: 18, color: '#4ef4d2' }); this.txt(100, 26, 'เลือกด่าน', { size: 32, stroke: true });
    this.txt(GW - 330, 24, 'ดาวสะสม ' + totalStars() + '/' + maxStars(), { size: 24, color: '#ffd34f', stroke: true, ox: 1 });
    KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffd34f);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => showHowTo(this), { w: 60, h: 52 });

    // แท็บ SECTOR
    this.tabs = [];
    WORLDS.forEach((w, i) => {
      const x = 24 + 148 + i * 304;
      const b = new KG.ui.Button(this, x, 108, 292, 56, { label: w.name + ' · ' + w.title, style: 'ghost', size: 21, slant: 10, onClick: () => { if (this.wid !== w.id) { this.wid = w.id; this._restartData = { world: w.id }; this.showWorld(true); KG.audio.play('tap'); } } });
      this.tabs.push(b);
    });
    this.tabMarks = this.add.graphics();
    this.panelMain = KG.ui.panel(this, 24, 150, 1232, 378, { accent: '#6f8cff', cuts: [24, 0, 24, 0] });
    this.panelDetail = KG.ui.panel(this, 24, 540, 1232, 164, { accent: '#4ef4d2', cuts: [0, 24, 0, 24] });
    this.world = this.add.container(0, 0);
    this.showWorld(false);
  }
  onEscape() { this.go('Title'); }

  showWorld(anim) {
    const w = WORLDS[this.wid - 1];
    this.bg.setTexture('arena_' + w.arena); this.cameras.main.flash(120, 10, 14, 40);
    this.tabs.forEach((b, i) => { b.setActive(WORLDS[i].id === this.wid); b.label.setColor(WORLDS[i].id === this.wid ? WORLDS[i].tint : '#f4f7ff'); });
    this.tabMarks.clear(); const tx = 24 + 148 + (this.wid - 1) * 304; this.tabMarks.fillStyle(w.color, 1); this.tabMarks.fillTriangle(tx - 14, 150, tx + 14, 150, tx, 138);
    this.world.removeAll(true); this.nodes = [];
    const ids = worldLevels(this.wid);
    // แผงข้อมูล SECTOR (ซ้าย)
    const info = this.add.container(0, 0); this.world.add(info);
    info.add(KG.txt(this, 56, 166, w.name, { size: 20, color: w.tint, oy: 0 }));
    info.add(KG.txt(this, 56, 190, w.title, { size: 48, stroke: true }));
    info.add(KG.txt(this, 56, 256, w.desc, { size: 21, weight: 400, color: '#cdd7f2', width: 330 }));
    info.add(KG.ui.panel(this, 56, 384, 330, 128, { cuts: [10, 10, 10, 10], accent: css(w.color), fill: ['#13206a', '#0a1236'], glow: false, bracket: false }));
    info.add(KG.txt(this, 72, 392, 'หลักการ', { size: 17, color: w.tint }));
    info.add(KG.txt(this, 72, 414, w.rule, { size: 21, weight: 600, color: '#ffffff', width: 300 }));
    const got = worldStars(this.wid), max = (ids.length + 1) * 3;
    info.add(KG.txt(this, 56, 508, 'ดาวใน SECTOR นี้', { size: 15, color: '#9fb0d8' }).setVisible(false));
    // เส้นทางโหนด
    const n = ids.length + 1, x0 = 560, x1 = 1190, dx = (x1 - x0) / (n - 1), ys = [292, 376, 292, 376, 292, 376];
    const pts = []; for (let i = 0; i < n; i++) pts.push({ x: x0 + dx * i, y: i === n - 1 ? 336 : ys[i % 2] });
    const path = this.add.graphics(); this.world.add(path);
    for (let i = 0; i < n - 1; i++) {
      const lit = i < ids.length ? missionStars(ids[i]) > 0 : false;
      path.lineStyle(10, lit ? w.color : 0x25306a, lit ? 0.9 : 0.8); path.beginPath(); path.moveTo(pts[i].x, pts[i].y); path.lineTo(pts[i + 1].x, pts[i + 1].y); path.strokePath();
      if (lit) { path.lineStyle(3, 0xffffff, 0.8); path.beginPath(); path.moveTo(pts[i].x, pts[i].y); path.lineTo(pts[i + 1].x, pts[i + 1].y); path.strokePath(); }
    }
    ids.forEach((li, k) => this.makeNode(pts[k].x, pts[k].y, { kind: 'mission', li, n: k + 1, open: missionOpen(li), stars: missionStars(li), w }, anim, k));
    this.makeNode(pts[n - 1].x, pts[n - 1].y, { kind: 'arcade', open: arcadeOpen(this.wid), stars: arcadeStars(this.wid), w }, anim, n - 1);
    // เลือกโหนดแรกที่ยังไม่ผ่านโดยอัตโนมัติ
    const firstOpen = this.nodes.find(nd => nd.d.open && !nd.d.stars) || this.nodes.filter(nd => nd.d.open).pop();
    if (firstOpen) this.pick(firstOpen, true); else this.lockedInfo();
  }
  makeNode(x, y, d, anim, k) {
    const w = d.w, big = d.kind === 'arcade', r = big ? 62 : 48;
    const c = this.add.container(x, y); this.world.add(c);
    const hex = this.add.image(0, 0, hexTex(this, r, css(w.color), css(Phaser.Display.Color.ValueToColor(w.color).darken(38).color), d.open ? 'open' : 'locked'));
    c.add(hex);
    if (d.open) { const glow = this.add.image(0, 0, 'fx_glow').setTint(w.color).setBlendMode('ADD').setDisplaySize(r * 3.4, r * 3.4).setAlpha(d.stars ? 0.25 : 0.5); c.addAt(glow, 0); this.tweens.add({ targets: glow, alpha: d.stars ? 0.45 : 0.85, duration: 1100, yoyo: true, repeat: -1 }); }
    if (!d.open) c.add(KG.ui.icon(this, 'lock', 0, 0, 34, 0x6f7fc9));
    else if (big) c.add(KG.ui.icon(this, 'bolt', 0, -8, 48, 0x10122b));
    else c.add(KG.txt(this, 0, -6, String(d.n), { size: 40, color: '#10122b', center: true, middle: true }));
    if (big) c.add(KG.txt(this, 0, r + 4, 'สนามไล่ล่า', { size: 22, color: d.open ? '#ffffff' : '#6f7fc9', center: true, ox: 0.5, stroke: true }));
    else c.add(KG.txt(this, 0, r - 2, LEVELS[d.li].title, { size: 17, color: d.open ? '#dbe4ff' : '#6f7fc9', center: true, ox: 0.5, stroke: true }));
    if (d.open) for (let i = 0; i < 3; i++) c.add(KG.ui.icon(this, i < d.stars ? 'star' : 'starO', (i - 1) * 24, r + (big ? 40 : 38), 22, i < d.stars ? 0xffd34f : 0x4a5aa8));
    const zone = this.add.zone(0, 0, r * 2, r * 1.9).setInteractive({ useHandCursor: true }); c.add(zone);
    const nd = { c, d, r, hex };
    zone.on('pointerover', () => { if (d.open) { this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120 }); KG.audio.play('hover'); } });
    zone.on('pointerout', () => this.tweens.add({ targets: c, scaleX: this.sel === nd ? 1.12 : 1, scaleY: this.sel === nd ? 1.12 : 1, duration: 120 }));
    zone.on('pointerup', () => this.pick(nd));
    if (anim) { c.setScale(0).setAlpha(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 360, delay: 120 + k * 90, ease: 'Back.easeOut' }); }
    this.nodes.push(nd);
  }
  pick(nd, silent) {
    if (!nd) return;
    if (!nd.d.open) { KG.audio.play('error'); KG.ui.toast(this, nd.d.kind === 'arcade' ? 'ผ่านภารกิจทุกด่านใน SECTOR นี้ก่อน จึงจะเปิดสนามไล่ล่า' : 'ผ่านด่านก่อนหน้าก่อนจึงจะเปิดด่านนี้'); this.tweens.add({ targets: nd.c, x: nd.c.x + 6, duration: 50, yoyo: true, repeat: 3 }); return; }
    this.sel = nd; if (!silent) KG.audio.play('tap');
    this.nodes.forEach(o => this.tweens.add({ targets: o.c, scaleX: o === nd ? 1.12 : 1, scaleY: o === nd ? 1.12 : 1, duration: 140 }));
    if (this.ring) this.ring.destroy(); this.ring = KG.ui.icon(this, 'chevD', nd.c.x, nd.c.y - nd.r - 36, 36, 0xffd34f); this.world.add(this.ring);
    this.tweens.add({ targets: this.ring, y: this.ring.y + 10, duration: 420, yoyo: true, repeat: -1 });
    this.renderDetail(nd);
  }
  lockedInfo() {
    if (this.detail) this.detail.destroy(true); if (this.ring) { this.ring.destroy(); this.ring = null; }
    const c = this.detail = this.add.container(0, 0);
    c.add(KG.ui.icon(this, 'lock', 90, 622, 56, 0x6f7fc9));
    c.add(KG.txt(this, 140, 570, 'SECTOR นี้ยังล็อกอยู่', { size: 32, stroke: true }));
    c.add(KG.txt(this, 140, 620, 'ผ่านภารกิจทุกด่านและสนามใน SECTOR ก่อนหน้าให้ครบ แล้วจะเปิดที่นี่โดยอัตโนมัติ', { size: 22, weight: 400, color: '#dbe4ff', width: 900 }));
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 200 });
  }
  renderDetail(nd) {
    if (this.detail) this.detail.destroy(true);
    const d = nd.d, w = d.w, c = this.detail = this.add.container(0, 0);
    let title, story, extra;
    if (d.kind === 'mission') { const L = LEVELS[d.li]; title = 'ภารกิจ ' + (d.li + 1) + ' · ' + L.title; story = L.story; extra = 'ใช้การ์ดได้ไม่เกิน ' + L.maxBlocks + ' ใบ · 3 ดาวถ้าใช้ไม่เกิน ' + L.par + ' ใบ'; }
    else { title = 'สนามไล่ล่า · ' + w.name; story = 'ควบคุม Techno เองแบบเรียลไทม์ ' + w.arcadeRule + ' ฝ่าด่านให้ถึงบอส'; extra = 'ปุ่มกระโดด/โจมตี หรือแตะหน้าจอ · มีหัวใจ 3 ดวง'; }
    c.add(KG.txt(this, 60, 556, title, { size: 32, stroke: true }));
    c.add(KG.txt(this, 60, 604, story, { size: 22, weight: 400, color: '#dbe4ff', width: 760 }));
    c.add(KG.txt(this, 60, 668, extra, { size: 18, weight: 400, color: '#9fb0d8' }));
    for (let i = 0; i < 3; i++) c.add(KG.ui.icon(this, i < d.stars ? 'star' : 'starO', 930 + i * 46, 588, 36, i < d.stars ? 0xffd34f : 0x4a5aa8));
    const go = new KG.ui.Button(this, 1090, 650, 300, 84, { label: d.kind === 'arcade' ? 'ลงสนามไล่ล่า' : (d.stars ? 'เล่นอีกครั้ง' : 'เริ่มภารกิจ'), icon: d.kind === 'arcade' ? 'bolt' : 'play', style: 'primary', size: 32, onClick: () => this.go(d.kind === 'arcade' ? 'Arcade' : 'Mission', d.kind === 'arcade' ? { world: this.wid } : { i: d.li }) });
    c.add(go); go.pulse();
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 200 });
  }
}
