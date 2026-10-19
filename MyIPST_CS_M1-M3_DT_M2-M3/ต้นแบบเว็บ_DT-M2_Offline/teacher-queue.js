/* ตรวจงานทีละหลายคน: (1) ตรวจต่อเนื่องคนต่อคน กดบันทึกแล้วไปคนถัดไปทันที (2) เลือกหลายคนแล้วให้คะแนน/ข้อเสนอแนะเหมือนกันครั้งเดียว */
(function () {
  'use strict';
  const D = window.DT_DATA;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const names = window.DT_CFG.sectorNames || ['จุดเริ่มต้น', 'ร่องรอยการเปลี่ยนแปลง', 'วงแหวนระบบ', 'คลังวัสดุ', 'พลังงานและกลไก', 'ศูนย์ออกแบบ', 'สนามทดสอบ'];
  const Q = { ch: 0, show: 'waiting', sel: new Set(), seq: null, order: [], drafts: {}, dsel: new Set(), derr: [], busy: null };
  const chap = s => D.course.chapters.find(c => c.id === s.chapterId);
  const aiOn = () => !!(window.DTCloud && window.DTCloud.on && window.DTCloud.isStaff());
  /* AI ร่างอัตโนมัติเมื่อนักเรียนส่งงาน: เซิร์ฟเวอร์ร่างทันทีตอนนักเรียนส่ง และลองใหม่ทุก 5 นาทีถ้าไม่สำเร็จ หน้านี้ดึงร่างมาใส่รายการ "รอครูยืนยัน" */
  const AUTO = { st: null, at: 0, busy: false, tog: false };
  /* โจทย์เต็มของบทให้ AI: คำถาม ข้อย่อย สิ่งที่ครูดู + โจทย์/ข้อกำหนดของบท (แยกรายบท ไม่รวมคีย์ข้ามบท) */
  const taskLabels = n => {
    const v5 = window.DTWorksheet && window.DTWorksheet.labels && window.DTWorksheet.labels(n); if (v5) return v5;
    const WG = window.DT_WORK_GUIDE, l = { evidenceMode: 'รูปแบบหลักฐาน (สำรวจ / แบบจำลองดิจิทัล / ชิ้นงานจริง)' };
    (app().workFields[n] || []).forEach(([k, t]) => { const g = WG && WG.fields[n] && WG.fields[n][k]; l[k] = g ? g.question + ' | ข้อย่อย: ' + g.prompts.join('; ') + ' | ครูดูจาก: ' + g.evidence : t; });
    const c = D.course.chapters.find(x => x.number === Number(n)), pj = c && D.projects[c.id];
    if (c) l.__task = 'บทที่ ' + n + ' ' + c.title + ' · โจทย์: ' + c.assignment + (pj ? ' · ข้อกำหนด: ' + pj.requirements.join('; ') + ' · สิ่งที่ใช้ตรวจ: ' + pj.acceptance.join('; ') : '') + (WG ? ' · ชุดของทดสอบ: ' + WG.testSet + ' · ฉบับคำถาม ' + WG.taskVersion : '');
    return l;
  };
  const allLabels = () => { const l = {}; D.course.chapters.forEach(c => { l[c.number] = taskLabels(c.number); }); return l; };
  const allRubrics = () => { const r = {}; D.course.chapters.forEach(c => { if (c.rubric && c.rubric.length) r[c.number] = c.rubric.map(x => ({ criterion: x.criterion, points: x.points })); }); return r; };
  function mergeAuto(st) {
    AUTO.st = st; AUTO.at = Date.now(); let added = 0;
    (st.drafts || []).forEach(d => { const s = app().db.submissions.find(x => x.id === d.id); if (!s || s.review || Q.drafts[d.id]) return; Q.drafts[d.id] = { scores: d.scores, comment: d.comment, model: d.model, note: d.note || '', auto: true }; added++; });
    return added;
  }
  async function loadAuto(force) {
    if (!aiOn() || AUTO.busy || (!force && Date.now() - AUTO.at < 30000)) return;
    AUTO.busy = true;
    let added = 0; try { added = mergeAuto(await window.DTCloud.getAutoDraft()); } catch (e) { /* ไว้รอบหน้า */ }
    AUTO.busy = false; if (added || force) app().render();
  }
  async function toggleAuto(on) {
    AUTO.tog = true; app().render();
    try { mergeAuto(await window.DTCloud.setAutoDraft(on, on ? allRubrics() : null, on ? allLabels() : null)); app().notify(on ? 'เปิด AI ร่างอัตโนมัติแล้ว นักเรียนส่งงานเมื่อไร AI จะร่างคะแนนให้ทันที' : 'ปิด AI ร่างอัตโนมัติแล้ว'); }
    catch (e) { app().notify(String(e && e.message || e)); }
    AUTO.tog = false; app().render();
  }
  function autoPanel() {
    if (!aiOn()) return '';
    setTimeout(() => loadAuto(false), 0);
    const st = AUTO.st, on = !!(st && st.on);
    const errs = st && st.errors && st.errors.length ? `<p class="muted">ร่างไม่สำเร็จ ${st.errors.length} งาน (ครูกด "ให้ AI ร่าง" เองได้ หรือตรวจเองตามปกติ)</p>` : '';
    return `<section class="paper auto-ai ${on ? 'on' : ''}"><div class="flex-between"><div><span class="eyebrow">🤖 AI ร่างอัตโนมัติ</span><h3>${on ? 'เปิดอยู่ · AI ร่างให้เองเมื่อนักเรียนส่งงาน' : 'ปิดอยู่'}</h3></div>
      <button type="button" class="btn ${on ? 'secondary' : 'green'} small" data-q="${on ? 'auto-off' : 'auto-on'}" ${AUTO.tog ? 'disabled' : ''}>${AUTO.tog ? 'กำลังทำงาน…' : on ? 'ปิด AI อัตโนมัติ' : 'เปิด AI อัตโนมัติ'}</button></div>
      <p class="muted">${on ? `นักเรียนกดส่งเมื่อไร AI ร่างคะแนนและข้อเสนอแนะให้ทันที (ถ้าร่างไม่สำเร็จ ระบบลองใหม่ให้ทุก 5 นาที) ร่างอยู่ในรายการ "รอครูยืนยัน" ด้านล่าง <b>ผลยังไม่ถึงนักเรียนจนกว่าครูจะกดยืนยัน</b>${st.waiting ? ` · รอร่างอีก ${st.waiting} งาน` : ''}` : 'เปิดแล้ว เมื่อนักเรียนส่งงาน AI จะร่างคะแนนและข้อเสนอแนะไว้ให้เอง ครูแค่อ่าน แก้ถ้าจำเป็น แล้วกดยืนยันทีละหลายคน'}</p>${errs}
      ${on ? '<button type="button" class="btn ghost small" data-q="auto-refresh">ดึงร่างล่าสุด</button>' : ''}</section>`;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const app = () => window.DTApp;
  const chNo = s => Number(s.chapterId.slice(-2));
  /* บอกครูว่างานนี้เป็นของบทไหน เรื่องอะไร */
  const wsTitle = n => { const w = window.DT_WS5 && window.DT_WS5[String(n)]; return w ? w.title : ''; };
  const topic = s => { const c = chap(s); if (!c) return esc(s.chapterId); const t = wsTitle(c.number); return `<span class="q-topic"><b>บทที่ ${c.number} · ${esc(c.title)}</b>${t ? `<small>ชิ้นงาน: ${esc(t)}</small>` : ''}</span>`; };

  function latest() {
    const by = {};
    app().db.submissions.forEach(s => { const k = s.studentId + '|' + s.chapterId; if (!by[k] || by[k].version < s.version) by[k] = s; });
    return Object.values(by);
  }
  function list() {
    return latest().filter(s => (!Q.ch || chNo(s) === Q.ch) && (Q.show === 'all' || !s.review))
      .sort((a, b) => chNo(a) - chNo(b) || Number(a.student.number) - Number(b.student.number));
  }
  const badge = s => s.review ? (s.review.status === 'graded' ? '<span class="badge-status graded">ตรวจแล้ว</span>' : '<span class="badge-status revision_requested">ขอให้ปรับปรุง</span>') : '<span class="badge-status submitted">รอตรวจ</span>';

  function head(n, waiting) {
    return `<section class="paper"><div class="flex-between"><h3>งานที่นักเรียนส่งมา</h3><div class="tools-flex">${window.DTCloud && window.DTCloud.on ? '<button type="button" class="btn secondary small" data-q="refresh">รีเฟรชจาก Drive</button>' : ''}</div></div>
      <div class="field-grid"><label>บทที่<select id="q-ch"><option value="0">ทุกบท</option>${D.course.chapters.map(c => `<option value="${c.number}" ${Q.ch === c.number ? 'selected' : ''}>บทที่ ${c.number} ${esc(names[c.number - 1])}</option>`).join('')}</select></label>
      <label>แสดง<select id="q-show"><option value="waiting" ${Q.show === 'waiting' ? 'selected' : ''}>เฉพาะที่รอตรวจ</option><option value="all" ${Q.show === 'all' ? 'selected' : ''}>ทั้งหมด (รวมตรวจแล้ว)</option></select></label></div>
      <p class="muted">รอตรวจ <b>${waiting}</b> ชิ้น · ทั้งหมดที่แสดง <b>${n}</b> ชิ้น ${window.DTCloud && window.DTCloud.on ? '· งานใหม่ขึ้นเองทุก 45 วินาที และบันทึกลง Drive ให้อัตโนมัติ' : ''}</p></section>`;
  }

  function seqView() {
    const s = app().db.submissions.find(x => x.id === Q.seq);
    if (!s) { Q.seq = null; return ''; }
    const pos = Q.order.indexOf(s.id) + 1, c = D.course.chapters.find(c => c.id === s.chapterId);
    return `<section class="paper queue-seq"><div class="flex-between"><div><span class="eyebrow">ตรวจต่อเนื่อง · คนที่ ${pos} จาก ${Q.order.length}</span><h3>${who(s)}</h3>${topic(s)}</div><div class="tools-flex"><button type="button" class="btn secondary small" data-q="prev" ${pos <= 1 ? 'disabled' : ''}>คนก่อนหน้า</button><button type="button" class="btn secondary small" data-q="skip" ${pos >= Q.order.length ? 'disabled' : ''}>ข้ามไปคนถัดไป</button><button type="button" class="btn ghost small" data-q="exit">กลับรายการ</button></div></div></section>
      ${app().reviewForm(s)}
      <section class="paper queue-actions"><button type="button" class="btn green" data-q="save-seq" data-st="graded">บันทึกคะแนน ${pos < Q.order.length ? 'แล้วไปคนถัดไป' : 'แล้วจบรอบ'}</button><button type="button" class="btn danger" data-q="save-seq" data-st="revision_requested">ขอให้ปรับปรุง ${pos < Q.order.length ? 'แล้วไปคนถัดไป' : 'แล้วจบรอบ'}</button></section>`;
  }

  function view() {
    const items = list(), waiting = latest().filter(s => !s.review && (!Q.ch || chNo(s) === Q.ch)).length;
    if (Q.seq) { const v = seqView(); if (v) return v; }
    const c = Q.ch ? D.course.chapters[Q.ch - 1] : null;
    const bulk = c ? `<details class="paper q-bulk"><summary><b>ให้คะแนนหลายคนพร้อมกัน (บทที่ ${c.number})</b> · ใช้เมื่อหลายคนได้คะแนนเท่ากัน</summary><p class="muted">เลือกแถวที่ต้องการในตารางด้านบน แล้วกรอกคะแนนและข้อเสนอแนะที่ใช้ร่วมกัน ระบบบันทึกให้ทุกคนที่เลือกครั้งเดียว ถ้าบางคนต้องการข้อเสนอแนะเฉพาะตัว ให้ใช้โหมดตรวจต่อเนื่อง</p>
      <div class="review-scores">${c.rubric.map((r, i) => `<label>${esc(r.criterion)} (เต็ม ${r.points})<input class="q-score" data-i="${i}" type="number" min="0" max="${r.points}" step="1" aria-label="คะแนน ${esc(r.criterion)}"></label>`).join('')}</div>
      <label class="mt">ข้อเสนอแนะที่ใช้ร่วมกัน<textarea id="q-comment" maxlength="6000" placeholder="สิ่งที่ทำได้ดี จุดที่ควรปรับ และขั้นถัดไป"></textarea></label>
      <div class="work-actions"><button type="button" class="btn green" data-q="bulk" data-st="graded">ให้คะแนนผู้ที่เลือก</button><button type="button" class="btn danger" data-q="bulk" data-st="revision_requested">ขอให้ผู้ที่เลือกปรับปรุง</button><span class="muted" id="q-sel-count">เลือกแล้ว ${Q.sel.size} คน</span></div></details>`
      : '';
    return head(items.length, waiting) + aiPanel() + listCard(items) + bulk + autoPanel();
  }
  /* การตั้งค่าห้อง/รหัส แสดงในหน้า "นักเรียน" */
  function settingsCard() {
    return window.DTCloud && window.DTCloud.on && window.DTCloud.isStaff() ? `<section class="paper"><h3>ตั้งค่าระบบออนไลน์</h3><div class="field-grid three"><label>ปีการศึกษา<input id="cf-year" value="${esc(app().db.settings.year)}" maxlength="4"></label><label>ห้องเรียน<input id="cf-class" value="${esc(app().db.settings.classroom)}" maxlength="20"></label><label>รหัสเข้าเรียนของนักเรียนใหม่ (ตัวเลข 4–8 หลัก)<input id="cf-pin" inputmode="numeric" maxlength="8" placeholder="เว้นว่างถ้าไม่เปลี่ยน"></label></div><button type="button" class="btn secondary small" data-q="cfg">บันทึกการตั้งค่า</button><hr class="mt"><div class="field-grid"><label>รหัสพินครูเดิม<input id="pw-old" type="password" inputmode="numeric" maxlength="8" autocomplete="off"></label><label>รหัสพินครูใหม่ (ตัวเลข 4–8 หลัก)<input id="pw-new" type="password" inputmode="numeric" maxlength="8" autocomplete="off"></label></div><button type="button" class="btn secondary small" data-q="pw">เปลี่ยนรหัสพินครู</button></section>` : '';
  }
  const who = s => /^เลขที่/.test(s.student.name) ? 'เลขที่ ' + esc(s.student.number) : esc(s.student.number) + ' · ' + esc(s.student.name);
  function listCard(items) {
    return `<section class="paper"><div class="flex-between"><h3>รายการงาน</h3><div class="tools-flex"><button type="button" class="btn secondary small" data-q="selall">เลือก/ยกเลิกทั้งหมด</button>${aiOn() ? `<button type="button" class="btn small" data-q="ai-batch" ${Q.busy ? 'disabled' : ''}>✨ ให้ AI ร่างให้ผู้ที่เลือก (${Q.sel.size})</button>` : ''}<button type="button" class="btn green small" data-q="start" ${items.length ? '' : 'disabled'}>เริ่มตรวจต่อเนื่อง (${items.length} ชิ้น)</button></div></div>
      ${items.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>เลือก</th><th>เลขที่ · ชื่อ</th><th>บท · เรื่อง</th><th>ฉบับ</th><th>ส่งเมื่อ</th><th>สถานะ</th><th></th></tr></thead><tbody>${items.map(s => `<tr><td><input type="checkbox" class="q-pick" data-id="${esc(s.id)}" ${Q.sel.has(s.id) ? 'checked' : ''} aria-label="เลือก ${esc(s.student.name)}"></td><td>${who(s)}</td><td>${topic(s)}</td><td>${s.version}</td><td>${new Date(s.submittedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</td><td>${badge(s)}</td><td><button type="button" class="btn secondary small" data-q="open" data-id="${esc(s.id)}">ตรวจคนนี้</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">ยังไม่มีงานที่รอตรวจ เมื่อนักเรียนกดส่งงาน งานจะขึ้นที่นี่เอง</p>'}</section>`;
  }

  /* ---------- ร่างด้วย AI หลายคน แล้วให้ครูตรวจและยืนยันทีละหลายคน ---------- */
  function aiPanel() {
    let out = '';
    if (Q.busy) out += `<section class="paper ai-progress" role="status"><b>✨ AI กำลังร่าง ${Q.busy.done} / ${Q.busy.total} คน</b><span class="muted"> · ระบบเว้นจังหวะระหว่างคนเพื่อไม่ชนข้อจำกัดต่อนาทีของ Gemini กรุณาอย่าปิดหน้านี้</span><div class="pf-bar sm"><i style="width:${Math.round(Q.busy.done / Q.busy.total * 100)}%"></i></div><button type="button" class="btn ghost small" data-q="ai-cancel">หยุดร่างที่เหลือ</button></section>`;
    if (Q.derr.length) out += `<section class="paper"><h3>ร่างไม่สำเร็จ ${Q.derr.length} คน</h3><ul>${Q.derr.map(x => `<li>เลขที่ ${esc(x.no)} · ${esc(x.name)}: ${esc(x.msg)}</li>`).join('')}</ul><button type="button" class="btn ghost small" data-q="derr-clear">ปิดรายการนี้</button></section>`;
    const ids = Object.keys(Q.drafts).filter(id => app().db.submissions.some(s => s.id === id));
    if (!ids.length) return out;
    const subs = ids.map(id => app().db.submissions.find(s => s.id === id)).sort((a, b) => chNo(a) - chNo(b) || Number(a.student.number) - Number(b.student.number));
    const k = subs.filter(s => Q.dsel.has(s.id)).length;
    return out + `<section class="paper ai-drafts"><div class="flex-between"><div><span class="eyebrow">AI DRAFT · รอครูยืนยัน</span><h3>ร่างจาก AI ${subs.length} คน</h3></div><div class="tools-flex"><button type="button" class="btn secondary small" data-q="d-all">เลือก/ยกเลิกทั้งหมด</button><button type="button" class="btn green small" data-q="d-confirm" ${k ? '' : 'disabled'}>ยืนยันที่เลือก (${k} คน)</button><button type="button" class="btn ghost small" data-q="d-clear">ทิ้งร่างทั้งหมด</button></div></div>
      <p class="muted">นี่เป็นเพียงร่างจาก AI <b>ยังไม่ส่งถึงนักเรียน</b> อ่านและแก้คะแนนหรือข้อความในแต่ละช่องได้เลย ติ๊กเฉพาะคนที่ครูตรวจแล้ว แล้วกด "ยืนยัน" จึงจะบันทึกผลและนักเรียนเห็น (พร้อมหมายเหตุว่ามี AI ช่วยร่าง) ติ๊กออกคือยังไม่ยืนยัน</p>
      <div class="draft-list">${subs.map(s => { const c = chap(s), dr = Q.drafts[s.id]; return `<article class="draft-card ${Q.dsel.has(s.id) ? 'sel' : ''}"><label class="d-pick"><input type="checkbox" class="d-sel" data-id="${esc(s.id)}" ${Q.dsel.has(s.id) ? 'checked' : ''}> <b>เลขที่ ${esc(s.student.number)} · ${esc(s.student.name)}</b> <span class="muted">บทที่ ${c.number} · ${esc(c.title)}${wsTitle(c.number) ? ' · ชิ้นงาน: ' + esc(wsTitle(c.number)) : ''} · ฉบับ ${s.version}</span><span class="d-total" data-total="${esc(s.id)}">คะแนนรวมที่ AI ให้: <b>${dr.scores.reduce((x, v) => x + (Number(v) || 0), 0)}</b> / ${c.rubric.reduce((x, r2) => x + r2.points, 0)}</span></label>
        <div class="d-scores">${c.rubric.map((r, i) => `<label>${esc(r.criterion)} <small>(เต็ม ${r.points})</small><input class="d-score" data-id="${esc(s.id)}" data-i="${i}" type="number" min="0" max="${r.points}" step="1" value="${dr.scores[i] ?? ''}"></label>`).join('')}</div>
        <label class="d-cm">ข้อเสนอแนะ (ร่างจาก AI แก้ได้)${dr.note ? `<p class="d-note">⚠ ${esc(dr.note)}</p>` : ''}<textarea class="d-comment" data-id="${esc(s.id)}" maxlength="6000">${esc(dr.comment)}</textarea></label>
        <div class="tools-flex"><button type="button" class="btn secondary small" data-q="open" data-id="${esc(s.id)}">เปิดตรวจเต็มหน้า (เห็นงานของนักเรียนทั้งฉบับ)</button></div></article>`; }).join('')}</div></section>`;
  }
  async function aiBatch() {
    const ids = [...Q.sel].filter(id => app().db.submissions.some(s => s.id === id));
    if (!ids.length) { app().notify('เลือกอย่างน้อย 1 คนจากตารางก่อน'); return; }
    Q.busy = { done: 0, total: ids.length, cancel: false }; Q.derr = []; app().render();
    for (const id of ids) {
      if (Q.busy.cancel) break;
      const s = app().db.submissions.find(x => x.id === id), c = chap(s);
      try {
        const labels = taskLabels(c.number);
        const res = await window.DTCloud.aiDraft(id, c.rubric.map(r => ({ criterion: r.criterion, points: r.points })), labels);
        Q.drafts[id] = { scores: res.scores, comment: res.comment, model: res.model, note: res.note || '' }; Q.dsel.add(id);
      } catch (e) { Q.derr.push({ no: s.student.number, name: s.student.name, msg: (e && e.message) || 'ไม่สำเร็จ' }); if (/โควตา|ครบ|GEMINI_API_KEY/.test((e && e.message) || '')) { Q.busy.cancel = true; } }
      Q.busy.done++; app().render();
      if (!Q.busy.cancel && Q.busy.done < Q.busy.total) await wait(3500);
    }
    const n = Object.keys(Q.drafts).length; Q.busy = null; Q.sel.clear(); app().render();
    app().notify(n ? 'AI ร่างเสร็จแล้ว ตรวจและติ๊กยืนยันได้เลย' : 'ยังไม่มีร่างที่สำเร็จ ดูสาเหตุในกล่องด้านบน');
  }
  function confirmDrafts() {
    const ids = [...Q.dsel].filter(id => Q.drafts[id]);
    if (!ids.length) { app().notify('ติ๊กเลือกคนที่ครูตรวจแล้วก่อนกดยืนยัน'); return; }
    let ok = 0; const bad = [];
    ids.forEach(id => { const dr = Q.drafts[id], s = app().db.submissions.find(x => x.id === id); if (app().applyReview(id, 'graded', dr.scores.map(Number), dr.comment, true)) { ok++; delete Q.drafts[id]; Q.dsel.delete(id); } else if (s) bad.push(s.student.number); });
    app().save(); if (ok && window.DTCloud) window.DTCloud.pushReviews(ids.filter(id => !Q.drafts[id])); app().render();
    app().notify(ok ? `ยืนยันและบันทึกผลตรวจ ${ok} คนแล้ว` + (bad.length ? ` · ยังไม่ผ่าน ${bad.length} คน (เลขที่ ${bad.join(', ')}) ตรวจคะแนนให้ครบเป็นจำนวนเต็มและไม่เกินคะแนนเต็ม` : '') : `ยืนยันไม่ได้: เลขที่ ${bad.join(', ')} คะแนนไม่ครบ ไม่เป็นจำนวนเต็ม หรือเกินคะแนนเต็ม`);
  }

  function goNext(from) {
    const i = Q.order.indexOf(from);
    if (i >= 0 && i < Q.order.length - 1) Q.seq = Q.order[i + 1]; else { Q.seq = null; app().notify('ตรวจครบรอบนี้แล้ว'); }
    app().render();
  }
  function readSeqForm(s) {
    const c = D.course.chapters.find(c => c.id === s.chapterId);
    return { scores: c.rubric.map((r, i) => { const v = $('#score-' + i).value; return v === '' ? NaN : Number(v); }), comment: $('#review-comment').value };
  }

  document.addEventListener('change', e => {
    if (e.target.id === 'q-ch') { Q.ch = Number(e.target.value); Q.sel.clear(); app().render(); }
    else if (e.target.id === 'q-show') { Q.show = e.target.value; app().render(); }
    else if (e.target.classList && e.target.classList.contains('d-sel')) { e.target.checked ? Q.dsel.add(e.target.dataset.id) : Q.dsel.delete(e.target.dataset.id); app().render(); }
    else if (e.target.classList && e.target.classList.contains('q-pick')) { e.target.checked ? Q.sel.add(e.target.dataset.id) : Q.sel.delete(e.target.dataset.id); const n = $('#q-sel-count'); if (n) n.textContent = 'เลือกแล้ว ' + Q.sel.size + ' คน'; }
  });
  document.addEventListener('input', e => {
    const t = e.target, id = t.dataset && t.dataset.id; if (!id || !Q.drafts[id]) return;
    if (t.classList.contains('d-score')) { Q.drafts[id].scores[Number(t.dataset.i)] = t.value === '' ? '' : Number(t.value); const tt = document.querySelector('[data-total="' + id + '"] b'); if (tt) tt.textContent = Q.drafts[id].scores.reduce((x, v) => x + (Number(v) || 0), 0); }
    else if (t.classList.contains('d-comment')) Q.drafts[id].comment = t.value;
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const k = b.dataset.q, db = app().db;
    if (k === 'cfg') { window.DTCloud.saveConfig({ year: $('#cf-year').value.trim(), classroom: $('#cf-class').value.trim(), pin: $('#cf-pin').value.trim() || undefined }).then(() => { app().render(); app().notify('บันทึกการตั้งค่าแล้ว'); }).catch(err => app().notify((err && err.message) || 'บันทึกไม่ได้')); return; }
    if (k === 'pw') { window.DTCloud.changePassword($('#pw-old').value, $('#pw-new').value).then(() => { $('#pw-old').value = $('#pw-new').value = ''; app().notify('เปลี่ยนรหัสพินครูแล้ว'); }).catch(err => app().notify((err && err.message) || 'เปลี่ยนไม่ได้')); return; }
    if (k === 'refresh') { b.disabled = true; const done = app().busy ? app().busy('กำลังดึงงานล่าสุดของนักเรียน…') : () => {}; window.DTCloud.refresh().finally(done).then(n => { app().render(); app().notify(n ? 'ดึงงานใหม่ ' + n + ' ชิ้น' : 'ข้อมูลเป็นปัจจุบันแล้ว'); }).catch(err => { b.disabled = false; app().notify('ดึงข้อมูลไม่สำเร็จ: ' + (err && err.message)); }); return; }
    if (k === 'ai-batch') { aiBatch(); return; }
    if (k === 'auto-on' || k === 'auto-off') { toggleAuto(k === 'auto-on'); return; }
    if (k === 'auto-refresh') { loadAuto(true); return; }
    if (k === 'ai-cancel') { if (Q.busy) Q.busy.cancel = true; app().notify('จะหยุดหลังคนที่กำลังร่างอยู่เสร็จ'); return; }
    if (k === 'derr-clear') { Q.derr = []; app().render(); return; }
    if (k === 'd-all') { const ids = Object.keys(Q.drafts), all = ids.every(id => Q.dsel.has(id)); ids.forEach(id => all ? Q.dsel.delete(id) : Q.dsel.add(id)); app().render(); return; }
    if (k === 'd-confirm') { confirmDrafts(); return; }
    if (k === 'd-clear') { if (confirm('ทิ้งร่างจาก AI ทั้งหมด (ยังไม่ได้บันทึกถึงนักเรียน) หรือไม่')) { Q.drafts = {}; Q.dsel.clear(); app().render(); } return; }
    if (k === 'selall') { const ids = list().map(s => s.id), all = ids.every(id => Q.sel.has(id)); ids.forEach(id => all ? Q.sel.delete(id) : Q.sel.add(id)); app().render(); return; }
    if (k === 'start') { Q.order = list().map(s => s.id); Q.seq = Q.order[0]; app().render(); window.scrollTo(0, 0); return; }
    if (k === 'open') { Q.order = list().map(s => s.id); if (!Q.order.includes(b.dataset.id)) Q.order.push(b.dataset.id); Q.seq = b.dataset.id; app().render(); window.scrollTo(0, 0); return; }
    if (k === 'exit') { Q.seq = null; app().render(); return; }
    if (k === 'skip' || k === 'prev') { const i = Q.order.indexOf(Q.seq), j = k === 'skip' ? i + 1 : i - 1; if (Q.order[j]) { Q.seq = Q.order[j]; app().render(); window.scrollTo(0, 0); } return; }
    if (k === 'save-seq') {
      const s = db.submissions.find(x => x.id === Q.seq); if (!s) return;
      const f = readSeqForm(s), st = b.dataset.st;
      const cm = f.comment.trim() || (st === 'graded' ? 'ตรวจให้คะแนนเรียบร้อยแล้ว' : '');
      if (!cm) { app().notify('เขียนข้อเสนอแนะที่เด็กใช้ปรับงานได้ก่อนบันทึก'); return; }
      if (!app().applyReview(s.id, st, f.scores, cm)) { app().notify('ให้คะแนนครบทุกเกณฑ์เป็นจำนวนเต็ม และไม่เกินคะแนนเต็ม'); return; }
      delete Q.drafts[s.id]; Q.dsel.delete(s.id); app().save(); if (window.DTCloud) window.DTCloud.pushReviews([s.id]); app().notify('บันทึกผลตรวจแล้ว'); goNext(s.id); window.scrollTo(0, 0); return;
    }
    if (k === 'bulk') {
      const ids = [...Q.sel].filter(id => db.submissions.some(s => s.id === id && (!Q.ch || chNo(s) === Q.ch)));
      if (!ids.length) { app().notify('เลือกอย่างน้อย 1 คนจากตารางก่อน'); return; }
      const scores = [...document.querySelectorAll('.q-score')].map(i => (i.value === '' ? NaN : Number(i.value))), rawCm = $('#q-comment').value.trim(), st = b.dataset.st;
      const comment = rawCm || (st === 'graded' ? 'ตรวจให้คะแนนเรียบร้อยแล้ว' : '');
      if (!comment) { app().notify('เขียนข้อเสนอแนะที่ใช้ร่วมกันก่อนบันทึก'); return; }
      let n = 0; ids.forEach(id => { if (app().applyReview(id, st, scores, comment)) n++; });
      if (!n) { app().notify('ให้คะแนนครบทุกเกณฑ์เป็นจำนวนเต็ม และไม่เกินคะแนนเต็ม'); return; }
      Q.sel.clear(); app().save(); if (window.DTCloud) window.DTCloud.pushReviews(ids); app().render(); app().notify('บันทึกผลตรวจ ' + n + ' คนแล้ว');
    }
  });

  window.DTQueue = { view, settingsCard, taskLabels, draft: id => Q.drafts[id] || null };
})();
