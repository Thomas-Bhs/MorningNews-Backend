const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, default: '' },
  },
  { timestamps: true }
);

const Bookmark = mongoose.model('bookmarks', bookmarkSchema);

module.exports = Bookmark;
