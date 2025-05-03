import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    {
      ignores: ["lib/**", "test/**"],
    },
    ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"),
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            "prettier": prettier,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: tsParser,
            ecmaVersion: 12,
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            semi: ["error", "always"],
            quotes: ["error", "single"],
            "prettier/prettier": "error",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-object-type": "off",
        },
    },
];
