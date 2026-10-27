/* ===== ข้อมูลกลางของ ผจญภัยเมาส์: บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง (shared/kit.js) ใช้ ===== */
const { WORLDS } = window.MS_LV;
const SAVE = KG.store('krukan_game_mouse_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

const BG_KEYS = ['bg_sky', 'bg_city', 'bg_workshop'];
KG.kit.game = {
  id: 'mouse', worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#bfe3ff', fxColors: [0xffffff, 0xffd34f, 0xff7ab8], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene, wi) { KG.kit.bg(scene, BG_KEYS[wi % 3], { veil: [0xffffff, 0.32] }); KG.kit.clouds(scene, 4, { alpha: 0.5 }); }
};
const HOW_TO = {
  title: 'วิธีเล่น ผจญภัยเมาส์',
  body: '1. เลือกโลกทางซ้าย แล้วเลือกด่าน แต่ละโลกฝึกทักษะเมาส์หนึ่งอย่าง เรียงจากง่ายไปยาก ด่านสุดท้ายของโลกคือบอส\n2. อ่านป้ายคำสั่งด้านบน หรือกดปุ่มลำโพงให้เสียงอ่านให้ฟัง รูปเมาส์บนป้ายบอกว่าต้องใช้ปุ่มไหน\n3. ทำถูกจะได้แสงและคะแนน ทำพลาดเกมจะบอกใบ้ให้ ไม่มีแพ้ เก็บให้ครบ 3 ดาวด้วยการพลาดน้อยที่สุด\n4. คลิกขวา ลากแล้ววาง และลูกกลิ้ง: บนจอสัมผัสให้กดค้างแทนคลิกขวา และใช้ปุ่มลูกศรเลื่อนแทนลูกกลิ้ง\n5. กด P พักเกม · F เต็มจอ · ลูกศรเลือกด่านในหน้าเลือกด่าน'
};
// ไอคอนโลก (ใช้ชุดไอคอนกลางใน kit.js)
const MapScene = KG.kit.makeMap({
  bg: 'bg_city', color: '#ff7a1a', kicker: 'TECHNO MOUSE ADVENTURE', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_city', music: 'sunny', riderX: 300, poseH: 520, poseW: 460,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.55)'], [0.55, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'TECHNO', grad: [[0, '#ffe9c2'], [1, '#ff9a3c']], glow: '#ff7a1a', deep: '#7a2a00', edge: '#d9620a' }, { t: 'MOUSE', grad: [[0, '#ffffff'], [1, '#ffd34f']], glow: '#2fb8ff', deep: '#0a3a6a', edge: '#1a8ad0' }], logoSize: 100,
  sub: 'ผจญภัยเมาส์', subColor: '#d9620a', tag: 'ฝึกใช้เมาส์ตั้งแต่เลื่อน คลิก ดับเบิลคลิก คลิกขวา ลากวาง ไปจนถึงลูกกลิ้ง รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน', credit: 'ทักษะคอมพิวเตอร์ อนุบาล–ป.1',
  fxColors: [0xffffff, 0xffd34f, 0xff7ab8], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
