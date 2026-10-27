"""ฝากเกมไว้บน GitHub Pages แล้วให้ Google Sites ฝังด้วยลิงก์ (ไม่กินโควตา 40 ล้านอักขระของ Sites)
ปลายทาง: repo สาธารณะ <บัญชี>/krukan-games · โฟลเดอร์ในเครื่อง C:/Users/ikan/krukan-games (git แยกจากโปรเจกต์นี้ และอยู่นอก OneDrive กันไฟล์ถูกล็อกตอนซิงก์)
เว็บ: https://<บัญชี>.github.io/krukan-games/<เกม>/   เช่น .../math/
หมายเหตุ Windows: gh ที่ถูกเรียกจาก Python มองไม่เห็นการล็อกอินในคีย์ริง ให้ส่งโทเคนผ่านตัวแปรสภาพแวดล้อมของคำสั่งนี้เท่านั้น: GH_TOKEN=$(gh auth token) python tools/github-games/publish.py --push
รัน:  python tools/github-games/publish.py            คัดลอกไฟล์เกมรุ่นล่าสุดลงโฟลเดอร์ (ยังไม่ส่ง)
      python tools/github-games/publish.py --push     คัดลอก + commit + push (ครั้งแรกสร้าง repo และเปิด Pages ให้เอง ต้อง gh auth login ก่อน)
ก่อนรันให้ build เกมก่อน: python tools/build-games.py math  (ใช้ไฟล์ -Offline ที่ฝัง Phaser ไว้ในตัว ไม่ต้องพึ่ง CDN)
ฝังใน Sites: ใช้ลิงก์ของเกม (ฝัง > ตาม URL) หรือโค้ดสั้นจาก embed.html ที่สคริปต์เขียนให้ (iframe ชี้ไปที่ GitHub Pages)"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
DEST = Path('C:/Users/ikan/krukan-games')
REPO = 'krukan-games'
# เกมที่ฝากไว้บน GitHub: โฟลเดอร์บนเว็บ › (ไฟล์ที่ build แล้ว, ชื่อที่แสดง)
GAMES = {
    'math': ('Game-Techno-Math-Offline.html', 'สมรภูมิคณิต Techno Math ป.1–ป.4'),
    'type-hero': ('Game-Type-Hero-Offline.html', 'จอมพิมพ์ Type Hero ฝึกพิมพ์ไทย-อังกฤษ'),   # ทดลองเต็มจอแบบเปิดหน้าเกมโดยตรง (ไม่อยู่ในกรอบ Sites) 26 ต.ค. 2569
    # 27 ต.ค. 2569: เกมฝึกทักษะ 4 เกม (48 ด่านต่อเกม) ฝากไว้ที่นี่ เพราะ Sites เต็มโควตาตัวอักษร ฝังด้วยลิงก์แทน
    'rainbow-city': ('Game-Rainbow-City-Offline.html', 'เมืองสีรุ้ง Rainbow City ฝึกสี รูปทรง นับเลข เรียงลำดับ'),
    'beat-hero': ('Game-Beat-Hero-Offline.html', 'จอมจังหวะ Beat Hero ฝึกกดคีย์บอร์ดตามจังหวะเพลง'),
    'keyboard-quest': ('Game-Keyboard-Quest-Offline.html', 'ภารกิจแป้นพิมพ์ Keyboard Quest ลูกศร ตัวอักษร ปุ่มพิเศษ คีย์ลัด'),
    'mouse-adventure': ('Game-Mouse-Adventure-Offline.html', 'ผจญภัยเมาส์ Mouse Adventure ฝึกคลิก ลากวาง ลูกกลิ้ง'),
    # 27 ต.ค. 2569: เกมคณิต 5 เกม (48 ด่านต่อเกม) อัปเกรดจากหน้าเดิมของ Sites
    'snake-ladder-math': ('Game-Snake-Ladder-Math-Offline.html', 'บันไดงูบวกลบเลข เกมคณิต 48 ด่าน'),
    'number-run': ('Game-Number-Run-Offline.html', 'เรียงลำดับตัวเลข เกมคณิต 48 ด่าน'),
    'power-columns': ('Game-Power-Columns-Offline.html', 'คิดเลขแสนสนุก เกมคณิต 48 ด่าน'),
    'roman-code': ('Game-Roman-Code-Offline.html', 'เลขโรมัน เกมคณิต 48 ด่าน'),
    'plus-power-hunter': ('Game-Plus-Power-Hunter-Offline.html', 'สมบัติพลังบวก เกมคณิต 48 ด่าน'),
    'hanuman-path': ('Game-Hanuman-Path.html', 'หนุมานพิชิตเส้นทาง 3D สื่อฉายหน้าชั้น ป.4 (สร้างจาก tools/hanuman/build_hanuman.py)'),
    'manga': ('นิยายมังงะ_มาสไรเดอร์เทคโน/เว็บอ่านนิยายมังงะ/Techno-Manga-Reader.html', 'นิยายมังงะ Cyber Rider Techno เว็บอ่านนิยาย 24 ตอน'),   # ผู้ใช้สั่งย้ายมา GitHub 27 ต.ค. 2569
}

INDEX = """<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>KruKan Games · เกมการเรียนรู้ครูการ</title>
<style>body{margin:0;min-height:100vh;background:#070a1f;color:#f4f7ff;font:18px/1.6 Tahoma,sans-serif;display:flex;align-items:center;justify-content:center}
main{max-width:720px;padding:32px}h1{margin:0 0 8px;color:#4ef4d2}a{color:#ffd34f}li{margin:8px 0}</style></head>
<body><main><h1>KruKan Games</h1><p>เกมการเรียนรู้ของ <a href="https://www.krukan.in.th">ครูการ KruKan.in.th</a> (เก็บไว้ที่นี่แล้วฝังลงเว็บไซต์ด้วยลิงก์)</p><ul>
__LIST__
</ul></main></body></html>
"""
EMBED = """<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#060a1e;overflow:hidden}iframe{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}</style></head>
<body><iframe src="__URL__" title="__TITLE__" allow="fullscreen; autoplay" allowfullscreen></iframe></body></html>
"""


def run(*a, check=True):
    print('>', ' '.join(a))
    return subprocess.run(a, cwd=DEST, check=check, capture_output=True, text=True, encoding='utf-8')


def owner():
    r = subprocess.run(['gh', 'api', 'user', '--jq', '.login'], capture_output=True, text=True)
    if r.returncode:
        sys.exit('ยังไม่ได้ล็อกอิน GitHub: รัน gh auth login --web --git-protocol https ก่อน')
    return r.stdout.strip()


def copy_files(base_url):
    DEST.mkdir(exist_ok=True)
    items = []
    for folder, (src, title) in GAMES.items():
        f = root / src
        if not f.exists():
            sys.exit(f'ยังไม่มี {src}: รัน python tools/build-games.py ก่อน')
        (DEST / folder).mkdir(exist_ok=True)
        shutil.copy2(f, DEST / folder / 'index.html')
        url = f'{base_url}{folder}/' if base_url else f'{folder}/'
        (DEST / folder / 'embed.html').write_text(EMBED.replace('__URL__', url).replace('__TITLE__', title), encoding='utf-8')
        items.append(f'<li><a href="{folder}/">{title}</a></li>')
        print(f'{folder}: {f.stat().st_size // 1024} KB  ›  {url}')
    (DEST / 'index.html').write_text(INDEX.replace('__LIST__', '\n'.join(items)), encoding='utf-8')
    (DEST / '.nojekyll').write_text('', encoding='utf-8')
    (DEST / 'README.md').write_text('# KruKan Games\n\nเกมการเรียนรู้ของครูการ (https://www.krukan.in.th) ฝากไว้บน GitHub Pages แล้วฝังลง Google Sites ด้วยลิงก์\nไฟล์ในนี้สร้างจากโปรเจกต์ KruKan (tools/build-games.py + tools/github-games/publish.py) อย่าแก้ตรงนี้\n', encoding='utf-8')


def ensure_identity(user):
    # ตั้งชื่อ/อีเมลผู้ commit เฉพาะ repo นี้ (ใช้อีเมล noreply ของ GitHub ไม่เปิดเผยอีเมลจริง) ไม่แตะค่า git ส่วนกลางของเครื่อง
    uid = subprocess.run(['gh', 'api', 'user', '--jq', '.id'], capture_output=True, text=True).stdout.strip()
    run('git', 'config', 'user.name', user)
    run('git', 'config', 'user.email', f'{uid}+{user}@users.noreply.github.com')


def main():
    push = '--push' in sys.argv
    user = owner() if push else None
    base = f'https://{user}.github.io/{REPO}/' if user else ''
    copy_files(base)
    if not push:
        print('คัดลอกแล้ว (ยังไม่ส่ง) ใส่ --push เพื่อส่งขึ้น GitHub')
        return
    if not (DEST / '.git').exists():
        run('git', 'init', '-b', 'main')
    ensure_identity(user)
    run('git', 'add', '-A')
    if run('git', 'diff', '--cached', '--quiet', check=False).returncode:
        run('git', 'commit', '-m', 'อัปเดตเกม ' + ', '.join(GAMES))
    has_remote = run('git', 'remote', check=False).stdout.strip()
    if not has_remote:
        exists = subprocess.run(['gh', 'repo', 'view', f'{user}/{REPO}'], capture_output=True).returncode == 0
        if not exists:
            r = run('gh', 'repo', 'create', REPO, '--public', '--source', '.', '--remote', 'origin', '--description', 'เกมการเรียนรู้ของครูการ KruKan.in.th (ฝังใน Google Sites ด้วยลิงก์)')
            print(r.stdout, r.stderr)
        else:
            run('git', 'remote', 'add', 'origin', f'https://github.com/{user}/{REPO}.git')
    r = run('git', '-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', 'push', '-u', 'origin', 'main', check=False); print(r.stdout, r.stderr)   # ใช้โทเคนของ gh เฉพาะคำสั่งนี้
    # เปิด GitHub Pages จากสาขา main โฟลเดอร์ราก (ถ้าเปิดแล้วจะได้ 409 ไม่เป็นไร)
    r = subprocess.run(['gh', 'api', '-X', 'POST', f'repos/{user}/{REPO}/pages', '-f', 'source[branch]=main', '-f', 'source[path]=/'], capture_output=True, text=True)
    print('pages:', (r.stdout or r.stderr).strip()[:300])
    for folder in GAMES:
        print('เว็บ:', f'{base}{folder}/')


if __name__ == '__main__':
    main()
