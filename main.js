import { printf } from "../qjs-ext-lib/src/std.js"
import { isatty } from "../qjs-ext-lib/src/os.js"
import { version } from "../qjs-ext-lib/src/version.js"
import "extension.js"
const args = scriptArgs.slice(1);
const scriptPath = args[0];

const [st, err] = scriptPath ? os.stat(scriptPath) : [null, -1];

globalThis.__version = "1.16.0"

try {
  if (!err && (st.mode & os.S_IFMT) === os.S_IFREG) {
    const file = std.open(scriptPath, 'r');
    if (!file) throw new Error(`Could not open file: ${scriptPath}`);
    const fileContent = file.readAsString();
    file.close();
    std.evalScript(fileContent);

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
      globalThis.__update = __update

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
    await std.evalScript(expression, { backtrace_barrier: true, async: true });
  }
} catch (error) {
  std.err.puts(
    `${error.constructor.name}: ${error.message}\n${error.stack}`,
  );
}

async function __update() {
  const stopLoader = render.loader()
  const latest = (exec("curl -s https://api.github.com/repos/5hubham5ingh/js-util/releases/latest")).parseJson();
  await stopLoader()
  const newVersionDownloadUrl = latest.assets[0].browser_download_url;
  const latestVersion = newVersionDownloadUrl.split("/").at(-2).slice(1);
  if (!version.isSemver(latestVersion)) {
    print(("Error: Failed to parse version for the latest release from GitHub.\nUnexpected format detected: " + latestVersion).style("red"));
    return
  }
  print(("Detected latest available version: " + latestVersion).style('green'));
  let currentVersion
  try {
    currentVersion = exec("js '__version.log()'")
  } catch (e) {
    print(["'js' not found.", "It seems 'js' is not installed or not in your system's PATH. Please install it first or ensure it's accessible."].join('\n').style('red'));
  }
  if (!version.isSemver(currentVersion)) {
    print(`Error: Failed to parse the currently installed 'js' version: ${currentVersion}`.style('red'));
    return
  }
  if (!version.isSemver(latestVersion)) {
    print(`Failed to parse latest version of 'js': ${latestVersion}`.style('red'))
    return
  }
  print("Currently installed 'js' version: ", currentVersion);

  if (version.gt(latestVersion, currentVersion)) {
    print("An update is available!");
    print(" Release note ".style("#000000", "bg-grey"))
    render.pages(latest.body)
    if (!enquire.confirm("Initiate upgrade to '" + latestVersion + "' ?")) return;
    const installationDir = (exec("whereis js"))?.split(" ")[1]?.trim();
    print("Identified current 'js' installation path: ", installationDir);
    const newReleasePackageName = newVersionDownloadUrl.split('/').at(-1);
    const packageDestinationDir = os.getcwd()[0] + "/" + "js";
    print(`Downloading new release package: '${newReleasePackageName}' to temporary location: '${packageDestinationDir}' (saved as 'js'). This might take a moment...`);
    if (os.exec(["curl", "-o", packageDestinationDir, "-L", newVersionDownloadUrl])) {
      print(["Download failed.", "Failed to download the new 'js' release.", " Please ensure 'curl' is installed on your system and you have an active internet connection."].join('\n').style('red'));
      return
    }
    print("Download complete. Package saved successfully.");

    print("Moving the new 'js' binary to its installation directory...");
    if (os.rename("WallRizz", installationDir)) {
      print([`Installation failed.`, `Failed to move the new 'js' executable to '${installationDir}'.`, ` This usually happens due to insufficient permissions. Please try running 'sudo mv js ${installationDir}' manually for a system-wide installation, or ensure your user has write access to the directory.`].join('\n').style('red'));
      return;
    }
    print("'js' update completed successfully!");
  } else {
    print("'js' is already at the latest version. No update needed at this time.");
  }
}

