/* ด่านฝึก (ตรวจอัตโนมัติ) + ลานบอสแบบตอบคำถาม — ไม่ต้องให้ครูตรวจ
   ชนิดข้อ: choice · pick · sort (ลาก/แตะจัดหมวด) · match (โยงเส้น) · order (ลาก/กดเรียง) */
(function () {
  'use strict';
  const D = window.DT_DATA, P = window.DT_PRACTICE;
  const KEY = window.DT_CFG.key + '-practice-v1', ACTIVE = window.DT_CFG.key + '-offline-v1-active', DB = window.DT_CFG.key + '-offline-v1';
  const PASS = 70;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let store = {}; try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* โหมดไม่บันทึก */ } };
  const uid = () => { try { return sessionStorage.getItem(ACTIVE) || 'guest'; } catch (e) { return 'guest'; } };
  const rec = n => { const u = store[uid()] || (store[uid()] = {}); return u[n] || (u[n] = { best: 0, tries: 0, last: 0, battle: 0 }); };
  const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const chapterOf = n => D.course.chapters[n - 1];
  const stars = pct => pct >= 90 ? 3 : pct >= PASS ? 2 : pct >= 40 ? 1 : 0;
  const starRow = k => [1, 2, 3].map(i => `<span class="st ${i <= k ? 'on' : ''}" aria-hidden="true"></span>`).join('');
  const xpOf = n => { const r = rec(n); return Math.round(r.best) + (r.battle ? 50 : 0); };

  /* ---------- ด่านฝึก ---------- */
  let S = null; // {n, i, scores[], phase, cur, checked}
  const tl = { choice: 'เลือกคำตอบ', pick: 'วงทุกข้อที่ถูก', sort: 'ลากจัดหมวด', match: 'โยงเส้นคู่', order: 'เรียงลำดับ' };

  function view(c) {
    const n = c.number;
    if (!S || S.n !== n) S = { n, i: -1, scores: [], phase: 'intro' };
    setTimeout(draw, 0);
    return `<section class="paper prac" id="prac" aria-live="polite"></section>`;
  }

  function draw() {
    const el = $('#prac'); if (!el || !S) return;
    const set = P[S.n], c = chapterOf(S.n), r = rec(S.n);
    if (S.phase === 'intro') {
      el.innerHTML = `<span class="eyebrow">PRACTICE · ตรวจให้ทันที ไม่ต้องรอครู</span><h2>ด่านฝึกบทที่ ${S.n} · ${esc(c.title)}</h2><p class="intro">${esc(set.intro)}</p>
      <div class="prac-types">${[...new Set(set.items.map(x => x.t))].map(t => `<span class="chip-t t-${t}">${tl[t]}</span>`).join('')}</div>
      <div class="prac-best"><div><b>${set.items.length}</b> ข้อ</div><div><b>${r.tries ? Math.round(r.best) : '–'}</b>${r.tries ? '%' : ''} คะแนนสูงสุด</div><div class="starbox">${starRow(stars(r.best))}</div></div>
      <p class="muted">ผ่านเมื่อได้ ${PASS}% ขึ้นไป ทำซ้ำได้ไม่จำกัด โจทย์จะสลับตำแหน่งทุกครั้ง ถ้ายังไม่แน่ใจให้กลับไปอ่านบทเรียนก่อน</p>
      <div class="prac-actions"><button class="btn green" data-pr="start">${r.tries ? 'ทำอีกครั้ง' : 'เริ่มด่านฝึก'}</button><a class="btn secondary" href="#chapter/${S.n}/learn">กลับไปอ่านบทเรียน</a></div>`;
      return;
    }
    if (S.phase === 'result') {
      const pct = S.scores.reduce((a, b) => a + b, 0) / set.items.length * 100, k = stars(pct);
      el.innerHTML = `<span class="eyebrow">RESULT</span><h2>${pct >= PASS ? 'ผ่านด่านแล้ว!' : 'เกือบแล้ว ลองอีกครั้ง'}</h2>
      <div class="prac-result"><div class="big">${Math.round(pct)}<small>%</small></div><div class="starbox lg">${starRow(k)}</div><p>${pct >= PASS ? 'ยอดเยี่ยม พลังพร้อมสู้บอสประจำบทแล้ว' : 'ทบทวนข้อที่พลาด แล้วลองใหม่ได้เลย'}</p></div>
      <ol class="prac-review">${set.items.map((it, i) => `<li class="${S.scores[i] >= 1 ? 'ok' : S.scores[i] > 0 ? 'half' : 'no'}"><span>${S.scores[i] >= 1 ? 'ถูก' : S.scores[i] > 0 ? 'ถูกบางส่วน' : 'ยังไม่ถูก'}</span> ${esc(it.q)}</li>`).join('')}</ol>
      <div class="prac-actions"><button class="btn" data-pr="start">ทำใหม่</button><a class="btn green" href="#chapter/${S.n}/arena">ไปสู้บอส</a><a class="btn secondary" href="#chapter/${S.n}/work">ไปทำชิ้นงาน</a></div>`;
      return;
    }
    const it = set.items[S.i], total = set.items.length;
    el.innerHTML = `<div class="prac-top"><span class="eyebrow">ข้อ ${S.i + 1} / ${total} · ${tl[it.t]}</span><div class="dots" aria-hidden="true">${set.items.map((_, k) => `<i class="${k < S.i ? 'done' : k === S.i ? 'now' : ''}"></i>`).join('')}</div></div>
      ${it.ctx?`<p class="prac-ctx">${esc(it.ctx)}</p>`:''}<h3 class="prac-q">${esc(it.q)}</h3>${window.DTQF?window.DTQF.html(it.fig):''}<div id="pr-body" class="pr-${it.t}"></div><div id="pr-fb" class="prac-fb" hidden></div>
      <div class="prac-actions"><button class="btn green" data-pr="check" disabled>ตรวจคำตอบ</button><button class="btn" data-pr="next" hidden>${S.i === total - 1 ? 'ดูผล' : 'ข้อต่อไป'}</button></div>`;
    S.checked = false; initItem(it); drawBody(it);
  }

  function initItem(it) {
    const c = S.cur = {};
    if (it.t === 'choice') c.sel = null;
    if (it.t === 'pick') c.sel = new Set();
    if (it.t === 'sort') { c.place = it.items.map(() => null); c.order = shuffle(it.items.map((_, i) => i)); c.sel = null; }
    if (it.t === 'match') { c.right = shuffle(it.pairs.map((_, i) => i)); c.link = {}; c.selL = null; }
    if (it.t === 'order') { let a; do { a = shuffle(it.items.map((_, i) => i)); } while (a.every((v, i) => v === i)); c.arr = a; }
  }

  function setCheckEnabled(it) {
    const c = S.cur, b = $('[data-pr="check"]'); if (!b) return;
    let ok = true;
    if (it.t === 'choice') ok = c.sel !== null;
    else if (it.t === 'pick') ok = c.sel.size > 0;
    else if (it.t === 'sort') ok = c.place.every(v => v !== null);
    else if (it.t === 'match') ok = Object.keys(c.link).length === it.pairs.length;
    b.disabled = !ok || S.checked;
  }

  function drawBody(it) {
    const body = $('#pr-body'), c = S.cur, ck = S.checked; if (!body) return;
    if (it.t === 'choice') {
      body.innerHTML = it.opts.map((o, i) => `<button type="button" class="opt ${c.sel === i ? 'sel' : ''} ${ck ? (i === it.ans ? 'right' : c.sel === i ? 'wrong' : '') : ''}" data-opt="${i}" ${ck ? 'disabled' : ''}><b>${'กขคง'[i]}</b><span>${esc(o)}</span></button>`).join('');
    } else if (it.t === 'pick') {
      body.innerHTML = `<p class="hint">แตะเพื่อวง (เลือกได้หลายข้อ) แตะซ้ำเพื่อยกเลิก</p>` + it.opts.map((o, i) => {
        const on = c.sel.has(i), good = it.ans.includes(i);
        return `<button type="button" class="opt pickopt ${on ? 'sel' : ''} ${ck ? (good ? 'right' : on ? 'wrong' : '') : ''}" data-pick="${i}" aria-pressed="${on}" ${ck ? 'disabled' : ''}><b>${on ? '✓' : ''}</b><span>${esc(o)}</span></button>`;
      }).join('');
    } else if (it.t === 'sort') {
      const chip = i => `<button type="button" class="chip ${c.sel === i ? 'sel' : ''} ${ck ? (c.place[i] === it.items[i][1] ? 'right' : 'wrong') : ''}" draggable="${!ck}" data-chip="${i}" ${ck ? 'disabled' : ''}>${esc(it.items[i][0])}</button>`;
      body.innerHTML = `<p class="hint">ลากข้อความไปวางในกล่อง หรือแตะข้อความแล้วแตะกล่องที่ต้องการ (แตะที่ข้อความในกล่องเพื่อเอาออก)</p>
        <div class="pool" data-drop="pool">${c.order.filter(i => c.place[i] === null).map(chip).join('') || '<em>จัดครบทุกข้อแล้ว</em>'}</div>
        <div class="buckets">${it.cats.map((t, b) => `<div class="bucket b${b % 4}" data-drop="${b}" tabindex="0" role="button" aria-label="วางในกล่อง ${esc(t)}"><h4>${esc(t)}</h4><div class="in">${c.order.filter(i => c.place[i] === b).map(chip).join('')}</div></div>`).join('')}</div>`;
    } else if (it.t === 'match') {
      body.innerHTML = `<p class="hint">แตะด้านซ้ายก่อน แล้วแตะคำตอบด้านขวาเพื่อโยงเส้น แตะซ้ำเพื่อยกเลิกเส้น</p>
        <div class="mt-wrap" id="mt"><svg class="mt-svg" aria-hidden="true"></svg><div class="mt-col l">${it.pairs.map((p, i) => `<button type="button" class="mt-i ${c.selL === i ? 'sel' : ''} ${i in c.link ? 'linked' : ''}" data-l="${i}" ${ck ? 'disabled' : ''}>${esc(p[0])}</button>`).join('')}</div><div class="mt-col r">${c.right.map(j => `<button type="button" class="mt-i ${Object.values(c.link).includes(j) ? 'linked' : ''}" data-r="${j}" ${ck ? 'disabled' : ''}>${esc(it.pairs[j][1])}</button>`).join('')}</div></div>`;
      setTimeout(drawLines, 0);
    } else if (it.t === 'order') {
      body.innerHTML = `<p class="hint">ลากรายการ หรือกดปุ่มขึ้น/ลง เพื่อเรียงให้ถูกลำดับ</p><ol class="ord" id="ord">${c.arr.map((v, pos) => `<li draggable="${!ck}" data-pos="${pos}" class="${ck ? (v === pos ? 'right' : 'wrong') : ''}"><span class="no">${pos + 1}</span><span class="tx">${esc(it.items[v])}</span>${ck ? '' : `<span class="mv"><button type="button" class="up" data-mv="-1" data-pos="${pos}" aria-label="เลื่อนขึ้น" ${pos === 0 ? 'disabled' : ''}></button><button type="button" class="dn" data-mv="1" data-pos="${pos}" aria-label="เลื่อนลง" ${pos === c.arr.length - 1 ? 'disabled' : ''}></button></span>`}</li>`).join('')}</ol>`;
    }
    setCheckEnabled(it);
  }

  function drawLines() {
    const it = P[S.n].items[S.i], wrap = $('#mt'); if (!wrap || it.t !== 'match') return;
    const svg = $('.mt-svg', wrap), w = wrap.getBoundingClientRect(), c = S.cur;
    svg.setAttribute('width', w.width); svg.setAttribute('height', w.height);
    const cls = ['#26b8a0', '#ff3d94', '#ffb400', '#6c63ff', '#3aa0ff', '#ff7a3c'];
    svg.innerHTML = Object.entries(c.link).map(([l, r], k) => {
      const a = $(`[data-l="${l}"]`, wrap).getBoundingClientRect(), b = $(`[data-r="${r}"]`, wrap).getBoundingClientRect();
      const x1 = a.right - w.left, y1 = a.top + a.height / 2 - w.top, x2 = b.left - w.left, y2 = b.top + b.height / 2 - w.top;
      const col = S.checked ? (Number(l) === Number(r) ? '#12a150' : '#d4244b') : cls[k % cls.length], mx = (x1 + x2) / 2;
      return `<path d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" stroke="#0b1d1f" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="7" fill="${col}" stroke="#0b1d1f" stroke-width="3"/><circle cx="${x2}" cy="${y2}" r="7" fill="${col}" stroke="#0b1d1f" stroke-width="3"/>`;
    }).join('');
  }
  window.addEventListener('resize', () => { if (S && S.phase === 'q') drawLines(); });

  function score(it) {
    const c = S.cur;
    if (it.t === 'choice') return c.sel === it.ans ? 1 : 0;
    if (it.t === 'pick') { let good = 0, bad = 0; c.sel.forEach(i => it.ans.includes(i) ? good++ : bad++); return Math.max(0, (good - bad) / it.ans.length); }
    if (it.t === 'sort') return c.place.filter((p, i) => p === it.items[i][1]).length / it.items.length;
    if (it.t === 'match') return Object.entries(c.link).filter(([l, r]) => Number(l) === Number(r)).length / it.pairs.length;
    if (it.t === 'order') return c.arr.filter((v, i) => v === i).length / c.arr.length;
    return 0;
  }

  function check() {
    const it = P[S.n].items[S.i]; if (S.checked) return;
    S.checked = true; const sc = score(it); S.scores[S.i] = sc;
    drawBody(it);
    const fb = $('#pr-fb');
    let detail = '';
    if (it.t === 'order' && sc < 1) detail = `<p><b>ลำดับที่ถูก:</b></p><ol>${it.items.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
    if (it.t === 'match' && sc < 1) detail = `<p><b>คู่ที่ถูก:</b></p><ul>${it.pairs.map(p => `<li>${esc(p[0])} = ${esc(p[1])}</li>`).join('')}</ul>`;
    fb.hidden = false; fb.className = 'prac-fb ' + (sc >= 1 ? 'ok' : sc > 0 ? 'half' : 'no');
    fb.innerHTML = `<strong>${sc >= 1 ? 'ถูกต้อง!' : sc > 0 ? 'ถูกบางส่วน' : 'ยังไม่ถูก'}</strong><p>${esc(it.why)}</p>${detail}`;
    $('[data-pr="check"]').hidden = true; $('[data-pr="next"]').hidden = false; $('[data-pr="next"]').focus();
    setTimeout(drawLines, 0);
  }

  function finish() {
    const set = P[S.n], pct = S.scores.reduce((a, b) => a + b, 0) / set.items.length * 100, r = rec(S.n);
    r.tries++; r.last = pct; r.best = Math.max(r.best, pct); r.at = new Date().toISOString(); r.miss = S.scores.map((v, i) => v < 1 ? i : -1).filter(i => i >= 0); save(); if (window.DTCloud) window.DTCloud.pushPractice(S.n);
    S.phase = 'result'; draw();
  }

  /* ---------- ลานบอส (ใช้ชุดภาพต่อสู้เดียวกับ ป.1–ป.6: ฉาก ท่าทาง เอฟเฟกต์) ---------- */
  const CLIMATE = { 1: 'nature', 2: 'nature', 3: 'rock', 4: 'rock', 5: 'thunder', 6: 'thunder', 7: 'fire' };
  const SAY_HIT = ['เจ็บจริง! ข้ายังไม่แพ้หรอก', 'อึก... เจ้าเข้าใจบทเรียนดีนี่', 'โดนเข้าแล้ว!', 'แรงใช้ได้เลย'];
  const SAY_MISS = ['ฮ่าฮ่า! พลาดแล้ว ลองคิดใหม่นะ', 'ตอบผิด เจอแบบนี้!', 'ยังไม่ถูกนะ ทบทวนอีกนิด'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const heartsHTML = n => [0, 1, 2].map(i => `<i class="${i >= n ? 'lost' : ''}"></i>`).join('');
  let B = null;
  const WEAPONS = [['sword', 'ดาบ'], ['spear', 'หอก'], ['gun', 'ปืน'], ['dual', 'มีดคู่']];
  const HF = { idle: 0, attack: 4, shield: 3, dodge: 2, hurt: 5, power: 6, victory: 7, defeat: 8 };
  const hpos = k => { const i = HF[k] ?? 0; return (i % 3) * 50 + '% ' + Math.floor(i / 3) * 50 + '%'; };
  const setWeapon = w => { try { localStorage.setItem(window.DT_CFG.key + '-weapon', w); } catch (e) { /* ไม่บันทึก */ } };
  const getWeapon = () => { let w = null; try { w = localStorage.getItem(window.DT_CFG.key + '-weapon'); } catch (e) { /* ไม่บันทึก */ } if (!WEAPONS.some(x => x[0] === w)) { w = WEAPONS[Math.floor(Math.random() * 4)][0]; setWeapon(w); } return w; };
  const setHero = (a, k) => { const h = a && $('.combat-hero', a); if (h) h.style.backgroundPosition = hpos(k); };
  const CU = () => (typeof CombatUI !== 'undefined' ? CombatUI : null);

  function arenaHTML(c, o = {}) {
    const e = D.encounters.find(x => x.chapterId === c.id), boss = D.bosses.find(x => x.number === e.mainBoss), clim = CLIMATE[c.number] || 'nature';
    const hp = o.hp === undefined ? 100 : o.hp;
    return `<div class="arena combat-battle" id="arena" data-combat-climate="${clim}" style="--combat-arena:url(assets/arena-${window.DT_CFG.slug}-c${String(c.number).padStart(2, '0')}.webp)">
      <div class="combat-weather" aria-hidden="true"></div>
      <div class="hp"><span class="bname">${esc(boss.thaiName)}</span><div class="bar-p" aria-label="พลังบอส"><i id="b-hp" style="width:${Math.max(0, hp)}%"></i></div><span class="hearts" id="b-hearts" aria-label="หัวใจของ Techno">${heartsHTML(o.hearts === undefined ? 3 : o.hearts)}</span></div>
      <div class="say" id="b-say" hidden></div>
      <div class="boss-s combat-boss ${o.bossFrame === undefined ? 'is-idle' : ''}" id="bs" style="background-image:url(assets/sheet-${boss.number}.webp);${o.bossFrame === undefined ? '' : 'background-position:' + CU().bossFrame(o.bossFrame)}"></div>
      <div class="combat-hero weapon-${getWeapon()}" id="cf" role="img" aria-label="Techno ถือ${esc(WEAPONS.find(x => x[0] === getWeapon())[1])} หันหน้าเข้าหาบอส" style="background-image:url(assets/hero-${getWeapon()}.webp);background-size:300% 300%;background-position:${hpos(o.heroFrame || 'idle')}"></div></div>`;
  }
  function arena(c) {
    if (window.DTBoss) return window.DTBoss.view(c);
    const n = c.number;
    if (!B || B.n !== n) B = { n, phase: 'intro' };
    setTimeout(drawBattle, 0);
    return `<section class="paper prac battle" id="battle" aria-live="polite"></section>`;
  }
  function boot() { const a = $('#arena'); if (a && CU()) CU().decorate(a, a.dataset.combatClimate); }
  function say(msg, ms) { const a = $('#arena'); if (a && CU()) CU().say(a, msg, ms || 2400); }

  function drawBattle() {
    const el = $('#battle'); if (!el || !B) return;
    const c = chapterOf(B.n), e = D.encounters.find(x => x.chapterId === c.id), boss = D.bosses.find(x => x.number === e.mainBoss), r = rec(B.n);
    if (B.phase === 'intro') {
      el.innerHTML = `<span class="eyebrow">BOSS BATTLE · ${esc(e.arena)} · ${esc(e.planet)}</span><h2>ดวลบอสประจำบท</h2>${arenaHTML(c)}
      <div class="b-info"><p class="boss-say">“${esc(e.intro || 'มาพิสูจน์ความเข้าใจของเจ้ากัน')}”</p>
      <ul class="b-rules"><li><b>ตอบถูก</b> Techno ยิงโจมตีบอส</li><li><b>ตอบผิด</b> บอสโต้กลับ เสียหัวใจ 1 ดวง (มี 3 ดวง)</li><li><b>โล่</b> ใช้ได้ครั้งเดียว ตัดตัวเลือกผิดออก 1 ข้อ</li><li>ไม่มีเวลาจำกัด ไม่มีคะแนนวิชา ${r.battle ? 'เคยชนะแล้ว (+50 XP)' : 'ชนะครั้งแรกได้ +50 XP'}</li></ul></div>
      <div class="weapons" role="group" aria-label="เลือกอาวุธของ Techno"><b>เลือกอาวุธ:</b>${WEAPONS.map(([k, t]) => `<button type="button" class="wp ${k === getWeapon() ? 'sel' : ''}" data-wp="${k}" aria-pressed="${k === getWeapon()}"><span class="wi" style="background-image:url(assets/hero-${k}.webp);background-position:${hpos('idle')}"></span>${t}</button>`).join('')}</div>
      <div class="prac-actions"><button class="btn green" data-bt="start">เริ่มต่อสู้</button><a class="btn secondary" href="#chapter/${B.n}/practice">ฝึกก่อนที่ด่านฝึก</a></div>`;
      boot(); setTimeout(() => say('มาสิ! พิสูจน์ให้ข้าเห็นหน่อย', 3200), 300); return;
    }
    if (B.phase === 'end') {
      el.innerHTML = `<span class="eyebrow">${B.win ? 'VICTORY' : 'DEFEATED'}</span><h2>${B.win ? 'ชนะแล้ว! ' + esc(boss.thaiName) + ' ล้มลง' : 'พลังหมด แต่ยังสู้ต่อได้'}</h2>${arenaHTML(c, { hp: B.win ? 0 : B.hp, hearts: B.hearts, bossFrame: B.win ? 8 : undefined, heroFrame: B.win ? 'victory' : 'defeat' })}
      <div class="prac-result"><div class="big">${B.right}<small>/${B.q.length}</small></div><p>${B.win ? 'ตอบถูก ' + B.right + ' จาก ' + B.q.length + ' ข้อ' + (B.first ? ' · ได้รับ +50 XP' : '') : 'ทบทวนบทเรียนแล้วท้าชิงใหม่ได้เลย โจทย์จะสลับทุกครั้ง'}</p></div>
      <div class="prac-actions"><button class="btn" data-bt="start">สู้อีกครั้ง</button><a class="btn secondary" href="#chapter/${B.n}/learn">อ่านบทเรียนอีกรอบ</a><a class="btn green" href="#home">กลับฐานภารกิจ</a></div>`;
      boot(); return;
    }
    el.innerHTML = `<div class="prac-top"><span class="eyebrow">ด่านบอส ${B.i + 1} / ${B.q.length}</span></div>${arenaHTML(c, { hp: B.hp, hearts: B.hearts })}<div id="b-qa"></div>`;
    boot(); drawQuestion();
  }
  function drawQuestion() {
    const q = B.q[B.i], qa = $('#b-qa'); if (!qa) return;
    qa.innerHTML = `<div class="b-hud"><span class="chip-t t-choice">ด่านบอส ${B.i + 1}/${B.q.length}</span><button type="button" class="btn secondary small" data-bt="shield" ${B.shield ? '' : 'disabled'}>🛡️ ใช้โล่ (ตัดตัวเลือกผิด 1 ข้อ)</button></div>
      ${q.ctx?`<p class="prac-ctx">${esc(q.ctx)}</p>`:''}<h3 class="prac-q">${esc(q.q)}</h3>${window.DTQF?window.DTQF.html(q.fig):''}<div class="battle-opts">${q.opts.map((o, i) => `<button type="button" class="opt" data-bopt="${i}"><b>${'กขคง'[i]}</b><span>${esc(o)}</span></button>`).join('')}</div><div id="b-fb" class="prac-fb" hidden></div>`;
    const a = $('#arena'), bs = $('#bs'); if (bs) { bs.className = 'boss-s combat-boss is-idle'; bs.style.backgroundPosition = ''; } setHero(a, 'idle');
  }
  function startBattle() {
    const set = P[B.n], pool = shuffle([...set.battle, ...set.items.filter(x => x.t === 'choice')]).slice(0, 6);
    B = Object.assign(B, { phase: 'q', i: 0, hp: 100, hearts: 3, right: 0, shield: true, busy: false, q: pool.map(x => { const idx = shuffle(x.opts.map((_, i) => i)); return { ctx: x.ctx || '', q: x.q, opts: idx.map(i => x.opts[i]), ans: idx.indexOf(x.ans), why: x.why }; }) });
    drawBattle();
  }
  function useShield() {
    if (!B.shield || B.busy) return; B.shield = false;
    const q = B.q[B.i], wrong = $$('.battle-opts .opt').filter((b, k) => k !== q.ans && !b.disabled), w = wrong[Math.floor(Math.random() * wrong.length)];
    if (w) { w.disabled = true; w.classList.add('cut'); }
    const a = $('#arena'); if (a && CU()) { setHero(a, 'shield'); CU().fx(a, 'shield'); setTimeout(() => setHero(a, 'idle'), 800); }
    const b = $('[data-bt="shield"]'); if (b) b.disabled = true; say('โล่เปิด! ตัดตัวเลือกผิดออกแล้ว', 1800);
  }
  function answer(i) {
    if (B.busy) return; B.busy = true;
    const q = B.q[B.i], ok = i === q.ans, a = $('#arena'), bs = $('#bs');
    $$('.battle-opts .opt').forEach((b, k) => { b.disabled = true; if (k === q.ans) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); });
    const sh = $('[data-bt="shield"]'); if (sh) sh.disabled = true;
    if (ok) {
      B.right++; B.hp -= 100 / B.q.length;
      setHero(a, 'attack'); CU().fx(a, 'hero-shot');
      setTimeout(() => { bs.classList.remove('is-idle'); bs.style.backgroundPosition = CU().bossFrame(5); bs.classList.add('hurt'); CU().fx(a, 'impact'); const bar = $('#b-hp'); if (bar) bar.style.width = Math.max(0, Math.round(B.hp)) + '%'; say(pick(SAY_HIT), 2200); }, 450);
      setTimeout(() => setHero(a, 'idle'), 900);
    } else {
      B.hearts--;
      bs.classList.remove('is-idle'); bs.style.backgroundPosition = CU().bossFrame(4); bs.classList.add('is-attacking'); say(pick(SAY_MISS), 2200);
      CU().fx(a, 'boss-shot', CU().climates.indexOf(a.dataset.combatClimate));
      setTimeout(() => { setHero(a, 'hurt'); $$('#b-hearts i').forEach((h, k) => { if (k >= B.hearts) h.classList.add('lost'); }); }, 560);
    }
    const last = B.hearts <= 0 || B.i === B.q.length - 1;
    const fb = $('#b-fb'); fb.hidden = false; fb.className = 'prac-fb ' + (ok ? 'ok' : 'no');
    fb.innerHTML = `<strong>${ok ? 'โจมตีโดน!' : 'พลาด! บอสโต้กลับ เสียหัวใจ 1 ดวง'}</strong>${q.why ? `<p>${esc(q.why)}</p>` : ''}<div class="prac-actions"><button class="btn" data-bt="next">${last ? 'ดูผล' : 'ด่านต่อไป'}</button></div>`;
    window.scrollTo({ top: a.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    setTimeout(() => { const f = $('#b-fb'); if (f && B.busy) window.scrollTo({ top: f.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55, behavior: 'smooth' }); $('[data-bt="next"]')?.focus({ preventScroll: true }); }, 1500);
  }
  function nextBattle() {
    const ar = $('#arena'); if (ar) window.scrollTo({ top: ar.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    const last = B.hearts <= 0 || B.i === B.q.length - 1;
    if (last) {
      B.win = B.hearts > 0; B.phase = 'end';
      const r = rec(B.n); B.first = B.win && !r.battle; if (B.win) { r.battle = 1; r.battleAt = new Date().toISOString(); save(); if (window.DTCloud) window.DTCloud.pushPractice(B.n); }
      drawBattle(); return;
    }
    B.i++; B.busy = false; drawQuestion();
    const bar = $('#b-hp'); if (bar) bar.style.width = Math.max(0, Math.round(B.hp)) + '%';
  }

  /* ---------- เหตุการณ์ ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    let b;
    if ((b = t.closest('[data-pr]'))) {
      const k = b.dataset.pr;
      if (k === 'start') { S.phase = 'q'; S.i = 0; S.scores = []; draw(); }
      else if (k === 'check') check();
      else if (k === 'next') { if (S.i === P[S.n].items.length - 1) finish(); else { S.i++; draw(); } }
      return;
    }
    if ((b = t.closest('[data-bt]'))) {
      const k = b.dataset.bt; if (k === 'start') startBattle(); else if (k === 'next') nextBattle(); else if (k === 'shield') useShield(); return;
    }
    if ((b = t.closest('[data-bopt]'))) { answer(Number(b.dataset.bopt)); return; }
    if ((b = t.closest('[data-wp]'))) { setWeapon(b.dataset.wp); drawBattle(); return; }
    if (!S || S.phase !== 'q' || S.checked || !$('#pr-body')) return;
    const it = P[S.n].items[S.i], c = S.cur;
    if ((b = t.closest('[data-opt]'))) { c.sel = Number(b.dataset.opt); drawBody(it); return; }
    if ((b = t.closest('[data-pick]'))) { const i = Number(b.dataset.pick); c.sel.has(i) ? c.sel.delete(i) : c.sel.add(i); drawBody(it); return; }
    if (it.t === 'sort') {
      if ((b = t.closest('[data-chip]'))) {
        const i = Number(b.dataset.chip);
        if (c.place[i] !== null) { c.place[i] = null; c.sel = null; } else c.sel = c.sel === i ? null : i;
        drawBody(it); return;
      }
      if ((b = t.closest('[data-drop]')) && c.sel !== null) {
        const d = b.dataset.drop; c.place[c.sel] = d === 'pool' ? null : Number(d); c.sel = null; drawBody(it);
      }
      return;
    }
    if (it.t === 'match') {
      if ((b = t.closest('[data-l]'))) {
        const l = Number(b.dataset.l);
        if (l in c.link) { delete c.link[l]; c.selL = null; } else c.selL = c.selL === l ? null : l;
        drawBody(it); return;
      }
      if ((b = t.closest('[data-r]'))) {
        const r = Number(b.dataset.r), cur = Object.entries(c.link).find(([, v]) => v === r);
        if (cur) { delete c.link[cur[0]]; drawBody(it); return; }
        if (c.selL !== null) { c.link[c.selL] = r; c.selL = null; drawBody(it); }
      }
      return;
    }
    if (it.t === 'order' && (b = t.closest('[data-mv]'))) {
      const pos = Number(b.dataset.pos), to = pos + Number(b.dataset.mv);
      if (to >= 0 && to < c.arr.length) { [c.arr[pos], c.arr[to]] = [c.arr[to], c.arr[pos]]; drawBody(it); $(`[data-mv="${b.dataset.mv}"][data-pos="${to}"]`)?.focus(); }
    }
  });
  /* ลาก-วาง (เมาส์/ทัชแพด) — บนมือถือใช้การแตะแทน */
  let dragChip = null, dragPos = null;
  document.addEventListener('dragstart', e => {
    if (!S || S.phase !== 'q' || S.checked) return;
    const ch = e.target.closest?.('[data-chip]'), li = e.target.closest?.('#ord li');
    if (ch) { dragChip = Number(ch.dataset.chip); e.dataTransfer.setData('text/plain', 'chip'); e.dataTransfer.effectAllowed = 'move'; }
    else if (li) { dragPos = Number(li.dataset.pos); e.dataTransfer.setData('text/plain', 'ord'); e.dataTransfer.effectAllowed = 'move'; }
  });
  document.addEventListener('dragover', e => { if ((dragChip !== null && e.target.closest?.('[data-drop]')) || (dragPos !== null && e.target.closest?.('#ord li'))) e.preventDefault(); });
  document.addEventListener('drop', e => {
    if (!S || S.phase !== 'q' || S.checked) return;
    const it = P[S.n].items[S.i], c = S.cur;
    const dz = e.target.closest?.('[data-drop]'), li = e.target.closest?.('#ord li');
    if (dragChip !== null && dz) { e.preventDefault(); const d = dz.dataset.drop; c.place[dragChip] = d === 'pool' ? null : Number(d); c.sel = null; drawBody(it); }
    else if (dragPos !== null && li) { e.preventDefault(); const to = Number(li.dataset.pos), [m] = c.arr.splice(dragPos, 1); c.arr.splice(to, 0, m); drawBody(it); }
    dragChip = dragPos = null;
  });
  document.addEventListener('dragend', () => { dragChip = dragPos = null; });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.bucket') && S?.cur?.sel !== null && S?.cur?.sel !== undefined) { e.preventDefault(); e.target.click(); }
  });

  /* ---------- สรุปให้ครู (ตรวจอัตโนมัติ) ---------- */
  function teacherSummary() {
    let profiles = {}; try { profiles = JSON.parse(localStorage.getItem(DB) || '{}').profiles || {}; } catch (e) { /* ว่าง */ }
    const rows = Object.values(profiles).filter(p => p.id !== 'guest').sort((a, b) => Number(a.number) - Number(b.number));
    const cell = (id, n) => { const r = (store[id] || {})[n]; return r && (r.tries || r.battle) ? `<td class="${r.best >= PASS ? 'ok' : 'low'}">${r.tries ? Math.round(r.best) : '–'}${r.battle ? ' ★' : ''}</td>` : '<td class="none">–</td>'; };
    return `<section class="paper" id="prac-summary"><span class="eyebrow">AUTO SCORE · ตรวจอัตโนมัติ</span><h2>คะแนนด่านฝึกของผู้เรียน (ไม่ต้องตรวจเอง)</h2><p class="muted">ตัวเลขคือคะแนนสูงสุดของด่านฝึกแต่ละบท (เต็ม 100) เครื่องหมาย ★ คือชนะบอสประจำบทแล้ว สีเขียวคือผ่านเกณฑ์ ${PASS}% ข้อมูลจากระบบ อัปเดตเองทุก 45 วินาที</p>${rows.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>เลขที่</th><th>ชื่อ</th>${D.course.chapters.map(c => `<th>บท ${c.number}</th>`).join('')}<th>XP รวม</th></tr></thead><tbody>${rows.map(p => `<tr><td>${esc(p.number)}</td><td>${esc(p.name)}</td>${D.course.chapters.map(c => cell(p.id, c.number)).join('')}<td><b>${D.course.chapters.reduce((s, c) => { const r = (store[p.id] || {})[c.number]; return s + (r ? Math.round(r.best) + (r.battle ? 50 : 0) : 0); }, 0)}</b></td></tr>`).join('')}</tbody></table></div>` : '<p>ยังไม่มีนักเรียนทำด่านฝึก</p>'}</section>`;
  }
  /* ---------- คะแนนรวมรายบท (เต็ม 10): ชิ้นงาน 4 + หลังเรียน 4 + ด่านฝึก 2 ---------- */
  /* สัดส่วนคะแนน: ครูตั้งได้ในหน้าเครื่องมือ (เก็บใน settings.weights) ค่าเริ่มต้น 4/4/2 */
  const weights = () => { try { const w = (JSON.parse(localStorage.getItem(DB) || '{}').settings || {}).weights; if (w && w.work + w.post + w.prac === 10) return w; } catch (e) { /* ใช้ค่าเริ่ม */ } return { work: 4, post: 4, prac: 2 }; };
  const has = v => v !== undefined && v !== null && v !== '';
  const r1 = x => Math.round(x * 10) / 10;
  function loadDb() { try { const d = JSON.parse(localStorage.getItem(DB) || '{}'); return { profiles: d.profiles || {}, subs: d.submissions || [] }; } catch (e) { return { profiles: {}, subs: [] }; } }
  const students = profiles => Object.values(profiles).filter(p => p.id !== 'guest').sort((a, b) => Number(a.number) - Number(b.number));
  const nameOf = p => /^เลขที่/.test(p.name || '') || !p.name ? 'เลขที่ ' + p.number : p.number + ' · ' + p.name;
  /* ส่วนประกอบคะแนนของนักเรียน 1 คนใน 1 บท */
  function partsOf(pid, c, subs) {
    const { work: W_WORK, post: W_POST, prac: W_PRAC } = weights();
    const r = (store[pid] || {})[c.number] || {};
    const mine = subs.filter(s => s.studentId === pid && s.chapterId === c.id).sort((a, b) => b.version - a.version);
    const graded = mine.find(s => s.review && s.review.status === 'graded'), latest = mine[0];
    const aiTot = !graded && latest && !latest.review && latest.aiDraft ? latest.aiDraft.scores.reduce((a, b) => a + (+b || 0), 0) : null;
    const workRaw = graded ? graded.review.scores.reduce((a, b) => a + (+b || 0), 0) : null;
    const work = { v: workRaw === null ? null : r1(workRaw / 100 * W_WORK), max: W_WORK, raw: workRaw, ai: aiTot, state: graded ? 'ok' : !latest ? 'none' : latest.review && latest.review.status === 'revision_requested' ? 'fix' : 'wait', go: `#chapter/${c.number}/work` };
    const post = { v: has(r.post) ? r1(r.post / 100 * W_POST) : null, max: W_POST, raw: has(r.post) ? Math.round(r.post) : null, state: has(r.post) ? 'ok' : 'none', go: `#chapter/${c.number}/post` };
    const prac = { v: r.tries ? r1(r.best / 100 * W_PRAC) : null, max: W_PRAC, raw: r.tries ? Math.round(r.best) : null, state: r.tries ? 'ok' : 'none', go: `#chapter/${c.number}/practice` };
    const total = r1((work.v || 0) + (post.v || 0) + (prac.v || 0));
    return { work, post, prac, total, pre: has(r.pre) ? Math.round(r.pre) : null, postPct: post.raw };
  }
  const segBar = P => `<span class="sc-seg" aria-hidden="true">${[['work', 'w'], ['post', 'p'], ['prac', 'r']].map(([k, cl]) => `<i class="${cl}${P[k].v === null ? ' miss' : ''}" style="flex:${P[k].max}"><u style="width:${P[k].v === null ? 0 : P[k].v / P[k].max * 100}%"></u></i>`).join('')}</span>`;
  let ppCh = 0, scCh = 0, scSort = 'no', scMiss = false;
  const who = p => `<a class="sc-who" href="#teacher/student/${encodeURIComponent(p.id)}" title="ดูรายงานของคนนี้">${esc(nameOf(p))}</a>`;
  /* ตารางก่อน–หลังเรียน: เลือกดูทุกบทหรือทีละบท */
  function prepostTable() {
    const { profiles } = loadDb(), rows = students(profiles), chs = D.course.chapters;
    const chips = `<div class="sc-chips" role="tablist">${[[0, 'ทุกบท'], ...chs.map(c => [c.number, 'บท ' + c.number])].map(([n, t]) => `<button type="button" class="${ppCh === n ? 'on' : ''}" data-pp-ch="${n}">${t}</button>`).join('')}</div>`;
    const gainPill = (a, b) => { if (!has(a) || !has(b)) return '<span class="sc-gain none">—</span>'; const g = Math.round(b - a); return `<span class="sc-gain ${g > 0 ? 'up' : g < 0 ? 'down' : 'eq'}">${g > 0 ? '▲ +' + g : g < 0 ? '▼ ' + g : '= 0'}</span>`; };
    /* ช่องตาราง: บอกตรง ๆ ว่าก่อนเรียนกี่คะแนน หลังเรียนกี่คะแนน ถ้าไม่มีทั้งคู่แสดงขีดเดียว */
    const ppCell = (a, b) => { if (!has(a) && !has(b)) return '<td class="sc-none">–</td>'; const n = v => has(v) ? Math.round(v) : '–'; return `<td class="sc-pp1" title="ก่อนเรียน ${n(a)} · หลังเรียน ${n(b)}"><span>${n(a)}</span><i>›</i><b>${n(b)}</b>${has(a) && has(b) ? gainPill(a, b) : ''}</td>`; };
    const avg = (n, k) => { const v = rows.map(p => ((store[p.id] || {})[n] || {})[k]).filter(has).map(Number); return v.length ? Math.round(v.reduce((a, x) => a + x, 0) / v.length) : null; };
    let body;
    if (!rows.length) body = '<p class="empty">ยังไม่มีรายชื่อนักเรียน</p>';
    else if (!ppCh) {
      body = `<div class="table-wrap"><table class="sc-table"><thead><tr><th>นักเรียน</th>${chs.map(c => `<th><button type="button" class="sc-th" data-pp-ch="${c.number}" title="${esc(c.title)}">บท ${c.number}<small>${esc(c.title)}</small></button></th>`).join('')}</tr></thead><tbody>${rows.map(p => `<tr><th scope="row">${who(p)}</th>${chs.map(c => { const r = (store[p.id] || {})[c.number] || {}; return ppCell(r.pre, r.post); }).join('')}</tr>`).join('')}
        <tr class="sc-avg"><th scope="row">ค่าเฉลี่ยห้อง</th>${chs.map(c => { return ppCell(avg(c.number, 'pre'), avg(c.number, 'post')); }).join('')}</tr></tbody></table></div>
        <p class="sc-note">แต่ละช่องคือ ก่อนเรียน › <b>หลังเรียน</b> เป็นร้อยละ (เต็ม 100) ▲ สีเขียวคือหลังเรียนได้มากกว่าก่อนเรียน แถวล่างสุดคือค่าเฉลี่ยของทั้งห้อง แตะหัวคอลัมน์เพื่อดูบทนั้นแบบละเอียด</p>`;
    } else {
      const c = chs[ppCh - 1], a = avg(ppCh, 'pre'), z = avg(ppCh, 'post'), up = rows.filter(p => { const r = (store[p.id] || {})[ppCh] || {}; return has(r.pre) && has(r.post) && r.post > r.pre; }).length;
      const bar = (v, cl) => !has(v) ? '<span class="sc-none">ยังไม่ทำ</span>' : `<span class="sc-bar ${cl}"><i style="width:${has(v) ? Math.max(3, v) : 0}%"></i><b>${has(v) ? Math.round(v) : 'ยังไม่ทำ'}</b></span>`;
      body = `<div class="sc-kpi"><div><small>ก่อนเรียน (เฉลี่ย)</small><b>${a === null ? '–' : a}</b></div><div><small>หลังเรียน (เฉลี่ย)</small><b>${z === null ? '–' : z}</b></div><div><small>คะแนนเพิ่มขึ้น</small><b>${up} คน</b></div></div>
        <h3 class="sc-h">บทที่ ${c.number} · ${esc(c.title)}</h3>
        <div class="table-wrap"><table class="sc-table detail"><thead><tr><th>นักเรียน</th><th>ก่อนเรียน</th><th>หลังเรียน</th><th>พัฒนาการ</th></tr></thead><tbody>${rows.map(p => { const r = (store[p.id] || {})[ppCh] || {}; return `<tr><th scope="row">${who(p)}</th><td>${bar(r.pre, 'pre')}</td><td>${bar(r.post, 'post')}</td><td>${gainPill(r.pre, r.post)}</td></tr>`; }).join('')}</tbody></table></div>`;
    }
    return `<section class="paper" id="prepost-summary"><span class="eyebrow">PRE · POST · ก่อน › หลังเรียน</span><h2>ผลทดสอบก่อนเรียนและหลังเรียน</h2>${chips}${body}</section>`;
  }
  /* ตารางคะแนนรวมรายบท */
  function totalTable() {
    const { profiles, subs } = loadDb(), chs = D.course.chapters, MAX = chs.length * 10;
    const sumOf = p => (scCh ? [chs[scCh - 1]] : chs).reduce((a, c) => a + partsOf(p.id, c, subs).total, 0), missOf = p => (scCh ? [chs[scCh - 1]] : chs).some(c => { const x = partsOf(p.id, c, subs); return [x.work, x.post, x.prac].some(y => y.v === null && y.state !== 'wait'); });
    let rows = students(profiles); if (scMiss) rows = rows.filter(missOf); if (scSort !== 'no') rows = rows.slice().sort((a, b) => scSort === 'desc' ? sumOf(b) - sumOf(a) : sumOf(a) - sumOf(b));
    const tools = `<div class="sc-tools"><label>เรียงตาม<select data-sc-sort><option value="no" ${scSort === 'no' ? 'selected' : ''}>เลขที่</option><option value="desc" ${scSort === 'desc' ? 'selected' : ''}>คะแนนมาก › น้อย</option><option value="asc" ${scSort === 'asc' ? 'selected' : ''}>คะแนนน้อย › มาก</option></select></label><label class="sc-chk"><input type="checkbox" data-sc-miss ${scMiss ? 'checked' : ''}> เฉพาะคนที่ยังขาดงาน</label><span>แสดง ${rows.length} คน · แตะชื่อเพื่อดูรายงานรายคน</span></div>`;
    const chips = `<div class="sc-chips">${[[0, 'ทุกบท'], ...chs.map(c => [c.number, 'บท ' + c.number])].map(([n, t]) => `<button type="button" class="${scCh === n ? 'on' : ''}" data-sc-ch="${n}">${t}</button>`).join('')}</div>`;
    const legend = `<p class="sc-legend"><span class="w"></span> ชิ้นงาน ${weights().work} คะแนน <span class="p"></span> หลังเรียน ${weights().post} คะแนน <span class="r"></span> ด่านฝึก ${weights().prac} คะแนน · รวมบทละ 10 คะแนน</p>`;
    let body;
    if (!rows.length) body = '<p class="empty">ยังไม่มีรายชื่อนักเรียน</p>';
    else if (!scCh) body = `<div class="table-wrap"><table class="sc-table"><thead><tr><th>นักเรียน</th>${chs.map(c => `<th><button type="button" class="sc-th" data-sc-ch="${c.number}">บท ${c.number}<small>/10</small></button></th>`).join('')}<th>รวม<small>/${MAX}</small></th></tr></thead><tbody>${rows.map(p => { let sum = 0; const cells = chs.map(c => { const P = partsOf(p.id, c, subs); sum += P.total; return `<td title="ชิ้นงาน ${P.work.v ?? '–'}/${P.work.max} · หลังเรียน ${P.post.v ?? '–'}/${P.post.max} · ด่านฝึก ${P.prac.v ?? '–'}/${P.prac.max}">${P.work.v === null && P.post.v === null && P.prac.v === null ? '<span class="sc-none">–</span>' : `<b class="sc-tot">${P.total}</b>${segBar(P)}`}</td>`; }).join(''); return `<tr><th scope="row">${who(p)}</th>${cells}<td class="sc-sum"><b>${r1(sum)}</b><small>${Math.round(sum / MAX * 100)}%</small></td></tr>`; }).join('')}</tbody></table></div><p class="sc-note">แถบสีใต้ตัวเลขแบ่งเป็น 3 ส่วนตามสัดส่วนคะแนน ส่วนที่เป็นเส้นประคือยังไม่มีคะแนน แตะหัวคอลัมน์เพื่อดูรายละเอียดของบทนั้น</p>`;
    else {
      const c = chs[scCh - 1], cellOf = (x, unit) => x.v !== null ? `<b>${x.v}</b><small>/${x.max} (${x.raw}${unit})</small>` : `<span class="sc-miss ${x.state}">${{ none: 'ยังไม่ทำ', wait: 'รอครูตรวจ', fix: 'ครูให้แก้' }[x.state] || 'ยังไม่ทำ'}</span>`;
      body = `<h3 class="sc-h">บทที่ ${c.number} · ${esc(c.title)}</h3><div class="table-wrap"><table class="sc-table detail"><thead><tr><th>นักเรียน</th><th>📝 ชิ้นงาน<small>/${weights().work}</small></th><th>🏁 หลังเรียน<small>/${weights().post}</small></th><th>🎮 ด่านฝึก<small>/${weights().prac}</small></th><th>รวม<small>/10</small></th></tr></thead><tbody>${rows.map(p => { const P = partsOf(p.id, c, subs); return `<tr><th scope="row">${who(p)}</th><td>${cellOf(P.work, '/100')}</td><td>${cellOf(P.post, '%')}</td><td>${cellOf(P.prac, '%')}</td><td class="sc-sum"><b>${P.total}</b>${segBar(P)}</td></tr>`; }).join('')}</tbody></table></div>`;
    }
    return `<section class="paper" id="score-total"><span class="eyebrow">TOTAL · คะแนนรวม</span><h2>คะแนนรวมรายบท</h2>${legend}${chips}${tools}${body}</section>`;
  }
  /* หน้าของนักเรียน: คะแนนของฉันรายบท บอกว่าขาดอะไร และกดไปทำได้ */
  const lockedNos = () => { try { return ((JSON.parse(localStorage.getItem(DB) || '{}').settings || {}).locks || []).map(Number); } catch (e) { return []; } };
  function myScore() {
    const { subs } = loadDb(), id = uid(), chs = D.course.chapters;
    const lk = lockedNos(), all = chs.filter(c => !lk.includes(c.number)).map(c => [c, partsOf(id, c, subs)]), sum = r1(all.reduce((s, [, P]) => s + P.total, 0));
    const MAX = all.length * 10 || 10;
    const miss = all.reduce((s, [, P]) => s + ['work', 'post', 'prac'].filter(k => P[k].v === null && P[k].state !== 'wait').length, 0);
    const chip = (x, ic, name, unit) => x.v !== null ? `<a class="sc-part ok" href="${x.go}"><span>${ic} ${name}</span><b>${x.v}<small>/${x.max}</small></b><em>${x.raw}${unit}</em></a>` : `<a class="sc-part ${x.state}" href="${x.go}"><span>${ic} ${name}</span><b>${x.state === 'wait' && x.ai !== null && x.ai !== undefined ? `AI ให้ ${x.ai}<small>/100</small>` : ({ none: 'ยังไม่ทำ', wait: 'รอครูตรวจ', fix: 'ครูให้แก้' }[x.state] || 'ยังไม่ทำ')}</b><em>${x.state === 'wait' ? (x.ai !== null && x.ai !== undefined ? '⏳ รอครูยืนยัน ›' : 'ดูงานที่ส่ง ›') : 'ไปทำเลย ›'}</em></a>`;
    return `<section class="paper sc-me" id="my-score"><span class="eyebrow">MY SCORE · คะแนนของฉัน</span><h2>คะแนนของฉันรายบท</h2>
      <div class="sc-kpi"><div><small>คะแนนรวม</small><b>${sum}<small>/${MAX}</small></b></div><div><small>คิดเป็น</small><b>${Math.round(sum / MAX * 100)}%</b></div><div class="${miss ? 'warn' : 'good'}"><small>ยังขาด</small><b>${miss} รายการ</b></div></div>
      <p class="sc-legend"><span class="w"></span> ชิ้นงาน ${weights().work} <span class="p"></span> หลังเรียน ${weights().post} <span class="r"></span> ด่านฝึก ${weights().prac} · รวมบทละ 10 คะแนน · กล่องสีแดงคือยังขาด แตะเพื่อไปทำได้เลย</p>
      ${lk.length ? `<p class="sc-note">🔒 ครูยังไม่เปิด ${lk.length} บท (บทที่ ${lk.join(', ')}) คะแนนรวมนับเฉพาะบทที่เปิดแล้ว</p>` : ''}<div class="sc-cards">${all.map(([c, P]) => `<article class="sc-card"><div class="sc-card-h"><span class="sc-ring" style="--p:${P.total * 10}%"><b>${P.total}</b></span><div class="sc-ch-t"><small>บทที่ ${c.number}</small><b title="${esc(c.title)}">${esc(c.title)}</b></div></div><div class="sc-parts">${chip(P.work, '📝', 'ชิ้นงาน', '/100')}${chip(P.post, '🏁', 'หลังเรียน', '%')}${chip(P.prac, '🎮', 'ด่านฝึก', '%')}</div></article>`).join('')}</div></section>`;
  }
  document.addEventListener('change', e => { const t = e.target; if (!t.matches) return; if (t.matches('[data-sc-sort]')) scSort = t.value; else if (t.matches('[data-sc-miss]')) scMiss = t.checked; else return; swap(document.getElementById('score-total'), totalTable()); });
  /* เปลี่ยนเนื้อหาในกล่องเดิม (ไม่แทนตัวกล่อง เพื่อให้แท็บของหน้าครูยังทำงาน) */
  const swap = (s, html) => { if (!s) return; const t = document.createElement('div'); t.innerHTML = html; s.innerHTML = t.firstElementChild.innerHTML; };
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-pp-ch]'), b = e.target.closest && e.target.closest('[data-sc-ch]');
    if (a) { ppCh = +a.dataset.ppCh; const s = document.getElementById('prepost-summary'); swap(s, prepostTable()); }
    if (b) { scCh = +b.dataset.scCh; const s = document.getElementById('score-total'); swap(s, totalTable()); }
  });
  /* กราฟแท่งก่อน–หลังเรียนรายบท (vals: [[pre, post] ต่อบท]) */
  function growthChart(vals, note) {
    const has = v => v !== undefined && v !== null && v !== '';
    if (!vals.some(([a, b]) => has(a) || has(b))) return '<p class="muted">ยังไม่มีผลทดสอบก่อนเรียนหรือหลังเรียน</p>';
    return `<div class="gr-chart" role="img" aria-label="กราฟคะแนนก่อนเรียนเทียบหลังเรียนรายบท">${D.course.chapters.map((c, i) => { const [a, b] = vals[i] || []; const g = has(a) && has(b) ? Math.round(b - a) : null; return `<div class="gr-row"><span class="gr-lab">บท ${c.number}</span><span class="gr-bars"><i class="gr-pre" style="width:${has(a) ? Math.max(2, a) : 0}%"><em>${has(a) ? Math.round(a) : ''}</em></i><i class="gr-post" style="width:${has(b) ? Math.max(2, b) : 0}%"><em>${has(b) ? Math.round(b) : ''}</em></i></span><span class="gr-gain ${g === null ? '' : g > 0 ? 'up' : g < 0 ? 'down' : ''}">${g === null ? '' : (g > 0 ? '+' : '') + g}</span></div>`; }).join('')}<p class="gr-key"><i class="gr-pre"></i> ก่อนเรียน <i class="gr-post"></i> หลังเรียน${note ? ' · ' + note : ''}</p></div>`;
  }
  const myGrowth = () => growthChart(D.course.chapters.map(c => { const r = (store[uid()] || {})[c.number] || {}; return [r.pre, r.post]; }));
  function csv() {
    let profiles = {}, subs = []; try { const d = JSON.parse(localStorage.getItem(DB) || '{}'); profiles = d.profiles || {}; subs = d.submissions || []; } catch (e) { /* ว่าง */ }
    const rows = Object.values(profiles).filter(p => p.id !== 'guest').sort((a, b) => Number(a.number) - Number(b.number));
    const work = (p, c) => { const s = subs.filter(x => x.studentId === p.id && x.chapterId === c.id && x.review && x.review.status === 'graded').sort((a, b) => b.version - a.version)[0]; return s ? s.review.scores.reduce((a, b) => a + (+b || 0), 0) : ''; };
    const head = ['เลขที่', 'ชื่อ', ...D.course.chapters.map(c => 'บท' + c.number + '(ชิ้นงาน/100)'), ...D.course.chapters.map(c => 'บท' + c.number + '(ด่านฝึก)'), ...D.course.chapters.map(c => 'บท' + c.number + '(ชนะบอส)'), ...D.course.chapters.map(c => 'บท' + c.number + '(ก่อนเรียน%)'), ...D.course.chapters.map(c => 'บท' + c.number + '(หลังเรียน%)'), 'XP รวม'];
    const line = p => {
      const us = store[p.id] || {}; let xp = 0;
      const a = D.course.chapters.map(c => { const r = us[c.number]; if (r) xp += Math.round(r.best) + (r.battle ? 50 : 0); return r && r.tries ? Math.round(r.best) : ''; });
      const b = D.course.chapters.map(c => (us[c.number] || {}).battle ? 'ชนะ' : '');
      const e = D.course.chapters.map(c => { const v = (us[c.number] || {}).pre; return v === undefined || v === null ? '' : Math.round(v); });
      const f = D.course.chapters.map(c => { const v = (us[c.number] || {}).post; return v === undefined || v === null ? '' : Math.round(v); });
      return [p.number, p.name, ...D.course.chapters.map(c => work(p, c)), ...a, ...b, ...e, ...f, xp];
    };
    const text = [head, ...rows.map(line)].map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const blob = new Blob(['﻿' + text], { type: 'text/csv' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Techno-' + window.DT_CFG.code + '-คะแนนทั้งหมด.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-pc="csv"]')) csv(); });
  new MutationObserver(() => {
    const m = $('#main'); if (!m) return;
    const h = location.hash;
    if (h === '#teacher/scores' && !$('#prac-summary', m) && $('.teacher-shell', m)) { const tr = $('#track', m); (tr || m).insertAdjacentHTML(tr ? 'afterend' : 'beforeend', teacherSummary()); const ps = $('#prac-summary', m); if (ps && !$('#prepost-summary', m)) ps.insertAdjacentHTML('afterend', prepostTable()); if (tr && !$('#score-total', m)) tr.insertAdjacentHTML('beforebegin', totalTable()); }
    if (h === '#portfolio' && !$('#my-score', m) && m.firstElementChild) { const g = $('.pf-summary-grid', m), first = $(':scope > section.paper', m); if (g) g.insertAdjacentHTML('afterend', myScore()); else if (first) first.insertAdjacentHTML('afterend', myScore()); else m.insertAdjacentHTML('afterbegin', myScore()); }
  }).observe(document.documentElement, { childList: true, subtree: true });

  const mergeRemote = (id, obj) => {
    const u = store[id] || (store[id] = {});
    Object.entries(obj || {}).forEach(([n, r]) => { const c = u[n] || (u[n] = { best: 0, tries: 0, last: 0, battle: 0 }); c.best = Math.max(c.best, Number(r.best) || 0); c.tries = Math.max(c.tries, Number(r.tries) || 0); c.battle = Math.max(c.battle, Number(r.battle) || 0); if (!c.last) c.last = Number(r.last) || 0; if (r.pre !== null && r.pre !== undefined && (c.pre === undefined || c.pre === null)) c.pre = Number(r.pre); if (r.post !== null && r.post !== undefined && (c.post === undefined || c.post === null)) c.post = Number(r.post); if (r.reflect && !c.reflect) c.reflect = r.reflect; if (Array.isArray(r.miss)) c.miss = r.miss; });
    save();
  };
  const quizPool = n => shuffle([...P[n].battle, ...P[n].items.filter(x => x.t === 'choice')]).map(x => { const idx = shuffle(x.opts.map((_, i) => i)); return { q: x.q, opts: idx.map(i => x.opts[i]), ans: idx.indexOf(x.ans), why: x.why || '', fig: x.fig }; });
  const patch = (n, o) => { const x = rec(n); Object.assign(x, o); save(); if (window.DTCloud) window.DTCloud.pushPractice(n); return Object.assign({}, x); };
  const recordBattle = n => { const r = rec(n), first = !r.battle; r.battle = 1; r.battleAt = new Date().toISOString(); save(); if (window.DTCloud) window.DTCloud.pushPractice(n); return first; };
  window.DTPractice = {
    quizPool, recordBattle, csv, myGrowth, recOf: (id, n) => Object.assign({}, (store[id] || {})[n] || {}), WEAPONS, getWeapon, setWeapon, patch,
    mergeRemote, getRec: n => Object.assign({}, rec(n)), weights, parts: (pid, n) => partsOf(pid, D.course.chapters[n - 1], loadDb().subs),
    view, arena,
    done: n => { const r = (store[uid()] || {})[n]; return !!(r && r.best >= PASS); },
    passed: () => D.course.chapters.filter(c => window.DTPractice.done(c.number)).length,
    xp: () => D.course.chapters.reduce((s, c) => s + ((store[uid()] || {})[c.number] ? xpOf(c.number) : 0), 0),
    best: n => Math.round(((store[uid()] || {})[n] || {}).best || 0)
  };
})();
