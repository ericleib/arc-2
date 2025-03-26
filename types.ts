import { Grid } from './grid';
import { readFile } from 'fs/promises';
import { join } from 'path';

export type Sample = { input: Grid, output: Grid };
export type Case = { name: string, train: Sample[], test: Sample[] };

export async function loadCaseFile(dir: string, file: string): Promise<Case> {
  const path = join(dir, file);
  const name = file.split('.')[0];
  const str = await readFile(path, 'utf-8');
  const data = JSON.parse(str);
  return {
    name,
    train: data.train.map((sample: any) => ({
      input: new Grid(sample.input),
      output: new Grid(sample.output)
    })),
    test: data.test.map((sample: any) => ({
      input: new Grid(sample.input),
      output: new Grid(sample.output)
    }))
  }
}
