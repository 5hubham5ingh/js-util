
# js: JavaScript-powered Stream Manipulation

**`js`** is a lightweight command-line utility that brings the simplicity and readability of a modern scripting language over cryptic and numerous syntax for different tools like awk, sed, jq, etc to your commands.

It's built with QuickJS, compiling to a standalone binary for Linux, making it incredibly fast and portable.

---

## Why `js`?

Traditional command-line tools for text processing often rely on specialized syntaxes that can be difficult to learn and remember. `js` replaces this with familiar JavaScript, enabling you to:

*   **Process standard input with ease:** Treat input as a string and manipulate it using standard JavaScript methods.
*   **Leverage built-in functions:** Access `JSON.parse`, `JSON.stringify`, `print`, and QuickJS's `std` and `os` modules directly.
*   **Write readable, chainable scripts:** No more wrestling with arcane regular expressions or cryptic commands. Your logic is clear, fluent JavaScript.
*   **Chain commands:** Integrate `js` seamlessly into your existing shell pipelines.
*   **Interact with the shell:** Easily execute external commands and access file system information.

---

## Installation

`js` is distributed as a single binary.

1.  **Download the latest release:** Grab the appropriate `js` binary for your Linux system from the [releases page](https://github.com/5hubham5ingh/js-util/releases) or run:

    ```bash
    curl -L $(curl -s https://api.github.com/repos/5hubham5ingh/js-util/releases/latest | grep -Po '"browser_download_url": "\K[^"]+' | grep js) -o js
    ```

2.  **Make it executable:**

    ```bash
    chmod +x js
    ```

3.  **Move it to your PATH:**

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

---

### Examples

*   **Print a simple calculation:**

    ```bash
    js  "10 * 5"  # Output: 50
    ```

*   **Extract content from a file:**

    ```bash
    cat my_file.txt | js  "stdin.body(4,14)" # Select lines 4 to 14
    js  "read('my_file.txt').body(10, 15, 3, 5)" # Select lines 10 to 15 then line 3 then word 5

    ```

*   **Extract and transform JSON using `.pipe()`:**

    Suppose `input.json` contains: `{"name": "Alice", "age": 30}`

    ```bash
    cat input.json | js  "stdin.parseJson().pipe(d => `Name: ${d.name}, Age: ${d.age}`)"
    ```

    Output:
    ```
    Name: Alice, Age: 30
    ```

*   **Filter lines and print using `for` and `print`:**

    ```bash
    cat access.log | js "stdin.split('\n').filter(line => line.includes('ERROR')).for(print)"
    ```

*   **List `TODO` in files in current directory:**

    ```bash
    js  "ls.filter(f => f.endsWith('.md') && read(f).includes('TODO'))"
    ```

*   **Execute a shell command and process the output:**

    ```bash
    js  "'curl -s https://jsonplaceholder.typicode.com/users'.exec()
    .parseJson()
    .pipe(users => users.map(u => [u.id, u.name, u.company.name]))
    .pipe( data => [['id','name','company'], ...data])
    .toCsvString()
    .write('report.csv')"
    ```

*   **Process CSV and JSON files:**

    ```bash
    js  "read('departments.json').parseJson()
    .reduce((m,d)=>(m[d.id]=d,m),{})
    .pipe(depts=>read('employees.csv')
    .toCsvJson()
    .map(e=>({id:e.employee_id,name:e.name,dept:depts[e.department_id]?.department_name||'N/A',loc:depts[e.department_id]?.location||'N/A'}))
    .toCsvString()
    .write('departments.csv')"
    ```

*   Execute commands concurrently:
    ```bash
    js  "await Promise.all(ls.filter(f => f.endsWith('.png'))
    .map(img => ('magick ' + img + ' -resize 1920x1080 ' + cwd + '/resized_' + img).execAsync))"
    ```


---

## Global Variables and Functions

These are available in your JavaScript expressions:

*   `stdin`: A string containing the full piped input.
*   `print(value)`: Prints a value followed by a newline.
*   `parse(jsonString)`: Alias for `JSON.parse()`.
*   `stringify(value)`: Alias for `JSON.stringify()`.
*   `exec(command)`: Executes a shell command synchronously and returns its stdout as a string. `command` can be a string or an array of strings (e.g., `['ls', '-l']`).
*   `execAsync(command)`: Executes a command asynchronously; returns a promise.
*   `read(filePath)`: Reads a file as a utf-8 encoded string.
*   `pwd`: Current working directory.
*   `hd`: User's home directory.
*   `ls`: Array of files/directories in the current directory.
*   `std`: QuickJS `std` module.
*   `os`: QuickJS `os` module.

---

## Chaining and Prototype Extensions

To facilitate a more fluid, chainable programming style, several native prototypes have been extended.

### The `.pipe()` Method

A `.pipe(callback)` method has been added to the `Object`, `Array`, `String`, and `Number` prototypes. It passes the object it was called on as an argument to the callback function and returns the callback's result. This allows you to insert any custom logic or external function into a method chain without breaking the flow.

**Example**:
`'input'.pipe(s => s.toUpperCase()).pipe(s => console.log(s));`

### Object.prototype

*   **`.stringify(replacer = null, space = 2)`**: A shortcut for `JSON.stringify(this, replacer, space)`, providing a quick way to pretty-print any object.
*   **`.pipe(callback)`**: Passes the object to the callback and returns its result.

### Array.prototype

*   **`.stringify(replacer = null, space = 2)`**: A shortcut for `JSON.stringify(this, replacer, space)`.
*   **`.for(callback)`**: A chainable alias for `forEach`. It executes the `callback` for each element and returns the original array, allowing further method calls.
*   **`.remove(...items)`**: Mutates the array by removing the **first occurrence** of each specified item. Returns the modified array.
*   **`.removeAll(...items)`**: Mutates the array by removing **all occurrences** of each specified item. Returns the modified array.
*   **`.toCsvString(delimiter = ',')`**: Converts an array of arrays into a CSV-formatted string. It correctly handles quoting for fields containing delimiters, newlines, or quotes.
    *   **Example**:
        ```javascript
        const data = [['id', 'name'], ['1', 'A, B'], ['2', 'C "D"']];
        data.toCsvString();
        // Returns: 'id,name\n1,"A, B"\n2,"C ""D"""'
        ```
*   **`.pipe(callback)`**: Passes the array to the callback and returns its result.
*   **`.exec()`**: Treats the array as a command and its arguments (e.g., `['ls', '-l']`) and executes it synchronously.
*   **`.execAsync()`**: Asynchronously executes the array as a command and its arguments.

### String.prototype

*   **`.body(start?, end?, line?, word?)`**: Extracts a portion of a multi-line string. Parameters are applied sequentially.
*   **`.write(filePath, mode = 'w+')`**: Writes the string's content to a file.
*   **`.parseJson()`**: A convenient shortcut for `JSON.parse(string)`.
*   **`.toCsvArray(delimiter = ',')`**: Parses a CSV-formatted string into an array of arrays.
*   **`.toCsvJson(delimiter = ',')`**: Parses a CSV string into an array of JSON objects. Assumes the first line is the header row.
    *   **Example**:
        ```javascript
        const csv = 'id,name\n1,Alice\n2,Bob';
        csv.toCsvJson();
        // Returns: [{id: '1', name: 'Alice'}, {id: '2', name: 'Bob'}]
        ```
*   **`.pipe(callback)`**: Passes the string to the callback and returns its result.
*   **`.exec()`**: Treats the string as a shell command and executes it synchronously.
*   **`.execAsync()`**: Asynchronously executes the string as a shell command.

### Number.prototype

*   **`.pipe(callback)`**: Passes the number to the callback and returns its result.

Refer to [QuickJS documentation](https://bellard.org/quickjs/quickjs.html#Standard-library) for more on `std` and `os`.

---

## How it Works

`js` processes command-line arguments to configure its behavior:

1.  Iterates over `scriptArgs` (QuickJS command-line arguments).
3.  Joins args into a single JavaScript expression.
4.  Executes the expression using `std.evalScript`.


---

## TODO

- Implement console.table.
- Coloured output.
- Styled output.

## Contributing

Contributions are welcome! If you have ideas for improvements, bug reports, or want to add new features, please [open an issue](https://github.com/5hubham5ingh/js-util/issues) or submit a pull request.
