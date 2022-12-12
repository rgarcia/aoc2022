import nreadlines from "n-readlines";

// Operation is a function that takes a number and returns a number
type Operation = (n: number) => number;

// ParseOperation parses a string like "new = old * old" or "new = old + 1" into an Operation.
function ParseOperation(s: string): Operation {
  const parts = s.split(" ");
  if (parts.length !== 5) {
    throw new Error("invalid operation");
  }
  const [new_, _, old, op, operand] = parts;
  if (old !== "old" || new_ !== "new") {
    throw new Error("invalid operation");
  }
  switch (op) {
    case "*":
      return (n: number) =>
        operand === "old" ? n * n : n * parseInt(operand, 10);
    case "+":
      return (n: number) =>
        operand === "old" ? n + n : n + parseInt(operand, 10);
  }
  throw new Error(`invalid operation ${op}`);
}

// Test is a divisibility test. It is a function that takes in a number and returns true or false.
type Test = (n: number) => boolean;

// ParseTest parses a string like "divisible by 11" into a Test.
function ParseTest(s: string): Test {
  const parts = s.split(" ");
  if (parts.length !== 3) {
    throw new Error(`invalid test ${s}`);
  }
  const [op, _, operand] = parts;
  switch (op) {
    case "divisible":
      return (n: number) => n % parseInt(operand, 10) === 0;
  }
  throw new Error(`invalid test ${op}`);
}

// MonkeyRegex is a multiline regex that matches a monkey's instructions. It extracts groups for
// the list of Starting items, the Operation, the Test, and the If true and If false instructions.
const MonkeyRegex = new RegExp(
  `Monkey (\\d+):
  Starting items: ([\\d, ]+)
  Operation: (.+)
  Test: (.+)
    If true: throw to monkey (\\d+)
    If false: throw to monkey (\\d+)`,
  "gm"
);

// Monkey is a class that has items, an operation, a test, and a map from true/false to the monkey number to throw to.
class Monkey {
  items: number[];
  operation: Operation;
  test: Test;
  throwToTrue: number;
  throwToFalse: number;
  constructor(
    items: number[],
    operation: Operation,
    test: Test,
    throwToTrue: number,
    throwToFalse: number
  ) {
    this.items = items;
    this.operation = operation;
    this.test = test;
    this.throwToTrue = throwToTrue;
    this.throwToFalse = throwToFalse;
  }
}

// Game has an array of monkeys and has a method for performing one round of the game.
// It keeps a count of how many items each monkey has inspected.
class Game {
  monkeys: Monkey[];
  inspections: { [key: number]: number } = {};
  constructor(monkeys: Monkey[]) {
    this.monkeys = monkeys;
    for (let i = 0; i < monkeys.length; i++) {
      this.inspections[i] = 0;
    }
  }
  // performRound performs one round of the game.
  performRound(): void {
    for (let i = 0; i < this.monkeys.length; i++) {
      const monkey = this.monkeys[i];
      while (monkey.items.length > 0) {
        let item = monkey.items[0];
        //console.log(`monkey ${i} inspecting item ${item}`);
        monkey.items = monkey.items.slice(1);
        item = monkey.operation(item);
        item = Math.trunc(item / 3);
        // console.log(
        //   `monkey ${i} performs operation on item and divides by three to get ${item}`
        // );
        if (monkey.test(item)) {
          // console.log(
          //   `monkey ${i} test is true, throwing to monkey ${monkey.throwToTrue}`
          // );
          this.monkeys[monkey.throwToTrue].items.push(item);
        } else {
          // console.log(
          //   `monkey ${i} test is false, throwing to monkey ${monkey.throwToFalse}`
          // );
          this.monkeys[monkey.throwToFalse].items.push(item);
        }
        this.inspections[i]++;
      }
    }
    PrintMonkeys(this.monkeys);
  }
  monkeyBusiness(): number {
    // console.log(JSON.stringify(this.inspections, null, 2));
    let sortedDescendingInspections: number[] = Object.values(
      this.inspections
    ).sort((a, b) => b - a);
    return sortedDescendingInspections[0] * sortedDescendingInspections[1];
  }
}

// NewMonkey is a class that has items, an operation, a test, and a map from true/false to the monkey number to throw to.
class NewMonkey {
  items: Item[];
  operation: NewOperation;
  test: number; // the modulo
  throwToTrue: number;
  throwToFalse: number;
  constructor(
    items: Item[],
    operation: NewOperation,
    test: number,
    throwToTrue: number,
    throwToFalse: number
  ) {
    this.items = items;
    this.test = test;
    this.operation = operation;
    this.throwToTrue = throwToTrue;
    this.throwToFalse = throwToFalse;
  }
}

// PrintNewMonkeys prints out the items held by each monkey.
function PrintNewMonkeys(monkeys: NewMonkey[]): void {
  // print out the items held by each monkey, starting with monkey 0, and going to the next monkey
  let str = "";
  for (let i = 0; monkeys[i]; i++) {
    str += `Monkey ${i}: ${monkeys[i].items
      .map((item) => item.value)
      .join(", ")}\n`;
  }
  console.log(str);
}

// PrintMonkeys prints out the items held by each monkey.
function PrintMonkeys(monkeys: Monkey[]): void {
  // print out the items held by each monkey, starting with monkey 0, and going to the next monkey
  let str = "";
  for (let i = 0; monkeys[i]; i++) {
    str += `Monkey ${i}: ${monkeys[i].items.join(", ")}\n`;
  }
  console.log(str);
}

// ParseMonkeys parses a string containing the instructions for all the monkeys and returns a map
// from monkey number to the Monkey object.
function ParseMonkeys(s: string): Monkey[] {
  let monkeys: Monkey[] = [];
  let match: RegExpExecArray | null;
  while ((match = MonkeyRegex.exec(s))) {
    const [_, monkeyNumber, items, operation, test, trueThrow, falseThrow] =
      match;
    const newMonkey = new Monkey(
      items.split(", ").map((i) => parseInt(i, 10)),
      ParseOperation(operation),
      ParseTest(test),
      parseInt(trueThrow, 10),
      parseInt(falseThrow, 10)
    );
    console.log(
      `created monkey ${monkeyNumber} with items ${items} and operation ${operation} and test ${test} and trueThrow ${trueThrow} and falseThrow ${falseThrow}`
    );
    monkeys.push(newMonkey);
  }
  return monkeys;
}

// NewMonkeyRegex is a multiline regex that matches a monkey's instructions. It extracts groups for
// the list of Starting items, the Operation, the Test, and the If true and If false instructions.
const NewMonkeyRegex = new RegExp(
  `Monkey (\\d+):
  Starting items: ([\\d, ]+)
  Operation: new = old ([+*]) (.*)
  Test: divisible by (\\d+)
    If true: throw to monkey (\\d+)
    If false: throw to monkey (\\d+)`,
  "gm"
);

// ParseNewMonkeys parses a string containing the instructions for all the monkeys and returns a map
// from monkey number to the Monkey object.
function ParseNewMonkeys(s: string, divideByThree: boolean): NewMonkey[] {
  let monkeys: NewMonkey[] = [];
  let match: RegExpExecArray | null;
  while ((match = NewMonkeyRegex.exec(s))) {
    const [
      _,
      monkeyNumber,
      items,
      operator,
      operand,
      test,
      trueThrow,
      falseThrow,
    ] = match;
    if (operator !== "+" && operator !== "*") {
      throw new Error(`Invalid operator ${operator}`);
    }
    let operandd: "old" | number;
    if (operand === "old") {
      operandd = operand;
    } else {
      operandd = parseInt(operand, 10);
    }
    const newMonkey = new NewMonkey(
      items.split(", ").map((i) => new Item(parseInt(i, 10))),
      new NewOperation(operandd, operator),
      parseInt(test, 10),
      parseInt(trueThrow, 10),
      parseInt(falseThrow, 10)
    );
    monkeys.push(newMonkey);
    console.log(
      `created monkey ${monkeyNumber} with items ${items} and operation ${operator} ${operand} and test ${test} and trueThrow ${trueThrow} and falseThrow ${falseThrow}`
    );
  }
  return monkeys;
}

// what happens if first item op is multiplication and later on it is addition
// 1st inspection is multiplication: [item * operand1]n1 =
//                                   [item]n1 * [operand1]n1
// 2nd inspection is addition:       [item * operand1 + operand2]n2 =
//                                   [item * operand1]n2 + [operand2]n2 =
//                                   [item]n2 * [operand1]n2 + [operand2]n2
// 3rd inspection is multiplication: [(item * operand1 + operand2) * operand3]n3 =
//                                    [item * operand1 + operand2]n3 * [operand3]n3 =
//                                   ([item * operand1]n3 + [operand2]n3) * [operand3]n3 =
//                                   ([item]n3 * [operand1]n3 + [operand2]n3) * [operand3]n3
//
// => each item must keep a list of operations. Operation has an operand and an operator, which is either multiplication or addition
//    to inspect an item, apply the operations recursively starting at the last operation
// edit: not recursively since that blows up the stack

let globalOperations: NewOperation[] = [];

class NewOperation {
  id: number;
  operand: number | "old";
  operator: "*" | "+";
  constructor(operand: number | "old", operator: "*" | "+") {
    this.operand = operand;
    this.operator = operator;
    this.id = globalOperations.length;
    globalOperations.push(this);
  }
}

class Item {
  value: number;
  operations: Uint8Array;
  noperations: number;
  constructor(value: number) {
    this.value = value;
    this.operations = new Uint8Array(100000);
    this.noperations = 0;
  }
  pushOperation(operationID: number): void {
    this.operations[this.noperations] = operationID;
    this.noperations++;
  }
  inspect(modulo: number): number {
    let op = globalOperations[this.operations[0]];
    let ret = 0;
    switch (op.operator) {
      case "*":
        switch (op.operand) {
          case "old":
            ret = (this.value % modulo) * (this.value % modulo);
            break;
          default:
            ret = (this.value % modulo) * (op.operand % modulo);
            break;
        }
        break;
      case "+":
        switch (op.operand) {
          case "old":
            ret = (this.value % modulo) + (this.value % modulo);
            break;
          default:
            ret = (this.value % modulo) + (op.operand % modulo);
            break;
        }
        break;
    }
    ret = ret % modulo;
    // const operandDesc = op.operand === "old" ? this.value : op.operand;
    // console.log(
    //   ` -> base case: [${this.value} ${op.operator} ${operandDesc}][${modulo}] = ${ret}`
    // );
    for (let i = 1; i < this.noperations; i++) {
      op = globalOperations[this.operations[i]];
      if (op === undefined) {
        throw new Error(`Operation ID ${this.operations[i]} not found, i=${i}`);
      }
      const old = ret;
      switch (op.operator) {
        case "*":
          switch (op.operand) {
            case "old":
              ret = old * old;
              break;
            default:
              ret = old * op.operand;
              break;
          }
          break;
        case "+":
          switch (op.operand) {
            case "old":
              ret = old + old;
              break;
            default:
              ret = old + op.operand;
              break;
          }
          break;
      }
      ret = ret % modulo;
      // const operandDesc = op.operand === "old" ? old : op.operand;
      // console.log(
      //   ` -> recursive case ${startingAtOperation}: [${old} ${op.operator} ${operandDesc}][${modulo}] = ${ret}`
      // );
    }
    return ret;
  }
}

// NewGame has an array of monkeys and has a method for performing one round of the game.
// It keeps a count of how many items each monkey has inspected.
class NewGame {
  monkeys: NewMonkey[];
  inspections: { [key: number]: number } = {};
  constructor(monkeys: NewMonkey[]) {
    this.monkeys = monkeys;
    for (let i = 0; i < monkeys.length; i++) {
      this.inspections[i] = 0;
    }
  }
  // performRound performs one round of the game.
  performRound(): void {
    for (let i = 0; i < this.monkeys.length; i++) {
      const monkey = this.monkeys[i];
      while (monkey.items.length > 0) {
        let item = monkey.items[0];
        // console.log(`monkey ${i} inspecting item ${item.value}`);
        monkey.items = monkey.items.slice(1);
        item.pushOperation(monkey.operation.id);
        const result: number = item.inspect(monkey.test);
        const throwTo = result === 0 ? monkey.throwToTrue : monkey.throwToFalse;
        // console.log(
        //   ` -> result is ${result === 0}. Throwing to monkey ${throwTo}`
        // );
        this.monkeys[throwTo].items.push(item);
        this.inspections[i]++;
      }
    }
    // PrintNewMonkeys(this.monkeys);
  }
  monkeyBusiness(): number {
    console.log(JSON.stringify(this.inspections, null, 2));
    let sortedDescendingInspections: number[] = Object.values(
      this.inspections
    ).sort((a, b) => b - a);
    return sortedDescendingInspections[0] * sortedDescendingInspections[1];
  }
}

function one(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  let file = "";
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    file += line + "\n";
  }

  const monkeys = ParseMonkeys(file);
  const game = new Game(monkeys);

  for (let round = 1; round <= 20; round++) {
    game.performRound();
  }
  return `${game.monkeyBusiness()}`;
}

async function two(inputFilename: string): Promise<string> {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  let file = "";
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    file += line + "\n";
  }

  const monkeys = ParseNewMonkeys(file, false);
  const game = new NewGame(monkeys);

  for (let round = 1; round <= 10000; round++) {
    game.performRound();
  }
  return `${game.monkeyBusiness()}`;
}

async function main() {
  if (!process.argv[2]) {
    console.error("must provide input file");
  } else if (!process.argv[3]) {
    console.error("must provide part 'one' or 'two'");
  } else if (process.argv[3] === "one") {
    console.log(one(process.argv[2]));
  } else if (process.argv[3] === "two") {
    console.log(await two(process.argv[2]));
  }
}

main();
