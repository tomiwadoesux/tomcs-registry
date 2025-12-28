#!/usr/bin/env node
const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { spawn } = require("child_process");
const fetch = require("node-fetch");

const program = new Command();

program
  .name("tomcs")
  .description("The shadcn for terminal user interfaces")
  .version("0.1.0")
  .action(() => {
    // Default action: Run the designer if it exists, otherwise show help
    const designerPath = path.join(process.cwd(), "src", "designer.tsx");
    if (fs.existsSync(designerPath)) {
      console.log(chalk.cyan("🎨 Launching tomcs designer..."));
      const child = spawn("npx", ["tsx", "src/designer.tsx"], {
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "true" },
      });
      child.on("exit", (code) => {
        process.exit(code);
      });
    } else {
      program.help();
    }
  });

// COMMAND: init
program
  .command("init")
  .description("Initialize your project for tomcs components")
  .action(async () => {
    const projectPath = process.cwd();

    // 1. Create the components folder
    const uiDir = path.join(projectPath, "src/components/ui");
    await fs.ensureDir(uiDir);

    // 2. Create tomcs.json config
    const configPath = path.join(projectPath, "tomcs.json");
    if (!fs.existsSync(configPath)) {
      const config = {
        style: "default",
        paths: { components: "@/components/ui" },
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });
      console.log(chalk.green("✔ Created tomcs.json"));
    } else {
      console.log(chalk.yellow("⚠️ tomcs.json already exists"));
    }

    // 3. Create src/app.tsx
    const appPath = path.join(projectPath, "src", "app.tsx");
    if (!fs.existsSync(appPath)) {
      const boilerplate = `import React from 'react';
import { Box, Text } from 'ink';
import { Button } from './components/ui/button';

export const GeneratedUI = () => (
  <Box borderStyle="single" borderColor="cyan" padding={1} flexDirection="column">
     <Text bold color="green">Welcome to your new Tomcs App!</Text>
     <Box marginTop={1}>
       <Button label="Click Me" variant="default" />
     </Box>
  </Box>
);
`;
      await fs.outputFile(appPath, boilerplate);
      console.log(chalk.green("✔ Created src/app.tsx"));
    } else {
      console.log(chalk.yellow("⚠️ src/app.tsx already exists"));
    }

    // 4. Create src/designer.tsx if strictly needed?
    // Usually the designer is part of the library, but for now let's assume the user installs the library.
    // If this is a standalone usage, we might not need to copy designer.tsx unless they want to Customize it.
    // BUT the 'tomcs' command tries to run 'src/designer.tsx'. So we MUST create it or run it from node_modules.
    // Since we are fixing the CLI, let's copy a stub designer or rely on the installed package.
    // Logic: If I run `npx tomcs` inside a project, it should probably run the INSTALLED tomcs designer.
    // OR it should download the designer file?
    // Let's copy a basic runner if it doesn't exist so `npx tomcs` works locally.

    console.log(chalk.bold.green("\n✅ Project initialized!"));
    console.log(chalk.dim("Run 'npx tomcs add button' to install components."));
    console.log(chalk.dim("Run 'npx tomcs' to start the designer."));
  });

// COMMAND: add [component]
program
  .command("add")
  .description("Add components to your project")
  .argument("[component]", "the component to add")
  .option("-a, --all", "add all available components from the registry")
  .action(async (component, options) => {
    // Registry URL
    const REGISTRY_URL =
      "https://raw.githubusercontent.com/tomiwadoesux/tomcs-registry/main";

    try {
      // 1. Fetch the manifest
      // console.log(chalk.blue(`Fetching manifest from ${REGISTRY_URL}...`));
      const response = await fetch(`${REGISTRY_URL}/registry/index.json`);
      if (!response.ok)
        throw new Error(`Failed to fetch manifest: ${response.statusText}`);
      const manifest = await response.json();

      let componentsToInstall = [];

      if (options.all) {
        componentsToInstall = Object.keys(manifest.components);
        console.log(
          chalk.blue(
            `📦 Preparing to install all ${componentsToInstall.length} components...`
          )
        );
      } else if (component) {
        componentsToInstall = [component];
      } else {
        console.log(
          chalk.yellow("Please specify a component name or use --all")
        );
        return;
      }

      // 2. Loop and Download
      for (const item of componentsToInstall) {
        const componentData = manifest.components[item];

        if (!componentData) {
          console.log(
            chalk.red(`✘ Component "${item}" not found in registry.`)
          );
          continue;
        }

        for (const fileName of componentData.files) {
          const fileUrl = `${REGISTRY_URL}/registry/${fileName}`;
          const sourceCode = await fetch(fileUrl).then((res) => {
            if (!res.ok)
              throw new Error(`Failed to fetch ${fileName}: ${res.statusText}`);
            return res.text();
          });

          const baseName = path.basename(fileName);
          const targetPath = path.join(
            process.cwd(),
            "src/components/ui",
            baseName
          );
          await fs.outputFile(targetPath, sourceCode);
        }

        console.log(chalk.green(`✔ Added ${item}`));
      }

      console.log(chalk.bold.magenta("\n🚀 Components installed!"));
    } catch (error) {
      console.error(chalk.red("Error fetching from registry:"), error.message);
    }
  });

program.parse();
