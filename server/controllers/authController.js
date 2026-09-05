const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { signToken } = require('../config/jwt');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, collegeId } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address is already registered.'
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      phone,
      collegeId: assignedRole === 'admin' ? collegeId : undefined
    });

    // Automatically create initial StudentProfile if registering as student
    if (assignedRole === 'student') {
      await StudentProfile.create({
        userId: user._id,
        academicInfo: {
          tenth: { board: 'CBSE', passingYear: 2022, percentage: 85 },
          twelfth: { board: 'CBSE', passingYear: 2024, percentage: 82, stream: 'Science (PCM)', subjects: [] }
        },
        completionPercentage: 35
      });
    }

    const token = signToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        collegeId: user.collegeId
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const token = signToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        collegeId: user.collegeId
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id }).populate('coursePreferences');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        collegeId: user.collegeId
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};
