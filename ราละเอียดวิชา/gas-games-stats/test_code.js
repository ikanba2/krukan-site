/* ทดสอบ Code.gs ของสถิติเกมด้วยตัวจำลอง Apps Script: node test_code.js */
'use strict';
const { makeEnv } = require('./mock-gas.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

const E = makeEnv(); const C = E.ctx;
const key = C.setup(); ok(/^[a-f0-9]{14}$/.test(key), 'setup ใช้รหัส 14 ตัวจากค่าคงที่'); eq(C.setup(), key, 'setup ซ้ำได้รหัสเดิม');
eq(E.sheets.map(s => s.name), ['บันทึกการเล่น', 'ผู้เล่น', 'สรุปรายวัน', 'สรุปรายเกม', '_รวมดาว', '_ดีที่สุดรายด่าน', '_วันละเครื่อง'], 'สร้างชีตครบ');
const post = o => JSON.parse(C.doPost({ postData: { contents: JSON.stringify(o) } }).text);
const get = q => JSON.parse(C.doGet({ parameter: q }).text);
const play = (o) => post(Object.assign({ k: key, t: 'play', game: 'steps', cid: 'dev1aaaa', name: 'สมชาย', lvl: '1:1', stars: 3, m: 0, h: 0, secs: 40, dev: 'd', ver: 'abc' }, o));

// ความปลอดภัยและการตรวจข้อมูล
eq(post({ k: 'x', t: 'play', game: 'steps', cid: 'dev1aaaa' }).err, 'key', 'รหัสผิด');
eq(play({ game: 'nope' }).err, 'game', 'เกมที่ไม่รู้จัก');
eq(play({ cid: 'a b!' }).err, 'cid', 'รหัสเครื่องผิดรูปแบบ');
eq(post({ k: key, t: 'zzz', game: 'steps', cid: 'dev1aaaa' }).err, 'type', 'ชนิดคำขอผิด');
eq(JSON.parse(C.doPost({ postData: { contents: '{not json' } }).text).err, 'bad-request', 'JSON พัง');

// บันทึกครั้งแรก
let r = play({}); ok(r.ok && r.rank.me && r.rank.me.stars === 3 && r.rank.me.r === 1 && r.rank.total === 1, 'บันทึกครั้งแรก ได้อันดับ 1 ดาว 3');
const plays = E.ss.getSheetByName('บันทึกการเล่น').data; eq(plays.length, 2, 'มี 1 แถวบันทึก (+หัวตาราง)');
eq(plays[1].slice(2, 13), ['steps', 'สมชาย', '1:1', 3, 0, 0, 0, 40, 'ปกติ', 'คอมพิวเตอร์', 'dev1aaaa'], 'ค่าที่เก็บ');
eq(plays[1][1], '24/10/2569', 'วันที่แบบพุทธศักราช');
// เล่นด่านเดิมซ้ำไม่เพิ่มดาว
r = play({ stars: 2 }); eq(r.rank.me.stars, 3, 'ดาวด่านเดิมไม่ลดและไม่ซ้ำ');
// ด่านใหม่ + ดาวเพิ่ม
r = play({ lvl: '1:2', stars: 1 }); eq(r.rank.me.stars, 4, 'ด่านใหม่บวกดาว');
r = play({ lvl: '1:2', stars: 3 }); eq(r.rank.me.stars, 6, 'ดาวดีขึ้น บวกส่วนต่าง');
// โหมดฝึกสุ่มไม่นับอันดับ แต่นับสถิติ
const before = E.ss.getSheetByName('_รวมดาว').data.length; r = play({ lvl: '1:3', stars: 3, practice: 1 }); eq(E.ss.getSheetByName('_รวมดาว').data.length, before, 'ฝึกสุ่มไม่เข้าอันดับ'); eq(r.rank.me.stars, 6, 'ดาวไม่เพิ่ม');
eq(E.ss.getSheetByName('บันทึกการเล่น').data.at(-1)[10], 'ฝึกสุ่ม', 'โหมดฝึกสุ่มบันทึกไว้');
// ผู้เล่นคนที่สอง นิรนาม + อันดับ
r = play({ cid: 'dev2bbbb', name: '', lvl: '1:1', stars: 3 }); eq(r.rank.total, 2, 'มี 2 คนในอันดับ'); eq(r.rank.me.r, 2, 'คนที่สองได้อันดับ 2'); eq(r.rank.me.name, 'นิรนาม', 'ไม่ใส่ชื่อ = นิรนาม');
eq(r.rank.top.map(x => x.name), ['สมชาย', 'นิรนาม'], 'รายชื่อ top แสดงชื่อต้นเท่านั้น'); ok(r.rank.top[1].me && !r.rank.top[0].me, 'ทำเครื่องหมายแถวของตัวเอง');
// ครูซ่อน/เปลี่ยนชื่อที่แสดง
const ps = E.ss.getSheetByName('ผู้เล่น'); ps.data[1][2] = 'พี่สมชาย'; ps.data[2][3] = true;
E.advance(60000); r = get({ k: key, t: 'rank', game: 'steps', cid: 'dev1aaaa' }); eq(r.rank.top.map(x => x.name), ['พี่สมชาย'], 'ใช้ชื่อที่ครูตั้ง และซ่อนคนที่ติ๊กซ่อน'); eq(r.rank.total, 1, 'ซ่อนแล้วไม่นับ');
// อ่านอันดับของเกมอื่น
eq(get({ k: key, t: 'rank', game: 'folder', cid: 'dev1aaaa' }).rank.total, 0, 'เกมอื่นยังไม่มีใคร');
// สรุป
const daily = E.ss.getSheetByName('สรุปรายวัน').data; eq(daily.length, 2, 'สรุปรายวันมี 1 แถว'); eq([daily[1][3], daily[1][4]], [6, 2], 'วันนี้เล่น 6 ครั้ง 2 เครื่อง');
const gm = E.ss.getSheetByName('สรุปรายเกม').data; eq([gm[1][0], gm[1][1], gm[1][2]], ['steps', 6, 2], 'สรุปเกม steps');
const pl = E.ss.getSheetByName('ผู้เล่น').data; eq(pl.length, 3, 'ผู้เล่น 2 คน'); eq(pl[1][6], 5, 'นับครั้งที่เล่นของคนแรก');
// ฉีดสูตร
play({ cid: 'dev3cccc', name: '=HYPERLINK("x")', lvl: '2:1' }); const last = E.ss.getSheetByName('บันทึกการเล่น').data.at(-1); ok(last[3].startsWith("'="), 'กันสูตรในชื่อ');
// ค่าเกินช่วง
play({ cid: 'dev4dddd', stars: 99, m: -5, secs: 1e9, lvl: 'x'.repeat(100) }); const row = E.ss.getSheetByName('บันทึกการเล่น').data.at(-1); eq([row[5], row[7], row[9], row[4].length], [3, 0, 86400, 24], 'ตัดค่าให้อยู่ในช่วง');
// จำกัดอัตรา
let limited = 0; for (let i = 0; i < 60; i++) { if (play({ cid: 'spam0001', lvl: 's' + i, stars: 1 }).err === 'rate') limited++; } ok(limited >= 15, 'จำกัดอัตราถูกใช้ (ถูกปฏิเสธ ' + limited + ')');
E.advance(11 * 60e3); ok(play({ cid: 'spam0001', lvl: 'again' }).ok, 'ผ่านช่วงจำกัดแล้วส่งได้อีก');
// JSONP
const jp = C.doGet({ parameter: { k: key, t: 'rank', game: 'steps', cid: 'dev1aaaa', callback: 'cb1' } }); ok(jp.text.startsWith('cb1(') && jp.mime === 'js', 'รองรับ JSONP'); ok(!C.doGet({ parameter: { k: key, t: 'rank', game: 'steps', cid: 'dev1aaaa', callback: 'a(b)' } }).text.startsWith('a(b)'), 'callback แปลกถูกปฏิเสธ');
// เก็บแค่ชื่อเล่น: ถ้าเกมรุ่นเก่าส่งสกุลมา ก็ไม่เก็บลงชีตไหนเลยและไม่ออกไปกับคำตอบ; รุ่นเก่าส่งชื่อมาในช่อง first ก็ยังรับ
const legacy = play({ cid: 'old0legacy', name: undefined, first: 'น้องเก่า', last: 'นามสกุลลับ', lvl: '9:9', game: 'grid' });
ok(legacy.ok && !JSON.stringify(legacy).includes('นามสกุลลับ'), 'สกุลไม่ออกไปกับคำตอบ');
ok(!E.sheets.some(sh => JSON.stringify(sh.data).includes('นามสกุลลับ')), 'สกุลไม่ถูกเก็บในชีตใดเลย'); eq(E.ss.getSheetByName('บันทึกการเล่น').data.at(-1)[3], 'น้องเก่า', 'รับชื่อจากช่อง first ของรุ่นเก่า');
eq(play({ cid: 'long0name', name: 'ชื่อเล่นที่ยาวมากเกินสิบหกตัวอักษรแน่นอน', lvl: '9:8', game: 'grid' }).rank.me.name.length, 16, 'ตัดชื่อเล่นที่ 16 ตัว');
// ประสิทธิภาพ: 3000 คนในอันดับ
E.advance(60e3); for (let i = 0; i < 3000; i++) E.ss.getSheetByName('_รวมดาว').appendRow(['steps|bulk' + i, 'steps', 'bulk' + i, i % 50, 0, new Date(i)]);
const t0 = Date.now(); const big = get({ k: key, t: 'rank', game: 'steps', cid: 'dev1aaaa' }); ok(Date.now() - t0 < 1500 && big.rank.total > 3000, 'อันดับ 3000 คนคำนวณเร็ว ' + (Date.now() - t0) + 'ms');
ok(play({ game: 'parts', cid: 'partsok01', lvl: '1:1' }).ok, 'เกม parts อยู่ในรายการเกมที่รับสถิติ');
ok(play({ game: 'slice', cid: 'sliceok01', lvl: '1:1' }).ok, 'เกม slice อยู่ในรายการเกมที่รับสถิติ');
ok(play({ game: 'talk', cid: 'talkok001', lvl: '1-1:sort' }).ok, 'เกม talk อยู่ในรายการเกมที่รับสถิติ (รหัสด่านเป็นหน่วย:กิจกรรม)');
ok(play({ game: 'aksorn', cid: 'aksornok1', lvl: 'k:c1:trace' }).ok, 'เกม aksorn อยู่ในรายการเกมที่รับสถิติ (รหัสด่านเป็นระดับ:บทเรียน:กิจกรรม)');
// ล้างข้อมูลทั้งหมด (เก็บหัวตาราง)
C.clearAllData(); for (const n of ['บันทึกการเล่น', 'ผู้เล่น', 'สรุปรายวัน', 'สรุปรายเกม', '_รวมดาว', '_ดีที่สุดรายด่าน', '_วันละเครื่อง']) eq(E.ss.getSheetByName(n).data.length, 1, 'ล้างแล้วเหลือหัวตาราง ' + n);
eq(get({ k: key, t: 'rank', game: 'steps', cid: 'dev1aaaa' }).rank.total, 0, 'อันดับว่างหลังล้าง');
r = play({ cid: 'after0001', lvl: '1:1', stars: 2 }); eq([r.rank.total, r.rank.me.stars], [1, 2], 'บันทึกใหม่ได้หลังล้าง');
console.log(`ทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`); process.exit(fail ? 1 : 0);
