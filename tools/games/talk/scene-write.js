/* ===== Techno Talk: ฝึกเขียนคำศัพท์ตามหมวด (WriteMenu เลือกหมวด · Write เขียนตามรอยทีละตัวบนกระดาษ 4 เส้น) =====
   เส้นของตัวอักษรมาจาก letters.js (TKW) เขียนตามลำดับเส้น เริ่มที่จุดเขียว ลากตามลูกศรจนสุดเส้น ถ้าเริ่มผิดจุดหรือลากออกนอกเส้นจะให้เริ่มเส้นนั้นใหม่
   ดาวของหมวดเก็บที่ SAVE.data.write[หมวด] คำที่เขียนครบแล้วเก็บที่ SAVE.data.wrote[คำ] (ไม่รวมในดาวของหน่วยเรียน)
   เปิดจากหน่วยเรียน ({ unit }) = กิจกรรม 'เขียนตามรอย' ของหน่วย: เขียนคำศัพท์ของหน่วยนั้น (เช่น I you he she it we they) ดาวเก็บรวมกับดาวของหน่วย */
const WRITE_N = 5;                                     // คำต่อรอบ (โหมดหมวด)
const UNIT_WRITE_LETTERS = 32, UNIT_WRITE_MAX = 8;     // โหมดหน่วย: เขียนให้ครบทุกคำถ้าตัวอักษรรวมไม่เกินนี้ คำยาว ๆ (กิจวัตร) แบ่งเป็นหลายรอบ
const WRITE_TIP = 'ตัวสูง b d f h k l t แตะเส้นบนสุด · ตัวที่มีหาง g j p q y ลงถึงเส้นล่างสุด · วงกลมของ a c d g o q วนทวนเข็มนาฬิกา';
const WRITE_MAX = () => WRITE_CATS.length * 3;
const writeStars = () => WRITE_CATS.reduce((n, c) => n + ((SAVE.data.write || {})[c.id] || 0), 0);
const wroteCount = cat => cat.words.filter(w => (SAVE.data.wrote || {})[w]).length;
const INK_COLS = ['#ff4f9a', '#3d8bff', '#12b89a', '#ff8a1e', '#9a5ae8', '#3fb54a', '#ee4a4a'];
const hexN = h => Phaser.Display.Color.HexStringToColor(h).color;
// เลือกคำของรอบ: คำที่ยังไม่เคยเขียนก่อน (เรียงสั้นไปยาวตามหมวด) แล้วเติมด้วยคำที่เคยเขียนแบบสุ่ม
function pickWriteWords(cat) {
  const wrote = SAVE.data.wrote || {}, fresh = cat.words.filter(w => !wrote[w]), old = TK.shuf(cat.words.filter(w => wrote[w]), Math.random);
  return fresh.concat(old).slice(0, Math.min(WRITE_N, cat.words.length));
}
// คำของหน่วยเรียน: ทุกคำของหน่วยตามลำดับที่เรียน ถ้ารวมกันยาวเกินไปเลือกคำที่ยังไม่เคยเขียนก่อน (รอบหน้าได้คำที่เหลือ)
function unitWriteWords(u) {
  const ids = u.words.filter(id => WORDS[id] && TKW.can(wd(id).en)), wrote = SAVE.data.wrote || {}, order = ids.filter(id => !wrote[id]).concat(TK.shuf(ids.filter(id => wrote[id]), Math.random)), pick = [];
  let n = 0;
  for (const id of order) { const len = wd(id).en.replace(/ /g, '').length; if (pick.length >= 3 && (n + len > UNIT_WRITE_LETTERS || pick.length >= UNIT_WRITE_MAX)) break; pick.push(id); n += len; }
  return ids.filter(id => pick.includes(id));
}

/* ---------- เลือกหมวด ---------- */
class WriteMenuScene extends KG.Scene {
  constructor() { super('WriteMenu'); }
  create() {
    this.setup(); KG.audio.music('bounce'); this.add.image(GW / 2, GH / 2, bgTex(this, 'sunset')).setDisplaySize(GW, GH); this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.16);
    KG.fx.ambient(this, { freq: 300, colors: [0xffffff, 0xffd34f, 0xff9ac6], s: 0.35, alpha: 0.7 });
    floatLetters(this, 'abcdefghijklmnopqrstuvwxyz', 9);
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 }); cuteTitle(this, 'TECHNO TALK · WRITING', 'เขียนคำศัพท์ · เลือกหมวด', '#ff8a1e', 'write');
    this.txt(GW - 330, 24, 'ดาวเขียน ' + writeStars() + '/' + WRITE_MAX(), { size: 24, color: '#ffffff', stroke: true, ox: 1 }); KG.ui.icon(this, 'star', GW - 322, 38, 30, 0xffb800);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']); iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 }); iconButton(this, GW - 56, 40, 'help', () => KG.howTo(this, WRITE_HOW), { w: 56, h: 52 });
    WRITE_CATS.forEach((c, i) => this.card(c, i));
    const t = this.txt(GW / 2, 640, 'เขียนตามลำดับเส้น เริ่มที่จุดสีเขียว ลากตามลูกศร ตัวอักษรอยู่บนเส้นบรรทัด 4 เส้นเหมือนสมุดคัดภาษาอังกฤษ', { size: 21, color: '#ffffff', center: true, ox: 0.5, stroke: true, sw: 4 }); fitText(t, 1200);
  }
  onEscape() { this.go('Title'); }
  card(cat, i) {
    const w = 392, h = 162, col = i % 3, row = Math.floor(i / 3), x = 28 + w / 2 + col * (w + 20), y = 98 + h / 2 + row * (h + 12), c = this.add.container(0, 0), stars = (SAVE.data.write || {})[cat.id] || 0, got = wroteCount(cat), n = cat.words.length;
    c.add(addCard(this, x, y, w, h, { r: 32, lw: 4, fill: [mixWhite(cat.color, 0.9), mixWhite(cat.color, 0.78)], shadow: 8 }));
    const stk = this.add.container(x - w / 2 + 78, y + 4); stk.add(this.add.circle(0, 0, 60, 0xffffff).setStrokeStyle(5, hexN(cat.color))); stk.add(pic(this, wd(cat.icon).pic, 0, 0, 100, 100)); stk.setAngle(-5); c.add(stk);
    this.tweens.add({ targets: stk, y: stk.y - 5, angle: 4, duration: 1300 + i * 110, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 140 });
    c.add(KG.txt(this, x - w / 2 + 150, y - 52, cat.th, { size: 32, color: TKC.ink })); c.add(KG.txt(this, x - w / 2 + 152, y - 12, cat.en + ' · ' + n + ' คำ', { size: 20, color: cat.color }));
    const sample = cat.words.slice(0, 4).map(k => wd(k).en).join('  '); const st = KG.txt(this, x - w / 2 + 152, y + 16, sample, { size: 20, color: '#6a64a0' }); fitText(st, w - 170); c.add(st);
    for (let k = 0; k < 3; k++) c.add(KG.ui.icon(this, k < stars ? 'star' : 'starO', x - w / 2 + 168 + k * 36, y + 60, 30, k < stars ? 0xffb800 : KG.SKIN.starOff));
    c.add(KG.txt(this, x + w / 2 - 18, y + 60, 'เขียนแล้ว ' + got + '/' + n, { size: 17, color: '#6a64a0', ox: 1, oy: 0.5 }));
    if (!got) { const tag = this.add.container(x + w / 2 - 40, y - h / 2 + 30); tag.add(addCard(this, 0, 0, 74, 32, { r: 14, lw: 3, shadow: 3, fill: ['#ffe14d', '#ffb800'] })); tag.add(KG.txt(this, 0, 0, 'NEW', { size: 18, color: TKC.ink, center: true, middle: true })); tag.setAngle(8); c.add(tag); this.tweens.add({ targets: tag, scaleX: 1.12, scaleY: 1.12, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }); c.add(zone);
    zone.on('pointerover', () => { this.tweens.add({ targets: c, y: -6, duration: 120 }); KG.audio.play('hover'); }); zone.on('pointerout', () => this.tweens.add({ targets: c, y: 0, duration: 120 }));
    zone.on('pointerup', () => { KG.audio.play('confirm'); SPEECH.say(cat.en); this.go('Write', { cat: cat.id }); });
    c.setAlpha(0).y += 24; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 320, delay: 60 * i, ease: 'Back.easeOut' });
  }
}
const WRITE_HOW = {
  title: 'วิธีเขียนคำศัพท์',
  body: '1. ดูภาพ ฟังคำ และอ่านความหมายของคำที่จะเขียน\n2. เขียนทีละตัวตามลำดับเส้น เริ่มที่จุดสีเขียวหมายเลขของเส้น แล้วลากตามลูกศรจนสุดเส้น\n3. ตัวอักษรต้องอยู่บนเส้นบรรทัด 4 เส้น: ตัวสูงแตะเส้นบนสุด ตัวเตี้ยอยู่ระหว่างเส้นประกับเส้นแดง ตัวที่มีหาง (g j p q y) ลงไปถึงเส้นล่างสุด\n4. ถ้าเริ่มผิดจุดหรือลากออกนอกเส้น ให้เริ่มเส้นนั้นใหม่จากจุดสีเขียว กดปุ่ม ดูวิธีเขียน เพื่อดูตัวอย่างได้ทุกเมื่อ\n5. เขียนครบ ' + WRITE_N + ' คำ ได้ดาวตามความแม่นยำ'
};
// ตัวอักษรลอยเป็นพื้นหลัง (ตกแต่ง)
function floatLetters(scene, chars, n) {
  for (let i = 0; i < n; i++) {
    const ch = chars[Math.floor(Math.random() * chars.length)], x = 60 + Math.random() * (GW - 120), t = KG.txt(scene, x, GH + 40, ch, { size: 40 + Math.random() * 40, color: INK_COLS[i % INK_COLS.length], center: true, middle: true, stroke: true, sw: 5 }).setAlpha(0.32).setDepth(0.5);
    scene.tweens.add({ targets: t, y: -60, angle: Math.random() * 60 - 30, duration: 9000 + Math.random() * 6000, delay: i * 1300, repeat: -1, onRepeat: () => { t.x = 60 + Math.random() * (GW - 120); } });
  }
}

/* ---------- เขียนตามรอย ---------- */
const WB = { x: 360, y: 96, w: 896, h: 532 };          // กระดานเขียน
class WriteScene extends ActBase {
  constructor() { super('Write'); this.ACT = 'write'; }
  init(d) {
    d = d || {}; this.byUnit = !!d.unit && !d.cat;
    if (this.byUnit) {   // กิจกรรมของหน่วยเรียน: พื้นหลัง หัวฉาก ดาว ใช้ของหน่วย
      super.init(d); const u = this.unit; this.cat = { id: 'unit-' + u.id, th: u.th, en: u.en, color: this.A.color, words: u.words };
    } else {
      this.cat = WRITE_CATS.find(c => c.id === d.cat) || WRITE_CATS[0];
      this.unit = curUnit(); this.LV = curLevel(); this.A = { id: 'write', th: 'เขียนคำศัพท์', en: 'Write', color: this.cat.color };
      this.headSub = 'หมวด' + this.cat.th + ' · ' + this.cat.en; this._restartData = { cat: this.cat.id };
      this.mistakes = 0; this.hints = 0; this.done = false; this._modal = null; this.paused = false; this.coachTxt = null;
    }
    this.demoed = {};
  }
  create() {
    this.begin(); this.HOW = WRITE_HOW.body; if (this.ambientFx) this.ambientFx.setDepth(0);   // ประกายลอยอยู่หลังกระดาน ไม่รบกวนตอนเขียน
    this.words = this.byUnit ? unitWriteWords(this.unit) : pickWriteWords(this.cat); this.wi = 0; this.makePips(this.words.length, 560);
    // ซ้าย: ภาพ คำ ความหมาย ปุ่มฟัง/ดูวิธีเขียน
    const cc = this.cat.color, ccN = hexN(cc);
    addCard(this, 184, 362, 320, 532, { r: 34, lw: 4, fill: [mixWhite(cc, 0.9), mixWhite(cc, 0.76)], shadow: 9 });
    // กรอบภาพวงกลมขาว + วงจุดไข่ปลาสีประจำหมวด (หมุนช้า ๆ)
    this.add.circle(184, 214, 96, 0xffffff).setStrokeStyle(5, ccN).setDepth(4);
    const dots = this.add.graphics().setDepth(4).setPosition(184, 214); dots.fillStyle(ccN, 0.55); for (let a = 0; a < 360; a += 15) dots.fillCircle(Math.cos(a * Math.PI / 180) * 108, Math.sin(a * Math.PI / 180) * 108, 4);
    this.tweens.add({ targets: dots, angle: 360, duration: 24000, repeat: -1 });
    this.leftC = this.add.container(0, 0).setDepth(5);
    const lb = new KG.ui.Button(this, 184, 506, 268, 56, { label: SPEECH.exists ? 'ฟังคำ' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 24, onClick: () => this.speak(this.word.en) }); lb.setEnabled(SPEECH.exists);
    new KG.ui.Button(this, 184, 576, 268, 56, { label: 'ดูวิธีเขียน', icon: 'eye', style: 'sun', size: 24, onClick: () => { if (!this.done && !this.paused) this.demo(this.li, 0, true); } });
    // กระดาน
    // กระดานแบบสมุดคัด: กระดาษสีครีม ห่วงสันสมุดด้านบน ดาวกับหัวใจเล็ก ๆ ที่มุม
    addCard(this, WB.x + WB.w / 2, WB.y + WB.h / 2, WB.w, WB.h, { r: 30, lw: 4, fill: ['#fffef7', '#fff4de'], shadow: 9 });
    for (let x = WB.x + 66; x < WB.x + WB.w - 40; x += 62) { this.add.circle(x, WB.y + 4, 10, 0xffffff).setStrokeStyle(3.5, 0x2d2a5e).setDepth(5); this.add.circle(x, WB.y + 16, 4, 0x2d2a5e, 0.55).setDepth(5); }
    [['star', WB.x + WB.w - 34, WB.y + WB.h - 30, 0xffc82e], ['heart', WB.x + 30, WB.y + WB.h - 30, 0xff7ab2], ['star', WB.x + WB.w - 30, WB.y + 44, 0x9a5ae8]].forEach(d => { const ic = KG.ui.icon(this, d[0], d[1], d[2], 26, d[3]).setAlpha(0.6).setDepth(5); this.tweens.add({ targets: ic, angle: 12, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); });
    this.tabC = null; this.tiles = [];
    this.gLines = this.add.graphics().setDepth(5); this.gGhost = this.add.graphics().setDepth(6); this.gInk = this.add.graphics().setDepth(7); this.gLive = this.add.graphics().setDepth(8); this.gDemo = this.add.graphics().setDepth(9);
    this.marks = this.add.container(0, 0).setDepth(10);
    this.input.on('pointerdown', (p, over) => this.onDown(p, over)); this.input.on('pointermove', p => this.onMove(p)); this.input.on('pointerup', p => this.onUp(p));
    this.loadWord(0);
  }
  leave() { if (this.byUnit) this.go('Hub', { unit: this.unit.id }); else this.go('WriteMenu'); }
  /* ----- คำใหม่ ----- */
  loadWord(i) {
    this.wi = i; const w = this.word = wd(this.words[i]); this.lay = TKW.layout(w.en); this.li = 0; this.si = 0; this.wordMiss = 0; this.inkDone = [];
    // พื้นที่เส้นบรรทัด: ใต้ป้ายชื่อคำ (y+56) ถึงเหนือแถวป้ายตัวอักษร (y+h-80)
    const L = this.lay, LH = WB.h - 136, U = this.U = Math.min(118, (WB.w - 120) / L.w, LH / 3.2);
    this.ox = WB.x + WB.w / 2 - L.w * U / 2; this.oy = WB.y + 56 + (LH - 3 * U) / 2; this.tol = Math.max(24, U * 0.34);
    this.screenPts = L.letters.map(lt => lt.d.strokes.map(s => ({ dot: s.dot, pts: s.pts.map(q => ({ x: this.ox + (lt.x + q.x) * U, y: this.oy + q.y * U })) })));
    this.leftC.removeAll(true);
    const pc = pic(this, w.pic, 184, 214, 180, 158), sx = pc.scaleX, sy = pc.scaleY; this.leftC.add(pc); pc.setScale(sx * 0.2, sy * 0.2); this.tweens.add({ targets: pc, scaleX: sx, scaleY: sy, duration: 380, ease: 'Back.easeOut' });
    const en = KG.txt(this, 184, 360, w.en, { size: 56, color: this.cat.color, center: true, middle: true, stroke: TKC.ink, sw: 6 }); fitText(en, 290); this.leftC.add(en);
    const th = KG.txt(this, 184, 414, w.th, { size: 25, color: TKC.ink, center: true, middle: true }); fitText(th, 250); this.leftC.add(addCard(this, 184, 414, Math.min(284, th.width * th.scaleX + 40), 42, { r: 21, lw: 3, shadow: 3, fill: ['#ffffff', '#fff8ef'] })); this.leftC.add(th);
    const ct = KG.txt(this, 184, 459, 'คำที่ ' + (i + 1) + ' / ' + this.words.length, { size: 17, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 3 }); this.leftC.add(addCard(this, 184, 459, ct.width + 30, 28, { r: 14, lw: 2.5, shadow: 2, fill: [this.cat.color, shade(this.cat.color, 0.9)] })); this.leftC.add(ct);
    // ป้ายชื่อคำแบบแถบติดสมุด + จำนวนตัว
    if (this.tabC) this.tabC.destroy(true); this.tabC = this.add.container(0, 0).setDepth(6);
    const tt = KG.txt(this, 0, WB.y + 40, 'เขียนคำว่า  ' + w.en, { size: 22, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }), tw = tt.width + 44; tt.x = WB.x + 34 + tw / 2;
    this.tabC.add(addCard(this, tt.x, WB.y + 40, tw, 40, { r: 20, lw: 3, shadow: 3, fill: [this.cat.color, shade(this.cat.color, 0.88)] })); this.tabC.add(tt);
    this.tabC.add(KG.txt(this, WB.x + WB.w - 66, WB.y + 40, L.letters.length + ' ตัวอักษร', { size: 18, color: '#8a84bd', ox: 1, oy: 0.5 }));
    this.buildTiles(w.en);
    this.drawLines(); this.redraw(); this.setPips(i);
    this.say('เขียนคำว่า ' + w.en + ' แปลว่า ' + w.th + ' เริ่มที่จุดสีเขียวแล้วลากตามลูกศรนะ', 'smile');
    this.time.delayedCall(350, () => { if (this.word === w) this.speak(w.en); });
    this.autoDemo();
  }
  // เส้นบรรทัด 4 เส้นแบบสมุดคัดภาษาอังกฤษ: บน (ฟ้า) · กลาง (เส้นประ) · ฐาน (แดง) · ล่าง (ฟ้า) และแถบสีจาง ๆ ช่องตัว x
  drawLines() {
    const g = this.gLines, U = this.U, x0 = WB.x + 30, x1 = WB.x + WB.w - 30, y = k => this.oy + k * U; g.clear();
    g.fillStyle(0xfff4c2, 0.55); g.fillRect(x0, y(1), x1 - x0, U);
    g.lineStyle(3, 0x7fb2ff, 0.9); g.lineBetween(x0, y(0), x1, y(0)); g.lineBetween(x0, y(3), x1, y(3));
    g.lineStyle(3, 0x7fb2ff, 0.9); for (let x = x0; x < x1; x += 24) g.lineBetween(x, y(1), Math.min(x + 13, x1), y(1));
    g.lineStyle(4, 0xff4f7b, 1); g.lineBetween(x0, y(2), x1, y(2));
    g.fillStyle(0xff4f7b, 1); g.fillCircle(x0, y(2), 5); g.fillCircle(x1, y(2), 5);
  }
  // แถวป้ายตัวอักษรใต้บรรทัด: เขียนแล้ว = สีหมึกของตัวนั้น · กำลังเขียน = ขอบสีกะพริบ · ยังไม่ถึง = จาง (บอกความคืบหน้าในคำ)
  buildTiles(word) {
    this.tiles.forEach(t => t.c.destroy(true)); this.tiles = [];
    const n = word.replace(/ /g, '').length, gaps = (word.match(/ /g) || []).length, s = Math.min(46, (WB.w - 120) / (n + gaps * 0.5) - 8), y = WB.y + WB.h - 40;
    let x = WB.x + WB.w / 2 - (n * (s + 8) - 8 + gaps * s * 0.5) / 2, li = 0;
    for (const ch of word) {
      if (ch === ' ') { x += s * 0.5; continue; }
      const c = this.add.container(x + s / 2, y).setDepth(6), g = this.add.graphics(), t = KG.txt(this, 0, 0, ch, { size: Math.round(s * 0.62), color: TKC.ink, center: true, middle: true });
      c.add([g, t]); this.tiles.push({ c, g, t, s, li: li++ }); x += s + 8;
    }
  }
  drawTiles() {
    this.tiles.forEach(T => {
      const { g, t, s, li } = T, done = li < this.li, cur = li === this.li, col = hexN(INK_COLS[li % INK_COLS.length]); g.clear();
      g.fillStyle(0x2d2a5e, 0.25).fillRoundedRect(-s / 2, -s / 2 + 3, s, s, 12);
      g.fillStyle(done ? col : cur ? 0xffffff : 0xefeaff, 1).fillRoundedRect(-s / 2, -s / 2, s, s, 12);
      g.lineStyle(cur ? 4 : 2.5, cur ? col : 0x2d2a5e, cur ? 1 : 0.6).strokeRoundedRect(-s / 2, -s / 2, s, s, 12);
      t.setColor(done ? '#ffffff' : cur ? TKC.ink : '#b3abd9');
      this.tweens.killTweensOf(T.c); T.c.setScale(1); if (cur) this.tweens.add({ targets: T.c, scaleX: 1.12, scaleY: 1.12, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }
  // แปรงหัวกลม: วาดเส้นเป็นท่อนพร้อมวงกลมที่จุด (ข้อต่อเรียบ)
  brush(g, pts, w, color, alpha) {
    g.lineStyle(w, color, alpha == null ? 1 : alpha); g.fillStyle(color, alpha == null ? 1 : alpha);
    if (pts.length === 1) { g.fillCircle(pts[0].x, pts[0].y, w * 0.62); return; }
    g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.strokePath();
    for (let i = 0; i < pts.length; i += 2) g.fillCircle(pts[i].x, pts[i].y, w / 2); g.fillCircle(pts[pts.length - 1].x, pts[pts.length - 1].y, w / 2);
  }
  ink(g, pts, li) { const U = this.U, col = hexN(INK_COLS[li % INK_COLS.length]); this.brush(g, pts, U * 0.2, 0x2d2a5e, 1); this.brush(g, pts, U * 0.13, col, 1); if (pts.length > 1) this.brush(g, pts.filter((q, i) => i % 2 === 0), U * 0.035, 0xffffff, 0.45); }
  // วาดรอยจาง ตัวที่เขียนแล้ว และเส้นนำทางของตัวปัจจุบัน
  redraw() {
    const U = this.U, gh = this.gGhost, gi = this.gInk; gh.clear(); gi.clear(); this.marks.removeAll(true); this.drawTiles();
    this.screenPts.forEach((strokes, li) => strokes.forEach((s, si) => {
      const doneS = li < this.li || (li === this.li && si < this.si);
      if (doneS) this.ink(gi, s.pts, li);
      else if (li === this.li) { this.brush(gh, s.pts, U * 0.26, 0xcbb8ff, 0.85); if (!s.dot) for (let k = 0; k < s.pts.length; k += 3) gh.fillStyle(0xffffff, 0.95).fillCircle(s.pts[k].x, s.pts[k].y, U * 0.022); }
      else this.brush(gh, s.pts, U * 0.17, 0xdcd6f0, 0.75);
    }));
    if (this.li >= this.screenPts.length) return;
    const cur = this.screenPts[this.li];
    cur.forEach((s, si) => { if (si < this.si) return; const p0 = s.pts[0], active = si === this.si, r = Math.max(13, U * (active ? 0.12 : 0.085));
      const m = this.add.container(p0.x, p0.y); m.add(this.add.circle(0, 0, r, active ? 0x22c55e : 0xffffff).setStrokeStyle(3, 0x2d2a5e)); m.add(KG.txt(this, 0, 0, String(si + 1), { size: Math.round(r * 1.25), color: active ? '#ffffff' : '#6a64a0', center: true, middle: true }));
      this.marks.add(m); if (active) this.tweens.add({ targets: m, scaleX: 1.22, scaleY: 1.22, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); });
    const s = cur[this.si]; if (s && !s.dot) this.arrows(gh, s.pts);
  }
  // ลูกศรบอกทิศบนเส้นที่ต้องเขียน
  arrows(g, pts) {
    const U = this.U, step = Math.max(6, Math.round(0.42 / 0.04)), sz = Math.max(8, U * 0.075); g.fillStyle(0x8a5cf0, 0.95);
    for (let i = step; i < pts.length - 3; i += step) {
      const a = pts[i - 1], b = pts[i + 1], ang = Math.atan2(b.y - a.y, b.x - a.x), p = pts[i], c = Math.cos(ang), sn = Math.sin(ang);
      g.fillTriangle(p.x + c * sz, p.y + sn * sz, p.x - c * sz * 0.7 - sn * sz * 0.8, p.y - sn * sz * 0.7 + c * sz * 0.8, p.x - c * sz * 0.7 + sn * sz * 0.8, p.y - sn * sz * 0.7 - c * sz * 0.8);
    }
  }
  /* ----- ดูวิธีเขียน: ปากกาสีทองวิ่งตามเส้นทีละเส้น ----- */
  autoDemo() { const lt = this.lay.letters[this.li]; if (lt && !this.demoed[lt.ch]) { this.demoed[lt.ch] = 1; this.time.delayedCall(700, () => { if (!this.done && this.lay.letters[this.li] === lt && !this.tracing) this.demo(this.li, this.si, false); }); } }
  demo(li, fromS, all) {
    if (this.demoing) return; const strokes = this.screenPts[li]; if (!strokes) return; this.demoing = true; this.demoId = (this.demoId || 0) + 1; const id = this.demoId, U = this.U, g = this.gDemo;
    const pen = this.add.container(0, 0).setDepth(11); pen.add(this.add.circle(0, 0, Math.max(10, U * 0.1), 0xffd34f).setStrokeStyle(3, 0x2d2a5e)); this.demoPen = pen;
    const list = all ? strokes.map((s, k) => k) : [fromS]; let k = 0;
    const next = () => {
      if (this.demoId !== id) return;
      if (k >= list.length) { this.time.delayedCall(350, () => { if (this.demoId === id) this.stopDemo(); }); return; }
      const s = strokes[list[k]], n = s.pts.length; g.clear(); KG.audio.play('tick', { p: 1 + k * 0.1 });
      if (s.dot) { pen.setPosition(s.pts[0].x, s.pts[0].y); this.brush(g, s.pts, U * 0.14, 0xffb800, 0.9); k++; this.time.delayedCall(450, next); return; }
      this.tweens.addCounter({ from: 0, to: n - 1, duration: Math.max(500, n * 13), ease: 'Sine.easeInOut', onUpdate: tw => { if (this.demoId !== id) return; const i = Math.round(tw.getValue()); pen.setPosition(s.pts[i].x, s.pts[i].y); g.clear(); this.brush(g, s.pts.slice(0, i + 1), U * 0.14, 0xffb800, 0.9); },
        onComplete: () => { k++; this.time.delayedCall(220, next); } });
    };
    this.say(all ? 'ดูนะ ตัว ' + this.lay.letters[li].ch + ' เขียนตามลำดับเส้น 1 › 2 › 3' : 'ดูนะ เริ่มที่จุดสีเขียว แล้วลากตามลูกศร', 'open'); next();
  }
  stopDemo() { this.demoId = (this.demoId || 0) + 1; this.demoing = false; this.gDemo.clear(); if (this.demoPen) { this.demoPen.destroy(); this.demoPen = null; } }
  hint() { if (this.done) return; this.hints++; this.stopDemo(); this.demo(this.li, this.si, false); }
  /* ----- เขียน ----- */
  stroke() { const L = this.screenPts[this.li]; return L ? L[this.si] : null; }
  onDown(p, over) {
    if (this.done || this.paused || this._modal || (over && over.length)) return;
    if (this.demoing) this.stopDemo();
    const s = this.stroke(); if (!s || !inBox(p.worldX, p.worldY, WB)) return;
    const d0 = Math.hypot(p.worldX - s.pts[0].x, p.worldY - s.pts[0].y);
    if (s.dot) { if (d0 <= this.tol * 1.5) this.strokeDone(); else this.say('จุดอยู่ตรงวงกลมสีเขียวนะ แตะที่จุดนั้นได้เลย', 'smile'); return; }
    if (d0 > this.tol * 1.3) { this.say('เริ่มที่จุดสีเขียวหมายเลข ' + (this.si + 1) + ' นะ', 'smile'); KG.audio.play('tap'); this.flashStart(); return; }
    this.tracing = true; this.idx = 0; this.drawLive();
  }
  onMove(p) {
    if (!this.tracing) return; const s = this.stroke(), pts = s.pts, x = p.worldX, y = p.worldY, end = Math.min(pts.length - 1, this.idx + 14); let best = -1, dMin = 1e9;
    for (let j = this.idx; j <= end; j++) { const d = Math.hypot(x - pts[j].x, y - pts[j].y); if (d < dMin) dMin = d; if (d <= this.tol && j > best) best = j; }
    if (best > this.idx) { this.idx = best; this.drawLive(); if (this.idx >= pts.length - 2) { this.tracing = false; this.strokeDone(); } return; }
    if (dMin > this.tol * 2.1) this.strokeFail('ออกนอกเส้นนิดนึง ลองใหม่จากจุดสีเขียวนะ');
  }
  onUp() {
    if (!this.tracing) return; this.tracing = false; const n = this.stroke().pts.length;
    if (this.idx >= n * 0.9) this.strokeDone(); else if (this.idx > 4) this.strokeFail('ลากต่อให้สุดเส้นนะ ลองใหม่จากจุดสีเขียว'); else { this.gLive.clear(); }
  }
  drawLive() { const g = this.gLive, s = this.stroke(); g.clear(); if (!s) return; this.ink(g, s.pts.slice(0, this.idx + 1), this.li); const q = s.pts[this.idx]; g.fillStyle(0xffffff, 1).fillCircle(q.x, q.y, this.U * 0.07); g.lineStyle(3, 0x2d2a5e, 1).strokeCircle(q.x, q.y, this.U * 0.07); }
  flashStart() { const s = this.stroke(); if (s) KG.fx.ring(this, s.pts[0].x, s.pts[0].y, 0x22c55e, { size: 0.5, w: 0.45, depth: 12 }); }
  strokeFail(msg) {
    this.tracing = false; this.gLive.clear(); this.mistakes++; this.wordMiss++; this.letterMiss = true; this.bad(null); KG.fx.shake(this, 120, 0.003); this.say(msg, 'sad'); this.flashStart();
  }
  strokeDone() {
    const s = this.stroke(), q = s.pts[s.pts.length - 1]; this.gLive.clear(); this.si++; KG.audio.play('pop'); KG.fx.burst(this, q.x, q.y, { colors: [0xffd34f, 0xffffff, hexN(INK_COLS[this.li % INK_COLS.length])], n: 7, max: 140, depth: 20 });
    if (this.si >= this.screenPts[this.li].length) { this.letterDone(); return; }
    this.redraw(); this.say('ดีมาก! ต่อด้วยเส้นที่ ' + (this.si + 1) + ' เริ่มที่จุดสีเขียว', 'smile');
  }
  letterDone() {
    const li = this.li, lt = this.lay.letters[li], pts = [].concat(...this.screenPts[li].map(s => s.pts)), cx = pts.reduce((a, q) => a + q.x, 0) / pts.length, cy = pts.reduce((a, q) => a + q.y, 0) / pts.length;
    const clean = !this.letterMiss; this.letterMiss = false; this.li++; this.si = 0; this.redraw();
    if (clean) this.good(cx, cy); else { KG.audio.play('good'); KG.fx.burst(this, cx, cy, { colors: [0xffd34f, 0xffffff], n: 10, max: 180, depth: 20 }); }
    const T = this.tiles[li]; if (T) { this.tweens.add({ targets: T.c, angle: { from: -16, to: 0 }, duration: 380, ease: 'Back.easeOut' }); KG.fx.burst(this, T.c.x, T.c.y, { colors: [hexN(INK_COLS[li % INK_COLS.length]), 0xffffff, 0xffd34f], n: 9, max: 120, depth: 20 }); }
    SPEECH.say(lt.ch);   // อ่านแค่ชื่อตัวอักษร (speech.js แปลงตัวเดี่ยวเป็นชื่อตัว ไม่พูดว่า capital)
    if (this.li >= this.lay.letters.length) { this.time.delayedCall(260, () => this.wordDone()); return; }
    this.say('ตัว ' + lt.ch + ' สวยมาก! ต่อด้วยตัว ' + this.lay.letters[this.li].ch, 'happy'); this.autoDemo();
  }
  wordDone() {
    const w = this.word, perfect = this.wordMiss === 0; SAVE.data.wrote = SAVE.data.wrote || {}; SAVE.data.wrote[w.id] = 1; SAVE.save(); this.setPips(this.wi + 1);
    KG.audio.play(perfect ? 'perfect' : 'fanfare'); KG.fx.confetti(this, { ms: 700 }); KG.banner(this, perfect ? 'PERFECT!' : 'GREAT!', perfect ? '#ffd34f' : '#ffffff', 1, 300);
    this.time.delayedCall(450, () => this.speak(w.en)); this.leftC.list.forEach(o => this.tweens.add({ targets: o, y: o.y - 14, duration: 160, yoyo: true, ease: 'Quad.easeOut' }));
    this.say((perfect ? 'เขียนคำว่า ' + w.en + ' ได้สวยไม่พลาดเลย! ' : 'เขียนคำว่า ' + w.en + ' ครบแล้ว! ') + 'แปลว่า ' + w.th, 'happy');
    this.time.delayedCall(1900, () => { if (this.done) return; if (this.wi + 1 < this.words.length) this.loadWord(this.wi + 1); else this.finish(); });
  }
  starsFor(m, h) { const pen = m + h; return pen <= 2 ? 3 : pen <= 6 ? 2 : 1; }
  finish() {
    if (this.done) return;
    if (this.byUnit) { this.stopDemo(); this.finishTip = WRITE_TIP; super.finish([], 'คำที่เขียน: ' + this.words.map(k => wd(k).en).join(' · ')); return; }   // ดาวของหน่วย ปุ่มไปกิจกรรมถัดไป
    this.done = true; this.stopDemo();
    const stars = this.starsFor(this.mistakes, this.hints), best = (SAVE.data.write || {})[this.cat.id] || 0; SAVE.data.write = SAVE.data.write || {}; if (stars > best) SAVE.data.write[this.cat.id] = stars; SAVE.save();
    KG.audio.play('win'); KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 160); this.say('เก่งมาก! เขียนครบทุกคำแล้ว', 'trophy');
    const i = WRITE_CATS.indexOf(this.cat), nx = WRITE_CATS[(i + 1) % WRITE_CATS.length];
    const body = (stars === 3 ? 'สมบูรณ์แบบ! เขียนตามลำดับเส้นได้แม่นมาก' : stars === 2 ? 'ดีมาก! ลองอีกครั้งให้พลาดน้อยลงจะได้ 3 ดาว' : 'เขียนครบแล้ว! ฝึกอีกนิดจะเขียนได้สวยขึ้น') + '\nคำที่เขียน: ' + this.words.map(k => wd(k).en).join(' · ');
    this.time.delayedCall(900, () => KG.results(this, {
      stat: { lvl: 'write:' + this.cat.id, stars, m: this.mistakes, h: this.hints, secs: Math.round((Date.now() - this._t0) / 1000), practice: false },
      win: true, stars, title: 'เขียนหมวด' + this.cat.th + ' สำเร็จ!', body,
      rows: [['พลาด', this.mistakes + ' ครั้ง'], ['ใช้คำใบ้', this.hints + ' ครั้ง'], ['คอมโบสูงสุด', (this.bestCombo || 0) + ' ตัว']],
      tip: WRITE_TIP,
      buttons: [{ label: 'เลือกหมวด', style: 'ghost', icon: 'flag', onClick: () => this.leave() }, { label: 'เขียนอีกครั้ง', style: 'cyan', icon: 'reset', onClick: () => this.go('Write', this._restartData) },
        { label: 'หมวด' + nx.th, style: 'primary', icon: 'play', pulse: true, onClick: () => this.go('Write', { cat: nx.id }) }]
    }));
  }
}
