# js - JavaScript for your Shell

`js` is an interpreter, "shell", and a command-line tool that brings JavaScript to your shell. 
Built on the lightweight and fast [QuickJS](https://bellard.org/quickjs/) engine, `js` provides a rich set of helper methods and global shortcuts to make your command-line scripting more productive, readable, and enjoyable.

## Why
- Traditional shells are great for running commands, but they're slow for complex scripting because they have to start a new process for almost everything. 
- By performing complex logic, data manipulation, and arithmetic directly in the optimized JavaScript engine, `js` avoids the significant overhead of creating new processes for every operation.
- Also, it brings the simplicity and readability of a modern scripting language over cryptic and numerous syntax for different tools like awk, sed, jq, etc to your commands.

It is not a drop-in replacement for traditional shells like Bash, Zsh, and Fish. Rather, it's a powerful companion for when you need to write a script that requires modern programming language features, fast data processing, or complex logic.
Think of it as a tool that lets you combine the best of both worlds: the power of external UNIX utilities with the elegance and performance of a modern scripting language.

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

### Use in terminal

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
js "ls.filter(f => f.isDir.map(dir => \`📁 \${dir}\`.style('yellow')).join('\\n').log()"
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

# Execute a shell command and process its output
js "'curl -s https://jsonplaceholder.typicode.com/todos/'.exec().parseJson().slice(0,4).table().log()"
╔════════╤════╤════════════════════════════════════╤═══════════╗
║ userId │ id │ title                              │ completed ║
╟────────┼────┼────────────────────────────────────┼───────────╢
║ 1      │ 1  │ delectus aut autem                 │ false     ║
║ 1      │ 2  │ quis ut nam facilis et officia qui │ false     ║
║ 1      │ 3  │ fugiat veniam minus                │ false     ║
║ 1      │ 4  │ et porro tempora                   │ true      ║
╚════════╧════╧════════════════════════════════════╧═══════════╝

# List all 'dependencies' from a package.json file via stdin
cat package.json | js "stdin.parseJson().dependencies.keys().log()"
# [
#   "some-dependency",
#   "another-dependency"
# ]

# Display the current time in a fancy, styled box
js "new Date().toString().border('double', ['magenta', 'bold']).log()"
╔═══════════════════════════════════════════════════════════════════╗
║ Fri Jul 25 2025 11:08:00 GMT+0000 (Coordinated Universal Time)    ║
╚═══════════════════════════════════════════════════════════════════╝

# Extend functionality by loading external scripts from '~/.config/js/' using `use(scriptName)`
js "use('colours'); fp = HOME.concat('/.config/pywall/colors'); read(fp).words().map(color.darker).join('\n').write(fp)"
# Exports colours.js and use functions defined in it, color.darker, to modify pywall colors

# Execute pre-written scripts
cat "$(ls ~/scripts/js/ | fzf)" | js
# Select and execute a JavaScript script from your scripts directory.

# Print array of objects as table
js "const t = [                                   
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: null }
]; t.table().log()"
╔═════════╤══════╗
║ name    │ age  ║
╟─────────┼──────╢
║ Alice   │ 25   ║
║ Bob     │ 30   ║
║ Charlie │ null ║
╚═════════╧══════╝

# Run interactively
js
# Starts a JavaScript REPL (Read-Eval-Print Loop) when no input is provided via stdin or command-line arguments.

# Print object as table, specify columns to include, join strings horizontally and stack vertically with specific alignment.
❯ t1 = ({ a: 1, b: 2, c: 3 }).table()
❯ t2 = [{ id: 1 }, { id: 2, extra: 'yes' }].table(['id'])
❯ h = 'Testing join() and stack()'.border()
❯ h.stack(t1.join(t2), 'center').log()
┌────────────────────────────┐
│ Testing join() and stack() │
└────────────────────────────┘
    ╔═════╤═══════╗╔════╗     
    ║ key │ value ║║ id ║     
    ╟─────┼───────╢╟────╢     
    ║ a   │ 1     ║║ 1  ║     
    ║ b   │ 2     ║║ 2  ║     
    ║ c   │ 3     ║╚════╝     
    ╚═════╧═══════╝           
```

### Use as script interpreter
`fzfDict.js`
```javascript
#!/usr/bin/js

if (scriptArgs.includes('-i')
) {
  const screen = [];
  const word = scriptArgs[scriptArgs.indexOf('-i') + 1].split(' ').join('%20');
  exec(`curl -s https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .parseJson()
    .pipe((res) => {
      if (Array.isArray(res)) {
        const { word, phonetic, meanings } = res[0];
        screen.push(word.toUpperCase().style('bold'), phonetic?.style('italic'), '');
        return meanings
      }
      const { title, message, resolution } = res;
      screen.push(word.toUpperCase().style('bold'), title.style(['bold', 'red']), message, resolution)
      return [];
    })
    .for(({ partOfSpeech, definitions }) => {
      screen.push(partOfSpeech?.style(['bold', 'italic']), ...definitions?.map(({ definition }) => `- ${definition}`), '')
    })
  print(screen.join('\n'))
} else {
  const wordsCache = HOME.concat("/.cache/words.txt")
  let file = std.open(wordsCache, "r");
  if (!file) {
    exec(`curl -o ${wordsCache} https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/refs/heads/master/meta/wordList/english.txt`)
    file = std.open(wordsCache, "r");
  }
  file.readAsString()
    .pipe(`fzf --ansi --preview-window=wrap,70% --bind "enter:preview(${os.realpath(scriptArgs[1])[0]} -i {})" --bind 'ctrl-j:preview-down' --bind 'ctrl-k:preview-up'`)
  file.close()
}
```
```bash
chmod +x fzfDict.js
./fzfDict.js
```
<img alt="image" src="https://github.com/user-attachments/assets/f3be1429-e641-49d1-a98e-4c749697d5b7" />

### Use for handling user input

## API Reference

---

### Global Functions and Objects 

#### `std`

* **Type:** `object`
* **Description:** The QuickJS standard library, providing access to file I/O and other system-level functionalities.

#### `os`

* **Type:** `object`
* **Description:** The QuickJS operating system module, offering methods for interacting with the file system and processes.

#### `parse(str: string)`

* **Returns:** `object`
* **Description:** A shortcut for `JSON.parse()`. Parses a JSON string and returns the resulting JavaScript object.

#### `stringify(obj: object, replacer: function | array, space: number | string)`

* **Returns:** `string`
* **Description:** A shortcut for `JSON.stringify()`. Converts a JavaScript object into a JSON string. The `replacer` and `space` arguments are optional for controlling the output.

#### `exec(cmd: string | array)`

* **Returns:** `string`
* **Description:** Executes a shell command **synchronously** and returns its standard output as a string. If the command fails, it throws an error.

#### `execAsync(cmd: string | array)`

* **Returns:** `Promise<string>`
* **Description:** Executes a shell command **asynchronously** and returns a promise that resolves with the command's standard output.

#### `read(path: string)`

* **Returns:** `string`
* **Description:** Reads the entire content of a file specified by `path` and returns it as a single string. This is an alias for `std.loadFile()`.

#### `enquire`

* **Type:** `object`
* **Description:** A utility for creating interactive command-line prompts, such as text input, confirmation dialogs, and select lists.

#### `cwd`

* **Type:** `string`
* **Description:** A global string representing the current working directory.

#### `ls`

* **Type:** `Array<object>`
* **Description:** Returns an array of objects, where each object represents a file or directory in the current working directory. Each object is a `String` with the filename as its primitive value, and also contains properties like **`isDir`**, **`isFile`**, **`isLink`**, **`size`**, **`createdAt`**, and **`modifiedAt`**.

#### `stdin`

* **Type:** `string`
* **Description:** A lazily evaluated string containing all data piped from standard input (`stdin`). This property is only read once.

#### `use(scriptName: string)`

* **Returns:** `void`
* **Description:** Loads and executes a JavaScript file from the `~/.config/js/` directory. This is useful for importing custom utility scripts or libraries into your shell sessions.

#### `cd(dir: string)`

* **Returns:** `boolean`
* **Description:** Changes the current working directory to the specified `dir`. If `dir` is not provided, it changes to the user's home directory (`$HOME`). Returns `true` on success and `false` on failure.

---

### `Object.prototype` 

These methods are available on all JavaScript objects.

#### `.stringify(replacer?: function | array, space?: number | string)`

* **Returns:** `string`
* **Description:** Converts the object into a JSON string. An alias for `JSON.stringify()`.

#### `.pipe(callback: function | string | array)`

* **Returns:** `any`
* **Description:** Passes the object to a `callback` function or a shell command (`string` or `array`), and returns the result. This is a powerful method for chaining operations.

#### `.log()`

* **Returns:** `object`
* **Description:** Prints the object to `stdout` and returns the object itself, allowing for method chaining.

#### `.values()`

* **Returns:** `array`
* **Description:** An alias for `Object.values()`. Returns an array of the object's own enumerable property values.

#### `.keys()`

* **Returns:** `array`
* **Description:** An alias for `Object.keys()`. Returns an array of the object's own enumerable property names.

#### `.entries()`

* **Returns:** `array`
* **Description:** An alias for `Object.entries()`. Returns an array of `[key, value]` pairs for the object's own enumerable properties.

#### `.assign(values: object)`

* **Returns:** `object`
* **Description:** An alias for `Object.assign()`. Copies all enumerable properties from one or more source objects to a target object.

#### `.table(columns?: Array<string>)`

* **Returns:** `string`
* **Description:** Formats the object or an array of objects into a readable, formatted table string. Optionally, you can specify an array of `columns` to include.

---

### `Array.prototype`

These methods are available on all JavaScript arrays.

#### `.stringify(replacer?: function | array, space?: number | string)`

* **Returns:** `string`
* **Description:** Converts the array into a JSON string.

#### `.for(callback: function)`

* **Returns:** `void`
* **Description:** A simple iterator that runs the `callback` function for each element in the array. Unlike `.forEach`, it does not return the array.

#### `.remove(...items: any)`

* **Returns:** `array`
* **Description:** Removes the **first** occurrence of the specified `items` from the array.

#### `.removeAll(...items: any)`

* **Returns:** `array`
* **Description:** Removes **all** occurrences of the specified `items` from the array.

#### `.toCsvString(delimiter?: string)`

* **Returns:** `string`
* **Description:** Converts an array of objects or an array of arrays into a CSV-formatted string. Defaults to a comma (`,`) delimiter.

#### `.toCsvArray(delimiter?: string)`

* **Returns:** `array`
* **Description:** Converts a CSV-formatted string into an array of arrays. Defaults to a comma (`,`) delimiter.

#### `.toCsvJson(delimiter?: string)`

* **Returns:** `Array<object>`
* **Description:** Converts a CSV-formatted string into an array of JSON objects. The first row of the CSV is used as the keys for the objects. Defaults to a comma (`,`) delimiter.

#### `.pipe(callback: function | string | array)`

* **Returns:** `any`
* **Description:** Passes the array elements to a `callback` function or a shell command.

#### `.exec()`

* **Returns:** `string`
* **Description:** Treats the array as a command and its arguments, and executes it synchronously. For example, `['git', 'status'].exec()` is equivalent to running `git status`.

#### `.execAsync()`

* **Returns:** `Promise<string>`
* **Description:** Treats the array as a command and its arguments, and executes it asynchronously.

---

### `String.prototype`

These methods are available on all JavaScript strings.

#### `.pipe(callback: function | string | array)`

* **Returns:** `any`
* **Description:** Passes the string to a `callback` function or a shell command.

#### `.body(start?: number, end?: number, line?: boolean, word?: boolean)`

* **Returns:** `string`
* **Description:** Extracts a section of a multi-line string. You can specify a starting (`start`) and ending (`end`) position, and whether to treat the string by `line` or `word`.

#### `.write(path: string, mode?: string)`

* **Returns:** `string`
* **Description:** Writes the string content to a file at the specified `path`. The optional `mode` defaults to `"w+"` (write and create).

#### `.parseJson()`

* **Returns:** `object`
* **Description:** Parses a string that contains valid JSON and returns the resulting JavaScript object.

#### `.toCsvArray(delimiter?: string)`

* **Returns:** `array`
* **Description:** Converts a CSV-formatted string into a two-dimensional array.

#### `.toCsvJson(delimiter?: string)`

* **Returns:** `Array<object>`
* **Description:** Converts a CSV-formatted string into an array of objects, using the first line as object keys.

#### `.exec()`

* **Returns:** `string`
* **Description:** Executes the string as a shell command **synchronously**.

#### `.execAsync()`

* **Returns:** `Promise<string>`
* **Description:** Executes the string as a shell command **asynchronously**.

#### `.log()`

* **Returns:** `string`
* **Description:** Prints the string to `stdout` and returns the string itself.

#### `.lines()`

* **Returns:** `array`
* **Description:** Splits the string into an array of lines based on newline characters.

#### `.words()`

* **Returns:** `array`
* **Description:** Splits the string into an array of words based on whitespace.

#### `.isDir()`

* **Returns:** `boolean`
* **Description:** Returns `true` if the string is a valid path to a directory.

#### `.isFile()`

* **Returns:** `boolean`
* **Description:** Returns `true` if the string is a valid path to a file.

#### `.isSymLink()`

* **Returns:** `boolean`
* **Description:** Returns `true` if the string is a valid path to a symbolic link.

#### `.style(styles: string | Array<string>)`

* **Returns:** `string`
* **Description:** Applies ANSI styles to the string for colored and formatted output in the terminal.
    * **Formatting:** `bold`, `italic`, `underline`.
    * **Colors:** `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `grey`, and `bright` versions (e.g., `brightRed`).
    * **Hex/RGB:** Accepts hex codes like `#4287f5` or RGB values like `rgb(66, 135, 245)`.
    * **Backgrounds:** `bg-red`, `bg-blue`, etc.

#### `.stripStyle()`

* **Returns:** `string`
* **Description:** Removes all ANSI style codes from the string.

#### `.border(type?: string, style?: string | Array<string>, padding?: number)`

* **Returns:** `string`
* **Description:** Encloses the string in a styled border.
    * **Type:** `normal`, `thick`, `double`, `rounded`.
    * **Style:** An array of ANSI styles for the border characters.
    * **Padding:** An optional number for space around the text.

#### `.stripBorder()`

* **Returns:** `string`
* **Description:** Removes any border characters from a string.

#### `.join(secondString: string)`

* **Returns:** `string`
* **Description:** Joins two multi-line strings side-by-side.

#### `.stack(secondString: string, align?: string)`

* **Returns:** `string`
* **Description:** Stacks two multi-line strings vertically. Alignment can be `left`, `right`, or `center`.

#### `.chunks(size: number)`

* **Returns:** `array`
* **Description:** Splits the string into an array of smaller strings, each with a maximum length of `size`.

#### `.wrap(maxLength: number, byWords?: boolean)`

* **Returns:** `string`
* **Description:** Wraps the string to a specified `maxLength`. If `byWords` is `true`, it wraps at word boundaries.

#### `.eval()`

* **Returns:** `any`
* **Description:** Evaluates the string as JavaScript code and returns the result.

---

### `Number.prototype` 🔢

These methods are available on all JavaScript numbers.

#### `.pipe(callback: function | string | array)`

* **Returns:** `any`
* **Description:** Passes the number as an argument to a `callback` function or a shell command.

#### `.log()`

* **Returns:** `number`
* **Description:** Prints the number to `stdout` and returns the number itself.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
