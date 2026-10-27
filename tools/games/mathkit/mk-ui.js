/* ===== KG.mk: ชิ้นส่วนหน้าจอกลางของ 5 เกมคณิต (แป้นตัวเลข · ปุ่มตัวเลือก · กล่องโจทย์ · กระเบื้องเลข · ตัวคุมปุ่มคีย์บอร์ด) =====
   ใช้ร่วมกับ shared/kit.js (K.PlayBase ฯลฯ) · ปุ่มใช้ KG.ui.Button ของสกิน kids */
(function () {
  'use strict';
  const GW = KG.GW, GH = KG.GH, K = KG.kit, M = KG.mk = {};
  const CHOICE_STYLES = ['cyan', 'sun', 'violet', 'primary', 'green'];
  // ไอคอนปุ่มลบถอยหลัง (⌫): ป้ายชี้ซ้ายมีกากบาทเจาะ
  Object.assign(KG.ui.ICONS, {
    bksp(c) { c.beginPath(); c.moveTo(4, 32); c.lineTo(20, 10); c.lineTo(58, 10); c.lineTo(58, 54); c.lineTo(20, 54); c.closePath(); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(28, 24); c.lineTo(46, 40); c.moveTo(46, 24); c.lineTo(28, 40); c.stroke(); },
    dice(c) { c.beginPath(); c.moveTo(14, 4); c.lineTo(50, 4); c.quadraticCurveTo(60, 4, 60, 14); c.lineTo(60, 50); c.quadraticCurveTo(60, 60, 50, 60); c.lineTo(14, 60); c.quadraticCurveTo(4, 60, 4, 50); c.lineTo(4, 14); c.quadraticCurveTo(4, 4, 14, 4); c.fill(); c.globalCompositeOperation = 'destination-out'; [[20, 20], [44, 20], [32, 32], [20, 44], [44, 44]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 5, 0, 7); c.fill(); }); },
    snakeI(c) { c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(12, 54); c.bezierCurveTo(12, 30, 52, 44, 50, 22); c.bezierCurveTo(48, 8, 24, 12, 30, 24); c.stroke(); c.beginPath(); c.arc(30, 22, 8, 0, 7); c.fill(); },
    ladderI(c) { c.fillRect(14, 4, 7, 56); c.fillRect(43, 4, 7, 56); for (let i = 0; i < 5; i++) c.fillRect(14, 10 + i * 11, 36, 5); },
    sortI(c) { c.fillRect(6, 40, 12, 20); c.fillRect(22, 28, 12, 32); c.fillRect(38, 14, 12, 46); c.beginPath(); c.moveTo(48, 6); c.lineTo(62, 18); c.lineTo(52, 18); c.lineTo(52, 30); c.lineTo(44, 30); c.lineTo(44, 18); c.lineTo(34, 18); c.closePath(); c.fill(); },
    romanI(c) { c.font = '600 44px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('XIV', 32, 34); },
    calcI(c) { c.fillRect(10, 4, 44, 56); c.globalCompositeOperation = 'destination-out'; c.fillRect(16, 10, 32, 12); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) c.fillRect(16 + k * 12, 28 + r * 10, 8, 6); },
    coinI(c) { c.beginPath(); c.arc(32, 32, 28, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(28, 14, 8, 36); c.fillRect(14, 28, 36, 8); },
    clockI(c) { c.beginPath(); c.arc(32, 32, 28, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(30, 12, 4, 22); c.fillRect(30, 30, 16, 4); }
  });

  /* ---------- แป้นตัวเลข 3 × 4: 7 8 9 / 4 5 6 / 1 2 3 / ⌫ 0 ✓ ----------
     o: { kw, kh, gap, depth, dot: เพิ่มปุ่มจุดแทน ⌫ ไม่ใช้, onDigit(d), onBack(), onEnter() } */
  M.numpad = function (scene, x, y, o) {
    o = Object.assign({ kw: 88, kh: 70, gap: 10, depth: 8 }, o); const c = scene.add.container(x, y).setDepth(o.depth), rows = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['B', '0', 'E']], btns = {};
    const W = o.kw * 3 + o.gap * 2, H = o.kh * 4 + o.gap * 3; c.padW = W; c.padH = H; c.enabled = true;
    rows.forEach((r, ri) => r.forEach((k, ci) => {
      if (k === 'B' && o.noBack) return;
      const bx = -W / 2 + o.kw / 2 + ci * (o.kw + o.gap), by = -H / 2 + o.kh / 2 + ri * (o.kh + o.gap) - 4, style = k === 'B' ? 'danger' : k === 'E' ? (o.enterStyle || 'green') : 'ghost';
      const b = new KG.ui.Button(scene, bx, by, o.kw, o.kh, { label: k === 'B' ? '' : k === 'E' ? '' : k, icon: k === 'B' ? 'bksp' : k === 'E' ? (o.enterIcon || 'check') : null, style, size: Math.round(o.kh * 0.6), slant: 6, sfx: 'type', onClick: () => { if (c.enabled) c.fire(k); } });
      c.add(b); btns[k] = b;
    }));
    c.btns = btns;
    c.fire = k => { if (k === 'B') { if (o.onBack) o.onBack(); } else if (k === 'E') { if (o.onEnter) o.onEnter(); } else if (o.onDigit) o.onDigit(k); };
    // กดปุ่มจากคีย์บอร์ดจริง: ปุ่มบนจอยุบตามให้เห็น
    c.press = k => { if (!c.enabled || !btns[k]) return; const b = btns[k]; b.press(); scene.time.delayedCall(90, () => { if (b.scene) b.release(false); }); c.fire(k); KG.audio.play('type'); };
    c.setEnabled = v => { c.enabled = v; Object.keys(btns).forEach(k => btns[k].setEnabled(v)); return c; };
    return c;
  };
  // แปลงเหตุการณ์คีย์บอร์ดเป็นปุ่มของแป้น: '0'-'9' · 'B' (ลบ) · 'E' (ตกลง) หรือ null
  M.keyOf = e => { const c = e.code || '', m = /^(Digit|Numpad)(\d)$/.exec(c); if (m) return m[2]; if (c === 'Backspace' || c === 'Delete') return 'B'; if (c === 'Enter' || c === 'NumpadEnter') return 'E'; return null; };

  /* ---------- ปุ่มตัวเลือก: แถวเดียวหรือเป็นตาราง ----------
     คืน container ที่มี .btns · .pick(i) (เหมือนกดปุ่ม) · .mark(i, ok) · .setEnabled(v) · .clear()
     o: { w, h, gap, cols, size, fmt (แปลงค่าเป็นข้อความ), onPick(value, i, btn), keys: true (ผูกเลข 1..n), styles } */
  M.choices = function (scene, x, y, opts, o) {
    o = Object.assign({ w: 190, h: 96, gap: 18, size: 44, depth: 8, keys: true }, o); const n = opts.length, cols = o.cols || n, rows = Math.ceil(n / cols), c = scene.add.container(x, y).setDepth(o.depth), btns = [], st = o.styles || CHOICE_STYLES;
    c.enabled = true; c.opts = opts;
    const W = cols * o.w + (cols - 1) * o.gap, H = rows * o.h + (rows - 1) * o.gap; c.cW = W; c.cH = H;
    opts.forEach((v, i) => {
      const r = Math.floor(i / cols), k = i % cols, inRow = Math.min(cols, n - r * cols), rowW = inRow * o.w + (inRow - 1) * o.gap, bx = -rowW / 2 + o.w / 2 + k * (o.w + o.gap), by = -H / 2 + o.h / 2 + r * (o.h + o.gap);
      const label = o.fmt ? o.fmt(v) : String(v), b = new KG.ui.Button(scene, bx, by, o.w, o.h, { label, style: (o.styles && o.styles.length === 1) ? o.styles[0] : st[i % st.length], size: o.size, slant: 8, onClick: () => c.pick(i) });
      c.add(b); btns.push(b);
      if (o.keys) { const kb = KG.txt(scene, bx - o.w / 2 + 10, by - o.h / 2 + 4, String(i + 1), { size: 14, color: '#2d2a5e', ox: 0 }).setBackgroundColor('#ffffffcc').setPadding(4, 0, 4, 0).setDepth(2); c.add(kb); }
    });
    c.btns = btns; c.done = {};
    c.pick = i => { if (!c.enabled || c.done[i] || !btns[i]) return; if (o.onPick) o.onPick(opts[i], i, btns[i]); };
    c.mark = (i, ok) => {
      const b = btns[i]; if (!b) return; c.done[i] = 1; const wp = { x: c.x + b.x, y: c.y + b.y };
      if (ok) { scene.tweens.add({ targets: b, scaleX: 1.12, scaleY: 1.12, duration: 160, yoyo: true, ease: 'Back.easeOut' }); K.stars(scene, wp.x, wp.y, [0xffd34f, 0xffffff, 0x7fe0ff], 14); }
      else { b.setEnabled(false); scene.tweens.add({ targets: b, x: b.x + 9, duration: 50, yoyo: true, repeat: 3 }); }
    };
    c.setEnabled = v => { c.enabled = v; btns.forEach((b, i) => { if (!c.done[i] || v === false) b.setEnabled(v && !c.done[i]); }); return c; };
    c.clear = () => { c.destroy(true); };
    return c;
  };

  /* ---------- กล่องโจทย์ตัวโต: ข้อความกลางกล่อง ปรับขนาดให้พอดี ---------- */
  M.exprBox = function (scene, x, y, w, h, text, o) {
    o = Object.assign({ size: 64, depth: 6, color: '#8a5cf0' }, o); const c = scene.add.container(x, y).setDepth(o.depth);
    c.add(KG.ui.panel(scene, -w / 2, -h / 2, w, h, { accent: o.color, accent2: '#ffc400', cuts: [18, 0, 18, 0], glow: false, alpha: 0.97 }));
    const t = KG.txt(scene, 0, 0, text, { size: o.size, color: o.textColor || '#2d2a5e', center: true, middle: true, stroke: '#ffffff', sw: 6 }); c.add(t); c.t = t;
    c.setText = s => { t.setText(s); t.setScale(1); const m = w - 50; if (t.width > m) t.setScale(m / t.width); return c; };
    c.setText(text); return c;
  };

  /* ---------- กระเบื้องเลข (ใช้เรียงลำดับ/หาตัวเลข): ตัวมนมันวาว มีเงา ---------- */
  const TILE_COLORS = ['#3d8bff', '#ff9a2e', '#3fbf6a', '#ff5a8a', '#8a5cf0', '#18b8a0', '#ffc400'];
  M.tileTex = function (scene, w, h, color) {
    return KG.tex(scene, ['mktile', w, h, color].join('|'), w + 12, h + 22, c => {
      const x = 6, y = 4, r = Math.min(24, h * 0.26);
      c.fillStyle = 'rgba(45,42,94,.3)'; KG.ui.rrect(c, x + 2, y + 12, w, h, r); c.fill();
      c.fillStyle = K.shade(color, 0.62); KG.ui.rrect(c, x, y + 9, w, h, r); c.fill();
      c.fillStyle = KG.ui.lin(c, 0, y, 0, y + h, [[0, K.shade(color, 1.3)], [1, K.shade(color, 0.95)]]); KG.ui.rrect(c, x, y, w, h, r); c.fill();
      c.fillStyle = 'rgba(255,255,255,.34)'; KG.ui.rrect(c, x + 6, y + 5, w - 12, h * 0.34, r * 0.7); c.fill();
      c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; KG.ui.rrect(c, x, y, w, h, r); c.stroke();
    });
  };
  M.tile = function (scene, x, y, label, o) {
    o = Object.assign({ w: 120, h: 96, size: 50, color: TILE_COLORS[0], depth: 8 }, o); const c = scene.add.container(x, y).setDepth(o.depth), key = M.tileTex(scene, o.w, o.h, o.color);
    const im = scene.add.image(0, 5, key).setDisplaySize(o.w + 12, o.h + 22); const t = KG.txt(scene, 0, -2, String(label), { size: o.size, color: '#ffffff', center: true, middle: true, stroke: K.shade(o.color, 0.45), sw: Math.round(o.size * 0.16) });
    if (t.width > o.w - 14) t.setScale((o.w - 14) / t.width); c.add([im, t]); c.im = im; c.t = t; c.tw = o.w; c.th = o.h; c.color = o.color; c.value = label; c.setSize(o.w, o.h);
    c.recolor = col => { c.color = col; im.setTexture(M.tileTex(scene, o.w, o.h, col)); t.setStroke(K.shade(col, 0.45), Math.round(o.size * 0.16)); };
    return c;
  };
  M.TILE_COLORS = TILE_COLORS;

  /* ---------- เสียงอ่านโจทย์: ตัวเลขในประโยคให้ MK.words อ่าน (ผู้ใช้ปิดเสียง = ไม่พูด) ---------- */
  M.say = (text, rate) => K.voice.say(text, rate);

  /* ---------- ช่องกรอกคำตอบ: แสดงตัวเลขที่พิมพ์ มีเคอร์เซอร์กะพริบ ---------- */
  M.answerBox = function (scene, x, y, w, h, o) {
    o = Object.assign({ size: 56, color: '#16c7a8', max: 5, depth: 7 }, o); const c = scene.add.container(x, y).setDepth(o.depth), g = scene.add.graphics(); c.add(g); c.val = ''; c.state = 'idle';
    const t = KG.txt(scene, 0, 0, '', { size: o.size, color: '#2d2a5e', center: true, middle: true }); c.add(t); const cur = scene.add.rectangle(0, 0, 4, o.size * 0.9, 0x2d2a5e, 1); c.add(cur); scene.tweens.add({ targets: cur, alpha: 0.1, duration: 420, yoyo: true, repeat: -1 });
    const draw = () => {
      g.clear(); const fill = c.state === 'bad' ? 0xffe0dc : c.state === 'ok' ? 0xdcffe9 : 0xfff6c9, edge = c.state === 'bad' ? 0xe0243d : c.state === 'ok' ? 0x22b45a : K.hexInt(o.color);
      g.fillStyle(fill, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 16); g.lineStyle(5, edge, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
      t.setText(c.val); const tw = t.width * t.scaleX; cur.x = tw / 2 + 6; t.x = -(c.val ? 3 : 0); cur.setVisible(c.state === 'idle');
    };
    c.set = (v, st) => { c.val = String(v); c.state = st || 'idle'; draw(); return c; };
    c.type = d => { if (c.state !== 'idle' || c.val.length >= o.max) return; c.val = c.val === '0' ? d : c.val + d; draw(); };
    c.back = () => { if (c.state !== 'idle') return; c.val = c.val.slice(0, -1); draw(); };
    c.clearVal = () => c.set('', 'idle'); draw(); return c;
  };

  /* ---------- ตั้งปุ่มคีย์บอร์ดของฉาก: fn(e) รับเหตุการณ์ (ไม่ทำงานตอนมีหน้าต่างทับหรือพักเกม) ---------- */
  M.onKeys = function (scene, fn) {
    const h = e => { if (scene.over || scene.paused || (scene._modal && !scene._modal.closed)) return; fn(e); };
    scene.input.keyboard.on('keydown', h); scene.events.once('shutdown', () => { try { scene.input.keyboard.off('keydown', h); } catch (er) { /* ไม่เป็นไร */ } });
  };

  /* ---------- ฉากเล่นกลางของ 5 เกมคณิต: PlayBase + บอส (รูป + แถบพลัง สั่นเมื่อโดนตี หมุนหายเมื่อชนะ) ----------
     เกมสร้างคลาสลูกแล้วเขียน build() · ตั้งรายการคีย์ภาพบอสต่อโลกที่ Class.looks */
  M.BossPlay = class extends K.PlayBase {
    mkBoss() {
      const s = this, looks = this.constructor.looks || ['bot_puzzle'], k = looks[this.wi % looks.length]; if (!s.textures.exists(k)) return;
      this.bossImg = s.add.image(1190, 226, k).setOrigin(0.5, 1).setDepth(9); this.bossImg.setScale(140 / this.bossImg.height); this.bossX = this.bossImg.x;
      s.tweens.add({ targets: this.bossImg, y: this.bossImg.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); this.bossHp = s.add.graphics().setDepth(10); this.drawBossHp(1);
    }
    drawBossHp(f) { const g = this.bossHp; if (!g) return; g.clear(); g.fillStyle(0xd8dff2, 1); g.fillRoundedRect(1118, 234, 144, 16, 6); g.fillStyle(0xff4d5e, 1); g.fillRoundedRect(1118, 234, Math.max(0, 144 * f), 16, 6); g.lineStyle(3, 0x2d2a5e, 1); g.strokeRoundedRect(1118, 234, 144, 16, 6); }
    // ตีบอส: frac = พลังที่เหลือ 0..1
    hitBoss(frac) { if (!this.bossImg) return; this.drawBossHp(Math.max(0, frac)); const b = this.bossImg; this.tweens.add({ targets: b, x: this.bossX + 10, duration: 40, yoyo: true, repeat: 2, onComplete: () => b.setX(this.bossX) }); }
    ok(x, y, o) { super.ok(x, y, o); if (this.bossImg && this.goal) this.hitBoss(1 - this.done / this.goal); }
    win() {
      if (this.bossImg && !this.over) { const b = this.bossImg; KG.audio.play('kill'); K.ripple(this, b.x, b.y - 70, 0xffd34f); this.tweens.add({ targets: b, angle: 540, scaleX: 0.01, scaleY: 0.01, alpha: 0, duration: 700 }); }
      super.win();
    }
    starsFor() { const m = this.mist, g = Math.max(4, this.goal || 5); return m <= Math.floor(g * 0.2) ? 3 : m <= Math.floor(g * 0.6) ? 2 : 1; }
  };

  /* ---------- ตัวอักษร/ตัวเลขโปร่งลอยขึ้นช้า ๆ เป็นฉากหลังที่มีชีวิต (ไม่ใช้ภาพ) ---------- */
  M.floatDigits = function (scene, o) {
    o = Object.assign({ chars: '0123456789', n: 16, alpha: 0.4, depth: -7, size: [46, 86], colors: ['#ffffff', '#ffe28a', '#bfe3ff', '#ffc0d8'] }, o); const out = [];
    for (let i = 0; i < o.n; i++) {
      const ch = o.chars[Math.floor(Math.random() * o.chars.length)], sz = KG.rnd(o.size[0], o.size[1]), col = o.colors[i % o.colors.length];
      const t = KG.txt(scene, KG.rnd(0, GW), KG.rnd(0, GH), ch, { size: sz, color: col, center: true, middle: true, stroke: 'rgba(45,42,94,.25)', sw: 4 }).setAlpha(o.alpha).setDepth(o.depth).setAngle(KG.rnd(-16, 16));
      const run = () => { const sp = KG.rnd(18, 46); scene.tweens.add({ targets: t, y: -80, duration: (t.y + 80) / sp * 1000, ease: 'Linear', onComplete: () => { t.y = GH + 80; t.x = KG.rnd(0, GW); run(); } }); };
      run(); scene.tweens.add({ targets: t, angle: t.angle + KG.rnd(-12, 12), duration: KG.rnd(2500, 5000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); out.push(t);
    }
    return out;
  };

  /* ---------- ภาพเกม: เปิดฉากหลังจากภาพ (ถ้ามี) ปกติใช้ K.bg ของ kit ---------- */
  M.bgImage = function (scene, key, o) {
    o = o || {}; if (!scene.textures.exists(key)) return null; const im = scene.add.image(GW / 2, GH / 2, key).setDepth(0); im.setScale(Math.max(GW / im.width, GH / im.height));
    if (o.veil) { const g = scene.add.graphics().setDepth(0.5); g.fillStyle(o.veil[0], o.veil[1]); g.fillRect(0, 0, GW, GH); }
    return im;
  };
})();
