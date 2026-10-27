"""ตัดฟอนต์ Mali (OFL) เหลือเฉพาะอักษรไทย ตัวเลข และอักขระพื้นฐาน แล้วบีบเป็น woff2 ให้ build-games.py ฝังเป็น base64
รัน: python tools/games/aksorn/make_font.py  (ได้ fonts/Mali-subset.woff2)"""
from pathlib import Path
from fontTools import subset

HERE = Path(__file__).resolve().parent
chars = list(range(0x0E00, 0x0E80)) + list(range(0x20, 0x7F)) + [0x00A0, 0x2013, 0x2019, 0x201C, 0x201D, 0x2026]
for src, out in (('Mali-Regular.ttf', 'Mali-subset.woff2'), ('Mali-SemiBold.ttf', 'Mali-subset-600.woff2')):   # 400 ใช้กับตัวอักษรทั่วไป 600 ใช้กับตัวหนา
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']      # เก็บฟีเจอร์จัดสระ/วรรณยุกต์ของอักษรไทย (mark, mkmk, ccmp)
    opts.notdef_outline = True
    opts.name_IDs = [1, 2]
    opts.drop_tables += ['DSIG']
    font = subset.load_font(str(HERE / 'fonts' / src), opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=chars)
    sub.subset(font)
    dst = HERE / 'fonts' / out
    subset.save_font(font, str(dst), opts)
    print(dst.name, dst.stat().st_size, 'bytes')
# Sarabun (OFL) ใช้แสดงรูปสระที่มีขีดแทนพยัญชนะ และคำที่มีเครื่องหมายสระ/วรรณยุกต์ เพราะเครื่องหมายโค้งแบบมาตรฐาน (ใน Mali เป็นรูปเหลี่ยม)
opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.notdef_outline = True; opts.name_IDs = [1, 2]; opts.drop_tables += ['DSIG']
font = subset.load_font(str(HERE / 'fonts' / 'Sarabun-Regular.ttf'), opts); sub = subset.Subsetter(opts); sub.populate(unicodes=chars); sub.subset(font)
dst = HERE / 'fonts' / 'Sarabun-subset.woff2'; subset.save_font(font, str(dst), opts); print(dst.name, dst.stat().st_size, 'bytes')
# Sarabun ตัวหนา (700) ใช้กับรูปสระ/คำที่มีเครื่องหมาย (fontStyle bold) ให้เป็นตัวหนาจริง ไม่ใช้ตัวหนาเทียมของเบราว์เซอร์
opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.notdef_outline = True; opts.name_IDs = [1, 2]; opts.drop_tables += ['DSIG']
font = subset.load_font(str(HERE / 'fonts' / 'Sarabun-Bold.ttf'), opts); sub = subset.Subsetter(opts); sub.populate(unicodes=chars); sub.subset(font)
dst = HERE / 'fonts' / 'Sarabun-subset-700.woff2'; subset.save_font(font, str(dst), opts); print(dst.name, dst.stat().st_size, 'bytes')
