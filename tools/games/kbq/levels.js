/* ===== ภารกิจแป้นพิมพ์: 8 โลก × 6 ด่าน = 48 ด่าน ฝึกใช้คีย์บอร์ดตั้งแต่ลูกศร ตัวอักษร ตัวเลข นิ้วที่ถูก ปุ่มพิเศษ คำสั้น ไปจนถึงคีย์ลัด =====
   แต่ละด่านคือชุดโจทย์วนตามจำนวนรอบ: p = { rounds, kinds: [โจทย์], time?: วินาที } ชนิดโจทย์และตัวเลือกดูใน eng-keys.js
   ใช้ทั้งในเกม (window.KQ_LV) และในการทดสอบด้วย Node (globalThis.KQ_LV) */
(function (root) {
  const L = (th, d, p, boss) => ({ th, d, k: 'round', p, boss: !!boss });
  const AZ = 'abcdefghijklmnopqrstuvwxyz', DG = '0123456789';
  const key = o => Object.assign({ k: 'key' }, o), arrow = o => Object.assign({ k: 'arrow' }, o), word = o => Object.assign({ k: 'word' }, o), sp = key => ({ k: 'special', key }), cb = o => Object.assign({ k: 'combo' }, o);
  const WORLDS = [
    { id: 'arrow', th: 'ลูกศรและเว้นวรรค', skill: 'ใช้ปุ่มลูกศรสี่ทิศพาหุ่นยนต์เดิน และใช้ปุ่มเว้นวรรคปล่อยจรวด', color: '#ff8a1e', icon: 'dragI', levels: [
      L('ขึ้นและลง', 'กดลูกศรขึ้นและลงตามลำดับ พาหุ่นยนต์ไปเก็บดาว', { rounds: 4, kinds: [arrow({ dirs: 'ud', len: 2 })] }),
      L('ซ้ายและขวา', 'กดลูกศรซ้ายและขวา พาหุ่นยนต์ไปให้ถึงดาว', { rounds: 4, kinds: [arrow({ dirs: 'lr', len: 3 })] }),
      L('สี่ทิศทาง', 'ลูกศรทั้งสี่ทิศ จำลำดับแล้วกดให้ถูก', { rounds: 4, kinds: [arrow({ dirs: 'udlr', len: 3 })] }),
      L('จรวดสเปซบาร์', 'กดปุ่มเว้นวรรคตามจำนวนที่บอก จรวดจะพุ่งขึ้น', { rounds: 3, kinds: [{ k: 'space', n: 3 }, { k: 'space', n: 4 }, { k: 'space', n: 5 }] }),
      L('ไฟเขียวไฟแดง', 'รอไฟเขียวแล้วค่อยกดเว้นวรรค ถ้าไฟแดงห้ามกด', { rounds: 5, kinds: [{ k: 'light' }] }),
      L('ผู้บังคับจรวด', 'ด่านบอส รวมลูกศรและเว้นวรรค', { rounds: 6, kinds: [arrow({ dirs: 'udlr', len: 4 }), { k: 'space', n: 5 }, { k: 'light' }, arrow({ dirs: 'udlr', len: 5 }), { k: 'space', n: 6 }, { k: 'light' }] }, true)
    ] },
    { id: 'letter', th: 'หาตัวอักษร', skill: 'หาตัวอักษรภาษาอังกฤษบนแป้นพิมพ์ ตั้งแต่ A ถึง Z', color: '#3d8bff', icon: 'keyI', levels: [
      L('A B C D', 'หาตัวอักษรบนแป้นพิมพ์ ปุ่มที่ต้องกดจะมีไฟกะพริบ', { rounds: 6, kinds: [key({ set: 'abcd', hint: true })] }),
      L('E ถึง L', 'ตัวอักษรกลุ่มที่สอง ยังมีไฟบอกทาง', { rounds: 7, kinds: [key({ set: 'efghijkl', hint: true })] }),
      L('M ถึง T', 'ตัวอักษรกลุ่มที่สาม', { rounds: 7, kinds: [key({ set: 'mnopqrst', hint: true })] }),
      L('U ถึง Z', 'ตัวอักษรกลุ่มสุดท้าย', { rounds: 7, kinds: [key({ set: 'uvwxyz', hint: true })] }),
      L('ครบทุกตัว', 'สุ่มตัวอักษรทั้งหมด หาให้เจอบนแป้น', { rounds: 8, kinds: [key({ set: AZ, hint: true })] }),
      L('จอมค้นหา', 'ด่านบอส ไม่มีไฟบอกทางแล้ว ลองหาด้วยตัวเอง', { rounds: 10, kinds: [key({ set: AZ, hint: false })] }, true)
    ] },
    { id: 'number', th: 'ตัวเลขบนแป้น', skill: 'หาตัวเลข 0 ถึง 9 บนแป้นพิมพ์ และกดคำตอบของโจทย์บวกเลข', color: '#3fbf6a', icon: 'numI', levels: [
      L('1 2 3', 'หาตัวเลขหนึ่ง สอง สาม บนแถวบนสุด', { rounds: 6, kinds: [key({ set: '123', hint: true })] }),
      L('4 5 6', 'ตัวเลขสี่ ห้า หก', { rounds: 6, kinds: [key({ set: '456', hint: true })] }),
      L('7 8 9 0', 'ตัวเลขเจ็ด แปด เก้า และศูนย์', { rounds: 6, kinds: [key({ set: '7890', hint: true })] }),
      L('เลขครบทุกตัว', 'สุ่มตัวเลขทั้งหมด หาให้เจอ', { rounds: 8, kinds: [key({ set: DG, hint: true })] }),
      L('บวกเลขง่าย ๆ', 'คิดเลขในใจ แล้วกดตัวเลขคำตอบบนแป้น', { rounds: 6, kinds: [{ k: 'sum', max: 5 }] }),
      L('จอมนักบวก', 'ด่านบอส บวกเลขและกดเลขให้ครบ', { rounds: 8, kinds: [{ k: 'sum', max: 9 }, key({ set: DG, seq: 3, hint: false })] }, true)
    ] },
    { id: 'finger', th: 'นิ้วไหนกดปุ่มไหน', skill: 'วางมือบนแถวหลัก และใช้นิ้วให้ถูกตามสีของแต่ละนิ้ว', color: '#9a6af0', icon: 'fingerI', levels: [
      L('F และ J นิ้วชี้', 'นิ้วชี้ซ้ายอยู่ที่ F นิ้วชี้ขวาอยู่ที่ J ปุ่มมีขีดนูนให้คลำหา', { rounds: 6, kinds: [key({ set: 'fj', hint: true, finger: true })] }),
      L('D และ K นิ้วกลาง', 'นิ้วกลางอยู่ที่ D และ K', { rounds: 6, kinds: [key({ set: 'dk', hint: true, finger: true })] }),
      L('S และ L นิ้วนาง', 'นิ้วนางอยู่ที่ S และ L', { rounds: 6, kinds: [key({ set: 'sl', hint: true, finger: true })] }),
      L('A และ ; นิ้วก้อย', 'นิ้วก้อยอยู่ที่ A และเครื่องหมายอัฒภาค', { rounds: 6, kinds: [key({ set: 'a;', hint: true, finger: true })] }),
      L('แถวหลักทั้งแปด', 'ทั้งแปดนิ้วอยู่ที่แถวหลัก ดูสีนิ้วแล้วกดให้ถูก', { rounds: 8, kinds: [key({ set: 'asdfjkl;', hint: true, finger: true })] }),
      L('จอมแถวหลัก', 'ด่านบอส กดต่อกันสามตัว ไม่มีไฟบอกทาง', { rounds: 6, kinds: [key({ set: 'asdfjkl;', seq: 3, hint: false })] }, true)
    ] },
    { id: 'special', th: 'ปุ่มพิเศษ', skill: 'รู้จัก Enter, Backspace, Shift, Tab และ Esc ว่าใช้ทำอะไร', color: '#ff6fae', icon: 'boltI', levels: [
      L('Enter ส่งข้อความ', 'พิมพ์ข้อความเสร็จแล้ว กด Enter เพื่อส่ง', { rounds: 4, kinds: [{ k: 'special', key: 'Enter' }] }),
      L('Backspace ลบตัวผิด', 'พิมพ์ผิดตัวสุดท้าย กด Backspace ลบ แล้วพิมพ์ใหม่', { rounds: 4, kinds: [{ k: 'special', key: 'Backspace' }] }),
      L('Shift ตัวพิมพ์ใหญ่', 'กด Shift ค้างไว้แล้วกดตัวอักษร จะได้ตัวใหญ่', { rounds: 6, kinds: [{ k: 'shift', set: 'abcdefghij' }] }),
      L('Tab และ Esc', 'Tab ย้ายไปช่องถัดไป Esc ปิดหน้าต่าง', { rounds: 6, kinds: [{ k: 'special', key: 'Tab' }, { k: 'special', key: 'Escape' }] }),
      L('ปุ่มพิเศษรวม', 'ใช้ปุ่มพิเศษหลายปุ่มในด่านเดียว', { rounds: 8, kinds: [{ k: 'special', key: 'Enter' }, { k: 'special', key: 'Backspace' }, { k: 'shift', set: AZ }, { k: 'special', key: 'Tab' }, { k: 'special', key: 'Escape' }] }),
      L('จอมปุ่มพิเศษ', 'ด่านบอส ปุ่มพิเศษทุกปุ่มรวมกัน', { rounds: 10, kinds: [{ k: 'shift', set: AZ }, { k: 'special', key: 'Backspace' }, { k: 'special', key: 'Enter' }, { k: 'special', key: 'Escape' }, { k: 'special', key: 'Tab' }] }, true)
    ] },
    { id: 'word', th: 'พิมพ์คำสั้น', skill: 'พิมพ์ชื่อสิ่งของภาษาอังกฤษจากภาพ เริ่มจากสามตัวอักษร', color: '#22b4d4', icon: 'cardsI', levels: [
      L('คำสามตัวอักษร', 'ดูภาพ แล้วพิมพ์ชื่อภาษาอังกฤษ มีไฟบอกปุ่ม', { rounds: 4, kinds: [word({ len: [3, 3], hint: true })] }),
      L('คำสี่ตัวอักษร', 'คำที่ยาวขึ้นอีกนิด', { rounds: 4, kinds: [word({ len: [4, 4], hint: true })] }),
      L('คำห้าตัวอักษร', 'คำห้าตัวอักษร ค่อย ๆ พิมพ์ทีละตัว', { rounds: 4, kinds: [word({ len: [5, 5], hint: true })] }),
      L('ไม่มีไฟบอกทาง', 'พิมพ์คำสั้นโดยไม่มีไฟช่วย', { rounds: 5, kinds: [word({ len: [3, 4], hint: false })] }),
      L('คำยาวขึ้น', 'คำที่มีสี่ถึงหกตัวอักษร', { rounds: 5, kinds: [word({ len: [4, 6], hint: false })] }),
      L('จอมนักพิมพ์', 'ด่านบอส พิมพ์คำให้ถูกทุกคำ', { rounds: 7, kinds: [word({ len: [3, 7], hint: false })] }, true)
    ] },
    { id: 'combo', th: 'คีย์ลัดสุดเจ๋ง', skill: 'ใช้ปุ่ม Ctrl กับตัวอักษรเพื่อคัดลอก วาง ย้อนกลับ บันทึก และเลือกทั้งหมด', color: '#ff9a2e', icon: 'puzzleI', levels: [
      L('Ctrl + C คัดลอก', 'กด Ctrl ค้างไว้ แล้วกด C เพื่อคัดลอกข้อความ', { rounds: 3, kinds: [cb({ ops: ['copy'], hint: true })] }),
      L('Ctrl + V วาง', 'หลังคัดลอก กด Ctrl และ V เพื่อวางข้อความ', { rounds: 3, kinds: [cb({ ops: ['paste'], hint: true })] }),
      L('Ctrl + Z ย้อนกลับ', 'ทำพลาด กด Ctrl และ Z เพื่อย้อนกลับ', { rounds: 3, kinds: [cb({ ops: ['undo'], hint: true })] }),
      L('Ctrl + S บันทึก', 'กด Ctrl และ S เพื่อบันทึกงานไว้', { rounds: 3, kinds: [cb({ ops: ['save'], hint: true })] }),
      L('จำคีย์ลัด', 'คีย์ลัดทั้งห้าแบบ ไม่มีไฟบอก ลองจำให้ได้', { rounds: 5, kinds: [cb({ ops: ['copy', 'paste', 'undo', 'save', 'all'], hint: false })] }),
      L('จอมคีย์ลัด', 'ด่านบอส คีย์ลัดต่อเนื่องกันหลายแบบ', { rounds: 6, kinds: [cb({ ops: ['all', 'copy', 'paste', 'undo', 'save', 'paste'], hint: false, ordered: true })] }, true)
    ] },
    { id: 'mission', th: 'ภารกิจแป้นพิมพ์', skill: 'ภารกิจจับเวลาที่รวมทักษะทั้งหมด ทำให้ทันก่อนเวลาหมด', color: '#e0407a', icon: 'houseI', levels: [
      L('ส่งจดหมาย', 'พิมพ์คำแล้วกด Enter ส่งให้ทันเวลา', { rounds: 6, time: 100, kinds: [word({ len: [3, 4], hint: true }), { k: 'special', key: 'Enter' }, key({ set: AZ, hint: true })] }),
      L('ซ่อมเอกสาร', 'ลบตัวผิด และใช้คีย์ลัดซ่อมเอกสาร', { rounds: 6, time: 110, kinds: [{ k: 'special', key: 'Backspace' }, cb({ ops: ['copy'], hint: true }), cb({ ops: ['paste'], hint: true }), cb({ ops: ['undo'], hint: true })] }),
      L('สนามจรวด', 'บังคับหุ่นยนต์ ปล่อยจรวด และดูไฟจราจร', { rounds: 6, time: 110, kinds: [arrow({ dirs: 'udlr', len: 4 }), { k: 'space', n: 4 }, { k: 'light' }, key({ set: DG, hint: true })] }),
      L('นักพิมพ์ตัวจริง', 'พิมพ์คำ ตัวใหญ่ และกดแถวหลักให้ทัน', { rounds: 7, time: 130, kinds: [word({ len: [4, 5], hint: true }), { k: 'shift', set: AZ }, key({ set: 'asdfjkl;', seq: 3, hint: false })] }),
      L('ศูนย์ควบคุมเมือง', 'ทักษะแป้นพิมพ์รวมกันทั้งหมด', { rounds: 8, time: 160, kinds: [{ k: 'sum', max: 9 }, word({ len: [3, 5], hint: false }), { k: 'special', key: 'Tab' }, cb({ ops: ['save', 'all'], hint: false }), arrow({ dirs: 'udlr', len: 4 }), { k: 'light' }] }),
      L('จอมจอมแป้นพิมพ์', 'ด่านบอสสุดท้าย ใช้ทุกทักษะให้ครบทุกรอบ', { rounds: 12, time: 260, kinds: [key({ set: AZ, hint: false }), arrow({ dirs: 'udlr', len: 5 }), word({ len: [4, 6], hint: false }), { k: 'shift', set: AZ }, cb({ ops: ['copy', 'paste', 'undo'], hint: false }), { k: 'space', n: 5 }, { k: 'sum', max: 9 }, { k: 'special', key: 'Backspace' }, { k: 'light' }, key({ set: 'asdfjkl;', seq: 3, hint: false }), { k: 'special', key: 'Escape' }, cb({ ops: ['all', 'save'], hint: false })] }, true)
    ] }
  ];
  root.KQ_LV = { WORLDS };
})(typeof window !== 'undefined' ? window : globalThis);
