const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authService = require('../services/authService');

router.post('/register', authController.register);

router.post('/login', async (req, res) => {
  try {
    const { userId, password, role } = req.body;
    
    if (!userId || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (!['student', 'warden'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const result = await authService.login(userId, password, role);
    
    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 401;
    
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;