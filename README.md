# js: JavaScript-powered Stream Manipulation

**`js`** is a lightweight command-line utility that allows you to process and transform `stdin` using the power and flexibility of JavaScript. Think of it as a modern, more readable alternative to tools like `awk` or `sed` for complex text manipulation.

It's built with QuickJS, compiling to a standalone binary for Linux, making it incredibly fast and portable.

---

## Why `js`?

Traditional command-line tools for text processing often rely on specialized syntaxes that can be difficult to learn and remember. `js` replaces this with familiar JavaScript, enabling you to:

* **Process standard input with ease:** Treat input as a string and manipulate it using standard JavaScript methods.
* **Leverage built-in functions:** Access `JSON.parse`, `JSON.stringify`, `print`, and QuickJS's `std` and `os` modules directly.
* **Write readable scripts:** No more wrestling with arcane regular expressions or cryptic commands. Your logic is clear JavaScript.
* **Chain commands:** Integrate `js` seamlessly into your existing shell pipelines.
* **Interact with the shell:** Easily execute external commands and access file system information.

---

## Installation

`js` is distributed as a single binary.

1. **Download the latest release:** Grab the appropriate `js` binary for your Linux system from the [releases page](https://github.com/5hubham5ingh/js-util/releases) or run:

   ```bash
   curl -L $(curl -s https://api.github.com/repos/5hubham5ingh/js-util/releases/latest | grep -Po '"browser_download_url": "\K[^"]+' | grep js) -o js
   ```

2. **Make it executable:**

   ```bash
   chmod +x js
   ```

3. **Move it to your PATH:**

   ```bash
   sudo mv js /usr/local/bin/
   ```

Now, `js` should be available globally in your terminal.

---

## Usage

`js` executes JavaScript expressions passed as command-line arguments.

```bash
js [flags] "YOUR_JAVASCRIPT_EXPRESSION"
```

### Flags

* `-p`: **Print result.** Enables the `p` global function (an alias for `print`) and ensures the result of your evaluated expression is printed to stdout.
  **This flag is generally required to see the output.**

* `-r`: **Read stdin.** Reads the entire standard input into the global `sin` variable as a string.

---

### Examples

* **Print a simple calculation:**

  ```bash
  js -p "10 * 5"  # Output: 50
  ```

* **Count lines from a file:**

  ```bash
  cat my_file.txt | js -p -r "sin.split('\n').length - 1"
  ```

* **Extract and transform JSON:**

  Suppose `input.json` contains:

  ```json
  {"name": "Alice", "age": 30}
  ```

  Run:

  ```bash
  cat input.json | js -p -r "const data = parse(sin); `Name: ${data.name}, Age: ${data.age}`"
  ```

  Output:

  ```
  Name: Alice, Age: 30
  ```

* **Filter lines and print using `p`:**

  ```bash
  cat access.log | js -r "sin.split('\n').filter(line => line.includes('ERROR')).forEach(line => p(line))"
  ```

* **List `.js` files in current directory:**

  ```bash
  js -p "ls.filter(f => f.endsWith('.js'))"
  ```

* **Execute a shell command and print output:**

  ```bash
  js -p "e('echo Hello from QuickJS')"
  ```

* **Navigate and get home directory:**

  ```bash
  js -p `Current: ${pwd}, Home: ${hd}`
  ```

---

## Global Variables and Functions

These are available in your JavaScript expressions:

* `sin`: (With `-r`) A string containing the full piped input.
* `print(value)`: Prints a value followed by a newline.
* `p(value)`: (With `-p`) Alias for `print()`.
* `parse(jsonString)`: Alias for `JSON.parse()`.
* `stringify(value)`: Alias for `JSON.stringify()`.
* `e(command, args...)`: Executes a shell command synchronously and returns output.
* `ea(command, args...)`: Executes asynchronously; returns a promise.
* `pwd`: Current working directory.
* `hd`: User's home directory.
* `ls`: Array of files/directories in current directory.
* `std`: QuickJS `std` module.
* `os`: QuickJS `os` module.

---

### Array Prototype Extensions

The following utility methods are added:

* `Array.prototype.for(cb)`: Alias for `forEach`.
* `Array.prototype.remove(...items)`: Removes the **first occurrence** of each item.
* `Array.prototype.removeAll(...items)`: Removes **all occurrences** of each item.

Refer to [QuickJS documentation](https://bellard.org/quickjs/quickjs.html#Standard-library) for more on `std` and `os`.

---

## How it Works

`js` processes command-line arguments to configure its behavior:

1. Iterates over `scriptArgs` (QuickJS command-line arguments).
2. Defines `p()` if `-p` flag is present.
3. Reads `stdin` into `sin` if `-r` flag is present.
4. Joins remaining args into a single JavaScript expression.
5. Executes the expression using `std.evalScript`.

If `-p` was used, the result is printed. Otherwise, output is only produced if you explicitly call `print()`.

---

## Contributing

Contributions are welcome! If you have ideas for improvements, bug reports, or want to add new features, please [open an issue](https://github.com/5hubham5ingh/js-util/issues) or submit a pull request.

