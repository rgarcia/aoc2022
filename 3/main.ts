import nreadlines from "n-readlines";

// itemPriority assigns priority to an item type.
// Lowercase items a through z have priorities 1 through 26.
// Uppercase item types A through Z have priorities 27 through 52.
function itemPriority(item: string): number {
  const code = item.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return code - 38;
  } else if (code >= 97 && code <= 122) {
    return code - 96;
  }
}

// commonChar returns the first character that is common to both strings
// or empty string if there is no common character
function commonChar(s1: string, s2: string): string {
  for (let i = 0; i < s1.length; i++) {
    if (s2.indexOf(s1[i]) !== -1) {
      return s1[i];
    }
  }
  return "";
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
    const items = line.split("");
    const half = Math.floor(items.length / 2);
    const left = items.slice(0, half);
    const right = items.slice(half);
    const common = commonChar(left.join(""), right.join(""));
    total += common === "" ? 0 : itemPriority(common);
  }
  return total;
}

function two(inputFilename: string): number {
  const input = new nreadlines(inputFilename);
  let total = 0;
  let l;
  let group: [string, string, string] = ["", "", ""];
  const processGroup = function (s1: string, s2: string, s3: string) {
    for (let i = 0; i < s1.length; i++) {
      const c = s1[i];
      if (s2.indexOf(c) !== -1 && s3.indexOf(c) !== -1) {
        total += itemPriority(c);
        break;
      }
    }
  };
  while ((l = input.next())) {
    const line: string = l.toString("ascii").trim();
    if (line === "") {
      continue;
    }
    // add the line to the group wherever the first empty string is
    let i = 0;
    for (; i < 3 && group[i] != ""; i++) {}
    group[i] = line;
    if (i == 2) {
      processGroup(group[0], group[1], group[2]);
      group = ["", "", ""];
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
