'use strict';
// URL compatibility and year bounds are independent from DOM rendering.
window.createAtlasNavigation = function (D) {
  const clamp = y => Math.max(D.start, Math.min(D.end, Math.round(y)));
  function read(hash, fallbackYear = D.start) {
    const query = new URLSearchParams(hash.replace(/^#/, ''));
    const raw = query.get('y');
    const year = raw && /^\d+$/.test(raw) ? clamp(+raw) : fallbackYear;
    const id = query.get('k') === 'ne-states' ? 'nagaland' : query.get('k');
    const sel = D.polities.findIndex(p => p.id === id);
    const group = query.get('c');
    const colonialGroup = group === 'overview' || D.colonial.groups.some(g => g.id === group) ? group : '';
    return { year, sel, colonialGroup, colourMode: query.get('m') === 'affiliation' ? 'affiliation' : 'states' };
  }
  function hash({ year, sel, colonialGroup, colourMode }) {
    return `#y=${year}${sel >= 0 ? '&k=' + D.polities[sel].id : ''}${colonialGroup ? '&c=' + colonialGroup : ''}${colourMode === 'affiliation' ? '&m=affiliation' : ''}`;
  }
  return { clamp, read, hash };
};
