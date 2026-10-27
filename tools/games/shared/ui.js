/* ===== ชุด UI แบบเกม: แผงเหลี่ยมตัดมุม ปุ่ม 3 มิติ ไอคอนเวกเตอร์ หน้าต่าง ดาว แถบพลัง =====
   ทุกรูปวาดด้วย Canvas2D เป็นเท็กซ์เจอร์ที่ความละเอียดจริง (คูณ K) จึงคมทุกจอ ไม่มีมุมมนและไม่ซ้อนกล่องมนต์ */
(function () {
  'use strict';
  const C = KG.C, hex = KG.hex;
  const UI = KG.ui = {};

  /* ---------- ตัวช่วยวาด ---------- */
  // สี่เหลี่ยมมุมโค้งแบบวาดเอง (ไม่พึ่ง ctx.roundRect ที่เบราว์เซอร์เก่าไม่มี)
  function rrect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0); ctx.lineTo(x + w, y + h - r); ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI); ctx.lineTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); ctx.closePath();
  }
  function cutPath(ctx, x, y, w, h, cuts) {
    if (KG.SKIN.round) { rrect(ctx, x, y, w, h, Math.max(14, cuts[0], cuts[1], cuts[2], cuts[3]) * 1.15); return; }   // ธีมมน: ใช้ขนาดมุมเดิมเป็นรัศมี
    const tl = cuts[0], tr = cuts[1], br = cuts[2], bl = cuts[3];
    ctx.beginPath(); ctx.moveTo(x + tl, y); ctx.lineTo(x + w - tr, y); ctx.lineTo(x + w, y + tr); ctx.lineTo(x + w, y + h - br);
    ctx.lineTo(x + w - br, y + h); ctx.lineTo(x + bl, y + h); ctx.lineTo(x, y + h - bl); ctx.lineTo(x, y + tl); ctx.closePath();
  }
  function lin(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
  UI.cutPath = cutPath; UI.lin = lin; UI.rrect = rrect;

  /* ---------- แผง ---------- */
  UI.panelTex = function (scene, w, h, o) {
    o = o || {}; const SK = KG.SKIN;
    const pop = SK.pop && o.pop !== false;
    const m = pop ? 12 : (o.glow === false ? 3 : 18), cuts = o.cuts || [22, 0, 22, 0];
    const acc = o.accent || SK.panelAccent, acc2 = o.accent2 || SK.panelAccent2, fill = o.fill || SK.panelFill, a = o.alpha == null ? SK.panelAlpha : o.alpha;
    const key = ['panel', pop ? 'pop' : 'dk', KG.SKIN.round ? 'rd' : 'ct', w, h, cuts.join(','), acc, acc2, fill.join(','), a, o.bracket !== false, o.glow !== false].join('|');
    const full = KG.tex(scene, key, w + m * 2, h + m * 2, ctx => {
      ctx.translate(m, m);
      if (pop) {   // สไตล์การ์ตูน: เงาแข็งด้านล่าง พื้นขาวไล่สีฟ้า ขอบหนาสีน้ำเงินเข้ม แถบสีสดด้านบน
        const sh = o.shadow == null ? 7 : o.shadow;
        cutPath(ctx, 0, sh, w, h, cuts); ctx.fillStyle = 'rgba(24,44,120,.32)'; ctx.fill();
        cutPath(ctx, 0, 0, w, h, cuts); ctx.globalAlpha = a; ctx.fillStyle = lin(ctx, 0, 0, 0, h, [[0, fill[0]], [1, fill[1]]]); ctx.fill(); ctx.globalAlpha = 1;
        ctx.save(); cutPath(ctx, 0, 0, w, h, cuts); ctx.clip();
        ctx.fillStyle = lin(ctx, 0, 0, w, 0, [[0, acc], [1, acc2]]); ctx.fillRect(0, 0, w, Math.min(10, h * 0.12));
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, Math.min(10, h * 0.12), w, 3);
        ctx.restore();
        cutPath(ctx, 1.5, 1.5, w - 3, h - 3, cuts); ctx.lineWidth = 3.5; ctx.lineJoin = 'miter'; ctx.strokeStyle = o.edge || SK.edge; ctx.stroke();
        return;
      }
      if (o.glow !== false) { ctx.save(); ctx.shadowColor = acc; ctx.shadowBlur = 14; ctx.globalAlpha = 0.5; cutPath(ctx, 1, 1, w - 2, h - 2, cuts); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); }
      cutPath(ctx, 0, 0, w, h, cuts); ctx.globalAlpha = a; ctx.fillStyle = lin(ctx, 0, 0, 0, h, [[0, fill[0]], [1, fill[1]]]); ctx.fill(); ctx.globalAlpha = 1;
      ctx.save(); cutPath(ctx, 0, 0, w, h, cuts); ctx.clip();
      ctx.fillStyle = lin(ctx, 0, 0, 0, h * 0.45, [[0, 'rgba(255,255,255,.11)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h * 0.45);
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; cutPath(ctx, 4, 4, w - 8, h - 8, cuts); ctx.stroke();
      ctx.restore();
      cutPath(ctx, 1, 1, w - 2, h - 2, cuts); ctx.lineWidth = 2; ctx.strokeStyle = lin(ctx, 0, 0, w, h, [[0, acc], [1, acc2]]); ctx.globalAlpha = 0.92; ctx.stroke(); ctx.globalAlpha = 1;
      if (o.bracket !== false) {
        ctx.strokeStyle = acc; ctx.lineWidth = 3.5; ctx.lineJoin = 'miter';
        const tl = cuts[0], br = cuts[2], L = 34;
        ctx.beginPath(); ctx.moveTo(1, tl + L); ctx.lineTo(1, tl); ctx.lineTo(tl, 1); ctx.lineTo(tl + L, 1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w - 1, h - br - L); ctx.lineTo(w - 1, h - br); ctx.lineTo(w - br, h - 1); ctx.lineTo(w - br - L, h - 1); ctx.stroke();
      }
    });
    return { key: full, m };
  };
  UI.panel = function (scene, x, y, w, h, o) {
    const t = UI.panelTex(scene, w, h, o);
    return scene.add.image(x - t.m, y - t.m, t.key).setOrigin(0, 0).setDisplaySize(w + t.m * 2, h + t.m * 2);
  };

  /* ---------- ปุ่ม ---------- */
  const BTN = {
    primary: { top: '#ff7ab2', bot: '#d81a6b', base: '#640a34', edge: '#ffd6e8', text: '#ffffff', glow: '#ff3d8b' },
    cyan: { top: '#86fde9', bot: '#17b79a', base: '#0a4f46', edge: '#e2fff9', text: '#04221e', glow: '#4ef4d2' },
    sun: { top: '#ffec8a', bot: '#efae00', base: '#6e4d00', edge: '#fff8d6', text: '#2a1c00', glow: '#ffd34f' },
    ghost: { top: '#3a4ca6', bot: '#1b2768', base: '#080c28', edge: '#93a9ff', text: '#f4f7ff', glow: '#6f8cff' },
    danger: { top: '#ff8791', bot: '#d11a2e', base: '#5a0612', edge: '#ffd3d8', text: '#ffffff', glow: '#ff4d5e' },
    green: { top: '#a0ffb8', bot: '#22b653', base: '#0b4a20', edge: '#e5ffee', text: '#03210e', glow: '#5ef08a' },
    violet: { top: '#c7b4ff', bot: '#6d3fe0', base: '#2b1668', edge: '#efe8ff', text: '#ffffff', glow: '#a78bfa' }
  };
  UI.BTN = BTN;
  const BTN_DARK = JSON.parse(JSON.stringify(BTN));
  // เปลี่ยนชุดสีปุ่มตามธีม (เรียกจาก KG.useSkin)
  UI.applySkin = function () {
    const set = KG.SKIN.btn || BTN_DARK;
    Object.keys(set).forEach(k => { BTN[k] = Object.assign({ pad: 0 }, set[k]); });
  };
  UI.btnTex = function (scene, w, h, style, slant) {
    const S = BTN[style] || BTN.primary, D = Math.max(5, Math.round(h * 0.1)), m = 18, sk = slant == null ? Math.min(22, Math.round(h * 0.28)) : slant;
    const poly = (ctx, dx, dy) => { if (KG.SKIN.round) { rrect(ctx, m + dx, m + dy, w, h, Math.min(h / 2, 30)); return; } ctx.beginPath(); ctx.moveTo(m + sk + dx, m + dy); ctx.lineTo(m + w + dx, m + dy); ctx.lineTo(m + w - sk + dx, m + h + dy); ctx.lineTo(m + dx, m + h + dy); ctx.closePath(); };
    const W = w + m * 2, H = h + D + m * 2, id = [w, h, style, sk, KG.SKIN.name].join('|');
    const face = KG.tex(scene, 'btnface|' + id, W, H, ctx => {
      poly(ctx, 0, 0); ctx.fillStyle = lin(ctx, 0, m, 0, m + h, [[0, S.top], [1, S.bot]]); ctx.fill();
      ctx.save(); poly(ctx, 0, 0); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(0, m, W, 3);
      ctx.fillStyle = lin(ctx, 0, m, 0, m + h * 0.5, [[0, 'rgba(255,255,255,.18)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, m, W, h * 0.5);
      ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(0, m + h - 3, W, 3);
      ctx.restore();
      poly(ctx, 0, 0); ctx.lineWidth = 2; ctx.strokeStyle = S.edge; ctx.globalAlpha = 0.55; ctx.stroke();
    });
    const base = KG.tex(scene, 'btnbase|' + id, W, H, ctx => {
      poly(ctx, 0, D); ctx.fillStyle = S.base; ctx.fill();
      poly(ctx, 0, D); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke();
      ctx.save(); ctx.shadowColor = KG.SKIN.btnShadow; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6; ctx.globalCompositeOperation = 'destination-over'; poly(ctx, 0, D); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
    });
    const glow = KG.tex(scene, 'btnglow|' + id, W, H, ctx => {
      ctx.shadowColor = S.glow; ctx.shadowBlur = 20; poly(ctx, 0, 0); ctx.lineWidth = 3; ctx.strokeStyle = S.glow; ctx.stroke(); ctx.stroke();
    });
    return { face, base, glow, W, H, D, m, S };
  };

  UI.Button = class extends Phaser.GameObjects.Container {
    constructor(scene, x, y, w, h, o) {
      super(scene, x, y); o = o || {};
      const T = UI.btnTex(scene, w, h, o.style || 'primary', o.slant);
      this.w = w; this.h = h; this.D = T.D; this.T = T; this.cb = o.onClick; this.enabled = true; this.sfx = o.sfx || 'tap'; this.shift = 0;
      this.glow = scene.add.image(0, T.D / 2, T.glow).setDisplaySize(T.W, T.H).setAlpha(0);
      this.base = scene.add.image(0, T.D / 2, T.base).setDisplaySize(T.W, T.H);
      this.faceC = scene.add.container(0, 0);
      this.face = scene.add.image(0, T.D / 2, T.face).setDisplaySize(T.W, T.H);
      this.faceC.add(this.face);
      const sz = o.size || Math.round(h * 0.38);
      this.label = KG.txt(scene, 0, 0, o.label || '', { size: sz, color: T.S.text, center: true, middle: true, shadow: KG.SKIN.pop && T.S.text === '#ffffff' ? 2 : 0, shadowColor: T.S.base });
      this.label.setOrigin(0.5, 0.5);
      this.faceC.add(this.label);
      this.icon = null;
      if (o.icon) { this.icon = UI.icon(scene, o.icon, 0, 0, Math.round(h * 0.52), T.S.text); this.faceC.add(this.icon); }
      this.fit = o.fit !== false;
      this.layout();
      this.add([this.glow, this.base, this.faceC]);
      this.zone = scene.add.zone(0, T.D / 2, w + 10, h + T.D + 8).setInteractive({ useHandCursor: true });
      this.add(this.zone);
      this.zone.on('pointerover', () => { if (!this.enabled) return; this.hover(true); KG.audio.play('hover'); });
      this.zone.on('pointerout', () => { this.hover(false); if (this.pressed) this.release(false); });
      this.zone.on('pointerdown', () => { if (!this.enabled) return; this.pressed = true; this.press(); });
      this.zone.on('pointerup', () => { if (this.pressed) this.release(true); });
      scene.add.existing(this);
      if (o.depth != null) this.setDepth(o.depth);
    }
    layout() {
      const pad = this.icon ? this.h * 0.95 : this.h * 0.5;
      this.label.setScale(1);
      const avail = this.w - this.T.S.pad - pad * (this.icon ? 1 : 0.4) - 20, lw = this.label.width;
      if (this.fit && lw > avail) this.label.setScale(avail / lw);
      const lwid = this.label.width * this.label.scaleX;
      if (this.icon) {
        const gap = 10, iw = this.icon.displayWidth, total = iw + gap + lwid;
        this.icon.x = -total / 2 + iw / 2; this.label.x = -total / 2 + iw + gap + lwid / 2;
      } else this.label.x = 0;
      this.label.y = this.T.D / 2 - 1; if (this.icon) this.icon.y = this.T.D / 2 - 1;
    }
    setLabel(s) { this.label.setText(s); this.layout(); return this; }
    setEnabled(v) { this.enabled = v; this.setAlpha(v ? 1 : 0.42); if (!v) { this.hover(false); this.release(false); } return this; }
    hover(on) { this.scene.tweens.add({ targets: this.glow, alpha: on ? 1 : (this.active ? 0.8 : 0), duration: 140 }); this.scene.tweens.add({ targets: this.faceC, scaleX: on ? 1.03 : 1, scaleY: on ? 1.03 : 1, duration: 140, ease: 'Sine.easeOut' }); }
    setActive(v) { this.active = v; this.glow.setAlpha(v ? 0.8 : 0); return this; }
    press() { this.scene.tweens.killTweensOf(this.faceC); this.faceC.y = this.D * 0.75; this.faceC.setScale(0.985); this.base.setAlpha(0.9); }
    release(fire) {
      this.pressed = false;
      this.scene.tweens.add({ targets: this.faceC, y: 0, scaleX: 1, scaleY: 1, duration: 160, ease: 'Back.easeOut' }); this.base.setAlpha(1);
      if (fire && this.enabled) {
        KG.audio.play(this.sfx);
        const p = this.getWorldTransformMatrix(); KG.fx.ring(this.scene, p.tx, p.ty + this.D / 2, Phaser.Display.Color.HexStringToColor(this.T.S.glow).color, { size: Math.min(this.w, 140) / 64, w: 0.45 });
        if (this.cb) this.cb(this);
      }
    }
    pulse() { this.scene.tweens.add({ targets: this, scaleX: 1.07, scaleY: 1.07, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); return this; }
  };
  Object.keys(BTN).forEach(k => { BTN[k].pad = 0; });
  UI.button = (scene, x, y, w, h, o) => new UI.Button(scene, x, y, w, h, o);

  /* ---------- ไอคอนเวกเตอร์ (วาดสีขาวที่กริด 64x64 แล้วย้อมสีตอนใช้) ---------- */
  function tri(c, x, y, dx, dy, s) { const px = -dy, py = dx; c.beginPath(); c.moveTo(x + dx * s, y + dy * s); c.lineTo(x - dx * s * 0.2 + px * s * 0.75, y - dy * s * 0.2 + py * s * 0.75); c.lineTo(x - dx * s * 0.2 - px * s * 0.75, y - dy * s * 0.2 - py * s * 0.75); c.closePath(); c.fill(); }
  function poly(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }
  const ICONS = {
    play(c) { poly(c, [[17, 9], [55, 32], [17, 55]]); c.fill(); },
    pause(c) { c.fillRect(14, 10, 14, 44); c.fillRect(36, 10, 14, 44); },
    step(c) { poly(c, [[10, 10], [40, 32], [10, 54]]); c.fill(); c.fillRect(44, 10, 10, 44); },
    stop(c) { c.fillRect(14, 14, 36, 36); },
    reset(c) { c.lineWidth = 8; c.beginPath(); c.arc(32, 34, 19, -Math.PI / 3, Math.PI * 1.32); c.stroke(); tri(c, 22, 14, 1, 0.1, 15); },
    sound(c) { poly(c, [[8, 24], [20, 24], [36, 10], [36, 54], [20, 40], [8, 40]]); c.fill(); c.lineWidth = 5; c.beginPath(); c.arc(36, 32, 12, -0.8, 0.8); c.stroke(); c.beginPath(); c.arc(36, 32, 23, -0.8, 0.8); c.stroke(); },
    mute(c) { poly(c, [[6, 24], [18, 24], [34, 10], [34, 54], [18, 40], [6, 40]]); c.fill(); c.lineWidth = 6; c.beginPath(); c.moveTo(42, 22); c.lineTo(58, 42); c.moveTo(58, 22); c.lineTo(42, 42); c.stroke(); },
    music(c) { c.beginPath(); c.ellipse(20, 47, 10, 8, -0.3, 0, 7); c.fill(); c.fillRect(27, 10, 6, 37); poly(c, [[33, 10], [50, 18], [50, 28], [33, 21]]); c.fill(); },
    home(c) { poly(c, [[32, 7], [58, 31], [50, 31], [50, 55], [38, 55], [38, 39], [26, 39], [26, 55], [14, 55], [14, 31], [6, 31]]); c.fill(); },
    bulb(c) { c.beginPath(); c.arc(32, 25, 17, 0, 7); c.fill(); c.fillRect(23, 40, 18, 6); c.fillRect(25, 48, 14, 6); c.globalCompositeOperation = 'destination-out'; c.fillRect(22, 38, 20, 2); },
    help(c) { c.font = '600 54px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 32, 36); },
    close(c) { c.lineWidth = 9; c.beginPath(); c.moveTo(14, 14); c.lineTo(50, 50); c.moveTo(50, 14); c.lineTo(14, 50); c.stroke(); },
    check(c) { c.lineWidth = 10; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(10, 34); c.lineTo(26, 50); c.lineTo(54, 14); c.stroke(); },
    plus(c) { c.fillRect(26, 10, 12, 44); c.fillRect(10, 26, 44, 12); },
    minus(c) { c.fillRect(10, 26, 44, 12); },
    trash(c) { c.fillRect(10, 14, 44, 7); c.fillRect(24, 6, 16, 8); c.beginPath(); c.moveTo(14, 25); c.lineTo(50, 25); c.lineTo(46, 58); c.lineTo(18, 58); c.closePath(); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(25, 32, 5, 20); c.fillRect(34, 32, 5, 20); },
    star(c) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 13 : 30; p.push([32 + Math.cos(a) * r, 34 + Math.sin(a) * r]); } poly(c, p); c.fill(); },
    starO(c) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 13 : 29; p.push([32 + Math.cos(a) * r, 34 + Math.sin(a) * r]); } poly(c, p); c.lineWidth = 5; c.lineJoin = 'miter'; c.stroke(); },
    lock(c) { c.fillRect(14, 28, 36, 28); c.lineWidth = 8; c.beginPath(); c.moveTo(21, 28); c.lineTo(21, 20); c.arc(32, 20, 11, Math.PI, 0); c.lineTo(43, 28); c.stroke(); c.globalCompositeOperation = 'destination-out'; c.fillRect(29, 38, 6, 10); },
    chevL(c) { c.lineWidth = 10; c.beginPath(); c.moveTo(42, 8); c.lineTo(18, 32); c.lineTo(42, 56); c.stroke(); },
    chevR(c) { c.lineWidth = 10; c.beginPath(); c.moveTo(22, 8); c.lineTo(46, 32); c.lineTo(22, 56); c.stroke(); },
    chevU(c) { c.lineWidth = 10; c.beginPath(); c.moveTo(8, 42); c.lineTo(32, 18); c.lineTo(56, 42); c.stroke(); },
    chevD(c) { c.lineWidth = 10; c.beginPath(); c.moveTo(8, 22); c.lineTo(32, 46); c.lineTo(56, 22); c.stroke(); },
    expand(c) { c.lineWidth = 7; [[8, 22, 8, 8, 22, 8], [42, 8, 56, 8, 56, 22], [56, 42, 56, 56, 42, 56], [22, 56, 8, 56, 8, 42]].forEach(p => { c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[2], p[3]); c.lineTo(p[4], p[5]); c.stroke(); }); },
    walk(c) { c.lineWidth = 9; c.beginPath(); c.moveTo(10, 12); c.lineTo(28, 32); c.lineTo(10, 52); c.moveTo(34, 12); c.lineTo(52, 32); c.lineTo(34, 52); c.stroke(); },
    jump(c) { c.lineWidth = 8; c.beginPath(); c.arc(32, 46, 22, Math.PI, Math.PI * 2); c.stroke(); tri(c, 54, 50, 0, 1, 14); c.fillRect(6, 50, 5, 6); },
    sword(c) { c.save(); c.translate(32, 32); c.rotate(Math.PI / 4); poly(c, [[-5, -30], [0, -40], [5, -30], [5, 12], [-5, 12]]); c.fill(); c.fillRect(-15, 12, 30, 7); c.fillRect(-4, 19, 8, 14); c.restore(); },
    turn(c) { c.lineWidth = 8; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(50, 56); c.lineTo(50, 28); c.arc(36, 28, 14, 0, Math.PI, true); c.lineTo(22, 40); c.stroke(); tri(c, 22, 52, 0, 1, 14); },
    repeat(c) { c.lineWidth = 8; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(10, 36); c.lineTo(10, 22); c.lineTo(42, 22); c.stroke(); tri(c, 54, 22, 1, 0, 12); c.beginPath(); c.moveTo(54, 30); c.lineTo(54, 44); c.lineTo(22, 44); c.stroke(); tri(c, 10, 44, -1, 0, 12); },
    until(c) { c.lineWidth = 8; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(8, 34); c.lineTo(8, 20); c.lineTo(34, 20); c.stroke(); tri(c, 46, 20, 1, 0, 12); c.fillRect(48, 36, 4, 22); poly(c, [[52, 36], [62, 41], [52, 47]]); c.fill(); },
    branch(c) { c.lineWidth = 7; c.beginPath(); c.moveTo(18, 14); c.lineTo(18, 50); c.moveTo(18, 38); c.quadraticCurveTo(18, 24, 46, 22); c.stroke(); [[18, 12], [18, 52], [48, 22]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 8, 0, 7); c.fill(); }); },
    func(c) { c.font = '600 46px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('A', 32, 36); c.lineWidth = 5; c.strokeRect(5, 6, 54, 52); },
    flag(c) { c.fillRect(12, 6, 6, 52); poly(c, [[18, 8], [54, 18], [18, 32]]); c.fill(); },
    gem(c) { poly(c, [[32, 4], [56, 20], [56, 44], [32, 60], [8, 44], [8, 20]]); c.fill(); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 0.45; poly(c, [[32, 4], [56, 20], [32, 28], [8, 20]]); c.fill(); },
    heart(c) { c.beginPath(); c.moveTo(32, 56); c.bezierCurveTo(-6, 32, 8, 6, 32, 20); c.bezierCurveTo(56, 6, 70, 32, 32, 56); c.fill(); },
    skull(c) { c.beginPath(); c.arc(32, 28, 22, 0, 7); c.fill(); c.fillRect(20, 42, 24, 14); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(23, 30, 6, 0, 7); c.arc(41, 30, 6, 0, 7); c.fill(); c.fillRect(30, 40, 4, 6); c.fillRect(26, 50, 3, 8); c.fillRect(35, 50, 3, 8); },
    bolt(c) { poly(c, [[38, 2], [14, 36], [28, 36], [22, 62], [50, 26], [34, 26]]); c.fill(); },
    key(c) { c.beginPath(); c.arc(20, 32, 14, 0, 7); c.fill(); c.fillRect(30, 28, 28, 8); c.fillRect(46, 36, 6, 10); c.fillRect(54, 36, 6, 7); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(20, 32, 5, 0, 7); c.fill(); },
    pad(c) { poly(c, [[12, 20], [52, 20], [60, 44], [50, 52], [40, 40], [24, 40], [14, 52], [4, 44]]); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(16, 27, 12, 4); c.fillRect(20, 23, 4, 12); c.beginPath(); c.arc(42, 27, 3, 0, 7); c.arc(48, 33, 3, 0, 7); c.fill(); },
    book(c) { poly(c, [[6, 12], [30, 16], [30, 56], [6, 52]]); c.fill(); poly(c, [[58, 12], [34, 16], [34, 56], [58, 52]]); c.fill(); },
    eye(c) { c.beginPath(); c.moveTo(4, 32); c.quadraticCurveTo(32, -6, 60, 32); c.quadraticCurveTo(32, 70, 4, 32); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(32, 32, 9, 0, 7); c.fill(); },
    chart(c) { c.fillRect(8, 34, 10, 22); c.fillRect(24, 16, 10, 40); c.fillRect(40, 26, 10, 30); c.fillRect(6, 58, 52, 4); },
    shield(c) { poly(c, [[32, 4], [56, 12], [54, 36], [32, 60], [10, 36], [8, 12]]); c.fill(); },
    rotR(c) { c.lineWidth = 8; c.beginPath(); c.arc(32, 34, 20, Math.PI * 1.08, Math.PI * 2.1); c.stroke(); tri(c, 51, 40, -0.3, 0.95, 15); },
    rotL(c) { c.save(); c.translate(64, 0); c.scale(-1, 1); c.lineWidth = 8; c.beginPath(); c.arc(32, 34, 20, Math.PI * 1.08, Math.PI * 2.1); c.stroke(); tri(c, 51, 40, -0.3, 0.95, 15); c.restore(); },
    wheel(c) { c.lineWidth = 7; c.beginPath(); c.arc(32, 32, 24, 0, 7); c.stroke(); c.beginPath(); c.arc(32, 32, 8, 0, 7); c.fill(); for (let i = 0; i < 4; i++) { c.save(); c.translate(32, 32); c.rotate(i * Math.PI / 2 + 0.3); c.fillRect(-3, -26, 6, 14); c.restore(); } }
  };
  UI.ICONS = ICONS;   // ให้เกมเพิ่มไอคอนของตัวเองได้ (เช่น Techno Folder)
  UI.hasIcon = n => !!ICONS[n];
  UI.iconKey = function (scene, name) {
    return KG.tex(scene, 'icon|' + name, 64, 64, ctx => { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineCap = 'butt'; (ICONS[name] || ICONS.help)(ctx); });
  };
  UI.icon = function (scene, name, x, y, size, color) {
    const key = UI.iconKey(scene, name);
    const img = scene.add.image(x, y, key).setDisplaySize(size, size);
    if (color != null) img.setTint(typeof color === 'string' ? Phaser.Display.Color.HexStringToColor(color).color : color);
    return img;
  };

  /* ---------- โลโก้ตัวอักษรไล่สีแบบนูน ---------- */
  UI.logo = function (scene, x, y, lines, o) {
    o = o || {}; const size = o.size || 110, w = o.w || 760, lh = size * 0.96, h = lh * lines.length + 60;
    const key = KG.tex(scene, 'logo|' + JSON.stringify(lines) + size, w, h, ctx => {
      ctx.font = '600 ' + size + 'px Kanit'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'miter'; ctx.textAlign = o.align || 'left';
      lines.forEach((ln, i) => {
        const ox = (o.align === 'center') ? w / 2 : 20, by = 30 + lh * (i + 0.82);
        for (let d = 10; d > 0; d--) { ctx.fillStyle = ln.deep || '#1a0a3a'; ctx.fillText(ln.t, ox + d * 0.6, by + d); }
        ctx.save(); ctx.shadowColor = ln.glow || '#ff3d8b'; ctx.shadowBlur = 26; ctx.fillStyle = lin(ctx, 0, by - size * 0.8, 0, by, ln.grad || [[0, '#ffffff'], [1, '#bfc8ff']]); ctx.fillText(ln.t, ox, by); ctx.restore();
        ctx.lineWidth = 3; ctx.strokeStyle = ln.edge || 'rgba(255,255,255,.6)'; ctx.strokeText(ln.t, ox, by);
      });
    });
    return scene.add.image(x, y, key).setOrigin(o.ox == null ? 0 : o.ox, 0).setDisplaySize(w, h);
  };

  /* ---------- ดาว ---------- */
  UI.stars = function (scene, x, y, n, max, size, o) {
    o = o || {}; const gap = size * 1.12, cont = scene.add.container(x, y), items = [];
    for (let i = 0; i < max; i++) {
      const px = (i - (max - 1) / 2) * gap, off = UI.icon(scene, 'starO', px, 0, size, KG.SKIN.starOff), on = UI.icon(scene, 'star', px, 0, size, KG.C.sun).setAlpha(0);
      cont.add([off, on]); items.push({ off, on });
    }
    cont.setStars = function (v, animate) {
      items.forEach((it, i) => {
        const lit = i < v;
        if (!animate) { it.on.setAlpha(lit ? 1 : 0); return; }
        if (lit) {
          scene.time.delayedCall(260 * i + 150, () => {
            it.on.setAlpha(1).setScale(size / 64 * 2.4); scene.tweens.add({ targets: it.on, scaleX: size / 64, scaleY: size / 64, duration: 300, ease: 'Back.easeOut' });
            KG.audio.play('star', { i }); const p = cont.getWorldTransformMatrix(); KG.fx.burst(scene, p.tx + it.on.x, p.ty, { colors: [0xffd34f, 0xffffff], n: 14, max: 180, depth: 3000 });
          });
        }
      });
    };
    cont.setStars(n, !!o.animate);
    return cont;
  };

  /* ---------- แถบพลัง/แถบความคืบหน้า ---------- */
  UI.bar = function (scene, x, y, w, h, o) {
    o = o || {}; const g = scene.add.graphics({ x, y }), sk = h * 0.5, st = { v: o.value == null ? 1 : o.value }, col = o.color || KG.C.cyan;
    const draw = () => {
      g.clear();
      if (KG.SKIN.round) {   // ธีมมน: แถบแคปซูล
        g.fillStyle(KG.SKIN.barBg, KG.SKIN.barBgA); g.fillRoundedRect(0, 0, w, h, h / 2);
        const fw2 = Math.max(0, (w - 6) * st.v); if (fw2 > 2) { g.fillStyle(col, 1); g.fillRoundedRect(3, 3, Math.max(h - 6, fw2), h - 6, (h - 6) / 2); g.fillStyle(0xffffff, 0.28); g.fillRoundedRect(6, 5, Math.max(h - 12, fw2 - 6), Math.max(2, (h - 6) * 0.3), 3); }
        g.lineStyle(3, o.edge || KG.SKIN.barEdge, 1); g.strokeRoundedRect(0, 0, w, h, h / 2); return;
      }
      g.fillStyle(KG.SKIN.barBg, KG.SKIN.barBgA); g.fillPoints([{ x: sk, y: 0 }, { x: w, y: 0 }, { x: w - sk, y: h }, { x: 0, y: h }], true);
      const fw = Math.max(0, (w - 6) * st.v);
      if (fw > 2) { g.fillStyle(col, 1); g.fillPoints([{ x: sk + 3, y: 3 }, { x: 3 + fw, y: 3 }, { x: 3 + fw - sk, y: h - 3 }, { x: 3, y: h - 3 }], true); g.fillStyle(0xffffff, 0.28); g.fillRect(sk + 3, 3, Math.max(0, fw - sk), (h - 6) / 3); }
      g.lineStyle(KG.SKIN.pop ? 3 : 2, o.edge || KG.SKIN.barEdge, 1); g.strokePoints([{ x: sk, y: 0 }, { x: w, y: 0 }, { x: w - sk, y: h }, { x: 0, y: h }], true);
    };
    draw();
    g.setValue = (v, ms) => { scene.tweens.add({ targets: st, v: KG.clamp(v, 0, 1), duration: ms == null ? 300 : ms, onUpdate: draw, ease: 'Sine.easeOut' }); };
    return g;
  };

  /* ---------- ข้อความเด้งแจ้งเตือน ---------- */
  UI.toast = function (scene, str, o) {
    o = o || {}; const w = Math.min(760, Math.max(260, KG.measure(str, '600 24px Kanit') + 90)), h = 64;
    const c = scene.add.container(KG.GW / 2, -h - 20).setDepth(4000);
    const p = UI.panel(scene, -w / 2, 0, w, h, { cuts: [14, 14, 14, 14], accent: o.accent || (KG.SKIN.pop ? KG.SKIN.panelAccent : hex(C.cyan)), fill: KG.SKIN.toastFill, glow: true });
    const t = KG.txt(scene, 0, h / 2, str, { size: 24, center: true, middle: true });
    c.add([p, t]);
    scene.tweens.add({ targets: c, y: 20, duration: 320, ease: 'Back.easeOut' });
    scene.tweens.add({ targets: c, y: -h - 30, alpha: 0, delay: o.ms || 2200, duration: 300, onComplete: () => c.destroy() });
    KG.audio.play(o.sfx || 'pop');
    return c;
  };

  /* ---------- หน้าต่างป๊อปอัป ---------- */
  UI.modal = function (scene, o) {
    const w = o.w || 640, hasBtn = o.buttons && o.buttons.length, bodyW = w - 80;
    let bodyStr = o.body ? KG.wrap(o.body, bodyW, '400 24px Kanit') : '';
    const bodyLines = bodyStr ? bodyStr.split('\n').length : 0;
    const titleH = o.title ? 74 : 20, bodyH = bodyLines * 34 + (bodyLines ? 12 : 0), extra = o.extraH || 0, btnH = hasBtn ? 104 : 24;
    const h = Math.max(o.h || 0, titleH + bodyH + extra + btnH + 16);
    const root = scene.add.container(0, 0).setDepth(o.depth || 3000);
    const dim = scene.add.rectangle(KG.GW / 2, KG.GH / 2, KG.GW + 40, KG.GH + 40, KG.SKIN.dim, KG.SKIN.dimA).setInteractive().setAlpha(0);
    root.add(dim);
    const box = scene.add.container(KG.GW / 2, KG.GH / 2).setScale(0.86).setAlpha(0);
    root.add(box);
    const p = UI.panel(scene, -w / 2, -h / 2, w, h, { accent: KG.SKIN.pop && !o.accent ? KG.SKIN.panelAccent : hex(o.accent || C.cyan), accent2: KG.SKIN.pop && o.accent ? hex(o.accent2 || o.accent) : undefined, cuts: [26, 0, 26, 0], fill: KG.SKIN.modalFill });
    box.add(p);
    if (o.title) box.add(KG.txt(scene, 0, -h / 2 + 24, o.title, { size: 38, center: true, ox: 0.5, color: o.titleColor || KG.SKIN.title, shadow: KG.SKIN.pop ? 0 : 3 }));
    if (bodyStr) box.add(KG.txt(scene, 0, -h / 2 + titleH, bodyStr, { size: 24, weight: 400, center: true, ox: 0.5, color: KG.SKIN.body, lineSpacing: 8 }));
    if (o.build) o.build(box, { w, h, top: -h / 2 + titleH + bodyH, left: -w / 2 });
    const api = { root, box, closed: false };
    api.close = (cb) => {
      if (api.closed) return; api.closed = true;
      scene.tweens.add({ targets: box, scaleX: 0.9, scaleY: 0.9, alpha: 0, duration: 160, ease: 'Sine.easeIn' });
      scene.tweens.add({ targets: dim, alpha: 0, duration: 200, onComplete: () => { root.destroy(); if (cb) cb(); if (scene._modal === api) scene._modal = null; } });
    };
    if (hasBtn) {
      const n = o.buttons.length, bw = Math.min(250, (w - 60 - (n - 1) * 20) / n);
      o.buttons.forEach((b, i) => {
        const bx = (i - (n - 1) / 2) * (bw + 24);
        const btn = new UI.Button(scene, bx, h / 2 - 62, bw, 64, { label: b.label, style: b.style || 'primary', icon: b.icon, size: 24, onClick: () => { if (b.keep !== true) api.close(); if (b.onClick) b.onClick(api); } });
        box.add(btn);
        if (i === 0 && b.pulse) btn.pulse();
      });
    }
    scene.tweens.add({ targets: dim, alpha: 1, duration: 200 });
    scene.tweens.add({ targets: box, scaleX: 1, scaleY: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
    KG.audio.play('pop');
    scene._modal = api;
    return api;
  };
})();
