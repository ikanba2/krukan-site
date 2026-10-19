/* ภาพประกอบโจทย์ที่ต้องอ่านค่าจากภาพ (14 ภาพ ใน assets/question-figs/ · บน GAS ดึงจาก Drive ตาม assets-drive.json ไม่ฝัง base64)
   ผูกภาพกับข้อในด่านฝึก คำถามบอส และทดสอบก่อน/หลังเรียน ตามตาราง "จุดที่ใช้ภาพ" ใน assets/question-figs/README.md
   ตัวเลขในตาราง M เป็นลำดับข้อแบบนับจาก 0 · คำอธิบายใต้ภาพบอกหมายเลขในภาพ แต่ไม่บอกคำตอบ */
(function () {
  const F = window.DT_QFIG_FIGS || {
    tray20: ['qfig-c06-tray-20.webp', 'ภาพมุมบนของถาด ด้านนอกกว้าง 20 ซม. ขอบซ้ายและขวาหนาข้างละ 1 ซม. ช่องด้านในคือช่วงที่มีเครื่องหมาย ?'],
    tray24: ['qfig-c06-tray-24.webp', 'ภาพมุมบนของถาดอีกใบ ด้านนอกกว้าง 24 ซม. ขอบซ้ายและขวาหนาข้างละ 1.5 ซม. ช่องด้านในคือช่วงที่มีเครื่องหมาย ?'],
    desk: ['qfig-c06-desk-area.webp', 'กรอบเส้นประสีชมพูบนโต๊ะคือพื้นที่ที่ยอมให้ใช้ ขนาด 20 × 15 ซม.'],
    views: ['qfig-c06-views.webp', '① มุมมองด้านบนของถาด ② มุมมองด้านข้างของถาดใบเดียวกัน'],
    cut: ['qfig-c05-circuit-cut.webp', '① แบตเตอรี่ ② สวิตช์ (อยู่ตำแหน่งปิด) ③ หลอดไฟ ④ สายไฟ ⑤ จุดที่สายไฟขาด'],
    nobat: ['qfig-c05-circuit-nobattery.webp', '① ตำแหน่งแหล่งจ่ายไฟที่ว่างอยู่ ② สวิตช์ (อยู่ตำแหน่งปิด) ③ หลอดไฟ ④ สายไฟที่ต่อครบ'],
    resist: ['qfig-c05-circuit-resistor.webp', '① แบตเตอรี่ ② สวิตช์ (อยู่ตำแหน่งปิด) ③ หลอดไฟ ④ สายไฟ ⑥ ตัวต้านทาน'],
    parts: ['qfig-c05-circuit-parts.webp', '① แบตเตอรี่ ② สวิตช์ ③ หลอดไฟ ④ สายไฟ ⑥ ตัวต้านทาน'],
    wheel: ['qfig-c05-wheel-axle.webp', 'ซ้ายคือล้อรัศมี 2 ขวาคือล้อรัศมี 8 ทั้งสองติดกับเพลาขนาดเท่ากัน เส้นประคือทางที่มือต้องเคลื่อนเมื่อหมุน 1 รอบ'],
    irr: ['qfig-c03-irrigation.webp', '① ถังน้ำ ② ปั๊ม ③ ท่อ ④ ดินและต้นไม้ ⑤ เซนเซอร์วัดความชื้น ⑥ ตัวควบคุม · เส้นประสีชมพูคือข้อมูลที่ส่งกลับไปที่ตัวควบคุม'],
    leak: ['qfig-c03-pipe-leak.webp', 'ระบบรดน้ำเดิม แต่ ⑦ ท่อหลุด น้ำพุ่งออกนอกกระถาง ขณะที่ปั๊มยังหมุนอยู่ และดินในกระถางยังแห้ง'],
    mat: ['qfig-c04-materials.webp', 'การ์ดวัสดุ A–F บอกราคาและน้ำหนักที่รับได้ · เกณฑ์ของโจทย์: ต้องรับได้ 0.5 กก. ขึ้นไป และงบไม่เกิน 60 บาท'],
    times: ['qfig-c07-times.webp', 'เวลาที่ใช้หยิบของในการทดลอง 3 รอบ เส้นประสีชมพูคือเกณฑ์ 15 วินาที'],
    timesNew: ['qfig-c07-times-new.webp', 'เวลาของรุ่นเก่าเทียบกับรุ่นใหม่ เส้นประสีชมพูคือเกณฑ์ 15 วินาที']
  };
  const M = window.DT_QFIG_MAP || {
    items: { 3: { 2: 'leak', 3: 'irr', 4: 'irr' }, 4: { 0: 'mat' }, 5: { 1: 'parts', 2: 'wheel' }, 6: { 1: 'views', 2: 'tray20' }, 7: { 2: 'times' } },
    battle: { 3: { 1: 'irr', 3: 'irr' }, 4: { 2: 'mat' }, 5: { 1: 'cut', 2: 'resist' } },
    pre: { 3: { 0: 'irr', 2: 'irr', 3: 'leak' }, 4: { 1: 'mat' }, 5: { 1: 'cut', 3: 'wheel' }, 6: { 2: 'tray20' }, 7: { 1: 'times' } },
    post: { 3: { 3: 'irr' }, 5: { 0: 'nobat', 1: 'resist', 3: 'wheel' }, 6: { 1: 'desk', 2: 'tray24' }, 7: { 3: 'timesNew' } }
  };
  const fig = k => ({ n: F[k][0], cap: F[k][1] });
  const PR = window.DT_PRACTICE || {}, PP = window.DT_PREPOST || {};
  ['items', 'battle'].forEach(part => Object.entries(M[part] || {}).forEach(([c, m]) => Object.entries(m).forEach(([i, k]) => { const x = PR[c] && PR[c][part][i]; if (x) x.fig = fig(k); })));
  ['pre', 'post'].forEach(part => Object.entries(M[part] || {}).forEach(([c, m]) => Object.entries(m).forEach(([i, k]) => { const x = PP[c] && PP[c][part][i]; if (x) x.fig = fig(k); })));

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  /* ออฟไลน์ใช้ไฟล์ในเครื่อง · บน GAS ใช้ window.DTA (ชื่อไฟล์ › ลิงก์ Drive) */
  const src = n => window.DTA ? window.DTA(n) : 'assets/question-figs/' + n;
  const html = f => f ? `<figure class="q-fig"><button type="button" class="q-fig-btn" data-qfig="${esc(src(f.n))}" aria-label="ขยายภาพประกอบโจทย์"><img src="${esc(src(f.n))}" alt="${esc(f.cap)}" width="1200" height="750" loading="lazy" decoding="async"><span class="q-fig-zoom" aria-hidden="true">🔍 แตะเพื่อขยาย</span></button><figcaption>${esc(f.cap)}</figcaption></figure>` : '';

  /* แตะภาพ = เปิดเต็มจอ · แตะที่ใดก็ได้หรือกด Esc เพื่อปิด */
  function open(u, cap) {
    const box = document.createElement('div'); box.className = 'q-fig-full'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'ภาพประกอบโจทย์แบบเต็มจอ');
    box.innerHTML = `<img src="${esc(u)}" alt=""><p>${esc(cap)}</p><button type="button" class="btn small">ปิดภาพ ✕</button>`;
    const close = () => { box.remove(); document.removeEventListener('keydown', key, true); };
    const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    box.addEventListener('click', close); document.addEventListener('keydown', key, true);
    document.body.append(box); box.querySelector('button').focus();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.q-fig-btn'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const cap = b.parentElement.querySelector('figcaption'); open(b.dataset.qfig, cap ? cap.textContent : '');
  }, true);

  window.DTQF = { html, src, FIGS: F };
})();
