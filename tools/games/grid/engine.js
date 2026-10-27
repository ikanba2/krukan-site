/* Techno Grid: ตรรกะของเขาวงกตตารางที่ Techno เดินตามโปรแกรมบล็อก (ไม่แตะภาพ) ใช้ทั้งในเกมและในการทดสอบด้วย Node
   ตัวอักษรในแผนที่:  (ช่องว่าง) ไม่มีพื้น ตกขอบ   # กำแพง   . พื้น   S จุดเริ่ม   G ประตู   o แกนพลังงาน
                      ~ น้ำ   ^ หนาม   e ศัตรู (1 ชีวิต)   B บอส (3 ชีวิต)   c ลัง (ต้องโจมตีให้แตก)
   สำหรับสนามวิ่งเรียลไทม์ใช้เพิ่ม:  m ที่เกิดของมอนสเตอร์   p พลังพิเศษ
   ทิศ: 0 เหนือ 1 ตะวันออก 2 ใต้ 3 ตะวันตก (ตัวเลขเดียวกับที่ใช้ในด่านและการหมุนซ้าย/ขวา) */
(function (root) {
  'use strict';
  const MAX_STEPS = 700, MAX_DEPTH = 5;
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const ABS = { n: 0, e: 1, s: 2, w: 3 };

  function parseMap(level) {
    const rows = level.map, h = rows.length;
    let w = 0; rows.forEach(r => { w = Math.max(w, r.length); });
    const cells = [], gems = [], enemies = [], monsters = [], powers = [];
    let start = { x: 0, y: 0 }, goal = { x: 0, y: 0 };
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x] || ' '; let t = 'floor';
        if (ch === ' ') t = 'void'; else if (ch === '#') t = 'wall'; else if (ch === '~') t = 'water'; else if (ch === '^') t = 'spike';
        else if (ch === 'S') start = { x, y }; else if (ch === 'G') goal = { x, y };
        else if (ch === 'o') gems.push({ x, y });
        else if (ch === 'e') enemies.push({ x, y, hp: 1, boss: false, crate: false });
        else if (ch === 'B') enemies.push({ x, y, hp: 3, boss: true, crate: false });
        else if (ch === 'c') enemies.push({ x, y, hp: 1, boss: false, crate: true });
        else if (ch === 'm') monsters.push({ x, y });
        else if (ch === 'p') powers.push({ x, y });
        row.push(t);
      }
      cells.push(row);
    }
    return { w, h, cells, gems, enemies, monsters, powers, start, goal, dir: level.dir == null ? 1 : level.dir };
  }

  function countList(list) { let n = 0; for (const b of list || []) n += 1 + countList(b.body) + countList(b.other); return n; }
  function countProgram(p) { return countList(p.main) + countList(p.fn); }
  let idSeq = 1;
  function withIds(list) {
    return (list || []).map(b => {
      const c = Object.assign({}, b, { id: 'k' + (idSeq++) });
      if (b.body) c.body = withIds(b.body);
      if (b.other) c.other = withIds(b.other);
      return c;
    });
  }
  function cloneProgram(p) { return { main: withIds(p.main), fn: withIds(p.fn) }; }

  /* ---------- รันโปรแกรม ----------
     คืน { events, result, blocks, gems, totalGems }
     result: win | gems | goal | bump | void | water | spike | timeout | empty */
  function run(level, prog) {
    const map = parseMap(level);
    const st = { x: map.start.x, y: map.start.y, dir: map.dir, got: map.gems.map(() => false), hp: map.enemies.map(e => e.hp) };
    const events = []; let steps = 0; const STOP = { stop: true };
    const push = e => { e.x = st.x; e.y = st.y; e.dir = st.dir; events.push(e); return e; };
    const tick = id => { if (++steps > MAX_STEPS) { push({ id: id || null, op: 'fail', code: 'timeout' }); throw STOP; } };
    const enemyAt = (x, y) => map.enemies.findIndex((e, i) => e.x === x && e.y === y && st.hp[i] > 0);
    function kind(x, y) {
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return 'void';
      const t = map.cells[y][x]; if (t !== 'floor') return t;
      const i = enemyAt(x, y); if (i >= 0) return map.enemies[i].crate ? 'crate' : (map.enemies[i].boss ? 'boss' : 'enemy');
      return 'floor';
    }
    const blocked = k => k === 'wall' || k === 'enemy' || k === 'boss' || k === 'crate';
    const ahead = d => ({ x: st.x + DX[d], y: st.y + DY[d] });
    function cond(c) {
      const f = ahead(st.dir), kf = kind(f.x, f.y);
      if (c === 'ahead') return kf === 'floor';
      if (c === 'foe') return kf === 'enemy' || kf === 'boss' || kf === 'crate';
      if (c === 'hazard') return kf === 'water' || kf === 'spike';
      if (c === 'left') { const p = ahead((st.dir + 3) % 4); return kind(p.x, p.y) === 'floor'; }
      if (c === 'right') { const p = ahead((st.dir + 1) % 4); return kind(p.x, p.y) === 'floor'; }
      return false;
    }
    const atGoal = () => st.x === map.goal.x && st.y === map.goal.y;
    function move(d, id) {
      tick(id); const t = ahead(d), k = kind(t.x, t.y), from = { x: st.x, y: st.y };
      if (blocked(k)) { push({ id, op: 'fail', code: 'bump', at: t, kind: k, moveDir: d }); throw STOP; }
      st.x = t.x; st.y = t.y;
      if (k === 'void' || k === 'water' || k === 'spike') { push({ id, op: 'fail', code: k, at: t, from, moveDir: d }); throw STOP; }
      let gem = -1; map.gems.forEach((g, i) => { if (!st.got[i] && g.x === st.x && g.y === st.y) { st.got[i] = true; gem = i; } });
      push({ id, op: 'move', from, to: { x: st.x, y: st.y }, gem, moveDir: d });
    }
    function exec(list, depth) {
      for (const b of list || []) {
        switch (b.t) {
          case 'n': case 'e': case 's': case 'w': st.dir = ABS[b.t]; move(st.dir, b.id); break;
          case 'fwd': move(st.dir, b.id); break;
          case 'tl': tick(b.id); st.dir = (st.dir + 3) % 4; push({ id: b.id, op: 'turn', side: 'l' }); break;
          case 'tr': tick(b.id); st.dir = (st.dir + 1) % 4; push({ id: b.id, op: 'turn', side: 'r' }); break;
          case 'atk': {
            tick(b.id); const t = ahead(st.dir), i = enemyAt(t.x, t.y);
            if (i >= 0) { st.hp[i]--; const e = map.enemies[i]; push({ id: b.id, op: 'attack', at: t, kind: e.crate ? 'crate' : (e.boss ? 'boss' : 'enemy'), killed: st.hp[i] <= 0, hp: st.hp[i], idx: i }); }
            else push({ id: b.id, op: 'attack', at: t, kind: 'none', killed: false });
            break;
          }
          case 'rep': for (let i = 0; i < (b.n || 1); i++) { tick(b.id); push({ id: b.id, op: 'enter', round: i + 1 }); exec(b.body, depth); } break;
          case 'until': while (!atGoal()) { tick(b.id); push({ id: b.id, op: 'enter' }); exec(b.body, depth); } break;
          case 'while': while (cond(b.c)) { tick(b.id); push({ id: b.id, op: 'enter' }); exec(b.body, depth); } break;
          case 'if': case 'ifelse': {
            tick(b.id); const ok = cond(b.c); push({ id: b.id, op: 'cond', ok });
            if (ok) exec(b.body, depth); else if (b.t === 'ifelse') exec(b.other, depth);
            break;
          }
          case 'call':
            tick(b.id);
            if (depth >= MAX_DEPTH) { push({ id: b.id, op: 'fail', code: 'timeout' }); throw STOP; }
            push({ id: b.id, op: 'enter' }); exec(prog.fn, depth + 1); break;
          default: break;
        }
      }
    }
    let result;
    if (countProgram(prog) === 0) { result = 'empty'; push({ id: null, op: 'end', code: result }); }
    else {
      try {
        exec(prog.main, 0);
        result = atGoal() ? (st.got.every(Boolean) ? 'win' : 'gems') : 'goal';
        push({ id: null, op: 'end', code: result });
      } catch (e) { if (e !== STOP) throw e; result = events[events.length - 1].code; }
    }
    return { events, result, blocks: countProgram(prog), gems: st.got.filter(Boolean).length, totalGems: map.gems.length };
  }

  /* ---------- ตัวช่วยของสนามวิ่งเรียลไทม์ ---------- */
  function openCell(map, x, y) { return x >= 0 && y >= 0 && x < map.w && y < map.h && map.cells[y][x] !== 'wall' && map.cells[y][x] !== 'void'; }
  // BFS: ระยะทางจากช่อง (sx, sy) ไปทุกช่องที่เดินได้ (-1 = ไปไม่ถึง)
  function distances(map, sx, sy) {
    const d = []; for (let y = 0; y < map.h; y++) d.push(new Array(map.w).fill(-1));
    const q = [[sx, sy]]; d[sy][sx] = 0;
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      for (let k = 0; k < 4; k++) { const nx = x + DX[k], ny = y + DY[k]; if (openCell(map, nx, ny) && d[ny][nx] < 0) { d[ny][nx] = d[y][x] + 1; q.push([nx, ny]); } }
    }
    return d;
  }
  // ทิศที่ควรเดินจาก (x, y) เพื่อเข้าใกล้ (tx, ty) ที่สุด (ไม่ย้อนกลับถ้ามีทางอื่น) คืน -1 ถ้าไม่มีทาง
  function stepToward(map, x, y, tx, ty, avoidBack) {
    const d = distances(map, tx, ty); let best = -1, bv = 1e9;
    for (let k = 0; k < 4; k++) {
      if (avoidBack != null && k === (avoidBack + 2) % 4) continue;
      const nx = x + DX[k], ny = y + DY[k]; if (!openCell(map, nx, ny) || d[ny][nx] < 0) continue;
      if (d[ny][nx] < bv) { bv = d[ny][nx]; best = k; }
    }
    if (best < 0 && avoidBack != null) { const k = (avoidBack + 2) % 4, nx = x + DX[k], ny = y + DY[k]; if (openCell(map, nx, ny)) best = k; }
    return best;
  }
  function exits(map, x, y) { const out = []; for (let k = 0; k < 4; k++) if (openCell(map, x + DX[k], y + DY[k])) out.push(k); return out; }

  const api = { DX, DY, parseMap, run, countProgram, countList, withIds, cloneProgram, openCell, distances, stepToward, exits };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GR = api;
})(typeof window !== 'undefined' ? window : globalThis);
