import * as std from "std"
import { exec as execAsync, execSync as exec, ProcessSync } from "../qjs-ext-lib/src/process.js"
import * as os from "os"
import { ansi } from "../justjs/ansiStyle.js"
import * as enquire from "./enquire.js"
import { getTerminalSize } from "../justjs/terminal.js"
import * as render from "./render.js"
import * as draw from "./draw.js"
import * as csvParser from "./csvParser.js"
import * as iniParser from "./iniParser.js"
import * as tomlParser from "./tomlParser.js"

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
globalThis.parser = { ...csvParser, ...iniParser, ...tomlParser }

const resolvePath = (path) => {
  if (path.startsWith('/')) return path;

  if (path.startsWith('~')) return HOME + path.slice(1);

  return os.getcwd()[0] + '/' + path;
}

globalThis.stat = function(path) {
  const resolvedPath = resolvePath(path)
  const [stats, statErr] = os.stat(resolvedPath);
  if (statErr) throw Error(`Failed to read stat for "${resolvedPath}".\nError code: ${statErr}`);

  const bytes = stats.size;
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  return {
    isDir: (stats.mode & os.S_IFMT) === os.S_IFDIR,
    isFile: (stats.mode & os.S_IFMT) === os.S_IFREG,
    isLink: (stats.mode & os.S_IFMT) === os.S_IFLNK,
    size: {
      bytes: bytes,
      kb: parseFloat(kb.toFixed(2)),
      mb: parseFloat(mb.toFixed(2)),
      gb: parseFloat(gb.toFixed(2))
    },
    createdAt: new Date(stats.ctime),
    modifiedAt: new Date(stats.mtime),
  };
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
    try {
      const statObj = stat(currentPath);
      if (statObj && statObj.isFile) throw Error(`ensureDir :: "${currentPath}" is a file.`);
      if (statObj && statObj.isDir) continue;
    } catch (e) {
      os.mkdir(currentPath)
    }

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

    return filteredList
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

Object.prototype.toIni = function() { return iniParser.toIni(this) }

Object.prototype.toToml = function() { return tomlParser.toToml(this) }


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

Array.prototype.toCsvText = function(delimiter = ',') { return csvParser.csvArrayToCsvText(this, delimiter) }

Array.prototype.toCsvArray = function() { return csvParser.csvJsonToCsvArray(this) }

Array.prototype.toCsvJson = function(delimiter = ',') { return csvParser.csvArrayToCsvJson(this, delimiter) }

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

String.prototype.toCsvArray = function(delimiter = ',') { return csvParser.csvTextToCsvArray(this, delimiter) };

String.prototype.toCsvJson = function(delimiter = ',') { return csvParser.csvTextToCsvJson(this, delimiter) };

String.prototype.parseIni = function(options) { return iniParser.parseIni(this, options) }

String.prototype.parseToml = function() { return tomlParser.parseToml(this) }

String.prototype.exec = function() { return exec(this) }

String.prototype.execAsync = function() { return execAsync(this) }

String.prototype.log = function() { print(this); return this; }

String.prototype.lines = function() { return this.split(/\r\n|\r|\n/) };

String.prototype.words = function() { return this.split(/\s+/).filter(w => w.length) }

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
  if (typeof cb === "string" || Array.isArray(cb)) {
    const ps = new ProcessSync(cb, {
      input: this.toString(),
    })
    ps.run()
    if (ps.success) return ps.stdout;
    throw Error(ps.stderr)
  }
}

Number.prototype.log = function() { print(this); return this }


