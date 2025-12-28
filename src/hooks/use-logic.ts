import { useState, useEffect } from "react";
import { exec } from "child_process";

export const useTomcsLogic = (bindings: Record<string, string>) => {
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Function to run a single command
    const runCommand = (id: string, cmd: string) => {
      exec(cmd, (error, stdout) => {
        if (!error) {
          setData((prev) => ({ ...prev, [id]: stdout.trim() }));
        }
      });
    };

    // Initialize intervals for all bound components
    const intervals = Object.entries(bindings).map(([id, cmd]) => {
      runCommand(id, cmd); // Run once immediately
      return setInterval(() => runCommand(id, cmd), 2000); // Update every 2s
    });

    return () => intervals.forEach(clearInterval);
  }, [JSON.stringify(bindings)]); // React to deep changes in bindings

  return data;
};
