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
const files = await fs.readdir(trainingDataDir);

//const sample = files.slice(0, 10);
//const cases = await Promise.all(sample.map(f => loadCaseFile(trainingDataDir, f)));

for(const [name, fn] of Object.entries(solutions)) {
  const c = await loadCaseFile(trainingDataDir, `${name}.json`);
  if(c.eval(fn)) {
    console.log(`=> Case ${name} passed!\n`)
  }
  else {
    console.error(`=> Case ${name} failed!\n`);
  }
}

// const c = await loadCaseFile(trainingDataDir, `00dbd492.json`);
// for(const {grid, x, y} of c.test[0].input.partition()) {
//   console.log("partition ", x, y);
//   console.log(grid.toString(), '\n');
// }


// const imagesDir = path.join(dataDir, 'images');
// for (const c of cases) {
//   await createImages(imagesDir, c);
// }

// for(const file of files.slice(0, 3)) {
//   console.log(await analyze(file, trainingDataDir));
// }

// const grid = new Grid([
//   [0, 1, 2],
//   [0, 0, 0],
//   [3, 0, 5],
//   [4, 0, 6],
// ]);

// console.log("\nbase\n" + grid.toString());
// console.log("\nselect\n" + grid.select(1, 1, 2, 2).toString());
// console.log("\nselect\n" + grid.select(0, 2, 3, 2, [3,4,5]).toString());
// console.log("\nflip\n" + grid.flip('x').toString());
// console.log("\nflip\n" + grid.flip('y').toString());
// console.log("\nrotate\n" + grid.rotate('right').toString());
// console.log("\nrotate\n" + grid.rotate('left').toString());
// console.log("\ninsert\n" + grid.insert(new Grid([[7,8],[9,-1]]), 1, 1).toString());
// console.log("\ninsert\n" + grid.insert(new Grid([[7,8],[9,-1]]), 0, 0).toString());
// console.log("\ninsert\n" + grid.insert(new Grid([[7,8],[9,-1]]), 1, 0).toString());
// console.log("\ninvert\n" + grid.invert().toString());
// console.log("\nequals\n" + grid.equals(grid.select(0, 0, 3, 4)));
// console.log("\nreplace\n" + grid.replace(0, -1).toString());
// console.log("\ncount\n" + grid.count([1, 2, 3]));
// console.log("\ncreate\n" + Grid.create(2, 3, 4))