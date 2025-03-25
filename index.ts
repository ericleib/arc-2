import * as fs from 'fs/promises';
import * as path from 'path';
import { createImages } from './image';
import { analyze } from './llm';
import dotenv from 'dotenv';
dotenv.config();

const dataDir = path.join(__dirname, 'ARC-AGI-2', 'data');

// list files under ARC-AGI-2/data/training folder
const trainingDataDir = path.join(dataDir, 'training');
const files = await fs.readdir(trainingDataDir);

// const sample = files.slice(0, 10);
// const imagesDir = path.join(dataDir, 'images');
// for (const file of sample) {
//   await createImages(file, trainingDataDir, imagesDir);
// }

for(const file of files.slice(0, 3)) {
  console.log(await analyze(file, trainingDataDir));
}
