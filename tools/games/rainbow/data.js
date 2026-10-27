/* ===== ข้อมูลกลางของ เมืองสีรุ้ง: บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง (shared/kit.js) ใช้ ===== */
const { WORLDS } = window.RB_LV;
const SAVE = KG.store('krukan_game_rainbow_v2', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

const BG_KEYS = ['bg_sky', 'bg_city', 'bg_sky', 'bg_workshop', 'bg_city', 'bg_sky', 'bg_workshop', 'bg_city'];
KG.kit.game = {
  id: 'rainbow', worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#bfe3ff', fxColors: [0xff7ab8, 0xffd34f, 0x7fe0ff, 0x9bf0a8], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene, wi) { KG.kit.bg(scene, BG_KEYS[wi % BG_KEYS.length], { veil: [0xffffff, 0.34] }); KG.kit.clouds(scene, 4, { alpha: 0.55 }); }
};
const HOW_TO = {
  title: 'วิธีเล่น เมืองสีรุ้ง',
  body: '1. เลือกโลกทางซ้าย แล้วเลือกด่าน แต่ละโลกฝึกทักษะหนึ่งอย่าง เรียงจากง่ายไปยาก ด่านสุดท้ายของโลกคือบอส\n2. เสียงจะอ่านโจทย์ให้ฟัง กดปุ่มลำโพงบนป้ายเพื่อฟังซ้ำได้\n3. แตะตัวเลือกที่ถูก หรือลากของไปวาง จะลากหรือแตะของแล้วแตะที่วางก็ได้\n4. ทำถูกจะได้ดาวและคะแนน ทำพลาดเกมจะบอกใบ้ให้ ไม่มีแพ้ เก็บให้ครบ 3 ดาวด้วยการพลาดน้อยที่สุด\n5. โลกสุดท้ายเป็นภารกิจจับเวลา ทำให้ทันก่อนเวลาหมด\n6. กด P พักเกม · F เต็มจอ · ลูกศรเลือกด่านในหน้าเลือกด่าน'
};
const MapScene = KG.kit.makeMap({
  bg: 'bg_sky', color: '#ff5a8a', kicker: 'RAINBOW CITY', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_sky', music: 'sunny', riderX: 300, poseH: 520, poseW: 460,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.55)'], [0.55, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'RAINBOW', grad: [[0, '#ffffff'], [0.4, '#ffd34f'], [1, '#ff7ab8']], glow: '#ff5a8a', deep: '#7a1a4a', edge: '#e0407a' }, { t: 'CITY', grad: [[0, '#ffffff'], [1, '#7fe0ff']], glow: '#3d8bff', deep: '#0a3a6a', edge: '#2d8ad0' }], logoSize: 96,
  sub: 'เมืองสีรุ้ง', subColor: '#e0407a', tag: 'ฝึกคลิก ลากวาง เรียงภาพ นับเลข จำแนกสี รูปทรง ไปกับเทคโน รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน', credit: 'ทักษะพื้นฐาน อนุบาล 3–ป.1',
  fxColors: [0xff7ab8, 0xffd34f, 0x7fe0ff, 0x9bf0a8], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
