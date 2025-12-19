import { link } from "./cursor.js";
import { getTerminalSize } from "./terminal.js";

export const table = (data, columns, addSeparator = false) => {
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
    return table;
  }
  const keys = columns && columns.length
    ? columns
    : [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const header = [...keys];

  const getString = (v) =>
    v === null ? "null" : v === undefined ? "undefined" : String(v);

  // Split all cells (header + data rows) into arrays of lines
  const allCellLines = [
    header.map(getString), // header is single-line
    ...rows.map((row) => keys.map((k) => getString(row[k]))),
  ].map((row) => row.map((cell) => cell.split("\n")));

  // Compute column widths: max length of any single line across all cells in that column
  const colWidths = header.map((_, colIndex) =>
    Math.max(
      ...allCellLines.flatMap((row) =>
        row[colIndex].map((line) => line.stripStyle?.()?.length ?? line.length)
      ),
      header[colIndex].stripStyle?.()?.length ?? header[colIndex].length,
    )
  );

  const pad = (line, colIndex) =>
    line.padEnd(
      colWidths[colIndex] + line.length -
        (line.stripStyle?.()?.length ?? line.length),
      " ",
    );

  const makeLine = (left, mid, right, fill) =>
    left +
    colWidths.map((w) => fill.repeat(w + 2)).join(mid) +
    right;

  const top = makeLine("╔", "╤", "╗", "═");
  const separator = makeLine("╟", "┼", "╢", "─");
  const bottom = makeLine("╚", "╧", "╝", "═");

  const lines = [top];

  // Render header (always single line)
  const headerLine = "║ " +
    header.map((h, i) => pad(getString(h), i)).join(" │ ") + " ║";
  lines.push(headerLine);
  lines.push(makeLine("╟", "╪", "╢", "═"));

  // Render data rows
  allCellLines.slice(1).forEach((rowLines) => {
    // Max lines in this logical row
    const maxLinesInRow = Math.max(...rowLines.map((lines) => lines.length), 1);

    for (let lineIdx = 0; lineIdx < maxLinesInRow; lineIdx++) {
      const parts = rowLines.map((cellLines, colIdx) => {
        const line = cellLines[lineIdx] ?? ""; // empty if fewer lines
        return pad(line, colIdx);
      });
      const rowStr = "║ " + parts.join(" │ ") + " ║";
      lines.push(rowStr);
    }
    if(addSeparator) lines.push(separator);
  });

  // Remove the last separator and add bottom
  lines.pop();
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

export const border = (
  str,
  type = "normal",
  style,
  padX = 1,
  padY = 0,
  contentStyle,
) => {
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
    `${chars.y}${horizontalPadding}${
      line.padEnd(contentWidth + line.length - line.stripStyle().length).style(
        contentStyle,
      )
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

  const [terminalWidth] = getTerminalSize() || [80, 30];
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

export const url = link;

export const text = (text, size = 1) => {
  if (typeof text !== "string") {
    throw TypeError("text must be of type 'string'.");
  }
  if (typeof size !== "number" || size > 7 || size < 1) {
    throw TypeError("Invalid size: It must be 1 <= size <= 7");
  }
  return `\x1b]66;s=${size};${text}\x07`;
};

export function justify(textElements, type = "between", width) {
  if (textElements.length === 0) return "";
  if (textElements.length === 1) {
    return textElements[0] + (textElements[0].endsWith("\n") ? "" : "\n");
  }

  // Split every element into its lines (preserve trailing newline if present, but rare)
  const lineArrays = textElements.map((el) => el.split("\n"));

  // Find the maximum number of lines (height of the block)
  const maxLines = Math.max(...lineArrays.map((lines) => lines.length));

  // Pad shorter elements with empty lines at the bottom (top-aligned)
  const padded = lineArrays.map((lines) => {
    if (lines.length < maxLines) {
      return lines.concat(Array(maxLines - lines.length).fill(""));
    }
    return lines;
  });

  // Transpose: build an array of rows, where each row is [line0_of_el0, line0_of_el1, ...]
  const rows = [];
  for (let i = 0; i < maxLines; i++) {
    const rowElements = padded.map((col) => col[i]);
    rows.push(rowElements);
  }

  if (width === undefined) {
    const [termWidth] = getTerminalSize() || [80, 30];
    width = termWidth;
  }

  // For each row, compute its visible length to check overflow
  const rowLengths = rows.map((row) =>
    row.reduce((sum, el) => sum + el.stripStyle().length, 0)
  );

  const maxRowLength = Math.max(...rowLengths);

  let result = "";

  if (maxRowLength > width) {
    // Fallback if any row would overflow: just concatenate with single space between columns
    for (let i = 0; i < maxLines; i++) {
      result += padded.map((col) => col[i]).join(" ") + "\n";
    }
    return result;
  }

  // Otherwise, justify each row independently
  for (const row of rows) {
    // Temporary single-line elements for this row
    const totalLength = row.reduce(
      (sum, el) => sum + el.stripStyle().length,
      0,
    );
    const spaceToDistribute = width - totalLength;

    let line = "";
    if (type === "between") {
      const gaps = row.length - 1;
      if (gaps === 0) {
        line = row[0];
      } else {
        const spacePerGap = Math.floor(spaceToDistribute / gaps);
        const extraSpaces = spaceToDistribute % gaps;
        const baseSpaces = " ".repeat(spacePerGap);

        for (let i = 0; i < row.length; i++) {
          if (i > 0) {
            const extra = i - 1 < extraSpaces ? 1 : 0;
            line += " ".repeat(extra) + baseSpaces;
          }
          line += row[i];
        }
      }
    } else if (type === "around") {
      // Equal padding around each element
      const n = row.length;
      const totalGaps = 2 * n;
      const spacePerSide = Math.floor(spaceToDistribute / totalGaps);
      const extraSpaces = spaceToDistribute % totalGaps;
      const basePadding = " ".repeat(spacePerSide);

      let extraIndex = 0;
      for (let i = 0; i < n; i++) {
        const leftExtra = extraIndex < extraSpaces ? 1 : 0;
        line += " ".repeat(leftExtra) + basePadding;
        extraIndex++;

        line += row[i];

        const rightExtra = extraIndex < extraSpaces ? 1 : 0;
        line += basePadding + " ".repeat(rightExtra);
        extraIndex++;
      }
      // Remove the excess trailing padding after the last element
      const trailingToRemove = basePadding.length +
        (extraIndex - 1 < extraSpaces ? 1 : 0);
      line = line.slice(0, -trailingToRemove);
    } else if (type === "even") {
      // Equal gaps including before first and after last
      const n = row.length;
      const totalGaps = n + 1;
      const spacePerGap = Math.floor(spaceToDistribute / totalGaps);
      const extraSpaces = spaceToDistribute % totalGaps;
      const baseSpaces = " ".repeat(spacePerGap);

      // Leading
      line += baseSpaces + (extraSpaces > 0 ? " " : "");
      let remainingExtras = Math.max(0, extraSpaces - 1);

      for (let i = 0; i < n; i++) {
        line += row[i];
        if (i < n - 1) {
          const extra = remainingExtras > 0 ? 1 : 0;
          line += " ".repeat(extra) + baseSpaces;
          remainingExtras -= extra;
        }
      }

      // Trailing
      line += baseSpaces + " ".repeat(remainingExtras);
    } else {
      throw new TypeError(
        'Invalid type: must be "between", "around", or "even"',
      );
    }

    result += line + "\n";
  }

  return result;
}
