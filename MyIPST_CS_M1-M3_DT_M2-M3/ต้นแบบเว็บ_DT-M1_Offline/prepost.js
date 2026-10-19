/* ทดสอบก่อนเรียน › เรียน › ทดสอบหลังเรียน › สะท้อนคิด ราย 7 บท
   ผลเก็บในระเบียนเดียวกับด่านฝึก (DTPractice.patch) จึงซิงก์ขึ้น Drive/Sheet และขึ้นตารางครูอัตโนมัติ
   ก่อนเรียนไม่เฉลยและบันทึกครั้งแรกครั้งเดียว (ไม่ให้แก้ย้อนหลัง) หลังเรียนเฉลยพร้อมเหตุผลและทำใหม่ได้ */
(function () {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = () => window.DT_DATA, PP = () => window.DT_PREPOST, RF = () => window.DT_REFLECT, A = () => window.DTApp, P = () => window.DTPractice;
  const retake = {};
  const has = v => v !== undefined && v !== null;
  const me = () => A().db.profiles[A().activeId];

  function qBlock(kind, items, prev) {
    return items.map((it, i) => `<fieldset class="pp-q"><legend><span class="pp-no">${i + 1}</span><span class="pp-ctx">${esc(it.ctx)}</span></legend><p class="pp-qt">${esc(it.q)}</p>${window.DTQF?window.DTQF.html(it.fig):''}
      <div class="pp-opts">${it.opts.map((o, j) => `<label class="pp-opt"><input type="radio" name="pp-${kind}-${i}" value="${j}" ${prev && prev[i] === j ? 'checked' : ''}><span><b>${'กขคง'[j]}</b>${esc(o)}</span></label>`).join('')}</div></fieldset>`).join('');
  }
  function feedback(items, ans) {
    return items.map((it, i) => { const ok = ans[i] === it.ans; return `<div class="pp-fb ${ok ? 'ok' : 'no'}"><b>${i + 1}. ${ok ? '✓ ถูก' : '✗ ยังไม่ถูก'}</b> <span>${esc(it.q)}</span><p><b>คำตอบที่ถูกคือ:</b> ${esc(it.opts[it.ans])}</p><p>${esc(it.why)}</p>${ok ? '' : `<p class="pp-yours">คำตอบของเรา: ${has(ans[i]) ? esc(it.opts[ans[i]]) : '(ไม่ได้ตอบ)'}</p>`}</div>`; }).join('');
  }
  const bar = (label, pct, cls) => `<div class="pp-bar ${cls}"><span>${label}</span><i style="width:${Math.max(3, pct)}%"></i><b>${Math.round(pct)}%</b></div>`;

  function ctxOf(c) {
    const n = c.number, data = PP()[n], r = P().getRec(n), guest = A().activeId === 'guest';
    const readAll = c.modules.length > 0 && c.modules.every(m => me().read.includes(m.id));
    return { n, data, r, guest, T: data.pre.length, preDone: has(r.pre), postDone: has(r.post), unlocked: readAll || r.tries > 0 };
  }
  const guestNote = g => g ? '<p class="inline-note">ตอนนี้เป็นโหมดผู้ชม ผลจะเก็บในเครื่องนี้เท่านั้น ถ้าต้องการให้ครูเห็นพัฒนาการ ให้เลือกเลขที่ของตนเองก่อน</p>' : '';

  /* ---------- ก่อนเรียน (แท็บแยก อยู่ก่อนหน้า "เรียนรู้") ---------- */
  function viewPre(c) {
    const { n, data, r, guest, T, preDone } = ctxOf(c);
    const head = `<section class="paper pp-head"><span class="eyebrow">PRE-TEST · ก่อนเรียน</span><h2>ทดสอบก่อนเรียน · บทที่ ${n} ${esc(c.title)}</h2>
      <p>ตอบ ${T} ข้อสั้นๆ เพื่อให้รู้ว่า <b>ก่อนเรียนเรารู้อะไรอยู่แล้ว</b> ไม่ได้ตัดสินว่าเก่งหรือไม่เก่ง และไม่นับเป็นคะแนนวิชา ถ้าไม่แน่ใจให้เลือกข้อที่คิดว่าใกล้เคียงที่สุด ส่งแล้วจะ <b>ยังไม่เฉลย</b> และแก้ย้อนหลังไม่ได้ จากนั้นระบบพาไปอ่านบทเรียนต่อทันที</p>${guestNote(guest)}</section>`;
    if (!preDone) return `<div class="pp">${head}<section class="paper pp-card"><form class="pp-form" data-pp-form="pre" data-c="${n}">${qBlock('pre', data.pre)}<div class="pp-err" role="alert"></div><button class="btn green" type="submit">ส่งคำตอบ แล้วไปอ่านบทเรียน</button></form></section></div>`;
    return `<div class="pp">${head}<section class="paper pp-card done"><span class="tag">เสร็จแล้ว</span><h3>ทดสอบก่อนเรียน: ทำได้ ${Math.round(r.pre / 100 * T)} / ${T} ข้อ (${Math.round(r.pre)}%)</h3><p>บันทึกแล้ว ตัวเลขนี้คือจุดเริ่มต้นของเรา ไปอ่านบทเรียนและทำด่านฝึก แล้วค่อยทำ "หลังเรียน" เพื่อดูว่าเพิ่มขึ้นเท่าไร</p><div class="pp-act"><a class="btn green" href="#chapter/${n}/learn">ไปอ่านบทเรียน</a></div></section></div>`;
  }

  /* ---------- หลังเรียน + สะท้อนคิด (แท็บแยก อยู่หลัง "ทดลอง") ---------- */
  function viewPost(c) {
    const { n, data, r, guest, T, preDone, postDone, unlocked } = ctxOf(c);
    const head = `<section class="paper pp-head"><span class="eyebrow">POST-TEST · หลังเรียน</span><h2>ทดสอบหลังเรียน · บทที่ ${n} ${esc(c.title)}</h2>
      <p>เรียนจบแล้ว มาดูกันว่าเข้าใจเพิ่มขึ้นแค่ไหน ข้อสอบวัดเรื่องเดียวกับตอนก่อนเรียนแต่เป็นสถานการณ์ใหม่ ส่งแล้วเฉลยพร้อมเหตุผลทุกข้อ จากนั้นเขียนสะท้อนคิดสั้นๆ ว่าเราเข้าใจผิดตรงไหนและแก้อย่างไร</p>${guestNote(guest)}</section>`;
    if (!preDone) return `<div class="pp">${head}<section class="paper pp-card locked"><h3>ยังไม่เปิด: ต้องทำก่อนเรียนก่อน</h3><p>ทำแบบทดสอบก่อนเรียนของบทนี้ให้เสร็จก่อน จึงจะเทียบก่อน–หลังได้</p><a class="btn green" href="#chapter/${n}/pre">ไปทำก่อนเรียน</a></section></div>`;
    if (!unlocked) return `<div class="pp">${head}<section class="paper pp-card locked"><h3>ยังไม่เปิด: อ่านบทเรียนก่อน</h3><p>อ่านบทเรียนให้ครบทุกหัวข้อ (กด "บันทึกว่าอ่านแล้ว") หรือลองทำด่านฝึกก่อน แล้วกลับมาทำหลังเรียน</p><div class="pp-act"><a class="btn green" href="#chapter/${n}/learn">ไปอ่านบทเรียน</a><a class="btn secondary" href="#chapter/${n}/practice">ไปทำด่านฝึก</a></div></section></div>`;
    let post;
    if (!postDone || retake[n]) post = `<section class="paper pp-card"><form class="pp-form" data-pp-form="post" data-c="${n}">${qBlock('post', data.post)}<div class="pp-err" role="alert"></div><button class="btn green" type="submit">ส่งคำตอบหลังเรียน</button></form></section>`;
    else {
      const ans = r.postAns;
      post = `<section class="paper pp-card done"><span class="tag">เสร็จแล้ว</span><h3>ทดสอบหลังเรียน: ทำได้ ${Math.round(r.post / 100 * T)} / ${T} ข้อ (${Math.round(r.post)}%)</h3>
        <div class="pp-compare">${bar('ก่อนเรียน', r.pre, 'a')}${bar('หลังเรียน', r.post, 'b')}</div>
        <p class="pp-gain ${r.post > r.pre ? 'up' : r.post === r.pre ? 'same' : 'down'}">${r.post > r.pre ? `เก่งขึ้น! คะแนนเพิ่มขึ้น ${Math.round(r.post - r.pre)} จุด` : r.post === r.pre ? 'คะแนนเท่าเดิม ลองอ่านเฉลยด้านล่าง แล้วทบทวนจุดที่ยังสับสน' : 'คะแนนลดลง ไม่เป็นไร ลองอ่านเฉลยด้านล่าง ทบทวนบทเรียน แล้วทำหลังเรียนใหม่ได้'}</p>
        ${Array.isArray(ans) ? `<h4>เฉลยและเหตุผลทุกข้อ</h4>${feedback(data.post, ans)}` : '<p class="muted">เฉลยละเอียดแสดงเฉพาะตอนที่เพิ่งส่ง</p>'}
        <div class="pp-act"><button type="button" class="btn secondary" data-pp="retake" data-c="${n}">ทำหลังเรียนใหม่</button></div></section>`;
    }
    let refl = '', next = '';
    if (postDone && !retake[n]) {
      const f = r.reflect || {};
      refl = `<section class="paper pp-card ${has(r.reflect) ? 'done' : ''}"><span class="tag">สะท้อนคิด${has(r.reflect) ? ' · บันทึกแล้ว' : ''}</span><h3>สะท้อนคิด: เราเรียนรู้อะไรเพิ่ม</h3><p>เขียนสั้นๆ ด้วยคำของเราเอง ครูอ่านเพื่อดูว่าเราเข้าใจอะไรแล้ว ไม่ได้ตัดสินถูกผิด</p>
        <form class="pp-form" data-pp-form="reflect" data-c="${n}">${RF().prompts.map(q => `<label class="pp-ta">${esc(q.t)}<small>${esc(q.h)}</small><textarea name="${q.k}" maxlength="500" rows="3" placeholder="เขียนด้วยคำของเรา">${esc(f[q.k] || '')}</textarea></label>`).join('')}
        <fieldset class="pp-lv"><legend>ประเมินตนเอง: วันนี้เรา "รู้ว่าเดิมเข้าใจผิดตรงไหนและแก้ได้" ระดับไหน</legend>${RF().levels.map(([v, t]) => `<label class="pp-opt"><input type="radio" name="level" value="${v}" ${has(f.level) && Number(f.level) === v ? 'checked' : ''}><span><b>${v}</b>${esc(t)}</span></label>`).join('')}</fieldset>
        <div class="pp-err" role="alert"></div><button class="btn green" type="submit">${has(r.reflect) ? 'อัปเดตบันทึกสะท้อนคิด' : 'บันทึกสะท้อนคิด'}</button></form></section>`;
      if (has(r.reflect)) { const last = n >= D().course.chapters.length; next = `<section class="paper pp-card done"><h3>เก่งมาก จบบทที่ ${n} แล้ว</h3><p>${last ? 'ครบทั้ง '+window.DT_DATA.course.chapters.length+' บทแล้ว ไปดูเลเวลและไอเทมที่สะสมได้ในหน้า "ข้อมูลของฉัน"' : 'พร้อมแล้วก็ไปบทถัดไปได้เลย หรือกลับมาทบทวนบทนี้ทีหลังก็ได้'}</p><div class="pp-act">${last ? '<a class="btn green" href="#me">ไปหน้าข้อมูลของฉัน</a>' : `<a class="btn green" href="#chapter/${n + 1}/overview">ไปบทที่ ${n + 1}</a>`}<a class="btn secondary" href="#chapter/${n}/overview">กลับหน้าภารกิจของบทนี้</a></div></section>`; }
    }
    return `<div class="pp">${head}${post}${refl}${next}</div>`;
  }
  const view = (c, which) => which === 'post' ? viewPost(c) : viewPre(c);

  document.addEventListener('submit', e => {
    const f = e.target.closest?.('[data-pp-form]'); if (!f) return; e.preventDefault();
    const kind = f.dataset.ppForm, n = Number(f.dataset.c), err = f.querySelector('.pp-err'), data = PP()[n], P_ = P();
    if (kind === 'reflect') {
      const v = k => (f.querySelector(`[name="${k}"]`)?.value || '').trim(), lv = f.querySelector('[name="level"]:checked');
      if (!v('a') || !v('b') || !v('c') || !lv) { err.textContent = 'เขียนให้ครบทั้ง 3 ข้อ และเลือกระดับของตนเองก่อน แล้วกดบันทึกอีกครั้ง'; return; }
      P_.patch(n, { reflect: { a: v('a'), b: v('b'), c: v('c'), level: Number(lv.value) }, reflectAt: new Date().toISOString() }); A().notify('บันทึกสะท้อนคิดแล้ว'); A().render(); return;
    }
    const items = data[kind], ans = items.map((_, i) => { const x = f.querySelector(`[name="pp-${kind}-${i}"]:checked`); return x ? Number(x.value) : null; });
    if (ans.some(a => a === null)) { err.textContent = `ยังตอบไม่ครบ เหลืออีก ${ans.filter(a => a === null).length} ข้อ ตอบให้ครบทุกข้อแล้วกดส่งอีกครั้ง`; return; }
    const pct = ans.filter((a, i) => a === items[i].ans).length / items.length * 100;
    if (kind === 'pre') P_.patch(n, { pre: pct, preAt: new Date().toISOString() });
    else { delete retake[n]; P_.patch(n, { post: pct, postAns: ans, postAt: new Date().toISOString() }); }
    A().notify(kind === 'pre' ? 'บันทึกผลก่อนเรียนแล้ว ไปอ่านบทเรียนกันต่อ' : 'ส่งแล้ว ดูเฉลยและคะแนนที่เพิ่มขึ้นได้เลย'); if (kind === 'pre') A().go('chapter/' + n + '/learn'); else { A().render(); window.scrollTo(0, 0); }
  });
  document.addEventListener('click', e => { const b = e.target.closest?.('[data-pp="retake"]'); if (!b) return; retake[Number(b.dataset.c)] = true; A().render(); });
  window.DTPrePost = { view };
})();
