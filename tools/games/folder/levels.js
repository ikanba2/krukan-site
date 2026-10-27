/* Techno Folder: 4 โลก (ป.2 สองโลก ป.3 สองโลก) โลกละ 10 ด่านคล้ายกันไล่ระดับ สร้างด้วยสูตร + seed แล้วตรวจด้วย engine.plan()
   makeLevel(โลก, ด่าน, seed) คืนด่าน: { world, id, title, kind, desc, hint, spec, bin, goals, checks, rules, quiz, start, monsters, boss }
   ด่านปกติใช้ seed ตายตัว (ทุกคนเจอด่านเดียวกัน) ส่วน 'ฝึกสุ่ม' ใช้ seed สุ่ม เนื้อหาไฟล์ต่างกันแต่โครงเหมือนด่านนั้น
   checks = รายการสิ่งที่ต้องทำที่แสดงเป็นเช็กลิสต์ในแผงภารกิจ: [{ text, goals:[ดัชนีเป้าหมาย...] }] */
(function (root) {
  'use strict';
  const E = typeof require !== 'undefined' ? require('./engine.js') : root.FD;
  const rngOf = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const shuffle = (a, rng) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pickOne = (a, rng) => a[Math.floor(rng() * a.length)];

  const WORLDS = [
    { id: 1, grade: 'ป.2', skill: 'จัดไฟล์เข้าโฟลเดอร์', title: 'รู้จักโฟลเดอร์', hero: 's0', bg: 'sky', boss: 12, color: '#2b8cff',
      desc: 'ลากไฟล์ที่เป็นเรื่องเดียวกันไปไว้ในโฟลเดอร์เดียวกัน ให้ห้องของเทคโนเป็นระเบียบ',
      concept: 'ไฟล์คือชิ้นงานที่บันทึกไว้ โฟลเดอร์คือที่เก็บไฟล์ เรื่องเดียวกันเก็บไว้ด้วยกัน พอจัดเป็นหมวดแล้วหาง่าย' },
    { id: 2, grade: 'ป.2', skill: 'สร้างและตั้งชื่อ', title: 'ตั้งชื่อให้หาเจอ', hero: 's2', bg: 'nature', boss: 14, color: '#22b45a',
      desc: 'สร้างโฟลเดอร์ใหม่ ตั้งชื่อให้บอกเรื่องข้างใน แล้วจัดไฟล์เข้าไป',
      concept: 'ชื่อที่ดีบอกได้ว่าข้างในมีอะไร ไม่ตั้งว่า ใหม่1 หรือ งาน และในที่เดียวกันห้ามมีชื่อซ้ำกัน' },
    { id: 3, grade: 'ป.3', skill: 'ย้าย คัดลอก ลบ', title: 'ย้าย คัดลอก ลบ', hero: 's3', bg: 'sun', boss: 13, color: '#ff8a2b',
      desc: 'เลือกให้ถูกว่าจะย้าย คัดลอก หรือลบ และกู้ไฟล์ที่ลบผิดกลับมาจากถังรีไซเคิล',
      concept: 'ย้ายคือเอาไฟล์ไปไว้ที่ใหม่ ที่เดิมจะไม่เหลือ คัดลอกคือทำสำเนา ต้นฉบับยังอยู่ ไฟล์ที่ลบจะไปรออยู่ในถังรีไซเคิล กู้คืนได้' },
    { id: 4, grade: 'ป.3', skill: 'โฟลเดอร์ซ้อนกัน', title: 'โฟลเดอร์ซ้อนกัน', hero: 's1', bg: 'reef', boss: 20, color: '#9b5cff',
      desc: 'เปิดเข้าไปในโฟลเดอร์ซ้อนกันหลายชั้น หาไฟล์ ย้ายไฟล์ และสร้างโฟลเดอร์ย่อย',
      concept: 'โฟลเดอร์ใส่โฟลเดอร์ได้เป็นชั้น ๆ ที่อยู่ของไฟล์บอกเส้นทางตั้งแต่เดสก์ท็อป เช่น เอกสาร › ป.3 › วิทยาศาสตร์' }
  ];
  const TITLES = [
    ['ไฟล์สองกอง', 'จัดหมวดหกไฟล์', 'สามโฟลเดอร์', 'เก้าไฟล์สามหมวด', 'ไอคอนหลอกตา', 'สี่โฟลเดอร์', 'สิบสองไฟล์', 'ไฟล์หลงที่', 'ตามหาไฟล์หลงทาง', 'ด่านบอส: ตัวรกใหญ่'],
    ['สร้างโฟลเดอร์แรก', 'สร้างแล้วจัดไฟล์', 'ชื่อใหม่ให้ตรงเรื่อง', 'สร้างสองโฟลเดอร์', 'เปลี่ยนชื่อสามใบ', 'สร้างสองแล้วจัด', 'ห้ามชื่อซ้ำ', 'สร้างสามโฟลเดอร์', 'ไฟล์ที่ไม่เข้าพวก', 'ด่านบอส: ตัวรกแห่งชื่อ'],
    ['ตัดแล้ววาง', 'คัดลอกส่งครู', 'ย้ายหรือคัดลอก', 'ลบไฟล์ที่ไม่ใช้', 'กู้คืนจากถังรีไซเคิล', 'ลบถูก กู้ถูก', 'คัดลอกหลายไฟล์', 'ย้ายทั้งหมด', 'งานผสม', 'ด่านบอส: ตัวรกในถังขยะ'],
    ['เปิดเข้าไปข้างใน', 'ไฟล์ซ่อนอยู่ข้างใน', 'ส่งไฟล์ลงชั้นลึก', 'สร้างโฟลเดอร์ย่อย', 'ที่อยู่ของไฟล์', 'จัดลงสองหมวดย่อย', 'ย้ายทั้งโฟลเดอร์', 'สร้างเป็นชั้น ๆ', 'คัดลอกจากชั้นลึก', 'ด่านบอส: เขาวงกตโฟลเดอร์']
  ];
  const MON_NAME = { 12: 'สิงโตแผงทอง', 13: 'แกะสายฟ้า', 14: 'เต่ามอสส์', 15: 'ฟีนิกซ์เมฆ', 17: 'แมงกะพรุนโคม', 20: 'เห็ดยักษ์', 23: 'กระต่ายจันทร์', 24: 'นกยูงปริซึม', 25: 'หอยทากแนวปะการัง', 26: 'หมูป่าหนอง', 28: 'จามรีหิน', 29: 'จระเข้โกงกาง', 30: 'กระเบนออโรรา', 31: 'กวางจันทร์', 32: 'ไรเดอร์ดำ' };
  const NORMAL = [12, 13, 14, 15, 17, 20, 23, 24, 25, 26, 28, 29, 30, 31];

  /* ---------- คลังเนื้อหา: หมวดที่ชื่อไฟล์บอกหมวดชัด ชนิดไอคอนกระจายกัน ---------- */
  // d = เอกสาร (doc) · p = รูป (img) · o = อื่น ๆ [ชื่อ, ไอคอน]
  const TOPICS = [
    { id: 'sci', folder: 'วิทยาศาสตร์', alts: ['วิทย์'], why: 'เป็นเรื่องวิทยาศาสตร์', school: true,
      d: ['การทดลองเรื่องพืช', 'น้ำมีสามสถานะ', 'แม่เหล็กน่ารู้', 'แรงและการเคลื่อนที่'], p: ['วงจรชีวิตกบ', 'ระบบสุริยะ', 'ร่างกายของเรา', 'ภาพกลุ่มดาว'], o: [['ภูเขาไฟระเบิด', 'vid'], ['เสียงและการได้ยิน', 'mus']] },
    { id: 'art', folder: 'ศิลปะ', alts: [], why: 'เป็นงานศิลปะ', school: true,
      d: ['ลายไทยน่ารู้', 'การ์ดวันแม่', 'ใบงานระบายสี', 'ขั้นตอนการปั้นดิน'], p: ['ภาพวาดดอกไม้', 'ภาพทะเลยามเย็น', 'ภาพวาดครอบครัว', 'ภาพสีน้ำบ้านนา'], o: [['พับกระดาษนกกระเรียน', 'vid'], ['วิธีวาดการ์ตูน', 'vid']] },
    { id: 'sport', folder: 'กีฬา', alts: [], why: 'เป็นเรื่องกีฬา', school: true,
      d: ['ตารางแข่งแบดมินตัน', 'กติกาวอลเลย์บอล', 'คะแนนวิ่งผลัด', 'รายชื่อนักกีฬาสี'], p: ['ภาพวันกีฬาสี', 'ภาพเหรียญรางวัล', 'ภาพสนามฟุตบอล', 'ภาพนักว่ายน้ำ'], o: [['ฟุตบอลวันกีฬาสี', 'vid'], ['กระโดดเชือก', 'vid']] },
    { id: 'thai', folder: 'ภาษาไทย', alts: [], why: 'เป็นเรื่องภาษาไทย', school: true,
      d: ['นิทานกระต่ายกับเต่า', 'คำคล้องจอง', 'สระในภาษาไทย', 'เขียนจดหมายถึงเพื่อน'], p: ['พยัญชนะไทย', 'บัตรคำศัพท์', 'ภาพประกอบนิทาน', 'แผนภาพคำควบกล้ำ'], o: [['อ่านออกเสียงบทกลอน', 'mus'], ['เพลงสระอะ', 'mus']] },
    { id: 'math', folder: 'คณิตศาสตร์', alts: ['คณิต'], why: 'เป็นเรื่องคณิตศาสตร์', school: true,
      d: ['สูตรคูณแม่ห้า', 'บวกเลขสองหลัก', 'โจทย์ปัญหาการลบ', 'เงินและการทอน'], p: ['รูปเรขาคณิต', 'อ่านเวลาจากนาฬิกา', 'ตารางสูตรคูณ', 'เส้นจำนวน'], o: [['เพลงสูตรคูณ', 'mus'], ['วิดีโอนับเลข', 'vid']] },
    { id: 'animal', folder: 'ภาพสัตว์', alts: [], why: 'เป็นภาพสัตว์', school: false,
      d: [], p: ['แมวสีส้ม', 'ช้างน้อย', 'ปลาทอง', 'นกแก้ว', 'กระต่ายขาว', 'เต่าทะเล', 'ลูกเป็ด', 'ม้าลาย'], o: [] },
    { id: 'food', folder: 'ภาพอาหาร', alts: [], why: 'เป็นภาพอาหาร', school: false,
      d: [], p: ['ข้าวผัดกะเพรา', 'ผลไม้รวม', 'ขนมครก', 'ไข่เจียว', 'ต้มยำกุ้ง', 'ข้าวเหนียวมะม่วง', 'น้ำส้มคั้น', 'ก๋วยเตี๋ยว'], o: [] },
    { id: 'music', folder: 'เพลง', alts: [], why: 'เป็นไฟล์เพลง', school: false,
      d: [], p: [], o: [['เพลงชาติไทย', 'mus'], ['เพลงลอยกระทง', 'mus'], ['เพลงช้าง', 'mus'], ['เพลงวันแม่', 'mus'], ['เพลงเด็กน้อย', 'mus'], ['เพลงปีใหม่', 'mus'], ['เพลงกล่อมเด็ก', 'mus'], ['เพลงวันครู', 'mus']] }
  ];
  const SEA = { id: 'sea', folder: 'ภาพสัตว์น้ำ', alts: [], why: 'เป็นภาพสัตว์น้ำ', p: ['ปลาการ์ตูน', 'ปลาโลมา', 'ปลาหมึก', 'ม้าน้ำ', 'ปูทะเล', 'กุ้งแม่น้ำ'], d: [], o: [] };
  const LAND = { id: 'land', folder: 'ภาพสัตว์', alts: [], why: 'เป็นภาพสัตว์บก', p: ['แมวสีส้ม', 'ช้างน้อย', 'กระต่ายขาว', 'ม้าลาย'], d: [], o: [] };
  const VAGUE_NAMES = ['ใหม่1', 'งาน', 'ไฟล์ของฉัน', 'ทดสอบ', 'asdf'];
  const ALL = t => t.d.map(n => [n, 'doc']).concat(t.p.map(n => [n, 'img']), t.o);
  // เลือกไฟล์ของหมวด t จำนวน n (onlyIcon = บังคับชนิดไอคอนเดียวกันทุกหมวดเพื่อให้ดูไอคอนอย่างเดียวไม่พอ)
  function takeFiles(t, n, rng, onlyIcon) {
    let pool = ALL(t); if (onlyIcon) { const f = pool.filter(x => x[1] === onlyIcon); if (f.length >= n) pool = f; }
    return shuffle(pool, rng).slice(0, n);
  }
  // หมวดที่เนื้อหาคาบเกี่ยวกัน (เช่น นิทานกระต่ายกับเต่า กับ ภาพสัตว์) ไม่ให้อยู่ในด่านเดียวกัน เพื่อไม่ให้เด็กสับสน
  const CONFLICT = { animal: ['sci', 'thai'], music: ['thai', 'math', 'sci', 'art'], sci: ['animal', 'music'], thai: ['animal', 'music'], math: ['music'], art: ['music'] };
  const pickTopics = (rng, k, o) => {
    o = o || {}; const pool = shuffle(TOPICS.filter(t => (!o.school || t.school) && !(o.not || []).includes(t.id)), rng), out = [];
    pool.forEach(t => { if (out.length < k && !out.some(x => (CONFLICT[t.id] || []).includes(x.id) || (CONFLICT[x.id] || []).includes(t.id))) out.push(t); });
    pool.forEach(t => { if (out.length < k && !out.includes(t)) out.push(t); });
    return out;
  };
  const D = (n, c, k) => ({ n, c: c || [], k });
  const Fl = (n, f, o) => Object.assign({ n, f }, o || {});

  /* ---------- ตัวช่วยสร้างด่าน ---------- */
  function newLevel(world, id, rng, kind) { return { world, id, title: TITLES[world - 1][id - 1], kind, spec: [], bin: [], goals: [], checks: [], rules: {}, quiz: [], start: 'root', visit0: [], boss: id === 10, desc: '', hint: '' }; }
  const goal = (L, g) => { L.goals.push(g); return L.goals.length - 1; };
  const check = (L, text, idx) => L.checks.push({ text, goals: [].concat(idx) });
  const names = t => [t.folder].concat(t.alts || []);
  function monstersFor(world, n, rng) {
    const out = []; let seen = {}; const want = n === 10 ? 1 : 1;
    for (let i = 0; out.length < want && i < 30; i++) { const m = NORMAL[(world * 5 + n * 3 + i * 7 + Math.floor(rng() * 3)) % NORMAL.length]; if (!seen[m]) { seen[m] = 1; out.push(m); } }
    return out;
  }
  const folderBad = (topics, self) => topics.filter(t => t !== self).map(t => t.folder);
  const vag = (rng, n) => shuffle(VAGUE_NAMES, rng).slice(0, n);

  /* ---------- โลก 1: จัดไฟล์ลงโฟลเดอร์ที่มีอยู่แล้ว ---------- */
  // o: { k โฟลเดอร์, n ไฟล์ต่อโฟลเดอร์, only ชนิดไอคอนบังคับ }
  function sortLevel(world, id, rng, o) {
    const L = newLevel(world, id, rng, 'sort'); L.rules.strict = true; L.rules.noNew = true;
    const topics = pickTopics(rng, o.k, o.school ? { school: true } : {}); const spec = [], loose = [];
    topics.forEach((t, i) => {
      spec.push(D(t.folder, [], 'f' + i));
      takeFiles(t, o.n, rng, o.only).forEach(([nm, ic], j) => loose.push(Fl(nm, ic, { k: 'x' + i + j, h: 'f' + i, w: t.why })));
    });
    L.spec = spec.concat(shuffle(loose, rng));
    topics.forEach((t, i) => {
      const idxs = []; loose.filter(x => x.h === 'f' + i).forEach(x => idxs.push(goal(L, { t: 'in', k: x.k, f: 'f' + i })));
      check(L, 'ใส่ไฟล์' + t.folder + 'ลงโฟลเดอร์ “' + t.folder + '” ให้ครบ ' + idxs.length + ' ไฟล์', idxs);
    });
    L.desc = o.only ? 'ไฟล์ทุกใบหน้าตาเหมือนกันหมด ให้อ่านชื่อไฟล์แล้วลากไปใส่โฟลเดอร์ที่เป็นเรื่องเดียวกัน' : 'อ่านชื่อไฟล์ แล้วลากไปวางบนโฟลเดอร์ที่เป็นเรื่องเดียวกัน';
    L.hint = 'อ่านชื่อไฟล์ให้ครบ แล้วคิดว่าเป็นเรื่องอะไร จากนั้นลากไฟล์ไปวางบนโฟลเดอร์ชื่อนั้น';
    return L;
  }
  // ด่านซ่อมโฟลเดอร์ที่มีไฟล์วางผิดหมวด o: { k, n, wrong, loose(ไฟล์ที่ยังไม่ได้จัดบนเดสก์ท็อป) }
  function fixLevel(world, id, rng, o) {
    const L = newLevel(world, id, rng, 'fix'); L.rules.strict = true; L.rules.noNew = true;
    const topics = pickTopics(rng, o.k, { school: true }); const per = topics.map((t, i) => takeFiles(t, o.n + (o.loose ? 1 : 0), rng).map(([nm, ic], j) => Fl(nm, ic, { k: 'x' + i + j, h: 'f' + i, w: t.why })));
    const inside = topics.map(() => []), loose = [];
    per.forEach((list, i) => list.forEach((f, j) => { if (j < o.n) inside[i].push(f); else loose.push(f); }));
    // สลับไฟล์ข้ามโฟลเดอร์ wrong ใบ (หมุนเป็นวงกลม)
    const w = Math.min(o.wrong, topics.length); const picks = []; for (let i = 0; i < w; i++) picks.push(inside[i].pop());
    for (let i = 0; i < w; i++) inside[(i + 1) % w].push(picks[i]);
    L.spec = topics.map((t, i) => D(t.folder, shuffle(inside[i], rng), 'f' + i)).concat(shuffle(loose, rng));
    topics.forEach((t, i) => {
      const idxs = []; per[i].forEach(f => idxs.push(goal(L, { t: 'in', k: f.k, f: 'f' + i })));
      check(L, 'โฟลเดอร์ “' + t.folder + '” มีแต่ไฟล์' + t.folder + ' ครบ ' + idxs.length + ' ไฟล์', idxs);
    });
    L.desc = o.loose ? 'บางโฟลเดอร์มีไฟล์ผิดหมวดปนอยู่ และมีไฟล์ที่ยังไม่ได้จัดบนเดสก์ท็อปด้วย เปิดโฟลเดอร์ดูข้างในแล้วจัดให้ถูก' : 'บางโฟลเดอร์มีไฟล์ผิดหมวดปนอยู่ เปิดโฟลเดอร์ดูข้างใน แล้วลากไฟล์ที่ผิดหมวดไปใส่โฟลเดอร์ที่ถูก';
    L.hint = 'ดับเบิลคลิกโฟลเดอร์เพื่อเปิดดู ไฟล์ที่ผิดหมวดให้ลากไปวางบนชื่อโฟลเดอร์ที่ถูกในแถบซ้ายมือ';
    return L;
  }

  /* ---------- โลก 2: สร้างและตั้งชื่อโฟลเดอร์ ---------- */
  // o: { newN โฟลเดอร์ที่ต้องสร้าง, per ไฟล์ต่อโฟลเดอร์ (0 = ไม่มีไฟล์), stray ไฟล์ที่ไม่เข้าพวกต้องไปไว้ในโฟลเดอร์ 'อื่นๆ', school }
  function createLevel(world, id, rng, o) {
    const L = newLevel(world, id, rng, 'create'); L.rules.strict = true; const topics = pickTopics(rng, o.newN + (o.stray ? 1 : 0), o.school ? { school: true } : {});
    const mine = topics.slice(0, o.newN), loose = []; const bad = t => folderBad(mine, t).concat(vag(rng, 3));
    mine.forEach((t, i) => { takeFiles(t, o.per, rng).forEach(([nm, ic], j) => loose.push(Fl(nm, ic, { k: 'x' + i + j, h: 'N' + i, w: t.why }))); });
    if (o.stray) { const s = topics[o.newN]; takeFiles(s, o.stray, rng).forEach(([nm, ic], j) => loose.push(Fl(nm, ic, { k: 'y' + j, h: 'Nz', w: 'ไม่เข้าพวกกับโฟลเดอร์อื่น' }))); }
    L.spec = shuffle(loose, rng); L.rules.noNew = false;
    mine.forEach((t, i) => {
      const gi = goal(L, { t: 'folder', p: 'root', names: names(t), key: 'N' + i, bad: bad(t) }); const idxs = [gi];
      loose.filter(x => x.h === 'N' + i).forEach(x => idxs.push(goal(L, { t: 'in', k: x.k, f: 'N' + i })));
      check(L, o.per ? 'สร้างโฟลเดอร์ให้ไฟล์เรื่องเดียวกับ “' + loose.find(x => x.h === 'N' + i).n + '” ตั้งชื่อให้ตรงเรื่อง แล้วเก็บไฟล์ ' + (idxs.length - 1) + ' ไฟล์' : 'สร้างโฟลเดอร์ใหม่สำหรับเก็บ' + t.folder + ' แล้วตั้งชื่อว่า “' + t.folder + '”', idxs);
    });
    if (o.stray) {
      const gi = goal(L, { t: 'folder', p: 'root', names: ['อื่นๆ', 'ไฟล์อื่นๆ'], key: 'Nz', bad: folderBad(mine, null).concat(vag(rng, 2)) }); const idxs = [gi];
      loose.filter(x => x.h === 'Nz').forEach(x => idxs.push(goal(L, { t: 'in', k: x.k, f: 'Nz' })));
      check(L, 'ไฟล์ที่ไม่เข้าพวก ' + o.stray + ' ไฟล์ ให้สร้างโฟลเดอร์ “อื่นๆ” แล้วเก็บไว้ที่นั่น', idxs);
    }
    L.desc = o.per ? (o.stray ? 'สร้างโฟลเดอร์ตามที่โจทย์บอก ตั้งชื่อให้ตรงเรื่อง แล้วจัดไฟล์ให้ถูก ไฟล์ที่ไม่เข้าพวกใครให้เก็บในโฟลเดอร์ “อื่นๆ”' : 'สร้างโฟลเดอร์ใหม่ ตั้งชื่อให้ตรงเรื่อง แล้วลากไฟล์ที่เป็นเรื่องเดียวกันเข้าไปเก็บ') : 'กดปุ่ม ใหม่ แล้วเลือก โฟลเดอร์ จากนั้นเลือกชื่อที่บอกเรื่องข้างใน';
    L.hint = 'กดปุ่ม ใหม่ เลือก โฟลเดอร์ แล้วเลือกชื่อที่ตรงกับเรื่องของไฟล์ ถ้าไม่แน่ใจให้ดูชื่อไฟล์ก่อน';
    return L;
  }
  // ด่านเปลี่ยนชื่อโฟลเดอร์ที่ชื่อว่า โฟลเดอร์ใหม่ ให้ตรงกับไฟล์ข้างใน o: { k, per }
  function renameLevel(world, id, rng, o) {
    const L = newLevel(world, id, rng, 'rename'); L.rules.strict = true; L.rules.noNew = true; const topics = pickTopics(rng, o.k, o.school ? { school: true } : {});
    topics.forEach((t, i) => {
      const nm = i === 0 ? 'โฟลเดอร์ใหม่' : 'โฟลเดอร์ใหม่ (' + (i + 1) + ')';
      L.spec.push(D(nm, takeFiles(t, o.per, rng).map(([f, ic], j) => Fl(f, ic, { k: 'x' + i + j })), 'p' + i));
      const gi = goal(L, { t: 'name', k: 'p' + i, names: names(t), bad: folderBad(topics, t).concat(vag(rng, 3)) });
      check(L, o.k === 1 ? 'เปิดดูข้างใน แล้วเปลี่ยนชื่อโฟลเดอร์ให้ตรงกับไฟล์ที่อยู่ข้างใน' : 'เปลี่ยนชื่อโฟลเดอร์ “' + nm + '” ให้ตรงกับไฟล์ข้างใน', gi);
    });
    L.desc = 'ชื่อ “โฟลเดอร์ใหม่” ไม่บอกอะไรเลย เปิดโฟลเดอร์ดูไฟล์ข้างใน แล้วเปลี่ยนชื่อให้บอกเรื่องที่เก็บอยู่';
    L.hint = 'ดับเบิลคลิกโฟลเดอร์เพื่อเปิดดูข้างใน แล้วย้อนกลับ คลิกโฟลเดอร์ กดปุ่ม เปลี่ยนชื่อ และเลือกชื่อที่ตรงเรื่อง';
    return L;
  }
  // ด่านห้ามตั้งชื่อซ้ำ: มีโฟลเดอร์ “ภาพสัตว์” อยู่แล้ว ต้องตั้งชื่อใหม่ให้ต่างกันสำหรับภาพสัตว์น้ำ
  function dupLevel(world, id, rng) {
    const L = newLevel(world, id, rng, 'dup'); L.rules.strict = true;
    const land = takeFiles(LAND, 3, rng).map(([nm, ic], j) => Fl(nm, ic, { k: 'L' + j })), sea = takeFiles(SEA, 3, rng).map(([nm, ic], j) => Fl(nm, ic, { k: 'x' + j, h: 'N0', w: SEA.why }));
    L.spec = [D('ภาพสัตว์', land, 'ex0')].concat(shuffle(sea, rng));
    const gi = goal(L, { t: 'folder', p: 'root', names: names(SEA), key: 'N0', bad: ['ภาพสัตว์'].concat(vag(rng, 2)) }); const idxs = [gi];
    sea.forEach(x => idxs.push(goal(L, { t: 'in', k: x.k, f: 'N0' })));
    check(L, 'สร้างโฟลเดอร์ใหม่สำหรับภาพสัตว์น้ำ 3 ภาพ ตั้งชื่อให้ต่างจากโฟลเดอร์ที่มีอยู่แล้ว แล้วจัดภาพเข้าไป', idxs);
    L.desc = 'มีโฟลเดอร์ “ภาพสัตว์” อยู่แล้ว ภาพสัตว์น้ำต้องไปอยู่โฟลเดอร์ใหม่ที่ชื่อต่างกัน เพราะที่เดียวกันตั้งชื่อซ้ำกันไม่ได้';
    L.hint = 'กด ใหม่ เลือก โฟลเดอร์ แล้วเลือกชื่อที่ไม่ซ้ำและบอกว่าเป็นสัตว์น้ำ จากนั้นลากภาพทั้ง 3 ใส่';
    return L;
  }
  // ด่านบอสโลก 2: เปลี่ยนชื่อโฟลเดอร์เดิม 2 ใบ + สร้างใหม่ 2 ใบ
  function bossNameLevel(world, id, rng) {
    const L = newLevel(world, id, rng, 'bossName'); L.rules.strict = true; const topics = pickTopics(rng, 4, { school: true }), loose = [];
    topics.slice(0, 2).forEach((t, i) => {
      const nm = i === 0 ? 'โฟลเดอร์ใหม่' : 'โฟลเดอร์ใหม่ (2)';
      L.spec.push(D(nm, takeFiles(t, 2, rng).map(([f, ic], j) => Fl(f, ic, { k: 'x' + i + j })), 'p' + i));
      const gi = goal(L, { t: 'name', k: 'p' + i, names: names(t), bad: folderBad(topics, t).concat(vag(rng, 2)) }); check(L, 'เปลี่ยนชื่อโฟลเดอร์ “' + nm + '” ให้ตรงกับไฟล์ข้างใน', gi);
    });
    topics.slice(2).forEach((t, i) => {
      takeFiles(t, 3, rng).forEach(([f, ic], j) => loose.push(Fl(f, ic, { k: 'z' + i + j, h: 'N' + i, w: t.why })));
      const gi = goal(L, { t: 'folder', p: 'root', names: names(t), key: 'N' + i, bad: folderBad(topics, t).concat(vag(rng, 2)) }); const idxs = [gi];
      loose.filter(x => x.h === 'N' + i).forEach(x => idxs.push(goal(L, { t: 'in', k: x.k, f: 'N' + i })));
      check(L, 'สร้างโฟลเดอร์ “' + t.folder + '” แล้วใส่ไฟล์ที่เป็นเรื่องนี้ 3 ไฟล์', idxs);
    });
    L.spec = L.spec.concat(shuffle(loose, rng));
    L.desc = 'ตัวรกใหญ่ปนทุกอย่างบนเดสก์ท็อป เปลี่ยนชื่อโฟลเดอร์เดิมให้ตรงเรื่อง สร้างโฟลเดอร์ใหม่ที่ขาด แล้วจัดไฟล์ที่เหลือให้ครบ';
    L.hint = 'ทำทีละเรื่อง เปิดโฟลเดอร์เดิมดูก่อนเปลี่ยนชื่อ แล้วค่อยสร้างโฟลเดอร์ใหม่และลากไฟล์เข้าไป';
    return L;
  }

  /* ---------- โลก 3: ย้าย คัดลอก ลบ กู้คืน ---------- */
  const JUNK = ['ภาพเบลอ', 'ไฟล์ซ้ำ', 'ร่างที่เลิกใช้', 'ทดสอบพิมพ์', 'ภาพถ่ายผิดพลาด', 'ไฟล์เสียหาย'];
  const GOOD = (rng, n) => { const t = shuffle(TOPICS.filter(x => x.school), rng); const out = []; for (let i = 0; out.length < n; i++) { const f = takeFiles(t[i % t.length], 1, rng)[0]; if (!out.some(o => o[0] === f[0])) out.push(f); } return out; };
  const TARGETS = ['งานของฉัน', 'ส่งครู', 'สำรอง', 'ห้องเรียน'];
  // o: { mv: [..], cp: [..] จำนวนไฟล์ที่ต้องย้าย/คัดลอก, junk, restore, keep, multi, all }
  function opsLevel(world, id, rng, o) {
    const L = newLevel(world, id, rng, 'ops'); const tgt = shuffle(TARGETS, rng);
    const fMv = tgt[0], fCp = tgt[1];
    const spec = []; const goodPool = GOOD(rng, (o.mv || 0) + (o.cp || 0) + (o.keep || 0) + (o.restore || 0) + (o.all || 0) + 2);
    const take = () => goodPool.shift();
    if (o.mv) spec.push(D(fMv, [], 'fm')); if (o.cp) spec.push(D(fCp, [], 'fc'));
    const mvs = [], cps = [], keeps = [], junks = [];
    for (let i = 0; i < (o.mv || 0); i++) { const [n, ic] = take(); mvs.push(Fl(n, ic, { k: 'm' + i, m: 'move' })); }
    for (let i = 0; i < (o.cp || 0); i++) { const [n, ic] = take(); cps.push(Fl(n, ic, { k: 'c' + i, m: 'copy' })); }
    for (let i = 0; i < (o.keep || 0); i++) { const [n, ic] = take(); keeps.push(Fl(n, ic, { k: 'k' + i, m: 'keep' })); }
    shuffle(JUNK, rng).slice(0, o.junk || 0).forEach((n, i) => junks.push(Fl(n, n.indexOf('ภาพ') === 0 ? 'img' : 'doc', { k: 'j' + i, m: 'junk' })));
    if (o.all) { // ย้ายทั้งหมดจากโฟลเดอร์ต้นทางไปปลายทาง
      const src = o.all; const files = []; for (let i = 0; i < src; i++) { const [n, ic] = take(); files.push(Fl(n, ic, { k: 'a' + i, m: 'move' })); }
      spec.push(D('ห้องเรียนเก่า', files, 'fa')); spec.push(D('ห้องเรียนใหม่', [], 'fb'));
      const idxs = files.map(f => goal(L, { t: 'in', k: f.k, f: 'fb' }));
      check(L, 'ย้ายไฟล์ทั้ง ' + src + ' ไฟล์จาก “ห้องเรียนเก่า” ไปไว้ใน “ห้องเรียนใหม่”', idxs);
      L.desc = 'ย้ายไฟล์ทุกไฟล์ในโฟลเดอร์ “ห้องเรียนเก่า” ไปไว้ใน “ห้องเรียนใหม่” ใช้ปุ่ม เลือกหลายไฟล์ จะเร็วกว่าย้ายทีละไฟล์';
      L.hint = 'เปิดโฟลเดอร์ ห้องเรียนเก่า กดปุ่ม เลือกหลายไฟล์ แตะทุกไฟล์ แล้วกด ตัด จากนั้นเปิดห้องเรียนใหม่แล้วกด วาง';
    }
    const restoreFiles = [];
    for (let i = 0; i < (o.restore || 0); i++) { const [n, ic] = take(); restoreFiles.push(Fl(n, ic, { k: 'r' + i, m: 'restore', from: 'fr' })); }
    const binJunk = [], usedJ = junks.map(f => f.n); shuffle(JUNK, rng).filter(n => !usedJ.includes(n)).slice(0, o.binJunk || 0).forEach((n, i) => binJunk.push(Fl(n, n.indexOf('ภาพ') === 0 ? 'img' : 'doc', { k: 'b' + i, m: 'junk', from: 'root' })));
    if (o.restore) spec.push(D('งานที่ต้องส่ง', [], 'fr'));
    L.spec = spec.concat(shuffle(mvs.concat(cps, keeps, junks), rng));
    L.bin = restoreFiles.concat(binJunk).map(f => Object.assign(f, { from: f.from }));
    // เป้าหมาย
    if (mvs.length) { const idxs = mvs.map(f => goal(L, { t: 'in', k: f.k, f: 'fm' })); check(L, mvs.length === 1 ? 'ย้าย “' + mvs[0].n + '” ไปไว้ในโฟลเดอร์ “' + fMv + '” (ที่เดิมต้องไม่เหลือไฟล์นี้)' : 'ย้าย ' + mvs.length + ' ไฟล์ ไปไว้ในโฟลเดอร์ “' + fMv + '” (ที่เดิมต้องไม่เหลือ)', idxs); }
    if (cps.length) { const idxs = cps.map(f => goal(L, { t: 'copyIn', k: f.k, f: 'fc' })); check(L, cps.length === 1 ? 'คัดลอก “' + cps[0].n + '” ไปส่งในโฟลเดอร์ “' + fCp + '” (ต้นฉบับต้องอยู่ที่เดิม)' : 'คัดลอก ' + cps.length + ' ไฟล์ ไปไว้ในโฟลเดอร์ “' + fCp + '” (ต้นฉบับต้องอยู่ที่เดิม)', idxs); }
    if (junks.length) { const idxs = junks.map(f => goal(L, { t: 'inBin', k: f.k })); check(L, 'ลบไฟล์ที่ไม่ใช้แล้ว ' + junks.length + ' ไฟล์ (ดูจากชื่อ) ไฟล์อื่นห้ามลบ', idxs); }
    if (restoreFiles.length) {
      const idxs = restoreFiles.map(f => goal(L, { t: 'in', k: f.k, f: 'fr' })); check(L, 'กู้ไฟล์ที่เผลอลบกลับมา ' + restoreFiles.length + ' ไฟล์ ให้กลับไปอยู่ในโฟลเดอร์ “งานที่ต้องส่ง”', idxs);
    }
    const parts = []; if (mvs.length) parts.push('ย้าย'); if (cps.length) parts.push('คัดลอก'); if (junks.length) parts.push('ลบ'); if (restoreFiles.length) parts.push('กู้คืน');
    if (!o.all) L.desc = parts.length === 1 && parts[0] === 'ย้าย' ? 'เลือกไฟล์ กดปุ่ม ตัด เปิดโฟลเดอร์ปลายทาง แล้วกด วาง ไฟล์จะย้ายไปอยู่ที่ใหม่' : 'อ่านโจทย์ให้ดีว่าไฟล์ไหนต้อง' + parts.join(' ไฟล์ไหนต้อง') + ' แล้วทำให้ครบ';
    if (!o.all) L.hint = parts.length === 1 && parts[0] === 'ย้าย' ? 'คลิกไฟล์ กดปุ่ม ตัด คลิกโฟลเดอร์ปลายทางแล้วเปิดเข้าไป กดปุ่ม วาง' : 'ย้ายใช้ ตัด และ วาง · คัดลอกใช้ คัดลอก และ วาง · ลบไปรอในถังรีไซเคิล · กู้คืนต้องเปิดถังรีไซเคิลก่อน';
    if (binJunk.length) L.desc += ' ไฟล์ที่ลบถูกแล้วและรออยู่ในถังรีไซเคิลอยู่แล้ว ปล่อยไว้ได้เลย ไม่ต้องกู้';
    L.rules.noNew = true; return L;
  }

  /* ---------- โลก 4: โฟลเดอร์ซ้อนกัน ---------- */
  // โครงโฟลเดอร์มาตรฐาน: เอกสาร › ป.2 · ป.3 › (วิทยาศาสตร์ · คณิตศาสตร์) · รูปภาพ › (สัตว์ · อาหาร) · ส่งครู
  function skeleton(o) {
    o = o || {};
    return [
      D('เอกสาร', [D('ป.2', [], 'p2'), D('ป.3', [D('วิทยาศาสตร์', o.sci || [], 'sci'), D('คณิตศาสตร์', o.math || [], 'math')].concat(o.p3 || []), 'p3')].concat(o.doc || []), 'doc'),
      D('รูปภาพ', (o.noSub ? [] : [D('สัตว์', o.ani || [], 'ani'), D('อาหาร', o.food || [], 'food')]).concat(o.pic || []), 'pic'),
      D('ส่งครู', [], 'send')
    ];
  }
  const CHAIN = { sci: 'เอกสาร › ป.3 › วิทยาศาสตร์', math: 'เอกสาร › ป.3 › คณิตศาสตร์', p3: 'เอกสาร › ป.3', p2: 'เอกสาร › ป.2', ani: 'รูปภาพ › สัตว์', food: 'รูปภาพ › อาหาร' };
  const SCI = TOPICS[0], MATH = TOPICS[4], FOOD = TOPICS[6], ANI = TOPICS[5];
  function nestLevel(world, id, rng) {
    const L = newLevel(world, id, rng, 'nest'); L.rules.noNew = true; L.rules.strict = false;
    const sciF = takeFiles(SCI, 4, rng), mathF = takeFiles(MATH, 4, rng), aniF = takeFiles(ANI, 4, rng), foodF = takeFiles(FOOD, 4, rng);
    const F = (a, i, o) => Fl(a[i][0], a[i][1], o);
    switch (id) {
      case 1: { // เปิดเข้าไปข้างใน
        L.spec = skeleton({ sci: [F(sciF, 0)] });
        const a = goal(L, { t: 'visit', f: 'doc' }), b = goal(L, { t: 'visit', f: 'p3' }), c = goal(L, { t: 'visit', f: 'sci' });
        check(L, 'เปิดโฟลเดอร์ “เอกสาร”', a); check(L, 'เปิดโฟลเดอร์ “ป.3” ที่อยู่ข้างใน “เอกสาร”', b); check(L, 'เปิดโฟลเดอร์ “วิทยาศาสตร์” ที่อยู่ข้างใน “ป.3”', c);
        L.desc = 'ดับเบิลคลิกโฟลเดอร์เพื่อเปิดเข้าไปข้างใน เปิดทีละชั้นจนถึงโฟลเดอร์ “วิทยาศาสตร์” ใช้ลูกศรย้อนกลับถ้าอยากถอยออกมา';
        L.hint = 'ดับเบิลคลิก “เอกสาร” ก่อน แล้วดับเบิลคลิก “ป.3” แล้วดับเบิลคลิก “วิทยาศาสตร์”'; break;
      }
      case 2: { // ไฟล์ซ่อนอยู่ข้างใน → ย้ายขึ้นมาบนเดสก์ท็อป
        const lost = Fl('ใบงานที่หาย', 'doc', { k: 'lost', m: 'move' }); L.spec = skeleton({ p3: [lost] });
        const g = goal(L, { t: 'in', k: 'lost', f: 'root' }); check(L, 'หาไฟล์ “ใบงานที่หาย” ให้เจอ แล้วย้ายออกมาไว้บนเดสก์ท็อป', g);
        L.desc = 'ไฟล์ “ใบงานที่หาย” ซ่อนอยู่ในโฟลเดอร์ซ้อนกัน เปิดหาให้เจอ แล้วย้ายออกมาไว้ที่เดสก์ท็อป';
        L.hint = 'ลองเปิด เอกสาร แล้วเปิด ป.3 จะเจอไฟล์ จากนั้นลากไฟล์ไปวางบน เดสก์ท็อป ในแถบซ้ายมือ'; break;
      }
      case 3: { // ส่งไฟล์ลงชั้นลึก
        const f = F(sciF, 0, { k: 'x0', m: 'move' }); L.spec = skeleton().concat([f]);
        const g = goal(L, { t: 'in', k: 'x0', f: 'sci' }); check(L, 'ย้าย “' + f.n + '” ไปไว้ใน เอกสาร › ป.3 › วิทยาศาสตร์', g);
        L.desc = 'ย้ายไฟล์บนเดสก์ท็อปไปไว้ในโฟลเดอร์ซ้อนกัน ใช้ ตัด แล้วเปิดเข้าไปถึงโฟลเดอร์ปลายทางแล้ว วาง หรือจะลากไปวางที่ชื่อโฟลเดอร์ในแถบซ้ายก็ได้';
        L.hint = 'ลากไฟล์ไปวางบนชื่อ “วิทยาศาสตร์” ในแถบซ้ายมือ หรือกด ตัด แล้วเปิดโฟลเดอร์ไปจนถึง วิทยาศาสตร์ แล้วกด วาง'; break;
      }
      case 4: { // สร้างโฟลเดอร์ย่อย
        const a = F(aniF, 0, { k: 'x0', h: 'N0', w: 'เป็นภาพสัตว์' }), b = F(aniF, 1, { k: 'x1', h: 'N0', w: 'เป็นภาพสัตว์' }); L.rules.strict = true; L.rules.noNew = false;
        L.spec = skeleton({ noSub: true }).concat([a, b]);
        const gi = goal(L, { t: 'folder', p: 'pic', names: ['สัตว์', 'ภาพสัตว์'], key: 'N0', bad: ['อาหาร', 'ใหม่1', 'งาน'] }); const i1 = goal(L, { t: 'in', k: 'x0', f: 'N0' }), i2 = goal(L, { t: 'in', k: 'x1', f: 'N0' });
        check(L, 'เปิดโฟลเดอร์ “รูปภาพ” สร้างโฟลเดอร์ย่อยชื่อ “สัตว์” ข้างใน แล้วย้ายภาพสัตว์ 2 ภาพเข้าไป', [gi, i1, i2]);
        L.desc = 'ต้องเปิดเข้าไปในโฟลเดอร์ “รูปภาพ” ก่อน แล้วค่อยสร้างโฟลเดอร์ใหม่ข้างใน จะได้โฟลเดอร์ซ้อนกัน จากนั้นย้ายภาพสัตว์เข้าไป';
        L.hint = 'ดับเบิลคลิก รูปภาพ แล้วกด ใหม่ เลือก โฟลเดอร์ เลือกชื่อ “สัตว์” แล้วกลับไปลากภาพสัตว์มาใส่'; break;
      }
      case 5: { // ที่อยู่ของไฟล์ (ตอบคำถาม)
        const key = shuffle(['sci', 'math', 'ani', 'food'], rng)[0]; const src = { sci: sciF, math: mathF, ani: aniF, food: foodF }[key]; const f = F(src, 0, { k: 'q0' });
        const parts = { sci: { sci: [f] }, math: { math: [f] }, ani: { ani: [f] }, food: { food: [f] } }[key]; L.spec = skeleton(parts);
        const path = CHAIN[key], wrong = shuffle(Object.keys(CHAIN).filter(k => k !== key), rng).slice(0, 2).map(k => CHAIN[k]);
        const choices = shuffle([path].concat(wrong), rng); L.quiz = [{ q: 'ไฟล์ “' + f.n + '” อยู่ที่ไหน', choices, ans: choices.indexOf(path) }];
        const deep = key === 'sci' || key === 'math'; const vs = (deep ? ['doc', 'p3', key] : ['pic', key]).map(k => goal(L, { t: 'visit', f: k })), g4 = goal(L, { t: 'answer', q: 0 });
        check(L, 'เปิดโฟลเดอร์ซ้อนกันเพื่อหาไฟล์ “' + f.n + '” ให้เจอ', vs); check(L, 'กดปุ่ม ตอบคำถาม แล้วเลือกที่อยู่ของไฟล์ให้ถูก', g4);
        L.desc = 'หาไฟล์ “' + f.n + '” ให้เจอ แล้วดูแถบที่อยู่ด้านบนว่าไฟล์อยู่ในโฟลเดอร์ไหนบ้าง จากนั้นกดปุ่ม ตอบคำถาม';
        L.hint = 'ที่อยู่คือชื่อโฟลเดอร์ที่ต้องเปิดไล่ไปทีละชั้น ดูได้จากแถบที่อยู่ด้านบนตอนเปิดไฟล์นี้อยู่'; break;
      }
      case 6: { // จัดลงสองหมวดย่อย
        const s1 = F(sciF, 0, { k: 'x0' }), s2 = F(sciF, 1, { k: 'x1' }), m1 = F(mathF, 0, { k: 'x2' }), m2 = F(mathF, 1, { k: 'x3' });
        L.rules.strict = true; s1.h = s2.h = 'sci'; m1.h = m2.h = 'math'; s1.w = s2.w = SCI.why; m1.w = m2.w = MATH.why;
        L.spec = skeleton().concat(shuffle([s1, s2, m1, m2], rng));
        const a = [goal(L, { t: 'in', k: 'x0', f: 'sci' }), goal(L, { t: 'in', k: 'x1', f: 'sci' })], b = [goal(L, { t: 'in', k: 'x2', f: 'math' }), goal(L, { t: 'in', k: 'x3', f: 'math' })];
        check(L, 'ย้ายไฟล์วิทยาศาสตร์ 2 ไฟล์ไปไว้ใน เอกสาร › ป.3 › วิทยาศาสตร์', a); check(L, 'ย้ายไฟล์คณิตศาสตร์ 2 ไฟล์ไปไว้ใน เอกสาร › ป.3 › คณิตศาสตร์', b);
        L.desc = 'ไฟล์ 4 ไฟล์บนเดสก์ท็อป ต้องไปอยู่โฟลเดอร์ย่อยของ ป.3 ให้ถูกวิชา ลากไปวางบนชื่อโฟลเดอร์ในแถบซ้ายมือได้เลย';
        L.hint = 'แถบซ้ายมือแสดงโฟลเดอร์ทุกชั้น ลากไฟล์ไปวางบนชื่อวิชาที่ตรงกันได้เลย'; break;
      }
      case 7: { // ย้ายทั้งโฟลเดอร์ (พร้อมไฟล์ข้างใน)
        const a = D('วิทยาศาสตร์ของฉัน', [F(sciF, 0, { k: 'x0' }), F(sciF, 1, { k: 'x1' })], 'ms'), b = D('คณิตศาสตร์ของฉัน', [F(mathF, 0, { k: 'x2' })], 'mm');
        L.spec = skeleton().concat([a, b]);
        const g1 = goal(L, { t: 'in', k: 'ms', f: 'p3' }), g2 = goal(L, { t: 'in', k: 'mm', f: 'p3' });
        check(L, 'ย้ายโฟลเดอร์ “วิทยาศาสตร์ของฉัน” ทั้งโฟลเดอร์ ไปไว้ใน เอกสาร › ป.3', g1); check(L, 'ย้ายโฟลเดอร์ “คณิตศาสตร์ของฉัน” ทั้งโฟลเดอร์ ไปไว้ใน เอกสาร › ป.3', g2);
        L.desc = 'ย้ายได้ทั้งโฟลเดอร์ ไฟล์ข้างในจะตามไปด้วย ลากโฟลเดอร์ไปวางบนชื่อ ป.3 ในแถบซ้ายมือ';
        L.hint = 'ลากโฟลเดอร์ทั้งอันไปวางบนชื่อ “ป.3” ในแถบซ้ายมือ ไฟล์ข้างในไม่ต้องย้ายแยก'; break;
      }
      case 8: { // สร้างเป็นชั้น ๆ
        const a = F(sciF, 0, { k: 'x0', h: 'N1', w: SCI.why }); L.rules.strict = true; L.rules.noNew = false;
        L.spec = [D('เอกสาร', [], 'doc'), D('ส่งครู', [], 'send'), a];
        const g1 = goal(L, { t: 'folder', p: 'doc', names: ['ป.3'], key: 'N0', bad: ['ป.2', 'ใหม่1', 'งาน'] }), g2 = goal(L, { t: 'folder', p: 'N0', names: names(SCI), key: 'N1', bad: ['คณิตศาสตร์', 'ใหม่1', 'งาน'] }), g3 = goal(L, { t: 'in', k: 'x0', f: 'N1' });
        check(L, 'ในโฟลเดอร์ “เอกสาร” สร้างโฟลเดอร์ “ป.3”', g1); check(L, 'ใน “ป.3” สร้างโฟลเดอร์ “วิทยาศาสตร์”', g2); check(L, 'ย้ายไฟล์ “' + a.n + '” เข้าไปเก็บใน “วิทยาศาสตร์”', g3);
        L.desc = 'สร้างโฟลเดอร์ซ้อนกันเป็นชั้น ๆ เอกสาร › ป.3 › วิทยาศาสตร์ แล้วย้ายไฟล์เข้าไปเก็บชั้นในสุด';
        L.hint = 'เปิด เอกสาร สร้าง ป.3 เปิด ป.3 สร้าง วิทยาศาสตร์ แล้วลากไฟล์ไปวางที่ชื่อ วิทยาศาสตร์ในแถบซ้าย'; break;
      }
      case 9: { // คัดลอกจากชั้นลึก
        const f = F(mathF, 0, { k: 'c0', m: 'copy' }); L.spec = skeleton({ math: [f] });
        const g = goal(L, { t: 'copyIn', k: 'c0', f: 'send' }); check(L, 'คัดลอก “' + f.n + '” จาก เอกสาร › ป.3 › คณิตศาสตร์ ไปส่งในโฟลเดอร์ “ส่งครู” (ต้นฉบับต้องอยู่ที่เดิม)', g);
        L.desc = 'ครูขอสำเนาไฟล์ที่อยู่ในโฟลเดอร์ชั้นลึก เปิดไปหาไฟล์ คัดลอก แล้วไปวางในโฟลเดอร์ “ส่งครู” ที่อยู่บนเดสก์ท็อป';
        L.hint = 'เปิด เอกสาร › ป.3 › คณิตศาสตร์ กดคัดลอก แล้วคลิก ส่งครู ในแถบซ้ายแล้วกด วาง'; break;
      }
      case 10: { // บอส: ผสม
        const lost = Fl('ใบงานที่หาย', 'doc', { k: 'lost', m: 'move' }), a = F(sciF, 0, { k: 'x0', h: 'sci', w: SCI.why }), b = F(mathF, 0, { k: 'x1', m: 'copy' }), c = F(aniF, 0, { k: 'x2', h: 'N0', w: ANI.why });
        L.rules.strict = true; L.rules.noNew = false;
        L.spec = skeleton({ p3: [lost], math: [b], noSub: true }).concat([a, c]);
        const g1 = goal(L, { t: 'in', k: 'lost', f: 'root' }), g2 = goal(L, { t: 'in', k: 'x0', f: 'sci' }), g3 = goal(L, { t: 'copyIn', k: 'x1', f: 'send' });
        const g4 = goal(L, { t: 'folder', p: 'pic', names: ['สัตว์', 'ภาพสัตว์'], key: 'N0', bad: ['อาหาร', 'ใหม่1', 'งาน'] }), g5 = goal(L, { t: 'in', k: 'x2', f: 'N0' });
        check(L, 'หา “ใบงานที่หาย” ใน เอกสาร › ป.3 แล้วย้ายออกมาไว้บนเดสก์ท็อป', g1); check(L, 'ย้าย “' + a.n + '” ไปไว้ใน เอกสาร › ป.3 › วิทยาศาสตร์', g2);
        check(L, 'คัดลอก “' + b.n + '” จากคณิตศาสตร์ ไปส่งใน “ส่งครู” (ต้นฉบับอยู่ที่เดิม)', g3); check(L, 'สร้างโฟลเดอร์ “สัตว์” ใน “รูปภาพ” แล้วย้ายภาพ “' + c.n + '” เข้าไป', [g4, g5]);
        L.desc = 'เขาวงกตโฟลเดอร์มีงานครบทุกแบบ หาไฟล์ ย้าย คัดลอก และสร้างโฟลเดอร์ย่อย ทำให้ครบทุกข้อเพื่อชนะตัวรก';
        L.hint = 'ทำทีละข้อตามรายการด้านขวา ข้อไหนไม่แน่ใจให้กดปุ่มคำใบ้'; break;
      }
    }
    return L;
  }

  /* ---------- ตารางด่านของแต่ละโลก ---------- */
  const PLAN = {
    1: [o => ({ f: 'sort', k: 2, n: 2 }), o => ({ f: 'sort', k: 2, n: 3 }), o => ({ f: 'sort', k: 3, n: 2 }), o => ({ f: 'sort', k: 3, n: 3 }), o => ({ f: 'sort', k: 3, n: 3, only: 'doc', school: true }),
      o => ({ f: 'sort', k: 4, n: 2 }), o => ({ f: 'sort', k: 4, n: 3 }), o => ({ f: 'fix', k: 3, n: 3, wrong: 2 }), o => ({ f: 'fix', k: 4, n: 3, wrong: 3 }), o => ({ f: 'fix', k: 4, n: 3, wrong: 3, loose: true })],
    2: [o => ({ f: 'create', newN: 1, per: 0 }), o => ({ f: 'create', newN: 1, per: 3 }), o => ({ f: 'rename', k: 1, per: 3 }), o => ({ f: 'create', newN: 2, per: 2 }), o => ({ f: 'rename', k: 3, per: 2 }),
      o => ({ f: 'create', newN: 2, per: 3 }), o => ({ f: 'dup' }), o => ({ f: 'create', newN: 3, per: 3 }), o => ({ f: 'create', newN: 3, per: 2, stray: 3 }), o => ({ f: 'bossName' })],
    3: [o => ({ f: 'ops', mv: 1 }), o => ({ f: 'ops', cp: 1 }), o => ({ f: 'ops', mv: 1, cp: 1 }), o => ({ f: 'ops', junk: 2, keep: 2 }), o => ({ f: 'ops', restore: 1, binJunk: 1 }),
      o => ({ f: 'ops', junk: 2, keep: 1, restore: 1, binJunk: 1 }), o => ({ f: 'ops', cp: 3 }), o => ({ f: 'ops', all: 4 }), o => ({ f: 'ops', mv: 2, cp: 1, junk: 1, restore: 1 }), o => ({ f: 'ops', mv: 2, cp: 2, junk: 2, keep: 1, restore: 1, binJunk: 1 })],
    4: [o => ({ f: 'nest' })]
  };

  const cache = {};
  function makeLevel(world, n, seed) {
    const rng = rngOf(seed != null ? seed : world * 1009 + n * 37 + 11);
    let L;
    if (world === 4) L = nestLevel(world, n, rng);
    else {
      const p = PLAN[world][n - 1]({});
      if (p.f === 'sort') L = sortLevel(world, n, rng, p);
      else if (p.f === 'fix') L = fixLevel(world, n, rng, p);
      else if (p.f === 'create') L = createLevel(world, n, rng, p);
      else if (p.f === 'rename') L = renameLevel(world, n, rng, p);
      else if (p.f === 'dup') L = dupLevel(world, n, rng);
      else if (p.f === 'bossName') L = bossNameLevel(world, n, rng);
      else L = opsLevel(world, n, rng, p);
    }
    L.monsters = n === 10 ? [WORLDS[world - 1].boss] : monstersFor(world, n, rng); L.seed = seed != null ? seed : null; L.world = world; L.id = n;
    L.par = E.plan(L, E.init(L)).length;
    return L;
  }
  function getLevel(world, n) { const k = world + ':' + n; return cache[k] || (cache[k] = makeLevel(world, n)); }

  const api = { WORLDS, TITLES, MON_NAME, NORMAL, TOPICS, makeLevel, getLevel, rngOf, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FD_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
