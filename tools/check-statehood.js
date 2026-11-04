// Verify the eight-state guide against constitutional milestone dates and map nesting.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const w = {};
new Function('window',fs.readFileSync('data/generated/atlas.js','utf8'))(w);
const D = w.ATLAS;
const expected = {
  'assam-state':['1950-01-26',null],
  nagaland:['1963-12-01','1963-12-01'],
  meghalaya:['1972-01-21','1972-01-21'],
  mizoram:['1987-02-20','1972-01-21'],
  arunachal:['1987-02-20','1972-01-21'],
  manipur:['1972-01-21',null],
  tripura:['1972-01-21',null],
  sikkim:['1975-05-16',null],
};
const guide = D.colonial.statehood;
assert.equal(guide.length,8);
assert.equal(new Set(guide.map(s=>s.id)).size,8);
for(const [id,[statehood,separation]] of Object.entries(expected)) {
  const row=guide.find(s=>s.id===id);
  assert(row,`Missing state ${id}`);
  assert.equal(row.statehood,statehood,`${id} full statehood date`);
  assert.equal(row.separation,separation,`${id} formal separation from Assam`);
  assert(row.parent && row.note && row.sources.length);
  assert(row.sources.every(s=>D.colonial.sources[s]));
  assert(row.milestones.some(m=>m.date===statehood));
  for(const m of row.milestones) {
    assert.equal(m.year,+m.date.slice(0,4));
    assert.equal(new Date(m.date+'T00:00:00Z').toISOString().slice(0,10),m.date);
  }
}
const pieces=y=>D.states[D.years[y-D.start]].map(i=>({...D.shapes[i],t:D.territories[D.shapes[i].t]}));
const polity=(id,y)=>pieces(y).filter(s=>D.polities[s.t.p].id===id);
function contains(d,lat,lon) {
  const x=(lon-D.proj.lon0)/(D.proj.lon1-D.proj.lon0)*D.W,y=(D.proj.lat1-lat)/(D.proj.lat1-D.proj.lat0)*D.H;
  return [...d.matchAll(/M([^MZ]+)Z/g)].reduce((all,m)=>{
    const r=m[1].split('L').map(p=>p.trim().split(/\s+/).map(Number));let hit=false;
    for(let i=0,j=r.length-1;i<r.length;j=i++)if((r[i][1]>y)!==(r[j][1]>y)&&x<(r[j][0]-r[i][0])*(y-r[i][1])/(r[j][1]-r[i][1])+r[i][0])hit=!hit;
    return all!==hit;
  },false);
}
const covers=(id,y,lat,lon)=>polity(id,y).some(s=>contains(s.d,lat,lon));
for(const y of [1957,1960,1962]) {
  assert(covers('assam-state',y,25.67,94.11),'NHTA remains constitutionally in Assam until statehood');
  assert(polity('nagaland',y).every(s=>s.t.style==='context'));
}
assert(!covers('assam-state',1963,25.67,94.11));
assert(covers('nagaland',1963,25.67,94.11));
assert(covers('assam-state',1970,25.58,91.89));
assert(polity('meghalaya',1970).every(s=>s.t.style==='context'));
assert(!covers('assam-state',1972,25.58,91.89));
for(const [id,oldId,newId] of [['mizoram','mizoram-1972','mizoram-1987'],['arunachal','arunachal-1972','arunachal-1987']]) {
  assert(polity(id,1986).some(s=>s.t.id===oldId));
  assert(polity(id,1987).some(s=>s.t.id===newId));
  assert.notEqual(D.years[1986-D.start],D.years[1987-D.start]);
}
assert.equal(polity('sikkim',1946).length,0,'Do not backdate this postwar context to a kingdom founding date');
assert(polity('sikkim',1974).some(s=>s.t.authority==='india-protection'));
assert(polity('sikkim',1975).every(s=>s.t.authority==='india' && s.t.style==='core'));
assert(!covers('assam-state',1974,27.33,88.61));
assert(covers('sikkim',1975,27.33,88.61));
assert.notEqual(D.years[1974-D.start],D.years[1975-D.start]);
for(const s of guide) {
  const y=+s.statehood.slice(0,4);
  assert(D.events.some(e=>e.y===y));
  assert(D.colonial.phases.some(p=>p.start===y));
}
assert(D.colonial.groups.some(g=>g.id==='statehood'));
assert(D.colonial.groups.some(g=>g.id==='sikkim'));
console.log('PASS: all eight separation/statehood dates; 1957 NHTA and 1970 Meghalaya nesting; 1972 UT versus 1987 statehood; Sikkim protectorate versus 1975 statehood; source links and navigable event years.');
