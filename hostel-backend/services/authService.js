const Student = require('../models/Student');
const Warden = require('../models/Warden');
const jwt = require('jsonwebtoken');

const login = async (userId, password, role) => {
  let user;
  
  if (role === 'student') {
    user = await Student.findOne({ 
      $or: [
        { rollNumber: userId.toUpperCase() },
        { email: userId.toLowerCase() }
      ]
    });
  } else if (role === 'warden') {
    user = await Warden.findOne({
      $or: [
        { wardenId: userId.toUpperCase() },
        { email: userId.toLowerCase() }
      ]
    });
  }

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id: user._id,
      rollNumber: user.rollNumber,
      name: user.name,
      email: user.email,
      role: user.role,
      roomNumber: user.roomNumber
    }
  };
};

module.exports = { login };