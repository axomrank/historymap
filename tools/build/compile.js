'use strict';
const pc = require('../lib/polygon-clipping.umd.min.js');
module.exports = function compile({ polities, territories, ratnaPhases, A }, geometry, { start: START, end: END }) {
  const { lat0, lat1, lon0, lon1, W, H, X, Y, toPC, safe, fillHoles, union, FRAME, landNamed, ringsMP, limitsShape, termShape, ringArea, mpArea, labelPoint, pathOf, linePath } = geometry;
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


  return { T, polityIdx, ratnaMP, shapes, states, years };
};
