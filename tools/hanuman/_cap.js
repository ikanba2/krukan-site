/* ตัวช่วยถ่ายภาพ 3D ความละเอียดสูงของ Game-Hanuman-Path (ใช้ตอนพัฒนา): (0,eval)(await (await fetch('/tools/hanuman/_cap.js')).text()) แล้วเรียก __capAll('ชื่อ') */
window.__cap = async (name, view, cam, look, size) => {
  view.resize(); if (size) { view.renderer.setSize(size[0], size[1], false); view.camera.aspect = size[0] / size[1]; view.camera.updateProjectionMatrix(); }
  if (cam) { view.camera.position.set(...cam); view.camera.up.set(0, 1, 0); view.camera.lookAt(...look); }
  view.renderer.render(view.scene, view.camera); const url = view.canvas.toDataURL('image/png');
  const r = await fetch('http://127.0.0.1:8801/' + name, { method: 'POST', body: url }); return await r.text();
};
window.__capAll = async tag => {
  const H = window.__hanuman, out = [], home = H.views.find(x => x.hero && x.yak && !x.board);
  out.push(await __cap(tag + '_hero', home, [-0.9, 1.75, -3.3], [-1.5, 1.3, 0], [800, 800]));
  out.push(await __cap(tag + '_yak', home, [1.2, 1.9, -3.6], [1.6, 1.4, 0.2], [800, 800]));
  const bv = H.views.filter(x => x.board), pick = id => bv.find(x => x.m && x.m.id === id);
  for (const id of ['ia', 'g5', 'd1']) { const v = pick(id); if (v) { v.frameCamera(); out.push(await __cap(tag + '_b_' + id, v, null, null, [1100, 720])); } }
  return out;
};
