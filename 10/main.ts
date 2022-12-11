import nreadlines from "n-readlines";

// InstructionLengths has a map of instruction name to the number of clock cycles it takes to complete
const InstructionLengths: Map<string, number> = new Map([
  ["addx", 2],
  ["noop", 1],
]);

// Instruction has a name, a list of parameters, and the number of clock cycles it takes to complete
class Instruction {
  name: string;
  parameters: string[];
  cycles: number;
  constructor(name: string, parameters: string[]) {
    this.name = name;
    this.parameters = parameters;
    const length = InstructionLengths.get(name);
    if (length) {
      this.cycles = length;
    } else {
      throw new Error("unknown command: " + name);
    }
  }
  toString() {
    return `${this.name} ${this.parameters.join(" ")}`;
  }
}

// InstructionsMapToString converts to a string a map of clock cycle to a list of instructions
function InstructionsMapToString(
  imap: Map<number, Instruction[]> = new Map<number, Instruction[]>()
): string {
  let result = "";
  imap.forEach((instructions, clock) => {
    result += `${clock}: ${instructions.map((i) => i.toString()).join(", ")}`;
  });
  return result;
}

// CPU has a clock that increments every cycle. It keeps a map of clock cycle to a list of instructions, where the clock cycle is the clock cycle that the instruction will complete on.
// It also keeps a map of register name to value.
class CPU {
  clock: number = 1;
  instructions: Map<number, Instruction[]> = new Map();
  registers: Map<string, number> = new Map();
  constructor(initialRegisters: Map<string, number>) {
    this.registers = initialRegisters;
  }
  // addInstruction adds an instruction to the CPU's instructions map
  addInstruction(instruction: Instruction) {
    const instructions = this.instructions.get(
      this.clock + instruction.cycles - 1
    );
    if (instructions) {
      instructions.push(instruction);
    } else {
      this.instructions.set(this.clock + instruction.cycles - 1, [instruction]);
    }
    // console.log(
    //   `addInstruction ${instruction.name} ${
    //     instruction.parameters
    //   }: ${InstructionsMapToString(this.instructions)}`
    // );
  }
  // run runs the CPU until it has no more instructions to run
  run(cb = (clock: number, registers: Map<string, number>) => {}) {
    while (this.instructions.size > 0) {
      this.tick(cb);
    }
  }
  // tick runs the CPU for one clock cycle
  tick(cb: (clock: number, registers: Map<string, number>) => void) {
    const instructions = this.instructions.get(this.clock);
    if (instructions) {
      for (const instruction of instructions) {
        switch (instruction.name) {
          case "addx":
            this.registers.set(
              "x",
              this.registers.get("x") + parseInt(instruction.parameters[0])
            );
            // console.log(
            //   `addx ${instruction.parameters[0]}, x = ${this.registers.get(
            //     "x"
            //   )}`
            // );
            break;
          case "noop":
            //console.log(`noop`);
            break;
        }
        this.instructions.delete(this.clock);
      }
    }
    this.clock++;
    cb(this.clock, this.registers);
  }
}

// CRT is 40 pixels wide and 6 pixels tall. Each pixel is stored as a string.
// It has a draw method that takes in the pixel position (0 through 239) and the sprite position (an integer).
// It has a toString method that prints out the CRT.
class CRT {
  pixels: string[] = [];
  constructor() {
    for (let i = 0; i < 240; i++) {
      this.pixels.push("");
    }
  }
  draw(clock: number, sprite: number) {
    if (clock > 40) {
      console.log(
        `draw called with clock ${clock} and sprite positiion ${sprite}`
      );
    }
    const pixelPosition = clock - 1;
    if (pixelPosition < 0 || pixelPosition >= 240) {
      return;
    }
    if (pixelPosition % 40 >= sprite - 1 && pixelPosition % 40 <= sprite + 1) {
      this.pixels[pixelPosition] = "#";
    } else {
      this.pixels[pixelPosition] = ".";
    }
    console.log(`CRT after clock cycle ${clock}:\n${this.toString()}`);
  }
  toString() {
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += this.pixels.slice(i * 40, (i + 1) * 40).join("") + "\n";
    }
    return result;
  }
}

function one(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  let signalStrengthSum = 0;
  const cpu = new CPU(new Map([["x", 1]]));
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    const parts = line.split(" ");
    const name = parts[0];
    const parameters = parts.slice(1);
    const instruction = new Instruction(name, parameters);
    cpu.addInstruction(instruction);
    cpu.run((clock, registers) => {
      if ((clock + 20) % 40 === 0 && clock > 0 && clock < 240) {
        const signalStrength = clock * registers.get("x");
        console.log(`CLOCK ${clock}, signal strength ${signalStrength}`);
        signalStrengthSum += signalStrength;
      }
    });
  }
  return `${signalStrengthSum}`;
}

type InputSolver = () => string;

function two(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  const cpu = new CPU(new Map([["x", 1]]));
  const crt = new CRT();
  crt.draw(1, cpu.registers.get("x"));
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    const parts = line.split(" ");
    const name = parts[0];
    const parameters = parts.slice(1);
    const instruction = new Instruction(name, parameters);
    cpu.addInstruction(instruction);
    cpu.run((clock, registers) => {
      crt.draw(clock, registers.get("x"));
    });
  }
  return crt.toString();
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
