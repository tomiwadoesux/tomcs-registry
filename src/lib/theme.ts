export type TomcsTheme = {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  success: string;
  error: string;
  borderStyle: "single" | "double" | "round" | "bold";
};

export const themes: Record<string, TomcsTheme> = {
  cyberpunk: {
    name: "Cyberpunk",
    primary: "#ff00ff", // Neon Pink
    secondary: "#00ffff", // Cyan
    background: "#000000",
    success: "#00ff00",
    error: "#ff0000",
    borderStyle: "double",
  },
  matrix: {
    name: "Matrix",
    primary: "#00ff41", // Matrix Green
    secondary: "#008f11",
    background: "#000000",
    success: "#00ff41",
    error: "#ff0000",
    borderStyle: "bold",
  },
  nord: {
    name: "Nord",
    primary: "#88c0d0", // Frost Blue
    secondary: "#81a1c1",
    background: "#2e3440",
    success: "#a3be8c",
    error: "#bf616a",
    borderStyle: "round",
  },
};
