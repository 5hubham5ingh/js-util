import * as os from 'os';
import { cursorHide, cursorShow, cursorUp } from "../justjs/cursor.js"
import { ttySetRaw } from '../qjs-ext-lib/src/os.js';

let animate = false;
const parent = os.Worker.parent;
const startRendering = async (pulseFrames) => {
  animate = true;
  print(cursorHide, cursorUp())
  ttySetRaw()
  const frames = pulseFrames;

  let frame = 0;
  while (animate) {
    const currentFrame = frames[frame % frames.length]
    await os.sleepAsync(1000 / frames.length)
    print("\r", currentFrame, cursorUp())
    frame++;
  }
  print(cursorShow)
  parent.postMessage("stopped")
  parent.onmessage = null;
}


parent.onmessage = async (e) => {
  const ev = e.data;
  switch (ev.type) {
    case "start":
      await startRendering(ev.data);
      break;
    case "abort":
      animate = false;
  }
};
