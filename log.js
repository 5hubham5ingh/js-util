import { cursorShow } from "../justjs/cursor.js"

function makeLogger(label, color, postPrint = () => { }) {
  return (...args) => {
    const symbol = ` ${label}`.style(['bold', '#000000', `bg-${color}`]) + '◗'.style(color)
    print([symbol, ...args.map(arg => arg.style(color))].join(' ').border("rounded", color))
    postPrint()
  }
}

export const warn = makeLogger("WARN", "#fce74b")
export const info = makeLogger("INFO", "#C6EFCE")
export const error = makeLogger("ERROR", "#FFA07A")
export const fatal = makeLogger("FATAL", "#c91d1a", () => {
  print(cursorShow)
  os.exec(['stty', 'sane'])
})

