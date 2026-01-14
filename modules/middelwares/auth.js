const jwt = require('jsonwebtoken');
const User = require('../../models/users');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ result: false, error: 'Missing token' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET); //check the token (valid or not)

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ result: false, error: 'Unauthorized' });
    }

    req.user = user; //put the user info in req object for further use in the route handlers

    next();
  } catch (error) {
    return res.status(401).json({
      result: false,
      error: 'Invalid or expired token',
    });
  }
};
