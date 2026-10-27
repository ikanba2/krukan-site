/* Techno Folder (จัดโฟลเดอร์กับเทคโนสำหรับ ป.2-ป.3): ตรรกะของระบบไฟล์จำลอง (ไม่แตะไฟล์จริงในเครื่อง ไม่มีส่วนของ Phaser) ใช้ทดสอบด้วย node ได้
   ระบบไฟล์ fs เป็นข้อมูลล้วน (JSON) ทำสำเนาได้: { nodes:{id:node}, next, keys:{กุญแจ:id}, clip, visited, answers }
   โหนด: { id, name, kind:'d'(โฟลเดอร์)|'f'(ไฟล์), icon, parent, kids:[id], key, home, why, mode, from, copyOf }
     home = กุญแจของโฟลเดอร์ที่ไฟล์นี้ควรอยู่ · why = เหตุผลสั้น ๆ ของหมวด · mode = 'move'|'copy'|'junk'|'keep'|'restore' (โจทย์สั่งให้ทำอะไรกับไฟล์นี้)
     from = โฟลเดอร์เดิมก่อนถูกลบ (ใช้ตอนกู้คืน) · copyOf = ไฟล์ต้นฉบับของสำเนา
   โหนดพิเศษ 2 ตัว: 'root' = เดสก์ท็อป (โฟลเดอร์บนสุด) · 'bin' = ถังรีไซเคิล
   สเปกต้นไม้: { n:ชื่อ, f:ไอคอนไฟล์('doc'|'img'|'mus'|'vid') หรือ c:[ลูก...] ถ้าเป็นโฟลเดอร์, k:กุญแจ, h:home, w:why, m:mode }
   เป้าหมายของด่าน (goals) แต่ละข้อมี text (ภาษาเด็ก) และชนิด:
     in {k,f}        ไฟล์/โฟลเดอร์ k อยู่ตรง ๆ ในโฟลเดอร์ f ('root' = เดสก์ท็อป)
     inBin {k}       k อยู่ในถังรีไซเคิล
     copyIn {k,f}    มีสำเนาของ k อยู่ใน f และต้นฉบับ k ยังไม่ถูกลบ
     folder {p,names,key,bad}  มีโฟลเดอร์ชื่อใดชื่อหนึ่งใน names อยู่ตรง ๆ ใน p (ลงทะเบียนกุญแจ key ให้โฟลเดอร์นั้น) · bad = ชื่อลวงในตัวเลือก
     name {k,names,bad}        k มีชื่อใดชื่อหนึ่งใน names
     visit {f}       เปิดโฟลเดอร์ f ดูแล้ว
     answer {q}      ตอบคำถามข้อ q (level.quiz[q]) ถูก
   ตัวตรวจ judge() บอกว่าการกระทำหนึ่งเป็นความผิดพลาดหรือไม่ (ผู้เล่นพลาดแล้วไม่ทำจริง) ส่วน plan() สร้างลำดับการกระทำที่ทำให้ผ่านจากสถานะปัจจุบัน ใช้เป็นคำใบ้และใช้ทดสอบ */
(function (root) {
  'use strict';
  const ROOT = 'root', BIN = 'bin';
  const DEFAULT_NAME = 'โฟลเดอร์ใหม่';
  const BAD_CHARS = /[\\/:*?"<>|]/;
  const clone = x => JSON.parse(JSON.stringify(x));

  /* ---------- สร้างระบบไฟล์จากสเปก ---------- */
  function make(spec, binSpec) {
    const fs = { nodes: {}, next: 1, keys: {}, clip: null, visited: {}, answers: {} };
    fs.nodes[ROOT] = { id: ROOT, name: 'เดสก์ท็อป', kind: 'd', parent: null, kids: [] };
    fs.nodes[BIN] = { id: BIN, name: 'ถังรีไซเคิล', kind: 'd', parent: null, kids: [] };
    const add = (s, parent) => {
      const id = 'n' + fs.next++, n = { id, name: s.n, kind: s.c ? 'd' : 'f', icon: s.f || null, parent, kids: [], key: s.k || null, home: s.h || null, why: s.w || null, mode: s.m || null, from: null, copyOf: null };
      fs.nodes[id] = n; fs.nodes[parent].kids.push(id); if (n.key) fs.keys[n.key] = id;
      (s.c || []).forEach(c => add(c, id));
      return id;
    };
    (spec || []).forEach(s => add(s, ROOT));
    (binSpec || []).forEach(s => { const id = add(s, BIN); const n = fs.nodes[id]; n.from = s.from ? (s.from === 'root' ? ROOT : fs.keys[s.from]) : ROOT; });
    fs.keys.root = ROOT; fs.keys.bin = BIN;
    return fs;
  }

  /* ---------- ค้นหาและเส้นทาง ---------- */
  const node = (fs, id) => fs.nodes[id];
  const isFolder = n => !!n && n.kind === 'd';
  const idOf = (fs, k) => (fs.nodes[k] ? k : fs.keys[k] || null);          // รับได้ทั้ง id และกุญแจ
  function kids(fs, id) {                                                   // โฟลเดอร์มาก่อนไฟล์ แล้วเรียงตามลำดับที่เพิ่มเข้ามา (เหมือน Windows)
    const list = (fs.nodes[id] ? fs.nodes[id].kids : []);
    return list.filter(i => fs.nodes[i].kind === 'd').concat(list.filter(i => fs.nodes[i].kind === 'f'));
  }
  function isDesc(fs, id, anc) { let n = fs.nodes[id]; while (n) { if (n.id === anc) return true; n = n.parent ? fs.nodes[n.parent] : null; } return false; }
  function pathIds(fs, id) { const out = []; let n = fs.nodes[id]; while (n) { out.unshift(n.id); n = n.parent ? fs.nodes[n.parent] : null; } return out; }
  const pathNames = (fs, id) => pathIds(fs, id).map(i => fs.nodes[i].name);
  const inBin = (fs, id) => isDesc(fs, id, BIN) && id !== BIN;
  const norm = s => String(s).trim().toLowerCase();
  const taken = (fs, parent, name, except) => fs.nodes[parent].kids.some(i => i !== except && norm(fs.nodes[i].name) === norm(name));
  function uniqueName(fs, parent, base, suffix, except) {
    if (!taken(fs, parent, base, except)) return base;
    const first = suffix ? base + ' - ' + suffix : base;
    if (!taken(fs, parent, first, except)) return first;
    for (let i = 2; i < 99; i++) { const cand = first + ' (' + i + ')'; if (!taken(fs, parent, cand, except)) return cand; }
    return first;
  }

  /* ---------- การกระทำพื้นฐาน (คืน { ok, ... } หรือ { ok:false, why }) ---------- */
  function openFolder(fs, id) { if (!isFolder(fs.nodes[id])) return { ok: false, why: 'notfolder' }; fs.visited[id] = true; return { ok: true }; }

  function newFolder(fs, parent, name) {
    const p = fs.nodes[parent]; if (!isFolder(p) || parent === BIN) return { ok: false, why: 'notfolder' };
    const id = 'n' + fs.next++, nm = uniqueName(fs, parent, name || DEFAULT_NAME);
    fs.nodes[id] = { id, name: nm, kind: 'd', icon: null, parent, kids: [], key: null, home: null, why: null, mode: null, from: null, copyOf: null };
    p.kids.push(id); return { ok: true, id };
  }

  function rename(fs, id, name) {
    const n = fs.nodes[id]; if (!n || id === ROOT || id === BIN) return { ok: false, why: 'none' };
    const nm = String(name).trim(); if (!nm) return { ok: false, why: 'empty' }; if (BAD_CHARS.test(nm)) return { ok: false, why: 'chars' };
    if (taken(fs, n.parent, nm, id)) return { ok: false, why: 'dup' };
    n.name = nm; return { ok: true };
  }

  function detach(fs, id) { const p = fs.nodes[fs.nodes[id].parent]; p.kids = p.kids.filter(i => i !== id); }

  function move(fs, ids, dest) {
    if (dest === BIN) return del(fs, ids);
    const d = fs.nodes[dest]; if (!isFolder(d)) return { ok: false, why: 'notfolder' };
    const list = ids.filter(i => fs.nodes[i] && i !== ROOT && i !== BIN); if (!list.length) return { ok: false, why: 'none' };
    for (const i of list) {
      if (fs.nodes[i].parent === BIN) return { ok: false, why: 'inbin' };
      if (isDesc(fs, dest, i)) return { ok: false, why: 'self', id: i };
      if (fs.nodes[i].parent !== dest && taken(fs, dest, fs.nodes[i].name, i)) return { ok: false, why: 'dup', id: i };
    }
    const moved = list.filter(i => fs.nodes[i].parent !== dest); if (!moved.length) return { ok: false, why: 'same' };
    moved.forEach(i => { detach(fs, i); fs.nodes[i].parent = dest; d.kids.push(i); });
    return { ok: true, moved };
  }

  function copyTree(fs, id, parent, name, root) {
    const s = fs.nodes[id], nid = 'n' + fs.next++;
    fs.nodes[nid] = { id: nid, name, kind: s.kind, icon: s.icon, parent, kids: [], key: null, home: s.home, why: s.why, mode: root ? null : s.mode, from: null, copyOf: root ? id : s.copyOf };
    fs.nodes[parent].kids.push(nid);
    s.kids.forEach(k => copyTree(fs, k, nid, fs.nodes[k].name, false));
    return nid;
  }
  function copy(fs, ids, dest) {
    const d = fs.nodes[dest]; if (!isFolder(d) || dest === BIN) return { ok: false, why: 'notfolder' };
    const list = ids.filter(i => fs.nodes[i] && i !== ROOT && i !== BIN); if (!list.length) return { ok: false, why: 'none' };
    for (const i of list) { if (isDesc(fs, dest, i)) return { ok: false, why: 'self', id: i }; if (fs.nodes[i].parent === BIN) return { ok: false, why: 'inbin' }; }
    const made = list.map(i => copyTree(fs, i, dest, uniqueName(fs, dest, fs.nodes[i].name, 'สำเนา'), true));
    return { ok: true, ids: made };
  }

  function del(fs, ids) {
    const list = ids.filter(i => fs.nodes[i] && i !== ROOT && i !== BIN && fs.nodes[i].parent !== BIN); if (!list.length) return { ok: false, why: 'none' };
    list.forEach(i => { const n = fs.nodes[i]; n.from = n.parent; detach(fs, i); n.parent = BIN; fs.nodes[BIN].kids.push(i); });
    return { ok: true, deleted: list };
  }

  function restore(fs, ids) {
    const list = ids.filter(i => fs.nodes[i] && fs.nodes[i].parent === BIN); if (!list.length) return { ok: false, why: 'none' };
    list.forEach(i => {
      const n = fs.nodes[i]; let to = n.from && fs.nodes[n.from] && !inBin(fs, n.from) && n.from !== BIN ? n.from : ROOT;
      detach(fs, i); n.name = uniqueName(fs, to, n.name, '', i); n.parent = to; fs.nodes[to].kids.push(i);
    });
    return { ok: true, restored: list };
  }

  const setClip = (fs, mode, ids) => { fs.clip = ids.length ? { mode, ids: ids.slice() } : null; };
  function paste(fs, dest) {
    const c = fs.clip; if (!c) return { ok: false, why: 'noclip' };
    const r = c.mode === 'cut' ? move(fs, c.ids, dest) : copy(fs, c.ids, dest);
    if (r.ok && c.mode === 'cut') fs.clip = null;
    return Object.assign({ mode: c.mode }, r);
  }

  /* ---------- เป้าหมายของด่าน ---------- */
  function resolveKeys(level, fs) {
    const used = {};
    (level.goals || []).forEach(g => {
      if (g.t !== 'folder' || !g.key) return;
      delete fs.keys[g.key]; const p = idOf(fs, g.p); if (!p || !fs.nodes[p]) return;
      const hit = fs.nodes[p].kids.find(i => fs.nodes[i].kind === 'd' && !used[i] && g.names.some(n => norm(n) === norm(fs.nodes[i].name)));
      if (hit) { used[hit] = true; fs.keys[g.key] = hit; }
    });
  }

  function sat(level, fs, g) {
    const id = g.k ? idOf(fs, g.k) : null, n = id ? fs.nodes[id] : null;
    switch (g.t) {
      case 'in': { const f = idOf(fs, g.f); return !!n && !!f && n.parent === f; }
      case 'inBin': return !!n && n.parent === BIN;
      case 'copyIn': { const f = idOf(fs, g.f); return !!n && !!f && n.parent !== BIN && fs.nodes[f].kids.some(i => fs.nodes[i].copyOf === id); }
      case 'folder': return !!fs.keys[g.key];
      case 'name': return !!n && g.names.some(x => norm(x) === norm(n.name));
      case 'visit': { const f = idOf(fs, g.f); return !!f && !!fs.visited[f]; }
      case 'answer': return !!fs.answers[g.q];
    }
    return false;
  }
  function status(level, fs) {
    resolveKeys(level, fs);
    const list = (level.goals || []).map(g => sat(level, fs, g));
    return { goals: list, done: list.every(Boolean), left: list.filter(x => !x).length };
  }

  /* ---------- ตัวตรวจความผิดพลาด ---------- */
  const nm = (fs, id) => (fs.nodes[id] ? fs.nodes[id].name : '');
  const VAGUE = ['ใหม่', 'งาน', 'ของฉัน', 'ไฟล์', 'ทดสอบ', 'asdf', 'aaa', 'test', 'ใหม่1', 'ใหม่ 1'];
  // op: { t:'move', ids, dest } · { t:'copy', ids, dest } · { t:'del', ids } · { t:'restore', ids } · { t:'new', p } · { t:'rename', id, name }
  function judge(level, fs, op) {
    resolveKeys(level, fs); const R = level.rules || {};
    const each = f => { for (const i of op.ids || []) { const n = fs.nodes[i]; if (!n) continue; const w = f(n, i); if (w) return { why: w }; } return null; };
    switch (op.t) {
      case 'move': {
        if (op.dest === BIN) return judge(level, fs, { t: 'del', ids: op.ids });
        return each((n, i) => {
          if (n.parent === op.dest) return null;
          if (n.mode === 'copy') return '“' + n.name + '” ต้องคัดลอก ไม่ใช่ย้าย ต้นฉบับต้องอยู่ที่เดิม';
          if (n.mode === 'keep') return '“' + n.name + '” อยู่ที่เดิมดีแล้ว ไม่ต้องย้าย';
          if (n.mode === 'junk') return '“' + n.name + '” เป็นไฟล์ที่ไม่ใช้แล้ว ต้องลบ ไม่ต้องย้าย';
          if (R.strict && n.home) { const t = fs.keys[n.home]; if (t && op.dest !== t) return '“' + n.name + '” ' + (n.why || 'ไม่เข้าพวกกับที่นี่') + ' ควรอยู่ในโฟลเดอร์ “' + nm(fs, t) + '”'; }
          return null;
        });
      }
      case 'copy':
        return each(n => {
          if (n.mode === 'copy') return null;
          if (n.mode === 'move') return '“' + n.name + '” ต้องย้าย ไม่ต้องทำสำเนา';
          if (n.mode === 'keep' || n.mode === 'junk') return '“' + n.name + '” ไม่ต้องคัดลอก';
          if (R.strict) return 'ด่านนี้ให้ย้ายไฟล์เข้าโฟลเดอร์ ไม่ต้องทำสำเนา';
          return null;
        });
      case 'del':
        return each(n => {
          if (n.mode === 'junk') return null;
          if (n.mode === 'restore') return '“' + n.name + '” ยังต้องใช้ ไม่ควรลบ';
          return '“' + n.name + '” ยังต้องใช้อยู่ ไม่ต้องลบ';
        });
      case 'restore':
        return each(n => (n.mode === 'junk' ? '“' + n.name + '” เป็นไฟล์ที่ไม่ใช้แล้ว ปล่อยไว้ในถังรีไซเคิลได้เลย' : null));
      case 'new':
        return R.noNew ? { why: 'ด่านนี้ไม่ต้องสร้างโฟลเดอร์ใหม่ ลองดูโจทย์อีกครั้ง' } : null;
    }
    return null;
  }

  /* ตรวจชื่อที่เลือกจากตัวเลือก (ตอนตั้งชื่อโฟลเดอร์) คืน null ถ้าถูก */
  function judgeName(level, fs, id, name) {
    resolveKeys(level, fs);
    const n = fs.nodes[id]; if (!n) return { why: 'ไม่พบโฟลเดอร์นี้' };
    const goals = nameGoals(level, fs, id);
    if (goals.some(g => g.names.some(x => norm(x) === norm(name)))) {
      if (taken(fs, n.parent, name, id)) return { why: 'ในโฟลเดอร์นี้มีชื่อ “' + name + '” อยู่แล้ว ตั้งชื่อซ้ำกันไม่ได้ ต้องตั้งให้ต่างกัน', dup: true };
      return null;
    }
    if (taken(fs, n.parent, name, id)) return { why: 'ในโฟลเดอร์นี้มีชื่อ “' + name + '” อยู่แล้ว ตั้งชื่อซ้ำกันไม่ได้ ต้องตั้งให้ต่างกัน', dup: true };
    if (VAGUE.some(v => norm(v) === norm(name))) return { why: 'ชื่อ “' + name + '” กว้างเกินไป พอเห็นชื่อแล้วไม่รู้ว่าข้างในมีอะไร ควรตั้งให้บอกเรื่องที่อยู่ข้างใน' };
    return { why: 'ชื่อ “' + name + '” ไม่ตรงกับสิ่งที่อยู่ข้างใน ลองเปิดดูข้างในแล้วเลือกชื่อใหม่' };
  }
  // เป้าหมายตั้งชื่อที่ใช้กับโหนด id ได้ (โฟลเดอร์ใหม่ใต้ p ที่ยังไม่ได้ชื่อ หรือโหนดที่มีเป้าหมายเปลี่ยนชื่อ)
  function nameGoals(level, fs, id) {
    const n = fs.nodes[id], out = [];
    (level.goals || []).forEach(g => {
      if (g.t === 'name' && idOf(fs, g.k) === id) out.push(g);
      if (g.t === 'folder' && idOf(fs, g.p) === n.parent && !fs.keys[g.key]) out.push(g);
    });
    return out;
  }
  // ตัวเลือกชื่อสำหรับโหนด id: ชื่อที่ถูก + ชื่อลวง (ลำดับคงที่ตามข้อมูลด่าน) คืนรายการสตริง
  function nameChoices(level, fs, id) {
    const gs = nameGoals(level, fs, id); if (!gs.length) return [];
    const good = [], bad = [];
    gs.forEach(g => { good.push(g.names[0]); (g.bad || []).forEach(b => { if (!bad.includes(b)) bad.push(b); }); });
    const all = good.concat(bad.filter(b => !good.includes(b)).slice(0, Math.max(2, 5 - good.length)));
    const r = ((level.world || 1) * 3 + (level.id || 1) + id.length) % all.length;   // หมุนลำดับแบบคงที่ ไม่ให้ชื่อที่ถูกอยู่หน้าสุดเสมอ
    return all.slice(r).concat(all.slice(0, r));
  }

  /* ---------- วางแผนทำให้ผ่าน (ใช้เป็นคำใบ้และใช้ทดสอบ) ---------- */
  // คืนลำดับการกระทำจากสถานะปัจจุบัน แต่ละข้อเป็น { t, ... } ที่ใช้ id จริง หรือ '$r1' แทนโฟลเดอร์ที่จะถูกสร้างตามแผน
  function plan(level, fsIn) {
    const fs = clone(fsIn), ops = [], R = {}; let rc = 0; resolveKeys(level, fs);
    const rid = x => (typeof x === 'string' && x[0] === '$' ? R[x] : x);
    const order = { folder: 0, name: 1, visit: 2, in: 3, copyIn: 3, inBin: 3, answer: 4 };
    const goals = (level.goals || []).map((g, i) => [g, i]).sort((a, b) => (order[a[0].t] - order[b[0].t]) || a[1] - b[1]).map(p => p[0]);
    const push = (op, apply) => { ops.push(op); if (apply) apply(); resolveKeys(level, fs); };
    goals.forEach(g => {
      resolveKeys(level, fs); if (sat(level, fs, g)) return;
      const id = g.k ? idOf(fs, g.k) : null;
      if (g.t === 'folder') {
        const p = idOf(fs, g.p); const ref = '$r' + (++rc); let target = null;
        const stray = fs.nodes[p].kids.find(i => fs.nodes[i].kind === 'd' && /^โฟลเดอร์ใหม่/.test(fs.nodes[i].name) && !Object.values(fs.keys).includes(i));
        if (stray) { target = stray; push({ t: 'rename', id: stray, name: g.names[0] }, () => rename(fs, stray, g.names[0])); }
        else push({ t: 'new', p, name: g.names[0], ref }, () => { const r = newFolder(fs, p, g.names[0]); R[ref] = r.id; target = r.id; });
        if (target && fs.nodes[target].name !== g.names[0]) push({ t: 'rename', id: target, name: g.names[0] }, () => rename(fs, target, g.names[0]));
      } else if (g.t === 'name') push({ t: 'rename', id, name: g.names[0] }, () => rename(fs, id, g.names[0]));
      else if (g.t === 'visit') { const f = idOf(fs, g.f); push({ t: 'open', id: f }, () => openFolder(fs, f)); }
      else if (g.t === 'answer') push({ t: 'answer', q: g.q }, () => { fs.answers[g.q] = true; });
      else if (g.t === 'in') {
        const f = idOf(fs, g.f);
        if (fs.nodes[id].parent === BIN) push({ t: 'restore', ids: [id] }, () => restore(fs, [id]));
        if (fs.nodes[id].parent !== f) push({ t: 'move', ids: [id], dest: f }, () => move(fs, [id], f));
      } else if (g.t === 'copyIn') { const f = idOf(fs, g.f); push({ t: 'copy', ids: [id], dest: f }, () => copy(fs, [id], f)); }
      else if (g.t === 'inBin') push({ t: 'del', ids: [id] }, () => del(fs, [id]));
    });
    return ops;
  }

  /* ---------- เริ่มด่านและใช้การกระทำตามแผน (ใช้ในการทดสอบ) ---------- */
  function init(level) {
    const fs = make(level.spec, level.bin); (level.visit0 || []).forEach(k => openFolder(fs, idOf(fs, k)));
    resolveKeys(level, fs); return fs;
  }
  // ใช้การกระทำหนึ่งข้อกับ fs โดยตรวจ judge ก่อน refs = ตารางแปลง '$r1' เป็น id จริง คืน { ok, mistake }
  function applyOp(level, fs, op, refs) {
    refs = refs || {}; const rid = x => (typeof x === 'string' && x[0] === '$' ? refs[x] : x), ids = (op.ids || []).map(rid);
    const o = Object.assign({}, op, { ids, dest: rid(op.dest), id: rid(op.id), p: rid(op.p) });
    let r;
    switch (op.t) {
      case 'new': { const j = judge(level, fs, o); if (j) return { ok: false, mistake: j.why }; r = newFolder(fs, o.p, null); if (r.ok && op.ref) refs[op.ref] = r.id; if (r.ok && op.name) { const nmj = judgeName(level, fs, r.id, op.name); if (nmj) return { ok: false, mistake: nmj.why }; rename(fs, r.id, op.name); } break; }
      case 'rename': { const j = judgeName(level, fs, o.id, op.name); if (j) return { ok: false, mistake: j.why }; r = rename(fs, o.id, op.name); break; }
      case 'move': { const j = judge(level, fs, o); if (j) return { ok: false, mistake: j.why }; r = move(fs, ids, o.dest); break; }
      case 'copy': { const j = judge(level, fs, o); if (j) return { ok: false, mistake: j.why }; r = copy(fs, ids, o.dest); break; }
      case 'del': { const j = judge(level, fs, o); if (j) return { ok: false, mistake: j.why }; r = del(fs, ids); break; }
      case 'restore': { const j = judge(level, fs, o); if (j) return { ok: false, mistake: j.why }; r = restore(fs, ids); break; }
      case 'open': r = openFolder(fs, o.id); break;
      case 'answer': fs.answers[op.q] = true; r = { ok: true }; break;
    }
    resolveKeys(level, fs); return r || { ok: false };
  }

  const api = { ROOT, BIN, DEFAULT_NAME, clone, make, node, isFolder, idOf, kids, isDesc, pathIds, pathNames, inBin, taken, uniqueName,
    openFolder, newFolder, rename, move, copy, del, restore, setClip, paste, resolveKeys, sat, status, judge, judgeName, nameGoals, nameChoices, plan, init, applyOp, VAGUE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FD = api;
})(typeof window !== 'undefined' ? window : globalThis);
