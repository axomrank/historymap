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
const vertexSet=mp=>new Set(mp.flat(2).map(p=>p.join(',')));
const shapes=(id,y)=>D.states[D.years[y-D.start]].map(i=>D.shapes[i]).filter(s=>D.polities[D.territories[s.t].p].id===id);
const domain=(id,y)=>pc.union(...shapes(id,y).map(s=>polygons(s.d)));
const area=mp=>mp.reduce((a,p)=>a+Math.abs(signed(p[0]))-p.slice(1).reduce((s,r)=>s+Math.abs(signed(r)),0),0);
function contains(mp,p){return mp.some(poly=>poly.reduce((inside,r)=>{let hit=false;for(let i=0,j=r.length-1;i<r.length;j=i++){if((r[i][1]>p[1])!==(r[j][1]>p[1])&&p[0]<(r[j][0]-r[i][0])*(p[1]-r[i][1])/(r[j][1]-r[i][1])+r[i][0])hit=!hit;}return inside!==hit;},false));}

for(const year of [1563,1570,1580]){
 const koch=domain('koch',year),ahom=domain('ahom',year);
 for(const [lat,lon,owner] of [[27.1,94.10,'koch'],[27.1,94.23,'ahom']]){
  assert(contains(owner==='koch'?koch:ahom,xy([lat,lon])),`${owner} must own its Subansiri side in ${year}`);
  assert(!contains(owner==='koch'?ahom:koch,xy([lat,lon])),`Opposite polity crosses Subansiri in ${year}`);
 }
 const k=vertexSet(koch),a=vertexSet(ahom);
 const shared=A.rivers.subansiri.pts.map(xy).filter(p=>k.has(p.join(','))&&a.has(p.join(',')));
 assert(shared.length>=8,`Shared Subansiri bends missing in ${year}: ${shared.length}`);
 assert(area(pc.intersection(koch,ahom))<.1,'Koch/Ahom overlap');
}
const north=D.territories.find(t=>t.id==='koch-majuli');assert.equal(north.s,1563);assert.equal(north.e,1580);
assert(!shapes('koch',1581).length,'Do not carry the undivided treaty phase into 1581');
const ne=JSON.parse(fs.readFileSync('data/maps/northeast.json','utf8'));
const state=id=>pc.union(...ne.regions[id].rings.map(r=>[r.map(xy)]));
const meghalaya=state('meghalaya'),assam=state('assam');
for(const year of [1500,1563,1750,1834]){
 const j=domain('jaintia',year);assert(area(j)>100,'Jaintia must remain a substantial eastern Meghalaya region');
 assert(area(pc.difference(j,meghalaya))<1,'Jaintia must be confined to Meghalaya');
 assert(area(pc.intersection(j,assam))<1,'Jaintia must not enter Assam');
 for(const [id,district] of Object.entries(A.districts)){
  const mp=pc.union(...district.rings.map(r=>[r.map(xy)]));
  assert(area(pc.intersection(j,mp))<1,`Jaintia overlaps Assam district ${id}`);
 }
 assert(contains(j,xy([25.45,92.20])),'Jowai missing');
 assert(contains(j,xy([25.36,92.37])),'Khliehriat missing');
 assert(!contains(j,xy([25.9,91.9])),'Jaintia must not reach the Assam-facing old sketch extent');
}
console.log('PASS: Subansiri ownership and exact shared bends throughout 1563–1580; separate 1581 phase; Jaintia confined to eastern Meghalaya with no Assam district overlap.');
