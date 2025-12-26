import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export const SelectableList = ({ items }: { items: string[] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelectedIndex((prev) => Math.max(0, prev - 1));
    if (key.downArrow)
      setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
  });

  return (
    <Box flexDirection="column">
      {items.map((item, index) => (
        <Text key={item} color={index === selectedIndex ? "cyan" : "white"}>
          {index === selectedIndex ? "❯ " : "  "}
          {item}
        </Text>
      ))}
    </Box>
  );
};
