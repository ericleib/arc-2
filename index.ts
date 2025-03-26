import * as fs from 'fs/promises';
import * as path from 'path';
import { createImages } from './image';
import { analyze } from './llm';
import { Grid } from './grid';
import dotenv from 'dotenv';
import { loadCaseFile } from './types';
dotenv.config();

const dataDir = path.join(__dirname, 'ARC-AGI-2', 'data');

// list files under ARC-AGI-2/data/training folder
const trainingDataDir = path.join(dataDir, 'training');
const files = await fs.readdir(trainingDataDir);

const sample = files.slice(0, 10);
const cases = await Promise.all(sample.map(f => loadCaseFile(trainingDataDir, f)));

const imagesDir = path.join(dataDir, 'images');
for (const c of cases) {
  await createImages(imagesDir, c);
}

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
// console.log("\nadd\n" + grid.add(new Grid([[7,8],[9,-1]]), 1, 1).toString());
// console.log("\nadd\n" + grid.add(new Grid([[7,8],[9,-1]]), 0, 0).toString());
// console.log("\nadd\n" + grid.add(new Grid([[7,8],[9,-1]]), 1, 0).toString());
// console.log("\ninvert\n" + grid.invert().toString());