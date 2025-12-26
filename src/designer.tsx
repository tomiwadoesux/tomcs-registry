import React, { useState } from "react";
import { Box, Text, render, useInput } from "ink";
import { SelectableList } from "./components/ui/list";

const Designer = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [showLibrary, setShowLibrary] = useState(false);

  // Define hotkeys for workflow
  useInput((input, key) => {
    // "A" or "a" to toggle library
    if (input === "a" || input === "A") {
      setShowLibrary((prev) => !prev);
    }
    // Escape to close library or deselect
    if (key.escape) {
      setShowLibrary(false);
      setSelectedComponent(null);
    }
  });

  return (
    <Box flexDirection="row" width="100%" height={24}>
      {/* 1. TOOLBAR */}
      <Box width={25} borderStyle="single" flexDirection="column" paddingX={1}>
        <Text bold underline>
          TOOLS
        </Text>
        <Box flexDirection="column" marginTop={1}>
          <Text> [R] Rectangle </Text>
          <Text> [L] Line </Text>
          <Text> [T] Text Box </Text>
          <Text> [I] Image (ASCII) </Text>
        </Box>
        <Box marginTop={1}>
          <Text color="yellow" bold>
            [A] Add from Registry
          </Text>
        </Box>
      </Box>

      {/* 2. THE CANVAS (Center) */}
      <Box
        flexGrow={1}
        borderStyle="double"
        borderColor="gray"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        {/* We would map over our 'placedComponents' array here */}
        <Text dimColor>Drag components here...</Text>
        <Text dimColor>Press 'A' to open Library</Text>

        {/* Library Modal Overlay */}
        {showLibrary && (
          <Box
            position="absolute"
            borderStyle="round"
            borderColor="cyan"
            flexDirection="column"
            padding={1}
            width={40}
          >
            <Text bold color="cyan" underline>
              Registry Components:
            </Text>
            <SelectableList
              items={[
                "button",
                "card",
                "list",
                "tabs",
                "badge",
                "shell",
                "table",
                "input",
                "progress",
              ]}
            />
            <Box marginTop={1}>
              <Text dimColor>Press Enter to add • Esc to close</Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* 3. INSPECTOR PANEL (Right) */}
      <Box width={30} borderStyle="single" flexDirection="column" paddingX={1}>
        <Text bold underline>
          INSPECTOR
        </Text>
        <Box marginTop={1}>
          {!selectedComponent ? (
            <Text dimColor>Select a component to edit props</Text>
          ) : (
            <Box flexDirection="column">
              <Text>Label: [ Deploy ]</Text>
              <Text>Color: [ Green ]</Text>
              <Text>Border: [ Rounded ]</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

render(<Designer />);
