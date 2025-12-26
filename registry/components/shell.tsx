import React, { useEffect, useState } from "react";
import { Box, Text, useStdout } from "ink";

export const Shell = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    columns: stdout?.columns || 80,
    rows: stdout?.rows || 24,
  });

  useEffect(() => {
    if (!stdout) return;

    const onResize = () => {
      setSize({
        columns: stdout.columns,
        rows: stdout.rows,
      });
    };

    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  return (
    <Box flexDirection="column" width={size.columns} height={size.rows}>
      {/* HEADER */}
      <Box backgroundColor="blue" paddingX={1} justifyContent="space-between">
        <Text bold color="white">
          {title.toUpperCase()}
        </Text>
        <Text color="cyan">{new Date().toLocaleTimeString()}</Text>
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box flexGrow={1} padding={1} flexDirection="column">
        {children}
      </Box>

      {/* FOOTER / KEYBINDINGS */}
      <Box
        borderStyle="single"
        borderTop={true}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        paddingX={1}
      >
        <Text dimColor>q Quit • tab Switch • ↑↓ Navigate</Text>
      </Box>
    </Box>
  );
};
