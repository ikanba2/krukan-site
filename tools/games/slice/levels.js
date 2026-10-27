/* Techno Slice: 4 โลก (ป.4 เรื่องเศษส่วน) โลกละ 10 ด่านคล้ายกันไล่ระดับ สร้างด้วยสูตร + seed แล้วตรวจด้วย engine.plan()
   makeLevel(โลก, ด่าน, seed) คืนด่าน: { world, id, title, kind, desc, zones, items, checks, ... }
   ด่านปกติใช้ seed ตายตัว (ทุกคนเจอเหมือนกัน) ส่วน 'ฝึกสุ่ม' ใช้ seed สุ่ม ได้ตัวเลขใหม่แต่โครงเหมือนด่านนั้น
   โลก 1 อ่านและสร้างเศษส่วน (cut, match, line) · โลก 2 เปรียบเทียบและเศษส่วนที่เท่ากัน (order, eq, line)
   โลก 3 เศษเกินและจำนวนคละ (pack, conv, line) · โลก 4 บวกลบเศษส่วน (calc) */
(function (root) {
  'use strict';
  const E = typeof require !== 'undefined' ? require('./engine.js') : root.SL;
  const { mkSlice, mkCard, mkImp, mkMix, mkNum, fstr, vstr, red, mixed, mstr } = E;
  const rngOf = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const shuffle = (a, rng) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pickOne = (a, rng) => a[Math.floor(rng() * a.length)];
  const ri = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));

  const WORLDS = [
    { id: 1, grade: 'ป.4', skill: 'อ่านและสร้างเศษส่วน', title: 'อ่านและสร้างเศษส่วน', hero: 's0', bg: 'sun', boss: 15, color: '#e8452c',
      desc: 'ตัดพิซซ่าตามที่ลูกค้าสั่ง จับคู่การ์ดเศษส่วนกับภาพที่ระบายสี และวางเศษส่วนบนเส้นจำนวน',
      concept: 'เศษส่วนบอกว่าเอากี่ส่วนจากทั้งหมดกี่ส่วนที่แบ่งเท่า ๆ กัน ตัวเศษคือจำนวนส่วนที่เอา ตัวส่วนคือจำนวนส่วนทั้งหมด เช่น 3/8 คือเอา 3 ส่วนจาก 8 ส่วน' },
    { id: 2, grade: 'ป.4', skill: 'เปรียบเทียบและเศษส่วนที่เท่ากัน', title: 'เปรียบเทียบและเศษส่วนที่เท่ากัน', hero: 's2', bg: 'nature', boss: 31, color: '#22a04a',
      desc: 'เรียงเศษส่วนจากน้อยไปมาก จับคู่เศษส่วนที่ค่าเท่ากันแต่เขียนต่างกัน และหาที่อยู่บนเส้นจำนวน',
      concept: 'เศษส่วนที่ตัวส่วนเท่ากัน ตัวเศษมากกว่าจะมีค่ามากกว่า เศษส่วนบางคู่เขียนต่างกันแต่ค่าเท่ากัน เช่น 1/2 = 2/4 = 4/8' },
    { id: 3, grade: 'ป.4', skill: 'เศษเกินและจำนวนคละ', title: 'เศษเกินและจำนวนคละ', hero: 's3', bg: 'autumn', boss: 26, color: '#ff8a2b',
      desc: 'ใส่ชิ้นพิซซ่าลงกล่องให้เต็ม แล้วแปลงเศษเกินกับจำนวนคละไปมาให้ถูก',
      concept: 'เศษเกินคือเศษส่วนที่ตัวเศษมากกว่าหรือเท่ากับตัวส่วน แปลงเป็นจำนวนคละได้โดยดูว่าเต็มกล่องได้กี่กล่องและเหลือกี่ชิ้น เช่น 11/4 = 2 3/4' },
    { id: 4, grade: 'ป.4', skill: 'บวกลบเศษส่วน', title: 'บวกลบเศษส่วน', hero: 's1', bg: 'reef', boss: 12, color: '#7c4af0',
      desc: 'ช่วยร้านพิซซ่าคิดเลข บวกและลบเศษส่วนที่ตัวส่วนเท่ากัน แล้วลากตัวเลขไปใส่ช่องคำตอบ',
      concept: 'บวกหรือลบเศษส่วนที่ตัวส่วนเท่ากัน ให้บวกหรือลบที่ตัวเศษ ส่วนตัวส่วนไม่เปลี่ยน ถ้าได้ตัวเศษมากกว่าตัวส่วนให้เขียนเป็นจำนวนคละ' }
  ];
  const TITLES = [
    ['ตัดตามสั่ง แบ่งสามถึงห้าส่วน', 'ตัดตามสั่ง แบ่งห้าถึงแปดส่วน', 'เลือกถาดที่ตัดถูกแบบ', 'ภาพนี้คือเศษส่วนอะไร', 'จับคู่สี่ภาพ', 'พิซซ่ากับแท่งช็อกโกแลต', 'เส้นจำนวนครั้งแรก', 'เส้นจำนวนหลายช่อง', 'สองลูกค้าสองถาด', 'ด่านบอส: ร้านคนแน่น'],
    ['เรียงเศษส่วนสามใบ', 'เรียงสี่ใบ', 'เรียงห้าใบ', 'เศษส่วนที่เท่ากัน', 'เท่ากันสี่คู่', 'เท่ากันหลอกตา', 'เท่ากันบนเส้นจำนวน', 'ตัวเศษเท่ากัน ตัวส่วนต่างกัน', 'เท่ากันหกคู่', 'ด่านบอส: เรียงให้ได้ทั้งแถว'],
    ['ใส่กล่องพิซซ่า', 'กล่องที่สอง', 'เต็มสามกล่อง', 'เศษเกินหรือจำนวนคละ', 'จับคู่สี่ภาพ', 'เศษเกินบนเส้นจำนวน', 'กล่องเยอะแล้ว', 'จำนวนคละหลอกตา', 'ห้าภาพรวด', 'ด่านบอส: คลังพิซซ่าใหญ่'],
    ['บวกพิซซ่าสองถาด', 'ลบพิซซ่าที่ขายไป', 'บวกลบผสม', 'บวกแล้วได้มากกว่าหนึ่ง', 'ลบจากถาดเต็ม', 'ตอบเป็นจำนวนคละ', 'บวกลบสามจำนวน', 'ออเดอร์ยุ่ง', 'ทั้งวันที่ร้าน', 'ด่านบอส: ร้านพิซซ่าวันหยุด']
  ];
  const MON_NAME = { 12: 'สิงโตแผงทอง', 13: 'แกะสายฟ้า', 14: 'เต่ามอสส์', 15: 'ฟีนิกซ์เมฆ', 17: 'แมงกะพรุนโคม', 20: 'เห็ดยักษ์', 23: 'กระต่ายจันทร์', 24: 'นกยูงปริซึม', 25: 'หอยทากแนวปะการัง', 26: 'หมูป่าหนอง', 28: 'จามรีหิน', 29: 'จระเข้โกงกาง', 30: 'กระเบนออโรรา', 31: 'กวางจันทร์' };
  const NORMAL = [13, 14, 17, 20, 23, 24, 25, 28, 29, 30];
  const monsterFor = rng => NORMAL[Math.floor(rng() * NORMAL.length)];

  /* ---------- โลก 1: ตัดพิซซ่าตามสั่ง ---------- */
  // cfg: orders = [[a, b], ...] (สั่ง a/b ถาด) · dist = จำนวนตัวหลอก (พิซซ่าอีกถาดที่แบ่งคนละส่วน)
  const CUT = [
    null,
    { dens: [3, 4, 5], orders: 1, dist: false }, { dens: [5, 6, 7, 8], orders: 1, dist: false }, { dens: [6, 8], orders: 1, dist: true },
    null, null, null, null, null, { dens: [4, 5, 6, 8, 10], orders: 2, dist: false }
  ];
  function cutLevel(n, rng) {
    const C = CUT[n], items = [], zones = [], checks = []; let k = 0, dens = [];
    if (C.orders === 1) { const b = pickOne(C.dens, rng); dens = [b]; if (C.dist) { let b2; do { b2 = pickOne([3, 4, 5, 6, 8], rng); } while (b2 === b || b + b2 > 14); dens.push(b2); } }
    else { const pairs = [[8, 6], [6, 4], [10, 4], [8, 5], [6, 5], [5, 4], [8, 3], [4, 3]]; dens = pickOne(pairs, rng).slice(); if (rng() < 0.5) dens.reverse(); }
    const orders = (C.orders === 1 ? [dens[0]] : dens).map(b => ({ b, a: ri(b > 2 ? 2 : 1, b - 1, rng) }));
    dens.forEach(b => { for (let i = 0; i < b; i++) items.push(mkSlice('i' + (k++), b)); });
    orders.forEach((o, i) => {
      const zid = orders.length === 1 ? 'plate' : 'plate' + (i + 1);
      zones.push({ id: zid, kind: 'plate', acc: { k: 'den', v: o.b }, cap: o.a, q: { a: o.a, b: o.b } });
      checks.push({ text: 'ใส่ชิ้น 1/' + o.b + ' ลงจานให้ครบ ' + o.a + ' ชิ้น (ลูกค้าสั่ง ' + o.a + '/' + o.b + ' ถาด)', full: [zid] });
    });
    const desc = orders.length === 1 ? 'ลูกค้าสั่งพิซซ่า ' + orders[0].a + '/' + orders[0].b + ' ถาด ใช้ชิ้น 1/' + orders[0].b + ' ใส่ลงจานให้ได้ ' + orders[0].a + ' ชิ้น' : 'มีลูกค้า 2 คน สั่งพิซซ่าถาดที่แบ่งไม่เท่ากัน ดูให้ดีว่าต้องใช้ชิ้นแบบไหนใส่จานใบไหน';
    return { kind: 'cut', desc, zones, items: shuffle(items, rng), checks, orders };
  }

  /* ---------- จับคู่การ์ดกับภาพ (match = เศษส่วนเดียวกัน, eq = ค่าเท่ากัน) ---------- */
  // cfg: pics = จำนวนภาพ · dens = ตัวส่วนที่ใช้ · dist = การ์ดหลอก · shapes
  const MATCH = {
    1: { 4: { pics: 3, dens: [3, 4, 5, 6], dist: 0, shapes: 'pie' }, 5: { pics: 4, dens: [4, 5, 6, 8], dist: 1, shapes: 'pie' }, 6: { pics: 5, dens: [4, 5, 6, 8, 10], dist: 1, shapes: 'mix' }, 10: { pics: 6, dens: [5, 6, 8, 10, 12], dist: 2, shapes: 'mix' } },
    2: { 4: { pics: 3, dens: [2, 3, 4, 6], dist: 0, shapes: 'pie' }, 5: { pics: 4, dens: [2, 3, 4, 5, 6], dist: 1, shapes: 'mix' }, 6: { pics: 5, dens: [2, 3, 4, 5, 6], dist: 2, shapes: 'mix' }, 9: { pics: 6, dens: [2, 3, 4, 5, 6], dist: 2, shapes: 'mix' } }
  };
  function matchLevel(world, n, rng) {
    const C = MATCH[world][n], eq = world === 2, zones = [], items = [], checks = []; const used = new Set(), usedVal = new Set(); let k = 0;
    const picks = [];
    let guard = 0;
    while (picks.length < C.pics && guard++ < 500) {
      let d, nn, cd, cn;
      if (eq) { // ค่าเท่ากัน: ภาพแบ่ง pd ส่วน การ์ดคนละตัวส่วน
        const bd = pickOne([2, 3, 4, 5, 6], rng), bn = ri(1, bd - 1, rng), g = E.gcd(bn, bd), rn = bn / g, rd = bd / g;
        const ms = shuffle([1, 2, 3, 4, 5, 6].filter(m => rd * m <= 12), rng); if (ms.length < 2) continue;
        d = rd * ms[0]; nn = rn * ms[0]; cd = rd * ms[1]; cn = rn * ms[1];
        if (usedVal.has(vstr(nn, d))) continue;
      } else {
        d = pickOne(C.dens, rng); nn = ri(1, d - 1, rng); cd = d; cn = nn;
        if (usedVal.has(vstr(nn, d)) || used.has(fstr(nn, d))) continue;
      }
      usedVal.add(vstr(nn, d)); used.add(fstr(nn, d)); picks.push({ n: nn, d, cn, cd });
    }
    picks.forEach((p, i) => {
      const zid = 'pic' + (i + 1), shape = C.shapes === 'pie' ? 'pie' : C.shapes === 'bar' ? 'bar' : pickOne(['pie', 'bar'], rng);
      zones.push({ id: zid, kind: 'pic', acc: eq ? { k: 'val', v: vstr(p.n, p.d) } : { k: 'frac', v: fstr(p.n, p.d) }, pic: { n: p.n, d: p.d, shape }, cap: 1 });
      const id = 'i' + (k++); items.push(mkCard(id, p.cn, p.cd)); checks.push({ text: 'จับคู่การ์ดกับภาพที่ ' + (i + 1), items: [id] });
    });
    // การ์ดหลอก: ตัวเลขใกล้เคียงแต่ไม่ตรงกับภาพใดเลย
    let dist = 0; guard = 0;
    while (dist < C.dist && guard++ < 500) {
      const p = pickOne(picks, rng), d = p.cd, nn = pickOne([p.cn + 1, p.cn - 1, d - p.cn], rng), val = nn > 0 && nn < d ? vstr(nn, d) : null;
      if (!val || usedVal.has(val) || used.has(fstr(nn, d))) continue;
      used.add(fstr(nn, d)); items.push(mkCard('i' + (k++), nn, d)); dist++;
    }
    return { kind: eq ? 'eq' : 'match', desc: eq ? 'ภาพแต่ละใบเขียนเป็นเศษส่วนได้หลายแบบ ลากการ์ดที่มีค่าเท่ากับภาพไปวางใต้ภาพ' : 'ดูว่าภาพแบ่งเป็นกี่ส่วนและระบายไว้กี่ส่วน แล้วลากการ์ดเศษส่วนที่ตรงกันไปวางใต้ภาพ', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- เส้นจำนวน ---------- */
  // cfg: d = ตัวส่วนของขีด · R = ความยาวเส้น (1 = 0 ถึง 1, 2 = 0 ถึง 2) · K = จำนวนการ์ด · mode = frac (ตรงตัว) | val (ค่าเท่ากัน)
  const LINE = {
    '1:7': { d: 4, R: 1, K: 3, mode: 'frac' }, '1:8': { d: 8, R: 1, K: 4, mode: 'frac' },
    '2:7': { d: 8, R: 1, K: 4, mode: 'val' }, '3:6': { d: 4, R: 2, K: 4, mode: 'frac' }
  };
  function lineLevel(world, n, rng) {
    const C = LINE[world + ':' + n], zones = [], items = [], checks = []; let k = 0;
    let ticks = [];
    if (C.mode === 'val') ticks = shuffle([[2, 8], [3, 8], [4, 8], [6, 8]], rng).slice(0, C.K).sort((a, b) => a[0] - b[0]);
    else { const all = []; for (let i = 1; i < C.R * C.d; i++) if (i % C.d !== 0) all.push(i); ticks = shuffle(all, rng).slice(0, C.K).sort((a, b) => a - b).map(i => [i, C.d]); }
    ticks.forEach((t, i) => {
      const zid = 'tk' + (i + 1);
      const cn = C.mode === 'val' ? (t[0] === 2 ? 1 : t[0] === 3 ? 3 : t[0] === 4 ? 2 : 3) : t[0], cd = C.mode === 'val' ? (t[0] === 2 ? 4 : t[0] === 3 ? 8 : t[0] === 4 ? 4 : 4) : t[1];
      zones.push({ id: zid, kind: 'tick', acc: C.mode === 'val' ? { k: 'val', v: vstr(t[0], t[1]) } : { k: 'frac', v: fstr(t[0], t[1]) }, tick: { i: t[0], d: t[1], R: C.R }, tickText: t[0] + '/' + t[1] + (t[0] > t[1] ? ' (เกินหนึ่ง)' : ''), cap: 1 });
      const id = 'i' + (k++); items.push(mkCard(id, cn, cd)); checks.push({ text: C.mode === 'val' ? 'วางการ์ด ' + fstr(cn, cd) + ' ให้ตรงจุดที่ค่าเท่ากัน' : 'วางการ์ด ' + fstr(cn, cd) + ' บนเส้นจำนวน', items: [id] });
    });
    return { kind: 'line', line: { d: C.d, R: C.R }, desc: C.mode === 'val' ? 'เส้นจำนวนนี้แบ่งเป็นช่องละ 1/' + C.d + ' การ์ดบางใบเขียนด้วยตัวส่วนอื่นแต่ค่าเท่ากับจุดบนเส้น ลากไปวางให้ตรงจุด' : (C.R > 1 ? 'เส้นจำนวนยาวถึง ' + C.R + ' แบ่งเป็นช่องละ 1/' + C.d + ' เศษเกินจะอยู่เลยหนึ่งไปทางขวา' : 'เส้นจำนวนนี้แบ่งเป็นช่องละ 1/' + C.d + ' นับจาก 0 ไปทางขวาแล้ววางการ์ดให้ตรงจุด'), zones, items: shuffle(items, rng), checks };
  }

  /* ---------- โลก 2: เรียงจากน้อยไปมาก ---------- */
  const ORDER = { 1: { cnt: 3, dens: [4, 5, 6], same: 'den', help: true }, 2: { cnt: 4, dens: [6, 7, 8], same: 'den', help: true }, 3: { cnt: 5, dens: [8, 9, 10], same: 'den', help: false }, 8: { cnt: 5, same: 'num', help: true }, 10: { cnt: 6, dens: [12], same: 'den', help: false } };
  function orderLevel(n, rng) {
    const C = ORDER[n], zones = [], items = [], checks = []; let cards = [];
    if (C.same === 'den') { const d = pickOne(C.dens, rng), nums = shuffle(Array.from({ length: d - 1 }, (_, i) => i + 1), rng).slice(0, C.cnt).sort((a, b) => a - b); cards = nums.map(x => [x, d]); }
    else { const dd = shuffle([2, 3, 4, 5, 6, 8, 10], rng).slice(0, C.cnt).sort((a, b) => b - a); cards = dd.map(d => [1, d]); }   // ตัวส่วนมากค่าน้อย: เรียงตัวส่วนจากมากไปน้อย
    cards.forEach((c, i) => { zones.push({ id: 'rk' + (i + 1), kind: 'rank', acc: { k: 'rank', v: i + 1 }, cap: 1, label: String(i + 1) }); });
    const ids = []; cards.forEach((c, i) => { const id = 'i' + i; ids.push(id); items.push(mkCard(id, c[0], c[1], { rank: i + 1 })); });
    checks.push({ text: 'เรียงการ์ดจากน้อยไปมากให้ครบ ' + cards.length + ' ใบ', items: ids });
    return { kind: 'order', help: C.help, same: C.same, desc: C.same === 'num' ? 'การ์ดทุกใบมีตัวเศษเป็น 1 แต่แบ่งไม่เท่ากัน ยิ่งแบ่งเป็นหลายส่วน ชิ้นแต่ละชิ้นยิ่งเล็ก เรียงจากชิ้นเล็กที่สุดไปใหญ่ที่สุด' : 'เรียงเศษส่วนจากน้อยไปมาก ซ้ายสุดคือน้อยที่สุด เศษส่วนที่ตัวส่วนเท่ากัน ดูที่ตัวเศษ', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- โลก 3: ใส่ชิ้นพิซซ่าลงกล่อง ---------- */
  const PACK = { 1: { dens: [2, 3, 4], boxes: [1, 2] }, 2: { dens: [4, 5], boxes: [2, 2] }, 3: { dens: [3, 4, 5], boxes: [2, 3] }, 7: { dens: [4, 5, 6], boxes: [2, 3] } };
  function packLevel(n, rng) {
    const C = PACK[n]; let b, k, r, guard = 0;
    do { b = pickOne(C.dens, rng); k = ri(C.boxes[0], C.boxes[1], rng); r = ri(1, b - 1, rng); } while (k * b + r > (n >= 7 ? 14 : 12) && guard++ < 100);
    if (k * b + r > 14) { k = 2; b = 4; r = 3; }
    const items = [], zones = [], checks = []; for (let i = 0; i < k * b + r; i++) items.push(mkSlice('i' + i, b));
    for (let i = 1; i <= k; i++) { zones.push({ id: 'box' + i, kind: 'box', acc: { k: 'den', v: b }, cap: b, label: 'กล่องที่ ' + i }); checks.push({ text: 'ใส่ชิ้น 1/' + b + ' ลงกล่องที่ ' + i + ' ให้เต็ม ' + b + ' ชิ้น', full: ['box' + i] }); }
    return { kind: 'pack', pack: { b, k, r, total: k * b + r }, desc: 'พิซซ่า 1 กล่องใส่ได้ ' + b + ' ชิ้น (ชิ้นละ 1/' + b + ') ใส่ชิ้นลงกล่องให้เต็มทุกกล่อง ชิ้นที่เหลือคือส่วนเกินกล่อง', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- โลก 3: จับคู่เศษเกินกับจำนวนคละ ---------- */
  const CONV = { 4: { pics: 3, dens: [3, 4, 5], dist: 0 }, 5: { pics: 4, dens: [3, 4, 5, 6], dist: 0 }, 8: { pics: 5, dens: [3, 4, 5, 6], dist: 0 }, 9: { pics: 4, dens: [3, 4, 5, 6], dist: 2 }, 10: { pics: 6, dens: [3, 4, 5, 6, 8], dist: 2 } };
  function convLevel(n, rng) {
    const C = CONV[n], zones = [], items = [], checks = [], used = new Set(); let k = 0, guard = 0; const picks = [];
    while (picks.length < C.pics && guard++ < 500) { const b = pickOne(C.dens, rng), w = ri(1, 3, rng), r = ri(1, b - 1, rng), nn = w * b + r, key = fstr(nn, b); if (used.has(key)) continue; used.add(key); picks.push({ b, w, r, n: nn }); }
    picks.forEach((p, i) => {
      const z = id => ({ id, kind: 'pic', cap: 1, pic: { n: p.n, d: p.b, total: p.n, whole: p.w, rest: p.r, shape: 'pie', conv: true } });
      zones.push(Object.assign(z('imp' + (i + 1)), { acc: { k: 'imp', v: fstr(p.n, p.b) }, slot: 'imp', group: i }));
      zones.push(Object.assign(z('mix' + (i + 1)), { acc: { k: 'mix', v: mstr(p.n, p.b) }, slot: 'mix', group: i }));
      const a = 'i' + (k++), bb = 'i' + (k++); items.push(mkImp(a, p.n, p.b)); items.push(mkMix(bb, p.n, p.b)); checks.push({ text: 'จับคู่เศษเกินและจำนวนคละของภาพที่ ' + (i + 1), items: [a, bb] });
    });
    let dist = 0; guard = 0;
    while (dist < C.dist && guard++ < 500) {
      const p = pickOne(picks, rng);
      if (dist % 2 === 0) { const nn = p.n + pickOne([1, -1], rng), key = fstr(nn, p.b); if (nn <= p.b || used.has(key)) continue; used.add(key); items.push(mkImp('i' + (k++), nn, p.b)); }
      else { const w = p.w + pickOne([1, -1], rng), r = p.r; if (w < 1) continue; const nn = w * p.b + r, key = fstr(nn, p.b); if (used.has(key)) continue; used.add(key); items.push(mkMix('i' + (k++), nn, p.b)); }
      dist++;
    }
    return { kind: 'conv', desc: 'ภาพแต่ละใบมีพิซซ่าเต็มกล่องและชิ้นที่เหลือ เขียนได้ทั้งเศษเกิน (นับชิ้นทั้งหมด) และจำนวนคละ (กล่องเต็มกับเศษ) ลากการ์ดไปใส่ให้ครบทั้งสองช่อง', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- โลก 4: บวกลบเศษส่วน (ตอบด้วยการลากตัวเลขลงช่อง) ---------- */
  // ชนิดโจทย์: add (ผลน้อยกว่าหนึ่ง) · sub · addmix (ผลมากกว่าหนึ่ง ตอบเป็นจำนวนคละ) · subwhole (1 ลบเศษส่วน) · three (a + c − e)
  const CALC = {
    1: { q: ['add', 'add'], dens: [5, 6, 7, 8] }, 2: { q: ['sub', 'sub'], dens: [5, 6, 7, 8] }, 3: { q: ['add', 'sub', 'add'], dens: [6, 8, 9, 10] },
    4: { q: ['addmix', 'addmix'], dens: [4, 5, 6, 8] }, 5: { q: ['subwhole', 'add', 'sub'], dens: [6, 8, 10] }, 6: { q: ['addmix', 'addmix', 'addmix'], dens: [6, 8, 10, 12] },
    7: { q: ['three', 'three'], dens: [6, 8, 10, 12] }, 8: { q: ['add', 'addmix', 'sub'], dens: [6, 8, 10, 12] }, 9: { q: ['subwhole', 'three', 'addmix'], dens: [6, 8, 10, 12] }, 10: { q: ['three', 'addmix', 'subwhole'], dens: [8, 10, 12] }
  };
  function makeQ(type, dens, rng) {
    const d = pickOne(dens, rng); let a, c, e, text, pics, ans;
    if (type === 'add') { a = ri(1, d - 2, rng); c = ri(1, d - 1 - a, rng); ans = { n: a + c, d }; text = 'ร้านมีพิซซ่า ' + a + '/' + d + ' ถาด วันนี้อบเพิ่มอีก ' + c + '/' + d + ' ถาด รวมมีพิซซ่าเท่าไร'; pics = [{ n: a, d }, '+', { n: c, d }]; }
    else if (type === 'sub') { a = ri(3, d - 1, rng); c = ri(1, a - 1, rng); ans = { n: a - c, d }; text = 'ร้านมีพิซซ่า ' + a + '/' + d + ' ถาด ขายไป ' + c + '/' + d + ' ถาด เหลือพิซซ่าเท่าไร'; pics = [{ n: a, d }, '−', { n: c, d }]; }
    else if (type === 'addmix') { do { a = ri(2, d - 1, rng); c = ri(2, d - 1, rng); } while (a + c <= d || a + c === 2 * d); const t = a + c, m = mixed(t, d); ans = { w: m.w, n: m.n, d }; text = 'ร้านมีพิซซ่า ' + a + '/' + d + ' ถาด และอบเพิ่มอีก ' + c + '/' + d + ' ถาด รวมเป็นกี่ถาด (ตอบเป็นจำนวนคละ)'; pics = [{ n: a, d }, '+', { n: c, d }]; }
    else if (type === 'subwhole') { c = ri(1, d - 1, rng); ans = { n: d - c, d }; text = 'มีพิซซ่า 1 ถาดเต็ม ลูกค้ากินไป ' + c + '/' + d + ' ถาด เหลือพิซซ่าเท่าไร (1 ถาด = ' + d + '/' + d + ')'; pics = [{ n: d, d }, '−', { n: c, d }]; }
    else { do { a = ri(2, d - 2, rng); c = ri(1, d - 1 - a, rng); e = ri(1, a + c - 1, rng); } while (a + c > d - 1 || a + c - e < 1); ans = { n: a + c - e, d }; text = 'ร้านมีพิซซ่า ' + a + '/' + d + ' ถาด อบเพิ่ม ' + c + '/' + d + ' ถาด แล้วขายไป ' + e + '/' + d + ' ถาด เหลือพิซซ่าเท่าไร'; pics = [{ n: a, d }, '+', { n: c, d }, '−', { n: e, d }]; }
    const tip = type === 'addmix' ? 'บวกที่ตัวเศษ ตัวส่วนไม่เปลี่ยน ถ้าตัวเศษมากกว่าตัวส่วนให้แยกเป็นจำนวนเต็มกับเศษส่วน' : (type === 'add' ? 'บวกกันที่ตัวเศษ ตัวส่วนยังเท่าเดิม' : type === 'three' ? 'ทำทีละขั้นจากซ้ายไปขวา บวกหรือลบที่ตัวเศษ ตัวส่วนยังเท่าเดิม' : 'ลบกันที่ตัวเศษ ตัวส่วนยังเท่าเดิม');
    return { type, d, text, pics, ans, tip };
  }
  function calcLevel(n, rng) {
    const C = CALC[n], zones = [], items = [], checks = []; const qs = C.q.map(t => makeQ(t, C.dens, rng)); let k = 0;
    const needVals = [];
    qs.forEach((q, i) => {
      const id = 'q' + (i + 1), ids = [];
      const mk = (suffix, v, part) => { zones.push({ id: id + suffix, kind: 'ans', acc: { k: 'tv', v }, cap: 1, part, tip: q.tip, q: i }); ids.push(id + suffix); needVals.push(v); };
      if (q.ans.w !== undefined) mk('_w', q.ans.w, 'จำนวนเต็ม');
      mk('_n', q.ans.n, 'ตัวเศษ'); mk('_d', q.ans.d, 'ตัวส่วน');
      checks.push({ text: 'ตอบข้อที่ ' + (i + 1) + ' (ลากตัวเลขลงช่องคำตอบ)', full: ids });
    });
    needVals.forEach(v => items.push(mkNum('i' + (k++), v)));
    // ตัวเลขหลอก: ค่าที่เด็กมักตอบผิด (บวกตัวส่วนด้วย ลบแล้วสลับ ฯลฯ) ต้องไม่ซ้ำกับค่าที่ต้องใช้ และรวมกันไม่เกิน 14 ชิ้น
    const distCount = Math.min(14 - items.length, n >= 8 ? 4 : n >= 4 ? 4 : 3); const cand = [];
    qs.forEach(q => { const a = q.ans; cand.push(q.d * 2, a.n + 1, a.n - 1, a.d + 1, a.d - 1, (a.w || 0) + 1); });
    const need = new Set(needVals), pool = shuffle(Array.from(new Set(cand)).filter(v => v > 0 && v <= 24 && !need.has(v)), rng);
    for (let i = 0; i < distCount && i < pool.length; i++) items.push(mkNum('i' + (k++), pool[i]));
    return { kind: 'calc', qs, desc: 'อ่านโจทย์แต่ละข้อ แล้วลากตัวเลขไปใส่ช่องคำตอบ ช่องบนคือตัวเศษ ช่องล่างคือตัวส่วน (ถ้ามีช่องซ้ายสุดคือจำนวนเต็ม)', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- สร้างด่าน ---------- */
  const KINDS = [
    null,
    [null, 'cut', 'cut', 'cut', 'match', 'match', 'match', 'line', 'line', 'cut', 'match'],
    [null, 'order', 'order', 'order', 'match', 'match', 'match', 'line', 'order', 'match', 'order'],
    [null, 'pack', 'pack', 'pack', 'conv', 'conv', 'line', 'pack', 'conv', 'conv', 'conv'],
    [null, 'calc', 'calc', 'calc', 'calc', 'calc', 'calc', 'calc', 'calc', 'calc', 'calc']
  ];
  const cache = {};
  function makeLevel(world, n, seed) {
    const seeded = seed != null, rng = rngOf(seeded ? seed : world * 1000 + n * 53 + 7), kind = KINDS[world][n];
    let L;
    if (kind === 'cut') L = cutLevel(n, rng);
    else if (kind === 'match') L = matchLevel(world, n, rng);
    else if (kind === 'line') L = lineLevel(world, n, rng);
    else if (kind === 'order') L = orderLevel(n, rng);
    else if (kind === 'pack') L = packLevel(n, rng);
    else if (kind === 'conv') L = convLevel(n, rng);
    else L = calcLevel(n, rng);
    L.world = world; L.id = n; L.title = TITLES[world - 1][n - 1]; L.seed = seeded ? seed : null;
    L.monsters = n === 10 ? [WORLDS[world - 1].boss] : [monsterFor(rng)]; L.boss = n === 10;
    L.zones.push({ id: 'tray', kind: 'tray' });
    L.par = E.plan(L, E.init(L)).length;
    return L;
  }
  function getLevel(world, n) { const k = world + ':' + n; return cache[k] || (cache[k] = makeLevel(world, n)); }

  const api = { WORLDS, TITLES, MON_NAME, NORMAL, KINDS, makeLevel, getLevel, rngOf, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SL_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
