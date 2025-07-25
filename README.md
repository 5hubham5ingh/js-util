# js - JavaScript for your Shell

`js` is a command-line tool that brings the power and familiarity of JavaScript to your shell. Built on the lightweight and fast [QuickJS](https://bellard.org/quickjs/) engine, `js` provides a rich set of helper methods and global shortcuts to make your command-line scripting more productive, readable, and enjoyable.

Move beyond `awk` and `sed` and embrace the flexibility of JavaScript for your everyday tasks.

## Features

*   **Seamless JS Execution:** Run JavaScript code directly from your terminal.
*   **Shell-like Globals:** Access environment variables (`HOME`, `PATH`, etc.) and common commands (`ls`, `cd`, `cwd`) as global JavaScript variables.
*   **Powerful Piping:** Chain commands and functions together with an intuitive `.pipe()` method available on Objects, Arrays, Strings, and Numbers.
*   **Effortless I/O:** Read from `stdin` or files (`read()`) and write to files (`.write()`) with ease.
*   **Process Execution:** Run external commands synchronously (`exec`) or asynchronously (`execAsync`).
*   **Built-in Data Conversion:** Convert between CSV and JSON formats effortlessly.
*   **Advanced String & Array Manipulation:** A rich set of prototype methods for common data manipulation tasks.
*   **Styled Output:** Add colors, styles, and borders to your output for better readability.

## Installation

1.  **Install QuickJS:** Ensure you have [QuickJS](https://bellard.org/quickjs/qjs.html) installed and the `qjs` interpreter is available in your system's `PATH`.
2.  **Get the script:** Clone this repository or download the `js` script.
3.  **Place the script in your PATH:** Move the `js` script to a directory in your `PATH`, like `/usr/local/bin`.
    ```bash
    mv js /usr/local/bin/
    ```
4.  **Make it executable:**
    ```bash
    chmod +x /usr/local/bin/js
    ```
5.  **Verify dependencies:** Make sure the dependent modules (`qjs-ext-lib/src/process.js` and `justjs/ansiStyle.js`) are located in the correct relative paths from the `js` script as specified in the `import` statements.

## Usage

You can pass any JavaScript expression as an argument to `js`.

```bash
# Basic math
js "1 + 1"
# 2

# Access environment variables
js "PATH"
# /usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin

# List files in the current directory
js "ls"
# [ "file1.txt", "file2.js", "directory1" ]

# Chain operations with .pipe()
js "ls.pipe(files => files.filter(f => f.endsWith('.js')))"
# [ "file2.js" ]

# Read a file and get its line count
js "read('my-file.txt').lines().length"
# 42

# Execute external commands
js "exec('ls -la')"
# ...outputs the result of ls -la

# Read from stdin and process it
cat package.json | js "stdin.parseJson().version"
# 1.0.0

# Create a styled border around text
js "'Hello, World!'.border('rounded', ['green'])"

# Use the full power of JavaScript's Math library, not just simple arithmetic
js "Math.log(100) * Math.PI"
# 14.476482730108398

# Prettify and inspect your PATH environment variable
js "PATH.split(':').join('\\n').border('rounded', ['yellow'])"
# ╭──────────────────╮
# │ /usr/local/bin   │
# │ /usr/bin         │
# │ /bin             │
# │ /usr/sbin        │
# │ /sbin            │
# ╰──────────────────╯

# Count the number of markdown files in the current directory
js "ls.filter(f => f.endsWith('.md')).length"
# 5

# List all subdirectories, styled with an icon
js "ls.filter(f => f.isDir()).map(dir => \`📁 \${dir}\`.style('yellow')).join('\\n')"
# 📁 directory1
# 📁 another_dir

# Find and display all 'import' statements from a source file
js "read('index.js').lines().filter(l => l.trim().startsWith('import')).log()"
# [
#   "import * as std from \"std\"",
#   "import { exec as execAsync, execSync as exec } from \"../qjs-ext-lib/src/process.js\"",
#   "import * as os from \"os\"",
#   "import { ansi } from \"../justjs/ansiStyle.js\""
# ]

# Get the current git branch by executing a command and parsing its output
js "exec('git branch').lines().find(line => line.startsWith('*')).replace('* ', '')"
# "main"

# List all 'dependencies' from a package.json file via stdin
cat package.json | js "Object.keys(stdin.parseJson().dependencies).log()"
# [
#   "some-dependency",
#   "another-dependency"
# ]

# Display the current time in a fancy, styled box
js "new Date().toString().border('double', ['magenta', 'bold'])"
# ╔═══════════════════════════════════════════════════════════════════╗
# ║ Fri Jul 25 2025 11:08:00 GMT+0000 (Coordinated Universal Time)    ║
# ╚═══════════════════════════════════════════════════════════════════╝
```

## API Reference

### Global Variables & Functions

| Name | Type | Description |
| --- | --- | --- |
| `std` | `object` | The QuickJS standard library module. |
| `os` | `object` | The QuickJS operating system module. |
| `parse(str)` | `function` | Alias for `JSON.parse()`. |
| `stringify(obj)` | `function` | Alias for `JSON.stringify()`. |
| `exec(cmd)` | `function` | Executes a command synchronously and returns the output. `cmd` can be a string or an array of strings. |
| `execAsync(cmd)` | `function` | Executes a command asynchronously and returns a Promise. `cmd` can be a string or an array of strings. |
| `read(path)` | `function` | Reads a file and returns its content as a string. Alias for `std.loadFile()`. |
| *Environment Vars* | `string` | Common environment variables like `HOME`, `PATH`, `USER`, `PWD` are available as global strings. |
| `cwd` | `string` | Gets the current working directory. |
| `ls` | `array` | Returns an array of file and directory names in the current directory. |
| `stdin` | `string` | Lazily reads the entire standard input and returns it as a string. |

---

### `Object.prototype`

| Method | Description |
| --- | --- |
| `.stringify(replacer, space)` | Converts the object to a JSON string. Defaults to 2-space indentation. |
| `.pipe(callback)` | Passes the object as an argument to the `callback` function and returns the result. |
| `.log()` | Prints the object to `stdout` and returns the object. |
| `.cd(dir)` | Changes the current directory. Defaults to `$HOME`. Returns `true` on success. |

---

### `Array.prototype`

| Method | Description |
| --- | --- |
| `.stringify(replacer, space)` | Converts the array to a JSON string. Defaults to 2-space indentation. |
| `.for(callback)` | Iterates over each element of the array. |
| `.remove(...items)` | Removes the first occurrence of each specified item from the array. |
| `.removeAll(...items)` | Removes all occurrences of each specified item from the array. |
| `.toCsvString(delimiter)` | Converts an array of objects or an array of arrays into a CSV string. |
| `.toCsvArray()` | Converts an array of objects into an array of arrays, with headers as the first row. |
| `.toCsvJson(delimiter)` | Converts an array of objects to a CSV string and then back to a JSON object array. |
| `.pipe(callback)` | Passes the array as an argument to the `callback` function. |
| `.exec()` | Treats the array as a command and arguments for `exec()`. |
| `.execAsync()` | Treats the array as a command and arguments for `execAsync()`. |

---

### `String.prototype`

| Method | Description |
| --- | --- |
| `.pipe(callback)` | Passes the string as an argument to the `callback` function. |
| `.body(start, end, line, word)` | Extracts a portion of a multi-line string. |
| `.write(path, mode)` | Writes the string to a file. Default mode is `"w+"`. |
| `.parseJson()` | Parses a JSON string into a JavaScript object. |
| `.toCsvArray(delimiter)` | Converts a CSV formatted string into an array of arrays. |
| `.toCsvJson(delimiter)` | Converts a CSV formatted string into an array of JSON objects. |
| `.exec()` | Executes the string as a shell command synchronously. |
| `.execAsync()` | Executes the string as a shell command asynchronously. |
| `.log()` | Prints the string to `stdout` and returns the string. |
| `.lines()` | Splits the string into an array of lines. |
| `.words()` | Splits the string into an array of words. |
| `.isDir()` | Returns `true` if the string path is a directory. |
| `.isFile()` | Returns `true` if the string path is a file. |
| `.isSymLink()` | Returns `true` if the string path is a symbolic link. |
| `.style(styles)` | Applies ANSI styles to the string. `styles` is an array of style names (e.g., `['red', 'bold']`). |
| `.stripStyle()` | Removes all ANSI style codes from the string. |
| `.border(type, style, padding)` | Draws a border around the string. `type` can be `normal`, `thick`, `double`, `rounded`. `style` is an array of styles for the border. |
| `.stripBorder()`| Removes border characters from a string. |

---

### `Number.prototype`

| Method | Description |
| --- | --- |
| `.pipe(callback)` | Passes the number as an argument to the `callback` function. |
| `.log()` | Prints the number to `stdout` and returns the number. |

## TODO
- Implement console.table

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
