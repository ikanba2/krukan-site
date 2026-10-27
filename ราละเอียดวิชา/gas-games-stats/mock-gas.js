/* ตัวจำลอง Google Apps Script (ชีตในหน่วยความจำ) ไว้ทดสอบ Code.gs ด้วย node: ใช้ใน test_code.js และ local-server.js */
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');

function makeEnv(opts) {
  opts = opts || {};
  const sheets = [], props = {}, cache = new Map();
  let clock = opts.now || new Date('2026-10-24T10:00:00+07:00').getTime();
  class Range {
    constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr, nc }); }
    getValues() { const o = []; for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) row.push(((this.sh.data[this.r - 1 + i] || [])[this.c - 1 + j]) ?? ''); o.push(row); } return o; }
    setValues(v) { v.forEach((row, i) => row.forEach((x, j) => { const R = this.r - 1 + i; this.sh.data[R] = this.sh.data[R] || []; this.sh.data[R][this.c - 1 + j] = x; })); return this; }
    setValue(x) { return this.setValues([[x]]); }
    getValue() { return this.getValues()[0][0]; }
    getRow() { return this.r; } getColumn() { return this.c; }
    setFontWeight() { return this; } setBackground() { return this; } setNumberFormat() { return this; }
    clearContent() { for (let i = 0; i < this.nr; i++) { const row = this.sh.data[this.r - 1 + i]; if (row) for (let j = 0; j < this.nc; j++) row[this.c - 1 + j] = ''; } const d = this.sh.data; while (d.length && (d[d.length - 1] || []).every(x => x === '')) d.pop(); return this; }
  }
  class Sheet {
    constructor(name) { this.name = name; this.data = []; this.hidden = false; }
    getName() { return this.name; }
    getLastRow() { return this.data.length; }
    getMaxColumns() { return 26; } getMaxRows() { return 1000; } setColumnWidth() { return this; }
    getRange(r, c, nr, nc) { return new Range(this, r, c, nr || 1, nc || 1); }
    appendRow(row) { this.data.push(row.slice()); return this; }
    setFrozenRows() { return this; } hideSheet() { this.hidden = true; return this; }
    createTextFinder(text) {
      const self = this; let entire = false;
      const f = { matchEntireCell(b) { entire = b; return f; }, findNext() { for (let i = 0; i < self.data.length; i++) for (let j = 0; j < self.data[i].length; j++) { const v = String(self.data[i][j]); if (entire ? v === text : v.includes(text)) return new Range(self, i + 1, j + 1, 1, 1); } return null; } };
      return f;
    }
  }
  const ss = {
    getSheetByName: n => sheets.find(s => s.name === n) || null, insertSheet: n => { const s = new Sheet(n); sheets.push(s); return s; },
    getSheets: () => sheets, deleteSheet: s => { sheets.splice(sheets.indexOf(s), 1); }, setSpreadsheetTimeZone() {}, setSpreadsheetLocale() {}
  };
  const pad = (n, w) => String(n).padStart(w || 2, '0');
  const env = {
    console, Logger: { log: () => {} }, Date, JSON, Math, Number, String, RegExp, Object, Array, isFinite, Map, parseInt,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = v; } }) },
    CacheService: { getScriptCache: () => ({ get: k => { const h = cache.get(k); return h && h.exp > clock ? h.v : null; }, put: (k, v, s) => cache.set(k, { v, exp: clock + s * 1000 }), remove: k => cache.delete(k), removeAll: ks => ks.forEach(k => cache.delete(k)) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json', JAVASCRIPT: 'js' }, createTextOutput: t => ({ text: t, mime: 'json', setMimeType(m) { this.mime = m; return this; } }) },
    Utilities: {
      getUuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => Math.floor(Math.random() * 16).toString(16)),
      formatDate: (d, tz, f) => { const t = new Date(d.getTime() + 7 * 3600e3); const m = { yyyy: t.getUTCFullYear(), MM: pad(t.getUTCMonth() + 1), dd: pad(t.getUTCDate()) }; return f.replace(/yyyy|MM|dd/g, x => m[x]); }
    }
  };
  // นาฬิกาจำลองให้ now_() ควบคุมได้
  const ctx = vm.createContext(env);
  const code = fs.readFileSync(path.join(__dirname, 'Code.gs'), 'utf8') + '\nthis.__now = () => now_; this.__set = f => { now_ = f; };';
  vm.runInContext(code, ctx);
  ctx.__set(() => new Date(clock));
  return { ctx, ss, sheets, props, setClock: t => { clock = t; }, advance: ms => { clock += ms; }, getClock: () => clock };
}
module.exports = { makeEnv };
