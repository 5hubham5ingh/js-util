import * as std from "std"
import * as os from "os"

const expression = scriptArgs.slice(1, scriptArgs.length).join('')
globalThis.std = std
globalThis.os = os
globalThis.stdin = std.in.readAsString()
globalThis.parse = JSON.parse
globalThis.stringify = JSON.stringify
globalThis.pwd = os.getcwd()[0]
globalThis.ls = os.readdir(pwd)[0].filter(f => f != '.' && f != '..')

Array.prototype.for = function(cb) { for (const e of this) cb(e) }
std.evalScript(expression)




