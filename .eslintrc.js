/* eslint-disable */

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  root: true,
  // disable linebreak error
  rules: { "prettier/prettier": ["error"], "linebreak-style": 0 },
}

// Path: .eslintrc.js
