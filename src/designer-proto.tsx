import React, { useState, useEffect } from "react";
import { render, Box, Text, useStdout } from "ink";

const DraggableBox = () => {
  const { stdout } = useStdout();
  const [pos, setPos] = useState({ x: 10, y: 5 });
  const [isDragging, setIsDragging] = useState(false);

  // 1. Enable Mouse Tracking & Disable Echo
  useEffect(() => {
    // Enable Mouse Reporting (SGR mode)
    process.stdout.write("\x1b[?1003h\x1b[?1006h");

    // FORCE RAW MODE: This prevents the terminal from echoing the mouse codes (e.g. ^[[<35...) text to the screen
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
    }

    return () => {
      // Cleanup: Disable mouse reporting
      process.stdout.write("\x1b[?1003l\x1b[?1006l");
      // Note: Ink handles exiting raw mode on unmount
    };
  }, []);

  // 2. Capture Mouse Events via Raw ANSI Parsing
  useEffect(() => {
    const onData = (data: Buffer) => {
      const str = data.toString();
      // Match SGR mouse format: < BUTTON ; X ; Y M (down/move) or m (up)
      const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);

      if (match) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, button, x, y, action] = match;
        const newX = parseInt(x, 10);
        const newY = parseInt(y, 10);

        // 'M' = Button Down or Move (in 1003h mode)
        // 'm' = Button Up
        if (action === "M") {
          setIsDragging(true);
          setPos({ x: newX, y: newY });
        } else {
          setIsDragging(false);
        }
      }
    };

    process.stdin.on("data", onData);
    return () => process.stdin.off("data", onData);
  }, []);

  return (
    <Box>
      {/* THE CANVAS */}
      <Box
        width={stdout?.columns || 80}
        height={stdout?.rows || 24}
        flexDirection="column"
      >
        <Text color="gray">[ tomcs Designer ] Drag the button.</Text>

        {/* THE DRAGGABLE COMPONENT */}
        <Box
          position="absolute"
          marginLeft={Math.max(0, pos.x - 1)}
          marginTop={Math.max(0, pos.y - 1)}
          borderStyle="round"
          borderColor={isDragging ? "green" : "cyan"}
          paddingX={1}
        >
          <Text color="white">{isDragging ? "● Dragging" : "■ Button"}</Text>
        </Box>
      </Box>
    </Box>
  );
};

render(<DraggableBox />);
