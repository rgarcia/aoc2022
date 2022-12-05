import nreadlines from "n-readlines";

type SIDRange = [number, number];

// contains returns true if the first or second SIDRange contains the other
function contains(r1: SIDRange, r2: SIDRange): boolean {
  return (
    (r1[0] <= r2[0] && r1[1] >= r2[1]) || (r2[0] <= r1[0] && r2[1] >= r1[1])
  );
}

// overlaps returns true if the two SIDRanges overlap
function overlaps(r1: SIDRange, r2: SIDRange): boolean {
  return (
    (r1[0] <= r2[0] && r1[1] >= r2[0]) || (r2[0] <= r1[0] && r2[1] >= r1[0])
  );
}

function one(inputFilename: string): number {
  const input = new nreadlines(inputFilename);
  let total = 0;
  let l;
  while ((l = input.next())) {
    const line: string = l.toString("ascii").trim();
    // split line like "2-4,6-8" into two SIDRanges
    const ranges = line
      .split(",")
      .map((r) => r.split("-").map((n) => parseInt(n, 10)) as SIDRange);
    if (contains(ranges[0], ranges[1])) {
      total += 1;
    }
  }
  return total;
}

function two(inputFilename: string): number {
  const input = new nreadlines(inputFilename);
  let total = 0;
  let l;
  while ((l = input.next())) {
    const line: string = l.toString("ascii").trim();
    // split line like "2-4,6-8" into two SIDRanges
    const ranges = line
      .split(",")
      .map((r) => r.split("-").map((n) => parseInt(n, 10)) as SIDRange);
    if (overlaps(ranges[0], ranges[1])) {
      total += 1;
    }
  }
  return total;
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
