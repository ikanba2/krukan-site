/* Techno Parts: 4 โลก โลกละ 10 ด่านคล้ายกันไล่ระดับ สร้างด้วยสูตร + seed แล้วตรวจด้วย engine.plan()
   makeLevel(โลก, ด่าน, seed) คืนด่าน: { world, id, title, kind, desc, zones, items, checks, pre, labels, ... }
   ด่านปกติใช้ seed ตายตัว (ทุกคนเจอด่านเดียวกัน) ส่วน 'ฝึกสุ่ม' ใช้ seed สุ่ม ได้อุปกรณ์/ลูกค้าต่างกันแต่โครงเหมือนด่านนั้น
   โลก 1 จัดกลุ่มอุปกรณ์ (sort) · โลก 2 เสียบสายให้ถูกช่อง (plug) · โลก 3 ประกอบเครื่อง (build, order) · โลก 4 ลูกค้าสั่งงาน (job) และซ่อมเครื่อง (fix) */
(function (root) {
  'use strict';
  const E = typeof require !== 'undefined' ? require('./engine.js') : root.PT;
  const { DEV, GROUPS, PORTS, PARTS, NEEDS, mkItem, mkStep } = E;
  const rngOf = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const shuffle = (a, rng) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pickOne = (a, rng) => a[Math.floor(rng() * a.length)];

  const WORLDS = [
    { id: 1, grade: 'ป.2', skill: 'จัดกลุ่มอุปกรณ์', title: 'รู้จักอุปกรณ์', hero: 's0', bg: 'sky', boss: 24, color: '#22b45a',
      desc: 'ลากอุปกรณ์ไปใส่ถังให้ถูกกลุ่ม ว่าเป็นส่วนรับข้อมูลเข้า ส่วนแสดงผล หรือส่วนเก็บข้อมูล',
      concept: 'คอมพิวเตอร์ทำงานเป็นขั้น ๆ คือรับข้อมูลเข้า ประมวลผล แสดงผล และเก็บข้อมูล อุปกรณ์แต่ละชิ้นมีหน้าที่ของตัวเอง' },
    { id: 2, grade: 'ป.2–ป.3', skill: 'เสียบสายให้ถูกช่อง', title: 'เสียบสายให้ถูกช่อง', hero: 's2', bg: 'nature', boss: 29, color: '#2b8cff',
      desc: 'ลากสายของอุปกรณ์ไปเสียบที่ช่องหลังเครื่องให้ตรงชนิด ดูรูปร่างหัวสายและสีของช่อง',
      concept: 'ช่องเสียบแต่ละแบบรูปร่างไม่เหมือนกัน หัวสายต้องตรงกับช่อง เสียงออกเป็นสีเขียว ไมค์เป็นสีชมพู ช่อง USB เสียบอุปกรณ์เล็ก ๆ ได้หลายชิ้น' },
    { id: 3, grade: 'ป.3–ป.4', skill: 'ประกอบเครื่องคอม', title: 'ประกอบเครื่องคอม', hero: 's3', bg: 'sun', boss: 28, color: '#ff8a2b',
      desc: 'ประกอบชิ้นส่วนเข้าไปในตัวเครื่อง และเรียงขั้นตอนประกอบกับเปิดปิดเครื่องให้ถูกลำดับ',
      concept: 'ในตัวเครื่องมีซีพียูเป็นสมอง แรมเป็นที่ทำงานชั่วคราว ที่เก็บไฟล์เก็บถาวร แหล่งจ่ายไฟส่งไฟ พัดลมระบายความร้อน และการ์ดจอสร้างภาพ' },
    { id: 4, grade: 'ป.3–ป.4', skill: 'ลูกค้าสั่งงานและซ่อมเครื่อง', title: 'ลูกค้าสั่งงานและซ่อมเครื่อง', hero: 's1', bg: 'reef', boss: 30, color: '#9b5cff',
      desc: 'ฟังว่าลูกค้าอยากทำอะไร แล้วเลือกอุปกรณ์ที่ใช้ได้จริง จากนั้นหาสาเหตุที่เครื่องมีปัญหาแล้วซ่อมให้ใช้ได้',
      concept: 'เลือกอุปกรณ์ตามงานที่ต้องทำ ถ้าเครื่องมีปัญหาให้ดูก่อนว่าสายหลุดหรือเสียบผิดช่องหรือเปล่า เพราะเป็นสาเหตุที่เจอบ่อยที่สุด' }
  ];
  const TITLES = [
    ['รับเข้า หรือ แสดงผล', 'หกชิ้นสองกลุ่ม', 'แสดงผล หรือ เก็บข้อมูล', 'รับเข้า หรือ เก็บข้อมูล', 'สามกลุ่มสามถัง', 'อุปกรณ์หลอกตา', 'เจอสมองของเครื่อง', 'ฮาร์ดแวร์ กับ ซอฟต์แวร์', 'จัดสี่ถังให้เรียบร้อย', 'ด่านบอส: ตัวป่วนห้าถัง'],
    ['ต่อจอภาพก่อน', 'จอ แป้นพิมพ์ เมาส์', 'ช่องสีเขียวสำหรับเสียง', 'เขียวหรือชมพู', 'สายอินเทอร์เน็ต', 'USB มีหลายช่อง', 'ดูแค่สัญลักษณ์', 'ช่องเหมือนกันหมด', 'ต่อให้ครบเก้าช่อง', 'ด่านบอส: หลังเครื่องสับสน'],
    ['ใส่สมองของเครื่อง', 'เพิ่มแหล่งจ่ายไฟ', 'ติดพัดลม', 'ใส่การ์ดจอ', 'ฟังคำใบ้ก่อนใส่', 'แรมสองแท่ง', 'ประกอบอย่างปลอดภัย', 'เปิด ใช้งาน และปิดเครื่อง', 'ชิ้นส่วนหลอกตา', 'ด่านบอส: ประกอบเครื่องเต็มรูปแบบ'],
    ['พิมพ์รายงานส่งครู', 'ฟังเพลงเพราะ ๆ', 'วิดีโอคอลหาคุณยาย', 'สแกนรูปเก่า', 'เปิดร้านขายของ', 'เล่นเกมสนุก', 'ครูนำเสนอหน้าห้อง', 'เปิดเครื่องแล้วเงียบกริบ', 'จอดำและไม่มีเสียง', 'ด่านบอส: ซ่อมสามอาการ']
  ];
  const MON_NAME = { 12: 'สิงโตแผงทอง', 13: 'แกะสายฟ้า', 14: 'เต่ามอสส์', 15: 'ฟีนิกซ์เมฆ', 17: 'แมงกะพรุนโคม', 20: 'เห็ดยักษ์', 23: 'กระต่ายจันทร์', 24: 'นกยูงปริซึม', 25: 'หอยทากแนวปะการัง', 26: 'หมูป่าหนอง', 28: 'จามรีหิน', 29: 'จระเข้โกงกาง', 30: 'กระเบนออโรรา', 31: 'กวางจันทร์' };
  const NORMAL = [12, 13, 14, 15, 17, 20, 23, 25, 26, 31];
  const monsterFor = (n, rng) => NORMAL[Math.floor(rng() * NORMAL.length)];

  /* ---------- โลก 1: จัดกลุ่มอุปกรณ์ ---------- */
  const POOL = {
    in: ['keyboard', 'mouse', 'mic', 'webcam', 'scanner', 'gamepad', 'pentablet', 'barcode'],
    out: ['monitor', 'speaker', 'headphones', 'printer', 'projector'],
    store: ['hdd', 'ssd', 'flash', 'sdcard', 'disc'],
    cpu: ['cpu'],
    sw: ['doc', 'paint', 'music', 'web', 'game', 'os']
  };
  const HARD = ['gamepad', 'pentablet', 'barcode', 'scanner', 'webcam', 'projector', 'sdcard', 'disc', 'headphones'];
  // ตารางด่าน: groups = ถังที่มี · per = จำนวนชิ้นต่อถัง · hwsw = ใช้ชื่อกลุ่ม ฮาร์ดแวร์/ซอฟต์แวร์ (hw รวมทุกส่วนที่จับต้องได้) · hard = จำนวนชิ้น "ยาก" ขั้นต่ำต่อถัง
  const SORT = [
    null,
    { groups: ['in', 'out'], per: [2, 2], hard: 0 },
    { groups: ['in', 'out'], per: [3, 3], hard: 0 },
    { groups: ['out', 'store'], per: [3, 3], hard: 0 },
    { groups: ['in', 'store'], per: [3, 3], hard: 0 },
    { groups: ['in', 'out', 'store'], per: [3, 3, 3], hard: 0 },
    { groups: ['in', 'out', 'store'], per: [4, 3, 3], hard: 2 },
    { groups: ['in', 'out', 'store', 'cpu'], per: [3, 2, 2, 1], hard: 1 },
    { groups: ['hw', 'sw'], per: [4, 4], hwsw: true, hard: 1 },
    { groups: ['in', 'out', 'store', 'sw'], per: [3, 3, 3, 3], hard: 1 },
    { groups: ['in', 'out', 'store', 'cpu', 'sw'], per: [4, 3, 3, 1, 3], hard: 2 }
  ];
  function sortLevel(n, rng) {
    const C = SORT[n], items = [], zones = [], checks = [];
    const take = (g, count, hard) => {
      const pool = POOL[g], hs = shuffle(pool.filter(d => HARD.includes(d)), rng), rest = shuffle(pool.filter(d => !HARD.includes(d)), rng);
      const pick = hs.slice(0, Math.min(hard, count)).concat(rest).concat(hs.slice(Math.min(hard, count)));
      return shuffle(pick.slice(0, count), rng);
    };
    let k = 0;
    C.groups.forEach((g, gi) => {
      let devs;
      if (C.hwsw && g === 'hw') { // ฮาร์ดแวร์: สุ่มจากหลายส่วนให้หลากหลาย
        const from = ['in', 'out', 'store', 'cpu'], all = []; from.forEach(h => shuffle(POOL[h], rng).slice(0, h === 'cpu' ? 1 : 2).forEach(d => all.push(d)));
        devs = shuffle(all, rng).slice(0, C.per[gi]);
        if (!devs.includes('cpu') && n === 8) devs[0] = 'cpu';
      } else devs = take(g, C.per[gi], C.hard);
      const ids = [];
      devs.forEach(d => { const id = 'i' + (k++); items.push(mkItem(id, d, { grp: C.hwsw ? (DEV[d].sw ? 'sw' : 'hw') : DEV[d].g })); ids.push(id); });
      zones.push({ id: 'bin_' + g, kind: 'bin', acc: { k: 'grp', v: g }, label: GROUPS[g].n, sub: GROUPS[g].s, color: GROUPS[g].color });
      checks.push({ text: 'ใส่' + GROUPS[g].n + 'ให้ครบ ' + ids.length + ' ชิ้น', items: ids });
    });
    const names = C.groups.map(g => GROUPS[g].n).join(' กับ ');
    return { kind: 'sort', desc: C.hwsw ? 'ลากของไปใส่ถังให้ถูก ฮาร์ดแวร์คือชิ้นส่วนที่จับต้องได้ ซอฟต์แวร์คือโปรแกรมที่จับต้องไม่ได้' : 'ลากอุปกรณ์ไปใส่ถังให้ถูกกลุ่ม: ' + names, zones, items: shuffle(items, rng), checks };
  }

  /* ---------- โลก 2 และ 4: เสียบสายหลังเครื่อง ---------- */
  const PORT_ZONES = {
    power: { id: 'power', kind: 'port', acc: { k: 'port', v: 'power' } }, hdmi: { id: 'hdmi', kind: 'port', acc: { k: 'port', v: 'hdmi' } },
    usb1: { id: 'usb1', kind: 'port', acc: { k: 'port', v: 'usb' } }, usb2: { id: 'usb2', kind: 'port', acc: { k: 'port', v: 'usb' } },
    usb3: { id: 'usb3', kind: 'port', acc: { k: 'port', v: 'usb' } }, usb4: { id: 'usb4', kind: 'port', acc: { k: 'port', v: 'usb' } },
    hdmi2: { id: 'hdmi2', kind: 'port', acc: { k: 'port', v: 'hdmi' } }, audio: { id: 'audio', kind: 'port', acc: { k: 'port', v: 'audio' } }, mic: { id: 'mic', kind: 'port', acc: { k: 'port', v: 'mic' } }, lan: { id: 'lan', kind: 'port', acc: { k: 'port', v: 'lan' } }
  };
  const portZones = ids => ids.map(id => Object.assign({ label: PORTS[PORT_ZONES[id].acc.v].n }, PORT_ZONES[id]));
  // ด่านเสียบสาย: ports = ช่องที่มี · devs = อุปกรณ์ ('?audio' = สุ่มลำโพงหรือหูฟัง '?usb' = สุ่มอุปกรณ์ USB) · labels = full|sym|none
  const PLUG = [
    null,
    { ports: ['power', 'hdmi', 'usb1', 'usb2'], devs: ['monitor', 'mouse', 'power'], labels: 'full' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2'], devs: ['monitor', 'keyboard', 'mouse', 'power'], labels: 'full' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2', 'audio'], devs: ['monitor', 'keyboard', 'mouse', 'speaker', 'power'], labels: 'full' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2', 'audio', 'mic'], devs: ['monitor', 'keyboard', 'mouse', '?audio', 'mic', 'power'], labels: 'full' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2', 'audio', 'mic', 'lan'], devs: ['monitor', 'keyboard', 'mouse', '?audio', 'mic', 'lan', 'power'], labels: 'full' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2', 'usb3', 'usb4'], devs: ['monitor', 'keyboard', 'mouse', 'printer', 'webcam', 'power'], labels: 'full' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2', 'usb3', 'audio', 'mic', 'lan'], devs: ['monitor', 'keyboard', 'mouse', 'printer', 'headphones', 'mic', 'lan', 'power'], labels: 'sym' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2', 'usb3', 'audio', 'mic', 'lan'], devs: ['monitor', '?usb', 'mouse', '?usb', '?audio', 'mic', 'lan', 'power'], labels: 'sym' },
    { ports: ['power', 'hdmi', 'usb1', 'usb2', 'usb3', 'usb4', 'audio', 'mic', 'lan'], devs: ['monitor', 'keyboard', 'mouse', '?usb', '?usb', '?audio', 'mic', 'lan', 'power'], labels: 'none' },
    { ports: ['power', 'hdmi', 'hdmi2', 'usb1', 'usb2', 'usb3', 'usb4', 'audio', 'mic', 'lan'], devs: ['monitor', 'keyboard', 'mouse', 'printer', '?usb', '?audio', 'mic', 'lan', 'power', 'projector'], labels: 'none' }
  ];
  const USBS = ['printer', 'webcam', 'scanner', 'gamepad', 'pentablet', 'barcode', 'flash'];
  function plugLevel(n, rng) {
    const C = PLUG[n], zones = portZones(C.ports), items = [], used = new Set(), usbPool = shuffle(USBS, rng);
    let k = 0;
    C.devs.forEach(d => {
      if (d === '?audio') d = pickOne(['speaker', 'headphones'], rng); else if (d === '?usb') { d = usbPool.find(x => !used.has(x)); }
      used.add(d); items.push(mkItem('i' + (k++), d, { port: DEV[d].port }));
    });
    // เช็กลิสต์จัดตามชนิดช่อง (ไม่เกิน 6 ข้อ): ต่ออุปกรณ์ที่ใช้ช่อง X ให้ครบ
    const checks = [], order = ['power', 'hdmi', 'usb', 'audio', 'mic', 'lan'];
    order.forEach(p => {
      const its = items.filter(i => i.f.port === p); if (!its.length) return;
      const names = its.map(i => i.n).join(' และ ');
      const text = p === 'usb' ? 'ต่ออุปกรณ์ที่ใช้ USB ให้ครบ ' + its.length + ' ชิ้น' : 'ต่อ' + names;
      checks.push({ text, items: its.map(i => i.id) });
    });
    return { kind: 'plug', labels: C.labels, desc: C.labels === 'none' ? 'ช่องหลังเครื่องไม่มีชื่อบอก ให้ดูรูปร่างช่องกับหัวสาย และสีของช่อง ลากสายไปเสียบให้ครบ' : 'ลากสายของอุปกรณ์ไปเสียบที่ช่องหลังเครื่องให้ตรงกับหัวสาย', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- โลก 4: ซ่อมเครื่อง (เสียบสายผิดหรือหลุด) ---------- */
  const FAULTS = {
    power: { dev: 'power', how: 'unplug', text: 'เปิดเครื่องแล้วไม่มีอะไรเกิดขึ้นเลย ไฟไม่ติด' },
    monitor: { dev: 'monitor', how: 'unplug', text: 'จอดำ ไม่มีภาพขึ้นเลย' },
    keyboard: { dev: 'keyboard', how: 'unplug', text: 'กดแป้นพิมพ์แล้วไม่มีตัวอักษรขึ้น' },
    mouse: { dev: 'mouse', how: 'unplug', text: 'ขยับเมาส์แล้วลูกศรไม่ขยับ' },
    lan: { dev: 'lan', how: 'unplug', text: 'เปิดเว็บไม่ได้ ไม่มีอินเทอร์เน็ต' },
    printer: { dev: 'printer', how: 'unplug', text: 'สั่งพิมพ์แล้วเครื่องพิมพ์ไม่ทำงาน' },
    webcam: { dev: 'webcam', how: 'unplug', text: 'เปิดกล้องแล้วไม่เห็นภาพตัวเอง' },
    speaker: { dev: 'speaker', how: 'wrong', at: 'mic', text: 'ลำโพงเงียบ ไม่มีเสียงออกมาเลย' }
  };
  // ด่านซ่อม: base = อุปกรณ์ที่เสียบถูกอยู่แล้ว (ตัดชิ้นที่ชน fault ออก) · faults = รายการอาการ
  const FIX = [
    null, null, null, null, null, null, null, null,
    { faults: ['power'], base: ['monitor', 'keyboard', 'mouse'], ports: ['power', 'hdmi', 'usb1', 'usb2', 'audio', 'mic'], labels: 'full' },
    { faults: ['monitor', 'speaker'], base: ['keyboard', 'mouse', 'power'], ports: ['power', 'hdmi', 'usb1', 'usb2', 'audio', 'mic'], labels: 'sym' },
    { faults: ['keyboard', 'speaker', 'monitor'], base: ['mouse', 'power', 'lan'], ports: ['power', 'hdmi', 'usb1', 'usb2', 'audio', 'mic', 'lan'], labels: 'none' }
  ];
  function fixLevel(n, rng) {
    const C = FIX[n], zones = portZones(C.ports), items = [], pre = {}, checks = []; let k = 0, usb = 1;
    const place = (dev, zoneId) => { const id = 'i' + (k++), it = mkItem(id, dev, { port: DEV[dev].port }); items.push(it); if (zoneId) pre[id] = zoneId; return id; };
    const zoneFor = dev => { const p = DEV[dev].port; if (p === 'usb') return 'usb' + (usb++); return p; };
    const faultDevs = new Set(C.faults.map(f => FAULTS[f].dev));
    C.base.forEach(d => { if (!faultDevs.has(d)) place(d, zoneFor(d)); });
    shuffle(C.faults, rng).forEach(f => {
      const F = FAULTS[f], id = place(F.dev, F.how === 'wrong' ? F.at : null);
      checks.push({ text: F.text, items: [id] });
    });
    // เก็บเช็กลิสต์ตามลำดับอาการเดิมในตาราง
    checks.sort((a, b) => C.faults.findIndex(f => FAULTS[f].text === a.text) - C.faults.findIndex(f => FAULTS[f].text === b.text));
    const sym = checks.map(c => c.text).join(' · ');
    return { kind: 'fix', labels: C.labels, symptom: sym, desc: 'เครื่องของลูกค้ามีปัญหา: ' + checks.length + ' อย่าง ดูสายหลังเครื่องว่าอะไรหลุดหรือเสียบผิดช่อง แล้วแก้ให้ใช้ได้', zones, items, pre, checks };
  }

  /* ---------- โลก 3: ประกอบชิ้นส่วนเข้าเครื่อง ---------- */
  const SLOT = {
    cpu: { id: 'cpu', kind: 'slot', acc: { k: 'part', v: 'cpu' } }, ram1: { id: 'ram1', kind: 'slot', acc: { k: 'part', v: 'ram' } }, ram2: { id: 'ram2', kind: 'slot', acc: { k: 'part', v: 'ram' } },
    st1: { id: 'st1', kind: 'slot', acc: { k: 'part', v: 'store' } }, st2: { id: 'st2', kind: 'slot', acc: { k: 'part', v: 'store' } }, psu: { id: 'psu', kind: 'slot', acc: { k: 'part', v: 'psu' } },
    fan: { id: 'fan', kind: 'slot', acc: { k: 'part', v: 'fan' } }, gpu: { id: 'gpu', kind: 'slot', acc: { k: 'part', v: 'gpu' } }
  };
  const CLUE = { cpu: 'สมองของเครื่อง', ram: 'ที่ทำงานชั่วคราว', store: 'เก็บไฟล์ถาวร', psu: 'ส่งไฟให้ทุกชิ้น', fan: 'ไล่ความร้อน', gpu: 'สร้างภาพบนจอ' };
  const BUILD = [
    null,
    { slots: ['cpu', 'ram1', 'st1'], devs: ['cpu', 'ram', '?store'], clue: false, dist: [] },
    { slots: ['cpu', 'ram1', 'st1', 'psu'], devs: ['cpu', 'ram', '?store', 'psu'], clue: false, dist: [] },
    { slots: ['cpu', 'ram1', 'st1', 'psu', 'fan'], devs: ['cpu', 'ram', '?store', 'psu', 'fan'], clue: false, dist: [] },
    { slots: ['cpu', 'ram1', 'st1', 'psu', 'fan', 'gpu'], devs: ['cpu', 'ram', '?store', 'psu', 'fan', 'gpu'], clue: false, dist: ['monitor'] },
    { slots: ['cpu', 'ram1', 'st1', 'psu', 'fan', 'gpu'], devs: ['cpu', 'ram', '?store', 'psu', 'fan', 'gpu'], clue: true, dist: ['keyboard'] },
    { slots: ['cpu', 'ram1', 'ram2', 'st1', 'st2', 'psu'], devs: ['cpu', 'ram', 'ram', 'ssd', 'hdd', 'psu'], clue: true, dist: ['mouse'] },
    null, null,
    { slots: ['cpu', 'ram1', 'ram2', 'st1', 'st2', 'psu', 'fan', 'gpu'], devs: ['cpu', 'ram', 'ram', 'ssd', 'hdd', 'psu', 'fan', 'gpu'], clue: true, dist: ['monitor', 'keyboard', 'speaker'] },
    { slots: ['cpu', 'ram1', 'ram2', 'st1', 'st2', 'psu', 'fan', 'gpu'], devs: ['cpu', 'ram', 'ram', 'ssd', 'hdd', 'psu', 'fan', 'gpu'], clue: true, dist: ['monitor', 'keyboard', 'mouse', 'printer', 'flash'] }
  ];
  function buildLevel(n, rng) {
    const C = BUILD[n], items = [], checks = []; let k = 0;
    const zones = C.slots.map(id => Object.assign({ label: PARTS[SLOT[id].acc.v].n.replace(/ \(.*\)/, ''), clue: CLUE[SLOT[id].acc.v] }, SLOT[id]));
    C.devs.forEach(d => { if (d === '?store') d = pickOne(['ssd', 'hdd'], rng); items.push(mkItem('i' + (k++), d, { part: DEV[d].part })); });
    C.dist.forEach(d => items.push(mkItem('i' + (k++), d, {})));
    const kinds = []; items.forEach(i => { if (i.f.part && !kinds.includes(i.f.part)) kinds.push(i.f.part); });
    kinds.forEach(p => {
      const its = items.filter(i => i.f.part === p), P = PARTS[p];
      checks.push({ text: 'ใส่' + P.n.replace(/ \(.*\)/, '') + (its.length > 1 ? ' ' + its.length + ' ชิ้น' : '') + ' (' + CLUE[p] + ')', items: its.map(i => i.id) });
    });
    return { kind: 'build', clue: C.clue, desc: C.clue ? 'ช่องไม่บอกชื่อชิ้นส่วน บอกแค่หน้าที่ อ่านหน้าที่แล้วเลือกชิ้นส่วนที่ทำหน้าที่นั้นไปใส่ให้ถูกช่อง' : 'ลากชิ้นส่วนไปใส่ช่องในตัวเครื่องให้ตรงชื่อ', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- โลก 3: เรียงขั้นตอน ---------- */
  const SEQS = {
    assemble: { title: 'ประกอบเครื่องอย่างปลอดภัย', steps: [['ปิดเครื่องและถอดปลั๊กไฟออก', 'ต้องถอดปลั๊กก่อนเปิดฝาเสมอ กันไฟดูด'], ['เปิดฝาข้างตัวเครื่อง', 'ต้องเปิดฝาก่อนถึงจะใส่ชิ้นส่วนได้'], ['ใส่ชิ้นส่วนเข้าช่องให้ครบ', 'ใส่ตอนไม่มีไฟเข้าเครื่อง ปลอดภัยต่อชิ้นส่วน'], ['ปิดฝาตัวเครื่อง', 'ปิดฝาก่อนเสียบไฟ จะได้ไม่มีอะไรหล่นเข้าไป'], ['เสียบปลั๊กไฟแล้วเปิดเครื่อง', 'ทำเป็นขั้นสุดท้าย เมื่อทุกอย่างเรียบร้อยแล้ว']] },
    cycle: { title: 'เปิด ใช้งาน และปิดเครื่อง', steps: [['เสียบปลั๊กไฟ', 'ต้องมีไฟเข้าก่อนถึงจะเปิดเครื่องได้'], ['กดปุ่มเปิดเครื่อง', 'สั่งให้เครื่องเริ่มทำงาน'], ['รอจนเข้าหน้าจอหลัก', 'ต้องรอให้ระบบพร้อมก่อนใช้งาน'], ['ทำงานที่ต้องการ', 'เมื่อเครื่องพร้อมก็ใช้งานได้'], ['บันทึกงานแล้วปิดโปรแกรม', 'บันทึกก่อนปิด งานจะได้ไม่หาย'], ['เลือกคำสั่งปิดเครื่องในเมนู', 'ให้เครื่องปิดตัวเองอย่างเรียบร้อย'], ['รอจนหน้าจอดับ', 'รอให้เครื่องปิดสนิทก่อนค่อยถอดปลั๊ก']] },
    boot: { title: 'เปิดเครื่องใช้งาน', steps: [['เสียบปลั๊กไฟ', 'ต้องมีไฟเข้าก่อน'], ['เปิดจอภาพ', 'เปิดจอไว้ก่อนจะได้เห็นภาพตอนเครื่องเริ่มทำงาน'], ['กดปุ่มเปิดเครื่อง', 'สั่งให้เครื่องเริ่มทำงาน'], ['รอจนเข้าหน้าจอหลัก', 'ต้องรอให้ระบบพร้อมก่อน'], ['เปิดโปรแกรมที่ต้องการใช้', 'เริ่มใช้งานได้เมื่อเครื่องพร้อม']] },
    shutdown: { title: 'ปิดเครื่องให้ถูกวิธี', steps: [['บันทึกงานที่ทำค้างไว้', 'ถ้าไม่บันทึก งานอาจหายไป'], ['ปิดโปรแกรมที่เปิดอยู่', 'ปิดโปรแกรมก่อนสั่งปิดเครื่อง'], ['เลือกคำสั่งปิดเครื่องในเมนู', 'ให้เครื่องปิดตัวเองอย่างเรียบร้อย'], ['รอจนหน้าจอดับ', 'รอให้เครื่องปิดสนิทก่อน'], ['ปิดสวิตช์ไฟและถอดปลั๊ก', 'ทำเป็นขั้นสุดท้ายเมื่อไม่ใช้เครื่องแล้ว']] }
  };
  function orderLevel(n, rng, seeded) {
    const key = !seeded ? (n === 7 ? 'assemble' : 'cycle') : pickOne(['assemble', 'cycle', 'boot', 'shutdown'], rng), S = SEQS[key], items = [], zones = [];
    S.steps.forEach((s, i) => { items.push(mkStep('i' + i, s[0], i + 1, s[1])); zones.push({ id: 's' + (i + 1), kind: 'step', acc: { k: 'step', v: i + 1 }, label: 'ขั้นที่ ' + (i + 1) }); });
    return { kind: 'order', seq: key, desc: S.title + ' ลากการ์ดไปวางตามลำดับขั้นตอน ขั้นที่ 1 อยู่บนสุด', zones, items: shuffle(items, rng), checks: [{ text: 'เรียงให้ถูกครบ ' + items.length + ' ขั้น', items: items.map(i => i.id) }] };
  }

  /* ---------- โลก 4: งานของลูกค้า ---------- */
  const JOBS = [
    { key: 'report', title: 'พิมพ์รายงานส่งครู', who: 'น้องฟ้า', line: 'หนูต้องพิมพ์รายงานส่งครู ต้องมองเห็นตัวหนังสือ พิมพ์เอง แล้วสั่งพิมพ์ออกมาเป็นกระดาษด้วยค่ะ', needs: ['screen', 'type', 'print'] },
    { key: 'music', title: 'ฟังเพลงเพราะ ๆ', who: 'ลุงสมศักดิ์', line: 'ลุงอยากเปิดเพลงฟังตอนทำสวน ต้องมีของไว้ชี้เลือกเพลงบนจอ และต้องได้ยินเสียงเพลงด้วย', needs: ['screen', 'point', 'sound'] },
    { key: 'video', title: 'วิดีโอคอลหาคุณยาย', who: 'น้องเมฆ', line: 'ผมอยากวิดีโอคอลคุยกับคุณยาย ต้องให้ยายเห็นหน้าผม ได้ยินเสียงผมพูด และผมต้องได้ยินเสียงยายด้วย', needs: ['screen', 'cam', 'micin', 'sound'] },
    { key: 'scan', title: 'สแกนรูปเก่าเก็บไว้', who: 'คุณป้าวันเพ็ญ', line: 'ป้าอยากเอารูปถ่ายเก่ามาเก็บในเครื่อง ต้องดูรูปบนจอ ชี้เลือกรูป และเอาไฟล์ไปฝากหลานโดยพกไปได้', needs: ['screen', 'scan', 'point', 'save'] },
    { key: 'shop', title: 'เปิดร้านขายของ', who: 'พี่ต้น', line: 'พี่เปิดร้านขนม ต้องอ่านรหัสแท่งบนสินค้าตอนคิดเงิน พิมพ์ชื่อลูกค้าได้ ดูยอดบนจอ และพิมพ์ใบเสร็จให้ลูกค้า', needs: ['screen', 'code', 'type', 'print'] },
    { key: 'game', title: 'เล่นเกมสนุก', who: 'น้องไอซ์', line: 'หนูอยากเล่นเกมแข่งรถ ต้องมีจอดูภาพ ต้องมีของไว้บังคับรถ และอยากได้ยินเสียงเครื่องยนต์ด้วย', needs: ['screen', 'play', 'sound'] },
    { key: 'present', title: 'ครูนำเสนอหน้าห้อง', who: 'ครูจิตรา', line: 'ครูจะสอนนักเรียนทั้งห้อง ต้องฉายภาพขึ้นจอใหญ่ให้ทุกคนเห็น ใช้เมาส์เปลี่ยนสไลด์ และเปิดเสียงประกอบ', needs: ['big', 'point', 'sound'], xwhy: { monitor: 'จอภาพเล็กเกินไป คนทั้งห้องมองไม่เห็น ครูต้องการของที่ฉายขึ้นจอใหญ่' } }
  ];
  const JOB_FACE = { report: 0, music: 1, video: 2, scan: 3, shop: 4, game: 5, present: 0 };
  function jobLevel(n, rng) {
    const J = JOBS[n - 1], items = [], checks = []; let k = 0, dist = [3, 3, 4, 4, 4, 5, 5][n - 1];
    const inJob = new Set();
    J.needs.forEach(nd => {
      const devs = NEEDS[nd].devs, main = devs.length > 1 && n >= 2 ? devs.slice() : [pickOne(devs, rng)], ids = [];
      main.forEach(d => { const id = 'i' + (k++); items.push(mkItem(id, d, { need: nd })); ids.push(id); inJob.add(d); });
      checks.push({ text: NEEDS[nd].n, items: ids, any: true });
    });
    // ตัวหลอก: อุปกรณ์ที่งานนี้ไม่ต้องการ (ไม่ซ้ำกับของที่ใช้ได้) ถ้ามีคำอธิบายพิเศษจะใส่ให้อยู่ในตัวหลอกก่อน
    const allNeedDevs = new Set(); Object.keys(NEEDS).forEach(nd => { if (J.needs.includes(nd)) NEEDS[nd].devs.forEach(d => allNeedDevs.add(d)); });
    let distPool = shuffle(['keyboard', 'mouse', 'mic', 'webcam', 'scanner', 'gamepad', 'pentablet', 'barcode', 'monitor', 'speaker', 'headphones', 'printer', 'projector', 'flash', 'sdcard'], rng).filter(d => !allNeedDevs.has(d));
    if (J.xwhy) Object.keys(J.xwhy).forEach(d => { distPool = [d].concat(distPool.filter(x => x !== d)); });
    distPool.slice(0, dist).forEach(d => items.push(mkItem('i' + (k++), d, {})));
    const zones = [{ id: 'cart', kind: 'cart', acc: { k: 'need' }, label: 'ตะกร้าของลูกค้า', cap: 99 }];
    return { kind: 'job', xwhy: J.xwhy || null, job: { key: J.key, who: J.who, line: J.line, face: JOB_FACE[J.key] }, desc: J.who + ': “' + J.line + '”', zones, items: shuffle(items, rng), checks };
  }

  /* ---------- สร้างด่าน ---------- */
  const cache = {};
  function makeLevel(world, n, seed) {
    const seeded = seed != null, rng = rngOf(seeded ? seed : world * 1000 + n * 37 + 11);
    let L;
    if (world === 1) L = sortLevel(n, rng);
    else if (world === 2) L = plugLevel(n, rng);
    else if (world === 3) L = (n === 7 || n === 8) ? orderLevel(n, rng, seeded) : buildLevel(n, rng);
    else L = n <= 7 ? jobLevel(n, rng) : fixLevel(n, rng);
    L.world = world; L.id = n; L.title = TITLES[world - 1][n - 1]; L.seed = seeded ? seed : null;
    L.monsters = n === 10 ? [WORLDS[world - 1].boss] : [monsterFor(n, rng)]; L.boss = n === 10;
    L.zones.push({ id: 'tray', kind: 'tray' });
    L.par = E.plan(L, E.init(L)).length;
    return L;
  }
  function getLevel(world, n) { const k = world + ':' + n; return cache[k] || (cache[k] = makeLevel(world, n)); }

  const api = { WORLDS, TITLES, MON_NAME, NORMAL, SORT, PLUG, FIX, BUILD, JOBS, SEQS, FAULTS, CLUE, makeLevel, getLevel, rngOf, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PT_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
