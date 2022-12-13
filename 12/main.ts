import nreadlines from "n-readlines";
import createGraph from "ngraph.graph";
import { Node } from "ngraph.graph";
import path from "ngraph.path";

// canTravelFrom takes in two letters and returns whether you can travel from the first to the second.
// The elevation of the destination square can be at most one higher than the elevation of your current square.
// E.g. if your current elevation is m, you could step to elevation n, but not to elevation o.
function canTravelFrom(a: string, b: string): boolean {
  return b.charCodeAt(0) - a.charCodeAt(0) <= 1;
}

function one(inputFilename: string): string {
  return run(inputFilename, (v) => v === "S");
}

function two(inputFilename: string): string {
  return run(inputFilename, (v) => v === "S" || v === "a");
}

function run(
  inputFilename: string,
  startCondition: (string) => boolean
): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  const g = createGraph();
  let row = 0;
  let startNodes: Node[] = [];
  let endNode: Node | null = null;
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    const parts = line.split("");
    for (let col = 0; col < parts.length; col++) {
      const val = parts[col];
      const start = startCondition(val);
      const end = val === "E";
      const elevation = start ? "a" : end ? "z" : val;
      const node = g.addNode(`${row},${col}`, { elevation, start, end });
      if (start) {
        startNodes.push(node);
      } else if (end) {
        endNode = node;
      }
    }
    row++;
  }
  if (startNodes.length === 0 || endNode === null) {
    throw new Error("no start or end node");
  }
  g.forEachNode((node) => {
    let [row, col] = `${node.id}`.split(",").map((s) => parseInt(s, 10));
    for (let [r, c] of [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]) {
      const neighbor = g.getNode(`${r},${c}`);
      if (
        neighbor &&
        canTravelFrom(node.data.elevation, neighbor.data.elevation)
      ) {
        g.addLink(node.id, neighbor.id);
      }
    }
  });
  let shortest = -1;
  const pathFinder = path.aStar(g, { oriented: true });
  for (let i = 0; i < startNodes.length; i++) {
    const startNode = startNodes[i];
    const foundPath = pathFinder.find(startNode.id, endNode.id);
    if (foundPath === null || foundPath.length === 0) {
      continue; // no path found
    }
    const pathLength = foundPath.length - 1;
    if (shortest === -1 || pathLength < shortest) {
      shortest = pathLength;
    }
  }
  return `${shortest}`;
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
