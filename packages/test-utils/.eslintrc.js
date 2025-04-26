module.exports = {
  extends: ["../../.eslintrc.base.js"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    // Test-utils-specific rules
    "react/react-in-jsx-scope": "off",
  }
}
