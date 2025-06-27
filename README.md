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
* `read(filePath)`: Read file as utf-8 encoded string.
* `pwd`: Current working directory.
* `hd`: User's home directory.
* `ls`: Array of files/directories in current directory.
* `std`: QuickJS `std` module.
* `os`: QuickJS `os` module.

---
## Prototype Extensions

### Array.prototype Extensions

These methods are added to the `Array` prototype to enhance data manipulation.

*   **`.for(callback)`**: A chainable alias for `forEach`. It executes the `callback` function once for each array element and returns the original array, allowing further method calls.
    *   `callback(element, index, array)`: The function to execute.
    *   **Example**: `[1, 2, 3].for(n => console.log(n)).map(n => n * 2);`

*   **`.remove(...items)`**: Mutates the array by removing the **first occurrence** of each specified item. Returns the modified array.
    *   `...items`: One or more items to remove from the array.
    *   **Example**: `['a', 'b', 'c', 'b'].remove('b', 'a'); // Returns and mutates to ['c', 'b']`

*   **`.removeAll(...items)`**: Mutates the array by removing **all occurrences** of each specified item. Returns the modified array.
    *   `...items`: One or more items to remove from the array.
    *   **Example**: `['a', 'b', 'c', 'b'].removeAll('b'); // Returns and mutates to ['a', 'c']`

*   **`.toCsvString(delimiter = ',')`**: Converts an array into a CSV-formatted string. This method intelligently handles both arrays of objects and arrays of arrays.
    *   **If the array contains objects**: It uses the keys of the first object as the CSV header row. Each subsequent object becomes a data row.
    *   **If the array contains other arrays**: It treats each inner array as a row. No header is automatically generated.
    *   **Example (Array of Objects)**:
        ```javascript
        const users = [{id: 1, name: "A, B"}, {id: 2, name: 'C "D"'}];
        users.toCsvString();
        // Returns: 'id,name\n1,"A, B"\n2,"C ""D"""'
        ```
    *   **Example (Array of Arrays)**:
        ```javascript
        const data = [['id', 'name'], ['1', 'one']];
        data.toCsvString();
        // Returns: 'id,name\n1,one'
        ```

*   **`.toCsvJson(delimiter = ',')`**: A utility method that first converts the array to a CSV string via `.toCsvString()` and then parses that string back into an array of JSON objects using `String.prototype.toCsvJson`. This is useful for normalizing data structures.

### String.prototype Extensions

These methods are added to the `String` prototype for powerful text processing and I/O.

*   **`.body(start?, end?, line?, word?)`**: Extracts a portion of a multi-line string. Parameters are applied sequentially.
    *   `start` (number): The starting line index (0-based) to slice from.
    *   `end` (number): The ending line index (exclusive) to slice to.
    *   `line` (number): From the resulting slice of lines, selects a single line by its index.
    *   `word` (number): From the selected line, splits it by whitespace and selects a single word by its index.
    *   **Example**:
        ```javascript
        const text = "line 0\nline 1 word1 word2\nline 2";
        text.body(1, 3);         // Returns: "line 1 word1 word2\nline 2"
        text.body(0, 3, 1);      // Returns: "line 1 word1 word2"
        text.body(0, 3, 1, 2);   // Returns: "word2"
        ```

*   **`.write(filePath, mode = 'w+')`**: Writes the string's content to a specified file, overwriting it by default.
    *   `filePath` (string): The path to the file.
    *   `mode` (string): The file open mode (e.g., `'w+'` for write/truncate, `'a+'` for append).
    *   **Example**: `"Hello, World!".write('./greeting.txt');`

*   **`.parseJson()`**: A convenient shortcut for `JSON.parse(string)`. Parses a JSON string into a JavaScript object.
    *   **Example**: `'{"id": 1}'.parseJson(); // Returns: {id: 1}`

*   **`.toCsvArray(delimiter = ',')`**: Parses a CSV-formatted string into an array of arrays, where each inner array represents a row of cells. It correctly handles quoted fields containing delimiters and escaped quotes.
    *   **Example**: `'h1,h2\n"a,b","c""d"'.toCsvArray(); // Returns: [['h1','h2'], ['a,b', 'c"d']]`

*   **`.toCsvJson(delimiter = ',')`**: Parses a CSV-formatted string into an array of JSON objects. It assumes the first line of the string is the header row, which it uses for the object keys.
    *   **Example**:
        ```javascript
        const csv = 'id,name\n1,Alice\n2,Bob';
        csv.toCsvJson();
        // Returns: [{id: '1', name: 'Alice'}, {id: '2', name: 'Bob'}]
        ```

### Object.prototype Extensions

*   **`.stringify(replacer = null, space = 2)`**: A shortcut for `JSON.stringify(this, replacer, space)`, providing a quick way to pretty-print any object.
    *   **Example**: `{a:1, b:2}.stringify();`

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

