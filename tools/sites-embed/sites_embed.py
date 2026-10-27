"""ฝังโค้ดเกมและหน้า HTML ลง Google Sites (krukan.in.th) อัตโนมัติ แทนการคัดลอกวางเอง

Google Sites ไม่มี API ให้ใส่โค้ดฝัง สคริปต์นี้จึงควบคุม Chrome ผ่านพอร์ตดีบัก (CDP) เปิดหน้าแก้ไขของแต่ละหน้า
กดปุ่มแก้ไขการฝัง ใส่โค้ดใหม่ กดถัดไป และบันทึก ตามขั้นตอนเดียวกับที่ทำด้วยมือ
- ใช้ Chrome อีกโปรไฟล์หนึ่งของตัวเอง (%LOCALAPPDATA%\\krukan-sites-profile) ล็อกอิน Google ครั้งเดียวแล้วจำไว้ สคริปต์ไม่แตะรหัสผ่านเลย
- ค่าตั้งต้นแก้เฉพาะ 'ฉบับร่าง' ยังไม่เผยแพร่ ต้องสั่ง --publish เองถึงจะขึ้นเว็บจริง
- ใช้: python tools/sites-embed/sites_embed.py --help
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

if not sys.stdout.isatty():
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')   # ส่งต่อเข้าไฟล์หรือท่อ ให้เป็น UTF-8 ไม่เพี้ยน

ROOT = Path(__file__).resolve().parents[2]
CFG = json.loads(Path(__file__).with_name('pages.json').read_text(encoding='utf-8'))
PAGES = CFG['pages']
PORT = int(os.environ.get('KRUKAN_CDP_PORT', '9333'))
PROFILE = Path(os.environ.get('LOCALAPPDATA', str(Path.home()))) / 'krukan-sites-profile'
CHROMES = [r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
           str(Path(os.environ.get('LOCALAPPDATA', '')) / 'Google' / 'Chrome' / 'Application' / 'chrome.exe')]

# ข้อความปุ่มของ Google Sites (ภาษาไทยและอังกฤษ)
T_EDIT, T_NEXT, T_SAVE, T_CANCEL, T_PUBLISH = r'^(แก้ไข|Edit)$', r'^(ถัดไป|Next)$', r'^(บันทึก|Save)$', r'^(ยกเลิก|Cancel)$', r'^(เผยแพร่|Publish)$'


def log(*a):
    print(*a, flush=True)


def edit_url(pid):
    return f"{CFG['site']}/p/{pid}/edit"


# ---------------------------------------------------------------- เนื้อหาที่จะฝัง
def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')


def build_home():
    """หน้าแรกฝังจริงคือ Home-Play-Learn-Lite.html แต่แทน mangaCover ด้วยภาพ base64 ตัวที่ใช้อยู่จริง (ลิงก์ lh3 ในซอร์สไม่ตรงกับหน้าเว็บ)"""
    lite, live = read('Home-Play-Learn-Lite.html'), read('tools/games/covers/_live-home-embed.html')
    m = re.search(r'"mangaCover":"(data:image/webp;base64,[^"]+)"', live)
    pat = re.compile(r'"mangaCover":"https://lh3\.googleusercontent\.com/d/[^"]+"')
    if not m or len(pat.findall(lite)) != 1:
        sys.exit('ประกอบหน้าแรกไม่ได้: หา mangaCover ไม่เจอ (tools/games/covers/_live-home-embed.html หรือ Lite)')
    return pat.sub(lambda _: '"mangaCover":"' + m.group(1) + '"', lite)


LINK_EMBED = """<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#060a1e;overflow:hidden}iframe{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}</style></head>
<body><iframe src="__URL__" title="__TITLE__" allow="fullscreen; autoplay" allowfullscreen></iframe></body></html>
"""


def content_of(key):
    p = PAGES[key]
    if p.get('embed_url'):   # เกมที่ฝากไว้บน GitHub Pages: ฝังเป็นลิงก์ (โค้ดสั้น ไม่กินโควตาตัวอักษรของ Sites) ดู tools/github-games/publish.py
        return LINK_EMBED.replace('__URL__', p['embed_url']).replace('__TITLE__', p.get('note') or key)
    return build_home() if p['kind'] == 'home' else read(p['file'])


def stamp_of(html):
    m = re.search(r'<meta name="kg-build" content="([0-9a-f]+)"', html)
    return m.group(1) if m else None


def run_build(keys):
    """สร้างไฟล์เกมใหม่จากซอร์ส (tools/build-games.py) และหน้าแรกฉบับ Lite (tools/build-home-lite.py)"""
    games = [PAGES[k]['build'] for k in keys if PAGES[k]['kind'] == 'game']
    if games:
        subprocess.run([sys.executable, str(ROOT / 'tools' / 'build-games.py'), '--cdn-only'] + games, cwd=ROOT, check=True)
    if 'home' in keys:
        subprocess.run([sys.executable, str(ROOT / 'tools' / 'build-home-lite.py')], cwd=ROOT, check=True)


# ---------------------------------------------------------------- Chrome
def cdp_alive():
    try:
        urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/version', timeout=1.5).read()
        return True
    except Exception:
        return False


def ensure_chrome():
    if cdp_alive():
        return
    exe = next((c for c in CHROMES if c and Path(c).exists()), None)
    if not exe:
        sys.exit('ไม่พบ Chrome ในเครื่อง')
    PROFILE.mkdir(parents=True, exist_ok=True)
    log('เปิด Chrome โปรไฟล์สำหรับฝังเว็บ:', PROFILE)
    subprocess.Popen([exe, f'--remote-debugging-port={PORT}', f'--user-data-dir={PROFILE}', '--no-first-run', '--no-default-browser-check',
                      '--window-size=1500,950', 'about:blank'])
    for _ in range(60):
        if cdp_alive():
            return
        time.sleep(0.5)
    sys.exit('เปิด Chrome แล้วแต่เชื่อมต่อพอร์ตดีบักไม่ได้')


def ensure_login(page):
    page.goto(edit_url(next(iter(PAGES.values()))['id']), wait_until='domcontentloaded')
    shown = False
    for _ in range(900):                                    # รอล็อกอินได้สูงสุดราว 15 นาที
        url = page.url
        if url.startswith(CFG['site'].split('/d/')[0] + '/d/') and '/edit' in url:
            return
        if not shown:
            log('\n>>> ยังไม่ได้ล็อกอิน Google: ให้ล็อกอินเองในหน้าต่าง Chrome ที่เปิดขึ้นมา (ใช้บัญชีที่แก้เว็บ krukan.in.th ได้) สคริปต์จะรอและทำต่อให้เอง')
            shown = True
        time.sleep(1)
    sys.exit('รอล็อกอินนานเกินไป')


# ---------------------------------------------------------------- ขั้นตอนใน Google Sites
JS_CLICK_BTN = """([pattern, within]) => {
  const re = new RegExp(pattern);
  const root = within ? document.querySelector(within) : document;
  if (!root) return false;
  const cands = [...root.querySelectorAll('button,[role=button],span')].filter(e => {
    const r = e.getBoundingClientRect(); if (!r.width) return false;
    const t = (e.getAttribute('aria-label') || e.innerText || '').trim(); return re.test(t);
  });
  if (!cands.length) return false;
  const el = cands[0].closest('button,[role=button]') || cands[0]; el.click(); return true;
}"""


def click_text(page, pattern, within=None, timeout=20):
    end = time.time() + timeout
    while time.time() < end:
        if page.evaluate(JS_CLICK_BTN, [pattern, within]):
            return True
        time.sleep(0.4)
    return False


def open_embed_editor(page, pid):
    """เปิดหน้าแก้ไขของหน้าเว็บ แล้วกดปุ่มดินสอแก้ไขการฝัง คืน True เมื่อกล่องแก้ไขการฝังขึ้น"""
    page.goto(edit_url(pid), wait_until='domcontentloaded')
    end = time.time() + 90
    while time.time() < end:
        page.mouse.move(700, 350)                           # เลื่อนเมาส์ไปบน embed ให้ปุ่มดินสอโผล่
        ok = page.evaluate("""() => { const b = [...document.querySelectorAll('button[aria-label]')].find(e => /^(แก้ไข|Edit)$/.test(e.getAttribute('aria-label')) && e.getBoundingClientRect().width && e.getBoundingClientRect().left < 120);
          if (!b) return false; b.click(); return true; }""")
        if ok:
            break
        time.sleep(1)
    else:
        return False
    page.wait_for_selector('[role=dialog] textarea', timeout=20000)
    return True


def set_textarea(page, html):
    page.evaluate("""(html) => { const ta = document.querySelector('[role=dialog] textarea'); ta.focus();
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, html);
      ta.dispatchEvent(new Event('input', { bubbles: true })); ta.dispatchEvent(new Event('change', { bubbles: true })); }""", html)


def textarea_value(page):
    return page.evaluate("() => document.querySelector('[role=dialog] textarea').value")


def norm(s):
    return s.replace('\r\n', '\n').strip()


def update_page(page, key, html, force=False):
    """คืน 'same' (เหมือนเดิมข้าม) | 'saved' | 'fail:<เหตุผล>'"""
    pid = PAGES[key]['id']
    if not open_embed_editor(page, pid):
        return 'fail:หาปุ่มแก้ไขการฝังไม่เจอ (หน้านี้อาจไม่ใช่หน้าแบบฝัง)'
    cur = textarea_value(page)
    if not force and norm(cur) == norm(html):
        click_text(page, T_CANCEL, '[role=dialog]')
        return 'same'
    set_textarea(page, html)
    if not click_text(page, T_NEXT, '[role=dialog]'):
        return 'fail:ไม่พบปุ่มถัดไป'
    page.wait_for_function("() => [...document.querySelectorAll('[role=dialog] span')].some(s => /^(บันทึก|Save)$/.test(s.innerText.trim()))", timeout=60000)
    time.sleep(2.5)                                         # ให้ตัวอย่างโหลดก่อนกดบันทึก
    if not click_text(page, T_SAVE, '[role=dialog]'):
        return 'fail:ไม่พบปุ่มบันทึก'
    page.wait_for_selector('[role=dialog]', state='detached', timeout=30000)
    try:                                                    # รอสถานะบันทึกลงไดรฟ์
        page.wait_for_function("() => /บันทึกการเปลี่ยนแปลงทั้งหมด|All changes saved/.test(document.body.innerText)", timeout=30000)
    except Exception:
        time.sleep(4)
    return 'saved'


def verify_draft(page, key, html):
    """เปิดกล่องแก้ไขการฝังซ้ำ เทียบกับโค้ดที่ตั้งใจฝัง แล้วยกเลิก"""
    if not open_embed_editor(page, PAGES[key]['id']):
        return False
    same = norm(textarea_value(page)) == norm(html)
    click_text(page, T_CANCEL, '[role=dialog]')
    return same


def publish(page, keys, really):
    """เปิดหน้าตรวจสอบก่อนเผยแพร่ แสดงรายการเปลี่ยนแปลง ถ้า really ก็กดเผยแพร่"""
    page.goto(edit_url(PAGES[keys[0]]['id']), wait_until='domcontentloaded')
    page.wait_for_selector('button', timeout=60000)
    time.sleep(4)
    if not click_text(page, T_PUBLISH, 'body', 30):
        return 'fail:ไม่พบปุ่มเผยแพร่'
    page.wait_for_function("() => /ตรวจสอบและเผยแพร่|Review and publish/i.test(document.body.innerText)", timeout=60000)
    time.sleep(3)
    changes = page.evaluate("() => [...document.querySelectorAll('[role=listitem],li')].map(e => e.innerText.trim().replace(/\\s+/g, ' ')).filter(t => t && t.length < 120)")
    log('รายการที่จะเผยแพร่:')
    for c in changes:
        log('  -', c)
    if not really:
        return 'review'
    if not click_text(page, T_PUBLISH, 'body', 20):
        return 'fail:ไม่พบปุ่มเผยแพร่ในหน้าตรวจสอบ'
    try:
        page.wait_for_function("() => /เผยแพร่เว็บไซต์ของคุณสำเร็จ|published/i.test(document.body.innerText)", timeout=120000)
    except Exception:   # เคยรายงาน 'published' ทั้งที่ไม่ได้เผยแพร่ (25 ต.ค. 2569) จึงไม่ถือว่าสำเร็จถ้าไม่เห็นข้อความสำเร็จ
        return 'fail:ไม่เห็นข้อความเผยแพร่สำเร็จ ตรวจในหน้า ตรวจสอบและเผยแพร่ (ข้อความ เผยแพร่ล่าสุด ต้องเป็นเวลาล่าสุด)'
    return 'published'


def verify_live(ctx, key, html):
    """เปิดหน้าจริงบน krukan.in.th หา iframe ที่มีรหัสรุ่น (เกม) หรือข้อความอ้างอิง (หน้า home/etc) แล้วเทียบกับไฟล์ในเครื่อง"""
    p = PAGES[key]; pg = ctx.new_page()
    want = (stamp_of(read(p['stamp_file'])) if p.get('stamp_file') else stamp_of(html)) if p['kind'] == 'game' else p.get('marker')   # ฝังด้วยลิงก์: รหัสรุ่นดูจากไฟล์ที่ฝากบน GitHub (stamp_file)
    got = None
    try:
        pg.goto(CFG['live'] + p['live'], wait_until='domcontentloaded', timeout=90000)
        end = time.time() + 90
        while time.time() < end and got is None:
            for f in pg.frames:
                try:
                    if p['kind'] == 'game':
                        v = f.evaluate("() => document.querySelector('meta[name=kg-build]')?.content || null")
                        if v:
                            got = v
                    elif p.get('marker') and p['marker'] in f.content():
                        got = want
                except Exception:
                    pass
            if got is None:
                time.sleep(1.5)
    finally:
        pg.close()
    return got == want, got, want


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description='ฝังโค้ดลง Google Sites krukan.in.th', formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog='ตัวอย่าง:\n  python tools/sites-embed/sites_embed.py --list\n  python tools/sites-embed/sites_embed.py --games --build            ฝังเกมทุกเกมลงฉบับร่าง (build ใหม่ก่อน)\n'
                                        '  python tools/sites-embed/sites_embed.py net-patrol type-hero      เฉพาะบางหน้า\n  python tools/sites-embed/sites_embed.py --all --publish --verify-live   ฝังทุกหน้า เผยแพร่ และตรวจเว็บจริง\n'
                                        '  python tools/sites-embed/sites_embed.py --publish-only --verify-live  เผยแพร่ฉบับร่างที่ฝังไว้แล้ว')
    ap.add_argument('pages', nargs='*', help='ชื่อหน้า (ดู --list)')
    ap.add_argument('--list', action='store_true', help='แสดงหน้าที่ตั้งค่าไว้')
    ap.add_argument('--games', action='store_true', help='ทุกหน้าที่เป็นเกม')
    ap.add_argument('--all', action='store_true', help='ทุกหน้าในรายการ (เกม + home + etc)')
    ap.add_argument('--build', action='store_true', help='สร้างไฟล์เกม/หน้าแรกใหม่จากซอร์สก่อนฝัง')
    ap.add_argument('--force', action='store_true', help='ฝังทับแม้โค้ดเหมือนเดิม')
    ap.add_argument('--publish', action='store_true', help='เผยแพร่ขึ้นเว็บจริงหลังฝังเสร็จ (ไม่ใส่ = แก้เฉพาะฉบับร่าง)')
    ap.add_argument('--publish-only', action='store_true', help='ไม่ฝังอะไร แค่เผยแพร่ฉบับร่างปัจจุบัน')
    ap.add_argument('--review', action='store_true', help='เปิดหน้าตรวจสอบก่อนเผยแพร่ให้ดูรายการแล้วหยุด ไม่กดเผยแพร่')
    ap.add_argument('--verify-live', action='store_true', help='เปิดหน้าจริงตรวจว่าเป็นรุ่นล่าสุด')
    ap.add_argument('--no-verify', action='store_true', help='ข้ามการเปิดตรวจฉบับร่างซ้ำหลังบันทึก (เร็วขึ้น)')
    a = ap.parse_args()

    if a.list or not (a.pages or a.games or a.all or a.publish_only):
        for k, p in PAGES.items():
            f = ROOT / p['file']
            log(f"{k:15} {p['kind']:5} {p['live']:22} {f.stat().st_size // 1024:>5} KB  {p.get('note', '')}")
        return
    keys = list(PAGES) if a.all else [k for k, p in PAGES.items() if a.games and p['kind'] == 'game'] + [k for k in a.pages if k in PAGES]
    bad = [k for k in a.pages if k not in PAGES]
    if bad:
        sys.exit('ไม่รู้จักหน้า: ' + ', '.join(bad) + '  (ดู --list)')
    keys = list(dict.fromkeys(keys))
    if a.publish_only:
        keys = keys or list(PAGES)
    if a.build and keys and not a.publish_only:
        run_build(keys)
    htmls = {k: content_of(k) for k in keys} if not a.publish_only else {}

    from playwright.sync_api import sync_playwright
    ensure_chrome()
    with sync_playwright() as pw:
        br = pw.chromium.connect_over_cdp(f'http://127.0.0.1:{PORT}')
        ctx = br.contexts[0]
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.set_default_timeout(60000)
        ensure_login(page)
        log('ล็อกอินแล้ว เริ่มทำงาน\n')
        results = {}
        if not a.publish_only:
            for i, k in enumerate(keys, 1):
                t0 = time.time()
                log(f'[{i}/{len(keys)}] {k}  ({len(htmls[k]) // 1024} KB) ...')
                try:
                    r = update_page(page, k, htmls[k], a.force)
                except Exception as e:
                    r = 'fail:' + str(e).splitlines()[0][:150]
                if r == 'saved' and not a.no_verify:
                    r = 'saved (ตรวจซ้ำผ่าน)' if verify_draft(page, k, htmls[k]) else 'fail:บันทึกแล้วแต่โค้ดในฉบับร่างไม่ตรง'
                results[k] = r
                log(f'      {r}  {time.time() - t0:.0f} วินาที')
        failed = [k for k, r in results.items() if r.startswith('fail')]
        if failed:
            log('\nมีหน้าที่ไม่สำเร็จ:', ', '.join(failed), '(ไม่เผยแพร่)')
        elif (a.publish or a.publish_only or a.review):
            pk = keys or list(PAGES)
            r = publish(page, pk, a.publish or a.publish_only)
            log('เผยแพร่:', r)
            if r.startswith('fail'):
                failed.append('publish')
        else:
            log('\nแก้เฉพาะฉบับร่างเรียบร้อย ถ้าตรวจแล้วอยากให้ขึ้นเว็บจริงใช้ --publish-only (หรือเพิ่ม --publish ตอนฝัง)')
        if a.verify_live and not failed and (a.publish or a.publish_only):
            log('\nตรวจหน้าจริง:')
            for k in (keys or list(PAGES)):
                html = htmls[k] if k in htmls else content_of(k)
                for attempt in range(3):                            # หลังเผยแพร่ใหม่ๆ เว็บจริงอาจยังเป็นรุ่นเก่าอยู่ครู่หนึ่ง ลองซ้ำสูงสุด 3 ครั้ง
                    ok, got, want = verify_live(ctx, k, html)
                    if ok:
                        break
                    time.sleep(20)
                log(f"  {k:15} {'ตรงรุ่นล่าสุด' if ok else 'ยังไม่ตรง (เว็บ ' + str(got) + ' ต้องการ ' + str(want) + ')'}")
                if not ok:
                    failed.append('live:' + k)
        sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
