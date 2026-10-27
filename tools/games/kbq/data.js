/* ===== ข้อมูลกลางของ เมืองสีรุ้ง: บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง (shared/kit.js) ใช้ ===== */
const { WORLDS } = window.KQ_LV;
const SAVE = KG.store('krukan_game_kbq_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

const BG_KEYS = ['bg_workshop', 'bg_city', 'bg_workshop', 'bg_sky', 'bg_city', 'bg_workshop', 'bg_sky', 'bg_city'];
KG.kit.game = {
  id: 'kbq', worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#bfe3ff', fxColors: [0x7fe0ff, 0xffd34f, 0xff7ab8, 0xffffff], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene, wi) { KG.kit.bg(scene, BG_KEYS[wi % BG_KEYS.length], { veil: [0xffffff, 0.34] }); KG.kit.clouds(scene, 4, { alpha: 0.55 }); }
};
const HOW_TO = {
  title: 'วิธีเล่น ภารกิจแป้นพิมพ์',
  body: ['1. เลือกโลกทางซ้าย แล้วเลือกด่าน แต่ละโลกฝึกแป้นพิมพ์หนึ่งอย่าง เรียงจากง่ายไปยาก ด่านสุดท้ายของโลกคือบอส',
    '2. เสียงจะอ่านโจทย์ให้ฟัง กดปุ่มลำโพงบนป้ายเพื่อฟังซ้ำได้',
    '3. กดปุ่มบนคีย์บอร์ดจริงให้ตรงกับที่โจทย์บอก ปุ่มที่ต้องกดจะมีไฟกะพริบบนแป้นพิมพ์ในจอ ถ้าไม่มีคีย์บอร์ดจะแตะปุ่มบนจอแทนก็ได้',
    '4. ทำถูกจะได้ดาวและคะแนน ทำพลาดเกมจะบอกใบ้ให้ ไม่มีแพ้ เก็บให้ครบ 3 ดาวด้วยการพลาดน้อยที่สุด',
    '5. โลกสุดท้ายเป็นภารกิจจับเวลา ทำให้ทันก่อนเวลาหมด',
    '6. ปุ่ม Esc ใช้ปิดหน้าต่างในบางด่าน ส่วนการพักเกมให้กดปุ่มหยุดที่มุมซ้ายบน · F11 เต็มจอ'].join('\n')
};
const MapScene = KG.kit.makeMap({
  bg: 'bg_workshop', color: '#3d8bff', kicker: 'KEYBOARD QUEST', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_workshop', music: 'sunny', riderX: 300, poseH: 520, poseW: 460,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.55)'], [0.55, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'KEYBOARD', grad: [[0, '#ffffff'], [0.4, '#9fe0ff'], [1, '#3d8bff']], glow: '#3d8bff', deep: '#0a2a6a', edge: '#2d6ad0' }, { t: 'QUEST', grad: [[0, '#ffffff'], [1, '#ffd34f']], glow: '#ff9a2e', deep: '#7a3a00', edge: '#d9820a' }], logoSize: 92,
  sub: 'ภารกิจแป้นพิมพ์', subColor: '#2d6ad0', tag: 'ฝึกใช้แป้นพิมพ์ ตั้งแต่ลูกศร ตัวอักษร ตัวเลข นิ้วที่ถูก ปุ่มพิเศษ คำสั้น ไปจนถึงคีย์ลัด รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน', credit: 'ทักษะคอมพิวเตอร์ อนุบาล 3–ป.2',
  fxColors: [0x7fe0ff, 0xffd34f, 0xff7ab8, 0xffffff], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
