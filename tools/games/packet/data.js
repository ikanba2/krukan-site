/* ===== ข้อมูลกลางของเกม Packet Express: บันทึกคะแนน ดาว และโหมดที่เลือกล่าสุด ===== */
const { NETS, SYMS, DNS_NAMES, LEVELS } = window.PX_DATA;
PX.bind(window.PX_DATA);
const SAVE = KG.store('krukan_game_packet_v1', { mode: 'time', stars: {}, best: {}, tutorDone: false, unlockAll: false });
const levelStars = l => SAVE.data.stars[l] || 0;
const levelOpen = l => SAVE.data.unlockAll || l === 1 || levelStars(l - 1) > 0;
const totalStars = () => LEVELS.reduce((n, L) => n + levelStars(L.id), 0);
const maxStars = () => LEVELS.length * 3;
const FORMS = ['h1', 'h0', 'h2', 'h3'];   // ฟ้าน้ำเงิน (ฐานของเกมนี้) › มาเจนต้า › ทอง › แดง ตามคอมโบ
const MODE_SPEED = { time: 0.85, free: 0.6 };   // ช้าลงจากเดิม (1 และ 0.7) ให้มีเวลาดูสายและตัดสินใจนานขึ้น
