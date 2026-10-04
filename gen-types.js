// gen-types.js
import fs from 'fs';
import path from 'path';

const typesDir = './src/types';
const indexFile = path.join(typesDir, 'index.ts');

// Get all .ts files except index.ts
const files = fs.readdirSync(typesDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')
    .map(file => `export * from './${file.replace('.ts', '')}';`);

// Write the index.ts file
fs.writeFileSync(indexFile, files.join('\n') + '\n');
console.log('✅ Types index.ts updated!');