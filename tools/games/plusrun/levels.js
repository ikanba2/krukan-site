/* ===== สมบัติพลังบวก (PLUS POWER HUNTER · นักล่าพลังบวก): 8 โลก × 6 ด่าน = 48 ด่าน · ด่านที่ 6 ของทุกโลกคือบอส =====
   เกมวิ่งกระโดดข้ามฉาก: วิ่งไปตามทาง ผ่านหลุม หนาม และเจ้าตัวเมือก แล้วเก็บ "พลังบวก" ที่เป็นคำตอบของโจทย์หน้าประตู เก็บถูกครบทุกประตูแล้วเปิดหีบสมบัติที่ปลายทาง
   p = { gates (จำนวนประตูโจทย์), q (โจทย์ ตรงกับ MK.make · opts = จำนวนตัวเลือก), hearts, pits, spikes, enemies (จำนวนอุปสรรคทั้งด่าน), coins }
   ใช้ทั้งในเกม (window.PR_LV) และทดสอบด้วย Node */
(function (root) {
  const L = (th, d, p, boss) => ({ th, d, k: 'run', p: Object.assign({ hearts: 5, pits: 0, spikes: 0, enemies: 0, coins: 6 }, p), boss: !!boss });
  const Q = o => Object.assign({ k: 'addsub', opts: 3, form: 'res' }, o);
  const WORLDS = [
    { id: 'forest', th: 'ป่าพลังบวก', skill: 'บวกเลขเล็กไม่เกิน 12 วิ่งกระโดดเก็บพลังบวกที่เป็นคำตอบ', color: '#3fbf6a', icon: 'plus', levels: [
      L('เก็บพลังแรก', 'วิ่งไปหน้าประตู เก็บพลังที่เป็นคำตอบ', { gates: 3, q: Q({ op: '+', lo: 1, hi: 5, max: 10 }) }),
      L('บวกถึงสิบ', 'โจทย์ใหญ่ขึ้นอีกนิด', { gates: 3, q: Q({ op: '+', lo: 1, hi: 9, max: 10 }), spikes: 1 }),
      L('ระวังหนามแหลม', 'กระโดดข้ามหนามให้ทัน', { gates: 4, q: Q({ op: '+', lo: 1, hi: 9, max: 12 }), spikes: 3 }),
      L('เจ้าตัวเมือก', 'กระโดดเหยียบหัวเจ้าตัวเมือก', { gates: 4, q: Q({ op: '+', lo: 1, hi: 9, max: 12 }), enemies: 2 }),
      L('หลุมในป่า', 'กระโดดข้ามหลุม', { gates: 4, q: Q({ op: '+', lo: 2, hi: 10, max: 12 }), pits: 2, spikes: 1 }),
      L('จอมป่าพลังบวก', 'ด่านบอส ผ่านทุกประตูเพื่อพิชิตบอส', { gates: 5, q: Q({ op: '+', lo: 2, hi: 10, max: 12 }), pits: 2, spikes: 2, enemies: 2 }, true)
    ] },
    { id: 'sky', th: 'เกาะลอยฟ้า', skill: 'บวกเลขถึง 20 ข้ามเกาะลอยฟ้าที่มีหลุมและเจ้าตัวเมือก', color: '#3d8bff', icon: 'boltI', levels: [
      L('บวกถึงยี่สิบ', 'ผลบวกไม่เกิน 20', { gates: 4, q: Q({ op: '+', lo: 3, hi: 12, max: 20 }), pits: 1 }),
      L('บวกข้ามสิบ', 'ผลบวกมากกว่าสิบ', { gates: 4, q: Q({ op: '+', lo: 4, hi: 12, max: 20, carry: true }), pits: 2 }),
      L('เติมให้เต็มสิบ', 'เลขอะไรบวกกันได้สิบ', { gates: 4, q: { k: 'bond', target: 10, opts: 3 }, pits: 1, enemies: 2 }),
      L('เลขที่หายไป', 'หาเลขที่หายไปในโจทย์บวก', { gates: 4, q: Q({ op: '+', lo: 2, hi: 12, max: 20, form: 'b' }), pits: 2, spikes: 2 }),
      L('เกาะหนามเกาะเมือก', 'อุปสรรคเยอะขึ้น', { gates: 5, q: Q({ op: '+', lo: 3, hi: 12, max: 20, form: 'mix' }), pits: 2, spikes: 2, enemies: 2 }),
      L('จอมเกาะลอยฟ้า', 'ด่านบอส พลังบวกถึง 20', { gates: 6, q: Q({ op: '+', lo: 3, hi: 14, max: 20, form: 'mix' }), pits: 3, spikes: 3, enemies: 3 }, true)
    ] },
    { id: 'cave', th: 'ถ้ำคริสตัล', skill: 'บวกเลขสองหลักที่ไม่ต้องทด และเติมให้เต็มสิบ เต็มร้อย', color: '#8a5cf0', icon: 'gem', levels: [
      L('สิบบวกหน่วย', 'เช่น 20 + 5 หรือ 30 + 7', { gates: 4, q: Q({ op: '+', lo: 11, hi: 40, max: 49, carry: false }), spikes: 2 }),
      L('สองหลักบวกสองหลัก', 'ไม่ต้องทด', { gates: 4, q: Q({ op: '+', lo: 11, hi: 50, max: 99, carry: false }), enemies: 2 }),
      L('เลขเต็มสิบ', 'บวกเลขเต็มสิบ', { gates: 4, q: Q({ op: '+', lo: 10, hi: 60, max: 100, step10: true }), pits: 2 }),
      L('เต็มร้อย', 'เลขอะไรบวกกันได้ร้อย', { gates: 4, q: { k: 'bond', target: 100, opts: 3 }, pits: 2, spikes: 2 }),
      L('ถ้ำเมือกเยอะ', 'ระวังเจ้าตัวเมือก', { gates: 5, q: Q({ op: '+', lo: 11, hi: 60, max: 99, carry: false }), enemies: 4, spikes: 1 }),
      L('จอมถ้ำคริสตัล', 'ด่านบอส บวกสองหลัก', { gates: 6, q: Q({ op: '+', lo: 11, hi: 60, max: 99, form: 'mix' }), pits: 3, spikes: 3, enemies: 3 }, true)
    ] },
    { id: 'volcano', th: 'ภูเขาไฟลบ', skill: 'ลบเลขถึง 20 และบวกลบปนกัน ข้ามหินร้อนและหนามไฟ', color: '#e0622a', icon: 'minus', levels: [
      L('ลบถึงสิบ', 'ลบเลขที่ไม่เกินสิบ', { gates: 4, q: Q({ op: '-', lo: 2, hi: 10 }), spikes: 2 }),
      L('ลบถึงยี่สิบ', 'ลบเลขที่ไม่เกินยี่สิบ', { gates: 4, q: Q({ op: '-', lo: 5, hi: 20 }), pits: 2 }),
      L('ลบข้ามสิบ', 'ลบแล้วต้องยืม', { gates: 4, q: Q({ op: '-', lo: 11, hi: 20, carry: true }), enemies: 2, spikes: 1 }),
      L('บวกลบปนกัน', 'ดูเครื่องหมายให้ดี', { gates: 5, q: Q({ op: 'mix', lo: 2, hi: 20, max: 20 }), pits: 2, spikes: 2 }),
      L('เลขที่หายไป ลบ', 'หาเลขที่หายไป', { gates: 5, q: Q({ op: 'mix', lo: 2, hi: 20, max: 20, form: 'mix' }), pits: 2, enemies: 2, spikes: 1 }),
      L('จอมภูเขาไฟ', 'ด่านบอส บวกลบถึง 20', { gates: 6, q: Q({ op: 'mix', lo: 2, hi: 20, max: 20, form: 'mix' }), pits: 3, spikes: 3, enemies: 3 }, true)
    ] },
    { id: 'falls', th: 'น้ำตกผสม', skill: 'บวกลบสองหลักปนกัน โจทย์เรื่องสั้น และเลขที่หายไป', color: '#18b8a0', icon: 'sortI', levels: [
      L('บวกลบสองหลัก', 'ไม่ต้องทดไม่ต้องยืม', { gates: 4, q: Q({ op: 'mix', lo: 11, hi: 60, max: 99, carry: false }), pits: 2 }),
      L('โจทย์เรื่องสั้น', 'อ่านเรื่องแล้วหาคำตอบ', { gates: 4, q: { k: 'story', op: 'mix', lo: 5, hi: 30, max: 50, opts: 3 }, enemies: 2 }),
      L('เลขที่หายไป สองหลัก', 'หาเลขที่หายไป', { gates: 5, q: Q({ op: 'mix', lo: 11, hi: 60, max: 99, carry: false, form: 'mix' }), pits: 2, spikes: 2 }),
      L('น้ำตกหนามเยอะ', 'ระวังหนาม', { gates: 5, q: Q({ op: 'mix', lo: 11, hi: 60, max: 99, form: 'mix' }), spikes: 5 }),
      L('น้ำตกเมือกเยอะ', 'ระวังเจ้าตัวเมือก', { gates: 5, q: Q({ op: 'mix', lo: 11, hi: 60, max: 99, form: 'mix' }), enemies: 5, pits: 1 }),
      L('จอมน้ำตก', 'ด่านบอส รวมทุกอย่าง', { gates: 7, q: Q({ op: 'mix', lo: 11, hi: 70, max: 99, form: 'mix' }), pits: 3, spikes: 3, enemies: 3 }, true)
    ] },
    { id: 'castle', th: 'ปราสาทลอยฟ้า', skill: 'บวกที่ต้องทดและลบที่ต้องยืม ในปราสาทที่เต็มไปด้วยกับดัก', color: '#ff5a8a', icon: 'crown', levels: [
      L('บวกแล้วทด', 'หลักหน่วยเกินสิบ', { gates: 4, q: Q({ op: '+', lo: 12, hi: 69, max: 99, carry: true }), pits: 2 }),
      L('ลบแล้วยืม', 'ยืมจากหลักสิบ', { gates: 4, q: Q({ op: '-', lo: 21, hi: 99, carry: true }), spikes: 3 }),
      L('ทดและยืมปนกัน', 'ดูเครื่องหมายให้ดี', { gates: 5, q: Q({ op: 'mix', lo: 12, hi: 89, max: 120, carry: true }), pits: 2, enemies: 2 }),
      L('โจทย์เรื่องที่ต้องทด', 'อ่านเรื่องแล้วหาคำตอบ', { gates: 5, q: { k: 'story', op: 'mix', lo: 15, hi: 89, max: 120, carry: true, opts: 3 }, pits: 2, spikes: 2 }),
      L('ปราสาทกับดักเยอะ', 'ทั้งหลุม หนาม เจ้าตัวเมือก', { gates: 5, q: Q({ op: 'mix', lo: 12, hi: 89, max: 120, carry: true, form: 'mix' }), pits: 3, spikes: 3, enemies: 3 }),
      L('จอมปราสาท', 'ด่านบอส ทดและยืม', { gates: 7, q: Q({ op: 'mix', lo: 12, hi: 99, max: 150, carry: true, form: 'mix' }), pits: 4, spikes: 4, enemies: 4 }, true)
    ] },
    { id: 'desert', th: 'ทะเลทรายสามหลัก', skill: 'บวกลบเลขสามหลัก มีทดมียืม และโจทย์เรื่องสั้น', color: '#e0a000', icon: 'listI', levels: [
      L('สามหลักไม่ทด', 'บวกลบสามหลักที่ไม่ต้องทด', { gates: 4, q: Q({ op: 'mix', lo: 100, hi: 600, max: 999, carry: false }), pits: 2 }),
      L('สามหลักมีทด', 'บวกที่ต้องทด', { gates: 4, q: Q({ op: '+', lo: 100, hi: 700, max: 999, carry: true }), spikes: 3 }),
      L('สามหลักมียืม', 'ลบที่ต้องยืม', { gates: 4, q: Q({ op: '-', lo: 200, hi: 999, carry: true }), enemies: 3 }),
      L('เลขที่หายไป สามหลัก', 'หาเลขที่หายไป', { gates: 5, q: Q({ op: 'mix', lo: 100, hi: 800, max: 999, carry: true, form: 'mix' }), pits: 3, spikes: 2 }),
      L('โจทย์เรื่องสามหลัก', 'อ่านเรื่องแล้วหาคำตอบ', { gates: 5, q: { k: 'story', op: 'mix', lo: 100, hi: 800, max: 999, carry: true, opts: 3 }, pits: 2, enemies: 3 }),
      L('จอมทะเลทราย', 'ด่านบอส สามหลักทุกแบบ', { gates: 7, q: Q({ op: 'mix', lo: 100, hi: 900, max: 999, carry: true, form: 'mix' }), pits: 4, spikes: 4, enemies: 4 }, true)
    ] },
    { id: 'treasure', th: 'ดินแดนสมบัติ', skill: 'รวมทุกอย่าง บวกลบถึงสามหลัก โจทย์เรื่องสั้น และอุปสรรคครบทุกแบบ ด่านสุดท้ายของเกม', color: '#d63a4c', icon: 'skull', levels: [
      L('วิ่งเก็บสมบัติ', 'โจทย์ผสม อุปสรรคผสม', { gates: 5, q: Q({ op: 'mix', lo: 5, hi: 99, max: 150, form: 'mix' }), pits: 3, spikes: 3, enemies: 3 }),
      L('เรื่องสั้นผสม', 'อ่านเรื่องแล้วหาคำตอบ', { gates: 5, q: { k: 'story', op: 'mix', lo: 10, hi: 99, max: 150, carry: true, opts: 3 }, pits: 3, spikes: 3, enemies: 3 }),
      L('สามหลักผสม', 'บวกลบสามหลัก', { gates: 5, q: Q({ op: 'mix', lo: 100, hi: 900, max: 999, carry: true, form: 'mix' }), pits: 4, spikes: 3, enemies: 3 }),
      L('หัวใจน้อย', 'ด่านนี้มีหัวใจแค่ 3 ดวง', { gates: 5, hearts: 3, q: Q({ op: 'mix', lo: 11, hi: 99, max: 150, form: 'mix' }), pits: 3, spikes: 3, enemies: 3 }),
      L('วิ่งไวไม่พลาด', 'อุปสรรคแน่นที่สุด', { gates: 6, q: Q({ op: 'mix', lo: 11, hi: 99, max: 150, form: 'mix' }), pits: 5, spikes: 5, enemies: 5 }),
      L('จอมนักล่าพลังบวก', 'ด่านสุดท้าย พิชิตสมบัติทั้งหมด', { gates: 8, hearts: 4, q: Q({ op: 'mix', lo: 11, hi: 99, max: 150, carry: true, form: 'mix' }), pits: 6, spikes: 6, enemies: 6 }, true)
    ] }
  ];
  const api = { WORLDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PR_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
