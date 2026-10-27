/* ===== Techno Talk: โหลด · หน้าแรก · เลือกระดับ · เลือกหน่วย · ศูนย์กลางของหน่วย (Hub) ===== */
const HOW_TO = {
  title: 'วิธีเล่น Techno Talk',
  body: '1. เลือกระดับ (Starter เริ่มต้น · Explorer ก้าวหน้า · Master เก่ง) แล้วเลือกหน่วยที่อยากเรียน\n2. เริ่มที่ ‘เรียนคำศัพท์’ ก่อน ดูภาพ ฟังเสียง แล้วพูดตาม\n3. ต่อด้วย ‘หลักภาษา’ ดูว่าคำไหนใช้คู่กับคำไหน เช่น I คู่กับ am · he she it คู่กับ is\n4. แล้ว ‘เขียนตามรอย’ เขียนคำศัพท์ของหน่วยตามลำดับเส้นบนบรรทัด 4 เส้น\n5. จากนั้นเล่นเกม 5 แบบ: จัดกลุ่ม · โยงเส้น · เปิดป้าย · ลากวาง · ถามตอบ เก็บดาวให้ครบ 3 ดวงทุกกิจกรรม\n6. ถ้าตอบผิด จะมีเหตุผลบอกเสมอ ลองใหม่ได้ และกดปุ่มไฟ ‘ใบ้’ ได้ (ใช้แล้วดาวลดลง)'
};

/* ---------- ไอคอนกิจกรรม (วาดเวกเตอร์ 100x100) ---------- */
const ACT_ICON = {
  learn(c) {
    rr2(c, 10, 32, 80, 54, 9, '#8a5cf0', 3.5); poly(c, [[15, 37], [48, 43], [48, 83], [15, 77]], '#ffffff', 3); poly(c, [[85, 37], [52, 43], [52, 83], [85, 77]], '#ffffff', 3);
    [[22, 49, 41, 53], [22, 59, 41, 63], [22, 69, 41, 73]].forEach(l => line(c, l[0], l[1], l[2], l[3], 3, '#b9b0e8')); [[59, 53, 78, 49], [59, 63, 78, 59], [59, 73, 78, 69]].forEach(l => line(c, l[0], l[1], l[2], l[3], 3, '#b9b0e8'));
    cir(c, 50, 17, 12, '#ffd34f', 3.5); rr2(c, 44, 27, 12, 8, 3, '#b9b0e8', 3); line(c, 50, -2, 50, 0, 4, INK); line(c, 33, 4, 36, 7, 4, INK); line(c, 67, 4, 64, 7, 4, INK);
  },
  sort(c) {
    const cols = ['#ff6fae', '#4aa8ff', '#ffb02e'];
    cols.forEach((col, i) => { const x = 8 + i * 30; poly(c, [[x, 46], [x + 26, 46], [x + 22, 88], [x + 4, 88]], col, 3.5); rr2(c, x - 2, 42, 30, 8, 4, shade(col, 0.85), 3); cir(c, x + 13, 24 + (i % 2) * 6, 8, ['#ffd34f', '#58c864', '#ff5aa6'][i], 3); });
    line(c, 21, 36, 21, 40, 3, INK); line(c, 51, 38, 51, 40, 3, INK); line(c, 81, 36, 81, 40, 3, INK);
  },
  match(c) {
    [[8, 14, '#ffe0ee'], [8, 56, '#dcebff']].forEach(a => rr2(c, a[0], a[1], 28, 30, 7, a[2], 3.5)); [[64, 14, '#d6f8ef'], [64, 56, '#fff0d2']].forEach(a => rr2(c, a[0], a[1], 28, 30, 7, a[2], 3.5));
    c.lineCap = 'round'; [[36, 29, 64, 71, '#ff5aa6'], [36, 71, 64, 29, '#3fb54a']].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.bezierCurveTo(50, l[1], 50, l[3], l[2], l[3]); c.lineWidth = 9; c.strokeStyle = INK; c.stroke(); c.lineWidth = 5; c.strokeStyle = l[4]; c.stroke(); });
    [[36, 29], [36, 71], [64, 29], [64, 71]].forEach(p => cir(c, p[0], p[1], 5.5, '#ffffff', 3));
  },
  flip(c) {
    rr2(c, 8, 20, 44, 58, 9, '#17c4a8', 3.5); c.font = '700 40px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 6; c.strokeStyle = INK; c.strokeText('?', 30, 51); c.fillStyle = '#fff'; c.fillText('?', 30, 51);
    c.save(); c.translate(70, 54); c.rotate(0.14); rr2(c, -24, -30, 48, 60, 9, '#ffffff', 3.5);
    const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 14; p.push([Math.cos(a) * r, Math.sin(a) * r + 2]); } poly(c, p, '#ffd34f', 2.6); c.restore();
  },
  build(c) {
    [['I', 6, '#ffe0ee'], ['am', 37, '#dcebff'], ['?', 68, '#fff0d2']].forEach(t => { rr2(c, t[1], 36, 27, 32, 8, t[2], 3.5); c.font = '700 17px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = INK; c.fillText(t[0], t[1] + 13.5, 53); });
    rr2(c, 10, 76, 82, 12, 6, 'rgba(255,255,255,.6)', 3); c.beginPath(); c.moveTo(50, 8); c.lineTo(50, 30); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); c.lineWidth = 4.5; c.strokeStyle = '#a06af0'; c.stroke(); poly(c, [[40, 26], [60, 26], [50, 36]], '#a06af0', 3);
  },
  quiz(c) {
    rr2(c, 8, 10, 84, 58, 18, '#ffffff', 3.5); poly(c, [[26, 66], [20, 88], [46, 66]], '#ffffff', 3.5); rr2(c, 22, 64, 26, 5, 1, '#ffffff', 0);
    c.font = '700 46px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 6; c.strokeStyle = INK; c.strokeText('?', 50, 40); c.fillStyle = '#ff7a3c'; c.fillText('?', 50, 40);
    cir(c, 78, 76, 14, '#3fb54a', 3.5); line(c, 71, 76, 76, 81, 4.5, '#ffffff'); line(c, 76, 81, 86, 70, 4.5, '#ffffff');
  },
  // ป้าย I + am ต่อกันเป็นจิ๊กซอว์ มีหัวใจตรงกลาง (คำที่ใช้คู่กัน)
  rule(c) {
    rr2(c, 4, 26, 42, 40, 10, '#ff7ab2', 3.5); rr2(c, 54, 26, 42, 40, 10, '#4aa8ff', 3.5);
    c.font = '700 26px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 5; c.strokeStyle = INK; [['I', 25], ['am', 75]].forEach(t => { c.strokeText(t[0], t[1], 47); c.fillStyle = '#ffffff'; c.fillText(t[0], t[1], 47); });
    c.beginPath(); c.moveTo(50, 62); c.bezierCurveTo(36, 52, 40, 38, 50, 44); c.bezierCurveTo(60, 38, 64, 52, 50, 62); c.closePath(); c.fillStyle = '#ffd34f'; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    rr2(c, 14, 74, 72, 16, 8, '#ffffff', 3); line(c, 24, 82, 40, 82, 3.5, '#ff7ab2'); line(c, 46, 82, 54, 82, 3.5, '#ffb02e'); line(c, 60, 82, 76, 82, 3.5, '#4aa8ff');
    cir(c, 84, 14, 9, '#ffd34f', 3); line(c, 84, 0, 84, 3, 3, INK); line(c, 96, 6, 93, 8, 3, INK); line(c, 72, 6, 75, 8, 3, INK);
  },
  // กระดาษ 4 เส้นมีตัว a กับดินสอ
  write(c) {
    rr2(c, 6, 16, 74, 76, 10, '#ffffff', 3.5);
    line(c, 13, 32, 73, 32, 2.5, '#7fb2ff'); for (let x = 13; x < 73; x += 10) line(c, x, 50, x + 5, 50, 2.5, '#7fb2ff'); line(c, 13, 68, 73, 68, 3.5, '#ff4f7b'); line(c, 13, 84, 73, 84, 2.5, '#7fb2ff');
    c.beginPath(); c.arc(29, 59, 8.5, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = '#ff5aa6'; c.stroke(); line(c, 38, 51, 38, 68, 5, '#ff5aa6');
    poly(c, [[86, 8], [96, 18], [64, 50], [54, 40]], '#ffc82e', 3); poly(c, [[54, 40], [64, 50], [48, 56]], '#ffe0b0', 3); poly(c, [[50.5, 50], [54.5, 54], [48, 56]], INK, 0);
    line(c, 80, 14, 90, 24, 3, '#ff8ac0');
  }
};
const actIcon = (scene, id, x, y, s) => scene.add.image(x, y, KG.tex(scene, 'tk|act|' + id, 120, 120, c => { c.scale(1.2, 1.2); c.lineJoin = 'round'; c.lineCap = 'round'; ACT_ICON[id](c); })).setDisplaySize(s, s);

/* ---------- ฉากโหลด: วาดภาพที่ต้องใช้ล่วงหน้าทีละก้อน อัปเดตแถบความคืบหน้าจริง (หน้าโหลด HTML) ---------- */
class TalkBoot extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const c = this.cameras.main; c.setZoom(KG.K); c.centerOn(GW / 2, GH / 2);
    KG.audio.init(this.game); KG.audio.setSfx(KG.prefs.data.sfx); KG.audio.musOn = KG.prefs.data.music; KG.fx.init(this);
    this.t0 = Date.now(); this.shown = 0; this.idx = 0; this.go_ = false; this.imgDone = false; this.msg = 'กำลังเตรียมตัวละคร';
    const T = this.tasks = [];
    T.push({ m: 'กำลังเตรียมตัวละคร', f: () => { KG.loadImages(this, KG.IMG).then(() => { this.imgDone = true; }); }, wait: () => this.imgDone });
    LEVELS.forEach(L => T.push({ m: 'กำลังวาดท้องฟ้าและทุ่งหญ้า', f: () => bgTex(this, L.bg) }));
    const pre = []; UNITS.forEach(u => pre.push(() => pic(this, u.icon, 0, 0, 130).destroy())); LEVELS.forEach(L => pre.push(() => pic(this, LEVELART[L.id - 1], 0, 0, 220, 170).destroy()));
    ACTS.forEach(a => pre.push(() => actIcon(this, a.id, 0, 0, 100).destroy()));
    ['tom', 'mei', 'ben', 'anna'].forEach(k => pre.push(() => pic(this, K_(k, 'happy', 'wave'), 0, 0, 210).destroy()));
    for (let i = 0; i < pre.length; i += 4) { const chunk = pre.slice(i, i + 4); T.push({ m: i < pre.length / 2 ? 'กำลังวาดภาพคำศัพท์' : 'กำลังวาดภาพประกอบ', f: () => chunk.forEach(g => g()) }); }
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

/* ---------- หน้าแรก ---------- */
const TITLE_KIDS = [['tom', 'I am Tom.', 'I'], ['mei', 'You are Mei.', 'you'], ['ben', 'He is Ben.', 'he'], ['anna', 'She is Anna.', 'she']];
class TitleScene extends KG.Scene {
  constructor() { super('Title'); }
  create() {
    this.setup(); KG.audio.music('sunny'); this.add.image(GW / 2, GH / 2, bgTex(this, 'meadow')).setDisplaySize(GW * 1.04, GH * 1.04);
    KG.fx.ambient(this, { freq: 260, colors: [0xffffff, 0xffd34f, 0xff9ac6], s: 0.4, alpha: 0.8 });
    const rx = 190, ry = 690;
    if (!KG.titlePose(this, rx + 6, ry + 6, { h: 470, w: 350, depth: 3, sign: { text: 'Hello!', cx: 0.504, cy: 0.46, w: 0.7, size: 48, color: '#e0247a' }, onTap: () => SPEECH.say('Hello! Let us talk!') })) {   // ไรเดอร์ท่าประจำเกม (ไม่ถือดาบ) ถ้าไม่มีภาพใช้แบบเดิม
      const rider = this.rider = new KG.Rider(this, rx, ry, { forms: ['s0', 's2', 's3', 's1'], form: 0, bodyH: 400 });
      rider.img.setAlpha(0).x = rx - 200; this.tweens.add({ targets: rider.img, x: rx, alpha: 1, duration: 800, ease: 'Cubic.easeOut', delay: 150, onComplete: () => rider.setPos(rx, ry) });
      this.add.zone(rx, ry - 190, 300, 380).setInteractive({ useHandCursor: true }).on('pointerdown', () => { if (rider.busy) return; KG.fx.burst(this, rx, ry - 200, { colors: [rider.form.color, 0xffffff, 0xffd34f], n: 26, max: 380, depth: 40 }); rider.attack(() => { rider.nextForm(true); SPEECH.say('Hello! Let us talk!'); }, 70); });
    }
    const logo = KG.ui.logo(this, 400, 14, [
      { t: 'TECHNO', grad: [[0, '#fff6a0'], [1, '#ff8ac0']], glow: '#ff5aa6', deep: '#4a1f7a', edge: '#b04a9a' },
      { t: 'TALK', grad: [[0, '#ffffff'], [1, '#7fe8ff']], glow: '#3d8bff', deep: '#1f2a7a', edge: '#2a5aca' }], { size: 104, w: 700 });
    logo.setAlpha(0).y -= 90; this.tweens.add({ targets: logo, y: logo.y + 90, alpha: 1, duration: 650, ease: 'Bounce.easeOut', delay: 350, onComplete: () => { KG.fx.flash(this, 0xffffff, 110); KG.audio.play('go'); KG.fx.shake(this, 140, 0.003); } });
    const sub = this.txt(412, 252, 'ประโยคอังกฤษประจำวัน', { size: 34, color: '#e83a8e', stroke: true, shadow: 0 });
    const tag = this.txt(412, 298, 'ฝึก I you he she it we they ด้วยภาพ เสียง หลักภาษา เขียนตามรอย และเกม 5 แบบ · อนุบาล – ป.3', { size: 21, weight: 400, color: TKC.ink, width: 620 });
    [sub, tag].forEach((t, i) => { t.setAlpha(0).x += 40; this.tweens.add({ targets: t, x: t.x - 40, alpha: 1, duration: 500, delay: 800 + i * 120, ease: 'Cubic.easeOut' }); });
    // เด็กสี่คนกับป้ายพูด (แตะแล้วอ่านประโยค)
    TITLE_KIDS.forEach((k, i) => {
      const x = 440 + i * 128, y = 560, c = this.add.container(x, y), kid = pic(this, K_(k[0], 'happy', i % 2 ? 'stand' : 'wave'), 0, 0, 210); c.add(kid);
      const bub = this.add.container(x, y - 156); bub.add(addCard(this, 0, 0, 140, 42, { r: 18, lw: 3, shadow: 4, fill: ['#ffffff', '#fff6dc'] })); bub.add(richSentence(this, 0, 0, k[1], k[2], 18, 130)); bub.add(this.add.circle(0, 26, 6, 0xffffff).setStrokeStyle(3, 0x2d2a5e));
      this.tweens.add({ targets: bub, y: bub.y - 8, duration: 1000 + i * 150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      c.setAlpha(0).y += 40; this.tweens.add({ targets: [c, bub], alpha: 1, duration: 420, delay: 1000 + i * 130 }); this.tweens.add({ targets: c, y, duration: 420, delay: 1000 + i * 130, ease: 'Back.easeOut' });
      c.setSize(150, 210).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { KG.audio.play('pop'); SPEECH.say(k[1]); this.tweens.add({ targets: c, y: y - 30, duration: 160, yoyo: true, ease: 'Quad.easeOut' }); });
    });
    const got = totalStars(), prog = got > 0 || Object.keys(SAVE.data.learn).length > 0, lu = prog ? unitOf(SAVE.data.unit) : null;   // มีความคืบหน้าที่บันทึกไว้ในเครื่อง = ปุ่มเล่นต่อพาไปหน่วยล่าสุดเลย
    const play = new KG.ui.Button(this, 1072, 424, 340, 80, { label: prog ? 'เล่นต่อ' : 'เริ่มเล่น', icon: 'play', style: 'primary', size: 36, onClick: () => (prog && lu ? this.go('Hub', { unit: lu.id }) : this.go('Levels')) });
    // โหมดใหม่: ฝึกเขียนคำศัพท์ตามหมวด บนเส้นบรรทัด 4 เส้น
    const write = new KG.ui.Button(this, 1072, 510, 340, 66, { label: 'เขียนคำศัพท์ ABC', icon: 'book', style: 'sun', size: 28, onClick: () => this.go('WriteMenu') });
    const wtag = this.add.container(1222, 482).setDepth(6); wtag.add(addCard(this, 0, 0, 70, 30, { r: 13, lw: 3, shadow: 3, fill: ['#ff7ab2', '#e83a8e'] })); wtag.add(KG.txt(this, 0, 0, 'NEW', { size: 17, color: '#ffffff', center: true, middle: true })); wtag.setAngle(10).setAlpha(0);
    this.tweens.add({ targets: wtag, alpha: 1, delay: 1500, duration: 300 }); this.tweens.add({ targets: wtag, scaleX: 1.15, scaleY: 1.15, duration: 560, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1500 });
    const sel = new KG.ui.Button(this, 1072, 586, 340, 52, { label: 'เลือกระดับ', icon: 'flag', style: 'cyan', size: 24, onClick: () => this.go('Levels') });
    const how = new KG.ui.Button(this, 1072, 648, 340, 46, { label: 'วิธีเล่น', icon: 'help', style: 'ghost', size: 22, onClick: () => KG.howTo(this, HOW_TO) });
    if (prog && lu) { const t = this.txt(1072, 348, 'ต่อจาก ' + LEVELS[lu.level - 1].en + ' · ' + lu.en, { size: 19, color: '#ffffff', center: true, ox: 0.5, stroke: true, sw: 4 }); fitText(t, 330); t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, delay: 1300, duration: 400 }); }
    floatLetters(this, 'AaBbCcDdEeFfGgHh', 7);
    [play, write, sel, how].forEach((b, i) => { b.setAlpha(0).x += 360; this.tweens.add({ targets: b, x: b.x - 360, alpha: 1, duration: 520, delay: 1000 + i * 110, ease: 'Back.easeOut' }); });
    this.time.delayedCall(1700, () => play.pulse());
    this.time.delayedCall(1800, () => { if (!SPEECH.exists) { const n = this.txt(GW / 2, 650, 'เครื่องนี้ยังไม่มีเสียงอ่านภาษาอังกฤษ เกมเล่นได้ปกติ แต่จะไม่มีเสียงคำศัพท์', { size: 18, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true, sw: 4 }); n.setAlpha(0); this.tweens.add({ targets: n, alpha: 1, duration: 400 }); } });
    const sys = addSystemButtons(this, 1060, 52); sys.forEach((b, i) => { b.setAlpha(0); this.tweens.add({ targets: b, alpha: b.alpha || 1, duration: 400, delay: 1300 + i * 80 }); });
    this.time.delayedCall(1500, () => promptFullscreen(this, () => askPlayerOnce(this)));
    addPlayerChip(this, 246, 44).setDepth(5);
    const st = this.txt(36, 676, 'ดาวสะสม ' + got + ' / ' + MAX_ALL + '  ·  บันทึกในเครื่องนี้อัตโนมัติ', { size: 22, color: '#ffffff', stroke: true }); st.setAlpha(0); this.tweens.add({ targets: st, alpha: 1, delay: 1500, duration: 400 });
    this.txt(GW - 36, 698, 'KruKan.in.th · ภาษาอังกฤษ อนุบาล – ป.3', { size: 16, weight: 400, color: '#ffffff', ox: 1, stroke: true });
  }
}

/* ---------- เลือกระดับ ---------- */
const LEVELART = [G_(K_('tom', 'happy', 'wave'), K_('mei', 'happy')), G_(K_('anna', 'happy'), T_('cake'), T_('apple')), G_(K_('ben', 'smile'), A_('fish'), T_('qmark'))];
class LevelsScene extends KG.Scene {
  constructor() { super('Levels'); }
  create() {
    this.setup(); KG.audio.music('breeze'); this.add.image(GW / 2, GH / 2, bgTex(this, 'meadow')).setDisplaySize(GW, GH); this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.2);
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 }); cuteTitle(this, 'TECHNO TALK', 'เลือกระดับ', TKC.pink, 'star');
    this.txt(GW - 330, 24, 'ดาวสะสม ' + totalStars() + '/' + MAX_ALL, { size: 24, color: '#ffffff', stroke: true, ox: 1 }); KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']); iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 }); iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, HOW_TO), { w: 56, h: 52 });
    KG.fx.ambient(this, { freq: 420, colors: [0xffffff, 0xffd34f, 0x9ad8ff], s: 0.32, alpha: 0.6 });
    LEVELS.forEach((L, i) => this.card(L, i));
    this.txt(GW / 2, 650, 'เลือกระดับที่เหมาะกับน้องได้เลย ทุกหน่วยเปิดให้เล่นทันที ดาวและความคืบหน้าบันทึกไว้ในเครื่องนี้ เล่นต่อได้ทุกครั้ง', { size: 21, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
    new KG.ui.Button(this, GW / 2, 692, 230, 36, { label: 'ล้างดาวทั้งหมด', icon: 'trash', style: 'ghost', size: 16, slant: 8, onClick: () => this.confirmReset() });
  }
  onEscape() { this.go('Title'); }
  // ล้างดาวและประวัติการเรียนที่บันทึกไว้ในเครื่อง (ถามยืนยันก่อน)
  confirmReset() {
    KG.ui.modal(this, { title: 'ล้างดาวทั้งหมด?', w: 700, accent: 0xee4a4a, body: 'ดาวและประวัติการเรียนที่บันทึกไว้ในเครื่องนี้จะหายไป และเริ่มนับใหม่ทั้งหมด ย้อนกลับไม่ได้',
      buttons: [{ label: 'ยกเลิก', style: 'ghost', icon: 'close' }, { label: 'ล้างเลย', style: 'danger', icon: 'trash', onClick: () => { SAVE.data.stars = {}; SAVE.data.learn = {}; SAVE.data.rule = {}; SAVE.data.level = 1; SAVE.data.unit = '1-1'; SAVE.save(); this.time.delayedCall(260, () => this.scene.restart()); } }] });
  }
  card(L, i) {
    const w = 396, h = 500, x = 28 + w / 2 + i * (w + 22), y = 100 + h / 2, got = levelStars(L.id), c = this.add.container(0, 0);
    c.add(addCard(this, x, y, w, h, { r: 34, band: { h: 100, color: L.color }, fill: ['#ffffff', '#f6f0ff'], shadow: 10 }));
    c.add(KG.txt(this, x, y - h / 2 + 34, L.en, { size: 48, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 7 })); c.add(KG.txt(this, x, y - h / 2 + 76, L.th + ' · ' + L.grade, { size: 22, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }));
    c.add(pic(this, LEVELART[i], x, y - h / 2 + 182, 330, 136));
    const bub = addCard(this, x, y - h / 2 + 286, w - 60, 52, { r: 24, lw: 3, shadow: 4, fill: ['#fff9e6', '#ffefc2'] }); c.add(bub);
    const eg = L.eg, p0 = eg.split(' ')[0].toLowerCase(), pp = ['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(p0) ? (p0 === 'i' ? 'I' : p0) : null; c.add(richSentence(this, x, y - h / 2 + 286, eg, pp, 28, w - 90));
    c.add(KG.txt(this, x, y - h / 2 + 330, L.blurb, { size: 18, weight: 400, color: '#4a4780', center: true, ox: 0.5, width: w - 56 }));
    const bar = KG.ui.bar(this, x - w / 2 + 28, y + h / 2 - 78, 220, 18, { value: got / MAX_LEVEL, color: Phaser.Display.Color.HexStringToColor(L.color).color }); c.add(bar);
    c.add(KG.ui.icon(this, 'star', x - w / 2 + 28 + 244, y + h / 2 - 69, 26, 0xffb800)); c.add(KG.txt(this, x - w / 2 + 28 + 262, y + h / 2 - 84, got + '/' + MAX_LEVEL, { size: 22, color: TKC.ink }));
    const go = new KG.ui.Button(this, x, y + h / 2 - 32, w - 60, 52, { label: got ? 'เล่นต่อ' : 'เริ่มระดับนี้', icon: 'play', style: 'primary', size: 24, onClick: () => { SAVE.data.level = L.id; SAVE.save(); this.go('Units', { level: L.id }); } }); c.add(go);
    const zone = this.add.zone(x, y - 30, w, h - 90).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -6, duration: 120 }); KG.audio.play('hover'); }); zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { SAVE.data.level = L.id; SAVE.save(); KG.audio.play('confirm'); this.go('Units', { level: L.id }); });
    c.setAlpha(0).y += 24; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 340, delay: 100 * i, ease: 'Back.easeOut' });
  }
}

/* ---------- เลือกหน่วยของระดับ ---------- */
class UnitsScene extends KG.Scene {
  constructor() { super('Units'); }
  init(d) { d = d || {}; this.lv = LEVELS[(d.level || SAVE.data.level || 1) - 1]; this._restartData = { level: this.lv.id }; }
  create() {
    this.setup(); const L = this.lv; KG.audio.music('breeze'); this.add.image(GW / 2, GH / 2, bgTex(this, L.bg)).setDisplaySize(GW, GH); this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.2);
    iconButton(this, 56, 40, 'home', () => this.go('Levels'), { w: 60, h: 52 }); cuteTitle(this, 'TECHNO TALK · ' + L.th + ' · ' + L.grade, 'ระดับ ' + L.en + ' · เลือกหน่วย', L.color, 'flag');
    this.txt(GW - 330, 24, 'ดาวสะสม ' + levelStars(L.id) + '/' + MAX_LEVEL, { size: 24, color: '#ffffff', stroke: true, ox: 1 }); KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']); iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 }); iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, HOW_TO), { w: 56, h: 52 });
    KG.fx.ambient(this, { freq: 420, colors: [0xffffff, 0xffd34f, 0x9ad8ff], s: 0.32, alpha: 0.6 });
    unitsOfLevel(L.id).forEach((u, i) => this.card(u, i));
    const b = addCard(this, GW / 2, 600, 1180, 70, { r: 28, fill: ['#ffffffe0', '#f1e8ffe0'], shadow: 6, lw: 3 }); this.txt(GW / 2, 600, L.blurb, { size: 22, weight: 400, color: TKC.ink, center: true, ox: 0.5, oy: 0.5, width: 1120 });
  }
  onEscape() { this.go('Levels'); }
  card(u, i) {
    const w = 232, h = 400, x = 32 + w / 2 + i * (w + 14), y = 112 + h / 2, got = unitStars(u.id), c = this.add.container(0, 0), col = this.lv.color;
    c.add(addCard(this, x, y, w, h, { r: 28, band: { h: 46, color: col }, fill: ['#ffffff', '#f6f0ff'], shadow: 9 }));
    c.add(KG.txt(this, x, y - h / 2 + 24, 'หน่วย ' + (i + 1), { size: 24, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }));
    c.add(addCard(this, x, y - h / 2 + 150, 190, 150, { r: 24, lw: 3, shadow: 0, fill: ['#fff8e1', '#ffeab8'] })); c.add(pic(this, u.icon, x, y - h / 2 + 150, 170, 134));
    const t1 = KG.txt(this, x, y - h / 2 + 248, u.en, { size: 28, color: TKC.ink, center: true, middle: true, width: w - 24 }); fitText(t1, w - 24); c.add(t1);
    c.add(KG.txt(this, x, y - h / 2 + 284, u.th, { size: 20, weight: 400, color: '#6a64a0', center: true, middle: true, width: w - 24 }));
    const ex = allSents(u)[0]; c.add(richSentence(this, x, y - h / 2 + 318, ex.en, ex.p, 20, w - 30));
    for (let k = 0; k < 3; k++) { const fill = got >= (k + 1) * MAX_UNIT / 3; c.add(KG.ui.icon(this, fill ? 'star' : 'starO', x - 52 + k * 52, y + h / 2 - 50, 34, fill ? 0xffb800 : KG.SKIN.starOff)); }
    c.add(KG.txt(this, x, y + h / 2 - 18, got + '/' + MAX_UNIT + (SAVE.data.learn[u.id] ? ' · เรียนแล้ว ✓' : ''), { size: 18, color: '#6a64a0', center: true, middle: true }));
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -6, duration: 120 }); KG.audio.play('hover'); }); zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { SAVE.data.unit = u.id; SAVE.save(); KG.audio.play('confirm'); this.go('Hub', { unit: u.id }); });
    c.setAlpha(0).y += 24; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 320, delay: 80 * i, ease: 'Back.easeOut' });
  }
}

/* ---------- ศูนย์กลางของหน่วย: เรียนคำศัพท์ › หลักภาษา › เขียนตามรอย › เกม 5 แบบ (การ์ด 8 ใบ 4 คอลัมน์ 2 แถว มีเลขลำดับ) ---------- */
const HUB_T = { w: 296, h: 200, gx: 16, gy: 18, x0: 24, y0: 98 };
const hubXY = i => ({ x: HUB_T.x0 + HUB_T.w / 2 + (i % 4) * (HUB_T.w + HUB_T.gx), y: HUB_T.y0 + HUB_T.h / 2 + Math.floor(i / 4) * (HUB_T.h + HUB_T.gy) });
class HubScene extends KG.Scene {
  constructor() { super('Hub'); }
  init(d) { d = d || {}; this.unit = unitOf(d.unit || SAVE.data.unit); this.LV = LEVELS[this.unit.level - 1]; this._restartData = { unit: this.unit.id }; }
  create() {
    this.setup(); const u = this.unit, L = this.LV; KG.audio.music('breeze'); this.add.image(GW / 2, GH / 2, bgTex(this, L.bg)).setDisplaySize(GW, GH); this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.2);
    iconButton(this, 56, 40, 'home', () => this.go('Units', { level: L.id }), { w: 60, h: 52 }); cuteTitle(this, 'ระดับ ' + L.en + ' · ' + L.grade + ' · หน่วย ' + u.id.split('-')[1], u.en + '  ·  ' + u.th, L.color, 'book', 560);
    this.txt(GW - 330, 24, 'ดาวหน่วยนี้ ' + unitStars(u.id) + '/' + MAX_UNIT, { size: 24, color: '#ffffff', stroke: true, ox: 1 }); KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']); iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 }); iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, HOW_TO), { w: 56, h: 52 });
    KG.fx.ambient(this, { freq: 420, colors: [0xffffff, 0xffd34f, 0x9ad8ff], s: 0.32, alpha: 0.6 });
    // กิจกรรมที่แนะนำให้เล่นต่อ: เรียนคำศัพท์ › หลักภาษา › เกมแรกที่ยังไม่มีดาว
    const study = ACTS.filter(a => a.study).find(a => !studied(u.id, a.id)); this.rec = study ? study.id : (PLAY_ACTS.find(a => !actStars(u.id, a.id)) || {}).id;
    ACTS.forEach((a, i) => this.tile(a, i));
    // แถบตัวอย่างประโยค (ลูกโป่งคำพูด แตะแล้วฟัง)
    const ss = TK.uniqueBy(allSents(u), s => s.en).slice(0, 4), lab = this.add.container(36, 540);
    const lt = KG.txt(this, 0, 0, 'ตัวอย่างประโยค · แตะเพื่อฟัง', { size: 17, color: TKC.ink, oy: 0.5 }); lab.add(addCard(this, lt.width / 2 + 34, 0, lt.width + 56, 32, { r: 16, lw: 3, shadow: 2, fill: ['#ffffff', '#fff1f8'] })); lab.add(KG.ui.icon(this, 'sound', 22, 0, 18, colN(TKC.pink))); lt.x = 36; lab.add(lt);
    ss.forEach((s, i) => {
      const x = 36 + 150 + i * 306, y = 602, c = this.add.container(x, y), col = PCOL[s.p] || TKC.pink, tail = this.add.graphics();
      tail.fillStyle(0xffffff, 1).lineStyle(3, 0x2d2a5e, 1); tail.beginPath(); tail.moveTo(-112, 26); tail.lineTo(-126, 50); tail.lineTo(-88, 28); tail.closePath(); tail.fillPath(); tail.strokePath(); c.add(tail);
      c.add(addCard(this, 0, 0, 290, 64, { r: 30, lw: 3, shadow: 4, fill: ['#ffffff', mixWhite(col, 0.88)] })); c.add(richSentence(this, 0, 0, s.en, s.p, s.en.length > 18 ? 22 : 26, 262));
      c.setSize(290, 64).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { SPEECH.say(s.en); KG.audio.play('pop'); this.tweens.add({ targets: c, scaleX: 1.06, scaleY: 1.06, duration: 120, yoyo: true }); });
      c.setAlpha(0).y += 14; this.tweens.add({ targets: c, alpha: 1, y, duration: 300, delay: 500 + i * 70 });
    });
    const msg = !studied(u.id, 'learn') ? 'เริ่มที่ ‘เรียนคำศัพท์’ ก่อนนะ แล้วต่อด้วย ‘หลักภาษา’' : !studied(u.id, 'rule') ? 'ต่อด้วย ‘หลักภาษา’ ดูว่าคำไหนใช้คู่กับคำไหน' : 'เลือกกิจกรรมที่อยากเล่นได้เลย เก็บดาวให้ครบ 3 ดวงทุกกิจกรรม';
    this.say_ = this.txt(GW / 2, 668, msg, { size: 22, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Units', { level: this.LV.id }); }
  tile(a, i) {
    const { w, h } = HUB_T, { x, y } = hubXY(i), c = this.add.container(0, 0), u = this.unit, study = !!a.study, stars = actStars(u.id, a.id), done = study ? studied(u.id, a.id) : stars > 0, L = x - w / 2, ac = colN(a.color);
    // การ์ดสีพาสเทลตามกิจกรรม · เลขลำดับมุมซ้ายบน · ไอคอนแบบสติกเกอร์ลอยขึ้นลงเบา ๆ · ชื่อ + ป้ายอังกฤษ · ดาวในแคปซูลสีขาว
    c.add(addCard(this, x, y, w, h, { r: 34, lw: 4, shadow: 8, fill: [mixWhite(a.color, 0.78), mixWhite(a.color, 0.92)] }));
    c.add(this.add.circle(L + 26, y - h / 2 + 26, 17, ac).setStrokeStyle(3, 0x2d2a5e)); c.add(KG.txt(this, L + 26, y - h / 2 + 26, String(i + 1), { size: 19, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }));
    const stk = this.add.container(L + 84, y - 18); stk.add(this.add.circle(0, 0, 50, 0xffffff).setStrokeStyle(5, ac)); stk.add(actIcon(this, a.id, 0, 0, 82)); stk.setAngle(-6); c.add(stk);
    this.tweens.add({ targets: stk, y: stk.y - 5, angle: 4, duration: 1300 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 120 });
    const tt = KG.txt(this, L + 148, y - 64, a.th, { size: 29, color: TKC.ink }); fitText(tt, w - 160); c.add(tt);
    const et = KG.txt(this, 0, 0, a.en, { size: 16, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 3 }), ew = et.width + 26; c.add(addCard(this, L + 148 + ew / 2, y - 12, ew, 28, { r: 14, lw: 2.5, shadow: 2, fill: [a.color, shade(a.color, 0.9)] })); et.setPosition(L + 148 + ew / 2, y - 12); c.add(et);
    c.add(addCard(this, L + 216, y + 30, 136, 40, { r: 20, lw: 2.5, shadow: 2, fill: ['#ffffff', '#fff8ec'] }));
    if (study) c.add(KG.txt(this, L + 216, y + 30, done ? 'เรียนแล้ว ✓' : 'เริ่มเลย!', { size: 19, color: done ? '#3fb54a' : '#e83a8e', center: true, middle: true }));
    else for (let k = 0; k < 3; k++) c.add(KG.ui.icon(this, k < stars ? 'star' : 'starO', L + 180 + k * 36, y + 30, 28, k < stars ? 0xffb800 : KG.SKIN.starOff));
    const dt = KG.txt(this, x, y + 74, a.desc, { size: 15, weight: 400, color: '#4a4780', center: true, middle: true, width: w - 36 }); c.add(dt);
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -6, duration: 120 }); KG.audio.play('hover'); }); zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { KG.audio.play('confirm'); this.go(a.scene, { unit: u.id }); });
    // แสงวาบวิ่งผ่านการ์ดเป็นระยะ (ดูมีชีวิตแบบปุ่มในเกม)
    const msk = this.make.graphics({ add: false }); msk.fillStyle(0xffffff).fillRoundedRect(x - w / 2, y - h / 2, w, h, 30);
    const sh = this.add.rectangle(x - w / 2 - 90, y, 54, h * 1.7, 0xffffff, 0.45).setAngle(18).setMask(msk.createGeometryMask()); c.add(sh);
    this.tweens.add({ targets: sh, x: x + w / 2 + 90, duration: 850, ease: 'Sine.easeInOut', repeat: -1, repeatDelay: 2600 + i * 350, delay: 900 + i * 250 });
    if (a.id === this.rec) {
      const ring = this.add.graphics(); ring.lineStyle(6, 0xffd34f, 1).strokeRoundedRect(x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12, 34); c.addAt(ring, 0); this.tweens.add({ targets: ring, alpha: 0.25, duration: 600, yoyo: true, repeat: -1 });
      const tag = this.add.container(x + w / 2 - 50, y - h / 2 - 12); tag.add(addCard(this, 0, 0, 96, 36, { r: 16, lw: 3, shadow: 3, fill: ['#ffe14d', '#ff9a1e'] })); tag.add(KG.txt(this, 0, 0, 'PLAY!', { size: 20, color: TKC.ink, center: true, middle: true })); tag.setAngle(8); c.add(tag);
      this.tweens.add({ targets: tag, scaleX: 1.14, scaleY: 1.14, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    c.setAlpha(0).y += 22; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 320, delay: 70 * i, ease: 'Back.easeOut' });
  }
}
// สีอ่อนลงโดยผสมกับสีขาว k (0–1) คืนรหัส #rrggbb
function mixWhite(hex, k) { const c = Phaser.Display.Color.HexStringToColor(hex), m = v => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0'); return '#' + m(c.red) + m(c.green) + m(c.blue); }
