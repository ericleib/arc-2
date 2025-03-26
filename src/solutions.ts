import type { Grid } from "grid";

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
  }
}