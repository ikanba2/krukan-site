/* ===== หน้าแรกและหน้าเลือกด่านของ Bug Buster (ใช้โครงกลางจาก shared/scenes.js) ===== */
const HOW_TO = {
  title: 'วิธีเล่น Bug Buster',
  body: '1. โปรแกรมไพทอนสั้น ๆ มีบั๊กซ่อนอยู่หนึ่งบรรทัด เทียบ "ผลที่ควรได้" กับ "ผลที่ได้ตอนนี้" แล้วแตะบรรทัดที่คิดว่าผิด\n2. ถ้าแตะถูก จะมีตัวเลือกวิธีแก้ 3 แบบ เลือกบรรทัดที่ถูกต้อง (คอมพิวเตอร์ใช้ลูกศรขึ้นลง Enter และเลข 1-3 ได้)\n3. แก้ถูก ไรเดอร์จะฟันมอนสเตอร์บั๊ก แก้ถูกติดกันได้คอมโบและไรเดอร์เปลี่ยนร่าง\n4. แตะผิดหรือเลือกผิดเสียหัวใจ 1 ดวง ครบ 3 ดวงแพ้ (โหมดท้าทายมีเวลาต่อข้อ) โหมดฝึกไม่จับเวลาและมีปุ่มคำใบ้\n5. ทุกข้อมีคำอธิบายว่าบั๊กเกิดจากอะไร เก็บไว้เป็นความรู้ตอนเขียนโปรแกรมจริง',
  tutor: scene => scene.go('Play', { level: 1, mode: 'free', tutor: true })
};
const TitleScene = KG.makeTitle({
  bg: 'arena_nature', music: 'sunny', forms: FORMS, form: 1, riderH: 440,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.55)'], [0.5, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [
    { t: 'BUG', grad: [[0, '#fff6a8'], [1, '#ffb300']], glow: '#ff8a2b', deep: '#7a3a00', edge: '#b25a00' },
    { t: 'BUSTER', grad: [[0, '#ffffff'], [1, '#ffd0dc']], glow: '#ff3d6a', deep: '#8a1230', edge: '#b01c45' }
  ],
  logoSize: 100,
  sub: 'จับบั๊กโค้ด ฟันมอนสเตอร์', tag: 'ค้นหาบรรทัดโค้ดไพทอนที่ผิด เลือกวิธีแก้ที่ถูก แล้วให้ไรเดอร์ฟันบั๊กให้ราบ คำอธิบายทุกข้อช่วยให้เขียนโปรแกรมเก่งขึ้น',
  subColor: '#d9302f', credit: 'วิทยาการคำนวณ', fxColors: [0xffffff, 0xffd34f, 0xff6a8a], howTo: HOW_TO,
  stars: () => ({ got: totalStars(), max: maxStars() }),
  start: scene => scene.go('Play', { level: 1, mode: 'free', tutor: true })
});

const SelectScene = KG.makeSelect({
  bg: 'arena_nature', music: 'breeze', kicker: 'BUG BUSTER', title: 'เลือกด่าน',
  shade: (ctx, w, h) => { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(0, 0, w, h); },
  levels: LEVELS, howTo: HOW_TO,
  isOpen: id => levelOpen(id), starsOf: id => levelStars(id), stars: () => ({ got: totalStars(), max: maxStars() }),
  toolbar(scene) {
    scene.txt(36, 98, 'โหมด', { size: 22, color: KG.SKIN.mute });
    scene.modeBtns = {
      time: new KG.ui.Button(scene, 290, 120, 280, 52, { label: 'ท้าทาย', icon: 'bolt', style: 'ghost', size: 24, slant: 10, onClick: () => scene.setMode('time') }),
      free: new KG.ui.Button(scene, 590, 120, 280, 52, { label: 'ฝึก มีคำใบ้', icon: 'bulb', style: 'ghost', size: 24, slant: 10, onClick: () => scene.setMode('free') })
    };
    scene.setMode = m => { SAVE.data.mode = m; SAVE.save(); KG.audio.play('tap'); scene.refreshModes(); scene.refreshDetail(); };
    scene.refreshModes = () => Object.keys(scene.modeBtns).forEach(k => { scene.modeBtns[k].setActive(k === SAVE.data.mode); scene.modeBtns[k].label.setColor(k === SAVE.data.mode ? '#d9560a' : '#1b2a6b'); });
    scene.refreshModes();
  },
  detail(L, nd) {
    const n = L.id === 1 ? 3 : L.id === 10 ? 8 : ROUNDS.filter(r => r.lv === L.id).length, best = SAVE.data.best[L.id];
    const mode = L.id === 1 ? 'บทสอน ไม่จับเวลา มีคำใบ้' : (SAVE.data.mode === 'time' ? 'ท้าทาย ข้อละ ' + BB.secsFor(L.id) + ' วินาที หัวใจ 3 ดวง' : 'โหมดฝึก ไม่จับเวลา มีคำใบ้');
    return { title: (L.id === 1 ? '' : 'ด่าน ' + L.id + ' · ') + L.title + '  (' + MONS[L.mon].name + ')', desc: L.desc, meta: n + ' ข้อ · ' + mode + (best ? '  ·  สถิติ ' + best.score + ' คะแนน' : ''), button: L.id === 1 ? 'เริ่มบทสอน' : undefined };
  },
  play: (scene, L) => scene.go('Play', { level: L.id, mode: L.id === 1 ? 'free' : SAVE.data.mode, tutor: L.id === 1 })
});
