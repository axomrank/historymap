/* Check Ahom political reach, bank-specific ownership and Guwahati chronology. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pc=require('./lib/polygon-clipping.umd.min.js');
const w={};new Function('window',fs.readFileSync('data/atlas.js','utf8'))(w);const D=w.ATLAS;
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

const core=(id,y)=>{const ss=shapes(id,y).filter(s=>D.territories[s.t].style==='core');return ss.length?pc.union(...ss.map(s=>polygons(s.d))):[];};
const has=(id,y)=>shapes('ahom',y).some(s=>D.territories[s.t].id===id);
const darrang=xy([26.65,92.30]);
assert(!contains(domain('ahom',1613),darrang),'Do not bring Barnadi-side reach forward');
assert(contains(domain('ahom',1614),darrang),'1614 frontier reach missing');
assert(!contains(core('ahom',1614),darrang),'Reach is not direct core');
assert(has('ahom-frontier-tributary-darrang',1616));
assert(contains(domain('ahom',1616),darrang));assert(!contains(core('ahom',1616),darrang),'Tributary Darrang must remain distinguished');
const pandu=xy([26.1636,91.6806]);
assert(!contains(core('ahom',1616),pandu));
assert(contains(domain('ahom',1617),pandu),'Temporary Pandu advance missing');
assert(!contains(core('ahom',1617),pandu),'Temporary Pandu advance must not become permanent core');
assert(!has('ahom-frontier-pandu-1617',1619));
for(const [lat,lon,owner] of [[26.55,91.8,'ahom'],[26.55,91.6,'mughal'],[26.12,91.72,'mughal'],[26.12,91.83,'ahom']]){
 assert(contains(core(owner,1639),xy([lat,lon])),`Wrong 1639 ${owner} bank at ${lat},${lon}`);
 assert(!contains(core(owner==='ahom'?'mughal':'ahom',1639),xy([lat,lon])));
}
const guwahati=xy([26.18,91.75]);
for(const [year,owner] of [[1657,'mughal'],[1658,'ahom'],[1662,'mughal'],[1663,'mughal'],[1666,'mughal'],[1667,'ahom'],[1671,'ahom'],[1679,'mughal'],[1681,'mughal'],[1682,'ahom']]){
 assert(contains(core(owner,year),guwahati),`Guwahati owner in ${year} must be ${owner}`);
 assert(!contains(core(owner==='ahom'?'mughal':'ahom',year),guwahati),`Guwahati overlap in ${year}`);
}
for(const y of [1616,1639,1658,1662,1663,1667,1679,1682]){
 assert(area(pc.intersection(core('ahom',y),core('mughal',y)))<.1,`Bank owners overlap in ${y}`);
 assert(contains(core('ahom',y),xy([27.3,95.6])),`Do not move the eastern upper-valley envelope with western campaigns in ${y}`);
 assert(!contains(core('ahom',y),xy([28.2,95.7])),`Do not invent an Arunachal annexation in ${y}`);
}
const phases=D.growth.phases.filter(p=>p.polity==='ahom');for(let i=1;i<phases.length;i++)assert.equal(phases[i].start,phases[i-1].end+1);
assert(phases.filter(p=>p.start>=1537).every(p=>p.northBank&&p.southBank),'Both-bank explanations required');
const mughal=D.polities.find(p=>p.id==='mughal');assert(!mughal.capitals.some(c=>c[0]==='Guwahati'&&1659>=c[3]&&1659<=c[4]),'No Mughal headquarters marker in Ahom-occupied Guwahati');
console.log('PASS: 1614 reach/1616 tributary sphere, temporary 1617 Pandu advance, separate 1639 banks, Guwahati ownership 1657–1682, exact recovery years, no core overlaps, stable eastern envelope and bank-stage continuity.');
