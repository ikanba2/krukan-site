/* ===== ข้อมูลกลางของเกม Techno Talk: ดาวรายกิจกรรม เรียนคำศัพท์แล้วหรือยัง ระดับที่เล่นล่าสุด ===== */
const SAVE = KG.store('krukan_game_talk_v1', { level: 1, unit: '1-1', stars: {}, learn: {}, rule: {}, voice: true, write: {}, wrote: {} });   // rule = เรียนหลักภาษาครบแล้ว · write = ดาวฝึกเขียนรายหมวด · wrote = คำที่เคยเขียนครบแล้ว
// กิจกรรมในหน่วย (เรียงตามลำดับที่แนะนำ: เรียนคำ › หลักภาษา › เขียนคำ › เกม 5 แบบ) study = ช่วงเรียน ไม่ให้ดาว มีเครื่องหมายถูกแทน
const ACTS = [
  { id: 'learn', th: 'เรียนคำศัพท์', en: 'Learn', desc: 'ดูภาพ ฟังเสียง อ่านคำและประโยคของหน่วยนี้', color: '#ffb02e', scene: 'Learn', study: true },
  { id: 'rule', th: 'หลักภาษา', en: 'Grammar', desc: 'คำไหนใช้คู่กับคำไหน เช่น I คู่กับ am', color: '#8a5cf0', scene: 'Rule', study: true },
  { id: 'write', th: 'เขียนตามรอย', en: 'Write', desc: 'เขียนคำศัพท์ของหน่วยนี้ตามลำดับเส้น', color: '#ff8a1e', scene: 'Write' },
  { id: 'sort', th: 'จัดกลุ่ม', en: 'Sort', desc: 'ลากการ์ดไปใส่กลุ่มที่ถูกต้อง', color: '#ff6fae', scene: 'Sort' },
  { id: 'match', th: 'โยงเส้น', en: 'Match', desc: 'ลากเส้นโยงคู่ที่ตรงกัน', color: '#4aa8ff', scene: 'Match' },
  { id: 'flip', th: 'เปิดป้าย', en: 'Flip', desc: 'เปิดป้ายหาคู่ที่เหมือนกัน', color: '#17c4a8', scene: 'Flip' },
  { id: 'build', th: 'ลากวาง', en: 'Build', desc: 'ลากการ์ดคำมาต่อเป็นประโยค', color: '#a06af0', scene: 'Build' },
  { id: 'quiz', th: 'ถามตอบ', en: 'Quiz', desc: 'ตอบคำถาม 8 ข้อ', color: '#ff7a3c', scene: 'Quiz' }
];
const PLAY_ACTS = ACTS.filter(a => !a.study);
const studied = (u, a) => !!(SAVE.data[a] || {})[u];   // เรียนคำศัพท์ / หลักภาษาของหน่วย u ครบแล้วหรือยัง
const actOf = id => ACTS.find(a => a.id === id);
const akey = (u, a) => u + ':' + a;
const actStars = (u, a) => SAVE.data.stars[akey(u, a)] || 0;
const unitStars = u => PLAY_ACTS.reduce((n, a) => n + actStars(u, a.id), 0);
const levelStars = lv => unitsOfLevel(lv).reduce((n, u) => n + unitStars(u.id), 0);
const totalStars = () => LEVELS.reduce((n, L) => n + levelStars(L.id), 0);
const MAX_UNIT = PLAY_ACTS.length * 3, MAX_LEVEL = MAX_UNIT * 5, MAX_ALL = MAX_LEVEL * LEVELS.length;
const curLevel = () => LEVELS[(SAVE.data.level || 1) - 1];
const curUnit = () => unitOf(SAVE.data.unit) || unitsOfLevel(SAVE.data.level || 1)[0];
const nextActOf = id => { const i = ACTS.findIndex(a => a.id === id); return ACTS[i + 1] || null; };
// สีประจำสรรพนามที่ใช้ซ้ำทั้งเกม (ช่วยจำว่าคำไหนใช้แทนใคร)
const PCOL = { I: '#ff5a9a', you: '#3d8bff', he: '#0fb59a', she: '#9a5ae8', it: '#ff8a1e', we: '#3fb54a', they: '#ee4a4a' };
// ชุดท่าของไรเดอร์ในชุดภาพ 9 ช่อง (ใช้ที่หน้าแรก แตะแล้วเปลี่ยนท่า)
KG.FORMS.s0 = { name: 'ท่าดาบ', color: 0xff5aa6, css: '#ff5aa6' };
KG.FORMS.s1 = { name: 'ท่าปืน', color: 0x3d8bff, css: '#3d8bff' };
KG.FORMS.s2 = { name: 'ท่าหอก', color: 0x17c4a8, css: '#17c4a8' };
KG.FORMS.s3 = { name: 'ท่ามีดคู่', color: 0xffa21e, css: '#ffa21e' };
