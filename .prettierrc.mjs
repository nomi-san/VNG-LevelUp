// @ts-check

/** @type {import("prettier").Config} */
const config = {
  // Standard prettier options
  singleQuote: false,
  printWidth: 100,
  semi: true,
  trailingComma: "all",
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  importOrder: ["^react$", "", "^@renderer/(.*)$", "", "^@src/(.*)$", "", "^[./]"],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
  importOrderCaseSensitive: false,
};

export default config;
