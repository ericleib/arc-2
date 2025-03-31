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
    const report = this.evalReport(fn);
    if(!report.success) {
      console.log(`-> Sample ${this.index} failed:`);
      console.log(`Input:\n${this.input.toString()}`);
      console.log(`Output:\n${report.output?.toString() ?? report.error ?? 'Unknown error'}`);
      console.log(`Expected:\n${this.output.toString()}`);
      return false;
    }
    console.log(`-> Sample ${this.index} passed.`);
    return true;
  }

  evalReport(fn: (grid: Grid) => Grid) {
    try {
      const output = fn(this.input);
      return {success: output.equals(this.output), output};
    }
    catch(e: any) {
      return {success: false, error: e.message}
    }
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

  evalStr(str: string): {success: boolean, error?: string, reports?: any[]} {
    try {
      const fn = eval(str);
      const reports = this.train.map(sample => sample.evalReport(fn));
      reports.push(...this.test.map(sample => sample.evalReport(fn)));
      return {success: reports.every(r => r.success), reports};
    }
    catch(e: any) {
      console.error(e);
      return {success: false, error: e.message as string};
    }
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
