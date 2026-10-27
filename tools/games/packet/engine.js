/* Packet Express: ตรรกะของเกม (ไม่แตะภาพ) ใช้ทั้งในเกมและในการทดสอบด้วย Node
   เครือข่ายเป็นกราฟมีทิศทาง: แพ็กเก็ตวิ่งตามสาย ถึงเราเตอร์แล้วออกทางที่สวิตช์ชี้อยู่ ถึงเซิร์ฟเวอร์/ไฟร์วอลล์แล้วนับว่าส่งถึง
   ตารางเวลาแพ็กเก็ตสร้างจาก seed แล้วตรวจด้วย "ผู้เล่นสมบูรณ์แบบ" (oracle) ว่าทำได้จริงและคนกดทัน ก่อนให้เล่นเสมอ */
(function (root) {
  'use strict';
  const X0 = 190, DX = 125, Y0 = 156, DY = 88, PKT_GAP = 78;   // พิกัดหน้าจอ และระยะห่างต่ำสุดของแพ็กเก็ตบนสายเดียวกัน (พิกเซล)
  let D = null;
  const bind = d => { D = d; };
  const rngOf = seed => { if (seed == null) return Math.random; let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const shuffle = (arr, rng) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- กราฟเครือข่าย ---------- */
  const cache = {};
  // สายแบบหักมุม: 'h' ออกแนวนอนก่อนแล้วหักที่สัดส่วน f ของระยะ x   'v' ออกแนวตั้งก่อน (ขึ้น/ลง) แล้วค่อยวิ่งไปแนวนอน
  function elbow(a, b, mode, f) {
    if (Math.abs(a.y - b.y) < 1) return [[a.x, a.y], [b.x, b.y]];
    if (mode === 'v') return [[a.x, a.y], [a.x, b.y], [b.x, b.y]];
    let xm = a.x + (b.x - a.x) * (f == null ? 0.5 : f);
    if (b.x - a.x > 110) xm = Math.max(a.x + 56, Math.min(xm, b.x - 44));
    return [[a.x, a.y], [xm, a.y], [xm, b.y], [b.x, b.y]];
  }
  // ทางออกของเราเตอร์แต่ละทางต้องออกคนละทิศ ลูกศรบนสวิตช์จึงชี้ตรงกับสายที่ไปจริง: ทางที่ไกลสุดของฝั่งบน/ล่างออกแนวตั้ง ทางอื่นออกแนวนอน
  // สายที่ไปรวมกับสายอื่นที่โหนดเดียวกัน (ทางเข้าเกิน 1) หักมุมคนละตำแหน่ง (0.35 จากข้างบน 0.65 จากข้างล่าง) ไม่ให้ดูเป็นสายเส้นเดียวเชื่อมโหนดสองตัว
  const V_MIN = 48;
  function exitModes(G, N, id) {
    const a = G.nodes[id], res = {}, ins = {};
    N.links.forEach(l => { ins[l[1]] = (ins[l[1]] || 0) + 1; });
    const outs = N.links.filter(l => l[0] === id).map(l => ({ id: l[0] + '>' + l[1], dy: G.nodes[l[1]].y - a.y, merge: ins[l[1]] > 1 && Math.abs(G.nodes[l[1]].y - a.y) > 1 }));
    outs.filter(o => o.merge).forEach(o => { res[o.id] = { mode: 'h', f: o.dy > 0 ? 0.35 : 0.65 }; });
    if (a.t !== 'rtr') return res;
    ['up', 'down'].forEach(dir => {
      const g = outs.filter(o => !o.merge && (dir === 'up' ? o.dy < -1 : o.dy > 1)).sort((p, q) => Math.abs(q.dy) - Math.abs(p.dy));
      g.forEach((o, i) => { res[o.id] = (i === 0 && Math.abs(o.dy) >= V_MIN) ? { mode: 'v' } : { mode: 'h', f: i === 0 ? 0.5 : 0.42 }; });
    });
    return res;
  }
  function build(key) {
    if (cache[key]) return cache[key];
    const N = D.NETS[key], G = { key, nodes: {}, edges: {}, routers: [], sources: [], servers: {}, fw: null, order: Object.keys(N.nodes) };
    G.order.forEach(id => { const n = N.nodes[id]; G.nodes[id] = { id, t: n[0], c: n[1], r: n[2], x: X0 + n[1] * DX, y: Y0 + n[2] * DY, sym: n[3] || null, outs: [], ins: [] }; });
    const modes = {}; G.order.forEach(id => Object.assign(modes, exitModes(G, N, id)));
    N.links.forEach(l => {
      const a = G.nodes[l[0]], b = G.nodes[l[1]], id = l[0] + '>' + l[1], md = modes[id] || {}, pts = elbow(a, b, md.mode, md.f); let len = 0; const seg = [];
      for (let i = 1; i < pts.length; i++) { const dl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(dl); len += dl; }
      G.edges[id] = { id, from: a.id, to: b.id, pts, seg, len }; a.outs.push(id); b.ins.push(id);
    });
    G.order.forEach(id => { const n = G.nodes[id]; if (n.t === 'rtr') G.routers.push(id); else if (n.t === 'src') G.sources.push(id); else if (n.t === 'srv') G.servers[n.sym] = id; else if (n.t === 'fw') G.fw = id; });
    // ปลายทางที่ไปถึงได้จากสายแต่ละเส้น (ไม่นับสายขาด) ใช้แปะสัญลักษณ์บนสายให้ผู้เล่นเห็นว่าทางไหนไปไหน
    const memo = {}, ORDER = ['A', 'B', 'C', 'D', 'virus'];
    const reachSyms = nid => {
      if (memo[nid]) return memo[nid]; const n = G.nodes[nid]; let set = {};
      if (n.t === 'srv') set[n.sym] = true; else if (n.t === 'fw') set.virus = true; else n.outs.forEach(eid => Object.assign(set, reachSyms(G.edges[eid].to)));
      return (memo[nid] = set);
    };
    Object.keys(G.edges).forEach(eid => { const set = reachSyms(G.edges[eid].to); G.edges[eid].dests = ORDER.filter(k => set[k]); });
    return (cache[key] = G);
  }
  // ตำแหน่งและทิศของจุดที่ระยะ d บนสาย
  function posOn(G, edgeId, d) {
    const e = G.edges[edgeId]; let rem = Math.max(0, Math.min(e.len, d));
    for (let i = 0; i < e.seg.length; i++) {
      if (rem <= e.seg[i] || i === e.seg.length - 1) { const a = e.pts[i], b = e.pts[i + 1], f = e.seg[i] ? rem / e.seg[i] : 0; return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, a: Math.atan2(b[1] - a[1], b[0] - a[0]) }; }
      rem -= e.seg[i];
    }
    return { x: e.pts[0][0], y: e.pts[0][1], a: 0 };
  }

  /* ---------- หาทางไปปลายทาง (สายที่ขาดอยู่ใช้ไม่ได้) ---------- */
  function isGoal(n, dest) { return (n.t === 'srv' && n.sym === dest) || (n.t === 'fw' && dest === 'virus'); }
  // คืนรหัสสายแรกที่ควรออกจากโหนด from เพื่อไปถึง dest ด้วยทางสั้นที่สุด หรือ null ถ้าไปไม่ได้
  function route(G, from, dest, cut) {
    cut = cut || {}; const dist = { [from]: 0 }, first = {}, done = {}, q = [from];
    while (q.length) {
      q.sort((a, b) => dist[a] - dist[b]); const u = q.shift(); if (done[u]) continue; done[u] = true;
      if (u !== from && isGoal(G.nodes[u], dest)) return first[u];
      G.nodes[u].outs.forEach(eid => {
        if (cut[eid]) return; const e = G.edges[eid], nd = dist[u] + e.len;
        if (dist[e.to] == null || nd < dist[e.to]) { dist[e.to] = nd; first[e.to] = u === from ? eid : first[u]; q.push(e.to); }
      });
    }
    return null;
  }
  const reach = (G, from, dest) => route(G, from, dest, {}) != null;

  /* ---------- สถานะและการเดินเกม ---------- */
  function newState(run) {
    const S = { run, G: run.G, t: 0, packets: [], pid: 1, si: 0, outs: {}, cutNow: {}, correct: 0, wrong: 0, lost: 0, delivered: 0, streak: 0, bestStreak: 0, score: 0, arrivals: {}, events: [] };
    run.G.routers.forEach(id => { S.outs[id] = 0; S.arrivals[id] = []; });
    return S;
  }
  const isDone = S => S.si >= S.run.schedule.length && S.packets.length === 0;
  function updateCuts(S) { S.cutNow = {}; S.run.cuts.forEach(c => { if (S.t >= c.t0 && S.t < c.t1) S.cutNow[c.edge] = true; }); }
  function spawn(S, item) {
    const src = S.G.nodes[item.src], eid = src.outs[0];
    if (S.packets.some(p => p.edge === eid && p.d < PKT_GAP)) return false;
    S.packets.push({ id: S.pid++, edge: eid, d: 0, dest: item.dest, name: item.name || null, src: item.src, born: S.t, alive: true }); return true;
  }
  function settle(S, p, ok, node, why) {
    p.alive = false; S.delivered++;
    if (ok) { S.correct++; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak); S.score += points(S.streak - 1); } else { S.wrong++; S.streak = 0; }
    S.events.push({ t: S.t, id: p.id, ok, node: node ? node.id : null, why: why || null, dest: p.dest, x: node ? node.x : 0, y: node ? node.y : 0 });
  }
  function step(S, dt) {
    S.t += dt; updateCuts(S); const run = S.run, G = S.G, spd = run.speed;
    while (S.si < run.schedule.length && S.t >= run.schedule[S.si].t) { if (!spawn(S, run.schedule[S.si])) break; S.si++; }
    S.packets.forEach(p => {
      if (!p.alive) return; p.d += spd * dt;
      let e = G.edges[p.edge];
      while (p.alive && p.d >= e.len) {
        p.d -= e.len; const node = G.nodes[e.to];
        if (node.t === 'rtr') {
          const idx = S.outs[node.id], eid = node.outs[idx]; S.arrivals[node.id].push({ t: S.t, id: p.id, dest: p.dest, out: idx });
          if (S.cutNow[eid]) { settle(S, p, false, node, 'cut'); break; }
          p.edge = eid; e = G.edges[eid];
        } else if (node.t === 'relay') { p.edge = node.outs[0]; e = G.edges[p.edge]; }
        else { settle(S, p, node.t === 'srv' ? p.dest === node.sym : p.dest === 'virus', node, null); }
      }
    });
    S.packets = S.packets.filter(p => p.alive);
  }
  function toggle(S, rid) { const n = S.G.nodes[rid]; S.outs[rid] = (S.outs[rid] + 1) % n.outs.length; return S.outs[rid]; }
  const points = streak => 100 * Math.min(5, 1 + Math.floor(streak / 4));
  const formTier = streak => (streak >= 12 ? 3 : streak >= 8 ? 2 : streak >= 4 ? 1 : 0);
  const accuracy = (c, n) => (n ? Math.round(c * 100 / n) : 100);
  const stars = (win, acc) => (!win ? 0 : acc >= 95 ? 3 : acc >= 80 ? 2 : 1);

  /* ---------- สถานะเส้นทางตามสวิตช์ปัจจุบัน (ใช้วาดสัญลักษณ์กลางสวิตช์และเส้นสีส้ม) ---------- */
  // ปลายทางที่เราเตอร์ rid กำลังส่งไป ตามสวิตช์ทุกตัวต่อจากนี้ คืน 'A'-'D' | 'virus' | null
  function finalDest(S, rid) {
    const G = S.G; let n = G.nodes[rid], guard = 0;
    while (n && guard++ < 24) {
      if (n.t === 'srv') return n.sym; if (n.t === 'fw') return 'virus';
      const eid = n.t === 'rtr' ? n.outs[S.outs[n.id]] : n.outs[0]; if (!eid) return null; n = G.nodes[G.edges[eid].to];
    }
    return null;
  }
  // สายที่แพ็กเก็ตจากต้นทางจะวิ่งผ่านจริงตามสวิตช์ตอนนี้ (id สาย -> true)
  function liveEdges(S) {
    const live = {}, G = S.G;
    G.sources.forEach(sid => { let n = G.nodes[sid], guard = 0; while (n && guard++ < 24 && n.outs.length) { const eid = n.t === 'rtr' ? n.outs[S.outs[n.id]] : n.outs[0]; live[eid] = true; n = G.nodes[G.edges[eid].to]; } });
    return live;
  }

  /* ---------- ผู้เล่นสมบูรณ์แบบ (ใช้ตรวจด่านและเป็นคำใบ้โหมดฝึก) ---------- */
  // แพ็กเก็ตที่ใกล้เราเตอร์ r ที่สุดบนสายขาเข้า
  function nearestTo(S, rid) {
    let best = null, rem = 1e9;
    S.packets.forEach(p => { const e = S.G.edges[p.edge]; if (e.to === rid && e.len - p.d < rem) { rem = e.len - p.d; best = p; } });
    return best ? { p: best, rem } : null;
  }
  function oracleSet(S) {
    S.G.routers.forEach(rid => {
      const n = nearestTo(S, rid); if (!n) return;
      const hop = route(S.G, rid, n.p.dest, S.cutNow); if (hop) S.outs[rid] = S.G.nodes[rid].outs.indexOf(hop);
    });
  }
  // คำแนะนำสำหรับโหมดฝึก: เราเตอร์ไหนควรหมุนไปทางไหน (เฉพาะที่มีแพ็กเก็ตกำลังจะถึงใน 4 วินาที)
  function advise(S) {
    const out = [];
    S.G.routers.forEach(rid => {
      const n = nearestTo(S, rid); if (!n) return; const secs = n.rem / S.run.speed; if (secs > 4) return;
      const hop = route(S.G, rid, n.p.dest, S.cutNow); if (!hop) return;
      const need = S.G.nodes[rid].outs.indexOf(hop); out.push({ id: rid, need, cur: S.outs[rid], secs, dest: n.p.dest });
    });
    return out;
  }
  // รันด่านทั้งด่านด้วยนโยบาย: 'oracle' หมุนถูกทุกครั้ง 'idle' ไม่แตะสวิตช์เลย
  function simulate(run, policy) {
    const S = newState(run), dt = 1 / 60; let guard = 0;
    while (!isDone(S) && guard++ < 60 * 400) { if (policy === 'oracle') oracleSet(S); step(S, dt); }
    return S;
  }
  // คนกดทันไหม: เราเตอร์เดียวกันรับแพ็กเก็ตที่ต้องออกคนละทางติดกัน ต้องห่างอย่างน้อย 0.45 + 0.5 x จำนวนครั้งที่ต้องแตะ วินาที
  function feasibility(S) {
    let minSlack = 1e9, minAny = 1e9;
    S.G.routers.forEach(rid => {
      const arr = S.arrivals[rid], n = S.G.nodes[rid].outs.length;
      for (let i = 1; i < arr.length; i++) {
        const dt = arr[i].t - arr[i - 1].t; minAny = Math.min(minAny, dt);
        const taps = (arr[i].out - arr[i - 1].out + n) % n; if (taps) minSlack = Math.min(minSlack, dt - (0.45 + 0.5 * taps));
      }
    });
    return { minSlack, minAny };
  }

  /* ---------- สร้างตารางแพ็กเก็ตของด่าน ---------- */
  function makeSchedule(level, rng, relax) {
    const G = build(level.net), n = level.count, gap = level.gap * (relax ? 1.2 : 1), jit = relax ? 0.1 : level.jitter;
    const nVirus = level.virus ? Math.max(1, Math.round(n * level.virus)) : 0;
    const virusAt = new Set(shuffle(Array.from({ length: n - 2 }, (_, i) => i + 2), rng).slice(0, nVirus));
    let bag = []; const items = [];
    for (let i = 0; i < n; i++) {
      const isVirus = virusAt.has(i); let dest;
      if (isVirus) dest = 'virus'; else { if (!bag.length) bag = shuffle(level.dests, rng); dest = bag.pop(); }
      const srcs = G.sources.filter(s => reach(G, s, dest)); const src = srcs[(srcs.length > 1 ? i : 0) % srcs.length];
      const t = 1.4 + i * gap + (rng() * 2 - 1) * jit * gap * 0.5;
      const item = { t: Math.round(t * 100) / 100, src, dest }; if (level.dns && !isVirus) { const names = D.DNS_NAMES[dest]; item.name = level.boss ? names[Math.floor(rng() * names.length)] : names[0]; }
      items.push(item);
    }
    items.sort((a, b) => a.t - b.t);
    return items;
  }
  function makeRun(level, seed) {
    const G = build(level.net), rng = rngOf(seed); let best = null;
    for (let attempt = 0; attempt < 160; attempt++) {
      const relax = attempt >= 100, schedule = makeSchedule(level, rng, relax), end = schedule[schedule.length - 1].t + 6;
      const cuts = (level.cuts || []).map(c => ({ edge: c.edge, t0: Math.round(end * c.from * 10) / 10, t1: Math.round(end * c.to * 10) / 10 }));
      const run = { level, G, schedule, cuts, speed: level.speed, end };
      const S = simulate(run, 'oracle'), f = feasibility(S);
      run.ok = S.wrong === 0 && S.correct === schedule.length && f.minSlack >= (relax ? 0.1 : 0.3) && f.minAny >= 0.3; run.slack = f.minSlack;   // เหลือเวลาให้คนกดทันอย่างน้อย 0.3 วินาที
      if (run.ok) return run;
      if (!best || (S.wrong < best.w)) best = { run, w: S.wrong };
    }
    return best.run;
  }
  // ชื่อโดเมนและสัญลักษณ์ที่โชว์ในสมุด DNS ของด่านนั้น
  function dnsBook(level) { return level.dns ? level.dests.map(s => ({ sym: s, names: level.boss ? D.DNS_NAMES[s] : [D.DNS_NAMES[s][0]] })) : null; }

  const api = { bind, rngOf, shuffle, build, posOn, route, reach, finalDest, liveEdges, newState, step, toggle, isDone, points, formTier, accuracy, stars, oracleSet, advise, simulate, feasibility, makeSchedule, makeRun, dnsBook, nearestTo, PKT_GAP, X0, DX, Y0, DY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PX = api;
})(typeof window !== 'undefined' ? window : globalThis);
