import eslint from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const browserGlobals = {
  document: "readonly",
  window: "readonly",
  MutationObserver: "readonly",
  HTMLInputElement: "readonly",
  HTMLElement: "readonly",
  HTMLVideoElement: "readonly",
  ParentNode: "readonly"
};

const extensionGlobals = {
  chrome: "readonly",
  structuredClone: "readonly"
};

export default [
  { ignores: ["dist", "node_modules", "prime_video_html_script.js","prime-video-ad-capture.json"] },
  eslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "./tsconfig.json" },
      globals: { ...browserGlobals, ...extensionGlobals }
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ]
    }
  },
  {
    files: ["src/background/**/*.ts", "src/settings/**/*.ts"],
    languageOptions: {
      globals: extensionGlobals
    }
  },
  {
    files: ["src/content/**/*.ts", "src/popup/**/*.ts", "src/**/*.test.ts"],
    languageOptions: {
      globals: browserGlobals
    }
  }
];
