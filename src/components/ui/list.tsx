import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export const SelectableList = ({
  items,
  onSelect,
  limit = 8,
}: {
  items: string[];
  onSelect?: (item: string) => void;
  limit?: number;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => {
        const newIndex = Math.max(0, prev - 1);
        if (newIndex < offset) {
          setOffset(newIndex);
        }
        return newIndex;
      });
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => {
        const newIndex = Math.min(items.length - 1, prev + 1);
        if (newIndex >= offset + limit) {
          setOffset(newIndex - limit + 1);
        }
        return newIndex;
      });
    }
    if ((key.return || input === "\r" || input === "\n") && onSelect) {
      onSelect(items[selectedIndex]);
    }
  });

  const visibleItems = items.slice(offset, offset + limit);

  return (
    <Box flexDirection="column">
      {offset > 0 && <Text dimColor>↑ more</Text>}
      {visibleItems.map((item, index) => {
        const globalIndex = offset + index;
        const isSelected = globalIndex === selectedIndex;
        return (
          <Text key={item} color={isSelected ? "cyan" : "white"}>
            {isSelected ? "❯ " : "  "}
            {item}
          </Text>
        );
      })}
      {offset + limit < items.length && <Text dimColor>↓ more</Text>}
    </Box>
  );
};
``;
