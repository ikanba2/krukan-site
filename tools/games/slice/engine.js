/* Techno Slice (ช่างแบ่งพิซซ่า สำหรับ ป.4 เรื่องเศษส่วน): ตรรกะของเกม ไม่แตะหน้าจอ ทดสอบด้วย node test_engine.js ได้
   แนวคิดเดียวทั้งเกม: มี "ชิ้นของ" (item) กับ "ที่วาง" (zone) ลากชิ้นของไปวางที่ที่ถูกต้อง ผิดก็ถูกตีกลับพร้อมเหตุผลที่เรียนรู้ได้
   ชนิดด่าน (kind): cut = ตัดพิซซ่าตามที่ลูกค้าสั่ง (ใส่ชิ้น 1/b จำนวน a ชิ้นลงจาน) · match = จับคู่การ์ดเศษส่วนกับภาพที่ระบายสี
                    eq = จับคู่เศษส่วนที่เท่ากัน (ค่าเท่ากันแต่เขียนต่างกัน) · line = วางการ์ดบนเส้นจำนวน · order = เรียงจากน้อยไปมาก
                    pack = ใส่ชิ้นเข้ากล่อง (เศษเกิน › จำนวนคละ) · conv = จับคู่เศษเกินกับจำนวนคละของภาพเดียวกัน · calc = บวก/ลบ ตอบด้วยการลากตัวเลขลงช่องเศษส่วน
   ชิ้นของ: { id, kind:'slice'|'card'|'num', n(ข้อความที่แสดง), f:{ den, frac, val, imp, mix, rank, tv } }  f คือคุณสมบัติที่ที่วางจะตรวจ
   ที่วาง:  { id, kind:'plate'|'pic'|'tick'|'rank'|'box'|'ans'|'tray', acc:{ k, v }, cap, ... }
   เช็กลิสต์ checks = [{ text, items:[id...], any, full:[zoneId...] }]  full = ที่วางเหล่านั้นต้องเต็ม (ใช้กับจานและกล่อง)
   สถานะ st = { loc:{ itemId: zoneId|null } }  null = อยู่ในถาด */
(function (root) {
  'use strict';

  /* ---------- เลขเศษส่วน ---------- */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const red = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
  const fstr = (n, d) => n + '/' + d;                            // เขียนตามที่เห็น เช่น 2/4
  const vstr = (n, d) => { const r = red(n, d); return r[0] + '/' + r[1]; };   // ค่าที่ย่อแล้ว ใช้เทียบว่าเท่ากัน 2/4 = 1/2
  const mixed = (n, d) => { const w = Math.floor(n / d); return { w, n: n - w * d, d }; };
  const mstr = (n, d) => { const m = mixed(n, d); return m.n === 0 ? String(m.w) : (m.w ? m.w + ' ' + m.n + '/' + d : m.n + '/' + d); };   // จำนวนคละ เช่น 2 3/4 (ตัวส่วนเดิมไม่ย่อ)

  /* ---------- สร้างชิ้นของ ---------- */
  // ชิ้นพิซซ่า 1/den (ตัดจากพิซซ่าที่แบ่ง den ส่วน)
  const mkSlice = (id, den) => ({ id, kind: 'slice', n: '1/' + den, f: { den } });
  // การ์ดเศษส่วน (ตัวเศษ/ตัวส่วน) · ใส่ extra เพิ่มคุณสมบัติได้ เช่น { rank } หรือ { imp } หรือ { mix }
  const mkCard = (id, n, d, extra) => ({ id, kind: 'card', num: n, den: d, n: fstr(n, d), f: Object.assign({ frac: fstr(n, d), val: vstr(n, d) }, extra || {}) });
  const mkImp = (id, n, d) => ({ id, kind: 'card', num: n, den: d, n: fstr(n, d), f: { imp: fstr(n, d) } });
  const mkMix = (id, n, d) => { const m = mixed(n, d); return { id, kind: 'card', mix: m, den: d, n: mstr(n, d), f: { mix: mstr(n, d) } }; };
  const mkNum = (id, v) => ({ id, kind: 'num', n: String(v), f: { tv: v } });

  /* ---------- กติกา ---------- */
  const zoneOf = (lv, id) => lv.zones.find(z => z.id === id) || null;
  const itemOf = (lv, id) => lv.items.find(i => i.id === id) || null;
  function init(lv) { const loc = {}; lv.items.forEach(i => { loc[i.id] = (lv.pre && lv.pre[i.id]) || null; }); return { loc }; }
  function clone(st) { return { loc: Object.assign({}, st.loc) }; }
  const occ = (st, zoneId) => Object.keys(st.loc).filter(k => st.loc[k] === zoneId);
  const capOf = z => (z.cap == null ? 1 : z.cap);

  // ชิ้นของ item ตรงกับเงื่อนไขของที่วาง zone ไหม (ยังไม่ดูว่าเต็มหรือไม่)
  function fits(lv, item, zone) {
    if (!zone || zone.kind === 'tray') return true;
    const a = zone.acc || {};
    return item.f[a.k] !== undefined && item.f[a.k] === a.v;
  }

  // ข้อความอธิบายว่าทำไมวางผิด (ภาษาเด็ก บอกเหตุผลทางคณิตศาสตร์ที่เรียนรู้ได้)
  function whyWrong(lv, item, zone) {
    if (zone.wrong) return zone.wrong(item);
    const a = zone.acc || {}, nm = '“' + item.n + '”';
    switch (zone.kind) {
      case 'plate': return 'ชิ้น ' + nm + ' ตัดมาจากพิซซ่าที่แบ่ง ' + item.f.den + ' ส่วน แต่ลูกค้าสั่ง ' + zone.q.a + '/' + zone.q.b + ' ต้องใช้ชิ้นที่ตัดจากพิซซ่าแบ่ง ' + zone.q.b + ' ส่วน (ชิ้นละ 1/' + zone.q.b + ')';
      case 'box': return 'กล่องนี้ใส่ได้เฉพาะชิ้น 1/' + a.v + ' ที่ตัดจากพิซซ่าแบ่ง ' + a.v + ' ส่วน ชิ้นนี้คือ ' + item.n;
      case 'pic': {
        const p = zone.pic;
        if (a.k === 'frac') return 'ภาพนี้แบ่งเป็น ' + p.d + ' ส่วนและระบายไว้ ' + p.n + ' ส่วน คือ ' + p.n + '/' + p.d + ' แต่การ์ดนี้คือ ' + item.n;
        if (a.k === 'val') return 'ภาพนี้คือ ' + p.n + '/' + p.d + (red(p.n, p.d)[1] !== p.d ? ' ซึ่งเท่ากับ ' + vstr(p.n, p.d) : '') + ' แต่การ์ดนี้คือ ' + item.n + ' ที่ค่าไม่เท่ากัน';
        if (a.k === 'imp') return 'ภาพนี้มีพิซซ่ารวม ' + zone.pic.total + ' ชิ้น (ชิ้นละ 1/' + p.d + ') เศษเกินต้องเขียน ' + zone.pic.total + '/' + p.d + ' แต่การ์ดนี้คือ ' + item.n;
        if (a.k === 'mix') return 'ภาพนี้มีพิซซ่าเต็มกล่อง ' + zone.pic.whole + ' กล่อง เหลือ ' + zone.pic.rest + ' ชิ้น จึงเขียนเป็นจำนวนคละได้ ' + a.v + ' แต่การ์ดนี้คือ ' + item.n;
        return 'การ์ดนี้ไม่ตรงกับภาพ';
      }
      case 'tick': return 'จุดนี้อยู่ที่ ' + zone.tickText + ' แต่การ์ดนี้คือ ' + item.n + ' ลองนับช่องบนเส้นจำนวนจาก 0 อีกครั้ง';
      case 'rank': {
        const mine = item.f.rank, want = a.v;
        return mine < want ? 'การ์ด ' + item.n + ' มีค่าน้อยกว่านี้ ต้องอยู่ถัดไปทางซ้ายมือ (ลำดับก่อนหน้า)' : 'การ์ด ' + item.n + ' มีค่ามากกว่านี้ ต้องอยู่ทางขวามือ (ลำดับถัดไป)';
      }
      case 'ans': return 'ตัวเลข ' + item.n + ' ยังไม่ใช่ตัว' + zone.part + 'ของคำตอบ ' + (zone.tip || 'ลองคิดใหม่อีกครั้ง');
    }
    return 'วางตรงนี้ไม่ได้';
  }

  // ลองวาง: คืน { ok } หรือ { ok:false, why:'wrong'|'full'|'same', soft, msg }  soft = ไม่นับเป็นข้อผิด
  function canDrop(lv, st, itemId, zoneId) {
    const item = itemOf(lv, itemId); if (!item) return { ok: false, why: 'noitem', soft: true, msg: '' };
    if (zoneId === 'tray' || zoneId == null) return { ok: true };
    const zone = zoneOf(lv, zoneId); if (!zone) return { ok: false, why: 'nozone', soft: true, msg: '' };
    if (st.loc[itemId] === zoneId) return { ok: false, why: 'same', soft: true, msg: 'อยู่ที่นี่อยู่แล้ว' };
    if (!fits(lv, item, zone)) return { ok: false, why: 'wrong', soft: false, msg: whyWrong(lv, item, zone) };
    if (occ(st, zoneId).filter(o => o !== itemId).length >= capOf(zone)) return { ok: false, why: 'full', soft: true, msg: zone.kind === 'plate' || zone.kind === 'box' ? 'ครบตามที่สั่งแล้ว ไม่ต้องใส่เพิ่ม' : 'ช่องนี้มีการ์ดอยู่แล้ว ดึงใบเดิมออกก่อนนะ' };
    return { ok: true };
  }
  function drop(lv, st, itemId, zoneId) {
    const r = canDrop(lv, st, itemId, zoneId); if (!r.ok) return r;
    st.loc[itemId] = zoneId === 'tray' ? null : zoneId; return r;
  }

  function itemOk(lv, st, itemId) { const z = st.loc[itemId]; if (!z) return false; return fits(lv, itemOf(lv, itemId), zoneOf(lv, z)); }
  function wrongPlaced(lv, st) { return lv.items.filter(i => st.loc[i.id] && !fits(lv, i, zoneOf(lv, st.loc[i.id]))).map(i => i.id); }
  const checkDone = (lv, st, c) => c.full ? c.full.every(zid => occ(st, zid).length >= capOf(zoneOf(lv, zid))) : (c.any ? c.items.some(i => itemOk(lv, st, i)) : c.items.every(i => itemOk(lv, st, i)));
  function status(lv, st) {
    const checks = lv.checks.map(c => checkDone(lv, st, c)), wrong = wrongPlaced(lv, st);
    return { checks, wrong, done: checks.every(Boolean) && !wrong.length };
  }
  // ชิ้นที่ต้องใช้ = ชิ้นในเช็กลิสต์ หรือชิ้นที่ลงจาน/กล่องที่ต้องเต็มได้
  function needed(lv) {
    const s = new Set();
    lv.checks.forEach(c => { if (c.full) c.full.forEach(zid => lv.items.forEach(i => { if (fits(lv, i, zoneOf(lv, zid))) s.add(i.id); })); else c.items.forEach(i => s.add(i)); });
    return s;
  }

  // วิธีทำให้ผ่านทีละขั้น (ใช้เป็นคำใบ้และตรวจว่าด่านผ่านได้จริง) คืนรายการ { item, zone }
  function plan(lv, st) {
    const s = clone(st), ops = [], need = needed(lv);
    const target = it => lv.zones.filter(z => z.kind !== 'tray' && fits(lv, it, z) && canDrop(lv, s, it.id, z.id).ok);
    for (let guard = 0; guard < 400; guard++) {
      if (status(lv, s).done) break;
      const wr = wrongPlaced(lv, s); let op = null;
      for (const id of wr) { const t = target(itemOf(lv, id)); if (t.length) { op = { item: id, zone: t[0].id }; break; } }
      if (!op && wr.length) op = { item: wr[0], zone: 'tray' };
      if (!op) {
        const pending = lv.items.filter(i => !s.loc[i.id] && need.has(i.id)).sort((a, b) => (a.f.rank || 0) - (b.f.rank || 0));
        for (const it of pending) {
          // ใส่เฉพาะชิ้นที่ยังมีเช็กลิสต์ข้อที่ไม่ครบและชิ้นนี้ช่วยได้
          const open = lv.checks.some(c => !checkDone(lv, s, c) && ((c.items && c.items.includes(it.id)) || (c.full && c.full.some(zid => fits(lv, it, zoneOf(lv, zid))))));
          if (!open) continue;
          const t = target(it); if (t.length) { op = { item: it.id, zone: t[0].id }; break; }
        }
      }
      if (!op) break;
      drop(lv, s, op.item, op.zone); ops.push(op);
    }
    return ops;
  }
  function solves(lv) {
    const st = init(lv), ops = plan(lv, st);
    for (const o of ops) { const r = drop(lv, st, o.item, o.zone); if (!r.ok) return false; }
    return status(lv, st).done;
  }

  const api = { gcd, red, fstr, vstr, mixed, mstr, mkSlice, mkCard, mkImp, mkMix, mkNum, zoneOf, itemOf, init, clone, occ, capOf, fits, whyWrong, canDrop, drop, itemOk, wrongPlaced, status, needed, plan, solves };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SL = api;
})(typeof window !== 'undefined' ? window : globalThis);
