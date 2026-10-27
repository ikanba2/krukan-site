/* ===== ข้อมูลกลางของ จอมจังหวะ: บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง (shared/kit.js) ใช้ ===== */
const { WORLDS } = window.BT_LV;
const SAVE = KG.store('krukan_game_beat_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

KG.kit.game = {
  id: 'beat', worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#2a1a5e', fxColors: [0xff7ab8, 0xffd34f, 0x7fe0ff, 0xffffff], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene) { KG.kit.bg(scene, 'bg_city', { veil: [0x120a3a, 0.5] }); }
};
const HOW_TO = {
  title: 'วิธีเล่น จอมจังหวะ',
  body: ['1. เลือกโลกทางซ้าย แล้วเลือกเพลง แต่ละโลกฝึกจังหวะหนึ่งแบบ เรียงจากง่ายไปยาก เพลงสุดท้ายของโลกคือบอส',
    '2. โน้ตจะตกลงมาตามเลน พอถึงวงกลมด้านล่างให้กดปุ่มของเลนนั้น ฟังเสียงกลองช่วยนับจังหวะ',
    '3. ปุ่มที่ใช้: เลนเดียวกด Space · สองเลนกด F กับ J · สามเลนกด F, Space, J · สี่เลนกด D, F, J, K จะใช้ลูกศรแทนก็ได้ หรือแตะที่เลนบนจอก็ได้',
    '4. โน้ตแท่งยาวให้กดค้างไว้จนจบแท่ง โน้ตที่มาพร้อมกันสองเลนให้กดสองปุ่มในเวลาเดียวกัน',
    '5. กดตรงจังหวะจะได้คะแนนมาก กดต่อเนื่องไม่พลาดจะได้คอมโบ ถ้าเต็มมาตรเฟเวอร์ คะแนนจะเป็นสองเท่า',
    '6. ความแม่นยำ 35% ขึ้นไปก็ผ่านด่าน 75% ได้ 2 ดาว 90% ได้ 3 ดาว · กด P พักเกม · F11 เต็มจอ'].join('\n')
};
const MapScene = KG.kit.makeMap({
  bg: 'bg_city', veil: [0x120a3a, 0.45], clouds: false, color: '#e0407a', kicker: 'BEAT HERO', title: 'เลือกโลกและเพลง', music: 'sunny', worlds: WORLDS, howTo: HOW_TO,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_city', music: 'sunny', riderX: 300, poseH: 520, poseW: 460,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(20,10,60,.7)'], [0.55, 'rgba(20,10,60,.3)'], [1, 'rgba(20,10,60,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'BEAT', grad: [[0, '#ffffff'], [0.4, '#ffd0f0'], [1, '#ff5aa8']], glow: '#ff5aa8', deep: '#5a0a3a', edge: '#e0407a' }, { t: 'HERO', grad: [[0, '#ffffff'], [1, '#7fe0ff']], glow: '#3d8bff', deep: '#0a2a6a', edge: '#2d8ad0' }], logoSize: 104,
  sub: 'จอมจังหวะ', subColor: '#ffd0f0', tag: 'ฝึกกดคีย์บอร์ดตามจังหวะเพลง ตั้งแต่ปุ่มเดียว สองมือ สี่นิ้ว กดพร้อมกัน ไปจนถึงกดค้าง รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' เพลง', credit: 'ทักษะคอมพิวเตอร์ อนุบาล 3–ป.3',
  fxColors: [0xff7ab8, 0xffd34f, 0x7fe0ff, 0xffffff], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและเพลง', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
