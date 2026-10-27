/* Type Hero: ตรรกะการพิมพ์ (ไม่แตะภาพ) ใช้ทั้งในเกมและในการทดสอบด้วย Node
   แปลงปุ่มจริงบนคีย์บอร์ด (KeyboardEvent.code) เป็นตัวอักษรเอง ตามแป้นพิมพ์ไทยเกษมณี และแป้นอังกฤษ US
   จึงใช้ได้ไม่ว่าเครื่องจะตั้งภาษาคีย์บอร์ดเป็นอะไร (พิมพ์ภาษาไทยได้แม้เครื่องตั้งเป็นอังกฤษ) */
(function (root) {
  'use strict';
  // รหัสปุ่ม -> [ตัวอักษรปกติ, ตัวอักษรเมื่อกด Shift]
  const TH = {
    Backquote: ['_', '%'], Digit1: ['ๅ', '+'], Digit2: ['/', '๑'], Digit3: ['-', '๒'], Digit4: ['ภ', '๓'], Digit5: ['ถ', '๔'], Digit6: ['ุ', 'ู'], Digit7: ['ึ', '฿'], Digit8: ['ค', '๕'], Digit9: ['ต', '๖'], Digit0: ['จ', '๗'], Minus: ['ข', '๘'], Equal: ['ช', '๙'],
    KeyQ: ['ๆ', '๐'], KeyW: ['ไ', '"'], KeyE: ['ำ', 'ฎ'], KeyR: ['พ', 'ฑ'], KeyT: ['ะ', 'ธ'], KeyY: ['ั', 'ํ'], KeyU: ['ี', '๊'], KeyI: ['ร', 'ณ'], KeyO: ['น', 'ฯ'], KeyP: ['ย', 'ญ'], BracketLeft: ['บ', 'ฐ'], BracketRight: ['ล', ','], Backslash: ['ฃ', 'ฅ'],
    KeyA: ['ฟ', 'ฤ'], KeyS: ['ห', 'ฆ'], KeyD: ['ก', 'ฏ'], KeyF: ['ด', 'โ'], KeyG: ['เ', 'ฌ'], KeyH: ['้', '็'], KeyJ: ['่', '๋'], KeyK: ['า', 'ษ'], KeyL: ['ส', 'ศ'], Semicolon: ['ว', 'ซ'], Quote: ['ง', '.'],
    KeyZ: ['ผ', '('], KeyX: ['ป', ')'], KeyC: ['แ', 'ฉ'], KeyV: ['อ', 'ฮ'], KeyB: ['ิ', 'ฺ'], KeyN: ['ื', '์'], KeyM: ['ท', '?'], Comma: ['ม', 'ฒ'], Period: ['ใ', 'ฬ'], Slash: ['ฝ', 'ฦ'], Space: [' ', ' ']
  };
  const EN = { Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '$'], Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'], Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'], Equal: ['=', '+'],
    BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'], Semicolon: [';', ':'], Quote: ["'", '"'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'], Space: [' ', ' '] };
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c => { EN['Key' + c] = [c.toLowerCase(), c]; });
  const MAPS = { th: TH, en: EN };

  // แถวของแป้นพิมพ์บนจอ: [รหัสปุ่ม, ความกว้างเป็นหน่วยปุ่ม, ป้ายสำหรับปุ่มพิเศษ]
  const ROWS = [
    [['Backquote', 1], ['Digit1', 1], ['Digit2', 1], ['Digit3', 1], ['Digit4', 1], ['Digit5', 1], ['Digit6', 1], ['Digit7', 1], ['Digit8', 1], ['Digit9', 1], ['Digit0', 1], ['Minus', 1], ['Equal', 1], ['Backspace', 2, 'ลบ']],
    [['Tab', 1.5, 'Tab'], ['KeyQ', 1], ['KeyW', 1], ['KeyE', 1], ['KeyR', 1], ['KeyT', 1], ['KeyY', 1], ['KeyU', 1], ['KeyI', 1], ['KeyO', 1], ['KeyP', 1], ['BracketLeft', 1], ['BracketRight', 1], ['Backslash', 1.5]],
    [['CapsLock', 1.75, 'Caps'], ['KeyA', 1], ['KeyS', 1], ['KeyD', 1], ['KeyF', 1], ['KeyG', 1], ['KeyH', 1], ['KeyJ', 1], ['KeyK', 1], ['KeyL', 1], ['Semicolon', 1], ['Quote', 1], ['Enter', 2.25, 'ENTER']],
    [['ShiftLeft', 2.25, 'Shift'], ['KeyZ', 1], ['KeyX', 1], ['KeyC', 1], ['KeyV', 1], ['KeyB', 1], ['KeyN', 1], ['KeyM', 1], ['Comma', 1], ['Period', 1], ['Slash', 1], ['ShiftRight', 2.75, 'Shift']],
    [['Space', 6.25, 'เว้นวรรค']]
  ];
  // นิ้วที่ควรใช้ (L/R + 0 ก้อย 1 นาง 2 กลาง 3 ชี้ 4 หัวแม่มือ)
  const FINGER = {};
  const setF = (codes, hand, f) => codes.forEach(c => { FINGER[c] = { hand, f }; });
  setF(['Backquote', 'Digit1', 'KeyQ', 'KeyA', 'KeyZ', 'Tab', 'CapsLock', 'ShiftLeft'], 'L', 0);
  setF(['Digit2', 'KeyW', 'KeyS', 'KeyX'], 'L', 1); setF(['Digit3', 'KeyE', 'KeyD', 'KeyC'], 'L', 2);
  setF(['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB'], 'L', 3);
  setF(['Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM'], 'R', 3);
  setF(['Digit8', 'KeyI', 'KeyK', 'Comma'], 'R', 2); setF(['Digit9', 'KeyO', 'KeyL', 'Period'], 'R', 1);
  setF(['Digit0', 'Minus', 'Equal', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote', 'Slash', 'Enter', 'Backspace', 'ShiftRight'], 'R', 0);
  setF(['Space'], 'T', 4);
  const FINGER_COLOR = { 'L0': 0xff7ab2, 'L1': 0xff9d3d, 'L2': 0xffd34f, 'L3': 0x5ef08a, 'R3': 0x4ef4d2, 'R2': 0x6f8cff, 'R1': 0xa78bfa, 'R0': 0xff3d8b, 'T4': 0xdbe4ff };
  const fingerColor = code => { const f = FINGER[code]; return f ? FINGER_COLOR[f.hand + f.f] : 0xdbe4ff; };

  // ตัวอักษร -> ปุ่มและ Shift (ตัวอักษรแรกที่พบ)
  const REV = { th: {}, en: {} };
  Object.keys(MAPS).forEach(lang => Object.keys(MAPS[lang]).forEach(code => {
    const [a, b] = MAPS[lang][code];
    if (!REV[lang][a]) REV[lang][a] = { code, shift: false };
    if (b !== a && !REV[lang][b]) REV[lang][b] = { code, shift: true };
  }));
  const keyOf = (lang, ch) => REV[lang][ch] || null;
  // ปุ่ม Shift ที่ควรใช้ (ใช้มือตรงข้ามกับตัวอักษร)
  const shiftFor = code => (FINGER[code] && FINGER[code].hand === 'L' ? 'ShiftRight' : 'ShiftLeft');

  // ปุ่มที่กดจริง -> ตัวอักษร (caps = เปิด Caps Lock อยู่ มีผลกับตัวอักษรอังกฤษเท่านั้น)
  function charFor(lang, code, shift, caps) {
    const m = MAPS[lang][code]; if (!m) return null;
    if (lang === 'en' && /^Key[A-Z]$/.test(code)) return (shift !== !!caps) ? m[1] : m[0];
    return shift ? m[1] : m[0];
  }

  /* ---------- เทียบคำ ---------- */
  // คืนจำนวนตัวอักษรที่ตรงกันตั้งแต่ต้น
  function lcp(target, typed) { let i = 0; while (i < typed.length && i < target.length && typed[i] === target[i]) i++; return i; }
  const isDone = (target, typed) => typed === target;
  // ปุ่มถัดไปที่ต้องกด (null ถ้าจบคำแล้วหรือพิมพ์ผิดอยู่ ต้องลบก่อน)
  function nextKey(lang, target, typed) {
    const p = lcp(target, typed); if (p < typed.length) return { code: 'Backspace', shift: false, fix: true };
    if (p >= target.length) return { code: 'Enter', shift: false, done: true };
    const k = keyOf(lang, target[p]); return k ? { code: k.code, shift: k.shift, ch: target[p] } : null;
  }

  /* ---------- ชุดคำของแต่ละด่าน ---------- */
  function poolFor(lang, name) {
    const W = TY_DATA_REF.WORDS[lang];
    if (name === 'mix') return [].concat(W.p3, W.p4, W.p5, W.p6);
    if (name === 'legend') return [].concat(W.p5, W.p6, W.phrases, W.sentences);
    return W[name] || [];
  }
  let TY_DATA_REF = null;
  function bind(data) { TY_DATA_REF = data; }
  function shuffle(a, rnd) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor((rnd || Math.random)() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
  function deck(lang, level, rnd) {
    const L = TY_DATA_REF.LEVELS[level - 1];
    if (L.pool === 'tutorial') return TY_DATA_REF.TUTORIAL[lang].slice();
    const pool = shuffle(poolFor(lang, L.pool), rnd), out = [];
    for (let i = 0; i < L.n; i++) out.push(pool[i % pool.length]);
    return out;
  }
  // เวลารวมของด่าน (วินาที) สำหรับโหมดจับเวลา
  function timeLimit(lang, level, words) {
    const L = TY_DATA_REF.LEVELS[level - 1], per = lang === 'th' ? 0.78 : 0.56, base = 2.2;
    const t = (words.reduce((s, w) => s + w.length * per + base, 0) * L.factor + 4) * 1.5;   // เพิ่มเวลา 50% (ผู้ใช้ขอ 23 ต.ค. 2569)
    return Math.round(t);
  }
  const wpm = (chars, ms) => ms > 0 ? Math.round((chars / 5) / (ms / 60000)) : 0;
  const accuracy = (hits, misses) => hits + misses > 0 ? Math.round(100 * hits / (hits + misses)) : 100;
  // คะแนนของคำหนึ่ง: ตัวอักษร + โบนัสความเร็ว + คูณด้วยคอมโบ
  function wordScore(len, ms, combo, perfect) {
    const speed = Math.max(0, Math.round(len * 14 - ms / 220)), base = len * 12 + speed + (perfect ? 40 : 0);
    return Math.round(base * (1 + Math.min(combo, 20) * 0.1));
  }
  function stars(mode, acc, timeLeftFrac) {
    if (mode === 'time') return 1 + (acc >= 90 ? 1 : 0) + (timeLeftFrac >= 0.4 && acc >= 85 ? 1 : 0);
    return 1 + (acc >= 85 ? 1 : 0) + (acc >= 95 ? 1 : 0);
  }

  const api = { TH, EN, MAPS, ROWS, FINGER, fingerColor, keyOf, shiftFor, charFor, lcp, isDone, nextKey, bind, deck, timeLimit, wpm, accuracy, wordScore, stars, poolFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TY = api;
})(typeof window !== 'undefined' ? window : globalThis);
