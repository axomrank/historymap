// Verify the generated atlas's adopted regional sequence, not a historical claim.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/atlas.js'), 'utf8'), context);
const D = context.window.ATLAS;
const phases = D.ratna.phases;
assert.equal(phases.length, 16);
assert.equal(phases[0].start, 350);
assert.equal(phases.at(-1).end, 1256);
const expected = [[550, 'varman'], [590, 'ratna-later-gupta'], [640, 'varman'],
  [650, 'ratna-uncertain'], [735, 'salastambha'], [850, 'salastambha'],
  [940, 'pala-kamarupa'], [950, 'ratna-chandra'], [980, 'pala-kamarupa'],
  [1075, 'ratna-bengal-varman'], [1090, 'pala-kamarupa'], [1110, 'bengal-pala'],
  [1140, 'ratna-uncertain']];
for (const [year, id] of expected) {
  const phase = phases.find(p => p.start <= year && p.end >= year);
  assert.equal(D.polities[phase.p].id, id, `Wrong adopted owner in ${year}`);
}
for (let y = D.start; y <= D.end; y++) {
  const phase = phases.filter(p => p.start <= y && y <= p.end);
  const active = D.states[D.years[y - D.start]].map(si => ({ s: D.shapes[si], t: D.territories[D.shapes[si].t] }));
  const regional = active.filter(({ t }) => t.label === 'Paundravardhana / Ratnapitha');
  assert.equal(phase.length, y <= 1256 ? 1 : 0, `Gap or overlap in ${y}`);
  assert.equal(regional.length, phase.length, `Missing or duplicate visible region in ${y}`);
  if (phase.length) {
    assert.equal(regional[0].t.p, phase[0].p);
    assert.ok(regional[0].s.a > 1000, `Empty or sliver geometry in ${y}`);
    assert.equal(regional[0].t.style === 'legend', phase[0].certainty === 'unknown');
  }
}
assert.ok(D.ratna.outline.startsWith('M'));
assert.ok(!D.events.some(e => e.y === 643 && /after Harsha.s death/i.test(e.x)));
console.log('PASS: 16 phases; 1,677 years checked; gains, losses, recoveries, unknown intervals and 1257 handover verified.');
