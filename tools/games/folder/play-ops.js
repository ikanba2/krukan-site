/* ===== Techno Folder: การกระทำกับไฟล์ ภารกิจ ชนะ คำใบ้ บทสอน (ต่อเติมให้ PlayScene) ===== */
const TAUNTS = ['อิอิ ไฟล์ผิดที่แล้ว!', 'ยุ่งเหยิงต่อไป!', 'หาไม่เจอแน่!', 'ฮ่า ๆ พลาดนะ!', 'ชื่อนี้ใช้ไม่ได้!'];
const CHEERS = ['เยี่ยม!', 'ถูกต้อง!', 'เก่งมาก!', 'เรียบร้อย!'];

Object.assign(PlayScene.prototype, {
  /* ---------- เดินในโฟลเดอร์ ---------- */
  nav(id) {
    if (this.cur === id || !this.node(id)) return; this.hist = this.hist.slice(0, this.hi + 1); this.hist.push(id); this.hi++; this.cur = id; this.sel = [];
    if (id !== FD.BIN) FD.openFolder(this.fs, id); KG.audio.play('tap'); this.hl = null; this.renderAll(); this.refreshMission();
  },
  back() { if (this.hi > 0) { this.hi--; this.cur = this.hist[this.hi]; this.sel = []; this.renderAll(); } },
  forward() { if (this.hi < this.hist.length - 1) { this.hi++; this.cur = this.hist[this.hi]; this.sel = []; if (this.cur !== FD.BIN) FD.openFolder(this.fs, this.cur); this.renderAll(); this.refreshMission(); } },
  up() { const p = this.node(this.cur).parent; if (p) this.nav(p); },

  /* ---------- ผลของการกระทำ ---------- */
  fail(why) {
    this.mistakes++; KG.audio.play('error'); this.setMessage(why, 'bad'); this.refreshStats(); this.hl = null; this.applyHighlight();
    if (this.hero) { KG.art.frame(this.hero, 'hurt'); this.time.delayedCall(450, () => { if (this.hero && !this.done) KG.art.frame(this.hero, 'idle'); }); }
    this.say(TAUNTS[this.mistakes % TAUNTS.length], '#c9202f');
    if (this.mistakes >= 2 && !this.hintPulse && this.hintBtn.pulse) { this.hintPulse = true; this.hintBtn.pulse(); }
    if (this.itemObjs && this.drag === null) { /* ไม่ต้องทำอะไรกับไอคอน ไฟล์ยังอยู่ที่เดิม */ }
  },
  say(text, color) {
    if (!this.mon) return; if (this.bubble) { this.bubble.destroy(true); this.bubble = null; }
    const w = Math.max(110, KG.measure(text, '600 20px Kanit') + 28), c = this.add.container(this.mon.x, this.mon.y - 170).setDepth(60);
    c.add(this.add.rectangle(0, 0, w, 38, 0xffffff).setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(color || '#1b2a6b').color)); c.add(KG.txt(this, 0, 0, text, { size: 20, color: color || '#1b2a6b', center: true, middle: true }));
    this.bubble = c; c.setScale(0.6).setAlpha(0); this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 140 });
    this.time.delayedCall(1500, () => { if (this.bubble === c) { this.tweens.add({ targets: c, alpha: 0, duration: 180, onComplete: () => c.destroy(true) }); this.bubble = null; } });
  },
  okOp(msg, keepSel) {
    this.ops++; KG.audio.play('confirm'); this.hl = null; if (!keepSel) this.sel = []; this.setMessage(msg, 'good'); this.afterOp();
  },
  afterOp() {
    if (this.cur !== FD.BIN && (!this.node(this.cur) || FD.inBin(this.fs, this.cur))) { this.cur = FD.ROOT; this.hist = [FD.ROOT]; this.hi = 0; }
    this.sel = this.sel.filter(i => this.node(i) && this.node(i).parent === this.cur);
    this.renderAll(); this.refreshMission();
  },
  opError(r, ids, dest) {
    const n = this.node(r.id || ids[0]), d = this.node(dest);
    const m = { dup: 'ในโฟลเดอร์ “' + (d ? d.name : '') + '” มีชื่อ “' + (n ? n.name : '') + '” อยู่แล้ว ชื่อซ้ำกันไม่ได้ ต้องเปลี่ยนชื่อก่อน', self: 'ย้ายโฟลเดอร์เข้าไปอยู่ในตัวเองไม่ได้', same: 'รายการนี้อยู่ที่นี่อยู่แล้ว', inbin: 'ไฟล์ในถังรีไซเคิลต้องกดกู้คืนก่อน', notfolder: 'ต้องวางลงในโฟลเดอร์เท่านั้น' }[r.why] || 'ทำรายการนี้ไม่ได้';
    KG.audio.play('denied'); this.setMessage(m, 'bad'); KG.ui.toast(this, m);
  },

  /* ---------- การกระทำ ---------- */
  doMove(ids, dest) {
    ids = ids.filter(i => this.node(i)); if (!ids.length || !this.node(dest) || this.busy()) return;
    if (ids.every(i => this.node(i).parent === dest)) { this.setMessage('รายการนี้อยู่ในโฟลเดอร์นี้อยู่แล้ว', 'info'); return; }
    const j = FD.judge(this.lv, this.fs, { t: 'move', ids, dest }); if (j) { this.fail(j.why); return; }
    const names = ids.map(i => this.node(i).name), r = FD.move(this.fs, ids, dest); if (!r.ok) { this.opError(r, ids, dest); return; }
    this.okOp((names.length === 1 ? 'ย้าย “' + names[0] + '”' : 'ย้าย ' + names.length + ' รายการ') + ' ไปไว้ใน “' + this.nameOf(dest) + '” แล้ว');
  },
  doCut() { if (this.busy() || !this.sel.length || this.cur === FD.BIN) return; FD.setClip(this.fs, 'cut', this.sel.slice()); KG.audio.play('tap'); this.setMessage('ตัดไว้ ' + this.sel.length + ' รายการแล้ว ไปเปิดโฟลเดอร์ปลายทาง แล้วกดปุ่ม วาง', 'info'); this.renderContent(); this.renderCmd(); this.renderStatus(); },
  doCopyBtn() { if (this.busy() || !this.sel.length || this.cur === FD.BIN) return; FD.setClip(this.fs, 'copy', this.sel.slice()); KG.audio.play('tap'); this.setMessage('คัดลอกไว้ ' + this.sel.length + ' รายการแล้ว ไปเปิดโฟลเดอร์ปลายทาง แล้วกดปุ่ม วาง', 'info'); this.renderContent(); this.renderCmd(); this.renderStatus(); },
  doPaste() {
    if (this.busy() || !this.fs.clip || this.cur === FD.BIN) return; const clip = this.fs.clip, ids = clip.ids.filter(i => this.node(i)), dest = this.cur;
    if (!ids.length) { this.fs.clip = null; this.renderAll(); return; }
    if (clip.mode === 'cut' && ids.every(i => this.node(i).parent === dest)) { this.setMessage('รายการนี้อยู่ในโฟลเดอร์นี้อยู่แล้ว ต้องเปิดโฟลเดอร์ปลายทางก่อนแล้วค่อยกด วาง', 'info'); return; }
    const j = FD.judge(this.lv, this.fs, { t: clip.mode === 'cut' ? 'move' : 'copy', ids, dest }); if (j) { this.fail(j.why); return; }
    const names = ids.map(i => this.node(i).name), r = FD.paste(this.fs, dest); if (!r.ok) { this.opError(r, ids, dest); return; }
    const one = names.length === 1 ? '“' + names[0] + '”' : names.length + ' รายการ';
    this.okOp(clip.mode === 'cut' ? 'ย้าย ' + one + ' มาไว้ที่ “' + this.nameOf(dest) + '” แล้ว (ที่เดิมไม่เหลือแล้ว)' : 'คัดลอก ' + one + ' มาไว้ที่ “' + this.nameOf(dest) + '” แล้ว (ต้นฉบับยังอยู่ที่เดิม)', true);
  },
  doDelete(ids) {
    ids = (ids || []).filter(i => this.node(i)); if (this.busy() || !ids.length || this.cur === FD.BIN) return;
    const j = FD.judge(this.lv, this.fs, { t: 'del', ids }); if (j) { this.fail(j.why); return; }
    const names = ids.map(i => this.node(i).name); FD.del(this.fs, ids);
    this.okOp((names.length === 1 ? 'ลบ “' + names[0] + '”' : 'ลบ ' + names.length + ' รายการ') + ' แล้ว ไปรออยู่ในถังรีไซเคิล ถ้าลบผิดกู้คืนได้');
  },
  doRestoreBtn() {
    const ids = this.sel.filter(i => this.node(i) && this.node(i).parent === FD.BIN); if (this.busy() || !ids.length) return;
    const j = FD.judge(this.lv, this.fs, { t: 'restore', ids }); if (j) { this.fail(j.why); return; }
    const info = ids.map(i => this.node(i)); FD.restore(this.fs, ids);
    this.okOp('กู้คืน “' + info[0].name + '”' + (info.length > 1 ? ' และอีก ' + (info.length - 1) + ' รายการ' : '') + ' กลับไปที่ “' + this.nameOf(info[0].parent) + '” แล้ว');
  },
  doNewFolder() {
    if (this.busy() || this.cur === FD.BIN) return;
    const j = FD.judge(this.lv, this.fs, { t: 'new', p: this.cur }); if (j) { this.fail(j.why); return; }
    const r = FD.newFolder(this.fs, this.cur, null); if (!r.ok) return; KG.audio.play('confirm'); this.hl = null; this.sel = [r.id]; this.afterOp();
    if (FD.nameChoices(this.lv, this.fs, r.id).length) this.askName(r.id, true); else { this.ops++; this.setMessage('สร้างโฟลเดอร์ใหม่แล้ว', 'good'); }
  },
  doRenameBtn() {
    if (this.busy() || this.sel.length !== 1 || this.cur === FD.BIN) return; const id = this.sel[0];
    if (!FD.nameChoices(this.lv, this.fs, id).length) { const m = 'ด่านนี้ไม่ต้องเปลี่ยนชื่อ “' + this.nameOf(id) + '” ลองอ่านภารกิจด้านขวาอีกครั้ง'; KG.audio.play('denied'); this.setMessage(m, 'info'); KG.ui.toast(this, m); return; }
    this.askName(id, false);
  },
  askName(id, fresh) {
    const n = this.node(id), choices = FD.nameChoices(this.lv, this.fs, id), fs = this.fs, inside = FD.kids(fs, id).map(k => fs.nodes[k].name); let clue = '';
    if (inside.length) clue = 'ข้างในมี: ' + inside.slice(0, 5).join(', ') + (inside.length > 5 ? ' และอื่น ๆ' : '');
    else {                                                  // โฟลเดอร์ใหม่ที่ยังว่าง: บอกชื่อไฟล์ที่ยังรอจัดเก็บ จะได้คิดชื่อให้ตรงเรื่อง
      const keys = this.lv.goals.filter(g => g.t === 'folder' && !fs.keys[g.key] && FD.idOf(fs, g.p) === n.parent).map(g => g.key);
      const waiting = Object.values(fs.nodes).filter(x => x.kind === 'f' && keys.includes(x.home)).map(x => x.name);
      if (waiting.length) clue = 'ไฟล์ที่รอเก็บ: ' + waiting.slice(0, 6).join(', ');
    }
    this.choose({ title: 'เลือกชื่อให้โฟลเดอร์', body: 'ตอนนี้ชื่อ “' + n.name + '” ชื่อที่ดีต้องบอกได้ว่าข้างในมีเรื่องอะไร' + (clue ? '\n' + clue : ''), options: choices, cancel: fresh ? 'ยังไม่ตั้งชื่อตอนนี้' : 'ยกเลิก', onPick: i => this.pickName(id, choices[i]) });
  },
  pickName(id, name) {
    const j = FD.judgeName(this.lv, this.fs, id, name); if (j) { this.fail(j.why); return false; }
    const r = FD.rename(this.fs, id, name); if (!r.ok) { this.fail('ตั้งชื่อนี้ไม่ได้'); return false; }
    this.sel = [id]; this.okOp('ตั้งชื่อเป็น “' + name + '” แล้ว', true); return true;
  },
  openQuiz(q) {
    const Q = this.lv.quiz[q]; if (this.busy() || !Q) return;
    this.choose({ title: 'ตอบคำถาม', body: Q.q + ' ดูแถบที่อยู่ด้านบนตอนเปิดไฟล์นั้น แล้วเลือกคำตอบ', options: Q.choices, cancel: 'ปิด', onPick: i => {
      if (i === Q.ans) { this.fs.answers[q] = true; this.okOp('ถูกต้อง! ที่อยู่คือ ' + Q.choices[i], true); return true; }
      this.fail('ยังไม่ใช่ ที่อยู่ต้องไล่ตั้งแต่เดสก์ท็อปไปทีละโฟลเดอร์ ลองเปิดไฟล์นั้นแล้วดูแถบที่อยู่อีกครั้ง'); return false;
    } });
  },

  /* ---------- ภารกิจและการสู้ ---------- */
  refreshMission(silent) {
    if (this.done) return; const st = FD.status(this.lv, this.fs); let fresh = 0;
    this.lv.checks.forEach((ck, i) => {
      const d = ck.goals.every(g => st.goals[g]), was = !!this.checkDone[i]; this.checkDone[i] = d; this.drawBox(this.checkRows[i], d);
      if (this.pips[i]) this.pips[i].setAlpha(d ? 0.18 : 1); if (d && !was && !silent) fresh++;
    });
    if (fresh && !st.done) { this.strike(); this.say(CHEERS[this.ops % CHEERS.length], '#13804a'); }
    if (st.done && !this.done) this.win();
  },
  strike() {
    if (!this.hero || !this.mon) return; KG.audio.play('swing'); KG.art.frame(this.hero, 'a1'); const hx = this.hero.x;
    this.time.delayedCall(110, () => {
      if (!this.hero) return; KG.art.frame(this.hero, 'a2'); this.tweens.add({ targets: this.hero, x: hx + 70, duration: 130, yoyo: true, ease: 'Quad.easeOut' });
      this.time.delayedCall(130, () => { if (!this.mon) return; KG.audio.play('hit'); KG.art.frame(this.mon, 5); this.mon.setTint(0xffffff); KG.fx.burst(this, this.mon.x - 30, this.mon.y - 50, { colors: [0xffffff, 0xff3d8b, 0xffd34f], n: 16, max: 280, depth: 60 }); });
      this.time.delayedCall(420, () => { if (this.mon && !this.done) { this.mon.clearTint(); KG.art.frame(this.mon, 0); } if (this.hero && !this.done) KG.art.frame(this.hero, 'idle'); });
    });
  },
  win() {
    this.done = true; if (this.tutor) this.tutor.finish(true); this.closeMenu(); this.closeDialog();
    const pen = this.mistakes + this.hints, stars = pen <= 1 ? 3 : pen <= 3 ? 2 : 1, key = skey(this.W, this.N), WD = WORLDS[this.W - 1];
    if (!this.seed) { if (stars > (SAVE.data.stars[key] || 0)) SAVE.data.stars[key] = stars; } else SAVE.data.practice = (SAVE.data.practice || 0) + 1; SAVE.save();
    this.pips.forEach(p => p.setAlpha(0.18)); KG.audio.play('win'); KG.fx.confetti(this, { ms: 1600 }); KG.fx.flash(this, 0xffffff, 160); this.setMessage('จัดไฟล์เรียบร้อยแล้ว เทคโนชนะตัวรก!', 'good');
    if (this.hero) { KG.art.frame(this.hero, 'power'); }
    if (this.mon) { KG.art.frame(this.mon, 8); this.mon.clearTint(); this.tweens.add({ targets: [this.mon, this.monSh], alpha: 0, y: '+=10', duration: 700, delay: 300 }); }
    const next = this.N < 10 && !this.seed, tip = (this.N === 10 && !this.seed ? 'จบโลก ' + WD.title + ' แล้ว! ' : '') + 'ความรู้: ' + WD.concept;
    const rows = [['พลาด', this.mistakes + ' ครั้ง'], ['ใช้คำใบ้', this.hints + ' ครั้ง'], ['ลงมือจัดการไฟล์', this.ops + ' ครั้ง']];
    this.time.delayedCall(900, () => KG.results(this, { stat: { lvl: this.W + ':' + this.N, stars, m: this.mistakes, h: this.hints, secs: Math.round((Date.now() - this._t0) / 1000), practice: !!this.seed },
      win: true, stars, title: this.seed ? 'ผ่านด่านฝึกสุ่ม!' : 'ผ่านด่าน ' + this.N + '!', body: stars === 3 ? 'สมบูรณ์แบบ พลาดน้อยและไม่ต้องพึ่งคำใบ้' : stars === 2 ? 'ผ่านแล้ว! ลองเล่นอีกครั้งให้พลาดน้อยลงเพื่อ 3 ดาว' : 'ผ่านแล้ว! เล่นอีกครั้งเพื่อฝึกให้คล่องและได้ดาวเพิ่ม', rows, tip,
      buttons: [{ label: 'เลือกด่าน', style: 'ghost', icon: 'flag', onClick: () => this.go('Select', { level: this.N }) }, this.seed ? { label: 'สุ่มใหม่', style: 'violet', icon: 'reset', onClick: () => this.go('Play', { world: this.W, level: this.N, seed: 1 + Math.floor(Math.random() * 1e8) }) } : { label: 'เล่นอีกครั้ง', style: 'cyan', icon: 'reset', onClick: () => this.go('Play', { world: this.W, level: this.N }) }].concat(next ? [{ label: 'ด่านถัดไป', style: 'primary', icon: 'chevR', pulse: true, onClick: () => this.go('Play', { world: this.W, level: this.N + 1 }) }] : [])
    }));
  },

  /* ---------- คำใบ้ ---------- */
  showHint() {
    if (this.busy()) return; const ops = FD.plan(this.lv, this.fs); if (!ops.length) return; const op = ops[0], fs = this.fs; this.hints++; this.refreshStats();
    const nm = id => (typeof id === 'string' && fs.nodes[id] ? fs.nodes[id].name : 'โฟลเดอร์ที่ต้องสร้าง'), where = id => { const n = fs.nodes[id]; return n && n.parent !== this.cur ? ' (ตอนนี้อยู่ใน ' + this.pathText(n.parent) + ' ต้องเปิดโฟลเดอร์นั้นก่อน)' : ''; };
    const hl = { items: [], navs: [], btns: [] }; let text = '';
    switch (op.t) {
      case 'move': { const id = op.ids[0], n = fs.nodes[id]; text = 'ลาก' + (n.kind === 'd' ? 'โฟลเดอร์' : 'ไฟล์') + ' “' + n.name + '” ไปวางบนโฟลเดอร์ “' + nm(op.dest) + '”' + where(id); hl.items.push(id); hl.navs.push(op.dest); hl.items.push(op.dest); break; }
      case 'copy': { const id = op.ids[0]; text = 'คลิกไฟล์ “' + nm(id) + '” กดปุ่ม คัดลอก แล้วเปิดโฟลเดอร์ “' + nm(op.dest) + '” กดปุ่ม วาง' + where(id); hl.items.push(id); hl.btns.push('copy'); hl.navs.push(op.dest); break; }
      case 'del': { const id = op.ids[0]; text = 'คลิกไฟล์ “' + nm(id) + '” แล้วกดปุ่ม ลบ' + where(id); hl.items.push(id); hl.btns.push('del'); break; }
      case 'restore': { const id = op.ids[0]; text = 'เปิดถังรีไซเคิล คลิกไฟล์ “' + nm(id) + '” แล้วกดปุ่ม กู้คืน'; hl.navs.push(FD.BIN); if (this.cur === FD.BIN) { hl.items.push(id); hl.btns.push('restore'); } break; }
      case 'new': text = 'เปิดโฟลเดอร์ “' + nm(op.p) + '” ให้ขึ้นในหน้าต่าง กดปุ่ม ใหม่ เลือก โฟลเดอร์ แล้วเลือกชื่อ “' + op.name + '”'; hl.navs.push(op.p); hl.btns.push('new'); break;
      case 'rename': text = 'คลิกโฟลเดอร์ “' + nm(op.id) + '” กดปุ่ม เปลี่ยนชื่อ แล้วเลือกชื่อ “' + op.name + '”' + where(op.id); hl.items.push(op.id); hl.btns.push('rename'); break;
      case 'open': text = 'ดับเบิลคลิกโฟลเดอร์ “' + nm(op.id) + '” หรือคลิกชื่อโฟลเดอร์ในแถบซ้ายมือ เพื่อเปิดเข้าไปข้างใน'; hl.navs.push(op.id); hl.items.push(op.id); break;
      case 'answer': text = 'กดปุ่ม ตอบคำถาม ด้านล่างแล้วเลือกที่อยู่ของไฟล์'; hl.btns.push('quiz'); break;
    }
    this.hl = hl; this.hlUntil = this.time.now + 7000; this.setMessage('คำใบ้: ' + text, 'info'); this.speak(text); KG.audio.play('pop'); this.applyHighlight();
  },
  applyHighlight() {
    if (this.hlG) { this.hlG.destroy(); this.hlG = null; } if (this.hlTw) { this.hlTw.remove(); this.hlTw = null; } if (!this.hl) return;
    const g = this.hlG = this.add.graphics().setDepth(310), rects = [];
    this.hl.items.forEach(id => { if (this.itemObjs[id]) rects.push(this.itemObjs[id].rect); });
    this.hl.navs.forEach(id => { if (this.navObjs[id]) rects.push(this.navObjs[id].rect); });
    this.hl.btns.forEach(k => { const b = k === 'quiz' ? this.quizBtn : this.cmd[k]; if (b && b.visible) rects.push({ x: b.x - b.w / 2 - 4, y: b.y - b.h / 2 - 2, w: b.w + 8, h: b.h + 10 }); });
    rects.forEach(r => { g.fillStyle(0xff7a1a, 0.16); g.fillRoundedRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 8); g.lineStyle(4, 0xff7a1a, 1); g.strokeRoundedRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 8); });
    this.hlTw = this.tweens.add({ targets: g, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
    this.time.delayedCall(7000, () => { if (this.hlG === g) { this.hl = null; this.applyHighlight(); } });
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
    if (this.tutor) return; const R = (x, y, w, h) => ({ x, y, w, h });
    const steps = [
      { text: 'ยินดีต้อนรับ! นี่คือหน้าต่างโฟลเดอร์แบบ Windows ไฟล์ในห้องของเทคโนกระจัดกระจายอยู่ เราต้องช่วยกันจัดให้เป็นระเบียบ', target: R(WIN.x, WIN.y, WIN.w, WIN.h), pad: 2, pos: 'bottom', at: { y: 380 } },
      { text: 'โฟลเดอร์มีไอคอนแฟ้มสีเหลือง ไฟล์มีไอคอนหน้ากระดาษ อ่านชื่อไฟล์ แล้วคิดว่าเป็นเรื่องอะไร', target: R(GEO.contX, GEO.bodyY, GEO.contW, GEO.bodyH), pad: 2, pos: 'bottom', at: { y: 470 } },
      { text: 'ลองลากไฟล์ไปวางบนโฟลเดอร์ที่เป็นเรื่องเดียวกัน ใช้นิ้วหรือเมาส์กดค้างที่ไฟล์ แล้วลากไปปล่อยที่โฟลเดอร์', target: R(GEO.contX, GEO.bodyY, GEO.contW, GEO.bodyH), pad: 2, mode: 'wait', block: false, pos: 'bottom', at: { y: 470 }, until: () => this.ops >= 1 },
      { text: 'ดูแผงภารกิจด้านขวา ทำเสร็จข้อไหนจะมีเครื่องหมายถูก และเทคโนจะฟันตัวรกให้หนึ่งครั้ง', target: R(MIS.x, MIS.y, MIS.w, MIS.h), pad: 2, pos: 'bottom', at: { x: 330, y: 430 } },
      { text: 'ถ้าไม่แน่ใจ กดปุ่มคำใบ้ได้ แต่ใช้คำใบ้เยอะ ดาวจะลดลงนะ ลองจัดไฟล์ที่เหลือดูเลย สู้ ๆ!', target: R(637, 612, 150, 48), pad: 4, pos: 'top' }
    ];
    this.tutor = new KG.Tutor(this, steps, { hero: WORLDS[this.W - 1].hero, onDone: () => { this.tutor = null; SAVE.data.tutorDone[this.W] = true; SAVE.save(); } });
  }
});
