/**
 * Create (or reset) an admin account.
 *
 *   npm run create-admin -- --name "Dr. A. Kumar" --email officer@college.edu --password "S3curePass" [--college AIT]
 *
 * Stop the SmartApply server first if you use the built-in database (no MONGODB_URI).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectDB, closeDB } = require('../config/db');
const { createOrUpdateAdmin } = require('../services/adminAccounts');

const arg = (flag) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
};

(async () => {
  const email = arg('--email');
  const password = arg('--password');
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- --name "Full Name" --email you@college.edu --password "YourPass123" [--college AIT]');
    process.exit(1);
  }
  try {
    await connectDB();
    const { user, created } = await createOrUpdateAdmin({ name: arg('--name'), email, password, collegeCode: arg('--college') });
    console.log(created ? `✅ Admin created: ${user.email}` : `✅ Existing account ${user.email} is now an admin (password updated).`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
})();
