import { link } from "./cursor.js";
import { getTerminalSize } from "./terminal.js";

export const table = (data, columns) => {
  if (typeof data !== "object" || data === null) {
    throw TypeError(
      'The "data" argument must be an array or a non-null object.',
    );
  }
  if (columns !== undefined && !Array.isArray(columns)) {
    throw TypeError('The "columns" argument, if provided, must be an array.');
  }

  let table = "";
  const isArray = Array.isArray(data);
  const rows = isArray
    ? data
    : Object.entries(data).map(([key, value]) => ({ key, value }));

  if (!rows.length) {
    table += "╔════╗\n║ [] ║\n╚════╝\n";
    return;
  }

  const keys = columns && columns.length
    ? columns
    : [...new Set(rows.flatMap((row) => Object.keys(row)))];

  const header = [...keys];

  const getString = (v) =>
    v === null ? "null" : v === undefined ? "undefined" : String(v);

  const allRows = [
    header,
    ...rows.map((row) => {
      return keys.map((k) => getString(row[k]));
    }),
  ];

  const colWidths = header.map((_, colIndex) =>
    Math.max(
      ...allRows.map((row) => getString(row[colIndex])?.stripStyle()?.length),
    )
  );

  const pad = (s, i) =>
    getString(s).padEnd(colWidths[i] + s.length - s.stripStyle().length, " ");

  const formatRow = (row) =>
    "║ " + row.map(pad).map((v) => v).join(" │ ") + " ║";

  const makeLine = (left, mid, right, fill) =>
    left +
    colWidths.map((w) => fill.repeat(w + 2)).join(mid) +
    right;

  const top = makeLine("╔", "╤", "╗", "═");
  const separator = makeLine("╟", "┼", "╢", "─");
  const bottom = makeLine("╚", "╧", "╝", "═");

  const lines = [top, formatRow(header), separator];
  allRows.slice(1).forEach((row) => lines.push(formatRow(row)));
  lines.push(bottom);

  table += lines.join("\n");
  return table;
};

export const levels = (levels) => {
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

  const maxTitleLength = Math.max(...levels.map((level) => level[2].length));

  const finalFrames = levels.map(
    ([currentLevel, maxLevel, title, desc = false]) => {
      const finalValue = desc ? currentLevel : currentLevel;
      const filled = finalValue > 0 ? "█".repeat(finalValue) : "";
      const emptySpaces = Math.max(0, maxLevel - finalValue - 1);
      const empty = "◗" + " ".repeat(emptySpaces);
      const bar = (filled + empty).style([
        "grey",
        emptySpaces >= 0 ? "bg-white" : "",
      ]);
      return title.padEnd(maxTitleLength + 1) + "◖".style("grey") + bar +
        "◗".style("white");
    },
  );

  return finalFrames.join("\n\n");
};

export const border = (str, type = "normal", style, padX = 1, padY = 0) => {
  const borderChars = {
    normal: {
      x: "─".style(style),
      y: "│".style(style),
      tl: "┌".style(style),
      tr: "┐".style(style),
      bl: "└".style(style),
      br: "┘".style(style),
    },
    thick: {
      x: "━".style(style),
      y: "┃".style(style),
      tl: "┏".style(style),
      tr: "┓".style(style),
      bl: "┗".style(style),
      br: "┛".style(style),
    },
    double: {
      x: "═".style(style),
      y: "║".style(style),
      tl: "╔".style(style),
      tr: "╗".style(style),
      bl: "╚".style(style),
      br: "╝".style(style),
    },
    rounded: {
      x: "─".style(style),
      y: "│".style(style),
      tl: "╭".style(style),
      tr: "╮".style(style),
      bl: "╰".style(style),
      br: "╯".style(style),
    },
    hidden: {
      x: " ".style(style),
      y: " ".style(style),
      tl: " ".style(style),
      tr: " ".style(style),
      bl: " ".style(style),
      br: " ".style(style),
    },
  };

  const chars = borderChars[type];
  if (!chars) {
    return str;
  }

  const lines = str.split("\n");

  const contentWidth = Math.max(
    0,
    ...lines.map((line) => line.stripStyle().length),
  );

  // return empty box
  if (contentWidth === 0 && lines.length === 1 && lines[0] === "") {
    return `${chars.tl}${chars.tr}\n${chars.bl}${chars.br}`;
  }

  const totalInnerWidth = contentWidth + padX * 2;

  const topBorder = chars.tl + chars.x.repeat(totalInnerWidth) + chars.tr;
  const bottomBorder = chars.bl + chars.x.repeat(totalInnerWidth) + chars.br;

  const verticalPadding =
    (chars.y + " ".repeat(totalInnerWidth) + chars.y + "\n").repeat(padY);
  const horizontalPadding = " ".repeat(padX);

  const middleContent = lines.map((line) =>
    `${chars.y}${horizontalPadding}${line.padEnd(contentWidth + line.length - line.stripStyle().length)
    }${horizontalPadding}${chars.y}`
  ).join("\n");

  return `${topBorder}\n${verticalPadding}${middleContent}\n${verticalPadding}${bottomBorder}`;
};

const ALIGN = {
  LEFT: "left",
  RIGHT: "right",
  CENTER: "center",
};

export const stack = (firstString, secondString, align = ALIGN.LEFT) => {
  const linesFromFirstString = firstString.split("\n");
  const linesFromSecondString = secondString.split("\n");
  const combinedText = [...linesFromFirstString, ...linesFromSecondString];
  const maxLineWidth = Math.max(
    ...combinedText.map((line) => line.stripStyle().length),
  );

  const stackedLines = [];
  switch (align) {
    case ALIGN.LEFT:
      stackedLines.push(
        ...combinedText.map((text) =>
          text.lines().map((line) =>
            line.padEnd(maxLineWidth + line.length - line.stripStyle().length)
          ).join("\n")
        ),
      );
      break;
    case ALIGN.RIGHT:
      stackedLines.push(
        ...combinedText.map((text) =>
          text.lines().map((line) =>
            line.padStart(maxLineWidth + line.length - line.stripStyle().length)
          ).join("\n")
        ),
      );
      break;
    case ALIGN.CENTER:
      stackedLines.push(...combinedText.map((line) => {
        const lineVisibleLength = line.stripStyle().length;
        const gap = maxLineWidth - lineVisibleLength;
        const leftPaddingCount = parseInt(gap / 2);
        const rightPaddingCount = gap - leftPaddingCount;
        return " ".repeat(leftPaddingCount) + line +
          " ".repeat(rightPaddingCount);
      }));
      break;
  }
  return stackedLines.join("\n");
};

export const join = (firstString, secondString) => {
  const linesFromFirstString = firstString.split("\n");
  const linesFromSecondString = secondString.split("\n");

  if (linesFromFirstString.length < linesFromSecondString.length) {
    const maxLineWidth = Math.max(
      ...linesFromFirstString.map((line) => line.stripStyle().length),
    );
    const emptyLine = " ".repeat(maxLineWidth);
    const emptyLines = new Array(
      linesFromSecondString.length - linesFromFirstString.length,
    ).fill(emptyLine);
    linesFromFirstString.push(...emptyLines);
  } else if (linesFromFirstString.length > linesFromSecondString.length) {
    const maxLineWidth = Math.max(
      ...linesFromSecondString.map((line) => line.stripStyle().length),
    );
    const emptyLine = " ".repeat(maxLineWidth);
    const emptyLines = new Array(
      linesFromFirstString.length - linesFromSecondString.length,
    ).fill(emptyLine);
    linesFromSecondString.push(...emptyLines);
  }

  const maxLine = Math.max(
    linesFromSecondString.length,
    linesFromFirstString.length,
  );
  const combinedLines = [];
  for (let i = 0; i < maxLine; i++) {
    combinedLines.push(
      `${linesFromFirstString[i] ?? ""}${linesFromSecondString[i] ?? ""}`,
    );
  }
  return combinedLines.join("\n");
};

export const message = (label, message, details, color = "white") => {
  if (typeof label !== "string" || !label.trim()) {
    throw new TypeError("message(): 'label' must be a non-empty string.");
  }
  if (typeof message !== "string" || !message.trim()) {
    throw new TypeError("message(): 'message' must be a non-empty string.");
  }
  if (details != null && typeof details !== "string") {
    throw new TypeError("message(): 'details' must be a string if provided.");
  }

  const [terminalWidth] = getTerminalSize();
  const formatedLabel = ` ${label}`.style(["bold", "#000000", `bg-${color}`]) +
    "◗".style(color);

  const visualLength = terminalWidth - 3 - formatedLabel.stripStyle().length;
  const formatedMessage = message.wrap(visualLength).lines().map((line) =>
    line.padEnd(visualLength + line.length - line.stripStyle().length).style(
      color,
    )
  ).join("\n");

  const formatedDetail = details?.lines()
    .map((text) =>
      text.wrap(terminalWidth - 6)
        .lines()
        .map((line) =>
          line.padEnd(
            terminalWidth - 6 + line.length - line.stripStyle().length,
          )
        ).join("\n")
    )
    .join("\n")
    ?.border("rounded");

  const finalMessage = [];
  finalMessage.push(formatedLabel + " " + formatedMessage);
  if (details) finalMessage.push(formatedDetail);

  return finalMessage.join("\n").border("rounded", color, 0);
};

export const blockDigits = (str, scale = 1) => {
  const chars = {
    "0": [
      "██████",
      "██  ██",
      "██  ██",
      "██  ██",
      "██████",
    ],
    "1": [
      "  ██  ",
      "  ██  ",
      "  ██  ",
      "  ██  ",
      "  ██  ",
    ],
    "2": [
      "██████",
      "    ██",
      "██████",
      "██    ",
      "██████",
    ],
    "3": [
      "██████",
      "    ██",
      "██████",
      "    ██",
      "██████",
    ],
    "4": [
      "██  ██",
      "██  ██",
      "██████",
      "    ██",
      "    ██",
    ],
    "5": [
      "██████",
      "██    ",
      "██████",
      "    ██",
      "██████",
    ],
    "6": [
      "██████",
      "██    ",
      "██████",
      "██  ██",
      "██████",
    ],
    "7": [
      "██████",
      "    ██",
      "    ██",
      "    ██",
      "    ██",
    ],
    "8": [
      "██████",
      "██  ██",
      "██████",
      "██  ██",
      "██████",
    ],
    "9": [
      "██████",
      "██  ██",
      "██████",
      "    ██",
      "██████",
    ],
    ".": [
      "  ",
      "  ",
      "  ",
      "  ",
      "██",
    ],
    "-": [
      "    ",
      "    ",
      "████",
      "    ",
      "    ",
    ],
    ":": [
      "  ",
      "██",
      "  ",
      "██",
      "  ",
    ],
  };

  // Ensure scale is a positive integer
  const finalScale = Math.max(1, Math.floor(scale));

  const outputLines = [];

  // Loop through each line of the block characters (5 lines total)
  for (let j = 0; j < 5; j++) {
    let line = "";

    // Build the string for the current line by looping through the input string
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const blockChar = chars[char];

      if (blockChar) {
        // Horizontally scale the block character line
        let scaledLinePart = "";
        for (let k = 0; k < blockChar[j].length; k++) {
          scaledLinePart += blockChar[j][k].repeat(finalScale);
        }
        line += scaledLinePart;

        // Add a space between characters
        if (i < str.length - 1) {
          line += " ".repeat(finalScale);
        }
      }
    }

    // Vertically scale the line and add to output
    for (let l = 0; l < finalScale; l++) {
      outputLines.push(line);
    }
  }

  return outputLines.join("\n");
};

export function heatMap(data) {
  if (!data || data.length === 0 || data[0].length === 0) {
    return "";
  }

  // Automatically determine width and height from the data
  const height = data.length;
  const width = Math.max(...data.map((row) => row.length));

  // Resize/interpolate data to fit the original data dimensions (no scaling needed, but keep logic for consistency)
  const resized = resizeData(data, width, height);

  // Find min and max values for normalization
  let min = Infinity;
  let max = -Infinity;
  for (let row of resized) {
    for (let val of row) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  // If all values are the same, return uniform light map
  if (max === min || isNaN(max)) {
    return "⬜".repeat(width) + "\n" +
      ("⬜".repeat(width) + "\n").repeat(height - 1) +
      "⬜".repeat(width);
  }

  const range = max - min;
  const SQUARE = "⬛\uFE0E ";
  // 8 levels of intensity using block characters (light to dark) - green theme
  const levels = [
    "⬜\uFE0E ".style("#2ffc28"), // Empty box for 0
    SQUARE.style("#56fc50"),
    SQUARE.style("#65fc5f"),
    SQUARE.style("#0af702"),
    SQUARE.style("#06a001"),
    SQUARE.style("#057501"),
    SQUARE.style("#034700"),
    SQUARE.style("#012300"),
  ];

  const result = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const value = resized[y][x];
      const normalized = (value - min) / range; // 0 to 1
      const index = Math.min(
        Math.floor(normalized * levels.length),
        levels.length - 1,
      );
      row.push(levels[index]);
    }
    result.push(row.join(""));
  }
  return result.join("\n");

  // Helper: Resize 2D data to target dimensions using bilinear interpolation
  function resizeData(data, targetWidth, targetHeight) {
    const srcHeight = data.length;
    if (srcHeight === 0) return [];
    const srcWidth = data[0].length;

    const result = [];
    for (let y = 0; y < targetHeight; y++) {
      const row = [];
      const srcY = (y / targetHeight) * srcHeight;
      const srcY0 = Math.floor(srcY);
      const srcY1 = Math.min(srcY0 + 1, srcHeight - 1);

      for (let x = 0; x < targetWidth; x++) {
        const srcX = (x / targetWidth) * srcWidth;
        const srcX0 = Math.floor(srcX);
        const srcX1 = Math.min(srcX0 + 1, srcWidth - 1);

        // Handle jagged arrays safely
        const v00 = data[srcY0][srcX0] ?? 0;
        const v01 = data[srcY0][srcX1] ?? 0;
        const v10 = (data[srcY1] ? data[srcY1][srcX0] : data[srcY0][srcX0]) ??
          0;
        const v11 = (data[srcY1] ? data[srcY1][srcX1] : data[srcY0][srcX1]) ??
          0;

        const dx = srcX - srcX0;
        const dy = srcY - srcY0;
        const value = v00 * (1 - dx) * (1 - dy) +
          v01 * dx * (1 - dy) +
          v10 * (1 - dx) * dy +
          v11 * dx * dy;
        row.push(value);
      }
      result.push(row);
    }
    return result;
  }
}

export const url = link
