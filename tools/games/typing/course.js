/* Type Hero · โหมดหัดพิมพ์สัมผัส: บทเรียนไล่ตามแถวแป้นแบบหนังสือเรียนพิมพ์ดีด และตัวสร้างแบบฝึก (ตรรกะล้วน ทดสอบด้วย node test_engine.js)
   ลำดับบทภาษาไทยตามแบบฝึกพิมพ์แป้นภาษาไทย (thaiedu.net T01–T12): แป้นเหย้า ฟ ห ก ด ่ า ส ว › เ ้ ง › แถวบน › แถวล่าง › นิ้วนาง/ก้อย › … › ตัวบนแป้น Shift
   หลักพิมพ์สัมผัส: วางนิ้วที่แป้นเหย้า (ปุ่ม ด และ ่ มีปุ่มนูนให้คลำ) ก้าวนิ้วที่รับผิดชอบไปกดแล้วดึงกลับทันที นิ้วโป้งเคาะเว้นวรรค
   Shift ใช้นิ้วก้อยมือตรงข้ามกับตัวอักษร ไม่มองแป้นพิมพ์ ฝึกให้แม่นก่อนแล้วค่อยเร็ว
   แต่ละบทมี 4 ด่าน: 1 แป้นใหม่ (กดซ้ำทีละแป้น) · 2 ผสมแป้น (พยางค์สุ่มจากแป้นที่เรียนแล้ว) · 3 พิมพ์คำจริง · 4 พิมพ์สัมผัส (ตัวอักษรบนแป้นถูกซ่อน มีเป้าความเร็ว) */
(function (root) {
  'use strict';
  const TY = root.TY || (typeof require !== 'undefined' ? require('./engine.js') : null);
  // คำจริงที่คัดเองทีละบท ใช้เฉพาะแป้นที่เรียนถึงบทนั้น (test_engine.js ตรวจทุกคำ) บทหลังใช้คำของบทก่อนหน้าได้ด้วย
  const TH_WORDS = [
    'กา หา ว่า สาว ดาว หาว ว่าว กาว กวาด ฟาด หก กด สด สาด หาก กว่า วาด หวาด',
    'เก้า ห้า ฟ้า ก้าว เสา เงา ดวง ส่ง วาง สว่าง กว้าง ว่าง ห่าง เกา เดา เก่ง เหงา หาง ดวงดาว ห้าง วง กาง ห่วง เด้ง ง่วง เก้ง ก้าง',
    'ดี สี ดำ กำ วัว เรา รัก รัง สี่ วัด การ พวก ดารา เพราะ กรง ดัง สร้าง พี่ หัว หัก หวัง พัก ระวัง พัด สั่ง หัวเราะ ราก เร่ง พระ เกาะ เกราะ สระ สีดำ',
    'มา มี มือ แม่ พ่อ แมว แดง เสือ เรือ ทหาร ส้ม หอม มด มีด สอง สาม ทำ ม้า แกะ แพะ หิว วิ่ง ดื่ม ม่วง อ่าง ร้อง เอา ที่ ทาง ทอง เมือง ห้อง เสื้อ มาก อาหาร มะม่วง สีแดง กระทิง แมวดำ',
    'ไป ไฟ ใน นา นก นม ยา ผม ปี ให้ ไก่ แปด ป่า น้ำ ปาก ผัก กิน ดิน นาย ยาว ปีก นอน สวน แหวน ทราย ว่าย นิ้ว น้อง เดิน อ่าน แปรง ดินสอ เสียง ดอกไม้ ว่ายน้ำ หนังสือ สวย สนาม ใหม่ ไม้ ยิ้ม เปียก นิทาน ผีเสื้อ ยาย นาที ผ้า เรียน นักเรียน',
    'ฝา ใบ บน กบ ลม ลบ ปลา ลิง บาท บิน ลาย เล่น เพลง บ้าน ใบไม้ กล้วย เหลือง ผลไม้ ยางลบ แล้ว กลับ หลัง กลาง พลัง รับ สิบ เวลา ฝน รอบ ทะเล ฝาก บอล บันได ไฟฟ้า ร้องเพลง',
    'คน ตา ตก รถ ถุง ถือ ตัว ภาพ ยุง ต้ม สุก ติด ใคร ควาย เต่า ผึ้ง เต้น หนึ่ง ต้นไม้ ถนน ตลาด สมุด ความ ตอน ต่อ คลื่น ตาม ดึก ลึก นึก คิด ถาม ตอบ คำถาม ห้องสมุด ทุก ภาพวาด',
    'ใจ ไข่ ขวด จาน ขา เขา ขอ จับ ชอบ ขนม ชาย ขาย ขาว ช้าง ข้าว เขียน เขียว ขนมปัง ของ จาก ขึ้น เข้า ใช้ ข้าง จริง ชั้น ชุด จุด หัวใจ ช่วย ชิ้น กระจก หายใจ แขน จังหวะ ดีใจ ชาติ ชนะ ขวา เช้า ชาวนา',
    'ธง เธอ เด็ก โต๊ะ เจ็ด เป็ด เร็ว เล็ก แข็ง กระโดด กระเป๋า โรงเรียน ธงชาติ โรงอาหาร เป็น ก็ คุณ โลก เข็ม เย็น โดย เก็บ เห็น โมโห โอ่ง ตั๋ว ก๋วยเตี๋ยว เณร ประโยค โปรแกรม เข็มขัด',
    'ศาลา ระฆัง อากาศ ปรากฏ กฎ เศษ ศีรษะ บรรยากาศ รักษา ทิศทาง กบฏ อวกาศ ปริศนา เศร้า ขอโทษ เมฆ อัศวิน วิศวกร ภาษา พิเศษ กรุงเทพฯ ศิลปะ ชฎา ปฏิทิน ประเทศ กระดาษ',
    'งู ปู หนู ฉัน ลูก รูป หมู ปู่ ครู อยู่ ชมพู ยักษ์ นกฮูก ศูนย์ ลูกบอล ผู้เฒ่า สวนสัตว์ ฉลาด ฮีโร่ ข้อมูล โทรศัพท์ คอมพิวเตอร์ วิทยาศาสตร์ ถูก ฉาก สูง ดู รู้ ประตู มนุษย์ พูด ฝูง ภูเขา คู่ ศัพท์ ฉลอง จมูก ตุ๊กตา สุนัข',
    'โซ่ ฐาน ฤดู หญิง จุฬา พยัญชนะ เด็กหญิง ฐานข้อมูล ซอฟต์แวร์ ซ้าย ซึ่ง สัญญาณ นาฬิกา ใหญ่ สำคัญ กุญแจ ซ่อน ฤดูฝน สัญญา อังกฤษ ทฤษฎี ซอส ซุป ซื้อ ปัญหา บุญ'
  ].map(x => x.split(' '));
  // คำของบท i = คำของบทนั้นและทุกบทก่อนหน้า (บททดสอบใช้ทั้งหมด)
  const thWordsUpTo = i => TH_WORDS.slice(0, Math.min(i, TH_WORDS.length - 1) + 1).flat();

  const LESSONS = {
    th: [
      { keys: 'ฟหกด่าสว', title: 'แป้นเหย้า', tip: 'วางนิ้วซ้าย ฟ ห ก ด · นิ้วขวา ่ า ส ว คลำปุ่มนูนที่ ด กับ ่ ให้เจอ นิ้วโป้งเคาะเว้นวรรค' },
      { keys: 'เ้ง', title: 'นิ้วชี้ก้าวเข้ากลาง', tip: 'เ ใช้นิ้วชี้ซ้ายก้าวไปทางขวา · ้ ใช้นิ้วชี้ขวาก้าวไปทางซ้าย · ง ใช้นิ้วก้อยขวาก้าวไปทางขวา' },
      { keys: 'พะัีำร', title: 'แถวบน นิ้วชี้และนิ้วกลาง', tip: 'พ ะ นิ้วชี้ซ้ายขึ้นไป · ั ี นิ้วชี้ขวาขึ้นไป · ำ นิ้วกลางซ้ายขึ้นไป · ร นิ้วกลางขวาขึ้นไป' },
      { keys: 'อิืทแม', title: 'แถวล่าง นิ้วชี้และนิ้วกลาง', tip: 'อ ิ นิ้วชี้ซ้ายลงมา · ื ท นิ้วชี้ขวาลงมา · แ นิ้วกลางซ้ายลงมา · ม นิ้วกลางขวาลงมา' },
      { keys: 'ไปนใๆผย', title: 'นิ้วนางและนิ้วก้อย', tip: 'ไ ป นิ้วนางซ้ายขึ้น/ลง · น ใ นิ้วนางขวาขึ้น/ลง · ๆ ผ นิ้วก้อยซ้าย · ย นิ้วก้อยขวาขึ้นไป' },
      { keys: 'บลฝ', title: 'นิ้วก้อยขวาขอบนอก', tip: 'บ ล นิ้วก้อยขวาขึ้นไปทางขวา · ฝ นิ้วก้อยขวาลงมา อย่ายกทั้งมือ ให้ก้าวเฉพาะนิ้ว' },
      { keys: 'ถภคตึุ', title: 'แถวตัวเลข ตรงกลาง', tip: 'ภ ถ นิ้วชี้ซ้ายขึ้นไปสองแถว · ุ ึ นิ้วชี้ขวาขึ้นไปสองแถว · ค นิ้วกลางขวา · ต นิ้วนางขวา' },
      { keys: 'จขช-/', title: 'แถวตัวเลข ขอบนอก', tip: 'จ ข ช นิ้วก้อยขวาขึ้นไปสองแถว · - นิ้วกลางซ้าย · / นิ้วนางซ้าย' },
      { keys: 'โฌ็๋ฑธ๊ณ', title: 'Shift แถวกลางและแถวบน (1)', tip: 'ตัวบนแป้นต้องกด Shift ค้าง ใช้นิ้วก้อยมือตรงข้าม: ตัวฝั่งซ้ายกด Shift ขวา ตัวฝั่งขวากด Shift ซ้าย', shift: true },
      { keys: 'ฎฏษฆศฯ"', title: 'Shift แถวกลางและแถวบน (2)', tip: 'ฆ ฏ ฎ ใช้ Shift ขวา · ษ ศ ฯ ใช้ Shift ซ้าย กด Shift ค้างก่อนแล้วจึงกดตัวอักษร', shift: true },
      { keys: 'ฮฉฒู์?', title: 'Shift แถวล่าง', tip: 'ฮ ฉ ใช้ Shift ขวา · ู ์ ฒ ? ใช้ Shift ซ้าย (ู อยู่บนแป้น ุ)', shift: true },
      { keys: 'ฤ()ฬซญฦฐ', title: 'Shift ขอบนอก', tip: 'ฤ ( ) ใช้ Shift ขวา · ฬ ซ ญ ฦ ฐ ใช้ Shift ซ้าย ฝึกให้คล่องแล้วจะพิมพ์ได้ทุกคำ', shift: true },
      { keys: '', title: 'บททดสอบพิมพ์สัมผัส', tip: 'ผสมทุกแป้นที่เรียนมา พิมพ์คำและวลีโดยไม่มองแป้นพิมพ์ เน้นความแม่นยำแล้วค่อยเพิ่มความเร็ว', final: true }
    ],
    en: [
      { keys: 'asdfjkl;', title: 'Home row', tip: 'นิ้วซ้าย A S D F · นิ้วขวา J K L ; คลำปุ่มนูนที่ F กับ J นิ้วโป้งเคาะเว้นวรรค' },
      { keys: 'gh', title: 'นิ้วชี้ก้าวเข้ากลาง', tip: 'G ใช้นิ้วชี้ซ้ายก้าวไปทางขวา · H ใช้นิ้วชี้ขวาก้าวไปทางซ้าย' },
      { keys: 'ei', title: 'แถวบน นิ้วกลาง', tip: 'E นิ้วกลางซ้ายขึ้นไป · I นิ้วกลางขวาขึ้นไป' },
      { keys: 'ru', title: 'แถวบน นิ้วชี้', tip: 'R นิ้วชี้ซ้ายขึ้นไป · U นิ้วชี้ขวาขึ้นไป' },
      { keys: 'ty', title: 'แถวบน นิ้วชี้ก้าวเข้ากลาง', tip: 'T นิ้วชี้ซ้ายขึ้นไปทางขวา · Y นิ้วชี้ขวาขึ้นไปทางซ้าย' },
      { keys: 'wo', title: 'แถวบน นิ้วนาง', tip: 'W นิ้วนางซ้ายขึ้นไป · O นิ้วนางขวาขึ้นไป' },
      { keys: 'qp', title: 'แถวบน นิ้วก้อย', tip: 'Q นิ้วก้อยซ้ายขึ้นไป · P นิ้วก้อยขวาขึ้นไป' },
      { keys: 'cvm,', title: 'แถวล่าง ตรงกลาง', tip: 'C นิ้วกลางซ้าย · V นิ้วชี้ซ้าย · M นิ้วชี้ขวา · , นิ้วกลางขวา (ลงมาหนึ่งแถว)' },
      { keys: 'bn', title: 'แถวล่าง นิ้วชี้ก้าวเข้ากลาง', tip: 'B นิ้วชี้ซ้ายลงมาทางขวา · N นิ้วชี้ขวาลงมาทางซ้าย' },
      { keys: 'xz./', title: 'แถวล่าง ขอบนอก', tip: 'X นิ้วนางซ้าย · Z นิ้วก้อยซ้าย · . นิ้วนางขวา · / นิ้วก้อยขวา' },
      { keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', title: 'ตัวพิมพ์ใหญ่ด้วย Shift', tip: 'ตัวพิมพ์ใหญ่กด Shift ค้างด้วยนิ้วก้อยมือตรงข้าม: ตัวฝั่งซ้ายกด Shift ขวา ตัวฝั่งขวากด Shift ซ้าย', shift: true },
      { keys: '1234567890', title: 'แถวตัวเลข', tip: 'ตัวเลขอยู่เหนือแถวบน ใช้นิ้วเดียวกับแป้นด้านล่าง เช่น 4 5 นิ้วชี้ซ้าย 6 7 นิ้วชี้ขวา' },
      { keys: '', title: 'Final typing test', tip: 'ผสมทุกแป้น พิมพ์ประโยคโดยไม่มองแป้นพิมพ์ แม่นก่อนแล้วค่อยเร็ว', final: true }
    ]
  };
  // คำภาษาอังกฤษพื้นฐาน (เลือกเฉพาะคำที่พิมพ์ได้ด้วยแป้นที่เรียนแล้ว)
  const EN_WORDS = ('as ask all add sad dad lad fall hall flask salad glass gas had has half shall flash glad hash ' +
    'see she he her here hide like lake fish shelf field kids jade side sleek ideal ' +
    'red read rule ride hear fresh sure user fruit guard ' +
    'the that this they tree three light right tiger great table sky stay yes yet ' +
    'we who work word world slow show snow how now new wood tower ' +
    'quick quiet queen people pop paper apple happy ' +
    'cat car cave come move milk music cream ice mice face ' +
    'book bag bus big but ban bring nine name man moon brown ' +
    'box fox six zoo zero lazy size ' +
    'school teacher student friend water family garden window computer keyboard practice ' +
    'jail dish lid kid desk silk ' +
    'quiz quit equal pack park pink pen pig pin play plan help keep sleep shop spot stop top tip map cap jump paint pupil plate ' +
    'cake clock cook cool copy vase vote visit voice seven every movie camera ' +
    'bed bird blue bike bell nest net nose noon nice brain bench ' +
    'zip zebra pizza fix mix taxi next exit maze').split(' ');
  const EN_SENT = ['the quick brown fox jumps over the lazy dog', 'practice makes perfect', 'keep your fingers on the home row', 'type with your eyes on the screen', 'learning to type is fun', 'my friend likes to read books'];
  const TH_SENT = ['ฝึกพิมพ์ทุกวันแล้วจะเก่งขึ้น', 'วางนิ้วที่แป้นเหย้าเสมอ', 'พิมพ์ให้แม่นก่อนแล้วค่อยเร็ว', 'อย่ามองแป้นพิมพ์ขณะพิมพ์', 'ครูใจดีสอนพิมพ์สัมผัส', 'นักเรียนตั้งใจฝึกฝน'];

  const STAGES = [
    { id: 1, name: 'แป้นใหม่', desc: 'กดแป้นใหม่ซ้ำ ๆ ให้นิ้วจำตำแหน่ง ปุ่มที่ต้องกดจะเรืองแสง', n: 6 },
    { id: 2, name: 'ผสมแป้น', desc: 'พยางค์ผสมจากแป้นที่เรียนแล้ว เน้นแป้นใหม่', n: 8 },
    { id: 3, name: 'พิมพ์คำ', desc: 'คำจริงที่ใช้เฉพาะแป้นที่เรียนแล้ว', n: 10 },
    { id: 4, name: 'พิมพ์สัมผัส', desc: 'ตัวอักษรบนแป้นถูกซ่อน ไม่มีปุ่มเรืองแสง ต้องพิมพ์จากความจำของนิ้ว', n: 6, blind: true }
  ];
  // บททดสอบใช้ชื่อและคำอธิบายด่านของตัวเอง (คำสั้น › คำยาว › วลี › ประโยคไม่ดูแป้น)
  const FINAL_STAGES = [['คำสั้น', 'คำสั้นจากทุกแป้นที่เรียนมา'], ['คำยาว', 'คำยาวที่ต้องใช้หลายนิ้วสลับกัน'], ['วลี', 'สองคำต่อกัน เว้นวรรคด้วยนิ้วโป้ง'], ['ประโยค', 'ประโยคยาวแบบไม่ดูแป้น ตัวอักษรบนแป้นถูกซ่อน']];
  const stageOf = (lang, lesson, stage) => { const S = STAGES[stage - 1], L = LESSONS[lang][lesson]; return L && L.final ? Object.assign({}, S, { name: FINAL_STAGES[stage - 1][0], desc: FINAL_STAGES[stage - 1][1] }) : S; };
  const BAD = new Set('ห่า ด่า สัด หี ควย เย็ด หำ แตด จู๋ เหี้ย ตูด เหี้ยม ห่าน'.split(' '));   // พยางค์สุ่มที่ไม่ควรให้เด็กพิมพ์
  const MARK = /[ัิ-ฺ็-๎]/, LEAD = /[เแโใไ]/, TAIL = /[าะำๆ]/;
  const isMark = c => MARK.test(c), isLead = c => LEAD.test(c), isTail = c => TAIL.test(c);
  const isCons = c => /[ก-ฮ]/.test(c) && c !== 'ฯ';
  const UPPER = /[ัิ-ื็ํ]/, LOWER = /[ุ-ฺ]/, TONE = /[่-์]/;

  // ตัวอักษรที่เรียนแล้วถึงบทที่ i (นับรวมบทก่อนหน้า) บทสุดท้ายรวมทุกบท
  function known(lang, i) { const L = LESSONS[lang]; let s = ''; for (let k = 0; k <= Math.min(i, L.length - 1); k++) s += L[k].keys; if (lang === 'en' && !/[A-Z]/.test(L[i].keys) && !L[i].final) s = s.replace(/[A-Z]/g, ''); return [...new Set([...s])]; }
  const rng = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const pick = (R, a) => a[Math.floor(R() * a.length)];
  const fitsTH = (w, set) => [...w].every(c => set.has(c));

  // พยางค์ไทยสุ่มที่เรียงสระ วรรณยุกต์ถูกตำแหน่ง (นำ › พยัญชนะ › สระบน/ล่าง › วรรณยุกต์ › สระตาม)
  function thSyl(R, chars, focus) {
    const cons = chars.filter(isCons), lead = chars.filter(isLead), up = chars.filter(c => UPPER.test(c)), low = chars.filter(c => LOWER.test(c)), tone = chars.filter(c => TONE.test(c)), tail = chars.filter(c => isTail(c) && c !== 'ๆ');
    if (!cons.length) return focus || pick(R, chars);
    let f = focus; const want = k => f && k(f);
    let s = '';
    if (want(isLead) || (lead.length && R() < 0.22)) s += want(isLead) ? f : pick(R, lead);
    s += want(isCons) ? f : pick(R, cons);
    const tailFocus = want(c => isTail(c) && c !== 'ๆ'), useUp = !tailFocus && (want(c => UPPER.test(c)) || (up.length && R() < 0.25)), useLow = !tailFocus && !useUp && (want(c => LOWER.test(c)) || (low.length && R() < 0.15));
    if (useUp) s += want(c => UPPER.test(c)) ? f : pick(R, up); else if (useLow) s += want(c => LOWER.test(c)) ? f : pick(R, low);
    if (want(c => TONE.test(c)) || (tone.length && R() < 0.25)) s += want(c => TONE.test(c)) ? f : pick(R, tone);
    if (!useUp && !useLow && (want(c => isTail(c) && c !== 'ๆ') || (tail.length && R() < 0.4))) s += want(c => isTail(c) && c !== 'ๆ') ? f : pick(R, tail);
    if (f === 'ๆ') s += 'ๆ';
    if (f && !s.includes(f)) s += f;   // เครื่องหมายวรรคตอน (- / ( ) ? " ฯ) ต่อท้ายพยางค์
    if ([...s].length === 1 && isCons(s)) s += tail.length ? pick(R, tail) : tone.length ? pick(R, tone) : '';   // ไม่ให้เหลือพยัญชนะตัวเดียว
    return s;
  }
  // หน่วยฝึกของแป้นเดี่ยว: พยัญชนะกดซ้ำได้ แต่สระ/วรรณยุกต์ต้องมีพยัญชนะประกอบจึงจะแสดงผลถูก
  function thDrill(c, base) {
    if (isMark(c)) return base + c;
    if (isLead(c)) return c + base;
    if (isTail(c) && c !== 'ๆ') return base + c;
    if (c === 'ๆ') return base + 'ๆ';
    return c + c;
  }
  // สร้างชุดหน่วยฝึกของด่าน (แต่ละหน่วยพิมพ์จบแล้วกด Enter)
  function deck(lang, lesson, stage, seed) {
    const R = rng(seed || 1), L = LESSONS[lang][lesson], all = known(lang, lesson), news = L.final ? all : [...L.keys], S = STAGES[stage - 1], out = [];
    const set = new Set(all), th = lang === 'th';
    const bases = th ? all.filter(c => 'กดสหวฟ'.includes(c)) : [];
    const digits = /^[0-9]+$/.test(L.keys), caps = !th && L.shift;
    const words = (th ? thWordsUpTo(lesson) : EN_WORDS.map(w => (caps ? w[0].toUpperCase() + w.slice(1) : w))).filter(w => (th ? fitsTH(w, set) : [...w].every(c => set.has(c) || set.has(c.toLowerCase()))));
    const withNew = words.filter(w => news.some(c => w.includes(c)));
    const wordPool = (withNew.length >= 6 ? withNew : words);
    const thS = () => { let x; for (let k = 0; k < 8; k++) { x = thSyl(R, all, R() < 0.55 ? pick(R, news) : null); if (!BAD.has(x)) break; } return x; };   // ไม่ให้สุ่มได้คำหยาบ
    const syl = () => (th ? thS() : Array.from({ length: 2 + Math.floor(R() * 3) }, () => (R() < 0.5 ? pick(R, news) : pick(R, all))).join('').replace(/[A-Z]/g, (m, i) => (i ? m.toLowerCase() : m)));
    const num = () => String(Math.floor(R() * 9000) + (R() < 0.5 ? 10 : 1000));
    if (L.final) {   // บททดสอบ: คำสั้น › คำยาว › วลี › ประโยคแบบไม่ดูแป้น
      const sents = th ? TH_SENT : EN_SENT, short = shuffle(R, words.filter(w => [...w].length <= 4).slice(0, 200)), long = shuffle(R, words.filter(w => [...w].length >= 5).slice(0, 200));
      for (let i = 0; i < S.n; i++) out.push(stage === 1 ? short[i % short.length] : stage === 2 ? long[i % long.length] : stage === 3 ? [short[(2 * i) % short.length], long[i % long.length]].join(' ') : sents[i % sents.length]);
      return out;
    }
    if (digits && stage >= 3) {   // บทตัวเลข: ตัวเลขหลายหลัก แล้วผสมคำ
      for (let i = 0; i < S.n; i++) out.push(stage === 3 ? [num(), num()].join(' ') : [pick(R, words), num(), pick(R, words)].join(' '));
      return out;
    }
    if (stage === 1) {
      for (let i = 0; i < S.n; i++) {
        const c = i < news.length ? news[i] : pick(R, news), b = bases.length ? bases[i % bases.length] : 'ก';
        if (i < news.length) { const unit = th ? thDrill(c, b) : (c + c); out.push([unit, unit, unit].join(' ')); continue; }
        // ทบทวน: แป้นใหม่กับแป้นเหย้าของนิ้วเดียวกัน (เช่น fgf jhj) ให้นิ้วก้าวออกแล้วกลับที่เดิม
        if (th) { const one = () => { let x; for (let k = 0; k < 8; k++) { x = thSyl(R, news.concat(bases), pick(R, news)); if (!BAD.has(x)) break; } return x; }; out.push([one(), one(), one()].join(' ')); }
        else { const hk = TY.keyOf('en', c.toLowerCase()), hc = hk && HOME[(TY.FINGER[hk.code] || {}).hand + (TY.FINGER[hk.code] || {}).f], h = hc ? TY.charFor('en', hc, false, false) : 'f'; out.push([h + c + h, h + c + h, c + h + c].join(' ')); }
      }
    } else if (stage === 2) {
      for (let i = 0; i < S.n; i++) out.push([syl(), syl(), syl()].join(' '));
    } else if (stage === 3) {
      const pool = shuffle(R, wordPool.slice(0, 80));
      for (let i = 0; i < S.n; i++) out.push(pool.length ? pool[i % pool.length] : [syl(), syl()].join(''));
    } else {
      const pool = shuffle(R, (L.final ? words.slice(0, 300) : wordPool.slice(0, 80))), sents = th ? TH_SENT : EN_SENT;
      for (let i = 0; i < S.n; i++) {
        if (L.final && i % 2 === 1) { out.push(sents[(i >> 1) % sents.length]); continue; }
        const k = pool.length >= 3 ? [pool[(i * 3) % pool.length], pool[(i * 3 + 1) % pool.length], pool[(i * 3 + 2) % pool.length]] : [syl(), syl(), syl()];
        out.push(k.join(' '));
      }
    }
    return out;
  }
  function shuffle(R, a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
  // เป้าความเร็ว (คำ/นาที นับ 5 ตัวอักษรเป็นหนึ่งคำ) ของด่านพิมพ์สัมผัส
  const targetWpm = (lang, lesson) => Math.round((lang === 'th' ? 7 : 9) + lesson * (lang === 'th' ? 1.1 : 1.4));
  // ดาว: ด่าน 1–3 วัดความแม่นยำ · ด่าน 4 ต้องแม่นและเร็วถึงเป้า
  function stars(stage, acc, wpm, target) {
    if (acc < 85) return 0;
    if (stage < 4) return acc >= 98 ? 3 : acc >= 93 ? 2 : 1;
    return acc >= 96 && wpm >= target ? 3 : acc >= 92 && wpm >= target * 0.8 ? 2 : 1;
  }

  /* ---------- นิ้วที่ใช้และทิศที่ก้าวนิ้วจากแป้นเหย้า ---------- */
  const FINGER_TH = { 0: 'ก้อย', 1: 'นาง', 2: 'กลาง', 3: 'ชี้', 4: 'โป้ง' };
  const HOME = { L0: 'KeyA', L1: 'KeyS', L2: 'KeyD', L3: 'KeyF', R3: 'KeyJ', R2: 'KeyK', R1: 'KeyL', R0: 'Semicolon', T4: 'Space' };
  function keyPos(code) { for (let r = 0; r < TY.ROWS.length; r++) { let x = 0; for (const k of TY.ROWS[r]) { if (k[0] === code) return { r, x: x + k[1] / 2 }; x += k[1]; } } return null; }
  function fingerOf(code) { const f = TY.FINGER[code]; if (!f) return null; return { hand: f.hand, f: f.f, key: f.hand + f.f, name: f.hand === 'T' ? 'นิ้วโป้ง' : 'นิ้ว' + FINGER_TH[f.f] + (f.hand === 'L' ? 'ซ้าย' : 'ขวา') }; }
  // คำบอกการก้าวนิ้ว เช่น 'ขึ้นไปหนึ่งแถว' 'ก้าวไปทางขวา' 'อยู่ที่แป้นเหย้า'
  function moveHint(code) {
    const f = fingerOf(code); if (!f) return ''; if (code === 'Space') return 'เคาะเว้นวรรค';
    const h = keyPos(HOME[f.key]), p = keyPos(code); if (!h || !p) return '';
    if (code === HOME[f.key]) return 'อยู่ที่แป้นเหย้า';
    const dr = p.r - h.r, dx = p.x - h.x, parts = [];
    if (dr <= -2) parts.push('ขึ้นไปสองแถว'); else if (dr === -1) parts.push('ขึ้นไปหนึ่งแถว'); else if (dr === 1) parts.push('ลงมาหนึ่งแถว');
    const lim = dr <= -2 ? 1 : 0.75;   // ตำแหน่งกลางปุ่มคิดตามแถวที่เหลื่อมกันจริง แถวตัวเลขเหลื่อมมากจึงใช้เกณฑ์กว้างกว่า
    if (dx >= lim) parts.push('ไปทางขวา'); else if (dx <= -lim) parts.push('ไปทางซ้าย');
    return parts.join(' ') || 'กดตรง ๆ';
  }

  const api = { LESSONS, STAGES, stageOf, known, deck, targetWpm, stars, fingerOf, moveHint, keyPos, HOME, thSyl, EN_WORDS, TH_WORDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TY_COURSE = api;
})(typeof window !== 'undefined' ? window : globalThis);
