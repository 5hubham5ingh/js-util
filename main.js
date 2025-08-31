import * as std from "std"
import { exec as execAsync, execSync as exec, ProcessSync } from "../qjs-ext-lib/src/process.js"
import * as os from "os"
import { ansi } from "../justjs/ansiStyle.js"
import { printf } from "../qjs-ext-lib/src/std.js"
import { isatty } from "../qjs-ext-lib/src/os.js"
import * as enquire from "./enquire.js"
import { getTerminalSize } from "../justjs/terminal.js"
import * as render from "./render.js"
import * as draw from "./draw.js"
import * as parser from "./csvParser.js"

globalThis.std = std
globalThis.os = os
globalThis.parse = JSON.parse
globalThis.stringify = JSON.stringify
globalThis.exec = exec
globalThis.execAsync = execAsync
globalThis.read = std.loadFile
globalThis.use = function(scriptName) {
  const scriptPath = HOME.concat('/.config/js/', scriptName, ".js")
  std.loadScript(scriptPath)
}
globalThis.cd = function(dir = std.getenv("HOME")) {
  return os.chdir(dir) === 0 ? true : false
}
globalThis.eval = function(expression) {
  return std.evalScript(expression);
}
globalThis.enquire = enquire;
globalThis.render = render;
globalThis.draw = draw;

const resolvePath = (path) => {
  if (path.startsWith('/')) return path;

  if (path.startsWith('~')) return HOME + path.slice(1);

  return os.getcwd() + '/' + path;
}

globalThis.stat = function(path) {
  const resolvedPath = resolvePath(path)
  const [stats, statErr] = os.lstat(resolvedPath);
  if (statErr) return;

  return {
    isDir: (stats.mode & os.S_IFMT) === os.S_IFDIR,
    isFile: (stats.mode & os.S_IFMT) === os.S_IFREG,
    isLink: (stats.mode & os.S_IFMT) === os.S_IFLNK,
    size: stats.size,
    createdAt: new Date(stat.ctime),
    modifiedAt: new Date(stat.mtime),
  }
}

globalThis.ensureDir = (dir) => {
  if (typeof dir !== "string" || dir.trim() === "") {
    throw new TypeError("Invalid directory path provided.");
  }

  const fullPath = resolvePath(dir)

  const parts = fullPath.split('/');
  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    currentPath += (i === 0 ? '' : '/') + part;
    const statObj = stat(currentPath);

    if (statObj && statObj.isFile) throw Error(`ensureDir :: "${currentPath}" is a file.`);
    if (statObj && statObj.isDir) continue;

    os.mkdir(currentPath)
  }
};

for (const envVar of Object.keys(std.getenviron())) {
  Object.defineProperty(globalThis, envVar, {
    get: () => std.getenv(envVar),
  });
}

Object.defineProperty(globalThis, 'cwd', {
  get: () => os.getcwd()[0]
});

Object.defineProperty(globalThis, 'ls', {
  get: () => {
    const [cwd, err] = os.getcwd();
    if (err) {
      throw Error(`Failed to get cwd. Error code: ${err}`);
    }

    const [list, readErr] = os.readdir(cwd);
    let filteredList;
    if (readErr) {
      filteredList = []
    }
    else filteredList = list.filter(f => f !== '.' && f !== '..');

    return filteredList.map(item => {
      const content = new String(item);
      let statsCache = null;

      const getStats = () => {
        if (!statsCache) {
          const [stats, statErr] = os.lstat(cwd + '/' + item);
          if (statErr) {
            throw Error(`Error getting stats for "${item}": ${statErr}`);
          }
          statsCache = stats;
        }
        return statsCache;
      };

      Object.defineProperties(content, {
        isDir: {
          get: () => {
            const stats = getStats();
            return stats ? (stats.mode & os.S_IFMT) === os.S_IFDIR : false;
          },
        },
        isFile: {
          get: () => {
            const stats = getStats();
            return stats ? (stats.mode & os.S_IFMT) === os.S_IFREG : false;
          },
        },
        isLink: {
          get: () => {
            const stats = getStats();
            return stats ? (stats.mode & os.S_IFMT) === os.S_IFLNK : false;
          },
        },
        size: {
          get: () => getStats()?.size,
        },
        createdAt: {
          get: () => getStats() ? new Date(getStats().ctime) : null,
        },
        modifiedAt: {
          get: () => getStats() ? new Date(getStats().mtime) : null,
        },
      });

      return content;
    });
  }
});

let stdinCached;
Object.defineProperty(globalThis, 'stdin', {
  get: () => stdinCached ?? (stdinCached = std.in.readAsString())
})

Object.prototype.stringify = function(replacer = null, space = 2) {
  return JSON.stringify(this, replacer, space);
};

Object.prototype.pipe = function(cb) { return cb(this) }

Object.prototype.log = function() { print(this); return this }


Object.prototype.entries = function() { return Object.entries(this) };

Object.prototype.keys = function() { return Object.keys(this) }

Object.prototype.values = function() { return Object.values(this) };

Object.prototype.assign = function(entries) { return Object.assign(this, entries) }

Object.prototype.table = function(columns) { return draw.table(this, columns) }

Array.prototype.stringify = function(replacer = null, space = 2) {
  return JSON.stringify(this, replacer, space)
}

Array.prototype.for = function(cb) { for (const e of this) cb(e); return this }

Array.prototype.remove = function(...items) {
  for (const item of items) {
    const index = this.indexOf(item);
    if (index !== -1) {
      this.splice(index, 1);
    }
  }
  return this
};

Array.prototype.removeAll = function(...items) {
  for (const item of items) {
    let index;
    while ((index = this.indexOf(item)) !== -1) {
      this.splice(index, 1);
    }
  }
  return this
};

Array.prototype.toCsvText = function(delimiter = ',') { return parser.csvArrayToCsvText(this, delimiter) }

Array.prototype.toCsvArray = function() { return parser.csvJsonToCsvArray(this) }

Array.prototype.toCsvJson = function(delimiter = ',') { return parser.csvArrayToCsvJson(this, delimiter) }

Array.prototype.pipe = function(cb) {
  if (typeof cb === "function") return cb(this)
  else if (typeof cb === "string" || Array.isArray(cb)) {
    const input = this.map(e => e.toString()).join(' ')
    const ps = new ProcessSync(cb, {
      input,
    })
    ps.run()
    if (ps.success) return ps.stdout;
    throw Error(ps.stderr)
  }
}

Array.prototype.exec = function() { return exec(this) }

Array.prototype.execAsync = function() { return execAsync(this) }


String.prototype.pipe = function(cb) {
  if (typeof cb === "function") return cb(this)
  else if (typeof cb === "string" || Array.isArray(cb)) {
    const ps = new ProcessSync(cb, {
      input: this,
    })
    ps.run()
    if (ps.success) return ps.stdout;
    throw Error(ps.stderr)
  }
}

String.prototype.body = function(start, end, line, word) {
  let file = this
  if (!file) return ""
  file = file.split("\n").slice(start, end)
  if (line !== undefined) {
    file = file[line]
    if (word !== undefined) {
      return file.split(/\s+/).filter(word => word)[word] || ""
    }
    return file || ""
  }
  return file?.join("\n") || ""
}

String.prototype.write = function(path, mode = "w+") {
  const file = std.open(path, mode)
  if (!file) throw Error("Failed to open file " + path);
  file.puts(this)
  file.close()
  return this
}

String.prototype.parseJson = function() {
  return JSON.parse(this)
}

String.prototype.toCsvArray = function(delimiter = ',') { return parser.csvTextToCsvArray(this, delimiter) };

String.prototype.toCsvJson = function(delimiter = ',') { return parser.csvTextToCsvJson(this, delimiter) };

String.prototype.exec = function() { return (exec(this)) }

String.prototype.execAsync = function() { return execAsync(this) }

String.prototype.log = function() { print(this); return this; }

String.prototype.lines = function() { return this.split(/\r\n|\r|\n/) };

String.prototype.words = function() { return this.split(/\s+/).filter(w => w.length) }

String.prototype.isDir = function() {
  const [stat, err] = os.stat(this)
  if (err) throw Error("Failed to read stat for " + this)
  return (stat.mode & os.S_IFMT) === os.S_IFDIR
}

String.prototype.isFile = function() {
  const [stat, err] = os.stat(this)
  if (err) throw Error("Failed to read stat for " + this)
  return (stat.mode & os.S_IFMT) === os.S_IFREG
}

String.prototype.isSymLink = function() {
  const [stat, err] = os.stat(this)
  if (err) throw Error("Failed to read stat for " + this)
  return (stat.mode & os.S_IFMT) === os.S_IFLNK
}

String.prototype.style = function(styles) {
  return ansi.format(this, styles)
}

String.prototype.stripStyle = function() {
  const ansiRegex = /[\u001b\u009b][[()#;?]*.{0,2}(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  return this.replace(ansiRegex, '')
};

String.prototype.stripEmojis = function() {
  return this.replace(/\p{Emoji}/gu, '');
}

String.prototype.border = function(...all) { return draw.border(this, ...all) }

String.prototype.stripBorder = function() { return this.replace(new RegExp('─|│|┌|┐|└|┘|━|┃|┏|┓|┗|┛|═|║|╔|╗|╚|╝|╭|╮|╰|╯| ', 'g'), ''); }

String.prototype.eval = function() { return eval(this) }

String.prototype.join = function(secondString) { return draw.join(this, secondString) }

String.prototype.stack = function(...all) { return draw.stack(this, ...all) }

String.prototype.chunks = function(size) {
  if (this.length === 0) return this;
  return this.match(new RegExp(`.{1,${size}}`, "gs"));
}

String.prototype.wrap = function(maxLength = getTerminalSize()[0], byWords = true) {
  if (byWords) {
    let line = ''
    const lines = []
    for (const word of this.words()) {
      const next = (line ? line + ' ' + word : word)

      if (next.stripStyle().length <= maxLength) {
        line = next
      } else {
        if (line) lines.push(line)
        line = word
      }
    }
    if (line) lines.push(line)
    return lines.join('\n')
  }
  return this.chunks(maxLength).join('\n')
}

Number.prototype.pipe = function(cb) {
  if (typeof cb === "function") return cb(this)
  else if (typeof cb === "string" || Array.isArray(cb)) {
    const ps = new ProcessSync(cb, {
      input: this.toString(),
    })
    ps.run()
    if (ps.success) return ps.stdout;
    throw Error(ps.stderr)
  }
}

Number.prototype.log = function() { print(this); return this }


const args = scriptArgs.slice(1);
const scriptPath = args[0];

const [st, err] = scriptPath ? os.stat(scriptPath) : [null, -1];

try {
  if (!err && (st.mode & os.S_IFMT) === os.S_IFREG) {
    const file = std.open(scriptPath, 'r');
    if (!file) throw new Error(`Could not open file: ${scriptPath}`);
    const fileContent = file.readAsString();
    file.close();
    std.evalScript(fileContent);

  } else if (args.length === 0) {
    if (!isatty()) {
      const expression = std.in.readAsString();
      std.evalScript(expression, { backtrace_barrier: true });
    } else {
      globalThis.history = [];
      Object.defineProperty(globalThis, 'clear', {
        get() { printf("\x1b[2J\x1b[H"); },
      });

      while (true) {
        printf("❯ ");
        const expression = std.in.getline();
        if (expression === null) break;
        history.push(expression);
        try { std.evalScript(expression, { backtrace_barrier: true }) }
        catch (error) { print(error) }
      }
    }
  } else {
    const expression = args.join(' ');
    std.evalScript(expression, { backtrace_barrier: true });
  }
} catch (error) {
  std.err.puts(
    `${error.constructor.name}: ${error.message}\n${error.stack}`,
  );
}
