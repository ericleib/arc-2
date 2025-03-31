import { loadCaseFile } from "case";
import { Grid } from "grid";

export const solutions: Record<string, (grid: Grid) => Grid> = {
  "00576224": grid => {
    const row = grid.concat(grid, 'x').concat(grid, 'x');
    const flipped = grid.flip('x');
    const rowFliped = flipped.concat(flipped, 'x').concat(flipped, 'x');
    return row.concat(rowFliped, 'y').concat(row, 'y');
  },
  "00dbd492": grid => {
    const partitions = grid.partition();
    for(const partition of partitions) {
      const width = partition.grid.width;
      const val = width === 5? 8 : width === 7? 4 : 3;
      const square = partition.grid.replace(v => v === -1, val);
      grid = grid.insert(square, partition.x, partition.y);
    }
    return grid;    
  },
  "00d62c1b": grid => grid.floodFill(1, 0, false).replace(v => v === 0, 4).replace(v => v === 1, 0),
  "007bbfb7": grid => {
    let subgrids: Grid[] = [];
    for(let i=0; i<grid.height; i++) {
      for(let j=0; j<grid.width; j++) {
        const subgrid = grid.at(j, i) === 0? Grid.create(3, 3, 0) : grid;
        subgrids[i] = subgrids[i]? subgrids[i].concat(subgrid, 'x') : subgrid;
      }
    }
    return subgrids.reduce((acc, subgrid) => acc.concat(subgrid, 'y'));
  },
  "009d5c81": grid => {
    const partitions = grid.partition(0, true);
    const i = partitions.findIndex(p => p.grid.width === 3 && p.grid.height === 3);
    const symbol = partitions[i].grid;
    const fill = symbol.at(0, 0) === -1? 2 : symbol.at(1, 0) === -1? 3 : 7;
    const main = partitions[i === 0? 1 : 0];
    return grid
      .replace(v => v === 1, 0)
      .insert(main.grid.replace(v => v === 8, fill), main.x, main.y);
  },
  "017c7c7b": grid => {
    grid = grid.replace(v => v === 1, 2);
    const pattern = grid.select(0, 4, 3, 2);
    for(let i=0; i<grid.height; i++) {
      if(grid.select(0, i, 3, 2).equals(pattern)) {
        return grid.concat(grid.select(0, i+2, 3, 3), 'y');
      }
    }
    throw new Error("Pattern not found");
  },
  "025d127b": grid => {
    const partitions = grid.partition();
    grid = grid.clear();
    for(const partition of partitions) {
      grid = grid.insert(partition.grid, partition.x + (partition.grid.at(0,0) === -1? 0 : 1), partition.y);
    }
    return grid;
  },
  "045e512c": grid => {
    const partitions = grid.partition(0, true);
    const pattern = partitions.find(p => p.grid.width === 3 && p.grid.height === 3)!;
    const directions = [[4, 4], [4, -4], [-4, 4], [-4, -4], [4, 0], [-4, 0], [0, 4], [0, -4]];
    for(const [dx, dy] of directions) {
      const subgrid = grid.select(pattern.x + dx, pattern.y + dy, 3, 3);
      const match = subgrid.find(v => v !== 0);
      if(match) {
        const repeatGrid = pattern.grid.replace(v => v > 0, match.value);
        for(let i = 1; i <= 3; i++) {
          grid = grid.insert(repeatGrid, pattern.x + dx * i, pattern.y + dy * i);
        }
      }
    }
    return grid;
  },
  "0520fde7": grid => {
    const left = grid.select(0, 0, 3, 3);
    const right = grid.select(4, 0, 3, 3);
    grid = Grid.create(3, 3, 0);
    for(let i=0; i<3; i++) {
      for(let j=0; j<3; j++) {
        if(left.at(i, j) !== 0 && left.at(i, j) === right.at(i, j)) {
          grid = grid.insert(Grid.create(1, 1, 2), i, j);
        }
      }
    }
    return grid;
  },
  "03560426": grid => {
    const partitions = grid.partition().sort((a, b) => a.x - b.x);
    grid = grid.clear();
    let x = 0;
    let y = 0;
    for(const partition of partitions) {
      grid = grid.insert(partition.grid, x, y);
      x += partition.grid.width-1;
      y += partition.grid.height-1;
    }
    return grid;
  }
}

export async function testSolutions(dir: string) {  
  for(const [name, fn] of Object.entries(solutions)) {
    const c = await loadCaseFile(dir, `${name}.json`);
    if(c.eval(fn)) {
      console.log(`=> Case ${name} passed!\n`)
    }
    else {
      console.error(`=> Case ${name} failed!\n`);
    }
  }
}