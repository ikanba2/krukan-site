/* ===== หน้าแรกและหน้าเลือกด่านของ Net Patrol (ใช้โครงกลางจาก shared/scenes.js) ===== */
const HOW_TO = {
  title: 'วิธีเล่น Net Patrol',
  body: '1. ข้อความ ลิงก์ และป๊อปอัปจะเข้ามาทีละใบ ให้ตัดสินว่า "ปัดทิ้ง" (อันตราย) หรือ "ผ่าน" (ปลอดภัย)\n2. ปัดการ์ดไปทางซ้ายหรือกดปุ่ม ← / A เพื่อปัดทิ้ง ปัดไปทางขวาหรือกด → / D เพื่อปล่อยผ่าน\n3. ตัดสินถูกติดกันจะได้คอมโบและตัวคูณคะแนน ไรเดอร์จะเปลี่ยนร่างทุกขั้นคอมโบ\n4. ตัดสินผิดเสียหัวใจ 1 ดวง ครบ 3 ดวงแพ้ ทุกใบจะบอกเหตุผลและสัญญาณเตือนให้เรียนรู้\n5. เลือกโหมดท้าทาย (จับเวลา) หรือโหมดฝึก (ไม่จับเวลา) ได้ที่หน้าเลือกด่าน',
  tutor: scene => scene.go('Play', { level: 1, mode: 'free', tutor: true })
};
const TitleScene = KG.makeTitle({
  bg: 'arena_sky', music: 'sunny', forms: FORMS, form: 2, riderH: 440,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.62)'], [0.5, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [
    { t: 'NET', grad: [[0, '#ffffff'], [1, '#cfe6ff']], glow: '#2b8cff', deep: '#1b2a6b', edge: '#2b3f9c' },
    { t: 'PATROL', grad: [[0, '#fff6a8'], [1, '#ffb300']], glow: '#ff8a2b', deep: '#7a3a00', edge: '#b25a00' }
  ],
  sub: 'สายตรวจเน็ต รู้ทันมิจฉาชีพ', tag: 'ตรวจข้อความ ลิงก์ และป๊อปอัปทีละใบ ปัดทิ้งของหลอก ปล่อยผ่านของจริง ตัดสินถูกติดกันไรเดอร์จะเปลี่ยนร่าง!',
  credit: 'รู้เท่าทันออนไลน์', fxColors: [0xffffff, 0xffd34f, 0xff8a2b, 0x4cc4ff], howTo: HOW_TO,
  stars: () => ({ got: totalStars(), max: maxStars() }),
  start: scene => scene.go('Play', { level: 1, mode: 'free', tutor: true })
});

const SelectScene = KG.makeSelect({
  bg: 'arena_sky', music: 'breeze', kicker: 'NET PATROL', title: 'เลือกด่าน',
  shade: (ctx, w, h) => { ctx.fillStyle = 'rgba(255,255,255,.32)'; ctx.fillRect(0, 0, w, h); },
  levels: LEVELS, howTo: HOW_TO,
  isOpen: id => levelOpen(id), starsOf: id => levelStars(id), stars: () => ({ got: totalStars(), max: maxStars() }),
  toolbar(scene) {
    scene.txt(36, 98, 'โหมด', { size: 22, color: KG.SKIN.mute });
    scene.modeBtns = {
      time: new KG.ui.Button(scene, 290, 120, 280, 52, { label: 'ท้าทาย', icon: 'bolt', style: 'ghost', size: 24, slant: 10, onClick: () => scene.setMode('time') }),
      free: new KG.ui.Button(scene, 590, 120, 280, 52, { label: 'ฝึก ไม่จับเวลา', icon: 'book', style: 'ghost', size: 24, slant: 10, onClick: () => scene.setMode('free') })
    };
    scene.setMode = m => { SAVE.data.mode = m; SAVE.save(); KG.audio.play('tap'); scene.refreshModes(); scene.refreshDetail(); };
    scene.refreshModes = () => Object.keys(scene.modeBtns).forEach(k => { scene.modeBtns[k].setActive(k === SAVE.data.mode); scene.modeBtns[k].label.setColor(k === SAVE.data.mode ? '#d9560a' : '#1b2a6b'); });
    scene.refreshModes();
  },
  detail(L, nd) {
    const n = L.id === 1 ? 3 : L.id === 10 ? 12 : NP.cardsFor(L.id).length, best = SAVE.data.best[L.id];
    const mode = L.id === 1 ? 'บทสอน ไม่จับเวลา' : (SAVE.data.mode === 'time' ? 'ท้าทาย ใบละ ' + L.sec + ' วินาที มีหัวใจ 3 ดวง' : 'โหมดฝึก ไม่จับเวลา');
    return { title: (L.id === 1 ? '' : 'ด่าน ' + L.id + ' · ') + L.title, desc: L.desc, meta: n + ' ใบ · ' + mode + (best ? '  ·  สถิติ ' + best.score + ' คะแนน' : ''), button: L.id === 1 ? 'เริ่มบทสอน' : undefined };
  },
  play: (scene, L) => scene.go('Play', { level: L.id, mode: L.id === 1 ? 'free' : SAVE.data.mode, tutor: L.id === 1 })
});
