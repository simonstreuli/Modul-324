// Jest setup file to configure test environment
// This file is run before each test file

// Set required environment variables for tests
process.env.PORT = process.env.PORT || '6001';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/ticketsystem-test';
process.env.HOST_URL = process.env.HOST_URL || 'localhost:6001';
