import nreadlines from "n-readlines";

// CircularBuffer is a circular buffer of size n of any type
class CircularBuffer<T> {
  private buffer: T[];
  private size: number;
  private index: number;
  constructor(size: number) {
    this.buffer = new Array(size);
    this.size = size;
    this.index = 0;
  }
  push(value: T) {
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.size;
  }
  get(index: number) {
    return this.buffer[(this.index + index) % this.size];
  }
  full() {
    return this.buffer[this.size - 1] !== undefined;
  }
  allUnique(): boolean {
    const set = new Set(this.buffer);
    return set.size === this.size;
  }
}

function one(inputFilename: string): string {
  return run(inputFilename, 4);
}

function two(inputFilename: string): string {
  return run(inputFilename, 14);
}

function run(inputFilename: string, n: number): string {
  let ret = "";
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    if (ret.length > 0) {
      ret += "\n";
    }
    const previous = new CircularBuffer<string>(n);
    for (let i = 0; i < line.length; i++) {
      previous.push(line[i]);
      if (!previous.full()) {
        continue;
      }
      if (previous.allUnique()) {
        ret += `${i + 1}`;
        break;
      }
    }
  }
  return ret;
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
