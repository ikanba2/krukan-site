"""ทำแม่แบบหน้า 'บทเรียนอื่นๆ' แบบมีภาพปกแยกหมวด จากหน้าเดิม (ใช้ครั้งเดียว) แล้วแก้ template.html ต่อด้วยมือได้
ผลลัพธ์: tools/etc-page/template.html (มีจุดแทรกข้อมูล /*__DATA__*/ และวันที่ /*__UPDATED__*/ ที่ tools/build-etc-page.py เติมให้)"""
import io
from pathlib import Path

here = Path(__file__).resolve().parent
s = io.open(here / 'Etc-Side-Quests.before-covers.html', encoding='utf-8').read()

NEW_CSS = r"""
    /* ===== หมวดหมู่ (แบบเดียวกับหน้า home) + การ์ดปกเกม ===== */
    .sec{margin-top:26px;scroll-margin-top:12px}
    .sec[hidden]{display:none}
    .sec-h{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid color-mix(in srgb,var(--c) 45%,transparent)}
    .sec-h h2{margin:0;font:700 clamp(19px,3.2vw,25px)/1.2 'Kanit',sans-serif;display:flex;align-items:center;gap:10px}
    .sec-h h2 i{font-style:normal;display:grid;place-items:center;width:38px;height:42px;font-size:21px;background:linear-gradient(160deg,#fff,var(--c));clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}
    .sec-h small{font:800 11px/1 var(--hud);letter-spacing:.2em;color:color-mix(in srgb,var(--c) 60%,#fff)}
    .sec-h .cnt{margin-left:auto;font-size:12.5px;color:#b9c4dc}
    .pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(262px,1fr));gap:14px}
    .pgrid + .grid{margin-top:12px}
    .sec .grid{margin-top:0}
    .pcard{--c:#06b6d4;position:relative;display:flex;flex-direction:column;padding:2px;text-decoration:none;isolation:isolate;
      background:linear-gradient(120deg,color-mix(in srgb,var(--c) 70%,#fff),var(--c));
      clip-path:polygon(var(--cut) 0,100% 0,100% calc(100% - var(--cut)),calc(100% - var(--cut)) 100%,0 100%,0 var(--cut));
      transition:transform .18s,filter .18s;animation:rise .4s both}
    .pcard::before{content:'';position:absolute;inset:2px;z-index:-1;clip-path:inherit;
      background:linear-gradient(170deg,color-mix(in srgb,var(--c) 24%,#0b0f28),#0a0d26 72%)}
    .pcard:hover{transform:translateY(-4px);filter:brightness(1.12) drop-shadow(0 10px 16px rgba(0,0,0,.55))}
    .pcard[hidden]{display:none}
    .shot{position:relative;display:block;aspect-ratio:16/9;overflow:hidden;background:linear-gradient(135deg,#1a2255,#0d1233);
      clip-path:polygon(calc(var(--cut) - 2px) 0,100% 0,100% 100%,0 100%,0 calc(var(--cut) - 2px))}
    .shot img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .4s}
    .pcard:hover .shot img{transform:scale(1.07)}
    .shot .noimg{position:absolute;inset:0;display:none;place-items:center;font-size:44px}
    .shot.fail .noimg{display:grid}
    .shot.fail img{display:none}
    .aud{position:absolute;left:8px;bottom:8px;padding:2px 10px;font:600 12px/1.5 'Kanit',sans-serif;font-style:normal;background:rgba(8,11,32,.84);border:1px solid color-mix(in srgb,var(--c) 70%,#fff);border-radius:999px;color:#f4f7ff}
    .nw{position:absolute;right:8px;top:8px;padding:1px 9px;font:800 11px/1.6 var(--hud);font-style:normal;letter-spacing:.08em;color:#2a1600;background:linear-gradient(120deg,#fff3b0,#ffd34f);border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.4)}
    .pbody{display:block;padding:10px 12px 12px}
    .pbody b{display:block;font-weight:600;font-size:15.5px;line-height:1.3;overflow-wrap:anywhere}
    .pbody .brief{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:3px;font-size:12.5px;line-height:1.45;color:#c9d4e3;min-height:2.9em}
    .pbody small{display:block;margin-top:6px;font-size:11.5px;color:color-mix(in srgb,var(--c) 55%,#fff)}
"""
NEW_MOBILE = """
      .pgrid{grid-template-columns:1fr;gap:12px}
      .sec-h .cnt{margin-left:0}
"""
marker = "    @media(max-width:520px){"
assert s.count(marker) == 1
s = s.replace(marker, NEW_CSS + "\n" + marker, 1)
assert "      .dice{flex:1}\n    }" in s
s = s.replace("      .dice{flex:1}\n    }", "      .dice{flex:1}" + NEW_MOBILE + "    }", 1)
assert '<main class="grid" id="grid"></main>' in s
s = s.replace('<main class="grid" id="grid"></main>', '<main id="sections"></main>', 1)
old = '<div class="stat"><b id="n-cats">0</b><span>หมวด</span></div>'
assert old in s
s = s.replace(old, old + '\n        <div class="stat"><b id="n-cov">0</b><span>มีภาพปก</span></div>', 1)

a = s.index('    /* ===================== ตั้งค่าหน้านี้')
b = s.index('  </script>', a)
js = io.open(here / 'template.js.txt', encoding='utf-8').read()
s = s[:a] + js + s[b:]
io.open(here / 'template.html', 'w', encoding='utf-8', newline='').write(s)
print('template.html', len(s), 'DATA' if '/*__DATA__*/' in s else 'no DATA')
