import React from "react";
import { Box, Text, useInput } from "ink";

interface TabsProps {
  items: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const Tabs = ({ items, activeTab, onChange }: TabsProps) => {
  useInput((input, key) => {
    const currentIndex = items.indexOf(activeTab);
    if (key.rightArrow) {
      onChange(items[(currentIndex + 1) % items.length]);
    }
    if (key.leftArrow) {
      onChange(items[(currentIndex - 1 + items.length) % items.length]);
    }
  });

  return (
    <Box marginBottom={1}>
      {items.map((item) => {
        const isActive = item === activeTab;
        return (
          <Box
            key={item}
            marginRight={2}
            borderStyle="single"
            borderColor={isActive ? "cyan" : "gray"}
          >
            <Text color={isActive ? "cyan" : "white"} bold={isActive}>
              {isActive ? ` ● ${item} ` : `   ${item} `}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};
