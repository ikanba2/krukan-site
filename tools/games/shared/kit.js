/* ===== KG.kit: ชุดเครื่องมือกลางของเกมฝึกทักษะ 4 เกม (เมืองสีรุ้ง · จอมจังหวะ · ภารกิจแป้นพิมพ์ · ผจญภัยเมาส์) =====
   เสียงพูดไทย · เสียงเอฟเฟกต์เพิ่ม · ท่าไรเดอร์โค้ช (ภาพโปร่งใสไม่ถือดาบ) · ฉากหลัง · รูปทรงสีสด · หน้าเลือกโลก/ด่าน · แถบหัวจอ · ฐานฉากเล่น (นับถอยหลัง ดาว สรุปผล)
   เกมเรียกใช้ผ่าน GAMES 'extra': ['rider.js', 'scenes.js', 'kit.js'] และตั้ง K.game = {...} ใน data.js ของเกม */
(function () {
  'use strict';
  const GW = KG.GW, GH = KG.GH, K = KG.kit = { game: null };

  /* ---------- สุ่มแบบมีเมล็ด (ด่านเดียวกันได้โจทย์เดียวกันเมื่อใช้เมล็ดเดียวกัน) ---------- */
  K.rng = seed => { let s = (seed >>> 0) || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  K.pick = (R, a) => a[Math.floor(R() * a.length)];
  K.ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  K.shuffle = (R, a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = x[i]; x[i] = x[j]; x[j] = t; } return x; };
  K.hexInt = s => parseInt(String(s).replace('#', ''), 16);

  /* ---------- เสียงพูดภาษาไทย (Web Speech API) ผู้เล่นปิดเสียงเอฟเฟกต์ = ปิดเสียงพูดด้วย ---------- */
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  let tv = null;
  const chooseVoice = () => {
    if (!hasTTS) return; const vs = (speechSynthesis.getVoices && speechSynthesis.getVoices()) || [];
    tv = vs.find(v => /^th/i.test(v.lang) && /premwadee|niwat|achara|natural|online/i.test(v.name)) || vs.find(v => /^th/i.test(v.lang)) || null;
  };
  if (hasTTS) { chooseVoice(); try { speechSynthesis.addEventListener('voiceschanged', chooseVoice); } catch (e) { /* ไม่เป็นไร */ } }
  K.voice = {
    get can() { return hasTTS && !!tv && KG.prefs.data.sfx !== false; },
    get exists() { return hasTTS && !!tv; },
    say(text, rate) {
      if (!this.can || !text) return;
      try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text)); u.voice = tv; u.lang = tv.lang || 'th-TH'; u.rate = rate || 0.85; u.pitch = 1.08; speechSynthesis.speak(u); } catch (e) { /* ไม่เป็นไร */ }
    },
    stop() { if (hasTTS) { try { speechSynthesis.cancel(); } catch (e) { /* ไม่เป็นไร */ } } }
  };

  /* ---------- เสียงเอฟเฟกต์เพิ่ม (ใช้ชุดสังเคราะห์ของ KG.audio) ---------- */
  const S = KG.audio.sfx, T = (o) => KG.audio.tone(o), N = (o) => KG.audio.noise(o), mtof = n => 440 * Math.pow(2, (n - 69) / 12);
  S.balloon = () => { N({ f: 2600, f2: 500, t: 0.12, vol: 0.2, q: 0.7 }); T({ f: 560, f2: 160, t: 0.1, type: 'triangle', vol: 0.09 }); };
  S.chest = () => { T({ f: 190, f2: 80, t: 0.2, type: 'square', vol: 0.07 }); [523, 659, 784, 1047, 1319].forEach((f, i) => T({ f, t: 0.18, type: 'triangle', vol: 0.06, delay: 0.12 + i * 0.05 })); N({ f: 6500, t: 0.3, vol: 0.05, ft: 'highpass', delay: 0.2 }); };
  S.magic = () => { [1175, 1568, 1976, 2349, 3136].forEach((f, i) => T({ f, t: 0.16, type: 'sine', vol: 0.05, delay: i * 0.045 })); N({ f: 7000, t: 0.3, vol: 0.04, ft: 'highpass' }); };
  S.boing = () => { T({ f: 180, f2: 560, t: 0.2, type: 'sine', vol: 0.11 }); T({ f: 360, f2: 900, t: 0.16, type: 'triangle', vol: 0.04, delay: 0.05 }); };
  S.ding = o => { const f = (o && o.f) || 1318; T({ f, t: 0.32, type: 'sine', vol: 0.09 }); T({ f: f * 2, t: 0.22, type: 'sine', vol: 0.03 }); };
  S.clap = () => { N({ f: 1800, t: 0.07, vol: 0.2, q: 0.8 }); N({ f: 2500, t: 0.1, vol: 0.12, q: 0.8, delay: 0.03 }); };
  S.swish = () => { N({ f: 500, f2: 3800, t: 0.18, vol: 0.1, q: 1.1 }); };
  S.zip = () => { T({ f: 300, f2: 1500, t: 0.12, type: 'sawtooth', vol: 0.04 }); N({ f: 2000, f2: 6000, t: 0.12, vol: 0.05, ft: 'highpass' }); };
  S.lockOpen = () => { T({ f: 800, t: 0.05, type: 'square', vol: 0.05 }); T({ f: 1200, t: 0.1, type: 'square', vol: 0.05, delay: 0.06 }); T({ f: 600, f2: 300, t: 0.14, type: 'triangle', vol: 0.06, delay: 0.14 }); };
  // เสียงกลองกับโน้ตระฆังสำหรับเกมจังหวะ
  S.kick = () => { T({ f: 150, f2: 40, t: 0.14, type: 'sine', vol: 0.32 }); };
  S.snare = () => { N({ f: 1900, t: 0.12, vol: 0.14, q: 0.6 }); T({ f: 210, f2: 150, t: 0.09, type: 'triangle', vol: 0.1 }); };
  S.hat = () => { N({ f: 8000, t: 0.04, vol: 0.07, ft: 'highpass' }); };
  S.tom = o => { const f = (o && o.f) || 140; T({ f, f2: f * 0.5, t: 0.18, type: 'sine', vol: 0.2 }); };
  S.bell = o => { const f = (o && o.f) || 880; T({ f, t: 0.28, type: 'sine', vol: 0.1 }); T({ f: f * 2.01, t: 0.2, type: 'sine', vol: 0.04 }); T({ f: f * 3.02, t: 0.12, type: 'triangle', vol: 0.025 }); };
  K.mtof = mtof;

  /* ---------- ท่าไรเดอร์โค้ช ---------- */
  K.hasPose = (scene, n) => scene.textures.exists('pose_' + n);
  K.pose = function (scene, n, x, y, h, o) {
    o = o || {}; const k = 'pose_' + n; if (!scene.textures.exists(k)) return null;
    const im = scene.add.image(x, y, k).setOrigin(0.5, 1); im.setScale(h / im.height); if (o.flip) im.setFlipX(true); if (o.depth != null) im.setDepth(o.depth); return im;
  };
  const CHEER = ['thumbs', 'highfive', 'victory', 'heart', 'star', 'dance', 'medal', 'confetti', 'jump'], OOPS = ['puzzled', 'chin', 'think'], HINT = ['pointR', 'present', 'pointDown'];
  K.LINES = {
    good: ['เก่งมาก!', 'ถูกต้อง!', 'สุดยอด!', 'เยี่ยมเลย!', 'ทำได้แล้ว!', 'ว้าว เก่งจัง!', 'ใช่เลย!'],
    bad: ['ลองอีกทีนะ', 'ใกล้แล้ว!', 'ไม่เป็นไร ลองใหม่', 'ค่อย ๆ ดูนะ', 'สู้ ๆ นะ'],
    win: ['ผ่านด่านแล้ว!', 'เก่งที่สุดเลย!', 'ยอดเยี่ยม!'],
    hint: ['ดูตรงนี้นะ', 'ลองดูตรงนี้', 'อยู่ตรงนี้นะ']
  };
  K.Coach = class {
    constructor(scene, x, y, h, o) {
      o = o || {}; this.s = scene; this.x = x; this.y = y; this.h = h; this.base = o.base || 'ready'; this.flip = !!o.flip; this.depth = o.depth == null ? 30 : o.depth; this.bubbleSide = o.bubble || 1; this.pose = null;
      this.sh = scene.add.ellipse(x, y - 3, h * 0.46, h * 0.07, 0x2d2a5e, 0.22).setDepth(this.depth - 1);
      this.img = scene.add.image(x, y, 'pose_' + this.base).setOrigin(0.5, 1).setDepth(this.depth);
      this.set(this.base); this.bob = scene.tweens.add({ targets: this.img, scaleY: this.img.scaleY * 1.018, scaleX: this.img.scaleX * 0.992, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.bub = null; this.back = null;
    }
    set(n) {
      if (!K.hasPose(this.s, n)) return; this.pose = n; this.img.setTexture('pose_' + n); this.img.setScale(this.h / this.img.height); this.img.setFlipX(this.flip);
      if (this.bob) { this.bob.remove(); this.bob = this.s.tweens.add({ targets: this.img, scaleY: this.img.scaleY * 1.018, scaleX: this.img.scaleX * 0.992, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
    }
    setPos(x, y) { this.x = x; this.y = y; this.img.setPosition(x, y); this.sh.setPosition(x, y - 3); }
    // ท่าสั้น ๆ แล้วกลับท่าเดิม
    act(n, ms) {
      this.set(n); if (this.back) this.back.remove();
      this.back = this.s.time.delayedCall(ms || 1500, () => this.set(this.base));
      this.s.tweens.killTweensOf(this.img); this.img.y = this.y; this.s.tweens.add({ targets: this.img, y: this.y - 22, duration: 150, yoyo: true, ease: 'Quad.easeOut' });
    }
    react(kind, text, ms) {
      const all = kind === 'good' ? CHEER : kind === 'bad' ? OOPS : HINT, R = Math.random, list = all.filter(n => K.hasPose(this.s, n));   // ใช้เฉพาะท่าที่ฝังมาในเกมนั้น
      this.act(list.length ? list[Math.floor(R() * list.length)] : this.base, ms || 1500);
      const lines = K.LINES[kind] || []; this.say(text || lines[Math.floor(R() * lines.length)], ms || 1500);
    }
    say(text, ms) {
      if (!text) return; const s = this.s; if (this.bub) { this.bub.destroy(); this.bub = null; }
      const t = KG.txt(s, 0, 0, text, { size: 22, color: '#2d2a5e', center: true, middle: true, width: 250 }), w = Math.max(110, t.width + 36), h = t.height + 22;
      const key = KG.tex(s, 'kitbub|' + Math.round(w) + '|' + Math.round(h), w + 16, h + 26, ctx => {
        ctx.translate(8, 6); KG.ui.rrect(ctx, 0, 4, w, h, 18); ctx.fillStyle = 'rgba(45,42,94,.22)'; ctx.fill();
        KG.ui.rrect(ctx, 0, 0, w, h, 18); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#2d2a5e'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(22, h - 1); ctx.lineTo(10, h + 16); ctx.lineTo(40, h - 1); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.beginPath(); ctx.moveTo(22, h); ctx.lineTo(10, h + 16); ctx.lineTo(38, h); ctx.stroke();
      });
      const c = this.bub = s.add.container(this.x + 52 * this.bubbleSide, this.y - this.h * 0.8).setDepth(this.depth + 5);
      const bg = s.add.image(w / 2 * this.bubbleSide, 0, key).setOrigin(0.5, 1); if (this.bubbleSide < 0) bg.setFlipX(true);
      c.add(bg); t.setPosition(w / 2 * this.bubbleSide, -h / 2 - 5); c.add(t); c.setScale(0.3).setAlpha(0);
      s.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 190, ease: 'Back.easeOut' });
      s.tweens.add({ targets: c, alpha: 0, delay: ms || 1500, duration: 250, onComplete: () => { if (this.bub === c) this.bub = null; c.destroy(); } });
    }
    destroy() { if (this.bob) this.bob.remove(); if (this.back) this.back.remove(); if (this.bub) this.bub.destroy(); this.img.destroy(); this.sh.destroy(); }
  };

  /* ---------- ฉากหลัง ---------- */
  K.bg = function (scene, key, o) {
    o = o || {};
    const im = scene.add.image(GW / 2, GH / 2, key).setDisplaySize(GW * 1.06, GH * 1.06).setDepth(-10);
    if (o.drift !== false) scene.tweens.add({ targets: im, x: GW / 2 + 16, y: GH / 2 + 8, duration: 10000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (o.veil) scene.add.rectangle(GW / 2, GH / 2, GW, GH, o.veil[0], o.veil[1]).setDepth(-9);
    return im;
  };
  const cloudTex = (scene, w) => KG.tex(scene, 'kitcloud|' + w, w + 20, w * 0.55 + 20, c => {
    c.translate(10, 10); const h = w * 0.55; const bl = [[0.22, 0.62, 0.2], [0.42, 0.42, 0.26], [0.66, 0.5, 0.22], [0.82, 0.66, 0.16], [0.52, 0.7, 0.24]];
    c.shadowColor = 'rgba(45,42,94,.18)'; c.shadowBlur = 10; c.fillStyle = '#ffffff'; bl.forEach(b => { c.beginPath(); c.arc(b[0] * w, b[1] * h, b[2] * w, 0, 7); c.fill(); });
    c.shadowBlur = 0; c.fillStyle = 'rgba(190,215,255,.5)'; c.beginPath(); c.ellipse(w * 0.52, h * 0.92, w * 0.42, h * 0.12, 0, 0, 7); c.fill();
  });
  // เมฆลอยผ่านช้า ๆ (ฉากหลังมีชีวิต)
  K.clouds = function (scene, n, o) {
    o = o || {}; const out = [];
    for (let i = 0; i < n; i++) {
      const w = KG.rnd(120, 240), c = scene.add.image(KG.rnd(0, GW), KG.rnd(o.y0 || 90, o.y1 || 330), cloudTex(scene, Math.round(w))).setAlpha(o.alpha || 0.8).setDepth(o.depth == null ? -8 : o.depth);
      const run = () => { const sp = KG.rnd(60, 140); scene.tweens.add({ targets: c, x: GW + 220, duration: (GW + 220 - c.x) / sp * 1000, ease: 'Linear', onComplete: () => { c.x = -220; c.y = KG.rnd(o.y0 || 90, o.y1 || 330); run(); } }); };
      run(); out.push(c);
    }
    return out;
  };

  /* ---------- รูปทรงสีสด (ใช้เป็นเป้าหมาย/ชิ้นส่วน) ---------- */
  K.COL = { red: '#ff4a4a', blue: '#3d8bff', yellow: '#ffc82e', green: '#3fbf6a', pink: '#ff7ab8', orange: '#ff9a2e', purple: '#9a6af0' };
  K.COLNAME = { red: 'สีแดง', blue: 'สีฟ้า', yellow: 'สีเหลือง', green: 'สีเขียว', pink: 'สีชมพู', orange: 'สีส้ม', purple: 'สีม่วง' };
  K.SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'hexagon', 'oval'];
  K.SHAPENAME = { circle: 'วงกลม', square: 'สี่เหลี่ยม', triangle: 'สามเหลี่ยม', star: 'ดาว', heart: 'หัวใจ', diamond: 'ข้าวหลามตัด', hexagon: 'หกเหลี่ยม', oval: 'วงรี' };
  K.shade = (hex, k) => { const n = K.hexInt(hex); const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')'; };
  K.shapePath = function (c, shape, cx, cy, r) {
    c.beginPath();
    switch (shape) {
      case 'circle': c.arc(cx, cy, r, 0, Math.PI * 2); break;
      case 'oval': c.ellipse(cx, cy, r, r * 0.66, 0, 0, Math.PI * 2); break;
      case 'square': { const q = r * 0.86; KG.ui.rrect(c, cx - q, cy - q, q * 2, q * 2, r * 0.18); break; }
      case 'triangle': c.moveTo(cx, cy - r); c.lineTo(cx + r * 0.98, cy + r * 0.78); c.lineTo(cx - r * 0.98, cy + r * 0.78); c.closePath(); break;
      case 'diamond': c.moveTo(cx, cy - r); c.lineTo(cx + r * 0.78, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r * 0.78, cy); c.closePath(); break;
      case 'hexagon': for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); break;
      case 'star': for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.44 : r; c.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } c.closePath(); break;
      case 'heart': c.moveTo(cx, cy + r * 0.86); c.bezierCurveTo(cx - r * 1.5, cy - r * 0.1, cx - r * 0.7, cy - r * 1.0, cx, cy - r * 0.34); c.bezierCurveTo(cx + r * 0.7, cy - r * 1.0, cx + r * 1.5, cy - r * 0.1, cx, cy + r * 0.86); c.closePath(); break;
      default: c.arc(cx, cy, r, 0, Math.PI * 2);
    }
  };
  // สไตล์: 'solid' (มันวาวมีขอบ) · 'outline' (เส้นประ ใช้เป็นช่องวาง) · 'shadow' (เงาเข้ม)
  K.shapeTex = function (scene, shape, color, size, style) {
    style = style || 'solid'; const hex = K.COL[color] || color || '#ffc82e', pad = 10;
    return KG.tex(scene, ['kshape', shape, hex, size, style].join('|'), size + pad * 2, size + pad * 2, c => {
      const cx = size / 2 + pad, cy = size / 2 + pad, r = size * 0.46;
      if (style === 'outline') { K.shapePath(c, shape, cx, cy, r); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); c.setLineDash([9, 7]); c.lineWidth = 4; c.strokeStyle = '#2d2a5e'; c.lineJoin = 'round'; c.stroke(); return; }
      if (style === 'shadow') { K.shapePath(c, shape, cx, cy, r); c.fillStyle = 'rgba(45,42,94,.55)'; c.fill(); return; }
      K.shapePath(c, shape, cx, cy + 4, r); c.fillStyle = 'rgba(45,42,94,.26)'; c.fill();
      K.shapePath(c, shape, cx, cy, r); c.fillStyle = KG.ui.lin(c, 0, cy - r, 0, cy + r, [[0, K.shade(hex, 1.18)], [1, K.shade(hex, 0.86)]]); c.fill();
      c.save(); K.shapePath(c, shape, cx, cy, r); c.clip(); c.fillStyle = 'rgba(255,255,255,.34)'; c.beginPath(); c.ellipse(cx - r * 0.18, cy - r * 0.55, r * 0.7, r * 0.34, -0.3, 0, 7); c.fill(); c.restore();
      K.shapePath(c, shape, cx, cy, r); c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = '#2d2a5e'; c.stroke();
    });
  };
  // ลูกโป่ง (ตัวสีสด + เงาสะท้อน + เชือก)
  K.balloonTex = (scene, color, size) => KG.tex(scene, 'kballoon|' + color + '|' + size, size * 0.95, size * 1.3, c => {
    const hex = K.COL[color] || color, w = size * 0.95, cx = w / 2, cy = size * 0.5, r = size * 0.44;
    c.beginPath(); c.moveTo(cx, cy + r * 1.02); c.quadraticCurveTo(cx - 6, cy + r * 1.35, cx + 4, cy + r * 1.62); c.lineWidth = 2.5; c.strokeStyle = '#2d2a5e'; c.stroke();
    c.beginPath(); c.moveTo(cx, cy - r); c.bezierCurveTo(cx + r * 1.3, cy - r * 0.9, cx + r * 1.1, cy + r * 0.9, cx, cy + r * 1.02); c.bezierCurveTo(cx - r * 1.1, cy + r * 0.9, cx - r * 1.3, cy - r * 0.9, cx, cy - r); c.closePath();
    c.fillStyle = KG.ui.lin(c, 0, cy - r, 0, cy + r, [[0, K.shade(hex, 1.2)], [1, K.shade(hex, 0.84)]]); c.fill(); c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = '#2d2a5e'; c.stroke();
    c.beginPath(); c.moveTo(cx - 6, cy + r * 1.02); c.lineTo(cx + 6, cy + r * 1.02); c.lineTo(cx, cy + r * 1.16); c.closePath(); c.fillStyle = K.shade(hex, 0.8); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(cx - r * 0.42, cy - r * 0.4, r * 0.18, r * 0.34, -0.5, 0, 7); c.fill();
  });

  /* ---------- เอฟเฟกต์ ---------- */
  K.stars = (scene, x, y, colors, n) => KG.fx.burst(scene, x, y, { colors: colors || [0xffd34f, 0xffffff, 0xff7ab8], n: n || 16, max: 300, tex: 'fx_star', rot: true, life: 800, depth: 62, g: 120 });
  K.ripple = (scene, x, y, color) => { KG.fx.ring(scene, x, y, color == null ? 0xffffff : color, { size: 1.3, w: 0.45, depth: 61 }); KG.fx.ring(scene, x, y, 0xffffff, { size: 0.8, w: 0.3, depth: 61 }); };
  // ประกายตามเมาส์/นิ้ว
  K.cursorTrail = function (scene, colors) {
    const o = { x: -100, y: -100 };
    const em = scene.add.particles(0, 0, 'fx_spark', { follow: o, scale: { start: 0.45, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 420, frequency: 34, tint: colors || [0xff7ab8, 0xffd34f, 0x7fe0ff], blendMode: 'NORMAL' }).setDepth(90);
    const f = () => { const p = scene.input.activePointer; if (p) { o.x = p.worldX; o.y = p.worldY; } };
    scene.events.on('update', f); scene.events.once('shutdown', () => scene.events.off('update', f));
    return em;
  };
  // ข้อความตัวใหญ่กลางจอ (แบนเนอร์) เด้งเข้าแล้วหาย
  K.banner = function (scene, text, color, ms) {
    const t = KG.txt(scene, GW / 2, GH * 0.38, text, { size: 78, color: color || '#ffffff', center: true, middle: true, stroke: '#2d2a5e', sw: 12 }).setDepth(3200).setScale(0.3).setAlpha(0);
    scene.tweens.add({ targets: t, scaleX: 1, scaleY: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    scene.tweens.add({ targets: t, alpha: 0, y: t.y - 40, delay: ms || 900, duration: 320, onComplete: () => t.destroy() });
    return t;
  };

  /* ---------- แถบหัวจอ ---------- */
  K.hud = function (scene, o) {
    o = o || {}; const pop = KG.SKIN.pop, col = K.hexInt(o.color || '#8a5cf0');
    const g = scene.add.graphics().setDepth(20);
    if (pop) { g.fillStyle(0xffffff, 0.9); g.fillRect(0, 0, GW, 72); g.fillStyle(col, 1); g.fillRect(0, 69, GW, 5); } else { g.fillStyle(0x050818, 0.88); g.fillRect(0, 0, GW, 72); g.fillStyle(col, 1); g.fillRect(0, 70, GW, 3); }
    const home = iconButton(scene, 44, 36, o.back === 'pause' ? 'pause' : 'home', o.onHome, { w: 56, h: 50, depth: 25 });
    const kicker = KG.txt(scene, 86, 4, o.kicker || '', { size: 15, color: o.color || KG.SKIN.hi }).setDepth(25);
    const title = KG.txt(scene, 86, 22, o.title || '', { size: 30, stroke: true }).setDepth(25); if (title.width > 560) title.setScale(560 / title.width);
    const sys = addSystemButtons(scene, o.sysX || 1100, 36, 62, ['sfx', 'music', 'fs']); sys.forEach(b => b.setDepth(25).setScale(0.86));
    return { g, home, kicker, title, sys };
  };
  // ป้ายคำสั่ง: ไอคอนซ้าย ข้อความกลาง ปุ่มฟังเสียงขวา (อ่านออกเสียงให้เด็กที่ยังอ่านไม่คล่อง)
  K.card = function (scene, x, y, w, text, o) {
    o = o || {}; const h = o.h || 66, c = scene.add.container(x, y).setDepth(18);
    c.add(KG.ui.panel(scene, -w / 2, 0, w, h, { cuts: [18, 0, 18, 0], accent: o.accent || KG.SKIN.panelAccent, glow: false, alpha: 0.96 }));
    const off = o.icon ? 74 : 0; if (o.icon) { o.icon.setPosition(-w / 2 + 14 + 32, h / 2); c.add(o.icon); }
    const t = KG.txt(scene, -w / 2 + 28 + off, h / 2, text, { size: o.size || 25, middle: true, width: w - 150 - off }); c.add(t);
    if (t.height > h - 8) t.setScale((h - 8) / t.height);
    const say = new KG.ui.Button(scene, w / 2 - 44, h / 2 - 2, 62, 48, { label: '', icon: 'sound', style: 'cyan', slant: 6, onClick: () => K.voice.say(o.say || text) }); c.add(say);
    c.setText = (s, voice) => { t.setText(KG.wrap(s, w - 150 - off, '600 ' + (o.size || 25) + 'px Kanit')); t.setScale(1); if (t.height > h - 8) t.setScale((h - 8) / t.height); o.say = voice || s; };
    return c;
  };

  /* ---------- หน้าเลือกโลกและด่าน (ใช้ร่วมทั้ง 4 เกม) ----------
     cfg: { skin ภายนอกตั้งเอง, bg: คีย์ภาพ, music, kicker, title, worlds: [{ id, th, sub, color, icon, desc, levels: [{ th, d }] }],
            starsOf(wi, li), selected() → {w, l}, select(w, l), play(scene, w, l), howTo, back, total() → {got, max} } */
  K.makeMap = function (cfg) {
    return class extends KG.Scene {
      constructor() { super('Map'); }
      init(d) { this._modal = null; this._restartData = d || {}; this.tabs = []; this.nodes = []; this.detail = null; this.ring = null; }
      create() {
        this.setup(cfg.bgColor || '#bfe3ff'); KG.audio.music(cfg.music || 'sunny');
        const sel = cfg.selected(); this.wi = Math.max(0, Math.min(cfg.worlds.length - 1, sel.w || 0)); this.li = sel.l || 0;
        if (cfg.bg) { K.bg(this, cfg.bg, { veil: cfg.veil || [0xffffff, 0.28] }); if (cfg.clouds !== false) K.clouds(this, 5, { alpha: 0.5 }); }
        KG.fx.ambient(this, { freq: 300, colors: cfg.fxColors || [0xffffff, 0xffd34f, 0xff7ab8], s: 0.35, alpha: 0.6 });
        const g = this.add.graphics().setDepth(3);
        if (KG.SKIN.pop) { g.fillStyle(0xffffff, 0.9); g.fillRect(0, 0, GW, 72); g.fillStyle(K.hexInt(cfg.color || '#8a5cf0'), 1); g.fillRect(0, 69, GW, 5); } else { g.fillStyle(0x050818, 0.9); g.fillRect(0, 0, GW, 72); g.fillStyle(K.hexInt(cfg.color || '#4ef4d2'), 1); g.fillRect(0, 70, GW, 3); }
        iconButton(this, 44, 36, 'home', () => this.go(cfg.back || 'Title'), { w: 56, h: 50, depth: 5 });
        this.txt(86, 4, cfg.kicker || '', { size: 15, color: cfg.color || KG.SKIN.hi }).setDepth(5);
        this.txt(86, 22, cfg.title || 'เลือกภารกิจ', { size: 30, stroke: true }).setDepth(5);
        const tot = cfg.total(); KG.ui.icon(this, 'star', 560, 36, 28, 0xffb800).setDepth(5); this.txt(580, 36, tot.got + ' / ' + tot.max, { size: 24, color: KG.SKIN.pop ? '#e8920a' : '#ffd34f', oy: 0.5 }).setDepth(5);
        iconButton(this, 1028, 36, 'help', () => KG.howTo(this, cfg.howTo), { w: 56, h: 50, depth: 5 });
        addSystemButtons(this, 1094, 36, 62, ['sfx', 'music', 'fs']).forEach(b => b.setDepth(5).setScale(0.86));
        this.buildTabs(); this.buildWorld(true);
        this.input.keyboard.on('keydown', e => this.onKey(e));
      }
      onEscape() { if (this._modal && !this._modal.closed) { this._modal.close(); return; } this.go(cfg.back || 'Title'); }
      onKey(e) {
        if (this._modal && !this._modal.closed) { if (e.code === 'Enter' || e.code === 'Space') this._modal.close(); return; }
        const c = e.code, n = cfg.worlds[this.wi].levels.length, dg = /^(Digit|Numpad)([1-9])$/.exec(c);
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space', 'Tab'].includes(c)) { try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } }
        if (c === 'ArrowRight') this.pick((this.li + 1) % n); else if (c === 'ArrowLeft') this.pick((this.li - 1 + n) % n);
        else if (c === 'ArrowDown' || (c === 'Tab' && !e.shiftKey)) this.setWorld((this.wi + 1) % cfg.worlds.length); else if (c === 'ArrowUp' || (c === 'Tab' && e.shiftKey)) this.setWorld((this.wi - 1 + cfg.worlds.length) % cfg.worlds.length);
        else if (c === 'Enter' || c === 'NumpadEnter' || c === 'Space') this.start(); else if (dg && +dg[2] <= n) this.pick(+dg[2] - 1);
        else if (c === 'KeyF') KG.fullscreen();
      }
      worldStars(wi) { let s = 0; cfg.worlds[wi].levels.forEach((L, li) => { s += cfg.starsOf(wi, li); }); return s; }
      buildTabs() {
        const pop = KG.SKIN.pop, N = cfg.worlds.length, ph = Math.min(74, Math.floor(620 / N));
        cfg.worlds.forEach((W, i) => {
          const x = 18, y = 88 + i * (ph + 4), col = K.hexInt(W.color), c = this.add.container(x, y).setDepth(4), g = this.add.graphics(); c.add(g);
          const ic = KG.ui.icon(this, W.icon, 38, ph / 2, ph - 26, 0xffffff); c.add(ic);
          c.add(KG.txt(this, 78, 6, W.th, { size: 21 })); c.add(KG.txt(this, 78, ph - 28, 'โลก ' + (i + 1), { size: 13, weight: 400, color: W.color, oy: 0 }));
          const st = KG.txt(this, 272, ph - 26, this.worldStars(i) + '/' + W.levels.length * 3, { size: 13, color: pop ? '#c47a00' : '#ffd34f', ox: 1 }); c.add(st);
          const z = this.add.zone(142, ph / 2, 284, ph).setInteractive({ useHandCursor: true }); c.add(z);
          z.on('pointerup', () => this.setWorld(i)); z.on('pointerover', () => { if (i !== this.wi) { g.setAlpha(0.85); KG.audio.play('hover'); } }); z.on('pointerout', () => g.setAlpha(1));
          const draw = on => { g.clear(); g.fillStyle(pop ? 0xffffff : (on ? 0x16245e : 0x0a1030), pop ? (on ? 0.98 : 0.8) : (on ? 0.98 : 0.86)); g.fillRoundedRect(0, 0, 284, ph, 16); g.lineStyle(on ? 4 : 2, on ? col : (pop ? 0x9aa6d8 : 0x2f3d84), 1); g.strokeRoundedRect(0, 0, 284, ph, 16); g.fillStyle(col, on ? 1 : 0.8); g.fillRoundedRect(8, 7, 58, ph - 14, 12); };
          draw(i === this.wi); this.tabs.push({ c, draw, st }); c.setAlpha(0).x -= 30; this.tweens.add({ targets: c, x, alpha: 1, duration: 280, delay: i * 35, ease: 'Cubic.easeOut' });
        });
      }
      setWorld(i) {
        if (i === this.wi) return; this.wi = i; this.li = Math.min(cfg.selected().w === i ? cfg.selected().l : this.firstOpen(i), cfg.worlds[i].levels.length - 1); KG.audio.play('whoosh');
        this.tabs.forEach((t, k) => t.draw(k === i)); this.buildWorld(true); cfg.select(this.wi, this.li);
      }
      firstOpen(wi) { const n = cfg.worlds[wi].levels.length; for (let l = 0; l < n; l++) if (!cfg.starsOf(wi, l)) return l; return 0; }
      pos(i, n) {
        const per = n > 5 ? Math.ceil(n / 2) : n, row = n > 5 ? Math.floor(i / per) : 0, col = i % per, cols = per, x0 = 330, x1 = 1226, step = (x1 - x0) / cols;
        const x = x0 + step * (row % 2 ? (cols - 1 - col) : col) + step / 2, y = n > 5 ? 312 + row * 168 : 380; return { x, y: y + (col % 2 ? 14 : -14) };
      }
      buildWorld(anim) {
        if (this.wc) this.wc.destroy(true); if (this.detail) { this.detail.destroy(true); this.detail = null; } if (this.ring) { this.ring.destroy(); this.ring = null; }
        const W = cfg.worlds[this.wi], col = K.hexInt(W.color), pop = KG.SKIN.pop, wc = this.wc = this.add.container(0, 0).setDepth(4); this.nodes = [];
        wc.add(KG.ui.panel(this, 316, 86, 944, 538, { accent: W.color, accent2: W.color, cuts: [22, 0, 22, 0], glow: false, alpha: pop ? 0.82 : 0.9 }));
        const ban = this.add.graphics(); ban.fillStyle(col, 1); ban.fillRoundedRect(334, 100, 908, 74, 18); ban.fillStyle(0xffffff, 0.22); ban.fillRoundedRect(340, 104, 896, 24, 12); wc.add(ban);
        wc.add(KG.ui.icon(this, W.icon, 376, 137, 48, 0xffffff)); wc.add(KG.txt(this, 416, 100, W.th, { size: 30, color: '#ffffff', stroke: K.shade(W.color, 0.5), sw: 6 }));
        wc.add(KG.txt(this, 416, 146, W.skill || W.sub || '', { size: 15, weight: 400, color: '#ffffff', width: 560 }));
        wc.add(KG.txt(this, 1224, 118, 'โลก ' + (this.wi + 1) + ' / ' + cfg.worlds.length, { size: 20, color: '#ffffff', ox: 1 }));
        wc.add(KG.txt(this, 1224, 144, this.worldStars(this.wi) + ' / ' + W.levels.length * 3 + ' ดาว', { size: 17, weight: 400, color: '#ffffff', ox: 1 }));
        const path = this.add.graphics(); wc.add(path); const n = W.levels.length;
        for (let i = 0; i < n - 1; i++) { const a = this.pos(i, n), b = this.pos(i + 1, n), lit = cfg.starsOf(this.wi, i) > 0; path.lineStyle(14, lit ? 0xffc400 : (pop ? 0xc9d4f2 : 0x25306a), 1); path.lineBetween(a.x, a.y, b.x, b.y); if (lit) { path.lineStyle(4, 0xffffff, 0.9); path.lineBetween(a.x, a.y, b.x, b.y); } }
        W.levels.forEach((L, i) => this.makeNode(wc, L, i, n, W, col, anim));
        this.pick(this.li, true);
      }
      makeNode(wc, L, i, n, W, col, anim) {
        const p = this.pos(i, n), boss = i === n - 1, r = boss ? 58 : 48, st = cfg.starsOf(this.wi, i), c = this.add.container(p.x, p.y); wc.add(c);
        const tex = KG.tex(this, ['kitnode', r, W.color, boss, st > 0].join('|'), r * 2 + 30, r * 2 + 30, ctx => {
          const cx = r + 15, cy = r + 15; ctx.beginPath(); ctx.arc(cx, cy + 6, r, 0, 7); ctx.fillStyle = 'rgba(45,42,94,.28)'; ctx.fill();
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = KG.ui.lin(ctx, 0, cy - r, 0, cy + r, [[0, K.shade(W.color, 1.25)], [1, K.shade(W.color, 0.85)]]); ctx.fill();
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(cx - r * 0.1, cy - r * 0.62, r * 0.78, r * 0.36, 0, 0, 7); ctx.fill(); ctx.restore();
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = boss ? '#d4900a' : '#2d2a5e'; ctx.stroke(); if (boss) { ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = '#ffc400'; ctx.stroke(); }
        });
        const glow = this.add.image(0, 0, 'fx_glow').setTint(boss ? 0xffc400 : col).setBlendMode('NORMAL').setDisplaySize(r * 3.2, r * 3.2).setAlpha(boss ? 0.5 : (st ? 0.18 : 0.38)); c.add(glow);
        this.tweens.add({ targets: glow, alpha: glow.alpha * 0.4, duration: 900 + i * 60, yoyo: true, repeat: -1 });
        c.add(this.add.image(0, 0, tex).setDisplaySize(r * 2 + 30, r * 2 + 30));
        if (boss) c.add(KG.ui.icon(this, 'crown', 0, -2, 54, 0xffffff)); else c.add(KG.txt(this, 0, -3, String(i + 1), { size: 40, color: '#ffffff', center: true, middle: true, stroke: K.shade(W.color, 0.5), sw: 6 }));
        c.add(KG.txt(this, 0, r + 6, L.th, { size: 17, color: KG.SKIN.pop ? '#2d2a5e' : '#dbe4ff', center: true, ox: 0.5, width: 150, stroke: KG.SKIN.pop ? '#ffffff' : false, sw: 5 }));
        for (let s = 0; s < 3; s++) c.add(KG.ui.icon(this, s < st ? 'star' : 'starO', (s - 1) * 22, -r - 14, 21, s < st ? 0xffb800 : KG.SKIN.starOff));
        const z = this.add.zone(0, 0, r * 2, r * 2).setInteractive({ useHandCursor: true }); c.add(z); const nd = { c, i };
        z.on('pointerover', () => { this.tweens.add({ targets: c, scaleX: 1.1, scaleY: 1.1, duration: 120 }); KG.audio.play('hover'); });
        z.on('pointerout', () => this.tweens.add({ targets: c, scaleX: this.li === i ? 1.14 : 1, scaleY: this.li === i ? 1.14 : 1, duration: 120 }));
        z.on('pointerup', () => { if (this.li === i && this._lastTap && this.time.now - this._lastTap < 600) this.start(); else this.pick(i); this._lastTap = this.time.now; });
        if (anim) { c.setScale(0).setAlpha(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 300, delay: 90 + i * 55, ease: 'Back.easeOut' }); }
        this.nodes.push(nd);
      }
      pick(i, silent) {
        this.li = i; cfg.select(this.wi, i); if (!silent) KG.audio.play('tap');
        this.nodes.forEach((o, k) => this.tweens.add({ targets: o.c, scaleX: k === i ? 1.14 : 1, scaleY: k === i ? 1.14 : 1, duration: 140 }));
        const nd = this.nodes[i]; if (!nd) return; if (this.ring) this.ring.destroy(); this.ring = KG.ui.icon(this, 'chevD', nd.c.x, nd.c.y - 100, 34, K.hexInt(cfg.worlds[this.wi].color)); this.wc.add(this.ring);
        this.tweens.add({ targets: this.ring, y: this.ring.y + 10, duration: 420, yoyo: true, repeat: -1 });
        this.renderDetail();
      }
      renderDetail() {
        if (this.detail) this.detail.destroy(true);
        const W = cfg.worlds[this.wi], L = W.levels[this.li], c = this.detail = this.add.container(0, 0).setDepth(4), y = 636, st = cfg.starsOf(this.wi, this.li);
        c.add(KG.ui.panel(this, 316, y, 944, 74, { accent: W.color, accent2: '#ffc400', cuts: [16, 0, 16, 0], glow: false }));
        c.add(KG.txt(this, 338, y + 6, 'ด่าน ' + (this.li + 1) + ' · ' + L.th, { size: 24, color: KG.SKIN.pop ? '#2d2a5e' : '#ffd34f' }));
        c.add(KG.txt(this, 338, y + 40, L.d || '', { size: 16, weight: 400, color: KG.SKIN.body, width: 560 }));
        for (let s = 0; s < 3; s++) c.add(KG.ui.icon(this, s < st ? 'star' : 'starO', 878 + s * 36, y + 37, 30, s < st ? 0xffb800 : KG.SKIN.starOff));
        const go = new KG.ui.Button(this, 1124, y + 37, 220, 60, { label: st ? 'เล่นอีกครั้ง' : 'เริ่มเลย!', icon: 'play', style: 'primary', size: 24, onClick: () => this.start() }); c.add(go); go.pulse();
        c.add(KG.txt(this, 1244, y + 3, 'Enter', { size: 11, color: '#050818', ox: 1 }).setBackgroundColor('#ffd34f').setPadding(4, 0, 4, 0));
        c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 180 });
      }
      start() { if (this._leaving) return; KG.audio.play('confirm'); cfg.select(this.wi, this.li); cfg.play(this, this.wi, this.li); }
    };
  };

  /* ---------- ฐานฉากเล่น: นับถอยหลัง ความคืบหน้า ดาว เวลา สรุปผล ----------
     สร้างคลาสลูกแล้วเขียน build() สร้างโจทย์/ตัวเกมของด่านนั้น (ดู K.game.makeLevel)
     เกมเรียก this.ok(x, y) เมื่อตอบถูก · this.bad(x, y, ข้อความ) เมื่อพลาด · this.setGoal(n) ตั้งจำนวนที่ต้องทำให้ครบ · this.win() / this.lose() */
  K.PlayBase = class extends KG.Scene {
    constructor() { super('Play'); }
    init(d) {
      d = d || {}; this.wi = d.w || 0; this.li = d.l || 0; this._restartData = { w: this.wi, l: this.li };
      const G = K.game; this.W = G.worlds[this.wi]; this.L = this.W.levels[this.li]; this._modal = null; this.over = false; this.paused = false; this.running = false;
      this.mist = 0; this.hints = 0; this.done = 0; this.goal = 0; this.score = 0; this.combo = 0; this.bestCombo = 0; this.timeLimit = 0; this.timeLeft = 0; this.elapsed = 0; this.t0 = 0; this.eng = null; this.pips = [];
    }
    create() {
      const G = K.game, W = this.W, L = this.L; this.setup(G.bgColor || '#bfe3ff'); KG.audio.music(L.boss ? (G.bossMusic || 'bounce') : (G.music || 'sunny'));
      this.seed = (Date.now() % 1000000007) >>> 0; this.R = K.rng(this.seed);
      if (G.bgFor) G.bgFor(this, this.wi, this.li);
      KG.fx.ambient(this, { freq: 360, colors: G.fxColors || [0xffffff, 0xffd34f, 0xff7ab8], s: 0.3, alpha: 0.5, depth: 2 });
      this.hud = K.hud(this, { color: W.color, kicker: 'โลก ' + (this.wi + 1) + ' · ' + W.th, title: 'ด่าน ' + (this.li + 1) + ' · ' + L.th, onHome: () => this.pause(), back: 'pause' });
      this.scoreT = KG.txt(this, 1010, 36, '', { size: 26, color: KG.SKIN.pop ? '#e8920a' : '#ffd34f', ox: 1, oy: 0.5 }).setDepth(25);
      this.timerBar = null; this.coach = new K.Coach(this, G.coachX || 96, G.coachY || 716, G.coachH || 200, { base: G.coachBase || 'ready', depth: 30 });
      this.card = null; this.input.keyboard.on('keydown', e => this.onKeyBase(e));
      this.events.once('shutdown', () => { if (this.eng && this.eng.destroy) { try { this.eng.destroy(); } catch (e) { /* ไม่เป็นไร */ } } K.voice.stop(); });
      this.build();   // ลูกคลาสสร้างโจทย์ของด่าน (ตั้ง this.card, this.eng, goal ฯลฯ)
      this.time.delayedCall(450, () => this.startCountdown());
    }
    onEscape() { if (this._modal && !this._modal.closed) { if (this._escRes) { this._escRes(); } return; } this.pause(); }
    onKeyBase(e) { if (e.code === 'KeyP') this.pause(); }
    setCard(text, o) { o = o || {}; if (this.card) this.card.destroy(true); this.card = K.card(this, GW / 2 + (o.dx || 0), 82, o.w || 760, text, o); this.cardVoice = o.say || text; return this.card; }
    setGoal(n) {
      this.goal = n; this.pips.forEach(p => p.destroy()); this.pips = []; if (n <= 0 || n > 24) { if (n > 24 && !this.pbar) { this.pbar = KG.ui.bar(this, 470, 26, 300, 20, { value: 0, color: K.hexInt(this.W.color) }).setDepth(25); } this.refreshPips(); return; }
      const x0 = 640 - n * 14; for (let i = 0; i < n; i++) { const p = this.add.graphics().setDepth(25); p.x = x0 + i * 28 + 14; p.y = 36; this.pips.push(p); } this.refreshPips();
    }
    refreshPips() {
      this.pips.forEach((p, i) => { p.clear(); const on = i < this.done; p.fillStyle(on ? 0xffc400 : (KG.SKIN.pop ? 0xc9d4f2 : 0x2f3d84), 1); const q = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 5.5 : 12; q.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); } p.fillPoints(q, true); p.lineStyle(2, 0x2d2a5e, 1); p.strokePoints(q, true); });
      if (this.pbar) this.pbar.setValue(this.goal ? this.done / this.goal : 0, 200);
      this.scoreT.setText(this.score ? this.score + ' คะแนน' : '');
    }
    setTimer(secs) {
      this.timeLimit = secs; this.timeLeft = secs;
      if (!this.timerBar) {
        const bx = Math.max(690, 640 + this.pips.length * 14 + 16), bw = Math.min(270, 1048 - bx);   // ดาวความคืบหน้ายาวเท่าไร แถบเวลาเลื่อนหลบไปทางขวา
        this.timerBar = KG.ui.bar(this, bx, 14, bw, 22, { value: 1, color: 0x4ef4d2 }).setDepth(25); this.timerT = KG.txt(this, bx + bw / 2, 52, secs + ' วิ', { size: 18, color: KG.SKIN.pop ? '#2d2a5e' : '#4ef4d2', center: true, middle: true }).setDepth(25);
      }
    }
    startCountdown() {
      if (this.over) return; this.running = false;
      if (this.cardVoice) K.voice.say(this.cardVoice);
      this.time.delayedCall(K.voice.can ? 1300 : 200, () => KG.countdown(this, 'ลุย!', () => { this.running = true; this.t0 = this.time.now; if (this.eng && this.eng.start) this.eng.start(); }));
    }
    ok(x, y, o) {
      if (this.over || (this.goal && this.done >= this.goal)) return;   // ครบแล้ว (รอจบด่าน) ไม่นับเพิ่ม
      o = o || {}; this.done++; this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.score += 10 + Math.min(20, this.combo * 2);
      KG.audio.play(o.sfx || 'good', { i: Math.min(6, this.combo) }); if (x != null) { K.stars(this, x, y, o.colors); K.ripple(this, x, y, o.ring); if (o.text !== false) KG.fx.pop(this, x, y - 30, o.text || '+' + (10 + Math.min(20, this.combo * 2)), { size: 28, color: '#ff7a1a', depth: 80 }); }
      if (this.combo % 3 === 0 || o.cheer) this.coach.react('good'); this.refreshPips();
      if ([5, 10, 15, 20, 30].indexOf(this.combo) >= 0 && !this.noCombo) { K.banner(this, 'คอมโบ ×' + this.combo + '!', '#ffd34f', 700); KG.audio.play('combo', { i: this.combo / 5 }); KG.fx.burst(this, GW / 2, GH * 0.38, { colors: [0xffd34f, 0xff7ab8, 0x7fe0ff, 0xffffff], n: 30, max: 480, tex: 'fx_star', rot: true, life: 900, depth: 62 }); }
      if (this.goal && this.done >= this.goal && !this.over) this.time.delayedCall(o.delay == null ? 350 : o.delay, () => this.win());
    }
    bad(x, y, msg) {
      this.mist++; this.combo = 0; KG.audio.play('wrong'); KG.fx.shake(this, 120, 0.003); if (x != null) { KG.fx.pop(this, x, y - 28, msg || 'ลองอีกที', { size: 26, color: '#e0243d', depth: 80 }); K.ripple(this, x, y, 0xff4d5e); }
      if (this.mist % 2 === 1) this.coach.react('bad', msg && msg.length > 14 ? msg : undefined); this.refreshPips();
    }
    starsFor() { const m = this.mist, g = Math.max(3, this.goal || 6); return m <= Math.floor(g * 0.12) ? 3 : m <= Math.floor(g * 0.4) ? 2 : 1; }
    win() {
      if (this.over) return; this.over = true; this.running = false; if (this.eng && this.eng.stop) this.eng.stop();
      const G = K.game, stars = this.starsFor(), prev = G.starsOf(this.wi, this.li); if (stars > prev) G.setStars(this.wi, this.li, stars);
      KG.audio.play('fanfare'); KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 160); this.coach.act(K.hasPose(this, 'trophy') ? 'trophy' : 'victory', 3000); this.coach.say(K.LINES.win[Math.floor(Math.random() * 3)], 2200);
      K.voice.say('เก่งมาก ผ่านด่านแล้ว');
      this.time.delayedCall(1200, () => this.results(true, stars));
    }
    lose(why) {
      if (this.over) return; this.over = true; this.running = false; if (this.eng && this.eng.stop) this.eng.stop();
      KG.audio.play('lose'); this.coach.act('puzzled', 3000); this.time.delayedCall(900, () => this.results(false, 0, why));
    }
    results(win, stars, why) {
      const G = K.game, nextW = this.li + 1 < this.W.levels.length ? [this.wi, this.li + 1] : (this.wi + 1 < G.worlds.length ? [this.wi + 1, 0] : null);
      const again = () => this.scene.restart(this._restartData), map = () => { G.setSel(this.wi, this.li); this.go('Map'); }, next = () => { if (nextW) { G.setSel(nextW[0], nextW[1]); this.go('Play', { w: nextW[0], l: nextW[1] }); } else map(); };
      const btns = []; if (win && nextW) btns.push({ label: 'ด่านต่อไป', style: 'primary', icon: 'play', pulse: true, onClick: next });
      btns.push({ label: win ? 'เล่นอีกครั้ง' : 'ลองอีกครั้ง', style: win && nextW ? 'cyan' : 'primary', icon: 'reset', pulse: !(win && nextW), onClick: again }); btns.push({ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: map });
      this.modalKeys = { Enter: btns[0].onClick, KeyR: again, Escape: map }; if (win && nextW) this.modalKeys.KeyN = next;
      const secs = Math.round((this.time.now - this.t0) / 1000), rows = this.resultRows ? this.resultRows(win) : [['ตอบถูก', this.done], ['พลาด', this.mist + ' ครั้ง'], ['คอมโบสูงสุด', this.bestCombo], ['คะแนน', this.score], ['เวลา', secs + ' วินาที']];
      KG.results(this, { win, title: win ? (stars === 3 ? 'สุดยอด! ครบ 3 ดาว' : 'ผ่านด่านแล้ว!') : (why || 'เกือบได้แล้ว!'), body: this.W.th + ' · ด่าน ' + (this.li + 1) + ' ' + this.L.th, stars, rows, buttons: btns,
        tip: win ? (stars === 3 ? 'ไม่พลาดเลย เก่งมาก ลองด่านถัดไปได้เลย' : 'ลองอีกครั้งให้พลาดน้อยลงเพื่อเก็บ 3 ดาว') : 'ไม่เป็นไร ลองอีกรอบนะ ครั้งนี้ต้องได้แน่',
        stat: { lvl: 'w' + (this.wi + 1) + 'l' + (this.li + 1), stars, score: this.score, m: this.mist, h: this.hints, secs, practice: false } });
      this.escRes = null;
    }
    pause() {
      if (this.over || (this._modal && !this._modal.closed)) return; this.paused = true;
      const resume = () => { this.paused = false; this.modalKeys = null; this._escRes = null; }; this._escRes = () => { this._modal.close(); resume(); };
      this.modalKeys = { Enter: () => { this._modal.close(); resume(); }, Escape: () => { this._modal.close(); resume(); }, KeyR: () => this.scene.restart(this._restartData) };
      KG.pauseMenu(this, { onResume: resume, onRestart: () => this.scene.restart(this._restartData), onExit: () => this.go('Map') });
    }
    update(t, dt) {
      if (this.over || this.paused || !this.running || (this._modal && !this._modal.closed)) return;
      this.elapsed += dt / 1000;
      if (this.timeLimit) {
        this.timeLeft = Math.max(0, this.timeLeft - dt / 1000); const f = this.timeLeft / this.timeLimit; this.timerBar.setValue(f, 90);
        if (this.timerT) this.timerT.setText(Math.ceil(this.timeLeft) + ' วิ').setColor(this.timeLeft < 10 ? '#e0243d' : (KG.SKIN.pop ? '#2d2a5e' : '#4ef4d2'));
        if (this.timeLeft < 10 && Math.floor(this.timeLeft) !== this._tick) { this._tick = Math.floor(this.timeLeft); KG.audio.play('tick', { p: 1.3 }); }
        if (this.timeLeft <= 0) { this.lose('หมดเวลา!'); return; }
      }
      if (this.eng && this.eng.update) this.eng.update(t, dt);
    }
  };
  // ไอคอนเพิ่มสำหรับโลก/ด่าน (วาดสีขาวที่กริด 64 แล้วย้อมสีตอนใช้)
  Object.assign(KG.ui.ICONS, {
    crown(c) { c.beginPath(); c.moveTo(8, 48); c.lineTo(4, 18); c.lineTo(20, 32); c.lineTo(32, 10); c.lineTo(44, 32); c.lineTo(60, 18); c.lineTo(56, 48); c.closePath(); c.fill(); c.fillRect(8, 50, 48, 8); },
    mouseI(c) { c.beginPath(); c.moveTo(32, 4); c.bezierCurveTo(52, 4, 54, 24, 54, 38); c.bezierCurveTo(54, 52, 44, 60, 32, 60); c.bezierCurveTo(20, 60, 10, 52, 10, 38); c.bezierCurveTo(10, 24, 12, 4, 32, 4); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(31, 6, 2, 22); c.fillRect(12, 28, 40, 2.5); },
    keyI(c) { c.beginPath(); c.moveTo(10, 12); c.lineTo(54, 12); c.lineTo(54, 46); c.lineTo(10, 46); c.closePath(); c.fill(); c.fillRect(14, 50, 36, 6); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 5; i++) c.fillRect(14 + i * 8.6, 17, 6, 6); for (let i = 0; i < 4; i++) c.fillRect(18 + i * 8.6, 27, 6, 6); c.fillRect(20, 37, 24, 5); },
    noteI(c) { c.beginPath(); c.ellipse(18, 48, 11, 8, -0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(44, 42, 11, 8, -0.3, 0, 7); c.fill(); c.fillRect(26, 10, 5, 38); c.fillRect(52, 6, 5, 36); c.beginPath(); c.moveTo(26, 10); c.lineTo(57, 4); c.lineTo(57, 14); c.lineTo(26, 20); c.closePath(); c.fill(); },
    dragI(c) { c.beginPath(); c.moveTo(32, 4); c.lineTo(42, 16); c.lineTo(36, 16); c.lineTo(36, 28); c.lineTo(48, 28); c.lineTo(48, 22); c.lineTo(60, 32); c.lineTo(48, 42); c.lineTo(48, 36); c.lineTo(36, 36); c.lineTo(36, 48); c.lineTo(42, 48); c.lineTo(32, 60); c.lineTo(22, 48); c.lineTo(28, 48); c.lineTo(28, 36); c.lineTo(16, 36); c.lineTo(16, 42); c.lineTo(4, 32); c.lineTo(16, 22); c.lineTo(16, 28); c.lineTo(28, 28); c.lineTo(28, 16); c.lineTo(22, 16); c.closePath(); c.fill(); },
    fingerI(c) { c.beginPath(); c.moveTo(24, 6); c.lineTo(34, 6); c.lineTo(34, 30); c.lineTo(42, 28); c.lineTo(50, 32); c.lineTo(52, 50); c.quadraticCurveTo(50, 60, 38, 60); c.lineTo(28, 60); c.quadraticCurveTo(18, 56, 14, 44); c.lineTo(10, 34); c.lineTo(18, 32); c.lineTo(24, 40); c.closePath(); c.fill(); },
    pathI(c) { c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(8, 52); c.bezierCurveTo(8, 30, 30, 50, 32, 30); c.bezierCurveTo(34, 12, 56, 24, 56, 10); c.stroke(); c.beginPath(); c.arc(8, 52, 6, 0, 7); c.fill(); },
    grid4(c) { [[8, 8], [36, 8], [8, 36], [36, 36]].forEach(p => { c.fillRect(p[0], p[1], 20, 20); }); },
    brainI(c) { c.beginPath(); c.arc(22, 28, 16, 0, 7); c.arc(42, 28, 16, 0, 7); c.arc(32, 18, 16, 0, 7); c.arc(32, 40, 16, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = 3; c.beginPath(); c.moveTo(32, 8); c.lineTo(32, 52); c.stroke(); },
    robotI(c) { c.fillRect(30, 4, 4, 8); c.beginPath(); c.arc(32, 4, 4, 0, 7); c.fill(); c.fillRect(12, 14, 40, 28); c.fillRect(18, 46, 28, 14); c.fillRect(4, 20, 6, 14); c.fillRect(54, 20, 6, 14); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(24, 28, 5, 0, 7); c.arc(40, 28, 5, 0, 7); c.fill(); c.fillRect(24, 36, 16, 3); },
    paletteI(c) { c.beginPath(); c.moveTo(32, 6); c.bezierCurveTo(60, 6, 62, 30, 52, 40); c.bezierCurveTo(46, 46, 38, 40, 36, 48); c.bezierCurveTo(34, 60, 12, 58, 6, 38); c.bezierCurveTo(0, 18, 14, 6, 32, 6); c.fill(); c.globalCompositeOperation = 'destination-out'; [[20, 24], [32, 17], [44, 24], [18, 38]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 5, 0, 7); c.fill(); }); },
    shapesI(c) { c.beginPath(); c.arc(20, 20, 14, 0, 7); c.fill(); c.fillRect(32, 32, 26, 26); c.beginPath(); c.moveTo(20, 34); c.lineTo(34, 58); c.lineTo(6, 58); c.closePath(); c.fill(); },
    numI(c) { c.font = '600 50px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('123', 32, 34); },
    listI(c) { for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(10, 12 + i * 15, 4, 0, 7); c.fill(); c.fillRect(20, 9 + i * 15, 38, 6); } },
    puzzleI(c) { c.beginPath(); c.moveTo(8, 18); c.lineTo(26, 18); c.arc(32, 14, 6, Math.PI, 0, false); c.lineTo(50, 18); c.lineTo(50, 28); c.arc(56, 34, 6, -Math.PI / 2, Math.PI / 2, false); c.lineTo(50, 50); c.lineTo(8, 50); c.closePath(); c.fill(); },
    cardsI(c) { c.save(); c.translate(24, 34); c.rotate(-0.25); c.fillRect(-16, -22, 32, 44); c.restore(); c.save(); c.translate(40, 32); c.rotate(0.2); c.fillRect(-16, -22, 32, 44); c.restore(); },
    houseI(c) { c.beginPath(); c.moveTo(32, 6); c.lineTo(58, 30); c.lineTo(50, 30); c.lineTo(50, 56); c.lineTo(14, 56); c.lineTo(14, 30); c.lineTo(6, 30); c.closePath(); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(27, 38, 10, 18); },
    boltI(c) { c.beginPath(); c.moveTo(38, 2); c.lineTo(14, 36); c.lineTo(28, 36); c.lineTo(22, 62); c.lineTo(50, 26); c.lineTo(34, 26); c.closePath(); c.fill(); },
    ear(c) { c.beginPath(); c.arc(32, 28, 20, Math.PI * 0.75, Math.PI * 2.25); c.lineWidth = 8; c.stroke(); c.beginPath(); c.arc(32, 46, 8, 0, 7); c.fill(); }
  });
})();
