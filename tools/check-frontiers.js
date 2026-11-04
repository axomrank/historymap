/* Check rendered ownership, district coverage and reuse of the actual river vertices. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pc=require('./lib/polygon-clipping.umd.min.js');
const w={};new Function('window',fs.readFileSync('data/generated/atlas.js','utf8'))(w);const D=w.ATLAS;
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
const domain=(id,y)=>pc.union(...shapes(id,y).map(s=>polygons(s.d)));
const area=mp=>mp.reduce((a,p)=>a+Math.abs(signed(p[0]))-p.slice(1).reduce((s,r)=>s+Math.abs(signed(r)),0),0);
function contains(mp,p){return mp.some(poly=>poly.reduce((inside,r)=>{let hit=false;for(let i=0,j=r.length-1;i<r.length;j=i++){if((r[i][1]>p[1])!==(r[j][1]>p[1])&&p[0]<(r[j][0]-r[i][0])*(p[1]-r[i][1])/(r[j][1]-r[i][1])+r[i][0])hit=!hit;}return inside!==hit;},false));}
const ahom=domain('ahom',1496),chutia=domain('chutia',1496),dimasa=domain('dimasa',1496);
for(const [lat,lon,owner] of [[27.2,95.4,'ahom'],[27.4,95.5,'chutia'],[26.9,94.84,'ahom'],[26.9,94.70,'dimasa']]){
 const all={ahom,chutia,dimasa};assert(contains(all[owner],xy([lat,lon])),`${owner} must own ${lat},${lon}`);
 for(const [id,mp] of Object.entries(all))if(id!==owner)assert(!contains(mp,xy([lat,lon])),`${id} crosses ${owner}'s river frontier`);
}
const vertexSet=mp=>new Set(mp.flat(2).map(p=>p.join(',')));
for(const [river,left,right] of [['dihing',ahom,chutia],['dikhou',ahom,dimasa]]){
 const l=vertexSet(left),r=vertexSet(right),shared=A.rivers[river].pts.map(xy).filter(p=>l.has(p.join(','))&&r.has(p.join(',')));
 assert(shared.length>=20,`${river} frontier must reuse at least 20 exact shared river vertices (got ${shared.length})`);
}
for(const year of [1275,1496,1750]) for(const id of D.growth.boundaryRevision.kachariPeakDistricts){
 const district=pc.union(...A.districts[id].rings.map(r=>[r.map(xy)]));
 const coverage=area(pc.intersection(domain('dimasa',year),district))/area(district);
 assert(coverage>.995,`${year} ${id}: only ${(coverage*100).toFixed(2)}% of district included at adopted maximum`);
}
const bhuyan=domain('bhuyan',1449);
for(const [lat,lon] of [[26.78,93.1],[26.87,93.6],[26.6,91.95],[26.4,92.6]])assert(contains(bhuyan,xy([lat,lon])),`Bhuyan river sector missing ${lat},${lon}`);
assert(shapes('bhuyan',1449).length===4,'Keep four separately drawn river-bounded chiefdom sectors');
console.log('PASS: both sides of Dehing/Dikhou, exact shared river vertices, all six maximum-extent districts, and four separate Bhuyan river sectors.');
