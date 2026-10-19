/* ห้องจำลอง ม.2 · 15 หัวข้อ (หัวข้อละ 1 ห้อง) แทรกในหน้าเรียนรู้ของแต่ละหัวข้ออัตโนมัติ
   sims.js (ไฟล์ส่วนกลาง) เรียก window.DT_SIM_DEFS(defs, helpers) แล้วใช้ห้องจำลองชุดนี้แทนของ ม.1
   สถานการณ์อ้างอิงตัวอย่างในหนังสือเรียน สสวท. ม.2 (อุปกรณ์บีบอัดขยะของนนท์ มาตรการลดพลาสติกของน้ำหวาน
   เกม Design Customer's Bag กิจกรรมที่ 4.1 ดินขาดอินทรียวัตถุ) และสถานการณ์จุดคืนแก้วของบทเรียน · ตัวเลขเป็นข้อมูลสมมติ */
window.DT_SIM_DEFS = function (defs, h) {
  const { esc, $, $$, fmt, tone, goal, tick, frame } = h;
  const svgText = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-size="${o.s || 14}" font-weight="${o.w || 700}" fill="${o.c || '#eaf6ff'}" text-anchor="${o.a || 'start'}" font-family="Kanit,sans-serif">${esc(t)}</text>`;
  const row = (ok, t) => `<div class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${t}</div>`;
  const btns = (attr, list, cur) => `<div class="sim-btns">${list.map((x, i) => `<button type="button" class="sim-b${cur === i ? ' on' : ''}" ${attr}="${i}">${esc(x)}</button>`).join('')}</div>`;
  const BG = '#0f2747', INK = '#0b1d3f';

  /* ---------- บท 1 ---------- */
  defs['DT-M2-C01-M01'] = {
    title: 'สำรวจโรงอาหาร แล้วเขียนแผนที่ความคิด', sub: 'แตะจุดสำรวจทีละจุด อ่านสิ่งที่พบ แล้วจัดว่าเป็นข้อเท็จจริงหรือข้อสงสัย แผนที่ความคิดจะเติบโตตามที่คุณจัด',
    mount(el) {
      const P = [
        { n: 'ช่องคืนแก้ว', t: 'มีช่องเดียว แต่ละคนใช้เวลาประมาณ 8 วินาที', f: 0, x: 90, y: 70 },
        { n: 'แถวรอ', t: 'มีคนรอคืนแก้ว 12 คน', f: 0, x: 250, y: 60 },
        { n: 'ทางเดิน', t: 'ทางเดินเหลือกว้าง 80 ซม.', f: 0, x: 420, y: 75 },
        { n: 'โต๊ะกินข้าว', t: 'มีแก้วค้างบนโต๊ะ 8 ใบ', f: 0, x: 580, y: 70 },
        { n: 'เสียงบ่น', t: 'มีคนบอกว่า "ถาดน่าจะน้อยไป"', f: 1, x: 170, y: 190 },
        { n: 'ป้ายเดิม', t: 'เพื่อนเดาว่า "คนไม่อ่านป้ายเพราะตัวเล็ก"', f: 1, x: 500, y: 195 }];
      const s = { open: -1, ans: P.map(() => null) };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 300" id="mm-svg" role="img" aria-label="แผนผังโรงอาหารและแผนที่ความคิด"></svg>`,
        `<div class="sim-read" id="mm-say"><b>แตะจุดสำรวจบนภาพ</b><p>แต่ละจุดมีสิ่งที่พบ 1 อย่าง</p></div><div id="mm-ctl"></div><div class="sim-meter"><span>จัดแล้ว</span><b id="mm-n">0 / 6</b></div>`,
        goal(el, 'all', 'สำรวจและจัดครบทั้ง 6 จุด') + goal(el, 'right', 'จัดถูกทุกจุด (ข้อเท็จจริง 4 · ข้อสงสัย 2)') + goal(el, 'map', 'แผนที่ความคิดมีกิ่งข้อเท็จจริงและกิ่งข้อสงสัยครบ'));
      const draw = () => {
        let g = `<rect width="680" height="300" rx="14" fill="${BG}"/>`;
        const done = s.ans.filter(a => a != null).length;
        if (done < 6) P.forEach((p, i) => { const a = s.ans[i]; g += `<g data-mm="${i}" style="cursor:pointer"><circle cx="${p.x}" cy="${p.y}" r="30" fill="${a == null ? '#ffd23f' : a === 0 ? '#3aa0ff' : '#ff3d94'}" stroke="#fff" stroke-width="${s.open === i ? 5 : 3}"/>${svgText(p.x, p.y + 6, a == null ? '?' : a === 0 ? 'จริง' : 'สงสัย', { a: 'middle', s: a == null ? 22 : 13, c: INK, w: 800 })}${svgText(p.x, p.y + 50, p.n, { a: 'middle', s: 13 })}</g>`; });
        else {
          g += `<rect x="250" y="120" width="180" height="56" rx="10" fill="#ffd23f" stroke="#fff" stroke-width="3"/>${svgText(340, 145, 'ปัญหา: รอคืนแก้วนาน', { a: 'middle', c: INK, s: 14, w: 800 })}${svgText(340, 165, 'ช่วงพักกลางวัน', { a: 'middle', c: INK, s: 12 })}`;
          const L = P.map((p, i) => ({ p, a: s.ans[i] })).filter(x => x.a === 0), R = P.map((p, i) => ({ p, a: s.ans[i] })).filter(x => x.a === 1);
          L.forEach((x, k) => { const y = 40 + k * 66; g += `<line x1="250" y1="148" x2="200" y2="${y + 18}" stroke="#3aa0ff" stroke-width="3"/><rect x="14" y="${y}" width="186" height="38" rx="8" fill="#3aa0ff"/>${svgText(22, y + 24, x.p.t.slice(0, 24), { s: 12, c: '#fff' })}`; });
          R.forEach((x, k) => { const y = 70 + k * 90; g += `<line x1="430" y1="148" x2="480" y2="${y + 18}" stroke="#ff3d94" stroke-width="3" stroke-dasharray="6 5"/><rect x="480" y="${y}" width="190" height="38" rx="8" fill="#ff3d94"/>${svgText(488, y + 24, x.p.t.slice(0, 24), { s: 12, c: '#fff' })}`; });
          g += svgText(20, 290, 'กิ่งข้อเท็จจริง', { c: '#9fd4ff', s: 13 }) + svgText(660, 290, 'กิ่งข้อสงสัย (ต้องตรวจ)', { c: '#ffb3d6', s: 13, a: 'end' });
        }
        $('#mm-svg', el).innerHTML = g;
        $('#mm-n', el).textContent = `${done} / 6`;
        $('#mm-ctl', el).innerHTML = s.open >= 0 ? btns('data-mmc', ['ข้อเท็จจริง (เห็น นับ วัดได้)', 'ข้อสงสัย (เดาสาเหตุ ต้องตรวจ)'], s.ans[s.open]) : '';
        if (done === 6) { tick(el, 'all'); const right = s.ans.every((a, i) => a === P[i].f); if (right) { tick(el, 'right'); tick(el, 'map'); $('#mm-say', el).innerHTML = '<b>แผนที่ความคิดพร้อมแล้ว</b><p>กิ่งสีฟ้าเป็นหลักฐาน กิ่งสีชมพูเป็นข้อสงสัยที่ต้องหาข้อมูลเพิ่มก่อนสรุป</p>'; } else $('#mm-say', el).innerHTML = '<b>ยังมีจุดที่จัดผิด</b><p>ข้อความที่เดาสาเหตุ ต้องเป็นข้อสงสัย ลองแตะปุ่มด้านล่างเพื่อเริ่มจัดใหม่</p><div class="sim-btns"><button type="button" class="sim-b" data-mmr="1">จัดใหม่</button></div>'; }
      };
      el.addEventListener('click', e => {
        const p = e.target.closest('[data-mm]'), c = e.target.closest('[data-mmc]'), r = e.target.closest('[data-mmr]');
        if (p) { s.open = +p.dataset.mm; $('#mm-say', el).innerHTML = `<b>${esc(P[s.open].n)}</b><p>${esc(P[s.open].t)}</p>`; tone(520, 60); draw(); }
        if (c && s.open >= 0) { s.ans[s.open] = +c.dataset.mmc; s.open = -1; tone(660, 60); draw(); }
        if (r) { s.ans = P.map(() => null); s.open = -1; draw(); }
      });
      draw();
    }
  };

  defs['DT-M2-C01-M03'] = {
    title: 'ประกอบกรอบของปัญหาด้วย 5W1H', sub: 'เลือกคำตอบของแต่ละคำถามจากหลักฐานที่สำรวจได้ กรอบของปัญหาด้านขวาจะประกอบขึ้นตามคำตอบของคุณ',
    mount(el) {
      const Q = [
        { k: 'What', o: ['รอคืนแก้วนานและแถวบังทางเดิน', 'อยากได้ชั้นวางสีฟ้า'], a: 0 },
        { k: 'Who', o: ['ทุกคนในประเทศ', 'นักเรียนที่คืนแก้วและคนเก็บแก้ว'], a: 1 },
        { k: 'Why', o: ['ทุกคนคืนที่ช่องเดียว (จากการจับเวลา)', 'เพราะนักเรียนขี้เกียจ'], a: 0 },
        { k: 'When', o: ['ทุกเวลา', 'ช่วงพักกลางวัน 12.00–12.30 น.'], a: 1 },
        { k: 'Where', o: ['จุดคืนแก้วข้างผนังโรงอาหาร', 'สนามฟุตบอล'], a: 0 },
        { k: 'How', o: ['ให้ดูทันสมัย', 'คืนเสร็จใน 30 วินาที ใช้พื้นที่ไม่เกิน 60 × 40 ซม.'], a: 1 }];
      const s = Q.map(() => null);
      el.innerHTML = frame(this.title, this.sub, `<div id="w5-st"></div>`, `<div class="sim-read" id="w5-say"></div>`,
        goal(el, 'all', 'ตอบครบทั้ง 6 คำถาม') + goal(el, 'right', 'ทุกคำตอบมาจากหลักฐาน ไม่เดา') + goal(el, 'frame', 'ได้กรอบของปัญหาที่บอกเป้าหมายและเงื่อนไข'));
      const draw = () => {
        $('#w5-st', el).innerHTML = `<table class="sim-tbl"><thead><tr><th>คำถาม</th><th>เลือกคำตอบ</th></tr></thead><tbody>${Q.map((q, i) => `<tr><td><b>${q.k}</b></td><td>${btns('data-w5="' + i + '" data-w5o', q.o, s[i])}</td></tr>`).join('')}</tbody></table>`;
        const all = s.every(x => x != null), right = s.every((x, i) => x === Q[i].a);
        const pick = i => s[i] == null ? '…' : Q[i].o[s[i]];
        $('#w5-say', el).innerHTML = `<b>กรอบของปัญหา</b><p>ต้องการหาวิธีแก้ปัญหา "${esc(pick(0))}" ของ${esc(pick(1))} ซึ่งเกิด${esc(pick(3))} ที่${esc(pick(4))} สาเหตุ: ${esc(pick(2))} · เป้าหมาย: ${esc(pick(5))}</p>${all && !right ? '<p style="color:#ff9d9d">ยังมีคำตอบที่ไม่ได้มาจากหลักฐาน หรือไม่ใช่เป้าหมายที่วัดได้</p>' : ''}`;
        if (all) tick(el, 'all'); if (all && right) { tick(el, 'right'); tick(el, 'frame'); }
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-w5o]'); if (!b) return; s[+b.dataset.w5] = +b.dataset.w5o; tone(600, 50); draw(); });
      draw();
    }
  };

  defs['DT-M2-C01-M02'] = {
    title: 'เลือกแหล่งข้อมูลให้น่าเชื่อถือและหลากหลาย', sub: 'ต้องการข้อมูลเพื่อหาวิธีลดเวลาคืนแก้ว แตะเลือกแหล่งข้อมูลที่จะใช้ ระบบจะบอกความน่าเชื่อถือและศาสตร์ที่ได้',
    mount(el) {
      const S = [
        { n: 'ตารางนับแก้ว 3 วัน (มีวันเวลา)', r: 3, f: 'ข้อมูลจริงในพื้นที่' },
        { n: 'สัมภาษณ์คนเก็บแก้วและนักเรียน', r: 3, f: 'ผู้ใช้' },
        { n: 'หนังสือการจัดพื้นที่ในห้องสมุด', r: 3, f: 'การออกแบบพื้นที่' },
        { n: 'ถามครูวิทยาศาสตร์เรื่องการระบายน้ำจากแก้ว', r: 3, f: 'วิทยาศาสตร์' },
        { n: 'ข้อความในแชตว่า "น่าจะร้อยใบ"', r: 0, f: '—' },
        { n: 'เว็บขายชั้นวางที่บอกว่า "ดีที่สุด"', r: 1, f: 'โฆษณา' }];
      const on = S.map(() => false);
      el.innerHTML = frame(this.title, this.sub, `<div class="sim-btns" id="sr-b">${S.map((x, i) => `<button type="button" class="sim-b" data-sr="${i}">${esc(x.n)}</button>`).join('')}</div>`,
        `<div class="sim-meter"><span>ความน่าเชื่อถือ</span><b id="sr-m">–</b></div><div class="sim-checks" id="sr-c"></div>`,
        goal(el, 'three', 'ใช้แหล่งที่ตรวจที่มาได้อย่างน้อย 3 แหล่ง') + goal(el, 'clean', 'ไม่มีแหล่งที่ตรวจที่มาไม่ได้หรือเป็นโฆษณา') + goal(el, 'multi', 'ได้ข้อมูลจากผู้ใช้และจากความรู้อย่างน้อย 1 ศาสตร์'));
      const draw = () => {
        $$('[data-sr]', el).forEach(b => b.classList.toggle('on', on[+b.dataset.sr]));
        const sel = S.filter((_, i) => on[i]), good = sel.filter(x => x.r >= 3).length, bad = sel.filter(x => x.r < 3).length;
        $('#sr-m', el).textContent = sel.length ? Math.round(sel.reduce((a, x) => a + x.r, 0) / sel.length / 3 * 100) + '%' : '–';
        const user = on[1], sci = on[2] || on[3];
        $('#sr-c', el).innerHTML = row(good >= 3, `แหล่งที่ตรวจที่มาได้ ${good} แหล่ง`) + row(!bad, bad ? `มีแหล่งที่ไม่น่าเชื่อถือ ${bad} แหล่ง` : 'ไม่มีแหล่งที่ไม่น่าเชื่อถือ') + row(user && sci, 'มีทั้งข้อมูลจากผู้ใช้และความรู้จากศาสตร์ต่าง ๆ');
        if (good >= 3) tick(el, 'three'); if (good >= 3 && !bad) tick(el, 'clean'); if (user && sci && !bad) tick(el, 'multi');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-sr]'); if (!b) return; const i = +b.dataset.sr; on[i] = !on[i]; tone(on[i] ? 640 : 380, 50); draw(); });
      draw();
    }
  };

  /* ---------- บท 2 ---------- */
  defs['DT-M2-C02-M01'] = {
    title: 'ทรัพยากร 7 ด้าน: อุปกรณ์บีบอัดขยะของนนท์', sub: 'ปรับทรัพยากรที่กลุ่มของคุณมี แล้วดูว่าแนวทางใดทำได้จริง (ตัวอย่างจากหนังสือเรียน ข้อมูลตัวเลขสมมติ)',
    mount(el) {
      const O = [
        { n: 'คาน (ใช้แรงคน)', skill: 1, tool: 1, cost: 300, days: 3, power: 'แรงคน' },
        { n: 'กลไก scissors + เซนเซอร์ + โซลาร์เซลล์', skill: 2, tool: 2, cost: 1800, days: 7, power: 'แสงอาทิตย์' },
        { n: 'ระบบไฮดรอลิก', skill: 3, tool: 3, cost: 5000, days: 20, power: 'ไฟฟ้า' }];
      const s = { skill: 1, tool: 1, cost: 1000, days: 10 };
      const lv = ['', 'พื้นฐาน', 'ปานกลาง', 'สูง'];
      el.innerHTML = frame(this.title, this.sub, `<div id="rs-st"></div>`,
        `<label class="sim-rg">ความรู้และทักษะของคน <b id="rs-sk">พื้นฐาน</b><input type="range" data-rs="skill" min="1" max="3" value="1"></label><label class="sim-rg">เครื่องมือที่มี <b id="rs-tl">พื้นฐาน</b><input type="range" data-rs="tool" min="1" max="3" value="1"></label><label class="sim-rg">ทุน <b id="rs-cs">1000</b> บาท<input type="range" data-rs="cost" min="200" max="6000" step="100" value="1000"></label><label class="sim-rg">เวลา <b id="rs-dy">10</b> วัน<input type="range" data-rs="days" min="2" max="30" value="10"></label>`,
        goal(el, 'one', 'หาเงื่อนไขที่มีแนวทางทำได้อย่างน้อย 1 แบบ') + goal(el, 'two', 'ปรับทรัพยากรจนทำแบบ scissors + โซลาร์เซลล์ได้') + goal(el, 'none', 'ลองลดทรัพยากรจนไม่มีแนวทางใดทำได้เลย'));
      const draw = () => {
        const can = O.map(o => ({ o, f: [['คน', s.skill >= o.skill], ['เครื่องมือ', s.tool >= o.tool], ['ทุน', s.cost >= o.cost], ['เวลา', s.days >= o.days]] }));
        $('#rs-st', el).innerHTML = can.map(c => { const ok = c.f.every(x => x[1]); return `<div class="dm-row ${ok ? 'win' : 'bad'}"><div class="dm-n" style="--c:${ok ? '#26b8a0' : '#ff3d94'}">${esc(c.o.n)}</div><p>ต้องใช้: คนทักษะ${lv[c.o.skill]} · เครื่องมือ${lv[c.o.tool]} · ทุน ${c.o.cost} บาท · เวลา ${c.o.days} วัน · พลังงาน${esc(c.o.power)}</p><p class="${ok ? '' : 'no'}">${ok ? '✓ ทำได้ด้วยทรัพยากรที่มี' : '✗ ขาด: ' + c.f.filter(x => !x[1]).map(x => x[0]).join(' ')}</p></div>`; }).join('');
        const n = can.filter(c => c.f.every(x => x[1])).length;
        if (n >= 1) tick(el, 'one'); if (can[1].f.every(x => x[1])) tick(el, 'two'); if (n === 0) tick(el, 'none');
      };
      el.addEventListener('input', e => { const k = e.target.dataset.rs; if (!k) return; s[k] = +e.target.value; $('#rs-sk', el).textContent = lv[s.skill]; $('#rs-tl', el).textContent = lv[s.tool]; $('#rs-cs', el).textContent = s.cost; $('#rs-dy', el).textContent = s.days; draw(); });
      draw();
    }
  };

  defs['DT-M2-C02-M04'] = {
    title: 'ออกแบบกระเป๋าผ้าให้ตรงใจลูกค้า', sub: 'ดัดแปลงจากเกม Design Customer\'s Bag ของ สสวท. อ่านการ์ดลูกค้า แล้วเลือกทรง ผ้า สี และส่วนเสริมให้ผ่านหลักการออกแบบทุกข้อ',
    mount(el) {
      const C = { name: 'ลูกค้า: น้องฝน', need: 'ใส่หนังสือเรียนหนัก ๆ เดินฝ่าฝนไปโรงเรียน ชอบสีโทนเย็น อยากได้ช่องใส่ปากกาด้านใน งบ 250 บาท' };
      const SH = [['ทรงธรรมดา', 40], ['ทรงฐานขยาย (ใส่ของหนาได้)', 70], ['ทรงกล่อง', 80]];
      const FA = [['ผ้าฝ้าย · รับน้ำหนักน้อย · ไม่กันน้ำ', 40, 0, 0], ['ผ้าแคนวาส · รับน้ำหนักมาก · ไม่กันน้ำ', 90, 1, 0], ['ผ้าร่มเคลือบ · รับน้ำหนักมาก · กันน้ำ', 120, 1, 1]];
      const CO = [['โทนร้อน (แดง ส้ม)', 0], ['โทนเย็น (ฟ้า เขียว)', 1]];
      const AD = [['กระดุมแม่เหล็ก', 20], ['ช่องกระเป๋าด้านใน', 25], ['ผ้าซับใน', 30]];
      const s = { sh: 0, fa: 0, co: 0, ad: 0 };
      el.innerHTML = frame(this.title, this.sub, `<div class="sim-read"><b>${C.name}</b><p>${C.need}</p></div><div id="bg-c"></div>`,
        `<div class="sim-meter"><span>ราคารวม</span><b id="bg-p">0</b></div><div class="sim-checks" id="bg-k"></div>`,
        goal(el, 'func', 'หน้าที่ใช้สอยและวัสดุ: รับน้ำหนักมากและกันน้ำ') + goal(el, 'look', 'ความสวยงามและส่วนเสริมตรงใจลูกค้า') + goal(el, 'all', 'ผ่านหลักการออกแบบทุกข้อและไม่เกินงบ'));
      const draw = () => {
        $('#bg-c', el).innerHTML = `<p><b>ทรงกระเป๋า</b></p>${btns('data-bg="sh" data-bgv', SH.map(x => x[0] + ' · ' + x[1] + ' บาท'), s.sh)}<p><b>ชนิดผ้า</b></p>${btns('data-bg="fa" data-bgv', FA.map(x => x[0] + ' · ' + x[1] + ' บาท'), s.fa)}<p><b>โทนสี</b></p>${btns('data-bg="co" data-bgv', CO.map(x => x[0]), s.co)}<p><b>ส่วนเสริม</b></p>${btns('data-bg="ad" data-bgv', AD.map(x => x[0] + ' · ' + x[1] + ' บาท'), s.ad)}`;
        const price = SH[s.sh][1] + FA[s.fa][1] + AD[s.ad][1], strong = FA[s.fa][2] && s.sh >= 1, wet = FA[s.fa][3], cool = CO[s.co][1] === 1, pocket = s.ad === 1, cheap = price <= 250;
        $('#bg-p', el).textContent = price + ' บาท';
        $('#bg-k', el).innerHTML = row(strong, 'หน้าที่ใช้สอย: ทรงและผ้ารับหนังสือหนักได้') + row(wet, 'วัสดุ: กันน้ำเมื่อเดินฝ่าฝน') + row(cool, 'ความสวยงาม: สีโทนเย็นตามที่ลูกค้าชอบ') + row(pocket, 'ส่วนเสริม: มีช่องใส่ปากกาด้านใน') + row(cheap, `ราคา: ${price} บาท (งบ 250 บาท)`);
        if (strong && wet) tick(el, 'func'); if (cool && pocket) tick(el, 'look'); if (strong && wet && cool && pocket && cheap) tick(el, 'all');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-bgv]'); if (!b) return; s[b.dataset.bg] = +b.dataset.bgv; tone(560, 50); draw(); });
      draw();
    }
  };

  defs['DT-M2-C02-M02'] = {
    title: 'ภาพฉาย 3 ด้านของชั้นวางแก้ว', sub: 'ปรับขนาดชั้นวาง แล้วสลับดูภาพด้านบน ด้านหน้า และด้านข้าง สังเกตว่าแต่ละภาพเห็นขนาดใดบ้าง',
    mount(el) {
      const s = { W: 40, D: 30, H: 50, t: 1, v: 0, seen: new Set() };
      const V = ['ภาพด้านบน', 'ภาพด้านหน้า', 'ภาพด้านข้าง'];
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 320" id="pv-svg" role="img" aria-label="ภาพฉายของชั้นวาง"></svg>`,
        `${btns('data-pv', V, 0)}<label class="sim-rg">กว้างด้านนอก <b id="pv-w">40</b> ซม.<input type="range" data-pvr="W" min="30" max="60" value="40"></label><label class="sim-rg">ลึก <b id="pv-d">30</b> ซม.<input type="range" data-pvr="D" min="20" max="40" value="30"></label><label class="sim-rg">สูง <b id="pv-h">50</b> ซม.<input type="range" data-pvr="H" min="30" max="80" value="50"></label><div class="sim-checks" id="pv-k"></div>`,
        goal(el, 'views', 'ดูครบทั้ง 3 ภาพฉาย') + goal(el, 'tray', 'ช่องด้านในกว้างพอใส่ถาด 39 ซม. (ผนังหนาข้างละ 1 ซม.)') + goal(el, 'space', 'ชั้นกว้างไม่เกิน 42 ซม. และลึกไม่เกิน 30 ซม.'));
      const draw = () => {
        s.seen.add(s.v); const K = 4.2, x0 = 340, y0 = 170;
        const [a, b, la, lb] = s.v === 0 ? [s.W, s.D, 'กว้าง', 'ลึก'] : s.v === 1 ? [s.W, s.H, 'กว้าง', 'สูง'] : [s.D, s.H, 'ลึก', 'สูง'];
        const w = a * K, hh = b * K, x = x0 - w / 2, y = y0 - hh / 2;
        let g = `<rect width="680" height="320" rx="14" fill="${BG}"/>${svgText(20, 30, V[s.v], { s: 18, c: '#ffd23f' })}<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#3aa0ff33" stroke="#9fd4ff" stroke-width="3"/>`;
        if (s.v !== 2) g += `<rect x="${x + s.t * K}" y="${y + s.t * K}" width="${w - 2 * s.t * K}" height="${hh - 2 * s.t * K}" fill="none" stroke="#9fd4ff" stroke-dasharray="6 4"/>`;
        if (s.v === 1) for (let i = 1; i < 3; i++) g += `<line x1="${x}" y1="${y + hh * i / 3}" x2="${x + w}" y2="${y + hh * i / 3}" stroke="#9fd4ff" stroke-width="2"/>`;
        g += `<line x1="${x}" y1="${y + hh + 18}" x2="${x + w}" y2="${y + hh + 18}" stroke="#ffd23f" stroke-width="2"/>${svgText(x0, y + hh + 38, `${la} ${a} ซม.`, { a: 'middle', c: '#ffd23f' })}<line x1="${x - 18}" y1="${y}" x2="${x - 18}" y2="${y + hh}" stroke="#ffd23f" stroke-width="2"/>${svgText(x - 26, y0, `${lb} ${b} ซม.`, { a: 'end', c: '#ffd23f' })}`;
        $('#pv-svg', el).innerHTML = g; $$('[data-pv]', el).forEach(bt => bt.classList.toggle('on', +bt.dataset.pv === s.v));
        const inner = s.W - 2 * s.t, okT = inner >= 39, okS = s.W <= 42 && s.D <= 30;
        $('#pv-k', el).innerHTML = row(okT, `ช่องด้านใน ${inner} ซม. (ถาด 39 ซม.)`) + row(okS, `ขนาด ${s.W} × ${s.D} ซม. (ไม่เกิน 42 × 30)`) + `<div class="verdict ${s.v === 0 ? 'ok' : 'no'}">${V[s.v]} เห็น ${la} กับ ${lb}</div>`;
        if (s.seen.size === 3) tick(el, 'views'); if (okT) tick(el, 'tray'); if (okT && okS) tick(el, 'space');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-pv]'); if (!b) return; s.v = +b.dataset.pv; tone(500 + s.v * 80, 50); draw(); });
      el.addEventListener('input', e => { const k = e.target.dataset.pvr; if (!k) return; s[k] = +e.target.value; $('#pv-' + k.toLowerCase(), el).textContent = s[k]; draw(); });
      draw();
    }
  };

  defs['DT-M2-C02-M03'] = {
    title: 'เลือกแบบจำลองให้ตรงคำถาม', sub: 'แต่ละคำถามต้องใช้แบบจำลองต่างชนิดกัน เลือกให้ตรง แล้วดูว่าแบบจำลองนั้นพิสูจน์อะไรได้',
    mount(el) {
      const T = ['แบบจำลองแสดงรูปร่าง', 'แบบจำลองการทำงาน', 'แบบจำลองเพื่อการทดสอบ', 'แบบจำลองทางคอมพิวเตอร์'];
      const Q = [{ q: 'ชั้นวางมีสัดส่วนสวยและวางในพื้นที่ได้หรือไม่', a: 0, why: 'โมเดลกระดาษย่อส่วนแสดงรูปร่างและสัดส่วนได้' }, { q: 'กลไกคานบีบขวดได้จริงหรือไม่', a: 1, why: 'ต้องสร้างกลไกที่ขยับได้เพื่อดูการทำงาน' }, { q: 'ชั้นรับแก้ว 30 ใบได้โดยไม่โก่งหรือไม่', a: 2, why: 'ต้องทดสอบกับวัสดุจริงและน้ำหนักจริง' }, { q: 'ถ้าย้ายจุดคืนแก้ว คนจะเดินชนกันน้อยลงไหม', a: 3, why: 'จำลองการเดินของคนจำนวนมากในคอมพิวเตอร์ได้รวดเร็ว' }];
      const s = Q.map(() => null);
      el.innerHTML = frame(this.title, this.sub, `<div id="md-st"></div>`, `<div class="sim-meter"><span>เลือกถูก</span><b id="md-n">0 / 4</b></div>`,
        goal(el, 'two', 'เลือกถูกอย่างน้อย 2 คำถาม') + goal(el, 'all', 'เลือกถูกครบทั้ง 4 คำถาม') + goal(el, 'strength', 'รู้ว่าคำถามเรื่องความแข็งแรงต้องใช้การทดสอบ ไม่ใช่โมเดลกระดาษ'));
      const draw = () => {
        $('#md-st', el).innerHTML = Q.map((q, i) => `<div class="dm-row ${s[i] == null ? '' : s[i] === q.a ? 'win' : 'bad'}"><div class="dm-n" style="--c:#3aa0ff">${i + 1}. ${esc(q.q)}</div>${btns('data-md="' + i + '" data-mdv', T, s[i])}${s[i] != null ? `<p class="${s[i] === q.a ? '' : 'no'}">${s[i] === q.a ? '✓ ' + esc(q.why) : '✗ ลองคิดว่าคำถามนี้ต้องการรู้เรื่องรูปร่าง การทำงาน ความแข็งแรง หรือคนจำนวนมาก'}</p>` : ''}</div>`).join('');
        const n = s.filter((x, i) => x === Q[i].a).length; $('#md-n', el).textContent = `${n} / 4`;
        if (n >= 2) tick(el, 'two'); if (n === 4) tick(el, 'all'); if (s[2] === 2) tick(el, 'strength');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-mdv]'); if (!b) return; s[+b.dataset.md] = +b.dataset.mdv; tone(560, 50); draw(); });
      draw();
    }
  };

  /* ---------- บท 3 ---------- */
  defs['DT-M2-C03-M01'] = {
    title: 'จัดแผนงานให้ทันเวลา 120 นาที', sub: 'ปรับเวลาของแต่ละงานตามที่ประเมิน แผนภูมิแกนต์จะเรียงงานตามลำดับที่ต้องรอกัน ต้องเหลือเวลาทดสอบอย่างน้อย 15 นาที',
    mount(el) {
      const J = [['วัด', 15, '#3aa0ff'], ['ร่างแบบ', 15, '#6c63ff'], ['เตรียมวัสดุ', 30, '#26b8a0'], ['ประกอบ', 40, '#ffd23f'], ['ทดสอบ', 10, '#ff3d94'], ['ปรับ', 10, '#ff9d3a']];
      const s = J.map(j => j[1]);
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 270" id="gt-svg" role="img" aria-label="แผนภูมิแกนต์"></svg>`,
        `${J.map((j, i) => `<label class="sim-rg">${j[0]} <b id="gt-v${i}">${j[1]}</b> นาที<input type="range" data-gt="${i}" min="5" max="50" step="5" value="${j[1]}"></label>`).join('')}<div class="sim-checks" id="gt-k"></div>`,
        goal(el, 'fit', 'รวมทุกงานไม่เกิน 120 นาที') + goal(el, 'test', 'มีเวลาทดสอบอย่างน้อย 15 นาที') + goal(el, 'both', 'ทันเวลาและยังมีเวลาปรับอย่างน้อย 10 นาที'));
      const draw = () => {
        const K = 4.6; let t = 0, g = `<rect width="680" height="270" rx="14" fill="${BG}"/><line x1="${110 + 120 * K}" y1="10" x2="${110 + 120 * K}" y2="250" stroke="#ff3d54" stroke-width="3" stroke-dasharray="8 6"/>${svgText(110 + 120 * K - 4, 22, '120 นาที', { a: 'end', c: '#ff9d9d', s: 12 })}`;
        J.forEach((j, i) => { const y = 30 + i * 36; g += svgText(14, y + 19, j[0], { s: 13 }) + `<rect x="${110 + t * K}" y="${y}" width="${s[i] * K}" height="26" rx="5" fill="${j[2]}"/>` + svgText(110 + t * K + 6, y + 18, s[i] + '′', { s: 12, c: INK }); t += s[i]; });
        $('#gt-svg', el).innerHTML = g;
        const fit = t <= 120, test = s[4] >= 15, adj = s[5] >= 10;
        $('#gt-k', el).innerHTML = row(fit, `รวม ${t} นาที`) + row(test, `ทดสอบ ${s[4]} นาที (ต้องได้อย่างน้อย 15)`) + row(adj, `ปรับ ${s[5]} นาที (ต้องได้อย่างน้อย 10)`) + `<div class="verdict ${fit && test && adj ? 'ok' : 'no'}">${fit && test && adj ? 'แผนนี้ทำได้ทันเวลา' : t > 120 ? 'เกินเวลา ลดขอบเขตงานอื่นแทนการตัดเวลาทดสอบ' : 'ยังขาดเวลาทดสอบหรือปรับ'}</div>`;
        if (fit) tick(el, 'fit'); if (test) tick(el, 'test'); if (fit && test && adj) tick(el, 'both');
      };
      el.addEventListener('input', e => { const k = e.target.dataset.gt; if (k == null) return; s[+k] = +e.target.value; $('#gt-v' + k, el).textContent = s[+k]; draw(); });
      draw();
    }
  };

  defs['DT-M2-C03-M04'] = {
    title: 'คานบีบขวดกับการทำงานอย่างปลอดภัย', sub: 'อุปกรณ์บีบอัดขยะของนนท์ใช้หลักคาน ปรับตำแหน่งจุดหมุนให้ใช้แรงน้อย แล้วเตรียมอุปกรณ์ป้องกันก่อนลงมือ',
    mount(el) {
      const s = { e: 20, l: 20, safe: [false, false, false] }, LOAD = 200;
      const SF = ['สวมแว่นตานิรภัยเมื่อเจาะไม้', 'ตัดบนแผ่นรองตัด ตัดออกจากตัว', 'วางปืนกาวร้อนบนขาตั้ง'];
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 260" id="lv-svg" role="img" aria-label="คานบีบขวด"></svg>`,
        `<label class="sim-rg">ระยะจากจุดหมุนถึงมือ (แขนความพยายาม) <b id="lv-e">20</b> ซม.<input type="range" data-lv="e" min="10" max="80" step="5" value="20"></label><label class="sim-rg">ระยะจากจุดหมุนถึงขวด (แขนความต้านทาน) <b id="lv-l">20</b> ซม.<input type="range" data-lv="l" min="5" max="40" step="5" value="20"></label><div class="sim-meter"><span>แรงที่มือต้องใช้</span><b id="lv-f">200 N</b></div>${btns('data-sf', SF, -1)}<div class="sim-checks" id="lv-k"></div>`,
        goal(el, 'force', 'บีบขวด (ต้องใช้แรง 200 นิวตัน) โดยใช้แรงมือไม่เกิน 50 นิวตัน') + goal(el, 'safe', 'เตรียมความปลอดภัยครบ 3 ข้อ') + goal(el, 'both', 'คานใช้แรงน้อยและพร้อมลงมือสร้างอย่างปลอดภัย'));
      const draw = () => {
        const F = LOAD * s.l / s.e, K = 6, px = 200, base = 170;
        let g = `<rect width="680" height="260" rx="14" fill="${BG}"/><polygon points="${px - 16},${base + 34} ${px + 16},${base + 34} ${px},${base + 6}" fill="#ffd23f"/><rect x="${px - s.l * K}" y="${base - 6}" width="${(s.l + s.e) * K}" height="12" rx="4" fill="#c9d6e3"/>`;
        g += `<rect x="${px - s.l * K - 18}" y="${base + 6}" width="36" height="${48 - Math.min(30, 30 * 50 / F)}" fill="#7fe0ff" stroke="#fff"/>${svgText(px - s.l * K, base + 76, 'ขวด', { a: 'middle', s: 13 })}`;
        g += `<line x1="${px + s.e * K}" y1="${base - 70}" x2="${px + s.e * K}" y2="${base - 10}" stroke="#ff3d94" stroke-width="${2 + Math.min(10, F / 20)}"/><polygon points="${px + s.e * K - 9},${base - 22} ${px + s.e * K + 9},${base - 22} ${px + s.e * K},${base - 8}" fill="#ff3d94"/>${svgText(px + s.e * K, base - 80, `มือ ${fmt(F, 0)} N`, { a: 'middle', c: '#ffb3d6' })}`;
        g += svgText(px, base + 56, 'จุดหมุน', { a: 'middle', s: 12, c: '#ffd23f' });
        $('#lv-svg', el).innerHTML = g; $('#lv-f', el).textContent = fmt(F, 0) + ' N';
        $$('[data-sf]', el).forEach(b => b.classList.toggle('on', s.safe[+b.dataset.sf]));
        const okF = F <= 50, okS = s.safe.every(Boolean);
        $('#lv-k', el).innerHTML = row(okF, `แรงมือ ${fmt(F, 0)} นิวตัน = 200 × ${s.l} ÷ ${s.e}`) + row(okS, `ความปลอดภัย ${s.safe.filter(Boolean).length}/3 ข้อ`);
        if (okF) tick(el, 'force'); if (okS) tick(el, 'safe'); if (okF && okS) tick(el, 'both');
      };
      el.addEventListener('input', e => { const k = e.target.dataset.lv; if (!k) return; s[k] = +e.target.value; $('#lv-' + k, el).textContent = s[k]; draw(); });
      el.addEventListener('click', e => { const b = e.target.closest('[data-sf]'); if (!b) return; const i = +b.dataset.sf; s.safe[i] = !s.safe[i]; tone(s.safe[i] ? 700 : 400, 50); draw(); });
      draw();
    }
  };

  defs['DT-M2-C03-M02'] = {
    title: 'ทดสอบอย่างยุติธรรม 3 รอบ', sub: 'ทดสอบว่าป้ายใหม่ช่วยให้คืนแก้วเร็วขึ้นหรือไม่ เลือกว่าจะเปลี่ยนอะไรบ้าง แล้วกดทดสอบ ระบบจะบอกว่าผลเชื่อถือได้หรือไม่',
    mount(el) {
      const V = ['เปลี่ยนป้าย (สิ่งที่อยากรู้)', 'เปลี่ยนจำนวนคน 10 › 5', 'เปลี่ยนจุดเริ่มจับเวลา'];
      const s = { v: [true, false, false], rows: [] };
      el.innerHTML = frame(this.title, this.sub, `<table class="sim-tbl" id="ft-t"><thead><tr><th>รอบ</th><th>สิ่งที่เปลี่ยน</th><th>เวลา (วินาที)</th><th>เกณฑ์ ≤ 50</th></tr></thead><tbody></tbody></table><div class="sim-read" id="ft-say"></div>`,
        `${btns('data-ft', V, -1)}<div class="sim-btns"><button type="button" class="sim-b big" data-ftr="1">▶ ทดสอบ 1 รอบ</button><button type="button" class="sim-b" data-ftc="1">ล้างตาราง</button></div>`,
        goal(el, 'unfair', 'ลองทดสอบแบบเปลี่ยนหลายอย่าง แล้วดูว่าผลเชื่อถือไม่ได้') + goal(el, 'fair', 'ทดสอบแบบเปลี่ยนเฉพาะป้ายครบ 3 รอบ') + goal(el, 'fail', 'บันทึกรอบที่ไม่ผ่านไว้ด้วย ไม่ตัดทิ้ง'));
      const draw = () => {
        $$('[data-ft]', el).forEach(b => b.classList.toggle('on', s.v[+b.dataset.ft]));
        $('#ft-t tbody', el).innerHTML = s.rows.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.c)}</td><td>${r.t}</td><td>${r.t <= 50 ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}</td></tr>`).join('');
        const fair = s.rows.filter(r => r.fair), allFair = s.rows.length && s.rows.every(r => r.fair);
        $('#ft-say', el).innerHTML = !s.rows.length ? '<b>ยังไม่ได้ทดสอบ</b><p>เลือกสิ่งที่จะเปลี่ยน แล้วกดทดสอบ</p>' : allFair ? `<b>เทียบได้ยุติธรรม</b><p>เปลี่ยนเฉพาะป้าย ค่าเฉลี่ย ${fmt(fair.reduce((a, r) => a + r.t, 0) / fair.length, 1)} วินาที</p>` : '<b>ผลนี้เชื่อถือไม่ได้</b><p>เปลี่ยนมากกว่า 1 อย่าง จึงแยกไม่ได้ว่าเร็วขึ้นเพราะป้ายหรือเพราะอย่างอื่น</p>';
        if (s.rows.some(r => !r.fair)) tick(el, 'unfair'); if (fair.length >= 3 && allFair) tick(el, 'fair'); if (fair.length >= 3 && fair.some(r => r.t > 50)) tick(el, 'fail');
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-ft]'); if (b) { const i = +b.dataset.ft; s.v[i] = !s.v[i]; draw(); return; }
        if (e.target.closest('[data-ftc]')) { s.rows = []; draw(); return; }
        if (e.target.closest('[data-ftr]')) {
          const fair = s.v[0] && !s.v[1] && !s.v[2], n = s.rows.length;
          const base = fair ? [44, 52, 42, 46, 48][n % 5] : [31, 58, 36][n % 3];
          s.rows.push({ t: base, fair, c: V.filter((_, i) => s.v[i]).map(x => x.split(' (')[0]).join(' + ') || 'ไม่เปลี่ยนอะไร' }); tone(fair ? 700 : 300, 80); draw();
        }
      });
      draw();
    }
  };

  defs['DT-M2-C03-M03'] = {
    title: 'เลือกรูปแบบการนำเสนอให้เหมาะกับผู้ฟัง', sub: 'แต่ละสถานการณ์มีผู้ฟังและเวลาต่างกัน เลือกรูปแบบที่เหมาะ แล้วตรวจว่าเนื้อหาครบตั้งแต่ปัญหาถึงผลทดสอบ',
    mount(el) {
      const F = ['โปสเตอร์และนิทรรศการพร้อมต้นแบบ', 'โปรแกรมนำเสนองานหน้าชั้น', 'คลิปสั้นทางสื่อออนไลน์', 'รายงานเล่ม'];
      const SC = [{ q: 'วันวิชาการ ผู้ปกครองเดินชมทีละหลายคน', a: 0 }, { q: 'นำเสนอครูและเพื่อนในคาบ 10 นาที', a: 1 }, { q: 'เล่าให้นักเรียนทั้งโรงเรียนรู้วิธีคืนแก้วใหม่', a: 2 }];
      const PARTS = ['ปัญหาและกรอบของปัญหา', 'แนวทางที่เลือกและเหตุผล', 'แบบและแบบจำลอง', 'ผลทดสอบทุกรอบ', 'ปัญหาอุปสรรคและสิ่งที่จะปรับ'];
      const s = { sc: SC.map(() => null), parts: PARTS.map(() => false) };
      el.innerHTML = frame(this.title, this.sub, `<div id="pr-st"></div>`, `<p><b>หัวข้อที่จะนำเสนอ</b></p><div class="sim-btns">${PARTS.map((p, i) => `<button type="button" class="sim-b" data-prp="${i}">${esc(p)}</button>`).join('')}</div><div class="sim-checks" id="pr-k"></div>`,
        goal(el, 'fmt', 'เลือกรูปแบบเหมาะกับผู้ฟังครบ 3 สถานการณ์') + goal(el, 'parts', 'หัวข้อนำเสนอครบทั้ง 5 ส่วน') + goal(el, 'all', 'พร้อมนำเสนอทุกสถานการณ์'));
      const draw = () => {
        $('#pr-st', el).innerHTML = SC.map((x, i) => `<div class="dm-row ${s.sc[i] == null ? '' : s.sc[i] === x.a ? 'win' : 'bad'}"><div class="dm-n" style="--c:#ffd23f">${esc(x.q)}</div>${btns('data-prs="' + i + '" data-prv', F, s.sc[i])}</div>`).join('');
        $$('[data-prp]', el).forEach(b => b.classList.toggle('on', s.parts[+b.dataset.prp]));
        const f = s.sc.every((x, i) => x === SC[i].a), p = s.parts.every(Boolean);
        $('#pr-k', el).innerHTML = row(f, 'รูปแบบเหมาะกับผู้ฟังและสถานการณ์') + row(p, `หัวข้อ ${s.parts.filter(Boolean).length}/5 ส่วน`);
        if (f) tick(el, 'fmt'); if (p) tick(el, 'parts'); if (f && p) tick(el, 'all');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-prv]'); if (b) { s.sc[+b.dataset.prs] = +b.dataset.prv; draw(); return; } const q = e.target.closest('[data-prp]'); if (q) { const i = +q.dataset.prp; s.parts[i] = !s.parts[i]; tone(600, 40); draw(); } });
      draw();
    }
  };

  /* ---------- บท 4 ---------- */
  defs['DT-M2-C04-M03'] = {
    title: 'เส้นเวลาเทคโนโลยีการจัดการขยะ', sub: 'เลื่อนไปทีละช่วงเวลา อ่านว่าเกิดอะไรขึ้น แล้วเลือกปัจจัยที่ทำให้เทคโนโลยีเปลี่ยน (เลือกได้มากกว่า 1 ปัจจัย)',
    mount(el) {
      const FAC = ['ความก้าวหน้าของศาสตร์', 'มนุษย์และสังคม', 'เศรษฐกิจ', 'สิ่งแวดล้อม'];
      const E = [{ n: 'เผาขยะกลางแจ้ง', t: 'ขยะน้อย คนยังไม่รู้ผลของควัน', f: [] }, { n: 'ฝังกลบ', t: 'ควันจากการเผาทำให้คนป่วย จึงเปลี่ยนมาฝังกลบ', f: [1] }, { n: 'คัดแยก รีไซเคิล ทำปุ๋ยหมัก', t: 'พื้นที่ฝังกลบเต็ม น้ำใต้ดินปนเปื้อน และขยะบางชนิดขายได้', f: [3, 2] }, { n: 'เตาเผาผลิตไฟฟ้าที่กรองควัน', t: 'มีความรู้ใหม่ในการกรองควันพิษและผลิตพลังงาน', f: [0] }];
      const s = { i: 0, pick: E.map(() => new Set()) };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 160" id="tl-svg" role="img" aria-label="เส้นเวลา"></svg><div class="sim-read" id="tl-say"></div>`,
        `<label class="sim-rg">ช่วงเวลา <b id="tl-v">1</b> / 4<input type="range" id="tl-r" min="0" max="3" value="0"></label><p><b>ปัจจัยที่ทำให้เปลี่ยนในช่วงนี้</b></p><div class="sim-btns">${FAC.map((f, i) => `<button type="button" class="sim-b" data-tlf="${i}">${f}</button>`).join('')}</div><div class="sim-checks" id="tl-k"></div>`,
        goal(el, 'see', 'ดูครบทั้ง 4 ช่วงเวลา') + goal(el, 'match', 'เลือกปัจจัยถูกครบทุกช่วงที่มีการเปลี่ยน') + goal(el, 'multi', 'พบว่าการเปลี่ยนบางครั้งมาจากหลายปัจจัยพร้อมกัน'));
      const seen = new Set();
      const draw = () => {
        seen.add(s.i); let g = `<rect width="680" height="160" rx="14" fill="${BG}"/><line x1="60" y1="80" x2="620" y2="80" stroke="#9fd4ff" stroke-width="4"/>`;
        E.forEach((x, i) => { const cx = 80 + i * 175; g += `<circle cx="${cx}" cy="80" r="${i === s.i ? 22 : 14}" fill="${i === s.i ? '#ffd23f' : seen.has(i) ? '#3aa0ff' : '#455a78'}" stroke="#fff" stroke-width="3"/>${svgText(cx, 128, x.n.slice(0, 16), { a: 'middle', s: 12 })}`; });
        $('#tl-svg', el).innerHTML = g; const x = E[s.i];
        $('#tl-say', el).innerHTML = `<b>${esc(x.n)}</b><p>${esc(x.t)}</p>`;
        $$('[data-tlf]', el).forEach(b => { b.classList.toggle('on', s.pick[s.i].has(+b.dataset.tlf)); b.disabled = s.i === 0; });
        const ok = E.every((e, i) => i === 0 || (e.f.length === s.pick[i].size && e.f.every(f => s.pick[i].has(f))));
        $('#tl-k', el).innerHTML = E.slice(1).map((e, k) => { const i = k + 1, good = e.f.length === s.pick[i].size && e.f.every(f => s.pick[i].has(f)); return row(good, `${e.n}: ${[...s.pick[i]].map(f => FAC[f]).join(' + ') || 'ยังไม่เลือก'}`); }).join('');
        if (seen.size === 4) tick(el, 'see'); if (ok) tick(el, 'match'); if (s.pick[2].size >= 2 && E[2].f.every(f => s.pick[2].has(f))) tick(el, 'multi');
      };
      el.addEventListener('input', e => { if (e.target.id !== 'tl-r') return; s.i = +e.target.value; $('#tl-v', el).textContent = s.i + 1; tone(420 + s.i * 90, 60); draw(); });
      el.addEventListener('click', e => { const b = e.target.closest('[data-tlf]'); if (!b || s.i === 0) return; const f = +b.dataset.tlf, p = s.pick[s.i]; p.has(f) ? p.delete(f) : p.add(f); draw(); });
      draw();
    }
  };

  defs['DT-M2-C04-M04'] = {
    title: 'แก้ปัญหาดินขาดอินทรียวัตถุ', sub: 'จากกิจกรรมที่ 4.1 ของ สสวท. หมู่บ้านต้องการปลูกผักขาย แต่ดินขาดอินทรียวัตถุ เลือกเทคโนโลยี แล้วดูผลกระทบต่อชีวิต สังคมเศรษฐกิจ และสิ่งแวดล้อม',
    mount(el) {
      const O = [
        { n: 'ใส่ปุ๋ยเคมีอย่างเดียว', life: 2, eco: 3, env: 1, time: 1, cost: 3, note: 'พืชโตเร็ว แต่ดินแน่นขึ้นเมื่อใช้นาน และสารอาจไหลลงแหล่งน้ำ' },
        { n: 'ทำปุ๋ยหมักจากเศษพืชและมูลสัตว์ในชุมชน', life: 3, eco: 3, env: 3, time: 3, cost: 1, note: 'เพิ่มอินทรียวัตถุ ใช้วัสดุในชุมชน แต่ต้องรอหมักประมาณ 2–3 เดือน' },
        { n: 'ปลูกพืชตระกูลถั่วแล้วไถกลบเป็นปุ๋ยพืชสด', life: 3, eco: 2, env: 3, time: 2, cost: 1, note: 'บำรุงดินได้ดี แต่ต้องเว้นการปลูกผักขาย 1 รอบ' },
        { n: 'เผาตอซังก่อนปลูก', life: 1, eco: 2, env: 1, time: 1, cost: 1, note: 'ควันทำลายสุขภาพ และทำลายจุลินทรีย์ในดิน' }];
      const s = { o: null, wait: 3, budget: 1 };
      el.innerHTML = frame(this.title, this.sub, `<div id="sl-st"></div>`,
        `<label class="sim-rg">ชุมชนรอผลได้ <b id="sl-w">3</b> เดือน<input type="range" data-sl="wait" min="1" max="6" value="3"></label><label class="sim-rg">งบของชุมชน <b id="sl-b">น้อย</b><input type="range" data-sl="budget" min="1" max="3" value="1"></label><div class="sim-checks" id="sl-k"></div>`,
        goal(el, 'look', 'ดูผลกระทบของทางเลือกอย่างน้อย 3 แบบ') + goal(el, 'best', 'เลือกเทคโนโลยีที่ผลกระทบด้านลบน้อยและอยู่ในเงื่อนไขของชุมชน') + goal(el, 'cond', 'ลองลดเวลาที่รอได้ แล้วพบว่าทางเลือกเดิมอาจไม่เหมาะอีกต่อไป'));
      const seen = new Set(), hist = {};
      const bar = (v, t) => `<div class="dm-cells"><span>${t}</span> <span>${'★'.repeat(v)}${'☆'.repeat(3 - v)}</span></div>`;
      const fits = o => o.cost <= s.budget && (o.time === 1 || (o.time === 3 ? s.wait >= 3 : s.wait >= 2));
      const draw = () => {
        $('#sl-st', el).innerHTML = O.map((o, i) => `<div class="dm-row ${s.o === i ? 'win' : ''}"><div class="dm-n" style="--c:#26b8a0"><button type="button" class="sim-b${s.o === i ? ' on' : ''}" data-slo="${i}">${esc(o.n)}</button></div>${s.o === i || seen.has(i) ? bar(o.life, 'ชีวิตและสุขภาพ') + bar(o.eco, 'สังคมและเศรษฐกิจ') + bar(o.env, 'สิ่งแวดล้อม') + `<p>${esc(o.note)}</p>` : ''}</div>`).join('');
        const o = O[s.o]; let ok = false;
        if (o) { ok = fits(o) && o.life + o.env >= 6; $('#sl-k', el).innerHTML = row(fits(o), `อยู่ในเงื่อนไขเวลาและงบของชุมชน`) + row(o.life >= 3, 'ผลต่อชีวิตและสุขภาพดี') + row(o.env >= 3, 'ผลต่อสิ่งแวดล้อมดี'); } else $('#sl-k', el).innerHTML = '';
        if (seen.size >= 3) tick(el, 'look'); if (ok) tick(el, 'best'); if (o) { const hs = hist[s.o] = hist[s.o] || new Set(); hs.add(ok); if (hs.size === 2) tick(el, 'cond'); }
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-slo]'); if (!b) return; s.o = +b.dataset.slo; seen.add(s.o); tone(560, 50); draw(); });
      el.addEventListener('input', e => { const k = e.target.dataset.sl; if (!k) return; s[k] = +e.target.value; $('#sl-w', el).textContent = s.wait; $('#sl-b', el).textContent = ['', 'น้อย', 'ปานกลาง', 'มาก'][s.budget]; draw(); });
      draw();
    }
  };

  defs['DT-M2-C04-M01'] = {
    title: 'แนวโน้มกับการคาดการณ์', sub: 'กราฟแสดงผู้ใช้จุดคืนแก้ว 3 ปีที่เก็บจริง เลือกข้อสมมติของอนาคต แล้วดูว่าเส้นคาดการณ์เปลี่ยนอย่างไร (ข้อมูลสมมติ)',
    mount(el) {
      const DATA = [20, 25, 30];
      const A = [['เพิ่มแบบเดิม ปีละ 5 คน', 5], ['เปิดห้องเรียนเพิ่ม ผู้ใช้เพิ่มเร็วขึ้น', 9], ['ย้ายโรงอาหารบางส่วน ผู้ใช้ลดลง', -4]];
      const s = { a: 0, seen: new Set([0]) };
      el.innerHTML = frame(this.title, this.sub, `<svg viewBox="0 0 680 280" id="tr-svg2" role="img" aria-label="กราฟแนวโน้ม"></svg><div class="sim-read" id="tr-say"></div>`, btns('data-tra', A.map(x => x[0]), 0),
        goal(el, 'fact', 'แยกส่วนข้อเท็จจริง (เส้นทึบ) กับส่วนคาดการณ์ (เส้นประ)') + goal(el, 'two', 'ลองข้อสมมติอย่างน้อย 2 แบบ') + goal(el, 'all', 'เห็นว่าข้อสมมติต่างกัน ทำให้การคาดการณ์ต่างกัน'));
      const draw = () => {
        const step = A[s.a][1], fut = [DATA[2] + step, DATA[2] + 2 * step], X = i => 90 + i * 120, Y = v => 240 - v * 4.2;
        let g = `<rect width="680" height="280" rx="14" fill="${BG}"/><line x1="70" y1="240" x2="660" y2="240" stroke="#9fd4ff"/><rect x="${X(2) + 10}" y="20" width="${660 - X(2) - 10}" height="220" fill="#ffffff0d"/>${svgText(X(3), 40, 'ส่วนคาดการณ์', { c: '#ffd23f', s: 13 })}${svgText(X(0), 40, 'ข้อเท็จจริงที่เก็บได้', { c: '#9fd4ff', s: 13 })}`;
        g += `<polyline points="${DATA.map((v, i) => X(i) + ',' + Y(v)).join(' ')}" fill="none" stroke="#3aa0ff" stroke-width="4"/><polyline points="${X(2)},${Y(DATA[2])} ${X(3)},${Y(fut[0])} ${X(4)},${Y(fut[1])}" fill="none" stroke="#ffd23f" stroke-width="4" stroke-dasharray="10 8"/>`;
        DATA.forEach((v, i) => { g += `<circle cx="${X(i)}" cy="${Y(v)}" r="7" fill="#3aa0ff"/>${svgText(X(i), Y(v) - 14, v, { a: 'middle' })}${svgText(X(i), 262, 'ปี ' + (i + 1), { a: 'middle', s: 12 })}`; });
        fut.forEach((v, i) => { g += `<circle cx="${X(i + 3)}" cy="${Y(v)}" r="7" fill="none" stroke="#ffd23f" stroke-width="3"/>${svgText(X(i + 3), Y(v) - 14, '≈' + v, { a: 'middle', c: '#ffd23f' })}${svgText(X(i + 3), 262, 'ปี ' + (i + 4), { a: 'middle', s: 12, c: '#ffd23f' })}`; });
        $('#tr-svg2', el).innerHTML = g; $$('[data-tra]', el).forEach(b => b.classList.toggle('on', +b.dataset.tra === s.a));
        $('#tr-say', el).innerHTML = `<b>เขียนให้ถูก:</b><p>"ถ้า${esc(A[s.a][0].split(' ')[0])}... ปีที่ 4 อาจมีผู้ใช้ประมาณ ${fut[0]} คน" ไม่ใช่ "ปีที่ 4 จะมี ${fut[0]} คนแน่นอน" เพราะยังเป็นการคาดการณ์ภายใต้ข้อสมมติ</p>`;
        tick(el, 'fact'); if (s.seen.size >= 2) tick(el, 'two'); if (s.seen.size === 3) tick(el, 'all');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-tra]'); if (!b) return; s.a = +b.dataset.tra; s.seen.add(s.a); tone(480 + s.a * 100, 60); draw(); });
      draw();
    }
  };

  defs['DT-M2-C04-M02'] = {
    title: 'สองฉากทัศน์ของจุดคืนอุปกรณ์', sub: 'ตั้งเงื่อนไขของฉาก A และฉาก B ให้ต่างกัน แล้วเลือกทางเลือกที่เหมาะกับแต่ละฉาก',
    mount(el) {
      const OPT = [{ n: 'ระบบไฟบอกช่องว่าง', power: 1, cost: 2, cap: 2 }, { n: 'ชั้นแนวตั้งหลายชั้น', power: 0, cost: 1, cap: 2 }, { n: 'ปรับลำดับคิวและเพิ่มจุดวาง', power: 0, cost: 0, cap: 1 }];
      const s = { A: { power: 1, budget: 2, users: 1, o: null }, B: { power: 0, budget: 0, users: 1, o: null } };
      const ok = (sc) => { const o = OPT[sc.o]; if (!o) return false; return (!o.power || sc.power) && o.cost <= sc.budget && o.cap >= sc.users; };
      el.innerHTML = frame(this.title, this.sub, `<div id="sc-st"></div>`, `<div class="sim-checks" id="sc-k"></div>`,
        goal(el, 'diff', 'สองฉากต่างกันที่เงื่อนไข (ไฟฟ้า งบ หรือผู้ใช้)') + goal(el, 'fitA', 'เลือกทางเลือกที่เหมาะกับฉาก A') + goal(el, 'fitB', 'เลือกทางเลือกที่เหมาะกับฉาก B'));
      const pane = (k) => { const sc = s[k]; return `<div class="dm-row ${ok(sc) ? 'win' : sc.o != null ? 'bad' : ''}"><div class="dm-n" style="--c:${k === 'A' ? '#3aa0ff' : '#ff3d94'}">ฉาก ${k}</div>
        ${btns(`data-sck="${k}" data-scp`, ['ไฟฟ้าขาดช่วง', 'ไฟฟ้าคงที่'], sc.power)}${btns(`data-sck="${k}" data-scb`, ['งบเท่าเดิม', 'งบเพิ่มเล็กน้อย', 'งบเพิ่มมาก'], sc.budget)}${btns(`data-sck="${k}" data-scu`, ['ผู้ใช้เท่าเดิม', 'ผู้ใช้มากขึ้น'], sc.users - 1)}
        <p><b>ทางเลือก</b></p>${btns(`data-sck="${k}" data-sco`, OPT.map(o => o.n), sc.o)}</div>`; };
      const draw = () => {
        $('#sc-st', el).innerHTML = pane('A') + pane('B');
        const diff = ['power', 'budget', 'users'].some(k => s.A[k] !== s.B[k]);
        $('#sc-k', el).innerHTML = row(diff, 'สองฉากต่างกันที่เงื่อนไข') + row(ok(s.A), 'ฉาก A: ทางเลือกทำงานได้ภายใต้เงื่อนไข') + row(ok(s.B), 'ฉาก B: ทางเลือกทำงานได้ภายใต้เงื่อนไข');
        if (diff) tick(el, 'diff'); if (ok(s.A)) tick(el, 'fitA'); if (ok(s.B)) tick(el, 'fitB');
      };
      el.addEventListener('click', e => { const b = e.target.closest('[data-sck]'); if (!b) return; const sc = s[b.dataset.sck];
        if (b.dataset.scp != null) sc.power = +b.dataset.scp; if (b.dataset.scb != null) sc.budget = +b.dataset.scb; if (b.dataset.scu != null) sc.users = +b.dataset.scu + 1; if (b.dataset.sco != null) sc.o = +b.dataset.sco; tone(560, 40); draw(); });
      draw();
    }
  };
};
