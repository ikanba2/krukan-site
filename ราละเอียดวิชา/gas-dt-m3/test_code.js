/* ทดสอบ Code.gs ด้วย mock ของ Apps Script (ไม่ต้องใช้บัญชี Google): node test_code.js */
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), assert = require('assert');
function makeSheet(name) {
  const data = []; // data[r][c]
  const sh = {
    name, getName: () => name, getLastRow: () => data.length,
    getRange(r, c, nr = 1, nc = 1) {
      return {
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (data[r - 1 + i] || [])[c - 1 + j] ?? '')),
        setValues(v) { v.forEach((row, i) => row.forEach((x, j) => { (data[r - 1 + i] = data[r - 1 + i] || [])[c - 1 + j] = x; })); return this; },
        setValue(x) { (data[r - 1] = data[r - 1] || [])[c - 1] = x; return this; },
        setBackground() { return this; }, setFontColor() { return this; }, setFontWeight() { return this; }
      };
    },
    appendRow(row) { data.push(row.slice()); }, setFrozenRows() { }
  };
  return sh;
}
const books = {}; let bookSeq = 0;
function makeBook() { const sheets = {}; const id = 'book' + (++bookSeq);
  const b = { id, getId: () => id, getSheets: () => Object.values(sheets), getSheetByName: n => sheets[n] || null, insertSheet: n => (sheets[n] = makeSheet(n)), deleteSheet: s => { delete sheets[s.name]; } };
  sheets['Sheet1'] = makeSheet('Sheet1'); books[id] = b; return b; }
const props = {}, cache = {}, folders = [], files = [];
const mkFolder = (name, parent) => { const f = { name, parent, id: 'fo' + folders.length, getId() { return this.id; }, getFoldersByName(n) { const m = folders.filter(x => x.parent === this && x.name === n); let i = 0; return { hasNext: () => i < m.length, next: () => m[i++] }; }, createFolder(n) { return mkFolder(n, this); }, createFile(n, c) { const fl = { name: n, content: c, id: 'fi' + files.length, getId() { return this.id; } }; files.push({ ...fl, folder: this }); return fl; }, addFile() { } }; folders.push(f); return f; };
const ctx = {
  console, JSON, Math, String, Number, Array, Object, Date, Error,
  HtmlService: { createHtmlOutputFromFile: () => ({ setTitle() { return this; }, setXFrameOptionsMode() { return this; }, getContent: () => '' }), XFrameOptionsMode: { ALLOWALL: 1 } },
  SpreadsheetApp: { create: () => makeBook(), openById: id => { if (!books[id]) throw new Error('nf'); return books[id]; } },
  DriveApp: { createFolder: n => mkFolder(n, null), getFolderById: id => folders.find(f => f.id === id) || (() => { throw new Error('nf'); })(), getFileById: id => { const fl = files.find(x => x.id === id); if (!fl) return {}; return { setContent(c) { fl.content = c; }, getBlob: () => ({ getDataAsString: () => fl.content }) }; }, getRootFolder: () => ({ removeFile() { } }) },
  MimeType: { PLAIN_TEXT: 'text/plain' },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); } }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; } }) },
  LockService: { getScriptLock: () => ({ waitLock() { }, tryLock() { return true; }, releaseLock() { } }) },
  UrlFetchApp: { fetch: (url, opt) => (ctx.__fetch ? ctx.__fetch(url, opt) : { getResponseCode: () => 503, getContentText: () => '' }) },
  ScriptApp: { _t: [], getProjectTriggers() { return this._t; }, newTrigger(fn) { const self = this; const t = { getHandlerFunction: () => fn }; return { timeBased: () => ({ everyMinutes: () => ({ create: () => { self._t.push(t); return t; } }) }) }; }, deleteTrigger(t) { this._t = this._t.filter(x => x !== t); } },
  Utilities: { sleep() { }, getUuid: () => crypto.randomUUID(), computeDigest: (alg, s) => Array.from(crypto.createHash('sha256').update(s).digest()).map(x => x > 127 ? x - 256 : x), DigestAlgorithm: { SHA_256: 1 } }
};
vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/Code.gs', 'utf8'), ctx);
const call = (fn, ...a) => vm.runInContext(fn, ctx)(...a);
const expectErr = (fn, ...a) => { try { call(fn, ...a); } catch (e) { return e.message; } throw new Error(fn + ' ควรผิดพลาด'); };
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

const cfg = call('getPublicConfig'); ok(cfg.year === '2569' && cfg.size === 40, 'config');
ok(folders[0].name === 'M3', 'สร้างโฟลเดอร์ M3');
ok(/รหัสยังไม่ถูก/.test(expectErr('loginStudent', '5', '0000')), 'รหัสนักเรียนผิด');
ok(/เลือกเลขที่/.test(expectErr('loginStudent', '99', '1234')), 'เลขที่เกินช่วง');
const s5 = call('loginStudent', '05', '1234'); ok(s5.token && s5.profile.number === '5', 'นักเรียนเข้า');
const s6 = call('loginStudent', '6', '1234');
const sub = { id: 'sub-a', chapterId: 'DT-M3-C03', version: 1, submittedAt: '2026-10-18T01:00:00Z', fields: { problem: 'ดินสอตก' }, labs: {} };
ok(call('pushSubmission', s5.token, sub).ok, 'ส่งงาน');
ok(files.length === 1 && /บท3-ฉบับ1/.test(files[0].name), 'บันทึกไฟล์ใน Drive');
ok(files[0].folder.name === 'เลขที่ 05' && files[0].folder.parent.name === 'ปี 2569', 'โฟลเดอร์ปี/เลขที่');
ok(files[0].folder.parent.parent.name === 'งานนักเรียน - การออกแบบและเทคโนโลยี ม.3' && files[0].folder.parent.parent.parent.name === 'M3', 'งานนักเรียนอยู่ใน M3');
ok(/ไม่มีสิทธิ์/.test(expectErr('pushSubmission', s6.token, sub)), 'ห้ามแก้งานของคนอื่น');
call('pushSubmission', s5.token, Object.assign({}, sub, { fields: { problem: 'แก้ไข' } })); ok(files.length === 1, 'ส่งซ้ำ id เดิมไม่สร้างไฟล์ใหม่');
call('pushSubmission', s6.token, { id: 'sub-b', chapterId: 'DT-M3-C01', version: 1, fields: { problem: 'x' }, labs: {} });
ok(/ใหญ่เกินไป/.test(expectErr('pushSubmission', s5.token, { id: 'big', chapterId: 'DT-M3-C01', fields: { a: 'x'.repeat(905000) } })), 'จำกัดขนาดงาน');
call('pushPractice', s5.token, 3, { best: 80, tries: 2, battle: 1, last: 80 }); call('pushPractice', s5.token, 3, { best: 60, tries: 3, battle: 0, last: 60 });
const mine = call('pullMine', s5.token); ok(mine.practice[3].best === 80 && mine.practice[3].battle === 1 && mine.practice[3].tries === 3, 'คะแนนด่านฝึกเก็บค่าสูงสุด');
ok(mine.submissions.length === 1 && mine.submissions[0].fields.problem === 'แก้ไข', 'ดึงงานของตน');
call('pushPractice', s5.token, 2, { best: 0, tries: 0, battle: 0, last: 0, pre: 25 });
call('pushPractice', s5.token, 2, { best: 0, tries: 0, battle: 0, last: 0, pre: 75, post: 100, reflect: { a: 'เข้าใจผิดว่าต้องใช้ไฟฟ้า', b: 'อ่านตัวอย่างถาดดินสอ', c: 'ตรวจว่ามนุษย์ทำขึ้นเพื่อแก้ปัญหา', level: 3 } });
const minePP = call('pullMine', s5.token); ok(minePP.practice[2].pre === 25 && minePP.practice[2].post === 100 && minePP.practice[2].reflect.level === 3 && /ไฟฟ้า/.test(minePP.practice[2].reflect.a), 'เก็บผลก่อนเรียนครั้งแรก ผลหลังเรียน และสะท้อนคิด');
ok(mine.practice[3].pre === null && mine.practice[3].post === null, 'บทที่ยังไม่ทำก่อน/หลังเรียนเป็นค่าว่าง');

ok(/ไม่มีสิทธิ์/.test(expectErr('pullAll', s5.token)), 'นักเรียนเรียกข้อมูลครูไม่ได้');
ok(/ไม่ถูกต้อง/.test(expectErr('loginStaff', 'teacher', 'xxxx')), 'ครูรหัสผิด');
const t = call('loginStaff', 'teacher', '2468');
const all = call('pullAll', t.token); ok(all.submissions.length === 2 && all.students.length === 2 && all.practice['5'][3].best === 80, 'ครูเห็นงานทุกคน');
const r = call('saveReviews', t.token, [{ id: 'sub-a', review: { status: 'graded', scores: [10, 20], comment: 'ดีมาก' } }, { id: 'sub-b', review: { status: 'revision_requested', comment: 'เพิ่มหลักฐาน' } }, { id: 'sub-a', review: { status: 'graded', scores: [1], comment: '' } }]);
ok(r.saved === 2, 'ตรวจหลายคนพร้อมกัน (ข้ามรายการไม่มีข้อเสนอแนะ)');
const mine2 = call('pullMine', s5.token); ok(mine2.submissions[0].review.status === 'graded' && mine2.submissions[0].review.scores[1] === 20, 'นักเรียนเห็นผลตรวจ');
ok(call('upsertStudents', t.token, [{ number: 5, name: 'ตัวอย่าง ห้า' }, { number: 41, name: 'เกิน' }, { number: 7, name: 'ตัวอย่าง เจ็ด' }]).saved === 2, 'นำเข้ารายชื่อ');
ok(call('pullAll', t.token).students.find(x => x.number === '5').name === 'ตัวอย่าง ห้า', 'ชื่อถูกอัปเดต');
call('setConfig', t.token, { pin: '5678' }); ok(/รหัสยังไม่ถูก/.test(expectErr('loginStudent', '5', '1234')) && call('loginStudent', '5', '5678').token, 'เปลี่ยนรหัสนักเรียน');
ok(/4–8 หลัก/.test(expectErr('changeStaffPassword', t.token, '2468', '123')), 'รหัสพินครูใหม่สั้นไป');
ok(/4–8 หลัก/.test(expectErr('changeStaffPassword', t.token, '2468', 'abcd12')), 'รหัสพินครูต้องเป็นตัวเลข');
call('changeStaffPassword', t.token, '2468', '135790'); ok(call('loginStaff', 'teacher', '135790').token, 'เปลี่ยนรหัสครู');
for (let i = 0; i < 8; i++) { try { call('loginStudent', '9', 'bad'); } catch (e) { /* นับครั้ง */ } }
ok(/ลองใหม่ภายหลัง/.test(expectErr('loginStudent', '9', '5678')), 'กันเดารหัส');

/* ---------- AI (Gemini) ร่างข้อเสนอแนะ ---------- */
{
  const rub = [{ criterion: 'ปัญหาและเกณฑ์', points: 20 }, { criterion: 'หลักฐานและเหตุผล', points: 20 }];
  const lab = { problem: 'ปัญหาที่พบ' };
  ok(/ไม่มีสิทธิ์/.test(expectErr('aiDraftReview', s5.token, 'sub-a', rub, lab)), 'นักเรียนเรียก AI ร่างไม่ได้');
  ok(call('getPublicConfig').ai === false, 'ยังไม่มีคีย์ → ai=false');
  ok(/GEMINI_API_KEY/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'ไม่มีคีย์ต้องแจ้งให้ตั้งค่า');
  ctx.PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'TEST-KEY');
  ok(call('getPublicConfig').ai === true, 'มีคีย์ → ai=true');
  ok(JSON.stringify(call('getPublicConfig')).indexOf('TEST-KEY') < 0, 'ค่าตั้งค่าสาธารณะไม่เผยคีย์');
  let seen = null;
  const reply = (obj, code) => ({ getResponseCode: () => code || 200, getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: typeof obj === 'string' ? obj : JSON.stringify(obj) }] } }] }) });
  ctx.__fetch = () => reply({ scores: [99, -5], comment: 'x' });
  ok(/ไม่ครบหรือไม่อยู่ในช่วง/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'คะแนนหลุดช่วงไม่ถูกบีบ แต่ถือว่าร่างไม่สำเร็จ');
  ctx.CacheService.getScriptCache().remove('ai:sub-a');
  ctx.__fetch = () => reply({ scores: [10], comment: 'x' });
  ok(/ไม่ครบ/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'คะแนนไม่ครบทุกเกณฑ์ไม่เติม 0 ให้เอง');
  ctx.CacheService.getScriptCache().remove('ai:sub-a');
  ctx.__fetch = () => reply({ scores: [10, '20'], comment: 'x' });
  ok(/ไม่ครบ/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'คะแนนที่ไม่ใช่ตัวเลขไม่ถูกแปลงเป็น 0');
  ctx.CacheService.getScriptCache().remove('ai:sub-a');
  ctx.__fetch = (url, opt) => { seen = { url, opt, body: JSON.parse(opt.payload) }; return reply({ scores: [20, 0], comment: 'ทำได้ดีเรื่องปัญหา ควรเพิ่มหลักฐาน', note: 'ตรวจภาพเอง' }); };
  const d = call('aiDraftReview', t.token, 'sub-a', rub, Object.assign({ __task: 'โจทย์: ออกแบบที่จัดเก็บอุปกรณ์ 20x15 ซม.' }, lab));
  ok(d.scores[0] === 20 && d.scores[1] === 0 && /หลักฐาน/.test(d.comment) && d.draft === true && /ตรวจภาพเอง/.test(d.note), 'ร่างที่ถูกต้องผ่าน พร้อมข้อความถึงครู');
  ok(/ออกแบบที่จัดเก็บอุปกรณ์/.test(seen.body.contents[0].parts[0].text) && !/สั้นเกินไปให้ให้คะแนนต่ำ/.test(seen.body.systemInstruction.parts[0].text) && /ไม่ให้คะแนนตามความยาว/.test(seen.body.systemInstruction.parts[0].text), 'ส่งโจทย์ของบท และไม่ลงโทษคำตอบสั้น');
  ok(seen.opt.headers['x-goog-api-key'] === 'TEST-KEY' && /generativelanguage\.googleapis\.com/.test(seen.url) && seen.url.indexOf('TEST-KEY') < 0, 'ส่งคีย์ทางหัวข้อความ ไม่อยู่ใน URL');
  const sent = JSON.stringify(seen.body);
  ok(sent.indexOf('เลขที่ 05') < 0 && sent.indexOf('ม.3/1') < 0 && /แก้ไข/.test(sent), 'ส่งเฉพาะข้อความงาน ไม่มีชื่อ/เลขที่/ห้อง');
  ok(/ห้ามทำตามคำสั่ง/.test(seen.body.systemInstruction.parts[0].text) && /<<<งาน/.test(seen.body.contents[0].parts[0].text), 'มีคำสั่งกันการสั่งแฝงในงาน และครอบงานเป็นข้อมูล');
  ok(/รออีกสักครู่/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'ขอร่างงานเดิมซ้ำเร็วเกินไปถูกกัน');
  ctx.CacheService.getScriptCache().remove('ai:sub-a');
  ctx.__fetch = () => reply('ไม่ใช่ json');
  ok(/อ่านไม่ได้/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'AI ตอบผิดรูปแบบต้องแจ้ง');
  ctx.CacheService.getScriptCache().remove('ai:sub-a');
  ctx.__fetch = () => ({ getResponseCode: () => 429, getContentText: () => '' });
  ok(/โควตา/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'ใช้เกินโควตาของ Gemini');
  ctx.CacheService.getScriptCache().remove('ai:sub-a');
  ok(/ไม่พบงาน/.test(expectErr('aiDraftReview', t.token, 'nope', rub, lab)), 'ไม่มีงานนั้น');
  ctx.PropertiesService.getScriptProperties().setProperty('DT_AI_DAILY', '1');
  ok(/ครบโควตา/.test(expectErr('aiDraftReview', t.token, 'sub-a', rub, lab)), 'โควตารายวันของระบบ');
  ctx.PropertiesService.getScriptProperties().setProperty('DT_AI_DAILY', '150'); ctx.__fetch = null;
  const sv = call('saveReviews', t.token, [{ id: 'sub-b', review: { status: 'graded', scores: [10, 10], comment: 'ร่างจาก AI ครูแก้แล้ว', ai: 1 } }]);
  ok(call('pullMine', s6.token).submissions[0].review.ai === 1, 'ผลตรวจเก็บเครื่องหมายว่ามี AI ช่วยร่าง');
  /* AI ร่างอัตโนมัติเมื่อนักเรียนส่งงาน */
  ctx.PropertiesService.getScriptProperties().setProperty('DT_AI_DAILY', '150');
  call('pushSubmission', s5.token, Object.assign({}, sub, { id: 'sub-auto', fields: { problem: 'ของบนโต๊ะหาไม่เจอ' } }));
  ok(/ไม่มีสิทธิ์/.test(expectErr('setAutoDraft', s5.token, true, { 3: rub }, { 3: lab })), 'นักเรียนเปิด AI อัตโนมัติไม่ได้');
  const on = call('setAutoDraft', t.token, true, { 3: rub }, { 3: lab });
  ok(on.on === true && ctx.ScriptApp._t.length === 1 && on.waiting >= 1, 'เปิดแล้วตั้งเวลาไว้ 1 ตัว และนับงานที่รอร่าง');
  call('setAutoDraft', t.token, true, { 3: rub }, { 3: lab }); ok(ctx.ScriptApp._t.length === 1, 'เปิดซ้ำไม่ตั้งเวลาซ้อน');
  ctx.__fetch = () => reply({ scores: [15, 18], comment: 'ร่างอัตโนมัติ' });
  call('dtAutoDraftTick');
  let st = call('getAutoDraft', t.token);
  const dd = st.drafts.find(x => x.id === 'sub-auto');
  ok(dd && dd.scores[0] === 15 && dd.comment === 'ร่างอัตโนมัติ' && !st.drafts.some(x => x.id === 'sub-a'), 'ร่างงานที่ยังไม่ตรวจ ไม่ร่างงานที่ตรวจแล้ว');
  ctx.__fetch = () => reply({ scores: [12, 14], comment: 'ร่างทันที' });
  const now1 = call('pushSubmission', s5.token, Object.assign({}, sub, { id: 'sub-now', fields: { problem: 'ส่งแล้วร่างทันที' } }));
  ok(now1.aiDraft && now1.aiDraft.scores[0] === 12 && call('getAutoDraft', t.token).drafts.some(x => x.id === 'sub-now' && x.comment === 'ร่างทันที'), 'นักเรียนกดส่งแล้ว AI ร่างคะแนนทันที ไม่ต้องรอรอบ 5 นาที');
  const mineNow = call('pullMine', s5.token).submissions.find(x => x.id === 'sub-now'); ok(mineNow.aiDraft && mineNow.aiDraft.comment === 'ร่างทันที' && !('note' in mineNow.aiDraft), 'นักเรียนเห็นผลร่างจาก AI ของตัวเอง (ไม่มีหมายเหตุถึงครู)');
  call('saveReviews', t.token, [{ id: 'sub-now', review: { status: 'graded', scores: [12, 14], comment: 'ร่างทันที', ai: 1 } }]);
  ok(!call('pullMine', s5.token).submissions.find(x => x.id === 'sub-now').aiDraft, 'ครูยืนยันแล้ว นักเรียนเห็นผลของครูแทนร่าง');
  st = call('getAutoDraft', t.token);
  const before = st.drafts.length; call('dtAutoDraftTick'); ok(call('getAutoDraft', t.token).drafts.length === before, 'รอบถัดไปไม่ร่างงานเดิมซ้ำ');
  call('saveReviews', t.token, [{ id: 'sub-auto', review: { status: 'graded', scores: [15, 18], comment: 'ร่างอัตโนมัติ', ai: 1 } }]);
  ok(!call('getAutoDraft', t.token).drafts.some(x => x.id === 'sub-auto'), 'ครูยืนยันแล้ว ร่างหายจากรายการรอ');
  ctx.__fetch = () => ({ getResponseCode: () => 429, getContentText: () => '' });
  const subQ = call('pushSubmission', s5.token, Object.assign({}, sub, { id: 'sub-q', fields: { problem: 'ส่งพร้อมกันทั้งห้อง' } }));
  ok(subQ.ok === true && !subQ.aiDraft && subQ.aiQueued === true, 'โควตา AI เต็มตอนส่ง: บอกนักเรียนว่างานอยู่ในคิว AI');
  ok(call('pullMine', s5.token).submissions.find(x => x.id === 'sub-q').aiQueued === true, 'นักเรียนดึงข้อมูลใหม่ยังเห็นสถานะรอคิว AI');
  call('saveReviews', t.token, [{ id: 'sub-q', review: { status: 'graded', scores: [10, 10], comment: 'ครูตรวจเอง' } }]);
  ok(!call('pullMine', s5.token).submissions.find(x => x.id === 'sub-q').aiQueued, 'ครูตรวจแล้ว ไม่ขึ้นรอคิว AI');
  /* ร่างผิดพลาดแล้วลองใหม่ภายหลัง (ไม่ค้างถาวร) และงานยาว/มีภาพวาดต้องแจ้งครู */
  ctx.__fetch = () => ({ getResponseCode: () => 500, getContentText: () => '' });
  const subLong = call('pushSubmission', s5.token, Object.assign({}, sub, { id: 'sub-long', fields: { problem: 'ก'.repeat(4000) }, labs: { 'lab-x': { values: { w: 20 }, result: 'ผ่าน', strokes: [[1, 2]] } } }));
  ok(subLong.ok === true && !subLong.aiDraft, 'AI ร่างไม่สำเร็จตอนส่ง แต่ส่งงานสำเร็จตามปกติ');
  call('dtAutoDraftTick'); st = call('getAutoDraft', t.token);
  ok(st.errors.some(x => x.id === 'sub-long'), 'ร่างผิดพลาดแสดงในรายการ');
  let seen2 = null; ctx.__fetch = (u, o2) => { seen2 = JSON.parse(o2.payload); return reply({ scores: [10, 10], comment: 'ok' }); };
  call('dtAutoDraftTick'); ok(!call('getAutoDraft', t.token).drafts.some(x => x.id === 'sub-long'), 'ยังไม่ลองซ้ำทันที (รอ 30 นาที)');
  const realNow = Date.now; Date.now = () => realNow() + 31 * 60 * 1000;
  call('dtAutoDraftTick'); Date.now = realNow; st = call('getAutoDraft', t.token);
  const dl = st.drafts.find(x => x.id === 'sub-long');
  ok(dl && /ถูกตัด/.test(dl.note) && /ภาพวาด/.test(dl.note), 'ลองใหม่หลัง 30 นาทีสำเร็จ และแจ้งครูเรื่องข้อความถูกตัดและภาพวาด');
  ok(/ข้อมูลที่บันทึกจากพื้นที่ทดลอง/.test(seen2.contents[0].parts[0].text) && /"w":20/.test(seen2.contents[0].parts[0].text) && /ปัญหาและเกณฑ์|problem/.test(seen2.contents[0].parts[0].text), 'ส่งข้อมูลกิจกรรมให้ AI ด้วย');
  const off = call('setAutoDraft', t.token, false); ok(off.on === false && ctx.ScriptApp._t.length === 0, 'ปิดแล้วลบตัวตั้งเวลา');
}
{ call('pushSubmission', s5.token, { id: 'photo-big', chapterId: 'DT-M3-C01', version: 1, fields: { observations: 'ดูรูป', __photo: 'data:image/jpeg;base64,' + 'A'.repeat(60000) }, labs: {} }); ok(files.some(f => /บท1-ฉบับ1/.test(f.name) && f.content.length > 60000), 'งานที่มีรูปใหญ่ถูกเก็บเป็นไฟล์ใน Drive'); }
/* งานร่างบนเซิร์ฟเวอร์ + ดึงงานต้องมีรหัสเข้าใช้งาน */
ok(/หมดเวลา|เข้าสู่ระบบ|ไม่มีสิทธิ์/.test(expectErr('pullMine', 'bad-token', '5')), 'ดึงงานด้วยเลขที่อย่างเดียวไม่ได้');
call('saveDraft', s5.token, 'DT-M3-C02', { comparison: 'ร่างข้อ 1', causes: '' }, '2026-10-18T10:00:00Z');
ok(call('pullMine', s5.token).drafts[2].fields.comparison === 'ร่างข้อ 1', 'บันทึกและดึงงานร่างคืนได้');
ok(call('saveDraft', s5.token, 'DT-M3-C02', { comparison: 'เก่ากว่า' }, '2026-10-18T09:00:00Z').stale === true && call('pullMine', s5.token).drafts[2].fields.comparison === 'ร่างข้อ 1', 'ร่างเก่ากว่าไม่ทับร่างใหม่');
call('saveDraft', s5.token, 'DT-M3-C02', { comparison: 'ใหม่', __photo: 'data:image/jpeg;base64,' + 'B'.repeat(50000) }, '2026-10-18T11:00:00Z');
ok(files.some(f => /ร่างบท2/.test(f.name)), 'ร่างที่มีรูปใหญ่เก็บเป็นไฟล์ใน Drive');
ok(/ไม่มีสิทธิ์/.test(expectErr('saveDraft', t.token, 'DT-M3-C02', { a: 'x' }, '')), 'ครูบันทึกร่างแทนนักเรียนไม่ได้');
{ call('pushSubmission', s5.token, { id: 'with-photo', chapterId: 'DT-M3-C03', version: 1, fields: { problem: 'ดูรูป', __photo: 'data:image/jpeg;base64,QUJD' }, labs: {} });
  let sent = null; ctx.__fetch = (u, o2) => { sent = JSON.parse(o2.payload); return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ scores: [10, 10], comment: 'ok' }) }] } }] }) }; };
  call('aiDraftReview', t.token, 'with-photo', [{ criterion: 'a', points: 20 }, { criterion: 'b', points: 20 }], {});
  const ps = sent.contents[0].parts; ok(ps.length === 2 && ps[1].inlineData.mimeType === 'image/jpeg' && ps[1].inlineData.data === 'QUJD' && ps[0].text.indexOf('QUJD') < 0, 'ส่งรูปให้ AI เป็นรูป ไม่ใช่ข้อความ'); }
/* ใบงาน V5: หลายข้อวาด ส่งทุกรูปเป็นรูป (ไม่เกิน 6) และส่งผลตรวจอัตโนมัติ (__auto) ให้ AI */
{ const img = s => 'data:image/jpeg;base64,' + s;
  call('pushSubmission', s5.token, { id: 'v5-draws', chapterId: 'DT-M3-C03', version: 1, fields: { q1: '[["ความกว้างไม่เกิน",40]]', q3: img('QQ'), q4: img('QR'), q8: img('QS'), __auto: 'ข้อ 1 ตรวจอัตโนมัติ ได้ 10/10' }, labs: {} });
  ctx.CacheService.getScriptCache().remove('ai:v5-draws');
  let sent = null; ctx.__fetch = (u, o2) => { sent = JSON.parse(o2.payload); return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ scores: [10, 10], comment: 'ok' }) }] } }] }) }; };
  call('aiDraftReview', t.token, 'v5-draws', [{ criterion: 'a', points: 20 }, { criterion: 'b', points: 20 }], { q3: 'ข้อ 3 วาดแบบ A' });
  const ps = sent.contents[0].parts, tx = ps[0].text;
  ok(ps.length === 4 && ps.slice(1).every(p => p.inlineData && p.inlineData.mimeType === 'image/jpeg') && /รูปที่ 1/.test(tx) && /รูปที่ 3/.test(tx) && tx.indexOf('base64') < 0, 'ข้อวาดหลายข้อส่งเป็นรูปครบ และอ้างเลขรูปในข้อความ');
  ok(/ตรวจอัตโนมัติ ได้ 10\/10/.test(tx), 'ส่งผลตรวจอัตโนมัติให้ AI');
  call('saveDraft', s5.token, 'DT-M3-C03', { q3: img('A'.repeat(90000)), q9: 'ข้อความ' }, '2026-10-18T12:00:00Z');
  ok(call('pullMine', s5.token).drafts[3].fields.q3.length > 90000, 'ร่างเก็บภาพวาดขนาดปกติได้ครบ ไม่ถูกตัด'); }
/* เปิด/ปิดบทเรียน สัดส่วนคะแนน และข้อที่ผิดในด่านฝึก */
{ const c1 = call('setConfig', t.token, { locks: [2, 3, 3, 9, 'x'], weights: { work: 5, post: 3, prac: 2 } });
  ok(JSON.stringify(c1.locks) === '[2,3]' && c1.weights.work === 5, 'บันทึกบทที่ปิดเฉพาะเลขบทที่ถูกต้อง และบันทึกสัดส่วนคะแนน');
  ok(/รวมกันได้ 10/.test(expectErr('setConfig', t.token, { weights: { work: 5, post: 5, prac: 5 } })), 'สัดส่วนที่รวมไม่ได้ 10 ถูกปฏิเสธ');
  ok(/ไม่มีสิทธิ์|เข้าสู่ระบบ/.test(expectErr('setConfig', s5.token, { locks: [] })), 'นักเรียนเปิดปิดบทเองไม่ได้');
  const mine = call('pullMine', s5.token); ok(mine.config && JSON.stringify(mine.config.locks) === '[2,3]' && mine.config.weights.post === 3, 'นักเรียนได้รับบทที่ปิดและสัดส่วนคะแนน');
  call('pushPractice', s5.token, 3, { best: 60, tries: 1, last: 60, miss: [1, 3, 99, -1, 'x'] });
  const pr = call('pullAll', t.token).practice['5'][3]; ok(JSON.stringify(pr.miss) === '[1,3]', 'เก็บข้อที่ผิดในด่านฝึก (กรองค่าที่ไม่ถูกต้อง)');
  call('setConfig', t.token, { locks: [], weights: { work: 4, post: 4, prac: 2 } }); }
/* สอบปลายภาค: ครูเปิดก่อน · ทำได้ครั้งเดียว · ตรวจที่เซิร์ฟเวอร์ · ครูรีเซ็ตได้ */
{ const KEY = JSON.parse(/const DT_FINAL_KEY = (\{.*?\});/.exec(fs.readFileSync(__dirname + '/Code.gs', 'utf8'))[1]);
  ok(Object.keys(KEY).length === 60, 'เฉลยข้อสอบปลายภาคมี 60 ข้อ');
  ok(/ยังไม่เปิด/.test(expectErr('startFinal', s5.token)), 'ครูยังไม่เปิด นักเรียนเริ่มสอบไม่ได้');
  ok(call('setConfig', t.token, { finalOpen: true }).finalOpen === true && call('getMyFinal', s5.token).open === true, 'ครูเปิดสอบปลายภาค');
  const st1 = call('startFinal', s5.token), st2 = call('startFinal', s5.token);
  ok(st1.status === 'started' && st1.seed > 0 && st2.seed === st1.seed, 'เริ่มสอบซ้ำได้ลำดับข้อเดิม (ไม่สุ่มใหม่)');
  const ans = {}; Object.keys(KEY).forEach((q, i) => { ans[q] = i < 45 ? KEY[q][1] : (KEY[q][1] + 1) % 4; }); ans.HACK = 1;
  const r1 = call('submitFinal', s5.token, ans);
  ok(r1.status === 'done' && r1.score === 45 && r1.total === 60, 'ตรวจคะแนนที่เซิร์ฟเวอร์ถูกต้อง (45/60)');
  ok(Object.values(r1.perChapter).reduce((a, x) => a + x[1], 0) === 60, 'แยกคะแนนรายบทครบ 60 ข้อ');
  const all = {}; Object.keys(KEY).forEach(q => { all[q] = KEY[q][1]; });
  ok(call('submitFinal', s5.token, all).score === 45 && call('startFinal', s5.token).status === 'done', 'ส่งซ้ำหรือเริ่มใหม่ไม่ได้ คะแนนเดิมไม่เปลี่ยน');
  ok(call('pullMine', s5.token).final.score === 45, 'นักเรียนเห็นคะแนนสอบปลายภาคของตัวเอง');
  const f = call('pullAll', t.token).finals.find(x => x.number === '5'); ok(f && f.score === 45 && f.miss.length === 15, 'ครูเห็นคะแนนและข้อที่ผิดของนักเรียน');
  ok(/ไม่มีสิทธิ์|เข้าสู่ระบบ/.test(expectErr('resetFinal', s5.token, f.number)), 'นักเรียนรีเซ็ตเองไม่ได้');
  call('resetFinal', t.token, '2569', '5');
  const st3 = call('startFinal', s5.token); ok(st3.status === 'started' && st3.attempt === 2 && call('getMyFinal', s5.token).final.score === null, 'ครูรีเซ็ตแล้ว นักเรียนเริ่มทำใหม่ได้ (ครั้งที่ 2)');
  ok(call('gradeFinalPreview', all).score === 60, 'โหมดดูตัวอย่างตรวจคะแนนได้โดยไม่บันทึก');
  call('setConfig', t.token, { finalOpen: false }); ok(call('getMyFinal', s5.token).open === false, 'ครูปิดสอบปลายภาค'); }
console.log('ผ่านทั้งหมด ' + n + ' รายการ');
