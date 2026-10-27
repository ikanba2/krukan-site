/* ===== ข้อมูลกลางของ บันไดงูบวกลบเลข: บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง ===== */
const { WORLDS } = window.SL_LV;
const SAVE = KG.store('krukan_game_snake_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

const BG_KEYS = ['bg_sky', 'bg_city', 'bg_sky', 'bg_workshop', 'bg_city', 'bg_sky', 'bg_workshop', 'bg_city'];
KG.kit.game = {
  id: 'snake', stageAlpha: 0.9, worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#bfe3ff', fxColors: [0x7fe0ff, 0xffd34f, 0x9bf0a8, 0xff7ab8], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene, wi) { KG.kit.bg(scene, BG_KEYS[wi % BG_KEYS.length], { veil: [0xbfe3ff, 0.35] }); KG.kit.clouds(scene, 3, { alpha: 0.5 }); KG.mk.floatDigits(scene, { chars: '0123456789+−', n: 10, alpha: 0.35 }); }
};
const HOW_TO = {
  title: 'วิธีเล่น บันไดงูบวกลบเลข',
  body: ['1. เลือกโลกทางซ้าย แล้วเลือกด่าน กระดานใหญ่ขึ้นและโจทย์ยากขึ้นเรื่อย ๆ ด่านสุดท้ายของโลกคือบอส ส่วนโลกสุดท้ายเล่นกับเพื่อนได้ 2 ถึง 4 คน',
    '2. ถึงตาคุณ: ตอบโจทย์บวกลบให้ถูก (แตะปุ่มคำตอบ หรือกดเลข 1 2 3 4 บนคีย์บอร์ด) จึงจะได้ทอยลูกเต๋าแล้วเดินตามแต้ม',
    '3. ตอบผิดจะอยู่ที่เดิม เกมจะบอกคำตอบที่ถูกให้เรียนรู้ แล้วเป็นตาของคนต่อไป',
    '4. เดินไปเจอบันไดจะได้ขึ้นไปช่องบน เจองูจะถูกกลืนลงช่องล่าง',
    '5. ใครถึงช่องสุดท้ายก่อนเป็นผู้ชนะ ถ้าคู่แข่งถึงก่อนคุณต้องลองใหม่ ทำพลาดน้อยจะได้ดาวมาก',
    '6. โลกเล่นกับเพื่อน: ผลัดกันตอบโจทย์บนจอเดียวกัน ใครถึงก่อนชนะ · F11 เต็มจอ'].join('\n')
};
const MapScene = KG.kit.makeMap({
  bg: 'bg_sky', color: '#3d8bff', kicker: 'SNAKES & LADDERS MATH', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_sky', music: 'sunny', deco: sc => KG.mk.floatDigits(sc, { chars: '0123456789+−', n: 18, depth: 1, alpha: 0.5 }), riderX: 300, poseH: 520, poseW: 440,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.55)'], [0.55, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'SNAKE', grad: [[0, '#ffffff'], [0.4, '#c8ffa8'], [1, '#3fbf6a']], glow: '#3fbf6a', deep: '#0e4a24', edge: '#22a050' }, { t: 'LADDER MATH', grad: [[0, '#ffffff'], [1, '#ffd34f']], glow: '#ff9a2e', deep: '#7a3a00', edge: '#d9820a' }], logoSize: 80,
  sub: 'บันไดงูบวกลบเลข', subColor: '#22a050', tag: 'ตอบโจทย์บวกลบให้ถูก ทอยเต๋า ปีนบันได หลบงู ชนะคู่แข่ง หรือชวนเพื่อนเล่นพร้อมกัน 2 ถึง 4 คน รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน',
  credit: 'คณิตศาสตร์ ป.1–ป.3', fxColors: [0x7fe0ff, 0xffd34f, 0x9bf0a8, 0xffffff], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
