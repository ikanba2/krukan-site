/* ซิงก์กับ Google Drive ผ่าน Apps Script (gas-dt-m1/Code.gs)
   - เปิดใน Apps Script: นักเรียนเข้าด้วยเลขที่+รหัส งานที่ส่งและคะแนนด่านฝึกถูกบันทึกลง Drive ทันที และขึ้นหน้าครูอัตโนมัติ
   - เปิดไฟล์ในเครื่อง (ไม่มี google.script.run): ทำงานแบบออฟไลน์เดิม ไม่ซิงก์ */
(function () {
  'use strict';
  const TOK = 'dtcloud-token', TOK_STU = 'dtcloud-stu-token', TOK_STAFF = 'dtcloud-staff-token', STU_NO = 'dtcloud-stu-no', ROLE = 'dtcloud-role', SYNC = window.DT_CFG.key + '-cloudsync';
  const shim = window.DT_CLOUD_SHIM; // ใช้ทดสอบนอก Apps Script
  const hasGas = () => !!(window.google && google.script && google.script.run);
  const clone = v => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  /* การเข้าสู่ระบบอยู่เฉพาะแท็บนี้ (ปิดแท็บ = ออก) ปลอดภัยกับเครื่องที่ใช้ร่วมกันในห้องเรียน */
  const get = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); localStorage.removeItem(k); } catch (e) { /* ไม่บันทึก */ } };
  try { [TOK, TOK_STU, TOK_STAFF, STU_NO, ROLE].forEach(k => localStorage.removeItem(k)); } catch (e) { /* ไม่มี */ }
  const stuTok = () => get(TOK_STU) || (get(ROLE) === 'student' ? get(TOK) : null);
  const staffTok = () => get(TOK_STAFF) || (get(ROLE) === 'staff' ? get(TOK) : null);
  const curStuNo = () => {
    const a = app();
    if (a && a.activeId && a.activeId !== 'guest' && a.db && a.db.profiles && a.db.profiles[a.activeId]) {
      return String(a.db.profiles[a.activeId].number || '');
    }
    return get(STU_NO) || '';
  };
  let syncMap = {}; try { syncMap = JSON.parse(localStorage.getItem(SYNC) || '{}') || {}; } catch (e) { syncMap = {}; }
  const saveMap = () => { try { localStorage.setItem(SYNC, JSON.stringify(syncMap)); } catch (e) { /* ไม่บันทึก */ } };
  const app = () => window.DTApp;
  const msg = e => String((e && e.message) || e || 'เชื่อมต่อไม่สำเร็จ').replace(/^Error:\s*/, '');

  function call(fn, ...args) {
    if (shim) return Promise.resolve().then(() => clone(shim[fn](...clone(args))));
    return new Promise((ok, no) => google.script.run.withSuccessHandler(ok).withFailureHandler(e => no(new Error(msg(e))))[fn](...args));
  }
  const hash = o => { const s = JSON.stringify(o); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return s.length + ':' + h; };

  /* ---------- ป้ายสถานะซิงก์ ---------- */
  let chip = null, pending = 0, lastErr = '';
  function showChip() {
    if (!cloud.on) return;
    if (!chip) { chip = document.createElement('div'); chip.id = 'cloud-chip'; chip.setAttribute('role', 'status'); chip.setAttribute('aria-live', 'polite'); document.body.appendChild(chip); }
    const role = get(ROLE); chip.hidden = !role && !stuTok() && !staffTok();
    chip.className = lastErr ? 'bad' : pending ? 'busy' : 'ok';
    const sim = window.DT_SIM_MODE ? 'โหมดทดลอง · ' : ''; chip.textContent = lastErr ? '☁ ส่งไม่สำเร็จ จะลองใหม่อัตโนมัติ' : pending ? '☁ ' + sim + 'กำลังบันทึก…' : (role === 'staff' ? '☁ ' + sim + 'เชื่อมกับระบบ · งานใหม่ขึ้นเอง' : '☁ ' + sim + (window.DT_SIM_MODE ? 'บันทึกแล้ว' : 'บันทึกลง Drive แล้ว'));
    chip.title = lastErr;
  }
  /* แถบโหลดบางๆ ด้านบนจอทุกครั้งที่คุยกับเซิร์ฟเวอร์ */
  const netBusy = () => document.documentElement.classList.toggle('net-busy', pending > 0);
  async function track(promise) { pending++; showChip(); netBusy(); try { const r = await promise; lastErr = ''; return r; } catch (e) { lastErr = msg(e); throw e; } finally { pending--; showChip(); netBusy(); } }

  /* ---------- รวมข้อมูลจากเซิร์ฟเวอร์เข้ากับข้อมูลในเครื่อง ---------- */
  function ensureProfile(number, name, classroom, year) {
    const db = app().db, id = 'cloud-' + number;
    const p = db.profiles[id] || (db.profiles[id] = app().blankProfile({ id }));
    Object.assign(p, { id, number: String(number), name: name || p.name || 'เลขที่ ' + number, classroom, year });
    if (!db.roster.includes(id)) db.roster.push(id);
    return p;
  }
  function mapSub(r) {
    const id = 'cloud-' + r.number;
    const chId = r.chapterId || (window.DT_CFG.code + '-C0' + (Number(r.chapterNo) || 1));
    return { id: r.id, studentId: id, student: { id, name: r.name, number: String(r.number), classroom: r.classroom, year: String(r.year) }, chapterId: chId, version: Number(r.version) || 1, submittedAt: r.submittedAt || '', status: (r.review && r.review.status) || ((Number(r.version) || 1) === 1 ? 'submitted' : 'resubmitted'), fields: r.fields || {}, labs: r.labs || {}, aiDraft: r.review ? undefined : (r.aiDraft || undefined), aiQueued: !r.review && !r.aiDraft && r.aiQueued ? true : undefined, review: r.review || undefined };
  }
  function mergeSubs(list) {
    const db = app().db; let added = 0, revChanged = 0;
    list.forEach(r => {
      ensureProfile(r.number, r.name, r.classroom, r.year);
      const s = mapSub(r), i = db.submissions.findIndex(x => x.id === s.id);
      if (i < 0) { db.submissions.push(s); added++; if (s.review) revChanged++; }
      else {
        const cur = db.submissions[i];
        const prevRev = JSON.stringify(cur.review || null), nextRev = JSON.stringify(s.review || null);
        if (s.review && prevRev !== nextRev) revChanged++;
        if (s.review) { cur.review = s.review; delete cur.aiDraft; delete cur.aiQueued; } else if (s.aiDraft) { cur.aiDraft = s.aiDraft; delete cur.aiQueued; } else if (s.aiQueued) cur.aiQueued = true; else delete cur.aiQueued;
        cur.status = (cur.review && cur.review.status) || s.status || cur.status;
        if (s.fields && Object.keys(s.fields).length) cur.fields = s.fields;
        if (s.labs && Object.keys(s.labs).length) cur.labs = s.labs;
        if (!cur.student) cur.student = s.student;
      }
      syncMap[s.id] = hash([s.id, s.version, s.fields, s.labs]);
    });
    // สถานะบทและข้อมูลใบงานของนักเรียนแต่ละคนตามฉบับล่าสุด
    const by = {};
    db.submissions.forEach(s => {
      const k = s.studentId + '|' + s.chapterId;
      if (!by[k] || by[k].version <= s.version) by[k] = s;
    });
    Object.values(by).forEach(s => {
      const p = db.profiles[s.studentId]; if (!p) return;
      const w = p.chapters[s.chapterId] || (p.chapters[s.chapterId] = { fields: {}, status: 'draft', version: 0 });
      const hasWs = w.fields && (w.fields.__ws || Object.keys(w.fields).some(k => k !== 'evidenceMode' && String(w.fields[k] || '').trim()));
      if ((!hasWs || (w.version || 0) < s.version) && s.fields && Object.keys(s.fields).length) {
        w.fields = JSON.parse(JSON.stringify(s.fields));
      }
      const nextStatus = (s.review && s.review.status) || (s.version === 1 ? 'submitted' : 'resubmitted');
      if (w.status !== nextStatus) revChanged++;
      w.status = nextStatus;
      w.version = Math.max(w.version || 0, s.version);
      if (!w.updatedAt && s.submittedAt) w.updatedAt = s.submittedAt;
    });
    saveMap(); return { added, revChanged };
  }
  function mergePractice(id, obj) { if (window.DTPractice && obj) window.DTPractice.mergeRemote(id, obj); }
  /* งานร่างจากเซิร์ฟเวอร์: ใช้ฉบับที่แก้ล่าสุด (ทำต่อเครื่องไหนก็ได้) */
  function mergeDrafts(pid, drafts) {
    const p = app().db.profiles[pid]; if (!p || !drafts) return 0; let n = 0;
    Object.keys(drafts).forEach(no => {
      const d = drafts[no], cid = window.DT_CFG.code + '-C0' + Number(no); if (!d || !d.fields) return;
      const w = p.chapters[cid] || (p.chapters[cid] = { fields: {}, status: 'draft', version: 0 });
      if (!w.updatedAt || String(d.updatedAt) > String(w.updatedAt)) { w.fields = Object.assign({}, d.fields); w.updatedAt = d.updatedAt; syncMap['draft:' + pid + ':' + cid] = d.updatedAt; n++; }
    });
    if (n) saveMap(); return n;
  }
  let draftTimer = 0;
  async function pushDrafts() {
    const token = stuTok(), pid = app().activeId, p = app().db.profiles[pid]; if (!token || !p || pid === 'guest') return;
    for (const cid of Object.keys(p.chapters || {})) {
      const w = p.chapters[cid], key = 'draft:' + pid + ':' + cid; if (!w || !w.updatedAt || syncMap[key] === w.updatedAt) continue;
      try { await track(call('saveDraft', token, cid, w.fields || {}, w.updatedAt)); syncMap[key] = w.updatedAt; saveMap(); }
      catch (e) { if (/หมดเวลาเข้าใช้งาน/.test(msg(e))) { sessionExpired(); return; } }
    }
  }
  function sessionExpired() { app().notify('หมดเวลาเข้าใช้งาน กรุณาเข้าสู่ระบบใหม่ งานร่างยังอยู่ในเครื่องนี้'); }

  /* ---------- นักเรียน ---------- */
  let stuPoll = 0, lastStuSync = 0, stuSyncBusy = false;
  async function pullStudent(silent) {
    if (!cloud.on || stuSyncBusy) return 0;
    const token = stuTok();
    if (!token) { if (staffTok()) return pull(silent); return 0; }
    stuSyncBusy = true;
    try {
      const mine = await track(call('pullMine', token));
      const { added, revChanged } = mergeSubs(mine.submissions || []);
      const no = curStuNo(), pid = no ? 'cloud-' + no : app().activeId;
      mergePractice(pid, mine.practice); learnCfg(mine.config); const dn = mergeDrafts(pid, mine.drafts); if (app().db.profiles[pid]) app().db.profiles[pid].final = mine.final || null;
      app().save();
      lastStuSync = Date.now();
      if (silent && revChanged > 0) {
        app().notify('🎉 ครูตรวจชิ้นงานของคุณแล้ว! เปิดดูคะแนนและข้อเสนอแนะได้เลย');
      }
      return added + revChanged + dn;
    } finally {
      stuSyncBusy = false;
    }
  }
  function syncStudentIfNeeded() {
    if (!cloud.on || stuSyncBusy || Date.now() - lastStuSync < 8000) return;
    lastStuSync = Date.now();
    pullStudent(true).then(changed => {
      if (changed > 0) {
        const a = document.activeElement;
        if (!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) app().render();
      }
    }).catch(() => {});
  }
  function startStudentPoll() {
    clearInterval(stuPoll);
    stuPoll = setInterval(async () => {
      if (document.hidden || (!stuTok() && !curStuNo())) return;
      try {
        const changed = await pullStudent(true);
        if (changed > 0) {
          const a = document.activeElement;
          if (!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) app().render();
        }
      } catch (e) { /* ลองรอบถัดไป */ }
    }, 25000);
  }
  async function studentLogin(no, pw) {
    const res = await track(call('loginStudent', no, pw)), db = app().db;
    put(TOK, res.token); put(TOK_STU, res.token); put(STU_NO, String(res.profile.number)); put(ROLE, 'student');
    db.settings.year = res.profile.year; db.settings.classroom = res.profile.classroom;
    const p = ensureProfile(res.profile.number, res.profile.name, res.profile.classroom, res.profile.year);
    mergeSubs(res.mine.submissions || []); mergePractice(p.id, res.mine.practice); learnCfg(res.mine.config); mergeDrafts(p.id, res.mine.drafts); p.final = res.mine.final || null;
    lastStuSync = Date.now();
    app().save(); startStudentPoll(); showChip(); return p.id;
  }
  let flushTimer = 0, retryTimer = 0;
  function labsForSend(labs) { const full = JSON.stringify(labs || {}); if (full.length < 60000) return labs || {}; const o = {}; Object.entries(labs).forEach(([k, l]) => { o[k] = { values: l.values, reason: l.reason, order: l.order, result: l.result, savedAt: l.savedAt }; }); return o; }
  async function flushStudent() {
    const token = stuTok(); if (!token) return false;
    const db = app().db, me = app().activeId; let failed = false;
    for (const s of db.submissions.filter(x => x.studentId === me)) {
      const h = hash([s.id, s.version, s.fields, s.labs]); if (syncMap[s.id] === h) continue;
      try { const res = await track(call('pushSubmission', token, { id: s.id, chapterId: s.chapterId, version: s.version, submittedAt: s.submittedAt, fields: s.fields, labs: labsForSend(s.labs) })); syncMap[s.id] = h; saveMap(); if (res && res.aiDraft && !s.review) { s.aiDraft = res.aiDraft; delete s.aiQueued; app().save(); } else if (res && res.aiQueued && !s.review) { s.aiQueued = true; app().save(); } }
      catch (e) { failed = true; if (/หมดเวลาเข้าใช้งาน/.test(msg(e))) { app().notify('หมดเวลาเข้าใช้งาน กรุณาเข้าสู่ระบบอีกครั้งเพื่อส่งงานที่ค้าง'); } }
    }
    clearTimeout(retryTimer); if (failed) retryTimer = setTimeout(flushStudent, 20000);
    return !failed;
  }
  function pushPractice(n) {
    const token = stuTok(); if (!token || !window.DTPractice) return;
    track(call('pushPractice', token, n, window.DTPractice.getRec(n))).catch(() => { clearTimeout(retryTimer); retryTimer = setTimeout(() => pushPractice(n), 20000); });
  }

  /* ---------- ครู ---------- */
  let poll = 0, known = new Set();
  async function pull(silent) {
    const token = staffTok(); if (!token) return 0;
    const res = await track(call('pullAll', token)), db = app().db;
    db.settings.year = res.config.year; db.settings.classroom = res.config.classroom; learnCfg(res.config);
    res.students.forEach(s => ensureProfile(s.number, s.name, s.classroom, s.year)); db.finals = res.finals || [];
    const { added, revChanged } = mergeSubs(res.submissions);
    Object.entries(res.practice || {}).forEach(([no, obj]) => mergePractice('cloud-' + no, obj));
    app().save();
    const fresh = res.submissions.filter(r => !known.has(r.id)).length; res.submissions.forEach(r => known.add(r.id));
    if (silent && fresh) app().notify('มีงานใหม่/อัปเดต ' + fresh + ' ชิ้นจากนักเรียน');
    return added + revChanged;
  }
  async function staffLogin(u, p) {
    const res = await track(call('loginStaff', u, p)); put(TOK, res.token); put(TOK_STAFF, res.token); put(ROLE, 'staff'); known = new Set();
    await pull(false); startPoll(); showChip(); return res;
  }
  function startPoll() {
    clearInterval(poll);
    poll = setInterval(async () => {
      if (!staffTok() || document.hidden || !location.hash.startsWith('#teacher')) return;
      try { await pull(true); const h = location.hash; if (h === '#teacher' || h === '#teacher/overview' || h === '#teacher/queue') { const a = document.activeElement; if (!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) && !document.querySelector('.queue-seq')) app().render(); } } catch (e) { /* ลองรอบถัดไป */ }
    }, 45000);
  }
  async function pushReviews(ids) {
    const token = staffTok(); if (!token) return;
    const db = app().db, list = ids.map(id => db.submissions.find(s => s.id === id)).filter(s => s && s.review).map(s => ({ id: s.id, review: s.review }));
    for (let i = 0; i < list.length; i += 50) {
      try { await track(call('saveReviews', token, list.slice(i, i + 50))); }
      catch (e) { app().notify('ส่งผลตรวจขึ้น Drive ไม่สำเร็จ: ' + msg(e) + ' (กดตรวจ/บันทึกอีกครั้งเมื่อพร้อม)'); return; }
    }
  }
  async function pushRoster() {
    const token = staffTok(); if (!token) return;
    const list = Object.values(app().db.profiles).filter(p => p.id !== 'guest' && /^\d+$/.test(String(p.number))).map(p => ({ number: p.number, name: p.name }));
    try { await track(call('upsertStudents', token, list)); } catch (e) { app().notify('ส่งรายชื่อขึ้น Drive ไม่สำเร็จ: ' + msg(e)); }
  }
  /* กำหนดส่งรายบทและสัดส่วนคะแนนรวม (ครูตั้ง นักเรียนรับไปแสดง) */
  function learnCfg(c) { if (!c) return; const st = app().db.settings; if (Array.isArray(c.locks)) st.locks = c.locks; if (c.weights) st.weights = c.weights; if (typeof c.finalOpen === 'boolean') st.finalOpen = c.finalOpen; delete st.due; }
  async function saveConfig(cfg) { const token = staffTok(); const r = await track(call('setConfig', token, cfg)); app().db.settings.year = r.year; app().db.settings.classroom = r.classroom; learnCfg(r); app().save(); return r; }

  const cloud = {
    on: hasGas() || !!shim,
    studentLogin, staffLogin, pushReviews, pullStudent, syncStudentIfNeeded, aiDraft: (id, rubric, labels) => track(call('aiDraftReview', staffTok(), id, rubric, labels)),
    setAutoDraft: (on, rubrics, labels) => track(call('setAutoDraft', staffTok(), on, rubrics, labels)), getAutoDraft: () => call('getAutoDraft', staffTok()), pushRoster, pushPractice, refresh: () => pull(false), saveConfig, changePassword: (o, n) => track(call('changeStaffPassword', staffTok(), o, n)),
    flush() { clearTimeout(flushTimer); return flushStudent().catch(() => false); },
    afterSave() { if (!stuTok()) return; clearTimeout(flushTimer); flushTimer = setTimeout(flushStudent, 700); clearTimeout(draftTimer); draftTimer = setTimeout(pushDrafts, 2500); },
    pushDrafts,
    logout(scope) {
      /* ครูกับนักเรียนเข้าพร้อมกันไม่ได้: ออกจากบทบาทหนึ่งไม่สลับไปอีกบทบาท */
      if (scope === 'staff') { clearInterval(poll); put(TOK_STAFF, null); if (get(ROLE) === 'staff') { put(ROLE, null); put(TOK, null); } }
      else if (scope === 'student') { clearInterval(stuPoll); put(TOK_STU, null); put(STU_NO, null); if (get(ROLE) === 'student') { put(ROLE, null); put(TOK, null); } }
      else { clearInterval(poll); clearInterval(stuPoll); put(TOK, null); put(TOK_STU, null); put(TOK_STAFF, null); put(STU_NO, null); put(ROLE, null); }
      showChip();
    },
    /* สอบปลายภาค */
    finalMine: () => call('getMyFinal', stuTok()), finalStart: () => track(call('startFinal', stuTok())), finalSubmit: ans => track(call('submitFinal', stuTok(), ans)),
    finalPreview: ans => track(call('gradeFinalPreview', ans)), finalReset: (year, number) => track(call('resetFinal', staffTok(), year, number)),
    isStaff: () => !!staffTok(),
    isStudent: () => !!(stuTok() || curStuNo()),
    call
  };
  window.DTCloud = cloud;
  window.addEventListener('online', () => { flushStudent(); });
  document.addEventListener('DOMContentLoaded', () => {
    showChip();
    if (stuTok() || curStuNo()) { startStudentPoll(); setTimeout(() => syncStudentIfNeeded(), 400); }
    if (staffTok()) startPoll();
  });
})();
