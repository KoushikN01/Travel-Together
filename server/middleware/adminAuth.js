const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      $or: [
        { role: 'admin' },
        { roles: 'admin' }
      ]
    });

    if (!user) {
      throw new Error('Not authorized as admin');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    res.status(401).json({ message: 'Not authorized to access this resource' });
  }
};

module.exports = adminAuth; 