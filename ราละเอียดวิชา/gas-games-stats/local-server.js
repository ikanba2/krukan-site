/* เซิร์ฟเวอร์จำลองบนเครื่อง: รัน Code.gs ตัวจริงบนตัวจำลองชีตในหน่วยความจำ แล้วเปิดเป็น http://127.0.0.1:8803/exec (POST/GET + CORS)
   ไว้ทดสอบเกมจริงในเบราว์เซอร์โดยไม่ต้องแตะ Google: node local-server.js [พอร์ต]  (รหัสสถิติพิมพ์ออกหน้าจอตอนเริ่ม) */
'use strict';
const http = require('http'), { makeEnv } = require('./mock-gas.js');
const E = makeEnv({ now: Date.now() }), C = E.ctx; const key = C.setup(); const port = Number(process.argv[2] || 8803);
// ให้นาฬิกาจำลองเดินตามเวลาจริง
C.__set(() => new Date());
// ใส่ข้อมูลตัวอย่างให้อันดับดูเป็นจริง (ผู้เล่นสมมติ 8 คน)
const names = ['มะลิ', 'ต้นกล้า', 'ปลื้ม', 'ฟ้าใส', 'ภูผา', 'น้ำใส', 'ข้าวหอม', ''];
names.forEach((n, i) => C.doPost({ postData: { contents: JSON.stringify({ k: key, t: 'play', game: process.argv[3] || 'folder', cid: 'seed000' + i + 'xx', first: n, last: n ? 'ตัวอย่าง' : '', lvl: '1:1', stars: 3 - (i % 3), m: i, secs: 60 + i * 5 }) } }));
http.createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  let body = ''; req.on('data', d => { body += d; }); req.on('end', () => {
    const u = new URL(req.url, 'http://x'); let out;
    if (req.method === 'POST') out = C.doPost({ postData: { contents: body } }); else out = C.doGet({ parameter: Object.fromEntries(u.searchParams) });
    res.writeHead(200, Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, cors)); res.end(out.text);
  });
}).listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port + '/exec  key=' + key));
