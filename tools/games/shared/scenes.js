/* ===== โครงฉากกลางของเกมธีมสว่าง: หน้าแรก · เลือกด่าน · สรุปผล · วิธีเล่น · นับถอยหลัง · พักเกม · ป้ายใหญ่ =====
   เกมเรียกใช้เพื่อไม่ต้องเขียนซ้ำ และทุกเกมจึงมีระบบครบเหมือนกัน: ใส่ชื่อ (ข้ามได้) · แนะนำเต็มจอ/เปิดแท็บใหม่ · บทสอน · สรุปคะแนน · ดาวสะสม */

const GW = KG.GW, GH = KG.GH;   // เกมที่ใช้ scenes.js ต้องไม่ประกาศ GW/GH ซ้ำ
const SKX = () => KG.SKIN;
const nodeText = () => (SKX().pop ? { name: '#1b2a6b', lock: '#7f90bd' } : { name: '#dbe4ff', lock: '#6f7fc9' });

/* ---------- หน้าแรก ---------- */
KG.makeTitle = function (cfg) {
  return class extends KG.Scene {
    constructor() { super('Title'); }
    create() {
      this.setup(); KG.audio.music(cfg.music || 'sunny');
      const bg = this.add.image(GW / 2, GH / 2, cfg.bg).setDisplaySize(GW * 1.08, GH * 1.08);
      this.tweens.add({ targets: bg, scaleX: bg.scaleX * 1.05, scaleY: bg.scaleY * 1.05, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      if (cfg.shade) this.add.image(GW / 2, GH / 2, KG.tex(this, 'titleshade' + cfg.bg, GW, GH, ctx => cfg.shade(ctx, GW, GH))).setDisplaySize(GW, GH);
      KG.fx.ambient(this, { freq: 220, colors: cfg.fxColors || [0xffffff, 0xffd34f, 0xff8a2b], s: 0.4, alpha: 0.8 });
      if (cfg.deco) cfg.deco(this);

      // ไรเดอร์ท่าประจำเกม (ไม่ถือดาบ) ถ้าเกมมีภาพ title_pose ไม่งั้นใช้ไรเดอร์แบบเดิม: ยืนหายใจ แตะแล้วฟันและเปลี่ยนร่าง
      const rx = cfg.riderX || 320, ry = cfg.riderY || 676;
      if (!KG.titlePose(this, rx, ry + 8, { h: cfg.poseH || 500, w: cfg.poseW || 430 })) {
        const rider = this.rider = new KG.Rider(this, rx, ry, { forms: cfg.forms, form: cfg.form || 0, bodyH: cfg.riderH || 430 });
        rider.img.setAlpha(0).x = rx - 200; this.tweens.add({ targets: rider.img, x: rx, alpha: 1, duration: 800, ease: 'Cubic.easeOut', delay: 150, onComplete: () => rider.setPos(rx, ry) });
        const hit = this.add.zone(rx, ry - 190, 300, 380).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          if (rider.busy) return; KG.fx.burst(this, rx, ry - 200, { colors: [rider.form.color, 0xffffff, 0xffd34f], n: 26, max: 380, depth: 40 });
          rider.attack(() => { rider.nextForm(true); }, 70);
        });
      }

      // โลโก้
      const logo = KG.ui.logo(this, cfg.logoX || 610, 20, cfg.logo, { size: cfg.logoSize || 104, w: 680 });
      logo.setAlpha(0).y -= 90;
      this.tweens.add({ targets: logo, y: logo.y + 90, alpha: 1, duration: 650, ease: 'Bounce.easeOut', delay: 350, onComplete: () => { KG.fx.flash(this, 0xffffff, 110); KG.audio.play('go'); KG.fx.shake(this, 140, 0.003); } });
      const ty = cfg.subY || 262;
      const sub = this.txt(cfg.logoX ? cfg.logoX + 12 : 622, ty, cfg.sub, { size: 34, color: cfg.subColor || '#ff6a1a', stroke: true, shadow: 0 });
      const tag = this.txt(cfg.logoX ? cfg.logoX + 12 : 622, ty + 46, cfg.tag, { size: 22, weight: 400, color: cfg.tagColor || '#1b2a6b', width: 580 });
      [sub, tag].forEach((t, i) => { t.setAlpha(0).x += 40; this.tweens.add({ targets: t, x: t.x - 40, alpha: 1, duration: 500, delay: 800 + i * 120, ease: 'Cubic.easeOut' }); });

      // ปุ่ม
      const got = cfg.stars ? cfg.stars() : { got: 0, max: 0 };
      const play = new KG.ui.Button(this, 900, 448, 400, 88, { label: got.got ? 'เล่นต่อ' : 'เริ่มเล่น', icon: 'play', style: 'primary', size: 36, onClick: () => (got.got ? this.go(cfg.selectScene || 'Select') : cfg.start(this)) });
      const sel = new KG.ui.Button(this, 900, 546, 400, 68, { label: cfg.selectLabel || 'เลือกด่าน', icon: 'flag', style: 'cyan', size: 28, onClick: () => this.go(cfg.selectScene || 'Select') });
      const how = new KG.ui.Button(this, 900, 624, 400, 60, { label: 'วิธีเล่น', icon: 'help', style: 'ghost', size: 26, onClick: () => KG.howTo(this, cfg.howTo) });
      [play, sel, how].forEach((b, i) => { b.setAlpha(0).x += 360; this.tweens.add({ targets: b, x: b.x - 360, alpha: 1, duration: 520, delay: 1000 + i * 110, ease: 'Back.easeOut' }); });
      this.time.delayedCall(1700, () => play.pulse());
      const sys = addSystemButtons(this, 1060, 52);
      sys.forEach((b, i) => { b.setAlpha(0); this.tweens.add({ targets: b, alpha: b.alpha || 1, duration: 400, delay: 1300 + i * 80 }); });

      this.time.delayedCall(1500, () => promptFullscreen(this, () => askPlayerOnce(this)));
      addPlayerChip(this, 246, 44).setDepth(5);
      const st = this.txt(36, 676, 'ดาวสะสม ' + got.got + ' / ' + got.max, { size: 22, color: SKX().pop ? '#ffffff' : '#ffd34f', stroke: true });
      this.txt(GW - 36, 686, 'KruKan.in.th · ' + (cfg.credit || ''), { size: 18, weight: 400, color: SKX().pop ? '#ffffff' : '#9fb0d8', ox: 1, stroke: SKX().pop });
      st.setAlpha(0); this.tweens.add({ targets: st, alpha: 1, delay: 1500, duration: 400 });
    }
    update(t, d) { }
  };
};

/* ---------- เลือกด่าน (10 ด่านเรียงเป็นทางงู) ---------- */
KG.makeSelect = function (cfg) {
  return class extends KG.Scene {
    constructor() { super('Select'); }
    init(data) { this.sel = data && data.level ? data.level : null; this._restartData = { level: this.sel }; }
    create() {
      this.setup(); KG.audio.music(cfg.music || 'breeze'); this.nodes = []; this.detail = null; this.ring = null; this.selNode = null;
      const LV = cfg.levels;
      if (!this.sel) this.sel = (LV.find(L => cfg.isOpen(L.id) && !cfg.starsOf(L.id)) || LV[0]).id;
      this.add.image(GW / 2, GH / 2, cfg.bg).setDisplaySize(GW * 1.1, GH * 1.1);
      if (cfg.shade) this.add.image(GW / 2, GH / 2, KG.tex(this, 'selshade' + cfg.bg, GW, GH, ctx => cfg.shade(ctx, GW, GH))).setDisplaySize(GW, GH);
      KG.fx.ambient(this, { freq: 260, colors: cfg.fxColors || [0xffffff, 0xffd34f], s: 0.35, alpha: 0.7 });
      iconButton(this, 56, 40, 'home', () => this.go(cfg.back || 'Title'), { w: 60, h: 52 });
      this.txt(100, 6, cfg.kicker || '', { size: 18, color: SKX().hi });
      this.txt(100, 26, cfg.title || 'เลือกด่าน', { size: 32, stroke: true });
      const tot = cfg.stars();
      this.txt(GW - 330, 24, 'ดาวสะสม ' + tot.got + '/' + tot.max, { size: 24, color: SKX().pop ? '#ffffff' : '#ffd34f', stroke: true, ox: 1 });
      KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
      addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
      iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
      iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, cfg.howTo), { w: 56, h: 52 });
      if (cfg.toolbar) cfg.toolbar(this);
      const top = cfg.boardTop || 100;
      KG.ui.panel(this, 24, top + 68, 1232, 360, { accent: '#6f8cff', cuts: [24, 0, 24, 0] });
      KG.ui.panel(this, 24, top + 440, 1232, 164, { accent: '#ff8a2b', cuts: [0, 24, 0, 24] });
      this.boardTop = top + 68; this.board = this.add.container(0, 0);
      this.buildBoard(); this.pick(this.nodes.find(n => n.L.id === this.sel && n.open) || this.nodes.find(n => n.open && !cfg.starsOf(n.L.id)) || this.nodes[0], true);
    }
    onEscape() { this.go(cfg.back || 'Title'); }
    refreshDetail() { if (this.selNode) this.renderDetail(this.selNode); }
    pos(i) { const row = Math.floor(i / 5), col = i % 5, x = 190 + (row ? 4 - col : col) * 225; return { x, y: this.boardTop + 102 + row * 170 }; }
    buildBoard() {
      const LV = cfg.levels, path = this.add.graphics(); this.board.add(path);
      for (let i = 0; i < LV.length - 1; i++) {
        const a = this.pos(i), b = this.pos(i + 1), lit = cfg.starsOf(LV[i].id) > 0;
        path.lineStyle(10, lit ? 0xffb800 : (SKX().pop ? 0xb8c7e8 : 0x25306a), lit ? 0.95 : 0.9); path.beginPath(); path.moveTo(a.x, a.y); path.lineTo(b.x, b.y); path.strokePath();
        if (lit) { path.lineStyle(3, 0xffffff, 0.9); path.beginPath(); path.moveTo(a.x, a.y); path.lineTo(b.x, b.y); path.strokePath(); }
      }
      LV.forEach((L, i) => this.makeNode(L, this.pos(i), i));
    }
    makeNode(L, p, k) {
      const open = cfg.isOpen(L.id), stars = cfg.starsOf(L.id), r = 52, T = nodeText();
      const c = this.add.container(p.x, p.y); this.board.add(c);
      const hex = this.add.image(0, 0, hexTex(this, r, '#ffd34f', '#d98a00', open ? 'open' : 'locked')); c.add(hex);
      if (open) { const glow = this.add.image(0, 0, 'fx_glow').setTint(0xffd34f).setBlendMode(SKX().add ? 'ADD' : 'NORMAL').setDisplaySize(r * 3.4, r * 3.4).setAlpha(SKX().add ? (stars ? 0.25 : 0.5) : 0.35); c.addAt(glow, 0); this.tweens.add({ targets: glow, alpha: SKX().add ? (stars ? 0.45 : 0.85) : 0.6, duration: 1100, yoyo: true, repeat: -1 }); }
      if (!open) c.add(KG.ui.icon(this, 'lock', 0, 0, 34, 0x6f7fc9));
      else if (L.icon) c.add(KG.ui.icon(this, L.icon, 0, -2, 40, 0x10122b));
      else c.add(KG.txt(this, 0, -4, String(L.id), { size: 42, color: '#10122b', center: true, middle: true }));
      c.add(KG.txt(this, 0, r + 4, L.tag || ('ด่าน ' + L.id), { size: 19, color: open ? T.name : T.lock, center: true, ox: 0.5, stroke: !SKX().pop }));
      if (open) for (let i = 0; i < 3; i++) c.add(KG.ui.icon(this, i < stars ? 'star' : 'starO', (i - 1) * 22, r + 38, 20, i < stars ? 0xffb800 : SKX().starOff));
      const zone = this.add.zone(0, 0, r * 2, r * 1.9).setInteractive({ useHandCursor: true }); c.add(zone);
      const nd = { c, L, open, stars, r };
      zone.on('pointerover', () => { if (open) { this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120 }); KG.audio.play('hover'); } });
      zone.on('pointerout', () => this.tweens.add({ targets: c, scaleX: this.selNode === nd ? 1.12 : 1, scaleY: this.selNode === nd ? 1.12 : 1, duration: 120 }));
      zone.on('pointerup', () => this.pick(nd));
      c.setScale(0).setAlpha(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 320, delay: 80 + k * 60, ease: 'Back.easeOut' });
      this.nodes.push(nd);
    }
    pick(nd, silent) {
      if (!nd) return;
      if (!nd.open) { KG.audio.play('error'); KG.ui.toast(this, 'ผ่านด่านก่อนหน้าให้ได้อย่างน้อย 1 ดาว จึงจะเปิดด่านนี้'); this.tweens.add({ targets: nd.c, x: nd.c.x + 6, duration: 50, yoyo: true, repeat: 3 }); return; }
      this.selNode = nd; this.sel = nd.L.id; if (!silent) KG.audio.play('tap');
      this.nodes.forEach(o => this.tweens.add({ targets: o.c, scaleX: o === nd ? 1.12 : 1, scaleY: o === nd ? 1.12 : 1, duration: 140 }));
      if (this.ring) this.ring.destroy(); this.ring = KG.ui.icon(this, 'chevD', nd.c.x, nd.c.y - nd.r - 34, 34, 0xff7a1a); this.board.add(this.ring);
      this.tweens.add({ targets: this.ring, y: this.ring.y + 10, duration: 420, yoyo: true, repeat: -1 });
      this.renderDetail(nd);
    }
    renderDetail(nd) {
      if (this.detail) this.detail.destroy(true);
      const L = nd.L, c = this.detail = this.add.container(0, 0), y0 = this.boardTop + 372, D = cfg.detail(L, nd);
      c.add(KG.txt(this, 60, y0 + 12, D.title, { size: 32 }));
      c.add(KG.txt(this, 60, y0 + 60, D.desc, { size: 22, weight: 400, color: SKX().body, width: 780 }));
      c.add(KG.txt(this, 60, y0 + 122, D.meta || '', { size: 18, weight: 400, color: SKX().mute }));
      for (let i = 0; i < 3; i++) c.add(KG.ui.icon(this, i < nd.stars ? 'star' : 'starO', 930 + i * 46, y0 + 44, 36, i < nd.stars ? 0xffb800 : SKX().starOff));
      const go = new KG.ui.Button(this, 1090, y0 + 106, 300, 84, { label: D.button || (nd.stars ? 'เล่นอีกครั้ง' : 'เริ่มด่านนี้'), icon: 'play', style: 'primary', size: 30, onClick: () => cfg.play(this, L) });
      c.add(go); go.pulse(); c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 200 });
    }
  };
};

/* ---------- หน้าต่างสรุปผล (ดาว + แถวตัวเลข + คำแนะนำ + ปุ่ม + อันดับ) ---------- */
// o: { win, title, body, stars, rows: [[ชื่อ, ค่า]], tip, buttons, stat }
// ถ้าเกมส่ง o.stat ({ lvl, stars, score, m, h, secs, practice }) และเปิดระบบสถิติไว้ (KG.stats.on) จะบันทึกผลลงชีตกลาง
// และถ้าชนะ (o.win) จะแสดงกล่อง 'อันดับ' ทางขวา (ดาวสะสมรวมของทุกด่านในเกมนี้ จัดอันดับระหว่างผู้เล่นที่ครูไม่ได้ซ่อน)
KG.results = function (scene, o) {
  const rows = o.rows || [], useStat = !!(o.stat && KG.stats && KG.stats.on), showRank = useStat && !!o.win && !(o.stat && o.stat.practice);
  const rec = useStat ? KG.stats.record(o.stat) : null;
  const extraH = Math.max(110 + rows.length * 38 + (o.tip ? 64 : 0), showRank ? 330 : 0);
  return KG.ui.modal(scene, {
    title: o.title, w: showRank ? 1080 : (o.w || 860), accent: o.win ? 0xffb800 : KG.C.red, accent2: o.win ? 0xff7a1a : 0xff9aa3, extraH, body: withPlayer(o.body || ''), buttons: o.buttons,
    build: (box, g) => {
      const cx = showRank ? -265 : 0, lx = showRank ? -490 : -300, rx = showRank ? -40 : 300, tipW = showRank ? 450 : 760;
      const st = KG.ui.stars(scene, cx, g.top + 48, 0, 3, 60); box.add(st); scene.time.delayedCall(350, () => st.setStars(o.stars || 0, true));
      rows.forEach((r, i) => { box.add(KG.txt(scene, lx, g.top + 104 + i * 38, r[0], { size: 22, color: SKX().mute })); box.add(KG.txt(scene, rx, g.top + 104 + i * 38, String(r[1]), { size: 24, color: SKX().text, ox: 1 })); });
      if (o.tip) box.add(KG.txt(scene, cx, g.top + 112 + rows.length * 38, o.tip, { size: 20, weight: 400, color: SKX().pop ? '#1a8f6a' : '#4ef4d2', center: true, ox: 0.5, width: tipW }));
      if (showRank) KG.rankPanel(scene, box, 40, g.top + 2, 460, 306, rec);
    }
  });
};

/* กล่องอันดับในหน้าสรุปผล: แสดง 'กำลังโหลด' ก่อน แล้วเติมรายการเมื่อได้คำตอบจากชีตกลาง (ไม่ได้ก็บอกสั้น ๆ ว่าเก็บผลไว้ส่งทีหลัง) */
KG.rankPanel = function (scene, box, x, y, w, h, promise) {
  const pop = SKX().pop, g = scene.add.graphics(); g.fillStyle(pop ? 0xffffff : 0x0b1240, pop ? 0.55 : 0.92); g.fillRoundedRect(x, y, w, h, 12); g.lineStyle(3, pop ? 0x2b3f9c : 0x4ef4d2, pop ? 0.55 : 0.8); g.strokeRoundedRect(x, y, w, h, 12); box.add(g);   // ธีมมืด (Techno Math) ใช้กล่องกรมท่าขอบฟ้า
  box.add(KG.txt(scene, x + 18, y + 8, 'อันดับดาวสะสม', { size: 26, color: SKX().text }));
  box.add(KG.txt(scene, x + 18, y + 40, 'รวมดาวดีที่สุดของทุกด่านในเกมนี้', { size: 15, weight: 400, color: SKX().mute }));
  const dyn = scene.add.container(0, 0); box.add(dyn);
  const say = (t) => { dyn.removeAll(true); dyn.add(KG.txt(scene, x + w / 2, y + h / 2 + 10, t, { size: 19, weight: 400, color: SKX().mute, center: true, ox: 0.5, oy: 0.5, width: w - 50 })); };
  say('กำลังโหลดอันดับ...');
  const MEDAL = [0xffb800, 0xb8c2d6, 0xd98b4a];
  const fit = (s, px) => { let t = s; while (t.length > 2 && KG.measure(t, '600 21px Kanit') > px) t = t.slice(0, -1); return t === s ? s : t + '…'; };
  promise.then(res => {
    if (!box.scene || !box.active) return;
    if (!res || !res.rank) { say('ยังโหลดอันดับไม่ได้ ตอนนี้เก็บผลไว้ในเครื่องก่อน แล้วจะส่งให้ในรอบหน้า'); return; }
    const R = res.rank; dyn.removeAll(true); const row = (it, i, mine) => {
      const ry = y + 70 + i * 38; if (mine) { const hl = scene.add.graphics(); hl.fillStyle(pop ? 0xfff0c2 : 0x2a3a8a, 1); hl.fillRoundedRect(x + 10, ry - 2, w - 20, 36, 8); hl.lineStyle(2, 0xff9a1a, 1); hl.strokeRoundedRect(x + 10, ry - 2, w - 20, 36, 8); dyn.add(hl); }
      const badge = scene.add.circle(x + 36, ry + 16, 15, it.r <= 3 ? MEDAL[it.r - 1] : 0xdfe8f7).setStrokeStyle(2, 0x2b3f9c); dyn.add(badge);
      dyn.add(KG.txt(scene, x + 36, ry + 16, String(it.r), { size: 18, color: it.r <= 3 ? '#ffffff' : '#1b2a6b', center: true, middle: true }));
      dyn.add(KG.txt(scene, x + 62, ry + 16, fit(it.name, 250) + (mine ? ' (ฉัน)' : ''), { size: 21, color: SKX().text, oy: 0.5 }));
      dyn.add(KG.ui.icon(scene, 'star', x + w - 78, ry + 16, 22, 0xffb800)); dyn.add(KG.txt(scene, x + w - 20, ry + 16, String(it.stars), { size: 22, color: SKX().text, ox: 1, oy: 0.5 }));
    };
    const outside = !!(R.me && !R.top.some(t => t.me)), tops = outside ? R.top.slice(0, 4) : R.top;   // ถ้าตัวเองอยู่นอกห้าอันดับแรก แสดงสี่อันดับแรกแล้วต่อด้วยแถวของตัวเอง
    tops.forEach((it, i) => row(it, i, it.me));
    let n = tops.length; if (outside) { dyn.add(KG.txt(scene, x + w / 2, y + 70 + n * 38 + 2, '. . .', { size: 20, color: SKX().mute, center: true, ox: 0.5 })); row({ r: R.me.r, name: R.me.name, stars: R.me.stars }, n + 0.45, true); n += 1; }
    dyn.add(KG.txt(scene, x + w / 2, y + h - 22, R.me ? 'อันดับของฉัน ' + R.me.r + ' จากผู้เล่น ' + R.total + ' คน' : 'ได้ดาวแล้วชื่อจะขึ้นในอันดับ (ผู้เล่นทั้งหมด ' + R.total + ' คน)', { size: 16, weight: 400, color: SKX().mute, center: true, ox: 0.5, oy: 0.5 }));
  });
};

/* ---------- วิธีเล่น: o = { title, body, tutor: ฟังก์ชันเปิดบทสอน } ---------- */
KG.howTo = function (scene, o) {
  const btns = [];
  if (o.tutor) btns.push({ label: 'เล่นบทสอน', style: 'cyan', icon: 'play', onClick: () => o.tutor(scene) });
  btns.push({ label: 'เข้าใจแล้ว', style: 'primary', icon: 'check', pulse: true });
  return KG.ui.modal(scene, { title: o.title || 'วิธีเล่น', w: 940, accent: KG.C.cyan, body: o.body, buttons: btns });
};

/* ---------- นับถอยหลัง 3 2 1 · ป้ายใหญ่กลางจอ ---------- */
KG.banner = function (scene, str, color, k, y) {
  const t = KG.txt(scene, GW / 2, y || 300, str, { size: 58 * (k || 1), color: color || '#ffffff', center: true, middle: true, stroke: true, sw: 9 }).setDepth(200).setScale(0.4).setAlpha(0);
  scene.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: t, alpha: 0, y: (y || 300) - 34, delay: 560, duration: 320, onComplete: () => t.destroy() });
  return t;
};
KG.countdown = function (scene, goLabel, done) {
  let n = 3;
  const show = () => {
    const lab = n > 0 ? String(n) : goLabel;
    const t = KG.txt(scene, GW / 2, 330, lab, { size: n > 0 ? 160 : 110, color: '#ffffff', center: true, middle: true, stroke: true, sw: 14 }).setDepth(200).setScale(1.8).setAlpha(0);
    scene.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' }); scene.tweens.add({ targets: t, alpha: 0, delay: 560, duration: 200, onComplete: () => t.destroy() });
    KG.audio.play(n > 0 ? 'count' : 'go'); KG.fx.ring(scene, GW / 2, 330, n > 0 ? 0xffb800 : 0x22b45a, { size: 5, w: 0.6, depth: 190 });
    if (n === 0) { done(); return; }
    n--; scene.time.delayedCall(800, show);
  };
  show();
};

/* ---------- พักเกม: o = { onResume, onRestart, onExit } ---------- */
KG.pauseMenu = function (scene, o) {
  return KG.ui.modal(scene, { title: 'พักเกม', w: 560, accent: KG.C.cyan, buttons: [
    { label: 'ออก', style: 'danger', icon: 'home', onClick: o.onExit },
    { label: 'เริ่มใหม่', style: 'cyan', icon: 'reset', onClick: o.onRestart },
    { label: 'เล่นต่อ', style: 'primary', icon: 'play', onClick: o.onResume }] });
};
