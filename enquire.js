import { printf } from "std"
import { cursorBackward, cursorHide, cursorMove, cursorShow, cursorUp, eraseDown, eraseEndLine } from "../justjs/cursor.js"
import { ttySetRaw } from 'os'
import { getTerminalSize, handleKeysPressSync, keySequences } from "../justjs/terminal.js"
import { colorPicker } from "./colorPicker.js"
import { ansi } from "../justjs/ansiStyle.js"


const formatLine = (line, lineNumber, totalLines) => {
  const visible = line.stripStyle()
  const [terminalWidth] = getTerminalSize()
  const horizontalGap = terminalWidth - 2 - visible.length

  if (horizontalGap > 0) {
    return lineNumber === totalLines - 1
      ? line.padStart(line.length + horizontalGap - 2)
      : line.padEnd(line.length + horizontalGap - 4)
  }

  if (horizontalGap < 0) {
    return line.chunks(terminalWidth - 4).map((l, i) => i === 0 ? l : '  ' + l)
  }

  return line
}

const renderBorderedUI = (lines, prevCursorPos) => {
  const ui = lines.flatMap((line, i) => formatLine(line, i, lines.length))

  if (prevCursorPos) printf(`${prevCursorPos}${eraseDown}`)
  const borderedUI = ui.join('\n').border('rounded').log()

  return cursorUp(borderedUI.split('\n').length)
}

const formatMultilineOption = (opt, prefix = '') => {
  return String(opt)
    .split('\n')
    .map((l, i) => i === 0 ? l : prefix + l)
    .join('\n')
}

const createNavigationHandlers = (getLength, getIndex, setIndex, renderFn) => ({
  [keySequences.ArrowUp]: () => {
    const length = getLength()
    if (length) {
      setIndex((getIndex() - 1 + length) % length)
      renderFn()
    }
  },
  [keySequences.ArrowDown]: () => {
    const length = getLength()
    if (length) {
      setIndex((getIndex() + 1) % length)
      renderFn()
    }
  }
})

export const ask = (message) => {
  if (typeof message !== 'string') throw TypeError('The "message" must be of type string.')
  render.startSection()
  printf(' %s '.style(["bg-grey", "#000000", "bold"]).concat("".style('grey'), " ")
    , message)
  const ans = std.in.getline()
  printf(ansi.style.reset)
  render.endSection()
  return ans;
}

export const confirm = (statement) => {
  if (typeof statement !== 'string') throw TypeError('The "statement" must be of type string.')
  let choice
  render.startSection()
  while (true) {
    printf(' %s (y/n)'.style(["bg-grey", "#000000", "bold"]).concat("".style('grey'), " "), statement)
    choice = std.in.getline()?.trim().toLowerCase()
    if (choice === 'y' || choice === 'n') break
    log.error('Invalid input! ' + choice)
  }
  render.endSection()
  return choice === 'y'
}

export const secret = (message) => {
  if (typeof message !== 'string') throw TypeError('The "message" must be of type string.')
  ttySetRaw()
  let secret = ''
  render.startSection()
  printf(' %s: '.style(["bg-grey", "#000000", "bold"]).concat("".style('grey'), " "), message)

  while (true) {
    const char = std.in.readAsString(1)
    if (char === keySequences.Enter) {
      print(ansi.style.reset)
      render.endSection()
      return secret
    } else if (char === keySequences.Backspace) {
      secret = secret.slice(0, -1)
      printf("%s%s", cursorBackward(), eraseEndLine)
    } else {
      printf("✳")
      secret += char
    }
  }
}

export const choose = (options) => {
  if (!options || !Array.isArray(options)) throw TypeError("Expected an argument of type String[]");

  printf("%s", cursorHide)
  ttySetRaw()

  const [_terminalWidth, terminalHeight] = getTerminalSize()
  let index = 0
  let prevCursorPos

  const renderUi = () => {
    let lines = options.map((opt, i) => {
      const line = formatMultilineOption(opt, '  ')
      return i === index
        ? `◉ ${line}`.style(['bold'])
        : `○ ${line}`
    })

    const maxUiHeight = parseInt(terminalHeight / 2)
    if (lines.length > maxUiHeight) {
      lines = lines.slice(index, index + maxUiHeight)
    }
    lines.push(" Select one (Enter to confirm) ".style(['#000000', 'bold', 'bg-grey']))
    prevCursorPos = renderBorderedUI(lines, prevCursorPos)
  }

  renderUi()

  const handlers = {
    ...createNavigationHandlers(() => options.length, () => index, (i) => index = i, renderUi),
    [keySequences.Enter]: (_, q) => q()
  }

  handleKeysPressSync(handlers)
  printf(cursorShow)
  os.exec(['stty', 'sane'])
  return options[index]
}

export const search = (options) => {
  if (!options || !Array.isArray(options) || options.length === 0) throw TypeError(`Expected an argument of type String[], but got\n${stringify(options)}`);
  printf("%s", cursorHide)
  ttySetRaw()

  const [terminalWidth, terminalHeight] = getTerminalSize()
  let query = ''
  let filtered = options.slice()
  let index = 0
  let prevCursorPos

  const recompute = () => {
    filtered = options.filter(opt => String(opt).toLowerCase().includes(query.toLowerCase()))
    index = 0
  }

  const renderUi = () => {
    const lines = []

    // Query input display
    const queryDisplay = query || "Type to start search...".style(['grey', 'italic'])
    const queryDisplayWidth = queryDisplay.stripStyle().length
    const horizontalGap = terminalWidth - 8 - queryDisplayWidth

    if (horizontalGap > 0) {
      lines.push(queryDisplay.padEnd(queryDisplay.length + horizontalGap).border('rounded'))
    } else {
      lines.push(queryDisplay.stripStyle().chunks(terminalWidth - 8).join('\n').border('rounded'))
    }

    // Options display
    if (filtered.length === 0) {
      lines.push("  No matches")
    } else {
      let optionLines = []
      filtered.forEach((opt, i) => {
        const line = formatMultilineOption(opt, '   ')
        const lineDisplay = i === index
          ? ` ◉ ${line}`.style(['bold'])
          : ` ○ ${line}`

        const lineDisplayWidth = lineDisplay.stripStyle().length
        const horizontalGap = terminalWidth - 4 - lineDisplayWidth

        if (horizontalGap < 0) {
          optionLines.push(lineDisplay.chunks(terminalWidth - 4)
            .map((line, i) => i === 0 ? line : "   " + line)
            .join('\n'))
        } else {
          optionLines.push(lineDisplay)
        }
      })
      const maxUiHeight = parseInt(terminalHeight / 2)
      if (optionLines.length > maxUiHeight) {
        optionLines = optionLines.slice(index, index + maxUiHeight)
      }

      lines.push(...optionLines)
    }

    if (prevCursorPos) printf('%s%s', prevCursorPos, eraseDown)
    const ui = lines.join('\n').border('rounded')
    const uiHeight = ui.split('\n').length - 1
    printf(ui)
    prevCursorPos = cursorMove(terminalWidth * -1, uiHeight * -1)
  }

  renderUi()

  const updateQuery = (ch) => {
    query += ch
    recompute()
    renderUi()
  }

  const handlers = {
    ...createNavigationHandlers(() => filtered.length, () => index, (i) => index = i, renderUi),
    [keySequences.Backspace]: () => {
      if (query.length) {
        query = query.slice(0, -1)
        recompute()
        renderUi()
      }
    },
    [keySequences.Enter]: (_, q) => { if (filtered.length) q() },
    [keySequences.smallLetters]: updateQuery,
    [keySequences.capitalLetters]: updateQuery,
    [keySequences.numbers]: updateQuery,
    [keySequences.Space]: updateQuery
  }

  handleKeysPressSync(handlers)
  printf(cursorShow)
  os.exec(['stty', 'sane'])
  return filtered.length ? filtered[index] : undefined
}

export const select = (options) => {
  if (!options || !Array.isArray(options)) throw TypeError("Expected an argument of type String[]");
  if (!options) return;
  printf("%s", cursorHide)
  ttySetRaw()

  const [terminalWidth, terminalHeight] = getTerminalSize()
  let index = 0
  const selected = new Set()
  let prevCursorPos

  const renderUi = () => {
    let lines = options.map((opt, i) => {
      const mark = selected.has(i) ? "◉" : "○"
      const line = formatMultilineOption(opt, '    ')

      return i === index
        ? `• ${mark} ${line}`.style(['bold'])
        : `  ${mark} ${line}`
    })

    const maxUiHeight = parseInt(terminalHeight / 2)
    if (lines.length > maxUiHeight) {
      lines = lines.slice(index, index + maxUiHeight)
    }
    lines.push(" Select one or more (Space to toggle, Enter to confirm) ".style(['#000000', 'bold', 'bg-grey']))
    prevCursorPos = renderBorderedUI(lines, prevCursorPos)
  }

  renderUi()

  const handlers = {
    ...createNavigationHandlers(() => options.length, () => index, (i) => index = i, renderUi),
    [' ']: () => {
      selected.has(index) ? selected.delete(index) : selected.add(index)
      renderUi()
    },
    [keySequences.Enter]: (_, q) => q()
  }

  handleKeysPressSync(handlers)
  printf(cursorShow)
  os.exec(['stty', 'sane'])
  return [...selected].map(i => options[i])
}

export const pick = () => {
  const ICONS = {
    FOLDER_OPEN: '📂',
    FOLDER_CLOSED: '📁',
    FILE: '📄',
    FILE_DETAILS: '📃'
  };

  const [terminalWidth, terminalHeight] = getTerminalSize()
  const MAX_DETAIL_HEIGHT = parseInt(terminalHeight / 4);
  const CONTENT_WIDTH = terminalWidth - 4;

  let options = lsStat
  let index = 0;
  let prevCursorPos;
  const navigationHistory = [];

  printf("%s", cursorHide);
  ttySetRaw();

  const getDirectoryContents = (dir) => {
    cd(dir);
    const contents = lsStat.map(content =>
      `${content.isDir ? ICONS.FOLDER_CLOSED : ICONS.FILE}${content}`
    ).join(' ');
    cd('..');
    return contents;
  };

  const getFileDetails = ({ size, accessedAt, changedAt, modifiedAt }) =>
    [`SIZE: ${size}`, `ACCESSED: ${accessedAt}`, `CHANGED: ${changedAt}`, `MODIFIED: ${modifiedAt}`]
      .join(' │ ');

  const getDetails = () => {
    const currentOption = options[index];
    const content = currentOption.isDir
      ? getDirectoryContents(currentOption)
      : getFileDetails(currentOption);

    return content
      .wrap(CONTENT_WIDTH)
      .split('\n')
      .slice(0, MAX_DETAIL_HEIGHT)
  };

  const getDisplayIcon = (option, isSelected) => {
    if (option.isDir) {
      return isSelected ? ICONS.FOLDER_OPEN : ICONS.FOLDER_CLOSED;
    }
    return isSelected ? ICONS.FILE_DETAILS : ICONS.FILE;
  };

  const renderOptions = () => {
    let lines = options.map((opt, i) => {
      const isSelected = i === index;
      const icon = getDisplayIcon(opt, isSelected);
      const line = formatMultilineOption(opt, '  ');

      return isSelected
        ? `❯ ${icon} ${line}`.style(['bold'])
        : `${icon} ${line}`;
    });

    const maxUiHeight = parseInt(terminalHeight / 2)
    // for viewport scrolling
    if (lines.length > maxUiHeight) {
      lines = lines.slice(index, index + maxUiHeight);
    }

    return lines;
  };

  const renderUi = () => {
    const lines = [
      `${cwd !== '/' ? cwd + '/' : '/'}${options[index]}`.style('underline'),
      ...renderOptions(),
      '━'.repeat(terminalWidth - 4),
      ...getDetails(),
      " ",
      " Select one (Enter to confirm, Arrow to navigate) ".style(['#000000', 'bold', 'bg-grey'])
    ];

    prevCursorPos = renderBorderedUI(lines, prevCursorPos);
  };

  const navigateInto = () => {
    const selectedOption = options[index];
    if (selectedOption.isDir) {
      if (!cd(selectedOption)) return;
      const contents = lsStat
      if (contents.length === 0) return;
      options = contents;
      navigationHistory.push(index);
      index = 0;
      renderUi();
    }
  };

  const navigateBack = () => {
    if (!cd('..')) return;
    options = lsStat;
    index = navigationHistory.pop() ?? 0;
    renderUi();
  };

  const handlers = {
    ...createNavigationHandlers(
      () => options.length,
      () => index,
      (i) => { index = i; },
      renderUi
    ),
    [keySequences.Enter]: (_, quit) => quit(),
    [keySequences.ArrowRight]: navigateInto,
    [keySequences.ArrowLeft]: navigateBack
  };

  renderUi();
  handleKeysPressSync(handlers);
  os.exec(['stty', 'sane'])
  printf(cursorShow);

  return `${cwd !== '/' ? cwd + '/' : '/'}${options[index]}`
};

export const describe = (buffer = '') => {
  if (typeof buffer !== 'string') throw TypeError('Expected one argument of type "string"')

  const [terminalWidth, terminalHeight] = getTerminalSize()
  const CURSOR_CHAR = '█';
  const CONTENT_WIDTH = terminalWidth - 5;
  const MAX_BUFFER_HEIGHT = Math.floor(terminalHeight / 2);
  const HELP_TEXT = " Textarea (press CTRL+D to submit) ".style(['#000000', 'bold', 'bg-grey']);
  const HELP_PADDED = HELP_TEXT.padStart(HELP_TEXT.stripStyle().length + terminalWidth - 12);

  let prevCursorPos;

  ttySetRaw();
  printf("%s", cursorHide);

  const processBufferForDisplay = () => {
    if (!buffer) return [CURSOR_CHAR];

    const lines = buffer.split('\n');
    const overflowCount = lines.length - MAX_BUFFER_HEIGHT;
    if (overflowCount > 0) {
      lines.splice(0, overflowCount);
    }

    const lastIndex = lines.length - 1;
    lines[lastIndex] += CURSOR_CHAR;

    return lines.flatMap(line => line.chunks(CONTENT_WIDTH));
  };

  const renderUi = () => {
    if (prevCursorPos) {
      printf(`${prevCursorPos}${eraseDown}`);
    }

    const displayBuffer = processBufferForDisplay();
    const ui = [
      ...displayBuffer,
      ' '
    ];

    if (buffer.split('\n').length === 1) ui.push(" ")
    ui.push(HELP_PADDED)

    prevCursorPos = cursorUp(ui.join('\n').border('double').log().split('\n').length);
  };

  const handleInput = (char) => {
    switch (char) {
      case keySequences["Ctrl+D"]:
        printf(cursorShow);
        return { shouldExit: true, result: buffer };

      case keySequences.Enter:
        buffer += '\n';
        break;

      case keySequences.Backspace:
        buffer = buffer.slice(0, -1);
        break;

      default:
        buffer += char;
        break;
    }

    return { shouldExit: false };
  };

  while (true) {
    renderUi();

    const char = std.in.readAsString(1);
    const result = handleInput(char);

    if (result.shouldExit) {
      os.exec(['stty', 'sane'])
      return result.result;
    }
  }
};

export const color = colorPicker;

export const edit = (content = '') => {
  if (typeof content !== 'string') throw TypeError('Expected one argument of type "string"')
  if (typeof EDITOR === 'undefined') return describe(content);
  const fileDir = '/tmp/js/'
  ensureDir(fileDir)
  const fileName = String(Math.random())
  const filePath = fileDir + fileName
  const file = std.open(filePath, "w+")
  if (!file) throw Error("Failed to open temp file for the editor. " + String(file) + filePath);
  if (content) file.puts(content);
  file.close()
  os.exec([EDITOR, filePath])
  const editedFile = std.open(filePath, "r")
  const fileContent = editedFile.readAsString()
  editedFile.close();
  os.remove(filePath)
  os.exec(['stty', 'sane'])
  return fileContent;
};

