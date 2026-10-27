/* ===== ข้อมูลกลางของเกม Techno Grid: บันทึกความคืบหน้า กติกาการปลดล็อก ===== */
const { LEVELS, WORLDS, ARCADE } = window.GR_DATA;
const GW = KG.GW, GH = KG.GH;
const SAVE = KG.store('krukan_game_grid_v1', { stars: {}, arcade: {}, seenHow: false, unlockAll: false, best: {} });

const missionStars = i => SAVE.data.stars[i] || 0;
const arcadeStars = w => SAVE.data.arcade[w] || 0;
const worldLevels = w => LEVELS.map((l, i) => i).filter(i => LEVELS[i].world === w);
// ด่านเปิดตามลำดับ (ผ่านด่านก่อนหน้าแล้ว) สนามไล่ล่าของ SECTOR เปิดเมื่อผ่านด่านใน SECTOR นั้นครบ
const missionOpen = i => SAVE.data.unlockAll || i === 0 || missionStars(i - 1) > 0;
const arcadeOpen = w => SAVE.data.unlockAll || worldLevels(w).every(i => missionStars(i) > 0);
const worldStars = w => worldLevels(w).reduce((n, i) => n + missionStars(i), 0) + arcadeStars(w);
const totalStars = () => WORLDS.reduce((n, w) => n + worldStars(w.id), 0);
const maxStars = () => WORLDS.reduce((n, w) => n + (worldLevels(w.id).length + 1) * 3, 0);
function nextMission() { const i = LEVELS.findIndex((l, k) => missionOpen(k) && !missionStars(k)); return i < 0 ? 0 : i; }
const hexToInt = s => parseInt(String(s).replace('#', ''), 16);
