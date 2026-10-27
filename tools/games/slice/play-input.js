/* ===== Techno Slice: การแตะและลากวางชิ้นส่วน (ต่อเติมให้ PlayScene) =====
   ลากชิ้นไปวางที่ต้องการ หรือแตะชิ้นก่อนแล้วแตะที่วาง (เหมาะกับจอสัมผัสและเด็กที่ยังลากไม่คล่อง) */
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
    if (it.kind === 'slice') { const R = 40, o = wedgeOrigin(R); ghost.add(this.add.image(0, 24, wedgeTex(this, it.f.den, R, toneOf(it.f.den))).setOrigin(o.x, o.y).setDisplaySize(2 * R + 10, R + 10)); ghost.add(KG.txt(this, 0, 36, '1/' + it.f.den, { size: 20, color: INK, center: true, ox: 0.5, oy: 0.5, stroke: true }).setDepth(2)); }
    else if (it.kind === 'num') { ghost.add(this.add.image(-3, -3, coinTex(this, 56)).setDisplaySize(68, 70)); ghost.add(KG.txt(this, 0, -2, it.n, { size: 32, color: INK, center: true, ox: 0.5, oy: 0.5 })); }
    else { ghost.add(this.add.image(-62, -47, cardBg(this, 112, 88, 'sel')).setOrigin(0, 0).setDisplaySize(124, 102)); const lab = itemLabel(this, it, 0, 0, 28); ghost.add(lab); if (lab.w > 100) lab.setScale(100 / lab.w); }
    ghost.setAlpha(0.94); this.tweens.add({ targets: ghost, scaleX: 1.08, scaleY: 1.08, duration: 120 });
    this.drag = { id, ghost }; this.selItem = null; if (this.views[id]) this.views[id].setAlpha(0.3); KG.audio.play('pop'); this.hl = null; this.applyHighlight(); this.paintSel(); this.paintZones();
    this.lv.zones.forEach(z => { if (z.kind !== 'tray' && this.zoneGfx[z.id] && SL.canDrop(this.lv, this.st, id, z.id).ok) this.styleZone(z.id, 'hl'); });
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
    const g = this.dropHL; g.clear(); const zid = this.findDrop(x, y); if (!zid || zid === 'tray') return; const r = this.zr[zid], ok = SL.canDrop(this.lv, this.st, this.drag.id, zid).ok, col = ok ? 0x22a04a : 0xe0243d;
    g.fillStyle(col, 0.14); g.lineStyle(4, col, 1);
    if (r.circle) { g.fillCircle(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 3); g.strokeCircle(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 3); }
    else { g.fillRoundedRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 16); g.strokeRoundedRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 16); }
  },

  /* ---------- แตะ ---------- */
  tapItem(id) {
    const it = this.itemOf(id); if (this.busy() || !it) return;
    if (this.selItem === id) { this.selItem = null; KG.audio.play('tap'); this.paintSel(); this.paintZones(); return; }
    this.selItem = id; KG.audio.play('tap'); this.hl = null; this.applyHighlight();
    const what = it.kind === 'slice' ? 'ชิ้นพิซซ่า 1/' + it.f.den + ' (ตัดจากพิซซ่าแบ่ง ' + it.f.den + ' ส่วน)' : it.kind === 'num' ? 'ตัวเลข ' + it.n : 'การ์ด ' + it.n;
    this.setMessage(what + ' · แตะที่ที่ต้องการวาง หรือลากไปวางก็ได้', 'info'); this.paintSel(); this.paintZones();
  },
  tapZone(zid) {
    if (this.busy() || this.drag || this.time.now - (this.lastDragEnd || 0) < 250) return;
    if (!this.selItem) return; const id = this.selItem; this.tryDrop(id, zid);
  },
  // ลองวาง: ถูก = เก็บเข้าที่ · ผิด = เด้งกลับพร้อมเหตุผล (ที่ไม่ใช่ข้อผิด เช่น จานเต็ม ไม่หักดาว)
  tryDrop(id, zid) {
    const it = this.itemOf(id), z = zid === 'tray' ? null : this.zoneOf(zid), r = SL.drop(this.lv, this.st, id, zid);
    if (r.ok) {
      this.selItem = null; this.hl = null; this.applyHighlight();
      if (!z) { KG.audio.play('tap'); this.setMessage('เก็บชิ้นกลับไปไว้ในถาดแล้ว', 'info'); this.renderItems(); this.refreshMission(); return; }
      this.ops++; KG.audio.play('confirm'); this.setMessage(this.okMessage(it, z), 'good'); this.renderItems(); this.popView(id); this.refreshMission(); return;
    }
    if (r.why === 'same') { this.selItem = null; this.renderItems(); return; }
    if (!r.soft) { this.fail(r.msg, id); return; }
    KG.audio.play('denied'); this.setMessage(r.msg, 'bad'); KG.ui.toast(this, r.msg.length > 60 ? r.msg.slice(0, 58) + '…' : r.msg); this.selItem = null; this.renderItems(); this.shakeView(id);
  },
  // ข้อความตอนวางถูก: ย้ำความหมายของเศษส่วนทุกครั้งที่ทำถูก
  okMessage(it, z) {
    const have = SL.occ(this.st, z.id).length;
    switch (z.kind) {
      case 'plate': return 'ใส่ชิ้น 1/' + z.q.b + ' แล้ว ตอนนี้บนจานมี ' + have + ' ชิ้น คือ ' + have + '/' + z.q.b + ' ของพิซซ่า' + (have < z.q.a ? ' ต้องการ ' + z.q.a + '/' + z.q.b : ' ครบตามที่สั่ง');
      case 'box': return 'ใส่ชิ้น 1/' + z.acc.v + ' ลงกล่องแล้ว ในกล่องมี ' + have + ' ชิ้นจาก ' + z.acc.v + ' ชิ้น' + (have === z.acc.v ? ' กล่องเต็ม คือ 1 กล่อง' : '');
      case 'pic': return z.pic.conv ? (z.slot === 'imp' ? 'เศษเกิน ' + it.n + ' ถูกต้อง: นับชิ้นทั้งหมดเป็นชิ้นละ 1/' + z.pic.d : 'จำนวนคละ ' + it.n + ' ถูกต้อง: เต็มกล่อง ' + z.pic.whole + ' กล่อง เหลือ ' + z.pic.rest + ' ชิ้น') : 'ถูกต้อง! ภาพนี้คือ ' + z.pic.n + '/' + z.pic.d + (it.f.val && it.f.frac !== z.pic.n + '/' + z.pic.d ? ' เท่ากับ ' + it.n : '');
      case 'tick': return 'ถูกต้อง! ' + it.n + ' อยู่ตรงจุดนี้บนเส้นจำนวน';
      case 'rank': return 'ถูกต้อง! ' + it.n + ' อยู่ลำดับที่ ' + z.acc.v;
      case 'ans': return 'ใส่ ' + it.n + ' ที่ช่อง' + z.part + 'แล้ว';
    }
    return 'ถูกต้อง!';
  },
  popView(id) { const v = this.views[id]; if (!v) return; v.setScale(0.7); this.tweens.add({ targets: v, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' }); },
  shakeView(id) { const v = this.views[id]; if (!v) return; const x = v.x; this.tweens.add({ targets: v, x: x + 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { v.x = x; } }); }
});
