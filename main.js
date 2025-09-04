import { printf } from "../qjs-ext-lib/src/std.js"
import { isatty } from "../qjs-ext-lib/src/os.js"
import "extension.js"
const args = scriptArgs.slice(1);
const scriptPath = args[0];

const [st, err] = scriptPath ? os.stat(scriptPath) : [null, -1];

globalThis.__version = "1.16.0"

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
      const __history = [];
      Object.defineProperty(globalThis, 'clear', {
        get() { printf("\x1b[2J\x1b[H"); },
      });
      Object.defineProperty(globalThis, 'redo', {
        get() { return enquire.describe(enquire.search(__history)).eval() }
      })

      while (true) {
        printf("❯ ");
        const expression = std.in.getline();
        if (expression === null) break;
        try { print(std.evalScript(expression, { backtrace_barrier: true })) }
        catch (error) { print(error) }
        __history.unshift(expression);
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
