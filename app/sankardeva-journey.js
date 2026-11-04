/* Shared, reversible year-based route reveal for the atlas and journey page. */
(function (root) {
  'use strict';
  function at(data, year) {
    const points = new Map(data.points.map(p => [p.id, p]));
    const routes = data.routes.filter(r => year >= r.anchors[0].year).map(r => {
      const trail = [], anchors = r.anchors;
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i], p = points.get(a.point);
        if (year >= a.year) trail.push([p.lat, p.lon]);
        else {
          const b = anchors[i - 1], q = points.get(b.point);
          const f = (year - b.year) / (a.year - b.year);
          trail.push([q.lat + (p.lat - q.lat) * f, q.lon + (p.lon - q.lon) * f]);
          break;
        }
      }
      return { ...r, trail, head: trail.at(-1), active: year <= anchors.at(-1).year };
    });
    const visited = new Set(routes.flatMap(r => r.anchors.filter(a => year >= a.year).map(a => a.point)));
    return { routes, current: routes.filter(r => r.active).at(-1) || routes.at(-1),
      points: data.points.filter(p => year >= p.start && (p.kind !== 'pilgrimage' || visited.has(p.id))) };
  }
  root.SankardevaJourney = { at };
  if (typeof module !== 'undefined') module.exports = { at };
})(typeof window === 'undefined' ? globalThis : window);
