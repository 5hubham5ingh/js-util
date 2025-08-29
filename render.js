import { getTerminalSize } from "../justjs/terminal.js";

export const loader = () => {
  const worker = new os.Worker("./worker.js");


  const [terminalWidth, _] = getTerminalSize()
  const frames = [
    '● ∙ ◦ ◦ ∙',
    '∙ ● ∙ ◦ ∙',
    '◦ ∙ ● ∙ ◦',
    '◦ ◦ ∙ ● ∙',
    '∙ ◦ ◦ ∙ ●',
  ];

  const paddedFrames = frames.map(frame => {
    const frameLength = frame.length;
    const padStart = Math.floor((terminalWidth - frameLength) / 2);
    return frame.padStart(padStart + frameLength);
  });

  worker.postMessage({ type: "start", data: paddedFrames });

  return () => {
    worker.postMessage({ type: "abort" });
    worker.onmessage = null;
  };
}

