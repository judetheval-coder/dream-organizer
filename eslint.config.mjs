import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project-specific ignores
    "legacy/**",
    "sd_env/**",
    "sd_bridge.js",
    "sd_server.js",
    "temp_page_original.txt",
    "temp_panel_original.txt",
    "temp-user-section.txt",
  ]),
]);

export default eslintConfig;
