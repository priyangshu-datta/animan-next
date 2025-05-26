import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";
import pluginQuery from "@tanstack/eslint-plugin-query";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // jsdoc.configs["flat/recommended"],
  ...compat.extends("next/core-web-vitals"),
  // ...pluginQuery.configs["flat/recommended"],
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
    // plugins: {
    //   jsdoc,
    // },
    // rules: {
    //   camelcase: ["error", { properties: "always" }],
    //   "jsdoc/check-access": 1, // Recommended
    //   "jsdoc/check-alignment": 1, // Recommended
    //   "jsdoc/check-examples": 0,
    //   "jsdoc/check-indentation": 0,
    //   "jsdoc/check-line-alignment": 0,
    //   "jsdoc/check-param-names": 1, // Recommended
    //   "jsdoc/check-template-names": 0,
    //   "jsdoc/check-property-names": 1, // Recommended
    //   "jsdoc/check-syntax": 1,
    //   "jsdoc/check-tag-names": 1, // Recommended
    //   "jsdoc/check-types": 1, // Recommended
    //   "jsdoc/check-values": 1, // Recommended
    //   "jsdoc/empty-tags": 1, // Recommended
    //   "jsdoc/implements-on-classes": 1, // Recommended
    //   "jsdoc/informative-docs": 0,
    //   "jsdoc/match-description": 0,
    //   "jsdoc/multiline-blocks": 1, // Recommended
    //   "jsdoc/no-bad-blocks": 0,
    //   "jsdoc/no-blank-block-descriptions": 0,
    //   "jsdoc/no-defaults": 0,
    //   "jsdoc/no-missing-syntax": 0,
    //   "jsdoc/no-multi-asterisks": 0, // Recommended
    //   "jsdoc/no-restricted-syntax": 0,
    //   "jsdoc/no-types": 0,
    //   "jsdoc/no-undefined-types": 1, // Recommended
    //   "jsdoc/require-asterisk-prefix": 0,
    //   "jsdoc/require-description": 0,
    //   "jsdoc/require-description-complete-sentence": 0,
    //   "jsdoc/require-example": 0,
    //   "jsdoc/require-file-overview": 0,
    //   "jsdoc/require-hyphen-before-param-description": 0,
    //   "jsdoc/require-jsdoc": 0, // Recommended
    //   "jsdoc/require-param": 1, // Recommended
    //   "jsdoc/require-param-description": 0, // Recommended
    //   "jsdoc/require-param-name": 1, // Recommended
    //   "jsdoc/require-param-type": 1, // Recommended
    //   "jsdoc/require-property": 1, // Recommended
    //   "jsdoc/require-property-description": 0, // Recommended
    //   "jsdoc/require-property-name": 1, // Recommended
    //   "jsdoc/require-property-type": 1, // Recommended
    //   "jsdoc/require-returns": 1, // Recommended
    //   "jsdoc/require-returns-check": 1, // Recommended
    //   "jsdoc/require-returns-description": 0, // Recommended
    //   "jsdoc/require-returns-type": 1, // Recommended
    //   "jsdoc/require-template": 0,
    //   "jsdoc/require-throws": 0,
    //   "jsdoc/require-yields": 1, // Recommended
    //   "jsdoc/require-yields-check": 1, // Recommended
    //   "jsdoc/sort-tags": 0,
    //   "jsdoc/tag-lines": 0, // Recommended
    //   "jsdoc/valid-types": 1, // Recommended
    //   "no-undef": "error",
    // },
  },
];

export default eslintConfig;
