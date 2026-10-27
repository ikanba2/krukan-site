/* Techno Steps (ก้าวคำสั่ง): ตรรกะของเกมเขียนโปรแกรมสั่งไรเดอร์เดินบนตาราง (ไม่แตะภาพ) ใช้ทั้งในเกมและในการทดสอบด้วย Node
   แผนที่: { w, h, start:[x,y], goal:[x,y], walls:[[x,y]], pits:[[x,y]], stars:[[x,y]], key:[x,y]|null, door:[x,y]|null, mons:[{x,y,m,hp}] }  (x ขวา, y ลง)
   บล็อกคำสั่ง: { t:'mv', d:'up'|'down'|'left'|'right' } · { t:'atk' } · { t:'rep', n, body } · { t:'until', c:'goal', body } · { t:'if', c, body, other } · { t:'call', f }
   เงื่อนไข c: monster (มีมอนสเตอร์อยู่ข้างหน้า) · wall (ข้างหน้าเป็นกำแพง ขอบ หรือประตูที่ยังล็อก) · pit (ข้างหน้าเป็นหลุม) · clear (ข้างหน้าเดินได้ปลอดภัย) · goal (ยืนอยู่บนธง)
   โปรแกรม: { main:[บล็อก...], fn:{ A:[บล็อก...] } }
   กติกา: ก้าวไปชนกำแพง/ประตูล็อก/มอนสเตอร์จะหันหน้าไปทางนั้นแต่ไม่ขยับ (ไม่ผิด) · ฟัน (atk) โดนมอนสเตอร์ช่องข้างหน้าลดเลือด 1 (บอสเลือด 2) · ตกหลุมแพ้ทันที · ถึงธงชนะและจบโปรแกรมทันที */
(function (root) {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const MAX_STEPS = 500, MAX_DEPTH = 8;
  const STOP = { stop: true };

  const key = (x, y) => x + ',' + y;
  const cloneProg = p => JSON.parse(JSON.stringify(p));
  const countList = list => (list || []).reduce((n, b) => n + 1 + countList(b.body) + countList(b.other), 0);
  // จำนวนใบคำสั่งทั้งหมด (ใบที่ซ้อนอยู่ข้างในนับด้วย โปรแกรมย่อยนับครั้งเดียว)
  const cardCount = prog => countList(prog.main) + Object.keys(prog.fn || {}).reduce((n, k) => n + countList(prog.fn[k]), 0);
  const emptyProg = () => ({ main: [], fn: {} });

  function initState(level) {
    const M = level.map;
    return {
      x: M.start[0], y: M.start[1], dir: 'right', key: false, doorOpen: false, steps: 0, ended: null, events: [], stars: new Set(),
      mons: (M.mons || []).map((m, i) => ({ i, x: m.x, y: m.y, m: m.m, hp: m.hp || 1, max: m.hp || 1 })),
      walls: new Set((M.walls || []).map(c => key(c[0], c[1]))), pits: new Set((M.pits || []).map(c => key(c[0], c[1]))),
      starAt: new Set((M.stars || []).map(c => key(c[0], c[1])))
    };
  }

  // ชนิดของช่อง (ไม่นับมอนสเตอร์): edge | wall | door | pit | free
  function tileKind(S, M, x, y) {
    if (x < 0 || y < 0 || x >= M.w || y >= M.h) return 'edge';
    if (S.walls.has(key(x, y))) return 'wall';
    if (M.door && M.door[0] === x && M.door[1] === y && !S.doorOpen) return 'door';
    if (S.pits.has(key(x, y))) return 'pit';
    return 'free';
  }
  const monAt = (S, x, y) => S.mons.find(m => m.hp > 0 && m.x === x && m.y === y) || null;

  /* ---------- รันโปรแกรม: คืนลำดับเหตุการณ์ให้ฉากเล่นภาพ และผลลัพธ์ ---------- */
  function run(level, prog) {
    const M = level.map, S = initState(level), ev = S.events, push = o => { ev.push(o); };
    const ahead = () => [S.x + DIRS[S.dir][0], S.y + DIRS[S.dir][1]];
    const cond = c => {
      const [ax, ay] = ahead(), k = tileKind(S, M, ax, ay), mon = monAt(S, ax, ay);
      if (c === 'monster') return !!mon;
      if (c === 'wall') return k === 'edge' || k === 'wall' || k === 'door';
      if (c === 'pit') return k === 'pit';
      if (c === 'clear') return k === 'free' && !mon;
      if (c === 'goal') return S.x === M.goal[0] && S.y === M.goal[1];
      return false;
    };
    const tick = () => { if (++S.steps > MAX_STEPS) { S.ended = 'timeout'; push({ op: 'timeout' }); throw STOP; } };
    function step(d) {
      S.dir = d; const [ax, ay] = ahead(), k = tileKind(S, M, ax, ay), mon = monAt(S, ax, ay);
      if (k === 'edge' || k === 'wall') { push({ op: 'bump', dir: d, why: 'wall', x: ax, y: ay }); return; }
      if (k === 'door') {
        if (!S.key) { push({ op: 'bump', dir: d, why: 'door', x: ax, y: ay }); return; }
        S.doorOpen = true; push({ op: 'door', x: ax, y: ay });
      }
      if (mon) { push({ op: 'bump', dir: d, why: 'monster', x: ax, y: ay, mon: mon.i }); return; }
      const from = [S.x, S.y]; S.x = ax; S.y = ay; push({ op: 'move', dir: d, from, to: [ax, ay] });
      if (S.pits.has(key(ax, ay))) { S.ended = 'fall'; push({ op: 'fall', x: ax, y: ay }); throw STOP; }
      if (S.starAt.has(key(ax, ay)) && !S.stars.has(key(ax, ay))) { S.stars.add(key(ax, ay)); push({ op: 'star', x: ax, y: ay }); }
      if (M.key && !S.key && M.key[0] === ax && M.key[1] === ay) { S.key = true; push({ op: 'key', x: ax, y: ay }); }
      if (ax === M.goal[0] && ay === M.goal[1]) { S.ended = 'win'; push({ op: 'goal', x: ax, y: ay }); throw STOP; }
    }
    function attack() {
      const [ax, ay] = ahead(), mon = monAt(S, ax, ay);
      if (mon) { mon.hp--; push({ op: 'atk', hit: true, mon: mon.i, dead: mon.hp <= 0, x: ax, y: ay, dir: S.dir }); }
      else push({ op: 'atk', hit: false, x: ax, y: ay, dir: S.dir });
    }
    function exec(list, depth) {
      for (const b of list || []) {
        tick(); push({ op: 'enter', id: b.id == null ? null : b.id });
        if (b.t === 'mv') step(b.d);
        else if (b.t === 'atk') attack();
        else if (b.t === 'rep') { for (let i = 0; i < b.n; i++) { push({ op: 'loop', id: b.id == null ? null : b.id, i }); exec(b.body, depth); } }
        else if (b.t === 'until') { while (!cond(b.c || 'goal')) { tick(); push({ op: 'loop', id: b.id == null ? null : b.id }); exec(b.body, depth); } }
        else if (b.t === 'if') { const yes = cond(b.c); push({ op: 'test', id: b.id == null ? null : b.id, yes }); exec(yes ? b.body : b.other, depth); }
        else if (b.t === 'call') { if (depth < MAX_DEPTH && prog.fn && prog.fn[b.f]) exec(prog.fn[b.f], depth + 1); }
      }
    }
    try { exec(prog.main, 0); } catch (e) { if (e !== STOP) throw e; }
    if (!S.ended) S.ended = 'short';
    return { result: S.ended, win: S.ended === 'win', events: ev, collected: S.stars.size, totalStars: (M.stars || []).length, killed: S.mons.filter(m => m.hp <= 0).length, x: S.x, y: S.y, cards: cardCount(prog) };
  }

  // ดาวของด่าน: 1 = ถึงธง · 2 = เก็บดาวครบ · 3 = เก็บครบและ (สร้างเอง: ใช้ใบไม่เกิน par | ซ่อม/เรียงลำดับ: ผ่านภายใน 3 ครั้ง)
  function evaluate(level, prog, attempts) {
    const r = run(level, prog), kind = level.kind || 'build', over = level.limit && r.cards > level.limit;
    let stars = 0;
    if (r.win && !over) {
      stars = 1; if (r.collected >= r.totalStars) stars = 2;
      if (stars === 2 && (kind === 'build' ? r.cards <= level.par : (attempts || 1) <= 3)) stars = 3;
    }
    r.stars = stars; r.over = !!over; return r;
  }

  const api = { DIRS, MAX_STEPS, key, cloneProg, countList, cardCount, emptyProg, initState, tileKind, run, evaluate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ST = api;
})(typeof window !== 'undefined' ? window : globalThis);
