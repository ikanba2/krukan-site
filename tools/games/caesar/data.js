/* ===== ข้อมูลกลางของเกม Cipher Breaker: บันทึกความคืบหน้าและกติกาการปลดล็อก ===== */
const { MISSIONS, WORLDS } = window.CC_DATA;
const GW = KG.GW, GH = KG.GH;
const SAVE = KG.store('krukan_game_cipher_v1', { stars: {}, defense: {}, seenHow: false, unlockAll: false, best: {} });

const missionStars = i => SAVE.data.stars[i] || 0;
const defenseStars = w => SAVE.data.defense[w] || 0;
const worldMissions = w => MISSIONS.map((m, i) => i).filter(i => MISSIONS[i].world === w);
const missionOpen = i => SAVE.data.unlockAll || i === 0 || missionStars(i - 1) > 0;
const defenseOpen = w => SAVE.data.unlockAll || worldMissions(w).every(i => missionStars(i) > 0);
const worldStars = w => worldMissions(w).reduce((n, i) => n + missionStars(i), 0) + defenseStars(w);
const totalStars = () => WORLDS.reduce((n, w) => n + worldStars(w.id), 0);
const maxStars = () => WORLDS.reduce((n, w) => n + (worldMissions(w.id).length + 1) * 3, 0);
function nextMission() { const i = MISSIONS.findIndex((m, k) => missionOpen(k) && !missionStars(k)); return i < 0 ? 0 : i; }
const hexToInt = s => parseInt(String(s).replace('#', ''), 16);
