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
      const square = partition.grid.replace(-1, val);
      grid = grid.insert(square, partition.x, partition.y);
    }
    return grid;    
  },
  "00d62c1b": grid => grid.floodFill(1, 0, false).replace(0, 4).replace(1, 0),
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
      .replace(1, 0)
      .insert(main.grid.replace(8, fill), main.x, main.y);
  }
}