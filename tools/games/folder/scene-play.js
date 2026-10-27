/* ===== ฉากเล่น Techno Folder: หน้าต่างโฟลเดอร์แบบ Windows (ซ้าย) + แผงภารกิจ (ขวา) + สนามเทคโนสู้ตัวรก (ล่างขวา) =====
   โครงหน้าจอ (ตำแหน่งตายตัว): HUD y8-70 · หน้าต่างโฟลเดอร์ x24-884 y84-600 · แผงภารกิจ x900-1256 y84-600 · แถบล่าง y606-714
   ไฟล์นี้เป็นแกนของฉาก (สร้างหน้าจอและวาดใหม่) ส่วนการลากวาง/เมนู/กล่องเลือก อยู่ที่ play-input.js และการกระทำ/คำใบ้/ชนะ อยู่ที่ play-ops.js */
const WIN = { x: 24, y: 84, w: 860, h: 516 };
const GEO = (() => {
  const tb = 34, cmd = 58, adr = 46, st = 28, navW = 212;
  return { tb, cmd, adr, st, navW, cmdY: WIN.y + tb, adrY: WIN.y + tb + cmd, bodyY: WIN.y + tb + cmd + adr, bodyH: WIN.h - tb - cmd - adr - st, contX: WIN.x + navW, contW: WIN.w - navW, stY: WIN.y + WIN.h - st };
})();
const MIS = { x: 900, y: 84, w: 356, h: 516 };
const INK = '#1b2a6b', BLUE = 0x2b8cff;
// ตัดคำภาษาไทยแล้วย้ายเครื่องหมาย “ ที่ค้างท้ายบรรทัดไปไว้หน้าคำถัดไป
function gwrap(str, w, font) {
  const NL = String.fromCharCode(10), L = KG.wrap(str, w, font).split(NL);
  for (let i = 0; i < L.length - 1; i++) if (/“$/.test(L[i])) { L[i] = L[i].slice(0, -1).trimEnd(); L[i + 1] = '“' + L[i + 1]; }
  return L.join(NL);
}

class PlayScene extends KG.Scene {
  constructor() { super('Play'); }
  init(data) {
    data = data || {}; this.W = data.world || SAVE.data.world || 1; this.N = data.level || 1; this.seed = data.seed || null; this.wantTutor = !!data.tutor;
    this._restartData = { world: this.W, level: this.N, seed: this.seed };
    // ฉากถูกใช้ซ้ำเมื่อเริ่มใหม่ ต้องล้างของเดิมที่ค้างจากรอบก่อนทั้งหมด
    this.tutor = null; this._modal = null; this._dlg = null; this._menu = null; this.press = null; this.drag = null; this.hl = null; this.bubble = null; this.hero = null; this.mon = null;
    this.dynNav = []; this.dynCont = []; this.dynAddr = []; this.dynMis = []; this.drops = []; this.itemObjs = {}; this.navObjs = {}; this.pips = []; this.checkDone = []; this.lastTap = null;
  }

  create() {
    this._t0 = Date.now();   // เริ่มจับเวลาเล่น (ส่งเป็นสถิติ)
    this.setup(); const WD = WORLDS[this.W - 1]; KG.audio.music(['sunny', 'breeze', 'bounce'][(this.W - 1) % 3]);
    this.lv = this.seed ? makeLevel(this.W, this.N, this.seed) : getLevel(this.W, this.N);
    this.fs = FD.init(this.lv); this.cur = FD.idOf(this.fs, this.lv.start) || FD.ROOT; this.hist = [this.cur]; this.hi = 0; FD.openFolder(this.fs, this.cur);
    this.sel = []; this.multi = false; this.mistakes = 0; this.hints = 0; this.ops = 0; this.done = false; this.paused = false; this.speaking = false; this.state = 'play';
    this.buildBackground(); this.buildWindow(); this.buildMission(); this.buildHud(); this.buildBar(); this.buildArena();
    this.dropHL = this.add.graphics().setDepth(300);
    this.input.on('pointermove', p => this.onMove(p)); this.input.on('pointerup', p => this.onUp(p));
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.renderAll(); this.refreshMission(true); this.refreshStats();
    this.setMessage(this.lv.desc, 'info');
    if (this.wantTutor && this.W === 1 && this.N === 1) this.time.delayedCall(500, () => this.startTutor());
    else if (this.N === 1 && !this.seed && !SAVE.data.tutorDone[this.W]) this.time.delayedCall(700, () => this.showIntro());
  }
  onEscape() { if (this._dlg) this.closeDialog(); else if (this._menu) this.closeMenu(); else this.pause(); }
  leave() { this.go('Select', { level: this.N }); }
  node(id) { return this.fs.nodes[id]; }
  nameOf(id) { return this.fs.nodes[id] ? this.fs.nodes[id].name : ''; }
  pathText(id) { return id === FD.BIN ? 'ถังรีไซเคิล' : FD.pathNames(this.fs, id).join(' › '); }

  /* ---------- ฉากหลังและกรอบ ---------- */
  buildBackground() {
    const WD = WORLDS[this.W - 1]; this.add.image(GW / 2, GH / 2, 'arena_' + WD.bg).setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.22);
    KG.fx.ambient(this, { freq: 360, colors: [0xffffff, 0xffd34f, 0x7fe0ff], s: 0.3, alpha: 0.6 });
    KG.ui.panel(this, WIN.x, WIN.y, WIN.w, WIN.h, { accent: WD.color, accent2: WD.color, cuts: [18, 0, 18, 0], fill: ['#f6fbff', '#dcecff'], alpha: 0.98 }).setDepth(1);
    KG.ui.panel(this, MIS.x, MIS.y, MIS.w, MIS.h, { accent: '#ff8a2b', accent2: '#ffcf33', cuts: [0, 18, 0, 18], fill: ['#fffaf0', '#fff0d2'], alpha: 0.97 }).setDepth(1);
  }

  /* ---------- หน้าต่างโฟลเดอร์: ส่วนที่คงที่ ---------- */
  buildWindow() {
    const g = this.add.graphics().setDepth(2), X = WIN.x + 6, W = WIN.w - 12;
    // แถบชื่อหน้าต่าง
    g.fillStyle(0xe4ecfb, 1); g.fillRect(X, WIN.y + 10, W, GEO.tb - 6);
    // แถบคำสั่ง
    g.fillStyle(0xf6f8ff, 1); g.fillRect(X, GEO.cmdY + 4, W, GEO.cmd - 4); g.lineStyle(1, 0xc2cfe8, 1); g.lineBetween(X, GEO.cmdY + GEO.cmd, X + W, GEO.cmdY + GEO.cmd);
    // แถบที่อยู่
    g.fillStyle(0xffffff, 1); g.fillRect(X, GEO.adrY, W, GEO.adr);
    g.fillStyle(0xf1f5fd, 1); g.fillRect(X, GEO.bodyY, GEO.navW - 6, GEO.bodyH); g.lineStyle(1, 0xc2cfe8, 1); g.lineBetween(GEO.contX, GEO.bodyY, GEO.contX, GEO.bodyY + GEO.bodyH);
    g.fillStyle(0xffffff, 1); g.fillRect(GEO.contX + 1, GEO.bodyY, GEO.contW - 7, GEO.bodyH);
    g.fillStyle(0xe9eefa, 1); g.fillRect(X, GEO.stY, W, GEO.st - 6);
    this.titleIcon = null; this.titleTxt = this.txt(X + 34, WIN.y + 12, '', { size: 18, color: INK }).setDepth(6);
    ['—', '▢', '✕'].forEach((s, i) => this.txt(X + W - 100 + i * 32, WIN.y + 12, s, { size: 16, weight: 400, color: '#5b6c9a' }).setDepth(6));
    // พื้นที่ว่างของเนื้อหา (คลิกเพื่อยกเลิกการเลือก / คลิกขวาเรียกเมนู)
    this.contZone = this.add.zone(GEO.contX + (GEO.contW - 6) / 2, GEO.bodyY + GEO.bodyH / 2, GEO.contW - 6, GEO.bodyH).setDepth(3).setInteractive();
    this.contZone.on('pointerdown', p => { if (this.busy()) return; if (p.rightButtonDown()) { this.openMenu(p.worldX, p.worldY, this.emptyMenu()); return; } this.sel = []; this.refreshSel(); });
    this.buildCmd();
    this.statL = this.txt(X + 10, GEO.stY + 3, '', { size: 16, weight: 400, color: '#33456f' }).setDepth(6);
    this.statR = this.txt(X + W - 10, GEO.stY + 3, '', { size: 16, weight: 400, color: '#33456f', ox: 1 }).setDepth(6);
  }
  buildCmd() {
    const y = GEO.cmdY + 31, mk = (key, x, w, label, icon, style, fn) => { const b = new KG.ui.Button(this, x + w / 2, y, w, 44, { label, icon, style, size: 18, slant: 6, onClick: fn }).setDepth(10); this.cmd[key] = b; return b; };
    this.cmd = {}; let x = WIN.x + 14;
    mk('new', x, 112, 'ใหม่', 'newfolder', 'sun', () => this.newMenu()); x += 118;
    mk('cut', x, 84, 'ตัด', 'cut', 'ghost', () => this.doCut()); x += 90;
    mk('copy', x, 110, 'คัดลอก', 'copy', 'ghost', () => this.doCopyBtn()); x += 116;
    mk('paste', x, 84, 'วาง', 'paste', 'ghost', () => this.doPaste()); x += 90;
    mk('rename', x, 126, 'เปลี่ยนชื่อ', 'rename', 'ghost', () => this.doRenameBtn()); x += 132;
    mk('del', x, 84, 'ลบ', 'trash', 'danger', () => this.doDelete(this.sel)); x += 90;
    mk('multi', x, 142, 'เลือกหลายไฟล์', 'multi', 'ghost', () => this.toggleMulti());
    mk('restore', WIN.x + 14, 130, 'กู้คืน', 'restore', 'cyan', () => this.doRestoreBtn());
  }
  renderCmd() {
    const bin = this.cur === FD.BIN, has = this.sel.length > 0, one = this.sel.length === 1, c = this.cmd;
    ['new', 'cut', 'copy', 'paste', 'rename', 'del'].forEach(k => c[k].setVisible(!bin)); c.restore.setVisible(bin);
    c.new.setEnabled(!bin); c.cut.setEnabled(has && !bin); c.copy.setEnabled(has && !bin); c.paste.setEnabled(!!this.fs.clip && !bin); c.rename.setEnabled(one && !bin); c.del.setEnabled(has && !bin);
    c.restore.setEnabled(has && bin); c.multi.setActive(this.multi); c.multi.label.setText(this.multi ? 'เลือกหลายไฟล์: เปิด' : 'เลือกหลายไฟล์'); c.multi.layout();
  }

  /* ---------- วาดหน้าต่างใหม่ ---------- */
  renderAll() { this.drops = []; this.renderTitle(); this.renderNav(); this.renderContent(); this.renderAddr(); this.renderCmd(); this.renderStatus(); this.applyHighlight(); }
  clearDyn(list) { list.forEach(o => { if (o && o.destroy) o.destroy(); }); list.length = 0; }
  renderTitle() {
    if (this.titleIcon) this.titleIcon.destroy();
    this.titleIcon = this.add.image(WIN.x + 6 + 20, WIN.y + 27, this.cur === FD.BIN ? folderTex(this, 48, 'bin') : folderTex(this, 48, 'normal')).setDisplaySize(22, 22).setDepth(6);
    this.titleTxt.setText(this.nameOf(this.cur));
  }
  renderNav() {
    this.clearDyn(this.dynNav); this.navObjs = {}; const fs = this.fs, rows = [];
    const walk = (id, d) => { rows.push({ id, d }); FD.kids(fs, id).filter(k => fs.nodes[k].kind === 'd').forEach(k => walk(k, d + 1)); };
    walk(FD.ROOT, 0); rows.push({ id: FD.BIN, d: 0 });
    const rh = KG.clamp(Math.floor((GEO.bodyH - 8) / rows.length), 22, 32), fz = rh >= 30 ? 17 : rh >= 26 ? 15 : 13, isz = Math.min(24, rh - 4);
    rows.forEach((r, i) => {
      const y = GEO.bodyY + 4 + i * rh, x = WIN.x + 10 + r.d * 16, w = GEO.navW - 16 - r.d * 16, active = this.cur === r.id;
      const bg = this.add.rectangle(x, y, w, rh - 2, active ? 0xcfe3ff : 0xffffff, active ? 1 : 0).setOrigin(0, 0).setDepth(4); this.dynNav.push(bg);
      if (active) { const st = this.add.rectangle(x, y + 3, 4, rh - 8, BLUE, 1).setOrigin(0, 0).setDepth(5); this.dynNav.push(st); }
      const ic = this.add.image(x + 8 + isz / 2, y + rh / 2 - 1, folderTex(this, 48, r.id === FD.BIN ? 'bin' : 'normal')).setDisplaySize(isz, isz).setDepth(5); this.dynNav.push(ic);
      const nm = this.nameOf(r.id), maxW = w - isz - 22; let label = nm; while (label.length > 2 && KG.measure(label, '600 ' + fz + 'px Kanit') > maxW) label = label.slice(0, -1); if (label !== nm) label += '…';
      const t = KG.txt(this, x + isz + 14, y + rh / 2, label, { size: fz, color: INK, oy: 0.5 }).setDepth(5); this.dynNav.push(t);
      const z = this.add.zone(x + w / 2, y + rh / 2, w, rh).setDepth(6).setInteractive({ useHandCursor: true }); this.dynNav.push(z);
      z.on('pointerdown', p => { if (this.busy()) return; this.sel = []; this.nav(r.id); });
      z.on('pointerover', () => { if (!active && !this.drag) bg.setFillStyle(0xe3eefc, 1); }); z.on('pointerout', () => { if (!active) bg.setFillStyle(0xffffff, 0); });
      this.navObjs[r.id] = { bg, ic, t, z, rect: { x, y, w, h: rh } };
      this.drops.push({ kind: 'nav', id: r.id, rect: { x, y, w, h: rh } });
    });
  }
  // จัดตารางไอคอน: คืนขนาดช่องและสเกลตามจำนวนรายการ
  gridFor(n) {
    const W = GEO.contW - 30, H = GEO.bodyH - 16;
    for (const s of [1, 0.84, 0.7, 0.6]) { const cw = Math.round(100 * s), ch = Math.round(106 * s), cols = Math.floor(W / cw), rows = Math.floor(H / ch); if (cols * rows >= n) return { s, cw, ch, cols, rows }; }
    return { s: 0.6, cw: 60, ch: 64, cols: Math.floor(W / 60), rows: Math.floor(H / 64) };
  }
  renderContent() {
    this.clearDyn(this.dynCont); this.itemObjs = {}; const fs = this.fs, list = FD.kids(fs, this.cur), grid = this.gridFor(list.length);
    const x0 = GEO.contX + 14, y0 = GEO.bodyY + 10, cutIds = fs.clip && fs.clip.mode === 'cut' ? fs.clip.ids : [];
    if (!list.length) {
      const msg = this.cur === FD.BIN ? 'ถังรีไซเคิลว่างเปล่า' : (this.cur === FD.ROOT && this.lv.kind === 'create' && !list.length ? 'ยังไม่มีอะไรเลย กดปุ่ม ใหม่ เพื่อสร้างโฟลเดอร์' : 'โฟลเดอร์นี้ว่างเปล่า');
      this.dynCont.push(this.txt(GEO.contX + GEO.contW / 2 - 3, GEO.bodyY + GEO.bodyH / 2 - 10, msg, { size: 22, weight: 400, color: '#7a8bb5', center: true, ox: 0.5, oy: 0.5 }).setDepth(5));
    }
    list.forEach((id, i) => {
      const n = fs.nodes[id], col = i % grid.cols, row = Math.floor(i / grid.cols), x = x0 + col * grid.cw, y = y0 + row * grid.ch, cw = grid.cw - 6, ch = grid.ch - 4, s = grid.s;
      const c = this.add.container(0, 0).setDepth(5); this.dynCont.push(c);
      const bg = this.add.graphics(); c.add(bg);
      const isz = Math.round(66 * s), tex = n.kind === 'd' ? folderTex(this, 72, 'normal') : fileTex(this, n.icon || 'doc', 72);
      const icon = this.add.image(x + cw / 2, y + 6 + isz / 2, tex).setDisplaySize(isz, isz); c.add(icon); if (cutIds.includes(id)) icon.setAlpha(0.45);
      let fz = Math.round(16 * s), txt = KG.wrap(n.name, cw - 4, '600 ' + fz + 'px Kanit');
      if (txt.split('\n').length > 2) { fz = Math.max(12, fz - 2); txt = KG.wrap(n.name, cw - 2, '600 ' + fz + 'px Kanit'); }
      const lines = txt.split('\n'); if (lines.length > 2) txt = lines[0] + '\n' + lines[1].slice(0, -1) + '…';
      const label = KG.txt(this, x + cw / 2, y + 8 + isz, txt, { size: fz, color: INK, center: true, ox: 0.5 }); label.setLineSpacing(-2); c.add(label);
      const z = this.add.zone(x + cw / 2, y + ch / 2, cw, ch).setInteractive({ useHandCursor: true }); c.add(z);
      const o = { c, bg, icon, label, z, id, rect: { x, y, w: cw, h: ch } }; this.itemObjs[id] = o;
      z.on('pointerdown', p => this.itemDown(id, p));
      z.on('pointerover', () => { if (!this.drag && !this.sel.includes(id)) this.drawItemBg(o, 'hover'); }); z.on('pointerout', () => { if (!this.drag) this.drawItemBg(o, this.sel.includes(id) ? 'sel' : 'none'); });
      this.drawItemBg(o, this.sel.includes(id) ? 'sel' : 'none');
      if (n.kind === 'd' && this.cur !== FD.BIN) this.drops.push({ kind: 'item', id, rect: o.rect });
    });
  }
  drawItemBg(o, mode) {
    const g = o.bg, r = o.rect; g.clear(); if (mode === 'none') return;
    g.fillStyle(mode === 'sel' ? 0x2b8cff : 0x9bbcf0, mode === 'sel' ? 0.24 : 0.16); g.fillRoundedRect(r.x, r.y, r.w, r.h, 8);
    if (mode === 'sel') { g.lineStyle(2, 0x2b8cff, 0.9); g.strokeRoundedRect(r.x, r.y, r.w, r.h, 8); }
  }
  refreshSel() { Object.keys(this.itemObjs).forEach(id => this.drawItemBg(this.itemObjs[id], this.sel.includes(id) ? 'sel' : 'none')); this.renderCmd(); this.renderStatus(); }
  renderAddr() {
    this.clearDyn(this.dynAddr); const y = GEO.adrY + GEO.adr / 2, X = WIN.x + 6;
    const mkBtn = (x, icon, enabled, fn) => {
      const bg = this.add.rectangle(x, y, 34, 34, enabled ? 0xe3eefc : 0xf1f4fb, 1).setDepth(6).setStrokeStyle(1, 0xc2cfe8); const ic = KG.ui.icon(this, icon, x, y, 18, enabled ? 0x1b2a6b : 0xb5c0da).setDepth(7);
      const z = this.add.zone(x, y, 36, 36).setDepth(8).setInteractive({ useHandCursor: enabled }); if (enabled) z.on('pointerdown', () => { if (!this.busy()) fn(); });
      this.dynAddr.push(bg, ic, z);
    };
    mkBtn(X + 24, 'chevL', this.hi > 0, () => this.back()); mkBtn(X + 64, 'chevR', this.hi < this.hist.length - 1, () => this.forward());
    mkBtn(X + 104, 'chevU', this.cur !== FD.ROOT && this.cur !== FD.BIN, () => this.up());
    const fx = X + 130, fw = WIN.w - 12 - 140, field = this.add.rectangle(fx, y, fw, 34, 0xffffff, 1).setOrigin(0, 0.5).setDepth(6).setStrokeStyle(1, 0xaebddd); this.dynAddr.push(field);
    const ids = this.cur === FD.BIN ? [FD.BIN] : FD.pathIds(this.fs, this.cur); let x = fx + 12;
    ids.forEach((id, i) => {
      if (i > 0) { const sep = KG.txt(this, x, y, '›', { size: 20, color: '#7a8bb5', oy: 0.5 }).setDepth(7); this.dynAddr.push(sep); x += 24; }
      let nm = this.nameOf(id); const maxW = Math.max(60, (fx + fw - 20 - x) / (ids.length - i));
      while (nm.length > 2 && KG.measure(nm, '600 18px Kanit') > maxW) nm = nm.slice(0, -1); if (nm !== this.nameOf(id)) nm += '…';
      const t = KG.txt(this, x, y, nm, { size: 18, color: id === this.cur ? INK : '#33456f', oy: 0.5 }).setDepth(7); this.dynAddr.push(t);
      const w = t.width + 8, rect = { x: x - 4, y: y - 16, w, h: 32 };
      const z = this.add.zone(x - 4 + w / 2, y, w, 32).setDepth(8).setInteractive({ useHandCursor: true }); this.dynAddr.push(z);
      z.on('pointerdown', () => { if (!this.busy() && id !== this.cur) { this.sel = []; this.nav(id); } }); z.on('pointerover', () => t.setColor('#ff7a1a')); z.on('pointerout', () => t.setColor(id === this.cur ? INK : '#33456f'));
      this.drops.push({ kind: 'crumb', id, rect }); x += w;
    });
  }
  renderStatus() {
    const n = FD.kids(this.fs, this.cur).length, c = this.fs.clip;
    this.statL.setText(n + ' รายการ' + (this.sel.length ? ' · เลือก ' + this.sel.length + ' รายการ' : ''));
    this.statR.setText(c ? (c.mode === 'cut' ? 'ตัดไว้ ' : 'คัดลอกไว้ ') + c.ids.length + ' รายการ รอวาง' : (this.multi ? 'โหมดเลือกหลายไฟล์: แตะไฟล์เพื่อเลือกหรือยกเลิก' : ''));
  }

  /* ---------- แผงภารกิจ ---------- */
  buildMission() {
    const WD = WORLDS[this.W - 1], x = MIS.x + 18, w = MIS.w - 36;
    this.txt(x, MIS.y + 14, 'ภารกิจของเทคโน', { size: 18, color: '#d9560a' }).setDepth(6);
    this.misDesc = this.txt(x, MIS.y + 38, '', { size: 20, weight: 400, color: INK, width: w }).setDepth(6); this.misDesc.setText(gwrap(this.lv.desc, w, '400 20px Kanit'));
    const dh = this.misDesc.displayHeight; this.checkTop = MIS.y + 46 + dh;
    this.checkRows = []; const avail = MIS.y + MIS.h - 150 - (this.checkTop + 8), cw = w - 44;
    // ลองขนาดตัวอักษรจากใหญ่ไปเล็ก จนรายการทั้งหมดพอดีกับพื้นที่เหนือสนามสู้
    let sz = 19, rows;
    for (; sz >= 14; sz--) {
      rows = this.lv.checks.map(ck => { const t = KG.txt(this, x + 40, 0, gwrap(ck.text, cw, '600 ' + sz + 'px Kanit'), { size: sz, color: INK }).setDepth(6); t.setLineSpacing(-1); return { t, h: Math.max(34, t.displayHeight + 4), ck }; });
      const total = rows.reduce((n, r) => n + r.h + 8, 0); if (total <= avail || sz === 14) break; rows.forEach(r => r.t.destroy());
    }
    let y = this.checkTop + 8;
    rows.forEach(r => {
      r.t.setY(y); r.box = this.add.graphics().setDepth(6); r.tick = KG.ui.icon(this, 'check', x + 17, y + 17, 22, 0x22b45a).setDepth(7).setAlpha(0); r.y = y; this.checkRows.push(r); y += r.h + 8;
    });
  }
  drawBox(r, done) {
    const x = MIS.x + 18; r.box.clear(); r.box.fillStyle(done ? 0xdff7e6 : 0xffffff, 1); r.box.fillRoundedRect(x + 4, r.y + 4, 26, 26, 6); r.box.lineStyle(3, done ? 0x22b45a : 0x2b3f9c, 1); r.box.strokeRoundedRect(x + 4, r.y + 4, 26, 26, 6);
    r.tick.setAlpha(done ? 1 : 0); r.t.setColor(done ? '#13804a' : INK);
  }

  /* ---------- HUD และแถบล่าง ---------- */
  buildHud() {
    const WD = WORLDS[this.W - 1];
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52, depth: 30 });
    this.txt(100, 6, 'โลก ' + this.W + ' · ' + WD.grade + (this.seed ? ' · ฝึกสุ่ม' : ''), { size: 18, color: KG.SKIN.hi }).setDepth(30);
    this.txt(100, 26, 'ด่าน ' + this.N + ' · ' + this.lv.title, { size: 30, stroke: true }).setDepth(30);
    addSystemButtons(this, 1084, 40, 0, ['sfx']).forEach(b => b.setDepth(30));
    iconButton(this, 1148, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52, depth: 30 });
    iconButton(this, 1218, 40, 'pause', () => this.pause(), { w: 60, h: 52, depth: 30 });
  }
  buildBar() {
    this.msgBg = KG.ui.panel(this, 24, 610, 600, 98, { accent: '#2b8cff', cuts: [14, 0, 14, 0], fill: ['#ffffff', '#e6f1ff'], alpha: 0.96 }).setDepth(20);
    this.msgTxt = this.txt(46, 622, '', { size: 22, color: INK, width: 500 }).setDepth(30);
    this.speakBtn = iconButton(this, 590, 659, 'sound', () => this.speak(this.msgPlain || ''), { w: 52, h: 48, depth: 30 });
    this.hintBtn = new KG.ui.Button(this, 712, 636, 150, 44, { label: 'คำใบ้', icon: 'bulb', style: 'sun', size: 20, slant: 8, onClick: () => this.showHint() }).setDepth(30);
    this.resetBtn = new KG.ui.Button(this, 712, 688, 150, 44, { label: 'เริ่มใหม่', icon: 'reset', style: 'ghost', size: 20, slant: 8, onClick: () => this.go('Play', this._restartData) }).setDepth(30);
    KG.ui.panel(this, 810, 610, 446, 98, { accent: '#ffcf33', accent2: '#ff8a2b', cuts: [0, 14, 0, 14], fill: ['#fffaf0', '#fff0d2'], alpha: 0.96 }).setDepth(20);
    this.statsTxt = this.txt(832, 622, '', { size: 20, color: INK }).setDepth(30);
    this.starIcons = [0, 1, 2].map(i => KG.ui.icon(this, 'star', 850 + i * 40, 676, 34, 0xffb800).setDepth(30));
    this.txt(978, 664, 'ดาวตอนนี้', { size: 16, weight: 400, color: '#7a5a1a' }).setDepth(30);
    if (this.lv.quiz && this.lv.quiz.length) this.quizBtn = new KG.ui.Button(this, 1152, 672, 190, 42, { label: 'ตอบคำถาม', icon: 'help', style: 'violet', size: 20, slant: 8, onClick: () => this.openQuiz(0) }).setDepth(30);
  }
  setMessage(str, kind) {
    this.msgPlain = str; this.msgTxt.setText(gwrap(str, 500, '600 22px Kanit')); this.msgTxt.setColor(kind === 'bad' ? '#c9202f' : kind === 'good' ? '#13804a' : INK);
    this.msgTxt.setScale(1); if (this.msgTxt.displayHeight > 80) this.msgTxt.setScale(80 / this.msgTxt.displayHeight);
  }
  refreshStats() {
    this.statsTxt.setText('พลาด ' + this.mistakes + ' ครั้ง · ใช้คำใบ้ ' + this.hints + ' ครั้ง'); const pen = this.mistakes + this.hints, n = pen <= 1 ? 3 : pen <= 3 ? 2 : 1;
    this.starIcons.forEach((ic, i) => ic.setTint(i < n ? 0xffb800 : 0xc5cde6));
  }
  speak(text) {
    try {
      if (!window.speechSynthesis || !text) return; window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[·›“”]/g, ' ')); u.lang = 'th-TH'; u.rate = 0.9;
      const v = (window.speechSynthesis.getVoices() || []).find(x => /^th/i.test(x.lang)); if (v) u.voice = v; window.speechSynthesis.speak(u);
    } catch (e) { /* ไม่มีเสียงอ่านก็ไม่เป็นไร */ }
  }

  /* ---------- สนามเทคโนสู้ตัวรก (มุมล่างขวา) ---------- */
  buildArena() {
    const WD = WORLDS[this.W - 1], m = this.lv.monsters[0], boss = this.lv.boss, fy = MIS.y + MIS.h - 12, hx = MIS.x + 100, mx = MIS.x + 262;
    const g = this.add.graphics().setDepth(5); g.lineStyle(2, 0xe0c58a, 1); g.lineBetween(MIS.x + 18, MIS.y + MIS.h - 150, MIS.x + MIS.w - 18, MIS.y + MIS.h - 150);
    this.heroSh = this.add.ellipse(hx, fy - 2, 80, 14, 0x1b2a6b, 0.28).setDepth(7); this.monSh = this.add.ellipse(mx, fy - 2, boss ? 120 : 92, 14, 0x1b2a6b, 0.28).setDepth(7);
    this.hero = KG.art.make(this, hx, fy, WD.hero, 'idle', 108).setDepth(8);
    this.mon = KG.art.make(this, mx, fy, 'b' + m, 0, boss ? 132 : 108).setDepth(8).setFlipX(true);
    this.tweens.add({ targets: this.hero, scaleY: this.hero.artScale * 1.025, duration: 780, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.mon, scaleY: this.mon.artScale * 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.txt(mx, MIS.y + MIS.h - 146, MON_NAME[m] || 'ตัวรก', { size: 16, color: '#c9202f', center: true, ox: 0.5 }).setDepth(9);
    const n = this.lv.checks.length; this.pips = [];
    for (let i = 0; i < n; i++) this.pips.push(KG.ui.icon(this, 'heart', mx + (i - (n - 1) / 2) * 22, MIS.y + MIS.h - 118, 20, 0xe0243d).setDepth(9));
  }
}
