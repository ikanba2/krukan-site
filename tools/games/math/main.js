/* ===== เริ่มเกม Techno Math ===== */
KG.firstScene = 'Title';
try { document.fonts.load('600 40px Mali'); document.fonts.load('400 20px Mali'); } catch (e) { /* ใช้ฟอนต์สำรองได้ */ }
KG.start([KG.Boot, TitleScene, MapScene, SpeedScene, PlayScene]);
