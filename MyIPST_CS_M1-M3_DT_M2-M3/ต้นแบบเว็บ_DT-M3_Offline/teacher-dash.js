/* หน้าครู (18 ต.ค. 2569)
   - ภาพรวม: ต้องทำวันนี้ · นักเรียนที่ต้องช่วย · ข้อความเตือนคนที่ยังไม่ส่ง · ความคืบหน้าของห้องรายบท · การกระจายคะแนนรวม · ข้อในด่านฝึกที่ผิดบ่อย
   - รายงานรายคน (#teacher/student/<id>): คะแนนทุกบท ก่อน–หลังเรียน สิ่งที่ยังขาด และพิมพ์ส่งผู้ปกครองได้
   - ตั้งค่าการเรียน (หน้าเครื่องมือ): กำหนดส่งรายบท และสัดส่วนคะแนนรวมรายบท (นักเรียนเห็นด้วย)
   ไม่จัดอันดับให้นักเรียนเห็น ครูเรียงตารางคะแนนเองได้ในหน้าคะแนน */
(function () {
  'use strict';
  const D = window.DT_DATA, CH = D.course.chapters, PASS = 70;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const has = v => v !== undefined && v !== null && v !== '';
  const app = () => window.DTApp, db = () => app().db, P = () => window.DTPractice;
  const nameOf = p => /^เลขที่/.test(p.name || '') || !p.name ? 'เลขที่ ' + p.number : p.number + ' · ' + p.name;
  const short = p => /^เลขที่/.test(p.name || '') || !p.name ? 'เลขที่ ' + p.number : p.name;
  const students = () => Object.values(db().profiles).filter(p => p.id !== 'guest').sort((a, b) => Number(a.number) - Number(b.number));
  const subsOf = (pid, c) => db().submissions.filter(s => s.studentId === pid && s.chapterId === c.id).sort((a, b) => b.version - a.version);
  const rec = (pid, n) => P().recOf(pid, n);
  /* บทที่ครูปิดไว้ (settings.locks) นักเรียนเข้าไม่ได้ ครูเข้าได้เสมอ */
  const locks = () => ((db().settings || {}).locks || []).map(Number);
  const isOpen = n => !locks().includes(Number(n));
  /* บทที่ "เรียนแล้ว": ครูเปิดอยู่ และมีนักเรียนเริ่มทำอย่างน้อย 1 คน */
  function activeChapters(st) {
    return CH.filter(c => isOpen(c.number) && st.some(p => { const r = rec(p.id, c.number); return has(r.pre) || has(r.post) || r.tries || subsOf(p.id, c).length; }));
  }

  /* ---------- ภาพรวม ---------- */
  let helpTab = 'work', distCh = 0;
  function overview() {
    const st = students(), subs = db().submissions, act = activeChapters(st);
    const waiting = subs.filter(s => !s.review), aiReady = waiting.filter(s => window.DTQueue && window.DTQueue.draft && window.DTQueue.draft(s.id)).length;
    const resub = waiting.filter(s => s.version > 1 && subs.some(x => x.studentId === s.studentId && x.chapterId === s.chapterId && x.version < s.version && x.review && x.review.status === 'revision_requested')).length;
    const open = CH.filter(c => isOpen(c.number)).length;
    const card = (ic, t, n, href, cl, sub) => `<a class="db-card ${cl} ${n ? '' : 'zero'}" href="${href}"><span>${ic}</span><b>${n}</b><small>${t}</small>${sub ? `<em>${sub}</em>` : ''}</a>`;
    return `<section class="paper db-today"><div class="db-h"><h2>ต้องทำวันนี้</h2><span class="muted">นักเรียน ${st.length} คน · เริ่มเรียนแล้ว ${act.length} บท</span></div>
      <div class="db-cards">${card('📝', 'งานรอตรวจ', waiting.length, '#teacher/queue', 'pink', waiting.length ? 'กดเพื่อตรวจ ›' : 'ไม่มีงานค้าง')}${card('✨', 'ร่างจาก AI รอยืนยัน', aiReady, '#teacher/queue', 'violet', aiReady ? 'ตรวจแล้วกดยืนยัน ›' : '')}${card('🔁', 'แก้แล้วส่งกลับมา', resub, '#teacher/queue', 'cyan', resub ? 'ตรวจฉบับใหม่ ›' : '')}${card('🔓', 'บทที่เปิดให้เรียน', open + '/' + CH.length, '#teacher/tools', 'green', 'เปิด/ปิดบทเรียน ›')}</div></section>
      <div class="db-grid">${helpBox(st, act)}${progressBox(st)}</div>
      <div class="db-grid">${distBox(st, act)}${missBox(st)}</div>
      <section class="paper db-links"><a class="btn secondary small" href="#teacher/scores">🏆 ดูตารางคะแนนทั้งหมด</a><a class="btn secondary small" href="#home">📚 ดูบทเรียนแบบนักเรียน</a><a class="btn secondary small" href="#teacher/tools">⚙️ เปิด/ปิดบทเรียน และสัดส่วนคะแนน</a></section>`;
  }
  function helpLists(st, act) {
    const work = [], prac = [], down = [];
    st.forEach(p => {
      const w = act.filter(c => !subsOf(p.id, c).length), f = act.filter(c => { const r = rec(p.id, c.number); return r.tries && r.best < PASS; }), d = CH.filter(c => { const r = rec(p.id, c.number); return has(r.pre) && has(r.post) && r.post < r.pre; });
      if (w.length) work.push([p, w]); if (f.length) prac.push([p, f]); if (d.length) down.push([p, d]);
    });
    return { work, prac, down };
  }
  function helpBox(st, act) {
    const L = helpLists(st, act), T = [['work', '📝 ยังไม่ส่งชิ้นงาน', L.work], ['prac', '🎮 ด่านฝึกไม่ถึง 70%', L.prac], ['down', '📉 หลังเรียนลดลง', L.down]];
    const cur = T.find(t => t[0] === helpTab) || T[0];
    return `<section class="paper db-help" id="db-help"><div class="db-h"><h2>นักเรียนที่ต้องช่วย</h2>${helpTab === 'work' && L.work.length ? '<button type="button" class="btn ghost small" data-db="remind">📋 ข้อความเตือน</button>' : ''}</div>
      <div class="sc-chips">${T.map(([k, t, l]) => `<button type="button" class="${k === cur[0] ? 'on' : ''}" data-db-help="${k}">${t} <b>${l.length}</b></button>`).join('')}</div>
      ${cur[2].length ? `<ul class="db-list">${cur[2].slice(0, 40).map(([p, cs]) => `<li><a href="#teacher/student/${encodeURIComponent(p.id)}">${esc(nameOf(p))}</a><span>${cs.map(c => `<i>บท ${c.number}</i>`).join('')}</span></li>`).join('')}</ul>` : `<p class="db-empty">🎉 ไม่มีนักเรียนในกลุ่มนี้</p>`}
      <div id="db-remind"></div></section>`;
  }
  function remindBox() {
    const st = students(), act = activeChapters(st), opts = act.map(c => `<option value="${c.number}">บทที่ ${c.number} · ${esc(c.title)}</option>`).join('');
    const box = $('#db-remind'); if (!box) return;
    box.innerHTML = `<div class="db-remind"><label>บทที่จะเตือน<select id="db-rm-ch">${opts}</select></label><textarea id="db-rm-text" rows="5" readonly></textarea><button type="button" class="btn green small" data-db="copy">📋 คัดลอกข้อความ</button><small>นำไปวางในกลุ่มไลน์ของห้องได้เลย ข้อความมีเฉพาะเลขที่ ไม่มีคะแนน</small></div>`;
    remindText();
  }
  function remindText() {
    const sel = $('#db-rm-ch'), ta = $('#db-rm-text'); if (!sel || !ta) return; const c = CH[+sel.value - 1], st = students().filter(p => !subsOf(p.id, c).length);
    ta.value = `📢 แจ้งเตือนชิ้นงานบทที่ ${c.number} ${c.title}\nยังไม่ส่ง ${st.length} คน: เลขที่ ${st.map(p => p.number).join(', ')}\nเข้าเว็บ › บทที่ ${c.number} › แท็บชิ้นงาน ทำแล้วกดส่งได้เลย ถ้าติดตรงไหนถามครูได้นะ 😊`;
  }
  function progressBox(st) {
    const n = st.length || 1;
    const rows = CH.map(c => { const sent = st.filter(p => subsOf(p.id, c).length).length, pass = st.filter(p => rec(p.id, c.number).best >= PASS).length, post = st.filter(p => has(rec(p.id, c.number).post)).length; return [c, sent / n * 100, pass / n * 100, post / n * 100]; });
    const bar = (v, cl) => `<i class="${cl}" style="width:${Math.round(v)}%"><em>${Math.round(v)}%</em></i>`;
    return `<section class="paper db-prog"><div class="db-h"><h2>ความคืบหน้าของห้องรายบท</h2></div><p class="sc-legend"><span class="w"></span> ส่งชิ้นงาน <span class="r"></span> ผ่านด่านฝึก <span class="p"></span> ทำหลังเรียน (ร้อยละของนักเรียนทั้งห้อง)</p>
      <div class="db-bars">${rows.map(([c, a, b, d]) => `<div class="db-row"><span class="db-lab" title="${esc(c.title)}">บท ${c.number}${isOpen(c.number) ? '' : '<small>🔒 ปิดอยู่</small>'}</span><span class="db-tracks">${bar(a, 'w')}${bar(b, 'r')}${bar(d, 'p')}</span></div>`).join('')}</div></section>`;
  }
  function distBox(st, act) {
    const chs = distCh ? [CH[distCh - 1]] : act, B = [[0, 4.99, '0–4'], [5, 6.99, '5–6'], [7, 8.99, '7–8'], [9, 10, '9–10']], cnt = [0, 0, 0, 0];
    let any = 0;
    if (chs.length) st.forEach(p => { const tot = chs.reduce((s, c) => s + P().parts(p.id, c.number).total, 0) / chs.length; any++; const i = B.findIndex(b => tot >= b[0] && tot <= b[1] + 0.001); cnt[i < 0 ? 0 : i]++; });
    const mx = Math.max(1, ...cnt), col = ['#ef4444', '#f59e0b', '#22c55e', '#2563eb'];
    return `<section class="paper db-dist"><div class="db-h"><h2>การกระจายคะแนนรวม</h2><select data-db="dist"><option value="0">เฉลี่ยบทที่เปิดแล้ว</option>${CH.map(c => `<option value="${c.number}" ${distCh === c.number ? 'selected' : ''}>บทที่ ${c.number}</option>`).join('')}</select></div>
      ${chs.length && any ? `<div class="db-hist">${B.map((b, i) => `<div class="db-col"><b>${cnt[i]} คน</b><i style="height:${Math.round(cnt[i] / mx * 100)}%;background:${col[i]}"></i><span>${b[2]}</span></div>`).join('')}</div><p class="sc-note">คะแนนเต็มบทละ 10 · ใช้ดูว่านักเรียนส่วนใหญ่อยู่ระดับไหน ถ้ากองอยู่ฝั่งซ้ายมาก ควรทบทวนบทนั้นก่อนไปต่อ</p>` : '<p class="db-empty">ยังไม่มีบทที่เริ่มเรียน</p>'}</section>`;
  }
  function missBox(st) {
    const PR = window.DT_PRACTICE || {}, agg = [];
    CH.forEach(c => { const set = PR[c.number]; if (!set) return; const tried = st.filter(p => rec(p.id, c.number).tries); if (!tried.length) return; set.items.forEach((it, i) => { const m = tried.filter(p => (rec(p.id, c.number).miss || []).includes(i)).length; if (m) agg.push([c, it, m, tried.length]); }); });
    agg.sort((a, b) => b[2] / b[3] - a[2] / a[3] || b[2] - a[2]);
    return `<section class="paper db-miss"><div class="db-h"><h2>ข้อในด่านฝึกที่ผิดบ่อย</h2></div>${agg.length ? `<ol class="db-mlist">${agg.slice(0, 5).map(([c, it, m, t]) => `<li><span class="db-pct" style="--p:${Math.round(m / t * 100)}%">${Math.round(m / t * 100)}%</span><div><b>${esc(it.q)}</b><small>บทที่ ${c.number} · ผิด ${m} จาก ${t} คนที่ทำ (ดูจากครั้งล่าสุด)</small></div></li>`).join('')}</ol><p class="sc-note">ใช้เลือกเรื่องที่ควรสอนซ่อม ข้อมูลนับเฉพาะการทำด่านฝึกตั้งแต่ระบบเริ่มเก็บข้อที่ผิด</p>` : '<p class="db-empty">ยังไม่มีข้อมูล เมื่อนักเรียนทำด่านฝึก ข้อที่ผิดบ่อยจะขึ้นที่นี่</p>'}</section>`;
  }

  /* ---------- รายงานรายคน ---------- */
  function studentReport(id) {
    const p = db().profiles[id]; if (!p) return '<section class="paper"><p>ไม่พบนักเรียนคนนี้</p><a class="btn secondary small" href="#teacher/overview">‹ กลับ</a></section>';
    const rows = CH.map(c => { const r = rec(id, c.number), s = subsOf(id, c), x = P().parts(id, c.number); return { c, r, s: s[0], x }; });
    const sum = Math.round(rows.reduce((a, o) => a + o.x.total, 0) * 10) / 10, MAX = CH.length * 10;
    const avg = k => { const v = rows.map(o => o.r[k]).filter(has); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
    const missing = []; rows.forEach(({ c, x }) => { if (x.work.v === null && x.work.state !== 'wait') missing.push(`บทที่ ${c.number}: ชิ้นงาน${x.work.state === 'fix' ? ' (ครูให้แก้)' : ''}`); if (x.post.v === null) missing.push(`บทที่ ${c.number}: ทดสอบหลังเรียน`); if (x.prac.v === null) missing.push(`บทที่ ${c.number}: ด่านฝึก`); });
    const labs = (D.activities || []).filter(a => (p.labs || {})[a.id] && p.labs[a.id].savedAt).length;
    const workCell = ({ c, s, x }) => s ? `<a href="#teacher/review/${encodeURIComponent(s.id)}">${x.work.v !== null ? `<b>${x.work.raw}</b>/100` : x.work.state === 'fix' ? 'ครูให้แก้' : 'รอตรวจ'}</a>` : '<span class="sc-none">ยังไม่ส่ง</span>';
    return `<section class="paper db-rep" id="db-rep"><div class="db-h"><div><span class="eyebrow">รายงานรายคน</span><h2>${esc(nameOf(p))}</h2><p class="muted">ห้อง ${esc(p.classroom)} · ปีการศึกษา ${esc(p.year)}</p></div><div class="tools-flex"><a class="btn secondary small" href="#teacher/scores">‹ ตารางคะแนน</a></div></div>
      <div class="sc-kpi"><div><small>คะแนนรวม</small><b>${sum}<small>/${MAX}</small></b></div><div><small>คิดเป็น</small><b>${Math.round(sum / MAX * 100)}%</b></div><div><small>ก่อน › หลังเรียน (เฉลี่ย)</small><b>${avg('pre') ?? '–'} › ${avg('post') ?? '–'}</b></div><div class="${missing.length ? 'warn' : 'good'}"><small>ยังขาด</small><b>${missing.length} รายการ</b></div></div>
      <div class="table-wrap"><table class="sc-table detail"><thead><tr><th>บท</th><th>ก่อนเรียน</th><th>หลังเรียน</th><th>ด่านฝึก</th><th>ชิ้นงาน</th><th>บอส</th><th>รวม/10</th></tr></thead><tbody>${rows.map(o => `<tr><th scope="row" title="${esc(o.c.title)}">บท ${o.c.number} · ${esc(o.c.title)}</th><td>${has(o.r.pre) ? Math.round(o.r.pre) : '–'}</td><td>${has(o.r.post) ? Math.round(o.r.post) : '–'}</td><td>${o.r.tries ? `${Math.round(o.r.best)}% <small>(${o.r.tries} ครั้ง)</small>` : '–'}</td><td>${workCell(o)}</td><td>${o.r.battle ? '⭐' : '–'}</td><td class="sc-sum"><b>${o.x.total}</b></td></tr>`).join('')}</tbody></table></div>
      ${missing.length ? `<div class="db-missing"><b>สิ่งที่ยังขาด</b><ul>${missing.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : '<p class="db-empty">🎉 ทำครบทุกอย่างแล้ว</p>'}</section>`;
  }
  function printReport(id) {
    const el = $('#db-rep'); if (!el) return;
    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>รายงานผลการเรียน</title><style>@page{size:A4;margin:14mm}body{font-family:Sarabun,Tahoma,sans-serif;font-size:13.5px;color:#111}h2{margin:0}.muted{color:#555;margin:2px 0 8px}.sc-kpi{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.sc-kpi>div{border:1px solid #999;border-radius:6px;padding:4px 10px}.sc-kpi small{display:block;color:#555}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #999;padding:4px 6px;text-align:center}tbody th{text-align:left}a{color:#111;text-decoration:none}.tools-flex,.eyebrow{display:none}.db-missing{margin-top:10px}.sign{display:flex;justify-content:space-between;margin-top:30px}</style></head><body><h1 style="font-size:18px">รายงานผลการเรียน · ${window.DT_CFG.full}</h1>${el.innerHTML}<div class="sign"><span>ลงชื่อครูผู้สอน ................................................</span><span>ลงชื่อผู้ปกครอง ................................................</span></div><p style="font-size:11px;color:#666">พิมพ์เมื่อ ${new Date().toLocaleString('th-TH')} · คะแนนรวมบทละ 10 = ชิ้นงาน ${P().weights().work} + หลังเรียน ${P().weights().post} + ด่านฝึก ${P().weights().prac}</p></body></html>`;
    let fr = document.getElementById('db-print'); if (fr) fr.remove(); fr = document.createElement('iframe'); fr.id = 'db-print'; fr.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden'; document.body.appendChild(fr);
    const d = fr.contentWindow.document; d.open(); d.write(html); d.close(); setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { /* ไม่พิมพ์ */ } }, 400);
  }

  /* ---------- ตั้งค่าการเรียน (หน้าเครื่องมือ) ---------- */
  /* วันที่แบบไทย เช่น "จันทร์ 10 พ.ย. 2569" */
  const thDate = d => { if (!d) return ''; try { return new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return d; } };
  function settingsCard() {
    const w = P().weights();
    return `<section class="paper db-set" id="db-set"><div class="db-h"><h2>⚙️ ตั้งค่าการเรียน</h2></div>
      <div class="db-set-part"><h3 class="sc-h">🔒 เปิด/ปิดบทเรียน</h3>
        <p class="db-set-why">บทที่ปิดไว้ นักเรียนจะเห็นรูปแม่กุญแจและเข้าไปเรียนไม่ได้ เหมาะกับการเปิดทีละบทตามที่สอนจริง ครูยังเข้าดูได้ทุกบท ส่วนผู้เข้าชมเห็นทุกบทเสมอ</p>
        <div class="db-lock-all"><button type="button" class="btn secondary small" data-db="lock-all" data-v="0">🔓 เปิดทุกบท</button><button type="button" class="btn secondary small" data-db="lock-all" data-v="1">🔒 ปิดทุกบท</button></div>
        <div class="db-locks">${CH.map(c => `<label class="db-lock ${isOpen(c.number) ? 'on' : ''}"><input type="checkbox" data-lock="${c.number}" ${isOpen(c.number) ? 'checked' : ''}><span class="db-sw" aria-hidden="true"><i></i></span><span class="db-lk-t"><b>บทที่ ${c.number}</b><small>${esc(c.title)}</small></span><em>${isOpen(c.number) ? '🔓 เปิดให้เรียน' : '🔒 ปิดอยู่'}</em></label>`).join('')}${(() => { const fo = !!db().settings.finalOpen; return `<label class="db-lock s8-lockrow ${fo ? 'on' : ''}"><input type="checkbox" data-lock="${window.DT_CFG.finalNo}" ${fo ? 'checked' : ''}><span class="db-sw" aria-hidden="true"><i></i></span><span class="db-lk-t"><b>Sector ${window.DT_CFG.finalNo} · สอบปลายภาค</b><small>เปิดเมื่อพร้อมสอบ ปิดเมื่อหมดเวลาสอบ (อ่านสรุปได้ตลอด)</small></span><em>${fo ? '🔓 เปิดให้สอบ' : '🔒 ปิดอยู่'}</em></label>`; })()}</div></div>
      <div class="db-set-part"><h3 class="sc-h">🏆 คะแนนรวมของแต่ละบท (เต็ม 10)</h3>
        <p class="db-set-why">คะแนนรวมของแต่ละบทแบ่งจาก 3 ส่วน ใช้ในหน้า "คะแนน" และในหน้าแฟ้มงานของนักเรียน ถ้าไม่ต้องการเปลี่ยน ไม่ต้องแก้ส่วนนี้ <b>ทั้งสามช่องต้องรวมกันได้ 10</b></p>
        <div class="db-w">${[['work', '📝 ชิ้นงาน', 'คะแนนครูตรวจ (เต็ม 100)'], ['post', '🏁 ทดสอบหลังเรียน', 'ร้อยละที่ทำได้'], ['prac', '🎮 ด่านฝึก', 'ร้อยละสูงสุดที่ทำได้']].map(([k, t, d]) => `<label class="db-wbox"><b>${t}</b><small>คิดจาก${d}</small><span><input type="number" min="0" max="10" step="1" data-w="${k}" value="${w[k]}"> คะแนน</span></label>`).join('')}<span id="db-wsum">รวม ${w.work + w.post + w.prac} / 10</span></div>
        <p class="db-set-ex" id="db-wex"></p></div>
      <div class="db-actions"><button type="button" class="btn green" data-db="save-set">💾 บันทึกการตั้งค่า</button><small>บันทึกแล้วนักเรียนจะเห็นค่าใหม่เมื่อเปิดเว็บครั้งถัดไป หรือกดเช็กผลตรวจ</small></div></section>`;
  }
  function weightExample() { const v = k => Number(($(`[data-w="${k}"]`) || {}).value) || 0, ex = $('#db-wex'); if (!ex) return; const a = v('work'), b = v('post'), c = v('prac'), t = Math.round((0.8 * a + 0.75 * b + 0.9 * c) * 10) / 10; ex.textContent = `ตัวอย่าง: ชิ้นงานได้ 80/100 › ${Math.round(0.8 * a * 10) / 10} · หลังเรียนได้ 75% › ${Math.round(0.75 * b * 10) / 10} · ด่านฝึกได้ 90% › ${Math.round(0.9 * c * 10) / 10} · รวม ${t} จาก 10 คะแนน`; }
  async function saveSettings() {
    const all = [...document.querySelectorAll('[data-lock]')].filter(i => !i.checked).map(i => Number(i.dataset.lock)), locked = all.filter(n => n <= window.DT_CFG.chapters), finalOpen = !all.includes(window.DT_CFG.finalNo);
    const weights = {}; document.querySelectorAll('[data-w]').forEach(i => { weights[i.dataset.w] = Number(i.value); });
    if (!['work', 'post', 'prac'].every(k => Number.isInteger(weights[k]) && weights[k] >= 0) || weights.work + weights.post + weights.prac !== 10) { app().notify('สัดส่วนคะแนนต้องเป็นจำนวนเต็ม และรวมกันได้ 10'); return; }
    const st = db().settings; st.locks = locked; delete st.due; st.weights = weights; st.finalOpen = finalOpen; app().save();
    if (window.DTCloud && window.DTCloud.on && window.DTCloud.saveConfig) { const done = app().busy('กำลังบันทึกการตั้งค่า…'); try { await window.DTCloud.saveConfig({ locks: locked, weights, finalOpen }); app().notify('บันทึกแล้ว · เปิดอยู่ ' + (CH.length - locked.length) + ' บท'); } catch (e) { app().notify((e && e.message) || 'บันทึกไม่สำเร็จ'); } finally { done(); } }
    else app().notify('บันทึกในเครื่องนี้แล้ว');
  }

  /* ---------- เหตุการณ์ ---------- */
  const rerenderOverview = () => { const y = scrollY; app().render(); scrollTo(0, y); };
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-db],[data-db-help]'); if (!b || b.tagName === 'SELECT') return;
    if (b.dataset.dbHelp) { helpTab = b.dataset.dbHelp; rerenderOverview(); return; }
    const k = b.dataset.db;
    if (k === 'remind') remindBox();
    if (k === 'copy') { const ta = $('#db-rm-text'); (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(() => app().notify('คัดลอกข้อความแล้ว')).catch(() => { ta.select(); app().notify('กด Ctrl+C เพื่อคัดลอก'); }); }
    if (k === 'print-rep') printReport(b.dataset.id);
    if (k === 'save-set') saveSettings();
    if (k === 'lock-all') document.querySelectorAll('[data-lock]').forEach(x => { x.checked = b.dataset.v === '0'; lockLook(x); });
  });
  document.addEventListener('change', e => {
    const t = e.target; if (t.id === 'db-rm-ch') remindText();
    if (t.dataset && t.dataset.db === 'dist') { distCh = +t.value; rerenderOverview(); }
  });
  document.addEventListener('input', e => { const t = e.target; if (!t.dataset) return; if (t.dataset.w) { const s = [...document.querySelectorAll('[data-w]')].reduce((a, i) => a + (Number(i.value) || 0), 0), o = $('#db-wsum'); if (o) { o.textContent = 'รวม ' + s + ' / 10' + (s !== 10 ? ' (ต้องได้ 10)' : ''); o.classList.toggle('bad', s !== 10); } weightExample(); } if (t.dataset.lock) lockLook(t); });
  new MutationObserver(() => { const ex = $('#db-wex'); if (ex && !ex.textContent) weightExample(); }).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });

  function lockLook(x) { const l = x.closest('.db-lock'); if (!l) return; l.classList.toggle('on', x.checked); l.querySelector('em').textContent = x.checked ? (x.dataset.lock === String(window.DT_CFG.finalNo) ? '🔓 เปิดให้สอบ' : '🔓 เปิดให้เรียน') : '🔒 ปิดอยู่'; }
  window.DTDash = { overview, studentReport, settingsCard, isOpen };
})();
