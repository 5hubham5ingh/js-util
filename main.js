import * as std from "std"
import { exec as execAsync, execSync as exec } from "../qjs-ext-lib/src/process.js"
import * as os from "os"

globalThis.std = std
globalThis.os = os
globalThis.parse = JSON.parse
globalThis.stringify = JSON.stringify
globalThis.exec = exec
globalThis.execAsync = execAsync
globalThis.read = std.loadFile

for (const envVar of ['HOME', 'PATH', 'USER', 'LOGNAME', 'SHELL', 'PWD', 'OLDPWD', 'TERM', 'LANG', 'LC_ALL', 'LC_CTYPE', 'LC_COLLATE', 'LC_MESSAGES', 'LC_MONETARY', 'LC_NUMERIC', 'LC_TIME', 'MAIL', 'MAILPATH', 'TZ', 'HISTFILE', 'HISTSIZE', 'PS1', 'PS2', 'LINES', 'COLUMNS']) {
  Object.defineProperty(globalThis, envVar, {
    get: () => std.getenv(envVar),
  });
}

Object.defineProperty(globalThis, 'pwd', {
  get: () => os.getcwd()[0]
});

Object.defineProperty(globalThis, 'ls', {
  get: () => os.readdir(os.getcwd()[0])[0].filter(f => f != '.' && f != '..')
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

Object.prototype.cd = function(dir = std.getenv("HOME")) {
  return os.chdir(dir) === 0 ? true : false
}

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

Array.prototype.toCsvString = function(delimiter = ',') {
  if (this.length === 0) {
    return "";
  }

  let dataAsArrayOfArrays;
  const firstElement = this[0];

  if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
    const headers = Object.keys(firstElement);
    const dataRows = this.map(obj => headers.map(header => obj[header]));
    dataAsArrayOfArrays = [headers, ...dataRows];
  } else {
    dataAsArrayOfArrays = this.map(item => Array.isArray(item) ? item : [item]);
  }

  return dataAsArrayOfArrays.map(row =>
    row.map(cell => {
      const str = (cell === null || cell === undefined) ? '' : String(cell);

      const needsQuotes = str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r');

      if (!needsQuotes) {
        return str;
      }

      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(delimiter)
  ).join('\n');
};

Array.prototype.toCsvArray = function() {
  if (this.length === 0) {
    return [];
  }

  const firstElement = this[0];

  if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
    const headerSet = new Set();
    this.forEach(obj => {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => headerSet.add(key));
      }
    });

    const headers = Array.from(headerSet).sort();

    const dataRows = this.map(obj => {
      if (typeof obj !== 'object' || obj === null) {
        return new Array(headers.length).fill(undefined);
      }
      return headers.map(header => obj[header]);
    });

    return [headers, ...dataRows];
  }

  if (Array.isArray(firstElement)) {
    return this;
  }

  return this.map(item => [item]);
};

Array.prototype.toCsvJson = function(delimiter = ',') {
  return this.toCsvString(delimiter).toCsvJson(delimiter)
}

Array.prototype.pipe = function(cb) { return cb(this) }

Array.prototype.exec = function() { return exec(this) }

Array.prototype.execAsync = function() { return execAsync(this) }


String.prototype.pipe = function(cb) { return cb(this) }

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

String.prototype.toCsvArray = function(delimiter = ',') {
  const rows = this.trim().split(/\r?\n/);
  return rows.map(row => {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current);
    return cells;
  });
};

String.prototype.toCsvJson = function(delimiter = ',') {
  const rows = this.toCsvArray(delimiter);
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((key, i) => {
      obj[key] = row[i] ?? '';
    });
    return obj;
  });
};

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

Number.prototype.pipe = function(cb) { return cb(this) }

Number.prototype.log = function() { print(this); return this }



const expression = scriptArgs.slice(1, scriptArgs.length).join('');
std.evalScript(expression)
