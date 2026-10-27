/* Techno Steps: โลก 6 โลก (ป.1-ป.6) โลกละ 10 ด่านคล้ายกันไล่ระดับ สร้างด้วยสูตร + seed แล้วตรวจด้วยเอนจินว่า 'เฉลย' ผ่านจริงทุกด่าน (test_engine.js)
   makeLevel(โลก, ด่าน, seed) คืนด่านหนึ่งด่าน: { map, sol(เฉลย), par(จำนวนใบของเฉลย), limit(เพดานจำนวนใบ), kind: build|order|fix, pre(โปรแกรมตั้งต้น), palette }
   ด่านปกติใช้ seed ตายตัว (ทุกคนเจอด่านเดียวกัน) ส่วน 'ฝึกสุ่ม' ใช้ seed สุ่มกับสูตรเดียวกันเพื่อฝึกซ้ำ */
(function (root) {
  'use strict';
  const E = typeof require !== 'undefined' ? require('./engine.js') : root.ST;
  const DIRS = E.DIRS, key = E.key;
  const rngOf = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const pick = (rng, a) => a[Math.floor(rng() * a.length)];
  const shuffle = (a, rng) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const mv = d => ({ t: 'mv', d }), atk = () => ({ t: 'atk' }), rep = (n, ...body) => ({ t: 'rep', n, body }), until = (...body) => ({ t: 'until', c: 'goal', body });
  const iff = (c, body, other) => ({ t: 'if', c, body, other: other || [] }), call = f => ({ t: 'call', f });
  const P = (main, fn) => ({ main, fn: fn || {} });

  // มอนสเตอร์ 14 ตัวธรรมดา + บอสประจำโลก (id ตรงกับภาพ b12..b32)
  const NORMAL = [12, 13, 14, 15, 17, 20, 23, 24, 25, 26, 28, 29, 30, 31];
  const MON_NAME = { 12: 'สิงโตแผงทอง', 13: 'แกะสายฟ้า', 14: 'เต่ามอสส์', 15: 'ฟีนิกซ์เมฆ', 17: 'แมงกะพรุนโคม', 20: 'เห็ดยักษ์', 23: 'กระต่ายจันทร์', 24: 'นกยูงปริซึม', 25: 'หอยทากแนวปะการัง', 26: 'หมูป่าหนอง', 28: 'จามรีหิน', 29: 'จระเข้โกงกาง', 30: 'กระเบนออโรรา', 31: 'กวางจันทร์', 32: 'ไรเดอร์ดำ' };
  const WORLDS = [
    { id: 1, grade: 'ป.1', skill: 'ลำดับคำสั่ง', title: 'ก้าวแรก', hero: 's0', bg: 'sky', boss: 12, color: '#2b8cff', desc: 'เรียงการ์ดลูกศรให้ไรเดอร์เดินไปถึงธง เก็บดาว และฟันมอนสเตอร์ที่ขวางทาง', concept: 'โปรแกรมคือชุดคำสั่งที่เรียงเป็นลำดับ คอมพิวเตอร์ทำตามทีละคำสั่งตามที่เราเรียงไว้เท่านั้น' },
    { id: 2, grade: 'ป.2', skill: 'ลำดับสำคัญ', title: 'ลำดับสำคัญ', hero: 's2', bg: 'nature', boss: 14, color: '#22b45a', desc: 'หยิบกุญแจก่อนเปิดประตู และจัดการ์ดที่สลับกันอยู่ให้เรียงถูก', concept: 'ถ้าสลับลำดับคำสั่ง ผลลัพธ์อาจเปลี่ยนไป บางงานต้องทำก่อนบางงานเสมอ' },
    { id: 3, grade: 'ป.3', skill: 'การทำซ้ำ', title: 'ทำซ้ำ', hero: 's3', bg: 'sun', boss: 13, color: '#ff8a2b', desc: 'ใช้การ์ดวนซ้ำแทนการวางการ์ดซ้ำ ๆ จำนวนใบมีจำกัด', concept: 'คำสั่งทำซ้ำช่วยให้เขียนโปรแกรมสั้นลง เมื่อต้องทำสิ่งเดียวกันหลายรอบ' },
    { id: 4, grade: 'ป.4', skill: 'เงื่อนไข', title: 'ถ้า...แล้ว', hero: 's1', bg: 'reef', boss: 20, color: '#9b5cff', desc: 'ให้ไรเดอร์ตัดสินใจเองด้วยการ์ดถ้า-ไม่งั้น แล้ววนซ้ำจนถึงธง', concept: 'เงื่อนไขทำให้โปรแกรมเลือกทางเองตามสถานการณ์ โปรแกรมเดียวใช้ได้กับหลายแผนที่' },
    { id: 5, grade: 'ป.5', skill: 'หาบั๊ก', title: 'ซ่อมบั๊ก', hero: 's0', bg: 'autumn', boss: 24, color: '#e0243d', desc: 'โปรแกรมที่ให้มามีบั๊กซ่อนอยู่ ดูตอนมันทำงานแล้วแก้ให้ถูก', concept: 'บั๊กคือข้อผิดพลาดในโปรแกรม แก้บั๊กโดยทดลองรัน สังเกตว่าพลาดตรงไหน แล้วแก้ทีละจุด' },
    { id: 6, grade: 'ป.6', skill: 'โปรแกรมย่อย', title: 'โปรแกรมย่อย', hero: 's2', bg: 'ice', boss: 32, color: '#14b5c9', desc: 'สร้างท่าของตัวเองเก็บไว้ในโปรแกรมย่อยแล้วเรียกใช้ซ้ำ รวมกับวนซ้ำและเงื่อนไข', concept: 'โปรแกรมย่อยเก็บชุดคำสั่งที่ใช้บ่อยไว้ตั้งชื่อ แล้วเรียกใช้กี่ครั้งก็ได้ โปรแกรมจึงสั้นและแก้ง่าย' }
  ];
  const TITLES = [
    ['ก้าวไปข้างหน้า', 'เลี้ยวหน่อย', 'เก็บดาวระหว่างทาง', 'ระวังหลุม', 'ใครขวางทาง', 'ทางยาวขึ้น', 'ฟันให้ทัน', 'เดินให้ถูกทาง', 'ทางไกลหลายมอนสเตอร์', 'ด่านบอส: สิงโตแผงทอง'],
    ['เก็บกุญแจ', 'ประตูล็อก', 'กุญแจแล้วฟัน', 'เรียงให้ถูก 1', 'เรียงให้ถูก 2', 'เรียงให้ถูก 3', 'เรียงให้ถูก 4', 'กุญแจกับมอนสเตอร์', 'ทางยาวมีประตู', 'ด่านบอส: เต่ามอสส์'],
    ['เส้นตรงยาว', 'เดินลงยาว ๆ', 'ยาวแล้วเลี้ยว', 'บันไดขึ้น', 'บันไดลง', 'สองก้าวหนึ่งขั้น', 'แถวมอนสเตอร์', 'ซิกแซก', 'ย่องแล้วฟัน', 'ด่านบอส: แกะสายฟ้า'],
    ['ถ้าเจอมอนสเตอร์', 'ทางเดินมอนสเตอร์', 'สองตัวสามตัว', 'ถ้าเจอกำแพง', 'บันไดกำแพง', 'บันไดสูงขึ้น', 'ทั้งมอนสเตอร์ทั้งกำแพง', 'ทางผสม 1', 'ทางผสม 2', 'ด่านบอส: เห็ดยักษ์'],
    ['ซ่อมทิศ 1', 'ซ่อมทิศ 2', 'ซ่อมทิศ 3', 'ใบหาย', 'สลับผิด', 'วนผิดรอบ', 'วนผิดทาง', 'เงื่อนไขผิด', 'ไม่งั้นผิดข้าง', 'ด่านบอส: นกยูงปริซึม'],
    ['ท่าแรกของฉัน', 'เรียกใช้ซ้ำ', 'ท่าสี่ก้าว', 'ท่ายาวขึ้น', 'ท่าซ้ำสามที่', 'วนในวน 1', 'วนในวน 2', 'วนในวน 3', 'ท่าผสมมอนสเตอร์', 'ด่านบอส: ไรเดอร์ดำ']
  ];
  const HINTS = [
    'ดูทางจากไรเดอร์ไปถึงธง แล้ววางการ์ดลูกศรตามทางทีละใบ',
    'ดูว่าอะไรต้องทำก่อน กุญแจต้องเก็บก่อนผ่านประตู',
    'ถ้าต้องวางการ์ดเหมือนกันหลายใบ ให้ใช้การ์ดวนซ้ำแทน',
    'ให้ไรเดอร์ตัดสินใจเอง: ถ้าข้างหน้ามีมอนสเตอร์ให้ฟัน ไม่งั้นก็เดิน แล้ววนซ้ำจนถึงธง',
    'กดรันแล้วดูว่าพลาดตรงไหน ใบที่พลาดจะมีกรอบสีแดง แก้ทีละจุด',
    'ท่าที่ใช้ซ้ำ ๆ ให้สร้างเก็บไว้ในโปรแกรมย่อย A แล้วเรียกใช้'
  ];

  /* ---------- เครื่องมือสร้างแผนที่จากเส้นทาง ---------- */
  const dirOf = (a, b) => (b[0] > a[0] ? 'right' : b[0] < a[0] ? 'left' : b[1] > a[1] ? 'down' : 'up');
  const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
  // เดินสุ่มแบบไม่มีทางลัด (ช่องใหม่ห้ามติดช่องก่อนหน้านอกจากช่องล่าสุด) ทำให้เส้นทางคือทางสั้นที่สุด
  function genPath(w, h, len, rng, o) {
    o = o || {};
    for (let att = 0; att < 600; att++) {
      const sx = o.sx != null ? o.sx : Math.floor(rng() * Math.min(2, w)), sy = o.sy != null ? o.sy : Math.floor(rng() * h);
      const cells = [[sx, sy]], seen = new Set([key(sx, sy)]); let last = null, turns = 0, ok = true;
      for (let i = 0; i < len; i++) {
        const [cx, cy] = cells[cells.length - 1], cand = [];
        for (const d of ['right', 'up', 'down', 'left']) {
          if (o.noLeft && d === 'left') continue;
          const nx = cx + DIRS[d][0], ny = cy + DIRS[d][1];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || seen.has(key(nx, ny))) continue;
          let adj = 0; for (const e of ['right', 'up', 'down', 'left']) if (seen.has(key(nx + DIRS[e][0], ny + DIRS[e][1]))) adj++;
          if (adj > 1) continue;
          const turn = last && d !== last; if (turn && o.maxTurns != null && turns >= o.maxTurns) continue;
          cand.push([d, (d === 'right' ? 3 : d === 'left' ? 1 : 2) + (last && d === last ? 2 : 0)]);
        }
        if (!cand.length) { ok = false; break; }
        let tot = 0; cand.forEach(c => { tot += c[1]; }); let r = rng() * tot, d = cand[0][0];
        for (const c of cand) { r -= c[1]; if (r <= 0) { d = c[0]; break; } }
        if (last && d !== last) turns++; last = d; cells.push([cx + DIRS[d][0], cy + DIRS[d][1]]); seen.add(key(cells[cells.length - 1][0], cells[cells.length - 1][1]));
      }
      if (ok) return cells;
    }
    return null;
  }
  // เส้นทางจากลำดับก้าว (tokens เป็นชื่อทิศ หรือ 'atk' ที่ไม่ขยับ) เลื่อนให้พอดีกริด คืน { cells, w, h, atkAt:[index เซลล์ที่ยืนตอนฟัน] }
  function cellsFromMoves(tokens, pad) {
    let x = 0, y = 0, face = 'right'; const raw = [[0, 0]], atkAt = [];
    tokens.forEach(t => {
      if (t === 'atk') atkAt.push({ from: raw.length - 1, face }); else { x += DIRS[t][0]; y += DIRS[t][1]; face = t; raw.push([x, y]); }
    });
    const minx = Math.min(...raw.map(c => c[0])), miny = Math.min(...raw.map(c => c[1])), maxx = Math.max(...raw.map(c => c[0])), maxy = Math.max(...raw.map(c => c[1]));
    const px = pad ? pad[0] : 0, py = pad ? pad[1] : 0, ox = px - minx, oy = py - miny;
    return { cells: raw.map(c => [c[0] + ox, c[1] + oy]), w: maxx - minx + 1 + px * 2, h: maxy - miny + 1 + py * 2, atkAt };
  }
  function skeleton(cells, w, h) { return { w, h, start: cells[0].slice(), goal: cells[cells.length - 1].slice(), walls: [], pits: [], stars: [], key: null, door: null, mons: [] }; }
  function spread(rng, from, to, count, avoid) {   // เลือก index ที่กระจายสม่ำเสมอ (ไม่ซ้ำ ไม่ทับ avoid)
    const pool = []; for (let i = from; i <= to; i++) if (!avoid.has(i)) pool.push(i);
    if (!pool.length) return []; const out = [];
    for (let k = 0; k < count && pool.length; k++) { const target = Math.round(((k + 0.5) / count) * (pool.length - 1)); const i = pool.splice(Math.min(pool.length - 1, Math.max(0, target - out.length)), 1)[0]; out.push(i); }
    return out.sort((a, b) => a - b);
  }
  // หลุมและกำแพงหลอกนอกเส้นทาง (หลุมเลือกช่องติดเส้นทางก่อน ให้ล่อให้เดินผิด)
  function decorate(map, cells, rng, o) {
    const on = new Set(cells.map(c => key(c[0], c[1]))), keep = o.keep || new Set(), free = [];
    for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) if (!on.has(key(x, y)) && !keep.has(key(x, y))) free.push([x, y]);
    const near = c => ['up', 'down', 'left', 'right'].some(d => on.has(key(c[0] + DIRS[d][0], c[1] + DIRS[d][1])));
    const f = shuffle(free, rng), taken = new Set();
    const take = (n, list, pred) => { let k = 0; for (const c of f) { if (k >= n) break; if (taken.has(key(c[0], c[1])) || (pred && !pred(c))) continue; list.push(c); taken.add(key(c[0], c[1])); k++; } };
    take(o.pits || 0, map.pits, near);
    if (o.wallAll) f.forEach(c => { if (!taken.has(key(c[0], c[1]))) { map.walls.push(c); taken.add(key(c[0], c[1])); } });
    else take(Math.round((o.wallRatio || 0) * free.length), map.walls);
  }
  // ถ้าเดินเลี่ยงช่องประตูได้ ให้ปิดทางที่เหลือด้วยกำแพงจนประตูเป็นทางเดียว
  function sealDoor(map, cells) {
    const on = new Set(cells.map(c => key(c[0], c[1]))), block = new Set(map.walls.map(c => key(c[0], c[1])));
    const reach = () => {
      const seen = new Set([key(map.start[0], map.start[1])]), q = [map.start];
      while (q.length) { const [x, y] = q.shift(); for (const d of ['up', 'down', 'left', 'right']) { const nx = x + DIRS[d][0], ny = y + DIRS[d][1], k = key(nx, ny); if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h || seen.has(k) || block.has(k) || (map.door[0] === nx && map.door[1] === ny)) continue; seen.add(k); q.push([nx, ny]); } }
      return seen.has(key(map.goal[0], map.goal[1]));
    };
    if (!reach()) return;
    for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) if (!on.has(key(x, y)) && !block.has(key(x, y))) { map.walls.push([x, y]); block.add(key(x, y)); if (!reach()) return; }
  }
  // เฉลยจากเส้นทาง: เดินทีละก้าว ถ้าช่องถัดไปมีมอนสเตอร์ให้หันไปหา (ก้าวชน) ฟันตามเลือด แล้วค่อยก้าวเข้า
  function solveFromPath(cells, mons) {
    const main = []; let face = 'right';
    for (let i = 0; i < cells.length - 1; i++) {
      const d = dirOf(cells[i], cells[i + 1]), m = mons.find(mm => mm.x === cells[i + 1][0] && mm.y === cells[i + 1][1]);
      if (m) { if (face !== d) main.push(mv(d)); for (let h = 0; h < (m.hp || 1); h++) main.push(atk()); }
      main.push(mv(d)); face = d;
    }
    return P(main);
  }
  const monsterFor = (world, n, i, rng) => NORMAL[(world * 5 + n * 3 + i * 7 + Math.floor(rng() * 3)) % NORMAL.length];
  function pickMonsters(world, n, count, rng, avoidIds) {   // มอนสเตอร์คนละตัวในด่านเดียวกัน และหมุนไม่ซ้ำกับด่านก่อนหน้า
    const out = [], used = new Set(avoidIds || []);
    for (let i = 0; used.size < NORMAL.length && out.length < count; i++) { const id = monsterFor(world, n, i + out.length, rng); if (!used.has(id)) { used.add(id); out.push(id); } else { const alt = NORMAL.find(x => !used.has(x)); if (alt != null) { used.add(alt); out.push(alt); } } }
    return out;
  }
  const PAL = { moves: [mv('up'), mv('down'), mv('left'), mv('right')] };
  const palette = (o) => {
    const p = PAL.moves.map(b => Object.assign({}, b));
    if (o.atk) p.push(atk()); if (o.rep) p.push({ t: 'rep', n: 3, body: [] }); if (o.until) p.push({ t: 'until', c: 'goal', body: [] });
    (o.ifs || []).forEach(c => p.push({ t: 'if', c, body: [], other: [] })); if (o.call) p.push({ t: 'call', f: 'A' });
    return p;
  };

  /* ---------- โลก 1: ลำดับคำสั่ง ---------- */
  const W1 = [null,
    { w: 4, h: 3, len: 3, st: 1, mo: 0, pit: 0, turns: 0 }, { w: 4, h: 3, len: 4, st: 1, mo: 0, pit: 0, turns: 1 }, { w: 5, h: 3, len: 5, st: 2, mo: 0, pit: 0, turns: 2 },
    { w: 5, h: 4, len: 6, st: 2, mo: 0, pit: 2 }, { w: 5, h: 4, len: 6, st: 2, mo: 1, pit: 1 }, { w: 6, h: 4, len: 8, st: 2, mo: 1, pit: 2 },
    { w: 6, h: 4, len: 9, st: 3, mo: 2, pit: 2 }, { w: 6, h: 5, len: 10, st: 3, mo: 2, pit: 3 }, { w: 7, h: 5, len: 11, st: 3, mo: 3, pit: 3 }, { w: 7, h: 5, len: 12, st: 3, mo: 2, pit: 3, boss: true }];
  function genW1(n, rng) {
    const T = W1[n]; let cells = null, w = T.w, h = T.h;
    for (let g = 0; g < 4 && !cells; g++) { cells = genPath(w, h, T.len, rng, { noLeft: n <= 6, maxTurns: T.turns, sy: n === 1 ? 1 : undefined, sx: n === 1 ? 0 : undefined }); if (!cells) { w++; h++; } }
    const L = cells.length - 1, monIdx = [], avoid = new Set([0, L]);
    if (T.boss) { monIdx.push(L - 1); avoid.add(L - 1); }
    const normal = spread(rng, 2, L - 1, T.mo, avoid); normal.forEach(i => { monIdx.push(i); avoid.add(i); });
    const ids = pickMonsters(1, n, monIdx.length, rng, [12]);
    const map = skeleton(cells, w, h);
    monIdx.sort((a, b) => a - b).forEach((i, k) => { map.mons.push({ x: cells[i][0], y: cells[i][1], m: (T.boss && i === L - 1) ? WORLDS[0].boss : ids[k], hp: (T.boss && i === L - 1) ? 2 : 1 }); });
    spread(rng, 1, L - 1, T.st, new Set(monIdx.concat([0, L]))).forEach(i => map.stars.push(cells[i].slice()));
    decorate(map, cells, rng, { pits: T.pit, wallRatio: 0.12 });
    return { map, sol: solveFromPath(cells, map.mons), kind: 'build', pal: palette({ atk: T.mo > 0 || T.boss || n >= 5 }) };
  }

  /* ---------- โลก 2: ลำดับสำคัญ (กุญแจ-ประตู และเรียงการ์ดที่สลับกัน) ---------- */
  const W2 = [null,
    { w: 5, h: 3, len: 6, st: 1, mo: 0 }, { w: 5, h: 4, len: 7, st: 1, mo: 0 }, { w: 6, h: 4, len: 8, st: 1, mo: 1 }, { w: 5, h: 4, len: 6, st: 1, mo: 0, order: true },
    { w: 6, h: 4, len: 8, st: 2, mo: 0, order: true }, { w: 6, h: 4, len: 8, st: 2, mo: 1, order: true }, { w: 6, h: 5, len: 10, st: 2, mo: 1, order: true },
    { w: 6, h: 5, len: 10, st: 2, mo: 2 }, { w: 7, h: 5, len: 12, st: 3, mo: 2 }, { w: 7, h: 5, len: 12, st: 3, mo: 1, boss: true }];
  function genW2(n, rng) {
    const T = W2[n]; let cells = null, w = T.w, h = T.h;
    for (let g = 0; g < 4 && !cells; g++) { cells = genPath(w, h, T.len, rng, { noLeft: true }); if (!cells) { w++; h++; } }
    const L = cells.length - 1, ki = Math.max(1, Math.floor(L * 0.3)), di = Math.min(L - 1, Math.max(ki + 2, Math.ceil(L * 0.62)));
    const avoid = new Set([0, L, ki, di]), monIdx = [];
    if (T.boss) { const bi = L - 1 === di ? L - 2 : L - 1; monIdx.push(bi); avoid.add(bi); }
    spread(rng, 2, L - 1, T.mo, avoid).forEach(i => { monIdx.push(i); avoid.add(i); });
    const ids = pickMonsters(2, n, monIdx.length, rng, [14]), map = skeleton(cells, w, h);
    monIdx.sort((a, b) => a - b).forEach((i, k) => { const isBoss = T.boss && k === monIdx.length - 1; map.mons.push({ x: cells[i][0], y: cells[i][1], m: isBoss ? WORLDS[1].boss : ids[k], hp: isBoss ? 2 : 1 }); });
    map.key = cells[ki].slice(); map.door = cells[di].slice();
    spread(rng, 1, L - 1, T.st, new Set(monIdx.concat([0, L, ki, di]))).forEach(i => map.stars.push(cells[i].slice()));
    decorate(map, cells, rng, { pits: 1, wallRatio: 0.55 });
    sealDoor(map, cells);
    const sol = solveFromPath(cells, map.mons);
    return { map, sol, kind: T.order ? 'order' : 'build', pal: palette({ atk: monIdx.length > 0 }) };
  }

  /* ---------- โลก 3: การทำซ้ำ (เพดานจำนวนใบบังคับให้ใช้การ์ดวนซ้ำ) ---------- */
  // unit: ก้าวหนึ่งหน่วย (ชื่อทิศหรือ 'atk') k: จำนวนรอบ tail: ก้าวท้าย boss: มีบอสท้ายทาง
  const W3 = [null,
    { unit: ['right'], k: 4 }, { unit: ['down'], k: 4, start: 'top' }, { unit: ['right'], k: 6, tail: ['up', 'up'] },
    { unit: ['right', 'up'], k: 3 }, { unit: ['right', 'down'], k: 4 }, { unit: ['right', 'right', 'up'], k: 3 },
    { unit: ['atk', 'right'], k: 4, tail: ['right', 'right'] }, { unit: ['right', 'up', 'right', 'down'], k: 3 }, { unit: ['up', 'right', 'atk', 'right'], k: 3 },
    { unit: ['right', 'atk', 'right'], k: 3, boss: true }];
  function patternSol(unit, k, tail, bossTail) {
    const body = unit.map(t => (t === 'atk' ? atk() : mv(t))), main = [rep(k, ...body)];
    if (tail) { const g = []; tail.forEach(t => { if (g.length && g[g.length - 1].d === t && g[g.length - 1].t === 'mv') g[g.length - 1].n++; else g.push({ t: 'mv', d: t, n: 1 }); });
      g.forEach(x => { if (x.n > 1) main.push(rep(x.n, mv(x.d))); else main.push(mv(x.d)); }); }
    if (bossTail) { main.push(rep(2, atk())); main.push(mv('right')); }
    return P(main);
  }
  function genW3(n, rng) {
    const T = W3[n], tokens = []; let monAt = [];
    const pre = T.pre || [];
    for (let i = 0; i < T.k; i++) T.unit.forEach(t => tokens.push(t));
    (T.tail || []).forEach(t => tokens.push(t));
    if (T.boss) { tokens.push('atk'); tokens.push('atk'); tokens.push('right'); }
    // ถ้าเริ่มจากบนลงล่าง ต้องมีที่ว่างด้านบน
    const R = cellsFromMoves(tokens, [0, 0]);
    const w = Math.max(4, R.w + (R.w < 6 ? 1 : 0)), h = Math.max(3, R.h + (R.h < 4 ? 1 : 0)), cells = R.cells.map(c => [c[0] + (w - R.w > 0 ? 0 : 0), c[1] + Math.floor((h - R.h) / 2)]);
    const map = skeleton(cells, w, h), blockers = R.atkAt.map(a => ({ at: a.from, face: a.face }));
    // มอนสเตอร์อยู่ช่องถัดไปจากจุดที่ฟัน (ฟันอ้างอิงทิศที่หันอยู่ ซึ่งต้องเท่ากับก้าวถัดไป)
    const hpSeq = []; const ids = pickMonsters(3, n, blockers.length, rng, [13]);
    let bi = 0;
    blockers.forEach((b, i) => {
      const next = cells[b.at + 1]; if (!next) return; if (hpSeq.some(x => x.x === next[0] && x.y === next[1])) { const m = hpSeq.find(x => x.x === next[0] && x.y === next[1]); m.hp++; return; }
      hpSeq.push({ x: next[0], y: next[1], m: ids[bi++ % ids.length], hp: 1 });
    });
    if (T.boss) hpSeq.forEach((m, i) => { if (i === hpSeq.length - 1) m.m = WORLDS[2].boss; });
    map.mons = hpSeq;
    const L = cells.length - 1, monCells = new Set(hpSeq.map(m => key(m.x, m.y))), noStar = new Set([0, L]);
    cells.forEach((c, i) => { if (monCells.has(key(c[0], c[1]))) noStar.add(i); });
    spread(rng, 1, L - 1, 3, noStar).forEach(i => map.stars.push(cells[i].slice()));
    decorate(map, cells, rng, { pits: 2, wallRatio: 0.12 });
    const sol = patternSol(T.unit, T.k, T.tail, T.boss);
    return { map, sol, kind: 'build', pal: palette({ atk: T.unit.includes('atk') || T.boss, rep: true }), extraLimit: 1 };
  }

  /* ---------- โลก 4: เงื่อนไข (โปรแกรมเดียวใช้ได้ทุกแผนที่ของตระกูลนั้น) ---------- */
  const W4 = [null,
    { fam: 'A', len: 5, mo: 1 }, { fam: 'A', len: 6, mo: 1 }, { fam: 'A', len: 7, mo: 2 },
    { fam: 'B', steps: 3, run: 1 }, { fam: 'B', steps: 4, run: 1 }, { fam: 'B', steps: 2, run: 2 },
    { fam: 'C', steps: 3, run: 1, mo: 2 }, { fam: 'C', steps: 2, run: 2, mo: 2 }, { fam: 'C', steps: 4, run: 1, mo: 3 }, { fam: 'C', steps: 4, run: 1, mo: 2, boss: true }];
  function genW4(n, rng) {
    const T = W4[n];
    for (let att = 0; att < 80; att++) {
      const lv = genW4once(n, T, rng); if (lv) return lv;
    }
    throw new Error('สร้างด่านโลก 4 ไม่สำเร็จ ' + n);
  }
  function genW4once(n, T, rng) {
    let tokens = [], w, h, sol, ifs;
    if (T.fam === 'A') {
      for (let i = 0; i < T.len - 1; i++) tokens.push('right');
      ifs = ['monster']; sol = P([until(iff('monster', [atk()], [mv('right')]))]);
    } else {
      for (let s = 0; s < T.steps; s++) { for (let r = 0; r < T.run; r++) tokens.push('right'); tokens.push('up'); }
      for (let r = 0; r < T.run; r++) tokens.push('right');
      if (T.fam === 'B') { ifs = ['wall']; sol = P([until(iff('wall', [mv('up')], [mv('right')]))]); }
      else { ifs = ['monster', 'wall']; sol = P([until(iff('monster', [atk()], [iff('wall', [mv('up')], [mv('right')])]))]); }
    }
    const R = cellsFromMoves(tokens, [0, 0]);
    w = Math.max(5, R.w); h = T.fam === 'A' ? 3 : R.h + 1;   // บันไดเว้นแถวบนสุดว่างไว้ ให้ช่องข้างหน้าตอนหันขึ้นไม่ใช่ขอบ
    const offY = T.fam === 'A' ? 1 : 1;
    const cells = R.cells.map(c => [c[0], c[1] + offY]);
    const map = skeleton(cells, w, h), L = cells.length - 1, avoid = new Set([0, L]);
    // กำแพงที่ปลายแต่ละช่วงวิ่ง (ช่องขวาของช่องสุดท้ายก่อนเลี้ยวขึ้น) และช่องว่างด้านบนต้องไม่เป็นกำแพง
    const keep = new Set(cells.map(c => key(c[0], c[1])));
    if (T.fam !== 'A') {
      for (let i = 0; i < L; i++) { const d = dirOf(cells[i], cells[i + 1]); if (d === 'up' && i > 0) { const x = cells[i][0] + 1, y = cells[i][1]; if (x < w) { map.walls.push([x, y]); } } }
      // ปลายช่วงสุดท้ายก่อนธงไม่ต้องมีกำแพง: ธงอยู่ท้ายช่วงวิ่งสุดท้าย
      for (const c of map.walls) keep.add(key(c[0], c[1]));
      for (let i = 0; i < L; i++) { const c = cells[i]; if (dirOf(cells[i], cells[i + 1]) === 'up') keep.add(key(c[0], c[1] - 2)); }   // ช่องเหนือจุดลงหลังเลี้ยวขึ้นต้องไม่เป็นกำแพง
    }
    const ids = pickMonsters(4, n, (T.mo || 0) + 1, rng, [20]), bossHere = !!T.boss, monIdx = [];
    if (bossHere) { monIdx.push(L - 1); avoid.add(L - 1); }
    const cand = spread(rng, 2, L - 1, (T.mo || 0), avoid);
    cand.forEach(i => { monIdx.push(i); avoid.add(i); });
    monIdx.sort((a, b) => a - b).forEach((i, k) => { const boss = bossHere && i === L - 1; map.mons.push({ x: cells[i][0], y: cells[i][1], m: boss ? WORLDS[3].boss : ids[k % ids.length], hp: boss ? 2 : 1 }); });
    spread(rng, 1, L - 1, 2, new Set(monIdx.concat([0, L]))).forEach(i => map.stars.push(cells[i].slice()));
    decorate(map, cells, rng, { pits: T.fam === 'A' ? 2 : 1, wallRatio: T.fam === 'A' ? 0.5 : 0.1, keep });
    const lvl = { map, sol, kind: 'build', pal: palette({ atk: true, until: true, ifs }) };
    const r = E.run({ map }, sol); if (!r.win || r.collected < r.totalStars) return null;
    return lvl;
  }

  /* ---------- โลก 6: โปรแกรมย่อย ---------- */
  const W6 = [null,
    { fam: 'F', U: ['right', 'up', 'right'], k: 2 }, { fam: 'F', U: ['right', 'down', 'right', 'right'], k: 2 }, { fam: 'F', U: ['up', 'right', 'down'], k: 3 },
    { fam: 'F', U: ['down', 'right', 'up', 'right'], k: 2 }, { fam: 'F', U: ['up', 'right', 'down', 'right', 'right'], k: 2 },
    { fam: 'N', a: 2, b: 3 }, { fam: 'N', a: 2, b: 4 }, { fam: 'N', a: 2, b: 5 }, { fam: 'G', k: 2 }, { fam: 'G', k: 2, boss: true }];
  function genW6(n, rng) {
    const T = W6[n], tokens = []; let sol;
    if (T.fam === 'F') {
      for (let i = 0; i < T.k; i++) { T.U.forEach(t => tokens.push(t)); if (i < T.k - 1) tokens.push('right'); }
      sol = P(T.k === 2 ? [call('A'), mv('right'), call('A')] : [rep(T.k - 1, call('A'), mv('right')), call('A')], { A: T.U.map(t => mv(t)) });
    } else if (T.fam === 'N') {
      for (let a = 0; a < T.a; a++) { for (let b = 0; b < T.b; b++) tokens.push('right'); tokens.push('down'); for (let b = 0; b < T.b; b++) tokens.push('left'); tokens.push('down'); }
      for (let b = 0; b < T.b; b++) tokens.push('right');
      sol = P([rep(T.a, rep(T.b, mv('right')), mv('down'), rep(T.b, mv('left')), mv('down')), rep(T.b, mv('right'))]);
    } else {
      // ท่า 'ฟันแล้วก้าว' เก็บเป็นโปรแกรมย่อย A: แต่ละรอบ ฟัน-ก้าว สองครั้ง แล้วขึ้นและก้าวไปอีกที (ให้หันขวาก่อนรอบถัดไป)
      for (let i = 0; i < T.k; i++) tokens.push('atk', 'right', 'atk', 'right', 'up', 'right');
      if (T.boss) tokens.push('atk', 'atk', 'right');
      sol = P([rep(T.k, call('A'), call('A'), mv('up'), mv('right'))].concat(T.boss ? [rep(2, atk()), mv('right')] : []), { A: [atk(), mv('right')] });
    }
    const R = cellsFromMoves(tokens, [0, 0]), w = Math.max(4, R.w), h = Math.max(3, R.h), cells = R.cells.map(c => [c[0], c[1] + Math.floor((h - R.h) / 2)]);
    const map = skeleton(cells, w, h), L = cells.length - 1;
    if (T.fam === 'G') {
      const ids = pickMonsters(6, n, 2 * T.k + 1, rng, [32]); let bi = 0;
      R.atkAt.forEach(a => { const next = cells[a.from + 1]; const ex = map.mons.find(m => m.x === next[0] && m.y === next[1]); if (ex) { ex.hp++; return; } map.mons.push({ x: next[0], y: next[1], m: ids[bi++ % ids.length], hp: 1 }); });
      if (T.boss) map.mons[map.mons.length - 1].m = WORLDS[5].boss;
    }
    const mset = new Set(map.mons.map(m => key(m.x, m.y))), noStar = new Set([0, L]);
    cells.forEach((c, i) => { if (mset.has(key(c[0], c[1]))) noStar.add(i); });
    spread(rng, 1, L - 1, 3, noStar).forEach(i => map.stars.push(cells[i].slice()));
    decorate(map, cells, rng, { pits: 2, wallRatio: T.fam === 'N' ? 0 : 0.1 });
    return { map, sol, kind: 'build', pal: palette({ atk: T.fam === 'G', rep: true, call: T.fam !== 'N' }), fn: T.fam !== 'N' };
  }

  /* ---------- โลก 5: ซ่อมบั๊ก (ดัดแปลงเฉลยของด่านโลกอื่นให้ผิดหนึ่ง-สองจุด) ---------- */
  function listBlocks(prog) { const out = []; const walk = l => (l || []).forEach(b => { out.push(b); walk(b.body); walk(b.other); }); walk(prog.main); return out; }
  function mutate(prog, rng, kinds) {
    const p = E.cloneProg(prog), all = listBlocks(p);
    const lists = []; const collect = l => { lists.push(l); l.forEach(b => { if (b.body) collect(b.body); if (b.other) collect(b.other); }); }; collect(p.main);
    const k = pick(rng, kinds); let desc = '';
    const mvs = all.filter(b => b.t === 'mv'), reps = all.filter(b => b.t === 'rep'), ifs = all.filter(b => b.t === 'if');
    if (k === 'dir' && mvs.length) { const b = pick(rng, mvs), nd = pick(rng, ['up', 'down', 'left', 'right'].filter(d => d !== b.d)); b.d = nd; desc = 'ใบทิศผิด'; }
    else if (k === 'del') { const l = pick(rng, lists.filter(x => x.length > 1)); if (!l) return null; l.splice(Math.floor(rng() * l.length), 1); desc = 'ขาดการ์ดไปหนึ่งใบ'; }
    else if (k === 'extra') { const l = pick(rng, lists); l.splice(Math.floor(rng() * (l.length + 1)), 0, mv(pick(rng, ['up', 'down', 'right']))); desc = 'มีการ์ดเกิน'; }
    else if (k === 'swap') { const l = pick(rng, lists.filter(x => x.length > 2)); if (!l) return null; const i = Math.floor(rng() * (l.length - 1)); [l[i], l[i + 1]] = [l[i + 1], l[i]]; desc = 'สลับลำดับ'; }
    else if (k === 'count' && reps.length) { const b = pick(rng, reps); b.n = Math.max(1, b.n + (rng() < 0.5 ? -1 : 1) * (1 + Math.floor(rng() * 2))); desc = 'วนผิดรอบ'; }
    else if (k === 'cond' && ifs.length) { const b = pick(rng, ifs); if (b.c === 'monster') b.c = 'wall'; else b.c = 'monster'; desc = 'เงื่อนไขผิด'; }
    else if (k === 'branch' && ifs.length) { const b = pick(rng, ifs); const t = b.body; b.body = b.other; b.other = t; desc = 'ผลของถ้า/ไม่งั้นสลับข้าง'; }
    else return null;
    return { prog: p, desc };
  }
  const W5 = [null,
    { base: [1, 2], kinds: ['dir'] }, { base: [1, 3], kinds: ['dir', 'extra'] }, { base: [1, 4], kinds: ['dir', 'del'] },
    { base: [1, 5], kinds: ['del'] }, { base: [2, 4], kinds: ['swap'] }, { base: [3, 4], kinds: ['count'] },
    { base: [3, 5], kinds: ['count', 'dir'] }, { base: [4, 1], kinds: ['cond'] }, { base: [4, 4], kinds: ['branch', 'cond'] }, { base: [3, 10], kinds: ['count', 'dir'], two: true }];
  function genW5(n, rng, seed) {
    const T = W5[n];
    for (let att = 0; att < 200; att++) {
      const base = build(T.base[0], T.base[1], (seed * 31 + att * 7 + 3) >>> 0, true); let prog = base.sol, descs = [], ok = true;
      for (let m = 0; m < (T.two ? 2 : 1); m++) { const r = mutate(prog, rng, T.kinds); if (!r) { ok = false; break; } prog = r.prog; descs.push(r.desc); }
      if (!ok) continue;
      const level = { map: base.map }, res = E.run(level, prog);
      if (res.win || E.cardCount(prog) === 0) continue;
      base.map.mons.forEach(m => { if (m.hp === 2) m.m = WORLDS[4].boss; });
      return { map: base.map, sol: base.sol, pre: prog, bug: descs.join(' + '), kind: 'fix', pal: base.pal, baseFn: base.fn };
    }
    throw new Error('สร้างด่านโลก 5 ไม่สำเร็จ ' + n);
  }

  function build(world, n, seed, raw) {
    const rng = rngOf(seed);
    const g = world === 1 ? genW1(n, rng) : world === 2 ? genW2(n, rng) : world === 3 ? genW3(n, rng) : world === 4 ? genW4(n, rng) : world === 6 ? genW6(n, rng) : genW5(n, rng, seed);
    return g;
  }
  // ด่านสำเร็จรูป: เติมชื่อ คำใบ้ ดาว (par/limit) และสลับการ์ดของด่านแบบเรียงลำดับ
  function makeLevel(world, n, seed) {
    seed = seed == null ? world * 1009 + n * 37 + 11 : seed;
    const g = build(world, n, seed), W = WORLDS[world - 1], boss = n === 10;
    const par = E.cardCount(g.sol), lv = {
      world, id: n, seed, title: TITLES[world - 1][n - 1], kind: g.kind, boss, map: g.map, sol: g.sol, par, palette: g.pal, hero: W.hero, bg: W.bg, hasFn: !!g.fn || world === 6 && g.pal.some(c => c.t === 'call'),
      desc: boss ? 'ด่านบอส! ใช้ทุกอย่างที่เรียนมาในโลกนี้ และบอสต้องฟัน 2 ครั้ง' : W.desc, hint: HINTS[world - 1], bug: g.bug || null
    };
    if (world === 3) lv.limit = par + 1; else if (world === 6 && g.fn) lv.limit = par + 2; else lv.limit = null;
    if (g.kind === 'order') {
      const rng = rngOf(seed ^ 0x9e3779b1); let main = g.sol.main, shuffled = null;
      for (let a = 0; a < 60; a++) { const s = shuffle(main, rng); if (!E.run({ map: g.map }, P(s)).win) { shuffled = s; break; } }
      lv.pre = P(shuffled || main.slice().reverse()); lv.palette = [];
    }
    if (g.kind === 'fix') { lv.pre = g.pre; lv.limit = Math.max(E.cardCount(g.pre), E.cardCount(g.sol)) + 3; if (g.baseFn) lv.hasFn = true; }
    return lv;
  }
  const cache = {};
  function getLevel(world, n) { const k = world + ':' + n; return cache[k] || (cache[k] = makeLevel(world, n)); }

  const api = { WORLDS, TITLES, MON_NAME, NORMAL, makeLevel, getLevel, genPath, rngOf, shuffle, mv, atk, rep, until, iff, call, P };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ST_LV = api;
})(typeof window !== 'undefined' ? window : globalThis);
