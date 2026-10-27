/* ===== ตัวต่อโปรแกรมแบบรายการแนวตั้ง (ลูป/เงื่อนไขซ้อนกันได้ เลื่อนดูได้) + คลังการ์ดคำสั่ง =====
   โปรแกรมเก็บเป็นต้นไม้: { main: [บล็อก...], fn: [บล็อก...] } บล็อกที่มีลูก (rep until while if ifelse) มี body (และ other ของ ifelse)
   แถวที่เคอร์เซอร์ชี้อยู่คือจุดที่การ์ดใหม่จะถูกแทรก แตะแถวเพื่อย้ายเคอร์เซอร์ แตะที่ตัวเลข/เงื่อนไขของแถวลูปเพื่อเปลี่ยนค่า */
const BLK = {
  n: { label: 'ขึ้น', icon: 'chevU', c: 0x22d3ee, dark: 0x0e7490, ink: '#04222a' },
  e: { label: 'ขวา', icon: 'chevR', c: 0x22d3ee, dark: 0x0e7490, ink: '#04222a' },
  s: { label: 'ลง', icon: 'chevD', c: 0x22d3ee, dark: 0x0e7490, ink: '#04222a' },
  w: { label: 'ซ้าย', icon: 'chevL', c: 0x22d3ee, dark: 0x0e7490, ink: '#04222a' },
  fwd: { label: 'เดินหน้า', icon: 'walk', c: 0x5ef08a, dark: 0x15803d, ink: '#04210f' },
  tl: { label: 'เลี้ยวซ้าย', icon: 'rotL', c: 0xffd34f, dark: 0xa07800, ink: '#2a1c00' },
  tr: { label: 'เลี้ยวขวา', icon: 'rotR', c: 0xffd34f, dark: 0xa07800, ink: '#2a1c00' },
  atk: { label: 'โจมตี', icon: 'sword', c: 0xff6aa8, dark: 0xa3194f, ink: '#2c0618' },
  rep: { label: 'ทำซ้ำ', icon: 'repeat', c: 0xff9d3d, dark: 0xb45309, ink: '#2e1600', box: true },
  until: { label: 'ทำซ้ำจนถึงประตู', icon: 'until', c: 0xff9d3d, dark: 0xb45309, ink: '#2e1600', box: true },
  while: { label: 'ทำซ้ำขณะที่', icon: 'repeat', c: 0xff9d3d, dark: 0xb45309, ink: '#2e1600', box: true, cond: true },
  if: { label: 'ถ้า', icon: 'branch', c: 0xa78bfa, dark: 0x5b34c8, ink: '#ffffff', box: true, cond: true },
  ifelse: { label: 'ถ้า', icon: 'branch', c: 0xa78bfa, dark: 0x5b34c8, ink: '#ffffff', box: true, cond: true },
  call: { label: 'ท่า A', icon: 'func', c: 0x6ee7b7, dark: 0x0f766e, ink: '#03211b' }
};
const PAL_LABEL = { rep: 'ทำซ้ำ', until: 'จนถึงประตู', while: 'ขณะที่', if: 'ถ้า…', ifelse: 'ถ้า…ไม่งั้น', fwd: 'เดินหน้า', tl: 'เลี้ยวซ้าย', tr: 'เลี้ยวขวา' };
const PAL_ORDER = ['n', 'e', 's', 'w', 'fwd', 'tl', 'tr', 'atk', 'rep', 'until', 'while', 'if', 'ifelse', 'call'];
const CONDS = ['ahead', 'left', 'right', 'foe'];
const COND_LABEL = { ahead: 'ข้างหน้าโล่ง', left: 'ซ้ายมือโล่ง', right: 'ขวามือโล่ง', foe: 'มีศัตรูข้างหน้า' };
const REP_STEPS = [2, 3, 4, 5, 6, 7, 8, 10, 12];
const RH = 40, ENDH = 24, GAP = 4, IND = 24;

function rowTex(scene, w, h, c, dark, kind) {
  const cuts = kind === 'end' || kind === 'else' ? [4, 0, 4, 0] : [0, 12, 0, 12];
  return KG.tex(scene, ['row', w, h, c, kind].join('|'), w + 12, h + 12, ctx => {
    ctx.translate(6, 6);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; KG.ui.cutPath(ctx, 0, 0, w, h, cuts); ctx.fillStyle = css(dark); ctx.fill(); ctx.restore();
    KG.ui.cutPath(ctx, 0, 0, w, h, cuts);
    ctx.fillStyle = kind === 'end' || kind === 'else' ? KG.ui.lin(ctx, 0, 0, 0, h, [[0, css(dark)], [1, '#0a0d2a']]) : KG.ui.lin(ctx, 0, 0, 0, h, [[0, css(c)], [1, css(dark)]]);
    ctx.fill();
    ctx.save(); KG.ui.cutPath(ctx, 0, 0, w, h, cuts); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, 0, w, 2);
    ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, h * 0.55, [[0, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, w, h * 0.55); ctx.restore();
    KG.ui.cutPath(ctx, 1, 1, w - 2, h - 2, cuts); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
  });
}

/* แถวหนึ่งแถวของโปรแกรม */
class Row extends Phaser.GameObjects.Container {
  constructor(scene, w, role, b) {
    super(scene, 0, 0); this.rw = w; this.role = role; this.b = b;
    const B = BLK[b.t], h = role === 'end' || role === 'else' ? ENDH : RH; this.h = h;
    this.glow = scene.add.image(w / 2, h / 2, 'fx_glow').setTint(0xffffff).setBlendMode('ADD').setDisplaySize(w * 1.3, h * 2.6).setAlpha(0);
    this.body = scene.add.image(w / 2, h / 2, rowTex(scene, w, h, B.c, B.dark, role === 'open' || role === 'leaf' ? 'leaf' : role)).setDisplaySize(w + 12, h + 12);
    this.add([this.glow, this.body]);
    const ink = role === 'end' || role === 'else' ? '#ffffff' : B.ink;
    if (role === 'end') this.add(KG.txt(scene, 14, h / 2, 'จบ', { size: 15, color: '#c9d4ff', middle: true, oy: 0.5 }));
    else if (role === 'else') this.add(KG.txt(scene, 14, h / 2, 'ไม่งั้น', { size: 16, color: '#ffffff', middle: true, oy: 0.5 }));
    else {
      this.icon = KG.ui.icon(scene, B.icon, 24, h / 2, 26, ink); this.add(this.icon);
      this.label = KG.txt(scene, 48, h / 2, B.label, { size: 19, color: ink, oy: 0.5 }); this.add(this.label);
      if (B.box) {
        this.pill = scene.add.image(w - 8, h / 2, rowTex(scene, 40, 28, 0x10153f, 0x070a22, 'leaf')).setOrigin(1, 0.5).setVisible(false); this.add(this.pill);
        this.param = KG.txt(scene, w - 22, h / 2, '', { size: 18, color: '#ffffff', ox: 1, oy: 0.5 }); this.add(this.param);
      }
    }
    scene.add.existing(this);
  }
  setParam(s) {
    if (!this.param) return this;
    this.param.setText(s || '');
    if (!s) { this.pill.setVisible(false); this.pillW = 0; return this; }
    const pw = Math.ceil(this.param.width + 22); this.pillW = pw;
    this.pill.setTexture(rowTex(this.scene, pw, 28, 0x10153f, 0x070a22, 'leaf')).setDisplaySize(pw + 12, 40).setVisible(true);
    this.param.setX(this.rw - 8 - 11); return this;
  }
  light(on, color) { this.glow.setTint(color || 0xffffff); this.scene.tweens.killTweensOf(this.glow); this.scene.tweens.add({ targets: this.glow, alpha: on ? 0.85 : 0, duration: on ? 90 : 280 }); }
}

class ScriptEditor {
  constructor(scene, rect, o) {
    this.scene = scene; this.rect = rect; this.o = o || {}; this.allow = o.allow; this.maxBlocks = o.maxBlocks;
    this.prog = { main: [], fn: [] }; this.tab = 'main'; this.caret = { list: this.prog.main, idx: 0 };
    this.rows = new Map(); this.tokens = []; this.gaps = []; this.scrollY = 0; this.uid = 1; this.locked = false; this.total = 0; this.rowY = [];
    const s = scene;
    this.mg = s.make.graphics({ x: 0, y: 0, add: false }); this.mg.fillStyle(0xffffff); this.mg.fillRect(rect.x - 4, rect.y, rect.w + 8, rect.h);
    this.root = s.add.container(rect.x, rect.y).setDepth(6); this.root.setMask(this.mg.createGeometryMask());
    this.rails = s.add.graphics(); this.root.add(this.rails);
    this.caretG = s.add.graphics(); this.root.add(this.caretG); this.caretG.setDepth(5);
    this.empty = KG.txt(s, rect.x + rect.w / 2, rect.y + rect.h / 2 - 10, 'แตะการ์ดคำสั่งด้านบน' + String.fromCharCode(10) + 'เพื่อต่อเป็นโปรแกรมที่นี่', { size: 22, color: '#6f82c9', center: true, middle: true, weight: 400, lineSpacing: 6 }).setDepth(6);
    s.tweens.add({ targets: this.empty, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
    // เลื่อนด้วยล้อเมาส์ หรือลากนิ้ว
    s.input.on('wheel', (p, objs, dx, dy) => { if (this.inside(p)) this.scrollBy(dy * 0.8); });
    s.input.on('pointerdown', p => { if (this.inside(p) && !s._modal) { this.drag = { y: p.worldY, s: this.scrollY, moved: false }; } });
    s.input.on('pointermove', p => { if (this.drag && p.isDown) { const dy = this.drag.y - p.worldY; if (Math.abs(dy) > 8) this.drag.moved = true; if (this.drag.moved) this.setScroll(this.drag.s + dy); } });
    s.input.on('pointerup', () => { setTimeout(() => { this.drag = null; }, 0); });
  }
  inside(p) { return p.worldX >= this.rect.x && p.worldX <= this.rect.x + this.rect.w && p.worldY >= this.rect.y && p.worldY <= this.rect.y + this.rect.h; }
  count() { return GR.countProgram(this.prog); }
  list() { return this.prog[this.tab]; }
  changed() { if (this.o.onChange) this.o.onChange(); }

  /* ---------- จัดวาง ---------- */
  flatten(list, depth, out, gaps) {
    for (let i = 0; i < list.length; i++) {
      const b = list[i]; gaps.push({ list, idx: i, pos: out.length, depth });
      if (!b.body) out.push({ b, role: 'leaf', depth, list, i });
      else {
        out.push({ b, role: 'open', depth, list, i }); this.flatten(b.body, depth + 1, out, gaps);
        if (b.t === 'ifelse') { out.push({ b, role: 'else', depth, list, i }); this.flatten(b.other, depth + 1, out, gaps); }
        out.push({ b, role: 'end', depth, list, i });
      }
    }
    gaps.push({ list, idx: list.length, pos: out.length, depth });
  }
  render(instant, from) {
    const toks = [], gaps = []; this.flatten(this.list(), 0, toks, gaps); this.tokens = toks; this.gaps = gaps;
    let y = 6; const ys = []; toks.forEach(t => { ys.push(y); y += (t.role === 'end' || t.role === 'else' ? ENDH : RH) + GAP; });
    this.rowY = ys; this.total = y + 8;
    const keep = new Set();
    toks.forEach((t, k) => {
      const key = t.b.id + ':' + t.role; keep.add(key);
      const x = t.depth * IND + 4, w = this.rect.w - x - 8, ty = ys[k] - this.scrollY;
      let r = this.rows.get(key);
      if (!r || r.rw !== w) {
        if (r) { r.destroy(); }
        r = new Row(this.scene, w, t.role, t.b); this.root.add(r); this.rows.set(key, r); r.setPosition(x, ty); r.fresh = true;
        const zone = this.scene.add.zone(w / 2, r.h / 2, w, r.h).setInteractive({ useHandCursor: true }); r.add(zone);
        zone.on('pointerup', (p) => { if (this.drag && this.drag.moved) return; this.tap(r.tok, p); });
        if (!instant && from) { r.setPosition(from.x - this.rect.x, from.y - this.rect.y).setScale(0.6).setAlpha(0.25); this.scene.tweens.add({ targets: r, x, y: ty, scaleX: 1, scaleY: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' }); r.fresh = false; }
      }
      r.tok = t;
      if (r.fresh || instant) { this.scene.tweens.killTweensOf(r); r.setPosition(x, ty); r.fresh = false; r.setScale(1).setAlpha(1); }
      else this.scene.tweens.add({ targets: r, x, y: ty, duration: 180, ease: 'Cubic.easeOut' });
      if (t.role === 'open') { const B = BLK[t.b.t]; r.setParam(t.b.t === 'rep' ? '× ' + t.b.n : (B.cond ? COND_LABEL[t.b.c] : '')); }
    });
    this.rows.forEach((r, key) => { if (!keep.has(key)) { this.rows.delete(key); this.scene.tweens.add({ targets: r, scaleX: 0.3, scaleY: 0.3, alpha: 0, duration: 140, onComplete: () => r.destroy() }); } });
    this.drawRails(); this.drawCaret();
    this.empty.setVisible(!toks.length && !this.locked);
    this.clampScroll(); this.changed();
  }
  drawRails() {
    const g = this.rails; g.clear(); const open = [];
    this.tokens.forEach((t, k) => {
      if (t.role === 'open') open.push({ t, k });
      if (t.role === 'end') {
        const o = open.pop(); if (!o) return; const B = BLK[o.t.b.t];
        const x = o.t.depth * IND + 4, y0 = this.rowY[o.k] + RH - this.scrollY, y1 = this.rowY[k] - this.scrollY + ENDH;
        g.fillStyle(B.c, 0.75); g.fillRect(x, y0 - 4, 5, y1 - y0 + 4);
      }
    });
  }
  caretPos() {
    const gp = this.gaps.find(q => q.list === this.caret.list && q.idx === this.caret.idx);
    const pos = gp ? gp.pos : this.tokens.length, depth = gp ? gp.depth : 0;
    const y = pos < this.tokens.length ? this.rowY[pos] - 3 : this.total - 12;
    return { y, depth };
  }
  drawCaret() {
    const g = this.caretG; g.clear(); if (this.locked) return;
    const c = this.caretPos(), x = c.depth * IND + 4, w = this.rect.w - x - 8, y = c.y - this.scrollY;
    g.fillStyle(KG.C.cyan, 0.25); g.fillRect(x, y - 3, w, 6); g.fillStyle(KG.C.cyan, 1); g.fillRect(x, y - 1.5, w, 3);
    g.fillTriangle(x - 4, y - 8, x - 4, y + 8, x + 8, y);
    if (!this._caretTw) this._caretTw = this.scene.tweens.add({ targets: g, alpha: 0.45, duration: 520, yoyo: true, repeat: -1 });
    // เลื่อนให้เห็นเคอร์เซอร์
    if (y > this.rect.h - 20) this.setScroll(this.scrollY + (y - (this.rect.h - 60)), true);
    else if (y < 8 && this.scrollY > 0) this.setScroll(this.scrollY + y - 60, true);
  }
  setScroll(v, soft) { const t = KG.clamp(v, 0, Math.max(0, this.total - this.rect.h)); if (t === this.scrollY) return; this.scrollY = t; this.render(true); }
  clampScroll() { const m = Math.max(0, this.total - this.rect.h); if (this.scrollY > m) this.scrollY = m; }
  scrollBy(d) { this.setScroll(this.scrollY + d); }
  ensureVisible(row) { const y = row.y; if (y < 4) this.setScroll(this.scrollY + y - 40); else if (y + row.h > this.rect.h - 4) this.setScroll(this.scrollY + (y + row.h - this.rect.h) + 40); }

  /* ---------- แก้โปรแกรม ---------- */
  tap(t, p) {
    if (this.locked || !t) return; KG.audio.play('tap'); const b = t.b;
    if (t.role === 'open') {
      const r = this.rows.get(b.id + ':open'), local = p && r ? p.worldX - (this.rect.x + r.x) : 0, onParam = r && r.pillW && local > r.rw - 12 - r.pillW - 8;
      if (onParam && b.t === 'rep') { b.n = REP_STEPS[(REP_STEPS.indexOf(b.n) + 1) % REP_STEPS.length]; KG.audio.play('tick', { p: 1.2 }); }
      else if (onParam && BLK[b.t].cond) { b.c = CONDS[(CONDS.indexOf(b.c) + 1) % CONDS.length]; KG.audio.play('tick', { p: 1.2 }); }
      this.caret = { list: b.body, idx: 0 };
    } else if (t.role === 'else') this.caret = { list: b.other, idx: 0 };
    else if (t.role === 'end') this.caret = { list: t.list, idx: t.i + 1 };
    else this.caret = { list: t.list, idx: t.i + 1 };
    const r = this.rows.get(b.id + ':' + t.role); if (r) this.scene.tweens.add({ targets: r, scaleX: 1.03, scaleY: 1.03, duration: 90, yoyo: true });
    this.render(true);
  }
  insert(type, from) {
    const sc = this.scene;
    if (this.locked) { toast_(sc, 'กดรีเซ็ตก่อนจึงจะแก้โปรแกรมได้'); return false; }
    if (type === 'call' && this.tab === 'fn') { toast_(sc, 'ในท่า A เรียกท่า A ซ้ำไม่ได้'); KG.audio.play('error'); return false; }
    if (this.count() >= this.maxBlocks) { KG.audio.play('error'); toast_(sc, 'การ์ดเต็มแล้ว ลองจัดโปรแกรมให้สั้นลง'); KG.fx.shake(sc, 120, 0.003); return false; }
    const b = { id: 'b' + (this.uid++), t: type };
    if (type === 'rep') { b.n = 2; b.body = []; } else if (type === 'until') b.body = [];
    else if (type === 'while') { b.c = 'foe'; b.body = []; } else if (type === 'if') { b.c = 'ahead'; b.body = []; } else if (type === 'ifelse') { b.c = 'ahead'; b.body = []; b.other = []; }
    this.caret.list.splice(this.caret.idx, 0, b);
    this.caret = b.body ? { list: b.body, idx: 0 } : { list: this.caret.list, idx: this.caret.idx + 1 };
    KG.audio.play('drop'); this.render(false, from);
    return true;
  }
  deleteBack() {
    if (this.locked) return;
    const { list, idx } = this.caret;
    if (idx > 0) { list.splice(idx - 1, 1); this.caret = { list, idx: idx - 1 }; }
    else {
      const owner = this.findOwner(list);
      if (owner && owner.empty) { owner.parent.splice(owner.i, 1); this.caret = { list: owner.parent, idx: owner.i }; }
      else { KG.audio.play('error'); return; }
    }
    KG.audio.play('remove'); this.render(true);
  }
  findOwner(list) {
    const search = arr => {
      for (let i = 0; i < arr.length; i++) {
        const b = arr[i];
        if (b.body === list || b.other === list) return { parent: arr, i, empty: b.body.length === 0 && (!b.other || b.other.length === 0) };
        const r = (b.body && search(b.body)) || (b.other && search(b.other)); if (r) return r;
      }
      return null;
    };
    return search(this.prog.main) || search(this.prog.fn);
  }
  clear() { if (this.locked || !this.count()) return; this.prog = { main: [], fn: [] }; this.caret = { list: this.prog[this.tab], idx: 0 }; this.scrollY = 0; this.render(true); KG.audio.play('remove'); }
  switchTab(name) { if (this.locked || this.tab === name) return; this.tab = name; this.caret = { list: this.prog[name], idx: this.prog[name].length }; this.scrollY = 0; this.rows.forEach(r => r.destroy()); this.rows.clear(); this.render(true); }
  load(prog) { this.prog = prog; this.tab = 'main'; this.caret = { list: this.prog.main, idx: this.prog.main.length }; this.scrollY = 0; this.rows.forEach(r => r.destroy()); this.rows.clear(); this.render(true); }
  setLocked(v) { this.locked = v; this.caretG.setVisible(!v); this.empty.setVisible(!v && !this.tokens.length); }

  /* ---------- ไฟตอนรัน ---------- */
  highlight(id, op, ok) {
    this.rows.forEach(r => { if (r._lit) { r._lit = false; r.light(false); } });
    if (!id) return;
    [id + ':leaf', id + ':open'].forEach(k => {
      const r = this.rows.get(k); if (!r) return; r._lit = true;
      r.light(true, op === 'cond' ? (ok ? 0x5ef08a : 0xff7a8a) : 0xffffff);
      this.scene.tweens.add({ targets: r, x: r.x + 6, duration: 90, yoyo: true });
      this.ensureVisible(r);
    });
  }
  markBad(id) { const r = this.rows.get(id + ':leaf') || this.rows.get(id + ':open'); if (r) { r.light(true, 0xff4d5e); r._lit = true; this.scene.tweens.add({ targets: r, x: r.x + 6, duration: 50, yoyo: true, repeat: 4 }); } }
  destroy() { this.root.destroy(true); this.empty.destroy(); }
}
