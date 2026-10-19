/* ห้องจำลอง ม.3 · 11 หัวข้อ (หัวข้อละ 1 ห้อง) แทรกในหน้าเรียนรู้ของแต่ละหัวข้ออัตโนมัติ
   sims.js (ไฟล์ส่วนกลาง) เรียก window.DT_SIM_DEFS(defs, helpers) แล้วใช้ห้องจำลองชุดนี้แทนของ ม.1
   สถานการณ์อ้างอิงหนังสือเรียน สสวท. ม.3 (5G รถยนต์ไฟฟ้า ร้านข้าวมันไก่ป้าหมอน เกม Lean chicken รถพลังงานแสงอาทิตย์ของนนท์)
   และบ้านสวนลุงชัย · ตัวเลขทั้งหมดเป็นข้อมูลสมมติหรือค่าประมาณเพื่อการเรียน */
window.DT_SIM_DEFS = function (defs, h) {
  const { esc, $, $$, fmt, tone, goal, tick, frame, every } = h;
  const T = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-size="${Math.max(13, o.s || 14)}" font-weight="${o.w || 700}" fill="${o.c || '#fff3dc'}" text-anchor="${o.a || 'start'}" font-family="Kanit,sans-serif">${esc(t)}</text>`;
  const row = (ok, t) => `<div class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${t}</div>`;
  const btns = (attr, list, cur) => `<div class="sim-btns">${list.map((x, i) => `<button type="button" class="sim-b${cur === i || (Array.isArray(cur) && cur.includes(i)) ? ' on' : ''}" ${attr}="${i}">${esc(x)}</button>`).join('')}</div>`;
  const BG = '#2b1608', SAND = '#4a2610', GOLD = '#ffc53d', ORG = '#ff7a1a', RED = '#ff4d3d', OKC = '#4ade80', INK = '#2b1608';
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

  /* ---------- บท 1 เทคโนโลยีเปลี่ยนโลก ---------- */
  defs['DT-M3-C01-M01'] = {
    title: 'เครือข่ายแต่ละยุคกับรถยนต์ไร้คนขับ', sub: 'เลือกเครือข่ายทีละยุค แล้วกด "คนข้ามถนน" ดูว่ารถรู้ตัวและเริ่มเบรกได้ทันหรือไม่ (ค่าความหน่วงเป็นค่าประมาณ)',
    mount(el) {
      const G = [{ n: '1G', lat: null, can: 'ส่งได้เฉพาะเสียง (แอนะล็อก)' }, { n: '2G', lat: 500, can: 'ส่งข้อความสั้น (ดิจิทัล)' }, { n: '3G', lat: 100, can: 'ใช้อินเทอร์เน็ตได้' }, { n: '4G', lat: 50, can: 'ดูวิดีโอได้ลื่น' }, { n: '5G', lat: 5, can: 'ความหน่วงต่ำ เชื่อมต่ออุปกรณ์จำนวนมาก' }];
      const s = { g: 3, tried: new Set([3]), run: 0, x: 0, stopAt: null };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 260" id="g5-svg" role="img" aria-label="ถนน รถ และทางม้าลาย"></svg>`,
        `<p><b>เลือกเครือข่าย</b></p><div id="g5-b"></div><div class="sim-read" id="g5-r"></div><div class="sim-btns"><button type="button" class="sim-b" data-g5go="1">🚶 คนข้ามถนน</button></div><div class="sim-checks" id="g5-k"></div>`,
        goal(el, 'cmp', 'ลองเครือข่ายอย่างน้อย 3 ยุค') + goal(el, 'voice', 'หายุคที่ส่งข้อมูลให้รถไม่ได้เลย') + goal(el, 'brake', 'หายุคที่รถวิ่งก่อนรู้ตัวไม่เกิน 0.2 เมตร'));
      const draw = () => {
        const g = G[s.g], dist = g.lat == null ? null : 20 * g.lat / 1000;
        let v = `<rect width="680" height="260" rx="14" fill="${BG}"/><rect x="0" y="120" width="680" height="90" fill="#5b3a22"/>`;
        for (let i = 0; i < 12; i++) v += `<rect x="${i * 60 + 10}" y="162" width="34" height="6" fill="${GOLD}" opacity=".7"/>`;
        for (let i = 0; i < 6; i++) v += `<rect x="540" y="${124 + i * 15}" width="40" height="9" fill="#fff" opacity=".85"/>`;
        v += `<g transform="translate(${60 + s.x},140)"><rect width="110" height="44" rx="12" fill="${ORG}" stroke="#fff" stroke-width="3"/><rect x="62" y="6" width="38" height="18" rx="5" fill="#ffe7b0"/><circle cx="24" cy="46" r="10" fill="#111"/><circle cx="88" cy="46" r="10" fill="#111"/>${T(30, 30, 'AUTO', { s: 12, c: INK, w: 800 })}</g>`;
        if (s.run) v += `<g transform="translate(570,96)"><circle r="10" fill="#ffe7b0"/><rect x="-6" y="10" width="12" height="26" fill="${GOLD}"/></g>`;
        v += `<rect x="560" y="18" width="104" height="54" rx="10" fill="#3d2010" stroke="${GOLD}"/>${T(612, 42, g.n, { a: 'middle', s: 22, c: GOLD, w: 800 })}${T(612, 62, g.lat == null ? 'ไม่มีข้อมูล' : g.lat + ' มิลลิวินาที', { a: 'middle', s: 11 })}`;
        if (s.stopAt != null) v += T(20, 40, s.stopAt, { s: 16, c: s.ok ? OKC : RED, w: 800 });
        v += T(20, 240, dist == null ? 'ยุคนี้ส่งข้อมูลให้รถไม่ได้' : `ระยะวิ่งก่อนรู้ตัว = 20 ม./วินาที × ${g.lat / 1000} วินาที = ${fmt(dist, 2)} เมตร`, { s: 13 });
        $('#g5-svg', el).innerHTML = v;
        $('#g5-b', el).innerHTML = btns('data-g5', G.map(x => x.n), s.g);
        $('#g5-r', el).innerHTML = `<b>${g.n}</b><p>${esc(g.can)}</p>`;
        $('#g5-k', el).innerHTML = row(s.tried.size >= 3, `ลองแล้ว ${s.tried.size} ยุค`) + row(dist != null && dist <= 0.2, 'ความหน่วงต่ำพอสำหรับรถยนต์ไร้คนขับ');
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-g5]'), go = e.target.closest('[data-g5go]');
        if (b) { s.g = +b.dataset.g5; s.tried.add(s.g); s.run = 0; s.x = 0; s.stopAt = null; tone(520, 40); if (s.tried.size >= 3) tick(el, 'cmp'); draw(); }
        if (go) {
          const g = G[s.g]; s.run = 1; s.x = 0;
          if (g.lat == null) { s.ok = false; s.stopAt = 'รถไม่ได้รับข้อมูล! ยุคนี้ส่งได้แค่เสียง'; tick(el, 'voice'); }
          else { const d = 20 * g.lat / 1000; s.x = Math.min(300, Math.round(d * 120)); s.ok = d <= 0.2; s.stopAt = s.ok ? `เบรกทัน · วิ่งไปก่อนรู้ตัว ${fmt(d, 2)} เมตร` : `ช้าไป · วิ่งไปก่อนรู้ตัว ${fmt(d, 2)} เมตร`; if (s.ok) tick(el, 'brake'); }
          tone(s.ok ? 760 : 220, 120); draw();
        }
      });
      draw();
    }
  };

  defs['DT-M3-C01-M02'] = {
    title: 'วางแผนส่งมะม่วงด้วยรถกระบะไฟฟ้า', sub: 'แตะส่วนประกอบของรถตามเส้นทางพลังงาน แล้วเลือกจุดส่งของและจุดชาร์จ ให้กลับถึงสวนโดยเหลือแบตเตอรี่สำรอง',
    mount(el) {
      const PARTS = ['แบตเตอรี่', 'ตัวควบคุม', 'มอเตอร์', 'เพลาและล้อ'], STOPS = [{ n: 'ตลาด', km: 40 }, { n: 'ร้าน B', km: 10 }, { n: 'ร้าน C', km: 15 }];
      const s = { path: [], stops: [true, false, false], charge: 0, ac: true };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 280" id="ev-svg" role="img" aria-label="รถไฟฟ้าและแบตเตอรี่"></svg>`,
        `<p><b>1. แตะเส้นทางพลังงานตามลำดับ</b></p><div id="ev-p"></div><p><b>2. จุดส่งของ (ต้องส่งครบ 3 จุด)</b></p><div id="ev-s"></div><p><b>3. ชาร์จที่ตลาด</b></p><div id="ev-c"></div><div id="ev-a"></div><div class="sim-checks" id="ev-k"></div>`,
        goal(el, 'path', 'เรียงเส้นทางพลังงานจากแบตเตอรี่ถึงล้อได้ถูก') + goal(el, 'all', 'ส่งของครบ 3 จุดแล้วกลับถึงสวน') + goal(el, 'res', 'กลับถึงสวนโดยเหลือระยะสำรองอย่างน้อย 10 กม.'));
      const calc = () => { const need = STOPS.reduce((a, x, i) => a + (s.stops[i] ? x.km : 0), 0), range = 60 * (s.ac ? 0.9 : 1) + [0, 10, 20][s.charge]; return { need, range, left: range - need }; };
      const draw = () => {
        const c = calc(), all = s.stops.every(Boolean), pct = Math.max(0, Math.min(1, c.left / (60 + 20)));
        let v = `<rect width="680" height="280" rx="14" fill="${BG}"/>`;
        PARTS.forEach((p, i) => { const on = s.path[i] === i; v += `<rect x="${24 + i * 160}" y="24" width="130" height="56" rx="10" fill="${on ? GOLD : SAND}" stroke="#fff" stroke-width="2"/>${T(89 + i * 160, 58, p, { a: 'middle', c: on ? INK : '#fff3dc' })}`; if (i < 3) v += `<path d="M${156 + i * 160} 52 L${182 + i * 160} 52" stroke="${s.path.length > i + 1 ? GOLD : '#7a5a40'}" stroke-width="5"/>`; });
        v += `<rect x="24" y="110" width="632" height="10" rx="5" fill="#5b3a22"/>`;
        let x = 24; STOPS.forEach((st, i) => { if (!s.stops[i]) return; const w = st.km * 6.3; v += `<rect x="${x}" y="110" width="${w}" height="10" fill="${ORG}"/>${T(x + w / 2, 142, st.n + ' ' + st.km + ' กม.', { a: 'middle', s: 12 })}`; x += w; });
        v += `<rect x="24" y="170" width="300" height="70" rx="12" fill="none" stroke="#fff" stroke-width="3"/><rect x="324" y="192" width="12" height="26" fill="#fff"/><rect x="30" y="176" width="${Math.round(288 * pct)}" height="58" rx="8" fill="${c.left >= 10 ? OKC : c.left >= 0 ? GOLD : RED}"/>`;
        v += T(360, 196, `ระยะที่วิ่งได้ ${c.range} กม.`, { s: 15 }) + T(360, 222, `ระยะที่ต้องใช้ ${c.need} กม.`, { s: 15 }) + T(360, 248, c.left >= 0 ? `เหลือสำรอง ${c.left} กม.` : `ขาด ${-c.left} กม. ไฟหมดกลางทาง!`, { s: 15, c: c.left >= 10 ? OKC : c.left >= 0 ? GOLD : RED });
        $('#ev-svg', el).innerHTML = v;
        $('#ev-p', el).innerHTML = btns('data-evp', PARTS, s.path.filter((p, i) => p === i));
        $('#ev-s', el).innerHTML = btns('data-evs', STOPS.map(x => x.n + ' +' + x.km + ' กม.'), s.stops.map((b, i) => b ? i : -1).filter(i => i >= 0));
        $('#ev-c', el).innerHTML = btns('data-evc', ['ไม่ชาร์จ', '15 นาที +10 กม.', '30 นาที +20 กม.'], s.charge);
        $('#ev-a', el).innerHTML = btns('data-eva', ['เปิดแอร์ (ระยะลด 10%)', 'ปิดแอร์ เปิดหน้าต่าง'], s.ac ? 0 : 1);
        $('#ev-k', el).innerHTML = row(all, 'ส่งครบทุกจุด') + row(c.left >= 0, 'แบตเตอรี่พอกลับถึงสวน') + row(c.left >= 10, 'มีระยะสำรองอย่างน้อย 10 กม.');
        if (s.path.length === 4 && s.path.every((p, i) => p === i)) tick(el, 'path');
        if (all && c.left >= 0) tick(el, 'all'); if (all && c.left >= 10) tick(el, 'res');
      };
      el.addEventListener('click', e => {
        const p = e.target.closest('[data-evp]'), st = e.target.closest('[data-evs]'), ch = e.target.closest('[data-evc]'), ac = e.target.closest('[data-eva]');
        if (p) { const k = +p.dataset.evp; if (k === s.path.length) { s.path.push(k); tone(660, 50); } else { s.path = []; tone(200, 90); } }
        if (st) { const k = +st.dataset.evs; s.stops[k] = !s.stops[k]; tone(520, 40); }
        if (ch) { s.charge = +ch.dataset.evc; tone(560, 40); }
        if (ac) { s.ac = +ac.dataset.eva === 0; tone(560, 40); }
        if (p || st || ch || ac) draw();
      });
      draw();
    }
  };

  defs['DT-M3-C01-M03'] = {
    title: 'ไทม์ไลน์รถส่งมะม่วง', sub: 'แตะร้านตามลำดับที่จะไปส่ง ระบบจะวาดไทม์ไลน์ทั้งเวลาวิ่งและเวลาขนลงหรือรอคิว ให้ทุกร้านได้ของก่อนเวลาที่ต้องการ (ออกจากสวน 07:00 น.)',
    mount(el) {
      const SH = { B: { n: 'ร้าน B', un: 10, dl: 70 }, C: { n: 'ร้าน C', un: 10, dl: 45 }, D: { n: 'ร้าน D', un: 15, dl: 110 } };
      const DR = { GB: 20, GC: 30, GD: 15, BC: 15, BD: 25, CD: 20 }, dr = (a, b) => DR[a + b] || DR[b + a];
      const s = { seq: [], tries: 0 };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 300" id="lg-svg" role="img" aria-label="ไทม์ไลน์การส่งของ"></svg>`,
        `<div class="sim-read"><b>ร้านต้องการของก่อน</b><p>ร้าน C 07:45 น. · ร้าน B 08:10 น. · ร้าน D 08:50 น.</p></div><div id="lg-b"></div><div class="sim-btns"><button type="button" class="sim-b" data-lgr="1">↺ เริ่มเส้นทางใหม่</button></div><div class="sim-checks" id="lg-k"></div>`,
        goal(el, 'all', 'จัดเส้นทางส่งครบทั้ง 3 ร้าน') + goal(el, 'time', 'ทุกร้านได้ของก่อนเวลาที่ต้องการ') + goal(el, 'try', 'ลองเส้นทางอย่างน้อย 2 แบบก่อนตัดสินใจ'));
      const plan = () => { let t = 0, cur = 'G'; return s.seq.map(k => { const d = dr(cur, k), a = t + d, f = a + SH[k].un; t = f; cur = k; return { k, d0: a - d, a, f, ok: f <= SH[k].dl }; }); };
      const draw = () => {
        const P = plan(), sc = 3.6; let v = `<rect width="680" height="300" rx="14" fill="${BG}"/>`;
        for (let m = 0; m <= 120; m += 15) v += `<line x1="${40 + m * sc * 1.25}" y1="40" x2="${40 + m * sc * 1.25}" y2="240" stroke="#5b3a22"/>${T(40 + m * sc * 1.25, 262, hm(420 + m), { a: 'middle', s: 11 })}`;
        P.forEach((p, i) => { const y = 60 + i * 60, x0 = 40 + p.d0 * 4.5, x1 = 40 + p.a * 4.5, x2 = 40 + p.f * 4.5, dl = 40 + SH[p.k].dl * 4.5;
          v += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="26" rx="5" fill="${ORG}"/><rect x="${x1}" y="${y}" width="${x2 - x1}" height="26" rx="5" fill="${GOLD}"/><line x1="${dl}" y1="${y - 8}" x2="${dl}" y2="${y + 34}" stroke="${RED}" stroke-width="3" stroke-dasharray="5 4"/>`;
          v += T(x0 - 4, y + 18, SH[p.k].n, { a: 'end', s: 12 }) + T(x2 + 6, y + 18, `${hm(420 + p.f)} ${p.ok ? '✓' : '✗ ช้า'}`, { s: 12, c: p.ok ? OKC : RED }); });
        v += T(40, 30, 'สีส้ม = วิ่งรถ · สีทอง = ขนลงและรอคิว · เส้นแดง = เวลาที่ร้านต้องการ', { s: 12 });
        $('#lg-svg', el).innerHTML = v;
        $('#lg-b', el).innerHTML = btns('data-lg', Object.keys(SH).map(k => (s.seq.includes(k) ? (s.seq.indexOf(k) + 1) + '. ' : '') + SH[k].n), Object.keys(SH).map((k, i) => s.seq.includes(k) ? i : -1));
        const done = P.length === 3, good = done && P.every(p => p.ok);
        $('#lg-k', el).innerHTML = row(done, 'จัดครบ 3 ร้าน') + row(good, 'ทุกร้านทันเวลา') + row(s.tries >= 2, `ลองแล้ว ${s.tries} เส้นทาง`);
        if (done) tick(el, 'all'); if (good) tick(el, 'time'); if (s.tries >= 2) tick(el, 'try');
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-lg]'), r = e.target.closest('[data-lgr]');
        if (b) { const k = Object.keys(SH)[+b.dataset.lg]; if (!s.seq.includes(k) && s.seq.length < 3) { s.seq.push(k); if (s.seq.length === 3) s.tries++; tone(560, 40); draw(); } }
        if (r) { s.seq = []; tone(300, 60); draw(); }
      });
      draw();
    }
  };

  /* ---------- บท 2 เทคโนโลยีแก้ปัญหา ---------- */
  defs['DT-M3-C02-M01'] = {
    title: 'สัมภาษณ์ลุงชัยแล้วเติม 5W1H', sub: 'แตะคำถามที่จะถาม คำถามปลายเปิดจะได้ข้อมูลจริงไปเติมตาราง 5W1H ส่วนคำถามชี้นำจะได้คำตอบที่ไม่น่าเชื่อถือ',
    mount(el) {
      const Q = [
        { q: 'ช่วยเล่าขั้นตอนตั้งแต่เก็บมะม่วงจนส่งถึงร้านหน่อยครับ', a: 'เก็บตอนเช้า วางในตะกร้า แล้วขับรถไปตลาด', w: 'Where' },
        { q: 'ขั้นไหนที่ลำบากที่สุด เพราะอะไร', a: 'ถึงตลาดแล้วมีลูกช้ำ ประมาณ 10 ลูกจาก 100 ลูก', w: 'What' },
        { q: 'ใครได้รับผลกระทบจากลูกช้ำบ้าง', a: 'ลุงเองขายได้น้อยลง และร้านที่รับซื้อก็ต้องคัดทิ้ง', w: 'Who' },
        { q: 'ลูกช้ำเกิดขึ้นช่วงเวลาใดบ่อยที่สุด', a: 'วันที่ส่งเยอะ ๆ ช่วงเช้าที่ต้องรีบ', w: 'When' },
        { q: 'ลุงคิดว่าลูกช้ำเกิดจากอะไร', a: 'น่าจะเพราะวางซ้อนกันหลายชั้น ลูกล่างโดนทับ', w: 'Why' },
        { q: 'ถ้าแก้ได้ ลุงอยากให้เป็นอย่างไร', a: 'อยากให้ช้ำไม่เกิน 3 ลูกจาก 100 ลูก และบรรจุได้เร็วเหมือนเดิม', w: 'How' },
        { q: 'ลุงลำบากเรื่องขนส่งใช่ไหม', a: '"ก็...ใช่มั้ง" (คำตอบถูกชี้นำ ใช้เป็นหลักฐานไม่ได้)', lead: 1 },
        { q: 'ถ้ามีกล่องแบบใหม่ ลุงจะซื้อใช่ไหม', a: '"ถ้าไม่แพงก็ซื้อ" (ยังไม่รู้ปัญหาจริงแต่เสนอของแล้ว)', lead: 1 }];
      const order = [6, 1, 3, 7, 0, 4, 2, 5], W = ['What', 'Who', 'Where', 'When', 'Why', 'How'];
      const s = { asked: [], lead: 0 };
      el.innerHTML = frame(this.title, this.sub, `<div class="sim-read" id="iv-log" style="min-height:220px"></div>`,
        `<p><b>คำถามที่เตรียมไว้</b></p><div id="iv-q"></div><div class="sim-btns"><button type="button" class="sim-b" data-ivr="1">↺ สัมภาษณ์ใหม่</button></div><table class="sim-tbl"><tbody id="iv-w"></tbody></table>`,
        goal(el, 'open', 'ถามคำถามปลายเปิดอย่างน้อย 3 ข้อ') + goal(el, 'w', 'เติม 5W1H ครบทั้ง 6 ช่องจากคำตอบจริง') + goal(el, 'clean', 'สัมภาษณ์ครบโดยไม่ใช้คำถามชี้นำเลย'));
      const draw = () => {
        $('#iv-log', el).innerHTML = s.asked.length ? s.asked.map(i => `<p><b>ถาม:</b> ${esc(Q[i].q)}<br><b>ลุงชัย:</b> ${esc(Q[i].a)}${Q[i].lead ? ' ⚠️' : ''}</p>`).join('') : '<b>ยังไม่ได้เริ่มสัมภาษณ์</b><p>บอกจุดประสงค์ก่อน แล้วถามทีละคำถาม คนหนึ่งถาม อีกคนจด</p>';
        $('#iv-q', el).innerHTML = btns('data-iv', order.map(i => Q[i].q), order.map((i, k) => s.asked.includes(i) ? k : -1));
        const got = W.map(w => s.asked.map(i => Q[i]).find(x => x.w === w));
        $('#iv-w', el).innerHTML = W.map((w, k) => `<tr><td><b>${w}</b></td><td>${got[k] ? esc(got[k].a) : '<span class="muted">ยังไม่มีข้อมูล</span>'}</td></tr>`).join('');
        const open = s.asked.filter(i => !Q[i].lead).length;
        if (open >= 3) tick(el, 'open'); if (got.every(Boolean)) { tick(el, 'w'); if (!s.lead) tick(el, 'clean'); }
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-iv]'), r = e.target.closest('[data-ivr]');
        if (b) { const i = order[+b.dataset.iv]; if (!s.asked.includes(i)) { s.asked.push(i); if (Q[i].lead) s.lead++; tone(Q[i].lead ? 220 : 620, 60); draw(); } }
        if (r) { s.asked = []; s.lead = 0; tone(300, 60); draw(); }
      });
      draw();
    }
  };

  defs['DT-M3-C02-M02'] = {
    title: 'ผังกระบวนการส่งมะม่วงแบบลีน', sub: 'แตะแท่งของขั้นที่เสียเวลามากที่สุดโดยไม่สร้างคุณค่า แล้วเลือกวิธีปรับการทำงานจริง ให้เวลารวมไม่เกิน 90 นาที',
    mount(el) {
      const ST = [{ n: 'เก็บผล', m: 30, v: 1 }, { n: 'รอรถ', m: 40, v: 0, w: 'การรอคอย' }, { n: 'ขนขึ้นรถ', m: 10, v: 1 }, { n: 'ขนส่ง', m: 30, v: 1 }, { n: 'คัดลูกช้ำ', m: 20, v: 0, w: 'งานที่ต้องแก้ไข' }];
      const FIX = [{ n: 'นัดรถมารับตรงเวลา (รอรถ 40 › 10 นาที)', k: 1, to: 10 }, { n: 'ใช้ถาดแบ่งช่อง (คัดลูกช้ำ 20 › 5 นาที)', k: 4, to: 5 }, { n: 'ลบตัวเลขในผังให้น้อยลง', fake: 1 }];
      const s = { fix: [], found: false, fake: false };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 300" id="ln-svg" role="img" aria-label="ผังกระบวนการพร้อมเวลา"></svg>`,
        `<div class="sim-read" id="ln-r"><b>แตะแท่งบนผัง</b><p>หาขั้นที่ใช้เวลามากที่สุดแต่ลูกค้าไม่ได้ประโยชน์</p></div><p><b>วิธีปรับการทำงาน</b></p><div id="ln-f"></div><div class="sim-meter"><span>เวลารวม</span><b id="ln-t">130 นาที</b></div>`,
        goal(el, 'find', 'แตะขั้นที่เป็นความสูญเปล่าที่ใหญ่ที่สุด') + goal(el, 'fast', 'ลดเวลารวมเหลือไม่เกิน 90 นาทีด้วยการเปลี่ยนวิธีทำงานจริง'));
      const mins = () => ST.map((x, i) => { const f = FIX.find((y, j) => s.fix.includes(j) && y.k === i); return f ? f.to : x.m; });
      const draw = () => {
        const M = mins(), tot = M.reduce((a, b) => a + b, 0); let v = `<rect width="680" height="300" rx="14" fill="${BG}"/>`, x = 20;
        ST.forEach((st, i) => { const w = M[i] * 4.6; v += `<g data-ln="${i}" style="cursor:pointer"><rect x="${x}" y="90" width="${w - 4}" height="70" rx="8" fill="${st.v ? ORG : '#7a2d22'}" stroke="${!st.v && s.found ? RED : '#fff'}" stroke-width="3"/>${T(x + w / 2 - 2, 120, st.n, { a: 'middle', s: 12 })}${T(x + w / 2 - 2, 142, M[i] + ' น.', { a: 'middle', s: 12, c: GOLD })}</g>`; if (!st.v && s.found) v += T(x + w / 2, 186, st.w, { a: 'middle', s: 11, c: '#ffb3a6' }); x += w; });
        v += T(20, 60, 'สีส้ม = สร้างคุณค่า · สีแดงเข้ม = ไม่สร้างคุณค่า', { s: 12 }) + T(20, 250, `เวลาวัดจริงรวม ${tot} นาที${s.fake ? ' (ตัวเลขในผังถูกลบ แต่เวลาจริงไม่เปลี่ยน!)' : ''}`, { s: 15, c: tot <= 90 ? OKC : GOLD });
        $('#ln-svg', el).innerHTML = v; $('#ln-t', el).textContent = tot + ' นาที';
        $('#ln-f', el).innerHTML = btns('data-lnf', FIX.map(f => f.n), s.fix);
        if (tot <= 90 && !s.fake) tick(el, 'fast');
      };
      el.addEventListener('click', e => {
        const g = e.target.closest('[data-ln]'), f = e.target.closest('[data-lnf]');
        if (g) { const i = +g.dataset.ln; if (i === 1) { s.found = true; tick(el, 'find'); $('#ln-r', el).innerHTML = '<b>ใช่แล้ว ขั้นรอรถ 40 นาที</b><p>เป็นการรอคอยซึ่งใช้เวลามากที่สุดแต่ไม่สร้างคุณค่า ขั้นคัดลูกช้ำก็เป็นงานที่ต้องแก้ไขเช่นกัน</p>'; tone(760, 90); } else { $('#ln-r', el).innerHTML = `<b>${esc(ST[i].n)} ${ST[i].v ? 'สร้างคุณค่า' : 'ไม่สร้างคุณค่า แต่ยังไม่ใช่ขั้นที่ใหญ่ที่สุด'}</b><p>ลองหาขั้นที่ไม่สร้างคุณค่าและใช้เวลามากที่สุด</p>`; tone(300, 60); } draw(); }
        if (f) { const j = +f.dataset.lnf; if (FIX[j].fake) { s.fake = !s.fake; tone(200, 120); } else { s.fix = s.fix.includes(j) ? s.fix.filter(x => x !== j) : [...s.fix, j]; tone(620, 50); } draw(); }
      });
      draw();
    }
  };

  defs['DT-M3-C02-M03'] = {
    title: 'ร่างแบบถาดใส่มะม่วง', sub: 'ปรับขนาดช่องและจำนวนช่อง สลับดูภาพร่าง 2 มิติและ 3 มิติ ให้ช่องพอดีกับมะม่วง (เส้นผ่านศูนย์กลาง 9 ซม.) และถาดใส่ลงตะกร้า 45 × 35 ซม. ได้',
    mount(el) {
      const s = { cell: 8, cols: 3, rows: 3, view: 0, seen: new Set([0]) };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 300" id="sk-svg" role="img" aria-label="ภาพร่างถาด"></svg>`,
        `<label class="sim-rg">ขนาดช่อง <b id="sk-c">8</b> ซม.<input type="range" data-sk="cell" min="8" max="14" value="8"></label><label class="sim-rg">จำนวนช่องตามยาว <b id="sk-x">3</b><input type="range" data-sk="cols" min="2" max="5" value="3"></label><label class="sim-rg">จำนวนช่องตามกว้าง <b id="sk-y">3</b><input type="range" data-sk="rows" min="2" max="4" value="3"></label><div id="sk-v"></div><div class="sim-checks" id="sk-k"></div>`,
        goal(el, 'fit', 'ช่องใหญ่กว่ามะม่วงแต่เหลือช่องว่างไม่เกิน 2 ซม.') + goal(el, 'box', 'ถาดใส่ลงตะกร้า 45 × 35 ซม. ได้ และมีอย่างน้อย 9 ช่อง') + goal(el, 'views', 'ดูทั้งภาพร่าง 2 มิติและภาพร่าง 3 มิติ'));
      const draw = () => {
        const W = s.cell * s.cols + 1, H = s.cell * s.rows + 1, fit = s.cell >= 10 && s.cell - 9 <= 2, box = W <= 45 && H <= 35 && s.cols * s.rows >= 9;
        let v = `<rect width="680" height="300" rx="14" fill="${BG}"/>`; const k = 6;
        if (s.view === 0) {
          v += `<rect x="40" y="30" width="${45 * k}" height="${35 * k}" fill="none" stroke="#7a5a40" stroke-width="3" stroke-dasharray="8 6"/>${T(40, 24, 'ขอบตะกร้า 45 × 35 ซม.', { s: 11, c: '#c9a27a' })}`;
          v += `<rect x="40" y="30" width="${W * k}" height="${H * k}" fill="#ffe7b0" stroke="${box ? OKC : RED}" stroke-width="3"/>`;
          for (let i = 0; i < s.cols; i++) for (let j = 0; j < s.rows; j++) v += `<rect x="${40 + 3 + i * s.cell * k}" y="${30 + 3 + j * s.cell * k}" width="${s.cell * k - 6}" height="${s.cell * k - 6}" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="${40 + (i + 0.5) * s.cell * k}" cy="${30 + (j + 0.5) * s.cell * k}" r="${4.5 * k}" fill="${GOLD}" opacity=".85"/>`;
          v += T(40 + W * k / 2, 30 + H * k + 22, `กว้าง ${W} ซม.`, { a: 'middle', s: 13 }) + T(40 + W * k + 10, 30 + H * k / 2, `ยาว ${H} ซม.`, { s: 13 }) + T(400, 280, 'ภาพร่าง 2 มิติ (มองจากด้านบน) บอกขนาดได้ชัด', { s: 12, c: '#c9a27a' });
        } else {
          const ox = 200, oy = 200, a = 4.2, iso = (x, y, z) => `${ox + (x - y) * a * 0.87},${oy + (x + y) * a * 0.5 - z * a}`;
          v += `<polygon points="${iso(0, 0, 0)} ${iso(W, 0, 0)} ${iso(W, H, 0)} ${iso(0, H, 0)}" fill="#c98a3a"/><polygon points="${iso(0, H, 0)} ${iso(W, H, 0)} ${iso(W, H, 6)} ${iso(0, H, 6)}" fill="#e3a650"/><polygon points="${iso(W, 0, 0)} ${iso(W, H, 0)} ${iso(W, H, 6)} ${iso(W, 0, 6)}" fill="#b5762c"/><polygon points="${iso(0, 0, 6)} ${iso(W, 0, 6)} ${iso(W, H, 6)} ${iso(0, H, 6)}" fill="#ffe7b0" stroke="${INK}"/>`;
          for (let i = 1; i < s.cols; i++) v += `<polyline points="${iso(i * s.cell, 0, 6)} ${iso(i * s.cell, H, 6)}" stroke="${INK}" fill="none" stroke-width="2"/>`;
          for (let j = 1; j < s.rows; j++) v += `<polyline points="${iso(0, j * s.cell, 6)} ${iso(W, j * s.cell, 6)}" stroke="${INK}" fill="none" stroke-width="2"/>`;
          v += T(400, 280, 'ภาพร่าง 3 มิติ เห็นภาพรวมของถาด', { s: 12, c: '#c9a27a' });
        }
        $('#sk-svg', el).innerHTML = v; $('#sk-c', el).textContent = s.cell; $('#sk-x', el).textContent = s.cols; $('#sk-y', el).textContent = s.rows;
        $('#sk-v', el).innerHTML = btns('data-skv', ['ภาพร่าง 2 มิติ', 'ภาพร่าง 3 มิติ'], s.view);
        $('#sk-k', el).innerHTML = row(s.cell >= 10, 'ช่องใหญ่กว่ามะม่วง (ต้องเผื่อผนังถาด)') + row(s.cell - 9 <= 2, 'ช่องไม่หลวมจนมะม่วงกลิ้ง') + row(W <= 45 && H <= 35, `ถาด ${W} × ${H} ซม. ใส่ตะกร้าได้`) + row(s.cols * s.rows >= 9, `มี ${s.cols * s.rows} ช่อง`);
        if (fit) tick(el, 'fit'); if (box && fit) tick(el, 'box'); if (s.seen.size === 2) tick(el, 'views');
      };
      el.addEventListener('input', e => { const k = e.target.dataset.sk; if (!k) return; s[k] = +e.target.value; draw(); });
      el.addEventListener('click', e => { const b = e.target.closest('[data-skv]'); if (b) { s.view = +b.dataset.skv; s.seen.add(s.view); tone(560, 40); draw(); } });
      draw();
    }
  };

  defs['DT-M3-C02-M06'] = {
    title: 'เฟือง เซลล์แสงอาทิตย์ และไดโอด', sub: 'เลือกเฟือง ดูทิศการหมุนและความเร็ว แล้วต่อเซลล์แสงอาทิตย์และไดโอด สลับกลางวันกลางคืนดูทิศทางกระแส',
    mount(el) {
      const TEETH = [10, 20, 40];
      const s = { a: 1, b: 1, ser: 1, par: 1, diode: 0, night: false, ang: 0, nightOk: false };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 300" id="gr-svg" role="img" aria-label="เฟืองและวงจรเซลล์แสงอาทิตย์"></svg>`,
        `<p><b>เฟืองขับ (มอเตอร์)</b></p><div id="gr-a"></div><p><b>เฟืองตาม (ล้อ)</b></p><div id="gr-b"></div><label class="sim-rg">แผงต่ออนุกรม <b id="gr-s">1</b><input type="range" data-gr="ser" min="1" max="4" value="1"></label><label class="sim-rg">แถวต่อขนาน <b id="gr-p">1</b><input type="range" data-gr="par" min="1" max="4" value="1"></label><div id="gr-d"></div><div id="gr-n"></div><div class="sim-checks" id="gr-k"></div>`,
        goal(el, 'torque', 'ให้ล้อมีแรงอย่างน้อย 4 เท่าของมอเตอร์') + goal(el, 'power', 'ต่อเซลล์ได้ 3–4.5 โวลต์ และอย่างน้อย 200 มิลลิแอมแปร์ (ไม่เกิน 4 แผง)') + goal(el, 'diode', 'ตอนกลางคืน กระแสจากแบตเตอรี่ไม่ไหลย้อนเข้าเซลล์'));
      const gear = (cx, cy, n, ang, col) => { const r = n * 0.9 + 16; let p = ''; for (let i = 0; i < n; i++) { const t = ang + i * 2 * Math.PI / n; p += `<rect x="${cx + Math.cos(t) * r - 4}" y="${cy + Math.sin(t) * r - 4}" width="8" height="8" fill="${col}" transform="rotate(${t * 180 / Math.PI} ${cx + Math.cos(t) * r} ${cy + Math.sin(t) * r})"/>`; } return p + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><circle cx="${cx}" cy="${cy}" r="6" fill="${INK}"/><line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(ang) * r * 0.8}" y2="${cy + Math.sin(ang) * r * 0.8}" stroke="${INK}" stroke-width="4"/>`; };
      const st = () => { const V = 1.5 * s.ser, I = 100 * s.par, n = s.ser * s.par; return { V, I, n, pw: n <= 4 && V >= 3 && V <= 4.5 && I >= 200 }; };
      const draw = (full = true) => {
        const ta = TEETH[s.a], tb = TEETH[s.b], ra = ta * 0.9 + 16, rb = tb * 0.9 + 16, ratio = tb / ta, P = st();
        let v = `<rect width="680" height="300" rx="14" fill="${BG}"/>`;
        const cxA = 30 + ra, cxB = cxA + ra + rb + 6;
        v += gear(cxA, 120, ta, s.ang, GOLD) + gear(cxB, 120, tb, -s.ang / ratio + Math.PI / tb, ORG);
        v += T(20, 205, `เฟืองขับ ${ta} ซี่ หมุนตามเข็ม ↻`, { s: 15, c: GOLD }) + T(20, 228, `เฟืองตาม ${tb} ซี่ หมุนทวนเข็ม ↺`, { s: 15, c: ORG });
        v += T(20, 256, `อัตราทด ${tb} ÷ ${ta} = ${fmt(ratio, 2)}`, { s: 15 }) + T(20, 282, `ล้อหมุน ${fmt(200 / ratio, 0)} รอบ/นาที · แรง ${fmt(ratio, 2)} เท่า`, { s: 15, c: ratio >= 4 ? OKC : GOLD });
        const sx = 430; v += `<rect x="${sx}" y="20" width="230" height="230" rx="12" fill="${s.night ? '#14101f' : '#3d2010'}" stroke="${GOLD}"/>`;
        v += s.night ? `<circle cx="${sx + 200}" cy="44" r="12" fill="#e8e3ff"/>` : `<circle cx="${sx + 200}" cy="44" r="14" fill="${GOLD}"/>`;
        for (let i = 0; i < Math.min(P.n, 8); i++) v += `<rect x="${sx + 16 + (i % 4) * 34}" y="${36 + Math.floor(i / 4) * 30}" width="28" height="22" fill="${P.n <= 4 ? '#3b82f6' : RED}" stroke="#fff"/>`;
        v += T(sx + 16, 120, `${fmt(P.V, 1)} V · ${P.I} mA`, { s: 16, c: P.pw ? OKC : GOLD });
        const lab = ['ไม่มีไดโอด', 'ไดโอด: แถบสีทางเซลล์', 'ไดโอด: แถบสีทางแบตเตอรี่'][s.diode];
        let msg; if (s.night) msg = s.diode === 0 ? ['กระแสไหลย้อนจากแบตเตอรี่', 'เข้าเซลล์แสงอาทิตย์!', RED] : s.diode === 1 ? ['ไม่ไหลย้อน แต่ตอนกลางวัน', 'ก็ชาร์จแบตเตอรี่ไม่ได้', GOLD] : ['ไดโอดกั้นกระแส', 'ไม่ให้ไหลย้อนเข้าเซลล์', OKC];
        else msg = s.diode === 1 ? ['ไดโอดกลับขั้ว กระแสจากเซลล์', 'ไหลไปชาร์จแบตเตอรี่ไม่ได้', RED] : P.pw ? ['เซลล์ชาร์จแบตเตอรี่', 'และขับมอเตอร์ได้', OKC] : ['ไฟจากเซลล์ยังไม่พอ', 'ลองต่ออนุกรมหรือขนานเพิ่ม', GOLD];
        v += T(sx + 16, 150, lab, { s: 13 }) + `<rect x="${sx + 16}" y="164" width="60" height="30" rx="4" fill="#9ca3af"/>${T(sx + 46, 184, 'แบต', { a: 'middle', s: 12, c: INK })}` + T(sx + 12, 222, msg[0], { s: 13, c: msg[2] }) + T(sx + 12, 240, msg[1], { s: 13, c: msg[2] });
        $('#gr-svg', el).innerHTML = v;
        if (!full) return;
        $('#gr-a', el).innerHTML = btns('data-gra', TEETH.map(t => t + ' ซี่'), s.a); $('#gr-b', el).innerHTML = btns('data-grb', TEETH.map(t => t + ' ซี่'), s.b);
        $('#gr-s', el).textContent = s.ser; $('#gr-p', el).textContent = s.par;
        $('#gr-d', el).innerHTML = btns('data-grd', ['ไม่มีไดโอด', 'แถบสีทางเซลล์', 'แถบสีทางแบตเตอรี่'], s.diode);
        $('#gr-n', el).innerHTML = btns('data-grn', ['☀️ กลางวัน', '🌙 กลางคืน'], s.night ? 1 : 0);
        $('#gr-k', el).innerHTML = row(P.n <= 4, `ใช้ ${P.n} แผง (มี 4 แผง)`) + row(P.V >= 3 && P.V <= 4.5, 'แรงดันอยู่ในช่วงที่มอเตอร์รับได้') + row(P.I >= 200, 'กระแสพอขับมอเตอร์');
        if (ratio >= 4) tick(el, 'torque'); if (P.pw) tick(el, 'power'); if (s.night && s.diode === 2) tick(el, 'diode');
      };
      every(el, () => { const sv = $('#gr-svg', el); if (!sv || !sv.isConnected) return; s.ang += 0.12; draw(false); }, 120);
      el.addEventListener('input', e => { const k = e.target.dataset.gr; if (!k) return; s[k] = +e.target.value; draw(); });
      el.addEventListener('click', e => {
        const a = e.target.closest('[data-gra]'), b = e.target.closest('[data-grb]'), d = e.target.closest('[data-grd]'), n = e.target.closest('[data-grn]');
        if (a) s.a = +a.dataset.gra; if (b) s.b = +b.dataset.grb; if (d) s.diode = +d.dataset.grd; if (n) s.night = +n.dataset.grn === 1;
        if (a || b || d || n) { tone(560, 40); draw(); }
      });
      draw();
    }
  };

  defs['DT-M3-C02-M04'] = {
    title: 'ทดสอบถาดสองรุ่นให้ยุติธรรม', sub: 'ตั้งเงื่อนไขของรุ่น A และรุ่น B แล้วกดทดสอบ การทดสอบจะยุติธรรมเมื่อเงื่อนไขทุกอย่างเหมือนกัน ต่างกันแค่แบบถาด',
    mount(el) {
      const ROAD = ['ถนนเรียบ', 'ถนนขรุขระ'], CNT = [10, 20];
      const s = { A: { road: 0, cnt: 0 }, B: { road: 1, cnt: 0 }, runs: [], fairRuns: 0 };
      const VAR = [0, 1, -1, 1, 0, -1];
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 280" id="ft-svg" role="img" aria-label="ผลการทดสอบ"></svg>`,
        `<div id="ft-A"></div><div id="ft-B"></div><div class="sim-btns"><button type="button" class="sim-b" data-ftgo="1">▶ ทดสอบ 1 รอบ</button><button type="button" class="sim-b" data-ftr="1">↺ ล้างผล</button></div><div class="sim-checks" id="ft-k"></div>`,
        goal(el, 'fair', 'ตั้งเงื่อนไขของสองรุ่นให้เหมือนกัน') + goal(el, 'three', 'ทดสอบอย่างยุติธรรมซ้ำอย่างน้อย 3 รอบ') + goal(el, 'win', 'ดูผลรวมแล้วรู้ว่ารุ่นใดช้ำน้อยกว่า'));
      const bruise = (base, c, k) => Math.max(0, Math.round(base * (c.road ? 2.5 : 1) * CNT[c.cnt] / 10) + VAR[k % 6]);
      const fair = () => s.A.road === s.B.road && s.A.cnt === s.B.cnt;
      const pane = (k) => `<p><b>รุ่น ${k}</b> ${k === 'A' ? '(ตะกร้าเดิม)' : '(ถาดแบ่งช่อง)'}</p>${btns(`data-ftk="${k}" data-ftrd`, ROAD, s[k].road)}${btns(`data-ftk="${k}" data-ftc`, CNT.map(c => c + ' ลูก'), s[k].cnt)}`;
      const draw = () => {
        $('#ft-A', el).innerHTML = pane('A'); $('#ft-B', el).innerHTML = pane('B');
        let v = `<rect width="680" height="280" rx="14" fill="${BG}"/>${T(20, 30, 'จำนวนลูกช้ำในแต่ละรอบ', { s: 14 })}`;
        s.runs.slice(-6).forEach((r, i) => { const y = 50 + i * 34; v += T(20, y + 18, `รอบ ${i + 1}${r.fair ? '' : ' ⚠ ไม่ยุติธรรม'}`, { s: 12, c: r.fair ? '#fff3dc' : RED }) + `<rect x="170" y="${y}" width="${r.a * 22}" height="12" fill="${ORG}"/><rect x="170" y="${y + 14}" width="${r.b * 22}" height="12" fill="${GOLD}"/>` + T(176 + Math.max(r.a, r.b) * 22, y + 20, `A ${r.a} · B ${r.b}`, { s: 12 }); });
        const fr = s.runs.filter(r => r.fair), sa = fr.reduce((a, r) => a + r.a, 0), sb = fr.reduce((a, r) => a + r.b, 0);
        v += T(20, 266, fr.length ? `รวมเฉพาะรอบที่ยุติธรรม ${fr.length} รอบ: รุ่น A ช้ำ ${sa} ลูก · รุ่น B ช้ำ ${sb} ลูก` : 'ยังไม่มีผลจากการทดสอบที่ยุติธรรม', { s: 13, c: GOLD });
        $('#ft-svg', el).innerHTML = v;
        $('#ft-k', el).innerHTML = row(s.A.road === s.B.road, 'ถนนเดียวกัน') + row(s.A.cnt === s.B.cnt, 'จำนวนมะม่วงเท่ากัน');
        if (fair()) tick(el, 'fair'); if (fr.length >= 3) { tick(el, 'three'); tick(el, 'win'); }
      };
      el.addEventListener('click', e => {
        const k = e.target.closest('[data-ftk]'), go = e.target.closest('[data-ftgo]'), r = e.target.closest('[data-ftr]');
        if (k) { const c = s[k.dataset.ftk]; if (k.dataset.ftrd != null) c.road = +k.dataset.ftrd; if (k.dataset.ftc != null) c.cnt = +k.dataset.ftc; tone(560, 40); draw(); }
        if (go) { const n = s.runs.length; s.runs.push({ a: bruise(8, s.A, n), b: bruise(3, s.B, n + 2), fair: fair() }); tone(fair() ? 700 : 240, 90); draw(); }
        if (r) { s.runs = []; draw(); }
      });
      draw();
    }
  };

  defs['DT-M3-C02-M05'] = {
    title: 'ประกอบรายงานและโปสเตอร์', sub: 'แตะหัวข้อรายงานตามลำดับที่ถูกต้อง เลือกประโยคใส่บทคัดย่อ แล้วปรับขนาดตัวอักษรโปสเตอร์ให้อ่านได้จากระยะ 1–2 เมตร',
    mount(el) {
      const SEC = ['ปก', 'บทคัดย่อ', 'สารบัญ', 'ที่มาและวัตถุประสงค์', 'ข้อมูลและแนวคิดที่เกี่ยวข้อง', 'การออกแบบและวางแผน', 'การทดสอบและปรับปรุง', 'สรุปผลและข้อเสนอแนะ', 'บรรณานุกรม', 'ภาคผนวก'];
      const SHOW = [3, 8, 0, 6, 1, 9, 4, 2, 7, 5];
      const AB = [{ t: 'มะม่วงช้ำระหว่างขนส่งประมาณ 10 ลูกจาก 100 ลูก', k: 'ปัญหา' }, { t: 'ออกแบบถาดแบ่งช่องรองกระดาษ และทดสอบ 3 รอบ', k: 'วิธีการ' }, { t: 'ลูกช้ำลดจาก 8 ลูกเหลือ 3 ลูก ต้นทุนเพิ่ม 15 บาท', k: 'ผล' }, { t: 'ถาดนี้ช่วยลดลูกช้ำได้บนเส้นทางที่ทดสอบ', k: 'สรุป' }, { t: 'ถาดสวยมาก ทุกคนชอบ', bad: 1 }, { t: 'ใช้ได้กับผลไม้ทุกชนิด', bad: 1 }];
      const s = { seq: [], ab: [], font: 14 };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 300" id="rp-svg" role="img" aria-label="เล่มรายงานและโปสเตอร์"></svg>`,
        `<p><b>1. แตะหัวข้อตามลำดับในเล่ม</b></p><div id="rp-s"></div><p><b>2. ประโยคในบทคัดย่อ</b></p><div id="rp-a"></div><label class="sim-rg">ขนาดตัวอักษรเนื้อหาโปสเตอร์ <b id="rp-f">14</b> พอยต์<input type="range" data-rpf="1" min="10" max="40" step="2" value="14"></label><div class="sim-checks" id="rp-k"></div>`,
        goal(el, 'order', 'เรียงหัวข้อรายงานครบ 10 หัวข้อตามลำดับ') + goal(el, 'abs', 'บทคัดย่อมีปัญหา วิธีการ ผล และสรุป โดยไม่มีข้อความที่ไม่มีหลักฐาน') + goal(el, 'font', 'ตัวอักษรเนื้อหาโปสเตอร์ไม่เล็กกว่า 24 พอยต์'));
      const draw = () => {
        let v = `<rect width="680" height="300" rx="14" fill="${BG}"/>`;
        const part = i => i <= 2 ? 0 : i <= 7 ? 1 : 2, colr = ['#ffd27a', ORG, '#c98a3a'];
        s.seq.forEach((i, k) => { v += `<rect x="20" y="${20 + k * 24}" width="250" height="20" rx="4" fill="${colr[part(i)]}"/>${T(28, 35 + k * 24, (k + 1) + '. ' + SEC[i], { s: 12, c: INK })}`; });
        v += T(20, 290, 'สีอ่อน = ส่วนนำ · ส้ม = ส่วนเนื้อเรื่อง · น้ำตาล = ส่วนอ้างอิง', { s: 11, c: '#c9a27a' });
        const px = 330; v += `<rect x="${px}" y="20" width="330" height="260" rx="10" fill="#fff8e7"/>${T(px + 165, 52, 'ถาดแบ่งช่องลดมะม่วงช้ำ', { a: 'middle', s: 20, c: INK, w: 800 })}`;
        const sc = Math.max(5, s.font * 0.42); v += `<g opacity="${s.font >= 24 ? 1 : 0.35 + s.font / 60}" style="filter:blur(${s.font >= 24 ? 0 : (24 - s.font) / 6}px)">${T(px + 20, 90, 'บทคัดย่อ: ลูกช้ำลดจาก 8 เหลือ 3 ลูก', { s: sc, c: INK, w: 600 })}${T(px + 20, 90 + sc * 2, 'ต้นทุนเพิ่ม 15 บาท', { s: sc, c: INK, w: 600 })}</g>`;
        v += T(px + 165, 270, s.font >= 24 ? 'มองจากระยะ 2 เมตร: อ่านได้ชัด' : 'มองจากระยะ 2 เมตร: ตัวเล็กเกินไป อ่านไม่ออก', { a: 'middle', s: 12, c: s.font >= 24 ? '#15803d' : '#b91c1c' });
        $('#rp-svg', el).innerHTML = v;
        $('#rp-s', el).innerHTML = btns('data-rps', SHOW.map(i => SEC[i]), SHOW.map((i, k) => s.seq.includes(i) ? k : -1));
        $('#rp-a', el).innerHTML = btns('data-rpa', AB.map(a => a.t), s.ab);
        $('#rp-f', el).textContent = s.font;
        const ks = new Set(s.ab.filter(i => !AB[i].bad).map(i => AB[i].k)), bad = s.ab.some(i => AB[i].bad);
        $('#rp-k', el).innerHTML = row(s.seq.length === 10, `เรียงแล้ว ${s.seq.length}/10 หัวข้อ`) + ['ปัญหา', 'วิธีการ', 'ผล', 'สรุป'].map(k => row(ks.has(k), 'บทคัดย่อมี' + k)).join('') + row(!bad, 'ไม่มีข้อความที่ไม่มีหลักฐาน');
        if (s.seq.length === 10) tick(el, 'order'); if (ks.size === 4 && !bad) tick(el, 'abs'); if (s.font >= 24) tick(el, 'font');
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-rps]'), a = e.target.closest('[data-rpa]');
        if (b) { const i = SHOW[+b.dataset.rps]; if (s.seq.includes(i)) return; if (i === s.seq.length) { s.seq.push(i); tone(660, 40); } else { tone(200, 90); s.seq = []; } draw(); }
        if (a) { const i = +a.dataset.rpa; s.ab = s.ab.includes(i) ? s.ab.filter(x => x !== i) : [...s.ab, i]; tone(AB[i].bad ? 240 : 600, 50); draw(); }
      });
      el.addEventListener('input', e => { if (!e.target.dataset.rpf) return; s.font = +e.target.value; draw(); });
      draw();
    }
  };

  /* ---------- บท 3 เทคโนโลยีเพิ่มมูลค่า ---------- */
  defs['DT-M3-C03-M01'] = {
    title: 'เพิ่มมูลค่ามะม่วงบ้านสวนลุงชัย', sub: 'เลือกวิธีเพิ่มมูลค่า ดูต้นทุนที่เพิ่ม ราคาที่ผู้ซื้อยอมจ่าย และจำนวนผู้ซื้อต่อวัน (ข้อมูลสมมติจากการสำรวจผู้ซื้อ)',
    mount(el) {
      const O = [{ n: 'ถาดมีมือจับ (หน้าที่ใช้สอย)', c: 5, p: 15, k: 'หน้าที่ใช้สอย' }, { n: 'พิมพ์ลายสีทั้งถาด (รูปลักษณ์)', c: 40, p: 10, k: 'รูปลักษณ์' }, { n: 'ได้รับการรับรองแหล่งผลิต GAP (มาตรฐาน)', c: 8, p: 20, k: 'มาตรฐาน' }, { n: 'ขายผ่านสื่อสังคมออนไลน์ (ช่องทางจำหน่าย)', c: 0, p: 0, buy: 15, k: 'ช่องทาง' }];
      const s = { on: [] };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 280" id="va-svg" role="img" aria-label="ต้นทุน ราคา และกำไร"></svg>`,
        `<div id="va-b"></div><div class="sim-checks" id="va-k"></div>`,
        goal(el, 'two', 'ใช้วิธีเพิ่มมูลค่าอย่างน้อย 2 วิธี') + goal(el, 'profit', 'กำไรต่อวันเพิ่มขึ้นจากเดิมอย่างน้อย 50%') + goal(el, 'worth', 'ไม่เลือกวิธีที่ต้นทุนเพิ่มมากกว่าราคาที่ผู้ซื้อยอมจ่ายเพิ่ม'));
      const calc = on => { let cost = 110, price = 150, buy = 20; on.forEach(i => { cost += O[i].c; price += O[i].p; buy += O[i].buy || 0; }); return { cost, price, buy, profit: (price - cost) * buy }; };
      const base = calc([]).profit;
      const draw = () => {
        const c = calc(s.on), up = (c.profit - base) / base; let v = `<rect width="680" height="280" rx="14" fill="${BG}"/>`;
        const bar = (y, lab, val, max, col) => `${T(20, y + 16, lab, { s: 13 })}<rect x="190" y="${y}" width="${Math.round(val / max * 420)}" height="22" rx="4" fill="${col}"/>${T(196 + Math.round(val / max * 420), y + 16, val.toLocaleString(), { s: 13 })}`;
        v += bar(30, 'ต้นทุนต่อกล่อง (บาท)', c.cost, 220, '#c98a3a') + bar(70, 'ราคาขาย (บาท)', c.price, 220, ORG) + bar(110, 'ผู้ซื้อต่อวัน (คน)', c.buy, 60, GOLD) + bar(160, 'กำไรต่อวัน (บาท)', c.profit, 4000, c.profit > base ? OKC : RED);
        v += T(20, 230, `กำไรเดิม ${base.toLocaleString()} บาท · ตอนนี้ ${c.profit.toLocaleString()} บาท (${up >= 0 ? '+' : ''}${Math.round(up * 100)}%)`, { s: 14, c: GOLD });
        $('#va-svg', el).innerHTML = v;
        $('#va-b', el).innerHTML = btns('data-va', O.map(o => `${o.n} · ต้นทุน +${o.c}${o.p ? ' · ผู้ซื้อยอมจ่าย +' + o.p : ''}${o.buy ? ' · ผู้ซื้อ +' + o.buy + ' คน' : ''}`), s.on);
        const worth = !s.on.some(i => O[i].c > O[i].p && !O[i].buy);
        $('#va-k', el).innerHTML = row(s.on.length >= 2, `ใช้ ${s.on.length} วิธี`) + row(up >= 0.5, 'กำไรเพิ่มอย่างน้อย 50%') + row(worth, 'ทุกวิธีคุ้มค่ากับต้นทุน');
        if (s.on.length >= 2) tick(el, 'two'); if (up >= 0.5 && worth) tick(el, 'profit'); if (s.on.length >= 2 && worth) tick(el, 'worth');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-va]'); if (!b) return; const i = +b.dataset.va; s.on = s.on.includes(i) ? s.on.filter(x => x !== i) : [...s.on, i]; tone(O[i].c > O[i].p && !O[i].buy ? 240 : 620, 50); draw(); });
      draw();
    }
  };

  defs['DT-M3-C03-M02'] = {
    title: 'สแกนทรัพย์สินทางปัญญาในร้านข้าวมันไก่', sub: 'แตะสิ่งต่าง ๆ ในร้านป้าหมอนทีละจุด แล้วเลือกว่าเป็นทรัพย์สินทางปัญญาประเภทใด ระบบจะบอกอายุการคุ้มครองและการจดทะเบียน',
    mount(el) {
      const TY = ['ชื่อทางการค้า', 'เครื่องหมายการค้า', 'ความลับทางการค้า', 'ลิขสิทธิ์', 'อนุสิทธิบัตร', 'สิทธิบัตรการออกแบบผลิตภัณฑ์'];
      const P = [{ n: 'ชื่อร้านบนป้าย', a: 0, x: 120, y: 50, i: 'จดทะเบียนที่กรมพัฒนาธุรกิจการค้า' }, { n: 'โลโก้ไก่', a: 1, x: 300, y: 50, i: 'จดทะเบียนได้ คุ้มครองคราวละ 10 ปี ต่ออายุได้' }, { n: 'สูตรน้ำจิ้ม', a: 2, x: 500, y: 150, i: 'ไม่ต้องจดทะเบียน คุ้มครองตราบที่ยังเป็นความลับ' }, { n: 'คลิปโฆษณา', a: 3, x: 560, y: 60, i: 'ไม่ต้องจดทะเบียน คุ้มครองตลอดอายุผู้สร้างสรรค์และอีก 50 ปี' }, { n: 'หม้อหุงข้าวที่ปรับกลไก', a: 4, x: 150, y: 200, i: 'คุ้มครอง 6 ปี ต่ออายุได้ 2 ครั้ง ครั้งละ 2 ปี' }, { n: 'รูปทรงกล่องข้าวแบบใหม่', a: 5, x: 340, y: 210, i: 'คุ้มครอง 10 ปี เน้นรูปลักษณ์ภายนอก' }];
      const s = { open: -1, ans: P.map(() => null) };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 280" id="ip-svg" role="img" aria-label="ร้านข้าวมันไก่"></svg>`,
        `<div class="sim-read" id="ip-r"><b>แตะจุดสีทองในร้าน</b><p>มีทั้งหมด 6 จุด</p></div><div id="ip-b"></div><div class="sim-meter"><span>ถูกต้อง</span><b id="ip-n">0 / 6</b></div>`,
        goal(el, 'all', 'จัดประเภทครบทั้ง 6 จุด') + goal(el, 'right', 'จัดประเภทถูกทุกจุด'));
      const draw = () => {
        let v = `<rect width="680" height="280" rx="14" fill="${BG}"/><rect x="40" y="100" width="420" height="160" rx="10" fill="${SAND}"/><rect x="60" y="20" width="360" height="60" rx="8" fill="#7a2d22" stroke="${GOLD}" stroke-width="3"/>${T(240, 58, 'ข้าวมันไก่ป้าหมอน', { a: 'middle', s: 20, c: GOLD, w: 800 })}<rect x="500" y="20" width="140" height="90" rx="8" fill="#111"/><rect x="470" y="130" width="70" height="60" rx="6" fill="#c98a3a"/>`;
        P.forEach((p, i) => { const a = s.ans[i], c = a == null ? GOLD : a === p.a ? OKC : RED; v += `<g data-ip="${i}" style="cursor:pointer"><circle cx="${p.x}" cy="${p.y}" r="20" fill="${c}" stroke="#fff" stroke-width="${s.open === i ? 5 : 3}"/>${T(p.x, p.y + 6, a == null ? '?' : a === p.a ? '✓' : '✗', { a: 'middle', s: 18, c: INK, w: 800 })}${T(p.x, p.y + 38, p.n, { a: 'middle', s: 11 })}</g>`; });
        $('#ip-svg', el).innerHTML = v;
        $('#ip-b', el).innerHTML = s.open >= 0 ? btns('data-ipt', TY, s.ans[s.open]) : '';
        const right = s.ans.filter((a, i) => a === P[i].a).length; $('#ip-n', el).textContent = right + ' / 6';
        if (s.ans.every(a => a != null)) tick(el, 'all'); if (right === 6) tick(el, 'right');
      };
      el.addEventListener('click', e => {
        const g = e.target.closest('[data-ip]'), t = e.target.closest('[data-ipt]');
        if (g) { s.open = +g.dataset.ip; $('#ip-r', el).innerHTML = `<b>${esc(P[s.open].n)}</b><p>เลือกประเภทด้านล่าง</p>`; tone(520, 40); draw(); }
        if (t && s.open >= 0) { const k = +t.dataset.ipt, p = P[s.open]; s.ans[s.open] = k; $('#ip-r', el).innerHTML = k === p.a ? `<b>ถูกต้อง: ${esc(TY[k])}</b><p>${esc(p.i)}</p>` : `<b>ยังไม่ใช่</b><p>ลองคิดว่า "${esc(p.n)}" คุ้มครองชื่อ สัญลักษณ์ ความลับ งานสร้างสรรค์ หรือการประดิษฐ์</p>`; tone(k === p.a ? 760 : 220, 90); draw(); }
      });
      draw();
    }
  };
};
