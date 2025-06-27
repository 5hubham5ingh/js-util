import * as std from "std"
import { exec as execAsync, execSync as exec } from "../qjs-ext-lib/src/process.js"
import * as os from "os"

globalThis.std = std
globalThis.os = os
globalThis.parse = JSON.parse
globalThis.stringify = JSON.stringify
globalThis.e = exec
globalThis.ea = execAsync
globalThis.read = std.loadFile

let pwdCached;
Object.defineProperty(globalThis, 'pwd', {
  get: () => pwdCached ?? (pwdCached = os.getcwd()[0])
});

let hdCached;
Object.defineProperty(globalThis, 'hd', {
  get: () => hdCached ?? (hdCached = std.getenv("HOME"))
});

let lsCached;
Object.defineProperty(globalThis, 'ls', {
  get: () => lsCached ?? (lsCached = os.readdir(globalThis.pwd)[0].filter(f => f != '.' && f != '..'))
});

Object.prototype.stringify = function(replacer = null, space = 2) {
  return JSON.stringify(this, replacer, space);
};

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

Array.prototype.toCsvString = function(delimiter = ',') {
  return this.map(row =>
    row.map(cell => {
      const str = String(cell);
      const needsQuotes = str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r');
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    }).join(delimiter)
  ).join('\n');
};

Array.prototype.toCsvJson = function(delimiter = ',') {
  return this.toCsvString(delimiter).toCsvJson(delimiter)
}

let p = () => { };
const scriptArgsToUse = [];

for (const arg of scriptArgs) {
  switch (arg) {
    case "-p":
      p = (...all) => print(...all);
      break;
    case "-r":
      globalThis.sin = std.in.readAsString()
      break;
    default:
      scriptArgsToUse.push(arg);
  }
}


const expression = scriptArgsToUse.slice(1, scriptArgsToUse.length).join('');
p(std.evalScript(expression)); 
