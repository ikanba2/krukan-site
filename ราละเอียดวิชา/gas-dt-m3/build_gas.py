"""แพ็กต้นแบบ DT-M3 เป็นแพ็กเกจ Apps Script: Index.html + Chunk*.html (+ Code.gs, appsscript.json ที่มีอยู่แล้ว)
ใช้: python build_gas.py
- รวม CSS/JS/ภาพ เป็นหน้าเดียว (ภาพไม่ฝัง ดึงจาก Google Drive ตาม assets-drive.json) แล้วบีบ gzip + base64 แบ่งเป็นไฟล์ Chunk ไม่เกิน ~700 KB
  (HtmlService ตรวจ HTML ทีละไฟล์ จึงประกอบกลับในเบราว์เซอร์ เหมือนแพ็กเกจ ป.1–ป.6)
- ไม่ยุ่งกับไฟล์ต้นทางในโฟลเดอร์ ต้นแบบเว็บ_DT-M3_Offline  ·  ไม่ deploy  ·  ไม่สร้าง .clasp.json"""
from pathlib import Path
import base64, gzip, re, sys

sys.stdout.reconfigure(encoding='utf-8')
here = Path(__file__).resolve().parent
web = here.parent.parent / 'MyIPST_CS_M1-M3_DT_M2-M3' / 'ต้นแบบเว็บ_DT-M3_Offline'
assert web.exists(), web

html = (web / 'Techno-DT-M3-Offline.html').read_text(encoding='utf-8')
used = set()

def data_uri_unused(name):
    p = web / 'assets' / name
    if not p.exists():
        raise SystemExit('ไม่พบภาพ ' + name)
    used.add(name)
    return 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode('ascii')

# --- ภาพ: ไม่ฝัง base64 ดึงจาก Google Drive ตาม assets-drive.json (ชื่อไฟล์ -> fileId) ---
import json
drive = {k: v for k, v in json.loads((here / 'assets-drive.json').read_text(encoding='utf-8')).items() if not k.startswith('_')}
missing = sorted(k for k, v in drive.items() if not v and not re.match(r'^(hero-[a-z]+|sheet-\d+|boss-\d+|techno-sword|role-[a-z]+)\.webp$', k))

def inline_css(m):
    css = (web / m.group(1).split('?')[0]).read_text(encoding='utf-8')
    return '<style>' + re.sub(r'url\(assets/[A-Za-z0-9_.\-]+\)', 'none', css) + '</style>'  # ภาพชุดต่อสู้ตั้งผ่านตัวแปร CSS ตอนเปิดหน้า
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
html = re.sub(r'<link rel="preconnect"[^>]*>', '', html)
DYN = re.compile(r'assets/((?:[A-Za-z0-9_.\-]|\$\{[^}]*\})+\.webp)')
scripts = []
def grab_script(m):
    if m.group(1).startswith('gas-sim'): return ''  # เซิร์ฟเวอร์จำลองใช้เฉพาะไฟล์ออฟไลน์
    js = (web / m.group(1).split('?')[0]).read_text(encoding='utf-8')
    scripts.append(DYN.sub(lambda x: '${window.DTA(`' + x.group(1) + '`)}', js)); return ''
html = re.sub(r'\s*<script src="([^"]+)" defer></script>', grab_script, html)
html = DYN.sub(lambda x: x.group(0), html)
# ตัวละคร/บอส/บทบาท ฝังเป็น base64 ตามที่ตกลง · ฉากสนามและเอฟเฟกต์ดึงจาก Drive
# โหลด 3 ขั้นเพื่อให้เปิดเร็ว: (1) หน้าโหลด (2) ตัวแอป + ภาพหน้าแรก (role-*, techno-sword) (3) ภาพตัวละคร/บอสที่เหลือ
# โหลดเบื้องหลังผ่าน google.script.run.getSpritePack(i) ขณะนักเรียนอ่านหน้าแรก (ไฟล์ SpritePackN.html)
EMBED = re.compile(r'^(hero-[a-z]+|sheet-\d+|boss-\d+|techno-sword|role-[a-z]+)\.webp$')
CORE = re.compile(r'^(techno-sword|role-[a-z]+)\.webp$')
emb, late = {}, {}
for n in sorted(p.name for p in (web / 'assets').glob('*.webp')):
    if EMBED.match(n):
        (emb if CORE.match(n) else late)[n] = 'data:image/webp;base64,' + base64.b64encode((web / 'assets' / n).read_bytes()).decode('ascii')
PACKS = 4
for old in here.glob('SpritePack*.html'):
    old.unlink()
names = sorted(late, key=lambda k: -len(late[k]))
packs = [dict() for _ in range(PACKS)]
for n in names:
    min(packs, key=lambda d: sum(len(v) for v in d.values()))[n] = late[n]
for i, d in enumerate(packs, 1):
    (here / f'SpritePack{i}.html').write_text('<script type="text/plain">' + json.dumps(d) + '</script>', encoding='ascii')
mp = json.dumps({k: v for k, v in drive.items() if v and k not in emb}, ensure_ascii=False)
late_js = ('window.DTSprites=(function(){var need=' + json.dumps(sorted(late)) + ',done=false,wait=[],left=' + str(PACKS) + ',started=false;'
           'function finish(){if(done)return;done=true;wait.splice(0).forEach(function(f){f()});'
           'var h=location.hash;if(window.DTApp&&!/\/arena/.test(h))try{window.DTApp.render()}catch(e){}}'
           'function start(){if(started)return;started=true;if(!(window.google&&google.script&&google.script.run)){finish();return}'
           'for(var i=1;i<=' + str(PACKS) + ';i++)(function(i,tries){function go(){google.script.run.withSuccessHandler(function(t){try{Object.assign(window.__EMB,JSON.parse(String(t).replace(/^[^{]*/,"").replace(/[^}]*$/,"")))}catch(e){}if(--left===0)finish()})'
           '.withFailureHandler(function(){if(tries-->0)setTimeout(go,1500);else if(--left===0)finish()}).getSpritePack(i)}go()})(i,2)}'
           'return{get ready(){return done},need:need,start:start,wait:function(){return new Promise(function(r){if(done)r();else{wait.push(r);start()}})}}})();'
           'window.addEventListener("load",function(){setTimeout(window.DTSprites.start,300)});')
boot_js = ('<script>window.__EMB=' + json.dumps(emb) + ';window.__DRIVE=' + mp + ';' + late_js + 'window.DTA=function(n){if(window.__EMB[n])return window.__EMB[n];var id=window.__DRIVE[n];'
           'return id?("https://lh3.googleusercontent.com/d/"+id+"=w"+(/^(arena|combat)/.test(n)?1280:/^qfig/.test(n)?1000:600)):'
           '"data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%271%27 height=%271%27/%3E"};'
           'var r=document.documentElement.style;["combat-hero","combat-hero-fx","combat-boss-fx"].forEach(function(k){r.setProperty("--"+k,"url("+window.DTA(k+".webp")+")")});</script>')
html = html.replace('</head>', boot_js + '</head>', 1)
html = html.replace('</body>', ''.join('<script>' + js.replace('</script>', '<\/script>') + '</script>' for js in scripts) + '</body>', 1)
need = []

raw = base64.b64encode(gzip.compress(html.encode('utf-8'), compresslevel=9, mtime=0)).decode('ascii')
SIZE = 700000
parts = [raw[i:i + SIZE] for i in range(0, len(raw), SIZE)]
for old in here.glob('Chunk*.html'):
    old.unlink()
for i, part in enumerate(parts, 1):
    (here / f'Chunk{i:02}.html').write_text('<script type="text/plain" data-chunk="%02d">%s</script>' % (i, part), encoding='ascii')
# หน้าโหลดขั้นที่ 1 (เบามาก ไม่มีภาพ แสดงทันที) ใช้หน้าตาเดียวกับขั้นที่ 2 ในแอป จึงต่อกันเป็นภาพเดียว
_m = re.search(r'<!--BOOT-->(.*?)<script>', html, re.S)
loader = _m.group(1) if _m else '<div id="kb"><p id="kb-msg">กำลังเปิดห้องเรียน…</p><i id="kb-bar"></i></div>'
boot = ("<!DOCTYPE html><html lang=\"th\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        "<title>Techno Frontier · ออกแบบและเทคโนโลยี ม.3</title><style>html,body{margin:0;background:#0e1530}</style></head><body>" + loader
        + ''.join("<?!= include('Chunk%02d'); ?>" % i for i in range(1, len(parts) + 1))
        + "<script>(async function(){var bar=document.getElementById('kb-bar'),msg=document.getElementById('kb-msg');function step(p,t){if(bar)bar.style.width=p+'%';if(msg&&t)msg.textContent=t;return new Promise(function(r){requestAnimationFrame(function(){setTimeout(r,0)})})}"
          "try{await step(22,'รอแป๊บนะ! กำลังโหลดภารกิจ…');var nodes=document.querySelectorAll('script[data-chunk]'),s='';"
          "for(var i=0;i<nodes.length;i++)s+=nodes[i].textContent.trim();await step(40,'กำลังแกะกล่องภารกิจ…');"
          "var bin=atob(s),u8=new Uint8Array(bin.length);for(var j=0;j<bin.length;j++)u8[j]=bin.charCodeAt(j);await step(58,'กำลังประกอบห้องเรียน…');"
          "var rd=new ReadableStream({start:function(c){c.enqueue(u8);c.close()}}).pipeThrough(new DecompressionStream('gzip')).getReader(),dec=new TextDecoder(),html='';for(;;){var r=await rd.read();if(r.done)break;html+=dec.decode(r.value,{stream:true})}html+=dec.decode();await step(70,'เกือบพร้อมแล้ว…');"
          "document.open();document.write(html);document.close()}"
          "catch(e){if(msg)msg.textContent='เปิดไม่สำเร็จ ลองรีเฟรชอีกครั้งนะ ('+(e&&e.message||e)+')'}})();</script></body></html>")
(here / 'Index.html').write_text(boot, encoding='utf-8')
(here / '_bundle-preview.html').write_text(html, encoding='utf-8')  # สำหรับทดสอบในเครื่อง (ไม่ต้องอัปโหลด)
print('GAS package:', len(parts), 'chunks |', len(drive) - len(missing), 'ภาพผูก Drive แล้ว |', len(missing), 'ภาพยังไม่มี fileId |', round(len(html) / 1e6, 2), 'MB')
if missing: print('ยังไม่มีบน Drive:', ', '.join(missing))
