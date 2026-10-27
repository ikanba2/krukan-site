/* ===== บทสอนเล่นแบบลงมือทำ (ใช้ซ้ำทุกเกม) =====
   ฉากมืดลงแล้วเปิดช่องสว่างเฉพาะจุดที่ต้องกด พร้อมกล่องคำอธิบายที่มี Techno คอยบอก
   ขั้นตอนแบบ 'next' กดปุ่มถัดไปเพื่อไปต่อ แบบ 'wait' ต้องทำตามจริง (until() คืนค่าจริง) จึงไปต่อได้ ข้ามบทสอนได้ทุกเมื่อ
   step: { text, target: วัตถุ | {x,y,w,h} | ฟังก์ชันคืนค่าสองแบบนั้น | null, pad, mode: 'next'|'wait', until, pos: 'top'|'bottom'|'auto', before, after, block }
   block (เฉพาะ wait): true = กั้นไม่ให้กดนอกช่องสว่าง (ค่าเริ่มต้นเมื่อมี target), false = ไม่กั้น */
KG.rectOf = function (o) {
  if (!o) return null;
  if (typeof o === 'function') return KG.rectOf(o());
  if (o.w != null && o.h != null && o.x != null && o.y != null && !o.getBounds) return o;
  if (o.T && o.w != null) return { x: o.x - o.w / 2, y: o.y - o.h / 2, w: o.w, h: o.h + (o.D || 0) };
  if (o.getBounds) { const b = o.getBounds(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }
  return null;
};

KG.Tutor = class {
  constructor(scene, steps, o) {
    this.scene = scene; this.steps = steps; this.o = o || {}; this.i = -1; this.dead = false; this.objs = [];
    this.root = scene.add.container(0, 0).setDepth(2500);
    this.dim = []; this.frame = scene.add.graphics(); this.root.add(this.frame);
    this.bubble = null; this.poll = null;
    this.next();
  }
  get cur() { return this.steps[this.i]; }
  clearStep() {
    if (this.poll) { this.poll.remove(); this.poll = null; }
    this.dim.forEach(d => d.destroy()); this.dim = [];
    if (this.bubble) { this.bubble.destroy(true); this.bubble = null; }
    if (this.arrow) { this.arrow.destroy(); this.arrow = null; }
    this.frame.clear(); if (this._frameTw) { this._frameTw.remove(); this._frameTw = null; }
  }
  next() {
    if (this.dead) return;
    const prev = this.cur; if (prev && prev.after) prev.after();
    this.clearStep(); this.i++;
    if (this.i >= this.steps.length) { this.finish(true); return; }
    const st = this.cur; if (st.before) st.before();
    this.show(st);
  }
  show(st) {
    const s = this.scene, W = KG.GW, H = KG.GH, wait = st.mode === 'wait';
    const r = KG.rectOf(st.target), pad = st.pad == null ? 8 : st.pad;
    const hole = r ? { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 } : null;
    const block = st.block != null ? st.block : !!hole;
    const mk = (x, y, w, h) => {
      if (w <= 0 || h <= 0) return;
      const d = s.add.rectangle(x, y, w, h, KG.SKIN.tutorDim, KG.SKIN.tutorDimA).setOrigin(0, 0);
      if (block) d.setInteractive();
      this.root.add(d); this.dim.push(d);
    };
    const dimOn = st.dim !== false;
    if (!dimOn) { /* ไม่หรี่ฉาก: ใช้เฉพาะกรอบไฮไลต์ */ }
    else if (hole) { mk(0, 0, W, hole.y); mk(0, hole.y + hole.h, W, H - (hole.y + hole.h)); mk(0, hole.y, hole.x, hole.h); mk(hole.x + hole.w, hole.y, W - (hole.x + hole.w), hole.h); }
    else if (!wait || block) mk(0, 0, W, H);
    if (hole) {
      const g = this.frame, x = hole.x, y = hole.y, w = hole.w, h = hole.h, c = Phaser.Display.Color.HexStringToColor(KG.SKIN.tutorAccent).color;
      g.lineStyle(4, c, 1); g.strokeRect(x, y, w, h);
      g.lineStyle(8, c, 0.25); g.strokeRect(x - 3, y - 3, w + 6, h + 6);
      [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(p => { g.lineStyle(6, KG.SKIN.pop ? 0x2b3f9c : 0xffffff, 1); g.beginPath(); g.moveTo(p[0], p[1] + p[3] * 18); g.lineTo(p[0], p[1]); g.lineTo(p[0] + p[2] * 18, p[1]); g.strokePath(); });
      g.setAlpha(1); this._frameTw = s.tweens.add({ targets: g, alpha: 0.45, duration: 600, yoyo: true, repeat: -1 });
    }
    if (st.compact) { this.showCompact(st, hole); return; }
    // กล่องคำอธิบาย
    const bw = 560, text = KG.wrap(st.text, bw - 150, '400 22px Kanit'), lines = text.split('\n').length, bh = Math.max(132, 44 + lines * 31 + 58);
    let bx = (W - bw) / 2, by = H - bh - 30;
    const pos = st.pos || 'auto';
    if (hole) {
      const below = hole.y + hole.h + bh + 40 < H, above = hole.y - bh - 40 > 0;
      if (pos === 'top' || (pos === 'auto' && !below && above) || (pos === 'auto' && hole.y > H * 0.52 && above)) by = Math.max(14, hole.y - bh - 30);
      else if (pos === 'bottom' || below) by = Math.min(H - bh - 14, hole.y + hole.h + 30);
      const cx = hole.x + hole.w / 2; bx = KG.clamp(cx - bw / 2, 14, W - bw - 14);
      this.addArrow(hole, by > hole.y);
    } else by = pos === 'top' ? 34 : (H - bh) / 2 - 10;
    if (st.at) { if (st.at.x != null) bx = st.at.x; if (st.at.y != null) by = st.at.y; }
    const b = this.bubble = s.add.container(bx, by); this.root.add(b);
    b.add(KG.ui.panel(s, 0, 0, bw, bh, { accent: KG.SKIN.tutorAccent, cuts: [22, 0, 22, 0], fill: KG.SKIN.tutorFill }));
    const fr = s.add.image(66, bh / 2, KG.tex(s, 'tutorframe' + KG.SKIN.name, 100, 100, ctx => { KG.ui.cutPath(ctx, 2, 2, 96, 96, [14, 0, 14, 0]); ctx.fillStyle = KG.SKIN.tutorSlot; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = KG.SKIN.tutorAccent; ctx.stroke(); })).setDisplaySize(100, 100); b.add(fr);
    const hid = this.o.hero || (KG.ART && (KG.ART.h0 ? 'h0' : KG.ART.h1 ? 'h1' : KG.ART.h2 ? 'h2' : null)), hero = hid ? KG.art.make(s, 66, bh / 2 + 44, hid, 'idle', 66) : null; if (hero) { b.add(hero); b.hero = hero; s.tweens.add({ targets: hero, y: hero.y - 3, duration: 500, yoyo: true, repeat: -1 }); }
    b.add(KG.txt(s, 132, 12, 'บทสอน ' + (this.i + 1) + '/' + this.steps.length, { size: 16, color: KG.SKIN.tutorAccent }));
    b.add(KG.txt(s, 132, 34, text, { size: 22, weight: 400, color: KG.SKIN.text, lineSpacing: 6 }));
    const skip = new KG.ui.Button(s, bw - 88, bh - 30, 150, 38, { label: 'ข้ามบทสอน', style: 'ghost', size: 16, slant: 6, onClick: () => this.finish(false) }); b.add(skip);
    if (!wait) { const nb = new KG.ui.Button(s, bw - 250, bh - 30, 160, 42, { label: this.i === this.steps.length - 1 ? 'เริ่มเลย!' : 'ถัดไป', icon: 'chevR', style: 'primary', size: 20, slant: 8, onClick: () => { KG.audio.play('confirm'); this.next(); } }); b.add(nb); nb.pulse(); }
    b.setAlpha(0).setScale(0.94); s.tweens.add({ targets: b, alpha: 1, scaleX: 1, scaleY: 1, duration: 220, ease: 'Back.easeOut' });
    KG.audio.play('pop');
    if (wait && st.until) this.poll = s.time.addEvent({ delay: 120, loop: true, callback: () => { if (!this.dead && st.until()) { KG.audio.play('star', { i: Math.min(4, this.i) }); this.next(); } } });
  }
  // แถบคำอธิบายแบบแคบหนึ่งบรรทัด (ใช้ตอนต้องมองเห็นฉากเกมตลอด เช่น บทสอนพิมพ์)
  showCompact(st, hole) {
    const s = this.scene, W = KG.GW, bw = Math.min(1100, W - 60), bh = 62, bx = (W - bw) / 2, by = st.at ? st.at.y : 384;
    const b = this.bubble = s.add.container(bx, by); this.root.add(b);
    b.add(KG.ui.panel(s, 0, 0, bw, bh, { accent: KG.SKIN.tutorAccent, cuts: [14, 0, 14, 0], fill: KG.SKIN.tutorFill }));
    const hid = this.o.hero || (KG.ART && (KG.ART.h0 ? 'h0' : KG.ART.h1 ? 'h1' : KG.ART.h2 ? 'h2' : null));
    if (hid) { const hero = KG.art.make(s, 40, bh - 6, hid, 'idle', 44); b.add(hero); s.tweens.add({ targets: hero, y: hero.y - 3, duration: 500, yoyo: true, repeat: -1 }); }
    b.add(KG.txt(s, 78, bh / 2, st.text, { size: 21, weight: 400, color: KG.SKIN.text, oy: 0.5, width: bw - 290 }));
    b.add(KG.txt(s, bw - 190, bh / 2, 'บทสอน ' + (this.i + 1) + '/' + this.steps.length, { size: 15, color: KG.SKIN.tutorAccent, oy: 0.5, ox: 1 }));
    const skip = new KG.ui.Button(s, bw - 84, bh / 2, 132, 34, { label: 'ข้ามบทสอน', style: 'ghost', size: 15, slant: 6, onClick: () => this.finish(false) }); b.add(skip);
    b.setAlpha(0); s.tweens.add({ targets: b, alpha: 1, duration: 200 }); KG.audio.play('pop');
    if (st.until) this.poll = s.time.addEvent({ delay: 120, loop: true, callback: () => { if (!this.dead && st.until()) { KG.audio.play('star', { i: Math.min(4, this.i) }); this.next(); } } });
  }
  addArrow(hole, bubbleBelow) {
    const s = this.scene, x = hole.x + hole.w / 2, y = bubbleBelow ? hole.y + hole.h + 4 : hole.y - 4;
    const a = KG.ui.icon(s, bubbleBelow ? 'chevU' : 'chevD', x, y + (bubbleBelow ? 14 : -14), 34, Phaser.Display.Color.HexStringToColor(KG.SKIN.tutorAccent).color); this.root.add(a); this.arrow = a;
    s.tweens.add({ targets: a, y: a.y + (bubbleBelow ? 8 : -8), duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  finish(done) {
    if (this.dead) return; this.dead = true;
    const prev = this.cur; if (done && prev && prev.after) prev.after();
    this.clearStep(); this.root.destroy(true);
    if (this.o.onDone) this.o.onDone(done);
    if (done) KG.ui.toast(this.scene, 'จบบทสอนแล้ว ลุยเลย!', { accent: KG.SKIN.tutorAccent, sfx: 'win' });
  }
  destroy() { if (this.dead) return; this.dead = true; this.clearStep(); this.root.destroy(true); }
};
