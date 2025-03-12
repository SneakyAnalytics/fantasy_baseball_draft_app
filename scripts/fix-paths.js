// fix-paths.js
import fs from 'fs';
import path from 'path';

// Read the built index.html file
const indexPath = path.resolve('dist/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace absolute paths with relative paths
html = html.replace(/src="\/fantasy_baseball_draft_app\//g, 'src="./');
html = html.replace(/href="\/fantasy_baseball_draft_app\//g, 'href="./');

// Write the fixed HTML back to the file
fs.writeFileSync(indexPath, html);

console.log('Fixed paths in index.html for GitHub Pages deployment');