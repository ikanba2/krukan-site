/* สร้าง LEVELS.md: รายการด่านทั้งหมดของ Techno Parts (ชื่อด่าน ชนิด จำนวนชิ้น เช็กลิสต์ ขั้นต่ำที่ต้องทำ) ไว้ให้ครูดูภาพรวม: node tools/games/parts/gen_levels_doc.js */
'use strict';
const fs = require('fs'), path = require('path');
const E = require('./engine.js'), LV = require('./levels.js');
const KIND = { sort: 'จัดกลุ่มอุปกรณ์', plug: 'เสียบสายเข้าช่อง', fix: 'ซ่อมสายหลุด/เสียบผิด', build: 'ประกอบชิ้นส่วน', order: 'เรียงขั้นตอน', job: 'เลือกอุปกรณ์ตามงานลูกค้า' };
let out = '# Techno Parts · รายการด่าน (สร้างอัตโนมัติ)\n\n4 โลก × 10 ด่าน · ด่านปกติใช้ seed ตายตัว (ทุกคนเจอเหมือนกัน) ส่วน "ฝึกสุ่ม" สร้างด่านใหม่ตามโครงเดียวกัน · par = จำนวนครั้งที่ต้องลากวางอย่างน้อย\n';
LV.WORLDS.forEach(W => {
  out += `\n## โลก ${W.id} · ${W.grade} · ${W.title}\n\n${W.desc}\n\n> ${W.concept}\n\n| ด่าน | ชื่อ | ชนิด | ชิ้น | par | ใบสั่งงาน (เช็กลิสต์) |\n|---:|---|---|---:|---:|---|\n`;
  for (let n = 1; n <= 10; n++) {
    const L = LV.getLevel(W.id, n);
    out += `| ${n} | ${L.title} | ${KIND[L.kind]} | ${L.items.length} | ${L.par} | ${L.checks.map(c => c.text).join(' · ')} |\n`;
  }
});
fs.writeFileSync(path.join(__dirname, 'LEVELS.md'), out, 'utf8'); console.log('เขียน LEVELS.md แล้ว');
