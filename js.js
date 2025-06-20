import * as std from "std"
import * as os from "os"

const expression = scriptArgs.slice(1, scriptArgs.length).join('')
globalThis.std = std
globalThis.os = os
globalThis.stdin = std.in.readAsString()
globalThis.parse = JSON.parse
globalThis.stringify = JSON.stringify

std.evalScript(expression)




