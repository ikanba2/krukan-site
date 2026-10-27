/* ===== คิดเลขเร็ว โหมดกำหนดเอง (ผู้ใช้ขอ 26 ต.ค. 2569): เลือกวิธีการ (บวก ลบ คูณ หาร ได้หลายอย่าง) · ระดับ ป.1–ป.4 · จำนวนข้อ · จับเวลาหรือไม่
   ซ้าย: ตัวเลือก 4 แถว · ขวา: สรุป ตัวอย่างโจทย์ สถิติดีสุดของชุดค่านี้ ปุ่มเริ่ม · จำค่าที่เลือกล่าสุดไว้ (SAVE.data.speedCfg)
   คีย์ลัด: Enter เริ่ม · Esc หน้าแรก */
class SpeedScene extends KG.Scene {
  constructor() { super('Speed'); }
  init() { this._modal = null; this._restartData = {}; this.cfg = speedCfg(); this.btn = { ops: {}, grade: {}, n: {}, secs: {} }; this.sum = null; }
  create() {
    this.setup('#060a1e'); KG.audio.music('menu');
    this.add.image(GW / 2, GH / 2, 'arena_thunder').setDisplaySize(GW * 1.1, GH * 1.1).setAlpha(0.6);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x050818, 0.7);
    KG.fx.ambient(this, { freq: 260, colors: [0x4ef4d2, 0xffffff, 0xffd34f], s: 0.3, alpha: 0.5 });
    // HUD
    const g = this.add.graphics().setDepth(1); g.fillStyle(0x050818, 0.9); g.fillRect(0, 0, GW, 72); this.add.rectangle(GW / 2, 71, GW, 3, 0x4ef4d2).setDepth(1);
    iconButton(this, 44, 36, 'home', () => this.go('Title'), { w: 56, h: 50, depth: 5 });
    this.txt(86, 4, 'TECHNO MATH · สมรภูมิคณิต', { size: 15, color: '#4ef4d2' }).setDepth(5);
    this.txt(86, 22, 'คิดเลขเร็ว · กำหนดเอง', { size: 30, stroke: true }).setDepth(5);
    addSystemButtons(this, 1094, 36, 62, ['sfx', 'music', 'fs']).forEach(b => b.setDepth(5).setScale(0.86));

    // ตัวเลือก (ซ้าย)
    KG.ui.panel(this, 24, 88, 820, 616, { accent: '#4ef4d2', accent2: '#ffd34f', cuts: [18, 0, 18, 0] }).setDepth(2);
    const head = (y, n, t, sub) => { this.txt(50, y, n + ' · ' + t, { size: 23, color: '#4ef4d2' }).setDepth(4); if (sub) this.txt(50 + KG.measure(n + ' · ' + t, '600 23px Kanit') + 14, y + 6, sub, { size: 16, weight: 400, color: '#9fb0d8' }).setDepth(4); };
    const chip = (x, y, w, h, label, o, size) => new KG.ui.Button(this, x, y, w, h, Object.assign({ label, style: 'ghost', size: size || 24, slant: 8 }, o)).setDepth(4);
    head(100, '1', 'วิธีการ', 'เลือกได้หลายอย่าง');
    MG.SPEED_OPS.forEach((op, i) => {
      const b = this.btn.ops[op.id] = chip(140 + i * 195, 186, 180, 92, op.sym + '  ' + op.th, { onClick: () => this.toggleOp(op.id) }, 34);
      b.tick = this.add.container(140 + i * 195 + 74, 150).setDepth(6); b.tick.add(this.add.circle(0, 0, 15, 0x5ef08a).setStrokeStyle(3, 0x050818)); b.tick.add(KG.ui.icon(this, 'check', 0, 0, 18, 0x04221e));   // เครื่องหมายถูกบนวิธีที่เลือก
    });
    head(250, '2', 'ระดับ');
    [1, 2, 3, 4].forEach((gr, i) => { this.btn.grade[gr] = chip(140 + i * 195, 312, 180, 54, gradeTag(gr), { onClick: () => this.set('grade', gr) }); });
    this.lvT = this.txt(50, 346, '', { size: 17, weight: 400, color: '#ffd34f', width: 770 }).setDepth(4);
    head(392, '3', 'จำนวนข้อ');
    SPEED_N.forEach((n, i) => { this.btn.n[n] = chip(140 + i * 195, 454, 180, 54, n + ' ข้อ', { onClick: () => this.set('n', n) }); });
    head(506, '4', 'จับเวลา');
    SPEED_T.forEach((s, i) => { const w = i ? 132 : 186, x = i ? 320 + (i - 1) * 142 : 143; this.btn.secs[s] = chip(x, 568, w, 54, timeName(s), { onClick: () => this.set('secs', s) }, i ? 22 : 24); });
    this.tT = this.txt(50, 602, '', { size: 17, weight: 400, color: '#9fb0d8', width: 770 }).setDepth(4);
    this.txt(50, 664, 'ตอบผิด 3 ครั้งในข้อเดียว ครูไรเดอร์จะเฉลยให้แล้วไปข้อถัดไป (ข้อนั้นไม่นับว่าถูก)', { size: 15, weight: 400, color: '#7f8fc0', width: 770 }).setDepth(4);

    // สรุปและเริ่ม (ขวา)
    KG.ui.panel(this, 864, 88, 392, 616, { accent: '#ffd34f', accent2: '#4ef4d2', cuts: [18, 0, 18, 0] }).setDepth(2);
    this.txt(884, 100, 'สรุปชุดนี้', { size: 23, color: '#ffd34f' }).setDepth(4);
    if (KG.hasTitlePose(this)) { const rider = this.add.image(1196, 334, 'title_pose').setOrigin(0.5, 1).setDepth(4); rider.setScale(Math.min(170 / rider.height, 130 / rider.width)); this.tweens.add({ targets: rider, y: rider.y - 4, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }   // ไรเดอร์ท่าประจำเกม (ไม่ถือดาบ)
    const start = new KG.ui.Button(this, 1060, 640, 352, 84, { label: 'เริ่มเลย (Enter)', icon: 'play', style: 'primary', size: 30, onClick: () => this.start() }).setDepth(5);
    this.time.delayedCall(600, () => start.pulse());
    new KG.ui.Button(this, 1060, 560, 352, 50, { label: 'แบบคลาสสิก 60 วินาที', icon: 'bolt', style: 'ghost', size: 19, slant: 6, onClick: () => this.go('Map', { topic: 'speed' }) }).setDepth(5);
    this.refresh();
    this.input.keyboard.on('keydown', e => { if (e.repeat) return; if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') { try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } this.start(); } else if (e.code === 'KeyF') KG.fullscreen(); });
  }
  toggleOp(id) {
    const ops = this.cfg.ops.slice(), i = ops.indexOf(id);
    if (i >= 0) { if (ops.length === 1) { KG.audio.play('denied'); KG.ui.toast(this, 'เลือกอย่างน้อย 1 วิธี', { ms: 1200 }); return; } ops.splice(i, 1); } else ops.push(id);
    this.cfg.ops = MG.SPEED_OPS.map(o => o.id).filter(o => ops.indexOf(o) >= 0); KG.audio.play('tap'); this.save(); this.refresh();
  }
  set(k, v) { if (this.cfg[k] === v) return; this.cfg[k] = v; KG.audio.play('tap'); this.save(); this.refresh(); }
  save() { SAVE.data.speedCfg = Object.assign({}, this.cfg); SAVE.save(); }
  refresh() {
    const c = this.cfg, on = (b, a) => { b.setActive(a); b.label.setColor(a ? '#ffd34f' : '#f4f7ff'); };
    Object.keys(this.btn.ops).forEach(k => { const sel = c.ops.indexOf(k) >= 0; on(this.btn.ops[k], sel); this.btn.ops[k].tick.setVisible(sel); this.btn.ops[k].setAlpha(sel ? 1 : 0.6); });
    Object.keys(this.btn.grade).forEach(k => on(this.btn.grade[k], +k === c.grade));
    Object.keys(this.btn.n).forEach(k => on(this.btn.n[k], +k === c.n));
    Object.keys(this.btn.secs).forEach(k => on(this.btn.secs[k], +k === c.secs));
    this.lvT.setText('ระดับ ' + gradeTag(c.grade) + ': ' + MG.SPEED_OPS.filter(o => c.ops.indexOf(o.id) >= 0).map(o => o.th + ' ' + o.lv[c.grade - 1]).join(' · '));
    this.tT.setText(c.secs ? 'ทำให้ครบ ' + c.n + ' ข้อภายใน ' + timeName(c.secs) + ' ถ้าหมดเวลาก่อนจะจบเกมทันที' : 'ทำได้ไม่รีบ ไม่มีเวลาบังคับ จบแล้วเกมบอกเวลาที่ใช้');
    // สรุป ตัวอย่างโจทย์ สถิติ
    if (this.sum) this.sum.destroy(true); const s = this.sum = this.add.container(0, 0).setDepth(4);
    const ops = MG.SPEED_OPS.filter(o => c.ops.indexOf(o.id) >= 0);
    s.add(KG.txt(this, 884, 140, ops.map(o => o.sym).join('  '), { size: 46, color: '#4ef4d2', stroke: '#050818', sw: 5 }));
    [['วิธี', ops.map(o => o.th).join(' ')], ['ระดับ', gradeTag(c.grade)], ['จำนวน', c.n + ' ข้อ'], ['เวลา', c.secs ? 'จับเวลา ' + timeName(c.secs) : 'ไม่จับเวลา']].forEach((r, i) => {
      s.add(KG.txt(this, 884, 206 + i * 32, r[0], { size: 18, color: '#9fb0d8' })); s.add(KG.txt(this, 960, 206 + i * 32, r[1], { size: 19, color: '#ffffff', width: 200 }));
    });
    const q = MG.speedQ(c.ops, c.grade, MG.rng(Date.now() % 100000 + 7)), qt = q.q.map(p => (typeof p === 'string' ? p : p && p.slot != null ? '?' : '')).join('');
    const pg = this.add.graphics(); pg.fillStyle(0xfbf8ef, 1).fillRoundedRect(884, 344, 352, 86, 12); pg.lineStyle(2, 0xf2a0a0, 1).lineBetween(906, 348, 906, 426); s.add(pg);
    s.add(KG.txt(this, 920, 352, 'ตัวอย่างโจทย์', { size: 14, color: '#8a97b8' }));
    const qx = KG.txt(this, 1070, 396, qt, { size: 34, color: '#1f3d99', center: true, ox: 0.5, oy: 0.5 }); qx.setFontFamily(MFONT); if (qx.width > 300) qx.setScale(300 / qx.width); s.add(qx);
    const b = speedBest(c);
    s.add(KG.txt(this, 884, 446, 'สถิติดีสุดของชุดนี้', { size: 17, color: '#9fb0d8' }));
    s.add(KG.txt(this, 884, 472, b ? 'ถูก ' + b.c + ' / ' + c.n + ' ข้อ · ' + mmssTh(b.secs) : 'ยังไม่เคยเล่นชุดนี้', { size: 21, color: b ? '#ffd34f' : '#cdd7f2' }));
  }
  start() { if (this._leaving) return; KG.audio.play('confirm'); this.save(); this.go('Play', { topic: 'speed', level: this.cfg.grade, cfg: Object.assign({}, this.cfg) }); }
  onEscape() { if (this._modal && !this._modal.closed) { this._modal.close(); return; } this.go('Title'); }
}
