import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["renders/**", "content/captions/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
  },
);
