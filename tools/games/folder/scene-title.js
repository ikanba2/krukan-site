/* ===== หน้าแรก เลือกโลก เลือกด่านของ Techno Folder (ใช้โครงกลางจาก shared/scenes.js) ===== */
const HOW_TO = {
  title: 'วิธีเล่น Techno Folder',
  body: '1. อ่านภารกิจด้านขวา ทำเสร็จข้อไหน ข้อนั้นจะติ๊กถูก และเทคโนจะฟันตัวรกให้ 1 ครั้ง\n2. หน้าต่างด้านซ้ายคือหน้าต่างโฟลเดอร์ของ Windows ดับเบิลคลิกโฟลเดอร์เพื่อเปิดเข้าไป ปุ่มลูกศรด้านบนใช้ย้อนกลับ\n3. ลากไฟล์ไปวางบนโฟลเดอร์เพื่อย้าย หรือใช้ปุ่ม ตัด คัดลอก วาง ลบ เปลี่ยนชื่อ ด้านบน จะคลิกขวาเรียกเมนูก็ได้\n4. ทำผิดไม่เป็นไร เกมจะบอกเหตุผลให้ ถ้าพลาดน้อยและใช้คำใบ้น้อยจะได้ดาวมาก\n5. ทุกอย่างเป็นการจำลอง ไม่แตะไฟล์จริงในเครื่องของเรา',
  tutor: scene => scene.go('Play', { world: SAVE.data.world || 1, level: 1, tutor: true })
};

const TitleScene = KG.makeTitle({
  bg: 'arena_sky', music: 'sunny', forms: ['s0', 's2', 's3', 's1'], form: 0, riderH: 400, riderX: 300,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.5)'], [0.55, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [
    { t: 'TECHNO', grad: [[0, '#fff6a8'], [1, '#ffb300']], glow: '#ff8a2b', deep: '#7a3a00', edge: '#b25a00' },
    { t: 'FOLDER', grad: [[0, '#ffffff'], [1, '#c9f0ff']], glow: '#2b8cff', deep: '#0e3e8f', edge: '#2b6fd0' }
  ],
  logoSize: 100,
  sub: 'จัดโฟลเดอร์กับเทคโน', tag: 'ลากไฟล์เข้าโฟลเดอร์ ตั้งชื่อ ย้าย คัดลอก ลบ และกู้คืน ในหน้าต่างโฟลเดอร์แบบ Windows ฝึกจัดระเบียบไฟล์ตั้งแต่ ป.2 ถึง ป.3 โลกละ 10 ด่านที่ฝึกซ้ำจนชำนาญ',
  subColor: '#d9560a', credit: 'วิทยาการคำนวณ ป.2–ป.3', fxColors: [0xffffff, 0xffd34f, 0x7fe0ff], howTo: HOW_TO,
  stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลก', selectScene: 'World',
  start: scene => scene.go('World')
});

/* ---------- เลือกโลก (สองโลกต่อชั้น) ---------- */
const BLURB = ['ลากไฟล์เข้าโฟลเดอร์\nที่เป็นเรื่องเดียวกัน', 'สร้างโฟลเดอร์ใหม่\nและตั้งชื่อให้หาเจอ', 'เลือกให้ถูกว่าจะย้าย\nคัดลอก ลบ หรือกู้คืน', 'เปิดเข้าไปในโฟลเดอร์\nซ้อนกันหลายชั้น'];
class WorldScene extends KG.Scene {
  constructor() { super('World'); }
  create() {
    this.setup(); KG.audio.music('breeze');
    this.add.image(GW / 2, GH / 2, 'arena_sky').setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.3);
    KG.fx.ambient(this, { freq: 260, colors: [0xffffff, 0xffd34f], s: 0.35, alpha: 0.7 });
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 });
    this.txt(100, 6, 'TECHNO FOLDER', { size: 18, color: KG.SKIN.hi });
    this.txt(100, 26, 'เลือกโลกตามเรื่องที่อยากฝึก', { size: 32, stroke: true });
    this.txt(GW - 330, 24, 'ดาวสะสม ' + totalStars() + '/' + maxStars(), { size: 24, color: '#ffffff', stroke: true, ox: 1 });
    KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, HOW_TO), { w: 56, h: 52 });
    WORLDS.forEach((W, i) => this.card(W, i));
    this.txt(GW / 2, 676, 'ป.2 เริ่มจากโลก 1 ป.3 เริ่มจากโลก 3 หรือเล่นเรียงจากโลกแรกก็ได้', { size: 20, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Title'); }
  card(W, i) {
    const col = i % 2, row = Math.floor(i / 2), w = 604, h = 262, x = 36 + col * (w + 12), y = 104 + row * (h + 22), got = worldStars(W.id);
    const c = this.add.container(0, 0);
    c.add(KG.ui.panel(this, x, y, w, h, { accent: W.color, accent2: W.color, cuts: [22, 0, 22, 0], fill: ['#ffffff', '#e9f3ff'], alpha: 0.97 }));
    const chip = this.add.rectangle(x + 16 + 54, y + 22 + 24, 108, 48, Phaser.Display.Color.HexStringToColor(W.color).color).setStrokeStyle(3, 0x1b2a6b); c.add(chip);
    c.add(KG.txt(this, x + 16 + 54, y + 22 + 24, W.grade, { size: 34, color: '#ffffff', center: true, middle: true }));
    c.add(KG.txt(this, x + 142, y + 22, 'โลก ' + W.id, { size: 22, color: '#5a6a96' }));
    c.add(KG.txt(this, x + 142, y + 46, W.skill, { size: 28, color: '#1b2a6b' }));
    c.add(KG.txt(this, x + 18, y + 104, BLURB[i], { size: 22, weight: 400, color: '#33456f', lineSpacing: 6 }));
    const boss = KG.art.make(this, x + w - 80, y + 224, 'b' + W.boss, 0, 120); boss.setFlipX(true); c.add(boss);
    const hero = KG.art.make(this, x + w - 190, y + 230, W.hero, 'idle', 112); c.add(hero);
    this.tweens.add({ targets: [boss, hero], y: '-=4', duration: 900 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bar = KG.ui.bar(this, x + 18, y + h - 58, 200, 16, { value: got / 30, color: Phaser.Display.Color.HexStringToColor(W.color).color }); c.add(bar);
    c.add(KG.ui.icon(this, 'star', x + 18 + 232, y + h - 50, 26, 0xffb800));
    c.add(KG.txt(this, x + 18 + 250, y + h - 64, got + '/30', { size: 22, color: '#1b2a6b' }));
    c.add(KG.txt(this, x + 18, y + h - 36, got ? 'เล่นต่อ' : 'เริ่มโลกนี้', { size: 18, weight: 400, color: W.color }));
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -5, duration: 120 }); KG.audio.play('hover'); });
    zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { SAVE.data.world = W.id; SAVE.save(); KG.audio.play('confirm'); this.go('Select'); });
    c.setAlpha(0).y += 20; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 320, delay: 90 * i, ease: 'Back.easeOut' });
  }
}

/* ---------- เลือกด่านของโลกที่เลือกไว้ ---------- */
const KIND_LABEL = { sort: 'ลากไฟล์เข้าโฟลเดอร์ที่มีอยู่', fix: 'ซ่อมโฟลเดอร์ที่มีไฟล์ผิดหมวด', create: 'สร้างโฟลเดอร์ ตั้งชื่อ และจัดไฟล์', rename: 'เปลี่ยนชื่อโฟลเดอร์ให้ตรงเรื่อง', dup: 'ตั้งชื่อไม่ให้ซ้ำกัน', bossName: 'ภารกิจบอส สร้าง เปลี่ยนชื่อ และจัดไฟล์', ops: 'ย้าย คัดลอก ลบ กู้คืน', nest: 'โฟลเดอร์ซ้อนกันหลายชั้น' };
const SelectScene = KG.makeSelect({
  get bg() { return 'arena_' + curWorld().bg; }, music: 'breeze', back: 'World',
  get kicker() { return 'โลก ' + curWorld().id + ' · ' + curWorld().grade; }, get title() { return curWorld().title + ' · ' + curWorld().skill; },
  shade: (ctx, w, h) => { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(0, 0, w, h); },
  get levels() { return Array.from({ length: 10 }, (_, i) => ({ id: i + 1, tag: 'ด่าน ' + (i + 1), icon: i === 9 ? 'sword' : null })); }, howTo: HOW_TO,
  isOpen: id => levelOpen(curWorld().id, id), starsOf: id => levelStars(curWorld().id, id),
  stars: () => ({ got: worldStars(curWorld().id), max: 30 }),
  toolbar(scene) {
    const W = curWorld();
    scene.txt(36, 96, W.concept, { size: 20, weight: 400, color: KG.SKIN.body, width: 760 });
    const prac = new KG.ui.Button(scene, 1130, 124, 300, 52, { label: 'ฝึกสุ่มแบบด่านนี้', icon: 'reset', style: 'violet', size: 22, slant: 10, onClick: () => scene.go('Play', { world: W.id, level: scene.sel, seed: 1 + Math.floor(Math.random() * 1e8) }) });
    scene.practiceBtn = prac;
  },
  detail(L, nd) {
    const W = curWorld(), lv = getLevel(W.id, L.id), best = SAVE.data.stars[skey(W.id, L.id)] || 0;
    return { title: 'ด่าน ' + L.id + ' · ' + lv.title, desc: lv.desc, meta: KIND_LABEL[lv.kind] + ' · ทำประมาณ ' + lv.par + ' ขั้น · 3 ดาวต้องพลาดไม่เกิน 1 ครั้งและไม่ใช้คำใบ้เกิน 1 ครั้ง', button: best ? 'เล่นอีกครั้ง' : 'เริ่มด่านนี้' };
  },
  play: (scene, L) => scene.go('Play', { world: curWorld().id, level: L.id, tutor: L.id === 1 && L.id === 1 && curWorld().id === 1 && !SAVE.data.tutorDone[1] })
});
