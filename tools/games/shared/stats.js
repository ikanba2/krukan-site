/* ===== สถิติเกมกลาง: ส่งผลการเล่นไปชีตกลาง (Google Apps Script) และขออันดับมาแสดงหน้าสรุปผล =====
   ตั้งค่าตอน build: tools/games/stats.json { url, key } (ว่าง = ปิดระบบ เกมทำงานเหมือนเดิมทุกอย่าง) + ไอดีเกมใน build-games.py
   ส่งอะไร: รหัสเครื่องสุ่ม (ไม่ใช่ข้อมูลส่วนตัว) ชื่อเล่นที่ผู้เล่นใส่เอง (ช่องเดียว ไม่เก็บนามสกุล ไม่ใส่ก็ได้) ด่าน ดาว พลาด ใช้คำใบ้ วินาที โหมด ชนิดอุปกรณ์ รุ่นเกม ไม่ส่งอย่างอื่น
   ถ้าส่งไม่สำเร็จ (ออฟไลน์/เซิร์ฟเวอร์ช้า) เก็บคิวไว้ในเครื่องแล้วส่งซ้ำรอบหน้า เกมไม่สะดุด */
(function () {
  'use strict';
  const QK = 'krukan_stats_queue_v1', IK = 'krukan_device_id_v1';
  const S = KG.stats = { on: false, url: '', key: '', game: '', cid: '', last: null };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ไม่เก็บก็ไม่เป็นไร */ } }
  };
  function deviceId() {
    let id = store.get(IK);
    if (!/^[A-Za-z0-9]{6,24}$/.test(id || '')) { id = ''; const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < 14; i++) id += a[Math.floor(Math.random() * a.length)]; store.set(IK, id); }
    return id;
  }
  const build = () => { const m = document.querySelector('meta[name="kg-build"]'); return m ? m.content : ''; };
  const queue = () => { try { return JSON.parse(store.get(QK) || '[]'); } catch (e) { return []; } };
  const saveQueue = q => store.set(QK, JSON.stringify(q.slice(-30)));

  S.init = function (cfg) {
    if (!cfg || !cfg.url || !cfg.game) return S;
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return S;   // เปิดจากเครื่องที่ใช้ทดสอบ (localhost) ไม่ส่งผลเข้าชีตจริง
    S.url = cfg.url; S.key = cfg.key || ''; S.game = cfg.game; S.cid = deviceId(); S.on = true;
    setTimeout(S.flush, 4000);   // ส่งคิวที่ค้างจากรอบก่อน (หลังเกมเปิดเสร็จ)
    return S;
  };

  function post(body, ms) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ctl ? setTimeout(() => ctl.abort(), ms || 9000) : null;
    // ส่งเป็น text/plain เพื่อไม่ให้เบราว์เซอร์ต้องถามสิทธิ์ล่วงหน้า (Apps Script อ่านข้อความดิบได้)
    return fetch(S.url, { method: 'POST', body: JSON.stringify(body), redirect: 'follow', signal: ctl ? ctl.signal : undefined })
      .then(r => r.json()).then(j => { if (t) clearTimeout(t); return j; }, e => { if (t) clearTimeout(t); throw e; });
  }

  // ส่งคิวที่ค้างทีละรายการ (ไม่ขอคำตอบอันดับ)
  S.flush = function () {
    if (!S.on) return; const q = queue(); if (!q.length) return; const item = q.shift(); saveQueue(q);
    post(item, 9000).then(j => { if (!j || !j.ok) throw new Error('rejected'); if (queue().length) setTimeout(S.flush, 800); }).catch(() => { const q2 = queue(); q2.unshift(item); saveQueue(q2); });
  };

  // บันทึกผลหนึ่งครั้ง rec: { lvl, stars, score, m (พลาด), h (ใช้คำใบ้), secs, practice } คืน Promise ของอันดับ ({ok, rank}) หรือ null ถ้าส่งไม่ได้
  S.record = function (rec) {
    if (!S.on) return Promise.resolve(null);
    const p = (KG.prefs && KG.prefs.data && KG.prefs.data.player) || {};
    const body = Object.assign({ k: S.key, t: 'play', game: S.game, cid: S.cid, name: String(p.first || '').trim().slice(0, 16), dev: KG.isTouch ? 'm' : 'd', ver: build() }, rec);
    return post(body, 9000).then(j => { if (!j || !j.ok) throw new Error((j && j.err) || 'fail'); S.last = j.rank; return j; }).catch(() => {
      const q = queue(); q.push(body); saveQueue(q); return null;
    });
  };

  // ขออันดับอย่างเดียว (ไม่บันทึกผล)
  S.rank = function () {
    if (!S.on) return Promise.resolve(null);
    return fetch(S.url + (S.url.indexOf('?') < 0 ? '?' : '&') + 'k=' + encodeURIComponent(S.key) + '&t=rank&game=' + encodeURIComponent(S.game) + '&cid=' + encodeURIComponent(S.cid), { redirect: 'follow' })
      .then(r => r.json()).then(j => (j && j.ok ? j : null)).catch(() => null);
  };

  // ปรับข้อความกล่องใส่ชื่อ ให้บอกความจริงว่าชื่อถูกส่งไปเก็บสถิติ
  S.decorateDialog = function () {
    if (!S.on) return;
    const box = document.getElementById('player'); if (!box) return;
    const p = box.querySelector('p'), note = box.querySelector('.note');
    if (p) p.textContent = 'ใส่ชื่อเล่นอย่างเดียว ไม่ต้องใส่ชื่อจริงหรือนามสกุล ชื่อเล่นจะแสดงในอันดับเมื่อเล่นจบ ไม่ใส่ก็เล่นได้ (จะขึ้นเป็น “นิรนาม”)';
    if (note) note.textContent = 'ผลการเล่นและชื่อเล่นจะถูกบันทึกในสถิติของห้องเรียน เพื่อนและครูจะเห็นชื่อเล่นนี้ในอันดับ';
  };

})();
