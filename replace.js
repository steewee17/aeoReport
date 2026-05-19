const fs = require('fs');

let content = fs.readFileSync('bodner/index.html', 'utf8');

const replacements = [
  [/KFZ Ruggenthaler/g, 'Auto- und Motorradhaus Bodner'],
  [/Ruggenthaler/g, 'Bodner'],
  [/Hans/g, 'Christian'],
  [/www\.hans-ruggenthaler\.at/g, 'www.autobodner-debant.at'],
  [/Pustertalerstraße 12c/g, 'Glocknerstraße 2'],
  [/Lienz/g, 'Nußdorf-Debant'],
  [/\+43 4852 67233/g, '+43 4852 63646'],
  [/30 Jahre Erfahrung/g, 'über 40 Jahre Erfahrung'],
  [/Meisterbetrieb Lienz/g, 'Meisterbetrieb Nußdorf-Debant'],
  [/kfz\.ruggenthaler@/g, 'motorrad@'],
  [/hans\.ruggenthaler/g, 'autobodner-debant'],
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

fs.writeFileSync('bodner/index.html', content, 'utf8');
console.log('Replacement complete.');
