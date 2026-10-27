"""แพ็กหน้าเว็บ ป.3 (v2) เป็น Chunk*.html + Index.html สำหรับ Apps Script
ใช้: (1) python ../ต้นแบบเว็บ_ป3/build_v2.py   (2) python build_gas.py   แล้วนำ Code.gs appsscript.json Index.html Chunk*.html ไปไว้ในโปรเจ็กต์ Apps Script ใหม่ของ ป.3"""
from pathlib import Path
import base64, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).resolve().parent
page = (HERE.parent / 'ต้นแบบเว็บ_ป3' / 'Techno-P3-Offline.html').read_text(encoding='utf-8')
(HERE / 'Techno-P3-GAS-Preview.html').write_text(page, encoding='utf-8')
encoded = base64.b64encode(page.encode('utf-8')).decode('ascii')
size = 650_000
parts = [encoded[i:i + size] for i in range(0, len(encoded), size)]
for old in HERE.glob('Chunk*.html'):
    old.unlink()
for i, part in enumerate(parts, 1):
    (HERE / f'Chunk{i:02}.html').write_text(f'<script type="text/plain" data-chunk="{i:02d}">{part}</script>', encoding='ascii')
includes = ''.join(f"<?!= include('Chunk{i:02d}'); ?>" for i in range(1, len(parts) + 1))
boot = ('<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Techno Academy ป.3</title>'
        '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(#0f5a3a,#062a1b);color:#e8ffd0;font:700 21px Tahoma,sans-serif}'
        '#boot{display:grid;justify-items:center;gap:14px}.o{position:relative;width:84px;height:84px}.o b{position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px;border-radius:50%;animation:s 1.3s linear infinite}'
        '.o b:nth-child(1){background:#7ed957}.o b:nth-child(2){background:#c6f06b;animation-delay:-.43s}.o b:nth-child(3){background:#ffd34f;animation-delay:-.86s}'
        '@keyframes s{from{transform:rotate(0) translateX(30px)}to{transform:rotate(360deg) translateX(30px)}}</style></head>'
        '<body><div id="boot"><div class="o"><b></b><b></b><b></b></div><span id="bt">กำลังเปิดดาวธาตุพฤกษา…</span></div>' + includes +
        "<script>(function(){try{var nodes=document.querySelectorAll('script[data-chunk]'),b='';for(var i=0;i<nodes.length;i++)b+=nodes[i].textContent.trim();"
        "var bin=atob(b),u=new Uint8Array(bin.length);for(var j=0;j<bin.length;j++)u[j]=bin.charCodeAt(j);var page=new TextDecoder('utf-8').decode(u);"
        "var bt=document.getElementById('boot');if(bt)bt.remove();var st=document.querySelectorAll('style');for(var k=0;k<st.length;k++)st[k].remove();"
        "document.open();document.write(page);document.close()}catch(e){document.getElementById('bt').textContent='เปิดไม่สำเร็จ กรุณารีเฟรช'}})();</script></body></html>")
(HERE / 'Index.html').write_text(boot, encoding='utf-8')
print(f'Prepared {len(parts)} GAS chunks; {len(page):,} HTML characters.')
