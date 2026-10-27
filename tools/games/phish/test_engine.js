/* ทดสอบ Net Patrol: ข้อมูลการ์ดครบถ้วน ด่านมีจำนวนการ์ดและสัดส่วนเหมาะสม คะแนน/ดาว/ตัวคูณถูกต้อง รัน: node tools/games/phish/test_engine.js */
'use strict';
const NP = require('./engine.js');
const D = require('./content.js');
NP.bind(D);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

const APPS = Object.keys(D.APPS), TAGS = Object.keys(D.CLUES), SCAM_TAGS = ['urgent', 'prize', 'otp', 'link', 'domain', 'money', 'personal', 'download', 'fake_news', 'too_good', 'stranger', 'weak'], SAFE_TAGS = ['official', 'no_ask', 'known', 'safe_habit'];
const ids = new Set();
D.CARDS.forEach(c => {
  ok(!ids.has(c.id), 'รหัสการ์ดไม่ซ้ำ ' + c.id); ids.add(c.id);
  ok(APPS.includes(c.app), c.id + ' แอปถูกต้อง');
  ok(c.lv >= 1 && c.lv <= 9, c.id + ' ด่านถูกต้อง');
  ok(typeof c.scam === 'boolean', c.id + ' scam เป็นจริง/เท็จ');
  ok(c.from && c.from.length <= 70, c.id + ' ผู้ส่งยาวไม่เกิน 70 ตัวอักษร (' + (c.from || '').length + ')');
  ok(c.body && c.body.length >= 15 && c.body.length <= 150, c.id + ' เนื้อหายาวพอดี (' + (c.body || '').length + ')');
  ok(c.why && c.why.length >= 25 && c.why.length <= 140, c.id + ' เหตุผลยาวพอดี (' + (c.why || '').length + ')');
  ok(Array.isArray(c.tags) && c.tags.length >= 1 && c.tags.length <= 3, c.id + ' มีสัญญาณ 1-3 อย่าง');
  c.tags.forEach(t => { ok(TAGS.includes(t), c.id + ' สัญญาณรู้จัก ' + t); ok(c.scam ? SCAM_TAGS.includes(t) : SAFE_TAGS.includes(t), c.id + ' สัญญาณตรงชนิด ' + t); });
  ok(!/[→↗←↘]/.test(c.body + c.why + (c.from || '') + (c.ctx || '')), c.id + ' ไม่มีลูกศรยาว');
  if (c.ctx) ok(c.ctx.length <= 80, c.id + ' บริบทสั้น');
  if (c.link) ok(c.link.length <= 40, c.id + ' ลิงก์สั้น');
  // การ์ดปลอดภัยต้องไม่ขอรหัส/เงิน/ข้อมูลส่วนตัวในเนื้อหา
  if (!c.scam) ok(!/OTP|รหัสผ่าน|เลขบัตร|โอนเงิน|โอนให้/.test(c.body) || c.app === 'habit' || c.app === 'web', c.id + ' การ์ดปลอดภัยไม่ขอข้อมูลลับ');
});

// ด่าน
eq(D.LEVELS.length, 10, 'มี 10 ด่าน');
D.LEVELS.forEach((L, i) => {
  eq(L.id, i + 1, 'id ด่าน ' + (i + 1));
  L.guide.forEach(g => ok(TAGS.includes(g), 'ด่าน ' + L.id + ' คำใบ้รู้จัก ' + g));
  ok(!/[→↗←↘]/.test(L.title + L.desc), 'ด่าน ' + L.id + ' ไม่มีลูกศรยาว');
  const d = NP.deck(L.id, NP.rngOf(7));
  const want = L.id === 1 ? 3 : L.id === 10 ? 12 : NP.cardsFor(L.id).length;
  eq(d.length, want, 'ด่าน ' + L.id + ' จำนวนการ์ด');
  eq(new Set(d.map(c => c.id)).size, d.length, 'ด่าน ' + L.id + ' ไม่มีการ์ดซ้ำ');
  const bad = d.filter(c => c.scam).length;
  if (L.id !== 1) ok(bad / d.length >= 0.33 && bad / d.length <= 0.7, `ด่าน ${L.id} สัดส่วนอันตราย ${bad}/${d.length} สมดุล`);
  // ไม่มีคำตอบเดียวกันติดกันเกิน 3 ใบ (ทดสอบหลายรอบ)
  for (let s = 1; s <= 25; s++) { const dd = NP.deck(L.id, NP.rngOf(s * 13)); let run = 1, mx = 1; for (let k = 1; k < dd.length; k++) { run = dd[k].scam === dd[k - 1].scam ? run + 1 : 1; mx = Math.max(mx, run); } if (L.id !== 1) ok(mx <= 3, `ด่าน ${L.id} seed ${s} คำตอบเดียวกันติดกัน ${mx}`); }
  if (L.id > 1) ok(L.sec >= 9 && L.sec <= 18, 'ด่าน ' + L.id + ' เวลาต่อใบสมเหตุสมผล');
});
for (let s = 1; s <= 40; s++) { const d = NP.deck(10, NP.rngOf(s)); const bad = d.filter(c => c.scam).length; ok(bad >= 5 && bad <= 7, `ด่านบอส seed ${s} อันตราย ${bad} ใบ`); }
eq(NP.deck(1).map(c => c.id), ['t1', 't2', 't3'], 'ด่านบทสอนเรียงตามบทสอน');
ok(NP.timeLimit(5, 'free') === 0 && NP.timeLimit(5, 'time') === 14, 'เวลาต่อใบตามโหมด');
ok(D.LEVELS[1].sec > D.LEVELS[9].sec, 'ด่านสูงเวลาแน่นกว่า');

// ตัดสิน
const scam = D.CARDS.find(c => c.scam), safe = D.CARDS.find(c => !c.scam);
eq(NP.judge(scam, 'block'), { ok: true, miss: null }, 'ปัดทิ้งการ์ดอันตรายถูก');
eq(NP.judge(scam, 'allow'), { ok: false, miss: 'passed' }, 'ปล่อยผ่านการ์ดอันตรายผิด');
eq(NP.judge(safe, 'allow'), { ok: true, miss: null }, 'ปล่อยผ่านการ์ดปลอดภัยถูก');
eq(NP.judge(safe, 'block'), { ok: false, miss: 'blocked' }, 'ปัดทิ้งการ์ดปลอดภัยผิด');
eq(NP.judge(scam, 'timeout').ok, false, 'หมดเวลาผิดเสมอ');

// คะแนน ตัวคูณ ร่าง
eq([0, 2, 3, 5, 6, 9, 12, 30].map(NP.multiplier), [1, 1, 2, 2, 3, 4, 5, 5], 'ตัวคูณคอมโบ');
eq([0, 2, 3, 5, 6, 8, 9, 20].map(NP.formTier), [0, 0, 1, 1, 2, 2, 3, 3], 'ร่างตามคอมโบ');
ok(NP.points(6, 0.5) > NP.points(0, 0.5), 'คอมโบเพิ่มคะแนน');
ok(NP.points(0, 1) > NP.points(0, 0), 'ตัดสินเร็วได้คะแนนมากกว่า');
eq([NP.stars(true, 100), NP.stars(true, 90), NP.stars(true, 89), NP.stars(true, 75), NP.stars(true, 60), NP.stars(false, 100)], [3, 3, 2, 2, 1, 0], 'ดาว');
eq([NP.accuracy(9, 10), NP.accuracy(0, 0)], [90, 100], 'ความแม่น');
const m = NP.missedClues([D.CARDS.find(c => c.id === 's1'), D.CARDS.find(c => c.id === 's3'), D.CARDS.find(c => c.id === 's5')]);
ok(m[0] === 'urgent' || m[0] === 'domain' || m[0] === 'link', 'สัญญาณที่พลาดบ่อย');

const nScam = D.CARDS.filter(c => c.scam).length;
console.log(`การ์ด ${D.CARDS.length} ใบ (อันตราย ${nScam} ปลอดภัย ${D.CARDS.length - nScam})`);
console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
