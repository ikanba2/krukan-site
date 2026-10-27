/* ===== Techno Slice: ข้อผิด ภารกิจ ชนะ คำใบ้ บทสอน (ต่อเติมให้ PlayScene) ===== */
const TAUNTS = ['อิอิ ตัดไม่เท่ากันแล้ว!', 'พิซซ่าเละแน่!', 'เศษส่วนปั่นป่วนแล้ว!', 'ฮ่า ๆ พลาดนะ!', 'นับใหม่นะจ๊ะ!'];
const CHEERS = ['เยี่ยม!', 'ถูกต้อง!', 'เก่งมาก!', 'อร่อยเลย!'];

Object.assign(PlayScene.prototype, {
  /* ---------- ข้อผิดและการพูดของตัวป่วน ---------- */
  fail(why, id) {
    this.mistakes++; KG.audio.play('error'); this.setMessage(why, 'bad'); this.refreshStats(); this.selItem = null; this.hl = null; this.applyHighlight(); this.renderItems(); if (id) this.shakeView(id);
    if (this.hero) { KG.art.frame(this.hero, 'hurt'); this.time.delayedCall(450, () => { if (this.hero && !this.done) KG.art.frame(this.hero, 'idle'); }); }
    this.say(TAUNTS[this.mistakes % TAUNTS.length], '#c9202f');
    if (this.mistakes >= 2 && !this.hintPulse && this.hintBtn.pulse) { this.hintPulse = true; this.hintBtn.pulse(); }
  },
  say(text, color) {
    if (!this.mon) return; if (this.bubble) { this.bubble.destroy(true); this.bubble = null; }
    const w = Math.max(110, KG.measure(text, '600 18px Kanit') + 28), A = AREA.arena, c = this.add.container(KG.clamp(this.mon.x, A.x + w / 2 + 4, A.x + A.w - w / 2 - 4), A.y + 64).setDepth(60);
    c.add(this.add.image(-w / 2 - 4, -17, KG.tex(this, 'sl-say|' + w + '|' + color, w + 8, 44, ctx => { KG.ui.rrect(ctx, 3, 3, w, 34, 17); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = color || '#4a2412'; ctx.stroke(); })).setOrigin(0, 0).setDisplaySize(w + 8, 44));
    c.add(KG.txt(this, 0, 0, text, { size: 18, color: color || '#4a2412', center: true, middle: true }));
    this.bubble = c; c.setScale(0.6).setAlpha(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 140 });
    this.time.delayedCall(1500, () => { if (this.bubble === c) { this.tweens.add({ targets: c, alpha: 0, duration: 180, onComplete: () => c.destroy(true) }); this.bubble = null; } });
  },

  /* ---------- ภารกิจและการสู้ ---------- */
  refreshMission(silent) {
    if (this.done) return; const s = SL.status(this.lv, this.st); let fresh = 0;
    s.checks.forEach((d, i) => {
      const was = !!this.checkDone[i]; this.checkDone[i] = d; this.drawBox(this.checkRows[i], d);
      if (this.pips[i]) this.pips[i].setAlpha(d ? 0.18 : 1); if (d && !was && !silent) fresh++;
    });
    if (fresh && !s.done) { this.strike(); this.say(CHEERS[this.ops % CHEERS.length], '#13804a'); }
    if (s.done && !this.done) this.win();
  },
  strike() {
    if (!this.hero || !this.mon) return; KG.audio.play('swing'); KG.art.frame(this.hero, 'a1'); const hx = this.hero.x;
    this.time.delayedCall(110, () => {
      if (!this.hero) return; KG.art.frame(this.hero, 'a2'); this.tweens.add({ targets: this.hero, x: hx + 50, duration: 130, yoyo: true, ease: 'Quad.easeOut' });
      this.time.delayedCall(130, () => { if (!this.mon) return; KG.audio.play('hit'); KG.art.frame(this.mon, 5); this.mon.setTint(0xffffff); KG.fx.burst(this, this.mon.x - 24, this.mon.y - 44, { colors: [0xffffff, 0xe8452c, 0xffd34f], n: 16, max: 240, depth: 60 }); });
      this.time.delayedCall(420, () => { if (this.mon && !this.done) { this.mon.clearTint(); KG.art.frame(this.mon, 0); } if (this.hero && !this.done) KG.art.frame(this.hero, 'idle'); });
    });
  },
  win() {
    this.done = true; if (this.tutor) this.tutor.finish(true); this.selItem = null; this.paintSel();
    const pen = this.mistakes + this.hints, stars = pen <= 1 ? 3 : pen <= 3 ? 2 : 1, key = skey(this.W, this.N), WD = WORLDS[this.W - 1], L = this.lv;
    if (!this.seed) { if (stars > (SAVE.data.stars[key] || 0)) SAVE.data.stars[key] = stars; } else SAVE.data.practice = (SAVE.data.practice || 0) + 1; SAVE.save();
    this.pips.forEach(p => p.setAlpha(0.18)); KG.audio.play('win'); KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 160);
    // สรุปความหมายของเศษส่วนที่เพิ่งทำ (ย้ำความรู้ทุกครั้งที่ผ่าน)
    let sum = { cut: 'ตัดพิซซ่าตามออเดอร์ครบแล้ว', match: 'จับคู่เศษส่วนกับภาพครบแล้ว', eq: 'จับคู่เศษส่วนที่ค่าเท่ากันครบแล้ว', line: 'วางเศษส่วนบนเส้นจำนวนครบแล้ว', order: 'เรียงเศษส่วนจากน้อยไปมากถูกต้องแล้ว', conv: 'จับคู่เศษเกินกับจำนวนคละครบแล้ว', calc: 'ตอบถูกทุกข้อ ร้านพิซซ่าคิดเลขได้แล้ว' }[L.kind] || 'ผ่านด่านแล้ว';
    if (L.kind === 'pack') { const P = L.pack; sum = 'ใส่กล่องเต็ม ' + P.k + ' กล่อง เหลือ ' + P.r + ' ชิ้น จึงมีพิซซ่า ' + P.total + '/' + P.b + ' = ' + P.k + ' ' + P.r + '/' + P.b + ' กล่อง'; }
    this.setMessage(sum, 'good');
    if (this.hero) KG.art.frame(this.hero, 'power');
    if (this.mon) { KG.art.frame(this.mon, 8); this.mon.clearTint(); this.tweens.add({ targets: [this.mon, this.monSh], alpha: 0, y: '+=10', duration: 700, delay: 300 }); }
    const next = this.N < 10 && !this.seed, tip = (this.N === 10 && !this.seed ? 'จบโลก ' + WD.title + ' แล้ว! ' : '') + 'ความรู้: ' + WD.concept;
    const rows = [['พลาด', this.mistakes + ' ครั้ง'], ['ใช้คำใบ้', this.hints + ' ครั้ง'], ['ลากวางทั้งหมด', this.ops + ' ครั้ง']];
    this.time.delayedCall(900, () => KG.results(this, { stat: { lvl: this.W + ':' + this.N, stars, m: this.mistakes, h: this.hints, secs: Math.round((Date.now() - this._t0) / 1000), practice: !!this.seed },
      win: true, stars, title: this.seed ? 'ผ่านด่านฝึกสุ่ม!' : 'ผ่านด่าน ' + this.N + '!', body: stars === 3 ? 'สมบูรณ์แบบ พลาดน้อยและไม่ต้องพึ่งคำใบ้' : stars === 2 ? 'ผ่านแล้ว! ลองเล่นอีกครั้งให้พลาดน้อยลงเพื่อ 3 ดาว' : 'ผ่านแล้ว! เล่นอีกครั้งเพื่อฝึกให้คล่องและได้ดาวเพิ่ม', rows, tip,
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { level: this.N }) }, this.seed ? { label: 'สุ่มใหม่', style: 'violet', icon: 'reset', onClick: () => this.go('Play', { world: this.W, level: this.N, seed: 1 + Math.floor(Math.random() * 1e8) }) } : { label: 'เล่นอีกครั้ง', style: 'cyan', icon: 'reset', onClick: () => this.go('Play', { world: this.W, level: this.N }) }].concat(next ? [{ label: 'ด่านถัดไป', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Play', { world: this.W, level: this.N + 1 }) }] : [])
    }));
  },

  /* ---------- คำใบ้ ---------- */
  showHint() {
    if (this.busy()) return; const ops = SL.plan(this.lv, this.st); if (!ops.length) return; const op = ops[0], it = this.itemOf(op.item), z = op.zone === 'tray' ? null : this.zoneOf(op.zone); this.hints++; this.refreshStats();
    const nm = it.kind === 'slice' ? 'ชิ้น 1/' + it.f.den : it.kind === 'num' ? 'ตัวเลข ' + it.n : 'การ์ด ' + it.n; let text = '';
    if (!z) text = 'ดึง' + nm + 'กลับมาที่ถาดก่อน เพราะวางผิดที่';
    else if (z.kind === 'plate') text = 'ลาก' + nm + 'ไปใส่จานที่ลูกค้าสั่ง ' + z.q.a + '/' + z.q.b + ' ใช้ชิ้นที่ตัดจากพิซซ่าแบ่ง ' + z.q.b + ' ส่วน';
    else if (z.kind === 'box') text = 'ลาก' + nm + 'ไปใส่' + z.label + ' กล่องละ ' + z.acc.v + ' ชิ้น';
    else if (z.kind === 'pic') text = z.pic.conv ? 'ลาก' + nm + 'ไปวางที่ช่อง' + (z.slot === 'imp' ? 'เศษเกิน' : 'จำนวนคละ') + 'ของภาพเดียวกัน (นับชิ้นทั้งหมดและกล่องเต็ม)' : 'ภาพนี้แบ่ง ' + z.pic.d + ' ส่วน ระบาย ' + z.pic.n + ' ส่วน ลาก' + nm + 'ที่มีค่าตรงกันไปวางใต้ภาพ';
    else if (z.kind === 'tick') text = 'ลาก' + nm + 'ไปวางที่จุด ' + z.tickText + ' นับช่องจาก 0 ไปทางขวา';
    else if (z.kind === 'rank') text = 'ลาก' + nm + 'ไปวางลำดับที่ ' + z.acc.v + ' จากน้อยไปมาก';
    else text = 'ลาก' + nm + 'ไปใส่ช่อง' + z.part + 'ของข้อ ' + (z.q + 1) + ' (' + z.tip + ')';
    this.hl = { item: op.item, zone: op.zone }; this.setMessage('คำใบ้: ' + text, 'info'); this.speak(text); KG.audio.play('pop'); this.paintSel(); this.applyHighlight();
  },
  applyHighlight() {
    if (this.hlG) { this.hlG.destroy(); this.hlG = null; } if (this.hlTw) { this.hlTw.remove(); this.hlTw = null; } if (!this.hl) return;
    const g = this.hlG = this.add.graphics().setDepth(310), rects = [], v = this.views[this.hl.item];
    if (v) rects.push({ x: v.box.x, y: v.box.y, w: v.box.w, h: v.box.h }); const zr = this.zr[this.hl.zone]; if (zr) rects.push(zr);
    rects.forEach(r => { g.fillStyle(0xff7a1a, 0.14); g.lineStyle(4, 0xff7a1a, 1); if (r.circle) { g.fillCircle(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 4); g.strokeCircle(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 4); } else { g.fillRoundedRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 16); g.strokeRoundedRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 16); } });
    this.hlTw = this.tweens.add({ targets: g, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
    const mine = g; this.time.delayedCall(7000, () => { if (this.hlG === mine) { this.hl = null; this.applyHighlight(); this.paintSel(); } });
  },

  /* ---------- พักเกม บทแนะนำ บทสอน ---------- */
  pause() {
    if (this.paused || this._modal || this.done) return; this.paused = true;
    KG.pauseMenu(this, { onExit: () => this.leave(), onRestart: () => this.go('Play', this._restartData), onResume: () => { this.paused = false; } });
  },
  showIntro() {
    const WD = WORLDS[this.W - 1], btns = [{ label: 'เริ่มเลย', style: 'primary', icon: 'check', pulse: true, onClick: () => { SAVE.data.tutorDone[this.W] = true; SAVE.save(); } }];
    if (this.W === 1) btns.unshift({ label: 'เล่นบทสอน', style: 'cyan', icon: 'play', onClick: () => this.time.delayedCall(250, () => this.startTutor()) });
    KG.ui.modal(this, { title: 'โลก ' + this.W + ' · ' + WD.skill, w: 820, accent: Phaser.Display.Color.HexStringToColor(WD.color).color, body: WD.concept + '\n\n' + WD.desc, buttons: btns });
  },
  startTutor() {
    if (this.tutor) return; const R = (x, y, w, h) => ({ x, y, w, h }), A = AREA;
    const steps = [
      { text: 'ยินดีต้อนรับสู่ร้านพิซซ่าของเทคโน! วันนี้ลูกค้าสั่งพิซซ่าเป็นเศษส่วน เราต้องตัดให้ถูกตามที่สั่ง', target: R(A.stage.x, A.stage.y, A.stage.w, A.stage.h), pad: 2, pos: 'bottom', at: { y: 400 } },
      { text: 'ลูกค้าสั่งเศษส่วน เช่น 3/8 ตัวส่วน 8 บอกว่าพิซซ่าแบ่งเป็น 8 ส่วนเท่า ๆ กัน ตัวเศษ 3 บอกว่าเอา 3 ชิ้น', target: R(A.stage.x + 480, A.stage.y + 20, 400, 300), pad: 2, pos: 'bottom', at: { y: 400 } },
      { text: 'ชิ้นพิซซ่าอยู่ในถาดด้านล่าง ลองลากชิ้นไปใส่จาน ใช้นิ้วหรือเมาส์กดค้างที่ชิ้นแล้วลากไปปล่อยที่จาน หรือแตะชิ้นก่อนแล้วแตะจานก็ได้', target: R(A.stage.x, A.stage.y, 470, A.stage.h), pad: 2, mode: 'wait', block: false, pos: 'bottom', at: { y: 400 }, until: () => this.ops >= 1 },
      { text: 'ดูใบสั่งงานด้านขวา ทำเสร็จข้อไหนจะมีเครื่องหมายถูก และเทคโนจะฟันตัวป่วนให้หนึ่งครั้ง', target: R(A.ticket.x, A.ticket.y, A.ticket.w, A.ticket.h), pad: 4, pos: 'bottom', at: { x: 560, y: 330 } },
      { text: 'ถ้าไม่แน่ใจ กดปุ่มคำใบ้ได้ แต่ใช้คำใบ้เยอะดาวจะลดลงนะ ลองตัดให้ครบตามที่สั่งดูเลย สู้ ๆ!', target: R(A.ctrl.x + 20, A.ctrl.y + 86, 296, 56), pad: 4, pos: 'top', at: { x: 560, y: 300 } }
    ];
    this.tutor = new KG.Tutor(this, steps, { hero: WORLDS[this.W - 1].hero, onDone: () => { this.tutor = null; SAVE.data.tutorDone[this.W] = true; SAVE.save(); } });
  }
});
