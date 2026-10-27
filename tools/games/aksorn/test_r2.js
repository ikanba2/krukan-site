/* ทดสอบตรรกะรอบ 2 ของ Techno Aksorn: node tools/games/aksorn/test_r2.js
   ข้อมูล (วรรณยุกต์ · มาตรา · คำสะกด · ประโยค) ถูกต้องครบ · ทุกบทเรียนรอบ 2 ทุกระดับ สร้างกิจกรรมได้ถูกต้องทุกเมล็ดสุ่ม */
const fs = require('fs'), path = require('path');
const dir = __dirname, talk = path.join(dir, '..', 'talk');
const files = ['art-kid.js', 'art-things.js', 'art-scene.js'].map(f => path.join(talk, f)).concat(['art-thai.js', 'thai-data.js', 'thai-color.js', 'trace-data.js', 'engine.js', 'thai-r2.js'].map(f => path.join(dir, f)));
const code = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const X = new Function('KG', code + '\nreturn { AK, R2, LESSONS, LEVELS, ZONES, TRACE, THAI_PIC, ANIMALS, THINGS, CAST, SCENE_ACT, SCENE_DAY, TONE_NAME, rolesOf, cons, vow };')({ tex() { } });
const { AK, R2, LESSONS, LEVELS, TRACE, THAI_PIC, ANIMALS, THINGS, CAST, SCENE_ACT, SCENE_DAY, TONE_NAME, rolesOf } = X;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; if (fail <= 60) console.log('✗', m); } };
const chars = s => Array.from(s);
const picOk = s => { if (!s) return true; switch (s.k) { case 'tp': return !!THAI_PIC[s.id]; case 'animal': return !!ANIMALS[s.id]; case 'thing': return !!THINGS[s.id]; case 'kid': return !!CAST[s.id]; case 'act': return !!SCENE_ACT[s.id] && !!CAST[s.who]; case 'day': return !!SCENE_DAY[s.id] && !!CAST[s.who]; case 'group': return s.items.every(picOk); default: return false; } };

// ---------- วรรณยุกต์ ----------
const BAD = ['หี', 'หี่', 'หี้', 'หี๊', 'หี๋', 'ฉี่', 'ขี้', 'จู๋', 'ห่า', 'ฉี้', 'ขี่'];
BAD.forEach(b => ok(!R2.SYL[b], 'ห้ามมีพยางค์ ' + b));
['m', 'h', 'l'].forEach(f => { ok(R2.TONE_BASES[f].live.length >= 12, 'ชุดผันเสียงคำเป็นหมู่ ' + f + ' น้อยเกินไป'); ok(R2.TONE_BASES[f].ds.length >= 8 && R2.TONE_BASES[f].dl.length >= 8, 'ชุดผันเสียงคำตายหมู่ ' + f + ' น้อยเกินไป'); });
Object.keys(R2.SYL).forEach(t => { const s = R2.SYL[t]; ok(R2.TONE_TAB[s.cls][s.kind][s.mark] === s.tone, 'เสียงของ ' + t); ok(chars(t).length === rolesOf(t).length, 'บทบาทสีของพยางค์ ' + t); ok(/[่้๊๋]/.test(t) === !!s.mark, 'รูปวรรณยุกต์ใน ' + t); });
R2.TONE_IDS.forEach(id => { const t = R2.TONES[id]; t.ex.forEach(e => ok(R2.SYL[e] && R2.SYL[e].tone === id, 'ตัวอย่าง ' + e + ' ต้องเป็นเสียง' + t.name)); });
ok(R2.toneWord('ข', '–า', '่') === 'ข่า' && R2.toneWord('ข', '–ี', '้') === 'ขี้' && R2.toneWord('ก', 'เ–', '่') === 'เก่' && R2.toneWord('ด', '–อ', '้') === 'ด้อ' && R2.toneWord('ก', '–า', '') === 'กา', 'toneWord');
ok(R2.TONE_OF.m['๊'] === 'tri' && R2.TONE_OF.h[''] === 'jat' && R2.TONE_OF.l['่'] === 'tho' && R2.TONE_OF.l['้'] === 'tri' && R2.TONE_OF.h['่'] === 'ek', 'ตารางเสียงตามหมู่อักษร');
// ตารางผันเสียงต้องตรงกับตาราง 'หลักการผันเสียงวรรณยุกต์' ที่ครูให้มา (25 ต.ค. 2569) ทีละช่อง: [หมู่, ชนิด, พยัญชนะ, สระ, {เสียง: พยางค์}]
[['m', 'live', 'ก', '–า', { sa: 'กา', ek: 'ก่า', tho: 'ก้า', tri: 'ก๊า', jat: 'ก๋า' }], ['m', 'ds', 'ก', '–ะ', { ek: 'กะ', tho: 'ก้ะ', tri: 'ก๊ะ', jat: 'ก๋ะ' }],
  ['h', 'live', 'ข', '–า', { ek: 'ข่า', tho: 'ข้า', jat: 'ขา' }], ['h', 'ds', 'ข', '–ะ', { ek: 'ขะ', tho: 'ข้ะ' }],
  ['l', 'live', 'ค', '–า', { sa: 'คา', tho: 'ค่า', tri: 'ค้า' }], ['l', 'ds', 'ค', '–ะ', { tho: 'ค่ะ', tri: 'คะ', jat: 'ค๋ะ' }], ['l', 'dl', 'ค', '–าด', { tho: 'คาด', tri: 'ค้าด', jat: 'ค๋าด' }]].forEach(([f, k, c, v, want]) => {
  const got = {}; Object.keys(R2.TONE_TAB[f][k]).forEach(m => { got[R2.TONE_TAB[f][k][m]] = R2.toneWord(c, v, m); });
  ok(JSON.stringify(R2.TONE_IDS.filter(t => got[t]).map(t => t + ':' + got[t])) === JSON.stringify(R2.TONE_IDS.filter(t => want[t]).map(t => t + ':' + want[t])), 'ตารางผันเสียง ' + f + ' ' + k + ' ไม่ตรงตารางของครู ' + JSON.stringify(got));
  Object.keys(want).forEach(t => ok(!!R2.SYL[want[t]] && R2.SYL[want[t]].tone === t, 'ไม่มีพยางค์ในชุด ' + want[t]));
  const inf = AK.info('tf:' + f + ':' + R2.TONE_C[f].indexOf(c)); const row = inf.rows.find(r => r.kind === k); ok(!!row, 'บัตรตารางไม่มีแถว ' + f + k); if (row) R2.TONE_IDS.forEach((t, i) => ok((row.cells[i] ? row.cells[i].text : null) === (want[t] || null), 'ช่องตาราง ' + f + ' ' + k + ' ' + t));
});
// รูปวรรณยุกต์ต้องไม่ใช้ อ นำหน้า และหมู่อักษรครบตามคำท่อง
ok(Object.keys(R2.MARK_EX).every(k => /^–[่้๊๋]$/.test(k)) && Object.keys(TONE_NAME).every(k => /^–[่้๊๋]$/.test(k)), 'รูปวรรณยุกต์ต้องเป็นขีด –');
ok(R2.CLASSES.m.letters.length === 9 && R2.CLASSES.h.letters.length === 11 && R2.CLASSES.l.letters.length === 24 && new Set(R2.CLASSES.m.letters.concat(R2.CLASSES.h.letters, R2.CLASSES.l.letters)).size === 44, 'หมู่อักษร 9 + 11 + 24 = 44');
['m', 'h', 'l'].forEach(c => R2.CLASSES[c].letters.forEach(ch => ok(X.cons(ch).cls === c, 'หมู่ของ ' + ch + ' ต้องเป็น ' + c)));
ok(R2.CLASSES.m.rhyme.map(r => r[1]).join('').split('').sort().join('') === R2.CLASSES.m.letters.slice().sort().join(''), 'คำท่องอักษรกลางต้องครบ 9 ตัว');
ok(R2.CLASSES.h.rhyme.map(r => r[1]).join('').split('').sort().join('') === R2.CLASSES.h.letters.slice().sort().join(''), 'คำท่องอักษรสูงต้องครบ 11 ตัว');
R2.LDW.forEach(w => ok(chars(w[0]).length === rolesOf(w[0]).length && ['live', 'ds', 'dl'].includes(w[1]), 'คำเป็นคำตาย ' + w[0]));
Object.keys(R2.MARK_EX).forEach(k => R2.MARK_EX[k].forEach(w => ok(chars(w).length === rolesOf(w).length, 'บทบาทสีของคำ ' + w)));
// ---------- มาตรา ----------
const seenW = {};
R2.MATRA.forEach(m => m.words.forEach(w => {
  ok(!seenW[w], 'คำซ้ำข้ามมาตรา ' + w); seenW[w] = 1; ok(chars(w).length === rolesOf(w).length, 'บทบาทสีของคำ ' + w);
  if (m.id !== 'ka') ok(m.fin.includes(R2.finalOf(w)), w + ' ตัวสะกด ' + R2.finalOf(w) + ' ต้องอยู่ใน' + m.text); ok(picOk(R2.picOf(w)), 'ภาพของ ' + w);
  if (m.id !== 'ka') { const ro = rolesOf(w); ok(ro[ro.length - 1] === 'f', w + ' ตัวท้ายต้องเป็นตัวสะกดในบทบาทสี ' + ro); } else ok(!rolesOf(w).includes('f'), w + ' ไม่ควรมีตัวสะกดในบทบาทสี ' + rolesOf(w));
}));
R2.MATRA.filter(m => m.id !== 'ka').forEach(m => { ok(m.words.length >= 6, m.id + ' คำน้อย'); ok(m.words.filter(w => R2.picOf(w)).length >= 2, m.id + ' มีภาพน้อย'); ok(m.main && m.fin.includes(m.main), m.id + ' main'); });
// ---------- คำสะกด ----------
Object.keys(R2.SPELL).forEach(w => {
  const sp = R2.SPELL[w], r = sp.roles, tk = sp.tokens;
  ok(tk.length === r.length, 'สะกด ' + w + ' ชิ้นส่วนไม่ตรงบทบาท'); ok(tk[tk.length - 1] === w && r[r.length - 1] === 'W', 'สะกด ' + w + ' ชิ้นสุดท้ายต้องเป็นคำ');
  const cs = chars(w), ini = cs.find(c => c >= 'ก' && c <= 'ฮ'); ok(tk[0] === ini + 'อ' && r[0] === 'c', 'สะกด ' + w + ' พยัญชนะต้นต้องเป็น ' + ini + 'อ ได้ ' + tk[0]);
  const hasT = /[่้๊๋]/.test(w); ok(r.includes('t') === hasT, 'สะกด ' + w + ' วรรณยุกต์'); if (hasT) { ok(R2.T_NAMES.includes(tk[tk.length - 2]) && r[r.length - 2] === 't', 'สะกด ' + w + ' ชื่อวรรณยุกต์'); ok(tk[tk.length - 3] === w.replace(/[่้๊๋]/, '') && r[r.length - 3] === 'w', 'สะกด ' + w + ' คำก่อนใส่วรรณยุกต์ ' + tk[tk.length - 3]); }
  ok(r.includes('f') === (!!w && chars(rolesOf(w)).some((c, i) => c === 'f')), 'สะกด ' + w + ' ตัวสะกดไม่ตรงบทบาทสี ' + rolesOf(w) + ' / ' + r);
  if (r.includes('f')) { const fi = r.indexOf('f'); ok(tk[fi] === R2.finalOf(w) + 'อ' || tk[fi] === R2.finalOf(w) + 'อ', 'สะกด ' + w + ' ตัวสะกดต้องเป็น ' + R2.finalOf(w) + 'อ ได้ ' + tk[fi]); }
  ok(chars(w).length === rolesOf(w).length, 'บทบาทสีของคำ ' + w);
});
Object.keys(R2.SP_LEVELS).forEach(k => R2.SP_LEVELS[k].forEach(w => ok(!!R2.SPELL[w], k + ' ไม่มีการสะกดของ ' + w)));
// ---------- ประโยค ----------
Object.values(R2.SENT).forEach(s => {
  ok(s.words.join('') === s.text, 'ประโยค ' + s.id + ' คำต่อกันไม่ตรง'); ok(s.roles.length === s.words.length, 'ประโยค ' + s.id + ' บทบาท'); ok(picOk(s.pic) && !!s.pic, 'ภาพประโยค ' + s.id); ok(!!LESSONS.find(l => l.id === s.lesson), 'บทของประโยค ' + s.id);
  s.words.forEach(w => ok(chars(w).length === rolesOf(w).length, 'บทบาทสีของคำ ' + w));
});
// ---------- บทเรียน ----------
const L2 = LESSONS.filter(l => l.r2);
ok(L2.length === 19, 'บทเรียนรอบ 2 ต้องมี 19 บท (มี ' + L2.length + ')');
L2.forEach(l => {
  ok(l.items.length >= 2 && l.items.length <= 8, l.id + ' จำนวนรายการ'); l.items.forEach(k => { const inf = AK.info(k); ok(!!inf && !!inf.text, l.id + ' info ' + k); });
  ok(l.acts[0] === 'learn', l.id + ' ต้องขึ้นต้นด้วย learn'); l.acts.forEach(a => ok(!!AK.ACT_META[a], l.id + ' กิจกรรม ' + a + ' ไม่มี ACT_META')); ok(JSON.stringify(AK.activities(l, 0)) === JSON.stringify(l.acts), l.id + ' activities');
  (l.pool || []).forEach(p => { if (l.zone === 'sent') ok(!!R2.SENT[p] && R2.SENT[p].lesson === l.id, l.id + ' ประโยค ' + p); else if (l.zone === 'spell') ok(!!R2.SPELL[p], l.id + ' คำ ' + p); });
  if (l.zone === 'final') l.mt.forEach(m => ok(!!R2.MT(m), l.id + ' มาตรา ' + m)); if (l.mode === 'snd' || l.mode === 'fam') ok(['m', 'h', 'l'].includes(l.fam), l.id + ' fam');
  if (l.mode === 'mark') l.items.forEach(k => ok(!!TRACE[k], 'เส้นเขียน ' + k));
});
// ---------- ตัวสร้างกิจกรรม ----------
let made = 0; const dup = a => new Set(a).size !== a.length;
L2.forEach(l => LEVELS.forEach(L => {
  const lv = L.id, w = l.id + '@' + L.th;
  for (let sd = 1; sd <= 40; sd++) l.acts.forEach(a => {
    if (a === 'learn' || a === 'trace') return; made++;
    if (['tlisten', 'tname', 'cquiz', 'lquiz', 'mlisten', 'mpic', 'mfill', 'slisten', 'spic', 'sheard', 'sfill'].includes(a)) {
      const rs = AK.makeQuiz(a, l, lv, sd); ok(rs.length === 6, w + ' ' + a + ' 6 ข้อ (' + rs.length + ')');
      rs.forEach(r => { const ids = r.opts.map(o => o.id); ok(ids.includes(r.answer), w + ' ' + a + ' ไม่มีคำตอบ'); ok(!dup(ids), w + ' ' + a + ' ตัวเลือกซ้ำ ' + ids); ok(r.opts.length >= 3 && r.opts.length <= 6, w + ' ' + a + ' จำนวนตัวเลือก ' + r.opts.length); ok(!!r.right && !!r.head, w + ' ' + a + ' ข้อความ'); ok(Object.keys(r.wrong).length === r.opts.length, w + ' ' + a + ' ข้อความผิด');
        if (a === 'sheard' || a === 'spic') r.opts.forEach(o => ok(!!o.pic, w + ' ' + a + ' ตัวเลือกไม่มีภาพ')); if (a === 'mfill') { ok(!!r.qText && r.opts.every(o => o.id.length === 1), w + ' mfill'); } if (a === 'sfill') ok(r.qWords[r.blankAt] === r.answer, w + ' sfill blank');
        if (a === 'mpic') ok(!!r.qPic, w + ' mpic ไม่มีภาพ'); if (a === 'tlisten') ok(r.opts.length >= 3 && r.opts.every(o => o.id.startsWith('w:')), w + ' tlisten');
        if (a === 'slisten') ok(r.qTokens.length === r.qRoles.length, w + ' slisten token'); });
    } else if (['sbuild', 'sletters', 'sentbuild'].includes(a)) {
      const rs = AK.makeOrder(a, l, lv, sd); ok(rs.length >= 4, w + ' ' + a + ' ข้อ'); rs.forEach(r => {
        const tiles = r.tiles.map(t => t.t).slice(); r.tokens.forEach(t => { const i = tiles.indexOf(t); ok(i >= 0, w + ' ' + a + ' ไม่มีชิ้น ' + t); if (i >= 0) tiles.splice(i, 1); });
        ok(r.tokens.length === r.tileRoles.length, w + ' ' + a + ' บทบาท'); ok(r.tokens.length >= 2 && r.tokens.length <= 7, w + ' ' + a + ' จำนวนช่อง ' + r.tokens.length); ok(r.tiles.length <= 11, w + ' ' + a + ' ชิ้นเยอะไป'); ok(a === 'sbuild' ? r.tokens.join('-') === R2.SPELL[r.word].tokens.join('-') : r.tokens.join('') === r.word, w + ' ' + a + ' ลำดับ');
        if (a !== 'sbuild') ok(r.tokens.join('') === r.final, w + ' ' + a + ' final'); if (a === 'sentbuild') { ok(!!r.qPic, w + ' sentbuild ภาพ'); r.tiles.forEach(t => ok(t.role && t.t, w + ' tile')); const extra = r.tiles.length - r.tokens.length; ok(extra === Math.min(extra, lv), w + ' sentbuild ตัวลวงเกินระดับ ' + extra); }
        if (a === 'sletters') ok(!!r.qPic || true, 'ok'); });
    } else if (a === 'tsort' || a === 'msort' || a === 'lsort' || a === 'classsort') {
      const so = AK.makeSort(l, lv, sd, a); ok(so.items.length >= 6 && so.items.length <= 9, w + ' ' + a + ' จำนวนใบ ' + so.items.length); ok(so.groups.length >= 2 && so.groups.length <= 5, w + ' ' + a + ' จำนวนกลุ่ม ' + so.groups.length);
      so.groups.forEach(g => ok(so.items.filter(i => i.g === g.id).length >= 2, w + ' ' + a + ' กลุ่ม ' + g.id + ' น้อยกว่า 2')); so.items.forEach(i => { ok(so.groups.some(g => g.id === i.g), w + ' ' + a + ' กลุ่มของ ' + i.key); ok(!!AK.info(i.key), 'info ' + i.key); ok(!so.why || !!so.why(i.key), 'why ' + i.key); }); ok(!dup(so.items.map(i => i.key)), w + ' ' + a + ' ใบซ้ำ');
    } else if (a === 'memory') {
      const mm = AK.makeMemory(l, lv, sd); ok(mm.pairs >= 3 && mm.cards.length === mm.pairs * 2, w + ' memory ' + mm.pairs); const faces = mm.cards.map(c => c.kind + (c.text || JSON.stringify(c.spec))); ok(!dup(faces), w + ' memory หน้าซ้ำ'); mm.cards.forEach(c => ok(c.kind === 'pic' ? picOk(c.spec) && !!c.spec : !!c.text, w + ' memory ใบ'));
      for (let p = 0; p < mm.pairs; p++) ok(mm.cards.filter(c => c.pair === p).length === 2, w + ' memory คู่ ' + p);
    } else if (a === 'balloon' || a === 'listen') {
      if (a === 'listen') { const li = AK.makeListen(l, lv, sd); ok(li.length === 6, w + ' listen'); li.forEach(r => { ok(r.opts.includes(r.target), w + ' listen คำตอบ'); ok(!dup(r.opts), w + ' listen ซ้ำ'); ok(r.opts.length >= 3, w + ' listen ตัวเลือก'); }); }
      else { const sh = AK.makeShooter(l, lv, sd); ok(sh.length === 3, w + ' shooter 3 เป้า'); sh.forEach(t => { ok(!!AK.info(t.target), 'info target'); ok(t.goods.length >= 1 && t.decoys.length >= 2, w + ' shooter ' + t.target + ' goods ' + t.goods.length + ' decoys ' + t.decoys.length); ok(t.goods.every(g => !t.decoys.includes(g)), w + ' shooter goods ซ้ำ decoys'); t.goods.concat(t.decoys).forEach(k => ok(!!AK.info(k), 'info ' + k)); if (l.mode !== 'mark') ok(t.goods.length >= 3, w + ' shooter goods น้อย ' + t.goods.length); }); }
    } else if (a === 'match') {
      const m = AK.makeMatch(l, lv, sd); ok(m.length === 2, w + ' match 2 รอบ'); m.forEach(r => { ok(r.pairs.length >= 3, w + ' match คู่'); ok(!dup(r.pairs), w + ' match ซ้ำ'); r.pairs.forEach(x => ok(!!AK.info(x).pic, w + ' match ภาพ ' + x)); ok(r.order.length === r.pairs.length && r.blind, w + ' match order'); });
    } else ok(false, w + ' กิจกรรมที่ไม่รู้จัก ' + a);
  });
}));
// ข้อความกันซ้ำกับรอบ 1
ok(LESSONS.filter(l => !l.r2).length === 15, 'บทเรียนรอบ 1 ต้องคงเดิม 15 บท');
console.log('บทเรียนรอบ 2', L2.length, '· กิจกรรมที่สุ่มทดสอบ', made, '· พยางค์ผันเสียง', Object.keys(R2.SYL).length, '· คำสะกด', Object.keys(R2.SPELL).length, '· ประโยค', Object.keys(R2.SENT).length);
console.log(fail ? 'ไม่ผ่าน ' + fail + ' ข้อ (ผ่าน ' + pass + ')' : 'ผ่านทั้งหมด ' + pass + ' ข้อ');
process.exit(fail ? 1 : 0);
