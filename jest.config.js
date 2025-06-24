module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000, // 10-second timeout for tests
  setupFilesAfterEnv: ['./tests/setup.js'] // A setup file to run before tests
}; 