/* Sankardeva's journeys: the same route model as the main historical atlas. */
Promise.all([
  fetch('data/features/sankardeva/sankardeva-routes.json?v=5').then(r => { if (!r.ok) throw new Error('Route data unavailable'); return r.json(); }),
  fetch('data/source/sources.json').then(r => { if (!r.ok) throw new Error('Sources unavailable'); return r.json(); }),
  fetch('data/maps/pilgrimage-countries.json').then(r => { if (!r.ok) throw new Error('Map outlines unavailable'); return r.json(); })
]).then(([records, sources, countries]) => {
  const D = AtlasDatasets.hydrate(records, sources);
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = v => Math.max(1449, Math.min(1568, Math.round(Number(v) || 1449)));
  let year = clamp(/y=(\d+)/.exec(location.hash)?.[1]), timer;
  function draw() {
    const [w,e,s,n] = $('view').value === 'india' ? [67,99,7,33] : [89,95,25.8,27.5];
    const project = ([lat,lon]) => [(lon-w)/(e-w)*1000,(n-lat)/(n-s)*620];
    const path = pts => 'M'+pts.map(p => project(p).join(' ')).join('L');
    const state = SankardevaJourney.at(D, year);
    let h = countries.map(c => `<path class="land" d="${c.rings.map(r => path(r)+'Z').join('')}"><title>${esc(c.name)} · modern outline</title></path>`).join('');
    h += state.routes.filter(r => r.trail.length > 1).map(r => `<path class="route" data-route="${r.id}" d="${path(r.trail)}" style="stroke:${r.id.includes('pilgrimage')?'#487fa1':'#b52f1d'}"><title>${esc(r.label)}</title></path>`).join('');
    h += state.points.map(t => {
      const [x,y] = project([t.lat,t.lon]);
      return `<g data-pin="${t.id}" role="button" tabindex="0" aria-label="${esc(t.name)}"><circle class="pin ${t.kind==='pilgrimage'?'pilgrim':''}" cx="${x}" cy="${y}" r="5"/><text x="${x+8}" y="${y-8}">${D.points.indexOf(t)+1}</text><title>${esc(t.name+' · '+t.note)}</title></g>`;
    }).join('');
    if (state.current) {
      const [x,y] = project(state.current.head);
      h += `<circle class="route-head" cx="${x}" cy="${y}" r="8"><title>Illustrative route position · ${year}</title></circle>`;
    }
    $('map').innerHTML = h;
    $('panel').innerHTML = `<h2>${year}</h2><p><b>${esc(state.current?.label || 'Birthplace and early-life reference sites')}</b></p><p class="note">${esc(D.animationNote)}</p><p>${esc(D.note)}</p>` + state.points.map(t => `<div class="stop"><b>${D.points.indexOf(t)+1}. ${esc(t.name)}</b><p class="note">${esc(t.note)}</p></div>`).join('') + `<h3>Unlocated places</h3><p>${D.unlocated.map(esc).join(', ')} remain unpinned.</p><h3>Sources</h3>` + D.sources.map((u,i) => `<p><a href="${u}">Source ${i+1}</a></p>`).join('');
    $('number').value = $('year').value = year;
    history.replaceState(null,'','#y='+year);
  }
  function stop() { clearInterval(timer); timer=null; $('play').textContent='▶ Play'; }
  const pilgrimage = y => (y >= 1481 && y <= 1493) || (y >= 1550 && y <= 1551);
  $('view').value = pilgrimage(year) ? 'india' : 'assam';
  function set(v) { const next=clamp(v); if(pilgrimage(next) !== pilgrimage(year)) $('view').value=pilgrimage(next) ? 'india' : 'assam'; year=next; draw(); }
  $('year').oninput = e => { stop(); set(e.target.value); };
  $('number').onchange = e => { stop(); set(e.target.value); };
  $('view').onchange = draw;
  $('play').onclick = () => {
    if (timer) { stop(); return; }
    if (year === 1568) set(1449);
    $('play').textContent = '❚❚ Pause';
    timer = setInterval(() => { if(year >= 1568) stop(); else set(year+1); }, 400);
  };
  function inspect(e) {
    const pin=e.target.closest('[data-pin]');
    if (!pin) return;
    const t=D.points.find(p => p.id === pin.dataset.pin);
    $('panel').innerHTML=`<h2>${esc(t.name)}</h2><p>${esc(t.note)}</p><p>${esc(t.chronology)}</p><button id="back">Back to year</button>`;
    $('back').onclick=draw;
  }
  $('map').onclick=inspect;
  $('map').onkeydown=e => { if(['Enter',' '].includes(e.key)) {e.preventDefault(); inspect(e);} };
  window.addEventListener('hashchange', () => set(/y=(\d+)/.exec(location.hash)?.[1]));
  draw();
}).catch(error => { document.getElementById('panel').textContent = error.message + '. Please reload to try again.'; });
