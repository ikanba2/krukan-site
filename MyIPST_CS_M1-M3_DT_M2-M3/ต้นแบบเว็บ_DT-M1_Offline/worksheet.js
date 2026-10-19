/* หน้าชิ้นงานประจำบท (ใบงาน V5 · 18 ต.ค. 2569)
   - คำถามมาจาก worksheet-v5-data.js (window.DT_WS5) สร้างจาก ชิ้นงาน_V5/_src/dt_m1.py · 1 ข้อถาม 1 เรื่อง
   - ชนิดช่องตอบ: choice multi number order match short long bullets table draw scale (+ showIf ซ่อนข้อที่ไม่เกี่ยวกับทางที่เลือก)
   - ข้อวาด: วาดบนกระดานในเครื่อง หรือถ่ายรูปภาพวาดบนกระดาษแล้วใส่เป็นพื้น (เขียนป้ายทับได้) เก็บเป็นรูป JPEG ในช่องของข้อนั้น
   - ข้อปิดตรวจอัตโนมัติทันที ข้อเปิดให้ AI ร่างและครูยืนยัน · งานเก่าแบบ work-v2 ยังแสดงและพิมพ์ได้
   ค่าที่เก็บใน fields[รหัสข้อ] เป็นข้อความเสมอ: choice "2" · number "440" · ตัวอื่นเป็น JSON · draw เป็น data:image/jpeg */
(function () {
  'use strict';
  const D = window.DT_DATA, WS = () => window.DT_WS5 || {}, G = () => (window.DT_WORK_GUIDE || { fields: {} });
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sum = r => (r && r.scores || []).reduce((a, b) => a + (+b || 0), 0);
  const fmt = iso => { if (!iso) return '—'; try { return new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };
  const TYPE = { choice: '◉ เลือก 1 ข้อ', multi: '☑ เลือกได้หลายข้อ', number: '# ตอบเป็นตัวเลข', order: '↕ เรียงลำดับ', match: '⇄ จับคู่', short: '✎ ตอบสั้น', long: '✎ อธิบาย', bullets: '• ตอบเป็นข้อ', table: '▦ ตาราง', draw: '✏️ วาดภาพ', scale: '★ ประเมินระดับ' };
  const AUTO = new Set(['choice', 'multi', 'number', 'order', 'match']);
  const TH = 'กขคงจฉชซ';
  const J = (s, d) => { try { const v = JSON.parse(s); return v == null ? d : v; } catch (e) { return d; } };

  /* ---------- ข้อมูลใบงาน ---------- */
  const sheetOf = n => WS()[String(n)] || null;
  const itemsOf = sh => sh ? sh.sections.flatMap(s => s.items) : [];
  const shown = (it, f) => !it.showIf || String(f[it.showIf.q] ?? '') === String(it.showIf.answer);
  const isV5 = (n, f) => { const sh = sheetOf(n); if (!sh) return false; if (!f) return true; const legacy = G().fields[n] && Object.keys(G().fields[n]).some(k => (f[k] || '').trim && (f[k] || '').trim()); return !legacy || itemsOf(sh).some(it => f[it.id]); };
  /* ลำดับเริ่มต้นของข้อเรียงลำดับ: สลับแบบคงที่ (ทุกคนเห็นเหมือนกัน และไม่ตรงกับคำตอบ) */
  const shuffled = items => { const a = items.map((t, i) => i), r = a.slice(1).concat(a[0]); return r.length > 2 ? [r[1], r[0], ...r.slice(2)].map(i => items[i]) : r.map(i => items[i]); };
  const tableRows = it => Array.isArray(it.rows) ? it.rows.length : it.rows;
  const fixedFirst = it => Array.isArray(it.rows);

  function answered(it, v) {
    if (v == null || v === '') return false;
    switch (it.type) {
      case 'multi': return J(v, []).length > 0;
      case 'order': return true;
      case 'match': { const m = J(v, {}); return it.pairs.every((p, i) => m[i] != null && m[i] !== ''); }
      case 'bullets': return J(v, []).filter(x => String(x || '').trim()).length === it.labels.length;
      case 'table': { const g = J(v, []); const n = tableRows(it), c0 = fixedFirst(it) ? 1 : 0; for (let r = 0; r < n; r++) for (let c = c0; c < it.columns.length; c++) { if (String((g[r] || [])[c] ?? '').trim() === '') return false; } return true; }
      case 'scale': { const s = J(v, {}); return s.level != null && String(s.why || '').trim().length > 0; }
      default: return String(v).trim().length > 0;
    }
  }
  /* คะแนนข้ออัตโนมัติ (สัดส่วน 0–1) · null = ข้อเปิด ให้ AI/ครูตรวจ */
  function autoScore(it, v) {
    if (it.type === 'table') {
      const keys = Object.keys(it.auto || {}); if (!keys.length) return null;
      const g = J(v, []); let ok = 0;
      keys.forEach(k => { const [r, c] = k.split(',').map(Number), want = it.auto[k], got = (g[r] || [])[c]; if (typeof want === 'number' ? Math.abs(Number(got) - want) < 1e-9 && String(got).trim() !== '' : String(got ?? '').trim() === String(want)) ok++; });
      return ok / keys.length;
    }
    if (!AUTO.has(it.type)) return null;
    if (v == null || v === '') return 0;
    switch (it.type) {
      case 'choice': return it.answer == null ? 1 : (Number(v) === it.answer ? 1 : 0);
      case 'multi': { const s = J(v, []), a = it.answer || []; const good = s.filter(x => a.includes(x)).length, bad = s.filter(x => !a.includes(x)).length; return Math.max(0, (good - bad) / a.length); }
      case 'number': { const x = Number(String(v).replace(/,/g, '')); return isFinite(x) && Math.abs(x - it.answer) <= (it.tolerance || 0) ? 1 : 0; }
      case 'order': { const s = J(v, shuffled(it.items)); return s.filter((t, i) => t === it.items[i]).length / it.items.length; }
      case 'match': { const m = J(v, {}); return it.pairs.filter((p, i) => Number(m[i]) === i).length / it.pairs.length; }
    }
    return null;
  }
  function autoText(n, f) {
    const sh = sheetOf(n); if (!sh) return '';
    const lines = []; let k = 0;
    itemsOf(sh).forEach(it => { if (!shown(it, f)) return; k++; const s = autoScore(it, f[it.id]); if (s != null) lines.push('ข้อ ' + k + ' (' + it.id + ') ตรวจอัตโนมัติ ได้ ' + (Math.round(s * it.points * 10) / 10) + '/' + it.points + ' · เกณฑ์ที่ ' + (it.crit + 1)); });
    return lines.join('\n');
  }
  function missing(n, f) {
    const sh = sheetOf(n); if (!sh) return null; let k = 0;
    for (const it of itemsOf(sh)) { if (!shown(it, f)) continue; k++; if (!answered(it, f[it.id])) return { id: it.id, msg: 'ยังไม่ได้ตอบข้อ ' + k + ' ตอบให้ครบทุกข้อก่อนส่งนะ' }; }
    return null;
  }
  function progress(n, f) { const sh = sheetOf(n), list = itemsOf(sh).filter(it => shown(it, f)); return [list.filter(it => answered(it, f[it.id])).length, list.length]; }
  /* คำอธิบายข้อให้ AI (ครูส่งไปพร้อมงาน) */
  function labels(n) {
    const sh = sheetOf(n); if (!sh) return null; const l = {}; let k = 0;
    itemsOf(sh).forEach(it => {
      k++;
      let t = 'ข้อ ' + k + ' [' + (TYPE[it.type] || it.type) + '] ' + it.prompt + ' · น้ำหนัก ' + it.points + ' คะแนน · เป็นหลักฐานของเกณฑ์ที่ ' + (it.crit + 1);
      if (it.options) t += ' · ตัวเลือก (เลขเริ่มที่ 0): ' + it.options.map((o, i) => i + '=' + o).join(', ');
      if (it.type === 'table') t += ' · คำตอบเป็น JSON แถวละรายการ คอลัมน์: ' + it.columns.map(c => c.label).join(' | ') + (Array.isArray(it.rows) ? ' · หัวแถว: ' + it.rows.join(' / ') : '');
      if (it.type === 'match') t += ' · ซ้าย: ' + it.pairs.map((p, i) => i + '=' + p[0]).join(', ') + ' · ขวา: ' + it.pairs.map((p, i) => i + '=' + p[1]).join(', ') + ' · คำตอบเป็น {ซ้าย: ขวา}';
      if (it.type === 'draw') t += ' · ภาพต้องมี: ' + it.mustShow.join('; ') + ' · ภาพของข้อนี้แนบเป็นรูป';
      if (it.ai && it.ai.length) t += ' · ประเด็นที่ต้องมี: ' + it.ai.join('; ');
      if (AUTO.has(it.type) || (it.type === 'table' && Object.keys(it.auto || {}).length)) t += ' · ข้อนี้ระบบตรวจอัตโนมัติแล้ว ดูผลในหัวข้อผลตรวจอัตโนมัติ';
      if (it.showIf) t += ' · แสดงเฉพาะเมื่อเลือกทางที่ ' + (it.showIf.answer + 1) + ' ถ้าไม่มีคำตอบแปลว่านักเรียนเลือกอีกทาง ไม่ต้องหักคะแนน';
      l[it.id] = t;
    });
    l.__auto = 'ผลตรวจอัตโนมัติของข้อปิด (ระบบคำนวณจากเฉลย)';
    const c = D.course.chapters.find(x => x.number === Number(n));
    l.__task = 'บทที่ ' + n + ' ' + (c ? c.title : '') + ' · ใบงาน: ' + sh.title + ' · สถานการณ์: ' + sh.context + ' · หมายเหตุครู: ' + sh.aiNote + ' · ให้คะแนนแต่ละเกณฑ์ตามสัดส่วนคะแนนของข้อที่เป็นหลักฐานของเกณฑ์นั้น';
    return l;
  }

  /* ---------- กล่องสถานะ/ผลตรวจบนสุด ---------- */
  function statusBox(c, latest, guest) {
    if (guest && (window.DT_CFG || {}).guestWork) return `<section class="ws-status guest"><b>👁️ โหมดผู้เข้าชม · ทำชิ้นงานได้ แต่ส่งให้ครูไม่ได้</b><p>ตอบในหน้านี้ได้เลย ระบบจำคำตอบไว้ในเครื่องนี้ ทำเสร็จแล้วกดพิมพ์ใบงาน A4 ไปใช้ต่อได้ ถ้าจะส่งให้ครูตรวจ ให้เข้าสู่ระบบเป็นนักเรียนก่อน</p><button type="button" class="btn small" data-action="student-role">เข้าสู่ระบบนักเรียน</button></section>`;
    if (guest) return `<section class="ws-status guest"><b>👁️ โหมดผู้เข้าชม</b><p>อ่านโจทย์และลองดูช่องตอบได้ ถ้าจะทำและส่งงาน ให้เข้าสู่ระบบเป็นนักเรียนก่อน</p><button type="button" class="btn small" data-action="student-role">เข้าสู่ระบบนักเรียน</button></section>`;
    if (!latest) return `<section class="ws-status draft"><b>✏️ ยังไม่ได้ส่ง</b><p>ตอบทีละข้อได้เลย ระบบบันทึกร่างให้อัตโนมัติ ตอบครบทุกข้อแล้วกด "ส่งให้ครูตรวจ" ด้านล่าง</p></section>`;
    const r = latest.review;
    const refresh = `<button type="button" class="btn ghost small" data-action="refresh-student">🔄 เช็กผลตรวจ</button>`;
    const ai = !r && latest.aiDraft;
    if (ai) { const tot = (ai.scores || []).reduce((a, b) => a + (+b || 0), 0); return `<section class="ws-status ai"><div class="ws-score ai"><b>${tot}</b><span>/ 100</span></div><div class="ws-st-body"><b>🤖 ผลตรวจเบื้องต้นจาก AI · ฉบับที่ ${latest.version}</b><span class="ws-wait-t">⏳ รอครูยืนยัน</span><ul class="ws-crit">${c.rubric.map((x, i) => `<li><span>${esc(x.criterion)}</span><b>${(ai.scores || [])[i] ?? 0}/${x.points}</b></li>`).join('')}</ul><p class="ws-comment">💬 ${esc(ai.comment)}</p><small class="muted">คะแนนนี้ AI ร่างให้ทันทีหลังส่ง ครูจะตรวจและยืนยันอีกครั้ง คะแนนอาจเปลี่ยนได้ ระหว่างนี้แก้งานแล้วส่งฉบับใหม่ได้</small> ${refresh}</div></section>`; }
    if (!r && latest.aiQueued) { aiPoll(); return `<section class="ws-status ai queued"><div class="ws-score ai"><b class="ws-spin">🤖</b></div><div class="ws-st-body"><b>ส่งแล้ว ฉบับที่ ${latest.version} · AI กำลังต่อคิวตรวจ</b><span class="ws-wait-t">⏳ รอคิว AI</span><p>ตอนนี้เพื่อนส่งงานพร้อมกันหลายคน AI จึงตรวจให้ไม่ทัน งานของเราส่งถึงครูเรียบร้อยแล้ว ไม่หาย AI จะตรวจให้ภายในประมาณ 5–10 นาที หน้านี้จะเช็กผลให้เองทุก 1 นาที หรือกดปุ่มเช็กผลตรวจก็ได้</p>${refresh}</div></section>`; }
    if (!r) return `<section class="ws-status waiting"><b>⏳ ส่งแล้ว ฉบับที่ ${latest.version} · รอครูตรวจ</b><p>ส่งเมื่อ ${fmt(latest.submittedAt)} · แก้แล้วส่งใหม่ได้ ครูจะตรวจฉบับล่าสุด</p>${refresh}</section>`;
    if (r.status === 'graded') return `<section class="ws-status graded"><div class="ws-score"><b>${sum(r)}</b><span>/ 100</span></div><div class="ws-st-body"><b>✅ ครูตรวจแล้ว · ฉบับที่ ${latest.version}</b><ul class="ws-crit">${c.rubric.map((x, i) => `<li><span>${esc(x.criterion)}</span><b>${r.scores[i] ?? 0}/${x.points}</b></li>`).join('')}</ul><p class="ws-comment">💬 ${esc(r.comment)}</p>${r.ai ? '<small class="muted">ข้อเสนอแนะนี้ AI ช่วยร่าง ครูตรวจและยืนยันแล้ว</small>' : ''}</div></section>`;
    return `<section class="ws-status revision"><b>🛠️ ครูขอให้ปรับปรุง · ฉบับที่ ${latest.version}</b><p class="ws-comment">💬 ${esc(r.comment)}</p><p>แก้คำตอบด้านล่าง แล้วกด "ส่งฉบับใหม่"</p>${refresh}</section>`;
  }

  /* ---------- ช่องตอบแต่ละชนิด (หน้าเว็บ) ---------- */
  function input(n, it, v, dis, f) {
    const a = `data-ws5="${it.id}" data-c="${n}" ${dis}`;
    switch (it.type) {
      case 'choice': return `<div class="w5-opts" role="radiogroup">${it.options.map((o, i) => `<label class="w5-opt"><input type="radio" name="w5-${it.id}" value="${i}" ${String(v) === String(i) ? 'checked' : ''} ${a}><span><b>${TH[i]}</b>${esc(o)}</span></label>`).join('')}</div>`;
      case 'multi': { const s = J(v, []); return `<div class="w5-opts">${it.options.map((o, i) => `<label class="w5-opt sq"><input type="checkbox" value="${i}" ${s.includes(i) ? 'checked' : ''} ${a}><span><b>${TH[i]}</b>${esc(o)}</span></label>`).join('')}</div>`; }
      case 'number': return `<label class="w5-num"><input type="text" inputmode="decimal" value="${esc(v || '')}" placeholder="ตัวเลข" ${a}><span>${esc(it.unit)}</span></label>`;
      case 'order': { const s = J(v, shuffled(it.items)); return `<ol class="w5-order">${s.map((t, i) => `<li><span>${esc(t)}</span><button type="button" data-w5-move="-1" data-i="${i}" ${a} ${i === 0 ? 'disabled' : ''} aria-label="เลื่อนขึ้น">▲</button><button type="button" data-w5-move="1" data-i="${i}" ${a} ${i === s.length - 1 ? 'disabled' : ''} aria-label="เลื่อนลง">▼</button></li>`).join('')}</ol>`; }
      case 'match': { const m = J(v, {}), right = it.pairs.map((p, i) => [i, p[1]]).sort((x, y) => x[1].localeCompare(y[1], 'th')); return `<div class="w5-match">${it.pairs.map((p, i) => `<label><span class="w5-l">${esc(p[0])}</span><select data-w5-pair="${i}" ${a}><option value="">เลือกคู่…</option>${right.map(([j, t]) => `<option value="${j}" ${String(m[i]) === String(j) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`).join('')}</div>`; }
      case 'short': return `<textarea class="w5-text" rows="2" maxlength="${it.maxChars || 300}" placeholder="${esc(it.starter || 'พิมพ์คำตอบ 1–2 ประโยค')}" ${a}>${esc(v || '')}</textarea>`;
      case 'long': return `<textarea class="w5-text" rows="5" maxlength="${it.maxChars || 1500}" placeholder="${esc(it.starter || 'พิมพ์คำตอบด้วยคำของตัวเอง')}" ${a}>${esc(v || '')}</textarea>`;
      case 'bullets': { const s = J(v, []); return `<div class="w5-bul">${it.labels.map((l, i) => `<label><b>• ${esc(l)}</b><input type="text" maxlength="300" value="${esc(s[i] || '')}" data-w5-cell="${i}" ${a}></label>`).join('')}</div>`; }
      case 'table': {
        const g = J(v, []), n0 = tableRows(it), fx = fixedFirst(it);
        const cols = it.columns.map((c, ci) => [c, ci]).filter(([, ci]) => !(fx && ci === 0));
        return `<div class="w5-rows">${Array.from({ length: n0 }, (_, r) => `<div class="w5-row"><div class="w5-row-h"><span>${r + 1}</span>${fx ? esc(it.rows[r]) : 'รายการที่ ' + (r + 1)}</div><div class="w5-row-f">${cols.map(([c, ci]) => {
          const val = (g[r] || [])[ci] ?? '', at = `data-w5-cell="${r},${ci}" ${a}`, lab = `<b>${esc(c.label)}${c.unit ? ` <small>(${esc(c.unit)})</small>` : ''}</b>`;
          if (c.type === 'select') return `<label class="w5-cellbox">${lab}<select ${at} class="${val ? 'has' : ''}"><option value="">แตะเพื่อเลือก</option>${c.options.map(o => `<option ${String(val) === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
          if (c.type === 'number') return `<label class="w5-cellbox">${lab}<input type="text" inputmode="decimal" value="${esc(val)}" ${at}></label>`;
          return `<label class="w5-cellbox">${lab}<textarea rows="1" maxlength="300" ${at}>${esc(val)}</textarea></label>`;
        }).join('')}</div></div>`).join('')}</div>`;
      }
      case 'scale': { const s = J(v, {}); return `<div class="w5-opts row">${it.labels.map((o, i) => `<label class="w5-opt"><input type="radio" name="w5-${it.id}" value="${i}" ${String(s.level) === String(i) ? 'checked' : ''} data-w5-scale="1" ${a}><span>${esc(o)}</span></label>`).join('')}</div><input class="w5-why" type="text" maxlength="300" placeholder="เหตุผลสั้น ๆ" value="${esc(s.why || '')}" data-w5-why="1" ${a}>`; }
      case 'draw': return drawBox(n, it, v, dis);
    }
    return '';
  }

  /* ---------- หน้าชิ้นงานของนักเรียน ---------- */
  function view(c, ctx) {
    const { w, subs, guest } = ctx, latest = subs[subs.length - 1], sh = sheetOf(c.number);
    if (!sh) return legacyView(c, ctx);
    const gw = guest && (window.DT_CFG || {}).guestWork, f = w.fields || {}, dis = guest && !gw ? 'disabled' : '';
    let k = 0;
    const secs = sh.sections.map((s, si) => `<section class="w5-sec"><h3 class="w5-sec-h">${esc(s.title)}</h3>${s.intro ? `<p class="w5-sec-i">${esc(s.intro)}</p>` : ''}${s.items.map(it => {
      const on = shown(it, f); if (on) k++;
      const fig = it.figure && window.DTQF ? window.DTQF.html(it.figure) : '';
      return `<article class="w5-q ${on ? '' : 'is-hidden'} ${answered(it, f[it.id]) ? 'done' : ''}" id="ws-q-${it.id}" data-q="${it.id}" ${it.showIf ? `data-if="${it.showIf.q}:${it.showIf.answer}"` : ''}><div class="w5-q-head"><span class="w5-no">${on ? k : '·'}</span><h4>${esc(it.prompt)}</h4><span class="w5-tag t-${it.type}">${TYPE[it.type] || ''}</span></div>${fig}${input(c.number, it, f[it.id], dis, f)}</article>`;
    }).join('')}</section>`).join('');
    const [d, t] = progress(c.number, f);
    const hist = subs.length > 1 ? `<details class="ws-hist"><summary>📚 ประวัติการส่ง (${subs.length} ฉบับ)</summary><ul>${subs.slice().reverse().map(s => `<li><span>ฉบับที่ ${s.version} · ${fmt(s.submittedAt)}</span><span>${s.review ? (s.review.status === 'graded' ? '✅ ' + sum(s.review) + '/100' : '🛠️ ขอให้ปรับปรุง') : '⏳ รอตรวจ'}</span><button type="button" class="btn ghost small" data-action="print-sub-a4" data-id="${esc(s.id)}">🖨️</button></li>`).join('')}</ul></details>` : '';
    return `<div class="ws ws5">
      ${statusBox(c, latest, guest)}
      <section class="ws-task"><div class="ws-task-head"><span class="eyebrow">ชิ้นงานบทที่ ${c.number} · เต็ม 100 คะแนน · ใช้เวลาประมาณ ${sh.minutes} นาที</span><button type="button" class="btn ghost small" data-action="print-work-a4" data-c="${c.number}">🖨️ พิมพ์ใบงาน A4</button></div>
        <h2>${esc(sh.title)}</h2>
        <div class="w5-ctx"><span>📖 สถานการณ์</span><p>${esc(sh.context)}</p></div>
        <p class="w5-howto">ตอบทีละข้อ ข้อละ 1 เรื่อง ข้อที่เป็นตัวเลือก ตัวเลข จับคู่ และเรียงลำดับ ระบบตรวจให้ทันทีเมื่อส่ง ข้อที่ต้องเขียนหรือวาด ครูจะตรวจ</p>
        <details class="ws-rubric"><summary>🎯 เกณฑ์ให้คะแนน (เต็ม 100)</summary><ul>${c.rubric.map(r => `<li><span>${esc(r.criterion)}</span><b>${r.points}</b></li>`).join('')}</ul></details>
      </section>
      ${secs}
      ${hist}
      <div class="ws-bar" role="region" aria-label="บันทึกและส่งงาน"><span class="ws-count" id="ws-count">ตอบแล้ว <b>${d}/${t}</b> ข้อ</span>
        ${gw ? `<button type="button" class="btn secondary" data-action="print-work-a4" data-c="${c.number}">🖨️ พิมพ์ใบงาน A4</button><button type="button" class="btn green" disabled aria-disabled="true" title="ผู้เข้าชมส่งงานให้ครูไม่ได้ ต้องเข้าสู่ระบบเป็นนักเรียนก่อน">🔒 ส่งให้ครูไม่ได้ (ผู้เข้าชม)</button>` : guest ? '' : `<button type="button" class="btn secondary" data-action="save-work">💾 บันทึกร่าง</button><button type="button" class="btn green" data-action="submit-work" data-c="${c.number}">🚀 ${latest ? 'ส่งฉบับใหม่' : 'ส่งให้ครูตรวจ'}</button>`}</div>
    </div>`;
  }

  /* ---------- เก็บคำตอบ ---------- */
  let hooks = null, saveT = null;
  const fieldsOf = n => hooks.draft(n).fields;
  const persist = (soon) => { clearTimeout(saveT); saveT = setTimeout(() => hooks && hooks.save(), soon ? 50 : 500); };
  function refreshUi(n) {
    const f = fieldsOf(n), sh = sheetOf(n); if (!sh) return;
    let k = 0;
    itemsOf(sh).forEach(it => {
      const el = document.getElementById('ws-q-' + it.id); if (!el) return;
      const on = shown(it, f); el.classList.toggle('is-hidden', !on); if (on) k++;
      const no = el.querySelector('.w5-no'); if (no) no.textContent = on ? k : '·';
      el.classList.toggle('done', answered(it, f[it.id]));
    });
    const [d, t] = progress(n, f), box = document.getElementById('ws-count'); if (box) box.innerHTML = `ตอบแล้ว <b>${d}/${t}</b> ข้อ`;
  }
  /* งานอยู่ในคิว AI: เช็กผลจากเซิร์ฟเวอร์เองทุก 1 นาที ขณะที่ยังเปิดหน้าชิ้นงานอยู่ (สูงสุด 15 ครั้ง) */
  let pollT = 0, pollN = 0;
  function aiPoll() {
    if (pollT || pollN >= 15 || !window.DTCloud || !window.DTCloud.pullStudent) return;
    pollT = setTimeout(() => { pollT = 0; pollN++; if (!document.querySelector('.ws-status.queued')) return;
      window.DTCloud.pullStudent(false).then(() => { if (document.querySelector('.ws-status.queued') && window.DTApp && window.DTApp.render) window.DTApp.render(); }).catch(() => {}); }, 60000);
  }
  function itemById(n, id) { return itemsOf(sheetOf(n)).find(x => x.id === id); }
  function readInput(t) {
    const n = +t.dataset.c, id = t.dataset.ws5, it = itemById(n, id); if (!it || !hooks) return;
    const f = fieldsOf(n), box = document.getElementById('ws-q-' + id);
    switch (it.type) {
      case 'choice': f[id] = t.value; break;
      case 'multi': f[id] = JSON.stringify([...box.querySelectorAll('input[type=checkbox]:checked')].map(x => +x.value)); break;
      case 'match': { const m = {}; box.querySelectorAll('select[data-w5-pair]').forEach(s => { if (s.value !== '') m[s.dataset.w5Pair] = +s.value; }); f[id] = JSON.stringify(m); break; }
      case 'bullets': f[id] = JSON.stringify([...box.querySelectorAll('[data-w5-cell]')].map(x => x.value)); break;
      case 'table': { const g = J(f[id], []); const [r, ci] = t.dataset.w5Cell.split(',').map(Number); while (g.length <= r) g.push([]); g[r][ci] = t.value; f[id] = JSON.stringify(g); if (t.tagName === 'SELECT') t.classList.toggle('has', !!t.value); break; }
      case 'scale': { const s = J(f[id], {}); if (t.dataset.w5Scale) s.level = +t.value; if (t.dataset.w5Why) s.why = t.value; f[id] = JSON.stringify(s); break; }
      default: f[id] = t.value;
    }
    persist(); refreshUi(n);
  }
  document.addEventListener('input', e => { const t = e.target; if (t.matches && t.matches('[data-ws5]:not(button):not([type=file])')) { if (t.tagName === 'TEXTAREA') grow(t); readInput(t); } });
  document.addEventListener('change', e => { const t = e.target; if (t.matches && t.matches('select[data-ws5], input[type=radio][data-ws5], input[type=checkbox][data-ws5]')) readInput(t); });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button[data-w5-move]'); if (!b || !hooks) return;
    const n = +b.dataset.c, it = itemById(n, b.dataset.ws5), f = fieldsOf(n), s = J(f[it.id], shuffled(it.items)), i = +b.dataset.i, j = i + (+b.dataset.w5Move);
    if (j < 0 || j >= s.length) return; [s[i], s[j]] = [s[j], s[i]]; f[it.id] = JSON.stringify(s); persist(true);
    const box = document.getElementById('ws-q-' + it.id), ol = box.querySelector('.w5-order'); ol.outerHTML = input(n, it, f[it.id], '', f).replace(/^<ol/, '<ol'); refreshUi(n);
    const nb = box.querySelectorAll('button[data-w5-move="' + b.dataset.w5Move + '"]')[j]; if (nb && !nb.disabled) nb.focus();
  });
  function grow(t) { t.style.height = 'auto'; t.style.height = Math.min(600, t.scrollHeight + 4) + 'px'; }

  /* ---------- กระดานวาด (ชิ้นส่วนย้ายได้) ----------
     เด็กส่วนใหญ่ใช้เมาส์ จึงเน้นของสำเร็จรูป: อีโมจิแยกหมวด กล่องข้อความ รูปทรง เส้นบอกขนาด
     ทุกชิ้นวางแล้วลากย้าย ขยาย ย่อ หรือลบได้ · มีโหมดเต็มจอ · ภาพที่บันทึกแล้วกลายเป็นพื้นหลัง แล้ววางชิ้นใหม่ทับได้ */
  const EMO = [
    ['🧑', 'คน', '🧑‍🎓 👦 👧 🧒 👩‍🏫 👨‍🏫 👴 👵 👨‍🌾 👩‍🍳 👷 🧑‍🔧 🧑‍💻 🧑‍⚕️ 🙋 🤷 🧍 🚶 🏃 🧑‍🦽'],
    ['😀', 'ท่าทาง', '😀 😊 😍 🤔 😢 😡 😴 😱 👍 👎 👏 🙌 ✋ 👉 👈 👆 👇 💪 🤝 🙏'],
    ['🔧', 'เครื่องมือ', '✂️ 📏 📐 🔨 🪛 🔧 🪚 🧰 🖊️ ✏️ 🖌️ 📎 🧷 🪢 🧲 🪜 🧪 🔬 🧯 🥽'],
    ['💡', 'ไฟฟ้า·เทคโนโลยี', '💡 🔋 🔌 ⚡ 📱 💻 🖥️ ⌨️ 🖱️ 🖨️ 📡 🛰️ 📶 🤖 ⚙️ 🎛️ 🌡️ ⏱️ 📷 🔊'],
    ['📦', 'ของใช้', '📦 🧺 🪣 🧴 🧹 🗑️ 🪑 🛏️ 🚪 🪟 👟 👕 🎒 📚 📒 🧻 🥤 🍱 🔑 🧸'],
    ['🥭', 'อาหาร·ผลผลิต', '🥭 🍌 🍎 🍉 🍊 🍇 🥥 🍚 🍗 🍳 🥚 🥬 🥕 🌽 🌶️ 🍞 🍜 🧃 🍯 🐟'],
    ['🏫', 'สถานที่', '🏫 🏠 🏡 🏪 🏭 🏥 🏢 🛕 🌳 🌾 🏞️ 🛣️ 🌉 🚧 🅿️ 🚻 ♿ 🚏 🗺️ 🧱'],
    ['🚗', 'ยานพาหนะ', '🚗 🛻 🚚 🚛 🛵 🏍️ 🚲 🛺 🚌 🚑 🚒 🚓 🚜 🚂 ✈️ 🚁 🚤 ⛽ 🚦 🛞'],
    ['🌳', 'ธรรมชาติ', '☀️ 🌤️ ☁️ 🌧️ ⛈️ 🌈 💧 🌊 🔥 🌬️ 🌱 🌿 🍃 🌸 🐝 🐛 🐔 🐄 🐕 🐈'],
    ['✅', 'สัญลักษณ์', '✅ ❌ ⚠️ ❓ ❗ ⭐ ❤️ 💯 🔴 🟢 🟡 🔵 ➕ ➖ ✖️ ➗ 💬 💭 🔁 ♻️']
  ].map(([i, n, s]) => [i, n, s.split(' ')]);
  /* กล่องสำเร็จรูป (ผังงานและกล่องคำพูด): [ชนิด, ชื่อปุ่ม, ข้อความเริ่มต้น, กว้าง, สูง, สี] · ดัดแปลงจากกระดานของวิชาวิทยาการคำนวณ */
  const SHP = [['start', '⬭ เริ่ม/จบ', 'เริ่ม', 170, 58, '#16a34a'], ['process', '▭ ทำงาน', 'คำนวณ…', 200, 70, '#2563eb'], ['decision', '◇ ตัดสินใจ', 'เงื่อนไข?', 210, 110, '#f97316'], ['io', '▱ รับ/แสดงผล', 'รับข้อมูล…', 210, 70, '#7c3aed'],
    ['bubble', '💬 กล่องคำพูด', 'พูดว่า…', 220, 96, '#111827'], ['think', '💭 ความคิด', 'คิดว่า…', 220, 100, '#2563eb'], ['snote', '📝 ป้ายโน้ต', 'โน้ต', 170, 90, '#eab308'], ['label', '🏷️ ป้ายชื่อ', 'ชื่อ', 150, 48, '#e11d48']];
  const TPL_CAT = { flow: -1, storyboard3: 0, route: 6, bar5: 9 };
  const TOOLS = [['move', '👆 เลือก/ย้าย'], ['stamp', '😀 อีโมจิ'], ['note', '💬 กล่องข้อความ'], ['text', '🔤 ตัวหนังสือ'], ['rect', '▭ กรอบ'], ['frect', '⬛ สี่เหลี่ยมทึบ'], ['circle', '◯ วงกลม'], ['arrow', '➤ ลูกศร'], ['line', '📏 เส้นตรง'], ['dim', '↔ เส้นบอกขนาด'], ['pen', '✏️ วาดเอง'], ['erase', '🧽 ยางลบ']];
  const COLORS = ['#111827', '#e11d48', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed'];
  const SIZES = [['S', 'เล็ก'], ['M', 'กลาง'], ['L', 'ใหญ่']];
  const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif', TXT_FONT = 'Sarabun, Tahoma, sans-serif';
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
  function wrapText(c, s, maxW) { const out = []; String(s || '').split('\n').forEach(par => { const parts = seg ? [...seg.segment(par)].map(z => z.segment) : [...par]; let line = ''; parts.forEach(w => { if (line && c.measureText(line + w).width > maxW) { out.push(line); line = w.replace(/^\s+/, ''); } else line += w; }); out.push(line); }); return out; }
  const tint = (hex, a) => { const v = parseInt(hex.slice(1), 16); return `rgba(${v >> 16 & 255},${v >> 8 & 255},${v & 255},${a})`; };
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  /* พื้นแม่แบบของโจทย์ (canvas: "template:ชื่อ") วาดไว้ให้ก่อน นักเรียนจะได้ไม่ต้องเริ่มจากหน้าว่าง */
  function paintTpl(c, tpl, labs) {
    const W = 900, H = 560, lines = (step, ox, oy, col) => { c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); for (let i = ox % step; i <= W; i += step) { c.moveTo(i + .5, 0); c.lineTo(i + .5, H); } for (let j = oy % step; j <= H; j += step) { c.moveTo(0, j + .5); c.lineTo(W, j + .5); } c.stroke(); };
    c.save();
    if (tpl === 'route') lines(30, 0, 0, '#dfe5f2');
    if (tpl === 'flow') { c.fillStyle = '#dfe5f2'; for (let i = 15; i < W; i += 30) for (let j = 15; j < H; j += 30) c.fillRect(i - 1, j - 1, 2, 2); }
    if (tpl === 'bar5') {
      lines(40, 110, 500, '#e6ebf5');
      c.strokeStyle = '#111827'; c.lineWidth = 3; c.lineCap = 'square'; c.beginPath(); c.moveTo(110, 70); c.lineTo(110, 500); c.lineTo(870, 500); c.stroke();
      c.font = `600 16px ${TXT_FONT}`; c.fillStyle = '#334155'; c.textBaseline = 'middle';
      c.textAlign = 'right'; for (let k = 0; k <= 10; k++) { const y = 500 - k * 40; c.fillRect(103, y - 1, 7, 2); c.fillText(String(k), 96, y); }
      c.textAlign = 'center'; ['ม.1/1', 'ม.1/2', 'ม.1/3', 'ม.1/4', 'ม.1/5'].forEach((t, i) => c.fillText(t, 190 + i * 150, 522));
      c.font = `700 16px ${TXT_FONT}`; c.fillText('ห้องเรียน', 490, 548);
    }
    if (tpl === 'storyboard3') {
      const m = 16, w = (W - m * 4) / 3;
      for (let i = 0; i < 3; i++) {
        const x0 = m + i * (w + m); rr(c, x0, m, w, H - m * 2, 12); c.fillStyle = '#fbfcff'; c.fill(); c.strokeStyle = '#94a3b8'; c.lineWidth = 3; c.stroke();
        c.save(); rr(c, x0, m, w, H - m * 2, 12); c.clip(); c.fillStyle = '#eef2ff'; c.fillRect(x0, m, w, 40); c.restore();
        c.fillStyle = '#1e293b'; c.font = `700 17px ${TXT_FONT}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(`ช่อง ${i + 1} · ${(labs && labs[i]) || ''}`.slice(0, 34), x0 + 12, m + 20);
      }
    }
    c.restore();
  }
  /* ชิ้นที่วางไว้ให้ตั้งแต่แรก (ย้ายหรือลบได้) */
  function tplObjs(tpl) {
    const E = (e, x, y) => ({ t: 'stamp', e, x, y, s: 66 }), T = (txt, cx, y) => ({ t: 'text', txt, x: cx - txt.length * 5.6, y, s: 20, c: '#111827' });
    if (tpl === 'route') return [E('🏛️', 90, 263), T('หอประชุม', 90, 302), E('🍽️', 390, 263), T('ทางแยกโรงอาหาร', 390, 302), E('🚩', 810, 263), T('จุดรวมพล (สนาม)', 810, 302)];
    if (tpl === 'flow') return [{ t: 'shape', k: 'start', txt: 'เริ่ม', x: 365, y: 22, w: 170, h: 56, c: '#16a34a', s: 22 }, { t: 'shape', k: 'start', txt: 'จบ', x: 365, y: 482, w: 170, h: 56, c: '#e11d48', s: 22 }];
    return [];
  }
  function paintShape(c, o) {
    const { x, y, w, h, k } = o, color = o.c; c.save(); c.lineWidth = 3; c.strokeStyle = color; c.fillStyle = k === 'snote' ? '#fff6bf' : k === 'label' ? color : '#fff';
    c.beginPath();
    if (k === 'start') rr(c, x, y, w, h, h / 2);
    else if (k === 'decision') { c.moveTo(x + w / 2, y); c.lineTo(x + w, y + h / 2); c.lineTo(x + w / 2, y + h); c.lineTo(x, y + h / 2); c.closePath(); }
    else if (k === 'io') { const s = Math.min(26, w / 5); c.moveTo(x + s, y); c.lineTo(x + w, y); c.lineTo(x + w - s, y + h); c.lineTo(x, y + h); c.closePath(); }
    else if (k === 'bubble') { const bh = h - 18; rr(c, x, y, w, bh, 16); c.moveTo(x + 30, y + bh - 1); c.lineTo(x + 24, y + h); c.lineTo(x + 54, y + bh - 1); }
    else if (k === 'think') c.ellipse(x + w / 2, y + (h - 22) / 2, w / 2, (h - 22) / 2, 0, 0, Math.PI * 2);
    else if (k === 'snote') { c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h - 18); c.lineTo(x + w - 18, y + h); c.lineTo(x, y + h); c.closePath(); }
    else rr(c, x, y, w, h, 6);
    c.fill(); if (k !== 'label') { if (k !== 'snote') { c.fillStyle = tint(color, .1); c.fill(); } c.stroke(); }
    if (k === 'bubble') { c.fillStyle = '#fff'; c.fillRect(x + 32, y + h - 21, 20, 5); }
    if (k === 'think') [[x + 26, y + h - 14, 7], [x + 12, y + h - 4, 4]].forEach(([cx, cy, r]) => { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.stroke(); });
    const fs = o.s || 20, inner = k === 'decision' ? w * .62 : k === 'io' ? w - 56 : w - 24, cy = y + (k === 'bubble' ? h - 18 : k === 'think' ? h - 22 : h) / 2;
    c.font = `700 ${fs}px ${TXT_FONT}`; c.fillStyle = k === 'label' ? '#fff' : '#111827'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const ls = wrapText(c, o.txt || '', inner).slice(0, 4); ls.forEach((l, i) => c.fillText(l, x + w / 2, cy + (i - (ls.length - 1) / 2) * fs * 1.22));
    c.restore();
  }
  function drawBox(n, it, v, dis) {
    const ro = !!dis, tpl = String(it.canvas || '').replace(/^template:/, ''), cat0 = TPL_CAT[tpl] ?? 0;
    return `<div class="w5-draw ${it.canvas === 'grid' ? 'grid' : ''}" data-w5-draw="${it.id}" data-c="${n}" data-tpl="${esc(tpl)}" data-lab="${esc(JSON.stringify(it.mustShow || []))}">
      ${ro ? '' : `<div class="w5-fs-q"><b>โจทย์:</b> ${esc(it.prompt)}</div>`}
      ${ro ? '' : `<p class="w5-draw-how">ไม่ต้องวาดเก่ง ใช้ <b>อีโมจิ</b> <b>กล่องข้อความ</b> และ <b>รูปทรงสำเร็จรูป</b> วางแล้วลากย้าย ขยาย หรือลบได้ ถ้ากระดานเล็กไป กด <b>⛶ เต็มจอ</b> หรือจะวาดบนกระดาษแล้วกด 📷 ใส่รูปถ่ายก็ได้</p>
      <div class="w5-tools" role="toolbar" aria-label="เครื่องมือวาด">
        <div class="w5-trow">${TOOLS.map(([k, t]) => `<button type="button" data-w5-tool="${k}" class="${k === 'stamp' ? 'on' : ''}">${t}</button>`).join('')}</div>
        <div class="w5-trow">${COLORS.map((c, i) => `<button type="button" class="w5-col ${i === 0 ? 'on' : ''}" data-w5-color="${c}" style="--c:${c}" aria-label="สี ${i + 1}"></button>`).join('')}
          <span class="w5-sep"></span>${SIZES.map(([k, t]) => `<button type="button" data-w5-size="${k}" class="${k === 'M' ? 'on' : ''}">${t}</button>`).join('')}
          <span class="w5-sep"></span><button type="button" data-w5-grow="1.25" title="ขยายชิ้นที่เลือก">➕ ขยาย</button><button type="button" data-w5-grow="0.8" title="ย่อชิ้นที่เลือก">➖ ย่อ</button><button type="button" data-w5-del="1">❌ ลบชิ้นที่เลือก</button>
          <span class="w5-sep"></span><button type="button" data-w5-undo="1">↶ ย้อน</button><button type="button" data-w5-clear="1">🗑️ ล้างทั้งหมด</button>
          <label class="w5-photo">📷 ใส่รูปถ่าย<input type="file" accept="image/*" data-w5-photo="1" hidden></label>
          <button type="button" class="w5-full-btn" data-w5-full="1">⛶ เต็มจอ</button></div>
        <div class="w5-emo" data-emo-wrap="1"><div class="w5-emo-tabs" role="tablist"><button type="button" role="tab" data-w5-cat="-1" class="${cat0 === -1 ? 'on' : ''}">🔷 ผังงาน·กล่องคำพูด</button>${EMO.map(([i, nm], k) => `<button type="button" role="tab" data-w5-cat="${k}" class="${k === cat0 ? 'on' : ''}" aria-selected="${k === cat0}">${i} ${nm}</button>`).join('')}</div>
          <div class="w5-emo-grid shp" data-w5-grid="-1" ${cat0 === -1 ? '' : 'hidden'}>${SHP.map(([k, t]) => `<button type="button" data-w5-shape="${k}">${t}</button>`).join('')}</div>
          ${EMO.map(([, , list], k) => `<div class="w5-emo-grid" data-w5-grid="${k}" ${k === cat0 ? '' : 'hidden'}>${list.map((e, j) => `<button type="button" data-w5-emo="${e}" class="${k === cat0 && j === 0 ? 'on' : ''}" aria-label="อีโมจิ ${e}">${e}</button>`).join('')}</div>`).join('')}</div>
      </div>`}
      <div class="w5-canvas-wrap"><canvas width="900" height="560" aria-label="กระดานวาดของข้อนี้"></canvas>${ro ? '' : '<input type="text" class="w5-txt" maxlength="80" hidden aria-label="พิมพ์ข้อความ แล้วกด Enter">'}${v ? '' : `<div class="w5-empty">${ro ? 'ยังไม่มีภาพ' : 'เลือกอีโมจิด้านบน แล้วคลิกบนกระดานเพื่อวาง'}</div>`}</div>
      <p class="w5-must"><b>ในภาพต้องมี:</b> ${it.mustShow.map(esc).join(' · ')}</p></div>`;
  }
  function boardStyle() {
    if (document.getElementById('w5-board-css')) return;
    const s = document.createElement('style'); s.id = 'w5-board-css';
    s.textContent = `.w5-tools{flex-direction:column;align-items:stretch!important}.w5-trow{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.w5-emo{border-top:2px dashed #c9d2e6;padding-top:6px;display:grid;gap:6px}.w5-emo-tabs{display:flex;flex-wrap:wrap;gap:4px}.w5-emo-tabs button{font-size:13px!important;padding:3px 8px!important}
.w5-emo-grid{display:flex;flex-wrap:wrap;gap:4px}.w5-emo-grid[hidden]{display:none}.w5-emo-grid button{font:26px/1 ${EMOJI_FONT}!important;padding:4px 6px!important;background:#fff!important;min-width:44px}
.w5-emo-grid button.on{background:#ffe08a!important;color:inherit!important;outline:3px solid #f59e0b}
.w5-txt{position:absolute;z-index:3;min-width:180px;font:600 20px ${TXT_FONT};padding:4px 8px;border:3px solid #2563eb;background:#fff;color:#111}
.w5-full-btn{background:#fde68a!important}.w5-emo-grid.shp button{font:600 15px/1.2 var(--display,Kanit,sans-serif)!important;min-width:0}.w5-fs-q{display:none}.w5-draw.is-full .w5-fs-q{display:block;padding:6px 10px;background:#fff;border:2px solid #111827;font-size:15px;line-height:1.45}
.w5-draw.is-full{position:fixed;inset:0;z-index:2147483000;background:#eef2fb;padding:8px;overflow:auto;display:flex!important;flex-direction:column;gap:6px}
.w5-draw.is-full .w5-draw-how,.w5-draw.is-full .w5-must{display:none}
.w5-draw.is-full .w5-canvas-wrap{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:#cfd8ea}
.w5-draw.is-full .w5-canvas-wrap canvas{width:auto;height:auto;max-width:100%;max-height:100%}
.w5-draw.is-full .w5-emo-grid button{font-size:30px!important;min-width:50px}.w5-draw.is-full .w5-emo-grid.shp button{font-size:15px!important;min-width:0}
body.w5-noscroll{overflow:hidden}body.w5-noscroll #header,body.w5-noscroll header.topbar,body.w5-noscroll .cloud-chip,body.w5-noscroll #cloud-chip,body.w5-noscroll .ws-bar{visibility:hidden}`;
    document.head.appendChild(s);
  }
  const boards = new Map();
  function mountBoard(el) {
    boardStyle();
    const id = el.dataset.w5Draw, n = +el.dataset.c, cv = el.querySelector('canvas'), x = cv.getContext('2d'), ro = !el.querySelector('.w5-tools');
    const st = { tool: 'stamp', emo: EMO[0][2][0], color: '#111827', size: 'M', objs: [], base: null, sel: -1, undo: [], drag: null };
    boards.set(id, st);
    const SZ = { S: { stamp: 50, text: 22, w: 3 }, M: { stamp: 80, text: 30, w: 6 }, L: { stamp: 130, text: 42, w: 10 } };
    const tpl = el.dataset.tpl || ''; let labs = []; try { labs = JSON.parse(el.dataset.lab || '[]'); } catch (e) { /* ไม่มีป้าย */ }
    const bg = () => { x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); if (tpl) { paintTpl(x, tpl, labs); return; } if (el.classList.contains('grid')) { x.strokeStyle = '#dbe3f0'; x.lineWidth = 1; for (let i = 0; i <= cv.width; i += 30) { x.beginPath(); x.moveTo(i + .5, 0); x.lineTo(i + .5, cv.height); x.stroke(); } for (let j = 0; j <= cv.height; j += 30) { x.beginPath(); x.moveTo(0, j + .5); x.lineTo(cv.width, j + .5); x.stroke(); } } };
    const head = (a, b, w) => { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), h = 12 + w * 2; x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(b[0] - h * Math.cos(ang - .45), b[1] - h * Math.sin(ang - .45)); x.moveTo(b[0], b[1]); x.lineTo(b[0] - h * Math.cos(ang + .45), b[1] - h * Math.sin(ang + .45)); x.stroke(); };
    const noteBox = o => { x.font = `600 ${o.s}px ${TXT_FONT}`; const w = x.measureText(o.txt).width + 24, h = o.s * 1.5; return [o.x, o.y, w, h]; };
    const bbox = o => {
      if (o.t === 'stamp') return [o.x - o.s / 2, o.y - o.s / 2, o.s, o.s];
      if (o.t === 'text') { x.font = `700 ${o.s}px ${TXT_FONT}`; return [o.x, o.y, x.measureText(o.txt).width, o.s * 1.3]; }
      if (o.t === 'note') return noteBox(o);
      if (o.t === 'shape') return [o.x, o.y, o.w, o.h];
      if (o.t === 'path') { const xs = o.pts.map(p => p[0]), ys = o.pts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; }
      return [Math.min(o.a[0], o.b[0]), Math.min(o.a[1], o.b[1]), Math.abs(o.b[0] - o.a[0]), Math.abs(o.b[1] - o.a[1])];
    };
    const paint = o => {
      x.save(); x.strokeStyle = o.c; x.fillStyle = o.c; x.lineWidth = o.w || 3; x.lineCap = 'round'; x.lineJoin = 'round';
      if (o.t === 'stamp') { x.font = `${o.s}px ${EMOJI_FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.e, o.x, o.y + o.s * 0.05); }
      else if (o.t === 'text') { x.font = `700 ${o.s}px ${TXT_FONT}`; x.textBaseline = 'top'; x.fillText(o.txt, o.x, o.y); }
      else if (o.t === 'note') { const [bx, by, bw, bh] = noteBox(o); x.fillStyle = '#fff'; x.lineWidth = 3; x.fillRect(bx, by, bw, bh); x.strokeRect(bx, by, bw, bh); x.fillStyle = o.c; x.textBaseline = 'middle'; x.fillText(o.txt, bx + 12, by + bh / 2); }
      else if (o.t === 'path') { x.strokeStyle = o.er ? '#fff' : o.c; x.lineWidth = o.er ? 26 : o.w; x.beginPath(); o.pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }
      else if (o.t === 'shape') paintShape(x, o);
      else if (o.t === 'rect') x.strokeRect(...bbox(o));
      else if (o.t === 'frect') { const b = bbox(o); x.fillStyle = tint(o.c, .85); x.fillRect(...b); x.lineWidth = 2; x.strokeRect(...b); }
      else if (o.t === 'circle') { const [bx, by, bw, bh] = bbox(o); x.beginPath(); x.ellipse(bx + bw / 2, by + bh / 2, bw / 2, bh / 2, 0, 0, Math.PI * 2); x.stroke(); }
      else if (o.t === 'line' || o.t === 'arrow' || o.t === 'dim') {
        x.beginPath(); x.moveTo(o.a[0], o.a[1]); x.lineTo(o.b[0], o.b[1]); x.stroke();
        if (o.t === 'arrow') head(o.a, o.b, o.w);
        if (o.t === 'dim') { head(o.b, o.a, o.w); head(o.a, o.b, o.w); if (o.txt) { const mx = (o.a[0] + o.b[0]) / 2, my = (o.a[1] + o.b[1]) / 2; x.font = `700 22px ${TXT_FONT}`; const w = x.measureText(o.txt).width + 12; x.fillStyle = '#fff'; x.fillRect(mx - w / 2, my - 30, w, 26); x.fillStyle = o.c; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.txt, mx, my - 17); } }
      }
      x.restore();
    };
    const render = (forSave) => {
      bg(); if (st.base) x.drawImage(st.base, 0, 0, cv.width, cv.height);
      st.objs.forEach(paint);
      if (!forSave && st.sel >= 0 && st.objs[st.sel]) { const [bx, by, bw, bh] = bbox(st.objs[st.sel]); x.save(); x.setLineDash([8, 6]); x.strokeStyle = '#2563eb'; x.lineWidth = 2; x.strokeRect(bx - 8, by - 8, bw + 16, bh + 16); x.restore(); }
    };
    const v = hooks ? fieldsOf(n)[id] : null;
    if (!(typeof v === 'string' && v.startsWith('data:image/'))) st.objs = tplObjs(tpl);
    const setBase = (src, fit, done) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); if (fit) { const s = Math.min(c.width / im.width, c.height / im.height), w = im.width * s, h = im.height * s; g.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h); } else g.drawImage(im, 0, 0, c.width, c.height); st.base = c; render(); done && done(); }; im.src = src; };
    render();
    if (typeof v === 'string' && v.startsWith('data:image/')) setBase(v, false);
    if (ro) return;
    const empty = el.querySelector('.w5-empty'), inp = el.querySelector('.w5-txt'), wrap = el.querySelector('.w5-canvas-wrap');
    const pos = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * cv.width / r.width, (ev.clientY - r.top) * cv.height / r.height]; };
    const push = () => { st.undo.push({ objs: JSON.stringify(st.objs), base: st.base }); if (st.undo.length > 40) st.undo.shift(); };
    let saveT = 0;
    const commit = () => { if (empty && empty.isConnected) empty.remove(); clearTimeout(saveT); saveT = setTimeout(() => { render(true); const f = fieldsOf(n); let q = 0.72, url = cv.toDataURL('image/jpeg', q); while (url.length > 90000 && q > 0.35) { q -= 0.08; url = cv.toDataURL('image/jpeg', q); } f[id] = url; render(); persist(); refreshUi(n); }, 250); };
    const hit = p => { for (let i = st.objs.length - 1; i >= 0; i--) { const o = st.objs[i]; if (o.t === 'path' && o.er) continue; const [bx, by, bw, bh] = bbox(o); if (p[0] >= bx - 10 && p[0] <= bx + bw + 10 && p[1] >= by - 10 && p[1] <= by + bh + 10) return i; } return -1; };
    const move = (o, dx, dy) => { if ('x' in o) { o.x += dx; o.y += dy; } if (o.a) { o.a = [o.a[0] + dx, o.a[1] + dy]; o.b = [o.b[0] + dx, o.b[1] + dy]; } if (o.pts) o.pts = o.pts.map(p => [p[0] + dx, p[1] + dy]); };
    const pick = (attr, val) => el.querySelectorAll(`[data-w5-${attr}]`).forEach(z => z.classList.toggle('on', z.dataset['w5' + attr[0].toUpperCase() + attr.slice(1)] === val));
    const setTool = t => { st.tool = t; pick('tool', t); cv.style.cursor = t === 'move' ? 'grab' : ['stamp', 'note', 'text', 'shape'].includes(t) ? 'copy' : 'crosshair'; if (t !== 'stamp' && t !== 'shape') el.querySelectorAll('[data-w5-emo],[data-w5-shape]').forEach(z => z.classList.remove('on')); };
    /* พิมพ์ข้อความลงบนกระดานโดยตรง (ไม่ใช้กล่องเด้ง) */
    const ask = (p, kind, done, init) => {
      const r = cv.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
      inp.hidden = false; inp.value = init || ''; inp.placeholder = kind === 'dim' ? 'เช่น 40 ซม.' : 'พิมพ์แล้วกด Enter';
      inp.style.left = Math.min(r.width - 200, Math.max(0, (p[0] * r.width / cv.width) + r.left - wr.left)) + 'px';
      inp.style.top = Math.max(0, (p[1] * r.height / cv.height) + r.top - wr.top - 18) + 'px';
      setTimeout(() => inp.focus(), 0);
      const fin = ok => { inp.hidden = true; inp.onkeydown = inp.onblur = null; const t = inp.value.trim(); if (ok && t) done(t.slice(0, 80)); else if (kind === 'dim') done(''); };
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); fin(true); } if (e.key === 'Escape') fin(false); };
      inp.onblur = () => fin(true);
    };
    const sz = () => SZ[st.size];
    /* ตารางกราฟ (bar5) และแผนผังเส้นทาง (route/grid) ให้ปลายเส้นและแท่งติดเส้นตาราง จะได้ความสูงตรงข้อมูล */
    const step = tpl === 'bar5' ? [40, 110, 500] : (tpl === 'route' || el.classList.contains('grid')) ? [30, 0, 0] : null;
    const snap = p => step ? p.map((q, i) => Math.round((q - step[i + 1]) / step[0]) * step[0] + step[i + 1]) : p;
    cv.addEventListener('pointerdown', ev => {
      ev.preventDefault(); const p = pos(ev); if (!inp.hidden) { inp.blur(); return; }
      const h = hit(p);
      /* คลิกโดนชิ้นที่วางไว้ (ยกเว้นตอนวาดเส้น) = เลือกแล้วลากย้าย */
      if (h >= 0 && ['move', 'stamp', 'note', 'text', 'shape'].includes(st.tool)) { push(); st.sel = h; st.drag = { p, moved: false }; cv.setPointerCapture(ev.pointerId); render(); return; }
      if (st.tool === 'move') { st.sel = -1; render(); return; }
      if (st.tool === 'shape') { const d = SHP.find(z => z[0] === st.shape); push(); const o = { t: 'shape', k: d[0], txt: d[2], x: p[0] - d[3] / 2, y: p[1] - d[4] / 2, w: d[3], h: d[4], c: d[5], s: 20 }; st.objs.push(o); st.sel = st.objs.length - 1; render(); commit(); ask([o.x + 10, o.y + o.h / 2], 'shape', t => { o.txt = t; render(); commit(); }, d[2]); return; }
      if (st.tool === 'stamp') { push(); st.objs.push({ t: 'stamp', e: st.emo, x: p[0], y: p[1], s: sz().stamp }); st.sel = st.objs.length - 1; render(); commit(); return; }
      if (st.tool === 'note' || st.tool === 'text') { const kind = st.tool; ask(p, kind, t => { push(); st.objs.push({ t: kind, txt: t, x: p[0], y: p[1] - (kind === 'note' ? sz().text * 0.75 : sz().text * 0.6), s: sz().text, c: st.color }); st.sel = st.objs.length - 1; render(); commit(); }); return; }
      push(); cv.setPointerCapture(ev.pointerId); st.sel = -1;
      const free = st.tool === 'pen' || st.tool === 'erase', q = free ? p : snap(p);
      const o = free ? { t: 'path', pts: [p], c: st.color, w: sz().w, er: st.tool === 'erase' } : { t: st.tool, a: q, b: q, c: st.color, w: sz().w };
      st.objs.push(o); st.drag = { draw: o };
    });
    cv.addEventListener('pointermove', ev => {
      if (!st.drag) return; const p = pos(ev);
      if (st.drag.draw) { const o = st.drag.draw; if (o.pts) o.pts.push(p); else o.b = snap(p); render(); return; }
      const o = st.objs[st.sel]; if (!o) return; move(o, p[0] - st.drag.p[0], p[1] - st.drag.p[1]); st.drag.p = p; st.drag.moved = true; render();
    });
    const end = () => {
      const d = st.drag; if (!d) return; st.drag = null;
      if (d.draw) { const o = d.draw; if (!o.pts && Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]) < 6) { st.objs.pop(); st.undo.pop(); render(); return; }
        if (o.t === 'dim') { ask(o.b, 'dim', t => { o.txt = t; render(); commit(); }); return; } }
      else if (!d.moved) st.undo.pop();
      render(); commit();
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    cv.addEventListener('dblclick', ev => { const h = hit(pos(ev)), o = st.objs[h]; if (!o || !o.txt) return; ask([o.x, o.y + 18], o.t, t => { push(); o.txt = t; render(); commit(); }, o.txt); });
    el.addEventListener('keydown', ev => { if (ev.target === inp) return; if ((ev.key === 'Delete' || ev.key === 'Backspace') && st.sel >= 0) { ev.preventDefault(); push(); st.objs.splice(st.sel, 1); st.sel = -1; render(); commit(); } if (ev.key === 'Escape' && el.classList.contains('is-full')) full(false); });
    const full = on => { el.classList.toggle('is-full', on); document.body.classList.toggle('w5-noscroll', on); const b = el.querySelector('[data-w5-full]'); if (b) b.textContent = on ? '✕ ออกจากเต็มจอ' : '⛶ เต็มจอ'; if (on) { el.tabIndex = -1; el.focus({ preventScroll: true }); } };
    el.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !el.contains(b)) return; const d = b.dataset;
      if (d.w5Tool) setTool(d.w5Tool);
      if (d.w5Cat != null) { el.querySelectorAll('[data-w5-cat]').forEach(z => { const on = z === b; z.classList.toggle('on', on); z.setAttribute('aria-selected', on); }); el.querySelectorAll('[data-w5-grid]').forEach(g => { g.hidden = g.dataset.w5Grid !== d.w5Cat; }); }
      if (d.w5Shape) { st.shape = d.w5Shape; el.querySelectorAll('[data-w5-shape],[data-w5-emo]').forEach(z => z.classList.toggle('on', z === b)); setTool('shape'); }
      if (d.w5Emo) { st.emo = d.w5Emo; el.querySelectorAll('[data-w5-emo],[data-w5-shape]').forEach(z => z.classList.toggle('on', z === b)); setTool('stamp'); }
      if (d.w5Color) { st.color = d.w5Color; pick('color', d.w5Color); const o = st.objs[st.sel]; if (o && o.t !== 'stamp') { push(); o.c = d.w5Color; render(); commit(); } if (st.tool === 'erase') setTool('pen'); }
      if (d.w5Size) { st.size = d.w5Size; pick('size', d.w5Size); const o = st.objs[st.sel]; if (o) { push(); if (o.t === 'stamp') o.s = sz().stamp; else if (o.t === 'shape') o.s = { S: 16, M: 20, L: 26 }[st.size]; else if (o.txt != null && o.t !== 'dim') o.s = sz().text; else o.w = sz().w; render(); commit(); } }
      if (d.w5Grow) { const o = st.objs[st.sel]; if (!o) { hooks.notify('คลิกเลือกชิ้นบนกระดานก่อน แล้วจึงกดขยายหรือย่อ'); return; } push(); const k = +d.w5Grow;
        if (o.t === 'shape') { o.w = Math.max(70, o.w * k); o.h = Math.max(40, o.h * k); o.s = Math.max(14, Math.min(40, o.s * Math.sqrt(k))); } else if (o.s) o.s = Math.max(14, Math.min(320, o.s * k)); else if (o.a) { const cx = (o.a[0] + o.b[0]) / 2, cy = (o.a[1] + o.b[1]) / 2; o.a = [cx + (o.a[0] - cx) * k, cy + (o.a[1] - cy) * k]; o.b = [cx + (o.b[0] - cx) * k, cy + (o.b[1] - cy) * k]; } render(); commit(); }
      if (d.w5Del) { if (st.sel < 0) { hooks.notify('คลิกเลือกชิ้นบนกระดานก่อน แล้วจึงกดลบ'); return; } push(); st.objs.splice(st.sel, 1); st.sel = -1; render(); commit(); }
      if (d.w5Undo) { const u = st.undo.pop(); if (u) { st.objs = JSON.parse(u.objs); st.base = u.base; st.sel = -1; render(); commit(); } }
      if (d.w5Clear) { if (!confirm('ล้างภาพทั้งหมดของข้อนี้หรือไม่ (กลับไปเป็นกระดานเริ่มต้น)')) return; push(); st.objs = tplObjs(tpl); st.base = null; st.sel = -1; render(); const f = fieldsOf(n); delete f[id]; persist(); refreshUi(n); }
      if (d.w5Full) { const on = !el.classList.contains('is-full'); full(on); render(); }
    });
    el.addEventListener('change', ev => {
      const t = ev.target; if (!t.dataset.w5Photo) return; const file = t.files && t.files[0]; if (!file) return;
      if (!/^image\//.test(file.type)) { hooks.notify('เลือกไฟล์รูปภาพเท่านั้น'); return; }
      const rd = new FileReader(); rd.onload = () => { push(); setBase(rd.result, true, () => { commit(); hooks.notify('ใส่รูปแล้ว วางอีโมจิหรือกล่องข้อความทับบนรูปได้เลย'); }); }; rd.readAsDataURL(file); t.value = '';
    });
    setTool(TPL_CAT[tpl] === -1 ? 'move' : 'stamp');
  }
  function mount() {
    document.querySelectorAll('.ws5 textarea').forEach(grow);
    document.querySelectorAll('.w5-draw').forEach(mountBoard);
    document.querySelectorAll('.ws-ans').forEach(grow);
  }

  /* ---------- คำตอบที่ส่งแล้ว (หน้าครู/ประวัติ) ---------- */
  function showAnswer(it, v) {
    if (!answered(it, v) && it.type !== 'draw') return '<p class="muted">— ไม่ได้ตอบ —</p>';
    switch (it.type) {
      case 'choice': return `<p>${TH[+v] || ''}. ${esc(it.options[+v])}${it.answer != null ? (Number(v) === it.answer ? ' ✅' : ` ❌ <small>(เฉลย ${TH[it.answer]}. ${esc(it.options[it.answer])})</small>`) : ''}</p>`;
      case 'multi': return `<p>${J(v, []).map(i => esc(it.options[i]) + (it.answer.includes(i) ? ' ✅' : ' ❌')).join(' · ')}</p>`;
      case 'number': return `<p>${esc(v)} ${esc(it.unit)} ${autoScore(it, v) === 1 ? '✅' : `❌ <small>(เฉลย ${it.answer} ${esc(it.unit)})</small>`}</p>`;
      case 'order': return `<ol>${J(v, []).map((t, i) => `<li>${esc(t)} ${t === it.items[i] ? '✅' : '❌'}</li>`).join('')}</ol>`;
      case 'match': { const m = J(v, {}); return `<ul>${it.pairs.map((p, i) => `<li>${esc(p[0])} = ${esc((it.pairs[m[i]] || [])[1] || '—')} ${Number(m[i]) === i ? '✅' : '❌'}</li>`).join('')}</ul>`; }
      case 'bullets': return `<ul>${it.labels.map((l, i) => `<li><b>${esc(l)}:</b> ${esc(J(v, [])[i] || '')}</li>`).join('')}</ul>`;
      case 'table': { const g = J(v, []), fx = fixedFirst(it); return `<table class="w5-table ro"><tr>${it.columns.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr>${Array.from({ length: tableRows(it) }, (_, r) => `<tr>${it.columns.map((c, ci) => { if (fx && ci === 0) return `<th>${esc(it.rows[r])}</th>`; const val = (g[r] || [])[ci] ?? '', key = r + ',' + ci, want = (it.auto || {})[key]; return `<td>${esc(val)}${want != null ? (String(val).trim() === String(want) ? ' ✅' : ` ❌ <small>(${esc(want)})</small>`) : ''}</td>`; }).join('')}</tr>`).join('')}</table>`; }
      case 'scale': { const s = J(v, {}); return `<p>${esc(it.labels[s.level])} · ${esc(s.why)}</p>`; }
      case 'draw': return typeof v === 'string' && v.startsWith('data:image/') ? `<img class="w5-ro-img" src="${v}" alt="ภาพที่นักเรียนวาดหรือแนบ">` : '<p class="muted">— ไม่ได้วาดหรือแนบภาพ —</p>';
      default: return `<p class="w5-ro-text">${esc(v)}</p>`;
    }
  }
  function readonly(n, fields, workFields) {
    const f = fields || {}, sh = sheetOf(n);
    if (!sh || !isV5(n, f)) return legacyReadonly(n, f, workFields);
    let k = 0, auto = 0, autoMax = 0;
    const body = itemsOf(sh).map(it => { if (!shown(it, f)) return ''; k++; const s = autoScore(it, f[it.id]); if (s != null) { auto += s * it.points; autoMax += it.points; } return `<div class="ws-read-q"><b>${k}. ${esc(it.prompt)}</b> <small class="muted">${TYPE[it.type] || ''} · ${it.points} คะแนน · เกณฑ์ที่ ${it.crit + 1}${s != null ? ` · ได้ ${Math.round(s * it.points * 10) / 10}` : ''}</small>${showAnswer(it, f[it.id])}</div>`; }).join('');
    return `<div class="ws-read"><p class="w5-autosum">ข้อที่ระบบตรวจอัตโนมัติ ได้ <b>${Math.round(auto * 10) / 10}</b> จาก ${autoMax} คะแนนน้ำหนัก (ใช้ประกอบการให้คะแนนแต่ละเกณฑ์)</p>${body}</div>`;
  }

  /* ---------- พิมพ์ A4 ---------- */
  function printAnswer(it, v) {
    const has = answered(it, v) || (it.type === 'draw' && v);
    switch (it.type) {
      case 'choice': case 'scale': { const s = it.type === 'scale' ? J(v, {}).level : v; const opts = it.type === 'scale' ? it.labels : it.options; return `<div class="opts">${opts.map((o, i) => `<span>${String(s) === String(i) ? '●' : '○'} ${it.type === 'choice' ? TH[i] + '. ' : ''}${esc(o)}</span>`).join('')}</div>${it.type === 'scale' ? `<div class="line">${esc(J(v, {}).why || '')}</div>` : ''}`; }
      case 'multi': { const s = J(v, []); return `<div class="opts">${it.options.map((o, i) => `<span>${s.includes(i) ? '☑' : '☐'} ${TH[i]}. ${esc(o)}</span>`).join('')}</div>`; }
      case 'number': return `<div>ตอบ <span class="blankline">${esc(v || '')}</span> ${esc(it.unit)}</div>`;
      case 'order': { const s = has ? J(v, []) : shuffled(it.items); return `<div class="opts col">${s.map(t => `<span>${has ? (s.indexOf(t) + 1) : '☐'} ${esc(t)}</span>`).join('')}</div>${has ? '' : '<small>เขียนเลขลำดับ 1, 2, 3 … ในช่อง ☐</small>'}`; }
      case 'match': { const m = J(v, {}), right = it.pairs.map((p, i) => [i, p[1]]).sort((a, b) => a[1].localeCompare(b[1], 'th')); return `<table><tr><th>ซ้าย</th><th>คู่ (ใส่ตัวอักษร)</th><th>ขวา</th></tr>${it.pairs.map((p, i) => `<tr><td>${esc(p[0])}</td><td class="n">${m[i] != null ? TH[right.findIndex(r => r[0] === Number(m[i]))] : ''}</td><td>${TH[i]}. ${esc(right[i][1])}</td></tr>`).join('')}</table>`; }
      case 'bullets': return it.labels.map((l, i) => `<div class="line"><b>• ${esc(l)}:</b> ${esc(J(v, [])[i] || '')}</div>`).join('');
      case 'table': { const g = J(v, []), fx = fixedFirst(it); return `<table><tr>${it.columns.map(c => `<th>${esc(c.label)}${c.type === 'select' ? `<br><small>(${c.options.map(esc).join(' / ')})</small>` : ''}</th>`).join('')}</tr>${Array.from({ length: tableRows(it) }, (_, r) => `<tr>${it.columns.map((c, ci) => fx && ci === 0 ? `<td>${esc(it.rows[r])}</td>` : `<td class="cell">${esc((g[r] || [])[ci] ?? '')}</td>`).join('')}</tr>`).join('')}</table>`; }
      case 'draw': return typeof v === 'string' && v.startsWith('data:image/') ? `<div class="pic"><img src="${v}" alt=""></div>` : `<div class="drawbox ${it.canvas === 'grid' ? 'grid' : ''}"></div><small>ในภาพต้องมี: ${it.mustShow.map(esc).join(' · ')}</small>`;
      case 'long': return has ? `<div class="ans">${esc(v)}</div>` : '<div class="ans blank tall"></div>';
      default: return has ? `<div class="ans">${esc(v)}</div>` : '<div class="ans blank"></div>';
    }
  }
  function print(c, fields, student, review, workFields, labs) {
    const sh = sheetOf(c.number), f = fields || {};
    if (!sh || !isV5(c.number, f)) return legacyPrint(c, fields, student, review, workFields, labs);
    const st = student || {}, r = review, blank = !itemsOf(sh).some(it => f[it.id]);
    let k = 0;
    const body = sh.sections.map(s => `<h2>${esc(s.title)}</h2>${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ''}${s.items.map(it => { if (!blank && !shown(it, f)) return ''; k++; return `<div class="q"><div class="qh"><b>${k}. ${esc(it.prompt)}</b><span>${TYPE[it.type] || ''} · ${it.points} คะแนน${it.showIf ? ' · ทำเฉพาะทางที่ ' + (it.showIf.answer === 0 ? 'ก' : 'ข') : ''}</span></div>${printAnswer(it, f[it.id])}</div>`; }).join('')}`).join('');
    const css = `@page{size:A4;margin:13mm 13mm 15mm}*{box-sizing:border-box}body{margin:0;font-family:"Sarabun","TH Sarabun New","Leelawadee UI",Tahoma,sans-serif;font-size:14.5px;line-height:1.5;color:#111}
h1{font-size:19px;margin:0}h2{font-size:15px;margin:12px 0 4px;padding:3px 8px;background:#eee;border-left:5px solid #111;break-after:avoid}.intro{margin:0 0 4px;font-size:13px;color:#333}
.top{display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid #111;padding-bottom:6px}.top small{display:block;color:#444}
.who{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:6px 14px;margin:8px 0;font-size:13.5px}.who span{border-bottom:1px dotted #555;padding-bottom:1px}
.ctx{border:1.5px solid #111;border-radius:6px;padding:6px 10px;font-size:13.5px;background:#fafafa}.ctx b{display:block}
.q{break-inside:avoid;margin:9px 0 10px}.qh{display:flex;justify-content:space-between;gap:10px;align-items:baseline}.qh span{flex:none;font-size:11.5px;color:#555}
.opts{display:flex;flex-wrap:wrap;gap:4px 18px;margin:3px 0 0 14px}.opts.col{flex-direction:column}.ans{border:1px solid #999;border-radius:4px;padding:6px 9px;min-height:12mm;white-space:pre-wrap;margin-top:3px}
.ans.blank{min-height:18mm;background:repeating-linear-gradient(#fff 0 8.6mm,#bbb 8.6mm calc(8.6mm + 1px))}.ans.blank.tall{min-height:44mm}.line{border-bottom:1px solid #999;min-height:8mm;margin:2px 0 0 14px}
.blankline{display:inline-block;min-width:35mm;border-bottom:1px solid #111;text-align:center}
table{width:100%;border-collapse:collapse;font-size:13px;margin-top:3px}td,th{border:1px solid #888;padding:4px 7px;text-align:left;vertical-align:top}th{background:#f3f3f3}td.cell{height:10mm}td.n{width:24mm;text-align:center}
.drawbox{height:78mm;border:1.5px solid #111;border-radius:4px;margin-top:3px}.drawbox.grid{background-image:linear-gradient(#ccc 1px,transparent 1px),linear-gradient(90deg,#ccc 1px,transparent 1px);background-size:10mm 10mm}
.pic{text-align:center}.pic img{max-width:100%;max-height:95mm;border:1px solid #999}.sign{display:flex;justify-content:space-between;margin-top:14px;font-size:13px}.foot{margin-top:6px;font-size:11px;color:#666;text-align:right}`;
    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>ชิ้นงานบทที่ ${c.number} · เลขที่ ${esc(st.number || '')}</title><style>${css}</style></head><body>
<div class="top"><div><h1>ใบงานบทที่ ${c.number} · ${esc(sh.title)}</h1><small>วิชา${window.DT_CFG.full} · ${esc(c.title)} · เวลาประมาณ ${sh.minutes} นาที</small></div><div style="text-align:right;font-size:12px">${r ? (r.status === 'graded' ? 'ตรวจแล้ว ' + sum(r) + '/100' : 'ครูขอให้ปรับปรุง') : (blank ? 'ใบงานเปล่า' : 'ยังไม่ได้ตรวจ')}</div></div>
<div class="who"><span>ชื่อ ${esc(st.name && !/^เลขที่/.test(st.name) ? st.name : '')}</span><span>เลขที่ ${esc(st.number || '')}</span><span>ห้อง ${esc(st.classroom || '')}</span><span>ปี ${esc(st.year || '')}</span></div>
<div class="ctx"><b>สถานการณ์</b>${esc(sh.context)}</div>
${body}
<h2>การประเมินโดยครู</h2><table><tr><th>เกณฑ์</th><th style="text-align:center">คะแนนเต็ม</th><th style="text-align:center">ได้</th></tr>${c.rubric.map((x, i) => `<tr><td>${esc(x.criterion)}</td><td class="n">${x.points}</td><td class="n">${r && r.status === 'graded' ? (r.scores[i] ?? '') : ''}</td></tr>`).join('')}<tr><th>รวม</th><th class="n">100</th><th class="n">${r && r.status === 'graded' ? sum(r) : ''}</th></tr></table>
<p><b>ข้อเสนอแนะจากครู:</b> ${r ? esc(r.comment) : '<br>.............................................................................................................................................<br>.............................................................................................................................................'}</p>
<div class="sign"><span>ลงชื่อนักเรียน ..................................................</span><span>ลงชื่อครูผู้สอน ..................................................</span></div>
<div class="foot">พิมพ์เมื่อ ${new Date().toLocaleString('th-TH')}</div></body></html>`;
    printHtml(html);
  }
  /* พิมพ์ผ่านกรอบซ่อน: ใช้ได้ใน Google Sites/Apps Script และไม่โดนบล็อกป๊อปอัป */
  function printHtml(html) {
    let fr = document.getElementById('ws-print'); if (fr) fr.remove();
    fr = document.createElement('iframe'); fr.id = 'ws-print'; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(fr);
    const d = fr.contentWindow.document; d.open(); d.write(html); d.close();
    setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); w.print(); } } }, 500);
  }

  /* ---------- งานเก่าแบบ work-v2 (ส่งก่อนเปลี่ยนใบงาน) ---------- */
  function photoOf(fields) {
    if (!fields) return '';
    if (typeof fields.__photo === 'string' && fields.__photo.startsWith('data:image/')) return fields.__photo;
    try { const ws = fields.__ws && JSON.parse(fields.__ws); if (ws && typeof ws.photo === 'string' && ws.photo.startsWith('data:image/')) return ws.photo; } catch (e) { /* ไม่มี */ }
    return '';
  }
  const qs = (n, workFields) => (workFields && workFields[n] || []).map(([k, t, h]) => ({ k, t, h, g: (G().fields[n] || {})[k] }));
  function legacyView(c, ctx) { return `<div class="ws"><section class="ws-status draft"><b>ยังไม่มีใบงานของบทนี้</b></section></div>`; }
  function legacyReadonly(n, fields, workFields) {
    const photo = photoOf(fields);
    return `<div class="ws-read"><p class="muted">งานนี้ส่งด้วยใบงานฉบับเก่า</p>${qs(n, workFields).map((q, i) => `<div class="ws-read-q"><b>${i + 1}. ${esc(q.g ? q.g.question : q.t)}</b><p>${esc(fields[q.k] || '—')}</p></div>`).join('')}
      ${fields.evidenceMode ? `<div class="ws-read-q"><b>แบบงาน</b><p>${esc(fields.evidenceMode)}</p></div>` : ''}
      ${photo ? `<figure class="ws-read-photo"><img src="${photo}" alt="รูปที่นักเรียนแนบ"><figcaption>รูปที่นักเรียนแนบ</figcaption></figure>` : ''}</div>`;
  }
  function legacyPrint(c, fields, student, review) {
    const f = fields || {}, st = student || {}, r = review, photo = photoOf(f);
    const list = qs(c.number, window.DTApp && window.DTApp.workFields);
    printHtml(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>ชิ้นงานบทที่ ${c.number}</title><style>body{font-family:Sarabun,Tahoma,sans-serif;font-size:14px;margin:14mm}.q{break-inside:avoid;margin:8px 0}.ans{border:1px solid #999;padding:6px;white-space:pre-wrap}img{max-width:70%}</style></head><body>
<h1>ใบงานบทที่ ${c.number} · ${esc(c.title)} (ฉบับเก่า)</h1><p>เลขที่ ${esc(st.number || '')} · ${r && r.status === 'graded' ? 'ได้ ' + sum(r) + '/100' : ''}</p>
${list.map((q, i) => `<div class="q"><b>${i + 1}. ${esc(q.g ? q.g.question : q.t)}</b><div class="ans">${esc(f[q.k] || '')}</div></div>`).join('')}${photo ? `<img src="${photo}" alt="">` : ''}</body></html>`);
  }

  window.DTWorksheet = { view, mount, readonly, print, photoOf, missing, autoText, labels, progress, isV5, setHooks: h => { hooks = h; } };
})();
