/* ===== ข้อมูลกลางของ คิดเลขแสนสนุก (ภารกิจคำนวณแนวตั้ง): บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง ===== */
const { WORLDS } = window.CM_LV;
const SAVE = KG.store('krukan_game_colmath_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

KG.kit.game = {
  id: 'colmath', stageAlpha: 0.92, worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#bfe3a8', fxColors: [0xffd34f, 0xffffff, 0x9bf0a8, 0x7fe0ff], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene) { KG.kit.bg(scene, 'bg_forest', { veil: [0xffffff, 0.2], drift: false }); KG.mk.floatDigits(scene, { chars: '0123456789+−', n: 12, alpha: 0.4 }); }
};
const HOW_TO = {
  title: 'วิธีเล่น คิดเลขแสนสนุก',
  body: ['1. เลือกโลกทางซ้าย แล้วเลือกด่าน ตั้งแต่บวกลบหลักเดียวไปจนถึงเลขสี่หลัก ด่านสุดท้ายของโลกคือบอส',
    '2. ด่านตั้งบวกลบแนวตั้ง: เขียนคำตอบทีละหลักจากหลักหน่วยไปทางซ้าย กดตัวเลขบนแป้น (หรือกดตัวเลขบนคีย์บอร์ด) ถ้าถูกจะขยับไปหลักถัดไปเอง',
    '3. บวกที่ต้องทด: ตัวทดจะขึ้นเหนือหลักถัดไป บางด่านต้องพิมพ์ตัวทดเอง · ลบที่ต้องยืม: เกมจะขีดฆ่าตัวตั้งเดิมแล้วขึ้นตัวตั้งใหม่ให้',
    '4. ติดขัดกดปุ่มหลอดไฟบนแป้น (หรือกด Enter) เพื่อดูวิธีคิดของหลักนั้น แต่จะเสียคะแนนดาวนิดหนึ่ง',
    '5. ด่านเลือกคำตอบ: แตะปุ่มคำตอบ หรือกดเลข 1 2 3 4 ตามหมายเลขที่มุมปุ่ม',
    '6. ทำพลาดไม่มีแพ้ แต่จะได้ดาวน้อยลง เก็บให้ครบ 3 ดาวด้วยการพลาดน้อยที่สุด · บางด่านจับเวลา · F11 เต็มจอ'].join('\n')
};
const MapScene = KG.kit.makeMap({
  bg: 'bg_forest', color: '#3fbf6a', kicker: 'POWER COLUMNS', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO, veil: [0xffffff, 0.12], clouds: false,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_sky', music: 'sunny', deco: sc => KG.mk.floatDigits(sc, { chars: '0123456789+−', n: 18, depth: 1, alpha: 0.5 }), riderX: 300, poseH: 500, poseW: 420,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.55)'], [0.55, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'POWER', grad: [[0, '#ffffff'], [0.4, '#c8ffa8'], [1, '#3fbf6a']], glow: '#3fbf6a', deep: '#0e4a24', edge: '#22a050' }, { t: 'COLUMNS', grad: [[0, '#ffffff'], [1, '#ffd34f']], glow: '#ff9a2e', deep: '#7a3a00', edge: '#d9820a' }], logoSize: 88,
  sub: 'คิดเลขแสนสนุก', subColor: '#22a050', tag: 'ภารกิจคำนวณแนวตั้ง ตีพลังตัวเลข บวก ลบ ทด ยืม ตั้งแต่หลักเดียวถึงสี่หลัก รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน',
  credit: 'คณิตศาสตร์ ป.1–ป.4', fxColors: [0xffd34f, 0xffffff, 0x9bf0a8, 0x7fe0ff], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
