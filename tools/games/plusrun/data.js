/* ===== ข้อมูลกลางของ สมบัติพลังบวก (นักล่าพลังบวก): บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง ===== */
const { WORLDS } = window.PR_LV;
const SAVE = KG.store('krukan_game_plusrun_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

KG.kit.game = {
  id: 'plusrun', worlds: WORLDS, music: 'bounce', bossMusic: 'bounce', bgColor: '#7fd8ff', fxColors: [0xffd34f, 0xffffff, 0x7fe0ff, 0xff7ab8], coachX: 96, coachY: 430, coachH: 160, coachBase: 'jetpack',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor() { }   // ฉากเล่นสร้างพื้นหลังเลื่อนเอง (RunEng.worldBg)
};
const HOW_TO = {
  title: 'วิธีเล่น สมบัติพลังบวก',
  body: ['1. เลือกโลกทางซ้าย แล้วเลือกด่าน ด่านสุดท้ายของโลกคือบอส โลกแรกบวกง่าย ๆ โลกท้าย ๆ มีทั้งลบ ทด ยืม และเลขสามหลัก',
    '2. วิ่งไปทางขวา: ลูกศรซ้าย/ขวา (หรือ A D) เดิน · Space หรือลูกศรขึ้น กระโดด (กดค้างจะกระโดดสูงขึ้น) · บนมือถือใช้ปุ่มบนจอ',
    '3. ระวังหลุม หนามแหลม และเจ้าตัวเมือก: กระโดดเหยียบหัวเจ้าตัวเมือกเพื่อกำจัด ชนเข้าจะเสียหัวใจ',
    '4. ถึงประตูพลัง: อ่านโจทย์ที่การ์ดด้านบน แล้วกระโดดไปเก็บลูกพลังที่เป็นคำตอบ (บางลูกอยู่บนแท่นลอย) เก็บผิดจะเสียหัวใจและลูกพลังแตก',
    '5. เก็บถูกแล้วประตูจะเปิด วิ่งต่อไปประตูถัดไป ผ่านครบทุกประตูแล้วเปิดหีบสมบัติที่ปลายทาง',
    '6. หัวใจหมดต้องเริ่มใหม่ ผ่านโดยเสียหัวใจน้อยจะได้ดาวมาก · F11 เต็มจอ'].join('\n')
};
const MapScene = KG.kit.makeMap({
  bg: 'bg_islands', color: '#3fbf6a', kicker: 'PLUS POWER HUNTER', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO, veil: [0xffffff, 0.12], clouds: false,
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
const TitleScene = KG.makeTitle({
  bg: 'bg_islands', music: 'bounce', deco: sc => KG.mk.floatDigits(sc, { chars: '+', n: 14, depth: 1, alpha: 0.5, size: [60, 110], colors: ['#ffe28a', '#ffffff', '#ffc0d8'] }), riderX: 300, poseH: 520, poseW: 440,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.5)'], [0.55, 'rgba(255,255,255,.3)'], [1, 'rgba(255,255,255,.1)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'PLUS POWER', grad: [[0, '#ffffff'], [0.4, '#ffe28a'], [1, '#ff9a2e']], glow: '#ff9a2e', deep: '#7a3a00', edge: '#d9820a' }, { t: 'HUNTER', grad: [[0, '#ffffff'], [1, '#9bf0a8']], glow: '#3fbf6a', deep: '#0e4a24', edge: '#22a050' }], logoSize: 84,
  sub: 'สมบัติพลังบวก', subColor: '#22a050', tag: 'วิ่ง กระโดด เหยียบเจ้าตัวเมือก หลบหนาม ข้ามหลุม เก็บพลังบวกที่เป็นคำตอบ แล้วเปิดหีบสมบัติ รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน',
  credit: 'คณิตศาสตร์ ป.1–ป.3', fxColors: [0xffd34f, 0xffffff, 0x7fe0ff, 0xff7ab8], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
