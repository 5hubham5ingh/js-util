import * as std from "std"
import { exec as execAsync, execSync as exec } from "../qjs-ext-lib/src/process.js"
import * as os from "os"

let p;
let scriptArgsToUse;

if (scriptArgs[1] === "-p") {
  p = (...all) => print(...all);
  scriptArgsToUse = scriptArgs.slice(2, scriptArgs.length);
} else {
  p = () => { };
  scriptArgsToUse = scriptArgs.slice(1, scriptArgs.length);
}

const expression = scriptArgsToUse.join('');

globalThis.std = std
globalThis.os = os
globalThis.stdin = std.in.readAsString()
globalThis.parse = JSON.parse
globalThis.stringify = JSON.stringify

Object.defineProperty(globalThis, 'pwd', {
  get: () => os.getcwd()[0]
});

Object.defineProperty(globalThis, 'hd', {
  get: () => std.getenv("HOME")
});

Object.defineProperty(globalThis, 'ls', {
  get: () => os.readdir(globalThis.pwd)[0].filter(f => f != '.' && f != '..')
});

globalThis.e = exec
globalThis.ea = execAsync

Array.prototype.for = function(cb) { for (const e of this) cb(e) }

p(std.evalScript(expression)); 
