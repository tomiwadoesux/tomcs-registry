# tomcs

**The Visual IDE for Terminal User Interfaces.**

tomcs is a design-engineering tool built with React and [Ink](https://github.com/vadimdemedes/ink). It allows you to design, theme, and architect professional CLI applications using a visual canvas and an AI-powered compiler.

## Core Systems

### 1. The Designer

A mouse-supported WYSIWYG editor for the terminal. It uses a **Fluid Viewport Engine** to ensure designs remain visible and scaled correctly regardless of the terminal window size.

### 2. The AI Architect

Integrated with **Groq (Llama 3.3 70B)**, the Architect acts as a visual compiler.

- **Porting**: Paste Shadcn/Tailwind code to translate web layouts into terminal character grids.
- **Prompting**: Use natural language to generate complex multi-component layouts.
- **Theming**: Globally update design systems (colors, borders, variants) via the AI engine.

### 3. Hot-Module Sync (HMR)

The designer features a real-time bridge to your local filesystem. Every manipulation on the canvas triggers `fs.writeFileSync` to your source code (`app.tsx`), enabling a seamless design-to-code loop.

### 4. Logic Binding

Connect UI components to live system data. By pressing **K** on a selected component, you can bind it to any bash command. tomcs handles the reactive state updates and interval execution through a dedicated `useTomcsLogic` hook.

## Quick Start

1.  **Launch the Designer**: Run `npx tomcs` (or `npx tsx src/cli.tsx design`) in your primary terminal to start the visual editor.
2.  **Start Live Preview**: In a second terminal window, run `npx tsx watch src/app.tsx`. This uses the "watch" mode to instantly re-render your TUI every time the designer saves a change.
3.  **Architect & Design**: Use **[P]** to prompt the AI or use the mouse to move components. You will see the Live Preview window update in real-time.
4.  **Bind & Test**: Press **[K]** to attach a bash command (like `uptime`). The Live Preview will immediately start showing that real-world data.

## Accessibility

Includes an **AI-driven A11y Auditor** to scan layouts for focus traps, missing labels, and contrast issues, ensuring your terminal tools meet professional standards.
