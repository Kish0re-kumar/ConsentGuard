const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, mobile, email, password, aadharNo, address } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    user = await User.findOne({ mobile });
    if (user) {
      return res.status(400).json({
        success: false, 
        message: 'User with this mobile number already exists'
      });
    }

    user = await User.findOne({ aadharNo });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this Aadhar number already exists'
      });
    }

    // Create user
    user = await User.create({
      name,
      mobile,
      email,
      password,
      aadharNo,
      address
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate email & password
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and password'
      });
    }

    // Check for user
    const user = await User.findOne({ mobile }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('transactions');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Mock OTP verification
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;
  
  // In a real implementation, you would:
  // 1. Check if the OTP sent to the user matches what they entered
  // 2. Verify it hasn't expired
  // 3. Verify it hasn't been used before
  
  // For mock purposes, we'll just check if OTP is '123456'
  if (otp === '123456') {
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  }
  
  return res.status(400).json({
    success: false,
    message: 'Invalid OTP'
  });
};