/* ===== หน้าแรก เลือกโลก เลือกด่านของ Techno Parts (ใช้โครงกลางจาก shared/scenes.js ธีมมน candy) ===== */
const HOW_TO = {
  title: 'วิธีเล่น Techno Parts',
  body: '1. อ่านใบสั่งงานด้านซ้าย ทำเสร็จข้อไหน ข้อนั้นจะติ๊กถูก และเทคโนจะฟันตัวป่วนให้ 1 ครั้ง\n2. ชิ้นส่วนอยู่ในถาดด้านล่าง ลากไปวางที่ที่ถูกต้องบนโต๊ะช่าง หรือแตะชิ้นส่วนก่อนแล้วแตะที่วางก็ได้\n3. ถ้าวางผิด ชิ้นส่วนจะเด้งกลับพร้อมบอกเหตุผล ลองใหม่ได้เลย แต่ดาวจะลดลง\n4. ติดตรงไหนกดคำใบ้ได้ แต่ใช้เยอะดาวก็ลดลงนะ ตอนเริ่มโลกใหม่เทคโนจะมาแนะนำให้',
  tutor: scene => scene.go('Play', { world: 1, level: 1, tutor: true })
};

const TitleScene = KG.makeTitle({
  bg: 'arena_sky', music: 'sunny', forms: ['s0', 's2', 's3', 's1'], form: 0, riderH: 400, riderX: 300,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,255,255,.5)'], [0.55, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [
    { t: 'TECHNO', grad: [[0, '#d9fff6'], [1, '#2fe3c0']], glow: '#16c7a8', deep: '#07574a', edge: '#0f8f78' },
    { t: 'PARTS', grad: [[0, '#ffffff'], [1, '#ffe27a']], glow: '#ff9a1a', deep: '#7a3a00', edge: '#d98a00' }
  ],
  logoSize: 100,
  sub: 'ช่างประกอบคอม', tag: 'รู้จักอุปกรณ์คอมพิวเตอร์ เสียบสายให้ถูกช่อง ประกอบชิ้นส่วนเข้าเครื่อง รับงานลูกค้า และซ่อมเครื่องที่มีปัญหา ฝึกซ้ำได้หลายด่านจนคล่อง',
  subColor: '#0f8f78', credit: 'วิทยาการคำนวณ ป.2–ป.4', fxColors: [0xffffff, 0xffd34f, 0x7fe0ff], howTo: HOW_TO,
  stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลก', selectScene: 'World',
  start: scene => scene.go('World')
});

/* ---------- เลือกโลก (สี่โลก) ---------- */
const BLURB = ['ลากอุปกรณ์ใส่ถังให้ถูกกลุ่ม\nรับเข้า แสดงผล เก็บข้อมูล', 'เสียบสายหลังเครื่อง\nให้ตรงกับหัวสายและสีของช่อง', 'ใส่ชิ้นส่วนเข้าตัวเครื่อง\nและเรียงขั้นตอนอย่างปลอดภัย', 'ฟังลูกค้าแล้วเลือกอุปกรณ์\nและซ่อมเครื่องที่มีปัญหา'];
class WorldScene extends KG.Scene {
  constructor() { super('World'); }
  create() {
    this.setup(); KG.audio.music('breeze');
    this.add.image(GW / 2, GH / 2, 'arena_sky').setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.3);
    KG.fx.ambient(this, { freq: 260, colors: [0xffffff, 0xffd34f], s: 0.35, alpha: 0.7 });
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 });
    this.txt(100, 6, 'TECHNO PARTS', { size: 18, color: KG.SKIN.hi });
    this.txt(100, 26, 'เลือกโลกตามเรื่องที่อยากฝึก', { size: 32, stroke: true });
    this.txt(GW - 330, 24, 'ดาวสะสม ' + totalStars() + '/' + maxStars(), { size: 24, color: '#ffffff', stroke: true, ox: 1 });
    KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, HOW_TO), { w: 56, h: 52 });
    WORLDS.forEach((W, i) => this.card(W, i));
    this.txt(GW / 2, 676, 'ป.2 เริ่มจากโลก 1 ป.3 เริ่มจากโลก 2 ป.4 เริ่มจากโลก 3 หรือเล่นเรียงจากโลกแรกก็ได้', { size: 20, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Title'); }
  card(W, i) {
    const col = i % 2, row = Math.floor(i / 2), w = 604, h = 262, x = 36 + col * (w + 12), y = 104 + row * (h + 22), got = worldStars(W.id), clr = Phaser.Display.Color.HexStringToColor(W.color).color;
    const c = this.add.container(0, 0);
    c.add(KG.ui.panel(this, x, y, w, h, { accent: W.color, accent2: W.color, cuts: [22, 0, 22, 0], fill: ['#ffffff', '#e9f3ff'], alpha: 0.97 }));
    const chip = this.add.image(x + 16 + 56, y + 22 + 25, KG.tex(this, 'pt-gradechip|' + W.color, 120, 52, ctx => { KG.ui.rrect(ctx, 2, 2, 116, 48, 24); ctx.fillStyle = W.color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1b2a6b'; ctx.stroke(); })); c.add(chip);
    c.add(KG.txt(this, x + 16 + 58, y + 22 + 25, W.grade, { size: W.grade.length > 4 ? 26 : 32, color: '#ffffff', center: true, middle: true }));
    c.add(KG.txt(this, x + 152, y + 22, 'โลก ' + W.id, { size: 22, color: '#5a6a96' }));
    c.add(KG.txt(this, x + 152, y + 46, W.skill, { size: 26, color: '#1b2a6b', width: 300 }));
    const ic = ['keyboard', 'plug-usb', 'cpu', 'face-0'][i], ico = this.add.image(x + 540, y + 62, PTI.tex(this, ic, 96)).setDisplaySize(84, 84); c.add(ico);
    c.add(KG.txt(this, x + 18, y + 108, BLURB[i], { size: 22, weight: 400, color: '#33456f', lineSpacing: 6 }));
    const boss = KG.art.make(this, x + w - 80, y + 230, 'b' + W.boss, 0, 112); boss.setFlipX(true); c.add(boss);
    const hero = KG.art.make(this, x + w - 190, y + 236, W.hero, 'idle', 108); c.add(hero);
    this.tweens.add({ targets: [boss, hero], y: '-=4', duration: 900 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bar = KG.ui.bar(this, x + 18, y + h - 58, 200, 18, { value: got / 30, color: clr }); c.add(bar);
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
const KIND_LABEL = { sort: 'ลากอุปกรณ์ใส่ถังให้ถูกกลุ่ม', plug: 'เสียบสายเข้าช่องหลังเครื่อง', fix: 'ซ่อมสายที่หลุดหรือเสียบผิดช่อง', build: 'ประกอบชิ้นส่วนเข้าตัวเครื่อง', order: 'เรียงขั้นตอนให้ถูกลำดับ', job: 'เลือกอุปกรณ์ให้ตรงกับงานของลูกค้า' };
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
    return { title: 'ด่าน ' + L.id + ' · ' + lv.title, desc: lv.kind === 'job' ? lv.job.who + ' ขอให้ช่วยเลือกอุปกรณ์ให้ตรงกับงาน อ่านที่ลูกค้าพูดดี ๆ ก่อนเลือกนะ' : lv.desc, meta: KIND_LABEL[lv.kind] + ' · ทำประมาณ ' + lv.par + ' ครั้ง · 3 ดาวต้องพลาดไม่เกิน 1 ครั้งและไม่ใช้คำใบ้เกิน 1 ครั้ง', button: best ? 'เล่นอีกครั้ง' : 'เริ่มด่านนี้' };
  },
  play: (scene, L) => scene.go('Play', { world: curWorld().id, level: L.id, tutor: L.id === 1 && curWorld().id === 1 && !SAVE.data.tutorDone[1] })
});
