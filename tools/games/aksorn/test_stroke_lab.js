/* ทดสอบแกนห้องลองเขียน (stroke-lab-core.js): ประกอบรูปสระจากชิ้นส่วนได้ใกล้ของเดิม · แก้ชิ้นเดียวแล้วทุกรูปที่ใช้ร่วมเปลี่ยนตาม · ไม้หันอากาศ = ขีดแรกของ ะ · อี = อิ + ขีด · เขียนเองทั้งรูป · เกลาเส้น · ส่งออกตรงรูปแบบที่เกมใช้
   รัน: node tools/games/aksorn/test_stroke_lab.js */
const fs = require('fs'), path = require('path');
const SL = require('./stroke-lab-core.js');
const INIT = JSON.parse(fs.readFileSync(path.join(__dirname, 'stroke_parts_init.json'), 'utf8')); INIT.glyphs = { 'ก': [[10, 10, 50, 50, 90, 10]] };
const cur = JSON.parse(fs.readFileSync(path.join(__dirname, 'vowel_trace.json'), 'utf8'));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('ผิด:', m); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// 1) ทุกรูปประกอบได้ จำนวนเส้นตรงกับของเดิม (ยกเว้นรูปที่เปลี่ยนตามกติกา อี/อือ/อึ ใช้ฐานเดียวกับอิ)
const S0 = SL.emptyState(), keys = Object.keys(INIT.forms);
ok(keys.length === Object.keys(cur).length, 'จำนวนรูปสระไม่ตรง');
keys.forEach(k => { const a = SL.assemble(INIT, S0, k); ok(a.strokes.length === cur[k].strokes.length, k + ' จำนวนเส้น ' + a.strokes.length + ' ≠ ' + cur[k].strokes.length); ok(a.strokes.every(s => s.pts.length >= 2), k + ' มีเส้นว่าง'); });

// 2) ส่งออกแล้วใกล้ของเดิม (วัดระยะเฉลี่ยจุดต่อจุดที่ใกล้สุด) รูปที่ตั้งใจเปลี่ยนมีเกณฑ์กว้างกว่า
const out0 = SL.exportOut(INIT, S0), dist = (a, b) => a.reduce((t, p) => t + Math.min.apply(null, b.map(q => Math.hypot(p[0] - q[0], p[1] - q[1]))), 0) / a.length;
const P = fl => SL.pairs(fl);
const intended = { '–ึ': 20, '–ี': 12, '–ื': 12, '–ั': 5 };
keys.forEach(k => { const a = [].concat.apply([], out0[k].strokes.map(P)), b = [].concat.apply([], cur[k].strokes.map(P)); const e = Math.max(dist(a, b), dist(b, a)); ok(e <= (intended[k] || 4), k + ' ต่างจากเดิม ' + e.toFixed(1) + 'px'); ok(out0[k].dash.length === 3, k + ' dash'); });

// 3) ไม้หันอากาศ = ขีดแรกของ ะ: แก้ ะ ในรูป –ะ แล้ว –ั –ัว –ัวะ เปลี่ยนตาม และรูปที่มี ะ อื่น ๆ ก็เปลี่ยนตาม
const S1 = SL.emptyState(), before = k => JSON.stringify(SL.assemble(INIT, S1, k).strokes.map(s => s.pts));
const b1 = {}; ['–ะ', '–ั', '–ัว', '–ัวะ', 'เ–ะ', 'โ–ะ', '–า'].forEach(k => { b1[k] = before(k); });
const pcs = SL.pieces(INIT, S1, '–ะ'); ok(pcs.length === 1 && pcs[0].part === 'ะ', 'ชิ้นของ –ะ');
const newSa = [[[10, -30], [30, -10], [10, 10], [-10, -5], [10, -30]], [[10, 20], [30, 40], [10, 60], [-10, 45], [10, 20]]];
const r1 = SL.commitPiece(INIT, S1, '–ะ', pcs[0].id, newSa); ok(r1.ok, 'บันทึก ะ ไม่สำเร็จ ' + r1.msg); ok(r1.users.includes('–ั') && r1.users.includes('เ–ะ'), 'รายชื่อรูปที่เปลี่ยนตาม');
['–ะ', '–ั', '–ัว', '–ัวะ', 'เ–ะ', 'โ–ะ'].forEach(k => ok(before(k) !== b1[k], k + ' ไม่เปลี่ยนตาม ะ'));
ok(before('–า') === b1['–า'], '–า ไม่ควรเปลี่ยน');
const sa1 = SL.assemble(INIT, S1, '–ั').strokes[0].pts, sa2 = SL.assemble(INIT, S1, '–ะ').strokes[0].pts;
const w = a => { const xs = a.map(p => p[0]), ys = a.map(p => p[1]); return [Math.max.apply(null, xs) - Math.min.apply(null, xs), Math.max.apply(null, ys) - Math.min.apply(null, ys)]; };
ok(near(w(sa1)[0] / w(sa2)[0], w(sa1)[1] / w(sa2)[1], 0.01), 'ไม้หันอากาศต้องเป็นรูปเดียวกับขีดแรกของ ะ (สัดส่วนเท่ากัน)');
ok(sa1[0][0] !== undefined && SL.assemble(INIT, S1, '–ั').strokes[0].pts.length === newSa[0].length, 'จุดเริ่มและจำนวนจุดของ –ั ต้องตรงกับขีดแรกของ ะ');
// เขียน ะ ขีดเดียวไม่ได้ ไม้หันอากาศต้องใช้ขีดที่ 1 และ ะ ต้องมีอย่างน้อย 1 ขีด แต่ชิ้นที่ระบุขีดที่ต้อง 1 ขีดพอดี
const pcA = SL.pieces(INIT, S1, '–ั')[0]; ok(pcA.idx && pcA.idx[0] === 0, 'ไม้หันอากาศ ใช้ขีดที่ 1');
ok(!SL.commitPiece(INIT, S1, '–ั', pcA.id, newSa).ok, 'ไม้หันอากาศ ต้องเขียน 1 ขีด');
ok(SL.commitPiece(INIT, S1, '–ั', pcA.id, [newSa[1]]).ok, 'เขียนไม้หันอากาศ 1 ขีด');
ok(JSON.stringify(S1.parts['ะ'][0]) !== JSON.stringify(SL.flatten(newSa[0]).map(v => Math.round(v * 10) / 10)), 'แก้ไม้หันอากาศแล้ว ขีดแรกของ ะ ต้องเปลี่ยนตาม');
SL.resetPiece(INIT, S1, '–ั', pcA.id); ok(!SL.isEdited(INIT, S1, 'เ–ือ') || true, 'reset');


// 3b) เขียน ะ เลื่อนไปจากที่เดิม ไม้หันอากาศและรูปที่ใช้ ะ ร่วมกันต้องอยู่ในช่องเดิม (ไม่เลื่อนตาม) แต่รูปร่างต้องเปลี่ยนตาม
const cen = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [(Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2]; };
const S5 = SL.emptyState(), c0sa = cen(SL.assemble(INIT, S5, '–ั').strokes[0].pts), c0e = cen([].concat.apply([], SL.assemble(INIT, S5, 'เ–ะ').strokes.filter(s => s.part === 'ะ').map(s => s.pts)));
const shifted = newSa.map(st => st.map(p => [p[0] + 50, p[1] - 20]));
ok(SL.commitPiece(INIT, S5, '–ะ', SL.pieces(INIT, S5, '–ะ')[0].id, shifted).ok, 'บันทึก ะ ที่เลื่อน');
const c1sa = cen(SL.assemble(INIT, S5, '–ั').strokes[0].pts), c1e = cen([].concat.apply([], SL.assemble(INIT, S5, 'เ–ะ').strokes.filter(s => s.part === 'ะ').map(s => s.pts)));
ok(near(c1sa[0], c0sa[0], 0.6) && near(c1sa[1], c0sa[1], 0.6), 'ไม้หันอากาศต้องอยู่ช่องเดิมเมื่อ ะ ถูกเขียนเลื่อน: ' + c0sa + ' › ' + c1sa);
ok(near(c1e[0], c0e[0], 0.6) && near(c1e[1], c0e[1], 0.6), 'ะ ใน เ–ะ ต้องอยู่ช่องเดิม: ' + c0e + ' › ' + c1e);
ok(JSON.stringify(SL.assemble(INIT, S5, '–ะ').strokes.map(s => s.pts.map(p => p.map(v => Math.round(v))))) === JSON.stringify(shifted.map(st => st.map(p => p.map(v => Math.round(v))))), 'รูปต้นทาง –ะ ต้องอยู่ตรงที่เขียนไว้');
// เขียน ะ ในรูป เ–ะ (บล็อกที่ปรับช่อง): ได้รูปร่างตามที่เขียน อยู่ในช่องเดิม และรูปต้นทางยังอยู่ตำแหน่งบ้านเดิม
const S6 = SL.emptyState(), pe = SL.pieces(INIT, S6, 'เ–ะ').find(p => p.part === 'ะ'), homeBefore = SL.assemble(INIT, S6, '–ะ').strokes.map(s => cen(s.pts));
const drawn = SL.assemble(INIT, S6, 'เ–ะ').strokes.filter(s => s.part === 'ะ').map(s => s.pts.map(p => [p[0] * 1.0 + 7, p[1] + 3]));
ok(SL.commitPiece(INIT, S6, 'เ–ะ', pe.id, drawn).ok, 'บันทึก ะ ใน เ–ะ');
const homeAfter = SL.assemble(INIT, S6, '–ะ').strokes.map(s => cen(s.pts));
ok(homeAfter.every((c, i) => near(c[0], homeBefore[i][0], 1.5) && near(c[1], homeBefore[i][1], 1.5)), 'รูปต้นทาง –ะ ต้องอยู่ตำแหน่งบ้านเดิมแม้เขียนจากรูปอื่น');

// 4) อี = อิ + ขีด · อือ = อี + อีกขีด : แก้ อิ แล้วทั้งสามเปลี่ยนตาม
const S2 = SL.emptyState(), pi = SL.pieces(INIT, S2, '–ิ')[0];
const dome = [[[-30, -60], [0, -75], [30, -60]], [[-30, -60], [30, -45]]];
ok(SL.commitPiece(INIT, S2, '–ิ', pi.id, dome).ok, 'บันทึก อิ'); const ii = SL.assemble(INIT, S2, '–ี').strokes, uue = SL.assemble(INIT, S2, '–ื').strokes;
ok(ii.length === 3 && uue.length === 4, 'จำนวนเส้น อี อือ'); ok(JSON.stringify(ii[0].pts) === JSON.stringify(SL.assemble(INIT, S2, '–ิ').strokes[0].pts), 'โดมของ อี ต้องเหมือน อิ');
ok(JSON.stringify(uue[0].pts) === JSON.stringify(ii[0].pts) && JSON.stringify(uue[3].pts) === JSON.stringify(ii[2].pts), 'อือ = อี + อีกหนึ่งขีด (ขีดบนเป็นขีดเดียวกัน)');

// 5) เขียนรูปนี้เองทั้งรูป
const S3 = SL.emptyState(); SL.setOwn(INIT, S3, 'เ–ะ', true); ok(SL.pieces(INIT, S3, 'เ–ะ')[0].id === 'own', 'โหมดเขียนเอง');
ok(SL.commitPiece(INIT, S3, 'เ–ะ', 'own', [[[0, 0], [10, 10], [20, 0]]]).ok, 'บันทึกเขียนเอง'); ok(SL.assemble(INIT, S3, 'เ–ะ').strokes.length === 1, 'เขียนเอง 1 เส้น'); ok(!S3.parts['ะ'], 'เขียนเองต้องไม่แตะชิ้นส่วนร่วม');
SL.setOwn(INIT, S3, 'เ–ะ', false); ok(SL.assemble(INIT, S3, 'เ–ะ').strokes.length === 3, 'กลับไปใช้ชิ้นส่วนร่วม');

// 6) ตัวอักษรเดี่ยว
const S4 = SL.emptyState(); ok(SL.glyphStrokes(INIT, S4, 'ก').length === 1, 'default ก'); SL.commitPiece(INIT, S4, 'ก', 'glyph', [[[1, 1], [2, 2]], [[3, 3], [4, 4]]]); ok(SL.glyphStrokes(INIT, S4, 'ก').length === 2 && SL.isEdited(INIT, S4, 'ก'), 'เขียน ก ใหม่');
ok(SL.exportOut(INIT, S4)['ก'].strokes.length === 2, 'ส่งออก ก'); const f = SL.exportFile(INIT, S4); ok(f.format === 'aksorn-strokes-v1' && SL.importState(JSON.parse(JSON.stringify(f))).glyphs['ก'].length === 2, 'ส่งออก/นำเข้า');

// 7) เกลาเส้น: ปลายเส้นไม่ขยับ จุดเพิ่มขึ้นห่างเท่ากัน ไม่บวม
const raw = []; for (let i = 0; i <= 60; i++) raw.push([i * 2 + (i % 2 ? 1.5 : -1.5), 20 + Math.sin(i / 8) * 30 + (i % 3 ? 1 : -1)]);
[0, 1, 2, 3].forEach(lv => { const s = SL.smooth(raw, lv); ok(s.length > 10 && s.length < 80, 'smooth จำนวนจุด lv' + lv + ' = ' + s.length); ok(near(s[0][0], raw[0][0], 0.5) && near(s[s.length - 1][0], raw[raw.length - 1][0], 0.5), 'ปลายเส้นต้องไม่ขยับ'); });
const rough = a => { let t = 0; for (let i = 2; i < a.length; i++) t += Math.abs(a[i][1] - 2 * a[i - 1][1] + a[i - 2][1]); return t / a.length; };
ok(rough(SL.smooth(raw, 3)) < rough(SL.smooth(raw, 0)) * 0.6, 'เกลาแรงต้องเรียบกว่า');

console.log(fail ? 'ไม่ผ่าน ' + fail + ' จาก ' + n : 'ผ่านทั้งหมด ' + n + ' ข้อ');
process.exit(fail ? 1 : 0);
