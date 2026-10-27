/* ===== ข้อมูลกลางของ ภารกิจถอดรหัสเลขโรมัน: บันทึกดาว ด่านที่เลือกล่าสุด การตั้งค่า K.game ที่ฐานฉากเล่นกลาง · ฉากหน้าแรก/เลือกด่านมีปุ่มเข้าคลังความรู้ ===== */
const { WORLDS } = window.RM_LV;
const SAVE = KG.store('krukan_game_roman_v1', { stars: {}, sel: { w: 0, l: 0 } });
const skey = (w, l) => w + ':' + l;
const starsOf = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const totalStars = () => { let n = 0; WORLDS.forEach((W, wi) => W.levels.forEach((L, li) => { n += starsOf(wi, li); })); return n; };
const maxStars = () => WORLDS.reduce((n, W) => n + W.levels.length * 3, 0);
const nextSel = () => { for (let w = 0; w < WORLDS.length; w++) for (let l = 0; l < WORLDS[w].levels.length; l++) if (!starsOf(w, l)) return { w, l }; return { w: 0, l: 0 }; };
if (!SAVE.data.stars || !Object.keys(SAVE.data.stars).length) SAVE.data.sel = { w: 0, l: 0 };

KG.kit.game = {
  id: 'roman', stageAlpha: 0.93, worlds: WORLDS, music: 'sunny', bossMusic: 'bounce', bgColor: '#f3e8c8', fxColors: [0xffd34f, 0xffffff, 0xff7ab8, 0x7fe0ff], coachX: 92, coachY: 718, coachH: 190, coachBase: 'ready',
  starsOf, setStars(w, l, n) { SAVE.data.stars[skey(w, l)] = n; SAVE.save(); }, setSel(w, l) { SAVE.data.sel = { w, l }; SAVE.save(); },
  bgFor(scene) { KG.kit.bg(scene, 'bg_square', { veil: [0xfff6d6, 0.42], drift: false }); KG.mk.floatDigits(scene, { chars: 'IVXLCDM', n: 14, colors: ['#ffe28a', '#ffffff', '#ffc0d8', '#bfe3ff'], alpha: 0.45 }); }
};
const HOW_TO = {
  title: 'วิธีเล่น เลขโรมัน',
  body: ['1. เลือกโลกทางซ้าย แล้วเลือกด่าน เรียงจากสัญลักษณ์ I V X ไปจนถึงเลขถึง 3,999 ด่านสุดท้ายของโลกคือบอส',
    '2. ยังไม่แม่นเลขโรมัน? กดปุ่ม คลังความรู้ เพื่อดูความเป็นมา สัญลักษณ์ หลักการบวกลบ และเครื่องมือแปลงเลข',
    '3. ด่านเลือกคำตอบ: แตะปุ่มคำตอบ หรือกดเลข 1 2 3 4 บนคีย์บอร์ดตามหมายเลขที่มุมปุ่ม',
    '4. ด่านประกอบเลขโรมัน: แตะแผ่นตัวอักษร (หรือกดปุ่ม I V X L C D M บนคีย์บอร์ด) เรียงต่อกัน แล้วกดตรวจ · ลบกด Backspace',
    '5. ตอบถูกแล้วเกมจะแสดงวิธีแยก เช่น XLIV = XL + IV = 40 + 4 = 44 ลองอ่านดูทุกครั้งนะ',
    '6. ทำพลาดไม่มีแพ้ แต่จะได้ดาวน้อยลง ถ้าพลาดสองครั้งในข้อเดียวจะมีคำใบ้ · F11 เต็มจอ'].join('\n')
};
const MapBase = KG.kit.makeMap({
  bg: 'bg_square', color: '#d4a017', kicker: 'ROMAN CODE', title: 'เลือกโลกและด่าน', music: 'sunny', worlds: WORLDS, howTo: HOW_TO, veil: [0xfff6d6, 0.4],
  starsOf, total: () => ({ got: totalStars(), max: maxStars() }), selected: () => SAVE.data.sel, select: (w, l) => { SAVE.data.sel = { w, l }; SAVE.save(); },
  play: (scene, w, l) => scene.go('Play', { w, l })
});
class MapScene extends MapBase {
  create() { super.create(); new KG.ui.Button(this, 850, 36, 200, 52, { label: 'คลังความรู้', icon: 'book', style: 'sun', size: 22, slant: 8, onClick: () => this.go('Lesson', { back: 'Map' }) }).setDepth(6); }
}
const TitleBase = KG.makeTitle({
  bg: 'bg_square', music: 'sunny', riderX: 290, poseH: 540, poseW: 460, deco: sc => KG.mk.floatDigits(sc, { chars: 'IVXLCDM', n: 16, depth: 1, alpha: 0.5, colors: ['#ffe28a', '#ffffff', '#ffc0d8'] }),
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,246,214,.7)'], [0.55, 'rgba(255,246,214,.3)'], [1, 'rgba(255,246,214,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [{ t: 'ROMAN', grad: [[0, '#ffffff'], [0.4, '#ffe28a'], [1, '#d4a017']], glow: '#d4a017', deep: '#6a4a00', edge: '#b58410' }, { t: 'CODE', grad: [[0, '#ffffff'], [1, '#ff9ac6']], glow: '#e83a8e', deep: '#7a1650', edge: '#c0306e' }], logoSize: 96,
  sub: 'ภารกิจถอดรหัสเลขโรมัน', subColor: '#a8730a', tag: 'ถอดรหัสสัญลักษณ์ I V X L C D M เรียนกฎบวกลบ ประกอบเลขโรมัน อ่านนาฬิกาและจารึก ตั้งแต่ 1 ถึง 3,999 รวม ' + WORLDS.reduce((n, W) => n + W.levels.length, 0) + ' ด่าน',
  credit: 'คณิตศาสตร์ ป.4–ป.6', fxColors: [0xffd34f, 0xffffff, 0xff7ab8, 0x7fe0ff], howTo: HOW_TO, stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลกและด่าน', selectScene: 'Map',
  start: scene => { const n = nextSel(); SAVE.data.sel = n; SAVE.save(); scene.go('Play', { w: n.w, l: n.l }); }
});
class TitleScene extends TitleBase {
  create() { super.create(); new KG.ui.Button(this, 540, 52, 160, 56, { label: 'ความรู้', icon: 'book', style: 'sun', size: 22, slant: 8, onClick: () => this.go('Lesson', { back: 'Title' }) }).setDepth(6); }
}
