/* ASTRO — offline astronomy engine
   Sun & Moon: Meeus "Astronomical Algorithms" (ch. 25 & 47)
   Planets: JPL approximate Keplerian elements (valid 1800–2050)
   Ascendant/MC: standard spherical astronomy */
(function (global) {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const norm = (x) => ((x % 360) + 360) % 360;
  const sin = (d) => Math.sin(d * D2R), cos = (d) => Math.cos(d * D2R), tan = (d) => Math.tan(d * D2R);

  function julianDay(ms) { return ms / 86400000 + 2440587.5; }

  // ΔT (TT-UT) in seconds — Espenak & Meeus polynomial approximations
  function deltaT(year) {
    const y = year;
    if (y < 1900) return 0;
    if (y < 1920) { const t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
    if (y < 1941) { const t = y - 1920; return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3; }
    if (y < 1961) { const t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547; }
    if (y < 1986) { const t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
    if (y < 2005) { const t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
    if (y < 2050) { const t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
    return 93;
  }

  function nutationLon(T) {
    const Om = 125.04452 - 1934.136261 * T;
    const L = 280.4665 + 36000.7698 * T, Lp = 218.3165 + 481267.8813 * T;
    return (-17.20 * sin(Om) - 1.32 * sin(2 * L) - 0.23 * sin(2 * Lp) + 0.21 * sin(2 * Om)) / 3600;
  }
  function obliquity(T) {
    const Om = 125.04452 - 1934.136261 * T;
    const e0 = 23.439291111 - 0.0130041667 * T - 1.639e-7 * T * T + 5.036e-7 * T ** 3;
    return e0 + 0.00256 * cos(Om);
  }

  function sunLon(T) {
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    const Om = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * sin(Om));
  }

  const MOON_TERMS = [
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],
    [2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
    [0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],
    [4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
    [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
    [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
    [2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],[2,1,1,0,-810],[4,-1,-2,0,759],
    [0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
    [4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],
    [4,0,-3,0,330],[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]
  ];
  function moonLon(T) {
    const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
    const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000;
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;
    let s = 0;
    for (const [d, m, mp, f, c] of MOON_TERMS) {
      let k = c; if (Math.abs(m) === 1) k *= E; else if (Math.abs(m) === 2) k *= E * E;
      s += k * sin(d * D + m * M + mp * Mp + f * F);
    }
    s += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    return norm(Lp + s / 1e6 + nutationLon(T));
  }

  // JPL approximate elements: a, e, I, L, longPeri, longNode ; then rates per century
  const ELEM = {
    mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    venus:   [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
    earth:   [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    mars:    [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    saturn:  [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
    uranus:  [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503, -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
    neptune: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.01262724],
    pluto:   [39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684, -0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]
  };
  function helio(name, T) {
    const el = ELEM[name];
    const a = el[0] + el[6] * T, e = el[1] + el[7] * T, I = el[2] + el[8] * T;
    const L = el[3] + el[9] * T, wbar = el[4] + el[10] * T, Om = el[5] + el[11] * T;
    const w = wbar - Om; let M = norm(L - wbar); if (M > 180) M -= 360;
    let E = M + R2D * e * sin(M);
    for (let i = 0; i < 12; i++) { const dM = M - (E - R2D * e * sin(E)); E += dM / (1 - e * cos(E)); }
    const xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
    const x = (cos(w) * cos(Om) - sin(w) * sin(Om) * cos(I)) * xp + (-sin(w) * cos(Om) - cos(w) * sin(Om) * cos(I)) * yp;
    const y = (cos(w) * sin(Om) + sin(w) * cos(Om) * cos(I)) * xp + (-sin(w) * sin(Om) + cos(w) * cos(Om) * cos(I)) * yp;
    const z = (sin(w) * sin(I)) * xp + (cos(w) * sin(I)) * yp;
    return [x, y, z];
  }
  function planetLon(name, T) {
    const p = helio(name, T), e = helio('earth', T);
    const lonJ2000 = norm(Math.atan2(p[1] - e[1], p[0] - e[0]) * R2D);
    return norm(lonJ2000 + 1.396971 * T + 0.0003086 * T * T + nutationLon(T)); // precess to date
  }
  function isRetro(name, T) {
    const dt = 0.5 / 36525;
    let d = planetLon(name, T + dt) - planetLon(name, T - dt);
    if (d > 180) d -= 360; if (d < -180) d += 360;
    return d < 0;
  }

  function angles(jdUT, T, lat, lon) {
    const eps = obliquity(T);
    const d = jdUT - 2451545.0, Tu = d / 36525;
    const gmst = norm(280.46061837 + 360.98564736629 * d + 0.000387933 * Tu * Tu - Tu ** 3 / 38710000);
    const ramc = norm(gmst + lon + nutationLon(T) * cos(eps));
    const asc = norm(Math.atan2(cos(ramc), -(sin(ramc) * cos(eps) + tan(lat) * sin(eps))) * R2D);
    const mc = norm(Math.atan2(sin(ramc), cos(ramc) * cos(eps)) * R2D);
    return { asc, mc, ramc, eps };
  }

  // ---- time zone helpers (uses the device's built-in time zone database; works offline)
  function tzOffsetMin(zone, utcMs) {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const p = {}; for (const x of f.formatToParts(new Date(utcMs))) p[x.type] = x.value;
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return Math.round((asUTC - Math.floor(utcMs / 1000) * 1000) / 60000);
  }
  function localToUTC(y, mo, d, h, mi, zone) {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    if (!zone) return guess;
    try {
      let off = tzOffsetMin(zone, guess);
      let utc = guess - off * 60000;
      const off2 = tzOffsetMin(zone, utc);
      if (off2 !== off) utc = guess - off2 * 60000;
      return utc;
    } catch (e) { return guess; }
  }

  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const signOf = (lon) => Math.floor(norm(lon) / 30);
  const degIn = (lon) => norm(lon) % 30;
  function fmtDeg(lon) { const d = degIn(lon); let deg = Math.floor(d), min = Math.round((d - deg) * 60); if (min === 60) { deg++; min = 0; } return `${deg}°${String(min).padStart(2, '0')}'`; }

  function tFromUTC(utcMs) {
    const jd = julianDay(utcMs);
    const y = new Date(utcMs).getUTCFullYear();
    const jde = jd + deltaT(y) / 86400;
    return { jd, jde, T: (jde - 2451545.0) / 36525 };
  }

  function moonPhase(T) {
    const el = norm(moonLon(T) - sunLon(T));
    const names = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
    const idx = Math.floor(norm(el + 22.5) / 45) % 8;
    return { elong: el, idx, name: names[idx], illum: (1 - cos(el)) / 2 };
  }

  const PLANETS = ['mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];

  function chart(b) {
    // b: {y,mo,d,h,mi,lat,lon,tz,timeKnown}
    const utc = localToUTC(b.y, b.mo, b.d, b.h, b.mi, b.tz);
    const { jd, T } = tFromUTC(utc);
    const sun = sunLon(T), moon = moonLon(T);
    const ang = angles(jd, T, Math.max(-66, Math.min(66, b.lat)), b.lon);
    const pl = {};
    for (const p of PLANETS) pl[p] = { lon: planetLon(p, T), retro: isRetro(p, T) };
    // moon ambiguity when birth time unknown
    let moonRange = null;
    if (!b.timeKnown) {
      const a = moonLon(tFromUTC(localToUTC(b.y, b.mo, b.d, 0, 0, b.tz)).T);
      const z = moonLon(tFromUTC(localToUTC(b.y, b.mo, b.d, 23, 59, b.tz)).T);
      if (signOf(a) !== signOf(z)) moonRange = [signOf(a), signOf(z)];
    }
    const phase = moonPhase(T);
    return { utc, jd, T, sun, moon, asc: ang.asc, mc: ang.mc, planets: pl, moonRange, phase, timeKnown: !!b.timeKnown };
  }

  function sky(ms) {
    const { T } = tFromUTC(ms);
    const pl = {}; for (const p of PLANETS) pl[p] = { lon: planetLon(p, T), retro: isRetro(p, T) };
    return { sun: sunLon(T), moon: moonLon(T), phase: moonPhase(T), planets: pl };
  }

  global.AstroCalc = { chart, sky, signOf, degIn, fmtDeg, SIGNS, PLANETS, localToUTC, tzOffsetMin, sunLon, moonLon, planetLon, angles, tFromUTC, norm };
})(typeof window !== 'undefined' ? window : globalThis);
