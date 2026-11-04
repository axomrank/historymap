/* Assam Through Time: one map per year, 350 CE to today, built by tools/build.js into window.ATLAS. */
(() => {
  'use strict';
  const D = window.ATLAS;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NS = 'http://www.w3.org/2000/svg';
  const S = D.start, E = D.end, N = E - S + 1;
  const ERAS = [
    [350, 1099, 'Ancient Kamarupa'],
    [1100, 1227, 'Kamarupa breaks apart'],
    [1228, 1514, 'Ahom, Chutia, Dimasa and Kamata'],
    [1515, 1681, 'Koch, Ahom and Mughal wars'],
    [1682, 1825, 'The Ahom kingdom at its height and fall'],
    [1826, 1946, 'British Assam'],
    [1947, 2026, 'Independent India'],
  ];
  const eraOf = y => ERAS.find(e => y >= e[0] && y <= e[1]);

  /* ---------- per-year area of every polity (drives the bands and the status words) ---------- */
  const P = D.polities, NP = P.length;
  const stateArea = D.states.map(list => {
    const a = new Float64Array(NP);
    list.forEach(si => { const sh = D.shapes[si], t = D.territories[sh.t]; if (t.style === 'core') a[t.p] += sh.a; });
    return a;
  });
  const areaAt = (p, y) => (y < S || y > E) ? 0 : stateArea[D.years[y - S]][p];
  P.forEach((p, i) => {
    let best = 0, by = p.start;
    for (let y = p.start; y <= p.end; y++) { const a = areaAt(i, y); if (a > best + 1) { best = a; by = y; } }
    p.max = best; p.peak = by;
  });
  const changeYears = [];
  const evidenceYears = new Set(D.growth.phases.map(p => p.start));
  for (let y = S + 1; y <= E; y++) if (D.years[y - S] !== D.years[y - S - 1] || evidenceYears.has(y)) changeYears.push(y);

  /* ---------- state ---------- */
  let year = S, sel = -1, playing = null;
  const fromHash = () => {
    const m = /y=(\d{3,4})/.exec(location.hash); if (m) year = clamp(+m[1]);
    const p = /k=([\w-]+)/.exec(location.hash); if (p) sel = P.findIndex(x => x.id === p[1]);
  };
  const clamp = y => Math.max(S, Math.min(E, Math.round(y)));

  /* ---------- map ---------- */
  const svg = $('map');
  const full = { x: 0, y: 0, w: D.W, h: D.H };
  const px = (lon, lat) => [(lon - D.proj.lon0) / (D.proj.lon1 - D.proj.lon0) * D.W, (D.proj.lat1 - lat) / (D.proj.lat1 - D.proj.lat0) * D.H];
  const home = (() => { const [x0, y0] = px(88.4, 28.7), [x1] = px(96.7, 23.9); return { x: x0, y: y0, w: x1 - x0, h: (x1 - x0) * D.H / D.W }; })();   // the Brahmaputra and Barak valleys
  let vb = { ...home };
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
    <g id="gRiverHits">${D.base.rivers.map((r, i) => `<path class="river-hit" data-river="${i}" d="${r.d}" tabindex="0" role="button" aria-label="River: ${esc(r.n)}"><title>${esc(r.n)}</title></path>`).join('')}</g>`;
  // hatch patterns for "campaign reach" shapes
  $('defs').innerHTML = P.map((p, i) => `<pattern id="h${i}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${p.color}" fill-opacity=".18"/><line x1="0" y1="0" x2="0" y2="7" stroke="${p.color}" stroke-width="3"/></pattern>`).join('');
  $('defs').innerHTML += '<marker id="journeyArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="#c0392b"/></marker>';
  $('defs').innerHTML += '<marker id="migrationArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#d9a34b"/></marker>';

  const darker = hex => { const n = parseInt(hex.slice(1), 16); const f = c => Math.round(c * .62).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };
  let shown = new Map();
  function drawMap() {
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
        el.setAttribute('class', 'realm enter' + (t.style === 'reach' ? ' reach' : '') + (t.conf === 'low' || t.style === 'legend' ? ' unsure' : ''));
        el.setAttribute('fill', t.style === 'reach' ? `url(#h${t.p})` : p.color);
        el.setAttribute('stroke', darker(p.color));
        el.dataset.si = si;
      }
      next.set(si, el);
    });
    shown.forEach((el, si) => { if (!next.has(si)) el.remove(); });
    list.forEach(si => g.appendChild(next.get(si)));   // keep paint order
    shown = next;
    shown.forEach((el, si) => {
      const p = D.territories[D.shapes[si].t].p;
      el.classList.toggle('sel', p === sel);
      el.classList.toggle('dim', sel >= 0 && p !== sel);
    });
    drawLabels(list);
  }

  function drawLabels(list) {
    const k = vb.w / D.W;                       // 1 = fully zoomed out
    const pithaScale = 1 / Math.min(svg.clientWidth / vb.w, svg.clientHeight / vb.h);
    const seen = new Set(), out = [];
    // biggest piece of each polity gets the label (or the territory's own label, e.g. "Nagaland")
    [...list].sort((a, b) => D.shapes[b].a - D.shapes[a].a).forEach(si => {
      const sh = D.shapes[si], t = D.territories[sh.t], p = P[t.p];
      if (t.label === 'Paundravardhana / Ratnapitha') return;
      if (!sh.l) return;
      const name = t.label || shortName(p.name), key = t.p + '|' + name;
      if (seen.has(key)) return; seen.add(key);
      const r = sh.l[2];
      const fs = Math.min(22, Math.max(10, r * .5)) * Math.max(k, .45);
      if (r / k < 9) return;                 // too small at this zoom
      const lines = wrap(name, Math.max(8, Math.round(r * 2.2 / (fs * .55))));
      out.push(`<text class="lbl" x="${sh.l[0]}" y="${sh.l[1] - (lines.length - 1) * fs * .55}" font-size="${fs.toFixed(1)}">${lines.map((ln, i) => `<tspan x="${sh.l[0]}" dy="${i ? fs * 1.1 : fs * .35}">${esc(ln)}</tspan>`).join('')}</text>`);
    });
    $('gLabels').innerHTML = out.join('');
    $('gPithaLabels').innerHTML = year < 1100 ?
      D.pithas.labels.map((p, i) => `<text class="pitha-label" x="${p.x}" y="${p.y}" font-size="${(i === 0 ? 6 : 8) * pithaScale}">${i === 0 ? `<tspan x="${p.x}">Paundravardhana</tspan><tspan x="${p.x}" dy="${8 * pithaScale}">/ Ratnapitha</tspan>` : `<tspan x="${p.x}">${esc(p.name.replace('pitha', ''))}</tspan><tspan x="${p.x}" dy="${9 * pithaScale}">pitha</tspan>`}</text>`).join('') +
      D.pithas.rivers.map(r => `<text class="pitha-river-label" x="${r.label[0] + 4 * pithaScale}" y="${r.label[1]}" font-size="${7 * pithaScale}">${esc(r.name)}</text>`).join('') : '';
    // capitals of polities on the map this year
    const on = new Set(list.map(si => D.territories[D.shapes[si].t].p));
    $('gCaps').innerHTML = [...on].filter(pi => !(year >= 1100 && year <= 1270 && ['late-kamarupa', 'kamata'].includes(P[pi].id))).flatMap(pi => P[pi].capitals.filter(c => year >= c[3] && year <= c[4]).map(c =>
      `<g class="cap"><circle cx="${c[1]}" cy="${c[2]}" r="${4.5 * Math.max(k, .5)}" fill="${darker(P[pi].color)}"/><text x="${c[1] + 7 * Math.max(k, .5)}" y="${c[2] - 5 * Math.max(k, .5)}" font-size="${(11 * Math.max(k, .55)).toFixed(1)}">★ ${esc(c[0])}</text></g>`)).join('');
    $('gHistorySpots').innerHTML = year >= 1100 && year <= 1270 ? D.postPala.spots.filter(s => year >= s.start && year <= s.end).map(s =>
      `<g class="history-spot"><circle cx="${s.x}" cy="${s.y}" r="${3 * pithaScale}"/><text x="${s.x + 5 * pithaScale}" y="${s.y + (s.id === 'capital-north' ? 13 : -5) * pithaScale}" font-size="${9 * pithaScale}">${esc(s.name)}</text><title>${esc(s.kind + ': ' + s.note)}</title></g>`).join('') : '';
    drawSankardeva(pithaScale);
    const show = p => sel < 0 || P[sel].id === p;
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
      return `<g class="journey-spot" data-spot="${esc(s.id)}" tabindex="0" role="button" aria-label="${esc(s.name + ': ' + s.date)}"><circle cx="${s.x}" cy="${s.y}" r="${3.5 * pithaScale}" fill="${color}"/><text x="${s.x + (s.dx || 6) * pithaScale}" y="${s.y + (s.dy || -7) * pithaScale}" font-size="${(s.fontSize || 9) * pithaScale}" ${s.anchor ? `text-anchor="${s.anchor}"` : ''}>${esc(s.name)}</text><title>${esc(s.date + ' · ' + s.note)}</title></g>`;
    }).join('');
  }
  function drawSankardeva(scale) {
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

  /* hover / click on the map */
  const tip = $('tip');
  let pinnedTip = false;
  function placeTip(html, cx, cy) {
    tip.innerHTML = html;
    tip.hidden = false;
    const r = svg.parentNode.getBoundingClientRect();
    tip.style.left = Math.max(4, Math.min(cx - r.left + 14, r.width - tip.offsetWidth - 6)) + 'px';
    tip.style.top = Math.max(4, Math.min(cy - r.top + 14, r.height - tip.offsetHeight - 6)) + 'px';
  }
  function featureTip(target, cx, cy) {
    const sankardevaPin = target.closest('[data-sankardeva-pin]');
    if (sankardevaPin) {
      const p = D.sankardeva.points.find(p => p.id === sankardevaPin.dataset.sankardevaPin);
      placeTip(`<b>${esc(p.name)}</b><br>${esc(p.note)}<br>${esc(p.chronology)}`, cx, cy);
      return true;
    }
    const river = target.closest('[data-river]'), spot = target.closest('[data-spot]');
    if (river) {
      const r = D.base.rivers[+river.dataset.river];
      document.querySelectorAll('.river-hit.active').forEach(el => el.classList.remove('active'));
      river.classList.add('active');
      placeTip(`<b>${esc(r.n)}</b><br><span>River · mapped present-day course</span>`, cx, cy);
      return true;
    }
    if (spot) {
      const s = D.growth.spots.find(s => s.id === spot.dataset.spot);
      placeTip(`<b>${esc(s.name)}</b><br>${esc(s.date)}<br>${esc(s.note)}`, cx, cy);
      return true;
    }
    return false;
  }
  function hideTip() {
    pinnedTip = false; tip.hidden = true;
    document.querySelectorAll('.river-hit.active').forEach(el => el.classList.remove('active'));
  }
  svg.addEventListener('pointermove', e => {
    if (dragging) { if (moved) hideTip(); return; }
    if (pinnedTip) return;
    if (featureTip(e.target, e.clientX, e.clientY)) return;
    document.querySelectorAll('.river-hit.active').forEach(el => el.classList.remove('active'));
    const el = e.target.closest('.realm');
    if (!el || dragging) { tip.hidden = true; return; }
    const t = D.territories[D.shapes[+el.dataset.si].t], p = P[t.p];
    tip.innerHTML = `<b>${esc(t.label && t.label !== p.name ? `${p.name}: ${t.label}` : p.name)}</b><br>${p.start}–${p.end >= E ? 'today' : p.end}${t.style === 'reach' ? '<br><i>campaign reach, not a border</i>' : t.conf === 'low' ? '<br><i>border uncertain</i>' : ''}`;
    const r = svg.parentNode.getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 250) + 'px';
    tip.style.top = (e.clientY - r.top + 14) + 'px';
    tip.hidden = false;
  });
  svg.addEventListener('pointerleave', () => { if (!pinnedTip) hideTip(); });
  svg.addEventListener('click', e => {
    if (moved) return;
    if (featureTip(e.target, e.clientX, e.clientY)) { pinnedTip = true; return; }
    hideTip();
    const el = e.target.closest('.realm');
    select(el ? D.territories[D.shapes[+el.dataset.si].t].p : -1);
  });
  svg.addEventListener('focusin', e => {
    const r = e.target.getBoundingClientRect();
    featureTip(e.target, r.left + r.width / 2, r.top + r.height / 2);
  });
  svg.addEventListener('focusout', () => { if (!pinnedTip) hideTip(); });
  svg.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideTip();
    if (['Enter', ' '].includes(e.key) && e.target.matches('[data-river], [data-spot], [data-sankardeva-pin]')) {
      e.preventDefault(); const r = e.target.getBoundingClientRect();
      featureTip(e.target, r.left + r.width / 2, r.top + r.height / 2); pinnedTip = true;
    }
  });

  /* pan and zoom */
  const setVB = v => {
    const w = Math.max(D.W / 8, Math.min(D.W * 2, v.w)), h = w * v.h / v.w;
    vb = { w, h, x: Math.max(-w * .3, Math.min(D.W - w * .7, v.x)), y: Math.max(-h * .3, Math.min(D.H - h * .7, v.y)) };
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  };
  const svgPt = (cx, cy) => { const r = svg.getBoundingClientRect(), s = Math.max(vb.w / r.width, vb.h / r.height); return { x: vb.x + (cx - r.left - (r.width - vb.w / s) / 2) * s, y: vb.y + (cy - r.top - (r.height - vb.h / s) / 2) * s }; };
  const zoomAt = (f, cx, cy) => {
    const p = cx == null ? { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 } : svgPt(cx, cy);
    const w = Math.max(D.W / 8, Math.min(D.W * 2, vb.w * f)), h = w * vb.h / vb.w;
    setVB({ w, h, x: p.x - (p.x - vb.x) * w / vb.w, y: p.y - (p.y - vb.y) * h / vb.h });
    drawLabels(D.states[D.years[year - S]]);
  };
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
  $('zin').onclick = () => zoomAt(1 / 1.4);
  $('zout').onclick = () => zoomAt(1.4);
  $('zfit').onclick = () => { setVB(vb.w < D.W * .99 ? full : home); drawLabels(D.states[D.years[year - S]]); };
  function focusGrowth(id) {
    const bounds = id === 'migration' || (id === 'ahom' && year <= 1228) ? [94.1, 98.65, 23.55, 28.05] : id === 'ahom' ? (year < 1282 ? [94.1, 96.45, 26.55, 28.0] : [93.0, 96.4, 26.2, 28.2]) : id === 'chutia' ? [93.1, 96.5, 26.6, 28.5] : id === 'bhuyan' ? [90.3, 94.3, 25.9, 27.5] : [88.1, 92.1, 25.3, 27.2];
    const [x0, y0] = px(bounds[0], bounds[3]), [x1, y1] = px(bounds[1], bounds[2]);
    const ratio = svg.clientWidth / svg.clientHeight;
    const w = Math.max(x1 - x0, (y1 - y0) * ratio), h = w / ratio;
    setVB({ x: (x0 + x1 - w) / 2, y: (y0 + y1 - h) / 2, w, h });
    drawLabels(D.states[D.years[year - S]]);
  }
  let dragging = null, moved = false;
  const pts = new Map();
  svg.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && featureTip(e.target, e.clientX, e.clientY)) pinnedTip = true;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragging = { x: e.clientX, y: e.clientY, vb: { ...vb }, d: pinchDist() }; moved = false;
  });
  const pinchDist = () => { const a = [...pts.values()]; return a.length > 1 ? Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) : 0; };
  window.addEventListener('pointermove', e => {
    if (!dragging || !pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size > 1 && dragging.d) {
      const a = [...pts.values()], d = pinchDist();
      zoomAt(dragging.d / d * (vb.w / dragging.vb.w) * dragging.vb.w / vb.w, (a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2);
      dragging.d = d; moved = true; return;
    }
    const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { moved = true; svg.classList.add('dragging'); svg.setPointerCapture?.(e.pointerId); }
    if (!moved) return;
    const r = svg.getBoundingClientRect(), s = Math.max(vb.w / r.width, vb.h / r.height);
    setVB({ ...dragging.vb, x: dragging.vb.x - dx * s, y: dragging.vb.y - dy * s });
  });
  const endDrag = e => { pts.delete(e.pointerId); if (!pts.size) { dragging = null; svg.classList.remove('dragging'); } };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  /* ---------- side panel ---------- */
  function status(i) {
    const p = P[i], a = areaAt(i, year);
    if (p.id === 'late-kamarupa') return 'Several regional powers; boundaries uncertain';
    if (p.id === 'ratna-uncertain') return 'Control unresolved in this interval';
    if (p.id === 'bhuyan') return 'Separate river-bounded chiefdom sectors';
    if (p.id === 'chutia' && year < 1392) return 'Early centre reconstructed; frontiers unknown';
    if (p.id === 'ahom' && year < 1253) return 'Migration and settlement patches';
    if (year === p.start) return '<em>Rises this year</em>';
    if (year === p.end && p.end < E) return '<em>Its last year</em>';
    const pct = p.max ? a / p.max : 0;
    if (year === p.peak) return '<em>Largest mapped footprint</em>';
    const same = (u, v) => Math.abs(u - v) <= Math.max(u, v) * .03;   // ignore slivers from neighbours' borders
    let last = year - 1; while (last > p.start && same(areaAt(i, last), a)) last--;
    const before = areaAt(i, last), age = year - p.start + 1;
    let s = same(before, a) || last <= p.start && before === 0 ? (last <= p.start ? 'Unchanged since it began' : `Unchanged since ${last + 1}`)
      : before < a ? `Grew in ${last + 1}` : `Lost ground in ${last + 1}`;
    if (pct > .97) s += ', at its largest';
    return `${s} · year ${age} of ${p.end - p.start + 1}`;
  }
  // Traditional Chutia reign lists and different Bhuyan lineages cannot be
  // presented as an exact, continuous royal chronology. Use dated evidence above.
  const rulersAt = p => ['chutia', 'bhuyan'].includes(p.id) ? [] : p.rulers.filter(r => year >= r[1] && year <= r[2]).map(r => r[0]);
  const fmtKm = a => a >= 1000 ? Math.round(a / 1000).toLocaleString() + ',000 km²' : Math.round(a).toLocaleString() + ' km²';
  function activeHere() {
    const on = [...new Set(D.states[D.years[year - S]].map(si => D.territories[D.shapes[si].t].p))];
    return on.sort((a, b) => areaAt(b, year) - areaAt(a, year));
  }

  function drawPanel() {
    const on = activeHere();
    let h = growthCard() + ratnaCard() + postPalaCard() + `<h2>On the map in ${year}</h2>`;
    h += on.length ? on.map(i => {
      const p = P[i], r = rulersAt(p);
      return `<div class="pol${i === sel ? ' sel' : ''}" data-p="${i}"><span class="sw" style="background:${p.color}"></span><b>${esc(p.name)}</b><span class="st">${status(i)}${r.length ? `<br>Catalogue ruler: ${esc(r.join(', '))}` : ''}</span></div>`;
    }).join('') : '<p class="empty">No mapped kingdom this year.</p>';
    if (sel >= 0) h += card(sel);
    const evs = D.events, here = evs.filter(e => e.y === year);
    const prev = evs.filter(e => e.y < year).slice(-2), nxt = evs.filter(e => e.y > year).slice(0, 2);
    h += `<h2 style="margin-top:16px">What happened</h2>` +
      [...prev.map(e => evRow(e, '')), ...here.map(e => evRow(e, ' now')), ...nxt.map(e => evRow(e, ''))].join('');
    $('panel').innerHTML = h;
  }
  const evRow = (e, cls) => `<div class="ev${cls}" data-y="${e.y}"><span class="y">${e.y}</span><b>${esc(e.t)}</b>${cls ? `<span class="x">${esc(e.x)}</span>` : ''}</div>`;

  function growthCard() {
    if (year < 1187 || year > 1536) return '';
    const d = D.growth, ids = ['ahom', 'chutia', 'kamata', 'khen', 'bhuyan'];
    const focus = sel >= 0 && ids.includes(P[sel].id) ? P[sel].id : (year >= 1215 && year <= 1281 ? 'ahom' : 'chutia');
    const stages = d.phases.filter(p => p.polity === focus), current = stages.find(p => year >= p.start && year <= p.end);
    const sources = current ? current.sources.map(id => `<a href="${esc(d.sources[id].url)}" target="_blank" rel="noopener">${esc(d.sources[id].title)}</a>`).join(' · ') : '';
    return `<section class="growth-card"><h2>How the states took shape</h2>
      <div class="growth-tabs">${ids.map(id => `<button data-growth="${id}" aria-pressed="${id === focus}">${esc(P.find(p => p.id === id).short)}</button>`).join('')}</div>
      <button class="growth-focus" data-focus-growth="${focus}">${focus === 'ahom' && year < 1282 ? 'Focus on Sukaphaa’s journey ↗' : 'Focus on this region ↗'}</button>
      ${focus === 'ahom' && year >= 1215 && year <= 1267 ? '<button class="growth-focus full-journey" data-focus-growth="migration">Whole journey: Mong Mao → Myanmar → Assam ↗</button>' : ''}
      ${current ? `<p class="post-date">${esc(current.date)}</p><h3>${esc(current.title)}</h3><p>${esc(current.text)}</p><p class="source-links">${sources}</p>` : `<p>No securely dated stage for this selection in ${year}. Choose a date below.</p>`}
      <p class="pitha-note">Dashed trails connect reported stops; they are reconstructed corridors, not surveyed paths. Small patches locate early settlements; Bhuyan areas follow separate river-to-river sectors. Wider borders are approximate. Later evidence does not date an earlier conquest.</p>
      <details ${focus === 'ahom' && year <= 1253 ? 'open' : ''}><summary>${focus === 'ahom' ? 'Journey and expansion stages' : 'Dated evidence and changes'}</summary><div class="growth-steps">${stages.map(s => `<button data-growth-year="${s.start}" data-growth-polity="${s.polity}" ${s === current ? 'aria-current="step"' : ''}><span>${esc(s.date)}</span>${esc(s.title)}</button>`).join('')}</div></details>
      <p class="source-links"><a href="research/medieval-growth-2026-11-04/README.md">Research notes</a> · <a href="data/medieval-growth-events.csv">Events CSV</a></p>
    </section>`;
  }

  function ratnaCard() {
    const phases = D.ratna.phases, current = phases.findIndex(r => year >= r.start && year <= r.end);
    if (current < 0) return '';
    const r = phases[current], p = P[r.p];
    return `<section class="ratna-card" aria-label="Paundravardhana regional sequence">
      <h2>Paundravardhana / Ratnapitha</h2>
      <p class="ratna-bounds">Sankosh ↔ Karatoya / Teesta</p>
      <p class="pitha-note">Four pithas are labelled with red river boundaries. Rupahi* follows the catalogue’s approximate Puthimari trace.</p>
      <p class="ratna-phase"><span class="sw" style="background:${p.color}"></span><b>${esc(r.title)}</b></p>
      <p><strong>${esc(r.date_label)}</strong> <span class="badge">${esc(r.certainty)}</span></p>
      <p>${esc(r.note)}</p>
      <div class="ratna-nav">${current > 0 ? `<button data-y="${phases[current - 1].start}">← Previous phase</button>` : ''}${current < phases.length - 1 ? `<button data-y="${phases[current + 1].start}">Next phase →</button>` : ''}</div>
      <details><summary>Adopted map interpretation</summary><p>This map uses the river-bounded Ratnapitha sector as Paundravardhana, as requested. Years such as 550, 590, 640, 850, 940, 950, 980, 1075 and 1090 are approximate playback anchors. Colour is carried between those anchors as part of this reconstruction; it does not establish uninterrupted historical possession. North and south edges are schematic. The older catalogue of ruler reigns uses a different chronology in places; the regional episode dates above follow this adopted sequence.</p>
      <p><a href="data/paundravardhana-map-phases.csv">Map phases CSV</a> · <a href="data/kamarupa-events-researched.csv">Research and sources</a></p>
      <div class="ratna-jumps">${phases.map(s => `<button data-y="${s.start}" ${s.id === r.id ? 'aria-current="step"' : ''}>c.${s.start}: ${esc(s.title)}</button>`).join('')}</div></details>
    </section>`;
  }

  function postPalaCard() {
    if (year < 1100 || year > 1270) return '';
    const d = D.postPala, e = d.episodes.find(r => year >= r.start && year <= r.end);
    const links = ids => ids.map(id => `<a href="${esc(d.sources[id].url)}" target="_blank" rel="noopener">${esc(d.sources[id].title)}</a>`).join(' · ');
    return `<section class="post-pala-card"><h2>Kamarupa after the Palas</h2>
      <p class="post-date">${esc(e.date)}</p><h3>${esc(e.title)}</h3>
      <p><strong>Rulers / named figures:</strong> ${esc(e.who)}</p><p>${esc(e.text)}</p>
      <p class="source-links">${links(e.sources)}</p>
      <p class="pitha-note">Dates above distinguish attestation from reign. Display windows are context, not continuous rule. The shaded realm is a schematic successor region; precise political borders are unknown.</p>
      <h2>Places on this map</h2>${d.spots.filter(s => year >= s.start && year <= s.end).map(s => `<details><summary>${esc(s.name)}</summary><p>${esc(s.kind)}. ${esc(s.note)}</p><p class="source-links">${links(s.sources)}</p></details>`).join('')}
      <details><summary>Unlocated and disputed places</summary>${d.unlocated.map(s => `<p>${esc(s)}</p>`).join('')}</details>
      <details><summary>Rulers and events, 1100–1270</summary><div class="ratna-jumps">${d.episodes.map(s => `<button data-y="${s.start}">${esc(s.date)}: ${esc(s.title)}</button>`).join('')}</div></details>
    </section>`;
  }

  function card(i) {
    const p = P[i], a = areaAt(i, year);
    if (p.id === 'ahom' && year >= 1215 && year < 1228) return '<div class="card"><h3>Sukaphaa’s migrating party</h3><p>The gold dashed trail advances through the reconstructed 1215–1228 journey. Annual pacing is illustrative. Intermediate stop dates and the exact track are unresolved. The Ahom territorial sequence begins in 1228; this trail does not mark an Ahom kingdom in Myanmar.</p></div>';
    if (p.id === 'late-kamarupa') return `<div class="card"><h3>Kamarupa successor polities</h3><p>This outline gives geographic context for several rulers and regional powers, rather than a measured kingdom under one dynasty. The evidence panel above distinguishes known inscriptions, approximate reigns and disputed identifications.</p></div>`;
    if (p.id === 'ratna-uncertain') return `<div class="card"><h3>Control uncertain</h3><p>The neutral region marks an interval without a secure owner in the adopted sequence. Use the Paundravardhana controls above to follow the losses and recoveries.</p></div>`;
    const ts = D.territories.filter(t => P[t.p] === p && year >= t.s && year <= t.e);
    const r = rulersAt(p), caps = p.capitals.filter(c => year >= c[3] && year <= c[4]).map(c => c[0]);
    return `<div class="card">
      <button class="back" data-p="-1">✕ Close</button>
      <h3>${esc(p.name)}</h3>${p.id === 'dimasa' && ((year >= 1275 && year <= 1522) || (year >= 1745 && year <= 1831)) ? '<p class="pitha-note">Adopted maximum extent includes Dima Hasao, both Karbi Anglong districts, and Cachar, Hailakandi and Karimganj. The combined modern-district envelope is approximate; simultaneous control across every district is not independently verified.</p>' : ''}<div class="as" lang="as">${esc(p.name_as)}</div>
      <dl>
        <dt>Lasted</dt><dd>${p.start} – ${p.end >= E ? 'today' : p.end} (${p.end - p.start + 1} years)</dd>
        ${p.id === 'bhuyan' ? '<dt>Map type</dt><dd>Separate river-bounded chiefdom sectors; approximate extents</dd>' : (p.id === 'ahom' && year < 1253) || (p.id === 'chutia' && year < 1392) ? '<dt>Map type</dt><dd>Locality reconstruction; patch areas do not measure possessions</dd>' : `<dt>Largest mapped footprint</dt><dd><a href="#" data-y="${p.peak}">${p.peak}</a> · about ${fmtKm(p.max)}</dd>`}
        ${a ? `<dt>In ${year}</dt><dd>about ${fmtKm(a)} (${Math.round(a / p.max * 100)}% of its peak)</dd>` : ''}
        ${caps.length ? `<dt>Capital</dt><dd>${esc(caps.join(', '))}</dd>` : ''}
      ${r.length ? `<dt>Catalogue ruler</dt><dd>${esc(r.join(', '))}</dd>` : ''}
      </dl>
      <div class="lab">How it began</div><p>${esc(p.rise)}</p>
      ${ts.map(t => `<div class="lab">In ${year}${t.label ? ': ' + esc(t.label) : ''}${t.style === 'reach' ? '<span class="badge">campaign reach</span>' : t.conf === 'low' || t.style === 'legend' ? '<span class="badge">border uncertain</span>' : ''}</div><p>${esc(t.note)}</p>`).join('')}
      ${p.fall ? `<div class="lab">How it ended</div><p>${esc(p.fall)}</p>` : ''}
      <p><a href="#" data-y="${p.start}">Go to its start</a> · <a href="#" data-y="${p.peak}">its peak</a>${p.end < E ? ` · <a href="#" data-y="${p.end}">its end</a>` : ''}</p>
    </div>`;
  }
  $('panel').addEventListener('click', e => {
    const focus = e.target.closest('[data-focus-growth]');
    if (focus) { focusGrowth(focus.dataset.focusGrowth); return; }
    const stage = e.target.closest('[data-growth-year]');
    if (stage) { stop(); select(P.findIndex(p => p.id === stage.dataset.growthPolity)); setYear(+stage.dataset.growthYear); if (year >= 1215 && year < 1228) focusGrowth('migration'); $('panel').scrollTop = 0; return; }
    const group = e.target.closest('[data-growth]');
    if (group) { select(P.findIndex(p => p.id === group.dataset.growth)); return; }
    const y = e.target.closest('[data-y]'); if (y) { e.preventDefault(); stop(); setYear(+y.dataset.y); return; }
    const pp = e.target.closest('[data-p]'); if (pp) select(+pp.dataset.p === sel ? -1 : +pp.dataset.p);
  });

  function select(i) {
    sel = i; drawMap(); drawPanel(); drawRowsState(); saveHash();
  }

  /* ---------- timeline bands ---------- */
  const chart = $('chart'), rowsEl = $('rows');
  // Lanes: a kingdom and the ones that followed it in the same lane, so one rises as the last fades.
  const lanes = [...new Set(P.map(p => p.lane))].sort((a, b) => a - b);
  const RH = 17;
  const band = i => {   // centred on the lane; thickness grows with the land held (square-root scale, shared by all)
    const p = P[i], pts = [];
    for (let y = Math.max(S, p.start); y <= Math.min(E, p.end); y++) {
      const present = D.states[D.years[y - S]].some(si => D.territories[D.shapes[si].t].p === i);
      pts.push([y - S, Math.min(1, Math.sqrt(areaAt(i, y) / 100000)), present ? .1 : 0]);
    }
    const top = pts.map(([x, v, floor], k) => `${k ? 'L' : 'M'}${x} ${(RH / 2 - Math.max(floor, v) * (RH / 2 - 1)).toFixed(2)}`).join('');
    const bot = pts.reverse().map(([x, v, floor]) => `L${x + 1} ${(RH / 2 + Math.max(floor, v) * (RH / 2 - 1)).toFixed(2)}`).join('');
    return `<path class="band" data-p="${i}" fill="${p.color}" d="${top}${bot}Z"><title>${esc(p.name)}, ${p.start}–${p.end >= E ? 'today' : p.end}</title></path>`;
  };
  rowsEl.innerHTML = lanes.map(l => {
    const ps = P.map((p, i) => i).filter(i => P[i].lane === l);
    return `<div class="row"><svg viewBox="0 0 ${N} ${RH}" preserveAspectRatio="none">${ps.map(band).join('')}</svg>
      ${ps.map(i => `<span class="nm" data-p="${i}" data-s="${P[i].start}" data-e="${Math.min(E, P[i].end)}">${esc(P[i].short)}</span>`).join('')}</div>`;
  }).join('');
  function placeNames() {   // a name sits in the middle of its band, if the band is wide enough at this width
    const w = rowsEl.clientWidth;
    rowsEl.querySelectorAll('.nm').forEach(el => {
      const s = +el.dataset.s, e = +el.dataset.e, px = (e - s + 1) / N * w;
      el.style.left = ((s + e + 1) / 2 - S) / N * 100 + '%';
      el.hidden = px < el.textContent.length * 6.3 + 6;
    });
  }
  const span = (a, b) => `left:${(a - S) / N * 100}%;width:${(b - a + 1) / N * 100}%`;
  $('eras').innerHTML = ERAS.map(e => `<div class="era" style="${span(e[0], e[1])}" title="${esc(e[2])} (${e[0]}–${e[1]})">${esc(e[2])}</div>`).join('');
  $('axis').innerHTML = [400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000].map(y => `<span style="left:${(y - S) / N * 100}%">${y}</span>`).join('') +
    D.events.map(e => `<i class="evtick" style="left:${(e.y - S) / N * 100}%"></i>`).join('');

  const plotX = y => rowsEl.offsetLeft + (y - S + .5) / N * rowsEl.clientWidth;
  function drawRowsState() {
    const on = new Set(activeHere());
    rowsEl.querySelectorAll('[data-p]').forEach(r => {
      const i = +r.dataset.p;
      r.classList.toggle('on', on.has(i));
      r.classList.toggle('sel', i === sel);
      r.classList.toggle('dim', sel >= 0 && i !== sel);
    });
    $('cursor').style.left = plotX(year) + 'px';
    $('cursorYear').textContent = year;
  }
  const yearFromX = cx => { const r = rowsEl.getBoundingClientRect(); return clamp(S + (cx - r.left) / r.width * N - .5); };
  let scrub = false;
  chart.addEventListener('pointerdown', e => {
    const b = e.target.closest('.nm');
    if (b) { select(+b.dataset.p === sel ? -1 : +b.dataset.p); return; }
    scrub = true; stop(); chart.setPointerCapture(e.pointerId); setYear(yearFromX(e.clientX));
  });
  chart.addEventListener('pointermove', e => { if (scrub) setYear(yearFromX(e.clientX)); });
  chart.addEventListener('pointerup', () => { scrub = false; });
  window.addEventListener('resize', () => { placeNames(); drawRowsState(); });
  placeNames();

  /* ---------- controls ---------- */
  function setYear(y) {
    y = clamp(y);
    if (y === year && $('yearIn').value == y) return;
    year = y;
    hideTip();
    $('yearIn').value = y;
    $('yearBig').textContent = y < 1000 ? y + ' CE' : y;
    $('eraBig').textContent = eraOf(y)[2];
    drawMap(); drawPanel(); drawRowsState(); saveHash();
  }
  let hashT = 0;
  const saveHash = () => { clearTimeout(hashT); hashT = setTimeout(() => history.replaceState(null, '', `#y=${year}${sel >= 0 ? '&k=' + P[sel].id : ''}`), 250); };

  const stepChange = dir => {
    stop();
    const y = dir > 0 ? changeYears.find(c => c > year) : [...changeYears].reverse().find(c => c < year);
    setYear(y ?? (dir > 0 ? E : S));
  };
  $('prev').onclick = () => stepChange(-1);
  $('next').onclick = () => stepChange(1);
  $('yminus').onclick = () => { stop(); setYear(year - 1); };
  $('yplus').onclick = () => { stop(); setYear(year + 1); };
  $('yearIn').addEventListener('change', e => { stop(); setYear(+e.target.value || year); });
  $('yearIn').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); stop(); setYear(+e.target.value || year); }
  });

  function stop() { if (playing) { clearTimeout(playing); playing = null; } $('play').textContent = '▶'; $('play').setAttribute('aria-label', 'Play'); }
  function tick() {
    if (year >= E) { stop(); return; }
    setYear(year + 1);
    const changed = changeYears.includes(year) || D.events.some(e => e.y === year);
    const journey = year >= 1449 && year <= 1568;
    playing = setTimeout(tick, journey ? Math.max(180, +$('speed').value * 8) : +$('speed').value * (changed ? 14 : 1) + (changed ? 250 : 0));
  }
  $('play').onclick = () => {
    if (playing) { stop(); return; }
    if (year >= E) setYear(S);
    $('play').textContent = '❚❚'; $('play').setAttribute('aria-label', 'Pause');
    playing = setTimeout(tick, 150);
  };
  window.addEventListener('keydown', e => {
    if (e.defaultPrevented) return;
    if (e.target.matches('input, select')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); stop(); setYear(year + (k === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 10 : 1)); }
    else if (k === 'PageDown' || k === 'PageUp') { e.preventDefault(); stepChange(k === 'PageDown' ? 1 : -1); }
    else if (k === ' ') { e.preventDefault(); $('play').click(); }
    else if (k === 'Escape') select(-1);
  });

  $('panelToggle').onclick = () => { document.body.classList.toggle('panel-collapsed'); drawLabels(D.states[D.years[year-S]]); };
  $('timelineToggle').onclick = () => document.body.classList.toggle('timeline-collapsed');
  $('modernToggle').addEventListener('change', e => svg.classList.toggle('hide-modern', !e.target.checked));
  $('ratnaChip').addEventListener('click', () => {
    $('panel').scrollTop = 0;
    $('panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('sankardevaStart').onclick = () => { stop(); select(-1); setYear(1449); focusGrowth('bhuyan'); $('play').click(); };
  $('sankardevaChip').onclick = () => { location.href = `sankardeva.html#y=${year}`; };
  $('journeyChip').addEventListener('click', () => { select(P.findIndex(p => p.id === 'ahom')); focusGrowth('migration'); });

  fromHash();
  const y0 = year; year = -1; setYear(y0);
  if (sel >= 0 && P[sel].id === 'ahom' && year >= 1215 && year <= 1281) focusGrowth('ahom');
  window.addEventListener('hashchange', () => { fromHash(); const y = year; year = -1; setYear(y); });
})();
