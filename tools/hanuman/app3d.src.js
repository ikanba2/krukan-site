  var vt = (i, t = document) => t.querySelector(i),
    cn = (i, t = document) => [...t.querySelectorAll(i)],
    Sn = JSON.parse(vt("#mission-data").textContent),
    Al = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ],
    Mh = ["\u0E02\u0E36\u0E49\u0E19\u0E1A\u0E19", "\u0E02\u0E27\u0E32", "\u0E25\u0E07\u0E25\u0E48\u0E32\u0E07", "\u0E0B\u0E49\u0E32\u0E22"];
  var Cl = {
      wr: {
        label: "\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E25\u0E48\u0E19",
        kind: "start",
        desc: "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E0A\u0E38\u0E14\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07",
      },
      mf: {
        label: "\u0E44\u0E1B\u0E02\u0E49\u0E32\u0E07\u0E2B\u0E19\u0E49\u0E32",
        kind: "motion",
        desc: "\u0E40\u0E14\u0E34\u0E19 1 \u0E0A\u0E48\u0E2D\u0E07",
      },
      tr: {
        label: "\u0E2B\u0E31\u0E19\u0E02\u0E27\u0E32",
        kind: "turn",
        desc: "\u0E2B\u0E21\u0E38\u0E19\u0E15\u0E32\u0E21\u0E40\u0E02\u0E47\u0E21\u0E19\u0E32\u0E2C\u0E34\u0E01\u0E32",
      },
      tl: {
        label: "\u0E2B\u0E31\u0E19\u0E0B\u0E49\u0E32\u0E22",
        kind: "turn",
        desc: "\u0E2B\u0E21\u0E38\u0E19\u0E17\u0E27\u0E19\u0E40\u0E02\u0E47\u0E21\u0E19\u0E32\u0E2C\u0E34\u0E01\u0E32",
      },
      re2: {
        label: "\u0E17\u0E33\u0E0B\u0E49\u0E33",
        kind: "repeat",
        n: 2,
        desc: "\u0E17\u0E33\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E16\u0E31\u0E14\u0E44\u0E1B 2 \u0E04\u0E23\u0E31\u0E49\u0E07",
      },
      re3: {
        label: "\u0E17\u0E33\u0E0B\u0E49\u0E33",
        kind: "repeat",
        n: 3,
        desc: "\u0E17\u0E33\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E16\u0E31\u0E14\u0E44\u0E1B 3 \u0E04\u0E23\u0E31\u0E49\u0E07",
      },
      re4: {
        label: "\u0E17\u0E33\u0E0B\u0E49\u0E33",
        kind: "repeat",
        n: 4,
        desc: "\u0E17\u0E33\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E16\u0E31\u0E14\u0E44\u0E1B 4 \u0E04\u0E23\u0E31\u0E49\u0E07",
      },
      re5: {
        label: "\u0E17\u0E33\u0E0B\u0E49\u0E33",
        kind: "repeat",
        n: 5,
        desc: "\u0E17\u0E33\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E16\u0E31\u0E14\u0E44\u0E1B 5 \u0E04\u0E23\u0E31\u0E49\u0E07",
      },
      wa: {
        label: "\u2726 \u0E27\u0E32\u0E23\u0E4C\u0E1B",
        kind: "warp",
        desc: "\u0E08\u0E1A\u0E17\u0E35\u0E48\u0E1B\u0E23\u0E30\u0E15\u0E39\u0E27\u0E34\u0E40\u0E28\u0E29",
      },
    },
    vl = ["wr", "mf", "tr", "tl", "re2", "re3", "re4", "re5", "wa"],
    Rl = [],
    Wx = new Ts();
  function bn(i, t = "") {
    let e = Cl[i] || { label: i, kind: "motion" };
    return `<span class="sblock ${e.kind} ${t}"><span>${e.label}</span>${e.n ? `<span class="num">${e.n}</span><span>\u0E04\u0E23\u0E31\u0E49\u0E07</span><i class="repeat-hole"></i>` : ""}<span class="code">${i}</span></span>`;
  }
  function rg(i) {
    return new Promise((t) => setTimeout(t, i));
  }
  function yl(i) {
    let t = vt("#toast");
    ((t.textContent = i), t.classList.add("show"), clearTimeout(yl.t), (yl.t = setTimeout(() => t.classList.remove("show"), 2200)));
  }
  function Sh(i) {
    let t = [];
    for (let e = 0; e < i.length; e++) {
      let n = i[e];
      if (/^re[2-5]$/.test(n) && e + 1 < i.length) {
        let s = +n.slice(2);
        for (let r = 1; r <= s; r++) t.push({ t: i[e + 1], src: e + 1, loopSrc: e, rep: r, total: s });
        e++;
      } else t.push({ t: n, src: e });
    }
    return t;
  }
  function ag(i) {
    let t = i.start.dir;
    for (let e of Sh(i.solution)) e.t === "tr" ? (t = (t + 1) % 4) : e.t === "tl" && (t = (t + 3) % 4);
    return t;
  }
  function Je(i, t) {
    return new Promise((e) => {
      let n = performance.now();
      function s(r) {
        let a = Math.min(1, (r - n) / i),
          o = 1 - Math.pow(1 - a, 3);
        (t(o, a), a < 1 ? requestAnimationFrame(s) : e());
      }
      requestAnimationFrame(s);
    });
  }
  function ce(i, t = 0.05, e = 0.7, n = 0) {
    return new ys({ color: i, metalness: t, roughness: e, emissive: n || 0, emissiveIntensity: n ? 0.65 : 0 });
  }
  var Tt = {
    white: ce(16775400, 0.03, 0.6),
    skin: ce(16765857, 0.02, 0.75),
    gold: ce(16761647, 0.78, 0.24),
    red: ce(14233406, 0.25, 0.5),
    green: ce(2071906, 0.15, 0.55),
    blue: ce(1342417, 0.2, 0.48),
    purple: ce(7290549, 0.2, 0.5),
    black: ce(1053986, 0.1, 0.45),
    brown: ce(7222555, 0.05, 0.9),
    stone: ce(9080728, 0.08, 0.92),
  };
  function Ke(i, t, e, n = [0, 0, 0], s = [0, 0, 0], r = [1, 1, 1]) {
    let a = new ke(i, t);
    return (a.position.set(...n), a.rotation.set(...s), a.scale.set(...r), (a.castShadow = !0), (a.receiveShadow = !0), e.add(a), a);
  }
  function qt(i, t, e, n, s = [1, 1, 1]) {
    return Ke(new vs(i, 20, 14), t, e, n, [0, 0, 0], s);
  }
  function ve(i, t, e, n, s, r, a = [0, 0, 0]) {
    return Ke(new Vi(i, t, e, 18), n, s, r, a);
  }
  function Vs(i, t, e, n, s, r = [0, 0, 0]) {
    return Ke(new Gi(i, t, 18), e, n, s, r);
  }
  function ri(i, t, e, n, s, r, a = [0, 0, 0]) {
    return Ke(new Zn(i, t, e), n, s, r, a);
  }
  /* ======================= โมเดลรุ่นอัปเกรด (27 ต.ค. 2569) =======================
     ปั้นจากทรงพื้นฐานของ three.js (ทรงกลม ทรงกระบอก กรวย กล่อง วงแหวน) ใส่เส้นขอบการ์ตูน (สำเนาหันหลังออก) ให้ดูเป็นตุ๊กตาของเล่น
     ต้องคง API เดิม: Hs() หนุมาน (userData.parts: leftArm rightArm leftLeg rightLeg body head tail staff) · bh(i) ยักษ์ (la ra ll rl head club)
     qa() ประตูวิเศษ (r1 r2 core threshold entry light) · cg(asset, i) ของตกแต่ง · __makeHanumanCoin() เหรียญ (face) */
  const hxNM = (c, m = 0.05, r = 0.6, e = 0, ei = 0.55) => new ys({ color: c, metalness: m, roughness: r, emissive: e, emissiveIntensity: ei });
  const OUTLINE_MAT = new $n({ color: 0x2a1748, side: 1 });
  const hxP = {
    mouth: hxNM(0x4a0a1c, 0, 0.5),
    fur: hxNM(0xfff3e0, 0, 0.9), cream: hxNM(0xfffaf0, 0, 0.8), furLo: hxNM(0xe9d6bd, 0, 0.92), skin: hxNM(0xffd3b8, 0, 0.72), blush: hxNM(0xff8fa5, 0, 0.8),
    gold: hxNM(0xffc531, 0.3, 0.3, 0x8a5a00, 0.4), goldLo: hxNM(0xd68e12, 0.3, 0.38, 0x6a3a00, 0.35), ruby: hxNM(0xe4143f, 0.3, 0.18, 0x9a0020, 0.75), sapph: hxNM(0x2a6bff, 0.3, 0.18, 0x0a2a9a, 0.65),
    jade: hxNM(0x1fd18b, 0.3, 0.2, 0x058a55, 0.65), amber: hxNM(0xffa21a, 0.3, 0.25, 0xb35a00, 0.6),
    red: hxNM(0xd92a3c, 0.1, 0.62), redLo: hxNM(0xa81a2c, 0.1, 0.7), blue: hxNM(0x2f55e0, 0.1, 0.6), purple: hxNM(0x7a3fd8, 0.1, 0.6),
    eye: hxNM(0xffffff, 0, 0.15), ink: hxNM(0x1d1128, 0.05, 0.4), wood: hxNM(0x7d4b2a, 0.05, 0.85), woodLo: hxNM(0x573219, 0.05, 0.9),
    stone: hxNM(0xb3adc4, 0.05, 0.9), stoneLo: hxNM(0x8f88a3, 0.05, 0.95), white: hxNM(0xffffff, 0.05, 0.55), leaf: hxNM(0x2fbf6c, 0.02, 0.8),
    leafLo: hxNM(0x1f9d5a, 0.02, 0.85), leafHi: hxNM(0x7be07e, 0.02, 0.8), pink: hxNM(0xff9fc4, 0.02, 0.8), pinkLo: hxNM(0xf27aa8, 0.02, 0.85)
  };
  function hxM(geo, mat, parent, pos, rot, scl, noOut) {
    const m = new ke(geo, mat);
    m.position.set(...(pos || [0, 0, 0]));
    m.rotation.set(...(rot || [0, 0, 0]));
    m.scale.set(...(scl || [1, 1, 1]));
    m.castShadow = true;
    m.receiveShadow = true;
    if (noOut) m.userData.noOut = true;
    parent.add(m);
    return m;
  }
  const hxS = (r, mat, parent, pos, scl, noOut, rot) => hxM(new vs(r, 26, 18), mat, parent, pos, rot, scl, noOut);
  const hxC = (rt, rb, h, mat, parent, pos, rot, noOut, seg = 24) => hxM(new Vi(rt, rb, h, seg), mat, parent, pos, rot, null, noOut);
  const hxK = (r, h, mat, parent, pos, rot, noOut, seg = 24, scl) => hxM(new Gi(r, h, seg), mat, parent, pos, rot, scl, noOut);
  const hxB = (w, h, d, mat, parent, pos, rot, noOut) => hxM(new Zn(w, h, d), mat, parent, pos, rot, null, noOut);
  const hxT = (R, r, mat, parent, pos, rot, arc = Math.PI * 2, noOut = true) => hxM(new mi(R, r, 10, 40, arc), mat, parent, pos, rot, null, noOut);
  // เส้นขอบการ์ตูน: ทำสำเนาทรงเดิมขยายเล็กน้อยแล้วกลับด้านหน้า (BackSide) สีม่วงเข้ม
  function hxInk(group, k = 1.07) {
    const list = [];
    group.traverse((o) => {
      if (o.isMesh && !o.userData.noOut && !o.userData.isOutline) list.push(o);
    });
    list.forEach((o) => {
      const c = new ke(o.geometry, OUTLINE_MAT);
      c.position.copy(o.position);
      c.rotation.copy(o.rotation);
      c.scale.copy(o.scale).multiplyScalar(k);
      c.userData.isOutline = true;
      o.parent.add(c);
    });
    return group;
  }
  function hxWrap(kind, scale) {
    const root = new ae();
    root.userData.kind = kind;
    const g = new ae();
    g.scale.setScalar(scale);
    root.add(g);
    return [root, g];
  }

  /* ---------- หนุมาน ---------- */
  function Hs() {
    const [root, g] = hxWrap("hero", 0.88);
    const mkLeg = (sx) => {
      const l = new ae();
      l.position.set(sx * 0.2, 0.82, 0);
      g.add(l);
      hxC(0.15, 0.125, 0.5, hxP.fur, l, [0, -0.25, 0]);
      hxC(0.125, 0.105, 0.36, hxP.fur, l, [0, -0.55, 0]);
      hxT(0.115, 0.032, hxP.gold, l, [0, -0.52, 0], [Math.PI / 2, 0, 0]);
      hxS(0.16, hxP.fur, l, [0, -0.74, -0.07], [1, 0.62, 1.45]);
      for (const dx of [-0.07, 0, 0.07]) hxS(0.045, hxP.skin, l, [dx, -0.75, -0.22], [1, 0.8, 1], true);
      return l;
    };
    const legL = mkLeg(-1), legR = mkLeg(1);
    // ผ้านุ่งสีแดง ชายทอง และผ้าห้อยหน้า
    hxC(0.36, 0.52, 0.44, hxP.red, g, [0, 0.9, 0]);
    hxT(0.5, 0.04, hxP.gold, g, [0, 0.69, 0], [Math.PI / 2, 0, 0]);
    hxB(0.3, 0.46, 0.05, hxP.blue, g, [0, 0.8, -0.47], [0.12, 0, 0]);
    hxB(0.34, 0.05, 0.07, hxP.gold, g, [0, 0.58, -0.5], [0.12, 0, 0], true);
    hxB(0.05, 0.46, 0.07, hxP.gold, g, [-0.17, 0.8, -0.48], [0.12, 0, 0], true);
    hxB(0.05, 0.46, 0.07, hxP.gold, g, [0.17, 0.8, -0.48], [0.12, 0, 0], true);
    hxC(0.4, 0.4, 0.13, hxP.gold, g, [0, 1.13, 0]);
    hxS(0.085, hxP.ruby, g, [0, 1.13, -0.41], [1, 1, 0.6], true);
    // ลำตัว เสื้อขนสีขาว อกสีครีม สร้อยทอง
    const body = hxS(0.43, hxP.fur, g, [0, 1.42, 0], [1, 1.12, 0.88]);
    hxS(0.3, hxP.cream, g, [0, 1.38, -0.26], [1, 1.1, 0.5], true);
    hxT(0.31, 0.04, hxP.gold, g, [0, 1.66, -0.04], [Math.PI / 2.35, 0, 0]);
    hxS(0.075, hxP.ruby, g, [0, 1.52, -0.34], [1, 1, 0.7], true);
    hxS(0.045, hxP.jade, g, [-0.18, 1.58, -0.3], null, true);
    hxS(0.045, hxP.sapph, g, [0.18, 1.58, -0.3], null, true);
    // แขน
    const mkArm = (sx) => {
      const a = new ae();
      a.position.set(sx * 0.5, 1.6, 0);
      g.add(a);
      hxS(0.15, hxP.gold, a, [sx * 0.0, 0.0, 0], [1, 0.9, 1]);
      hxC(0.125, 0.105, 0.5, hxP.fur, a, [sx * 0.05, -0.27, 0], [0, 0, sx * 0.14]);
      hxT(0.12, 0.032, hxP.gold, a, [sx * 0.07, -0.14, 0], [Math.PI / 2, 0, sx * 0.14]);
      hxC(0.105, 0.09, 0.4, hxP.fur, a, [sx * 0.12, -0.64, 0], [0, 0, sx * 0.08]);
      hxC(0.115, 0.115, 0.14, hxP.gold, a, [sx * 0.13, -0.66, 0], [0, 0, sx * 0.08]);
      hxS(0.125, hxP.skin, a, [sx * 0.15, -0.9, 0]);
      for (const dz of [-0.06, 0, 0.06]) hxS(0.04, hxP.skin, a, [sx * 0.17, -1.0, dz * 1.2], null, true);
      return a;
    };
    const armL = mkArm(-1), armR = mkArm(1);
    // หัว
    const head = new ae();
    head.position.set(0, 1.58, 0);
    g.add(head);
    hxS(0.47, hxP.fur, head, [0, 0.36, 0.0], [1, 0.95, 0.95]);
    hxS(0.26, hxP.skin, head, [-0.15, 0.32, -0.32], [1, 1.05, 0.55]);
    hxS(0.26, hxP.skin, head, [0.15, 0.32, -0.32], [1, 1.05, 0.55]);
    hxS(0.2, hxP.skin, head, [0, 0.44, -0.36], [1.2, 0.8, 0.5]);
    hxS(0.18, hxP.cream, head, [0, 0.17, -0.45], [1.15, 0.72, 0.64]);
    hxS(0.045, hxNM(0x3a1a2a, 0, 0.4), head, [0, 0.25, -0.6], [1.3, 0.9, 0.8], true);
    hxT(0.1, 0.016, hxP.ink, head, [0, 0.13, -0.57], [0, 0, Math.PI], Math.PI);
    for (const sx of [-1, 1]) {
      hxS(0.075, hxP.blush, head, [sx * 0.28, 0.16, -0.38], [1, 0.7, 0.4], true);
      hxS(0.105, hxP.eye, head, [sx * 0.175, 0.41, -0.4], [1, 1.18, 0.55], true);
      hxS(0.062, hxP.ink, head, [sx * 0.175, 0.41, -0.46], [1, 1.1, 0.6], true);
      hxS(0.024, hxP.eye, head, [sx * 0.155, 0.44, -0.5], null, true);
      hxT(0.115, 0.014, hxP.ruby, head, [sx * 0.175, 0.43, -0.42], [0, 0, 0], Math.PI);
      hxB(0.2, 0.034, 0.03, hxP.ink, head, [sx * 0.18, 0.58, -0.42], [0, 0, sx * 0.2], true);
      hxS(0.2, hxP.fur, head, [sx * 0.47, 0.52, 0], [0.5, 1, 0.9]);
      hxS(0.13, hxP.blush, head, [sx * 0.51, 0.52, -0.03], [0.4, 1, 0.85], true);
      hxT(0.05, 0.014, hxP.gold, head, [sx * 0.52, 0.3, 0], [0, Math.PI / 2, 0]);
      hxS(0.13, hxP.fur, head, [sx * 0.37, 0.12, -0.16], [1, 1, 0.8]);
    }
    // มงกุฎยอดชัย
    hxC(0.43, 0.45, 0.13, hxP.gold, head, [0, 0.67, 0]);
    hxS(0.05, hxP.ruby, head, [0, 0.67, -0.45], [1, 1, 0.6], true);
    hxS(0.04, hxP.jade, head, [-0.27, 0.67, -0.35], null, true);
    hxS(0.04, hxP.sapph, head, [0.27, 0.67, -0.35], null, true);
    hxK(0.41, 0.28, hxP.gold, head, [0, 0.85, 0]);
    hxK(0.29, 0.28, hxP.goldLo, head, [0, 1.02, 0]);
    hxK(0.17, 0.34, hxP.gold, head, [0, 1.2, 0]);
    hxS(0.065, hxP.ruby, head, [0, 1.4, 0], null, true);
    for (const sx of [-1, 1]) hxK(0.1, 0.3, hxP.gold, head, [sx * 0.37, 0.8, 0], [0, 0, -sx * 0.55]);
    // หาง
    const tail = new ae();
    tail.position.set(0, 0.95, 0.3);
    g.add(tail);
    [[0, 0, 0.05, 0.11], [0.05, 0.1, 0.18, 0.105], [0.12, 0.23, 0.28, 0.1], [0.18, 0.4, 0.3, 0.095], [0.2, 0.57, 0.25, 0.09], [0.17, 0.72, 0.16, 0.085], [0.1, 0.82, 0.07, 0.08]].forEach((s) => hxS(s[3], hxP.fur, tail, [s[0], s[1], s[2]]));
    hxS(0.1, hxP.gold, tail, [0.03, 0.88, 0], null, true);
    // คทา
    const staff = hxC(0.042, 0.042, 1.75, hxP.gold, g, [0.68, 1.15, -0.16], [0, 0, 0.1]);
    for (const y of [0.45, 1.15, 1.85]) hxT(0.07, 0.022, hxP.goldLo, g, [0.68 + (y - 1.15) * -0.1 * 0 + 0.0, y, -0.16], [Math.PI / 2, 0, 0]);
    hxS(0.11, hxP.gold, g, [0.57, 2.05, -0.16]);
    hxS(0.06, hxP.ruby, g, [0.57, 2.17, -0.16], null, true);
    hxK(0.06, 0.2, hxP.goldLo, g, [0.74, 0.18, -0.16], [Math.PI, 0, 0.1]);
    hxInk(g);
    root.userData.parts = { leftArm: armL, rightArm: armR, leftLeg: legL, rightLeg: legR, body, head, tail, staff };
    root.scale.setScalar(0.9);
    return root;
  }

  /* ---------- ยักษ์ ---------- */
  function bh(idx = 0) {
    const [root, g] = hxWrap("yak", 0.88);
    const k = idx % 4, sk = [0x34b96c, 0x8d62f3, 0xe8484f, 0x418eff][k], skLo = [0x23925a, 0x6a45c9, 0xbf2f3b, 0x2c6fd6][k];
    const SK = hxNM(sk, 0.05, 0.62), SKL = hxNM(skLo, 0.05, 0.7);
    const cloth = [hxP.red, hxP.blue, hxP.purple, hxP.redLo][k], gem = [hxP.ruby, hxP.sapph, hxP.jade, hxP.amber][k];
    const mkLeg = (sx) => {
      const l = new ae();
      l.position.set(sx * 0.24, 0.62, 0);
      g.add(l);
      hxC(0.19, 0.16, 0.5, SK, l, [0, -0.2, 0]);
      hxS(0.2, hxP.ink, l, [0, -0.5, -0.05], [1, 0.62, 1.3]);
      hxS(0.09, hxP.gold, l, [0, -0.46, -0.24], [1, 0.8, 0.8], true);
      return l;
    };
    const legL = mkLeg(-1), legR = mkLeg(1);
    hxC(0.45, 0.6, 0.42, cloth, g, [0, 0.86, 0]);
    hxT(0.58, 0.045, hxP.gold, g, [0, 0.66, 0], [Math.PI / 2, 0, 0]);
    hxS(0.58, SK, g, [0, 1.2, 0], [1.1, 1.02, 0.98]);
    hxS(0.46, hxP.gold, g, [0, 1.34, -0.4], [1.0, 0.8, 0.5]);
    hxS(0.08, gem, g, [0, 1.36, -0.66], [1, 1, 0.6], true);
    hxC(0.52, 0.52, 0.13, hxP.goldLo, g, [0, 1.0, 0]);
    const mkArm = (sx) => {
      const a = new ae();
      a.position.set(sx * 0.7, 1.55, 0);
      g.add(a);
      hxS(0.22, hxP.gold, a, [0, 0, 0]);
      hxK(0.07, 0.2, hxP.goldLo, a, [sx * 0.02, 0.2, 0], [0, 0, -sx * 0.3], true);
      hxC(0.17, 0.15, 0.5, SK, a, [sx * 0.06, -0.28, 0], [0, 0, sx * 0.16]);
      hxT(0.16, 0.04, hxP.gold, a, [sx * 0.08, -0.16, 0], [Math.PI / 2, 0, sx * 0.16]);
      hxC(0.15, 0.13, 0.4, SK, a, [sx * 0.14, -0.68, 0], [0, 0, sx * 0.1]);
      hxS(0.17, SKL, a, [sx * 0.17, -0.95, -0.02]);
      return a;
    };
    const armL = mkArm(-1), armR = mkArm(1);
    // หัว
    const head = new ae();
    head.position.set(0, 1.74, 0);
    g.add(head);
    hxS(0.52, SK, head, [0, 0.38, 0], [1.04, 0.96, 0.94]);
    hxB(0.74, 0.09, 0.2, SKL, head, [0, 0.58, -0.4], [0.18, 0, 0], true);
    for (const sx of [-1, 1]) {
      hxS(0.115, hxP.eye, head, [sx * 0.2, 0.43, -0.44], [1, 1.1, 0.55], true);
      hxS(0.06, hxP.ruby, head, [sx * 0.2, 0.42, -0.5], [0.8, 1.2, 0.6], true);
      hxS(0.025, hxP.ink, head, [sx * 0.2, 0.42, -0.53], [0.7, 1.4, 0.5], true);
      hxB(0.26, 0.055, 0.05, hxP.ink, head, [sx * 0.2, 0.57, -0.46], [0, 0, sx * 0.4], true);
      hxK(0.06, 0.28, hxP.eye, head, [sx * 0.17, 0.11, -0.5], [0.1, 0, -sx * 0.18], true);
      hxK(0.2, 0.52, SK, head, [sx * 0.52, 0.5, 0], [0, 0, -sx * 1.15]);
      hxT(0.055, 0.016, hxP.gold, head, [sx * 0.6, 0.3, 0], [0, Math.PI / 2, 0]);
    }
    hxS(0.14, SKL, head, [0, 0.24, -0.55], [1, 0.8, 0.8]);
    hxS(0.24, hxP.mouth, head, [0, 0.06, -0.48], [1.4, 0.34, 0.4], true);
    // มงกุฎยักษ์ (ยอดแหลมสูง) และเขา
    hxC(0.47, 0.5, 0.14, hxP.gold, head, [0, 0.76, 0]);
    hxS(0.05, gem, head, [0, 0.76, -0.5], [1, 1, 0.6], true);
    hxK(0.46, 0.32, hxP.gold, head, [0, 0.97, 0]);
    hxK(0.32, 0.3, cloth, head, [0, 1.15, 0]);
    hxK(0.18, 0.46, hxP.gold, head, [0, 1.37, 0]);
    hxS(0.06, gem, head, [0, 1.62, 0], null, true);
    if (k === 2 || k === 3) for (const sx of [-1, 1]) hxK(0.07, 0.3, hxP.cream, head, [sx * 0.26, 0.88, -0.28], [0.3, 0, -sx * 0.5], true);
    // กระบอง
    const club = hxC(0.15, 0.06, 1.2, hxP.wood, g, [0.9, 1.0, -0.06], [0, 0, 0.22]);
    for (const [y, dx] of [[1.3, 0.02], [1.1, 0.1], [0.9, 0.18]]) hxS(0.05, hxP.gold, g, [0.9 + dx - 0.12, y, -0.12], null, true);
    hxS(0.18, hxP.gold, g, [0.96, 1.62, -0.06], null, true);
    hxInk(g);
    root.userData.parts = { la: armL, ra: armR, ll: legL, rl: legR, head, club };
    root.scale.setScalar(0.88);
    return root;
  }

  /* ---------- ประตูวิเศษ ---------- */
  function qa() {
    const i = new ae();
    const goldRing = hxNM(0xffcb3d, 0.7, 0.25, 0x6a4a00, 0.4), jadeRing = hxNM(0x3fe8c8, 0.4, 0.25, 0x0a8a74, 0.8);
    const r1 = hxT(0.58, 0.085, goldRing, i, [0, 0.82, 0], [0, 0, 0], Math.PI * 2, true);
    const r2 = hxT(0.4, 0.045, jadeRing, i, [0, 0.82, 0.02], [0, 0, 0], Math.PI * 2, true);
    for (let n = 0; n < 8; n++) {
      const a = (n / 8) * Math.PI * 2;
      hxS(0.055, [hxP.ruby, hxP.jade, hxP.sapph, hxP.amber][n % 4], r1, [Math.cos(a) * 0.58, Math.sin(a) * 0.58, 0], null, true);
    }
    const core = new ke(new Jn(0.47, 40), new $n({ color: 0xb4f2ff, transparent: true, opacity: 0.26, side: Ze }));
    core.position.set(0, 0.82, 0.04);
    i.add(core);
    for (const sx of [-1, 1]) {
      hxC(0.07, 0.09, 1.1, hxP.gold, i, [sx * 0.78, 0.56, 0]);
      hxK(0.11, 0.24, hxP.red, i, [sx * 0.78, 1.22, 0], null, false);
      hxS(0.06, hxP.ruby, i, [sx * 0.78, 1.4, 0], null, true);
      hxC(0.14, 0.17, 0.12, hxP.goldLo, i, [sx * 0.78, 0.06, 0]);
    }
    const threshold = hxB(1.2, 0.07, 0.34, hxP.stone, i, [0, 0.06, 0.34]);
    hxB(1.0, 0.06, 0.3, hxP.stoneLo, i, [0, 0.12, 0.38], null, true);
    const entry = hxK(0.12, 0.28, hxP.jade, i, [0, 0.2, 0.52], [-Math.PI / 2, 0, 0], true);
    const light = new Wi(0x8ef5ff, 2.2, 5);
    light.position.set(0, 0.85, 0.35);
    i.add(light);
    hxInk(i, 1.05);
    i.userData = { r1, r2, core, threshold, entry, light };
    return i;
  }

  /* ---------- ต้นไม้ พุ่มไม้ ดอกไม้ ---------- */
  function tTree(i, pinkTree) {
    const t = new ae();
    hxC(0.1, 0.17, 0.8, hxP.wood, t, [0, 0.4, 0]);
    const m1 = pinkTree ? hxP.pink : hxP.leaf, m2 = pinkTree ? hxP.pinkLo : hxP.leafLo, m3 = pinkTree ? hxP.cream : hxP.leafHi;
    hxS(0.42, m1, t, [0, 1.12, 0], [1.15, 0.92, 1.1]);
    hxS(0.3, m2, t, [0.28, 1.0, 0.1]);
    hxS(0.28, m2, t, [-0.26, 1.02, -0.1]);
    hxS(0.26, m3, t, [0.08, 1.45, -0.05]);
    hxS(0.18, m3, t, [-0.18, 1.32, 0.2], null, true);
    if (pinkTree) for (let n = 0; n < 6; n++) hxS(0.04, hxP.cream, t, [Math.cos(n * 1.9 + i) * 0.46, 0.7 + (n % 3) * 0.22, Math.sin(n * 1.9 + i) * 0.46], null, true);
    t.scale.setScalar(0.76 + (i % 3) * 0.06);
    return hxInk(t, 1.06);
  }
  function tPalm(i) {
    const t = new ae();
    [[0, 0.2], [0.05, 0.6], [0.14, 1.0], [0.28, 1.38]].forEach((s) => hxC(0.075, 0.1, 0.42, hxP.wood, t, [s[0], s[1], 0], [0, 0, -0.18]));
    for (let n = 0; n < 7; n++) {
      const pv = new ae();
      pv.position.set(0.34, 1.62, 0);
      pv.rotation.y = (n / 7) * Math.PI * 2 + i;
      t.add(pv);
      hxK(0.13, 0.9, n % 2 ? hxP.leaf : hxP.leafHi, pv, [0.38, -0.02, 0], [0, 0, -1.75], false, 12, [1, 1, 0.22]);
    }
    hxS(0.1, hxP.amber, t, [0.3, 1.5, 0.1], null, true);
    hxS(0.1, hxP.amber, t, [0.4, 1.48, -0.1], null, true);
    t.scale.setScalar(0.72);
    return hxInk(t, 1.05);
  }
  function tBush(flower) {
    const t = new ae();
    hxS(0.32, hxP.leaf, t, [0, 0.3, 0], [1.2, 0.85, 1]);
    hxS(0.24, hxP.leafHi, t, [0.26, 0.28, 0.1]);
    hxS(0.22, hxP.leafLo, t, [-0.24, 0.26, -0.08]);
    if (flower) for (let n = 0; n < 7; n++) hxS(0.05, [hxP.pink, hxP.cream, hxP.amber][n % 3], t, [Math.cos(n * 2.1) * 0.34, 0.34 + (n % 3) * 0.08, Math.sin(n * 2.1) * 0.3 + 0.15], null, true);
    t.scale.setScalar(0.9);
    return hxInk(t, 1.06);
  }
  function tFlower(i) {
    const t = new ae();
    const c = [0xff6fa8, 0xffd166, 0xb78bff][i % 3];
    hxC(0.02, 0.025, 0.5, hxP.leaf, t, [0, 0.25, 0], null, true);
    hxS(0.1, hxP.leaf, t, [0.1, 0.18, 0], [1.2, 0.3, 0.6], true, [0, 0, 0.5]);
    for (let n = 0; n < 6; n++) {
      const a = (n * Math.PI * 2) / 6;
      hxS(0.085, hxNM(c, 0, 0.7), t, [Math.cos(a) * 0.12, 0.55, Math.sin(a) * 0.12], [1, 0.5, 1], true);
    }
    hxS(0.07, hxP.gold, t, [0, 0.58, 0], null, true);
    return t;
  }
  function tRock(i) {
    const t = new ae();
    hxS(0.34, hxP.stone, t, [0, 0.2, 0], [1.3, 0.72, 1.1], false, [0, i, 0]);
    hxS(0.22, hxP.stoneLo, t, [0.3, 0.14, 0.14], [1.1, 0.7, 1]);
    hxS(0.16, hxP.stone, t, [-0.3, 0.12, -0.12], [1, 0.7, 1]);
    hxS(0.12, hxP.leafHi, t, [0.02, 0.34, 0.04], [1.4, 0.4, 1.1], true);
    return hxInk(t, 1.06);
  }
  function tPot() {
    const t = new ae();
    hxS(0.26, hxP.blue, t, [0, 0.28, 0], [1, 1.1, 1]);
    hxC(0.14, 0.16, 0.1, hxP.blue, t, [0, 0.58, 0]);
    hxT(0.15, 0.03, hxP.gold, t, [0, 0.62, 0], [Math.PI / 2, 0, 0]);
    hxT(0.26, 0.02, hxP.gold, t, [0, 0.3, 0], [Math.PI / 2, 0, 0]);
    return hxInk(t, 1.06);
  }
  function tDrum() {
    const t = new ae();
    hxC(0.28, 0.28, 0.42, hxP.red, t, [0, 0.3, 0], [0, 0, 0]);
    hxT(0.28, 0.035, hxP.gold, t, [0, 0.5, 0], [Math.PI / 2, 0, 0]);
    hxT(0.28, 0.035, hxP.gold, t, [0, 0.1, 0], [Math.PI / 2, 0, 0]);
    hxC(0.27, 0.27, 0.03, hxP.cream, t, [0, 0.52, 0]);
    return hxInk(t, 1.06);
  }
  function tSala() {
    const t = new ae();
    hxB(1.0, 0.1, 0.8, hxP.stone, t, [0, 0.05, 0]);
    for (const [x, z] of [[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]]) hxC(0.05, 0.06, 0.7, hxP.red, t, [x, 0.45, z]);
    hxB(1.0, 0.09, 0.8, hxP.redLo, t, [0, 0.82, 0]);
    const roof = hxK(0.82, 0.42, hxP.gold, t, [0, 1.07, 0], [0, Math.PI / 4, 0], false, 4);
    roof.scale.set(1.15, 1, 0.92);
    hxK(0.5, 0.3, hxP.goldLo, t, [0, 1.4, 0], [0, Math.PI / 4, 0], false, 4);
    hxK(0.04, 0.34, hxP.gold, t, [0, 1.72, 0], null, true);
    t.scale.setScalar(0.62);
    return hxInk(t, 1.04);
  }
  function tGate() {
    const t = new ae();
    for (const sx of [-1, 1]) {
      hxC(0.09, 0.11, 0.95, hxP.red, t, [sx * 0.42, 0.48, 0]);
      hxC(0.13, 0.15, 0.1, hxP.gold, t, [sx * 0.42, 0.05, 0]);
    }
    hxB(1.15, 0.12, 0.2, hxP.gold, t, [0, 1.0, 0]);
    hxB(0.9, 0.14, 0.16, hxP.redLo, t, [0, 1.14, 0], null, true);
    const roof = hxK(0.8, 0.36, hxP.goldLo, t, [0, 1.38, 0], [0, Math.PI / 4, 0], false, 4);
    roof.scale.set(1.1, 1, 0.5);
    hxK(0.04, 0.3, hxP.gold, t, [0, 1.7, 0], null, true);
    t.scale.setScalar(0.7);
    return hxInk(t, 1.04);
  }
  function tChedi() {
    const t = new ae();
    hxC(0.34, 0.4, 0.14, hxP.stone, t, [0, 0.07, 0]);
    hxC(0.26, 0.32, 0.14, hxP.cream, t, [0, 0.21, 0]);
    hxS(0.24, hxP.cream, t, [0, 0.46, 0], [1, 1.2, 1]);
    hxC(0.1, 0.18, 0.2, hxP.gold, t, [0, 0.8, 0]);
    hxK(0.1, 0.5, hxP.gold, t, [0, 1.15, 0]);
    hxS(0.045, hxP.ruby, t, [0, 1.42, 0], null, true);
    t.scale.setScalar(0.8);
    return hxInk(t, 1.05);
  }
  function tSign() {
    const t = new ae();
    hxC(0.04, 0.05, 0.9, hxP.wood, t, [0, 0.45, 0]);
    hxB(0.6, 0.28, 0.06, hxP.wood, t, [0, 0.78, -0.02]);
    hxB(0.5, 0.2, 0.02, hxP.cream, t, [0, 0.78, -0.06], null, true);
    hxS(0.045, hxP.ruby, t, [0.16, 0.78, -0.08], null, true);
    hxK(0.06, 0.12, hxP.gold, t, [0, 0.95, 0], null, true);
    return hxInk(t, 1.05);
  }
  function tLamp() {
    const t = new ae();
    hxC(0.03, 0.045, 0.7, hxP.gold, t, [0, 0.35, 0]);
    hxC(0.12, 0.08, 0.04, hxP.goldLo, t, [0, 0.7, 0]);
    const lamp = hxS(0.12, hxNM(0xffd36a, 0.1, 0.4, 0xff9a1a, 1.1), t, [0, 0.82, 0], [0.8, 1.2, 0.8], true);
    hxK(0.12, 0.14, hxP.gold, t, [0, 0.98, 0], null, true);
    const l = new Wi(0xffbe5a, 0.7, 2.6);
    l.position.set(0, 0.85, 0);
    t.add(l);
    return hxInk(t, 1.05);
  }
  function tLantern() {
    const t = new ae();
    hxC(0.025, 0.03, 0.8, hxP.woodLo, t, [0, 0.4, 0]);
    hxB(0.28, 0.025, 0.02, hxP.woodLo, t, [0.1, 0.78, 0], null, true);
    const lan = hxS(0.13, hxNM(0xff5a3a, 0.1, 0.5, 0xff2a10, 0.9), t, [0.2, 0.62, 0], [0.85, 1.2, 0.85], true);
    hxC(0.06, 0.06, 0.03, hxP.gold, t, [0.2, 0.82, 0], null, true);
    hxC(0.05, 0.05, 0.03, hxP.gold, t, [0.2, 0.42, 0], null, true);
    return hxInk(t, 1.05);
  }
  function tSingha() {
    const t = new ae();
    hxB(0.7, 0.14, 0.5, hxP.stone, t, [0, 0.07, 0]);
    hxS(0.24, hxP.goldLo, t, [0, 0.42, 0.04], [1, 0.95, 1.4]);
    hxS(0.2, hxP.gold, t, [0, 0.72, -0.2]);
    hxT(0.22, 0.07, hxP.goldLo, t, [0, 0.72, -0.22], [0.3, 0, 0], Math.PI * 2, false);
    hxS(0.05, hxP.ink, t, [-0.07, 0.76, -0.38], null, true);
    hxS(0.05, hxP.ink, t, [0.07, 0.76, -0.38], null, true);
    hxK(0.05, 0.16, hxP.gold, t, [-0.13, 0.9, -0.2], [0, 0, 0.3], true);
    hxK(0.05, 0.16, hxP.gold, t, [0.13, 0.9, -0.2], [0, 0, -0.3], true);
    hxS(0.1, hxP.goldLo, t, [0, 0.3, 0.3], [0.6, 0.6, 1.2]);
    t.scale.setScalar(0.72);
    return hxInk(t, 1.05);
  }
  function tNaga() {
    const t = new ae();
    hxB(0.8, 0.1, 0.5, hxP.stone, t, [0, 0.05, 0]);
    hxT(0.3, 0.09, hxP.jade, t, [0, 0.2, 0], [Math.PI / 2, 0, 0], Math.PI * 2, false);
    hxT(0.22, 0.08, hxP.jade, t, [0, 0.36, 0], [Math.PI / 2, 0, 0], Math.PI * 2, false);
    hxS(0.13, hxP.jade, t, [0, 0.72, 0], [1, 0.9, 1.1]);
    hxC(0.08, 0.1, 0.34, hxP.jade, t, [0, 0.54, 0.02]);
    for (const a of [-0.45, 0, 0.45]) hxK(0.07, 0.24, hxP.gold, t, [Math.sin(a) * 0.2, 0.78 + (a === 0 ? 0.12 : 0.04), 0.0], [0, 0, -a], true);
    hxS(0.03, hxP.ruby, t, [-0.05, 0.75, -0.12], null, true);
    hxS(0.03, hxP.ruby, t, [0.05, 0.75, -0.12], null, true);
    t.scale.setScalar(0.76);
    return hxInk(t, 1.05);
  }
  function tElephant() {
    const t = new ae();
    hxS(0.3, hxP.stone, t, [0, 0.42, 0], [1, 0.9, 1.4]);
    for (const [x, z] of [[-0.18, -0.28], [0.18, -0.28], [-0.18, 0.26], [0.18, 0.26]]) hxC(0.09, 0.1, 0.3, hxP.stoneLo, t, [x, 0.15, z]);
    hxS(0.2, hxP.stone, t, [0, 0.62, -0.4]);
    for (const sx of [-1, 1]) {
      hxS(0.17, hxP.stoneLo, t, [sx * 0.22, 0.64, -0.36], [0.3, 1, 0.9], false);
      hxK(0.035, 0.2, hxP.cream, t, [sx * 0.1, 0.48, -0.58], [-1.0, 0, -sx * 0.3], true);
      hxS(0.03, hxP.ink, t, [sx * 0.09, 0.68, -0.56], null, true);
    }
    hxC(0.06, 0.09, 0.3, hxP.stone, t, [0, 0.46, -0.58], [0.4, 0, 0]);
    hxB(0.5, 0.06, 0.4, hxP.red, t, [0, 0.68, 0.0], null, true);
    hxS(0.05, hxP.gold, t, [0, 0.74, 0], null, true);
    t.scale.setScalar(0.76);
    return hxInk(t, 1.05);
  }
  function tGaruda() {
    const t = new ae();
    hxB(0.5, 0.12, 0.4, hxP.stone, t, [0, 0.06, 0]);
    hxS(0.2, hxP.gold, t, [0, 0.52, 0], [1, 1.4, 0.8]);
    hxS(0.13, hxP.red, t, [0, 0.9, -0.02]);
    hxK(0.05, 0.18, hxP.amber, t, [0, 0.88, -0.17], [-Math.PI / 2 - 0.3, 0, 0], true);
    hxK(0.12, 0.2, hxP.gold, t, [0, 1.08, 0], null, true);
    for (const sx of [-1, 1]) {
      hxK(0.14, 0.7, hxP.goldLo, t, [sx * 0.32, 0.62, 0.0], [0, 0, -sx * 1.1], false, 12, [1, 1, 0.25]);
      hxS(0.025, hxP.ink, t, [sx * 0.05, 0.93, -0.12], null, true);
    }
    t.scale.setScalar(0.78);
    return hxInk(t, 1.05);
  }
  function tNang() {
    const t = new ae();
    hxK(0.3, 0.7, hxP.pink, t, [0, 0.38, 0], null, false, 24);
    hxT(0.12, 0.02, hxP.gold, t, [0, 0.72, 0], [Math.PI / 2, 0, 0]);
    hxS(0.2, hxP.skin, t, [0, 0.95, 0]);
    hxS(0.205, hxP.ink, t, [0, 1.0, 0.04], [1, 0.9, 0.95]);
    hxK(0.1, 0.22, hxP.gold, t, [0, 1.25, 0], null, true);
    hxS(0.03, hxP.ink, t, [-0.07, 0.95, -0.17], null, true);
    hxS(0.03, hxP.ink, t, [0.07, 0.95, -0.17], null, true);
    t.scale.setScalar(0.8);
    return hxInk(t, 1.05);
  }
  function tRishi() {
    const t = new ae();
    hxK(0.3, 0.72, hxNM(0xff9a2e, 0, 0.8), t, [0, 0.38, 0]);
    hxS(0.19, hxP.skin, t, [0, 0.9, 0]);
    hxK(0.14, 0.26, hxP.cream, t, [0, 0.74, -0.08], [Math.PI, 0, 0], true);
    hxS(0.2, hxP.cream, t, [0, 0.98, 0.04], [1, 0.9, 0.9]);
    hxC(0.025, 0.03, 1.1, hxP.wood, t, [0.3, 0.55, 0]);
    hxS(0.06, hxP.gold, t, [0.3, 1.12, 0], null, true);
    t.scale.setScalar(0.8);
    return hxInk(t, 1.05);
  }
  function tCrystal(i) {
    const t = new ae();
    hxK(0.1, 0.4, hxNM([0x8be8ff, 0xff9ee0, 0xb3a0ff][i % 3], 0.2, 0.15, 0x206a8a, 0.5), t, [0, 0.2, 0]);
    return t;
  }
  function cg(asset, i) {
    switch (asset) {
      case "tree": return tTree(i, false);
      case "sakura": return tTree(i, true);
      case "palm": return tPalm(i);
      case "bush": return tBush(false);
      case "bushf": return tBush(true);
      case "rock": return tRock(i);
      case "pot": return tPot();
      case "drum": return tDrum();
      case "sala": return tSala();
      case "gate": return tGate();
      case "chedi": return tChedi();
      case "sign": return tSign();
      case "lamp": return tLamp();
      case "lantern": return tLantern();
      case "singha": return tSingha();
      case "naga": return tNaga();
      case "elephant": return tElephant();
      case "garuda": return tGaruda();
      case "nang": return tNang();
      case "rishi": return tRishi();
      default: return tFlower(i);
    }
  }
  // ชื่อเดิมที่ฉากอื่นยังเรียกใช้
  function Eh(i = 0) { return i % 2 ? tTree(i, false) : tPalm(i); }
  function og() { return tRock(1); }
  function Il() { return tSala(); }
  function lg() { return tLamp(); }
  function Th(i = 0) { return tFlower(i); }
  function __makeHanumanCoin() {
    const i = new ae();
    const face = hxC(0.3, 0.3, 0.07, hxNM(0xffc531, 0.75, 0.22, 0xff8a00, 0.35), i, [0, 0.55, 0], [Math.PI / 2, 0, 0], true, 36);
    hxT(0.3, 0.035, hxP.gold, i, [0, 0.55, 0], [0, 0, 0], Math.PI * 2, true);
    const star = hxK(0.15, 0.1, hxNM(0xffffff, 0.2, 0.2, 0xffc531, 0.8), i, [0, 0.55, -0.045], [-Math.PI / 2, 0, 0], true, 5);
    face.castShadow = true;
    i.userData.face = face;
    return i;
  }

  // มือถือ/แท็บเล็ต: ประหยัดหน่วยความจำ GPU (เว็บมี 10 ผืนผ้าใบ 3D) ไม่งั้น Chrome บน Android ทิ้งผืนผ้าใบเป็นกรอบขาว (รูปแตก) · ตรวจจากหน้าจอสัมผัส+ความกว้าง
  const HX_MOBILE = (matchMedia && matchMedia("(pointer:coarse)").matches) || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  function hxNote(canvas, msg) {
    const p = canvas.parentElement; if (!p || p.querySelector(".hx-note")) return;
    const d = document.createElement("div"); d.className = "hx-note"; d.textContent = msg;
    d.style.cssText = "position:absolute;left:12px;right:12px;top:40%;padding:10px 14px;border-radius:12px;background:#2a1470e6;border:2px solid #ffd25e;color:#fff6e6;font:700 14px Kanit,Tahoma,sans-serif;text-align:center;z-index:5";
    p.appendChild(d);
  }
  function hg(i) {
    let t;
    try { t = new Ha({ canvas: i, antialias: !HX_MOBILE, alpha: !1, powerPreference: HX_MOBILE ? "default" : "high-performance" }); }
    catch (err) { hxNote(i, "อุปกรณ์นี้เปิดกราฟิก 3D ไม่ได้: " + (err && err.message || err)); throw err; }
    i.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); hxNote(i, "กราฟิก 3D หยุดทำงานชั่วคราว (หน่วยความจำไม่พอ) ลองโหลดหน้าใหม่"); });
    i.addEventListener("webglcontextrestored", () => { const n = i.parentElement && i.parentElement.querySelector(".hx-note"); n && n.remove(); });
    return (
      t.setPixelRatio(1),
      (t.shadowMap.enabled = !0),
      (t.shadowMap.type = Jr),
      (t.outputColorSpace = Ue),
      (t.toneMapping = As),
      (t.toneMappingExposure = 1.15),
      t
    );
  }
  /* ======================= ฉาก แสง ท้องฟ้า กระดาน (อัปเกรด 27 ต.ค. 2569) ======================= */
  // ชุดสีท้องฟ้า [ยอดฟ้า, กลางฟ้า, ขอบฟ้า, ใต้ฟ้า] ตามธีมของฉาก (forest ฟ้าสดใส · debug พระอาทิตย์ตก · challenge ม่วงทอง)
  function hxPalette(e) {
    if (e === 2165020) return [0x5a3d9a, 0xf08a8a, 0xffd08a, 0xffb36b];
    if (e === 526105) return [0x2d2a7a, 0x8a5ad8, 0xffa7c4, 0xffc58a];
    return [0x3f83e8, 0x8fcdf7, 0xfff0d2, 0xdff4ff];
  }
  function hxSky(scene, e) {
    const pal = hxPalette(e).map((c) => new zt(c));
    const geo = new vs(60, 32, 18), pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    for (let n = 0; n < pos.count; n++) {
      const y = pos.getY(n) / 60;
      let c;
      if (y > 0.28) c = pal[0].clone().lerp(pal[1], 1 - (y - 0.28) / 0.72);
      else if (y > -0.05) c = pal[1].clone().lerp(pal[2], 1 - (y + 0.05) / 0.33);
      else c = pal[2].clone().lerp(pal[3], Math.min(1, (-0.05 - y) / 0.5));
      col[n * 3] = c.r; col[n * 3 + 1] = c.g; col[n * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new Fe(col, 3));
    const sky = new ke(geo, new $n({ vertexColors: true, side: 1, fog: false, depthWrite: false, toneMapped: false }));
    sky.renderOrder = -20;
    scene.add(sky);
    scene.background = pal[3];
    scene.fog = new cs(pal[2].getHex(), 24, 62);
    // เมฆลอย
    const clouds = new ae();
    const cm = new $n({ color: 0xffffff, transparent: true, opacity: 0.93, fog: false, toneMapped: false });
    for (let n = 0; n < 9; n++) {
      const a = (n / 9) * Math.PI * 2 + n * 0.3, r = 26 + (n % 3) * 4, c = new ae();
      for (let k = 0; k < 4; k++) {
        const s = new ke(new vs(1.3 + (k % 2) * 0.6 + (n % 2) * 0.3, 14, 10), cm);
        s.position.set(k * 1.3 - 2, (k % 2) * 0.4, 0);
        s.scale.set(1.2, 0.72, 0.9);
        c.add(s);
      }
      c.position.set(Math.cos(a) * r, 5 + (n % 4) * 1.8, Math.sin(a) * r);
      c.rotation.y = -a;
      clouds.add(c);
    }
    for (let n = 0; n < 9; n++) {
      const a = (n / 9) * Math.PI * 2 + n * 0.7, r = 9 + (n % 3) * 4, s = new ke(new vs(2.2 + (n % 3) * 0.8, 14, 10), cm);
      s.position.set(Math.cos(a) * r, -4.6 - (n % 2) * 0.6, Math.sin(a) * r);
      s.scale.set(1.5, 0.34, 1.2);
      clouds.add(s);
    }
    scene.add(clouds);
    return clouds;
  }
  function ug(i) {
    i.add(new Ss(0xdff0ff, 0xc8a878, 1.55));
    const t = new Es(0xfff1d6, 2.7);
    t.position.set(7, 12, 6);
    t.castShadow = true;
    t.shadow.mapSize.set(HX_MOBILE ? 1024 : 2048, HX_MOBILE ? 1024 : 2048);
    t.shadow.camera.left = -11;
    t.shadow.camera.right = 11;
    t.shadow.camera.top = 11;
    t.shadow.camera.bottom = -11;
    t.shadow.bias = -0.0004;
    i.add(t);
    const f = new Es(0xb9d6ff, 0.7);
    f.position.set(-7, 5, -4);
    i.add(f);
    const e = new Wi(0xffd27a, 1.4, 22);
    e.position.set(-5, 4, 5);
    i.add(e);
  }
  function dg(i, t = 60, e = 0xfff0a0, n = 12) {
    const s = new Ae(), r = new Float32Array(t * 3);
    for (let o = 0; o < t; o++) {
      r[o * 3] = (Math.random() - 0.5) * n;
      r[o * 3 + 1] = Math.random() * 4.2 + 0.4;
      r[o * 3 + 2] = (Math.random() - 0.5) * n;
    }
    s.setAttribute("position", new Fe(r, 3));
    const a = new ps(s, new ki({ color: e, size: 0.075, transparent: true, opacity: 0.85 }));
    i.add(a);
    return a;
  }
  // สุ่มคงที่จากตำแหน่งช่อง (ให้กอหญ้าอยู่ที่เดิมทุกครั้ง)
  const hxRnd = (a, b, k) => { const x = Math.sin(a * 127.1 + b * 311.7 + k * 74.7) * 43758.5453; return x - Math.floor(x); };
  // กระดานเกาะลอยฟ้า: ช่องหญ้าและช่องทางเดินทรายทอง ฐานดินและหินใต้เกาะ
  function hxBoard(self, t, pathSet, obstSet, size) {
    const B = self.board, rows = t.rows, cols = t.cols;
    const dirt = ce(0x8a5a3a, 0.02, 0.95), grass = [ce(0x62d06c, 0.02, 0.85), ce(0x76dd7e, 0.02, 0.85)], grassTop = [ce(0x4fbf5c, 0.02, 0.9), ce(0x66cf70, 0.02, 0.9)];
    const sand = ce(0xe9c47c, 0.02, 0.85), sandIn = ce(0xfff0c8, 0.02, 0.78), sandHot = ce(0xf5a06a, 0.02, 0.8), tuft = ce(0x3fae55, 0, 0.9), tuft2 = ce(0x8be88a, 0, 0.9);
    for (let a = 0; a < rows; a++) {
      for (let o = 0; o < cols; o++) {
        const isPath = pathSet.has(`${a},${o}`), isObs = obstSet.has(`${a},${o}`), h = self.cell(a, o), chk = (a + o) % 2;
        hxB(1.13, 0.16, 1.13, dirt, B, [h.x, 0.08, h.z], null, true);
        if (isPath) {
          hxB(1.13, 0.1, 1.13, sand, B, [h.x, 0.21, h.z], null, true);
          hxB(0.96, 0.035, 0.96, isObs ? sandHot : sandIn, B, [h.x, 0.272, h.z], null, true);
          for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) hxS(0.045, hxP.gold, B, [h.x + dx * 0.9, 0.28, h.z + dz * 0.9], [1, 0.5, 1], true);
        } else {
          hxB(1.13, 0.1, 1.13, grass[chk], B, [h.x, 0.21, h.z], null, true);
          hxB(1.13, 0.012, 1.13, grassTop[chk], B, [h.x, 0.268, h.z], null, true);
          const n = 2 + Math.floor(hxRnd(a, o, 1) * 3);
          for (let k = 0; k < n; k++) {
            const x = h.x + (hxRnd(a, o, k + 2) - 0.5) * 0.9, z = h.z + (hxRnd(a, o, k + 9) - 0.5) * 0.9;
            hxK(0.045, 0.17 + hxRnd(a, o, k + 20) * 0.1, k % 2 ? tuft : tuft2, B, [x, 0.36, z], [0, 0, (hxRnd(a, o, k + 31) - 0.5) * 0.5], true, 6);
          }
        }
      }
    }
    // ฐานเกาะ: ดินหนา หินแหลมห้อยลง ผลึกเรืองแสง
    const w = cols * 1.22 + 0.16, d = rows * 1.22 + 0.16;
    hxB(w, 0.3, d, ce(0x6d4630, 0.02, 1), B, [0, -0.1, 0], null, true);
    hxB(w + 0.14, 0.07, d + 0.14, hxP.gold, B, [0, 0.0, 0], null, true);
    const R = Math.max(w, d) * 0.5;
    const rock = hxK(R * 0.72, 2.6, ce(0x7d6a95, 0.05, 0.95), B, [0, -1.55, 0], [Math.PI, 0, 0], true, 9);
    rock.scale.set(w / (2 * R * 0.72) * 1.1, 1, d / (2 * R * 0.72) * 1.1);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.4;
      hxK(0.16, 0.7 + (k % 3) * 0.3, hxNM([0x8be8ff, 0xff9ee0, 0xb3a0ff][k % 3], 0.2, 0.15, 0x3a8aaa, 0.7), B, [Math.cos(a) * R * 0.8, -0.8 - (k % 2) * 0.3, Math.sin(a) * R * 0.7], [Math.PI, 0, 0.2], true, 5);
    }
    const dummy = new ae();
    dummy.receiveShadow = true;
    return dummy;
  }

  var vi = class {
      constructor(t, e = 464171) {
        ((this.canvas = t),
          (this.scene = new hs()),
          (this.clouds = hxSky(this.scene, e)),
          (this.camera = new Ce(38, 1, 0.1, 100)),
          (this.renderer = hg(t)),
          (this.root = new ae()),
          this.scene.add(this.root),
          ug(this.scene),
          (this.particles = dg(this.scene)),
          (this.drag = !1),
          (this.lastX = 0),
          (this.zoom = 1),
          t.addEventListener("pointerdown", (n) => {
            ((this.drag = !0), (this.lastX = n.clientX), t.setPointerCapture?.(n.pointerId));
          }),
          t.addEventListener("pointermove", (n) => {
            this.drag && ((this.root.rotation.y += (n.clientX - this.lastX) * 0.008), (this.lastX = n.clientX));
          }),
          t.addEventListener("pointerup", () => (this.drag = !1)),
          (this.resizeObserver = new ResizeObserver(() => this.resize())),
          this.resizeObserver.observe(t.parentElement),
          Rl.push(this));
      }
      resize() {
        let t = Math.max(1, this.canvas.clientWidth),
          e = Math.max(1, this.canvas.clientHeight);
        // ความละเอียดตามขนาดที่เห็นจริงบนจอ (เวทีถูกย่อด้วย transform บนจอเล็ก จึงไม่ต้องวาดเต็ม 1920 หน่วย) มือถือไม่เกิน 1.25 เท่า
        const bw = this.canvas.getBoundingClientRect().width, sc = bw > 0 ? bw / t : 1, pr = Math.max(0.5, Math.min(HX_MOBILE ? 1.25 : 1.65, (devicePixelRatio || 1) * sc));
        if (Math.abs(pr - this.renderer.getPixelRatio()) > 0.01) this.renderer.setPixelRatio(pr);
        (this.canvas.width !== Math.floor(t * this.renderer.getPixelRatio()) ||
          this.canvas.height !== Math.floor(e * this.renderer.getPixelRatio())) &&
          (this.renderer.setSize(t, e, !1), (this.camera.aspect = t / e), this.camera.updateProjectionMatrix());
      }
      visible() {
        let t = this.canvas.getBoundingClientRect();
        return t.width > 2 && t.height > 2 && t.bottom > 0 && t.top < innerHeight;
      }
      zoomIn() {
        this.setZoom(this.zoom * 1.18);
      }
      zoomOut() {
        this.setZoom(this.zoom / 1.18);
      }
      setZoom(z) {
        ((this.zoom = Math.max(0.55, Math.min(2.6, z))), (this.camera.zoom = this.zoom), this.camera.updateProjectionMatrix());
      }
      render(t, e) {
        if (!this.visible()) { if (this.canvas.width > 2) this.renderer.setSize(1, 1, !1); return; }   // ผืนผ้าใบที่ไม่ได้แสดงย่อเหลือ 1 พิกเซล คืนหน่วยความจำ GPU
        (this.resize(), (this.particles.rotation.y = t * 0.02), (this.clouds.rotation.y = t * 0.004), this.renderer.render(this.scene, this.camera));
      }
    },
    Ml = class extends vi {
      constructor(t, e = "forest") {
        (super(t, e === "debug" ? 2165020 : e === "challenge" ? 526105 : 466213),
          (this.theme = e),
          this.camera.position.set(8.7, 9.2, 10.5),
          this.camera.lookAt(0, 0.3, 0),
          (this.board = new ae()),
          this.root.add(this.board),
          (this.hero = null),
          (this.portal = null),
          (this.yaks = []),
          (this.coins = []),
          (this.view = "iso"));
      }
      cell(t, e) {
        return new F((e - (this.m.cols - 1) / 2) * 1.22, 0.31, (t - (this.m.rows - 1) / 2) * 1.22);
      }
      setMission(t) {
        for (this.m = t; this.board.children.length;) this.board.remove(this.board.children[0]);
        ((this.yaks = []), (this.coins = []));
        let e = new Set(t.path.map((a) => `${a.row},${a.col}`)),
          n = new Set(t.obstacles.map((a) => `${a.row},${a.col}`)),
          s = Math.max(t.rows, t.cols);
        let r = hxBoard(this, t, e, n, s);
        ((r.receiveShadow = !0),
          t.decor?.slice(0, 8).forEach((a, o) => {
            if (
              e.has(`${a.row},${a.col}`) ||
              n.has(`${a.row},${a.col}`) ||
              (a.row === t.start.row && a.col === t.start.col) ||
              (a.row === t.goal.row && a.col === t.goal.col)
            )
              return;
            let l = cg(a.asset, o),
              c = this.cell(a.row, a.col);
            (l.position.set(c.x, 0.3, c.z), (l.rotation.y = (o * 0.83) % 6.2), this.board.add(l));
          }),
          t.obstacles.forEach((a, o) => {
            let l = bh((o + Object.keys(Sn).indexOf(t.id)) % 4),
              c = this.cell(a.row, a.col);
            (l.position.set(c.x, 0.3, c.z), (l.rotation.y = o ? -0.7 : 0.55), this.board.add(l), this.yaks.push(l));
          }),
          t.coins?.forEach((a) => {
            let o = __makeHanumanCoin(),
              l = this.cell(a.row, a.col);
            (o.position.set(l.x, 0.3, l.z),
              (o.userData.row = a.row),
              (o.userData.col = a.col),
              (o.userData.collected = !1),
              this.board.add(o),
              this.coins.push(o));
          }),
          (this.portal = qa()));
        {
          let a = this.cell(t.goal.row, t.goal.col),
            o = ag(t),
            l = Al[o];
          (this.portal.position.set(a.x + l[1] * 0.31, 0.3, a.z + l[0] * 0.31),
            (this.portal.rotation.y = (-o * Math.PI) / 2),
            (this.portal.userData.arrivalDir = o),
            this.board.add(this.portal));
        }
        ((this.hero = Hs()),
          this.board.add(this.hero),
          (this.state = { row: t.start.row, col: t.start.col, dir: t.start.dir }),
          this.resetHero(!1),
          this.addStartMarker(),
          this.frameCamera());
      }
      addStartMarker() {
        let t = this.cell(this.m.start.row, this.m.start.col),
          e = Ke(
            new xs(0.42, 0.53, 32),
            new $n({ color: 3470335, side: Ze, transparent: !0, opacity: 0.8 }),
            this.board,
            [t.x, 0.3, t.z],
            [-Math.PI / 2, 0, 0],
          );
        e.userData.startRing = !0;
      }
      frameCamera() {
        let t = Math.max(this.m.rows, this.m.cols);
        (this.camera.up.set(0, 1, 0), this.camera.position.set(t * 1.35, t * 1.34, t * 1.58), this.camera.lookAt(0, 0.5, 0));
      }
      resetHero(t = !1) {
        let e = this.cell(this.m.start.row, this.m.start.col);
        ((this.state = { row: this.m.start.row, col: this.m.start.col, dir: this.m.start.dir }),
          this.hero.position.copy(e),
          (this.hero.position.y = 0.31),
          this.hero.rotation.set(0, (-this.state.dir * Math.PI) / 2, 0),
          this.hero.scale.setScalar(0.9),
          (this.hero.visible = !0),
          this.coins?.forEach((t) => {
            ((t.visible = !0), t.scale.setScalar(1), (t.position.y = 0.3), (t.userData.collected = !1));
          }));
      }
      async moveTo(t, e, n = 380) {
        __hanumanSound.step();
        let s = this.hero.position.clone(),
          r = this.cell(t, e),
          a = this.hero.userData.parts;
        ((r.y = 0.31),
          await Je(n, (o, l) => {
            (this.hero.position.lerpVectors(s, r, o),
              (this.hero.position.y = 0.31 + Math.sin(l * Math.PI) * 0.26),
              (a.leftArm.rotation.x = Math.sin(l * Math.PI * 2) * 0.65),
              (a.rightArm.rotation.x = -Math.sin(l * Math.PI * 2) * 0.65),
              (a.leftLeg.rotation.x = -Math.sin(l * Math.PI * 2) * 0.55),
              (a.rightLeg.rotation.x = Math.sin(l * Math.PI * 2) * 0.55));
          }),
          this.hero.position.copy(r),
          Object.values(a).forEach((o) => {
            o.rotation && (o.rotation.x *= 0.15);
          }));
      }
      async collectCoin(t, e) {
        let n = this.coins?.find((s) => s.userData.row === t && s.userData.col === e && !s.userData.collected);
        if (!n) return !1;
        ((n.userData.collected = !0), __hanumanSound.block());
        let s = n.scale.x;
        return (
          await Je(280, (t, e) => {
            ((n.rotation.y += 0.38), (n.position.y = 0.3 + Math.sin(e * Math.PI) * 0.58), n.scale.setScalar(s * (1 - t * 0.82)));
          }),
          (n.visible = !1),
          !0
        );
      }
      async turnTo(t, e = 300) {
        __hanumanSound.turn();
        let n = this.hero.rotation.y,
          s = (-t * Math.PI) / 2,
          r = s - n;
        for (; r > Math.PI;) r -= Math.PI * 2;
        for (; r < -Math.PI;) r += Math.PI * 2;
        (await Je(e, (a) => {
          this.hero.rotation.y = n + r * a;
        }),
          (this.hero.rotation.y = s));
      }
      async salute() {
        let t = this.hero.userData.parts.rightArm;
        await Je(220, (e, n) => {
          t.rotation.x = -Math.sin(n * Math.PI) * 1.2;
        });
      }
      async hit(t) {
        __hanumanSound.error();
        if (t) {
          let e = t.rotation.z;
          await Je(260, (n, s) => (t.rotation.z = e + Math.sin(s * Math.PI) * 0.2));
        }
        (await Je(420, (e, n) => {
          ((this.hero.rotation.z = Math.sin(n * Math.PI * 8) * 0.09), (this.hero.position.y = 0.31 + Math.sin(n * Math.PI) * 0.14));
        }),
          (this.hero.rotation.z = 0),
          (this.hero.position.y = 0.31));
      }
      async warp() {
        __hanumanSound.finish();
        let t = this.hero.scale.x;
        (await Je(700, (e, n) => {
          ((this.hero.rotation.y += 0.24),
            this.hero.scale.setScalar(t * (1 - e * 0.98)),
            (this.hero.position.y = 0.31 + e * 1.1),
            (this.portal.userData.r1.rotation.z += 0.16),
            (this.portal.userData.r2.rotation.z -= 0.22));
        }),
          (this.hero.visible = !1),
          await rg(180));
      }
      async celebrate() {
        ((this.hero.visible = !0),
          this.hero.scale.setScalar(0.9),
          await Je(680, (t, e) => {
            ((this.hero.position.y = 0.31 + Math.sin(e * Math.PI) * 0.72),
              (this.hero.rotation.y += 0.13),
              (this.hero.userData.parts.leftArm.rotation.z = -t * 1.6),
              (this.hero.userData.parts.rightArm.rotation.z = t * 1.6));
          }));
      }
      toggleView() {
        this.view = this.view === "iso" ? "top" : "iso";
        let t = Math.max(this.m.rows, this.m.cols);
        return (
          this.view === "top"
            ? (this.camera.up.set(0, 0, -1), this.camera.position.set(0, t * 2.05, 0.01), this.camera.lookAt(0, 0, 0))
            : this.frameCamera(),
          this.view
        );
      }
      render(t, e) {
        (this.portal &&
          ((this.portal.userData.r1.rotation.z += e * 0.7),
          (this.portal.userData.r2.rotation.z -= e * 1.1),
          (this.portal.userData.core.material.opacity = 0.2 + Math.sin(t * 3) * 0.08),
          (this.portal.position.y = 0.31 + Math.sin(t * 2) * 0.06)),
          this.yaks.forEach((n, s) => {
            ((n.position.y = 0.3 + Math.sin(t * 1.7 + s) * 0.025),
              (n.userData.parts.club.rotation.z = 0.22 + Math.sin(t * 1.3 + s) * 0.06));
          }),
          this.coins?.forEach((n, s) => {
            n.visible && ((n.rotation.y += e * 1.8), (n.position.y = 0.3 + Math.sin(t * 3 + s) * 0.05));
          }),
          super.render(t, e));
      }
    },
    Sl = class extends vi {
      constructor(t) {
        // ฉากหน้าปก: หนุมานยืนกลางเกาะลอยฟ้า โบกมือทักทาย หันหน้าเข้ากล้อง มียักษ์สองตนขนาบข้างและประตูวิเศษเรืองแสงอยู่ด้านหลัง
        (super(t, 465464), this.camera.position.set(0.4, 3.7, 10.4), this.camera.lookAt(0, 1.35, 0));
        const isl = new ae();
        this.root.add(isl);
        hxC(4.5, 4.5, 0.5, ce(0x6bd677, 0.02, 0.85), isl, [0, -0.2, 0], null, true, 56).receiveShadow = true;
        hxC(4.6, 4.1, 0.7, ce(0x8a5a3a, 0.02, 0.95), isl, [0, -0.8, 0], null, true, 56);
        hxK(4.1, 4.4, ce(0x7d6a95, 0.05, 0.95), isl, [0, -3.35, 0], [Math.PI, 0, 0], true, 9);
        hxT(4.52, 0.09, hxP.gold, isl, [0, 0.05, 0], [Math.PI / 2, 0, 0]);
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + 0.3;
          hxK(0.2, 0.9 + (k % 3) * 0.35, hxNM([0x8be8ff, 0xff9ee0, 0xb3a0ff][k % 3], 0.2, 0.15, 0x3a8aaa, 0.7), isl, [Math.cos(a) * 3.6, -1.7 - (k % 2) * 0.5, Math.sin(a) * 3.6], [Math.PI, 0, 0.25], true, 5);
        }
        this.hero = Hs();
        this.hero.position.set(-0.55, 0.04, 1.5);
        this.hero.scale.setScalar(1.18);
        this.hero.rotation.y = 3.3;
        this.root.add(this.hero);
        this.yak = bh(1);
        this.yak.position.set(2.55, 0.04, 0.2);
        this.yak.rotation.y = 2.75;
        this.root.add(this.yak);
        this.yak2 = bh(0);
        this.yak2.position.set(-2.55, 0.04, -0.1);
        this.yak2.rotation.y = 3.55;
        this.root.add(this.yak2);
        this.portal = qa();
        this.portal.position.set(0.9, 0.05, -2.0);
        this.portal.scale.setScalar(2.1);
        this.root.add(this.portal);
        const put = (m, x, z, s, ry) => { m.position.set(x, 0.04, z); m.scale.multiplyScalar(s || 1); m.rotation.y = ry || 0; this.root.add(m); return m; };
        put(cg("palm", 1), -3.4, -1.6, 1.3, 0.4);
        put(cg("sakura", 0), 3.5, -1.5, 1.3, 1.2);
        put(cg("sala", 0), -2.3, -2.2, 1.15, 0.5);
        put(cg("chedi", 0), 3.0, -2.3, 1.15, 0);
        put(cg("lamp", 0), -3.0, 2.3, 1.3, 0);
        put(cg("lamp", 0), 3.0, 2.4, 1.3, 0);
        put(cg("bushf", 0), -2.9, 2.0, 1.2, 0.3);
        put(cg("bush", 0), 2.9, 2.2, 1.2, 0.8);
        put(cg("flower", 0), -0.6, 2.8, 1.3, 0);
        put(cg("flower", 1), 0.7, 3.0, 1.3, 0);
        put(cg("flower", 2), 3.3, 0.8, 1.2, 0);
      }
      render(t, e) {
        const hp = this.hero.userData.parts, ph = this.hero.position;
        (this.drag || (this.root.rotation.y = Math.sin(t * 0.3) * 0.1),
          (ph.y = 0.04 + Math.abs(Math.sin(t * 2)) * 0.04),
          (hp.rightArm.rotation.z = 2.3 + Math.sin(t * 5) * 0.28),
          (hp.leftArm.rotation.z = -0.15 + Math.sin(t * 2) * 0.05),
          (hp.tail.rotation.z = Math.sin(t * 2.2) * 0.14),
          (hp.head.rotation.z = Math.sin(t * 1.5) * 0.05),
          [this.yak, this.yak2].forEach((y, i) => {
            y.position.y = 0.04 + Math.abs(Math.sin(t * 1.6 + i)) * 0.03;
            y.userData.parts.club.rotation.z = 0.2 + Math.sin(t * 1.7 + i) * 0.08;
            y.userData.parts.head.rotation.y = Math.sin(t * 0.9 + i * 2) * 0.18;
          }),
          (this.portal.userData.r1.rotation.z += e),
          (this.portal.userData.r2.rotation.z -= e * 1.4),
          super.render(t, e));
      }
    },
    bl = class extends vi {
      constructor(t) {
        (super(t, 1389900), this.camera.position.set(5.8, 5.6, 7.2), this.camera.lookAt(0, 0.5, 0), (this.root.rotation.y = -0.1));
        for (let e = 0; e < 6; e++)
          ri(1.05, 0.22, 1.05, ce(e % 2 ? 14462562 : 15780220, 0.02, 0.82), this.root, [(e - 2.5) * 1.12, 0.11, 0]);
        ((this.hero = Hs()),
          this.hero.position.set(-2.8, 0.23, 0),
          (this.hero.rotation.y = -Math.PI / 2),
          this.root.add(this.hero),
          (this.portal = qa()),
          this.portal.position.set(2.8, 0.23, 0),
          (this.portal.rotation.y = -Math.PI / 2),
          this.root.add(this.portal));
        for (let e = 0; e < 5; e++) {
          let n = Th(e);
          (n.position.set((e - 2) * 1.5, 0.2, e % 2 ? 0.85 : -0.85), this.root.add(n));
        }
        this.running = !1;
      }
      async run() {
        if (this.running) return;
        ((this.running = !0), (this.hero.visible = !0), this.hero.scale.setScalar(0.9), this.hero.position.set(-2.8, 0.23, 0));
        let t = this.hero.userData.parts;
        for (let e = 1; e <= 5; e++)
          (await Je(360, (n, s) => {
            ((this.hero.position.x = -2.8 + e * 1.12 - 1.12 + 1.12 * n),
              (this.hero.position.y = 0.23 + Math.sin(s * Math.PI) * 0.22),
              (t.leftLeg.rotation.x = Math.sin(s * Math.PI * 2) * 0.55),
              (t.rightLeg.rotation.x = -Math.sin(s * Math.PI * 2) * 0.55));
          }),
            (vt("#introStatus").textContent = `re5 \xB7 mf \u0E04\u0E23\u0E31\u0E49\u0E07\u0E17\u0E35\u0E48 ${e}/5`));
        (await Je(600, (e, n) => {
          (this.hero.scale.setScalar(0.9 * (1 - e * 0.96)), (this.hero.rotation.y -= 0.2), (this.hero.position.y = 0.23 + e));
        }),
          (this.hero.visible = !1),
          (vt("#introStatus").textContent =
            "\u0E16\u0E36\u0E07\u0E1B\u0E23\u0E30\u0E15\u0E39\u0E27\u0E34\u0E40\u0E28\u0E29 \u2014 \u0E27\u0E32\u0E23\u0E4C\u0E1B\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08!"),
          (this.running = !1));
      }
      render(t, e) {
        ((this.portal.userData.r1.rotation.z += e), (this.portal.userData.r2.rotation.z -= e * 1.5), super.render(t, e));
      }
    },
    El = class extends vi {
      constructor(t) {
        (super(t, 1055306), this.camera.position.set(6, 6.4, 7.4), this.camera.lookAt(0, 0.4, 0));
        for (let e = 0; e < 4; e++)
          for (let n = 0; n < 4; n++)
            ri(1.12, 0.2, 1.12, ce((e + n) % 2 ? 0x62d06c : 0x76dd7e, 0.02, 0.85), this.root, [(n - 1.5) * 1.2, 0.1, (e - 1.5) * 1.2]);
        ((this.hero = Hs()), this.root.add(this.hero), (this.start = { r: 2, c: 1, d: 0 }), this.reset(), (this.busy = !1));
      }
      pos(t, e) {
        return new F((e - 1.5) * 1.2, 0.23, (t - 1.5) * 1.2);
      }
      reset() {
        ((this.state = { ...this.start }),
          this.hero.position.copy(this.pos(this.state.r, this.state.c)),
          (this.hero.rotation.y = 0),
          this.hero.scale.setScalar(0.9),
          (this.hero.visible = !0),
          vt("#dojoTitle") &&
            (vt("#dojoTitle").textContent = "\u0E2B\u0E19\u0E38\u0E21\u0E32\u0E19\u0E2B\u0E31\u0E19\u0E02\u0E36\u0E49\u0E19\u0E1A\u0E19"),
          vt("#dojoText") &&
            (vt("#dojoText").textContent =
              "\u0E17\u0E34\u0E28\u0E0B\u0E49\u0E32\u0E22\u0E41\u0E25\u0E30\u0E02\u0E27\u0E32\u0E04\u0E37\u0E2D\u0E17\u0E34\u0E28\u0E02\u0E2D\u0E07\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23"));
      }
      async command(t) {
        if (!this.busy) {
          if (((this.busy = !0), t === "reset")) {
            (this.reset(), (this.busy = !1));
            return;
          }
          if (t === "tr" || t === "tl") {
            this.state.d = (this.state.d + (t === "tr" ? 1 : 3)) % 4;
            let e = this.hero.rotation.y,
              n = (-this.state.d * Math.PI) / 2,
              s = n - e;
            for (; s > Math.PI;) s -= Math.PI * 2;
            for (; s < -Math.PI;) s += Math.PI * 2;
            (await Je(350, (r) => (this.hero.rotation.y = e + s * r)),
              (this.hero.rotation.y = n),
              (vt("#dojoTitle").textContent =
                t === "tr" ? "\u0E2B\u0E31\u0E19\u0E02\u0E27\u0E32 90\xB0" : "\u0E2B\u0E31\u0E19\u0E0B\u0E49\u0E32\u0E22 90\xB0"),
              (vt("#dojoText").textContent =
                `\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E2B\u0E19\u0E38\u0E21\u0E32\u0E19\u0E2B\u0E31\u0E19${Mh[this.state.d]}`));
          } else if (t === "mf") {
            let e = Al[this.state.d],
              n = this.state.r + e[0],
              s = this.state.c + e[1];
            if (n < 0 || n > 3 || s < 0 || s > 3)
              (await Je(360, (r, a) => (this.hero.rotation.z = Math.sin(a * Math.PI * 7) * 0.08)),
                (this.hero.rotation.z = 0),
                (vt("#dojoTitle").textContent = "\u0E0A\u0E19\u0E02\u0E2D\u0E1A\u0E25\u0E32\u0E19"),
                (vt("#dojoText").textContent = "\u0E15\u0E23\u0E27\u0E08\u0E17\u0E34\u0E28\u0E01\u0E48\u0E2D\u0E19\u0E43\u0E0A\u0E49 mf"));
            else {
              __hanumanSound.step();
              let r = this.hero.position.clone(),
                a = this.pos(n, s);
              (await Je(380, (o, l) => {
                (this.hero.position.lerpVectors(r, a, o), (this.hero.position.y = 0.23 + Math.sin(l * Math.PI) * 0.2));
              }),
                (this.state.r = n),
                (this.state.c = s),
                (vt("#dojoTitle").textContent = "\u0E40\u0E14\u0E34\u0E19\u0E2B\u0E19\u0E49\u0E32 1 \u0E0A\u0E48\u0E2D\u0E07"),
                (vt("#dojoText").textContent =
                  "\u0E40\u0E14\u0E34\u0E19\u0E44\u0E1B\u0E15\u0E32\u0E21\u0E17\u0E34\u0E28\u0E17\u0E35\u0E48\u0E2B\u0E19\u0E38\u0E21\u0E32\u0E19\u0E01\u0E33\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E19\u0E2D\u0E22\u0E39\u0E48"));
            }
          }
          this.busy = !1;
        }
      }
    },
    Tl = class extends vi {
      constructor(t) {
        (super(t, 3479304), this.camera.position.set(5.6, 4.7, 7), this.camera.lookAt(0, 1, 0));
        let e = Ke(new Jn(4.8, 48), ce(0x6bd677, 0.02, 0.85), this.root, [0, 0, 0], [-Math.PI / 2, 0, 0]);
        ((e.receiveShadow = !0),
          (this.hero = Hs()),
          this.hero.position.set(0, 0.03, 0),
          (this.hero.rotation.y = 3.8),
          this.root.add(this.hero),
          (this.portal = qa()),
          this.portal.position.set(0, 0.05, 1.7),
          this.root.add(this.portal));
        for (let n = 0; n < 6; n++) {
          let s = Il(),
            r = (n * Math.PI * 2) / 6;
          (s.position.set(Math.cos(r) * 3, 0, Math.sin(r) * 3), (s.rotation.y = -r), this.root.add(s));
        }
        this.celebrating = !1;
      }
      async celebrate() {
        if (!this.celebrating) {
          this.celebrating = !0;
          for (let t = 0; t < 2; t++)
            await Je(680, (e, n) => {
              ((this.hero.position.y = 0.03 + Math.sin(n * Math.PI) * 0.8),
                (this.hero.rotation.y += 0.14),
                (this.hero.userData.parts.leftArm.rotation.z = -Math.sin(n * Math.PI) * 1.4),
                (this.hero.userData.parts.rightArm.rotation.z = Math.sin(n * Math.PI) * 1.4));
            });
          ((this.hero.position.y = 0.03), (this.celebrating = !1));
        }
      }
      render(t, e) {
        ((this.portal.userData.r1.rotation.z += e), (this.portal.userData.r2.rotation.z -= e * 1.4), super.render(t, e));
      }
    },
    wl = class {
      constructor(t) {
        ((this.host = t),
          (this.ids = t.dataset.sim.split(",")),
          (this.theme = t.dataset.theme),
          (this.mid = this.ids[0]),
          (this.tokens = []),
          (this.running = !1),
          (this.stepIndex = 0),
          (this.expanded = []),
          this.build(),
          this.enableDragEditing(),
          this.load(this.mid));
      }
      build() {
        ((this.host.className = "simulator"),
          (this.host.innerHTML =
            '<section class="glass map-panel"><div class="mission-tabs"></div><div class="three-viewport"><canvas aria-label="\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E20\u0E32\u0E23\u0E01\u0E34\u0E08\u0E2A\u0E32\u0E21\u0E21\u0E34\u0E15\u0E34"></canvas><span class="viewport-badge">THREE.JS \xB7 \u0E25\u0E32\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2B\u0E21\u0E38\u0E19\u0E09\u0E32\u0E01</span></div><div class="map-foot"><span class="map-meta"></span><span class="legend"><span><b>\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E2D\u0E07</b> \u0E17\u0E32\u0E07\u0E41\u0E19\u0E30\u0E19\u0E33</span><span><b>\u0E22\u0E31\u0E01\u0E29\u0E4C</b> \u0E2B\u0E49\u0E32\u0E21\u0E1C\u0E48\u0E32\u0E19</span></span></div></section><section class="glass code-panel"><div class="mission-info"><div><h2></h2><p></p></div><div class="budget"><b>0/0</b></div></div><div class="palette"></div><div class="workspace-head"><b>Coding Board \u0E41\u0E1A\u0E1A Scratch</b><span>\u0E04\u0E25\u0E34\u0E01\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E43\u0E19\u0E0A\u0E48\u0E2D\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E25\u0E1A</span></div><div class="workspace"></div><div class="controls"><button class="primary run">\u25B6 \u0E23\u0E31\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14</button><button class="soft step">\u25B7 \u0E17\u0E35\u0E25\u0E30\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07</button><button class="soft reset">\u21BA \u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E2B\u0E21\u0E48</button><button class="danger clear">\u0E25\u0E1A\u0E23\u0E2B\u0E31\u0E2A</button><button class="soft view">\u0E21\u0E38\u0E21\u0E1A\u0E19</button><button class="soft zoomin" title="ซูมเข้า">🔍+</button><button class="soft zoomout" title="ซูมออก">🔍−</button><button class="soft hint">\u0E04\u0E33\u0E43\u0E1A\u0E49</button><button class="soft solution">\u0E40\u0E09\u0E25\u0E22</button><select class="speed"><option value="680">\u0E0A\u0E49\u0E32</option><option value="420" selected>\u0E1B\u0E01\u0E15\u0E34</option><option value="240">\u0E40\u0E23\u0E47\u0E27</option></select></div><div class="message">\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E23\u0E34\u0E48\u0E21\u0E40\u0E02\u0E35\u0E22\u0E19\u0E23\u0E2B\u0E31\u0E2A</div></section>'),
          (this.tabs = vt(".mission-tabs", this.host)),
          (this.meta = vt(".map-meta", this.host)),
          (this.info = vt(".mission-info", this.host)),
          (this.palette = vt(".palette", this.host)),
          (this.workspace = vt(".workspace", this.host)),
          (this.msg = vt(".message", this.host)),
          (this.budget = vt(".budget", this.host)),
          (this.speed = vt(".speed", this.host)),
          (this.board = new Ml(vt("canvas", this.host), this.theme)),
          vl.forEach((t) => {
            let e = document.createElement("button");
            ((e.className = "palette-btn"),
              (e.title = `${t}: ${Cl[t].desc}`),
              (e.innerHTML = bn(t, "palette-block")),
              (e.onclick = () => this.add(t)),
              this.palette.appendChild(e));
          }),
          (vt(".run", this.host).onclick = () => this.run()),
          (vt(".step", this.host).onclick = () => this.step()),
          (vt(".reset", this.host).onclick = () => this.reset(!0)),
          (vt(".clear", this.host).onclick = () => {
            this.running || ((this.tokens = []), this.reset(!0), this.renderWorkspace());
          }),
          (vt(".view", this.host).onclick = (t) => {
            let e = this.board.toggleView();
            t.currentTarget.textContent = e === "iso" ? "\u0E21\u0E38\u0E21\u0E1A\u0E19" : "\u0E21\u0E38\u0E21 3D";
          }),
          (vt(".zoomin", this.host).onclick = () => this.board.zoomIn()),
          (vt(".zoomout", this.host).onclick = () => this.board.zoomOut()),
          (this.hintBtn = vt(".hint", this.host)),
          (this.solutionBtn = vt(".solution", this.host)),
          (this.hintBtn.onclick = () => this.message("info", "\u0E04\u0E33\u0E43\u0E1A\u0E49: " + Sn[this.mid].hint)),
          (this.solutionBtn.onclick = () => {
            this.running ||
              ((this.tokens = Sn[this.mid].solution.slice()),
              this.reset(!1),
              this.renderWorkspace(),
              this.message(
                "info",
                "\u0E41\u0E2A\u0E14\u0E07\u0E40\u0E09\u0E25\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E01\u0E14\u0E23\u0E31\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19",
              ));
          }));
      }
      enableDragEditing() {
        let t = vt(".workspace-head span", this.host);
        (t &&
          (t.textContent =
            "\u0E15\u0E48\u0E2D\u0E40\u0E25\u0E42\u0E01\u0E49\u0E08\u0E32\u0E01\u0E0B\u0E49\u0E32\u0E22\u0E44\u0E1B\u0E02\u0E27\u0E32 \xB7 \u0E25\u0E32\u0E01\u0E25\u0E07\u0E0A\u0E48\u0E2D\u0E07 + \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E17\u0E23\u0E01 \xB7 \u0E25\u0E32\u0E01\u0E17\u0E31\u0E1A\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E17\u0E19\u0E17\u0E35\u0E48"),
          (this.deleteDrop = document.createElement("div")),
          (this.deleteDrop.className = "delete-drop"),
          (this.deleteDrop.textContent =
            "\u{1F5D1} \u0E25\u0E32\u0E01\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E21\u0E32\u0E27\u0E32\u0E07\u0E17\u0E35\u0E48\u0E19\u0E35\u0E48\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E25\u0E1A"),
          this.workspace.after(this.deleteDrop));
        let e = document.createElement("button");
        ((e.className = "soft restore"),
          (e.textContent = "\u0E04\u0E37\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E15\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19"),
          (e.onclick = () => this.restoreInitial()),
          vt(".clear", this.host).before(e),
          vl.forEach((s, r) => {
            let a = this.palette.children[r];
            ((a.draggable = !0),
              a.addEventListener("dragstart", (o) => this.beginDrag(o, { kind: "palette", code: s })),
              a.addEventListener("pointerdown", (o) => this.beginPointerDrag(o, { kind: "palette", code: s }, a)));
          }),
          this.makeDropTarget(this.deleteDrop, (s) => this.applyDrop(s, "delete")));
        let n = this.renderWorkspace.bind(this);
        this.renderWorkspace = () => {
          (n(), this.wireSlots());
        };
      }
      beginDrag(t, e) {
        if (this.running) {
          t.preventDefault();
          return;
        }
        ((this.dragPayload = e),
          (t.dataTransfer.effectAllowed = e.kind === "slot" ? "move" : "copy"),
          t.dataTransfer.setData("text/plain", JSON.stringify(e)));
      }
      makeDropTarget(t, e) {
        (t.addEventListener("dragover", (n) => {
          this.running || (n.preventDefault(), t.classList.add("drag-over"));
        }),
          t.addEventListener("dragleave", () => t.classList.remove("drag-over")),
          t.addEventListener("drop", (n) => {
            (n.preventDefault(), t.classList.remove("drag-over"));
            let s = this.dragPayload;
            try {
              s = JSON.parse(n.dataTransfer.getData("text/plain")) || s;
            } catch {}
            (e(s), (this.dragPayload = null));
          }));
      }
      beginPointerDrag(t, e, n) {
        if (this.running || t.pointerType === "mouse") return;
        let s = t.clientX,
          r = t.clientY,
          a = !1,
          o = null,
          l = (u) => {
            (!a &&
              Math.hypot(u.clientX - s, u.clientY - r) > 8 &&
              ((a = !0), (o = n.cloneNode(!0)), o.classList.add("drag-ghost"), document.body.appendChild(o)),
              a &&
                (u.preventDefault(),
                (o.style.left = u.clientX + "px"),
                (o.style.top = u.clientY + "px"),
                cn(".drag-over").forEach((f) => f.classList.remove("drag-over")),
                document.elementFromPoint(u.clientX, u.clientY)?.closest(".slot,.insert-zone,.delete-drop")?.classList.add("drag-over")));
          },
          c = (u) => {
            if (
              (document.removeEventListener("pointermove", l),
              cn(".drag-over").forEach((h) => h.classList.remove("drag-over")),
              o?.remove(),
              !a)
            )
              return;
            (u.preventDefault(), (this.suppressClick = !0), setTimeout(() => (this.suppressClick = !1), 50));
            let f = document.elementFromPoint(u.clientX, u.clientY)?.closest(".slot,.insert-zone,.delete-drop");
            f?.classList.contains("delete-drop")
              ? this.applyDrop(e, "delete")
              : f?.classList.contains("insert-zone")
                ? this.applyDrop(e, { mode: "insert", index: +f.dataset.index })
                : f?.classList.contains("slot") && this.applyDrop(e, { mode: "replace", index: +f.dataset.index });
          };
        (document.addEventListener("pointermove", l, { passive: !1 }), document.addEventListener("pointerup", c, { once: !0 }));
      }
      applyDrop(t, e) {
        if (!(this.running || !t)) {
          if (e === "delete") {
            if (t.kind !== "slot" || t.index >= this.tokens.length) return;
            (this.tokens.splice(t.index, 1),
              this.message(
                "info",
                "\u0E16\u0E2D\u0E14\u0E40\u0E25\u0E42\u0E01\u0E49\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27",
              ));
          } else {
            let n = typeof e == "object" ? e.mode : "replace",
              s = typeof e == "object" ? e.index : +e;
            if (t.kind === "palette")
              if (n === "insert") {
                if (this.tokens.length >= Sn[this.mid].budget) return;
                (this.tokens.splice(Math.min(s, this.tokens.length), 0, t.code),
                  this.message(
                    "info",
                    `\u0E15\u0E48\u0E2D ${t.code} \u0E40\u0E02\u0E49\u0E32\u0E2A\u0E32\u0E22\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E41\u0E25\u0E49\u0E27`,
                  ));
              } else
                s < this.tokens.length &&
                  ((this.tokens[s] = t.code),
                  this.message(
                    "info",
                    `\u0E41\u0E17\u0E19\u0E17\u0E35\u0E48\u0E1A\u0E25\u0E47\u0E2D\u0E01 ${s + 1} \u0E14\u0E49\u0E27\u0E22 ${t.code}`,
                  ));
            else if (t.kind === "slot") {
              let r = t.index;
              if (r >= this.tokens.length) return;
              if (n === "insert") {
                let [a] = this.tokens.splice(r, 1),
                  o = s;
                (r < s && o--,
                  this.tokens.splice(Math.max(0, Math.min(o, this.tokens.length)), 0, a),
                  this.message(
                    "info",
                    `\u0E22\u0E49\u0E32\u0E22 ${a} \u0E21\u0E32\u0E15\u0E48\u0E2D\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E41\u0E25\u0E49\u0E27`,
                  ));
              } else
                r !== s &&
                  s < this.tokens.length &&
                  (([this.tokens[r], this.tokens[s]] = [this.tokens[s], this.tokens[r]]),
                  this.message(
                    "info",
                    `\u0E2A\u0E25\u0E31\u0E1A\u0E1A\u0E25\u0E47\u0E2D\u0E01 ${r + 1} \u0E01\u0E31\u0E1A ${s + 1} \u0E41\u0E25\u0E49\u0E27`,
                  ));
            }
          }
          (__hanumanSound.block(), this.reset(!1), this.renderWorkspace());
        }
      }
      restoreInitial() {
        if (this.running) return;
        let t = Sn[this.mid];
        ((this.tokens = t.buggy ? t.buggy.slice() : []),
          this.reset(!1),
          this.renderWorkspace(),
          this.message(
            "info",
            t.buggy
              ? "\u0E04\u0E37\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E41\u0E25\u0E49\u0E27"
              : "\u0E04\u0E37\u0E19 Coding Board \u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E48\u0E2D\u0E07\u0E27\u0E48\u0E32\u0E07\u0E41\u0E25\u0E49\u0E27",
          ));
      }
      wireSlots() {
        (this.workspace
          .querySelectorAll(".insert-zone")
          .forEach((t) => this.makeDropTarget(t, (e) => this.applyDrop(e, { mode: "insert", index: +t.dataset.index }))),
          this.workspace.querySelectorAll(".slot").forEach((t) => {
            let e = +t.dataset.index;
            (this.makeDropTarget(t, (n) => this.applyDrop(n, { mode: "replace", index: e })),
              (t.draggable = !0),
              t.addEventListener("dragstart", (n) => this.beginDrag(n, { kind: "slot", index: e })),
              t.addEventListener("pointerdown", (n) => this.beginPointerDrag(n, { kind: "slot", index: e }, t)),
              t.addEventListener(
                "click",
                (n) => {
                  this.suppressClick && (n.preventDefault(), n.stopImmediatePropagation());
                },
                !0,
              ));
          }));
      }
      renderTabs() {
        ((this.tabs.innerHTML = ""),
          this.ids.forEach((t) => {
            let e = Sn[t],
              n = document.createElement("button");
            ((n.className = "mission-tab" + (t === this.mid ? " active" : "")),
              (n.innerHTML = `${e.code}<small>${e.label}</small>`),
              (n.onclick = () => {
                this.running || this.load(t);
              }),
              this.tabs.appendChild(n));
          }));
      }
      load(t) {
        this.mid = t;
        let e = Sn[t];
        ((this.tokens = e.buggy ? e.buggy.slice() : []),
          this.renderTabs(),
          this.board.setMission(e),
          this.reset(!1),
          this.renderWorkspace(),
          this.hintBtn && (this.hintBtn.style.display = e.lockReveal ? "none" : ""),
          this.solutionBtn && (this.solutionBtn.style.display = e.lockReveal ? "none" : ""),
          (vt("h2", this.info).textContent = `${e.code} \xB7 ${e.label}`),
          (vt("p", this.info).innerHTML =
            `${e.story}<br><b>\u0E40\u0E23\u0E34\u0E48\u0E21\u0E2B\u0E31\u0E19${Mh[e.start.dir]}</b> \xB7 \u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19 <b>${e.budget} \u0E0A\u0E48\u0E2D\u0E07</b>`),
          (this.meta.textContent = `\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48 ${e.rows}\xD7${e.cols} \xB7 \u0E40\u0E23\u0E34\u0E48\u0E21 ${e.start.row + 1},${e.start.col + 1} \xB7 \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 ${e.goal.row + 1},${e.goal.col + 1}`),
          this.message(
            e.buggy ? "info" : "",
            e.buggy
              ? "\u0E21\u0E35\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E34\u0E14\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E44\u0E27\u0E49\u0E41\u0E25\u0E49\u0E27 \u0E01\u0E14\u0E23\u0E31\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E41\u0E01\u0E49"
              : "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E02\u0E35\u0E22\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E1A\u0E19 Coding Board",
          ));
      }
      add(t) {
        if (!this.running) {
          if (this.tokens.length >= Sn[this.mid].budget) {
            this.message("no", `Coding Board \u0E21\u0E35 ${Sn[this.mid].budget} \u0E0A\u0E48\u0E2D\u0E07`);
            return;
          }
          (this.tokens.push(t), __hanumanSound.block(), this.reset(!1), this.renderWorkspace());
        }
      }
      renderWorkspace() {
        let t = Sn[this.mid];
        this.workspace.innerHTML = "";
        for (let r = 0; r < this.tokens.length; r++) {
          let a = document.createElement("div");
          ((a.className = "insert-zone" + (r > 0 && /^re[2-5]$/.test(this.tokens[r - 1]) ? " loop-link" : "")),
            (a.dataset.index = r),
            this.workspace.appendChild(a));
          let o = document.createElement("div"),
            l = /^re[2-5]$/.test(this.tokens[r]);
          ((o.dataset.index = r),
            (o.className =
              "slot filled" +
              (l ? " loop-head" : "") +
              (r > 0 && /^re[2-5]$/.test(this.tokens[r - 1]) ? " loop-body" : "") +
              (l && r === this.tokens.length - 1 ? " loop-orphan" : "")),
            (o.innerHTML = `<span class="n">${r + 1}</span>${bn(this.tokens[r])}`),
            (o.onclick = () => {
              this.running || (this.tokens.splice(r, 1), this.reset(!1), this.renderWorkspace());
            }),
            this.workspace.appendChild(o));
        }
        let e = document.createElement("div");
        ((e.className = "insert-zone end"), (e.dataset.index = this.tokens.length), this.workspace.appendChild(e));
        let n = this.tokens.length,
          s = Math.min(100, (n / t.budget) * 100);
        (this.budget.style.setProperty("--pct", s + "%"),
          this.budget.classList.toggle("over", n > t.budget),
          (vt("b", this.budget).textContent = `${n}/${t.budget}`));
      }
      reset(t) {
        (this.board.resetHero(),
          (this.stepIndex = 0),
          (this.expanded = []),
          this.unhighlight(),
          t &&
            this.message(
              "",
              "\u0E01\u0E25\u0E31\u0E1A\u0E2A\u0E39\u0E48\u0E08\u0E38\u0E14\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19\u0E41\u0E25\u0E49\u0E27",
            ));
      }
      validate() {
        let t = Sn[this.mid];
        if (!this.tokens.length)
          return (this.message("no", "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E2B\u0E31\u0E2A"), !1);
        if (this.tokens[0] !== "wr")
          return (
            this.message("no", "\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E41\u0E23\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19 wr"),
            !1
          );
        let e = this.tokens.findIndex((n, s) => /^re[2-5]$/.test(n) && s === this.tokens.length - 1);
        return e >= 0
          ? (this.message(
              "no",
              `\u0E1A\u0E25\u0E47\u0E2D\u0E01 ${this.tokens[e]} \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E15\u0E48\u0E2D\u0E17\u0E49\u0E32\u0E22\u0E43\u0E2B\u0E49\u0E17\u0E33\u0E0B\u0E49\u0E33`,
            ),
            !1)
          : this.tokens.length > t.budget
            ? (this.message(
                "no",
                `\u0E43\u0E0A\u0E49 ${this.tokens.length} \u0E0A\u0E48\u0E2D\u0E07 \u0E40\u0E01\u0E34\u0E19\u0E40\u0E07\u0E37\u0E48\u0E2D\u0E19\u0E44\u0E02 ${t.budget} \u0E0A\u0E48\u0E2D\u0E07 \u2014 \u0E25\u0E2D\u0E07\u0E43\u0E0A\u0E49 re`,
              ),
              !1)
            : !0;
      }
      prepare() {
        return this.validate() ? (this.reset(!1), (this.expanded = Sh(this.tokens)), (this.stepIndex = 0), !0) : !1;
      }
      highlight(t) {
        if (
          (this.unhighlight(), this.workspace.querySelector(`.slot[data-index="${t.src}"]`)?.classList.add("run-now"), t.loopSrc !== void 0)
        ) {
          let e = this.workspace.querySelector(`.slot[data-index="${t.loopSrc}"]`);
          (e?.classList.add("loop-now"), e?.setAttribute("data-loop", `${t.rep}/${t.total}`));
        }
      }
      unhighlight() {
        cn(".run-now,.loop-now", this.workspace).forEach((t) => {
          (t.classList.remove("run-now", "loop-now"), t.removeAttribute("data-loop"));
        });
      }
      async execute(t) {
        let e = Sn[this.mid],
          n = +this.speed.value;
        if ((this.highlight(t), t.t === "wr")) return (await this.board.salute(), !0);
        if (t.t === "tr")
          return ((this.board.state.dir = (this.board.state.dir + 1) % 4), await this.board.turnTo(this.board.state.dir, n * 0.7), !0);
        if (t.t === "tl")
          return ((this.board.state.dir = (this.board.state.dir + 3) % 4), await this.board.turnTo(this.board.state.dir, n * 0.7), !0);
        if (t.t === "mf") {
          let s = Al[this.board.state.dir],
            r = this.board.state.row + s[0],
            a = this.board.state.col + s[1];
          if (r < 0 || r >= e.rows || a < 0 || a >= e.cols)
            return (
              await this.board.hit(),
              this.message(
                "no",
                "\u0E2B\u0E19\u0E38\u0E21\u0E32\u0E19\u0E15\u0E01\u0E02\u0E2D\u0E1A\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48 \u2014 \u0E15\u0E23\u0E27\u0E08\u0E17\u0E34\u0E28\u0E41\u0E25\u0E30\u0E08\u0E33\u0E19\u0E27\u0E19\u0E04\u0E23\u0E31\u0E49\u0E07",
              ),
              !1
            );
          let o = e.obstacles.findIndex((c) => c.row === r && c.col === a);
          return o >= 0
            ? (await this.board.hit(this.board.yaks[o]),
              this.message(
                "no",
                "\u0E0A\u0E19\u0E22\u0E31\u0E01\u0E29\u0E4C! \u0E17\u0E32\u0E07\u0E19\u0E35\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E32\u0E07\u0E2B\u0E25\u0E2D\u0E01 \u0E43\u0E2B\u0E49\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07\u0E2D\u0E37\u0E48\u0E19",
              ),
              !1)
            : e.path.some((c) => c.row === r && c.col === a)
              ? ((this.board.state.row = r),
                (this.board.state.col = a),
                await this.board.moveTo(r, a, n * 0.86),
                await this.board.collectCoin(r, a),
                !0)
              : (await this.board.hit(),
                this.message(
                  "no",
                  "\u0E2D\u0E2D\u0E01\u0E19\u0E2D\u0E01\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07! \u0E2B\u0E19\u0E38\u0E21\u0E32\u0E19\u0E40\u0E14\u0E34\u0E19\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E0A\u0E48\u0E2D\u0E07\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07",
                ),
                !1);
        }
        if (t.t === "wa") {
          let n = this.board.coins?.filter((s) => !s.userData.collected).length || 0;
          if (this.board.state.row === e.goal.row && this.board.state.col === e.goal.col) {
            if (n > 0)
              return (await this.board.hit(), this.message("no", `ยังเก็บเหรียญไม่ครบ เหลืออีก ${n} เหรียญ — ย้อนวางแผนเส้นทางใหม่`), !1);
            return (
              await this.board.warp(),
              this.message("ok", `วาร์ปสำเร็จ! เก็บเหรียญครบ · ใช้ ${this.tokens.length}/${e.budget} ช่อง`),
              "win"
            );
          }
          return (await this.board.hit(), this.message("no", "วาร์ปไม่ได้ เพราะยังไม่ได้ยืนบนประตูวิเศษ"), !1);
        }
        return !0;
      }
      lock(t) {
        ((this.running = t), cn("button", this.host).forEach((e) => (e.disabled = t)));
      }
      async run() {
        if (!(this.running || !this.prepare())) {
          this.lock(!0);
          for (let t of this.expanded)
            if ((await this.execute(t)) !== !0) {
              (this.lock(!1), this.unhighlight());
              return;
            }
          (this.lock(!1),
            this.unhighlight(),
            this.message(
              "no",
              "\u0E23\u0E2B\u0E31\u0E2A\u0E08\u0E1A\u0E41\u0E25\u0E49\u0E27 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E27\u0E32\u0E23\u0E4C\u0E1B \u2014 \u0E15\u0E23\u0E27\u0E08\u0E0A\u0E48\u0E2D\u0E07\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22",
            ));
        }
      }
      async step() {
        if (this.running || ((!this.expanded.length || this.stepIndex >= this.expanded.length) && !this.prepare())) return;
        let t = this.expanded[this.stepIndex++];
        if ((await this.execute(t)) !== !0) {
          ((this.expanded = []), (this.stepIndex = 0), this.unhighlight());
          return;
        }
        this.stepIndex >= this.expanded.length &&
          (this.unhighlight(),
          (this.expanded = []),
          (this.stepIndex = 0),
          t.t !== "wa" &&
            this.message(
              "no",
              "\u0E23\u0E2B\u0E31\u0E2A\u0E08\u0E1A\u0E41\u0E25\u0E49\u0E27 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E27\u0E32\u0E23\u0E4C\u0E1B",
            ));
      }
      message(t, e) {
        ((this.msg.className = "message" + (t ? " " + t : "")), (this.msg.textContent = e));
      }
    },
    ks = ["home", "s1", "goal", "s2a", "s2", "demo", "s3", "s4", "s5", "s6", "challenge"];
  function Gs(i) {
    (ks.includes(i) || (i = "home"),
      cn(".scene").forEach((t) => t.classList.toggle("active", t.id === i)),
      cn(".nav-btn").forEach((t) => t.classList.toggle("active", t.dataset.scene === i)));
    try {
      history.replaceState(null, "", "#" + i);
    } catch {}
    setTimeout(() => Rl.forEach((t) => t.resize()), 30);
  }
  cn("[data-scene]").forEach((i) => (i.onclick = () => Gs(i.dataset.scene)));
  cn("[data-go]").forEach((i) => (i.onclick = () => Gs(i.dataset.go)));
  document.addEventListener("keydown", (i) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    i.key.toLowerCase() === "f" && vt("#fullBtn").click();
    let t = ks.indexOf(vt(".scene.active")?.id);
    (i.key === "ArrowRight" && Gs(ks[Math.min(ks.length - 1, t + 1)]), i.key === "ArrowLeft" && Gs(ks[Math.max(0, t - 1)]));
  });
  vt("#fullBtn").onclick = async () => {
    try {
      document.fullscreenElement ? await document.exitFullscreen() : await document.documentElement.requestFullscreen();
    } catch {
      yl(
        "\u0E16\u0E49\u0E32\u0E1D\u0E31\u0E07\u0E43\u0E19 Google Sites \u0E43\u0E2B\u0E49\u0E02\u0E22\u0E32\u0E22\u0E01\u0E23\u0E2D\u0E1A\u0E2A\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E40\u0E15\u0E47\u0E21\u0E04\u0E27\u0E32\u0E21\u0E01\u0E27\u0E49\u0E32\u0E07",
      );
    }
  };
  vl.forEach((i) => {
    let t = Cl[i],
      e = document.createElement("div");
    ((e.className = "command-tile"),
      (e.innerHTML = bn(i, "palette-block") + `<p>${t.desc} \xB7 <b>${i}</b></p>`),
      vt("#commandGrid").appendChild(e));
  });
  var Xx = new Sl(vt('[data-three="showcase"] canvas'));
  var pg = new El(vt('[data-three="dojo"] canvas'));
  cn("[data-dojo]").forEach((i) => (i.onclick = () => pg.command(i.dataset.dojo)));
  document.getElementById("dojoZoomIn")?.addEventListener("click", () => pg.zoomIn());
  document.getElementById("dojoZoomOut")?.addEventListener("click", () => pg.zoomOut());
  var wh = new Tl(vt('[data-three="summary"] canvas'));
  vt("#celebrateBtn").onclick = () => wh.celebrate();
  document.getElementById("wisdomZoomIn")?.addEventListener("click", () => wh.zoomIn());
  document.getElementById("wisdomZoomOut")?.addEventListener("click", () => wh.zoomOut());
  var qx = cn("[data-sim]").map((i) => new wl(i)),
    mg = [
      {
        q: "1. \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E43\u0E14\u0E04\u0E27\u0E23\u0E43\u0E0A\u0E49\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E17\u0E33\u0E0B\u0E49\u0E33",
        o: [
          "\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E17\u0E38\u0E01\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E15\u0E48\u0E32\u0E07\u0E01\u0E31\u0E19",
          "\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E40\u0E14\u0E34\u0E21\u0E0B\u0E49\u0E33\u0E15\u0E34\u0E14\u0E01\u0E31\u0E19",
          "\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E0A\u0E49\u0E32",
        ],
        a: 1,
        f: "\u0E43\u0E0A\u0E49\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E40\u0E14\u0E34\u0E21\u0E40\u0E01\u0E34\u0E14\u0E0B\u0E49\u0E33\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07",
      },
      {
        q: "2. \u0E40\u0E14\u0E34\u0E19\u0E2B\u0E19\u0E49\u0E32 5 \u0E0A\u0E48\u0E2D\u0E07\u0E04\u0E27\u0E23\u0E40\u0E02\u0E35\u0E22\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E44\u0E23",
        o: ["mf \xB7 re5", "re5 \xB7 mf", "re4 \xB7 mf"],
        a: 1,
        f: "\u0E27\u0E32\u0E07 re5 \u0E01\u0E48\u0E2D\u0E19 mf \u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E43\u0E2B\u0E49\u0E17\u0E33\u0E0B\u0E49\u0E33",
      },
      {
        q: "3. Debug \u0E2B\u0E21\u0E32\u0E22\u0E16\u0E36\u0E07\u0E2D\u0E30\u0E44\u0E23",
        o: [
          "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E43\u0E2B\u0E49\u0E22\u0E32\u0E27",
          "\u0E2B\u0E32\u0E41\u0E25\u0E30\u0E41\u0E01\u0E49\u0E08\u0E38\u0E14\u0E1C\u0E34\u0E14",
          "\u0E25\u0E1A\u0E23\u0E2B\u0E31\u0E2A\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",
        ],
        a: 1,
        f: "\u0E17\u0E14\u0E2A\u0E2D\u0E1A \u0E2A\u0E31\u0E07\u0E40\u0E01\u0E15\u0E2D\u0E32\u0E01\u0E32\u0E23 \u0E41\u0E25\u0E49\u0E27\u0E41\u0E01\u0E49\u0E17\u0E35\u0E48\u0E15\u0E49\u0E19\u0E40\u0E2B\u0E15\u0E38",
      },
    ],
    _l = 0,
    xl = 0;
  mg.forEach((i) => {
    let t = document.createElement("div");
    ((t.className = "q"),
      (t.innerHTML = `<h3>${i.q}</h3><div class="options"></div><div class="feedback"></div>`),
      i.o.forEach((e, n) => {
        let s = document.createElement("button");
        ((s.textContent = e),
          (s.onclick = () => {
            s.parentElement.dataset.done ||
              ((s.parentElement.dataset.done = "1"),
              _l++,
              n === i.a
                ? (xl++, s.classList.add("correct"))
                : (s.classList.add("wrong"), s.parentElement.children[i.a].classList.add("correct")),
              cn("button", s.parentElement).forEach((r) => (r.disabled = !0)),
              (vt(".feedback", t).textContent = i.f),
              (vt("#quizScore").textContent =
                `\u0E15\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27 ${_l}/3 \xB7 \u0E16\u0E39\u0E01 ${xl} \u0E02\u0E49\u0E2D`),
              _l === 3 && xl === 3 && wh.celebrate());
          }),
          vt(".options", t).appendChild(s));
      }),
      vt("#quiz").appendChild(t));
  });
  vt("#teacherBtn").onclick = () => vt("#teacherModal").classList.add("open");
  vt("#closeTeacher").onclick = () => vt("#teacherModal").classList.remove("open");
  vt("#teacherModal").onclick = (i) => {
    i.target.id === "teacherModal" && i.currentTarget.classList.remove("open");
  };
  var gg = Object.values(Sn).sort(
    (i, t) =>
      [
        "S001",
        "S002",
        "?",
        "P001",
        "X001",
        "D001",
        "D002",
        "D003",
        "E001",
        "E002",
        "F001",
        "F002",
        "F003",
        "F004",
        "R001",
        "Y001",
        "M001",
        "M002",
        "M003",
        "M004",
      ].indexOf(i.code) -
      [
        "S001",
        "S002",
        "?",
        "P001",
        "X001",
        "D001",
        "D002",
        "D003",
        "E001",
        "E002",
        "F001",
        "F002",
        "F003",
        "F004",
        "R001",
        "Y001",
        "M001",
        "M002",
        "M003",
        "M004",
      ].indexOf(t.code),
  );
  vt("#answerTable").innerHTML =
    `<table><thead><tr><th>Game Code</th><th>\u0E23\u0E2B\u0E31\u0E2A\u0E40\u0E09\u0E25\u0E22</th><th>\u0E07\u0E1A</th></tr></thead><tbody>${gg.map((i) => `<tr><td><b>${i.code}</b><br>${i.label}</td><td>${i.solution.join(" \xB7 ")}</td><td>${i.budget}</td></tr>`).join("")}</tbody></table>`;
  var yh = performance.now();
  function Ah(i) {
    let t = Math.min(0.05, (i - yh) / 1e3);
    yh = i;
    for (let e of Rl) e.render(i / 1e3, t);
    requestAnimationFrame(Ah);
  }
  requestAnimationFrame(Ah);
  Gs(location.hash.slice(1) || "home");
  window.__hanuman = { views: Rl, Hs, bh, qa, cg, THREE_F: F };   // ตัวช่วยตรวจภาพ/ทดสอบ (ไม่กระทบการเล่น)
