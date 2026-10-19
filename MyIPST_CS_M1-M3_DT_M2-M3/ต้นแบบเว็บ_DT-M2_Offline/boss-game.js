/* เกมสู้บอสประจำบท (ม.1 วิชาออกแบบ) — แอคชันบนแคนวาส คั่นด่านด้วยคำถาม
   ควบคุม: โจมตี = Z / J / เว้นวรรค · หลบ(กระโดด) = X / K / ลูกศรขึ้น · มือถือใช้ปุ่มบนหน้าจอ
   อาวุธระยะใกล้ (ดาบ หอก มีดคู่) พุ่งเข้าไปฟันเอง · ปืนยิงจากระยะไกล
   บอสมี 4 ช่วงเลือด จบแต่ละช่วงเกราะบอสจะปิด ต้องตอบคำถามให้ถูกเพื่อทำลายเกราะ */
(function () {
  'use strict';
  const D = window.DT_DATA;
  const W = 960, H = 540, GROUND = 446; /* เส้นยืนอยู่กลางแถบพื้นของฉากทุกด่าน (เดิม 462 ชิดขอบล่างของพื้น) */
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  // Seven chapter-specific arenas. Climate selects particles and FX, not the background file.
  const CLIMATE = { 1: 'nature', 2: 'nature', 3: 'rock', 4: 'rock', 5: 'thunder', 6: 'thunder', 7: 'fire' };
  const CLIM_IDX = { thunder: 0, water: 1, nature: 2, fire: 3, ice: 4, rock: 5 };
  const GLOW = { thunder: '#b8a6ff', water: '#70e8fb', nature: '#a6f48b', fire: '#ffae62', ice: '#d3f2ff', rock: '#e4bd8c' };
  const WEAPON = {
    sword: { name: 'ดาบ', dmg: 7, reach: 250, cd: 0.5, melee: true, c1: '#7ffcff', c2: '#ffffff', hits: [0.06] },
    spear: { name: 'หอก', dmg: 9, reach: 320, cd: 0.62, melee: true, c1: '#ffe27a', c2: '#fff6c8', hits: [0.07] },
    dual: { name: 'มีดคู่', dmg: 4, reach: 215, cd: 0.5, melee: true, c1: '#ff7ad1', c2: '#ffffff', hits: [0.05, 0.17] },
    gun: { name: 'ปืน', dmg: 3.2, reach: 0, cd: 0.3, melee: false, c1: '#fff06a', c2: '#ffffff', hits: [0] }
  };
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const audio = n => { try { window.GameAudio && GameAudio.play(n); } catch (e) { /* เงียบ */ } };

  let G = null, raf = 0, keyH = null;

  function loadImg(src) {
    return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  }

  /* ---------- หน้าเปิด / ผลลัพธ์ ---------- */
  function view(c) {
    if (window.DTSprites && !window.DTSprites.ready) { window.DTSprites.wait().then(() => { if (/\/arena/.test(location.hash) && window.DTApp) window.DTApp.render(); }); return `<section class="paper sprite-wait"><img src="${window.DTA ? window.DTA('techno-sword.webp') : ''}" alt=""><div><h2>กำลังเตรียมลานบอส…</h2><p>กำลังโหลดภาพตัวละครและบอส รอแป๊บเดียวนะ</p><i class="sw-bar"></i></div></section>`; }
    stop();
    setTimeout(() => intro(c), 0);
    return '<section class="paper prac bgame" id="bgame" aria-live="polite"></section>';
  }
  function bossOf(c) { const e = D.encounters.find(x => x.chapterId === c.id); return { e, boss: D.bosses.find(b => b.number === e.mainBoss) }; }
  function intro(c) {
    const host = $('#bgame'); if (!host) return;
    const { e, boss } = bossOf(c), P = window.DTPractice, r = P.getRec(c.number), w = P.getWeapon(), clim = CLIMATE[c.number] || 'nature';
    host.innerHTML = `<span class="eyebrow">BOSS BATTLE · ${esc(e.arena)} · ${esc(e.planet)}</span><h2>ดวลบอสประจำบท: ${esc(boss.thaiName)}</h2>
      <div class="bg-poster vs" style="--poster:url(assets/arena-${window.DT_CFG.slug}-c${String(c.number).padStart(2, '0')}.webp)"><img class="bg-phero" src="assets/techno-sword.webp" alt="Techno"><span class="bg-vs" aria-hidden="true">VS</span><img class="bg-pbossimg" src="assets/boss-${boss.number}.webp" alt="${esc(boss.thaiName)}"><div class="bg-say boss"><span class="bg-who">${esc(boss.thaiName)}</span>“${esc(e.intro || 'มาพิสูจน์ความเข้าใจของเจ้ากัน')}”</div><div class="bg-say tech"><span class="bg-who">Techno</span>“${r.battle ? 'เคยชนะมาแล้ว ลุยอีกรอบ!' : 'ตอบให้ถูกแล้วโจมตีเลย!'}”</div></div>
      <section class="wsel" role="group" aria-label="เลือกอาวุธของ Techno"><div class="wsel-h"><span class="eyebrow">STEP 1</span><h3>เลือกอาวุธของ Techno</h3><p>แต่ละอาวุธเล่นต่างกัน เลือกแบบที่ถนัดได้เลย เปลี่ยนได้ทุกครั้งก่อนเริ่ม</p></div>
      <div class="wsel-grid">${P.WEAPONS.map(([k, t]) => { const W2 = WEAPON[k], tip = { sword: 'สมดุล พุ่งฟันเร็ว ฟันกระสุนได้', spear: 'แรงที่สุด ระยะไกล แต่ฟันช้ากว่า', dual: 'ฟัน 2 ครั้งต่อการกด ฟันกระสุนได้', gun: 'ยิงไกล ไม่ต้องพุ่งเข้าไป แต่ต้องกระโดดหลบกระสุน' }[k], bar = n => '<i class="wb">' + Array.from({ length: 5 }, (_, x) => `<s class="${x < n ? 'on' : ''}"></s>`).join('') + '</i>'; const pow = Math.max(1, Math.min(5, Math.round(W2.dmg * W2.hits.length / 2))), spd = Math.max(1, Math.min(5, Math.round(1.6 / W2.cd))); return `<button type="button" class="wcard ${k === w ? 'sel' : ''}" style="--wc:${W2.c1}" data-bgw="${k}" aria-pressed="${k === w}">${k === w ? '<em class="wtag">เลือกอยู่</em>' : ''}<span class="wimg" style="background-image:url(assets/hero-${k}.webp)"></span><span class="wtx"><b>${t}</b><small>${tip}</small></span><span class="wstat"><span><em>พลัง</em>${bar(pow)}</span><span><em>เร็ว</em>${bar(spd)}</span></span></button>`; }).join('')}</div></section>
      <details class="b-info b-howto"><summary>📖 วิธีเล่น (กดเพื่อเปิดอ่าน)</summary><ul class="b-rules"><li><b>โจมตี</b> กดปุ่ม <kbd>Z</kbd> / เว้นวรรค หรือปุ่มบนจอ ${w === 'gun' ? 'ปืนยิงโจมตีจากระยะไกล' : 'Techno พุ่งเข้าไปฟันบอสเอง แล้วกลับที่เดิม'}</li><li><b>หลบ</b> กดปุ่ม <kbd>X</kbd> / ลูกศรขึ้น หรือปุ่มบนจอ ตอนเห็นเครื่องหมายเตือนสีแดง ตัวละครจะกระโดดสูงและไม่โดนโจมตีตลอดที่ลอยอยู่ กดหลบได้แม้กำลังโจมตีอยู่</li><li><b>ฟันกระสุน</b> ถ้าใช้ดาบ หอก หรือมีดคู่ พุ่งฟันใส่กระสุนของบอสได้เลย กระสุนจะแตก ส่วนปืนต้องกระโดดหลบ</li><li><b>เกราะบอส</b> บอสมี 4 ช่วงเลือด จบแต่ละช่วงเกราะจะปิด ต้อง <b>ตอบคำถามให้ถูก</b> ถึงจะทำลายเกราะแล้วสู้ต่อได้ ตอบผิดเสียหัวใจ</li><li>หัวใจ 3 ดวง ตอบถูกได้หัวใจคืน 1 ดวง · ${r.battle ? 'เคยชนะแล้ว (+50 XP)' : 'ชนะครั้งแรกได้ +50 XP'}</li></ul></details>
      <div class="prac-actions wstart"><button class="btn green" data-bgs="start">⚔️ เริ่มต่อสู้ด้วย${esc(WEAPON[w] ? WEAPON[w].name : "")}</button><a class="btn secondary" href="#chapter/${c.number}/practice">ฝึกก่อนที่ด่านฝึก</a></div>`;
    host._chapter = c;
  }

  /* ---------- เริ่มเกม ---------- */
  async function start(c) {
    const host = $('#bgame'); if (!host) return;
    const P = window.DTPractice, { e, boss } = bossOf(c), weapon = P.getWeapon(), clim = CLIMATE[c.number] || 'nature';
    host.innerHTML = `<div class="bg-top"><div class="bg-name"><b>${esc(boss.thaiName)}</b></div><div class="bg-hp" aria-label="พลังบอส"><i id="bg-hpi"></i><u></u><u></u><u></u></div><div class="bg-hearts" id="bg-hearts" aria-label="หัวใจของ Techno"></div><div class="bg-combo" id="bg-combo" aria-live="off"></div></div>
      <div class="bg-wrap" id="bg-wrap"><canvas id="bg-canvas" width="${W}" height="${H}" aria-label="ฉากต่อสู้ Techno กับ ${esc(boss.thaiName)}"></canvas><div class="bg-load" id="bg-load">กำลังโหลดภาพ…</div><div class="bg-gate" id="bg-gate" hidden></div><div class="bg-msg" id="bg-msg" hidden></div></div>
      <div class="bg-pad"><button type="button" class="bg-btn dodge" id="bg-dodge" aria-label="หลบ">หลบ<small>X</small></button><button type="button" class="bg-btn atk" id="bg-atk" aria-label="โจมตี">โจมตี<small>Z</small></button></div>
      <div class="bg-ctl" aria-label="วิธีควบคุม">
        <div class="bg-ctl-row"><span class="bg-ctl-tag atk">โจมตี</span><span class="bg-key"><b>Z</b></span><i>หรือ</i><span class="bg-key wide"><b>SPACE</b></span></div>
        <div class="bg-ctl-row"><span class="bg-ctl-tag dod">หลบ</span><span class="bg-key"><b>X</b></span><i>หรือ</i><span class="bg-key"><b>↑</b></span></div>
        <div class="bg-ctl-row"><span class="bg-ctl-tag ans">ตอบ</span><span class="bg-key"><b>1</b></span><span class="bg-key"><b>2</b></span><span class="bg-key"><b>3</b></span><span class="bg-key"><b>4</b></span><i>แล้ว</i><span class="bg-key wide"><b>ENTER</b></span></div>
        <p class="bg-ctl-note">ตอบคำถามให้ถูกเพื่อทำลายเกราะบอส · ใช้ได้ทั้งแป้นไทยและอังกฤษ ไม่ต้องสลับภาษา</p>
      </div>`;
    const [bg, hero, bossImg, fx] = await Promise.all([loadImg(`assets/arena-${window.DT_CFG.slug}-c${String(c.number).padStart(2, '0')}.webp`), loadImg(`assets/hero-${weapon}.webp`), loadImg(`assets/sheet-${boss.number}.webp`), loadImg(`assets/combat-boss-fx.webp`)]);
    const ld = $('#bg-load'); if (ld) ld.remove();
    const cv = $('#bg-canvas'); if (!cv) return;
    G = {
      n: c.number, c, e, boss, weapon, wp: WEAPON[weapon], clim, glow: GLOW[clim], cv, ctx: cv.getContext('2d'), img: { bg, hero, boss: bossImg, fx },
      t: 0, frozen: 0, shake: 0, flash: 0, over: false, phase: 'play',
      hero: { x: 170, home: 170, y: 0, state: 'idle', st: 0, hearts: 3, inv: 0, cd: 0, frame: 0, dir: 1, ghosts: [], hitsLeft: [], didHit: [] },
      bossS: { x: 770, home: 770, hp: 100, floor: 75, seg: 0, shield: false, state: 'idle', st: 0, next: 2.2, kind: '', hurt: 0, frame: 3, shake: 0 },
      shots: [], fxs: [], parts: [], nums: [], combo: 0, comboT: 0, right: 0, wrong: 0, pool: null, qi: 0, last: performance.now()
    };
    G.pool = window.DTPractice.quizPool(c.number);
    hud();
    bind(); loop();
  }

  function stop() {
    cancelAnimationFrame(raf); raf = 0;
    if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; }
    G = null;
  }
  function bind() {
    const atk = $('#bg-atk'), dod = $('#bg-dodge');
    const down = (el, fn) => { el.addEventListener('pointerdown', e => { e.preventDefault(); fn(); }); };
    down(atk, attack); down(dod, dodge);
    keyH = e => {
      if (!G || G.over || e.target.closest('input,textarea,select') || e.ctrlKey || e.metaKey || e.altKey) return;
      /* ใช้ตำแหน่งปุ่มจริง (e.code) จึงเล่นได้ทั้งแป้นภาษาไทยและอังกฤษ ไม่ต้องสลับภาษา
         เช่น Z บนแป้นไทยคือ "ผ" X คือ "ป" J คือ "่" K คือ "า" ก็ยังทำงาน */
      const c = e.code, k = (e.key || '').toLowerCase();
      const gateOpen = document.querySelector('[data-bgq]:not([disabled])'), nextBtn = document.querySelector('[data-bgq-next]');
      if (gateOpen || nextBtn) {
        const m = /^(?:Digit|Numpad)([1-4])$/.exec(c);
        if (m && gateOpen) { const btn = document.querySelectorAll('[data-bgq]')[Number(m[1]) - 1]; if (btn && !btn.disabled) { e.preventDefault(); btn.click(); } return; }
        if ((c === 'Enter' || c === 'NumpadEnter' || c === 'Space') && nextBtn) { e.preventDefault(); nextBtn.click(); return; }
        return;
      }
      if (['KeyZ', 'KeyJ', 'Space'].includes(c) || ['z', 'j', ' ', 'ผ'].includes(k)) { e.preventDefault(); attack(); }
      else if (['KeyX', 'KeyK', 'ArrowUp', 'KeyW'].includes(c) || ['x', 'k', 'arrowup', 'ป'].includes(k)) { e.preventDefault(); dodge(); }
    };
    document.addEventListener('keydown', keyH);
  }

  /* ---------- การโจมตีของผู้เล่น ---------- */
  function attack() {
    const g = G, h = g && g.hero; if (!g || g.over || g.phase !== 'play' || h.state !== 'idle' || h.cd > 0) return;
    h.cd = g.wp.cd; h.st = 0; h.hitsLeft = g.wp.hits.slice(); h.didHit = [];
    if (g.wp.melee) { h.state = 'dash'; h.from = h.x; h.to = g.bossS.x - g.wp.reach; audio('charge'); }
    else { h.state = 'shoot'; audio('laser'); }
  }
  function dodge() {
    const g = G, h = g && g.hero; if (!g || g.over || g.phase !== 'play') return;
    if (h.state === 'dodge') { if (h.st >= 0.4) h.buf = 0.45; return; } /* กดซ้ำตอนใกล้ลงพื้น: จำไว้แล้วกระโดดทันทีที่ลงพื้น (กระสุน 2 ลูกติดกัน) */
    if (h.state === 'finisher' || h.state === 'win' || h.state === 'lose') return;
    if (h.state === 'hurt') { h.buf = 0.25; return; } /* กดระหว่างโดนตี: จำไว้แล้วกระโดดทันทีที่ลุกได้ */
    /* ยกเลิกท่าโจมตีเพื่อหลบได้ทันที (ตัวละครถอยกลับจุดยืนระหว่างลอย) */
    h.fromX = h.x; h.state = 'dodge'; h.st = 0; h.inv = Math.max(h.inv, 0.8); /* อมตะตลอดการกระโดด (0.78 วินาที) ไม่โดนตอนลงพื้น */ h.buf = 0; h.dodged = {}; audio('tab');
    burst(h.x, GROUND - 10, 8, '#ffffff', 160);
  }
  const DMG_SCALE = 0.34; /* ปรับความยาวการต่อสู้: ยิ่งน้อยยิ่งต้องตีหลายครั้งก่อนถึงประตูคำถาม */
  function damageBoss(amount, x, y, big) {
    const g = G, b = g.bossS; if (b.shield || b.state === 'dead') return;
    const mult = 1 + Math.min(g.combo, 6) * 0.1, d = amount * mult * DMG_SCALE;
    b.hp = Math.max(b.floor, b.hp - d); b.hurt = 0.18; b.shake = 6;
    g.combo++; g.comboT = 1.6; g.frozen = reduce ? 0 : (big ? 0.12 : 0.055); g.shake = reduce ? 0 : (big ? 14 : 6);
    g.nums.push({ x: x + rnd(-14, 14), y: y - 20, t: 0, txt: '-' + Math.round(d), c: big ? '#ffd23f' : '#fff' });
    burst(x, y, big ? 26 : 14, g.wp.c1, big ? 520 : 360); burst(x, y, 8, '#ffffff', 280);
    g.fxs.push({ k: 'ring', x, y, t: 0, d: 0.32, c: g.wp.c1 }); g.fxs.push({ k: 'star', x, y, t: 0, d: 0.28, c: '#fff6a8', s: big ? 150 : 100 });
    audio(big ? 'impact' : 'impact');
    if (b.hp <= b.floor + 0.01) gateStart();
    hud();
  }
  function gateStart() {
    const g = G, b = g.bossS; if (b.shield) return;
    b.shield = true; g.phase = 'gate'; b.state = 'idle'; g.shots = [];
    audio('shield'); g.fxs.push({ k: 'ring', x: b.x, y: GROUND - 150, t: 0, d: 0.6, c: '#9de8ff', big: 1 });
    setTimeout(() => { if (G === g && !g.over) quiz(); }, reduce ? 100 : 650);
  }

  /* ---------- ด่านคำถาม ---------- */
  function quiz() {
    const g = G; if (!g) return; const q = g.pool[g.qi % g.pool.length]; g.qi++; g.curQ = q;
    const gate = $('#bg-gate'); if (!gate) return; gate.hidden = false;
    gate.innerHTML = `<div class="gate-card"><span class="eyebrow">เกราะบอสปิด! ตอบให้ถูกเพื่อทำลายเกราะ · ช่วงที่ ${g.bossS.seg + 1}/4</span>${q.ctx?`<p class="prac-ctx">${esc(q.ctx)}</p>`:''}<h3 class="prac-q">${esc(q.q)}</h3>${window.DTQF?window.DTQF.html(q.fig):''}<div class="battle-opts">${q.opts.map((o, i) => `<button type="button" class="opt" data-bgq="${i}"><b>${'กขคง'[i]}</b><span>${esc(o)}</span></button>`).join('')}</div><div id="bg-fb" class="prac-fb" hidden></div></div>`;
  }
  function answer(i) {
    const g = G; if (!g || g.answering) return; g.answering = true;
    const q = g.curQ, ok = i === q.ans;
    document.querySelectorAll('[data-bgq]').forEach((b, k) => { b.disabled = true; if (k === q.ans) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); });
    const fb = $('#bg-fb'); fb.hidden = false; fb.className = 'prac-fb ' + (ok ? 'ok' : 'no');
    fb.setAttribute('role', 'dialog'); fb.setAttribute('aria-modal', 'true'); fb.innerHTML = `<div class="fb-badge">${ok ? '✓' : '✗'}</div><strong>${ok ? 'ถูกต้อง! เกราะแตก' : 'ยังไม่ถูก บอสโต้กลับ'}</strong>${q.why ? `<p>${esc(q.why)}</p>` : ''}<div class="prac-actions"><button type="button" class="btn" data-bgq-next="1">${ok ? 'ลุยต่อ' : 'ลองคำถามใหม่'}</button></div>`;
    g.lastOk = ok; fb.querySelector('button').focus({ preventScroll: true });
  }
  function afterAnswer() {
    const g = G; if (!g) return; const gate = $('#bg-gate'); gate.hidden = true; gate.innerHTML = ''; g.answering = false;
    if (g.lastOk) { g.right++; g.hero.hearts = Math.min(3, g.hero.hearts + 1); breakShield(); }
    else { g.wrong++; hurtHero(true); if (g.hero.hearts > 0 && !g.over) setTimeout(() => { if (G === g && !g.over) quiz(); }, 900); }
    hud();
  }
  function breakShield() {
    const g = G, b = g.bossS, h = g.hero; g.phase = 'finisher'; h.state = 'finisher'; h.st = 0; h.from = h.x; h.to = b.x - Math.max(g.wp.reach, 230) + (g.wp.melee ? 0 : 180); h.hitsLeft = [0.2]; h.didHit = [];
    audio('charge');
  }
  function finisherHit() {
    const g = G, b = g.bossS; b.shield = false;
    const last = b.seg >= 3; g.flash = reduce ? 0 : 0.5; g.shake = reduce ? 0 : 22; g.frozen = reduce ? 0 : 0.2;
    g.fxs.push({ k: 'cross', x: b.x - 20, y: GROUND - 170, t: 0, d: 0.5, c: g.wp.c1 }); g.fxs.push({ k: 'ring', x: b.x, y: GROUND - 160, t: 0, d: 0.7, c: '#ffffff', big: 1 });
    burst(b.x, GROUND - 170, 60, g.wp.c1, 700); burst(b.x, GROUND - 170, 30, '#ffffff', 520); audio('impact');
    g.nums.push({ x: b.x, y: GROUND - 230, t: 0, txt: last ? 'พิชิต!' : 'เกราะแตก!', c: '#ffd23f', big: 1 });
    if (last) { b.hp = 0; b.state = 'dead'; b.st = 0; finishSoon(true); }
    else { b.seg++; b.floor = 75 - 25 * b.seg; b.hurt = 0.4; b.next = 1.6; g.phase = 'play'; }
    hud();
  }
  function hurtHero(force) {
    const g = G, h = g.hero; if (!force && h.inv > 0) return;
    h.hearts--; h.inv = 1.3; h.state = 'hurt'; h.st = 0; h.x = h.home; g.combo = 0; g.shake = reduce ? 0 : 12; g.frozen = reduce ? 0 : 0.06;
    burst(h.x, GROUND - 120, 14, '#ff6b6b', 380); audio('heroHurt'); g.nums.push({ x: h.x, y: GROUND - 230, t: 0, txt: '−1 ❤', c: '#ff8a8a' });
    if (force) { g.fxs.push({ k: 'bshot', x: g.bossS.x - 90, y: GROUND - 90, t: 0, d: 0.42, tx: h.x }); }
    if (h.hearts <= 0) { h.state = 'lose'; h.st = 0; finishSoon(false); }
    hud();
  }
  function finishSoon(win) {
    const g = G; if (g.over) return; g.over = true; g.phase = 'end'; g.win = win; if (win) { audio('victory'); g.hero.state = 'win'; }
    const gate = $('#bg-gate'); if (gate) { gate.hidden = true; gate.innerHTML = ''; }
    setTimeout(() => { if (G === g) result(); }, win ? 1900 : 1500);
  }
  function result() {
    const g = G, host = $('#bgame'); if (!host) return;
    const P = window.DTPractice; let first = false;
    if (g.win) first = P.recordBattle(g.n);
    const stars = g.win ? (g.hero.hearts >= 3 ? 3 : g.hero.hearts === 2 ? 2 : 1) : 0, c = g.c;
    cancelAnimationFrame(raf); raf = 0;
    const arena = `assets/arena-${window.DT_CFG.slug}-c${String(c.number).padStart(2, '0')}.webp`, heroPos = g.win ? '50% 100%' : '100% 100%';
    const tile = (ic, v, t) => `<div class="rs-tile"><span>${ic}</span><b>${v}</b><small>${t}</small></div>`;
    host.innerHTML = `<section class="rs ${g.win ? 'win' : 'lose'}" style="--rs-bg:url(${arena})">
      <div class="rs-stage" aria-hidden="true"><i class="rs-rays"></i>
        <span class="rs-hero" style="background-image:url(assets/hero-${esc(g.weapon)}.webp);background-position:${heroPos}"></span>
        <img class="rs-boss" src="assets/boss-${g.boss.number}.webp" alt="">
        ${g.win ? '<b class="rs-ko">K.O.!</b>' : '<b class="rs-ko lose">พักก่อน!</b>'}</div>
      <div class="rs-body"><span class="eyebrow">${g.win ? 'VICTORY' : 'DEFEATED'}</span>
        <h2>${g.win ? 'ชนะแล้ว! <span>' + esc(g.boss.thaiName) + '</span> ล้มลง' : 'พลังหมด แต่ยังสู้ต่อได้'}</h2>
        <div class="rs-stars" aria-label="ได้ ${stars} ดาว">${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
        <div class="rs-tiles">${tile('✅', g.right, 'ตอบถูก')}${tile('❌', g.wrong, 'ตอบผิด')}${tile('❤️', g.hero.hearts, 'หัวใจเหลือ')}${tile('⭐', first ? '+50' : '0', first ? 'XP ที่ได้' : 'XP (ได้ไปแล้ว)')}</div>
        <p class="rs-note">${g.win ? (stars === 3 ? 'สุดยอด! ไม่เสียหัวใจเลย' : 'เก่งมาก ลองสู้อีกครั้งเพื่อเก็บให้ครบ 3 ดาว (ไม่เสียหัวใจ)') : 'ทบทวนบทเรียนแล้วท้าชิงใหม่ได้เลย คำถามจะสลับทุกครั้ง'}</p>
        <div class="prac-actions"><button class="btn green" data-bgs="again">สู้อีกครั้ง</button><a class="btn secondary" href="#chapter/${c.number}/learn">อ่านบทเรียนอีกรอบ</a>${g.win ? `<a class="btn" href="#chapter/${c.number}/post">ไปทดสอบหลังเรียน</a>` : `<a class="btn" href="#home">กลับฐานภารกิจ</a>`}</div></div></section>`;
    host._chapter = c; G = null;
    if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; }
  }

  /* ---------- HUD ---------- */
  function hud() {
    const g = G; if (!g) return;
    const hp = $('#bg-hpi'); if (hp) hp.style.width = Math.max(0, g.bossS.hp) + '%';
    const he = $('#bg-hearts'); if (he) he.innerHTML = [0, 1, 2].map(i => `<i class="${i >= g.hero.hearts ? 'lost' : ''}"></i>`).join('');
    const cb = $('#bg-combo'); if (cb) { cb.textContent = g.combo >= 2 ? g.combo + ' COMBO!' : ''; cb.classList.toggle('on', g.combo >= 2); }
  }

  /* ---------- เอฟเฟกต์ ---------- */
  function burst(x, y, n, c, sp) { for (let i = 0; i < n; i++) { const a = rnd(0, Math.PI * 2), s = rnd(sp * 0.3, sp); G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, t: 0, d: rnd(0.3, 0.7), c, r: rnd(2, 5.5) }); } }
  function slashFx(x, y, k, power) { G.fxs.push({ k: 'slash', x, y, t: 0, d: power ? 0.4 : 0.26, a: k, c1: G.wp.c1, c2: G.wp.c2, big: power }); }

  /* ---------- ลูปเกม ---------- */
  function loop() {
    const g = G; if (!g) return;
    if (!document.getElementById('bg-canvas')) { stop(); return; }
    const now = performance.now(); let dt = Math.min(0.05, (now - g.last) / 1000); g.last = now;
    if (document.hidden) dt = 0;
    if (g.frozen > 0) { g.frozen -= dt; dt = 0; }
    update(g, dt); draw(g, dt);
    raf = requestAnimationFrame(loop);
  }

  function update(g, dt) {
    g.t += dt; const h = g.hero, b = g.bossS;
    if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 60); if (g.flash > 0) g.flash -= dt;
    h.cd = Math.max(0, h.cd - dt); h.inv = Math.max(0, h.inv - dt); if (h.buf > 0) h.buf -= dt; b.hurt = Math.max(0, b.hurt - dt); b.shake = Math.max(0, b.shake - dt * 30);
    if (g.comboT > 0) { g.comboT -= dt; if (g.comboT <= 0 && g.combo) { g.combo = 0; hud(); } }
    // ---- ผู้เล่น ----
    h.st += dt;
    if (h.state === 'dash') {
      const T = 0.13, p = ease(h.st / T); h.x = h.from + (h.to - h.from) * p; if (h.st > 0.015 && !reduce || h.st > 0.015) h.ghosts.push({ x: h.x, t: 0 });
      if (h.st >= T) { h.state = 'strike'; h.st = 0; h.x = h.to; slashStart(g, false); }
    } else if (h.state === 'strike') {
      strikeHits(g, false);
      if (h.st >= (g.weapon === 'dual' ? 0.3 : 0.24)) { h.state = 'return'; h.st = 0; h.from = h.x; }
    } else if (h.state === 'return') {
      const T = 0.17, p = ease(h.st / T); h.x = h.from + (h.home - h.from) * p; if (h.st >= T) { h.state = 'idle'; h.x = h.home; }
    } else if (h.state === 'shoot') {
      if (h.st >= 0.05 && !h.didHit[0]) { h.didHit[0] = 1; g.shots.push({ k: 'bolt', x: h.x + 120, y: GROUND - 120, vx: 1250, dmg: g.wp.dmg, c: g.wp.c1 }); g.fxs.push({ k: 'muzzle', x: h.x + 120, y: GROUND - 120, t: 0, d: 0.12, c: g.wp.c1 }); if (g.weapon === 'gun' && !reduce) h.x = h.home - 8; }
      if (h.st >= 0.2) { h.state = 'idle'; h.x = h.home; }
    } else if (h.state === 'dodge') {
      const T = 0.78, p = Math.min(1, h.st / T); h.y = -Math.pow(Math.sin(p * Math.PI), 0.6) * 190;
      if (h.fromX !== undefined && h.x !== h.home) h.x = h.fromX + (h.home - h.fromX) * ease(Math.min(1, h.st / 0.2));
      if (h.st >= T) { h.state = 'idle'; h.y = 0; h.x = h.home; h.fromX = undefined; if (h.buf > 0) { h.buf = 0; dodge(); } }
    } else if (h.state === 'hurt') {
      h.y = 0; if (h.st >= 0.4) { h.state = 'idle'; if (h.buf > 0) { h.buf = 0; dodge(); } }
    } else if (h.state === 'finisher') {
      const T = 0.16;
      if (h.st < T) { h.x = h.from + (h.to - h.from) * ease(h.st / T); h.ghosts.push({ x: h.x, t: 0 }); }
      else { h.x = h.to; if (!h.didHit[0] && h.st >= T + 0.04) { h.didHit[0] = 1; slashStart(g, true); finisherHit(); } if (h.st >= T + 0.55 && !g.over) { h.state = 'return'; h.st = 0; h.from = h.x; } }
    } else if (h.state === 'lose' || h.state === 'win') { /* นิ่งตามท่า */ }
    h.ghosts.forEach(o => o.t += dt); h.ghosts = h.ghosts.filter(o => o.t < 0.22);
    // ---- บอส ----
    b.st += dt;
    if (b.state === 'idle' && !b.shield && g.phase === 'play') {
      b.next -= dt;
      if (b.next <= 0) {
        const pool = ['shot', 'shot', 'double'].concat(b.seg >= 1 ? ['rush', 'high', 'high'] : []).concat(b.seg >= 2 ? ['quake', 'combo', 'combo', 'rush'] : []);
        let k = pool[Math.floor(Math.random() * pool.length)]; if (k === b.lastKind) k = pool[Math.floor(Math.random() * pool.length)];
        b.kind = k; b.lastKind = k; b.state = 'tele'; b.st = 0; audio('bossShot');
      }
    } else if (b.state === 'tele') {
      if (b.st >= (b.kind === 'rush' ? 1.05 : b.kind === 'combo' ? 1.1 : 0.95) - b.seg * 0.05) {
        b.state = 'atk'; b.st = 0;
        const plan = { shot: [[0, 'low']], double: [[0, 'low'], [0.95, 'low']], high: [[0, 'high']], quake: [[0, 'quake']], combo: [[0, 'low'], [0.7, 'high']] }[b.kind] || [];
        b.queue = plan.slice();
      }
    } else if (b.state === 'atk') {
      if (b.kind === 'rush') { const T = 0.3, p = b.st < T ? ease(b.st / T) : 1 - ease((b.st - T - 0.12) / 0.4); b.x = b.home + (h.home + 190 - b.home) * Math.max(0, Math.min(1, p)); if (b.st >= T + 0.12 + 0.4) { b.x = b.home; b.state = 'idle'; b.dodgedMsg = 0; b.next = rnd(1.2, 2) - b.seg * 0.2; } if (b.st > 0.1 && b.st < T + 0.16 && Math.abs(h.y || 0) < 90 && hitHero(g, b.x - 140, b.x + 70)) hurtHero(false); if (h.state === 'dodge' && Math.abs(h.y || 0) >= 90 && b.st > 0.2 && !b.dodgedMsg) { b.dodgedMsg = 1; g.nums.push({ x: h.x, y: GROUND - 300 + h.y, t: 0, txt: 'กระโดดพ้น!', c: '#7dffb0' }); } }
      else {
        while (b.queue && b.queue.length && b.st >= b.queue[0][0]) fireLane(g, b.queue.shift()[1]);
        if ((!b.queue || !b.queue.length) && b.st >= 0.45) { b.state = 'idle'; b.next = Math.max(1.0, rnd(1.6, 2.4) - b.seg * 0.25); }
      }
    } else if (b.state === 'dead') { /* นิ่ง */ }
    // ---- กระสุน ----
    g.shots.forEach(s => {
      s.x += s.vx * dt;
      if (s.k === 'bolt') { if (s.x >= b.x - 95 && !b.shield && b.state !== 'dead') { s.dead = true; damageBoss(s.dmg, b.x - 90, s.y, false); } else if (s.x >= b.x - 95 && b.shield) { s.dead = true; g.fxs.push({ k: 'ring', x: s.x, y: s.y, t: 0, d: 0.25, c: '#9de8ff' }); } }
      else if (s.k === 'bossshot') {
        /* อาวุธระยะประชิดที่กำลังพุ่งฟัน ฟันกระสุนแตกได้ (ไม่โดนตีเพราะกดโจมตีจังหวะเดียวกับที่บอสยิง) */
        if (s.lane !== 'quake' && ['dash', 'strike'].includes(h.state) && Math.abs(s.x - h.x) < 110) { s.dead = true; burst(s.x, s.y, 16, g.wp.c1, 420); g.nums.push({ x: h.x + 40, y: GROUND - 250, t: 0, txt: 'ฟันกระสุนแตก!', c: '#ffd23f' }); audio('impact'); }
        else if (s.lane === 'high') {
          /* กระสุนสูงโดนเฉพาะตอนตัวลอยอยู่ ยืนนิ่งจะผ่านเหนือหัว (อมตะจากการกระโดดไม่ช่วย เพราะกระโดดเข้าใส่เอง) */
          if (Math.abs(h.y || 0) >= 50 && Math.abs(s.x - h.x) < 70 && h.state !== 'hurt') { s.dead = true; hurtHero(true); }
          else if (!s.passed && s.x < h.x) { s.passed = true; g.nums.push({ x: h.x, y: GROUND - 300, t: 0, txt: 'ยืนนิ่งรอด!', c: '#7fd4ff' }); }
        }
        else if (hitHero(g, s.x - 26, s.x + 26) && Math.abs((h.y || 0)) < 60) { s.dead = true; hurtHero(false); }
        else if (h.state === 'dodge' && !s.passed && s.x < h.x) { s.passed = true; g.nums.push({ x: h.x, y: GROUND - 260 + h.y, t: 0, txt: s.lane === 'quake' ? 'กระโดดพ้นคลื่น!' : 'หลบสวย!', c: '#7dffb0' }); g.flash = Math.max(g.flash || 0, 0.08); audio('combo'); }
        if (s.x < -60) s.dead = true; }
      if (s.x > W + 80) s.dead = true;
    });
    g.shots = g.shots.filter(s => !s.dead);
    g.fxs.forEach(f => f.t += dt); g.fxs = g.fxs.filter(f => f.t < f.d);
    g.parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; }); g.parts = g.parts.filter(p => p.t < p.d);
    g.nums.forEach(n => n.t += dt); g.nums = g.nums.filter(n => n.t < 0.9);
    if (b.state === 'dead' && b.st > 0.01 && Math.random() < 0.3) burst(b.x + rnd(-60, 60), GROUND - rnd(40, 240), 4, '#ffd23f', 260);
  }
  /* ยิงกระสุนตามช่อง: low = กระสุนต่ำ (กระโดดหลบ) · high = กระสุนสูง (ยืนนิ่ง อย่ากระโดด) · quake = คลื่นพื้น (กระโดดหลบ เร็วกว่า) */
  function fireLane(g, lane) {
    const b = g.bossS, sp = 410 + b.seg * 55;
    const y = lane === 'high' ? GROUND - 250 : lane === 'quake' ? GROUND - 18 : GROUND - 62;
    g.shots.push({ k: 'bossshot', lane, x: b.x - 120, y, vx: -(lane === 'quake' ? sp * 1.25 : sp), c: lane === 'high' ? '#7fd4ff' : g.glow });
    g.fxs.push({ k: 'muzzle', x: b.x - 120, y, t: 0, d: 0.2, c: lane === 'high' ? '#7fd4ff' : g.glow });
    if (lane === 'quake') { g.shake = reduce ? 0 : 10; audio('impact'); } else audio('bossShot');
  }
  function hitHero(g, x1, x2) { const h = g.hero; if (h.inv > 0) return false; const hx = h.x; return hx + 55 > x1 && hx - 55 < x2; }
  function slashStart(g, power) {
    const h = g.hero, b = g.bossS;
    if (power) { slashFx(b.x - 80, GROUND - 170, 0, true); slashFx(b.x - 80, GROUND - 170, 1, true); audio('laser'); return; }
    const times = g.wp.hits;
    // เริ่มเอฟเฟกต์ฟัน: ฟันตามจังหวะ ฟันครั้งแรกทันที ฟันที่สองตามเวลา
    times.forEach((tm, i) => setTimeout(() => { if (!G || G !== g || g.over) return; slashFx(b.x - 90, GROUND - 150 + (i ? 20 : -10), i, false); audio('laser'); }, tm * 1000 * (reduce ? 0 : 1)));
  }
  function strikeHits(g, power) {
    const h = g.hero, b = g.bossS;
    while (h.hitsLeft.length && h.st >= h.hitsLeft[0]) { h.hitsLeft.shift(); if (b.shield) { g.fxs.push({ k: 'ring', x: b.x - 90, y: GROUND - 160, t: 0, d: 0.28, c: '#9de8ff' }); audio('shield'); continue; } damageBoss(g.wp.dmg, b.x - 95, GROUND - 160, false); }
  }

  /* ---------- วาด ---------- */
  function sprite(ctx, img, idx, cx, bottom, size, flip, alpha, tint) {
    if (!img) { ctx.save(); ctx.globalAlpha = alpha ?? 1; ctx.fillStyle = flip ? '#6b7a2a' : '#c2187a'; ctx.beginPath(); ctx.ellipse(cx, bottom - size * 0.35, size * 0.18, size * 0.33, 0, 0, 7); ctx.fill(); ctx.restore(); return; }
    const cell = img.width / 3, sx = (idx % 3) * cell, sy = Math.floor(idx / 3) * cell;
    ctx.save(); ctx.globalAlpha = alpha ?? 1; ctx.translate(cx, 0); if (flip) ctx.scale(-1, 1);
    if (tint) { // ย้อมสีเฉพาะพิกเซลของตัวละคร (ผ่านแคนวาสชั่วคราว)
      const t = tintCv(size); const tc = t.getContext('2d'); tc.clearRect(0, 0, size, size); tc.globalCompositeOperation = 'source-over';
      tc.drawImage(img, sx, sy, cell, cell, 0, 0, size, size); tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = tint; tc.fillRect(0, 0, size, size);
      ctx.drawImage(t, -size / 2, bottom - size * (480 / 512), size, size);
    } else ctx.drawImage(img, sx, sy, cell, cell, -size / 2, bottom - size * (480 / 512), size, size);
    ctx.restore();
  }
  let _tcv = null;
  function tintCv(size) { if (!_tcv) _tcv = document.createElement('canvas'); if (_tcv.width !== size) { _tcv.width = size; _tcv.height = size; } return _tcv; }
  function heroFrame(g) {
    const h = g.hero;
    switch (h.state) {
      case 'dash': return 3; case 'strike': return g.weapon === 'dual' && h.st > 0.12 ? 7 : 4; case 'return': return 1; case 'shoot': return 4;
      case 'dodge': return 2; case 'hurt': return 5; case 'finisher': return h.st < 0.16 ? 7 : 6; case 'lose': return 8; case 'win': return 7;
      default: return (Math.floor(g.t * 2.2) % 2) ? 0 : 0;
    }
  }
  function draw(g, dt) {
    const ctx = g.ctx, h = g.hero, b = g.bossS;
    ctx.save(); ctx.clearRect(0, 0, W, H);
    if (g.shake > 0) ctx.translate(rnd(-g.shake, g.shake) * 0.5, rnd(-g.shake, g.shake) * 0.35);
    // ฉาก
    if (g.img.bg) ctx.drawImage(g.img.bg, 0, 0, W, H); else { const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#12354a'); gr.addColorStop(1, '#06181c'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(6,24,28,.22)'; ctx.fillRect(0, 0, W, H);
    ambient(ctx, g);
    // เงา
    shadow(ctx, h.x, GROUND + 4, 90 - Math.min(40, Math.abs(h.y) * 0.3)); shadow(ctx, b.x, GROUND + 4, 120);
    // เส้นเตือนการโจมตีของบอส
    if (b.state === 'tele') warn(ctx, g);
    // ภาพต่อเนื่องตอนพุ่ง
    h.ghosts.forEach(o => sprite(ctx, g.img.hero, 4, o.x, GROUND + 12, 320, false, 0.42 * (1 - o.t / 0.22), g.wp.c1));
    // บอส
    let bf = 3; if (b.state === 'dead') bf = 8; else if (b.hurt > 0) bf = 5; else if (b.state === 'tele') bf = 4; else if (b.state === 'atk') bf = b.kind === 'rush' ? 7 : 6; else bf = Math.floor(g.t * 1.2) % 2 ? 1 : 3;
    const bAlpha = b.state === 'dead' ? Math.max(0, 1 - b.st / 1.5) : 1, bob = b.state === 'idle' ? Math.sin(g.t * 2.4) * 4 : 0;
    sprite(ctx, g.img.boss, bf, b.x + (b.shake ? rnd(-b.shake, b.shake) : 0), GROUND + 12 + bob, 380, true, bAlpha, b.hurt > 0 ? 'rgba(255,255,255,.55)' : null);
    if (b.shield) shieldFx(ctx, b, g);
    // ผู้เล่น
    const flick = h.inv > 0 && h.state !== 'dodge' && Math.floor(g.t * 18) % 2 === 0 && h.state !== 'lose';
    sprite(ctx, g.img.hero, heroFrame(g), h.x, GROUND + 12 + h.y, 320, false, flick ? 0.4 : 1);
    if (h.state === 'dodge' && h.st < 0.3) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(h.x, GROUND - 110 + h.y, 100, 0, 7); ctx.stroke(); ctx.restore(); }
    // เส้นความเร็วตอนพุ่ง
    if (h.state === 'dash' || (h.state === 'finisher' && h.st < 0.18)) speedLines(ctx, h, g);
    // กระสุน
    g.shots.forEach(s => drawShot(ctx, s, g));
    // เอฟเฟกต์
    g.fxs.forEach(f => drawFx(ctx, f, g));
    g.parts.forEach(p => { ctx.globalAlpha = Math.max(0, 1 - p.t / p.d); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
    // ตัวเลขดาเมจ
    g.nums.forEach(n => { const a = 1 - n.t / 0.9, y = n.y - n.t * 70; ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); ctx.font = (n.big ? '900 54px' : '900 40px') + ' Kanit, Tahoma, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 8; ctx.strokeStyle = '#0b1d1f'; ctx.strokeText(n.txt, n.x, y); ctx.fillStyle = n.c; ctx.fillText(n.txt, n.x, y); ctx.restore(); });
    ctx.restore();
    if (g.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.85, g.flash * 1.6) + ')'; ctx.fillRect(0, 0, W, H); }
    // ขอบมืด
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // ผู้เล่นพร้อมโจมตี (ไอคอนคูลดาวน์)
    if (h.cd > 0 && g.phase === 'play') { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(h.home - 50, GROUND + 22, 100 * (1 - h.cd / g.wp.cd), 6); }
  }
  function shadow(ctx, x, y, w) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y, w, 16, 0, 0, 7); ctx.fill(); ctx.restore(); }
  function ambient(ctx, g) {
    const n = 22; ctx.save(); ctx.fillStyle = g.glow;
    for (let i = 0; i < n; i++) { const x = (i * 97 + g.t * (14 + (i % 5) * 6)) % W, y = ((i * 61 + g.t * (9 + (i % 4) * 5) * (g.clim === 'fire' ? -1 : 1)) % H + H) % H; ctx.globalAlpha = 0.18 + (i % 4) * 0.07; ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 3), 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function warn(ctx, g) {
    const h = g.hero, b = g.bossS, p = Math.min(1, b.st / 0.7), a = 0.25 + 0.25 * Math.sin(g.t * 30);
    ctx.save();
    const low = ['shot', 'double', 'combo'].includes(b.kind), high = ['high', 'combo'].includes(b.kind);
    if (low) { ctx.fillStyle = `rgba(255,70,70,${a})`; ctx.fillRect(0, GROUND - 100, b.x - 110, 70); }
    if (high) { ctx.fillStyle = `rgba(80,180,255,${a})`; ctx.fillRect(0, GROUND - 290, b.x - 110, 70); }
    if (b.kind === 'quake') { ctx.fillStyle = `rgba(255,170,40,${a + 0.1})`; ctx.fillRect(0, GROUND - 30, b.x - 60, 34); }
    if (b.kind === 'rush') { ctx.fillStyle = `rgba(255,70,70,${a})`; ctx.fillRect(h.home - 70, GROUND - 6, 300, 22); }
    const tip = { shot: 'กระโดด!', double: 'กระโดด 2 ครั้ง!', high: 'อย่ากระโดด!', quake: 'คลื่นพื้น! กระโดด', combo: 'กระโดด แล้วยืนนิ่ง!', rush: 'พุ่งชน! กระโดด' }[b.kind];
    if (tip) { ctx.font = '900 30px Kanit, Tahoma, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 7; ctx.strokeStyle = '#0b1d1f'; ctx.strokeText(tip, h.home + 40, GROUND - 330); ctx.fillStyle = high && !low ? '#9fe0ff' : '#ffe066'; ctx.fillText(tip, h.home + 40, GROUND - 330); }
    ctx.font = '900 64px Kanit, Tahoma, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 9; ctx.strokeStyle = '#0b1d1f'; const y = GROUND - 260 + Math.sin(g.t * 24) * 4;
    ctx.strokeText('!', h.home, y); ctx.fillStyle = '#ff4d4d'; ctx.fillText('!', h.home, y);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 + p * 0.5) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x - 20, GROUND - 170, 40 + (1 - p) * 70, 0, 7); ctx.stroke();
    ctx.restore();
  }
  function shieldFx(ctx, b, g) {
    ctx.save(); ctx.translate(b.x - 10, GROUND - 160); const pulse = 1 + Math.sin(g.t * 5) * 0.04;
    const gr = ctx.createRadialGradient(0, 0, 70, 0, 0, 200 * pulse); gr.addColorStop(0, 'rgba(120,230,255,.0)'); gr.addColorStop(0.75, 'rgba(120,230,255,.18)'); gr.addColorStop(1, 'rgba(190,250,255,.65)');
    ctx.fillStyle = gr; ctx.strokeStyle = 'rgba(210,252,255,.9)'; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + g.t * 0.3; const x = Math.cos(a) * 200 * pulse, y = Math.sin(a) * 200 * pulse; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function speedLines(ctx, h, g) {
    ctx.save(); ctx.strokeStyle = g.wp.c2; ctx.lineWidth = 3; ctx.globalAlpha = 0.6;
    for (let i = 0; i < 9; i++) { const y = GROUND - 40 - i * 24 + rnd(-6, 6), x = h.x - 60 - rnd(0, 100); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - rnd(60, 140), y); ctx.stroke(); }
    ctx.restore();
  }
  function drawShot(ctx, s, g) {
    ctx.save(); ctx.translate(s.x, s.y);
    if (s.lane === 'quake') { ctx.fillStyle = s.c; ctx.strokeStyle = '#0b1d1f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-70, 18); for (let i = 0; i <= 7; i++) ctx.lineTo(-70 + i * 20, i % 2 ? -34 - Math.sin(g.t * 30 + i) * 8 : 6); ctx.lineTo(80, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); return; }
    if (s.k === 'bolt') { const gr = ctx.createLinearGradient(-90, 0, 14, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, s.c); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-90, -4); ctx.lineTo(10, -9); ctx.lineTo(24, 0); ctx.lineTo(10, 9); ctx.lineTo(-90, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6, 0, 7, 0, 7); ctx.fill(); }
    else {
      const fx = g.img.fx, idx = CLIM_IDX[g.clim] || 0; ctx.rotate(g.t * -9);
      if (fx) { const cw = fx.width / 3, ch = fx.height / 2; ctx.drawImage(fx, (idx % 3) * cw, Math.floor(idx / 3) * ch, cw, ch, -62, -62, 124, 124); }
      else { ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(0, 0, 36, 0, 7); ctx.fill(); }
      ctx.rotate(g.t * 9); ctx.strokeStyle = s.c; ctx.lineWidth = 4; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(0, 0, 50 + Math.sin(g.t * 20) * 5, 0, 7); ctx.stroke();
    }
    ctx.restore();
  }
  function drawFx(ctx, f, g) {
    const p = f.t / f.d, a = 1 - p; ctx.save(); ctx.translate(f.x, f.y);
    if (f.k === 'slash') {
      const dir = f.a % 2 ? 1 : -1, R = f.big ? 190 : 140, sweep = ease(Math.min(1, p * 1.8));
      ctx.rotate(dir * (f.big ? 0.5 : 0.3) + (f.big && f.a ? 1.1 : 0)); ctx.globalAlpha = a;
      for (let k = 3; k >= 0; k--) { ctx.strokeStyle = k === 0 ? f.c2 : f.c1; ctx.lineWidth = (k === 0 ? 10 : 18 + k * 8) * (1 - p * 0.5); ctx.globalAlpha = a * (k === 0 ? 1 : 0.22); ctx.shadowColor = f.c1; ctx.shadowBlur = k ? 22 : 8; ctx.beginPath(); ctx.arc(-R * 0.35, 0, R, -1.15 + (1 - sweep) * 0.9, -1.15 + sweep * 2.3 + 0.2); ctx.stroke(); }
    } else if (f.k === 'ring') {
      ctx.globalAlpha = a; ctx.strokeStyle = f.c; ctx.lineWidth = 6 * a + 1; ctx.shadowColor = f.c; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(0, 0, (f.big ? 240 : 100) * ease(p), 0, 7); ctx.stroke();
    } else if (f.k === 'star') {
      ctx.globalAlpha = a; ctx.rotate(p * 0.7); ctx.fillStyle = f.c; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; const s = (f.s || 100) * ease(p) * 0.5 + 12; ctx.beginPath(); for (let i = 0; i < 16; i++) { const r = i % 2 ? s * 0.38 : s, an = Math.PI / 8 * i; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill();
    } else if (f.k === 'cross') {
      ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.shadowColor = f.c; ctx.shadowBlur = 30; ctx.lineWidth = 14 * a + 3; const L = 260 * ease(Math.min(1, p * 2.2)); ctx.beginPath(); ctx.moveTo(-L, -L * 0.6); ctx.lineTo(L, L * 0.6); ctx.moveTo(-L, L * 0.6); ctx.lineTo(L, -L * 0.6); ctx.stroke();
    } else if (f.k === 'muzzle') {
      ctx.globalAlpha = a; ctx.fillStyle = f.c; ctx.shadowColor = f.c; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(0, 0, 26 * (1 - p) + 6, 0, 7); ctx.fill();
    } else if (f.k === 'bshot') {
      ctx.globalAlpha = a; ctx.strokeStyle = g.glow; ctx.lineWidth = 12 * a; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo((f.tx - f.x) * ease(p * 2), -60 * Math.sin(p * 3)); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- เหตุการณ์ ---------- */
  document.addEventListener('click', e => {
    let b;
    if ((b = e.target.closest('[data-bgs]'))) { const host = $('#bgame'); if (!host) return; if (b.dataset.bgs === 'start' || b.dataset.bgs === 'again') start(host._chapter); return; }
    if ((b = e.target.closest('[data-bgw]'))) { window.DTPractice.setWeapon(b.dataset.bgw); const host = $('#bgame'); if (host && host._chapter) intro(host._chapter); return; }
    if ((b = e.target.closest('[data-bgq]'))) { answer(Number(b.dataset.bgq)); return; }
    if (e.target.closest('[data-bgq-next]')) afterAnswer();
  });
  window.addEventListener('hashchange', () => { if (G && !document.getElementById('bg-canvas')) stop(); });

  window.DTBoss = { view, stop, _g: () => G };
})();
