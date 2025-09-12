import { printf } from "../qjs-ext-lib/src/std.js"
import { isatty } from "../qjs-ext-lib/src/os.js"
import { version } from "../qjs-ext-lib/src/version.js"
import "extension.js"
import { cursorShow } from "../justjs/cursor.js"

try { std.loadScript(HOME.concat("/", ".js")) }
catch { }

const args = scriptArgs.slice(1);
const scriptPath = args[0];

const [st, err] = scriptPath ? os.stat(scriptPath) : [null, -1];

Object.defineProperty(globalThis, '__version', {
  get() { print("1.18.0") }
});


try {
  if (!err && (st.mode & os.S_IFMT) === os.S_IFREG) {
    const file = std.open(scriptPath, 'r');
    if (!file) throw new Error(`Could not open file: ${scriptPath}`);
    const fileContent = file.readAsString();
    file.close();
    await std.evalScript(fileContent, { backtrace_barrier: true, async: true });

  } else if (args.length === 0) {
    if (!isatty()) {
      const expression = std.in.readAsString();
      await std.evalScript(expression, { backtrace_barrier: true, async: true });
    } else {
      const __history = [];

      Object.defineProperty(globalThis, 'clear', {
        get() { printf("\x1b[2J\x1b[H"); },
      });
      Object.defineProperty(globalThis, 'redo', {
        get() { return enquire.describe(enquire.search(__history)).eval() }
      })

      while (true) {
        printf("❯ ");
        const expression = std.in.getline();
        if (expression === null) break;
        try { print(await std.evalScript(expression, { backtrace_barrier: true, async: true })) }
        catch (error) { print(error) }
        __history.unshift(expression);
      }
    }
  } else {
    const expression = args.join(' ');
    let runUpdate = false;
    Object.defineProperty(globalThis, '__update', {
      get() { runUpdate = !runUpdate }
    });

    await std.evalScript(expression, { backtrace_barrier: true, async: true });
    if (runUpdate) await update()
  }
} catch (error) {
  os.exec(['stty', 'sane'])
  print(cursorShow)
  std.err.puts(
    `${error.constructor.name.style("#c91d1a")}: ${error.message.style("#FFA07A")}\n${error.stack.style("#C6EFCE")}`,
  );
}

async function update() {
  "Checking for latest release".style("yellow").log()
  const stopLoader = render.loader()
  const latest = (exec("curl -s https://api.github.com/repos/5hubham5ingh/js-util/releases/latest")).parseJson();
  await stopLoader()
  const newVersionDownloadUrl = latest.assets[0].browser_download_url;
  const latestVersion = newVersionDownloadUrl.split("/").at(-2).slice(1);
  if (!version.isSemver(latestVersion)) {
    ("Error: Failed to parse version for the latest release from GitHub.\nUnexpected format detected: " + latestVersion).style("red").log()
  }
  print(("Detected latest available version: " + latestVersion).style('yellow'));
  let currentVersion
  try {
    currentVersion = exec("js '__version'")
  } catch (e) {
    log.fatal(["'js' not found.", "It seems 'js' is not installed or not in your system's PATH. Please install it first or ensure it's accessible."].join('\n'))
  }
  if (!version.isSemver(currentVersion)) {
    log.fatal(`Failed to parse the currently installed 'js' version: ${currentVersion}`)
  }
  if (!version.isSemver(latestVersion)) {
    log.fatal(`Failed to parse latest version of 'js': ${latestVersion}`)
  }
  log.info("Currently installed 'js' version: " + currentVersion)

  if (version.gt(currentVersion, latestVersion)) {
    log.info("An update is available!")
    " Release note ".style(["#000000", "bg-grey"]).log()
    render.pages(latest.body)
    if (!enquire.confirm("Initiate upgrade to '" + latestVersion + "' ?")) return;
    const installationDir = (exec("whereis js"))?.split(" ")[1]?.trim();
    log.info("Identified current 'js' installation path: " + installationDir)
    const newReleasePackageName = newVersionDownloadUrl.split('/').at(-1);
    const packageDestinationDir = os.getcwd()[0] + "/" + "js";
    log.info(`Downloading new release package: '${newReleasePackageName}' to temporary location: '${packageDestinationDir}' (saved as 'js').\nThis might take a moment...`)
    const stopLoader = render.loader()
    if (os.exec(["curl", "-so", packageDestinationDir, "-L", newVersionDownloadUrl])) {
      await stopLoader()
      log.fatal(["Download failed.", "Failed to download the new 'js' release.", " Please ensure 'curl' is installed on your system and you have an active internet connection."].join('\n'))
    }
    await stopLoader()
      `Download complete. Package saved successfully.\nMoving the new 'js' binary to "${installationDir}"`.style("yellow").log()
    if (os.exec(['chmod', '+x', 'js'])) {
      log.fatal("Failed to make 'js' executable\nTry running 'chmod +x js'")
    }
    if (os.rename("js", installationDir)) {
      log.fatal([`Installation failed.`, `Failed to move the new 'js' executable to '${installationDir}'.`, ` This usually happens due to insufficient permissions. Please try running 'sudo mv js ${installationDir}' manually for a system-wide installation, or ensure your user has write access to the directory.`].join('\n'))
    }
    log.info("'js' update completed successfully!")
  } else {
    log.info("'js' is already at the latest version. No update needed at this time.")
  }
}

