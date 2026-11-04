/* Shared visual rules: local identity, constitutional status and affiliation coexist. */
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasMapAppearance = api;
})(typeof window === 'object' ? window : globalThis, () => {
  function status(polity, territory, year, statehood) {
    const row = statehood.find(s => s.id === polity.id);
    if (row && year >= +row.statehood.slice(0,4)) return 'state';
    if ((['manipur','tripura'].includes(polity.id) && year >= 1956 && year < 1972) ||
        (['mizoram','arunachal'].includes(polity.id) && year >= 1972 && year < 1987)) return 'union-territory';
    if (territory.id === 'meghalaya-1970') return 'autonomous';
    if (territory.id === 'nagaland-1957') return 'special-unit';
    return territory.style;
  }
  function paint(polity, territory, year, mode, authorities, statehood) {
    const authority = authorities[territory.authority];
    const stage = status(polity,territory,year,statehood);
    let fill = authority ? (authority.pattern ? `url(#authority-${territory.authority}-${territory.p})` : authority.color) : territory.style === 'reach' ? `url(#h${territory.p})` : polity.color;
    if (mode === 'states' && territory.authority === 'india') {
      if (stage === 'union-territory') fill = `url(#ut-${territory.p})`;
      else if (stage === 'state' || territory.style === 'context') fill = polity.color;
    }
    return { fill, stage, country: ['bangladesh','pakistan'].includes(polity.id) };
  }
  return { status, paint };
});
