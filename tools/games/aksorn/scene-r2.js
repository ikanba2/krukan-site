/* ===== Techno Aksorn รอบ 2: ฉากกิจกรรมแบบเลือกคำตอบ (Quiz) และแบบเรียงชิ้นส่วนตามลำดับ (Order) =====
   Quiz: tlisten tname mlisten mpic mfill slisten spic sheard sfill · Order: sbuild sletters sentbuild
   รูปแบบข้อมูลของแต่ละข้อดูที่ thai-r2.js (R2.quiz / R2.order) */
const QUIZ_HOW = {
  tlisten: '1. กดปุ่มลำโพงเพื่อฟังพยางค์ (ถ้าเครื่องไม่มีเสียงอ่าน จะมีข้อความบอกว่าให้หาคำที่เป็นเสียงอะไร)\n2. เลือกคำที่ออกเสียงตรงกับที่ได้ยิน ดูรูปวรรณยุกต์สีเขียวช่วยตัดสิน\n3. ถ้าเลือกผิด จะมีเสียงและกฎบอกว่าคำนั้นเป็นเสียงอะไร ลองใหม่ได้\n4. ตอบครบ 6 ข้อจึงผ่าน',
  tname: '1. ดูพยางค์ที่ขึ้นบนจอ แล้วคิดว่าอ่านเป็นเสียงวรรณยุกต์อะไร\n2. ดูหมู่ของพยัญชนะต้นและรูปวรรณยุกต์ (สีเขียว) ประกอบกัน\n3. ถ้าเลือกผิด จะมีกฎบอกว่าพยางค์นั้นเป็นเสียงอะไร เพราะอะไร\n4. ตอบครบ 6 ข้อจึงผ่าน',
  mlisten: '1. กดปุ่มลำโพงเพื่อฟังคำ (ถ้าไม่มีเสียงอ่าน จะมีคำเขียนบอกที่หน้าจอ)\n2. ฟังเสียงท้ายของคำ แล้วเลือกว่าคำนี้อยู่ในแม่ไหน\n3. ถ้าเลือกผิด จะบอกว่าคำนี้มีตัวสะกดอะไร อยู่ในแม่ไหน\n4. ตอบครบ 6 ข้อจึงผ่าน',
  mpic: '1. ดูภาพและกดปุ่มลำโพงเพื่อฟังชื่อของสิ่งในภาพ\n2. คิดว่าคำนั้นมีตัวสะกดไหม เสียงท้ายเป็นเสียงอะไร แล้วเลือกแม่ที่ถูกต้อง\n3. ถ้าเลือกผิด จะบอกว่าคำนี้อยู่ในแม่ไหน\n4. ตอบครบ 6 ข้อจึงผ่าน',
  mfill: '1. ดูคำที่ยังขาดตัวสะกด (ช่องว่างตอนท้าย) และฟังคำเต็มได้จากปุ่มลำโพง\n2. เลือกตัวสะกดที่ถูกต้องมาเติมให้ครบคำ\n3. ตัวสะกดแต่ละแม่เสียงเหมือนกัน ต้องเลือกตัวที่ใช้เขียนคำนี้จริง ๆ\n4. ตอบครบ 6 ข้อจึงผ่าน',
  slisten: '1. ดูหรือฟังการสะกดทีละชิ้น (พยัญชนะ สระ ตัวสะกด วรรณยุกต์)\n2. ประสมเสียงแล้วเลือกคำที่สะกดได้\n3. ถ้าเลือกผิด จะบอกว่าสะกดแบบนั้นได้คำไหน\n4. ตอบครบ 6 ข้อจึงผ่าน',
  spic: '1. อ่านประโยคที่ขึ้นบนจอ (แตะเพื่อฟังได้)\n2. เลือกภาพที่ตรงกับประโยคนั้น\n3. ถ้าเลือกผิด จะบอกว่าภาพนั้นคือประโยคอะไร\n4. ตอบครบ 6 ข้อจึงผ่าน',
  sheard: '1. กดปุ่มลำโพงเพื่อฟังประโยค (ถ้าไม่มีเสียงอ่าน จะมีคำเขียนบอกที่หน้าจอ)\n2. เลือกภาพที่ตรงกับประโยคที่ได้ยิน\n3. ถ้าเลือกผิด จะบอกว่าภาพนั้นคือประโยคอะไร\n4. ตอบครบ 6 ข้อจึงผ่าน',
  sfill: '1. ดูภาพ แล้วอ่านประโยคที่มีช่องว่างหนึ่งคำ\n2. เลือกคำที่เติมแล้วตรงกับภาพ\n3. ถ้าเลือกผิด ให้ดูภาพอีกครั้งแล้วลองใหม่\n4. ตอบครบ 6 ข้อจึงผ่าน'
};
const MARK_ONLY = /^[ัิีึืุู็่้๊๋์ํ]$/;
const tileLabel = (t, role) => (MARK_ONLY.test(t) ? '–' + t : R2.tokShow(t, role));

class QuizScene extends ActBase {
  constructor() { super('Quiz'); }
  init(d) {
    d = d || {}; this.ACT = d.act; super.init(d); this.rounds = AK.makeQuiz(this.ACT, this.lesson, this.lv, (Date.now() & 0xfffffff) + 91); this.ri = 0; this.locked = false; this.objs = []; this.wrong = {}; this.cards = [];
  }
  create() { this.begin(); this.HOW = QUIZ_HOW[this.ACT] || this.A.desc; this.makePips(this.rounds.length, 520); this.startRound(); }
  // ชิ้นหนึ่งของแถวคำถาม: { w: กว้าง, make(x) }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.locked = false; this.wrong = {}; this.cards = []; this.blank = null;
    const R = this.rounds[this.ri], voice = SPEECH.exists, hear = R.mode === 'hear', n = R.opts.length; this.R = R;
    const P = this.add.container(640, 0).setDepth(5); this.objs.push(P); P.add(addCard(this, 0, 190, 1100, 214, { r: 34, fill: ['#ffffff', '#f6f0ff'], shadow: 9 }));
    P.add(KG.txt(this, -520, 104, 'ข้อ ' + (this.ri + 1) + ' จาก ' + this.rounds.length + ' · ' + R.head, { size: 21, weight: 400, color: '#6a64a0', ox: 0, oy: 0.5 }));
    // แถวที่ 1: ปุ่มเสียง / ภาพ / ข้อความของคำถาม
    const parts = [];
    if (hear && voice) parts.push({ w: 230, make: x => { const b = new KG.ui.Button(this, 640 + x, 168, 220, 84, { label: 'ฟังเสียง', icon: 'sound', style: 'primary', size: 30, onClick: () => this.replay() }); this.objs.push(b); b.pulse(); this.listenBtn = b; } });
    else if (hear && R.label) parts.push({ w: 640, make: x => { this.objs.push(fitText(KG.txt(this, 640 + x, 168, R.label, { size: 44, color: TKC.ink, center: true, middle: true }), 620).setDepth(6)); } });
    if (R.qPic) parts.push({ w: 190, make: x => { const p = pic(this, R.qPic, 640 + x, 168, 180, 150).setDepth(6); this.objs.push(p); if (hear && R.say) { p.setInteractive({ useHandCursor: true }).on('pointerup', () => this.replay()); } } });
    const showKey = R.qKey && (!R.qWhen || R.qWhen === 'always' || !voice);
    if (showKey) parts.push({ w: 360, make: x => { const t = richText(this, 640 + x, 170, R.qKey.slice(2), 92, { maxW: 340 }).setDepth(6); this.objs.push(t); t.setInteractive({ useHandCursor: true }).on('pointerup', () => this.replay()); } });
    if (R.qText != null) parts.push({ w: R.blank ? 520 : 400, make: x => {
      const roles = R.qRoles ? (R.qRoles.join ? R.qRoles.join('') : R.qRoles) : undefined, t = richText(this, 640 + x, 170, R.qText, 92, { maxW: 380, roles }).setDepth(6); this.objs.push(t); t.setInteractive({ useHandCursor: true }).on('pointerup', () => this.replay());
      if (R.blank) { t.x = 640 + x - 49; const b = this.add.container(640 + x + t.displayWidth / 2 + 7, 170).setDepth(6); b.add(addCard(this, 0, 0, 84, 100, { r: 18, lw: 4, shadow: 0, dash: true, fill: ['#fffdf2', '#fff6cf'] })); b.add(KG.txt(this, 0, 0, '?', { size: 50, color: '#d0c2ff', center: true, middle: true })); this.objs.push(b); this.blank = b; this.blankW = 84; }
    } });
    const gap = 26, tot = parts.reduce((q, p) => q + p.w, 0) + gap * Math.max(0, parts.length - 1); let cx = -tot / 2;
    parts.forEach(p => { p.make(cx + p.w / 2); cx += p.w + gap; });
    // แถวที่ 2: ชิ้นส่วนการสะกด / คำของประโยค
    const words = R.qWords || (hear && !voice ? R.qSentNoVoice : null);
    const chips = R.qTokens ? R.qTokens.map((t, i) => ({ t, col: SP_COL_OF(R.qRoles[i]) })) : words ? words.map((t, i) => ({ t, col: R.blankAt === i ? null : ROLE_COL2_OF(R.qRoles[i]), blank: R.blankAt === i })) : null;
    if (chips) this.chipRow(P, chips, parts.length ? 258 : 196, !parts.length);
    // คำตอบ
    const cols = n <= 4 ? n : 3, rows = Math.ceil(n / cols), cw = n <= 3 ? 330 : n === 4 ? 262 : 330, ch = rows === 1 ? 236 : 138, gx = 24, gy = 18, y0 = rows === 1 ? 486 : 408;
    R.opts.forEach((o, i) => {
      const r = Math.floor(i / cols), c = i % cols, cnt = r === rows - 1 ? n - cols * (rows - 1) : cols, x = 640 + (c - (cnt - 1) / 2) * (cw + gx), y = y0 + (r - (rows - 1) / 2) * (ch + gy) + (rows === 1 ? 0 : 56);
      const card = this.add.container(x, y).setDepth(5); card.o = o; card.home = { x, y }; this.cards.push(card); this.objs.push(card);
      card.add(addCard(this, 0, 0, cw, ch, { r: 28, fill: ['#ffffff', '#f6f0ff'], shadow: 8, lw: 4 })); card.bg = card.list[0];
      if (o.pic) card.add(pic(this, o.pic, 0, 0, cw - 36, ch - 28));
      else if (o.id && o.id.startsWith('w:')) card.add(richText(this, 0, o.sub ? -12 : 0, o.text, rows === 1 ? 92 : 64, { maxW: cw - 28, roles: o.roles }));
      else if (o.word) card.add(richText(this, 0, 0, o.text, rows === 1 ? 84 : 60, { maxW: cw - 28 }));
      else if (o.roles) card.add(richText(this, 0, 0, o.text, rows === 1 ? 92 : 64, { maxW: cw - 28, roles: o.roles }));
      else card.add(fitText(glyph(this, 0, o.sub ? -10 : 0, o.text, o.text.length > 4 ? 56 : o.text.length > 2 ? 70 : 100, o.color || TKC.ink), cw - 30));
      if (o.sub && !o.pic) card.add(fitText(KG.txt(this, 0, ch / 2 - 26, o.sub, { size: 20, weight: 400, color: '#6a64a0', center: true, middle: true }), cw - 24));
      card.setSize(cw, ch).setInteractive({ useHandCursor: true }); card.on('pointerup', () => this.choose(card));
      card.setScale(0); this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 260, delay: 60 * i, ease: 'Back.easeOut' });
    });
    this.say(hear ? (voice ? 'ฟังให้ดี แล้วเลือกคำตอบนะ' : R.label ? R.label : 'อ่านแล้วเลือกคำตอบนะ') : 'ดูโจทย์ แล้วเลือกคำตอบนะ', 'smile'); this.setPips(this.ri);
    if (hear) this.time.delayedCall(450, () => { if (this.R === R) this.replay(); });
  }
  chipRow(P, chips, y, big) {
    const k = big ? 1.35 : 1, wd = c => Math.max(76 * k, Math.round(KG.measure(c.t, '700 40px Sarabun') * 0.62 * k) + 36 * k), gap = 14 * k, hh = Math.round(62 * k), tot = chips.reduce((s2, c) => s2 + wd(c), 0) + gap * (chips.length - 1); let x = -tot / 2;
    chips.forEach(c => {
      const w = wd(c), g = this.add.container(640 + x + w / 2, y).setDepth(6); this.objs.push(g);
      if (c.blank) { g.add(addCard(this, 0, 0, w, hh, { r: 18, lw: 3.5, shadow: 0, dash: true, fill: ['#fffdf2', '#fff6cf'] })); g.add(KG.txt(this, 0, 0, '?', { size: 36 * k, color: '#d0c2ff', center: true, middle: true })); this.blank = g; this.blankW = w; this.blankH = hh; }
      else { g.add(addCard(this, 0, 0, w, hh, { r: 18, lw: 3, shadow: 3, fill: ['#ffffff', '#fff6dc'] })); g.add(fitText(glyph(this, 0, 0, c.t, 38 * k, c.col || TKC.ink), w - 16)); }
      x += w + gap;
    });
  }
  replay() { this.speak(this.R.say); }
  optSay(o) { return o.say || (o.pic ? o.tag : o.text); }
  choose(card) {
    if (this.locked || this.done || this.paused || this._modal) return; const R = this.R, o = card.o;
    if (o.id === R.answer) {
      this.locked = true; this.good(card.x, card.y); card.bg.setTint(0xc8ffd2); this.tweens.add({ targets: card, scaleX: 1.1, scaleY: 1.1, duration: 140, yoyo: true });
      if (this.blank) { const b = this.blank; b.removeAll(true); const w = this.blankW || 84; const hb = R.blankAt != null ? (this.blankH || 62) : 100; b.add(addCard(this, 0, 0, w, hb, { r: 18, lw: 4, shadow: 3, fill: ['#e6ffe9', '#c8ffd2'] })); b.add(fitText(glyph(this, 0, 0, o.text, R.blankAt != null ? hb * 0.62 : 66, R.blankAt != null ? TKC.ink : '#1f5fd8'), w - 12)); this.tweens.add({ targets: b, scaleX: 1.15, scaleY: 1.15, duration: 160, yoyo: true }); }
      this.speak(R.say.includes(' ') && R.qTokens ? R.answer : R.say); this.say('ถูกต้อง! ' + R.right, 'happy'); this.setPips(this.ri + 1);
      this.time.delayedCall(R.right.length > 40 ? 2300 : 1700, () => { this.ri++; if (this.ri >= this.rounds.length) this.finish([['ตอบถูก', this.rounds.length + ' ข้อ']]); else this.startRound(); });
    } else {
      this.mistakes++; this.bad(card); card.bg.setTint(0xffb8b8); this.wrong[o.id] = 1; this.tweens.add({ targets: card, alpha: 0.45, duration: 200 });
      this.speak(this.optSay(o)); this.say((R.wrong[o.id] || 'ยังไม่ใช่นะ') + ' ลองใหม่นะ', 'sad');
      if (R.mode === 'hear') this.time.delayedCall(1900, () => { if (!this.locked && !this.done) this.replay(); });
    }
  }
  hint() {
    if (this.done || this.locked) return; const c = this.cards.find(k => k.o.id !== this.R.answer && !this.wrong[k.o.id]); if (!c) return; this.hints++; this.wrong[c.o.id] = 1; KG.audio.play('pop'); this.tweens.add({ targets: c, alpha: 0.25, duration: 220 }); c.disableInteractive();
    this.say('คำใบ้: ตัดตัวเลือกที่ไม่ใช่ออกให้หนึ่งใบ' + (this.R.mode === 'hear' ? ' ฟังอีกครั้งนะ' : ''), 'open'); if (this.R.mode === 'hear') this.replay();
  }
}
const SP_COL_OF = r => (typeof R2 !== 'undefined' && R2.SP_COL[r]) || TKC.ink;
const ROLE_COL2_OF = r => (typeof R2 !== 'undefined' && R2.ROLE_COL2[r]) || TKC.ink;

/* ---------- Order: แตะชิ้นส่วนตามลำดับ (หรือลากไปวางที่ช่อง) ---------- */
const ORDER_HOW = {
  sbuild: '1. ดูคำและภาพด้านบน กดปุ่มลำโพงฟังคำได้\n2. สะกดคำตามลำดับ: ชื่อพยัญชนะต้น สระ ตัวสะกด (ถ้ามี) คำ วรรณยุกต์ (ถ้ามี) แล้วคำเต็ม แตะชิ้นส่วนที่ใช่ หรือลากไปวางในช่อง\n3. มีชิ้นส่วนลวงปนอยู่ ถ้าแตะผิดจะบอกว่าช่องนี้ต้องเป็นอะไร ลองใหม่ได้\n4. สะกดครบทุกข้อจึงผ่าน',
  sletters: '1. ดูภาพและกดปุ่มลำโพงฟังคำ\n2. แตะตัวอักษรเรียงตามลำดับที่เขียนคำนั้นทีละตัว หรือลากไปวางในช่อง (มีตัวลวงปนอยู่)\n3. ถ้าแตะผิดจะบอกว่าช่องนี้ต้องเป็นตัวอะไร ลองใหม่ได้\n4. เรียงครบทุกข้อจึงผ่าน',
  sentbuild: '1. ดูภาพ แล้วคิดว่าภาพนี้เล่าเรื่องอะไร ใครทำอะไร\n2. แตะคำเรียงเป็นประโยคตามลำดับ หรือลากไปวางในช่อง (บางคำเป็นตัวลวง)\n3. ถ้าแตะผิดจะบอกว่าช่องนี้ต้องเป็นคำแบบไหน ลองใหม่ได้\n4. เรียงครบทุกข้อจึงผ่าน'
};
class OrderScene extends ActBase {
  constructor() { super('Order'); }
  init(d) { d = d || {}; this.ACT = d.act; super.init(d); this.rounds = AK.makeOrder(this.ACT, this.lesson, this.lv, (Date.now() & 0xfffffff) + 97); this.ri = 0; this.locked = false; this.objs = []; this.tiles = []; this.slots = []; }
  create() { this.begin(); this.HOW = ORDER_HOW[this.ACT]; this.makePips(this.rounds.length, 520); this.startRound(); }
  tcol(role) { return this.ACT === 'sentbuild' ? (this.lv <= 1 ? ROLE_COL2_OF(role) : TKC.ink) : SP_COL_OF(role); }
  startRound() {
    this.objs.forEach(o => o.destroy(true)); this.objs = []; this.tiles = []; this.slots = []; this.locked = false; this.filled = 0;
    const R = this.rounds[this.ri], voice = SPEECH.exists, n = R.tokens.length; this.R = R; this.say('', 'smile');
    // ส่วนบน: ภาพ + ปุ่มเสียง / คำที่ต้องสะกด
    const top = this.add.container(640, 0).setDepth(5); this.objs.push(top); top.add(addCard(this, 0, 176, 1100, 196, { r: 34, fill: ['#ffffff', '#f6f0ff'], shadow: 9 }));
    top.add(KG.txt(this, -520, 104, 'ข้อ ' + (this.ri + 1) + ' จาก ' + this.rounds.length + ' · ' + R.head, { size: 21, weight: 400, color: '#6a64a0', ox: 0, oy: 0.5 }));
    const showWord = !R.sentence && (!R.qPic || this.lv <= 0 || this.ACT === 'sbuild' && this.lv <= 1), parts = [];
    if (voice) parts.push({ w: 210, make: x => { const b = new KG.ui.Button(this, 640 + x, 178, 200, 76, { label: 'ฟัง', icon: 'sound', style: 'primary', size: 28, onClick: () => this.speak(R.say) }); this.objs.push(b); b.pulse(); } });
    if (R.qPic) parts.push({ w: R.sentence ? 330 : 190, make: x => { const p = pic(this, R.qPic, 640 + x, 178, R.sentence ? 310 : 170, 150).setDepth(6); this.objs.push(p); p.setInteractive({ useHandCursor: true }).on('pointerup', () => this.speak(R.say)); } });
    if (showWord || (!R.qPic && !R.sentence)) parts.push({ w: 400, make: x => { const t = richText(this, 640 + x, 180, R.word, 96, { maxW: 380 }).setDepth(6); this.objs.push(t); t.setInteractive({ useHandCursor: true }).on('pointerup', () => this.speak(R.say)); } });
    const gap = 30, tot = parts.reduce((s, p) => s + p.w, 0) + gap * Math.max(0, parts.length - 1); let cx = -tot / 2; parts.forEach(p => { p.make(cx + p.w / 2); cx += p.w + gap; });
    // ช่องวาง
    const sw = Math.max(104, Math.min(190, Math.floor((1180 - (n - 1) * 12) / n))), sy = 346, sx0 = 640 - ((n - 1) * (sw + 12)) / 2;
    for (let i = 0; i < n; i++) {
      const x = sx0 + i * (sw + 12), c = this.add.container(x, sy).setDepth(4), s = { i, x, y: sy, w: sw, h: 92, c, done: false }; c.add(addCard(this, 0, 0, sw, 92, { r: 20, lw: 3.5, shadow: 0, dash: true, fill: ['#fffdf2', '#fff6cf'] })); c.add(KG.txt(this, 0, 0, String(i + 1), { size: 34, color: '#d8cdf6', center: true, middle: true }));
      this.objs.push(c); this.slots.push(s);
      if (R.slotHints) this.objs.push(fitText(KG.txt(this, x, sy - 60, R.slotHints[i], { size: 18, weight: 400, color: '#ffffff', stroke: TKC.ink, sw: 4, center: true, middle: true }).setDepth(6), sw));
    }
    // ถาดชิ้นส่วน
    const wd = t => Math.max(98, Math.min(230, Math.round(KG.measure(tileLabel(t.t, t.role), '700 36px Sarabun') * 0.7) + 52)), rows = [[]]; let rw = 0; R.tiles.forEach((t, i) => { const w = wd(t); if (rw + w > 1130 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push({ t, w }); rw += w + 16; });
    this.objs.push(addCard(this, 640, 520, 1200, Math.max(150, rows.length * 96 + 40), { r: 30, fill: ['#ffffffd8', '#efe6ffd8'], shadow: 6, lw: 3, dash: true }).setDepth(1));
    rows.forEach((row, ri) => {
      const total = row.reduce((s, q) => s + q.w + 16, 0) - 16; let x = 640 - total / 2; const y = 520 + (ri - (rows.length - 1) / 2) * 96;
      row.forEach(q => {
        const c = this.add.container(x + q.w / 2, y).setDepth(10); c.home = { x: c.x, y }; c.t = q.t.t; c.role = q.t.role; c.w = q.w; this.objs.push(c); this.tiles.push(c);
        c.add(addCard(this, 0, 0, q.w, 78, { r: 20, fill: ['#ffffff', '#fff6dc'], shadow: 6, lw: 3.5 })); c.add(fitText(glyph(this, 0, 0, tileLabel(q.t.t, q.t.role), R.letters ? 52 : 36, this.tcol(q.t.role)), q.w - 22));
        dragify(this, c, q.w, 78, {
          start: () => { if (this.busy()) return; c.setDepth(60); c.setScale(1.1); KG.audio.play('pop'); if (R.speakEach) this.speak(c.t); },
          drop: (x2, y2) => { if (this.busy()) { this.homeBack(c); return; } c.setScale(1); const s = this.slots.find(q2 => !q2.done && inBox(x2, y2, { x: q2.x - q2.w / 2, y: q2.y - q2.h / 2, w: q2.w, h: q2.h })); if (s) this.tryPlace(c, s); else this.homeBack(c); },
          tap: () => { if (this.busy()) return; if (R.speakEach) this.speak(c.t); const s = this.slots.find(q2 => !q2.done); if (s) this.tryPlace(c, s); }
        });
        x += q.w + 16; c.setScale(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 240, delay: 40 * this.tiles.length, ease: 'Back.easeOut' });
      });
    });
    this.say(this.ACT === 'sentbuild' ? 'ดูภาพว่าใครทำอะไร แล้วเรียงคำเป็นประโยคนะ' : this.ACT === 'sletters' ? 'เรียงตัวอักษรให้เป็นคำที่ภาพบอกนะ' : 'สะกดคำนี้ทีละชิ้น เริ่มที่ชื่อพยัญชนะต้นนะ', 'smile'); this.setPips(this.ri);
    this.time.delayedCall(450, () => { if (this.R === R && voice) this.speak(R.say); });
  }
  busy() { return this._modal || this.done || this.paused || this.locked; }
  tryPlace(c, s) {
    const R = this.R;
    if (c.t === R.tokens[s.i] && !c.placed) {
      c.placed = true; s.done = true; this.filled++; c.disableInteractive(); c.setDepth(30); c.list[0].setTint(0xc8ffd2);
      this.tweens.add({ targets: c, x: s.x, y: s.y, scaleX: Math.min(1, (s.w - 8) / c.w), scaleY: 1, duration: 240, ease: 'Back.easeOut' }); s.c.list[0].setTint(0xdfffe5); this.good(s.x, s.y);
      if (this.filled === R.tokens.length) { this.locked = true; this.setPips(this.ri + 1); this.time.delayedCall(450, () => this.complete()); }
    } else {
      this.mistakes++; this.bad(null); this.homeBack(c, true); this.tweens.add({ targets: s.c, x: s.x + 7, duration: 45, yoyo: true, repeat: 3, onComplete: () => { s.c.x = s.x; } });
      const k = s.i, what = R.slotHints ? R.slotHints[k] : ''; this.say('ช่องที่ ' + (k + 1) + (what ? ' ต้องเป็น “' + what + '”' : '') + ' ยังไม่ใช่ “' + tileLabel(c.t, c.role) + '” ลองใหม่นะ', 'sad');
    }
  }
  complete() {
    const R = this.R; this.speak(R.say); this.say('ถูกต้อง! ' + (this.ACT === 'sbuild' ? 'สะกดว่า ' + R.tokens.map((t, i) => R2.tokShow(t, R.tileRoles && R.tileRoles[i])).join(' ') : this.ACT === 'sentbuild' ? 'ประโยคคือ “' + R.final + '”' : 'คำนี้คือ “' + R.final + '”'), 'happy');
    this.tiles.filter(c => !c.placed).forEach(c => c.setVisible(false));
    const card = addCard(this, 640, 520, 1100, 130, { r: 30, fill: ['#e6ffe9', '#c8ffd2'], shadow: 6, lw: 4 }).setDepth(40), w = richText(this, 640, 520, R.final, 70, { maxW: 1000 }).setDepth(41); this.objs.push(card, w); [card, w].forEach(o => { o.setAlpha(0); this.tweens.add({ targets: o, alpha: 1, duration: 260 }); });
    this.time.delayedCall(R.final.length > 14 ? 2800 : 2000, () => { this.ri++; if (this.ri >= this.rounds.length) this.finish([['เรียงถูก', this.rounds.length + ' ข้อ']]); else this.startRound(); });
  }
  hint() {
    if (this.busy()) return; const s = this.slots.find(q => !q.done); if (!s) return; const c = this.tiles.find(q => !q.placed && q.t === this.R.tokens[s.i]); if (!c) return; this.hints++; KG.audio.play('pop');
    const g = this.add.graphics().setDepth(70); g.lineStyle(7, 0xffc82e, 1); g.strokeRoundedRect(s.x - s.w / 2 - 4, s.y - 50, s.w + 8, 100, 22); g.strokeRoundedRect(c.x - c.w / 2 - 4, c.y - 43, c.w + 8, 86, 22); this.tweens.add({ targets: g, alpha: 0.3, duration: 300, yoyo: true, repeat: 4, onComplete: () => g.destroy() });
    this.say('คำใบ้: ช่องที่ ' + (s.i + 1) + ' ใช้ชิ้นที่มีกรอบสีเหลือง', 'open');
  }
}
