// Run every regression check, rooted at the project regardless of caller cwd.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const checks = fs.readdirSync(__dirname).filter(f => /^check-.+\.js$/.test(f) && f !== 'check-all.js').sort();
let failures = 0;
for (const file of checks) {
  console.log(`\n${file}`);
  const result = spawnSync(process.execPath, [path.join(__dirname, file)], { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) { failures++; if (result.error) console.error(result.error.message); }
}
console.log(`\n${checks.length - failures}/${checks.length} checks passed.`);
process.exitCode = failures ? 1 : 0;
