import React, { useState, createContext, useContext } from "react";
import { useInput } from "ink";

interface FocusContextType {
  activeId: string;
  setActiveId: (id: string) => void;
}

export const FocusContext = createContext<FocusContextType>({
  activeId: "",
  setActiveId: () => {},
});

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeId, setActiveId] = useState("btn-1"); // Default focus

  // Global key listener for Tab navigation
  useInput((input, key) => {
    if (key.tab) {
      // Logic to cycle focus would go here in a full app
      // For this demo, we handle specific navigation in components
    }
  });

  return (
    <FocusContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = (componentId: string) => {
  const { activeId, setActiveId } = useContext(FocusContext);
  const isFocused = activeId === componentId;

  return { isFocused, setActiveId };
};
