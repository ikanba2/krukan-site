/* ===== Techno Parts: การแตะและลากวางชิ้นส่วน (ต่อเติมให้ PlayScene) =====
   ลากชิ้นไปวางที่ที่ต้องการ หรือแตะชิ้นก่อนแล้วแตะที่วาง (เหมาะกับจอสัมผัสและเด็กที่ยังลากไม่คล่อง) */
Object.assign(PlayScene.prototype, {
  busy() { return !!(this._modal || this.done || this.paused); },

  itemDown(id, p) {
    if (this.busy() || !this.itemOf(id)) return;
    this.press = { id, x: p.worldX, y: p.worldY, t0: this.time.now };
  },
  onMove(p) {
    if (this.press && !this.drag) {
      const dx = p.worldX - this.press.x, dy = p.worldY - this.press.y;
      if (dx * dx + dy * dy > 100 && p.isDown && !this.busy()) this.startDrag();
    }
    if (this.drag) { this.drag.ghost.setPosition(p.worldX + 4, p.worldY - 8); this.updateDropHL(p.worldX, p.worldY); }
  },
  startDrag() {
    const id = this.press.id, it = this.itemOf(id), pr = this.press; this.press = null;
    const ghost = this.add.container(pr.x, pr.y).setDepth(400);
    if (it.dev) { ghost.add(this.add.image(-(56 + 6), -(45 + 4), hexTile(this, 112, 90, 'sel')).setOrigin(0, 0).setDisplaySize(124, 106)); ghost.add(this.add.image(0, -14, PTI.tex(this, it.ic, 96)).setDisplaySize(50, 50)); ghost.add(nameLabel(this, it.n, 90, 13).setPosition(0, 10)); }
    else { ghost.add(this.add.image(-(100 + 6), -(30 + 4), cardTex(this, 200, 60, 'sel')).setOrigin(0, 0).setDisplaySize(212, 74)); const t = KG.txt(this, 6, 0, gwrap(it.n, 160, '600 16px Kanit'), { size: 16, color: INK, center: true, ox: 0.5, oy: 0.5 }); t.setLineSpacing(-2); ghost.add(t); }
    ghost.setAlpha(0.93); this.tweens.add({ targets: ghost, scaleX: 1.06, scaleY: 1.06, duration: 120 });
    this.drag = { id, ghost }; this.selItem = null; if (this.views[id]) this.views[id].setAlpha(0.3); KG.audio.play('pop'); this.hl = null; this.applyHighlight(); this.paintSel(); this.paintZones();
    // ไฮไลต์ที่วางที่รับได้ตอนกำลังลาก
    this.lv.zones.forEach(z => { if (z.kind !== 'tray' && this.zoneGfx[z.id] && PT.canDrop(this.lv, this.st, id, z.id).ok) this.styleZone(z.id, 'hl'); });
  },
  onUp(p) {
    if (this.drag) {
      const d = this.drag; this.drag = null; this.dropHL.clear(); d.ghost.destroy(); this.lastDragEnd = this.time.now;
      const zid = this.findDrop(p.worldX, p.worldY); this.paintZones();
      if (zid) this.tryDrop(d.id, zid); else this.renderItems();
      return;
    }
    if (this.press) { const pr = this.press; this.press = null; this.tapItem(pr.id); }
  },
  findDrop(x, y) {
    for (const z of this.lv.zones) if (z.kind !== 'tray' && this.zr[z.id] && inRect(x, y, this.zr[z.id])) return z.id;
    if (this.zr.tray && inRect(x, y, this.zr.tray)) return 'tray';
    return null;
  },
  updateDropHL(x, y) {
    const g = this.dropHL; g.clear(); const zid = this.findDrop(x, y); if (!zid || zid === 'tray') return; const r = this.zr[zid], ok = PT.canDrop(this.lv, this.st, this.drag.id, zid).ok;
    g.fillStyle(ok ? 0x16c7a8 : 0xff5e6e, 0.16); g.fillRoundedRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 16); g.lineStyle(4, ok ? 0x16c7a8 : 0xff5e6e, 1); g.strokeRoundedRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 16);
  },

  /* ---------- แตะ ---------- */
  tapItem(id) {
    const it = this.itemOf(id); if (this.busy() || !it) return;
    if (this.selItem === id) { this.selItem = null; KG.audio.play('tap'); this.paintSel(); this.paintZones(); return; }
    this.selItem = id; KG.audio.play('tap'); this.hl = null; this.applyHighlight();
    this.setMessage(it.dev ? it.n + ': ' + it.use + ' · แตะที่ที่ต้องการวาง หรือลากไปวางก็ได้' : 'แตะที่ขั้นตอนที่ต้องการวางการ์ดนี้ หรือลากไปวางก็ได้', 'info'); this.paintSel(); this.paintZones();
  },
  tapZone(zid) {
    if (this.busy() || this.drag || this.time.now - (this.lastDragEnd || 0) < 250) return;
    if (!this.selItem) return; const id = this.selItem; this.tryDrop(id, zid);
  },
  // ลองวาง: ถูก = เก็บเข้าที่ · ผิด = เด้งกลับพร้อมเหตุผล (ที่ไม่ใช่ข้อผิด เช่น ช่องเต็ม ไม่หักดาว)
  tryDrop(id, zid) {
    const it = this.itemOf(id), z = zid === 'tray' ? null : this.zoneOf(zid), r = PT.drop(this.lv, this.st, id, zid);
    if (r.ok) {
      this.selItem = null; this.hl = null; this.applyHighlight();
      if (!z) { KG.audio.play('tap'); this.setMessage(it.n + ' กลับไปอยู่ในถาดแล้ว', 'info'); this.renderItems(); this.refreshMission(); return; }
      this.ops++; KG.audio.play('confirm'); this.setMessage(this.okMessage(it, z), 'good'); this.renderItems(); this.popView(id); this.refreshMission(); return;
    }
    if (r.why === 'same') { this.selItem = null; this.renderItems(); return; }
    if (!r.soft) { this.fail(r.msg, id); return; }
    KG.audio.play('denied'); this.setMessage(r.msg, 'bad'); KG.ui.toast(this, r.msg.length > 60 ? r.msg.slice(0, 58) + '…' : r.msg); this.selItem = null; this.renderItems(); this.shakeView(id);
  },
  // ข้อความตอนวางถูก: บอกหน้าที่ของชิ้นนั้นด้วย เพื่อให้เด็กได้ความรู้ทุกครั้งที่ทำถูก
  okMessage(it, z) {
    const nm = '“' + it.n + '”';
    switch (z.kind) {
      case 'bin': return nm + ' ' + it.use + ' จึงอยู่ในถัง ' + z.label;
      case 'port': return 'เสียบ ' + nm + ' ที่ ' + E_PORTS[z.acc.v].n.replace(/ \(สี.*\)/, '') + ' แล้ว';
      case 'slot': return 'ติดตั้ง ' + nm + ' แล้ว: ' + PT.PARTS[z.acc.v].use;
      case 'step': return 'ถูกต้อง! ' + (it.use || it.n);
      case 'cart': return 'ใส่ ' + nm + ' ลงตะกร้าแล้ว: ' + it.use;
    }
    return 'ถูกต้อง!';
  },
  popView(id) { const v = this.views[id]; if (!v) return; v.setScale(0.7); this.tweens.add({ targets: v, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' }); },
  shakeView(id) { const v = this.views[id]; if (!v) return; const x = v.x; this.tweens.add({ targets: v, x: x + 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { v.x = x; } }); }
});
