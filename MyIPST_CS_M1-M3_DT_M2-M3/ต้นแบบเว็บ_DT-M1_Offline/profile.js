/* หน้า "ข้อมูลของฉัน": การ์ดผู้เล่น เลเวล ภารกิจ ไอเทมที่สะสม และเหรียญตรารายบท
   อ่านค่าจากข้อมูลจริงของผู้เรียน (อ่านบทเรียน ด่านฝึก สู้บอส กิจกรรม งานที่ส่งและผลตรวจ) ไม่มีค่าสมมติ */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = () => window.DT_DATA, P = () => window.DTPractice, A = () => window.DTApp;
  const LV = 150; // XP ต่อ 1 เลเวล
  const RANKS = window.DT_CFG.ranks || ['ผู้เริ่มต้น', 'นักสำรวจ', 'ช่างฝึกหัด', 'นักออกแบบ', 'นักประดิษฐ์', 'ช่างเทคโน', 'ปรมาจารย์เทคโน'];
  // ไอเทมประจำบท: ได้เมื่อทำเงื่อนไขของบทนั้นสำเร็จ
  const ITEMS = window.DT_CFG.items || {
    1: { read: ['📜', 'คัมภีร์สังเกตโลก'], prac: ['🔍', 'แว่นแยกประเภท'], boss: ['🌿', 'แกนพลังพฤกษา'], work: ['🏅', 'ตราผู้สำรวจโต๊ะ'] },
    2: { read: ['📜', 'คัมภีร์กาลเวลา'], prac: ['⏳', 'นาฬิกาเปรียบเทียบ'], boss: ['⚙️', 'ฟันเฟืองยุคใหม่'], work: ['🏅', 'ตราผู้เทียบเทคโนโลยี'] },
    3: { read: ['📜', 'คัมภีร์ระบบ'], prac: ['🔌', 'ปลั๊กต่อระบบ'], boss: ['💧', 'แกนน้ำวนกลับ'], work: ['🏅', 'ตราผู้ออกแบบระบบ'] },
    4: { read: ['📜', 'คัมภีร์วัสดุ'], prac: ['📏', 'ตลับเมตรทอง'], boss: ['🪨', 'ผลึกวัสดุแกร่ง'], work: ['🏅', 'ตราผู้เลือกวัสดุ'] },
    5: { read: ['📜', 'คัมภีร์กลไก'], prac: ['💡', 'หลอดไฟวงจรปิด'], boss: ['⚡', 'แกนสายฟ้า'], work: ['🏅', 'ตราผู้คุมกลไก'] },
    6: { read: ['📜', 'คัมภีร์แบบร่าง'], prac: ['✏️', 'ดินสอร่างแบบ'], boss: ['❄️', 'ผลึกน้ำแข็งแบบพิมพ์'], work: ['🏅', 'ตราผู้ออกแบบ'] },
    7: { read: ['📜', 'คัมภีร์ทดสอบ'], prac: ['⏱️', 'นาฬิกาจับเวลา'], boss: ['🔥', 'แกนเพลิงปรับปรุง'], work: ['🏅', 'ตราผู้พัฒนาแบบ'] }
  };
  const SRC = { read: 'อ่านบทเรียนครบทุกหัวข้อ', prac: 'ผ่านด่านฝึก 70% ขึ้นไป', boss: 'ชนะบอสประจำบท', work: 'ส่งงานแล้วครูตรวจให้คะแนน' };

  function stats() {
    const d = D(), db = A().db, id = A().activeId, me = db.profiles[id], P_ = P(), isMine = s => A().isMySub ? A().isMySub(s) : s.studentId === id;
    const chs = d.course.chapters.map(c => {
      const r = P_.getRec(c.number), mods = c.modules.map(m => m.id);
      const readAll = mods.length > 0 && mods.every(m => me.read.includes(m));
      const graded = db.submissions.some(s => isMine(s) && s.chapterId === c.id && s.review?.status === 'graded');
      const submitted = db.submissions.some(s => isMine(s) && s.chapterId === c.id);
      const enc = d.encounters.find(e => e.chapterId === c.id), boss = enc && d.bosses.find(b => b.number === enc.mainBoss);
      return { c, r, readAll, readN: mods.filter(m => me.read.includes(m)).length, readTotal: mods.length, prac: r.best >= 70, best: Math.round(r.best), tries: r.tries || 0, boss: !!r.battle, bossName: boss ? boss.thaiName : '', bossNo: enc ? enc.mainBoss : 0, graded, submitted };
    });
    const labs = Object.values(me.labs).filter(l => l && l.savedAt).length;
    return { me, chs, labs, xp: P_.xp(), passed: chs.filter(x => x.prac).length, bosses: chs.filter(x => x.boss).length, read: chs.reduce((s, x) => s + x.readN, 0), readTotal: chs.reduce((s, x) => s + x.readTotal, 0), graded: chs.filter(x => x.graded).length, submitted: chs.filter(x => x.submitted).length };
  }

  function view() {
    const A_ = A(); if (!A_ || A_.activeId === 'guest') {
      return `<section class="paper prof-guest"><span class="eyebrow">PLAYER CARD</span><h1>ข้อมูลของฉัน</h1><p>หน้านี้แสดงเลเวล ภารกิจ และไอเทมของผู้เรียนแต่ละคน ตอนนี้คุณอยู่ในโหมดผู้ชม จึงยังไม่มีข้อมูลสะสม เลือกเลขที่ของตนเองก่อน แล้วระบบจะเก็บเลเวลและไอเทมให้</p><button type="button" class="btn green" data-action="entry">เลือกผู้เรียน</button></section>`;
    }
    window.DTCloud?.syncStudentIfNeeded?.();
    const s = stats(), lv = Math.floor(s.xp / LV) + 1, into = s.xp % LV, rank = RANKS[Math.min(RANKS.length - 1, Math.floor((lv - 1) / 2))];
    const wp = P().WEAPONS.find(w => w[0] === P().getWeapon()) || P().WEAPONS[0];
    const totalItems = s.chs.length * 4;
    const owned = s.chs.reduce((n, x) => n + (x.readAll ? 1 : 0) + (x.prac ? 1 : 0) + (x.boss ? 1 : 0) + (x.graded ? 1 : 0), 0);
    const stat = (v, t, ic) => `<div class="pf-stat"><span class="pf-ic">${ic}</span><b>${v}</b><small>${t}</small></div>`;
    const quests = [
      { t: 'นักอ่านหน้าใหม่', d: 'อ่านบทเรียนและกด "บันทึกว่าอ่านแล้ว" ให้ครบ 3 หัวข้อ', v: s.read, n: 3, r: ['🎒', 'กระเป๋านักสำรวจ'] },
      { t: 'ผ่านด่านแรก', d: 'ทำด่านฝึกให้ได้ 70% ขึ้นไปอย่างน้อย 1 บท', v: s.passed, n: 1, r: ['🛡️', 'โล่ผู้ผ่านด่าน'] },
      { t: 'นักล่าบอส', d: 'ชนะบอสประจำบทให้ได้ 1 ตัว', v: s.bosses, n: 1, r: ['⚔️', 'ตราผู้ล้มบอส'] },
      { t: 'นักทดลองตัวจริง', d: 'กดบันทึกกิจกรรมในพื้นที่ทดลองให้ครบ 3 กิจกรรม', v: s.labs, n: 3, r: ['🧪', 'ขวดทดลองเรืองแสง'] },
      { t: 'ช่างผู้ส่งงาน', d: 'ส่งชิ้นงานให้ครูอย่างน้อย 1 บท', v: s.submitted, n: 1, r: ['📮', 'ซองส่งงานทอง'] },
      { t: 'ผ่านครบครึ่งทาง', d: 'ผ่านด่านฝึกให้ครบ 4 บท', v: s.passed, n: 4, r: ['🗝️', 'กุญแจครึ่งทาง'] },
      { t: 'ผู้พิชิตดาวฤกษ์', d: 'ผ่านด่านฝึกและชนะบอสให้ครบทั้ง ' + window.DT_CFG.chapters + ' บท', v: Math.min(s.passed, s.bosses), n: window.DT_CFG.chapters, r: ['👑', 'มงกุฎผู้พิชิต'] }
    ];
    const done = quests.filter(q => q.v >= q.n).length;
    return `<div class="crumbs"><a href="#home">ฐานภารกิจ</a><span>/</span><span>ข้อมูลของฉัน</span></div>
<section class="pf-hero"><div class="pf-avatar" role="img" aria-label="Techno ถือ${esc(wp[1])}"><span style="background-image:url(assets/hero-${esc(wp[0])}.webp)"></span></div>
<div class="pf-id"><span class="eyebrow">PLAYER CARD</span><h1>${esc(s.me.name)}</h1><p>${esc(s.me.classroom)} · เลขที่ ${esc(s.me.number)}${s.me.code ? ' · รหัส ' + esc(s.me.code) : ''} · ปีการศึกษา ${esc(s.me.year)}</p>
<div class="pf-rank"><span class="pf-lv">LV ${lv}</span><b>${esc(rank)}</b><span class="pf-wp">อาวุธประจำตัว: ${esc(wp[1])}</span></div>
<div class="pf-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${LV}" aria-valuenow="${into}"><i style="width:${Math.round(into / LV * 100)}%"></i></div>
<small>XP รวม ${s.xp} · อีก ${LV - into} XP จะขึ้นเลเวล ${lv + 1}</small></div></section>
<section class="pf-stats">${stat(s.read + '/' + s.readTotal, 'หัวข้อที่อ่านแล้ว', '📖')}${stat(s.passed + '/7', 'ด่านฝึกที่ผ่าน', '🛡️')}${stat(s.bosses + '/7', 'บอสที่ชนะ', '⚔️')}${stat(s.labs, 'กิจกรรมที่บันทึก', '🧪')}${stat(s.graded + '/7', 'งานที่ครูตรวจแล้ว', '📬')}${stat(owned + '/' + totalItems, 'ไอเทมที่สะสมได้', '🎁')}</section>
<section class="paper pf-sec"><div class="flex-between"><h2>ภารกิจของฉัน</h2><span class="pf-count">สำเร็จ ${done}/${quests.length}</span></div><p class="muted">ทำภารกิจให้สำเร็จเพื่อรับไอเทมพิเศษ ความก้าวหน้านับจากสิ่งที่คุณทำจริงในระบบ</p>
<div class="pf-quests">${quests.map(q => { const ok = q.v >= q.n, pc = Math.min(100, Math.round(q.v / q.n * 100)); return `<article class="pf-quest ${ok ? 'ok' : ''}"><div class="pf-q-ic">${ok ? '✅' : '🎯'}</div><div class="pf-q-body"><h3>${esc(q.t)}</h3><p>${esc(q.d)}</p><div class="pf-bar sm"><i style="width:${pc}%"></i></div><small>${Math.min(q.v, q.n)} / ${q.n}</small></div><div class="pf-reward ${ok ? 'got' : ''}"><span>${q.r[0]}</span><small>${ok ? 'ได้รับแล้ว' : 'รางวัล'}</small><b>${esc(q.r[1])}</b></div></article>`; }).join('')}</div></section>
<section class="paper pf-sec"><h2>พัฒนาการก่อน–หลังเรียน</h2><p class="muted">เทียบคะแนนทดสอบก่อนเรียนกับหลังเรียนของแต่ละบท (ร้อยละ) ไม่ใช่คะแนนวิชา</p>${window.DTPractice && window.DTPractice.myGrowth ? window.DTPractice.myGrowth() : ""}</section>
<section class="paper pf-sec"><h2>กระเป๋าไอเทม</h2><p class="muted">แต่ละบทมีไอเทม 4 ชิ้น ได้จาก: อ่านบทเรียนครบ · ผ่านด่านฝึก · ชนะบอส · ส่งงานแล้วครูให้คะแนน ไอเทมที่ยังไม่ได้จะแสดงเป็นเงา เพื่อบอกว่าต้องทำอะไรต่อ</p>
<div class="pf-chaps">${s.chs.map(x => { const n = x.c.number, it = ITEMS[n], flags = { read: x.readAll, prac: x.prac, boss: x.boss, work: x.graded }; return `<article class="pf-chap"><header><span class="chapter-number">${String(n).padStart(2, '0')}</span><div><h3>${esc(x.c.title)}</h3><small>บอส: ${esc(x.bossName || '-')} · ด่านฝึกดีที่สุด ${x.tries ? x.best + '%' : 'ยังไม่ได้ทำ'}${x.tries ? ' · ทำแล้ว ' + x.tries + ' ครั้ง' : ''}</small></div><div class="starbox">${[1, 2, 3].map(i => `<span class="st ${(x.best >= 90 ? 3 : x.best >= 70 ? 2 : x.best >= 40 ? 1 : 0) >= i && x.tries ? 'on' : ''}" aria-hidden="true"></span>`).join('')}</div></header>
<div class="pf-items">${['read', 'prac', 'boss', 'work'].map(k => `<div class="pf-item ${flags[k] ? 'got' : ''}" title="${esc(SRC[k])}"><span class="pf-item-ic">${it[k][0]}</span><b>${esc(it[k][1])}</b><small>${flags[k] ? 'ได้รับแล้ว' : esc(SRC[k])}</small></div>`).join('')}</div>
<a class="btn secondary small" href="#chapter/${n}/${flags.read ? (flags.prac ? (flags.boss ? 'work' : 'arena') : 'practice') : 'learn'}">${flags.read ? (flags.prac ? (flags.boss ? 'ไปส่งงานบทนี้' : 'ไปสู้บอส') : 'ไปทำด่านฝึก') : 'ไปอ่านบทเรียน'}</a></article>`; }).join('')}</div></section>`;
  }
  window.DTProfile = { view };
})();
