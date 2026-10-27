/* Techno Parts (ช่างประกอบคอม สำหรับ ป.2-ป.4): ตรรกะของเกม ไม่แตะหน้าจอ ทดสอบด้วย node test_engine.js ได้
   แนวคิดเดียวทั้งเกม: มี "ชิ้นของ" (item) กับ "ที่วาง" (zone) ลากชิ้นของไปวางที่ที่ถูกต้อง ผิดก็ถูกตีกลับพร้อมเหตุผล
   ชนิดด่าน (kind): sort = จัดกลุ่มอุปกรณ์ · plug = เสียบสายเข้าช่อง · fix = ซ่อมสายที่หลุดหรือเสียบผิดช่อง
                    build = ประกอบชิ้นส่วนเข้าเครื่อง · order = เรียงขั้นตอน · job = เลือกอุปกรณ์ให้ตรงกับงานของลูกค้า
   ชิ้นของ: { id, dev, n(ชื่อ), ic(ไอคอน), use(หน้าที่), f:{ grp, port, part, step, need } }  f คือคุณสมบัติที่ที่วางจะตรวจ
   ที่วาง:  { id, kind:'bin'|'port'|'slot'|'step'|'cart', acc:{ k:'grp'|'port'|'part'|'step'|'need', v }, cap, label, sub }
   ที่วางพิเศษ 'tray' = ถาดชิ้นส่วน (ลากกลับมาวางได้เสมอ ไม่นับเป็นข้อผิด)
   สถานะ st = { loc:{ itemId: zoneId|null } }  null = อยู่ในถาด
   เช็กลิสต์ภารกิจ checks = [{ text, items:[itemId...], any }]  any=true: ชิ้นใดชิ้นหนึ่งถูกที่ก็ผ่าน (งานลูกค้า) ไม่ใส่ = ต้องถูกที่ครบทุกชิ้น */
(function (root) {
  'use strict';

  /* ---------- ข้อมูลอ้างอิง ---------- */
  // ชื่อกลุ่มอุปกรณ์ (ใช้กับด่านจัดกลุ่ม)
  const GROUPS = {
    in: { n: 'ส่วนรับข้อมูลเข้า', s: 'ส่งข้อมูลเข้าไปให้คอมพิวเตอร์', color: '#22b45a' },
    out: { n: 'ส่วนแสดงผล', s: 'แสดงผลลัพธ์ให้เรารู้', color: '#2b8cff' },
    store: { n: 'ส่วนเก็บข้อมูล', s: 'เก็บงานไว้เปิดใช้ทีหลัง', color: '#ff8a2b' },
    cpu: { n: 'ส่วนประมวลผล', s: 'คิดคำนวณและสั่งงาน', color: '#e0243d' },
    hw: { n: 'ฮาร์ดแวร์', s: 'ชิ้นส่วนที่จับต้องได้', color: '#7c4af0' },
    sw: { n: 'ซอฟต์แวร์', s: 'โปรแกรมที่สั่งให้เครื่องทำงาน จับต้องไม่ได้', color: '#16c7a8' }
  };
  // ช่องเสียบหลังเครื่อง
  const PORTS = {
    power: { n: 'ช่องไฟเข้า', use: 'รับไฟจากปลั๊ก', col: '#e0243d' },
    hdmi: { n: 'ช่อง HDMI', use: 'ส่งภาพไปที่จอ', col: '#2b8cff' },
    usb: { n: 'ช่อง USB', use: 'ต่อเมาส์ แป้นพิมพ์ เครื่องพิมพ์ และอุปกรณ์ชิ้นเล็ก ๆ', col: '#4a5aa8' },
    audio: { n: 'ช่องเสียงออก (สีเขียว)', use: 'ส่งเสียงไปที่ลำโพงหรือหูฟัง', col: '#22b45a' },
    mic: { n: 'ช่องไมค์ (สีชมพู)', use: 'รับเสียงจากไมโครโฟน', col: '#ff5ea8' },
    lan: { n: 'ช่องสายอินเทอร์เน็ต (LAN)', use: 'ต่อสายเข้าอินเทอร์เน็ต', col: '#ff8a2b' }
  };
  // ชิ้นส่วนภายในเครื่อง
  const PARTS = {
    cpu: { n: 'ซีพียู (CPU)', use: 'สมองของเครื่อง คิดและประมวลผล', slot: 'ช่องซีพียู' },
    ram: { n: 'แรม (RAM)', use: 'พื้นที่ทำงานชั่วคราว ปิดเครื่องแล้วข้อมูลหาย', slot: 'ช่องแรม' },
    store: { n: 'ที่เก็บไฟล์ (SSD หรือฮาร์ดดิสก์)', use: 'เก็บไฟล์ไว้ถาวร ปิดเครื่องแล้วก็ยังอยู่', slot: 'ช่องที่เก็บไฟล์' },
    psu: { n: 'แหล่งจ่ายไฟ (PSU)', use: 'แปลงไฟแล้วส่งให้ทุกชิ้นในเครื่อง', slot: 'ช่องแหล่งจ่ายไฟ' },
    fan: { n: 'พัดลมระบายความร้อน', use: 'ไล่ความร้อนไม่ให้เครื่องร้อนเกินไป', slot: 'ช่องพัดลม' },
    gpu: { n: 'การ์ดจอ (GPU)', use: 'สร้างภาพที่แสดงบนจอ', slot: 'ช่องการ์ดจอ' }
  };
  // อุปกรณ์ทั้งหมด: g = กลุ่ม · port = ช่องเสียบหลังเครื่อง · part = ชิ้นส่วนในเครื่อง · sw = ซอฟต์แวร์
  const DEV = {
    keyboard: { n: 'แป้นพิมพ์', g: 'in', port: 'usb', ic: 'keyboard', use: 'ใช้พิมพ์ตัวอักษรส่งเข้าเครื่อง' },
    mouse: { n: 'เมาส์', g: 'in', port: 'usb', ic: 'mouse', use: 'ใช้ชี้และคลิกสั่งงาน' },
    mic: { n: 'ไมโครโฟน', g: 'in', port: 'mic', ic: 'mic', use: 'รับเสียงพูดส่งเข้าเครื่อง' },
    webcam: { n: 'เว็บแคม', g: 'in', port: 'usb', ic: 'webcam', use: 'ถ่ายภาพและวิดีโอส่งเข้าเครื่อง' },
    scanner: { n: 'เครื่องสแกน', g: 'in', port: 'usb', ic: 'scanner', use: 'อ่านกระดาษหรือรูปให้กลายเป็นไฟล์' },
    gamepad: { n: 'จอยเกม', g: 'in', port: 'usb', ic: 'gamepad', use: 'ใช้บังคับตัวละครในเกม' },
    pentablet: { n: 'กระดานวาดภาพ', g: 'in', port: 'usb', ic: 'pentablet', use: 'วาดภาพด้วยปากกาส่งเข้าเครื่อง' },
    barcode: { n: 'เครื่องอ่านบาร์โค้ด', g: 'in', port: 'usb', ic: 'barcode', use: 'อ่านรหัสแท่งบนสินค้า' },
    monitor: { n: 'จอภาพ', g: 'out', port: 'hdmi', ic: 'monitor', use: 'แสดงภาพให้เราดู' },
    speaker: { n: 'ลำโพง', g: 'out', port: 'audio', ic: 'speaker', use: 'ส่งเสียงออกมาให้เราฟัง' },
    headphones: { n: 'หูฟัง', g: 'out', port: 'audio', ic: 'headphones', use: 'ส่งเสียงเข้าหูเราคนเดียว' },
    printer: { n: 'เครื่องพิมพ์', g: 'out', port: 'usb', ic: 'printer', use: 'พิมพ์งานออกมาเป็นกระดาษ' },
    projector: { n: 'โปรเจกเตอร์', g: 'out', port: 'hdmi', ic: 'projector', use: 'ฉายภาพขึ้นจอใหญ่ให้ทั้งห้องดู' },
    hdd: { n: 'ฮาร์ดดิสก์', g: 'store', part: 'store', ic: 'hdd', use: 'เก็บไฟล์จำนวนมากไว้ในเครื่อง' },
    ssd: { n: 'SSD', g: 'store', part: 'store', ic: 'ssd', use: 'เก็บไฟล์ในเครื่อง เปิดงานได้เร็ว' },
    flash: { n: 'แฟลชไดรฟ์', g: 'store', port: 'usb', ic: 'flash', use: 'เก็บไฟล์ขนาดพกพา เสียบ USB' },
    sdcard: { n: 'เมมโมรีการ์ด', g: 'store', ic: 'sdcard', use: 'เก็บภาพในกล้องหรือโทรศัพท์' },
    disc: { n: 'แผ่นซีดี', g: 'store', ic: 'disc', use: 'เก็บข้อมูลบนแผ่น' },
    cpu: { n: 'ซีพียู', g: 'cpu', part: 'cpu', ic: 'cpu', use: 'คิดคำนวณและสั่งงานทุกอย่าง' },
    ram: { n: 'แรม', part: 'ram', ic: 'ram', use: 'พื้นที่ทำงานชั่วคราว' },
    psu: { n: 'แหล่งจ่ายไฟ', part: 'psu', ic: 'psu', use: 'ส่งไฟให้ทุกชิ้น' },
    fan: { n: 'พัดลม', part: 'fan', ic: 'fan', use: 'ระบายความร้อน' },
    gpu: { n: 'การ์ดจอ', part: 'gpu', ic: 'gpu', use: 'สร้างภาพบนจอ' },
    power: { n: 'สายไฟ', port: 'power', ic: 'power', use: 'ส่งไฟจากปลั๊กเข้าเครื่อง' },
    lan: { n: 'สายอินเทอร์เน็ต', port: 'lan', ic: 'lan', use: 'เชื่อมเครื่องเข้าอินเทอร์เน็ต' },
    doc: { n: 'โปรแกรมพิมพ์เอกสาร', g: 'sw', sw: true, ic: 'sw-doc', use: 'โปรแกรมไว้พิมพ์รายงาน' },
    paint: { n: 'โปรแกรมวาดรูป', g: 'sw', sw: true, ic: 'sw-paint', use: 'โปรแกรมไว้วาดภาพ' },
    music: { n: 'โปรแกรมเล่นเพลง', g: 'sw', sw: true, ic: 'sw-music', use: 'โปรแกรมไว้เปิดเพลง' },
    web: { n: 'เว็บเบราว์เซอร์', g: 'sw', sw: true, ic: 'sw-web', use: 'โปรแกรมไว้เปิดเว็บไซต์' },
    game: { n: 'โปรแกรมเกม', g: 'sw', sw: true, ic: 'sw-game', use: 'โปรแกรมไว้เล่นเกม' },
    os: { n: 'ระบบปฏิบัติการ', g: 'sw', sw: true, ic: 'sw-os', use: 'โปรแกรมหลักที่คุมทั้งเครื่อง' }
  };
  // ความต้องการของลูกค้า: need → ชื่อที่เด็กอ่านในเช็กลิสต์ + อุปกรณ์ที่ตอบโจทย์ได้
  const NEEDS = {
    screen: { n: 'มีจอไว้ดูภาพ', devs: ['monitor'] },
    big: { n: 'มีของฉายภาพขึ้นจอใหญ่ให้ทั้งห้องดู', devs: ['projector'] },
    type: { n: 'มีของไว้พิมพ์ตัวอักษร', devs: ['keyboard'] },
    point: { n: 'มีของไว้ชี้และคลิก', devs: ['mouse'] },
    print: { n: 'มีของไว้พิมพ์ออกมาเป็นกระดาษ', devs: ['printer'] },
    sound: { n: 'มีของให้ได้ยินเสียง', devs: ['speaker', 'headphones'] },
    micin: { n: 'มีของไว้พูดเข้าเครื่อง', devs: ['mic'] },
    cam: { n: 'มีของไว้ถ่ายหน้าตา', devs: ['webcam'] },
    scan: { n: 'มีของไว้แปลงกระดาษเป็นไฟล์', devs: ['scanner'] },
    save: { n: 'มีที่เก็บไฟล์พกพา', devs: ['flash', 'sdcard'] },
    play: { n: 'มีของไว้บังคับตัวละครในเกม', devs: ['gamepad'] },
    code: { n: 'มีของไว้อ่านรหัสแท่งบนสินค้า', devs: ['barcode'] },
    draw: { n: 'มีของไว้วาดภาพด้วยปากกา', devs: ['pentablet'] }
  };

  /* ---------- สร้างชิ้นของ ---------- */
  // mkItem(id, dev, f) · f คือคุณสมบัติที่ใช้ตรวจ (grp/port/part/step/need)
  function mkItem(id, dev, f) {
    const d = DEV[dev]; if (!d) throw new Error('ไม่รู้จักอุปกรณ์ ' + dev);
    return { id, dev, n: d.n, ic: d.ic, use: d.use, f: Object.assign({}, f) };
  }
  // ชิ้นขั้นตอน (ด่านเรียงลำดับ): ไม่ใช่อุปกรณ์ มีข้อความของตัวเอง
  function mkStep(id, text, step, why) { return { id, dev: null, n: text, ic: 'step', use: why || '', f: { step } }; }

  /* ---------- กติกา ---------- */
  const zoneOf = (lv, id) => lv.zones.find(z => z.id === id) || null;
  const itemOf = (lv, id) => lv.items.find(i => i.id === id) || null;
  function init(lv) { const loc = {}; lv.items.forEach(i => { loc[i.id] = (lv.pre && lv.pre[i.id]) || null; }); return { loc }; }
  function clone(st) { return { loc: Object.assign({}, st.loc) }; }
  const occ = (st, zoneId) => Object.keys(st.loc).filter(k => st.loc[k] === zoneId);

  // ชิ้นของ item ตรงกับเงื่อนไขของที่วาง zone ไหม (ยังไม่ดูว่าเต็มหรือไม่)
  function fits(lv, item, zone) {
    if (!zone || zone.kind === 'tray') return true;
    const a = zone.acc || {};
    if (a.k === 'need') return !!item.f.need;
    return item.f[a.k] !== undefined && item.f[a.k] === a.v;
  }
  const dupNeed = (lv, st, item, zone) => zone.kind === 'cart' && item.f.need && occ(st, zone.id).some(o => o !== item.id && itemOf(lv, o).f.need === item.f.need);

  // ข้อความอธิบายว่าทำไมวางผิดที่ (ภาษาเด็ก บอกความจริงที่เรียนรู้ได้)
  function whyWrong(lv, item, zone) {
    const nm = '“' + item.n + '”', a = zone.acc || {}, extra = lv.xwhy && lv.xwhy[item.dev];
    if (extra && zone.kind === 'cart') return extra;
    switch (zone.kind) {
      case 'bin': {
        const mine = GROUPS[item.f.grp], want = GROUPS[a.v];
        return mine ? nm + ' ' + item.use + ' จึงเป็น' + mine.n + ' ไม่ใช่' + want.n : nm + ' ไม่ใช่' + want.n;
      }
      case 'port': {
        const want = PORTS[a.v], mine = PORTS[item.f.port];
        if (!mine) return nm + ' ไม่ได้เสียบที่ช่องหลังเครื่อง';
        return want.n + ' ' + want.use + ' แต่ ' + nm + ' ต้องเสียบที่ ' + mine.n;
      }
      case 'slot': {
        const want = PARTS[a.v], mine = item.f.part && PARTS[item.f.part];
        if (!mine) return nm + ' ไม่ได้ติดตั้งอยู่ภายในตัวเครื่อง จึงใส่ช่องนี้ไม่ได้';
        return 'ช่องนี้สำหรับ' + want.n + ' ส่วน ' + nm + ' (' + mine.use + ') ต้องใส่ที่' + mine.slot;
      }
      case 'step': {
        if (item.f.step < a.v) return 'ขั้นนี้ต้องทำก่อนหน้านี้ ยังมีของที่ต้องทำก่อนขั้นที่ ' + a.v;
        return 'ขั้นนี้ต้องรอไว้ทำทีหลัง ลองคิดดูว่าตอนนี้ต้องทำอะไรก่อน';
      }
      case 'cart': return 'ลูกค้าไม่ได้ต้องการ ' + nm + ' สำหรับงานนี้';
    }
    return 'วางตรงนี้ไม่ได้';
  }

  // ลองวาง: คืน { ok } หรือ { ok:false, why:'wrong'|'full'|'dup', soft, msg }  soft = ไม่นับเป็นข้อผิด
  function canDrop(lv, st, itemId, zoneId) {
    const item = itemOf(lv, itemId); if (!item) return { ok: false, why: 'noitem', soft: true, msg: '' };
    if (zoneId === 'tray' || zoneId == null) return { ok: true };
    const zone = zoneOf(lv, zoneId); if (!zone) return { ok: false, why: 'nozone', soft: true, msg: '' };
    if (st.loc[itemId] === zoneId) return { ok: false, why: 'same', soft: true, msg: 'อยู่ที่นี่อยู่แล้ว' };
    if (!fits(lv, item, zone)) return { ok: false, why: 'wrong', soft: false, msg: whyWrong(lv, item, zone) };
    if (dupNeed(lv, st, item, zone)) return { ok: false, why: 'dup', soft: true, msg: 'ลูกค้าต้องการแค่อย่างเดียวสำหรับหน้าที่นี้ มีของที่ใช้ทำหน้าที่เดียวกันอยู่ในตะกร้าแล้ว' };
    const cap = zone.cap == null ? (zone.kind === 'bin' || zone.kind === 'cart' ? 99 : 1) : zone.cap;
    if (occ(st, zoneId).filter(o => o !== itemId).length >= cap) return { ok: false, why: 'full', soft: true, msg: 'ช่องนี้มีของอยู่แล้ว ถอดของเดิมออกก่อนนะ' };
    return { ok: true };
  }
  function drop(lv, st, itemId, zoneId) {
    const r = canDrop(lv, st, itemId, zoneId); if (!r.ok) return r;
    st.loc[itemId] = zoneId === 'tray' ? null : zoneId; return r;
  }

  // ชิ้นของอยู่ในที่ที่ถูกหรือไม่ (ไม่ดูว่าเต็ม) · ชิ้นที่อยู่ในถาดนับว่า "ยังไม่ถูก"
  function itemOk(lv, st, itemId) { const z = st.loc[itemId]; if (!z) return false; return fits(lv, itemOf(lv, itemId), zoneOf(lv, z)); }
  // ชิ้นที่วางอยู่แต่ผิดที่ (เกิดได้เฉพาะด่านซ่อมที่เริ่มด้วยการเสียบผิดไว้)
  function wrongPlaced(lv, st) { return lv.items.filter(i => st.loc[i.id] && !fits(lv, i, zoneOf(lv, st.loc[i.id]))).map(i => i.id); }
  function status(lv, st) {
    const checks = lv.checks.map(c => c.any ? c.items.some(i => itemOk(lv, st, i)) : c.items.every(i => itemOk(lv, st, i)));
    const wrong = wrongPlaced(lv, st);
    return { checks, wrong, done: checks.every(Boolean) && !wrong.length };
  }

  // ชิ้นที่ต้องใช้ในด่านนี้ = ชิ้นที่อยู่ในเช็กลิสต์ (ตัวหลอกไม่อยู่ในนั้น)
  function needed(lv) { const s = new Set(); lv.checks.forEach(c => c.items.forEach(i => s.add(i))); return s; }

  // วิธีทำให้ผ่านทีละขั้น (ใช้เป็นคำใบ้และตรวจว่าด่านผ่านได้จริง) คืนรายการ { item, zone }
  function plan(lv, st) {
    const s = clone(st), ops = [], need = needed(lv);
    const target = (it) => lv.zones.filter(z => z.kind !== 'tray' && fits(lv, it, z) && canDrop(lv, s, it.id, z.id).ok);
    for (let guard = 0; guard < 300; guard++) {
      if (status(lv, s).done) break;
      // 1) ชิ้นที่อยู่ผิดที่ ย้ายไปที่ถูกก่อน
      const wr = wrongPlaced(lv, s); let op = null;
      for (const id of wr) { const it = itemOf(lv, id), t = target(it); if (t.length) { op = { item: id, zone: t[0].id }; break; } }
      if (!op && wr.length) op = { item: wr[0], zone: 'tray' };
      // 2) ชิ้นในถาดที่จำเป็น (งานลูกค้าเลือกเฉพาะชิ้นที่ยังไม่มีใครทำหน้าที่นั้น ด่านเรียงลำดับเริ่มจากขั้นต้น)
      if (!op) {
        const pending = lv.items.filter(i => !s.loc[i.id] && need.has(i.id)).sort((a, b) => (a.f.step || 0) - (b.f.step || 0));
        for (const it of pending) {
          const chk = lv.checks.find(c => c.items.includes(it.id)); if (chk && chk.any && chk.items.some(i => itemOk(lv, s, i))) continue;
          const t = target(it); if (t.length) { op = { item: it.id, zone: t[0].id }; break; }
        }
      }
      if (!op) break;
      drop(lv, s, op.item, op.zone); ops.push(op);
    }
    return ops;
  }
  // นำ plan มาลองทำจนจบ คืน true ถ้าผ่านและไม่ติดข้อผิดเลย
  function solves(lv) {
    const st = init(lv), ops = plan(lv, st);
    for (const o of ops) { const r = drop(lv, st, o.item, o.zone); if (!r.ok) return false; }
    return status(lv, st).done;
  }

  const api = { GROUPS, PORTS, PARTS, DEV, NEEDS, mkItem, mkStep, zoneOf, itemOf, init, clone, occ, fits, whyWrong, canDrop, drop, itemOk, wrongPlaced, status, needed, plan, solves };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PT = api;
})(typeof window !== 'undefined' ? window : globalThis);
