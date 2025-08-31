export const table = (data, columns) => {
  if (typeof data !== 'object' || data === null) {
    throw TypeError('The "data" argument must be an array or a non-null object.');
  }
  if (columns !== undefined && !Array.isArray(columns)) {
    throw TypeError('The "columns" argument, if provided, must be an array.');
  }

  let table = ''
  const isArray = Array.isArray(data);
  const rows = isArray ? data : Object.entries(data).map(([key, value]) => ({ key, value }));

  if (!rows.length) {
    table += '╔════╗\n║ [] ║\n╚════╝\n'
    return;
  }

  const keys = columns && columns.length
    ? columns
    : [...new Set(rows.flatMap(row => Object.keys(row)))];

  const header = [...keys];

  const getString = (v) => v === null ? 'null' : v === undefined ? 'undefined' : String(v);

  const allRows = [header, ...rows.map(row => {
    return keys.map(k => getString(row[k]));
  })];

  const colWidths = header.map((_, colIndex) =>
    Math.max(...allRows.map(row => getString(row[colIndex]).length))
  );

  const pad = (s, i) => getString(s).padEnd(colWidths[i], ' ');

  const formatRow = (row) =>
    '║ ' + row.map(pad).map((v) => v).join(' │ ') + ' ║';

  const makeLine = (left, mid, right, fill) =>
    left +
    colWidths.map(w => fill.repeat(w + 2)).join(mid) +
    right;

  const top = makeLine('╔', '╤', '╗', '═');
  const separator = makeLine('╟', '┼', '╢', '─');
  const bottom = makeLine('╚', '╧', '╝', '═');

  const lines = [top, formatRow(header), separator];
  allRows.slice(1).forEach(row => lines.push(formatRow(row)));
  lines.push(bottom);

  table += lines.join('\n')
  return table;
}

export const levels = (levels) => {
  if (!Array.isArray(levels) || levels.length === 0) {
    throw new TypeError('The "levels" argument must be a non-empty array.');
  }

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (!Array.isArray(level) || level.length < 3) {
      throw new Error(`Each item in the "levels" array must be an array of at least 3 elements. Invalid item at index ${i}.`);
    }
    const [currentLevel, maxLevel, title] = level;
    if (typeof currentLevel !== 'number' || typeof maxLevel !== 'number' || typeof title !== 'string') {
      throw new TypeError(`Invalid data types for item at index ${i}. Expected [number, number, string].`);
    }
    if (currentLevel < 0 || maxLevel <= 0 || currentLevel > maxLevel) {
      throw new Error(`Invalid level values at index ${i}. "currentLevel" and "maxLevel" must be positive numbers, and "currentLevel" cannot exceed "maxLevel".`);
    }
  }

  const maxTitleLength = Math.max(...levels.map(level => level[2].length));

  const finalFrames = levels.map(([currentLevel, maxLevel, title, desc = false]) => {
    const finalValue = desc ? currentLevel : currentLevel;
    const filled = finalValue > 0 ? '█'.repeat(finalValue) : '';
    const emptySpaces = Math.max(0, maxLevel - finalValue - 1);
    const empty = '◗' + ' '.repeat(emptySpaces);
    const bar = (filled + empty).style(['grey', emptySpaces >= 0 ? 'bg-white' : '']);
    return title.padEnd(maxTitleLength + 1) + '◖'.style('grey') + bar + '◗'.style('white');
  });

  return finalFrames.join('\n\n');
};

export const border = (str, type = 'normal', style, padding = 1) => {

  const borderChars = {
    normal: { x: "─".style(style), y: "│".style(style), tl: "┌".style(style), tr: "┐".style(style), bl: "└".style(style), br: "┘".style(style) },
    thick: { x: "━".style(style), y: "┃".style(style), tl: "┏".style(style), tr: "┓".style(style), bl: "┗".style(style), br: "┛".style(style) },
    double: { x: "═".style(style), y: "║".style(style), tl: "╔".style(style), tr: "╗".style(style), bl: "╚".style(style), br: "╝".style(style) },
    rounded: { x: "─".style(style), y: "│".style(style), tl: "╭".style(style), tr: "╮".style(style), bl: "╰".style(style), br: "╯".style(style) },
    hidden: { x: " ".style(style), y: " ".style(style), tl: " ".style(style), tr: " ".style(style), bl: " ".style(style), br: " ".style(style) },
  };

  const chars = borderChars[type];
  if (!chars) {
    return str;
  }

  const lines = str.split('\n');
  const horizontalPadding = ' '.repeat(padding);

  const contentWidth = Math.max(
    0,
    ...lines.map(line => line.stripStyle().length)
  );

  if (contentWidth === 0 && lines.length === 1 && lines[0] === '') {
    return `${chars.tl}${chars.tr}\n${chars.bl}${chars.br}`;
  }

  const totalInnerWidth = contentWidth + padding * 2;

  const topBorder = chars.tl + chars.x.repeat(totalInnerWidth) + chars.tr;
  const bottomBorder = chars.bl + chars.x.repeat(totalInnerWidth) + chars.br;

  const middleContent = lines.map(line => {
    const strippedLength = line.stripStyle().length;

    const rightPaddingCount = totalInnerWidth - strippedLength - padding;
    const rightPadding = ' '.repeat(rightPaddingCount > 0 ? rightPaddingCount : 0);

    return `${chars.y}${horizontalPadding}${line}${rightPadding}${chars.y}`;
  }).join('\n');

  return `${topBorder}\n${middleContent}\n${bottomBorder}`;
}


const ALIGN = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center'
}

export const join = (firstString, secondString, align = ALIGN.LEFT) => {
  const linesFromFirstString = firstString.split('\n');
  const linesFromSecondString = secondString.split('\n')
  const combinedLines = [...linesFromFirstString, ...linesFromSecondString]
  const maxLineWidth = Math.max(...combinedLines.map(line => line.stripStyle().length))

  const stackedLines = []
  switch (align) {
    case ALIGN.LEFT:
      stackedLines.push(...combinedLines.map(line => line.padEnd(maxLineWidth)))
      break;
    case ALIGN.RIGHT:
      stackedLines.push(...combinedLines.map(line => line.padStart(maxLineWidth)))
      break;
    case ALIGN.CENTER:
      stackedLines.push(...combinedLines.map(line => {
        const lineVisibleLength = line.stripStyle().length
        const gap = maxLineWidth - lineVisibleLength
        const leftPaddingCount = parseInt(gap / 2)
        const rightPaddingCount = gap - leftPaddingCount
        return " ".repeat(leftPaddingCount) + line + " ".repeat(rightPaddingCount)
      }))
      break;
  }
  return stackedLines.join('\n')
}
