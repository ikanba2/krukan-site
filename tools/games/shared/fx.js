/* ===== เอฟเฟกต์: ประกาย ระเบิด วงแหวน ตัวเลขเด้ง กระดาษสี ฝุ่นลอย ===== */
(function () {
  'use strict';
  const FX = KG.fx = {};

  FX.init = function (scene) {
    const mk = (key, w, h, draw) => { if (!scene.textures.exists(key)) { const t = scene.textures.createCanvas(key, w, h); draw(t.getContext(), w, h); t.refresh(); } };
    mk('fx_spark', 32, 32, (c, w) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
    mk('fx_dot', 16, 16, c => { c.fillStyle = '#fff'; c.beginPath(); c.arc(8, 8, 7, 0, 7); c.fill(); });
    mk('fx_square', 16, 16, c => { c.fillStyle = '#fff'; c.fillRect(2, 2, 12, 12); });
    mk('fx_shard', 24, 24, c => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(12, 0); c.lineTo(24, 20); c.lineTo(4, 24); c.closePath(); c.fill(); });
    mk('fx_star', 32, 32, c => { c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 15; c.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); } c.closePath(); c.fill(); });
    mk('fx_ring', 128, 128, c => { c.strokeStyle = '#fff'; c.lineWidth = 7; c.beginPath(); c.arc(64, 64, 58, 0, 7); c.stroke(); });
    mk('fx_streak', 8, 64, c => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = g; c.fillRect(2, 0, 4, 64); });
    mk('fx_glow', 256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.4, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  };

  // ระเบิดประกาย
  FX.burst = function (scene, x, y, o) {
    o = o || {};
    const em = scene.add.particles(x, y, o.tex || 'fx_spark', {
      speed: { min: o.min || 60, max: o.max || 260 }, angle: { min: o.a0 == null ? 0 : o.a0, max: o.a1 == null ? 360 : o.a1 },
      scale: { start: o.s0 || 0.8, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: { min: (o.life || 650) * 0.5, max: o.life || 650 },
      gravityY: o.g || 0, blendMode: o.add === false || !KG.SKIN.add ? 'NORMAL' : 'ADD', tint: o.colors || [0xffffff], rotate: o.rot ? { min: 0, max: 360 } : 0, emitting: false
    });
    em.setDepth(o.depth == null ? 60 : o.depth);
    em.explode(o.n || 14);
    scene.time.delayedCall((o.life || 650) + 150, () => em.destroy());
    return em;
  };
  // วงคลื่น
  FX.ring = function (scene, x, y, color, o) {
    o = o || {};
    const r = scene.add.image(x, y, 'fx_ring').setTint(color == null ? 0xffffff : color).setBlendMode(KG.SKIN.add ? 'ADD' : 'NORMAL').setScale(0.12).setAlpha(o.alpha || 0.9).setDepth(o.depth == null ? 70 : o.depth);
    scene.tweens.add({ targets: r, scaleX: o.size || 1, scaleY: o.size || 1, alpha: 0, duration: (o.w || 0.5) * 1000, ease: 'Cubic.easeOut', onComplete: () => r.destroy() });
    return r;
  };
  // แสงฟุ้ง
  FX.glow = function (scene, x, y, color, size, ms) {
    const g = scene.add.image(x, y, 'fx_glow').setTint(color).setBlendMode(KG.SKIN.add ? 'ADD' : 'NORMAL').setScale(0.2).setAlpha(KG.SKIN.add ? 0.9 : 0.55).setDepth(55);
    scene.tweens.add({ targets: g, scaleX: size / 256, scaleY: size / 256, alpha: 0, duration: ms || 400, ease: 'Sine.easeOut', onComplete: () => g.destroy() });
    return g;
  };
  // ตัวเลข/ข้อความลอยขึ้น
  FX.pop = function (scene, x, y, str, o) {
    o = o || {};
    const t = KG.txt(scene, x, y, str, { size: o.size || 34, color: o.color || KG.SKIN.hi, center: true, middle: true, stroke: true }).setDepth(o.depth || 80).setScale(0.4);
    scene.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 180, ease: 'Back.easeOut' });
    scene.tweens.add({ targets: t, y: y - (o.rise || 70), alpha: 0, delay: 300, duration: o.ms || 700, ease: 'Sine.easeIn', onComplete: () => t.destroy() });
    return t;
  };
  FX.shake = function (scene, ms, amt) { scene.cameras.main.shake(ms || 200, amt || 0.006); };
  FX.flash = function (scene, color, ms) { const c = Phaser.Display.Color.IntegerToRGB(color == null ? 0xffffff : color); scene.cameras.main.flash(ms || 160, c.r, c.g, c.b); };
  // กระดาษสีตกลงมา
  FX.confetti = function (scene, o) {
    o = o || {};
    const em = scene.add.particles(KG.GW / 2, -30, 'fx_square', {
      x: { min: -KG.GW / 2, max: KG.GW / 2 }, speedY: { min: 120, max: 360 }, speedX: { min: -80, max: 80 }, scale: { min: 0.5, max: 1.1 }, rotate: { min: 0, max: 360 },
      lifespan: 3200, gravityY: 160, tint: [0xff3d8b, 0xffd34f, 0x4ef4d2, 0xa78bfa, 0xffffff], quantity: 3, frequency: 28, emitting: true
    });
    em.setDepth(o.depth || 3500);
    scene.time.delayedCall(o.ms || 1400, () => { em.stop(); scene.time.delayedCall(3400, () => em.destroy()); });
    return em;
  };
  // ฝุ่นแสงลอยเป็นบรรยากาศ
  FX.ambient = function (scene, o) {
    o = o || {};
    const em = scene.add.particles(0, 0, 'fx_spark', {
      x: { min: 0, max: KG.GW }, y: { min: 0, max: KG.GH }, speedX: { min: -8, max: 8 }, speedY: { min: -26, max: -6 }, scale: { start: o.s || 0.28, end: 0 }, alpha: { start: 0, end: o.alpha || 0.5, ease: 'Sine.easeInOut' },
      lifespan: { min: 3000, max: 6500 }, frequency: o.freq || 160, quantity: 1, tint: o.colors || [0x4ef4d2, 0xffffff, 0xff3d8b], blendMode: KG.SKIN.add ? 'ADD' : 'NORMAL'
    });
    em.setDepth(o.depth == null ? 1 : o.depth);
    return em;
  };
  // ลากเส้นแสงตามวัตถุ
  FX.trail = function (scene, follow, color, o) {
    o = o || {};
    const em = scene.add.particles(0, 0, 'fx_spark', { follow, scale: { start: o.s || 0.5, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: o.life || 300, frequency: o.freq || 26, tint: color, blendMode: KG.SKIN.add ? 'ADD' : 'NORMAL' });
    em.setDepth(o.depth || 40);
    return em;
  };
})();
