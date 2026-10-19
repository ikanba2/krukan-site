/* แบ่งหน้าที่ยาวเกินเป็นส่วน ๆ (ไม่ให้ต่อกันลงไปด้านล่างจนยาว)
   1) แท็บย่อยในหน้า: "ข้อมูลของฉัน" (ภารกิจ / กระเป๋าไอเทม) · ครู-ภาพรวม (คะแนนด่านฝึก / ก่อน–หลังเรียน / ชิ้นงาน / ติดตาม) · ครู-ห้องและรายชื่อ
   2) ทดสอบก่อน/หลังเรียน: ทำทีละข้อ มีจุดบอกความคืบหน้า แทนการแสดง 4 ข้อเรียงยาว */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mem = {}; /* จำแท็บที่เลือกต่อหน้า ระหว่างกดเปลี่ยนหน้า */
  const short = t => String(t || '').replace(/\(.*?\)/g, '').trim().slice(0, 28);

  function tabify(key, host, sections, labels) {
    if (!host || sections.length < 2) return;
    const sig = sections.map(s => s.id || s.className).join('|');
    if (host.dataset.tabbed === sig) return;
    $$(':scope > .sub-tabs', host).forEach(x => x.remove());
    host.dataset.tabbed = sig;
    const bar = document.createElement('nav'); bar.className = 'sub-tabs'; bar.setAttribute('role', 'tablist');
    let cur = Math.min(mem[key] || 0, sections.length - 1);
    const show = i => { cur = i; mem[key] = i; sections.forEach((s, k) => { s.hidden = k !== i; }); $$('button', bar).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); }); };
    sections.forEach((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = labels[i] || short((s.querySelector('h2,h3') || {}).textContent) || ('ส่วนที่ ' + (i + 1)); b.onclick = () => { show(i); bar.scrollIntoView({ block: 'nearest' }); }; bar.append(b); });
    sections[0].before(bar); show(cur);
  }

  function apply() {
    const h = location.hash, main = $('#main'); if (!main) return;
    if (h === '#me') {
      const secs = $$(':scope > .pf-sec', main);
      tabify('me', main, secs, ['🎯 ภารกิจของฉัน', '📈 พัฒนาการ', '🎒 กระเป๋าไอเทม']);
    }
    if (h === '#teacher/scores') {
      const col = $('.teacher-shell > div:last-child', main) || $('.teacher-shell > div', main); if (!col) return;
      const secs = $$(':scope > .paper, :scope > section.paper, :scope > .stats', col).filter(s => !s.classList.contains('teacher-title'));
      const papers = secs.filter(s => s.classList.contains('paper'));
      tabify('t-over', col, papers, papers.map(p => p.id === 'track' ? '📝 คะแนนชิ้นงาน' : p.id === 'prac-summary' ? '🎮 คะแนนด่านฝึก' : p.id === 'prepost-summary' ? '📈 ก่อน–หลังเรียน' : p.id === 'final-summary' ? '🎓 สอบปลายภาค' : p.id === 'score-total' ? '🏆 คะแนนรวม' : '📄 ' + short((p.querySelector('h2,h3') || {}).textContent)));
    }
    if (h === '#teacher/roster') {
      const col = $('.teacher-shell > div:last-child', main); if (!col) return;
      tabify('t-roster', col, $$(':scope > .paper', col), []);
    }
    $$('form[data-pp-form="pre"], form[data-pp-form="post"]').forEach(stepper);
    /* แถบแท็บของบทเลื่อนข้างได้: เลื่อนให้แท็บปัจจุบันอยู่กลาง (ไม่ใช้ scrollIntoView เพราะจะเลื่อนหน้าแม่ใน Google Sites) */
    const tb = $('nav.tabs', main), curT = tb && $('a.current', tb);
    if (tb && curT && tb.scrollWidth > tb.clientWidth && tb.dataset.centered !== curT.getAttribute('href')) { tb.dataset.centered = curT.getAttribute('href'); tb.scrollLeft = curT.offsetLeft - (tb.clientWidth - curT.offsetWidth) / 2; }
  }

  /* ---------- ทำทีละข้อ ---------- */
  function stepper(f) {
    if (f.dataset.stepped) return; f.dataset.stepped = '1';
    const sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    { const list = $$(':scope > .pp-q', f), anchor = list[0] && list[0].previousSibling; sh(list.slice()).forEach(q => f.insertBefore(q, $('.pp-err', f))); list.forEach(q => { const box = $('.pp-opts', q); if (box) sh($$(':scope > .pp-opt', box)).forEach(o => box.append(o)); const no = $('.pp-no', q); }); }
    const qs = $$(':scope > .pp-q', f), submit = $('button[type="submit"]', f), err = $('.pp-err', f); if (qs.length < 2) return;
    const nav = document.createElement('div'); nav.className = 'pp-nav';
    nav.innerHTML = `<button type="button" class="btn secondary small" data-pp-prev>‹ ข้อก่อนหน้า</button><span class="pp-dots">${qs.map((_, i) => `<i data-pp-go="${i}" title="ข้อ ${i + 1}"></i>`).join('')}</span><button type="button" class="btn small" data-pp-next>ข้อถัดไป ›</button>`;
    qs[qs.length - 1].after(nav);
    let cur = 0;
    const answered = i => !!$(`input:checked`, qs[i]);
    const go = i => {
      cur = Math.max(0, Math.min(qs.length - 1, i)); qs.forEach((q, k) => { q.hidden = k !== cur; });
      $$('.pp-dots i', nav).forEach((d, k) => { d.className = (k === cur ? 'now ' : '') + (answered(k) ? 'ok' : ''); });
      $('[data-pp-prev]', nav).disabled = cur === 0; $('[data-pp-next]', nav).hidden = cur === qs.length - 1;
      const all = qs.every((_, k) => answered(k)); submit.hidden = !(cur === qs.length - 1 || all);
      if (err) err.textContent = '';
    };
    nav.addEventListener('click', e => { const t = e.target.closest('[data-pp-prev],[data-pp-next],[data-pp-go]'); if (!t) return; if (t.dataset.ppGo !== undefined) go(+t.dataset.ppGo); else go(cur + (t.hasAttribute('data-pp-next') ? 1 : -1)); });
    f.addEventListener('change', e => { if (!e.target.matches('input[type="radio"]')) return; go(cur); /* ไม่เลื่อนข้อเอง ให้นักเรียนตรวจ/แก้แล้วกด "ข้อถัดไป" เอง */ });
    /* ส่งไม่ครบ: พาไปข้อแรกที่ยังไม่ตอบ */
    submit.addEventListener('click', () => { const miss = qs.findIndex((_, k) => !answered(k)); if (miss >= 0) setTimeout(() => go(miss), 0); });
    qs.forEach((q, i) => { const no = $('.pp-no', q); if (no) no.textContent = i + 1; $$('.pp-opt b', q).forEach((b, k) => { b.textContent = 'กขคง'[k]; }); });
    go(0);
  }

  /* ทำสีคำนำหน้าให้แยกจากเนื้อโจทย์: "คำถามเรื่อง...:" "เรื่องที่ถาม:" "พื้นฐานก่อนเรียน:" */
  const PRE = /^(\s*[“"]?)(คำถามเรื่อง[^:：]{0,40}|เรื่องที่ถาม|พื้นฐานก่อนเรียน)\s*[:：]\s*/;
  function tagPrefix() {
    $$('.prac-q, .prac-ctx, .pp-ctx, .pp-qt, .lesson .muted small, .gate-card h3').forEach(el => {
      if (el.dataset.tagged) return; el.dataset.tagged = '1';
      const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!tn) return;
      const m = PRE.exec(tn.textContent); if (!m) return;
      const span = document.createElement('span'); span.className = 'q-topic' + (/เรื่องที่ถาม/.test(m[2]) ? ' ctx' : /พื้นฐาน/.test(m[2]) ? ' pre' : '');
      span.textContent = m[2].replace(/^คำถาม/, '');
      tn.textContent = tn.textContent.slice(m[0].length); el.insertBefore(span, tn);
    });
  }
  let t = 0;
  new MutationObserver(() => { tagPrefix(); clearTimeout(t); t = setTimeout(apply, 40); }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(apply, 60));
})();
