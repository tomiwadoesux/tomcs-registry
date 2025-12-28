#!/usr/bin/env node
import React from "react";
import { render, Box, Text } from "ink";
import { Designer } from "./designer.js";
import fs from "fs";
import path from "path";

// Parse arguments
const args = process.argv.slice(2);
const command = args[0] || "design"; // Default to design if no arg? Or maybe help.

const Help = () => (
  <Box flexDirection="column" padding={1}>
    <Text bold color="cyan">
      tomcs - terminal ui designer & engine
    </Text>
    <Box marginTop={1}>
      <Text>Usage: </Text>
      <Text color="yellow">tomcs &lt;command&gt;</Text>
    </Box>
    <Box marginTop={1} flexDirection="column">
      <Text bold>Commands:</Text>
      <Box marginLeft={2} flexDirection="column">
        <Box>
          <Text color="green" bold>
            init
          </Text>
          <Text> Initialize a new tomcs project in the current directory</Text>
        </Box>
        <Box>
          <Text color="green" bold>
            design
          </Text>
          <Text> Launch the visual designer</Text>
        </Box>
        <Box>
          <Text color="green" bold>
            start
          </Text>
          <Text> Run the generated application (src/app.tsx)</Text>
        </Box>
        <Box>
          <Text color="green" bold>
            help
          </Text>
          <Text> Show this help message</Text>
        </Box>
      </Box>
    </Box>
    <Box marginTop={1} flexDirection="column">
      <Text bold>Quick Start:</Text>
      <Box marginLeft={2} flexDirection="column">
        <Text>To launch the designer, run:</Text>
        <Text color="yellow"> npx tomcs design</Text>
      </Box>
    </Box>
  </Box>
);

const run = async () => {
  if (command === "init") {
    console.log("Initializing tomcs project...");

    // Create tomcs.json
    const configPath = path.join(process.cwd(), "tomcs.json");
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(
        configPath,
        JSON.stringify({ name: "my-tomcs-app", version: "0.1.0" }, null, 2)
      );
      console.log("✅ Created tomcs.json");
    } else {
      console.log("⚠️ tomcs.json already exists");
    }

    // Create src/app.tsx
    const appPath = path.join(process.cwd(), "src", "app.tsx");
    const srcDir = path.join(process.cwd(), "src");
    if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

    if (!fs.existsSync(appPath)) {
      const boilerplate = `import React from 'react';
import { Box, Text } from 'ink';

export const GeneratedUI = () => (
  <Box borderStyle="single" borderColor="cyan" padding={1}>
     <Text>Welcome to your new Tomcs App!</Text>
  </Box>
);
`;
      fs.writeFileSync(appPath, boilerplate);
      console.log("✅ Created src/app.tsx");
    } else {
      console.log("⚠️ src/app.tsx already exists");
    }

    console.log("\nDone! Run 'tomcs design' to start designing.");
    process.exit(0);
  }

  if (command === "help" || command === "--help" || command === "-h") {
    render(<Help />);
    return;
  }

  if (command === "design") {
    // Enter Alternate Screen Buffer
    process.stdout.write("\\x1b[?1049h");
    const { waitUntilExit } = render(<Designer />);

    // Restore Main Screen Buffer on exit
    await waitUntilExit();
    process.stdout.write("\\x1b[?1049l");
    return;
  }

  if (command === "start") {
    // In a real CLI, we might import the user's app.tsx dynamically
    // For now, let's just use spawn or tell them?
    // Or we can try to import it if it's in the same project.
    console.log("To starts your app, run: npx tsx src/app.tsx");
    // Or we could actually run it if we knew the path.
    return;
  }

  // Fallback
  render(<Help />);
};

run();
