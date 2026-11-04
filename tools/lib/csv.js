// Shared reader. Legacy catalogue parsing remains permissive; modern inputs use strict mode.
function parseCSV(text, { strict = false } = {}) {
  text = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char !== '"') field += char;
      else if (text[i + 1] === '"') { field += '"'; i++; }
      else {
        if (strict && text[i + 1] !== undefined && ![',', '\r', '\n'].includes(text[i + 1])) throw new Error('Unexpected text after CSV quote');
        quoted = false;
      }
    } else if (char === '"') {
      if (strict && field) throw new Error('Unexpected CSV quote');
      quoted = true;
    } else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = []; field = '';
    } else field += char;
  }
  if (quoted && strict) throw new Error('Unclosed CSV quote');
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...body] = rows;
  const records = body.filter(r => strict ? r.length > 1 || r.some(v => v.trim()) : r.length > 1);
  if (strict) {
    if (!headers || new Set(headers).size !== headers.length || headers.some(h => !h.trim())) throw new Error('Missing or duplicate CSV headers');
    for (const [i, record] of records.entries()) {
      if (record.length !== headers.length) throw new Error(`CSV record ${i + 1}: expected ${headers.length} columns, found ${record.length}`);
    }
    if (!records.length) throw new Error('CSV contains no records');
  }
  return records.map(record => Object.fromEntries(headers.map((header, i) => [header, record[i] ?? ''])));
}
module.exports = { parseCSV };
