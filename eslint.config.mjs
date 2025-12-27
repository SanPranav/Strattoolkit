import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const eslintConfig = [
  ...compat.config({
    extends: ['next', 'next/core-web-vitals', 'next/typescript'],
    rules: {
      "no-console": "warn",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-const": "warn",
    }
  })];

export default eslintConfig;
