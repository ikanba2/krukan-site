/* ===== เสียงสังเคราะห์ด้วย WebAudio (ไม่ใช้ไฟล์เสียง) และเพลงพื้นหลังแบบวนซ้ำ ===== */
(function () {
  'use strict';
  const A = KG.audio = { ctx: null, master: null, sfxBus: null, musBus: null, sfxOn: true, musOn: true, ready: false, last: {} };
  const mtof = n => 440 * Math.pow(2, (n - 69) / 12);

  A.init = function (game) {
    if (A.ready) return;
    try {
      A.ctx = (game && game.sound && game.sound.context) || new (window.AudioContext || window.webkitAudioContext)();
      A.master = A.ctx.createGain(); A.master.gain.value = 0.9; A.master.connect(A.ctx.destination);
      A.sfxBus = A.ctx.createGain(); A.sfxBus.gain.value = 0.9; A.sfxBus.connect(A.master);
      A.musBus = A.ctx.createGain(); A.musBus.gain.value = 0.55; A.musBus.connect(A.master);
      const comp = A.ctx.createDynamicsCompressor(); A.master.disconnect(); A.master.connect(comp); comp.connect(A.ctx.destination);
      const buf = A.ctx.createBuffer(1, A.ctx.sampleRate, A.ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      A.noiseBuf = buf; A.ready = true;
      // กันตัวเกม/เบราว์เซอร์สั่งเล่นเสียงต่อเองระหว่างที่เรายังหยุดไว้ (เช่น เมื่อกลับมาโฟกัสหน้าเดิมหลังเปิดเกมในแท็บใหม่)
      A.ctx.onstatechange = () => { if (A.held && A.ctx.state === 'running') { try { A.ctx.suspend(); } catch (e) { /* ไม่เป็นไร */ } } };
      if (A.held) A.ctx.suspend();
    } catch (e) { A.ready = false; }
  };
  A.holds = {}; A.held = false;
  A.resume = function () { if (A.held) return; if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); };
  // หยุดเสียงทั้งหมดชั่วคราว why = เหตุผล ('hidden' แท็บถูกซ่อน, 'pop' เปิดเกมในแท็บใหม่แล้ว) ต้องปล่อยครบทุกเหตุผลเสียงจึงกลับมา
  // กันเพลงของหน้าที่อยู่เบื้องหลังเล่นทับเพลงของแท็บที่กำลังเล่นอยู่
  A.hold = function (why, on) {
    A.holds[why] = !!on; A.held = Object.keys(A.holds).some(k => A.holds[k]);
    if (!A.ctx) return;
    try { if (A.held) A.ctx.suspend(); else A.ctx.resume(); } catch (e) { /* ไม่เป็นไร */ }
  };
  document.addEventListener('visibilitychange', () => A.hold('hidden', document.hidden));

  /* ---------- ตัวสร้างเสียงพื้นฐาน ---------- */
  function tone(o) {
    const c = A.ctx, t0 = c.currentTime + (o.delay || 0), dur = o.t || 0.12;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + dur);
    if (o.detune) osc.detune.value = o.detune;
    const v = o.vol == null ? 0.08 : o.vol, a = o.a || 0.004;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || A.sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function noise(o) {
    const c = A.ctx, t0 = c.currentTime + (o.delay || 0), dur = o.t || 0.12;
    const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    src.buffer = A.noiseBuf; src.loop = true;
    f.type = o.ft || 'bandpass'; f.frequency.setValueAtTime(o.f || 1800, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.f2), t0 + dur);
    f.Q.value = o.q || 0.9;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(o.vol || 0.1, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || A.sfxBus);
    src.start(t0, Math.random()); src.stop(t0 + dur + 0.02);
  }
  A.tone = tone; A.noise = noise;

  /* ---------- เอฟเฟกต์เสียง ---------- */
  const S = A.sfx = {
    hover() { tone({ f: 880, t: 0.03, type: 'sine', vol: 0.018 }); },
    tap() { tone({ f: 640, f2: 520, t: 0.06, type: 'square', vol: 0.05 }); noise({ f: 4000, t: 0.02, vol: 0.03, ft: 'highpass' }); },
    confirm() { tone({ f: 523, t: 0.09, type: 'square', vol: 0.05 }); tone({ f: 784, t: 0.14, type: 'square', vol: 0.05, delay: 0.07 }); },
    back() { tone({ f: 500, f2: 330, t: 0.12, type: 'triangle', vol: 0.06 }); },
    error() { tone({ f: 170, f2: 90, t: 0.28, type: 'sawtooth', vol: 0.07 }); tone({ f: 120, f2: 70, t: 0.3, type: 'square', vol: 0.04, delay: 0.04 }); },
    whoosh() { noise({ f: 400, f2: 3200, t: 0.32, vol: 0.09, q: 0.8 }); },
    pop() { tone({ f: 300, f2: 700, t: 0.09, type: 'sine', vol: 0.09 }); },
    drop() { tone({ f: 900, f2: 360, t: 0.1, type: 'triangle', vol: 0.07 }); noise({ f: 2500, t: 0.04, vol: 0.04, ft: 'highpass' }); },
    remove() { tone({ f: 420, f2: 160, t: 0.14, type: 'sawtooth', vol: 0.05 }); },
    step() { tone({ f: 130, f2: 70, t: 0.1, type: 'sine', vol: 0.16 }); noise({ f: 1200, t: 0.04, vol: 0.05 }); },
    turn() { tone({ f: 420, f2: 760, t: 0.1, type: 'triangle', vol: 0.07 }); noise({ f: 3000, t: 0.06, vol: 0.04, ft: 'highpass' }); },
    jump() { tone({ f: 260, f2: 760, t: 0.18, type: 'square', vol: 0.06 }); noise({ f: 800, f2: 2600, t: 0.12, vol: 0.04 }); },
    land() { tone({ f: 110, f2: 55, t: 0.12, type: 'sine', vol: 0.2 }); noise({ f: 900, t: 0.06, vol: 0.06 }); },
    swing() { noise({ f: 700, f2: 4200, t: 0.16, vol: 0.12, q: 1.2 }); tone({ f: 600, f2: 1100, t: 0.1, type: 'sawtooth', vol: 0.03 }); },
    hit() { noise({ f: 1500, f2: 300, t: 0.2, vol: 0.2, q: 0.6 }); tone({ f: 220, f2: 60, t: 0.2, type: 'sawtooth', vol: 0.1 }); },
    kill() { S.hit(); tone({ f: 880, f2: 220, t: 0.28, type: 'square', vol: 0.05, delay: 0.05 }); noise({ f: 5000, f2: 800, t: 0.35, vol: 0.08, delay: 0.05 }); },
    crate() { noise({ f: 600, f2: 150, t: 0.25, vol: 0.22, q: 0.5 }); tone({ f: 160, f2: 60, t: 0.18, type: 'square', vol: 0.08 }); },
    hurt() { tone({ f: 300, f2: 80, t: 0.35, type: 'sawtooth', vol: 0.1 }); noise({ f: 1000, t: 0.2, vol: 0.12 }); },
    fall() { tone({ f: 700, f2: 90, t: 0.7, type: 'sine', vol: 0.1 }); },
    coin(o) { const k = (o && o.i) || 0; tone({ f: 988 * Math.pow(1.0595, k), t: 0.08, type: 'square', vol: 0.05 }); tone({ f: 1318 * Math.pow(1.0595, k), t: 0.2, type: 'square', vol: 0.05, delay: 0.07 }); },
    portal() { [392, 523, 659, 784, 1047].forEach((f, i) => tone({ f, t: 0.22, type: 'triangle', vol: 0.06, delay: i * 0.06 })); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone({ f, t: 0.22, type: 'square', vol: 0.05, delay: i * 0.11 })); [523, 659, 784].forEach(f => tone({ f: f / 2, t: 0.7, type: 'triangle', vol: 0.06, delay: 0.46 })); },
    lose() { [440, 370, 311, 247].forEach((f, i) => tone({ f, t: 0.28, type: 'sawtooth', vol: 0.05, delay: i * 0.15 })); },
    star(o) { const k = (o && o.i) || 0; tone({ f: 784 * Math.pow(1.122, k), t: 0.3, type: 'triangle', vol: 0.09 }); tone({ f: 1568 * Math.pow(1.122, k), t: 0.4, type: 'sine', vol: 0.05, delay: 0.02 }); },
    tick(o) { const p = (o && o.p) || 1; tone({ f: 1100 * p, t: 0.018, type: 'square', vol: 0.045 }); noise({ f: 5000, t: 0.012, vol: 0.04, ft: 'highpass' }); },
    key() { tone({ f: 700 + Math.random() * 120, t: 0.04, type: 'square', vol: 0.035 }); },
    zap() { tone({ f: 1400, f2: 200, t: 0.22, type: 'sawtooth', vol: 0.07 }); noise({ f: 3000, f2: 500, t: 0.2, vol: 0.1 }); },
    alarm() { [0, 0.22].forEach(d => { tone({ f: 740, t: 0.18, type: 'square', vol: 0.07, delay: d }); tone({ f: 554, t: 0.18, type: 'square', vol: 0.07, delay: d + 0.09 }); }); },
    unlock() { [330, 440, 554, 740].forEach((f, i) => tone({ f, t: 0.14, type: 'triangle', vol: 0.07, delay: i * 0.07 })); noise({ f: 6000, t: 0.25, vol: 0.05, ft: 'highpass', delay: 0.28 }); },
    charge() { tone({ f: 200, f2: 900, t: 0.4, type: 'sawtooth', vol: 0.05 }); },
    count() { tone({ f: 660, t: 0.12, type: 'square', vol: 0.06 }); },
    stamp() { tone({ f: 150, f2: 60, t: 0.14, type: 'sine', vol: 0.2 }); noise({ f: 1600, f2: 300, t: 0.09, vol: 0.14, q: 0.6 }); },
    good() { [659, 880, 1175].forEach((f, i) => tone({ f, t: 0.14, type: 'triangle', vol: 0.07, delay: i * 0.05 })); },
    slice() { noise({ f: 900, f2: 5200, t: 0.13, vol: 0.14, q: 1.4 }); tone({ f: 1200, f2: 300, t: 0.12, type: 'sawtooth', vol: 0.05 }); },
    henshin() { [392, 494, 587, 784, 988, 1175, 1568].forEach((f, i) => tone({ f, t: 0.2, type: 'square', vol: 0.05, delay: i * 0.06 })); noise({ f: 800, f2: 6000, t: 0.5, vol: 0.1, q: 0.8 }); },
    go() { tone({ f: 990, t: 0.3, type: 'square', vol: 0.07 }); tone({ f: 1320, t: 0.3, type: 'square', vol: 0.05, delay: 0.02 }); },
    /* ---- เสียงของเกมพิมพ์: ทุกปุ่มมีเสียง แต่ละชนิดต่างกัน ---- */
    type(o) {   // ตัวอักษรที่พิมพ์ถูก: โน้ตสเกลเพนทาโทนิกตามตำแหน่งปุ่ม พิมพ์ติดกันเป็นทำนอง
      const i = (o && o.i) || 0, sc = [0, 2, 4, 7, 9], n = 57 + sc[i % 5] + 12 * Math.floor((i % 15) / 5);
      tone({ f: mtof(n), t: 0.16, type: 'square', vol: 0.05 }); tone({ f: mtof(n + 12), t: 0.1, type: 'triangle', vol: 0.04 }); noise({ f: 5200, t: 0.014, vol: 0.035, ft: 'highpass' });
    },
    back() { tone({ f: 300, f2: 90, t: 0.13, type: 'sawtooth', vol: 0.07 }); noise({ f: 1000, f2: 220, t: 0.1, vol: 0.07, q: 0.7 }); },
    shift() { noise({ f: 2400, f2: 7000, t: 0.1, vol: 0.08, q: 1.6 }); tone({ f: 1500, f2: 2400, t: 0.07, type: 'triangle', vol: 0.045 }); },
    space() { tone({ f: 210, f2: 140, t: 0.08, type: 'sine', vol: 0.14 }); noise({ f: 1300, t: 0.04, vol: 0.05 }); },
    wrong() { tone({ f: 160, f2: 80, t: 0.22, type: 'sawtooth', vol: 0.09 }); tone({ f: 205, f2: 100, t: 0.22, type: 'square', vol: 0.05 }); noise({ f: 700, t: 0.1, vol: 0.06 }); },
    denied() { tone({ f: 130, t: 0.1, type: 'square', vol: 0.08 }); tone({ f: 98, t: 0.14, type: 'square', vol: 0.08, delay: 0.09 }); },
    ready() { [880, 1319, 1760].forEach((f, i) => tone({ f, t: 0.2, type: 'triangle', vol: 0.07, delay: i * 0.05 })); noise({ f: 6500, t: 0.12, vol: 0.04, ft: 'highpass', delay: 0.05 }); },
    enterOk(o) {
      const up = Math.min(7, ((o && o.combo) || 0) % 8);
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ f: f * Math.pow(1.0595, up), t: 0.2, type: 'square', vol: 0.055, delay: i * 0.045 }));
      noise({ f: 7000, f2: 800, t: 0.5, vol: 0.16, ft: 'highpass', q: 0.6 }); tone({ f: 100, f2: 38, t: 0.24, type: 'sine', vol: 0.26 }); tone({ f: 2093, t: 0.3, type: 'triangle', vol: 0.05, delay: 0.2 });
    },
    perfect() { [1568, 1976, 2349, 3136].forEach((f, i) => tone({ f, t: 0.14, type: 'sine', vol: 0.06, delay: 0.1 + i * 0.05 })); },
    combo(o) { const k = (o && o.i) || 1; [0, 4, 7, 12, 16].slice(0, 3 + Math.min(2, k)).forEach((d, i) => tone({ f: mtof(64 + d + Math.min(8, k * 2)), t: 0.16, type: 'square', vol: 0.05, delay: i * 0.06 })); noise({ f: 5000, t: 0.2, vol: 0.06, ft: 'highpass', delay: 0.1 }); },
    capsOn() { tone({ f: 400, f2: 520, t: 0.1, type: 'triangle', vol: 0.07 }); },
    fanfare() { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => { tone({ f, t: 0.24, type: 'square', vol: 0.055, delay: i * 0.1 }); tone({ f: f / 2, t: 0.24, type: 'triangle', vol: 0.06, delay: i * 0.1 }); }); noise({ f: 7000, f2: 900, t: 0.8, vol: 0.14, ft: 'highpass', delay: 0.7 }); }
  };
  A.play = function (name, opt) {
    if (!A.sfxOn || !A.ready) return;
    const now = performance.now();
    if (A.last[name] && now - A.last[name] < (name === 'hover' ? 60 : (name === 'type' || name === 'back' ? 8 : 25))) return;
    A.last[name] = now;
    A.resume();
    try { S[name](opt); } catch (e) { /* ข้ามถ้าเล่นเสียงไม่ได้ */ }
  };

  /* ---------- เพลงพื้นหลัง ---------- */
  // ทุกแทร็กเป็นลูป 16 ขั้น (โน้ตสิบหก) ใช้สเกลไมเนอร์/เพนทาโทนิกให้ฟังสบาย ไม่รบกวนการคิด
  const TRACKS = {
    menu: { bpm: 88, bass: [45, 0, 0, 0, 45, 0, 0, 43, 41, 0, 0, 0, 41, 0, 43, 0], arp: [69, 72, 76, 72, 69, 72, 79, 76, 65, 69, 72, 69, 67, 71, 74, 71], lead: [0, 0, 0, 0, 0, 0, 81, 0, 0, 0, 0, 0, 79, 0, 76, 0], hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] },
    think: { bpm: 100, bass: [40, 0, 0, 40, 0, 0, 43, 0, 38, 0, 0, 38, 0, 0, 41, 0], arp: [64, 67, 71, 67, 64, 67, 74, 71, 62, 65, 69, 65, 62, 66, 69, 66], lead: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] },
    groove: { bpm: 114, bass: [45, 0, 45, 0, 48, 0, 45, 0, 43, 0, 43, 0, 47, 0, 43, 45], arp: [69, 0, 72, 0, 76, 0, 72, 0, 67, 0, 71, 0, 74, 0, 71, 0], lead: [0, 0, 81, 0, 0, 0, 79, 0, 0, 0, 76, 0, 79, 0, 0, 0], hat: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1] },
    // ชุดเพลงเมเจอร์สดใสสำหรับเกมธีมสว่าง
    sunny: { bpm: 116, bass: [36, 0, 0, 36, 0, 0, 43, 0, 41, 0, 0, 41, 0, 0, 43, 0], arp: [72, 76, 79, 76, 72, 76, 79, 84, 77, 81, 84, 81, 77, 81, 84, 81], lead: [0, 0, 84, 0, 0, 0, 79, 0, 0, 0, 81, 0, 0, 0, 79, 76], hat: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1] },
    bounce: { bpm: 126, bass: [43, 0, 43, 0, 48, 0, 48, 0, 50, 0, 50, 0, 48, 0, 47, 0], arp: [67, 71, 74, 71, 67, 71, 74, 79, 72, 76, 79, 76, 72, 76, 79, 76], lead: [79, 0, 0, 76, 0, 0, 74, 0, 72, 0, 0, 74, 0, 0, 76, 0], hat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0] },
    breeze: { bpm: 100, bass: [41, 0, 0, 0, 41, 0, 0, 36, 38, 0, 0, 0, 38, 0, 36, 0], arp: [65, 69, 72, 69, 65, 69, 77, 72, 62, 65, 69, 65, 62, 67, 70, 67], lead: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] },
    action: { bpm: 132, bass: [45, 45, 0, 45, 45, 0, 45, 0, 43, 43, 0, 43, 43, 0, 41, 0], arp: [69, 72, 76, 81, 76, 72, 69, 72, 67, 71, 74, 79, 74, 71, 67, 71], lead: [81, 0, 0, 79, 0, 0, 76, 0, 79, 0, 0, 76, 0, 0, 72, 74], hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1] }
  };
  const M = A.mus = { name: null, timer: null, next: 0, step: 0 };
  function sched() {
    const tr = TRACKS[M.name]; if (!tr || !A.ready) return;
    const c = A.ctx, spb = 60 / tr.bpm / 4;
    while (M.next < c.currentTime + 0.18) {
      const i = M.step % 16, d = M.next - c.currentTime;
      const b = tr.bass[i], ar = tr.arp[i], ld = tr.lead[i];
      if (b) tone({ f: mtof(b), t: spb * 1.7, type: 'triangle', vol: 0.11, delay: d, bus: A.musBus });
      if (ar) tone({ f: mtof(ar), t: spb * 1.3, type: 'square', vol: 0.025, delay: d, bus: A.musBus });
      if (ld) tone({ f: mtof(ld), t: spb * 2.4, type: 'sine', vol: 0.045, delay: d, bus: A.musBus });
      if (tr.hat[i]) noise({ f: 7000, t: 0.03, vol: 0.02, ft: 'highpass', delay: d, bus: A.musBus });
      if (tr.kick[i]) tone({ f: 120, f2: 45, t: 0.14, type: 'sine', vol: 0.2, delay: d, bus: A.musBus });
      M.next += spb; M.step++;
    }
  }
  A.music = function (name) {
    if (!A.ready) return;
    if (M.name === name && M.timer) return;
    A.stopMusic(); M.name = name;
    if (!A.musOn || !name) return;
    M.next = A.ctx.currentTime + 0.05; M.step = 0; A.resume();
    M.timer = setInterval(sched, 40);
  };
  A.stopMusic = function () { if (M.timer) { clearInterval(M.timer); M.timer = null; } };
  A.setSfx = function (on) { A.sfxOn = on; };
  A.setMusic = function (on) { A.musOn = on; if (on) { const n = M.name; M.name = null; A.music(n || 'menu'); } else A.stopMusic(); };
})();
