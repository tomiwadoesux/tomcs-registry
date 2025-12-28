import { useEffect, useState } from "react";

export interface MouseState {
  x: number;
  y: number;
  isDown: boolean;
  button: number; // 0: left, 1: middle, 2: right
  action: "down" | "up" | "move";
}

export const useMouse = () => {
  const [mouse, setMouse] = useState<MouseState>({
    x: 0,
    y: 0,
    isDown: false,
    button: 0,
    action: "move",
  });

  useEffect(() => {
    // Enable Mouse Reporting (SGR mode 1006 + 1003 all motion)
    process.stdout.write("\x1b[?1003h\x1b[?1006h");

    // Force raw mode to catch sequences without echo
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
    }

    const onData = (data: Buffer) => {
      const str = data.toString();
      // Match SGR mouse format: < BUTTON ; X ; Y M (down/move) or m (up)
      // 35 means move in some modes, but 1003 reports button state more directly
      const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);

      if (match) {
        let [_, btnCode, xStr, yStr, type] = match;
        const x = parseInt(xStr, 10);
        const y = parseInt(yStr, 10);
        let button = parseInt(btnCode, 10);

        // Decoding button state (SGR is a bit complex)
        // 0 = Left, 1 = Middle, 2 = Right
        // +32 indicates drag
        const isDrag = button >= 32;
        if (isDrag) button -= 32;

        setMouse({
          x,
          y,
          isDown: type === "M" && (button === 0 || isDrag), // Assume left click/drag
          button,
          action: type === "M" ? "down" : "up",
        });
      }
    };

    process.stdin.on("data", onData);

    return () => {
      process.stdout.write("\x1b[?1003l\x1b[?1006l");
      process.stdin.off("data", onData);
    };
  }, []);

  return mouse;
};
