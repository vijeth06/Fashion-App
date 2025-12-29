const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');
const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css']);

const replacements = new Map([
  ['âœ…', '✅'],
  ['âŒ', '❌'],
  ['âœ—', '✗'],
  ['âœ“', '✓'],
  ['âœ¨', '✨'],
  ['â™¡', '♥'],
  ['â¤ï¸', '❤️'],
  ['âš ï¸', '⚠️'],
  ['â˜…', '★'],
  ['â€¢', '•'],
  ['â†’', '→'],
  ['â€”', '—'],
  ['â€“', '–'],
  ['â‚¹', '₹'],
  ['Ã—', '×'],
]);

let changedFiles = 0;
let totalReplacements = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (exts.has(path.extname(entry.name))) {
      fixFile(full);
    }
  }
}

function fixFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  for (const [bad, good] of replacements) {
    if (text.includes(bad)) {
      const before = text.length;
      text = text.split(bad).join(good);
      const after = text.length;
      totalReplacements += Math.abs(after - before) / Math.abs(good.length - bad.length || 1); // rough count
      modified = true;
    }
  }
  if (modified) {
    fs.writeFileSync(filePath, text, 'utf8');
    changedFiles += 1;
    console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

walk(root);
console.log(`\nCompleted. Files changed: ${changedFiles}`);
