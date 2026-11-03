/**
 * Admin account creation.
 * Public sign-up only makes students, so admin (admissions officer) accounts are
 * created here: from .env when the server starts, or with `npm run create-admin`.
 */
const User = require('../models/User');
const College = require('../models/College');

const validatePassword = (password) =>
  typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);

/**
 * Creates an admin, or promotes/updates an existing account with that email.
 * Returns { user, created }.
 */
const createOrUpdateAdmin = async ({ name, email, password, collegeCode }) => {
  email = String(email || '').trim().toLowerCase();
  name = String(name || '').trim() || 'Admissions Officer';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid admin email is required.');
  if (!validatePassword(password)) throw new Error('Admin password must be at least 8 characters and include a letter and a number.');

  let collegeId;
  if (collegeCode) {
    const college = await College.findOne({ code: String(collegeCode).toUpperCase() });
    if (!college) throw new Error(`No college found with code "${collegeCode}".`);
    collegeId = college._id;
  }

  const existing = await User.findOne({ email }).select('+password');
  if (existing) {
    existing.role = 'admin';
    existing.name = name;
    existing.password = password; // re-hashed by the pre-save hook
    existing.isActive = true;
    if (collegeId) existing.collegeId = collegeId;
    await existing.save();
    return { user: existing, created: false };
  }

  const user = await User.create({ name, email, password, role: 'admin', collegeId });
  return { user, created: true };
};

/** On startup: if ADMIN_EMAIL and ADMIN_PASSWORD are set and that account does not exist yet, create it. */
const ensureAdminFromEnv = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_COLLEGE_CODE } = process.env;
  try {
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const exists = await User.exists({ email: ADMIN_EMAIL.trim().toLowerCase() });
      if (!exists) {
        await createOrUpdateAdmin({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, collegeCode: ADMIN_COLLEGE_CODE });
        console.log(`👤 Admin account created for ${ADMIN_EMAIL}.`);
      }
      return;
    }
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.warn('⚠️  No admin account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, or run: npm run create-admin');
    }
  } catch (err) {
    console.error(`Could not create admin from .env: ${err.message}`);
  }
};

module.exports = { createOrUpdateAdmin, ensureAdminFromEnv, validatePassword };
