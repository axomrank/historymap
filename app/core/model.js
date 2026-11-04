'use strict';
window.createAtlasModel = function (D) {
  const S = D.start, E = D.end;
  const ERAS = D.eras;
  const eraOf = y => ERAS.find(e => y >= e[0] && y <= e[1]);

  /* ---------- per-year area of every polity (drives the bands and the status words) ---------- */
  const P = D.polities, NP = P.length;
  const stateArea = D.states.map(list => {
    const a = new Float64Array(NP);
    list.forEach(si => { const sh = D.shapes[si], t = D.territories[sh.t]; if (t.style === 'core') a[t.p] += sh.a; });
    return a;
  });
  const areaAt = (p, y) => (y < S || y > E) ? 0 : stateArea[D.years[y - S]][p];
  P.forEach((p, i) => {
    let best = 0, by = p.start;
    for (let y = p.start; y <= p.end; y++) { const a = areaAt(i, y); if (a > best + 1) { best = a; by = y; } }
    p.max = best; p.peak = by;
  });
  const changeYears = [];
  const evidenceYears = new Set([...D.growth.phases, ...D.colonial.phases].map(p => p.start));
  for (let y = S + 1; y <= E; y++) if (D.years[y - S] !== D.years[y - S - 1] || evidenceYears.has(y)) changeYears.push(y);


return { P, ERAS, eraOf, areaAt, changeYears };
};
