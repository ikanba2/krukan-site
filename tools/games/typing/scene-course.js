/* ===== หัดพิมพ์สัมผัส: เลือกบทเรียน (ซ้าย 13 บท แต่ละบทมี 4 ด่าน) · รายละเอียดบท แป้นใหม่ นิ้วที่ใช้ และปุ่มเริ่ม (ขวา) =====
   คีย์ลัด: ↑ ↓ เลือกบท · ← → เลือกด่าน · 1–4 เริ่มด่านนั้น · Enter เริ่มด่านที่เลือก · L สลับภาษา · Esc กลับหน้าแรก */
class CourseScene extends KG.Scene {
  constructor() { super('Course'); }
  init(d) { d = d || {}; this._modal = null; this.lang = d.lang || SAVE.data.lang; const n = nextCourse(this.lang); this.li = d.lesson != null ? d.lesson : n.lesson; this.si = d.stage || (d.lesson != null ? 1 : n.stage); this.rows = []; this.detail = null; this._restartData = { lang: this.lang, lesson: this.li, stage: this.si }; }
  create() {
    this.setup(); KG.audio.music('menu');
    this.add.image(GW / 2, GH / 2, 'arena_ice').setDisplaySize(GW * 1.1, GH * 1.1);
    this.add.image(GW / 2, GH / 2, KG.tex(this, 'tycourseshade', GW, GH, ctx => { ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, GH, [[0, 'rgba(5,8,28,.9)'], [1, 'rgba(5,8,28,.96)']]); ctx.fillRect(0, 0, GW, GH); })).setDisplaySize(GW, GH);
    KG.fx.ambient(this, { freq: 220, colors: [0x4ef4d2, 0xffd34f, 0xffffff] });
    iconButton(this, 56, 40, 'home', () => this.go('Title'), { w: 60, h: 52 });
    this.txt(100, 6, 'TYPE HERO · พิมพ์สัมผัส', { size: 18, color: '#4ef4d2' }); this.txt(100, 26, 'หัดพิมพ์สัมผัส', { size: 32, stroke: true });
    this.langBtns = {
      th: new KG.ui.Button(this, 420, 40, 130, 48, { label: 'ไทย', style: 'ghost', size: 22, slant: 8, onClick: () => this.setLang('th') }),
      en: new KG.ui.Button(this, 562, 40, 150, 48, { label: 'English', style: 'ghost', size: 22, slant: 8, onClick: () => this.setLang('en') })
    };
    this.txt(372, 40, 'L', { size: 13, color: '#050818', ox: 1, oy: 0.5 }).setBackgroundColor('#ffd34f').setPadding(4, 0, 4, 0);
    this.starTxt = this.txt(GW - 330, 24, '', { size: 22, color: '#ffd34f', stroke: true, ox: 1 }); KG.ui.icon(this, 'star', GW - 322, 38, 28, 0xffd34f);
    addSystemButtons(this, GW - 266, 40, 70, ['sfx', 'music']);
    iconButton(this, GW - 126, 40, 'expand', () => KG.fullscreen(), { w: 60, h: 52 });
    iconButton(this, GW - 56, 40, 'help', () => showTouchHelp(this), { w: 56, h: 52 });
    KG.ui.panel(this, 836, 86, 420, 620, { accent: '#4ef4d2', cuts: [24, 0, 24, 0] });
    this.list = this.add.container(0, 0);
    this.refresh(true);
    this.input.keyboard.on('keydown', e => this.onKey(e));
    if (!SAVE.data.touchHelpSeen) { SAVE.data.touchHelpSeen = true; SAVE.save(); this.time.delayedCall(500, () => showTouchHelp(this)); }
  }
  onEscape() { if (this._modal && !this._modal.closed) { this._modal.close(); return; } this.go('Title'); }
  setLang(l) { if (l === this.lang) return; this.lang = l; SAVE.data.lang = l; SAVE.save(); KG.audio.play('tap'); const n = nextCourse(l); this.li = n.lesson; this.si = n.stage; this.refresh(true); }
  refresh(anim) {
    Object.keys(this.langBtns).forEach(k => { this.langBtns[k].setActive(k === this.lang); this.langBtns[k].label.setColor(k === this.lang ? '#ffd34f' : '#f4f7ff'); });
    this.starTxt.setText('ดาวพิมพ์สัมผัส ' + courseTotal(this.lang) + '/' + courseMax(this.lang));
    this.buildList(anim); this.showDetail();
  }
  /* ---------- รายการบท ---------- */
  buildList(anim) {
    this.list.removeAll(true); this.rows = [];
    CL[this.lang].forEach((L, i) => {
      const y = 88 + i * 47, c = this.add.container(24, y); this.list.add(c);
      const g = this.add.graphics(); c.add(g);
      c.add(KG.txt(this, 30, 22, L.final ? '★' : String(i + 1), { size: 20, color: '#04221e', center: true, middle: true }));
      c.add(KG.txt(this, 62, 4, L.title, { size: 19 }));
      const keys = L.final ? 'ทุกแป้น' : [...L.keys].map(keyLabel).join(' ');
      const kt = KG.txt(this, 62, 26, keys, { size: 14, color: '#4ef4d2' }); if (kt.width > 470) kt.setScale(470 / kt.width); c.add(kt);
      const nodes = [];
      CS.forEach((S, k) => {
        const x = 590 + k * 54, st = courseStars(this.lang, i, S.id), ng = this.add.graphics(); c.add(ng);
        const draw = on => { ng.clear(); ng.fillStyle(st === 3 ? 0xffb800 : st ? 0x2c6bff : 0x111a46, 1); ng.fillRoundedRect(x - 22, 3, 44, 38, 9); ng.lineStyle(on ? 3 : 1.5, on ? 0xffffff : (S.blind ? 0xff7ab2 : 0x3a4ca6), 1); ng.strokeRoundedRect(x - 22, 3, 44, 38, 9); };
        draw(false); c.add(S.blind ? KG.ui.icon(this, 'eye', x, 17, 18, st === 3 ? 0x2a1c00 : 0xffffff) : KG.txt(this, x, 17, String(S.id), { size: 18, color: st === 3 ? '#2a1c00' : '#ffffff', center: true, middle: true }));
        for (let s2 = 0; s2 < 3; s2++) c.add(KG.ui.icon(this, s2 < st ? 'star' : 'starO', x - 12 + s2 * 12, 33, 10, s2 < st ? 0xffd34f : 0x4a5aa8));
        const z = this.add.zone(x, 22, 48, 42).setInteractive({ useHandCursor: true }); c.add(z);
        z.on('pointerup', () => { this.select(i, S.id); }); z.on('pointerover', () => KG.audio.play('hover'));
        nodes.push({ draw, S });
      });
      const zr = this.add.zone(270, 22, 540, 44).setInteractive({ useHandCursor: true }); c.add(zr); zr.on('pointerup', () => this.select(i, this.li === i ? this.si : 1));
      const row = { c, g, nodes, draw: on => { g.clear(); g.fillStyle(on ? 0x16245e : 0x0a1030, on ? 0.98 : 0.86); g.fillRoundedRect(0, 0, 800, 44, 10); g.lineStyle(on ? 3 : 1.5, on ? 0x4ef4d2 : 0x2f3d84, 1); g.strokeRoundedRect(0, 0, 800, 44, 10); g.fillStyle(L.final ? 0xffd34f : 0x4ef4d2, 1); g.fillCircle(30, 22, 15); } };
      row.draw(i === this.li); nodes.forEach(n => n.draw(i === this.li && n.S.id === this.si)); this.rows.push(row);
      if (anim) { c.setAlpha(0).x -= 24; this.tweens.add({ targets: c, x: 24, alpha: 1, duration: 240, delay: i * 30, ease: 'Cubic.easeOut' }); }
    });
  }
  select(i, s, quiet) {
    const was = this.li; this.li = i; this.si = s; this._restartData = { lang: this.lang, lesson: i, stage: s };
    this.rows.forEach((r, k) => { r.draw(k === i); r.nodes.forEach(n => n.draw(k === i && n.S.id === s)); });
    if (!quiet) KG.audio.play('tap'); this.showDetail(was !== i);
  }
  /* ---------- รายละเอียดบท ---------- */
  showDetail() {
    if (this.detail) this.detail.destroy(true);
    const L = CL[this.lang][this.li], S = TY_COURSE.stageOf(this.lang, this.li, this.si), c = this.detail = this.add.container(0, 0), x0 = 860, best = SAVE.data.cbest[this.lang][ckey(this.li, S.id)];
    c.add(KG.txt(this, x0, 102, (L.final ? '' : 'บทที่ ' + (this.li + 1) + ' · ') + L.title, { size: 24, color: '#ffd34f', width: 380 }));
    c.add(KG.txt(this, x0, 140, markText(L.tip), { size: 16, weight: 400, color: '#dbe4ff', width: 372 }).setLineSpacing(2));
    // แป้นใหม่พร้อมสีและชื่อนิ้ว
    const keys = L.final ? [] : [...L.keys].slice(0, 12);
    keys.forEach((ch, k) => {
      const kk = TY.keyOf(this.lang, ch), f = kk && TY_COURSE.fingerOf(kk.code), col = kk ? TY.fingerColor(kk.code) : 0x9fb0d8, x = x0 + (k % 3) * 128, y = 236 + Math.floor(k / 3) * 46;
      const g = this.add.graphics(); g.fillStyle(0x0b1240, 1); g.fillRoundedRect(x, y, 120, 38, 8); g.lineStyle(2, col, 1); g.strokeRoundedRect(x, y, 120, 38, 8); g.fillStyle(col, 1); g.fillRect(x + 6, y + 33, 108, 3); c.add(g);
      c.add(KG.txt(this, x + 22, y + 18, keyLabel(ch), { size: 22, center: true, middle: true })); c.add(KG.txt(this, x + 42, y + 19, (f ? f.name.replace('นิ้ว', '') : '') + (kk && kk.shift ? ' +Shift' : ''), { size: 13, color: '#cdd7f2', oy: 0.5 }));
    });
    const sy = keys.length ? 236 + Math.ceil(keys.length / 3) * 46 + 8 : 236;
    c.add(KG.txt(this, x0, sy, 'ด่าน ' + S.id + ' · ' + S.name + (S.blind ? ' (ไม่ดูแป้น)' : ''), { size: 22, color: S.blind ? '#ff9ac8' : '#4ef4d2' }));
    const dt = KG.txt(this, x0, sy + 32, S.desc + (S.blind ? '\nเป้าหมาย ' + TY_COURSE.targetWpm(this.lang, this.li) + ' คำ/นาที' : ''), { size: 16, weight: 400, color: '#cdd7f2', width: 372 }); c.add(dt);
    const st = courseStars(this.lang, this.li, S.id), stY = Math.max(sy + 96, sy + 32 + dt.height + 26);
    for (let k = 0; k < 3; k++) c.add(KG.ui.icon(this, k < st ? 'star' : 'starO', x0 + 18 + k * 34, stY, 28, k < st ? 0xffd34f : 0x4a5aa8));
    if (best) c.add(KG.txt(this, x0 + 120, stY, 'ดีที่สุด ' + best.wpm + ' คำ/นาที · แม่นยำ ' + best.acc + '%', { size: 14, color: '#9fb0d8', oy: 0.5 }));
    c.add(KG.txt(this, 1046, 598, 'ลูกศรขึ้นลง เลือกบท · ซ้ายขวาหรือ 1–4 เลือกด่าน · L ภาษา · Esc กลับ', { size: 14, weight: 400, color: '#9fb0d8', center: true, ox: 0.5, oy: 0.5 }));
    const go = new KG.ui.Button(this, 1046, 650, 360, 76, { label: (st ? 'ฝึกอีกครั้ง' : 'เริ่มด่านนี้') + ' (Enter)', icon: 'play', style: 'primary', size: 24, onClick: () => this.start() });
    c.add(go); go.pulse(); c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 160 });
  }
  start(stage) { const s = stage || this.si; SAVE.data.lang = this.lang; SAVE.save(); this.go('Play', { course: { lesson: this.li, stage: s }, lang: this.lang }); }
  onKey(e) {
    const code = e.code; if (code === 'Escape') return;
    if (this._modal && !this._modal.closed) { if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') this._modal.close(); return; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space'].includes(code)) { try { e.preventDefault(); } catch (er) { /* ไม่เป็นไร */ } }
    const n = CL[this.lang].length, dg = /^(Digit|Numpad)([1-4])$/.exec(code);
    if (code === 'ArrowDown') this.select((this.li + 1) % n, 1); else if (code === 'ArrowUp') this.select((this.li - 1 + n) % n, 1);
    else if (code === 'ArrowRight') this.select(this.li, Math.min(4, this.si + 1)); else if (code === 'ArrowLeft') this.select(this.li, Math.max(1, this.si - 1));
    else if (dg) this.start(+dg[2]); else if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') this.start();
    else if (code === 'KeyL') this.setLang(this.lang === 'th' ? 'en' : 'th');
  }
}
// หลักการพิมพ์สัมผัส (หน้าต่างแนะนำ)
function showTouchHelp(scene) {
  KG.ui.modal(scene, { title: 'หลักการพิมพ์สัมผัส', w: 980, accent: KG.C.cyan, buttons: [{ label: 'เข้าใจแล้ว', style: 'primary', icon: 'check', pulse: true }],
    body: markText('1. วางนิ้วที่แป้นเหย้า มือซ้าย ฟ ห ก ด มือขวา ่ า ส ว (อังกฤษ A S D F · J K L ;) ปุ่ม ด กับ ่ มีขีดนูนให้นิ้วชี้คลำหาโดยไม่ต้องมอง\n' +
      '2. แต่ละนิ้วรับผิดชอบแป้นของตัวเอง สีที่ขอบปุ่มบอกว่าเป็นของนิ้วไหน ก้าวนิ้วไปกดแล้วดึงกลับแป้นเหย้าทันที นิ้วโป้งเคาะเว้นวรรค\n' +
      '3. ตัวบนแป้นกด Shift ค้างด้วยนิ้วก้อยมือตรงข้าม เช่น ตัวฝั่งขวากด Shift ซ้าย\n' +
      '4. ตามองจอ ไม่มองแป้น พิมพ์ให้แม่นก่อนแล้วค่อยเร็ว ด่านที่ 4 ของทุกบทจะซ่อนตัวอักษรบนแป้นให้ฝึกพิมพ์จากความจำของนิ้ว\n' +
      '5. ฝึกทีละบทจากแป้นเหย้าไปแถวบน แถวล่าง แถวตัวเลข และตัว Shift ด่านละไม่กี่นาที ฝึกทุกวันจะเร็วขึ้นเอง') });
}
