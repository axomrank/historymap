/* Check rendered ownership, district coverage and reuse of the actual river vertices. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pc=require('./lib/polygon-clipping.umd.min.js');
const w={};new Function('window',fs.readFileSync('data/atlas.js','utf8'))(w);const D=w.ATLAS;
const A=JSON.parse(fs.readFileSync('data/maps/assam.json','utf8'));
const xy=([lat,lon])=>[+((lon-D.proj.lon0)/(D.proj.lon1-D.proj.lon0)*D.W).toFixed(1),+((D.proj.lat1-lat)/(D.proj.lat1-D.proj.lat0)*D.H).toFixed(1)];
function signed(r){return r.slice(1).reduce((s,p,i)=>s+r[i][0]*p[1]-p[0]*r[i][1],0)/2;}
function polygons(d){
 const rings=[...d.matchAll(/M([^MZ]+)Z/g)].map(m=>m[1].split('L').map(p=>p.trim().split(/\s+/).map(Number)));
 const mp=[];let sign;
 for(const ring of rings){const s=Math.sign(signed(ring)); if(sign===undefined)sign=s;if(s===sign)mp.push([ring]);else mp.at(-1).push(ring);}
 return mp;
}
const shapes=(id,y)=>D.states[D.years[y-D.start]].map(i=>D.shapes[i]).filter(s=>D.polities[D.territories[s.t].p].id===id);
const domain=(id,y)=>shapes(id,y).length ? pc.union(...shapes(id,y).map(s=>polygons(s.d))) : [];
const area=mp=>mp.reduce((a,p)=>a+Math.abs(signed(p[0]))-p.slice(1).reduce((s,r)=>s+Math.abs(signed(r)),0),0);
function contains(mp,p){return mp.some(poly=>poly.reduce((inside,r)=>{let hit=false;for(let i=0,j=r.length-1;i<r.length;j=i++){if((r[i][1]>p[1])!==(r[j][1]>p[1])&&p[0]<(r[j][0]-r[i][0])*(p[1]-r[i][1])/(r[j][1]-r[i][1])+r[i][0])hit=!hit;}return inside!==hit;},false));}

assert(!D.polities.some(p=>p.id==='koch-bihar'));
assert(!D.base.towns.some(t=>/cooch|koch behar|koch bihar/i.test(t[0])));
const ne=JSON.parse(fs.readFileSync('data/maps/northeast.json','utf8'));
const nb=JSON.parse(fs.readFileSync('data/maps/neighbours.json','utf8'));
const assam=pc.union(...ne.regions.assam.rings.map(r=>[r.map(xy)]));
const bangladesh=pc.union(...nb.countries.Bangladesh.map(r=>[r.map(xy)]));
for(const year of [1581,1609,1611,1612]){
 const h=domain('koch-hajo',year);assert(area(h)>100);
 assert(area(pc.difference(h,assam))<area(h)*.0002,`Koch Hajo outside Assam in ${year}`);
 assert(area(pc.intersection(h,bangladesh))<1,`Koch Hajo enters Bangladesh in ${year}`);
}
assert(!shapes('koch-hajo',1613).length);
const mughalCore=y=>{const ss=shapes('mughal',y).filter(s=>D.territories[s.t].style==='core');return ss.length?pc.union(...ss.map(s=>polygons(s.d))):[];};
assert.equal(area(mughalCore(1575)),0);
assert(contains(mughalCore(1576),xy([24.18,88.27])),'Western Bengal must appear after Rajmahal');
assert(!contains(mughalCore(1576),xy([23.81,90.41])),'Do not conquer Dhaka in 1576');
assert(!contains(mughalCore(1610),xy([23.81,90.41])),'Campaign reach is separate from consolidated core');
assert(contains(mughalCore(1611),xy([23.81,90.41])),'Dhaka/Bhati consolidation missing');
assert(!contains(mughalCore(1611),xy([24.90,91.87])),'Keep Sylhet resistance until 1612');
assert(contains(mughalCore(1612),xy([24.90,91.87])));
assert(!contains(mughalCore(1665),xy([22.36,91.78])),'Chittagong must not be annexed before 1666');
assert(contains(mughalCore(1666),xy([22.36,91.78])));
for(const p of [[22.65,92.17],[27.04,88.26],[26.32,89.45]])assert(!contains(mughalCore(1666),xy(p)),`Do not blanket annex modern hill/princely region ${p}`);
const ids=y=>shapes('mughal',y).map(s=>D.territories[s.t].id);
assert(ids(1612).includes('mughal-hajo-western-advance'));
assert(ids(1613).includes('mughal-1613'));
assert(ids(1614).includes('mughal-hajo-resistance-1614'));
assert(ids(1615).includes('mughal-eastern-attempt-1615'));
assert(!ids(1617).includes('mughal-eastern-attempt-1615'));
for(const id of ['mughal','koch-hajo']){const phases=D.growth.phases.filter(s=>s.polity===id);for(let i=1;i<phases.length;i++)assert.equal(phases[i].start,phases[i-1].end+1);}
assert(D.base.modern.some(s=>s.n==='West Bengal (modern reference)'));
const bg=JSON.parse(fs.readFileSync('data/maps/bengal-districts.json','utf8'));
for(const group of [bg.westBengal,bg.bangladesh])for(const d of Object.values(group))for(const ring of d.rings)for(const [lat,lon] of ring)assert(lat>=D.proj.lat0&&lat<=D.proj.lat1&&lon>=D.proj.lon0&&lon<=D.proj.lon1,'Whole modern Bengal reference must fit the map frame');
console.log('PASS: Koch Behar removed; Koch Hajo confined to Assam; staged Bengal 1576/1611/1612/1666 coverage; excluded hill/princely regions; 1612–1617 invasion/annexation/resistance/reversal; full Bengal frame.');
