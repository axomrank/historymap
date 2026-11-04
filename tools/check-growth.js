// Regression checks for historical staging and symbolic geography, not proof of frontiers.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/generated/atlas.js'), 'utf8'), ctx);
const D = ctx.window.ATLAS;
const pieces = (id, y) => D.states[D.years[y - D.start]].map(si => ({ ...D.shapes[si], territory: D.territories[D.shapes[si].t] })).filter(s => D.polities[s.territory.p].id === id);
const area = (id, y, core = false) => pieces(id, y).filter(s => !core || s.territory.style === 'core').reduce((a, s) => a + s.a, 0);
const has = (id, y) => D.states[D.years[y - D.start]].some(si => D.territories[D.shapes[si].t].id === id);
assert.ok(area('ahom', 1228) < 1000, 'Arrival must be a small locality symbol');
assert.equal(area('ahom', 1246, true), 0, 'Migration patches must not count as a measured kingdom');
assert.ok(area('ahom', 1253, true) > area('ahom', 1228));
assert.ok(area('ahom', 1268, true) > area('ahom', 1253, true));
assert.equal(area('ahom', 1282, true), area('ahom', 1496, true), 'Do not invent yearly expansion during consolidation');
assert.ok(!D.polities.find(p => p.id === 'ahom').capitals.some(c => c[3] < 1253), 'No Charaideo capital in 1228');
assert.ok(!has('ahom-habung-1512', 1511));
assert.ok(has('ahom-habung-1512', 1512));
assert.ok(has('ahom-east-1513', 1519));
assert.ok(!has('ahom-east-1513', 1520));
assert.ok(has('chutia-counter-1520', 1520));
assert.ok(!has('chutia-counter-1520', 1522));
assert.ok(has('ahom-east-1522', 1522));
assert.ok(has('habung-disputed-1520', 1520));
assert.equal(D.territories.find(t => t.id === 'habung-disputed-1520').style, 'reach');
assert.ok(area('ahom', 1513, true) > area('ahom', 1520, true), 'Chutia recovery must reduce Ahom core');
assert.ok(area('ahom', 1522, true) > area('ahom', 1520, true));
assert.ok(area('ahom', 1523, true) > area('ahom', 1522, true) * 2);
assert.ok(area('ahom', 1532, true) > area('ahom', 1523, true), 'Do not bring forward the western campaigns to 1523');
assert.ok(area('chutia', 1187) < area('chutia', 1442) / 10, 'Early Chutia centre must not start at later extent');
assert.equal(pieces('chutia', 1523).length, 0);
assert.ok(area('chutia', 1392) > area('chutia', 1187));
assert.ok(area('chutia', 1401) > area('chutia', 1392));
assert.ok(pieces('chutia', 1401).every(s => s.territory.style === 'legend'), 'Do not infer a continuous country from scattered grants');
assert.ok(D.polities.every(p => /^#[0-9a-f]{6}$/i.test(p.color)));
assert.ok(area('khen', 1440) < area('khen', 1460));
assert.ok(area('khen', 1460) < area('khen', 1480));
assert.ok(area('kamata', 1257, true) !== area('kamata', 1365, true));
for (const y of [1250, 1330, 1449, 1505, 1515, 1523, 1530]) {
  const a = pieces('bhuyan', y);
  assert.ok(a.length);
  assert.ok(a.every(s => s.territory.style === 'legend'));
  assert.ok(a.every(s => s.territory.id.startsWith('bhuyan-')), 'Retain separate chiefdom sectors');
}
assert.equal(pieces('bhuyan', 1449).length, 4, 'Four separately drawn river-bounded chiefdom sectors');
assert.equal(D.growth.routes.length, 7);
const migration = D.growth.routes.find(r => r.id === 'mong-mao-pangsau');
assert.equal(migration.start, 1215);
assert.equal(migration.kind, 'reconstruction');
assert.equal(D.polities.find(p => p.id === 'ahom').start, 1228, 'Migration must not backdate the Ahom polity');
assert.equal(pieces('ahom', 1215).length, 0, 'No Ahom possession in Myanmar in 1215');
assert.ok(migration.points.length >= 25, 'Use a winding corridor rather than one straight segment');
assert.equal(migration.points[0][0], 24.018);
assert.equal(migration.points[0][1], 97.856);
assert.equal(migration.points.at(-1)[0], 27.2476);
assert.equal(migration.points.at(-1)[1], 96.156);
assert.equal(JSON.stringify(migration.points.at(-1)), JSON.stringify(D.growth.routes.find(r => r.id === 'patkai-namrup').points[0]), 'Migration must join the Namrup trail at the same pass');
for (const [lat, lon] of migration.points) {
  assert.ok(lat >= D.proj.lat0 && lat <= D.proj.lat1 && lon >= D.proj.lon0 && lon <= D.proj.lon1, 'Entire migration must fit within the atlas frame');
}
assert.ok(D.growth.phases.some(p => p.polity === 'ahom' && p.start === 1215 && p.end === 1227));
for (const r of D.growth.routes) for (const id of r.sources || []) assert.ok(D.growth.sources[id]);
assert.ok(D.growth.routes.every(r => r.end === 1267 && r.d.startsWith('M')));
assert.ok(!D.growth.spots.some(s => /abhaypur/i.test(s.id)), 'Unlocated Abhaypur must not receive a false exact pin');
for (const p of D.growth.phases) {
  assert.ok(p.start <= p.end);
  for (const id of p.sources) assert.ok(D.growth.sources[id]);
}
for (const id of ['ahom', 'chutia', 'kamata', 'khen', 'bhuyan', 'koch']) {
  const stages = D.growth.phases.filter(p => p.polity === id);
  for (let i = 1; i < stages.length; i++) assert.equal(stages[i].start, stages[i - 1].end + 1, `Gap or overlap in ${id}`);
}
assert.equal(D.base.rivers.length, new Set(D.base.rivers.map(r => r.id)).size);
assert.ok(D.base.rivers.every(r => r.n && r.d.startsWith('M')));
for (let y = D.start; y <= D.end; y++) for (const si of D.states[D.years[y - D.start]]) {
  assert.ok(D.shapes[si].a > 0 && D.shapes[si].d.startsWith('M'));
  const t = D.territories[D.shapes[si].t]; assert.ok(t.s <= y && y <= t.e);
}
console.log(`PASS: ${D.growth.phases.length} researched stages, migration/capital chronology, settlement symbols, long consolidation, 1512–24 reversals, Khen progression, separate Bhuyan river sectors, ${D.base.rivers.length} named rivers and all annual joins.`);
assert.equal(migration.progress.start,1215);
assert.equal(migration.progress.arrival,1228);
const rawMap=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/maps/assam.json'),'utf8'));
for(const r of D.growth.routes.filter(r=>r.riverPaths)) {
 const allowed=new Set(r.riverSections.flatMap(id=>rawMap.rivers[id].pts.map(p=>JSON.stringify(p))));
 for(const section of r.riverPaths) for(const point of section) assert.ok(allowed.has(JSON.stringify(point)), 'River travel must reuse exact mapped river vertices');
 assert.equal((r.d.match(/M/g)||[]).length,r.riverPaths.length,'Do not bridge disconnected river sections with straight lines');
}
console.log('PASS: progressive 1215–1228 pacing metadata and exact, separately drawn river sections.');
