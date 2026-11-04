// Regression checks for visible state transitions and modern Bangladesh context.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {paint} = require('../app/map-appearance.js');
const w={};new Function('window',fs.readFileSync('data/atlas.js','utf8'))(w);
const D=w.ATLAS;
const active=y=>D.states[D.years[y-D.start]].map(si=>D.territories[D.shapes[si].t]);
const view=(id,y,mode='states')=>{const t=active(y).find(t=>D.polities[t.p].id===id);assert(t,`${id} missing in ${y}`);return paint(D.polities[t.p],t,y,mode,D.colonial.authorities,D.colonial.statehood);};
const colours=D.colonial.statehood.map(s=>{const v=view(s.id,2026);assert.equal(v.stage,'state');assert.equal(view(s.id,2026,'affiliation').fill,D.colonial.authorities.india.color);return v.fill;});
assert.equal(new Set(colours).size,8,'Eight states must have distinct visible colours');
for(const id of ['mizoram','arunachal']) {
 assert.equal(view(id,1986).stage,'union-territory');assert.match(view(id,1986).fill,/url\(#ut-/);
 assert.equal(view(id,1987).stage,'state');assert.notEqual(view(id,1986).fill,view(id,1987).fill);
}
for(const id of ['manipur','tripura']) {
 assert.equal(view(id,1971).stage,'union-territory');assert.equal(view(id,1972).stage,'state');
 assert.notEqual(view(id,1971).fill,view(id,1972).fill);
}
assert.equal(view('nagaland',1957).stage,'special-unit');assert.equal(view('nagaland',1963).stage,'state');
assert.equal(view('meghalaya',1970).stage,'autonomous');assert.equal(view('meghalaya',1972).stage,'state');
assert.match(view('sikkim',1974).fill,/authority-india-protection/);assert.equal(view('sikkim',1975).stage,'state');
assert(!D.base.towns.some(t=>/sylhet/i.test(t[0])),'No permanent Sylhet city label');
for(const y of [1947,1971,2026]) {
 assert(!active(y).some(t=>/sylhet/i.test(t.label)),'No separate modern Sylhet territory');
 const id=y<1971?'pakistan':'bangladesh';assert(view(id,y).country);
 const csv=fs.readFileSync('data/territories.csv','utf8').split('\n').find(l=>l.startsWith(id==='pakistan'?'pakistan-1947,':'bangladesh-1971,'));
 assert(csv.includes('land:bangladesh'),'Use whole country context');
}
assert(fs.readFileSync('data/territories.csv','utf8').includes('british-1914,british,1914,1946,"land:assam,sylhet"'),'Preserve historically relevant Sylhet context');
console.log('PASS: distinct state colours, UT-to-state changes, affiliation mode, autonomy and protectorate statuses, modern Bangladesh without separate Sylhet.');
