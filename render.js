import { cursorDown, cursorHide, cursorShow, cursorUp, eraseDown } from "../justjs/cursor.js";
import { getTerminalSize, handleKeysPressSync, keySequences } from "../justjs/terminal.js";
import { printf } from "std"
import { ttySetRaw } from "../qjs-ext-lib/src/os.js";

export const loader = (message) => {
  const worker = new os.Worker("./worker.js");

  const [terminalWidth, _] = getTerminalSize()

  const frames = message ? ["◜", "◝", "◞", "◟"].map(stateSymbol => `${stateSymbol.style(['bold', 'yellow'])} ${message}`)
    : ((length = parseInt(terminalWidth / 20)) => {
      const frames = [];
      for (let i = 0; i < length; i++) {
        const frame = new Array(length).fill('●');
        frame[i] = '◖◗';
        frames.push(frame.join('').style(['bold', 'yellow']));
      }
      return [...frames, ...frames.reverse().slice(1)].slice(0, -1)
        .map(frame => {
          const frameLength = frame.stripStyle().length;
          const padStart = Math.floor((terminalWidth - frameLength) / 2);
          return frame.padStart(padStart + frame.length);
        });
    })()

  worker.postMessage({ type: "start", data: frames });

  return () => {
    worker.postMessage({ type: "abort" });
    worker.onmessage = null;
  };
}

export const pages = (content, pageHeight) => {
  const [terminalWidth, terminalHeight] = getTerminalSize();
  if (pageHeight && pageHeight > terminalHeight - 3) pageHeight = terminalHeight - 3
  const contentWidth = terminalWidth - 4;

  const formattedLines = content.stripEmojis().split('\n')
    .flatMap(line => {
      const strippedLength = line.stripStyle().length;
      if (strippedLength > contentWidth) {
        return line.wrap(contentWidth).split('\n');
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

      dots = new Array(indicatorMaxLength).fill('∙');
      if (isOverFlowPage && !isLastPage) {
        activeIndex = indicatorMaxLength - 2;
      } else if (isLastPage) {
        activeIndex = indicatorMaxLength - 1;
      } else {
        activeIndex = currentPage;
      }
    } else {
      dots = new Array(pages.length).fill('∙');
      activeIndex = currentPage;
    }

    dots[activeIndex] = '●';
    const indicator = '◖'.style('yellow') + dots.join('').style(['bold', '#000000', 'bg-yellow']) + '◗'.style('yellow');

    return shouldUseCompactIndicator
      ? indicator
      : indicator.padStart(Math.floor((terminalWidth - 4 - indicator.stripStyle().length) / 2) + indicator.length);
  };

  const renderUI = () => {
    if (prevCursorPos) {
      printf(`${prevCursorPos}${eraseDown}`);
    }

    const page = pages[currentPage];
    const pageIndicator = createPageIndicator();
    const content = [...page, pageIndicator].join('\n').border('thick');

    print(content);
    prevCursorPos = cursorUp(page.length + 3);
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
    'l': nextPage,
    [keySequences.ArrowRight]: nextPage,
    'h': prevPage,
    [keySequences.ArrowLeft]: prevPage,
    [keySequences.Enter]: nextOrQuit,
    'q': (_, quit) => quit()
  });

  printf(cursorShow);
};

export const levels = (levels) => {
  const allFrames = []
  for (const [currentLevel, maxLevel, title = '', desc = false] of levels) {
    const frames = [];
    const start = desc ? maxLevel : 0;
    const end = desc ? currentLevel : currentLevel;
    const step = desc ? -1 : 1;

    for (let i = start; desc ? i >= end : i <= end; i += step) {
      const filled = i > 0 ? '█'.repeat(i) : '';
      const emptySpaces = Math.max(0, maxLevel - i - 1);
      const empty = '◗' + ' '.repeat(emptySpaces);

      const bar = (filled + empty).style(['grey', emptySpaces >= 0 ? 'bg-white' : '']);
      frames.push(title + '◖'.style('grey') + bar + '◗'.style('white'));
    }

    allFrames.push(frames)
  }
  print(cursorHide);
  ttySetRaw();
  const maxNoOfFrames = Math.max(...allFrames.map(frame => frame.length))
  let prevCursorPos;
  for (let i = 0; i < maxNoOfFrames; i++) {
    if (prevCursorPos) printf(prevCursorPos);
    const frames = allFrames.map(frames => frames[i]).join('\n\n')
    print(frames.border('rounded'), '\n')
    os.sleep(700 / maxNoOfFrames);
    prevCursorPos = (cursorUp(allFrames.length * 2 + 2) + eraseDown)
  }
  printf(cursorShow);
};

