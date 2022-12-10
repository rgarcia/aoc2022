import nreadlines from "n-readlines";

// Position is an x an y coordinate
class Position {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// Knot has a position. It can be moved up, down, left, and right. It keeps a Set of all of the positions it has visited.
class Knot {
  position: Position;
  visitedPositions: Set<string> = new Set();
  constructor(position: Position) {
    this.position = position;
    this.visitedPositions.add(position.toString());
  }
  up() {
    this.position.y++;
  }
  down() {
    this.position.y--;
  }
  left() {
    this.position.x--;
  }
  right() {
    this.position.x++;
  }
  updatePositionInRelationTo(head: Position) {
    // If the head is ever two steps directly up, down, left, or right from the tail, the tail must also move one step in that direction so it remains close enough
    if (head.x === this.position.x && head.y === this.position.y + 2) {
      this.up();
    } else if (head.x === this.position.x && head.y === this.position.y - 2) {
      this.down();
    } else if (head.x === this.position.x + 2 && head.y === this.position.y) {
      this.right();
    } else if (head.x === this.position.x - 2 && head.y === this.position.y) {
      this.left();
    }
    // Otherwise, if the head and tail aren't touching and aren't in the same row or column, the tail always moves one step diagonally to keep up:
    else if (
      !touching(head, this.position) &&
      head.x !== this.position.x &&
      head.y !== this.position.y
    ) {
      if (head.x > this.position.x) {
        this.right();
      } else {
        this.left();
      }
      if (head.y > this.position.y) {
        this.up();
      } else {
        this.down();
      }
    }
    this.visitedPositions.add(this.position.toString());
  }
}

// touching returns true if the two positions are touching
function touching(a: Position, b: Position): boolean {
  const v = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  return v === 1 || v === 2;
}

function one(inputFilename: string): string {
  return run(inputFilename, 2);
}

function two(inputFilename: string): string {
  return run(inputFilename, 10);
}

type InputSolver = () => string;

function run(inputFilename: string, numKnots: number): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  const knots: Knot[] = [];
  for (let i = 0; i < numKnots; i++) {
    knots.push(new Knot(new Position(0, 0)));
  }
  const head = knots[0];
  const tail = knots[numKnots - 1];
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    const parts = line.split(" ");
    const direction = parts[0];
    const distance = parseInt(parts[1]);
    for (let i = 0; i < distance; i++) {
      switch (direction) {
        case "U":
          head.up();
          break;
        case "D":
          head.down();
          break;
        case "L":
          head.left();
          break;
        case "R":
          head.right();
          break;
      }
      for (let i = 1; i < numKnots; i++) {
        knots[i].updatePositionInRelationTo(knots[i - 1].position);
      }
    }
  }
  return `${tail.visitedPositions.size}`;
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
