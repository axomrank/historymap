const assert = require('node:assert/strict');
const fs = require('node:fs');
const { at } = require('../app/sankardeva-journey');
const d = require('../data/sankardeva-routes.json');
const find = n => d.points.find(p => p.name.startsWith(n));
assert.equal(new Set(d.points.map(p => p.id)).size, d.points.length);
for (const r of d.routes) {
  r.anchors.forEach((a,i) => {
    assert(d.points.some(p => p.id === a.point));
    if(i) assert(a.year > r.anchors[i-1].year);
  });
}
assert.equal(at(d,1448).routes.length,0);
assert.equal(at(d,1480).points.filter(p => p.kind === 'pilgrimage').length,0);
for (let year=1449;year<=1568;year++) {
  const state=at(d,year);
  for (const r of state.routes) {
    assert(r.trail.every(p => p.every(Number.isFinite)));
    const before=at(d,year-1).routes.find(t => t.id===r.id);
    if(before) assert(r.trail.length >= before.trail.length);
  }
}
const mid=at(d,1520).routes.find(r=>r.id==='migration');
assert(mid.head[1]>find('Gangmou').lon && mid.head[1]<find('Dhuwahat').lon);
assert(!at(d,1520).points.includes(find('Kapalabari')));
assert(at(d,1540).points.includes(find('Kapalabari')));
assert(at(d,1551).points.includes(find('Puri (')));
assert.deepEqual(at(d,1568).current.head,[find('Madhupur').lat,find('Madhupur').lon]);
assert.notDeepEqual([find('Alipukhuri').lat,find('Alipukhuri').lon],[find('Bordowa /').lat,find('Bordowa /').lon]);
at(d,1568); assert.deepEqual(at(d,1510),at(d,1510)); // Model has no accumulated playback state.
const w={};new Function('window',fs.readFileSync('data/atlas.js','utf8'))(w);
assert.deepEqual(w.ATLAS.sankardeva,d);
console.log('PASS: all 120 years, progressive routes, pilgrimage windows, supplied waypoints, separate birthplaces, Madhupur endpoint and built atlas parity.');
