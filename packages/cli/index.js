#!/usr/bin/env node
const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const program = new Command();

program
  .name("tomcs")
  .description("The shadcn for terminal user interfaces")
  .version("0.1.0");

// COMMAND: init
program
  .command("init")
  .description("Initialize your project for tomcs components")
  .action(async () => {
    const projectPath = process.cwd();

    // 1. Create the components folder
    const uiDir = path.join(projectPath, "src/components/ui");
    await fs.ensureDir(uiDir);

    // 2. Create a tomcs.json config
    const config = {
      style: "default",
      paths: { components: "@/components/ui" },
    };
    await fs.writeJSON(path.join(projectPath, "tomcs.json"), config, {
      spaces: 2,
    });

    console.log(
      chalk.green("✔ Project initialized. Created src/components/ui")
    );
  });

const fetch = require("node-fetch");

// TODO: Replace with your actual GitHub username/repo
const REGISTRY_URL =
  "https://raw.githubusercontent.com/tomiwadoesux/tomcs-registry/main";

program
  .command("add")
  .description("Add a component to your project")
  .argument("<component>", "the component to add")
  .action(async (component) => {
    // 1. Fetch the manifest
    console.log(chalk.blue(`Fetching manifest from ${REGISTRY_URL}...`));
    try {
      const manifestUrl = `${REGISTRY_URL}/registry/index.json`;
      const manifest = await fetch(manifestUrl).then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch manifest: ${res.statusText}`);
        return res.json();
      });

      if (!manifest.components[component]) {
        console.log(
          chalk.red(`✘ Component "${component}" not found in registry.`)
        );
        return;
      }

      const componentDef = manifest.components[component];
      const targetDir = path.join(process.cwd(), "src/components/ui");
      await fs.ensureDir(targetDir);

      // 2. Download the files
      for (const file of componentDef.files) {
        // file is like "components/button.tsx"
        // We want to fetch it from registry/components/button.tsx
        // The registry structure in the manifest assumes "components/button.tsx" is relative to "registry/" potentially?
        // Let's assume the manifest "files" paths are relative to the registry root.

        // Actually, looking at the user's setup:
        // /registry
        //   /components
        //     button.tsx
        //   index.json
        // And the manifest has: "files": ["components/button.tsx"]
        // So the URL should be REGISTRY_URL + "/registry/" + file path

        const fileUrl = `${REGISTRY_URL}/registry/${file}`;
        console.log(chalk.cyan(`Downloading ${fileUrl}...`));

        const sourceCode = await fetch(fileUrl).then((res) => {
          if (!res.ok)
            throw new Error(`Failed to fetch ${file}: ${res.statusText}`);
          return res.text();
        });

        // 3. Write to local project
        // We write to src/components/ui/filename.tsx
        const fileName = path.basename(file);
        const targetPath = path.join(targetDir, fileName);

        await fs.writeFile(targetPath, sourceCode);
        console.log(
          chalk.green(`✔ Added ${fileName} to src/components/ui/${fileName}`)
        );
      }
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  });

program.parse();
