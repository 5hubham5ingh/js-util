# js - JavaScript for your Shell

`js` is a command-line tool that brings the power and familiarity of JavaScript to your shell. Built on the lightweight and fast [QuickJS](https://bellard.org/quickjs/) engine, `js` provides a rich set of helper methods and global shortcuts to make your command-line scripting more productive, readable, and enjoyable.

It brings the simplicity and readability of a modern scripting language over cryptic and numerous syntax for different tools like awk, sed, jq, etc to your commands.

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

**Build from source:**
Run `curl -fsSL https://raw.githubusercontent.com/5hubham5ingh/js-util/main/build.sh | sh`

## Usage

You can pass any JavaScript expression as an argument to `js`.

```bash
# Access environment variables
js "PATH.log()"
# /usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin

# List files in the current directory
js "ls.log()"
# [ "file1.txt", "file2.js", "directory1" ]

# Chain operations with .pipe()
js "ls.pipe(f => f.filter(f => f.endsWith('.js'))).join('\n').pipe(['fzf','--preview','bat {}'])"
# ...outputs the result 

# Read a file and get its line count
js "read('my-file.txt').lines().length.log()"
# 42

# Execute external commands
js "exec('ls -la').log()"
# ...outputs the result of ls -la

# Read from stdin and process it
cat package.json | js "stdin.parseJson().version.log()"
# 1.0.0

# Create a styled border around text
js "'Hello, World!'.border('rounded', ['green']).log()"

# Use the full power of JavaScript's Math library, not just simple arithmetic
js "(Math.log(100) * Math.PI).log()"
# 14.476482730108398

# Prettify and inspect your PATH environment variable
js "PATH.split(':').join('\\n').border('rounded', ['yellow']).log()"
# ╭──────────────────╮
# │ /usr/local/bin   │
# │ /usr/bin         │
# │ /bin             │
# │ /usr/sbin        │
# │ /sbin            │
# ╰──────────────────╯

# Count the number of markdown files in the current directory
js "ls.filter(f => f.endsWith('.md')).length.log()"
# 5

# List all subdirectories, styled with an icon
js "ls.filter(f => f.isDir()).map(dir => \`📁 \${dir}\`.style('yellow')).join('\\n').log()"
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
js "exec('git branch').lines().find(line => line.startsWith('*')).replace('* ', '').log()"
# "main"

# List all 'dependencies' from a package.json file via stdin
cat package.json | js "stdin.parseJson().dependencies.keys().log()"
# [
#   "some-dependency",
#   "another-dependency"
# ]

# Display the current time in a fancy, styled box
js "new Date().toString().border('double', ['magenta', 'bold']).log()"
# ╔═══════════════════════════════════════════════════════════════════╗
# ║ Fri Jul 25 2025 11:08:00 GMT+0000 (Coordinated Universal Time)    ║
# ╚═══════════════════════════════════════════════════════════════════╝

# Extend functionality by loading external scripts from '~/.config/js/' using `use(scriptName)`
js "use('colours'); fp = HOME.concat('/.config/pywall/colors'); read(fp).words().map(color.darker).join('\n').write(fp)"
# Exports colours.js and use functions defined in it, color.darker, to modify pywall colors

# Execute pre-written scripts
cat "$(ls ~/scripts/js/ | fzf)" | js
# Select and execute a JavaScript script from your scripts directory.

# Run interactively
js
# Starts a JavaScript REPL (Read-Eval-Print Loop) when no input is provided via stdin or command-line arguments.

# Print array of objects as table
js "const t = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: null }
]; t.table().log()"
#╔═════════╤═════════╤══════╗
#║ (index) │ name    │ age  ║
#╟─────────┼─────────┼──────╢
#║ 0       │ Alice   │ 25   ║
#║ 1       │ Bob     │ 30   ║
#║ 2       │ Charlie │ null ║
#╚═════════╧═════════╧══════╝

# Print object as table, specify columns to include
js "const t1Lines = { a: 1, b: 2, c: 3 }.table().split('\n'),
  t2Lines = [{ id: 1 }, { id: 2, extra: 'yes' }].table(['id']).split('\n');

for (let i = 0; i < Math.max(t1Lines.length, t2Lines.length); i++) {
  let r1 = t1Lines[i] || '',
    r2 = t2Lines[i] || '';
  print(`${r1} ${r2}`);
}"
#╔═════════╤═════╤═══════╗ ╔═════════╤════╗
#║ (index) │ key │ value ║ ║ (index) │ id ║
#╟─────────┼─────┼───────╢ ╟─────────┼────╢
#║ a       │ a   │ 1     ║ ║ 0       │ 1  ║
#║ b       │ b   │ 2     ║ ║ 1       │ 2  ║
#║ c       │ c   │ 3     ║ ╚═════════╧════╝
#╚═════════╧═════╧═══════╝
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
| `use(scriptName)` | `string` | Evaluate the file 'scriptName' from '~/.config/js/' directory as a script (global eval). |
| `.cd(dir)` | Changes the current directory. Defaults to `$HOME`. Returns `true` on success. |


---

### `Object.prototype`

| Method | Description |
| --- | --- |
| `.stringify(replacer, space)` | Same as JSON.stringify, converts the object to a JSON string. Defaults to 2-space indentation. |
| `.pipe(callback)` | Passes the object as an argument to the `callback` function and returns the result. |
| `.log()` | Prints the object to `stdout` and returns the object. |
| `.values()` | Same as Object.values(), returns values as array from the object. |
| `.keys()` | Same as Object.keys(), returns keys as array from the object. |
| `.entries()` | Same as Object.entries(), returns key-value pair from the object. |
| `.assign(values)` | Same as Object.assign(values), assign values to the object. |
| `.table(columns)` | Format the object as a table for printing. Return a string. |

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
| `.pipe(callback)` | Passes the array elements as an argument to the `callback`, which could be a function or an array or string, in which case it's treated as a shell command, and returns the result. |
| `.exec()` | Treats the array as a command and arguments for `exec()`. |
| `.execAsync()` | Treats the array as a command and arguments for `execAsync()`. |

---

### `String.prototype`

| Method | Description |
| --- | --- |
| `.pipe(callback)` | Passes the string as an argument to the `callback`, which could be a function or an array or string, in which case it's treated as a shell command, and returns the result. |
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
| `.style(styles)` | Applies ANSI styles to the string. `styles` is an array of style names. <br>**Formatting:** `bold`, `italic`, `underline`. <br>**Colors:** `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `grey`, and their `bright` versions (e.g., `brightRed`) or any rgb or hex color as `#4287f5`,and `rgb(66, 135, 245)`. <br>**Backgrounds:** `bg-red`, `bg-green`, etc., and their `bg-bright` versions (e.g., `bg-brightRed`). <br>Example: `['blue', 'bold', 'bg-white']` |
| `.stripStyle()` | Removes all ANSI style codes from the string. |
| `.border(type, style, padding)` | Draws a border around the string. `type` can be `normal`, `thick`, `double`, `rounded`. `style` is an array of styles for the border. |
| `.stripBorder()`| Removes border characters from a string. |

---

### `Number.prototype`

| Method | Description |
| --- | --- |
| `.pipe(callback)` | Passes the number as an argument to the `callback` function. |
| `.log()` | Prints the number to `stdout` and returns the number. |


## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
