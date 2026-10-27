/* ทดสอบตรรกะการพิมพ์: ทุกคำไทย/อังกฤษต้องพิมพ์ได้จริงบนแป้นพิมพ์ และลำดับปุ่มต้องสร้างคำเดิมได้ครบ รัน: node tools/games/typing/test_engine.js */
'use strict';
const TY = require('./engine.js');
const D = require('./content.js');
TY.bind(D);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

// แปลงปุ่ม -> ตัวอักษร
eq(TY.charFor('en', 'KeyA', false, false), 'a', 'en a');
eq(TY.charFor('en', 'KeyA', true, false), 'A', 'en Shift+a');
eq(TY.charFor('en', 'KeyA', false, true), 'A', 'en CapsLock');
eq(TY.charFor('en', 'KeyA', true, true), 'a', 'en Shift+Caps');
eq(TY.charFor('en', 'Digit1', true, true), '!', 'en Shift+1 ไม่ขึ้นกับ Caps');
eq(TY.charFor('th', 'KeyA', false, false), 'ฟ', 'th a = ฟ');
eq(TY.charFor('th', 'KeyA', true, false), 'ฤ', 'th Shift+a = ฤ');
eq(TY.charFor('th', 'KeyD', false, true), 'ก', 'th ไม่ขึ้นกับ Caps');
eq(TY.charFor('th', 'KeyF', true, false), 'โ', 'th Shift+f = โ');
eq(TY.charFor('th', 'Space', false, false), ' ', 'เว้นวรรค');
eq(TY.charFor('th', 'Enter', false, false), null, 'Enter ไม่ใช่ตัวอักษร');
eq(TY.keyOf('th', 'โ'), { code: 'KeyF', shift: true }, 'ค้นปุ่มของ โ');
eq(TY.keyOf('en', 'G'), { code: 'KeyG', shift: true }, 'ค้นปุ่มของ G');
eq(TY.shiftFor('KeyA'), 'ShiftRight', 'ตัวอักษรมือซ้ายใช้ Shift ขวา');
eq(TY.shiftFor('KeyL'), 'ShiftLeft', 'ตัวอักษรมือขวาใช้ Shift ซ้าย');

// เทียบคำ
eq(TY.lcp('hello', 'hex'), 2, 'lcp');
eq(TY.nextKey('en', 'ask', ''), { code: 'KeyA', shift: false, ch: 'a' }, 'ปุ่มแรกของ ask');
eq(TY.nextKey('en', 'Go', '').shift, true, 'G ต้อง Shift');
eq(TY.nextKey('en', 'ask', 'as').code, 'KeyK', 'ปุ่มถัดไป');
eq(TY.nextKey('en', 'ask', 'ax').code, 'Backspace', 'พิมพ์ผิดต้องลบ');
eq(TY.nextKey('en', 'ask', 'ask').code, 'Enter', 'จบคำแล้วกด Enter');

// ทุกคำพิมพ์ได้จริง: เดินตามปุ่มที่ nextKey บอก แล้วต้องได้คำเดิม
function simulate(lang, word) {
  let typed = '', guard = 0;
  while (typed !== word && guard++ < 200) {
    const k = TY.nextKey(lang, word, typed); if (!k || k.fix || k.done) return null;
    const ch = TY.charFor(lang, k.code, k.shift, false); if (ch == null) return null;
    typed += ch;
  }
  return typed;
}
['th', 'en'].forEach(lang => {
  const all = [].concat(D.TUTORIAL[lang]); Object.keys(D.WORDS[lang]).forEach(k => all.push(...D.WORDS[lang][k]));
  all.forEach(w => { ok(simulate(lang, w) === w, `พิมพ์ได้: [${lang}] ${w}`); });
  // ไม่มีคำซ้ำในคลังเดียวกัน
  Object.keys(D.WORDS[lang]).forEach(k => eq(new Set(D.WORDS[lang][k]).size, D.WORDS[lang][k].length, `${lang}.${k} ไม่มีคำซ้ำ`));
});

// ด่าน
eq(D.LEVELS.length, 10, 'มี 10 ด่าน');
D.LEVELS.forEach((L, i) => {
  eq(L.id, i + 1, 'id ด่าน ' + (i + 1));
  ok(!/[→↗←↘]/.test(L.title + L.desc), 'ด่าน ' + L.id + ' ไม่มีลูกศรยาว');
  ['th', 'en'].forEach(lang => {
    const d = TY.deck(lang, L.id, () => 0.37);
    eq(d.length, L.n, `${lang} ด่าน ${L.id} มี ${L.n} คำ`);
    if (L.pool !== 'tutorial') { const pool = TY.poolFor(lang, L.pool); ok(pool.length >= L.n || L.pool === 'mix' || L.pool === 'legend', `${lang} ด่าน ${L.id} คลังพอ ${pool.length}/${L.n}`); eq(new Set(d).size, Math.min(L.n, pool.length), `${lang} ด่าน ${L.id} ไม่ซ้ำเมื่อคลังพอ`); }
    const t = TY.timeLimit(lang, L.id, d); ok(t >= 12 && t <= 400, `${lang} ด่าน ${L.id} เวลา ${t} วินาทีสมเหตุสมผล`);
  });
});
ok(D.LEVELS[0].n < D.LEVELS[3].n && D.LEVELS[3].n < D.LEVELS[9].n, 'ด่านต่ำพิมพ์น้อยกว่าด่านสูง');
ok(TY.timeLimit('th', 5, ['ก']) < 30, 'เวลาของคำเดียวไม่นาน');
// ด่านเร็วต้องแน่นกว่าด่านช้าเมื่อคำเท่ากัน
ok(TY.timeLimit('en', 2, ['hello', 'world']) > TY.timeLimit('en', 10, ['hello', 'world']), 'ด่านสูงเวลาแน่นกว่า');

// คะแนนและดาว
eq(TY.wpm(50, 60000), 10, 'wpm 50 ตัวใน 1 นาที = 10');
eq(TY.accuracy(95, 5), 95, 'accuracy');
eq(TY.accuracy(0, 0), 100, 'accuracy ว่าง');
ok(TY.wordScore(5, 2000, 10, true) > TY.wordScore(5, 2000, 0, true), 'คอมโบเพิ่มคะแนน');
ok(TY.wordScore(5, 1000, 0, false) > TY.wordScore(5, 8000, 0, false), 'พิมพ์เร็วได้คะแนนมากกว่า');
eq(TY.stars('time', 95, 0.5), 3, 'ดาวโหมดเวลา เต็ม');
eq(TY.stars('time', 70, 0.5), 1, 'ดาวโหมดเวลา แม่นต่ำ');
eq(TY.stars('free', 96, 0), 3, 'ดาวโหมดฝึก เต็ม');
eq(TY.stars('free', 80, 0), 1, 'ดาวโหมดฝึก ขั้นต่ำ');

// ปุ่มทุกปุ่มบนแป้นบนจอมีสีนิ้ว
TY.ROWS.forEach(r => r.forEach(k => ok(TY.FINGER[k[0]] != null, 'มีนิ้วสำหรับปุ่ม ' + k[0])));
// แถวกว้างเท่ากัน 15 หน่วย
TY.ROWS.slice(0, 4).forEach((r, i) => eq(r.reduce((s, k) => s + k[1], 0), 15, 'แถวที่ ' + i + ' กว้าง 15 หน่วย'));

// โหมดหัดพิมพ์สัมผัส: ทุกหน่วยฝึกพิมพ์ได้จริง ใช้เฉพาะแป้นที่เรียนแล้ว คำที่คัดไว้ถูกบท และบอกนิ้ว/ทิศได้ทุกปุ่ม
global.TY = TY;
const CO = require('./course.js');
['th', 'en'].forEach(lang => CO.LESSONS[lang].forEach((L, i) => {
  const set = new Set(CO.known(lang, i).concat([' ']));
  for (let st = 1; st <= 4; st++) for (let seed = 1; seed <= 25; seed++) {
    const d = CO.deck(lang, i, st, seed); ok(d.length === CO.STAGES[st - 1].n, `${lang} บท ${i + 1} ด่าน ${st} มี ${d.length} ชุด`);
    d.forEach(u => {
      ok(typeof u === 'string' && u.length > 0 && u.length <= 48, `${lang} บท ${i + 1} ด่าน ${st} ชุดว่างหรือยาวเกิน: ${u}`);
      ok([...u].every(c => TY.keyOf(lang, c)), `${lang} บท ${i + 1} พิมพ์ไม่ได้: ${u}`);
      const L2 = CO.LESSONS[lang][i]; if (!L2.final && !(lang === 'en' && /[0-9]/.test(L2.keys))) ok([...u].every(c => set.has(c) || (lang === 'en' && set.has(c.toLowerCase()))), `${lang} บท ${i + 1} ด่าน ${st} ใช้แป้นที่ยังไม่เรียน: ${u}`);
      ok(!/^[ัิ-ฺ็-๎]/.test(u) && !/ [ัิ-ฺ็-๎]/.test(u), `${lang} สระ/วรรณยุกต์ลอย: ${u}`);
    });
  }
}));
CO.TH_WORDS.forEach((ws, i) => { const set = new Set(CO.known('th', i)); ws.forEach(w => ok([...w].every(c => set.has(c)), `คำบท ${i + 1} ใช้แป้นที่ยังไม่เรียน: ${w}`)); });
TY.ROWS.flat().forEach(k => { if (['Tab', 'CapsLock', 'ShiftLeft', 'ShiftRight', 'Enter', 'Backspace'].includes(k[0])) return; ok(CO.fingerOf(k[0]) && CO.moveHint(k[0]), 'บอกนิ้วและทิศของปุ่ม ' + k[0]); });
eq(CO.moveHint('KeyF'), 'อยู่ที่แป้นเหย้า', 'ด อยู่แป้นเหย้า'); eq(CO.moveHint('KeyR'), 'ขึ้นไปหนึ่งแถว', 'พ ขึ้นไปหนึ่งแถว'); eq(CO.moveHint('KeyG'), 'ไปทางขวา', 'เ ก้าวไปทางขวา'); eq(CO.moveHint('Digit4'), 'ขึ้นไปสองแถว', 'ภ ขึ้นไปสองแถว');
eq(CO.fingerOf('Semicolon').name, 'นิ้วก้อยขวา', 'ว นิ้วก้อยขวา'); eq(CO.stars(4, 97, 30, 20), 3, 'ด่าน 4 แม่นเร็ว 3 ดาว'); eq(CO.stars(2, 80, 30, 20), 0, 'แม่นยำต่ำกว่า 85 ไม่ผ่าน');
eq(CO.LESSONS.th[0].keys, 'ฟหกด่าสว', 'บท 1 แป้นเหย้าไทย');

console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
