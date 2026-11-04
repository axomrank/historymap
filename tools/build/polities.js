'use strict';
module.exports = function compilePolities({ history, polities, placeById }, { X, Y }, T) {
  /* ---------- rulers, capitals ---------- */
  const persons = history.filter(r => r.type === 'person' && r.start_year);
  const P = polities.map(p => {
    const groups = p.person_groups ? p.person_groups.split(';').map(s => s.trim()) : [];
    const rulers = persons.filter(r => groups.includes(r.group) && /king|ruler|queen regnant|sultan|emperor/i.test(r.role) && !/officer|general|commander/i.test(r.role))
      .map(r => [r.name, +r.start_year, +(r.end_year || r.start_year)]).sort((a, b) => a[1] - b[1]);
    const capitals = p.capitals ? p.capitals.split(';').map(s => {
      const [id, span] = s.trim().split('@'), [a, b] = span.split('-').map(Number), pl = placeById[id];
      if (!pl) throw new Error('unknown capital ' + id);
      return [pl.name, X(pl.geo[1]), Y(pl.geo[0]), a, b];
    }) : [];
    const ts = T.filter(t => t.polity === p.id);
    return { id: p.id, name: p.name, name_as: p.name_as, short: p.short, lane: +p.lane, color: p.color, rise: p.rise, fall: p.fall,
      start: Math.min(...ts.map(t => t.start)), end: Math.max(...ts.map(t => t.end)), rulers, capitals };
  });


  return P;
};
