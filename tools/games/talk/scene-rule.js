/* ===== Techno Talk: หลักภาษาของหน่วย (สอนว่าคำไหนใช้คู่กับคำไหน เช่น I คู่กับ am) =====
   เนื้อหามาจาก rules.js (RULES[หน่วย]) ทีละหน้า: การ์ดความหมาย · จับคู่ · สูตรประโยค · เปลี่ยนรูป · ถามตอบ · ข้อควรจำ
   แตะประโยคหรือคำภาษาอังกฤษทุกที่เพื่อฟังเสียง · เรียนครบทุกหน้า = ได้เครื่องหมายถูกที่หน่วย (ไม่มีดาว เหมือนเรียนคำศัพท์)
   กรอบหน้า: การ์ดใหญ่ x75-1205 y120-540 · หัวข้อ y156 · เนื้อหา y186-530 · ปุ่ม y590 */
const RULE_PAL = ['#ff7ab2', '#4aa8ff', '#ffb02e', '#58c864', '#a06af0'];
const RB = { top: 188, bot: 530 };
// ตำแหน่ง y ของแถวที่ k จาก n แถว ในช่วง top–bot (แถวน้อยก็ไม่ห่างกันเกินไป จัดกึ่งกลางช่วง)
const rowY = (k, n, top, bot, maxStep) => { const step = Math.min(maxStep || 128, (bot - top) / n); return (top + bot) / 2 + (k - (n - 1) / 2) * step; };
const pronOf = en => { const t = en.split(' ').map(x => x.replace(/[.,?!]/g, '')).find(x => ['I', 'i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(x.toLowerCase())); return t ? (t.toLowerCase() === 'i' ? 'I' : t.toLowerCase()) : null; };
class RuleScene extends ActBase {
  constructor() { super('Rule'); this.ACT = 'rule'; }
  init(d) { super.init(d); this.slides = RULES[this.unit.id] || []; this.i = 0; this.cc = null; }
  create() {
    this.begin(); this.hintBtn.setVisible(false);
    this.HOW = '1. แต่ละหน้าสอนหลักภาษาหนึ่งข้อ เช่น I ใช้คู่กับ am\n2. แตะคำหรือประโยคภาษาอังกฤษเพื่อฟังเสียงอ่าน แล้วพูดตาม\n3. หน้าจับคู่: แตะคำแทนตัว ดูว่าใช้คู่กับคำไหน\n4. คำสีส้มคือส่วนที่เปลี่ยนไป สังเกตให้ดีนะ\n5. เรียนครบทุกหน้าแล้วไปเขียนตามรอยและเล่นเกมต่อ';
    this.makePips(this.slides.length, 520);
    this.prev = new KG.ui.Button(this, 330, 590, 250, 66, { label: 'ก่อนหน้า', icon: 'chevL', style: 'ghost', size: 26, onClick: () => { if (this.i > 0) this.show(this.i - 1, -1); } });
    this.next = new KG.ui.Button(this, 950, 590, 300, 74, { label: 'ถัดไป', icon: 'chevR', style: 'primary', size: 30, onClick: () => this.advance() });
    this.show(0, 1);
  }
  advance() { if (this.i < this.slides.length - 1) this.show(this.i + 1, 1); else this.finishRule(); }
  show(i, dir) {
    this.i = i; const S = this.slides[i], old = this.cc, col = this.LV.color; this.pops = 0;
    if (old) this.tweens.add({ targets: old, x: -dir * 120, alpha: 0, duration: 160, onComplete: () => old.destroy(true) });
    const cc = this.cc = this.add.container(0, 0).setDepth(5);
    cc.add(addCard(this, 640, 330, 1130, 420, { r: 36, shadow: 10, fill: ['#ffffff', '#f7f1ff'] }));
    // หัวข้อ: เลขข้อ + ชื่อหลัก + ป้ายสูตรสั้น
    cc.add(this.add.circle(132, 158, 25, colN(col)).setStrokeStyle(4, 0x2d2a5e)); cc.add(KG.txt(this, 132, 158, String(i + 1), { size: 26, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }));
    const en = KG.txt(this, 0, 0, S.en, { size: 22, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 4 }), ew = Math.min(460, en.width + 40); fitText(en, ew - 30);
    cc.add(addCard(this, 1180 - ew / 2, 158, ew, 46, { r: 23, lw: 3, shadow: 3, fill: [this.A.color, shade(this.A.color, 0.9)] })); en.setPosition(1180 - ew / 2, 158); cc.add(en);
    const tt = KG.txt(this, 170, 158, S.t, { size: 32, color: TKC.ink, oy: 0.5 }); fitText(tt, 1180 - ew - 200); cc.add(tt);
    this['draw_' + S.k](cc, S);
    cc.setAlpha(0).x = dir * 120; this.tweens.add({ targets: cc, x: 0, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.setPips(i + 1); this.prev.setEnabled(i > 0); this.next.setLabel(i === this.slides.length - 1 ? 'เข้าใจแล้ว!' : 'ถัดไป'); KG.audio.play('tap');
    this.say(S.say, S.k === 'tip' ? 'open' : 'smile');
  }
  // วัตถุเด้งเข้ามาทีละชิ้น (ดูมีชีวิต)
  pop(o, base) { const sx = o.scaleX, sy = o.scaleY; o.setScale(sx * 0.6, sy * 0.6).setAlpha(0); this.tweens.add({ targets: o, scaleX: sx, scaleY: sy, alpha: 1, duration: 300, delay: (base || 120) + this.pops++ * 70, ease: 'Back.easeOut' }); return o; }
  tapSay(o, w, h, en, extra) {
    o.setSize(w, h).setInteractive({ useHandCursor: true });
    o.on('pointerup', () => { this.speak(en); KG.audio.play('pop'); this.tweens.add({ targets: o, scaleX: 1.08, scaleY: 1.08, duration: 110, yoyo: true }); if (extra) extra(); });
    return o;
  }
  // ป้ายคำเดี่ยว (คำแทนตัว คำช่วย ส่วนของสูตร)
  chip(x, y, text, o) {
    o = o || {}; const size = o.size || 28, t = KG.txt(this, 0, 0, text, { size, color: o.color || TKC.ink, center: true, middle: true, stroke: o.stroke ? TKC.ink : false, sw: 5 }), w = Math.max(o.minW || 0, t.width + (o.pad || 30)), h = o.h || size + 26;
    const c = this.add.container(x + (o.left ? w / 2 : 0), y); c.add(addCard(this, 0, 0, w, h, { r: h / 2, lw: 3.5, shadow: 4, fill: o.fill || ['#ffffff', '#f3ecff'] })); c.add(t); c.w = w; c.h = h; return c;
  }
  // ประโยคในลูกโป่งสีขาว ระบายสีประธาน คำใน hi (หรือส่วนท้ายคำ hiTail) เป็นสีส้ม
  sentBubble(x, y, en, o) {
    o = o || {}; const size = o.size || 30, font = '600 ' + size + 'px Kanit', p = pronOf(en), toks = en.split(' '), sp = KG.measure(' ', font) + 3, c = this.add.container(x, y);
    let w = toks.reduce((a, t) => a + KG.measure(t, font), 0) + sp * (toks.length - 1); const sc = o.maxW && w + 44 > o.maxW ? (o.maxW - 44) / w : 1, bw = w * sc + 44, bh = size * 1.25 * sc + 26;
    c.add(addCard(this, 0, 0, bw, bh, { r: Math.min(26, bh / 2), lw: 3, shadow: 4, fill: o.fill || ['#ffffff', '#fff6dc'] }));
    let cx = -w * sc / 2, subjDone = false;
    toks.forEach(tk => {
      const b = tk.replace(/[.,?!]/g, '').toLowerCase(), isP = !subjDone && p && b === p.toLowerCase(); if (isP) subjDone = true;
      const hiW = o.hi && o.hi.has(b), tw = KG.measure(tk, font) * sc;
      if (o.hiTail && toks.length === 1) {   // คำเดี่ยว: ส่วนท้ายที่เติมเป็นสีส้ม
        const head = tk.slice(0, o.hiTail), tail = tk.slice(o.hiTail), hw = KG.measure(head, font) * sc;
        c.add(KG.txt(this, cx, 0, head, { size: size * sc, color: TKC.ink, oy: 0.5 })); c.add(KG.txt(this, cx + hw, 0, tail, { size: size * sc, color: '#ff7a1a', oy: 0.5 })); c.add(this.add.rectangle(cx + hw + (tw - hw) / 2, size * 0.55 * sc, tw - hw, 4, 0xff7a1a));
      } else {
        c.add(KG.txt(this, cx, 0, tk, { size: size * sc, color: hiW ? '#ff7a1a' : isP ? PCOL[p] : TKC.ink, oy: 0.5 }));
        if (hiW) c.add(this.add.rectangle(cx + tw / 2, size * 0.55 * sc, tw, 4, 0xff7a1a));
      }
      cx += tw + sp * sc;
    });
    c.w = bw; c.h = bh; this.tapSay(c, bw, bh, en); return c;
  }
  arrow(x, y, color) { const c = this.add.container(x, y); c.add(this.add.circle(0, 0, 22, colN(color || '#ffb02e')).setStrokeStyle(3.5, 0x2d2a5e)); c.add(KG.ui.icon(this, 'chevR', 2, 0, 24, 0xffffff)); return c; }
  plus(x, y) { return KG.txt(this, x, y, '+', { size: 36, color: TKC.ink, center: true, middle: true }); }

  /* ---------- การ์ดความหมาย (คำแทนตัว 7 คำ) ---------- */
  draw_meaning(cc, S) {
    const n = S.items.length, top = Math.min(4, n), W = 252, H = 160;
    S.items.forEach((it, k) => {
      const row = k < top ? 0 : 1, inRow = row ? n - top : top, j = row ? k - top : k, x = 640 + (j - (inRow - 1) / 2) * 268, y = 272 + row * 172, colr = PCOL[it[0]] || TKC.purple;
      const c = this.add.container(x, y); c.add(addCard(this, 0, 0, W, H, { r: 28, lw: 3.5, shadow: 5, fill: ['#ffffff', mixWhite(colr, 0.86)] }));
      c.add(this.add.circle(-70, -14, 50, colN(mixWhite(colr, 0.7)))); c.add(pic(this, it[3], -70, -14, 96, 96));
      c.add(KG.txt(this, 48, -46, it[0], { size: 44, color: colr, center: true, middle: true, stroke: TKC.ink, sw: 4 })); const th = KG.txt(this, 48, 0, it[1], { size: 22, color: TKC.ink, center: true, middle: true }); fitText(th, 140); c.add(th);
      c.add(KG.txt(this, 0, 56, it[2], { size: 15, weight: 400, color: '#4a4780', center: true, middle: true, width: W - 24 }));
      this.tapSay(c, W, H, it[0]); cc.add(this.pop(c));
    });
  }
  /* ---------- จับคู่ประธานกับคำช่วย: แตะประธานแล้วคำคู่จะเด้ง ---------- */
  draw_pair(cc, S) {
    const n = S.groups.length, step = Math.min(128, (RB.bot - RB.top) / n);
    S.groups.forEach((g, k) => {
      const y = rowY(k, n, RB.top, RB.bot), gc = RULE_PAL[k % RULE_PAL.length], row = this.add.container(0, 0);
      row.add(addCard(this, 640, y, 1080, Math.min(96, step - 12), { r: 30, lw: 3, shadow: 0, fill: [mixWhite(gc, 0.82), mixWhite(gc, 0.9)], edge: shade(gc, 0.8) }));
      let x = 124; const help = this.chip(0, y, g.to, { size: 32, fill: [gc, shade(gc, 0.88)], color: '#ffffff', stroke: true, minW: 96, h: 62 });
      const subs = g.subs.map(s => { const c = this.chip(0, y, s, { size: 28, color: PCOL[s] || TKC.ink, minW: 64, h: 54 }); return c; });
      const seq = S.before ? [help, 'plus'].concat(subs) : subs.concat(['plus', help]);
      seq.forEach(o => { if (o === 'plus') { row.add(this.plus(x + 14, y)); x += 30; return; } o.x = x + o.w / 2; row.add(o); x += o.w + 10; });
      subs.forEach((c, j) => this.tapSay(c, c.w, c.h, S.before ? g.to + ' ' + g.subs[j] : g.subs[j] + ', ' + g.to, () => { this.tweens.killTweensOf(help); help.setScale(1); this.tweens.add({ targets: help, scaleX: 1.22, scaleY: 1.22, duration: 160, yoyo: true, ease: 'Quad.easeOut' }); KG.fx.burst(this, help.x, help.y, { colors: [colN(gc), 0xffffff, 0xffd34f], n: 12, max: 160, depth: 40 }); }));
      this.tapSay(help, help.w, help.h, g.to);
      row.add(this.arrow(x + 26, y, gc)); x += 62;
      const b = this.sentBubble(0, y, g.ex, { size: 28, maxW: 1166 - x }); b.x = x + b.w / 2; row.add(b);
      cc.add(this.pop(row));
    });
  }
  /* ---------- สูตรประโยค: ส่วนต่าง ๆ เป็นป้ายสี + หน้าที่ แล้วตามด้วยตัวอย่าง ---------- */
  draw_formula(cc, S) {
    const chips = S.parts.map((p, k) => this.chip(0, 244, p[0], { size: 40, fill: [RULE_PAL[k % RULE_PAL.length], shade(RULE_PAL[k % RULE_PAL.length], 0.88)], color: '#ffffff', stroke: true, minW: 92, h: 76 }));
    const total = chips.reduce((a, c) => a + c.w, 0) + (chips.length - 1) * 44; let x = 640 - total / 2;
    chips.forEach((c, k) => {
      c.x = x + c.w / 2; const role = KG.txt(this, c.x, 300, S.parts[k][1], { size: 18, color: '#6a64a0', center: true, middle: true }); fitText(role, c.w + 30);
      cc.add(this.pop(c)); cc.add(this.pop(role)); this.tapSay(c, c.w, c.h, S.parts[k][0]);
      if (k < chips.length - 1) cc.add(this.plus(x + c.w + 22, 244)); x += c.w + 44;
    });
    S.ex.forEach((e, j) => {
      const y = 372 + j * 60, b = this.sentBubble(0, y, e[0], { size: 28, maxW: 560 }); b.x = 560 - b.w / 2 + 40; cc.add(this.pop(b, 260));
      cc.add(this.pop(KG.txt(this, 640, y, e[1], { size: 24, color: '#6a64a0', oy: 0.5 }), 260));
    });
  }
  /* ---------- เปลี่ยนรูป: ก่อน › หลัง ส่วนที่เปลี่ยนเป็นสีส้ม ---------- */
  draw_change(cc, S) {
    const n = S.rows.length;
    S.rows.forEach((r, k) => {
      const y = rowY(k, n, RB.top, RB.bot - 44, 104), from = new Set(r[0].split(' ').map(t => t.replace(/[.,?!]/g, '').toLowerCase())), word = r[1].indexOf(' ') < 0;
      const hi = new Set(r[1].split(' ').map(t => t.replace(/[.,?!]/g, '').toLowerCase()).filter(t => !from.has(t)));
      let tailAt = 0; if (word) { while (tailAt < r[0].length && r[0][tailAt] === r[1][tailAt]) tailAt++; }
      cc.add(this.pop(this.sentBubble(360, y, r[0], { size: 30, maxW: 470 })));
      cc.add(this.pop(this.arrow(640, y, '#ff8a1e')));
      cc.add(this.pop(this.sentBubble(920, y, r[1], { size: 30, maxW: 470, hi: word ? null : hi, hiTail: word ? tailAt : 0, fill: ['#fffaf0', '#ffe9c7'] })));
    });
    if (S.note) { const nt = this.chip(640, RB.bot - 22, S.note, { size: 22, fill: ['#ff9a3c', '#ff7a1a'], color: '#ffffff', stroke: true, h: 46 }); cc.add(this.pop(nt, 300)); }
  }
  /* ---------- ถามตอบ: เด็กสองคนคุยกัน ---------- */
  draw_qa(cc, S) {
    const n = S.rows.length, step = Math.min(124, (RB.bot - RB.top) / n);
    S.rows.forEach((r, k) => {
      const y = rowY(k, n, RB.top, RB.bot, 124), sz = Math.min(84, step - 14);
      cc.add(this.pop(pic(this, K_('ben', 'smile'), 150, y + 4, sz, sz)));
      cc.add(this.pop(pic(this, K_('mei', 'happy'), 1130, y + 4, sz, sz)));
      const q = this.sentBubble(0, y, r[0], { size: 28, maxW: 430, fill: ['#eef6ff', '#d8eaff'] }); q.x = 214 + q.w / 2; cc.add(this.pop(q));
      const a = this.sentBubble(0, y, r[1], { size: 28, maxW: 430, fill: ['#fff0f7', '#ffd9ea'] }); a.x = 1066 - a.w / 2; cc.add(this.pop(a));
      cc.add(KG.txt(this, q.x - q.w / 2 - 2, y - q.h / 2 - 2, 'ถาม', { size: 15, color: '#3d8bff', oy: 1 })); cc.add(KG.txt(this, a.x + a.w / 2 + 2, y - a.h / 2 - 2, 'ตอบ', { size: 15, color: '#e83a8e', ox: 1, oy: 1 }));
    });
  }
  /* ---------- ข้อควรจำ: บรรทัดมีดาวนำหน้า + ตัวอย่างสองประโยค ---------- */
  draw_tip(cc, S) {
    S.lines.forEach((ln, j) => {
      const y = 222 + j * 56, row = this.add.container(0, 0);
      row.add(KG.ui.icon(this, 'star', 152, y, 34, 0xffb800)); const t = KG.txt(this, 186, y, ln, { size: 26, color: TKC.ink, oy: 0.5 }); fitText(t, 960); row.add(t); cc.add(this.pop(row));
    });
    const ex = S.ex || [], y = 222 + S.lines.length * 56 + 70;
    ex.forEach((e, j) => {
      const x = ex.length === 1 ? 640 : 380 + j * 520, b = this.sentBubble(x, y, e[0], { size: 30, maxW: 480 }); cc.add(this.pop(b, 260));
      cc.add(this.pop(KG.txt(this, x, y + b.h / 2 + 22, e[1], { size: 22, color: '#6a64a0', center: true, middle: true }), 260));
    });
  }
  finishRule() {
    SAVE.data.rule = SAVE.data.rule || {}; SAVE.data.rule[this.unit.id] = true; SAVE.data.unit = this.unit.id; SAVE.data.level = this.unit.level; SAVE.save(); KG.audio.play('win'); KG.fx.confetti(this, { ms: 1200 });
    this.say('เข้าใจหลักภาษาแล้ว! ไปฝึกเขียนและเล่นเกมต่อได้เลย', 'happy');
    const nxt = nextActOf('rule');
    KG.ui.modal(this, { title: 'เข้าใจหลักภาษาแล้ว!', w: 780, accent: 0x8a5cf0, body: 'เก่งมาก! เรียนหลักภาษาของหน่วย “' + this.unit.en + '” ครบ ' + this.slides.length + ' ข้อแล้ว\n' + (UNIT_TIP[this.unit.kind] || ''),
      buttons: [{ label: 'ทบทวนอีกรอบ', style: 'ghost', icon: 'reset', onClick: () => this.show(0, -1) }, { label: 'กลับหน่วย', style: 'cyan', icon: 'flag', onClick: () => this.leave() }, { label: nxt.th, style: 'primary', icon: 'play', pulse: true, onClick: () => this.go(nxt.scene, { unit: this.unit.id }) }] });
  }
}
