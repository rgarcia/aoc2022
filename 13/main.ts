import nreadlines from "n-readlines";

type Value = number | Value[];
type Packet = Value[];
type PacketPair = [Packet, Packet];

// ValueToString is a helper function for debugging
function ValueToString(v: Value): string {
  if (typeof v === "number") {
    return v.toString();
  }
  return `[${v.map(ValueToString).join(",")}]`;
}

/*
When comparing two values, the first value is called left and the second value is called right. Then:

If both values are integers, the lower integer should come first.
If the left integer is lower than the right integer, the inputs are in the right order.
If the left integer is higher than the right integer, the inputs are not in the right order.
Otherwise, the inputs are the same integer; continue checking the next part of the input.

If both values are lists, compare the first value of each list, then the second value, and so on.
If the left list runs out of items first, the inputs are in the right order.
If the right list runs out of items first, the inputs are not in the right order.
If the lists are the same length and no comparison makes a decision about the order, continue checking the next part of the input.

If exactly one value is an integer, convert the integer to a list which contains that integer as its only value, then retry the comparison.
For example, if comparing [0,0,0] and 2, convert the right value to [2] (a list containing 2);
the result is then found by instead comparing [0,0,0] and [2].

*/
enum Decision {
  RightOrder = 1,
  WrongOrder,
  NoDecision,
}
function DecisionToString(d: Decision): string {
  switch (d) {
    case Decision.RightOrder:
      return "right order";
    case Decision.WrongOrder:
      return "wrong order";
    case Decision.NoDecision:
      return "no decision";
    default:
      return "unknown";
  }
}
function compare(left: Value, right: Value, depth: number): Decision {
  const indent: string = "  ".repeat(depth);
  let debug =
    indent + `- Compare ${ValueToString(left)} vs ${ValueToString(right)}`;
  const r = function (reason: string, ret: Decision): Decision {
    switch (ret) {
      case Decision.RightOrder:
        debug += `\n${indent}  - ${reason}, so inputs are in the RIGHT order`;
        console.log(debug);
        return ret;
      case Decision.WrongOrder:
        debug += `\n${indent}  - ${reason}, so inputs are in the NOT in the right order`;
        console.log(debug);
        return ret;
      case Decision.NoDecision:
        console.log(debug);
        return ret;
    }
  };
  if (typeof left === "number" && typeof right === "number") {
    if (left < right) {
      return r("Left side is smaller", Decision.RightOrder);
    } else if (left > right) {
      return r("Right side is smaller", Decision.WrongOrder);
    } else {
      return r("", Decision.NoDecision);
    }
  } else if (Array.isArray(left) && Array.isArray(right)) {
    console.log(debug);
    for (let i = 0; i < left.length; i++) {
      if (i >= right.length) {
        console.log(
          `${indent}  - Right side ran out of items, so inputs are NOT in the right order`
        );
        return Decision.WrongOrder;
      }
      const cmp = compare(left[i], right[i], depth + 1);
      if (cmp === Decision.NoDecision) {
        continue;
      } else {
        return cmp;
      }
    }
    if (left.length < right.length) {
      console.log(
        `${indent}  - Left side ran out of items, so inputs are in the right order`
      );
      return Decision.RightOrder;
    }
    // lists are the same length and we haven't made any decision
    return Decision.NoDecision;
  } else if (typeof left === "number") {
    console.log(
      `${debug}\n${indent}  - Mixed types; convert left to [${left}] and retry comparison`
    );
    return compare([left], right, depth + 1);
  } else if (typeof right === "number") {
    console.log(
      `${debug}\n${indent}  - Mixed types; convert right to [${right}] and retry comparison`
    );
    return compare(left, [right], depth + 1);
  }
  throw new Error("unreachable");
}

function one(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  let packetPairs: PacketPair[] = [];
  let prevPacket: Packet | null = null;
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    const packet: Packet = JSON.parse(line);
    if (prevPacket) {
      const pp: PacketPair = [prevPacket, packet];
      packetPairs.push(pp);
      prevPacket = null;
    } else {
      prevPacket = packet;
    }
  }

  let rightOrderIndices: number[] = [];
  for (let i = 1; i <= packetPairs.length; i++) {
    const packetPair = packetPairs[i - 1];
    console.log(`== Pair ${i} ==`);
    const decision = compare(packetPair[0], packetPair[1], 0);
    if (decision === Decision.RightOrder) {
      rightOrderIndices.push(i);
    }
    console.log("");
  }

  console.log(rightOrderIndices);
  // add all the right order indices together
  return rightOrderIndices.reduce((acc, cur) => acc + cur, 0).toString();
}

function two(inputFilename: string): string {
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  let packets: Packet[] = [];
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    const packet: Packet = JSON.parse(line);
    packets.push(packet);
  }

  // add the divider packets
  let dividerPackets: Packet[] = [[[2]], [[6]]];
  packets.push(...dividerPackets);

  // sort the packets using compare
  packets.sort((a, b) => {
    const decision = compare(a, b, 0);
    switch (decision) {
      case Decision.RightOrder:
        return -1;
      case Decision.WrongOrder:
        return 1;
      case Decision.NoDecision:
        return 0;
    }
  });

  // multiply the indices of the divider packets together
  let dividerIndices: number[] = [];
  for (let i = 0; i < packets.length; i++) {
    if (dividerPackets.includes(packets[i])) {
      dividerIndices.push(i + 1);
    }
  }
  return dividerIndices.reduce((acc, cur) => acc * cur, 1).toString();
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
