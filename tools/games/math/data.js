/* ===== ข้อมูลกลางของ Techno Math: บันทึกดาวรายระดับ ระดับที่แนะนำ ชื่อมอนสเตอร์ สีหมึก คีย์ลัด ===== */
const MW = MG.WORLDS, MT = MG.TOPICS;
const SAVE = KG.store('krukan_game_math_v1', { stars: {}, best: {}, seen: {}, world: 'num', topic: 'count', grade: 0 });
const skey = (t, L) => t + ':' + L;
const starsOf = (t, L) => SAVE.data.stars[skey(t, L)] || 0;
const topicStars = t => { let n = 0; for (let L = 1; L <= 5; L++) n += starsOf(t, L); return n; };
const worldTopics = w => MT.filter(t => t.world === w);
const worldStars = w => worldTopics(w).reduce((n, t) => n + topicStars(t.id), 0);
const totalStars = () => MT.reduce((n, t) => n + topicStars(t.id), 0);
const maxStars = () => MT.length * 15;
const worldOf = id => MW.find(w => w.id === id) || MW[0];
// ระดับที่ควรเล่นต่อ: ระดับแรกที่ยังไม่มีดาว ถ้ามีครบแล้วเอาระดับแรกที่ยังไม่ได้ 3 ดาว
const nextLevel = t => { for (let L = 1; L <= 5; L++) if (!starsOf(t, L)) return L; for (let L = 1; L <= 5; L++) if (starsOf(t, L) < 3) return L; return 5; };
const hexInt = s => parseInt(String(s).replace('#', ''), 16);
// ชื่อมอนสเตอร์ (ชุดภาพ 9 ช่อง b12–b32) ตั้งให้เข้ากับเรื่องคณิต
const MON_NAME = { 12: 'ราชสีห์ตัวทด', 13: 'แกะสายฟ้าบวกเลข', 14: 'เต่าหลักหน่วย', 15: 'ฟีนิกซ์เลขล้าน', 17: 'แมงกะพรุนทศนิยม', 20: 'เห็ดเศษเกิน', 23: 'กระต่ายนับเลข', 24: 'นกยูงเศษส่วน', 25: 'หอยทากหารยาว', 26: 'หมูป่าจำนวนคละ', 28: 'จามรีตาชั่ง', 29: 'จระเข้ตัวยืม', 30: 'กระเบนเครื่องหมาย', 31: 'กวางจันทร์ลบเลข', 32: 'มังกรจุดทศนิยม' };
KG.FORMS.r0 = { name: 'ไรเดอร์ดาบ', color: 0xff3d8b, css: '#ff3d8b' };
KG.FORMS.r1 = { name: 'ไรเดอร์ปืน', color: 0x2aa8ff, css: '#2aa8ff' };
KG.FORMS.r2 = { name: 'ไรเดอร์หอก', color: 0x5ef08a, css: '#5ef08a' };
KG.FORMS.r3 = { name: 'ไรเดอร์มีดคู่', color: 0xffb800, css: '#ffb800' };
// สีบนกระดาษ: หมึกนักเรียน (น้ำเงิน) · ครูสาธิต (เขียว) · ตัวทด/การยืม (แดง) · ตัวช่วยที่เกมเขียนให้ (เทา)
const INK = { pen: '#1f3d99', demo: '#0a8a5c', red: '#d63a2f', aid: '#8a97b8', text: '#27324f', head: '#1b2a6b' };
const MFONT = "Mali, Kanit, Tahoma, sans-serif";
const PLAY_KEYS = [
  ['0 – 9', 'พิมพ์ตัวเลข (ใช้ได้แม้คีย์บอร์ดเป็นภาษาไทย)'], ['.', 'จุดทศนิยม'], ['Backspace', 'ลบตัวเลข'], ['Enter', 'ตรวจคำตอบ / ไปข้อถัดไป'],
  ['Tab  ← →', 'ย้ายช่องที่จะเขียน'], ['H', 'คำใบ้ (กดซ้ำได้วิธีคิด)'], ['S', 'ให้ครูไรเดอร์สาธิตวิธีทำ'], ['1 – 4', 'เลือกคำตอบในข้อเลือกตอบ'],
  ['<  =  >', 'เลือกเครื่องหมาย (ปุ่ม , = . ก็ได้)'], ['Space', 'ระบายชิ้นส่วน (ข้อระบายสี)'], ['P / Esc', 'พักเกม'], ['M  B  F', 'เสียง · เพลง · เต็มจอ']
];
const MAP_KEYS = [['← →', 'เปลี่ยนโลก'], ['↑ ↓', 'เลือกหัวข้อ'], ['1 – 5', 'เล่นระดับนั้นทันที'], ['Enter', 'เล่นระดับที่แนะนำ'], ['G', 'เลือกชั้น ป.1–ป.4'], ['K', 'ดูคีย์ลัดทั้งหมด'], ['Esc', 'กลับหน้าแรก']];
// หน้าต่างคีย์ลัดทั้งหมด: ซ้าย = หน้าเลือกภารกิจ · ขวา = ขณะเล่น
function showKeys(scene) {
  const cols = [['หน้าเลือกภารกิจ', MAP_KEYS], ['ขณะเล่น', PLAY_KEYS]], rh = 36;
  return KG.ui.modal(scene, { title: 'คีย์ลัด', w: 1060, accent: KG.C.cyan, extraH: PLAY_KEYS.length * rh + 44, buttons: [{ label: 'เข้าใจแล้ว', style: 'primary', icon: 'check' }],
    build: (box, g) => {
      cols.forEach(([head, rows], col) => {
        const x0 = g.left + 36 + col * 430;
        box.add(KG.txt(scene, x0, g.top - 6, head, { size: 20, color: '#4ef4d2' }));
        rows.forEach((r, i) => {
          const y = g.top + 30 + i * rh, kw = Math.max(64, KG.measure(r[0], '600 18px Kanit') + 24), gr = scene.add.graphics();
          gr.fillStyle(0x0b1240, 1); gr.fillRoundedRect(x0, y, kw, 30, 7); gr.lineStyle(2, 0x4ef4d2, 0.9); gr.strokeRoundedRect(x0, y, kw, 30, 7); gr.fillStyle(0x4ef4d2, 0.25); gr.fillRect(x0 + 4, y + 25, kw - 8, 3);
          box.add(gr); box.add(KG.txt(scene, x0 + kw / 2, y + 15, r[0], { size: 17, center: true, middle: true, color: '#e9fffb' }));
          box.add(KG.txt(scene, x0 + kw + 12, y + 15, r[1], { size: 17, weight: 400, oy: 0.5, color: KG.SKIN.body, width: (col ? 560 : 400) - kw - 12 }));
        });
      });
    } });
}
// ป้ายชั้นเรียนสั้น ๆ
const gradeTag = g => 'ป.' + g;
/* ---------- คิดเลขเร็ว โหมดกำหนดเอง: ค่าที่เลือก { ops: ['add','sub',...], grade: 1–4, n: จำนวนข้อ, secs: เวลาจำกัด (0 = ไม่จับเวลา) } ---------- */
const SPEED_N = [10, 20, 30, 50], SPEED_T = [0, 60, 120, 180, 300];
const speedCfg = () => Object.assign({ ops: ['add', 'sub'], grade: 1, n: 20, secs: 0 }, SAVE.data.speedCfg || {});
const speedKey = c => MG.SPEED_OPS.filter(o => c.ops.indexOf(o.id) >= 0).map(o => o.id).join('+') + '|' + c.grade + '|' + c.n + '|' + c.secs;
const speedBest = c => (SAVE.data.speedBest || {})[speedKey(c)] || null;
const timeName = s => (s ? (s / 60) + ' นาที' : 'ไม่จับเวลา');
const speedLabel = c => MG.SPEED_OPS.filter(o => c.ops.indexOf(o.id) >= 0).map(o => o.th).join(' ') + ' · ' + gradeTag(c.grade) + ' · ' + c.n + ' ข้อ · ' + (c.secs ? 'จับเวลา ' + timeName(c.secs) : 'ไม่จับเวลา');
// เวลาแบบ 1:05 และแบบอ่าน 1 นาที 5 วินาที
const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const mmssTh = s => { s = Math.max(0, Math.round(s)); return (s >= 60 ? Math.floor(s / 60) + ' นาที ' : '') + (s % 60) + ' วินาที'; };
