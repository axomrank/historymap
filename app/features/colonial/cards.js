'use strict';
// Feature card rendering; reads shared state at each render.
window.createColonialCards = function ({ D, P, esc, getState, currentColonialGroup }) {
  function statehoodDate(iso) {
    const [y,m,d] = iso.split('-').map(Number);
    return `${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${y}`;
  }
  function statehoodGuide() {
    const { year, sel, colonialGroup } = getState();
    const d = D.colonial;
    const dateButton = (s,date,label) => `<button data-statehood-year="${+date.slice(0,4)}" data-statehood-state="${s.id}" aria-label="${esc(s.name + ': ' + label + ', ' + statehoodDate(date))}">${esc(statehoodDate(date))}<small>${esc(label)}</small></button>`;
    return `<section class="statehood-guide" aria-label="Separation and statehood dates for eight Northeastern states">
      <p><strong>Separation and full statehood are different events.</strong> Manipur, Tripura and Sikkim were not carved out of Assam.</p>
      <table><caption>Present-day eight-state Northeast</caption><thead><tr><th scope="col">State / origin</th><th scope="col">Separation / earlier steps</th><th scope="col">Full statehood</th></tr></thead><tbody>${d.statehood.map(s => `<tr data-statehood-row="${s.id}" class="${sel >= 0 && P[sel].id === s.id ? 'selected' : ''}"><th scope="row">${esc(s.name)}<small>${esc(s.parent)}</small></th><td>${s.separation ? dateButton(s,s.separation,['mizoram','arunachal'].includes(s.id) ? 'Left Assam as UT' : 'Left Assam') : `<span>${s.id === 'assam-state' ? 'Continued from province' : 'Not from Assam'}</span>`}${s.milestones.filter(m => m.date !== s.statehood && m.date !== s.separation).map(m => dateButton(s,m.date,m.label)).join('')}</td><td>${dateButton(s,s.statehood,'Statehood')}<details><summary>Details & sources</summary><p>${esc(s.note)}</p>${s.sources.map(id => `<a href="${esc(d.sources[id].url)}" target="_blank" rel="noopener">${esc(d.sources[id].title)}</a>`).join('')}</details></td></tr>`).join('')}</tbody></table>
      <p class="pitha-note">Tap a date to show that state and year on the map. Administrative units inside Assam, separate Union Territories and full states are shown as different stages.</p>
    </section>`;
  }

  function colonialCard() {
    const { year, sel, colonialGroup } = getState();
    if (year < 1805 && !(year >= 1765 && colonialGroup)) return '';
    const d = D.colonial, group = currentColonialGroup();
    const stages = d.phases.filter(s => group === 'overview' || s.group === group).sort((a,b) => a.start-b.start);
    const current = group === 'overview' ? null : stages.find(s => year >= s.start && year <= s.end);
    const prev = stages.filter(s => s.start < year).at(-1), next = stages.find(s => s.start > year);
    const links = ids => ids.map(id => `<a href="${esc(d.sources[id].url)}" target="_blank" rel="noopener">${esc(d.sources[id].title)}</a>`).join(' · ');
    return `<section class="colonial-card" aria-label="British expansion and state changes"><h2>${group === 'statehood' ? 'Separation & statehood' : 'British expansion & state changes'}</h2>
      <label class="colonial-picker">Follow a region<select id="colonialRegion"><option value="overview" ${group === 'overview' ? 'selected' : ''}>All Northeast regions</option>${d.groups.map(g => `<option value="${g.id}" ${group === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
      <div class="colonial-actions"><button data-colonial-focus="${group}">${group === 'statehood' ? 'Show all eight states ↗' : 'Show region on map ↗'}</button>${group === 'statehood' ? '' : '<button data-colonial-jump="matak" data-year="1805">Matak: 1805 → 1839</button>'}</div>
      ${group === 'statehood' ? statehoodGuide() : ''}
      ${current ? `<p class="post-date">${esc(current.date)}</p><h3>${esc(current.title)}</h3><p>${esc(current.text)}</p><p class="source-links">${links(current.sources)}</p>` : group === 'overview' ? `<p>Select a region or a dated marker to follow its changes.</p><div class="colonial-overview">${d.groups.map(g => { const p = d.phases.find(s => s.group === g.id && year >= s.start && year <= s.end); return `<button data-colonial-group="${g.id}"><b>${esc(g.name)}</b><span>${p ? `${esc(p.date)} · ${esc(p.title)}` : 'Choose a dated stage'}</span></button>`; }).join('')}</div>` : '<p>Choose a dated stage below; no phase is assigned before the first documented display stage.</p>'}
      <div class="ratna-nav">${prev ? `<button data-colonial-year="${prev.start}">← Previous stage</button>` : ''}${next ? `<button data-colonial-year="${next.start}">Next stage →</button>` : ''}</div>
      <p class="pitha-note">Annual views show the position after that year’s change. Dotted regions locate approximate administrative contexts; they do not claim uniform control across today’s states.</p>
      <details ${group === 'matak' ? 'open' : ''}><summary>Dates to show on the map</summary><div class="colonial-steps">${stages.map(s => `<button data-colonial-jump="${s.group}" data-year="${s.start}" ${s === current ? 'aria-current="step"' : ''}><span>${esc(s.date)}</span>${esc(s.title)}</button>`).join('')}</div></details>
    </section>`;
  }


return { colonialCard, statehoodDate };
};
