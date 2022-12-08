import nreadlines from "n-readlines";

const totalDiskSpace = 70000000;
const requiredFreeDiskSpace = 30000000;

// File has a path and size
class File {
  private path: string;
  private size: number;
  constructor(path: string, size: number) {
    this.path = path;
    this.size = size;
  }
  getSize() {
    return this.size;
  }
  getPath() {
    return this.path;
  }
}

type FileOrDirectory = File | Directory;

// Directory has a path and children
class Directory {
  private path: string;
  private parent: Directory | null;
  private children: FileOrDirectory[];
  constructor(path: string, parent: Directory | null = null) {
    this.path = path;
    this.parent = parent;
    this.children = [];
  }
  getPath() {
    return this.path;
  }
  addChild(child: FileOrDirectory) {
    this.children.push(child);
  }
  getChildren() {
    return this.children;
  }
  findChildDirectory(name: string): Directory | null {
    for (const child of this.children) {
      if (child instanceof Directory && child.getPath() === name) {
        return child;
      }
    }
    return null;
  }
  getParent() {
    return this.parent;
  }
}

// size returns the size of all the files contained within a directory and its subdirectories
function size(dir: Directory): number {
  let ret = 0;
  for (const child of dir.getChildren()) {
    if (child instanceof File) {
      ret += child.getSize();
    } else {
      ret += size(child);
    }
  }
  return ret;
}

function one(inputFilename: string): string {
  return run(inputFilename, (dirs: Directory[]) => {
    let ret = 0;
    for (const d of dirs) {
      if (size(d) <= 100000) {
        ret += size(d);
      }
    }
    return `${ret}`;
  });
}

function two(inputFilename: string): string {
  return run(inputFilename, (dirs: Directory[]) => {
    // sort the directories by size in ascending order
    let dirsBySizeAsc = dirs.slice();
    dirsBySizeAsc.sort((a, b) => {
      return size(a) - size(b);
    });
    let root = dirsBySizeAsc[dirsBySizeAsc.length - 1];
    let currentFreeSpace = totalDiskSpace - size(root);
    // find the first directory that, if deleted, would move currentFreeSpace up to requiredFreeDiskSpace
    let i = 0;
    for (let i = 0; i < dirsBySizeAsc.length; i++) {
      if (currentFreeSpace + size(dirsBySizeAsc[i]) >= requiredFreeDiskSpace) {
        return `${size(dirsBySizeAsc[i])}`;
      }
    }
    return `failed to find a directory that would free up enough space`;
  });
}

type DirectoryAnalyzer = (dirs: Directory[]) => string;

function run(inputFilename: string, dirAnalyzer: DirectoryAnalyzer): string {
  let root = new Directory("/");
  let cwd = root;
  let lsOutput = false;
  const input = new nreadlines(inputFilename);
  let l: Buffer | false;
  while ((l = input.next())) {
    const line: string = l.toString("ascii");
    if (line === "") {
      continue;
    }
    // flip the lsOutput flag if we see the start of an ls command
    if (line === "$ ls") {
      lsOutput = true;
      continue;
    } else if (line.startsWith("$")) {
      lsOutput = false;
    }

    // process the line
    if (line.startsWith("$ cd /")) {
      if (line !== "$ cd /") {
        throw new Error("unhandled case of cd to an absolute path");
      }
      cwd = root;
    } else if (line === "$ cd ..") {
      if (cwd.getParent() === null) {
        throw new Error("unhandled case of cd .. from root");
      }
      cwd = cwd.getParent();
    } else if (line.startsWith("$ cd ")) {
      let newd = cwd.findChildDirectory(
        cwd.getPath() + line.substring(5) + "/"
      );
      if (newd === null) {
        throw new Error("unhandled case of cd to an unknown path");
      }
      cwd = newd;
    } else if (lsOutput) {
      if (line.startsWith("dir ")) {
        let newd = new Directory(cwd.getPath() + line.substring(4) + "/", cwd);
        cwd.addChild(newd);
      } else if (line.match(/^[0-9]+/)) {
        let parts = line.split(" ");
        let newf = new File(cwd.getPath() + parts[1], parseInt(parts[0]));
        cwd.addChild(newf);
      } else {
        throw new Error("unhandled case of ls output: " + line);
      }
    }
  }

  // accumulate all the directories
  let dirs: Directory[] = [];
  let stack: Directory[] = [root];
  while (stack.length > 0) {
    let d = stack.pop();
    dirs.push(d);
    if (d === undefined) {
      throw new Error("unhandled case of stack pop");
    }
    for (const child of d.getChildren()) {
      if (child instanceof Directory) {
        stack.push(child);
      }
    }
  }
  return dirAnalyzer(dirs);
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
