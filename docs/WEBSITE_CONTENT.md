# tomcs Website Content Plan

This document outlines the detailed content strategy for the `tomcs` website, serving as both a marketing landing page and a documentation hub.

## 1. Homepage (The "Hook")

**Goal:** Captivate the user immediately by explaining that `tomcs` is a _visual_ tool for building _terminal_ applications.

### Hero Section

- **Headline**: "Build Professional Terminal UIs at the Speed of Thought."
- **Sub-headline**: "A Visual IDE and AI Architect for React Ink. Design with a mouse, bind logic with a keystroke, and ship binaries in minutes."
- **Primary Call to Action (CTA)**:
  ```bash
  npx tomcs
  ```
  _(Button to copy command)_
- **Visuals**: A side-by-side comparison or split-screen GIF:
  - **Left**: User dragging a "Card" component on the `tomcs` TUI canvas.
  - **Right**: VS Code editor showing the code automatically generating and updating in real-time.

### Key Features Grid

- **🎨 Visual Designer**: A true WYSIWYG editor running natively _inside_ your terminal.
- **🤖 AI Architect**: Press `[P]` to use natural language (e.g., "Create a dashboard with 3 status cards") to generate layouts instantly using Groq (Llama 3).
- **⚡ Logic Binding**: Press `[K]` to connect any UI element to live bash commands (e.g., bind a badge to `uptime` or `git branch`).
- **📐 Fluid Viewport**: Designs that automatically scale to look perfect on any terminal window size.

---

## 2. Installation & Setup (The "How-To")

**Goal:** Provide clear, copy-paste instructions to get the user from zero to running the designer.

### Prerequisites

- **Node.js**: Version 18+ (Required for modern Ink support).
- **Terminal**: A mouse-enabled terminal like iTerm2, Hyper, or VS Code Integrated Terminal.

### Quick Start Guide

Follow these steps to "turn up the designer":

#### 1. Scaffold a New Project

Create a standard React Ink project structure.

```bash
npx create-ink-app my-tomcs-app
cd my-tomcs-app
```

#### 2. Initialize tomcs

Set up the `src/components/ui` directory and generate the `tomcs.json` configuration file.

```bash
npx tomcs init
```

_Note: This pulls the necessary design tokens and component registry to your local project._

#### 3. Launch the Designer

Start the visual interface overlay in your terminal.

```bash
npx tomcs
```

_Action: You can now use your mouse to interact with the grid._

#### 4. Start Live Preview

Open a **second terminal window** to watch your compiled app concurrently.

```bash
npx tsx watch src/app.tsx
```

_Note: Because `tomcs` writes to the filesystem, Hot-Module Replacement (HMR) will update this view instantly._

---

## 3. The Designer Manual (Core Concepts)

**Goal:** Teach the user the controls and workflow of the visual editor.

### Interface Overview

- **Canvas**: The central infinite drawing area using the **Fluid Viewport Engine**. It maps 100x30 virtual coordinates to your actual terminal size.
- **Toolbar (Top)**: Quick access to primitives and tools.
- **Layers (Left)**: Selecting components using keys `[1-9]` or mouse to reorder or delete.

### Controls & Shortcuts

| Key            | Action         | Description                                                                                              |
| :------------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| **`[A]`**      | **Registry**   | Opens the Component Library popup formatted as a searchable list.                                        |
| **`[P]`**      | **AI Porter**  | Opens the AI Prompt input. Paste Shadcn/React code or type natural language prompts to generate layouts. |
| **`[K]`**      | **Logic Bind** | Select a component + `K` -> enter a bash command (e.g., `date`) to make the text dynamic.                |
| **`[E]`**      | **Export**     | Dumps the current layout as raw React code to clipboard or file.                                         |
| **`[Delete]`** | **Remove**     | Deletes the currently selected component.                                                                |

---

## 4. Component Registry

**Goal:** A reference for all available UI building blocks.

- **Box/Rect**: Simple container with borders (`width`, `height`, `borderStyle`, `color`).
- **Text**: Basic typography with color and dimming options.
- **Banner**: Large ASCII Art text rendering using `figlet`.
- **Button**: Interactive elements with `default`, `destructive`, and `outline` variants.
- **Card**: Standard container with a title header and content body.
- **Image**: **ASCII Converter**. Takes a file path, resizes it, and renders it as text characters based on density.
- **Spinner**: Loading indicators (`dots`, `line`).
- **List**: Vertical scrollable lists.
- **Tabs**: Tabbed interface for switching views.
- **Badge**: Status indicators (e.g., "Online", "Error").

---

## 5. Technical Deep Dives (Under the Hood)

**Goal:** Explain the engineering magic for advanced users.

### 🧠 Logic Engine (`useTomcsLogic`)

- **Mechanism**: Injects a custom `useEffect` hook.
- **Execution**: Spawns a Node.js `child_process`.
- **Interval**: Runs the bound bash command every 2000ms by default.
- **State**: Pipes `stdout` directly to the React component's prop (e.g., `children` or `label`).

### 🖼️ ASCII Converter

- **Process**: Uses `sharp` to process images.
- **Algorithm**: Resizes image to terminal width -> Maps pixel brightness (0-255) to a density string (`$@B%...`).
- **Correction**: Skips every second line to account for the ~2:1 aspect ratio of terminal fonts.

### 🔄 Hot-Module Sync (HMR)

- **Architecture**: The Designer (`designer.tsx`) acts as a real-time compiler.
- **Serialization**: `placedComponents` stat is serialized into valid JSX strings.
- **Sync**: Performs a raw `fs.writeFileSync` to `src/app.tsx`, triggering `tsx watch` in the secondary terminal.
