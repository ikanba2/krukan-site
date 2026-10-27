/* ===== Techno Aksorn: ระบายสีส่วนประกอบของคำ (ตามบัตรคำของครู 25 ต.ค. 2569) =====
   พยัญชนะ = ดำ · สระ = แดง · ตัวสะกด = น้ำเงิน · วรรณยุกต์ = เขียว
   เก็บบทบาทของแต่ละตัวอักษร (อักขระต่ออักขระ) เป็นสตริง c v f t   c = พยัญชนะต้น  v = สระ (รวม อ ว ย ที่เป็นส่วนของสระ)  f = ตัวสะกด  t = วรรณยุกต์
   คำหลายพยางค์/ควบกล้ำ/ตัวนำ ระบุเองใน ROLES (ตรวจแล้วทีละคำ) คำพยางค์เดียวง่าย ๆ ใช้กฎ simpleRoles */
const ROLE_COL = { c: '#1f1d36', v: '#e0262e', f: '#1f5fd8', t: '#16a34a' };
const ROLE_TH = { c: 'พยัญชนะ', v: 'สระ', f: 'ตัวสะกด', t: 'วรรณยุกต์' };
const ROLES = {
  'ไก่': 'vct', 'ไข่': 'vct', 'ขวด': 'cvf', 'ควาย': 'ccvf', 'คน': 'cf', 'ระฆัง': 'cvcvf', 'งู': 'cv', 'จาน': 'cvf', 'ฉิ่ง': 'cvtf', 'ช้าง': 'ctvf',
  'โซ่': 'vct', 'เฌอ': 'vcv', 'หญิง': 'ccvf', 'ชฎา': 'ccv', 'ปฏัก': 'ccvf', 'ฐาน': 'cvf', 'มณโฑ': 'cfvc', 'ผู้เฒ่า': 'cvtvctv', 'เณร': 'vcf', 'เด็ก': 'vcvf',
  'เต่า': 'vctv', 'ถุง': 'cvf', 'ทหาร': 'ccvf', 'ธง': 'cf', 'หนู': 'ccv', 'ใบไม้': 'vcvct', 'ปลา': 'ccv', 'ผึ้ง': 'cvtf', 'ฝา': 'cv', 'พาน': 'cvf',
  'ฟัน': 'cvf', 'สำเภา': 'cvvcv', 'ม้า': 'ctv', 'ยักษ์': 'cvfff', 'เรือ': 'vcvv', 'ลิง': 'cvf', 'แหวน': 'vccf', 'ศาลา': 'cvcv', 'ฤๅษี': 'vvcv', 'เสือ': 'vcvv',
  'หีบ': 'cvf', 'จุฬา': 'cvcv', 'อ่าง': 'ctvf', 'นกฮูก': 'cfcvf', 'ใบ': 'vc', 'ฤดู': 'vcv', 'ผู้': 'cvt', 'ดำ': 'cv', 'แม่': 'vct'
};
const LEADV = 'เแโใไ', AFTERV = 'ะาำๅฤฦัิีึืุู็ํ', TONEM = '่้๊๋';
const isThaiCons = c => c >= 'ก' && c <= 'ฮ';
// พยางค์เดียวง่าย ๆ: พยัญชนะต้น (+ สระ) (+ ตัวสะกด)
function simpleRoles(s) {
  const ch = Array.from(s); let out = '', hasInit = false, hasV = false, lead = false;
  for (let i = 0; i < ch.length; i++) {
    const c = ch[i], p = ch[i - 1] || '';
    if (TONEM.includes(c)) { out += 't'; continue; }
    if (LEADV.includes(c)) { out += 'v'; lead = true; hasV = true; continue; }
    if (AFTERV.includes(c)) { out += 'v'; hasV = true; continue; }
    if (c === '์') { out += 'f'; continue; }
    if (!isThaiCons(c)) { out += 'c'; continue; }
    if (c === 'อ' && hasInit && (p === 'ื' || p === '็' || lead || !hasV)) { out += 'v'; hasV = true; continue; }
    if (c === 'ว' && p === 'ั') { out += 'v'; continue; }
    if (c === 'ว' && hasInit && !hasV && !lead && isThaiCons(ch[i + 1] || '')) { out += 'v'; hasV = true; continue; }     // ลดรูปของ –ัว เมื่อมีตัวสะกด: ขวด กวน สวน
    if (c === 'ย' && p === 'ี' && lead) { out += 'v'; continue; }
    if (!hasInit) { out += 'c'; hasInit = true; continue; }
    out += 'f';
  }
  return out;
}
const rolesOf = s => ROLES[s] || simpleRoles(s);
// พยัญชนะ + รูปสระ (มีขีด –) › พยางค์ และบทบาทของแต่ละตัว: พยัญชนะที่แทนขีด = c ที่เหลือคือสระ
function composeRoles(c, form) { const fc = Array.from(form), i = fc.indexOf('–'), w = fc.map(ch => (ch === '–' ? c : ch)); return { word: w.join(''), roles: w.map((ch, k) => (k === i ? 'c' : 'v')).join('') }; }
// ตัดตัวอักษรออกจากภาพ: วาดข้อความทั้งสตริงด้วยสีของตัวท้ายสุดก่อน แล้ววาดสตริงที่สั้นลงทีละตัวทับด้วยสีของตัวนั้น (สระบน/วรรณยุกต์จึงยังวางตำแหน่งถูกตามฟอนต์)
function richTex(scene, text, roles, size, o) {
  o = o || {}; const font = 'bold ' + size + 'px Sarabun, Kanit, sans-serif', ch = Array.from(text), key = 'ak-rich|' + text + '|' + roles + '|' + size + '|' + (o.weight || 600) + '|' + (o.pal || '');
  const pal = o.pal === 'soft' ? { c: '#2d2a5e', v: '#e0262e', f: '#2a6ae0', t: '#16a34a' } : ROLE_COL;
  let w = 40, h = Math.round(size * 1.9);
  try { const m = document.createElement('canvas').getContext('2d'); m.font = font; w = Math.ceil(m.measureText(text).width) + Math.round(size * 0.5); } catch (e) { w = Math.round(size * (ch.length * 0.6 + 0.5)); }
  const k = KG.tex(scene, key, w, h, c => {
    c.font = font; c.textBaseline = 'alphabetic'; c.lineJoin = 'round'; const x = Math.round(size * 0.25), y = Math.round(size * 1.35);
    // วรรณยุกต์ที่ตามด้วย ำ (น้ำ ค่ำ) ถูกเลื่อนไปอยู่เหนือนิคหิต: ถ้าตัดสตริงแค่ถึงวรรณยุกต์ รูปจะไปอยู่ผิดที่ซ้อนกับของจริง จึงข้ามชั้นนั้น แล้วหาเฉพาะรูปวรรณยุกต์ด้วยการเอาภาพทั้งคำลบภาพคำที่ไม่มีวรรณยุกต์
    const shift = []; ch.forEach((q, i) => { if (TONEM.includes(q) && ch[i + 1] === 'ำ') shift.push(i); });
    for (let i = ch.length - 1; i >= 0; i--) { if (shift.includes(i)) continue; c.fillStyle = pal[roles[i]] || pal.c; c.fillText(ch.slice(0, i + 1).join(''), x, y); }
    shift.forEach(i => {
      const T = document.createElement('canvas'); T.width = Math.ceil(w * KG.K); T.height = Math.ceil(h * KG.K); const t = T.getContext('2d'); t.scale(KG.K, KG.K);
      t.font = font; t.textBaseline = 'alphabetic'; t.lineJoin = 'round'; t.fillStyle = pal[roles[i]] || pal.c; t.fillText(text, x, y);
      t.globalCompositeOperation = 'destination-out'; t.fillStyle = '#000'; t.fillText(ch.filter((q, j) => j !== i).join(''), x, y);
      c.drawImage(T, 0, 0, w, h);
    });
  });
  return { key: k, w, h };
}
// วางข้อความสีกึ่งกลางที่ (x,y)
function richText(scene, x, y, text, size, o) {
  o = o || {}; const roles = o.roles || rolesOf(text), t = richTex(scene, text, roles, size, o);
  const img = scene.add.image(x, y, t.key).setDisplaySize(t.w, t.h); if (o.maxW && t.w > o.maxW) { const s = o.maxW / t.w; img.setDisplaySize(t.w * s, t.h * s); } return img;
}
// ป้ายคำอธิบายสี (● พยัญชนะ ● สระ ● ตัวสะกด ● วรรณยุกต์) เรียงแนวนอนกึ่งกลางที่ (x,y)
function colorLegend(scene, x, y, o) {
  o = o || {}; const which = o.which || ['c', 'v', 'f', 't'], size = o.size || 17, gap = 18, items = which.map(r => ({ r, w: KG.measure(ROLE_TH[r], '600 ' + size + 'px Kanit') + size + 6 }));
  const total = items.reduce((n, i) => n + i.w, 0) + gap * (items.length - 1), c = scene.add.container(x, y); let cx = -total / 2;
  items.forEach(it => { c.add(scene.add.circle(cx + size * 0.45, 0, size * 0.42, Phaser.Display.Color.HexStringToColor(ROLE_COL[it.r]).color).setStrokeStyle(2, 0xffffff)); c.add(KG.txt(scene, cx + size + 4, 0, ROLE_TH[it.r], { size, color: ROLE_COL[it.r], oy: 0.5 })); cx += it.w + gap; });
  return c;
}
