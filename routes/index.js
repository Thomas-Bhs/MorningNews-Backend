var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const authOptional = require('../modules/middelwares/authOptional');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

router.get('/articles', authOptional, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    const category = req.query.category; //default is all
    const language = req.query.language || 'en';
    const country = req.query.country; // default is all

    let apiUrl = `https://newsapi.org/v2/top-headlines?language=${language}&page=${page}&pageSize=${pageSize}`;

    if (category) {
      apiUrl += `&category=${category}`;
    }
    if (country) {
      apiUrl += `&country=${country}`;
    }

    apiUrl += `&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'ok') {
      return res.status(500).json({ articles: [] });
    }

    if (!req.user && page > 1) {
      return res.status(401).json({
        result: false,
        error: 'LOGIN_REQUIRED',
        message: 'Login required to load more articles',
      });
    }

    res.json({
      result: true,
      articles: data.articles,
      page,
      hasMore: data.articles.length === pageSize, // charged articles equal to pageSize means there might be more, so the frontend can request a new page if scrolled
      isAuthenticated: !!req.user, //transform to boolean
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

module.exports = router;
