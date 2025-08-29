import { getTerminalSize } from "../justjs/terminal.js";

export const loader = (message) => {
  const worker = new os.Worker("./worker.js");

  const [terminalWidth, _] = getTerminalSize()

  const frames = message ? ["◜", "◝", "◞", "◟"].map(stateSymbol => `${stateSymbol.style(['bold', 'yellow'])} ${message}`)
    : ((length = 6) => {
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

export const pages = (pages) => {
  return ''
}


function generateFrames2(length) {
  const frames = [];
  for (let i = 0; i < length; i++) {
    const frame = new Array(length).fill('∙');
    frame[i] = '●';
    frames.push('◖'.style('yellow') + frame.join('').style(['bold', '#000000', 'bg-yellow']) + '◗'.style('yellow'));
  }
  return [...frames, ...frames.reverse().slice(1)].slice(0, -1);
}

