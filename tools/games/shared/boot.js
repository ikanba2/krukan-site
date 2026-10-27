/* ===== ฉากโหลด: ใส่ภาพที่ฝัง base64 เข้าเท็กซ์เจอร์ แล้วไปฉากแรกของเกม ===== */
(function () {
  'use strict';
  KG.Boot = class extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
      const c = this.cameras.main; c.setZoom(KG.K); c.centerOn(KG.GW / 2, KG.GH / 2);
      KG.audio.init(this.game); KG.audio.setSfx(KG.prefs.data.sfx); KG.audio.musOn = KG.prefs.data.music;
      KG.fx.init(this);
      KG.loadImages(this, KG.IMG).then(() => this.scene.start(KG.firstScene));
    }
  };
})();
