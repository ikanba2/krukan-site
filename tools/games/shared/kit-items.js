/* ===== ชุดภาพของใช้/สัตว์/อาหารสำหรับเกมฝึกทักษะ (ใช้ภาพเวกเตอร์ของ Techno Talk: talk/art-*.js ต้องใส่ไฟล์เหล่านั้นในเกมก่อนไฟล์นี้) =====
   K.bank() คืนหมวด { fruit, animal, school, food, play } แต่ละหมวดมี th (ชื่อหมวด) และ items [{ id, th, spec }]
   K.itemImage(scene, item, x, y, size) วางรูปของชิ้นนั้น · K.itemTex(scene, item, size) ได้เท็กซ์เจอร์ */
(function () {
  const K = KG.kit; let bank = null;
  K.bank = function () {
    if (bank) return bank;
    const A = (id, th) => ({ id, th, spec: A_(id), cat: 'animal' }), T = (id, th, cat) => ({ id, th, spec: T_(id), cat });
    bank = {
      fruit: { id: 'fruit', th: 'ผลไม้', items: [T('apple', 'แอปเปิ้ล', 'fruit'), T('banana', 'กล้วย', 'fruit'), T('orange', 'ส้ม', 'fruit')] },
      animal: { id: 'animal', th: 'สัตว์', items: [A('cat', 'แมว'), A('dog', 'หมา'), A('bird', 'นก'), A('fish', 'ปลา'), A('rabbit', 'กระต่าย'), A('duck', 'เป็ด'), A('pig', 'หมู'), A('cow', 'วัว'), A('monkey', 'ลิง'), A('elephant', 'ช้าง'), A('frog', 'กบ'), A('lion', 'สิงโต')] },
      school: { id: 'school', th: 'ของใช้ในห้องเรียน', items: [T('pencil', 'ดินสอ', 'school'), T('ruler', 'ไม้บรรทัด', 'school'), T('bag', 'กระเป๋า', 'school'), T('book', 'หนังสือ', 'school'), T('pen', 'ปากกา', 'school'), T('desk', 'โต๊ะ', 'school'), T('chair', 'เก้าอี้', 'school')] },
      food: { id: 'food', th: 'อาหาร', items: [T('milk', 'นม', 'food'), T('egg', 'ไข่', 'food'), T('rice', 'ข้าว', 'food'), T('bread', 'ขนมปัง', 'food'), T('cake', 'เค้ก', 'food'), T('icecream', 'ไอศกรีม', 'food')] },
      place: { id: 'place', th: 'สถานที่', items: [T('home', 'บ้าน', 'place'), T('school', 'โรงเรียน', 'place'), T('park', 'สวน', 'place'), T('zoo', 'สวนสัตว์', 'place')] },
      nature: { id: 'nature', th: 'ธรรมชาติ', items: [T('sun', 'พระอาทิตย์', 'nature'), T('tree', 'ต้นไม้', 'nature'), T('flower', 'ดอกไม้', 'nature'), T('star', 'ดาว', 'nature')] }
    };
    return bank;
  };
  K.itemTex = (scene, item, size) => picTex(scene, item.spec, Math.round(size * 1.25), Math.round(size * 1.25));
  K.itemImage = (scene, item, x, y, size) => scene.add.image(x, y, K.itemTex(scene, item, size)).setDisplaySize(size, size);
  // สุ่มชิ้นของจากหมวดที่ระบุ (ไม่ซ้ำ) n ชิ้น
  K.pickItems = (R, cats, n) => { const b = K.bank(), pool = []; cats.forEach(c => b[c].items.forEach(it => pool.push(it))); return K.shuffle(R, pool).slice(0, n); };
})();
