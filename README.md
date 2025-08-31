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

# Create a markdown digest of a git repo
js "'git ls-files'.exec().lines().filter(f => f.endsWith('js'))
.reduce((digest,f)=> digest += '\n# FILE: ' + f + '\n' +  read(f),'').log()"
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

# API Reference

## Global Objects and Functions

### `globalThis` Extensions

The `globalThis` object is extended with several utility functions and properties.

#### `parse(jsonString)`
Parses a JSON string, constructing the JavaScript value or object described by the string.
- **`jsonString`**: (`string`) The JSON string to parse.
- **Returns**: (`any`) The JavaScript object or value parsed from the JSON string.
- **Example**:
  ```javascript
  const obj = parse('{"name": "Alice", "age": 30}');
  // obj is { name: "Alice", age: 30 }
  ```

#### `stringify(value, replacer = null, space = 2)`
Converts a JavaScript value to a JSON string.
- **`value`**: (`any`) The value to convert to a JSON string.
- **`replacer`**: (`function` or `array`, optional) A function that alters the behavior of the stringification process, or an array of `String` and `Number` objects that serve as a whitelist for selecting the properties of the `value` object to be included in the JSON string.
- **`space`**: (`string` or `number`, optional) A `String` or `Number` object that's used to insert white space into the output JSON string for readability purposes.
- **Returns**: (`string`) A JSON string representation of the `value`.
- **Example**:
  ```javascript
  const jsonString = stringify({ name: "Bob", occupation: "Engineer" });
  // jsonString is '{\n  "name": "Bob",\n  "occupation": "Engineer"\n}'
  ```

#### `exec(command)`
Executes a shell command synchronously.
- **`command`**: (`string` or `array`) The command string or an array of command arguments.
- **Returns**: (`string`) The standard output of the command. Throws an error if the command fails.
- **Example**:
  ```javascript
  const output = exec('ls -l');
  print(output);
  ```

#### `execAsync(command)`
Executes a shell command asynchronously.
- **`command`**: (`string` or `array`) The command string or an array of command arguments.
- **Returns**: (`Promise<string>`) A promise that resolves with the standard output of the command, or rejects with an error if the command fails.
- **Example**:
  ```javascript
  execAsync('sleep 1 && echo "Done"').then(print);
  ```

#### `read(filePath)`
Reads the content of a file.
- **`filePath`**: (`string`) The path to the file.
- **Returns**: (`string`) The content of the file as a string. Throws an error if the file cannot be opened.
- **Example**:
  ```javascript
  const content = read('./myfile.txt');
  print(content);
  ```

#### `use(scriptName)`
Loads and executes a JavaScript script from a predefined configuration directory (`HOME/.config/js/`).
- **`scriptName`**: (`string`) The name of the script file (without the `.js` extension).
- **Returns**: (`undefined`)
- **Example**:
  ```javascript
  use('myUtilityScript'); // Loads and runs ~/.config/js/myUtilityScript.js
  ```

#### `cd(directoryPath = HOME)`
Changes the current working directory.
- **`directoryPath`**: (`string`, optional) The path to the directory to change to. Defaults to `HOME`.
- **Returns**: (`boolean`) `true` if the directory was changed successfully, `false` otherwise.
- **Example**:
  ```javascript
  cd('/tmp');
  print(cwd); // Prints '/tmp'
  ```

#### `eval(expression)`
Evaluates a JavaScript expression or script string.
- **`expression`**: (`string`) The JavaScript expression or script to evaluate.
- **Returns**: (`any`) The result of the evaluated expression.
- **Example**:
  ```javascript
  const result = eval('1 + 2'); // result is 3
  ```

#### `enquire`
An object containing functions for interactive terminal input. See [Enquire Module](#enquire-module) for details.

#### `render`
An object containing functions for rendering animated or formatted output in the terminal. See [Render Module](#render-module) for details.

#### `draw`
An object containing functions for drawing text-based UI elements in the terminal. See [Draw Module](#draw-module) for details.

#### `parser`
An object containing functions for parsing various data formats (CSV, INI, TOML). See [Parser Module](#parser-module) for details.

#### `stat(path)`
Retrieves file system statistics for a given path.
- **`path`**: (`string`) The path to the file or directory.
- **Returns**: (`object` or `undefined`) An object containing `isDir`, `isFile`, `isLink`, `size`, `createdAt`, `modifiedAt` properties, or `undefined` if the path does not exist or an error occurs.
- **Example**:
  ```javascript
  const fileStats = stat('./myfile.txt');
  if (fileStats) {
    print(`Size: ${fileStats.size} bytes`);
  }
  ```

#### `ensureDir(directoryPath)`
Ensures that a directory exists, creating it and any necessary parent directories if they do not. Throws an error if a component of the path is an existing file.
- **`directoryPath`**: (`string`) The path of the directory to ensure.
- **Returns**: (`undefined`)
- **Example**:
  ```javascript
  ensureDir('/tmp/my/new/directory');
  ```

#### `cwd`
- **Type**: (`string`)
- **Description**: A read-only global property that returns the current working directory.
- **Example**:
  ```javascript
  print(cwd);
  ```

#### `ls`
- **Type**: (`Array<String>`)
- **Description**: A read-only global property that returns an array of custom `String` objects representing the contents of the current working directory. Each `String` object has additional properties: `isDir`, `isFile`, `isLink`, `size`, `createdAt`, `modifiedAt`.
- **Example**:
  ```javascript
  for (const item of ls) {
    if (item.isDir) {
      print(`[DIR] ${item}`);
    } else {
      print(`[FILE] ${item} (${item.size} bytes)`);
    }
  }
  ```

#### `stdin`
- **Type**: (`string`)
- **Description**: A read-only global property that returns the entire content of the standard input as a string. The content is cached after the first access.
- **Example**:
  ```javascript
  // Assuming 'echo "hello world" | justjs -e "print(stdin)"' is run
  print(stdin); // Prints "hello world\n"
  ```

---

## Object Prototype Extensions

### `Object.prototype`

#### `stringify(replacer = null, space = 2)`
Converts the object to a JSON string.
- **`replacer`**: (See `globalThis.stringify`)
- **`space`**: (See `globalThis.stringify`)
- **Returns**: (`string`)
- **Example**:
  ```javascript
  ({ a: 1, b: 2 }).stringify(); // '{\n  "a": 1,\n  "b": 2\n}'
  ```

#### `pipe(callback)`
Passes the object as an argument to a callback function.
- **`callback`**: (`function`) A function that takes one argument.
- **Returns**: (`any`) The result of the callback function.
- **Example**:
  ```javascript
  ({ value: 10 }).pipe(obj => obj.value * 2); // 20
  ```

#### `log()`
Prints the object to standard output and then returns the object. Useful for chaining.
- **Returns**: (`object`) The original object.
- **Example**:
  ```javascript
  ({ a: 1 }).log(); // Prints { a: 1 }, returns { a: 1 }
  ```

#### `entries()`
Returns an array of a given object's own enumerable string-keyed property `[key, value]` pairs.
- **Returns**: (`Array<Array<any>>`)
- **Example**:
  ```javascript
  ({ a: 1, b: 2 }).entries(); // [['a', 1], ['b', 2]]
  ```

#### `keys()`
Returns an array of a given object's own enumerable string-keyed property names.
- **Returns**: (`Array<string>`)
- **Example**:
  ```javascript
  ({ a: 1, b: 2 }).keys(); // ['a', 'b']
  ```

#### `values()`
Returns an array of a given object's own enumerable string-keyed property values.
- **Returns**: (`Array<any>`)
- **Example**:
  ```javascript
  ({ a: 1, b: 2 }).values(); // [1, 2]
  ```

#### `assign(sourceObject)`
Copies all enumerable own properties from one or more source objects to a target object.
- **`sourceObject`**: (`object`) The object to copy properties from.
- **Returns**: (`object`) The modified target object.
- **Example**:
  ```javascript
  const obj = { a: 1 };
  obj.assign({ b: 2 }); // obj is now { a: 1, b: 2 }
  ```

#### `table(columns)`
Generates a formatted text table from the object's data. If the object is an array of objects, it treats each object as a row. If it's a plain object, it treats its entries as key-value rows.
- **`columns`**: (`Array<string>`, optional) An array of column headers to display.
- **Returns**: (`string`) A string representing the formatted table.
- **Example**:
  ```javascript
  const data = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 24 }];
  print(data.table());
  // ╔═══════╤═════╗
  // ║ name  │ age ║
  // ╟───────┼─────╢
  // ║ Alice │ 30  ║
  // ║ Bob   │ 24  ║
  // ╚═══════╧═════╝
  ```

#### `toIni()`
Converts the object to an INI-formatted string.
- **Returns**: (`string`)
- **Example**:
  ```javascript
  const config = {
    section1: {
      key1: 'value1',
      key2: 123
    },
    rootKey: 'rootValue'
  };
  print(config.toIni());
  // rootKey=rootValue
  //
  // [section1]
  // key1=value1
  // key2=123
  ```

#### `toToml()`
Converts the object to a TOML-formatted string.
- **Returns**: (`string`)
- **Example**:
  ```javascript
  const config = {
    title: "TOML Example",
    owner: {
      name: "Alice",
      dob: "1979-05-27T07:32:00-08:00"
    }
  };
  print(config.toToml());
  // title = "TOML Example"
  //
  // [owner]
  // name = "Alice"
  // dob = "1979-05-27T07:32:00-08:00"
  ```

### `Array.prototype`

#### `stringify(replacer = null, space = 2)`
Converts the array to a JSON string.
- **`replacer`**: (See `globalThis.stringify`)
- **`space`**: (See `globalThis.stringify`)
- **Returns**: (`string`)
- **Example**:
  ```javascript
  [1, 2, 3].stringify(); // '[\n  1,\n  2,\n  3\n]'
  ```

#### `for(callback)`
Iterates over each element in the array, calling a callback function for each element. Returns the original array.
- **`callback`**: (`function`) A function that takes the current element as an argument.
- **Returns**: (`Array`) The original array.
- **Example**:
  ```javascript
  [1, 2, 3].for(e => print(e * 2)); // Prints 2, 4, 6
  ```

#### `remove(...items)`
Removes the first occurrence of specified items from the array.
- **`...items`**: (`any`) One or more items to remove.
- **Returns**: (`Array`) The modified array.
- **Example**:
  ```javascript
  const arr = [1, 2, 3, 2];
  arr.remove(2); // arr is now [1, 3, 2]
  ```

#### `removeAll(...items)`
Removes all occurrences of specified items from the array.
- **`...items`**: (`any`) One or more items to remove.
- **Returns**: (`Array`) The modified array.
- **Example**:
  ```javascript
  const arr = [1, 2, 3, 2];
  arr.removeAll(2); // arr is now [1, 3]
  ```

#### `toCsvText(delimiter = ',')`
Converts an array of arrays (or an array of objects) to a CSV formatted string.
- **`delimiter`**: (`string`, optional) The delimiter to use. Defaults to `,`.
- **Returns**: (`string`) The CSV string.
- **Example**:
  ```javascript
  [['Header1', 'Header2'], ['ValueA', 'ValueB']].toCsvText();
  // "Header1,Header2\nValueA,ValueB"
  ```

#### `toCsvArray()`
Converts an array of objects (JSON format) to an array of arrays (CSV array format), including headers.
- **Returns**: (`Array<Array<string>>`) The CSV array.
- **Example**:
  ```javascript
  [{ A: 1, B: 2 }, { A: 3, B: 4 }].toCsvArray();
  // [['A', 'B'], ['1', '2'], ['3', '4']]
  ```

#### `toCsvJson(delimiter = ',')`
Converts an array of arrays (CSV array format) to an array of objects (CSV JSON format).
- **`delimiter`**: (`string`, optional) The delimiter (not directly used in this method, but might be relevant in internal parsing steps).
- **Returns**: (`Array<object>`) The CSV JSON array.
- **Example**:
  ```javascript
  [['name', 'age'], ['Alice', '30']].toCsvJson();
  // [{ name: 'Alice', age: '30' }]
  ```

#### `pipe(callbackOrCommand)`
Passes the array as an argument to a callback function or pipes its string representation to an external command.
- **`callbackOrCommand`**: (`function`, `string`, or `Array<string>`) A function, a command string, or an array of command arguments.
- **Returns**: (`any` or `string`) The result of the callback function or the stdout of the command. Throws an error if the command fails.
- **Example**:
  ```javascript
  [1, 2, 3].pipe(arr => arr.map(n => n * 2)); // [2, 4, 6]
  ['echo', 'Hello from pipe'].exec(); // "Hello from pipe\n"
  ```

#### `exec()`
Executes the array as a shell command synchronously. (Equivalent to `globalThis.exec(this)`).
- **Returns**: (`string`) The standard output of the command.
- **Example**:
  ```javascript
  ['ls', '-a'].exec(); // Returns a string with directory listing
  ```

#### `execAsync()`
Executes the array as a shell command asynchronously. (Equivalent to `globalThis.execAsync(this)`).
- **Returns**: (`Promise<string>`) A promise resolving with the standard output.
- **Example**:
  ```javascript
  ['sleep', '1'].execAsync().then(() => print("Slept for 1 second"));
  ```

### `String.prototype`

#### `pipe(callbackOrCommand)`
Passes the string as an argument to a callback function or pipes its content to an external command.
- **`callbackOrCommand`**: (`function`, `string`, or `Array<string>`) A function, a command string, or an array of command arguments.
- **Returns**: (`any` or `string`) The result of the callback function or the stdout of the command. Throws an error if the command fails.
- **Example**:
  ```javascript
  "hello".pipe(s => s.toUpperCase()); // "HELLO"
  "hello\nworld".pipe('grep world'); // "world\n"
  ```

#### `body(start, end, lineNumber, wordNumber)`
Extracts a portion of a multi-line string.
- **`start`**: (`number`, optional) The starting line index (0-based, inclusive).
- **`end`**: (`number`, optional) The ending line index (0-based, exclusive).
- **`lineNumber`**: (`number`, optional) If provided, extracts a specific line.
- **`wordNumber`**: (`number`, optional) If `lineNumber` is provided, extracts a specific word from that line.
- **Returns**: (`string`) The extracted content.
- **Example**:
  ```javascript
  const text = "Line 1\nLine 2\nLine 3";
  text.body(0, 2); // "Line 1\nLine 2"
  text.body(null, null, 1); // "Line 2"
  text.body(null, null, 1, 1); // "2"
  ```

#### `write(path, mode = "w+")`
Writes the string content to a file.
- **`path`**: (`string`) The path to the file.
- **`mode`**: (`string`, optional) The file open mode. Defaults to `"w+"`.
- **Returns**: (`string`) The original string. Throws an error if the file cannot be opened.
- **Example**:
  ```javascript
  "Hello file!".write('./output.txt');
  ```

#### `parseJson()`
Parses the string content as JSON.
- **Returns**: (`any`) The parsed JavaScript object or value.
- **Example**:
  ```javascript
  '{"name": "justjs"}'.parseJson(); // { name: "justjs" }
  ```

#### `toCsvArray(delimiter = ',')`
Converts a CSV string to an array of arrays (CSV array format).
- **`delimiter`**: (`string`, optional) The delimiter to use. Defaults to `,`.
- **Returns**: (`Array<Array<string>>`) The CSV array.
- **Example**:
  ```javascript
  "A,B\n1,2".toCsvArray(); // [['A', 'B'], ['1', '2']]
  ```

#### `toCsvJson(delimiter = ',')`
Converts a CSV string to an array of objects (CSV JSON format).
- **`delimiter`**: (`string`, optional) The delimiter to use. Defaults to `,`.
- **Returns**: (`Array<object>`) The CSV JSON array.
- **Example**:
  ```javascript
  "name,age\nAlice,30".toCsvJson(); // [{ name: 'Alice', age: '30' }]
  ```

#### `parseIni(options)`
Parses an INI formatted string into a JavaScript object.
- **`options`**: (`object`, optional) Parsing options (e.g., `preserveCase`, `allowDuplicates`, `parseValues`, `includeComments`, `commentChars`).
- **Returns**: (`object`) The parsed INI data.
- **Example**:
  ```javascript
  '[section]\nkey=value'.parseIni(); // { section: { key: 'value' } }
  ```

#### `parseToml()`
Parses a TOML formatted string into a JavaScript object.
- **Returns**: (`object`) The parsed TOML data.
- **Example**:
  ```javascript
  'title = "My Project"'.parseToml(); // { title: 'My Project' }
  ```

#### `exec()`
Executes the string content as a shell command synchronously. (Equivalent to `globalThis.exec(this)`).
- **Returns**: (`string`) The standard output of the command.
- **Example**:
  ```javascript
  'ls -l'.exec(); // Returns a string with directory listing
  ```

#### `execAsync()`
Executes the string content as a shell command asynchronously. (Equivalent to `globalThis.execAsync(this)`).
- **Returns**: (`Promise<string>`) A promise resolving with the standard output.
- **Example**:
  ```javascript
  'sleep 1'.execAsync().then(() => print("Slept for 1 second"));
  ```

#### `log()`
Prints the string to standard output and then returns the string. Useful for chaining.
- **Returns**: (`string`) The original string.
- **Example**:
  ```javascript
  "Hello".log(); // Prints "Hello", returns "Hello"
  ```

#### `lines()`
Splits the string into an array of lines.
- **Returns**: (`Array<string>`)
- **Example**:
  ```javascript
  "Line1\nLine2".lines(); // ['Line1', 'Line2']
  ```

#### `words()`
Splits the string into an array of words, filtering out empty strings.
- **Returns**: (`Array<string>`)
- **Example**:
  ```javascript
  "Hello    world".words(); // ['Hello', 'world']
  ```

#### `isDir()`
Checks if the string represents a path to an existing directory.
- **Returns**: (`boolean`)
- **Example**:
  ```javascript
  '/tmp'.isDir(); // true (if /tmp exists and is a directory)
  ```

#### `isFile()`
Checks if the string represents a path to an existing file.
- **Returns**: (`boolean`)
- **Example**:
  ```javascript
  './myfile.txt'.isFile(); // true (if myfile.txt exists and is a file)
  ```

#### `isSymLink()`
Checks if the string represents a path to an existing symbolic link.
- **Returns**: (`boolean`)
- **Example**:
  ```javascript
  '/var/log'.isSymLink(); // true (if /var/log is a symlink)
  ```

#### `style(styles)`
Applies ANSI escape code styling to the string.
- **`styles`**: (`string` or `Array<string>`) A style name (e.g., 'bold', 'red') or an array of style names or hex/RGB color strings.
- **Returns**: (`string`) The styled string.
- **Example**:
  ```javascript
  'Error!'.style('red');
  'Success'.style(['bold', '#00ff00']);
  ```

#### `stripStyle()`
Removes ANSI escape codes from the string.
- **Returns**: (`string`) The string without ANSI styles.
- **Example**:
  ```javascript
  '\x1b[31mRed Text\x1b[0m'.stripStyle(); // 'Red Text'
  ```

#### `stripEmojis()`
Removes Unicode emoji characters from the string.
- **Returns**: (`string`) The string without emojis.
- **Example**:
  ```javascript
  'Hello 👋'.stripEmojis(); // 'Hello '
  ```

#### `border(type = 'normal', style, padding = 1)`
Adds a text-based border around the string.
- **`type`**: (`string`, optional) The border style ('normal', 'thick', 'double', 'rounded', 'hidden'). Defaults to 'normal'.
- **`style`**: (`string` or `Array<string>`, optional) ANSI styles to apply to the border characters.
- **`padding`**: (`number`, optional) The number of spaces to add between the border and the content. Defaults to `1`.
- **Returns**: (`string`) The string with a border.
- **Example**:
  ```javascript
  print('Hello'.border('double', 'blue'));
  // ╔═══════╗
  // ║ Hello ║
  // ╚═══════╝
  ```

#### `stripBorder()`
Removes common text-based border characters from the string.
- **Returns**: (`string`) The string without border characters.
- **Example**:
  ```javascript
  '╔═══╗\n║ A ║\n╚═══╝'.stripBorder(); // '\nA\n'
  ```

#### `eval()`
Evaluates the string as a JavaScript expression. (Equivalent to `globalThis.eval(this)`).
- **Returns**: (`any`) The result of the evaluation.
- **Example**:
  ```javascript
  '1 + 1'.eval(); // 2
  ```

#### `join(secondString)`
Joins two multi-line strings side-by-side. The shorter string will be padded to match the height of the taller one.
- **`secondString`**: (`string`) The string to join on the right.
- **Returns**: (`string`) The combined string.
- **Example**:
  ```javascript
  print('Line1\nLine2'.join('ColA\nColB'));
  // Line1ColA
  // Line2ColB
  ```

#### `stack(secondString, align = 'left')`
Stacks two multi-line strings vertically.
- **`secondString`**: (`string`) The string to stack below.
- **`align`**: (`'left'`, `'right'`, or `'center'`) Alignment of the stacked strings. Defaults to `'left'`.
- **Returns**: (`string`) The combined string.
- **Example**:
  ```javascript
  print('Top'.stack('Bottom', 'center'));
  //  Top
  // Bottom
  ```

#### `chunks(size)`
Splits the string into an array of chunks of a specified size.
- **`size`**: (`number`) The maximum length of each chunk.
- **Returns**: (`Array<string>`) An array of string chunks.
- **Example**:
  ```javascript
  'abcdefg'.chunks(3); // ['abc', 'def', 'g']
  ```

#### `wrap(maxLength = getTerminalSize()[0], byWords = true)`
Wraps the string to fit within a specified maximum length, either by words or by characters.
- **`maxLength`**: (`number`, optional) The maximum length of each line. Defaults to terminal width.
- **`byWords`**: (`boolean`, optional) If `true`, wraps by whole words; otherwise, wraps by characters. Defaults to `true`.
- **Returns**: (`string`) The wrapped string.
- **Example**:
  ```javascript
  'This is a long sentence.'.wrap(10);
  // 'This is a\nlong\nsentence.'
  ```

### `Number.prototype`

#### `pipe(callbackOrCommand)`
Passes the number as an argument to a callback function or pipes its string representation to an external command.
- **`callbackOrCommand`**: (`function`, `string`, or `Array<string>`) A function, a command string, or an array of command arguments.
- **Returns**: (`any` or `string`) The result of the callback function or the stdout of the command. Throws an error if the command fails.
- **Example**:
  ```javascript
  5..pipe(n => n * 2); // 10
  10..pipe('xargs echo'); // "10\n"
  ```

#### `log()`
Prints the number to standard output and then returns the number. Useful for chaining.
- **Returns**: (`number`) The original number.
- **Example**:
  ```javascript
  123..log(); // Prints 123, returns 123
  ```

---

## `colorPicker.js`

This module provides a terminal-based interactive color picker.

### Functions

#### `colorPicker()`
Launches an interactive full-screen terminal UI for selecting colors. Users can navigate hues, saturations, and values, and choose between RGB, HSV, HSL, or HEX output formats.
- **Returns**: (`object`) An object containing the selected color in various formats:
  - `selectedType`: (`string`) The format selected by the user ('rgb', 'hsv', 'hex', 'hsl').
  - `hsv`: (`object`) `{ h: number, s: number, v: number }`
  - `rgb`: (`object`) `{ r: number, g: number, b: number }`
  - `hex`: (`string`) Hexadecimal color string (e.g., '#RRGGBB').
  - `hsl`: (`object`) `{ h: number, s: number, l: number }`
- **Example**:
  ```javascript
  const color = colorPicker();
  print(`You selected: ${color.selectedType} value: ${color[color.selectedType]}`);
  ```

---

## `csvParser.js`

This module provides utility functions for converting between different CSV data representations.

### Functions

#### `csvArrayToCsvJson(array, delimiter = ',')`
Converts an array of arrays (CSV array format) to an array of objects (CSV JSON format). It infers headers from the first sub-array.
- **`array`**: (`Array<Array<string>>`) The input CSV data as an array of arrays.
- **`delimiter`**: (`string`, optional) The delimiter (not directly used in this method, but might be relevant in internal parsing steps). Defaults to `,`.
- **Returns**: (`Array<object>`) The converted data in CSV JSON format.
- **Example**:
  ```javascript
  const csvArray = [['name', 'age'], ['Alice', '30']];
  csvArrayToCsvJson(csvArray); // [{ name: 'Alice', age: '30' }]
  ```

#### `csvArrayToCsvText(array, delimiter = ',')`
Converts an array of arrays (CSV array format) or an array of objects (CSV JSON format) into a raw CSV text string. Handles quoting and escaping for delimiters, quotes, and newlines.
- **`array`**: (`Array<Array<string>>` or `Array<object>`) The input CSV data.
- **`delimiter`**: (`string`, optional) The delimiter character. Defaults to `,`.
- **Returns**: (`string`) The CSV formatted string.
- **Example**:
  ```javascript
  const csvArray = [['Header1', 'Header2'], ['Value A', 'Value "B"']];
  csvArrayToCsvText(csvArray); // "Header1,Header2\n"Value A","Value ""B"""
  ```

#### `csvTextToCsvArray(csvText, delimiter = ',')`
Parses a CSV text string into an array of arrays. Handles quoted fields and escaped quotes.
- **`csvText`**: (`string`) The input CSV data as a string.
- **`delimiter`**: (`string`, optional) The delimiter character. Defaults to `,`.
- **Returns**: (`Array<Array<string>>`) The parsed data as an array of arrays.
- **Example**:
  ```javascript
  const csvString = '"Name","Age"\n"Alice","30"';
  csvTextToCsvArray(csvString); // [['Name', 'Age'], ['Alice', '30']]
  ```

#### `csvTextToCsvJson(csvText, delimiter = ',')`
Parses a CSV text string into an array of objects. It uses the first line as headers.
- **`csvText`**: (`string`) The input CSV data as a string.
- **`delimiter`**: (`string`, optional) The delimiter character. Defaults to `,`.
- **Returns**: (`Array<object>`) The parsed data as an array of objects.
- **Example**:
  ```javascript
  const csvString = 'name,age\nAlice,30\nBob,25';
  csvTextToCsvJson(csvString); // [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]
  ```

#### `csvJsonToCsvText(csvJson)`
Converts an array of objects (CSV JSON format) into a raw CSV text string.
- **`csvJson`**: (`Array<object>`) The input CSV data as an array of objects.
- **Returns**: (`string`) The CSV formatted string.
- **Example**:
  ```javascript
  const csvJson = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }];
  csvJsonToCsvText(csvJson); // "name,age\nAlice,30\nBob,25"
  ```

#### `csvJsonToCsvArray(csvJson)`
Converts an array of objects (CSV JSON format) into an array of arrays (CSV array format). It infers headers from all unique keys in the objects and sorts them.
- **`csvJson`**: (`Array<object>`) The input CSV data as an array of objects.
- **Returns**: (`Array<Array<string>>`) The converted data as an array of arrays.
- **Example**:
  ```javascript
  const csvJson = [{ name: 'Alice', age: 30 }, { age: 25, name: 'Bob' }];
  csvJsonToCsvArray(csvJson); // [['age', 'name'], ['30', 'Alice'], ['25', 'Bob']]
  ```

---

## `draw.js`

This module provides functions for drawing various text-based UI elements in the terminal.

### Functions

#### `table(data, columns)`
Generates a formatted text table.
- **`data`**: (`Array<object>` or `object`) An array of objects where each object is a row, or a single object to display its key-value pairs.
- **`columns`**: (`Array<string>`, optional) An array of column headers to include. If not provided, it infers them from the data.
- **Returns**: (`string`) A string representing the formatted table.
- **Throws**: (`TypeError`) If `data` is not an array or object, or if `columns` is not an array.
- **Example**:
  ```javascript
  const userData = [{ name: 'Alice', age: 30 }, { name: 'Bob', city: 'NY' }];
  print(draw.table(userData, ['name', 'age', 'city']));
  // ╔═══════╤═════╤══════╗
  // ║ name  │ age │ city ║
  // ╟───────┼─────┼──────╢
  // ║ Alice │ 30  │      ║
  // ║ Bob   │     │ NY   ║
  // ╚═══════
