/* ===== เมืองสีรุ้ง: ภาพและโจทย์พื้นฐาน =====
   V = ข้อมูลภาพหนึ่งชิ้น: { t: 'shape', shape, color } · { t: 'star', c } · { t: 'robot', c } · { t: 'battery', c } · { t: 'pic', item } · { t: 'num', n, color } · { t: 'dots', n, color }
                          · { t: 'seq', r, i } · { t: 'day', id } · { t: 'group', item, n } · { t: 'q' } (เครื่องหมายคำถาม)
   RB.vis(scene, V, size) สร้างภาพ (Image หรือ Container) ขนาดประมาณ size · RB.same(a, b) เทียบว่าเหมือนกันไหม */
const RB = (function () {
  const K = KG.kit, INK = '#2d2a5e';
  const COLS4 = ['red', 'blue', 'yellow', 'green'], COLS7 = ['red', 'blue', 'yellow', 'green', 'pink', 'orange', 'purple'];
  const NUMTH = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ'];
  const colorIdx = c => Math.max(0, COLS4.indexOf(c));
  const card = (scene, size, fill) => K.rrTex ? null : null;
  // กรอบการ์ดขาวสำหรับภาพ
  function frameTex(scene, size, tint) {
    return KG.tex(scene, 'rbframe|' + size + '|' + (tint || ''), size + 18, size + 22, c => {
      KG.ui.rrect(c, 9, 15, size, size, 18); c.fillStyle = 'rgba(45,42,94,.25)'; c.fill(); KG.ui.rrect(c, 9, 9, size, size, 18); c.fillStyle = tint || '#ffffff'; c.fill(); c.lineWidth = 4.5; c.strokeStyle = INK; c.stroke();
      c.save(); KG.ui.rrect(c, 9, 9, size, size, 18); c.clip(); c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(9, 9, size, size * 0.14); c.restore();
    });
  }
  function numTex(scene, n, size, color) {
    const hex = K.COL[color] || color || '#ff7ab8';
    return KG.tex(scene, ['rbnum', n, size, hex].join('|'), size + 18, size + 22, c => {
      KG.ui.rrect(c, 9, 15, size, size, 20); c.fillStyle = 'rgba(45,42,94,.25)'; c.fill(); KG.ui.rrect(c, 9, 9, size, size, 20); c.fillStyle = KG.ui.lin(c, 0, 9, 0, 9 + size, [[0, K.shade(hex, 1.2)], [1, K.shade(hex, 0.86)]]); c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
      c.save(); KG.ui.rrect(c, 9, 9, size, size, 20); c.clip(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(9, 9, size, size * 0.16); c.restore();
      c.font = '600 ' + Math.round(size * (n >= 10 ? 0.52 : 0.68)) + 'px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = Math.max(6, size * 0.09); c.strokeStyle = INK; c.lineJoin = 'round'; c.strokeText(String(n), 9 + size / 2, 9 + size / 2 + size * 0.04); c.fillStyle = '#ffffff'; c.fillText(String(n), 9 + size / 2, 9 + size / 2 + size * 0.04);
    });
  }
  // จุดแบบลูกเต๋า/ชุดจุดเรียงแถว (1–10)
  function dotsTex(scene, n, size, color) {
    const hex = K.COL[color] || color || '#3d8bff';
    return KG.tex(scene, ['rbdots', n, size, hex].join('|'), size + 18, size + 22, c => {
      KG.ui.rrect(c, 9, 15, size, size, 20); c.fillStyle = 'rgba(45,42,94,.25)'; c.fill(); KG.ui.rrect(c, 9, 9, size, size, 20); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
      const cols = n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4, rows = Math.ceil(n / cols), gx = size / (cols + 0.4), gy = size / (rows + 0.5), r = Math.min(gx, gy) * 0.36;
      for (let i = 0; i < n; i++) { const col = i % cols, row = Math.floor(i / cols), x = 9 + size / 2 + (col - (cols - 1) / 2) * gx, y = 9 + size / 2 + (row - (rows - 1) / 2) * gy; c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = KG.ui.lin(c, 0, y - r, 0, y + r, [[0, K.shade(hex, 1.2)], [1, K.shade(hex, 0.85)]]); c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); }
    });
  }
  function qTex(scene, size) {
    return KG.tex(scene, 'rbq|' + size, size + 18, size + 22, c => {
      KG.ui.rrect(c, 9, 9, size, size, 20); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); c.setLineDash([12, 9]); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.setLineDash([]);
      c.font = '600 ' + Math.round(size * 0.7) + 'px Kanit'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ff5a8a'; c.lineWidth = 7; c.strokeStyle = INK; c.strokeText('?', 9 + size / 2, 9 + size / 2 + 4); c.fillText('?', 9 + size / 2, 9 + size / 2 + 4);
    });
  }
  function vis(scene, v, size) {
    let o;
    switch (v.t) {
      case 'shape': o = scene.add.image(0, 0, K.shapeTex(scene, v.shape, v.color, Math.round(size))); o.setDisplaySize(size + 20, size + 20); break;
      case 'star': o = scene.add.image(0, 0, 'star' + (v.c != null ? v.c : colorIdx(v.color))); o.setScale(size / o.height); break;
      case 'robot': o = scene.add.image(0, 0, 'robot' + v.c); o.setScale(size / o.height); break;
      case 'battery': o = scene.add.image(0, 0, 'battery' + v.c); o.setScale(size / o.height); break;
      case 'pic': { o = scene.add.container(0, 0); o.add(scene.add.image(0, 0, frameTex(scene, Math.round(size), v.tint)).setDisplaySize(size + 18, size + 22)); o.add(K.itemImage(scene, v.item, 0, -2, size * 0.78)); break; }
      case 'bare': o = K.itemImage(scene, v.item, 0, 0, size); break;
      case 'num': o = scene.add.image(0, 0, numTex(scene, v.n, Math.round(size), v.color)).setDisplaySize(size + 18, size + 22); break;
      case 'dots': o = scene.add.image(0, 0, dotsTex(scene, v.n, Math.round(size), v.color)).setDisplaySize(size + 18, size + 22); break;
      case 'q': o = scene.add.image(0, 0, qTex(scene, Math.round(size))).setDisplaySize(size + 18, size + 22); break;
      case 'seq': { o = scene.add.container(0, 0); o.add(scene.add.image(0, 0, frameTex(scene, Math.round(size))).setDisplaySize(size + 18, size + 22)); const im = scene.add.image(0, -2, 'seq' + v.r + '_' + v.i); im.setScale((size * 0.86) / im.height); o.add(im); break; }
      case 'day': { o = scene.add.container(0, 0); o.add(scene.add.image(0, 0, frameTex(scene, Math.round(size))).setDisplaySize(size + 18, size + 22)); o.add(scene.add.image(0, -2, picTex(scene, DAY_(v.id, v.who || 'tom'), Math.round(size * 1.1), Math.round(size * 1.1))).setDisplaySize(size * 0.88, size * 0.88)); break; }
      case 'group': {   // กลุ่มของ n ชิ้น เรียงเป็นแถว (ใช้ในโจทย์นับ)
        o = scene.add.container(0, 0); const n = v.n, per = n <= 5 ? n : Math.ceil(n / 2), rows = n <= 5 ? 1 : 2, sz = v.sz || Math.min(size / Math.max(per, 2.2) * 1.15, size * 0.5);
        for (let i = 0; i < n; i++) { const col = i % per, row = Math.floor(i / per), x = (col - (per - 1) / 2) * sz * 1.05, y = (row - (rows - 1) / 2) * sz * 1.05; const g = v.item ? K.itemImage(scene, v.item, x, y, sz) : scene.add.image(x, y, K.shapeTex(scene, v.shape || 'circle', v.color || 'red', Math.round(sz))).setDisplaySize(sz + 14, sz + 14); o.add(g); }
        break;
      }
      default: o = scene.add.image(0, 0, K.shapeTex(scene, 'circle', 'red', size));
    }
    o.vw = size; o.vh = size; return o;
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  return { COLS4, COLS7, NUMTH, vis, same, colorIdx, frameTex, numTex, dotsTex };
})();
