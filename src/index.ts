import { readdir } from 'fs/promises';
import { join } from 'path';
import { analyze } from './llm';
import dotenv from 'dotenv';
import { loadCaseFile } from './case';
import { testSolutions } from 'solutions';

// Load .env file
dotenv.config();

const dataDir = join(__dirname, '..', 'ARC-AGI-2', 'data');
const trainingDataDir = join(dataDir, 'training');
const runsDir = join(__dirname, '..', 'runs');

// Test the hand written solutions
// await testSolutions(trainingDataDir);

// Generate solutions with LLM on first 10 cases
const files = await readdir(trainingDataDir);
for(const file of files.slice(0, 10)) {
  const c = await loadCaseFile(trainingDataDir, file);
  console.log(await analyze(c, runsDir));
}
