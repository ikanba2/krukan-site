"""ฟอนต์ลายมือ Mali (SIL OFL) สำหรับตัวเลขบนกระดาษทดของ Techno Math: ตัดเหลือตัวเลข อักษรละติน อักษรไทย เลขไทย และเครื่องหมายคณิต
ผลคือ math/fonts/Mali-math-400.woff2 และ Mali-math-600.woff2 (build-games.py ฝังด้วยชื่อฟอนต์ 'Mali')
รัน: python tools/games/math/make_fonts.py   (ต้นฉบับ TTF อยู่ที่ tools/games/aksorn/fonts/)"""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / 'aksorn' / 'fonts'
chars = sorted(set(range(0x20, 0x7F)) | set(range(0x0E00, 0x0E80)) | {0x00A0, 0x00D7, 0x00F7, 0x2212, 0x2248, 0x2264, 0x2265, 0x2260, 0x2013, 0x2026, 0x00B7})
for weight, name in ((400, 'Mali-Regular.ttf'), (600, 'Mali-SemiBold.ttf')):
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.notdef_outline = True; opts.name_IDs = [1, 2]; opts.drop_tables += ['DSIG']
    font = subset.load_font(str(SRC / name), opts); sub = subset.Subsetter(opts); sub.populate(unicodes=chars); sub.subset(font)
    dst = HERE / 'fonts' / f'Mali-math-{weight}.woff2'; subset.save_font(font, str(dst), opts); print(dst.name, dst.stat().st_size, 'bytes', len(TTFont(str(dst)).getBestCmap()), 'อักขระ')
