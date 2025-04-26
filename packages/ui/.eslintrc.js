module.exports = {
  extends: ["../../.eslintrc.base.js"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    // UI-specific rules
    "react/react-in-jsx-scope": "off",
  }
}
