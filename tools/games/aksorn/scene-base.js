/* ===== Techno Aksorn: ตัวช่วยกลางและโครงฉากกิจกรรม (ActBase) =====
   ทุกกิจกรรมสืบจาก ActBase: พื้นหลังเวกเตอร์ · หัวฉาก · แถบโค้ชไรเดอร์ครึ่งตัว (บอกโจทย์) · ปุ่มใบ้ · พักเกม · สรุปผล + ดาว + เหรียญ + สถิติ
   ตำแหน่งตายตัว 1280x720: หัวฉาก y0-76 · พื้นที่เล่น y88-632 · แถบโค้ช y640-712 */
const TKC = { ink: '#2d2a5e', pink: '#ff5aa6', purple: '#8a5cf0', blue: '#3d8bff', teal: '#17c4a8', yellow: '#ffc82e', orange: '#ff8a1e', green: '#3fb54a', red: '#ee4a4a' };
const PLAY = { x: 24, y: 88, w: 1232, h: 544 };
const MOOD_POSE = { smile: 'point', happy: 'cheer', sad: 'magnifier', open: 'tablet' };
const THAI_FONT = "Mali, Kanit, 'Noto Sans Thai', Tahoma, sans-serif";
const snapW = n => [100, 150, 220, 320, 460, 640].find(v => v >= n) || 640;
function pic(scene, spec, x, y, w, h) { h = h || w; const tw = snapW(w * 1.1), th = Math.max(8, Math.round(tw * h / w)); return scene.add.image(x, y, picTex(scene, spec, tw, th)).setDisplaySize(w, h); }
function purgeTex(scene) { scene.textures.getTextureKeys().filter(k => k.startsWith('ui:tk|')).forEach(k => { try { scene.textures.remove(k); } catch (e) { /* ไม่เป็นไร */ } }); }
function cardTex(scene, w, h, o) {
  o = o || {}; const r = o.r == null ? 22 : o.r, lw = o.lw || 4, sh = o.shadow == null ? 8 : o.shadow, fill = o.fill || ['#ffffff', '#f6f0ff'], edge = o.edge || TKC.ink, m = 12;
  const key = ['card', w, h, r, lw, sh, fill.join(), edge, o.band ? o.band.h + o.band.color : '', o.dash ? 1 : 0].join('|');
  const k = KG.tex(scene, key, w + m * 2, h + m * 2 + sh, c => {
    c.translate(m, m); c.lineJoin = 'round';
    if (sh) { KG.ui.rrect(c, 0, sh, w, h, r); c.fillStyle = 'rgba(45,42,94,.30)'; c.fill(); }
    KG.ui.rrect(c, 0, 0, w, h, r); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, fill[0]); g.addColorStop(1, fill[1]); c.fillStyle = g; c.fill();
    if (o.band) { c.save(); KG.ui.rrect(c, 0, 0, w, h, r); c.clip(); c.fillStyle = o.band.color; c.fillRect(0, 0, w, o.band.h); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(0, 0, w, Math.min(8, o.band.h / 3)); c.restore(); }
    if (o.dash) c.setLineDash([12, 9]);
    KG.ui.rrect(c, lw / 2, lw / 2, w - lw, h - lw, r); c.lineWidth = lw; c.strokeStyle = edge; c.stroke();
  });
  return { key: k, m, w, h, sh };
}
function addCard(scene, x, y, w, h, o) { const t = cardTex(scene, w, h, o); return scene.add.image(x, y + t.sh / 2, t.key).setDisplaySize(w + t.m * 2, h + t.m * 2 + t.sh); }
const fitText = (t, maxW) => { t.setScale(1); if (t.width > maxW) t.setScale(maxW / t.width); return t; };
const inBox = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
// ตัวอักษรไทยแบบมีหัว (ฟอนต์ Mali) จัดกึ่งกลาง เผื่อที่ด้านบนสำหรับสระบน/วรรณยุกต์
const MARK_RE = /[–ัิีึืุู็่้๊๋์ํ]/;
const FONT_MARK = "Sarabun, Kanit, 'Noto Sans Thai', sans-serif";
function glyph(scene, x, y, text, size, color, o) {
  o = o || {}; const mk = MARK_RE.test(text);      // ข้อความที่มีเครื่องหมายสระ/วรรณยุกต์/ขีดแทนพยัญชนะ ใช้ Sarabun (เครื่องหมายโค้งแบบมาตรฐาน ใน Mali เป็นรูปเหลี่ยม) พยัญชนะล้วนใช้ Mali (มีหัว)
  const t = scene.add.text(x, y, text, { fontFamily: mk ? FONT_MARK : THAI_FONT, fontStyle: mk ? 'bold' : 'normal', fontSize: size + 'px', color: color || TKC.ink, resolution: KG.K, padding: { left: 6, right: 6, top: Math.ceil(size * (mk ? 0.8 : 0.45)), bottom: Math.ceil(size * 0.3) }, stroke: o.stroke || undefined, strokeThickness: o.sw || 0 });
  t.setOrigin(0.5, 0.5); if (mk) t.y -= Math.round(size * 0.175);      // ชดเชยช่องว่างด้านบนที่เพิ่มให้เครื่องหมายสระสูง ไม่ให้ตัวอักษรเลื่อนลง
  return t;
}
// ลากได้ (Phaser drag) แตะโดยไม่ลาก = tap · ตัดสินจุดวางจากปลายนิ้ว
function dragify(scene, obj, w, h, cb) {
  if (obj.type === 'Container') obj.setSize(w, h);
  obj.setInteractive({ useHandCursor: true, draggable: true }); obj._moved = false;
  obj.on('dragstart', p => { obj._moved = true; if (cb.start) cb.start(p); });
  obj.on('drag', (p, dx, dy) => { obj.x = dx; obj.y = dy; if (cb.move) cb.move(dx, dy, p); });
  obj.on('dragend', p => { if (cb.drop) cb.drop(p.worldX, p.worldY, p); });
  obj.on('pointerdown', () => { obj._moved = false; });
  obj.on('pointerup', () => { if (!obj._moved && cb.tap) cb.tap(); });
  return obj;
}
const BG_OF_LEVEL = ['meadow', 'meadow', 'sunset', 'dusk'];

class ActBase extends KG.Scene {
  init(data) {
    data = data || {}; this.lessonId = data.lesson || 'c1'; this.lesson = lessonOf(this.lessonId) || null; this.lv = SAVE.data.level || 0; this.A = AK.ACT_META[this.ACT] || { th: '', color: '#3d8bff' };
    this.back = data.back || 'Lesson'; this._restartData = Object.assign({}, data); this.mistakes = 0; this.hints = 0; this.done = false; this._modal = null; this.paused = false; this.coachTxt = null;
  }
  begin() {
    this.setup(); KG.audio.music(['sunny', 'sunny', 'bounce', 'breeze'][this.lv] || 'sunny'); this._t0 = Date.now();
    this.input.dragDistanceThreshold = 8;
    this.add.image(GW / 2, GH / 2, bgTex(this, BG_OF_LEVEL[this.lv] || 'meadow')).setDisplaySize(GW, GH);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.18);
    this.events.once('shutdown', () => { SPEECH.stop(); purgeTex(this); });
    this.buildHeader(); this.buildCoach();
    this.onEscape = () => this.pause();
  }
  title() { return (this.lesson ? this.lesson.th : 'บ้านคัดลายมือ'); }
  buildHeader() {
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52 });
    this.txt(100, 6, this.title(), { size: 18, color: KG.SKIN.hi, stroke: true, sw: 4 });
    this.txt(100, 26, this.A.th, { size: 32, stroke: true });
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => this.help(), { w: 56, h: 52 });
    if (SPEECH.exists) {
      const vb = new KG.ui.Button(this, GW - 396, 40, 120, 44, { label: SAVE.data.voice !== false ? 'เสียง เปิด' : 'เสียง ปิด', icon: SAVE.data.voice !== false ? 'sound' : 'mute', style: 'ghost', size: 17, slant: 8, onClick: () => { SAVE.data.voice = SAVE.data.voice === false; SAVE.save(); vb.setLabel(SAVE.data.voice !== false ? 'เสียง เปิด' : 'เสียง ปิด'); vb.icon.setTexture(KG.ui.iconKey(this, SAVE.data.voice !== false ? 'sound' : 'mute')); if (SAVE.data.voice !== false) SPEECH.say('สวัสดี'); else SPEECH.stop(); } });
    }
  }
  makePips(n, x0, gap) { this.pipObjs = []; const x = x0 == null ? 520 : x0, g = gap || 30; for (let i = 0; i < n; i++) { const c = this.add.circle(x + i * g, 40, 11, 0xffffff).setStrokeStyle(3, 0x2d2a5e); this.pipObjs.push(c); } }
  setPips(done) { (this.pipObjs || []).forEach((c, i) => { c.setFillStyle(i < done ? 0xffc82e : 0xffffff); if (i === done - 1) this.tweens.add({ targets: c, scaleX: 1.5, scaleY: 1.5, duration: 160, yoyo: true }); }); }
  buildCoach() {
    KG.ui.panel(this, 24, 640, 1232, 72, { accent: TKC.purple, accent2: TKC.pink, cuts: [16, 0, 16, 0], shadow: 5 }).setDepth(2);
    this.mascot = this.add.image(84, 600, 'mascot_point').setOrigin(0.5, 0).setDepth(4); this.mascotH = 240; this.setPose('point');
    this.coachTxt = KG.txt(this, 178, 676, '', { size: 24, oy: 0.5, color: TKC.ink }).setDepth(3);
    this.hintBtn = new KG.ui.Button(this, 1148, 677, 190, 52, { label: 'ใบ้', icon: 'bulb', style: 'sun', size: 22, slant: 8, onClick: () => { if (!this.done && !this.paused) this.hint(); } }).setDepth(3);
  }
  setPose(name) {
    if (!this.mascot || !this.textures.exists('mascot_' + name)) return;
    this.mascot.setTexture('mascot_' + name); this.mascot.setScale(Math.min(this.mascotH / this.mascot.height, 150 / this.mascot.width)); this.mascot.setFlipX(name === 'point'); this.pose = name;
    this.mascotY = Math.round(GH - 0.56 * this.mascot.displayHeight); this.mascot.y = this.mascotY;   // เห็นครึ่งตัวบน
  }
  say(th, mood) {
    if (!this.coachTxt) return; this.coachTxt.setText(KG.wrap(th, 820, '600 24px Kanit')); this.coachTxt.setScale(1);
    const lines = this.coachTxt.text.split(String.fromCharCode(10)).length; this.coachTxt.setFontSize(lines > 2 ? 18 : lines > 1 ? 21 : 24);
    this.setPose(MOOD_POSE[mood || 'smile'] || mood);
    this.tweens.killTweensOf(this.mascot); this.mascot.y = this.mascotY; this.tweens.add({ targets: this.mascot, y: this.mascotY - 12, duration: 130, yoyo: true, ease: 'Quad.easeOut' });
  }
  speak(t) { SPEECH.say(t); }
  good(x, y) { KG.audio.play('good'); if (x != null) KG.fx.burst(this, x, y, { colors: [0xffd34f, 0xff7ab2, 0x4ef4d2, 0xffffff], n: 16, max: 220, depth: 3000 }); }
  bad(obj) { KG.audio.play('error'); if (obj) this.tweens.add({ targets: obj, x: obj.x + 8, duration: 50, yoyo: true, repeat: 3 }); }
  homeBack(c, shake) { c.setScale(1); this.tweens.add({ targets: c, x: c.home.x, y: c.home.y, duration: 220, ease: 'Back.easeOut', onComplete: () => { c.setDepth(10); if (shake) this.tweens.add({ targets: c, x: c.home.x + 7, duration: 45, yoyo: true, repeat: 3, onComplete: () => { c.x = c.home.x; } }); } }); }
  help() { KG.howTo(this, { title: this.A.th, body: this.HOW || this.A.desc }); }
  hint() { }
  leave() { this.go(this.back, { lesson: this.lessonId, zone: this.lesson ? this.lesson.zone : 'write' }); }
  pause() { if (this.paused || this._modal || this.done) return; this.paused = true; KG.pauseMenu(this, { onExit: () => this.leave(), onRestart: () => this.go(this.scene.key, this._restartData), onResume: () => { this.paused = false; } }); }
  starsFor(m, h) { return AK.starsFor(m, h); }
  // จบกิจกรรม: บันทึกดาวที่ดีที่สุด ให้เหรียญ ส่งสถิติ แสดงสรุปผล
  finish(rows, extra) {
    if (this.done) return; this.done = true;
    const stars = this.starsFor(this.mistakes, this.hints), key = akey(this.lessonId, this.ACT), best = SAVE.data.stars[key] || 0, coins = AK.coinsFor(stars, best);
    if (stars > best) SAVE.data.stars[key] = stars; SAVE.data.coins = (SAVE.data.coins || 0) + coins; SAVE.data.plays = (SAVE.data.plays || 0) + 1; SAVE.save();
    KG.audio.play('win'); KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 160); SPEECH.stop();
    this.say('เก่งมาก! ได้ ' + stars + ' ดาว และ ' + coins + ' เหรียญ', 'trophy');
    const acts = this.lesson ? AK.activities(this.lesson, this.lv) : [], i = acts.indexOf(this.ACT), nxt = i >= 0 ? acts[i + 1] : null;
    const buttons = [{ label: 'กลับบทเรียน', style: 'ghost', icon: 'flag', onClick: () => this.leave() }, { label: 'เล่นอีกครั้ง', style: 'cyan', icon: 'reset', onClick: () => this.go(this.scene.key, this._restartData) }];
    if (nxt) buttons.push({ label: AK.ACT_META[nxt].th, style: 'primary', icon: 'play', pulse: true, onClick: () => this.go(ACT_SCENE[nxt], { lesson: this.lessonId, act: nxt }) });
    this.time.delayedCall(900, () => KG.results(this, {
      stat: { lvl: key, stars, m: this.mistakes, h: this.hints, secs: Math.round((Date.now() - this._t0) / 1000), practice: false },
      win: true, stars, title: this.A.th + ' สำเร็จ!', body: (stars === 3 ? 'สมบูรณ์แบบ!' : stars === 2 ? 'ดีมาก! เล่นอีกครั้งให้ได้ 3 ดาว' : 'ผ่านแล้ว! ลองอีกครั้งเพื่อเก็บดาวเพิ่ม') + (extra ? String.fromCharCode(10) + extra : ''),
      rows: [['พลาด', this.mistakes + ' ครั้ง'], ['ใช้คำใบ้', this.hints + ' ครั้ง'], ['ได้เหรียญ', '+' + coins + ' (มี ' + SAVE.data.coins + ')']].concat(rows || []), buttons
    }));
  }
}
// ชื่อฉากของแต่ละกิจกรรม
const ACT_SCENE = { learn: 'Learn', trace: 'Trace', listen: 'Listen', match: 'Match', balloon: 'Shooter', fish: 'Shooter', memory: 'Memory', classsort: 'Sort', lengthsort: 'Sort', compose: 'Compose', change: 'Change',
  tlisten: 'Quiz', tname: 'Quiz', mlisten: 'Quiz', mpic: 'Quiz', mfill: 'Quiz', slisten: 'Quiz', spic: 'Quiz', sheard: 'Quiz', sfill: 'Quiz', tsort: 'Sort', msort: 'Sort', sbuild: 'Order', sletters: 'Order', sentbuild: 'Order' };
