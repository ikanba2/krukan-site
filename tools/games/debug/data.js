/* ===== ข้อมูลกลางของเกม Bug Buster: บันทึกคะแนน ดาว และโหมดที่เลือกล่าสุด ===== */
const { LEVELS, ROUNDS, KIND } = window.BB_DATA;
BB.bind(window.BB_DATA);
const SAVE = KG.store('krukan_game_debug_v1', { mode: 'time', stars: {}, best: {}, tutorDone: false, unlockAll: false });
const levelStars = l => SAVE.data.stars[l] || 0;
const levelOpen = l => SAVE.data.unlockAll || l === 1 || levelStars(l - 1) > 0;
const totalStars = () => LEVELS.reduce((n, L) => n + levelStars(L.id), 0);
const maxStars = () => LEVELS.length * 3;
const FORMS = ['h2', 'h3', 'h0', 'h1'];   // ทอง › แดง › มาเจนต้า › ฟ้าน้ำเงิน ตามคอมโบ
// มอนสเตอร์บั๊กของแต่ละด่าน: id ภาพ ชื่อ ขนาดลำตัว (ด่านบอสตัวใหญ่)
const MONS = {
  'bug-mush': { id: 'm8', name: 'เห็ดบั๊ก', body: 190 }, 'bug-boar': { id: 'm9', name: 'หมูป่าบั๊ก', body: 180 }, 'bug-beetle': { id: 'm10', name: 'ด้วงบั๊ก', body: 170 },
  'bug-crab': { id: 'm12', name: 'ปูบั๊ก', body: 160 }, 'bug-lizard': { id: 'm13', name: 'กิ้งก่าบั๊ก', body: 175 }, 'bug-fox': { id: 'm19', name: 'จิ้งจอกบั๊ก', body: 200 },
  'bug-jelly': { id: 'm17', name: 'แมงกะพรุนบั๊ก', body: 200 }, 'bug-dragon': { id: 'm21', name: 'มังกรบั๊ก', body: 200 }, 'bug-imp': { id: 'm25', name: 'ภูตบั๊ก', body: 210 }, 'bug-boss': { id: 'm36', name: 'ราชาบั๊ก', body: 300 }
};
const BG = ['nature', 'autumn', 'reef', 'sun'];
const CODE_FONT = "Consolas,'Courier New',Menlo,monospace,Kanit";
const TOKEN_COLOR = { kw: '#d9560a', fn: '#7a3fc9', str: '#1a8f4a', num: '#1767d1', cm: '#8a97b8', op: '#33456f', id: '#1b2a6b', ws: '#1b2a6b' };
