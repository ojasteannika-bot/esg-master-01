/** Ajutine ESLint, kuni B1 viilu ajal tüübid korda teeme */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "prefer-const": "off",
    "react-hooks/exhaustive-deps": "warn"
  },
};
