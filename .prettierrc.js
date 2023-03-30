module.exports = {
  trailingComma: "all",
  printWidth: 99999,
  tabWidth: 2,
  semi: true,
  bracketSameLine: true,
  arrowParens: "always",
  singleAttributePerLine: false,
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
  importOrder: [
    "^react(.*)",
    "^next(.*)",
    "@(.*)",
    "^[./|~/]",
    "^[./]",
    "^(react-icons/(.*)$)|^(react-icons$)",
    "^(lucide-react/(.*)$)|^(lucide-react$)",
    ""
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true
};
