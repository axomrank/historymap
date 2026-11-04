'use strict';
window.createAtlasPanel = function ({ D, P, S, E, $, esc, areaAt, getState, colonialCard, growthCard, ratnaCard, postPalaCard }) {
  /* ---------- side panel ---------- */
  function status(i) {
    const { year, sel, colourMode } = getState();
    const p = P[i], a = areaAt(i, year);
    if (year >= 1805 && p.id === 'matak') return 'Autonomous local rule · direct Company management in 1839';
    if (year >= 1825 && p.id === 'sadiya-local') return 'Local jurisdiction and British political presence';
    if (year >= 1805 && p.id === 'british') return 'See the separate regional acquisition dates above';
    if (p.id === 'assam-state') return year < 1950 ? 'Indian province · constitutional statehood on 26 January 1950' : 'Indian state since 26 January 1950';
    const cg = year >= 1805 && D.colonial.groups.find(g => g.polities.includes(p.id));
    const cp = cg && D.colonial.phases.find(s => s.group === cg.id && year >= s.start && year <= s.end);
    if (cp) return esc(cp.title);
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
  const rulersAt = p => ['chutia', 'bhuyan'].includes(p.id) ? [] : p.rulers.filter(r => getState().year >= r[1] && getState().year <= r[2]).map(r => r[0]);
  const fmtKm = a => a >= 1000 ? Math.round(a / 1000).toLocaleString() + ',000 km²' : Math.round(a).toLocaleString() + ' km²';
  function activeHere() {
    const { year, sel, colourMode } = getState();
    const on = [...new Set(D.states[D.years[year - S]].map(si => D.territories[D.shapes[si].t].p))];
    return on.sort((a, b) => areaAt(b, year) - areaAt(a, year));
  }

  function drawPanel() {
    const { year, sel, colourMode } = getState();
    const on = activeHere();
    let h = colonialCard() + growthCard() + ratnaCard() + postPalaCard() + `<h2>On the map in ${year}</h2>`;
    h += on.length ? on.map(i => {
      const p = P[i], r = rulersAt(p);
      const territory = D.territories.find(t => t.p === i && t.s <= year && t.e >= year);
      const affiliation = D.colonial.authorities[territory?.authority];
      const swatch = colourMode === 'states' && territory?.authority === 'india' ? p.color : affiliation?.color || p.color;
      return `<div class="pol${i === sel ? ' sel' : ''}" data-p="${i}"><span class="sw" style="background:${swatch}"></span><b>${esc(p.name)}</b><span class="st">${affiliation ? `<strong>${esc(affiliation.label)}</strong><br>` : ''}${status(i)}${r.length ? `<br>Catalogue ruler: ${esc(r.join(', '))}` : ''}</span></div>`;
    }).join('') : '<p class="empty">No mapped kingdom this year.</p>';
    if (sel >= 0) h += card(sel);
    const evs = D.events, here = evs.filter(e => e.y === year);
    const prev = evs.filter(e => e.y < year).slice(-2), nxt = evs.filter(e => e.y > year).slice(0, 2);
    h += `<h2 style="margin-top:16px">What happened</h2>` +
      [...prev.map(e => evRow(e, '')), ...here.map(e => evRow(e, ' now')), ...nxt.map(e => evRow(e, ''))].join('');
    $('panel').innerHTML = h;
  }
  const evRow = (e, cls) => `<div class="ev${cls}" data-y="${e.y}"><span class="y">${e.y}</span><b>${esc(e.t)}</b>${cls ? `<span class="x">${esc(e.x)}</span>` : ''}</div>`;

  function card(i) {
    const { year, sel, colourMode } = getState();
    const p = P[i], a = areaAt(i, year);
    if ((year >= 1805 && D.colonial.groups.some(g => g.polities.includes(p.id))) || (year >= 1825 && p.id === 'sadiya-local')) {
      const ts = D.territories.filter(t => t.p === i && year >= t.s && year <= t.e);
      return `<div class="card"><button class="back" data-p="-1">✕ Close</button><h3>${esc(p.name)}</h3>${ts.length ? ts.map(t => `<div class="lab">${esc(t.label || `In ${year}`)}</div>${D.colonial.authorities[t.authority] ? `<p class="authority-note"><strong>Political affiliation: ${esc(D.colonial.authorities[t.authority].label)}</strong></p>` : ''}<p>${esc(t.note)}</p>`).join('') : '<p>No territory assigned to this polity in the selected year.</p>'}<details><summary>Background</summary><p>${esc(p.rise)}</p><p>${esc(p.fall)}</p></details></div>`;
    }
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
        ${caps.length ? `<dt>${p.id === 'mughal' ? 'Regional headquarters' : 'Capital'}</dt><dd>${esc(caps.join(', '))}</dd>` : ''}
      ${r.length ? `<dt>Catalogue ruler</dt><dd>${esc(r.join(', '))}</dd>` : ''}
      </dl>
      <div class="lab">How it began</div><p>${esc(p.rise)}</p>
      ${ts.map(t => `<div class="lab">In ${year}${t.label ? ': ' + esc(t.label) : ''}${t.style === 'reach' ? '<span class="badge">campaign reach</span>' : t.conf === 'low' || t.style === 'legend' ? '<span class="badge">border uncertain</span>' : ''}</div><p>${esc(t.note)}</p>`).join('')}
      ${p.fall ? `<div class="lab">How it ended</div><p>${esc(p.fall)}</p>` : ''}
      <p><a href="#" data-y="${p.start}">Go to its start</a> · <a href="#" data-y="${p.peak}">its peak</a>${p.end < E ? ` · <a href="#" data-y="${p.end}">its end</a>` : ''}</p>
    </div>`;
  }

return { drawPanel, activeHere };
};
