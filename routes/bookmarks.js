var express = require('express');
var router = express.Router();

const auth = require('../modules/middelwares/auth');
const canBookmark = require('../modules/middelwares/canBookmark');

require('../models/connection');
const Bookmark = require('../models/bookmarks');
const { checkBody } = require('../modules/checkBody');

router.post('/bookmarks', auth, canBookmark, async (req, res) => {
  try {
    if (!checkBody(req.body, ['title', 'url'])) {
      return res.status(400).json({ result: false, error: 'Missing fields' });
    }

    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      url: req.body.url,
    });
    if (existingBookmark) {
      return  res.status(409).json({ result: false, 
      error: 'Bookmark already exists' 
      });
    }

    const bookmark = new Bookmark({
      user: req.user._id,
      title: req.body.title,
      url: req.body.url,
      source: req.body.source,
    });

    await bookmark.save();

    res.status(201).json({ result: true, bookmark });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

router.get('/bookmarks', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // fetch page number from query, default to 1
    const limit = 10;
    const skip = (page - 1) * limit; // calculate how many documents to ignore

    const total = await Bookmark.countDocuments({ user: req.user._id });

    const bookmarks = await Bookmark
    .find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json({ 
      result: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit), // aroundd up total pages
      bookmarks, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

router.delete('/bookmarks/:id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!bookmark) {
    return res.status(404).json({ result: false, error: 'Bookmark not found' });
  }
  await Bookmark.deleteOne({ _id: req.params.id });

  res.json({ result: true });
} catch (error) {
  res.status(500).json({ result: false, error: 'Server error' });
  } 
});

module.exports = router;
