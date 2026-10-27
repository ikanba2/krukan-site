/* ===== Techno Aksorn: โหลด · หน้าแรก · เลือกระดับ · แผนที่เมือง · โซน · ศูนย์กลางของบทเรียน ===== */
const HOW_TO = {
  title: 'วิธีเล่น ตะลุยเมืองอักษร',
  body: '1. เข้าเมืองต่าง ๆ บนแผนที่ตามที่อยากเรียน เปิดทุกบทให้เลย ตั้งแต่พยัญชนะ สระ วรรณยุกต์ มาตราตัวสะกด สะกดคำ ไปจนถึงเรียงประโยค\n2. แต่ละบทเริ่มที่ ‘เรียนรู้’ ฟังเสียง ดูภาพ แล้วลอง ‘เขียนตามรอย’ ก่อนเล่นเกมต่อ\n3. เล่นเกมเก็บดาวให้ครบ 3 ดวง ได้เหรียญเอาไปซื้อหมวก เสื้อ และสัตว์เลี้ยงที่ร้านค้า\n4. เขียนตามรอยครบแต่ละตัวได้สติกเกอร์ใส่สมุด ดาวเหรียญและความคืบหน้าบันทึกไว้ในเครื่องนี้ เล่นต่อได้ทุกครั้ง'
};

/* ---------- ไอคอนกิจกรรม (วาดเวกเตอร์ 100x100) ---------- */
const ACT_ICON = {
  learn(c) {
    rr2(c, 10, 32, 80, 54, 9, '#8a5cf0', 3.5); poly(c, [[15, 37], [48, 43], [48, 83], [15, 77]], '#ffffff', 3); poly(c, [[85, 37], [52, 43], [52, 83], [85, 77]], '#ffffff', 3);
    [[22, 49, 41, 53], [22, 59, 41, 63], [22, 69, 41, 73]].forEach(l => line(c, l[0], l[1], l[2], l[3], 3, '#b9b0e8')); [[59, 53, 78, 49], [59, 63, 78, 59], [59, 73, 78, 69]].forEach(l => line(c, l[0], l[1], l[2], l[3], 3, '#b9b0e8'));
    cir(c, 50, 17, 12, '#ffd34f', 3.5); rr2(c, 44, 27, 12, 8, 3, '#b9b0e8', 3);
  },
  trace(c) {
    c.lineCap = 'round'; c.beginPath(); c.moveTo(10, 78); c.bezierCurveTo(20, 30, 38, 100, 56, 54); c.lineWidth = 9; c.strokeStyle = INK; c.setLineDash([1, 15]); c.stroke(); c.setLineDash([]);
    c.save(); c.translate(68, 34); c.rotate(0.72); rr2(c, -9, -32, 18, 46, 3, '#ffd34f', 3.5); poly(c, [[-9, 14], [9, 14], [0, 32]], '#f6d6a8', 3); poly(c, [[-3.5, 26], [3.5, 26], [0, 32]], INK, 1); rr2(c, -9, -42, 18, 11, 3, '#ff7aa8', 3.5); c.restore();
  },
  listen(c) {
    poly(c, [[12, 38], [30, 38], [52, 18], [52, 82], [30, 62], [12, 62]], '#4aa8ff', 3.5); c.lineCap = 'round'; [[60, 22], [74, 30], [86, 38]].forEach((a, i) => { c.beginPath(); c.arc(52, 50, 16 + i * 14, -0.9, 0.9); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3; c.strokeStyle = ['#ff5aa6', '#ffa21e', '#3fb54a'][i]; c.stroke(); });
  },
  match(c) {
    [[8, 14, '#ffe0ee'], [8, 56, '#dcebff']].forEach(a => rr2(c, a[0], a[1], 28, 30, 7, a[2], 3.5)); [[64, 14, '#d6f8ef'], [64, 56, '#fff0d2']].forEach(a => rr2(c, a[0], a[1], 28, 30, 7, a[2], 3.5));
    c.lineCap = 'round'; [[36, 29, 64, 71, '#ff5aa6'], [36, 71, 64, 29, '#3fb54a']].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.bezierCurveTo(50, l[1], 50, l[3], l[2], l[3]); c.lineWidth = 9; c.strokeStyle = INK; c.stroke(); c.lineWidth = 5; c.strokeStyle = l[4]; c.stroke(); });
    [[36, 29], [36, 71], [64, 29], [64, 71]].forEach(p => cir(c, p[0], p[1], 5.5, '#ffffff', 3));
  },
  balloon(c) {
    c.beginPath(); c.moveTo(50, 70); c.quadraticCurveTo(42, 84, 52, 94); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.moveTo(50, 8); c.bezierCurveTo(14, 8, 14, 56, 50, 72); c.bezierCurveTo(86, 56, 86, 8, 50, 8); c.closePath(); fillStroke(c, lgv(c, 8, 72, '#ff8ab0', '#e83a6e'), 3.5);
    poly(c, [[44, 71], [56, 71], [50, 79]], '#e83a6e', 3); ell(c, 34, 30, 5, 10, 'rgba(255,255,255,.6)', 0, 0.5);
  },
  fish(c) {
    poly(c, [[66, 50], [92, 26], [90, 74]], '#ff9a1e', 3.5); c.beginPath(); c.ellipse(42, 50, 36, 26, 0, 0, 7); fillStroke(c, lgv(c, 24, 76, '#7ad8ff', '#2a9fe8'), 3.5); poly(c, [[32, 26], [44, 14], [54, 28]], '#2a9fe8', 3);
    cir(c, 22, 44, 5.5, '#ffffff', 3); cir(c, 21, 44, 2.4, INK, 0); c.beginPath(); c.arc(12, 56, 5, 0.2, 2.8); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
  },
  memory(c) {
    rr2(c, 8, 20, 44, 58, 9, '#17c4a8', 3.5); c.font = "700 40px Mali, Kanit"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 6; c.strokeStyle = INK; c.strokeText('ก', 30, 51); c.fillStyle = '#fff'; c.fillText('ก', 30, 51);
    c.save(); c.translate(70, 54); c.rotate(0.14); rr2(c, -24, -30, 48, 60, 9, '#ffffff', 3.5); const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 14; p.push([Math.cos(a) * r, Math.sin(a) * r + 2]); } poly(c, p, '#ffd34f', 2.6); c.restore();
  },
  sort(c) {
    const cols = ['#ff6fae', '#4aa8ff', '#ffb02e'];
    cols.forEach((col, i) => { const x = 8 + i * 30; poly(c, [[x, 46], [x + 26, 46], [x + 22, 88], [x + 4, 88]], col, 3.5); rr2(c, x - 2, 42, 30, 8, 4, shade(col, 0.85), 3); cir(c, x + 13, 24 + (i % 2) * 6, 8, ['#ffd34f', '#58c864', '#ff5aa6'][i], 3); });
  },
  change(c) {
    [['กะ', 3, '#ffe0ee'], ['กัน', 56, '#d6f8ef']].forEach(t => { rr2(c, t[1], 28, 38, 46, 9, t[2], 3.5); c.font = '700 22px Mali, Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = INK; c.fillText(t[0], t[1] + 19, 52); });
    poly(c, [[44, 40], [54, 52], [44, 64]], '#e8452c', 3); line(c, 26, 78, 74, 78, 5, '#e8452c');
  },
  tone(c) {
    poly(c, [[4, 90], [36, 36], [52, 60], [66, 44], [96, 90]], '#17c4a8', 3.5); poly(c, [[36, 36], [28, 50], [44, 50]], '#ffffff', 2.6);
    c.lineCap = 'round'; c.beginPath(); c.moveTo(12, 30); c.bezierCurveTo(24, 6, 34, 40, 50, 20); c.bezierCurveTo(58, 10, 68, 12, 74, 26); c.lineWidth = 9; c.strokeStyle = INK; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#ff5aa6'; c.stroke();
  },
  final(c) {
    rr2(c, 2, 70, 96, 12, 5, '#ffb02e', 3.5); [14, 38, 62, 86].forEach(x => line(c, x, 70, x, 44, 4, INK)); c.lineCap = 'round'; c.beginPath(); c.moveTo(8, 70); c.quadraticCurveTo(50, 8, 92, 70); c.lineWidth = 12; c.strokeStyle = INK; c.stroke(); c.lineWidth = 7; c.strokeStyle = '#c45ad0'; c.stroke(); rr2(c, 16, 84, 68, 10, 4, '#58c0ff', 3);
  },
  spell(c) {
    [['ก', 3, '#ffe0ee'], ['อ', 36, '#dcebff'], ['า', 69, '#d6f8ef']].forEach(t => { rr2(c, t[1], 22, 28, 38, 8, t[2], 3.5); c.font = '700 26px Mali, Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = INK; c.fillText(t[0], t[1] + 14, 43); });
    c.lineCap = 'round'; c.beginPath(); c.moveTo(14, 70); c.quadraticCurveTo(50, 96, 86, 70); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.lineWidth = 4; c.strokeStyle = '#ff8a1e'; c.stroke(); poly(c, [[86, 62], [92, 76], [78, 74]], '#ff8a1e', 2.4);
  },
  sent(c) {
    rr2(c, 6, 10, 88, 48, 12, '#ffffff', 3.5); poly(c, [[24, 56], [20, 72], [40, 58]], '#ffffff', 3);
    [[14, 24, 22, '#3d8bff'], [40, 24, 22, '#e0262e'], [66, 24, 22, '#3fb54a']].forEach(b => rr2(c, b[0], b[1], b[2], 22, 6, b[3], 3));
    [[12, 76, 24, '#ffe0ee'], [38, 76, 24, '#dcebff'], [64, 76, 24, '#d6f8ef']].forEach(b => rr2(c, b[0], b[1], b[2], 18, 5, b[3], 3));
  },
  compose(c) {
    [['ก', 4, '#ffe0ee'], ['า', 36, '#dcebff'], ['กา', 68, '#d6f8ef']].forEach(t => { rr2(c, t[1], 30, 28, 40, 8, t[2], 3.5); c.font = "700 " + (t[0].length > 1 ? 18 : 26) + "px Mali, Kanit"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = INK; c.fillText(t[0], t[1] + 14, 52); });
    line(c, 33, 50, 36, 50, 3, INK); line(c, 64, 50, 68, 50, 3, INK);
  }
};
const actIcon = (scene, id, x, y, s) => scene.add.image(x, y, KG.tex(scene, 'ak|act|' + id, 120, 120, c => { c.scale(1.2, 1.2); c.lineJoin = 'round'; c.lineCap = 'round'; ACT_ICON[id](c); })).setDisplaySize(s, s);
const levelStarsAll = () => totalStars();
const tracedCount = () => Object.keys(SAVE.data.traced).length;
const WRITE_TOTAL = WRITE_SETS.reduce((n, s) => n + s.items.length, 0);

/* ---------- ฉากโหลด ---------- */
class AksornBoot extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const c = this.cameras.main; c.setZoom(KG.K); c.centerOn(GW / 2, GH / 2);
    KG.audio.init(this.game); KG.audio.setSfx(KG.prefs.data.sfx); KG.audio.musOn = KG.prefs.data.music; KG.fx.init(this);
    this.t0 = Date.now(); this.shown = 0; this.idx = 0; this.go_ = false; this.imgDone = false; this.fontDone = false; this.msg = 'กำลังเตรียมตัวละคร';
    const T = this.tasks = [];
    T.push({ m: 'กำลังเตรียมตัวละคร', f: () => { KG.loadImages(this, KG.IMG).then(() => { this.imgDone = true; }); }, wait: () => this.imgDone });
    T.push({ m: 'กำลังเตรียมตัวอักษร', f: () => { Promise.all([document.fonts.load('400 40px Mali'), document.fonts.load('bold 40px Sarabun'), document.fonts.load('600 24px Kanit')]).then(() => { this.fontDone = true; }, () => { this.fontDone = true; }); setTimeout(() => { this.fontDone = true; }, 2500); }, wait: () => this.fontDone });
    ['meadow', 'sunset', 'dusk'].forEach(b => T.push({ m: 'กำลังวาดท้องฟ้าและทุ่งหญ้า', f: () => bgTex(this, b) }));
    const pre = []; CONS.forEach(r => pre.push(() => pic(this, r[4], 0, 0, 150).destroy())); VOWELS.forEach(r => { if (r[7]) pre.push(() => pic(this, r[7], 0, 0, 150).destroy()); });
    Object.keys(ACT_ICON).forEach(a => pre.push(() => actIcon(this, a, 0, 0, 100).destroy()));
    for (let i = 0; i < pre.length; i += 6) { const chunk = pre.slice(i, i + 6); T.push({ m: i < pre.length / 2 ? 'กำลังวาดภาพประจำพยัญชนะ' : 'กำลังวาดภาพประกอบ', f: () => chunk.forEach(g => g()) }); }
    T.push({ m: 'พร้อมเล่นแล้ว!', f: () => { } });
    this.report(0);
  }
  report(p) { try { if (window.__tkLoad) window.__tkLoad(p, this.msg); } catch (e) { /* ไม่เป็นไร */ } }
  update() {
    if (!this.tasks || this.go_) return; const T = this.tasks;
    if (this.idx < T.length) { const t = T[this.idx]; if (!t.started) { t.started = true; this.msg = t.m; t.f(); } if (!t.wait || t.wait()) this.idx++; }
    const actual = this.idx / T.length; this.shown = Math.min(actual, this.shown + 0.05); this.report(this.shown);
    if (this.idx >= T.length && this.shown >= 0.999 && Date.now() - this.t0 > 1700) { this.go_ = true; this.report(1); this.scene.start('Title'); }
  }
}

/* ---------- หัวฉากมาตรฐานของเมนู ---------- */
function menuBg(scene, theme) { scene.add.image(GW / 2, GH / 2, bgTex(scene, theme || 'meadow')).setDisplaySize(GW, GH); scene.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.2); }
function menuHeader(scene, o) {
  iconButton(scene, 56, 40, o.homeIcon || 'home', o.onHome, { w: 60, h: 52 });
  scene.txt(100, 6, o.top || 'ตะลุยเมืองอักษร', { size: 18, color: KG.SKIN.hi, stroke: true, sw: 4 }); scene.txt(100, 26, o.title, { size: 32, stroke: true });
  addSystemButtons(scene, GW - 266, 40, 70, ['sfx', 'music']); iconButton(scene, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 }); iconButton(scene, GW - 56, 40, 'help', () => KG.howTo(scene, o.how || HOW_TO), { w: 56, h: 52 });
  if (o.coins !== false) {
    const cc = scene.add.container(GW - 400, 40); cc.add(addCard(scene, 0, 0, 150, 46, { r: 23, lw: 3, shadow: 3, fill: ['#fff9e0', '#ffe9a0'] })); cc.add(KG.ui.icon(scene, 'gem', -50, 0, 28, 0xffb800)); scene.coinTxt = KG.txt(scene, 50, 0, String(SAVE.data.coins || 0), { size: 24, color: TKC.ink, center: true, middle: true }); scene.coinTxt.setX(10).setOrigin(0, 0.5); cc.add(scene.coinTxt);
  }
}

/* ---------- หน้าแรก ---------- */
const TITLE_CARDS = [['ก', 0], ['ข', 1], ['ค', 2], ['ง', 3]];
class TitleScene extends KG.Scene {
  constructor() { super('Title'); }
  create() {
    this.setup(); KG.audio.music('sunny'); this.add.image(GW / 2, GH / 2, bgTex(this, 'meadow')).setDisplaySize(GW * 1.04, GH * 1.04);
    KG.fx.ambient(this, { freq: 260, colors: [0xffffff, 0xffd34f, 0xff9ac6], s: 0.4, alpha: 0.8 });
    const rx = 190, ry = 690;
    if (!KG.titlePose(this, rx + 6, ry + 6, { h: 470, w: 350, depth: 3, onTap: () => SPEECH.say('สวัสดี มาเรียนอักษรกัน') })) {   // ไรเดอร์ท่าประจำเกม (ไม่ถือดาบ) ถ้าไม่มีภาพใช้แบบเดิม
      const rider = this.rider = new KG.Rider(this, rx, ry, { forms: ['s0', 's2', 's3', 's1'], form: 0, bodyH: 400 });
      rider.img.setAlpha(0).x = rx - 200; this.tweens.add({ targets: rider.img, x: rx, alpha: 1, duration: 800, ease: 'Cubic.easeOut', delay: 150, onComplete: () => rider.setPos(rx, ry) });
      this.add.zone(rx, ry - 190, 300, 380).setInteractive({ useHandCursor: true }).on('pointerdown', () => { if (rider.busy) return; KG.fx.burst(this, rx, ry - 200, { colors: [rider.form.color, 0xffffff, 0xffd34f], n: 26, max: 380, depth: 40 }); rider.attack(() => { rider.nextForm(true); SPEECH.say('สวัสดี มาเรียนอักษรกัน'); }, 70); });
    }
    const logo = KG.ui.logo(this, 400, 6, [
      { t: 'ตะลุยเมือง', grad: [[0, '#fff6a0'], [1, '#ff8ac0']], glow: '#ff5aa6', deep: '#4a1f7a', edge: '#b04a9a' },
      { t: 'อักษร', grad: [[0, '#ffffff'], [1, '#7fe8ff']], glow: '#3d8bff', deep: '#1f2a7a', edge: '#2a5aca' }], { size: 92, w: 700 });
    logo.setAlpha(0).y -= 90; this.tweens.add({ targets: logo, y: logo.y + 90, alpha: 1, duration: 650, ease: 'Bounce.easeOut', delay: 350, onComplete: () => { KG.fx.flash(this, 0xffffff, 110); KG.audio.play('go'); KG.fx.shake(this, 140, 0.003); } });
    const sub = this.txt(412, 252, 'TECHNO AKSORN · เกมภาษาไทย อนุบาล – ป.3', { size: 28, color: '#e83a8e', stroke: true, shadow: 0 });
    const tag = this.txt(412, 296, 'เรียนพยัญชนะ สระ วรรณยุกต์ มาตราตัวสะกด สะกดคำ เรียงประโยค เขียนตามรอย เล่นมินิเกม เก็บดาวและเหรียญ ซื้อหมวกกับสัตว์เลี้ยงแต่งตัวละคร ความคืบหน้าบันทึกไว้ในเครื่อง', { size: 20, weight: 400, color: TKC.ink, width: 620 });
    [sub, tag].forEach((t, i) => { t.setAlpha(0).x += 40; this.tweens.add({ targets: t, x: t.x - 40, alpha: 1, duration: 500, delay: 800 + i * 120, ease: 'Cubic.easeOut' }); });
    TITLE_CARDS.forEach((k, i) => {
      const inf = AK.info(k[0]), x = 452 + i * 128, y = 520, c = this.add.container(x, y);
      c.add(addCard(this, 0, 0, 116, 186, { r: 26, lw: 4, shadow: 7, fill: ['#ffffff', '#fff6dc'] })); c.add(pic(this, inf.pic, 0, -34, 92, 92)); c.add(glyph(this, 0, 52, inf.text, 58, '#e83a8e'));
      this.tweens.add({ targets: c, y: y - 8, duration: 1000 + i * 150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      c.setAlpha(0).y += 40; this.tweens.add({ targets: c, alpha: 1, duration: 420, delay: 1000 + i * 130 });
      c.setSize(116, 186).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { KG.audio.play('pop'); SPEECH.say(inf.say); this.tweens.add({ targets: c, scaleX: 1.1, scaleY: 1.1, duration: 140, yoyo: true }); });
    });
    const prog = totalStars() > 0 || tracedCount() > 0 || Object.keys(SAVE.data.learned).length > 0 || SAVE.data.plays > 0;
    const play = new KG.ui.Button(this, 1072, 446, 340, 88, { label: prog ? 'เล่นต่อ' : 'เริ่มเล่น', icon: 'play', style: 'primary', size: 36, onClick: () => this.go('Map') });
    const sel = new KG.ui.Button(this, 1072, 538, 340, 52, { label: 'ล้างข้อมูลเกม', icon: 'trash', style: 'ghost', size: 22, onClick: () => confirmResetAll(this) });
    const how = new KG.ui.Button(this, 1072, 608, 340, 52, { label: 'วิธีเล่น', icon: 'help', style: 'ghost', size: 24, onClick: () => KG.howTo(this, HOW_TO) });
    if (prog) { const t = this.txt(1072, 366, 'เหรียญ ' + (SAVE.data.coins || 0), { size: 20, color: '#ffffff', center: true, ox: 0.5, stroke: true, sw: 4 }); fitText(t, 330); t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, delay: 1300, duration: 400 }); }
    [play, sel, how].forEach((b, i) => { b.setAlpha(0).x += 360; this.tweens.add({ targets: b, x: b.x - 360, alpha: 1, duration: 520, delay: 1000 + i * 110, ease: 'Back.easeOut' }); });
    this.time.delayedCall(1700, () => play.pulse());
    this.time.delayedCall(1800, () => { if (!SPEECH.exists) { const n = this.txt(800, 654, 'เครื่องนี้ยังไม่มีเสียงอ่านภาษาไทย ลองเปิดด้วย Microsoft Edge หรือ Chrome เกมเล่นได้ปกติแต่จะไม่มีเสียงอ่าน', { size: 17, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true, sw: 4, width: 760 }); n.setAlpha(0); this.tweens.add({ targets: n, alpha: 1, duration: 400 }); } });
    const sys = addSystemButtons(this, 1060, 52); sys.forEach((b, i) => { b.setAlpha(0); this.tweens.add({ targets: b, alpha: b.alpha || 1, duration: 400, delay: 1300 + i * 80 }); });
    this.time.delayedCall(1500, () => promptFullscreen(this, () => askPlayerOnce(this)));
    addPlayerChip(this, 246, 44).setDepth(5);
    const st = this.txt(36, 676, 'ดาวสะสม ' + totalStars() + '  ·  บันทึกในเครื่องนี้อัตโนมัติ', { size: 22, color: '#ffffff', stroke: true }); st.setAlpha(0); this.tweens.add({ targets: st, alpha: 1, delay: 1500, duration: 400 });
    this.txt(GW - 36, 686, 'KruKan.in.th · ภาษาไทย อนุบาล – ป.3', { size: 18, weight: 400, color: '#ffffff', ox: 1, stroke: true });
  }
}

/* ---------- ล้างข้อมูลทั้งหมด (ปุ่มที่หน้าแรก) ---------- */
function confirmResetAll(scene) {
  KG.ui.modal(scene, { title: 'ล้างข้อมูลทั้งหมด?', w: 700, accent: 0xee4a4a, body: 'ดาว เหรียญ ของที่ซื้อ สติกเกอร์ และความคืบหน้าที่บันทึกไว้ในเครื่องนี้จะหายไป เริ่มนับใหม่ทั้งหมด ย้อนกลับไม่ได้',
      buttons: [{ label: 'ยกเลิก', style: 'ghost', icon: 'close' }, { label: 'ล้างเลย', style: 'danger', icon: 'trash', onClick: () => { const d = SAVE.data; d.level = 1; d.stars = {}; d.coins = 0; d.owned = { hat: ['none'], color: ['#3d8bff'], pet: ['none'] }; d.wear = { hat: 'none', color: '#3d8bff', pet: 'none', hair: 'spiky', skin: 1 }; d.stickers = {}; d.traced = {}; d.learned = {}; d.chest = ''; d.plays = 0; SAVE.save(); scene.time.delayedCall(260, () => scene.scene.restart()); } }] });
}

/* ---------- แผนที่เมือง ---------- */
class MapScene extends KG.Scene {
  constructor() { super('Map'); }
  create() {
    this.setup(); const lv = SAVE.data.level; KG.audio.music('breeze'); menuBg(this, ['meadow', 'meadow', 'sunset', 'dusk'][lv]);
    menuHeader(this, { title: 'แผนที่เมืองอักษร', onHome: () => this.go('Title') });
    ZONES.filter(z => z.open).forEach((z, i) => this.bigCard(z, i));
    ZONES.filter(z => !z.open).forEach((z, i) => this.soonCard(z, i));
    this.bottomBar();
  }
  onEscape() { this.go('Title'); }
  // 7 โซน: แถวบน 4 ใบ แถวล่าง 3 ใบ (การ์ดกะทัดรัด) ใบเปิดแล้วเข้าได้ ใบที่ปิดอยู่ (ถ้ามี) แสดงเป็น เร็ว ๆ นี้
  bigCard(z, i) {
    const N = ZONES.filter(q => q.open).length, per = 4, w = 296, h = 206, r = Math.floor(i / per), cc = i % per, cnt = r === 0 ? Math.min(per, N) : N - per, x = GW / 2 + (cc - (cnt - 1) / 2) * (w + 14), y = 98 + h / 2 + r * (h + 12);
    const col = Phaser.Display.Color.HexStringToColor(z.color).color, write = z.id === 'write', c = this.add.container(0, 0), got = write ? tracedCount() : zoneStars(z.id), max = write ? WRITE_TOTAL : zoneMax(z.id);
    c.add(addCard(this, x, y, w, h, { r: 26, band: { h: 50, color: z.color }, fill: ['#ffffff', '#f6f0ff'], shadow: 9 }));
    c.add(fitText(KG.txt(this, x - w / 2 + 18, y - h / 2 + 26, z.th, { size: 26, color: '#ffffff', oy: 0.5, stroke: TKC.ink, sw: 5 }), w - 34));
    const icon = { cons: () => glyph(this, x - 94, y - 6, 'ก', 90, z.color), vow: () => glyph(this, x - 94, y - 6, 'เ–', 90, z.color), write: () => actIcon(this, 'trace', x - 94, y - 4, 96), tone: () => glyph(this, x - 94, y - 6, '–้', 90, z.color), final: () => actIcon(this, 'final', x - 94, y - 4, 96), spell: () => actIcon(this, 'spell', x - 94, y - 4, 96), sent: () => actIcon(this, 'sent', x - 94, y - 4, 96) }[z.id];
    if (icon) c.add(icon());
    c.add(KG.txt(this, x + 46, y - 22, z.sub, { size: 19, color: TKC.ink, center: true, ox: 0.5, middle: true, width: 150 }));
    const bar = KG.ui.bar(this, x - 28, y + 22, 100, 16, { value: max ? got / max : 0, color: col }); c.add(bar); c.add(KG.txt(this, x + 82, y + 15, got + '/' + max, { size: 18, color: TKC.ink }));
    c.add(KG.txt(this, x - 28, y + 40, write ? 'เขียนแล้ว' : 'ดาวที่เก็บได้', { size: 15, weight: 400, color: '#6a64a0' }));
    c.add(new KG.ui.Button(this, x, y + h / 2 - 32, w - 52, 46, { label: write ? 'ไปบ้านคัดลายมือ' : 'เข้าเมืองนี้', icon: 'play', style: 'primary', size: 21, onClick: () => this.go(write ? 'Write' : 'Zone', { zone: z.id }) }));
    const zone = this.add.zone(x, y - 24, w, h - 80).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -6, duration: 120 }); KG.audio.play('hover'); }); zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { KG.audio.play('confirm'); this.go(write ? 'Write' : 'Zone', { zone: z.id }); });
    c.setAlpha(0).y += 24; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 320, delay: 70 * i, ease: 'Back.easeOut' });
  }
  soonCard(z, i) {
    const w = 292, h = 104, x = 28 + w / 2 + i * (w + 20), y = 408 + h / 2, c = this.add.container(0, 0);
    c.add(addCard(this, x, y, w, h, { r: 24, lw: 3.5, shadow: 5, fill: ['#f4f1fa', '#e6e0f2'] })); c.add(glyph(this, x - w / 2 + 52, y, z.icon, 44, '#a9a2c8')); c.add(KG.txt(this, x - w / 2 + 100, y - 18, z.th, { size: 24, color: '#6a64a0', oy: 0.5, width: 180 })); c.add(KG.txt(this, x - w / 2 + 100, y + 18, 'เร็ว ๆ นี้', { size: 20, weight: 400, color: '#8a84b0', oy: 0.5 })); c.add(KG.ui.icon(this, 'lock', x + w / 2 - 28, y - 24, 24, 0x9a94c0));
    const z2 = this.add.zone(x, y, w, h).setInteractive(); c.add(z2); z2.on('pointerup', () => KG.ui.toast(this, z.th + ' จะเปิดให้เล่นในรอบถัดไป', { ms: 2200 }));
    c.setAlpha(0).y += 20; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 300, delay: 300 + 70 * i });
  }
  bottomBar() {
    const y = 600, c = this.add.container(0, 0);
    c.add(addCard(this, GW / 2, y + 12, 1224, 138, { r: 30, fill: ['#ffffffe6', '#f1e8ffe6'], shadow: 6, lw: 3.5 }));
    c.add(this.add.image(120, y + 4, avatarTex(this, 128)).setDisplaySize(128, 128)); if (SAVE.data.wear.pet !== 'none') c.add(this.add.image(214, y + 30, petTex(this, SAVE.data.wear.pet, 84)).setDisplaySize(84, 84));
    const nm = KG.playerName(); c.add(KG.txt(this, 280, y - 30, nm ? 'สวัสดี ' + nm : 'สวัสดี นักเรียน', { size: 26, color: TKC.ink, oy: 0.5, width: 260 })); c.add(KG.txt(this, 280, y + 4, 'ดาวสะสม ' + totalStars() + '  ·  เหรียญ ' + (SAVE.data.coins || 0), { size: 20, weight: 400, color: '#6a64a0', oy: 0.5 }));
    const canChest = SAVE.data.chest !== todayKey(); this.chestBtn = new KG.ui.Button(this, 616, y + 6, 250, 64, { label: canChest ? 'หีบรางวัลวันนี้' : 'รับหีบแล้ววันนี้', icon: 'gem', style: canChest ? 'sun' : 'ghost', size: 22, onClick: () => this.openChest() }); this.chestBtn.setEnabled(canChest); if (canChest) this.chestBtn.pulse(); c.add(this.chestBtn);
    c.add(new KG.ui.Button(this, 862, y + 6, 190, 64, { label: 'ร้านค้า', icon: 'gem', style: 'primary', size: 24, onClick: () => this.go('Shop') }));
    c.add(new KG.ui.Button(this, 1062, y + 6, 190, 64, { label: 'สติกเกอร์', icon: 'star', style: 'cyan', size: 22, onClick: () => this.go('Stickers') }));
  }
  openChest() {
    if (SAVE.data.chest === todayKey()) return; const n = 8 + Math.floor(Math.random() * 8); SAVE.data.chest = todayKey(); addCoins(n); KG.audio.play('win'); KG.fx.confetti(this, { ms: 1200 });
    KG.ui.modal(this, { title: 'ได้รับรางวัล!', w: 640, accent: 0xffb800, body: 'หีบรางวัลวันนี้ให้เหรียญ ' + n + ' เหรียญ พรุ่งนี้มาเปิดหีบใหม่ได้อีกนะ', buttons: [{ label: 'เก็บรางวัล', style: 'primary', icon: 'check', pulse: true, onClick: () => this.time.delayedCall(200, () => this.scene.restart()) }] });
  }
}

/* ---------- รายการบทเรียนของโซน ---------- */
class ZoneScene extends KG.Scene {
  constructor() { super('Zone'); }
  init(d) { d = d || {}; this.zoneId = d.zone || 'cons'; this._restartData = { zone: this.zoneId }; }
  create() {
    this.setup(); const z = ZONES.find(q => q.id === this.zoneId), lv = SAVE.data.level; KG.audio.music('breeze'); menuBg(this, ['meadow', 'meadow', 'sunset', 'dusk'][lv]);
    menuHeader(this, { title: z.th + ' · ' + z.sub, onHome: () => this.go('Map') });
    const L = lessonsOfZone(z.id), w = 296, h = 214, col = Phaser.Display.Color.HexStringToColor(z.color).color;
    L.forEach((l, i) => {
      const r = Math.floor(i / 4), cc = i % 4, x = 24 + w / 2 + cc * (w + 16), y = 104 + h / 2 + r * (h + 22), locked = false, c = this.add.container(0, 0), got = lessonStars(l.id), max = lessonMax(l.id), learned = SAVE.data.learned[l.id];
      c.add(addCard(this, x, y, w, h, { r: 28, band: { h: 44, color: locked ? '#b9b4cf' : z.color }, fill: locked ? ['#f4f1fa', '#e6e0f2'] : ['#ffffff', '#f6f0ff'], shadow: 8 }));
      c.add(KG.txt(this, x, y - h / 2 + 23, 'บทที่ ' + (i + 1), { size: 22, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }));
      c.add(fitText(glyph(this, x, y - 14, l.th, l.th.length > 14 ? 34 : 42, locked ? '#a9a2c8' : TKC.ink), w - 30));
      {
        for (let k = 0; k < 3; k++) { const full = got >= (k + 1) * max / 3 - 0.01 && max > 0; c.add(KG.ui.icon(this, full ? 'star' : 'starO', x - 44 + k * 44, y + 52, 34, full ? 0xffb800 : KG.SKIN.starOff)); }
        c.add(KG.txt(this, x, y + 86, (learned ? 'เรียนแล้ว ✓  ·  ' : 'ยังไม่ได้เรียน  ·  ') + got + '/' + max + ' ดาว', { size: 15, weight: 400, color: '#6a64a0', center: true, middle: true }));
      }
      if (!locked) { const zn = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }); c.add(zn); zn.on('pointerover', () => { this.tweens.add({ targets: c, y: -6, duration: 120 }); KG.audio.play('hover'); }); zn.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 })); zn.on('pointerup', () => { KG.audio.play('confirm'); this.go('Lesson', { lesson: l.id }); }); }
      c.setAlpha(0).y += 22; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 300, delay: 60 * i, ease: 'Back.easeOut' });
    });
    this.txt(GW / 2, 640, ({ cons: 'เริ่มจากบทที่ 1 แล้วไล่ไปตามลำดับ ในแต่ละบทเริ่มที่ ‘เรียนรู้’ ก่อน', vow: 'เปิดทุกบทให้เรียน เรียงตามลำดับหรือเลือกบทที่อยากเรียนก่อนก็ได้', tone: 'เริ่มจากรู้จักอักษรกลาง สูง ต่ำ ก่อน แล้วเรียนรูป เสียง คำเป็นคำตาย และผันเสียงตามตาราง', final: 'เรียนแม่ ก กา แล้วไล่ไปทีละแม่ ดูตัวสะกดและเสียงท้ายของคำ', spell: 'สะกดคำทีละชิ้น ชื่อพยัญชนะ สระ ตัวสะกด วรรณยุกต์ แล้วอ่านคำ', sent: 'ดูภาพ แล้วเรียงคำเป็นประโยค ใคร ทำอะไร กับอะไร ที่ไหน' })[z.id] || '', { size: 22, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Map'); }
}

/* ---------- ศูนย์กลางของบทเรียน ---------- */
class LessonScene extends KG.Scene {
  constructor() { super('Lesson'); }
  init(d) { d = d || {}; this.lessonId = d.lesson || 'c1'; this.lesson = lessonOf(this.lessonId); this._restartData = { lesson: this.lessonId }; }
  create() {
    this.setup(); const l = this.lesson, lv = SAVE.data.level, zn = ZONES.find(z => z.id === l.zone); KG.audio.music('breeze'); menuBg(this, ['meadow', 'meadow', 'sunset', 'dusk'][lv]);
    menuHeader(this, { top: zn.th, title: l.th, onHome: () => this.go('Zone', { zone: l.zone }) });
    const acts = AK.activities(l, lv), w = 296, h = 196; this.acts = acts;
    acts.forEach((a, i) => this.tile(a, i, w, h));
    // แถบตัวอักษรของบทนี้ แตะเพื่อฟัง
    const items = AK.itemsOf(l, lv), longK = items.length && AK.info(items[0]).text.length > 6, sw = longK ? Math.min(290, (1180 - 20) / items.length) : Math.min(110, (1180 - 20) / items.length), y = 596;
    addCard(this, GW / 2, y, 1224, 96, { r: 26, fill: ['#ffffffe6', '#f1e8ffe6'], shadow: 5, lw: 3 }); this.txt(36, y - 42, 'ตัวในบทนี้ แตะเพื่อฟังเสียงอ่าน', { size: 16, weight: 400, color: '#6a64a0' });
    items.forEach((k, i) => { const inf = AK.info(k), x = GW / 2 + (i - (items.length - 1) / 2) * sw, c = this.add.container(x, y + 12); c.add(addCard(this, 0, 0, sw - 10, 62, { r: 16, lw: 3, shadow: 3, fill: ['#ffffff', '#fff6dc'] })); c.add(fitText(inf.kind === 'w' || inf.kind === 'f' ? richText(this, 0, 0, inf.text, 40, { maxW: sw - 20 }) : glyph(this, 0, 0, inf.text, longK ? 28 : 40, TKC.ink), sw - 24)); c.setSize(sw - 10, 62).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { SPEECH.say(inf.say); KG.audio.play('pop'); this.tweens.add({ targets: c, scaleX: 1.1, scaleY: 1.1, duration: 120, yoyo: true }); }); });
    this.txt(GW / 2, 670, SAVE.data.learned[l.id] ? 'เลือกเกมที่อยากเล่นได้เลย เก็บดาวให้ครบ 3 ดวงทุกเกม' : 'เริ่มที่ ‘เรียนรู้’ ก่อนนะ แล้วค่อยไปเขียนตามรอยและเล่นเกม', { size: 21, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Zone', { zone: this.lesson.zone }); }
  tile(a, i, w, h) {
    const meta = AK.ACT_META[a], col = i % 4, row = Math.floor(i / 4), x = 24 + w / 2 + col * (w + 16), y = 100 + h / 2 + row * (h + 16), c = this.add.container(0, 0), learn = a === 'learn', stars = actStars(this.lessonId, a), done = learn ? !!SAVE.data.learned[this.lessonId] : (a === 'trace' ? stars > 0 : stars > 0);
    c.add(addCard(this, x, y, w, h, { r: 28, band: { h: 12, color: meta.color }, fill: ['#ffffff', '#f6f0ff'], shadow: 9 }));
    c.add(this.add.circle(x - w / 2 + 62, y - 14, 46, Phaser.Display.Color.HexStringToColor(meta.color).color, 0.22).setStrokeStyle(4, 0x2d2a5e, 0.35)); c.add(actIcon(this, meta.icon, x - w / 2 + 62, y - 14, 76));
    c.add(fitText(KG.txt(this, x - w / 2 + 120, y - 44, meta.th, { size: 28, color: TKC.ink, oy: 0.5 }), 160)); c.add(KG.txt(this, x - w / 2 + 120, y - 6, meta.desc, { size: 15, weight: 400, color: '#4a4780', width: 160 }));
    if (learn) c.add(KG.txt(this, x, y + h / 2 - 34, done ? 'เรียนแล้ว ✓' : 'เริ่มที่นี่ก่อน', { size: 21, color: done ? '#3fb54a' : '#e83a8e', center: true, middle: true }));
    else for (let k = 0; k < 3; k++) c.add(KG.ui.icon(this, k < stars ? 'star' : 'starO', x - 40 + k * 40, y + h / 2 - 34, 32, k < stars ? 0xffb800 : KG.SKIN.starOff));
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -6, duration: 120 }); KG.audio.play('hover'); }); zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { KG.audio.play('confirm'); this.go(ACT_SCENE[a], { lesson: this.lessonId, act: a }); });
    c.setAlpha(0).y += 22; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 320, delay: 70 * i, ease: 'Back.easeOut' });
  }
}
