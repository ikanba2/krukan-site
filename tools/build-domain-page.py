# -*- coding: utf-8 -*-
"""สร้างหน้าย่อย "รู้จัก .th และ .ไทย" (ลิงก์ /domain-th จากหน้า home) ในธีม COMIC STRIKE เดียวกับหน้า Lite

รัน:  python tools/build-domain-page.py   ->  Domain-Th-Thai.html (ไฟล์เดียว ฝังท่าเทคโนเป็น WebP)
ภาพประกอบที่ยังไม่มี: วางไฟล์ตามชื่อใน domain-th/ (ดู domain-th/ภาพที่ต้องใช้.md) หน้าจะหยิบมาแสดงเอง
ไม่มีไฟล์ก็แสดงกรอบลายฮาล์ฟโทนแทน ไม่พัง
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools' / 'home-lite'))
import assets as A

POSES = {'hero': A.pose(53, (300, 300)), 'cert': A.pose(53, (512, 512)),
         'm_wave': A.pose(2, (170, 170)), 'm_present': A.pose(9, (170, 170)), 'read': A.pose(66, (260, 260)), 'check': A.pose(49, (260, 260)),
         'win': A.pose(7, (240, 240)), 'wave': A.pose(2, (200, 200)), 'logo': A.webp(A.PIC / 'Logo.png', (96, 96), 80)}

import base64
SIG = 'data:image/webp;base64,' + base64.b64encode((ROOT / 'tools' / 'assets' / 'signature-krukan.webp').read_bytes()).decode('ascii')  # ลายเซ็นครูกาน (ไฟล์พื้นหลังโปร่งใส)

CSS = r"""
:root,:root[data-theme=light]{--ink:#0e1530;--paper:#fff;--paper2:#fff8dc;--muted:#3f4a66;--dot:rgba(14,21,48,.16);--pink:#ff2e88;--yellow:#ffd400;--cyan:#00cdb8;--blue:#3b5bff;--violet:#7c4dff;--red:#ff3b3b;--green:#19c37d;--on:#0e1530;--display:'Chakra Petch','Kanit',sans-serif;--body:'Kanit',sans-serif}
:root[data-theme=dark]{--ink:#f5f7ff;--paper:#11152b;--paper2:#1a1f3d;--muted:#b9c2dd;--dot:rgba(245,247,255,.13);--pink:#ff3d94;--blue:#6b86ff;--violet:#9f7bff;--green:#2bd68f}
*{box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:clip}
body{margin:0;background:var(--paper);color:var(--ink);font:500 17px/1.65 var(--body);-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}img{max-width:100%;display:block}
h1,h2,h3,h4{font-family:var(--display);margin:0}
:where(a,button):focus-visible{outline:4px solid var(--blue);outline-offset:4px}
.bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:radial-gradient(var(--dot) 1.4px,transparent 1.7px);background-size:16px 16px}
.wrap{width:min(1120px,100% - 32px);margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 0}
.brand{display:flex;align-items:center;gap:10px;font:800 17px/1 var(--display);letter-spacing:.06em}
.brand img{width:44px;height:44px;border:3px solid var(--ink);border-radius:50%;background:var(--yellow);box-shadow:3px 3px 0 var(--ink)}
.brand small{display:block;font:700 10.5px/1.3 var(--display);letter-spacing:.2em;color:var(--muted)}
.b3d{--c:var(--yellow);--fg:var(--on);display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:0 22px;border:4px solid var(--ink);border-radius:6px;background:var(--c);color:var(--fg);font:800 18px/1.1 var(--body);cursor:pointer;box-shadow:6px 6px 0 var(--ink);transition:transform .1s cubic-bezier(.3,1.6,.5,1),box-shadow .1s}
.b3d:hover{transform:translate(-2px,-2px) rotate(-1deg);box-shadow:8px 8px 0 var(--ink)}.b3d:active{transform:translate(5px,5px);box-shadow:1px 1px 0 var(--ink)}
.b3d.blue{--c:var(--blue);--fg:#fff}.b3d.pink{--c:var(--pink);--fg:#fff}.b3d.ghost{--c:var(--paper);--fg:var(--ink)}.b3d.sm{min-height:42px;padding:0 14px;font-size:15.5px;border-width:3px;box-shadow:4px 4px 0 var(--ink)}
.panel{position:relative;background:var(--paper);border:4px solid var(--ink);border-radius:6px;box-shadow:8px 8px 0 var(--ink)}
/* hero */
.hero{display:grid;grid-template-columns:.95fr 1.05fr;gap:32px;align-items:center;padding:10px 0 34px}
.dom-art{position:relative;display:grid;place-items:center;align-content:center;gap:6px;min-height:0;aspect-ratio:16/9;padding:0;background:var(--blue);background-image:radial-gradient(rgba(255,255,255,.25) 1.4px,transparent 1.7px);background-size:14px 14px;color:#fff;text-align:center;overflow:hidden;border:5px solid #0e1530;box-shadow:10px 10px 0 #0e1530;transform:rotate(-1.4deg)}
.dom-art b{font:800 clamp(64px,10vw,108px)/1 var(--display);-webkit-text-stroke:5px #0e1530;paint-order:stroke fill;text-shadow:7px 7px 0 #0e1530}
.dom-art b.th{color:var(--yellow);font-size:clamp(46px,7vw,78px)}
.dom-art small{padding:4px 10px;background:#0e1530;font:800 13px/1 var(--display);letter-spacing:.2em}.dom-art small.ka{background:var(--yellow);color:#0e1530;font:700 15px/1.2 var(--body);letter-spacing:.02em}
.dom-art .pose{position:absolute;right:-6px;bottom:-6px;width:140px;filter:drop-shadow(5px 5px 0 #0e1530)}
.dom-art .art-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}.dom-art>*:not(.art-img){position:relative;z-index:1}.dom-art .pose{position:absolute}
.tag{display:inline-block;padding:5px 12px;background:var(--pink);color:#fff;border:3px solid var(--ink);font:800 13px/1 var(--display);letter-spacing:.14em;transform:rotate(-3deg);box-shadow:3px 3px 0 var(--ink)}
.hero h1{margin:14px 0 8px;font-size:clamp(34px,6vw,60px);line-height:1.08;text-shadow:4px 4px 0 var(--yellow)}
.hero p.lead{margin:0 0 18px;font-size:19px;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 22px;padding:0;list-style:none}
.chips li{padding:6px 14px;background:var(--paper2);border:3px solid var(--ink);box-shadow:4px 4px 0 var(--ink);font:700 15px/1.3 var(--body);transform:rotate(var(--r,0deg))}
.cta{display:flex;flex-wrap:wrap;gap:14px}
/* section head */
.sec{padding:30px 0}
.sh{display:flex;align-items:center;gap:16px;margin-bottom:22px}
.sh .no{display:grid;place-items:center;flex:none;width:58px;height:58px;background:var(--yellow);color:#0e1530;border:4px solid var(--ink);box-shadow:5px 5px 0 var(--ink);font:900 24px/1 var(--display);transform:rotate(-6deg)}
.sh h2{font-size:clamp(25px,4vw,38px);line-height:1.15}.sh p{margin:2px 0 0;color:var(--muted);font-size:16px}
/* ===== ห้องทดลองแถบที่อยู่เว็บ (หน้าต่างเบราว์เซอร์การ์ตูน) ===== */
.lab{position:relative;margin:22px 0 0;background:var(--paper);border:4px solid var(--ink);box-shadow:8px 8px 0 var(--ink)}
.lab-mission{position:relative;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 14px;background:#0e1530 repeating-linear-gradient(135deg,rgba(255,212,0,.1) 0 14px,transparent 14px 28px);color:#fff;border-bottom:4px solid var(--yellow);font:600 15px/1.45 var(--body)}
.lab-mission .ico{flex:none;display:grid;place-items:center;width:38px;height:38px;background:var(--yellow);border:3px solid #fff;box-shadow:3px 3px 0 var(--pink);transform:rotate(-6deg)}
.lab-mission .ico .cur{width:19px;height:24px;animation:tapnudge 1.2s ease-in-out infinite}
.lab-mission p{margin:0;flex:1 1 240px}.lab-mission b{color:var(--yellow)}
.prog{display:flex;align-items:center;gap:10px;margin-left:auto}
.stps{display:flex;gap:5px}
.stp{width:17px;height:13px;border:3px solid var(--yellow);transform:skewX(-18deg);transition:background .25s,transform .25s}
.stp.on{background:var(--green);border-color:#fff;transform:skewX(-18deg) scale(1.14)}
.prog em{padding:2px 11px;background:var(--yellow);color:#0e1530;font:800 13px/1.5 var(--display);font-style:normal;white-space:nowrap;transform:rotate(-2deg);box-shadow:3px 3px 0 var(--pink)}
.lab.done .lab-mission{border-bottom-color:var(--green)}
.lab.done .stp.on{background:var(--yellow)}
.cur{fill:#fff;stroke:#0e1530;stroke-width:2.6;stroke-linejoin:round}
@keyframes tapnudge{50%{transform:translate(3px,4px) scale(.9)}}
.win-chrome{display:flex;align-items:flex-end;gap:14px;padding:8px 12px 0;background:color-mix(in srgb,var(--blue) 26%,var(--paper));border-bottom:4px solid var(--ink)}
.dots{display:flex;gap:6px;align-self:center;padding-bottom:6px}
.dots i{width:12px;height:12px;border:3px solid var(--ink);border-radius:50%;background:var(--red)}.dots i:nth-child(2){background:var(--yellow)}.dots i:nth-child(3){background:var(--green)}
.tabs{display:flex;gap:5px;flex-wrap:wrap;min-width:0}
.tabs button{position:relative;padding:6px 14px;border:3px solid var(--ink);border-bottom:0;background:color-mix(in srgb,var(--paper) 55%,var(--blue) 45%);color:var(--ink);font:800 clamp(12.5px,1.7vw,14.5px)/1.3 var(--body);cursor:pointer;transition:transform .12s}
.tabs button:hover{transform:translateY(-2px)}
.tabs button[aria-pressed=true]{margin-bottom:-4px;padding-top:10px;background:var(--paper);box-shadow:inset 0 5px 0 var(--yellow);z-index:1;transform:none}
.win-body{padding:38px 14px 18px;background:var(--paper);background-image:radial-gradient(var(--dot) 1.4px,transparent 1.7px);background-size:14px 14px}
.bar{display:flex;flex-wrap:wrap;align-items:stretch;gap:10px;padding:10px;background:color-mix(in srgb,var(--blue) 12%,var(--paper));border:3px solid var(--ink);box-shadow:inset 0 4px 0 rgba(14,21,48,.1)}
.bar .lock{display:grid;place-items:center;align-self:center;width:28px;font-size:19px;filter:drop-shadow(0 2px 0 rgba(14,21,48,.3))}
.seg{position:relative;flex:1 1 auto;min-width:74px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:8px 10px 7px;border:3px solid var(--ink);background:linear-gradient(115deg,rgba(255,255,255,.42) 0 13%,transparent 13% 21%,rgba(255,255,255,.24) 21% 26%,transparent 26%),var(--c);color:var(--fg,#0e1530);font:800 clamp(18px,2.9vw,29px)/1 var(--display);cursor:pointer;box-shadow:0 5px 0 var(--ink);transition:transform .12s cubic-bezier(.3,1.6,.5,1),box-shadow .12s,opacity .2s}
.seg:hover{transform:translateY(-3px);box-shadow:0 8px 0 var(--ink)}
.seg:active{transform:translateY(4px);box-shadow:0 1px 0 var(--ink)}
.seg[aria-pressed=true]{transform:translateY(3px);box-shadow:0 2px 0 var(--ink),0 0 0 3px var(--paper),0 0 0 6px var(--ink)}
.seg.s1{--c:#fff}.seg.s2{--c:var(--cyan)}.seg.s3{--c:var(--yellow)}.seg.s4{--c:var(--pink);--fg:#fff}.seg.s5{--c:var(--blue);--fg:#fff}
.bar.has-sel .seg[aria-pressed=false]:not(:hover):not(.next){opacity:.78}
.seg .st{display:block}
.seg small{display:block;padding:2px 9px;background:var(--ink);color:var(--paper);font:700 clamp(11px,1.3vw,12.5px)/1.35 var(--body);letter-spacing:.03em}
.seg .mk{position:absolute;top:-11px;right:-8px;display:grid;place-items:center;width:23px;height:23px;border:3px solid var(--ink);border-radius:50%;background:var(--pink);color:#fff;font:900 13px/1 var(--display)}
.seg:not(.seen) .mk{animation:mkpop 2.4s ease-in-out infinite;animation-delay:calc(var(--n,0)*.28s)}
.seg.seen .mk{background:var(--green);color:#06210f}
@keyframes mkpop{0%,66%,100%{transform:scale(1)}78%{transform:scale(1.28) rotate(-10deg)}90%{transform:scale(.94)}}
.seg.next{animation:bump 1.7s ease-in-out infinite}.seg.next:hover{animation:none}
@keyframes bump{0%,52%,100%{transform:none}68%{transform:translateY(-6px)}84%{transform:translateY(0)}}
.seg.next::before{content:'';position:absolute;inset:-5px;border:3px solid var(--pink);pointer-events:none;animation:ripple 1.5s ease-out infinite}
@keyframes ripple{0%{transform:scale(.97);opacity:1}100%{transform:scale(1.16,1.4);opacity:0}}
.tapper{position:absolute;left:50%;top:-40px;translate:-50% 0;z-index:4;pointer-events:none}
.tapper .say{position:relative;display:block;padding:2px 12px 2px 9px;background:var(--pink);color:#fff;border:3px solid var(--ink);box-shadow:3px 3px 0 var(--ink);font:900 14px/1.4 var(--display);white-space:nowrap;animation:hop 1.1s ease-in-out infinite}
.tapper .say .cur{display:inline-block;width:12px;height:15px;margin-right:5px;vertical-align:-3px}
.tapper .say::before,.tapper .say::after{content:'';position:absolute;left:50%;translate:-50% 0;border-style:solid;border-color:transparent;border-bottom:0}
.tapper .say::before{bottom:-13px;border-width:13px 9px 0;border-top-color:var(--ink)}
.tapper .say::after{bottom:-9px;border-width:9px 6px 0;border-top-color:var(--pink)}
@keyframes hop{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
.explain{--ac:var(--ink);--af:#fff;position:relative;display:grid;grid-template-columns:auto 1fr;gap:4px 18px;align-items:center;margin-top:28px;padding:12px 18px;background:var(--paper);border:3px solid var(--ink);border-left:12px solid var(--ac);box-shadow:5px 5px 0 var(--ink);transition:border-color .25s}
.explain[data-c=s1]{--ac:#9fb0ff;--af:#0e1530}.explain[data-c=s2]{--ac:var(--cyan);--af:#0e1530}.explain[data-c=s3]{--ac:var(--yellow);--af:#0e1530}.explain[data-c=s4]{--ac:var(--pink);--af:#fff}.explain[data-c=s5]{--ac:var(--blue);--af:#fff}
.explain::before,.explain::after{content:'';position:absolute;left:var(--ax,60px);translate:-50% 0;border-style:solid;border-color:transparent;border-top:0;transition:left .32s cubic-bezier(.3,1.4,.5,1)}
.explain::before{top:-21px;border-width:0 15px 19px;border-bottom-color:var(--ink)}
.explain::after{top:-17px;border-width:0 11px 14px;border-bottom-color:var(--ac)}
.explain.idle::before,.explain.idle::after{display:none}
.explain .pose{width:78px;filter:drop-shadow(3px 3px 0 rgba(14,21,48,.22));animation:bob 3.4s ease-in-out infinite}
.ex-txt{min-width:0}
.ex-tag{display:inline-block;margin-bottom:4px;padding:2px 11px;background:var(--ac);color:var(--af);border:3px solid var(--ink);box-shadow:2px 2px 0 var(--ink);font:800 12px/1.5 var(--display);letter-spacing:.08em;transform:rotate(-2deg)}
.explain h3{margin:4px 0 2px;font-size:clamp(18px,2.3vw,23px);line-height:1.2}
.explain p{margin:0 0 9px;font-size:15.5px;line-height:1.65}
.explain .b3d.sm{min-height:36px;padding:0 12px;font-size:14.5px}
.explain.swap .ex-txt{animation:swapin .38s cubic-bezier(.2,.8,.2,1)}
@media(max-width:640px){
  .lab{box-shadow:5px 5px 0 var(--ink)}
  .lab-mission{padding:9px 12px;gap:10px;font-size:14.5px}.lab-mission .ico{width:36px;height:36px}.lab-mission p{flex:1 1 140px}
  .prog{margin-left:0;width:100%;justify-content:space-between}
  .dots{display:none}.win-chrome{padding:8px 8px 0}.tabs{width:100%}.tabs button{flex:1 1 0;padding:7px 6px;text-align:center}.tabs button[aria-pressed=true]{padding-top:10px}
  .win-body{padding:36px 8px 16px}.bar{gap:8px;padding:8px}.bar .lock{display:none}
  .seg{min-width:calc(50% - 5px);padding:9px 8px 7px}.seg[aria-pressed=true]{box-shadow:0 2px 0 var(--ink),0 0 0 3px var(--paper),0 0 0 5px var(--ink)}
  .tapper{top:-16px;left:8px;translate:none}.tapper .say{padding:1px 8px 1px 6px;font-size:12px;animation:none}.tapper .say::before,.tapper .say::after{display:none}.tapper .say .cur{width:10px;height:13px;margin-right:4px;vertical-align:-2px}
  .explain{grid-template-columns:1fr;justify-items:center;text-align:center;padding:12px 14px 16px;border-left-width:3px;border-top-width:10px;border-top-color:var(--ac);margin-top:26px}
  .explain::before{top:-30px}.explain::after{top:-26px}
  .explain .pose{width:64px}
}
@media(prefers-reduced-motion:reduce){.lab *,.lab *::before,.lab *::after{animation:none!important}.seg.next::before{opacity:.9}}
/* ending cards */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:22px}
.end{display:flex;flex-direction:column;padding:0;overflow:hidden;background:var(--paper);border:4px solid var(--ink);box-shadow:7px 7px 0 var(--ink);transition:transform .12s cubic-bezier(.3,1.6,.5,1),box-shadow .12s;cursor:default}
.end:hover{transform:translate(-3px,-3px) rotate(-.6deg);box-shadow:10px 10px 0 var(--k)}
.end-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 14px 12px;background:var(--k) repeating-linear-gradient(135deg,rgba(255,255,255,.3) 0 9px,transparent 9px 18px);border-bottom:4px solid var(--ink)}
.end .code{display:inline-block;padding:4px 12px;background:#fff;color:#0e1530;border:3px solid var(--ink);font:800 23px/1.1 var(--display);transform:rotate(-3deg);box-shadow:3px 3px 0 var(--ink)}
.end-ico{display:grid;place-items:center;flex:none;width:50px;height:50px;background:#fff;border:3px solid var(--ink);font-size:27px;line-height:1;transform:rotate(7deg);box-shadow:3px 3px 0 var(--ink)}
.end-body{display:flex;flex:1;flex-direction:column;gap:6px;padding:12px 16px 16px}
.end h3{font-size:20px}.end p{margin:0;color:var(--muted);font-size:15.5px;line-height:1.5}.end .who{font-weight:700;color:var(--ink)}
.end .mut.pair{margin-top:auto;padding:6px 10px;background:color-mix(in srgb,var(--k) 24%,var(--paper));border:2px dashed var(--ink);color:var(--ink);opacity:1;font-size:14.5px}
/* compare */
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.cmp .panel{padding:20px}.cmp .big{font:800 clamp(40px,7vw,64px)/1 var(--display);-webkit-text-stroke:4px #0e1530;paint-order:stroke fill;text-shadow:5px 5px 0 #0e1530;color:#fff;margin-bottom:10px}
.cmp .panel.a{background:var(--blue);color:#fff}.cmp .panel.b{background:var(--yellow);color:#0e1530}.cmp .panel.b .big{color:var(--pink)}
.cmp ul{margin:0;padding-left:20px}.cmp li{margin:5px 0}
.fact{margin-top:22px;padding:14px 18px;background:var(--paper2);border:4px dashed var(--ink);font-size:16.5px}
.fact code{padding:2px 8px;background:var(--ink);color:var(--paper);font:700 15px var(--display)}
/* steps */
.chain{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;counter-reset:s}
.step{position:relative;padding:28px 14px 16px;background:var(--paper);border:4px solid var(--ink);box-shadow:6px 6px 0 var(--ink)}
.step::before{counter-increment:s;content:counter(s);position:absolute;left:-12px;top:-16px;display:grid;place-items:center;width:40px;height:40px;background:var(--pink);color:#fff;border:3px solid var(--ink);font:900 20px/1 var(--display);transform:rotate(-8deg)}
.step:nth-child(1){--sc:#ffd400}.step:nth-child(2){--sc:#00cdb8}.step:nth-child(3){--sc:#ff9ac8}.step:nth-child(4){--sc:#a9b8ff}
.step{border-top:10px solid var(--sc,var(--ink))}
.step::before{background:var(--sc,var(--pink))!important;color:#0e1530!important}
#who .fact:first-of-type{background:color-mix(in srgb,var(--yellow) 26%,var(--paper));border-style:solid;border-left-width:12px;border-left-color:var(--yellow)}
#who .fact:last-of-type{background:color-mix(in srgb,var(--cyan) 20%,var(--paper));border-style:solid;border-left-width:12px;border-left-color:var(--cyan)}
.step h3{font-size:18px;margin:6px 0 2px}.step p{margin:0;font-size:15px;color:var(--muted);line-height:1.5}
.step:not(:last-child)::after{content:'›';position:absolute;right:-17px;top:42%;z-index:2;font:900 34px/1 var(--display);color:var(--ink)}
/* tips */
.tips{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.tip{display:flex;gap:14px;padding:16px;background:var(--paper);border:4px solid var(--ink);box-shadow:6px 6px 0 var(--ink)}
.tip i{display:grid;place-items:center;flex:none;width:50px;height:50px;background:var(--c);border:3px solid var(--ink);font-style:normal;font-size:24px;transform:rotate(-5deg)}
.tip h3{font-size:18px}.tip p{margin:2px 0 0;font-size:15.5px;color:var(--muted);line-height:1.5}
.tip p b{color:var(--ink)}
.slot{position:relative;display:grid;place-items:center;min-height:200px;margin-bottom:22px;overflow:hidden;background:var(--paper2);background-image:radial-gradient(var(--dot) 1.4px,transparent 1.7px);background-size:14px 14px;border:4px solid var(--ink);box-shadow:8px 8px 0 var(--ink)}
.slot img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.slot span{font:700 14px var(--display);letter-spacing:.14em;color:var(--muted);padding:10px;text-align:center}
.slot.has span{display:none}
.slot.has{min-height:0;aspect-ratio:16/9;padding:0}
@media(max-width:560px){.slot.has{aspect-ratio:16/9}}
/* quiz */
.quiz{padding:22px}.qtop{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.pips{display:flex;gap:6px}.pips i{width:26px;height:12px;background:var(--paper2);border:3px solid var(--ink)}.pips i.on{background:var(--yellow)}.pips i.bad{background:var(--red)}.pips i.ok{background:var(--green)}
.quiz h3{font-size:clamp(20px,3.4vw,27px);line-height:1.35;margin-bottom:16px}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.opt{display:flex;gap:12px;align-items:center;text-align:left;padding:12px 14px;background:var(--paper);color:var(--ink);border:4px solid var(--ink);box-shadow:5px 5px 0 var(--ink);font:600 16.5px/1.4 var(--body);cursor:pointer;transition:transform .1s}
.opt:hover:not(:disabled){transform:translate(-2px,-2px)}.opt b{display:grid;place-items:center;flex:none;width:34px;height:34px;background:var(--yellow);color:#0e1530;border:3px solid var(--ink);font:800 16px var(--display)}
.opt.right{background:var(--green);color:#06210f}.opt.wrong{background:var(--red);color:#fff}.opt:disabled{cursor:default}
.fb{margin-top:16px;padding:12px 16px;border:4px solid var(--ink);background:var(--paper2);font-size:16px}.fb[hidden]{display:none}
.result{display:flex;gap:20px;align-items:center;flex-wrap:wrap}.result .pose{width:130px}.result h3{font-size:28px;margin-bottom:6px}
.cta2{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;padding:34px 0 10px}
.foot{position:relative;isolation:isolate;overflow:hidden;margin:46px calc(50% - 50vw) 0;padding:52px calc(50vw - 50%) 34px;text-align:center;color:#c9d4ee;background:#0e1530;background-image:radial-gradient(rgba(255,255,255,.09) 1.4px,transparent 1.7px),radial-gradient(ellipse at 12% 0,rgba(255,46,136,.28),transparent 46%),radial-gradient(ellipse at 88% 0,rgba(0,205,184,.26),transparent 46%);background-size:16px 16px,auto,auto;font-size:15px}
.foot::before{content:'';position:absolute;left:0;right:0;top:0;height:12px;background:linear-gradient(90deg,#ff2e88 0 25%,#ffd400 25% 50%,#00cdb8 50% 75%,#3b5bff 75%);border-bottom:4px solid #fff}
.foot-eyebrow{margin:0 0 4px;color:var(--yellow);font:800 12.5px/1 var(--display);letter-spacing:.42em}
.foot-ghost{display:inline-block;margin:0;font:900 clamp(44px,11vw,118px)/1.05 var(--display);letter-spacing:.01em;background:linear-gradient(100deg,#fff 4%,#ffd400 38%,#ff78b7 68%,#fff 96%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(5px 5px 0 #ff2e88)}
.foot-tag{margin:10px 0 6px;color:#fff;font:700 13px/1.5 var(--display);letter-spacing:.18em}
.foot-copy{margin:0 0 22px;font-size:14.5px;line-height:1.7}
.foot a{color:#fff;font-weight:800;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
.foot a:hover{color:var(--yellow)}
.foot-license{display:inline-flex;align-items:center;gap:16px;max-width:600px;padding:12px 18px;background:#fff;border:4px solid #0e1530;box-shadow:7px 7px 0 var(--pink);text-align:left;text-decoration:none!important;transition:transform .12s cubic-bezier(.3,1.6,.5,1),box-shadow .12s}
.foot-license:hover{transform:translate(-3px,-3px);box-shadow:10px 10px 0 var(--yellow)}
.foot-license img{flex:none;width:106px;height:auto;image-rendering:auto}
.foot-license b{display:block;color:#0e1530;font:800 16px/1.3 var(--display)}
.foot-license span{display:block;margin-top:3px;color:#3f4a66;font:600 13.5px/1.55 var(--body)}
.foot .ai-note{margin-top:26px}
.foot .ai-btn{box-shadow:3px 3px 0 var(--pink)}
@media(max-width:560px){.foot{padding-top:46px;padding-bottom:92px}.foot-license{flex-direction:column;text-align:center;gap:10px}}
@media(max-width:860px){.hero{grid-template-columns:1fr}.dom-art{min-height:0}.cmp,.tips,.opts{grid-template-columns:1fr}.chain{grid-template-columns:1fr 1fr;gap:26px 18px}.step:nth-child(2n)::after{display:none}}
@media(max-width:560px){body{font-size:16px}.chain{grid-template-columns:1fr}.step::after{display:none!important}.sh .no{width:46px;height:46px;font-size:20px}.dom-art .pose{width:96px}}

.toc{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 8px;padding:0}
.toc a{padding:7px 14px;background:var(--paper2);border:3px solid var(--ink);box-shadow:3px 3px 0 var(--ink);font:700 15px/1.3 var(--body);transition:transform .1s}
.toc a:hover{transform:translate(-2px,-2px);background:var(--yellow);color:#0e1530}
.tblwrap{overflow-x:auto;border:4px solid var(--ink);box-shadow:8px 8px 0 var(--ink);background:var(--paper)}
.tbl{width:100%;min-width:640px;border-collapse:collapse;font-size:15.5px;line-height:1.5}
.tbl th,.tbl td{padding:12px 14px;text-align:left;vertical-align:top;border-bottom:3px solid var(--ink)}
.tbl tr:last-child th,.tbl tr:last-child td{border-bottom:0}
.tbl thead th{background:var(--ink);color:var(--paper);font:800 20px/1.2 var(--display)}
.tbl thead th:nth-child(2){background:var(--blue);color:#fff}.tbl thead th:nth-child(3){background:var(--yellow);color:#0e1530}
.tbl tbody th{width:130px;background:var(--paper2);font:800 15.5px/1.4 var(--display)}
.tbl td:nth-child(2){background:color-mix(in srgb,var(--blue) 9%,var(--paper))}.tbl td:nth-child(3){background:color-mix(in srgb,var(--yellow) 18%,var(--paper))}
.end .mut{font-size:13.5px;opacity:.8}
.refs{margin:0 0 18px;padding-left:22px}.refs li{margin:8px 0}.refs a{font-weight:800;text-decoration:underline;text-underline-offset:3px}
.ai-note{margin:14px auto 0;text-align:center}
.ai-btn{padding:6px 16px;background:var(--paper2);color:var(--ink);border:3px solid var(--ink);box-shadow:3px 3px 0 var(--ink);font:700 14px/1.4 var(--body);cursor:pointer;transition:transform .1s}
.ai-btn:hover{transform:translate(-2px,-2px)}.ai-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink)}
.swal2-popup.ai-popup{font-family:'Kanit',sans-serif;border:4px solid #0e1530;border-radius:8px;box-shadow:8px 8px 0 #0e1530}
.ai-popup .swal2-title{font-size:21px;font-weight:700}
.ai-popup .ai-body{text-align:left;font-size:14.5px;line-height:1.65;color:#2b3555}
.ai-popup .ai-ok{border:3px solid #0e1530!important;border-radius:6px!important;box-shadow:4px 4px 0 #0e1530!important;color:#0e1530!important;font-weight:800;font-family:inherit}
.ai-fallback{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:16px;background:rgba(14,21,48,.7)}
.ai-fallback>div{width:min(640px,100%);max-height:85%;overflow:auto;padding:20px 22px;background:#fff;color:#0e1530;border:4px solid #0e1530;box-shadow:8px 8px 0 #0e1530;font-family:'Kanit',sans-serif}
.ai-fallback button{margin-top:14px;padding:8px 22px;border:3px solid #0e1530;background:#ffd400;color:#0e1530;font:800 15px 'Kanit',sans-serif;cursor:pointer}
.ai-body dl{margin:0}.ai-body dt{margin-top:10px;font-weight:800}.ai-body dd{margin:2px 0 0;color:var(--muted)}.ai-body ul{margin:2px 0 0;padding-left:20px}
@media(max-width:560px){.tbl{font-size:14.5px}.tbl tbody th{width:96px}}

.addr-wrap{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:center;margin:0 0 26px}
.addr-wrap .slot{margin:0}
.addr-key-h{margin:0 0 8px;font:700 14px/1.45 var(--body);color:var(--muted)}
.addr-key{display:flex;flex-direction:column;gap:7px;margin:0;padding:0;list-style:none}
.addr-key li{--k:#7ddc4a;display:grid;grid-template-columns:44px minmax(0,1fr);gap:0 11px;align-items:start;padding:6px 10px 7px 9px;background:var(--paper);border:3px solid var(--ink);border-left:8px solid var(--k);box-shadow:3px 3px 0 var(--ink)}
.addr-key .ico{grid-row:1 / span 2;display:block;box-sizing:content-box;width:40px;height:40px;border:2px solid var(--ink);background-color:var(--k);background-image:url(domain-th/domain-th-02-address-bar.webp?v=__V02__);background-repeat:no-repeat;background-size:calc(1600px*40/var(--w)) auto;background-position:calc(-1px*(var(--cx) - var(--w)/2)*40/var(--w)) calc(-1px*(480 - var(--w)/2)*40/var(--w))}
.addr-key h4{margin:0;font:800 15px/1.35 var(--display)}
.addr-key p{margin:0;font-size:13.5px;line-height:1.5}
@media(max-width:900px){.addr-wrap{grid-template-columns:1fr;gap:14px}}
.thnic{margin:34px 0 8px;background:var(--paper);border:4px solid var(--ink);box-shadow:8px 8px 0 var(--ink);overflow:hidden}
.th-head{display:flex;align-items:center;gap:18px;padding:18px 22px;color:#fff;background-color:#3b5bff;background-image:radial-gradient(rgba(255,255,255,.2) 1.4px,transparent 1.7px),linear-gradient(135deg,#3b5bff,#7c4dff);background-size:14px 14px,auto;border-bottom:4px solid var(--ink)}
.th-ico{flex:none;display:grid;place-items:center;width:68px;height:68px;background:var(--yellow);border:4px solid #fff;box-shadow:4px 4px 0 #0e1530;font-size:34px;line-height:1;transform:rotate(-5deg)}
.th-head .tag{background:var(--yellow);color:#0e1530;box-shadow:3px 3px 0 #0e1530}
.th-head h3{margin:8px 0 0;font:900 clamp(28px,4.4vw,42px)/1.1 var(--display);text-shadow:3px 3px 0 #0e1530}
.th-full{margin:6px 0 0;font:700 17px/1.4 var(--body)}.th-full small{display:block;font:600 13px/1.5 var(--display);letter-spacing:.05em;opacity:.92}
.th-chips{display:flex;flex-wrap:wrap;gap:10px;margin:0;padding:16px 22px 0;list-style:none}
.th-chips li{padding:5px 14px;background:var(--paper2);border:3px solid var(--ink);box-shadow:3px 3px 0 var(--ink);font:700 14.5px/1.4 var(--body)}
.th-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:16px;padding:16px 22px 4px}
.th-card{--c:#ffd400;padding:12px 14px 14px;background:var(--paper);border:3px solid var(--ink);border-top:9px solid var(--c);box-shadow:4px 4px 0 var(--ink)}
.th-card i{display:grid;place-items:center;width:40px;height:40px;margin-bottom:6px;background:var(--c);border:3px solid var(--ink);font-style:normal;font-size:21px;line-height:1}
.th-card h4{margin:0 0 4px;font:800 17px/1.3 var(--display)}.th-card p{margin:0;font-size:15px;line-height:1.65;color:var(--muted)}
.th-note{margin:14px 22px 0;padding:10px 14px;background:color-mix(in srgb,var(--cyan) 20%,var(--paper));border-left:10px solid var(--cyan);font-size:15.5px;line-height:1.65}
.th-links{margin:12px 22px 18px;font-size:15px}.th-links a{font-weight:800;text-decoration:underline;text-underline-offset:3px}
.th-svc{margin:18px 22px 0;padding:16px;border:4px solid var(--ink);box-shadow:5px 5px 0 var(--ink);background-color:color-mix(in srgb,var(--yellow) 24%,var(--paper));background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.32) 0 12px,transparent 12px 24px)}
.th-svc-h{margin:0 0 4px;font:900 clamp(19px,2.8vw,24px)/1.3 var(--display)}
.th-svc-lead{margin:0 0 12px;font-size:15.5px;line-height:1.65}
.th-svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.svc{--c:#7ddc4a;display:flex;flex-direction:column;gap:6px;padding:12px 14px 12px;background:var(--paper);color:var(--ink);border:3px solid var(--ink);border-left:10px solid var(--c);box-shadow:4px 4px 0 var(--ink);text-decoration:none;transition:transform .12s cubic-bezier(.3,1.6,.5,1),box-shadow .12s}
.svc:hover{transform:translate(-3px,-3px);box-shadow:7px 7px 0 var(--c)}
.svc i{display:grid;place-items:center;width:38px;height:38px;background:var(--c);border:3px solid var(--ink);font-style:normal;font-size:20px;line-height:1}
.svc b{font:800 17px/1.3 var(--display)}.svc span{font-size:14.5px;line-height:1.6;color:var(--muted)}
.svc em{margin-top:auto;padding-top:4px;font:800 14.5px/1.3 var(--body);font-style:normal;color:var(--blue);text-decoration:underline;text-underline-offset:3px}
.th-svc-note{margin:12px 0 0;font-size:14.5px;line-height:1.65}
@media(max-width:560px){.th-head{flex-direction:column;align-items:flex-start;padding:16px}.th-chips,.th-grid{padding-inline:14px}.th-note,.th-links,.th-svc{margin-inline:14px}.th-svc{padding:12px}}
/* ===== มาสคอตนำทาง (เทคโนผู้นำทาง): ชี้เมาส์หรือกดแล้วขึ้นเมนูลัดแถวยาว ===== */
.mascot{position:fixed;right:20px;bottom:14px;z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:none}
.mascot>*{pointer-events:auto}
.mascot.mc-away{display:none}
.mc-menu{display:flex;flex-direction:column;min-width:232px;max-height:calc(100vh - 200px);overflow-y:auto;padding:6px 0;background:rgba(14,21,48,.96);color:#fff;box-shadow:0 10px 26px rgba(14,21,48,.45);transform-origin:bottom right;animation:mcin .22s cubic-bezier(.3,1.4,.5,1)}
.mc-menu[hidden]{display:none}
@keyframes mcin{from{opacity:0;transform:translateY(8px) scale(.96)}}
.mc-it{display:flex;align-items:center;gap:10px;padding:7px 18px 7px 14px;border:0;border-left:4px solid transparent;background:transparent;color:inherit;font:600 14.5px/1.35 var(--body);text-align:left;white-space:nowrap;cursor:pointer}
.mc-it::before{content:'';flex:none;width:8px;height:8px;background:var(--k,#fff);transform:rotate(45deg)}
.mc-it:hover,.mc-it:focus-visible{background:rgba(255,255,255,.13);outline:none}
.mc-it.on{border-left-color:var(--k,#fff);background:rgba(255,255,255,.08)}
.mc-it.hot{color:#ffd400;font-weight:800}
.mc-char{position:relative;width:132px;height:150px;padding:0;border:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}
.mc-char::before{content:'';position:absolute;left:50%;bottom:14px;width:90px;height:90px;translate:-50% 0;border-radius:50%;background:radial-gradient(circle,rgba(255,46,136,.5),rgba(255,212,0,.28) 55%,transparent 70%)}
.mc-bob{position:absolute;left:0;right:0;top:0;bottom:16px;display:block;animation:mcbob 3.2s ease-in-out infinite}
.mc-char img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(3px 4px 0 rgba(14,21,48,.4))}
@keyframes mcbob{50%{transform:translateY(-6px)}}
.mc-badge{position:absolute;z-index:3;left:50%;bottom:0;translate:-50% 0;display:inline-flex;align-items:center;gap:6px;padding:4px 11px;background:#0e1530;color:#fff;font:800 10.5px/1.2 var(--display);letter-spacing:.12em;white-space:nowrap}
.mc-badge i{width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan)}
@media(max-width:560px){.mascot{right:8px;bottom:calc(10px + env(safe-area-inset-bottom,0px))}.mc-char{width:100px;height:118px}.mc-badge{font-size:9.5px;padding:3px 8px}.mc-char::before{width:68px;height:68px}.mc-it{font-size:14px;padding:6px 16px 6px 12px}.mc-menu{min-width:214px}}
@media(prefers-reduced-motion:reduce){.mc-bob,.mc-menu{animation:none!important}}
.slot:not(.has){display:none}
.band{position:relative;margin-inline:calc(50% - 50vw);padding-inline:calc(50vw - 50%);border-block:4px solid var(--ink)}
.band-a{background:color-mix(in srgb,var(--blue) 9%,var(--paper));background-image:radial-gradient(var(--dot) 1.4px,transparent 1.7px);background-size:16px 16px}
.band-c{background:color-mix(in srgb,var(--pink) 10%,var(--paper));background-image:radial-gradient(var(--dot) 1.4px,transparent 1.7px);background-size:16px 16px}
.band-b{background:color-mix(in srgb,var(--yellow) 22%,var(--paper));background-image:radial-gradient(var(--dot) 1.4px,transparent 1.7px);background-size:16px 16px}
.band+.band,.sec+.band{margin-top:30px}.band+.sec{margin-top:30px}
.toc a.on{background:var(--yellow);color:#0e1530;transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--ink)}
.dom-art .pose{animation:bob 3.4s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-9px) rotate(2deg)}}
.rv{opacity:0;translate:0 20px;transition:opacity .55s ease,translate .55s cubic-bezier(.2,.8,.2,1)}
.rv.in{opacity:1;translate:none}
.totop{position:fixed;left:16px;bottom:16px;z-index:50}
.totop[hidden]{display:none}
@media(max-width:640px){
  .tbl{min-width:0}.tbl thead{display:none}
  .tbl,.tbl tbody,.tbl tr,.tbl th,.tbl td{display:block;width:100%}
  .tblwrap{overflow:visible;border:0;box-shadow:none;background:transparent}
  .tbl tr{margin-bottom:18px;background:var(--paper);border:4px solid var(--ink);box-shadow:5px 5px 0 var(--ink)}
  .tbl tbody th{width:auto;background:var(--ink);color:var(--paper);border-bottom:0;font-size:16px}
  .tbl td{display:flex!important;gap:10px;align-items:flex-start;border-bottom:2px dashed var(--dot);background:var(--paper)!important}
  .tbl tr td:last-child{border-bottom:0}
  .tbl td::before{content:attr(data-label);flex:none;display:inline-block;min-width:58px;margin-top:2px;padding:0 8px;border:2px solid var(--ink);background:var(--yellow);color:#0e1530;font:800 13px/1.6 var(--display);text-align:center}
}

/* ===== เกม 3 ด่าน ===== */
.game{padding:0;overflow:hidden}
.hud{position:relative;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between;padding:12px 16px 18px;background:#0e1530;color:#fff;border-bottom:4px solid var(--ink)}
.chips-st{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.chips-st li{padding:5px 12px;border:3px solid #fff;color:#fff;font:700 14px/1.3 var(--body);opacity:.6}
.chips-st li.on{background:var(--yellow);color:#0e1530;border-color:var(--yellow);opacity:1;transform:rotate(-2deg);box-shadow:3px 3px 0 var(--pink)}
.chips-st li.done{background:var(--green);color:#06210f;border-color:var(--green);opacity:1}
.chips-st li.done::before{content:'✓ '}
.hud-r{display:flex;align-items:center;gap:12px}
.score{padding:4px 14px;background:var(--pink);color:#fff;border:3px solid #fff;font:800 16px/1.4 var(--display);transform:rotate(1.5deg)}
.time{min-width:92px;padding:4px 12px;background:#fff;color:#0e1530;border:3px solid var(--yellow);font:800 17px/1.4 var(--display);text-align:center}
.hud.hurry .time{background:var(--red);color:#fff;animation:throb .5s ease-in-out infinite alternate}
@keyframes throb{to{transform:scale(1.1)}}
.hud .b3d.sm{min-height:36px;font-size:14px}
.tbar{position:absolute;left:0;right:0;bottom:0;height:8px;background:rgba(255,255,255,.18)}
.tbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--cyan),var(--yellow));transition:width .2s linear}
.hud.hurry .tbar i{background:var(--red)}
.arena{position:relative;min-height:380px;padding:22px 20px 26px}
.arena.swap{animation:swapin .35s cubic-bezier(.2,.8,.2,1)}
@keyframes swapin{from{opacity:0;transform:translateY(14px) scale(.98)}}
.how{margin:0 0 16px;padding:10px 14px;background:var(--paper2);border:3px dashed var(--ink);font-weight:600}
.intro{display:flex;gap:26px;align-items:center;flex-wrap:wrap}
.intro .pose{width:190px;flex:none;filter:drop-shadow(5px 5px 0 rgba(14,21,48,.35));animation:bob 3.4s ease-in-out infinite}
.intro h3{font-size:30px;margin-bottom:8px}
.rules{margin:0 0 18px;padding-left:22px}.rules li{margin:6px 0}
.cd{display:grid;place-items:center;min-height:320px}
.cd b{font:900 150px/1 var(--display);color:var(--yellow);-webkit-text-stroke:6px #0e1530;paint-order:stroke fill;text-shadow:8px 8px 0 #0e1530;animation:boom .7s ease-out}
.cd b.go{color:var(--pink);font-size:110px}
@keyframes boom{from{transform:scale(2.2) rotate(-8deg);opacity:0}60%{transform:scale(.95) rotate(2deg);opacity:1}to{transform:scale(1)}}
.res{text-align:center;padding:18px 0}.res h3{font-size:30px}
.stars{margin:8px 0;font-size:44px;line-height:1;color:var(--yellow);-webkit-text-stroke:3px #0e1530;letter-spacing:4px}
.stars span{color:var(--paper2)}
.big-n{margin:6px 0;font-size:24px}.big-n b{font:900 54px/1 var(--display);color:var(--pink);text-shadow:3px 3px 0 var(--ink)}
.mut{color:var(--muted)}
.mt{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.col{display:grid;gap:14px;align-content:start}
.tile,.card-d{padding:14px 16px;background:var(--paper);color:var(--ink);border:4px solid var(--ink);box-shadow:5px 5px 0 var(--ink);font:700 17px/1.35 var(--body);cursor:pointer;text-align:center;transition:transform .1s}
.tile:hover:not(.ok),.card-d:hover:not(:disabled){transform:translate(-2px,-2px)}
.tile.sel,.card-d.sel{background:var(--yellow);transform:translate(-3px,-3px) rotate(-1.5deg);box-shadow:7px 7px 0 var(--pink)}
.tile.ok,.card-d.ok{background:var(--green);color:#06210f;box-shadow:2px 2px 0 var(--ink);transform:none;cursor:default;animation:okpop .4s}
@keyframes okpop{50%{transform:scale(1.08)}}
.tile.no,.card-d.no{animation:shake .4s;background:#ffd9d9}
@keyframes shake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
.combo{min-height:28px;margin:14px 0 0;text-align:center;font:800 18px/1.4 var(--display);color:var(--pink)}
.pop{position:absolute;z-index:5;translate:-50% 0;font:900 26px/1 var(--display);color:var(--green);-webkit-text-stroke:2px #0e1530;paint-order:stroke fill;pointer-events:none;animation:rise .9s ease-out forwards}
.pop.bad{color:var(--red)}
@keyframes rise{to{transform:translateY(-54px);opacity:0}}
.pool{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;min-height:62px;margin-bottom:20px}
.card-d{cursor:grab}.card-d:disabled{opacity:1}
.buckets{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.bucket{display:flex;flex-direction:column;gap:10px;min-height:190px;padding:14px;border:4px dashed var(--ink);background:var(--paper2);color:var(--ink);font:inherit;cursor:pointer;text-align:center;transition:background .15s,transform .15s}
.bucket b{font:800 19px/1.3 var(--display)}
.bucket.th{background:color-mix(in srgb,var(--blue) 14%,var(--paper))}.bucket.ot{background:color-mix(in srgb,var(--yellow) 24%,var(--paper))}
.bucket:hover,.bucket.over{transform:scale(1.02);border-style:solid;box-shadow:6px 6px 0 var(--pink)}
.bucket .in{display:flex;flex-direction:column;gap:8px}
.bucket .card-d{box-shadow:3px 3px 0 var(--ink);padding:8px 12px;font-size:15px}
.qtop{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.qh{font-size:clamp(20px,3.4vw,27px);line-height:1.35;margin:0 0 16px}
.sum{display:flex;gap:26px;align-items:center;flex-wrap:wrap;margin-bottom:22px}
.ring{display:grid;place-items:center;align-content:center;width:150px;height:150px;flex:none;border-radius:50%;background:var(--paper2);border:6px solid var(--ink);box-shadow:6px 6px 0 var(--ink)}
.ring.pass{background:var(--yellow);animation:boom .8s ease-out}
.ring b{font:900 54px/1 var(--display)}.ring small{font:700 13px var(--body)}
.sum h3{font-size:26px}
.bars{margin:10px 0 0;padding:0;list-style:none;display:grid;gap:8px;min-width:min(420px,100%)}
.bars li{display:grid;grid-template-columns:130px 1fr 56px;gap:10px;align-items:center;font-size:15px}
.bars i{display:block;height:14px;background:var(--paper2);border:3px solid var(--ink)}.bars u{display:block;height:100%;background:var(--green)}
.row-btn{display:flex;gap:12px;flex-wrap:wrap}
.cert-box{display:grid;grid-template-columns:minmax(280px,.8fr) 1.2fr;gap:28px;align-items:start;padding-top:20px;border-top:4px dashed var(--ink)}
.form{display:grid;gap:8px}.form h3{font-size:24px;margin-bottom:4px}
.form label{font-weight:700;font-size:15px}
.form input{padding:11px 12px;border:4px solid var(--ink);background:var(--paper);color:var(--ink);font:600 17px var(--body)}
.form input:focus-visible{outline:4px solid var(--blue);outline-offset:2px}
.form .mut{margin:4px 0;font-size:14px}
.cert-fit{position:relative;width:100%;overflow:hidden;border:4px solid var(--ink);box-shadow:8px 8px 0 var(--ink);background:#fff}
.cert-stage{position:absolute;left:0;top:0;width:794px;height:1123px;transform-origin:0 0}
#toast{position:fixed;left:50%;bottom:76px;z-index:80;translate:-50% 20px;padding:10px 20px;background:#0e1530;color:#fff;border:3px solid var(--yellow);font:700 16px var(--body);opacity:0;pointer-events:none;transition:opacity .25s,translate .25s}
#toast.show{opacity:1;translate:-50% 0}
#fx{position:fixed;inset:0;z-index:70;pointer-events:none;overflow:hidden}
#fx i{position:absolute;top:-16px;width:11px;height:16px;border:2px solid #0e1530;animation:fall var(--d,2s) ease-in forwards}
@keyframes fall{to{transform:translate(var(--dx),110vh) rotate(var(--r))}}
/* เกียรติบัตร A4 (ขนาด 794x1123 px = 210x297 mm ที่ 96 dpi) สีคงที่ ไม่ขึ้นกับธีมมืด */
.cert{position:relative;width:794px;height:1123px;padding:50px 58px 0;background:#fffdf3;background-image:radial-gradient(rgba(14,21,48,.1) 1.4px,transparent 1.7px);background-size:16px 16px;color:#0e1530;text-align:center;border:16px solid #0e1530;box-shadow:inset 0 0 0 10px #ffd400,inset 0 0 0 14px #0e1530;font-family:'Kanit',sans-serif;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cert::before,.cert::after,.c-corner{content:'';position:absolute;width:150px;height:150px;background:#ff2e88;border:6px solid #0e1530;transform:rotate(45deg)}
.cert::before{left:-92px;top:-92px}.cert::after{right:-92px;bottom:-92px;background:#3b5bff}
.c-corner.tr{right:-92px;top:-92px;background:#ffd400}.c-corner.bl{left:-92px;bottom:-92px;background:#00cdb8}
.cert>*{position:relative;z-index:1}
.cert>.c-rays,.cert>.c-inner,.cert>.c-corner{position:absolute;z-index:0}
.cert>.c-rays{inset:0;background:repeating-conic-gradient(from -3deg at 50% 190px,rgba(255,212,0,.3) 0 6deg,rgba(255,255,255,0) 6deg 12deg);-webkit-mask-image:radial-gradient(circle at 50% 190px,#000 0,#000 150px,transparent 560px);mask-image:radial-gradient(circle at 50% 190px,#000 0,#000 150px,transparent 560px)}
.cert>.c-inner{inset:24px;border:3px dashed rgba(14,21,48,.32)}
.c-tag{display:inline-block;padding:7px 22px;background:#ff2e88;color:#fff;border:4px solid #0e1530;font:800 17px/1 'Chakra Petch','Kanit',sans-serif;letter-spacing:.14em;transform:rotate(-2deg);box-shadow:5px 5px 0 #0e1530}
.c-title{margin:14px 0 0;font:900 94px/1.05 'Chakra Petch','Kanit',sans-serif;color:#ffd400;-webkit-text-stroke:5px #0e1530;paint-order:stroke fill;text-shadow:7px 7px 0 #0e1530}
.c-title::before,.c-title::after{font-size:.5em;vertical-align:.45em;margin:0 .22em}
.c-title::before{content:'✦';color:#ff2e88}.c-title::after{content:'✦';color:#3b5bff}
.c-sub{display:inline-block;margin:2px 0 16px;padding:5px 30px;background:#3b5bff;color:#fff;border:4px solid #0e1530;box-shadow:4px 4px 0 #0e1530;font:800 16px/1.3 'Chakra Petch',sans-serif;letter-spacing:.3em;transform:skewX(-8deg)}
.c-lead{margin:0;font-size:23px}
.c-name{margin:12px auto 2px;max-width:640px;padding:6px 12px 4px;border-bottom:6px solid #ff2e88;font:800 54px/1.25 'Kanit',sans-serif;overflow-wrap:anywhere}
.c-name.m{font-size:40px}.c-name.s{font-size:28px}
.c-school{margin:8px 0 0;font-size:24px;font-weight:600}
.c-rank{display:inline-flex;align-items:center;gap:14px;margin:14px auto 0;padding:7px 26px;border:4px solid #0e1530;box-shadow:5px 5px 0 #0e1530;font:800 24px/1.3 'Kanit',sans-serif;transform:rotate(-1.2deg)}
.c-rank i{font-style:normal;color:#ff2e88;font-size:22px;-webkit-text-stroke:1px #0e1530}
.c-rank.r3{background:linear-gradient(#fff0a0,#ffc400)}.c-rank.r2{background:linear-gradient(#ffffff,#c6d0e6)}.c-rank.r1{background:linear-gradient(#ffe2c8,#f0a468)}
.c-body{margin:12px auto 0;max-width:610px;font-size:22px;line-height:1.5}
.c-stats{display:flex;justify-content:center;gap:18px;margin:16px 0 0}
.c-box{min-width:168px;padding:9px 14px;background:#fff;border:5px solid #0e1530;box-shadow:6px 6px 0 #0e1530}
.c-box:nth-child(1){background:#ffd400}.c-box:nth-child(2){background:#00cdb8}.c-box:nth-child(3){background:#ff9ac8}
.c-box small{display:block;font:700 15px/1.2 'Kanit',sans-serif;letter-spacing:.06em}.c-box b{display:block;font:900 30px/1.3 'Chakra Petch','Kanit',sans-serif}
.c-skills{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin:14px 0 0}
.c-skills span{padding:5px 14px 5px 10px;border:3px solid #0e1530;box-shadow:3px 3px 0 #0e1530;font:700 17px/1.3 'Kanit',sans-serif}
.c-skills span::before{content:'✓';display:inline-grid;place-items:center;width:22px;height:22px;margin-right:7px;background:#0e1530;color:#ffd400;font:900 14px/1 'Kanit',sans-serif;border-radius:50%}
.c-skills span:nth-child(1){background:#fff4a8}.c-skills span:nth-child(2){background:#b8f3ea}.c-skills span:nth-child(3){background:#ffd3e6}
.c-pose{position:absolute!important;right:14px;bottom:28px;width:360px;height:auto;filter:drop-shadow(6px 6px 0 rgba(14,21,48,.28))}
.c-date{position:absolute!important;left:64px;bottom:236px;margin:0;font-size:21px;font-weight:600}
.c-sign{position:absolute!important;left:64px;bottom:62px;width:300px;text-align:center}
.c-sign .c-signimg{position:relative;display:block;height:92px;width:auto;margin:0 auto -22px;z-index:2}
.c-sign i{display:block;height:0;border-top:4px solid #0e1530;margin-bottom:8px}
.c-sign b{display:block;font:800 27px/1.25 'Kanit',sans-serif}.c-sign small{display:block;font-size:18px;line-height:1.5;color:#3f4a66}
.c-seal{position:absolute!important;left:372px;bottom:60px;width:122px;height:auto;filter:drop-shadow(4px 5px 0 rgba(14,21,48,.25))}
#cert-print{display:none}
@media(max-width:860px){.cert-box{grid-template-columns:1fr}.mt,.buckets{grid-template-columns:1fr 1fr;gap:12px}.intro .pose{width:130px}.hud{padding-bottom:20px}}
@media(max-width:560px){
  .arena{padding:16px 12px 22px;min-height:320px}.tile,.card-d{padding:11px 8px;font-size:15px}.mt{gap:10px}.col{gap:10px}
  .buckets{gap:10px}.bucket{min-height:160px;padding:10px 8px}.bucket b{font-size:15.5px}
  .chips-st li{font-size:12.5px;padding:4px 8px}.cd b{font-size:110px}.cd b.go{font-size:80px}.intro h3{font-size:24px}
  .bars li{grid-template-columns:1fr 1fr 46px}.bars li span{grid-column:1/-1;font-weight:700}.ring{width:120px;height:120px}.ring b{font-size:42px}
}
@media(prefers-reduced-motion:reduce){.intro .pose,.cd b,.ring.pass,.tile.ok,.arena.swap,.hud.hurry .time{animation:none!important}}
@media print{
  @page{size:A4 portrait;margin:0}
  html,body{background:#fff!important;margin:0!important}
  body.printing .wrap,body.printing .mascot,body.printing .totop,body.printing .bg,body.printing #fx,body.printing #toast,body.printing .swal2-container{display:none!important}
  body.printing #cert-print{display:block!important;width:210mm;height:297mm;overflow:hidden}
  body.printing #cert-print .cert{transform:none;width:210mm;height:297mm;box-sizing:border-box}
}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}.dom-art .pose{animation:none}.rv{opacity:1;translate:none}}
"""

BODY = r"""
<div class="bg" aria-hidden="true"></div>
<div class="wrap" id="top">
  <header class="top"><a class="brand" href="__BASE__" target="_blank" rel="noopener noreferrer"><img src="__LOGO__" alt="" width="44" height="44"><span>KRUKAN ONLINE<small>PLAY TO LEARN</small></span></a><a class="b3d sm ghost" href="__BASE__/home" target="_blank" rel="noopener noreferrer">‹ กลับหน้าแรก</a></header>

  <section class="hero" aria-labelledby="t">
    <div class="dom-art" aria-hidden="true"><img class="art-img" data-slot="domain-th-01-hero" alt=""></div>
    <div>
      <span class="tag">MISSION .TH</span>
      <h1 id="t">รู้จัก .th และ .ไทย</h1>
      <p class="lead">ชื่อเว็บไซต์ก็เหมือนชื่อบ้าน ท้ายชื่อบอกได้ว่าเป็นเว็บของใคร และอยู่ในประเทศอะไร หน้านี้อธิบายว่า .th และ .ไทย คืออะไร ต่างจาก .com อย่างไร ใครขอใช้ได้ และเว็บของครูการได้ประโยชน์อะไรจากชื่อนี้</p>
      <ul class="chips"><li style="--r:-2deg">🚩 ชื่อประจำประเทศไทย</li><li style="--r:1.5deg">🛡️ ตรวจสอบได้</li><li style="--r:-1deg">ก พิมพ์ภาษาไทยได้</li></ul>
      <div class="cta"><a class="b3d blue" href="#what">▶ เริ่มอ่าน</a><a class="b3d" href="#quiz">🎮 เล่นเกม รับเกียรติบัตร</a></div>
    </div>
  </section>

  <nav class="toc" aria-label="สารบัญ"><a href="#what">1 คืออะไร</a><a href="#vs">2 ต่างจาก .com</a><a href="#who">3 ใครขอใช้ได้</a><a href="#thnic">★ รู้จัก THNIC</a><a href="#why">4 ดีกับเราอย่างไร</a><a href="#check">5 ตรวจสอบและเช็กก่อนเชื่อ</a><a href="#quiz">6 เล่นเกม</a><a href="#refs">แหล่งอ้างอิง</a></nav>

  <section class="sec" id="what" aria-labelledby="h1">
    <div class="sh"><div class="no">1</div><div><h2 id="h1">.th และ .ไทย คืออะไร</h2><p>อ่านสั้น ๆ ก่อน แล้วลองแตะที่แถบที่อยู่เว็บด้านล่าง</p></div></div>
    <div class="cmp">
      <div class="panel a"><div class="big">.th</div><ul><li>เป็นชื่อโดเมนระดับบนสุดตามรหัสประเทศ (ccTLD) ของประเทศไทย <b>th = Thailand</b></li><li>เขียนด้วยตัวอักษรภาษาอังกฤษ</li><li>มีชื่อระดับสองบอกประเภทผู้ใช้ เช่น <b>.ac.th</b> <b>.go.th</b> <b>.in.th</b></li><li>ตัวอย่าง: <b>www.krukan.in.th</b></li></ul></div>
      <div class="panel b"><div class="big">.ไทย</div><ul><li>เป็นชื่อโดเมนระดับบนสุดของประเทศไทยที่เขียนเป็น <b>อักษรไทย</b> (โดเมนภาษาท้องถิ่น หรือ IDN)</li><li>พิมพ์ชื่อเว็บเป็นภาษาไทยทั้งชื่อได้ จำง่าย อ่านออกเสียงตรงกับที่เขียน</li><li>ผู้ขอใช้ต้องยืนยันตัวตนด้วยเอกสาร</li><li>ตัวอย่าง: <b>www.ครูการ.ไทย</b></li></ul></div>
    </div>
    <div class="lab" id="lab">
      <div class="lab-mission">
        <span class="ico" aria-hidden="true"><svg class="cur" viewBox="0 0 32 40"><path d="M4 3v27l7-6.5 5.2 12 5.8-2.5-5.2-11.8 9.7-.2z"/></svg></span>
        <p id="lab-msg"></p>
        <div class="prog" aria-live="polite"><span class="stps" id="stps" aria-hidden="true"></span><em id="tap-count"></em></div>
      </div>
      <div class="win-chrome">
        <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="tabs" role="group" aria-label="เลือกตัวอย่าง"><button type="button" data-ex="0" aria-pressed="true">www.krukan.in.th</button><button type="button" data-ex="1" aria-pressed="false">www.ครูการ.ไทย</button></div>
      </div>
      <div class="win-body">
        <div class="bar" id="bar" role="group" aria-label="ส่วนประกอบของที่อยู่เว็บ"></div>
        <div class="explain idle" id="explain" aria-live="polite"><img class="pose" src="__P_READ__" alt="" aria-hidden="true"><div class="ex-txt"><span class="ex-tag" id="ex-tag"></span><h3 id="ex-t"></h3><p id="ex-d"></p><button type="button" class="b3d sm blue" id="ex-next"></button></div></div>
      </div>
    </div>
    <p class="fact">🔍 เกร็ดน่ารู้: คอมพิวเตอร์ไม่เก็บตัวอักษรไทยในชื่อเว็บตรง ๆ แต่แปลงเป็นรหัสภาษาอังกฤษ ตัว <b>.ไทย</b> ในระบบคือ <code>xn--o3cw4h</code> เราจึงพิมพ์เป็นภาษาไทยแล้วเข้าเว็บได้เหมือนกัน</p>
    <div class="addr-wrap">
      <div class="slot" data-slot="domain-th-02-address-bar"><span>ภาพที่ 2 · แถบที่อยู่เว็บแบบการ์ตูน</span></div>
      <div>
      <p class="addr-key-h">ป้ายทั้ง 5 ในภาพ อ่านจากซ้ายไปขวา · ตัวอย่างในภาพคือ <b>www.krukan.in.th</b></p>
      <ol class="addr-key" aria-label="อธิบายป้ายทั้ง 5 ในภาพแถบที่อยู่เว็บ">
        <li style="--k:#7ddc4a"><span class="ico" style="--cx:487;--w:150" aria-hidden="true"></span><h4>แม่กุญแจ · เข้ารหัส</h4><p>ตรงกับ <b>https://</b> ข้อมูลระหว่างทางถูกเข้ารหัส ปลอดภัยขึ้น แต่ยังไม่รับประกันว่าเว็บน่าเชื่อถือ</p></li>
        <li style="--k:#5bb8f5"><span class="ico" style="--cx:762;--w:150" aria-hidden="true"></span><h4>ลูกโลก · บริการเว็บไซต์</h4><p>ตรงกับ <b>www.</b> ส่วนที่บอกว่าเป็นบริการหน้าเว็บ บางเว็บไม่ใส่ก็ได้</p></li>
        <li style="--k:#f59a3b"><span class="ico" style="--cx:986;--w:150" aria-hidden="true"></span><h4>บ้าน · ชื่อเว็บ</h4><p>ตรงกับ <b>krukan</b> ชื่อเฉพาะที่เจ้าของตั้งเอง เหมือนชื่อบ้านของเว็บ ต้องสะกดให้ถูกทุกตัว</p></li>
        <li style="--k:#a76bf0"><span class="ico" style="--cx:1188;--w:150" aria-hidden="true"></span><h4>คน · หมวดโดเมน .in.th</h4><p>ตรงกับ <b>.in</b> บอกหมวดของโดเมน <b>.in.th</b> ใช้ได้ทั้งบุคคลทั่วไปและหน่วยงานที่เข้าเกณฑ์ ไม่ได้จำกัดเฉพาะบุคคล รูปคนเป็นเพียงสัญลักษณ์ของผู้จดทะเบียน</p></li>
        <li style="--k:#f06b9a"><span class="ico" style="--cx:1435;--w:150" aria-hidden="true"></span><h4>ธงไทย · ประเทศไทย</h4><p>ตรงกับ <b>.th</b> ย่อมาจาก Thailand บอกว่าเป็นโดเมนของประเทศไทย</p></li>
      </ol>
      </div>
    </div>
  </section>

  <section class="sec band band-a" id="vs" aria-labelledby="h2">
    <div class="sh"><div class="no">2</div><div><h2 id="h2">.th / .ไทย ต่างจาก .com อย่างไร</h2><p>.com เป็นโดเมนสากลที่ใช้กันทั่วโลก ส่วน .th และ .ไทย เป็นของประเทศไทย</p></div></div>
    <div class="slot" data-slot="domain-th-08-vs-com"><span>ภาพเปรียบเทียบโดเมนไทยกับโดเมนสากล</span></div>
    <div class="tblwrap"><table class="tbl">
      <thead><tr><th scope="col"></th><th scope="col">.th</th><th scope="col">.ไทย</th><th scope="col">.com</th></tr></thead>
      <tbody>
        <tr><th scope="row">ประเภท</th><td data-label=".th">โดเมนตามรหัสประเทศ (ccTLD) ของไทย</td><td data-label=".ไทย">โดเมนตามรหัสประเทศ เขียนเป็นอักษรไทย</td><td data-label=".com">โดเมนทั่วไป (gTLD) ใช้ทั่วโลก ไม่ผูกกับประเทศ</td></tr>
        <tr><th scope="row">ใครขอใช้ได้</th><td data-label=".th">ขึ้นกับประเภท เช่น .ac.th ต้องเป็นสถานศึกษา .go.th ต้องเป็นหน่วยงานรัฐ</td><td data-label=".ไทย">เปิดให้ทั้งบุคคลและนิติบุคคลที่มีที่ตั้งหรือสัญชาติไทย ต้องยืนยันตัวตนด้วยเอกสาร</td><td data-label=".com">โดยทั่วไปใครจากประเทศไหนก็จดได้ ไม่ต้องแสดงว่าเป็นหน่วยงานแบบใด</td></tr>
        <tr><th scope="row">คนเห็นแล้วรู้อะไร</th><td data-label=".th">เกี่ยวข้องกับประเทศไทย และท้ายชื่อช่วยบอกประเภทผู้ใช้</td><td data-label=".ไทย">เกี่ยวข้องกับประเทศไทย และอ่านเป็นภาษาไทยได้ทันที</td><td data-label=".com">ไม่บอกประเทศและไม่บอกประเภทของเจ้าของ</td></tr>
        <tr><th scope="row">ภาษาของชื่อ</th><td data-label=".th">ตัวอักษรอังกฤษ ตัวเลข และขีดกลาง ยาว 1–63 ตัว</td><td data-label=".ไทย">ตัวอักษรไทย ตัวเลข และขีดกลาง</td><td data-label=".com">ส่วนใหญ่ตัวอักษรอังกฤษ</td></tr>
        <tr><th scope="row">ผู้ดูแลระบบ</th><td data-label=".th">มูลนิธิศูนย์สารสนเทศเครือข่ายไทย (THNIC) โดยมีบริษัท ที.เอช.นิค จำกัด เป็นผู้ให้บริการจดทะเบียน</td><td data-label=".ไทย">มูลนิธิศูนย์สารสนเทศเครือข่ายไทย (THNIC) โดยมีบริษัท ที.เอช.นิค จำกัด เป็นผู้ให้บริการจดทะเบียน</td><td data-label=".com">บริษัท VeriSign (สหรัฐอเมริกา) เป็นผู้ดูแลทะเบียนโดเมน .com</td></tr>
      </tbody>
    </table></div>
    <p class="fact">💡 ชื่อ .com ไม่ได้ไม่ดี แต่ <b>ไม่ได้บอกอะไรเกี่ยวกับเจ้าของชื่อ</b> ส่วน .th และ .ไทย มีกติกาของประเทศกำกับ ทำให้ผู้ชมมั่นใจได้ในระดับหนึ่งว่าเป็นชื่อที่จดทะเบียนในประเทศไทย</p>
  </section>

  <section class="sec band band-c" id="who" aria-labelledby="h3">
    <div class="sh"><div class="no">3</div><div><h2 id="h3">ใครขอใช้ชื่อ .th ได้บ้าง</h2><p>แต่ละท้ายชื่อมีผู้ใช้และเงื่อนไขของตัวเอง</p></div></div>
    <div class="grid" id="ends"></div>
    <div class="thnic" id="thnic">
      <div class="th-head">
        <span class="th-ico" aria-hidden="true">🏛️</span>
        <div><span class="tag">ใครดูแลชื่อเหล่านี้</span><h3>รู้จัก THNIC</h3><p class="th-full">มูลนิธิศูนย์สารสนเทศเครือข่ายไทย<small>Thai Network Information Center Foundation</small></p></div>
      </div>
      <ul class="th-chips"><li>🤝 องค์กรไม่แสวงผลกำไร</li><li>📅 ก่อตั้ง พ.ศ. 2550 (ค.ศ. 2007)</li><li>🇹🇭 ดูแลโดเมน .th และ .ไทย</li></ul>
      <div class="th-grid">
        <div class="th-card" style="--c:#ffd400"><i aria-hidden="true">📜</i><h4>กำหนดกติกา</h4><p>ออกนโยบายการจดทะเบียนชื่อโดเมน .th และ .ไทย เช่น ใครขอได้ ตั้งชื่ออย่างไร และต้องใช้เอกสารอะไร</p></div>
        <div class="th-card" style="--c:#00cdb8"><i aria-hidden="true">📝</i><h4>มอบหมายนายทะเบียน</h4><p>มอบหมายให้ บริษัท ที.เอช.นิค จำกัด เป็นนายทะเบียน รับสมัครและจดทะเบียนชื่อโดเมนอย่างเป็นทางการ แบ่งเป็น 7 หมวดหมู่</p></div>
        <div class="th-card" style="--c:#ff9ac8"><i aria-hidden="true">🎓</i><h4>ส่งเสริมการเรียนรู้</h4><p>มี THNIC Academy ฝึกอบรมด้านอินเทอร์เน็ต และมีโครงการ เว็บครู.ไทย ที่ส่งเสริมให้ครูมีเว็บไซต์ของตัวเอง</p></div>
        <div class="th-card" style="--c:#a9b8ff"><i aria-hidden="true">🌐</i><h4>พัฒนาอินเทอร์เน็ตไทย</h4><p>มีโครงการ BKNIX จุดแลกเปลี่ยนข้อมูลอินเทอร์เน็ตภายในประเทศ และ Net2Home ที่นำอินเทอร์เน็ตไปยังชุมชนห่างไกล</p></div>
      </div>
      <div class="th-svc" id="thsvc">
        <h4 class="th-svc-h">⭐ บริการของ THNIC ที่แนะนำให้ลองใช้</h4>
        <p class="th-svc-lead">ถ้าอยากมีชื่อเว็บของตัวเอง หรืออยากตรวจชื่อเว็บก่อนเชื่อ เริ่มได้ที่บริการเหล่านี้ของ บริษัท ที.เอช.นิค จำกัด นายทะเบียนที่ THNIC มอบหมาย</p>
        <div class="th-svc-grid">
          <a class="svc" style="--c:#7ddc4a" href="https://www.thnic.co.th" target="_blank" rel="noopener noreferrer"><i aria-hidden="true">🔎</i><b>ตรวจชื่อโดเมนฟรี (WHOIS)</b><span>พิมพ์ชื่อที่อยากใช้ หรือชื่อเว็บที่สงสัย ดูว่ามีคนจดแล้วหรือยัง พร้อมสถานะ วันหมดอายุ และ Name Server</span><em>เปิดเว็บ ที.เอช.นิค ›</em></a>
          <a class="svc" style="--c:#ffd400" href="https://www.thnic.co.th/article/register-domain-name-step-by-step" target="_blank" rel="noopener noreferrer"><i aria-hidden="true">📝</i><b>จดชื่อ .th และ .ไทย ของตัวเอง</b><span>มีวิธีจดทะเบียนทีละขั้น และดูราคาล่าสุดได้ที่หน้าราคา ผู้ที่ยังไม่บรรลุนิติภาวะต้องให้ผู้ปกครองยินยอม</span><em>ดูวิธีจดทะเบียน ›</em></a>
          <a class="svc" style="--c:#5bb8f5" href="https://www.thnic.co.th/thMail" target="_blank" rel="noopener noreferrer"><i aria-hidden="true">✉️</i><b>thMail อีเมลชื่อของเราเอง</b><span>เจ้าของโดเมน .th ขอใช้ได้ฟรี ได้อีเมล .th 1 บัญชีและอีเมล .ไทย 1 บัญชี บัญชีละ 1 GB ตลอดอายุโดเมน (ตามที่ THNIC ระบุ)</span><em>ดูรายละเอียด thMail ›</em></a>
          <a class="svc" style="--c:#ff9ac8" href="https://webkru.in.th" target="_blank" rel="noopener noreferrer"><i aria-hidden="true">🏫</i><b>เว็บครู.ไทย สำหรับครู</b><span>โครงการของ THNIC ที่ส่งเสริมให้ครูมีเว็บไซต์ของตัวเอง มีการอบรมและการประกวดเว็บไซต์ครู</span><em>ไปที่เว็บครู.ไทย ›</em></a>
        </div>
        <p class="th-svc-note">ℹ️ ค่าธรรมเนียมและเอกสารที่ต้องใช้ขึ้นกับประเภทของชื่อ และอาจเปลี่ยนแปลง ควรอ่านรายละเอียดล่าสุดในเว็บ THNIC ก่อนสมัคร สอบถามได้ที่โทร 0-2105-4007 หรืออีเมล support@thnic.co.th</p>
      </div>
      <p class="th-note">🔗 <b>เชื่อมกับหน้านี้:</b> ชื่อ <b>krukan.in.th</b> ที่เห็นในแถบที่อยู่เว็บอยู่ในกลุ่ม .in.th ซึ่งอยู่ภายใต้การดูแลของ THNIC เช่นกัน</p>
      <p class="th-links">อ่านต่อจากเว็บทางการ: <a href="https://www.thnic.or.th" target="_blank" rel="noopener noreferrer">เว็บไซต์ THNIC</a> · <a href="https://www.thnic.or.th/?p=61544" target="_blank" rel="noopener noreferrer">เกี่ยวกับ THNIC (About Us)</a> · <a href="https://www.thnic.co.th" target="_blank" rel="noopener noreferrer">บริษัท ที.เอช.นิค จำกัด</a></p>
    </div>
    <p class="fact">📄 เอกสารที่ต้องแนบต่างกันตามประเภท เช่น หนังสือรับรองนิติบุคคล หนังสือจากหน่วยงาน หรือบัตรประจำตัวของผู้ขอ ข้อมูลในการ์ดเรียบเรียงจาก <b>นโยบายการจดทะเบียนชื่อโดเมน .th และ .ไทย ฉบับปรับปรุง พฤษภาคม 2563</b> ของ THNIC ก่อนยื่นขอจริงควรตรวจเงื่อนไขล่าสุดที่ THNIC อีกครั้ง</p>
    <div class="chain" style="margin-top:34px">
      <div class="step"><h3>เลือกชื่อ</h3><p>คิดชื่อที่จำง่าย สะกดไม่ยาก ไม่ซ้ำกับคนอื่น</p></div>
      <div class="step"><h3>เลือกประเภท</h3><p>เลือกท้ายชื่อที่ตรงกับผู้ขอ เช่น .ac.th หรือ .in.th</p></div>
      <div class="step"><h3>ยื่นและยืนยันตัวตน</h3><p>ยื่นผ่านผู้ให้บริการ พร้อมเอกสารตามประเภท ชื่อทุกชื่อถูกตรวจยืนยันตัวตนก่อนใช้งาน</p></div>
      <div class="step"><h3>ใช้งานและต่ออายุ</h3><p>ผูกชื่อกับเว็บไซต์ แล้วต่ออายุตามกำหนด</p></div>
    </div>
    <p class="fact">🧒 ผู้ขอที่ยังไม่บรรลุนิติภาวะ (เช่น นักเรียน) ต้องได้รับความยินยอมจากผู้แทนโดยชอบธรรม เช่น ผู้ปกครอง และแนบบัตรของผู้ปกครองประกอบการขอ</p>
  </section>

  <section class="sec band band-b" id="why" aria-labelledby="h4">
    <div class="sh"><div class="no">4</div><div><h2 id="h4">เว็บครูการได้อะไรจากชื่อนี้</h2><p>เว็บของโรงเรียนวัดท่าชุมนุม ใช้ได้ทั้ง krukan.in.th และ ครูการ.ไทย</p></div></div>
    <div class="slot" data-slot="domain-th-07-family-school"><span>ภาพที่ 7 · ผู้ปกครองและนักเรียนเข้าเว็บด้วยชื่อภาษาไทย</span></div>
    <div class="tips">
      <div class="tip" style="--c:var(--yellow)"><i>👪</i><div><h3>ผู้ปกครองจำและพิมพ์เองได้</h3><p>ชื่อ <b>ครูการ.ไทย</b> เป็นภาษาไทยทั้งชื่อ ผู้ปกครองและนักเรียนจำง่าย ไม่ต้องสะกดอังกฤษ จึงเข้าถึงบทเรียนได้โดยไม่ต้องรอลิงก์จากใคร</p></div></div>
      <div class="tip" style="--c:var(--cyan)"><i>🛡️</i><div><h3>มั่นใจว่าเป็นเว็บของครูจริง</h3><p>ชื่อ .th และ .ไทย ต้องจดทะเบียนและยืนยันตัวตนผู้ขอ ผู้ปกครองจึงมั่นใจได้ระดับหนึ่งว่าเว็บนี้ไม่ใช่เว็บที่ใครจะตั้งปลอมได้ง่าย ๆ</p></div></div>
      <div class="tip" style="--c:var(--pink)"><i>🔍</i><div><h3>ตรวจเจ้าของชื่อได้</h3><p>ดูข้อมูลการจดทะเบียนของชื่อโดเมนได้จากบริการค้นหาข้อมูลโดเมน (WHOIS) ของ THNIC จึงเหมาะกับเว็บที่ให้เด็กเข้าเรียนและทำกิจกรรมเป็นประจำ</p></div></div>
      <div class="tip" style="--c:var(--violet)"><i>🔒</i><div><h3>ปลอดภัยขึ้นเมื่อพิมพ์เอง</h3><p>เด็กและผู้ปกครองพิมพ์ชื่อเว็บเองในแถบที่อยู่ ลดโอกาสกดลิงก์แปลกที่พาไปเว็บปลอม ซึ่งสอดคล้องกับเรื่องความปลอดภัยออนไลน์ที่สอนในรายวิชา</p></div></div>
    </div>
    <p class="fact">⚠️ ข้อจำกัดที่ควรรู้: ชื่อโดเมนบอกได้ว่าใครเป็น<b>เจ้าของชื่อ</b> แต่ <b>ไม่ได้รับรองว่าเนื้อหาทุกเรื่องในเว็บถูกต้อง</b> เราจึงยังต้องอ่านและตรวจสอบเนื้อหาด้วยตัวเองเสมอ</p>
  </section>

  <section class="sec band band-a" id="check" aria-labelledby="h5">
    <div class="sh"><div class="no">5</div><div><h2 id="h5">ตรวจสอบและเช็กก่อนเชื่อ</h2><p>นักสืบเว็บตัวจิ๋วต้องทำให้เป็นนิสัย</p></div></div>
    <div class="slot" data-slot="domain-th-03-detective"><span>ภาพที่ 3 · เทคโนถือแว่นขยายตรวจเว็บ</span></div>
    <div class="tips">
      <div class="tip" style="--c:var(--cyan)"><i>🔤</i><div><h3>อ่านสะกดทีละตัว</h3><p>เว็บปลอมชอบเปลี่ยนตัวอักษรนิดเดียว เช่น <b>krukan</b> กลายเป็น <b>kruk4n</b> ลองอ่านชื่อให้ครบก่อนกด</p></div></div>
      <div class="tip" style="--c:var(--yellow)"><i>🔒</i><div><h3>ดูแม่กุญแจ https</h3><p>แปลว่าข้อมูลถูกเข้ารหัสระหว่างทาง แต่ <b>ไม่ได้แปลว่าเว็บนั้นน่าเชื่อถือ</b> ต้องดูชื่อเว็บควบคู่กัน</p></div></div>
      <div class="tip" style="--c:var(--pink)"><i>🏫</i><div><h3>เทียบท้ายชื่อกับเจ้าของ</h3><p>เว็บราชการมักลงท้าย <b>.go.th</b> เว็บโรงเรียนและมหาวิทยาลัยมักลงท้าย <b>.ac.th</b> ถ้าชื่อไม่ตรงกับที่อ้าง ให้สงสัยไว้ก่อน</p></div></div>
      <div class="tip" style="--c:var(--violet)"><i>🔎</i><div><h3>ค้นหาข้อมูลโดเมน</h3><p>ใช้บริการค้นหาข้อมูลโดเมน (WHOIS) ของ THNIC ดูสถานะและข้อมูลการจดทะเบียนของชื่อนี้ ก่อนกรอกข้อมูลสำคัญ ข้อมูลที่แสดงขึ้นกับนโยบายของผู้ดูแล</p></div></div>
    </div>
    <div class="slot" data-slot="domain-th-04-fake-vs-real" style="margin-top:26px"><span>ภาพที่ 4 · เว็บปลอมกับเว็บจริง</span></div>
    <div class="slot" data-slot="domain-th-05-thai-keyboard"><span>ภาพที่ 5 · เทคโนพิมพ์ชื่อเว็บภาษาไทย</span></div>
  </section>

  <section class="sec" id="quiz" aria-labelledby="h6">
    <div class="sh"><div class="no">6</div><div><h2 id="h6">ภารกิจเกม 3 ด่าน รับเกียรติบัตร</h2><p>เล่นให้ได้ 60 คะแนนขึ้นไป แล้วพิมพ์เกียรติบัตร A4 ที่มีชื่อของตัวเอง</p></div></div>
    <div class="game panel" id="game">
      <div class="hud" id="hud">
        <ol class="chips-st" aria-label="ด่านของภารกิจ"><li>1 จับคู่</li><li>2 จัดหมวด</li><li>3 ตอบคำถาม</li><li>🏅 เกียรติบัตร</li></ol>
        <div class="hud-r"><span class="score" id="g-score">0 คะแนน</span><span class="time" id="g-time">⏱ --:--</span><button type="button" class="b3d sm ghost" id="g-snd" aria-pressed="false">🔇 เสียง</button></div>
        <div class="tbar" aria-hidden="true"><i id="t-bar"></i></div>
      </div>
      <div class="arena" id="arena" aria-live="polite"></div>
    </div>
    <p class="fact">🔒 เกมนี้ <b>ไม่บันทึกข้อมูลใด ๆ</b> ไม่มีฐานข้อมูล ไม่ส่งชื่อหรือคะแนนไปที่ไหน ชื่อที่พิมพ์ใส่เกียรติบัตรอยู่แค่บนหน้าจอและกระดาษของคุณ ปิดหน้านี้ข้อมูลก็หายไป</p>
  </section>

  <section class="sec" id="refs" aria-labelledby="h7">
    <div class="sh"><div class="no">★</div><div><h2 id="h7">แหล่งอ้างอิง</h2><p>เนื้อหาเรียบเรียงจากข้อมูลของผู้ดูแลโดเมน</p></div></div>
    <ul class="refs">
      <li><a href="https://www.thnic.or.th/doc/thPolicy-Final-May2563-EN.pdf" target="_blank" rel="noopener noreferrer">นโยบายการจดทะเบียนชื่อโดเมน .th และ .ไทย (ฉบับปรับปรุง พฤษภาคม 2563)</a> THNIC ใช้ตรวจประเภทโดเมน ผู้มีสิทธิ์ขอ และกติกาตั้งชื่อ</li>
      <li><a href="https://www.thnic.or.th/doc/3LD-RegisGuides-Final-May2563-EN.pdf" target="_blank" rel="noopener noreferrer">แนวปฏิบัติการจดทะเบียนชื่อโดเมนระดับที่สาม .th</a> THNIC ใช้ตรวจเอกสารที่ต้องแนบของแต่ละประเภท</li>
      <li><a href="https://www.thnic.or.th/?p=61544" target="_blank" rel="noopener noreferrer">THNIC · About Us</a> ประวัติ ภารกิจ และโครงการของมูลนิธิ ใช้ตรวจข้อมูลในกล่อง “รู้จัก THNIC”</li>
      <li><a href="https://www.thnic.or.th" target="_blank" rel="noopener noreferrer">มูลนิธิศูนย์สารสนเทศเครือข่ายไทย (THNIC)</a> และ <a href="https://www.thnic.co.th" target="_blank" rel="noopener noreferrer">บริษัท ที.เอช.นิค จำกัด</a> ผู้ดูแลและผู้ให้บริการจดทะเบียนโดเมน .th และ .ไทย</li>
      <li><a href="https://www.iana.org/domains/root/db/th.html" target="_blank" rel="noopener noreferrer">IANA · .th</a> · <a href="https://www.iana.org/domains/root/db/xn--o3cw4h.html" target="_blank" rel="noopener noreferrer">IANA · .ไทย (xn--o3cw4h)</a> · <a href="https://www.iana.org/domains/root/db/com.html" target="_blank" rel="noopener noreferrer">IANA · .com</a> ทะเบียนกลางของโดเมนระดับบนสุด ใช้ตรวจประเภทและผู้ดูแล</li>
    </ul>
    <p class="fact">ผู้จัดทำเรียบเรียงเนื้อหาให้เข้าใจง่ายสำหรับนักเรียนและผู้ปกครอง โดยตรวจกับเอกสารของ THNIC และฐานข้อมูล IANA ตามลิงก์ข้างต้น เงื่อนไขการจดทะเบียนอาจเปลี่ยนแปลง ควรตรวจข้อมูลล่าสุดก่อนใช้งานจริง</p>
  </section>

  <div class="cta2"><a class="b3d blue" href="__BASE__/home" target="_blank" rel="noopener noreferrer">🏠 กลับหน้าแรก Krukan Online</a><a class="b3d pink" href="https://www.ครูการ.ไทย" target="_blank" rel="noopener noreferrer">🇹🇭 www.ครูการ.ไทย</a></div>
  <footer class="foot">
    <p class="foot-eyebrow" lang="en">THANKS FOR PLAYING</p>
    <div class="foot-ghost" aria-hidden="true">KruKan.in.th</div>
    <p class="foot-tag" lang="en">DESIGNED FOR LEARNING · BUILT FOR EXPERIENCE</p>
    <p class="foot-copy">© 2026 KruKan.in.th · <a href="https://www.ครูการ.ไทย" target="_blank" rel="noopener noreferrer">www.ครูการ.ไทย</a> · โรงเรียนวัดท่าชุมนุม<br>ผู้จัดทำ: นายยุทธการ เจียตระกูล</p>
    <a class="foot-license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="license noopener noreferrer"><img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-sa.png" alt="Creative Commons BY-NC-SA 4.0" width="88" height="31"><span><b>CC BY-NC-SA 4.0</b><span>นำไปใช้ต่อได้ ให้เครดิตผู้จัดทำ ห้ามใช้เชิงพาณิชย์ และเผยแพร่ต่อด้วยสัญญาอนุญาตแบบเดียวกัน</span></span></a>
    <div class="ai-note"><button class="ai-btn" type="button" id="ai-btn">🤖 การใช้ AI · AI Disclosure</button></div>
    <template id="ai-note-tpl"><div class="ai-body"><dl>
      <dt>เครื่องมือ AI ที่ใช้</dt><dd>Claude (Anthropic) · ChatGPT Images (OpenAI) · Nano Banana (Google Gemini)</dd>
      <dt>ขอบเขตการใช้</dt><dd><ul><li><b>Claude:</b> ช่วยเขียนและปรับแต่งโค้ด HTML/CSS/JavaScript ของหน้านี้ และช่วยเรียบเรียงร่างเนื้อหาให้อ่านง่าย</li><li><b>ChatGPT Images และ Nano Banana:</b> ช่วยสร้างภาพตัวละคร Cyber Rider Techno และภาพประกอบ</li></ul></dd>
      <dt>ระดับการช่วยเหลือ</dt><dd>ผู้จัดทำเป็นผู้กำหนดหัวข้อ ประเด็นสำคัญ และทิศทางการออกแบบ แล้วตรวจสอบความถูกต้องของเนื้อหาและปรับแก้ผลลัพธ์ก่อนเผยแพร่ ข้อเท็จจริงเกี่ยวกับโดเมนอ้างอิงจากแหล่งที่ระบุในหน้านี้</dd>
    </dl></div></template>
  </footer>
</div>
<button type="button" class="b3d sm totop" id="totop" aria-label="กลับขึ้นด้านบน" hidden>↑ ขึ้นบน</button>
<div id="fx" aria-hidden="true"></div>
<div id="toast" role="status" aria-live="polite"></div>
<div id="cert-print" aria-hidden="true"></div>
<aside class="mascot" id="mascot" aria-label="เมนูลัดของหน้านี้ โดยเทคโนผู้นำทาง">
  <nav class="mc-menu" id="mc-menu" aria-label="เมนูลัดภายในหน้า" hidden></nav>
  <button type="button" class="mc-char" id="mc-char" aria-expanded="false" aria-controls="mc-menu" aria-label="เปิดเมนูลัดโดยเทคโน ผู้นำทางของหน้านี้"><span class="mc-bob"><img id="mc-img" alt="" src="__M_WAVE__"></span><span class="mc-badge"><i aria-hidden="true"></i><span id="mc-badge-t">TECHNO GUIDE</span></span></button>
</aside>

<script>
try{var t=localStorage.getItem('kk-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* ภาพประกอบ: ถ้ามีไฟล์ใน domain-th/ ให้แสดง ไม่มีก็คงกรอบไว้ */
const IMGV={'domain-th-02-address-bar':'__V02__'};
function fillSlots(root){$$((root||'')+' [data-slot]').forEach(el=>{
  const im=new Image();im.alt='';im.src='domain-th/'+el.dataset.slot+'.webp'+(IMGV[el.dataset.slot]?'?v='+IMGV[el.dataset.slot]:'');
  im.onload=()=>{if(el.tagName==='IMG'){el.src=im.src}else{el.insertBefore(im,el.firstChild);el.classList.add('has')}};
  im.onerror=()=>{if(el.tagName==='IMG')el.remove()};
})}
fillSlots('');
/* แถบที่อยู่เว็บ */
const EX=[
 [['https://','s1','โปรโตคอล https','คำว่า https บอกวิธีเชื่อมต่อ มีแม่กุญแจแปลว่าข้อมูลถูกเข้ารหัสระหว่างทาง ปลอดภัยกว่า http แต่ยังไม่ใช่เครื่องรับประกันว่าเว็บน่าเชื่อถือ'],
  ['www.','s2','ชื่อบริการ www','www ย่อมาจาก World Wide Web คือส่วนที่เป็นหน้าเว็บ หลายเว็บใส่ไว้ แต่บางเว็บก็ไม่ใส่'],
  ['krukan','s3','ชื่อที่เจ้าของเว็บตั้งเอง','ส่วนนี้คือชื่อเฉพาะของเว็บ เป็นส่วนที่ต้องอ่านและสะกดให้ถูกทุกตัว เพราะเว็บปลอมมักแก้ตรงนี้'],
  ['.in','s4','.in คือกลุ่มที่เปิดกว้าง','.in.th เปิดให้บุคคลทั่วไปและนิติบุคคลที่มีที่ตั้งในประเทศไทยจดทะเบียนได้ เหมาะกับเว็บส่วนตัวหรือเว็บของครูที่ทำเอง'],
  ['.th','s5','.th รหัสประเทศไทย','th ย่อมาจาก Thailand บอกว่าเป็นชื่อโดเมนของประเทศไทย ดูแลโดยหน่วยงานกลางของประเทศ']],
 [['https://','s1','โปรโตคอล https','เหมือนเดิม เว็บนี้ก็เชื่อมต่อแบบเข้ารหัสได้เช่นกัน'],
  ['www.','s2','ชื่อบริการ www','ส่วนหน้าเว็บ เหมือนกับตัวอย่างแรก'],
  ['ครูการ','s3','ชื่อเว็บเป็นภาษาไทย','ชื่อที่ตั้งเองเป็นอักษรไทยทั้งหมด อ่านแล้วจำง่ายกว่าชื่อภาษาอังกฤษที่สะกดยาก'],
  ['.ไทย','s5','.ไทย โดเมนอักษรไทย','.ไทย เป็นชื่อโดเมนระดับบนสุดของประเทศไทยที่เขียนเป็นภาษาไทย ไม่ต้องมี .in หรือ .co ต่อท้าย พิมพ์สั้นและอ่านง่าย']]
];
const CAP=[['เชื่อมต่อ','บริการ','ชื่อเว็บ','ประเภท','ประเทศ'],['เชื่อมต่อ','บริการ','ชื่อเว็บ','ประเทศ']];
const CUR='<svg class="cur" viewBox="0 0 32 40" aria-hidden="true"><path d="M4 3v27l7-6.5 5.2 12 5.8-2.5-5.2-11.8 9.7-.2z"/></svg>';
let cur=0,sel=-1;const SEEN=[new Set(),new Set()],DONE=[false,false];
const firstNew=()=>EX[cur].findIndex((_,i)=>!SEEN[cur].has(i));
/* หางของกล่องคำอธิบายชี้ไปที่ช่องที่เลือก */
function placeNotch(){
  const ex=$('#explain'),b=$('#bar .seg[aria-pressed=true]');
  if(!ex||!b)return;
  const r=b.getBoundingClientRect(),e=ex.getBoundingClientRect(),x=r.left-e.left-ex.clientLeft+r.width/2;
  ex.style.setProperty('--ax',Math.round(Math.max(34,Math.min(ex.clientWidth-34,x)))+'px');
}
function pick(i){sel=i;SEEN[cur].add(i);drawBar(true)}
function drawBar(fx){
  const L=EX[cur],n=L.length,bar=$('#bar'),ex=$('#explain'),k=SEEN[cur].size,all=k===n,nx=firstNew(),have=sel>=0;
  bar.classList.toggle('has-sel',have);
  bar.innerHTML='<span class="lock" aria-hidden="true">🔒</span>'+L.map((s,i)=>{const seen=SEEN[cur].has(i);return '<button type="button" class="seg '+s[1]+(seen?' seen':'')+(i===nx?' next':'')+'" style="--n:'+i+'" data-i="'+i+'" aria-pressed="'+(i===sel)+'" aria-label="'+esc(s[0])+' ('+CAP[cur][i]+') แตะเพื่อดูความหมาย"><span class="st">'+esc(s[0])+'</span><small>'+CAP[cur][i]+'</small><span class="mk" aria-hidden="true">'+(seen?'✓':'?')+'</span>'+(i===nx?'<span class="tapper" aria-hidden="true"><span class="say">'+CUR+'แตะ!</span></span>':'')+'</button>'}).join('');
  $$('#bar .seg').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
  $('#stps').innerHTML=L.map((_,i)=>'<i class="stp'+(SEEN[cur].has(i)?' on':'')+'"></i>').join('');
  $('#tap-count').textContent='ดูแล้ว '+k+'/'+n;
  $('#lab').classList.toggle('done',all);
  $('#lab-msg').innerHTML=all?'<b>ครบทุกส่วนแล้ว!</b> เก่งมาก ลองกดดูอีกตัวอย่างที่แท็บข้างล่างนี้ได้เลย':'<b>แตะทีละช่อง</b> ในแถบสีด้านล่าง แล้วดูว่าแต่ละส่วนของชื่อเว็บแปลว่าอะไร';
  ex.classList.toggle('idle',!have);
  if(have)ex.dataset.c=L[sel][1];else delete ex.dataset.c;
  $('#ex-tag').textContent=have?'ส่วนที่ '+(sel+1)+' จาก '+n+' · '+CAP[cur][sel]:'พร้อมไหม?';
  $('#ex-t').textContent=have?L[sel][2]:'ลองแตะดูสิ!';
  $('#ex-d').textContent=have?L[sel][3]:'แต่ละช่องสีด้านบนคือส่วนหนึ่งของชื่อเว็บ แตะแล้วจะบอกว่าส่วนนั้นแปลว่าอะไร';
  $('#ex-next').textContent=all?'ดูอีกตัวอย่าง ›':(have?'ส่วนถัดไป ›':'เริ่มจากส่วนแรก ›');
  placeNotch();
  if(fx){
    ex.classList.remove('swap');void ex.offsetWidth;ex.classList.add('swap');
    const b=$('#bar .seg[aria-pressed=true]');if(b)b.focus({preventScroll:true});
    if(all&&!DONE[cur]){DONE[cur]=true;confetti(36)}
  }
}
function switchEx(c){cur=c;sel=-1;$$('.tabs button').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.ex===c)));drawBar(false)}
$$('.tabs button').forEach(b=>b.onclick=()=>switchEx(+b.dataset.ex));
$('#ex-next').onclick=()=>{if(SEEN[cur].size===EX[cur].length)switchEx(1-cur);else pick(firstNew())};
addEventListener('resize',placeNotch);
drawBar(false);
/* ท้ายชื่อ + เงื่อนไขหลัก */
const ENDS=[
 ['.ac.th','ac = academic','สถานศึกษา','โรงเรียน มหาวิทยาลัย วิทยาลัย','เป็นสถาบันการศึกษาที่กระทรวงศึกษาธิการรับรอง หรือหน่วยงานที่มีสถานะเทียบเท่า','.ศึกษา.ไทย','#ffd400'],
 ['.go.th','go = government','หน่วยงานรัฐ','กระทรวง กรม จังหวัด เทศบาล','เป็นหน่วยงานของรัฐหรือโครงการภายใต้การกำกับตามมติคณะรัฐมนตรี','.รัฐบาล.ไทย','#00cdb8'],
 ['.co.th','co = company','ธุรกิจ','ร้านค้า บริษัท ผู้ประกอบการ','เป็นนิติบุคคลที่จดกับกรมพัฒนาธุรกิจการค้า ผู้จดทะเบียนภาษีมูลค่าเพิ่ม รัฐวิสาหกิจ หรือเจ้าของเครื่องหมายการค้าที่จดทะเบียนในไทย','.ธุรกิจ.ไทย','#ff9ac8'],
 ['.or.th','or = organization','องค์กรที่ไม่ใช่ภาครัฐ','สมาคม มูลนิธิ สภาวิชาชีพ ศาสนสถาน สหกรณ์ หอการค้า ชมรม','เป็นองค์กรที่ไม่ใช่หน่วยงานรัฐ และแนบเอกสารจัดตั้งตามประเภทขององค์กร','.องค์กร.ไทย','#a9b8ff'],
 ['.in.th','เปิดกว้าง ไม่ต้องใช้ชื่อองค์กร','บุคคลทั่วไปและนิติบุคคล','เว็บส่วนตัว เว็บครูและนักเรียน เช่น krukan.in.th','เป็นบุคคลสัญชาติไทย (หรือชาวต่างชาติที่มีใบอนุญาตทำงานในไทย) หรือหน่วยงานที่มีที่ตั้งในไทย และยืนยันตัวตนด้วยเอกสาร','.ไทย (เช่น ครูการ.ไทย)','#ff5e9f'],
 ['.mi.th','mi = military','หน่วยงานทหาร','หน่วยงานในกองทัพไทย','เป็นหน่วยงานของกองทัพไทยที่ได้รับอนุญาตให้จดทะเบียน','.ทหาร.ไทย','#a8e86b'],
 ['.net.th','net = network','ผู้ให้บริการโทรคมนาคม','ผู้ได้รับใบอนุญาตประกอบกิจการโทรคมนาคม','เป็นผู้ได้รับใบอนุญาตประกอบกิจการโทรคมนาคมตาม พ.ร.บ.ประกอบกิจการโทรคมนาคม พ.ศ. 2544','.เน็ต.ไทย','#7fd7ff']
];
const END_ICO=['🏫','🏛️','🏪','🤝','🙋','🪖','📡'];
$('#ends').innerHTML=ENDS.map((e,i)=>'<div class="end" style="--k:'+e[6]+'"><div class="end-top"><span class="code">'+e[0]+'</span><span class="end-ico" aria-hidden="true">'+END_ICO[i]+'</span></div><div class="end-body"><h3>'+e[2]+'</h3><p><span class="who">ใช้กับ:</span> '+e[3]+'</p><p><span class="who">เงื่อนไขหลัก:</span> '+e[4]+'</p><p class="mut">'+e[1]+'</p><p class="mut pair">คู่ภาษาไทย: <b>'+e[5]+'</b></p></div></div>').join('');
/* ===== ภารกิจเกม 3 ด่าน + เกียรติบัตร · ไม่บันทึกข้อมูล ไม่ใช้ฐานข้อมูล ไม่ใช้ localStorage ===== */
const reduceM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PASS=60,MAXS=[30,30,40];
const G={score:[0,0,0],secs:[0,0,0],sound:false,iv:0,stage:-1,t0:0};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=s=>{s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const total=()=>G.score.reduce((a,b)=>a+b,0);
let AC=null;
function beep(kind){
  if(!G.sound)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const seq={ok:[[660,.08],[880,.12]],bad:[[200,.18]],win:[[523,.1],[659,.1],[784,.1],[1047,.28]],tick:[[500,.05]]}[kind]||[];
    let t=AC.currentTime;
    seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);t+=d});
  }catch(e){}
}
function confetti(n){
  if(reduceM)return;
  const fx=$('#fx'),cols=['#ffd400','#ff2e88','#00cdb8','#3b5bff','#7c4dff','#ffffff'];
  for(let i=0;i<(n||50);i++){
    const s=document.createElement('i');
    s.style.cssText='left:'+(Math.random()*100)+'%;background:'+cols[i%cols.length]+';animation-delay:'+(Math.random()*.5)+'s;--dx:'+(Math.random()*180-90)+'px;--r:'+(Math.random()*720-360)+'deg;--d:'+(1.8+Math.random()*1.4)+'s';
    fx.appendChild(s);setTimeout(()=>s.remove(),4200);
  }
}
function hud(){
  $$('#hud .chips-st li').forEach((li,i)=>{li.classList.toggle('on',i===G.stage);li.classList.toggle('done',i<G.stage)});
  $('#g-score').textContent=total()+' คะแนน';
  if(window.MC)window.MC.sync();
}
function stopTimer(){if(G.iv){clearInterval(G.iv);G.iv=0}$('#hud').classList.remove('hurry')}
function runTimer(sec,onEnd){
  stopTimer();
  const end=Date.now()+sec*1000,bar=$('#t-bar'),tx=$('#g-time');
  G.t0=Date.now();
  const tick=()=>{
    const left=Math.max(0,(end-Date.now())/1000);
    tx.textContent='⏱ '+fmt(Math.ceil(left));
    bar.style.width=(left/sec*100)+'%';
    $('#hud').classList.toggle('hurry',left<=10&&left>0);
    if(left<=0){stopTimer();onEnd()}
  };
  tick();G.iv=setInterval(tick,200);
  return()=>Math.round((Date.now()-G.t0)/1000);
}
function arena(html){const a=$('#arena');a.innerHTML=html;a.classList.remove('swap');void a.offsetWidth;a.classList.add('swap');return a}
function pop(el,text,bad){
  const p=document.createElement('span');p.className='pop'+(bad?' bad':'');p.textContent=text;
  const r=el.getBoundingClientRect(),h=$('#arena').getBoundingClientRect();
  p.style.left=(r.left-h.left+r.width/2)+'px';p.style.top=(r.top-h.top)+'px';
  $('#arena').appendChild(p);setTimeout(()=>p.remove(),900);
}
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),2600)}

/* หน้าเปิดเกม */
function intro(){
  stopTimer();G.score=[0,0,0];G.secs=[0,0,0];G.stage=-1;hud();
  $('#g-time').textContent='⏱ --:--';$('#t-bar').style.width='100%';
  arena('<div class="intro"><img class="pose" src="__P_READ__" alt="" aria-hidden="true"><div><h3>พร้อมไหม นักสืบเว็บ?</h3><ul class="rules"><li><b>ด่าน 1 จับคู่</b> ท้ายชื่อเว็บกับผู้ใช้ · 30 คะแนน · 90 วินาที</li><li><b>ด่าน 2 จัดหมวด</b> โดเมนไทยหรือไม่ใช่ · 30 คะแนน · 60 วินาที</li><li><b>ด่าน 3 ตอบคำถาม</b> 5 ข้อ ข้อละ 20 วินาที · 40 คะแนน</li><li><b>ได้ 60 คะแนนขึ้นไป</b> พิมพ์เกียรติบัตร A4 ที่มีชื่อของตัวเองได้</li></ul><button type="button" class="b3d blue big" id="go">▶ เริ่มภารกิจ</button></div></div>');
  $('#go').onclick=()=>countdown(stage1);
}
function countdown(next){
  const seq=['3','2','1','ลุย!'];let i=0;
  const step=()=>{
    arena('<div class="cd"><b class="'+(i===3?'go':'')+'">'+seq[i]+'</b></div>');beep(i===3?'ok':'tick');
    i++;if(i<seq.length)setTimeout(step,reduceM?350:700);else setTimeout(next,reduceM?350:600);
  };
  step();
}
function resultCard(st,title,got,max,secs,nextLabel,nextFn){
  const pct=got/max,stars=pct>=.9?3:pct>=.7?2:pct>=.4?1:0;
  G.score[st]=got;G.secs[st]=secs;hud();
  if(pct>=.7){confetti(40);beep('win')}
  arena('<div class="res"><h3>'+title+'</h3><div class="stars" aria-label="ได้ '+stars+' ดาว">'+'★'.repeat(stars)+'<span>'+'★'.repeat(3-stars)+'</span></div><p class="big-n"><b>'+got+'</b> / '+max+' คะแนน</p><p class="mut">ใช้เวลา '+fmt(secs)+' นาที</p><button type="button" class="b3d blue big" id="nx">'+nextLabel+'</button></div>');
  $('#nx').onclick=nextFn;$('#nx').focus();
}

/* ด่าน 1 จับคู่ */
function stage1(){
  G.stage=0;G.score[0]=0;hud();
  const P=[['.ac.th','สถานศึกษา'],['.go.th','หน่วยงานรัฐ'],['.co.th','ธุรกิจ'],['.or.th','องค์กรที่ไม่ใช่ภาครัฐ'],['.in.th','บุคคลทั่วไปและนิติบุคคล']];
  const L=P.map((p,i)=>({t:p[0],k:i})),R=shuffle(P.map((p,i)=>({t:p[1],k:i})));
  let sel=null,done=0,wrong=0,streak=0,over=false;
  arena('<p class="how">🧩 แตะท้ายชื่อทางซ้าย แล้วแตะผู้ใช้ทางขวาที่ตรงกัน จับให้ครบ 5 คู่</p><div class="mt"><div class="col" id="mL"></div><div class="col" id="mR"></div></div><p class="combo" id="combo" aria-live="polite">&nbsp;</p>');
  const mk=(arr,id,side)=>{$(id).innerHTML=arr.map(x=>'<button type="button" class="tile" data-side="'+side+'" data-k="'+x.k+'">'+esc(x.t)+'</button>').join('')};
  mk(L,'#mL','L');mk(R,'#mR','R');
  const calc=()=>Math.max(0,done*6-wrong);
  const live=()=>{$('#g-score').textContent=(G.score[1]+G.score[2]+calc())+' คะแนน'};
  const elapsed=runTimer(90,()=>end());
  function end(){
    if(over)return;over=true;const secs=elapsed();stopTimer();
    resultCard(0,done===5?'ด่าน 1 สำเร็จ!':'หมดเวลาแล้ว',calc(),30,secs,'ไปด่าน 2 ›',()=>countdown(stage2));
  }
  $$('#arena .tile').forEach(b=>b.onclick=()=>{
    if(over||b.classList.contains('ok'))return;
    const side=b.dataset.side,k=+b.dataset.k;
    if(!sel||sel.side===side){if(sel)sel.el.classList.remove('sel');sel={side,k,el:b};b.classList.add('sel');beep('tick');return}
    const a=sel.el,ok=sel.k===k;a.classList.remove('sel');sel=null;
    if(ok){
      [a,b].forEach(e=>e.classList.add('ok'));done++;streak++;beep('ok');pop(b,'+6');
      $('#combo').innerHTML=streak>=2?'🔥 คอมโบ x'+streak+'!':'&nbsp;';
      if(done===5)setTimeout(end,550);
    }else{
      wrong++;streak=0;beep('bad');pop(b,'−1',true);$('#combo').innerHTML='ลองใหม่อีกครั้งนะ';
      [a,b].forEach(e=>{e.classList.add('no');setTimeout(()=>e.classList.remove('no'),450)});
    }
    live();
  });
}

/* ด่าน 2 จัดหมวดหมู่ */
function stage2(){
  G.stage=1;G.score[1]=0;hud();
  const ITEMS=shuffle([['krukan.in.th',1,'ลงท้าย .th เป็นโดเมนของประเทศไทย'],['ครูการ.ไทย',1,'.ไทย คือโดเมนของประเทศไทยที่เขียนเป็นอักษรไทย'],['school.ac.th',1,'ลงท้าย .ac.th เป็นโดเมนไทยของสถานศึกษา'],['example.com',0,'.com เป็นโดเมนทั่วไป ไม่ผูกกับประเทศใด'],['shop.co.uk',0,'.co.uk เป็นโดเมนของสหราชอาณาจักร'],['club.org',0,'.org เป็นโดเมนทั่วไป ไม่ผูกกับประเทศใด']]);
  let sel=-1,done=0,wrong=0,over=false;
  arena('<p class="how">🗂️ แตะการ์ดชื่อเว็บ แล้วแตะกล่องที่ใช่ (หรือลากไปวางก็ได้)</p><div class="pool" id="pool"></div><div class="buckets"><button type="button" class="bucket th" data-b="1"><b>🇹🇭 โดเมนของประเทศไทย</b><span class="in" id="b1"></span></button><button type="button" class="bucket ot" data-b="0"><b>🌍 ไม่ใช่โดเมนของไทย</b><span class="in" id="b0"></span></button></div><p class="combo" id="tip" aria-live="polite">&nbsp;</p>');
  $('#pool').innerHTML=ITEMS.map((it,i)=>'<button type="button" class="card-d" draggable="true" data-i="'+i+'">'+esc(it[0])+'</button>').join('');
  const calc=()=>Math.max(0,done*5-wrong);
  const live=()=>{$('#g-score').textContent=(G.score[0]+G.score[2]+calc())+' คะแนน'};
  const elapsed=runTimer(60,()=>end());
  function end(){
    if(over)return;over=true;const secs=elapsed();stopTimer();
    resultCard(1,done===6?'ด่าน 2 สำเร็จ!':'หมดเวลาแล้ว',calc(),30,secs,'ไปด่าน 3 ›',()=>countdown(stage3));
  }
  function place(i,bk,fromEl){
    if(over)return;const it=ITEMS[i],card=$('#pool .card-d[data-i="'+i+'"]');if(!card)return;
    if(it[1]===bk){
      done++;beep('ok');$('#b'+bk).appendChild(card);card.classList.remove('sel');card.classList.add('ok');card.draggable=false;card.disabled=true;
      pop($('#b'+bk),'+5');$('#tip').innerHTML='✅ '+esc(it[2]);
      if(done===6)setTimeout(end,600);
    }else{
      wrong++;beep('bad');card.classList.remove('sel');card.classList.add('no');setTimeout(()=>card.classList.remove('no'),450);
      pop(card,'−1',true);$('#tip').innerHTML='💡 '+esc(it[2]);
    }
    sel=-1;live();
  }
  $$('#pool .card-d').forEach(c=>{
    c.onclick=()=>{if(over||c.disabled)return;$$('#pool .card-d').forEach(x=>x.classList.remove('sel'));sel=+c.dataset.i;c.classList.add('sel');beep('tick')};
    c.addEventListener('dragstart',e=>{sel=+c.dataset.i;e.dataTransfer.setData('text/plain',c.dataset.i);e.dataTransfer.effectAllowed='move'});
  });
  $$('#arena .bucket').forEach(b=>{
    b.onclick=()=>{if(sel>=0)place(sel,+b.dataset.b)};
    b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('over')});
    b.addEventListener('dragleave',()=>b.classList.remove('over'));
    b.addEventListener('drop',e=>{e.preventDefault();b.classList.remove('over');const i=+e.dataTransfer.getData('text/plain');if(!isNaN(i))place(i,+b.dataset.b)});
  });
}

/* ด่าน 3 ตอบคำถาม */
const QZ=[
 ['เว็บไซต์ที่ลงท้าย .ac.th มักเป็นของหน่วยงานแบบใด','สถานศึกษา เช่น โรงเรียนหรือมหาวิทยาลัย',['ร้านค้าและบริษัทที่ขายของออนไลน์','ศูนย์ราชการและกระทรวงต่าง ๆ ของรัฐ','หน่วยงานทหารและกองกำลังต่าง ๆ ของชาติ'],'ac คือ academic เกี่ยวกับการศึกษา จึงใช้กับสถานศึกษาที่ได้รับการรับรอง'],
 ['ครูทำเว็บส่วนตัวชื่อ krukan.in.th ท้าย .in.th เหมาะกับผู้ใช้แบบใด','บุคคลทั่วไปและหน่วยงานที่มีที่ตั้งในไทย',['เฉพาะบริษัทที่จดทะเบียนทำธุรกิจเท่านั้น','เฉพาะหน่วยงานของรัฐที่ให้บริการประชาชน','เฉพาะผู้ให้บริการอินเทอร์เน็ตทั้งประเทศ'],'.in.th เปิดกว้างสำหรับบุคคลและนิติบุคคลที่มีที่ตั้งในประเทศไทย จึงเหมาะกับเว็บส่วนตัวของครู'],
 ['.ไทย ต่างจาก .th ตรงที่ข้อใดมากที่สุด','เขียนชื่อโดเมนด้วยอักษรไทยได้',['ใช้ได้เฉพาะเว็บของโรงเรียนเท่านั้น','ไม่ต้องจดทะเบียนก่อนนำไปใช้งานเลย','เป็นชื่อโดเมนของประเทศอื่นที่อยู่ใกล้เรา'],'.ไทย คือโดเมนของประเทศไทยที่เขียนเป็นภาษาไทย พิมพ์และจำง่ายขึ้น'],
 ['ข้อใดคือความต่างสำคัญระหว่าง .th กับ .com','.th เป็นของประเทศไทยและต้องยืนยันตัวตนผู้ขอ',['.com ใช้ได้เฉพาะเว็บของบริษัทในประเทศไทย','.th ใช้ได้ทั่วโลกโดยไม่มีผู้ดูแลชื่อโดเมน','.com บอกประเภทผู้ใช้ชัดเจนกว่าชื่อ .th ทุกชื่อ'],'.th เป็นโดเมนตามรหัสประเทศของไทยและมี THNIC ดูแล ส่วน .com เป็นโดเมนทั่วไปที่ใครก็จดได้ จึงไม่บอกประเทศหรือประเภทของเจ้าของ'],
 ['ได้รับข้อความแปลก ๆ มีลิงก์ให้กรอกรหัสผ่าน ควรทำอย่างไรก่อน','พิมพ์ชื่อเว็บจริงเองแล้วตรวจสะกด',['กดลิงก์ทันทีเพราะมีแม่กุญแจ https','ส่งต่อลิงก์ให้เพื่อนช่วยกันลองดูก่อน','กรอกรหัสผ่านไปก่อนแล้วค่อยตรวจทีหลัง'],'ลิงก์แปลกอาจพาไปเว็บปลอม ควรพิมพ์ชื่อเว็บเองและเช็กการสะกดทุกตัว']
];
const LET='กขคง';
function stage3(){
  G.stage=2;G.score[2]=0;hud();
  const qs=QZ.slice();let qi=0,got=0,secsAll=0,streak=0;
  function ask(){
    const q=qs[qi],opts=shuffle([[q[1],1]].concat(q[2].map(o=>[o,0])));let answered=false;
    arena('<div class="qtop"><b class="tag" style="transform:none">ข้อ '+(qi+1)+'/'+qs.length+'</b><span class="combo" id="combo">'+(streak>=2?'🔥 คอมโบ x'+streak:'&nbsp;')+'</span></div><h3 class="qh">'+esc(q[0])+'</h3><div class="opts">'+opts.map((o,i)=>'<button type="button" class="opt" data-ok="'+o[1]+'"><b>'+LET[i]+'</b><span>'+esc(o[0])+'</span></button>').join('')+'</div><div class="fb" id="fb" hidden></div>');
    const elapsed=runTimer(20,()=>settle(null));
    function settle(btn){
      if(answered)return;answered=true;const used=elapsed();secsAll+=used;stopTimer();
      const ok=!!btn&&btn.dataset.ok==='1';
      $$('#arena .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('right')});
      if(btn&&!ok)btn.classList.add('wrong');
      if(ok){got+=8;streak++;beep('ok');pop(btn,'+8')}else{streak=0;beep('bad')}
      $('#g-score').textContent=(G.score[0]+G.score[1]+got)+' คะแนน';
      const fb=$('#fb');fb.hidden=false;
      fb.innerHTML=(ok?'✅ <b>ถูกต้อง!</b> ':(btn?'❌ <b>ยังไม่ใช่</b> ':'⏰ <b>หมดเวลา</b> '))+esc(q[3])+'<div style="margin-top:12px"><button type="button" class="b3d sm blue" id="nq">'+(qi<qs.length-1?'ข้อต่อไป ›':'ดูผลด่าน 3 ›')+'</button></div>';
      $('#nq').focus();
      $('#nq').onclick=()=>{qi++;if(qi<qs.length)ask();else resultCard(2,'ด่าน 3 จบแล้ว',got,40,secsAll,'ดูผลรวมทั้งหมด ›',finish)};
    }
    $$('#arena .opt').forEach(b=>b.onclick=()=>settle(b));
  }
  ask();
}

/* สรุปผล */
function finish(){
  stopTimer();G.stage=3;hud();$('#g-time').textContent='⏱ รวม '+fmt(G.secs.reduce((a,b)=>a+b,0));$('#t-bar').style.width='100%';
  const sc=total(),secs=G.secs.reduce((a,b)=>a+b,0),pass=sc>=PASS,stars=sc>=90?3:sc>=75?2:pass?1:0;
  const rows=['ด่าน 1 จับคู่','ด่าน 2 จัดหมวด','ด่าน 3 ตอบคำถาม'].map((n,i)=>'<li><span>'+n+'</span><i><u style="width:'+(G.score[i]/MAXS[i]*100)+'%"></u></i><b>'+G.score[i]+'/'+MAXS[i]+'</b></li>').join('');
  const head='<div class="sum"><div class="ring '+(pass?'pass':'')+'"><b>'+sc+'</b><small>จาก 100</small></div><div><h3>'+(pass?'ผ่านภารกิจแล้ว! เก่งมาก':'ยังไม่ถึง 60 คะแนน แต่ใกล้แล้ว')+'</h3><div class="stars" aria-label="ได้ '+stars+' ดาว">'+'★'.repeat(stars)+'<span>'+'★'.repeat(3-stars)+'</span></div><p class="mut">เวลารวม '+fmt(secs)+' นาที · เกณฑ์ผ่าน '+PASS+' คะแนน</p><ul class="bars">'+rows+'</ul></div></div>';
  if(!pass){
    arena(head+'<p class="how">ลองอ่านเนื้อหาด้านบนอีกรอบ แล้วเล่นใหม่ได้เลย ไม่มีหมดสิทธิ์ ไม่ต้องรอ</p><div class="row-btn"><button type="button" class="b3d blue big" id="again">↻ เล่นใหม่ทั้งหมด</button></div>');
    $('#again').onclick=intro;return;
  }
  confetti(90);beep('win');
  arena('<div class="slot" data-slot="domain-th-06-victory" style="margin:0 auto 18px;max-width:480px"><span>ภาพที่ 6</span></div>'+head+'<div class="cert-box"><div class="form"><h3>🏅 รับเกียรติบัตรของคุณ</h3><label for="c-name">ชื่อ-นามสกุล</label><input id="c-name" maxlength="60" autocomplete="off" spellcheck="false" placeholder="เช่น ด.ช.สมชาย ใจดี"><label for="c-sch">ชั้น / โรงเรียน (ไม่ใส่ก็ได้)</label><input id="c-sch" maxlength="60" autocomplete="off" spellcheck="false" placeholder="เช่น ป.6 โรงเรียนวัดท่าชุมนุม"><p class="mut">🔒 ข้อมูลที่พิมพ์อยู่แค่บนหน้าจอและกระดาษของคุณ ไม่ถูกส่งหรือบันทึกที่ไหน</p><button type="button" class="b3d pink big" id="c-print">🖨️ พิมพ์เกียรติบัตร A4</button><p class="mut" id="c-hint">เกียรติบัตรเป็นกระดาษ A4 แนวตั้ง ตั้งค่าเครื่องพิมพ์เป็น "ขนาดจริง" และเปิด "กราฟิกพื้นหลัง" เพื่อให้สีออกครบ ถ้ากดแล้วไม่มีหน้าต่างพิมพ์ขึ้น ให้เปิดหน้านี้ในแท็บใหม่แล้วลองอีกครั้ง</p><button type="button" class="b3d sm ghost" id="again">↻ เล่นใหม่</button></div><div class="cert-fit" id="cert-fit"><div class="cert-stage" id="cert-stage"></div></div></div>');
  fillSlots('#arena');
  const info=()=>({name:$('#c-name').value.trim(),sch:$('#c-sch').value.trim(),sc,secs,stars});
  const draw=()=>{$('#cert-stage').replaceChildren(buildCert(info()));fitCert()};
  $('#c-name').oninput=draw;$('#c-sch').oninput=draw;draw();
  $('#again').onclick=intro;
  $('#c-print').onclick=()=>{
    if(!$('#c-name').value.trim()){$('#c-name').focus();toast('พิมพ์ชื่อก่อนนะ แล้วค่อยกดพิมพ์');return}
    $('#cert-print').replaceChildren(buildCert(info()));
    document.body.classList.add('printing');
    try{window.print()}catch(e){toast('เครื่องนี้พิมพ์จากหน้านี้ไม่ได้ ลองเปิดในแท็บใหม่')}
    setTimeout(()=>document.body.classList.remove('printing'),1500);
  };
  $('#c-name').focus();
}
addEventListener('afterprint',()=>document.body.classList.remove('printing'));
function fitCert(){const f=$('#cert-fit'),s=$('#cert-stage');if(!f||!s)return;const k=f.clientWidth/794;s.style.transform='scale('+k+')';f.style.height=(1123*k)+'px'}
addEventListener('resize',fitCert);

/* เกียรติบัตร A4 แนวตั้ง 794x1123 px (สร้างจาก DOM ใส่ข้อความด้วย textContent ปลอดภัย) */
let SEALN=0;
function buildSeal(sc,stars){
  const NS='http://www.w3.org/2000/svg',mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
  const id='sg'+(++SEALN),pal={3:['#fff6b0','#ffc400','#e08a00'],2:['#ffffff','#d3dbee','#8f9db8'],1:['#ffe6d0','#f2a468','#b8652d']}[stars]||['#fff6b0','#ffc400','#e08a00'];
  const svg=mk('svg',{viewBox:'0 0 200 232',class:'c-seal','aria-hidden':'true'});
  const df=mk('defs',{}),g=mk('linearGradient',{id,x1:'0',y1:'0',x2:'1',y2:'1'});
  [[0,pal[0]],[.55,pal[1]],[1,pal[2]]].forEach(([o,c])=>g.append(mk('stop',{offset:o,'stop-color':c})));df.append(g);svg.append(df);
  svg.append(mk('polygon',{points:'56,150 100,158 80,228 62,206 36,214',fill:'#ff2e88',stroke:'#0e1530','stroke-width':5,'stroke-linejoin':'round'}));
  svg.append(mk('polygon',{points:'144,150 100,158 120,228 138,206 164,214',fill:'#3b5bff',stroke:'#0e1530','stroke-width':5,'stroke-linejoin':'round'}));
  const pts=[];for(let i=0;i<48;i++){const r=i%2?87:98,a=i/48*Math.PI*2;pts.push((100+r*Math.cos(a)).toFixed(1)+','+(100+r*Math.sin(a)).toFixed(1))}
  svg.append(mk('polygon',{points:pts.join(' '),fill:'url(#'+id+')',stroke:'#0e1530','stroke-width':5,'stroke-linejoin':'round'}));
  svg.append(mk('circle',{cx:100,cy:100,r:72,fill:'none',stroke:'#0e1530','stroke-width':4}));
  svg.append(mk('circle',{cx:100,cy:100,r:64,fill:'#fffdf3',stroke:'#0e1530','stroke-width':3}));
  const tx=(t,a)=>{const e=mk('text',Object.assign({'text-anchor':'middle',fill:'#0e1530'},a));e.textContent=t;svg.append(e)};
  tx('SCORE',{x:100,y:62,'font-size':14,'font-weight':800,'letter-spacing':3,'font-family':"'Chakra Petch',sans-serif"});
  tx(String(sc),{x:100,y:112,'font-size':sc>=100?44:52,'font-weight':900,'font-family':"'Chakra Petch',sans-serif"});
  tx('/ 100',{x:100,y:131,'font-size':15,'font-weight':700,'font-family':"'Kanit',sans-serif"});
  tx('★'.repeat(stars)+'☆'.repeat(3-stars),{x:100,y:156,'font-size':21,fill:'#ff2e88','font-family':"'Kanit',sans-serif"});
  return svg;
}
/* เกียรติบัตร A4 แนวตั้ง 794x1123 px (สร้างจาก DOM ใส่ข้อความด้วย textContent ปลอดภัย) */
function buildCert(d){
  const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
  const today=new Date().toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric'});
  const lv=({3:['ทอง','ยอดนักสืบโดเมนไทย'],2:['เงิน','นักสืบโดเมนฝีมือดี'],1:['ทองแดง','นักสืบโดเมนรุ่นใหม่']})[d.stars]||['ทองแดง','นักสืบโดเมนรุ่นใหม่'];
  const c=el('div','cert');
  c.append(el('div','c-rays'),el('div','c-inner'),el('span','c-corner tr'),el('span','c-corner bl'));
  c.append(el('span','c-tag','MISSION .TH · KRUKAN ONLINE'));
  c.append(el('h1','c-title','เกียรติบัตร'));
  c.append(el('p','c-sub','CERTIFICATE OF ACHIEVEMENT'));
  c.append(el('p','c-lead','ขอมอบให้ไว้เพื่อแสดงว่า'));
  const nm=d.name||'(พิมพ์ชื่อของคุณ)';
  c.append(el('p','c-name'+(nm.length>40?' s':nm.length>26?' m':''),nm));
  if(d.sch)c.append(el('p','c-school',d.sch));
  const rk=el('p','c-rank r'+(d.stars||1));rk.append(el('i',null,'★'),document.createTextNode('ระดับ'+lv[0]+' · '+lv[1]),el('i',null,'★'));c.append(rk);
  const bd=el('p','c-body');bd.append(document.createTextNode('ได้ผ่านภารกิจเกม “รู้จัก .th และ .ไทย” ครบ 3 ด่าน'),document.createElement('br'),document.createTextNode('ได้แก่ จับคู่ จัดหมวดหมู่ และตอบคำถาม'));c.append(bd);
  const st=el('div','c-stats');
  const box=(k,v)=>{const b=el('div','c-box');b.append(el('small',null,k),el('b',null,v));return b};
  st.append(box('คะแนน',d.sc+' / 100'),box('เวลา',fmt(d.secs)+' นาที'),box('ด่านที่ผ่าน','3 / 3'));
  c.append(st);
  const sk=el('div','c-skills');['อ่านท้ายชื่อเว็บได้','แยกโดเมนไทยได้','เช็กก่อนเชื่อได้'].forEach(t=>sk.append(el('span',null,t)));c.append(sk);
  const im=new Image();im.className='c-pose';im.alt='';im.src='__P_CERT__';c.append(im);
  c.append(el('p','c-date','ให้ไว้ ณ วันที่ '+today));
  const sg=el('div','c-sign');const sim=new Image();sim.className='c-signimg';sim.alt='ลายเซ็นผู้ดูแลเว็บไซต์';sim.src='__SIG__';sg.append(sim,el('i'),el('b',null,'นายยุทธการ เจียตระกูล'),el('small',null,'ผู้ดูแลเว็บไซต์ KruKan Online'));
  c.append(sg);
  c.append(buildSeal(d.sc,d.stars||1));
  return c;
}

/* ===== มาสคอตนำทาง: ชี้เมาส์หรือกดที่เทคโน แล้วเลือกหัวข้อจากเมนูลัด (ไม่เก็บข้อมูลใด ๆ) ===== */
window.MC=(()=>{
  const MP={wave:'__M_WAVE__',present:'__M_PRESENT__'};
  const ITEMS=[
    ['top','เริ่มต้นหน้านี้','#ffd400'],
    ['what','1 .th และ .ไทย คืออะไร','#4f8bff'],
    ['vs','2 ต่างจาก .com อย่างไร','#00cdb8'],
    ['who','3 ใครขอใช้ชื่อ .th ได้บ้าง','#ff9ac8'],
    ['thnic','★ รู้จัก THNIC','#ffd400',1],
    ['thsvc','★ บริการ THNIC ที่แนะนำ','#ffd400',1],
    ['why','4 ดีกับเราอย่างไร','#a9b8ff'],
    ['check','5 ตรวจสอบและเช็กก่อนเชื่อ','#7ddc4a'],
    ['quiz','6 เล่นเกม รับเกียรติบัตร','#ff2e88'],
    ['refs','แหล่งอ้างอิง','#c9d4ee']
  ];
  const el=$('#mascot'),menu=$('#mc-menu'),ch=$('#mc-char'),img=$('#mc-img'),badge=$('#mc-badge-t');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  menu.innerHTML=ITEMS.map(it=>'<button type="button" class="mc-it'+(it[3]?' hot':'')+'" data-to="'+it[0]+'" style="--k:'+it[2]+'">'+esc(it[1])+'</button>').join('');
  const items=[...menu.children],targets=ITEMS.map(it=>it[0]==='top'?null:document.getElementById(it[0]));
  let isOpen=false,closeT=0;
  function set(on){isOpen=on;menu.hidden=!on;ch.setAttribute('aria-expanded',String(on));img.src=on?MP.present:MP.wave;badge.textContent=on?'เลือกหัวข้อได้เลย':'TECHNO GUIDE'}
  const goTo=id=>{if(id==='top'){scrollTo({top:0,behavior:reduce?'auto':'smooth'});return}const t=document.getElementById(id);if(t)scrollTo({top:t.getBoundingClientRect().top+scrollY-72,behavior:reduce?'auto':'smooth'})};
  menu.addEventListener('click',e=>{const b=e.target.closest('.mc-it');if(!b)return;set(false);goTo(b.dataset.to)});
  ch.addEventListener('click',e=>{e.stopPropagation();set(fine?true:!isOpen)});
  if(fine){el.addEventListener('mouseenter',()=>{clearTimeout(closeT);if(!isOpen)set(true)});el.addEventListener('mouseleave',()=>{closeT=setTimeout(()=>set(false),260)})}
  document.addEventListener('pointerdown',e=>{if(isOpen&&!el.contains(e.target))set(false)},{passive:true});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen){set(false);ch.focus({preventScroll:true})}});
  /* ไฮไลต์หัวข้อที่กำลังอ่านอยู่ */
  let raf=0;
  const spy=()=>{raf=0;let k=0;for(let i=1;i<ITEMS.length;i++){const t=targets[i];if(t&&t.getBoundingClientRect().top<=innerHeight*.42)k=i}items.forEach((b,i)=>b.classList.toggle('on',i===k))};
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(spy)},{passive:true});spy();
  /* ตอนเล่นเกม มาสคอตหลบไม่บังหน้าจอ */
  function sync(){const act=G.stage>=0&&G.stage<=2;el.classList.toggle('mc-away',act);if(act)set(false)}
  return {sync};
})();

/* ปุ่มเสียง + เริ่มเกม */
$('#g-snd').onclick=()=>{G.sound=!G.sound;const b=$('#g-snd');b.setAttribute('aria-pressed',String(G.sound));b.textContent=G.sound?'🔊 เสียง':'🔇 เสียง';if(G.sound)beep('ok')};
intro();

/* เลื่อนหน้า: ไฮไลต์สารบัญ · ปุ่มขึ้นบน · ค่อย ๆ ปรากฏ */
(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links=$$('.toc a'),map={};links.forEach(a=>map[a.getAttribute('href').slice(1)]=a);
  if('IntersectionObserver' in window){
    const spy=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.remove('on'));const a=map[e.target.id];if(a)a.classList.add('on')}})},{rootMargin:'-35% 0px -55% 0px'});
    Object.keys(map).forEach(id=>{const el=document.getElementById(id);if(el)spy.observe(el)});
    if(!reduce){
      let pend=$$('.sh,.panel,.cmp>*,.tblwrap,.fact,.end,.tip,.step,.lab,.refs li,.slot').filter(el=>el.getBoundingClientRect().top>=innerHeight);
      pend.forEach(el=>el.classList.add('rv'));
      let tick=0;const reveal=()=>{tick=0;pend=pend.filter(el=>{if(el.getBoundingClientRect().top<innerHeight*.94){el.classList.add('in');return false}return true})};
      const ask=()=>{if(!tick)tick=requestAnimationFrame(reveal)};
      addEventListener('scroll',ask,{passive:true});addEventListener('resize',ask);setTimeout(reveal,300);
    }
  }
  const tt=$('#totop');
  const onScroll=()=>{tt.hidden=scrollY<700};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  tt.onclick=()=>window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});
})();

/* AI Disclosure: เปิดด้วย SweetAlert2 (โหลดเมื่อกดครั้งแรก) ถ้าโหลดไม่ได้ใช้กล่องสำรอง */
(()=>{
  const btn=$('#ai-btn'),tpl=$('#ai-note-tpl');if(!btn||!tpl)return;
  const title='🤖 การประกาศการใช้ปัญญาประดิษฐ์';
  const fallback=()=>{const o=document.createElement('div');o.className='ai-fallback';o.setAttribute('role','dialog');o.innerHTML='<div class="ai-popup"><h2 class="swal2-title">'+title+'</h2>'+tpl.innerHTML+'<button type="button">รับทราบ</button></div>';o.addEventListener('click',e=>{if(e.target===o||e.target.tagName==='BUTTON')o.remove()});document.body.appendChild(o)};
  const show=()=>Swal.fire({title,html:tpl.innerHTML,width:640,background:'#fff',color:'#0e1530',confirmButtonText:'รับทราบ',confirmButtonColor:'#ffd400',customClass:{popup:'ai-popup',confirmButton:'ai-ok'},backdrop:'rgba(14,21,48,.7)',heightAuto:false,scrollbarPadding:false});
  let loading=null;
  btn.addEventListener('click',()=>{
    if(window.Swal)return show();
    loading=loading||new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/sweetalert2@11.14.5/dist/sweetalert2.all.min.js';sc.onload=res;sc.onerror=rej;document.head.appendChild(sc)});
    loading.then(show).catch(()=>{loading=null;fallback()});
  });
})();
</script>
"""

HEAD = """<!DOCTYPE html>
<html lang="th" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f3f5fb">
<meta name="description" content="รู้จักโดเมน .th และ .ไทย อ่านที่อยู่เว็บให้ออก ท้ายชื่อบอกอะไร และเช็กก่อนเชื่อ พร้อมแบบทดสอบสั้น ๆ จาก Krukan Online">
<title>รู้จัก .th และ .ไทย | Krukan Online</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Kanit:wght@400;500;600;700&display=swap" rel="stylesheet">
<!-- สร้างจาก tools/build-domain-page.py ห้ามแก้ไฟล์นี้ตรง ๆ -->
<style>%s</style>
</head>
<body>
%s
</body>
</html>
"""

body = BODY.replace('__BASE__', 'https://www.krukan.in.th').replace('__LOGO__', POSES['logo'])
for k, v in (('__P_HERO__', 'hero'), ('__P_CERT__', 'cert'), ('__P_READ__', 'read'), ('__P_WIN__', 'win')):
    body = body.replace(k, POSES[v])
body = body.replace('__SIG__', SIG)
for k, v in POSES.items():
    if k.startswith('m_'):
        body = body.replace('__' + k.upper() + '__', v)
import hashlib
V02 = hashlib.sha1((ROOT / 'domain-th' / 'domain-th-02-address-bar.webp').read_bytes()).hexdigest()[:12]
body = body.replace('__V02__', V02)
out = ROOT / 'Domain-Th-Thai.html'
out.write_text(HEAD % (CSS.replace('__V02__', V02), body), encoding='utf-8')
print('built', out.name, round(out.stat().st_size / 1024), 'KB')
