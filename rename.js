const fs = require('fs');
const path = require('path');

const dir = 'bodner';
const files = fs.readdirSync(dir);

let content = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

// replace lowercase ruggenthaler with bodner in index.html
content = content.replace(/ruggenthaler/g, 'bodner');
fs.writeFileSync(path.join(dir, 'index.html'), content, 'utf8');

// rename files
for (const file of files) {
  if (file === 'index.html') continue;
  
  let newName = file;
  newName = newName.replace(/Ruggenthaler/g, 'Bodner');
  newName = newName.replace(/ruggenthaler/g, 'bodner');
  
  if (newName !== file) {
    fs.renameSync(path.join(dir, file), path.join(dir, newName));
  }
}

console.log('Renaming complete.');
