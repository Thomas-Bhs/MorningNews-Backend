const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    refreshToken: { type: String, default: '' },
    canBookmark: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('users', userSchema);

module.exports = User;
