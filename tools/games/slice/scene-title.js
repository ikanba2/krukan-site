/* ===== หน้าแรก เลือกโลก เลือกด่านของ Techno Slice (ใช้โครงกลางจาก shared/scenes.js ธีม pizza โทนอุ่นทรงมน) ===== */
const HOW_TO = {
  title: 'วิธีเล่น Techno Slice',
  body: '1. อ่านใบสั่งงานด้านขวา ทำเสร็จข้อไหน ข้อนั้นจะติ๊กถูก และเทคโนจะฟันตัวป่วนให้ 1 ครั้ง\n2. ชิ้นพิซซ่า การ์ดเศษส่วน และตัวเลขอยู่ในถาดด้านล่าง ลากไปวางที่ที่ถูกต้อง หรือแตะชิ้นก่อนแล้วแตะที่วางก็ได้\n3. ถ้าวางผิด ชิ้นจะเด้งกลับพร้อมบอกเหตุผลทางคณิตศาสตร์ ลองใหม่ได้เลย แต่ดาวจะลดลง\n4. ติดตรงไหนกดคำใบ้ได้ แต่ใช้เยอะดาวก็ลดลงนะ ตอนเริ่มโลกใหม่เทคโนจะมาแนะนำให้',
  tutor: scene => scene.go('Play', { world: 1, level: 1, tutor: true })
};

const TitleScene = KG.makeTitle({
  bg: 'arena_sun', music: 'sunny', forms: ['s0', 's2', 's3', 's1'], form: 0, riderH: 400, riderX: 300,
  shade: (ctx, w, h) => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, w, 0, [[0, 'rgba(255,243,223,.55)'], [0.55, 'rgba(255,243,223,.2)'], [1, 'rgba(255,243,223,0)']]); ctx.fillRect(0, 0, w, h); },
  logo: [
    { t: 'TECHNO', grad: [[0, '#fff1a8'], [1, '#ff8a3c']], glow: '#e8452c', deep: '#6a1a08', edge: '#b83a1a' },
    { t: 'SLICE', grad: [[0, '#ffffff'], [1, '#ffd34f']], glow: '#ffb300', deep: '#7a3a00', edge: '#d98a00' }
  ],
  logoSize: 100,
  sub: 'ช่างแบ่งพิซซ่า', tag: 'ฝึกเศษส่วนกับร้านพิซซ่าของเทคโน ตัดพิซซ่าตามออเดอร์ จับคู่เศษส่วนกับภาพ เรียงลำดับ แปลงเศษเกินเป็นจำนวนคละ และบวกลบเศษส่วน ฝึกซ้ำได้หลายด่านจนคล่อง',
  subColor: '#c9301a', tagColor: '#4a2412', credit: 'คณิตศาสตร์ ป.4 เศษส่วน', fxColors: [0xffffff, 0xffd34f, 0xffb15a], howTo: HOW_TO,
  stars: () => ({ got: totalStars(), max: maxStars() }), selectLabel: 'เลือกโลก', selectScene: 'World',
  start: scene => scene.go('World')
});

/* ---------- เลือกโลก (สี่โลก) ---------- */
const BLURB = ['ตัดพิซซ่าตามที่ลูกค้าสั่ง\nอ่านและวางเศษส่วนบนเส้นจำนวน', 'เรียงเศษส่วนจากน้อยไปมาก\nและจับคู่ค่าที่เท่ากัน', 'ใส่ชิ้นลงกล่องให้เต็ม\nแปลงเศษเกินเป็นจำนวนคละ', 'ช่วยร้านคิดเลข\nบวกลบเศษส่วนตัวส่วนเท่ากัน'];
const WORLD_PIE = [[8, 3, 0], [8, 5, 1], [4, 4, 2], [6, 5, 3]];
class WorldScene extends KG.Scene {
  constructor() { super('World'); }
  create() {
    this.setup(); KG.audio.music('breeze');
    this.add.image(GW / 2, GH / 2, 'arena_sun').setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xfff3df, 0.38);
    KG.fx.ambient(this, { freq: 260, colors: [0xffffff, 0xffd34f], s: 0.35, alpha: 0.7 });
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 });
    this.txt(100, 6, 'TECHNO SLICE', { size: 18, color: KG.SKIN.hi });
    this.txt(100, 26, 'เลือกโลกตามเรื่องที่อยากฝึก', { size: 32, stroke: true });
    this.txt(GW - 330, 24, 'ดาวสะสม ' + totalStars() + '/' + maxStars(), { size: 24, color: '#ffffff', stroke: true, ox: 1 });
    KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, HOW_TO), { w: 56, h: 52 });
    WORLDS.forEach((W, i) => this.card(W, i));
    this.txt(GW / 2, 676, 'เริ่มจากโลก 1 แล้วเล่นเรียงไป หรือเลือกโลกที่อยากฝึกเป็นพิเศษก็ได้ ฝึกสุ่มสร้างโจทย์ใหม่ไม่ซ้ำให้ทุกด่าน', { size: 20, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Title'); }
  card(W, i) {
    const col = i % 2, row = Math.floor(i / 2), w = 604, h = 262, x = 36 + col * (w + 12), y = 104 + row * (h + 22), got = worldStars(W.id), clr = Phaser.Display.Color.HexStringToColor(W.color).color, wp = WORLD_PIE[i];
    const c = this.add.container(0, 0);
    c.add(KG.ui.panel(this, x, y, w, h, { accent: W.color, accent2: W.color, cuts: [22, 0, 22, 0], fill: ['#ffffff', '#fff0da'], alpha: 0.97 }));
    const chip = this.add.image(x + 16 + 40, y + 22 + 25, KG.tex(this, 'sl-gradechip|' + W.color, 84, 52, ctx => { KG.ui.rrect(ctx, 2, 2, 80, 48, 24); ctx.fillStyle = W.color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#4a2412'; ctx.stroke(); })); c.add(chip);
    c.add(KG.txt(this, x + 16 + 42, y + 22 + 25, 'ป.4', { size: 30, color: '#ffffff', center: true, middle: true }));
    c.add(KG.txt(this, x + 120, y + 22, 'โลก ' + W.id, { size: 22, color: '#8a6a58' }));
    c.add(KG.txt(this, x + 120, y + 46, W.skill, { size: 26, color: '#4a2412', width: 330 }));
    c.add(this.add.image(x + 535, y + 78, pieTex(this, wp[0], wp[1], 100, wp[2])).setDisplaySize(110, 110));
    c.add(KG.txt(this, x + 18, y + 108, BLURB[i], { size: 22, weight: 400, color: '#6b3b25', lineSpacing: 6 }));
    const boss = KG.art.make(this, x + w - 80, y + 230, 'b' + W.boss, 0, 112); boss.setFlipX(true); c.add(boss);
    const hero = KG.art.make(this, x + w - 190, y + 236, W.hero, 'idle', 108); c.add(hero);
    this.tweens.add({ targets: [boss, hero], y: '-=4', duration: 900 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bar = KG.ui.bar(this, x + 18, y + h - 58, 200, 18, { value: got / 30, color: clr }); c.add(bar);
    c.add(KG.ui.icon(this, 'star', x + 18 + 232, y + h - 50, 26, 0xffb800));
    c.add(KG.txt(this, x + 18 + 250, y + h - 64, got + '/30', { size: 22, color: '#4a2412' }));
    c.add(KG.txt(this, x + 18, y + h - 36, got ? 'เล่นต่อ' : 'เริ่มโลกนี้', { size: 18, weight: 400, color: W.color }));
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -5, duration: 120 }); KG.audio.play('hover'); });
    zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { SAVE.data.world = W.id; SAVE.save(); KG.audio.play('confirm'); this.go('Select'); });
    c.setAlpha(0).y += 20; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 320, delay: 90 * i, ease: 'Back.easeOut' });
  }
}

/* ---------- เลือกด่านของโลกที่เลือกไว้ ---------- */
const KIND_LABEL = { cut: 'ตัดพิซซ่าตามที่ลูกค้าสั่ง', match: 'จับคู่การ์ดเศษส่วนกับภาพ', eq: 'จับคู่เศษส่วนที่ค่าเท่ากัน', line: 'วางเศษส่วนบนเส้นจำนวน', order: 'เรียงเศษส่วนจากน้อยไปมาก', pack: 'ใส่ชิ้นพิซซ่าลงกล่องให้เต็ม', conv: 'จับคู่เศษเกินกับจำนวนคละ', calc: 'บวกลบเศษส่วนแล้วลากตัวเลขตอบ' };
const SelectScene = KG.makeSelect({
  get bg() { return 'arena_' + curWorld().bg; }, music: 'breeze', back: 'World',
  get kicker() { return 'โลก ' + curWorld().id + ' · ' + curWorld().grade; }, get title() { return curWorld().title; },
  shade: (ctx, w, h) => { ctx.fillStyle = 'rgba(255,243,223,.34)'; ctx.fillRect(0, 0, w, h); },
  get levels() { return Array.from({ length: 10 }, (_, i) => ({ id: i + 1, tag: 'ด่าน ' + (i + 1), icon: i === 9 ? 'sword' : null })); }, howTo: HOW_TO,
  isOpen: id => levelOpen(curWorld().id, id), starsOf: id => levelStars(curWorld().id, id),
  stars: () => ({ got: worldStars(curWorld().id), max: 30 }),
  toolbar(scene) {
    const W = curWorld();
    scene.txt(36, 96, W.concept, { size: 20, weight: 400, color: KG.SKIN.body, width: 760 });
    const prac = new KG.ui.Button(scene, 1130, 124, 300, 52, { label: 'ฝึกสุ่มแบบด่านนี้', icon: 'reset', style: 'violet', size: 22, onClick: () => scene.go('Play', { world: W.id, level: scene.sel, seed: 1 + Math.floor(Math.random() * 1e8) }) });
    scene.practiceBtn = prac;
  },
  detail(L, nd) {
    const W = curWorld(), lv = getLevel(W.id, L.id), best = SAVE.data.stars[skey(W.id, L.id)] || 0;
    return { title: 'ด่าน ' + L.id + ' · ' + lv.title, desc: lv.desc, meta: KIND_LABEL[lv.kind] + ' · ทำประมาณ ' + lv.par + ' ครั้ง · 3 ดาวต้องพลาดไม่เกิน 1 ครั้งและไม่ใช้คำใบ้เกิน 1 ครั้ง', button: best ? 'เล่นอีกครั้ง' : 'เริ่มด่านนี้' };
  },
  play: (scene, L) => scene.go('Play', { world: curWorld().id, level: L.id, tutor: L.id === 1 && curWorld().id === 1 && !SAVE.data.tutorDone[1] })
});
