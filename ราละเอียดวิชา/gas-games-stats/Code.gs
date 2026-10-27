/* ===== KruKan · สถิติเกมกลาง (Google Apps Script ผูกกับชีต "KruKan · สถิติเกม") =====
   เกมทุกเกมส่งผลการเล่นมาที่นี่ (doPost) และขออันดับ (doGet) ข้อมูลเก็บในชีตเดียวกันทั้งหมด:
   - บันทึกการเล่น  : หนึ่งแถวต่อหนึ่งครั้งที่เล่นจบ (เวลา วันที่ เกม ชื่อเล่น ด่าน ดาว พลาด ใบ้ วินาที โหมด อุปกรณ์ รหัสเครื่อง)
   - ผู้เล่น          : หนึ่งแถวต่อหนึ่งเครื่อง/ผู้เล่น ครูแก้ 'ชื่อที่แสดงในอันดับ' หรือติ๊ก 'ซ่อนในอันดับ' ได้
   - สรุปรายวัน / สรุปรายเกม : จำนวนครั้งและจำนวนผู้เล่นต่อวัน/ต่อเกม (นับเพิ่มทีละครั้ง)
   - _รวมดาว _ดีที่สุดรายด่าน _วันละเครื่อง : ชีตช่วยคำนวณอันดับและสรุป (ซ่อนไว้ ห้ามแก้)
   ความเป็นส่วนตัว: เก็บเท่าที่จำเป็น (ไม่มี IP ไม่มีที่อยู่ ไม่มีเบอร์) เก็บแค่ 'ชื่อเล่น' ช่องเดียว (ไม่เก็บนามสกุล) ผู้ที่ไม่ใส่ชื่อขึ้นเป็น 'นิรนาม'
   ใช้ครั้งแรก: เปิดสคริปต์ในตัวแก้ไข เลือกฟังก์ชัน setup แล้วกดเรียกใช้ (จะขอสิทธิ์ครั้งเดียว) จากนั้น Deploy เป็นเว็บแอป (ดำเนินการในนามของฉัน · ทุกคนเข้าถึงได้) */
const INITIAL_KEY = 'f0326d34b303db';   // รหัสที่เกมแนบมากับคำขอ (อยู่ในไฟล์เกมสาธารณะ จึงไม่ใช่ความลับ ใช้กันคำขอสุ่มจากที่อื่นเท่านั้น) เปลี่ยนได้ด้วยการแก้ที่นี่ แก้ stats.json แล้ว build เกมใหม่
const CFG = {
  TZ: 'Asia/Bangkok', TOP: 5, CACHE_S: 30, RATE_N: 40, RATE_S: 600,
  GAMES: ['steps', 'folder', 'parts', 'slice', 'talk', 'aksorn', 'math', 'debug', 'packet', 'phish', 'code-runner', 'grid', 'typing', 'caesar', 'rainbow', 'beat', 'kbq', 'mouse', 'snake', 'sortnum', 'colmath', 'roman', 'plusrun']
};
const SH = { PLAYS: 'บันทึกการเล่น', PLAYERS: 'ผู้เล่น', DAILY: 'สรุปรายวัน', GAME: 'สรุปรายเกม', RANK: '_รวมดาว', BEST: '_ดีที่สุดรายด่าน', DAYP: '_วันละเครื่อง' };
const HEAD = {
  PLAYS: ['เวลา', 'วันที่', 'เกม', 'ชื่อเล่น', 'ด่าน', 'ดาว', 'คะแนน', 'พลาด', 'ใช้คำใบ้', 'วินาที', 'โหมด', 'อุปกรณ์', 'รหัสเครื่อง', 'รุ่นเกม'],
  PLAYERS: ['รหัสเครื่อง', 'ชื่อเล่น', 'ชื่อที่แสดงในอันดับ', 'ซ่อนในอันดับ', 'เล่นครั้งแรก', 'เล่นล่าสุด', 'จำนวนครั้งที่เล่น'],
  DAILY: ['คีย์', 'วันที่', 'เกม', 'จำนวนครั้งที่เล่น', 'จำนวนผู้เล่น (เครื่องไม่ซ้ำ)'],
  GAME: ['เกม', 'จำนวนครั้งที่เล่น', 'จำนวนผู้เล่น (เครื่องไม่ซ้ำ)', 'เล่นล่าสุด'],
  RANK: ['คีย์', 'เกม', 'รหัสเครื่อง', 'ดาวรวม', 'คะแนนรวม', 'อัปเดตล่าสุด'],
  BEST: ['คีย์', 'ดาว', 'คะแนน'],
  DAYP: ['คีย์']
};
// รูปแบบเซลล์ (เลขคอลัมน์ : รูปแบบ) ตั้งทุกครั้งที่ setup กันรูปแบบตกค้างทำให้จำนวนครั้งโชว์เป็นวันที่ และกันด่านแบบ 1:2 ถูกแปลงเป็นเวลา · ความกว้างคอลัมน์ (พิกเซล)
const FORMAT = { PLAYS: { 1: 'HH:mm:ss', 5: '@' }, PLAYERS: { 5: 'dd/MM HH:mm', 6: 'dd/MM HH:mm', 7: '0' }, GAME: { 4: 'dd/MM HH:mm' } };
const WIDTH = { PLAYS: { 1: 80, 2: 100, 3: 100, 4: 130, 12: 130, 13: 130 }, PLAYERS: { 1: 130, 2: 130, 3: 170, 4: 110, 5: 120, 6: 120, 7: 130 }, DAILY: { 1: 150, 3: 220, 4: 130, 5: 190 }, GAME: { 1: 100, 2: 130, 3: 190, 4: 120 } };
const GAME_NAME = { steps: 'ก้าวคำสั่ง (Techno Steps)', folder: 'นักจัดแฟ้ม (Techno Folder)', parts: 'ช่างประกอบคอม (Techno Parts)', slice: 'ช่างแบ่งพิซซ่า (Techno Slice)', talk: 'ประโยคอังกฤษ (Techno Talk)', aksorn: 'ตะลุยเมืองอักษร (Techno Aksorn)', math: 'สมรภูมิคณิต (Techno Math)', debug: 'จับผิดโปรแกรม (Bug Buster)', packet: 'ไปรษณีย์ข้อมูล (Packet Express)', phish: 'สายตรวจเน็ต (Net Patrol)', 'code-runner': 'วิ่งตามคำสั่ง (Code Runner)', grid: 'เขาวงกตคำสั่ง (Techno Grid)', typing: 'จอมพิมพ์ (Type Hero)', caesar: 'แกะรหัสซีซาร์ (Cipher Breaker)', rainbow: 'เมืองสีรุ้ง (Rainbow City)', beat: 'จอมจังหวะ (Beat Hero)', kbq: 'ภารกิจแป้นพิมพ์ (Keyboard Quest)', mouse: 'ผจญภัยเมาส์ (Mouse Adventure)', snake: 'บันไดงูบวกลบเลข (Snake Ladder Math)', sortnum: 'เรียงลำดับตัวเลข (Number Run)', colmath: 'คิดเลขแสนสนุก (Power Columns)', roman: 'เลขโรมัน (Roman Code)', plusrun: 'สมบัติพลังบวก (Plus Power Hunter)' };

/* ---------- เริ่มใช้งาน ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try { ss.setSpreadsheetTimeZone(CFG.TZ); ss.setSpreadsheetLocale('en_US'); } catch (e) { /* ไม่เป็นไร */ }
  Object.keys(SH).forEach(k => {
    let sh = ss.getSheetByName(SH[k]) || ss.insertSheet(SH[k]);
    sh.getRange(1, 1, 1, sh.getMaxColumns()).clearContent(); sh.getRange(1, 1, 1, HEAD[k].length).setValues([HEAD[k]]);   // เขียนหัวตารางใหม่เสมอ (ถ้ามีข้อมูลรูปแบบเก่าต้องล้างก่อนด้วย clearAllData)
    try { Object.keys(FORMAT[k] || {}).forEach(c => sh.getRange(2, Number(c), sh.getMaxRows() - 1, 1).setNumberFormat(FORMAT[k][c])); Object.keys(WIDTH[k] || {}).forEach(c => sh.setColumnWidth(Number(c), WIDTH[k][c])); } catch (e) { /* ไม่เป็นไร */ }
    try { sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD[k].length).setFontWeight('bold').setBackground('#e8eefc'); if (SH[k][0] === '_') sh.hideSheet(); } catch (e) { /* ไม่เป็นไร */ }
  });
  const first = ss.getSheets()[0]; if (first && ['Sheet1', 'ชีต1', 'แผ่นงาน1'].indexOf(first.getName()) >= 0) { try { ss.deleteSheet(first); } catch (e) { /* ไม่เป็นไร */ } }
  const props = PropertiesService.getScriptProperties(); props.setProperty('STATS_KEY', INITIAL_KEY); const key = INITIAL_KEY;
  Logger.log('STATS_KEY = ' + key);
  return key;
}

/* ล้างข้อมูลทุกแท็บ (เก็บหัวตาราง) ใช้ตอนเริ่มปีการศึกษาใหม่หรือหลังทดสอบ: เรียกจากตัวแก้ไขเท่านั้น ไม่เปิดเป็นเว็บแอป */
function clearAllData() {
  Object.keys(SH).forEach(k => {
    const sh = sheet_(SH[k]); if (!sh) return;
    const n = sh.getLastRow() - 1; if (n > 0) sh.getRange(2, 1, n, sh.getMaxColumns()).clearContent();
  });
  CacheService.getScriptCache().removeAll(CFG.GAMES.map(g => 'rank:' + g));
  Logger.log('ล้างข้อมูลแล้ว');
}

/* ---------- ทางเข้าเว็บแอป ---------- */
function doPost(e) {
  let out;
  try { out = handle_(JSON.parse((e && e.postData && e.postData.contents) || '{}')); } catch (err) { out = { ok: false, err: 'bad-request' }; }
  return json_(out);
}
function doGet(e) {
  let out;
  try { out = handle_(Object.assign({}, (e && e.parameter) || {}, { t: ((e && e.parameter && e.parameter.t) || 'rank') })); } catch (err) { out = { ok: false, err: 'bad-request' }; }
  const cb = e && e.parameter && e.parameter.callback;
  if (cb && /^[A-Za-z0-9_.$]{1,60}$/.test(cb)) return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return json_(out);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function handle_(d) {
  const key = PropertiesService.getScriptProperties().getProperty('STATS_KEY');
  if (!key || String(d.k || '') !== key) return { ok: false, err: 'key' };
  if (d.t === 'ping') return { ok: true, t: now_().toISOString() };
  const game = String(d.game || ''); if (CFG.GAMES.indexOf(game) < 0) return { ok: false, err: 'game' };
  const cid = clean_(d.cid, 24); if (!/^[A-Za-z0-9]{6,24}$/.test(cid)) return { ok: false, err: 'cid' };
  if (d.t === 'rank') return { ok: true, rank: rank_(game, cid) };
  if (d.t !== 'play') return { ok: false, err: 'type' };
  if (!allow_(cid)) return { ok: false, err: 'rate' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { record_(game, cid, d); } finally { lock.releaseLock(); }
  return { ok: true, rank: rank_(game, cid, true) };
}

/* ---------- ตัวช่วย ---------- */
function now_() { return new Date(); }
function clean_(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n); }
function safeText_(v, n) { const s = clean_(v, n); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function num_(v, lo, hi) { const x = Number(v); return isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x))) : 0; }
function th_(d) { return Utilities.formatDate(d, CFG.TZ, 'dd/MM/') + (Number(Utilities.formatDate(d, CFG.TZ, 'yyyy')) + 543); }
function sheet_(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function allow_(cid) {
  const c = CacheService.getScriptCache(), k = 'rl:' + cid, n = Number(c.get(k) || 0);
  if (n >= CFG.RATE_N) return false; c.put(k, String(n + 1), CFG.RATE_S); return true;
}
// หาแถวที่คอลัมน์แรกตรงคีย์ทั้งเซลล์ (TextFinder เร็วแม้ชีตยาว) คืนเลขแถวหรือ 0
function findRow_(sh, text) {
  if (sh.getLastRow() < 2) return 0;
  const r = sh.createTextFinder(String(text)).matchEntireCell(true).findNext(); return r && r.getColumn() === 1 ? r.getRow() : 0;
}

/* ---------- บันทึกหนึ่งครั้งที่เล่น ---------- */
function record_(game, cid, d) {
  const t = now_(), nick = safeText_(d.name != null ? d.name : d.first, 16), lvl = clean_(d.lvl, 24) || '-';
  const stars = num_(d.stars, 0, 3), score = num_(d.score, 0, 1000000), practice = d.practice ? 1 : 0;
  sheet_(SH.PLAYS).appendRow([t, th_(t), game, nick, lvl, stars, score, num_(d.m, 0, 9999), num_(d.h, 0, 9999), num_(d.secs, 0, 86400), practice ? 'ฝึกสุ่ม' : 'ปกติ', d.dev === 'm' ? 'มือถือ/แท็บเล็ต' : 'คอมพิวเตอร์', cid, clean_(d.ver, 12)]);
  // ผู้เล่น
  const ps = sheet_(SH.PLAYERS), pr = findRow_(ps, cid);
  if (pr) {
    const row = ps.getRange(pr, 1, 1, 7).getValues()[0], plays = Number(row[6] || 0) + 1;
    ps.getRange(pr, 2).setValue(nick || row[1]); ps.getRange(pr, 6, 1, 2).setValues([[t, plays]]);
  } else ps.appendRow([cid, nick, '', false, t, t, 1]);
  // สรุปรายวัน/รายเกม
  const day = th_(t), dk = day + '|' + game, dl = sheet_(SH.DAILY), dr = findRow_(dl, dk);
  const dp = sheet_(SH.DAYP), isNew = findRow_(dp, dk + '|' + cid) === 0; if (isNew) dp.appendRow([dk + '|' + cid]);
  if (dr) { const v = dl.getRange(dr, 4, 1, 2).getValues()[0]; dl.getRange(dr, 4, 1, 2).setValues([[Number(v[0]) + 1, Number(v[1]) + (isNew ? 1 : 0)]]); }
  else dl.appendRow([dk, day, GAME_NAME[game] || game, 1, 1]);
  const gl = sheet_(SH.GAME), gr = findRow_(gl, game), seenGame = findRow_(sheet_(SH.DAYP), 'g|' + game + '|' + cid) !== 0;
  if (!seenGame) sheet_(SH.DAYP).appendRow(['g|' + game + '|' + cid]);
  if (gr) { const v = gl.getRange(gr, 2, 1, 2).getValues()[0]; gl.getRange(gr, 2, 1, 3).setValues([[Number(v[0]) + 1, Number(v[1]) + (seenGame ? 0 : 1), t]]); }
  else gl.appendRow([game, 1, 1, t]);
  // อันดับ: ดาวดีที่สุดรายด่าน (ไม่นับโหมดฝึกสุ่ม)
  if (!practice && stars > 0) {
    const bs = sheet_(SH.BEST), bk = game + '|' + cid + '|' + lvl, br = findRow_(bs, bk); let gain = 0, gainScore = 0;
    if (br) { const v = bs.getRange(br, 2, 1, 2).getValues()[0]; if (stars > Number(v[0])) { gain = stars - Number(v[0]); } if (score > Number(v[1])) gainScore = score - Number(v[1]); if (gain || gainScore) bs.getRange(br, 2, 1, 2).setValues([[Math.max(stars, Number(v[0])), Math.max(score, Number(v[1]))]]); }
    else { bs.appendRow([bk, stars, score]); gain = stars; gainScore = score; }
    if (gain || gainScore) {
      const rs = sheet_(SH.RANK), rk = game + '|' + cid, rr = findRow_(rs, rk);
      if (rr) { const v = rs.getRange(rr, 4, 1, 2).getValues()[0]; rs.getRange(rr, 4, 1, 3).setValues([[Number(v[0]) + gain, Number(v[1]) + gainScore, gain ? t : rs.getRange(rr, 6).getValue()]]); }
      else rs.appendRow([rk, game, cid, gain, gainScore, t]);
      CacheService.getScriptCache().remove('rank:' + game);
    }
  }
}

/* ---------- อันดับ ---------- */
function board_(game, fresh) {
  const c = CacheService.getScriptCache(), ck = 'rank:' + game;
  if (!fresh) { const hit = c.get(ck); if (hit) return JSON.parse(hit); }
  const rs = sheet_(SH.RANK), rows = rs.getLastRow() > 1 ? rs.getRange(2, 1, rs.getLastRow() - 1, 6).getValues() : [];
  const ps = sheet_(SH.PLAYERS), prow = ps.getLastRow() > 1 ? ps.getRange(2, 1, ps.getLastRow() - 1, 4).getValues() : [], pmap = {};
  prow.forEach(p => { pmap[p[0]] = { name: String(p[2] || p[1] || ''), hide: p[3] === true || String(p[3]).toUpperCase() === 'TRUE' }; });
  const list = rows.filter(r => r[1] === game && !(pmap[r[2]] && pmap[r[2]].hide))
    .map(r => ({ cid: r[2], stars: Number(r[3]), score: Number(r[4]), at: new Date(r[5]).getTime() || 0, name: (pmap[r[2]] && pmap[r[2]].name) || '' }))
    .sort((a, b) => b.stars - a.stars || b.score - a.score || a.at - b.at);
  list.forEach((x, i) => { x.r = i + 1; });
  c.put(ck, JSON.stringify(list), CFG.CACHE_S);
  return list;
}
function shortName_(n) { return clean_(n, 16) || 'นิรนาม'; }
function rank_(game, cid, fresh) {
  const list = board_(game, fresh), me = list.find(x => x.cid === cid) || null;
  return { game, total: list.length, top: list.slice(0, CFG.TOP).map(x => ({ r: x.r, name: shortName_(x.name), stars: x.stars, me: x.cid === cid })), me: me ? { r: me.r, name: shortName_(me.name), stars: me.stars } : null };
}
