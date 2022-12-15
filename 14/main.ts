import nreadlines from "n-readlines";
import createGraph from "ngraph.graph";
import { Node, Graph } from "ngraph.graph";

const ROCK = "#";
const AIR = ".";
const SAND = "o";
const SOURCE = "+";

const SOURCE_COORDS = [500, 0];

// DrawGraph takes in the graph of stuff, an upper left corner, and a lower right corner, and draws the graph in the given region.
// Drawing rock as #, air as ., sand as o, and the source of the sand as +.
function drawGraph(
  g: Graph, // the rocks etc.
  upperLeft: [number, number], // the upper left corner of the region to draw
  lowerRight: [number, number] // the lower right corner of the region to draw
): string {
  let [ulX, ulY] = upperLeft;
  let [lrX, lrY] = lowerRight;
  let lines: string[] = [];
  for (let y = ulY; y <= lrY; y++) {
    let line = "";
    for (let x = ulX; x <= lrX; x++) {
      let node = g.getNode(`${x},${y}`);
      if (!node) {
        line += AIR;
      } else if (node.data.rock) {
        line += ROCK;
      } else if (node.data.source) {
        line += SOURCE;
      } else if (node.data.sand) {
        line += SAND;
      } else {
        line += AIR;
      }
    }
    lines.push(line);
  }
  return lines.join("\n");
}

// dropSand takes in a graph and drops sand from the source node.
// It simulates what happens to the sand and stops when the sand comes to rest.
// It continues to drop units of sand until there is no more capacity to drop sand from the source node. It returns the number of units of sand that were successfully dropped.
// A unit of sand always falls down one step if possible, i.e. y+1.
// If the tile immediately below is blocked (by rock or sand), the unit of sand attempts to instead move diagonally one step down and to the left.
// If that tile is blocked, the unit of sand attempts to instead move diagonally one step down and to the right.
// Sand keeps moving as long as it is able to do so, at each step trying to move down, then down-left, then down-right.
// If all three possible destinations are blocked, the unit of sand comes to rest and no longer moves, at which point the next unit of sand is created back at the source.
// highestRockY is the y coordinate of the lowest rock in the graph.
// simulateFloor simulates a floor at highestRockY + 2, so that sand that falls into the void will come to rest at highestRockY + 1.
function dropSand(
  g: Graph,
  highestRockY: number,
  simulateFloor: boolean
): number {
  let dropped: number = 0;
  for (; true; dropped++) {
    // console.log(
    //   `after dropping ${dropped} units of sand:\n` +
    //     drawGraph(g, [488, 0], [512, 10])
    // );
    // console.log(
    //   `after dropping ${dropped} units of sand:\n` +
    //     drawGraph(g, [457, 0], [541, 169])
    // );
    const sourceNode: Node | undefined = g.getNode(SOURCE_COORDS.join(","));
    if (!sourceNode) {
      throw new Error("source node not found");
    }
    let [x, y] = SOURCE_COORDS;
    let moved: boolean;
    do {
      // try to move x, y down, then down-left, then down-right
      moved = false;
      for (let [dx, dy] of [
        [0, 1],
        [-1, 1],
        [1, 1],
      ]) {
        let [nx, ny] = [x + dx, y + dy];
        let node = g.getNode(`${nx},${ny}`);
        if (!node || !(node.data.sand || node.data.rock)) {
          x = nx;
          y = ny;
          moved = true;
          break;
        }
      }
    } while (moved && y < highestRockY + 1);
    if (!simulateFloor && y > highestRockY) {
      // the sand is falling into an endless void and we're done
      break;
    }
    g.addNode(`${x},${y}`, { sand: true });
    if (x === SOURCE_COORDS[0] && y === SOURCE_COORDS[1]) {
      // we didn't move at all, so we're done
      dropped++;
      return dropped;
    }
  }
  return dropped;
}

function run(inputFilename: string, simulateFloor: boolean): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  let g = createGraph();
  let highestRockY: number = 0;
  let highestRockX: number = 0;
  let lowestRockX: number = 1000;
  g.addNode(SOURCE_COORDS.join(","), { source: true });
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    const parts = line.split(" -> ");
    for (let i = 0; i < parts.length - 1; i++) {
      // parts[i] is something like "498,4", parts[i+1] is something like "498,6".
      // Draw edges in the rock graph that fully connect the line between these points
      let [x1, y1, x2, y2]: number[] = parts[i]
        .split(",")
        .concat(parts[i + 1].split(","))
        .map((s) => parseInt(s, 10));
      let dx = x2 - x1;
      let dy = y2 - y1;
      if (dx > 0 && dy > 0) {
        throw new Error("diagonal line");
      }
      let step: [number, number] = [
        dx > 0 ? 1 : dx < 0 ? -1 : 0,
        dy > 0 ? 1 : dy < 0 ? -1 : 0,
      ];
      for (let [x, y] = [x1, y1]; true; x += step[0], y += step[1]) {
        if (x === x2 && y === y2) {
          break;
        }
        g.addNode(`${x},${y}`, { rock: true });
        g.addNode(`${x + step[0]},${y + step[1]}`, { rock: true });
        g.addLink(`${x},${y}`, `${x + step[0]},${y + step[1]}`);
        highestRockY = Math.max(highestRockY, Math.max(y, y + step[1]));
        highestRockX = Math.max(highestRockX, Math.max(x, x + step[0]));
        lowestRockX = Math.min(lowestRockX, Math.min(x, x + step[0]));
      }
    }
  }
  // console.log(
  //   `lowestRockX: ${lowestRockX}, highestRockX: ${highestRockX}, highestRockY: ${highestRockY}`
  // );
  const dropped: number = dropSand(g, highestRockY, simulateFloor);
  return `${dropped}`;
}

function one(inputFilename: string): string {
  return run(inputFilename, false);
}

function two(inputFilename: string): string {
  return run(inputFilename, true);
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
