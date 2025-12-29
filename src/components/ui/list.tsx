import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Box, Text, useInput } from "ink";

export interface SelectableListRef {
  getSelectedIndex: () => number;
  getSelectedItem: () => string;
  selectNext: () => void;
  selectPrev: () => void;
  confirmSelection: () => void;
}

export const SelectableList = forwardRef<
  SelectableListRef,
  {
    items: string[];
    onSelect?: (item: string) => void;
    limit?: number;
    isActive?: boolean;
  }
>(({ items, onSelect, limit = 8, isActive = true }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
    setOffset(0);
  }, [items]);

  const selectNext = () => {
    setSelectedIndex((prev) => {
      const newIndex = Math.min(items.length - 1, prev + 1);
      if (newIndex >= offset + limit) {
        setOffset(newIndex - limit + 1);
      }
      return newIndex;
    });
  };

  const selectPrev = () => {
    setSelectedIndex((prev) => {
      const newIndex = Math.max(0, prev - 1);
      if (newIndex < offset) {
        setOffset(newIndex);
      }
      return newIndex;
    });
  };

  const confirmSelection = () => {
    if (onSelect && items[selectedIndex]) {
      onSelect(items[selectedIndex]);
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getSelectedIndex: () => selectedIndex,
    getSelectedItem: () => items[selectedIndex],
    selectNext,
    selectPrev,
    confirmSelection,
  }));

  // Handle keyboard input when active
  useInput(
    (input, key) => {
      if (!isActive) return;

      if (key.upArrow) {
        selectPrev();
      }
      if (key.downArrow) {
        selectNext();
      }

      if (
        (key.return ||
          key.tab ||
          input === "\r" ||
          input === "\n" ||
          input === " ") &&
        onSelect
      ) {
        confirmSelection();
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
            key={`${item}-${globalIndex}`}
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
});

SelectableList.displayName = "SelectableList";
