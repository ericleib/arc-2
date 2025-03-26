export class Grid {

  width: number;
  height: number
  
  constructor(
    private grid: number[][]
  ) {
    this.height = grid.length;
    this.width = grid[0].length;
  }

  at(x: number, y: number): number {
    return this.grid[y][x];
  }

  select(x: number, y: number, width=1, height=1, colors?: number[]): Grid {
    const rows: number[][] = [];
    let colorSet = colors? new Set(colors) : undefined;
    for (let i = 0; i < height; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < width; j++) {
        const color = this.grid[y + i][x + j];
        row.push(colorSet? (colorSet.has(color)? color : -1) : color);
      }
    }
    return new Grid(rows);
  }

  add(grid: Grid, x: number, y: number): Grid {
    const rows: number[][] = [];
    for (let i = 0; i < this.height; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < this.width; j++) {
        if(i >= y && i < y + grid.height && j >= x && j < x + grid.width) {
          const color = grid.at(j - x, i - y);
          if(color !== -1) {
            row.push(color);
            continue;
          }
        }
        const color = this.grid[i][j];
        row.push(color);
      }
    }
    return new Grid(rows);
  }

  rotate(angle: 'right'|'left'): Grid {
    const rows: number[][] = [];
    for (let i = 0; i < this.width; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < this.height; j++) {
        if(angle === 'right') {
          row.push(this.grid[this.height - j - 1][i]);
        }
        else {
          row.push(this.grid[j][this.width - i - 1]);
        }
      }
    }
    return new Grid(rows);
  }

  flip(axis: 'x'|'y'): Grid {
    const rows: number[][] = [];
    for(let i = 0; i < this.height; i++) {
      const row: number[] = [];
      rows.push(row);
      for(let j = 0; j < this.width; j++) {
        if(axis === 'x') {
          row.push(this.grid[i][this.width - j - 1]);
        }
        else {
          row.push(this.grid[this.height - i - 1][j]);
        }
      }
    }
    return new Grid(rows);
  }

  invert(): Grid {
    const rows: number[][] = [];
    for (let i = 0; i < this.width; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < this.height; j++) {
        row.push(this.at(i, j));
      }
    }
    return new Grid(rows);
  }

  concat(grid: Grid, axis: 'x'|'y'): Grid {
    if(axis === 'x') {
      if(this.height !== grid.height) {
        throw new Error('Height mismatch');
      }
      const rows: number[][] = [];
      for (let i = 0; i < this.height; i++) {
        const row: number[] = [];
        rows.push(row);
        for (let j = 0; j < this.width + grid.width; j++) {
          if(j < this.width) {
            row.push(this.grid[i][j]);
          }
          else {
            row.push(grid.grid[i][j - this.width]);
          }
        }
      }
      return new Grid(rows);
    }
    else {
      if(this.width !== grid.width) {
        throw new Error('Width mismatch');
      }
      const rows: number[][] = [];
      for (let i = 0; i < this.height + grid.height; i++) {
        const row: number[] = [];
        rows.push(row);
        for (let j = 0; j < this.width; j++) {
          if(i < this.height) {
            row.push(this.grid[i][j]);
          }
          else {
            row.push(grid.grid[i - this.height][j]);
          }
        }
      }
      return new Grid(rows);
    }
  }

  toString(blanks = ' ') {
    return this.grid
      .map(row => row.join(''))
      .join('\n')
      .replaceAll('-1', blanks);
  }

}