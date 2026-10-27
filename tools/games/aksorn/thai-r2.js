/* ===== Techno Aksorn รอบ 2: ภูเขาวรรณยุกต์ · สะพานมาตรา · ตลาดสะกดคำ · ปราสาทประโยค (ข้อมูล + ตัวสร้างกิจกรรม ไม่แตะหน้าจอ ทดสอบด้วย node test_r2.js) =====
   คีย์ของรายการ (ใช้กับ AK.info / lesson.items):  w:คำ หรือพยางค์  ·  m:รหัสมาตรา  ·  tn:รหัสเสียงวรรณยุกต์  ·  tf:พยัญชนะ+รูปสระ (ชุดผันเสียง)  ·  se:รหัสประโยค
   บทเรียนรอบ 2 มี acts (รายการกิจกรรมของบท) และ pool (คลังคำ/พยางค์/ประโยคที่เกมใช้สุ่ม) แยกจาก items ที่ใช้แสดงในบทเรียนและบัตรเรียนรู้ */
const R2 = (function () {
  'use strict';
  const rng = AK.rng, shuf = AK.shuf, uniq = a => a.filter((x, i) => a.indexOf(x) === i);
  const pick = (arr, R) => arr[Math.floor(R() * arr.length)];
  const nOpt = lv => [3, 4, 5, 5][lv] || 4;
  const THAI_CONS = c => c >= 'ก' && c <= 'ฮ';

  /* ---------- วรรณยุกต์: เสียง 5 เสียง · รูป 4 รูป · หมู่อักษร · ตารางผันเสียงตามชนิดของคำ ----------
     ตามตาราง 'หลักการผันเสียงวรรณยุกต์' ที่ครูให้มา 25 ต.ค. 2569 (กลาง/สูง/ต่ำ × คำเป็น/คำตาย เสียงสั้น/เสียงยาว) ใช้ตัวอักษรขีด – แทนพยัญชนะ ไม่ใช้ อ ในรูปวรรณยุกต์ */
  const TONE_IDS = ['sa', 'ek', 'tho', 'tri', 'jat'];
  const TONES = {
    sa: { name: 'สามัญ', say: 'เสียงสามัญ', desc: 'เสียงเรียบ ๆ ระดับกลาง เหมือนพูดตามปกติ', ex: ['กา', 'คา', 'นา'] },
    ek: { name: 'เอก', say: 'เสียงเอก', desc: 'เสียงต่ำ ๆ กดเสียงลง', ex: ['ก่า', 'ข่า', 'ป่า'] },
    tho: { name: 'โท', say: 'เสียงโท', desc: 'เสียงสูงแล้วตกลงมา', ex: ['ก้า', 'ข้า', 'ค่า'] },
    tri: { name: 'ตรี', say: 'เสียงตรี', desc: 'เสียงสูง แล้วยกเสียงขึ้น', ex: ['ก๊า', 'ค้า', 'ม้า'] },
    jat: { name: 'จัตวา', say: 'เสียงจัตวา', desc: 'เสียงต่ำแล้วยกขึ้น เหมือนเสียงถาม', ex: ['ก๋า', 'ขา', 'ผา'] }
  };
  const MARK_NAME = { '': 'ไม่มีรูปวรรณยุกต์', '่': 'ไม้เอก', '้': 'ไม้โท', '๊': 'ไม้ตรี', '๋': 'ไม้จัตวา' };
  const CLS_TH = { m: 'อักษรกลาง', h: 'อักษรสูง', l: 'อักษรต่ำ' };
  // ชนิดของพยางค์: live คำเป็น · ds คำตายเสียงสั้น · dl คำตายเสียงยาว (อักษรกลางและสูงเรียกรวมว่าคำตาย เพราะผันเสียงเหมือนกัน)
  const kindTh = (cls, kind) => (kind === 'live' ? 'คำเป็น' : cls === 'l' ? (kind === 'ds' ? 'คำตายเสียงสั้น' : 'คำตายเสียงยาว') : 'คำตาย');
  // หมู่อักษร › ชนิด › รูปวรรณยุกต์ ('' = ไม่มีรูป) › เสียง   (ช่องที่ตารางเป็น – คือไม่มีในตาราง)
  const TONE_TAB = {
    m: { live: { '': 'sa', '่': 'ek', '้': 'tho', '๊': 'tri', '๋': 'jat' }, ds: { '': 'ek', '้': 'tho', '๊': 'tri', '๋': 'jat' }, dl: { '': 'ek', '้': 'tho', '๊': 'tri', '๋': 'jat' } },
    h: { live: { '': 'jat', '่': 'ek', '้': 'tho' }, ds: { '': 'ek', '้': 'tho' }, dl: { '': 'ek', '้': 'tho' } },
    l: { live: { '': 'sa', '่': 'tho', '้': 'tri' }, ds: { '่': 'tho', '': 'tri', '๋': 'jat' }, dl: { '': 'tho', '้': 'tri', '๋': 'jat' } }
  };
  const TONE_OF = { m: TONE_TAB.m.live, h: TONE_TAB.h.live, l: TONE_TAB.l.live };
  const markFor = (f, kind, tone) => { const t = TONE_TAB[f][kind]; const k = Object.keys(t).find(m => t[m] === tone); return k == null ? null : k; };
  // แถวของตารางในบัตรเรียนรู้: [ชนิด, ชื่อแถว, รูปสระ]
  const CHART_ROWS = {
    m: [['live', 'คำเป็น', '–า'], ['ds', 'คำตาย', '–ะ']],
    h: [['live', 'คำเป็น', '–า'], ['ds', 'คำตาย', '–ะ']],
    l: [['live', 'คำเป็น', '–า'], ['ds', 'คำตาย เสียงสั้น', '–ะ'], ['dl', 'คำตาย เสียงยาว', '–าด']]
  };
  // พยัญชนะที่ใช้ในชุดผันเสียง (ไม่มีพยางค์ที่เป็นคำไม่สุภาพ)
  const TONE_C = { m: ['ก', 'จ', 'ต', 'ป', 'ด', 'บ'], h: ['ข', 'ส', 'ผ', 'ถ', 'ฝ', 'ฉ'], l: ['ค', 'ม', 'น', 'พ', 'ท', 'ช', 'ร', 'ล', 'ย', 'ซ'] };
  const TONE_BASES = { m: { live: [], ds: [], dl: [] }, h: { live: [], ds: [], dl: [] }, l: { live: [], ds: [], dl: [] } };
  ['m', 'h', 'l'].forEach(f => TONE_C[f].forEach(c => { TONE_BASES[f].live.push([c, '–า']); TONE_BASES[f].ds.push([c, '–ะ']); TONE_BASES[f].dl.push([c, '–าด']); }));
  const TONE_EXTRA = {
    m: { live: [['ด', '–ี'], ['บ', '–ู'], ['ต', 'เ–'], ['ป', 'โ–'], ['ก', 'แ–'], ['ด', '–อ'], ['ก', '–ี']], ds: [['จ', '–ิก'], ['ป', '–ิด'], ['ก', '–ุก']], dl: [['ป', '–ีก'], ['จ', '–าก'], ['ต', '–าก'], ['ด', '–ีด']] },
    h: { live: [['ส', '–ี'], ['ผ', '–ู'], ['ข', '–อ'], ['ส', 'เ–'], ['ถ', 'โ–'], ['ผ', 'แ–']], ds: [['ผ', '–ิด'], ['ข', '–ุด'], ['ส', '–ุก']], dl: [['ข', '–ีด'], ['ผ', '–ูก'], ['ส', '–าบ']] },
    l: { live: [['ม', '–ี'], ['ช', '–ี'], ['ค', '–ู'], ['ท', '–อ'], ['น', 'เ–'], ['ม', 'โ–'], ['พ', 'แ–'], ['ร', '–ี']], ds: [['ล', '–ุก'], ['น', '–ิด'], ['ช', '–ิด'], ['ค', '–ิด']], dl: [['ล', '–ูก'], ['ม', '–าก'], ['ย', '–าก'], ['ล', '–าก']] }
  };
  ['m', 'h', 'l'].forEach(f => ['live', 'ds', 'dl'].forEach(k => TONE_EXTRA[f][k].forEach(b => TONE_BASES[f][k].push(b))));
  // พยัญชนะ + รูปสระ (ที่อาจมีตัวสะกด) + รูปวรรณยุกต์ › พยางค์ (รูปวรรณยุกต์วางบนพยัญชนะ หรือบนสระลอยที่อยู่เหนือพยัญชนะ)
  function toneWord(c, vform, mark) {
    const i = vform.indexOf('–'), before = vform.slice(0, i), after = vform.slice(i + 1), comb = /^[ัิีึืุู็]/.test(after);
    return before + c + (comb ? after[0] + mark + after.slice(1) : mark + after);
  }
  const SYL = {};       // พยางค์ผันเสียง › ข้อมูล {c, v, mark, cls, kind, tone, base}
  ['m', 'h', 'l'].forEach(f => ['live', 'ds', 'dl'].forEach(k => TONE_BASES[f][k].forEach((b, bi) => Object.keys(TONE_TAB[f][k]).forEach(mk => {
    const t = toneWord(b[0], b[1], mk); if (!SYL[t]) SYL[t] = { c: b[0], v: b[1], mark: mk, cls: f, kind: k, tone: TONE_TAB[f][k][mk], base: f + ':' + k + ':' + bi, word: toneWord(b[0], b[1], '') };
  }))));
  const ruleText = s => CLS_TH[s.cls] + ' ' + kindTh(s.cls, s.kind) + ' ' + (s.mark ? MARK_NAME[s.mark] : 'ไม่มีรูปวรรณยุกต์') + ' อ่านเป็นเสียง' + TONES[s.tone].name;
  // ตัวอย่างคำของรูปวรรณยุกต์
  const MARK_EX = { '–่': ['ไก่', 'ป่า', 'ข่า'], '–้': ['ม้า', 'ช้าง', 'น้ำ'], '–๊': ['โต๊ะ', 'ก๊อก', 'จ๊ะ'], '–๋': ['ตั๋ว', 'เตี๋ยว', 'จ๋า'] };

  /* ---------- หมู่อักษร: อักษรกลาง 9 · อักษรสูง 11 · อักษรต่ำ 24 พร้อมคำท่องจำ ---------- */
  const CLASSES = {
    m: { name: 'อักษรกลาง', count: 9, letters: ['ก', 'จ', 'ฎ', 'ฏ', 'ด', 'ต', 'บ', 'ป', 'อ'], phrase: 'ไก่ จิก เด็ก ตาย บน ปาก โอ่ง', rhyme: [['ไก่', 'ก'], ['จิก', 'จ'], ['เด็ก', 'ดฎ'], ['ตาย', 'ตฏ'], ['บน', 'บ'], ['ปาก', 'ป'], ['โอ่ง', 'อ']],
      tip: 'อักษรกลางมี 9 ตัว จำง่าย ๆ ด้วยคำท่อง “ไก่ จิก เด็ก ตาย บน ปาก โอ่ง” ตัวอักษรของแต่ละคำคือ ก จ ด ฎ ต ฏ บ ป อ' },
    h: { name: 'อักษรสูง', count: 11, letters: ['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห'], phrase: 'ผี ฝาก ถุง ข้าว สาร ให้ ฉัน', rhyme: [['ผี', 'ผ'], ['ฝาก', 'ฝ'], ['ถุง', 'ถฐ'], ['ข้าว', 'ขฃ'], ['สาร', 'สศษ'], ['ให้', 'ห'], ['ฉัน', 'ฉ']],
      tip: 'อักษรสูงมี 11 ตัว จำง่าย ๆ ด้วยคำท่อง “ผี ฝาก ถุง ข้าว สาร ให้ ฉัน” ตัวอักษรของแต่ละคำคือ ผ ฝ ถ ฐ ข ฃ ส ศ ษ ห ฉ' },
    l: { name: 'อักษรต่ำ', count: 24, pairs: ['ค', 'ฅ', 'ฆ', 'ช', 'ซ', 'ฌ', 'ฑ', 'ฒ', 'ท', 'ธ', 'พ', 'ฟ', 'ภ', 'ฮ'], singles: ['ง', 'ญ', 'ณ', 'น', 'ม', 'ย', 'ร', 'ล', 'ว', 'ฬ'], phrase: 'งู หญิง เณร หนู ม้า ยักษ์ เรือ ลิง แหวน จุฬา',
      tip: 'อักษรต่ำมี 24 ตัว คือตัวที่เหลือจากอักษรกลางและอักษรสูง แบ่งเป็นต่ำคู่ 14 ตัว (เสียงคู่กับอักษรสูง) กับต่ำเดี่ยว 10 ตัว ท่องคำของต่ำเดี่ยวว่า “งู หญิง เณร หนู ม้า ยักษ์ เรือ ลิง แหวน จุฬา”' }
  };
  CLASSES.l.letters = CLASSES.l.pairs.concat(CLASSES.l.singles);

  /* ---------- คำเป็น คำตาย ---------- */
  const LD = {
    live: { id: 'live', th: 'คำเป็น', say: 'คำเป็น', color: '#3d8bff', tip: 'คำเป็นคือคำที่ออกเสียงต่อเนื่อง ไม่ห้วนสั้น',
      rules: ['1. สระเสียงยาว ไม่มีตัวสะกด เช่น ตา ปู มือ', '2. มีตัวสะกด แม่ กง กน กม เกย เกอว เช่น ลิง จาน นม ดาว', '3. สระ –ำ ใ ไ เ–า เช่น ดำ ใบ ไป เขา'], ex: ['ตา', 'ลิง', 'ดาว', 'ไป'] },
    ds: { id: 'ds', th: 'คำตาย เสียงสั้น', say: 'คำตาย เสียงสั้น', color: '#ff8a1e', tip: 'คำตายเสียงสั้นคือคำที่ออกเสียงสั้นห้วน',
      rules: ['1. สระเสียงสั้น ไม่มีตัวสะกด เช่น กะ จะ ปะ (ยกเว้น –ำ ใ ไ เ–า)', '2. สระเสียงสั้น มีตัวสะกด แม่ กก กด กบ เช่น นก เด็ก จับ'], ex: ['กะ', 'นก', 'เด็ก', 'จับ'] },
    dl: { id: 'dl', th: 'คำตาย เสียงยาว', say: 'คำตาย เสียงยาว', color: '#9a5ae8', tip: 'คำตายเสียงยาวคือสระเสียงยาวที่มีตัวสะกดแม่ กก กด กบ',
      rules: ['สระเสียงยาว มีตัวสะกด แม่ กก กด กบ เช่น ปาก ลูก มีด รูป'], ex: ['ปาก', 'ลูก', 'มีด', 'รูป'] }
  };
  // [คำ, ชนิด, เหตุผล] ใช้ในเกมแยกคำเป็นคำตาย
  const LDW = [
    ['ตา', 'live', 'สระเสียงยาว ไม่มีตัวสะกด'], ['ปู', 'live', 'สระเสียงยาว ไม่มีตัวสะกด'], ['มือ', 'live', 'สระเสียงยาว ไม่มีตัวสะกด'], ['ปลา', 'live', 'สระเสียงยาว ไม่มีตัวสะกด'],
    ['ลิง', 'live', 'มีตัวสะกดแม่กง'], ['จาน', 'live', 'มีตัวสะกดแม่กน'], ['นม', 'live', 'มีตัวสะกดแม่กม'], ['ดาว', 'live', 'มีตัวสะกดแม่เกอว'], ['ควาย', 'live', 'มีตัวสะกดแม่เกย'],
    ['ใบ', 'live', 'สระใอไม้ม้วน เป็นคำเป็น'], ['ไป', 'live', 'สระไอไม้มลาย เป็นคำเป็น'], ['ดำ', 'live', 'สระอำ เป็นคำเป็น'], ['เขา', 'live', 'สระเอา เป็นคำเป็น'], ['ฟัน', 'live', 'มีตัวสะกดแม่กน ถึงสระเสียงสั้นก็เป็นคำเป็น'],
    ['กะ', 'ds', 'สระเสียงสั้น ไม่มีตัวสะกด'], ['จะ', 'ds', 'สระเสียงสั้น ไม่มีตัวสะกด'], ['ปะ', 'ds', 'สระเสียงสั้น ไม่มีตัวสะกด'],
    ['นก', 'ds', 'สระเสียงสั้น ตัวสะกดแม่กก'], ['เด็ก', 'ds', 'สระเสียงสั้น ตัวสะกดแม่กก'], ['ผัก', 'ds', 'สระเสียงสั้น ตัวสะกดแม่กก'], ['จับ', 'ds', 'สระเสียงสั้น ตัวสะกดแม่กบ'], ['กบ', 'ds', 'สระเสียงสั้น ตัวสะกดแม่กบ'], ['หมด', 'ds', 'สระเสียงสั้น ตัวสะกดแม่กด'], ['เป็ด', 'ds', 'สระเสียงสั้น ตัวสะกดแม่กด'],
    ['ปาก', 'dl', 'สระเสียงยาว ตัวสะกดแม่กก'], ['ลูก', 'dl', 'สระเสียงยาว ตัวสะกดแม่กก'], ['มีด', 'dl', 'สระเสียงยาว ตัวสะกดแม่กด'], ['บาท', 'dl', 'สระเสียงยาว ตัวสะกดแม่กด'], ['ขวด', 'dl', 'สระเสียงยาว ตัวสะกดแม่กด'],
    ['รูป', 'dl', 'สระเสียงยาว ตัวสะกดแม่กบ'], ['ชอบ', 'dl', 'สระเสียงยาว ตัวสะกดแม่กบ'], ['ภาพ', 'dl', 'สระเสียงยาว ตัวสะกดแม่กบ']
  ];
  const LD_OF = Object.fromEntries(LDW.map(w => [w[0], w]));

  /* ---------- มาตราตัวสะกด (9 แม่) ---------- */
  const MATRA = [
    { id: 'ka', text: 'แม่ ก กา', say: 'แม่ ก กา', fin: [], main: '', note: 'ไม่มีตัวสะกด', tip: 'คำที่ไม่มีตัวสะกด อ่านจบที่เสียงสระ',
      words: ['ตา', 'ปู', 'ผี', 'มือ', 'ม้า', 'ปลา', 'หมู', 'ฝา', 'เสือ', 'ใบ', 'ขา', 'นา', 'ยา', 'ดี', 'มี', 'ไป'] },
    { id: 'kng', text: 'แม่กง', say: 'แม่กง', fin: ['ง'], main: 'ง', note: 'ตัวสะกดเสียง ง', tip: 'ตัวสะกดเสียง ง มีตัวเดียวคือ ง',
      words: ['ลิง', 'ช้าง', 'ถุง', 'ธง', 'ผึ้ง', 'ฉิ่ง', 'ยุง', 'รัง'] },
    { id: 'kn', text: 'แม่กน', say: 'แม่กน', fin: ['น', 'ญ', 'ณ', 'ร', 'ล', 'ฬ'], main: 'น', note: 'ตัวสะกดเสียง น', tip: 'ตัวสะกดเสียง น มี น ญ ณ ร ล ฬ',
      words: ['จาน', 'ฟัน', 'แหวน', 'พาน', 'ฐาน', 'คน', 'กิน', 'บิน', 'ดิน'] },
    { id: 'km', text: 'แม่กม', say: 'แม่กม', fin: ['ม'], main: 'ม', note: 'ตัวสะกดเสียง ม', tip: 'ตัวสะกดเสียง ม มีตัวเดียวคือ ม',
      words: ['นม', 'ส้ม', 'ขนม', 'ลม', 'ผม', 'หอม', 'ต้ม'] },
    { id: 'kei', text: 'แม่เกย', say: 'แม่เกย', fin: ['ย'], main: 'ย', note: 'ตัวสะกดเสียง ย', tip: 'ตัวสะกดเสียง ย มีตัวเดียวคือ ย',
      words: ['ควาย', 'ชาย', 'ทราย', 'ว่าย', 'ขาย', 'ลาย', 'นาย'] },
    { id: 'keo', text: 'แม่เกอว', say: 'แม่เกอว', fin: ['ว'], main: 'ว', note: 'ตัวสะกดเสียง ว', tip: 'ตัวสะกดเสียง ว มีตัวเดียวคือ ว',
      words: ['ดาว', 'ข้าว', 'แมว', 'ขาว', 'ยาว', 'หิว', 'เร็ว', 'นิ้ว'] },
    { id: 'kk', text: 'แม่กก', say: 'แม่กก', fin: ['ก', 'ข', 'ค', 'ฆ'], main: 'ก', note: 'ตัวสะกดเสียง ก', tip: 'ตัวสะกดเสียง ก มี ก ข ค ฆ',
      words: ['นก', 'เด็ก', 'ปาก', 'ผัก', 'ลูก', 'รัก', 'ตก', 'สุก'] },
    { id: 'kd', text: 'แม่กด', say: 'แม่กด', fin: ['ด', 'จ', 'ช', 'ซ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ต', 'ถ', 'ท', 'ธ', 'ศ', 'ษ', 'ส'], main: 'ด', note: 'ตัวสะกดเสียง ด', tip: 'ตัวสะกดเสียง ด มีหลายตัว เช่น ด จ ช ซ ต ถ ท ธ ศ ษ ส',
      words: ['รถ', 'มด', 'เป็ด', 'ขวด', 'บาท', 'กด', 'หมด', 'ติด'] },
    { id: 'kb', text: 'แม่กบ', say: 'แม่กบ', fin: ['บ', 'ป', 'พ', 'ฟ', 'ภ'], main: 'บ', note: 'ตัวสะกดเสียง บ', tip: 'ตัวสะกดเสียง บ มี บ ป พ ฟ ภ',
      words: ['กบ', 'รูป', 'ชอบ', 'จับ', 'ภาพ', 'หีบ', 'ลบ'] }
  ];
  const MT = id => MATRA.find(m => m.id === id);
  const MT_COL = ['#ff5a8a', '#3d8bff', '#17c4a8', '#ffa21e', '#9a5ae8', '#3fb54a', '#e8452c', '#2aa8e8', '#c45ad0'];
  const wordMt = w => { const m = MATRA.find(q => q.words.includes(w)); return m ? m.id : null; };
  const finalOf = w => { const l = Array.from(w); return l[l.length - 1]; };

  /* ---------- คำและภาพ (ไม่มีภาพ = null ใช้เฉพาะกิจกรรมที่ไม่ต้องใช้ภาพ) ---------- */
  const WORDS = {
    'ตา': TP_('eye'), 'ปู': TP_('crab'), 'ผี': TP_('ghost'), 'มือ': TP_('hand'), 'ม้า': TP_('horse'), 'ปลา': A_('fish'), 'หมู': A_('pig'), 'ฝา': TP_('lid'), 'เสือ': TP_('tiger'), 'ใบ': TP_('leaf'),
    'ลิง': A_('monkey'), 'ช้าง': A_('elephant'), 'ถุง': TP_('bag'), 'ธง': TP_('flag'), 'ผึ้ง': TP_('bee'), 'ฉิ่ง': TP_('cymbals'),
    'จาน': TP_('plate'), 'ฟัน': TP_('tooth'), 'แหวน': TP_('ring'), 'พาน': TP_('tray'), 'ฐาน': TP_('pedestal'),
    'นม': T_('milk'), 'ส้ม': T_('orange'), 'ขนม': T_('cake'),
    'ควาย': TP_('buffalo'), 'ชาย': K_('tom', 'happy'),
    'ดาว': T_('star'), 'ข้าว': T_('rice'), 'แมว': A_('cat'),
    'นก': A_('bird'), 'เด็ก': K_('tom', 'happy'),
    'เป็ด': A_('duck'), 'ขวด': TP_('bottle'),
    'กบ': A_('frog'), 'หีบ': TP_('chest'),
    'ไก่': TP_('chicken'), 'เต่า': TP_('turtle'), 'น้ำ': T_('water'), 'แม่': K_('mom', 'happy'), 'เรือ': TP_('boat'), 'กา': TP_('crow')
  };
  // ครอบคลุมคำที่ใช้ใน WORDS แต่ละมาตรา ถ้าไม่มีภาพจะคืน null
  const picOf = w => WORDS[w] || null;

  /* ---------- การสะกดคำ: คำ › ชิ้นส่วนที่อ่านตามลำดับ + บทบาทสี (c พยัญชนะ v สระ f ตัวสะกด w คำก่อนใส่วรรณยุกต์ t วรรณยุกต์ W คำที่ได้) ---------- */
  const SPELL = {};
  const SP = (w, tk, roles) => { SPELL[w] = { tokens: tk.split('-'), roles }; };
  // สะกดคำสระเสียงยาว ไม่มีตัวสะกด
  SP('ตา', 'ตอ-อา-ตา', 'cvW'); SP('ปู', 'ปอ-อู-ปู', 'cvW'); SP('ผี', 'ผอ-อี-ผี', 'cvW'); SP('มือ', 'มอ-อือ-มือ', 'cvW'); SP('ฝา', 'ฝอ-อา-ฝา', 'cvW'); SP('ขา', 'ขอ-อา-ขา', 'cvW');
  SP('นา', 'นอ-อา-นา', 'cvW'); SP('ยา', 'ยอ-อา-ยา', 'cvW'); SP('ปี', 'ปอ-อี-ปี', 'cvW'); SP('ดี', 'ดอ-อี-ดี', 'cvW'); SP('มี', 'มอ-อี-มี', 'cvW'); SP('กา', 'กอ-อา-กา', 'cvW');
  SP('เสือ', 'สอ-เอือ-เสือ', 'cvW'); SP('เรือ', 'รอ-เอือ-เรือ', 'cvW'); SP('ใบ', 'บอ-ใอไม้ม้วน-ใบ', 'cvW'); SP('ไป', 'ปอ-ไอไม้มลาย-ไป', 'cvW');
  // มีตัวสะกด
  SP('จาน', 'จอ-อา-นอ-จาน', 'cvfW'); SP('ลิง', 'ลอ-อิ-งอ-ลิง', 'cvfW'); SP('ถุง', 'ถอ-อุ-งอ-ถุง', 'cvfW'); SP('ดิน', 'ดอ-อิ-นอ-ดิน', 'cvfW'); SP('กิน', 'กอ-อิ-นอ-กิน', 'cvfW'); SP('บิน', 'บอ-อิ-นอ-บิน', 'cvfW');
  SP('ปาก', 'ปอ-อา-กอ-ปาก', 'cvfW'); SP('พาน', 'พอ-อา-นอ-พาน', 'cvfW'); SP('ฐาน', 'ฐอ-อา-นอ-ฐาน', 'cvfW'); SP('ดาว', 'ดอ-อา-วอ-ดาว', 'cvfW'); SP('ขาว', 'ขอ-อา-วอ-ขาว', 'cvfW'); SP('ยาว', 'ยอ-อา-วอ-ยาว', 'cvfW');
  SP('ขาย', 'ขอ-อา-ยอ-ขาย', 'cvfW'); SP('ลาย', 'ลอ-อา-ยอ-ลาย', 'cvfW'); SP('นาย', 'นอ-อา-ยอ-นาย', 'cvfW'); SP('ชาย', 'ชอ-อา-ยอ-ชาย', 'cvfW'); SP('แมว', 'มอ-แอ-วอ-แมว', 'cvfW'); SP('ยุง', 'ยอ-อุ-งอ-ยุง', 'cvfW');
  SP('รูป', 'รอ-อู-ปอ-รูป', 'cvfW'); SP('ชอบ', 'ชอ-ออ-บอ-ชอบ', 'cvfW'); SP('ปีก', 'ปอ-อี-กอ-ปีก', 'cvfW'); SP('มีด', 'มอ-อี-ดอ-มีด', 'cvfW');
  // มีวรรณยุกต์
  SP('ข้าว', 'ขอ-อา-วอ-ขาว-ไม้โท-ข้าว', 'cvfwtW'); SP('ช้าง', 'ชอ-อา-งอ-ชาง-ไม้โท-ช้าง', 'cvfwtW'); SP('ผึ้ง', 'ผอ-อึ-งอ-ผึง-ไม้โท-ผึ้ง', 'cvfwtW'); SP('ฉิ่ง', 'ฉอ-อิ-งอ-ฉิง-ไม้เอก-ฉิ่ง', 'cvfwtW');
  SP('นิ้ว', 'นอ-อิ-วอ-นิว-ไม้โท-นิ้ว', 'cvfwtW'); SP('ว่าย', 'วอ-อา-ยอ-วาย-ไม้เอก-ว่าย', 'cvfwtW'); SP('ข่าว', 'ขอ-อา-วอ-ขาว-ไม้เอก-ข่าว', 'cvfwtW'); SP('น้อง', 'นอ-ออ-งอ-นอง-ไม้โท-น้อง', 'cvfwtW'); SP('ร้อง', 'รอ-ออ-งอ-รอง-ไม้โท-ร้อง', 'cvfwtW');
  SP('แม่', 'มอ-แอ-แม-ไม้เอก-แม่', 'cvwtW'); SP('เต่า', 'ตอ-เอา-เตา-ไม้เอก-เต่า', 'cvwtW'); SP('ไก่', 'กอ-ไอไม้มลาย-ไก-ไม้เอก-ไก่', 'cvwtW'); SP('ม้า', 'มอ-อา-มา-ไม้โท-ม้า', 'cvwtW');
  SP('ปู่', 'ปอ-อู-ปู-ไม้เอก-ปู่', 'cvwtW'); SP('พ่อ', 'พอ-ออ-พอ-ไม้เอก-พ่อ', 'cvwtW'); SP('น้ำ', 'นอ-อำ-นำ-ไม้โท-น้ำ', 'cvwtW'); SP('เสื้อ', 'สอ-เอือ-เสือ-ไม้โท-เสื้อ', 'cvwtW');
  // สระเปลี่ยนรูปเมื่อมีตัวสะกด
  SP('ฟัน', 'ฟอ-ไม้หันอากาศ-นอ-ฟัน', 'cvfW'); SP('ผัก', 'ผอ-ไม้หันอากาศ-กอ-ผัก', 'cvfW'); SP('รัก', 'รอ-ไม้หันอากาศ-กอ-รัก', 'cvfW'); SP('จับ', 'จอ-ไม้หันอากาศ-บอ-จับ', 'cvfW');
  SP('ตัก', 'ตอ-ไม้หันอากาศ-กอ-ตัก', 'cvfW'); SP('มัด', 'มอ-ไม้หันอากาศ-ดอ-มัด', 'cvfW'); SP('กัน', 'กอ-ไม้หันอากาศ-นอ-กัน', 'cvfW');
  SP('เด็ก', 'ดอ-เอ-ไม้ไต่คู้-กอ-เด็ก', 'cvvfW'); SP('เป็ด', 'ปอ-เอ-ไม้ไต่คู้-ดอ-เป็ด', 'cvvfW'); SP('เร็ว', 'รอ-เอ-ไม้ไต่คู้-วอ-เร็ว', 'cvvfW'); SP('เล็ก', 'ลอ-เอ-ไม้ไต่คู้-กอ-เล็ก', 'cvvfW'); SP('แข็ง', 'ขอ-แอ-ไม้ไต่คู้-งอ-แข็ง', 'cvvfW');
  SP('เดิน', 'ดอ-เอ-สระอิ-นอ-เดิน', 'cvvfW'); SP('เกิน', 'กอ-เอ-สระอิ-นอ-เกิน', 'cvvfW');
  const SP_LEVELS = {
    sp1: ['ตา', 'ปู', 'ผี', 'มือ', 'ฝา', 'ขา', 'นา', 'ยา', 'ปี', 'ดี', 'มี', 'กา', 'เสือ', 'เรือ', 'ใบ', 'ไป'],
    sp2: ['จาน', 'ลิง', 'ถุง', 'ดิน', 'กิน', 'บิน', 'ปาก', 'พาน', 'ฐาน', 'ดาว', 'ขาว', 'ยาว', 'ขาย', 'ลาย', 'นาย', 'ชาย', 'แมว', 'ยุง', 'รูป', 'ชอบ', 'ปีก', 'มีด'],
    sp3: ['ข้าว', 'ช้าง', 'ผึ้ง', 'ฉิ่ง', 'นิ้ว', 'ว่าย', 'ข่าว', 'น้อง', 'ร้อง', 'แม่', 'เต่า', 'ไก่', 'ม้า', 'ปู่', 'พ่อ', 'น้ำ', 'เสื้อ'],
    sp4: ['ฟัน', 'ผัก', 'รัก', 'จับ', 'ตัก', 'มัด', 'กัน', 'เด็ก', 'เป็ด', 'เร็ว', 'เล็ก', 'แข็ง', 'เดิน', 'เกิน']
  };
  // ชื่อชิ้นส่วนที่ใช้เป็นตัวลวงตอนสะกด
  const C_NAMES = ['กอ', 'ขอ', 'คอ', 'งอ', 'จอ', 'ดอ', 'ตอ', 'ถอ', 'นอ', 'บอ', 'ปอ', 'พอ', 'มอ', 'ยอ', 'รอ', 'ลอ', 'วอ', 'สอ', 'หอ', 'ฟอ', 'ผอ'];
  const F_NAMES = ['งอ', 'นอ', 'มอ', 'ยอ', 'วอ', 'กอ', 'ดอ', 'บอ'];
  const V_NAMES = ['อะ', 'อา', 'อิ', 'อี', 'อึ', 'อือ', 'อุ', 'อู', 'เอ', 'แอ', 'โอ', 'ออ', 'เออ', 'เอีย', 'เอือ', 'อัว', 'ไม้หันอากาศ', 'ไม้ไต่คู้', 'สระอิ', 'อำ', 'เอา'];
  const T_NAMES = ['ไม้เอก', 'ไม้โท', 'ไม้ตรี', 'ไม้จัตวา'];
  // ชิ้นส่วนสระที่อ่านตอนสะกด (อา เออ ใอไม้ม้วน) › แสดงบนจอเป็นรูปขีด (–า เ–อ ใ) ไม่ใช้ อ นำหน้า ส่วนเสียงพูดยังอ่านตามเดิม
  const V_SHOW = { 'อะ': '–ะ', 'อา': '–า', 'อิ': '–ิ', 'อี': '–ี', 'อึ': '–ึ', 'อือ': '–ื', 'อุ': '–ุ', 'อู': '–ู', 'เอ': 'เ–', 'แอ': 'แ–', 'โอ': 'โ–', 'ออ': '–อ', 'เออ': 'เ–อ', 'เอีย': 'เ–ีย', 'เอือ': 'เ–ือ', 'อัว': '–ัว', 'อำ': '–ำ', 'เอา': 'เ–า', 'สระอิ': 'สระ –ิ', 'ใอไม้ม้วน': 'ใ', 'ไอไม้มลาย': 'ไ' };
  const tokShow = (t, role) => (role === 'v' && V_SHOW[t]) || t;
  const SP_COL = { c: '#1f1d36', v: '#e0262e', f: '#1f5fd8', t: '#16a34a', w: '#6a64a0', W: '#2d2a5e' };

  /* ---------- ประโยค (ประธาน กริยา กรรม ...) ---------- */
  // [รหัส, ประโยค, [คำ...], บทบาทของแต่ละคำ, ภาพ, บท]   บทบาท: s ประธาน(ใคร/อะไร) v กริยา(ทำอะไร) o กรรม(กับอะไร) w คำเชื่อม l ที่ไหน a คำขยาย
  const SENT_ROWS = [
    ['run', 'เด็กชายวิ่ง', ['เด็กชาย', 'วิ่ง'], 'sv', ACT_('run', 'tom'), 'se1'], ['walk', 'เด็กหญิงเดิน', ['เด็กหญิง', 'เดิน'], 'sv', ACT_('walk', 'mei'), 'se1'],
    ['jump', 'เด็กชายกระโดด', ['เด็กชาย', 'กระโดด'], 'sv', ACT_('jump', 'tom'), 'se1'], ['dance', 'เด็กหญิงเต้น', ['เด็กหญิง', 'เต้น'], 'sv', ACT_('dance', 'mei'), 'se1'],
    ['sleep', 'เด็กหญิงนอน', ['เด็กหญิง', 'นอน'], 'sv', ACT_('sleep', 'mei'), 'se1'], ['swim', 'เด็กชายว่ายน้ำ', ['เด็กชาย', 'ว่ายน้ำ'], 'sv', ACT_('swim', 'tom'), 'se1'],
    ['dadwalk', 'พ่อเดิน', ['พ่อ', 'เดิน'], 'sv', ACT_('walk', 'dad'), 'se1'], ['momsleep', 'แม่นอน', ['แม่', 'นอน'], 'sv', ACT_('sleep', 'mom'), 'se1'], ['tsing', 'ครูร้องเพลง', ['ครู', 'ร้องเพลง'], 'sv', ACT_('sing', 'teacherF'), 'se1'],
    ['read', 'เด็กหญิงอ่านหนังสือ', ['เด็กหญิง', 'อ่าน', 'หนังสือ'], 'svo', ACT_('read', 'mei'), 'se2'], ['write', 'เด็กชายเขียนหนังสือ', ['เด็กชาย', 'เขียน', 'หนังสือ'], 'svo', ACT_('write', 'tom'), 'se2'],
    ['drink', 'แม่ดื่มน้ำ', ['แม่', 'ดื่ม', 'น้ำ'], 'svo', ACT_('drink', 'mom'), 'se2'], ['eat', 'พ่อกินแอปเปิล', ['พ่อ', 'กิน', 'แอปเปิล'], 'svo', ACT_('eat', 'dad'), 'se2'],
    ['ball', 'เด็กชายเล่นลูกบอล', ['เด็กชาย', 'เล่น', 'ลูกบอล'], 'svo', ACT_('play', 'tom'), 'se2'], ['sing', 'เด็กหญิงร้องเพลง', ['เด็กหญิง', 'ร้อง', 'เพลง'], 'svo', ACT_('sing', 'mei'), 'se2'],
    ['tread', 'ครูอ่านหนังสือ', ['ครู', 'อ่าน', 'หนังสือ'], 'svo', ACT_('read', 'teacherF'), 'se2'], ['brush', 'เด็กชายแปรงฟัน', ['เด็กชาย', 'แปรง', 'ฟัน'], 'svo', DAY_('brush', 'tom'), 'se2'],
    ['catfish', 'แมวกินปลา', ['แมว', 'กิน', 'ปลา'], 'svo', G_(A_('cat'), A_('fish')), 'se2'], ['monkey', 'ลิงกินกล้วย', ['ลิง', 'กิน', 'กล้วย'], 'svo', G_(A_('monkey'), T_('banana')), 'se2'],
    ['duck', 'เป็ดกินขนมปัง', ['เป็ด', 'กิน', 'ขนมปัง'], 'svo', G_(A_('duck'), T_('bread')), 'se2'], ['elephant', 'ช้างกินกล้วย', ['ช้าง', 'กิน', 'กล้วย'], 'svo', G_(A_('elephant'), T_('banana')), 'se2'],
    ['catdesk', 'แมวอยู่บนโต๊ะ', ['แมว', 'อยู่', 'บน', 'โต๊ะ'], 'svwl', G_(A_('cat'), T_('desk')), 'se3'], ['birdtree', 'นกอยู่บนต้นไม้', ['นก', 'อยู่', 'บน', 'ต้นไม้'], 'svwl', G_(A_('bird'), T_('tree')), 'se3'],
    ['fishwater', 'ปลาอยู่ในน้ำ', ['ปลา', 'อยู่', 'ใน', 'น้ำ'], 'svwl', G_(A_('fish'), T_('water')), 'se3'], ['pencilbag', 'ดินสออยู่ในกระเป๋า', ['ดินสอ', 'อยู่', 'ใน', 'กระเป๋า'], 'svwl', G_(T_('pencil'), T_('bag')), 'se3'],
    ['bookdesk', 'หนังสืออยู่บนโต๊ะ', ['หนังสือ', 'อยู่', 'บน', 'โต๊ะ'], 'svwl', G_(T_('book'), T_('desk')), 'se3'], ['momhome', 'แม่อยู่ที่บ้าน', ['แม่', 'อยู่', 'ที่', 'บ้าน'], 'svwl', G_(K_('mom', 'happy'), T_('home')), 'se3'],
    ['dadzoo', 'พ่อไปสวนสัตว์', ['พ่อ', 'ไป', 'สวนสัตว์'], 'svl', G_(K_('dad', 'happy'), T_('zoo')), 'se3'], ['kidschool', 'เด็กชายไปโรงเรียน', ['เด็กชาย', 'ไป', 'โรงเรียน'], 'svl', G_(K_('tom', 'happy'), T_('school')), 'se3'],
    ['flowerpark', 'ดอกไม้อยู่ในสวน', ['ดอกไม้', 'อยู่', 'ใน', 'สวน'], 'svwl', G_(T_('flower'), T_('park')), 'se3'], ['teacherschool', 'ครูอยู่ที่โรงเรียน', ['ครู', 'อยู่', 'ที่', 'โรงเรียน'], 'svwl', G_(K_('teacherF', 'happy'), T_('school')), 'se3'],
    ['redapple', 'แอปเปิลสีแดง', ['แอปเปิล', 'สี', 'แดง'], 'swa', T_('apple', 1, 'red'), 'se4'], ['yellowbanana', 'กล้วยสีเหลือง', ['กล้วย', 'สี', 'เหลือง'], 'swa', T_('banana', 1, 'yellow'), 'se4'],
    ['greentree', 'ต้นไม้สีเขียว', ['ต้นไม้', 'สี', 'เขียว'], 'swa', T_('tree', 1, 'green'), 'se4'], ['blueball', 'ลูกบอลสีฟ้า', ['ลูกบอล', 'สี', 'ฟ้า'], 'swa', T_('ball', 1, 'blue'), 'se4'],
    ['pinkflower', 'ดอกไม้สีชมพู', ['ดอกไม้', 'สี', 'ชมพู'], 'swa', T_('flower', 1, 'pink'), 'se4'], ['purplebag', 'กระเป๋าสีม่วง', ['กระเป๋า', 'สี', 'ม่วง'], 'swa', T_('bag', 1, 'purple'), 'se4'],
    ['readschool', 'เด็กหญิงอ่านหนังสือที่โรงเรียน', ['เด็กหญิง', 'อ่าน', 'หนังสือ', 'ที่', 'โรงเรียน'], 'svowl', G_(ACT_('read', 'mei'), T_('school')), 'se4'],
    ['ballpark', 'เด็กชายเล่นลูกบอลที่สวน', ['เด็กชาย', 'เล่น', 'ลูกบอล', 'ที่', 'สวน'], 'svowl', G_(ACT_('play', 'tom'), T_('park')), 'se4'],
    ['catfishhome', 'แมวกินปลาที่บ้าน', ['แมว', 'กิน', 'ปลา', 'ที่', 'บ้าน'], 'svowl', G_(A_('cat'), A_('fish'), T_('home')), 'se4'],
    ['singschool', 'เด็กหญิงร้องเพลงที่โรงเรียน', ['เด็กหญิง', 'ร้อง', 'เพลง', 'ที่', 'โรงเรียน'], 'svowl', G_(ACT_('sing', 'mei'), T_('school')), 'se4']
  ];
  const SENT = {}; SENT_ROWS.forEach(r => { SENT[r[0]] = { id: r[0], text: r[1], words: r[2], roles: r[3], pic: r[4], lesson: r[5] }; });
  const ROLE_HINT = { s: 'ใคร', v: 'ทำอะไร', o: 'กับอะไร', w: 'คำเชื่อม', l: 'ที่ไหน', a: 'เป็นอย่างไร' };
  const ROLE_NAME = { s: 'ผู้ทำ (ประธาน)', v: 'ทำอะไร (กริยา)', o: 'สิ่งที่ถูกทำ (กรรม)', w: 'คำเชื่อม', l: 'สถานที่', a: 'คำขยาย' };
  const ROLE_COL2 = { s: '#3d8bff', v: '#e0262e', o: '#3fb54a', w: '#8a84b0', l: '#ff8a1e', a: '#9a5ae8' };
  const sentWords = rows => rows.map(id => SENT[id]);

  // คำที่ ROLES ของสีตัวอักษรยังไม่มี (ตรวจทีละคำ: c พยัญชนะ v สระ f ตัวสะกด t วรรณยุกต์)
  Object.assign(ROLES, {
    'ตั๋ว': 'cvtv', 'เตี๋ยว': 'vcvtvv', 'หมู': 'ccv', 'ขนม': 'ccf', 'หมด': 'ccf', 'ทราย': 'ccvf', 'เด็กชาย': 'vcvfcvf', 'เด็กหญิง': 'vcvfccvf', 'กระโดด': 'ccvvcf', 'ว่ายน้ำ': 'ctvfctv', 'ครู': 'ccv',
    'ร้องเพลง': 'ctvfvccf', 'หนังสือ': 'ccvfcvv', 'แอปเปิล': 'vcfvcvf', 'ลูกบอล': 'cvfcvf', 'เพลง': 'vccf', 'แปรง': 'vccf', 'กล้วย': 'cctvf', 'ขนมปัง': 'ccfcvf', 'อยู่': 'ccvt', 'ต้นไม้': 'ctfvct',
    'ดินสอ': 'cvfcv', 'กระเป๋า': 'ccvvctv', 'สวนสัตว์': 'cvfcvfff', 'โรงเรียน': 'vcfvcvvf', 'ดอกไม้': 'cvfvct', 'เหลือง': 'vccvvf', 'ชมพู': 'cfcv'
  });

  /* ---------- บทเรียนรอบ 2 ---------- */
  const T_ACTS = ['learn', 'tlisten', 'tname', 'tsort', 'memory', 'balloon'];
  const L2 = [
    { id: 'tone1', zone: 'tone', th: 'อักษรกลาง อักษรสูง อักษรต่ำ', mode: 'cls', items: ['tc:m', 'tc:h', 'tc:l'], min: 0, acts: ['learn', 'cquiz', 'classsort', 'balloon'] },
    { id: 'tone2', zone: 'tone', th: 'รูปวรรณยุกต์ 4 รูป', mode: 'mark', items: ['–่', '–้', '–๊', '–๋'], pool: ['–่', '–้', '–๊', '–๋'], min: 0, acts: ['learn', 'trace', 'listen', 'balloon'] },
    { id: 'tone3', zone: 'tone', th: 'เสียงวรรณยุกต์ 5 เสียง', mode: 'snd', items: ['tn:sa', 'tn:ek', 'tn:tho', 'tn:tri', 'tn:jat'], fam: 'm', kinds: ['live'], min: 0, acts: T_ACTS },
    { id: 'tone4', zone: 'tone', th: 'คำเป็น คำตาย', mode: 'ld', items: ['tl:live', 'tl:ds', 'tl:dl'], min: 0, acts: ['learn', 'lquiz', 'lsort', 'balloon'] },
    { id: 'tone5', zone: 'tone', th: 'ผันเสียงอักษรกลาง', mode: 'fam', items: ['tf:m:0', 'tf:m:1', 'tf:m:2', 'tf:m:3', 'tf:m:4', 'tf:m:5'], fam: 'm', min: 0, acts: T_ACTS },
    { id: 'tone6', zone: 'tone', th: 'ผันเสียงอักษรสูง', mode: 'fam', items: ['tf:h:0', 'tf:h:1', 'tf:h:2', 'tf:h:3', 'tf:h:4', 'tf:h:5'], fam: 'h', min: 0, acts: T_ACTS },
    { id: 'tone7', zone: 'tone', th: 'ผันเสียงอักษรต่ำ', mode: 'fam', items: ['tf:l:0', 'tf:l:1', 'tf:l:2', 'tf:l:3', 'tf:l:4', 'tf:l:5'], fam: 'l', min: 0, acts: T_ACTS },
    { id: 'f1', zone: 'final', th: 'แม่ ก กา แม่กง แม่กน แม่กม', items: ['m:ka', 'm:kng', 'm:kn', 'm:km'], mt: ['ka', 'kng', 'kn', 'km'], min: 0, acts: ['learn', 'mlisten', 'mpic', 'msort', 'mfill', 'memory', 'balloon'] },
    { id: 'f2', zone: 'final', th: 'แม่เกย แม่เกอว', items: ['m:kei', 'm:keo'], mt: ['kei', 'keo', 'kn'], min: 1, acts: ['learn', 'mlisten', 'mpic', 'msort', 'mfill', 'memory', 'balloon'] },
    { id: 'f3', zone: 'final', th: 'แม่กก แม่กด แม่กบ', items: ['m:kk', 'm:kd', 'm:kb'], mt: ['kk', 'kd', 'kb'], min: 2, acts: ['learn', 'mlisten', 'mpic', 'msort', 'mfill', 'memory', 'balloon'] },
    { id: 'f4', zone: 'final', th: 'รวมมาตราตัวสะกด 9 แม่', items: ['m:kng', 'm:kn', 'm:km', 'm:kei', 'm:keo', 'm:kk', 'm:kd', 'm:kb'], mt: ['ka', 'kng', 'kn', 'km', 'kei', 'keo', 'kk', 'kd', 'kb'], min: 3, acts: ['learn', 'mlisten', 'mpic', 'msort', 'mfill', 'memory', 'balloon'] },
    { id: 'sp1', zone: 'spell', th: 'สะกดคำง่าย ๆ (พยัญชนะ + สระ)', items: ['w:ตา', 'w:ปู', 'w:ผี', 'w:มือ', 'w:ฝา', 'w:เสือ', 'w:ใบ', 'w:ไป'], pool: SP_LEVELS.sp1, min: 0, acts: ['learn', 'sbuild', 'sletters', 'slisten', 'memory', 'match'] },
    { id: 'sp2', zone: 'spell', th: 'สะกดคำที่มีตัวสะกด', items: ['w:จาน', 'w:ลิง', 'w:ถุง', 'w:ดิน', 'w:ปาก', 'w:ดาว', 'w:แมว', 'w:รูป'], pool: SP_LEVELS.sp2, min: 1, acts: ['learn', 'sbuild', 'sletters', 'slisten', 'memory', 'match'] },
    { id: 'sp3', zone: 'spell', th: 'สะกดคำที่มีวรรณยุกต์', items: ['w:ข้าว', 'w:ช้าง', 'w:ผึ้ง', 'w:ฉิ่ง', 'w:นิ้ว', 'w:แม่', 'w:เต่า', 'w:น้ำ'], pool: SP_LEVELS.sp3, min: 2, acts: ['learn', 'sbuild', 'sletters', 'slisten', 'memory', 'match'] },
    { id: 'sp4', zone: 'spell', th: 'สะกดคำที่สระเปลี่ยนรูป', items: ['w:ฟัน', 'w:ผัก', 'w:จับ', 'w:เด็ก', 'w:เป็ด', 'w:เร็ว', 'w:แข็ง', 'w:เดิน'], pool: SP_LEVELS.sp4, min: 2, acts: ['learn', 'sbuild', 'sletters', 'slisten'] },
    { id: 'se1', zone: 'sent', th: 'ประโยคสั้น ใคร ทำอะไร', items: ['se:run', 'se:walk', 'se:sleep', 'se:swim'], pool: ['run', 'walk', 'jump', 'dance', 'sleep', 'swim', 'dadwalk', 'momsleep', 'tsing'], min: 0, acts: ['learn', 'sentbuild', 'spic', 'sfill', 'sheard', 'memory'] },
    { id: 'se2', zone: 'sent', th: 'ประโยค ใคร ทำอะไร กับอะไร', items: ['se:read', 'se:drink', 'se:ball', 'se:catfish'], pool: ['read', 'write', 'drink', 'eat', 'ball', 'sing', 'tread', 'brush', 'catfish', 'monkey', 'duck', 'elephant'], min: 1, acts: ['learn', 'sentbuild', 'spic', 'sfill', 'sheard', 'memory'] },
    { id: 'se3', zone: 'sent', th: 'ประโยคบอกที่อยู่', items: ['se:catdesk', 'se:fishwater', 'se:momhome', 'se:kidschool'], pool: ['catdesk', 'birdtree', 'fishwater', 'pencilbag', 'bookdesk', 'momhome', 'dadzoo', 'kidschool', 'flowerpark', 'teacherschool'], min: 2, acts: ['learn', 'sentbuild', 'spic', 'sfill', 'sheard', 'memory'] },
    { id: 'se4', zone: 'sent', th: 'ประโยคบอกสีและสถานที่', items: ['se:redapple', 'se:blueball', 'se:readschool', 'se:catfishhome'], pool: ['redapple', 'yellowbanana', 'greentree', 'blueball', 'pinkflower', 'purplebag', 'readschool', 'ballpark', 'catfishhome', 'singschool'], min: 3, acts: ['learn', 'sentbuild', 'spic', 'sfill', 'sheard', 'memory'] }
  ];
  L2.forEach(l => { l.r2 = true; LESSONS.push(l); });

  /* ---------- ข้อมูลแสดงผลของรายการรอบ 2 ---------- */
  function info(x) {
    if (typeof x !== 'string') return null; const p = x.slice(0, 2);
    if (p === 'w:') {
      const w = x.slice(2), s = SYL[w], sp = SPELL[w];
      return { key: x, kind: 'w', text: w, say: w, sub: '', pic: picOf(w), roles: rolesOf(w), syl: s || null, spell: sp || null, mt: wordMt(w) };
    }
    if (p === 'm:') { const m = MT(x.slice(2)); return { key: x, kind: 'm', text: m.text, say: m.say, sub: m.note, pic: null, mt: m, ex: m.words.slice(0, 4) }; }
    if (x.startsWith('tn:')) { const t = TONES[x.slice(3)]; return { key: x, kind: 'n', text: t.name, say: t.say, sub: t.desc, pic: null, tone: x.slice(3), ex: t.ex }; }
    if (x.startsWith('tc:')) { const c = CLASSES[x.slice(3)]; return { key: x, kind: 'k', rule: 'cls', text: c.name, say: c.name, sub: c.tip, pic: null, cls: x.slice(3), cdata: c }; }
    if (x.startsWith('tl:')) { const l = LD[x.slice(3)]; return { key: x, kind: 'k', rule: 'ld', text: l.th, say: l.say, sub: l.tip, pic: null, ld: l.id, ldata: l, ex: l.ex }; }
    if (x.startsWith('tf:')) {
      const [, f, ci] = x.split(':'), c = TONE_C[f][+ci];
      const rows = CHART_ROWS[f].map(r => ({ kind: r[0], th: r[1], v: r[2], cells: TONE_IDS.map(t => { const mk = markFor(f, r[0], t); return mk == null ? null : { mark: mk, tone: t, text: toneWord(c, r[2], mk) }; }) }));
      const syls = [].concat(...rows.map(r => r.cells.filter(Boolean)));
      return { key: x, kind: 'f', text: rows[0].cells.find(Boolean).text, say: rows[0].cells.filter(Boolean).map(q => q.text).join(' '), sub: CLS_TH[f] + ' (พยัญชนะ ' + c + ')', pic: null, fam: f, c, rows, syls };
    }
    if (x.startsWith('se:')) { const s = SENT[x.slice(3)]; return { key: x, kind: 's', text: s.text, say: s.text, sub: '', pic: s.pic, sent: s }; }
    return null;
  }

  /* ================= ตัวสร้างกิจกรรม ================= */
  const famOf = lesson => lesson.fam || 'm';
  const kindsOf = lesson => lesson.kinds || ['live', 'ds', 'dl'];
  const sylPool = (lesson, fam) => { const f = fam || famOf(lesson), ks = kindsOf(lesson); return Object.keys(SYL).filter(t => SYL[t].cls === f && ks.includes(SYL[t].kind)); };
  const toneIdsOf = (fam, kinds) => uniq([].concat(...(kinds || ['live', 'ds', 'dl']).map(k => Object.keys(TONE_TAB[fam][k]).map(m => TONE_TAB[fam][k][m]))));
  const basesOf = lesson => { const f = famOf(lesson), out = []; kindsOf(lesson).forEach(k => TONE_BASES[f][k].forEach((b, i) => out.push({ f, k, c: b[0], v: b[1], id: f + ':' + k + ':' + i }))); return out; };
  const consOfClass = c => CONS.filter(r => r[3] === c).map(r => r[0]);
  const wordsOf = lesson => (lesson.pool || []).slice();
  const mtList = lesson => lesson.mt || [];
  const mtWords = (ids, onlyPic) => [].concat(...ids.map(id => MT(id).words)).filter(w => !onlyPic || picOf(w));
  const mkOpt = (key, o) => Object.assign({ id: key, text: info(key) ? info(key).text : key }, o || {});

  // ---- Quiz: เลือกคำตอบจากการ์ด ----
  function quiz(act, lesson, lv, seed) {
    const R = rng(seed), rounds = [], N = 6;
    if (act === 'tlisten' || act === 'tname') {
      // ข้อฟังเสียงต้องมีตัวเลือกอย่างน้อย 3 คำ จึงใช้เฉพาะชุดที่ผันได้ตั้งแต่ 3 รูปขึ้นไป (คำตายอักษรสูงมี 2 รูป ไม่ใช้ในข้อฟัง)
      const fam = famOf(lesson), all = basesOf(lesson), okB = act === 'tlisten' ? all.filter(b => Object.keys(TONE_TAB[fam][b.k]).length >= 3) : all, bs = shuf(okB.length ? okB : all, R);
      for (let r = 0; r < N; r++) {
        const base = bs[r % bs.length], marks = Object.keys(TONE_TAB[fam][base.k]), mk = pick(marks, R), syl = toneWord(base.c, base.v, mk), s = SYL[syl], name = TONES[s.tone].name;
        if (act === 'tlisten') {
          const variants = shuf(marks.filter(m => m !== mk), R).slice(0, Math.min(marks.length - 1, nOpt(lv) - 1)).concat([mk]), opts = shuf(variants.map(m => toneWord(base.c, base.v, m)), R);
          rounds.push({ mode: 'hear', say: syl, head: 'ฟังเสียงวรรณยุกต์ แล้วเลือกคำที่ได้ยิน', label: 'หาคำที่เป็นเสียง' + name, opts: opts.map(t => mkOpt('w:' + t, { sub: lv <= 1 ? MARK_NAME[SYL[t].mark] : '' })), answer: 'w:' + syl,
            right: syl + ' ' + ruleText(s), wrong: Object.fromEntries(opts.map(t => ['w:' + t, t + ' ' + ruleText(SYL[t]) + ' ไม่ใช่เสียง' + name])) });
        } else {
          const names = shuf(TONE_IDS.filter(t => t !== s.tone), R).slice(0, nOpt(lv) - 1).concat([s.tone]), opts = shuf(names, R);
          rounds.push({ mode: 'see', say: syl, head: 'คำนี้เป็นเสียงอะไร', qKey: 'w:' + syl, opts: opts.map(t => ({ id: t, text: TONES[t].name, sub: 'เสียง', say: TONES[t].say })), answer: s.tone,
            right: syl + ' ' + ruleText(s), wrong: Object.fromEntries(opts.map(t => [t, 'ยังไม่ใช่ ' + syl + ' ' + ruleText(s)])) });
        }
      }
      return rounds;
    }
    if (act === 'cquiz') {
      // ตัวอักษรนี้เป็นอักษรหมู่อะไร (กลาง สูง ต่ำ) สลับหมู่ให้ครบ
      const order = shuf(['m', 'h', 'l', 'm', 'h', 'l'], R), used = {};
      order.forEach(cl => {
        const ch = shuf(consOfClass(cl).filter(x => !used[x]), R)[0]; used[ch] = 1; const inf = AK.info(ch), c = CLASSES[cl];
        const hint = cl === 'l' ? ch + ' ไม่อยู่ในอักษรกลางและอักษรสูง จึงเป็นอักษรต่ำ' : ch + ' อยู่ในคำท่อง “' + c.phrase + '”';
        rounds.push({ mode: 'see', say: inf.say, head: 'ตัวอักษรนี้เป็นอักษรหมู่อะไร', qText: ch, qRoles: 'c', opts: ['m', 'h', 'l'].map(q => ({ id: q, text: CLS_TH[q], say: CLS_TH[q] })), answer: cl,
          right: ch + ' เป็น' + CLS_TH[cl] + ' ' + (cl === 'l' ? 'ตัวที่เหลือ' : 'จากคำท่อง ' + c.phrase), wrong: Object.fromEntries(['m', 'h', 'l'].map(q => [q, q === cl ? '' : ch + ' ไม่ใช่' + CLS_TH[q] + ' ' + hint])) });
      });
      return rounds;
    }
    if (act === 'lquiz') {
      const ws = shuf(LDW, R), pickK = shuf(['live', 'ds', 'dl', 'live', 'ds', 'dl'], R), chosen = [];
      pickK.forEach(k => { const w = shuf(ws.filter(q => q[1] === k && !chosen.includes(q)), R)[0]; if (w) chosen.push(w); });
      chosen.forEach(w => rounds.push({ mode: 'see', say: w[0], head: 'คำนี้เป็นคำเป็นหรือคำตาย', qText: w[0], qRoles: rolesOf(w[0]), opts: ['live', 'ds', 'dl'].map(k => ({ id: k, text: LD[k].th, say: LD[k].say })), answer: w[1],
        right: w[0] + ' ' + w[2] + ' เป็น' + LD[w[1]].th, wrong: Object.fromEntries(['live', 'ds', 'dl'].map(k => [k, k === w[1] ? '' : w[0] + ' ' + w[2] + ' เป็น' + LD[w[1]].th + ' ไม่ใช่' + LD[k].th])) }));
      return rounds;
    }
    if (act === 'mlisten' || act === 'mpic' || act === 'mfill') {
      const ids = mtList(lesson), words = shuf(mtWords(ids, act === 'mpic' || act === 'mfill').filter(w => act !== 'mfill' || MT(wordMt(w)).fin.length), R), extra = MATRA.map(m => m.id).filter(id => !ids.includes(id));
      for (let r = 0; r < N; r++) {
        const w = words[r % words.length], mid = wordMt(w), m = MT(mid), fin = finalOf(w), pic = picOf(w);
        if (act === 'mfill') {
          const others = shuf(MATRA.filter(q => q.id !== mid && q.main), R).slice(0, nOpt(lv) - 1).map(q => q.main), letters = shuf(others.concat([fin]), R), chars = Array.from(w);
          rounds.push({ mode: 'see', say: w, head: 'เติมตัวสะกดให้ครบคำ', qText: chars.slice(0, -1).join(''), qRoles: rolesOf(w).slice(0, chars.length - 1), blank: true, qPic: pic, opts: letters.map(l => ({ id: l, text: l, color: '#1f5fd8' })), answer: fin,
            right: w + ' ตัวสะกดคือ ' + fin + ' อยู่ใน' + m.text, wrong: Object.fromEntries(letters.map(l => [l, l === fin ? '' : 'ตัวสะกดของ ' + w + ' คือ ' + fin + ' ไม่ใช่ ' + l])) });
        } else {
          const pool = shuf(uniq(ids.concat(shuf(extra, R))), R), take = Math.max(3, Math.min(nOpt(lv), pool.length)), keep = [mid].concat(pool.filter(i => i !== mid).slice(0, take - 1)), opts = shuf(keep, R).map(i => ({ id: i, text: MT(i).text, say: MT(i).say, color: MT_COL[MATRA.findIndex(q => q.id === i)] }));
          const why = fin && m.fin.length ? w + ' มีตัวสะกด ' + fin + ' ' + m.note.replace('ตัวสะกด', 'ตัวสะกด') + ' อยู่ใน' + m.text : w + ' ไม่มีตัวสะกด อยู่ใน' + m.text;
          rounds.push({ mode: 'hear', say: w, head: act === 'mpic' ? 'ดูภาพ ฟังชื่อ แล้วเลือกว่าคำนี้อยู่ในแม่ไหน' : 'ฟังคำ แล้วเลือกว่าคำนี้อยู่ในแม่ไหน', label: 'คำนี้อยู่ในแม่ไหน', qPic: act === 'mpic' ? pic : null, qKey: act === 'mpic' ? null : 'w:' + w, qShowOnlyNoVoice: act === 'mlisten', opts, answer: mid, right: why,
            wrong: Object.fromEntries(opts.map(o => [o.id, o.id === mid ? '' : w + ' ' + (m.fin.length ? 'ตัวสะกดคือ ' + fin : 'ไม่มีตัวสะกด') + ' ไม่ใช่' + o.text]))});
        }
      }
      return rounds;
    }
    if (act === 'slisten') {
      const pool = shuf(wordsOf(lesson).filter(w => SPELL[w]), R);
      for (let r = 0; r < N; r++) {
        const w = pool[r % pool.length], sp = SPELL[w], tk = sp.tokens.slice(0, -1), ds = nearMiss(w, sp, R).slice(0, nOpt(lv) - 1), opts = shuf([w].concat(ds), R);
        const tkS = tk.map((t, i) => tokShow(t, sp.roles[i]));
        rounds.push({ mode: 'hear', say: tk.join(' '), head: 'ฟังหรืออ่านการสะกด แล้วเลือกคำที่ถูกต้อง', qTokens: tkS, qRoles: sp.roles.slice(0, -1), qPic: picOf(w), opts: opts.map(o => ({ id: o, text: o, roles: rolesOf(o) })), answer: w,
          right: sp.tokens.map((t, i) => tokShow(t, sp.roles[i])).join(' ') + ' ได้คำว่า ' + w, wrong: Object.fromEntries(opts.map(o => [o, o === w ? '' : 'สะกดว่า ' + tkS.join(' ') + ' ได้ ' + w + ' ไม่ใช่ ' + o])) });
      }
      return rounds;
    }
    if (act === 'spic' || act === 'sheard' || act === 'sfill') {
      const ids = shuf(lesson.pool, R), wrongPool = shuf(Object.keys(SENT).filter(k => SENT[k].lesson === lesson.id), R);
      for (let r = 0; r < N; r++) {
        const s = SENT[ids[r % ids.length]], dist = shuf(Object.keys(SENT).filter(k => k !== s.id && SENT[k].lesson === lesson.id && SENT[k].text !== s.text), R).slice(0, nOpt(lv) - 1);
        if (act === 'sfill') {
          const cand = s.words.map((w, i) => i).filter(i => 'svoal'.includes(s.roles[i])), bi = pick(cand, R), want = s.words[bi], role = s.roles[bi];
          const pool = uniq([].concat(...Object.values(SENT).map(q => q.words.filter((w, i) => q.roles[i] === role)))).filter(w => w !== want && !s.words.includes(w)), ds = shuf(pool, R).slice(0, nOpt(lv) - 1), opts = shuf([want].concat(ds), R);
          rounds.push({ mode: 'see', say: s.text, head: 'ดูภาพ แล้วเติมคำที่หายไป', qPic: s.pic, qWords: s.words, qRoles: s.roles, blankAt: bi, opts: opts.map(o => ({ id: o, text: o, word: true })), answer: want, right: s.text, wrong: Object.fromEntries(opts.map(o => [o, o === want ? '' : 'คำว่า ' + o + ' ยังไม่ตรงกับภาพ ลองดูภาพอีกครั้ง'])) });
        } else {
          const opts = shuf([s.id].concat(dist), R);
          rounds.push({ mode: act === 'sheard' ? 'hear' : 'see', say: s.text, head: act === 'sheard' ? 'ฟังประโยค แล้วเลือกภาพที่ตรงกัน' : 'อ่านประโยค แล้วเลือกภาพที่ตรงกัน', label: 'อ่านประโยคแล้วเลือกภาพ', qWords: act === 'spic' ? s.words : null, qRoles: s.roles, qSentNoVoice: act === 'sheard' ? s.words : null,
            opts: opts.map(o => ({ id: o, pic: SENT[o].pic, text: '', tag: SENT[o].text })), answer: s.id, right: s.text, wrong: Object.fromEntries(opts.map(o => [o, o === s.id ? '' : 'ภาพนี้คือ “' + SENT[o].text + '” ไม่ใช่ “' + s.text + '”'])) });
        }
      }
      return rounds;
    }
    return rounds;
  }
  // คำที่สะกดผิดใกล้เคียง: เปลี่ยนวรรณยุกต์ หรือเปลี่ยนตัวสะกด (ต้องต่างจากคำตอบและต่างกันเอง)
  const MARKS = ['่', '้', '๊', '๋'];
  function insertTone(w, mk) {
    const ch = Array.from(w); let i = ch.findIndex(c => THAI_CONS(c)); if (i < 0) return w; i++;
    while (i < ch.length && /[ัิีึืุู็]/.test(ch[i])) i++;
    ch.splice(i, 0, mk); return ch.join('');
  }
  function nearMiss(w, sp, R) {
    const out = [], hasTone = /[่้๊๋]/.test(w), hasFinal = sp.roles.includes('f');
    if (hasTone) { const cur = w.match(/[่้๊๋]/)[0], bare = w.replace(/[่้๊๋]/, ''); out.push(bare); MARKS.filter(m => m !== cur).forEach(m => out.push(w.replace(cur, m))); }
    else { ['่', '้'].forEach(m => out.push(insertTone(w, m))); }
    if (hasFinal) { const f = finalOf(w), mt = wordMt(w) || '', fs = ['ง', 'น', 'ม', 'ก', 'ด', 'บ'].filter(x => x !== f && !(MT(mt) && MT(mt).fin.includes(x))); shuf(fs, R).slice(0, 2).forEach(x => out.push(Array.from(w).slice(0, -1).join('') + x)); }
    return shuf(uniq(out).filter(x => x !== w), R);
  }

  // ---- Order: เรียงชิ้นส่วนตามลำดับ (สะกดคำ · เรียงตัวอักษร · เรียงคำเป็นประโยค) ----
  function order(act, lesson, lv, seed) {
    const R = rng(seed), rounds = [], N = act === 'sentbuild' ? 4 : 5;
    if (act === 'sbuild') {
      const pool = shuf(wordsOf(lesson).filter(w => SPELL[w]), R);
      for (let r = 0; r < N; r++) {
        const w = pool[r % pool.length], sp = SPELL[w], tokens = sp.tokens.slice(), roles = sp.roles.split(''), extra = [];
        const byRole = { c: C_NAMES, v: V_NAMES, f: F_NAMES, t: T_NAMES };
        const want = lv + 1;
        roles.forEach((rc, i) => { if (extra.length < want && byRole[rc] && (rc === 'c' || rc === 'v' || rc === 't' || rc === 'f')) { const alt = shuf(byRole[rc].filter(x => !tokens.includes(x)), R)[0]; if (alt && R() < 0.8) extra.push({ t: alt, role: rc }); } });
        const nm = nearMiss(w, sp, R)[0]; if (nm && extra.length < want + 1) extra.push({ t: nm, role: 'W' });
        const tiles = shuf(tokens.map((t, i) => ({ t, role: roles[i] })).concat(extra.slice(0, want)), R);
        rounds.push({ head: 'สะกดคำนี้ แตะชิ้นส่วนให้ครบตามลำดับ', qPic: picOf(w), word: w, tokens, tileRoles: roles, tiles, slotHints: lv <= 0 ? roles.map(rc => ({ c: 'พยัญชนะ', v: 'สระ', f: 'ตัวสะกด', w: 'คำ', t: 'วรรณยุกต์', W: 'คำที่ได้' }[rc])) : null, say: w, speakEach: true, final: w });
      }
      return rounds;
    }
    if (act === 'sletters') {
      const pool = shuf(wordsOf(lesson), R);
      for (let r = 0; r < N; r++) {
        const w = pool[r % pool.length], ch = Array.from(w), rl = rolesOf(w).split(''), want = lv >= 2 ? 2 : lv >= 1 ? 1 : 0, avail = Array.from('กขคงจดตนบปพมยรลวสหอ').filter(c => !ch.includes(c)), ex = shuf(avail, R).slice(0, want).map(c => ({ t: c, role: 'c' }));
        rounds.push({ head: 'เรียงตัวอักษรให้เป็นคำ ตามที่ภาพบอก', qPic: picOf(w), word: w, tokens: ch, tileRoles: rl, tiles: shuf(ch.map((t, i) => ({ t, role: rl[i] })).concat(ex), R), slotHints: null, say: w, speakEach: false, final: w, letters: true });
      }
      return rounds;
    }
    // sentbuild
    const ids = shuf(lesson.pool, R);
    for (let r = 0; r < N; r++) {
      const s = SENT[ids[r % ids.length]], extraWords = [];
      const roleSet = uniq(s.roles.split('')).filter(c => 'svoal'.includes(c));
      for (let k = 0; k < lv && extraWords.length < lv; k++) { const rc = pick(roleSet, R), pool = uniq([].concat(...Object.values(SENT).map(q => q.words.filter((w, i) => q.roles[i] === rc)))).filter(w => !s.words.includes(w) && !extraWords.some(e => e.t === w)); if (pool.length) extraWords.push({ t: pick(pool, R), role: rc }); }
      const tiles = shuf(s.words.map((t, i) => ({ t, role: s.roles[i] })).concat(extraWords), R);
      rounds.push({ head: 'ดูภาพ แล้วเรียงคำเป็นประโยค', qPic: s.pic, word: s.text, tokens: s.words.slice(), tileRoles: s.roles.split(''), tiles, slotHints: lv <= 1 ? s.roles.split('').map(rc => ROLE_HINT[rc]) : null, say: s.text, speakEach: true, final: s.text, sentence: true, sentId: s.id });
    }
    return rounds;
  }

  // ---- Sort: แยกกลุ่ม (เสียงวรรณยุกต์ · มาตรา) ----
  function sortSet(act, lesson, lv, seed) {
    const R = rng(seed);
    if (act === 'classsort') {
      // แยกอักษรกลาง สูง ต่ำ (ใช้ไอคอนและฉากเดียวกับบทพยัญชนะ)
      const items = []; ['m', 'h', 'l'].forEach(cl => shuf(consOfClass(cl), R).slice(0, 3).forEach(ch => items.push({ key: ch, g: cl })));
      return { title: 'แยกหมู่อักษร', groups: [{ id: 'm', th: 'อักษรกลาง', color: '#3d8bff' }, { id: 'h', th: 'อักษรสูง', color: '#ff5a8a' }, { id: 'l', th: 'อักษรต่ำ', color: '#58c864' }], items: shuf(items, R) };
    }
    if (act === 'lsort') {
      const items = []; ['live', 'ds', 'dl'].forEach(k => shuf(LDW.filter(w => w[1] === k), R).slice(0, 3).forEach(w => items.push({ key: 'w:' + w[0], g: k })));
      return { title: 'แยกคำเป็น คำตาย', how: '1. การ์ดคำอยู่ในถาดด้านล่าง ลากแต่ละใบไปใส่ถังคำเป็น คำตายเสียงสั้น หรือคำตายเสียงยาว\n2. ดูสระและตัวสะกด: คำเป็นคือสระเสียงยาวไม่มีตัวสะกด หรือมีตัวสะกดแม่ กง กน กม เกย เกอว หรือสระ –ำ ใ ไ เ–า\n3. ถ้าวางผิด การ์ดจะเด้งกลับและบอกว่าคำนั้นเป็นคำชนิดไหน เพราะอะไร\n4. จัดครบทุกใบจึงผ่าน',
        groups: ['live', 'ds', 'dl'].map(k => ({ id: k, th: LD[k].th, color: LD[k].color })), notes: { live: 'สระยาวไม่มีตัวสะกด หรือตัวสะกด ง น ม ย ว', ds: 'สระเสียงสั้น', dl: 'สระเสียงยาว + ตัวสะกด ก ด บ' }, itemWord: true,
        items: shuf(items, R), why: key => { const w = LD_OF[key.slice(2)]; return w[0] + ' ' + w[2] + ' เป็น' + LD[w[1]].th; } };
    }
    if (act === 'tsort') {
      const fam = famOf(lesson), tids = toneIdsOf(fam, kindsOf(lesson)), gids = lesson.mode === 'snd' ? shuf(TONE_IDS, R).slice(0, 3) : tids.length > 4 ? shuf(tids, R).slice(0, 4) : tids;
      const pool = sylPool(lesson, fam).filter(t => gids.includes(SYL[t].tone)); const items = [];
      gids.forEach(g => { shuf(pool.filter(t => SYL[t].tone === g), R).slice(0, 2).forEach(t => items.push(t)); });
      shuf(pool.filter(t => !items.includes(t)), R).forEach(t => { if (items.length < 8 + (gids.length > 3 ? 1 : 0)) items.push(t); });
      const col = ['#3d8bff', '#ff5a8a', '#3fb54a', '#ffa21e', '#9a5ae8'];
      return { title: 'แยกเสียงวรรณยุกต์', how: '1. การ์ดพยางค์อยู่ในถาดด้านล่าง ลากแต่ละใบไปใส่ถังเสียงวรรณยุกต์ที่ถูกต้อง\n2. ดูหมู่ของพยัญชนะ คำเป็นหรือคำตาย และรูปวรรณยุกต์สีเขียว แล้วจึงตัดสินว่าอ่านเป็นเสียงอะไร\n3. ถ้าวางผิด การ์ดจะเด้งกลับและบอกว่าพยางค์นั้นอ่านเป็นเสียงอะไร เพราะอะไร\n4. จัดครบทุกใบจึงผ่าน',
        groups: gids.map((g, i) => ({ id: g, th: TONES[g].say, color: col[i % col.length] })), notes: Object.fromEntries(gids.map(g => [g, TONES[g].desc])), itemWord: true,
        items: shuf(items, R).map(t => ({ key: 'w:' + t, g: SYL[t].tone })), why: key => ruleText(SYL[key.slice(2)]) };
    }
    // msort
    const ids = lesson.mt.length > 4 ? shuf(lesson.mt, R).slice(0, 4) : lesson.mt, items = [];
    ids.forEach(id => shuf(MT(id).words, R).slice(0, 2).forEach(w => items.push({ key: 'w:' + w, g: id })));
    const rest = shuf([].concat(...ids.map(id => MT(id).words.map(w => ({ key: 'w:' + w, g: id })))).filter(it => !items.some(x => x.key === it.key)), R); rest.forEach(it => { if (items.length < 8 + (ids.length > 3 ? 1 : 0)) items.push(it); });
    return { title: 'แยกคำเข้าแม่', how: '1. การ์ดคำอยู่ในถาดด้านล่าง ลากแต่ละใบไปใส่ถังแม่ที่มีตัวสะกดตรงกับคำนั้น\n2. ดูตัวสะกดของคำ (ตัวสีน้ำเงิน) ว่าออกเสียงเป็นตัวอะไร\n3. ถ้าวางผิด การ์ดจะเด้งกลับและบอกว่าคำนั้นอยู่ในแม่อะไร\n4. จัดครบทุกใบจึงผ่าน',
      groups: ids.map((id, i) => ({ id, th: MT(id).text, color: MT_COL[MATRA.findIndex(q => q.id === id)] })), notes: Object.fromEntries(ids.map(id => [id, MT(id).fin.length ? MT(id).fin.slice(0, 7).join(' ') : 'ไม่มีตัวสะกด'])), itemWord: true,
      items: shuf(items, R), why: key => { const w = key.slice(2), m = MT(wordMt(w)); return w + (m.fin.length ? ' ตัวสะกดคือ ' + finalOf(w) : ' ไม่มีตัวสะกด') + ' อยู่ใน' + m.text; } };
  }

  // ---- Memory: เปิดป้าย ----
  function memory(lesson, lv, seed) {
    const R = rng(seed), z = lesson.zone, cards = []; let pairs = [];
    if (z === 'tone') {
      const fam = famOf(lesson), tids = lesson.mode === 'snd' ? TONE_IDS : toneIdsOf(fam, kindsOf(lesson));
      tids.forEach(t => { const cand = sylPool(lesson, fam).filter(s => SYL[s].tone === t); pairs.push({ a: { kind: 'text', text: pick(cand, R), say: null, sub: '' }, b: { kind: 'text', text: TONES[t].say, sub: '', say: TONES[t].say }, tone: t }); });
      pairs.forEach(p => { p.a.say = p.a.text; });
    } else if (z === 'final') {
      const ws = shuf(mtWords(lesson.mt, true), R).slice(0, 6); pairs = ws.map(w => ({ a: { kind: 'text', text: w, say: w, sub: '' }, b: { kind: 'pic', spec: picOf(w), say: w } }));
    } else if (z === 'spell') {
      const ws = shuf(wordsOf(lesson).filter(w => picOf(w)), R).slice(0, 6); pairs = ws.map(w => ({ a: { kind: 'text', text: w, say: w, sub: '' }, b: { kind: 'pic', spec: picOf(w), say: w } }));
    } else {
      const ids = shuf(lesson.pool, R).slice(0, 6); pairs = ids.map(id => ({ a: { kind: 'text', text: SENT[id].text, say: SENT[id].text, sub: '' }, b: { kind: 'pic', spec: SENT[id].pic, say: SENT[id].text } }));
    }
    pairs.forEach((p, i) => { cards.push(Object.assign({ id: 'a' + i, pair: i }, p.a)); cards.push(Object.assign({ id: 'b' + i, pair: i }, p.b)); });
    return { pairs: pairs.length, cards: shuf(cards, R) };
  }

  // ---- Shooter: ยิงลูกโป่ง ----
  function shooter(lesson, lv, seed) {
    const R = rng(seed), z = lesson.zone, speed = [0.7, 0.85, 1, 1.15][lv];
    if (lesson.mode === 'mark') {
      const items = lesson.items; return shuf(items, R).slice(0, 3).map(t => ({ target: t, goods: [t], need: 3, decoys: items.filter(x => x !== t), speed, prompt: 'ยิงลูกโป่งที่เป็น', promptSay: TONE_NAME[t] }));
    }
    if (lesson.mode === 'cls') {
      return shuf(['m', 'h', 'l'], R).map(cl => ({ target: 'tc:' + cl, goods: shuf(consOfClass(cl), R).slice(0, 6), need: 3, decoys: shuf([].concat(...['m', 'h', 'l'].filter(q => q !== cl).map(consOfClass)), R).slice(0, 5 + lv), speed, prompt: 'ยิงลูกโป่งตัวอักษร', speakTarget: true }));
    }
    if (lesson.mode === 'ld') {
      return shuf(['live', 'ds', 'dl'], R).map(k => ({ target: 'tl:' + k, goods: shuf(LDW.filter(w => w[1] === k), R).slice(0, 6).map(w => 'w:' + w[0]), need: 3, decoys: shuf(LDW.filter(w => w[1] !== k), R).slice(0, 5 + lv).map(w => 'w:' + w[0]), speed, prompt: 'ยิงลูกโป่งที่เป็น', speakTarget: true }));
    }
    if (z === 'tone') {
      const fam = famOf(lesson), tids = lesson.mode === 'snd' ? TONE_IDS : toneIdsOf(fam, kindsOf(lesson)), pool = sylPool(lesson, fam), targets = shuf(tids, R).slice(0, 3);
      return targets.map(t => ({ target: 'tn:' + t, goods: shuf(pool.filter(s => SYL[s].tone === t), R).slice(0, 6).map(s => 'w:' + s), need: 3, decoys: shuf(pool.filter(s => SYL[s].tone !== t), R).slice(0, 5 + lv).map(s => 'w:' + s), speed, prompt: 'ยิงลูกโป่งที่เป็น', speakTarget: true }));
    }
    const ids = shuf(lesson.mt, R).slice(0, 3);
    return ids.map(id => ({ target: 'm:' + id, goods: shuf(MT(id).words, R).slice(0, 6).map(w => 'w:' + w), need: 3, decoys: shuf([].concat(...lesson.mt.filter(q => q !== id).map(q => MT(q).words)), R).slice(0, 5 + lv).map(w => 'w:' + w), speed, prompt: 'ยิงลูกโป่งคำที่อยู่ใน', speakTarget: true }));
  }

  // ---- Match: ลากคำไปวางที่ภาพ (บทสะกดคำ) ----
  function match(lesson, lv, seed) {
    const R = rng(seed), ws = shuf(wordsOf(lesson).filter(w => picOf(w)), R), rounds = [];
    for (let r = 0; r < 2; r++) { const pick4 = ws.slice(r * 4, r * 4 + 4); if (pick4.length < 3) break; const keys = pick4.map(w => 'w:' + w); rounds.push({ pairs: keys, order: shuf(keys, R), blind: true }); }
    if (rounds.length < 2 && rounds.length) rounds.push({ pairs: rounds[0].pairs.slice(0, 3), order: shuf(rounds[0].pairs.slice(0, 3), R), blind: true });
    return rounds;
  }

  return { tokShow, TONES, TONE_IDS, TONE_OF, TONE_TAB, TONE_C, TONE_BASES, CHART_ROWS, CLASSES, LD, LDW, kindTh, markFor, kindsOf, MARK_NAME, CLS_TH, SYL, toneWord, ruleText, MARK_EX, MATRA, MT, MT_COL, WORDS, picOf, SPELL, SP_LEVELS, SP_COL, SENT, ROLE_HINT, ROLE_NAME, ROLE_COL2, L2, info, quiz, order, sortSet, memory, shooter, match, wordMt, finalOf, nearMiss, insertTone, famOf, sylPool, toneIdsOf, C_NAMES, V_NAMES, F_NAMES, T_NAMES, sentWords };
})();
// ผูกเข้ากับ AK: ตัวสร้างกิจกรรมใหม่ และชื่อ/ไอคอนของกิจกรรมรอบ 2
AK.makeQuiz = R2.quiz; AK.makeOrder = R2.order;
Object.assign(AK.ACT_META, {
  tlisten: { th: 'ฟังเสียงวรรณยุกต์', icon: 'tone', color: '#17c4a8', desc: 'ฟังเสียงแล้วเลือกคำที่ผันเสียงตรงกัน' },
  cquiz: { th: 'ตัวนี้อักษรหมู่อะไร', icon: 'tone', color: '#3d8bff', desc: 'ดูตัวอักษรแล้วเลือกว่าเป็นอักษรกลาง สูง หรือต่ำ' },
  lquiz: { th: 'คำเป็น คำตาย', icon: 'tone', color: '#ff8a1e', desc: 'ดูคำแล้วเลือกว่าเป็นคำเป็นหรือคำตาย' },
  lsort: { th: 'แยกคำเป็น คำตาย', icon: 'sort', color: '#58c864', desc: 'ลากคำไปใส่ถังคำเป็น คำตายเสียงสั้น คำตายเสียงยาว' },
  tname: { th: 'คำนี้เสียงอะไร', icon: 'tone', color: '#3d8bff', desc: 'ดูพยางค์แล้วบอกว่าเป็นเสียงอะไร' },
  tsort: { th: 'แยกเสียงวรรณยุกต์', icon: 'sort', color: '#58c864', desc: 'ลากพยางค์ใส่ถังตามเสียง' },
  mlisten: { th: 'ฟังคำ เลือกแม่', icon: 'final', color: '#9a5ae8', desc: 'ฟังคำแล้วเลือกว่าอยู่ในแม่ไหน' },
  mpic: { th: 'ดูภาพ เลือกแม่', icon: 'final', color: '#3d8bff', desc: 'ดูภาพแล้วเลือกแม่ที่คำนั้นอยู่' },
  msort: { th: 'แยกคำเข้าแม่', icon: 'sort', color: '#58c864', desc: 'ลากคำไปใส่ถังแม่ที่ถูกต้อง' },
  mfill: { th: 'เติมตัวสะกดท้ายคำ', icon: 'change', color: '#e8452c', desc: 'เติมตัวสะกดให้คำครบ' },
  sbuild: { th: 'สะกดคำ', icon: 'spell', color: '#ff8a1e', desc: 'แตะชิ้นส่วนสะกดคำตามลำดับ' },
  sletters: { th: 'เรียงตัวอักษร', icon: 'spell', color: '#17c4a8', desc: 'เรียงตัวอักษรให้เป็นคำตามภาพ' },
  slisten: { th: 'ฟังการสะกด', icon: 'listen', color: '#3d8bff', desc: 'ฟังการสะกดแล้วเลือกคำที่ถูก' },
  sentbuild: { th: 'เรียงคำเป็นประโยค', icon: 'sent', color: '#ee4a4a', desc: 'ดูภาพแล้วเรียงคำเป็นประโยค' },
  spic: { th: 'อ่านประโยค เลือกภาพ', icon: 'sent', color: '#9a5ae8', desc: 'อ่านประโยคแล้วเลือกภาพที่ตรงกัน' },
  sfill: { th: 'เติมคำในประโยค', icon: 'change', color: '#ffa21e', desc: 'ดูภาพแล้วเติมคำที่หายไป' },
  sheard: { th: 'ฟังประโยค เลือกภาพ', icon: 'listen', color: '#17c4a8', desc: 'ฟังประโยคแล้วเลือกภาพ' }
});
