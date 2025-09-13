import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.url
});

const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    rules: {
      // "no-console": "warn",
      "no-unused-vars": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    }
  })
];

export default eslintConfig;
