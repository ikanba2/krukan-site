/* ===== Techno Aksorn: แกนของห้องลองเขียน (ใช้ทั้งในหน้า Aksorn-Stroke-Lab.html และใน test_stroke_lab.js) =====
   INIT = ข้อมูลตั้งต้น (stroke_parts_init.json + เส้นของพยัญชนะ/วรรณยุกต์/เลขไทยจาก trace-data.js)
   S    = สถานะที่ครูแก้ { parts: {ชื่อชิ้น: [เส้น...]}, own: {รูปสระ: [เส้น...]}, glyphs: {ตัวอักษร: [เส้น...]} } เก็บเฉพาะที่แก้ เส้น = [x0,y0,x1,y1,...]
   พิกัดสระ: อิงกึ่งกลางขีดแทนพยัญชนะ (0,0) แกน y ชี้ลง · พิกัดตัวอักษรอื่น: พิกัดเดียวกับ TRACE ในเกม
   รูปสระ = หลายบล็อก: บล็อกต้นทาง (fit=false) วางตามที่ชิ้นส่วนถูกเขียนไว้ตรง ๆ · บล็อกที่ใช้ซ้ำ (fit=true) วางเข้าช่องของตัวเองด้วย p' = t + s*(p - c)
   c = จุดกึ่งกลางกล่องของชิ้นแรกในบล็อก (ตามที่เขียนอยู่ตอนนี้) จึงเขียนชิ้นเลื่อนไปจากเดิมเล็กน้อยก็ไม่ทำให้รูปอื่นที่ใช้ชิ้นนี้เลื่อนตาม · ชิ้นส่วนที่ใช้ซ้ำในหลายรูปจึงเขียนเหมือนกันทุกที่ */
(function (root) {
  'use strict';
  const FRAME = { W: 660, H: 420, ox: 250, oy: 215, gx: 150, gy: 30 };   // ox,oy = ตำแหน่งกึ่งกลางขีดบนผืนผ้าใบ · gx,gy = ที่วางกรอบ 360×360 ของตัวอักษรอื่น
  const STROKE_COL = ['#ff5aa6', '#3d8bff', '#17c4a8', '#ffa21e', '#9a5ae8', '#3fb54a'];
  const pairs = fl => { const o = []; for (let i = 0; i < fl.length; i += 2) o.push([fl[i], fl[i + 1]]); return o; };
  const flatten = pts => { const o = []; pts.forEach(p => o.push(p[0], p[1])); return o; };
  const r1 = v => Math.round(v * 10) / 10;
  const emptyState = () => ({ parts: {}, own: {}, glyphs: {} });
  const partStrokes = (INIT, S, name) => S.parts[name] || INIT.parts[name];
  const isForm = (INIT, key) => !!INIT.forms[key];
  // ชิ้นที่เป็นเครื่องหมายสระลอย (ิ ็ ุ ู ํ) ใส่ขีดหน้าให้อ่านออก
  const partLabel = p => /[ัิ-ฺ็-๎]/.test(p) ? '–' + p : p;

  const centerOf = pts => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); return [(x0 + x1) / 2, (y0 + y1) / 2]; };
  // เส้นของชิ้นหนึ่ง (ตามเลขขีดที่ใช้) ในพิกัดบ้านของชิ้น · src = สถานะที่ใช้ (S ปัจจุบัน หรือ ค่าเริ่มต้น)
  const itemStrokes = (INIT, S, it) => { const st = partStrokes(INIT, S, it.p); return (it.i || st.map((_, k) => k)).map(k => st[k]); };
  const itemCenter = (INIT, S, it) => centerOf([].concat.apply([], itemStrokes(INIT, S, it).map(pairs)));
  const defaultState = { parts: {}, own: {}, glyphs: {} };

  // รูปสระประกอบจากชิ้นส่วน: คืนเส้นทั้งหมด (พิกัดอิงกึ่งกลางขีด) พร้อมบอกว่าเส้นไหนมาจากชิ้นไหน
  function assemble(INIT, S, key) {
    const f = INIT.forms[key]; if (!f) return null;
    if (S.own[key]) return { dash: f.dash, own: true, strokes: S.own[key].map((fl, k) => ({ pts: pairs(fl), piece: 'own', part: null, k })) };
    const out = [];
    f.blocks.forEach((b, bi) => {
      const s = b.T[0], tx = b.T[1], ty = b.T[2], c = b.fit ? itemCenter(INIT, S, b.items[0]) : [0, 0];
      b.items.forEach((it, ii) => {
        const st = partStrokes(INIT, S, it.p), idx = it.i || st.map((_, k) => k);
        idx.forEach(k => out.push({ pts: pairs(st[k]).map(p => b.fit ? [tx + s * (p[0] - c[0]), ty + s * (p[1] - c[1])] : [p[0], p[1]]), piece: bi + '.' + ii, part: it.p, k }));
      });
    });
    return { dash: f.dash, own: false, strokes: out };
  }

  // ชิ้นที่แก้ได้ของแต่ละรูป (เรียงตามลำดับเขียน)
  function pieces(INIT, S, key) {
    const f = INIT.forms[key];
    if (!f) return [{ id: 'glyph', label: 'ทั้งตัว', part: null }];
    if (S.own[key]) return [{ id: 'own', label: 'ทั้งรูป (เขียนเอง)', part: null }];
    const out = [];
    f.blocks.forEach((b, bi) => b.items.forEach((it, ii) => out.push({ id: bi + '.' + ii, part: it.p, idx: it.i, T: b.T, fit: !!b.fit, bi: bi, ii: ii, label: partLabel(it.p) + (it.i ? ' (ขีดที่ ' + it.i.map(v => v + 1).join(',') + ')' : '') })));
    return out;
  }

  function usedBy(INIT, part) {
    const out = [];
    Object.keys(INIT.forms).forEach(k => { if (INIT.forms[k].blocks.some(b => b.items.some(it => it.p === part))) out.push(k); });
    return out;
  }
  // จำนวนเส้นขั้นต่ำของชิ้น (ถ้ามีรูปอื่นใช้เฉพาะบางเส้นของชิ้นนี้ เช่น ไม้หันอากาศใช้ขีดแรกของ ะ)
  function minCount(INIT, part) {
    let m = 1;
    Object.values(INIT.forms).forEach(f => f.blocks.forEach(b => b.items.forEach(it => { if (it.p === part && it.i) m = Math.max(m, Math.max.apply(null, it.i) + 1); })));
    return m;
  }

  // บันทึกเส้นที่เขียนใหม่ (พิกัดอิงกึ่งกลางขีด ตามที่ปรากฏในรูปสระนั้น) ลงชิ้นส่วน: แปลงกลับเป็นพิกัดบ้านของชิ้นด้วย p = (p' - (dx,dy)) / s
  function commitPiece(INIT, S, key, id, strokes) {
    if (!strokes.length) return { ok: false, msg: 'ยังไม่ได้เขียนอะไร' };
    if (id === 'glyph') { S.glyphs[key] = strokes.map(s => flatten(s).map(r1)); return { ok: true, msg: 'บันทึก ' + key + ' แล้ว' }; }
    if (id === 'own') { S.own[key] = strokes.map(s => flatten(s).map(r1)); return { ok: true, msg: 'บันทึกรูป ' + key + ' แล้ว' }; }
    const pc = pieces(INIT, S, key).find(p => p.id === id); if (!pc) return { ok: false, msg: 'ไม่พบชิ้นนี้' };
    // แปลงกลับเป็นพิกัดบ้านของชิ้น: บล็อกต้นทางตรง ๆ · บล็อกที่ปรับช่อง: ชิ้นแรกของบล็อกจัดกึ่งกลางที่ตำแหน่งบ้านเดิม p = (p' - กึ่งกลางที่เขียน)/s + c0 (เขียนเลื่อนจากช่องเล็กน้อยก็ไม่ทำให้ที่ของชิ้นในรูปต้นทางขยับ)
    // ชิ้นถัด ๆ ไปของบล็อกวางเทียบกับชิ้นแรก p = (p' - t)/s + c
    const s = pc.T[0], tx = pc.T[1], ty = pc.T[2], blk = INIT.forms[key].blocks[pc.bi], first = blk.items[0];
    const dc = centerOf([].concat.apply([], strokes)), c0 = pc.fit && pc.ii === 0 ? itemCenter(INIT, defaultState, first) : null, c = pc.fit && pc.ii > 0 ? itemCenter(INIT, S, first) : null;
    const map = p => !pc.fit ? [p[0], p[1]] : pc.ii === 0 ? [(p[0] - dc[0]) / s + c0[0], (p[1] - dc[1]) / s + c0[1]] : [(p[0] - tx) / s + c[0], (p[1] - ty) / s + c[1]];
    const home = strokes.map(st => flatten(st.map(map)).map(r1));
    const cur = partStrokes(INIT, S, pc.part).map(x => x.slice());
    if (pc.idx) {
      if (home.length !== pc.idx.length) return { ok: false, msg: 'ชิ้นนี้ต้องเขียน ' + pc.idx.length + ' ขีด (เขียนมา ' + home.length + ' ขีด)' };
      pc.idx.forEach((k, n) => { cur[k] = home[n]; });
      S.parts[pc.part] = cur;
    } else {
      const need = minCount(INIT, pc.part);
      if (home.length < need) return { ok: false, msg: 'ชิ้น ' + pc.part + ' ต้องมีอย่างน้อย ' + need + ' ขีด เพราะรูปอื่นใช้ขีดที่ ' + need + ' ของชิ้นนี้ร่วมกัน' };
      S.parts[pc.part] = home;
    }
    const users = usedBy(INIT, pc.part).filter(k => k !== key);
    return { ok: true, msg: 'บันทึกชิ้น ' + pc.part + ' แล้ว' + (users.length ? ' รูปที่ใช้ชิ้นนี้ร่วมกันเปลี่ยนตามด้วย: ' + users.join(' ') : ''), users };
  }

  // คืนค่าเดิมของชิ้นหนึ่ง
  function resetPiece(INIT, S, key, id) {
    if (id === 'glyph') { delete S.glyphs[key]; return; }
    if (id === 'own') { delete S.own[key]; return; }
    const pc = pieces(INIT, S, key).find(p => p.id === id); if (!pc) return;
    if (!pc.idx) { delete S.parts[pc.part]; return; }
    if (!S.parts[pc.part]) return; const cur = S.parts[pc.part].slice(); pc.idx.forEach(k => { cur[k] = INIT.parts[pc.part][k]; });
    if (JSON.stringify(cur) === JSON.stringify(INIT.parts[pc.part])) delete S.parts[pc.part]; else S.parts[pc.part] = cur;
  }

  // เปลี่ยนรูปสระให้เขียนเองทั้งรูป (ไม่ใช้ชิ้นส่วนร่วม) หรือกลับไปใช้ชิ้นส่วนร่วม
  function setOwn(INIT, S, key, on) {
    if (on) { const a = assemble(INIT, S, key); S.own[key] = a.strokes.map(s => flatten(s.pts).map(r1)); } else delete S.own[key];
  }

  const glyphStrokes = (INIT, S, key) => S.glyphs[key] || INIT.glyphs[key];
  const isEdited = (INIT, S, key) => {
    if (!INIT.forms[key]) return !!S.glyphs[key];
    if (S.own[key]) return true;
    return INIT.forms[key].blocks.some(b => b.items.some(it => !!S.parts[it.p]));
  };

  // เกลาเส้นที่ลากด้วยมือ: ตัดจุดซ้ำ › ทำให้ห่างเท่ากัน › เฉลี่ยจุดข้างเคียง (level 0 = ไม่เกลา 1 เบา 2 กลาง 3 แรง) ปลายเส้นไม่ขยับ
  function resamplePts(pts, step) {
    if (pts.length < 2) return pts.slice();
    const out = [pts[0].slice()]; let acc = 0, prev = pts[0];
    for (let i = 1; i < pts.length; i++) {
      let a = prev, b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (acc + d >= step) { const t = (step - acc) / d; a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; out.push(a); d = Math.hypot(b[0] - a[0], b[1] - a[1]); acc = 0; }
      acc += d; prev = b;
    }
    const last = pts[pts.length - 1], q = out[out.length - 1];
    if (Math.hypot(last[0] - q[0], last[1] - q[1]) > step * 0.3) out.push(last.slice()); else out[out.length - 1] = last.slice();
    return out;
  }
  function smooth(raw, level) {
    let pts = raw.filter((p, i) => i === 0 || Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]) >= 0.8);
    if (pts.length < 2) return pts;
    pts = resamplePts(pts, 3);
    const passes = [0, 2, 5, 9][level == null ? 2 : level];
    for (let k = 0; k < passes; k++) {
      const nx = pts.map(p => p.slice());
      for (let i = 1; i < pts.length - 1; i++) { nx[i] = [(pts[i - 1][0] + 2 * pts[i][0] + pts[i + 1][0]) / 4, (pts[i - 1][1] + 2 * pts[i][1] + pts[i + 1][1]) / 4]; }
      pts = nx;
    }
    return resamplePts(pts, 4).map(p => [r1(p[0]), r1(p[1])]);
  }

  // ข้อมูลที่เกมใช้ (รูปแบบเดียวกับ trace-data.js): สระจัดกึ่งกลางกรอบ 600×360 เหมือน vowel_trace.py · ตัวอักษรอื่นเฉพาะที่แก้
  function exportOut(INIT, S) {
    const out = {};
    Object.keys(INIT.forms).forEach(k => {
      const a = assemble(INIT, S, k), pts = [];
      a.strokes.forEach(s => s.pts.forEach(p => pts.push(p))); pts.push([a.dash[0], 0], [a.dash[1], 0]);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), ox = 300 - (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, oy = 180 - (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
      out[k] = { strokes: a.strokes.map(s => flatten(s.pts.map(p => [p[0] + ox, p[1] + oy])).map(Math.round)), dash: [Math.round(a.dash[0] + ox), Math.round(a.dash[1] + ox), Math.round(oy)] };
    });
    Object.keys(S.glyphs).forEach(k => { out[k] = { strokes: S.glyphs[k].map(fl => fl.map(Math.round)) }; });
    return out;
  }
  const exportFile = (INIT, S) => ({ format: 'aksorn-strokes-v1', savedAt: new Date().toISOString(), state: { parts: S.parts, own: S.own, glyphs: S.glyphs }, out: exportOut(INIT, S) });
  function importState(obj) {
    const st = obj && (obj.state || obj); if (!st || typeof st !== 'object') return null;
    return { parts: st.parts || {}, own: st.own || {}, glyphs: st.glyphs || {} };
  }

  root.SL = { partLabel, FRAME, STROKE_COL, pairs, flatten, emptyState, partStrokes, isForm, assemble, pieces, usedBy, minCount, commitPiece, resetPiece, setOwn, glyphStrokes, isEdited, smooth, resamplePts, exportOut, exportFile, importState };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SL;
})(typeof window !== 'undefined' ? window : globalThis);
