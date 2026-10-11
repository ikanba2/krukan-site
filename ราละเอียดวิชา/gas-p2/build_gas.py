"""แพ็ก Techno-P2-Offline.html เป็นไฟล์ Chunk*.html + Index.html สำหรับ Apps Script
(HtmlService ตรวจ HTML ทีละไฟล์ จึงเก็บทั้งหน้าเป็น base64 ใน <script type="text/plain"> แล้วประกอบกลับในเบราว์เซอร์)
ใช้: python build_gas.py   (รัน ../ต้นแบบเว็บ_ป2/build.py ก่อน)"""
from pathlib import Path
import base64, hashlib, secrets, sys

sys.stdout.reconfigure(encoding='utf-8')
here = Path(__file__).resolve().parent
web = here.parent / 'ต้นแบบเว็บ_ป2'
code = here / 'Code.gs'
secret_file = here / '.admin-initial.txt'

source = code.read_text(encoding='utf-8')
if '__ADMIN_HASH__' in source:
    password = secrets.token_urlsafe(15)
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((salt + ':' + password).encode('utf-8')).hexdigest()
    source = source.replace('__ADMIN_SALT__', salt).replace('__ADMIN_HASH__', digest)
    code.write_text(source, encoding='utf-8')
    secret_file.write_text('บัญชีแอดมิน ป.2 เริ่มต้น\nชื่อผู้ใช้: admin\nรหัสผ่าน: ' + password + '\nเปลี่ยนโดยเพิ่มบัญชีครูแล้วเลิกใช้บัญชีนี้\n', encoding='utf-8')

online = (web / 'Techno-P2-Offline.html').read_text(encoding='utf-8')
raw = base64.b64encode(online.encode('utf-8')).decode('ascii')
SIZE = 700000
parts = [raw[i:i + SIZE] for i in range(0, len(raw), SIZE)]
for old in here.glob('Chunk*.html'):
    old.unlink()
for i, part in enumerate(parts, 1):
    (here / f'Chunk{i:02}.html').write_text('<script type="text/plain" data-chunk="%02d">%s</script>' % (i, part), encoding='ascii')
boot = ("<!DOCTYPE html><html lang=\"th\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        "<title>Techno Academy ป.2</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:linear-gradient(#07335a,#031528);color:#fff;font:700 21px Tahoma,sans-serif}"
        "#boot{display:grid;justify-items:center;gap:14px}.o{position:relative;width:84px;height:84px}.o b{position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px;border-radius:50%;animation:s 1.3s linear infinite}"
        ".o b:nth-child(1){background:#2fd4e6}.o b:nth-child(2){background:#4ef4d2;animation-delay:-.43s}.o b:nth-child(3){background:#ff7a6b;animation-delay:-.86s}"
        "@keyframes s{from{transform:rotate(0) translateX(30px)}to{transform:rotate(360deg) translateX(30px)}}</style></head>"
        "<body><div id=\"boot\"><div class=\"o\"><b></b><b></b><b></b></div><span id=\"bt\">กำลังเปิดห้องเรียน…</span></div>"
        + ''.join("<?!= include('Chunk%02d'); ?>" % i for i in range(1, len(parts) + 1))
        + "<script>(function(){try{var nodes=document.querySelectorAll('script[data-chunk]'),s='';"
          "for(var i=0;i<nodes.length;i++)s+=nodes[i].textContent.trim();"
          "var bin=atob(s),u8=new Uint8Array(bin.length);for(var j=0;j<bin.length;j++)u8[j]=bin.charCodeAt(j);"
          "var html=new TextDecoder('utf-8').decode(u8);var bt=document.getElementById('boot');if(bt)bt.remove();"
          "var st=document.querySelectorAll('style');for(var k=0;k<st.length;k++)st[k].remove();document.open();document.write(html);document.close()}"
          "catch(e){document.getElementById('bt').textContent='เปิดไม่สำเร็จ ลองรีเฟรชนะ'}})();</script></body></html>")
(here / 'Index.html').write_text(boot, encoding='utf-8')
print('GAS package:', len(parts), 'chunks,', len(online), 'characters ->', len(raw), 'base64')
