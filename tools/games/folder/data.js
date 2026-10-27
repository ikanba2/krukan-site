/* ===== ข้อมูลกลางของเกม Techno Folder: บันทึกดาวรายด่าน โลกที่เล่นล่าสุด ไอคอนของหน้าต่างโฟลเดอร์ ===== */
const { WORLDS, TITLES, MON_NAME, getLevel, makeLevel } = window.FD_LV;
const SAVE = KG.store('krukan_game_folder_v1', { world: 1, stars: {}, tutorDone: {}, practice: 0, unlockAll: false });
const skey = (w, l) => w + ':' + l;
const levelStars = (w, l) => SAVE.data.stars[skey(w, l)] || 0;
const levelOpen = (w, l) => SAVE.data.unlockAll || l === 1 || levelStars(w, l - 1) > 0;
const worldStars = w => { let n = 0; for (let l = 1; l <= 10; l++) n += levelStars(w, l); return n; };
const totalStars = () => WORLDS.reduce((n, W) => n + worldStars(W.id), 0);
const maxStars = () => WORLDS.length * 30;
const curWorld = () => WORLDS[(SAVE.data.world || 1) - 1];
// ชุดท่าของไรเดอร์ในชุดภาพ 9 ช่อง (ใช้สลับตามโลก)
KG.FORMS.s0 = { name: 'ท่าดาบ', color: 0xff3d8b, css: '#ff3d8b' };
KG.FORMS.s1 = { name: 'ท่าปืน', color: 0xff3d8b, css: '#ff3d8b' };
KG.FORMS.s2 = { name: 'ท่าหอก', color: 0xff3d8b, css: '#ff3d8b' };
KG.FORMS.s3 = { name: 'ท่ามีดคู่', color: 0xff3d8b, css: '#ff3d8b' };

/* ไอคอนเพิ่มสำหรับแถบคำสั่งของหน้าต่างโฟลเดอร์ (วาดสีขาวที่กริด 64x64 แล้วย้อมสีตอนใช้) */
(function () {
  const I = KG.ui.ICONS, poly = (c, p) => { c.beginPath(); p.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); };
  I.newfolder = c => { poly(c, [[4, 14], [24, 14], [30, 21], [60, 21], [60, 54], [4, 54]]); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(30, 28, 6, 20); c.fillRect(23, 35, 20, 6); };
  I.cut = c => { c.lineWidth = 6; c.beginPath(); c.moveTo(16, 8); c.lineTo(44, 44); c.moveTo(48, 8); c.lineTo(20, 44); c.stroke(); c.beginPath(); c.arc(16, 50, 8, 0, 7); c.arc(48, 50, 8, 0, 7); c.lineWidth = 5; c.stroke(); };
  I.copy = c => { c.lineWidth = 6; c.strokeRect(22, 6, 32, 38); c.fillRect(8, 20, 30, 38); c.globalCompositeOperation = 'destination-out'; c.fillRect(14, 28, 18, 4); c.fillRect(14, 38, 18, 4); };
  I.paste = c => { c.fillRect(8, 12, 40, 46); c.globalCompositeOperation = 'destination-out'; c.fillRect(14, 22, 28, 30); c.globalCompositeOperation = 'source-over'; c.fillRect(18, 6, 20, 12); c.fillRect(34, 30, 24, 28); c.globalCompositeOperation = 'destination-out'; c.fillRect(38, 36, 16, 4); c.fillRect(38, 46, 16, 4); };
  I.rename = c => { c.fillRect(6, 44, 40, 8); c.lineWidth = 8; c.beginPath(); c.moveTo(44, 8); c.lineTo(56, 20); c.lineTo(24, 40); c.lineTo(16, 36); c.lineTo(20, 28); c.closePath(); c.fill(); c.fillRect(6, 54, 52, 4); };
  I.restore = c => { c.lineWidth = 8; c.beginPath(); c.arc(34, 34, 20, Math.PI * 0.9, Math.PI * 2.1); c.stroke(); poly(c, [[2, 26], [22, 14], [24, 36]]); c.fill(); };
  I.multi = c => { c.lineWidth = 5; c.strokeRect(8, 8, 22, 22); c.strokeRect(8, 36, 22, 22); c.lineWidth = 8; c.beginPath(); c.moveTo(12, 19); c.lineTo(17, 25); c.lineTo(27, 12); c.stroke(); c.fillRect(38, 14, 20, 6); c.fillRect(38, 42, 20, 6); };
  I.drawer = c => { poly(c, [[4, 14], [24, 14], [30, 21], [60, 21], [60, 54], [4, 54]]); c.fill(); };
})();

/* ===== ไอคอนไฟล์และโฟลเดอร์ (ภาพเวกเตอร์วาดเอง หน้าตาคล้าย Windows) ===== */
const FILE_COL = { doc: ['#3b82f6', '#1d4ed8'], img: ['#22b45a', '#0f7a38'], mus: ['#a855f7', '#6d28d9'], vid: ['#f43f5e', '#be123c'] };
function folderTex(scene, size, kind) {
  return KG.tex(scene, 'fd-folder|' + kind + '|' + size, size, size, (c, w, h) => {
    const k = size / 64, T = ({ normal: ['#ffe27a', '#ffc72c', '#e0a100'], bin: ['#d6e4f5', '#b5c9e2', '#8da6c6'] })[kind] || ['#ffe27a', '#ffc72c', '#e0a100'];
    c.scale(k, k);
    c.fillStyle = T[2]; c.beginPath(); c.moveTo(4, 14); c.lineTo(24, 14); c.lineTo(30, 20); c.lineTo(58, 20); c.lineTo(60, 22); c.lineTo(60, 54); c.lineTo(4, 54); c.closePath(); c.fill();
    const g = c.createLinearGradient(0, 24, 0, 56); g.addColorStop(0, T[0]); g.addColorStop(1, T[1]); c.fillStyle = g; c.beginPath(); c.moveTo(4, 26); c.lineTo(60, 26); c.lineTo(58, 54); c.lineTo(6, 54); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(6, 27, 52, 3); c.strokeStyle = 'rgba(80,50,0,.55)'; c.lineWidth = 2; c.lineJoin = 'round'; c.strokeRect(4.5, 14.5, 55, 39);
  });
}
function fileTex(scene, type, size) {
  return KG.tex(scene, 'fd-file|' + type + '|' + size, size, size, (c, w, h) => {
    const k = size / 64, C = FILE_COL[type] || FILE_COL.doc; c.scale(k, k);
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(12, 4); c.lineTo(40, 4); c.lineTo(54, 18); c.lineTo(54, 60); c.lineTo(12, 60); c.closePath(); c.fill();
    c.strokeStyle = '#6b7a99'; c.lineWidth = 2.4; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = '#cfd8ea'; c.beginPath(); c.moveTo(40, 4); c.lineTo(40, 18); c.lineTo(54, 18); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = C[0];
    if (type === 'doc') { [26, 33, 40, 47].forEach((y, i) => c.fillRect(19, y, i === 3 ? 14 : 28, 3.4)); }
    else if (type === 'img') { c.fillRect(18, 26, 30, 24); c.fillStyle = '#c8f3d8'; c.fillRect(20, 28, 26, 20); c.fillStyle = '#ffd34f'; c.beginPath(); c.arc(28, 35, 4, 0, 7); c.fill(); c.fillStyle = C[1]; c.beginPath(); c.moveTo(20, 48); c.lineTo(31, 36); c.lineTo(38, 44); c.lineTo(42, 40); c.lineTo(46, 48); c.closePath(); c.fill(); }
    else if (type === 'mus') { c.beginPath(); c.ellipse(26, 47, 6, 4.6, -0.3, 0, 7); c.fill(); c.fillRect(30.5, 24, 3.2, 23); c.beginPath(); c.moveTo(33.7, 24); c.lineTo(45, 29); c.lineTo(45, 35); c.lineTo(33.7, 30); c.closePath(); c.fill(); }
    else { c.fillRect(18, 26, 30, 24); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(29, 31); c.lineTo(41, 38); c.lineTo(29, 45); c.closePath(); c.fill(); }
  });
}
