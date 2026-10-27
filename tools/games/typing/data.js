/* ===== ข้อมูลกลางของเกม Type Hero: บันทึกคะแนน ดาว ภาษาและโหมดที่เลือกล่าสุด ===== */
const { LEVELS, TUTORIAL } = window.TY_DATA;
TY.bind(window.TY_DATA);
const GW = KG.GW, GH = KG.GH;
const SAVE = KG.store('krukan_game_typing_v1', { lang: 'th', mode: 'time', stars: { th: {}, en: {} }, best: { th: {}, en: {} }, course: { th: {}, en: {} }, cbest: { th: {}, en: {} }, tutorDone: false, unlockAll: false });
['th', 'en'].forEach(l => { SAVE.data.stars[l] = SAVE.data.stars[l] || {}; SAVE.data.best[l] = SAVE.data.best[l] || {}; SAVE.data.course = SAVE.data.course || {}; SAVE.data.cbest = SAVE.data.cbest || {}; SAVE.data.course[l] = SAVE.data.course[l] || {}; SAVE.data.cbest[l] = SAVE.data.cbest[l] || {}; });
/* ---------- โหมดหัดพิมพ์สัมผัส (TY_COURSE ใน course.js) ดาวรายด่าน key = 'บท-ด่าน' เริ่มนับบทจาก 0 ---------- */
const CL = TY_COURSE.LESSONS, CS = TY_COURSE.STAGES;
const ckey = (lesson, stage) => lesson + '-' + stage;
const courseStars = (lang, lesson, stage) => SAVE.data.course[lang][ckey(lesson, stage)] || 0;
const courseTotal = lang => CL[lang].reduce((n, L, i) => n + CS.reduce((m, S) => m + courseStars(lang, i, S.id), 0), 0);
const courseMax = lang => CL[lang].length * CS.length * 3;
// ด่านที่ควรเล่นต่อ: ด่านแรกที่ยังไม่มีดาว (ไม่ล็อกด่าน เลือกเล่นได้ทุกด่าน)
function nextCourse(lang) { for (let i = 0; i < CL[lang].length; i++) for (const S of CS) if (!courseStars(lang, i, S.id)) return { lesson: i, stage: S.id }; return { lesson: 0, stage: 1 }; }
// ป้ายแป้นใหม่ของบท: สระ/วรรณยุกต์ที่ไม่มีความกว้างแสดงคู่กับขีด (–่) แบบเดียวกับเกมตะลุยเมืองอักษร
const keyLabel = c => (/^[ัิ-ฺ็-๎]$/.test(c) ? '–' + c : c);
const levelStars = (lang, l) => SAVE.data.stars[lang][l] || 0;
const levelOpen = (lang, l) => SAVE.data.unlockAll || l === 1 || levelStars(lang, l - 1) > 0;
const totalStars = () => ['th', 'en'].reduce((n, lg) => n + LEVELS.reduce((m, L) => m + levelStars(lg, L.id), 0), 0);
const maxStars = () => LEVELS.length * 3 * 2;
function nextLevel(lang) { const L = LEVELS.find(x => levelOpen(lang, x.id) && !levelStars(lang, x.id)); return L ? L.id : 1; }
const LANG_NAME = { th: 'ภาษาไทย', en: 'English' }, MODE_NAME = { time: 'จับเวลา', free: 'ไม่จับเวลา' };
// ข้อความที่มีสระ/วรรณยุกต์เขียนเดี่ยว ๆ (เช่น 'มือขวา ่ า ส ว') ใส่ขีดนำ ไม่ให้เครื่องหมายไปเกาะตัวหน้า
const markText = t => String(t).replace(/(^|[\s(·/])([ัิ-ฺ็-๎])/g, '$1–$2');
