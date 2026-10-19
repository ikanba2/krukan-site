/* สรุปบท (แท็บ "สรุปบท" ก่อนทดสอบหลังเรียน) + การ์ดคำประจำบท + เน้นคำสำคัญในหน้าเรียนรู้
   - สิ่งสำคัญของบท: จาก DT_FINAL.summary (final_exam.py) · คำประจำบท: glossary ในบทเรียน + คำเพิ่มด้านล่าง
   - การ์ดคำ: แตะเพื่อพลิกดูความหมาย · กด "จำได้แล้ว" เก็บในเครื่อง (ต่อคน)
   - หน้าเรียนรู้: คำสำคัญของบทถูกทำเป็นตัวหนาและขีดเน้นสีเหลืองอ่อน ชี้/แตะเพื่อดูความหมาย */
(function () {
  'use strict';
  const D = () => window.DT_DATA;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* คำเพิ่มเติมของแต่ละบท (คำที่ใช้ในบทเรียนและข้อสอบ แต่ยังไม่อยู่ใน glossary) */
  const EXTRA = {
    1: [['สิ่งธรรมชาติ', 'สิ่งที่เกิดขึ้นเองในธรรมชาติและยังไม่ถูกมนุษย์ดัดแปลง เช่น ก้อนหิน แสงแดด ใบไม้ที่ร่วง'], ['ความต้องการ', 'สิ่งที่ผู้ใช้อยากให้เกิดขึ้น เช่น หยิบปากกาได้เร็ว เป็นจุดเริ่มต้นของการสร้างเทคโนโลยี']],
    2: [['ข้อแลกเปลี่ยน', 'การได้ข้อดีอย่างหนึ่งแต่ต้องยอมเสียอีกอย่างหนึ่ง เช่น เครื่องใหญ่ซักได้มากแต่ใช้พื้นที่มาก'], ['เงื่อนไข', 'สภาพหรือข้อจำกัดของผู้ใช้และสถานที่ เช่น ไฟดับ พื้นที่น้อย งบน้อย ซึ่งทำให้ทางเลือกที่เหมาะต่างกัน']],
    3: [['ระบบ', 'กลุ่มของส่วนต่าง ๆ ที่ทำงานร่วมกันเพื่อให้ได้ผลตามเป้าหมาย'], ['ตัวควบคุม', 'ส่วนที่ตัดสินใจสั่งให้ระบบทำงานหรือหยุด โดยดูจากข้อมูลย้อนกลับ']],
    4: [['วัดและทำเครื่องหมาย', 'ขั้นตอนก่อนตัดวัสดุ อ่านค่าจากขีดศูนย์ และขีดเส้นให้ชัดเพื่อให้ได้ขนาดตรงแบบ'], ['ความปลอดภัย', 'ใช้เครื่องมือให้ถูกวิธี เช่น ตัดบนแผ่นรองตัด ดึงใบมีดออกจากตัว และเก็บเครื่องมือทุกครั้ง']],
    5: [['ล้อและเพลา', 'กลไกที่ล้อใหญ่ยึดกับแกนเล็ก หมุนล้อใหญ่ช่วยให้ออกแรงน้อยลง แต่ต้องหมุนเป็นระยะทางไกลขึ้น'], ['สวิตช์', 'อุปกรณ์เปิดหรือปิดทางเดินของกระแสไฟฟ้าในวงจร']],
    6: [['กระบวนการออกแบบเชิงวิศวกรรม', 'ขั้นตอนแก้ปัญหา 6 ขั้น: ระบุปัญหา › หาข้อมูล › ออกแบบ › วางแผนและสร้าง › ทดสอบและปรับปรุง › นำเสนอ']],
    7: [['ทดลองซ้ำ', 'ทดสอบหลายรอบภายใต้เงื่อนไขเดิม จะสรุปว่าผ่านได้ต้องผ่านเกณฑ์ทุกรอบ'], ['ปรับปรุงทีละจุด', 'เปลี่ยนแบบครั้งละหนึ่งอย่าง เพื่อให้รู้ว่าการเปลี่ยนใดทำให้ผลดีขึ้นหรือแย่ลง']]
  };
  function vocab(c) {
    const out = [], seen = new Set();
    c.modules.forEach(m => { const L = (D().lessons || {})[m.id]; ((L && L.glossary) || []).forEach(g => { if (!seen.has(g.term)) { seen.add(g.term); out.push([g.term, g.meaning]); } }); });
    (((window.DT_FINAL && (window.DT_FINAL.summary || []).find(x => x.ch === c.number) || {}).vocab) || (window.DT_VOCAB_EXTRA || EXTRA)[c.number] || []).forEach(([t, m]) => { if (!seen.has(t)) { seen.add(t); out.push([t, m]); } });
    return out;
  }
  const KEY = window.DT_CFG.key + '-vocab';
  const loadK = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const who = () => { const a = window.DTApp; return (a && a.activeId) || 'guest'; };
  function known(ch) { const k = loadK(); return new Set(((k[who()] || {})[ch]) || []); }
  function setKnown(ch, term, on) { const k = loadK(), u = k[who()] = k[who()] || {}, s = new Set(u[ch] || []); on ? s.add(term) : s.delete(term); u[ch] = [...s]; try { localStorage.setItem(KEY, JSON.stringify(k)); } catch (e) { /* เก็บไม่ได้ */ } }

  function view(c) {
    const sum = ((window.DT_FINAL && window.DT_FINAL.summary) || []).find(x => x.ch === c.number);
    const words = vocab(c), kn = known(c.number);
    const pts = sum ? sum.points : [c.learningOutcome];
    return `<section class="paper rv"><span class="eyebrow">สรุปบทที่ ${c.number} · ทบทวนก่อนทดสอบหลังเรียน</span><h2>สิ่งสำคัญของบทนี้</h2>
      <ol class="rv-pts">${pts.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
      <p class="rv-hint">อ่านให้เข้าใจทีละข้อ ถ้าข้อไหนยังไม่มั่นใจ กลับไปอ่านใน <a href="#chapter/${c.number}/learn">เรียนรู้</a> ได้เลย</p></section>
    <section class="paper rv" id="rv-cards"><div class="rv-h"><div><span class="eyebrow">การ์ดคำประจำบท</span><h2>คำที่ต้องจำ ${words.length} คำ</h2></div><span class="rv-count" id="rv-count">จำได้แล้ว <b>${words.filter(w => kn.has(w[0])).length}</b>/${words.length}</span></div>
      <p class="rv-hint">แตะการ์ดเพื่อพลิกดูความหมาย ลองนึกคำตอบในใจก่อนพลิก ถ้าจำได้แล้วกด "จำได้แล้ว"</p>
      <div class="rv-tools"><button type="button" class="btn secondary small" data-rv="flip-all">🔄 พลิกทั้งหมด</button><button type="button" class="btn secondary small" data-rv="shuffle">🔀 สลับลำดับ</button><button type="button" class="btn secondary small" data-rv="left">🎯 ดูเฉพาะคำที่ยังจำไม่ได้</button></div>
      <div class="rv-grid" id="rv-grid">${words.map(([t, m], i) => card(c.number, t, m, i, kn.has(t))).join('')}</div></section>
    <section class="paper rv rv-go"><b>ทบทวนครบแล้ว พร้อมทำแบบทดสอบหลังเรียนหรือยัง</b><p>แบบทดสอบหลังเรียนวัดเรื่องเดียวกับก่อนเรียน แต่เป็นสถานการณ์ใหม่ ลองดูว่าเราเก่งขึ้นแค่ไหน</p><a class="btn" href="#chapter/${c.number}/post">ไปทำแบบทดสอบหลังเรียน ›</a></section>`;
  }
  function card(ch, t, m, i, k) {
    return `<div class="rv-card c${i % 6} ${k ? 'known' : ''}" data-term="${esc(t)}"><button type="button" class="rv-flip" data-rv="flip" aria-label="พลิกการ์ด ${esc(t)}"><span class="rv-front"><small>คำที่ ${i + 1}</small><b>${esc(t)}</b><em>แตะเพื่อดูความหมาย</em></span><span class="rv-back"><small>${esc(t)}</small><span>${esc(m)}</span></span></button><button type="button" class="rv-know" data-rv="know" aria-pressed="${k}">${k ? '✅ จำได้แล้ว' : '☐ จำได้แล้ว'}</button></div>`;
  }
  function count(ch) { const el = document.getElementById('rv-count'); if (!el) return; const all = [...document.querySelectorAll('.rv-card')]; el.innerHTML = `จำได้แล้ว <b>${all.filter(x => x.classList.contains('known')).length}</b>/${all.length}`; }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-rv]'); if (!b) return;
    const ch = +((location.hash.match(/^#chapter\/(\d+)/) || [])[1] || 0), a = b.dataset.rv, grid = document.getElementById('rv-grid');
    if (a === 'flip') b.closest('.rv-card').classList.toggle('open');
    else if (a === 'know') { const cd = b.closest('.rv-card'), on = !cd.classList.contains('known'); cd.classList.toggle('known', on); b.setAttribute('aria-pressed', on); b.textContent = on ? '✅ จำได้แล้ว' : '☐ จำได้แล้ว'; setKnown(ch, cd.dataset.term, on); count(ch); }
    else if (a === 'flip-all' && grid) { const cs = [...grid.children], open = cs.some(x => !x.classList.contains('open')); cs.forEach(x => x.classList.toggle('open', open)); }
    else if (a === 'shuffle' && grid) { [...grid.children].sort(() => Math.random() - .5).forEach(x => grid.appendChild(x)); }
    else if (a === 'left' && grid) { const on = !grid.classList.contains('only-left'); grid.classList.toggle('only-left', on); b.textContent = on ? '📋 ดูทุกคำ' : '🎯 ดูเฉพาะคำที่ยังจำไม่ได้'; }
  });

  /* ---------- เน้นคำสำคัญในหน้าเรียนรู้ ---------- */
  const SKIP = 'h1,h2,h3,h4,button,a,label,textarea,input,select,mark,.lp-cards,.lp-tag,.sim,figure,.lp-nav,.lp-steps,svg,code';
  function highlight() {
    const m = location.hash.match(/^#chapter\/(\d+)\/learn/); if (!m) return;
    const body = document.querySelector('#main .lp-body'); if (!body || body.dataset.kw === location.hash) return;
    const c = D().course.chapters.find(x => x.number === +m[1]); if (!c) return;
    body.dataset.kw = location.hash;
    const words = vocab(c).sort((a, b) => b[0].length - a[0].length);
    const terms = words.map(w => w[0]).filter(t => t.length >= 2);
    if (!terms.length) return;
    const meaning = Object.fromEntries(words);
    const re = new RegExp('(' + terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')');
    /* แต่ละย่อหน้า: เน้นคำละครั้งเดียว (ครั้งแรกที่พบ) ไม่ให้ลายตา */
    body.querySelectorAll('p,li,td,dd,.lp-note,.say b,.say span').forEach(block => {
      if (block.closest(SKIP) || block.querySelector('p,li')) return;
      const used = new Set(), walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        let txt = node.nodeValue, mm, frag = null, last = 0, guard = 0;
        const g = new RegExp(re.source, 'g');
        while ((mm = g.exec(txt)) && guard++ < 20) {
          if (used.has(mm[1])) continue; used.add(mm[1]);
          frag = frag || document.createDocumentFragment();
          frag.appendChild(document.createTextNode(txt.slice(last, mm.index)));
          const k = document.createElement('mark'); k.className = 'kw'; k.textContent = mm[1]; k.title = meaning[mm[1]] || ''; k.tabIndex = 0;
          frag.appendChild(k); last = mm.index + mm[1].length;
        }
        if (frag) { frag.appendChild(document.createTextNode(txt.slice(last))); node.parentNode.replaceChild(frag, node); }
      });
    });
  }
  /* แตะคำที่เน้นบนมือถือ: แสดงความหมายใต้คำ */
  document.addEventListener('click', e => {
    const k = e.target.closest('mark.kw'); document.querySelectorAll('.kw-tip').forEach(x => x.remove()); if (!k || !k.title) return;
    const tip = document.createElement('span'); tip.className = 'kw-tip'; tip.textContent = k.textContent + ': ' + k.title; k.after(tip);
  });
  new MutationObserver(() => { if (/^#chapter\/\d+\/learn/.test(location.hash)) highlight(); }).observe(document.documentElement, { childList: true, subtree: true });
  window.DTReview = { view, vocab };
})();
