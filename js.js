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


let p;
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
