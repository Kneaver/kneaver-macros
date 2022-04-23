module.exports = {
  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },

  // Runs special logic, such as cleaning up components
  // when using React Testing Library and adds special
  // extended assertions to Jest
  setupFilesAfterEnv: [
    //"@testing-library/react/cleanup-after-each",
    "@testing-library/jest-dom/extend-expect",
  ],
  moduleNameMapper: {
    '^react-dom((\\/.*)?)$': '<rootDir>/node_modules/react-dom',
    '^react((\\/.*)?)$': '<rootDir>/node_modules/react'
  }
};