/* ===== บันไดงูบวกลบเลข (SNAKE LADDER MATH): 8 โลก × 6 ด่าน = 48 ด่าน · ด่านที่ 6 ของทุกโลกคือบอส =====
   กติกา: ตอบโจทย์บวกลบถูก แล้วทอยลูกเต๋าเดินตามแต้ม เจอบันไดขึ้น เจองูลง ถึงช่องสุดท้ายก่อนคู่แข่งจึงชนะ · ตอบผิดอยู่ที่เดิมแล้วเป็นตาของคนถัดไป
   p = { cols, rows (ขนาดกระดาน), snakes, ladders (จำนวน), q: โจทย์ (ตรงกับ MK.make: k addsub/story/bond), rivals: [ความแม่นของคู่แข่ง 0..1], humans?: จำนวนผู้เล่นจริง (โลก 8 เล่นกับเพื่อน), dice?: หน้าลูกเต๋า }
   ใช้ทั้งในเกม (window.SL_LV) และทดสอบด้วย Node */
(function (root) {
  const L = (th, d, p, boss) => ({ th, d, k: 'board', p, boss: !!boss });
  const Q = o => Object.assign({ k: 'addsub', opts: 4, form: 'res' }, o), B = (cols, rows, snakes, ladders) => ({ cols, rows, snakes, ladders });
  const WORLDS = [
    { id: 'w10', th: 'ทะเลสงบ', skill: 'บวกลบเลขหลักเดียวผลไม่เกิน 10 ตอบถูกแล้วทอยเต๋าเดินบนกระดานเล็ก', color: '#3d8bff', icon: 'snakeI', levels: [
      L('บวกเลขเล็ก', 'ตอบให้ถูกแล้วทอยลูกเต๋า', Object.assign(B(5, 4, 2, 2), { q: Q({ op: '+', lo: 1, hi: 5, max: 10 }), rivals: [0.4] })),
      L('ลบเลขเล็ก', 'ลบเลขที่ไม่เกิน 10', Object.assign(B(5, 4, 2, 2), { q: Q({ op: '-', lo: 1, hi: 10 }), rivals: [0.45] })),
      L('บวกลบปนกัน', 'ดูเครื่องหมายให้ดี', Object.assign(B(5, 4, 3, 2), { q: Q({ op: 'mix', lo: 1, hi: 10, max: 10 }), rivals: [0.5] })),
      L('จับคู่ให้เต็มสิบ', 'เลขอะไรบวกกันได้สิบ', Object.assign(B(5, 4, 3, 3), { q: { k: 'bond', target: 10, opts: 4 }, rivals: [0.5] })),
      L('เลขที่หายไป', 'หาเลขที่หายไปในโจทย์', Object.assign(B(5, 4, 3, 3), { q: Q({ op: 'mix', lo: 1, hi: 10, max: 10, form: 'mix' }), rivals: [0.55] })),
      L('เจ้าแห่งทะเลสงบ', 'ด่านบอส เอาชนะบอสให้ได้', Object.assign(B(5, 5, 4, 3), { q: Q({ op: 'mix', lo: 1, hi: 10, max: 10, form: 'mix' }), rivals: [0.6] }), true)
    ] },
    { id: 'w20', th: 'คลื่นลูกเล็ก', skill: 'บวกลบเลขถึง 20 มีทดและยืมแบบง่าย กระดานใหญ่ขึ้นมีงูเยอะขึ้น', color: '#ff9a2e', icon: 'ladderI', levels: [
      L('บวกถึงยี่สิบ', 'ผลบวกไม่เกิน 20', Object.assign(B(5, 5, 3, 3), { q: Q({ op: '+', lo: 1, hi: 12, max: 20 }), rivals: [0.5] })),
      L('ลบถึงยี่สิบ', 'ลบเลขที่ไม่เกิน 20', Object.assign(B(5, 5, 3, 3), { q: Q({ op: '-', lo: 5, hi: 20 }), rivals: [0.5] })),
      L('บวกข้ามสิบ', 'ผลบวกมากกว่า 10', Object.assign(B(5, 5, 4, 3), { q: Q({ op: '+', lo: 3, hi: 12, max: 20, carry: true }), rivals: [0.55] })),
      L('ลบข้ามสิบ', 'ลบแล้วต้องยืม', Object.assign(B(5, 5, 4, 3), { q: Q({ op: '-', lo: 11, hi: 20, carry: true }), rivals: [0.55] })),
      L('โจทย์เรื่องสั้น', 'อ่านเรื่องแล้วเลือกคำตอบ', Object.assign(B(5, 5, 4, 4), { q: { k: 'story', op: 'mix', lo: 3, hi: 15, max: 20, opts: 4 }, rivals: [0.6] })),
      L('เจ้าแห่งคลื่น', 'ด่านบอส บวกลบถึง 20', Object.assign(B(6, 5, 5, 4), { q: Q({ op: 'mix', lo: 2, hi: 20, max: 20, form: 'mix' }), rivals: [0.65] }), true)
    ] },
    { id: 'w2d', th: 'เกาะสองหลัก', skill: 'บวกลบเลขสองหลักที่ไม่ต้องทดไม่ต้องยืม และกระดาน 30 ช่อง', color: '#3fbf6a', icon: 'plus', levels: [
      L('สองหลักบวกหลักเดียว', 'ตัวเลขใหญ่ขึ้นแล้ว', Object.assign(B(6, 5, 4, 4), { q: Q({ op: '+', lo: 10, hi: 50, max: 59, carry: false }), rivals: [0.55] })),
      L('สองหลักลบหลักเดียว', 'ลบเลขที่ไม่ต้องยืม', Object.assign(B(6, 5, 4, 4), { q: Q({ op: '-', lo: 10, hi: 59, carry: false }), rivals: [0.55] })),
      L('บวกลบสองหลักปนกัน', 'ดูเครื่องหมายให้ดี', Object.assign(B(6, 5, 5, 4), { q: Q({ op: 'mix', lo: 10, hi: 60, max: 99, carry: false }), rivals: [0.6] })),
      L('เลขเต็มสิบ', 'บวกลบเลขเต็มสิบ', Object.assign(B(6, 5, 5, 4), { q: Q({ op: 'mix', lo: 10, hi: 90, max: 100, carry: false, step10: true }), rivals: [0.6] })),
      L('เติมให้เต็มร้อย', 'เลขอะไรบวกกันได้ 100', Object.assign(B(6, 5, 5, 5), { q: { k: 'bond', target: 100, opts: 4 }, rivals: [0.6] })),
      L('เจ้าแห่งเกาะ', 'ด่านบอส สองหลักทุกแบบ', Object.assign(B(6, 6, 6, 5), { q: Q({ op: 'mix', lo: 10, hi: 80, max: 99, carry: false, form: 'mix' }), rivals: [0.65] }), true)
    ] },
    { id: 'w2c', th: 'พายุทดยืม', skill: 'บวกลบเลขสองหลักที่ต้องทดและต้องยืม ในกระดาน 36 ช่อง', color: '#8a5cf0', icon: 'bolt', levels: [
      L('บวกแล้วทด', 'ผลบวกหลักหน่วยเกิน 10', Object.assign(B(6, 6, 5, 4), { q: Q({ op: '+', lo: 12, hi: 69, max: 99, carry: true }), rivals: [0.6] })),
      L('ลบแล้วยืม', 'ลบที่ต้องยืมจากหลักสิบ', Object.assign(B(6, 6, 5, 4), { q: Q({ op: '-', lo: 21, hi: 99, carry: true }), rivals: [0.6] })),
      L('ทดและยืมปนกัน', 'ดูเครื่องหมายให้ดี', Object.assign(B(6, 6, 6, 5), { q: Q({ op: 'mix', lo: 12, hi: 89, max: 120, carry: true }), rivals: [0.62] })),
      L('โจทย์เรื่องที่ต้องทด', 'อ่านเรื่องแล้วเลือกคำตอบ', Object.assign(B(6, 6, 6, 5), { q: { k: 'story', op: 'mix', lo: 15, hi: 89, max: 120, carry: true, opts: 4 }, rivals: [0.65] })),
      L('เลขที่หายไป สองหลัก', 'หาเลขที่หายไปในโจทย์', Object.assign(B(6, 6, 6, 6), { q: Q({ op: 'mix', lo: 12, hi: 89, max: 120, carry: true, form: 'mix' }), rivals: [0.65] })),
      L('เจ้าแห่งพายุ', 'ด่านบอส ทดและยืมสองหลัก', Object.assign(B(7, 6, 7, 6), { q: Q({ op: 'mix', lo: 12, hi: 99, max: 150, carry: true, form: 'mix' }), rivals: [0.7] }), true)
    ] },
    { id: 'w42', th: 'มหาสมุทรผสม', skill: 'โจทย์ทุกชนิดรวมกัน บวก ลบ เรื่องสั้น เลขที่หายไป กระดาน 42 ช่อง', color: '#18b8a0', icon: 'gem', levels: [
      L('รวมมิตรหลักเดียว', 'บวกลบหลักเดียวทุกแบบ', Object.assign(B(7, 6, 7, 6), { q: Q({ op: 'mix', lo: 1, hi: 12, max: 20, form: 'mix' }), rivals: [0.65] })),
      L('รวมมิตรสองหลัก', 'บวกลบสองหลักทุกแบบ', Object.assign(B(7, 6, 7, 6), { q: Q({ op: 'mix', lo: 10, hi: 90, max: 120, form: 'mix' }), rivals: [0.65] })),
      L('คู่แข่งสองคน', 'มีคู่แข่งสองคน ต้องเร็วกว่าทั้งคู่', Object.assign(B(7, 6, 7, 6), { q: Q({ op: 'mix', lo: 10, hi: 80, max: 120, carry: true }), rivals: [0.6, 0.55] })),
      L('งูเยอะมาก', 'งูหลายตัว ระวังตกลงมา', Object.assign(B(7, 6, 7, 5), { q: Q({ op: 'mix', lo: 10, hi: 90, max: 120, form: 'mix' }), rivals: [0.65] })),
      L('บันไดเยอะมาก', 'มีบันไดช่วยเยอะ แต่คู่แข่งก็เก่ง', Object.assign(B(7, 6, 5, 7), { q: Q({ op: 'mix', lo: 10, hi: 90, max: 120, form: 'mix' }), rivals: [0.75] })),
      L('เจ้าแห่งมหาสมุทร', 'ด่านบอส คู่แข่งสองคน', Object.assign(B(7, 7, 8, 7), { q: Q({ op: 'mix', lo: 10, hi: 99, max: 150, carry: true, form: 'mix' }), rivals: [0.7, 0.65] }), true)
    ] },
    { id: 'w100', th: 'ร้อยช่อง', skill: 'กระดานร้อยช่องแบบดั้งเดิม 10 × 10 บวกลบเลขถึง 100', color: '#ff5a8a', icon: 'crown', levels: [
      L('ร้อยช่องแรก', 'ไปให้ถึงช่อง 100', Object.assign(B(10, 10, 6, 6), { q: Q({ op: 'mix', lo: 1, hi: 20, max: 30 }), rivals: [0.55] })),
      L('ร้อยช่อง บวกสองหลัก', 'โจทย์ใหญ่ขึ้น', Object.assign(B(10, 10, 6, 6), { q: Q({ op: '+', lo: 10, hi: 80, max: 100, carry: null }), rivals: [0.6] })),
      L('ร้อยช่อง ลบสองหลัก', 'ลบเลขสองหลัก', Object.assign(B(10, 10, 6, 6), { q: Q({ op: '-', lo: 10, hi: 99 }), rivals: [0.6] })),
      L('ร้อยช่อง ผสม', 'บวกลบปนกัน', Object.assign(B(10, 10, 7, 7), { q: Q({ op: 'mix', lo: 10, hi: 99, max: 150, form: 'mix' }), rivals: [0.65] })),
      L('ร้อยช่อง คู่แข่งสองคน', 'ต้องเร็วกว่าทั้งสองคน', Object.assign(B(10, 10, 7, 7), { q: Q({ op: 'mix', lo: 10, hi: 99, max: 150, carry: true, form: 'mix' }), rivals: [0.6, 0.6] })),
      L('เจ้าแห่งร้อยช่อง', 'ด่านบอส กระดานร้อยช่องเต็มรูปแบบ', Object.assign(B(10, 10, 8, 6), { q: Q({ op: 'mix', lo: 10, hi: 99, max: 150, carry: true, form: 'mix' }), rivals: [0.75] }), true)
    ] },
    { id: 'w3d', th: 'ทะเลสามหลัก', skill: 'บวกลบเลขสามหลัก มีทดมียืม คู่แข่งแข็งแกร่งขึ้น', color: '#e0a000', icon: 'skull', levels: [
      L('สามหลักไม่ทด', 'บวกลบสามหลักที่ไม่ต้องทด', Object.assign(B(8, 6, 7, 6), { q: Q({ op: 'mix', lo: 100, hi: 600, max: 999, carry: false }), rivals: [0.6] })),
      L('สามหลักมีทด', 'บวกที่ต้องทด', Object.assign(B(8, 6, 7, 6), { q: Q({ op: '+', lo: 100, hi: 700, max: 999, carry: true }), rivals: [0.65] })),
      L('สามหลักมียืม', 'ลบที่ต้องยืม', Object.assign(B(8, 6, 7, 6), { q: Q({ op: '-', lo: 200, hi: 999, carry: true }), rivals: [0.65] })),
      L('เลขที่หายไป สามหลัก', 'หาเลขที่หายไป', Object.assign(B(8, 6, 8, 6), { q: Q({ op: 'mix', lo: 100, hi: 800, max: 999, carry: true, form: 'mix' }), rivals: [0.7] })),
      L('โจทย์เรื่องสามหลัก', 'อ่านเรื่องแล้วเลือกคำตอบ', Object.assign(B(8, 6, 8, 6), { q: { k: 'story', op: 'mix', lo: 100, hi: 800, max: 999, carry: true, opts: 4 }, rivals: [0.7] })),
      L('เจ้าแห่งทะเลลึก', 'ด่านบอส สามหลักทุกแบบ', Object.assign(B(8, 8, 8, 6), { q: Q({ op: 'mix', lo: 100, hi: 900, max: 999, carry: true, form: 'mix' }), rivals: [0.8] }), true)
    ] },
    { id: 'party', th: 'เล่นกับเพื่อน', skill: 'เล่นสองถึงสี่คนบนจอเดียวกัน ผลัดกันตอบโจทย์และทอยเต๋า ใครถึงเส้นชัยก่อนชนะ', color: '#d63a4c', icon: 'heart', levels: [
      L('สองคน ง่าย', 'ผลัดกันตอบ เลขไม่เกิน 10', Object.assign(B(5, 4, 3, 3), { q: Q({ op: 'mix', lo: 1, hi: 10, max: 10 }), humans: 2, rivals: [] })),
      L('สองคน ถึงยี่สิบ', 'บวกลบถึง 20', Object.assign(B(5, 5, 4, 4), { q: Q({ op: 'mix', lo: 1, hi: 20, max: 20 }), humans: 2, rivals: [] })),
      L('สองคน สองหลัก', 'บวกลบสองหลัก', Object.assign(B(6, 6, 5, 5), { q: Q({ op: 'mix', lo: 10, hi: 90, max: 120 }), humans: 2, rivals: [] })),
      L('สามคน', 'ผลัดกันสามคน', Object.assign(B(6, 6, 5, 5), { q: Q({ op: 'mix', lo: 5, hi: 60, max: 99 }), humans: 3, rivals: [] })),
      L('สี่คน', 'ผลัดกันสี่คน', Object.assign(B(7, 6, 6, 6), { q: Q({ op: 'mix', lo: 5, hi: 60, max: 99 }), humans: 4, rivals: [] })),
      L('สี่คน ร้อยช่อง', 'กระดานร้อยช่อง สี่คน', Object.assign(B(10, 10, 6, 6), { q: Q({ op: 'mix', lo: 10, hi: 90, max: 120, form: 'mix' }), humans: 4, rivals: [] }), true)
    ] }
  ];
  const api = { WORLDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SL_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
