#!/usr/bin/env node
const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { spawn } = require("child_process");
const fetch = require("node-fetch");

// --- CUSTOM HELP ---
// --- CUSTOM HELP ---
const printHelp = () => {
  console.log(
    chalk.bold.cyan("\n  tomcs - The Terminal User Interface Design Engine\n")
  );

  console.log(chalk.bold("  Usage:"));
  console.log(chalk.yellow("    npx tomcs [options] [command]\n"));

  console.log(chalk.bold("  Commands:"));
  console.log(
    `    ${chalk.green(
      "init"
    )}       Initialize project & install default components`
  );
  console.log(
    `    ${chalk.green(
      "add"
    )}        Add a component (e.g. npx tomcs add button)`
  );
  console.log(`    ${chalk.green("designer")}   Launch the visual designer`);
  console.log(`    ${chalk.green("help")}       Show this help message\n`);

  console.log(chalk.bold("  How to run the Designer:"));
  console.log(
    `    Run ${chalk.yellow("npx tomcs designer")} or simply ${chalk.yellow(
      "npx tomcs"
    )} in your project root.\n`
  );

  console.log(chalk.bold("  Designer Controls:"));
  console.log(
    `    ${chalk.cyan("[A]")}   Registry      ${chalk.dim(
      "Opens the Component Library popup"
    )}`
  );
  console.log(
    `    ${chalk.cyan("[P]")}   AI Porter     ${chalk.dim(
      "Natural language layout generation"
    )}`
  );
  console.log(
    `    ${chalk.cyan("[K]")}   Logic Bind    ${chalk.dim(
      "Connect elements to bash commands"
    )}`
  );
  console.log(
    `    ${chalk.cyan("[E]")}   Export        ${chalk.dim(
      "Dumps current layout as raw React code"
    )}`
  );
  console.log(
    `    ${chalk.cyan("[Del]")} Remove        ${chalk.dim(
      "Deletes the currently selected component"
    )}\n`
  );

  console.log(chalk.bold("  Features:"));
  console.log(
    `    ${chalk.magenta(
      "Logic Engine"
    )}      Running bound bash commands & piping stdout`
  );
  console.log(
    `    ${chalk.magenta(
      "ASCII Converter"
    )}   Resizes images & maps to density strings`
  );
  console.log(
    `    ${chalk.magenta(
      "Hot-Module Sync"
    )}   Designer acts as a real-time compiler\n`
  );
};

const program = new Command();

// --- MANUAL HELP CHECK ---
if (
  process.argv.includes("-h") ||
  process.argv.includes("--help") ||
  process.argv.includes("help")
) {
  printHelp();
  process.exit(0);
}

const runDesigner = () => {
  const designerPath = path.join(process.cwd(), "src", "designer.tsx");

  if (fs.existsSync(designerPath)) {
    // Dependency Check
    const inkPath = path.join(process.cwd(), "node_modules", "ink");
    if (!fs.existsSync(inkPath)) {
      console.log(chalk.red("\n❌ Dependencies not found!"));
      console.log(
        chalk.yellow(
          "It seems you haven't installed the required packages yet."
        )
      );
      console.log("Please run:\n");
      console.log(
        chalk.cyan(
          "npm install ink react react-dom ink-gradient ink-big-text sharp groq-sdk dotenv tsx import-jsx --save"
        )
      );
      console.log(
        chalk.cyan(
          "npm install -D @types/react @types/node typescript --save-dev"
        )
      );
      process.exit(1);
    }

    console.log(chalk.cyan("🎨 Launching tomcs designer..."));
    const child = spawn("npx", ["tsx", "src/designer.tsx"], {
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "true" },
    });
    child.on("exit", (code) => {
      process.exit(code);
    });
  } else {
    // If designer is missing, maybe they need to init?
    console.log(chalk.yellow("⚠️  src/designer.tsx not found."));
    console.log(`Run ${chalk.green("npx tomcs init")} to set up your project.`);
  }
};

program
  .name("tomcs")
  .description("The shadcn for terminal user interfaces")
  .version("0.1.0")
  .helpOption(false)
  .action(() => {
    // Default action
    runDesigner();
  });

// COMMAND: designer
program
  .command("designer")
  .description("Launch the visual designer")
  .action(() => {
    runDesigner();
  });

// COMMAND: init
program
  .command("init")
  .description("Initialize your project for tomcs components")
  .action(async () => {
    const projectPath = process.cwd();
    const REGISTRY_URL =
      "https://raw.githubusercontent.com/tomiwadoesux/tomcs-registry/main";

    console.log(chalk.bold("Initializing tomcs project..."));

    // 1. Create directories
    console.log(chalk.dim("📁 Creating directories..."));
    await fs.ensureDir(path.join(projectPath, "src/components/ui"));
    await fs.ensureDir(path.join(projectPath, "src/hooks"));
    await fs.ensureDir(path.join(projectPath, "src/lib"));

    // 2. Create tomcs.json config
    const configPath = path.join(projectPath, "tomcs.json");
    if (!fs.existsSync(configPath)) {
      const config = {
        style: "default",
        paths: {
          components: "@/components/ui",
          hooks: "@/hooks",
          lib: "@/lib",
        },
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });
      console.log(chalk.green("✔ Created tomcs.json"));
    }

    // 3. Create src/app.tsx
    const appPath = path.join(projectPath, "src", "app.tsx");
    if (!fs.existsSync(appPath)) {
      const boilerplate = `import React from 'react';
import { Box, Text } from 'ink';
import { Button } from './components/ui/button.js';

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
    }

    // 4. Install ALL components + Designer from Registry
    // We want the user to have a fully working environment
    try {
      console.log(chalk.blue(`⬇️  Fetching components and designer...`));

      const response = await fetch(`${REGISTRY_URL}/registry/index.json`);
      if (!response.ok) throw new Error("Failed to fetch registry manifest");
      const manifest = await response.json();

      // Install ALL defined components
      const componentsToInstall = Object.keys(manifest.components);

      for (const item of componentsToInstall) {
        const componentData = manifest.components[item];
        if (!componentData) continue;

        for (const fileName of componentData.files) {
          // fileName could be "components/button.tsx" or "hooks/use-mouse.ts"
          const fileUrl = `${REGISTRY_URL}/registry/${fileName}`;
          const sourceCode = await fetch(fileUrl).then((res) => {
            if (!res.ok) throw new Error(`Failed to download ${fileName}`);
            return res.text();
          });

          // Determine target path based on file type
          // If "components/..." -> src/components/ui/basename
          // If "hooks/..." -> src/hooks/basename
          // If "lib/..." -> src/lib/basename
          let targetDir = "";
          if (fileName.startsWith("components/"))
            targetDir = "src/components/ui";
          if (fileName.startsWith("hooks/")) targetDir = "src/hooks";
          if (fileName.startsWith("lib/")) targetDir = "src/lib";

          if (item === "designer" && fileName.includes("designer.tsx")) {
            // Special case: designer goes to src/designer.tsx
            targetDir = "src";
          }

          if (targetDir) {
            const targetPath = path.join(
              projectPath,
              targetDir,
              path.basename(fileName)
            );
            await fs.outputFile(targetPath, sourceCode);
          }
        }
      }
      console.log(
        chalk.green(
          `✔ Installed ${componentsToInstall.length} components (including Designer)`
        )
      );
    } catch (e) {
      console.error(chalk.red("⚠️  Failed to fetch components:"), e.message);
      console.log(
        chalk.yellow(
          "    (You might need to check your internet or run 'npx tomcs add --all' later)"
        )
      );
    }

    console.log(chalk.bold.green("\n✅ Project initialized successfully!"));

    // 5. Dependency Warning
    console.log(
      chalk.bold.yellow("\n⚠️  Action Required: Install Dependencies")
    );
    console.log("Tomcs requires default React & Ink dependencies to run.");
    console.log("Run the following command to install them:\n");
    console.log(
      chalk.cyan(
        "npm install ink react react-dom ink-gradient ink-big-text sharp groq-sdk dotenv tsx import-jsx --save"
      )
    );
    console.log(
      chalk.cyan(
        "npm install -D @types/react @types/node typescript --save-dev"
      )
    );

    console.log(chalk.dim("\nThen launch the designer with:"));
    console.log(chalk.white("npx tomcs designer"));
  });

// COMMAND: add [component]
program
  .command("add")
  .description("Add components to your project")
  .argument("[component]", "the component to add")
  .option("-a, --all", "add all available components from the registry")
  .action(async (component, options) => {
    const REGISTRY_URL =
      "https://raw.githubusercontent.com/tomiwadoesux/tomcs-registry/main";

    try {
      const response = await fetch(`${REGISTRY_URL}/registry/index.json`);
      if (!response.ok) throw new Error("Failed to fetch manifest");
      const manifest = await response.json();

      let componentsToInstall = [];
      if (options.all) {
        componentsToInstall = Object.keys(manifest.components);
      } else if (component) {
        componentsToInstall = [component];
      } else {
        console.log(
          chalk.yellow("Please specify a component name or use --all")
        );
        return;
      }

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
            if (!res.ok) throw new Error(`Failed to fetch ${fileName}`);
            return res.text();
          });

          // Logic for placement
          let targetDir = "src/components/ui";
          if (fileName.startsWith("hooks/")) targetDir = "src/hooks";
          if (fileName.startsWith("lib/")) targetDir = "src/lib";
          if (item === "designer" && fileName.includes("designer.tsx"))
            targetDir = "src";

          const targetPath = path.join(
            projectPath,
            targetDir,
            path.basename(fileName)
          ); // Use projectPath?
          // Wait, 'add' doesn't define projectPath variable in scope yet like init does.
          // FIX: define projectPath or use process.cwd()
          const dest = path.join(
            process.cwd(),
            targetDir,
            path.basename(fileName)
          );
          await fs.outputFile(dest, sourceCode);
        }
        console.log(chalk.green(`✔ Added ${item}`));
      }
      console.log(chalk.bold.magenta("\n🚀 Done!"));
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
    }
  });

program.parse();
