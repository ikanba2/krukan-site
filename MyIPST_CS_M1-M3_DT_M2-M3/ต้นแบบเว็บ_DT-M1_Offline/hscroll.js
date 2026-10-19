/* แถบเมนูที่เลื่อนข้างได้ (แท็บของบท เมนูบนสุด เมนูกิจกรรม เส้นทางเรียน)
   - มีปุ่ม ‹ › ที่ขอบเมื่อยังมีเมนูซ่อนอยู่ แตะแล้วเลื่อนไปทีละเกือบเต็มแถบ
   - ขอบจางบอกว่ายังเลื่อนต่อได้
   - คอมพิวเตอร์: กดเมาส์ค้างแล้วลากเพื่อเลื่อนได้ (ลากแล้วไม่นับเป็นการคลิก) · มือถือใช้นิ้วปัดได้ตามปกติ */
(function () {
  const SEL = '#main .tabs, #main .lab-menu, #main .path';
  function setup(el) {
    if (el.dataset.hs) return; el.dataset.hs = '1';
    const wrap = document.createElement('div'); wrap.className = 'hs-wrap';
    const keep = el.scrollLeft; el.parentNode.insertBefore(wrap, el); wrap.append(el); el.scrollLeft = keep; /* ย้ายเข้ากรอบแล้วคงตำแหน่งเลื่อนเดิม (แท็บปัจจุบันอยู่กลาง) */
    const mk = (d, t) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'hs-arrow hs-a' + d; b.textContent = t; b.setAttribute('aria-label', d === 'l' ? 'เลื่อนเมนูไปทางซ้าย' : 'เลื่อนเมนูไปทางขวา'); b.tabIndex = -1; b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); el.scrollBy({ left: (d === 'l' ? -1 : 1) * Math.max(120, el.clientWidth * 0.75), behavior: 'smooth' }); }); wrap.append(b); return b; };
    const L = mk('l', '‹'), R = mk('r', '›');
    const upd = () => { const max = el.scrollWidth - el.clientWidth; const can = max > 4; wrap.classList.toggle('hs-on', can); L.hidden = !can || el.scrollLeft < 4; R.hidden = !can || el.scrollLeft > max - 4; wrap.classList.toggle('hs-l', !L.hidden); wrap.classList.toggle('hs-r', !R.hidden); };
    el.addEventListener('scroll', upd, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(upd).observe(el); else window.addEventListener('resize', upd);
    /* ลากด้วยเมาส์ */
    let sx = 0, sl = 0, drag = false, moved = false;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; drag = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - sx; if (Math.abs(dx) > 6) { moved = true; el.classList.add('hs-drag'); } if (moved) el.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!drag) return; drag = false; el.classList.remove('hs-drag'); });
    el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    el.addEventListener('dragstart', e => e.preventDefault());
    upd(); setTimeout(upd, 300);
  }
  const run = () => document.querySelectorAll(SEL).forEach(setup);
  let t = 0; new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 50); }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', run); run();
})();
