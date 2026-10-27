/* ===== Techno Aksorn: ข้อมูลที่บันทึกในเครื่องผู้เล่น · เสียงอ่านภาษาไทย · ร้านค้า ===== */
const SAVE = KG.store('krukan_game_aksorn_v1', {
  level: 0, stars: {}, coins: 0, owned: { hat: ['none'], color: ['#3d8bff'], pet: ['none'] },
  wear: { hat: 'none', color: '#3d8bff', pet: 'none', hair: 'spiky', skin: 1 }, stickers: {}, traced: {}, learned: {}, chest: '', voice: true, plays: 0, seenIntro: false
});
SAVE.data.level = 1;      // ผู้ใช้สั่ง 25 ต.ค. 2569: เลิกล็อกบทเรียนตามระดับ ทุกบทเปิดให้เรียนตามใจ ความยากของเกมคงที่ที่ 1 (ตัวเลือก 4 ข้อ)
const akey = (lesson, act) => lesson + ':' + act;
const actStars = (lesson, act) => SAVE.data.stars[akey(lesson, act)] || 0;
const lessonStars = id => { const l = lessonOf(id); return AK.activities(l, SAVE.data.level).filter(a => a !== 'learn').reduce((n, a) => n + actStars(id, a), 0); };
const lessonMax = id => (AK.activities(lessonOf(id), SAVE.data.level).length - 1) * 3;
const zoneStars = z => lessonsOfZone(z).reduce((n, l) => n + lessonStars(l.id), 0);
const zoneMax = z => lessonsOfZone(z).reduce((n, l) => n + lessonMax(l.id), 0);
const totalStars = () => Object.values(SAVE.data.stars).reduce((a, b) => a + b, 0);
const addCoins = n => { SAVE.data.coins = Math.max(0, (SAVE.data.coins || 0) + n); SAVE.save(); };
KG.FORMS.s0 = { name: 'ท่าดาบ', color: 0xff5aa6, css: '#ff5aa6' };
KG.FORMS.s1 = { name: 'ท่าปืน', color: 0x3d8bff, css: '#3d8bff' };
KG.FORMS.s2 = { name: 'ท่าหอก', color: 0x17c4a8, css: '#17c4a8' };
KG.FORMS.s3 = { name: 'ท่ามีดคู่', color: 0xffa21e, css: '#ffa21e' };

/* ---------- เสียงอ่านภาษาไทยของเบราว์เซอร์ ---------- */
const SPEECH = (function () {
  const has = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  let voice = null;
  const choose = () => {
    if (!has) return; const vs = (speechSynthesis.getVoices && speechSynthesis.getVoices()) || [];
    voice = vs.find(v => /^th/i.test(v.lang) && /premwadee|niwat|achara|natural|online/i.test(v.name)) || vs.find(v => /^th/i.test(v.lang)) || null;
  };
  if (has) { choose(); try { speechSynthesis.addEventListener('voiceschanged', choose); } catch (e) { /* ไม่เป็นไร */ } }
  return {
    get can() { return has && !!voice && SAVE.data.voice !== false; },
    get exists() { return has && !!voice; },
    say(text, rate) {
      if (!this.can || !text) return;
      try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text)); u.voice = voice; u.lang = voice.lang || 'th-TH'; u.rate = rate || 0.8; u.pitch = 1.05; speechSynthesis.speak(u); } catch (e) { /* ไม่เป็นไร */ }
    },
    stop() { if (has) { try { speechSynthesis.cancel(); } catch (e) { /* ไม่เป็นไร */ } } }
  };
})();

/* ---------- ร้านค้า: แต่งตัวละครของผู้เล่น ---------- */
const SHOP = {
  hat: [['none', 'ไม่ใส่', 0], ['cap', 'หมวกแก๊ป', 30], ['bow', 'โบว์', 30], ['flower', 'ดอกไม้', 40], ['party', 'หมวกปาร์ตี้', 50], ['crown', 'มงกุฎ', 120], ['wizard', 'หมวกพ่อมด', 150], ['chada', 'ชฎา', 200]],
  color: [['#3d8bff', 'เสื้อฟ้า', 0], ['#ff6fa5', 'เสื้อชมพู', 20], ['#3fbf6a', 'เสื้อเขียว', 20], ['#ffb02e', 'เสื้อส้ม', 20], ['#9a5ae8', 'เสื้อม่วง', 30], ['#ee4a4a', 'เสื้อแดง', 30], ['#2d2a5e', 'เสื้อกรมท่า', 40]],
  pet: [['none', 'ไม่มี', 0], ['cat', 'แมว', 60], ['dog', 'หมา', 60], ['rabbit', 'กระต่าย', 80], ['duck', 'เป็ด', 80], ['owl', 'นกฮูก', 120], ['turtle', 'เต่า', 120]]
};
const SHOP_TH = { hat: 'หมวก', color: 'สีเสื้อ', pet: 'สัตว์เลี้ยง' };
// ภาพตัวละครของผู้เล่นพร้อมของที่สวมอยู่ (วาดบนกริด 100x100)
function drawAvatar(c, w) {
  w = w || SAVE.data.wear;
  shadow(c, 50, 95, 22, 3.4);
  kid(c, { skin: SKINS[w.skin || 1], hairStyle: w.hair || 'spiky', hair: '#2a1f1a', shirt: w.color || '#3d8bff', pants: '#3a4a8c', mood: 'happy', cx: 50, cy: 54 });
  if (w.hat && w.hat !== 'none') hatOn(c, w.hat, 50, w.hat === 'flower' || w.hat === 'bow' ? 18 : 16, 1);
}
function drawPet(c, id) {
  if (!id || id === 'none') return;
  c.save(); c.translate(0, 0); if (THAI_PIC[id]) THAI_PIC[id](c); else if (ANIMALS[id]) ANIMALS[id](c); c.restore();
}
const avatarTex = (scene, size) => KG.tex(scene, 'ak-avatar|' + JSON.stringify(SAVE.data.wear) + '|' + size, size, size, c => { c.scale(size / 100, size / 100); c.lineJoin = 'round'; c.lineCap = 'round'; drawAvatar(c); });
const petTex = (scene, id, size) => KG.tex(scene, 'ak-pet|' + id + '|' + size, size, size, c => { c.scale(size / 100, size / 100); c.lineJoin = 'round'; c.lineCap = 'round'; drawPet(c, id); });
// วันนี้ (ใช้กับหีบรางวัลรายวัน)
const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
