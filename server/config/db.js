const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';
  const allowEphemeralDatabase = process.env.ALLOW_EPHEMERAL_DB === 'true';

  if (isProduction && (!uri || uri.includes('memory')) && !allowEphemeralDatabase) {
    throw new Error('Set MONGODB_URI to a persistent database, or explicitly enable ALLOW_EPHEMERAL_DB for a temporary demo.');
  }

  if (uri && !uri.includes('memory')) {
    try {
      console.log('Connecting to configured MongoDB database...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500 // Quick timeout to fallback if not running
      });
      console.log('MongoDB Connected successfully to specified URI.');
      return;
    } catch (err) {
      if (isProduction) {
        throw new Error(`Could not connect to configured MongoDB database: ${err.message}`);
      }
      console.warn(`Could not connect to configured MongoDB database: ${err.message}. Falling back to embedded MongoMemoryServer...`);
    }
  }

  // Fallback: built-in database. Data is saved on disk in server/data/db, so
  // accounts and applications survive restarts. Set EMBEDDED_DB_PERSIST=false
  // for a throwaway in-memory database instead.
  try {
    // Serverless instances do not share local files; always keep their fallback in memory.
    const persist = process.env.VERCEL !== '1' && process.env.EMBEDDED_DB_PERSIST !== 'false';
    const dbPath = path.join(__dirname, '..', 'data', 'db');
    if (persist) fs.mkdirSync(dbPath, { recursive: true });
    mongodInstance = await MongoMemoryServer.create(
      persist ? { instance: { dbPath, storageEngine: 'wiredTiger', dbName: 'smartapply' } } : undefined
    );
    const memoryUri = mongodInstance.getUri('smartapply');
    console.log(persist
      ? `Starting built-in MongoDB (saved to ${dbPath})`
      : 'Starting in-memory MongoDB (data is temporary and local to this process)');
    await mongoose.connect(memoryUri);
    console.log('MongoDB Connected successfully to embedded database.');
  } catch (error) {
    console.error('Fatal: Failed to connect to MongoDB', error);
    if (process.env.VERCEL === '1') {
      throw new Error(`Failed to start the temporary database on Vercel: ${error.message}`);
    }
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop({ doCleanup: false });
  }
};

module.exports = { connectDB, closeDB };
