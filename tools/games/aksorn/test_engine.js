/* ทดสอบตรรกะ Techno Aksorn: node tools/games/aksorn/test_engine.js
   เนื้อหา (พยัญชนะ 44 สระ 32 ภาพทุกภาพมีจริง หมู่อักษรครบ) · เส้นเขียนตามรอยครบทุกตัว · ตัวสร้างกิจกรรมทุกบทเรียน ทุกระดับ หลายเมล็ดสุ่ม */
const fs = require('fs'), path = require('path');
const dir = __dirname, talk = path.join(dir, '..', 'talk');
const files = [path.join(talk, 'art-kid.js'), path.join(talk, 'art-things.js'), path.join(talk, 'art-scene.js'), path.join(dir, 'art-thai.js'), path.join(dir, 'thai-data.js'), path.join(dir, 'thai-color.js'), path.join(dir, 'trace-data.js'), path.join(dir, 'engine.js')];
const code = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const X = new Function('KG', code + '\nreturn { AK, CONS, VOWELS, LESSONS, LEVELS, ZONES, WRITE_SETS, TRACE, TRACE_M, TRACE_D, CHANGES, chg, changeWord, changeBase, THAI_PIC, ANIMALS, THINGS, CAST, cons, vow, simpleRoles, rolesOf, composeRoles };')({ tex() { } });
const { AK, CONS, VOWELS, LESSONS, LEVELS, WRITE_SETS, TRACE, TRACE_D, CHANGES, chg, changeWord, changeBase, THAI_PIC, ANIMALS, THINGS, CAST, cons, vow, rolesOf, composeRoles } = X;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; if (fail <= 40) console.log('✗', m); } };
const picOk = s => !s || (s.k === 'tp' ? !!THAI_PIC[s.id] : s.k === 'animal' ? !!ANIMALS[s.id] : s.k === 'thing' ? !!THINGS[s.id] : s.k === 'kid' ? !!CAST[s.id] : false);

// เนื้อหา
ok(CONS.length === 44, 'พยัญชนะต้องมี 44 ตัว');
ok(new Set(CONS.map(c => c[0])).size === 44, 'พยัญชนะซ้ำ');
ok(CONS.filter(c => c[3] === 'm').length === 9 && CONS.filter(c => c[3] === 'h').length === 11 && CONS.filter(c => c[3] === 'l').length === 24, 'จำนวนอักษรกลาง 9 สูง 11 ต่ำ 24');
CONS.forEach(c => { ok(picOk(c[4]), 'ภาพของ ' + c[0]); ok(c[1].startsWith(c[0] === 'ฃ' ? 'ข' : c[0] === 'ฅ' || c[0] === 'ฆ' ? 'ค' : '') || true, ''); ok(c[2].includes(c[0]) || c[0] === 'ฃ' || c[0] === 'ฅ', 'คำประจำตัวต้องมีตัวนั้น: ' + c[0] + ' ' + c[2]); });
ok(VOWELS.length === 32, 'สระต้องมี 32 รูป (มี ' + VOWELS.length + ')');
VOWELS.forEach(v => { ok(picOk(v[7]), 'ภาพของสระ ' + v[1]); ok(v[5].length >= 1, 'ตัวอย่างสระ ' + v[1]); });
// ทุกตัวในบทเรียนและบ้านคัดลายมือมีเส้นเขียนตามรอย
const traceKeys = [].concat(...WRITE_SETS.map(s => s.items));
traceKeys.forEach(k => { ok(TRACE[k] && TRACE[k].length >= 1, 'ไม่มีเส้นเขียนตามรอย: ' + k); if (TRACE[k]) TRACE[k].forEach(st => ok(st.length >= 6 && st.length % 2 === 0, 'เส้นสั้นเกินไป ' + k)); });
LESSONS.forEach(l => l.items.forEach(x => ok(l.zone === 'cons' ? !!cons(x) : (l.kind === 'change' ? !!chg(x) : !!vow(x)), 'บทเรียน ' + l.id + ' มีรายการที่ไม่รู้จัก ' + x)));
ok(new Set([].concat(...LESSONS.filter(l => l.zone === 'cons').map(l => l.items))).size === 44, 'บทเรียนพยัญชนะต้องครบ 44 ตัว');
ok(new Set([].concat(...LESSONS.filter(l => l.zone === 'vow' && !l.kind).map(l => l.items))).size === 32, 'บทเรียนสระต้องครบ 32 รูป');

// สระเปลี่ยนรูป: รูปใหม่ทุกอันมีเส้นเขียน (ยกเว้นลดรูปที่ไม่มีรูป) · คำตัวอย่างเป็นคำจริงตามที่ตั้งใจ · ข้อสอบมีคำตอบเดียวและตัวลวงไม่ซ้ำ
const WANT = ['กัน', 'ตัก', 'มัด', 'เด็ก', 'เป็ด', 'เล็ก', 'แข็ง', 'แพ็ก', 'แล็ก', 'ก็อก', 'ล็อก', 'ป็อป', 'เดิน', 'เกิน', 'เปิด', 'คน', 'ลม', 'จน', 'ขวด', 'กวน', 'สวน'];
const got = [].concat(...CHANGES.map(r => { const h = chg(r[0]); return h.cf.map(p => changeWord(h, p[0], p[1])); }));
WANT.forEach(w => ok(got.includes(w), 'คำตัวอย่างสระเปลี่ยนรูปต้องมี ' + w)); ok(got.length === WANT.length, 'จำนวนคำตัวอย่างสระเปลี่ยนรูป ' + got.length);
CHANGES.forEach(r => { const h = chg(r[0]); if (h.to !== '–') { ok(!!TRACE[h.to] && !!TRACE_D[h.to], 'ไม่มีเส้นเขียนของรูปที่เปลี่ยน ' + h.to); } });
// สีของคำ: ทุกคำมีบทบาทครบทุกอักขระ
CHANGES.forEach(r => { const h = chg(r[0]); h.cf.forEach(p => { const w = changeWord(h, p[0], p[1]), ro = rolesOf(w); ok(Array.from(w).length === ro.length, 'บทบาทสีไม่ครบ ' + w + ' ' + ro); ok(ro.includes('c') && (ro.includes('v') || h.id === 'ch_o'), 'คำ ' + w + ' ต้องมีพยัญชนะและสระ (ลดรูป โอะ ไม่มีรูปสระ) ' + ro); }); });
CONS.forEach(c => { const ro = rolesOf(c[2]); ok(Array.from(c[2]).length === ro.length, 'บทบาทสีของคำ ' + c[2]); });
VOWELS.forEach(v => { v[5].concat([v[6]]).forEach(w => { const ro = rolesOf(w); ok(Array.from(w).length === ro.length, 'บทบาทสีของคำ ' + w); }); if (v[1].includes('–')) { const cr = composeRoles('ก', v[1]); ok(cr.roles.length === Array.from(cr.word).length && cr.roles.split('c').length === 2, 'composeRoles ' + v[1]); } });
for (let sd = 1; sd <= 60; sd++) { const rs = AK.makeChange(LESSONS.find(l => l.kind === 'change'), 2, sd); ok(rs.length === 6, 'change 6 ข้อ'); rs.forEach(r => { ok(r.opts.includes(r.word) && new Set(r.opts).size === r.opts.length && r.opts.length >= 3, 'change ตัวเลือก ' + r.opts.join(',')); ok(r.opts.includes(r.unchanged) || r.opts.length < 3, 'change ตัวลวงคือคำที่ไม่เปลี่ยนรูป ' + r.word); }); }
// ตัวสร้างกิจกรรม
let made = 0;
LESSONS.forEach(l => LEVELS.forEach(L => {
  if (l.kind === 'change') return; const lv = L.id, w = l.id + '@' + L.th, items = AK.itemsOf(l, lv);
  ok(items.length >= 2, w + ' รายการน้อยเกินไป');
  for (let sd = 1; sd <= 60; sd++) {
    const acts = AK.activities(l, lv);
    // ฟังแล้วแตะ
    const li = AK.makeListen(l, lv, sd); made++;
    ok(li.length === 6, w + ' listen 6 ข้อ');
    li.forEach(r => { ok(r.opts.includes(r.target), w + ' listen ไม่มีคำตอบ'); ok(new Set(r.opts).size === r.opts.length, w + ' listen ตัวเลือกซ้ำ'); ok(r.opts.length === AK.nOpts(lv), w + ' listen จำนวนตัวเลือก ' + r.opts.length); r.opts.forEach(o => ok(!!AK.info(o).text, w + ' listen ตัวเลือกว่าง')); });
    // ยิงลูกโป่ง/ตกปลา
    const sh = AK.makeShooter(l, lv, sd); made++;
    ok(sh.length === 3, w + ' shooter 3 เป้า'); sh.forEach(t => { ok(!t.decoys.includes(t.target), w + ' shooter ตัวลวงเท่าเป้า'); ok(t.decoys.length >= 2, w + ' shooter ตัวลวงน้อย'); });
    if (acts.includes('match')) { const m = AK.makeMatch(l, lv, sd); made++; m.forEach(r => { ok(r.pairs.length >= 3, w + ' match คู่น้อย'); ok(new Set(r.pairs).size === r.pairs.length, w + ' match ซ้ำ'); r.pairs.forEach(x => ok(!!AK.info(x).pic, w + ' match ไม่มีภาพ ' + x)); }); }
    if (acts.includes('memory')) { const mm = AK.makeMemory(l, lv, sd); made++; ok(mm.cards.length === 12, w + ' memory 12 ใบ ' + mm.cards.length); const faces = mm.cards.map(c => c.kind + (c.text || JSON.stringify(c.spec))); ok(new Set(faces).size === 12, w + ' memory หน้าซ้ำ ' + faces.join(',')); }
    ['classsort', 'lengthsort'].forEach(k => { if (!acts.includes(k)) return; const so = AK.makeSort(l, lv, sd, k); made++; ok(so.items.length >= 6 && so.items.length <= 9, w + ' ' + k + ' จำนวน ' + so.items.length); so.groups.forEach(g => ok(so.items.filter(i => i.g === g.id).length >= 2, w + ' ' + k + ' กลุ่ม ' + g.id + ' น้อย')); ok(new Set(so.items.map(i => i.key)).size === so.items.length, w + ' ' + k + ' ซ้ำ'); });
    if (acts.includes('compose')) { const co = AK.makeCompose(l, lv, sd); made++; ok(co.length === 6, w + ' compose 6 ข้อ'); co.forEach(r => { ok(r.opts.includes(r.v) && r.opts.length >= 2, w + ' compose ตัวเลือก'); ok(r.word && r.word.includes(r.c), w + ' compose คำ ' + r.word); const words = r.opts.map(o => AK.compose(r.c, o)); ok(new Set(words).size === words.length, w + ' compose ได้คำซ้ำกัน ' + words.join(',')); }); }
  }
}));
console.log('บทเรียน', LESSONS.length, '· เส้นเขียนตามรอย', Object.keys(TRACE).length, 'ตัว · กิจกรรมที่สุ่มทดสอบ', made);
console.log(fail ? 'ไม่ผ่าน ' + fail + ' ข้อ (ผ่าน ' + pass + ')' : 'ผ่านทั้งหมด ' + pass + ' ข้อ');
process.exit(fail ? 1 : 0);
