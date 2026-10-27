/* ===== เลือกภารกิจ: แท็บ 8 โลก (ซ้าย) · รายการหัวข้อของโลก แต่ละหัวข้อมี 5 ระดับ (ขวา) · แถบรายละเอียดและปุ่มเล่น (ล่าง) =====
   คีย์ลัด: ← → เปลี่ยนโลก · ↑ ↓ เลือกหัวข้อ · 1–5 เล่นระดับนั้น · Enter เล่นระดับที่แนะนำ · G เลือกชั้น · K คีย์ลัด · Esc หน้าแรก */
class MapScene extends KG.Scene {
  constructor() { super('Map'); }
  init(d) {
    d = d || {}; const t = d.topic && MG.TOP[d.topic]; if (t) { SAVE.data.topic = t.id; SAVE.data.world = t.world; SAVE.save(); }
    this._modal = null; this.tabs = []; this.rows = []; this.list = null; this.detail = null; this.bg = null; this.hoverL = 0; this._restartData = {};
  }
  create() {
    this.setup('#060a1e'); KG.audio.music('menu');
    this.wid = worldOf(SAVE.data.world).id; const tl = worldTopics(this.wid); this.ti = Math.max(0, tl.findIndex(t => t.id === SAVE.data.topic));
    this.bg = this.add.image(GW / 2, GH / 2, 'arena_' + worldOf(this.wid).arena).setDisplaySize(GW * 1.1, GH * 1.1).setAlpha(0.6);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x050818, 0.68);
    this.grid = this.add.graphics(); this.drawGrid();
    KG.fx.ambient(this, { freq: 260, colors: [0x4ef4d2, 0xffffff, 0xffd34f], s: 0.3, alpha: 0.5 });
    // HUD
    const g = this.add.graphics().setDepth(1); g.fillStyle(0x050818, 0.9); g.fillRect(0, 0, GW, 72); this.hudLine = this.add.rectangle(GW / 2, 71, GW, 3, 0x4ef4d2).setDepth(1);
    iconButton(this, 44, 36, 'home', () => this.go('Title'), { w: 56, h: 50, depth: 5 });
    this.txt(86, 4, 'TECHNO MATH · สมรภูมิคณิต', { size: 15, color: '#4ef4d2' }).setDepth(5);
    this.txt(86, 22, 'เลือกภารกิจ', { size: 30, stroke: true }).setDepth(5);
    const tot = this.txt(330, 36, '', { size: 22, color: '#ffd34f', oy: 0.5 }).setDepth(5); KG.ui.icon(this, 'star', 316, 36, 24, 0xffb800).setDepth(5); tot.setText(totalStars() + ' / ' + maxStars());
    this.chips = []; ['ทุกชั้น', 'ป.1', 'ป.2', 'ป.3', 'ป.4'].forEach((s, i) => { const b = new KG.ui.Button(this, 560 + i * 92, 36, 86, 44, { label: s, style: 'ghost', size: 18, slant: 6, onClick: () => this.setGrade(i) }).setDepth(5); this.chips.push(b); });
    this.txt(510, 36, 'G', { size: 14, color: '#050818', ox: 1, oy: 0.5 }).setDepth(5).setBackgroundColor('#ffd34f').setPadding(5, 0, 5, 0);
    iconButton(this, 1028, 36, 'key', () => this.keys(), { w: 56, h: 50, depth: 5 });
    addSystemButtons(this, 1094, 36, 62, ['sfx', 'music', 'fs']).forEach(b => b.setDepth(5).setScale(0.86));
    this.buildTabs(); this.buildList(true); this.setGrade(SAVE.data.grade || 0, true);
    this.input.keyboard.on('keydown', e => this.onKey(e));
  }
  drawGrid() { const g = this.grid, c = hexInt(worldOf(this.wid).color); g.clear(); g.lineStyle(1, c, 0.1); for (let x = 0; x < GW; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, GH); g.strokePath(); } for (let y = 0; y < GH; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(GW, y); g.strokePath(); } }
  setGrade(i, silent) {
    SAVE.data.grade = i; SAVE.save(); this.chips.forEach((b, k) => b.setActive(k === i));
    if (!silent) { KG.audio.play('tap'); this.buildList(); }
  }
  /* ---------- แท็บโลก ---------- */
  buildTabs() {
    MW.forEach((w, i) => {
      const x = 20, y = 86 + i * 78, c = this.add.container(x, y).setDepth(4), col = hexInt(w.color);
      const g = this.add.graphics(); c.add(g);
      const icon = this.add.text(42, 36, w.icon, { fontFamily: MFONT, fontSize: w.icon.length > 2 ? '22px' : '30px', fontStyle: '600', color: '#ffffff', resolution: KG.K }).setOrigin(0.5); c.add(icon);
      c.add(KG.txt(this, 84, 8, w.th, { size: 22 })); c.add(KG.txt(this, 84, 40, w.en, { size: 12, color: w.color }));
      const st = KG.txt(this, 270, 44, worldStars(w.id) + '/' + worldTopics(w.id).length * 15, { size: 13, color: '#ffd34f', ox: 1 }); c.add(st);
      const z = this.add.zone(140, 36, 280, 72).setInteractive({ useHandCursor: true }); c.add(z);
      z.on('pointerup', () => this.setWorld(w.id)); z.on('pointerover', () => { if (w.id !== this.wid) { g.setAlpha(0.8); KG.audio.play('hover'); } }); z.on('pointerout', () => g.setAlpha(1));
      const tab = { w, c, g, col, draw: on => { g.clear(); g.fillStyle(on ? 0x16245e : 0x0a1030, on ? 0.98 : 0.86); g.fillPoints([{ x: 14, y: 0 }, { x: 280, y: 0 }, { x: 280, y: 58 }, { x: 266, y: 72 }, { x: 0, y: 72 }, { x: 0, y: 14 }], true); g.lineStyle(on ? 3 : 1.5, on ? col : 0x2f3d84, 1); g.strokePoints([{ x: 14, y: 0 }, { x: 280, y: 0 }, { x: 280, y: 58 }, { x: 266, y: 72 }, { x: 0, y: 72 }, { x: 0, y: 14 }], true); g.fillStyle(col, 1); g.fillRoundedRect(14, 12, 56, 48, 10); if (on) { g.fillStyle(col, 1); g.fillRect(278, 8, 6, 56); } } };
      tab.draw(w.id === this.wid); this.tabs.push(tab);
      c.setAlpha(0).x -= 40; this.tweens.add({ targets: c, x, alpha: 1, duration: 300, delay: i * 40, ease: 'Cubic.easeOut' });
    });
  }
  setWorld(id, keepTopic) {
    if (id === this.wid) return; this.wid = id; SAVE.data.world = id; SAVE.save(); KG.audio.play('whoosh');
    this.tabs.forEach(t => t.draw(t.w.id === id)); this.bg.setTexture('arena_' + worldOf(id).arena); this.bg.setDisplaySize(GW * 1.1, GH * 1.1); this.drawGrid(); this.hudLine.setFillStyle(hexInt(worldOf(id).color));
    this.ti = keepTopic ? this.ti : 0; this.buildList(true);
  }
  /* ---------- รายการหัวข้อ ---------- */
  buildList(anim) {
    if (this.list) this.list.destroy(true); this.rows = [];
    const list = this.list = this.add.container(0, 0).setDepth(4), W = worldOf(this.wid), tl = worldTopics(this.wid), G = SAVE.data.grade || 0, col = hexInt(W.color);
    this.ti = Math.min(this.ti, tl.length - 1);
    tl.forEach((t, i) => {
      const y = 86 + i * 78, x = 316, w = 944, h = 70, c = this.add.container(x, y); list.add(c);
      const dim = G && t.grade > G, g = this.add.graphics(); c.add(g);
      c.add(this.add.text(36, 35, String(i + 1), { fontFamily: MFONT, fontSize: '26px', fontStyle: '600', color: '#ffffff', resolution: KG.K }).setOrigin(0.5));
      c.add(KG.txt(this, 70, 6, t.th, { size: 24 })); c.add(KG.txt(this, 70, 40, t.en + (t.speed ? ' · 60 วินาที · สถิติดีสุด ' + Math.max(0, ...[1, 2, 3, 4, 5].map(L => SAVE.data.best[skey(t.id, L)] || 0)) + ' ข้อ' : ''), { size: 13, color: t.speed ? '#ffd34f' : '#9fb0d8' }));
      const gb = this.add.graphics(); gb.fillStyle(dim ? 0x3a4370 : 0x4ef4d2, 1); gb.fillRoundedRect(350, 22, 62, 28, 14); c.add(gb); c.add(KG.txt(this, 381, 36, gradeTag(t.grade) + '+', { size: 15, color: dim ? '#c9d3ef' : '#04221e', center: true, middle: true }));
      const lvls = [];
      for (let L = 1; L <= 5; L++) {
        const bx = 470 + (L - 1) * 92, st = starsOf(t.id, L), lg = this.add.graphics(); c.add(lg);
        const drawL = hov => { lg.clear(); lg.fillStyle(st ? (st === 3 ? 0xffb800 : 0x2c6bff) : 0x111a46, 1); lg.fillCircle(bx, 26, 22); lg.lineStyle(hov ? 4 : 2, hov ? 0xffffff : st ? 0xffffff : 0x3a4ca6, 1); lg.strokeCircle(bx, 26, 22); if (L === 5) { lg.lineStyle(2, 0xff4d5e, 1); lg.strokeCircle(bx, 26, 27); } };
        drawL(false); c.add(KG.txt(this, bx, 26, String(L), { size: 22, color: st === 3 ? '#2a1c00' : '#ffffff', center: true, middle: true }));
        for (let s = 0; s < 3; s++) c.add(KG.ui.icon(this, s < st ? 'star' : 'starO', bx - 16 + s * 16, 58, 14, s < st ? 0xffd34f : 0x3a4ca6));
        const z = this.add.zone(bx, 32, 72, 70).setInteractive({ useHandCursor: true }); c.add(z);
        z.on('pointerover', () => { drawL(true); KG.audio.play('hover'); this.select(i, true); this.showDetail(t, L); }); z.on('pointerout', () => { drawL(false); this.showDetail(t); });
        z.on('pointerup', () => this.play(t, L)); lvls.push({ drawL, z });
      }
      const z = this.add.zone(215, 35, 420, 70).setInteractive({ useHandCursor: true }); c.add(z);
      z.on('pointerup', () => { this.select(i); }); z.on('pointerover', () => { if (i !== this.ti) KG.audio.play('hover'); });
      const row = { t, c, g, dim, col, lvls, draw: on => { g.clear(); g.fillStyle(on ? 0x16245e : 0x0a1030, dim ? 0.6 : on ? 0.98 : 0.86); g.fillPoints([{ x: 14, y: 0 }, { x: w, y: 0 }, { x: w, y: h - 14 }, { x: w - 14, y: h }, { x: 0, y: h }, { x: 0, y: 14 }], true); g.lineStyle(on ? 3 : 1.5, on ? col : 0x2f3d84, 1); g.strokePoints([{ x: 14, y: 0 }, { x: w, y: 0 }, { x: w, y: h - 14 }, { x: w - 14, y: h }, { x: 0, y: h }, { x: 0, y: 14 }], true); g.fillStyle(col, on ? 1 : 0.55); g.fillRoundedRect(12, 12, 48, 46, 10); } };
      row.draw(i === this.ti); c.setAlpha(dim ? 0.55 : 1); this.rows.push(row);
      if (anim) { const a = c.alpha; c.setAlpha(0).x += 30; this.tweens.add({ targets: c, x, alpha: a, duration: 260, delay: i * 45, ease: 'Cubic.easeOut' }); }
    });
    this.showDetail(tl[this.ti]);
  }
  select(i, quiet) {
    if (i === this.ti) return; this.ti = i; this.rows.forEach((r, k) => r.draw(k === i)); SAVE.data.topic = this.rows[i].t.id; SAVE.save();
    if (!quiet) { KG.audio.play('tap'); this.showDetail(this.rows[i].t); }
  }
  showDetail(t, L) {
    if (this.detail) this.detail.destroy(true); const c = this.detail = this.add.container(0, 0).setDepth(4), y = 640, rec = L || nextLevel(t.id);
    c.add(KG.ui.panel(this, 316, y, 944, 70, { accent: worldOf(t.world).color, accent2: '#4ef4d2', cuts: [14, 0, 14, 0], glow: false }));
    c.add(KG.txt(this, 336, y + 6, (L ? 'ระดับ ' + L : 'แนะนำระดับ ' + rec) + ' · ' + t.lv[rec - 1], { size: 19, color: '#ffd34f' }));
    let tip = t.tip; while (tip.length > 8 && KG.measure(tip, '400 15px Kanit') > 690) tip = tip.slice(0, -2); if (tip !== t.tip) tip = tip.trimEnd() + '…';
    c.add(KG.txt(this, 336, y + 38, tip, { size: 15, weight: 400, color: '#cdd7f2' }));
    const b = new KG.ui.Button(this, 1150, y + 34, 190, 56, { label: 'เล่น ระดับ ' + rec, icon: 'play', style: 'primary', size: 20, onClick: () => this.play(t, rec) }); c.add(b);
    c.add(KG.txt(this, 1246, y + 4, 'Enter', { size: 12, color: '#050818', ox: 1 }).setBackgroundColor('#ffd34f').setPadding(4, 0, 4, 0));
    if (t.speed) c.add(new KG.ui.Button(this, 950, y + 34, 190, 56, { label: 'กำหนดเอง', icon: 'flag', style: 'cyan', size: 20, onClick: () => this.go('Speed') }));   // คิดเลขเร็วแบบเลือกวิธี/จำนวนข้อ/เวลาเอง
  }
  play(t, L) { KG.audio.play('confirm'); SAVE.data.topic = t.id; SAVE.data.world = t.world; SAVE.save(); this.go('Play', { topic: t.id, level: L }); }
  keys() { if (this._modal && !this._modal.closed) return; showKeys(this); }
  onEscape() { if (this._modal && !this._modal.closed) { this._modal.close(); return; } this.go('Title'); }
  onKey(e) {
    const code = e.code; if (code === 'Escape') return;
    if (this._modal && !this._modal.closed) { if (code === 'Enter' || code === 'KeyK' || code === 'NumpadEnter') this._modal.close(); return; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Space'].includes(code)) { try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } }
    const tl = worldTopics(this.wid), wi = MW.findIndex(w => w.id === this.wid), dg = /^(Digit|Numpad)([1-5])$/.exec(code);
    if (code === 'ArrowDown') this.select((this.ti + 1) % tl.length); else if (code === 'ArrowUp') this.select((this.ti - 1 + tl.length) % tl.length);
    else if (code === 'ArrowRight' || (code === 'Tab' && !e.shiftKey)) this.setWorld(MW[(wi + 1) % MW.length].id); else if (code === 'ArrowLeft' || (code === 'Tab' && e.shiftKey)) this.setWorld(MW[(wi - 1 + MW.length) % MW.length].id);
    else if (dg) this.play(tl[this.ti], +dg[2]); else if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') this.play(tl[this.ti], nextLevel(tl[this.ti].id));
    else if (code === 'KeyG') this.setGrade(((SAVE.data.grade || 0) + 1) % 5); else if (code === 'KeyK') this.keys();
    else if (code === 'KeyM') { KG.prefs.data.sfx = !KG.prefs.data.sfx; KG.prefs.save(); KG.audio.setSfx(KG.prefs.data.sfx); } else if (code === 'KeyF') KG.fullscreen();
  }
}
