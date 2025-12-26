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

// COMMAND: add [component]
program
  .command("add")
  .description("Add components to your project")
  .argument("[component]", "the component to add")
  .option("-a, --all", "add all available components from the registry")
  .action(async (component, options) => {
    // TODO: Replace with your actual GitHub username/repo if different
    const REGISTRY_URL =
      "https://raw.githubusercontent.com/tomiwadoesux/tomcs-registry/main";

    try {
      // 1. Fetch the manifest
      console.log(chalk.blue(`Fetching manifest from ${REGISTRY_URL}...`));
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
          // The manifest "files" are relative to "registry/" in the repo structure we defined earlier
          // e.g. "components/button.tsx"
          // So we fetch from ${REGISTRY_URL}/registry/${fileName}

          const fileUrl = `${REGISTRY_URL}/registry/${fileName}`;
          // console.log(chalk.dim(`Downloading ${fileUrl}...`)); // Optional verbose logging

          const sourceCode = await fetch(fileUrl).then((res) => {
            if (!res.ok)
              throw new Error(`Failed to fetch ${fileName}: ${res.statusText}`);
            return res.text();
          });

          // We want to save to src/components/ui/filename.tsx
          // The fileName from manifest includes "components/" prefix likely?
          // Let's check the manifest structure: "files": ["components/button.tsx"]
          // We want to write to src/components/ui/button.tsx
          // So we take the basename.

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

      console.log(chalk.bold.magenta("\n🚀 tomcs design system is ready!"));
    } catch (error) {
      console.error(chalk.red("Error fetching from registry:"), error.message);
    }
  });

program.parse();
