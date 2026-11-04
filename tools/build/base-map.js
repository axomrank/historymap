'use strict';
const pc = require('../lib/polygon-clipping.umd.min.js');
module.exports = function buildBase({ rd, A, BENGAL, NE, placeById }, geometry) {
  const { lat0, lat1, lon0, lon1, W, H, X, Y, toPC, safe, fillHoles, union, FRAME, landNamed, ringsMP, limitsShape, termShape, ringArea, mpArea, labelPoint, pathOf, linePath } = geometry;
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


  return { countries, rivers, modern, towns, ridges: Object.entries(A.ridges || {}).map(([name, pts]) => ({ name, d: linePath(pts) })) };
};
