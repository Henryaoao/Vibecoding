export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        FormData: "readonly",
        Headers: "readonly",
        Response: "readonly",
        afterEach: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        document: "readonly",
        expect: "readonly",
        fetch: "readonly",
        it: "readonly",
        localStorage: "readonly",
        vi: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
