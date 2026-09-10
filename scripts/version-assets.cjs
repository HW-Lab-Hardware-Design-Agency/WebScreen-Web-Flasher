// Refresh local asset URLs whenever their contents change.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const directory = path.resolve(__dirname, '../public');
const index = path.join(directory, 'index.html');
const original = fs.readFileSync(index, 'utf8');
let updated = original;
for (const [attribute, filename] of [['src', 'script.js'], ['href', 'style.css']]) {
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, filename)))
        .digest('hex').slice(0, 12);
    const pattern = new RegExp(`${attribute}="${filename.replace('.', '\\.')}([?][^"]*)?"`, 'g');
    if ([...updated.matchAll(pattern)].length !== 1) throw new Error(`Expected one ${filename} reference`);
    updated = updated.replace(pattern, `${attribute}="${filename}?v=${digest}"`);
}
if (process.argv.includes('--check')) {
    if (updated !== original) {
        console.error('Asset URLs are stale. Run node scripts/version-assets.cjs and commit public/index.html.');
        process.exitCode = 1;
    }
} else if (updated !== original) {
    fs.writeFileSync(index, updated);
}
