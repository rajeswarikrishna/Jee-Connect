const fs = require('fs');
const path = require('path');

const files = [
  'src/db/schema.ts',
  'src/db/jee_main_seed.ts',
  'src/db/jee_advanced_seed.ts',
  'src/db/extra_pyq_seed.ts'
];

function updateYears(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace year: 202X or year:202X
  content = content.replace(/year\s*:\s*(2019|2020|2021|2022|2023|2024)/g, (match, yr) => {
    let year = parseInt(yr);
    if (year === 2019) return 'year: 2023';
    if (year === 2020) return 'year: 2024';
    if (year === 2021) return 'year: 2025';
    if (year === 2022) return 'year: 2023';
    if (year === 2023) return 'year: 2024';
    if (year === 2024) return 'year: 2025';
    return match;
  });
  
  // Also replace Pyq question text years like "[PYQ 202X]"
  content = content.replace(/\[PYQ\s+(2019|2020|2021|2022|2023|2024)\]/g, (match, yr) => {
    let year = parseInt(yr);
    if (year === 2019) return '[PYQ 2023]';
    if (year === 2020) return '[PYQ 2024]';
    if (year === 2021) return '[PYQ 2025]';
    if (year === 2022) return '[PYQ 2023]';
    if (year === 2023) return '[PYQ 2024]';
    if (year === 2024) return '[PYQ 2025]';
    return match;
  });

  fs.writeFileSync(fullPath, content);
  console.log(`Updated years in ${filePath}`);
}

files.forEach(updateYears);
