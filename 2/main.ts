import nreadlines from "n-readlines";

enum Throw {
  Rock = 1,
  Paper,
  Scissors,
}

enum Outcome {
  Win = 1,
  Draw,
  Loss,
}

// throwForOutcome returns the throw that would result in the given outcome against the given throw
function throwForOutcome(throw1: Throw, outcome: Outcome): Throw {
  switch (outcome) {
    case Outcome.Win:
      switch (throw1) {
        case Throw.Rock:
          return Throw.Paper;
        case Throw.Paper:
          return Throw.Scissors;
        case Throw.Scissors:
          return Throw.Rock;
      }
    case Outcome.Draw:
      return throw1;
    case Outcome.Loss:
      switch (throw1) {
        case Throw.Rock:
          return Throw.Scissors;
        case Throw.Paper:
          return Throw.Rock;
        case Throw.Scissors:
          return Throw.Paper;
      }
  }
}

// letterToThrow converts A or X to Rock, B or Y to Paper, C or Z to Scissors
function letterToThrow(letter: string): Throw {
  switch (letter) {
    case "A":
    case "X":
      return Throw.Rock;
    case "B":
    case "Y":
      return Throw.Paper;
    case "C":
    case "Z":
      return Throw.Scissors;
  }
}

// letterToOutcome converts X to Loss, Y to Draw, and Z to Win
function letterToOutcome(letter: string): Outcome {
  switch (letter) {
    case "X":
      return Outcome.Loss;
    case "Y":
      return Outcome.Draw;
    case "Z":
      return Outcome.Win;
  }
}

// throwValue returns the value of a throw: 1 for Rock, 2 for Paper, 3 for Scissors
function throwValue(t: Throw): number {
  switch (t) {
    case Throw.Rock:
      return 1;
    case Throw.Paper:
      return 2;
    case Throw.Scissors:
      return 3;
  }
}

// score returns the score of a round. The score for a single round is the score for the shape you selected (1 for Rock, 2 for Paper, and 3 for Scissors) plus the score for the outcome of the round (0 if you lost, 3 if the round was a draw, and 6 if you won).
function score(throw1: Throw, throw2: Throw): number {
  if (throw1 === throw2) {
    return throwValue(throw2) + 3;
  }
  if (throw1 === Throw.Rock) {
    if (throw2 === Throw.Paper) {
      return throwValue(throw2) + 6;
    } else if (throw2 === Throw.Scissors) {
      return throwValue(throw2) + 0;
    } else if (throw2 === Throw.Rock) {
      return throwValue(throw2) + 3;
    }
  } else if (throw1 === Throw.Paper) {
    if (throw2 === Throw.Scissors) {
      return throwValue(throw2) + 6;
    } else if (throw2 === Throw.Rock) {
      return throwValue(throw2) + 0;
    } else if (throw2 === Throw.Paper) {
      return throwValue(throw2) + 3;
    }
  } else if (throw1 === Throw.Scissors) {
    if (throw2 === Throw.Rock) {
      return throwValue(throw2) + 6;
    } else if (throw2 === Throw.Paper) {
      return throwValue(throw2) + 0;
    } else if (throw2 === Throw.Scissors) {
      return throwValue(throw2) + 3;
    }
  }
}

function one(inputFilename: string): number {
  const input = new nreadlines(inputFilename);
  let total = 0;
  let l;
  while ((l = input.next())) {
    const line: string = l.toString("ascii").trim();
    if (line === "") {
      continue;
    }
    const throws = line.split(" ");
    const roundScore = score(
      letterToThrow(throws[0]),
      letterToThrow(throws[1])
    );
    total += roundScore;
  }
  return total;
}

function two(inputFilename: string): number {
  const input = new nreadlines(inputFilename);
  let total = 0;
  let l;
  while ((l = input.next())) {
    const line: string = l.toString("ascii").trim();
    if (line === "") {
      continue;
    }
    const parts = line.split(" ");
    const throw1 = letterToThrow(parts[0]);
    const throw2 = throwForOutcome(throw1, letterToOutcome(parts[1]));
    const roundScore = score(throw1, throw2);
    total += roundScore;
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
