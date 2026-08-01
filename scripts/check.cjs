const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { compile } = require('svelte/compiler');


function walk(directory) {
   return fs.readdirSync(directory, { withFileTypes: true })
      .flatMap(entry => {
         const file = path.join(directory, entry.name);
         return entry.isDirectory() ? walk(file) : [file];
      });
}


const sourceFiles = walk('src');
const componentFiles = sourceFiles.filter(file => file.endsWith('.svelte'));
const javascriptFiles = sourceFiles.filter(file => file.endsWith('.js'));

const allowedWarnings = new Set();

const unexpectedWarnings = [];

for (const file of componentFiles) {
   const result = compile(fs.readFileSync(file, 'utf8'), {
      filename: file,
      generate: false
   });

   for (const warning of result.warnings) {
      const key = `${file}:${warning.code}`;
      if (!allowedWarnings.has(key)) unexpectedWarnings.push(key);
   }
}

for (const file of javascriptFiles) {
   const result = spawnSync(process.execPath, ['--check', file], {
      stdio: 'inherit'
   });

   if (result.error) throw result.error;
   if (result.status !== 0) process.exit(result.status || 1);
}

if (unexpectedWarnings.length > 0) {
   console.error('Unexpected Svelte warnings:');
   unexpectedWarnings.forEach(warning => console.error(`- ${warning}`));
   process.exit(1);
}

console.log(
   `Checked ${componentFiles.length} Svelte components and ` +
   `${javascriptFiles.length} JavaScript files.`
);
