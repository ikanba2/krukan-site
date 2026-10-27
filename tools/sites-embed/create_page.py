"""สร้างหน้าเกมใหม่ใต้ 'บทเรียนอื่นๆ' ใน Google Sites ด้วยการ 'ทำซ้ำหน้าเว็บ' จากหน้าเกมเดิม แล้วตั้งชื่อกับเส้นทางที่กำหนดเอง
ใช้: python tools/sites-embed/create_page.py "Techno Steps" techno-steps [ชื่อหน้าต้นแบบ ค่าเริ่มต้น Net Patrol]
ผลลัพธ์: พิมพ์รหัสหน้าใหม่ (ใช้ใส่ pages.json) จากนั้นฝังโค้ดด้วย sites_embed.py ตามปกติ
ขั้นตอนนี้ไม่เผยแพร่อะไร (หน้าใหม่อยู่ในฉบับร่างจนกว่าจะสั่งเผยแพร่)
หมายเหตุ: ใช้สร้างหน้า techno-folder สำเร็จแล้ว (24 ต.ค. 2569) ถ้า Google Sites เปลี่ยนหน้าตาเมนู ตำแหน่งคลิกอาจเลื่อน ให้ดูผลในแผงหน้าเว็บทุกครั้ง

ข้อควรรู้ (ลองแล้วตอนสร้างหน้า techno-steps 24 ต.ค. 2569):
- เมนู ⋮ ของหน้าในแผง 'หน้าเว็บ' อยู่ที่ x≈1477 ของหน้าต่างกว้าง 1500 ต้องเลื่อนเมาส์ไปบนแถวก่อนถึงจะโผล่ และต้องคลิกด้วยเมาส์จริง
  (การสั่ง click ผ่าน JS ไม่ทำงานกับรายการเมนู) รายการที่ 2 ในเมนูคือ 'ทำซ้ำหน้าเว็บ'
- หน้าใหม่จะมาต่อท้ายหน้าต้นแบบในกลุ่มเดียวกัน และซ่อนจากเมนูนำทางเหมือนหน้าต้นแบบ
- ใช้แท็บใหม่ใน Chrome ที่ต่อพอร์ต 9333 อย่างเดียว ไม่แตะแท็บอื่นของผู้ใช้
"""
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

CFG = json.loads(Path(__file__).with_name('pages.json').read_text(encoding='utf-8'))
SITE = CFG['site']
PORT = 9333
SOURCE_KEY = 'net-patrol'                      # หน้าต้นแบบที่ใช้ทำซ้ำ (ใช้เปิดหน้าแก้ไข)

JS_OPEN_TAB = r"""() => { const e = [...document.querySelectorAll('[role=tab]')].find(e => (e.innerText || e.getAttribute('aria-label') || '').trim() === 'หน้าเว็บ'); e && e.click(); }"""
JS_FIND_ROW = r"""(name) => { const it = [...document.querySelectorAll('[role=treeitem]')].find(e => (e.querySelector('input') || {}).value === name);
  if (!it) return null; it.scrollIntoView({block: 'center'}); const b = it.getBoundingClientRect(); return [b.left, b.top]; }"""


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    name, path = sys.argv[1], sys.argv[2]
    src_name = sys.argv[3] if len(sys.argv) > 3 else 'Net Patrol'
    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp(f'http://127.0.0.1:{PORT}')
        pg = b.contexts[0].new_page()
        pg.set_viewport_size({'width': 1500, 'height': 900})
        try:
            pg.goto(f"{SITE}/p/{CFG['pages'][SOURCE_KEY]['id']}/edit", wait_until='domcontentloaded')
            time.sleep(8)
            pg.evaluate(JS_OPEN_TAB); time.sleep(2)
            if pg.evaluate(JS_FIND_ROW, name):
                sys.exit(f'มีหน้าชื่อ "{name}" อยู่แล้ว ไม่สร้างซ้ำ')
            row = pg.evaluate(JS_FIND_ROW, src_name)
            if not row:
                sys.exit(f'ไม่พบหน้าต้นแบบชื่อ "{src_name}" ในแผงหน้าเว็บ')
            time.sleep(1)
            top = row[1] + 22
            pg.mouse.move(1380, top); time.sleep(0.5); pg.mouse.click(1477, top); time.sleep(1.5)      # ปุ่ม ⋮ ของแถว
            pg.mouse.click(1355, top + 58); time.sleep(2.5)                                           # 'ทำซ้ำหน้าเว็บ' (รายการที่ 2 ในเมนู)
            pg.locator('[role=dialog] input').first.click(); pg.keyboard.press('Control+A'); pg.keyboard.type(name); time.sleep(0.5)
            pg.mouse.click(985, top + 156); time.sleep(1.5)                                           # 'ขั้นสูง'
            pg.locator('[role=dialog] input').nth(1).click(); pg.keyboard.type(path); time.sleep(0.6)
            vals = pg.evaluate("() => [...document.querySelectorAll('[role=dialog] input')].map(e => e.value)")
            if vals != [name, path]:
                sys.exit(f'กล่องทำซ้ำหน้าไม่ตรงที่ตั้งใจ: {vals} (ปิดแท็บแล้ว ยังไม่ได้สร้างอะไร)')
            pg.mouse.click(1193, top + 229); time.sleep(6)                                            # 'เสร็จสิ้น'
            url = pg.url
        finally:
            pg.close()
    if '/p/' not in url or '/edit' not in url:
        sys.exit('สร้างหน้าแล้วแต่หารหัสหน้าใหม่จาก URL ไม่ได้: ' + url)
    pid = url.split('/p/')[1].split('/')[0]
    if pid == CFG['pages'][SOURCE_KEY]['id']:
        sys.exit('URL ยังเป็นหน้าต้นแบบ อาจสร้างไม่สำเร็จ ตรวจในแผงหน้าเว็บ')
    print('หน้าใหม่:', name, '/etc/' + path)
    print('รหัสหน้า:', pid)


if __name__ == '__main__':
    main()
