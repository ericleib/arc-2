import type { Grid } from "grid";

export const solutions: Record<string, (grid: Grid) => Grid> = {
  "00576224": (grid) => {
    const row = grid.concat(grid, 'x').concat(grid, 'x');
    const flipped = grid.flip('x');
    const rowFliped = flipped.concat(flipped, 'x').concat(flipped, 'x');
    return row.concat(rowFliped, 'y').concat(row, 'y');
  }
}