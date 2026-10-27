/* Cipher Breaker: ตรรกะของรหัสซีซาร์ (ไม่แตะภาพ) ใช้ทั้งในเกมและในการทดสอบด้วย Node
   ตัวอักษรอังกฤษ A-Z เลื่อนไปตามกุญแจ ตัวอื่น (ช่องว่าง ตัวเลข เครื่องหมาย) คงเดิม */
(function (root) {
  'use strict';
  const A = 65;
  const isLetter = c => c >= 'A' && c <= 'Z';
  const mod = (n, m) => ((n % m) + m) % m;

  function shiftChar(c, k) { return isLetter(c) ? String.fromCharCode(mod(c.charCodeAt(0) - A + k, 26) + A) : c; }
  const encrypt = (text, k) => Array.from(String(text).toUpperCase()).map(c => shiftChar(c, k)).join('');
  const decrypt = (text, k) => encrypt(text, -k);

  // จำนวนตัวอักษรแต่ละตัว (ใช้กับเครื่องมือวิเคราะห์ความถี่)
  function freq(text) {
    const f = new Array(26).fill(0);
    for (const c of String(text).toUpperCase()) if (isLetter(c)) f[c.charCodeAt(0) - A]++;
    return f;
  }
  // เดากุญแจจากตัวอักษรที่พบบ่อยที่สุด (ในภาษาอังกฤษมักเป็น E) คืน { key, peak, tie }
  function peakKey(text) {
    const f = freq(text); let m = 0; f.forEach((v, i) => { if (v > f[m]) m = i; });
    return { key: mod(m - 4, 26), peak: String.fromCharCode(A + m), tie: f.filter(v => v === f[m]).length > 1 };
  }

  // คำศัพท์ที่ใช้ตรวจว่า "อ่านออก" หรือไม่ (ใช้ในเครื่องแกะอัตโนมัติและในการทดสอบ)
  const WORDS = new Set(('A AN AND ARE AT BE BEFORE BY CAN CLICK CODE CHECK DATA DONT EVEN EVERY FIRST FOR FRIEND FROM HELLO IN INTERNET IS IT KEEP LAYERS LINK LOCK LOG LONGER MANY MAY ME MORE NEVER NO NOON OF ON OR OUT PASSWORD PASSWORDS PIN PRIVATE SAFER SAYS SCREEN SECRET SECRETS SECURE SHARE SHARED SO STRONG TECHNO THE THERE THINK THROUGH TIME TO TRAVELS TRUST TWO UNKNOWN UP UPDATE USE USER WHEN WITH YOU YOUR APPS APP BACK BANK BEST BECAUSE CAFE ENTER FREE LINKS MEETING NETWORKS ANYONE DONE OFF OUT KEY BYTE CHIP CLOUD EMAIL FILE HACK LOGIN PIXEL ROBOT VIRUS WIFI').split(' '));
  const wordScore = text => String(text).split(/[^A-Z]+/).filter(w => WORDS.has(w)).length;
  // ลองทุกกุญแจ 0-25 คืนรายการเรียงตามความน่าจะเป็นข้อความจริง
  function crackAll(cipher) {
    const out = []; for (let k = 0; k < 26; k++) { const t = decrypt(cipher, k); out.push({ key: k, text: t, score: wordScore(t) }); }
    return out.slice().sort((a, b) => b.score - a.score || a.key - b.key);
  }
  const bestKey = cipher => crackAll(cipher)[0].key;

  // ข้อความตัวอย่างสำหรับโหมดสุ่ม (เกี่ยวกับความปลอดภัยดิจิทัล)
  const BANK = [
    { text: 'UPDATE YOUR APPS', th: 'อัปเดตแอปของคุณเสมอ' },
    { text: 'LOCK YOUR SCREEN', th: 'ล็อกหน้าจอทุกครั้ง' },
    { text: 'USE STRONG PASSWORDS', th: 'ตั้งรหัสผ่านที่คาดเดายาก' },
    { text: 'DONT TRUST UNKNOWN LINKS', th: 'อย่าเชื่อลิงก์ที่ไม่รู้จัก' },
    { text: 'LOG OUT WHEN DONE', th: 'ใช้เสร็จแล้วออกจากระบบ' },
    { text: 'CHECK THE LINK FIRST', th: 'ตรวจลิงก์ก่อนกดเสมอ' },
    { text: 'NEVER SHARE YOUR PIN', th: 'ห้ามบอกรหัส PIN กับใคร' },
    { text: 'BACK UP YOUR DATA', th: 'สำรองข้อมูลไว้เสมอ' }
  ];
  // คำสั้น ๆ เกี่ยวกับเทคโนโลยี สำหรับสนามป้องกัน
  const TECH_WORDS = {
    easy: ['DATA', 'CODE', 'BYTE', 'WIFI', 'LINK', 'FILE', 'USER', 'HACK', 'CHIP', 'BUG', 'APP', 'WEB', 'PIN', 'KEY', 'LOG', 'RAM', 'USB', 'CPU'],
    mid: ['PIXEL', 'ROBOT', 'CLOUD', 'LOGIN', 'EMAIL', 'VIRUS', 'MOUSE', 'PHONE', 'LASER', 'MODEM', 'ROUTER', 'SERVER', 'CIRCUIT', 'NETWORK'],
    hard: ['PASSWORD', 'FIREWALL', 'DATABASE', 'KEYBOARD', 'PROGRAM', 'INTERNET', 'SECURITY', 'ENCRYPT', 'DECRYPT', 'ALGORITHM']
  };

  const api = { shiftChar, encrypt, decrypt, freq, peakKey, wordScore, crackAll, bestKey, mod, isLetter, BANK, TECH_WORDS, WORDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CC = api;
})(typeof window !== 'undefined' ? window : globalThis);
