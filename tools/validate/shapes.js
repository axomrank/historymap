// Resolve shape references without running polygon clipping.
const fs = require('node:fs');
const path = require('node:path');
const { parseCSV } = require('../lib/csv');
module.exports = function validateShapes(root, tables) {
  const json = file => JSON.parse(fs.readFileSync(path.join(root, 'data/maps', file), 'utf8'));
  const A = json('assam.json'), NE = json('northeast.json'), B = json('bengal-districts.json'), C = json('colonial-regions.json');
  const history = parseCSV(fs.readFileSync(path.join(root, 'data/source/assam_history.csv'), 'utf8'));
  const realms = new Map(history.filter(r => r.type === 'realm').map(r => [r.id, r]));
  const places = new Set([...history.filter(r => r.type === 'place').map(r => r.id), ...tables.places.map(r => r.id)]);
  const lands = new Set(['valley', 'bangladesh', 'jaintia', 'matak-country', ...Object.keys(A.districts), ...Object.keys(NE.regions), ...Object.keys(B.groups), ...Object.keys(C.groups), ...Object.keys(B.westBengal).map(id => 'wb-' + id), ...Object.keys(B.bangladesh).map(id => 'bd-' + id), ...Object.keys(C.districts).map(id => 'ref-' + id)]);
  const errors = [];
  function limit(spec) {
    if (!spec) return;
    if (spec.includes('>')) return spec.split('>').forEach(limit);
    const [kind, id] = spec.split(':');
    if (kind === 'river' && A.rivers[id] || kind === 'ridge' && A.ridges?.[id] || kind === 'place' && places.has(id)) return;
    if (['lat', 'lon'].includes(kind) && id?.trim() && Number.isFinite(+id) && Math.abs(+id) <= (kind === 'lat' ? 90 : 180)) return;
    throw Error('unknown/invalid limit ' + spec);
  }
  for (const row of tables.territories) {
    try {
      for (const term of row.shape.split(' + ').map(s => s.trim())) {
        const colon = term.indexOf(':'), kind = term.slice(0, colon), arg = term.slice(colon + 1);
        if (kind === 'land') { for (const id of arg.split(',').map(s => s.trim())) if (!lands.has(id)) throw Error('unknown land ' + id); }
        else if (kind === 'realm') {
          const realm = realms.get(arg); if (!realm) throw Error('unknown realm ' + arg);
          [realm.limit_west, realm.limit_east, realm.limit_north, realm.limit_south].forEach(limit);
        } else if (kind === 'limits') { const parts = arg.split('|'); if (parts.length !== 4) throw Error('limits needs west|east|north|south'); parts.forEach(limit); }
        else if (kind === 'poly') {
          const points = arg.split(';').map(s => s.trim().split(/\s+/).map(Number));
          if (points.length < 3 || points.some(p => p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 90 || Math.abs(p[1]) > 180)) throw Error('invalid polygon coordinates');
        } else if (kind === 'patch') {
          const values = arg.split('|').map(Number);
          if (values.length !== 4 || !values.every(Number.isFinite) || Math.abs(values[0]) > 90 || Math.abs(values[1]) > 180 || values[2] <= 0 || values[3] <= 0) throw Error('invalid locality patch');
        } else throw Error('unknown shape kind ' + kind);
      }
    } catch (e) { errors.push(`data/source/territories.csv (${row.id}): ${e.message}`); }
  }
  return errors;
};
