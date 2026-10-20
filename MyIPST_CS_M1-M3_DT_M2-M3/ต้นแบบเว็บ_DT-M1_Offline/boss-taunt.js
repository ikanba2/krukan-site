/* บอสประจำบทโผล่จากมุมซ้ายล่างมาพูดกวนท้าทายสั้น ๆ ตอนเปลี่ยนหน้าเรียน แล้วหายไปเอง (อยู่ราว 3–5 วินาที)
   โผล่เฉพาะหน้าที่อ่านอย่างเดียว (ภารกิจ · เรียนรู้ · สรุปบท) ไม่โผล่ตอนทำข้อสอบ ด่านฝึก ชิ้นงาน หรือสู้บอส และไม่โผล่ให้ครู
   จำกัดความถี่: ห่างกันอย่างน้อย 20 วินาที สุ่มโผล่ครึ่งหนึ่งของการเปลี่ยนหน้า (หน้าแรกของบทโผล่เสมอ) กดที่ป้ายเพื่อปิดทันที
   ปุ่ม "พักบอสกวน" ปิดจนกว่าจะปิดแท็บ ผู้ที่ตั้งค่าลดการเคลื่อนไหวจะเห็นแบบไม่มีท่าทางเลื่อน */
(function () {
  'use strict';
  const D = window.DT_DATA, CFG = window.DT_CFG || {};
  const KEY = (CFG.key || 'dt') + '-offline-v1', OFF = (CFG.key || 'dt') + '-taunt-off';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ไม่เก็บก็ได้ */ } } };
  const MIN_GAP = 20000, MAX_SHOWN = 12;
  let box = null, inTimer = 0, outTimer = 0, goneTimer = 0, lastEnd = 0, shown = 0;
  const seenChapter = {}, recent = [];

  /* ข้อความกวน: {boss} ชื่อบอสประจำบท · {topic} ชื่อหัวข้อที่กำลังเรียน · พูดแบบบอสเรียกตัวเองว่า "ข้า" เรียกผู้เรียนว่า "เจ้า" */
  const LINES = {
    overview: [
      'ข้า{boss}รออยู่ปลายทาง มาให้ถึงสิ!',
      'ภารกิจนี้ดูง่ายใช่ไหม ลองทำให้ครบสิ!',
      'เริ่มบทใหม่แล้วหรือ ข้ารอสู้อยู่นะ!'
    ],
    goal: [
      'อ่านให้จบนะ ข้าจะถามตอนท้ายบท!',
      'ขยันนี่ ข้าจะดูว่าเจ้าจำได้กี่ข้อ!',
      'เดาสิ หัวข้อนี้ใช้ในชีวิตจริงตรงไหน?',
      'หัวข้อ «{topic}» ข้าท้าให้อ่านจบ!'
    ],
    idea: [
      'ตรงนี้คือหัวใจ ไม่เข้าใจข้าชนะแน่!',
      'ลองอธิบายหน้านี้ด้วยคำของเจ้าเองสิ!',
      'ข้านับนะ คำสำคัญจำได้กี่คำ!'
    ],
    example: [
      'ตัวอย่างนี้ข้าเอาไปถามจริงนะ!',
      'ลองคิดตัวอย่างของเจ้าเองสักอย่างสิ!',
      'อย่าลืมถามตัวเองว่า ทำไม นะ!'
    ],
    mistake: [
      'หน้านี้คนพลาดบ่อย ข้าชอบมาก ฮ่าๆ',
      'ระวังพลาดตรงนี้นะ ข้าเฝ้าดูอยู่!',
      'ถ้าไม่พลาดตรงนี้ ข้าเริ่มหนาวแล้ว!'
    ],
    any: [
      'อ่านจริงหรือแค่เลื่อนผ่าน ข้าเห็นนะ!',
      'ตาลอยแล้วนะ กลับมาอ่านได้แล้ว!',
      'จำได้แค่ครึ่งเดียว สู้ข้าไม่ได้หรอก!',
      'ข้ารอที่ปลายบท อย่ามาช้านะ!',
      'อธิบายให้เพื่อนฟังได้ ข้ายอมเลย!',
      'หาคำสำคัญให้ได้สามคำสิ ข้าท้า!'
    ],
    review: [
      'จำคำศัพท์ได้ครบไหม ลองพลิกการ์ดสิ!',
      'ปิดการ์ดแล้วตอบก่อนพลิก ทำได้ไหม?',
      'ข้ารอที่ด่านบอส พร้อมเมื่อไรมาเลย!'
    ]
  };

  function route() {
    const [r, n, view, sub] = location.hash.slice(1).split('/');
    return { r: r || 'home', n: Number(n), view: view || 'overview', sub };
  }
  function pick(list, ctx) {
    const okTopic = t => !t.includes('{topic}') || (ctx.topic && ctx.topic.length <= 20);
    const fresh = list.filter(t => !recent.includes(t) && okTopic(t));
    const pool = fresh.length ? fresh : list.filter(okTopic), t = pool[Math.floor(Math.random() * pool.length)];
    recent.push(t); if (recent.length > 8) recent.shift();
    return t.replace(/\{boss\}/g, ctx.boss).replace(/\{topic\}/g, ctx.topic || 'บทนี้');
  }
  function decide(rt) {
    if (rt.r !== 'chapter' || !rt.n) return null;
    const c = D.course.chapters.find(x => x.number === rt.n); if (!c) return null;
    const e = D.encounters.find(x => x.chapterId === c.id), b = e && D.bosses.find(x => x.number === e.mainBoss); if (!b) return null;
    const ctx = { boss: b.thaiName, topic: '' };
    let kind;
    if (rt.view === 'overview') {
      kind = 'overview';
    } else if (rt.view === 'review') kind = 'review';
    else if (rt.view === 'learn') {
      const art = document.querySelector('#main article.lp'); if (!art) return null;
      const key = art.dataset.page;
      if (key === 'sim' || key === 'check') return null; /* หน้าที่ต้องลงมือทำ ไม่รบกวน */
      ctx.topic = (document.querySelector('#main .lp-topic') || {}).textContent || '';
      kind = LINES[key] && Math.random() < .6 ? key : 'any';
    } else return null;
    return { b, ctx, text: pick(LINES[kind], ctx), first: !seenChapter[c.id], chId: c.id };
  }

  function hide(now) {
    clearTimeout(inTimer); clearTimeout(outTimer); clearTimeout(goneTimer);
    if (!box) return;
    const el = box; box = null; lastEnd = Date.now();
    if (now) { el.remove(); return; }
    el.classList.remove('in'); el.classList.add('out');
    setTimeout(() => el.remove(), 420);
  }
  function show(d) {
    const src = `assets/boss-${d.b.number}.webp`;
    const img = new Image();
    img.onload = () => {
      if (box || !isEligibleNow()) return;
      const el = document.createElement('div');
      el.id = 'bt'; el.className = 'bt'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      el.innerHTML = `<img class="bt-boss" src="${esc(img.src)}" alt="" width="132" height="132"><div class="bt-bub"><div class="bt-in"><span class="bt-name"><i>BOSS</i>${esc(d.b.thaiName)}</span><p>${esc(d.text)}</p><button type="button" class="bt-off">พักบอสกวน</button></div></div>`;
      el.addEventListener('click', ev => { if (ev.target.closest('.bt-off')) { store.set(OFF, '1'); } hide(); });
      document.body.appendChild(el); box = el; shown++;
      if (d.chId) seenChapter[d.chId] = 1;
      void el.offsetWidth; el.classList.add('in');
      const stay = Math.min(5200, 2400 + d.text.length * 45);
      outTimer = setTimeout(() => hide(), stay);
    };
    img.onerror = () => { /* ไม่มีภาพบอสก็ไม่โผล่ ดีกว่าเห็นกรอบว่าง */ };
    img.src = src;
  }
  function isEligibleNow() {
    if (store.get(OFF) === '1' || store.get(KEY + '-staff') === '1') return false;
    if (document.hidden || document.body.classList.contains('portal-mode') || document.getElementById('lgm') || document.getElementById('sfx')) return false;
    if (window.DTSprites && !window.DTSprites.ready) return false; /* ภาพบอสในเวอร์ชัน Google ยังโหลดไม่เสร็จ */
    return true;
  }
  function onNav() {
    clearTimeout(inTimer);
    hide(true); /* เปลี่ยนหน้าใหม่ บอสตัวเก่าหายทันที */
    if (!isEligibleNow() || shown >= MAX_SHOWN) return;
    inTimer = setTimeout(() => {
      const d = decide(route()); if (!d) return;
      if (!d.first) {
        if (Date.now() - lastEnd < MIN_GAP) return;
        if (Math.random() > .5) return;
      }
      show(d);
    }, 900);
  }
  window.addEventListener('hashchange', onNav);
  window.DTTaunt = { force: () => { const d = decide(route()); if (d) show(d); }, hide: () => hide(true) };
})();
