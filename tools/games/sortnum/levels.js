/* ===== เรียงลำดับตัวเลข (NUMBER RUN): 8 โลก × 6 ด่าน = 48 ด่าน · ด่านที่ 6 ของทุกโลกคือบอส =====
   แต่ละด่านคือชุดโจทย์วนตามจำนวนรอบ: p = { rounds, kinds: [โจทย์], time?: วินาที }
   ชนิดโจทย์ (k) ตรงกับตัวสร้างโจทย์ใน mathkit/mk-gen.js: sort · cmp · maxmin · neighbor · missing · skip · between · place
   ใช้ทั้งในเกม (window.SN_LV) และทดสอบด้วย Node */
(function (root) {
  const L = (th, d, p, boss) => ({ th, d, k: 'round', p, boss: !!boss });
  const so = o => Object.assign({ k: 'sort', n: 4, dir: 'asc' }, o), cm = o => Object.assign({ k: 'cmp', mode: 'sign' }, o), mm = o => Object.assign({ k: 'maxmin', n: 4 }, o), nb = o => Object.assign({ k: 'neighbor' }, o),
    ms = o => Object.assign({ k: 'missing', len: 5 }, o), sk = o => Object.assign({ k: 'skip' }, o), bt = o => Object.assign({ k: 'between' }, o), pl = o => Object.assign({ k: 'place' }, o);
  const WORLDS = [
    { id: 'w10', th: 'เลขถึงสิบ', skill: 'เรียงเลข 1 ถึง 10 จากน้อยไปมาก และหาเลขที่มาก่อน มาหลัง', color: '#3d8bff', icon: 'numI', levels: [
      L('เรียงสามตัว', 'แตะเลขจากน้อยไปมาก หรือลากไปวางในช่อง', { rounds: 4, kinds: [so({ n: 3, lo: 1, hi: 10 })] }),
      L('เรียงสี่ตัว', 'เรียงเลขสี่ตัวจากน้อยไปมาก', { rounds: 5, kinds: [so({ n: 4, lo: 1, hi: 10 })] }),
      L('มากไปน้อย', 'คราวนี้เรียงจากมากไปน้อย', { rounds: 5, kinds: [so({ n: 3, lo: 1, hi: 10, dir: 'desc' }), so({ n: 4, lo: 1, hi: 10, dir: 'desc' })] }),
      L('มาก่อน มาหลัง', 'เลขอะไรมาก่อน หรือมาหลังเลขที่กำหนด', { rounds: 5, kinds: [nb({ lo: 2, hi: 9, opts: 3 })] }),
      L('มากที่สุด น้อยที่สุด', 'เลือกเลขที่มากที่สุดหรือน้อยที่สุด', { rounds: 5, kinds: [mm({ n: 3, lo: 1, hi: 10 })] }),
      L('จอมเรียงสิบตัว', 'ด่านบอส เรียงและตอบให้ถูกทุกข้อ', { rounds: 6, kinds: [so({ n: 5, lo: 1, hi: 10, dir: 'mix' }), nb({ lo: 2, hi: 9 }), mm({ n: 4, lo: 1, hi: 10 })] }, true)
    ] },
    { id: 'w20', th: 'เลขถึงยี่สิบ', skill: 'เรียงเลขถึง 20 เปรียบเทียบ มากกว่า น้อยกว่า และหาเลขที่หายไป', color: '#ff9a2e', icon: 'sortI', levels: [
      L('เรียงถึงยี่สิบ', 'เรียงเลขสี่ตัวจากน้อยไปมาก', { rounds: 5, kinds: [so({ n: 4, lo: 1, hi: 20 })] }),
      L('เรียงได้ทั้งสองทาง', 'ดูโจทย์ให้ดีว่าต้องเรียงทางไหน', { rounds: 5, kinds: [so({ n: 5, lo: 1, hi: 20, dir: 'mix' })] }),
      L('เครื่องหมายปากจระเข้', 'ปากจระเข้หันไปทางเลขที่มากกว่า', { rounds: 6, kinds: [cm({ lo: 1, hi: 20 })] }),
      L('เลขที่หายไป', 'ดูแถวเลขแล้วหาตัวที่หายไป', { rounds: 5, kinds: [ms({ lo: 1, hi: 20 })] }),
      L('ใครมากกว่า', 'เลขใกล้กันมาก ต้องดูให้ดี', { rounds: 6, kinds: [cm({ lo: 1, hi: 20, mode: 'which', near: true }), mm({ n: 4, lo: 1, hi: 20 })] }),
      L('จอมเลขยี่สิบ', 'ด่านบอส รวมทุกอย่างของเลขถึงยี่สิบ', { rounds: 7, kinds: [so({ n: 6, lo: 1, hi: 20, dir: 'mix' }), ms({ lo: 1, hi: 20 }), cm({ lo: 1, hi: 20, near: true })] }, true)
    ] },
    { id: 'w50', th: 'เลขสองหลัก', skill: 'เรียงเลขสองหลักโดยดูหลักสิบก่อน แล้วค่อยดูหลักหน่วย', color: '#3fbf6a', icon: 'grid4', levels: [
      L('หลักสิบก่อน', 'เลขสองหลัก ดูหลักสิบก่อนเสมอ', { rounds: 5, kinds: [so({ n: 4, lo: 10, hi: 50 })] }),
      L('มากไปน้อย เลขสองหลัก', 'เรียงจากมากไปน้อย', { rounds: 5, kinds: [so({ n: 4, lo: 10, hi: 50, dir: 'desc' }), so({ n: 5, lo: 10, hi: 50, dir: 'mix' })] }),
      L('เทียบเลขสองหลัก', 'เลือกเครื่องหมายให้ถูก', { rounds: 6, kinds: [cm({ lo: 10, hi: 50, near: true })] }),
      L('มาก่อน มาหลัง สองหลัก', 'เลขอะไรมาก่อน มาหลัง', { rounds: 5, kinds: [nb({ lo: 11, hi: 49 })] }),
      L('เลขที่หายไป สองหลัก', 'ต่อแถวเลขให้ครบ', { rounds: 5, kinds: [ms({ lo: 10, hi: 50, dir: 'mix' })] }),
      L('จอมเลขห้าสิบ', 'ด่านบอส เรียงและเทียบเลขสองหลัก', { rounds: 7, kinds: [so({ n: 6, lo: 10, hi: 50, dir: 'mix' }), cm({ lo: 10, hi: 50, near: true }), mm({ n: 5, lo: 10, hi: 50 })] }, true)
    ] },
    { id: 'w100', th: 'ร้อยแรก', skill: 'เรียง เทียบ และหาเลขที่อยู่ระหว่างกัน ในช่วง 1 ถึง 100', color: '#8a5cf0', icon: 'puzzleI', levels: [
      L('เรียงถึงร้อย', 'เรียงเลขห้าตัวจากน้อยไปมาก', { rounds: 5, kinds: [so({ n: 5, lo: 1, hi: 100 })] }),
      L('มากไปน้อย ถึงร้อย', 'เรียงจากมากไปน้อย', { rounds: 5, kinds: [so({ n: 5, lo: 1, hi: 100, dir: 'desc' })] }),
      L('เทียบใกล้ ๆ กัน', 'เลขต่างกันนิดเดียว ดูให้ดี', { rounds: 6, kinds: [cm({ lo: 1, hi: 100, near: true }), cm({ lo: 1, hi: 100, mode: 'less', near: true })] }),
      L('อยู่ระหว่างกัน', 'เลขไหนอยู่ระหว่างสองตัวนี้', { rounds: 5, kinds: [bt({ lo: 1, hi: 99, gap: 10 })] }),
      L('มากที่สุดในร้อย', 'หาเลขที่มากที่สุดหรือน้อยที่สุด', { rounds: 5, kinds: [mm({ n: 5, lo: 1, hi: 100 })] }),
      L('จอมเลขร้อย', 'ด่านบอส เรียงเลขหกตัวและตอบให้ครบ', { rounds: 7, kinds: [so({ n: 6, lo: 1, hi: 100, dir: 'mix' }), bt({ lo: 1, hi: 99, gap: 8 }), mm({ n: 5, lo: 1, hi: 100 }), cm({ lo: 1, hi: 100, near: true })], time: 170 }, true)
    ] },
    { id: 'skip', th: 'นับข้าม', skill: 'นับเพิ่มทีละ 2 ทีละ 5 ทีละ 10 และหาเลขที่หายไปในแถว', color: '#ff5a8a', icon: 'boltI', levels: [
      L('นับทีละสอง', 'นับข้ามทีละ 2 แล้วหาเลขถัดไป', { rounds: 5, kinds: [sk({ step: 2, lo: 0, hi: 30 })] }),
      L('นับทีละห้า', 'นับข้ามทีละ 5', { rounds: 5, kinds: [sk({ step: 5, lo: 0, hi: 60 })] }),
      L('นับทีละสิบ', 'นับข้ามทีละ 10', { rounds: 5, kinds: [sk({ step: 10, lo: 0, hi: 100 })] }),
      L('นับถอยหลัง', 'นับลดลงทีละ 2 ทีละ 5 ทีละ 10', { rounds: 6, kinds: [sk({ step: 2, lo: 10, hi: 40, dir: 'down' }), sk({ step: 5, lo: 20, hi: 80, dir: 'down' }), sk({ step: 10, lo: 30, hi: 100, dir: 'down' })] }),
      L('แถวเลขข้ามช่อง', 'เติมเลขที่หายไปในแถวที่นับข้าม', { rounds: 6, kinds: [ms({ lo: 0, hi: 50, step: 2 }), ms({ lo: 0, hi: 100, step: 5 }), ms({ lo: 0, hi: 100, step: 10, dir: 'mix' })] }),
      L('จอมนักนับข้าม', 'ด่านบอส นับข้ามทุกแบบ', { rounds: 7, kinds: [sk({ step: 2, lo: 0, hi: 60, dir: 'mix' }), sk({ step: 5, lo: 0, hi: 100, dir: 'mix' }), ms({ lo: 0, hi: 100, step: 10, dir: 'mix' }), sk({ step: 10, lo: 0, hi: 100, dir: 'down' })] }, true)
    ] },
    { id: 'w999', th: 'เลขสามหลัก', skill: 'เรียงและเทียบเลขสามหลัก โดยดูหลักร้อย หลักสิบ แล้วหลักหน่วย', color: '#18b8a0', icon: 'listI', levels: [
      L('หลักร้อยก่อน', 'เลขสามหลัก ดูหลักร้อยก่อน', { rounds: 5, kinds: [so({ n: 4, lo: 100, hi: 999 })] }),
      L('หลักร้อยเท่ากัน', 'หลักร้อยเท่ากัน ต้องดูหลักสิบต่อ', { rounds: 5, kinds: [so({ n: 4, lo: 100, hi: 999, close: true, dir: 'mix' })] }),
      L('เทียบสามหลัก', 'เลือกเครื่องหมายให้ถูก', { rounds: 6, kinds: [cm({ lo: 100, hi: 999, near: true }), cm({ lo: 100, hi: 999, mode: 'which', near: true })] }),
      L('มาก่อน มาหลัง ทีละสิบ ทีละร้อย', 'ถอยหรือเดินหน้าทีละสิบ ทีละร้อย', { rounds: 6, kinds: [nb({ lo: 110, hi: 990, step: 10 }), nb({ lo: 200, hi: 900, step: 100 })] }),
      L('มากที่สุดสามหลัก', 'หาเลขที่มากที่สุดหรือน้อยที่สุด', { rounds: 5, kinds: [mm({ n: 4, lo: 100, hi: 999 }), mm({ n: 4, lo: 100, hi: 999, close: true })] }),
      L('จอมเลขสามหลัก', 'ด่านบอส เรียงและเทียบเลขสามหลัก', { rounds: 7, kinds: [so({ n: 5, lo: 100, hi: 999, close: true, dir: 'mix' }), cm({ lo: 100, hi: 999, near: true }), bt({ lo: 100, hi: 990, gap: 30 }), nb({ lo: 200, hi: 900, step: 100 })], time: 180 }, true)
    ] },
    { id: 'place', th: 'ค่าประจำหลัก', skill: 'รู้ว่าเลขแต่ละตัวอยู่หลักไหนและมีค่าเท่าไร แล้วนำไปเรียงลำดับ', color: '#e0a000', icon: 'gem', levels: [
      L('เลขอะไรอยู่หลักไหน', 'หาเลขที่อยู่ในหลักหน่วย สิบ ร้อย', { rounds: 5, kinds: [pl({ digits: 3, mode: 'digit' })] }),
      L('ค่าของเลขในหลัก', 'เลขนั้นมีค่าเท่าไรในหลักที่อยู่', { rounds: 5, kinds: [pl({ digits: 3, mode: 'value' })] }),
      L('เรียงตามค่าหลัก', 'เรียงเลขสามหลักที่ขึ้นต้นเหมือนกัน', { rounds: 5, kinds: [so({ n: 4, lo: 100, hi: 999, close: true, dir: 'desc' })] }),
      L('ระหว่างร้อย', 'เลขไหนอยู่ระหว่างสองเลขนี้', { rounds: 5, kinds: [bt({ lo: 100, hi: 900, gap: 100 }), bt({ lo: 100, hi: 950, gap: 50 })] }),
      L('ใกล้กันแค่หน่วยเดียว', 'เลขต่างกันที่หลักหน่วย ดูให้ละเอียด', { rounds: 6, kinds: [cm({ lo: 100, hi: 999, near: true }), mm({ n: 4, lo: 100, hi: 999, close: true })] }),
      L('จอมค่าประจำหลัก', 'ด่านบอส ค่าประจำหลักและการเรียงลำดับ', { rounds: 7, kinds: [pl({ digits: 3, mode: 'mix' }), so({ n: 5, lo: 100, hi: 999, close: true, dir: 'mix' }), pl({ digits: 4, mode: 'mix' }), bt({ lo: 100, hi: 900, gap: 100 })] }, true)
    ] },
    { id: 'w9999', th: 'พันและหมื่น', skill: 'เรียง เทียบ และอ่านค่าของเลขสี่หลัก ถึง 9,999', color: '#d63a4c', icon: 'crown', levels: [
      L('เรียงเลขสี่หลัก', 'เลขสี่หลัก ดูหลักพันก่อน', { rounds: 5, kinds: [so({ n: 4, lo: 1000, hi: 9999 })] }),
      L('มากไปน้อย สี่หลัก', 'เรียงจากมากไปน้อย', { rounds: 5, kinds: [so({ n: 5, lo: 1000, hi: 9999, dir: 'desc' })] }),
      L('เทียบเลขสี่หลัก', 'เลือกเครื่องหมายให้ถูก', { rounds: 6, kinds: [cm({ lo: 1000, hi: 9999, near: true })] }),
      L('ค่าประจำหลัก สี่หลัก', 'เลขอะไรอยู่หลักไหน มีค่าเท่าไร', { rounds: 6, kinds: [pl({ digits: 4, mode: 'digit' }), pl({ digits: 4, mode: 'value' })] }),
      L('นับข้ามทีละร้อย ทีละพัน', 'ต่อแถวเลขที่นับข้ามทีละ 100 ทีละ 1,000', { rounds: 6, kinds: [sk({ step: 100, lo: 1000, hi: 9000, dir: 'mix' }), sk({ step: 1000, lo: 1000, hi: 9000, dir: 'mix', show: 3 }), nb({ lo: 1100, hi: 9900, step: 100 })] }),
      L('จอมเลขพัน', 'ด่านสุดท้าย รวมทุกอย่าง ทุกชนิดโจทย์', { rounds: 8, kinds: [so({ n: 6, lo: 1000, hi: 9999, dir: 'mix' }), cm({ lo: 1000, hi: 9999, near: true }), pl({ digits: 4, mode: 'mix' }), mm({ n: 5, lo: 1000, hi: 9999 }), bt({ lo: 1000, hi: 9900, gap: 200 })], time: 210 }, true)
    ] }
  ];
  const api = { WORLDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SN_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
