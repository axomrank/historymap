const fs = require('node:fs');
const path = require('node:path');
const { parseCSV } = require('../lib/csv');
module.exports = function validateFeatures(root, tables, config) {
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const errors = [];
  const sources = JSON.parse(read('data/source/sources.json'));
  const schemas = JSON.parse(read('data/schemas/features.json'));
  const polities = new Set(tables.polities.map(p => p.id));
  const checkCoordinate = (lat, lon, fail) => {
    if (![lat, lon].every(v => typeof v === 'number' && Number.isFinite(v)) || Math.abs(lat) > 90 || Math.abs(lon) > 180) fail('invalid lat/lon coordinates');
  };
  for (const [name, schema] of Object.entries(schemas)) {
    const data = JSON.parse(read(schema.file));
    const fail = message => errors.push(`${schema.file}: ${message}`);
    const registry = sources[data.sourceSet];
    if (data.sourceSet !== name || !registry) { fail('unknown/mismatched sourceSet'); continue; }
    for (const collection of schema.collections) {
      if (!Array.isArray(data[collection]) || !data[collection].length) { fail(`missing ${collection}`); continue; }
      const ids = new Set();
      for (const [i, row] of data[collection].entries()) {
        const bad = message => fail(`${collection}[${row.id || i}]: ${message}`);
        if (row.id) { if (ids.has(row.id)) bad('duplicate id'); ids.add(row.id); }
        else if (!(name === 'growth' && collection === 'phases')) bad('missing id');
        if ('start' in row && (!Number.isInteger(row.start) || !Number.isInteger(row.end) || row.start > row.end)) bad('invalid inclusive year interval');
        if ('polity' in row && !polities.has(row.polity)) bad(`unknown polity ${row.polity}`);
        if ('polities' in row) for (const id of row.polities) if (!polities.has(id)) bad(`unknown polity ${id}`);
        if ('lat' in row || 'lon' in row) checkCoordinate(row.lat, row.lon, bad);
        for (const point of row.points || []) checkCoordinate(point[0], point[1], bad);
        if ('group' in row && !data.groups?.some(g => g.id === row.group)) bad(`unknown group ${row.group}`);
        for (const id of row.sources || []) if (!Object.hasOwn(registry, id)) bad(`unknown source ${id}`);
        if (row.anchors) {
          let previous = -Infinity;
          for (const anchor of row.anchors) {
            if (typeof anchor.year !== 'number' || !Number.isFinite(anchor.year) || anchor.year <= previous) bad('route anchor years must increase');
            if (!data.points.some(p => p.id === anchor.point)) bad(`unknown anchor point ${anchor.point}`);
            previous = anchor.year;
          }
        }
      }
    }
  }
  for (const [set, entries] of Object.entries(sources)) {
    for (const [id, source] of Object.entries(entries)) {
      const url = typeof source === 'string' ? source : source.url;
      if (!/^https?:\/\//.test(url || '')) errors.push(`sources.json: invalid URL for ${set}.${id}`);
    }
  }
  const phases = parseCSV(read('data/features/kamarupa/paundravardhana-map-phases.csv'), { strict: true });
  let lastEnd;
  const ids = new Set();
  for (const row of phases) {
    if (!row.id || ids.has(row.id) || !polities.has(row.polity) || !Number.isInteger(+row.start) || !Number.isInteger(+row.end) || +row.start > +row.end) errors.push(`Invalid Kamarupa phase ${row.id}`);
    if (lastEnd !== undefined && +row.start !== lastEnd + 1) errors.push(`Gap/overlap before Kamarupa phase ${row.id}`);
    ids.add(row.id); lastEnd = +row.end;
  }
  // Capital references are validated before expensive geometry work.
  const history = parseCSV(read('data/source/assam_history.csv'));
  const places = new Set([...history.filter(r => r.type === 'place').map(r => r.id), ...tables.places.map(r => r.id)]);
  for (const polity of tables.polities) for (const item of (polity.capitals || '').split(';').filter(Boolean)) {
    const [id, years] = item.trim().split('@');
    const match = /^(\d+)-(\d+)$/.exec(years || '');
    if (!places.has(id) || !match || +match[1] > +match[2]) errors.push(`Invalid capital ${item} for ${polity.id}`);
  }
  let next = config.start;
  for (const era of config.eras || []) {
    if (!Array.isArray(era) || era[0] !== next || !Number.isInteger(era[1]) || era[1] < era[0] || typeof era[2] !== 'string') errors.push('Eras must cover the atlas continuously, with inclusive integer years');
    next = era[1] + 1;
  }
  if (next !== config.end + 1) errors.push('Eras must cover the configured end year');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(config.dataVersion || '')) errors.push('Missing dataVersion date');
  return errors;
};
