import { cursorShow } from "./cursor.js";

export const warn = (msg, det) => {
  const label = "WARN", color = "#fce74b";
  print(draw.message(label, msg, det, color));
};

export const info = (msg, det) => {
  const label = "INFO", color = "#C6EFCE";
  print(draw.message(label, msg, det, color));
};

export const error = (msg, det) => {
  const label = "ERROR", color = "#FFA07A";
  std.err.puts(draw.message(label, msg, det, color), "\n");
};

export const fatal = (msg, det) => {
  const label = "FATAL", color = "#c91d1a";
  std.err.puts(draw.message(label, msg, det, color), "\n", cursorShow);
  os.exec(["stty", "sane"]);
  std.exit();
};
