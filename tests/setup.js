const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Before all tests, create a new in-memory MongoDB server and connect to it.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// After all tests, disconnect from mongoose and stop the in-memory server.
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Before each test, clear all data from the collections.
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}); 