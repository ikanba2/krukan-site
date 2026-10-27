/* ===== Techno Talk: เสียงอ่านภาษาอังกฤษ (Web Speech API ของเบราว์เซอร์) =====
   ไม่มีเสียงอังกฤษในเครื่อง = ปิดฟีเจอร์ฟังเงียบ ๆ (ข้อสอบ 'ฟังแล้วเลือกภาพ' จะถูกแทนด้วยข้อแบบอ่าน) เกมที่เหลือเล่นได้ครบ */
const SPEECH = (function () {
  const has = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  let voice = null;
  const choose = () => {
    if (!has) return;
    const vs = (speechSynthesis.getVoices && speechSynthesis.getVoices()) || [];
    voice = vs.find(v => /^en[-_]US/i.test(v.lang) && /samantha|zira|jenny|aria|google us english|female/i.test(v.name)) || vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en[-_]/i.test(v.lang)) || null;
  };
  if (has) { choose(); try { speechSynthesis.addEventListener('voiceschanged', choose); } catch (e) { /* ไม่เป็นไร */ } }
  // ชื่อตัวอักษรเขียนเป็นคำที่ออกเสียงเหมือนกัน: ถ้าส่งตัวอักษรเดี่ยวไปตรง ๆ เสียงอ่านบางเครื่องพูดว่า 'capital A' หรืออ่านเป็นเสียงอื่น
  const LETTER = { a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'gee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'el', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee' };
  const S = {
    // มีเสียงอังกฤษให้ใช้ และผู้เล่นไม่ได้ปิดไว้
    get can() { return has && !!voice && SAVE.data.voice !== false; },
    get exists() { return has && !!voice; },
    say(text, rate) {
      if (!S.can || !text) return;
      try {
        speechSynthesis.cancel();
        // คำว่า I ตัวเดียว เสียงอ่านบางเครื่องออกเสียงเป็น 'capital I' จึงส่งคำที่ออกเสียงเหมือนกัน (eye) ไปแทน ข้อความบนจอยังเป็น I เหมือนเดิม
        const one = String(text).trim(), spoken = /^[A-Za-z]$/.test(one) ? LETTER[one.toLowerCase()] : String(text).replace(/_{2,}/g, ' blank ').replace(/\bI\b(?!')/g, 'eye');
        const u = new SpeechSynthesisUtterance(spoken); u.voice = voice; u.lang = voice.lang || 'en-US'; u.rate = rate || 0.82; u.pitch = 1.08; u.volume = 1;
        speechSynthesis.speak(u);
      } catch (e) { /* ไม่เป็นไร */ }
    },
    stop() { if (has) { try { speechSynthesis.cancel(); } catch (e) { /* ไม่เป็นไร */ } } }
  };
  return S;
})();
