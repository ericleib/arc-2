import * as fs from 'fs/promises';
import * as path from 'path';
import { createImages } from './image';
import { analyze } from './llm';
import { Grid } from './grid';
import dotenv from 'dotenv';
import { loadCaseFile } from './case';
import { solutions } from 'solutions';
dotenv.config();

const dataDir = path.join(__dirname, '..', 'ARC-AGI-2', 'data');

// list files under ARC-AGI-2/data/training folder
const trainingDataDir = path.join(dataDir, 'training');

for(const [name, fn] of Object.entries(solutions)) {
  const c = await loadCaseFile(trainingDataDir, `${name}.json`);
  if(c.eval(fn)) {
    console.log(`=> Case ${name} passed!\n`)
  }
  else {
    console.error(`=> Case ${name} failed!\n`);
  }
}

const files = await fs.readdir(trainingDataDir);
//const sample = files.slice(0, 10);
//const cases = await Promise.all(sample.map(f => loadCaseFile(trainingDataDir, f)));

// const c = await loadCaseFile(trainingDataDir, `00576224.json`);
// console.log(c.evalStr(`grid => {
//   const row = grid.concat(grid, 'x').concat(grid, 'x');
//   const flipped = grid.flip('x');
//   const rowFliped = flipped.concat(flipped, 'x').concat(flipped, 'x');
//   return row.concat(rowFliped, 'y').concat(row, 'y');
// }`));

// const imagesDir = path.join(dataDir, 'images');
// for (const c of cases) {
//   await createImages(imagesDir, c);
// }

const runsDir =  path.join(__dirname, '..', 'runs');
for(const file of files.slice(0, 10)) {
  const c = await loadCaseFile(trainingDataDir, file);
  console.log(await analyze(c, runsDir));
}
