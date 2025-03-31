export class Grid {

  width: number;
  height: number

  constructor(
    private grid: number[][]
  ) {
    this.height = grid.length;
    this.width = grid[0].length;
  }

  static create(width: number, height: number, value = -1) {
    const rows = Array.from({ length: height }, () => Array(width).fill(value));
    return new Grid(rows);
  }

  at(x: number, y: number): number {
    return this.grid[y][x];
  }
  
  clear(fill = 0) {
    return Grid.create(this.width, this.height, fill);
  }

  find(fn: (v: number, x?: number, y?: number) => any): {value: number, x: number, y: number} | undefined {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (fn(this.grid[i][j], j, i)) {
          return { value: this.grid[i][j], x: j, y: i };
        }
      }
    }
    return undefined;
  }

  select(x: number, y: number, width = 1, height = 1): Grid {
    const rows: number[][] = [];
    for (let i = 0; i < height; i++) {
      const row: number[] = [];
      rows.push(row);
      for (let j = 0; j < width; j++) {
        if(y + i < 0 || y + i >= this.height || x + j < 0 || x + j >= this.width) {
          row.push(-1);
        }
        else {
          row.push(this.grid[y + i][x + j]);
        }
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

  transpose(): Grid {
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
    const rows: number[][] = [];
    if (axis === 'x') {
      const height = Math.max(this.height, grid.height);
      for (let i = 0; i < height; i++) {
        const row: number[] = [];
        rows.push(row);
        for (let j = 0; j < this.width + grid.width; j++) {
          if (j < this.width) {
            row.push(i < this.height? this.grid[i][j] : -1);
          }
          else {
            row.push(i < grid.height? grid.grid[i][j - this.width] : -1);
          }
        }
      }
    }
    else {
      const width = Math.max(this.width, grid.width);
      for (let i = 0; i < this.height + grid.height; i++) {
        const row: number[] = [];
        rows.push(row);
        for (let j = 0; j < width; j++) {
          if (i < this.height) {
            row.push(j < this.width? this.grid[i][j] : -1);
          }
          else {
            row.push(j < grid.width? grid.grid[i - this.height][j] : -1);
          }
        }
      }
    }
    return new Grid(rows);
  }

  replace(fn: (val: number, x?: number, y?: number) => any, newVal: number): Grid {
    const rows: number[][] = [];
    for (let i=0; i<this.height; i++) {
      const newRow: number[] = [];
      rows.push(newRow);
      for (let j=0; j<this.width; j++) {
        const val = this.grid[i][j];
        newRow.push(fn(val, j, i) ? newVal : val);
      }
    }
    return new Grid(rows);
  }

  count(fn: (val: number, x?: number, y?: number) => any) {
    let count = 0;
    for (let i=0; i<this.height; i++) {
      for (let j=0; j<this.width; j++) {
        if (fn(this.grid[i][j], j, i)) {
          count++;
        }
      }
    }
    return count;
  }

  partition(background = 0, diagonal = false) {
    const partitions: { x: number[], y: number[] }[] = [];
    const visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));

    // Directions for vertical and horizontal moves (N, S, E, W)
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    if (diagonal) {
      // Add diagonal moves (NW, NE, SW, SE)
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    const dfs = (x: number, y: number, partitionId: number) => {
      // Stack for DFS
      let stack = [[y, x]];
      visited[y][x] = true;

      while (stack.length > 0) {
        let [cy, cx] = stack.pop()!;

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
          partitions.push({ x: [j], y: [i] });
          dfs(j, i, partitionsId);
          partitionsId++;
        }
      }
    }

    return partitions.map(({ x, y }) => {
      const minX = Math.min(...x);
      const maxX = Math.max(...x);
      const minY = Math.min(...y);
      const maxY = Math.max(...y);
      const grid = Grid.create(maxX - minX + 1, maxY - minY + 1, -1);
      for (let i = 0; i < x.length; i++) {
        grid.grid[y[i] - minY][x[i] - minX] = this.grid[y[i]][x[i]];
      }
      return { grid, x: minX, y: minY };
    });
  }

  floodFill(value: number, background = 0, diagonal = false) {
    const grid = this.select(0, 0, this.width, this.height);
    const visited = Array.from({ length: grid.height }, () => Array(grid.width).fill(false));

    // Directions for vertical and horizontal moves (N, S, E, W)
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    if (diagonal) {
      // Add diagonal moves (NW, NE, SW, SE)
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    const queue: [number, number][] = [];
    // Add all border cells that are zeros
    for (let i = 0; i < grid.height; i++) {
      if (grid.grid[i][0] === background && !visited[i][0]) queue.push([i, 0]);
      if (grid.grid[i][grid.width - 1] === background && !visited[i][grid.width - 1]) queue.push([i, grid.width - 1]);
    }
    for (let j = 0; j < grid.width; j++) {
      if (grid.grid[0][j] === background && !visited[0][j]) queue.push([0, j]);
      if (grid.grid[grid.height - 1][j] === background && !visited[grid.height - 1][j]) queue.push([grid.height - 1, j]);
    }

    while (queue.length > 0) {
      const [cy, cx] = queue.shift()!;
      visited[cy][cx] = true;
      grid.grid[cy][cx] = value;
      for (const [dx, dy] of directions) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height && !visited[ny][nx] && grid.grid[ny][nx] === background) {
          visited[ny][nx] = true;
          queue.push([ny, nx]);
        }
      }
    }
    return grid;
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

// const grid = new Grid([
//   [0, 1, 2],
//   [0, 0, 0],
//   [3, 0, 5],
//   [4, 0, 6],
// ]);

// console.log("\nbase\n" + grid.toString());
// console.log("\nselect\n" + grid.select(1, 1, 2, 2).toString());
// console.log("\nselect\n" + grid.select(0, 2, 3, 2).toString());
// console.log("\nflip\n" + grid.flip('x').toString());
// console.log("\nflip\n" + grid.flip('y').toString());
// console.log("\nrotate\n" + grid.rotate('right').toString());
// console.log("\nrotate\n" + grid.rotate('left').toString());
// console.log("\ninsert\n" + grid.insert(new Grid([[7,8],[9,-1]]), 1, 1).toString());
// console.log("\ninsert\n" + grid.insert(new Grid([[7,8],[9,-1]]), 0, 0).toString());
// console.log("\ninsert\n" + grid.insert(new Grid([[7,8],[9,-1]]), 1, 0).toString());
// console.log("\ntranspose\n" + grid.transpose().toString());
// console.log("\nequals\n" + grid.equals(grid.select(0, 0, 3, 4)));
// console.log("\nreplace\n" + grid.replace(v => v === 0, -1).toString());
// console.log("\ncount\n" + grid.count(v => [1, 2, 3].includes(v)));
// console.log("\ncreate\n" + Grid.create(2, 3, 4))
// console.log("\nconcat\n" + grid.concat(Grid.create(2, 2, 5), 'x').toString());
// console.log("\nconcat\n" + grid.concat(Grid.create(2, 2, 5), 'y').toString());