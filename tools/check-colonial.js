// Historical regression checks for colonial staging and qualified map contexts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const w = {};
new Function('window', fs.readFileSync('data/atlas.js', 'utf8'))(w);
const D = w.ATLAS;
const pieces = y => D.states[D.years[y - D.start]].map(i => ({ ...D.shapes[i], t: D.territories[D.shapes[i].t] }));
const has = (id, y) => pieces(y).some(s => s.t.id === id);
const polity = (id, y) => pieces(y).filter(s => D.polities[s.t.p].id === id);
const xy = (lat, lon) => [(lon-D.proj.lon0)/(D.proj.lon1-D.proj.lon0)*D.W, (D.proj.lat1-lat)/(D.proj.lat1-D.proj.lat0)*D.H];
function contains(d, lat, lon) {
  const [x,y] = xy(lat,lon);
  const rings = [...d.matchAll(/M([^MZ]+)Z/g)].map(m => m[1].split('L').map(p => p.trim().split(/\s+/).map(Number)));
  return rings.reduce((all,r) => {
    let inside = false;
    for (let i=0,j=r.length-1;i<r.length;j=i++) if ((r[i][1]>y)!==(r[j][1]>y) && x<(r[j][0]-r[i][0])*(y-r[i][1])/(r[j][1]-r[i][1])+r[i][0]) inside=!inside;
    return all !== inside;
  },false);
}
const covers = (id,y,lat,lon) => polity(id,y).some(s => contains(s.d,lat,lon));
for (const y of [1805,1817,1821,1823,1824,1826,1833,1835,1838]) {
  assert(has('matak-1805', y), `Matak government must remain visible in ${y}`);
  assert(covers('matak', y,27.49,95.36), `Bengmara must remain Matak in ${y}`);
  assert(!covers('burmese',y,27.49,95.36), 'Burmese paint priority must not erase Matak');
  assert(!covers('ahom',y,27.49,95.36), 'The Matak country is excluded from the Ahom restoration');
}
assert(!has('matak-1805',1804));
assert(!has('matak-1805',1839));
assert(covers('british',1839,27.49,95.36));
assert(has('sadiya-local-1825',1838));
assert(!has('sadiya-local-1825',1839));
assert(covers('ahom',1833,26.75,94.21), 'Jorhat in the restored kingdom');
assert(!polity('ahom',1838).length, '1838 annual view shows the post-annexation position');
assert(covers('british',1838,26.75,94.21));
assert.equal(D.territories.find(t => t.id==='ahom-1833').style,'protected');

assert(has('dimasa-1832',1834));
assert(!has('dimasa-1832',1854));
assert(has('british-garo-1869',1872));
assert(has('british-garo-1873',1873));
assert.equal(D.territories.find(t => t.id==='british-garo-1869').style,'context');
assert(has('khasi-context-1833',1891));
assert(!polity('british',1891).filter(s => s.t.style==='core').some(s => contains(s.d,25.6,91.6)), 'Khasi states are not blanket directly annexed');

const nagaArea = y => pieces(y).filter(s => s.t.id.startsWith('british-naga-')).reduce((a,s)=>a+s.a,0);
assert(!nagaArea(1865));
assert(nagaArea(1875)>nagaArea(1866));
assert(nagaArea(1889)>nagaArea(1875));
assert(pieces(1891).filter(s=>s.t.id.startsWith('british-naga-')).every(s=>s.t.style==='context'));
assert(!has('british-lushai-1889',1888));
assert(has('british-lushai-1889',1891));
assert(has('british-lushai-1895',1895));
assert(has('british-lushai-1898',1898));
assert(!has('british-frontier-1914',1913));
assert.equal(D.territories.find(t=>t.id==='british-frontier-1914').style,'context');
assert(covers('burmese',1820,24.817,93.9368));
assert(covers('manipur',1825,24.817,93.9368));
assert(has('manipur-1891',1891));
assert.equal(D.territories.find(t=>t.id==='manipur-1891').style,'protected');
assert(!covers('british',1891,24.817,93.9368));
assert(covers('tripura',1891,23.83,91.29));
assert(!covers('british',1891,23.83,91.29));

// Local polity IDs do not imply independence from their parent political authority.
const authorityAt = (id,y) => polity(id,y).map(s=>s.t.authority);
assert(authorityAt('tripura',1808).every(a=>a===''));
assert(authorityAt('tripura',1809).includes('british-protection'));
assert(authorityAt('tripura',1871).includes('british-paramountcy'));
assert(authorityAt('manipur',1826).includes('british-protection'));
assert(authorityAt('manipur',1891).includes('british-paramountcy'));
for (const id of ['manipur','tripura']) {
  for (const y of [1947,1948]) assert(authorityAt(id,y).includes('india-accession'), `${id} accession must be visible in ${y}`);
  for (const y of [1949,1950,1956,1972,2026]) {
    assert(authorityAt(id,y).includes('india'), `${id} must visibly belong to India in ${y}`);
    assert(!covers('assam-state',y,...(id==='manipur'?[24.817,93.9368]:[23.83,91.29])), 'Indian membership must not invent an Assam annexation');
  }
  assert(has(`${id}-1949`,1949));
  assert(!has(`${id}-1949`,1950));
  assert(has(`${id}-1950`,1950));
}
assert(D.colonial.authorities['british-paramountcy'].pattern);
assert(D.colonial.authorities['india-accession'].pattern);
assert.equal(D.colonial.authorities.india.pattern,false);
assert.equal(D.colonial.authorities.india.color,D.polities.find(p=>p.id==='assam-state').color);
assert(D.territories.every(t=>!t.authority || D.colonial.authorities[t.authority]));

for (const [a,b,id] of [[1962,1963,'nagaland'],[1971,1972,'meghalaya'],[1986,1987,'mizoram'],[1986,1987,'arunachal']]) {
  assert.notEqual(D.years[a-D.start],D.years[b-D.start], `${id} status change must alter the annual phase`);
  assert(polity(id,b).length);
}
assert(has('meghalaya-1970',1970));
assert.equal(D.territories.find(t=>t.id==='meghalaya-1970').style,'context');
assert(covers('assam-state',1970,25.58,91.89), 'Autonomous overlay must preserve the within-Assam relationship');
assert(!covers('assam-state',1972,25.58,91.89));
const province = pieces(1905).find(s=>s.t.id==='british-1905');
assert(province && contains(province.d,25.0,88.15), 'Include Malda context in 1905 province');
assert(!contains(province.d,22.81,89.56), 'Do not equate all current Bangladesh with Eastern Bengal and Assam');

for (const g of D.colonial.groups) {
  const phases=D.colonial.phases.filter(p=>p.group===g.id).sort((a,b)=>a.start-b.start);
  assert(phases.length);
  for (let i=0;i<phases.length;i++) {
    const p=phases[i]; assert(p.start<=p.end);
    assert(p.sources.length && p.sources.every(s=>D.colonial.sources[s]));
    assert(D.polities.some(x=>x.id===p.polity));
    if(i)assert.equal(phases[i-1].end+1,p.start,`Gap in ${g.id}`);
  }
}
for(const y of [1833,1838,1839,1842,1866,1875,1889,1891,1895,1898,1963,1970,1972,1987]) {
  assert(D.colonial.phases.some(p=>p.start===y), `Missing dated stop ${y}`);
  assert(D.events.some(e=>e.y===y), `Missing main timeline event ${y}`);
}
assert(D.polities.every(p=>Number.isFinite(p.start)&&Number.isFinite(p.end)));
assert(D.events.every(e=>e.p>=0));
console.log('PASS: Matak autonomy/survival/exclusions, 1838–1842 transitions, hill acquisition stages, princely Manipur/Tripura, qualified frontier regions, 1905 geography, 1970 autonomy, 1963/1987 statehood and all sourced colonial phase joins.');
console.log('PASS: Tripura 1809/1871 and Manipur 1826/1891 British relationships; separate 1947 accession, 1949 transfer, 1950 Part C status and continuing Indian membership through 2026.');
