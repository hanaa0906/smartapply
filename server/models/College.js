const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  accreditation: {
    type: String,
    default: 'NAAC A+'
  },
  establishedYear: {
    type: Number,
    default: 1998
  },
  country: {
    type: String,
    default: 'India'
  },
  region: {
    type: String,
    default: 'Asia'
  },
  // true for universities added from the global directory via one-stop applications
  isExternal: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
