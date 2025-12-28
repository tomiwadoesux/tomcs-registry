#!/usr/bin/env node
import React, { useState, useEffect } from "react";
import { Box, Text, render, useInput, useStdout } from "ink";
import { SelectableList } from "./components/ui/list.js";
import { Spinner } from "./components/ui/spinner.js";
import { Banner } from "./components/ui/banner.js";
import { Icon } from "./components/ui/icon.js";
import { Badge } from "./components/ui/badge.js";
import { Button } from "./components/ui/button.js";
import { Card } from "./components/ui/card.js";
import { Tabs } from "./components/ui/tabs.js";
import { useMouse } from "./hooks/use-mouse.js";
import { convertImageToAscii } from "./lib/ascii-converter.js";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import "dotenv/config";

// Helper to get Groq client safely
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

const LAYER_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
];

// Helper to list images
const listImages = () => {
  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) return [];

    return fs
      .readdirSync(publicDir)
      .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
      .map((file) => `public/${file}`);
  } catch (e) {
    return [];
  }
};

interface ComponentItem {
  id: string;
  type: string;
  x: number;
  y: number;
  label?: string;
  props?: Record<string, any>;
}

const autoSavePath = path.join(process.cwd(), "src/app.tsx"); // Target file to sync

const syncToFile = (components: ComponentItem[]) => {
  const imports = new Set(["Shell"]); // Start only with Shell, Box/Text come from ink

  // 1. Collect all active bindings
  const bindings = components
    .filter((c) => c.props?.binding)
    .reduce((acc, c) => ({ ...acc, [c.id]: c.props!.binding!.command }), {});

  const componentsStr = components
    .map((c) => {
      // Add dynamic imports based on component types
      if (!["rectangle", "line", "text", "image"].includes(c.type)) {
        imports.add(c.type.charAt(0).toUpperCase() + c.type.slice(1));
      }

      const props = `position="absolute" marginLeft={Math.floor((${c.x} / 100) * width)} marginTop={Math.floor((${c.y} / 30) * height)}`;

      // 2. If bound, use the live data instead of static text
      if (c.props?.binding) {
        // Determine which prop to bind based on component type
        let labelProp = "label"; // Default for Button, Badge
        if (c.type === "text") labelProp = "children"; // Text uses children
        if (c.type === "banner") labelProp = "text";
        if (c.type === "card") labelProp = "title"; // Bind title for cards? Or text? Let's assume text content for now inside.

        // Special handling for Text which renders as children
        if (c.type === "text") {
          return `<Text ${props}>{liveData['${c.id}'] || "${
            c.props.text || "Loading..."
          }"}</Text>`;
        }

        return `<${c.type.charAt(0).toUpperCase() + c.type.slice(1)} ${props} ${
          c.type === "banner" ? "text" : "label"
        }={liveData['${c.id}'] || "${c.props.text || "Loading..."}"} />`;
      }

      // Standard static export logic
      switch (c.type) {
        case "text":
          return `<Text ${props}>${c.props?.text || "Text"}</Text>`;
        case "image":
          return `<Box ${props}><Text>{\`${
            c.props?.ascii || ""
          }\`}</Text></Box>`;
        case "banner":
          return `<Banner ${props} text="${c.props?.text || "BANNER"}" />`;
        case "button":
          return `<Button ${props} label="${c.props?.text || "Button"}" />`;
        case "card":
          return `<Card ${props} title="${c.props?.title || "Card"}"><Text>${
            c.props?.text || "Content"
          }</Text></Card>`;
        case "line":
          return `<Text ${props}>────────────────</Text>`;
        default:
          return `<${
            c.type.charAt(0).toUpperCase() + c.type.slice(1)
          } ${props} ${c.props?.text ? `label="${c.props.text}"` : ""} />`;
      }
    })
    .join("\n    ");

  const fullCode = `import React from 'react';
import { Box, Text, useStdout } from 'ink';
import { useTomcsLogic } from './hooks/use-logic.js';
import { ${Array.from(imports).join(", ")} } from './components/ui/index.js';

export const GeneratedUI = () => {
  const { stdout } = useStdout();
  const width = stdout.columns || 80;
  const height = stdout.rows || 24;
  const liveData = useTomcsLogic(${JSON.stringify(bindings)});

  return (
    // <Shell title="Generated App">
    <Box width="100%" height="100%">
      ${componentsStr}
    </Box>
    // </Shell>
  );
};`;

  try {
    fs.writeFileSync(autoSavePath, fullCode); // Overwrite the file in real-time
  } catch (e) {
    // Handle write errors silently during design
  }
};

// Render the actual component based on type
const RenderComponent = ({
  type,
  isSelected,
  props,
}: {
  type: string;
  isSelected: boolean;
  props?: any;
}) => {
  const borderColor = isSelected ? "green" : "gray";

  switch (type) {
    case "spinner":
      return <Spinner type="dots" color="cyan" />;
    case "banner":
      return <Banner text={props?.text || "BANNER"} color="magenta" />;
    case "icon":
      return <Icon name={props?.name || "github"} color="white" />;
    case "badge":
      return <Badge label={props?.text || "Badge"} variant="success" />;
    case "button":
      return <Button label={props?.text || "Button"} variant="default" />;
    case "card":
      return (
        <Card title={props?.title || "Card"}>
          <Text>{props?.text || "Content"}</Text>
        </Card>
      );
    case "tabs":
      return (
        <Tabs
          items={props?.items || ["Tab 1", "Tab 2"]}
          activeTab={props?.items?.[0] || "Tab 1"}
          onChange={() => {}}
        />
      );
    case "rectangle":
      return (
        <Box
          borderStyle="single"
          borderColor={borderColor}
          width={12}
          height={4}
        >
          <Text dimColor>Rect</Text>
        </Box>
      );
    case "line":
      return <Text color="white">────────────────</Text>;
    case "text":
      return <Text>{props?.text || "Edit Me"}</Text>;
    case "image":
      return (
        <Box borderStyle="single" borderColor={borderColor} paddingX={1}>
          {props?.ascii ? (
            <Text>{props.ascii}</Text>
          ) : (
            <Text dimColor>[Image]</Text>
          )}
        </Box>
      );
    case "list":
      return (
        <Box borderStyle="single" borderColor={borderColor} paddingX={1}>
          {(props?.items || ["Item 1", "Item 2"]).map((i: string) => (
            <Text key={i}>{i}</Text>
          ))}
        </Box>
      );
    default:
      return (
        <Box borderStyle="single" borderColor={borderColor} paddingX={1}>
          <Text>{type}</Text>
        </Box>
      );
  }
};

export const Designer = () => {
  const { stdout } = useStdout();
  const [terminalSize, setTerminalSize] = useState({
    width: stdout.columns || 80,
    height: stdout.rows || 24,
  });

  // Virtual Design Canvas Size (What the AI uses)
  const VIRTUAL_WIDTH = 100;
  const VIRTUAL_HEIGHT = 30;

  useEffect(() => {
    const handleResize = () => {
      setTerminalSize({ width: stdout.columns, height: stdout.rows });
    };
    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  // Calculate the scaling factor for the canvas
  const canvasAreaWidth = terminalSize.width - 25; // Minus Sidebar
  const scaleX = canvasAreaWidth / VIRTUAL_WIDTH;
  const scaleY = (terminalSize.height - 10) / VIRTUAL_HEIGHT; // Minus Header

  const mouse = useMouse();

  useEffect(() => {
    // Process stdout writes for mouse tracking handles in use-mouse
  }, []);

  const [mode, setMode] = useState<
    | "IDLE"
    | "DRAGGING"
    | "EDITING"
    | "INPUT"
    | "IMAGE_PICKER"
    | "IMAGE_SIZE_PICKER"
  >("IDLE");
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [placedComponents, setPlacedComponents] = useState<ComponentItem[]>([]);

  // Input Modal State
  const [inputPrompt, setInputPrompt] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [pendingComponentType, setPendingComponentType] = useState<
    string | null
  >(null);

  // Image Picker State
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [pendingImageSize, setPendingImageSize] = useState<number>(40);

  // Library State
  const [showLibrary, setShowLibrary] = useState(false);

  // Drag State
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // --- EXPORT LOGIC ---
  const exportToCode = () => {
    const imports = new Set(["Box", "Text"]);
    const componentsStr = placedComponents
      .map((c) => {
        // Naive import adder
        if (
          c.type !== "rectangle" &&
          c.type !== "line" &&
          c.type !== "text" &&
          c.type !== "image"
        ) {
          imports.add(c.type.charAt(0).toUpperCase() + c.type.slice(1));
        }

        // Convert to props
        const props = `position="absolute" marginLeft={${c.x}} marginTop={${c.y}}`;

        switch (c.type) {
          case "text":
            return `<Text ${props}>${c.props?.text || "Text"}</Text>`;
          case "banner":
            return `<Banner ${props} text="${c.props?.text || "BANNER"}" />`;
          case "button":
            return `<Button ${props} label="${c.props?.text || "Button"}" />`;
          case "card":
            return `<Card ${props} title="${c.props?.title || "Card"}"><Text>${
              c.props?.text || "Content"
            }</Text></Card>`;
          case "image":
            return `<Box ${props}><Text>{\`${
              c.props?.ascii || ""
            }\`}</Text></Box>`;
          case "line":
            return `<Text ${props}>────────────────</Text>`;
          default:
            return `<Box ${props}><Text>${c.type}</Text></Box>`;
        }
      })
      .join("\n    ");

    const fullCode = `
import React from 'react';
import { Box, Text } from 'ink';
import { ${Array.from(imports).join(", ")} } from './components/ui';

export const GeneratedUI = () => (
  <Box width="100%" height="100%">
    ${componentsStr}
  </Box>
);`;

    // Output to console/modal
    setInputValue(fullCode); // Hack: show code in input box
    setInputPrompt("Generated Code (CMD+C to Copy)");
    setMode("INPUT");
  };

  // --- MOUSE & DRAG LOGIC ---
  useEffect(() => {
    if (mouse.action === "down") {
      const dims = { w: 10, h: 3 }; // Simplified hit testing for layers logic integration?
      // Actually, let's keep hit testing as is for main canvas
      // BUT we need to check if user clicked Sidebar?
      // Sidebar is x < 25.
      if (mouse.x < 25 && mouse.y > 3) {
        // Clicked Layer in Sidebar
        // Estimate index from Y position (header is line 0-2, list starts line 4?)
        // TODO: precise math
        return;
      }

      // Canvas Hit Test
      // Coordinate transformation needed if we have offsets?
      // We are using absolute positioning so screen coords ~ canvas coords if no offset

      // Find top-most component
      for (let i = placedComponents.length - 1; i >= 0; i--) {
        const c = placedComponents[i];
        // Simple generic fallback size for hit testing
        const w = 15,
          h = 4;
        if (
          mouse.x >= c.x &&
          mouse.x < c.x + w &&
          mouse.y >= c.y &&
          mouse.y < c.y + h
        ) {
          setSelectedComponent(c.id);
          setDragOffset({ x: mouse.x - c.x, y: mouse.y - c.y });
          setMode("DRAGGING");
          return;
        }
      }
      setSelectedComponent(null);
      setMode("IDLE");
    }

    if (mode === "DRAGGING" && mouse.isDown && selectedComponent) {
      setPlacedComponents((prev) =>
        prev.map((c) => {
          if (c.id === selectedComponent) {
            return {
              ...c,
              x: mouse.x - dragOffset.x,
              y: mouse.y - dragOffset.y,
            };
          }
          return c;
        })
      );
    }

    if (mouse.action === "up" && mode === "DRAGGING") setMode("IDLE");
    if (mouse.action === "up" && mode === "DRAGGING") setMode("IDLE");
  }, [mouse]);

  // Sync component changes
  useEffect(() => {
    if (mode === "IDLE") {
      syncToFile(placedComponents);
    }
  }, [placedComponents, mode]);

  // --- COMPONENT ADDITION ---
  const startAddComponent = (type: string) => {
    if (type === "image") {
      setPendingComponentType("image");
      setMode("IMAGE_SIZE_PICKER");
      return;
    }

    if (
      type === "banner" ||
      type === "image" ||
      type === "text" ||
      type === "button" ||
      type === "badge" ||
      type === "card"
    ) {
      setPendingComponentType(type);
      if (type === "image") setInputPrompt("Enter Image Path:");
      else if (type === "card") setInputPrompt("Enter Card Title:");
      else setInputPrompt("Enter Text:");

      setInputValue("");
      setMode("INPUT");
      return;
    }
    doAddComponent(type, {});
  };

  const doAddComponent = async (type: string, props: any) => {
    let finalProps = props;
    if (type === "image" && props.path) {
      try {
        const ascii = await convertImageToAscii(props.path, props.width || 40);
        finalProps = { ...props, ascii };
      } catch {
        finalProps = { ...props, ascii: "Error" };
      }
    }
    const newId = `${type}-${Date.now()}`;
    setPlacedComponents((prev) => [
      ...prev,
      {
        id: newId,
        type,
        x: 30,
        y: 10,
        label: type,
        props: finalProps,
      },
    ]);
    setSelectedComponent(newId);
    setShowLibrary(false);
    setMode("IDLE");
    setPendingComponentType(null);
  };

  // --- AI PORTER ---
  const portFromWeb = async (webCode: string) => {
    setMode("INPUT");
    const groq = getGroqClient();

    if (!groq) {
      setInputPrompt("Error: GROQ_API_KEY not found in .env");
      // Wait a bit then reset or let user see error?
      // User is in INPUT mode, so they see the prompt.
      return;
    }

    setInputPrompt("Groq is compiling web code to terminal components... ⚡");

    const systemPrompt = `You are a visual compiler for the tomcs TUI engine.
    Your task: Translate React/Shadcn/Tailwind code OR natural language descriptions into a raw JSON array of tomcs components.
    
    MAPPING RULES:
    - <Card> -> {"type": "card", "props": {"title": "Title", "text": "Content"}}
    - <Button> -> {"type": "button", "props": {"text": "Label"}}
    - <h1>, <p>, <span> -> {"type": "text", "props": {"text": "Content"}}
    - <Badge> -> {"type": "badge", "props": {"text": "Status"}}
    - Grid Logic: Map flexbox layouts to vertical stacking (y-increments of 5).
    
    OUTPUT REQUIREMENT:
    Return ONLY the JSON array. No explanations, no markdown code blocks.`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: webCode },
        ],
        model: "llama-3.3-70b-versatile", // High-reasoning model for UI logic
        temperature: 0.1, // Keep it deterministic and accurate
      });

      const cleanJson = chatCompletion.choices[0].message.content || "[]";
      const portedData = JSON.parse(cleanJson.replace(/```json|```/g, ""));

      const finalized = portedData.map((c: any, i: number) => ({
        ...c,
        id: `${c.type}-${Date.now()}-${i}`,
        x: c.x || 30,
        y: c.y || 5 + i * 5, // Auto-stacking components on the canvas
      }));

      setPlacedComponents((prev) => [...prev, ...finalized]);
      setMode("IDLE");
    } catch (error) {
      setInputPrompt("Error: Groq failed to translate. Check your API key.");
    }
  };

  // --- KEYBOARD ---
  useInput((input, key) => {
    if (mode === "INPUT") {
      if (key.return) {
        // If viewing code, close
        if (inputPrompt.startsWith("Generated")) {
          setMode("IDLE");
          return;
        }
        // Commit
        if (pendingComponentType) {
          doAddComponent(pendingComponentType, {
            [pendingComponentType === "image" ? "path" : "text"]: inputValue,
          });
        } else if (mode === "INPUT" && inputPrompt.includes("Bind")) {
          // Apply Logic Binding
          setPlacedComponents((prev) =>
            prev.map((c) => {
              if (c.id === selectedComponent) {
                return {
                  ...c,
                  props: {
                    ...c.props,
                    binding: { command: inputValue, type: "exec" }, // Attach logic metadata
                  },
                };
              }
              return c;
            })
          );
          setMode("IDLE");
        } else if (
          mode === "INPUT" &&
          (inputPrompt.includes("Paste React") ||
            inputPrompt.includes("Describe"))
        ) {
          portFromWeb(inputValue);
        } else if (selectedComponent) {
          setPlacedComponents((prev) =>
            prev.map((c) => {
              if (c.id === selectedComponent) {
                const newProps = { ...c.props };
                // Update props logic...
                if (
                  c.type === "text" ||
                  c.type === "banner" ||
                  c.type === "button"
                )
                  newProps.text = inputValue;
                // ... (simplified for brevity)
                return { ...c, props: newProps };
              }
              return c;
            })
          );
          setMode("IDLE");
        }
      } else if (key.escape) {
        setMode("IDLE");
      } else if (key.backspace || key.delete) {
        setInputValue((prev) => prev.slice(0, -1));
      } else {
        setInputValue((prev) => prev + input);
      }
      return;
      return;
    }

    if (mode === "IMAGE_PICKER" || mode === "IMAGE_SIZE_PICKER") {
      if (key.escape) {
        setMode("IDLE");
        setPendingComponentType(null);
      }
      return;
    }

    if (showLibrary) {
      if (key.escape || input.toLowerCase() === "a") setShowLibrary(false);
      return;
    }

    const char = input.toLowerCase();
    if (char === "r") startAddComponent("rectangle");
    if (char === "l") startAddComponent("line");
    if (char === "t") startAddComponent("text");
    if (char === "i") startAddComponent("image");
    if (char === "b") startAddComponent("banner");
    if (char === "a") setShowLibrary((p) => !p);

    // New Component Shortcuts
    if (char === "u") startAddComponent("button");
    if (char === "c") startAddComponent("card");
    if (char === "s") startAddComponent("list");
    if (char === "v") startAddComponent("tabs");
    if (char === "g") startAddComponent("badge");
    if (char === "n") startAddComponent("icon");
    if (char === "z") startAddComponent("spinner");

    if (char === "e") exportToCode(); // Export Shortcut
    if (char === "p") {
      setInputPrompt("Describe your layout...Or what you want");
      setInputValue("");
      setMode("INPUT");
    }

    // Logic Binding Shortcut
    if (char === "k" && selectedComponent) {
      setInputPrompt("Enter Bash Command to Bind (e.g. 'uptime' or 'curl'):");
      setInputValue("");
      setMode("INPUT");
    }

    if ((key.delete || key.backspace) && selectedComponent) {
      setPlacedComponents((prev) =>
        prev.filter((c) => c.id !== selectedComponent)
      );
      setSelectedComponent(null);
    }

    // Arrow Key Movement
    if (
      selectedComponent &&
      (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow)
    ) {
      const dx = key.leftArrow ? -1 : key.rightArrow ? 1 : 0;
      const dy = key.upArrow ? -1 : key.downArrow ? 1 : 0;
      setPlacedComponents((prev) =>
        prev.map((c) => {
          if (c.id === selectedComponent) {
            return { ...c, x: c.x + dx, y: c.y + dy };
          }
          return c;
        })
      );
    }

    // Layer Selection via Extended Keys
    const layerIndex = LAYER_KEYS.indexOf(input);
    if (layerIndex !== -1 && layerIndex < placedComponents.length) {
      setSelectedComponent(placedComponents[layerIndex].id);
    }

    // Edit with Enter
    if (key.return && selectedComponent) {
      const comp = placedComponents.find((c) => c.id === selectedComponent);
      if (comp) {
        setInputValue(comp.props?.text || comp.props?.title || "");
        setInputPrompt(`Edit ${comp.type}:`);
        setMode("INPUT");
      }
    }
  });

  return (
    <Box
      flexDirection="column"
      width={terminalSize.width}
      height={terminalSize.height}
    >
      {/* 1. TOP TOOLBAR */}
      <Box
        borderStyle="single"
        borderTop={false}
        borderLeft={false}
        borderRight={false}
        paddingX={2}
        width="100%"
        flexDirection="column"
      >
        {/* ROW 1: Logic & Meta */}
        <Box flexDirection="row" justifyContent="space-between" width="100%">
          <Box flexDirection="row" gap={2}>
            <Text bold color="cyan">
              🎩 tomcs
            </Text>
            <Text dimColor>│</Text>
            <Text color="yellow">
              <Text bold>[A]</Text> Registry
            </Text>
            <Text color="green">
              <Text bold>[E]</Text> Export
            </Text>
            <Text color="magenta">
              <Text bold>[P]</Text> AI Porter
            </Text>
            <Text color="blue">
              <Text bold>[K]</Text> Logic Bind
            </Text>
          </Box>
        </Box>

        {/* ROW 2: Primitives */}
        <Box marginTop={1}>
          <Text>
            <Text dimColor>Primitives: </Text>
            <Text bold color="blue">
              [R]
            </Text>
            ect{" "}
            <Text bold color="blue">
              [L]
            </Text>
            ine{" "}
            <Text bold color="blue">
              [T]
            </Text>
            ext{" "}
            <Text bold color="blue">
              [I]
            </Text>
            mg→ASCII{" "}
            <Text bold color="blue">
              [B]
            </Text>
            anner
          </Text>
        </Box>

        {/* ROW 3: Components */}
        <Box marginTop={0}>
          <Text>
            <Text dimColor>Components: </Text>
            <Text bold color="cyan">
              [U]
            </Text>{" "}
            Button{" "}
            <Text bold color="cyan">
              [C]
            </Text>{" "}
            Card{" "}
            <Text bold color="cyan">
              [S]
            </Text>{" "}
            List{" "}
            <Text bold color="cyan">
              [V]
            </Text>{" "}
            Tabs{" "}
            <Text bold color="cyan">
              [G]
            </Text>{" "}
            Badge{" "}
            <Text bold color="cyan">
              [N]
            </Text>{" "}
            Icon{" "}
            <Text bold color="cyan">
              [Z]
            </Text>{" "}
            Spinner
          </Text>
        </Box>

        {/* ROW 4: Layers Hint */}
        <Box marginTop={0}>
          <Text dimColor>
            Layers: 1-9 to Select | Arrow Keys to Move | Backspace to Delete
          </Text>
        </Box>
      </Box>

      <Box flexDirection="row" flexGrow={1}>
        {/* 2. LEFT SIDEBAR: LAYERS */}
        <Box
          width={25}
          borderStyle="single"
          borderTop={false}
          borderBottom={false}
          borderLeft={false}
          flexDirection="column"
          paddingX={1}
        >
          <Text bold underline>
            LAYERS
          </Text>
          {placedComponents.map((c, index) => (
            <Text
              key={c.id}
              color={selectedComponent === c.id ? "green" : "white"}
              backgroundColor={selectedComponent === c.id ? "gray" : undefined}
            >
              [{LAYER_KEYS[index] || "?"}] {c.type}
            </Text>
          ))}
          {placedComponents.length === 0 && <Text dimColor>No layers</Text>}
        </Box>

        {/* 3. CANVAS */}
        <Box
          flexGrow={1}
          borderStyle="double"
          borderColor={mode === "INPUT" ? "yellow" : "gray"}
        >
          {placedComponents.map((comp) => (
            <Box
              key={comp.id}
              position="absolute"
              marginLeft={Math.floor(comp.x * scaleX)}
              marginTop={Math.floor(comp.y * scaleY)}
            >
              <RenderComponent
                type={comp.type}
                isSelected={selectedComponent === comp.id}
                props={comp.props}
              />
            </Box>
          ))}

          {/* Input / Export Modal Overlay */}
          {mode === "INPUT" && (
            <Box
              position="absolute"
              marginLeft={5}
              marginTop={5}
              borderStyle="round"
              borderColor="yellow"
              flexDirection="column"
              padding={1}
              width={60}
              backgroundColor="black"
            >
              <Text bold color="yellow">
                {inputPrompt}
              </Text>
              <Text>{inputValue}</Text>
            </Box>
          )}

          {/* Image Size Overlay */}
          {mode === "IMAGE_SIZE_PICKER" && (
            <Box
              position="absolute"
              marginLeft={5}
              marginTop={5}
              borderStyle="round"
              borderColor="cyan"
              padding={1}
              width={40}
              flexDirection="column"
              backgroundColor="black"
            >
              <Text bold color="cyan">
                Select Size:
              </Text>
              <SelectableList
                items={[
                  "Small (20px)",
                  "Medium (40px)",
                  "Large (60px)",
                  "X-Large (80px)",
                ]}
                onSelect={(item) => {
                  let size = 40;
                  if (item.includes("20px")) size = 20;
                  if (item.includes("40px")) size = 40;
                  if (item.includes("60px")) size = 60;
                  if (item.includes("80px")) size = 80;
                  setPendingImageSize(size);

                  // Transition to File Picker
                  const images = listImages();
                  if (images.length > 0) {
                    setImageOptions(["Enter Path...", ...images]);
                    setMode("IMAGE_PICKER");
                  } else {
                    // Fallback
                    setInputPrompt("Enter Image Path:");
                    setInputValue("");
                    setMode("INPUT");
                  }
                }}
              />
            </Box>
          )}

          {/* Image Picker Overlay */}
          {mode === "IMAGE_PICKER" && (
            <Box
              position="absolute"
              marginLeft={5}
              marginTop={5}
              borderStyle="round"
              borderColor="magenta"
              padding={1}
              width={50}
              flexDirection="column"
              backgroundColor="black"
            >
              <Text bold color="magenta">
                Select Image:
              </Text>
              <SelectableList
                items={imageOptions}
                onSelect={(item) => {
                  if (item === "Enter Path...") {
                    setInputPrompt("Enter Image Path:");
                    setInputValue("");
                    setMode("INPUT");
                  } else {
                    doAddComponent("image", {
                      path: item,
                      width: pendingImageSize,
                    });
                  }
                }}
              />
            </Box>
          )}

          {/* Library Overlay */}
          {showLibrary && (
            <Box
              position="absolute"
              marginLeft={5}
              marginTop={5}
              borderStyle="round"
              borderColor="green" // Changed to green for visibility
              padding={1}
              width={40}
              flexDirection="column"
              backgroundColor="black"
            >
              <Text bold color="green">
                Component Registry:
              </Text>
              <SelectableList
                limit={10}
                items={[
                  "button",
                  "shell",
                  "card",
                  "list",
                  "tabs",
                  "badge",
                  "banner",
                  "icon",
                  "spinner",
                ]}
                onSelect={startAddComponent}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Only run if executed directly
import { fileURLToPath } from "url";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Enter Alternate Screen Buffer
  process.stdout.write("\x1b[?1049h");
  const { waitUntilExit } = render(<Designer />);

  // Restore Main Screen Buffer on exit
  waitUntilExit().then(() => {
    process.stdout.write("\x1b[?1049l");
  });
}
