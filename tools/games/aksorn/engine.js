/* ===== Techno Aksorn: ตรรกะสร้างกิจกรรม (ไม่แตะหน้าจอ ทดสอบด้วย node test_engine.js) =====
   ทุกกิจกรรมสร้างจากบทเรียน (LESSONS) + ระดับชั้น + เมล็ดสุ่ม · ตัวเลือกลวงเลือกจากตัวที่หน้าตาคล้ายกันก่อน (ยิ่งชั้นสูงยิ่งคล้าย) */
const AK = (function () {
  'use strict';
  function rng(seed) { let a = (seed >>> 0) || 1; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const shuf = (arr, R) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const pickN = (arr, n, R) => shuf(arr, R).slice(0, n);
  const uniq = arr => arr.filter((x, i) => arr.indexOf(x) === i);

  // ตัวอักษรหน้าตาคล้ายกัน (ใช้เป็นตัวลวงที่ท้าทาย)
  const LOOKALIKE = [['ก', 'ภ', 'ถ', 'ฤ'], ['ข', 'ช', 'ฃ', 'ซ'], ['ค', 'ด', 'ต', 'ศ', 'ฅ'], ['บ', 'ป', 'ษ', 'ย'], ['ผ', 'ฝ', 'พ', 'ฟ', 'ฬ'], ['ม', 'ฆ', 'น', 'ณ'], ['ร', 'ธ', 'ว', 'ฐ'],
    ['ล', 'ส', 'ศ', 'ห'], ['อ', 'ฮ', 'ฒ', 'ฮ'], ['ท', 'ฑ', 'ห'], ['ฎ', 'ฏ', 'ญ', 'ฐ'], ['จ', 'ฉ', 'ง'], ['ฌ', 'ณ', 'ญ']];
  const VLOOK = [['a', 'aa', 'or'], ['i', 'ii', 'ue', 'uue'], ['u', 'uu'], ['e', 'ee', 'ae', 'aae'], ['o', 'oo', 'oor'], ['oe', 'oee', 'iaa', 'ia'], ['ueaa', 'uea', 'uaa', 'ua'], ['am', 'ai1', 'ai2', 'ao'], ['rue', 'ruee', 'lue', 'luee']];
  const isCons = l => l.zone === 'cons';
  const allCons = () => CONS.map(c => c[0]);
  const allVow = () => VOWELS.map(v => v[0]);
  const look = (x, cons_) => { const g = (cons_ ? LOOKALIKE : VLOOK).filter(gr => gr.includes(x)); return uniq([].concat(...g)).filter(y => y !== x); };
  // จำนวนตัวเลือกตามชั้น
  const nOpts = lv => [3, 4, 5, 6][lv] || 4;

  // รายการของบทเรียนที่ระดับนี้ใช้ได้ (สระบางตัวเริ่ม ป.1 ขึ้นไป)
  function itemsOf(lesson, lv) { if (lesson.r2) return lesson.items.slice(); if (lesson.kind === 'change') return lesson.items.slice(); return lesson.items.slice(); }
  // ข้อมูลแสดงผลของหนึ่งรายการ
  function info(x) { const o = info0(x); if (o && o.label == null) o.label = o.say; return o; }
  function info0(x) {
    const r2 = typeof R2 !== 'undefined' ? R2.info(x) : null; if (r2) return r2;
    const c = cons(x); if (c) return { key: x, kind: 'c', text: c.ch, say: c.name, sub: c.word, pic: c.pic, cls: c.cls };
    const v = vow(x); if (v) return { key: x, kind: 'v', text: v.disp, label: v.label, say: v.name, sub: v.word, pic: v.pic, len: v.len, ex: v.ex };
    const h = chg(x); if (h) return { key: x, kind: 'h', text: h.to, from: h.from, say: h.rule, label: dashify(h.rule), sub: h.name, pic: null, ex: h.cf.map(p => changeWord(h, p[0], p[1])), chg: h };
    return { key: x, kind: 'g', text: x, say: TONE_NAME[x] || DIGIT_NAME[x] || x, sub: '', pic: null };
  }
  // ตัวลวง: คล้ายกันก่อน (ป.2–3 ใช้ตัวคล้ายมาก) แล้วเติมจากบทเรียน/ทั้งหมด
  function distractors(target, lesson, lv, n, R) {
    const consMode = isCons(lesson), pool = lesson.r2 && lesson.pool ? lesson.pool.slice() : consMode ? allCons() : allVow();
    let out = [];
    if (lv >= 1) out = shuf(look(target, consMode).filter(x => pool.includes(x)), R).slice(0, lv >= 2 ? n : Math.ceil(n / 2));
    shuf(itemsOf(lesson, lv).filter(x => x !== target && !out.includes(x)), R).forEach(x => { if (out.length < n) out.push(x); });
    shuf(pool.filter(x => x !== target && !out.includes(x)), R).forEach(x => { if (out.length < n) out.push(x); });
    return out.slice(0, n);
  }

  /* ---------- กิจกรรมของบทเรียน ---------- */
  const ACT_META = {
    learn: { th: 'เรียนรู้', icon: 'learn', color: '#ffb02e', desc: 'ดูภาพ ฟังเสียง อ่านชื่อ' },
    trace: { th: 'เขียนตามรอย', icon: 'trace', color: '#ff7a3c', desc: 'เขียนทับรอยจาง ๆ หรือเขียนเองอย่างอิสระ' },
    listen: { th: 'ฟังแล้วแตะ', icon: 'listen', color: '#3d8bff', desc: 'ฟังเสียงแล้วแตะตัวที่ได้ยิน' },
    match: { th: 'จับคู่ภาพ', icon: 'match', color: '#17c4a8', desc: 'ลากตัวอักษรไปวางที่ภาพ' },
    balloon: { th: 'ยิงลูกโป่ง', icon: 'balloon', color: '#ff5a8a', desc: 'แตะลูกโป่งที่มีตัวตามโจทย์' },
    fish: { th: 'ตกปลาสระ', icon: 'fish', color: '#2aa8e8', desc: 'แตะปลาที่มีสระตามโจทย์' },
    memory: { th: 'เปิดป้าย', icon: 'memory', color: '#9a5ae8', desc: 'เปิดป้ายหาคู่ที่เข้ากัน' },
    classsort: { th: 'แยกหมู่อักษร', icon: 'sort', color: '#58c864', desc: 'อักษรกลาง สูง ต่ำ' },
    lengthsort: { th: 'สระสั้นยาว', icon: 'sort', color: '#58c864', desc: 'แยกเสียงสั้นกับเสียงยาว' },
    compose: { th: 'ประสมคำ', icon: 'compose', color: '#ff8a1e', desc: 'เลือกสระให้ได้คำที่ได้ยิน' },
    change: { th: 'เติมตัวสะกด', icon: 'change', color: '#e8452c', desc: 'เติมตัวสะกดแล้วสระเปลี่ยนรูปเป็นอะไร' }
  };
  function activities(lesson, lv) {
    if (lesson.acts) return lesson.acts.slice();
    if (lesson.kind === 'change') return ['learn', 'trace', 'change'];
    if (isCons(lesson)) return ['learn', 'trace', 'listen', 'match', 'balloon', 'memory', 'classsort'];
    return ['learn', 'trace', 'listen', 'fish', 'memory', 'compose', 'lengthsort'];
  }

  // 1) ฟังแล้วแตะ: 6 ข้อ
  function makeListen(lesson, lv, seed) {
    const R = rng(seed), items = itemsOf(lesson, lv), n = nOpts(lv) - 1, rounds = [];
    const order = shuf(items, R); while (order.length < 6) order.push(...shuf(items, R));
    order.slice(0, 6).forEach(t => rounds.push({ target: t, opts: shuf([t].concat(distractors(t, lesson, lv, n, R)), R) }));
    return rounds;
  }
  // 2) ยิงลูกโป่ง/ตกปลา: 3 เป้าหมาย เป้าละ 3 ลูก ตัวลวงคล้ายกัน
  function makeShooter(lesson, lv, seed) {
    if (lesson.r2) return R2.shooter(lesson, lv, seed);
    const R = rng(seed), items = itemsOf(lesson, lv), targets = pickN(items, Math.min(3, items.length), R);
    while (targets.length < 3) targets.push(items[Math.floor(R() * items.length)]);
    return targets.map(t => ({ target: t, need: 3, decoys: distractors(t, lesson, lv, 3 + lv, R), speed: [0.7, 0.85, 1, 1.15][lv] }));
  }
  // 3) จับคู่ภาพ: 2 รอบ รอบละ 4 คู่ (ตัวอักษร ‹› ภาพ)
  function makeMatch(lesson, lv, seed) {
    if (lesson.r2) return R2.match(lesson, lv, seed);
    const R = rng(seed), items = itemsOf(lesson, lv).filter(x => info(x).pic), rounds = [];
    for (let r = 0; r < 2; r++) { const pick = pickN(items, Math.min(4, items.length), R); rounds.push({ pairs: pick, order: shuf(pick, R) }); }
    return rounds;
  }
  // 4) เปิดป้าย: 6 คู่ (พยัญชนะ: ตัว ‹› ภาพ · สระ: รูปสระ ‹› พยางค์ตัวอย่าง)
  const pairText = x => { const v = vow(x); return v.ex[0] !== v.form ? v.ex[0] : (v.word !== v.form ? v.word : null); };
  function makeMemory(lesson, lv, seed) {
    if (lesson.r2) return R2.memory(lesson, lv, seed);
    const R = rng(seed), consMode = isCons(lesson), okItem = x => consMode || pairText(x);
    let items = itemsOf(lesson, lv).filter(okItem);
    if (items.length < 6) items = items.concat(shuf((consMode ? allCons() : allVow()).filter(x => !items.includes(x) && okItem(x)), R)).slice(0, 6);
    const pick = pickN(items, 6, R), cards = [];
    pick.forEach((x, i) => { const f = info(x); cards.push({ id: 'a' + i, pair: i, kind: 'text', text: f.text, say: f.say }); cards.push(consMode ? { id: 'b' + i, pair: i, kind: 'pic', spec: f.pic, say: f.sub } : { id: 'b' + i, pair: i, kind: 'text', text: pairText(x), sub: 'ตัวอย่าง', say: pairText(x) }); });
    return { pairs: 6, cards: shuf(cards, R) };
  }
  // 5) แยกกลุ่ม: หมู่อักษร หรือ สระสั้น/ยาว (ทุกกลุ่มมีอย่างน้อย 2 ใบ รวม 8–9 ใบ ใช้ตัวในบทเรียนก่อน)
  function balanced(base, pool, groupOf, gids, R, max) {
    let items = uniq(base);
    gids.forEach(g => { shuf(pool.filter(x => groupOf(x) === g && !items.includes(x)), R).forEach(x => { if (items.filter(y => groupOf(y) === g).length < 2) items.push(x); }); });
    shuf(pool.filter(x => !items.includes(x)), R).forEach(x => { if (items.length < 8) items.push(x); });
    while (items.length > max) {
      const counts = gids.map(g => items.filter(y => groupOf(y) === g).length), big = gids[counts.indexOf(Math.max(...counts))];
      const cand = items.filter(y => groupOf(y) === big && !base.includes(y)); const rm = cand.length ? cand[cand.length - 1] : items.filter(y => groupOf(y) === big).pop();
      items = items.filter(y => y !== rm);
    }
    return shuf(items, R);
  }
  function makeSort(lesson, lv, seed, kind) {
    if (lesson.r2) return R2.sortSet(kind, lesson, lv, seed);
    const R = rng(seed);
    if (kind === 'classsort') {
      const items = balanced(itemsOf(lesson, lv), allCons(), x => cons(x).cls, ['m', 'h', 'l'], R, 9);
      return { title: 'แยกหมู่อักษร', groups: [{ id: 'm', th: 'อักษรกลาง', color: '#3d8bff' }, { id: 'h', th: 'อักษรสูง', color: '#ff5a8a' }, { id: 'l', th: 'อักษรต่ำ', color: '#58c864' }], items: items.map(x => ({ key: x, g: cons(x).cls })) };
    }
    const pool = allVow().filter(x => vow(x).len !== '-');
    const items = balanced(itemsOf(lesson, lv).filter(x => vow(x).len !== '-'), pool, x => vow(x).len, ['s', 'l'], R, 8);
    return { title: 'สระเสียงสั้น เสียงยาว', groups: [{ id: 's', th: 'เสียงสั้น', color: '#ff8a1e' }, { id: 'l', th: 'เสียงยาว', color: '#3d8bff' }], items: items.map(x => ({ key: x, g: vow(x).len })) };
  }
  // 6) ประสมคำ: พยัญชนะ + สระ › พยางค์ (เลือกสระให้ได้คำที่ได้ยิน) รูปสระเขียนด้วยขีด – แทนที่ของพยัญชนะ
  //    ฝึกสะกดช่วงแรกต้องเริ่มจากสระเสียงยาวก่อน (ครูบอก 25 ต.ค. 2569): อนุบาล–ป.1 ใช้เฉพาะสระเสียงยาว (ถ้าบทนั้นมี) ตัวลวงก็เป็นเสียงยาว สระเสียงสั้นเริ่มที่ ป.2
  const BASE_C = ['ก', 'จ', 'ด', 'ต', 'บ', 'ป', 'ม', 'น', 'ล', 'ร', 'ว', 'ย', 'ส', 'ค', 'ท', 'พ'];
  const hasSlot = v => vow(v).form.includes('–');
  const compose = (c, v) => { const f = vow(v).form; return f.includes('–') ? f.replace('–', c) : null; };
  function makeCompose(lesson, lv, seed) {
    // เรียงข้อ: สระเสียงยาวก่อน แล้วค่อยสระเสียงสั้น (ครูบอก: หัดสะกดช่วงแรกต้องเริ่มจากเสียงยาว) ตัวลวงของสระยาวเป็นเสียงยาวด้วย
    const R = rng(seed), all = itemsOf(lesson, lv).filter(hasSlot), longs = all.filter(v => vow(v).len === 'l'), shorts = all.filter(v => vow(v).len !== 'l'), rounds = [];
    const pool = allVow().filter(hasSlot), okD = (d, c, v) => d !== v && compose(c, d) !== compose(c, v) && (vow(v).len === 's' || vow(d).len !== 's');
    const order = shuf(longs, R).concat(shuf(shorts, R)); while (order.length < 6) order.push(...shuf(all, R));
    order.slice(0, 6).forEach(v => {
      const c = BASE_C[Math.floor(R() * BASE_C.length)], want = Math.min(3, nOpts(lv) - 1);
      const ds = distractors(v, lesson, lv, 5, R).filter(d => hasSlot(d) && okD(d, c, v)).slice(0, want);
      shuf(pool.filter(x => okD(x, c, v) && !ds.includes(x)), R).forEach(x => { if (ds.length < want) ds.push(x); });
      rounds.push({ c, v, word: compose(c, v), opts: shuf([v].concat(ds), R) });
    });
    return rounds;
  }
  // 7) สระเปลี่ยนรูป: ‘กะ + น’ เขียนให้ถูกเป็นคำไหน (ตัวลวง: ไม่เปลี่ยนรูป และเปลี่ยนตามกฎของสระตัวอื่น) 6 ข้อ
  function makeChange(lesson, lv, seed) {
    const R = rng(seed), list = CHANGES.map(r => chg(r[0])), rounds = [], order = shuf(list, R);
    order.slice(0, 6).forEach(h => {
      const cf = h.cf[Math.floor(R() * h.cf.length)], c = cf[0], f = cf[1], word = changeWord(h, c, f), unchanged = changeBase(h, c) + f;
      const wrongs = [unchanged].concat(shuf(list.filter(o => o.id !== h.id).map(o => changeWord(o, c, f)), R)).filter((w, i, a) => w !== word && a.indexOf(w) === i);
      const opts = shuf([word].concat(wrongs.slice(0, nOpts(Math.max(lv, 1)) - 1)), R);
      rounds.push({ id: h.id, c, f, base: changeBase(h, c), word, unchanged, opts, rule: h.rule, name: h.name });
    });
    return rounds;
  }
  // ดาวจากจำนวนพลาด/ใบ้
  const starsFor = (m, h, loose) => { const p = m + h; return loose ? (p <= 3 ? 3 : p <= 7 ? 2 : 1) : (p <= 1 ? 3 : p <= 3 ? 2 : 1); };
  // เหรียญที่ได้: ดาว×5 + โบนัสครั้งแรกที่ได้ 3 ดาว
  const coinsFor = (stars, prevBest) => stars * 5 + (stars === 3 && prevBest < 3 ? 10 : 0);

  return { rng, shuf, pickN, info, itemsOf, distractors, ACT_META, activities, makeListen, makeShooter, makeMatch, makeMemory, makeSort, makeCompose, makeChange, compose, starsFor, coinsFor, nOpts, BASE_C };
})();
