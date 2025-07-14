const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    
    let user;
    if (role === 'student') {
      user = await authService.registerStudent(userData);
    } else if (role === 'warden') {
      user = await authService.registerWarden(userData);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(role === 'student' && { 
          rollNumber: user.rollNumber,
          roomNumber: user.roomNumber 
        }),
        ...(role === 'warden' && { 
          wardenId: user.wardenId 
        })
      }
    });
    
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { userId, password, role } = req.body;
    
    if (!userId || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    const result = await authService.login(userId, password, role);
    
    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
    
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: error.message 
    });
  }
};