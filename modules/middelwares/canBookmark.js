module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      result: false,
      error: 'Unauthorized',
    });
  }

  if (!req.user.canBookmark) {
    return res.status(403).json({
      result: false,
      error: 'Bookmarking not allowed',
    });
  }

  next();
};