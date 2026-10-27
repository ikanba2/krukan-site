"""สร้างหน้าเปรียบเทียบแนวดีไซน์ 3 แบบ (เฉพาะส่วนหัว) ด้วยภาพจริง → ราละเอียดวิชา/_concepts.html (ไฟล์ทดสอบชั่วคราว)"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import assets as A

hero = A.webp(A.TA / 'LoginCovers-P1-P6-v1' / 'p1-login-battle.png', (1100, 620), 60)
leap = A.pose(15, (420, 420))
board = A.pose(49, (360, 360))
worlds = [A.webp(A.TA / 'BossArena-P1-P6-v1' / f'boss-arena-p{g}-{k}.webp', (300, 170), 55, crop=(16, 9))
          for g, k in ((1, 'thunder'), (2, 'water'), (3, 'nature'), (4, 'fire'), (5, 'ice'), (6, 'rock'))]
logo = A.webp(A.PIC / 'Logo.png', (100, 100), 80)

html = r"""<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=Kanit:wght@400;600;800;900&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#e9edf5;font-family:Kanit,sans-serif;color:#0e1530}
.lab{max-width:1200px;margin:26px auto 8px;font:800 22px/1.2 'Chakra Petch';padding:0 16px}
.lab small{display:block;font:400 15px/1.4 Kanit;color:#56627d}
.box{max-width:1200px;margin:0 auto 10px;padding:0 16px}
/* ---------- A: COMIC STRIKE ---------- */
.A{position:relative;height:540px;overflow:hidden;border:5px solid #0e1530;border-radius:6px;background:#fff;background-image:radial-gradient(#0e1530 1.3px,transparent 1.6px);background-size:14px 14px;box-shadow:12px 12px 0 #ff2e88}
.A .slab{position:absolute;right:-8%;top:-10%;width:66%;height:130%;background:#0e1530;transform:skewX(-14deg);overflow:hidden}
.A .slab img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:skewX(14deg) scale(1.25);opacity:.85;mix-blend-mode:luminosity}
.A .slab::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,46,136,.75),rgba(255,46,136,0) 60%)}
.A .slash{position:absolute;right:30%;top:0;bottom:0;width:26px;background:#ff2e88;transform:skewX(-14deg)}
.A .slash.b{right:26.5%;width:10px;background:#ffd400}
.A .hero{position:absolute;right:16%;bottom:-20px;height:118%;filter:drop-shadow(8px 8px 0 #0e1530)}
.A .txt{position:absolute;left:44px;top:50px;width:52%}
.A .tag{display:inline-block;padding:8px 16px;background:#ffd400;border:4px solid #0e1530;font:900 18px/1 Kanit;transform:rotate(-4deg);box-shadow:5px 5px 0 #0e1530}
.A h1{margin:22px 0 8px;font:900 118px/.82 'Chakra Petch';letter-spacing:-2px;color:#0e1530;transform:rotate(-3deg)}
.A h1 span{display:block}
.A h1 span:last-child{color:#fff;-webkit-text-stroke:5px #0e1530;paint-order:stroke;text-shadow:9px 9px 0 #ff2e88;margin-left:40px}
.A p{max-width:30ch;margin:18px 0;padding:10px 14px;background:#fff;border:4px solid #0e1530;font:600 17px/1.5 Kanit;transform:rotate(-1deg);box-shadow:6px 6px 0 #0e1530}
.A .btns{display:flex;gap:16px}
.A .b{padding:14px 26px;border:4px solid #0e1530;font:900 21px/1 Kanit;box-shadow:7px 7px 0 #0e1530;transform:rotate(-2deg)}
.A .b.p{background:#ff2e88;color:#fff}.A .b.y{background:#ffd400}
.A .tape{position:absolute;left:-5%;right:-5%;bottom:34px;padding:10px 0;background:#ffd400;border-block:4px solid #0e1530;transform:rotate(-3deg);white-space:nowrap;font:900 20px/1 'Chakra Petch';letter-spacing:.1em;overflow:hidden}
.A .tape.k{bottom:6px;background:#0e1530;color:#fff;transform:rotate(2deg)}
.A .burst{position:absolute;right:46%;top:26px;width:110px;height:110px;background:#ffd400;clip-path:polygon(50% 0,61% 20%,82% 10%,80% 32%,100% 38%,86% 54%,100% 70%,78% 74%,80% 96%,60% 86%,50% 100%,40% 86%,20% 96%,22% 74%,0 70%,14% 54%,0 38%,20% 32%,18% 10%,39% 20%);display:grid;place-items:center;font:900 22px/1 Kanit;transform:rotate(10deg)}
/* ---------- B: HOLO PRISM ---------- */
.B{position:relative;height:540px;overflow:hidden;border-radius:34px;background:radial-gradient(circle at 15% 20%,#b8f3ff,transparent 45%),radial-gradient(circle at 85% 15%,#ffd1f0,transparent 45%),radial-gradient(circle at 70% 90%,#fff1b0,transparent 50%),radial-gradient(circle at 25% 85%,#d9c9ff,transparent 50%),#f7f8ff;box-shadow:0 30px 60px rgba(80,60,160,.18)}
.B .orb{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#c9b8ff 40%,#7c5cff 75%,#3a1f9e);box-shadow:inset -10px -14px 30px rgba(40,10,120,.4),0 20px 40px rgba(124,92,255,.35)}
.B .o1{width:180px;height:180px;right:6%;top:8%}.B .o2{width:70px;height:70px;left:46%;top:12%;background:radial-gradient(circle at 30% 30%,#fff,#ffb3dc 40%,#ff2e88 80%)}
.B .ring{position:absolute;right:2%;top:30%;width:420px;height:120px;border-radius:50%;border:14px solid transparent;background:conic-gradient(from 0deg,#00e0c6,#7c5cff,#ff2e88,#ffcc00,#00e0c6) border-box;-webkit-mask:linear-gradient(#000 0 0) padding-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) padding-box exclude,linear-gradient(#000 0 0);transform:rotate(-16deg);opacity:.9}
.B .hero{position:absolute;right:12%;bottom:30px;height:78%;filter:drop-shadow(0 30px 30px rgba(80,40,160,.35))}
.B .glass{position:absolute;left:40px;top:44px;width:50%;padding:28px;border-radius:28px;background:rgba(255,255,255,.55);backdrop-filter:blur(14px);border:2px solid rgba(255,255,255,.9);box-shadow:0 20px 50px rgba(80,60,160,.15)}
.B .glass::before{content:'';position:absolute;inset:-2px;border-radius:30px;padding:2px;background:conic-gradient(#00e0c6,#7c5cff,#ff2e88,#ffcc00,#00e0c6);-webkit-mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.B small{font:700 14px/1 'Chakra Petch';letter-spacing:.3em;color:#7c5cff}
.B h1{margin:10px 0;font:700 104px/.88 'Chakra Petch';background:linear-gradient(180deg,#fff 0,#c9d3ff 30%,#5b4bd8 55%,#1d1260 56%,#7c5cff 75%,#fff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 6px 0 rgba(29,18,96,.25))}
.B p{margin:0 0 18px;color:#3d4470;font-size:17px}
.B .b{display:inline-block;margin-right:12px;padding:15px 26px;border-radius:99px;font:800 19px/1 Kanit;color:#fff;background:linear-gradient(90deg,#7c5cff,#ff2e88);box-shadow:0 10px 26px rgba(255,46,136,.35),inset 0 2px 0 rgba(255,255,255,.5)}
.B .b.s{background:#fff;color:#3a1f9e;box-shadow:0 8px 20px rgba(80,60,160,.15)}
.B .spark{position:absolute;width:22px;height:22px;background:#fff;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);filter:drop-shadow(0 0 8px #fff)}
/* ---------- C: LAUNCHER KEY ART ---------- */
.C{position:relative;height:540px;overflow:hidden;border-radius:18px;background:#0b0d1e}
.C .art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%}
.C::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(255,255,255,.96) 0,rgba(255,255,255,.8) 26%,rgba(255,255,255,0) 52%),linear-gradient(0deg,rgba(255,255,255,.95) 0,rgba(255,255,255,0) 32%)}
.C .vert{position:absolute;z-index:2;left:18px;top:30px;writing-mode:vertical-rl;transform:rotate(180deg);font:700 15px/1 'Chakra Petch';letter-spacing:.5em;color:#c79a3a}
.C .txt{position:absolute;z-index:2;left:64px;top:56px;width:40%}
.C .season{display:flex;align-items:baseline;gap:12px;font:700 15px/1 'Chakra Petch';letter-spacing:.3em;color:#c79a3a}
.C .season b{font-size:64px;letter-spacing:0;color:#0e1530}
.C h1{margin:8px 0 6px;font:700 76px/.95 'Chakra Petch';color:#0e1530;letter-spacing:.04em}
.C h1 em{font-style:normal;color:#e0287a}
.C .line{width:240px;height:2px;margin:14px 0;background:linear-gradient(90deg,#c79a3a,transparent)}
.C p{margin:0 0 18px;color:#3b4560;font-size:16.5px}
.C .b{display:inline-flex;align-items:center;gap:12px;padding:16px 30px 16px 22px;background:#0e1530;color:#fff;font:700 19px/1 Kanit;clip-path:polygon(0 0,100% 0,92% 100%,0 100%);margin-right:6px}
.C .b i{width:10px;height:10px;background:#ffcc00;transform:rotate(45deg)}
.C .b.g{background:#c79a3a}
.C .worlds{position:absolute;z-index:2;left:64px;right:24px;bottom:22px;display:flex;gap:12px}
.C .w{position:relative;flex:1;height:84px;border:2px solid #fff;outline:1px solid #c79a3a;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.25)}
.C .w img{width:100%;height:100%;object-fit:cover}
.C .w span{position:absolute;left:6px;bottom:4px;color:#fff;font:700 13px/1 'Chakra Petch';text-shadow:0 1px 4px #000}
.C .w.on{outline:3px solid #ffcc00;transform:translateY(-8px)}
</style></head><body>
<div class="lab">แบบ A · COMIC STRIKE<small>ขาว-ดำ-ชมพูจัด สไตล์คอมิก/Persona เส้นขอบดำหนา เงาแข็ง ตัวอักษรเอียง แถบเทปพาดเฉียง ตัวละครทะลุกรอบ — โดดเด่น แปลกตา จำง่ายที่สุด</small></div>
<div class="box"><div class="A"><div class="slab"><img src="__HERO__"></div><i class="slash"></i><i class="slash b"></i><img class="hero" src="__LEAP__"><div class="burst">NEW!</div>
<div class="txt"><span class="tag">★ SEASON 2026 · PLAY TO LEARN</span><h1><span>DATA</span><span>CORE</span></h1><p>พื้นที่เรียนรู้ที่เชื่อมบทเรียน สื่อ กิจกรรม และเครื่องมือดิจิทัลไว้ในที่เดียว</p><div class="btns"><span class="b p">▶ เริ่มเรียนรู้</span><span class="b y">⚡ แปลงร่าง</span></div></div>
<div class="tape">★ PLAY TO LEARN ★ KRUKAN ONLINE ★ 9 STAGES ★ 25 GAMES ★ PLAY TO LEARN ★ KRUKAN ONLINE ★ 9 STAGES ★</div><div class="tape k">CYBER RIDER TECHNO ◆ READY ◆ CYBER RIDER TECHNO ◆ READY ◆ CYBER RIDER TECHNO ◆ READY ◆ CYBER RIDER TECHNO</div></div></div>

<div class="lab">แบบ B · HOLO PRISM<small>สว่าง พาสเทลรุ้ง กระจกฝ้า ขอบสีรุ้ง ลูกแก้ว 3 มิติลอย ตัวอักษรโครเมียม — หรู ล้ำสมัย ดูพรีเมียม</small></div>
<div class="box"><div class="B"><i class="orb o1"></i><i class="orb o2"></i><i class="ring"></i><img class="hero" src="__BOARD__"><i class="spark" style="left:52%;top:62%"></i><i class="spark" style="right:30%;top:14%"></i><i class="spark" style="left:44%;bottom:12%;width:14px;height:14px"></i>
<div class="glass"><small>SEASON 2026 · PLAY TO LEARN</small><h1>DATA<br>CORE</h1><p>พื้นที่เรียนรู้ที่เชื่อมบทเรียน สื่อ กิจกรรม และเครื่องมือดิจิทัลไว้ในที่เดียว</p><span class="b">▶ เริ่มเรียนรู้</span><span class="b s">⚡ แปลงร่าง</span></div></div></div>

<div class="lab">แบบ C · LAUNCHER KEY ART<small>ภาพต่อสู้เต็มจอแบบหน้าเปิดเกม เส้นทองบาง ตัวอักษรแนวตั้ง แถบเลือกโลก ป.1–ป.6 ด้านล่างเหมือนเลือกด่าน — สง่า อลังการ แบบเกมฟอร์มใหญ่</small></div>
<div class="box"><div class="C"><img class="art" src="__HERO__"><div class="vert">KRUKAN ONLINE · PLAY TO LEARN</div>
<div class="txt"><div class="season">SEASON <b>2026</b></div><h1>DATA <em>CORE</em></h1><div class="line"></div><p>พื้นที่เรียนรู้ที่เชื่อมบทเรียน สื่อ กิจกรรม และเครื่องมือดิจิทัลไว้ในที่เดียว</p><span class="b"><i></i>เริ่มเรียนรู้</span><span class="b g"><i></i>แปลงร่าง</span></div>
<div class="worlds">__WORLDS__</div></div></div>
<div style="height:40px"></div></body></html>"""
names = ['ป.1 สายฟ้า', 'ป.2 น้ำ', 'ป.3 พฤกษา', 'ป.4 ไฟ', 'ป.5 น้ำแข็ง', 'ป.6 หิน']
wl = ''.join(f'<div class="w{" on" if i == 0 else ""}"><img src="{w}"><span>{names[i]}</span></div>' for i, w in enumerate(worlds))
out = html.replace('__HERO__', hero).replace('__LEAP__', leap).replace('__BOARD__', board).replace('__WORLDS__', wl)
p = Path(__file__).resolve().parents[2] / 'ราละเอียดวิชา' / '_concepts.html'
p.write_text(out, encoding='utf-8')
print('ok', len(out) // 1024, 'KB')
