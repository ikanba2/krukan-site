/* ===== Techno Aksorn: ร้านค้า (แต่งตัวละคร) · สมุดสติกเกอร์ · บ้านคัดลายมือ ===== */
const HAIRS = [['spiky', 'ทรงหนาม'], ['short', 'ผมสั้น'], ['bob', 'ผมบ๊อบ'], ['long', 'ผมยาว'], ['pony', 'ผมมัด'], ['bun', 'ผมจุก'], ['curly', 'ผมหยิก']];
const SKIN_NAMES = ['ผิวขาว', 'ผิวเหลือง', 'ผิวแทน', 'ผิวเข้ม'];
const avWith = (scene, wear, size) => KG.tex(scene, 'ak-av|' + JSON.stringify(wear) + '|' + size, size, size, c => { c.scale(size / 100, size / 100); c.lineJoin = 'round'; c.lineCap = 'round'; drawAvatar(c, wear); });
const SHOP_TABS = [['hat', 'หมวก'], ['color', 'สีเสื้อ'], ['pet', 'สัตว์เลี้ยง'], ['hair', 'ทรงผม'], ['skin', 'สีผิว']];

class ShopScene extends KG.Scene {
  constructor() { super('Shop'); }
  init(d) { d = d || {}; this.tab = d.tab || 'hat'; this._restartData = { tab: this.tab }; }
  create() {
    this.setup(); KG.audio.music('breeze'); menuBg(this, 'sunset'); menuHeader(this, { title: 'ร้านค้า · แต่งตัวละคร', onHome: () => this.go('Map') });
    this.tabBtns = []; SHOP_TABS.forEach((t, i) => { const b = new KG.ui.Button(this, 640 + i * 126 - 252 + 126 - 36 + 36, 124, 118, 46, { label: t[1], style: t[0] === this.tab ? 'primary' : 'ghost', size: 20, slant: 8, onClick: () => { this.tab = t[0]; this._restartData = { tab: this.tab }; this.scene.restart(this._restartData); } }); b.x = 480 + i * 126; this.tabBtns.push(b); });
    this.preview(); this.grid();
    this.txt(GW / 2, 676, 'แตะของที่ชอบเพื่อซื้อและสวมใส่ เหรียญได้จากการเล่นเกมและเขียนตามรอยทุกบท', { size: 20, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Map'); }
  preview() {
    const x = 170, y = 380; addCard(this, x, y, 290, 480, { r: 30, fill: ['#ffffff', '#fff0cf'], shadow: 9 });
    this.avImg = this.add.image(x - 14, y - 30, avatarTex(this, 240)).setDisplaySize(240, 240); this.petImg = null;
    if (SAVE.data.wear.pet !== 'none') this.petImg = this.add.image(x + 62, y + 104, petTex(this, SAVE.data.wear.pet, 110)).setDisplaySize(110, 110);
    const nm = KG.playerName(); this.txt(x, y + 160, nm ? nm : 'ตัวละครของฉัน', { size: 28, color: TKC.ink, center: true, ox: 0.5, oy: 0.5 }); this.txt(x, y + 198, 'แตะตัวละครเพื่อโบกมือ', { size: 16, weight: 400, color: '#6a64a0', center: true, ox: 0.5, oy: 0.5 });
    const z = this.add.zone(x - 14, y - 30, 220, 240).setInteractive({ useHandCursor: true }); z.on('pointerup', () => { KG.audio.play('pop'); SPEECH.say('สวัสดี'); this.tweens.add({ targets: this.avImg, y: this.avImg.y - 22, duration: 140, yoyo: true, repeat: 1 }); });
  }
  items() {
    const t = this.tab;
    if (t === 'hair') return HAIRS.map(h => ({ id: h[0], th: h[1], price: 0 }));
    if (t === 'skin') return SKIN_NAMES.map((n, i) => ({ id: i, th: n, price: 0 }));
    return SHOP[t].map(r => ({ id: r[0], th: r[1], price: r[2] }));
  }
  has(it) { const t = this.tab; if (t === 'hair' || t === 'skin') return true; return it.price === 0 || (SAVE.data.owned[t] || []).includes(it.id); }
  worn(it) { return SAVE.data.wear[this.tab] === it.id; }
  grid() {
    const its = this.items(), cols = 4, w = 196, h = 182, gx = 14, gy = 14, x0 = 340, y0 = 168;
    its.forEach((it, i) => {
      const r = Math.floor(i / cols), cc = i % cols, x = x0 + w / 2 + cc * (w + gx), y = y0 + h / 2 + r * (h + gy), owned = this.has(it), worn = this.worn(it), c = this.add.container(0, 0);
      c.add(addCard(this, x, y, w, h, { r: 24, lw: worn ? 6 : 4, edge: worn ? '#3fb54a' : TKC.ink, shadow: 6, fill: worn ? ['#eaffec', '#c8ffd2'] : ['#ffffff', '#f6f0ff'] }));
      const wear = Object.assign({}, SAVE.data.wear); if (this.tab !== 'pet') wear[this.tab] = it.id;
      if (this.tab === 'pet') { if (it.id === 'none') c.add(KG.txt(this, x, y - 22, 'ไม่มี', { size: 30, color: '#a9a2c8', center: true, middle: true })); else c.add(this.add.image(x, y - 20, petTex(this, it.id, 100)).setDisplaySize(100, 100)); }
      else c.add(this.add.image(x, y - 22, avWith(this, wear, 120)).setDisplaySize(112, 112));
      c.add(KG.txt(this, x, y + 42, it.th, { size: 20, color: TKC.ink, center: true, middle: true }));
      if (worn) c.add(KG.txt(this, x, y + 70, 'ใส่อยู่ ✓', { size: 19, color: '#3fb54a', center: true, middle: true }));
      else if (owned) c.add(KG.txt(this, x, y + 70, 'แตะเพื่อใส่', { size: 17, weight: 400, color: '#6a64a0', center: true, middle: true }));
      else { c.add(KG.ui.icon(this, 'gem', x - 24, y + 70, 24, 0xffb800)); c.add(KG.txt(this, x + 2, y + 70, String(it.price), { size: 22, color: (SAVE.data.coins || 0) >= it.price ? TKC.ink : '#ee4a4a', oy: 0.5, middle: true })); }
      const zn = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }); c.add(zn); zn.on('pointerup', () => this.pick(it));
      c.setAlpha(0).y += 16; this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 240, delay: 30 * i });
    });
  }
  pick(it) {
    const t = this.tab;
    if (this.has(it)) { SAVE.data.wear[t] = it.id; SAVE.save(); KG.audio.play('confirm'); this.scene.restart(this._restartData); return; }
    if ((SAVE.data.coins || 0) < it.price) { KG.audio.play('error'); KG.ui.toast(this, 'เหรียญยังไม่พอ ไปเล่นเกมเก็บเพิ่มก่อนนะ (ขาดอีก ' + (it.price - (SAVE.data.coins || 0)) + ')', { ms: 2400, sfx: 'error' }); return; }
    addCoins(-it.price); SAVE.data.owned[t] = (SAVE.data.owned[t] || []).concat([it.id]); SAVE.data.wear[t] = it.id; SAVE.save(); KG.audio.play('win'); KG.fx.confetti(this, { ms: 900 });
    KG.ui.toast(this, 'ซื้อ ' + it.th + ' แล้ว ใส่ให้เลย!', { ms: 1800 }); this.time.delayedCall(700, () => this.scene.restart(this._restartData));
  }
}

class StickersScene extends KG.Scene {
  constructor() { super('Stickers'); }
  create() {
    this.setup(); KG.audio.music('breeze'); menuBg(this, 'meadow'); const got = Object.keys(SAVE.data.stickers).length;
    menuHeader(this, { title: 'สมุดสติกเกอร์ ' + got + '/44', onHome: () => this.go('Map') });
    const cols = 11, w = 104, h = 118, gx = 8, gy = 12, x0 = (GW - (cols * w + (cols - 1) * gx)) / 2, y0 = 100;
    CONS.forEach((r, i) => {
      const col = i % cols, row = Math.floor(i / cols), x = x0 + w / 2 + col * (w + gx), y = y0 + h / 2 + row * (h + gy), has = !!SAVE.data.stickers[r[0]], c = this.add.container(x, y);
      c.add(addCard(this, 0, 0, w, h, { r: 18, lw: 3.5, shadow: 5, fill: has ? ['#ffffff', '#fff3cf'] : ['#efeaf8', '#dcd5ec'] }));
      if (has) { c.add(pic(this, r[4], 0, -20, 66, 66)); c.add(glyph(this, 0, 36, r[0], 42, '#e83a8e')); c.setSize(w, h).setInteractive({ useHandCursor: true }); c.on('pointerup', () => { KG.audio.play('pop'); SPEECH.say(r[1]); this.tweens.add({ targets: c, scaleX: 1.12, scaleY: 1.12, duration: 120, yoyo: true }); }); }
      else { c.add(glyph(this, 0, -8, r[0], 52, '#c4bddd')); c.add(KG.ui.icon(this, 'lock', 0, 38, 22, 0xa9a2c8)); }
      c.setAlpha(0).y += 14; this.tweens.add({ targets: c, alpha: 1, y, duration: 220, delay: 12 * i });
    });
    this.txt(GW / 2, 676, got ? 'แตะสติกเกอร์เพื่อฟังชื่อ · เขียนตามรอยพยัญชนะให้ครบทุกตัวเพื่อสะสมให้ครบ 44 ใบ' : 'เขียนตามรอยพยัญชนะแต่ละตัวให้สำเร็จ แล้วจะได้สติกเกอร์ตัวนั้นมาใส่สมุด', { size: 20, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Map'); }
}

class WriteScene extends KG.Scene {
  constructor() { super('Write'); }
  init(d) { d = d || {}; this.setId = d.set || 'wc'; this._restartData = { set: this.setId }; }
  create() {
    this.setup(); KG.audio.music('sunny'); menuBg(this, 'meadow'); menuHeader(this, { title: 'บ้านคัดลายมือ', onHome: () => this.go('Map'), how: { title: 'บ้านคัดลายมือ', body: 'เลือกหมวด แล้วแตะตัวที่อยากฝึกเขียนตามรอย ฝึกซ้ำได้ไม่จำกัด ตัวที่เขียนแล้วจะมีดาวบอกความแม่น พยัญชนะที่เขียนสำเร็จครั้งแรกได้สติกเกอร์' } });
    const tsp = Math.min(250, 1190 / WRITE_SETS.length); WRITE_SETS.forEach((s, i) => { new KG.ui.Button(this, GW / 2 - tsp * (WRITE_SETS.length - 1) / 2 + i * tsp, 124, tsp - 12, 48, { label: s.th, style: s.id === this.setId ? 'primary' : 'ghost', size: tsp < 240 ? 19 : 21, slant: 8, onClick: () => this.scene.restart({ set: s.id }) }); });
    const S = WRITE_SETS.find(s => s.id === this.setId), n = S.items.length, cols = n > 20 ? 10 : n > 6 ? 8 : 5, w = n > 20 ? 114 : 132, h = n > 20 ? 88 : 110, gx = 10, gy = 10, x0 = (GW - (cols * w + (cols - 1) * gx)) / 2;
    S.items.forEach((k, i) => {
      const col = i % cols, row = Math.floor(i / cols), x = x0 + w / 2 + col * (w + gx), y = 190 + h / 2 + row * (h + gy), best = SAVE.data.traced[k] || 0, c = this.add.container(x, y), text = cons(k) ? k : k;
      c.add(addCard(this, 0, 0, w, h, { r: 18, lw: 3.5, shadow: 5, fill: best ? ['#eaffec', '#c8ffd2'] : ['#ffffff', '#f6f0ff'] })); c.add(fitText(glyph(this, 0, -8, text, h > 100 ? 56 : 44, TKC.ink), w - 16));
      for (let q = 0; q < 3; q++) c.add(KG.ui.icon(this, q < best ? 'star' : 'starO', (q - 1) * 24, h / 2 - 17, 18, q < best ? 0xffb800 : KG.SKIN.starOff));
      c.setSize(w, h).setInteractive({ useHandCursor: true }); c.on('pointerover', () => KG.audio.play('hover')); c.on('pointerup', () => { KG.audio.play('confirm'); this.go('Trace', { set: S.id, idx: i }); });
      c.setAlpha(0).y += 14; this.tweens.add({ targets: c, alpha: 1, y, duration: 220, delay: 10 * i });
    });
    const done = S.items.filter(k => SAVE.data.traced[k]).length; this.txt(GW / 2, 676, 'หมวดนี้เขียนแล้ว ' + done + '/' + n + ' ตัว · แตะตัวที่อยากฝึก', { size: 21, weight: 400, color: '#ffffff', center: true, ox: 0.5, stroke: true });
  }
  onEscape() { this.go('Map'); }
}
