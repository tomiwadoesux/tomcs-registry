import React from "react";
import { render, Box, Text } from "ink";
import { FocusProvider } from "./hooks/use-focus";
import { Shell } from "./components/ui/shell";
import { SelectableList } from "./components/ui/list";
import { Card } from "./components/ui/card";

const App = () => {
  return (
    <FocusProvider>
      <Shell title="tomcs dashboard">
        <Box flexDirection="row" gap={2}>
          {/* Sidebar */}
          <Box
            width={20}
            flexDirection="column"
            borderStyle="single"
            paddingX={1}
          >
            <Text bold underline>
              Menu
            </Text>
            <SelectableList
              items={["Overview", "Services", "Logs", "Settings"]}
            />
          </Box>

          {/* Main View */}
          <Box flexGrow={1}>
            <Card title="System Performance">
              <Text>Storage: [■■■■■■■■□□] 80%</Text>
              <Text>Uptime: 12h 43m</Text>
            </Card>
          </Box>
        </Box>
      </Shell>
    </FocusProvider>
  );
};

render(<App />);
