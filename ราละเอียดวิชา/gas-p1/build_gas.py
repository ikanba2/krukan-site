"""Package the reviewed offline lesson into small Apps Script HTML includes."""
from pathlib import Path
import hashlib
import secrets
import re

here=Path(__file__).resolve().parent
web=here.parent/'ต้นแบบเว็บ_ป1'
code=here/'Code.gs'
secret_file=here/'.admin-initial.txt'
source=code.read_text(encoding='utf-8')
if '__ADMIN_HASH__' in source:
    password=secrets.token_urlsafe(15)
    salt=secrets.token_hex(16)
    digest=hashlib.sha256((salt+':'+password).encode('utf-8')).hexdigest()
    source=source.replace('__ADMIN_SALT__',salt).replace('__ADMIN_HASH__',digest)
    code.write_text(source,encoding='utf-8')
    secret_file.write_text('บัญชีแอดมินเริ่มต้น\nชื่อผู้ใช้: admin\nรหัสผ่าน: '+password+'\nเปลี่ยนหลังเข้าระบบครั้งแรกเมื่อเพิ่มครูแล้ว\n',encoding='utf-8')

offline=(web/'Techno-P1-Offline.html').read_text(encoding='utf-8')
needle='state=blankState();\n$(\'#account-btn\').onclick=logout;'
assert needle in offline,'Initial bootstrap marker missing'
bridge=(web/'gas-client.js').read_text(encoding='utf-8')
online=offline.replace(needle,bridge+'\n'+needle,1)
online=online.replace('บันทึกอัตโนมัติในเครื่อง · ปี','บันทึกอัตโนมัติในชีต · ปี')
online=online.replace('คะแนนบันทึกตาม Rider และปีการศึกษาบนเครื่องนี้','คะแนนบันทึกตาม Rider และปีการศึกษาใน Google Sheets')
online=online.replace('SITE_UPDATED=\'11 ต.ค. 2569\'','SITE_UPDATED=\'11 ต.ค. 2569 · GAS\'')
# HtmlService ตรวจรูปแบบ HTML ทีละไฟล์ จึงตัดตรง ๆ กลางสคริปต์ไม่ได้ (เกิด "เนื้อหา HTML มีรูปแบบไม่ถูกต้อง")
# เก็บทั้งหน้าเป็น base64 ในแท็ก <script type="text/plain"> ไฟล์ละ ~700 KB แล้วให้ Index ประกอบกลับและ document.write
import base64
raw=base64.b64encode(online.encode('utf-8')).decode('ascii')
SIZE=700000
parts=[raw[i:i+SIZE] for i in range(0,len(raw),SIZE)]
for old in here.glob('Chunk*.html'): old.unlink()
for i,part in enumerate(parts,1):
    (here/f'Chunk{i:02}.html').write_text('<script type="text/plain" data-chunk="%02d">%s</script>'%(i,part),encoding='ascii')
boot=("<!DOCTYPE html><html lang=\"th\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
      "<title>Techno Academy</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:linear-gradient(#2a2d92,#5a3fc9);color:#fff;font:700 21px Tahoma,sans-serif}"
      "#boot{display:grid;justify-items:center;gap:14px}.o{position:relative;width:84px;height:84px}.o i{position:absolute;inset:22px;background:#ffd23f;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:p 1.1s ease-in-out infinite}"
      ".o b{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;border-radius:50%;animation:s 1.6s linear infinite}.o b:nth-of-type(1){background:#ff5fa2;--r:0deg}.o b:nth-of-type(2){background:#3ee0b0;--r:120deg}.o b:nth-of-type(3){background:#5ca9ff;--r:240deg}"
      "@keyframes s{from{transform:rotate(var(--r)) translateX(36px)}to{transform:rotate(calc(var(--r) + 360deg)) translateX(36px)}}@keyframes p{50%{transform:scale(1.18) rotate(8deg)}}</style></head>"
      "<body><div id=\"boot\"><div class=\"o\"><i></i><b></b><b></b><b></b></div><span id=\"bt\">กำลังเปิดห้องเรียน…</span></div>"
      + ''.join("<?!= include('Chunk%02d'); ?>"%i for i in range(1,len(parts)+1))
      + "<script>(function(){try{var nodes=document.querySelectorAll('script[data-chunk]'),s='';"
        "for(var i=0;i<nodes.length;i++)s+=nodes[i].textContent.trim();"
        "var bin=atob(s),u8=new Uint8Array(bin.length);for(var j=0;j<bin.length;j++)u8[j]=bin.charCodeAt(j);"
        "var html=new TextDecoder('utf-8').decode(u8);var bt=document.getElementById('boot');if(bt)bt.remove();var st=document.querySelectorAll('style');for(var k=0;k<st.length;k++)st[k].remove();document.open();document.write(html);document.close()}"
        "catch(e){document.getElementById('bt').textContent='เปิดไม่สำเร็จ ลองรีเฟรชนะ'}})();</script></body></html>")
(here/'Index.html').write_text(boot,encoding='utf-8')
print('GAS package:',len(parts),'chunks,',len(online),'characters ->',len(raw),'base64')
