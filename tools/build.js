// Build data/atlas.js for the Assam Through Time page.
// Reads data/polities.csv, data/territories.csv, data/events.csv, data/extra-places.csv,
// the realm and place rows of data/assam_history.csv and the shapes in data/maps/.
// Every year from START to END gets a map: the set of territories active that year,
// with higher-priority territories (z, then row order) cut out of lower ones.
// Run: node tools/build.js
const fs = require('fs');
const path = require('path');
const pc = require('./lib/polygon-clipping.umd.min.js');

const ROOT = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^﻿/, '');
const START = 350, END = 2026;

function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f.replace(/\r$/, '')); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

/* ---------- inputs ---------- */
const history = parseCSV(rd('data/assam_history.csv'));
const polities = parseCSV(rd('data/polities.csv')).map(p => ({ ...p, color: p.color.replace(/\s/g, '') }));
const territories = parseCSV(rd('data/territories.csv'));
const events = parseCSV(rd('data/events.csv'));
const ratnaPhases = parseCSV(rd('data/paundravardhana-map-phases.csv'));
const postPala = JSON.parse(rd('data/kamarupa-after-palas.json'));
const growth = JSON.parse(rd('data/medieval-growth.json'));
const BENGAL = JSON.parse(rd('data/maps/bengal-districts.json'));
const sankardeva = JSON.parse(rd('data/sankardeva-routes.json'));
const A = JSON.parse(rd('data/maps/assam.json'));
const NB = JSON.parse(rd('data/maps/neighbours.json'));
const NE = JSON.parse(rd('data/maps/northeast.json'));
const colonial = JSON.parse(rd('data/colonial-stages.json'));
const CR = JSON.parse(rd('data/maps/colonial-regions.json'));

const realmById = {}, placeById = {};
for (const r of history) {
  if (r.type === 'realm') realmById[r.id] = r;
  if (r.type === 'place' && r.lat) placeById[r.id] = { name: r.name, geo: [+r.lat, +r.lon] };
}
for (const r of parseCSV(rd('data/extra-places.csv'))) placeById[r.id] = { name: r.name, geo: [+r.lat, +r.lon] };

/* ---------- projection (equirectangular, scaled at 26°N) ---------- */
// Include the Mong Mao / western Yunnan origin of the 1215–1228 journey.
const lat0 = 20.5, lat1 = 29.5, lon0 = 85.6, lon1 = 98.7, W = 1200;
const kCos = Math.cos(26 * Math.PI / 180);
const H = Math.round(W * (lat1 - lat0) / ((lon1 - lon0) * kCos));
const X = lon => +((lon - lon0) / (lon1 - lon0) * W).toFixed(1);
const Y = lat => +((lat1 - lat) / (lat1 - lat0) * H).toFixed(1);

/* ---------- geometry helpers (polygon-clipping uses [lon, lat]) ---------- */
const toPC = rg => { const c = rg.map(([la, lo]) => [lo, la]); c.push(c[0]); return [c]; };
const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };
const fillHoles = mp => mp.map(poly => [poly[0]]);
const union = list => { const g = list.filter(m => m && m.length); return g.length ? safe(() => pc.union(...g), g[0]) : []; };
const FRAME = [[[[lon0, lat0], [lon1, lat0], [lon1, lat1], [lon0, lat1], [lon0, lat0]]]];

const clipHP = (pts, axis, v, hi) => {
  const inside = p => hi ? p[axis] >= v : p[axis] <= v, out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) { const f = (v - a[axis]) / (b[axis] - a[axis]); out.push([a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])]); }
  }
  return out;
};
const clipBox = (ring, la0, la1, lo0, lo1) => [[0, la0, true], [0, la1, false], [1, lo0, true], [1, lo1, false]].reduce((r, [ax, v, hi]) => r.length ? clipHP(r, ax, v, hi) : r, ring);

/* ---------- named land ---------- */
const HILLS = ['karbi-anglong', 'west-karbi-anglong', 'dima-hasao'], BARAK = ['cachar', 'hailakandi', 'karimganj'];
const JAINTIA = JSON.parse(rd('data/maps/jaintia-hills.json'));
const parsePoly = s => s.split(';').map(p => p.trim().split(/\s+/).map(Number));
const ringsMP = rings => union(rings.filter(r => r.length > 2).map(toPC));
const landCache = {};
function landNamed(name) {
  if (landCache[name]) return landCache[name];
  let mp;
  if (BENGAL.groups[name]) mp = union(BENGAL.groups[name].map(landNamed));
  else if (CR.groups[name]) mp = union(CR.groups[name].map(id => landNamed('ref-' + id)));
  else if (name.startsWith('ref-') && CR.districts[name.slice(4)]) mp = ringsMP(CR.districts[name.slice(4)].rings);
  else if (name === 'matak-country') mp = limitsShape(['lon:90', 'place:sadiya', 'river:brahmaputra', 'river:dihing']);
  else if (name.startsWith('wb-') && BENGAL.westBengal[name.slice(3)]) mp = ringsMP(BENGAL.westBengal[name.slice(3)].rings);
  else if (name.startsWith('bd-') && BENGAL.bangladesh[name.slice(3)]) mp = pc.intersection(ringsMP(BENGAL.bangladesh[name.slice(3)].rings), ringsMP(NB.countries.Bangladesh));
  else if (A.districts[name]) mp = ringsMP(A.districts[name].rings);
  else if (name === 'valley') mp = union(Object.entries(A.districts).filter(([id]) => !HILLS.includes(id) && !BARAK.includes(id)).map(([id]) => landNamed(id)));
  else if (NE.regions[name]) mp = ringsMP(NE.regions[name].rings);
  else if (name === 'bangladesh') mp = ringsMP(NB.countries.Bangladesh);
  else if (name === 'jaintia') mp = pc.difference(pc.intersection(ringsMP(JAINTIA.rings), landNamed('meghalaya')), landNamed('assam'), union(Object.keys(A.districts).map(landNamed)));
  else throw new Error('unknown land: ' + name);
  return landCache[name] = fillHoles(mp);
}
// Land used by the river-limit shapes: the Assam plains, plus north Bengal and Bangladesh for the western kingdoms.
function limitLand(plain) {
  const key = 'limit' + (plain ? '+' : '');
  if (landCache[key]) return landCache[key];
  const parts = [landNamed('valley')];
  if (plain) {
    (NB.countries.India || []).flatMap(rg => [clipBox(rg, 25.4, 27.0, 87.5, 89.95), clipBox(rg, 26.05, 27.0, 89.9, 90.2)]).filter(x => x.length > 2).forEach(rg => parts.push(toPC(rg)));
    (NB.countries.Bangladesh || []).map(rg => clipBox(rg, 24.0, 26.8, 87.5, 92.6)).filter(x => x.length > 2).forEach(rg => parts.push(toPC(rg)));
  }
  return landCache[key] = fillHoles(union(parts));
}

/* ---------- limits (rivers, places, lat/lon lines), as on the earlier map ---------- */
function limitOf(spec) {
  if (!spec) return null;
  if (spec.includes('>')) { const ps = spec.split('>').map(limitOf).filter(Boolean); return ps.length ? { chain: ps } : null; }
  const [kind, id] = spec.split(':');
  if (kind === 'river' && A.rivers[id]) return { line: A.rivers[id].pts, name: A.rivers[id].name };
  if (kind === 'ridge' && A.ridges[id]) return { line: A.ridges[id], name: id };
  if (kind === 'place' && placeById[id]) return { lon: placeById[id].geo[1], lat: placeById[id].geo[0] };
  if (kind === 'lon') return { lon: +id };
  if (kind === 'lat') return { lat: +id };
  throw new Error('unknown limit: ' + spec);
}
function curveAt(l, ax, v) {
  if (l.chain) {
    const f = l.chain[0], k = ax === 0 ? 0 : 1;
    return f.line && v < Math.min(...f.line.map(p => p[k])) && l.chain[1] ? curveAt(l.chain[1], ax, v) : curveAt(f, ax, v);
  }
  if (ax === 1 && l.name === 'Brahmaputra' && v < 90.05) v = 90.05;
  if (!l.line) return ax === 0 ? l.lon : (l.lat ?? l.lon);
  const k = ax === 0 ? 0 : 1, o = 1 - k, hits = [], ln = ax === 1 && l.name === 'Brahmaputra' ? l.line.filter(p => p[0] >= 25.6) : l.line;
  for (let i = 0; i < ln.length - 1; i++) {
    const a = ln[i], b = ln[i + 1];
    if ((a[k] - v) * (b[k] - v) <= 0 && a[k] !== b[k]) hits.push(a[o] + (b[o] - a[o]) * (v - a[k]) / (b[k] - a[k]));
  }
  if (hits.length) return hits.reduce((s, x) => s + x, 0) / hits.length;
  return ln.reduce((best, p) => Math.abs(p[k] - v) < Math.abs(best[k] - v) ? p : best)[o];
}
// Clip against the actual river vertices, preserving bends shared by the base layer.
function riverMask(spec, axis, high) {
  const id = spec?.startsWith('river:') && !spec.includes('>') ? spec.slice(6) : null;
  if (!id || !A.rivers[id]) return null;
  // The Bangladesh-to-Bay tail doubles back in longitude; it cannot bound an Assam north/south bank.
  // Use the same Assam reach as curveAt, preserving every stored vertex on that reach.
  const reach = id === 'brahmaputra' && axis === 1 ? A.rivers[id].pts.filter(([lat]) => lat >= 25.6) : A.rivers[id].pts;
  let pts = reach.map(([lat, lon]) => [lon, lat]);
  const along = axis === 0 ? 1 : 0;
  if (pts[0][along] > pts.at(-1)[along]) pts.reverse();
  const lo = axis === 0 ? lat0 - 8 : lon0 - 8, hi = axis === 0 ? lat1 + 8 : lon1 + 8;
  const edge = high ? (axis === 0 ? lon1 + 8 : lat1 + 8) : (axis === 0 ? lon0 - 8 : lat0 - 8);
  const a = [...pts[0]], b = [...pts.at(-1)]; a[along] = lo; b[along] = hi;
  const c = [...b], d = [...a]; c[axis] = edge; d[axis] = edge;
  return [[ [a, ...pts, b, c, d, a] ]];
}
function limitsShape([ws, es, ns, ss]) {
  const w = limitOf(ws), e = limitOf(es), n = limitOf(ns), s = limitOf(ss);
  const plain = (w ? curveAt(w, 0, 26) : 99) < 90.4 || (!w && e && curveAt(e, 0, 26) < 92);
  const west = [], east = [], south = [], north = [];
  for (let la = 21.5; la <= 30; la += 0.02) {
    west.push([w ? curveAt(w, 0, la) : e ? curveAt(e, 0, la) - 1.7 : lon0 - 1, la]);
    east.push([e ? curveAt(e, 0, la) : w ? curveAt(w, 0, la) + 1.7 : lon1 + 1, la]);
  }
  for (let lo = 87; lo <= 98.4; lo += 0.03) {
    south.push([lo, s ? curveAt(s, 1, lo) : plain ? 24.75 : 21]);
    north.push([lo, n ? curveAt(n, 1, lo) : 31]);
  }
  const close = pts => [[...pts, pts[0]]];
  const region = close([...west, ...east.reverse()]), band = close([...south, ...north.reverse()]);
  const fallback = [region, band];
  // A shared trace is used for each river side; coordinate/compound limits retain
  // their existing envelope. This avoids separate near-river sketch lines.
  const wm = riverMask(ws, 0, true), em = riverMask(es, 0, false);
  const nm = riverMask(ns, 1, false), sm = riverMask(ss, 1, true);
  const vertical = wm || em ? [wm || close([...west, [lon1 + 8, 30], [lon1 + 8, 21.5]]), em || close([[lon0 - 8, 21.5], [lon0 - 8, 30], ...east])] : [region];
  const horizontal = nm || sm ? [nm || close([...north, [87, 15], [98.4, 15]]), sm || close([...south, [98.4, 38], [87, 38]])] : [band];
  return safe(() => fillHoles(pc.intersection(limitLand(plain), ...vertical, ...horizontal)), []);
}

function termShape(term, expandEasternAssam = false) {
  const i = term.indexOf(':'), kind = term.slice(0, i), arg = term.slice(i + 1);
  if (kind === 'realm') {
    const r = realmById[arg]; if (!r) throw new Error('unknown realm ' + arg);
    return limitsShape([r.limit_west, expandEasternAssam && r.limit_east === 'place:sadiya' ? 'lon:98.7' : r.limit_east, r.limit_north, r.limit_south]);
  }
  if (kind === 'limits') return limitsShape(arg.split('|').map((v,i) => expandEasternAssam && i === 1 && v === 'place:sadiya' ? 'lon:98.7' : v));
  if (kind === 'land') return union(arg.split(',').map(s => landNamed(s.trim())));
  if (kind === 'poly') return ringsMP([parsePoly(arg)]);
  // Symbolic locality patches, not surveyed territorial borders. Radii are degrees.
  if (kind === 'patch') {
    const [lat, lon, rx, ry] = arg.split('|').map(Number);
    return ringsMP([Array.from({ length: 40 }, (_, j) => {
      const a = j * Math.PI / 20;
      return [lat + Math.sin(a) * ry, lon + Math.cos(a) * rx];
    })]);
  }
  throw new Error('unknown shape term ' + term);
}

/* ---------- simplification, area, label point ---------- */
function dp(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, z] = st.pop(), [ax, ay] = pts[a], [zx, zy] = pts[z], dx = zx - ax, dy = zy - ay, L = Math.hypot(dx, dy);
    let best = 0, bi = -1;
    for (let i = a + 1; i < z; i++) {
      const d = L ? Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / L : Math.hypot(pts[i][0] - ax, pts[i][1] - ay);
      if (d > best) { best = d; bi = i; }
    }
    if (best > tol) { keep[bi] = 1; st.push([a, bi], [bi, z]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const ringArea = r => { // km², signed-free
  let s = 0; const c = Math.cos(r[0][1] * Math.PI / 180);
  for (let i = 0; i < r.length - 1; i++) s += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
  return Math.abs(s) / 2 * 111.32 * c * 110.57;
};
const mpArea = mp => mp.reduce((s, poly) => s + ringArea(poly[0]) - poly.slice(1).reduce((t, h) => t + ringArea(h), 0), 0);
function inside(pt, ring) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function labelPoint(mp) { // a well-inside point of the largest polygon (in projected units)
  const big = mp.map(p => p[0]).sort((a, b) => ringArea(b) - ringArea(a))[0];
  if (!big) return null;
  const pr = big.map(([lo, la]) => [X(lo), Y(la)]);
  const xs = pr.map(p => p[0]), ys = pr.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let best = null, bd = -1; const N = 40;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const p = [x0 + (x1 - x0) * i / N, y0 + (y1 - y0) * j / N];
    if (!inside(p, pr)) continue;
    let d = Infinity; for (let k = 0; k < pr.length - 1; k++) d = Math.min(d, segDist(p, pr[k], pr[k + 1]));
    d -= Math.hypot(p[0] - (x0 + x1) / 2, p[1] - (y0 + y1) / 2) * 0.05; // nudge towards the middle
    if (d > bd) { bd = d; best = p; }
  }
  return best && [Math.round(best[0]), Math.round(best[1]), Math.round(Math.max(bd, 0))];
}
const pathOf = mp => mp.map(poly => poly.map(rg => {
  const s = rg; if (s.length < 4) return '';
  return 'M' + s.map(([lo, la]) => X(lo) + ' ' + Y(la)).join('L') + 'Z';
}).join('')).join('');
const linePath = pts => 'M' + pts.map(([la, lo]) => [lo, la]).map(([lo, la]) => X(lo) + ' ' + Y(la)).join('L');

/* ---------- territories ---------- */
const polityIdx = Object.fromEntries(polities.map((p, i) => [p.id, i]));
// Adopted regional interpretation: river-bounded sector, not the historical bhukti's full extent.
const ratnaMP = limitsShape(['river:teesta-karatoya', 'river:sonkosh', 'lat:27.0', 'lat:25.46']);
for (const phase of ratnaPhases) territories.push({
  id: 'ratna-' + phase.id, polity: phase.polity, start: phase.start, end: phase.end,
  shape: 'limits:river:teesta-karatoya|river:sonkosh|lat:27.0|lat:25.46',
  z: '10', style: phase.certainty === 'unknown' ? 'legend' : 'core', confidence: 'low',
  label: 'Paundravardhana / Ratnapitha', note: phase.date_label + ': ' + phase.note,
});
const T = territories.map((t, row) => {
  if (!(t.polity in polityIdx)) throw new Error('unknown polity ' + t.polity + ' in ' + t.id);
  let mp = fillHoles(safe(() => pc.intersection(union(t.shape.split(' + ').map(s => termShape(s.trim(), t.polity === 'ahom' && +t.start >= 1523))), FRAME), []));
  // Bank-specific Ahom and local Koch Hajo / Mughal layers share the adopted Assam scope.
  if (t.id.startsWith('ahom-frontier-') || t.polity === 'koch-hajo' || (t.polity === 'mughal' && !t.id.startsWith('mughal-bengal-') && t.id !== 'mughal-1612')) {
    const assamScope = pc.difference(fillHoles(pc.intersection(landNamed('assam'), union(Object.keys(A.districts).map(landNamed)))), landNamed('bangladesh'));
    mp = safe(() => pc.intersection(mp, assamScope), []);
  }
  // User-adopted plain/hill convention for the eastern successor kingdoms.
  // Restrict only the eastern sector, retaining western historical acquisitions.
  if (['ahom', 'chutia'].includes(t.polity)) {
    const east = [[[[94.2, lat0-1], [lon1+1, lat0-1], [lon1+1, lat1+1], [94.2, lat1+1], [94.2, lat0-1]]]];
    const outsideAssam = safe(() => pc.difference(east, landNamed('assam')), []);
    if (outsideAssam.length) mp = safe(() => pc.difference(mp, outsideAssam), mp);
  }
  // Reserve the regional sector even when the current phase is unknown. Old broad
  // Kamarupa and campaign polygons must not silently imply continuous possession.
  if (!t.id.startsWith('ratna-') && +t.end >= 350 && +t.end <= 1099)
    mp = safe(() => pc.difference(mp, ratnaMP), mp);
  if (!mp.length) console.warn('EMPTY shape:', t.id);
  return { ...t, start: +t.start, end: +t.end, pri: (+t.z || 0) * 1000 + row, mp };
});

// year -> active territories, lowest priority first
const keyFor = y => T.filter(t => t.start <= y && y <= t.end).sort((a, b) => a.pri - b.pri);
const shapeCache = new Map(), shapes = [], stateKeys = new Map(), states = [], years = [];
const bbox = mp => { let a = [1e9, 1e9, -1e9, -1e9]; mp.forEach(p => p[0].forEach(([x, y]) => { a = [Math.min(a[0], x), Math.min(a[1], y), Math.max(a[2], x), Math.max(a[3], y)]; })); return a; };
const overl = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
T.forEach(t => { t.bb = bbox(t.mp); });
for (let y = START; y <= END; y++) {
  const act = keyFor(y), key = act.map(t => t.id).join('|');
  if (!stateKeys.has(key)) {
    const list = [];
    act.forEach((t, i) => {
      // Regional context locates an administration without asserting exclusive control.
      const above = act.slice(i + 1).filter(u => !['reach', 'context'].includes(u.style) && u.mp.length && overl(t.bb, u.bb));
      const ck = t.id + '>' + above.map(u => u.id).join(',');
      if (!shapeCache.has(ck)) {
        let mp = t.mp;
        if (above.length && mp.length) mp = safe(() => pc.difference(mp, ...above.map(u => u.mp)), mp);
        mp = mp.filter(p => ringArea(p[0]) > 40); // drop slivers
        const area = Math.round(mpArea(mp));
        shapeCache.set(ck, mp.length ? shapes.push({ t: T.indexOf(t), d: pathOf(mp), a: area, l: labelPoint(mp) }) - 1 : -1);
      }
      const si = shapeCache.get(ck); if (si >= 0) list.push(si);
    });
    stateKeys.set(key, states.push(list) - 1);
  }
  years.push(stateKeys.get(key));
}

/* ---------- rulers, capitals ---------- */
const persons = history.filter(r => r.type === 'person' && r.start_year);
const P = polities.map(p => {
  const groups = p.person_groups ? p.person_groups.split(';').map(s => s.trim()) : [];
  const rulers = persons.filter(r => groups.includes(r.group) && /king|ruler|queen regnant|sultan|emperor/i.test(r.role) && !/officer|general|commander/i.test(r.role))
    .map(r => [r.name, +r.start_year, +(r.end_year || r.start_year)]).sort((a, b) => a[1] - b[1]);
  const capitals = p.capitals ? p.capitals.split(';').map(s => {
    const [id, span] = s.trim().split('@'), [a, b] = span.split('-').map(Number), pl = placeById[id];
    if (!pl) throw new Error('unknown capital ' + id);
    return [pl.name, X(pl.geo[1]), Y(pl.geo[0]), a, b];
  }) : [];
  const ts = T.filter(t => t.polity === p.id);
  return { id: p.id, name: p.name, name_as: p.name_as, short: p.short, lane: +p.lane, color: p.color, rise: p.rise, fall: p.fall,
    start: Math.min(...ts.map(t => t.start)), end: Math.max(...ts.map(t => t.end)), rulers, capitals };
});

/* ---------- base map ---------- */
const clipFrame = rings => safe(() => pc.intersection(union(rings.filter(r => r.length > 2).map(toPC)), [[[[lon0 - 4, lat0 - 3], [lon1 + 4, lat0 - 3], [lon1 + 4, lat1 + 3], [lon0 - 4, lat1 + 3], [lon0 - 4, lat0 - 3]]]]), []);
// whole-country outlines for the background (the neighbours file only holds a cut-out piece of India)
const G = (() => { const w = {}; new Function('window', rd('data/maps/atlas-geography.js'))(w); return w.ATLAS_GEOGRAPHY; })();
const westBengalOutline = union(Object.keys(BENGAL.westBengal).map(id => landNamed('wb-' + id)));
const countries = G.countries.map(c => ({ name: c.name, d: pathOf(clipFrame(c.rings)) })).filter(c => c.d);
const MAJOR = ['brahmaputra', 'siang', 'teesta-karatoya', 'manas', 'sonkosh', 'subansiri', 'dikhou', 'kapili', 'bharali', 'dhansiri-south', 'lohit', 'dibang', 'dihing', 'barak'];
// One interactive main-stem feature: the regional names do not split the river.
const mainstemBridge = JSON.parse(rd('data/maps/brahmaputra-mainstem.json'));
const mainstemPoints = [...A.rivers.siang.pts, ...mainstemBridge.connector, ...A.rivers.dihang.pts, ...A.rivers.brahmaputra.pts]
  .filter((p,i,a) => !i || p[0] !== a[i-1][0] || p[1] !== a[i-1][1]);
const rivers = Object.entries(A.rivers).filter(([id]) => !['siang','dihang'].includes(id)).map(([id, r]) => ({
  id, n: id === 'brahmaputra' ? 'Brahmaputra (Siang / Dihang)' : r.name,
  d: linePath(id === 'brahmaputra' ? mainstemPoints : r.pts), m: id === 'brahmaputra' ? 2 : MAJOR.includes(id) ? 1 : 0,
  ...(id === 'brahmaputra' ? { aliases: ['Siang','Dihang','Brahmaputra'], note: mainstemBridge.note } : {}),
}));
const modern = [
  { n: 'West Bengal (modern reference)', d: pathOf(westBengalOutline), assam: false },
  ...Object.entries(NE.regions).filter(([id]) => id !== 'sylhet').map(([id, r]) => ({ n: r.name, d: pathOf(fillHoles(ringsMP(r.rings))), assam: id === 'assam' })),
];
const towns = ['guwahati', 'dibrugarh', 'tezpur', 'silchar', 'shillong', 'kohima', 'imphal', 'dhubri', 'jorhat', 'sivasagar', 'dhaka']
  .map(id => placeById[id] && [placeById[id].name, X(placeById[id].geo[1]), Y(placeById[id].geo[0])]).filter(Boolean);

const out = {
  built: new Date().toISOString().slice(0, 10), start: START, end: END, W, H, proj: { lat0, lat1, lon0, lon1 },
  base: { countries, rivers, modern, towns, ridges: Object.entries(A.ridges || {}).map(([name, pts]) => ({ name, d: linePath(pts) })) },
  polities: P,
  territories: T.map(t => ({ id: t.id, p: polityIdx[t.polity], s: t.start, e: t.end, label: t.label, note: t.note, conf: t.confidence, style: t.style, authority: t.authority || '' })),
  ratna: { outline: pathOf(ratnaMP), phases: ratnaPhases.map(r => ({ ...r, start: +r.start, end: +r.end, p: polityIdx[r.polity] })) },
  postPala: { ...postPala, spots: postPala.spots.map(s => ({ ...s, x: X(s.lon), y: Y(s.lat) })) },
  sankardeva,
  colonial: { ...colonial,
    spots: colonial.spots.map(s => ({ ...s, x: X(s.lon), y: Y(s.lat) })),
  },
  growth: { ...growth,
    spots: growth.spots.map(s => ({ ...s, x: X(s.lon), y: Y(s.lat) })),
    routes: growth.routes.map(r => ({ ...r, d: r.riverPaths ? r.riverPaths.map(linePath).join('') : linePath(r.points) })),
  },
  pithas: {
    rivers: [['teesta-karatoya', 'Teesta / Karatoya'], ['sonkosh', 'Sankosh'], ['puthimari', 'Rupahi*'], ['bharali', 'Bharali'], ['dikrong', 'Dikrong']].map(([id, name]) => ({ id, name, d: linePath(A.rivers[id].pts), label: A.rivers[id].pts[Math.floor(A.rivers[id].pts.length * .25)].map((v, i, a) => i === 0 ? X(a[1]) : Y(a[0])) })),
    labels: [['Paundravardhana / Ratnapitha', 26.35, 89.15], ['Kamapitha', 26.35, 90.65], ['Suvarnapitha', 26.55, 92.05], ['Saumarapitha', 26.93, 93.15]].map(([name, lat, lon]) => ({ name, x: X(lon), y: Y(lat) })),
    note: 'Adopted pitha scheme. Rupahi* uses the existing catalogue’s approximate Puthimari trace; its historical identification is unverified.',
  },
  shapes, states, years,
  events: [...events.map(e => ({ y: +e.year, p: polityIdx[e.polity] ?? -1, t: e.title, x: e.text })),
    ...ratnaPhases.filter(r => r.certainty !== 'unknown').map(r => ({ y: +r.start, p: polityIdx[r.polity], t: 'Paundravardhana: ' + r.title, x: r.date_label + '. ' + r.note }))]
    .sort((a, b) => a.y - b.y),
};
const js = 'window.ATLAS=' + JSON.stringify(out) + ';\n';
fs.writeFileSync(path.join(ROOT, 'data/atlas.js'), js);
console.log(`years ${years.length}, distinct maps ${states.length}, shapes ${shapes.length}, ${(js.length / 1024).toFixed(0)} KB`);
