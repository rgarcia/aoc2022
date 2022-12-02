import nreadlines from "n-readlines";

function one(inputFilename: string): number {
  const input = new nreadlines(inputFilename);
  let l;
  let currentCalSum = 0;
  let highestCalSum = 0;
  while ((l = input.next())) {
    const line: string = l.toString("ascii").trim();
    if (line === "") {
      if (currentCalSum > highestCalSum) {
        highestCalSum = currentCalSum;
      }
      currentCalSum = 0;
    } else {
      const lineAsNumber = parseInt(line, 10);
      currentCalSum += lineAsNumber;
    }
  }
  if (currentCalSum > highestCalSum) {
    highestCalSum = currentCalSum;
  }
  return highestCalSum;
}

function two(inputFilename: string): number {
  const input = new nreadlines(inputFilename);
  let currentCalSum = 0;
  let top3: number[] = [];
  const add = function (calsum: number) {
    currentCalSum += calsum;
  };
  const finalize = function () {
    if (top3.length == 3 && top3[2] > currentCalSum) {
      currentCalSum = 0;
    } else {
      top3.push(currentCalSum);
      currentCalSum = 0;
      top3.sort((a, b) => b - a);
      if (top3.length > 3) {
        top3 = top3.slice(0, 3);
      }
    }
  };
  let l;
  while ((l = input.next())) {
    const line: string = l.toString("ascii").trim();
    if (line !== "") {
      add(parseInt(line, 10));
    } else {
      finalize();
    }
  }
  finalize();
  let sum = 0;
  top3.map((s) => (sum += s));
  return sum;
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
