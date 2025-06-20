# js: JavaScript-powered Stream Manipulation

`js` is a lightweight, command-line utility that allows you to process and transform `stdin` using the power and flexibility of JavaScript. Think of it as a modern, more readable alternative to tools like `awk` or `sed` for complex text manipulation.

It's built with QuickJS, compiling to a standalone binary for Linux, making it incredibly fast and portable.

## Why `js`?

Traditional command-line tools for text processing often rely on specialized syntaxes that can be difficult to learn and remember. `js` replaces this with familiar JavaScript, enabling you to:

  * **Process `stdin` with ease:** Treat input as a string and manipulate it using standard JavaScript methods.
  * **Leverage built-in functions:** Access `JSON.parse`, `JSON.stringify`, `print`, and QuickJS's `std` and `os` modules directly.
  * **Write readable scripts:** No more wrestling with arcane regular expressions or cryptic commands. Your logic is clear JavaScript.
  * **Chain commands:** Integrate `js` seamlessly into your existing shell pipelines.

## Installation

`js` is distributed as a single binary.

1.  **Download the latest release:** Grab the appropriate `js` binary for your Linux system from the [releases page](https://www.google.com/search?q=YOUR_GITHUB_RELEASES_URL_HERE).
2.  **Make it executable:**
    ```bash
    chmod +x js
    ```
3.  **Move it to your PATH:**
    ```bash
    sudo mv js /usr/local/bin/
    ```

Now, `js` should be available globally in your terminal.

## Usage

`js` executes JavaScript expressions passed as command-line arguments, with `stdin` available as the global `stdin` variable.

```bash
js "YOUR_JAVASCRIPT_EXPRESSION"
```

### Examples

  * **Count lines:**

    ```bash
    cat my_file.txt | js "print(stdin.split('\\n').length - 1)"
    ```

    (We subtract 1 to account for a potential trailing newline.)

  * **Extract and transform JSON:**
    Suppose `input.json` contains `{"name": "Alice", "age": 30}`.

    ```bash
    cat input.json | js "const data = parse(stdin); print(`Name: ${data.name}, Age: ${data.age}`);"
    ```

    Output:

    ```
    Name: Alice, Age: 30
    ```

  * **Filter lines:**

    ```bash
    cat access.log | js "stdin.split('\\n').filter(line => line.includes('ERROR')).forEach(line => print(line))"
    ```

### Global Variables and Functions

The following are available in your JavaScript expressions:

  * `stdin`: A string containing the entire content piped to the `js` program.
  * `print(value)`: A function to print a value to standard output, followed by a newline.
  * `parse(jsonString)`: An alias for `JSON.parse()`.
  * `stringify(value)`: An alias for `JSON.stringify()`.
  * `std`: The QuickJS `std` module, providing functions for I/O, file system operations, and more.
  * `os`: The QuickJS `os` module, providing functions for interacting with the operating system (e.g., environment variables, process management).

Refer to the [QuickJS documentation](https://www.google.com/search?q=https://bellard.org/quickjs/quickjs.html%23Standard-library) for details on `std` and `os` modules.

## How it Works

`js` takes all command-line arguments after the executable name, joins them into a single string, and then evaluates this string as a JavaScript expression using QuickJS's `std.evalScript()`. The `stdin` content is read into a global variable before the script execution.

```javascript
import * as std from "std"
import * as os from "os"

// All arguments after the program name are joined to form the expression
const expression = scriptArgs.slice(1, scriptArgs.length).join('')

// Make std and os globally accessible for convenience
globalThis.std = std
globalThis.os = os

// Read stdin once and make it globally available
globalThis.stdin = std.in.readAsString()

// Provide aliases for common JSON functions
globalThis.parse = JSON.parse
globalThis.stringify = JSON.stringify

// Evaluate the user's JavaScript expression and print its result
print(std.evalScript(expression))
```

## Contributing

Contributions are welcome\! If you have ideas for improvements, bug reports, or want to add new features, please open an issue or submit a pull request.

