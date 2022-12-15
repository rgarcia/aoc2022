import nreadlines from "n-readlines";
import createGraph from "ngraph.graph";
import { Node, Graph } from "ngraph.graph";

const SENSOR = "S";
const BEACON = "B";
const NOT_BEACON = "#";
const UNKNOWN = ".";

type Point = { x: number; y: number };
type Line = [Point, Point];

// manhattanDistance computes the manhattan distance between two points
function manhattanDistance(p1: Point, p2: Point): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

// boundingBox takes in a point and a manhattan distance and returns the four corners of the bounding box
// that contains all points <= that distance from the point
function boundingBox(p: Point, distance: number): [Point, Point, Point, Point] {
  return [
    { x: p.x - distance, y: p.y },
    { x: p.x, y: p.y - distance },
    { x: p.x + distance, y: p.y },
    { x: p.x, y: p.y + distance },
  ];
}

// iterateOnLine is a generator that takes in two points and iterates over all points on the line between them
function* iterateOnLine(
  p1: Point,
  p2: Point,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): Iterable<Point> {
  let p: Point = { x: p1.x, y: p1.y };
  let step: Point = {
    x: p2.x > p1.x ? 1 : p2.x < p1.x ? -1 : 0,
    y: p2.y > p1.y ? 1 : p2.y < p1.y ? -1 : 0,
  };
  while (p.x !== p2.x || p.y !== p2.y) {
    if (p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax) {
      yield p;
    }
    p = { x: p.x + step.x, y: p.y + step.y };
  }
  if (p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax) {
    yield p;
  }
}

// iterateOverPerimeter is a generator that takes in lower and upper bounds on x and y, along with four points, and iterates over the perimeter of the box
// defined by the four points, starting at the first point and going clockwise
function* iterateOverPerimeter(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Iterable<Point> {
  yield* iterateOnLine(p1, p2, xMin, xMax, yMin, yMax);
  yield* iterateOnLine(p2, p3, xMin, xMax, yMin, yMax);
  yield* iterateOnLine(p3, p4, xMin, xMax, yMin, yMax);
  yield* iterateOnLine(p4, p1, xMin, xMax, yMin, yMax);
}

// reduceConstraints takes in a list of constraints and reduces them to the smallest set of equivalent constraints
// For example, if you have the constraints:
// x in [1, 2], x in [3, 5], x in [4, 6], x in [5, 7], x in [5, 7]
// it reduces it to
// x in [1, 2], x in [3, 7]
function reduceConstraints(
  constraints: [number, number][]
): [number, number][] {
  constraints.sort((a, b) => a[0] - b[0]);
  let reduced: [number, number][] = [];
  let last: [number, number] | undefined;
  for (let c of constraints) {
    if (!last) {
      last = c;
      continue;
    }
    // if c is completely contained within last constraint, skip it
    if (c[0] >= last[0] && c[1] <= last[1]) {
      continue;
    }
    // if c overlaps with last constraint, combine them
    if (c[0] <= last[1]) {
      last[1] = Math.max(last[1], c[1]);
      console.log(`combining last with ${c} to get ${last}`);
    }
    // if c does not overlap with last constraint, add last constraint to reduced and set c as last constraint
    else {
      console.log(`adding ${last} to reduced list`);
      reduced.push(last);
      last = c;
    }
  }
  if (last) {
    console.log(`adding ${last} to reduced list`);
    reduced.push(last);
  }
  return reduced;
}

// getX returns the lower and upper bound (inclusive) values of x according to this logic:
// for a sensor at x, y with a beacon n distance away, and for a give y', return
// lower bound = |y'-y| + x - n
// upper bound = n - |y'-y| + x
// This tells you which points on the line y = y' are within n distance of the sensor and can be deemed not-a-beacon
function getX(
  p: Point,
  beaconDistance: number,
  yPrime: number
): [number, number] {
  return [
    Math.abs(yPrime - p.y) + p.x - beaconDistance,
    beaconDistance - Math.abs(yPrime - p.y) + p.x,
  ];
}

const lineRegex =
  /Sensor at x=([-\d]+), y=([-\d]+): closest beacon is at x=([-\d]+), y=([-\d]+)/;

function addNode(g: Graph, p: Point, type: string): void {
  const n = g.getNode(`${p.x},${p.y}`);
  if (
    type == NOT_BEACON &&
    n &&
    (n.data.type == BEACON || n.data.type == SENSOR)
  ) {
    return;
  }
  g.addNode(`${p.x},${p.y}`, { type });
}

function one(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  const g = createGraph();
  // acumulate a list of sensors and the manhattan distance to their closest beacon
  let sensors: { sensor: Point; beacon: Point; distance: number }[] = [];
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    console.log(line);
    const match = line.match(lineRegex);
    if (!match) {
      throw new Error(`unexpected line: ${line}`);
    }
    const sensorPt = { x: parseInt(match[1]), y: parseInt(match[2]) };
    const beaconPt = { x: parseInt(match[3]), y: parseInt(match[4]) };
    sensors.push({
      sensor: sensorPt,
      beacon: beaconPt,
      distance: manhattanDistance(sensorPt, beaconPt),
    });
    addNode(g, sensorPt, SENSOR);
    addNode(g, beaconPt, BEACON);
  }
  //const yToExamine = 10;
  const yToExamine = 2000000;

  // loop over all sensors and figure out what the x values that fall on the yToExamine line are not a beacon
  let xConstraints: [number, number][] = [];
  for (let s of sensors) {
    let [x1, x2] = getX(s.sensor, s.distance, yToExamine);
    if (x1 > x2) {
      continue;
    }
    xConstraints.push([x1, x2]);
  }
  const reduced = reduceConstraints(xConstraints);
  console.log(reduced);

  // count how many points exist within the reduced constraints that are not beacons or sensors
  let count = 0;
  for (let c of reduced) {
    for (let x = c[0]; x <= c[1]; x++) {
      let node = g.getNode(`${x},${yToExamine}`);
      if (!node || (node.data.type !== BEACON && node.data.type !== SENSOR)) {
        count++;
      }
    }
  }
  return `${count}`;
}

function two(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  // acumulate a list of sensors and the manhattan distance to their closest beacon
  let sensors: { sensor: Point; beacon: Point; distance: number }[] = [];
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    console.log(line);
    const match = line.match(lineRegex);
    if (!match) {
      throw new Error(`unexpected line: ${line}`);
    }
    const sensorPt = { x: parseInt(match[1]), y: parseInt(match[2]) };
    const beaconPt = { x: parseInt(match[3]), y: parseInt(match[4]) };
    sensors.push({
      sensor: sensorPt,
      beacon: beaconPt,
      distance: manhattanDistance(sensorPt, beaconPt),
    });
  }
  //const maxCoord = 20;
  const maxCoord = 4000000;

  for (let s of sensors) {
    console.log("considering sensor perimeter", s.sensor, s.distance);
    const box = boundingBox(s.sensor, s.distance + 1);
    for (let p of iterateOverPerimeter(
      0,
      maxCoord,
      0,
      maxCoord,
      box[0],
      box[1],
      box[2],
      box[3]
    )) {
      // loop over all sensors and figure out if the point falls outside the range of all of them
      let inRange = false;
      for (let s2 of sensors) {
        if (manhattanDistance(s2.sensor, p) <= s2.distance) {
          inRange = true;
          break;
        }
      }
      if (!inRange) {
        // we've found a point that is not in range of any sensor!
        console.log(`${p.x},${p.y}`);
        return `${4000000 * p.x + p.y}`;
      }
    }
  }
  return `todo`;
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
