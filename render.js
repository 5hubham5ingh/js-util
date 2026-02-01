import {
  clearScreen as clear,
  cursorDown,
  cursorHide,
  cursorShow,
  cursorUp,
  eraseDown,
} from "./cursor.js";
import {
  getTerminalSize,
  handleKeysPressSync,
  keySequences,
} from "./terminal.js";
import { printf } from "std";
import { ttySetRaw } from "../qjs-ext-lib/src/os.js";
import { clearInterval, setInterval } from "../qjs-ext-lib/src/timers.js";

export const loader = (message) => {
  if (message && typeof message !== "string") {
    throw TypeError('The "message" argument be of type "string".');
  }

  const worker = new os.Worker("./worker.js");

  const [terminalWidth, _] = getTerminalSize() || [80, 30];

  const frames = message
    ? ["◜", "◝", "◞", "◟"].map((stateSymbol) =>
      `${stateSymbol.style(["bold", "yellow"])} ${message}`
    )
    : ((length = parseInt(terminalWidth / 20)) => {
      const frames = [];
      for (let i = 0; i < length; i++) {
        const frame = new Array(length).fill("●");
        frame[i] = "◖◗";
        frames.push(frame.join("").style(["bold", "yellow"]));
      }
      return [...frames, ...frames.reverse().slice(1)].slice(0, -1)
        .map((frame) => {
          const frameLength = frame.stripStyle().length;
          const padStart = Math.floor((terminalWidth - frameLength) / 2);
          return frame.padStart(padStart + frame.length);
        });
    })();

  worker.postMessage({ type: "start", data: frames });

  return () =>
    new Promise((resolve) => {
      worker.postMessage({ type: "abort" });
      worker.onmessage = (e) => {
        if (e.data === "stopped") {
          worker.onmessage = null;
          os.exec(["stty", "sane"]);
          resolve();
        }
      };
    });
};

export const pages = (content, pageHeight) => {
  if (typeof content !== "string") {
    throw new TypeError('The "content" argument must be a string.');
  }
  if (content.length === 0) {
    throw new Error('The "content" string cannot be empty.');
  }
  if (pageHeight !== undefined && typeof pageHeight !== "number") {
    throw new TypeError(
      'The "pageHeight" argument must be a number if provided.',
    );
  }
  if (pageHeight !== undefined && pageHeight < 1) {
    throw new Error('The "pageHeight" must be a positive number.');
  }

  const [terminalWidth, terminalHeight] = getTerminalSize() || [80, 30];
  if (pageHeight && pageHeight > terminalHeight - 3) {
    pageHeight = terminalHeight - 3;
  }
  const contentWidth = terminalWidth - 4;

  const formattedLines = content.stripEmojis().replace(/\r/g, "").split("\n")
    .flatMap((line) => {
      const strippedLength = line.stripStyle().length;
      if (strippedLength > contentWidth) {
        return line.wrap(contentWidth).split("\n");
      }
      return strippedLength < contentWidth
        ? [line.padEnd(contentWidth + line.length - strippedLength)]
        : [line];
    });

  const maxLinesPerPage = parseInt(pageHeight ?? terminalHeight / 2) - 4;
  const pages = [];
  for (let i = 0; i < formattedLines.length; i += maxLinesPerPage) {
    pages.push(formattedLines.slice(i, i + maxLinesPerPage));
  }

  let currentPage = 0;
  let prevCursorPos;

  const indicatorMaxLength = terminalWidth - 6;
  const shouldUseCompactIndicator = pages.length > indicatorMaxLength;
  const overflowThreshold = indicatorMaxLength - 1;

  const createPageIndicator = () => {
    let dots, activeIndex;

    if (shouldUseCompactIndicator) {
      const isLastPage = currentPage === pages.length - 1;
      const isOverFlowPage = currentPage >= overflowThreshold;

      dots = new Array(indicatorMaxLength).fill("∙");
      if (isOverFlowPage && !isLastPage) {
        activeIndex = indicatorMaxLength - 2;
      } else if (isLastPage) {
        activeIndex = indicatorMaxLength - 1;
      } else {
        activeIndex = currentPage;
      }
    } else {
      dots = new Array(pages.length).fill("∙");
      activeIndex = currentPage;
    }

    dots[activeIndex] = "●";
    const indicator = "◖".style("grey") +
      dots.join("").style(["bold", "#000000", "bg-grey"]) + "◗".style("grey");

    return shouldUseCompactIndicator ? indicator : indicator.padStart(
      Math.floor((terminalWidth - 4 - indicator.stripStyle().length) / 2) +
        indicator.length,
    );
  };

  const renderUI = () => {
    if (prevCursorPos) {
      printf(`${prevCursorPos}${eraseDown}`);
    }

    const page = pages[currentPage];
    const helperText = " Continue:Enter | Navigation:Arrows ".style([
      "#000000",
      "bold",
      "bg-grey",
    ]);
    const content = [
      ...page,
      helperText.padStart(helperText.stripStyle().length + terminalWidth - 13),
    ].join("\n").border("rounded");

    const pageIndicator = createPageIndicator();
    print(content, pageIndicator);
    prevCursorPos = cursorUp(page.length + 4);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      currentPage++;
      renderUI();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      currentPage--;
      renderUI();
    }
  };

  const nextOrQuit = (_, quit) => {
    if (currentPage === pages.length - 1) {
      quit();
      return;
    }
    nextPage();
  };

  printf(cursorHide);
  ttySetRaw();
  renderUI();

  handleKeysPressSync({
    "l": nextPage,
    [keySequences.ArrowRight]: nextPage,
    "h": prevPage,
    [keySequences.ArrowLeft]: prevPage,
    [keySequences.Enter]: nextOrQuit,
    "q": (_, quit) => quit(),
  });
  os.exec(["stty", "sane"]);
  printf(cursorShow);
};

export const levels = (levels, animate = true) => {
  if (!Array.isArray(levels) || levels.length === 0) {
    throw new TypeError('The "levels" argument must be a non-empty array.');
  }
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (!Array.isArray(level) || level.length < 3) {
      throw new Error(
        `Each item in the "levels" array must be an array of at least 3 elements. Invalid item at index ${i}.`,
      );
    }
    const [currentLevel, maxLevel, title] = level;
    if (
      typeof currentLevel !== "number" || typeof maxLevel !== "number" ||
      typeof title !== "string"
    ) {
      throw new TypeError(
        `Invalid data types for item at index ${i}. Expected [number, number, string].`,
      );
    }
    if (currentLevel < 0 || maxLevel <= 0 || currentLevel > maxLevel) {
      throw new Error(
        `Invalid level values at index ${i}. "currentLevel" and "maxLevel" must be positive numbers, and "currentLevel" cannot exceed "maxLevel".`,
      );
    }
  }
  if (typeof animate !== "boolean") {
    throw new TypeError('The "animate" argument must be a boolean.');
  }
  const allFrames = [];
  const maxTitleLength = Math.max(...levels.map((level) => level[2].length));
  for (const [currentLevel, maxLevel, title, desc = false] of levels) {
    const frames = [];
    const start = desc ? maxLevel : 0;
    const end = desc ? currentLevel : currentLevel;
    const step = desc ? -1 : 1;
    for (let i = start; desc ? i >= end : i <= end; i += step) {
      const filled = i > 0 ? "█".repeat(i) : "";
      const emptySpaces = Math.max(0, maxLevel - i - 1);
      const empty = "◗" + " ".repeat(emptySpaces);
      const bar = (filled + empty).style([
        "grey",
        emptySpaces >= 0 ? "bg-white" : "",
      ]);
      frames.push(
        title.padEnd(maxTitleLength + 1) + "◖".style("grey") + bar +
          "◗".style("white"),
      );
    }
    allFrames.push(frames);
  }
  if (!animate) {
    const finalFrames = allFrames.map((frames) => frames[frames.length - 1])
      .join("\n\n");
    print(finalFrames.border());
    return;
  }
  printf(cursorHide);
  ttySetRaw();
  const maxNoOfFrames = Math.max(...allFrames.map((frame) => frame.length));
  let prevCursorPos;
  for (let i = 0; i < maxNoOfFrames; i++) {
    if (prevCursorPos) printf(prevCursorPos);
    // Fixed: Use the last frame when current frame index doesn't exist
    const frames = allFrames.map((frames) =>
      frames[i] || frames[frames.length - 1]
    ).join("\n\n");
    print(frames.border("rounded"));
    os.sleep(700 / maxNoOfFrames);
    prevCursorPos = cursorUp(allFrames.length * 2 + 1) + eraseDown;
  }
  os.exec(["stty", "sane"]);
  printf(cursorShow);
};

export const line = (style = "grey") => {
  const [terminalWidth] = getTerminalSize() || [80, 30];
  "─".repeat(terminalWidth).style(style).log();
};

export const startSection = (style = "grey") => {
  const [terminalWidth] = getTerminalSize() || [80, 30];
  print(("╔" + "═".repeat(terminalWidth - 2) + "╗").style(style));
};

export const endSection = (style = "grey") => {
  const [terminalWidth] = getTerminalSize() || [80, 30];
  print(("╚" + "═".repeat(terminalWidth - 2) + "╝").style(style));
};

export const timer = (till) => {
  print(cursorHide);
  const stop = () => {
    clearInterval(intervalId);
    print(cursorShow, cursorDown(7));
  };
  const intervalId = setInterval(() => {
    const now = Date.now();
    const diff = Math.abs(till - now);

    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");

    const milliseconds = String(Math.floor(diff % 1000 / 10)).padStart(2, "0");

    const timeString = `${hours}:${minutes}:${seconds}:${milliseconds}`;

    const blockNumber = draw.blockDigits(timeString);
    const padStart = Math.abs(
      ((getTerminalSize() || [80])[0] - blockNumber.lines()[0].length) / 2,
    );

    print(
      blockNumber.border("double").lines().map((l) =>
        l.padStart(padStart + l.length)
      ).join("\n"),
      cursorUp(7),
    );

    if (diff < 10) stop();
  }, 10);
  return stop;
};

export const clearScreen = () => printf(clear);

export const heatMap = (data) => draw.heatMap(data).log();

export async function png(pngSource, size, position) {
  pngSource.base64 ??= await execAsync([
    "base64",
    "-w",
    "0",
    pngSource.filePath,
  ], {
    bufferSize: stat(pngSource.filePath).size.bytes,
  });

  if (position) std.out.puts(terminal.cursorTo(position.row, position.column));

  let params = "a=T,f=100"; //'Action=Transfer', 'Format=base64'

  if (size?.columns) params += `,c=${size.columns}`;
  if (size?.rows) params += `,r=${size.rows}`;

  const chunkSize = 4096;
  let offset = 0;

  while (offset < pngSource.base64.length) {
    const chunk = pngSource.base64.substring(offset, offset + chunkSize);
    const more = offset + chunk.length < pngSource.base64.length ? 1 : 0;

    let escapeSequence;
    if (offset === 0) {
      escapeSequence = `\x1b_G${params},m=${more};${chunk}\x1b\\`;
    } else {
      escapeSequence = `\x1b_Gm=${more};${chunk}\x1b\\`;
    }

    std.out.printf(escapeSequence);
    offset += chunk.length;
  }

  std.out.flush();
}

export const heading = (heading, size = 1) =>
  std.out.printf(globalThis[`h${size}`]([heading]));
