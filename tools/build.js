// Orchestrate the source → geometry → annual atlas pipeline.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const config = require('../data/atlas-config.json');
const { start: START, end: END } = config;
const inputs = require('./build/inputs')(ROOT);
const { events, ratnaPhases, postPala, growth, sankardeva, A, colonial } = inputs;
const geometry = require('./build/geometry')(inputs);
const { lat0, lat1, lon0, lon1, W, H, X, Y, pathOf, linePath } = geometry;
const { T, polityIdx, ratnaMP, shapes, states, years } = require('./build/compile')(inputs, geometry, config);
const P = require('./build/polities')(inputs, geometry, T);
const base = require('./build/base-map')(inputs, geometry);
fs.mkdirSync(path.join(ROOT, 'data/generated'), { recursive: true });

const out = {
  eras: config.eras,
  built: config.dataVersion, start: START, end: END, W, H, proj: { lat0, lat1, lon0, lon1 },
  base,
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
fs.writeFileSync(path.join(ROOT, 'data/generated/atlas.js'), js);
console.log(`years ${years.length}, distinct maps ${states.length}, shapes ${shapes.length}, ${(js.length / 1024).toFixed(0)} KB`);
