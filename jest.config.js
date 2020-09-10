module.exports = {
  projects: ["<rootDir>/src"],
  collectCoverageFrom: [
    "**/src/**/*.js",
    "!**/__tests__/**",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      statements: 10,
      branch: 10,
      functions: 10,
      lines: 10,
    },
  },
  testEnvironment: "node",
};
