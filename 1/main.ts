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
  return highestCalSum;
}

if (!process.argv[2]) {
  console.error("must provide input file");
} else {
  console.log(one(process.argv[2]));
}
