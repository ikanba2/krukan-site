/* ===== เมืองสีรุ้ง: 8 โลก × 6 ด่าน = 48 ด่าน ฝึกทักษะพื้นฐานของเด็กเล็ก (สี · รูปทรง · นับเลข · เรียงลำดับ · ต่อแบบ · สังเกต · แยกหมวด · ภารกิจเมือง) =====
   แต่ละด่านคือชุดโจทย์วนตามจำนวนรอบ: p = { rounds: จำนวนรอบ, kinds: [โจทย์], time?: วินาที } ชนิดโจทย์และตัวเลือกดูใน eng-rounds.js
   ใช้ทั้งในเกม (window.RB_LV) และในการทดสอบด้วย Node (globalThis.RB_LV) */
(function (root) {
  const L = (th, d, p, boss) => ({ th, d, k: 'round', p, boss: !!boss });
  const tc = o => Object.assign({ k: 'tapColor' }, o), ts = o => Object.assign({ k: 'tapShape' }, o);
  const WORLDS = [
    { id: 'color', th: 'สีสดใส', skill: 'รู้จักสีและแตะสีให้ถูก จับคู่หุ่นยนต์กับแบตเตอรี่สีเดียวกัน', color: '#ff5a5a', icon: 'paletteI', levels: [
      L('แตะสีให้ถูก', 'ฟังชื่อสี แล้วแตะดาวสีนั้น', { rounds: 4, kinds: [tc({ look: 'star', colors: 2, say: true, need: 2, opts: 5 })] }),
      L('ดาวสามสี', 'มีดาวสามสี ฟังให้ดีแล้วแตะให้ครบ', { rounds: 5, kinds: [tc({ look: 'star', colors: 3, say: true, need: 2, opts: 6 })] }),
      L('หาให้เหมือน', 'ดูดาวตัวอย่าง แล้วแตะดาวสีเดียวกัน', { rounds: 5, kinds: [tc({ look: 'star', colors: 4, need: 3, opts: 8 })] }),
      L('ลูกบอลรุ้ง', 'ลูกบอลเจ็ดสี แตะสีที่ได้ยินให้ครบ', { rounds: 5, kinds: [tc({ look: 'shape', colors: 7, say: true, need: 3, opts: 10, size: 84 })] }),
      L('แบตเตอรี่หาหุ่น', 'ลากแบตเตอรี่ไปหาหุ่นยนต์ที่มีสีเดียวกัน', { rounds: 4, kinds: [{ k: 'pair', n: 3 }, { k: 'pair', n: 4 }] }),
      L('จอมมายาสี', 'ด่านบอส รวมทุกอย่างของโลกสี', { rounds: 6, kinds: [tc({ look: 'shape', colors: 7, say: true, need: 3, opts: 10, size: 84 }), { k: 'pair', n: 4 }, { k: 'connect', n: 3 }, tc({ look: 'star', colors: 4, need: 3, opts: 8 }), { k: 'connect', n: 4 }, { k: 'pair', n: 4 }] }, true)
    ] },
    { id: 'shape', th: 'รูปร่างรอบตัว', skill: 'แยกรูปทรงพื้นฐาน วางรูปให้ตรงช่อง และแยกรูปเข้าตะกร้า', color: '#3d8bff', icon: 'shapesI', levels: [
      L('วงกลม สี่เหลี่ยม สามเหลี่ยม', 'ฟังชื่อรูปทรง แล้วแตะรูปนั้น', { rounds: 4, kinds: [ts({ shapes: 3, say: true, need: 2, opts: 5 })] }),
      L('รูปทรงสี่แบบ', 'เพิ่มรูปดาว แตะให้ครบทุกอัน', { rounds: 5, kinds: [ts({ shapes: 4, say: true, need: 3, opts: 8 })] }),
      L('หารูปที่เหมือน', 'ดูรูปตัวอย่าง แล้วแตะรูปที่เหมือนกัน', { rounds: 5, kinds: [ts({ shapes: 5, need: 3, opts: 8 })] }),
      L('วางให้ตรงช่อง', 'ลากรูปทรงไปวางในช่องเงาที่พอดีกัน', { rounds: 4, kinds: [{ k: 'shapeSlot', n: 3 }, { k: 'shapeSlot', n: 4 }] }),
      L('แยกรูปทรง', 'ลากรูปไปใส่ตะกร้าที่มีรูปทรงเดียวกัน', { rounds: 3, kinds: [{ k: 'sort', by: 'shape', bins: 2, per: 3 }, { k: 'sort', by: 'shape', bins: 3, per: 2 }] }),
      L('จอมรูปทรง', 'ด่านบอส รวมทุกอย่างของโลกรูปร่าง', { rounds: 6, kinds: [ts({ shapes: 8, say: true, need: 3, opts: 10 }), { k: 'shapeSlot', n: 4 }, { k: 'sort', by: 'shape', bins: 3, per: 2 }, { k: 'odd', by: 'shape', n: 4 }, { k: 'shapeSlot', n: 4 }, { k: 'sort', by: 'shape', bins: 4, per: 2 }] }, true)
    ] },
    { id: 'count', th: 'นับเลขสนุก', skill: 'นับของ จับคู่ตัวเลขกับจำนวน เปรียบเทียบมากน้อย และใส่ของตามจำนวน', color: '#3fbf6a', icon: 'numI', levels: [
      L('นับถึงสาม', 'แตะของทีละชิ้น แล้วนับตามเสียง', { rounds: 4, kinds: [{ k: 'tapCount', max: 3 }] }),
      L('นับถึงห้า', 'นับของให้ได้จำนวนที่บอก', { rounds: 5, kinds: [{ k: 'tapCount', max: 5 }] }),
      L('นับแล้วเลือกเลข', 'นับของ แล้วแตะตัวเลขที่ตรงกัน', { rounds: 5, kinds: [{ k: 'numeral', max: 5 }] }),
      L('นับจุด', 'นับจุดบนแผ่น แล้วแตะตัวเลข', { rounds: 5, kinds: [{ k: 'numeral', mode: 'dots', max: 8 }] }),
      L('มากกว่าหรือน้อยกว่า', 'เลือกกลุ่มที่มากกว่า หรือน้อยกว่าตามโจทย์', { rounds: 6, kinds: [{ k: 'more', max: 7 }, { k: 'more', max: 8, less: true }] }),
      L('จอมนักนับ', 'ด่านบอส นับและเปรียบเทียบให้ถูกทุกข้อ', { rounds: 6, kinds: [{ k: 'numeral', max: 8 }, { k: 'basket', max: 6 }, { k: 'more', max: 9, less: true }, { k: 'tapCount', max: 8 }, { k: 'numeral', mode: 'dots', max: 10 }, { k: 'basket', max: 7 }] }, true)
    ] },
    { id: 'order', th: 'เรียงลำดับ', skill: 'เรียงภาพตามเหตุการณ์และกิจวัตรประจำวัน ก่อนและหลัง', color: '#9a6af0', icon: 'listI', levels: [
      L('เรียงภาพสามใบ', 'ดูว่าอะไรเกิดก่อน อะไรเกิดทีหลัง', { rounds: 3, kinds: [{ k: 'seq', set: 0 }] }),
      L('ก่อนและหลัง', 'เรียงภาพให้เล่าเรื่องได้ถูกต้อง', { rounds: 4, kinds: [{ k: 'seq' }] }),
      L('เช้าถึงค่ำ สามขั้น', 'เรียงกิจกรรมของวัน จากก่อนไปหลัง', { rounds: 3, kinds: [{ k: 'seq', set: 'day', len: 3 }] }),
      L('วันของเทคโน', 'เรียงกิจกรรมสี่อย่างตามเวลา', { rounds: 3, kinds: [{ k: 'seq', set: 'day', len: 4 }] }),
      L('ห้าขั้นตอน', 'เรียงให้ครบห้าภาพ ค่อย ๆ คิดทีละภาพ', { rounds: 3, kinds: [{ k: 'seq', set: 'day', len: 5 }, { k: 'seq' }] }),
      L('จอมเรียงทั้งวัน', 'ด่านบอส เรียงกิจกรรมทั้งวันให้ถูก', { rounds: 5, kinds: [{ k: 'seq', set: 'day', len: 7 }, { k: 'seq' }, { k: 'seq', set: 'day', len: 5 }, { k: 'seq' }, { k: 'seq', set: 'day', len: 7 }] }, true)
    ] },
    { id: 'pattern', th: 'ต่อแบบ', skill: 'หากฎของแบบที่ซ้ำกัน ต่อแบบ และหาตัวที่แปลกไปจากเพื่อน', color: '#ff9a2e', icon: 'puzzleI', levels: [
      L('สลับสองสี', 'ดูแบบสองสีที่สลับกัน แล้วต่ออันถัดไป', { rounds: 4, kinds: [{ k: 'pattern', pat: 'AB', look: 'color' }] }),
      L('สลับรูปทรง', 'แบบของรูปทรงที่สลับกัน ต่ออันถัดไป', { rounds: 4, kinds: [{ k: 'pattern', pat: 'AB', look: 'shape' }] }),
      L('สามสีวนไป', 'แบบที่วนซ้ำทุกสามอัน', { rounds: 4, kinds: [{ k: 'pattern', pat: 'ABC', look: 'color' }] }),
      L('แบบสองซ้ำ', 'แบบที่มีบางอันซ้ำสองครั้ง', { rounds: 4, kinds: [{ k: 'pattern', pat: 'AAB', look: 'pic' }, { k: 'pattern', pat: 'ABB', look: 'shape' }] }),
      L('ตัวไหนแปลก', 'หาตัวที่ไม่เหมือนเพื่อน ทั้งสีและรูปทรง', { rounds: 5, kinds: [{ k: 'odd', by: 'color', n: 4 }, { k: 'odd', by: 'shape', n: 4 }] }),
      L('จอมนักสังเกต', 'ด่านบอส ต่อแบบและหาตัวแปลกให้ครบ', { rounds: 6, kinds: [{ k: 'pattern', pat: 'ABC', look: 'shape' }, { k: 'odd', by: 'size', n: 4 }, { k: 'pattern', pat: 'AAB', look: 'pic' }, { k: 'odd', by: 'cat', n: 4 }, { k: 'pattern', pat: 'ABC', look: 'pic' }, { k: 'odd', by: 'shape', n: 5 }] }, true)
    ] },
    { id: 'memory', th: 'สังเกตและจำ', skill: 'เปรียบเทียบขนาด และฝึกความจำด้วยการพลิกการ์ดหาคู่', color: '#ff6fae', icon: 'brainI', levels: [
      L('ใหญ่หรือเล็ก', 'แตะอันที่ใหญ่กว่า', { rounds: 4, kinds: [{ k: 'big' }] }),
      L('ใหญ่ เล็ก สลับกัน', 'ฟังโจทย์ดี ๆ ว่าให้หาใหญ่หรือเล็ก', { rounds: 5, kinds: [{ k: 'big' }, { k: 'big', small: true }] }),
      L('พลิกการ์ดสี่ใบ', 'พลิกทีละสองใบ หาภาพที่เหมือนกัน', { rounds: 3, kinds: [{ k: 'memory', cols: 2, rows: 2 }] }),
      L('พลิกการ์ดหกใบ', 'จำให้ได้ว่าภาพไหนอยู่ตรงไหน', { rounds: 2, kinds: [{ k: 'memory', cols: 3, rows: 2 }] }),
      L('พลิกการ์ดแปดใบ', 'ความจำต้องแม่นขึ้นอีกนิด', { rounds: 2, kinds: [{ k: 'memory', cols: 4, rows: 2 }] }),
      L('จอมความจำ', 'ด่านบอส พลิกการ์ดและสังเกตให้แม่น', { rounds: 4, kinds: [{ k: 'memory', cols: 4, rows: 2 }, { k: 'odd', by: 'size', n: 4 }, { k: 'memory', cols: 4, rows: 3 }, { k: 'big', small: true }] }, true)
    ] },
    { id: 'sort', th: 'แยกหมวดหมู่', skill: 'จัดกลุ่มสิ่งของตามสี ตามชนิด และหาตัวที่ไม่เข้าพวก', color: '#22b4d4', icon: 'grid4', levels: [
      L('แยกสีสองตะกร้า', 'ลากของไปใส่ตะกร้าที่สีเหมือนกัน', { rounds: 3, kinds: [{ k: 'sort', by: 'color', bins: 2, per: 2 }] }),
      L('สัตว์กับของกิน', 'ลากของไปใส่ให้ถูกหมวด', { rounds: 3, kinds: [{ k: 'sort', by: 'cat', bins: 2, per: 3, cats: ['animal', 'food'] }] }),
      L('แยกสามสี', 'มีตะกร้าสามใบ ใส่ให้ถูกสี', { rounds: 3, kinds: [{ k: 'sort', by: 'color', bins: 3, per: 2 }] }),
      L('แยกสามหมวด', 'สัตว์ ผลไม้ และของใช้ในห้องเรียน', { rounds: 3, kinds: [{ k: 'sort', by: 'cat', bins: 3, per: 2, cats: ['animal', 'fruit', 'school'] }] }),
      L('ใครไม่เข้าพวก', 'หาอันที่ไม่อยู่พวกเดียวกับเพื่อน', { rounds: 5, kinds: [{ k: 'odd', by: 'cat', n: 4 }] }),
      L('จอมจัดระเบียบ', 'ด่านบอส จัดของเข้าหมวดให้เรียบร้อย', { rounds: 5, kinds: [{ k: 'sort', by: 'cat', bins: 4, per: 2 }, { k: 'sort', by: 'color', bins: 4, per: 2 }, { k: 'odd', by: 'cat', n: 4 }, { k: 'sort', by: 'cat', bins: 3, per: 3, cats: ['animal', 'fruit', 'food'] }, { k: 'sort', by: 'shape', bins: 4, per: 2 }] }, true)
    ] },
    { id: 'city', th: 'ภารกิจเมืองสีรุ้ง', skill: 'ภารกิจจับเวลาที่รวมทักษะทั้งหมด ช่วยกันทำให้ทันก่อนเวลาหมด', color: '#ff5a8a', icon: 'houseI', levels: [
      L('ตลาดสีรุ้ง', 'ช่วยพ่อค้าหาของให้ทัน ก่อนเวลาหมด', { rounds: 6, time: 90, kinds: [tc({ look: 'shape', colors: 7, say: true, need: 3, opts: 9, size: 88 }), ts({ shapes: 5, say: true, need: 3, opts: 8 }), { k: 'tapCount', max: 5 }] }),
      L('โรงงานหุ่นยนต์', 'ต่อสายและจับคู่หุ่นยนต์ให้ครบ', { rounds: 6, time: 100, kinds: [{ k: 'pair', n: 3 }, { k: 'connect', n: 3 }, { k: 'numeral', max: 6 }, { k: 'pair', n: 4 }] }),
      L('สวนสนุกแสนสนุก', 'หาตัวแปลกและต่อแบบให้ทัน', { rounds: 7, time: 110, kinds: [{ k: 'pattern', pat: 'ABC', look: 'pic' }, { k: 'odd', by: 'shape', n: 4 }, { k: 'big' }, { k: 'pattern', pat: 'AAB', look: 'shape' }, { k: 'odd', by: 'size', n: 4 }] }),
      L('ห้องเรียนรวมมิตร', 'เรียง จำ และแยกหมวดในห้องเรียน', { rounds: 6, time: 140, kinds: [{ k: 'seq', set: 'day', len: 4 }, { k: 'memory', cols: 3, rows: 2 }, { k: 'sort', by: 'cat', bins: 2, per: 2 }, { k: 'seq' }] }),
      L('ท่าเรือของเมือง', 'นับของขึ้นเรือและเปรียบเทียบให้ทัน', { rounds: 6, time: 140, kinds: [{ k: 'basket', max: 6 }, { k: 'more', max: 9 }, { k: 'numeral', mode: 'dots', max: 9 }, { k: 'sort', by: 'color', bins: 3, per: 2 }, { k: 'basket', max: 7 }] }),
      L('จอมมายาสีรุ้ง', 'ด่านบอสสุดท้าย ใช้ทุกทักษะให้ครบทุกรอบ', { rounds: 10, time: 240, kinds: [tc({ look: 'shape', colors: 7, say: true, need: 3, opts: 10, size: 84 }), { k: 'shapeSlot', n: 4 }, { k: 'numeral', mode: 'dots', max: 9 }, { k: 'pattern', pat: 'ABC', look: 'shape' }, { k: 'sort', by: 'cat', bins: 3, per: 2, cats: ['animal', 'fruit', 'school'] }, { k: 'connect', n: 4 }, { k: 'seq', set: 'day', len: 5 }, { k: 'odd', by: 'cat', n: 4 }, { k: 'basket', max: 7 }, { k: 'memory', cols: 3, rows: 2 }] }, true)
    ] }
  ];
  root.RB_LV = { WORLDS };
})(typeof window !== 'undefined' ? window : globalThis);
