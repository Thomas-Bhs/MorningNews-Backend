var express = require('express');
var router = express.Router();

const auth = require('../modules/middelwares/auth');
const canBookmark = require('../modules/middelwares/canBookmark');

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uid = require('uid2');

router.post('/signup', async (req, res) => {
  try {
    if (!checkBody(req.body, ['username', 'password'])) {
      res.status(400).json({ result: false, error: 'Missing or empty fields' });
      return;
    }

    // Check if the user has not already been registered
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ result: false, error: 'User already exists' });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    const refreshToken = uid(32);

    const newUser = new User({
      username: req.body.username,
      password: hash,
      refreshToken: refreshToken,//add in the database
    });

    await newUser.save();

    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.status(201).json({ 
      result: true, 
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    if (!checkBody(req.body, ['username', 'password'])) {
      return res.status(400).json({ result: false, error: 'Missing or empty fields' });
    }

    const matchUser = await User.findOne({ username: req.body.username });

    if (!matchUser || !bcrypt.compareSync(req.body.password, matchUser.password)) {
      return res.status(401).json({ result: false, error: 'User not found or wrong password' });
    }

    const accessToken = jwt.sign(
      { userId: matchUser._id},
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = uid(32);

    matchUser.refreshToken = refreshToken; //add in the database
    await matchUser.save();

    res.status(200).json({ 
      result: true, 
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

router.get('/canBookmark', auth, (req, res) => {
  res.json({
    result: true,
    canBookmark: req.user.canBookmark,
  });
});



router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ result: false, error: 'Missing refresh token' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ result: false, error: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const newRefreshToken = uid(32);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      result: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});



router.post('/logout', auth, async (req, res) => {
  req.user.refreshToken = '';
  await req.user.save();

  res.json({ result: true });
});

module.exports = router;
