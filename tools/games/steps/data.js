/* ===== ข้อมูลกลางของเกม Techno Steps: บันทึกดาวรายด่าน โลกที่เล่นล่าสุด และรายการข้อความ ===== */
const { WORLDS, TITLES, MON_NAME, getLevel, makeLevel } = window.ST_LV;
const SAVE = KG.store('krukan_game_steps_v1', { world: 1, stars: {}, tutorDone: {}, practice: 0, unlockAll: false });
const skey = (w, l) => w + ':' + l;
const levelStars = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const levelOpen = (w, l) => SAVE.data.unlockAll || l === 1 || levelStars(w, l - 1) > 0;
const worldStars = w => { let n = 0; for (let l = 1; l <= 10; l++) n += levelStars(w, l); return n; };
const totalStars = () => WORLDS.reduce((n, W) => n + worldStars(W.id), 0);
const maxStars = () => WORLDS.length * 30;
const curWorld = () => WORLDS[(SAVE.data.world || 1) - 1];
// ชื่อท่าของไรเดอร์ (ชุดภาพ 9 ช่องมี 4 อาวุธ ใช้สลับตามโลก)
KG.FORMS.s0 = { name: 'ท่าดาบ', color: 0xff3d8b, css: '#ff3d8b' };
KG.FORMS.s1 = { name: 'ท่าปืน', color: 0xff3d8b, css: '#ff3d8b' };
KG.FORMS.s2 = { name: 'ท่าหอก', color: 0xff3d8b, css: '#ff3d8b' };
KG.FORMS.s3 = { name: 'ท่ามีดคู่', color: 0xff3d8b, css: '#ff3d8b' };
const COND_LABEL = { monster: 'มีมอนสเตอร์ข้างหน้า', wall: 'ข้างหน้าเป็นกำแพง', pit: 'ข้างหน้าเป็นหลุม', clear: 'ข้างหน้าเดินได้', goal: 'ถึงธงแล้ว' };
const CARD_COLOR = { mv: 0x2b8cff, atk: 0xe0243d, rep: 0xff8a2b, until: 0x9b5cff, if: 0x14b5c9, call: 0x22b45a };
const CARD_CSS = { mv: '#2b8cff', atk: '#e0243d', rep: '#ff8a2b', until: '#9b5cff', if: '#14b5c9', call: '#22b45a' };
const MOVE_ICON = { up: 'chevU', down: 'chevD', left: 'chevL', right: 'chevR' };
const MOVE_LABEL = { up: 'ขึ้น', down: 'ลง', left: 'ซ้าย', right: 'ขวา' };
// สีกระเบื้องของแต่ละโลก [พื้นอ่อน, พื้นเข้ม, ขอบล่าง]
const TILE = {
  sky: ['#d2efff', '#bfe4fb', '#7fb6dc'], nature: ['#d6f4bf', '#c2eaa4', '#82b665'], sun: ['#ffeab5', '#ffdd94', '#d9a24a'],
  reef: ['#c9f7f0', '#b0efe5', '#62b8ac'], autumn: ['#ffdcc0', '#ffcba5', '#d98e5e'], ice: ['#e6f6ff', '#d2eafb', '#8fb6d6']
};
