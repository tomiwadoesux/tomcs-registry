import fs from "fs";
import path from "path";

// Define paths
const REGISTRY_PATH = path.join(process.cwd(), "../registry/components");
const OUTPUT_PATH = path.join(process.cwd(), "public/registry.json");

// Ensure public directory exists
if (!fs.existsSync(path.dirname(OUTPUT_PATH))) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
}

// This script crawls your 'tomcs-registry' and builds
// the JSON that the website uses to display components.
try {
  const components = fs.readdirSync(REGISTRY_PATH);

  const registryManifest = components.map((file) => {
    const filePath = path.join(REGISTRY_PATH, file);
    const content = fs.readFileSync(filePath, "utf8");
    return {
      name: file.replace(".tsx", ""),
      code: content,
      slug: file.replace(".tsx", ""),
      category: "Basic", // You can parse this from file comments
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(registryManifest, null, 2));
  console.log(`✔ Registry built successfully at ${OUTPUT_PATH}`);
} catch (error) {
  console.error("Error building registry:", error);
}
