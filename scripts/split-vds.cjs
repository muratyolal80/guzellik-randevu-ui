const fs = require('fs');
const path = require('path');

const archiveDir = path.join(__dirname, 'initdb', 'archive');
const outputDir = path.join(__dirname, 'initdb');

const files = fs.readdirSync(archiveDir).filter(f => f.startsWith('New-') && f.endsWith('.sql')).sort();

let sql01 = "-- 01-VDS-Base-Schema.sql\n-- Auto-generated from archive migrations\n\n";
let sql02 = "-- 02-Views-And-Functions.sql\n-- Auto-generated from archive migrations\n\n";
let sql03 = "-- 03-RLS-Policies.sql\n-- Auto-generated from archive migrations\n\n";
let sql04 = "-- 04-Seed-Data.sql\n-- Auto-generated from archive migrations\n\n";

// Function to split sql into statements roughly.
// This is a naive split that doesn't handle $$, so we will just do string matching per file if possible, or use a better approach.

for (const file of files) {
    if (file === 'New-00-Drop-All.sql') continue; // skip drop all

    const content = fs.readFileSync(path.join(archiveDir, file), 'utf8');

    // Instead of parsing SQL (which is very hard with PL/pgSQL $$ blocks), we can categorize based on file names or content if they are mostly single-purpose.
    // However, since some files are mixed, the safest way to maintain exact identical behavior to local DB while satisfying the 4-file structure is to:
    // Append EVERYTHING to 01-VDS-Base-Schema.sql sequentially, EXCEPT if the file is explicitly just functions, views, RLS, or seed.
    // Let's look at the filenames.

    const lowerFile = file.toLowerCase();

    if (lowerFile.includes('seed') || lowerFile.includes('auth-users')) {
        sql04 += `-- From ${file}\n` + content + "\n\n";
    } else if (lowerFile.includes('rls')) {
        sql03 += `-- From ${file}\n` + content + "\n\n";
    } else if (lowerFile.includes('function') || lowerFile.includes('trigger') || lowerFile.includes('view')) {
        sql02 += `-- From ${file}\n` + content + "\n\n";
    } else {
        // Mixed files or table creations go to 01
        sql01 += `-- From ${file}\n` + content + "\n\n";
    }
}

fs.writeFileSync(path.join(outputDir, '01-VDS-Base-Schema.sql'), sql01);
fs.writeFileSync(path.join(outputDir, '02-Views-And-Functions.sql'), sql02);
fs.writeFileSync(path.join(outputDir, '03-RLS-Policies.sql'), sql03);
fs.writeFileSync(path.join(outputDir, '04-Seed-Data.sql'), sql04);

console.log("Done generating 01, 02, 03, 04 VDS files.");
