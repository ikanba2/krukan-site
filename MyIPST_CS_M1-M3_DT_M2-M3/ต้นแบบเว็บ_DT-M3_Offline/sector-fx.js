/* เอฟเฟกต์ "เข้าสู่ SECTOR" เมื่อกดการ์ดบทเรียนในหน้าแรก (และการ์ด Sector 8)
   การ์ดสั่นและกะพริบ › แผงเฉียงสีเหลือง/หมึกปาดเข้ากลางจอ พร้อมเลข SECTOR และชื่อบท › เปลี่ยนหน้า › แผงปาดออก
   ใช้เวลารวมไม่ถึง 1 วินาที · ผู้ที่ตั้งค่าลดการเคลื่อนไหว เปลี่ยนหน้าทันทีโดยไม่มีเอฟเฟกต์ */
(function () {
  'use strict';
  const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let busy = false, ac = null;
  function blip() { /* เสียงสั้น ๆ แบบเกม (ถ้าเบราว์เซอร์อนุญาต) */
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime;
      [[523, 0], [784, .07], [1046, .14]].forEach(([f, d]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(.05, t + d + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d + .12); o.connect(g).connect(ac.destination); o.start(t + d); o.stop(t + d + .14); });
    } catch (e) { /* ไม่มีเสียงก็ได้ */ }
  }
  function play(card, href) {
    if (busy) return; busy = true;
    const no = (card.querySelector('.hm-thumb b, .s8-no b') || {}).textContent || '';
    const title = (card.querySelector('.hm-body strong, .s8-body strong') || {}).textContent || '';
    const sub = (card.querySelector('.hm-body small, .s8-body small') || {}).textContent || '';
    card.classList.add('sfx-hit'); blip();
    const ov = document.createElement('div'); ov.id = 'sfx'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = `<i class="sfx-a"></i><i class="sfx-b"></i><div class="sfx-c"><span class="sfx-tag">${esc(sub)}</span><b class="sfx-no"><small>SECTOR</small>${esc(no.trim())}</b><strong>${esc(title)}</strong><em>ENTER!</em></div>`;
    document.body.appendChild(ov);
    void ov.offsetWidth; setTimeout(() => ov.classList.add('in'), 16);
    setTimeout(() => { location.hash = href.replace(/^#/, ''); }, 560);
    setTimeout(() => { ov.classList.add('out'); }, 820);
    setTimeout(() => { ov.remove(); card.classList.remove('sfx-hit'); busy = false; }, 1180);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('.hm-grid > a.hm-card, .hm-grid .s8-card a.btn');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    const href = a.getAttribute('href'); if (!href || href[0] !== '#') return;
    if (reduce()) return;
    e.preventDefault();
    play(a.closest('.hm-card') || a, href);
  }, true);
})();
