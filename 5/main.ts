import nreadlines from "n-readlines";

// Stack is a simple stack implementation
class Stack<T> {
  private data: T[] = [];
  push(item: T): void {
    this.data.push(item);
  }
  pop(): T {
    return this.data.pop();
  }
  peek(): T {
    return this.data[this.data.length - 1];
  }
  isEmpty(): boolean {
    return this.data.length === 0;
  }
  // reverse the stack. This is a special method to account for how the input is processed
  reverse(): void {
    this.data = this.data.reverse();
  }
}

function one(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  const stacks = new Array<Stack<string>>();
  let stacksFinalized: boolean = false;
  let l;
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    if (!stacksFinalized && line.startsWith(" 1")) {
      stacksFinalized = true;
      // reverse the stacks so that the top of the stack is the bottom of the input
      stacks.forEach((s) => s.reverse());
      continue;
    }
    if (!stacksFinalized) {
      const parts = line.replace(/    /g, " ").split(" ");
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].replace("[", "").replace("]", "");
        if (part === "") {
          continue;
        }
        while (stacks.length <= i) {
          stacks.push(new Stack<string>());
        }
        stacks[i].push(part);
      }
    } else {
      const parts = line
        .split(" ")
        .filter((p) => p.match(/[0-9]+/))
        .map((p) => parseInt(p, 10));
      const [from, to] = [parts[1], parts[2]];
      const fromStack = stacks[from - 1];
      const toStack = stacks[to - 1];
      for (let i = 0; i < parts[0]; i++) {
        const item = fromStack.pop();
        toStack.push(item);
      }
    }
  }
  // the final return is the combination of letters at the top of each stack
  return stacks.map((s) => s.peek()).join("");
}

function two(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  const stacks = new Array<Stack<string>>();
  let stacksFinalized: boolean = false;
  let l;
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    if (!stacksFinalized && line.startsWith(" 1")) {
      stacksFinalized = true;
      // reverse the stacks so that the top of the stack is the bottom of the input
      stacks.forEach((s) => s.reverse());
      continue;
    }
    if (!stacksFinalized) {
      const parts = line.replace(/    /g, " ").split(" ");
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].replace("[", "").replace("]", "");
        if (part === "") {
          continue;
        }
        while (stacks.length <= i) {
          stacks.push(new Stack<string>());
        }
        stacks[i].push(part);
      }
    } else {
      const parts = line
        .split(" ")
        .filter((p) => p.match(/[0-9]+/))
        .map((p) => parseInt(p, 10));
      const [from, to] = [parts[1], parts[2]];
      const fromStack = stacks[from - 1];
      const toStack = stacks[to - 1];
      let items = [];
      for (let i = 0; i < parts[0]; i++) {
        const item = fromStack.pop();
        items.push(item);
      }
      items = items.reverse();
      for (let i = 0; i < items.length; i++) {
        toStack.push(items[i]);
      }
    }
  }
  // the final return is the combination of letters at the top of each stack
  return stacks.map((s) => s.peek()).join("");
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
