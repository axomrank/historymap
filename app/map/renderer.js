'use strict';
// Owns SVG layers and shape reuse; viewport and selection are supplied by the controller.
window.createAtlasMap = function ({ D, P, S, $, esc, NS, svg, px, getState, getViewport, currentColonialGroup, statehoodDate }) {
  const vb = getViewport();
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = `<defs id="defs"></defs>
    <g id="gLand">${D.base.countries.map(c => `<path class="m-land" d="${c.d}"><title>${esc(c.name)} (today)</title></path>`).join('')}</g>
    <g id="gRelief">${(D.base.ridges || []).map(r => `<path class="ridge-reference" d="${r.d}"><title>${esc(r.name)} · geographic ridge reference</title></path>`).join('')}</g><g id="gRealms"></g>
    <g id="gRivers">${D.base.rivers.map(r => `<path class="m-river" d="${r.d}" stroke-width="${[0.7, 1.3, 2.6][r.m]}" opacity="${[0.55, 0.8, 0.95][r.m]}"><title>${esc(r.n)}</title></path>`).join('')}</g>
    <g class="g-modern">${D.base.modern.map(m => `<path class="m-modern${m.assam ? ' assam' : ''}" d="${m.d}"/>`).join('')}
      ${D.base.towns.map(([n, x, y]) => `<g class="m-town"><circle cx="${x}" cy="${y}" r="1.8"/><text x="${x + 4}" y="${y + 3.5}">${esc(n)}</text></g>`).join('')}</g>
    <g id="pithaRivers">${D.pithas.rivers.map(r => `<path class="pitha-boundary" d="${r.d}"><title>${esc(r.name === 'Rupahi*' ? D.pithas.note : r.name)}</title></path>`).join('')}</g>
    <g id="gLabels"></g><g id="gPithaLabels"></g><g id="gCaps"></g><g id="gHistorySpots"></g>
    <g id="gJourney"></g><g id="gSankardeva"></g>
    <g id="gRiverHits">${D.base.rivers.map((r, i) => `<path class="river-hit" data-river="${i}" d="${r.d}" tabindex="0" role="button" aria-label="River: ${esc(r.n)}"><title>${esc(r.n)}</title></path>`).join('')}</g><g id="gColonialSpots"></g>`;
  // hatch patterns for "campaign reach" shapes
  $('defs').innerHTML = P.map((p, i) => `<pattern id="h${i}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${p.color}" fill-opacity=".18"/><line x1="0" y1="0" x2="0" y2="7" stroke="${p.color}" stroke-width="3"/></pattern>`).join('');
  // A local state's identity can coexist with British paramountcy or Indian membership.
  $('defs').innerHTML += Object.entries(D.colonial.authorities).filter(([,a]) => a.pattern).flatMap(([id,a]) => P.map((p,i) => `<pattern id="authority-${id}-${i}" data-authority-pattern="true" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${p.color}" fill-opacity=".2"/><line x1="0" y1="0" x2="0" y2="8" stroke="${a.color}" stroke-width="3.5"/></pattern>`)).join('');
  $('defs').innerHTML += P.map((p,i) => `<pattern id="ut-${i}" data-ut-pattern="true" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${p.color}" fill-opacity=".35"/><path d="M0 4H8" stroke="#f08a24" stroke-width="2"/></pattern>`).join('');
  $('defs').innerHTML += '<marker id="journeyArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="#c0392b"/></marker>';
  $('defs').innerHTML += '<marker id="migrationArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#d9a34b"/></marker>';

  const darker = hex => { const n = parseInt(hex.slice(1), 16); const f = c => Math.round(c * .62).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };
  let shown = new Map();
  function drawMap() {
    const { year, sel, colonialGroup, colourMode } = getState();
    const vb = getViewport();
    document.body.classList.toggle('statehood-mode', currentColonialGroup() === 'statehood' && year >= 1947);
    $('colonialLegend').hidden = year < 1805;
    $('legendBritish').hidden = year >= 1947;
    $('legendProtected').hidden = year >= 1947;
    $('legendIndia').hidden = year < 1947;
    $('legendIndiaText').textContent = colourMode === 'states' ? 'Indian states · distinct colours' : 'India · state / central administration';
    $('legendIndiaSwatch').className = colourMode === 'states' ? 'legend-states' : 'legend-india';
    $('legendUT').hidden = colourMode !== 'states' || year < 1956 || year >= 1987;
    $('colourMode').value = colourMode;
    $('legendAccession').hidden = year < 1947 || year > 1948;
    $('legendIndianProtection').hidden = year < 1950 || year >= 1975;
    $('journeyChip').textContent = year < 1228 ? `1215–1228 · travelling · ${year} · illustrative pacing ↗` : '1215–1228 · Mong Mao → Patkai · reconstructed ↗';
    $('journeyChip').hidden = !(year >= 1215 && year <= 1267 && (sel < 0 || P[sel].id === 'ahom'));
    $('sankardevaChip').hidden = year < 1449 || year > 1568;
    $('sankardevaChip').textContent = `Sankardeva · ${year} · approximate journey ↗`;
    $('pithaRivers').style.display = year < 1100 ? '' : 'none';
    svg.classList.toggle('pitha-era', year < 1100);
    const regionalPhase = D.ratna.phases.find(r => year >= r.start && year <= r.end);
    $('ratnaChip').hidden = !regionalPhase;
    if (regionalPhase) $('ratnaChip').textContent = 'Ratnapitha · ' + regionalPhase.title + ' ↗';
    const list = D.states[D.years[year - S]];
    const g = $('gRealms'), next = new Map();
    list.forEach(si => {
      let el = shown.get(si);
      if (!el) {
        const sh = D.shapes[si], t = D.territories[sh.t], p = P[t.p];
        el = document.createElementNS(NS, 'path');
        el.setAttribute('d', sh.d);
        el.setAttribute('class', 'realm enter' + (t.authority ? ' affiliated' : '') + (t.style === 'reach' ? ' reach' : '') + (t.style === 'context' ? ' context' : '') + (t.style === 'protected' ? ' protected' : '') + (t.conf === 'low' || t.style === 'legend' ? ' unsure' : ''));
        el.setAttribute('stroke', darker(p.color));
        el.dataset.si = si;
        el.dataset.authority = t.authority;
      }
      next.set(si, el);
    });
    shown.forEach((el, si) => { if (!next.has(si)) el.remove(); });
    list.forEach(si => g.appendChild(next.get(si)));   // keep paint order
    shown = next;
    shown.forEach((el, si) => {
      const t = D.territories[D.shapes[si].t], p = t.p;
      const appearance = AtlasMapAppearance.paint(P[p],t,year,colourMode,D.colonial.authorities,D.colonial.statehood);
      el.setAttribute('fill',appearance.fill);
      el.dataset.stage = appearance.stage;
      el.classList.toggle('country',appearance.country);
      el.classList.toggle('union-territory',appearance.stage === 'union-territory');
      el.classList.toggle('sel', p === sel);
      const frontierView = sel >= 0 && year >= 1614 && year <= 1682 && ['mughal','ahom'].includes(P[sel].id);
      const conquestView = sel >= 0 && year >= 1612 && year <= 1616 && ['mughal','koch-hajo'].includes(P[sel].id);
      const colonialView = year >= 1805 && (colonialGroup || (sel >= 0 && ['british','matak','sadiya-local'].includes(P[sel].id)));
      el.classList.toggle('dim', sel >= 0 && p !== sel && !colonialView && !(conquestView && ['mughal','koch-hajo'].includes(P[p].id)) && !(frontierView && ['mughal','ahom'].includes(P[p].id)));
    });
    drawMapChange();
    drawLabels(list);
  }

  function drawMapChange() {
    const { year, sel, colonialGroup, colourMode } = getState();
    const vb = getViewport();
    const box = $('mapChange');
    box.hidden = year < 1947;
    if (box.hidden) return;
    const ids = sel >= 0 ? [P[sel].id] : D.colonial.statehood.map(s => s.id);
    const rows = D.colonial.statehood.filter(s => ids.includes(s.id));
    const changes = rows.flatMap(s => s.milestones.filter(m => m.year === year).map(m => `${s.name}: ${m.label}`));
    if (changes.length) box.textContent = `${year} · ${[...new Set(changes)].join(' · ')}`;
    else if (sel >= 0 && rows.length) {
      const s = rows[0], m = [...s.milestones].reverse().find(m => m.year <= year);
      box.textContent = m ? `${s.name} · ${m.label} since ${statehoodDate(m.date)} · ${s.id === 'sikkim' && year < 1975 ? 'Indian protectorate' : 'India'}` : `${s.name} · before full statehood`;
    } else box.textContent = `${year} · Indian states have separate colours; Union Territories use a pattern`;
  }

  function drawLabels(list) {
    const { year, sel, colonialGroup, colourMode } = getState();
    const vb = getViewport();
    const k = vb.w / D.W;                       // 1 = fully zoomed out
    const pithaScale = 1 / Math.min(svg.clientWidth / vb.w, svg.clientHeight / vb.h);
    svg.querySelectorAll('[data-authority-pattern]').forEach(p => p.setAttribute('patternTransform', `rotate(45) scale(${pithaScale})`));
    svg.querySelectorAll('[data-ut-pattern]').forEach(p => p.setAttribute('patternTransform', `scale(${pithaScale})`));
    // Keep modern reference labels readable when a colonial region is zoomed in.
    svg.querySelectorAll('.m-town').forEach((el, i) => {
      const town = D.base.towns[i], scale = year >= 1805 ? pithaScale : 1;
      const text = el.querySelector('text'), circle = el.querySelector('circle');
      text.style.fontSize = `${(year >= 1805 ? 8 : 10) * scale}px`;
      text.setAttribute('x', town[1] + 4 * scale); text.setAttribute('y', town[2] + 3.5 * scale);
      circle.setAttribute('r', 1.8 * scale);
    });
    const seen = new Set(), out = [];
    // biggest piece of each polity gets the label (or the territory's own label, e.g. "Nagaland")
    [...list].sort((a, b) => D.shapes[b].a - D.shapes[a].a).forEach(si => {
      const sh = D.shapes[si], t = D.territories[sh.t], p = P[t.p];
      if (t.label === 'Paundravardhana / Ratnapitha') return;
      if (!sh.l) return;
      const name = t.label || shortName(p.name), key = p.id === 'bhuyan' ? t.id : t.p + '|' + name;
      if (seen.has(key)) return; seen.add(key);
      if (p.id === 'bhuyan') {
        const fs = 8 * pithaScale;
        out.push(`<text class="lbl bhuyan-label" aria-label="Bhuyan Confedaracy" x="${sh.l[0]}" y="${sh.l[1] - fs * .55}" font-size="${fs}"><tspan x="${sh.l[0]}">Bhuyan </tspan><tspan x="${sh.l[0]}" dy="${fs * 1.15}">Confedaracy</tspan></text>`);
        return;
      }
      const r = sh.l[2];
      const fs = Math.min(22, Math.max(10, r * .5)) * Math.max(k, .45);
      if (r / k < 9) return;                 // too small at this zoom
      const lines = wrap(name, Math.max(8, Math.round(r * 2.2 / (fs * .55))));
      const labelSize = year >= 1805 ? Math.min(fs, 13 * pithaScale) : fs;
      const labelLines = year >= 1805 ? wrap(name, Math.max(11, Math.round(r * 2.2 / (labelSize * .55)))) : lines;
    out.push(`<text class="lbl" x="${sh.l[0]}" y="${sh.l[1] - (labelLines.length - 1) * labelSize * .55}" font-size="${labelSize.toFixed(1)}">${labelLines.map((ln, i) => `<tspan x="${sh.l[0]}" dy="${i ? labelSize * 1.1 : labelSize * .35}">${esc(ln)}</tspan>`).join('')}</text>`);
    });
    $('gLabels').innerHTML = out.join('');
    $('gPithaLabels').innerHTML = year < 1100 ?
      D.pithas.labels.map((p, i) => `<text class="pitha-label" x="${p.x}" y="${p.y}" font-size="${(i === 0 ? 6 : 8) * pithaScale}">${i === 0 ? `<tspan x="${p.x}">Paundravardhana</tspan><tspan x="${p.x}" dy="${8 * pithaScale}">/ Ratnapitha</tspan>` : `<tspan x="${p.x}">${esc(p.name.replace('pitha', ''))}</tspan><tspan x="${p.x}" dy="${9 * pithaScale}">pitha</tspan>`}</text>`).join('') +
      D.pithas.rivers.map(r => `<text class="pitha-river-label" x="${r.label[0] + 4 * pithaScale}" y="${r.label[1]}" font-size="${7 * pithaScale}">${esc(r.name)}</text>`).join('') : '';
    // capitals of polities on the map this year
    const on = new Set(list.map(si => D.territories[D.shapes[si].t].p));
    $('gCaps').innerHTML = [...on].filter(pi => !(year >= 1100 && year <= 1270 && ['late-kamarupa', 'kamata'].includes(P[pi].id))).flatMap(pi => P[pi].capitals.filter(c => year >= c[3] && year <= c[4]).map(c =>
      `<g class="cap"><circle cx="${c[1]}" cy="${c[2]}" r="${4.5 * (year >= 1805 || P[pi].id === 'koch' ? pithaScale : Math.max(k, .5))}" fill="${darker(P[pi].color)}"/><text x="${c[1] + 7 * (year >= 1805 || P[pi].id === 'koch' ? pithaScale : Math.max(k, .5))}" y="${c[2] - 5 * (year >= 1805 || P[pi].id === 'koch' ? pithaScale : Math.max(k, .5))}" style="font-size:${(11 * (year >= 1805 || P[pi].id === 'koch' ? pithaScale : Math.max(k, .55))).toFixed(1)}px">★ ${esc(c[0])}</text></g>`)).join('');
    $('gHistorySpots').innerHTML = year >= 1100 && year <= 1270 ? D.postPala.spots.filter(s => year >= s.start && year <= s.end).map(s =>
      `<g class="history-spot"><circle cx="${s.x}" cy="${s.y}" r="${3 * pithaScale}"/><text x="${s.x + 5 * pithaScale}" y="${s.y + (s.id === 'capital-north' ? 13 : -5) * pithaScale}" font-size="${9 * pithaScale}">${esc(s.name)}</text><title>${esc(s.kind + ': ' + s.note)}</title></g>`).join('') : '';
    drawSankardeva(pithaScale);
    drawColonialSpots(pithaScale);
    const show = p => sel < 0 || P[sel].id === p || (year >= 1612 && year <= 1616 && ['mughal','koch-hajo'].includes(P[sel].id) && ['mughal','koch-hajo'].includes(p)) || (sel >= 0 && year >= 1614 && year <= 1682 && ['mughal','ahom'].includes(P[sel].id) && ['mughal','ahom'].includes(p));
    const routes = D.growth.routes.filter(r => year >= r.start && year <= r.end && show(r.polity));
    const migration = routes.find(r => r.progress);
    const fraction = migration ? Math.max(0, Math.min(1, (year - 1215) / 13)) : 1;
    const spots = D.growth.spots.filter(s => year >= s.start && year <= s.end && show(s.polity) &&
      !(year < 1228 && ['waingmaw-corridor','mogaung-corridor','hukawng-corridor','nong-yang-corridor','pangsau'].includes(s.id)));
    const travelled = r => {
      if (!r.progress) return r.d;
      const pts = r.points.map(([lat,lon]) => px(lon,lat));
      const lengths = pts.slice(1).map((p,i) => Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]));
      let remaining = lengths.reduce((a,b)=>a+b,0)*fraction, out=[pts[0]];
      for(let i=0;i<lengths.length;i++) { const f=Math.min(1,remaining/lengths[i]); out.push([pts[i][0]+(pts[i+1][0]-pts[i][0])*f,pts[i][1]+(pts[i+1][1]-pts[i][1])*f]); remaining-=lengths[i]; if(remaining<=0)break; }
      if (out.length < 3) return 'M'+out.map(p=>p.join(' ')).join('L');
      let path='M'+out[0].join(' ');
      for(let i=1;i<out.length-1;i++)path+='Q'+out[i].join(' ')+' '+[(out[i][0]+out[i+1][0])/2,(out[i][1]+out[i+1][1])/2].join(' ');
      return path+'L'+out.at(-1).join(' ');
    };
    $('gJourney').innerHTML = routes.map(r => `<path class="journey-route${r.kind === 'reconstruction' ? ' migration-route' : ''}" data-route="${esc(r.id)}" d="${travelled(r)}" stroke="${r.color || P.find(p => p.id === r.polity).color}" marker-end="url(#${r.kind === 'reconstruction' ? 'migrationArrow' : 'journeyArrow'})" ${r.id === 'dihing-excursion' ? 'marker-start="url(#journeyArrow)"' : ''}><title>${esc(r.note)}</title></path>`).join('') + spots.map(s => {
      const color = s.color || P.find(p => p.id === s.polity).color;
      return `<g class="journey-spot" data-spot="${esc(s.id)}" tabindex="0" role="button" aria-label="${esc(s.name + ': ' + s.date)}"><circle cx="${s.x}" cy="${s.y}" r="${3.5 * pithaScale}" fill="${color}"/>${s.hideLabel ? '' : `<text x="${s.x + (s.dx || 6) * pithaScale}" y="${s.y + (s.dy || -7) * pithaScale}" font-size="${(s.fontSize || 9) * pithaScale}" ${s.anchor ? `text-anchor="${s.anchor}"` : ''}>${esc(s.name)}</text>`}<title>${esc(s.date + ' · ' + s.note)}</title></g>`;
    }).join('');
  }
  function drawColonialSpots(scale) {
    const { year, sel, colonialGroup, colourMode } = getState();
    const vb = getViewport();
    const group = currentColonialGroup();
    const spots = D.colonial.spots.filter(s => year >= s.start && year <= s.end && (group === 'overview' || group === 'province' || s.group === group));
    $('gColonialSpots').innerHTML = spots.map(s => `<g class="colonial-spot" data-colonial-spot="${esc(s.id)}" tabindex="0" role="button" aria-label="${esc(s.name)}"><circle cx="${s.x}" cy="${s.y}" r="${4 * scale}"/>${group === 'matak' ? '' : `<text x="${s.x + 6 * scale}" y="${s.y - 7 * scale}" font-size="${10 * scale}">${esc(s.name)}</text>`}<title>${esc(s.note)}</title></g>`).join('');
  }
  function drawSankardeva(scale) {
    const { year, sel, colonialGroup, colourMode } = getState();
    const vb = getViewport();
    const g = $('gSankardeva');
    if (year < 1449 || year > 1568) { g.innerHTML = ''; return; }
    const state = SankardevaJourney.at(D.sankardeva, year);
    const local = state.routes.filter(r => !r.id.includes('pilgrimage'));
    g.innerHTML = local.filter(r => r.trail.length > 1).map(r =>
      `<path class="journey-route sankardeva-route" data-sankardeva-route="${r.id}" d="M${r.trail.map(([lat, lon]) => px(lon, lat).join(' ')).join('L')}"><title>${esc(r.label)}</title></path>`).join('') +
      state.points.filter(p => p.kind !== 'pilgrimage' && !p.name.startsWith('Bordowa Than')).map(p => {
        const [x,y] = px(p.lon,p.lat);
        return `<g class="journey-spot" data-sankardeva-pin="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)}"><circle cx="${x}" cy="${y}" r="${3.5*scale}" fill="#c0392b"/><title>${esc(p.name + ' · ' + p.note)}</title></g>`;
      }).join('');
    if (state.current && !state.current.id.includes('pilgrimage')) {
      const [lat,lon] = state.current.head, [x,y] = px(lon,lat);
      g.innerHTML += `<circle class="sankardeva-head" cx="${x}" cy="${y}" r="${6*scale}"><title>Sankardeva · ${year} · illustrative position</title></circle>`;
    }
  }
  const shortName = n => n.replace(/^Kamarupa: /, 'Kamarupa · ').replace(/ \(Konbaung\)/, '').replace(/ \(independent India\)/, '');
  function wrap(s, w) {
    const words = s.split(' '), lines = [''];
    words.forEach(wd => { const l = lines[lines.length - 1]; if (l && (l + ' ' + wd).length > w) lines.push(wd); else lines[lines.length - 1] = l ? l + ' ' + wd : wd; });
    return lines.slice(0, 3);
  }


return { drawMap, drawLabels };
};
