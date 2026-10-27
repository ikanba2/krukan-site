/* ทดสอบ Packet Express: เครือข่ายถูกต้อง ทุกด่านทุก seed ทำได้จริงด้วยผู้เล่นสมบูรณ์แบบและคนกดทัน ไม่ทำอะไรเลยต้องแพ้ รัน: node tools/games/packet/test_engine.js */
'use strict';
const PX = require('./engine.js');
const D = require('./levels.js');
PX.bind(D);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (ได้ ${JSON.stringify(a)} ต้องการ ${JSON.stringify(b)})`);

// เครือข่าย
Object.keys(D.NETS).forEach(k => {
  const G = PX.build(k);
  ok(G.sources.length >= 1, k + ' มีต้นทาง');
  G.routers.forEach(r => { const n = G.nodes[r]; ok(n.outs.length >= 2 && n.outs.length <= 3, `${k}.${r} มี 2-3 ทางออก`); ok(n.ins.length >= 1, `${k}.${r} มีทางเข้า`); });
  Object.keys(G.nodes).forEach(id => { const n = G.nodes[id]; if (n.t === 'src') ok(n.outs.length === 1, `${k}.${id} ต้นทางมีทางออกเดียว`); if (n.t === 'relay') ok(n.outs.length === 1 && n.ins.length >= 1, `${k}.${id} จุดต่อสายมีทางออกเดียว`); if (n.t === 'srv' || n.t === 'fw') ok(n.outs.length === 0, `${k}.${id} ปลายทางไม่มีทางออก`); });
  Object.keys(G.servers).forEach(s => G.sources.forEach(src => ok(PX.reach(G, src, s), `${k}: ${src} ไปถึง ${s} ได้`)));
  Object.keys(G.nodes).forEach(id => { const n = G.nodes[id]; ok(n.x >= 120 && n.x <= 1160 && n.y >= 110 && n.y <= 560, `${k}.${id} อยู่ในกรอบ (${n.x},${n.y})`); });
  // ทางออกของเราเตอร์ต้องออกคนละทิศ (ลูกศรบนสวิตช์ชี้ตรงกับสาย) และสายพี่น้องห้ามทับกันนอกจุดเริ่ม
  const dirOf = e => { const p0 = e.pts[0], p1 = e.pts[1]; return Math.round(Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI); };
  const segs = e => e.pts.slice(1).map((p, i) => [e.pts[i], p]);
  const overlap = (s1, s2) => {   // ส่วนตรงแนวเดียวกันที่ทับกันเกินความยาว 6 พิกเซล
    const hor = s => Math.abs(s[0][1] - s[1][1]) < 0.5, ver = s => Math.abs(s[0][0] - s[1][0]) < 0.5;
    if (hor(s1) && hor(s2) && Math.abs(s1[0][1] - s2[0][1]) < 0.5) return Math.min(Math.max(s1[0][0], s1[1][0]), Math.max(s2[0][0], s2[1][0])) - Math.max(Math.min(s1[0][0], s1[1][0]), Math.min(s2[0][0], s2[1][0])) > 6;
    if (ver(s1) && ver(s2) && Math.abs(s1[0][0] - s2[0][0]) < 0.5) return Math.min(Math.max(s1[0][1], s1[1][1]), Math.max(s2[0][1], s2[1][1])) - Math.max(Math.min(s1[0][1], s1[1][1]), Math.min(s2[0][1], s2[1][1])) > 6;
    return false;
  };
  G.routers.forEach(r => {
    const n = G.nodes[r], es = n.outs.map(id => G.edges[id]), dirs = es.map(dirOf);
    ok(new Set(dirs).size === dirs.length, `${k}.${r} ทางออกแต่ละทางออกคนละทิศ (${dirs.join(',')})`);
    for (let i = 0; i < es.length; i++) for (let j = i + 1; j < es.length; j++) ok(!segs(es[i]).some(a => segs(es[j]).some(b => overlap(a, b))), `${k}.${r} สาย ${es[i].id} กับ ${es[j].id} ไม่ทับกัน`);
  });
  // สัญลักษณ์ปลายทางบนสายต้องมีทุกเส้น และสายที่ออกจากเราเตอร์ไปถึงอย่างน้อยหนึ่งปลายทาง
  Object.keys(G.edges).forEach(id => ok(G.edges[id].dests.length >= 1, `${k}.${id} มีปลายทางที่ไปถึงได้`));
});

// ด่าน
eq(D.LEVELS.length, 10, 'มี 10 ด่าน');
D.LEVELS.forEach((L, i) => {
  eq(L.id, i + 1, 'id ด่าน ' + (i + 1));
  ok(!/[→↗←↘]/.test(L.title + L.desc + L.concept), 'ด่าน ' + L.id + ' ไม่มีลูกศรยาว');
  ok(L.gap * L.speed >= 2.2 * PX.PKT_GAP, `ด่าน ${L.id} แพ็กเก็ตห่างกันพอ (${Math.round(L.gap * L.speed)} px)`);
  const G = PX.build(L.net);
  L.dests.forEach(s => ok(G.servers[s], `ด่าน ${L.id} มีเซิร์ฟเวอร์ ${s}`));
  if (L.virus) ok(G.fw, `ด่าน ${L.id} มีไฟร์วอลล์`);
  (L.cuts || []).forEach(c => ok(G.edges[c.edge] && c.from < c.to && c.from >= 0 && c.to <= 1, `ด่าน ${L.id} สายขาด ${c.edge} ถูกต้อง`));
  let bad = 0, slackMin = 1e9, idleWins = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const run = PX.makeRun(L, seed); if (!run.ok) bad++;
    slackMin = Math.min(slackMin, run.slack);
    eq(run.schedule.length, L.count, `ด่าน ${L.id} seed ${seed} จำนวนแพ็กเก็ต`);
    const S = PX.simulate(run, 'oracle'); ok(S.correct === L.count && S.wrong === 0, `ด่าน ${L.id} seed ${seed} ผู้เล่นสมบูรณ์แบบส่งถูกหมด (${S.correct}/${L.count} ผิด ${S.wrong})`);
    const I = PX.simulate(run, 'idle'); if (I.wrong === 0) idleWins++;
    if (L.dns) ok(run.schedule.every(it => it.dest === 'virus' || it.name), `ด่าน ${L.id} แพ็กเก็ต DNS มีชื่อ`);
    if (L.virus) ok(run.schedule.some(it => it.dest === 'virus'), `ด่าน ${L.id} มีไวรัส`);
    // แพ็กเก็ตสองต้นทางต้องมาจากทั้งสองต้นทาง
    if (G.sources.length > 1) ok(new Set(run.schedule.map(it => it.src)).size === G.sources.length, `ด่าน ${L.id} ใช้ทุกต้นทาง`);
  }
  ok(bad === 0, `ด่าน ${L.id} สร้างตารางผ่านการตรวจครบ 60 seed (ไม่ผ่าน ${bad})`);
  ok(idleWins === 0, `ด่าน ${L.id} ไม่แตะสวิตช์เลยต้องผิดเสมอ (ชนะ ${idleWins} ครั้ง)`);
  console.log(`ด่าน ${L.id} ${L.title}: ห่างสุดที่คนกดทัน slack ต่ำสุด ${slackMin.toFixed(2)} วินาที`);
});

// สัญลักษณ์กลางสวิตช์และเส้นทางสด
{
  const G = PX.build('n1'), run = PX.makeRun(D.LEVELS[0], 5), S = PX.newState(run);
  eq(G.edges['R1>A'].dests, ['A'], 'สาย R1>A ไป A อย่างเดียว'); eq(G.edges['S1>R1'].dests, ['A', 'B'], 'สายจากต้นทางไปได้ A และ B');
  eq(PX.finalDest(S, 'R1'), 'A', 'สวิตช์เริ่มต้นชี้ไป A'); PX.toggle(S, 'R1'); eq(PX.finalDest(S, 'R1'), 'B', 'สลับแล้วชี้ไป B');
  eq(Object.keys(PX.liveEdges(S)).sort(), ['R1>B', 'S1>R1'], 'เส้นทางสดตามสวิตช์');
  const G2 = PX.build('n3'), S2 = PX.newState(PX.makeRun(D.LEVELS[2], 3));
  eq(PX.finalDest(S2, 'R1'), 'A', 'ด่าน 3 R1 ชี้ไป A ผ่าน R2'); PX.toggle(S2, 'R2'); eq(PX.finalDest(S2, 'R1'), 'B', 'สลับ R2 แล้ว R1 ชี้ไป B'); PX.toggle(S2, 'R1'); eq(PX.finalDest(S2, 'R1'), 'C', 'สลับ R1 ไปทาง R3 ชี้ไป C');
  const G8 = PX.build('n8'); eq(G8.edges['R1>FW'].dests, ['virus'], 'สายไปไฟร์วอลล์เป็น virus'); eq(G8.edges['R1>R2'].dests, ['A', 'B'], 'R1>R2 ไป A และ B');
  const G9 = PX.build('n9'); eq(G9.edges['R1>R2'].dests, ['A', 'B', 'C'], 'ตาข่าย R1>R2 ไป A B C'); eq(G9.edges['R1>R3'].dests, ['B', 'C', 'D'], 'ตาข่าย R1>R3 ไป B C D');
}
// โลจิกพื้นฐาน
{
  const L = D.LEVELS[0], run = PX.makeRun(L, 5), S = PX.newState(run);
  eq(PX.toggle(S, 'R1'), 1, 'สลับสวิตช์เป็นทางที่ 2'); eq(PX.toggle(S, 'R1'), 0, 'สลับกลับเป็นทางที่ 1');
  eq(PX.route(PX.build('n1'), 'R1', 'B', {}), 'R1>B', 'เส้นทางไป B');
  const G6 = PX.build('n6');
  eq(PX.route(G6, 'R1', 'A', {}) != null, true, 'ด่านสายขาด: ไป A ได้เมื่อสายปกติ');
  eq(PX.route(G6, 'R1', 'A', { 'R1>P1': true }), 'R1>P2', 'สายบนขาดแล้วต้องใช้สายล่าง');
  eq(PX.route(G6, 'R1', 'A', { 'R1>P1': true, 'R1>P2': true }), null, 'ขาดทั้งสองสายไปไม่ได้');
  // ไม่มีแพ็กเก็ต: จบเมื่อส่งครบ
  ok(!PX.isDone(S), 'ยังไม่เริ่มยังไม่จบ');
}
eq([0, 3, 4, 7, 8, 12, 16, 40].map(PX.points), [100, 100, 200, 200, 300, 400, 500, 500], 'คะแนนตามคอมโบ');
eq([0, 3, 4, 8, 11, 12, 30].map(PX.formTier), [0, 0, 1, 2, 2, 3, 3], 'ร่างตามคอมโบ');
eq([PX.stars(true, 100), PX.stars(true, 95), PX.stars(true, 94), PX.stars(true, 80), PX.stars(true, 50), PX.stars(false, 100)], [3, 3, 2, 2, 1, 0], 'ดาว');
eq(PX.accuracy(9, 10), 90, 'ความแม่น');
// การแสดงตำแหน่งบนสาย
{
  const G = PX.build('n2'), e = G.edges['R1>A'];
  const a = PX.posOn(G, 'R1>A', 0), b = PX.posOn(G, 'R1>A', e.len);
  ok(Math.abs(a.x - G.nodes.R1.x) < 1 && Math.abs(a.y - G.nodes.R1.y) < 1, 'ต้นสายตรงโหนด');
  ok(Math.abs(b.x - G.nodes.A.x) < 1 && Math.abs(b.y - G.nodes.A.y) < 1, 'ปลายสายตรงโหนด');
}
// คำใบ้
{
  const L = D.LEVELS[1], run = PX.makeRun(L, 11), S = PX.newState(run); let got = 0;
  for (let i = 0; i < 60 * 12; i++) { PX.step(S, 1 / 60); if (PX.advise(S).length) got++; }
  ok(got > 0, 'โหมดฝึกมีคำใบ้เมื่อแพ็กเก็ตใกล้เราเตอร์');
}

console.log(`\nทดสอบผ่าน ${pass} ข้อ ไม่ผ่าน ${fail} ข้อ`);
process.exit(fail ? 1 : 0);
