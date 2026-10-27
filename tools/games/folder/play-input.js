/* ===== Techno Folder: การแตะ ลากวาง เมนูคลิกขวา และกล่องเลือก (ต่อเติมให้ PlayScene) ===== */
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

Object.assign(PlayScene.prototype, {
  busy() { return !!(this._dlg || this._menu || this._modal || this.done || this.paused); },

  /* ---------- แตะและลากไอคอน ---------- */
  itemDown(id, p) {
    if (this.busy() || !this.node(id)) return;
    if (p.rightButtonDown()) { if (!this.sel.includes(id)) { this.sel = [id]; this.refreshSel(); } this.openMenu(p.worldX, p.worldY, this.itemMenu(id)); return; }
    const ev = p.event || {}; this.press = { id, x: p.worldX, y: p.worldY, t0: this.time.now, ctrl: !!(ev.ctrlKey || ev.metaKey) };
  },
  onMove(p) {
    if (this.press && !this.drag) {
      const dx = p.worldX - this.press.x, dy = p.worldY - this.press.y;
      if (dx * dx + dy * dy > 150 && p.isDown && this.cur !== FD.BIN && !this.busy()) this.startDrag();
    }
    if (this.drag) { this.drag.ghost.setPosition(p.worldX + 6, p.worldY + 8); this.updateDropHL(p.worldX, p.worldY); }
  },
  startDrag() {
    const pr = this.press, id = pr.id;
    if (!this.sel.includes(id)) { this.sel = [id]; this.refreshSel(); }
    const ids = this.sel.slice(), ghost = this.add.container(pr.x, pr.y).setDepth(400);
    ids.slice(0, 3).forEach((i, k) => { const n = this.node(i), t = n.kind === 'd' ? folderTex(this, 72, 'normal') : fileTex(this, n.icon || 'doc', 72); ghost.add(this.add.image(k * 7, k * 7, t).setDisplaySize(62, 62).setAlpha(0.92)); });
    if (ids.length > 1) { ghost.add(this.add.circle(30, -22, 16, 0xe0243d).setStrokeStyle(2, 0xffffff)); ghost.add(KG.txt(this, 30, -22, String(ids.length), { size: 18, color: '#ffffff', center: true, middle: true })); }
    ids.forEach(i => { if (this.itemObjs[i]) this.itemObjs[i].c.setAlpha(0.45); });
    this.drag = { ids, ghost }; this.press = null; KG.audio.play('pop');
  },
  onUp(p) {
    if (this.drag) {
      const d = this.drag; this.drag = null; this.dropHL.clear(); d.ghost.destroy(); d.ids.forEach(i => { if (this.itemObjs[i]) this.itemObjs[i].c.setAlpha(1); });
      const t = this.findDrop(p.worldX, p.worldY, d.ids); if (t) { if (t.id === FD.BIN) this.doDelete(d.ids); else this.doMove(d.ids, t.id, 'drag'); }
      return;
    }
    if (this.press) {
      const pr = this.press; this.press = null;
      if (p.wasTouch && this.time.now - pr.t0 > 650) { if (!this.sel.includes(pr.id)) { this.sel = [pr.id]; this.refreshSel(); } this.openMenu(pr.x, pr.y, this.itemMenu(pr.id)); return; }   // กดค้างบนจอสัมผัสแล้วปล่อย = เมนูคลิกขวา
      this.clickItem(pr.id, pr.ctrl);
    }
  },
  findDrop(x, y, exclude) {
    for (const kind of ['item', 'nav', 'crumb']) for (const d of this.drops) if (d.kind === kind && !(exclude || []).includes(d.id) && inRect(x, y, d.rect)) return d;
    return null;
  },
  updateDropHL(x, y) {
    const g = this.dropHL; g.clear(); const t = this.findDrop(x, y, this.drag.ids); if (!t) return;
    g.fillStyle(0x2b8cff, 0.18); g.fillRoundedRect(t.rect.x - 2, t.rect.y - 2, t.rect.w + 4, t.rect.h + 4, 8); g.lineStyle(3, 0x2b8cff, 1); g.strokeRoundedRect(t.rect.x - 2, t.rect.y - 2, t.rect.w + 4, t.rect.h + 4, 8);
  },
  clickItem(id, ctrl) {
    const now = this.time.now, dbl = this.lastTap && this.lastTap.id === id && now - this.lastTap.t < 450; this.lastTap = { id, t: now };
    if (dbl && !this.multi) { this.lastTap = null; this.openItem(id); return; }
    if (this.multi || ctrl) { const i = this.sel.indexOf(id); if (i >= 0) this.sel.splice(i, 1); else this.sel.push(id); } else this.sel = [id];
    KG.audio.play('tap'); this.refreshSel();
  },
  openItem(id) {
    const n = this.node(id); if (!n) return;
    if (n.kind === 'd') { this.sel = []; this.nav(id); } else { KG.ui.toast(this, 'ไฟล์นี้เป็นตัวอย่างในเกม ยังไม่ต้องเปิดดูข้างใน'); }
  },
  toggleMulti() { this.multi = !this.multi; KG.audio.play('tap'); this.setMessage(this.multi ? 'เปิดโหมดเลือกหลายไฟล์แล้ว แตะไฟล์ทีละไฟล์เพื่อเลือก แตะซ้ำเพื่อยกเลิก' : this.lv.desc, 'info'); this.refreshSel(); },

  /* ---------- เมนูคลิกขวา / เมนูปุ่ม ใหม่ ---------- */
  emptyMenu() {
    if (this.cur === FD.BIN) return [{ label: 'กู้คืนรายการที่เลือก', icon: 'restore', enabled: this.sel.length > 0, fn: () => this.doRestoreBtn() }];
    return [{ label: 'ใหม่ › โฟลเดอร์', icon: 'newfolder', fn: () => this.doNewFolder() }, { label: 'วาง', icon: 'paste', enabled: !!this.fs.clip, fn: () => this.doPaste() }];
  },
  itemMenu(id) {
    if (this.cur === FD.BIN) return [{ label: 'กู้คืน', icon: 'restore', fn: () => this.doRestoreBtn() }];
    const n = this.node(id);
    return (n.kind === 'd' ? [{ label: 'เปิด', icon: 'newfolder', fn: () => this.openItem(id) }] : []).concat([
      { label: 'ตัด', icon: 'cut', fn: () => this.doCut() }, { label: 'คัดลอก', icon: 'copy', fn: () => this.doCopyBtn() },
      { label: 'เปลี่ยนชื่อ', icon: 'rename', enabled: this.sel.length === 1, fn: () => this.doRenameBtn() }, { label: 'ลบ', icon: 'trash', fn: () => this.doDelete(this.sel) }]);
  },
  newMenu() { if (this.busy()) return; this.openMenu(WIN.x + 14, GEO.cmdY + 58, [{ label: 'โฟลเดอร์', icon: 'newfolder', fn: () => this.doNewFolder() }]); },
  openMenu(x, y, items) {
    this.closeMenu(); if (!items.length) return; const w = 250, rh = 46, h = items.length * rh + 12; x = KG.clamp(x, 8, GW - w - 8); y = KG.clamp(y, 8, GH - h - 8);
    const root = this.add.container(0, 0).setDepth(500), dim = this.add.zone(GW / 2, GH / 2, GW, GH).setInteractive();
    dim.on('pointerdown', () => this.closeMenu()); root.add(dim);
    const g = this.add.graphics(); g.fillStyle(0x10204f, 0.28); g.fillRoundedRect(x + 4, y + 6, w, h, 10); g.fillStyle(0xffffff, 1); g.fillRoundedRect(x, y, w, h, 10); g.lineStyle(2, 0x9fb3d9, 1); g.strokeRoundedRect(x, y, w, h, 10); root.add(g);
    items.forEach((it, i) => {
      const ry = y + 6 + i * rh, en = it.enabled !== false, hl = this.add.rectangle(x + 6, ry, w - 12, rh - 2, 0xdcebff, 0).setOrigin(0, 0); root.add(hl);
      root.add(KG.ui.icon(this, it.icon, x + 30, ry + rh / 2 - 1, 24, en ? 0x1b2a6b : 0xb5c0da)); root.add(KG.txt(this, x + 54, ry + rh / 2, it.label, { size: 20, color: en ? INK : '#aab6d2', oy: 0.5 }));
      if (en) { const z = this.add.zone(x + w / 2, ry + rh / 2, w - 12, rh).setInteractive({ useHandCursor: true }); root.add(z); z.on('pointerover', () => hl.setFillStyle(0xdcebff, 1)); z.on('pointerout', () => hl.setFillStyle(0xdcebff, 0)); z.on('pointerdown', () => { this.closeMenu(); it.fn(); }); }
    });
    this._menu = root; KG.audio.play('pop');
  },
  closeMenu() { if (this._menu) { const r = this._menu; this._menu = null; r.setVisible(false); this.time.delayedCall(300, () => r.destroy(true)); } },

  /* ---------- กล่องเลือกคำตอบ (ชื่อโฟลเดอร์ / คำถามที่อยู่) ---------- */
  // o: { title, body, options:[ข้อความ...], cancel:'ข้อความปุ่มปิด', onPick(i) => true ถ้าปิดกล่อง, onCancel }
  choose(o) {
    this.closeDialog(); const w = 660, bodyW = w - 80, body = o.body ? KG.wrap(o.body, bodyW, '400 21px Kanit') : '', bl = body ? body.split('\n').length : 0;
    const optH = 60, h = 78 + bl * 30 + 14 + o.options.length * optH + (o.cancel ? 70 : 24), x = GW / 2 - w / 2, y = GH / 2 - h / 2;
    const root = this.add.container(0, 0).setDepth(2000), dim = this.add.rectangle(GW / 2, GH / 2, GW + 40, GH + 40, 0x10204f, 0.55).setInteractive(); root.add(dim);
    root.add(KG.ui.panel(this, x, y, w, h, { accent: '#2b8cff', accent2: '#2b8cff', cuts: [22, 0, 22, 0], fill: ['#ffffff', '#e2f1ff'], alpha: 1 }));
    root.add(KG.txt(this, GW / 2, y + 26, o.title, { size: 32, color: INK, center: true, ox: 0.5 }));
    if (body) root.add(KG.txt(this, GW / 2, y + 80, body, { size: 21, weight: 400, color: '#33456f', center: true, ox: 0.5, lineSpacing: 6 }));
    let by = y + 80 + bl * 30 + 14 + optH / 2 - 4;
    o.options.forEach((label, i) => { const b = new KG.ui.Button(this, GW / 2, by, 540, 48, { label, style: 'cyan', size: 24, slant: 10, onClick: () => { const close = o.onPick(i); if (close) this.closeDialog(); } }); root.add(b); by += optH; });
    if (o.cancel) { const b = new KG.ui.Button(this, GW / 2, y + h - 40, 280, 42, { label: o.cancel, style: 'ghost', size: 20, slant: 8, onClick: () => { this.closeDialog(); if (o.onCancel) o.onCancel(); } }); root.add(b); }
    root.setAlpha(0); this.tweens.add({ targets: root, alpha: 1, duration: 140 }); this._dlg = root; KG.audio.play('pop');
  },
  closeDialog() { if (this._dlg) { const r = this._dlg; this._dlg = null; r.setVisible(false); this.time.delayedCall(300, () => r.destroy(true)); } },

  /* ---------- แป้นพิมพ์ลัดแบบ Windows ---------- */
  onKey(e) {
    if (this._dlg || this._modal || this.done || this.paused) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.code === 'KeyX') { e.preventDefault && e.preventDefault(); this.doCut(); }
    else if (ctrl && e.code === 'KeyC') { e.preventDefault && e.preventDefault(); this.doCopyBtn(); }
    else if (ctrl && e.code === 'KeyV') { e.preventDefault && e.preventDefault(); this.doPaste(); }
    else if (ctrl && e.code === 'KeyA') { e.preventDefault && e.preventDefault(); this.sel = FD.kids(this.fs, this.cur); this.refreshSel(); }
    else if (e.code === 'Delete') this.doDelete(this.sel);
    else if (e.code === 'F2') this.doRenameBtn();
    else if (e.code === 'Enter' && this.sel.length === 1) this.openItem(this.sel[0]);
    else if (e.code === 'Backspace') { e.preventDefault && e.preventDefault(); this.back(); }
  }
});
