import { Grid } from './grid';
import { readFile } from 'fs/promises';
import { join } from 'path';

export class Sample {

  constructor(
    public index: number,
    public input: Grid,
    public output: Grid
  ) {}

  eval(fn: (grid: Grid) => Grid): boolean {
    const output = fn(this.input);
    if(!output.equals(this.output)) {
      console.log(`-> Sample ${this.index} failed:`);
      console.log(`Input:\n${this.input.toString()}`);
      console.log(`Output:\n${output.toString()}`);
      console.log(`Expected:\n${this.output.toString()}`);
      return false;
    }
    console.log(`-> Sample ${this.index} passed.`);
    return true;
  }

};

export class Case {
  
  constructor(
    public name: string,
    public train: Sample[],
    public test: Sample[]
  ) {}

  eval(fn: (grid: Grid) => Grid): boolean {
    console.log(`Case ${this.name}:`);
    console.log(`Training samples:`);
    const res = this.train.map(sample => sample.eval(fn));
    console.log(`Testing samples:`);
    res.push(...this.test.map(sample => sample.eval(fn)));
    return res.every(r => r);
  }

};

export async function loadCaseFile(dir: string, file: string): Promise<Case> {
  const path = join(dir, file);
  const name = file.split('.')[0];
  const str = await readFile(path, 'utf-8');
  const data = JSON.parse(str);
  return new Case(
    name,
    data.train.map((sample: any, i: number) => new Sample(i, new Grid(sample.input), new Grid(sample.output))),
    data.test.map((sample: any, i: number) => new Sample(i, new Grid(sample.input), new Grid(sample.output)))
  );
}
