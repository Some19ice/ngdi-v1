module.exports = {
  extends: [
    "../../.eslintrc.base.js",
    "next/core-web-vitals"
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    // Web-specific rules
    "react/react-in-jsx-scope": "off",
  }
}
