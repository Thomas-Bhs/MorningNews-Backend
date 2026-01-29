var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const authOptional = require('../modules/middelwares/authOptional');
const auth = require('../modules/middelwares/auth');
const { isValidImageUrl } = require('../modules/utils/imageUtils');
const NEWS_SOURCES = require('../modules/config/newsSources');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

router.get('/articles', authOptional, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    //const category = req.query.category; //default is all
    //const language = req.query.language || 'en';

    const sources = NEWS_SOURCES.join(',');

    const apiUrl = `https://newsapi.org/v2/top-headlines?sources=${sources}&pageSize=${pageSize}&page=${page}&apiKey=${NEWS_API_KEY}`;

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

    //filter of image before the response
    const safeArticles = data.articles.map((article) => ({
      ...article,
      urlToImage: isValidImageUrl(article.urlToImage) ? article.urlToImage : null,
    }));

    res.json({
      result: true,
      articles: safeArticles,
      page,
      hasMore: page * pageSize < data.totalResults, // charged articles equal to pageSize means there might be more, so the frontend can request a new page if scrolled
      isAuthenticated: !!req.user, //transform to boolean
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

router.get('/articles/search', auth, async (req, res) => {
  try {
    console.log('QUERY params:', req.query);

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const query = req.query.q;
    const sources = NEWS_SOURCES.join(',');

    console.log('QUERY received:', query);


    if (!query) {
      return res.json({
        result: true,
        articles: [],
        page,
        hasMore: false,
      });
    }

    const apiUrl =
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(query)}` +
      `&sources=${sources}` +
      `&page=${page}` +
      `&pageSize=${pageSize}` +
      `&sortBy=publishedAt` +
      `&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'ok') {
      return res.status(500).json({ result: false, articles: [] });
    }

    const safeArticles = data.articles.map((article) => ({
      ...article,
      urlToImage: isValidImageUrl(article.urlToImage) ? article.urlToImage : null,
    }));

    res.json({
      result: true,
      articles: safeArticles,
      page,
      hasMore: page * pageSize < data.totalResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

module.exports = router;
