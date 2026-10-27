/* ===== ภารกิจถอดรหัสเลขโรมัน (ROMAN CODE): 8 โลก × 6 ด่าน = 48 ด่าน · ด่านที่ 6 ของทุกโลกคือบอส =====
   p = { rounds, kinds: [โจทย์], time?: วินาที } · ชนิดโจทย์ { k: 'roman', mode, lo, hi, ... } ตรงกับ MK.romanQ ใน mathkit/mk-gen.js
   mode: sym (ค่าของสัญลักษณ์) · symrev (ค่านี้คือสัญลักษณ์ไหน) · r2n (เลขโรมัน › เลข) · n2r (เลข › เลขโรมัน เลือกตอบ) · build (ประกอบเลขโรมันจากแผ่นตัวอักษร)
         rule (คู่ตัวอักษรต้องบวกหรือลบ) · fix (ข้อไหนเขียนผิดกติกา) · arith (บวกลบเลขโรมัน) · clock (หน้าปัดนาฬิกา) · year (ปีบนจารึก)
   ใช้ทั้งในเกม (window.RM_LV) และทดสอบด้วย Node */
(function (root) {
  const L = (th, d, p, boss) => ({ th, d, k: 'round', p, boss: !!boss });
  const R = o => Object.assign({ k: 'roman' }, o);
  const WORLDS = [
    { id: 'ivx', th: 'สัญลักษณ์ I V X', skill: 'รู้จักสัญลักษณ์ I V X และอ่านเขียนเลขโรมัน 1 ถึง 10', color: '#d4a017', icon: 'romanI', levels: [
      L('ค่าของ I V X', 'สัญลักษณ์แต่ละตัวมีค่าเท่าไร', { rounds: 5, kinds: [R({ mode: 'sym', syms: 3 })] }),
      L('ค่านี้คือตัวไหน', 'ดูค่าแล้วเลือกสัญลักษณ์ที่ตรงกัน', { rounds: 5, kinds: [R({ mode: 'symrev', syms: 3 })] }),
      L('อ่านเลขโรมัน 1 ถึง 5', 'I II III IV V อ่านเป็นเลขอะไร', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 1, hi: 5 })] }),
      L('อ่านถึงสิบ', 'อ่านเลขโรมันตั้งแต่ 1 ถึง 10', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 1, hi: 10 })] }),
      L('เขียนเลขโรมัน', 'เลขธรรมดาเขียนเป็นเลขโรมันอย่างไร', { rounds: 5, kinds: [R({ mode: 'n2r', lo: 1, hi: 10 })] }),
      L('จอมเลขโรมันสิบตัว', 'ด่านบอส อ่าน เขียน และประกอบเลขโรมัน 1 ถึง 10', { rounds: 6, kinds: [R({ mode: 'r2n', lo: 1, hi: 10 }), R({ mode: 'n2r', lo: 1, hi: 10 }), R({ mode: 'build', lo: 1, hi: 10, tiles: 3 })] }, true)
    ] },
    { id: 'rule', th: 'บวกหรือลบ', skill: 'ดูตำแหน่งตัวเลขแล้วตัดสินใจว่าต้องบวกหรือลบ อ่านเลขโรมันถึง 20 และดูนาฬิกา', color: '#e0622a', icon: 'calcI', levels: [
      L('ค่ามากอยู่หน้า ต้องบวก', 'VI XI ตัวใหญ่นำหน้า แปลว่าบวก ตัวเล็กนำหน้า แปลว่าลบ', { rounds: 5, kinds: [R({ mode: 'rule', pairs: 4 })] }),
      L('อ่านถึงยี่สิบ', 'อ่านเลขโรมัน 1 ถึง 20', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 1, hi: 20 })] }),
      L('ประกอบเลขโรมัน', 'แตะแผ่นตัวอักษรเรียงให้เป็นเลขที่โจทย์บอก', { rounds: 4, kinds: [R({ mode: 'build', lo: 1, hi: 10, tiles: 3 })] }),
      L('นาฬิกาโรมัน', 'เข็มสั้นชี้เลขโรมันอะไร', { rounds: 5, kinds: [R({ mode: 'clock' })] }),
      L('เขียนถึงยี่สิบ', 'เขียนเลข 11 ถึง 20 เป็นเลขโรมัน', { rounds: 5, kinds: [R({ mode: 'n2r', lo: 11, hi: 20 }), R({ mode: 'rule', pairs: 6 })] }),
      L('จอมนักตัดสิน', 'ด่านบอส บวกหรือลบ อ่าน ประกอบ และดูนาฬิกา', { rounds: 7, kinds: [R({ mode: 'rule', pairs: 6 }), R({ mode: 'r2n', lo: 1, hi: 20 }), R({ mode: 'build', lo: 11, hi: 20, tiles: 3 }), R({ mode: 'clock' })] }, true)
    ] },
    { id: 'w39', th: 'ถึงสามสิบเก้า', skill: 'อ่านและเขียนเลขโรมันถึง 39 รู้ว่า X ซ้ำได้สามครั้ง และบวกลบเลขโรมันง่าย ๆ', color: '#2f9e6f', icon: 'gem', levels: [
      L('อ่านยี่สิบถึงสามสิบเก้า', 'XX XXV XXXIX อ่านเป็นเลขอะไร', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 20, hi: 39 })] }),
      L('เขียนยี่สิบถึงสามสิบเก้า', 'เลือกเลขโรมันที่เขียนถูก', { rounds: 5, kinds: [R({ mode: 'n2r', lo: 20, hi: 39 })] }),
      L('ประกอบถึงสามสิบเก้า', 'ประกอบเลขโรมันให้ตรงกับเลขที่บอก', { rounds: 4, kinds: [R({ mode: 'build', lo: 11, hi: 39, tiles: 3 })] }),
      L('ข้อไหนเขียนผิด', 'จำกฎ ตัวเดียวกันซ้ำได้ไม่เกินสามครั้ง', { rounds: 5, kinds: [R({ mode: 'fix', lo: 1, hi: 39 })] }),
      L('บวกเลขโรมัน', 'I + III = ? คิดแล้วตอบเป็นเลขโรมัน', { rounds: 5, kinds: [R({ mode: 'arith', lo: 1, hi: 20 })] }),
      L('จอมเลขสามสิบเก้า', 'ด่านบอส รวมทุกอย่างถึง 39', { rounds: 7, kinds: [R({ mode: 'r2n', lo: 20, hi: 39 }), R({ mode: 'build', lo: 11, hi: 39, tiles: 3 }), R({ mode: 'fix', lo: 1, hi: 39 }), R({ mode: 'arith', lo: 1, hi: 20 })] }, true)
    ] },
    { id: 'lc', th: 'L และ C', skill: 'รู้จักสัญลักษณ์ L (50) และ C (100) อ่านเขียนเลขโรมันถึง 99 และกฎลบแบบ XL XC', color: '#3d8bff', icon: 'crown', levels: [
      L('รู้จัก L และ C', 'L มีค่า 50 C มีค่า 100', { rounds: 5, kinds: [R({ mode: 'sym', syms: 5 }), R({ mode: 'symrev', syms: 5 })] }),
      L('XL XC กฎลบ', 'X ก่อน L หรือ C ต้องลบ', { rounds: 5, kinds: [R({ mode: 'rule', pairs: 10 })] }),
      L('อ่านสี่สิบถึงหกสิบเก้า', 'XL XLIV LXIX อ่านเป็นเลขอะไร', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 40, hi: 69 })] }),
      L('เขียนถึงเก้าสิบเก้า', 'เลือกเลขโรมันที่เขียนถูก', { rounds: 5, kinds: [R({ mode: 'n2r', lo: 40, hi: 99 })] }),
      L('ประกอบถึงเก้าสิบเก้า', 'ใช้แผ่น I V X L C ประกอบให้ตรงเลข', { rounds: 4, kinds: [R({ mode: 'build', lo: 40, hi: 99, tiles: 5 })] }),
      L('จอมเลขร้อย', 'ด่านบอส อ่าน เขียน ประกอบ ถึง 99', { rounds: 7, kinds: [R({ mode: 'r2n', lo: 40, hi: 99 }), R({ mode: 'n2r', lo: 40, hi: 99 }), R({ mode: 'build', lo: 40, hi: 99, tiles: 5 }), R({ mode: 'rule', pairs: 10 })] }, true)
    ] },
    { id: 'dm', th: 'D และ M', skill: 'รู้จักสัญลักษณ์ D (500) และ M (1,000) อ่านเขียนเลขโรมันหลักร้อย', color: '#8a5cf0', icon: 'sortI', levels: [
      L('รู้จักสัญลักษณ์ทั้งเจ็ด', 'I V X L C D M ค่าของแต่ละตัว', { rounds: 6, kinds: [R({ mode: 'sym', syms: 7 }), R({ mode: 'symrev', syms: 7 })] }),
      L('อ่านหลักร้อย', 'CL CCC CXX อ่านเป็นเลขอะไร', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 100, hi: 299 })] }),
      L('เขียนหลักร้อย', 'เลือกเลขโรมันที่เขียนถูก', { rounds: 5, kinds: [R({ mode: 'n2r', lo: 100, hi: 399 })] }),
      L('ประกอบหลักร้อย', 'ประกอบเลขโรมันตั้งแต่ 100 ถึง 399', { rounds: 4, kinds: [R({ mode: 'build', lo: 100, hi: 399, tiles: 5 })] }),
      L('CD CM กฎลบของร้อย', 'ตัวไหนอยู่หน้าตัวไหน ต้องบวกหรือลบ', { rounds: 5, kinds: [R({ mode: 'rule', pairs: 14 })] }),
      L('จอมหลักร้อย', 'ด่านบอส รวมทุกอย่างของหลักร้อย', { rounds: 7, kinds: [R({ mode: 'sym', syms: 7 }), R({ mode: 'r2n', lo: 100, hi: 399 }), R({ mode: 'n2r', lo: 100, hi: 399 }), R({ mode: 'build', lo: 100, hi: 399, tiles: 5 })] }, true)
    ] },
    { id: 'law', th: 'กติกาการเขียน', skill: 'จำกฎ ห้ามซ้ำเกินสามตัว V L D ห้ามซ้ำ และลบได้เฉพาะบางคู่', color: '#ff5a8a', icon: 'bolt', levels: [
      L('จับผิดเลขโรมัน', 'ข้อไหนเขียนผิดกติกา', { rounds: 5, kinds: [R({ mode: 'fix', lo: 1, hi: 39 })] }),
      L('จับผิดเลขโรมันร้อย', 'เลขใหญ่ขึ้น กฎยังเหมือนเดิม', { rounds: 5, kinds: [R({ mode: 'fix', lo: 40, hi: 399 })] }),
      L('บวกหรือลบ ทุกคู่', 'คู่ตัวอักษรทั้งหมด', { rounds: 6, kinds: [R({ mode: 'rule', pairs: 14 })] }),
      L('เขียนสามร้อยถึงแปดร้อย', 'ใช้ D และ CM ให้ถูก', { rounds: 5, kinds: [R({ mode: 'n2r', lo: 300, hi: 899 })] }),
      L('อ่านสี่ร้อยถึงเก้าร้อย', 'CD D DC CM อ่านเป็นเลขอะไร', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 400, hi: 999 })] }),
      L('จอมกฎเลขโรมัน', 'ด่านบอส จับผิด บวกลบ อ่านและเขียน', { rounds: 7, kinds: [R({ mode: 'fix', lo: 1, hi: 399 }), R({ mode: 'rule', pairs: 14 }), R({ mode: 'r2n', lo: 100, hi: 999 }), R({ mode: 'n2r', lo: 100, hi: 999 })] }, true)
    ] },
    { id: 'calc', th: 'บวกลบเลขโรมัน', skill: 'บวกลบเลขโรมันแล้วตอบเป็นเลขโรมัน อ่านปีบนจารึก', color: '#18b8a0', icon: 'plus', levels: [
      L('บวกเลขโรมัน', 'VII + III = ? ตอบเป็นเลขโรมัน', { rounds: 5, kinds: [R({ mode: 'arith', lo: 1, hi: 39 })] }),
      L('บวกและลบ', 'มีทั้งบวกและลบ ดูเครื่องหมายให้ดี', { rounds: 5, kinds: [R({ mode: 'arith', lo: 1, hi: 39, minus: true })] }),
      L('บวกลบเลขใหญ่ขึ้น', 'ตัวเลขถึง 99', { rounds: 5, kinds: [R({ mode: 'arith', lo: 1, hi: 99, minus: true })] }),
      L('ประกอบเลขร้อย', 'ใช้แผ่นครบทั้งเจ็ดตัว', { rounds: 4, kinds: [R({ mode: 'build', lo: 100, hi: 999, tiles: 7 })] }),
      L('ปีบนจารึก', 'จารึกบนอาคารเขียนว่า MCMXC ปีอะไร', { rounds: 5, kinds: [R({ mode: 'year', lo: 1900, hi: 2100 })] }),
      L('จอมนักคำนวณโรมัน', 'ด่านบอส บวกลบ ประกอบ และอ่านปี', { rounds: 7, kinds: [R({ mode: 'arith', lo: 1, hi: 99, minus: true }), R({ mode: 'build', lo: 100, hi: 999, tiles: 7 }), R({ mode: 'year', lo: 1900, hi: 2100 }), R({ mode: 'clock' })] }, true)
    ] },
    { id: 'master', th: 'จอมถอดรหัส', skill: 'เลขโรมันตั้งแต่ 1 ถึง 3,999 ทุกชนิดโจทย์ ด่านสุดท้ายของเกม', color: '#d63a4c', icon: 'skull', levels: [
      L('อ่านหลักพัน', 'MM MCM MMXXVI อ่านเป็นเลขอะไร', { rounds: 5, kinds: [R({ mode: 'r2n', lo: 1000, hi: 3999 })] }),
      L('เขียนหลักพัน', 'เลือกเลขโรมันที่เขียนถูก', { rounds: 5, kinds: [R({ mode: 'n2r', lo: 1000, hi: 3999 })] }),
      L('ประกอบหลักพัน', 'ประกอบเลขโรมันตั้งแต่ 1,000 ถึง 3,999', { rounds: 4, kinds: [R({ mode: 'build', lo: 1000, hi: 3999, tiles: 7 })] }),
      L('ปีและเลขใหญ่', 'อ่านปีบนจารึก และเลขใหญ่', { rounds: 6, kinds: [R({ mode: 'year', lo: 1000, hi: 2100 }), R({ mode: 'r2n', lo: 1000, hi: 3999 })] }),
      L('บวกลบเลขโรมันร้อย', 'บวกลบเลขโรมัน ผลไม่เกิน 399', { rounds: 5, kinds: [R({ mode: 'arith', lo: 1, hi: 399, minus: true })] }),
      L('จอมถอดรหัสโรมัน', 'ด่านสุดท้าย รวมทุกอย่าง จับเวลา', { rounds: 8, kinds: [R({ mode: 'r2n', lo: 1, hi: 3999 }), R({ mode: 'n2r', lo: 1, hi: 3999 }), R({ mode: 'build', lo: 100, hi: 3999, tiles: 7 }), R({ mode: 'fix', lo: 1, hi: 399 }), R({ mode: 'arith', lo: 1, hi: 399, minus: true }), R({ mode: 'year', lo: 1000, hi: 2100 })], time: 260 }, true)
    ] }
  ];
  const api = { WORLDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.RM_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
