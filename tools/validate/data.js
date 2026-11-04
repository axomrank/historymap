// Validate editable inputs before compiling expensive geometry. No dependencies.
const fs = require('node:fs');
const path = require('node:path');
const { parseCSV } = require('../lib/csv');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const schemas = JSON.parse(read('data/schemas/catalogue.json'));
const tables = Object.fromEntries(Object.entries(schemas).map(([key, schema]) => [key, parseCSV(read(schema.file), { strict: true })]));
const errors = [];
for (const [key, schema] of Object.entries(schemas)) {
  const seen = new Set();
  for (const [i, row] of tables[key].entries()) {
    const fail = message => errors.push(`${schema.file}: record ${i + 1} (${row.id || row.title || '?'}): ${message}`);
    for (const field of schema.required) if (!row[field]?.trim()) fail(`missing ${field}`);
    if (schema.unique) {
      const id = row[schema.unique];
      if (seen.has(id)) fail(`duplicate ${schema.unique}: ${id}`);
      seen.add(id);
    }
    for (const field of schema.numbers || []) if (!row[field]?.trim() || !Number.isFinite(Number(row[field]))) fail(`${field} must be a number`);
    for (const [field, values] of Object.entries(schema.enums || {})) if (!values.includes(row[field])) fail(`invalid ${field}: ${row[field]}`);
    for (const [field, target] of Object.entries(schema.references || {})) if (row[field] && !tables[target].some(r => r.id === row[field])) fail(`unknown ${field}: ${row[field]}`);
    if ('start' in row && (+row.start > +row.end || !Number.isInteger(+row.start) || !Number.isInteger(+row.end))) fail('start/end must be ordered integer years (inclusive)');
    if ('year' in row && !Number.isInteger(+row.year)) fail('year must be an integer');
    if ('lat' in row && (Math.abs(+row.lat) > 90 || Math.abs(+row.lon) > 180)) fail('coordinates out of range');
    if ('color' in row && !/^#[\da-f]{6}$/i.test(row.color.replace(/\s/g, ''))) fail('color must be a six-digit hex colour');
  }
}
// Parse every JSON input, including feature datasets and reference geography.
function checkJSON(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) checkJSON(file);
    else if (file.endsWith('.json')) {
      try { JSON.parse(fs.readFileSync(file, 'utf8')); }
      catch (e) { errors.push(`${path.relative(root, file)}: ${e.message}`); }
    }
  }
}
checkJSON(path.join(root, 'data'));
const config = JSON.parse(read('data/atlas-config.json'));
if (!Number.isInteger(config.start) || !Number.isInteger(config.end) || config.start > config.end) errors.push('Invalid atlas year range');
errors.push(...require('./features')(root, tables, config));
errors.push(...require('./shapes')(root, tables));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Validated ${Object.values(tables).reduce((n, rows) => n + rows.length, 0)} core records and all JSON inputs.`);
