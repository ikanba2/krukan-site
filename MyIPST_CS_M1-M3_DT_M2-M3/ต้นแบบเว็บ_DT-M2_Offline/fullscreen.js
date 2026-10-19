/* โหมดเต็มจอ (ปุ่ม ⛶ ที่หัวเว็บ)
   1) ถ้าเบราว์เซอร์ยอมให้เต็มจอได้ในหน้านี้ ใช้ Fullscreen API ตรง ๆ
   2) ถ้าเปิดอยู่ในกรอบที่ฝังใน Google Sites แล้วกรอบไม่อนุญาตเต็มจอ เปิดเว็บแอปในแท็บใหม่แทน
      (แท็บใหม่ใช้พื้นที่ทั้งหน้าต่าง และกดปุ่มเต็มจออีกครั้งหรือกด F11 ได้) */
(function () {
  'use strict';
  const APP_URL = (window.DT_CFG && window.DT_CFG.appUrl) || location.href;
  const d = document, el = d.documentElement;
  const fsEl = () => d.fullscreenElement || d.webkitFullscreenElement;
  const canFs = () => !!(d.fullscreenEnabled || d.webkitFullscreenEnabled) && !!(el.requestFullscreen || el.webkitRequestFullscreen);
  const inGas = () => !!(window.google && google.script && google.script.run);
  const toast = t => { const box = d.getElementById('toast'); if (!box) return; box.textContent = t; box.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => box.classList.remove('show'), 4200); };
  function openTab() {
    const url = inGas() ? APP_URL : location.href;
    const w = window.open(url, '_blank', 'noopener');
    if (w || inGas()) toast('เปิดเว็บในแท็บใหม่แล้ว ในแท็บนั้นกดปุ่ม ⛶ อีกครั้ง หรือกด F11 บนคอมพิวเตอร์ เพื่อเต็มจอ');
    else toast('เบราว์เซอร์บล็อกหน้าต่างใหม่ ให้กดอนุญาตป๊อปอัป แล้วลองกดอีกครั้ง');
  }
  function enter() {
    if (!canFs()) {
      if (window.top !== window.self) return openTab();
      toast('อุปกรณ์นี้เปิดเต็มจอจากเว็บไม่ได้ ลองหมุนจอเป็นแนวนอน หรือเพิ่มเว็บไว้ที่หน้าจอหลัก');
      return;
    }
    /* บางกรอบ (เช่น Google Sites) ไม่ตอบกลับเลย จึงรอ 1.2 วินาที ถ้ายังไม่เต็มจอให้ถือว่าไม่สำเร็จ */
    let failed = false;
    const fail = () => { if (failed || fsEl()) return; failed = true; window.top !== window.self ? openTab() : toast('เปิดเต็มจอไม่ได้ ลองกด F11 บนคอมพิวเตอร์'); };
    try {
      const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(fail);
      setTimeout(fail, 1200);
    } catch (e) { fail(); }
  }
  function exit() { try { (d.exitFullscreen || d.webkitExitFullscreen).call(d); } catch (e) { /* ออกเองด้วย Esc */ } }
  function sync() {
    const on = !!fsEl(); el.classList.toggle('is-fs', on);
    d.querySelectorAll('[data-fs]').forEach(b => { b.setAttribute('aria-pressed', on); b.title = on ? 'ออกจากเต็มจอ (Esc)' : 'เต็มจอ'; b.querySelector('i') && (b.querySelector('i').textContent = on ? '🗗' : '⛶'); });
  }
  d.addEventListener('click', e => { const b = e.target.closest('[data-fs]'); if (!b) return; e.preventDefault(); fsEl() ? exit() : enter(); });
  d.addEventListener('fullscreenchange', sync); d.addEventListener('webkitfullscreenchange', sync);
  new MutationObserver(() => { if (d.querySelector('[data-fs][aria-pressed="' + !fsEl() + '"]')) sync(); }).observe(d.getElementById('header') || el, { childList: true, subtree: true });
  window.DTFullscreen = { enter, exit, openTab };
})();
