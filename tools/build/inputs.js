'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseCSV } = require('../lib/csv');
module.exports = function loadInputs(root) {
  const rd = f => fs.readFileSync(path.join(root, f), 'utf8').replace(/^\uFEFF/, '');
  const sources = JSON.parse(rd('data/source/sources.json'));
  const { hydrate } = require('../../app/core/datasets');
  const feature = file => hydrate(JSON.parse(rd(file)), sources);
  /* ---------- inputs ---------- */
  const history = parseCSV(rd('data/source/assam_history.csv'));
  const polities = parseCSV(rd('data/source/polities.csv')).map(p => ({ ...p, color: p.color.replace(/\s/g, '') }));
  const territories = parseCSV(rd('data/source/territories.csv'));
  const events = parseCSV(rd('data/source/events.csv'));
  const ratnaPhases = parseCSV(rd('data/features/kamarupa/paundravardhana-map-phases.csv'));
  const postPala = feature('data/features/kamarupa/kamarupa-after-palas.json');
  const growth = feature('data/features/growth/medieval-growth.json');
  const BENGAL = JSON.parse(rd('data/maps/bengal-districts.json'));
  const sankardeva = feature('data/features/sankardeva/sankardeva-routes.json');
  const A = JSON.parse(rd('data/maps/assam.json'));
  const NB = JSON.parse(rd('data/maps/neighbours.json'));
  const NE = JSON.parse(rd('data/maps/northeast.json'));
  const colonial = feature('data/features/colonial/colonial-stages.json');
  const CR = JSON.parse(rd('data/maps/colonial-regions.json'));

  const realmById = {}, placeById = {};
  for (const r of history) {
    if (r.type === 'realm') realmById[r.id] = r;
    if (r.type === 'place' && r.lat) placeById[r.id] = { name: r.name, geo: [+r.lat, +r.lon] };
  }
  for (const r of parseCSV(rd('data/source/extra-places.csv'))) placeById[r.id] = { name: r.name, geo: [+r.lat, +r.lon] };


  return { rd, history, polities, territories, events, ratnaPhases, postPala, growth, BENGAL, sankardeva, A, NB, NE, colonial, CR, realmById, placeById };
};
