'use strict';
// Feature card rendering; reads shared state at each render.
window.createGrowthCards = function ({ D, P, esc, getState, currentColonialGroup }) {
  function growthCard() {
    const { year, sel, colonialGroup } = getState();
    if (year >= 1805 || (year >= 1765 && colonialGroup)) return '';
    if (year < 1187 || year > 1816 || (year > 1764 && (sel < 0 || P[sel].id !== 'ahom'))) return '';
    const d = D.growth, ids = ['ahom', 'chutia', 'kamata', 'khen', 'bhuyan', 'koch', 'koch-hajo', 'mughal'];
    const focus = sel >= 0 && ids.includes(P[sel].id) ? P[sel].id : (year >= 1576 ? 'mughal' : year >= 1515 ? 'koch' : year >= 1215 && year <= 1281 ? 'ahom' : 'chutia');
    const stages = d.phases.filter(p => p.polity === focus), current = stages.find(p => year >= p.start && year <= p.end);
    const sources = current ? current.sources.map(id => `<a href="${esc(d.sources[id].url)}" target="_blank" rel="noopener">${esc(d.sources[id].title)}</a>`).join(' · ') : '';
    return `<section class="growth-card"><h2>How the states took shape</h2>
      <div class="growth-tabs">${ids.map(id => `<button data-growth="${id}" aria-pressed="${id === focus}">${esc(P.find(p => p.id === id).short)}</button>`).join('')}</div>
      <button class="growth-focus" data-focus-growth="${focus}">${focus === 'ahom' && year < 1282 ? 'Focus on Sukaphaa’s journey ↗' : 'Focus on this region ↗'}</button>
      ${focus === 'ahom' && year >= 1537 ? '<button class="growth-focus" data-focus-growth="ahom-all">Whole Ahom region ↗</button>' : ''}
      ${focus === 'mughal' ? '<button class="growth-focus" data-focus-growth="koch-hajo">Koch Hajo frontier ↗</button>' : ''}
      ${focus === 'ahom' && year >= 1215 && year <= 1267 ? '<button class="growth-focus full-journey" data-focus-growth="migration">Whole journey: Mong Mao → Myanmar → Assam ↗</button>' : ''}
      ${current ? `<p class="post-date">${esc(current.date)}</p><h3>${esc(current.title)}</h3><p>${esc(current.text)}</p>${current.northBank ? `<dl class="frontier-banks"><dt>North bank</dt><dd>${esc(current.northBank)}</dd><dt>South bank</dt><dd>${esc(current.southBank)}</dd></dl>` : ''}<p class="source-links">${sources}</p>` : `<p>No securely dated stage for this selection in ${year}. Choose a date below.</p>`}
      <p class="pitha-note">Dashed trails connect reported stops; they are reconstructed corridors, not surveyed paths. Small patches locate early settlements; Bhuyan areas follow separate river-to-river sectors. Wider borders are approximate. Later evidence does not date an earlier conquest.</p>
      <details ${focus === 'ahom' && year <= 1253 ? 'open' : ''}><summary>${focus === 'ahom' ? 'Journey and expansion stages' : 'Dated evidence and changes'}</summary><div class="growth-steps">${stages.map(s => `<button data-growth-year="${s.start}" data-growth-polity="${s.polity}" ${s === current ? 'aria-current="step"' : ''}><span>${esc(s.date)}</span>${esc(s.title)}</button>`).join('')}</div></details>
      <p class="source-links"><a href="research/medieval-growth-2026-11-04/README.md">Research notes</a> · <a href="data/features/growth/medieval-growth-events.csv">Events CSV</a>${focus === 'ahom' && year >= 1537 ? ' · <a href="research/ahom-bank-frontiers-2026-11-04/README.md">Ahom frontier research</a>' : focus === 'koch' ? ' · <a href="research/koch-growth-2026-11-04/README.md">Koch research</a>' : ['mughal','koch-hajo'].includes(focus) ? ' · <a href="research/bengal-hajo-2026-11-04/README.md">Bengal and Koch Hajo research</a>' : ''}</p>
    </section>`;
  }


return { growthCard };
};
