/* ===== KruKan Game Framework · แกนกลาง (Phaser 3) =====
   - หน้าจอออกแบบที่ 1280x720 หน่วย แล้วขยายด้วยกล้อง (zoom = K) ให้ภาพคมทุกขนาดจอและจอ retina
   - ทุกตำแหน่งกำหนดตายตัวตามหน่วยออกแบบ จึงไม่มีกรอบเลื่อนหรือกระโดดเมื่อเนื้อหาเปลี่ยน */
(function () {
  'use strict';
  const GW = 1280, GH = 720;
  const KG = window.KG = {
    GW, GH, K: 1, game: null, IMG: {},
    FONT: "Kanit,'Noto Sans Thai',Tahoma,sans-serif",
    C: { ink: 0x070a1f, navy: 0x0e1536, navy2: 0x182260, navy3: 0x25358a, edge: 0x2f3d84, cyan: 0x4ef4d2, pink: 0xff3d8b, sun: 0xffd34f, vio: 0xa78bfa, orange: 0xff9d3d, green: 0x5ef08a, red: 0xff4d5e, white: 0xf4f7ff, mut: 0x9fb0d8 }
  };
  /* ---------- ธีมสี: dark (เดิม) และ bright (สดใส) เกมเลือกธีมด้วย KG.useSkin('bright') ก่อนสร้างฉากแรก ---------- */
  KG.SKINS = {
    dark: {
      name: 'dark', pop: false, add: true, bg: '#070a1f', text: '#f4f7ff', textStroked: '#f4f7ff', stroke: '#050818', body: '#dbe4ff', mute: '#9fb0d8', hi: '#ffd34f', title: '#ffffff',
      panelFill: ['#1b2872', '#0a1130'], panelAlpha: 0.94, panelAccent: '#4ef4d2', panelAccent2: '#a78bfa', edge: '#2f3d84',
      modalFill: ['#1c2a78', '#0a1132'], toastFill: ['#18266b', '#0a1236'], tutorFill: ['#1c2a78', '#0a1132'], tutorSlot: '#0a1030', tutorAccent: '#ffd34f',
      barBg: 0x050818, barBgA: 0.9, barEdge: 0x2f3d84, starOff: 0x4a5aa8, wipe: 0x0a1034, wipeEdge: 0x4ef4d2, dim: 0x03040f, dimA: 0.78, tutorDim: 0x03040f, tutorDimA: 0.74, btnShadow: 'rgba(0,0,0,.6)', btn: null
    },
    bright: {
      name: 'bright', pop: true, add: false, bg: '#7fd3ff', text: '#1b2a6b', textStroked: '#ffffff', stroke: '#1b2a6b', body: '#33456f', mute: '#5b6c9a', hi: '#ff7a1a', title: '#1b2a6b',
      panelFill: ['#ffffff', '#dff0ff'], panelAlpha: 0.97, panelAccent: '#ff8a2b', panelAccent2: '#ffcf33', edge: '#2b3f9c',
      modalFill: ['#ffffff', '#e2f1ff'], toastFill: ['#ffffff', '#e8f4ff'], tutorFill: ['#ffffff', '#e2f1ff'], tutorSlot: '#cfe6ff', tutorAccent: '#ff7a1a',
      barBg: 0xffffff, barBgA: 0.92, barEdge: 0x2b3f9c, starOff: 0xb8c7e8, wipe: 0x59c4ff, wipeEdge: 0xffffff, dim: 0x10204f, dimA: 0.55, tutorDim: 0x10204f, tutorDimA: 0.6, btnShadow: 'rgba(24,44,120,.38)',
      btn: {
        primary: { top: '#ffb347', bot: '#ff6a1a', base: '#9c3a08', edge: '#fff1dc', text: '#ffffff', glow: '#ff9a3c' },
        cyan: { top: '#7fe0ff', bot: '#1a9de8', base: '#0b4f86', edge: '#e6f8ff', text: '#ffffff', glow: '#4cc4ff' },
        sun: { top: '#fff17a', bot: '#ffc400', base: '#8a5f00', edge: '#fffbe0', text: '#4a3200', glow: '#ffd34f' },
        ghost: { top: '#ffffff', bot: '#d9e9ff', base: '#7b94d4', edge: '#ffffff', text: '#1b2a6b', glow: '#6f8cff' },
        danger: { top: '#ff8e9a', bot: '#e0243d', base: '#7a0d1e', edge: '#ffe0e4', text: '#ffffff', glow: '#ff4d5e' },
        green: { top: '#9af0b0', bot: '#22b45a', base: '#0e5a2a', edge: '#e6ffee', text: '#ffffff', glow: '#5ef08a' },
        violet: { top: '#d0b8ff', bot: '#7c4af0', base: '#33198a', edge: '#f1eaff', text: '#ffffff', glow: '#a78bfa' }
      }
    }
  };
  // candy = bright แต่รูปร่างมน: แผงมุมโค้ง ปุ่มแคปซูล แถบพลังมน (ใช้กับเกมที่อยากให้หน้าตาต่างจากแผงตัดมุมของเกมอื่น)
  KG.SKINS.candy = Object.assign({}, KG.SKINS.bright, { name: 'candy', base: 'bright', round: true, panelAccent: '#16c7a8', panelAccent2: '#7fe3ff', tutorAccent: '#16c7a8' });
  // pizza = candy (ทรงมน) แต่โทนอุ่น: แดงมะเขือเทศ ส้มชีส น้ำตาลเข้ม (ใช้กับเกมเศษส่วน Techno Slice)
  KG.SKINS.pizza = Object.assign({}, KG.SKINS.candy, {
    name: 'pizza', tone: 'warm', text: '#4a2412', stroke: '#4a2412', body: '#6b3b25', mute: '#8a6a58', hi: '#e8452c', title: '#4a2412',
    panelFill: ['#ffffff', '#fff0da'], panelAccent: '#e8452c', panelAccent2: '#ffb347', edge: '#7a3b1f',
    modalFill: ['#ffffff', '#ffefd8'], toastFill: ['#ffffff', '#fff1de'], tutorFill: ['#ffffff', '#ffefd8'], tutorSlot: '#ffe0b3', tutorAccent: '#e8452c',
    barBg: 0xffffff, barBgA: 0.95, barEdge: 0x7a3b1f, starOff: 0xdcc6aa, wipe: 0xff9a3c, wipeEdge: 0xffffff, dim: 0x3a1a0c, dimA: 0.55, tutorDim: 0x3a1a0c, tutorDimA: 0.6, btnShadow: 'rgba(90,40,12,.40)',
    btn: {
      primary: { top: '#ff9466', bot: '#e03a1a', base: '#8a1f0a', edge: '#ffe6da', text: '#ffffff', glow: '#ff7a4a' },
      cyan: { top: '#b4f0a8', bot: '#2fa84a', base: '#12602a', edge: '#eaffea', text: '#ffffff', glow: '#6ef08a' },
      sun: { top: '#ffe98a', bot: '#ffb300', base: '#8a5a00', edge: '#fff7d6', text: '#4a2c00', glow: '#ffd34f' },
      ghost: { top: '#ffffff', bot: '#ffe8cc', base: '#c09468', edge: '#ffffff', text: '#4a2412', glow: '#ffae5a' },
      danger: { top: '#ff8e9a', bot: '#e0243d', base: '#7a0d1e', edge: '#ffe0e4', text: '#ffffff', glow: '#ff4d5e' },
      green: { top: '#9af0b0', bot: '#22b45a', base: '#0e5a2a', edge: '#e6ffee', text: '#ffffff', glow: '#5ef08a' },
      violet: { top: '#d9b4ff', bot: '#8a3fd8', base: '#3c1668', edge: '#f1eaff', text: '#ffffff', glow: '#b78bfa' }
    }
  });
  // kids = candy (ทรงมน) โทนม่วงชมพูอ่อนโยน หมึกกรมม่วง (ใช้กับเกมสำหรับเด็กเล็ก Techno Talk)
  KG.SKINS.kids = Object.assign({}, KG.SKINS.candy, {
    name: 'kids', tone: 'kids', text: '#2d2a5e', stroke: '#2d2a5e', body: '#4a4780', mute: '#7a77a8', hi: '#ff5a8a', title: '#2d2a5e',
    panelFill: ['#ffffff', '#f4edff'], panelAccent: '#8a5cf0', panelAccent2: '#ff8ac0', edge: '#2d2a5e',
    modalFill: ['#ffffff', '#f2e9ff'], toastFill: ['#ffffff', '#f4edff'], tutorFill: ['#ffffff', '#f2e9ff'], tutorSlot: '#e6d8ff', tutorAccent: '#8a5cf0',
    barBg: 0xffffff, barBgA: 0.95, barEdge: 0x2d2a5e, starOff: 0xd2c8ee, wipe: 0x9a6ae8, wipeEdge: 0xffffff, dim: 0x1d1a4a, dimA: 0.55, tutorDim: 0x1d1a4a, tutorDimA: 0.6, btnShadow: 'rgba(45,42,94,.38)',
    btn: {
      primary: { top: '#ff9ac6', bot: '#e83a8e', base: '#7a1650', edge: '#ffe6f1', text: '#ffffff', glow: '#ff5aa6' },
      cyan: { top: '#8af0e0', bot: '#18b8a0', base: '#0b5a50', edge: '#e6fffb', text: '#ffffff', glow: '#4ee8d0' },
      sun: { top: '#fff08a', bot: '#ffbe00', base: '#8a5a00', edge: '#fff9d6', text: '#4a3200', glow: '#ffd34f' },
      ghost: { top: '#ffffff', bot: '#ece4ff', base: '#9a88d6', edge: '#ffffff', text: '#2d2a5e', glow: '#a58cff' },
      danger: { top: '#ff8e9a', bot: '#e0243d', base: '#7a0d1e', edge: '#ffe0e4', text: '#ffffff', glow: '#ff4d5e' },
      green: { top: '#9af0b0', bot: '#22b45a', base: '#0e5a2a', edge: '#e6ffee', text: '#ffffff', glow: '#5ef08a' },
      violet: { top: '#c9b0ff', bot: '#7c4af0', base: '#33198a', edge: '#f1eaff', text: '#ffffff', glow: '#a78bfa' }
    }
  });
  KG.SKIN = KG.SKINS.dark;
  KG.useSkin = function (name) {
    KG.SKIN = KG.SKINS[name] || KG.SKINS.dark;
    try { document.documentElement.setAttribute('data-skin', KG.SKIN.base || KG.SKIN.name); document.documentElement.setAttribute('data-shape', KG.SKIN.round ? 'round' : 'cut'); document.documentElement.setAttribute('data-tone', KG.SKIN.tone || ''); } catch (e) { /* ไม่เป็นไร */ }
    if (KG.ui && KG.ui.applySkin) KG.ui.applySkin();
  };
  KG.hex = n => '#' + n.toString(16).padStart(6, '0');
  KG.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  KG.lerp = (a, b, t) => a + (b - a) * t;
  KG.rnd = (a, b) => a + Math.random() * (b - a);
  KG.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  KG.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  KG.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  /* ---------- บันทึกความคืบหน้า (ถ้าเบราว์เซอร์ไม่ให้ใช้ localStorage ก็เล่นต่อได้ แค่ไม่จำ) ---------- */
  KG.store = function (key, defaults) {
    const data = JSON.parse(JSON.stringify(defaults));
    try { Object.assign(data, JSON.parse(localStorage.getItem(key) || '{}')); } catch (e) { /* ใช้ค่าตั้งต้น */ }
    return { data, save() { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* ไม่เก็บก็ไม่เป็นไร */ } } };
  };

  KG.prefs = KG.store('krukan_games_prefs_v1', { sfx: true, music: true });

  /* ---------- ขนาดภาพ ---------- */
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  KG.computeK = function () {
    const el = document.getElementById('game');
    const w = el.clientWidth || window.innerWidth, h = el.clientHeight || window.innerHeight;
    const k = Math.min(w / GW, h / GH) * DPR;
    return Math.round(KG.clamp(k, 0.75, 2) * 4) / 4;
  };

  /* ---------- ข้อความ ---------- */
  let measureCtx = null;
  KG.measure = function (str, font) {
    measureCtx = measureCtx || document.createElement('canvas').getContext('2d');
    measureCtx.font = font; return measureCtx.measureText(str).width;
  };
  // ตัดบรรทัดภาษาไทย: ใช้ Intl.Segmenter ตัดตามคำ (Phaser ตัดได้แค่ตรงช่องว่าง ภาษาไทยจึงล้นกรอบ)
  KG.wrap = function (str, maxW, font) {
    const out = [];
    String(str).split('\n').forEach(par => {
      let tokens;
      try { tokens = [...new Intl.Segmenter('th', { granularity: 'word' }).segment(par)].map(s => s.segment); } catch (e) { tokens = par.split(/(?<=\s)/); }
      let line = '';
      tokens.forEach(tk => {
        const test = line + tk;
        if (line && KG.measure(test.trimEnd(), font) > maxW) { out.push(line.trimEnd()); line = tk.trimStart(); } else line = test;
      });
      out.push(line.trimEnd());
    });
    return out.join('\n');
  };
  KG.txt = function (scene, x, y, str, o) {
    o = o || {};
    const size = o.size || 24, weight = String(o.weight || 600);
    const style = {
      fontFamily: KG.FONT, fontSize: size + 'px', fontStyle: weight, color: o.color || (o.stroke ? KG.SKIN.textStroked : KG.SKIN.text), align: o.align || (o.center ? 'center' : 'left'),
      resolution: KG.K, padding: { left: 2, right: 2, top: Math.ceil(size * 0.24), bottom: Math.ceil(size * 0.14) }, lineSpacing: o.lineSpacing || Math.round(size * 0.12)
    };
    if (o.stroke) { style.stroke = typeof o.stroke === 'string' ? o.stroke : KG.SKIN.stroke; style.strokeThickness = o.sw || Math.max(3, Math.round(size * 0.15)); }
    if (o.shadow) style.shadow = { offsetX: 0, offsetY: o.shadow, color: o.shadowColor || '#000000', blur: 0, fill: true };
    if (o.width) str = KG.wrap(str, o.width, weight + ' ' + size + 'px Kanit');
    const t = scene.add.text(x, y, str, style);
    t.setOrigin(o.ox != null ? o.ox : (o.center ? 0.5 : 0), o.oy != null ? o.oy : (o.middle ? 0.5 : 0));
    if (o.depth != null) t.setDepth(o.depth);
    return t;
  };

  /* ---------- ภาพ ---------- */
  KG.loadImages = function (scene, map) {
    return Promise.all(Object.keys(map).map(k => new Promise(res => {
      if (scene.textures.exists(k)) { res(); return; }
      const img = new Image();
      img.onload = () => { if (!scene.textures.exists(k)) scene.textures.addImage(k, img); res(); };
      img.onerror = () => res();
      img.src = map[k];
    })));
  };

  /* ---------- Canvas texture (คมตามความละเอียดจริง) ---------- */
  KG.tex = function (scene, key, w, h, draw) {
    const full = 'ui:' + key + '@' + KG.K;
    if (!scene.textures.exists(full)) {
      const t = scene.textures.createCanvas(full, Math.ceil(w * KG.K), Math.ceil(h * KG.K));
      const ctx = t.getContext(); ctx.scale(KG.K, KG.K); draw(ctx, w, h); t.refresh();
    }
    return full;
  };
  KG.clearUITextures = function (scene) {
    scene.textures.getTextureKeys().filter(k => k.startsWith('ui:')).forEach(k => scene.textures.remove(k));
  };

  /* ---------- ฉาก ---------- */
  KG.Scene = class extends Phaser.Scene {
    setup(bg) {
      this._leaving = false;
      const c = this.cameras.main;
      c.setZoom(KG.K); c.centerOn(GW / 2, GH / 2); c.setBackgroundColor(bg == null ? KG.SKIN.bg : bg);
      this.input.setTopOnly(true);
      this.input.enabled = true;
      this.input.on('pointerdown', () => KG.audio.resume());
      KG.hideLoading();
      KG.wipe(this, 'in');
      this.input.keyboard.on('keydown-ESC', () => { if (this.onEscape) this.onEscape(); });   // ตัวฟังถูกล้างทุกครั้งที่ฉากปิด จึงต้องลงทะเบียนใหม่ทุกรอบ
    }
    txt(x, y, s, o) { return KG.txt(this, x, y, s, o); }
    go(key, data, fast) { KG.go(this, key, data, fast); }
  };

  /* ---------- เปลี่ยนฉากแบบแผ่นเฉียง ---------- */
  KG.wipe = function (scene, mode, cb) {
    const g = scene.add.graphics().setDepth(5000);
    const N = 7, bw = GW / N + 320, skew = 150, st = { p: 0 };
    const draw = () => {
      g.clear();
      for (let i = 0; i < N; i++) {
        const q = KG.clamp(st.p * 1.7 - i * 0.12, 0, 1), e = q * q * (3 - 2 * q);
        const x0 = i * (GW / N) - 160;
        const y0 = mode === 'out' ? -(1 - e) * GH : e * GH;
        if (mode === 'out' ? e <= 0 : e >= 1) continue;
        g.fillStyle(KG.SKIN.wipe, 1);
        g.fillPoints([{ x: x0 + skew, y: y0 }, { x: x0 + bw, y: y0 }, { x: x0 + bw - skew, y: y0 + GH }, { x: x0, y: y0 + GH }], true);
        g.fillStyle(KG.SKIN.wipeEdge, 0.9);
        const ey = mode === 'out' ? y0 + GH : y0;
        g.fillRect(x0 + (mode === 'out' ? 0 : skew), ey - 3, bw - skew, 6);
      }
    };
    st.p = mode === 'out' ? 0 : 0;
    draw();
    scene.tweens.add({
      targets: st, p: 1, duration: mode === 'out' ? 460 : 520, ease: 'Sine.easeInOut', onUpdate: draw,
      onComplete: () => { if (mode === 'in') g.destroy(); if (cb) cb(); }
    });
    return g;
  };
  KG.go = function (scene, key, data, fast) {
    if (scene._leaving) return; scene._leaving = true;
    scene.input.enabled = false;
    if (fast) { scene.scene.start(key, data); return; }
    KG.audio.play('whoosh');
    KG.wipe(scene, 'out', () => scene.scene.start(key, data));
  };

  KG.hideLoading = function () {
    const l = document.getElementById('load'); if (l && !l.classList.contains('done')) { l.classList.add('done'); setTimeout(() => l.remove(), 600); }
  };

  /* ---------- เริ่มเกม ---------- */
  KG.start = function (scenes) {
    const ready = Promise.race([
      Promise.all([document.fonts.load('600 24px Kanit'), document.fonts.load('400 24px Kanit')]),
      new Promise(r => setTimeout(r, 2500))
    ]).catch(() => { });
    ready.then(() => {
      KG.K = KG.computeK();
      KG.game = new Phaser.Game({
        type: Phaser.AUTO, parent: 'game', width: Math.round(GW * KG.K), height: Math.round(GH * KG.K), backgroundColor: KG.SKIN.bg,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        render: { antialias: true, powerPreference: 'high-performance' },
        input: { activePointers: 3 }, disableContextMenu: true, scene: scenes,
        fps: location.hash === '#test' ? { target: 60, forceSetTimeOut: true } : { target: 60 }
      });
      let t = null;
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(KG.relayout, 250); });
      window.addEventListener('orientationchange', () => { clearTimeout(t); t = setTimeout(KG.relayout, 400); });
    });
    const off = document.getElementById('rot-off');
    if (off) off.onclick = () => document.getElementById('rotate').classList.add('off');
  };
  // ถ้าขนาดจอเปลี่ยนมาก (เช่น หมุนจอ) ให้สร้างภาพใหม่ที่ความละเอียดเหมาะสม
  KG.relayout = function () {
    if (!KG.game) return;
    const k = KG.computeK();
    if (Math.abs(k - KG.K) < 0.25) return;
    KG.K = k;
    KG.game.scale.resize(Math.round(GW * k), Math.round(GH * k));
    KG.game.scene.getScenes(false).forEach(s => { KG.clearUITextures(s); });
    KG.game.scene.getScenes(true).forEach(s => { if (s.scene.key !== 'Boot') s.scene.restart(s._restartData); });
  };
  /* ---------- ชื่อผู้เล่น (ใส่หรือไม่ใส่ก็ได้) ---------- */
  KG.playerName = function () {
    const p = KG.prefs.data.player; if (!p) return '';
    return String(p.first || '').trim();   // เก็บแค่ชื่อเล่นช่องเดียว (ค่าเก่าที่เคยมีสกุลก็ไม่ใช้)
  };
  // กู้หน้าที่ค้างหลังคีย์บอร์ดบนจอสัมผัสปิด: iOS เลื่อนหน้าขึ้นไปหลบคีย์บอร์ด รวมถึงหน้าเว็บที่ฝังเกมอยู่ (เช่น Google Sites ที่ล็อกการเลื่อน ผู้เล่นเลื่อนกลับเองไม่ได้)
  // จึงสั่งเลื่อนกลับเองหลายจังหวะ (คีย์บอร์ดปิดแบบมีแอนิเมชัน): เลื่อนเอกสารของเกมกลับบนสุด แล้วให้จุดอ้างอิงเต็มกรอบเลื่อนหน้าแม่ให้เห็นเกมครบกรอบ
  KG.unstick = function () {
    const go = () => {
      try { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch (e) { /* ไม่เป็นไร */ }
      try { const a = document.getElementById('kg-anchor'); if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' }); } catch (e) { /* ไม่เป็นไร */ }
    };
    [0, 150, 400, 800, 1400].forEach(t => setTimeout(go, t));
  };
  // เปิดกล่องใส่ชื่อ (ใช้ช่อง input จริงของเบราว์เซอร์ เพื่อให้พิมพ์ภาษาไทยและใช้คีย์บอร์ดมือถือได้) done(ชื่อเล่นหรือ '')
  KG.askPlayer = function (done) {
    const box = document.getElementById('player'); if (!box) { if (done) done(KG.playerName()); return; }
    const f = document.getElementById('pl-first');
    const p = KG.prefs.data.player || {}; f.value = String(p.first || '').trim();
    KG.askedPlayer = true; if (KG.stats && KG.stats.decorateDialog) KG.stats.decorateDialog(); box.classList.add('on');
    // จอสัมผัส (เปิดใช้ทีละเกมด้วย KG.NAME_PAD จาก build-games.py 'name_pad'): พิมพ์ชื่อด้วยแป้นในเกม ไม่เรียกคีย์บอร์ดของเครื่อง
    // เพราะคีย์บอร์ดของ iPad/มือถือดันกรอบเกมที่ฝังใน Google Sites ให้เลื่อนขึ้นค้าง จอขาด ต้องสลับแอปจึงกลับมา (ผู้ใช้แจ้ง 26 ต.ค. 2569)
    const pad = !!(KG.NAME_PAD && KG.isTouch);
    box.classList.toggle('padmode', pad); f.readOnly = pad; if (pad) f.setAttribute('inputmode', 'none'); else f.removeAttribute('inputmode');
    const padEl = document.getElementById('pl-pad'); if (padEl) padEl.hidden = !pad; if (pad) KG.namePad(f);
    if (KG.game && KG.game.input && KG.game.input.keyboard) KG.game.input.keyboard.enabled = false;
    // จอสัมผัส (iPad/iPhone): Safari เตือน 'กำลังป้อนในโหมดเต็มหน้าจอ' เมื่อพิมพ์ระหว่างเต็มจอ จึงออกจากเต็มจอก่อนพิมพ์ชื่อ แล้วกลับเข้าเต็มจอเมื่อกดปุ่ม (การกดปุ่มคือการแตะของผู้ใช้ เบราว์เซอร์จึงยอม)
    const wasFs = KG.isTouch && KG.isFullscreen();
    if (wasFs) { try { const ex = document.exitFullscreen || document.webkitExitFullscreen; const r = ex.call(document); if (r && r.catch) r.catch(() => { }); } catch (e) { /* ไม่เป็นไร */ } }
    const close = save => {
      if (save) { KG.prefs.data.player = { first: f.value.trim() }; KG.prefs.save(); }
      box.classList.remove('on'); document.removeEventListener('keydown', onKey, true);
      try { f.blur(); } catch (e) { /* ไม่เป็นไร */ }
      f.removeEventListener('blur', unstickSoon); if (vv) vv.removeEventListener('resize', onVV);
      KG.unstick();
      if (KG.game && KG.game.input && KG.game.input.keyboard) KG.game.input.keyboard.enabled = true;
      if (wasFs && !KG.isFullscreen()) { try { const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen, r = req.call(el); if (r && r.catch) r.catch(() => { }); } catch (e) { /* เล่นต่อแบบไม่เต็มจอก็ได้ */ } }
      if (done) done(KG.playerName());
    };
    // คีย์บอร์ดบนจอสัมผัสปิดระหว่างกล่องยังเปิดอยู่ (แตะนอกช่องพิมพ์) ก็เลื่อนหน้ากลับด้วย
    const vv = window.visualViewport, unstickSoon = () => { if (KG.isTouch) KG.unstick(); }, onVV = () => { if (vv.height >= window.innerHeight - 8) unstickSoon(); };
    f.addEventListener('blur', unstickSoon); if (vv) vv.addEventListener('resize', onVV);
    const onKey = e => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(true); } else if (e.key === 'Escape') { e.stopPropagation(); close(false); }
      else if (pad && e.key === 'Backspace') { e.preventDefault(); KG.namePad.del(f); } else if (pad && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); KG.namePad.add(f, e.key); }   // แป้นพิมพ์จริงที่ต่อกับแท็บเล็ตยังพิมพ์ได้
    };
    document.addEventListener('keydown', onKey, true);
    document.getElementById('pl-ok').onclick = () => close(true);
    document.getElementById('pl-skip').onclick = () => close(false);
    if (!pad) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) { try { f.focus(); } catch (e2) { /* ไม่โฟกัสก็พิมพ์ได้ */ } } }, 60);
  };
  // แป้นพิมพ์ชื่อในเกมที่หน้าตาและตำแหน่งปุ่มเหมือนคีย์บอร์ดจริง (ไทยเกษมณี / อังกฤษ QWERTY) มี Shift (แตะครั้งเดียวมีผลกับตัวถัดไป) Caps Lock ปุ่มสลับภาษา Backspace Enter
  // ปุ่มมีตัวอักษรหลักตัวใหญ่ กับตัวเมื่อกด Shift ตัวเล็กมุมบน แบบเดียวกับแป้นพิมพ์ในเกม Type Hero · ผู้ใช้ขอ 26 ต.ค. 2569 · ชื่อยาวได้ไม่เกิน 16 ตัว
  const NP_TH = {
    Backquote: ['_', '%'], Digit1: ['ๅ', '+'], Digit2: ['/', '๑'], Digit3: ['-', '๒'], Digit4: ['ภ', '๓'], Digit5: ['ถ', '๔'], Digit6: ['ุ', 'ู'], Digit7: ['ึ', '฿'], Digit8: ['ค', '๕'], Digit9: ['ต', '๖'], Digit0: ['จ', '๗'], Minus: ['ข', '๘'], Equal: ['ช', '๙'],
    KeyQ: ['ๆ', '๐'], KeyW: ['ไ', '"'], KeyE: ['ำ', 'ฎ'], KeyR: ['พ', 'ฑ'], KeyT: ['ะ', 'ธ'], KeyY: ['ั', 'ํ'], KeyU: ['ี', '๊'], KeyI: ['ร', 'ณ'], KeyO: ['น', 'ฯ'], KeyP: ['ย', 'ญ'], BracketLeft: ['บ', 'ฐ'], BracketRight: ['ล', ','], Backslash: ['ฃ', 'ฅ'],
    KeyA: ['ฟ', 'ฤ'], KeyS: ['ห', 'ฆ'], KeyD: ['ก', 'ฏ'], KeyF: ['ด', 'โ'], KeyG: ['เ', 'ฌ'], KeyH: ['้', '็'], KeyJ: ['่', '๋'], KeyK: ['า', 'ษ'], KeyL: ['ส', 'ศ'], Semicolon: ['ว', 'ซ'], Quote: ['ง', '.'],
    KeyZ: ['ผ', '('], KeyX: ['ป', ')'], KeyC: ['แ', 'ฉ'], KeyV: ['อ', 'ฮ'], KeyB: ['ิ', 'ฺ'], KeyN: ['ื', '์'], KeyM: ['ท', '?'], Comma: ['ม', 'ฒ'], Period: ['ใ', 'ฬ'], Slash: ['ฝ', 'ฦ']
  };
  const NP_EN = { Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '$'], Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'], Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'], Equal: ['=', '+'],
    BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'], Semicolon: [';', ':'], Quote: ["'", '"'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'] };
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(c => { NP_EN['Key' + c.toUpperCase()] = [c, c.toUpperCase()]; });
  const NP_ROWS = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', ['Backspace', 2, '⌫']],
    [['Tab', 1.5, 'Tab'], 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', ['Backslash', 1.5]],
    [['CapsLock', 1.75, 'Caps'], 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', ['Enter', 2.25, 'Enter']],
    [['ShiftLeft', 2.25, 'Shift'], 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', ['ShiftRight', 2.75, 'Shift']],
    [['Lang', 2.5, ''], ['Space', 9.5, 'เว้นวรรค'], ['Clear', 3, 'ล้าง']]
  ];
  const NP_MARK = /^[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]$/, NP_LOW = /^[\u0E38-\u0E3A]$/;
  // สระบน/ล่างและวรรณยุกต์ไม่มีความกว้างของตัวเอง จึงวาดเป็นภาพหน้ากาก (อ+เครื่องหมาย ลบ อ ออก) ใช้สีตามตัวอักษรของปุ่ม
  // ไม่มีวงกลมจุดไข่ปลาแล้ว (ผู้ใช้บอกว่ารกตา 26 ต.ค. 2569) เครื่องหมายอยู่สูง/ต่ำตามตำแหน่งจริง และตัดพิกเซลจาง ๆ ที่เหลือจากรูป อ ไม่ให้เห็นเงา
  const npMaskCache = {};
  function npMark(ch, px) {
    const key = ch + px; if (npMaskCache[key]) return npMaskCache[key];
    const w = Math.round(px * 1.5), h = Math.round(px * 1.9), K = 2, c = document.createElement('canvas'); c.width = w * K; c.height = h * K; const g = c.getContext('2d'); g.scale(K, K);
    const font = '600 ' + px + 'px Kanit, Tahoma, sans-serif'; g.font = font; const bw = g.measureText('อ').width, x = (w - bw) / 2, y = Math.round(h * 0.62);
    g.fillStyle = '#000'; g.fillText('อ' + ch, x, y); g.globalCompositeOperation = 'destination-out'; g.fillText('อ', x, y); g.lineWidth = Math.max(2, px * 0.1); g.strokeStyle = '#000'; g.strokeText('อ', x, y);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 3; i < d.length; i += 4) if (d[i] < 80) d[i] = 0; g.putImageData(img, 0, 0);
    return (npMaskCache[key] = c.toDataURL());
  }
  KG.namePad = function (f) {
    const el = document.getElementById('pl-pad'); if (!el || el.dataset.ready) return; el.dataset.ready = '1';
    const st = { lang: 'th', shift: false, caps: false }, keys = [];
    const kb = document.createElement('div'); kb.className = 'kb'; el.appendChild(kb);
    const put = (host, ch, small) => {   // ใส่ตัวอักษรบนปุ่ม (เครื่องหมายสระ/วรรณยุกต์ใช้ภาพหน้ากาก)
      host.textContent = '';
      if (NP_MARK.test(ch)) { const i = document.createElement('i'); i.className = 'mk'; const u = 'url(' + npMark(ch, small ? 15 : 26) + ')'; i.style.webkitMaskImage = u; i.style.maskImage = u; host.appendChild(i); } else host.textContent = ch;
    };
    const on = () => (st.shift !== st.caps);   // Shift กลับค่าของ Caps Lock เหมือนของจริง
    const face = k => {
      const map = (st.lang === 'th' ? NP_TH : NP_EN)[k.code]; if (!map) return;
      if (st.lang === 'en' && /^Key/.test(k.code)) { put(k.m, map[1], false); k.s.textContent = ''; return; }       // ตัวอังกฤษ: ป้ายตัวพิมพ์ใหญ่เหมือนปุ่มจริง
      put(k.m, map[on() ? 1 : 0], false); put(k.s, map[on() ? 0 : 1], true);
    };
    const refresh = () => {
      keys.forEach(k => {
        if (k.code === 'ShiftLeft' || k.code === 'ShiftRight') k.b.classList.toggle('on', st.shift);
        else if (k.code === 'CapsLock') k.b.classList.toggle('on', st.caps);
        else if (k.code === 'Lang') k.m.innerHTML = '<span class="' + (st.lang === 'th' ? 'cur' : '') + '">ไทย</span> / <span class="' + (st.lang === 'en' ? 'cur' : '') + '">EN</span>';
        else if (k.glyph) face(k);
      });
    };
    const type = k => {
      const code = k.code, a = KG.namePad;
      if (code === 'Backspace') { a.del(f); return; } if (code === 'Space') { a.add(f, ' '); return; } if (code === 'Clear') { f.value = ''; return; }
      if (code === 'Enter') { const ok = document.getElementById('pl-ok'); if (ok) ok.click(); return; }
      if (code === 'ShiftLeft' || code === 'ShiftRight') { st.shift = !st.shift; refresh(); return; }
      if (code === 'CapsLock') { st.caps = !st.caps; refresh(); return; }
      if (code === 'Lang') { st.lang = st.lang === 'th' ? 'en' : 'th'; st.shift = false; refresh(); return; }
      const map = (st.lang === 'th' ? NP_TH : NP_EN)[code]; if (!map) return;
      a.add(f, map[on() ? 1 : 0]); if (st.shift) { st.shift = false; refresh(); }   // Shift ปล่อยเองหลังพิมพ์หนึ่งตัว (Caps Lock ค้างไว้)
    };
    NP_ROWS.forEach(row => {
      const r = document.createElement('div'); r.className = 'r'; kb.appendChild(r);
      row.forEach(def => {
        const code = typeof def === 'string' ? def : def[0], u = typeof def === 'string' ? 1 : def[1], label = typeof def === 'string' ? undefined : def[2];
        const b = document.createElement('button'); b.type = 'button'; b.className = 'k'; b.style.flexGrow = u; b.style.flexBasis = '0';
        const s = document.createElement('span'), m = document.createElement('span'); s.className = 's'; m.className = 'm'; b.appendChild(s); b.appendChild(m);
        const k = { code, b, m, s, glyph: label === undefined || label === null };
        if (label) m.textContent = label;
        if (!k.glyph || label === '') b.classList.add('fn');
        if (code === 'Tab') b.classList.add('dim'); if (code === 'Enter') b.classList.add('go'); if (code === 'Space') b.classList.add('sp');
        b.addEventListener('click', e => { e.preventDefault(); type(k); if (KG.audio) KG.audio.play(code === 'Backspace' ? 'back' : (code === 'Space' ? 'space' : 'type')); });
        r.appendChild(b); keys.push(k);
      });
    });
    KG.namePad.state = st; refresh();
  };
  KG.namePad.add = function (f, ch) { const v = f.value + ch; if ([...v].length <= 16) f.value = v; };
  KG.namePad.del = function (f) { f.value = [...f.value].slice(0, -1).join(''); };
  KG.isFullscreen = function () { return !!(document.fullscreenElement || document.webkitFullscreenElement); };
  KG.canFullscreen = function () {
    const el = document.documentElement;
    return !!((document.fullscreenEnabled || document.webkitFullscreenEnabled) && (el.requestFullscreen || el.webkitRequestFullscreen));
  };
  // ฝังอยู่ในกรอบของเว็บอื่น (เช่น Google Sites) กรอบนั้นไม่ได้ใส่ allowfullscreen เกมจึงสั่งเต็มจอเองไม่ได้
  KG.isFramed = function () { try { return window.top !== window.self; } catch (e) { return true; } };
  // เปิดเกมเป็นแท็บใหม่ได้ไหม: ต้องอยู่ในกรอบที่เต็มจอไม่ได้ และชุดสร้างหน้าต้องเก็บโค้ดต้นฉบับของหน้าไว้ใน window.__KG_SRC (shell.html)
  KG.canPopOut = function () { return !!window.__KG_SRC && KG.isFramed() && !KG.canFullscreen(); };
  // เกมที่ถูกเปิดเป็นแท็บใหม่จะมี meta kg-popout (ใส่ตอน popOut) แท็บนั้นเต็มจอได้ แต่เบราว์เซอร์ต้องการการแตะในแท็บนั้นเอง
  KG.isPopout = function () { return !!document.querySelector('meta[name="kg-popout"]'); };
  KG._tapped = true; KG._tapQueue = [];
  KG.whenTapped = function (f) { if (KG._tapped) f(); else KG._tapQueue.push(f); };
  // แท็บใหม่: ครอบด้วยปุ่ม 'แตะเพื่อเล่น' แตะครั้งเดียวเข้าเต็มจอ + เปิดเสียง + เริ่มเกม (ไม่ต้องกดซ้ำในหน้าต่างแนะนำ)
  KG.setupPopout = function () {
    const box = document.getElementById('tapgo'); if (!box || !KG.isPopout()) return;
    KG._tapped = false; box.classList.add('on');
    if (!KG.canFullscreen()) document.getElementById('tapgo-sub').textContent = 'แตะที่ใดก็ได้บนจอเพื่อเริ่มเล่น';   // เช่น iPhone ที่ไม่มีโหมดเต็มจอ
    const start = () => {
      if (KG._tapped) return; KG._tapped = true; box.classList.remove('on');
      try {
        if (KG.canFullscreen() && !KG.isFullscreen()) { const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen, p = req.call(el); if (p && p.catch) p.catch(() => { /* ไม่เต็มจอก็เล่นได้ */ }); }
      } catch (e) { /* ไม่เต็มจอก็เล่นได้ */ }
      if (KG.audio) KG.audio.resume();
      const q = KG._tapQueue; KG._tapQueue = []; q.forEach(f => f());
    };
    box.onclick = start; document.addEventListener('keydown', e => { if (e.key !== 'Escape') start(); });
    // การแตะปุ่มนี้ต้องไม่ทะลุไปกดปุ่มในเกมข้างใต้ (Phaser ฟังการปล่อยนิ้ว/เมาส์ที่ window เคยทำให้เกมคณิตข้ามไปหน้าเลือกภารกิจเอง)
    ['mouseup', 'touchend', 'pointerup'].forEach(ev => box.addEventListener(ev, e => e.stopPropagation()));
  };
  // หน้าเดิม (ที่ฝังอยู่ในเว็บ) หลังเปิดแท็บใหม่แล้ว: หยุดเกมกับเสียงไว้และครอบด้วยข้อความ จะได้ไม่มีสองหน้าเล่นพร้อมกันและเพลงไม่ตีกัน
  KG._pop = { shown: false, next: null, sawHidden: false };
  KG.showPopped = function (next) {
    const box = document.getElementById('popped'), P = KG._pop; if (P.shown) return;
    if (!box) { if (next) next(); return; }
    P.shown = true; P.next = next || null; P.sawHidden = document.hidden; box.classList.add('on');
    if (KG.audio) KG.audio.hold('pop', true);
    try { KG.game.loop.sleep(); } catch (e) { /* ไม่เป็นไร */ }
    document.getElementById('pop-back').onclick = KG.hidePopped;
  };
  // กลับมาเล่นหน้าเดิมต่อ (ผู้เล่นกดปุ่ม หรือสลับกลับมาที่แท็บนี้เอง)
  KG.hidePopped = function () {
    const box = document.getElementById('popped'), P = KG._pop; if (!P.shown) return;
    P.shown = false; if (box) box.classList.remove('on');
    if (KG.audio) KG.audio.hold('pop', false);
    try { KG.game.loop.wake(); } catch (e) { /* ไม่เป็นไร */ }
    const f = P.next; P.next = null; if (f) f();
  };
  // ผู้เล่นถูกพาไปแท็บใหม่ (แท็บนี้ถูกซ่อน) แล้วสลับกลับมา = เล่นต่อที่หน้านี้
  document.addEventListener('visibilitychange', () => {
    const P = KG._pop; if (!P.shown) return;
    if (document.hidden) P.sawHidden = true; else if (P.sawHidden) KG.hidePopped();
  });
  // เปิดเกมเป็นแท็บใหม่ (ชื่อหน้าต่างคงที่ กดซ้ำจะใช้แท็บเดิม ไม่เกิดหลายแท็บซ้อนกัน)
  // next = ทำต่อเมื่อกลับมาเล่นหน้าเดิม, fail = ทำเมื่อเปิดแท็บไม่ได้
  // บน Google Sites window.open คืนค่า null ทั้งที่แท็บเปิดแล้ว (ป๊อปอัปหลุด sandbox ถูกตัดจากหน้าเดิม) จึงตัดสินว่าสำเร็จจากการที่แท็บนี้ถูกซ่อนแทน
  KG.popOut = function (next, fail) {
    const P = KG._pop; if (P.shown) return;
    let w = null;
    try {
      const src = window.__KG_SRC.replace('<head>', '<head><meta name="kg-popout" content="1">');
      const url = URL.createObjectURL(new Blob([src], { type: 'text/html' }));
      w = window.open(url, 'krukan_game_popout');
      setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) { /* ไม่เป็นไร */ } }, 120000);
    } catch (e) { w = null; }
    KG.showPopped(next);
    if (w) return;
    // ไม่ได้ตัวแท็บกลับมา: ถ้าผ่านไปสักครู่แท็บนี้ยังไม่ถูกซ่อนเลย แปลว่าเบราว์เซอร์บล็อกป๊อปอัป ให้เล่นต่อและแจ้งผู้เล่น
    setTimeout(() => {
      if (!P.shown || P.sawHidden || document.hidden) return;
      P.next = null; KG.hidePopped();
      const sc = KG.game && KG.game.scene.getScenes(true)[0];
      if (sc && KG.ui) KG.ui.toast(sc, 'เบราว์เซอร์บล็อกแท็บใหม่ ให้อนุญาตป๊อปอัปของเว็บนี้แล้วกดอีกครั้ง', { ms: 3600, sfx: 'error' });
      if (next) next();
    }, 4000);
  };
  KG.fullscreenFail = function () {
    const sc = KG.game && KG.game.scene.getScenes(true)[0];
    if (sc && KG.ui) KG.ui.toast(sc, 'เบราว์เซอร์นี้เปิดเต็มจอให้ไม่ได้ ลองหมุนจอเป็นแนวนอน หรือกดปุ่มเต็มจอของเบราว์เซอร์ (F11)', { ms: 3600, sfx: 'error' });
  };
  // สลับเต็มจอ (ต้องเรียกจากการกด/แตะของผู้ใช้ เบราว์เซอร์จึงอนุญาต) ถ้าฝังอยู่ในกรอบที่เต็มจอไม่ได้ จะเปิดเป็นแท็บใหม่แทน
  // next = ทำต่อเมื่อกลับมาเล่นหน้าเดิม (ใช้เมื่อเกมต้องหยุดระหว่างเปิดหน้าต่างแนะนำ/แท็บใหม่)
  KG.fullscreen = function (next) {
    if (typeof next !== 'function') next = null;
    try {
      if (KG.isFullscreen()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      if (KG.canPopOut()) { if (KG.FS_GUIDE && !KG.isTouch) KG.fullscreenGuide(next); else KG.popOut(next); return; }
      const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req) { KG.fullscreenFail(); return; }
      const p = req.call(el); if (p && p.catch) p.catch(() => { if (KG.canPopOut()) KG.popOut(); else KG.fullscreenFail(); });
    } catch (e) { KG.fullscreenFail(); }
  };
  // ทางเลือกเต็มจอบน Google Sites (เกมที่ตั้ง KG.FS_GUIDE ด้วย build-games.py 'fs_guide': True ผู้ใช้ขอ 26 ต.ค. 2569 ทดลอง Type Hero ก่อน):
  // กรอบที่ Sites ใช้ฝังไม่มีสิทธิ์เต็มจอ (ตรวจแล้ว: gstatic intermediate-frame ไม่มี allowfullscreen ฝังแบบโค้ดหรือแบบลิงก์ก็เหมือนกัน) จึงบอกให้กด F11 ของเบราว์เซอร์แทน
  // ซึ่งเต็มจอทั้งหน้าโดยไม่ต้องเปิดแท็บใหม่ จอสัมผัสไม่มีปุ่มนี้ จึงยังเปิดแท็บใหม่เหมือนเดิม
  KG.fullscreenGuide = function (next) {
    const sc = KG.game && KG.game.scene.getScenes(true)[0]; if (!sc || !KG.ui) { KG.popOut(next); return; }
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
    const rows = mac ? [['Ctrl + ⌘ + F', 'Mac'], ['F11', 'Windows · Chromebook · Linux']] : [['F11', 'Windows · Chromebook · Linux'], ['Ctrl + ⌘ + F', 'Mac']];
    const done = () => { if (next) next(); };
    return KG.ui.modal(sc, {
      title: 'เล่นเต็มจอ', w: 760, accent: KG.C.cyan, extraH: 150,
      body: 'หน้านี้ฝังอยู่ในเว็บไซต์ สั่งเต็มจอจากในเกมไม่ได้ ให้กดปุ่มบนคีย์บอร์ด เกมจะขยายตามให้เองทันที กดปุ่มเดิมอีกครั้งเพื่อออกจากเต็มจอ',
      build: (box, g) => {
        rows.forEach((r, i) => {
          const y = g.top + 12 + i * 62, kw = Math.max(130, KG.measure(r[0], '600 28px Kanit') + 40), gr = sc.add.graphics();
          gr.fillStyle(0x0b1240, 1); gr.fillRoundedRect(g.left + 70, y, kw, 48, 10); gr.lineStyle(3, 0x4ef4d2, 0.95); gr.strokeRoundedRect(g.left + 70, y, kw, 48, 10); gr.fillStyle(0x4ef4d2, 0.25); gr.fillRect(g.left + 76, y + 41, kw - 12, 4);
          box.add(gr); box.add(KG.txt(sc, g.left + 70 + kw / 2, y + 24, r[0], { size: 28, center: true, middle: true, color: '#e9fffb' }));
          box.add(KG.txt(sc, g.left + 70 + kw + 22, y + 24, r[1], { size: 22, weight: 400, oy: 0.5, color: KG.SKIN.body }));
        });
      },
      buttons: [
        { label: 'เปิดในแท็บใหม่แทน', style: 'cyan', icon: 'expand', onClick: () => KG.popOut(next) },
        { label: 'เข้าใจแล้ว', style: 'primary', icon: 'check', pulse: true, onClick: done }]
    });
  };
  KG.setupPopout();
})();
