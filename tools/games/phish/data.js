/* ===== ข้อมูลกลางของเกม Net Patrol: บันทึกคะแนน ดาว และโหมดที่เลือกล่าสุด ===== */
const { LEVELS, CARDS, CLUES, APPS, TUTORIAL } = window.NP_DATA;
NP.bind(window.NP_DATA);
const SAVE = KG.store('krukan_game_phish_v1', { mode: 'time', stars: {}, best: {}, tutorDone: false, unlockAll: false });
const levelStars = l => SAVE.data.stars[l] || 0;
const levelOpen = l => SAVE.data.unlockAll || l === 1 || levelStars(l - 1) > 0;
const totalStars = () => LEVELS.reduce((n, L) => n + levelStars(L.id), 0);
const maxStars = () => LEVELS.length * 3;
const MODE_NAME = { time: 'ท้าทาย (จับเวลา มีหัวใจ)', free: 'ฝึก (ไม่จับเวลา อ่านเหตุผลได้เต็มที่)' };
const FORMS = ['h0', 'h1', 'h2', 'h3'];   // ฐาน มาเจนต้า › ฟ้าน้ำเงิน › ทอง › แดง ตามคอมโบ
const APP_COLOR = { sms: '#26b866', email: '#2b8cff', chat: '#8a5cf5', popup: '#ff4d5e', web: '#00a3b8', post: '#ff5aa5', habit: '#ff9a1a' };
const APP_ICON = { sms: 'bolt', email: 'book', chat: 'heart', popup: 'skull', web: 'eye', post: 'flag', habit: 'shield' };
