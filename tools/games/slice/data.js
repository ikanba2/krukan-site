/* ===== ข้อมูลกลางของเกม Techno Slice: บันทึกดาวรายด่าน โลกที่เล่นล่าสุด ===== */
const { WORLDS, TITLES, MON_NAME, getLevel, makeLevel } = window.SL_LV;
const SAVE = KG.store('krukan_game_slice_v1', { world: 1, stars: {}, tutorDone: {}, practice: 0, unlockAll: false });
const skey = (w, l) => w + ':' + l;
const levelStars = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const levelOpen = (w, l) => SAVE.data.unlockAll || l === 1 || levelStars(w, l - 1) > 0;
const worldStars = w => { let n = 0; for (let l = 1; l <= 10; l++) n += levelStars(w, l); return n; };
const totalStars = () => WORLDS.reduce((n, W) => n + worldStars(W.id), 0);
const maxStars = () => WORLDS.length * 30;
const curWorld = () => WORLDS[(SAVE.data.world || 1) - 1];
// ชุดท่าของไรเดอร์ในชุดภาพ 9 ช่อง (ใช้สลับตามโลก)
KG.FORMS.s0 = { name: 'ท่าดาบ', color: 0xe8452c, css: '#e8452c' };
KG.FORMS.s1 = { name: 'ท่าปืน', color: 0xe8452c, css: '#e8452c' };
KG.FORMS.s2 = { name: 'ท่าหอก', color: 0xe8452c, css: '#e8452c' };
KG.FORMS.s3 = { name: 'ท่ามีดคู่', color: 0xe8452c, css: '#e8452c' };
const INK = '#4a2412';
