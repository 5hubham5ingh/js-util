````markdown
# js: JavaScript-powered Stream Manipulation

`js` is a lightweight, command-line utility that allows you to process and transform `stdin` using the power and flexibility of JavaScript. Think of it as a modern, more readable alternative to tools like `awk` or `sed` for complex text manipulation.

It's built with QuickJS, compiling to a standalone binary for Linux, making it incredibly fast and portable.


## Why `js`?

Traditional command-line tools for text processing often rely on specialized syntaxes that can be difficult to learn and remember. `js` replaces this with familiar JavaScript, enabling you to:

  * **Process standard input with ease:** Treat input as a string and manipulate it using standard JavaScript methods.
  * **Leverage built-in functions:** Access `JSON.parse`, `JSON.stringify`, `print`, and QuickJS's `std` and `os` modules directly.
  * **Write readable scripts:** No more wrestling with arcane regular expressions or cryptic commands. Your logic is clear JavaScript.
  * **Chain commands:** Integrate `js` seamlessly into your existing shell pipelines.
  * **Interact with the shell:** Easily execute external commands and access file system information.


## Installation

`js` is distributed as a single binary.

1.  **Download the latest release:** Grab the appropriate `js` binary for your Linux system from the [releases page](https://github.com/5hubham5ingh/js-util/releases) or run
```bash
curl -L $(curl -s [https://api.github.com/repos/5hubham5ingh/js-util/releases/latest](https://api.github.com/repos/5hubham5ingh/js-util/releases/latest) | grep -Po '"browser_download_url": "\K[^"]+' | grep js) -o js
````

3.  **Make it executable:**
    ` bash     chmod +x js      `
4.  **Move it to your PATH:**
    ` bash     sudo mv js /usr/local/bin/      `

Now, `js` should be available globally in your terminal.


## Usage

`js` executes JavaScript expressions passed as command-line arguments.

```bash
js [flags] "YOUR_JAVASCRIPT_EXPRESSION"
```

### Flags

  * `-p`: **Print result.** This flag enables the `p` global function (an alias for `print`) and ensures the result of your evaluated expression is printed to standard output. **This flag is generally required to see the output of your script.**
  * `-r`: **Read stdin.** This flag reads the entire content of standard input into the global `sin` variable as a string.

### Examples

  \* **Print a simple calculation:**

    ` bash     js -p "10 * 5"     # Output: 50      `

  \* **Count lines from a file:**

    ` bash     cat my_file.txt | js -p -r "sin.split('\\n').length - 1"     # Output: (number of lines, accounting for potential trailing newline)      `

  \* **Extract and transform JSON:**
    Suppose `input.json` contains `{"name": "Alice", "age": 30}`.

    `` bash     cat input.json | js -p -r "const data = parse(sin); `Name: ${data.name}, Age: ${data.age}`;"      ``

    Output:

    `    Name: Alice, Age: 30    `

  \* **Filter lines and print using `p`:**

    ` bash     cat access.log | js -r "sin.split('\\n').filter(line => line.includes('ERROR')).forEach(line => p(line))"      `

  \* **List files in current directory and filter:**

    ` bash     js -p "ls.filter(f => f.endsWith('.js'))"     # Output: ["my_script.js", "another_file.js"] (example)      `

  \* **Execute a shell command and print output:**

    ` bash     js -p "e('echo Hello from QuickJS')"     # Output: Hello from QuickJS      `

  \* **Navigate and get home directory:**

    `` bash     js -p "`Current: ${pwd}, Home: ${hd}`"     # Output: Current: /path/to/current, Home: /home/user (example)      ``


## Global Variables and Functions

The following are available in your JavaScript expressions:

  \* `sin`: (Available with `-r` flag) A string containing the entire content piped to the `js` program.
  \* `print(value)`: A function to print a value to standard output, followed by a newline.
  \* `p(value)`: (Available with `-p` flag) An alias for `print()`.
  \* `parse(jsonString)`: An alias for `JSON.parse()`.
  \* `stringify(value)`: An alias for `JSON.stringify()`.
  \* `e(command, args...)`: Executes a shell command synchronously and returns its output. This is an alias for `execSync` from `qjs-ext-lib`.
  \* `ea(command, args...)`: Executes a shell command asynchronously and returns a promise. This is an alias for `exec` from `qjs-ext-lib`.
  \* `pwd`: A getter that returns the current working directory as a string.
  \* `hd`: A getter that returns the user's home directory as a string.
  \* `ls`: A getter that returns an `Array` containing the names of files and directories in the current working directory (excluding `.` and `..`).
  \* `std`: The QuickJS `std` module, providing functions for I/O, file system operations, and more.
  \* `os`: The QuickJS `os` module, providing functions for interacting with the operating system (e.g., environment variables, process management).

### Array Prototypes Extensions

The following utility methods are added to `Array.prototype`:

  \* `Array.prototype.for(cb)`: An alias for `forEach`, allowing you to use `array.for(item => ...)`
  \* `Array.prototype.remove(...items)`: Removes the **first occurrence** of specified items from the array.
  \* `Array.prototype.removeAll(...items)`: Removes **all occurrences** of specified items from the array.

Refer to the [QuickJS documentation](https://www.google.com/search?q=https://bellard.org/quickjs/quickjs.html%23Standard-library) for details on `std` and `os` modules.


## How it Works

`js` processes command-line arguments to set up its environment:

1.  It iterates through `scriptArgs` (QuickJS's array of command-line arguments).
2.  If `-p` is encountered, a global `p` function is defined as an alias for `print`.
3.  If `-r` is encountered, the content of standard input is read into the global `sin` variable.
4.  All remaining arguments are joined to form a single JavaScript `expression`.
5.  Finally, `std.evalScript(expression)` executes the user's code. If the `-p` flag was used, the result of this evaluation is printed via the `p` function; otherwise, no output from the expression itself is produced by `js` unless you explicitly call `print()` or `p()` within your script.

## Contributing

Contributions are welcome\! If you have ideas for improvements, bug reports, or want to add new features, please open an issue or submit a pull request.

```
```
