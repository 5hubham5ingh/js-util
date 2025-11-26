// global.d.ts
declare global {
  /**
   * Terminal rendering & animation helpers
   */
  const render: {
    /**
     * Clears the entire terminal screen
     *
     * @example
     * render.clearScreen();
     */
    clearScreen(): void;

    /**
     * Draws a full-width horizontal divider line
     *
     * @example
     * render.line();           // ────────────────────────────────
     * render.line("red");      // (in red)
     *
     * @param style - Color/style name to apply (default: "grey")
     */
    line(style?: string): void;

    /**
     * Starts a visual section with a top border
     *
     * @example
     * render.startSection("blue");
     * ╔══════════════════════════════════════╗
     */
    startSection(style?: string): void;

    /**
     * Ends a visual section with a bottom border
     *
     * @example
     * render.endSection("blue");
     * ╚══════════════════════════════════════╝
     */
    endSection(style?: string): void;

    /**
     * Displays an animated loader or a spinner if message is passed.
     *
     * @example
     * const stop = render.loader("Installing dependencies...");
     * //
     * // later...
     * await stop();
     *
     * @param message - Optional text to show next to the spinner
     * @returns callback Promise which resolves with stoped loader
     */
    loader(message?: string): () => Promise<void>;

    /**
     * Pagers through long multi-line content with navigation
     *
     * @example
     * render.pages(longHelpText);
     *
     * @param content - Text to display
     * @param pageHeight - Optional max lines per page (defaults to ~half screen)
     */
    pages(content: string, pageHeight?: number): void;

    /**
     * Renders animated or static progress bars for multiple levels
     *
     * @example
     * render.levels([[30, 100, "Health"], [75, 100, "Mana"]]);
     * render.levels(levels, false); // static, no animation
     *
     * @param levels - Array of [current, max, title] tuples
     * @param animate - Whether to animate the fill (default: true)
     */
    levels(levels: [number, number, string][], animate?: boolean): void;

    /**
     * Starts a large animated countdown timer using block digits
     *
     * @example
     * const stop = render.timer(Date.now() + 10..seconds); // 10 seconds
     *
     * @param till - Timestamp (ms) to count down to
     * @returns Function to stop the timer early
     */
    timer(till: number): () => void;
  };

  /**
   * Fancy drawing & layout utilities
   */
  const draw: {
    /**
     * Wraps text in a styled box border
     *
     * @example
     * draw.border("Hello\nWorld");
     * // ┌───────┐
     * // │ Hello │
     * // │ World │
     * // └───────┘
     *
     * @param str - Text to wrap (supports \n)
     * @param type - Border style: "normal" | "thick" | "double" | "rounded" | "hidden"
     * @param style - Color/style for the border lines
     * @param padX - Horizontal inner padding (default: 1)
     * @param padY - Vertical inner padding (default: 0)
     * @returns Fully bordered string
     */
    border(
      str: string,
      type?: "normal" | "thick" | "double" | "rounded" | "hidden",
      style?: string,
      padX?: number,
      padY?: number,
    ): string;

    /**
     * Creates a simple auto-aligned table from flat data
     *
     * @example
     * draw.table([["Name", "Age"], ["Alice", "30"], ["Bob", "42"]]);
     * or draw.table([{Name: "Alice", Age: 30},{Name: "Bob", Age: 42}])
     * // ╔═══════╤═════╗
     * // ║ Name  │ Age ║
     * // ╟───────┼─────╢
     * // ║ Alice │ 30  ║
     * // ║ Bob   │ 42  ║
     * // ╚═══════╧═════╝
     *
     * @param data - Flat array (header + row-major cells) or array of objects
     * @param columns - Optional array of column keys when data is objects
     * @returns Multi-line table string
     */
    table(data: any[] | Record<string, any>[], columns?: string[]): string;

    /**
     * Creates multiple static progress bars (same as render.levels but static version exists in draw too)
     *
     * @example
     * draw.levels([[50, 100, "Strength"], [20, 100, "Agility"]]);
     * // Strength ◖██████████████████████████████◗              ◗
     * //
     * // Agility  ◖███████████████◗                             ◗
     *
     * @param levels - Array of [current, max, title]
     * @returns Multi-line string with bars
     */
    levels(levels: [number, number, string][]): string;

    /**
     * Stacks two strings vertically, aligning them left/right/center
     *
     * @example
     * draw.stack('First content'.border(),'Second content.'.border())
     * // ┌───────────────┐
     * // │ First content │
     * // └───────────────┘
     * // ┌─────────────────┐
     * // │ Second content. │
     * // └─────────────────┘
     * //
     * @param firstString - Top string
     * @param secondString - Bottom string
     * @param align - Alignment mode
     * @returns Combined string
     */
    stack(
      firstString: string,
      secondString: string,
      align?: "left" | "right" | "center",
    ): string;

    /**
     * Joins two multi-line strings side-by-side with padding
     *
     * @example
     * draw.join('Test1'.border(),'Text2'.border())
     * // ┌───────┐┌───────┐
     * // │ Test1 ││ Text2 │
     * // └───────┘└───────┘
     *
     * @param firstString - Left block
     * @param secondString - Right block
     * @returns Horizontally concatenated string
     */
    join(firstString: string, secondString: string): string;

    /**
     * Renders a styled message box with label and optional details
     *
     * @example
     * draw.message("ERROR", "Something went wrong", "Check logs", "red");
     *
     * @param label - Bold label in colored tab
     * @param message - Main message text
     * @param details - Optional longer details (auto-wrapped & bordered)
     * @param color - Background color for label tab
     * @returns Full message box string
     */
    message(
      label: string,
      message: string,
      details?: string,
      color?: string,
    ): string;

    /**
     * Renders large block digits (like a digital clock)
     *
     * @example
     * draw.blockDigits("12:45", 2); // 2× scaled
     *
     * @param str - String containing 0-9 . : -
     * @param scale - Vertical & horizontal scale factor (default: 1)
     * @returns Multi-line ASCII art string
     */
    blockDigits(str: string, scale?: number): string;
  };

  /**
   * Interactive prompts & UI components
   */
  const enquire: {
    /**
     * Simple text input prompt
     *
     * @example
     * const name = enquire.ask("What is your name?");
     *
     * @param message - Prompt text
     * @returns User input (trimmed)
     */
    ask(message: string): string;

    /**
     * Yes/No confirmation
     *
     * @example
     * if (enquire.confirm("Delete everything?")) { ... }
     *
     * @param statement - Question text
     * @returns true if user types 'y'
     */
    confirm(statement: string): boolean;

    /**
     * Password / hidden input
     *
     * @example
     * const pass = enquire.secret("Enter password");
     *
     * @param message - Prompt text
     * @returns Hidden input string
     */
    secret(message: string): string;

    /**
     * Single-choice selection menu
     *
     * @example
     * const fruit = enquire.choose(["Apple", "Banana", "Orange"]);
     *
     * @param options - Array of strings
     * @returns Selected option
     */
    choose(options: string[]): string;

    /**
     * Searchable selection menu (type to filter)
     *
     * @example
     * const cmd = enquire.search(commands);
     *
     * @param options - Array of strings
     * @returns Selected option or undefined if none match
     */
    search(options: string[]): string | undefined;

    /**
     * Multi-select menu (space to toggle)
     *
     * @example
     * const selected = enquire.select(["Red", "Green", "Blue"]);
     *
     * @param options - Array of strings
     * @returns Array of selected values
     */
    select(options: string[]): string[];

    /**
     * File/folder picker with navigation
     *
     * @example
     * const path = enquire.pick();
     *
     * @returns Full selected path
     */
    pick(): string;

    /**
     * Multi-line text area (Ctrl+D to finish)
     *
     * @example
     * const desc = enquire.describe("Initial text...");
     *
     * @param buffer - Initial content (default: "")
     * @returns Final text
     */
    describe(buffer?: string): string;

    /**
     * Opens $EDITOR or falls back to describe()
     *
     * @example
     * const config = enquire.edit(existingConfig);
     *
     * @param content - Initial content (default: "")
     * @returns Edited text
     */
    edit(content?: string): string;

    /**
     * Interactive color picker
     *
     * @example
     * const color = enquire.color();
     */
    color(): string;
  };

  const log: {
    /**
     * Logs the message and description with yellow color body
     */
    warn(message: string, description?: string): void;

    /**
     * Logs the message and description with green color body
     */
    info(message: string, description?: string): void;

    /**
     * Logs the message and description with orange color body
     */
    error(message: string, description?: string): void;

    /**
     * Logs the message and description with red color body then quit program
     */
    fatal(message: string, description?: string): void;
  };

  const parser: {
    /**
     * Converts CSV text → Array of arrays (rows)
     *
     * @example
     * parser.csvTextToCsvArray('name,age\n"Alice""",30');
     * // → [["name", "age"], ["Alice\"", "30"]]
     *
     * @param csvText - Raw CSV string
     * @param delimiter - Field separator (default: ",")
     * @returns 2D array of strings
     */
    csvTextToCsvArray(csvText: string, delimiter?: string): string[][];

    /**
     * Converts CSV text → Array of objects (using first row as headers)
     *
     * @example
     * parser.csvTextToCsvJson('name,age\nAlice,30\nBob,25');
     * // → [{ name: "Alice", age: "30" }, { name: "Bob", age: "25" }]
     *
     * @param csvText - Raw CSV string
     * @param delimiter - Field separator (default: ",")
     * @returns Array of objects
     */
    csvTextToCsvJson(
      csvText: string,
      delimiter?: string,
    ): Record<string, string>[];

    /**
     * Converts Array of arrays (rows)  → CSV text
     *
     * @example
     * parser.csvArrayToCsvText([["name", "age"], ["Alice", 30]]);
     * // → "name,age\nAlice,30"
     *
     * @param array - Data as 2D array or array of objects
     * @param delimiter - Field separator (default: ",")
     * @returns CSV string
     */
    csvArrayToCsvText(array: any[][], delimiter?: string): string;

    /**
     * Converts Array of arrays (rows)  → Array of objects (CSV JSON)
     *
     * @example
     * parser.csvArrayToCsvJson([["name", "age"], ["Alice", 30]]);
     * // → [{ name: "Alice", age: "30" }]
     *
     * @param array - Data as 2D array or array of objects
     * @param delimiter - Only used when converting via text intermediate
     * @returns Array of objects
     */
    csvArrayToCsvJson(
      array: any[][],
      delimiter?: string,
    ): Record<string, string>[];

    /**
     * Converts Array of objects → CSV text
     *
     * @example
     * parser.csvJsonToCsvText([{ name: "Alice", age: 30 }, { name: "Bob" }]);
     * // → "age,name\n30,Alice\n,Bob"
     *
     * @param csvJson - Array of objects
     * @returns CSV string
     */
    csvJsonToCsvText(csvJson: Record<string, any>[]): string;

    /**
     * Converts Array of objects → Array of rows (headers in first row)
     *
     * @example
     * parser.csvJsonToCsvArray([{ name: "Alice", age: 30 }]);
     * // → [["age", "name"], ["30", "Alice"]]
     *
     * @param csvJson - Array of objects
     * @returns Array or rows with headers as first row
     */
    csvJsonToCsvArray(csvJson: Record<string, any>[]): any[][];

    /**
     * Parses INI-formatted text into a nested JavaScript object
     *
     * @example
     * const config = parser.ini(`
     *   debug = true
     *   port = 8080
     *
     *   [database]
     *   host = "localhost"
     *   port = 5432
     *   enabled = false
     * `);
     * // → { debug: true, port: 8080, database: { host: "localhost", port: 5432, enabled: false } }
     *
     * @param content - Full INI file content as string
     * @param options - Parsing options
     * @param options.preserveCase - Keep original key/section case (default: false → lowercase)
     * @param options.allowDuplicates - Store duplicate keys as arrays (default: false)
     * @param options.parseValues - Auto-convert strings to boolean/number/null (default: true)
     * @param options.includeComments - Store comments as _comments arrays (default: false)
     * @param options.commentChars - Characters that start comments (default: [';', '#'])
     * @returns Nested object representing the INI structure
     */
    ini(
      content: string,
      options?: {
        preserveCase?: boolean;
        allowDuplicates?: boolean;
        parseValues?: boolean;
        includeComments?: boolean;
        commentChars?: string[];
      },
    ): Record<string, any>;

    /**
     * Converts a JavaScript object back into clean INI format
     *
     * @example
     * parser.toIni({
     *   debug: true,
     *   port: 3000,
     *   database: {
     *     host: "127.0.0.1",
     *     port: 5432
     *   }
     * });
     * // → debug=true
     * //   port=3000
     * //
     * //   [database]
     * //   host=127.0.0.1
     * //   port=5432
     *
     * @param obj - Object to convert (sections become [section] blocks)
     * @returns Properly formatted INI string with sections and blank lines
     */
    toIni(obj: Record<string, any>): string;

    /**
     * Parses TOML-formatted text into a JavaScript object
     *
     * Supports: basic types, nested tables, dotted keys, arrays, inline tables,
     * array of tables, comments, and proper type inference.
     *
     * @example
     * parser.toml(`
     *   title = "TOML Example"
     *
     *   [owner]
     *   name = "Tom"
     *
     *   [database]
     *   enabled = true
     *   ports = [ 8000, 8001, 8002 ]
     *
     *   [[servers]]
     *   ip = "192.168.1.1"
     * `);
     * // → { title: "TOML Example", owner: { name: "Tom" }, database: { enabled: true, ports: [8000,8001,8002] }, servers: [{ ip: "192.168.1.1" }] }
     *
     * @param content - Full TOML document as string
     * @returns Parsed JavaScript object
     */
    toml(content: string): Record<string, any>;

    /**
     * Converts a JavaScript object into clean, readable TOML format
     *
     * Supports: nested tables, arrays, inline tables, array of tables,
     * proper quoting, and correct section ordering.
     *
     * @example
     * parser.toToml({
     *   title: "My App",
     *   database: { enabled: true, ports: [8000, 8001] },
     *   servers: [{ ip: "10.0.0.1" }, { ip: "10.0.0.2" }]
     * });
     * // → title = "My App"
     * //   [database]
     * //   enabled = true
     * //   ports = [ 8000, 8001 ]
     * //
     * //   [[servers]]
     * //   ip = "10.0.0.1"
     * //
     * //   [[servers]]
     * //   ip = "10.0.0.2"
     *
     * @param tomlObj - Object to serialize
     * @returns Properly formatted TOML string
     */
    toToml(tomlObj: Record<string, any>): string;
  };

  // ------------ globalThis -----------------------
  // ──────────────────────────────────────────────────────────────
  // Object.prototype extensions
  // ──────────────────────────────────────────────────────────────
  interface Object {
    /** Pretty-print object to console and return it */
    log(): this;

    /** Convert to pretty JSON string */
    stringify(
      replacer?: (key: string, value: any) => any,
      space?: number,
    ): string;

    /** Pipe value into a function or external command */
    pipe(cb: ((input: this) => any) | string | string[]): any;

    /** Object.entries(this) */
    entries(): [string, any][];

    /** Object.keys(this) */
    keys(): string[];

    /** Object.values(this) */
    values(): any[];

    /** Object.assign(this, source) */
    assign(source: any): this;

    /** Render as table using draw.table */
    table(columns?: string[]): string;

    /** Convert object to INI string */
    toIni(): string;

    /** Convert object to TOML string */
    toToml(): string;
  }

  // ──────────────────────────────────────────────────────────────
  // Array.prototype extensions
  // ──────────────────────────────────────────────────────────────
  interface Array<T> {
    /** Pretty-print array and return it */
    log(): this;

    /** Convert to pretty JSON */
    stringify(replacer?: any, space?: number): string;

    /** for-of loop with return this (chainable) */
    for(cb: (item: T) => void): this;

    /** Remove one occurrence of each item */
    remove(...items: T[]): this;

    /** Remove all occurrences of each item */
    removeAll(...items: T[]): this;

    /** Convert array to CSV text */
    toCsvText(delimiter?: string): string;

    /** Convert array of objects → 2D array */
    toCsvArray(): any[][];

    /** Convert array → CSV JSON */
    toCsvJson(delimiter?: string): Record<string, string>[];

    /** Execute array as shell command */
    exec(): string;

    /** Execute array as async shell command */
    execAsync(): Promise<string>;
  }

  // ──────────────────────────────────────────────────────────────
  // String.prototype extensions (your masterpiece!)
  // ──────────────────────────────────────────────────────────────
  interface String {
    /** Pretty-print string */
    log(): this;

    /** Extract body slice(start, end, line?, word?) */
    body(start?: number, end?: number, line?: number, word?: number): string;

    /** Write string to file */
    write(path: string, mode?: string): this;

    /** Parse JSON string */
    parseJson(): any;

    /** Parse CSV text → 2D array */
    toCsvArray(delimiter?: string): string[][];

    /** Parse CSV text → array of objects */
    toCsvJson(delimiter?: string): Record<string, string>[];

    /** Parse INI string */
    parseIni(options?: any): Record<string, any>;

    /** Parse TOML string */
    parseToml(): Record<string, any>;

    /** Execute string as shell command */
    exec(): string;

    /** Execute string as async command */
    execAsync(): Promise<string>;

    /** Split into lines */
    lines(): string[];

    /** Split into words */
    words(): string[];

    /** Apply ANSI styles */
    style(styles: string | string[]): string;

    /** Remove ANSI codes */
    stripStyle(): string;

    /** Remove emojis */
    stripEmojis(): string;

    /** Wrap with draw.border */
    border(type?: string, style?: string, padX?: number, padY?: number): string;

    /** Remove box-drawing characters */
    stripBorder(): string;

    /** Evaluate string as JS code */
    eval(): any;

    /** Horizontal join with another string */
    join(second: string): string;

    /** Vertical stack with another string */
    stack(second: string, align?: "left" | "right" | "center"): string;

    /** Split into chunks of max length */
    chunks(size: number): string[];

    /** Word-wrap text */
    wrap(maxLength?: number, byWords?: boolean): string;

    /** Align text (center/right) */
    align(alignment: "center" | "right", width?: number): string;

    /** Smart padEnd that respects ANSI codes */
    padEnd2(maxLength: number, fillString?: string): string;

    /** Smart padStart that respects ANSI codes */
    padStart2(maxLength: number, fillString?: string): string;
  }

  // ──────────────────────────────────────────────────────────────
  // Number.prototype extensions (time literals!)
  // ──────────────────────────────────────────────────────────────
  interface Number {
    log(): this;

    /** Convert number to milliseconds */
    readonly seconds: number;

    /** Convert number to milliseconds */
    readonly minutes: number;

    /** Convert number to milliseconds */
    readonly hours: number;

    /** Convert number to milliseconds */
    readonly days: number;

    /** Convert number to milliseconds */
    readonly weeks: number;
  }

  // ──────────────────────────────────────────────────────────────
  // Utility functions
  // ──────────────────────────────────────────────────────────────
  /** Get file/directory stats with rich info */
  function stat(path: string): {
    isDir: boolean;
    isFile: boolean;
    isLink: boolean;
    size: { bytes: number; kb: number; mb: number; gb: number };
    changedAt: Date;
    modifiedAt: Date;
  };

  /** Recursively create directory */
  function ensureDir(dir: string): void;

  /**
   * Run a command and return its stdout
   *
   * @param {string[]|string} cmdline - command line to execute. If a {string} is passed, it will be splitted into a {string[]}
   * @param {object} [opt] - options
   * @param {boolean} [opt.usePath=true] - if {true}, the file is searched in the PATH environment variable (default = {true})
   * @param {string} [opt.cwd] - set the working directory of the new process
   * @param {number} [opt.uid] - if defined, process uid will be set using setuid
   * @param {number} [opt.gid] - if defined, process gid will be set using setgid
   * @param {object} [opt.env] - define child process environment (if not defined, use the environment of parent process)
   * @param {boolean} [opt.replaceEnv=true] - if {true}, ignore parent environment when setting child environment (default = {true})
   * @param {boolean} [opt.useShell=false] - if {true}, run command using '/bin/sh -c' (default = {false})
   * @param {string} [opt.shell="/bin/sh"] - full path to shell (default = '/bin/sh', ignored if {opt.useShell} is {false})
   * @param {boolean} [opt.newSession=false] - if {true} setsid will be used (ie: child will not receive SIGINT sent to parent) (default = {false})
   * @param {boolean} [opt.passStderr=false] - if {true} stderr will not be intercepted (default = {false}) (ignored if {opt.streamStdout} is {false})
   * @param {boolean} [opt.redirectStderr=false] - if {true} stderr will be redirected to stdout (default = {false})
   *                                               Ignored if {opt.passStderr} is {true} or {opt.streamStdout} is {false}
   * @param {boolean} [opt.streamStdout=true] - whether or not streaming should be enabled (default = {true})
   *                                            NB: when set to {false}
   *                                              - stderr redirection will be ignored
   *                                              - {opt.passStderr} will be ignored
   * @param {boolean} [opt.lineBuffered=false] - if {true} call stdout & stderr event listeners only after a line is complete (default = {false})
   * @param {boolean} [opt.trim=true] - if {true} stdout & stderr content will be trimmed (default = {true})
   * @param {boolean} [opt.skipBlankLines=false] - if {true} empty lines will be ignored in both stdout & stderr content (default = {false})
   * @param {number} [opt.timeout] - maximum number of seconds before killing child (if {undefined}, no timeout will be configured)
   * @param {number} [opt.timeoutSignal=os.SIGTERM] - signal to use when killing the child after timeout (default = SIGTERM, ignored if {opt.timeout} is not defined)
   * @param {number} [opt.stdin] - if defined, sets the stdin handle used by child process (it will be rewind)
   *                                NB: don't share the same handle between multiple instances
   * @param {string} [opt.input] - content which will be used as input (will be ignored if {stdin} is set)
   * @param {boolean} [opt.ignoreError=false] - if {true} promise will resolve to the content of stdout even if process exited with a non zero code (default = {false})
   * @param {number} [opt.bufferSize=512] - size (in bytes) of the buffer used to read from process stdout & stderr streams (default = {512})
   *
   * @returns {String} content of stdout in case process exited with zero or {opt.ignoreError} is {true}
   * @throws {Error} content of stderr as the message and following extra properties :
   *                 - {state} (as returned by {run})
   */
  function exec(cmdline: string[] | string, opt?: {
    usePath?: boolean;
    cwd?: string;
    uid?: number;
    gid?: number;
    env?: object;
    replaceEnv?: boolean;
    useShell?: boolean;
    shell?: string;
    newSession?: boolean;
    passStderr?: boolean;
    redirectStderr?: boolean;
    streamStdout?: boolean;
    lineBuffered?: boolean;
    trim?: boolean;
    skipBlankLines?: boolean;
    timeout?: number;
    timeoutSignal?: number;
    stdin?: number;
    input?: string;
    ignoreError?: boolean;
    bufferSize?: number;
  }): String;

  /**
   * Run a command and return its stdout
   *
   * @param {string[]|string} cmdline - command line to execute. If a {string} is passed, it will be splitted into a {string[]}
   * @param {object} [opt] - options
   * @param {boolean} [opt.usePath=true] - if {true}, the file is searched in the PATH environment variable (default = {true})
   * @param {string} [opt.cwd] - set the working directory of the new process
   * @param {number} [opt.uid] - if defined, process uid will be set using setuid
   * @param {number} [opt.gid] - if defined, process gid will be set using setgid
   * @param {object} [opt.env] - define child process environment (if not defined, use the environment of parent process)
   * @param {boolean} [opt.replaceEnv=true] - if {true}, ignore parent environment when setting child environment (default = {true})
   * @param {boolean} [opt.useShell=false] - if {true}, run command using '/bin/sh -c' (default = {false})
   * @param {string} [opt.shell="/bin/sh"] - full path to shell (default = '/bin/sh', ignored if {opt.useShell} is {false})
   * @param {boolean} [opt.newSession=false] - if {true} setsid will be used (ie: child will not receive SIGINT sent to parent) (default = {false})
   * @param {boolean} [opt.passStderr=false] - if {true} stderr will not be intercepted (default = {false}) (ignored if {opt.streamStdout} is {false})
   * @param {boolean} [opt.redirectStderr=false] - if {true} stderr will be redirected to stdout (default = {false})
   *                                               Ignored if {opt.passStderr} is {true} or {opt.streamStdout} is {false}
   * @param {boolean} [opt.streamStdout=true] - whether or not streaming should be enabled (default = {true})
   *                                            NB: when set to {false}
   *                                              - stderr redirection will be ignored
   *                                              - {opt.passStderr} will be ignored
   * @param {boolean} [opt.lineBuffered=false] - if {true} call stdout & stderr event listeners only after a line is complete (default = {false})
   * @param {boolean} [opt.trim=true] - if {true} stdout & stderr content will be trimmed (default = {true})
   * @param {boolean} [opt.skipBlankLines=false] - if {true} empty lines will be ignored in both stdout & stderr content (default = {false})
   * @param {number} [opt.timeout] - maximum number of seconds before killing child (if {undefined}, no timeout will be configured)
   * @param {number} [opt.timeoutSignal=os.SIGTERM] - signal to use when killing the child after timeout (default = SIGTERM, ignored if {opt.timeout} is not defined)
   * @param {number} [opt.stdin] - if defined, sets the stdin handle used by child process (it will be rewind)
   *                                NB: don't share the same handle between multiple instances
   * @param {string} [opt.input] - content which will be used as input (will be ignored if {stdin} is set)
   * @param {boolean} [opt.ignoreError=false] - if {true} promise will resolve to the content of stdout even if process exited with a non zero code (default = {false})
   * @param {number} [opt.bufferSize=512] - size (in bytes) of the buffer used to read from process stdout & stderr streams (default = {512})
   *
   * @returns {Promise<string>} promise which will resolve to the content of stdout in case process exited with zero or {opt.ignoreError} is {true}
   * @throws {Error} content of stderr as the message and following extra properties :
   *                 - {state} (as returned by {run})
   */
  function execAsync(cmdline: string[] | string, opt?: {
    usePath?: boolean;
    cwd?: string;
    uid?: number;
    gid?: number;
    env?: object;
    replaceEnv?: boolean;
    useShell?: boolean;
    shell?: string;
    newSession?: boolean;
    passStderr?: boolean;
    redirectStderr?: boolean;
    streamStdout?: boolean;
    lineBuffered?: boolean;
    trim?: boolean;
    skipBlankLines?: boolean;
    timeout?: number;
    timeoutSignal?: number;
    stdin?: number;
    input?: string;
    ignoreError?: boolean;
    bufferSize?: number;
  }): Promise<string>;

  const read: (path: string) => string;
  const use: (scriptName: string) => void;
  const cd: (dir?: string) => boolean;

  /**
   * setInterval function
   *
   * @param {function} cb
   * @param {number} interval - interval in ms
   *
   * @returns {object} timer handle
   */
  function setInterval(cb: () => {}, interval: number): object;

  /**
   * clearInterval function
   *
   * @param {object} timer - timer
   *
   * @returns {boolean} {true} if timer was found, {false} otherwise
   */
  function clearInterval(timer: object): boolean;

  /**
   * Async wait function
   *
   * @param {number} delay - delay in ms
   *
   * @returns {Promise<void>}
   */
  function wait(delay: number): Promise<void>;

  /** Current working directory */
  const cwd: string;

  /** List directory contents (strings only) */
  const ls: string[];

  /** List directory with rich stat info attached to each entry */
  const lsStat: (string & {
    isDir: boolean;
    isFile: boolean;
    isLink: boolean;
    size: number;
    accessedAt: Date;
    changedAt: Date;
    modifiedAt: Date;
  })[];

  /** Full stdin content (cached) */
  const stdin: string;
}

// Required for global augmentation to work
export {};
