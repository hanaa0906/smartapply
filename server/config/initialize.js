const { connectDB } = require('./db');
const { seedInitialDataIfEmpty } = require('../seeds/seedHelper');
const { ensureAdminFromEnv } = require('../services/adminAccounts');

let initialization;

const initializeApplication = () => {
  if (!initialization) {
    initialization = (async () => {
      await connectDB();
      await seedInitialDataIfEmpty();
      await ensureAdminFromEnv();
    })().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
};

module.exports = { initializeApplication };
