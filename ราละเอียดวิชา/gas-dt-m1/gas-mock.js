/* mock ของ Apps Script (Sheets/Drive/Cache/Properties/Lock/Utilities) ใช้ทดสอบ Code.gs ทั้งใน Node และเบราว์เซอร์ */
(function (root) {
  const crypto = root.crypto && root.crypto.subtle ? null : (typeof require !== 'undefined' ? require('crypto') : null);
  function sha256(str) { // เบราว์เซอร์: แฮชจำลองคงที่ 32 ไบต์ (ใช้ทดสอบเท่านั้น ของจริงใช้ SHA-256 ของ Apps Script)
    const out = []; let h = 2166136261;
    for (let k = 0; k < 32; k++) { for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i) + k; h = Math.imul(h, 16777619); } const b = (h >>> 24) & 255; out.push(b > 127 ? b - 256 : b); }
    return out;
  }
  root.makeGasEnv = function () {
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
    appendRow(row) { data.push(row.slice()); }, setFrozenRows() { }, _data: data
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
  DriveApp: { createFolder: n => mkFolder(n, null), getFolderById: id => folders.find(f => f.id === id) || (() => { throw new Error('nf'); })(), getFileById: () => ({}), getRootFolder: () => ({ removeFile() { } }) },
  MimeType: { PLAIN_TEXT: 'text/plain' },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); } }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; } }) },
  LockService: { getScriptLock: () => ({ waitLock() { }, tryLock() { return true; }, releaseLock() { } }) },
  /* ตัวตั้งเวลาจำลอง: เก็บชื่อฟังก์ชันไว้ใน props เพื่อให้คงอยู่หลังรีเฟรช (เซิร์ฟเวอร์จำลองเรียกเองทุก 20 วินาที) */
  ScriptApp: { getProjectTriggers: () => JSON.parse(props.__triggers || '[]').map(fn => ({ getHandlerFunction: () => fn })), newTrigger: fn => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => { const l = JSON.parse(props.__triggers || '[]'); l.push(fn); props.__triggers = JSON.stringify(l); } }) }) }), deleteTrigger: t => { props.__triggers = JSON.stringify(JSON.parse(props.__triggers || '[]').filter(fn => fn !== t.getHandlerFunction())); } },
  UrlFetchApp: { fetch: (url, opt) => (ctx.__fetch ? ctx.__fetch(url, opt) : { getResponseCode: () => 503, getContentText: () => '' }) },
  Utilities: { sleep() { }, getUuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => ((Math.random() * 16) | 0).toString(16)), computeDigest: (alg, s) => (typeof require !== 'undefined' ? Array.from(require('crypto').createHash('sha256').update(s).digest()).map(x => x > 127 ? x - 256 : x) : sha256(s)), DigestAlgorithm: { SHA_256: 1 } }
};
    const dump = () => ({ seq: bookSeq, props, cache, books: Object.fromEntries(Object.entries(books).map(([id, b]) => [id, Object.fromEntries(b.getSheets().map(sh => [sh.name, sh._data]))])) });
    const load = o => { if (!o || !o.books) return; bookSeq = o.seq || 0; Object.keys(props).forEach(k => delete props[k]); Object.assign(props, o.props || {}); Object.keys(cache).forEach(k => delete cache[k]); Object.assign(cache, o.cache || {}); Object.keys(books).forEach(k => delete books[k]);
      Object.entries(o.books).forEach(([id, shs]) => { const b = { id, getId: () => id, _sheets: {} }; const sheets = {}; Object.entries(shs).forEach(([n, d]) => { const sh = makeSheet(n); sh._data.push(...d); sheets[n] = sh; });
        Object.assign(b, { getSheets: () => Object.values(sheets), getSheetByName: n => sheets[n] || null, insertSheet: n => (sheets[n] = makeSheet(n)), deleteSheet: sh => { delete sheets[sh.name]; } }); books[id] = b; }); };
    return { ctx, files, folders, books, dump, load };
  };
  if (typeof module !== 'undefined') module.exports = root.makeGasEnv;
})(typeof window !== 'undefined' ? window : globalThis);
