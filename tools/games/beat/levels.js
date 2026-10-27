/* ===== จอมจังหวะ: 8 โลก × 6 ด่าน = 48 เพลง ฝึกกดคีย์บอร์ดตามจังหวะ จากปุ่มเดียวไปจนถึงสี่ปุ่ม กดพร้อมกัน และกดค้าง =====
   แต่ละด่านคือหนึ่งเพลง: p = { bpm, lanes (1–4), bars, style (beat/rest/slow/eighth/sync/mix), pairs, holds, lead (วินาทีที่โน้ตตกจากบนลงล่าง), win (ความผ่อนปรนของจังหวะ ยิ่งมากยิ่งง่าย), root (โน้ตหลัก MIDI), minor }
   ใช้ทั้งในเกม (window.BT_LV) และในการทดสอบด้วย Node (globalThis.BT_LV) */
(function (root) {
  const S = (th, d, p, boss) => ({ th, d, k: 'song', p: Object.assign({ lead: p.bpm >= 100 ? 1.7 : 1.9, win: 1.2, root: 60, minor: false }, p), boss: !!boss });
  const WORLDS = [
    { id: 'one', th: 'เคาะตามจังหวะ', skill: 'ใช้ปุ่มเว้นวรรคเคาะตามจังหวะกลอง เริ่มจากช้า ๆ สม่ำเสมอ', color: '#ff8a1e', icon: 'noteI', levels: [
      S('ตุ้บ ตุ้บ ตุ้บ', 'ฟังเสียงกลองแล้วกดเว้นวรรคทุกจังหวะ', { bpm: 70, lanes: 1, bars: 4, style: 'beat', win: 1.5, root: 60 }),
      S('เคาะสม่ำเสมอ', 'เคาะให้เท่ากันทุกจังหวะ ไม่เร็วไม่ช้า', { bpm: 80, lanes: 1, bars: 6, style: 'beat', win: 1.5, root: 62 }),
      S('มีช่วงพัก', 'บางจังหวะเงียบ ให้นิ่งไว้แล้วเคาะต่อ', { bpm: 80, lanes: 1, bars: 6, style: 'rest', win: 1.4, root: 65 }),
      S('เคาะครึ่งจังหวะ', 'โน้ตถี่ขึ้นเป็นสองเท่า แต่ยังช้าอยู่', { bpm: 66, lanes: 1, bars: 6, style: 'eighth', win: 1.4, root: 60 }),
      S('จังหวะเด้ง', 'เคาะแทรกระหว่างจังหวะ ให้รู้สึกเด้ง ๆ', { bpm: 88, lanes: 1, bars: 8, style: 'sync', win: 1.35, root: 67 }),
      S('กลองยักษ์', 'ด่านบอส เคาะทุกแบบที่เรียนมา', { bpm: 92, lanes: 1, bars: 12, style: 'mix', win: 1.3, root: 62 }, true)
    ] },
    { id: 'two', th: 'สลับมือซ้ายขวา', skill: 'ใช้นิ้วชี้ซ้ายกด F และนิ้วชี้ขวากด J สลับกันตามจังหวะ', color: '#3d8bff', icon: 'keyI', levels: [
      S('ซ้ายขวา ซ้ายขวา', 'F ซ้าย J ขวา สลับกันทีละจังหวะ', { bpm: 72, lanes: 2, bars: 4, style: 'beat', win: 1.45, root: 60 }),
      S('สลับเป็นคู่', 'ซ้ายสองที ขวาสองที ลองจำแบบดู', { bpm: 78, lanes: 2, bars: 6, style: 'beat', win: 1.4, root: 64 }),
      S('ซ้ายขวามีพัก', 'บางจังหวะเงียบ นิ้วต้องรอ', { bpm: 82, lanes: 2, bars: 6, style: 'rest', win: 1.35, root: 62 }),
      S('ครึ่งจังหวะสองมือ', 'โน้ตถี่ขึ้น สลับมือให้ทัน', { bpm: 70, lanes: 2, bars: 6, style: 'eighth', win: 1.35, root: 65 }),
      S('จังหวะเด้งสองมือ', 'เคาะแทรกจังหวะด้วยสองมือ', { bpm: 90, lanes: 2, bars: 8, style: 'sync', win: 1.3, root: 67 }),
      S('คู่หูกลองใหญ่', 'ด่านบอส สลับมือหลายแบบ', { bpm: 96, lanes: 2, bars: 12, style: 'mix', win: 1.25, root: 60 }, true)
    ] },
    { id: 'three', th: 'สามเลน', skill: 'เพิ่มปุ่มเว้นวรรคตรงกลาง ใช้นิ้วโป้งกดสลับกับ F และ J', color: '#3fbf6a', icon: 'boltI', levels: [
      S('สามปุ่มแรก', 'F กลาง Space และ J ไล่เรียงกัน', { bpm: 72, lanes: 3, bars: 4, style: 'beat', win: 1.4, root: 62 }),
      S('ไล่ไปมา', 'ไล่ซ้าย กลาง ขวา แล้วย้อนกลับ', { bpm: 78, lanes: 3, bars: 6, style: 'beat', win: 1.35, root: 65 }),
      S('สามเลนมีพัก', 'บางจังหวะเงียบ ต้องดูโน้ตดี ๆ', { bpm: 84, lanes: 3, bars: 6, style: 'rest', win: 1.3, root: 60 }),
      S('ถี่ขึ้นสามเลน', 'โน้ตถี่ขึ้น แต่ยังช้า', { bpm: 70, lanes: 3, bars: 6, style: 'eighth', win: 1.3, root: 67 }),
      S('เด้งสามเลน', 'โน้ตแทรกระหว่างจังหวะ', { bpm: 92, lanes: 3, bars: 8, style: 'sync', win: 1.25, root: 62 }),
      S('วงดนตรีสามชิ้น', 'ด่านบอส สามเลนหลายจังหวะ', { bpm: 98, lanes: 3, bars: 12, style: 'mix', win: 1.2, root: 65 }, true)
    ] },
    { id: 'four', th: 'สี่นิ้ว', skill: 'ใช้สี่นิ้ว D F J K กดตามโน้ต ฝึกนิ้วกลางและนิ้วชี้', color: '#9a6af0', icon: 'fingerI', levels: [
      S('D F J K', 'สี่ปุ่มบนแถวหลัก ไล่จากซ้ายไปขวา', { bpm: 72, lanes: 4, bars: 4, style: 'beat', win: 1.35, root: 60 }),
      S('ไล่ขึ้นไล่ลง', 'แบบโน้ตเปลี่ยนไปทุกสองบาร์', { bpm: 78, lanes: 4, bars: 6, style: 'beat', win: 1.3, root: 64 }),
      S('สี่เลนมีพัก', 'บางจังหวะเงียบ', { bpm: 84, lanes: 4, bars: 6, style: 'rest', win: 1.25, root: 62 }),
      S('ครึ่งจังหวะสี่เลน', 'โน้ตถี่ขึ้น นิ้วต้องว่องไว', { bpm: 72, lanes: 4, bars: 6, style: 'eighth', win: 1.25, root: 65 }),
      S('เด้งสี่เลน', 'โน้ตแทรกจังหวะ', { bpm: 94, lanes: 4, bars: 8, style: 'sync', win: 1.2, root: 67 }),
      S('วงดนตรีสี่ชิ้น', 'ด่านบอส สี่เลนเต็มวง', { bpm: 100, lanes: 4, bars: 12, style: 'mix', win: 1.15, root: 60 }, true)
    ] },
    { id: 'pair', th: 'กดสองปุ่มพร้อมกัน', skill: 'บางโน้ตมาพร้อมกันสองเลน ให้กดสองปุ่มในเวลาเดียวกัน', color: '#ff6fae', icon: 'puzzleI', levels: [
      S('คู่แรก', 'ซ้ายและขวามาพร้อมกัน กด F กับ J ด้วยกัน', { bpm: 72, lanes: 2, bars: 6, style: 'beat', pairs: 0.5, win: 1.4, root: 62 }),
      S('คู่และเดี่ยว', 'ผสมระหว่างโน้ตเดี่ยวกับโน้ตคู่', { bpm: 80, lanes: 2, bars: 8, style: 'rest', pairs: 0.5, win: 1.35, root: 65 }),
      S('คู่สามเลน', 'สามเลน มีบางจังหวะที่กดพร้อมกันสองปุ่ม', { bpm: 78, lanes: 3, bars: 8, style: 'beat', pairs: 0.45, win: 1.3, root: 60 }),
      S('คู่เด้ง', 'โน้ตคู่แทรกในจังหวะเด้ง', { bpm: 88, lanes: 3, bars: 8, style: 'sync', pairs: 0.4, win: 1.25, root: 67 }),
      S('คู่สี่เลน', 'สี่เลน มีโน้ตคู่หลายจังหวะ', { bpm: 84, lanes: 4, bars: 8, style: 'mix', pairs: 0.45, win: 1.2, root: 62 }),
      S('คู่หูสุดยอด', 'ด่านบอส โน้ตคู่หลากหลายแบบ', { bpm: 96, lanes: 4, bars: 12, style: 'mix', pairs: 0.5, win: 1.15, root: 65 }, true)
    ] },
    { id: 'fast', th: 'จังหวะเร็วขึ้น', skill: 'เพลงเร็วขึ้นทีละนิด ฝึกให้นิ้วตามทันและยังแม่นอยู่', color: '#22b4d4', icon: 'noteI', levels: [
      S('เร็วขึ้นอีกนิด', 'เพลงเร็วขึ้น แต่โน้ตยังไม่ถี่', { bpm: 104, lanes: 2, bars: 8, style: 'rest', win: 1.2, root: 60 }),
      S('วิ่งตามจังหวะ', 'ครึ่งจังหวะแต่เพลงเร็วขึ้น', { bpm: 96, lanes: 2, bars: 8, style: 'eighth', win: 1.2, root: 64 }),
      S('จังหวะกระโดด', 'โน้ตเด้งแทรกในเพลงเร็ว', { bpm: 108, lanes: 3, bars: 8, style: 'sync', win: 1.15, root: 62 }),
      S('สี่นิ้วเร็ว', 'สี่เลนในเพลงเร็ว', { bpm: 110, lanes: 4, bars: 8, style: 'rest', win: 1.15, root: 65 }),
      S('เร็วและเด้ง', 'เพลงเร็ว มีทั้งครึ่งจังหวะและแทรกจังหวะ', { bpm: 112, lanes: 3, bars: 10, style: 'mix', win: 1.1, root: 67 }),
      S('จอมความเร็ว', 'ด่านบอส เพลงเร็วที่สุดในโลกนี้', { bpm: 118, lanes: 4, bars: 14, style: 'mix', pairs: 0.2, win: 1.1, root: 60 }, true)
    ] },
    { id: 'hold', th: 'โน้ตยาว', skill: 'กดปุ่มค้างตามความยาวของโน้ต แล้วปล่อยให้ตรงจังหวะ', color: '#e0a020', icon: 'dragI', levels: [
      S('กดค้างครั้งแรก', 'โน้ตแท่งยาว กดค้างไว้จนจบแท่ง', { bpm: 72, lanes: 2, bars: 8, style: 'hold', holds: 0.9, win: 1.4, root: 60 }),
      S('ยาวและสั้น', 'มีทั้งโน้ตยาวและโน้ตสั้น', { bpm: 78, lanes: 2, bars: 10, style: 'hold', holds: 0.8, win: 1.35, root: 64 }),
      S('ยาวสามเลน', 'โน้ตยาวในสามเลน', { bpm: 80, lanes: 3, bars: 10, style: 'hold', holds: 0.8, win: 1.3, root: 62 }),
      S('ยาวสี่เลน', 'สี่เลน มีโน้ตยาวหลายแท่ง', { bpm: 84, lanes: 4, bars: 10, style: 'hold', holds: 0.75, win: 1.25, root: 65 }),
      S('ยาวกับโน้ตคู่', 'กดค้างพร้อมกับกดโน้ตอื่น', { bpm: 88, lanes: 4, bars: 12, style: 'hold', holds: 0.7, pairs: 0.25, win: 1.2, root: 67 }),
      S('จอมกดค้าง', 'ด่านบอส โน้ตยาวทุกแบบ', { bpm: 96, lanes: 4, bars: 16, style: 'hold', holds: 0.7, pairs: 0.3, win: 1.15, root: 60 }, true)
    ] },
    { id: 'concert', th: 'คอนเสิร์ตใหญ่', skill: 'เพลงยาวที่รวมทุกทักษะ ทั้งโน้ตคู่ โน้ตยาว และจังหวะเร็ว', color: '#e0407a', icon: 'crown', levels: [
      S('เปิดงานคอนเสิร์ต', 'เพลงยาวสี่เลน รวมจังหวะพื้นฐาน', { bpm: 92, lanes: 4, bars: 16, style: 'mix', win: 1.2, root: 62 }),
      S('เพลงสามเลนสนุก', 'สามเลนยาว ๆ มีโน้ตคู่แทรก', { bpm: 100, lanes: 3, bars: 16, style: 'mix', pairs: 0.3, win: 1.15, root: 65 }),
      S('เพลงโน้ตยาว', 'ท่อนที่มีโน้ตยาวสลับโน้ตเร็ว', { bpm: 96, lanes: 4, bars: 16, style: 'mix', holds: 0.35, win: 1.15, root: 60 }),
      S('เพลงคู่หู', 'โน้ตคู่เยอะ ๆ ในเพลงยาว', { bpm: 104, lanes: 4, bars: 16, style: 'mix', pairs: 0.4, win: 1.1, root: 67 }),
      S('เพลงเร็วสุดมัน', 'เร็ว ถี่ และมีโน้ตคู่', { bpm: 112, lanes: 4, bars: 16, style: 'mix', pairs: 0.3, win: 1.1, root: 62 }),
      S('ฮีโร่แห่งจังหวะ', 'ด่านบอสสุดท้าย เพลงยาวที่รวมทุกอย่าง', { bpm: 108, lanes: 4, bars: 24, style: 'mix', pairs: 0.3, holds: 0.3, win: 1.1, root: 65 }, true)
    ] }
  ];
  root.BT_LV = { WORLDS };
})(typeof window !== 'undefined' ? window : globalThis);
