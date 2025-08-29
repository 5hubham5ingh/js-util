import * as os from 'os';
import { cursorUp } from "../justjs/cursor.js"

const parent = os.Worker.parent;

const startRendering = async (pulseFrames) => {
  const frames = pulseFrames;

  let frame = 0;
  while (true) {
    const currentFrame = frames[frame % frames.length]
    await os.sleepAsync(100)
    print("\r", currentFrame, cursorUp(),)
    frame++;
  }
}

parent.onmessage = async (e) => {
  const ev = e.data;
  switch (ev.type) {
    case "start":
      await startRendering(ev.data);
      break;
    case "abort":
      parent.onmessage = null;
  }
};
