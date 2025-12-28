# tomcs

**The Visual IDE for Terminal User Interfaces.**

tomcs is a design-engineering tool built with React and [Ink](https://github.com/vadimdemedes/ink). It allows you to design, theme, and architect professional CLI applications using a visual canvas and an AI-powered compiler.

## Quick Start

To build a professional TUI in minutes, use the tomcs bidirectional design loop.

### 1. Launch the Designer

In your project root, run the designer. This is where you will architect your UI using the AI Porter or the manual Registry.

```bash
npx tomcs
```

### 2. Start Live Preview

Open a **second terminal window** and run the preview. Because tomcs uses Hot-Module Sync, this window will re-render instantly every time you move a component in the designer.

```bash
npx tsx watch src/app.tsx
```

### 3. Design and Bind

- **Architect**: Press `[P]` to describe a layout or paste Shadcn code.
- **Manual**: Use `[A]` to browse the Component Registry.
- **Logic**: Select a component and press `[K]` to bind it to a live bash command (e.g., `uptime -p`).
- **Sync**: Watch your code update in your editor and the live preview update in your second terminal.

---

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

---

## Accessibility

Includes an **AI-driven A11y Auditor** to scan layouts for focus traps, missing labels, and contrast issues, ensuring your terminal tools meet professional standards.

---

## Local Development

To test the binary locally before publishing:

```bash
npm link
tomcs
```
