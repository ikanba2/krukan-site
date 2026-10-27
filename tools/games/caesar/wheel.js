/* ===== วงล้อซีซาร์ + กระดานข้อความ + กราฟความถี่ ===== */
const STEP = Math.PI * 2 / 26;
const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function wheelTextures(scene, R, theme) {
  const sz = 2 * R + 44, t = theme || { a: '#4ef4d2', b: '#a78bfa', inner: '#ff3d8b' };
  const outer = KG.tex(scene, 'wheelO|' + R + t.a, sz, sz, ctx => {
    ctx.translate(sz / 2, sz / 2);
    ctx.save(); ctx.shadowColor = t.a; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.arc(0, 0, R * 0.8, 0, 7, true); ctx.fillStyle = '#0a1030'; ctx.fill('evenodd'); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.arc(0, 0, R * 0.8, 0, 7, true);
    ctx.fillStyle = KG.ui.lin(ctx, -R, -R, R, R, [[0, '#1d2a78'], [1, '#0a1233']]); ctx.fill('evenodd');
    ctx.lineWidth = 3; ctx.strokeStyle = t.a; ctx.beginPath(); ctx.arc(0, 0, R - 1.5, 0, 7); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(0, 0, R * 0.8 + 1, 0, 7); ctx.stroke();
    for (let i = 0; i < 26; i++) {
      ctx.save(); ctx.rotate(i * STEP);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-1, -R + 2, 2, 8);
      ctx.font = '600 ' + Math.round(R * 0.125) + 'px Kanit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = i === 0 ? '#ffd34f' : '#d9f6ff';
      ctx.fillText(LET[i], 0, -R * 0.895); ctx.restore();
    }
  });
  const inner = KG.tex(scene, 'wheelI|' + R + t.inner, sz, sz, ctx => {
    ctx.translate(sz / 2, sz / 2); const r = R * 0.78;
    ctx.save(); ctx.shadowColor = t.inner; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = KG.ui.lin(ctx, -r, -r, r, r, [[0, '#6a1f6e'], [0.5, '#32124f'], [1, '#150a33']]); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = t.inner; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.56, 0, 7); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke();
    for (let i = 0; i < 26; i++) {
      ctx.save(); ctx.rotate(i * STEP);
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-1, -r + 2, 2, 7);
      ctx.font = '600 ' + Math.round(R * 0.125) + 'px Kanit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = i === 0 ? '#ffd34f' : '#ffd6ea';
      ctx.fillText(LET[i], 0, -r * 0.82); ctx.restore();
    }
    ctx.fillStyle = '#ffd34f'; ctx.beginPath(); ctx.moveTo(0, -r * 0.62); ctx.lineTo(-7, -r * 0.5); ctx.lineTo(7, -r * 0.5); ctx.closePath(); ctx.fill();
  });
  return { outer, inner, sz };
}

class CipherWheel extends Phaser.GameObjects.Container {
  constructor(scene, x, y, R, o) {
    super(scene, x, y); o = o || {};
    this.R = R; this.key = 0; this.enabled = true; this.onChange = o.onChange; this.dragging = false;
    const T = wheelTextures(scene, R, o.theme);
    this.glow = scene.add.image(0, 0, 'fx_glow').setTint(0x4ef4d2).setBlendMode('ADD').setDisplaySize(R * 2.9, R * 2.9).setAlpha(0.5);
    this.outer = scene.add.image(0, 0, T.outer).setDisplaySize(T.sz, T.sz);
    this.inner = scene.add.image(0, 0, T.inner).setDisplaySize(T.sz, T.sz);
    this.add([this.glow, this.outer, this.inner]);
    // ดุมกลาง
    const hub = scene.add.graphics(); hub.fillStyle(0x0a1030, 1); hub.fillCircle(0, 0, R * 0.34); hub.lineStyle(3, 0x4ef4d2, 1); hub.strokeCircle(0, 0, R * 0.34); hub.lineStyle(1.5, 0xffffff, 0.2); hub.strokeCircle(0, 0, R * 0.29);
    this.add(hub);
    this.cap = KG.txt(scene, 0, -R * 0.2, 'กุญแจ', { size: Math.round(R * 0.1), color: '#9fb0d8', center: true, middle: true }); this.add(this.cap);
    this.keyTxt = KG.txt(scene, 0, R * 0.04, '0', { size: Math.round(R * 0.36), color: '#ffffff', center: true, middle: true, stroke: true }); this.add(this.keyTxt);
    // ตัวชี้ A วงนอก
    this.mark = scene.add.graphics(); this.mark.fillStyle(0xffd34f, 1); this.mark.fillTriangle(-9, -R - 12, 9, -R - 12, 0, -R + 4); this.add(this.mark);
    this.hl = scene.add.graphics(); this.add(this.hl);
    this.zone = scene.add.zone(0, 0, R * 2, R * 2).setInteractive(new Phaser.Geom.Circle(R, R, R), Phaser.Geom.Circle.Contains); this.add(this.zone);
    this.zone.on('pointerdown', p => this.down(p));
    scene.input.on('pointermove', p => this.move(p));
    scene.input.on('pointerup', () => this.up());
    scene.add.existing(this);
    this.apply(0, true);
  }
  ang(p) { const m = this.getWorldTransformMatrix(); return Math.atan2(p.worldY - m.ty, p.worldX - m.tx); }
  dist(p) { const m = this.getWorldTransformMatrix(); return Math.hypot(p.worldY - m.ty, p.worldX - m.tx); }
  down(p) {
    if (!this.enabled) return; const d = this.dist(p); if (d < this.R * 0.3) return;
    this.dragging = true; this.a0 = this.ang(p); this.r0 = this.inner.rotation; this.scene.tweens.killTweensOf(this.inner); KG.audio.play('tap');
  }
  move(p) {
    if (!this.dragging) return;
    let d = this.ang(p) - this.a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    this.inner.rotation = this.r0 + d; this.r0 = this.inner.rotation; this.a0 = this.ang(p);
    const k = ((Math.round(this.inner.rotation / STEP) % 26) + 26) % 26;
    if (k !== this.key) this.setKey(k, true);
  }
  up() {
    if (!this.dragging) return; this.dragging = false;
    this.snap();
  }
  snap() {
    const target = Math.round(this.inner.rotation / STEP) * STEP;
    this.scene.tweens.add({ targets: this.inner, rotation: target, duration: 150, ease: 'Back.easeOut' });
  }
  // ตั้งกุญแจ (นับให้ถูกทางเสมอ) animate = หมุนให้เห็น
  setKey(k, fromDrag, animate) {
    k = ((k % 26) + 26) % 26; const changed = k !== this.key; this.key = k; this.keyTxt.setText(String(k));
    if (!fromDrag) {
      const cur = this.inner.rotation; let delta = k * STEP - (((cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)); while (delta > Math.PI) delta -= 2 * Math.PI; while (delta < -Math.PI) delta += 2 * Math.PI;
      if (animate === false) this.inner.rotation = cur + delta; else this.scene.tweens.add({ targets: this.inner, rotation: cur + delta, duration: 160, ease: 'Sine.easeOut' });
    }
    if (changed) { KG.audio.play('tick', { p: 0.9 + k * 0.012 }); try { if (navigator.vibrate) navigator.vibrate(6); } catch (e) { /* ไม่รองรับก็ข้าม */ } this.scene.tweens.add({ targets: this.keyTxt, scaleX: 1.18, scaleY: 1.18, duration: 70, yoyo: true }); if (this.onChange) this.onChange(k); }
  }
  step(d) { if (!this.enabled) return; this.setKey(this.key + d); }
  apply(k, instant) { this.key = ((k % 26) + 26) % 26; this.inner.rotation = this.key * STEP; this.keyTxt.setText(String(this.key)); }
  setEnabled(v) { this.enabled = v; this.setAlpha(v ? 1 : 0.7); return this; }
  // ไฮไลต์ตัวอักษรรหัสหนึ่งตัวและตัวจริงที่คู่กันบนวงล้อ
  pair(c) {
    const i = LET.indexOf(c); if (i < 0) return;
    const a = i * STEP, R = this.R, g = this.hl; g.clear();
    g.lineStyle(R * 0.17, 0xffd34f, 0.32); g.beginPath(); g.moveTo(Math.sin(a) * R * 0.44, -Math.cos(a) * R * 0.44); g.lineTo(Math.sin(a) * R * 0.99, -Math.cos(a) * R * 0.99); g.strokePath();
    g.lineStyle(3, 0xffd34f, 1); g.beginPath(); g.moveTo(Math.sin(a) * R * 0.5, -Math.cos(a) * R * 0.5); g.lineTo(Math.sin(a) * R * 0.99, -Math.cos(a) * R * 0.99); g.strokePath();
    this.scene.tweens.killTweensOf(g); g.setAlpha(1); this.scene.tweens.add({ targets: g, alpha: 0, delay: 900, duration: 400 });
    KG.audio.play('tick', { p: 1.4 });
  }
}

/* กระดานข้อความ: แถวบนเป็นตัวอักษรรหัส แถวล่างเป็นตัวที่ถอดได้ตามกุญแจปัจจุบัน (โหมด encrypt สลับให้แถวบนเป็นข้อความจริง) */
class MessageBoard extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, h, o) {
    super(scene, x, y); o = o || {};
    this.bw = w; this.bh = h; this.mode = o.mode || 'decode'; this.onTile = o.onTile; this.tiles = []; this.text = ''; this.key = 0; this.typed = ''; this.cribLen = 0;
    scene.add.existing(this);
  }
  layout(text) {
    const words = text.split(' '); let best = null;
    for (let tw = 66; tw >= 22; tw -= 2) {
      const th = Math.round(tw * 1.5), gap = Math.max(3, Math.round(tw * 0.1)), wg = Math.round(tw * 0.55), rowH = th * 2 + 14;
      const lines = []; let cur = [], curW = 0;
      words.forEach(wd => { const ww = wd.length * (tw + gap) - gap; if (cur.length && curW + wg + ww > this.bw) { lines.push(cur); cur = []; curW = 0; } curW += (cur.length ? wg : 0) + ww; cur.push(wd); });
      if (cur.length) lines.push(cur);
      if (lines.length * rowH <= this.bh) { best = { tw, th, gap, wg, rowH, lines }; break; }
    }
    return best || { tw: 22, th: 33, gap: 3, wg: 12, rowH: 80, lines: [words] };
  }
  setText(text, cipherOrPlain, o) {
    // text = ข้อความรหัส (โหมด decode) หรือข้อความจริง (โหมด encrypt)
    this.removeAll(true); this.tiles = []; this.text = text; o = o || {};
    const L = this.layout(text), sc = this.scene, tw = L.tw, th = L.th, total = L.lines.length * L.rowH;
    this.L = L; let idx = 0;
    L.lines.forEach((ln, r) => {
      const lw = ln.reduce((a, wd) => a + wd.length * (tw + L.gap) - L.gap, 0) + (ln.length - 1) * L.wg; let x = -lw / 2; const y = -total / 2 + r * L.rowH + L.rowH / 2;
      ln.forEach(wd => {
        for (const ch of wd) {
          const t = this.makeTile(ch, x + tw / 2, y, tw, th, idx++); this.tiles.push(t); this.add(t.c); x += tw + L.gap;
        }
        x += L.wg - L.gap;
      });
    });
    this.setKey(this.key, true);
    if (o.entrance !== false) this.tiles.forEach((t, i) => { t.c.setAlpha(0).setScale(0.7); sc.tweens.add({ targets: t.c, alpha: 1, scaleX: 1, scaleY: 1, duration: 200, delay: Math.min(900, i * 18), ease: 'Back.easeOut' }); });
  }
  makeTile(ch, x, y, w, h, idx) {
    const sc = this.scene, c = sc.add.container(x, y), isEnc = this.mode === 'encrypt';
    const topCol = isEnc ? '#9bffc0' : '#4ef4d2', botCol = isEnc ? '#4ef4d2' : '#ffd6ea';
    const keyT = KG.tex(sc, 'tile|' + w + '|' + h, w + 10, h + 10, ctx => { ctx.translate(5, 5); KG.ui.cutPath(ctx, 0, 0, w, h, [5, 0, 5, 0]); ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, h, [[0, '#1c2a78'], [1, '#0b1236']]); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(120,150,255,.55)'; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(2, 2, w - 4, 3); });
    const top = sc.add.image(0, -h / 2 - 4, keyT).setDisplaySize(w + 10, h + 10);
    const bot = sc.add.image(0, h / 2 + 4, keyT).setDisplaySize(w + 10, h + 10).setTint(0xcfa0ff);
    const fs = Math.round(w * 0.62);
    const tl = KG.txt(sc, 0, -h / 2 - 4, ch === ' ' ? '' : ch, { size: fs, color: topCol, center: true, middle: true });
    const bl = KG.txt(sc, 0, h / 2 + 4, '', { size: fs, color: botCol, center: true, middle: true });
    c.add([top, bot, tl, bl]); c.setSize(w, h * 2 + 14);
    c.setInteractive(new Phaser.Geom.Rectangle(-w / 2 - 3, -h - 12, w + 6, h * 2 + 28), Phaser.Geom.Rectangle.Contains);
    c.on('pointerup', () => { if (this.onTile) this.onTile(ch, idx); });
    return { c, ch, top, bot, tl, bl, w, h };
  }
  // ตั้งกุญแจ: อัปเดตแถวล่างด้วยท่าพลิกการ์ด
  setKey(k, instant) {
    this.key = k; if (this.mode !== 'decode') return;
    this.tiles.forEach((t, i) => {
      if (t.ch === ' ') return; const nv = CC.decrypt(t.ch, k);
      if (t.bl.text === nv) return;
      if (instant || !t.bl.text) { t.bl.setText(nv); return; }
      this.scene.tweens.killTweensOf(t.bl); this.scene.tweens.add({ targets: t.bl, scaleY: 0.1, duration: 60, delay: Math.min(220, i * 3), onComplete: () => { t.bl.setText(nv); this.scene.tweens.add({ targets: t.bl, scaleY: 1, duration: 90, ease: 'Back.easeOut' }); } });
    });
  }
  // เฉลย: แถวล่างเป็นข้อความจริง พร้อมแสงกวาด
  reveal(plain, color) {
    this.tiles.forEach((t, i) => {
      if (t.ch === ' ') return;
      this.scene.time.delayedCall(i * 40, () => { t.bl.setText(plain[this.tileIndex(i)] || ''); t.bl.setColor(color || '#9bffc0'); this.scene.tweens.add({ targets: t.c, y: t.c.y - 8, duration: 120, yoyo: true }); KG.audio.play('tick', { p: 1 + (i % 8) * 0.05 }); });
    });
  }
  tileIndex(i) { return i; }
  // โหมด encrypt: ใส่ตัวอักษรรหัสที่ผู้เล่นพิมพ์ทีละตัว
  typeNext(letter) {
    const target = this.tiles.find(t => t.ch !== ' ' && !t.done); if (!target) return null; target.bl.setText(letter); target.done = true; target.bl.setColor('#4ef4d2');
    this.scene.tweens.add({ targets: target.c, scaleX: 1.12, scaleY: 1.12, duration: 70, yoyo: true }); return target;
  }
  nextIndex() { return this.tiles.findIndex(t => t.ch !== ' ' && !t.done); }
  undoLast() { for (let i = this.tiles.length - 1; i >= 0; i--) { const t = this.tiles[i]; if (t.done) { t.done = false; t.bl.setText(''); return true; } } return false; }
  markCrib(len) {
    this.cribLen = len; const outline = this.scene.add.graphics(); this.add(outline); this.crib = outline;
    const first = this.tiles.slice(0, len); if (!first.length) return;
    const x0 = first[0].c.x - first[0].w / 2 - 8, x1 = first[len - 1].c.x + first[len - 1].w / 2 + 8, yy = first[0].c.y;
    outline.lineStyle(3, 0xffd34f, 1); outline.strokeRect(x0, yy - first[0].h - 14, x1 - x0, first[0].h * 2 + 32);
    this.scene.tweens.add({ targets: outline, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });
  }
  shake() { this.scene.tweens.add({ targets: this, x: this.x + 8, duration: 40, yoyo: true, repeat: 4, onComplete: () => { this.x = this.baseX != null ? this.baseX : this.x; } }); }
  deadTiles() { return this.tiles.filter(t => t.ch !== ' '); }
}

/* กราฟความถี่ตัวอักษร */
class FreqChart extends Phaser.GameObjects.Container {
  constructor(scene, x, y, w, h, o) {
    super(scene, x, y); this.cw = w; this.ch = h; this.onBar = o && o.onBar; this.bars = [];
    scene.add.existing(this);
    this.bg = scene.add.graphics(); this.add(this.bg);
    this.labels = []; for (let i = 0; i < 26; i++) { const l = KG.txt(scene, 0, h - 4, LET[i], { size: 17, color: '#9fb0d8', center: true, ox: 0.5, oy: 1 }); this.add(l); this.labels.push(l); }
    this.cnt = []; for (let i = 0; i < 26; i++) { const l = KG.txt(scene, 0, 0, '', { size: 15, color: '#ffffff', center: true, ox: 0.5, oy: 1 }); this.add(l); this.cnt.push(l); }
    this.zones = []; for (let i = 0; i < 26; i++) { const z = scene.add.zone(0, h / 2, w / 26, h).setInteractive({ useHandCursor: true }); z.on('pointerup', () => { if (this.onBar) this.onBar(i); }); this.add(z); this.zones.push(z); }
  }
  setData(text) {
    const f = CC.freq(text), max = Math.max(1, ...f), w = this.cw, h = this.ch, bw = w / 26, g = this.bg; g.clear();
    g.fillStyle(0x050818, 0.7); g.fillRect(0, 0, w, h); g.lineStyle(2, 0x4ef4d2, 0.6); g.strokeRect(0, 0, w, h);
    const peak = f.indexOf(max), base = h - 28, top = 26;
    f.forEach((v, i) => {
      const bh = (base - top) * v / max, x = i * bw + bw * 0.16;
      g.fillStyle(i === peak ? 0xffd34f : 0x6f8cff, 1); g.fillRect(x, base - bh, bw * 0.68, Math.max(2, bh));
      this.labels[i].setPosition(i * bw + bw / 2, h - 4); this.zones[i].setPosition(i * bw + bw / 2, h / 2);
      this.cnt[i].setPosition(i * bw + bw / 2, base - bh - 2).setText(v ? String(v) : '').setColor(i === peak ? '#ffd34f' : '#ffffff');
    });
    this.peak = peak;
  }
}
