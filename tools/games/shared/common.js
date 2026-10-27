/* ===== ตัวช่วยกลางที่ใช้ร่วมกันหลายฉากและหลายเกม ===== */
const css = n => KG.hex(n);
const tween = (scene, cfg) => new Promise(res => scene.tweens.add(Object.assign({}, cfg, { onComplete: () => res() })));
const wait = (scene, ms) => new Promise(res => scene.time.delayedCall(ms, res));
function iconButton(scene, x, y, icon, onClick, o) {
  o = o || {};
  const b = new KG.ui.Button(scene, x, y, o.w || 60, o.h || 60, { label: '', icon, style: o.style || 'ghost', slant: 8, onClick, depth: o.depth });
  return b;
}

// ปุ่มเสียง/เพลง/เต็มจอ ใช้ซ้ำทุกฉาก (which = ชุดที่ต้องการ)
function addSystemButtons(scene, x0, y, gap, which) {
  gap = gap || 72; which = which || ['sfx', 'music', 'fs']; const out = []; let x = x0;
  if (which.includes('sfx')) {
    const b = iconButton(scene, x, y, KG.prefs.data.sfx ? 'sound' : 'mute', () => {
      KG.prefs.data.sfx = !KG.prefs.data.sfx; KG.prefs.save(); KG.audio.setSfx(KG.prefs.data.sfx);
      b.icon.setTexture(KG.ui.iconKey(scene, KG.prefs.data.sfx ? 'sound' : 'mute'));
      if (KG.prefs.data.sfx) KG.audio.play('confirm');
    }); out.push(b); x += gap;
  }
  if (which.includes('music')) {
    const b = iconButton(scene, x, y, 'music', () => {
      KG.prefs.data.music = !KG.prefs.data.music; KG.prefs.save(); KG.audio.setMusic(KG.prefs.data.music);
      b.setActive(KG.prefs.data.music); b.setAlpha(KG.prefs.data.music ? 1 : 0.55);
    });
    b.setActive(KG.prefs.data.music); b.setAlpha(KG.prefs.data.music ? 1 : 0.55); out.push(b); x += gap;
  }
  if (which.includes('fs')) { out.push(iconButton(scene, x, y, 'expand', () => KG.fullscreen())); }
  return out;
}

function hexTex(scene, r, c1, c2, state) {
  const w = r * 2 + 24, h = Math.round(r * 1.78) + 24;
  return KG.tex(scene, ['hex', r, c1, c2, state, KG.SKIN.name].join('|'), w, h, ctx => {
    ctx.translate(w / 2, h / 2);
    const pts = [], NP = KG.SKIN.round ? 40 : 6; for (let i = 0; i < NP; i++) { const a = Math.PI * 2 / NP * i + (NP === 6 ? Math.PI / 6 : 0); pts.push([Math.cos(a) * r, Math.sin(a) * r * (NP === 6 ? 0.92 : 0.96)]); }   // ธีมมน: ปุ่มด่านเป็นวงกลม
    const path = (k) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] * k, p[1] * k) : ctx.moveTo(p[0] * k, p[1] * k)); ctx.closePath(); };
    ctx.save(); ctx.shadowColor = state === 'locked' ? (KG.SKIN.pop ? 'rgba(24,44,120,.25)' : 'rgba(0,0,0,.6)') : (KG.SKIN.pop ? 'rgba(24,44,120,.35)' : c1); ctx.shadowBlur = state === 'locked' ? 6 : 18; path(1); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
    const pop = KG.SKIN.pop;
    path(1); ctx.fillStyle = state === 'locked' ? (pop ? KG.ui.lin(ctx, 0, -r, 0, r, [[0, '#dbe5fa'], [1, '#b3c3e6']]) : KG.ui.lin(ctx, 0, -r, 0, r, [[0, '#2b3566'], [1, '#141a40']])) : KG.ui.lin(ctx, 0, -r, 0, r, [[0, c1], [1, c2]]); ctx.fill();
    ctx.save(); path(1); ctx.clip(); ctx.fillStyle = KG.ui.lin(ctx, 0, -r, 0, 0, [[0, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(-r, -r, r * 2, r); ctx.restore();
    path(1); ctx.lineWidth = pop ? 4 : 3; ctx.strokeStyle = pop ? '#2b3f9c' : (state === 'locked' ? '#3a4690' : 'rgba(255,255,255,.85)'); ctx.stroke();
    path(0.78); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.stroke();
  });
}

/* กรอบเหลี่ยมรอบฉาก (วาดเส้นขอบ ไม่ใช่กล่องมน) */
function frameBox(scene, x, y, w, h, tint) {
  const g = scene.add.graphics(); const col = hexToInt(tint);
  g.lineStyle(3, col, 1);
  g.strokePoints([{ x: x + 20, y }, { x: x + w, y }, { x: x + w, y: y + h - 20 }, { x: x + w - 20, y: y + h }, { x, y: y + h }, { x, y: y + 20 }], true);
  g.lineStyle(5, col, 1); g.beginPath(); g.moveTo(x, y + 60); g.lineTo(x, y + 20); g.lineTo(x + 20, y); g.lineTo(x + 70, y); g.strokePath();
  g.beginPath(); g.moveTo(x + w, y + h - 60); g.lineTo(x + w, y + h - 20); g.lineTo(x + w - 20, y + h); g.lineTo(x + w - 70, y + h); g.strokePath();
  return g;
}
const toast_ = (scene, msg) => KG.ui.toast(scene, msg);


// ข้อความแนะนำให้เปิดเต็มจอ แสดงตอนเริ่มเกม (ครั้งเดียวต่อการเปิดหน้า ถ้ายังไม่ได้อยู่ในโหมดเต็มจอ) next = ทำต่อเมื่อปิดหน้าต่างนี้
function promptFullscreen(scene, next) {
  const go = () => { if (next) next(); };
  if (KG.NO_FS_PROMPT) { KG.fsPromptDone = true; if (KG.isPopout()) KG.whenTapped(go); else go(); return; }   // เกมที่ปิดหน้าต่างชวนเต็มจอ (build-games.py 'fs_prompt': False ผู้ใช้ขอ 26 ต.ค. 2569) ปุ่มขยายในเกมยังกดเองได้
  if (KG.isPopout()) { KG.whenTapped(go); return; }   // แท็บที่เปิดจากกรอบ: ปุ่ม 'แตะเพื่อเล่น' ตอนเปิดหน้าทำหน้าที่เต็มจอไปแล้ว
  if (KG.fsPromptDone || KG.isFullscreen() || KG.prefs.data.noFsPrompt) { go(); return; }
  // ฝังอยู่ใน Google Sites (กรอบของ Google ไม่อนุญาตเต็มจอ): เล่นในหน้าเดิมเป็นค่าเริ่มต้น ไม่ชวนเปิดแท็บใหม่ (ผู้ใช้ขอ 24 ต.ค. 2569) ปุ่มขยายในเกมยังเปิดแท็บใหม่ได้เมื่อกดเอง
  if (KG.canPopOut()) { KG.fsPromptDone = true; go(); return; }
  KG.fsPromptDone = true;
  const pop = KG.canPopOut();   // ฝังอยู่ในเว็บ (เช่น Google Sites) ที่ไม่อนุญาตเต็มจอ: ให้เปิดเป็นแท็บใหม่แทน
  const firstBtn = pop
    ? { label: 'เปิดในแท็บใหม่', style: 'primary', icon: 'expand', pulse: true, onClick: () => KG.popOut(go) }
    : { label: 'เปิดเต็มจอ', style: 'primary', icon: 'expand', pulse: true, onClick: () => { KG.fullscreen(); go(); } };
  KG.ui.modal(scene, {
    title: 'เล่นให้สนุกที่สุด', w: 700, accent: KG.C.cyan, extraH: pop ? 150 : 110,
    body: pop ? 'หน้านี้ฝังอยู่ในเว็บไซต์ จึงขยายเต็มจอตรงนี้ไม่ได้ แนะนำให้เปิดเกมในแท็บใหม่ แล้วกดปุ่มเต็มจอ ภาพจะใหญ่ขึ้นและกดง่ายขึ้นมาก'
      : 'แนะนำให้เปิดแบบเต็มจอ ภาพจะใหญ่ขึ้นและกดง่ายขึ้นมาก บนมือถือควรหมุนจอเป็นแนวนอนด้วย',
    build: (box, g) => { box.add(KG.ui.icon(scene, 'expand', 0, g.top + (pop ? 62 : 52), 72, 0x4ef4d2)); },
    buttons: [
      firstBtn,
      { label: pop ? 'เล่นตรงนี้' : 'ข้ามไปก่อน', style: 'ghost', onClick: () => go() },
      { label: 'ไม่ต้องถามอีก', style: 'ghost', onClick: () => { KG.prefs.data.noFsPrompt = true; KG.prefs.save(); go(); } }
    ]
  });
}

// ถามชื่อผู้เล่นครั้งแรก (ถ้ายังไม่มีชื่อและยังไม่เคยถามในรอบนี้)
function askPlayerOnce(scene, after) {
  const done = () => { if (scene.playerChip && scene.playerChip.scene) scene.playerChip.refreshName(); if (after) after(); };
  if (KG.askedPlayer || KG.playerName()) { done(); return; }
  KG.askPlayer(done);
}
// ปุ่มชื่อผู้เล่นมุมซ้ายล่างของหน้าแรก แตะเพื่อใส่หรือแก้ชื่อ
function addPlayerChip(scene, x, y) {
  const label = () => { const n = KG.playerName(); return n ? 'ผู้เล่น: ' + n : 'ผู้เล่น: ไม่ระบุชื่อ (แตะเพื่อใส่ชื่อ)'; };
  const b = new KG.ui.Button(scene, x, y, 420, 46, { label: label(), icon: 'eye', style: 'ghost', size: 20, slant: 8, onClick: () => KG.askPlayer(() => b.setLabel(label())) });
  b.refreshName = () => b.setLabel(label()); scene.playerChip = b;
  return b;
}
// บรรทัดชื่อสำหรับหน้าสรุปผล (ว่างถ้าไม่ได้ใส่ชื่อ)
function playerLine() { const n = KG.playerName(); return n ? 'ผู้เล่น: ' + n : ''; }
function withPlayer(body) { const p = playerLine(); return p ? p + String.fromCharCode(10) + body : body; }

/* ภาพเคลื่อนไหวจากคลังภาพเกมเก่า: ฮีโร่ h0/h1 และมอนสเตอร์ m{N}
   ทุกเฟรมของตัวเดียวกันตัดกรอบเท่ากัน จุดยึดเท้าจึงอยู่ที่เดิม (origin y = oy) สลับเฟรมแล้วตัวละครไม่กระโดด
   ขนาดกำหนดเป็นความสูงลำตัว (หน่วยออกแบบ) ไม่ใช่ขนาดภาพ เพื่อให้ตัวละครทุกตัวสัดส่วนสม่ำเสมอ */
KG.art = {
  scaleFor(id, bodyH) { return bodyH / KG.ART[id].body; },
  // สร้างภาพตัวละครที่เท้าอยู่ที่ (x, y) ใช้เฟรม `frame` ของ id เช่น ('h0','idle') หรือ ('m2',0)
  make(scene, x, y, id, frame, bodyH) {
    const a = KG.ART[id], img = scene.add.image(x, y, id + '_' + ((a.alias && a.alias[frame]) || frame)).setOrigin(0.5, a.oy);
    img.artId = id; img.artScale = bodyH / a.body; img.setScale(img.artScale); return img;
  },
  frame(img, frame) { const al = KG.ART[img.artId].alias; img.setTexture(img.artId + '_' + ((al && al[frame]) || frame)); return img; },   // alias: ชื่อเฟรมที่ใช้ภาพเดียวกับเฟรมอื่น (ชุด 9 ช่อง a3 = a2)
  walkFrame(p) { return 'w' + (1 + Math.floor(p * 6) % 6); },   // p = 0..1 ครบหนึ่งรอบเท้าต่อหนึ่งช่อง
  monsterWalk(t) { return 1 + Math.floor(t * 8) % 4; }          // t = วินาที, เฟรมเดิน 1-4 ของมอนสเตอร์
};

/* มาสไรเดอร์ท่าประจำเกมบนหน้าแรก (ภาพสวย ไม่ถือดาบ ท่าตามเนื้อหาเกม ผู้ใช้ขอ 26 ต.ค. 2569)
   build-games.py ฝังเท็กซ์เจอร์ 'title_pose' จาก tools/games/title-poses/<ท่า>.webp ตามค่า 'title_pose' ของเกม
   เท้าอยู่ที่ (x, y) · ย่อให้พอดีกรอบ o.w × o.h · เลื่อนเข้าจากซ้าย หายใจเบา ๆ แตะแล้วกระโดดดีใจมีประกาย
   คืน null ถ้าเกมไม่มีภาพนี้ (ให้ฉากใช้ไรเดอร์แบบเดิมแทน) */
KG.hasTitlePose = scene => scene.textures.exists('title_pose');
KG.titlePose = function (scene, x, y, o) {
  o = o || {};
  if (!KG.hasTitlePose(scene)) return null;
  const d = o.depth || 0, img = scene.add.image(x, y, 'title_pose').setOrigin(0.5, 1).setDepth(d);
  const k = Math.min((o.h || 520) / img.height, (o.w || 420) / img.width); img.setScale(k);
  const sh = scene.add.ellipse(x, y - 2, img.displayWidth * 0.66, 28, 0x000000, o.shadow == null ? 0.2 : o.shadow).setDepth(d - 0.1);
  img.setAlpha(0).x = x - 200; sh.setAlpha(0);
  scene.tweens.add({ targets: img, x, alpha: 1, duration: 800, ease: 'Cubic.easeOut', delay: 150 });
  scene.tweens.add({ targets: sh, alpha: 1, duration: 500, delay: 600 });
  scene.tweens.add({ targets: img, scaleY: k * 1.016, scaleX: k * 0.993, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1000 });
  img.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
    if (img.hop) return; img.hop = true;
    KG.audio.play(o.sfx || 'star');
    KG.fx.burst(scene, x, y - img.displayHeight * 0.55, { colors: o.colors || [0xff3fa4, 0xffffff, 0xffd34f], n: 24, max: 360, depth: d + 40 });
    scene.tweens.add({ targets: img, y: y - 36, duration: 180, yoyo: true, ease: 'Quad.easeOut', onComplete: () => { img.y = y; img.hop = false; } });
    scene.tweens.add({ targets: sh, scaleX: 0.8, scaleY: 0.8, duration: 180, yoyo: true });
    if (o.onTap) o.onTap();
  });
  img.shadowEll = sh;
  // ข้อความบนป้ายที่ไรเดอร์ถือ (เช่น Hello! บนป้ายคำพูดของ Techno Talk) cx, cy, w = ตำแหน่ง/ความกว้างป้ายเป็นสัดส่วนของภาพ ตามภาพไปทุกเฟรม
  if (o.sign) {
    const g = o.sign, t = KG.txt(scene, x, y, g.text, { size: g.size || 40, color: g.color || '#1b2a6b', center: true, middle: true, depth: d + 1 });
    t.setScale(Math.min(1, g.w * img.displayWidth / t.width));
    const sync = () => { t.setPosition(img.x + (g.cx - 0.5) * img.displayWidth, img.y - img.displayHeight + g.cy * img.displayHeight); t.setAlpha(img.alpha); };
    sync(); scene.events.on('update', sync); scene.events.once('shutdown', () => scene.events.off('update', sync));
    img.sign = t;
  }
  return img;
};
