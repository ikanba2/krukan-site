/* SECTOR 8 · สรุปทั้ง 7 บท + สอบปลายภาค 60 ข้อ (ตัวเลือกอย่างเดียว)
   - ข้อสอบจาก final-exam-data.js (สร้างจาก final_exam.py) ไม่มีเฉลยในหน้าเว็บ เซิร์ฟเวอร์ตรวจคะแนน
   - สุ่มลำดับข้อและลำดับตัวเลือกด้วยเลขสุ่มที่เซิร์ฟเวอร์ให้ตอนเริ่มสอบ (กลับมาทำต่อได้ลำดับเดิม)
   - นักเรียนทำได้ครั้งเดียว ครูรีเซ็ตให้ทำใหม่ได้ที่หน้าคะแนน › แท็บสอบปลายภาค
   - ครูและผู้เข้าชม: ทดลองทำได้ ตรวจคะแนนให้ดูแต่ไม่บันทึก
   - คำตอบที่เลือกเก็บในเครื่องทันที (ไฟดับหรือปิดหน้าแล้วกลับมาทำต่อได้) */
(function () {
  'use strict';
  const F = window.DT_FINAL; if (!F) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const A = () => window.DTApp, C = () => window.DTCloud;
  const TH = ['ก', 'ข', 'ค', 'ง'];
  const QS = F.questions, BY = Object.fromEntries(QS.map(q => [q.id, q]));
  const CH = F.summary;

  /* ---------- ผู้ใช้ ---------- */
  const isTeacher = () => !!(C() && C().isStaff && C().isStaff()) || !!document.querySelector('#header .tb.is-teacher');
  const isStudent = () => { const a = A(); return !!a && a.activeId !== 'guest' && !isTeacher(); };
  const prof = () => { const a = A(); return a && a.db.profiles[a.activeId]; };
  const cfgOpen = () => !!(A() && A().db.settings.finalOpen);
  const online = () => !!(C() && C().on);

  /* ---------- สุ่มแบบกำหนดเลขตั้งต้น (ได้ลำดับเดิมทุกครั้งจาก seed เดิม) ---------- */
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  const shuffle = (arr, r) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function paper(seed) {
    const order = shuffle(QS.map(q => q.id), rng(seed));
    const perm = {}; order.forEach(id => { perm[id] = shuffle([0, 1, 2, 3], rng(seed ^ hashStr(id))); });
    return { order, perm };
  }

  /* ---------- สถานะการทำข้อสอบ (เก็บในเครื่อง) ---------- */
  let S = null; /* { mode:'real'|'preview', seed, order, perm, ans:{id:ดัชนีต้นฉบับ}, flag:{}, cur, startedAt, key } */
  let result = null; /* ผลของโหมดทดลอง */
  let sending = false, sendErr = '';
  const lsKey = (p, seed) => `${window.DT_CFG.key}-final-${p.year || ''}-${p.number || ''}-${seed}`;
  const load = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const persist = () => { if (!S || !S.key) return; try { localStorage.setItem(S.key, JSON.stringify({ ans: S.ans, flag: S.flag, cur: S.cur })); } catch (e) { /* เก็บไม่ได้ */ } };
  function begin(mode, seed, startedAt) {
    const p = prof() || {}, key = mode === 'real' ? lsKey(p, seed) : '', saved = key ? load(key) : null, pp = paper(seed);
    S = { mode, seed, order: pp.order, perm: pp.perm, ans: (saved && saved.ans) || {}, flag: (saved && saved.flag) || {}, cur: (saved && saved.cur) || 0, startedAt: startedAt || new Date().toISOString(), key };
  }
  const answered = () => S ? S.order.filter(id => S.ans[id] !== undefined).length : 0;

  /* ---------- การ์ด SECTOR 8 ในหน้าแรก (ใช้ 2 ช่องที่เหลือของตาราง) ---------- */
  function card() {
    const f = isStudent() && prof() ? prof().final : null, open = cfgOpen();
    /* ป้ายสถานะสั้น ๆ มุมขวาบนของภาพ (ข้อความน้อย อ่านเร็วบนมือถือ) */
    let badge = `<span class="s8-badge">📝 สอบ ${QS.length} ข้อ · ครั้งเดียว</span>`;
    if (isTeacher()) badge = `<span class="s8-badge ${open ? 'go' : ''}">${open ? '🟢 เปิดสอบอยู่' : '🔒 ยังปิดสอบ'}</span>`;
    else if (f && f.status === 'done') badge = `<span class="s8-badge ok">✅ สอบแล้ว ${f.score}/${f.total}</span>`;
    else if (f && f.status === 'started') badge = '<span class="s8-badge go">⏳ ทำค้างไว้</span>';
    else if (isStudent() && !open) badge = '<span class="s8-badge">🔒 รอครูเปิดสอบ</span>';
    else if (isStudent()) badge = '<span class="s8-badge go">🟢 เปิดสอบแล้ว</span>';
    const cover = window.DT_IMG && window.DT_IMG.cover ? `<img src="${window.DT_IMG.cover('course')}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '';
    return `<div class="hm-card s8-card ${!open && !(f && f.status === 'done') ? 'is-lock' : ''}"><span class="hm-panel"><span class="hm-in"><span class="s8-art"><span class="s8-bg" aria-hidden="true">${cover}</span><span class="s8-no" aria-hidden="true"><small>SECTOR</small><b>${window.DT_CFG.finalNo}</b></span>${badge}</span><span class="s8-body"><small>ด่านสุดท้าย</small><strong>รวมพลังทั้ง ${CH.length} บท</strong><span class="s8-desc">สรุปทุกบท แล้วสอบปลายภาค ${QS.length} ข้อ</span><span class="s8-acts"><a class="btn secondary small" href="#final/summary">📚 อ่านสรุป</a><a class="btn small" href="#final/exam">📝 ทำข้อสอบ ›</a></span></span></span></span></div>`;
  }

  /* ---------- หน้า SECTOR 8 ---------- */
  let fetched = false;
  function view(arg) {
    const tab = arg === 'exam' ? 'exam' : 'summary';
    const tabs = `<nav class="s8-tabs" aria-label="ส่วนของ Sector ${window.DT_CFG.finalNo}"><a href="#final/summary" class="${tab === 'summary' ? 'on' : ''}">📚 สรุปทั้ง ${CH.length} บท</a><a href="#final/exam" class="${tab === 'exam' ? 'on' : ''}">📝 สอบปลายภาค ${QS.length} ข้อ</a></nav>`;
    return `<div class="crumbs"><a href="#home">‹ บทเรียนทั้งหมด</a></div><section class="s8-hero"><img class="s8-hero-techno" src="assets/techno-sword.webp" alt="" aria-hidden="true"><span class="s8-no big" aria-hidden="true"><small>SECTOR</small><b>${window.DT_CFG.finalNo}</b></span><div><span class="eyebrow">ด่านสุดท้าย · ${window.DT_CFG.short}</span><h1>สรุปและสอบปลายภาค</h1><p>อ่านสรุปสิ่งสำคัญของทั้ง ${CH.length} บท แล้วทำข้อสอบ ${QS.length} ข้อ ทุกข้อเป็นแบบเลือกตอบ 4 ตัวเลือก และส่วนใหญ่ให้คิดวิเคราะห์จากสถานการณ์</p></div></section>${tabs}<div id="s8-root">${tab === 'summary' ? summary() : exam()}</div>`;
  }
  function summary() {
    return `<section class="s8-sum">${CH.map(c => `<article class="s8-ch c${c.ch}"><header><span>บท ${c.ch}</span><h3>${esc(c.title)}</h3></header><ul>${c.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul><p class="s8-words">${c.words.map(w => `<i>${esc(w)}</i>`).join('')}</p><a class="s8-more" href="#chapter/${c.ch}/overview">ทบทวนบทนี้ ›</a></article>`).join('')}</section>
      <section class="paper s8-ready"><b>อ่านครบแล้ว พร้อมสอบหรือยัง</b><p>ข้อสอบ ${QS.length} ข้อ มีจากทุกบท บทละประมาณ ${Math.round(QS.length / CH.length)} ข้อ ลองอ่านสรุปของบทที่ยังไม่มั่นใจอีกรอบก่อนเริ่ม</p><a class="btn" href="#final/exam">📝 ไปที่ข้อสอบ ›</a></section>`;
  }
  const rules = `<ul class="s8-rules"><li>ข้อสอบมี <b>${QS.length} ข้อ</b> แบบเลือกตอบ 4 ตัวเลือก ถูกได้ข้อละ 1 คะแนน</li><li>ลำดับข้อและลำดับตัวเลือกของแต่ละคน<b>ไม่เหมือนกัน</b></li><li>เปลี่ยนคำตอบได้ทุกข้อจนกว่าจะกด "ส่งข้อสอบ" ระบบจำคำตอบไว้ ถ้าเผลอปิดหน้าจอ กลับมาทำต่อได้</li><li>อ่านให้ครบว่า <b>"เรื่องที่ถาม"</b> คืออะไร แล้วเลือกคำตอบที่มีเหตุผลดีที่สุด</li><li><b>ส่งได้ครั้งเดียว</b> ถ้าต้องสอบใหม่ ต้องให้ครูกดรีเซ็ตให้</li></ul>`;
  function exam() {
    if (isTeacher()) {
      if (S && S.mode === 'preview') return runner();
      if (result) return resultBox(result, true);
      return `<section class="paper s8-intro"><span class="eyebrow">โหมดครู · ดูตัวอย่าง</span><h2>ดูตัวอย่างข้อสอบปลายภาค</h2><p>ครูลองทำได้เหมือนนักเรียน ระบบตรวจคะแนนให้ดูแต่ไม่บันทึก ดูคะแนนของนักเรียน เปิดปิดการสอบ และรีเซ็ตได้ที่ <a href="#teacher/scores">หน้าคะแนน › แท็บ 🎓 สอบปลายภาค</a></p>${rules}<button type="button" class="btn" data-s8="preview">▶ เริ่มดูตัวอย่าง</button></section>`;
    }
    if (!isStudent()) {
      if (S && S.mode === 'preview') return runner();
      if (result) return resultBox(result, true);
      return `<section class="paper s8-intro"><span class="eyebrow">ผู้เข้าชม</span><h2>ทดลองทำข้อสอบปลายภาค</h2><p>ผู้เข้าชมทดลองทำได้ ระบบตรวจคะแนนให้ดูแต่ไม่บันทึก ถ้าเป็นนักเรียนและต้องการส่งคะแนนให้ครู ให้เข้าสู่ระบบก่อน</p>${rules}<div class="tools-flex"><button type="button" class="btn" data-s8="preview">▶ เริ่มทดลองทำ</button><a class="btn secondary" href="#entry">เข้าสู่ระบบนักเรียน</a></div></section>`;
    }
    const f = prof() && prof().final;
    if (f && f.status === 'done') return resultBox(f, false);
    if (S && S.mode === 'real') return runner();
    if (f && f.status === 'started') return `<section class="paper s8-intro"><span class="eyebrow">ทำค้างไว้</span><h2>กลับมาทำข้อสอบต่อ</h2><p>คุณเริ่มสอบไว้แล้วเมื่อ ${esc(thTime(f.startedAt))} คำตอบที่เลือกไว้ในเครื่องนี้ยังอยู่ กดทำต่อได้เลย</p><button type="button" class="btn" data-s8="start">▶ ทำข้อสอบต่อ</button>${sendErr ? `<p class="s8-err">${esc(sendErr)}</p>` : ''}</section>`;
    if (!cfgOpen()) return `<section class="paper s8-intro locked"><div class="lk-ic">🔒</div><h2>ครูยังไม่เปิดสอบปลายภาค</h2><p>ระหว่างรอ อ่านสรุปทั้ง ${CH.length} บท และทบทวนบทที่ยังไม่มั่นใจได้เลย เมื่อครูเปิดสอบ หน้านี้จะมีปุ่มเริ่มสอบ</p><div class="tools-flex"><a class="btn secondary" href="#final/summary">📚 อ่านสรุป</a><button type="button" class="btn secondary" data-s8="recheck">🔄 เช็กอีกครั้ง</button></div></section>`;
    return `<section class="paper s8-intro"><span class="eyebrow">พร้อมสอบ</span><h2>สอบปลายภาค ${QS.length} ข้อ</h2>${rules}<div class="s8-confirm" id="s8-confirm" hidden><b>ยืนยันเริ่มสอบนะ</b><p>เมื่อเริ่มแล้ว ระบบจะนับว่าคุณใช้สิทธิ์สอบ 1 ครั้ง และส่งคะแนนให้ครูเมื่อกดส่ง</p><button type="button" class="btn" data-s8="start">✅ เริ่มสอบเลย</button> <button type="button" class="btn secondary" data-s8="cancel">ยังก่อน</button></div><button type="button" class="btn" data-s8="ask" id="s8-ask">▶ เริ่มสอบ</button>${sendErr ? `<p class="s8-err">${esc(sendErr)}</p>` : ''}</section>`;
  }
  const thTime = d => { try { return new Date(d).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' น.'; } catch (e) { return d || ''; } };

  /* ---------- ห้องสอบ ---------- */
  function runner() {
    const id = S.order[S.cur], q = BY[id], perm = S.perm[id], n = S.order.length, done = answered(), left = n - done, flags = S.order.filter(x => S.flag[x]).length, has = S.ans[id] !== undefined;
    const fig = q.fig && F.figs && F.figs[q.fig] && window.DT_IMG ? `<figure class="s8-fig"><img src="${window.DT_IMG.url(F.figs[q.fig], 900)}" alt="ภาพประกอบข้อ ${S.cur + 1}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').remove()"></figure>` : '';
    const tbl = q.tbl ? `<div class="table-wrap s8-tbl"><table><thead><tr>${q.tbl[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${q.tbl.slice(1).map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
    const nb = nextBlank(), last = S.cur === n - 1;
    const fwd = has ? (last ? (left ? `<button type="button" class="btn" data-s8="blank">ไปข้อที่ยังไม่ทำ ›</button>` : `<button type="button" class="btn green" data-s8="submit-ask">📤 ตรวจทานและส่ง</button>`) : `<button type="button" class="btn" data-s8="next">ข้อถัดไป ›</button>`)
      : `<button type="button" class="btn secondary s8-skip" data-s8="${last ? 'blank' : 'next'}" ${last && left <= 1 ? 'disabled' : ''}>ข้ามข้อนี้ไปก่อน ›</button>`;
    const vis = (qid, i) => S.filter === 'blank' ? S.ans[qid] === undefined : S.filter === 'flag' ? !!S.flag[qid] : true;
    const cells = S.order.map((qid, i) => vis(qid, i) ? `<button type="button" data-s8-go="${i}" class="${S.ans[qid] !== undefined ? 'ok' : 'no'} ${S.flag[qid] ? 'fl' : ''} ${i === S.cur ? 'now' : ''}" aria-label="ข้อ ${i + 1} ${S.ans[qid] !== undefined ? 'ตอบแล้ว' : 'ยังไม่ทำ'}${S.flag[qid] ? ' ทำเครื่องหมายไว้' : ''}">${i + 1}</button>` : '').join('');
    return `<section class="s8-run">
      <div class="s8-bar"><span class="s8-mode ${S.mode}">${S.mode === 'preview' ? '🧪 โหมดทดลอง · ไม่บันทึก' : '📝 สอบจริง'}</span>
        <span class="s8-stat"><b class="ok">${done}</b> ตอบแล้ว</span><button type="button" class="s8-stat warn" data-s8="blank" ${left ? '' : 'disabled'} title="ไปข้อที่ยังไม่ทำ"><b>${left}</b> ยังไม่ทำ</button>${flags ? `<button type="button" class="s8-stat fl" data-s8-filter="flag"><b>${flags}</b> ⭐</button>` : ''}
        <i class="s8-prog" aria-hidden="true"><u style="width:${Math.round(done / n * 100)}%"></u></i><span class="s8-time" id="s8-time" title="เวลาที่ใช้">⏱ ${elapsed()}</span>
        <button type="button" class="btn small green" data-s8="submit-ask">📤 ส่งข้อสอบ</button></div>
      <div class="s8-layout">
      <article class="s8-q" aria-live="polite"><header><span class="s8-qno">ข้อ ${S.cur + 1}<small>/${n}</small></span><span class="s8-st ${has ? 'ok' : 'no'}">${has ? '✓ ตอบแล้ว' : '○ ยังไม่ได้ตอบ'}</span><button type="button" class="s8-flag ${S.flag[id] ? 'on' : ''}" data-s8="flag" aria-pressed="${!!S.flag[id]}" title="ทำเครื่องหมายไว้กลับมาดูอีกครั้ง">${S.flag[id] ? '⭐ ทำเครื่องหมายไว้' : '☆ ทำเครื่องหมายไว้ทบทวน'}</button></header>
        <p class="s8-ctx">เรื่องที่ถาม: ${esc(q.ctx)}</p>
        <h2>${esc(q.q)}</h2>${tbl}${fig}
        <div class="s8-opts" role="radiogroup" aria-label="ตัวเลือกข้อ ${S.cur + 1}">${perm.map((o, k) => `<button type="button" role="radio" aria-checked="${S.ans[id] === o}" class="s8-opt ${S.ans[id] === o ? 'on' : ''}" data-s8-opt="${o}"><b>${TH[k]}</b><span>${esc(q.opts[o])}</span></button>`).join('')}</div>
        <div class="s8-nav"><button type="button" class="btn secondary" data-s8="prev" ${S.cur === 0 ? 'disabled' : ''}>‹ ข้อก่อนหน้า</button>${has ? '<button type="button" class="s8-clear" data-s8="clear">ล้างคำตอบข้อนี้</button>' : '<span></span>'}${fwd}</div>
        <p class="s8-keys">ปุ่มลัด: กด 1–4 เพื่อเลือก ก–ง · ลูกศร ‹ › เพื่อเปลี่ยนข้อ</p>
      </article>
      <aside class="s8-side" aria-label="แผนที่ข้อสอบ"><div class="s8-side-h"><b>🗺️ แผนที่ข้อสอบ</b><small>แตะเลขข้อเพื่อไปข้อนั้น</small></div>
        <div class="s8-filter" role="tablist">${[['all', 'ทั้งหมด ' + n], ['blank', 'ยังไม่ทำ ' + left], ['flag', '⭐ ' + flags]].map(([k, t]) => `<button type="button" role="tab" aria-selected="${(S.filter || 'all') === k}" class="${(S.filter || 'all') === k ? 'on' : ''}" data-s8-filter="${k}">${t}</button>`).join('')}</div>
        <div class="s8-grid">${cells || `<p class="s8-empty">${S.filter === 'blank' ? '🎉 ตอบครบทุกข้อแล้ว' : 'ยังไม่มีข้อที่ทำเครื่องหมายไว้'}</p>`}</div>
        <div class="s8-legend"><span><i class="ok"></i>ตอบแล้ว</span><span><i class="no"></i>ยังไม่ทำ</span><span><i class="fl"></i>ทำเครื่องหมาย</span><span><i class="now"></i>ข้อที่เปิดอยู่</span></div>
        ${nb >= 0 ? `<button type="button" class="btn secondary small s8-nb" data-s8="blank">ไปข้อที่ยังไม่ทำถัดไป (ข้อ ${nb + 1}) ›</button>` : `<p class="s8-allok">✅ ตอบครบ ${QS.length} ข้อแล้ว ตรวจทานแล้วกดส่งได้เลย</p>`}
        <p class="s8-saved">${S.mode === 'real' ? '💾 ระบบจำคำตอบไว้ในเครื่องนี้ทุกครั้งที่เลือก' : '🧪 โหมดทดลอง คำตอบไม่ถูกเก็บ'}</p></aside>
      </div>
      <div class="s8-modal" id="s8-sub" hidden><div class="s8-mbox" role="dialog" aria-modal="true" aria-labelledby="s8-subh"><h3 id="s8-subh">ตรวจทานก่อนส่ง</h3><div id="s8-subtxt"></div><div class="tools-flex"><button type="button" class="btn green" data-s8="submit">✅ ยืนยันส่งข้อสอบ</button><button type="button" class="btn secondary" data-s8="submit-no">กลับไปทำต่อ</button></div><p class="s8-err" id="s8-suberr">${esc(sendErr)}</p></div></div>
    </section>`;
  }
  /* ข้อที่ยังไม่ทำถัดจากข้อปัจจุบัน (วนกลับไปต้นชุด) · -1 = ทำครบแล้ว */
  function nextBlank() { const n = S.order.length; for (let k = 1; k <= n; k++) { const i = (S.cur + k) % n; if (S.ans[S.order[i]] === undefined) return i; } return -1; }
  function elapsed() { const s = Math.max(0, Math.floor((Date.now() - new Date(S.startedAt).getTime()) / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ' ชม. ' : '') + m + ' นาที'; }
  setInterval(() => { const t = $('#s8-time'); if (t && S) t.textContent = '⏱ ' + elapsed(); }, 20000);
  function draw() { const r = $('#s8-root'); if (r && location.hash !== '#final/summary' && location.hash !== '#final') r.innerHTML = exam(); }
  function go(i) { S.cur = Math.max(0, Math.min(S.order.length - 1, i)); persist(); draw(); const q = $('.s8-q'); if (q && q.getBoundingClientRect().top < 0) q.scrollIntoView({ block: 'start' }); }

  /* ---------- ผลสอบ ---------- */
  function resultBox(f, preview) {
    const pct = f.total ? Math.round(f.score / f.total * 100) : 0;
    const msg = pct >= 80 ? '🏆 ยอดเยี่ยม! เข้าใจทั้งวิชาอย่างมั่นคง' : pct >= 65 ? '🌟 ดีมาก เข้าใจเกือบทุกเรื่อง' : pct >= 50 ? '👍 ผ่านครึ่งทางแล้ว ทบทวนบทที่ได้น้อยอีกนิด' : '💪 ยังมีหลายเรื่องที่ควรทบทวน ลองอ่านสรุปของบทที่ได้น้อย';
    const rows = CH.map(c => { const v = (f.perChapter || {})[c.ch] || [0, 0], p = v[1] ? Math.round(v[0] / v[1] * 100) : 0; return `<li class="${p < 60 ? 'weak' : ''}"><span>บท ${c.ch} · ${esc(c.title)}</span><i><u style="width:${p}%"></u></i><b>${v[0]}/${v[1]}</b>${p < 60 ? `<a href="#chapter/${c.ch}/overview">ทบทวน ›</a>` : '<em>✓</em>'}</li>`; }).join('');
    return `<section class="paper s8-result"><div class="s8-score" style="--p:${pct}%"><b>${f.score}</b><small>/ ${f.total}</small></div><div class="s8-rbody"><span class="eyebrow">${preview ? 'ผลทดลองทำ (ไม่บันทึก)' : 'ผลสอบปลายภาค' + (f.attempt > 1 ? ' · ครั้งที่ ' + f.attempt : '')}</span><h2>${msg}</h2><p>${preview ? 'นี่คือผลจากโหมดทดลอง ระบบไม่ได้บันทึกคะแนน' : `ส่งเมื่อ ${esc(thTime(f.finishedAt))} · <b>ครูเห็นคะแนนนี้แล้ว</b> · ถ้าต้องการสอบใหม่ ต้องให้ครูรีเซ็ตให้`}</p><p class="s8-pct">คิดเป็น <b>${pct}%</b></p></div><ul class="s8-bych">${rows}</ul>${preview ? '<button type="button" class="btn secondary" data-s8="again">↺ ทดลองทำอีกครั้ง</button>' : ''}</section>`;
  }

  /* ---------- การกดปุ่ม ---------- */
  async function start() {
    sendErr = '';
    if (!online()) { sendErr = 'ต้องเชื่อมต่อระบบออนไลน์ก่อนจึงจะสอบได้'; draw(); return; }
    const done = A().busy('กำลังเตรียมข้อสอบ…');
    try {
      const f = await C().finalStart(); const p = prof(); if (p) p.final = f; A().save();
      if (f.status === 'done') { S = null; draw(); return; }
      begin('real', f.seed, f.startedAt); draw(); window.scrollTo(0, 0);
    } catch (e) { sendErr = (e && e.message) || 'เริ่มสอบไม่สำเร็จ ลองใหม่อีกครั้ง'; draw(); }
    finally { done(); }
  }
  async function submit() {
    if (sending) return; sending = true; sendErr = '';
    const btn = $('[data-s8="submit"]'); if (btn) { btn.disabled = true; btn.textContent = '⏳ กำลังส่ง…'; }
    try {
      if (S.mode === 'preview') {
        let r;
        if (online()) r = await C().finalPreview(S.ans);
        else r = { score: 0, total: S.order.length, perChapter: {}, offline: true };
        result = Object.assign({ attempt: 1 }, r); S = null; draw(); window.scrollTo(0, 0);
      } else {
        const f = await C().finalSubmit(S.ans), p = prof(); if (p) p.final = f; A().save();
        try { localStorage.removeItem(S.key); } catch (e) { /* ไม่เป็นไร */ }
        S = null; draw(); window.scrollTo(0, 0); A().notify('ส่งข้อสอบแล้ว ได้ ' + f.score + '/' + f.total + ' คะแนน');
      }
    } catch (e) {
      sendErr = ((e && e.message) || 'ส่งไม่สำเร็จ') + ' · คำตอบยังอยู่ครบ กดส่งอีกครั้งได้';
      const er = $('#s8-suberr'); if (er) er.textContent = sendErr; if (btn) { btn.disabled = false; btn.textContent = '✅ ส่งข้อสอบ'; }
    } finally { sending = false; }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-s8],[data-s8-opt],[data-s8-go],[data-s8-filter],[data-s8-jump]'); if (!b || !$('#s8-root')) return;
    if (b.dataset.s8Filter && S) { S.filter = b.dataset.s8Filter; draw(); return; }
    if (b.dataset.s8Jump !== undefined && S) { go(+b.dataset.s8Jump); return; }
    if (b.dataset.s8Opt !== undefined && S) { const id = S.order[S.cur]; S.ans[id] = +b.dataset.s8Opt; persist(); draw(); return; }
    if (b.dataset.s8Go !== undefined && S) { go(+b.dataset.s8Go); return; }
    const a = b.dataset.s8;
    if (a === 'ask') { $('#s8-confirm').hidden = false; b.hidden = true; return; }
    if (a === 'cancel') { $('#s8-confirm').hidden = true; $('#s8-ask').hidden = false; return; }
    if (a === 'start') { start(); return; }
    if (a === 'preview' || a === 'again') { result = null; begin('preview', 1 + Math.floor(Math.random() * 2e9)); draw(); window.scrollTo(0, 0); return; }
    if (a === 'recheck') { refreshMine(true); return; }
    if (!S) return;
    if (a === 'prev') go(S.cur - 1);
    else if (a === 'next') go(S.cur + 1);
    else if (a === 'blank') { const i = nextBlank(); if (i >= 0) go(i); }
    else if (a === 'clear') { delete S.ans[S.order[S.cur]]; persist(); draw(); }
    else if (a === 'flag') { const id = S.order[S.cur]; if (S.flag[id]) delete S.flag[id]; else S.flag[id] = 1; persist(); draw(); }
    else if (a === 'submit-ask') {
      const blanks = S.order.map((q, i) => S.ans[q] === undefined ? i : -1).filter(i => i >= 0), fls = S.order.map((q, i) => S.flag[q] ? i : -1).filter(i => i >= 0), m = $('#s8-sub');
      const chips = (arr, cls) => `<div class="s8-chips">${arr.map(i => `<button type="button" class="${cls}" data-s8-jump="${i}">${i + 1}</button>`).join('')}</div>`;
      $('#s8-subtxt').innerHTML = `<div class="s8-sumrow"><span class="ok"><b>${S.order.length - blanks.length}</b>ตอบแล้ว</span><span class="${blanks.length ? 'warn' : 'ok'}"><b>${blanks.length}</b>ยังไม่ทำ</span><span><b>${fls.length}</b>⭐ ทำเครื่องหมาย</span></div>`
        + (blanks.length ? `<p><b>ข้อที่ยังไม่ได้ทำ</b> (ไม่ตอบได้ 0 คะแนน) แตะเลขข้อเพื่อกลับไปทำ</p>${chips(blanks, 'no')}` : `<p>👍 ตอบครบทั้ง ${QS.length} ข้อแล้ว</p>`)
        + (fls.length ? `<p><b>ข้อที่ทำเครื่องหมายไว้</b></p>${chips(fls, 'fl')}` : '')
        + (S.mode === 'real' ? '<p class="s8-warnline">⚠️ ส่งแล้วแก้คำตอบไม่ได้ และครูจะเห็นคะแนนทันที</p>' : '');
      m.hidden = false; $('[data-s8="submit"]', m).focus();
    }
    else if (a === 'submit-no') $('#s8-sub').hidden = true;
    else if (a === 'submit') submit();
  });
  document.addEventListener('keydown', e => {
    if (!S || !$('.s8-run') || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '') || !$('#s8-sub').hidden) return;
    const k = { '1': 0, '2': 1, '3': 2, '4': 3 }[e.key];
    if (k !== undefined) { const id = S.order[S.cur]; S.ans[id] = S.perm[id][k]; persist(); draw(); }
    else if (e.key === 'ArrowRight') go(S.cur + 1); else if (e.key === 'ArrowLeft') go(S.cur - 1);
  });

  /* ดึงสถานะล่าสุดจากเซิร์ฟเวอร์ (ครูเปิด/ปิด รีเซ็ต) เมื่อเข้าหน้า Sector 8 */
  async function refreshMine(force) {
    if (!isStudent() || !online() || (fetched && !force)) return;
    fetched = true;
    try { const r = await C().finalMine(), p = prof(); A().db.settings.finalOpen = !!r.open; if (p) p.final = r.final; A().save(); if (!S) draw(); }
    catch (e) { if (force) A().notify('เช็กสถานะไม่สำเร็จ ลองใหม่อีกครั้ง'); }
  }
  function mount() {
    refreshMine(false);
    if (isStudent() && !S) { const f = prof() && prof().final; if (f && f.status === 'started' && location.hash === '#final/exam') begin('real', f.seed, f.startedAt), draw(); }
  }
  window.addEventListener('hashchange', () => { if (!/^#final/.test(location.hash)) fetched = false; });

  /* ---------- หน้าครู: คะแนนสอบปลายภาค (แท็บในหน้าคะแนน) ---------- */
  const nameOf = p => /^เลขที่/.test(p.name || '') || !p.name ? 'เลขที่ ' + p.number : p.number + ' · ' + p.name;
  let armed = '';
  function teacherBox() {
    const db = A().db, open = !!db.settings.finalOpen, finals = db.finals || [];
    const studs = Object.values(db.profiles).filter(p => p.id !== 'guest' && String(p.year || db.settings.year) === String(db.settings.year)).sort((a, b) => Number(a.number) - Number(b.number));
    const byNo = Object.fromEntries(finals.map(f => [String(f.number), f]));
    const done = finals.filter(f => f.status === 'done'), sc = done.map(f => f.score);
    const avg = sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length * 10) / 10 : '–';
    const missCnt = {}; done.forEach(f => (f.miss || []).forEach(q => { missCnt[q] = (missCnt[q] || 0) + 1; }));
    const hard = Object.entries(missCnt).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const st = f => !f || f.status === 'reset' ? '<span class="sc-none">ยังไม่สอบ</span>' : f.status === 'started' ? '<span class="s8-tag go">กำลังทำ</span>' : '<span class="s8-tag ok">ส่งแล้ว</span>';
    const rows = studs.map(p => { const f = byNo[String(p.number)], d = f && f.status === 'done'; return `<tr><th scope="row">${esc(nameOf(p))}</th><td>${st(f)}</td><td class="n">${d ? `<b>${f.score}</b>` : '–'}</td><td class="n">${d ? Math.round(f.score / f.total * 100) + '%' : '–'}</td>${CH.map(c => { const v = d && f.perChapter[c.ch]; return `<td class="n">${v ? v[0] + '/' + v[1] : '–'}</td>`; }).join('')}<td>${f && f.finishedAt ? esc(thTime(f.finishedAt)) : f && f.startedAt ? 'เริ่ม ' + esc(thTime(f.startedAt)) : '–'}</td><td>${f && f.status !== 'reset' ? `<button type="button" class="btn secondary small s8-reset ${armed === String(p.number) ? 'armed' : ''}" data-s8-reset="${esc(p.number)}" data-year="${esc(p.year || db.settings.year)}">${armed === String(p.number) ? '⚠️ กดอีกครั้งเพื่อยืนยัน' : '↺ รีเซ็ต'}</button>` : ''}</td></tr>`; }).join('');
    return `<section class="paper" id="final-summary"><div class="db-h"><div><span class="eyebrow">SECTOR ${window.DT_CFG.finalNo}</span><h2>คะแนนสอบปลายภาค (${QS.length} ข้อ)</h2></div></div>
      <div class="s8-tset"><label class="s8-switch"><input type="checkbox" data-s8-open ${open ? 'checked' : ''}><span></span><b>${open ? '🟢 เปิดให้นักเรียนสอบอยู่' : '🔒 ปิดการสอบอยู่'}</b></label><small>เปิดเมื่อพร้อมสอบ ปิดเมื่อหมดเวลาสอบ · นักเรียนอ่านสรุปได้ตลอด · <a href="#final/exam">ดูตัวอย่างข้อสอบ ›</a> · เฉลยฉบับครูอยู่ในไฟล์ ข้อสอบปลายภาค_${window.DT_CFG.code}_เฉลย.md</small></div>
      <div class="sc-kpi"><div><small>ส่งแล้ว</small><b>${done.length}<small>/${studs.length}</small></b></div><div><small>คะแนนเฉลี่ย</small><b>${avg}<small>/${QS.length}</small></b></div><div><small>สูงสุด</small><b>${sc.length ? Math.max(...sc) : '–'}</b></div><div><small>ต่ำสุด</small><b>${sc.length ? Math.min(...sc) : '–'}</b></div></div>
      <div class="table-wrap"><table class="sc-table detail"><thead><tr><th>นักเรียน</th><th>สถานะ</th><th>คะแนน<small>/${QS.length}</small></th><th>%</th>${CH.map(c => `<th title="${esc(c.title)}">บท ${c.ch}</th>`).join('')}<th>เวลา</th><th>จัดการ</th></tr></thead><tbody>${rows || '<tr><td colspan="13">ยังไม่มีรายชื่อนักเรียน</td></tr>'}</tbody></table></div>
      <p class="muted s8-note">รีเซ็ต = ลบผลสอบของนักเรียนคนนั้น ให้เริ่มทำใหม่ได้อีก 1 ครั้ง (ผลเดิมถูกบันทึกไว้ในประวัติของระบบ) ถ้าไม่รีเซ็ต นักเรียนสอบซ้ำไม่ได้</p>
      ${hard.length ? `<div class="s8-hard"><b>5 ข้อที่นักเรียนตอบผิดมากที่สุด</b><ol>${hard.map(([q, n]) => { const x = BY[q]; return `<li><span class="db-pct" style="--p:${Math.round(n / done.length * 100)}%">${Math.round(n / done.length * 100)}%</span><div><b>${esc(x ? x.q : q)}</b><small>${q} · บทที่ ${x ? x.ch : '?'} · ${esc(x ? x.ctx : '')} · ผิด ${n} จาก ${done.length} คน</small></div></li>`; }).join('')}</ol></div>` : ''}
    </section>`;
  }
  document.addEventListener('change', async e => {
    const t = e.target.closest('[data-s8-open]'); if (!t) return;
    const want = t.checked;
    try { await C().saveConfig({ finalOpen: want }); A().notify(want ? 'เปิดสอบปลายภาคแล้ว' : 'ปิดสอบปลายภาคแล้ว'); }
    catch (er) { t.checked = !want; A().notify('บันทึกไม่สำเร็จ: ' + ((er && er.message) || '')); }
    rebuildTeacher();
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-s8-reset]'); if (!b) return;
    const no = b.dataset.s8Reset;
    if (armed !== no) { armed = no; rebuildTeacher(); setTimeout(() => { if (armed === no) { armed = ''; rebuildTeacher(); } }, 5000); return; }
    armed = '';
    const done = A().busy('กำลังรีเซ็ตผลสอบ…');
    try { await C().finalReset(b.dataset.year, no); await C().refresh(); A().notify('รีเซ็ตแล้ว เลขที่ ' + no + ' เริ่มสอบใหม่ได้'); }
    catch (er) { A().notify('รีเซ็ตไม่สำเร็จ: ' + ((er && er.message) || '')); }
    finally { done(); rebuildTeacher(); }
  });
  function rebuildTeacher() { const old = $('#final-summary'); if (!old) return; const hidden = old.hidden; const tmp = document.createElement('div'); tmp.innerHTML = teacherBox(); const nw = tmp.firstElementChild; nw.hidden = hidden; old.replaceWith(nw); }
  new MutationObserver(() => {
    if (location.hash !== '#teacher/scores') return;
    const m = $('#main'), anchor = m && ($('#prepost-summary', m) || $('#prac-summary', m)); if (!anchor || $('#final-summary', m)) return;
    anchor.insertAdjacentHTML('afterend', teacherBox());
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.DTFinal = { card, view, mount, teacherBox };
})();
