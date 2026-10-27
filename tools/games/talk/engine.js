/* ===== Techno Talk: ตรรกะของเกม (ไม่แตะหน้าจอ ทดสอบด้วย node test_engine.js) =====
   หน้าที่: ตรวจไวยากรณ์ของทุกประโยคในเนื้อหา · สร้างกิจกรรม 5 แบบของแต่ละหน่วย (จัดกลุ่ม โยงเส้น เปิดป้าย ลากวาง ถามตอบ) ด้วยเลขสุ่มที่กำหนดเมล็ดได้
   · อธิบายเหตุผลเมื่อตอบผิด (am/is/are, do/does, เติม s)
   ใช้ข้อมูลจาก content.js (UNITS, WORDS, allSents ฯลฯ) ที่อยู่ในขอบเขตเดียวกัน */
const TK = (function () {
  'use strict';

  /* ---------- เลขสุ่มกำหนดเมล็ด ---------- */
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const shuf = (arr, R) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const pickN = (arr, n, R) => shuf(arr, R).slice(0, n);

  /* ---------- ไวยากรณ์ ---------- */
  const PRON = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];
  const BE = { I: 'am', you: 'are', we: 'are', they: 'are', he: 'is', she: 'is', it: 'is' };
  const SING3 = p => p === 'he' || p === 'she' || p === 'it';
  const THIRD = { like: 'likes', run: 'runs', jump: 'jumps', swim: 'swims', dance: 'dances', sing: 'sings', walk: 'walks', read: 'reads', eat: 'eats', drink: 'drinks', have: 'has', go: 'goes', wake: 'wakes', brush: 'brushes', take: 'takes', do: 'does', play: 'plays', write: 'writes', fly: 'flies', sleep: 'sleeps' };
  const BASEOF = {}; Object.keys(THIRD).forEach(k => { BASEOF[THIRD[k]] = k; });
  const bare = t => String(t).replace(/[.,?!]/g, '').toLowerCase();
  const tail = t => (String(t).match(/[.,?!]+$/) || [''])[0];
  const recase = (orig, w) => (orig[0] !== orig[0].toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w);
  const tokenize = en => en.split(' ');
  const joinTokens = toks => toks.join(' ');
  const isSens = t => { const b = bare(t); return b === 'am' || b === 'is' || b === 'are' || b === 'do' || b === 'does' || (b in THIRD) || (b in BASEOF); };

  // ตรวจประโยค en ว่าสอดคล้องกับประธาน p หรือไม่ คืน { ok, why }
  function check(en, p) {
    const w = en.replace(/[.?!]/g, ' ').replace(/,/g, ' ').trim().split(/\s+/), lo = w.map(x => x.toLowerCase());
    const fail = why => ({ ok: false, why });
    if (!/^[A-Z]/.test(en)) return fail('ต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่');
    if (!/[.?!]$/.test(en)) return fail('ต้องมีเครื่องหมายจบประโยค');
    if (/\bI\b/.test(en.replace(/^I\b/, '')) === false && /\bi\b/.test(en)) return fail('I ต้องเป็นตัวพิมพ์ใหญ่');
    if (/\ba [aeiou]/i.test(en)) return fail('ก่อนสระต้องใช้ an');
    if (/\ban [^aeiou\s]/i.test(en)) return fail('an ใช้ก่อนเสียงสระ');
    let aux = null, subj = null, mainIdx = -1;
    const f = lo[0];
    if (['do', 'does', 'is', 'are', 'am'].includes(f)) { aux = f; subj = lo[1]; mainIdx = 2; }
    else if (['where', 'what', 'who'].includes(f)) { aux = lo[1]; subj = lo[2]; mainIdx = 3; }
    else if (f === 'yes' || f === 'no') { subj = lo[1]; aux = lo[2]; mainIdx = 3; }
    else { subj = f; aux = lo[1]; mainIdx = 2; }
    const subjP = subj === 'i' ? 'I' : subj;
    if (!PRON.includes(subjP)) return fail('ไม่พบประธานที่เป็นสรรพนาม: ' + subj);
    if (p && subjP !== p) return fail('ประธานในประโยค (' + subjP + ') ไม่ตรงกับที่ระบุ (' + p + ')');
    const isBe = aux === 'am' || aux === 'is' || aux === 'are';
    if (isBe) {
      if (BE[subjP] !== aux) return fail(subjP + ' ต้องใช้ ' + BE[subjP] + ' ไม่ใช่ ' + aux);
      if ((subjP === 'they' || subjP === 'we') && /\b(a|an) \w+/.test(lo.slice(mainIdx).join(' '))) return fail(subjP + ' เป็นพหูพจน์ ใช้ a/an ไม่ได้');
      return { ok: true };
    }
    if (aux === 'do' || aux === 'does') {
      const need = SING3(subjP) ? 'does' : 'do';
      if (aux !== need) return fail(subjP + ' ต้องใช้ ' + need + ' ไม่ใช่ ' + aux);
      let k = mainIdx; if (lo[k] === 'not') k++;
      const nx = lo[k];
      if (nx && (nx in BASEOF) && !(nx in THIRD)) return fail('หลัง ' + aux + ' กริยาต้องไม่เติม s');
      return { ok: true };
    }
    if (aux === 'can') { const nx = lo[mainIdx]; if (nx && (nx in BASEOF)) return fail('หลัง can กริยาต้องไม่เติม s'); return { ok: true }; }
    // กริยาหลักเป็นตัวที่ 2 ของประโยคบอกเล่า (I like / He likes / She brushes ...)
    if (aux in THIRD || aux in BASEOF) {
      const want = SING3(subjP) ? THIRD[aux in THIRD ? aux : BASEOF[aux]] : (aux in THIRD ? aux : BASEOF[aux]);
      if (aux !== want) return fail(subjP + ' ต้องใช้ ' + want + ' ไม่ใช่ ' + aux);
      return { ok: true };
    }
    return fail('ไม่รู้จักกริยา: ' + aux);
  }

  // รูปที่ผิดของคำกริยา/คำช่วยหนึ่งคำ (รักษาตัวพิมพ์ใหญ่และเครื่องหมายท้ายคำ) ใช้ทำตัวเลือกลวงและบอกเหตุผล
  function wrongForms(tok, p) {
    const b = bare(tok), t = tail(tok), out = [], add = w => out.push(recase(tok, w) + t);
    if (b === 'am' || b === 'is' || b === 'are') ['am', 'is', 'are'].forEach(w => { if (w !== BE[p]) add(w); });
    else if (b === 'do') add('does');
    else if (b === 'does') add('do');
    else if (b in THIRD) add(THIRD[b]);
    else if (b in BASEOF) add(BASEOF[b]);
    return out;
  }
  // ตำแหน่งของคำที่ขึ้นกับประธาน (am/is/are do/does กริยา) คำแรกในประโยค
  function sensIndex(toks) { for (let i = 0; i < toks.length; i++) if (isSens(toks[i])) return i; return -1; }

  // อธิบายเหตุผลที่คำ got ไม่ถูกตรงที่คาดว่าเป็น exp ของประโยคที่มีประธาน p
  function whyWord(exp, got, p) {
    const e = bare(exp), g = bare(got), pn = p || '';
    if (e === g) return 'คำนี้ถูกแล้ว แต่ยังไม่ใช่ตำแหน่งนี้ ลองดูลำดับ: ใคร › ทำอะไร › กับอะไร';
    if ((e === 'am' || e === 'is' || e === 'are') && (g === 'am' || g === 'is' || g === 'are')) return '“' + pn + '” ใช้กับ ' + BE[p] + ' (I ใช้ am · he she it ใช้ is · you we they ใช้ are)';
    if ((e === 'do' || e === 'does') && (g === 'do' || g === 'does')) return '“' + pn + '” ใช้กับ ' + (SING3(p) ? 'does' : 'do') + ' (he she it ใช้ does · นอกนั้นใช้ do)';
    if ((e in THIRD || e in BASEOF) && (g in THIRD || g in BASEOF) && (THIRD[e] === g || THIRD[g] === e || BASEOF[e] === g || BASEOF[g] === e)) {
      return SING3(p) ? '“' + pn + '” เป็นคนเดียวหรือสิ่งเดียว กริยาต้องเติม s (' + (THIRD[e] || e) + ')' : '“' + pn + '” ไม่ต้องเติม s ที่กริยา (' + (BASEOF[e] || e) + ')';
    }
    return 'คำนี้ยังไม่ใช่ตรงนี้ ลองดูลำดับ: ใคร › ทำอะไร › กับอะไร';
  }

  /* ---------- ชุดประโยค ---------- */
  const sentId = (u, s) => u.id + '|' + s.en;
  const sentsOf = u => allSents(u);
  const uniqueBy = (arr, f) => { const seen = new Set(); return arr.filter(x => { const k = f(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
  const picKey = s => JSON.stringify(s);

  /* ---------- 1) บัตรเรียน ---------- */
  function learnDeck(u) {
    return { words: u.words.map(wd), sents: uniqueBy(sentsOf(u), s => s.en) };
  }

  /* ---------- 2) จัดกลุ่ม ---------- */
  function makeSort(u, seed) {
    const R = rng(seed), S = u.sorts[0];
    const groups = S.groups.map((g, i) => ({ id: g.id, en: g.en, th: g.th, color: G_COL[i % G_COL.length] }));
    const items = S.items.map((it, i) => {
      const [g, key, pic] = it, w = typeof key === 'string' ? WORDS[key] : null, isPron = typeof key === 'string' && PRON.includes(key);
      const pc = isPron ? null : (pic || (w ? w[2] : null));
      return { id: 'i' + i, g, label: typeof key === 'string' ? (w ? w[0] : key) : '', pic: pc, textOnly: !pc, key: key || '' };   // ไม่มีภาพ (สรรพนาม/ประโยคคำถาม) = การ์ดข้อความล้วน
    });
    return { title: S.title, th: S.th, groups, items: shuf(items, R) };
  }
  function sortReason(set, item, tryG) {
    const g = set.groups.find(x => x.id === tryG), right = set.groups.find(x => x.id === item.g);
    return 'ยังไม่ใช่กลุ่ม “' + g.en + '” (' + g.th + ') ลองอีกกลุ่มดูนะ' + (item.label ? ' · ' + item.label + ' อยู่กลุ่ม “' + right.en + '” ' : '');
  }

  /* ---------- 3) โยงเส้น ---------- */
  const cardPic = (spec) => ({ kind: 'pic', spec });
  const cardText = (text, sub) => ({ kind: 'text', text, sub: sub || '' });
  // รอบ round = 0|1  คืน { title, hint, pairs:[{id,L,R}], leftSpeak }
  function makeMatch(u, round, seed) {
    const R = rng(seed), lv = u.level, isQA = !!u.qa;
    let mode;
    if (lv === 1) mode = round === 0 ? 'word' : 'sent';
    else if (lv === 2) mode = round === 0 ? 'sent' : 'th';
    else if (isQA) mode = round === 0 ? 'qa' : 'qpic';
    else mode = round === 0 ? 'sent' : 'th';
    let pairs;
    if (mode === 'word') pairs = pickN(u.words.map(wd), 5, R).map((w, i) => ({ id: 'p' + i, L: cardPic(w.pic), R: cardText(w.en, w.th), en: w.en, th: w.th }));
    else if (mode === 'sent') pairs = pickN(uniqueBy(sentsOf(u), s => s.en), 5, R).map((s, i) => ({ id: 'p' + i, L: cardPic(s.pic), R: cardText(s.en), en: s.en, th: s.th }));
    else if (mode === 'th') pairs = pickN(uniqueBy(sentsOf(u), s => s.en), 5, R).map((s, i) => ({ id: 'p' + i, L: cardText(s.th), R: cardText(s.en), en: s.en, th: s.th }));
    else if (mode === 'qa') pairs = pickN(u.qa.map(qaOf), 5, R).map((x, i) => ({ id: 'p' + i, L: cardText(x.q.en, x.q.th), R: cardText(x.a.en, x.a.th), en: x.a.en, th: x.a.th }));
    else pairs = pickN(u.qa.map(qaOf), 5, R).map((x, i) => ({ id: 'p' + i, L: cardPic(x.q.pic), R: cardText(x.q.en, x.q.th), en: x.q.en, th: x.q.th }));
    const TITLE = { word: 'โยงภาพกับคำศัพท์', sent: 'โยงภาพกับประโยค', th: 'โยงประโยคไทยกับประโยคอังกฤษ', qa: 'โยงคำถามกับคำตอบ', qpic: 'โยงภาพกับคำถาม' };
    const HINT = { word: 'ลากเส้นจากภาพทางซ้ายไปที่คำศัพท์ที่ตรงกันทางขวา', sent: 'ลากเส้นจากภาพทางซ้ายไปที่ประโยคที่ตรงกันทางขวา', th: 'ลากเส้นจากประโยคภาษาไทยไปหาประโยคภาษาอังกฤษที่ความหมายตรงกัน', qa: 'ลากเส้นจากคำถามไปหาคำตอบที่ตอบได้ถูกต้อง', qpic: 'ลากเส้นจากภาพไปหาคำถามที่ตรงกับภาพ' };
    const rightOrder = shuf(pairs.map(p => p.id), R);
    return { mode, title: TITLE[mode], hint: HINT[mode], pairs, rightOrder, leftSpeak: mode === 'qa' || mode === 'qpic' ? false : false };
  }

  /* ---------- 4) เปิดป้าย (จับคู่ความจำ) ---------- */
  function makeFlip(u, seed) {
    const R = rng(seed), lv = u.level;
    let src;
    if (u.qa) src = u.qa.map(qaOf).map(x => ({ a: cardText(x.q.en, x.q.th), b: cardText(x.a.en, x.a.th), sayA: x.q.en, sayB: x.a.en }));
    else if (lv === 1) src = u.words.map(wd).map(w => ({ a: cardPic(w.pic), b: cardText(w.en, w.th), sayA: w.en, sayB: w.en }));
    else src = uniqueBy(sentsOf(u), s => s.en).map(s => ({ a: cardPic(s.pic), b: cardText(s.en), sayA: s.en, sayB: s.en }));
    const pick = pickN(src, 6, R), cards = [];
    pick.forEach((p, i) => { cards.push(Object.assign({ id: 'a' + i, pair: i, side: 'a', say: p.sayA }, p.a)); cards.push(Object.assign({ id: 'b' + i, pair: i, side: 'b', say: p.sayB }, p.b)); });
    return { pairs: pick.length, cards: shuf(cards, R) };
  }

  /* ---------- 5) ลากวาง (สร้างประโยคจากการ์ดคำ) ---------- */
  function makeBuild(u, seed, rounds) {
    const R = rng(seed), all = uniqueBy(sentsOf(u), s => s.en), out = [];
    const chosen = pickN(all, Math.min(rounds || 6, all.length), R);
    chosen.forEach((s, ri) => {
      const toks = tokenize(s.en), tiles = toks.map((t, i) => ({ id: 't' + ri + '_' + i, text: t, idx: i, distract: false }));
      const si = sensIndex(toks);
      if (si >= 0) { const wf = wrongForms(toks[si], s.p); if (wf.length) tiles.push({ id: 't' + ri + '_x1', text: wf[Math.floor(R() * wf.length)], idx: -1, distract: true }); }
      // ตัวลวงที่สอง: คำนามอีกคำในหน่วยเดียวกัน (ใส่เครื่องหมายท้ายให้เหมือนคำสุดท้าย)
      const lowerToks = tiles.map(t => bare(t.text)), nouns = u.words.map(id => WORDS[id][0]).filter(w => /^[a-z]+$/.test(w) && !PRON.includes(w) && !lowerToks.includes(w));
      if (nouns.length && u.level >= 2 || (nouns.length && R() < 0.5)) { const n = nouns[Math.floor(R() * nouns.length)]; tiles.push({ id: 't' + ri + '_x2', text: n + tail(toks[toks.length - 1]), idx: -1, distract: true }); }
      out.push({ en: s.en, th: s.th, p: s.p, pic: s.pic, tokens: toks, tiles: shuf(tiles, R) });
    });
    return out;
  }
  // ตรวจว่าวางการ์ดคำ tile ลงช่อง j ของ build ได้หรือไม่
  function buildDrop(b, j, tile) {
    if (tile.text === b.tokens[j]) return { ok: true };
    return { ok: false, why: whyWord(b.tokens[j], tile.text, b.p) };
  }

  /* ---------- 6) ถามตอบ ---------- */
  // คำตอบลวงของคำถามใช่/ไม่ใช่: ประธานผิด หรือคำช่วยผิดชนิด (ผิดแน่นอนเสมอ ไม่พลิก Yes/No เพราะภาพบอกไม่ได้ว่าชอบหรือไม่ชอบ)
  const OTHER_SUBJ = { I: 'you', you: 'I', he: 'she', she: 'he', we: 'they', they: 'we', it: 'he' };
  function qaWrongAnswers(x) {
    const a = x.a.en, out = [];
    if (!/^(Yes|No),/.test(a)) return out;
    const toks = tokenize(a), ap = x.a.p, auxOf = q => (bare(toks[2]) === 'do' || bare(toks[2]) === 'does') ? (SING3(q) ? 'does' : 'do') : BE[q];
    const t1 = toks.slice(); t1[1] = OTHER_SUBJ[ap]; t1[2] = auxOf(OTHER_SUBJ[ap]) + tail(toks[2]); out.push(t1.join(' '));
    const isBe = ['am', 'is', 'are'].includes(bare(toks[2])), t2 = toks.slice(); t2[2] = (isBe ? (SING3(ap) ? 'does' : 'do') : BE[ap]) + tail(toks[2]); out.push(t2.join(' '));
    return uniqueBy(out.filter(s => s !== a), s => s);
  }
  // ตัวสร้างข้อสอบแต่ละชนิด คืน { type, prompt, pic?, text?, sub?, opts:[{text|pic, ok, why}], say? }
  function makeQuiz(u, seed, speechOk, count) {
    const R = rng(seed), all = uniqueBy(sentsOf(u), s => s.en), words = u.words.map(wd), isQA = !!u.qa, lv = u.level, N = count || 8;
    const used = new Set();
    const nextSent = (pred) => { const pool = all.filter(s => (!pred || pred(s)) && !used.has(s.en)), pl = pool.length ? pool : all.filter(s => !pred || pred(s)); const s = pl[Math.floor(R() * pl.length)] || all[0]; used.add(s.en); return s; };
    const otherSents = (s, n) => pickN(all.filter(o => o.en !== s.en), n, R);
    const mc = (arr) => shuf(arr, R);
    const gen = {
      pic2sent() {
        const s = nextSent(), ds = otherSents(s, 3);
        return { type: 'pic2sent', prompt: 'ภาพนี้ตรงกับประโยคไหน?', pic: s.pic, opts: mc([{ text: s.en, ok: true }].concat(ds.map(d => ({ text: d.en, ok: false, why: 'ประโยคนี้เล่าเรื่องอื่น ลองดูภาพอีกครั้ง' })))), say: s.en, th: s.th };
      },
      th2en() {
        const s = nextSent(), ds = otherSents(s, 2);
        return { type: 'th2en', prompt: 'ประโยคนี้ภาษาอังกฤษว่าอะไร?', text: s.th, opts: mc([{ text: s.en, ok: true }].concat(ds.map(d => ({ text: d.en, ok: false, why: 'ประโยคนี้แปลว่า “' + d.th + '”' })))), say: s.en, pic: null };
      },
      grammar() {
        const s = nextSent(s2 => sensIndex(tokenize(s2.en)) >= 0), toks = tokenize(s.en), si = sensIndex(toks), wf = wrongForms(toks[si], s.p), good = toks[si];
        const blank = toks.slice(); blank[si] = '____';
        const opts = [{ text: good, ok: true }].concat(wf.map(w => ({ text: w, ok: false, why: whyWord(good, w, s.p) })));
        return { type: 'grammar', prompt: 'เติมคำให้ถูกต้อง', text: joinTokens(blank), sub: s.th, pic: s.pic, opts: mc(opts), say: s.en, answerSentence: s.en };
      },
      listen() {
        const s = nextSent(), ds = []; const seen = new Set([picKey(s.pic)]);
        otherSents(s, 6).forEach(d => { const k = picKey(d.pic); if (ds.length < 2 && !seen.has(k)) { seen.add(k); ds.push(d); } });
        if (ds.length < 2) return gen.pic2sent();
        return { type: 'listen', prompt: 'ฟังแล้วเลือกภาพที่ตรงกับประโยค', say: s.en, text: '', opts: mc([{ pic: s.pic, ok: true }].concat(ds.map(d => ({ pic: d.pic, ok: false, why: 'ภาพนี้คือ “' + d.en + '”' })))), th: s.th, en: s.en };
      },
      word() {
        const w = words[Math.floor(R() * words.length)], ds = pickN(words.filter(o => o.id !== w.id), 2, R);
        return { type: 'word', prompt: 'คำนี้ภาษาอังกฤษว่าอะไร?', pic: w.pic, opts: mc([{ text: w.en, ok: true }].concat(ds.map(d => ({ text: d.en, ok: false, why: d.en + ' แปลว่า ' + d.th })))), say: w.en, th: w.th };
      },
      wordpic() {
        const w = words[Math.floor(R() * words.length)], seen = new Set([picKey(w.pic)]), ds = [];
        pickN(words.filter(o => o.id !== w.id), 6, R).forEach(d => { const k = picKey(d.pic); if (ds.length < 2 && !seen.has(k)) { seen.add(k); ds.push(d); } });
        return { type: 'wordpic', prompt: 'เลือกภาพของคำว่า', text: w.en, sub: w.th, opts: mc([{ pic: w.pic, ok: true }].concat(ds.map(d => ({ pic: d.pic, ok: false, why: 'ภาพนี้คือ ' + d.en })))), say: w.en };
      },
      qa() {
        const pairs = u.qa.map(qaOf), x = pairs[Math.floor(R() * pairs.length)], ds = [];
        qaWrongAnswers(x).forEach(w => ds.push({ text: w, ok: false, why: 'คำตอบนี้ใช้ไม่ได้กับคำถามนี้ ดูประธานและคำช่วยให้ตรงกับคำถาม' }));
        pairs.filter(o => o.a.en !== x.a.en && o.a.p !== x.a.p).forEach(o => { if (ds.length < 3 && !ds.some(d => d.text === o.a.en) && o.a.en !== x.a.en) ds.push({ text: o.a.en, ok: false, why: 'คำตอบนี้ตอบคำถามอื่น (' + o.q.en + ')' }); });
        const opts = [{ text: x.a.en, ok: true }].concat(ds.slice(0, 2));
        return { type: 'qa', prompt: 'เลือกคำตอบที่ถูกต้อง', text: x.q.en, sub: x.q.th, pic: x.q.pic, opts: mc(opts), say: x.q.en };
      }
    };
    let plan;
    if (lv === 1) plan = ['word', 'wordpic', 'listen', 'pic2sent', 'grammar', 'word', 'th2en', 'pic2sent'];
    else if (lv === 2) plan = ['pic2sent', 'grammar', 'th2en', 'grammar', 'listen', 'pic2sent', 'grammar', 'th2en'];
    else plan = isQA ? ['qa', 'qa', 'th2en', 'qa', 'grammar', 'listen', 'qa', 'qa'] : ['pic2sent', 'grammar', 'th2en', 'grammar', 'listen', 'pic2sent', 'grammar', 'th2en'];
    plan = plan.slice(0, N); while (plan.length < N) plan.push(plan[plan.length % 4]);
    return plan.map(t => { if (t === 'listen' && !speechOk) t = isQA ? 'qa' : 'pic2sent'; if (t === 'qa' && !isQA) t = 'pic2sent'; return gen[t](); });
  }

  return { rng, shuf, pickN, PRON, BE, SING3, THIRD, BASEOF, bare, tail, tokenize, check, wrongForms, sensIndex, whyWord, learnDeck, makeSort, sortReason, makeMatch, makeFlip, makeBuild, buildDrop, makeQuiz, qaWrongAnswers, uniqueBy, sentsOf };
})();
