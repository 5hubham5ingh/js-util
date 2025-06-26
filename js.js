import * as std from "std"
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
globalThis.pwd = os.getcwd()[0]
globalThis.ls = os.readdir(pwd)[0].filter(f => f != '.' && f != '..')

Array.prototype.for = function(cb) { for (const e of this) cb(e) }

p(std.evalScript(expression)); 
