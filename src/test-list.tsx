#!/usr/bin/env node
// Test script to verify SelectableList works correctly
import React, { useState } from "react";
import { Box, Text, render } from "ink";
import { SelectableList } from "./components/ui/list.js";

const TestApp = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        SelectableList Test
      </Text>
      <Text>Press Arrow Keys to navigate, Enter to select, Escape to exit</Text>
      <Text dimColor>─────────────────────────────────</Text>

      {selected && <Text color="green">✓ Selected: {selected}</Text>}

      {showList && (
        <Box marginTop={1}>
          <SelectableList
            isActive={showList}
            items={["button", "card", "list", "badge", "spinner"]}
            onSelect={(item) => {
              setSelected(item);
              console.log("SELECTED:", item);
            }}
          />
        </Box>
      )}
    </Box>
  );
};

render(<TestApp />);
