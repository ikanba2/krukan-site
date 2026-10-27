/* ===== คิดเลขแสนสนุก (POWER COLUMNS · ภารกิจคำนวณแนวตั้ง): 8 โลก × 6 ด่าน = 48 ด่าน · ด่านที่ 6 ของทุกโลกคือบอส =====
   p = { rounds, kinds: [โจทย์], time?: วินาที } · ชนิดโจทย์ตรงกับ MK.make ใน mathkit/mk-gen.js
   column: ตั้งบวก/ลบแนวตั้ง (op, d1 หลักของตัวบน, d2 หลักของตัวล่าง, carry: none|some|chain|any, mark: true = ต้องเขียนตัวทดเอง)
   addsub: บวกลบแนวนอนแบบเลือกคำตอบ (form: res|b|a|mix ช่องว่างที่ผลลัพธ์/ตัวหลัง/ตัวหน้า) · story: โจทย์เรื่องสั้น · bond: จับคู่ให้เต็มสิบ/ร้อย
   ใช้ทั้งในเกม (window.CM_LV) และทดสอบด้วย Node */
(function (root) {
  const L = (th, d, p, boss) => ({ th, d, k: 'round', p, boss: !!boss });
  const co = o => Object.assign({ k: 'column', carry: null }, o), ad = o => Object.assign({ k: 'addsub', opts: 4 }, o), st = o => Object.assign({ k: 'story', opts: 4 }, o), bd = o => Object.assign({ k: 'bond' }, o);
  const WORLDS = [
    { id: 'one', th: 'หลักเดียว', skill: 'ตั้งบวกลบเลขหลักเดียวแนวตั้ง เขียนคำตอบจากหลักหน่วย และจับคู่ให้เต็มสิบ', color: '#3fbf6a', icon: 'plus', levels: [
      L('ตั้งบวกหลักเดียว', 'เขียนเลขตรงหลักกัน แล้วบวกทีละหลัก', { rounds: 4, kinds: [co({ op: '+', d1: 1, d2: 1, carry: 'none' })] }),
      L('ตั้งลบหลักเดียว', 'ตัวตั้งอยู่บน ตัวลบอยู่ล่าง แล้วลบ', { rounds: 4, kinds: [co({ op: '-', d1: 1, d2: 1, carry: 'none' })] }),
      L('บวกแล้วได้สิบกว่า', 'ผลบวกเกินเก้า ต้องเขียนสองหลัก', { rounds: 5, kinds: [co({ op: '+', d1: 1, d2: 1, carry: 'any' })] }),
      L('จับคู่ให้เต็มสิบ', 'เลขอะไรบวกกันได้สิบพอดี', { rounds: 5, kinds: [bd({ target: 10 })] }),
      L('บวกลบปนกัน', 'ดูเครื่องหมายให้ดี', { rounds: 5, kinds: [co({ op: 'mix', d1: 1, d2: 1, carry: 'none' }), ad({ op: 'mix', lo: 1, hi: 9, max: 18, form: 'res' })] }),
      L('จอมคิดเลขหลักเดียว', 'ด่านบอส บวกลบหลักเดียวทุกแบบ', { rounds: 6, kinds: [co({ op: '+', d1: 1, d2: 1, carry: 'any' }), bd({ target: 10 }), co({ op: '-', d1: 1, d2: 1, carry: 'none' }), ad({ op: 'mix', lo: 1, hi: 9, max: 18, form: 'mix' })] }, true)
    ] },
    { id: 'two', th: 'สองหลักไม่ทด', skill: 'ตั้งบวกลบเลขสองหลักที่ไม่ต้องทดไม่ต้องยืม และโจทย์เรื่องสั้น', color: '#3d8bff', icon: 'calcI', levels: [
      L('สองหลักบวกหลักเดียว', 'ตั้งให้หลักหน่วยตรงกับหลักหน่วย', { rounds: 4, kinds: [co({ op: '+', d1: 2, d2: 1, carry: 'none' })] }),
      L('สองหลักบวกสองหลัก', 'บวกหลักหน่วยก่อน แล้วค่อยบวกหลักสิบ', { rounds: 4, kinds: [co({ op: '+', d1: 2, d2: 2, carry: 'none' })] }),
      L('สองหลักลบหลักเดียว', 'ลบจากหลักหน่วยก่อน', { rounds: 4, kinds: [co({ op: '-', d1: 2, d2: 1, carry: 'none' })] }),
      L('สองหลักลบสองหลัก', 'ลบทีละหลักจากขวาไปซ้าย', { rounds: 4, kinds: [co({ op: '-', d1: 2, d2: 2, carry: 'none' })] }),
      L('โจทย์เรื่องสั้น', 'อ่านเรื่องแล้วเลือกว่าบวกหรือลบ', { rounds: 5, kinds: [st({ op: 'mix', lo: 10, hi: 50, max: 99, carry: false })] }),
      L('จอมสองหลัก', 'ด่านบอส บวกลบสองหลักทุกแบบ', { rounds: 6, kinds: [co({ op: '+', d1: 2, d2: 2, carry: 'none' }), co({ op: '-', d1: 2, d2: 2, carry: 'none' }), st({ op: 'mix', lo: 10, hi: 50, max: 99, carry: false })] }, true)
    ] },
    { id: 'carry', th: 'ทดเลข', skill: 'บวกเลขที่ต้องทด เขียนตัวทดไว้เหนือหลักถัดไป', color: '#ff9a2e', icon: 'bolt', levels: [
      L('ทดหนึ่งครั้ง หลักเดียว', 'หลักหน่วยรวมได้สิบขึ้นไป ทดไปหลักสิบ', { rounds: 4, kinds: [co({ op: '+', d1: 2, d2: 1, carry: 'some' })] }),
      L('ทดหนึ่งครั้ง สองหลัก', 'บวกสองหลักที่ต้องทด', { rounds: 4, kinds: [co({ op: '+', d1: 2, d2: 2, carry: 'some' })] }),
      L('เขียนตัวทดเอง', 'ทดแล้วต้องเขียนตัวทดเหนือหลักถัดไปด้วย', { rounds: 4, kinds: [co({ op: '+', d1: 2, d2: 2, carry: 'some', mark: true })] }),
      L('โจทย์เรื่องที่ต้องทด', 'อ่านเรื่องแล้วเลือกคำตอบ', { rounds: 5, kinds: [st({ op: '+', lo: 15, hi: 79, max: 150, carry: true })] }),
      L('ทดสองหลัก', 'ผลบวกได้เกินร้อย ต้องมีหลักร้อยเพิ่ม', { rounds: 4, kinds: [co({ op: '+', d1: 2, d2: 2, carry: 'any', mark: true })] }),
      L('จอมนักทดเลข', 'ด่านบอส ทดเลขให้ครบทุกหลัก', { rounds: 6, kinds: [co({ op: '+', d1: 2, d2: 2, carry: 'any', mark: true }), co({ op: '+', d1: 2, d2: 1, carry: 'some' }), st({ op: '+', lo: 15, hi: 79, max: 150, carry: true })] }, true)
    ] },
    { id: 'borrow', th: 'ยืมเลข', skill: 'ลบเลขที่ต้องยืมจากหลักถัดไป ดูตัวตั้งที่เปลี่ยนไปหลังยืม', color: '#8a5cf0', icon: 'minus', levels: [
      L('ยืมหนึ่งครั้ง หลักเดียว', 'หลักหน่วยลบไม่ได้ ต้องยืมสิบจากหลักสิบ', { rounds: 4, kinds: [co({ op: '-', d1: 2, d2: 1, carry: 'some' })] }),
      L('ยืมหนึ่งครั้ง สองหลัก', 'ลบสองหลักที่ต้องยืม', { rounds: 4, kinds: [co({ op: '-', d1: 2, d2: 2, carry: 'some' })] }),
      L('ลบแล้วยืมสองหลัก', 'ลบสองหลักที่ต้องยืมต่อเนื่อง', { rounds: 4, kinds: [co({ op: '-', d1: 2, d2: 2, carry: 'any' })] }),
      L('โจทย์เรื่องที่ต้องยืม', 'อ่านเรื่องแล้วเลือกคำตอบ', { rounds: 5, kinds: [st({ op: '-', lo: 20, hi: 99, max: 150, carry: true })] }),
      L('บวกและลบ ที่ต้องทดต้องยืม', 'ดูเครื่องหมายแล้วทำให้ถูก', { rounds: 5, kinds: [co({ op: 'mix', d1: 2, d2: 2, carry: 'any' })] }),
      L('จอมนักยืมเลข', 'ด่านบอส ยืมและทดให้ครบ', { rounds: 6, kinds: [co({ op: '-', d1: 2, d2: 2, carry: 'any' }), co({ op: '+', d1: 2, d2: 2, carry: 'any', mark: true }), st({ op: 'mix', lo: 20, hi: 99, max: 150, carry: true })] }, true)
    ] },
    { id: 'three', th: 'สามหลัก', skill: 'ตั้งบวกลบเลขสามหลัก เริ่มจากไม่ทดไม่ยืม แล้วเพิ่มทดและยืม', color: '#18b8a0', icon: 'listI', levels: [
      L('สามหลักบวกสามหลัก', 'บวกสามหลักที่ไม่ต้องทด', { rounds: 4, kinds: [co({ op: '+', d1: 3, d2: 3, carry: 'none' })] }),
      L('สามหลักลบสามหลัก', 'ลบสามหลักที่ไม่ต้องยืม', { rounds: 4, kinds: [co({ op: '-', d1: 3, d2: 3, carry: 'none' })] }),
      L('สามหลักบวกสองหลัก มีทด', 'ตั้งหลักให้ตรงแล้วทดให้ถูก', { rounds: 4, kinds: [co({ op: '+', d1: 3, d2: 2, carry: 'some' })] }),
      L('สามหลักลบสองหลัก มียืม', 'ตั้งหลักให้ตรงแล้วยืมให้ถูก', { rounds: 4, kinds: [co({ op: '-', d1: 3, d2: 2, carry: 'some' })] }),
      L('เขียนตัวทดสามหลัก', 'บวกสามหลักที่ทดหลายครั้ง', { rounds: 4, kinds: [co({ op: '+', d1: 3, d2: 3, carry: 'any', mark: true })] }),
      L('จอมสามหลัก', 'ด่านบอส บวกลบสามหลักทุกแบบ', { rounds: 6, kinds: [co({ op: '+', d1: 3, d2: 3, carry: 'any', mark: true }), co({ op: '-', d1: 3, d2: 3, carry: 'any' }), co({ op: '-', d1: 3, d2: 2, carry: 'some' })] }, true)
    ] },
    { id: 'chain', th: 'ทดและยืมต่อเนื่อง', skill: 'ทดหรือยืมต่อกันหลายหลัก และหาตัวเลขที่หายไปในโจทย์', color: '#ff5a8a', icon: 'gem', levels: [
      L('ทดต่อเนื่อง', 'ทดหลายหลักติดกัน', { rounds: 4, kinds: [co({ op: '+', d1: 3, d2: 3, carry: 'chain' })] }),
      L('ยืมต่อเนื่อง', 'ยืมหลายหลักติดกัน', { rounds: 4, kinds: [co({ op: '-', d1: 3, d2: 3, carry: 'chain' })] }),
      L('ทดและยืมปนกัน', 'ดูเครื่องหมายให้ดี', { rounds: 5, kinds: [co({ op: 'mix', d1: 3, d2: 3, carry: 'chain' })] }),
      L('เลขอะไรหายไป', 'หาตัวเลขที่หายไปในโจทย์', { rounds: 5, kinds: [ad({ op: 'mix', lo: 100, hi: 999, max: 999, form: 'mix' }), ad({ op: 'mix', lo: 10, hi: 99, max: 150, form: 'mix' })] }),
      L('โจทย์เรื่องสามหลัก', 'อ่านเรื่องแล้วเลือกคำตอบ', { rounds: 5, kinds: [st({ op: 'mix', lo: 100, hi: 899, max: 999, carry: true })] }),
      L('จอมต่อเนื่อง', 'ด่านบอส จับเวลา ทดและยืมต่อเนื่อง', { rounds: 6, kinds: [co({ op: '+', d1: 3, d2: 3, carry: 'chain' }), co({ op: '-', d1: 3, d2: 3, carry: 'chain' }), ad({ op: 'mix', lo: 100, hi: 999, max: 999, form: 'mix' })], time: 200 }, true)
    ] },
    { id: 'four', th: 'สี่หลัก', skill: 'ตั้งบวกลบเลขสี่หลัก ตัวเลขยาวขึ้น ต้องตั้งหลักให้ตรงและทำทีละหลัก', color: '#e0a000', icon: 'crown', levels: [
      L('สี่หลักบวกสามหลัก', 'ตั้งหลักให้ตรงกันทางขวา', { rounds: 4, kinds: [co({ op: '+', d1: 4, d2: 3, carry: 'some' })] }),
      L('สี่หลักลบสามหลัก', 'ตั้งหลักให้ตรงแล้วยืมให้ถูก', { rounds: 4, kinds: [co({ op: '-', d1: 4, d2: 3, carry: 'some' })] }),
      L('สี่หลักบวกสี่หลัก', 'ผลบวกอาจได้ห้าหลัก', { rounds: 4, kinds: [co({ op: '+', d1: 4, d2: 4, carry: 'any' })] }),
      L('สี่หลักลบสี่หลัก', 'ยืมให้ถูกทุกหลัก', { rounds: 4, kinds: [co({ op: '-', d1: 4, d2: 4, carry: 'any' })] }),
      L('ทดและยืมสี่หลัก', 'บวกลบปนกัน ทดและยืมต่อเนื่อง', { rounds: 5, kinds: [co({ op: 'mix', d1: 4, d2: 4, carry: 'chain' })] }),
      L('จอมสี่หลัก', 'ด่านบอส เลขยาวสี่หลักทุกแบบ', { rounds: 6, kinds: [co({ op: '+', d1: 4, d2: 4, carry: 'chain', mark: true }), co({ op: '-', d1: 4, d2: 4, carry: 'chain' }), co({ op: 'mix', d1: 4, d2: 3, carry: 'any' })] }, true)
    ] },
    { id: 'master', th: 'จอมนักคำนวณ', skill: 'รวมทุกอย่าง บวกลบแนวตั้งถึงสี่หลัก โจทย์เรื่องสั้น เลขที่หายไป และจับเวลา', color: '#d63a4c', icon: 'skull', levels: [
      L('คิดให้ทันเวลา', 'บวกลบสามหลักแบบจับเวลา', { rounds: 6, kinds: [co({ op: 'mix', d1: 3, d2: 3, carry: 'any' })], time: 150 }),
      L('เลขอะไรหายไป ขั้นสูง', 'หาตัวเลขที่หายไปในโจทย์ใหญ่', { rounds: 6, kinds: [ad({ op: 'mix', lo: 100, hi: 999, max: 999, form: 'mix' })] }),
      L('โจทย์เรื่องรวมมิตร', 'อ่านเรื่องสามหลัก แล้วเลือกคำตอบ', { rounds: 6, kinds: [st({ op: 'mix', lo: 100, hi: 899, max: 999, carry: true }), st({ op: 'mix', lo: 20, hi: 99, max: 150, carry: true })] }),
      L('ทดเองสี่หลัก', 'บวกสี่หลักต้องเขียนตัวทดเอง', { rounds: 5, kinds: [co({ op: '+', d1: 4, d2: 4, carry: 'chain', mark: true })] }),
      L('ยืมต่อเนื่องสี่หลัก', 'ลบสี่หลักที่ยืมต่อเนื่อง', { rounds: 5, kinds: [co({ op: '-', d1: 4, d2: 4, carry: 'chain' })] }),
      L('จอมคิดเลขแสนสนุก', 'ด่านสุดท้าย รวมทุกอย่าง จับเวลา', { rounds: 8, kinds: [co({ op: '+', d1: 4, d2: 4, carry: 'chain', mark: true }), co({ op: '-', d1: 4, d2: 4, carry: 'chain' }), ad({ op: 'mix', lo: 100, hi: 999, max: 999, form: 'mix' }), st({ op: 'mix', lo: 100, hi: 899, max: 999, carry: true }), co({ op: 'mix', d1: 3, d2: 3, carry: 'any' })], time: 300 }, true)
    ] }
  ];
  const api = { WORLDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CM_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
