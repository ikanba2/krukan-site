/* ===== หน้าแรกและหน้าเลือกด่านของ Packet Express (ใช้โครงกลางจาก shared/scenes.js) ===== */
const HOW_TO = {
  title: 'วิธีเล่น Packet Express',
  body: '1. แพ็กเก็ต (ซองจดหมายข้อมูล) วิ่งออกจากเครื่องส่ง ต้องส่งให้ถึงเซิร์ฟเวอร์ที่มีสีและสัญลักษณ์ตรงกัน\n2. แตะวงกลมสวิตช์ของเราเตอร์เพื่อเปลี่ยนทางออก ลูกศรบอกทางที่แพ็กเก็ตจะไป (คอมพิวเตอร์กดเลข 1-9 แทนการแตะได้)\n3. ส่งถูกติดกันจะได้คอมโบ ไรเดอร์เปลี่ยนร่าง ส่งผิดหรือสายขาดเสียหัวใจ 1 ดวง ครบ 3 ดวงแพ้\n4. ด่านหลัง ๆ มีชื่อเว็บ (DNS) ไวรัสสีดำที่ต้องส่งเข้าไฟร์วอลล์ และสายเคเบิลที่ขาดเป็นช่วง\n5. โหมดฝึกช้ากว่าและมีคำใบ้บอกว่าต้องหมุนสวิตช์ไปทางไหน กดปุ่มความเร็วเพื่อเร่งเป็น 2 เท่าได้',
  tutor: scene => scene.go('Play', { level: 1, mode: 'free', tutor: true })
};
const TitleScene = KG.makeTitle({
  bg: 'arena_ice', music: 'bounce', forms: FORMS, form: 0, riderH: 440,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.55)'], [0.5, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [
    { t: 'PACKET', grad: [[0, '#ffffff'], [1, '#cfe6ff']], glow: '#2b8cff', deep: '#1b2a6b', edge: '#2b3f9c' },
    { t: 'EXPRESS', grad: [[0, '#b8f5ff'], [1, '#27b4f0']], glow: '#00a3e0', deep: '#0b3f7a', edge: '#0b5aa8' }
  ],
  logoSize: 94,
  sub: 'ไปรษณีย์ข้อมูล ส่งให้ถึงปลายทาง', tag: 'สลับสวิตช์เราเตอร์ นำแพ็กเก็ตสีสันวิ่งไปถึงเซิร์ฟเวอร์ที่ถูกต้อง เรียนรู้อินเทอร์เน็ตแบบสนุก ๆ',
  subColor: '#0a74c8', credit: 'เครือข่ายและอินเทอร์เน็ต', fxColors: [0xffffff, 0x7fe0ff, 0xffd34f], howTo: HOW_TO,
  stars: () => ({ got: totalStars(), max: maxStars() }),
  start: scene => scene.go('Play', { level: 1, mode: 'free', tutor: true })
});

const SelectScene = KG.makeSelect({
  bg: 'arena_ice', music: 'breeze', kicker: 'PACKET EXPRESS', title: 'เลือกด่าน',
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
    const best = SAVE.data.best[L.id], mode = L.id === 1 ? 'บทสอน ช้า มีคำใบ้' : (SAVE.data.mode === 'time' ? 'ท้าทาย ความเร็วปกติ หัวใจ 3 ดวง' : 'โหมดฝึก ช้าลง มีคำใบ้ ไม่เสียหัวใจ');
    return { title: (L.id === 1 ? '' : 'ด่าน ' + L.id + ' · ') + L.title, desc: L.desc, meta: L.count + ' แพ็กเก็ต · ' + mode + (best ? '  ·  สถิติ ' + best.score + ' คะแนน' : ''), button: L.id === 1 ? 'เริ่มบทสอน' : undefined };
  },
  play: (scene, L) => scene.go('Play', { level: L.id, mode: L.id === 1 ? 'free' : SAVE.data.mode, tutor: L.id === 1 })
});
