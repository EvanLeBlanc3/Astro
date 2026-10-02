/* ASTRO — main app */
(() => {
  const A = window.AstroCalc, L = window.LORE, P = window.PIX;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app'), main = $('#main');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function hash(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const SIGN = (i) => L.SIGNS[i];

  /* ---------------- state ---------------- */
  const KEY = 'astro.v1';
  let S = { slots: [null, null, null], active: 0, settings: { sound: true, music: false, crt: true, shake: true, mode: 'serious' }, revealed: {}, big3: {}, pick: 'sun', reroll: 0, rerollDay: '' };
  try { const j = JSON.parse(localStorage.getItem(KEY)); if (j) S = Object.assign(S, j, { settings: Object.assign(S.settings, j.settings || {}) }); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const prof = () => S.slots[S.active];
  const isU = () => S.settings.mode === 'unhinged';
  let CH = null; // current chart
  function computeChart() {
    const p = prof(); if (!p) { CH = null; return; }
    CH = A.chart({ y: p.y, mo: p.mo, d: p.d, h: p.timeKnown ? p.h : 12, mi: p.timeKnown ? p.mi : 0, lat: p.place.lat, lon: p.place.lon, tz: p.place.tz, timeKnown: p.timeKnown });
    CH.sunS = A.signOf(CH.sun); CH.moonS = A.signOf(CH.moon); CH.ascS = p.timeKnown ? A.signOf(CH.asc) : null;
  }

  /* ---------------- sound ---------------- */
  const SFX = {
    ctx: null, master: null,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      this.ctx = new C(); this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
      // iOS unlock
      const b = this.ctx.createBuffer(1, 1, 22050), s = this.ctx.createBufferSource(); s.buffer = b; s.connect(this.master); s.start(0);
    },
    tone(f, d = 0.08, type = 'square', v = 0.12, f2 = null, delay = 0) {
      if (!S.settings.sound || !this.ctx) return;
      const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + 0.02);
    },
    noise(d = 0.2, v = 0.1, delay = 0, freq = 1200) {
      if (!S.settings.sound || !this.ctx) return;
      const t = this.ctx.currentTime + delay, n = Math.floor(this.ctx.sampleRate * d), b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), ch = b.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
      const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
    },
    tap() { this.tone(isU() ? 330 + Math.random() * 400 : 660, 0.05, 'square', 0.08); },
    nav() { this.tone(523, 0.05, 'square', 0.08); this.tone(784, 0.07, 'square', 0.08, null, 0.05); },
    tick() { this.tone(isU() ? 300 + Math.random() * 900 : 1100 + Math.random() * 200, 0.018, 'square', 0.025); },
    coin() { this.tone(988, 0.07, 'square', 0.1); this.tone(1319, 0.25, 'square', 0.1, null, 0.07); },
    star() { this.tone(2400, 0.5, 'triangle', 0.08, 500); this.tone(3200, 0.25, 'sine', 0.04, 1200, 0.05); },
    error() { this.tone(220, 0.25, 'sawtooth', 0.08, 110); },
    reveal() {
      if (isU()) { [196, 233, 185, 277, 175, 311, 156].forEach((f, i) => this.tone(f * 2, 0.12, i % 2 ? 'sawtooth' : 'square', 0.09, f * (i % 2 ? 1.5 : 3), i * 0.07)); this.noise(0.5, 0.12, 0.5, 600); this.tone(1200, 0.6, 'square', 0.06, 60, 0.55); }
      else { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, 0.18, 'square', 0.08, null, i * 0.07)); this.tone(2093, 0.6, 'triangle', 0.08, null, 0.45); this.noise(0.4, 0.03, 0.45, 6000); }
    },
    flip() { this.tone(400, 0.08, 'square', 0.07, 900); this.noise(0.08, 0.05, 0, 3000); },
    levelUp() { [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, i === 6 ? 0.5 : 0.1, 'square', 0.09, null, i * 0.09)); },
    glitch() { this.noise(0.35, 0.18, 0, 900); this.tone(800, 0.4, 'sawtooth', 0.1, 40); this.tone(90, 0.3, 'square', 0.1, 400, 0.1); this.noise(0.15, 0.15, 0.35, 3000); },
    chime() { [1047, 1319, 1568].forEach((f, i) => this.tone(f, 0.6, 'triangle', 0.07, null, i * 0.08)); },
    boot() { [262, 330, 392, 523].forEach((f, i) => this.tone(f, 0.12, 'square', 0.09, null, i * 0.1)); this.tone(1047, 0.7, 'triangle', 0.09, null, 0.42); }
  };
  // tiny chiptune loop
  const MUSIC = {
    timer: null, next: 0, step: 0,
    start() {
      if (this.timer || !SFX.ctx) return; this.next = SFX.ctx.currentTime + 0.1; this.step = 0;
      this.timer = setInterval(() => this.sched(), 60);
    },
    stop() { clearInterval(this.timer); this.timer = null; },
    sched() {
      if (!S.settings.music || !S.settings.sound) return this.stop();
      const c = SFX.ctx, u = isU();
      const scale = u ? [220, 233, 277, 311, 330, 370, 415, 466] : [220, 262, 294, 330, 392, 440, 523, 587];
      const pat = [0, 2, 4, 6, 4, 2, 5, 3, 1, 3, 5, 7, 5, 3, 4, 2];
      const bass = [110, 110, 87, 98];
      const dur = u ? 0.15 : 0.24;
      while (this.next < c.currentTime + 0.2) {
        const delay = this.next - c.currentTime, i = this.step % 16;
        let f = scale[pat[i]]; if (u && Math.random() < 0.2) f *= Math.random() < 0.5 ? 0.5 : 2.03;
        SFX.tone(f * (u ? 1 : 2), dur * 0.9, u ? 'square' : 'triangle', 0.03, null, delay);
        if (i % 4 === 0) SFX.tone(bass[(this.step >> 4) % 4] * (u ? 0.94 : 1), dur * 3.5, u ? 'sawtooth' : 'triangle', 0.035, null, delay);
        this.next += dur; this.step++;
      }
    }
  };

  /* ---------------- visual fx ---------------- */
  const sky = $('#sky'), sctx = sky.getContext('2d');
  const fx = $('#fx'), fctx = fx.getContext('2d');
  let stars = [], shooters = [], parts = [], W = 0, H = 0;
  function resize() {
    W = app.clientWidth; H = app.clientHeight;
    sky.width = Math.ceil(W / 3); sky.height = Math.ceil(H / 3);
    fx.width = Math.ceil(W / 2); fx.height = Math.ceil(H / 2);
    stars = Array.from({ length: Math.floor(sky.width * sky.height / 90) }, () => ({ x: Math.random() * sky.width, y: Math.random() * sky.height, b: Math.random(), s: 0.5 + Math.random() * 2, big: Math.random() < 0.06, hue: Math.floor(Math.random() * 360) }));
  }
  function shoot(n = 1) { for (let i = 0; i < n; i++) shooters.push({ x: Math.random() * sky.width * 0.8 + sky.width * 0.2, y: Math.random() * sky.height * 0.4, vx: -(2 + Math.random() * 2), vy: 1 + Math.random(), life: 40 + Math.random() * 20 }); }
  function burst(x, y, n = 40, colors) {
    colors = colors || (isU() ? ['#ff2fa8', '#9dff00', '#fff27a', '#3dd6ff', '#ffffff'] : ['#ffcc33', '#3dd6ff', '#ffffff', '#c7a6ff', '#ff6bd5']);
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 4; parts.push({ x: x / 2, y: y / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 30 + Math.random() * 30, c: colors[i % colors.length], s: Math.random() < 0.3 ? 2 : 1 }); }
  }
  function centerOf(el) {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
    while (n && n !== app) { x += n.offsetLeft; y += n.offsetTop; const p = n.offsetParent; let s = n.parentElement; while (s && s !== p) { y -= s.scrollTop; s = s.parentElement; } if (p && p !== app) y -= p.scrollTop; n = p; }
    return [x, y];
  }
  const burstAt = (el, n, c) => { const [x, y] = centerOf(el); burst(x, y, n, c); };
  function flash(color = '#fff') { const f = $('#flash'); f.style.background = color; f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  function shake() { if (!S.settings.shake) return; app.classList.remove('shake'); void app.offsetWidth; app.classList.add('shake'); setTimeout(() => app.classList.remove('shake'), 500); }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; app.appendChild(t); setTimeout(() => t.remove(), 2500); }

  let tm = 0;
  function loop() {
    tm++;
    const u = isU(), w = sky.width, h = sky.height;
    const g = sctx.createLinearGradient(0, 0, 0, h);
    if (u) { g.addColorStop(0, '#1a0410'); g.addColorStop(1, '#3d0a1e'); } else { g.addColorStop(0, '#0b0618'); g.addColorStop(1, '#1d0f45'); }
    sctx.fillStyle = g; sctx.fillRect(0, 0, w, h);
    // pixel planet
    const px = w - 26, py = h - 70 + Math.sin(tm / 90) * 2, pr = 12;
    for (let y = -pr; y <= pr; y++) for (let x = -pr; x <= pr; x++) { const d = x * x + y * y; if (d <= pr * pr) { const band = Math.floor((y + pr + Math.sin((x + tm / 20) / 3)) / 4) % 2; sctx.fillStyle = u ? (band ? '#9e0f4f' : '#5a0f3a') : (band ? '#3b1f9e' : '#2a1d63'); if (x + y > pr * 0.6) sctx.fillStyle = u ? '#2b0619' : '#160c33'; sctx.fillRect(px + x, py + y, 1, 1); } }
    sctx.fillStyle = u ? '#9dff00' : '#ffcc33';
    for (let x = -pr - 7; x <= pr + 7; x++) { const y = Math.round(x * 0.28); if (!(Math.abs(x) < pr && y < 0 && x * x + y * y < pr * pr) && !(Math.abs(x) < pr - 2 && y >= 0 && Math.abs(x) < pr)) sctx.fillRect(px + x, py + y, 1, 1); }
    // stars
    for (const s of stars) {
      const tw = (Math.sin(tm / 20 * s.s + s.b * 10) + 1) / 2;
      if (tw < 0.25) continue;
      let x = s.x, y = s.y; if (u) { x += (Math.random() - 0.5) * 0.8; }
      sctx.fillStyle = u ? `hsl(${(s.hue + tm * 2) % 360},100%,70%)` : (tw > 0.85 ? '#ffffff' : tw > 0.55 ? '#c7b8ff' : '#6b5bb5');
      sctx.fillRect(x | 0, y | 0, 1, 1);
      if (s.big && tw > 0.7) { sctx.fillRect((x | 0) - 1, y | 0, 3, 1); sctx.fillRect(x | 0, (y | 0) - 1, 1, 3); }
    }
    if (Math.random() < (u ? 0.03 : 0.006)) shoot();
    shooters = shooters.filter((s) => s.life-- > 0);
    for (const s of shooters) { s.x += s.vx; s.y += s.vy; for (let k = 0; k < 8; k++) { sctx.fillStyle = k === 0 ? '#ffffff' : `rgba(255,${u ? 80 : 220},${u ? 200 : 120},${1 - k / 8})`; sctx.fillRect((s.x - s.vx * k * 0.6) | 0, (s.y - s.vy * k * 0.6) | 0, 1, 1); } }
    // particles
    fctx.clearRect(0, 0, fx.width, fx.height);
    parts = parts.filter((p) => p.life-- > 0);
    for (const p of parts) { p.vy += 0.12; p.vx *= 0.98; p.x += p.vx; p.y += p.vy; fctx.fillStyle = p.c; fctx.globalAlpha = Math.min(1, p.life / 15); fctx.fillRect(p.x | 0, p.y | 0, p.s + 1, p.s + 1); }
    fctx.globalAlpha = 1;
    // orbs
    drawOrb($('#orb'), tm); drawOrb($('#bootOrb'), tm);
    requestAnimationFrame(loop);
  }

  /* crystal orb (48x48 pixel canvas) */
  let orbBoost = 0;
  function drawOrb(c, t) {
    if (!c || !c.offsetParent) return;
    const x = c.getContext('2d'); x.clearRect(0, 0, 48, 48);
    const u = isU(), pal = u ? ['#2b0010', '#7a0c3d', '#ff2fa8', '#9dff00', '#fff27a'] : ['#160a45', '#3b1f9e', '#6f4dff', '#3dd6ff', '#d6f6ff'];
    const cx = 24, cy = 20, r = 16, sp = 1 + orbBoost * 4; if (orbBoost > 0) orbBoost -= 0.01;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const d = Math.sqrt(i * i + j * j); if (d > r) continue;
      let n = Math.sin(i * 0.45 + t * 0.05 * sp) + Math.cos(j * 0.5 - t * 0.04 * sp) + Math.sin((i + j) * 0.3 + Math.sin(t * 0.02) * 3);
      n = (n + 3) / 6; let k = Math.min(4, Math.floor(n * 5));
      if (d > r - 2) k = 0; else if (d > r - 4 && (i + j + t) % 2 === 0) k = Math.max(0, k - 1);
      x.fillStyle = pal[k]; x.fillRect(cx + i, cy + j, 1, 1);
    }
    x.fillStyle = '#ffffff'; x.fillRect(16, 10, 3, 2); x.fillRect(15, 12, 2, 2); x.fillRect(20, 9, 1, 1);
    // stand
    const gold = u ? ['#9dff00', '#4f8a00', '#2c4d00'] : ['#ffcc33', '#c98a1b', '#7a4d0b'];
    for (let j = 0; j < 9; j++) { const half = 9 + Math.floor(j * 0.7); for (let i = -half; i <= half; i++) { x.fillStyle = j === 0 ? gold[0] : (i > half - 3 ? gold[2] : gold[1]); x.fillRect(24 + i, 37 + j, 1, 1); } }
    x.fillStyle = gold[0]; x.fillRect(12, 41, 24, 1);
  }
  function moonIcon(elong, sizePx = 16) {
    const c = document.createElement('canvas'); c.width = c.height = sizePx; const x = c.getContext('2d'), r = sizePx / 2 - 1, cx = sizePx / 2;
    const k = Math.cos(elong * Math.PI / 180); const waxing = elong < 180;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      if (i * i + j * j > r * r) continue;
      const w = Math.sqrt(r * r - j * j), term = w * k; // terminator x
      let lit = waxing ? (i > term) : (i < -term);
      x.fillStyle = lit ? '#fff3b0' : '#2a1d63'; x.fillRect(cx + i, cx + j, 1, 1);
    }
    c.className = 'pix'; return c;
  }

  /* ---------------- portrait lock ---------------- */
  function orient() {
    let a = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0);
    const land = window.innerWidth > window.innerHeight;
    document.body.classList.toggle('rotL', land && (a === 90));
    document.body.classList.toggle('rotR', land && (a === 270 || a === -90));
    if (land && !document.body.classList.contains('rotL') && !document.body.classList.contains('rotR') && 'ontouchstart' in window) document.body.classList.add('rotL');
    setTimeout(resize, 50);
  }
  try { screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait').catch(() => {}); } catch (e) {}

  /* ---------------- horoscope engine ---------------- */
  const PL_NAMES = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn' };
  const RETRO_U = { mercury: 'Mercury is retrograde, so every text you send is being delivered by a confused owl.', venus: 'Venus is retrograde: your ex\u2019s ex is about to follow you. Block preemptively.', mars: 'Mars is retrograde, so your rage is buffering. Please wait.', jupiter: 'Jupiter is retrograde. Luck is on back-order. Estimated arrival: spring-ish.', saturn: 'Saturn is retrograde and re-grading all your old homework. You got a C.' };
  const RETRO_S = { mercury: 'Mercury is retrograde: double-check messages, plans, and tech before acting.', venus: 'Venus is retrograde: a good time to reassess relationships and spending rather than start new ones.', mars: 'Mars is retrograde: redirect energy into revising plans rather than forcing new battles.', jupiter: 'Jupiter is retrograde: growth happens internally now; review your beliefs and goals.', saturn: 'Saturn is retrograde: revisit commitments and shore up the foundations you have built.' };
  function reading(signIdx, mode, reroll) {
    const now = new Date(), sk = A.sky(now.getTime()), day = todayKey();
    const r = rng(hash(`${day}|${signIdx}|${mode}|${reroll}`));
    const moonS = A.signOf(sk.moon), sunS = A.signOf(sk.sun);
    const mh = (moonS - signIdx + 12) % 12, sh = (sunS - signIdx + 12) % 12;
    const H = L.HOUSES, u = mode === 'unhinged';
    const log = [];
    let mainTxt;
    if (!u) {
      mainTxt = `The Moon in ${SIGN(moonS).name}, moving through your ${ord(mh + 1)} house, ${H[mh].s} ${pick(r, L.ADVICE_S)}`;
      log.push(`${SIGN(sunS).name} season is warming your ${ord(sh + 1)} house of ${H[sh].topic}.`);
      log.push(L.PHASES.s[sk.phase.idx]);
      for (const p of Object.keys(PL_NAMES)) { if (A.signOf(sk.planets[p].lon) === signIdx) log.push(`${PL_NAMES[p]} is in ${SIGN(signIdx).name}, adding its influence directly to your sign.`); }
      if (moonS === signIdx) log.push('The Moon is in your sign today: emotions are closer to the surface and your instincts are sharp.');
      for (const p of Object.keys(PL_NAMES)) if (sk.planets[p].retro) log.push(RETRO_S[p]);
    } else {
      const c1 = pick(r, L.CHAOS_U); let c2 = pick(r, L.CHAOS_U); if (c2 === c1) c2 = L.CHAOS_U[(L.CHAOS_U.indexOf(c1) + 7) % L.CHAOS_U.length];
      mainTxt = `The Moon (in ${SIGN(moonS).name}, allegedly) ${H[mh].u} ${c1} ${c2}`;
      log.push(`It is ${SIGN(sunS).name} season, which in your ${ord(sh + 1)} house means: ${H[sh].topic}, but make it a problem.`);
      log.push(L.PHASES.u[sk.phase.idx]);
      if (moonS === signIdx) log.push('The Moon is IN your sign. You are legally a werewolf until midnight.');
      for (const p of Object.keys(PL_NAMES)) { if (A.signOf(sk.planets[p].lon) === signIdx) log.push(`${PL_NAMES[p]} is crashing on your sign\u2019s couch and has not offered to pay for groceries.`); }
      for (const p of Object.keys(PL_NAMES)) if (sk.planets[p].retro) log.push(RETRO_U[p]);
    }
    const statNames = u ? ['CHAOS', 'SNACKS', 'DRAMA', 'LUCK?'] : ['LOVE', 'CAREER', 'ENERGY', 'LUCK'];
    const stats = statNames.map((n) => [n, 1 + Math.floor(r() * 10)]);
    const col = pick(r, u ? L.COLORS_U : L.COLORS);
    const hour = 1 + Math.floor(r() * 12), ampm = r() < 0.5 ? 'AM' : 'PM';
    const lucky = { num: u ? Math.floor(r() * 9000) + 13 : 1 + Math.floor(r() * 99), color: col, item: pick(r, u ? L.LUCKY_ITEM_U : L.LUCKY_ITEM_S), mood: pick(r, u ? L.MOODS_U : L.MOODS_S), hour: u ? `${hour}:${String(Math.floor(r() * 60)).padStart(2, '0')} ${ampm} (exactly)` : `${hour} ${ampm}`, dont: u ? pick(r, L.DONT_U) : null };
    return { main: mainTxt, log, stats, lucky, sky: sk, moonS, sunS };
  }

  // Free, key-less, CORS-open horoscope API (CosmyDay). Cached once per sign per day.
  function cleanText(s) {
    s = String(s).replace(/<[^>]+>/g, ' ').replace(/[#*_`>]+/g, '').replace(/\s+/g, ' ').trim();
    if (s.length > 900) { const cut = s.slice(0, 900); s = cut.slice(0, Math.max(cut.lastIndexOf('. ') + 1, 400)); }
    return s;
  }
  function extractText(j) {
    if (typeof j === 'string') return j.length > 30 ? j : null;
    const found = [];
    (function walk(o, k, depth) {
      if (depth > 6 || o == null) return;
      if (typeof o === 'string') { if (o.length > 40 && !/^https?:/.test(o)) found.push({ k: String(k || ''), s: o }); return; }
      if (Array.isArray(o)) return o.forEach((v) => walk(v, k, depth + 1));
      if (typeof o === 'object') for (const kk of Object.keys(o)) walk(o[kk], kk, depth + 1);
    })(j, '', 0);
    if (!found.length) return null;
    const pref = found.filter((f) => /horoscope|text|content|body|reading|prediction|summary|overview|general|description/i.test(f.k));
    const pool = pref.length ? pref : found;
    pool.sort((a, b) => b.s.length - a.s.length);
    return pool[0].s;
  }
  async function getJSON(url, ms = 7000) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
    try { const r = await fetch(url, { signal: ctl.signal, cache: 'no-store' }); if (!r.ok) throw new Error(r.status); const ct = r.headers.get('content-type') || ''; return ct.includes('json') ? await r.json() : await r.text(); } finally { clearTimeout(t); }
  }
  async function oracle(signIdx) {
    const name = SIGN(signIdx).name.toLowerCase(), k = `astro.oracle.${todayKey()}.${name}`;
    const c = localStorage.getItem(k); if (c) return JSON.parse(c);
    if (!navigator.onLine) return null;
    const sources = [
      { url: `https://api.cosmyday.com/content/daily/${name}`, src: 'CosmyDay free API' },
      { url: `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${name}&day=TODAY`, src: 'Free Horoscope API' }
    ];
    for (const s of sources) {
      try { const j = await getJSON(s.url); const t = extractText(j); if (t) { const out = { text: cleanText(t), src: s.src }; localStorage.setItem(k, JSON.stringify(out)); return out; } } catch (e) {}
    }
    return null;
  }

  /* ---------------- typewriter ---------------- */
  let typeTok = 0;
  function typeInto(el, text, fast) {
    const tok = ++typeTok; el.innerHTML = ''; let i = 0;
    const span = document.createElement('span'), cur = document.createElement('span'); cur.className = 'cursor'; el.append(span, cur);
    const finish = () => { if (tok !== typeTok) return; span.textContent = text; cur.remove(); typeTok++; };
    el.onclick = finish;
    if (fast) return finish();
    (function step() {
      if (tok !== typeTok) return;
      i += isU() ? 1 + Math.floor(Math.random() * 3) : 2;
      span.textContent = text.slice(0, i); if (i % 4 < 2) SFX.tick();
      if (isU() && Math.random() < 0.04) el.classList.add('glitchy'), setTimeout(() => el.classList.remove('glitchy'), 200);
      if (i < text.length) setTimeout(step, isU() ? 18 + Math.random() * 40 : 22); else finish();
    })();
  }

  /* ---------------- views ---------------- */
  let view = 'today';
  const bodyColor = { sun: '#ffcc33', moon: '#d6e4ff', asc: '#3dd6ff', mc: '#ff9ecf', mercury: '#b8f0a0', venus: '#ff9ecf', mars: '#ff5e5e', jupiter: '#ffa63d', saturn: '#c9b98a', uranus: '#6ff2ff', neptune: '#7b9cff', pluto: '#c27bff' };
  const signImg = (i, px = 28) => P.img(SIGN(i).name, SIGN(i).color, px);

  function render() {
    $$('.view').forEach((v) => v.classList.toggle('on', v.id === 'v-' + view));
    $$('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.v === view));
    ({ today: renderToday, big3: renderBig3, chart: renderChart, codex: renderCodex, me: renderMe })[view]();
  }
  function needProfile(el) {
    el.innerHTML = `<div class="panel" style="text-align:center"><div class="h1">NO SAVE FILE</div><p>Create your character to unlock the stars.</p><button class="btn wide" id="np">\u2605 NEW GAME</button></div>`;
    $('#np', el).onclick = () => { SFX.coin(); openEditor(S.active); };
  }

  function currentPickSign() {
    if (!CH) return 0;
    if (S.pick === 'moon') return CH.moonS;
    if (S.pick === 'asc' && CH.ascS != null) return CH.ascS;
    if (typeof S.pick === 'number') return S.pick;
    return CH.sunS;
  }
  function renderToday() {
    const el = $('#v-today'); if (!CH) return needProfile(el);
    if (S.rerollDay !== todayKey()) { S.reroll = 0; S.rerollDay = todayKey(); }
    const sIdx = currentPickSign(), mode = S.settings.mode, R = reading(sIdx, mode, S.reroll), sg = SIGN(sIdx);
    const d = new Date(), dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    const rk = `${todayKey()}|${S.active}|${sIdx}|${mode}|${S.reroll}`, revealed = !!S.revealed[rk];
    const chip = (key, label, i) => `<button class="chip ${S.pick === key ? 'on' : ''}" data-p="${key}">${signImg(i, 16)}${label}</button>`;
    el.innerHTML = `
      <div class="panel alt skybar"><span id="mi"></span><div class="grow"><div class="tiny">${dateStr} \u00B7 TODAY'S SKY</div>
        <div>Sun in <b style="color:${SIGN(R.sunS).color}">${SIGN(R.sunS).name}</b> \u00B7 Moon in <b style="color:${SIGN(R.moonS).color}">${SIGN(R.moonS).name}</b></div>
        <div class="small">${R.sky.phase.name} \u00B7 ${Math.round(R.sky.phase.illum * 100)}% lit</div></div></div>
      <div class="chips">${chip('sun', 'SUN', CH.sunS)}${chip('moon', 'MOON', CH.moonS)}${CH.ascS != null ? chip('asc', 'RISING', CH.ascS) : ''}
        <label class="chip ${typeof S.pick === 'number' ? 'on' : ''}">\u25BC <select id="other"><option value="">OTHER</option>${L.SIGNS.map((s, i) => `<option value="${i}" ${S.pick === i ? 'selected' : ''}>${s.name.toUpperCase()}</option>`).join('')}</select></label></div>
      <div class="panel">
        <div class="ptitle">${signImg(sIdx, 22)} ${sg.name.toUpperCase()} \u00B7 ${mode === 'unhinged' ? 'UNHINGED' : 'DAILY'} READING</div>
        <div class="orb-wrap"><canvas id="orb" class="pix" width="48" height="48"></canvas><div class="orb-hint" id="hint">${revealed ? 'TAP ORB TO RE-SUMMON' : '\u25B2 TAP THE ORB \u25B2'}</div></div>
        <div id="rbox" ${revealed ? '' : 'hidden'}><div class="reading" id="rtxt"></div><div class="tiny src" id="rsrc"></div></div>
      </div>
      <div id="after" ${revealed ? '' : 'hidden'}>
        <div class="panel"><div class="ptitle">${P.img('sparkle', '#3dd6ff', 18)} SKY LOG</div><ul class="loglist">${R.log.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="panel"><div class="ptitle">${P.img(mode === 'unhinged' ? 'skull' : 'heart', mode === 'unhinged' ? '#9dff00' : '#ff6b9d', 18)} TODAY'S STATS</div>
          ${R.stats.map(([n, v], i) => `<div class="stat"><span>${n}</span><div class="bar" style="--c:${['#ff6b9d', '#ffcc33', '#3dd6ff', '#9dff00'][i]}">${Array.from({ length: 10 }, (_, k) => `<i class="${k < v ? 'f' : ''}" style="animation-delay:${k * 40 + i * 120}ms"></i>`).join('')}</div><span>${v}</span></div>`).join('')}</div>
        <div class="panel"><div class="ptitle">${P.img('star', '#ffcc33', 18)} LOOT TABLE</div>
          <div class="lucky"><div><b>LUCKY NUMBER</b>${R.lucky.num}</div><div><b>LUCKY COLOR</b><span class="swatch" style="background:${R.lucky.color[1]}"></span>${R.lucky.color[0]}</div>
          <div><b>LUCKY ITEM</b>${esc(R.lucky.item)}</div><div><b>MOOD</b>${R.lucky.mood}</div><div style="grid-column:span 2"><b>POWER HOUR</b>${R.lucky.hour}</div></div>
          ${R.lucky.dont ? `<div class="dont">\u26A0 DO NOT: ${esc(R.lucky.dont)}.</div>` : ''}</div>
        <div class="row">${mode === 'unhinged' ? '<button class="btn grow" id="reroll">\u21BB REROLL CHAOS</button>' : ''}<button class="btn sec grow" id="share">\u2709 SHARE</button></div>
      </div>`;
    $('#mi', el).appendChild(Object.assign(moonIcon(R.sky.phase.elong, 16), { style: 'width:46px;height:46px' }));
    $$('.chip[data-p]', el).forEach((b) => b.onclick = () => { SFX.tap(); S.pick = b.dataset.p; save(); renderToday(); });
    $('#other', el).onchange = (e) => { SFX.tap(); if (e.target.value !== '') { S.pick = +e.target.value; save(); renderToday(); } };
    let mainText = R.main, srcLabel = mode === 'unhinged' ? 'SOURCE: A RACCOON WITH A TELESCOPE (offline engine + real sky positions)' : 'SOURCE: ASTRO SKY ENGINE (real planetary positions, offline)';
    const show = (fast) => {
      $('#rbox').hidden = false; $('#after').hidden = false;
      typeInto($('#rtxt'), mainText, fast); $('#rsrc').textContent = srcLabel;
    };
    const fetchOracle = mode === 'serious' ? oracle(sIdx).then((o) => { if (o) { mainText = o.text; srcLabel = `SOURCE: ${o.src.toUpperCase()} \u00B7 SKY LOG: ASTRO ENGINE`; } }).catch(() => {}) : Promise.resolve();
    if (revealed) fetchOracle.then(() => { if (view === 'today' && $('#rtxt')) show(true); });
    $('#orb', el).onclick = async () => {
      SFX.init(); const orb = $('#orb'); orb.classList.remove('shaking'); void orb.offsetWidth; orb.classList.add('shaking'); orbBoost = 1;
      $('#hint').textContent = pick(Math.random, isU() ? L.LOADING_U : L.LOADING).toUpperCase();
      SFX.noise(0.5, 0.05, 0, 2000);
      await Promise.race([fetchOracle, new Promise((r) => setTimeout(r, 2500))]);
      await new Promise((r) => setTimeout(r, 500));
      SFX.reveal(); flash(isU() ? '#ff2fa8' : '#fff'); burstAt(orb, 70); if (isU()) shake(); shoot(3);
      S.revealed[rk] = true; save();
      $('#hint').textContent = 'TAP ORB TO RE-SUMMON';
      show(false);
    };
    const rr = $('#reroll', el); if (rr) rr.onclick = () => { SFX.glitch(); shake(); flash('#9dff00'); S.reroll++; save(); renderToday(); setTimeout(() => $('#orb') && $('#orb').click(), 100); };
    $('#share', el).onclick = async () => {
      SFX.tap(); const txt = `\u2728 ASTRO \u00B7 ${sg.name} \u00B7 ${dateStr}\n\n${mainText}\n\nLucky number: ${R.lucky.num} \u00B7 Color: ${R.lucky.color[0]}`;
      try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast('COPIED TO CLIPBOARD'); } } catch (e) {}
    };
  }

  function elementScores() {
    const w = { sun: 3, moon: 3, asc: 3, mercury: 2, venus: 2, mars: 2, jupiter: 1, saturn: 1, uranus: 0.5, neptune: 0.5, pluto: 0.5 };
    const sc = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const add = (lon, k) => { sc[SIGN(A.signOf(lon)).element] += w[k]; };
    add(CH.sun, 'sun'); add(CH.moon, 'moon'); if (CH.timeKnown) add(CH.asc, 'asc');
    for (const p of A.PLANETS) add(CH.planets[p].lon, p);
    return sc;
  }
  function renderBig3() {
    const el = $('#v-big3'); if (!CH) return needProfile(el);
    const p = prof(), u = isU(), rev = S.big3[p.id] || (S.big3[p.id] = [false, false, false]);
    const now = new Date(); let age = now.getFullYear() - p.y; if (now.getMonth() + 1 < p.mo || (now.getMonth() + 1 === p.mo && now.getDate() < p.d)) age--;
    const cls = `${SIGN(CH.moonS).keywords[0]} ${SIGN(CH.sunS).animal.replace('The ', '')}`;
    const sc = elementScores(), mx = Math.max(...Object.values(sc));
    const statMap = [['Fire', 'ATK'], ['Earth', 'DEF'], ['Air', 'INT'], ['Water', 'MP']];
    const dom = Object.keys(sc).sort((a, b) => sc[b] - sc[a])[0];
    const card = (k, i) => {
      const lon = k === 'sun' ? CH.sun : k === 'moon' ? CH.moon : CH.asc, B = L.BODIES[k];
      let front;
      if (k === 'asc' && !CH.timeKnown) {
        front = `<div class="cardtop"><div class="sigil">${P.img('asc', '#3dd6ff', 44)}</div><div><div class="lbl">RISING \u00B7 ${B.role.toUpperCase()}</div><div class="sn">LOCKED</div><div class="small">Add your birth time in ME \u2192 Edit to unlock your Rising sign.</div></div></div>`;
      } else {
        const si = A.signOf(lon), sg = SIGN(si), deg = A.degIn(lon);
        const txt = u ? sg[k === 'asc' ? 'risingU' : k + 'U'] : sg[k === 'asc' ? 'rising' : k];
        let note = '';
        if (k === 'moon' && CH.moonRange) note = `<div class="note">\u26A0 No birth time: your Moon is ${SIGN(CH.moonRange[0]).name} or ${SIGN(CH.moonRange[1]).name} (it changed signs that day).</div>`;
        else if (deg < 1) note = `<div class="note">\u2605 Cusp alert: only ${deg.toFixed(1)}\u00B0 past ${SIGN((si + 11) % 12).name}.</div>`;
        else if (deg > 29) note = `<div class="note">\u2605 Cusp alert: ${(30 - deg).toFixed(1)}\u00B0 from ${SIGN((si + 1) % 12).name}.</div>`;
        front = `<div class="cardtop" style="--sc:${sg.color}"><div class="sigil">${signImg(si, 52)}</div><div><div class="lbl">${k === 'asc' ? 'RISING' : B.name.toUpperCase()} \u00B7 ${B.role.toUpperCase()}</div><div class="sn">${sg.name.toUpperCase()}</div><div class="small">${A.fmtDeg(lon)} ${sg.name}</div></div></div>
          <p>${esc(txt)}</p>${note}
          <div class="tags"><span class="tag">${sg.element.toUpperCase()}</span><span class="tag">${sg.mode.toUpperCase()}</span><span class="tag">RULER: ${sg.ruler.toUpperCase()}</span>${sg.keywords.map((w) => `<span class="tag">${w.toUpperCase()}</span>`).join('')}</div>`;
      }
      return `<div class="card ${rev[i] ? 'flipped' : ''}" data-i="${i}"><div class="card-in"><div class="face back"><div class="q">?</div>${P.img(k === 'asc' ? 'asc' : k, bodyColor[k], 40)}<div>TAP TO REVEAL ${k === 'asc' ? 'RISING' : B.name.toUpperCase()}</div></div><div class="face front">${front}</div></div></div>`;
    };
    el.innerHTML = `
      <div class="panel hero"><div class="tiny">PLAYER ${S.active + 1}</div><div class="h1">${esc(p.name || 'STARCHILD').toUpperCase()}</div>
        <div class="cls">LV ${Math.max(age, 0)} ${cls.toUpperCase()}</div>
        <div class="small">${new Date(p.y, p.mo - 1, p.d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} \u00B7 ${p.timeKnown ? new Date(2000, 0, 1, p.h, p.mi).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'time unknown'} \u00B7 ${esc(p.place.label)}</div></div>
      ${rev.includes(false) ? '<button class="btn wide" id="revAll">\u2605 REVEAL ALL</button>' : ''}
      <div class="cards">${card('sun', 0)}${card('moon', 1)}${card('asc', 2)}</div>
      <div class="panel"><div class="ptitle">${P.img('sparkle', '#ffcc33', 18)} ELEMENT STATS</div>
        ${statMap.map(([e, s]) => { const v = Math.round(sc[e] / mx * 10); return `<div class="stat"><span>${s} \u00B7 ${e.toUpperCase()}</span><div class="bar" style="--c:${L.ELEMENTS[e].color}">${Array.from({ length: 10 }, (_, k) => `<i class="${k < v ? 'f' : ''}"></i>`).join('')}</div><span>${sc[e]}</span></div>`; }).join('')}
        <p class="small">${u ? `Dominant element: ${dom}. ${{ Fire: 'You are a walking spicy pepper.', Earth: 'You are basically a very confident potato.', Air: 'Your brain has 300 tabs and a fan running.', Water: 'You cry at sunsets and also at spreadsheets.' }[dom]}` : `Dominant element: ${dom} \u2014 ${L.ELEMENTS[dom].desc}`}</p></div>`;
    $$('.card', el).forEach((c) => c.onclick = () => {
      const i = +c.dataset.i; if (rev[i]) { SFX.tap(); return; }
      rev[i] = true; save(); c.classList.add('flipped'); SFX.flip(); setTimeout(() => { SFX.coin(); burstAt(c, 50); if (isU()) shake(); }, 350);
      if (!rev.includes(false)) setTimeout(() => { SFX.levelUp(); flash(); toast(u ? 'BIG 3 UNLOCKED. GOD HELP US.' : 'BIG 3 COMPLETE! \u2605'); const b = $('#revAll'); if (b) b.remove(); }, 900);
    });
    const ra = $('#revAll', el); if (ra) ra.onclick = () => { $$('.card', el).forEach((c, i) => setTimeout(() => !rev[i] && c.click(), i * 450)); };
  }

  const ASPECTS = [
    { n: 'CONJUNCT', a: 0, orb: 8, s: 'blend and amplify each other', u: 'are glued together with mystery adhesive' },
    { n: 'OPPOSITE', a: 180, orb: 8, s: 'pull in opposite directions, seeking balance', u: 'are in a bitter custody battle over the TV remote' },
    { n: 'TRINE', a: 120, orb: 7, s: 'flow together with natural ease', u: 'are best friends who share one brain cell' },
    { n: 'SQUARE', a: 90, orb: 7, s: 'create friction that builds strength', u: 'are fighting in a Waffle House parking lot' },
    { n: 'SEXTILE', a: 60, orb: 5, s: 'offer friendly opportunities', u: 'are mutuals who like each other\u2019s posts' }
  ];
  function chartBodies() {
    const list = [['sun', CH.sun, false], ['moon', CH.moon, false]];
    for (const p of A.PLANETS) list.push([p, CH.planets[p].lon, CH.planets[p].retro]);
    if (CH.timeKnown) { list.push(['asc', CH.asc, false]); list.push(['mc', CH.mc, false]); }
    return list;
  }
  function aspects() {
    const b = chartBodies().filter(([k]) => k !== 'mc'), out = [];
    for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) {
      let d = Math.abs(b[i][1] - b[j][1]); if (d > 180) d = 360 - d;
      for (const as of ASPECTS) { const o = Math.abs(d - as.a); if (o <= as.orb) { out.push({ p1: b[i][0], p2: b[j][0], as, orb: o, l1: b[i][1], l2: b[j][1] }); break; } }
    }
    return out.sort((a, b) => a.orb - b.orb);
  }
  function drawWheel(c) {
    const N = 200; c.width = N; c.height = N; const x = c.getContext('2d'), cx = 100, cy = 100;
    const base = CH.timeKnown ? CH.asc : 0;
    const ang = (lon) => (180 + (lon - base)) * Math.PI / 180; // ASC on the left, counter-clockwise
    const pt = (lon, r) => [cx + Math.cos(ang(lon)) * r, cy - Math.sin(ang(lon)) * r];
    const plot = (px, py, col) => { x.fillStyle = col; x.fillRect(Math.round(px), Math.round(py), 1, 1); };
    const ring = (r, col) => { for (let t = 0; t < 360; t += 0.25) { const [px, py] = pt(t, r); plot(px, py, col); } };
    // sign sectors
    for (let s = 0; s < 12; s++) {
      const col = L.ELEMENTS[SIGN(s).element].color;
      for (let r = 80; r < 96; r += 1) for (let t = s * 30; t < s * 30 + 30; t += 0.6) { const [px, py] = pt(t, r); plot(px, py, ((r + Math.floor(t)) % 3 === 0) ? P.shade(col, -90) : P.shade(col, -130)); }
      const [gx, gy] = pt(s * 30 + 15, 88); P.draw(x, SIGN(s).name, Math.round(gx - 6), Math.round(gy - 6), 1, SIGN(s).color);
      const [lx, ly] = pt(s * 30, 96), [lx2, ly2] = pt(s * 30, 80); for (let k = 0; k <= 16; k++) plot(lx + (lx2 - lx) * k / 16, ly + (ly2 - ly) * k / 16, '#05020d');
    }
    ring(96, '#05020d'); ring(97, '#ffcc33'); ring(80, '#05020d'); ring(79, '#a99bd6'); ring(40, '#5a4a9a');
    // house lines (whole sign)
    if (CH.timeKnown) { const a0 = Math.floor(CH.asc / 30) * 30; for (let h = 0; h < 12; h++) { const [ax, ay] = pt(a0 + h * 30, 79), [bx, by] = pt(a0 + h * 30, 40); for (let k = 0; k <= 40; k += 2) plot(ax + (bx - ax) * k / 40, ay + (by - ay) * k / 40, '#3b2f78'); } }
    // aspect lines
    const colA = { CONJUNCT: '#ffffff', OPPOSITE: '#ff5e5e', TRINE: '#3dd6ff', SQUARE: '#ff5e5e', SEXTILE: '#9dff00' };
    for (const a of aspects()) { if (a.as.n === 'CONJUNCT') continue; const [ax, ay] = pt(a.l1, 39), [bx, by] = pt(a.l2, 39); const n = Math.hypot(bx - ax, by - ay); for (let k = 0; k <= n; k++) plot(ax + (bx - ax) * k / n, ay + (by - ay) * k / n, colA[a.as.n]); }
    // bodies with simple collision spreading
    const bs = chartBodies().map(([k, lon]) => ({ k, lon, d: lon })).sort((a, b) => a.lon - b.lon);
    for (let it = 0; it < 6; it++) for (let i = 0; i < bs.length; i++) { const a = bs[i], b = bs[(i + 1) % bs.length]; let gap = ((b.d - a.d) + 360) % 360; if (gap < 11 && bs.length > 1) { a.d -= (11 - gap) / 2; b.d += (11 - gap) / 2; } }
    for (const b of bs) {
      const [tx, ty] = pt(b.lon, 78); plot(tx, ty, '#ffffff');
      const [gx, gy] = pt(b.d, 64); const rows = P.B[b.k]; const w = rows[0].length, h = rows.length;
      P.draw(x, b.k, Math.round(gx - w / 2), Math.round(gy - h / 2), 1, bodyColor[b.k]);
    }
  }
  function renderChart() {
    const el = $('#v-chart'); if (!CH) return needProfile(el);
    const u = isU(), ascSign = CH.timeKnown ? A.signOf(CH.asc) : null;
    const rows = chartBodies().map(([k, lon, rx]) => {
      const B = L.BODIES[k], si = A.signOf(lon), house = ascSign != null ? ((si - ascSign + 12) % 12) + 1 : null;
      return `<tr data-k="${k}"><td>${P.img(k, bodyColor[k], 26)}</td><td><b>${B.name}</b>${rx ? '<span class="rx">RX</span>' : ''}<div class="small">${B.role}</div></td><td>${signImg(si, 18)} ${SIGN(si).name}<div class="small">${A.fmtDeg(lon)}${house ? ` \u00B7 ${ord(house)} house` : ''}</div></td></tr>`;
    }).join('');
    const asp = aspects().slice(0, 10);
    el.innerHTML = `
      <div class="panel"><div class="ptitle">${P.img('wheel', '#ffcc33', 18)} BIRTH CHART</div><canvas id="wheel" class="pix"></canvas>
        <div class="tiny" style="margin-top:8px">${CH.timeKnown ? 'ASCENDANT ON THE LEFT \u00B7 WHOLE-SIGN HOUSES' : 'NO BIRTH TIME: 0\u00B0 ARIES ON THE LEFT, NO HOUSES'} \u00B7 LINES: <span style="color:#3dd6ff">TRINE</span> <span style="color:#9dff00">SEXTILE</span> <span style="color:#ff5e5e">SQUARE/OPP</span></div></div>
      <div class="panel"><div class="ptitle">${P.img('star', '#3dd6ff', 18)} PARTY MEMBERS</div><table class="pt">${rows}</table><div class="tiny" style="margin-top:6px">TAP A ROW FOR INFO \u00B7 RX = RETROGRADE AT BIRTH</div></div>
      <div class="panel"><div class="ptitle">${P.img('sparkle', '#ff6bd5', 18)} TOP ASPECTS</div><ul class="loglist">${asp.map((a) => `<li><b>${L.BODIES[a.p1].name} ${a.as.n} ${L.BODIES[a.p2].name}</b> <span class="small">(${a.orb.toFixed(1)}\u00B0)</span><br><span class="small">They ${u ? a.as.u : a.as.s}.</span></li>`).join('')}</ul></div>`;
    drawWheel($('#wheel', el));
    $$('tr[data-k]', el).forEach((tr) => tr.onclick = () => { SFX.tap(); const B = L.BODIES[tr.dataset.k]; toast(`${B.name.toUpperCase()}: ${B.blurb}`); });
  }

  function renderCodex() {
    const el = $('#v-codex');
    const mine = CH ? [CH.sunS, CH.moonS, CH.ascS] : [];
    el.innerHTML = `<div class="panel alt"><div class="ptitle">${P.img('book', '#ffcc33', 18)} ZODIAC CODEX</div><div class="small">All 12 signs. Glowing tiles are in your Big 3. Tap one to read its lore.</div></div>
      <div class="grid12">${L.SIGNS.map((s, i) => `<button class="tile ${mine.includes(i) ? 'mine' : ''}" data-i="${i}">${signImg(i, 40)}<div class="tn" style="color:${s.color}">${s.name.toUpperCase()}</div><div class="td">${s.dates}</div></button>`).join('')}</div>`;
    $$('.tile', el).forEach((t) => t.onclick = () => { SFX.tap(); burstAt(t, 16, [SIGN(+t.dataset.i).color, '#ffffff']); openSign(+t.dataset.i); });
  }
  function openSign(i) {
    const s = SIGN(i), u = isU();
    openModal(`<div style="text-align:center">${signImg(i, 88)}<div class="h1" style="color:${s.color}">${s.name.toUpperCase()}</div><div class="tiny">${s.animal.toUpperCase()} \u00B7 ${s.dates.toUpperCase()}</div></div>
      <div class="tags" style="justify-content:center"><span class="tag">${s.element.toUpperCase()}</span><span class="tag">${s.mode.toUpperCase()}</span><span class="tag">RULER: ${s.ruler.toUpperCase()}</span></div>
      <div class="panel"><div class="ptitle">${P.img('sun', '#ffcc33', 16)} SUN IN ${s.name.toUpperCase()}</div><p>${esc(u ? s.sunU : s.sun)}</p></div>
      <div class="panel"><div class="ptitle">${P.img('moon', '#d6e4ff', 16)} MOON IN ${s.name.toUpperCase()}</div><p>${esc(u ? s.moonU : s.moon)}</p></div>
      <div class="panel"><div class="ptitle">${P.img('asc', '#3dd6ff', 16)} ${s.name.toUpperCase()} RISING</div><p>${esc(u ? s.risingU : s.rising)}</p></div>
      <div class="panel"><div class="ptitle">${P.img('heart', '#ff6b9d', 16)} ${u ? 'WILL TOLERATE' : 'BEST MATCHES'}</div><div class="row">${s.best.map((b) => { const k = L.SIGNS.findIndex((x) => x.name === b); return `<span class="chip">${signImg(k, 16)}${b.toUpperCase()}</span>`; }).join('')}</div></div>
      <div class="row"><button class="btn grow" id="readIt">READ TODAY</button><button class="btn sec grow" id="closeM">CLOSE</button></div>`);
    $('#readIt').onclick = () => { S.pick = i; save(); closeModal(); go('today'); };
    $('#closeM').onclick = () => { SFX.tap(); closeModal(); };
  }

  function renderMe() {
    const el = $('#v-me'), st = S.settings;
    const slot = (p, i) => p ? (() => {
      const c = A.chart({ y: p.y, mo: p.mo, d: p.d, h: p.timeKnown ? p.h : 12, mi: p.timeKnown ? p.mi : 0, lat: p.place.lat, lon: p.place.lon, tz: p.place.tz, timeKnown: p.timeKnown });
      return `<div class="slot ${S.active === i ? 'on' : ''}" data-i="${i}"><div class="grow"><div class="sl">SLOT ${i + 1}${S.active === i ? ' \u00B7 ACTIVE' : ''}</div><div class="nm">${esc(p.name || 'STARCHILD').toUpperCase()}</div>
        <div class="row small">${signImg(A.signOf(c.sun), 16)}${signImg(A.signOf(c.moon), 16)}${p.timeKnown ? signImg(A.signOf(c.asc), 16) : '?'} <span>${SIGN(A.signOf(c.sun)).name} \u00B7 ${SIGN(A.signOf(c.moon)).name} \u00B7 ${p.timeKnown ? SIGN(A.signOf(c.asc)).name : '???'}</span></div></div>
        <button class="btn sec" data-e="${i}">EDIT</button></div>`;
    })() : `<div class="slot" data-n="${i}"><div class="grow"><div class="sl">SLOT ${i + 1}</div><div class="nm">-- EMPTY --</div><div class="small">Add a friend, partner, or nemesis.</div></div><button class="btn" data-n="${i}">NEW</button></div>`;
    const tg = (k, label) => `<div class="toggle" data-t="${k}"><span>${label}</span><div class="sw ${st[k] ? 'on' : ''}"></div></div>`;
    el.innerHTML = `<div class="panel alt"><div class="ptitle">${P.img('user', '#ffcc33', 18)} SAVE FILES</div>${S.slots.map(slot).join('')}</div>
      <div class="panel"><div class="ptitle">${P.img('note', '#3dd6ff', 18)} OPTIONS</div>${tg('sound', 'Sound effects')}${tg('music', 'Chiptune music')}${tg('crt', 'CRT scanlines')}${tg('shake', 'Screen shake')}
        <p class="small" style="margin-top:10px">iPhone tip: if you hear nothing, flip off the silent switch.</p></div>
      <div class="panel"><div class="ptitle">${P.img('sparkle', '#ff6bd5', 18)} ABOUT</div>
        <p class="small">Sun, Moon, Rising and planets are calculated on your phone with real astronomical formulas (Meeus + JPL orbital elements), so charts work fully offline. Daily serious readings pull from free, key-less horoscope APIs when online, and fall back to Astro\u2019s own engine using today\u2019s real Moon and planet positions. Unhinged mode is 100% homegrown nonsense.</p>
        <p class="tiny">FOR ENTERTAINMENT. THE STARS ARE NOT LEGALLY BINDING.</p></div>`;
    $$('.slot[data-i]', el).forEach((s) => s.onclick = (e) => {
      const i = +s.dataset.i; if (e.target.dataset.e != null) { SFX.tap(); return openEditor(+e.target.dataset.e); }
      if (S.active !== i) { S.active = i; S.pick = 'sun'; save(); computeChart(); SFX.coin(); burstAt(s, 30); toast(`PLAYER ${i + 1} SELECTED`); renderMe(); }
    });
    $$('[data-n]', el).forEach((b) => b.onclick = (e) => { e.stopPropagation(); SFX.coin(); openEditor(+b.dataset.n); });
    $$('.toggle', el).forEach((t) => t.onclick = () => {
      const k = t.dataset.t; st[k] = !st[k]; save(); SFX.init(); SFX.tap(); applySettings(); renderMe();
    });
  }

  /* ---------------- editor ---------------- */
  function tzList() { try { return Intl.supportedValuesOf('timeZone'); } catch (e) { return [...new Set(window.CITIES.map((c) => c[4]))].sort(); } }
  const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function openEditor(i) {
    const p = S.slots[i] || { id: 'p' + Date.now(), name: '', y: 1995, mo: 1, d: 1, h: 12, mi: 0, timeKnown: true, place: null };
    let place = p.place ? { ...p.place } : null;
    const dv = `${String(p.y).padStart(4, '0')}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
    const tv = `${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`;
    openModal(`<div class="h1" style="text-align:center">${S.slots[i] ? 'EDIT CHARACTER' : '\u2605 NEW GAME \u2605'}</div><div class="tiny" style="text-align:center">SLOT ${i + 1}</div>
      <label class="f">NAME</label><input class="inp" id="eName" maxlength="20" placeholder="Starchild" value="${esc(p.name)}">
      <label class="f">BIRTHDAY</label><input class="inp" type="date" id="eDate" value="${dv}" min="1800-01-01" max="2050-12-31">
      <label class="f">BIRTH TIME</label><input class="inp" type="time" id="eTime" value="${tv}" ${p.timeKnown ? '' : 'disabled'}>
      <label class="check"><input type="checkbox" id="eUnk" ${p.timeKnown ? '' : 'checked'}> I don\u2019t know my birth time</label>
      <label class="f">BIRTH PLACE</label><div class="row"><input class="inp grow" id="eQ" placeholder="City (e.g. St. Louis)" style="width:auto"><button class="btn" id="eGo">FIND</button></div>
      <div class="results" id="eRes"></div><div class="picked" id="ePick"></div>
      <details style="margin-top:10px"><summary class="tiny">MANUAL COORDINATES</summary>
        <div class="row"><input class="inp grow" id="eLat" inputmode="decimal" placeholder="Latitude" style="width:40%"><input class="inp grow" id="eLon" inputmode="decimal" placeholder="Longitude (W = -)" style="width:40%"></div>
        <select class="inp" id="eTz" style="margin-top:8px">${tzList().map((z) => `<option>${z}</option>`).join('')}</select>
        <button class="btn sec wide" id="eMan" style="margin-top:8px">USE THESE</button></details>
      <div class="row" style="margin-top:16px"><button class="btn grow" id="eSave">\u2605 SAVE</button>${S.slots[i] ? '<button class="btn danger" id="eDel">DELETE</button>' : ''}${prof() ? '<button class="btn sec" id="eX">CANCEL</button>' : ''}</div>`);
    const showPick = () => { $('#ePick').innerHTML = place ? `\uD83D\uDCCD ${esc(place.label)}<br><span class="small">${place.lat.toFixed(3)}, ${place.lon.toFixed(3)} \u00B7 ${place.tz}</span>` : '<span class="small">No place picked yet.</span>'; };
    showPick();
    $('#eUnk').onchange = (e) => { SFX.tap(); $('#eTime').disabled = e.target.checked; };
    const choose = (pl) => { place = pl; SFX.coin(); $('#eRes').innerHTML = ''; showPick(); };
    const search = async () => {
      const q = $('#eQ').value.trim(); if (!q) return; SFX.tap(); $('#eRes').innerHTML = '<div class="small">Scanning the globe...</div>';
      const sq = strip(q), list = window.CITIES.filter((c) => strip(c[0]).includes(sq) || strip(c[0] + ', ' + c[1]).includes(sq)).map((c) => ({ label: `${c[0]}, ${c[1]}`, lat: c[2], lon: c[3], tz: c[4] }));
      if (navigator.onLine) {
        try {
          const j = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.split(',')[0])}&count=10&language=en&format=json`);
          for (const r of (j.results || [])) { if (!r.timezone) continue; const label = [r.name, r.admin1, r.country_code].filter(Boolean).join(', '); if (!list.some((x) => Math.abs(x.lat - r.latitude) < 0.2 && Math.abs(x.lon - r.longitude) < 0.2)) list.push({ label, lat: r.latitude, lon: r.longitude, tz: r.timezone }); }
        } catch (e) {}
      }
      if (!list.length) { SFX.error(); $('#eRes').innerHTML = '<div class="small">No matches. Try a bigger nearby city, or use manual coordinates.</div>'; return; }
      $('#eRes').innerHTML = list.slice(0, 10).map((x, k) => `<button data-k="${k}">${esc(x.label)} <span class="small">${x.tz}</span></button>`).join('');
      $$('#eRes button').forEach((b) => b.onclick = () => choose(list[+b.dataset.k]));
    };
    $('#eGo').onclick = search; $('#eQ').onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } };
    if (place) { $('#eLat').value = place.lat; $('#eLon').value = place.lon; $('#eTz').value = place.tz; }
    else { try { $('#eTz').value = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {} }
    $('#eMan').onclick = () => {
      const la = parseFloat($('#eLat').value), lo = parseFloat($('#eLon').value);
      if (!(la >= -90 && la <= 90 && lo >= -180 && lo <= 180)) { SFX.error(); return toast('CHECK LAT / LON'); }
      choose({ label: `${la.toFixed(2)}, ${lo.toFixed(2)}`, lat: la, lon: lo, tz: $('#eTz').value });
    };
    if ($('#eX')) $('#eX').onclick = () => { SFX.tap(); closeModal(); };
    if ($('#eDel')) $('#eDel').onclick = () => {
      if (!confirm('Delete this save file?')) return;
      SFX.glitch(); shake(); S.slots[i] = null; if (S.active === i) S.active = S.slots.findIndex(Boolean) >= 0 ? S.slots.findIndex(Boolean) : 0; save(); computeChart(); closeModal(); render();
      if (!prof()) openEditor(S.active);
    };
    $('#eSave').onclick = () => {
      const [y, mo, d] = ($('#eDate').value || '').split('-').map(Number);
      if (!y || !mo || !d) { SFX.error(); return toast('PICK A BIRTHDAY'); }
      if (y < 1800 || y > 2050) { SFX.error(); return toast('YEARS 1800\u20132050 ONLY'); }
      if (!place) { SFX.error(); return toast('PICK A BIRTH PLACE'); }
      const unk = $('#eUnk').checked, [h, mi] = ($('#eTime').value || '12:00').split(':').map(Number);
      const isNew = !S.slots[i];
      const changed = !isNew && (S.slots[i].y !== y || S.slots[i].mo !== mo || S.slots[i].d !== d || S.slots[i].h !== h || S.slots[i].mi !== mi || S.slots[i].timeKnown === unk || S.slots[i].place.lat !== place.lat);
      S.slots[i] = { id: p.id, name: $('#eName').value.trim(), y, mo, d, h: unk ? 12 : h, mi: unk ? 0 : mi, timeKnown: !unk, place };
      if (isNew || changed) S.big3[p.id] = [false, false, false];
      S.active = i; S.pick = 'sun'; save(); computeChart(); closeModal();
      SFX.levelUp(); flash(); burst(W / 2, H / 2, 90); shoot(4);
      toast(isNew ? 'CHARACTER CREATED! REVEAL YOUR BIG 3' : 'SAVED \u2605');
      go('big3');
    };
  }

  /* ---------------- shell ---------------- */
  function openModal(html) { $('#sheet').innerHTML = html; $('#modal').classList.add('on'); $('#sheet').scrollTop = 0; }
  function closeModal() { $('#modal').classList.remove('on'); }
  $('#modal').onclick = (e) => { if (e.target.id === 'modal' && prof()) closeModal(); };
  function go(v) { view = v; main.scrollTop = 0; render(); }
  $$('#nav button').forEach((b) => b.onclick = () => { SFX.init(); if (view !== b.dataset.v) SFX.nav(); go(b.dataset.v); });
  $$('#nav [data-i]').forEach((s) => s.outerHTML = P.img(s.dataset.i, '#ffcc33', 24));
  function applySettings() {
    document.body.classList.toggle('unhinged', isU()); document.body.classList.toggle('crt', S.settings.crt);
    $('#sndBtn').innerHTML = P.img(S.settings.sound ? 'sound' : 'mute', S.settings.sound ? '#3dd6ff' : '#a99bd6', 22);
    $$('#mode button').forEach((b) => b.classList.toggle('on', b.dataset.m === S.settings.mode));
    if (S.settings.music && S.settings.sound) MUSIC.start(); else MUSIC.stop();
    document.querySelector('meta[name=theme-color]').content = isU() ? '#1a0410' : '#0b0618';
  }
  $$('#mode button').forEach((b) => b.onclick = () => {
    SFX.init(); const m = b.dataset.m; if (m === S.settings.mode) return SFX.tap();
    S.settings.mode = m; save(); applySettings();
    if (m === 'unhinged') { SFX.glitch(); shake(); flash('#ff2fa8'); burst(W - 90, 40, 60); toast(pick(Math.random, ['UNHINGED MODE: THE STARS HAD 4 ESPRESSOS', 'UNHINGED MODE: MERCURY HAS LEFT THE CHAT', 'UNHINGED MODE: NO REFUNDS'])); }
    else { SFX.chime(); flash('#c7f2ff'); toast('SERIOUS MODE: THE STARS PUT ON A TIE'); }
    render();
  });
  $('#sndBtn').onclick = () => { SFX.init(); S.settings.sound = !S.settings.sound; save(); applySettings(); SFX.tap(); if (view === 'me') renderMe(); };
  $('#logo').onclick = () => { SFX.init(); SFX.star(); shoot(6); burstAt($('#logo'), 25); };

  // boot
  $('#boot').onclick = () => {
    SFX.init(); SFX.boot(); flash(); $('#boot').classList.add('gone'); setTimeout(() => $('#boot').remove(), 600);
    applySettings();
    if (!prof()) { const k = S.slots.findIndex(Boolean); if (k >= 0) { S.active = k; computeChart(); } }
    if (!prof()) setTimeout(() => openEditor(S.active), 450);
  };

  window.addEventListener('resize', orient);
  window.addEventListener('orientationchange', () => setTimeout(orient, 120));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && view === 'today') renderToday(); });
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  computeChart(); applySettings(); orient(); resize(); go('today'); loop();
})();
