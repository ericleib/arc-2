export class Grid {

  width: number;
  height: number

  constructor(
    private grid: number[][]
  ) {
    this.height = grid.length;
    this.width = grid[0].length;
  }

  static create(width: number, height: number, value=-1) {
    const rows = Array.from({length: height}, () => Array(width).fill(value));
    return new Grid(rows);
  }

  at(x: number, y: number): number {
    return this.grid[y][x];
  }

  select(x: number, y: number, width = 1, height = 1, values?: number[]): Grid {
    const rows: number[][] = [];
    let valueSet = values ? new Set(values) : undefined;
    for (let i = 0; i < height; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < width; j++) {
        const value = this.grid[y + i][x + j];
        row.push(valueSet ? (valueSet.has(value) ? value : -1) : value);
      }
    }
    return new Grid(rows);
  }

  insert(grid: Grid, x: number, y: number): Grid {
    const rows: number[][] = [];
    for (let i = 0; i < this.height; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < this.width; j++) {
        if (i >= y && i < y + grid.height && j >= x && j < x + grid.width) {
          const color = grid.at(j - x, i - y);
          if (color !== -1) {
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

  rotate(angle: 'right' | 'left'): Grid {
    const rows: number[][] = [];
    for (let i = 0; i < this.width; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < this.height; j++) {
        if (angle === 'right') {
          row.push(this.grid[this.height - j - 1][i]);
        }
        else {
          row.push(this.grid[j][this.width - i - 1]);
        }
      }
    }
    return new Grid(rows);
  }

  flip(axis: 'x' | 'y'): Grid {
    const rows: number[][] = [];
    for (let i = 0; i < this.height; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < this.width; j++) {
        if (axis === 'x') {
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

  concat(grid: Grid, axis: 'x' | 'y'): Grid {
    if (axis === 'x') {
      if (this.height !== grid.height) {
        throw new Error('Height mismatch');
      }
      const rows: number[][] = [];
      for (let i = 0; i < this.height; i++) {
        const row: number[] = [];
        rows.push(row);
        for (let j = 0; j < this.width + grid.width; j++) {
          if (j < this.width) {
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
      if (this.width !== grid.width) {
        throw new Error('Width mismatch');
      }
      const rows: number[][] = [];
      for (let i = 0; i < this.height + grid.height; i++) {
        const row: number[] = [];
        rows.push(row);
        for (let j = 0; j < this.width; j++) {
          if (i < this.height) {
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

  replace(val: number, newVal: number): Grid {
    const rows: number[][] = [];
    for (const row of this.grid) {
      const newRow: number[] = [];
      rows.push(newRow);
      for (const v of row) {
        newRow.push(v === val ? newVal : v);
      }
    }
    return new Grid(rows);
  }

  count(values: number[]) {
    const valueSet = new Set(values);
    let count = 0;
    for (const row of this.grid) {
      for (const c of row) {
        if (valueSet.has(c)) {
          count++;
        }
      }
    }
    return count;
  }

  partition(background = 0) {
    const partitions: {x: number[], y: number[]}[] = [];
    let visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));

    const dfs = (x: number, y: number, partitionId: number) => {
      // Stack for DFS
      let stack = [[y, x]];
      visited[y][x] = true;

      while (stack.length > 0) {
        let [cy, cx] = stack.pop()!;

        // Directions for vertical and horizontal moves (N, S, E, W)
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        // Explore the neighbors
        for (let [dx, dy] of directions) {
          let nx = cx + dx;
          let ny = cy + dy;

          // Check bounds and whether the neighbor should be visited
          if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && !visited[ny][nx] && this.grid[ny][nx] !== background) {
            visited[ny][nx] = true;
            stack.push([ny, nx]);
            partitions[partitionId].x.push(nx);
            partitions[partitionId].y.push(ny);
          }
        }
      }
    }

    // Find all partitions
    let partitionsId = 0;
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.grid[i][j] !== background && !visited[i][j]) {
          // Found a new partition
          partitions.push({x: [j], y: [i]});
          dfs(j, i, partitionsId);
          partitionsId++;
        }
      }
    }

    return partitions.map(({x, y}) => {
      const minX = Math.min(...x);
      const maxX = Math.max(...x);
      const minY = Math.min(...y);
      const maxY = Math.max(...y);
      const grid = Grid.create(maxX - minX + 1, maxY - minY + 1, -1);
      for (let i = 0; i < x.length; i++) {
        grid.grid[y[i] - minY][x[i] - minX] = this.grid[y[i]][x[i]];
      }
      return {grid, x: minX, y: minY};
    });
  }

  equals(grid: Grid): boolean {
    if (this.width !== grid.width || this.height !== grid.height) {
      return false;
    }
    for (let i = 0; i < grid.height; i++) {
      for (let j = 0; j < grid.width; j++) {
        if (this.at(j, i) !== grid.at(j, i)) {
          return false;
        }
      }
    }
    return true;
  }

  toString(blanks = ' ') {
    return this.grid
      .map(row => row.join(''))
      .join('\n')
      .replaceAll('-1', blanks);
  }

}