/* ===== ข้อมูลกลางของเกม Techno Parts: บันทึกดาวรายด่าน โลกที่เล่นล่าสุด และตัวช่วยวาดชิ้นส่วนรูปหกเหลี่ยม/ชิป/การ์ด ===== */
const { WORLDS, TITLES, MON_NAME, getLevel, makeLevel } = window.PT_LV;
const SAVE = KG.store('krukan_game_parts_v1', { world: 1, stars: {}, tutorDone: {}, practice: 0, unlockAll: false });
const skey = (w, l) => w + ':' + l;
const levelStars = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const levelOpen = (w, l) => SAVE.data.unlockAll || l === 1 || levelStars(w, l - 1) > 0;
const worldStars = w => { let n = 0; for (let l = 1; l <= 10; l++) n += levelStars(w, l); return n; };
const totalStars = () => WORLDS.reduce((n, W) => n + worldStars(W.id), 0);
const maxStars = () => WORLDS.length * 30;
const curWorld = () => WORLDS[(SAVE.data.world || 1) - 1];
// ชุดท่าของไรเดอร์ในชุดภาพ 9 ช่อง (ใช้สลับตามโลก)
KG.FORMS.s0 = { name: 'ท่าดาบ', color: 0x16c7a8, css: '#16c7a8' };
KG.FORMS.s1 = { name: 'ท่าปืน', color: 0x16c7a8, css: '#16c7a8' };
KG.FORMS.s2 = { name: 'ท่าหอก', color: 0x16c7a8, css: '#16c7a8' };
KG.FORMS.s3 = { name: 'ท่ามีดคู่', color: 0x16c7a8, css: '#16c7a8' };

const INK = '#1b2a6b', TEAL = '#16c7a8';
const GROUP_ICON = { in: 'keyboard', out: 'monitor', store: 'hdd', cpu: 'cpu', hw: 'mouse', sw: 'sw-doc' };

/* ---------- ชิ้นส่วนรูปหกเหลี่ยม (ในถาด) ---------- */
// สถานะ: normal | hover | sel | hint
function hexTile(scene, w, h, state) {
  return KG.tex(scene, ['pt-hex', w, h, state].join('|'), w + 12, h + 16, c => {
    const x = 6, y = 4, q = w * 0.22, pts = [[x + q, y], [x + w - q, y], [x + w, y + h / 2], [x + w - q, y + h], [x + q, y + h], [x, y + h / 2]];
    const path = dy => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1] + dy) : c.moveTo(p[0], p[1] + dy)); c.closePath(); c.lineJoin = 'round'; };
    path(6); c.fillStyle = 'rgba(24,44,120,.30)'; c.fill();
    path(0); c.fillStyle = KG.ui.lin(c, 0, y, 0, y + h, state === 'sel' ? [[0, '#fff7c9'], [1, '#ffe27a']] : state === 'hint' ? [[0, '#ffe9d2'], [1, '#ffb87a']] : [[0, '#ffffff'], [1, '#d9ecff']]); c.fill();
    c.save(); path(0); c.clip(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x, y + 2, w, 4); c.restore();
    path(0); c.lineWidth = state === 'normal' ? 3.5 : 5; c.strokeStyle = state === 'sel' ? '#ff9a1a' : state === 'hint' ? '#ff6a1a' : state === 'hover' ? '#16c7a8' : '#2b3f9c'; c.stroke();
  });
}
// ชิปแนวนอน (ชิ้นที่วางลงถังหรือตะกร้าแล้ว): ไอคอนซ้าย ชื่อขวา
function chipTex(scene, w, h, tint) {
  return KG.tex(scene, ['pt-chip', w, h, tint].join('|'), w + 10, h + 12, c => {
    KG.ui.rrect(c, 5, 8, w, h, h / 2); c.fillStyle = 'rgba(24,44,120,.28)'; c.fill();
    KG.ui.rrect(c, 5, 4, w, h, h / 2); c.fillStyle = KG.ui.lin(c, 0, 4, 0, 4 + h, [[0, '#ffffff'], [1, tint || '#dff0ff']]); c.fill();
    KG.ui.rrect(c, 5, 4, w, h, h / 2); c.lineWidth = 3; c.strokeStyle = '#2b3f9c'; c.stroke();
  });
}
// การ์ดขั้นตอน (ด่านเรียงลำดับ): กระดาษมีรอยปรุซ้าย
function cardTex(scene, w, h, state) {
  return KG.tex(scene, ['pt-card', w, h, state].join('|'), w + 12, h + 14, c => {
    KG.ui.rrect(c, 6, 10, w, h, 14); c.fillStyle = 'rgba(24,44,120,.28)'; c.fill();
    KG.ui.rrect(c, 6, 4, w, h, 14); c.fillStyle = KG.ui.lin(c, 0, 4, 0, 4 + h, state === 'sel' ? [[0, '#fff7c9'], [1, '#ffe27a']] : state === 'hint' ? [[0, '#ffe9d2'], [1, '#ffb87a']] : [[0, '#ffffff'], [1, '#e4f1ff']]); c.fill();
    c.save(); KG.ui.rrect(c, 6, 4, w, h, 14); c.clip(); c.fillStyle = TEAL; c.fillRect(6, 4, 10, h); c.restore();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(11, 4 + h * (i + 0.5) / 4, 2.4, 0, 7); c.fillStyle = '#ffffff'; c.fill(); }
    KG.ui.rrect(c, 6, 4, w, h, 14); c.lineWidth = state === 'normal' ? 3 : 4.5; c.strokeStyle = state === 'sel' ? '#ff9a1a' : state === 'hint' ? '#ff6a1a' : '#2b3f9c'; c.stroke();
  });
}
// ตั๋วใบสั่งงาน: ขอบซ้ายขวามีรอยบากครึ่งวงกลมที่เส้นแบ่งหัวกับตัว และเส้นปรุ
function ticketTex(scene, w, h, headH, color) {
  return KG.tex(scene, ['pt-ticket', w, h, headH, color].join('|'), w + 24, h + 28, c => {
    const m = 12, r = 12, path = (dx, dy) => {
      c.beginPath(); c.moveTo(m + 20 + dx, m + dy); c.lineTo(m + w - 20 + dx, m + dy); c.arcTo(m + w + dx, m + dy, m + w + dx, m + 20 + dy, 20); c.lineTo(m + w + dx, m + headH - r + dy); c.arc(m + w + dx, m + headH + dy, r, -Math.PI / 2, Math.PI / 2, true);
      c.lineTo(m + w + dx, m + h - 20 + dy); c.arcTo(m + w + dx, m + h + dy, m + w - 20 + dx, m + h + dy, 20); c.lineTo(m + 20 + dx, m + h + dy); c.arcTo(m + dx, m + h + dy, m + dx, m + h - 20 + dy, 20); c.lineTo(m + dx, m + headH + r + dy); c.arc(m + dx, m + headH + dy, r, Math.PI / 2, -Math.PI / 2, true);
      c.lineTo(m + dx, m + 20 + dy); c.arcTo(m + dx, m + dy, m + 20 + dx, m + dy, 20); c.closePath();
    };
    path(0, 8); c.fillStyle = 'rgba(24,44,120,.30)'; c.fill();
    path(0, 0); c.fillStyle = KG.ui.lin(c, 0, m, 0, m + h, [[0, '#fffdf2'], [1, '#fff3d0']]); c.fill();
    c.save(); path(0, 0); c.clip(); c.fillStyle = color; c.fillRect(m, m, w, headH); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(m, m, w, 5); c.restore();
    c.setLineDash([7, 6]); c.beginPath(); c.moveTo(m + r + 4, m + headH); c.lineTo(m + w - r - 4, m + headH); c.lineWidth = 2.4; c.strokeStyle = 'rgba(31,45,92,.55)'; c.stroke(); c.setLineDash([]);
    path(0, 0); c.lineWidth = 3.5; c.strokeStyle = '#2b3f9c'; c.stroke();
  });
}
// ถังเก็บของ (ด่านจัดกลุ่ม): หัวสีมนเต็มความกว้าง ตัวถังขาว
function binTex(scene, w, h, color, state) {
  return KG.tex(scene, ['pt-bin', w, h, color, state].join('|'), w + 20, h + 22, c => {
    const m = 10; KG.ui.rrect(c, m, m + 8, w, h, 26); c.fillStyle = 'rgba(24,44,120,.30)'; c.fill();
    KG.ui.rrect(c, m, m, w, h, 26); c.fillStyle = KG.ui.lin(c, 0, m, 0, m + h, state === 'hl' ? [[0, '#e9fff7'], [1, '#bff3e3']] : [[0, '#ffffff'], [1, '#e1f0ff']]); c.fill();
    c.save(); KG.ui.rrect(c, m, m, w, h, 26); c.clip(); c.fillStyle = color; c.fillRect(m, m, w, 70); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(m, m, w, 6); c.restore();
    KG.ui.rrect(c, m, m, w, h, 26); c.lineWidth = state === 'hl' ? 6 : 3.5; c.strokeStyle = state === 'hl' ? '#16c7a8' : '#2b3f9c'; c.stroke();
  });
}
// ซ็อกเก็ตหลังเครื่อง (รูปร่างต่างกันตามชนิดช่อง): ใช้ทั้งในด่านเสียบสายและด่านซ่อม
function socketTex(scene, kind, w, h, state) {
  const col = (E_PORTS[kind] || {}).col || '#4a5a8c';
  return KG.tex(scene, ['pt-sock', kind, w, h, state].join('|'), w + 12, h + 12, c => {
    const x = 6, y = 6, k = 'rgba(0,0,0,.28)';
    c.lineJoin = 'round';
    if (kind === 'usb') { KG.ui.rrect(c, x, y, w, h, 6); c.fillStyle = '#cfd6e6'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1f2d5c'; c.stroke(); KG.ui.rrect(c, x + 7, y + 7, w - 14, h - 14, 3); c.fillStyle = '#10163a'; c.fill(); c.fillStyle = '#4a5a8c'; c.fillRect(x + 11, y + h / 2 - 3, w - 22, 6); }
    else if (kind === 'hdmi') { c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h * 0.55); c.lineTo(x + w - 10, y + h); c.lineTo(x + 10, y + h); c.lineTo(x, y + h * 0.55); c.closePath(); c.fillStyle = '#cfd6e6'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1f2d5c'; c.stroke();
      c.beginPath(); c.moveTo(x + 7, y + 7); c.lineTo(x + w - 7, y + 7); c.lineTo(x + w - 7, y + h * 0.5); c.lineTo(x + w - 14, y + h - 7); c.lineTo(x + 14, y + h - 7); c.lineTo(x + 7, y + h * 0.5); c.closePath(); c.fillStyle = '#10163a'; c.fill(); }
    else if (kind === 'audio' || kind === 'mic') { const r = Math.min(w, h) / 2; c.beginPath(); c.arc(x + w / 2, y + h / 2, r, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1f2d5c'; c.stroke(); c.beginPath(); c.arc(x + w / 2, y + h / 2, r * 0.56, 0, 7); c.fillStyle = '#10163a'; c.fill(); c.beginPath(); c.arc(x + w / 2, y + h / 2, r * 0.2, 0, 7); c.fillStyle = '#4a5a8c'; c.fill(); }
    else if (kind === 'lan') { KG.ui.rrect(c, x, y, w, h, 6); c.fillStyle = '#cfd6e6'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1f2d5c'; c.stroke(); c.beginPath(); c.moveTo(x + 8, y + 8); c.lineTo(x + w - 8, y + 8); c.lineTo(x + w - 8, y + h - 8); c.lineTo(x + w / 2 + 8, y + h - 8); c.lineTo(x + w / 2 + 8, y + h - 3); c.lineTo(x + w / 2 - 8, y + h - 3); c.lineTo(x + w / 2 - 8, y + h - 8); c.lineTo(x + 8, y + h - 8); c.closePath(); c.fillStyle = '#10163a'; c.fill(); for (let i = 0; i < 6; i++) { c.fillStyle = '#ffd34f'; c.fillRect(x + 12 + i * ((w - 30) / 6), y + 10, 3, 8); } }
    else { KG.ui.rrect(c, x, y, w, h, 12); c.fillStyle = '#cfd6e6'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1f2d5c'; c.stroke(); KG.ui.rrect(c, x + 7, y + 7, w - 14, h - 14, 8); c.fillStyle = '#10163a'; c.fill(); c.fillStyle = '#e3e8f4'; c.fillRect(x + w * 0.3, y + h * 0.3, 5, h * 0.4); c.fillRect(x + w * 0.62, y + h * 0.3, 5, h * 0.4); }
    if (state === 'hl') { c.lineWidth = 5; c.strokeStyle = '#16c7a8'; c.strokeRect(x - 3, y - 3, w + 6, h + 6); }
  });
}
const E_PORTS = window.PT.PORTS;
