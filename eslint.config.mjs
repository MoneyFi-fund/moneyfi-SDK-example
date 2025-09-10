import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ),
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      ".pnp/**",
      ".yarn/**",

      // Build outputs
      "dist/**",
      "build/**",
      ".next/**",
      ".wrangler/**",
      "out/**",

      // Generated API hooks
      "src/api/hooks/endpoints/Client.msw.ts",
      "src/api/hooks/model/**",
      "src/api/hooks/mutator/**",
      "src/api/hooks/transformer/**",

      // Environment and config files
      ".env*",
      "*.config.js",
      "*.config.ts",

      // IDE files
      ".vscode/**",
      ".idea/**",

      // Contract files
      "src/contract/**",

      // Generated files
      "pages/icon-gallery.tsx",
      "*.tsbuildinfo",
      "next-env.d.ts",

      // Cloudflare files
      ".open-next/**",
      ".dev.vars/**",
      ".wrangler/**",

      // Coverage reports
      "coverage/**",

      // Log files
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
    ],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
    },

    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "no-undef": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
];
