"""สร้างฟอนต์ UI แบบมีหัวกลม (Sarabun, SIL OFL) สำหรับเกมที่สอนอ่าน/พิมพ์ภาษาไทย แทน Kanit (แบบไม่มีหัว ที่ ว กับ า ดูคล้ายกันจนนักเรียนสับสน)
ผลคือ tools/games/vendor/UI-Sarabun-400.woff2 และ UI-Sarabun-600.woff2 ตัดเหลืออักษรไทย อักขระพื้นฐาน และตัวอักษรที่ Kanit ชุดเดิมมี
build-games.py ใส่ 'ui_font': 'Sarabun' ในการตั้งค่าเกม จะฝังไฟล์เหล่านี้ใช้ชื่อฟอนต์ 'Kanit' (โค้ดกลางเรียกชื่อ Kanit ทุกที่ จึงไม่ต้องแก้ทีละจุด)
รัน: python tools/games/make_ui_font.py <โฟลเดอร์ที่มี Sarabun-Regular.ttf และ Sarabun-SemiBold.ttf>   (ฟอนต์ต้นฉบับเก็บที่ aksorn/fonts/ และ scratchpad ตอนดาวน์โหลด)"""
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
src_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / 'aksorn' / 'fonts'
kanit = set(TTFont(str(HERE / 'vendor' / 'Kanit-400.woff2')).getBestCmap())
chars = sorted(kanit | set(range(0x0E00, 0x0E80)) | set(range(0x20, 0x7F)) | {0x00A0, 0x2013, 0x2014, 0x2019, 0x201C, 0x201D, 0x2026, 0x2022, 0x00B7, 0x2039, 0x203A, 0x00D7, 0x00F7, 0x2212, 0x2248, 0x2264, 0x2265, 0x2260})   # รวมเครื่องหมายคณิต × ÷ − ≈ ≤ ≥ ≠ (Techno Math)
for weight, name in ((400, 'Sarabun-Regular.ttf'), (600, 'Sarabun-SemiBold.ttf')):
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.notdef_outline = True; opts.name_IDs = [1, 2]; opts.drop_tables += ['DSIG']
    font = subset.load_font(str(src_dir / name), opts); sub = subset.Subsetter(opts); sub.populate(unicodes=chars); sub.subset(font)
    dst = HERE / 'vendor' / f'UI-Sarabun-{weight}.woff2'; subset.save_font(font, str(dst), opts); print(dst.name, dst.stat().st_size, 'bytes', len(TTFont(str(dst)).getBestCmap()), 'อักขระ')
