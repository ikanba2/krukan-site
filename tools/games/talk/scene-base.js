/* ===== Techno Talk: ตัวช่วยกลางและโครงฉากกิจกรรม (ActBase) =====
   ทุกกิจกรรม (เรียน จัดกลุ่ม โยงเส้น เปิดป้าย ลากวาง ถามตอบ) สืบจาก ActBase: พื้นหลังเวกเตอร์ตามระดับ · หัวฉาก · แถบโค้ช (ทอมคอยบอก) · ปุ่มใบ้ · พักเกม · สรุปผล+ดาว+เก็บสถิติ
   ทุกตำแหน่งตายตัวในหน่วยออกแบบ 1280x720: หัวฉาก y0-76 · พื้นที่เล่น y88-632 · แถบโค้ช y640-712 */
const TKC = { ink: '#2d2a5e', pink: '#ff5aa6', purple: '#8a5cf0', blue: '#3d8bff', teal: '#17c4a8', yellow: '#ffc82e', orange: '#ff8a1e', green: '#3fb54a', red: '#ee4a4a' };
const PLAY = { x: 24, y: 88, w: 1232, h: 544 };
const UNIT_TIP = {
  pron: 'I = ฉัน · you = เธอ · he = เขา · she = เธอ (ผู้หญิง) · it = มัน · we = พวกเรา · they = พวกเขา',
  be: 'I ใช้ am · he she it ใช้ is · you we they ใช้ are', like: 'he she it ต้องเติม s ที่กริยา (likes) · I you we they ไม่เติม s (like)',
  verb: 'he she it ต้องเติม s (runs) · I you we they ไม่เติม s (run)', have: 'he she it ใช้ has · I you we they ใช้ have', can: 'หลัง can ใช้กริยาที่ไม่เติม s เสมอ เช่น He can swim.',
  eat: 'he she it ต้องเติม s (eats drinks) · I you we they ไม่เติม s', day: 'กิจวัตร: wake up · brush teeth · take a bath · go to school · do homework · go to bed',
  do: 'ถามด้วย Do (I you we they) หรือ Does (he she it) และกริยาตามหลังไม่เติม s', 'be-q': 'ถามด้วย Am / Is / Are ขึ้นก่อนประธาน ตอบ Yes, ... am/is/are หรือ No, ... not',
  not: 'ปฏิเสธ: am/is/are + not · do not / does not + กริยา', wh: 'Where = ที่ไหน · What = อะไร'
};
const MOOD_POSE = { smile: 'point', happy: 'cheer', sad: 'magnifier', open: 'tablet' };
const snapW = n => [100, 150, 220, 320, 460, 640].find(v => v >= n) || 640;
const bareTok = t => String(t).replace(/[.,?!]/g, '').toLowerCase();

// วางภาพจาก spec ตรงกลางที่ (x,y) ขนาด w×h (เท็กซ์เจอร์ปัดขนาดเป็นขั้นเพื่อแคชซ้ำได้)
function pic(scene, spec, x, y, w, h) {
  h = h || w; const tw = snapW(w * 1.1), th = Math.max(8, Math.round(tw * h / w));
  return scene.add.image(x, y, picTex(scene, spec, tw, th)).setDisplaySize(w, h);
}
function purgeTex(scene) { scene.textures.getTextureKeys().filter(k => k.startsWith('ui:tk|')).forEach(k => { try { scene.textures.remove(k); } catch (e) { /* ไม่เป็นไร */ } }); }

// การ์ดมุมมนขอบหมึกหนา มีเงาแข็งด้านล่าง (o: fill, edge, r, lw, shadow, band {h,color}, dash)
function cardTex(scene, w, h, o) {
  o = o || {}; const r = o.r == null ? 22 : o.r, lw = o.lw || 4, sh = o.shadow == null ? 8 : o.shadow, fill = o.fill || ['#ffffff', '#f6f0ff'], edge = o.edge || TKC.ink, m = 12;
  const key = ['card', w, h, r, lw, sh, fill.join(), edge, o.band ? o.band.h + o.band.color : '', o.dash ? 1 : 0, o.shadowCol || ''].join('|');
  const k = KG.tex(scene, key, w + m * 2, h + m * 2 + sh, c => {
    c.translate(m, m); c.lineJoin = 'round';
    if (sh) { KG.ui.rrect(c, 0, sh, w, h, r); c.fillStyle = o.shadowCol || 'rgba(45,42,94,.30)'; c.fill(); }
    KG.ui.rrect(c, 0, 0, w, h, r); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, fill[0]); g.addColorStop(1, fill[1]); c.fillStyle = g; c.fill();
    if (o.band) { c.save(); KG.ui.rrect(c, 0, 0, w, h, r); c.clip(); c.fillStyle = o.band.color; c.fillRect(0, 0, w, o.band.h); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(0, 0, w, Math.min(8, o.band.h / 3)); c.restore(); }
    if (o.dash) c.setLineDash([12, 9]);
    KG.ui.rrect(c, lw / 2, lw / 2, w - lw, h - lw, r); c.lineWidth = lw; c.strokeStyle = edge; c.stroke();
  });
  return { key: k, m, w, h, sh };
}
function addCard(scene, x, y, w, h, o) { const t = cardTex(scene, w, h, o); return scene.add.image(x, y + t.sh / 2, t.key).setDisplaySize(w + t.m * 2, h + t.m * 2 + t.sh); }
const fitText = (t, maxW) => { t.setScale(1); if (t.width > maxW) t.setScale(maxW / t.width); return t; };
const colN = hex => Phaser.Display.Color.HexStringToColor(hex).color;
// ป้ายชื่อฉากทรงแคปซูลมุมมนที่หัวจอ (ไอคอนในวงกลม + บรรทัดเล็กบอกหน่วย/ระดับ + ชื่อฉาก) ใช้ทุกหน้าให้หน้าตาเดียวกัน
function cuteTitle(scene, sub, title, color, icon, maxW) {
  const x0 = 92, col = color || TKC.pink, c = scene.add.container(0, 0).setDepth(6);
  const st = KG.txt(scene, x0 + 64, 13, sub || '', { size: 14, color: col }), tt = KG.txt(scene, x0 + 64, 29, title, { size: 25, color: TKC.ink });
  const w = Math.min(maxW || 420, Math.max(tt.width, st.width) + 86); fitText(tt, w - 84); fitText(st, w - 84);
  c.add(addCard(scene, x0 + w / 2, 40, w, 58, { r: 29, lw: 3.5, shadow: 4, fill: ['#ffffff', mixWhite(col, 0.84)] }));
  c.add(scene.add.circle(x0 + 31, 40, 23, 0xffffff).setStrokeStyle(4, colN(col)));
  c.add(typeof ACT_ICON !== 'undefined' && ACT_ICON[icon] ? actIcon(scene, icon, x0 + 31, 40, 36) : KG.ui.icon(scene, icon || 'star', x0 + 31, 40, 26, colN(col)));
  c.add([st, tt]); c.w = w; return c;
}

// ทำให้วัตถุลากได้ (ใช้ drag ของ Phaser) แตะโดยไม่ลาก = tap  cb: { start(), move(x,y), drop(x,y), tap() }
function dragify(scene, obj, w, h, cb) {
  if (obj.type === 'Container') obj.setSize(w, h);
  obj.setInteractive({ useHandCursor: true, draggable: true }); obj._moved = false;
  obj.on('dragstart', p => { obj._moved = true; if (cb.start) cb.start(p); });
  obj.on('drag', (p, dx, dy) => { obj.x = dx; obj.y = dy; if (cb.move) cb.move(dx, dy, p); });
  obj.on('dragend', p => { if (cb.drop) cb.drop(p.worldX, p.worldY, p); });   // ตัดสินจากตำแหน่งปลายนิ้ว/เมาส์ (ตำแหน่งวัตถุอาจช้ากว่าหนึ่งจังหวะ)
  obj.on('pointerdown', () => { obj._moved = false; });
  obj.on('pointerup', () => { if (!obj._moved && cb.tap) cb.tap(); });
  return obj;
}
const inBox = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// ประโยคที่ระบายสีสรรพนามประธาน วางกึ่งกลางที่ cx บรรทัดแรกที่ y คืน container ที่มี .lines
function richSentence(scene, cx, y, en, p, size, maxW, o) {
  o = o || {}; const font = '600 ' + size + 'px Kanit', toks = en.split(' '), sp = KG.measure(' ', font) + 3, lh = Math.round(size * 1.3);
  const lines = []; let cur = [], w = 0;
  toks.forEach(t => { const tw = KG.measure(t, font); if (cur.length && w + sp + tw > maxW) { lines.push({ cur, w }); cur = []; w = 0; } w += (cur.length ? sp : 0) + tw; cur.push({ t, tw }); });
  lines.push({ cur, w });
  const c = scene.add.container(0, 0); let hiDone = false;
  lines.forEach((ln, li) => {
    let x = cx - ln.w / 2;
    ln.cur.forEach(it => {
      const isSubj = !hiDone && p && bareTok(it.t) === String(p).toLowerCase(); if (isSubj) hiDone = true;
      const t = KG.txt(scene, x, y + li * lh, it.t, { size, color: isSubj ? PCOL[p] : (o.color || TKC.ink), oy: 0.5, ox: 0 }); c.add(t); x += it.tw + sp;
    });
  });
  c.lines = lines.length; c.lh = lh; return c;
}

class ActBase extends KG.Scene {
  init(data) {
    data = data || {}; this.unit = unitOf(data.unit || SAVE.data.unit); this.LV = LEVELS[this.unit.level - 1]; this.A = actOf(this.ACT);
    this._restartData = { unit: this.unit.id }; this.mistakes = 0; this.hints = 0; this.done = false; this._modal = null; this.paused = false; this.coachTxt = null;
  }
  // เรียกต้น create(): ตั้งฉาก พื้นหลัง หัวฉาก แถบโค้ช
  begin(o) {
    o = o || {}; this.setup(); KG.audio.music(this.LV.id === 1 ? 'sunny' : this.LV.id === 2 ? 'bounce' : 'breeze'); this._t0 = Date.now();
    this.input.dragDistanceThreshold = 8;
    this.add.image(GW / 2, GH / 2, bgTex(this, this.LV.bg)).setDisplaySize(GW, GH);
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0xffffff, 0.18);
    this.events.once('shutdown', () => { SPEECH.stop(); purgeTex(this); });
    this.buildHeader(); this.buildCoach();
    // บรรยากาศแบบเกม: ประกายลอย · ป้ายคอมโบ · ป้าย GO! ตอนเริ่มเกม (ไม่ใช่หน้าเรียนคำศัพท์)
    this.ambientFx = KG.fx.ambient(this, { freq: 520, colors: [0xffffff, 0xffd34f, 0x9ad8ff], s: 0.32, alpha: 0.55, depth: 1 });
    this.combo = 0; this.bestCombo = 0; this.comboChip = this.add.container(462, 40).setDepth(20).setAlpha(0);
    this.comboChip.add(addCard(this, 0, 0, 92, 40, { r: 18, lw: 3, shadow: 3, fill: ['#ffe14d', '#ff9a1e'] })); this.comboChip.add(KG.ui.icon(this, 'bolt', -26, 0, 24, 0x2d2a5e));
    this.comboTxt = KG.txt(this, 12, 0, 'x2', { size: 22, color: TKC.ink, center: true, middle: true }); this.comboChip.add(this.comboTxt);
    if (this.ACT !== 'learn') this.time.delayedCall(450, () => { if (!this._modal && !this.done) { KG.banner(this, 'GO!', '#ffd34f', 1.15, 330); KG.audio.play('go'); } });
    this.onEscape = () => this.pause();
  }
  buildHeader() {
    iconButton(this, 56, 40, 'home', () => this.leave(), { w: 60, h: 52 });
    cuteTitle(this, this.headSub || (this.unit.en + '  ·  ' + this.LV.en), this.A.th + ' ' + this.A.en, this.A.color, this.A.id, 330);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => this.help(), { w: 56, h: 52 });
    if (SPEECH.exists) {
      const vb = new KG.ui.Button(this, GW - 396, 40, 120, 44, { label: SAVE.data.voice !== false ? 'เสียง เปิด' : 'เสียง ปิด', icon: SAVE.data.voice !== false ? 'sound' : 'mute', style: 'ghost', size: 17, slant: 8, onClick: () => { SAVE.data.voice = SAVE.data.voice === false; SAVE.save(); vb.setLabel(SAVE.data.voice !== false ? 'เสียง เปิด' : 'เสียง ปิด'); vb.icon.setTexture(KG.ui.iconKey(this, SAVE.data.voice !== false ? 'sound' : 'mute')); if (SAVE.data.voice !== false) SPEECH.say('Hello!'); else SPEECH.stop(); } });
    }
  }
  // ตัวชี้ความคืบหน้าที่หัวฉาก: วงกลมในแคปซูลสีขาว ข้อที่ผ่านแล้วกลายเป็นดาวเด้งขึ้น  o: { r รัศมี, gap ระยะห่าง }
  makePips(n, x0, o) {
    o = o || {}; const r = o.r || 11, gap = o.gap || 30, x = x0 == null ? 520 : x0;
    addCard(this, x + (n - 1) * gap / 2, 40, (n - 1) * gap + r * 2 + 24, r * 2 + 18, { r: r + 9, lw: 3, shadow: 3, fill: ['#ffffff', '#f3ecff'] }).setDepth(5);
    this.pipObjs = []; this.pipStars = [];
    for (let i = 0; i < n; i++) {
      this.pipObjs.push(this.add.circle(x + i * gap, 40, r, 0xebe5fb).setStrokeStyle(2.5, 0x8f86c8).setDepth(6));
      const s = KG.ui.icon(this, 'star', x + i * gap, 40, r * 2.5, 0xffb800).setDepth(7).setVisible(false); s.baseS = s.scaleX; this.pipStars.push(s);
    }
  }
  setPips(done) {
    (this.pipObjs || []).forEach((c, i) => {
      const on = i < done, s = this.pipStars[i]; c.setFillStyle(on ? 0xfff1b8 : 0xebe5fb);
      if (on && !s.visible) { s.setVisible(true).setScale(0.1); this.tweens.add({ targets: s, scaleX: s.baseS, scaleY: s.baseS, angle: { from: -40, to: 0 }, duration: 320, ease: 'Back.easeOut' }); } else if (!on) s.setVisible(false);
    });
  }
  // แถบโค้ชด้านล่าง: ไรเดอร์เทคโน (มาสคอตจากภาพบน Google Drive หลายท่า) ยืนโผล่เหนือแถบ คอยบอกโจทย์ ชี้แนะ ชมและให้กำลังใจ
  buildCoach() {
    // ลูกโป่งคำพูดทรงมน มีหางชี้ไปที่ไรเดอร์
    const tail = this.add.graphics().setDepth(2); tail.fillStyle(0xffffff, 1).lineStyle(4, 0x2d2a5e, 1); tail.beginPath(); tail.moveTo(150, 658); tail.lineTo(116, 684); tail.lineTo(150, 694); tail.closePath(); tail.fillPath(); tail.strokePath();
    addCard(this, 703, 676, 1106, 64, { r: 32, lw: 4, shadow: 4, fill: ['#ffffff', '#fff3fa'] }).setDepth(2);
    this.add.rectangle(151, 676, 10, 30, 0xffffff).setDepth(2);
    this.mascot = this.add.image(84, 600, 'mascot_point').setOrigin(0.5, 0).setDepth(4); this.mascotH = 240;   // เห็นแค่ครึ่งตัวบน: ส่วนล่างของรูปตกขอบจอ this.setPose('point');
    this.coachTxt = KG.txt(this, 178, 676, '', { size: 24, oy: 0.5, color: TKC.ink }).setDepth(3);
    this.hintBtn = new KG.ui.Button(this, 1148, 677, 190, 52, { label: 'ใบ้', icon: 'bulb', style: 'sun', size: 22, slant: 8, onClick: () => { if (!this.done && !this.paused) this.hint(); } }).setDepth(3);
  }
  // เปลี่ยนท่าของมาสคอต (ชื่อท่า: wave book tablet shield magnifier laptop code rocket trophy cheer point action)
  setPose(name) {
    if (!this.mascot || !this.textures.exists('mascot_' + name)) return;
    this.mascot.setTexture('mascot_' + name); this.mascot.setScale(Math.min(this.mascotH / this.mascot.height, 150 / this.mascot.width)); this.mascot.setFlipX(name === 'point'); this.pose = name;
    this.mascotY = Math.round(GH - 0.56 * this.mascot.displayHeight); this.mascot.y = this.mascotY;   // ครึ่งตัวบน (หัวถึงเอว) อยู่เหนือขอบจอล่าง
  }
  // โค้ชพูด: th = ข้อความไทย  mood = smile (ชี้บอกโจทย์) · happy (ชูกำปั้นดีใจ) · sad (ถือแว่นขยาย ชวนสังเกตใหม่) · open (อ่านแท็บเล็ต ให้คำใบ้) หรือใส่ชื่อท่าตรง ๆ
  say(th, mood) {
    if (!this.coachTxt) return; this.coachTxt.setText(KG.wrap(th, 820, '600 24px Kanit')); this.coachTxt.setScale(1);
    const lines = this.coachTxt.text.split(String.fromCharCode(10)).length; this.coachTxt.setFontSize(lines > 2 ? 18 : lines > 1 ? 21 : 24);
    this.setPose(MOOD_POSE[mood || 'smile'] || mood);
    this.tweens.killTweensOf(this.mascot); this.mascot.y = this.mascotY; this.tweens.add({ targets: this.mascot, y: this.mascotY - 12, duration: 130, yoyo: true, ease: 'Quad.easeOut' });
  }
  speak(en) { SPEECH.say(en); }
  // ตอบถูก: ประกาย + คำชม + คอมโบต่อเนื่อง (ตอบถูกติดกันหลายครั้งได้ป้ายคอมโบและเสียงสูงขึ้น)
  good(x, y) {
    this.combo = (this.combo || 0) + 1; this.bestCombo = Math.max(this.bestCombo || 0, this.combo); const n = this.combo;
    KG.audio.play(n >= 3 ? 'combo' : 'good');
    if (x != null) {
      KG.fx.burst(this, x, y, { colors: [0xffd34f, 0xff7ab2, 0x4ef4d2, 0xffffff], n: 16 + Math.min(n, 6) * 3, max: 220 + Math.min(n, 6) * 20, depth: 3000 });
      const praise = n >= 5 ? 'AMAZING!' : n >= 3 ? 'SUPER!' : n === 2 ? 'GREAT!' : ['GOOD!', 'NICE!', 'YES!'][Math.floor(Math.random() * 3)];
      KG.fx.pop(this, x, y - 40, n >= 2 ? praise + '  x' + n : praise, { size: n >= 3 ? 40 : 32, color: n >= 3 ? '#ffd34f' : '#ffffff', depth: 3001, rise: 80 });
      if (n >= 3) { KG.fx.ring(this, x, y, 0xffb800, { size: 1.1, w: 0.5, depth: 2999 }); KG.fx.shake(this, 90, 0.002); }
    }
    if (this.comboChip) {
      this.comboTxt.setText('x' + n); this.tweens.killTweensOf(this.comboChip);
      if (n >= 2) { this.comboChip.setAlpha(1).setScale(1.35); this.tweens.add({ targets: this.comboChip, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.easeOut' }); }
    }
  }
  bad(obj) {
    KG.audio.play('error'); if (obj) this.tweens.add({ targets: obj, x: obj.x + 8, duration: 50, yoyo: true, repeat: 3 });
    const had = this.combo >= 2; this.combo = 0;
    if (this.comboChip && had) { this.tweens.killTweensOf(this.comboChip); this.tweens.add({ targets: this.comboChip, alpha: 0, scaleX: 0.6, scaleY: 0.6, duration: 260 }); }
  }
  // ส่งการ์ดกลับที่เดิม (home) แล้วสั่นเบา ๆ เมื่อวางผิด (ไม่สั่นพร้อมกัน เพราะทวีนซ้อนกันทำให้ตำแหน่งเพี้ยน)
  homeBack(c, shake) { c.setScale(1); this.tweens.add({ targets: c, x: c.home.x, y: c.home.y, duration: 220, ease: 'Back.easeOut', onComplete: () => { c.setDepth(10); if (shake) this.tweens.add({ targets: c, x: c.home.x + 7, duration: 45, yoyo: true, repeat: 3, onComplete: () => { c.x = c.home.x; } }); } }); }
  help() { KG.howTo(this, { title: this.A.th + ' (' + this.A.en + ')', body: this.HOW }); }
  hint() { }
  leave() { this.go('Hub', { unit: this.unit.id }); }
  pause() {
    if (this.paused || this._modal || this.done) return; this.paused = true;
    KG.pauseMenu(this, { onExit: () => this.leave(), onRestart: () => this.go(this.scene.key, this._restartData), onResume: () => { this.paused = false; } });
  }
  starsFor(m, h) { const pen = m + h; return pen <= 1 ? 3 : pen <= 3 ? 2 : 1; }
  // จบกิจกรรม: บันทึกดาว ส่งสถิติ แสดงสรุปผล  rows = แถวเพิ่มเติม
  finish(rows, bodyExtra) {
    if (this.done) return; this.done = true;
    const stars = this.starsFor(this.mistakes, this.hints), key = akey(this.unit.id, this.ACT), best = SAVE.data.stars[key] || 0;
    if (stars > best) SAVE.data.stars[key] = stars; SAVE.data.unit = this.unit.id; SAVE.data.level = this.unit.level; SAVE.save();
    KG.audio.play('win'); KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 160);
    this.say('เก่งมาก! ทำครบแล้ว', 'trophy'); SPEECH.stop();
    const nxt = nextActOf(this.ACT), body = (stars === 3 ? 'สมบูรณ์แบบ! พลาดน้อยและไม่ต้องพึ่งคำใบ้' : stars === 2 ? 'ดีมาก! ลองอีกครั้งให้พลาดน้อยลงจะได้ 3 ดาว' : 'ผ่านแล้ว! เล่นซ้ำอีกครั้งเพื่อเก็บดาวเพิ่มนะ') + (bodyExtra ? '\n' + bodyExtra : '');
    const buttons = [{ label: 'กลับหน่วย', style: 'ghost', icon: 'flag', onClick: () => this.leave() }, { label: 'เล่นอีกครั้ง', style: 'cyan', icon: 'reset', onClick: () => this.go(this.scene.key, this._restartData) }];
    buttons.push(nxt ? { label: nxt.th, style: 'primary', icon: 'play', pulse: true, onClick: () => this.go(nxt.scene, { unit: this.unit.id }) } : { label: 'ไปหน่วยถัดไป', style: 'primary', icon: 'play', pulse: true, onClick: () => { const us = unitsOfLevel(this.unit.level), i = us.findIndex(u => u.id === this.unit.id); this.go(us[i + 1] ? 'Hub' : 'Units', { unit: (us[i + 1] || this.unit).id, level: this.unit.level }); } });
    this.time.delayedCall(900, () => KG.results(this, {
      stat: { lvl: key, stars, m: this.mistakes, h: this.hints, secs: Math.round((Date.now() - this._t0) / 1000), practice: false },
      win: true, stars, title: this.A.th + ' สำเร็จ!', body, rows: [['พลาด', this.mistakes + ' ครั้ง'], ['ใช้คำใบ้', this.hints + ' ครั้ง'], ['คอมโบสูงสุด', (this.bestCombo || 0) + ' ครั้ง']].concat(rows || []), tip: this.finishTip || UNIT_TIP[this.unit.kind] || '', buttons
    }));
  }
}
