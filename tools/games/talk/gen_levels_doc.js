/* สร้าง LEVELS.md: รายการหน่วย คำศัพท์ ประโยค และชุดจัดกลุ่มทั้งหมดของ Techno Talk ไว้ให้ครูตรวจเนื้อหา: node tools/games/talk/gen_levels_doc.js */
'use strict';
const fs = require('fs'), path = require('path');
const code = ['art-kid.js', 'art-things.js', 'art-scene.js', 'content.js', 'rules.js', 'engine.js'].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const X = new Function('KG', code + '\nreturn { TK, UNITS, WORDS, LEVELS, allSents, qaOf, PN_TH, RULES };')({ tex() { } });
const { TK, UNITS, WORDS, LEVELS, allSents, qaOf, PN_TH, RULES } = X;
let out = '# Techno Talk · รายการหน่วยและเนื้อหา (สร้างอัตโนมัติ)\n\n3 ระดับ × 5 หน่วย = 15 หน่วย · ทุกหน่วยมี: เรียนคำศัพท์+ประโยค (มีเสียงอ่านภาษาอังกฤษ) · หลักภาษา 3–4 ข้อ (คำไหนใช้คู่กับคำไหน เช่น I คู่กับ am) · เขียนตามรอยคำศัพท์ของหน่วย (บรรทัด 4 เส้น ตามลำดับเส้น) และกิจกรรม 5 แบบ จัดกลุ่ม · โยงเส้น (2 รอบ) · เปิดป้าย (6 คู่) · ลากวาง (6 ประโยค) · ถามตอบ (8 ข้อ) ทุกรอบสุ่มชุดใหม่\n\nไวยากรณ์ทุกประโยคผ่านตัวตรวจ (`node tools/games/talk/test_engine.js`): ประธานตรงกับ am/is/are · do/does · กริยาเติม s (he she it) · a/an\n';
LEVELS.forEach(L => {
  out += `\n## ระดับ ${L.id} · ${L.en} (${L.th}) · ${L.grade}\n\n${L.blurb}\n`;
  UNITS.filter(u => u.level === L.id).forEach(u => {
    const words = u.words.map(id => `${WORDS[id][0]} (${WORDS[id][1]})`).join(' · ');
    out += `\n### หน่วย ${u.id} · ${u.en} · ${u.th}\n\n**คำศัพท์:** ${words}\n\n`;
    out += '**หลักภาษา:** ' + (RULES[u.id] || []).map((s, i) => `${i + 1}) ${s.t} (${s.en})`).join(' · ') + '\n\n';
    if (u.qa) { out += '| คำถาม | คำแปล | คำตอบ | คำแปล |\n|---|---|---|---|\n'; u.qa.map(qaOf).forEach(x => { out += `| ${x.q.en} | ${x.q.th} | ${x.a.en} | ${x.a.th} |\n`; }); }
    else { out += '| ประธาน | ประโยค | คำแปล |\n|---|---|---|\n'; allSents(u).forEach(s => { out += `| ${s.p} = ${PN_TH[s.p]} | ${s.en} | ${s.th} |\n`; }); }
    u.sorts.forEach(S => { out += `\n**จัดกลุ่ม:** ${S.title} (${S.th}) · กลุ่ม ${S.groups.map(g => g.en).join(' / ')} · ${S.items.length} ใบ\n`; });
  });
});
fs.writeFileSync(path.join(__dirname, 'LEVELS.md'), out, 'utf8'); console.log('เขียน LEVELS.md แล้ว');
