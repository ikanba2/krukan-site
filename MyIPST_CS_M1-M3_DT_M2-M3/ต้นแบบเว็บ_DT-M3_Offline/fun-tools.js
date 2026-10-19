/* เครื่องมือครู: สุ่มชื่อแบบลุ้น และจัดทีม (18 ต.ค. 2569)
   - สุ่มชื่อ: วงล้อรายชื่อหมุนแล้วค่อย ๆ ช้าลง มีเสียงติ๊กและแตรตอนเปิดชื่อ พลุกระดาษ และมาสไรเดอร์เทคโนเป็นพิธีกร
   - จัดทีม: สับไพ่รายชื่อ แล้วส่งเข้าทีมทีละใบ ทีมมีชื่อ สี และไอคอน สุ่มหัวหน้าทีมได้
   ใช้รายชื่อนักเรียนในระบบ (DTApp.db.profiles) ถ้ายังไม่มีรายชื่อ ลองด้วยรายชื่อตัวอย่างที่แต่งขึ้นได้ */
(function () {
  'use strict';
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const DEMO = ['ต้นกล้า', 'มะปราง', 'น้องฟ้า', 'บีม', 'ข้าวหอม', 'ภูผา', 'ใบเตย', 'กันต์', 'พลอย', 'ธาม', 'น้ำใส', 'ปลื้ม', 'ฟ้าใส', 'ตะวัน', 'มีนา', 'โอบอุ้ม', 'ขวัญ', 'ภีม', 'แพรวา', 'ณดล', 'ไอซ์', 'ปุยฝ้าย', 'เมฆ', 'จิณณ์'].map((n, i) => ({ id: 'demo' + i, number: String(i + 1), name: n }));
  const TEAMS = [['⚡', 'ทีมสายฟ้า', '#facc15'], ['🔥', 'ทีมเปลวไฟ', '#fb923c'], ['🌊', 'ทีมคลื่นยักษ์', '#38bdf8'], ['🌪️', 'ทีมพายุ', '#a78bfa'], ['🌿', 'ทีมพฤกษา', '#4ade80'], ['💎', 'ทีมผลึก', '#22d3ee'], ['🌙', 'ทีมจันทรา', '#c4b5fd'], ['☀️', 'ทีมสุริยะ', '#fbbf24'], ['❄️', 'ทีมน้ำแข็ง', '#93c5fd'], ['🪐', 'ทีมดวงดาว', '#f472b6']];
  const SAY_SPIN = ['ใครจะเป็นผู้ถูกเลือก…', 'ลุ้นกันหน่อย!', 'วงล้อแห่งโชคชะตาหมุนแล้ว!', 'หายใจลึก ๆ…'];
  const SAY_WIN = n => [`ยินดีด้วย ${n}! ออกมาเลย!`, `${n} ถูกเลือกแล้ว! พร้อมไหม?`, `เป็น ${n} นั่นเอง! เยี่ยม!`][rnd(3)];
  const st = { used: [], demo: false, busy: false, sound: true };
  try { st.sound = localStorage.getItem('krukan-fx-sound') !== '0'; } catch (e) { /* ใช้ค่าเริ่ม */ }

  /* ---------- รายชื่อ ---------- */
  const app = () => window.DTApp;
  const label = p => (/^เลขที่/.test(p.name) || !p.name) ? 'เลขที่ ' + p.number : p.name;
  function people() {
    if (st.demo) return DEMO;
    const cl = $('#fx-class') ? $('#fx-class').value : '*', yr = $('#fx-year') ? $('#fx-year').value : '*';
    return Object.values(app().db.profiles).filter(p => p.id !== 'guest' && (cl === '*' || p.classroom === cl) && (yr === '*' || p.year === yr));
  }

  /* ---------- เสียง ---------- */
  let ac = null;
  function tone(f, ms = 70, type = 'triangle', vol = 0.05, at = 0) {
    if (!st.sound) return;
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at; o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + ms / 1000 + 0.03); } catch (e) { /* ไม่มีเสียง */ }
  }
  const fanfare = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 520 : 160, 'square', 0.04, i * 0.13));

  /* ---------- พลุกระดาษ ---------- */
  function confetti(host) {
    const cv = document.createElement('canvas'); cv.className = 'fx-confetti'; host.appendChild(cv);
    const r = host.getBoundingClientRect(); cv.width = r.width; cv.height = r.height; const x = cv.getContext('2d');
    const C = ['#ff2e88', '#ffd400', '#00cdb8', '#7c4dff', '#ffffff', '#fb923c'];
    const ps = Array.from({ length: 170 }, () => ({ x: r.width / 2 + (Math.random() - .5) * 120, y: r.height * .45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, s: 5 + Math.random() * 7, c: C[rnd(C.length)], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
    let f = 0; (function step() { x.clearRect(0, 0, cv.width, cv.height); ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (++f < 170 && cv.isConnected) requestAnimationFrame(step); else cv.remove(); })();
  }
  const say = (id, t) => { const b = document.getElementById(id); if (b) { b.textContent = t; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } };

  /* ---------- หน้าเครื่องมือ ---------- */
  function view(students) {
    const cls = [...new Set(students.map(p => p.classroom))], yrs = [...new Set(students.map(p => p.year))];
    return `<section class="paper fx-filter"><h3>รายชื่อที่ใช้</h3><div class="field-grid three"><label>ห้อง<select id="fx-class" data-fx="filter"><option value="*">ทุกห้อง</option>${cls.map(x => `<option>${esc(x)}</option>`).join('')}</select></label><label>ปีการศึกษา<select id="fx-year" data-fx="filter"><option value="*">ทุกปี</option>${yrs.map(x => `<option>${esc(x)}</option>`).join('')}</select></label><label class="check-row fx-demo"><input type="checkbox" id="fx-demo" data-fx="demo" ${st.demo ? 'checked' : ''}><span>ลองด้วยรายชื่อตัวอย่าง (24 คน)</span></label></div><p class="inline-note" id="fx-count"></p></section>
    <section class="fx-stage" id="fx-raffle">
      <div class="fx-rays" aria-hidden="true"></div><div class="fx-stars" aria-hidden="true"></div>
      <div class="fx-top"><span class="fx-badge">🎲 TECHNO LUCKY DRAW</span><div class="fx-top-r"><button type="button" class="fx-mini" data-fx="sound">${st.sound ? '🔊 เสียงเปิด' : '🔇 เสียงปิด'}</button><button type="button" class="fx-mini" data-fx="fs" data-target="fx-raffle">⛶ เต็มจอ</button></div></div>
      <div class="fx-main">
        <div class="fx-host"><img src="assets/techno-sword.webp" alt="มาสไรเดอร์เทคโน" class="fx-techno" id="fx-techno-r"><div class="fx-bubble" id="fx-say-r">พร้อมสุ่มแล้ว! กดปุ่มด้านล่างได้เลย</div></div>
        <div class="fx-reel-box"><div class="fx-reel" id="fx-reel"><div class="fx-strip" id="fx-strip"><div class="fx-name idle">?</div></div></div><div class="fx-frame" aria-hidden="true"></div></div>
      </div>
      <div class="fx-ctrl"><label>สุ่มครั้งละ<select id="fx-n">${[1, 2, 3, 5].map(n => `<option value="${n}">${n} คน</option>`).join('')}</select></label><label class="fx-chk"><input type="checkbox" id="fx-norep" checked> ไม่ซ้ำคนเดิมในรอบนี้</label>
        <button type="button" class="fx-go" data-fx="spin">🎲 สุ่มเลย!</button><button type="button" class="fx-mini" data-fx="reset">↺ เริ่มรอบใหม่</button></div>
      <div class="fx-winners" id="fx-winners" aria-live="polite"></div>
      <div class="fx-hist" id="fx-hist"></div>
    </section>
    <section class="fx-stage teams" id="fx-groups">
      <div class="fx-rays" aria-hidden="true"></div>
      <div class="fx-top"><span class="fx-badge">⚔️ SQUAD FORMATION</span><div class="fx-top-r"><button type="button" class="fx-mini" data-fx="fs" data-target="fx-groups">⛶ เต็มจอ</button></div></div>
      <div class="fx-main g">
        <div class="fx-host"><img src="assets/techno-sword.webp" alt="มาสไรเดอร์เทคโน" class="fx-techno" id="fx-techno-g"><div class="fx-bubble" id="fx-say-g">ตั้งจำนวนทีม แล้วให้เทคโนจัดทีมให้!</div></div>
        <div class="fx-deck" id="fx-deck" aria-hidden="true">${'<i></i>'.repeat(5)}</div>
      </div>
      <div class="fx-ctrl"><label>จัดแบบ<select id="fx-mode"><option value="g">กำหนดจำนวนทีม</option><option value="s">กำหนดคนต่อทีม</option></select></label><label>จำนวน<input id="fx-gn" type="number" min="1" max="20" value="4"></label><label class="fx-chk"><input type="checkbox" id="fx-lead" checked> สุ่มหัวหน้าทีม ⭐</label>
        <button type="button" class="fx-go" data-fx="teams">⚡ จัดทีม!</button></div>
      <div class="fx-teams" id="fx-teams"></div>
      <div class="fx-after" id="fx-after" hidden><button type="button" class="fx-mini" data-fx="copy">📋 คัดลอกรายชื่อ</button><button type="button" class="fx-mini" data-fx="print">🖨️ พิมพ์</button></div>
    </section>`;
  }
  function refreshCount() { const n = people().length, el = $('#fx-count'); if (el) el.textContent = n ? `ใช้รายชื่อ ${n} คน${st.demo ? ' (รายชื่อตัวอย่าง)' : ''}` : 'ยังไม่มีรายชื่อในห้องและปีที่เลือก เพิ่มรายชื่อได้ที่เมนู "นักเรียน" หรือติ๊กลองด้วยรายชื่อตัวอย่าง'; }

  /* ---------- สุ่มชื่อ ---------- */
  function spin() {
    if (st.busy) return;
    const all = people(); if (!all.length) { app().notify('ยังไม่มีรายชื่อ ติ๊ก "ลองด้วยรายชื่อตัวอย่าง" หรือเพิ่มรายชื่อก่อน'); return; }
    const norep = $('#fx-norep').checked, pool = norep ? all.filter(p => !st.used.includes(p.id)) : all;
    if (!pool.length) { say('fx-say-r', 'ทุกคนถูกสุ่มครบแล้ว! กด "เริ่มรอบใหม่" ได้เลย'); return; }
    const k = Math.min(+$('#fx-n').value || 1, pool.length), win = shuffle(pool).slice(0, k);
    st.busy = true; const stage = $('#fx-raffle'); stage.classList.add('spinning'); $('#fx-winners').innerHTML = '';
    stage.scrollIntoView({ block: 'center', behavior: 'smooth' });
    say('fx-say-r', SAY_SPIN[rnd(SAY_SPIN.length)]);
    const strip = $('#fx-strip'), N = 44;
    const names = Array.from({ length: N }, (_, i) => i === N - 2 ? win[0] : all[rnd(all.length)]);
    strip.innerHTML = names.map(p => `<div class="fx-name">${esc(label(p))}<small>${esc(p.number && !/^เลขที่/.test(label(p)) ? 'เลขที่ ' + p.number : '')}</small></div>`).join('');
    strip.style.transition = 'none'; strip.style.transform = 'translateY(0)'; const H = strip.firstElementChild.getBoundingClientRect().height;
    const target = (N - 2) * H, dur = 4300, t0 = performance.now(); let last = -1, done = false;
    /* ตัวสำรอง: ถ้าแท็บถูกซ่อนจนแอนิเมชันหยุด ก็ยังหยุดที่ชื่อผู้ชนะและประกาศผลตรงเวลา */
    const finish = () => { if (done) return; done = true; if (!strip.isConnected) { st.busy = false; return; } strip.style.transform = `translateY(${-target}px)`; reveal(win); };
    setTimeout(finish, dur + 200);
    (function frame(t) {
      if (done) return;
      if (!strip.isConnected) { done = true; st.busy = false; return; }
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4), y = e * target; strip.style.transform = `translateY(${-y}px)`;
      const idx = Math.floor(y / H + .5); if (idx !== last) { last = idx; tone(300 + Math.min(900, idx * 18), 40, 'square', 0.03); }
      if (p < 1) requestAnimationFrame(frame); else finish();
    })(t0);
  }
  function reveal(win) {
    const stage = $('#fx-raffle'); stage.classList.remove('spinning'); stage.classList.add('won'); setTimeout(() => stage.classList.remove('won'), 1400);
    win.forEach(p => st.used.push(p.id)); fanfare(); confetti(stage);
    say('fx-say-r', SAY_WIN(label(win[0])) + (win.length > 1 ? ` และอีก ${win.length - 1} คน!` : ''));
    const box = $('#fx-winners'); box.innerHTML = win.map((p, i) => `<div class="fx-win" style="animation-delay:${i * .35}s"><span>${i === 0 ? '🏆' : '⭐'}</span><b>${esc(label(p))}</b><small>${esc(p.number && !/^เลขที่/.test(label(p)) ? 'เลขที่ ' + p.number : '')}</small></div>`).join('');
    win.slice(1).forEach((_, i) => tone(880, 200, 'triangle', 0.05, .35 * (i + 1)));
    showOverlay(win);
    const all = people(); $('#fx-hist').innerHTML = `<b>ถูกสุ่มแล้ว ${new Set(st.used).size}/${all.length} คน:</b> ` + st.used.map(id => { const p = all.find(x => x.id === id); return p ? `<span>${esc(label(p))}</span>` : ''; }).join('');
    st.busy = false;
  }

  /* ประกาศผลกลางจอ: ชั้นทับเต็มหน้าจอ กดตรงไหนก็ปิด (ปิดเองใน 8 วินาที) */
  function showOverlay(win) {
    const old = document.getElementById('fx-ov'); if (old) old.remove();
    const host = document.fullscreenElement || document.body, ov = document.createElement('div'); ov.id = 'fx-ov'; ov.className = 'fx-ov';
    ov.innerHTML = `<div class="fx-ov-rays"></div><div class="fx-ov-box"><img src="assets/techno-sword.webp" alt="" class="fx-ov-techno"><div class="fx-ov-say">${esc(SAY_WIN(label(win[0])))}</div><div class="fx-ov-names">${win.map((p, i) => `<div class="fx-win" style="animation-delay:${i * .3}s"><span>${i === 0 ? '🏆' : '⭐'}</span><b>${esc(label(p))}</b><small>${esc(p.number && !/^เลขที่/.test(label(p)) ? 'เลขที่ ' + p.number : '')}</small></div>`).join('')}</div><small class="fx-ov-close">แตะที่ใดก็ได้เพื่อปิด</small></div>`;
    host.appendChild(ov); confetti(ov);
    const close = () => { ov.classList.add('out'); setTimeout(() => ov.remove(), 250); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    ov.addEventListener('click', close); document.addEventListener('keydown', onKey); setTimeout(() => { if (ov.isConnected) close(); }, 8000);
  }
  /* ---------- จัดทีม ---------- */
  function teams() {
    if (st.busy) return;
    const all = people(), mode = $('#fx-mode').value, v = +$('#fx-gn').value;
    if (!all.length) { app().notify('ยังไม่มีรายชื่อ ติ๊ก "ลองด้วยรายชื่อตัวอย่าง" หรือเพิ่มรายชื่อก่อน'); return; }
    if (!Number.isInteger(v) || v < 1) { app().notify('ใส่จำนวนเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป'); return; }
    const n = Math.max(1, Math.min(all.length, mode === 'g' ? v : Math.ceil(all.length / v)));
    const mix = shuffle(all), G = Array.from({ length: n }, () => []); mix.forEach((p, i) => G[i % n].push(p));
    const lead = $('#fx-lead').checked ? G.map(g => rnd(g.length)) : G.map(() => -1);
    st.busy = true; st.lastTeams = G.map((g, i) => ({ t: TEAMS[i % TEAMS.length], no: i + 1, g, lead: lead[i] }));
    $('#fx-groups').scrollIntoView({ block: 'start', behavior: 'smooth' });
    const out = $('#fx-teams'); $('#fx-after').hidden = true;
    out.innerHTML = st.lastTeams.map((T, i) => `<div class="fx-team" style="--tc:${T.t[2]};animation-delay:${i * .08}s"><div class="fx-team-h"><span>${T.t[0]}</span><b>${T.t[1]}${i >= TEAMS.length ? ' ' + (Math.floor(i / TEAMS.length) + 1) : ''}</b><em>${T.g.length} คน</em></div><ol class="fx-team-b" id="fx-t${i}"></ol></div>`).join('');
    const deck = $('#fx-deck'); deck.classList.add('shuffling'); say('fx-say-g', 'กำลังสับไพ่ผสมทีม…'); for (let i = 0; i < 8; i++) tone(200 + rnd(200), 50, 'sawtooth', 0.02, i * 0.09);
    setTimeout(() => {
      deck.classList.remove('shuffling'); say('fx-say-g', 'ส่งนักรบเข้าทีม!');
      if (innerWidth < 760) out.scrollIntoView({ block: 'start', behavior: 'smooth' }); /* จอแนวตั้ง: ผลทีมอยู่ใต้ปุ่ม เลื่อนลงไปให้เห็นทันที */
      const order = []; const mx = Math.max(...G.map(g => g.length)); for (let r = 0; r < mx; r++) G.forEach((g, i) => { if (g[r]) order.push([i, r]); });
      const gap = Math.max(45, Math.min(160, 3200 / order.length));
      order.forEach(([i, r], k) => setTimeout(() => {
        const ol = document.getElementById('fx-t' + i); if (!ol) return; const T = st.lastTeams[i], p = T.g[r];
        ol.insertAdjacentHTML('beforeend', `<li class="fx-member ${r === T.lead ? 'lead' : ''}">${r === T.lead ? '⭐ ' : ''}${esc(label(p))}${p.number && !/^เลขที่/.test(label(p)) ? `<small>${esc(p.number)}</small>` : ''}</li>`);
        tone(520 + i * 40, 50, 'triangle', 0.035);
        if (k === order.length - 1) { st.busy = false; fanfare(); confetti($('#fx-groups')); say('fx-say-g', `ได้ ${n} ทีมแล้ว! ลุยกันเลย!`); $('#fx-after').hidden = false; }
      }, k * gap));
    }, 1300);
  }
  function teamsText() { return (st.lastTeams || []).map(T => `${T.t[1]} (${T.g.length} คน)\n` + T.g.map((p, r) => `  ${r === T.lead ? '⭐ ' : '- '}${label(p)}${p.number ? ' (เลขที่ ' + p.number + ')' : ''}`).join('\n')).join('\n\n'); }

  /* ---------- เหตุการณ์ ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-fx]'); if (!b || b.tagName === 'SELECT' || b.tagName === 'INPUT') return;
    const k = b.dataset.fx;
    if (k === 'spin') spin();
    if (k === 'reset') { st.used = []; $('#fx-winners').innerHTML = ''; $('#fx-hist').innerHTML = ''; $('#fx-strip').innerHTML = '<div class="fx-name idle">?</div>'; $('#fx-strip').style.transform = 'none'; say('fx-say-r', 'เริ่มรอบใหม่แล้ว ทุกคนมีสิทธิ์ลุ้นอีกครั้ง!'); }
    if (k === 'teams') teams();
    if (k === 'sound') { st.sound = !st.sound; try { localStorage.setItem('krukan-fx-sound', st.sound ? '1' : '0'); } catch (er) { /* ไม่บันทึก */ } b.textContent = st.sound ? '🔊 เสียงเปิด' : '🔇 เสียงปิด'; }
    if (k === 'fs') { const t = document.getElementById(b.dataset.target); if (!t) return; if (document.fullscreenElement) document.exitFullscreen(); else (t.requestFullscreen || t.webkitRequestFullscreen || (() => app().notify('เบราว์เซอร์นี้ไม่รองรับเต็มจอ'))).call(t); }
    if (k === 'copy') { const t = teamsText(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => app().notify('คัดลอกรายชื่อทีมแล้ว')).catch(() => app().notify('คัดลอกไม่ได้ ลองกดพิมพ์แทน')); }
    if (k === 'print') { const w = window.open('', '_blank'); if (!w) { app().notify('เบราว์เซอร์บล็อกหน้าต่างพิมพ์'); return; } w.document.write(`<!doctype html><meta charset="utf-8"><title>รายชื่อทีม</title><style>body{font-family:Sarabun,Tahoma,sans-serif;margin:16mm}h2{margin:0 0 4px}.t{break-inside:avoid;border:1.5px solid #111;border-radius:6px;padding:8px 12px;margin:0 0 10px}</style><h1>รายชื่อทีม</h1>${(st.lastTeams || []).map(T => `<div class="t"><h2>${T.t[0]} ${esc(T.t[1])} · ${T.g.length} คน</h2>${T.g.map((p, r) => `<div>${r === T.lead ? '⭐ หัวหน้าทีม · ' : ''}${esc(label(p))}${p.number ? ' (เลขที่ ' + esc(p.number) + ')' : ''}</div>`).join('')}</div>`).join('')}`); w.document.close(); w.print(); }
  });
  document.addEventListener('change', e => {
    const t = e.target; if (!t.dataset || !t.dataset.fx) return;
    if (t.dataset.fx === 'demo') { st.demo = t.checked; st.used = []; }
    refreshCount();
  });
  new MutationObserver(() => { if ($('#fx-count') && !$('#fx-count').dataset.ok) { $('#fx-count').dataset.ok = '1'; refreshCount(); } }).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });

  window.DTFun = { view };
})();
