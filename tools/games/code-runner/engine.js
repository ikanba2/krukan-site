/* Code Runner: ตัวจำลองโปรแกรมบล็อกของ Techno บนทางวิ่งด้านข้าง (ไม่แตะภาพ)
   ใช้ทั้งในเกมและในการทดสอบด้วย Node (test_engine.js)
   ทางวิ่งเป็นแถวของช่อง (คอลัมน์) ตัวอักษรในแผนที่:
     S จุดเริ่ม   G ประตู   . พื้น   o เหรียญบนพื้น   p หลุม   q หลุมมีเหรียญลอยเหนือหลุม
     ^ หนาม   v หนามมีเหรียญลอยเหนือหนาม   c ลัง (ชนไม่ได้ ต้องโจมตีให้แตก)   e ศัตรู (1 ชีวิต)   B บอส (3 ชีวิต)   w กำแพงสูง */
(function (root) {
  'use strict';
  const MAX_STEPS = 500, MAX_DEPTH = 5;

  function parseLevel(level) {
    const cols = [], coins = [];
    const s = level.map;
    let start = 0, goal = s.length - 1;
    for (let x = 0; x < s.length; x++) {
      const ch = s[x]; let t = 'ground', hp = 0;
      if (ch === 'p' || ch === 'q') t = 'pit';
      else if (ch === '^' || ch === 'v') t = 'spike';
      else if (ch === 'c') t = 'crate';
      else if (ch === 'e') { t = 'enemy'; hp = 1; }
      else if (ch === 'B') { t = 'enemy'; hp = 3; }
      else if (ch === 'w') t = 'wall';
      else if (ch === 'S') start = x;
      else if (ch === 'G') goal = x;
      cols.push({ t, hp, boss: ch === 'B' });
      if (ch === 'o') coins.push({ x, air: false });
      if (ch === 'q' || ch === 'v') coins.push({ x, air: true });
    }
    return { n: s.length, cols, coins, start, goal, dir: level.dir || 1 };
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
     คืน { events, result, prims, blocks, coins, totalCoins }
     result: win | cores | goal | bump | fall | spike | timeout | empty */
  function run(level, prog) {
    const map = parseLevel(level);
    const st = { x: map.start, dir: map.dir, got: map.coins.map(() => false), hp: map.cols.map(c => c.hp), broken: map.cols.map(() => false) };
    const events = []; let steps = 0, prims = 0; const STOP = { stop: true };

    const push = e => { e.x = st.x; e.dir = st.dir; events.push(e); return e; };
    const tick = id => { if (++steps > MAX_STEPS) { push({ id: id || null, op: 'fail', code: 'timeout' }); throw STOP; } };
    const inRange = x => x >= 0 && x < map.n;
    function kind(x) {
      if (!inRange(x)) return 'wall';
      const c = map.cols[x];
      if (c.t === 'enemy') return st.hp[x] > 0 ? (c.boss ? 'boss' : 'enemy') : 'ground';
      if (c.t === 'crate') return st.broken[x] ? 'ground' : 'crate';
      return c.t;
    }
    const blocked = k => k === 'wall' || k === 'crate' || k === 'enemy' || k === 'boss';
    function cond(c) {
      const k = kind(st.x + st.dir);
      if (c === 'gap') return k === 'pit' || k === 'spike';
      if (c === 'foe') return k === 'enemy' || k === 'boss' || k === 'crate';
      if (c === 'wall') return k === 'wall';
      if (c === 'clear') return k === 'ground';
      return false;
    }
    const atGoal = () => st.x === map.goal;
    function collect(xs, air) {
      const got = [];
      map.coins.forEach((c, i) => { if (!st.got[i] && xs.includes(c.x) && (c.air ? air : true)) { st.got[i] = true; got.push(i); } });
      return got;
    }

    function exec(list, depth) {
      for (const b of list || []) {
        switch (b.t) {
          case 'walk': {
            tick(b.id); const tx = st.x + st.dir, k = kind(tx);
            if (blocked(k)) { push({ id: b.id, op: 'fail', code: 'bump', at: tx, kind: k }); throw STOP; }
            if (k === 'pit') { const from = st.x; st.x = tx; push({ id: b.id, op: 'fail', code: 'fall', at: tx, from }); throw STOP; }
            if (k === 'spike') { const from = st.x; st.x = tx; push({ id: b.id, op: 'fail', code: 'spike', at: tx, from }); throw STOP; }
            const from = st.x; st.x = tx; prims++;
            push({ id: b.id, op: 'walk', from, coins: collect([tx], false) });
            break;
          }
          case 'jump': {
            tick(b.id); const mx = st.x + st.dir, lx = st.x + 2 * st.dir, mk = kind(mx), lk = kind(lx);
            if (mk === 'wall' || mk === 'boss') { push({ id: b.id, op: 'fail', code: 'bump', at: mx, kind: mk, jump: true }); throw STOP; }
            if (lk === 'wall' || blocked(lk)) { push({ id: b.id, op: 'fail', code: 'bump', at: lx, kind: lk, jump: true, over: mx }); throw STOP; }
            if (lk === 'pit') { const from = st.x; st.x = lx; push({ id: b.id, op: 'fail', code: 'fall', at: lx, from, jump: true }); throw STOP; }
            if (lk === 'spike') { const from = st.x; st.x = lx; push({ id: b.id, op: 'fail', code: 'spike', at: lx, from, jump: true }); throw STOP; }
            const from = st.x; prims++;
            const got = collect([mx], true).concat(collect([lx], false));
            st.x = lx;
            push({ id: b.id, op: 'jump', from, coins: got });
            break;
          }
          case 'attack': {
            tick(b.id); prims++; const tx = st.x + st.dir, k = kind(tx);
            if (k === 'enemy' || k === 'boss') { st.hp[tx]--; push({ id: b.id, op: 'attack', at: tx, kind: k, killed: st.hp[tx] <= 0, hp: st.hp[tx] }); }
            else if (k === 'crate') { st.broken[tx] = true; push({ id: b.id, op: 'attack', at: tx, kind: 'crate', killed: true, hp: 0 }); }
            else push({ id: b.id, op: 'attack', at: tx, kind: 'none', killed: false });
            break;
          }
          case 'turn': tick(b.id); st.dir = -st.dir; prims++; push({ id: b.id, op: 'turn' }); break;
          case 'rep':
            for (let i = 0; i < (b.n || 1); i++) { tick(b.id); push({ id: b.id, op: 'enter', round: i + 1 }); exec(b.body, depth); }
            break;
          case 'until':
            while (!atGoal()) { tick(b.id); push({ id: b.id, op: 'enter' }); exec(b.body, depth); }
            break;
          case 'while':
            while (cond(b.c)) { tick(b.id); push({ id: b.id, op: 'enter' }); exec(b.body, depth); }
            break;
          case 'if': case 'ifelse': {
            tick(b.id); const ok = cond(b.c); push({ id: b.id, op: 'cond', ok });
            if (ok) exec(b.body, depth); else if (b.t === 'ifelse') exec(b.other, depth);
            break;
          }
          case 'call':
            tick(b.id);
            if (depth >= MAX_DEPTH) { push({ id: b.id, op: 'fail', code: 'timeout' }); throw STOP; }
            push({ id: b.id, op: 'enter' }); exec(prog.fn, depth + 1);
            break;
          default: break;
        }
      }
    }

    let result;
    if (countProgram(prog) === 0) { result = 'empty'; push({ id: null, op: 'end', code: result }); }
    else {
      try {
        exec(prog.main, 0);
        result = atGoal() ? (st.got.every(Boolean) ? 'win' : 'cores') : 'goal';
        push({ id: null, op: 'end', code: result });
      } catch (e) { if (e !== STOP) throw e; result = events[events.length - 1].code; }
    }
    return { events, result, prims, blocks: countProgram(prog), coins: st.got.filter(Boolean).length, totalCoins: map.coins.length };
  }

  const api = { parseLevel, run, countProgram, countList, withIds, cloneProgram };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CR = api;
})(typeof window !== 'undefined' ? window : globalThis);
