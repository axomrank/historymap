'use strict';
// Feature card rendering; reads shared state at each render.
window.createKamarupaCards = function ({ D, P, esc, getState, currentColonialGroup }) {
  function ratnaCard() {
    const { year, sel, colonialGroup } = getState();
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
      <p><a href="data/features/kamarupa/paundravardhana-map-phases.csv">Map phases CSV</a> · <a href="data/research/kamarupa-events-researched.csv">Research and sources</a></p>
      <div class="ratna-jumps">${phases.map(s => `<button data-y="${s.start}" ${s.id === r.id ? 'aria-current="step"' : ''}>c.${s.start}: ${esc(s.title)}</button>`).join('')}</div></details>
    </section>`;
  }

  function postPalaCard() {
    const { year, sel, colonialGroup } = getState();
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


return { ratnaCard, postPalaCard };
};
