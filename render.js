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

function toBase64(str) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i = 0;

  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;

    const idx1 = a >> 2;
    const idx2 = ((a & 3) << 4) | (b >> 4);
    const idx3 = ((b & 15) << 2) | (c >> 6);
    const idx4 = c & 63;

    result += chars[idx1] +
      chars[idx2] +
      (i - 2 < str.length ? chars[idx3] : "=") +
      (i - 1 < str.length ? chars[idx4] : "=");
  }

  return result;
}

export async function png(pngSource, size, position) {
  const filePath = pngSource.filePath;
  const tempFile = filePath.endsWith(".png")
    ? filePath
    : `/tmp/${filePath.split("/").at(-1)}.png`;

  const [_, statErr] = os.stat(tempFile);
  if (statErr) {
    await execAsync(["magick", filePath, "-type", "truecolor", tempFile]);
  }

  if (position) std.out.puts(terminal.cursorTo(position.row, position.column));

  let params = "a=T,t=f,f=100,q=2";
  if (size?.columns) params += `,c=${size.columns}`;
  if (size?.rows) params += `,r=${size.rows}`;

  const encodedPath = toBase64(tempFile);
  std.out.puts(`\x1b_G${params};${encodedPath}\x1b\\`);
  std.out.flush();
}

export const heading = (heading, size = 1) =>
  std.out.printf(globalThis[`h${size}`]([heading]));

export async function gallery(
  pngs,
  {
    gridSize = "4x3",
    onFocus = () => {},
    onSelect = () => {},
    highlightType = "fill",
    origin = "0x0",
    terminalSize,
    cellPadding = { vertical: 1, horizontal: 1 },
    getHiRes = () => {},
  },
) {
  if (!Array.isArray(pngs)) throw TypeError("'pngs' must be an array of png");

  const [originX, originY] = origin ? origin.split("x").map(Number) : [0, 0];
  const [terminalWidth, terminalHeight] = terminalSize
    ? terminalSize.split("x").map(Number)
    : terminal.getTerminalSize();

  const [targetCols, targetRows] = gridSize.split("x").map(Number);
  const cellWidth = Math.floor(terminalWidth / targetCols);
  const cellHeight = Math.floor(terminalHeight / targetRows);

  const usedWidth = cellWidth * targetCols;
  const usedHeight = cellHeight * targetRows;
  const offsetX = originX + Math.floor((terminalWidth - usedWidth) / 2);
  const offsetY = originY + Math.floor((terminalHeight - usedHeight) / 2);

  const coordinates = [];
  for (let row = 0; row < targetRows; row++) {
    for (let col = 0; col < targetCols; col++) {
      const x = offsetX + col * cellWidth;
      const y = offsetY + row * cellHeight;
      coordinates.push([x, y, cellWidth, cellHeight]);
    }
  }

  let currentCell = 0;
  let currentPage = 0;
  let currentHighlight = highlightType;
  const maxCellsInGrid = targetCols * targetRows;
  const totalPages = Math.ceil(pngs.length / maxCellsInGrid);

  const label = () => currentHighlight === "fill" ? "█" : " ";

  const renderHighlight = (cellIndex) => {
    if (cellIndex < 0 || cellIndex >= coordinates.length) return;

    const [x, y, w, h] = coordinates[cellIndex];
    const drawW = Math.floor(w);
    const drawH = Math.floor(h);

    if (drawW <= 0 || drawH <= 0) return;

    std.out.puts(terminal.cursorTo(0, 0), terminal.eraseDown);

    if (currentHighlight !== "fill") {
      const top = "╭" + "─".repeat(Math.max(0, drawW - 2)) + "╮";
      const middle = "│" + " ".repeat(Math.max(0, drawW - 2)) + "│";
      const bottom = "╰" + "─".repeat(Math.max(0, drawW - 2)) + "╯";

      const borderedLines = [top];
      for (let i = 0; i < Math.max(0, drawH - 2); i++) {
        borderedLines.push(middle);
      }
      borderedLines.push(bottom);

      for (let i = 0; i < borderedLines.length; i++) {
        std.out.puts(terminal.cursorTo(x, y + i) + borderedLines[i]);
      }
    } else {
      const row = label().repeat(drawW);
      for (let i = 0; i < drawH; i++) {
        std.out.puts(terminal.cursorTo(x, y + i) + row);
      }
    }
    std.out.flush();
  };

  const renderPage = async () => {
    std.out.puts(terminal.clearTerminal);

    const startIdx = currentPage * maxCellsInGrid;
    const promises = [];

    for (let i = 0; i < maxCellsInGrid; i++) {
      const pngIndex = startIdx + i;
      const coord = coordinates[i];

      if (pngIndex < pngs.length) {
        promises.push(
          render.png(pngs[pngIndex], {
            rows: cellHeight - cellPadding.horizontal * 2,
            columns: cellWidth - cellPadding.vertical * 2,
          }, {
            row: coord[0] + cellPadding.vertical,
            column: coord[1] + cellPadding.horizontal,
          }),
        );
      }
    }

    await Promise.all(promises);

    renderHighlight(currentCell);

    const globalIndex = (currentPage * maxCellsInGrid) + currentCell;
    if (pngs[globalIndex]) {
      onFocus(pngs[globalIndex], globalIndex);
    }
  };

  os.ttySetRaw();
  std.out.puts(terminal.cursorHide);
  try {
    await renderPage();
    let isFullScreen = false;

    const moveSelectionDown = () => {
      if (isFullScreen) return;
      if (currentCell + targetCols < maxCellsInGrid) {
        const nextGlobal = (currentPage * maxCellsInGrid) +
          (currentCell + targetCols);
        if (nextGlobal < pngs.length) {
          currentCell += targetCols;
          renderHighlight(currentCell);
          return onFocus(pngs[nextGlobal], nextGlobal);
        }
      }
    };

    const moveSelectionUp = () => {
      if (isFullScreen) return;
      if (currentCell - targetCols >= 0) {
        currentCell -= targetCols;
        renderHighlight(currentCell);
        const nextGlobal = (currentPage * maxCellsInGrid) + currentCell;
        return onFocus(pngs[nextGlobal], nextGlobal);
      }
    };

    const toggleFullscreen = async () => {
      const globalIndex = (currentPage * maxCellsInGrid) + currentCell;
      if (pngs[globalIndex]) {
        if (isFullScreen = !isFullScreen) {
          print(terminal.enterAlternativeScreen);
          render.png(getHiRes(pngs[globalIndex]) ?? pngs[globalIndex], {
            columns: terminalWidth,
            rows: terminalHeight,
          }, { row: originX, column: originY });
        } else print(terminal.exitAlternativeScreen);
      }
    };

    const moveSelection = async (direction) => {
      if (isFullScreen) return;
      const globalIdx = (currentPage * maxCellsInGrid) + currentCell;

      if (direction === "NEXT") {
        const isLastCellInGrid = currentCell === maxCellsInGrid - 1;
        const isLastImage = globalIdx === pngs.length - 1;

        if (!isLastCellInGrid && !isLastImage) {
          currentCell++;
          renderHighlight(currentCell);
          onFocus(pngs[globalIdx + 1], globalIdx + 1);
        } else if (isLastCellInGrid && currentPage < totalPages - 1) {
          currentPage++;
          currentCell = 0;
          await renderPage();
        }
        return;
      }

      if (direction === "PREV") {
        const isFirstCellInGrid = currentCell === 0;

        if (!isFirstCellInGrid) {
          currentCell--;
          renderHighlight(currentCell);
          onFocus(pngs[globalIdx - 1], globalIdx - 1);
        } else if (isFirstCellInGrid && currentPage > 0) {
          currentPage--;
          currentCell = maxCellsInGrid - 1;
          await renderPage();
        }
        return;
      }
    };

    const nextPage = () => {
      if (isFullScreen || currentPage == totalPages - 1) return;
      currentPage++;
      currentCell = 0;
      return renderPage();
    };

    const prevPage = () => {
      if (isFullScreen || currentPage === 0) return;
      currentPage--;
      currentCell = maxCellsInGrid - 1;
      return renderPage();
    };

    const handleExit = (_, exit) => {
      if (isFullScreen) print(terminal.exitAlternativeScreen);
      exit();
    };

    await terminal.handleKeysPress({
      [terminal.keySequences.ArrowDown]: moveSelectionDown,
      "j": moveSelectionDown,

      [terminal.keySequences.ArrowUp]: moveSelectionUp,
      "k": moveSelectionUp,

      [terminal.keySequences.ArrowRight]: () => moveSelection("NEXT"),
      "l": () => moveSelection("NEXT"),
      [terminal.keySequences.ArrowLeft]: () => moveSelection("PREV"),
      "h": () => moveSelection("PREV"),

      "f": toggleFullscreen,

      "H": prevPage,
      "L": nextPage,

      [terminal.keySequences.Enter]: () => {
        const globalIndex = (currentPage * maxCellsInGrid) + currentCell;
        if (pngs[globalIndex]) {
          return onSelect(pngs[globalIndex], globalIndex);
        }
      },

      [terminal.keySequences.Tab]: () => {
        currentHighlight = currentHighlight === "border" ? "fill" : "border";
        renderHighlight(currentCell);
      },

      "q": handleExit,
    });

  } finally {
    std.out.puts(terminal.clearTerminal);
    print(terminal.cursorShow);
  }
}
