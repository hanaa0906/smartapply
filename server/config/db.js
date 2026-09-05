const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('memory')) {
    try {
      console.log(`Connecting to MongoDB at: ${uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500 // Quick timeout to fallback if not running
      });
      console.log('MongoDB Connected successfully to specified URI.');
      return;
    } catch (err) {
      console.warn(`Could not connect to ${uri}: ${err.message}. Falling back to embedded MongoMemoryServer...`);
    }
  }

  // Fallback to in-memory / embedded instance
  try {
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    console.log(`Starting embedded MongoMemoryServer at: ${memoryUri}`);
    await mongoose.connect(memoryUri);
    console.log('MongoDB Connected successfully to embedded database.');
  } catch (error) {
    console.error('Fatal: Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
