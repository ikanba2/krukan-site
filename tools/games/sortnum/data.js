/* ===== ข้อมูลกลางของ เรียงลำดับตัวเลข: บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง ===== */
const { WORLDS } = window.SN_LV;
const SAVE = KG.store('krukan_game_sortnum_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

const BG_KEYS = ['bg_sky', 'bg_city', 'bg_sky', 'bg_workshop', 'bg_city', 'bg_sky', 'bg_workshop', 'bg_city'];
KG.kit.game = {
  id: 'sortnum', worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#bfe3ff', fxColors: [0x7fe0ff, 0xffd34f, 0xff7ab8, 0x9bf0a8], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene, wi) { KG.kit.bg(scene, BG_KEYS[wi % BG_KEYS.length], { veil: [0xffffff, 0.3] }); KG.kit.clouds(scene, 3, { alpha: 0.5 }); KG.mk.floatDigits(scene, { n: 14 }); }
};
const HOW_TO = {
  title: 'วิธีเล่น เรียงลำดับตัวเลข',
  body: ['1. เลือกโลกทางซ้าย แล้วเลือกด่าน แต่ละโลกฝึกเรื่องเลขอย่างหนึ่ง เรียงจากง่ายไปยาก ด่านสุดท้ายของโลกคือบอส',
    '2. ด่านเรียงเลข: ดูโจทย์ว่าให้เรียงจากน้อยไปมาก หรือมากไปน้อย แล้วแตะเลขทีละตัวตามลำดับ หรือจะลากไปวางในช่องก็ได้ ถ้าเลขนั้นยังไม่ถึงตาของมัน เลขจะเด้งกลับ',
    '3. ด่านเลือกคำตอบ: แตะปุ่มคำตอบ หรือกดเลข 1 2 3 บนคีย์บอร์ดตามหมายเลขที่มุมปุ่ม',
    '4. เสียงจะอ่านโจทย์ให้ฟัง กดปุ่มลำโพงบนป้ายเพื่อฟังซ้ำได้',
    '5. ทำพลาดไม่มีแพ้ แต่จะได้ดาวน้อยลง ถ้าพลาดสองครั้งในข้อเดียวจะมีแสงใบ้ให้ เก็บให้ครบ 3 ดาวด้วยการพลาดน้อยที่สุด',
    '6. บางด่านบอสจับเวลา ทำให้ทันก่อนเวลาหมด · F11 เต็มจอ'].join('\n')
};
const MapScene = KG.kit.makeMap({
  bg: 'bg_sky', color: '#3d8bff', kicker: 'NUMBER RUN', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_sky', music: 'sunny', deco: sc => KG.mk.floatDigits(sc, { n: 18, depth: 1, alpha: 0.5 }), riderX: 300, poseH: 520, poseW: 460,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.6)'], [0.55, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'NUMBER', grad: [[0, '#ffffff'], [0.4, '#ffe28a'], [1, '#ff9a2e']], glow: '#ff9a2e', deep: '#7a3a00', edge: '#d9820a' }, { t: 'RUN', grad: [[0, '#ffffff'], [1, '#7fe0ff']], glow: '#3d8bff', deep: '#0a2a6a', edge: '#2d6ad0' }], logoSize: 96,
  sub: 'เรียงลำดับตัวเลข', subColor: '#2d6ad0', tag: 'เรียงเลขให้ถูกทิศ เทียบมากน้อย นับข้าม ค่าประจำหลัก ตั้งแต่เลขถึงสิบไปจนถึงหลักพัน รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน',
  credit: 'คณิตศาสตร์ ป.1–ป.3', fxColors: [0x7fe0ff, 0xffd34f, 0xff7ab8, 0xffffff], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
