import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { js },
    extends: ["js/recommended"],
  },
  tslint.configs.recommended,
]);
