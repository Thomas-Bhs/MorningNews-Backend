//Middleware for optional authentication, and allow at some articles for non-authenticated users

const jwt = require('jsonwebtoken');
const User = require('../../models/users');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
  
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();

  } catch (error) {
    req.user = null;
    next();
  }
};