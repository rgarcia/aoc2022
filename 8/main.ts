import nreadlines from "n-readlines";

function one(inputFilename: string): string {
  return run(inputFilename, (grid) => {
    // count visible trees
    let visible: number = 0;
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        const position = new Coord(x, y, grid);
        const value = position.value();
        type directionAndName = [() => number | false, string];
        const directionsAndNames: directionAndName[] = [
          [position.up, "up"],
          [position.down, "down"],
          [position.left, "left"],
          [position.right, "right"],
        ];
        for (let [direction, name] of directionsAndNames) {
          let visibleFromThisDirection = true;
          position.set(x, y);
          for (
            let next = direction.call(position);
            next !== false;
            next = direction.call(position)
          ) {
            if (next >= value) {
              visibleFromThisDirection = false;
              break;
            }
          }
          if (!visibleFromThisDirection) {
            continue;
          } else {
            visible += 1;
            break;
          }
        }
      }
    }
    return visible.toString();
  });
}

function two(inputFilename: string): string {
  return run(inputFilename, (grid) => {
    // find the tree with the highest scenic score
    // (ignore trees on the edge since they will have a score of 0)
    let highest: number = 0;
    for (let x = 1; x < grid.length - 1; x++) {
      for (let y = 1; y < grid[x].length - 1; y++) {
        const position = new Coord(x, y, grid);
        const value = position.value();
        let scenicScore: number | null = null;
        type directionAndName = [() => number | false, string];
        const directionsAndNames: directionAndName[] = [
          [position.up, "up"],
          [position.down, "down"],
          [position.left, "left"],
          [position.right, "right"],
        ];
        for (let [direction, name] of directionsAndNames) {
          position.set(x, y);
          let score = 1;
          let next = direction.call(position);
          while (true) {
            if (next >= value) {
              break;
            }
            next = direction.call(position);
            if (next === false) {
              break;
            } else {
              score += 1;
            }
          }
          if (scenicScore === null) {
            scenicScore = score;
          } else {
            scenicScore *= score;
          }
        }
        if (scenicScore !== null && scenicScore > highest) {
          highest = scenicScore;
        }
      }
    }
    return highest.toString();
  });
}

// Coord represents an x,y coordinate that can be moved up, down, left, or right
// x and y must be >= 0 and less than the size of the grid
class Coord {
  x: number;
  y: number;
  grid: readonly number[][];
  constructor(x: number, y: number, grid: readonly number[][]) {
    this.x = x;
    this.y = y;
    this.grid = grid;
  }
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  left(): number | false {
    if (this.y === 0) {
      return false;
    }
    this.y = this.y - 1;
    return this.value();
  }
  right(): number | false {
    if (this.y === this.grid.length - 1) {
      return false;
    }
    this.y = this.y + 1;
    return this.value();
  }
  up(): number | false {
    if (this.x === 0) {
      return false;
    }
    this.x = this.x - 1;
    return this.value();
  }
  down(): number | false {
    if (this.x === this.grid[0].length - 1) {
      return false;
    }
    this.x = this.x + 1;
    return this.value();
  }
  value(): number {
    return this.grid[this.x][this.y];
  }
}

type InputSolver = (grid: number[][]) => string;

function run(inputFilename: string, inputSolver: InputSolver): string {
  const input = new nreadlines(inputFilename);
  let grid: number[][] = [];
  let l: Buffer | false;
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    let row: number[] = line.split("").map((c) => parseInt(c));
    if (grid.length > 0 && row.length !== grid[0].length) {
      throw new Error("not a square grid");
    }
    // add the row to the grid
    grid.push(row);
  }
  return inputSolver(grid);
}

if (!process.argv[2]) {
  console.error("must provide input file");
} else if (!process.argv[3]) {
  console.error("must provide part 'one' or 'two'");
} else if (process.argv[3] === "one") {
  console.log(one(process.argv[2]));
} else if (process.argv[3] === "two") {
  console.log(two(process.argv[2]));
}
