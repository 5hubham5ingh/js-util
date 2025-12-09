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

    heatMap: typeof draw.heatMap;
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

    /**
     * Creates an ASCII heatmap from a 2D array of values
     *
     * The input data can contain ANY numbers (negative, positive, decimals, large ranges).
     * The function automatically:
     * - Finds the minimum and maximum values
     * - Normalizes everything to 0–1
     * - Maps to 8 intensity levels (light to dark green)
     *
     * Higher values = darker blocks
     *
     * @param {number[][]} data - 2D array of numbers (jagged arrays supported)
     *                            Values can be in ANY range — auto-normalization is applied
     * @returns {string} ASCII heatmap using colored block characters
     */
    heatMap(data: number[][]): string;

    /**
    * Generates a clickable hyperlink for display in a modern terminal emulator.
    *
    * @example
    * const webLink = draw.url("google","https://www.google.com") // Standard web page (secure).
    * const ftpLink = draw.url("File on FTP","ftp://user@server.com/file.zip") // File on an FTP server.
    * const mailLink = draw.url("Contact Support","mailto:support@domain.com") // Opens your default email client to send a message.
    * const fileLink = draw.url("Local Report",`file:///${HOME}/Documents/report.pdf`) // A file on your local computer's hard drive.
    * const sshLink = draw.url("Connect SSH","ssh://user@remote-server") // Opens an SSH client session.
    * @param {string} text - The visible, clickable text that the user will see (the anchor text).
    * @param {string} link - The target URL (Uniform Resource Locator) or URI (Uniform Resource Identifier)
    * that the link should navigate to when clicked. This can be 'http', 'https',
    * 'mailto', 'tel', or any other valid URI scheme.
    * @returns {string} The complete, encoded ANSI/OSC string required to render the clickable link.
    */
    url(text: string, link: string): string;
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
  // String.prototype extensions
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

  // ──────────────────────────────────────────────────────────────
  // os module types
  // ──────────────────────────────────────────────────────────────
  type FileDescriptor = number & { __brand: "FileDescriptor" };
  type Success = 0;
  type NegativeErrno = number;
  type Errno = number;
  type ExitStatus = number;
  type WaitStatus = number;
  type OpenOption = number;
  type Result<T> = T | NegativeErrno;
  type ResultTuple<T> = [T, Success | Errno];
  type Signal = number & { __brand: "Signal" };
  type Pid = number & { __brand: "Pid" };
  type Callback = () => void;
  type TimerHandle = unknown & { __brand: "TimeHandle" };
  type Platform = "linux" | "darwin" | "win32" | "js";
  type WorkerMessage = any;

  interface ExecOptions {
    /**
     * Boolean (default = `true`). If `true`, wait until the process is
     * terminated. In this case, exec return the exit code if positive or the
     * negated signal number if the process was interrupted by a signal. If
     * false, do not block and return the process id of the child.
     */
    block?: boolean;
    /**
     * Boolean (default = `true`). If `true`, the file is searched in the PATH
     * environment variable.
     */
    usePath?: boolean;
    /**
     * String (default = `args[0]`). Set the file to be executed.
     */
    file?: string;
    /**
     * String. If present, set the working directory of the new process.
     */
    cwd?: string;
    /**
     * If present, set the handle in the child for stdin, stdout or stderr.
     */
    stdin?: FileDescriptor;
    /**
     * If present, set the handle in the child for stdin, stdout or stderr.
     */
    stdout?: FileDescriptor;
    /**
     * If present, set the handle in the child for stdin, stdout or stderr.
     */
    stderr?: FileDescriptor;
    /**
     * Object. If present, set the process environment from the object
     * key-value pairs. Otherwise use the same environment as the current
     * process.
     */
    env?: { [key: string]: string };
    /**
     * Integer. If present, the process uid with `setuid`.
     */
    uid?: number;
    /**
     * Integer. If present, the process gid with `setgid`.
     */
    gid?: number;
  }
  type ExecNonBlockingOptions = ExecOptions & { block?: false };
  type ExecBlockingOptions = ExecOptions & { block: true };

  interface Stat {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blocks: number;
    atime: number;
    mtime: number;
    ctime: number;
  }
  const os: {
    /**
     * Open a file. Return a handle or `< 0` if error.
     */
    open(
      filename: string,
      flags?: OpenOption,
      mode?: number,
    ): Result<FileDescriptor>;
    /**
     * ✍️ **Append Mode:** If the file exists, the file pointer is set to the
     * end of the file. All subsequent writes will append data to the end
     * of the file, regardless of any seeks performed.
     */
    O_APPEND: OpenOption;
    /**
     * ✨ **Create File:** If the file specified by the path does not exist,
     * it will be created. This flag requires permission settings (mode) to also be specified.
     */
    O_CREAT: OpenOption;
    /**
     * ⛔ **Exclusive Use:** When used with O_CREAT, it ensures that the file is
     * created and that the caller is the creator. If the file *already exists*,
     * the open call fails. This is often used for creating lock files.
     */
    O_EXCL: OpenOption;
    /**
     * 📖 **Read Only:** The file is opened for reading only.
     */
    O_RDONLY: OpenOption;
    /**
     * ✍️📖 **Read and Write:** The file is opened for both reading and writing.
     */
    O_RDWR: OpenOption;
    /**
     * 🗑️ **Truncate:** If the file exists and is a regular file, and it is
     * opened for writing (O_WRONLY or O_RDWR), its length is truncated to 0.
     */
    O_TRUNC: OpenOption;
    /**
     * ✍️ **Write Only:** The file is opened for writing only.
     */
    O_WRONLY: OpenOption;
    /**
     * (Windows specific) 📝 **Text Mode:** Open the file in text mode. In text mode,
     * carriage return/line feed (CRLF) pairs are translated to a single
     * line feed (LF) on input, and LF is translated to CRLF on output.
     * The default is binary mode.
     */
    O_TEXT: OpenOption;
    /**
     * Close the file handle `fd`.
     */
    close(fd: FileDescriptor): Result<Success>;
    /**
     * Seek in the file. Use `std.SEEK_*` for whence. `offset` is either a
     * number or a bigint. If `offset` is a bigint, a bigint is returned too.
     */
    seek(
      fd: FileDescriptor,
      offset: number,
      whence: number,
    ): Result<number>;
    /**
     * Seek in the file. Use `std.SEEK_*` for whence. `offset` is either a
     * number or a bigint. If `offset` is a bigint, a bigint is returned too.
     */
    seek(
      fd: FileDescriptor,
      offset: bigint,
      whence: number,
    ): Result<bigint>;
    /**
     * Read `length` bytes from the file handle `fd` to the `ArrayBuffer`
     * buffer at byte position `offset`. Return the number of read bytes or
     * `< 0` if error.
     */
    read(
      fd: FileDescriptor,
      offset: number,
      whence: number,
    ): Result<number>;
    /**
     * Read `length` bytes from the file handle `fd` to the `ArrayBuffer`
     * buffer at byte position `offset`. Return the number of read bytes or
     * `< 0` if error.
     */
    read(
      fd: FileDescriptor,
      offset: bigint,
      whence: number,
    ): Result<bigint>;
    /**
     * Write `length` bytes to the file handle `fd` from the ArrayBuffer
     * `buffer` at byte position `offset`. Return the number of written bytes
     * or `< 0` if error.
     */
    write(
      fd: FileDescriptor,
      offset: number,
      whence: number,
    ): Result<number>;
    /**
     * Return `true` is fd is a TTY (terminal) handle.
     */
    isatty(fd: FileDescriptor): boolean;
    /**
     * Return the TTY size as `[width, height]` or `null` if not available.
     */
    ttyGetWinSize(
      fd: FileDescriptor,
    ): [width: number, height: number] | null;
    /**
     * Set the TTY in raw mode.
     */
    ttySetRaw(fd: FileDescriptor): void;
    /**
     * Remove a file. Return 0 if OK or `-errno`.
     */
    remove(filename: string): Result<Success>;
    /**
     * Rename a file. Return 0 if OK or `-errno`.
     */
    rename(filename: string): Result<Success>;
    /**
     * Return `[str, err]` where `str` is the canonicalized absolute pathname
     * of `path` and `err` the error code.
     */
    realpath(filename: string): ResultTuple<string>;
    /**
     * Return `[str, err]` where `str` is the current working directory and
     * `err` the error code.
     */
    getcwd(): ResultTuple<string>;
    /**
     * Change the current directory. Return 0 if OK or `-errno`.
     */
    chdir(): Result<Success>;
    /**
     * Create a directory at `path`. Return 0 if OK or `-errno`.
     */
    mkdir(path: string, mode?: number): Result<Success>;
    /**
     * Return `[obj, err]` where `obj` is an object containing the file status
     * of `path`. `err` is the error code. The following fields are defined in
     * `obj`: `dev`, `ino`, `mode`, `nlink`, `uid`, `gid`, `rdev`, `size`,
     * `blocks`, `atime`, `mtime`, `ctim`e. The times are specified in
     * milliseconds since 1970. `lstat()` is the same as `stat()` excepts that
     * it returns information about the link itself.
     */
    stat(path: string): ResultTuple<Stat>;
    /**
     * Return `[obj, err]` where `obj` is an object containing the file status
     * of `path`. `err` is the error code. The following fields are defined in
     * `obj`: `dev`, `ino`, `mode`, `nlink`, `uid`, `gid`, `rdev`, `size`,
     * `blocks`, `atime`, `mtime`, `ctim`e. The times are specified in
     * milliseconds since 1970. `lstat()` is the same as `stat()` excepts that
     * it returns information about the link itself.
     */
    lstat(path: string): ResultTuple<Stat>;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFBLK: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFCHR: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFDIR: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFIFO: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFLNK: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFMT: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFREG: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_IFSOCK: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_ISGID: number;
    /**
     * Constants to interpret the mode property returned by `stat()`. They
     * have the same value as in the C system header `sys/stat.h`.
     */
    S_ISUID: number;
    /**
     * Change the access and modification times of the file `path`. The times
     * are specified in milliseconds since 1970. Return 0 if OK or `-errno`.
     */
    utimes(
      path: string,
      atime: number,
      mtime: number,
    ): Result<Success>;
    /**
     * Create a link at `linkpath` containing the string `target`. Return 0 if
     * OK or `-errno`.
     */
    symlink(target: string, linkpath: string): Result<Success>;
    /**
     * Return `[str, err]` where `str` is the link target and `err` the error
     * code.
     */
    readlink(path: string): ResultTuple<string>;
    /**
     * Return `[array, err]` where `array` is an array of strings containing
     * the filenames of the directory `path`. `err` is the error code.
     */
    readdir(path: string): ResultTuple<string[]>;
    /**
     * Add a read handler to the file handle `fd`. `func` is called each time
     * there is data pending for `fd`. A single read handler per file handle is
     * supported. Use `func = null` to remove the handler.
     */
    setReadHandler(
      fd: FileDescriptor,
      func: Callback | null,
    ): void;
    /**
     * Add a write handler to the file handle `fd`. `func` is called each time
     * data can be written to `fd`. A single write handler per file handle is
     * supported. Use `func = null` to remove the handler.
     */
    setWriteHandler(
      fd: FileDescriptor,
      func: Callback | null,
    ): void;
    /**
     * Call the  `func` when the signal `signal` happens. Only a single
     * handler per signal number is supported. Use `null` to set the default
     * handler or `undefined` to ignore the signal. Signal handlers can only be
     * defined in the main thread.
     */
    signal(
      signal: Signal,
      func: Callback | null | undefined,
    ): void;
    /**
     * POSIX signal numbers.
     */
    SIGABRT: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGALRM: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGCHLD: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGCONT: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGFPE: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGILL: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGINT: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGPIPE: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGQUIT: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGSEGV: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGSTOP: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGTERM: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGTSTP: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGTTIN: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGTTOU: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGUSR1: Signal;
    /**
     * POSIX signal numbers.
     */
    SIGUSR2: Signal;
    /**
     * Send the signal `sig` to the process `pid`.
     */
    kill(pid: Pid, signal: Signal): Result<number>;
    /**
     * Execute a process with the arguments args.
     */
    exec(
      args: string[],
      options?: ExecBlockingOptions,
    ): Result<ExitStatus>;
    /**
     * Execute a process with the arguments args.
     */
    exec(
      args: string[],
      options: ExecNonBlockingOptions,
    ): Result<Pid>;
    /**
     * `waitpid` Unix system call. Return the array `[ret, status]`. ret
     * contains `-errno` in case of error.
     */
    waitpid(
      pid: Pid,
      options: number,
    ): [ret: Result<Pid | Success>, status: WaitStatus];
    /**
     * Constant for the `options` argument of `waitpid`.
     */
    WNOHANG: number;
    /**
     * `dup` Unix system call.
     */
    dup(fd: FileDescriptor): Result<FileDescriptor>;
    /**
     * `dup2` Unix system call.
     */
    dup2(
      oldFd: FileDescriptor,
      newFd: FileDescriptor,
    ): Result<FileDescriptor>;
    /**
     * `pipe` Unix system call. Return two handles as `[read_fd, write_fd]` or
     * `null` in case of error.
     */
    pipe():
      | [readFd: FileDescriptor, writeFd: FileDescriptor]
      | null;
    /**
     * Sleep during `delay_ms` milliseconds.
     */
    sleep(delay_ms: number): Result<number>;
    /**
     * Call the  func after `delay` ms. Return a handle to the timer.
     */
    setTimeout(func: Callback, delay: number): TimerHandle;
    /**
     * Cancel a timer.
     */
    clearTimeout(handle: TimerHandle): void;
    /**
     * Return a string representing the platform: `"linux"`, `"darwin"`,
     * `"win32"` or `"js"`.
     */
    platform: Platform;
  };

  // ──────────────────────────────────────────────────────────────
  // std module types
  // ──────────────────────────────────────────────────────────────

  /**
   * Represents an open FILE* stream (wrapper around libc FILE)
   */
  interface FILE {
    /** Close the file. Returns 0 on success or `-errno` on error. */
    close(): Result<Success>;

    /** Output a string followed by a newline (UTF-8 encoded). */
    puts(str: string): void;

    /**
     * Formatted printf.
     * Supports standard C printf formats. Integer types truncate to 32-bit
     * unless the `l` modifier is used (for 64-bit).
     */
    printf(format: string, ...args: any[]): number;

    /** Flush buffered output. */
    flush(): void;

    /**
     * Seek in the file. `whence` is one of std.SEEK_SET, SEEK_CUR, SEEK_END.
     * Returns 0 on success or `-errno` on error.
     */
    seek(offset: number, whence: number): Result<Success>;
    seek(offset: bigint, whence: number): Result<Success>;

    /** Return current file position as number. */
    tell(): number;

    /** Return current file position as bigint. */
    tello(): bigint;

    /** Return true if end-of-file reached. */
    eof(): boolean;

    /** Return the underlying OS file descriptor. */
    fileno(): FileDescriptor;

    /** Return true if an error occurred on the stream. */
    error(): boolean;

    /** Clear the error and EOF indicators. */
    clearerr(): void;

    /**
     * Read up to `length` bytes into `buffer` starting at `position`.
     * Returns number of bytes read or 0 on EOF/error.
     */
    read(buffer: ArrayBuffer, position: number, length: number): number;

    /**
     * Write up to `length` bytes from `buffer` starting at `position`.
     * Returns number of bytes written.
     */
    write(buffer: ArrayBuffer, position: number, length: number): number;

    /** Read and return the next line (excluding trailing newline), or null on EOF. */
    getline(): string | null;

    /**
     * Read up to `max_size` bytes and return as UTF-8 string.
     * If `max_size` omitted, reads until EOF.
     */
    readAsString(max_size?: number): string;

    /** Read and return the next byte (-1 on EOF). */
    getByte(): number;

    /** Write a single byte. Returns the byte or -1 on error. */
    putByte(c: number): number;
  }

  interface EvalOptions {
    /** If true, evalScript() will not appear in backtraces below it. */
    backtrace_barrier?: boolean;
  }

  interface UrlGetOptions {
    binary?: boolean;
    full?: boolean;
  }

  interface UrlGetResponse<T> {
    response: T | null;
    status: number;
    responseHeaders: string;
  }

  const std: {
    /** Terminate the process with the given exit status. Never returns. */
    exit(n: ExitStatus): never;

    /** Evaluate a string as global script code. */
    evalScript(str: string, options?: EvalOptions): any;

    /** Load and evaluate a script file (global eval). */
    loadScript(filename: string): any;

    /** Load a file as UTF-8 string. Returns null on I/O error. */
    loadFile(filename: string): string | null;

    /** fopen() wrapper. Returns FILE | null. */
    open(filename: string, flags?: string): FILE | null;

    /** popen() wrapper. Returns FILE | null. */
    popen(command: string, flags: string): FILE | null;

    /** fdopen() wrapper. Returns FILE | null. */
    fdopen(fd: FileDescriptor, flags: string): FILE | null;

    /** tmpfile() wrapper. Returns a new temporary FILE. */
    tmpfile(): FILE;

    /** Convenience: std.out.puts(str) */
    puts(str: string): void;

    /** Convenience: std.out.printf(...) */
    printf(format: string, ...args: any[]): number;

    /** sprintf() equivalent – returns formatted string. */
    sprintf(format: string, ...args: any[]): string;

    /** Standard input stream (stdin). */
    in: FILE;

    /** Standard output stream (stdout). */
    out: FILE;

    /** Standard error stream (stderr). */
    err: FILE;

    /** Seek constants */
    SEEK_SET: number;
    SEEK_CUR: number;
    SEEK_END: number;

    /** Common errno values */
    Error: {
      readonly EACCES: number;
      readonly ENOENT: number;
      readonly EBADF: number;
      readonly ENOSPC: number;
      readonly EBUSY: number;
      readonly ENOSYS: number;
      readonly EEXIST: number;
      readonly EPERM: number;
      readonly EINVAL: number;
      readonly EPIPE: number;
      readonly EIO: number;
    };

    /** Convert errno to human-readable string. */
    strerror(errno: Errno): string;

    /** Force garbage collection (cycle removal). */
    gc(): void;

    /** Get environment variable. */
    getenv(name: string): string | undefined;

    /** Set environment variable. */
    setenv(name: string, value: string): void;

    /** Unset environment variable. */
    unsetenv(name: string): void;

    /** Return full environment as object. */
    getenviron(): { [key: string]: string };

    /**
     * Download URL using curl.
     * Behavior depends on options (see overloads below).
     */
    urlGet(
      url: string,
      options?: UrlGetOptions & { full?: false; binary?: false },
    ): string | null;
    urlGet(
      url: string,
      options: UrlGetOptions & { full?: false; binary: true },
    ): ArrayBuffer | null;
    urlGet(
      url: string,
      options: UrlGetOptions & { full: true; binary?: false },
    ): UrlGetResponse<string>;
    urlGet(
      url: string,
      options: UrlGetOptions & { full: true; binary: true },
    ): UrlGetResponse<ArrayBuffer>;

    /**
     * Extended JSON parser supporting comments, trailing commas,
     * unquoted keys, single-quoted strings, etc.
     */
    parseExtJSON(str: string): any;
  };


  /**
 * A function that, when called, exits the key handling loop.
 */
  type QuitFunction = () => void;

  /**
   * Handler for a specific key sequence.
   *
   * @param sequence The exact escape sequence that was matched
   * @param quit     Call this to exit the key handling loop
   */
  type KeyHandler = (sequence: string, quit: QuitFunction) => void | Promise<void>;

  /**
   * Default handler (called when no exact match is found)
   */
  type DefaultHandler = (sequence: string) => void | Promise<void>;

  /**
   * Object mapping key sequences (or special group names) to handlers.
   *
   * You can use the strings `"capitalLetters"`, `"smallLetters"`, `"numbers"`
   * as keys — they will be automatically expanded to all letters/numbers.
   */
  interface KeyHandlers {
    [key: string]: KeyHandler | "capitalLetters" | "smallLetters" | "numbers";
    /** Optional fallback when no exact match is found */
    default?: DefaultHandler;
  }



  const terminal: {
    keySequences: {
      // Arrow keys
      readonly ArrowUp: "\x1b[A";
      readonly ArrowDown: "\x1b[B";
      readonly ArrowRight: "\x1b[C";
      readonly ArrowLeft: "\x1b[D";

      // Function keys
      readonly F1: "\x1bOP";
      readonly F2: "\x1bOQ";
      readonly F3: "\x1bOR";
      readonly F4: "\x1bOS";
      readonly F5: "\x1b[15~";
      readonly F6: "\x1b[17~";
      readonly F7: "\x1b[18~";
      readonly F8: "\x1b[19~";
      readonly F9: "\x1b[20~";
      readonly F10: "\x1b[21~";
      readonly F11: "\x1b[23~";
      readonly F12: "\x1b[24~";

      // Control keys
      readonly Home: "\x1b[H";
      readonly End: "\x1b[F";
      readonly PageUp: "\x1b[5~";
      readonly PageDown: "\x1b[6~";
      readonly Insert: "\x1b[2~";
      readonly Delete: "\x1b[3~";

      // Special characters
      readonly Space: " ";
      readonly Enter: "\r";
      readonly Escape: "\x1b";
      readonly Tab: "\t";
      readonly ShiftTab: "\x1b[Z";
      readonly Backspace: "\x7F";

      // Ctrl+A to Ctrl+Z
      readonly "Ctrl+A": "\x01";
      readonly "Ctrl+B": "\x02";
      readonly "Ctrl+C": "\x03";
      readonly "Ctrl+D": "\x04";
      readonly "Ctrl+E": "\x05";
      readonly "Ctrl+F": "\x06";
      readonly "Ctrl+G": "\x07";
      readonly "Ctrl+H": "\x08";
      readonly "Ctrl+I": "\x09";
      readonly "Ctrl+J": "\x0A";
      readonly "Ctrl+K": "\x0B";
      readonly "Ctrl+L": "\x0C";
      readonly "Ctrl+M": "\x0D";
      readonly "Ctrl+N": "\x0E";
      readonly "Ctrl+O": "\x0F";
      readonly "Ctrl+P": "\x10";
      readonly "Ctrl+Q": "\x11";
      readonly "Ctrl+R": "\x12";
      readonly "Ctrl+S": "\x13";
      readonly "Ctrl+T": "\x14";
      readonly "Ctrl+U": "\x15";
      readonly "Ctrl+V": "\x16";
      readonly "Ctrl+W": "\x17";
      readonly "Ctrl+X": "\x18";
      readonly "Ctrl+Y": "\x19";
      readonly "Ctrl+Z": "\x1A";

      // Key groups (used as placeholders for bulk mapping)
      readonly capitalLetters: "capitalLetters";
      readonly smallLetters: "smallLetters";
      readonly numbers: "numbers";
    };

    /**
     * Sets up a key press handler for the specified key sequences.
     *
     * @param keysAndCb - An object where keys are key sequences (either from keySequences or custom strings) and values are handler functions.
     *
     * @example
     * handleKeysPress({
     *   'j': () => console.log('j pressed'),
     *   [keySequences.ArrowUp]: () => console.log('Arrow up pressed'),
     *   [keySequences.Enter]: (quit) => { console.log('Enter pressed'); quit(); }
     * });
     *
     * @description
     * - The function sets the terminal to raw mode for direct key input.
     * - It continuously reads input until the quit function is called.
     * - Each key handler receives a `quit` function as an argument, which can be called to exit the handling loop.
     * - The Escape key is treated specially: pressing it twice will terminate the key press handler if no specific Escape handler is provided.
     * - For other keys, their corresponding handler functions are called when the key sequence is matched.
     */
    handleKeysPress(keysAndCb: KeyHandlers): Promise<void>;

    /**
     * Synchronous version of `handleKeysPress`.
     *
     * Identical behavior to `handleKeysPress` but does not support async handlers.
     */
    handleKeysPressSync(keysAndCb: KeyHandlers): void;

    /**
     * Retrieves the current size of the terminal window.
     *
     * @returns An array containing the width and height of the terminal in characters.
     *
     * @description
     * This function attempts to determine the size of the terminal window using the following methods:
     * 1. If the output is connected to a TTY (terminal), it uses the ttyGetWinSize function.
     * 2. If not connected to a TTY, it tries to read the COLUMNS and LINES environment variables.
     * 3. If neither method works, it returns a default size of [50, 10].
     *
     * @example
     * const [width, height] = getTerminalSize();
     * console.log(`Terminal size: ${width}x${height}`);
     */
    getTerminalSize(): [number, number];

    /**
 * Moves cursor to a specific position (zero-based coordinates).
 *
 * @param x Column number (0 = leftmost)
 * @param y Row number (0 = topmost). If omitted, moves to column `x` on current line.
 * @returns ANSI escape sequence
 *
 * @example
 * cursorTo(5, 10);     // → moves to column 5, row 10
 * cursorTo(0);         // → moves to first column of current line
 */
    cursorTo(x: number, y?: number): string;

    /**
     * Moves cursor by offset (relative movement).
     *
     * @param x Positive = right, negative = left
     * @param y Positive = down, negative = up
     * @returns ANSI escape sequence
     *
     * @example
     * cursorMove(5, -2);   // move 5 columns right and 2 rows up
     */
    cursorMove(x: number, y: number): string;

    /**
     * Moves cursor up by count rows.
     * @param count Number of rows (default: 1)
     */
    cursorUp(count?: number): string;

    /**
     * Moves cursor down by count rows.
     * @param count Number of rows (default: 1)
     */
    cursorDown(count?: number): string;

    /**
     * Moves cursor forward (right) by count columns.
     * @param count Number of columns (default: 1)
     */
    cursorForward(count?: number): string;

    /**
     * Moves cursor backward (left) by count columns.
     * @param count Number of columns (default: 1)
     */
    cursorBackward(count?: number): string;

    /**
     * Moves cursor to the leftmost column (column 0).
     */
    cursorLeft: "\u001B[G";

    /**
     * Saves current cursor position.
     */
    cursorSavePosition: "\u001B7";

    /**
     * Restores cursor to the last saved position.
     */
    cursorRestorePosition: "\u001B8";

    /**
     * Requests cursor position report (response comes via stdin as `\u001B[<row>;<col>R`).
     */
    cursorGetPosition: "\u001B[6n";

    /**
     * Moves cursor to the beginning of the next line.
     */
    cursorNextLine: "\u001B[E";

    /**
     * Moves cursor to the beginning of the previous line.
     */
    cursorPrevLine: "\u001B[F";

    /**
     * Hides the cursor.
     */
    cursorHide: "\u001B[?25l";

    /**
     * Shows the cursor.
     */
    cursorShow: "\u001B[?25h";

    /**
     * Erases count lines starting from the current line and moves cursor up.
     * @param count Number of lines to erase
     */
    eraseLines(count: number): string;

    /**
     * Erases from cursor to the end of the line.
     */
    eraseEndLine: "\u001B[K";

    /**
     * Erases from cursor to the start of the line.
     */
    eraseStartLine: "\u001B[1K";

    /**
     * Erases the entire current line.
     */
    eraseLine: "\u001B[2K";

    /**
     * Erases from cursor down to the bottom of the screen.
     */
    eraseDown: "\u001B[J";

    /**
     * Erases from cursor up to the top of the screen.
     */
    eraseUp: "\u001B[1J";

    /**
     * Erases the entire screen (cursor position unchanged).
     */
    eraseScreen: "\u001B[2J";

    /**
     * Scrolls the page up by one line.
     */
    scrollUp: "\u001B[S";

    /**
     * Scrolls the page down by one line.
     */
    scrollDown: "\u001B[T";

    /**
     * Clears the terminal screen (soft reset).
     */
    clearScreen: "\u001Bc";

    /**
     * Fully clears the terminal including scrollback buffer.
     * Behavior differs between platforms.
     */
    clearTerminal: `\u001B[2J\u001B[3J\u001B[H`;

    /**
     * Switches to the alternative screen buffer.
     */
    enterAlternativeScreen: "\u001B[?1049h";

    /**
     * Exits the alternative screen buffer.
     */
    exitAlternativeScreen: "\u001B[?1049l";

    /**
     * Emits a terminal bell (beep).
     */
    beep: "\u0007";

  }

  /**
     * Runs a process.
     * Equivalent to 'exec(command)', runs without an explicit shell wrapper.
     * @example
     * const res = $`ls`
     * @param all - The command and its arguments (strings, numbers, etc.).
     * @returns A Promise resolving to the command execution result.
     */
  function $(
    cmd: string
  ): string;

  /**
   * Runs a command explicitly using the system default shell ('/bin/sh').
   * @example
   * const res = sh`echo 'hi'`
   * @param all - The command and its arguments.
   * @returns A Promise resolving to the command execution result.
   */
  function sh(
    cmd: string
  ): string;

  /**
   * Runs a command explicitly using the Bash shell ('/usr/bin/bash').
   * @example
   * const res = bash`echo 'hi'`
   * @param all - The command and its arguments.
   * @returns A Promise resolving to the command execution result.
   */
  function bash(
    cmd: string
  ): string;
}

// Required for global augmentation to work
export { };
