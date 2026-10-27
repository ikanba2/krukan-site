/* ===== แป้นพิมพ์บนจอแบบคีย์บอร์ดจริง (ปรับ 26 ต.ค. 2569 ตามผู้ใช้: ให้เหมือนคีย์บอร์ดจริง วรรณยุกต์ไม่มีวงกลมจุด ปุ่ม Shift มีเอฟเฟกต์เมื่อต้องกด) =====
   ตัวเครื่องสีเข้ม ปุ่มแบบปุ่มกดจริง (ขอบข้างลึก หน้าปุ่มนูน เงาใต้ปุ่ม) ไฟใต้ปุ่มบอกปุ่มที่ต้องกด ขีดสีที่ขอบล่างบอกนิ้ว กดแล้วปุ่มยุบลงแล้วเด้งกลับ
   ตัวถัดไปต้องใช้ Shift: ปุ่ม Shift ติดไฟสีส้ม มีป้าย "กด Shift ค้าง" ใต้ปุ่ม และปุ่มตัวอักษรสลับให้ตัวบน (ตัวที่ต้องพิมพ์) ใหญ่กลางปุ่ม
   กด Shift ค้าง (คีย์บอร์ดจริงหรือแตะบนจอ): ปุ่ม Shift ยุบค้างสีเขียว ทุกปุ่มสลับให้เห็นตัวบนชัด (setShiftHeld)
   แตะ/คลิกปุ่มบนจอเพื่อพิมพ์ได้ (onTap) · ปุ่ม ด/F กับ ่/J มีขีดนูน · setBlind ซ่อนตัวอักษรสำหรับฝึกพิมพ์สัมผัส · ไฟ Caps Lock มุมขวาบนของตัวเครื่อง (setCapsLed) */
const KU = 60, KH = 44;   // หน่วยปุ่มและความสูงปุ่ม
// สีปุ่ม: [หน้าปุ่มบน, หน้าปุ่มล่าง, ขอบข้าง, เส้นแสงขอบบน, สีตัวอักษร]
const KEY_PAL = {
  norm: ['#575e6e', '#3c424f', '#1c1f27', 'rgba(255,255,255,.26)', '#f4f6fb'],
  mod: ['#40454f', '#2c3038', '#15171d', 'rgba(255,255,255,.18)', '#c9d0de'],
  next: ['#fff3b0', '#ffc61f', '#9a6a00', 'rgba(255,255,255,.85)', '#3a2600'],
  shift: ['#ffd0a0', '#ff8a24', '#9a3c00', 'rgba(255,255,255,.8)', '#3a1600'],
  ok: ['#a8ffc6', '#2fc764', '#0d6a2e', 'rgba(255,255,255,.7)', '#04210f'],
  bad: ['#ffb0b8', '#ef3047', '#8a0c1d', 'rgba(255,255,255,.6)', '#3a0008'],
  enter: ['#a8ffc6', '#2fc764', '#0d6a2e', 'rgba(255,255,255,.7)', '#04210f'],
  enter2: ['#effff3', '#7cf7a4', '#1f9a4c', 'rgba(255,255,255,.95)', '#04210f'],
  idle: ['#3d4842', '#29302c', '#141916', 'rgba(255,255,255,.12)', '#7b9c86']
};
const KEY_SKIRT = 6;   // ความลึกขอบข้างปุ่มที่เห็นด้านล่าง (หน้าปุ่มอยู่สูงกว่าฐาน)
function keyRR(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function keyFace(scene, w, h, state) {
  const P = KEY_PAL[state] || KEY_PAL.norm;
  return KG.tex(scene, ['kcap', w, h, state].join('|'), w + 12, h + 16, ctx => {
    ctx.translate(6, 4);
    const r = Math.min(9, h * 0.2), S = KEY_SKIRT;
    // เงาใต้ปุ่ม + ฐานปุ่ม (ขอบข้าง) ไล่เข้มลงล่าง
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3; keyRR(ctx, 0, 0, w, h, r); ctx.fillStyle = P[2]; ctx.fill(); ctx.restore();
    keyRR(ctx, 0, 0, w, h, r); ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, h, [[0, 'rgba(255,255,255,.10)'], [0.6, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.35)']]); ctx.fill();
    // หน้าปุ่ม (นูนขึ้นจากฐาน แคบกว่าฐานเล็กน้อยแบบปุ่มคีย์บอร์ดจริง)
    const tx = 3.5, ty = 1.5, tw = w - 7, th = h - S - 2.5, tr = Math.max(4, r - 2);
    keyRR(ctx, tx, ty, tw, th, tr); ctx.fillStyle = KG.ui.lin(ctx, 0, ty, 0, ty + th, [[0, P[0]], [1, P[1]]]); ctx.fill();
    ctx.save(); keyRR(ctx, tx, ty, tw, th, tr); ctx.clip();
    ctx.fillStyle = KG.ui.lin(ctx, 0, ty, 0, ty + th * 0.55, [[0, 'rgba(255,255,255,.16)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(tx, ty, tw, th * 0.55);   // แสงบนหน้าปุ่ม
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(tx, ty + th - 2, tw, 2);   // ขอบล่างหน้าปุ่ม
    ctx.restore();
    keyRR(ctx, tx + 0.5, ty + 0.5, tw - 1, th - 1, tr); ctx.lineWidth = 1.2; ctx.strokeStyle = P[3]; ctx.stroke();
  });
}

// สระบน/ล่างและวรรณยุกต์ (ไม้เอก ไม้โท ไม้ตรี ไม้จัตวา ไม้หันอากาศ สระอิ อี อึ อื อุ อู ไม้ไต่คู้ การันต์ ฯลฯ) เป็นตัวที่ไม่มีความกว้างของตัวเอง
// วาดแบบที่พิมพ์บนปุ่มคีย์บอร์ดไทยจริง: เครื่องหมายเดี่ยว ๆ ขนาดปกติ ไม่มีวงกลมจุด (ผู้ใช้บอกว่ารกตา) ตัวบนอยู่ครึ่งบนของปุ่ม ตัวล่าง (อุ อู พินทุ) อยู่ครึ่งล่าง
// วิธี: วาด อ+เครื่องหมาย ลบรูป อ ออก (ลบขอบหนาและตัดพิกเซลจาง ๆ ที่เหลือ ไม่ให้เห็นเงา อ) แล้วตัดกรอบเฉพาะเครื่องหมายมาวาง
const TH_MARK = /^[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]$/, MARK_LOW = /^[\u0E38-\u0E3A]$/;
function markTex(scene, ch, size) {
  const w = Math.round(size * 1.4), h = Math.round(size * 1.4), low = MARK_LOW.test(ch);
  return KG.tex(scene, 'kmark4|' + ch + '|' + size, w, h, ctx => {
    const K = KG.K, font = '600 ' + size + 'px Kanit, Tahoma, sans-serif', base = 'อ', W = Math.ceil(size * 3 * K), H = Math.ceil(size * 3 * K), x = size * 0.9, y = size * 1.9;
    const T = document.createElement('canvas'); T.width = W; T.height = H; const t = T.getContext('2d'); t.scale(K, K);
    t.font = font; t.fillStyle = '#ffffff'; t.fillText(base + ch, x, y);
    t.globalCompositeOperation = 'destination-out'; t.fillText(base, x, y); t.lineWidth = Math.max(2, size * 0.1); t.strokeStyle = '#000'; t.strokeText(base, x, y);
    const img = t.getImageData(0, 0, W, H), d = img.data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const a = (yy * W + xx) * 4 + 3;
      if (d[a] < 80) { d[a] = 0; continue; }
      if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
    }
    if (x1 < 0) return;
    t.putImageData(img, 0, 0);
    const bw = (x1 - x0 + 1) / K, bh = (y1 - y0 + 1) / K, cy = h * (low ? 0.7 : 0.3);
    ctx.drawImage(T, x0, y0, x1 - x0 + 1, y1 - y0 + 1, (w - bw) / 2, cy - bh / 2, bw, bh);
  });
}

// ตัวเครื่องคีย์บอร์ด (ฐานสีเข้ม ขอบมน มีร่องที่ปุ่มวางอยู่)
function keyboardBody(scene, w, h) {
  return KG.tex(scene, 'kbody|' + w + '|' + h, w + 16, h + 18, ctx => {
    ctx.translate(8, 4);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6; keyRR(ctx, 0, 0, w, h, 20); ctx.fillStyle = '#16181e'; ctx.fill(); ctx.restore();
    keyRR(ctx, 0, 0, w, h, 20); ctx.fillStyle = KG.ui.lin(ctx, 0, 0, 0, h, [[0, '#353a45'], [0.08, '#262a33'], [1, '#121419']]); ctx.fill();
    keyRR(ctx, 0.5, 0.5, w - 1, h - 1, 20); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
    keyRR(ctx, 8, 9, w - 16, h - 17, 12); ctx.fillStyle = '#0b0d11'; ctx.fill();   // ร่องวางปุ่ม
    keyRR(ctx, 8, 9, w - 16, h - 17, 12); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.stroke();
  });
}

class OnScreenKeyboard {
  constructor(scene, x, y, lang) {
    this.scene = scene; this.lang = lang; this.keys = {}; this.root = scene.add.container(x, y); this.x0 = x; this.y0 = y; this.hot = []; this.extras = []; this.latched = {}; this.blind = false; this.onTap = null; this.shiftHeld = false; this.shiftHint = false;
    const BW = 15 * KU + 16, BH = 5 * (KH + 6) + 18;
    this.root.add(scene.add.image(-14, -14, keyboardBody(scene, BW, BH)).setOrigin(0, 0));
    // ไฟ Caps Lock แบบคีย์บอร์ดจริง
    this.capsLed = scene.add.circle(15 * KU - 40, -5, 3.2, 0x2a3530); this.capsLedGlow = scene.add.image(15 * KU - 40, -5, 'fx_glow').setTint(0x5ef08a).setBlendMode('ADD').setDisplaySize(26, 26).setAlpha(0);
    this.root.add([this.capsLedGlow, this.capsLed, KG.txt(scene, 15 * KU - 32, -5, 'Caps', { size: 11, weight: 400, color: '#7c8496', oy: 0.5 })]);
    TY.ROWS.forEach((row, ri) => {
      let cx = 0;
      row.forEach(def => {
        const code = def[0], u = def[1], w = Math.round(u * KU) - 6, h = KH, px = cx + (u * KU) / 2 - 3, py = ri * (KH + 6) + h / 2;
        const k = scene.add.container(px, py);
        k.code = code; k.kw = w; k.kh = h; k.special = def[2] || null; k.base = k.special && code !== 'Space' ? 'mod' : 'norm'; k.state = k.base; k.baseY = py;
        k.glow = scene.add.image(0, 0, 'fx_glow').setTint(0xffd34f).setBlendMode('ADD').setDisplaySize(w * 1.8, h * 2.6).setAlpha(0);
        k.face = scene.add.image(0, 3, keyFace(scene, w, h, k.base)).setDisplaySize(w + 12, h + 16);
        k.stripe = scene.add.rectangle(0, h / 2 - 3, w - 18, 3, TY.fingerColor(code), 0.9);   // ไฟสีนิ้วที่ขอบล่างของปุ่ม
        k.label = KG.txt(scene, 0, -3, '', { size: 22, color: KEY_PAL[k.base][4], center: true, middle: true });
        k.sub = KG.txt(scene, w / 2 - 8, -h / 2 + 3, '', { size: 13, color: '#aeb6c8', ox: 1, oy: 0, weight: 400 });
        k.mark = scene.add.image(0, -3, '__DEFAULT').setVisible(false); k.subMark = scene.add.image(w / 2 - 15, -h / 2 + 11, '__DEFAULT').setVisible(false);
        k.add([k.glow, k.face, k.stripe, k.label, k.sub, k.mark, k.subMark]);
        if (code === 'KeyF' || code === 'KeyJ') k.add(scene.add.rectangle(0, 10, 14, 3, 0xffffff, 0.55));   // ขีดนูนบนแป้นเหย้า (นิ้วชี้คลำหา)
        k.zone = scene.add.zone(0, 2, w + 6, h + 6).setInteractive({ useHandCursor: true }); k.add(k.zone);
        k.zone.on('pointerdown', () => { if (this.onTap) this.onTap(code); });
        this.root.add(k); this.keys[code] = k; cx += u * KU;
      });
    });
    // จัดแถวสุดท้ายให้อยู่กลางแป้น
    const sp = this.keys.Space; sp.x = 15 * KU / 2 - 3;
    this.setLang(lang);
  }
  labelFor(code, lang) {
    const k = this.keys[code]; if (k.special) return { main: k.special, sub: '' };
    const m = TY.MAPS[lang][code]; if (!m) return { main: '', sub: '' };
    if (lang === 'en') return /^Key/.test(code) ? { main: m[1], sub: '' } : { main: m[0], sub: m[1] !== m[0] ? m[1] : '' };
    return { main: m[0], sub: m[1] !== m[0] ? m[1] : '' };
  }
  // ตัวอักษรบนปุ่ม: shifted = ให้ตัวบน (ตัวที่ได้เมื่อกด Shift) ใหญ่กลางปุ่ม และตัวปกติเล็กมุมขวาบน
  legend(k, shifted) {
    const t = this.labelFor(k.code, this.lang); let main = t.main, sub = t.sub;
    if (shifted && sub) { const m = main; main = sub; sub = m; }
    const mk = TH_MARK.test(main), sk = TH_MARK.test(sub), on = k.state !== k.base;
    k.label.setText(mk ? '' : main); k.sub.setText(sk ? '' : sub);
    k.mark.setVisible(mk); if (mk) k.mark.setTexture(markTex(this.scene, main, 34)).setDisplaySize(48, 48).setY(-3);
    k.subMark.setVisible(sk); if (sk) k.subMark.setTexture(markTex(this.scene, sub, 16)).setDisplaySize(22, 22);
    if (k.special) { k.label.setFontSize(16).setScale(1); if (k.code !== 'Space') k.label.setScale(Math.min(1, (k.kw - 12) / Math.max(1, k.label.width))); }
    else k.label.setFontSize(this.lang === 'th' ? 24 : 22).setScale(1);
    k.label.setColor(KEY_PAL[k.state][4]); k.sub.setColor(on ? KEY_PAL[k.state][4] : '#aeb6c8'); k.sub.setAlpha(on ? 0.75 : 1);
    if (on) { k.mark.setTint(0x3a2600); k.subMark.setTint(0x3a2600); } else { k.mark.clearTint(); k.subMark.setTint(0xaeb6c8); }
    if (this.blind && !k.special) { [k.label, k.sub, k.mark, k.subMark].forEach(o => o.setAlpha(0)); }
    else if (!k.special) { k.label.setAlpha(1); k.mark.setAlpha(1); k.subMark.setAlpha(1); }
  }
  setLang(lang) { this.lang = lang; Object.keys(this.keys).forEach(code => this.legend(this.keys[code], this.shiftHeld)); }
  // ซ่อนตัวอักษรบนปุ่ม (เหลือไฟสีนิ้วที่ขอบปุ่ม) ให้ฝึกพิมพ์โดยไม่มองแป้น
  setBlind(on) { this.blind = on; Object.keys(this.keys).forEach(code => this.legend(this.keys[code], this.shiftHeld)); }
  setCapsLed(on) { this.capsLed.setFillStyle(on ? 0x7dff9e : 0x2a3530); this.capsLedGlow.setAlpha(on ? 0.9 : 0); }
  // ปุ่มที่ค้างไว้ (Shift หรือ Caps ที่แตะบนจอ) แสดงหน้าปุ่มสีเขียว
  setLatch(codes, on) {
    codes.forEach(code => { const k = this.keys[code]; if (!k) return; this.latched[code] = on; if (!this.hot.includes(k)) this.setFace(k, on ? 'ok' : k.base); });
    if (codes.indexOf('ShiftLeft') >= 0) this.setShiftHeld(on);
    if (codes.indexOf('CapsLock') >= 0) this.setCapsLed(on);
  }
  // กด Shift ค้าง: ปุ่ม Shift ยุบค้าง ทุกปุ่มสลับให้เห็นตัวบนชัด ปล่อยแล้วกลับเหมือนเดิม
  setShiftHeld(on) {
    on = !!on; if (on === this.shiftHeld) return; this.shiftHeld = on;
    ['ShiftLeft', 'ShiftRight'].forEach(code => { const k = this.keys[code]; this.scene.tweens.killTweensOf(k); k.y = k.baseY + (on ? 3 : 0); k.setScale(1); if (!this.hot.includes(k)) this.setFace(k, on || this.latched[code] ? 'ok' : k.base); });
    Object.keys(this.keys).forEach(code => { const k = this.keys[code]; if (!k.special) this.legend(k, on || (this.shiftHint && this.hot.includes(k))); });
    if (this.hintCodes && this.hintCodes.some(c => /^Shift/.test(c))) this.hint(this.hintCodes);
  }
  world(code) { const k = this.keys[code]; return { x: this.x0 + k.x, y: this.y0 + k.y }; }
  setFace(k, state) { if (k.state === state) return; k.state = state; k.face.setTexture(keyFace(this.scene, k.kw, k.kh, state)); this.legend(k, this.shiftHeld || (this.shiftHint && this.hot.includes(k) && !k.special)); }
  // ไฮไลต์ปุ่มที่ต้องกดต่อไป ถ้าต้องใช้ Shift: ปุ่ม Shift สีส้ม + ป้ายกดค้าง + วงแสง และปุ่มตัวอักษรโชว์ตัวบน
  hint(codes) {
    this.clearHint(); this.hintCodes = codes.slice(); const s = this.scene, isShift = c => c === 'ShiftLeft' || c === 'ShiftRight';
    this.shiftHint = codes.some(isShift);
    codes.forEach(code => {
      const k = this.keys[code]; if (!k) return; this.hot.push(k);
      const held = isShift(code) && this.shiftHeld;   // กด Shift ค้างอยู่แล้ว: ปุ่ม Shift เป็นสีเขียว ไม่ต้องมีป้าย
      const st = code === 'Enter' ? 'enter' : held ? 'ok' : isShift(code) ? 'shift' : 'next', col = code === 'Enter' || held ? 0x5ef08a : isShift(code) ? 0xff8a24 : 0xffd34f;
      this.setFace(k, st); k.glow.setTint(col);
      s.tweens.killTweensOf(k.glow); k.glow.setAlpha(0.35);
      k._tw = s.tweens.add({ targets: k.glow, alpha: isShift(code) ? 1 : 0.95, duration: isShift(code) ? 300 : 380, yoyo: true, repeat: -1 });
      if (isShift(code) && !held) {
        // ป้าย "กด Shift ค้าง" ใต้ปุ่ม Shift (แถวล่างตรงนั้นว่าง) เด้งขึ้นลงชี้ไปที่ปุ่ม + วงแสงกระจายจากปุ่มเป็นจังหวะ
        const tag = s.add.container(k.x, k.baseY + KH + 4), tw = 158, th = 32;
        tag.add(s.add.image(0, 0, KG.tex(s, 'kshtag', tw, th + 10, ctx => {
          ctx.beginPath(); ctx.moveTo(tw / 2 - 9, 10); ctx.lineTo(tw / 2, 0); ctx.lineTo(tw / 2 + 9, 10); ctx.closePath(); ctx.fillStyle = '#ff8a24'; ctx.fill();
          keyRR(ctx, 1, 9, tw - 2, th, th / 2); ctx.fillStyle = KG.ui.lin(ctx, 0, 9, 0, 9 + th, [[0, '#ffd0a0'], [1, '#ff8a24']]); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff3e0'; ctx.stroke();
        })));
        tag.add(KG.txt(s, 0, 5, 'กด Shift ค้างไว้', { size: 17, color: '#3a1600', center: true, middle: true }));
        this.root.add(tag); this.extras.push(tag);
        tag.setScale(0.6).setAlpha(0); s.tweens.add({ targets: tag, scaleX: 1, scaleY: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
        s.tweens.add({ targets: tag, y: tag.y - 5, duration: 320, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 200 });
        const p = this.world(code); this.extras.push(s.time.addEvent({ delay: 650, loop: true, callback: () => KG.fx.ring(s, p.x, p.y, 0xff8a24, { size: 1.3, w: 0.3, depth: 61 }) }));
        KG.fx.ring(s, p.x, p.y, 0xff8a24, { size: 1.5, w: 0.4, depth: 61 });
      }
    });
    if (this.shiftHint) this.hot.forEach(k => { if (!k.special) this.legend(k, true); });
  }
  clearHint() {
    this.extras.forEach(o => { if (o instanceof Phaser.Time.TimerEvent) o.remove(); else { this.scene.tweens.killTweensOf(o); o.destroy(); } }); this.extras = [];
    const was = this.hot; this.hot = []; this.shiftHint = false; this.hintCodes = null;
    was.forEach(k => { if (k._tw) k._tw.remove(); k._tw = null; this.scene.tweens.killTweensOf(k.glow); k.glow.setAlpha(0); this.setFace(k, this.latched[k.code] || (this.shiftHeld && /^Shift/.test(k.code)) ? 'ok' : k.base); this.legend(k, this.shiftHeld); });
  }
  // กดปุ่ม: ปุ่มยุบลง (ระยะกดแบบปุ่มจริง) แล้วเด้งกลับ + แสงสีนิ้ว/ถูก/ผิด
  press(code, ok) {
    const k = this.keys[code]; if (!k) return; const s = this.scene, p = this.world(code);
    if (!(this.shiftHeld && /^Shift/.test(code))) { s.tweens.killTweensOf(k); k.y = k.baseY; s.tweens.add({ targets: k, y: k.baseY + 3, scaleX: 0.97, scaleY: 0.97, duration: 55, yoyo: true, onComplete: () => { k.y = k.baseY + (this.shiftHeld && /^Shift/.test(code) ? 3 : 0); k.setScale(1); } }); }
    const color = ok === false ? 0xff4d5e : (ok === true ? 0x5ef08a : TY.fingerColor(code));
    const fl = s.add.image(p.x, p.y, 'fx_glow').setTint(color).setBlendMode('ADD').setDisplaySize(k.kw * 2.2, k.kh * 3).setAlpha(0.85).setDepth(60);
    s.tweens.add({ targets: fl, alpha: 0, scaleX: fl.scaleX * 1.4, scaleY: fl.scaleY * 1.4, duration: 260, onComplete: () => fl.destroy() });
    KG.fx.ring(s, p.x, p.y, color, { size: 1.1, w: 0.3, depth: 61 });
    if (ok !== undefined) KG.fx.burst(s, p.x, p.y, { colors: [color, 0xffffff], n: ok === false ? 6 : 9, max: ok === false ? 140 : 210, depth: 62, life: 450 });
  }
  destroy() { this.clearHint(); this.root.destroy(true); }
}
