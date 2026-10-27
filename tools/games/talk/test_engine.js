/* ทดสอบตรรกะ Techno Talk: node tools/games/talk/test_engine.js
   1) เนื้อหา: ทุกประโยคไวยากรณ์ถูก ประธานตรงกับ p · รหัสคำและภาพ (spec) ทุกตัวมีจริงในคลังภาพ · ชุดจัดกลุ่มครบ
   2) ตัวสร้างกิจกรรมทั้ง 5 แบบ ทุกหน่วย หลายเมล็ดสุ่ม: คำตอบถูกมีข้อเดียว คำตอบลวงผิดจริง การ์ดคำครบ ฯลฯ */
const fs = require('fs'), path = require('path');
const dir = __dirname, files = ['art-kid.js', 'art-things.js', 'art-scene.js', 'content.js', 'rules.js', 'letters.js', 'engine.js'];
const code = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const X = new Function('KG', code + '\nreturn { TK, UNITS, WORDS, LEVELS, PERSON, allSents, qaOf, sentOf, ANIMALS, THINGS, CAST, POSES, SCENE_ACT, SCENE_DAY, COLOR_HEX, G_COL, wd, TKW, WRITE_CATS, RULES, ruleSents };')({ tex() { } });
const { TK, UNITS, WORDS, LEVELS, allSents, qaOf, ANIMALS, THINGS, CAST, POSES, SCENE_ACT, SCENE_DAY, COLOR_HEX } = X;

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; if (fail <= 40) console.log('✗', msg); } };

// ---------- ตรวจ spec ภาพ ----------
function checkSpec(s, where) {
  if (!s || !s.k) { ok(false, where + ': ไม่มีภาพ'); return; }
  switch (s.k) {
    case 'kid': ok(!!CAST[s.id], where + ' kid ' + s.id); if (s.pose) ok(!!POSES[s.pose], where + ' pose ' + s.pose); break;
    case 'animal': ok(!!ANIMALS[s.id], where + ' animal ' + s.id); break;
    case 'thing': ok(!!THINGS[s.id], where + ' thing ' + s.id); if (s.tint) ok(!!COLOR_HEX[s.tint], where + ' tint ' + s.tint); break;
    case 'act': ok(!!SCENE_ACT[s.id], where + ' act ' + s.id); ok(!!CAST[s.who], where + ' act who ' + s.who); break;
    case 'day': ok(!!SCENE_DAY[s.id], where + ' day ' + s.id); ok(!!CAST[s.who], where + ' day who ' + s.who); break;
    case 'pron': ok(TK.PRON.includes(s.id), where + ' pron ' + s.id); break;
    case 'group': ok(s.items.length > 0, where + ' group ว่าง'); s.items.forEach(i => checkSpec(i, where + '›')); break;
    default: ok(false, where + ' k=' + s.k);
  }
}

// ---------- 1) เนื้อหา ----------
ok(UNITS.length === 15, 'ต้องมี 15 หน่วย (มี ' + UNITS.length + ')');
LEVELS.forEach(L => ok(UNITS.filter(u => u.level === L.id).length === 5, 'ระดับ ' + L.id + ' ต้องมี 5 หน่วย'));
Object.keys(WORDS).forEach(id => { ok(WORDS[id].length === 3, 'WORDS ' + id + ' รูปแบบ'); checkSpec(WORDS[id][2], 'WORDS.' + id); });
UNITS.forEach(u => {
  const w = 'หน่วย ' + u.id;
  u.words.forEach(id => ok(!!WORDS[id], w + ' ไม่มีคำศัพท์ ' + id));
  ok(u.words.length >= 6, w + ' คำศัพท์น้อยกว่า 6');
  const ss = allSents(u); ok(ss.length >= 6, w + ' ประโยคน้อยกว่า 6 (' + ss.length + ')');
  ss.forEach(s => { const r = TK.check(s.en, s.p); ok(r.ok, w + ' ไวยากรณ์ “' + s.en + '” (' + s.p + '): ' + (r.why || '')); checkSpec(s.pic, w + ' ' + s.en); ok(s.th && s.th.length > 1, w + ' ไม่มีคำแปล ' + s.en); });
  const ens = ss.map(s => s.en); ok(new Set(ens).size === ens.length, w + ' มีประโยคซ้ำ');
  const ths = ss.map(s => s.th); ok(new Set(ths).size === ths.length, w + ' คำแปลไทยซ้ำกันสองประโยค (โจทย์แปลไทย › อังกฤษจะกำกวม)');
  if (u.qa) u.qa.forEach(r => { const x = qaOf(r); ok(/\?$/.test(x.q.en), w + ' คำถามต้องลงท้าย ?: ' + x.q.en); });
  ok(u.sorts && u.sorts.length >= 1, w + ' ไม่มีชุดจัดกลุ่ม');
  u.sorts.forEach(S => {
    const gids = S.groups.map(g => g.id); S.groups.forEach(g => ok(S.items.filter(i => i[0] === g.id).length >= 2, w + ' กลุ่ม ' + g.id + ' มีของน้อยกว่า 2'));
    S.items.forEach(it => { ok(gids.includes(it[0]), w + ' รายการอ้างกลุ่มที่ไม่มี ' + it[0]); if (typeof it[1] === 'string' && !WORDS[it[1]] && !it[2]) ok(true, ''); if (it[2]) checkSpec(it[2], w + ' sort'); if (typeof it[1] === 'string' && WORDS[it[1]]) ok(true, ''); else if (typeof it[1] === 'string') ok(!!it[2] || /\s/.test(it[1]) || /\?/.test(it[1]), w + ' sort ข้อความ ' + it[1]); });
    ok(S.items.length >= 6 && S.items.length <= 10, w + ' จำนวนของจัดกลุ่ม ' + S.items.length);
  });
});

// ---------- 2) ตัวสร้างกิจกรรม ----------
let acts = 0;
const SEEDS = 120;
UNITS.forEach(u => {
  const w = 'หน่วย ' + u.id;
  for (let sd = 1; sd <= SEEDS; sd++) {
    // จัดกลุ่ม
    const so = TK.makeSort(u, sd); acts++;
    ok(so.items.length === u.sorts[0].items.length, w + ' sort จำนวน');
    so.items.forEach(it => ok(so.groups.some(g => g.id === it.g), w + ' sort กลุ่มของ ' + it.id));
    ok(so.items.every(it => (it.label || it.pic) && (it.textOnly ? !!it.label && !it.pic : !!it.pic)), w + ' sort การ์ดว่าง/ไม่มีภาพทั้งที่ไม่ใช่การ์ดข้อความ');
    // โยงเส้น 2 รอบ
    for (let r = 0; r < 2; r++) {
      const m = TK.makeMatch(u, r, sd * 7 + r); acts++;
      ok(m.pairs.length === 5, w + ' match 5 คู่');
      const rt = m.pairs.map(p => p.R.text || JSON.stringify(p.R.spec)), lt = m.pairs.map(p => p.L.text || JSON.stringify(p.L.spec));
      ok(new Set(rt).size === 5, w + ' match ขวาซ้ำ ' + m.mode + ' ' + rt.join('|'));
      ok(new Set(lt).size === 5, w + ' match ซ้ายซ้ำ ' + m.mode);
      ok(m.rightOrder.slice().sort().join() === m.pairs.map(p => p.id).sort().join(), w + ' match rightOrder');
    }
    // เปิดป้าย
    const f = TK.makeFlip(u, sd * 3); acts++;
    ok(f.cards.length === 12 && f.pairs === 6, w + ' flip 12 ใบ');
    const byPair = {}; f.cards.forEach(c => { (byPair[c.pair] = byPair[c.pair] || []).push(c); });
    ok(Object.keys(byPair).length === 6 && Object.values(byPair).every(a => a.length === 2 && a[0].side !== a[1].side), w + ' flip คู่');
    const faces = f.cards.map(c => c.text || JSON.stringify(c.spec)); ok(new Set(faces).size === 12, w + ' flip หน้าซ้ำ');
    // ลากวาง
    const bs = TK.makeBuild(u, sd * 5, 6); acts++;
    ok(bs.length === 6, w + ' build 6 รอบ');
    bs.forEach(b => {
      ok(b.tokens.join(' ') === b.en, w + ' build tokens');
      const texts = b.tiles.map(t => t.text);
      b.tokens.forEach((t, i) => ok(b.tiles.some(x => x.text === t && x.idx === i), w + ' build ขาดคำ ' + t));
      b.tiles.filter(t => t.distract).forEach(t => {
        ok(!b.tokens.includes(t.text), w + ' ตัวลวงซ้ำกับคำในประโยค: ' + t.text + ' / ' + b.en);
        b.tokens.forEach((tok, j) => ok(!TK.buildDrop(b, j, t).ok, w + ' ตัวลวงวางได้ ' + t.text));
        // ตัวลวงชนิดไวยากรณ์ ถ้าแทนคำที่ขึ้นกับประธานต้องทำให้ประโยคผิดจริง
        const si = TK.sensIndex(b.tokens);
        if (si >= 0 && TK.wrongForms(b.tokens[si], b.p).includes(t.text)) { const alt = b.tokens.slice(); alt[si] = t.text; ok(!TK.check(alt.join(' '), b.p).ok, w + ' ประโยคที่ใช้ตัวลวงยังถูก: ' + alt.join(' ')); }
      });
      ok(new Set(texts).size === texts.length || b.tokens.length !== new Set(b.tokens).size, w + ' build การ์ดคำซ้ำ ' + b.en);
      // การวางถูกทุกช่องต้องผ่าน
      b.tokens.forEach((t, j) => ok(TK.buildDrop(b, j, { text: t }).ok, w + ' วางถูกไม่ผ่าน'));
    });
    // ถามตอบ
    [true, false].forEach(speech => {
      const q = TK.makeQuiz(u, sd * 11, speech, 8); acts++;
      ok(q.length === 8, w + ' quiz 8 ข้อ');
      q.forEach((qq, qi) => {
        const oks = qq.opts.filter(o => o.ok);
        ok(oks.length === 1, w + ' quiz ' + qq.type + ' ต้องถูกข้อเดียว (' + oks.length + ')');
        ok(qq.opts.length >= 2 && qq.opts.length <= 4, w + ' quiz ' + qq.type + ' จำนวนตัวเลือก ' + qq.opts.length);
        const keys = qq.opts.map(o => o.text != null ? o.text : JSON.stringify(o.pic)); ok(new Set(keys).size === keys.length, w + ' quiz ' + qq.type + ' ตัวเลือกซ้ำ ' + keys.join('|'));
        qq.opts.filter(o => !o.ok).forEach(o => ok(!!o.why, w + ' quiz ตัวลวงไม่มีเหตุผล'));
        if (!speech) ok(qq.type !== 'listen', w + ' quiz ไม่มีเสียงแต่ถามฟัง');
        if (qq.type === 'grammar') {
          const good = qq.text.replace('____', oks[0].text); ok(TK.check(good).ok, w + ' grammar เฉลยผิดไวยากรณ์: ' + good + ' ' + (TK.check(good).why || ''));
          qq.opts.filter(o => !o.ok).forEach(o => { const bad = qq.text.replace('____', o.text); ok(!TK.check(bad).ok, w + ' grammar ตัวลวงยังถูก: ' + bad); });
        }
        if (qq.type === 'qa') {
          const pairs = u.qa.map(qaOf), pr = pairs.find(x => x.q.en === qq.text); ok(!!pr && oks[0].text === pr.a.en, w + ' qa เฉลยไม่ตรงคู่');
          qq.opts.filter(o => !o.ok).forEach(o => ok(o.text !== pr.a.en, w + ' qa ตัวลวงเท่าเฉลย'));
        }
      });
    });
  }
  const dk = TK.learnDeck(u); ok(dk.words.length === u.words.length && dk.sents.length >= 6, w + ' learn deck');
});

// ข้อมูลที่ตั้งใจให้ ‘ผิด’ ต้องถูกตรวจจับ (ทดสอบตัวตรวจเอง)
[['I is happy.', 'I'], ['He like apples.', 'he'], ['She have a bag.', 'she'], ['They is kids.', 'they'], ['Does he likes fish?', 'he'], ['Do she like fish?', 'she'], ['We is tired.', 'we'], ['It are a cat.', 'it'], ['He do not like fish.', 'he'], ['i am happy.', 'I'], ['She likes a apple.', 'she'], ['They are a kids.', 'they'], ['No, he do not.', 'he'], ['Yes, I are.', 'I']].forEach(([s, p]) => ok(!TK.check(s, p).ok, 'ตัวตรวจต้องจับผิดให้ได้: ' + s));
[['I am happy.', 'I'], ['He likes apples.', 'he'], ['She has a book.', 'she'], ['They do not like rain.', 'they'], ['Does he like fish?', 'he'], ['What do you like?', 'you'], ['Where is she?', 'she'], ['Yes, I do.', 'I'], ['No, he is not.', 'he'], ['It can fly.', 'it'], ['I wake up.', 'I'], ['He takes a bath.', 'he']].forEach(([s, p]) => ok(TK.check(s, p).ok, 'ตัวตรวจต้องผ่านประโยคถูก: ' + s + ' ' + (TK.check(s, p).why || '')));

// ---------- ฝึกเขียน: ทุกคำในหมวดเขียนได้ เส้นอยู่ในบรรทัด 4 เส้น จุดของเส้นต่อเนื่อง ตัวสูง/ตัวมีหางถูกตำแหน่ง ----------
{
  const { TKW, WRITE_CATS } = X, seen = {};
  ok(WRITE_CATS.length >= 8, 'หมวดฝึกเขียนน้อยไป');
  WRITE_CATS.forEach(c => { ok(!seen[c.id], 'หมวดซ้ำ ' + c.id); seen[c.id] = 1; ok(c.words.length >= 4, c.id + ' คำน้อยไป'); ok(!!WORDS[c.icon], c.id + ' ไอคอน');
    c.words.forEach(w => { ok(!!WORDS[w], c.id + ' ไม่มีคำ ' + w); if (WORDS[w]) ok(TKW.can(WORDS[w][0]), 'เขียนคำ ' + WORDS[w][0] + ' ไม่ได้'); }); });
  const TALL = 'bdfhklt', TAIL = 'gjpqy';
  Object.keys(TKW.DATA).forEach(ch => {
    const d = TKW.DATA[ch], all = [].concat(...d.strokes.map(s => s.pts)), ys = all.map(q => q.y), xs = all.map(q => q.x);
    ok(d.strokes.length >= 1 && d.strokes.length <= 3, ch + ' จำนวนเส้น');
    ok(Math.min(...ys) >= -0.01 && Math.max(...ys) <= 3.01, ch + ' เส้นออกนอกบรรทัด');
    ok(Math.min(...xs) >= -0.25 && Math.max(...xs) <= d.w + 0.05, ch + ' เส้นกว้างเกินช่อง');
    if (ch === 'I') ok(Math.min(...ys) < 0.05 && Math.abs(Math.max(...ys) - 2) < 0.05, 'I สูงเต็มเส้นบน-ฐาน');
    else if (TALL.includes(ch)) ok(Math.min(...ys) < 0.35, ch + ' ตัวสูงต้องขึ้นใกล้เส้นบน');
    else if (!'ij'.includes(ch)) ok(Math.min(...ys) > 0.95, ch + ' ตัวเตี้ยต้องอยู่ใต้เส้นกลาง');
    ok(TAIL.includes(ch) ? Math.max(...ys) > 2.5 : Math.max(...ys) < 2.05, ch + ' หาง');
    d.strokes.forEach((s, k) => { if (s.dot) return; ok(s.pts.length >= 6, ch + ' เส้น ' + k + ' จุดน้อย'); for (let i = 1; i < s.pts.length; i++) ok(Math.hypot(s.pts[i].x - s.pts[i - 1].x, s.pts[i].y - s.pts[i - 1].y) < 0.06, ch + ' เส้น ' + k + ' กระโดด'); });
  });
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => ok(!!TKW.DATA[ch], 'ไม่มีตัว ' + ch));
  ok(TKW.layout('ice cream').letters.length === 8, 'วางคำที่มีวรรค');
  // กิจกรรมเขียนตามรอยในหน่วยเรียน: ทุกคำศัพท์ของทุกหน่วยต้องเขียนได้ (หน่วยสรรพนามเขียนครบ I you he she it we they)
  UNITS.forEach(u => u.words.forEach(id => ok(!!WORDS[id] && TKW.can(WORDS[id][0]), u.id + ' เขียนคำ ' + id + ' ไม่ได้')));
  ok(['I', 'you', 'he', 'she', 'it', 'we', 'they'].every(p => UNITS.find(u => u.id === '1-1').words.includes(p)), 'หน่วยสรรพนามต้องมีครบ 7 คำ');
}

// ---------- หลักภาษา: ทุกหน่วยมี 3–4 หน้า ชนิดหน้ารู้จัก ประโยคตัวอย่างทุกประโยคไวยากรณ์ถูก ไม่มีลูกศรยาว ----------
{
  const { RULES, ruleSents } = X, KINDS = { meaning: 'items', pair: 'groups', formula: 'parts', change: 'rows', qa: 'rows', tip: 'lines' }, pnOf = en => { const t = en.replace(/[.,?!]/g, '').split(' ').find(x => TK.PRON.includes(x === 'I' ? 'I' : x.toLowerCase())); return t ? (t === 'I' ? 'I' : t.toLowerCase()) : null; };
  let nR = 0;
  UNITS.forEach(u => {
    const S = RULES[u.id]; ok(Array.isArray(S) && S.length >= 3 && S.length <= 4, u.id + ' หลักภาษาต้องมี 3–4 หน้า');
    (S || []).forEach((s, i) => {
      const w = u.id + ' หลัก ' + (i + 1); ok(!!KINDS[s.k] && Array.isArray(s[KINDS[s.k]]) && s[KINDS[s.k]].length > 0, w + ' ชนิด/ข้อมูล ' + s.k);
      ok(s.t && s.en && s.say && s.say.length > 20, w + ' ต้องมีหัวข้อ สูตร และคำอธิบาย');
      ok(!/[→↗←↘]/.test(JSON.stringify(s)), w + ' มีลูกศรยาว');
      if (s.k === 'pair') s.groups.forEach(g => { ok(g.subs.every(p => TK.PRON.includes(p)), w + ' ประธานไม่รู้จัก'); ok(g.subs.includes(pnOf(g.ex)), w + ' ตัวอย่าง ' + g.ex + ' ไม่ใช่ประธานของกลุ่ม'); });
      if (s.k === 'meaning') s.items.forEach(it => ok(it.length === 4 && it[3] && it[3].k, w + ' การ์ดความหมายไม่ครบ'));
      ruleSents(s).forEach(en => { nR++; const r = TK.check(en, pnOf(en)); ok(r.ok, w + ' ประโยคผิดไวยากรณ์: ' + en + ' ' + (r.why || '')); });
    });
  });
  ok(nR >= 100, 'ประโยคตัวอย่างหลักภาษาน้อยไป ' + nR);
  const p11 = RULES['1-1'].find(s => s.k === 'pair'); ok(p11 && p11.groups[0].subs[0] === 'I' && p11.groups[0].to === 'am', 'หน่วย 1-1 ต้องสอน I คู่กับ am');
}

const nS = UNITS.reduce((n, u) => n + allSents(u).length, 0), nW = Object.keys(WORDS).length;
console.log('หน่วย', UNITS.length, '· คำศัพท์', nW, '· ประโยค', nS, '· กิจกรรมที่สุ่มทดสอบ', acts);
console.log(fail ? 'ไม่ผ่าน ' + fail + ' ข้อ (ผ่าน ' + pass + ')' : 'ผ่านทั้งหมด ' + pass + ' ข้อ');
process.exit(fail ? 1 : 0);
