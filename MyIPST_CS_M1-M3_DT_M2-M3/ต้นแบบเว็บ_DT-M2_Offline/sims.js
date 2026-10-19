/* ห้องจำลอง (Simulation) ในบทเรียนของนักเรียน — ลองปรับค่าแล้วเห็นผลทันที ไม่ต้องส่งครูตรวจ
   แทรกอัตโนมัติท้ายขั้นตอนตัวอย่างของแต่ละหัวข้อ (article.lesson#DT-M1-Cxx-Mxx) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const fmt = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toString();
  const tone = (f, ms = 90, type = 'sine', vol = 0.05) => { try { if (window.GameAudio && GameAudio.isEnabled && !GameAudio.isEnabled()) return; const ac = new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.value = vol; o.connect(g); g.connect(ac.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000); o.stop(ac.currentTime + ms / 1000 + 0.02); } catch (e) { /* เงียบ */ } };
  function every(el, fn, ms) { const id = setInterval(() => { if (!el.isConnected) { clearInterval(id); return; } fn(); }, ms); return id; }
  const done = new Set(); try { JSON.parse(localStorage.getItem(window.DT_CFG.key + '-sims') || '[]').forEach(x => done.add(x)); } catch (e) { /* ว่าง */ }
  const mark = id => { if (done.has(id)) return; done.add(id); try { localStorage.setItem(window.DT_CFG.key + '-sims', JSON.stringify([...done])); } catch (e) { /* ไม่บันทึก */ } document.dispatchEvent(new CustomEvent('dt-sim-done', { detail: id })); };
  const goal = (el, key, text) => `<li data-goal="${key}"><i></i><span>${esc(text)}</span></li>`;
  /* สวิตช์สลับ: ป้ายชื่อ + ปุ่มเลื่อน + คำบอกสถานะ (เขียว = ใช้งานอยู่ แดง = เกิดปัญหา เทา = ไม่ได้ใช้) */
  const sw = (attr, label, onW, offW, bad) => `<button type="button" class="sim-t${bad ? ' bad' : ''}" ${attr} role="switch" aria-checked="false" data-on="${esc(onW)}" data-off="${esc(offW)}"><span class="t-l">${esc(label)}</span><span class="t-k" aria-hidden="true"><i></i></span><b class="t-s">${esc(offW)}</b></button>`;
  const setSw = (btn, on) => { if (!btn) return; btn.setAttribute('aria-checked', on ? 'true' : 'false'); btn.classList.toggle('on', !!on); const s = btn.querySelector('.t-s'); if (s) s.textContent = on ? btn.dataset.on : btn.dataset.off; };
  const pill = (on, text) => `<span class="st-pill ${on ? 'on' : 'off'}">${esc(text)}</span>`;
  function tick(el, key) { const li = $(`[data-goal="${key}"]`, el); if (li && !li.classList.contains('on')) { li.classList.add('on'); tone(740, 120, 'triangle'); const all = $$('[data-goal]', el); if (all.every(x => x.classList.contains('on'))) { $('.sim-badge', el).hidden = false; mark(el.dataset.sim); tone(988, 220, 'triangle', 0.06); } } }
  const frame = (title, sub, stage, controls, goals) => `<div class="sim-head"><span class="sim-chip">🔬 ห้องจำลอง</span><h3>${esc(title)}</h3><p>${esc(sub)}</p></div><div class="sim-body"><div class="sim-stage">${stage}</div><div class="sim-side">${controls}<ul class="sim-goals" aria-label="ภารกิจย่อย">${goals}</ul><div class="sim-badge" hidden>✓ ทำภารกิจครบแล้ว!</div></div></div>`;

  const defs = {};

  /* ---------- 1) สำรวจโต๊ะเรียน ---------- */
  defs['DT-M1-C01-M01'] = {
    title: 'สำรวจโต๊ะเรียน: อะไรคือเทคโนโลยี?', sub: 'แตะสิ่งของบนโต๊ะ แล้วอ่านว่าเป็นชิ้นงาน วิธีการ หรือสิ่งธรรมชาติ และช่วยแก้ปัญหาอะไร',
    mount(el) {
      const items = [
        { id: 'tray', n: 'ถาดใส่ดินสอ', t: 'ชิ้นงาน', p: 'ดินสอไม่กลิ้งตกจากโต๊ะ และหยิบได้ที่เดิมทุกครั้ง', x: 88, y: 118 },
        { id: 'label', n: 'ป้ายหมวดสมุด', t: 'ชิ้นงาน', p: 'หาสมุดแต่ละวิชาได้เร็วขึ้น ไม่ต้องรื้อกอง', x: 238, y: 70 },
        { id: 'books', n: 'วิธีเรียงสมุดตามวิชา', t: 'วิธีการ', p: 'เป็นกติกาจัดลำดับ ไม่ต้องซื้อของใหม่ก็แก้ปัญหาหาของยากได้', x: 390, y: 150 },
        { id: 'ruler', n: 'ไม้บรรทัด', t: 'ชิ้นงาน', p: 'วัดความยาวให้ตรงกัน ผู้อื่นทำตามแบบได้', x: 540, y: 96 },
        { id: 'stone', n: 'ก้อนหินจากสนาม', t: 'สิ่งธรรมชาติ', p: 'ยังไม่ได้ถูกมนุษย์ดัดแปลงเพื่อแก้ปัญหา จึงไม่นับเป็นเทคโนโลยี (ถ้านำไปทำที่ทับกระดาษ ก็เริ่มเป็นชิ้นงาน)', x: 640, y: 190 },
        { id: 'sun', n: 'แสงแดดจากหน้าต่าง', t: 'สิ่งธรรมชาติ', p: 'เป็นแสงตามธรรมชาติ มนุษย์ไม่ได้สร้าง แต่ใช้ม่านหรือโคมไฟเพื่อจัดการแสงได้', x: 160, y: 240 },
        { id: 'clock', n: 'นาฬิกาตั้งโต๊ะ', t: 'ชิ้นงาน', p: 'บอกเวลาให้วางแผนงาน ไม่ต้องเดา', x: 330, y: 270 },
        { id: 'timetable', n: 'ตารางเวรทำความสะอาด', t: 'วิธีการ', p: 'แบ่งหน้าที่ให้ทุกคน งานครบ ไม่ลืมทำ', x: 520, y: 275 }
      ];
      const col = { 'ชิ้นงาน': '#26b8a0', 'วิธีการ': '#ff3d94', 'สิ่งธรรมชาติ': '#ffb400' };
      const obj = {
        tray: '<g><rect x="-48" y="-22" width="96" height="44" rx="8" fill="url(#sd-wood2)" stroke="#3b2412" stroke-width="3"/><rect x="-40" y="-14" width="80" height="28" rx="5" fill="#2a1a0c" opacity=".55"/><g stroke="#3b2412" stroke-width="1.5"><rect x="-34" y="-30" width="9" height="46" rx="3" fill="#ffd23f" transform="rotate(-14 -30 0)"/><rect x="-18" y="-34" width="9" height="46" rx="3" fill="#ff3d94" transform="rotate(-4 -14 0)"/><rect x="-2" y="-34" width="9" height="46" rx="3" fill="#3aa0ff" transform="rotate(5 3 0)"/><rect x="14" y="-30" width="9" height="46" rx="3" fill="#26b8a0" transform="rotate(14 18 0)"/></g></g>',
        label: '<g><path d="M-38 -18h60l16 18-16 18h-60z" fill="#fff8dc" stroke="#0b1d1f" stroke-width="3"/><circle cx="-28" cy="0" r="4" fill="#0b1d1f"/><text x="-14" y="6" font-size="17" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">วิทย์</text></g>',
        books: '<g><rect x="-44" y="-4" width="88" height="16" rx="3" fill="#3aa0ff" stroke="#0b1d1f" stroke-width="3"/><rect x="-40" y="-20" width="80" height="16" rx="3" fill="#ff3d94" stroke="#0b1d1f" stroke-width="3"/><rect x="-46" y="-36" width="84" height="16" rx="3" fill="#ffd23f" stroke="#0b1d1f" stroke-width="3"/><rect x="-44" y="12" width="88" height="6" rx="2" fill="#0b1d1f" opacity=".25"/></g>',
        ruler: '<g transform="rotate(-8)"><rect x="-70" y="-11" width="140" height="22" rx="3" fill="#fff3a8" stroke="#0b1d1f" stroke-width="3"/><g stroke="#0b1d1f" stroke-width="1.6">' + Array.from({ length: 15 }, (_, i) => `<line x1="${-62 + i * 9}" y1="-11" x2="${-62 + i * 9}" y2="${i % 5 === 0 ? 1 : -4}"/>`).join('') + '</g></g>',
        stone: '<g><path d="M-40 14l-8-22 22-24 36-6 26 16 6 28-20 16z" fill="url(#sd-stone)" stroke="#2c3133" stroke-width="3"/><path d="M-20 -8l16 -6 14 10" stroke="#ffffff55" stroke-width="3" fill="none"/></g>',
        sun: '<g><polygon points="-60,-40 60,-52 80,50 -40,60" fill="url(#sd-sun)" opacity=".85"/></g>',
        clock: '<g><circle r="30" fill="#fff" stroke="#0b1d1f" stroke-width="4"/><circle r="30" fill="url(#sd-gloss)"/><g stroke="#0b1d1f" stroke-width="3" stroke-linecap="round"><line x1="0" y1="0" x2="0" y2="-18"/><line x1="0" y1="0" x2="12" y2="6"/></g><circle r="3" fill="#ff3d94"/></g>',
        timetable: '<g><rect x="-46" y="-34" width="92" height="64" rx="6" fill="#fff" stroke="#0b1d1f" stroke-width="3"/><g stroke="#0b1d1f" stroke-width="2"><line x1="-46" y1="-14" x2="46" y2="-14"/><line x1="-46" y1="6" x2="46" y2="6"/><line x1="-15" y1="-34" x2="-15" y2="30"/><line x1="16" y1="-34" x2="16" y2="30"/></g><rect x="-44" y="-32" width="28" height="16" fill="#ff3d94" opacity=".6"/><circle cx="0" cy="-4" r="4" fill="#26b8a0"/><circle cx="32" cy="16" r="4" fill="#ffb400"/></g>'
      };
      el.innerHTML = frame('สำรวจโต๊ะเรียน: อะไรคือเทคโนโลยี?', 'แตะสิ่งของบนโต๊ะ แล้วอ่านว่าเป็นชิ้นงาน วิธีการ หรือสิ่งธรรมชาติ และช่วยแก้ปัญหาอะไร',
        `<svg viewBox="0 0 720 340" role="img" aria-label="โต๊ะเรียนมองจากด้านบน มีสิ่งของ 8 อย่าง"><defs><pattern id="sd-wood" width="240" height="26" patternUnits="userSpaceOnUse"><rect width="240" height="26" fill="#c98f52"/><path d="M0 6c60-4 120 5 240 0M0 17c80 5 140-4 240 1" stroke="#a9733b" stroke-width="2" fill="none" opacity=".6"/></pattern><linearGradient id="sd-wood2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2ad6f"/><stop offset="1" stop-color="#a9733b"/></linearGradient><linearGradient id="sd-stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b7bdbf"/><stop offset="1" stop-color="#6c7476"/></linearGradient><linearGradient id="sd-sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset="1" stop-color="#ffd23f" stop-opacity=".1"/></linearGradient><radialGradient id="sd-gloss" cx=".3" cy=".25"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><filter id="sd-sh"><feDropShadow dx="3" dy="5" stdDeviation="3" flood-color="#000" flood-opacity=".35"/></filter></defs><rect width="720" height="340" fill="url(#sd-wood)"/><rect width="720" height="340" fill="none" stroke="#5c3a1c" stroke-width="10"/>${items.map(o => `<g class="sd-it" data-id="${o.id}" transform="translate(${o.x + 20} ${o.y + 20})" tabindex="0" role="button" aria-label="${esc(o.n)}" filter="url(#sd-sh)">${obj[o.id]}<circle class="sd-ring" r="${o.id === 'sun' ? 74 : 62}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="8 8"/></g>`).join('')}</svg>`,
        `<div class="sim-read" id="sd-read"><b>แตะสิ่งของบนโต๊ะ</b><p>ดูว่าแต่ละอย่างเป็น <span class="tg" style="--c:${col['ชิ้นงาน']}">ชิ้นงาน</span> <span class="tg" style="--c:${col['วิธีการ']}">วิธีการ</span> หรือ <span class="tg" style="--c:${col['สิ่งธรรมชาติ']}">สิ่งธรรมชาติ</span></p></div><div class="sim-meter"><span>สำรวจแล้ว</span><b id="sd-n">0 / 8</b></div>`,
        goal(el, 'all', 'สำรวจครบทั้ง 8 อย่าง') + goal(el, 'nat', 'หาสิ่งธรรมชาติให้เจอทั้ง 2 อย่าง') + goal(el, 'met', 'หา "วิธีการ" ให้เจอทั้ง 2 อย่าง'));
      const seen = new Set();
      const pick = id => {
        const o = items.find(x => x.id === id); seen.add(id); tone(520 + seen.size * 40);
        $$('.sd-it', el).forEach(g => g.classList.toggle('sel', g.dataset.id === id)); $$('.sd-it', el).forEach(g => seen.has(g.dataset.id) && g.classList.add('seen'));
        $('#sd-read', el).innerHTML = `<b>${esc(o.n)}</b><span class="tg big" style="--c:${col[o.t]}">${o.t}</span><p><b>ช่วยแก้ปัญหา:</b> ${esc(o.p)}</p>`;
        $('#sd-n', el).textContent = seen.size + ' / 8';
        if (seen.size === 8) tick(el, 'all');
        if (items.filter(x => x.t === 'สิ่งธรรมชาติ').every(x => seen.has(x.id))) tick(el, 'nat');
        if (items.filter(x => x.t === 'วิธีการ').every(x => seen.has(x.id))) tick(el, 'met');
      };
      el.addEventListener('click', e => { const g = e.target.closest('.sd-it'); if (g) pick(g.dataset.id); });
      el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('sd-it')) { e.preventDefault(); pick(e.target.dataset.id); } });
    }
  };

  /* ---------- 2) ซักผ้า: เปลี่ยนบริบทแล้วเลือกใหม่ ---------- */
  defs['DT-M1-C02-M01'] = {
    title: 'ห้องทดลองเปลี่ยนบริบท: ซักมือหรือใช้เครื่อง?', sub: 'ปรับไฟฟ้า พื้นที่ห้อง และจำนวนผ้า แล้วดูว่าตัวเลือกไหนยังเหมาะสม',
    mount(el) {
      const M = [
        { k: 'hand', n: 'ซักมือด้วยอ่าง', icon: '🪣', area: 0.5, cap: 4, min: 14, effort: 85, cost: 1, elec: false },
        { k: 'small', n: 'เครื่องซักผ้าขนาดเล็ก', icon: '🧺', area: 0.6, cap: 3, min: 30, effort: 20, cost: 2, elec: true },
        { k: 'big', n: 'เครื่องซักผ้าขนาดใหญ่', icon: '🫧', area: 1.4, cap: 9, min: 45, effort: 12, cost: 6, elec: true }
      ];
      el.innerHTML = frame('ห้องทดลองเปลี่ยนบริบท: ซักมือหรือใช้เครื่อง?', 'ปรับไฟฟ้า พื้นที่ห้อง และจำนวนผ้า แล้วดูว่าตัวเลือกไหนยังเหมาะสม',
        `<div class="wm-grid" id="wm-grid"></div>`,
        `<label class="sim-sw"><input type="checkbox" id="wm-power" checked><span class="t-k" aria-hidden="true"><i></i></span><span class="t-l">ไฟฟ้าในห้อง</span><b class="t-s" id="wm-pw-s">มีไฟใช้</b></label><label class="sim-rg">พื้นที่ว่างในห้อง <b id="wm-areav">1.5</b> ตร.ม.<input type="range" id="wm-area" min="0.4" max="3" step="0.1" value="1.5"></label><label class="sim-rg">จำนวนผ้าที่ต้องซัก <b id="wm-loadv">8</b> ตัว<input type="range" id="wm-load" min="2" max="16" step="1" value="8"></label><div class="sim-read" id="wm-say"></div>`,
        goal(el, 'off', 'ปิดไฟฟ้า แล้วดูว่าตัวเลือกไหนยังใช้ได้') + goal(el, 'small', 'ลดพื้นที่ห้องจนเครื่องใหญ่วางไม่ได้') + goal(el, 'many', 'เพิ่มผ้ามากจนต้องซักหลายรอบ'));
      const st = { power: true, area: 1.5, load: 8 };
      const render = () => {
        const rows = M.map(m => {
          const can = (!m.elec || st.power) && m.area <= st.area, rounds = Math.ceil(st.load / m.cap), total = rounds * m.min, cost = m.cost * rounds;
          const why = !can ? ((m.elec && !st.power) ? 'ไม่มีไฟฟ้า' : 'พื้นที่ไม่พอ') : '';
          return { m, can, rounds, total, cost, why };
        });
        const ok = rows.filter(r => r.can), best = ok.sort((a, b) => (a.total * 0.5 + (100 - a.m.effort) * -0.8) - (b.total * 0.5 + (100 - b.m.effort) * -0.8))[0];
        const maxT = Math.max(...rows.map(r => r.total), 60);
        $('#wm-grid', el).innerHTML = rows.map(r => `<div class="wm-card ${r.can ? '' : 'off'} ${best && best.m.k === r.m.k ? 'best' : ''}"><div class="wm-ic">${r.m.icon}${r.can && r.m.elec ? '<i class="wm-bub"></i><i class="wm-bub b2"></i>' : ''}</div><h4>${r.m.n}</h4>${r.can ? `<div class="bar"><span>เวลารวม</span><i style="--w:${r.total / maxT * 100}%"></i><b>${Math.round(r.total)} นาที</b></div><div class="bar e"><span>แรงที่เหนื่อย</span><i style="--w:${r.m.effort}%"></i><b>${r.m.effort}%</b></div><p class="mut">ซัก ${r.rounds} รอบ · ใช้พื้นที่ ${r.m.area} ตร.ม.</p>${best && best.m.k === r.m.k ? '<span class="tg" style="--c:#26b8a0">เหมาะที่สุดในบริบทนี้</span>' : ''}` : `<p class="no">❌ ใช้ไม่ได้: ${r.why}</p>`}</div>`).join('');
        $('#wm-say', el).innerHTML = best ? `<b>ในบริบทนี้ ตัวเลือกที่เหมาะคือ ${best.m.n}</b><p>เพราะ${best.m.elec ? 'มีไฟฟ้าและพื้นที่พอ ลดแรงได้' : 'ไม่ต้องพึ่งไฟฟ้าและใช้พื้นที่น้อย แม้เหนื่อยกว่า'} <br>ข้อแลกเปลี่ยน: ${best.m.elec ? 'ต้องจ่ายค่าไฟและใช้พื้นที่' : 'ใช้แรงและเวลามากขึ้น'}</p>` : '<b>ไม่มีตัวเลือกที่ใช้ได้เลย</b><p>ลองปรับเงื่อนไข เช่น เพิ่มพื้นที่</p>';
        if (!st.power && rows.some(r => r.m.k === 'hand' && r.can)) tick(el, 'off');
        if (st.power && !rows.find(r => r.m.k === 'big').can && rows.find(r => r.m.k === 'small').can) tick(el, 'small');
        if (rows.some(r => r.rounds >= 4 && r.can)) tick(el, 'many');
      };
      el.addEventListener('input', e => {
        if (e.target.id === 'wm-power') { st.power = e.target.checked; const q = $('#wm-pw-s', el); if (q) q.textContent = st.power ? 'มีไฟใช้' : 'ไฟดับ'; } if (e.target.id === 'wm-area') { st.area = +e.target.value; $('#wm-areav', el).textContent = fmt(st.area); } if (e.target.id === 'wm-load') { st.load = +e.target.value; $('#wm-loadv', el).textContent = st.load; }
        tone(420 + st.load * 10, 50); render();
      });
      render();
    }
  };

  /* ---------- 3) ระบบรดน้ำอัตโนมัติ ---------- */
  defs['DT-M1-C03-M01'] = {
    title: 'ระบบรดน้ำต้นไม้อัตโนมัติ', sub: 'ดู Input · Process · Output · Feedback ทำงานจริง แล้วลองสร้างความขัดข้องเพื่อวิเคราะห์',
    mount(el) {
      el.innerHTML = frame('ระบบรดน้ำต้นไม้อัตโนมัติ', 'ดู Input · Process · Output · Feedback ทำงานจริง แล้วลองสร้างความขัดข้องเพื่อวิเคราะห์',
        `<svg viewBox="0 0 720 360" id="ir-svg" role="img" aria-label="ระบบรดน้ำอัตโนมัติ มีถังน้ำ ปั๊ม ท่อ กระถางต้นไม้ เซนเซอร์ และตัวควบคุม"><defs><linearGradient id="ir-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#eaf9ff"/></linearGradient><linearGradient id="ir-tank" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9bd0ee"/><stop offset=".5" stop-color="#e9f8ff"/><stop offset="1" stop-color="#8cc2e4"/></linearGradient><linearGradient id="ir-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58c4ff"/><stop offset="1" stop-color="#1e83d6"/></linearGradient><linearGradient id="ir-pot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c2552c"/><stop offset=".5" stop-color="#e0794a"/><stop offset="1" stop-color="#a64420"/></linearGradient><filter id="ir-sh"><feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity=".3"/></filter></defs>
        <rect width="720" height="360" fill="url(#ir-sky)"/><rect y="300" width="720" height="60" fill="#8fc46a"/><circle cx="660" cy="52" r="30" fill="#ffd23f" stroke="#ff9f1c" stroke-width="3"><animate attributeName="r" values="30;33;30" dur="3s" repeatCount="indefinite"/></circle>
        <g id="ir-tankg" filter="url(#ir-sh)"><rect x="40" y="96" width="110" height="170" rx="14" fill="url(#ir-tank)" stroke="#0b1d1f" stroke-width="4"/><rect id="ir-tw" x="48" y="150" width="94" height="108" rx="8" fill="url(#ir-water)" opacity=".92"/><text x="95" y="86" text-anchor="middle" font-size="19" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">ถังน้ำ</text></g>
        <g class="ir-b" id="ir-b-in"><rect x="34" y="276" width="124" height="30" rx="15" fill="#ffd23f" stroke="#0b1d1f" stroke-width="3"/><text x="96" y="297" text-anchor="middle" font-size="16" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">INPUT น้ำ+ไฟ</text></g>
        <g filter="url(#ir-sh)"><rect x="196" y="190" width="86" height="64" rx="12" fill="#c9d3d8" stroke="#0b1d1f" stroke-width="4"/><circle id="ir-fan" cx="239" cy="222" r="22" fill="#fff" stroke="#0b1d1f" stroke-width="3"/><g id="ir-blades" style="transform-origin:239px 222px"><path d="M239 222v-18M239 222l16 9M239 222l-16 9" stroke="#0b1d1f" stroke-width="5" stroke-linecap="round"/></g><circle id="ir-led" cx="268" cy="200" r="5" fill="#777"/></g>
        <g class="ir-b" id="ir-b-pr"><rect x="186" y="262" width="106" height="30" rx="15" fill="#ff9ccc" stroke="#0b1d1f" stroke-width="3"/><text x="239" y="283" text-anchor="middle" font-size="16" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">PROCESS ปั๊ม</text></g>
        <path id="ir-pipe" d="M150 222H196M282 222H400Q430 222 430 196V150" fill="none" stroke="#6c7a82" stroke-width="16" stroke-linecap="round"/><path id="ir-flow" d="M150 222H196M282 222H400Q430 222 430 196V150" fill="none" stroke="#58c4ff" stroke-width="9" stroke-linecap="round" stroke-dasharray="14 12" opacity="0"/>
        <g id="ir-leakg" opacity="0"><circle cx="340" cy="236" r="5" fill="#58c4ff"><animate attributeName="cy" values="230;300" dur=".7s" repeatCount="indefinite"/></circle><circle cx="350" cy="232" r="4" fill="#58c4ff"><animate attributeName="cy" values="230;300" dur=".55s" repeatCount="indefinite"/></circle></g>
        <rect x="406" y="136" width="48" height="16" rx="5" fill="#6c7a82" stroke="#0b1d1f" stroke-width="3"/><g id="ir-drops" opacity="0"><circle cx="421" cy="160" r="4" fill="#58c4ff"><animate attributeName="cy" values="156;220" dur=".6s" repeatCount="indefinite"/></circle><circle cx="430" cy="160" r="4" fill="#58c4ff"><animate attributeName="cy" values="156;220" dur=".5s" begin=".2s" repeatCount="indefinite"/></circle><circle cx="440" cy="160" r="4" fill="#58c4ff"><animate attributeName="cy" values="156;220" dur=".65s" begin=".1s" repeatCount="indefinite"/></circle></g>
        <g filter="url(#ir-sh)"><path d="M392 236h76l-10 62a8 8 0 0 1-8 7h-40a8 8 0 0 1-8-7z" fill="url(#ir-pot)" stroke="#0b1d1f" stroke-width="4"/><path d="M386 228h88v14h-88z" fill="#d1693a" stroke="#0b1d1f" stroke-width="4"/><rect id="ir-soil" x="396" y="228" width="68" height="12" fill="#5a3a22"/><g id="ir-plant" style="transform-origin:430px 228px"><path d="M430 228c0-30 2-50 0-70" stroke="#3d8b3d" stroke-width="7" fill="none" stroke-linecap="round"/><path id="ir-l1" d="M430 190c-34-6-40-34-34-46 28 4 38 22 34 46z" fill="#4caf50" stroke="#256b27" stroke-width="3"/><path id="ir-l2" d="M430 170c34-4 42-32 34-46-28 2-40 20-34 46z" fill="#5cc760" stroke="#256b27" stroke-width="3"/></g></g>
        <g class="ir-b" id="ir-b-out"><rect x="382" y="310" width="116" height="30" rx="15" fill="#9fe9ff" stroke="#0b1d1f" stroke-width="3"/><text x="440" y="331" text-anchor="middle" font-size="16" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">OUTPUT ดินชื้น</text></g>
        <g id="ir-sensor"><rect x="474" y="238" width="7" height="48" rx="3" fill="#2a2f36" stroke="#0b1d1f" stroke-width="2"/><circle cx="478" cy="236" r="6" fill="#ff3d94" stroke="#0b1d1f" stroke-width="2"/></g>
        <path id="ir-fb" d="M481 250Q540 250 560 215" fill="none" stroke="#ff3d94" stroke-width="5" stroke-dasharray="8 8" stroke-linecap="round"/>
        <g filter="url(#ir-sh)"><rect x="520" y="128" width="150" height="104" rx="14" fill="#2f3b45" stroke="#0b1d1f" stroke-width="4"/><rect x="532" y="140" width="126" height="46" rx="8" fill="#0d1f1a"/><text id="ir-read" x="595" y="172" text-anchor="middle" font-size="30" font-weight="800" fill="#7dffb0" font-family="Chakra Petch,monospace">60%</text><text x="595" y="208" text-anchor="middle" font-size="14" font-weight="700" fill="#cfe3ee" font-family="Kanit,sans-serif">ตัวควบคุม · เกณฑ์ <tspan id="ir-thr">40</tspan>%</text><circle cx="548" cy="220" r="4" fill="#ff3d94"/></g>
        <g class="ir-b" id="ir-b-fb"><rect x="530" y="244" width="128" height="30" rx="15" fill="#ffb4d6" stroke="#0b1d1f" stroke-width="3"/><text x="594" y="265" text-anchor="middle" font-size="16" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">FEEDBACK วัดแล้วส่งกลับ</text></g></svg>
        <svg viewBox="0 0 720 96" class="ir-chart" id="ir-chart" aria-label="กราฟความชื้นดิน"><rect width="720" height="96" rx="10" fill="#0d1f1a"/><rect x="0" y="22" width="720" height="38" fill="#26e6a022"/><line x1="0" y1="22" x2="720" y2="22" stroke="#26e6a0" stroke-dasharray="6 6" opacity=".5"/><text x="8" y="16" font-size="12" fill="#a8f3d4" font-family="Kanit,sans-serif">ช่วงที่ต้นไม้สบาย 40–80%</text><polyline id="ir-line" points="" fill="none" stroke="#58c4ff" stroke-width="3" stroke-linejoin="round"/></svg>`,
        `<div class="sim-meter"><span>ความชื้นดิน</span><b id="ir-m">60%</b></div><label class="sim-rg">เกณฑ์ที่ต้องรดน้ำ <b id="ir-tv">40</b>%<input type="range" id="ir-t" min="20" max="70" value="40"></label><div class="sim-ts"><div class="sim-ts-h">ควบคุมระบบ</div>${sw('data-ir="auto"', 'โหมดอัตโนมัติ', 'เปิด · ระบบสั่งปั๊มเอง', 'ปิด · ต้องกดปั๊มเอง')}${sw('data-ir="pump"', 'ปั๊มน้ำ', 'ทำงานอยู่', 'หยุดอยู่')}<div class="sim-ts-h">ลองทำให้ระบบมีปัญหา</div>${sw('data-ir="leak"', 'ท่อน้ำ', 'รั่ว (น้ำไม่ถึงดิน)', 'ปกติ', true)}${sw('data-ir="sensor"', 'เซนเซอร์วัดความชื้น', 'เสีย (อ่านค่าผิด)', 'ปกติ', true)}</div><div class="sim-read" id="ir-say"></div>`,
        goal(el, 'ok', 'ให้ระบบรักษาความชื้น 40–80% ต่อเนื่องครบ 15 วินาที') + goal(el, 'leak', 'ลองทำท่อรั่ว แล้วดูว่าปั๊มหมุนแต่ดินไม่ชื้นขึ้น') + goal(el, 'sensor', 'ลองทำเซนเซอร์เสีย แล้วดูว่า Feedback ผิดทำให้ระบบเข้าใจผิด'));
      const s = { m: 60, thr: 40, pump: false, auto: true, leak: false, bad: false, hist: [], good: 0, t: 0, rot: 0 }; el._state = s;
      const byId = id => el.querySelector('#' + id), setA = (id, a, v) => byId(id).setAttribute(a, v);
      const draw = () => {
        const wet = clamp(s.m / 100, 0, 1);
        setA('ir-soil', 'fill', `hsl(25 ${40 + wet * 20}% ${46 - wet * 22}%)`);
        const sad = s.m < 20 || s.m > 92; byId('ir-plant').style.transform = sad ? `rotate(${s.m < 20 ? -10 : 6}deg) scale(.96)` : 'none';
        const lf = s.m < 20 ? '#a8a24a' : s.m > 92 ? '#4c8f89' : '#4caf50'; setA('ir-l1', 'fill', lf); setA('ir-l2', 'fill', s.m < 20 ? '#bdb65a' : '#5cc760');
        byId('ir-flow').setAttribute('opacity', s.pump ? 1 : 0); byId('ir-drops').setAttribute('opacity', s.pump && !s.leak ? 1 : 0); byId('ir-leakg').setAttribute('opacity', s.leak && s.pump ? 1 : 0);
        byId('ir-led').setAttribute('fill', s.pump ? '#2dff7a' : '#777'); byId('ir-tw').setAttribute('height', 108 - Math.min(60, s.t * 0.02)); byId('ir-tw').setAttribute('y', 150 + Math.min(60, s.t * 0.02));
        const reading = s.bad ? 100 : s.m; byId('ir-read').textContent = Math.round(reading) + '%'; byId('ir-read').setAttribute('fill', reading < s.thr ? '#ff8a8a' : '#7dffb0'); byId('ir-thr').textContent = s.thr;
        $('#ir-m', el).textContent = Math.round(s.m) + '%';
        setSw($('[data-ir="auto"]', el), s.auto); setSw($('[data-ir="pump"]', el), s.pump); setSw($('[data-ir="leak"]', el), s.leak); setSw($('[data-ir="sensor"]', el), s.bad);
        ['in', 'pr', 'out', 'fb'].forEach(k => byId('ir-b-' + k).classList.toggle('glow', (k === 'in') || (k === 'pr' && s.pump) || (k === 'out' && s.pump && !s.leak) || (k === 'fb' && s.auto)));
        byId('ir-fb').setAttribute('stroke', s.bad ? '#8a8a8a' : '#ff3d94');
        byId('ir-line').setAttribute('points', s.hist.map((v, i) => `${i * (720 / 120)},${90 - v * 0.82}`).join(' '));
        const say = $('#ir-say', el);
        if (s.bad) say.innerHTML = '<b>Feedback ผิดพลาด</b><p>เซนเซอร์บอกว่า "ชื้น 100%" ตลอด ตัวควบคุมจึงไม่สั่งปั๊ม ดินแห้งลงเรื่อยๆ ทั้งที่ระบบดูเหมือนปกติ</p>';
        else if (s.leak && s.pump) say.innerHTML = '<b>ปั๊มหมุน แต่ท่อรั่ว</b><p>ปั๊มทำงานไม่ได้แปลว่าดินได้รับน้ำ ต้องดู Output (ความชื้นที่เพิ่มขึ้นจริง) ไม่ใช่ดูแค่ว่าปั๊มหมุน</p>';
        else say.innerHTML = s.pump ? '<b>ระบบกำลังรดน้ำ</b><p>ความชื้นต่ำกว่าเกณฑ์ › ตัวควบคุมสั่งปั๊ม › น้ำไปที่ดิน › เซนเซอร์วัดซ้ำและส่งกลับ</p>' : '<b>ระบบกำลังเฝ้าดู</b><p>ความชื้นอยู่ในเกณฑ์ ปั๊มจึงหยุดรอ</p>';
      };
      every(el, () => {
        const dt = 0.1 * 1; s.t++;
        s.m -= 2.2 * dt * (s.m > 0 ? 1 : 0); if (s.pump) s.m += (s.leak ? 0.4 : 10) * dt; s.m = clamp(s.m, 0, 100);
        const reading = s.bad ? 100 : s.m;
        if (s.auto) { if (reading < s.thr) s.pump = true; else if (reading > s.thr + 22) s.pump = false; }
        if (s.t % 10 === 0) { s.hist.push(s.m); if (s.hist.length > 120) s.hist.shift(); }
        if (s.m >= 40 && s.m <= 80) { s.good += dt; if (s.good >= 15) tick(el, 'ok'); } else s.good = Math.max(0, s.good - dt * 2);
        if (s.leak && s.pump && s.t % 30 === 0 && s.m < s.thr - 5) tick(el, 'leak');
        if (s.bad && s.m < 25) tick(el, 'sensor');
        s.rot += s.pump ? 40 : 0; byId('ir-blades').style.transform = `rotate(${s.rot}deg)`;
        draw();
      }, 100);
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-ir]'); if (!b) return; tone(500, 60);
        if (b.dataset.ir === 'auto') { s.auto = !s.auto; }
        if (b.dataset.ir === 'pump') { s.auto = false; s.pump = !s.pump; }
        if (b.dataset.ir === 'leak') { s.leak = !s.leak; }
        if (b.dataset.ir === 'sensor') { s.bad = !s.bad; }
        draw();
      });
      el.addEventListener('input', e => { if (e.target.id === 'ir-t') { s.thr = +e.target.value; $('#ir-tv', el).textContent = s.thr; } });
      draw();
    }
  };

  /* ---------- 4) ทดสอบรับน้ำหนักของวัสดุ ---------- */
  defs['DT-M1-C04-M01'] = {
    title: 'แท่นทดสอบวัสดุ: รับน้ำหนักไหวไหม งบพอไหม?', sub: 'เลือกวัสดุ วางน้ำหนักทีละน้อย ดูการโก่งตัว แล้วตัดสินตามเกณฑ์บังคับ',
    mount(el) {
      const MAT = { A: { n: 'วัสดุ A', price: 20, cap: 0.3, c: '#e0b27a', c2: '#b88345' }, B: { n: 'วัสดุ B', price: 50, cap: 1.0, c: '#c98a4b', c2: '#8a5a2b' }, C: { n: 'วัสดุ C', price: 80, cap: 2.0, c: '#b0b7bd', c2: '#6c7479' } };
      const s = { m: 'B', w: 0, broke: false, tested: new Set() };
      el.innerHTML = frame('แท่นทดสอบวัสดุ: รับน้ำหนักไหวไหม งบพอไหม?', 'เลือกวัสดุ วางน้ำหนักทีละน้อย ดูการโก่งตัว แล้วตัดสินตามเกณฑ์บังคับ',
        `<svg viewBox="0 0 720 340" id="bn-svg" role="img" aria-label="แผ่นวัสดุวางบนที่รองรับสองข้าง มีตุ้มน้ำหนักวางตรงกลาง"><defs><linearGradient id="bn-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f1f4"/><stop offset="1" stop-color="#c9d7dc"/></linearGradient><linearGradient id="bn-pf" x1="0" y1="0" x2="0" y2="1"><stop id="bn-pf1" offset="0" stop-color="#c98a4b"/><stop id="bn-pf2" offset="1" stop-color="#8a5a2b"/></linearGradient><linearGradient id="bn-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f7a82"/><stop offset="1" stop-color="#2f363b"/></linearGradient><filter id="bn-sh"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-opacity=".35"/></filter></defs><rect width="720" height="340" fill="url(#bn-bg)"/><rect y="290" width="720" height="50" fill="#9aa8ae"/><g stroke="#ffffff55" stroke-width="2">${Array.from({ length: 36 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="290"/>`).join('')}</g>
        <g filter="url(#bn-sh)"><rect x="96" y="214" width="64" height="76" rx="6" fill="url(#bn-w)" stroke="#0b1d1f" stroke-width="4"/><rect x="560" y="214" width="64" height="76" rx="6" fill="url(#bn-w)" stroke="#0b1d1f" stroke-width="4"/></g>
        <g id="bn-beam" filter="url(#bn-sh)"><path id="bn-plank" d="" stroke="#0b1d1f" stroke-width="4" stroke-linejoin="round"/><path id="bn-grain" d="" stroke="#ffffff33" stroke-width="2" fill="none"/></g><g id="bn-stack"></g><g id="bn-broken" opacity="0"></g>
        <g transform="translate(40 36)"><rect width="190" height="54" rx="10" fill="#0d1f1a"/><text x="95" y="24" text-anchor="middle" font-size="13" fill="#a8f3d4" font-family="Kanit,sans-serif">น้ำหนักที่วาง</text><text id="bn-wt" x="95" y="46" text-anchor="middle" font-size="26" font-weight="800" fill="#ffd23f" font-family="Chakra Petch,monospace">0.0 กก.</text></g><g transform="translate(250 36)"><rect width="190" height="54" rx="10" fill="#0d1f1a"/><text x="95" y="24" text-anchor="middle" font-size="13" fill="#a8f3d4" font-family="Kanit,sans-serif">รับได้สูงสุด (ผู้ผลิต)</text><text id="bn-cap" x="95" y="46" text-anchor="middle" font-size="26" font-weight="800" fill="#7dffb0" font-family="Chakra Petch,monospace">1.0 กก.</text></g></svg>`,
        `<div class="sim-read"><b>โจทย์:</b> ต้องรับ <b>0.5 กก.</b> และงบไม่เกิน <b>60 บาท</b></div><div class="sim-btns three">${Object.entries(MAT).map(([k, m]) => `<button type="button" class="sim-b mat ${k === s.m ? 'on' : ''}" data-bn="m${k}">${m.n}<small>${m.price} บาท</small></button>`).join('')}</div><div class="sim-btns"><button type="button" class="sim-b" data-bn="plus">+ วางตุ้ม 0.1 กก.</button><button type="button" class="sim-b" data-bn="minus">− เอาออก</button><button type="button" class="sim-b" data-bn="reset">เริ่มใหม่</button></div><div class="sim-checks" id="bn-chk"></div>`,
        goal(el, 'break', 'วางน้ำหนักจนวัสดุ A แตก') + goal(el, 'pass', 'หาวัสดุที่ผ่านทั้งแรงและงบ (ทดสอบที่ 0.5 กก.)') + goal(el, 'budget', 'ลองวัสดุ C แล้วดูว่าทำไมไม่ผ่านเกณฑ์บังคับ'));
      const drawBeam = () => {
        const m = MAT[s.m], ratio = s.w / m.cap, bend = s.broke ? 0 : Math.min(ratio, 1) * 46, x1 = 128, x2 = 592, y0 = 214, th = 18;
        const top = `M${x1 - 18} ${y0} Q${(x1 + x2) / 2} ${y0 + bend * 2} ${x2 + 18} ${y0}`, bot = `L${x2 + 18} ${y0 + th} Q${(x1 + x2) / 2} ${y0 + bend * 2 + th} ${x1 - 18} ${y0 + th}Z`;
        const plank = el.querySelector('#bn-plank'); plank.setAttribute('d', s.broke ? '' : top + bot); plank.setAttribute('fill', `url(#bn-pf)`);
        el.querySelector('#bn-pf1').setAttribute('stop-color', m.c); el.querySelector('#bn-pf2').setAttribute('stop-color', m.c2);
        const stress = ratio > 0.85 ? '#ff3d54' : ratio > 0.6 ? '#ffb400' : null; plank.setAttribute('stroke', stress || '#0b1d1f');
        el.querySelector('#bn-grain').setAttribute('d', s.broke ? '' : `M${x1} ${y0 + 6} Q${(x1 + x2) / 2} ${y0 + bend * 2 + 6} ${x2} ${y0 + 6}M${x1} ${y0 + 12} Q${(x1 + x2) / 2} ${y0 + bend * 2 + 12} ${x2} ${y0 + 12}`);
        const n = Math.round(s.w * 10), cx = (x1 + x2) / 2, base = y0 + bend * 1 - 2; let blocks = '';
        for (let i = 0; i < n && !s.broke; i++) blocks += `<g transform="translate(${cx - 38} ${base - (i + 1) * 20 - (i ? 0 : 0)})"><rect width="76" height="19" rx="3" fill="url(#bn-w)" stroke="#0b1d1f" stroke-width="2.5"/><text x="38" y="14" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="Chakra Petch,sans-serif">0.1 kg</text></g>`;
        el.querySelector('#bn-stack').innerHTML = blocks;
        const br = el.querySelector('#bn-broken'); if (s.broke) { br.setAttribute('opacity', 1); br.innerHTML = `<g class="bn-fall"><path d="M110 214 L330 232 L330 250 L110 232Z" fill="${m.c}" stroke="#0b1d1f" stroke-width="4"/></g><g class="bn-fall2"><path d="M390 232 L610 214 L610 232 L390 250Z" fill="${m.c2}" stroke="#0b1d1f" stroke-width="4"/></g><text x="360" y="150" text-anchor="middle" font-size="44" font-weight="900" fill="#ff3d54" stroke="#0b1d1f" stroke-width="6" paint-order="stroke" font-family="Kanit,sans-serif">แตก!</text>`; } else { br.setAttribute('opacity', 0); br.innerHTML = ''; }
        el.querySelector('#bn-wt').textContent = fmt(s.w) + ' กก.'; el.querySelector('#bn-wt').setAttribute('fill', ratio > 1 ? '#ff6b6b' : '#ffd23f'); el.querySelector('#bn-cap').textContent = fmt(m.cap) + ' กก.';
        const okF = m.cap >= 0.5, okB = m.price <= 60;
        $('#bn-chk', el).innerHTML = `<div class="${okF ? 'ok' : 'no'}">${okF ? '✓' : '✗'} รับ 0.5 กก. ได้ (${fmt(m.cap)} กก.)</div><div class="${okB ? 'ok' : 'no'}">${okB ? '✓' : '✗'} งบไม่เกิน 60 บาท (${m.price} บาท)</div><div class="verdict ${okF && okB ? 'ok' : 'no'}">${okF && okB ? 'ผ่านเกณฑ์บังคับทั้งสองข้อ' : 'ไม่ผ่านเกณฑ์บังคับ: ' + (!okF ? 'รับน้ำหนักไม่พอ' : 'เกินงบ')}</div>`;
        $$('.mat', el).forEach(b => b.classList.toggle('on', b.dataset.bn === 'm' + s.m));
        if (s.broke && s.m === 'A') tick(el, 'break'); if (s.w >= 0.5 && okF && okB && !s.broke) tick(el, 'pass'); if (s.m === 'C') tick(el, 'budget');
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-bn]'); if (!b) return; const k = b.dataset.bn; tone(380 + s.w * 200, 70);
        if (k[0] === 'm') { s.m = k[1]; s.w = 0; s.broke = false; } else if (k === 'plus' && !s.broke) { s.w = Math.round((s.w + 0.1) * 10) / 10; if (s.w > MAT[s.m].cap * 1.02) { s.broke = true; tone(120, 400, 'sawtooth', 0.08); } else if (s.w > MAT[s.m].cap * 0.85) tone(220, 120, 'square', 0.03); } else if (k === 'minus' && !s.broke) s.w = Math.max(0, Math.round((s.w - 0.1) * 10) / 10); else if (k === 'reset') { s.w = 0; s.broke = false; }
        drawBeam();
      });
      drawBeam();
    }
  };

  /* ---------- 5) วงจรไฟฟ้า ---------- */
  defs['DT-M1-C05-M01'] = {
    title: 'ห้องทดลองวงจรไฟฟ้า', sub: 'กดสวิตช์ ตัดสาย ใส่ตัวต้านทาน แล้วดูกระแสไหลและหลอดสว่าง (แบบจำลองปลอดภัย ไม่ใช้ไฟจริง)',
    mount(el) {
      const s = { sw: false, cut: false, res: false };
      el.innerHTML = frame('ห้องทดลองวงจรไฟฟ้า', 'กดสวิตช์ ตัดสาย ใส่ตัวต้านทาน แล้วดูกระแสไหลและหลอดสว่าง (แบบจำลองปลอดภัย ไม่ใช้ไฟจริง)',
        `<svg viewBox="0 0 720 340" id="ci-svg" role="img" aria-label="วงจรไฟฟ้า มีแบตเตอรี่ สวิตช์ หลอดไฟ ตัวต้านทาน และสายไฟ"><defs><radialGradient id="ci-glow"><stop offset="0" stop-color="#fff9c4" stop-opacity="1"/><stop offset=".5" stop-color="#ffe066" stop-opacity=".55"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient><linearGradient id="ci-bat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b6ea5"/><stop offset=".5" stop-color="#6fa8dc"/><stop offset="1" stop-color="#2d5885"/></linearGradient><pattern id="ci-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#1d3a32" stroke-width="1"/></pattern><filter id="ci-sh"><feDropShadow dx="2" dy="3" stdDeviation="2" flood-opacity=".4"/></filter></defs><rect width="720" height="340" rx="12" fill="#0e2a24"/><rect width="720" height="340" rx="12" fill="url(#ci-grid)"/>
        <path id="ci-path" d="M110 170V80H260M330 80H520Q600 80 600 120V230M600 230H330M260 230H110V170" fill="none" stroke="#c48b4a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path id="ci-wire2" d="M600 230H330" fill="none" stroke="#e8b06a" stroke-width="3" opacity=".6"/>
        <g id="ci-flow"></g>
        <g filter="url(#ci-sh)" transform="translate(110 170)"><rect x="-34" y="-62" width="68" height="124" rx="10" fill="url(#ci-bat)" stroke="#0b1d1f" stroke-width="4"/><rect x="-14" y="-74" width="28" height="14" rx="3" fill="#ccd" stroke="#0b1d1f" stroke-width="3"/><text y="6" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="Chakra Petch,sans-serif">+ 1.5V −</text></g>
        <g id="ci-swg" class="ci-click" tabindex="0" role="button" aria-label="สวิตช์ กดเพื่อเปิดหรือปิด" transform="translate(295 80)" filter="url(#ci-sh)"><rect x="-44" y="-26" width="88" height="52" rx="10" fill="#2f3b45" stroke="#0b1d1f" stroke-width="4"/><circle cx="-26" cy="0" r="7" fill="#e8b06a" stroke="#0b1d1f" stroke-width="2"/><circle cx="26" cy="0" r="7" fill="#e8b06a" stroke="#0b1d1f" stroke-width="2"/><line id="ci-lever" x1="-26" y1="0" x2="20" y2="-26" stroke="#ff3d94" stroke-width="8" stroke-linecap="round"/><text id="ci-swlab" y="-38" text-anchor="middle" font-size="18" font-weight="800" fill="#ffe066" font-family="Kanit,sans-serif">สวิตช์ เปิดอยู่</text></g>
        <g id="ci-resg" class="ci-click" tabindex="0" role="button" aria-label="ตัวต้านทาน กดเพื่อใส่หรือเอาออก" transform="translate(470 80)" filter="url(#ci-sh)"><rect x="-38" y="-14" width="76" height="28" rx="14" fill="#e6c79a" stroke="#0b1d1f" stroke-width="3"/><g><rect x="-22" y="-14" width="7" height="28" fill="#b03a2e"/><rect x="-8" y="-14" width="7" height="28" fill="#2c3e50"/><rect x="6" y="-14" width="7" height="28" fill="#d4a017"/></g><text y="38" text-anchor="middle" font-size="17" font-weight="800" fill="#e6f4ef" font-family="Kanit,sans-serif" id="ci-rlab">ตัวต้านทาน (กดใส่)</text></g>
        <g transform="translate(600 175)" filter="url(#ci-sh)"><circle id="ci-halo" r="90" fill="url(#ci-glow)" opacity="0"/><rect x="-18" y="26" width="36" height="26" rx="5" fill="#8d99a1" stroke="#0b1d1f" stroke-width="3"/><circle id="ci-bulb" r="34" fill="#c7d7de" stroke="#0b1d1f" stroke-width="4"/><text id="ci-bulblab" y="82" text-anchor="middle" font-size="20" font-weight="800" fill="#ffffff" font-family="Kanit,sans-serif" stroke="#0b1d1f" stroke-width="4" paint-order="stroke">หลอดดับ</text><path d="M-12 14Q0 -22 12 14" stroke="#555" stroke-width="3" fill="none"/><circle r="34" fill="url(#ci-sh2)"/></g>
        <g id="ci-cutg" class="ci-click" tabindex="0" role="button" aria-label="จุดตัดสายไฟ กดเพื่อตัดหรือต่อสาย" transform="translate(330 230)"><rect x="-22" y="-16" width="44" height="32" rx="8" fill="#0e2a24" stroke="#fff" stroke-width="2.5" stroke-dasharray="5 4"/><g id="ci-cutx" opacity="0"><line x1="-14" y1="-9" x2="14" y2="9" stroke="#ff4d4d" stroke-width="5"/><line x1="-14" y1="9" x2="14" y2="-9" stroke="#ff4d4d" stroke-width="5"/></g><text y="40" text-anchor="middle" font-size="17" font-weight="800" fill="#e6f4ef" font-family="Kanit,sans-serif" id="ci-cutlab">สายไฟ ต่อดี (กดเพื่อตัด)</text></g></svg>`,
        `<div class="sim-read" id="ci-say"></div><div class="sim-ts"><div class="sim-ts-h">กดเพื่อสลับ</div>${sw('data-ci="sw"', 'สวิตช์', 'ปิดสวิตช์ · กระแสผ่านได้', 'เปิดสวิตช์ · กระแสผ่านไม่ได้')}${sw('data-ci="cut"', 'สายไฟ', 'ขาด · ทางเดินกระแสขาด', 'ต่อดี', true)}${sw('data-ci="res"', 'ตัวต้านทาน', 'ใส่อยู่ · กระแสผ่านยากขึ้น', 'ไม่ได้ใส่')}</div>`,
        goal(el, 'on', 'ทำให้หลอดไฟสว่าง') + goal(el, 'cut', 'ตัดสายไฟ 1 เส้น แล้วดูว่าสวิตช์ปิดแล้วหลอดยังดับ') + goal(el, 'res', 'ใส่ตัวต้านทานแล้วดูหลอดหรี่ลง'));
      const dots = Array.from({ length: 14 }, (_, i) => `<circle r="5" fill="#7dffb0" stroke="#0b1d1f" stroke-width="1.5"><animateMotion dur="3.2s" begin="${-i * 0.23}s" repeatCount="indefinite" rotate="auto"><mpath href="#ci-path"/></animateMotion></circle>`).join('');
      const upd = () => {
        const closed = s.sw && !s.cut; const lv = el.querySelector('#ci-lever'); lv.setAttribute('y2', s.sw ? 0 : -26); lv.setAttribute('x2', s.sw ? 26 : 20);
        el.querySelector('#ci-flow').innerHTML = closed ? dots : ''; el.querySelector('#ci-cutx').setAttribute('opacity', s.cut ? 1 : 0);
        const lvl = closed ? (s.res ? 0.45 : 1) : 0; el.querySelector('#ci-halo').setAttribute('opacity', lvl); el.querySelector('#ci-bulb').setAttribute('fill', closed ? (s.res ? '#ffe9a0' : '#fff39a') : '#c7d7de');
        el.querySelector('#ci-resg').style.opacity = s.res ? 1 : .55; el.querySelector('#ci-rlab').textContent = s.res ? 'ตัวต้านทาน (ใส่แล้ว)' : 'ตัวต้านทาน (กดใส่)';
        const btn = n => $(`[data-ci="${n}"]`, el); setSw(btn('sw'), s.sw); setSw(btn('cut'), s.cut); setSw(btn('res'), s.res);
        const lamp = closed ? (s.res ? 'หลอด: ติดแบบหรี่' : 'หลอด: ติดสว่าง') : 'หลอด: ดับ';
        el.querySelector('#ci-swlab').textContent = s.sw ? 'สวิตช์ ปิดอยู่ (ต่อวงจร)' : 'สวิตช์ เปิดอยู่ (ตัดวงจร)'; el.querySelector('#ci-cutlab').textContent = s.cut ? 'สายไฟ ขาด (กดเพื่อต่อ)' : 'สายไฟ ต่อดี (กดเพื่อตัด)'; el.querySelector('#ci-bulblab').textContent = closed ? (s.res ? 'หลอดติดแบบหรี่' : 'หลอดติดสว่าง') : 'หลอดดับ';
        const why = closed ? `${pill(true, lamp)} <b>วงจรปิด (ต่อครบรอบ)</b><p>กระแสไหลจากแบตเตอรี่ › สวิตช์ › ${s.res ? 'ตัวต้านทาน (ต้านกระแส) › ' : ''}หลอด › กลับแบตเตอรี่ จึงสว่าง${s.res ? 'น้อยลง' : ''}</p>` : `${pill(false, lamp)} <b>วงจรเปิด (ทางเดินกระแสขาด)</b><p>${!s.sw && s.cut ? 'ทั้งสวิตช์เปิดและสายขาด' : !s.sw ? 'สวิตช์อยู่ตำแหน่งเปิด ทางเดินกระแสขาด' : 'สวิตช์ปิดแล้ว แต่สายหนึ่งเส้นขาด กระแสจึงไม่ครบรอบ'}</p>`;
        $('#ci-say', el).innerHTML = why;
        if (closed) tick(el, 'on'); if (s.sw && s.cut) tick(el, 'cut'); if (closed && s.res) tick(el, 'res');
      };
      const act = k => { tone(k === 'sw' ? 620 : 300, 80, k === 'cut' ? 'square' : 'sine'); if (k === 'sw') s.sw = !s.sw; if (k === 'cut') s.cut = !s.cut; if (k === 'res') s.res = !s.res; upd(); };
      el.addEventListener('click', e => { const b = e.target.closest('[data-ci]'); if (b) return act(b.dataset.ci); if (e.target.closest('#ci-swg')) act('sw'); else if (e.target.closest('#ci-resg')) act('res'); else if (e.target.closest('#ci-cutg')) act('cut'); });
      el.addEventListener('keydown', e => { if (e.key !== 'Enter' && e.key !== ' ') return; const g = e.target.closest('.ci-click'); if (!g) return; e.preventDefault(); act(g.id === 'ci-swg' ? 'sw' : g.id === 'ci-resg' ? 'res' : 'cut'); });
      el.querySelector('#ci-svg defs').insertAdjacentHTML('beforeend', '<radialGradient id="ci-sh2" cx=".32" cy=".28"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient>');
      upd();
    }
  };
  defs['DT-M1-C05-M01#2'] = {
    title: 'ห้องทดลองล้อและเพลา', sub: 'เปลี่ยนรัศมีล้อ แล้วเทียบแรงที่ใช้กับระยะที่มือต้องหมุน',
    mount(el) {
      const s = { r: 4, turning: false, lifted: 0 };
      el.innerHTML = frame('ห้องทดลองล้อและเพลา', 'เปลี่ยนรัศมีล้อ แล้วเทียบแรงที่ใช้กับระยะที่มือต้องหมุน',
        `<svg viewBox="0 0 720 360" id="wh-svg" role="img" aria-label="ล้อและเพลายกของด้วยเชือก"><defs><radialGradient id="wh-wheel" cx=".4" cy=".35"><stop offset="0" stop-color="#e9b574"/><stop offset="1" stop-color="#9a6030"/></radialGradient><linearGradient id="wh-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d99a1"/><stop offset="1" stop-color="#4b565d"/></linearGradient><filter id="wh-sh"><feDropShadow dx="3" dy="5" stdDeviation="3" flood-opacity=".4"/></filter></defs><rect width="720" height="360" rx="12" fill="#dff1f7"/><rect y="320" width="720" height="40" fill="#9aa8ae"/><rect x="196" y="36" width="12" height="284" fill="#6c7a82" stroke="#0b1d1f" stroke-width="3"/><rect x="70" y="30" width="230" height="16" rx="6" fill="#6c7a82" stroke="#0b1d1f" stroke-width="3"/><line id="wh-rope" x1="372" y1="170" x2="372" y2="300" stroke="#8a6a3a" stroke-width="5"/>
        <g id="wh-gear" transform="translate(202 170)" filter="url(#wh-sh)"><g id="wh-rot"><circle id="wh-w" r="80" fill="url(#wh-wheel)" stroke="#0b1d1f" stroke-width="5"/><g id="wh-spokes" stroke="#0b1d1f" stroke-width="4"></g><circle r="22" fill="#c9d3d8" stroke="#0b1d1f" stroke-width="5"/><circle id="wh-handle" cx="0" cy="-70" r="9" fill="#ff3d94" stroke="#0b1d1f" stroke-width="3"/></g></g>
        <g id="wh-load" transform="translate(372 300)" filter="url(#wh-sh)"><rect x="-30" y="0" width="60" height="50" rx="6" fill="url(#wh-box)" stroke="#0b1d1f" stroke-width="4"/><text y="34" text-anchor="middle" font-size="18" font-weight="900" fill="#fff" font-family="Chakra Petch,sans-serif">6 N</text></g>
        <g transform="translate(470 40)"><rect width="230" height="138" rx="12" fill="#0d1f1a"/><text x="14" y="30" font-size="15" fill="#a8f3d4" font-family="Kanit,sans-serif">รัศมีล้อ</text><text id="wh-rr" x="216" y="30" text-anchor="end" font-size="22" font-weight="800" fill="#ffd23f" font-family="Chakra Petch,sans-serif">4</text><text x="14" y="64" font-size="15" fill="#a8f3d4" font-family="Kanit,sans-serif">แรงที่ต้องดึงขอบล้อ</text><text id="wh-f" x="216" y="64" text-anchor="end" font-size="22" font-weight="800" fill="#7dffb0" font-family="Chakra Petch,sans-serif">1.5 N</text><text x="14" y="98" font-size="15" fill="#a8f3d4" font-family="Kanit,sans-serif">ระยะที่มือต้องหมุน/รอบ</text><text id="wh-d" x="216" y="98" text-anchor="end" font-size="22" font-weight="800" fill="#ff9ccc" font-family="Chakra Petch,sans-serif">25 หน่วย</text><text x="14" y="126" font-size="13" fill="#cfe3ee" font-family="Kanit,sans-serif">ของขึ้นต่อรอบ: <tspan id="wh-l">6.3</tspan> หน่วย</text></g></svg>`,
        `<label class="sim-rg">รัศมีล้อ <b id="wh-rv">4</b> หน่วย (รัศมีเพลา = 1)<input type="range" id="wh-r" min="2" max="8" step="1" value="4"></label><div class="sim-btns"><button type="button" class="sim-b big" data-wh="turn">หมุนล้อ 1 รอบ</button></div><div class="sim-read" id="wh-say"></div>`,
        goal(el, 'turn', 'หมุนล้อให้ยกของขึ้น 1 รอบ') + goal(el, 'big', 'ใช้ล้อรัศมี 8 แล้วเทียบกับรัศมี 2') + goal(el, 'trade', 'สังเกตข้อแลกเปลี่ยน: ใช้แรงน้อยลงแต่มือต้องเคลื่อนไกลขึ้น'));
      const spokes = el.querySelector('#wh-spokes'); for (let i = 0; i < 6; i++) spokes.insertAdjacentHTML('beforeend', `<line x1="0" y1="0" x2="${Math.cos(i * Math.PI / 3) * 76}" y2="${Math.sin(i * Math.PI / 3) * 76}"/>`);
      const seen = new Set(); let rot = 0, lift = 0;
      const upd = () => {
        const R = s.r, force = 6 * 1 / R, hand = 2 * Math.PI * R, up = 2 * Math.PI * 1;
        el.querySelector('#wh-w').setAttribute('r', 22 + R * 7.2); el.querySelector('#wh-handle').setAttribute('cy', -(22 + R * 7.2) + 10);
        $('#wh-rr', el).textContent = R; $('#wh-rv', el).textContent = R; $('#wh-f', el).textContent = fmt(force, 2) + ' N'; $('#wh-d', el).textContent = fmt(hand, 1) + ' หน่วย'; $('#wh-l', el).textContent = fmt(up, 1);
        seen.add(R); $('#wh-say', el).innerHTML = `<b>รัศมีล้อ ${R}</b><p>ล้อใหญ่ขึ้น ${R}/1 เท่า › แรงที่ใช้ลดลงเหลือ <b>${fmt(force, 2)} N</b> แต่มือต้องเคลื่อนไกลถึง <b>${fmt(hand, 1)}</b> หน่วยเพื่อยกของขึ้นแค่ ${fmt(up, 1)} หน่วย</p>`;
        if (seen.has(8) && seen.has(2)) { tick(el, 'big'); tick(el, 'trade'); }
      };
      const turn = async () => {
        if (s.turning) return; s.turning = true; tone(300, 300, 'triangle'); const R = s.r, start = performance.now(), dur = 1100, lift0 = lift, lh = Math.min(120, (2 * Math.PI) * 7);
        await new Promise(res => { const f = t => { const p = Math.min(1, (t - start) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; rot = e * 360; el.querySelector('#wh-rot').setAttribute('transform', `rotate(${rot})`); const ly = clamp(lift0 + e * lh * 1, 0, 130); el.querySelector('#wh-load').setAttribute('transform', `translate(372 ${300 - ly})`); el.querySelector('#wh-rope').setAttribute('y2', 300 - ly); if (p < 1) requestAnimationFrame(f); else { lift = clamp(lift0 + lh, 0, 130); res(); } }; requestAnimationFrame(f); });
        if (lift >= 130) { await new Promise(r => setTimeout(r, 500)); lift = 0; el.querySelector('#wh-load').setAttribute('transform', 'translate(372 300)'); el.querySelector('#wh-rope').setAttribute('y2', 300); }
        s.turning = false; tick(el, 'turn');
      };
      el.addEventListener('input', e => { if (e.target.id === 'wh-r') { s.r = +e.target.value; tone(300 + s.r * 40, 50); upd(); } });
      el.addEventListener('click', e => { if (e.target.closest('[data-wh="turn"]')) turn(); });
      upd();
    }
  };

  /* ---------- 6) ถ้าตัดสินใจเลือกทางเลือก (เมทริกซ์) ---------- */
  defs['DT-M1-C06-M01'] = {
    title: 'ตารางตัดสินใจ: เทียบทางเลือกด้วยเกณฑ์เดียวกัน', sub: 'ปรับน้ำหนักความสำคัญของเกณฑ์ แล้วดูว่าทางเลือกไหนชนะ และมีข้อใดไม่ผ่านเกณฑ์บังคับหรือไม่',
    mount(el) {
      const crit = [{ k: 'keep', n: 'เก็บของครบ 4 ชิ้น', w: 3, must: true }, { k: 'drop', n: 'หยิบแล้วไม่ตกจากโต๊ะ', w: 3, must: true }, { k: 'space', n: 'ไม่เกินพื้นที่ 20×15 ซม.', w: 2, must: true }, { k: 'cost', n: 'ทำได้ด้วยวัสดุที่มี', w: 1, must: false }];
      const opts = [{ n: 'A: ถาดแบ่งช่อง', s: { keep: 5, drop: 4, space: 4, cost: 3 }, c: '#26b8a0' }, { n: 'B: แถบกันกลิ้งอย่างเดียว', s: { keep: 2, drop: 5, space: 5, cost: 5 }, c: '#ff3d94' }, { n: 'C: กล่องใหญ่มีฝา', s: { keep: 5, drop: 5, space: 3, cost: 2 }, c: '#6c63ff' }];
      el.innerHTML = frame('ตารางตัดสินใจ: เทียบทางเลือกด้วยเกณฑ์เดียวกัน', 'ปรับน้ำหนักความสำคัญของเกณฑ์ แล้วดูว่าทางเลือกไหนชนะ และมีข้อใดไม่ผ่านเกณฑ์บังคับหรือไม่',
        `<div class="dm" id="dm"></div>`,
        `<div id="dm-sliders">${crit.map(c => `<label class="sim-rg">${c.n} ${c.must ? '<span class="tg" style="--c:#ff3d94">บังคับ</span>' : ''} · ความสำคัญ <b id="dm-v-${c.k}">${c.w}</b><input type="range" data-dm="${c.k}" min="0" max="5" value="${c.w}"></label>`).join('')}</div><div class="sim-read" id="dm-say"></div>`,
        goal(el, 'win', 'หาทางเลือกที่ชนะและผ่านเกณฑ์บังคับทุกข้อ') + goal(el, 'fail', 'ดูทางเลือกที่คะแนนรวมสูงแต่ตกเกณฑ์บังคับ') + goal(el, 'flip', 'ปรับน้ำหนักจนผู้ชนะเปลี่ยน'));
      let first = null; const wins = new Set();
      const calc = () => {
        const tot = crit.reduce((a, c) => a + c.w, 0) || 1;
        const rows = opts.map(o => { const sc = crit.reduce((a, c) => a + o.s[c.k] * c.w, 0) / tot / 5 * 100, fails = crit.filter(c => c.must && o.s[c.k] <= 2); return { o, sc, fails }; });
        const valid = rows.filter(r => !r.fails.length).sort((a, b) => b.sc - a.sc), top = [...rows].sort((a, b) => b.sc - a.sc)[0];
        $('#dm', el).innerHTML = rows.map(r => `<div class="dm-row ${valid[0] && valid[0].o === r.o ? 'win' : ''} ${r.fails.length ? 'bad' : ''}"><div class="dm-n" style="--c:${r.o.c}">${r.o.n}</div><div class="dm-cells">${crit.map(c => `<span class="${c.must && r.o.s[c.k] <= 2 ? 'x' : ''}" title="${esc(c.n)}">${'★'.repeat(r.o.s[c.k])}${'☆'.repeat(5 - r.o.s[c.k])}</span>`).join('')}</div><div class="dm-bar"><i style="width:${r.sc}%;background:${r.o.c}"></i><b>${Math.round(r.sc)}</b></div>${r.fails.length ? `<p class="no">ตกเกณฑ์บังคับ: ${r.fails.map(f => esc(f.n)).join(', ')}</p>` : ''}</div>`).join('') + `<div class="dm-legend">${crit.map(c => `<span>${esc(c.n)}</span>`).join('')}</div>`;
        $('#dm-say', el).innerHTML = valid[0] ? `<b>ทางเลือกที่ควรเลือก: ${esc(valid[0].o.n)}</b><p>ผ่านเกณฑ์บังคับทุกข้อ และคะแนนรวมสูงสุดในกลุ่มที่ผ่าน ${top !== valid[0] ? `<br>(${esc(top.o.n)} คะแนนสูงกว่า แต่ตกเกณฑ์บังคับ จึงเลือกไม่ได้)` : ''}</p>` : '<b>ไม่มีทางเลือกที่ผ่านเกณฑ์บังคับ</b><p>ต้องออกแบบทางเลือกใหม่</p>';
        if (valid[0]) { tick(el, 'win'); wins.add(valid[0].o.n); if (wins.size >= 2) tick(el, 'flip'); } if (top !== valid[0] && top.fails.length) tick(el, 'fail');
      };
      el.addEventListener('input', e => { const k = e.target.dataset.dm; if (!k) return; crit.find(c => c.k === k).w = +e.target.value; $('#dm-v-' + k, el).textContent = e.target.value; calc(); });
      calc();
    }
  };

  /* ---------- 7) ออกแบบถาดตามมาตราส่วน ---------- */
  defs['DT-M1-C06-M02'] = {
    title: 'ออกแบบถาดตามมาตราส่วน', sub: 'ปรับขนาดถาดให้พอดีโต๊ะ 20×15 ซม. และใส่ของครบ แล้วดูผลทดสอบทันที',
    mount(el) {
      const s = { W: 19, D: 12, t: 1, div: 2 }, K = 17;
      el.innerHTML = frame('ออกแบบถาดตามมาตราส่วน', 'ปรับขนาดถาดให้พอดีโต๊ะ 20×15 ซม. และใส่ของครบ แล้วดูผลทดสอบทันที',
        `<svg viewBox="0 0 720 340" id="tr-svg" role="img" aria-label="ภาพมองจากด้านบนของโต๊ะ 20x15 ซม. และถาดที่ออกแบบ"><defs><pattern id="tr-paper" width="17" height="17" patternUnits="userSpaceOnUse"><rect width="17" height="17" fill="#fffdf2"/><path d="M17 0H0V17" fill="none" stroke="#cfe3ee" stroke-width="1"/></pattern><linearGradient id="tr-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2ad6f"/><stop offset="1" stop-color="#b87d3e"/></linearGradient><filter id="tr-sh"><feDropShadow dx="3" dy="4" stdDeviation="3" flood-opacity=".35"/></filter></defs><rect width="720" height="340" rx="12" fill="#2c3e45"/><g id="tr-g" transform="translate(40 24)"></g></svg>`,
        `<label class="sim-rg">ความกว้างด้านนอก <b id="tr-wv">19</b> ซม.<input type="range" id="tr-w" min="10" max="24" step="1" value="19"></label><label class="sim-rg">ความลึกด้านนอก <b id="tr-dv">12</b> ซม.<input type="range" id="tr-d" min="6" max="17" step="1" value="12"></label><label class="sim-rg">ความหนาขอบ <b id="tr-tv">1</b> ซม.<input type="range" id="tr-t" min="0.5" max="2" step="0.5" value="1"></label><label class="sim-rg">จำนวนผนังกั้น <b id="tr-nv">2</b><input type="range" id="tr-n" min="0" max="4" step="1" value="2"></label><div class="sim-checks" id="tr-chk"></div>`,
        goal(el, 'fit', 'ถาดพอดีโต๊ะ 20×15 ซม.') + goal(el, 'ruler', 'ใส่ไม้บรรทัด 18 ซม. ได้') + goal(el, 'all', 'ใส่ของครบ 4 ชิ้นและผ่านทุกเกณฑ์'));
      const draw = () => {
        const g = el.querySelector('#tr-g'), inW = s.W - 2 * s.t, inD = s.D - 2 * s.t, wall = 0.4 * s.div, need = 2.4 + 3.6 + 2.2 + wall;
        const okDesk = s.W <= 20 && s.D <= 15, okRuler = inW >= 18, okSpace = inD >= need, okAll = okDesk && okRuler && okSpace;
        let h = `<rect width="${20 * K}" height="${15 * K}" fill="url(#tr-paper)" stroke="#fff" stroke-width="3" rx="4"/><text x="${10 * K}" y="-6" text-anchor="middle" font-size="13" fill="#a8f3d4" font-family="Kanit,sans-serif">โต๊ะ 20 × 15 ซม. (1 ซม. = ${K} px)</text>`;
        const x0 = (20 * K - s.W * K) / 2, y0 = (15 * K - s.D * K) / 2;
        h += `<g transform="translate(${x0} ${y0})" filter="url(#tr-sh)"><rect width="${s.W * K}" height="${s.D * K}" rx="6" fill="${okDesk ? 'url(#tr-wood)' : '#e07b7b'}" stroke="#3b2412" stroke-width="3"/><rect x="${s.t * K}" y="${s.t * K}" width="${inW * K}" height="${inD * K}" rx="3" fill="#2a1a0c" opacity=".55"/>`;
        const lanes = s.div + 1, lh = (inD - 0.4 * s.div) / lanes;
        for (let i = 1; i <= s.div; i++) h += `<rect x="${s.t * K}" y="${(s.t + i * lh + (i - 1) * 0.4) * K}" width="${inW * K}" height="${0.4 * K}" fill="#b87d3e" stroke="#3b2412"/>`;
        const lane = i => s.t + i * (lh + 0.4);
        const items = [{ n: 'ไม้บรรทัด 18 ซม.', w: 18, d: 2.4, c: '#fff3a8' }, { n: 'ดินสอ ×4', w: 17, d: 3.6, c: '#ffd23f', pencils: 1 }, { n: 'ยางลบ', w: 5, d: 2.2, c: '#ff9ccc' }];
        items.forEach((it, i) => { const ln = Math.min(i, lanes - 1), fits = it.w <= inW && it.d <= lh + (lanes - 1 - 0) * 0 + 0.01 + (lanes === 1 ? 0 : 0); const x = s.t * K + 4, y = lane(ln) * K + (ln === i ? 3 : 3 + (i - ln) * 0);
          const stackY = lanes < 3 && i >= lanes ? lane(ln) * K + 3 + (i - ln) * 0 : y; const over = it.w > inW;
          if (it.pencils) { for (let p = 0; p < 4; p++) h += `<rect x="${x}" y="${y + p * 0.9 * K}" width="${Math.min(it.w, inW) * K}" height="${0.8 * K}" rx="4" fill="${['#ffd23f', '#ff3d94', '#3aa0ff', '#26b8a0'][p]}" stroke="#0b1d1f" stroke-width="1.5" ${over ? 'opacity=".6"' : ''}/>`; }
          else h += `<rect x="${x}" y="${y}" width="${Math.min(it.w, inW + 3) * K}" height="${it.d * K}" rx="4" fill="${it.c}" stroke="${over ? '#ff3d54' : '#0b1d1f'}" stroke-width="${over ? 4 : 2}"/>`;
          if (!it.pencils) h += `<text x="${x + 6}" y="${y + it.d * K * 0.7}" font-size="11" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">${it.n}</text>`; });
        h += '</g>';
        // มิติ
        h += `<g stroke="#a8f3d4" stroke-width="1.5" fill="#a8f3d4" font-size="12" font-family="Kanit,sans-serif"><line x1="${x0}" y1="${y0 + s.D * K + 12}" x2="${x0 + s.W * K}" y2="${y0 + s.D * K + 12}"/><text x="${x0 + s.W * K / 2}" y="${y0 + s.D * K + 28}" text-anchor="middle" stroke="none">กว้าง ${s.W} ซม. (ด้านใน ${fmt(inW)})</text></g>`;
        g.innerHTML = h;
        const row = (ok, t) => `<div class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${t}</div>`;
        $('#tr-chk', el).innerHTML = row(okDesk, `ไม่เกินโต๊ะ 20×15 (ถาด ${s.W}×${s.D})`) + row(okRuler, `ไม้บรรทัด 18 ซม. ใส่ได้ (ช่องในกว้าง ${fmt(inW)} ซม.)`) + row(okSpace, `ความลึกด้านในพอ (ต้อง ≥ ${fmt(need)} ซม. มี ${fmt(inD)} ซม.)`) + `<div class="verdict ${okAll ? 'ok' : 'no'}">${okAll ? 'ผ่านเกณฑ์ออกแบบทั้งหมด!' : 'ยังไม่ผ่านบางเกณฑ์ ปรับขนาดต่อ'}</div>`;
        if (okDesk) tick(el, 'fit'); if (okRuler && okDesk) tick(el, 'ruler'); if (okAll) tick(el, 'all');
      };
      el.addEventListener('input', e => { const m = { 'tr-w': 'W', 'tr-d': 'D', 'tr-t': 't', 'tr-n': 'div' }[e.target.id]; if (!m) return; s[m] = +e.target.value; $('#' + e.target.id.replace('-', '-') .replace(/^tr-(.)$/, 'tr-$1v'), el).textContent = s[m]; tone(300 + s.W * 10, 40); draw(); });
      draw();
    }
  };

  /* ---------- 8) กรณีศึกษาเลือกกล่องเก็บความเย็น ---------- */
  defs['DT-M1-C07-M01'] = {
    title: 'กรณีศึกษา: เลือกภาชนะเก็บความเย็น', sub: 'ปรับเวลาภารกิจ แล้วดูว่าเกณฑ์บังคับเปลี่ยนคำตอบอย่างไร',
    mount(el) {
      const s = { h: 2, pick: 'B' };
      el.innerHTML = frame('กรณีศึกษา: เลือกภาชนะเก็บความเย็น', 'ปรับเวลาภารกิจ แล้วดูว่าเกณฑ์บังคับเปลี่ยนคำตอบอย่างไร',
        `<svg viewBox="0 0 720 320" id="cs-svg" role="img" aria-label="เส้นเวลาเปรียบเทียบภาชนะ A และ B"><defs><linearGradient id="cs-ice" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ee7ff"/><stop offset="1" stop-color="#3aa0ff"/></linearGradient><linearGradient id="cs-melt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb4b4"/><stop offset="1" stop-color="#ff6b6b"/></linearGradient></defs><rect width="720" height="320" rx="12" fill="#12303a"/><g id="cs-g"></g></svg>`,
        `<label class="sim-rg">เวลาภารกิจ <b id="cs-hv">2</b> ชั่วโมง<input type="range" id="cs-h" min="0.5" max="3.5" step="0.5" value="2"></label><div class="sim-btns"><button type="button" class="sim-b mat on" data-cs="A">เลือก A<small>เบา 0.5 กก. · เย็น 1 ชม.</small></button><button type="button" class="sim-b mat" data-cs="B">เลือก B<small>หนัก 1.8 กก. · เย็น 3 ชม.</small></button></div><div class="sim-read" id="cs-say"></div>`,
        goal(el, 'a', 'หาเวลาภารกิจที่ภาชนะ A ผ่านเกณฑ์') + goal(el, 'b', 'ตั้งภารกิจ 2 ชม. แล้วเลือก B ให้ผ่านเกณฑ์บังคับ') + goal(el, 'ctx', 'สรุปว่าคำตอบขึ้นกับเกณฑ์และเงื่อนไข ไม่ใช่ของใหม่หรือเบากว่า'));
      const C = { A: { n: 'A', cool: 1, kg: 0.5, c: '#ff9ccc' }, B: { n: 'B', cool: 3, kg: 1.8, c: '#26e6c8' } }; let oa = false, ob = false;
      const draw = () => {
        const X = h => 70 + h * 170, g = el.querySelector('#cs-g'); let svg = '';
        for (let i = 0; i <= 3; i++) svg += `<line x1="${X(i)}" y1="46" x2="${X(i)}" y2="260" stroke="#ffffff22"/><text x="${X(i)}" y="290" text-anchor="middle" font-size="14" fill="#cfe3ee" font-family="Kanit,sans-serif">${i} ชม.</text>`;
        svg += `<rect x="${X(0)}" y="30" width="${X(s.h) - X(0)}" height="20" rx="10" fill="#ffd23f" stroke="#0b1d1f" stroke-width="3"/><text x="${X(0) + 10}" y="45" font-size="14" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">ภารกิจ ${s.h} ชม.</text><line x1="${X(s.h)}" y1="46" x2="${X(s.h)}" y2="262" stroke="#ffd23f" stroke-width="3" stroke-dasharray="8 6"/>`;
        ['A', 'B'].forEach((k, i) => { const c = C[k], y = 84 + i * 84, chosen = s.pick === k, ok = c.cool >= s.h; svg += `<g opacity="${chosen ? 1 : .5}"><text x="14" y="${y + 24}" font-size="22" font-weight="900" fill="${c.c}" font-family="Chakra Petch,sans-serif">${k}</text><rect x="${X(0)}" y="${y}" width="${X(Math.min(c.cool, 3.5)) - X(0)}" height="34" rx="9" fill="url(#cs-ice)" stroke="#0b1d1f" stroke-width="3"/><text x="${X(0) + 10}" y="${y + 22}" font-size="14" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">เย็นอยู่ ${c.cool} ชม. · หนัก ${c.kg} กก.</text>${c.cool < s.h ? `<rect x="${X(c.cool)}" y="${y}" width="${X(s.h) - X(c.cool)}" height="34" rx="9" fill="url(#cs-melt)" stroke="#0b1d1f" stroke-width="3"/><text x="${X(c.cool) + 8}" y="${y + 22}" font-size="14" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">ละลายแล้ว!</text>` : ''}<text x="${X(0)}" y="${y + 54}" font-size="13" fill="${ok ? '#7dffb0' : '#ff9d9d'}" font-family="Kanit,sans-serif">${ok ? '✓ ผ่านเกณฑ์เวลา' : '✗ ไม่ผ่านเกณฑ์เวลา'}</text></g>`; });
        g.innerHTML = svg;
        const c = C[s.pick], ok = c.cool >= s.h; $('#cs-say', el).innerHTML = `<b>${ok ? 'เลือก ' + s.pick + ' ผ่านเกณฑ์บังคับ' : 'เลือก ' + s.pick + ' ไม่ผ่านเกณฑ์บังคับ'}</b><p>เกณฑ์บังคับคือ "ต้องเย็นตลอดภารกิจ ${s.h} ชม." ${ok ? `ภาชนะ ${s.pick} เย็นได้ ${c.cool} ชม. ${s.pick === 'B' ? 'แม้หนักกว่า (ยอมรับข้อแลกเปลี่ยน)' : 'และยังเบากว่า'}` : `ภาชนะ ${s.pick} เย็นได้แค่ ${c.cool} ชม. น้ำแข็งละลายก่อนจบภารกิจ จึงเลือกไม่ได้ แม้จะเบากว่า`}</p>`;
        if (s.pick === 'A' && ok) { oa = true; tick(el, 'a'); } if (s.pick === 'B' && s.h === 2 && ok) { ob = true; tick(el, 'b'); } if (oa && ob) tick(el, 'ctx');
        $$('[data-cs]', el).forEach(b => b.classList.toggle('on', b.dataset.cs === s.pick));
      };
      el.addEventListener('input', e => { if (e.target.id === 'cs-h') { s.h = +e.target.value; $('#cs-hv', el).textContent = s.h; draw(); } });
      el.addEventListener('click', e => { const b = e.target.closest('[data-cs]'); if (b) { s.pick = b.dataset.cs; tone(500, 60); draw(); } });
      draw();
    }
  };

  /* ---------- 9) ทดสอบหยิบของจับเวลา ---------- */
  defs['DT-M1-C07-M02'] = {
    title: 'ห้องทดสอบจับเวลา: หยิบของ 4 ชิ้นจากถาด', sub: 'ทดลอง 3 รอบด้วยเงื่อนไขเดียวกัน แล้วเทียบกับเกณฑ์ 15 วินาทีอย่างซื่อสัตย์',
    mount(el) {
      const s = { runs: [], busy: false, design: 'v1', ctl: { items: true, spot: true, person: true, timer: true } };
      const DES = { v1: { n: 'ถาดรุ่น 1 (ช่องคับ)', base: 17, drop: 0.35 }, v2: { n: 'ถาดรุ่น 2 (ปรับช่อง)', base: 14, drop: 0.12 } };
      el.innerHTML = frame('ห้องทดสอบจับเวลา: หยิบของ 4 ชิ้นจากถาด', 'ทดลอง 3 รอบด้วยเงื่อนไขเดียวกัน แล้วเทียบกับเกณฑ์ 15 วินาทีอย่างซื่อสัตย์',
        `<svg viewBox="0 0 720 320" id="ts-svg" role="img" aria-label="มือหยิบของจากถาดไปวางที่จุดหมาย พร้อมนาฬิกาจับเวลา"><defs><linearGradient id="ts-desk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset="1" stop-color="#b87d3e"/></linearGradient><filter id="ts-sh"><feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity=".35"/></filter></defs><rect width="720" height="320" rx="12" fill="url(#ts-desk)"/><g filter="url(#ts-sh)"><rect x="40" y="110" width="250" height="150" rx="14" fill="#8a5a2b" stroke="#3b2412" stroke-width="4"/><rect x="52" y="122" width="226" height="126" rx="8" fill="#2a1a0c" opacity=".6"/><g stroke="#8a5a2b" stroke-width="5"><line x1="134" y1="122" x2="134" y2="248"/><line x1="206" y1="122" x2="206" y2="248"/></g></g><rect x="450" y="150" width="210" height="92" rx="10" fill="#fff8dc" stroke="#0b1d1f" stroke-width="3" stroke-dasharray="9 7"/><text x="555" y="204" text-anchor="middle" font-size="18" font-weight="800" fill="#0b1d1f" font-family="Kanit,sans-serif">จุดวางของ</text>
        <g id="ts-items"></g><g id="ts-hand" transform="translate(360 60)" filter="url(#ts-sh)"><circle r="20" fill="#ffd2a8" stroke="#0b1d1f" stroke-width="3"/><path d="M-10 -4q10 -12 20 0" stroke="#0b1d1f" stroke-width="3" fill="none"/></g>
        <g transform="translate(560 24)"><rect width="140" height="64" rx="12" fill="#0d1f1a" stroke="#0b1d1f" stroke-width="3"/><text id="ts-clock" x="70" y="46" text-anchor="middle" font-size="38" font-weight="800" fill="#7dffb0" font-family="Chakra Petch,monospace">0.0</text><text x="70" y="16" text-anchor="middle" font-size="12" fill="#a8f3d4" font-family="Kanit,sans-serif">วินาที</text></g></svg>`,
        `<div class="sim-btns"><button type="button" class="sim-b mat on" data-ts-d="v1">รุ่น 1<small>ช่องคับ</small></button><button type="button" class="sim-b mat" data-ts-d="v2">รุ่น 2<small>ปรับช่อง</small></button></div><div class="sim-ctl"><b>ตัวควบคุม (ต้องคงไว้):</b>${[['items', 'ของ 4 ชิ้นเดิม'], ['spot', 'จุดวางเดิม'], ['person', 'ผู้ทดลองคนเดิม'], ['timer', 'วิธีจับเวลาเดียวกัน']].map(([k, t]) => `<label class="sim-sw"><input type="checkbox" data-ts-c="${k}" checked><span>${t}</span></label>`).join('')}</div><div class="sim-btns"><button type="button" class="sim-b big" data-ts="run">ทดลองรอบที่ 1</button><button type="button" class="sim-b" data-ts="reset">ล้างผล</button></div><table class="sim-tbl" id="ts-tbl"><thead><tr><th>รอบ</th><th>เวลา (วิ)</th><th>ของตก</th><th>ผล</th></tr></thead><tbody></tbody></table><div class="sim-read" id="ts-say"></div>`,
        goal(el, 'three', 'ทดลองครบ 3 รอบด้วยตัวควบคุมครบ') + goal(el, 'honest', 'ดูผลถาดรุ่น 1: ยังไม่ผ่าน แม้บางรอบดีขึ้น') + goal(el, 'pass', 'ทดลองรุ่น 2 และเทียบกับเกณฑ์ 15 วินาที'));
      const itemsG = el.querySelector('#ts-items'); const place = (n, inTray) => { const pos = inTray ? [[72, 150], [150, 150], [230, 160], [100, 200]][n] : [[470, 170], [520, 200], [575, 175], [620, 210]][n]; return pos; };
      const colors = ['#ffd23f', '#ff3d94', '#3aa0ff', '#26b8a0'], reset = () => { itemsG.innerHTML = [0, 1, 2, 3].map(i => { const [x, y] = place(i, true); return `<rect data-it="${i}" x="${x}" y="${y}" width="46" height="22" rx="6" fill="${colors[i]}" stroke="#0b1d1f" stroke-width="3"/>`; }).join(''); el.querySelector('#ts-hand').setAttribute('transform', 'translate(360 60)'); };
      const table = () => { const tb = $('#ts-tbl tbody', el); tb.innerHTML = s.runs.map((r, i) => `<tr class="${r.t <= 15 ? 'ok' : 'no'}"><td>${i + 1}</td><td>${fmt(r.t)}</td><td>${r.drop}</td><td>${r.t <= 15 ? 'ผ่าน' : 'ไม่ผ่าน'}</td></tr>`).join(''); $('[data-ts="run"]', el).textContent = s.runs.length >= 3 ? 'ครบ 3 รอบแล้ว' : 'ทดลองรอบที่ ' + (s.runs.length + 1); };
      const say = () => {
        const bad = Object.values(s.ctl).some(v => !v), n = s.runs.length, mean = n ? s.runs.reduce((a, r) => a + r.t, 0) / n : 0;
        if (!n) { $('#ts-say', el).innerHTML = '<b>พร้อมทดลอง</b><p>เลือกรุ่นถาดและคงตัวควบคุมไว้ แล้วกดทดลอง</p>'; return; }
        const pass = s.runs.filter(r => r.t <= 15).length;
        $('#ts-say', el).innerHTML = `<b>${bad ? 'ผลเทียบกันไม่ได้ เพราะไม่ได้คงตัวควบคุม' : n < 3 ? 'ทดลองต่อให้ครบ 3 รอบ' : 'สรุปผลอย่างซื่อสัตย์'}</b><p>เฉลี่ย ${fmt(mean)} วินาที · ผ่านเกณฑ์ ${pass}/${n} รอบ${n >= 3 ? (pass === n ? ' › ผ่านเกณฑ์ทุกรอบ ควรบันทึกผลทุกรอบ' : pass === 0 ? ' › ยังไม่ผ่านทั้งหมด ต้องปรับแบบแล้วทดลองใหม่ (ห้ามเลือกรอบที่ดีที่สุดมาอ้าง)' : ' › ผลยังไม่คงที่ ต้องทดลองเพิ่ม ห้ามอ้างว่าผ่านเพราะรอบเดียว') : ''}</p>`;
      };
      const run = async () => {
        if (s.busy || s.runs.length >= 3) return; s.busy = true; const d = DES[s.design], bad = Object.values(s.ctl).some(v => !v), t = clamp(d.base + rnd(-1.6, 1.6) * (bad ? 3 : 1), 6, 40), drops = Math.random() < d.drop * (bad ? 2 : 1) ? 1 : 0; reset(); tone(600, 120);
        const hand = el.querySelector('#ts-hand'), clock = el.querySelector('#ts-clock'), t0 = performance.now(), dur = 3200;
        await new Promise(res => { const f = now => { const p = Math.max(0, Math.min(1, (now - t0) / dur)), sec = p * t, a = Math.min(3, Math.floor(p * 4)), q = p >= 1 ? 1 : (p * 4) % 1; clock.textContent = fmt(sec);
          const [sx, sy] = place(a, true), [ex, ey] = place(a, false), hx = q < .5 ? 360 + (sx + 23 - 360) * (q / .5) : sx + 23 + (ex + 23 - sx - 23) * ((q - .5) / .5), hy = q < .5 ? 60 + (sy + 11 - 60) * (q / .5) : sy + 11 + (ey + 11 - sy - 11) * ((q - .5) / .5);
          hand.setAttribute('transform', `translate(${hx} ${hy})`); const it = itemsG.querySelector(`[data-it="${a}"]`); if (it && q >= .5) { it.setAttribute('x', hx - 23); it.setAttribute('y', hy - 11); } for (let k = 0; k < a; k++) { const [x, y] = place(k, false); const o = itemsG.querySelector(`[data-it="${k}"]`); o.setAttribute('x', x); o.setAttribute('y', y); }
          if (p < 1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
        clock.textContent = fmt(t); [0, 1, 2, 3].forEach(i => { const [x, y] = place(i, false); const o = itemsG.querySelector(`[data-it="${i}"]`); o.setAttribute('x', x); o.setAttribute('y', y); });
        s.runs.push({ t, drop: drops }); s.busy = false; table(); say();
        if (s.runs.length >= 3 && !bad) { tick(el, 'three'); if (s.design === 'v1' && s.runs.filter(r => r.t <= 15).length < 3) tick(el, 'honest'); if (s.design === 'v2') tick(el, 'pass'); }
        if (s.runs.length >= 3 && s.design === 'v1') tick(el, 'honest') && 0;
      };
      el.addEventListener('click', e => {
        const d = e.target.closest('[data-ts-d]'); if (d) { s.design = d.dataset.tsD; s.runs = []; $$('[data-ts-d]', el).forEach(b => b.classList.toggle('on', b === d)); reset(); table(); say(); return; }
        const b = e.target.closest('[data-ts]'); if (!b) return; if (b.dataset.ts === 'run') run(); else { s.runs = []; reset(); table(); say(); }
      });
      el.addEventListener('change', e => { const c = e.target.dataset.tsC; if (c) { s.ctl[c] = e.target.checked; say(); } });
      reset(); table(); say();
    }
  };

  /* ---------- 10) เทียบสองรุ่น รายงานครบทุกเกณฑ์ ---------- */
  defs['DT-M1-C07-M03'] = {
    title: 'เทียบสองรุ่น: รายงานให้ครบทุกเกณฑ์', sub: 'ปรับแบบรุ่นใหม่ ดูเวลาและพื้นที่เทียบเกณฑ์ และลองสลับ "แสดงเฉพาะค่าที่ดีขึ้น" เพื่อเห็นว่าทำไมไม่ควรทำ',
    mount(el) {
      const s = { W: 22, n: 4, only: false };
      el.innerHTML = frame('เทียบสองรุ่น: รายงานให้ครบทุกเกณฑ์', 'ปรับแบบรุ่นใหม่ ดูเวลาและพื้นที่เทียบเกณฑ์ และลองสลับ "แสดงเฉพาะค่าที่ดีขึ้น" เพื่อเห็นว่าทำไมไม่ควรทำ',
        `<svg viewBox="0 0 720 330" id="rv-svg" role="img" aria-label="แผนภูมิแท่งเทียบรุ่น 1 กับรุ่นใหม่ ด้านเวลาและความกว้าง"><rect width="720" height="330" rx="12" fill="#12303a"/><g id="rv-g"></g></svg>`,
        `<label class="sim-rg">ความกว้างรุ่นใหม่ <b id="rv-wv">22</b> ซม. (ความลึก 12 ซม.)<input type="range" id="rv-w" min="18" max="24" step="1" value="22"></label><label class="sim-rg">จำนวนช่อง <b id="rv-nv">4</b><input type="range" id="rv-n" min="2" max="6" step="1" value="4"></label><label class="sim-sw"><input type="checkbox" id="rv-only"><span>แสดงเฉพาะค่าที่ดีขึ้น (ห้ามทำในรายงานจริง)</span></label><div class="sim-read" id="rv-say"></div>`,
        goal(el, 'time', 'ทำให้เวลารุ่นใหม่ผ่านเกณฑ์ 15 วินาที') + goal(el, 'both', 'ทำให้ผ่านทั้งเวลาและขนาด (กว้างไม่เกิน 20 ซม.)') + goal(el, 'hide', 'เปิด "แสดงเฉพาะค่าที่ดีขึ้น" แล้วสังเกตว่ามีอะไรถูกซ่อน'));
      const calc = () => { const t = 20 - 2.2 * (s.n - 2) - 0.8 * (s.W - 18); return { t: clamp(t, 5, 30), W: s.W }; };
      const draw = () => {
        const r = calc(), g = el.querySelector('#rv-g'), bar = (x, v, max, c, lab, ok) => { const h = clamp(v / max * 190, 4, 200); return `<g><rect x="${x}" y="${250 - h}" width="64" height="${h}" rx="8" fill="${c}" stroke="#0b1d1f" stroke-width="3" opacity="${ok === false ? .9 : 1}"/><text x="${x + 32}" y="${244 - h}" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="Chakra Petch,sans-serif">${lab}</text></g>`; };
        let h = `<text x="170" y="34" text-anchor="middle" font-size="18" font-weight="800" fill="#ffd23f" font-family="Kanit,sans-serif">เวลาหยิบของ (วินาที)</text><line x1="40" y1="${250 - 15 / 25 * 190}" x2="310" y2="${250 - 15 / 25 * 190}" stroke="#7dffb0" stroke-width="3" stroke-dasharray="8 6"/><text x="312" y="${254 - 15 / 25 * 190}" font-size="13" fill="#7dffb0" font-family="Kanit,sans-serif">เกณฑ์ ≤ 15</text>`;
        h += bar(70, 20, 25, '#ff9ccc', '20', false) + bar(180, r.t, 25, r.t <= 15 ? '#26e6c8' : '#ffb400', fmt(r.t), r.t <= 15);
        h += `<text x="102" y="276" text-anchor="middle" font-size="14" fill="#cfe3ee" font-family="Kanit,sans-serif">รุ่น 1</text><text x="212" y="276" text-anchor="middle" font-size="14" fill="#cfe3ee" font-family="Kanit,sans-serif">รุ่นใหม่</text>`;
        if (!s.only) { const ly = 250 - 20 / 26 * 190; h += `<text x="520" y="34" text-anchor="middle" font-size="18" font-weight="800" fill="#ffd23f" font-family="Kanit,sans-serif">ความกว้างถาด (ซม.)</text><line x1="400" y1="${ly}" x2="690" y2="${ly}" stroke="#7dffb0" stroke-width="3" stroke-dasharray="8 6"/><text x="690" y="${ly - 6}" font-size="13" fill="#7dffb0" text-anchor="end" font-family="Kanit,sans-serif">เกณฑ์ ≤ 20 (พื้นที่โต๊ะ 20×15)</text>`; h += bar(430, 18, 26, '#ff9ccc', '18', true) + bar(540, r.W, 26, r.W <= 20 ? '#26e6c8' : '#ff4d4d', String(r.W), r.W <= 20); h += `<text x="462" y="276" text-anchor="middle" font-size="14" fill="#cfe3ee" font-family="Kanit,sans-serif">รุ่น 1</text><text x="572" y="276" text-anchor="middle" font-size="14" fill="#cfe3ee" font-family="Kanit,sans-serif">รุ่นใหม่</text>`; }
        else h += `<g><rect x="400" y="70" width="290" height="190" rx="14" fill="#ffffff10" stroke="#ff9d9d" stroke-width="3" stroke-dasharray="9 7"/><text x="545" y="150" text-anchor="middle" font-size="22" font-weight="800" fill="#ff9d9d" font-family="Kanit,sans-serif">ข้อมูลด้านพื้นที่</text><text x="545" y="182" text-anchor="middle" font-size="22" font-weight="800" fill="#ff9d9d" font-family="Kanit,sans-serif">ถูกซ่อนไว้!</text></g>`;
        g.innerHTML = h;
        const okT = r.t <= 15, okA = r.W <= 20;
        $('#rv-say', el).innerHTML = s.only ? `<b>คำเตือน: นี่คือการเลือกแสดงเฉพาะที่ดี</b><p>รายงานนี้โชว์ว่าเวลาดีขึ้น แต่ซ่อนว่าความกว้าง ${okA ? 'ยังผ่านเกณฑ์' : '<b>เกินโต๊ะ 20 ซม.</b>'} ผู้อ่านจะเข้าใจผิด รายงานที่ซื่อสัตย์ต้องแสดงทุกเกณฑ์</p>` : `<b>${okT && okA ? 'ผ่านทั้งเวลาและขนาด' : okT ? 'เวลาผ่าน แต่กว้างเกินโต๊ะ' : okA ? 'ขนาดผ่าน แต่เวลายังไม่ถึงเกณฑ์' : 'ยังไม่ผ่านทั้งสองเกณฑ์'}</b><p>เวลา ${fmt(r.t)} วินาที (${okT ? 'ผ่าน' : 'ไม่ผ่าน'}) · ความกว้าง ${r.W} ซม. (${okA ? 'ผ่าน' : 'เกิน 20 ซม.'}) ${okT && okA ? '' : '<br>ข้อแลกเปลี่ยน: ขยายกว้างทำให้เร็วขึ้น แต่เกินพื้นที่ ลองเพิ่มจำนวนช่องแทนการขยายถาด'}</p>`;
        if (okT) tick(el, 'time'); if (okT && okA) tick(el, 'both'); if (s.only && !okA) tick(el, 'hide');
      };
      el.addEventListener('input', e => { if (e.target.id === 'rv-w') { s.W = +e.target.value; $('#rv-wv', el).textContent = s.W; } if (e.target.id === 'rv-n') { s.n = +e.target.value; $('#rv-nv', el).textContent = s.n; } if (e.target.id === 'rv-only') s.only = e.target.checked; tone(380 + s.n * 30, 40); draw(); });
      draw();
    }
  };

  /* วิชาอื่นแทนห้องจำลองทั้งหมดด้วย window.DT_SIM_DEFS(defs, helpers) ได้ (ไม่ต้องแก้ไฟล์นี้) */
  if (window.DT_SIM_DEFS) { Object.keys(defs).forEach(k => delete defs[k]); window.DT_SIM_DEFS(defs, { NS, esc, $, $$, clamp, rnd, fmt, tone, every, mark, goal, sw, setSw, pill, tick, frame }); }

  /* ---------- ตัวแทรกห้องจำลองเข้าบทเรียน ---------- */
  function inject(root) {
    $$('article.lesson', root).forEach(a => {
      if (a.dataset.sims || (a.dataset.page && a.dataset.page !== 'sim')) return; a.dataset.sims = '1';
      const keys = Object.keys(defs).filter(k => k.split('#')[0] === a.id); if (!keys.length) return;
      const anchor = $('.sim-slot', a) || $$('.steps', a).pop() || $('p.intro', a); if (!anchor) return;
      let last = anchor;
      keys.forEach(k => { const sec = document.createElement('section'); sec.className = 'sim'; sec.dataset.sim = k; sec.setAttribute('aria-label', defs[k].title); last.after(sec); last = sec; observe(sec, defs[k]); });
    });
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && !en.target.dataset.mounted) { en.target.dataset.mounted = '1'; en.target._def.mount(en.target); io.unobserve(en.target); } }), { rootMargin: '200px' }) : null;
  function observe(sec, def) { sec._def = def; sec.innerHTML = `<div class="sim-head"><span class="sim-chip">🔬 ห้องจำลอง</span><h3>${esc(def.title)}</h3><p>${esc(def.sub)}</p></div><div class="sim-load">เลื่อนมาถึงตรงนี้แล้วห้องจำลองจะเปิดเอง…</div>`; if (io) io.observe(sec); else { sec.dataset.mounted = '1'; def.mount(sec); } }
  const main = document.getElementById('main');
  if (main) { new MutationObserver(() => inject(main)).observe(main, { childList: true, subtree: true }); inject(main); }
  window.DTSims = { defs, done: () => [...done] };
})();
