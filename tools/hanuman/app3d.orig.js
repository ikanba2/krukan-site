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
  function Hs() {
    let i = new ae();
    i.userData.kind = "hero";
    let t = qt(0.34, Tt.white, i, [0, 0.72, 0], [1, 0.78, 0.82]),
      e = ve(0.32, 0.39, 0.72, Tt.white, i, [0, 1.05, 0]);
    (ve(0.35, 0.35, 0.15, Tt.gold, i, [0, 1.26, 0]), ve(0.39, 0.39, 0.12, Tt.red, i, [0, 0.76, 0]));
    let n = qt(0.44, Tt.white, i, [0, 1.62, -0.02], [1, 0.96, 0.94]);
    (qt(0.27, Tt.skin, i, [0, 1.49, -0.34], [1.05, 0.72, 0.55]),
      qt(0.13, Tt.skin, i, [-0.43, 1.62, -0.01], [0.65, 1, 0.5]),
      qt(0.13, Tt.skin, i, [0.43, 1.62, -0.01], [0.65, 1, 0.5]),
      qt(0.075, Tt.white, i, [-0.14, 1.7, -0.4]),
      qt(0.075, Tt.white, i, [0.14, 1.7, -0.4]),
      qt(0.034, Tt.black, i, [-0.14, 1.7, -0.465]),
      qt(0.034, Tt.black, i, [0.14, 1.7, -0.465]),
      ve(0.34, 0.34, 0.12, Tt.gold, i, [0, 1.95, 0]),
      Vs(0.27, 0.56, Tt.gold, i, [0, 2.22, 0]),
      qt(0.09, Tt.red, i, [0, 2.12, -0.24]));
    let s = new ae(),
      r = new ae();
    (s.position.set(-0.4, 1.18, 0),
      r.position.set(0.4, 1.18, 0),
      i.add(s, r),
      ve(0.11, 0.1, 0.64, Tt.white, s, [0, -0.27, 0], [0, 0, -0.22]),
      ve(0.11, 0.1, 0.64, Tt.white, r, [0, -0.27, 0], [0, 0, 0.22]),
      qt(0.13, Tt.skin, s, [0.08, -0.59, 0]),
      qt(0.13, Tt.skin, r, [-0.08, -0.59, 0]));
    let a = new ae(),
      o = new ae();
    (a.position.set(-0.19, 0.7, 0),
      o.position.set(0.19, 0.7, 0),
      i.add(a, o),
      ve(0.13, 0.11, 0.55, Tt.white, a, [0, -0.25, 0]),
      ve(0.13, 0.11, 0.55, Tt.white, o, [0, -0.25, 0]),
      qt(0.14, Tt.skin, a, [0, -0.55, -0.08], [1, 0.65, 1.35]),
      qt(0.14, Tt.skin, o, [0, -0.55, -0.08], [1, 0.65, 1.35]));
    let l = Ke(new mi(0.46, 0.055, 10, 30, Math.PI * 1.55), Tt.white, i, [0.36, 0.9, 0.2], [Math.PI / 2, 0.25, 0.3]);
    qt(0.07, Tt.gold, i, [0.27, 1.32, 0.52]);
    let c = ve(0.045, 0.045, 1.55, Tt.gold, i, [0.52, 1.16, -0.12], [0, 0, 0.12]);
    return (
      qt(0.11, Tt.gold, i, [0.43, 1.92, -0.12]),
      (i.userData.parts = { leftArm: s, rightArm: r, leftLeg: a, rightLeg: o, body: e, head: n, tail: l, staff: c }),
      i.scale.setScalar(0.9),
      i
    );
  }
  function bh(i = 0) {
    let t = [Tt.green, Tt.purple, Tt.red, Tt.blue],
      e = t[i % 4],
      n = new ae();
    ((n.userData.kind = "yak"),
      qt(0.48, e, n, [0, 1.25, 0], [1, 0.98, 0.84]),
      ve(0.42, 0.48, 0.76, e, n, [0, 0.73, 0]),
      ve(0.48, 0.48, 0.16, Tt.gold, n, [0, 0.96, 0]),
      ve(0.46, 0.46, 0.13, Tt.red, n, [0, 0.4, 0]),
      qt(0.28, Tt.skin, n, [0, 1.15, -0.37], [1, 0.65, 0.45]),
      qt(0.08, Tt.white, n, [-0.16, 1.38, -0.4]),
      qt(0.08, Tt.white, n, [0.16, 1.38, -0.4]),
      qt(0.04, Tt.black, n, [-0.16, 1.38, -0.47]),
      qt(0.04, Tt.black, n, [0.16, 1.38, -0.47]),
      Vs(0.12, 0.38, Tt.white, n, [-0.34, 1.68, 0], [0, 0, -0.5]),
      Vs(0.12, 0.38, Tt.white, n, [0.34, 1.68, 0], [0, 0, 0.5]),
      ve(0.4, 0.4, 0.14, Tt.gold, n, [0, 1.69, 0]),
      Vs(0.3, 0.58, Tt.gold, n, [0, 2, 0]));
    let s = new ae(),
      r = new ae();
    (s.position.set(-0.46, 0.88, 0),
      r.position.set(0.46, 0.88, 0),
      n.add(s, r),
      ve(0.13, 0.12, 0.64, e, s, [0, -0.28, 0], [0, 0, -0.25]),
      ve(0.13, 0.12, 0.64, e, r, [0, -0.28, 0], [0, 0, 0.25]),
      qt(0.14, e, s, [0.08, -0.58, 0]),
      qt(0.14, e, r, [-0.08, -0.58, 0]));
    let a = new ae(),
      o = new ae();
    (a.position.set(-0.22, 0.38, 0),
      o.position.set(0.22, 0.38, 0),
      n.add(a, o),
      ve(0.15, 0.13, 0.53, e, a, [0, -0.22, 0]),
      ve(0.15, 0.13, 0.53, e, o, [0, -0.22, 0]),
      qt(0.16, Tt.black, a, [0, -0.5, -0.06], [1, 0.65, 1.3]),
      qt(0.16, Tt.black, o, [0, -0.5, -0.06], [1, 0.65, 1.3]));
    let l = ve(0.065, 0.08, 1.2, Tt.brown, n, [0.64, 1, -0.05], [0, 0, 0.22]);
    return (
      qt(0.18, Tt.gold, n, [0.53, 1.57, -0.05]),
      (n.userData.parts = { la: s, ra: r, ll: a, rl: o, head: n.children[0], club: l }),
      n.scale.setScalar(0.88),
      n
    );
  }
  function qa() {
    let i = new ae(),
      t = ce(9133302, 0.55, 0.25, 4988309),
      e = ce(5565940, 0.35, 0.25, 947344),
      n = Ke(new mi(0.55, 0.085, 12, 40), t, i, [0, 0.75, 0], [0, 0, 0]),
      s = Ke(new mi(0.39, 0.045, 10, 34), e, i, [0, 0.75, 0.02], [0, 0, 0]),
      r = Ke(new Jn(0.45, 32), new $n({ color: 11838719, transparent: !0, opacity: 0.26, side: Ze }), i, [0, 0.75, 0.04]),
      a = ri(0.72, 0.06, 0.14, e, i, [0, 0.08, 0.38]),
      o = Ke(new Gi(0.13, 0.3, 3), e, i, [0, 0.16, 0.48], [-Math.PI / 2, 0, 0]),
      l = new Wi(9366271, 2.2, 5);
    return (l.position.set(0, 0.8, 0.3), i.add(l), (i.userData = { r1: n, r2: s, core: r, threshold: a, entry: o, light: l }), i);
  }
  function Eh(i = 0) {
    let t = new ae();
    ve(0.12, 0.18, 0.75, Tt.brown, t, [0, 0.38, 0]);
    let e = [2926171, 4831829, 1934925];
    return (
      qt(0.38, ce(e[i % 3], 0.02, 0.9), t, [0, 0.93, 0], [1.1, 0.9, 1]),
      qt(0.29, ce(e[(i + 1) % 3], 0.02, 0.9), t, [0.2, 1.07, 0.05]),
      qt(0.25, ce(5753444, 0.02, 0.9), t, [-0.18, 1.08, 0.02]),
      t.scale.setScalar(0.72),
      t
    );
  }
  function og() {
    let i = new ae();
    return (qt(0.3, Tt.stone, i, [0, 0.22, 0], [1.25, 0.72, 1]), qt(0.2, ce(6910332, 0.04, 0.95), i, [0.22, 0.16, 0.12], [1, 0.7, 1]), i);
  }
  function Il() {
    let i = new ae();
    (ri(0.72, 0.12, 0.55, Tt.gold, i, [0, 0.08, 0]), ri(0.56, 0.42, 0.4, Tt.red, i, [0, 0.32, 0]));
    for (let t of [-0.26, 0.26]) ve(0.045, 0.045, 0.62, Tt.gold, i, [t, 0.55, -0.16]);
    return (
      ri(0.72, 0.09, 0.52, Tt.gold, i, [0, 0.82, 0]),
      Vs(0.55, 0.28, Tt.gold, i, [0, 0.99, 0], [0, Math.PI / 4, 0]),
      i.scale.setScalar(0.65),
      i
    );
  }
  function lg() {
    let i = new ae();
    return (
      ve(0.035, 0.05, 0.68, Tt.gold, i, [0, 0.34, 0]),
      qt(0.13, ce(16743190, 0.1, 0.4, 16726272), i, [0, 0.72, 0], [0.7, 1.25, 0.7]),
      i
    );
  }
  function Th(i = 0) {
    let t = new ae(),
      e = [16736940, 16766044, 10980346];
    for (let n = 0; n < 5; n++) {
      let s = (n * Math.PI * 2) / 5;
      qt(0.08, ce(e[i % 3], 0, 0.8), t, [Math.cos(s) * 0.1, 0.12, Math.sin(s) * 0.1], [1, 0.5, 1]);
    }
    return (qt(0.06, Tt.gold, t, [0, 0.13, 0]), t);
  }
  function cg(i, t) {
    return ["tree", "palm", "bush", "bushf", "sakura"].includes(i)
      ? Eh(t)
      : ["rock", "pot", "drum"].includes(i)
        ? og()
        : ["sala", "gate", "chedi", "sign"].includes(i)
          ? Il()
          : ["lamp", "lantern"].includes(i)
            ? lg()
            : Th(t);
  }
  function __makeHanumanCoin() {
    let i = new ae(),
      t = qt(0.3, ce(16763176, 0.4, 0.2, 16745984), i, [0, 0.55, 0], [1, 1, 0.18]),
      e = qt(0.13, ce(16777215, 0.22, 0.18, 16763176), i, [0, 0.55, -0.055], [1, 1, 0.13]);
    return ((t.castShadow = !0), (e.castShadow = !0), (i.userData.face = t), i);
  }
  function hg(i) {
    let t = new Ha({ canvas: i, antialias: !0, alpha: !1, powerPreference: "high-performance" });
    return (
      t.setPixelRatio(Math.min(devicePixelRatio || 1, 1.65)),
      (t.shadowMap.enabled = !0),
      (t.shadowMap.type = Jr),
      (t.outputColorSpace = Ue),
      (t.toneMapping = As),
      (t.toneMappingExposure = 1.15),
      t
    );
  }
  function ug(i) {
    i.add(new Ss(12445695, 1651486, 2.1));
    let t = new Es(16773072, 3.2);
    (t.position.set(7, 11, 6),
      (t.castShadow = !0),
      t.shadow.mapSize.set(1024, 1024),
      (t.shadow.camera.left = -10),
      (t.shadow.camera.right = 10),
      (t.shadow.camera.top = 10),
      (t.shadow.camera.bottom = -10),
      i.add(t));
    let e = new Wi(6220287, 1.8, 20);
    (e.position.set(-6, 4, -5), i.add(e));
  }
  function dg(i, t = 80, e = 10022143, n = 12) {
    let s = new Ae(),
      r = new Float32Array(t * 3);
    for (let o = 0; o < t; o++)
      ((r[o * 3] = (Math.random() - 0.5) * n), (r[o * 3 + 1] = Math.random() * 5 + 0.2), (r[o * 3 + 2] = (Math.random() - 0.5) * n));
    s.setAttribute("position", new Fe(r, 3));
    let a = new ps(s, new ki({ color: e, size: 0.045, transparent: !0, opacity: 0.75 }));
    return (i.add(a), a);
  }
  var vi = class {
      constructor(t, e = 464171) {
        ((this.canvas = t),
          (this.scene = new hs()),
          (this.scene.background = new zt(e)),
          (this.scene.fog = new cs(e, 12, 30)),
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
        this.visible() && (this.resize(), (this.particles.rotation.y = t * 0.02), this.renderer.render(this.scene, this.camera));
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
        for (let a = 0; a < t.rows; a++)
          for (let o = 0; o < t.cols; o++) {
            let l = e.has(`${a},${o}`),
              c = n.has(`${a},${o}`),
              u = l ? 14198357 : (a + o) % 2 ? 5680466 : 6536027,
              f = ce(u, 0.02, 0.86),
              h = this.cell(a, o);
            (ri(1.11, 0.24, 1.11, f, this.board, [h.x, 0.12, h.z]),
              l && ri(0.96, 0.035, 0.96, ce(c ? 13587298 : 15912323, 0.02, 0.78), this.board, [h.x, 0.262, h.z]));
          }
        let r = Ke(new Jn(s * 1.15, 48), ce(1522486, 0.02, 1), this.board, [0, -0.02, 0], [-Math.PI / 2, 0, 0]);
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
        (super(t, 465464), this.camera.position.set(6.8, 4.5, 8.2), this.camera.lookAt(0, 1, 0));
        let e = Ke(new Jn(5.8, 64), ce(1793610, 0.05, 0.9), this.root, [0, 0, 0], [-Math.PI / 2, 0, 0]);
        ((e.receiveShadow = !0),
          (this.hero = Hs()),
          this.hero.position.set(-1.5, 0.03, 0),
          (this.hero.rotation.y = 0.3),
          this.root.add(this.hero),
          (this.yak = bh(1)),
          this.yak.position.set(1.6, 0.03, 0.2),
          (this.yak.rotation.y = -0.35),
          this.root.add(this.yak));
        let n = Il();
        (n.position.set(0, 0, 2.1), n.scale.multiplyScalar(1.7), this.root.add(n));
        for (let s = 0; s < 7; s++) {
          let r = Eh(s);
          (r.position.set((s - 3) * 1.5, 0, 2.7 + Math.sin(s) * 0.6), this.root.add(r));
        }
        ((this.portal = qa()), this.portal.position.set(0, 0.05, -1.9), this.root.add(this.portal));
      }
      render(t, e) {
        (this.drag || (this.root.rotation.y = Math.sin(t * 0.25) * 0.12),
          (this.hero.position.y = 0.04 + Math.sin(t * 2) * 0.03),
          (this.yak.userData.parts.club.rotation.z = 0.2 + Math.sin(t * 1.7) * 0.08),
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
            ri(1.12, 0.2, 1.12, ce((e + n) % 2 ? 3448181 : 4569481, 0.02, 0.85), this.root, [(n - 1.5) * 1.2, 0.1, (e - 1.5) * 1.2]);
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
        let e = Ke(new Jn(4.8, 48), ce(10177810, 0.1, 0.8), this.root, [0, 0, 0], [-Math.PI / 2, 0, 0]);
        ((e.receiveShadow = !0),
          (this.hero = Hs()),
          this.hero.position.set(0, 0.03, 0),
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
