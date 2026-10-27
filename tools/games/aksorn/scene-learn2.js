/* ===== Techno Aksorn รอบ 2: บัตรเรียนรู้ของ รูปวรรณยุกต์ · เสียงวรรณยุกต์ · ชุดผันเสียง · มาตรา · การสะกดคำ · ประโยค =====
   ต่อเข้ากับ LearnScene (scene-learn.js เรียกเมธอดเหล่านี้จาก show() ตามชนิดของรายการ inf.kind: g n f m w s) */
const FAM_COL = { m: '#3d8bff', h: '#ff5a8a', l: '#3fb54a' };
LearnScene.prototype.enter = function (i, dir, old, build, sayTxt, speakTxt) {
  this.i = i; if (old) this.tweens.add({ targets: old, x: -dir * 120, alpha: 0, duration: 160, onComplete: () => old.destroy(true) });
  const cc = this.cc = this.add.container(0, 0).setDepth(5); build(cc);
  cc.setAlpha(0).x = dir * 120; this.tweens.add({ targets: cc, x: 0, alpha: 1, duration: 260, ease: 'Back.easeOut' });
  this.setPips(i + 1); this.prev.setEnabled(i > 0); this.next.setLabel(i === this.deck.length - 1 ? 'เรียนครบแล้ว' : 'ถัดไป'); KG.audio.play('tap'); this.say(sayTxt, 'book');
  if (speakTxt) this.time.delayedCall(320, () => { if (this.cc === cc && SPEECH.can) this.speak(speakTxt); });
  return cc;
};
// ปุ่มฟัง (ฟังไม่ได้ = ปิดปุ่ม)
LearnScene.prototype.listenBtn = function (cc, x, y, label, text, w) {
  const b = this.listen = new KG.ui.Button(this, x, y, w || 280, 54, { label: SPEECH.exists ? label : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 23, onClick: () => { this.speak(text); this.tweens.add({ targets: b, scaleX: 1.06, scaleY: 1.06, duration: 120, yoyo: true }); } });
  b.setEnabled(SPEECH.exists); cc.add(b); return b;
};
// การ์ดเล็กแตะเพื่อฟัง: ภาพ (ถ้ามี) + ข้อความสี
LearnScene.prototype.wordCard = function (cc, x, y, w, h, word, o) {
  o = o || {}; const c = this.add.container(x, y), pc = R2.picOf(word); c.add(addCard(this, 0, 0, w, h, { r: 26, lw: 3.5, shadow: 6, fill: ['#ffffff', '#f6f0ff'] }));
  if (pc && o.pic !== false && h < 150) { c.add(pic(this, pc, -w * 0.27, 0, h - 30)); c.add(richText(this, w * 0.17, 0, word, o.size || 54, { maxW: w * 0.52 })); }
  else if (pc && o.pic !== false) { c.add(pic(this, pc, 0, -h * 0.2, Math.min(w - 50, h * 0.5))); c.add(richText(this, 0, h * 0.28, word, o.size || 54, { maxW: w - 24 })); }
  else c.add(richText(this, 0, o.sub ? -14 : 0, word, o.size || 70, { maxW: w - 24 }));
  if (o.sub) c.add(fitText(KG.txt(this, 0, h / 2 - 24, o.sub, { size: 17, weight: 400, color: '#6a64a0', center: true, middle: true }), w - 20));
  c.setSize(w, h).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { this.speak(o.say || word); KG.audio.play('pop'); this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true }); }); cc.add(c); return c;
};
// เรียงเสียงทีละชิ้น: เน้นชิ้นที่กำลังอ่านและพูดตามลำดับ
LearnScene.prototype.sequence = function (cc, items, gap) {
  const id = this._seq = (this._seq || 0) + 1; items.forEach((it, k) => this.time.delayedCall(k * (gap || 1000), () => { if (this._seq !== id || this.cc !== cc) return; if (it.obj) this.tweens.add({ targets: it.obj, scaleX: 1.14, scaleY: 1.14, duration: 160, yoyo: true }); this.speak(it.say); KG.audio.play('tick', { p: 1.1 }); }));
};

/* ---------- รูปวรรณยุกต์ (ไม้เอก ไม้โท ไม้ตรี ไม้จัตวา) แสดงเป็นขีดแทนพยัญชนะ ไม่ใช้ อ ---------- */
LearnScene.prototype.showMark = function (i, dir, inf, old) {
  const mk = inf.key.slice(1), exs = R2.MARK_EX[inf.key];
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: '#17c4a8' }, fill: ['#ffffff', '#f2fffb'], shadow: 10 }));
    cc.add(KG.txt(this, 290, 150, 'รูปวรรณยุกต์', { size: 26, color: '#17a28a', center: true, middle: true }));
    cc.add(richText(this, 290, 296, '–' + mk, 210, { roles: 'ct', maxW: 420 })); cc.add(fitText(KG.txt(this, 290, 470, inf.say, { size: 46, color: TKC.ink, center: true, middle: true }), 450));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    cc.add(KG.txt(this, 906, 172, 'ตัวอย่างคำ แตะเพื่อฟัง', { size: 26, color: '#6a64a0', center: true, middle: true }));
    exs.forEach((w, k) => this.wordCard(cc, 906 + (k - 1) * 220, 328, 200, 230, w, { size: 50 }));
    cc.add(colorLegend(this, 906, 478, { which: ['c', 'v', 't'], size: 17 })); this.listenBtn(cc, 906, 524, 'ฟังชื่อ', inf.say, 240);
  }, 'นี่คือ ' + inf.say + ' เขียนอยู่ข้างบนพยัญชนะ ใช้บอกเสียงของคำ ฟังแล้วพูดตามนะ', inf.say);
};
/* ---------- เสียงวรรณยุกต์ 5 เสียง ---------- */
LearnScene.prototype.showTone = function (i, dir, inf, old) {
  const t = R2.TONES[inf.tone];
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: '#17c4a8' }, fill: ['#ffffff', '#f2fffb'], shadow: 10 }));
    cc.add(KG.txt(this, 290, 150, 'เสียงวรรณยุกต์', { size: 26, color: '#17a28a', center: true, middle: true }));
    cc.add(fitText(glyph(this, 290, 270, t.name, 130, TKC.ink), 440)); cc.add(fitText(KG.txt(this, 290, 380, t.say, { size: 42, color: '#6a64a0', center: true, middle: true }), 450));
    cc.add(fitText(KG.txt(this, 290, 462, t.desc, { size: 24, weight: 400, color: '#4a4780', center: true, middle: true, width: 440 }), 450));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    cc.add(KG.txt(this, 906, 172, 'ตัวอย่างพยางค์ แตะเพื่อฟัง', { size: 26, color: '#6a64a0', center: true, middle: true }));
    inf.ex.forEach((s, k) => { const sy = R2.SYL[s], tx = sy ? R2.CLS_TH[sy.cls] + (sy.mark ? ' · ' + R2.MARK_NAME[sy.mark] : ' · ไม่มีรูป') : ''; this.wordCard(cc, 906 + (k - 1) * 220, 328, 200, 230, s, { size: 76, sub: tx, pic: false }); });
    cc.add(colorLegend(this, 906, 478, { which: ['c', 'v', 't'], size: 17 })); this.listenBtn(cc, 906, 524, 'ฟังเสียงนี้', inf.ex.join(' '), 260);
  }, 'นี่คือ ' + t.say + ' ' + t.desc + ' แตะตัวอย่างพยางค์แล้วลองออกเสียงตามนะ', t.say);
};
/* ---------- ตารางผันเสียง (ตามตารางหลักการผันเสียงวรรณยุกต์ของครู) ---------- */
LearnScene.prototype.showFamily = function (i, dir, inf, old) {
  const f = inf.fam, col = FAM_COL[f], bg = { m: ['#fff0e8', '#ffe0d2'], h: ['#fffbd2', '#fff4a8'], l: ['#e4fbe0', '#c8f3c2'] }[f], rows = inf.rows, nr = rows.length;
  const lw = 220, cw = 168, g = 8, tx = 90, hy = 214, rh = nr === 3 ? 78 : 96, ry = k => (nr === 3 ? 282 : 296) + k * (rh + 6), cx = k => tx + lw + g + cw / 2 + k * (cw + g);
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 640, 340, 1200, 440, { r: 34, band: { h: 64, color: col }, fill: ['#ffffff', '#f6f0ff'], shadow: 10 }));
    cc.add(KG.txt(this, 640, 152, inf.sub + ' ผันเสียงได้ดังนี้', { size: 32, color: '#ffffff', center: true, middle: true, stroke: TKC.ink, sw: 5 }));
    R2.TONE_IDS.forEach((t, k) => { const h = this.add.container(cx(k), hy); h.add(addCard(this, 0, 0, cw, 42, { r: 14, lw: 3, shadow: 0, fill: ['#e2f4ff', '#c9ebff'] })); h.add(KG.txt(this, 0, 0, R2.TONES[t].name, { size: 24, color: TKC.ink, center: true, middle: true })); cc.add(h); });
    const items = [];
    rows.forEach((r, ri) => {
      const L = this.add.container(tx + lw / 2, ry(ri)); L.add(addCard(this, 0, 0, lw, rh, { r: 16, lw: 3, shadow: 0, fill: bg })); L.add(fitText(KG.txt(this, 0, 0, r.th, { size: 24, color: TKC.ink, center: true, middle: true }), lw - 20)); cc.add(L);
      r.cells.forEach((cell, k) => {
        const c = this.add.container(cx(k), ry(ri)); c.add(addCard(this, 0, 0, cw, rh, { r: 16, lw: 3, shadow: 3, fill: cell ? ['#ffffff', bg[0]] : ['#f1eefa', '#e8e3f6'] }));
        if (cell) {
          c.add(richText(this, 0, 0, cell.text, nr === 3 ? 46 : 56, { maxW: cw - 16 }));
          c.setSize(cw, rh).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { this.speak(cell.text); KG.audio.play('pop'); this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true }); }); items.push({ obj: c, say: cell.text });
        } else c.add(KG.txt(this, 0, 0, '–', { size: 36, color: '#a39cc4', center: true, middle: true }));
        cc.add(c);
      });
    });
    cc.add(colorLegend(this, 420, 528, { which: ['c', 'v', 't'], size: 17 }));
    const bt = new KG.ui.Button(this, 900, 528, 300, 54, { label: SPEECH.exists ? 'ฟังทีละเสียง' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 23, onClick: () => this.sequence(cc, items, 1000) }); bt.setEnabled(SPEECH.exists); cc.add(bt); this.listen = bt;
  }, 'นี่คือตารางผันเสียงของ ' + inf.sub + ' ช่องที่เป็นขีด – คือไม่มีเสียงนั้น แตะแต่ละช่องเพื่อฟังนะ', inf.say);
};
/* ---------- กฎ: หมู่อักษร (กลาง สูง ต่ำ + คำท่องจำ) · คำเป็น คำตาย ---------- */
LearnScene.prototype.showRule = function (i, dir, inf, old) { return inf.rule === 'cls' ? this.showClass(i, dir, inf, old) : this.showLive(i, dir, inf, old); };
LearnScene.prototype.showClass = function (i, dir, inf, old) {
  const f = inf.cls, c = inf.cdata, col = FAM_COL[f], low = f === 'l';
  const tile = (cc, x, y, w, h, ch, size) => {
    const t = this.add.container(x, y); t.add(addCard(this, 0, 0, w, h, { r: 14, lw: 3, shadow: 3, fill: ['#ffffff', '#f6f0ff'] })); t.add(glyph(this, 0, -1, ch, size, ROLE_COL.c));
    t.setSize(w, h).setInteractive({ useHandCursor: true }); t.on('pointerup', () => { this.speak(AK.info(ch).say); KG.audio.play('pop'); this.tweens.add({ targets: t, scaleX: 1.12, scaleY: 1.12, duration: 110, yoyo: true }); }); cc.add(t);
  };
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: col }, fill: ['#ffffff', '#f7f1ff'], shadow: 10 }));
    cc.add(KG.txt(this, 290, 150, 'หมู่ของพยัญชนะ', { size: 26, color: '#6a64a0', center: true, middle: true }));
    cc.add(fitText(glyph(this, 290, 232, c.name, 72, TKC.ink), 450)); cc.add(KG.txt(this, 290, 300, 'มี ' + c.count + ' ตัว', { size: 40, color: col, center: true, middle: true }));
    cc.add(KG.txt(this, 290, 364, low ? 'ต่ำคู่ ' + c.pairs.length + ' ตัว + ต่ำเดี่ยว ' + c.singles.length + ' ตัว' : 'คำท่องจำ', { size: low ? 26 : 24, weight: 400, color: '#6a64a0', center: true, middle: true }));
    cc.add(fitText(KG.txt(this, 290, 428, (low ? 'ต่ำเดี่ยวท่องว่า\n' : '') + '“' + c.phrase + '”', { size: low ? 25 : 32, color: TKC.ink, center: true, middle: true, width: 440, align: 'center' }), 450));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    if (!low) {
      cc.add(KG.txt(this, 906, 172, 'แตะคำเพื่อฟัง ดูตัวอักษรของแต่ละคำ', { size: 26, color: '#6a64a0', center: true, middle: true }));
      const n = c.rhyme.length, w = 88, gap = 8, x0 = 906 - (n * w + (n - 1) * gap) / 2 + w / 2;
      c.rhyme.forEach((r, k) => {
        const ch = this.add.container(x0 + k * (w + gap), 340); ch.add(addCard(this, 0, 0, w, 250, { r: 20, lw: 3.5, shadow: 6, fill: ['#ffffff', '#f6f0ff'] }));
        ch.add(fitText(KG.txt(this, 0, -92, r[0], { size: 28, color: TKC.ink, center: true, middle: true }), w - 8)); ch.add(KG.txt(this, 0, -62, '▾', { size: 18, weight: 400, color: '#a39cc4', center: true, middle: true }));
        Array.from(r[1]).forEach((l, q) => ch.add(glyph(this, 0, -18 + q * 52, l, 44, col)));
        ch.setSize(w, 250).setInteractive({ useHandCursor: true }); ch.on('pointerup', () => { this.speak(r[0]); KG.audio.play('pop'); this.tweens.add({ targets: ch, scaleX: 1.07, scaleY: 1.07, duration: 120, yoyo: true }); }); cc.add(ch);
      });
    } else {
      cc.add(KG.txt(this, 906, 170, 'แตะตัวอักษรเพื่อฟังชื่อ', { size: 24, color: '#6a64a0', center: true, middle: true }));
      cc.add(KG.txt(this, 906, 206, 'ต่ำคู่ 14 ตัว (เสียงคู่กับอักษรสูง)', { size: 22, color: '#2a8a38', center: true, middle: true }));
      c.pairs.forEach((ch, k) => tile(cc, 906 + ((k % 7) - 3) * 88, 252 + Math.floor(k / 7) * 62, 80, 54, ch, 38));
      cc.add(KG.txt(this, 906, 372, 'ต่ำเดี่ยว 10 ตัว', { size: 22, color: '#2a8a38', center: true, middle: true }));
      c.singles.forEach((ch, k) => tile(cc, 906 + (k - 4.5) * 66, 418, 60, 54, ch, 36));
    }
    this.listenBtn(cc, 906, 512, low ? 'ฟังคำท่องของต่ำเดี่ยว' : 'ฟังคำท่อง', c.phrase, low ? 330 : 260);
  }, low ? 'นี่คือ ' + c.name + ' มี 24 ตัว แบ่งเป็นต่ำคู่ 14 ตัวกับต่ำเดี่ยว 10 ตัว แตะตัวอักษรเพื่อฟังชื่อนะ' : 'นี่คือ ' + c.name + ' มี ' + c.count + ' ตัว ท่องจำว่า “' + c.phrase + '” แตะแต่ละคำเพื่อดูตัวอักษรนะ', c.name + ' ' + c.phrase);
};
LearnScene.prototype.showLive = function (i, dir, inf, old) {
  const l = inf.ldata;
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: l.color }, fill: ['#ffffff', '#f7f1ff'], shadow: 10 }));
    cc.add(KG.txt(this, 290, 150, 'ชนิดของคำ', { size: 26, color: '#6a64a0', center: true, middle: true }));
    cc.add(fitText(glyph(this, 290, 270, l.th, 76, TKC.ink), 450));
    cc.add(fitText(KG.txt(this, 290, 400, l.tip, { size: 26, weight: 400, color: '#4a4780', center: true, middle: true, width: 430, align: 'center' }), 450));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    cc.add(KG.txt(this, 906, 168, 'ตัวอย่างคำ แตะเพื่อฟัง', { size: 26, color: '#6a64a0', center: true, middle: true }));
    l.ex.forEach((w, k) => this.wordCard(cc, 906 + (k - 1.5) * 164, 252, 154, 112, w, { size: 40, pic: false }));
    cc.add(KG.txt(this, 580, 326, l.rules.join('\n'), { size: 23, weight: 400, color: '#4a4780', ox: 0, oy: 0, width: 650 }));
    this.listenBtn(cc, 906, 522, 'ฟังชื่อ', l.say, 240);
  }, 'นี่คือ ' + l.th + ' ' + l.tip + ' ดูกติกาและตัวอย่างนะ', l.say);
};
/* ---------- มาตราตัวสะกด ---------- */
LearnScene.prototype.showMatra = function (i, dir, inf, old) {
  const m = inf.mt, col = R2.MT_COL[R2.MATRA.findIndex(q => q.id === m.id)];
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: col }, fill: ['#ffffff', '#f7f1ff'], shadow: 10 }));
    cc.add(fitText(glyph(this, 290, 190, m.text, 84, TKC.ink), 440)); cc.add(fitText(KG.txt(this, 290, 270, m.note, { size: 30, color: '#6a64a0', center: true, middle: true }), 450));
    if (m.fin.length) { const rows = m.fin.length > 8 ? [m.fin.slice(0, 8), m.fin.slice(8)] : [m.fin]; rows.forEach((r, k) => cc.add(fitText(glyph(this, 290, 352 + k * 62, r.join('  '), rows.length > 1 ? 44 : 58, ROLE_COL.f), 440))); }
    else cc.add(KG.txt(this, 290, 352, 'ไม่มีตัวสะกด', { size: 40, color: '#6a64a0', center: true, middle: true }));
    cc.add(fitText(KG.txt(this, 290, 462, m.tip, { size: 21, weight: 400, color: '#4a4780', center: true, middle: true, width: 440 }), 450));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    cc.add(KG.txt(this, 906, 172, 'ตัวอย่างคำในแม่นี้ แตะเพื่อฟัง', { size: 26, color: '#6a64a0', center: true, middle: true }));
    const ex = inf.ex.slice(0, 4); ex.forEach((w, k) => this.wordCard(cc, 906 + ((k % 2) - 0.5) * 320, 256 + Math.floor(k / 2) * 142, 300, 130, w, { size: 50 }));
    cc.add(colorLegend(this, 906, 494, { which: m.fin.length ? ['c', 'v', 'f'] : ['c', 'v'], size: 17 })); this.listenBtn(cc, 906, 532, 'ฟังชื่อแม่', m.say, 240);
  }, 'นี่คือ ' + m.text + ' ' + m.tip + ' ลองอ่านคำตัวอย่างนะ', m.say);
};
/* ---------- การสะกดคำ ---------- */
LearnScene.prototype.showWord = function (i, dir, inf, old) {
  const sp = inf.spell, tk = sp.tokens, n = tk.length, w = inf.text, pc = inf.pic;
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: '#ff8a1e' }, fill: ['#ffffff', '#fff8ee'], shadow: 10 }));
    if (pc) cc.add(pic(this, pc, 290, 262, 300, 260)); cc.add(richText(this, 290, pc ? 450 : 330, w, pc ? 100 : 150, { maxW: 450 }));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    cc.add(KG.txt(this, 906, 168, 'สะกดว่า (แตะชิ้นไหนก็ฟังได้)', { size: 26, color: '#6a64a0', center: true, middle: true }));
    const perRow = n > 3 ? Math.ceil(n / 2) : n, rows = n > 3 ? 2 : 1, items = [];
    tk.forEach((t, k) => {
      const r = Math.floor(k / perRow), c = k % perRow, cnt = r === rows - 1 ? n - perRow * (rows - 1) : perRow, last = k === n - 1, cw = last ? 190 : 150, x = 906 + (c - (cnt - 1) / 2) * 180, y = rows === 1 ? 300 : 262 + r * 112, ch = this.add.container(x, y);
      ch.add(addCard(this, 0, 0, cw, 92, { r: 22, lw: 3.5, shadow: 5, fill: last ? ['#e6ffe9', '#c8ffd2'] : ['#ffffff', '#fff6dc'] }));
      if (last) ch.add(richText(this, 0, 0, t, 52, { maxW: cw - 14 })); else ch.add(fitText(glyph(this, 0, 0, R2.tokShow(t, sp.roles[k]), 38, R2.SP_COL[sp.roles[k]] || TKC.ink), cw - 14));
      ch.setSize(cw, 92).setInteractive({ useHandCursor: true }); ch.on('pointerup', () => { this.speak(t); KG.audio.play('pop'); this.tweens.add({ targets: ch, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true }); }); cc.add(ch); items.push({ obj: ch, say: t });
    });
    const roles = uniq2(sp.roles.split('').filter(r => 'cvft'.includes(r))); cc.add(colorLegend(this, 906, 446, { which: ['c', 'v', 'f', 't'].filter(r => roles.includes(r)), size: 17 }));
    const b = new KG.ui.Button(this, 906, 504, 300, 56, { label: SPEECH.exists ? 'สะกดให้ฟัง' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 24, onClick: () => this.sequence(cc, items, 1000) }); b.setEnabled(SPEECH.exists); cc.add(b); this.listen = b; this._autoSeq = { cc, items };
  }, 'สะกดคำว่า ' + w + ' ทีละชิ้น: ' + tk.map((t, k) => R2.tokShow(t, sp.roles[k])).join(' - ') + ' แตะแต่ละชิ้นเพื่อฟังนะ', null);
  const cc = this.cc, items = this._autoSeq && this._autoSeq.items; if (items) this.time.delayedCall(500, () => { if (this.cc === cc && SPEECH.can) this.sequence(cc, items, 1000); });
};
const uniq2 = a => a.filter((x, i) => a.indexOf(x) === i);
/* ---------- ประโยค ---------- */
LearnScene.prototype.showSent = function (i, dir, inf, old) {
  const s = inf.sent;
  this.enter(i, dir, old, cc => {
    cc.add(addCard(this, 290, 340, 500, 440, { r: 34, band: { h: 16, color: '#ee4a4a' }, fill: ['#ffffff', '#fff3ee'], shadow: 10 }));
    cc.add(pic(this, s.pic, 290, 330, 440, 380));
    cc.add(addCard(this, 906, 340, 700, 440, { r: 34, fill: ['#fffaf0', '#fff0cf'], shadow: 10 }));
    cc.add(KG.txt(this, 906, 168, 'ประโยคนี้เรียงคำแบบนี้ (แตะคำเพื่อฟัง)', { size: 26, color: '#6a64a0', center: true, middle: true }));
    const wd = s.words.map(w => Math.max(120, Math.min(300, KG.measure(w, '700 40px Sarabun') * 0.7 + 50))), rows = [[]]; let rw = 0;
    wd.forEach((w, k) => { if (rw + w > 640 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(k); rw += w + 14; });
    const items = [];
    rows.forEach((row, r) => {
      const tot = row.reduce((q, k) => q + wd[k] + 14, 0) - 14; let x = 906 - tot / 2; const y = 302 + (r - (rows.length - 1) / 2) * 138;
      row.forEach(k => {
        const role = s.roles[k], word = s.words[k], col = R2.ROLE_COL2[role], c = this.add.container(x + wd[k] / 2, y); c.add(addCard(this, 0, 0, wd[k], 84, { r: 22, lw: 4, shadow: 5, fill: ['#ffffff', '#fff6dc'], edge: col }));
        c.add(fitText(glyph(this, 0, 0, word, 40, col), wd[k] - 16)); c.add(fitText(KG.txt(this, 0, 62, R2.ROLE_NAME[role], { size: 17, weight: 400, color: col, center: true, middle: true }), wd[k] + 20));
        c.setSize(wd[k], 84).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { this.speak(word); KG.audio.play('pop'); this.tweens.add({ targets: c, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true }); }); cc.add(c); items.push({ obj: c, say: word }); x += wd[k] + 14;
      });
    });
    const b = new KG.ui.Button(this, 906, 500, 320, 56, { label: SPEECH.exists ? 'อ่านประโยค' : 'ไม่มีเสียงอ่าน', icon: 'sound', style: 'cyan', size: 24, onClick: () => { this.speak(s.text); } }); b.setEnabled(SPEECH.exists); cc.add(b); this.listen = b;
  }, 'ประโยคนี้คือ “' + s.text + '” ดูว่าใครทำอะไร แล้วแตะแต่ละคำเพื่อฟังนะ', s.text);
};
