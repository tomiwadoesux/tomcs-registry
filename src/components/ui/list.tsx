import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";

export const SelectableList = ({
  items,
  onSelect,
  limit = 8,
  isActive = true,
}: {
  items: string[];
  onSelect?: (item: string) => void;
  limit?: number;
  isActive?: boolean;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
    setOffset(0);
  }, [items.length]);

  useInput(
    (input, key) => {
      // Only process input if active
      if (!isActive) {
        return;
      }

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

      // Handle selection with Enter, Space, or Tab
      if (key.return || input === " ") {
        console.log(
          "[SelectableList] Enter/Space pressed! isActive:",
          isActive,
          "selectedIndex:",
          selectedIndex,
          "item:",
          items[selectedIndex]
        );
        if (onSelect && items[selectedIndex]) {
          console.log(
            "[SelectableList] Calling onSelect with:",
            items[selectedIndex]
          );
          onSelect(items[selectedIndex]);
        }
      }
    },
    { isActive }
  );

  const visibleItems = items.slice(offset, offset + limit);

  return (
    <Box flexDirection="column">
      {offset > 0 && <Text dimColor>↑ more</Text>}
      {visibleItems.map((item, index) => {
        const globalIndex = offset + index;
        const isSelected = globalIndex === selectedIndex;
        return (
          <Text
            key={`list-item-${globalIndex}`}
            color={isSelected ? "cyan" : "white"}
          >
            {isSelected ? "❯ " : "  "}
            {item}
          </Text>
        );
      })}
      {offset + limit < items.length && <Text dimColor>↓ more</Text>}
    </Box>
  );
};
