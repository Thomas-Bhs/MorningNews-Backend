const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

// Mock of node-fetch and its api response
jest.mock('node-fetch', () => jest.fn());// mock implementation
const fetch = require('node-fetch');// take the mocked fetch

//array of 10 mock articles (empty) and fill uptaded with same data
const mockArticles = Array(10).fill({
  title: 'Test article',
  url: 'https://example.com',
  source: { name: 'Test Source' },
});


afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});


describe('GET /articles', () => {
  it('should return articles on page 1 without authentication', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        status: 'ok',
        articles: mockArticles,
      }),
    });

    const res = await request(app).get('/articles');

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.articles.length).toBe(10);
    expect(res.body.page).toBe(1);
    expect(res.body.hasMore).toBe(true);
    expect(res.body.isAuthenticated).toBe(false);
  });


it('should block page > 1 if user is not authenticated', async () => {
  fetch.mockResolvedValueOnce({
    json: async () => ({
      status: 'ok',
      articles: mockArticles,
    }),
  });

  const res = await request(app).get('/articles?page=2');

  expect(res.statusCode).toBe(401);
  expect(res.body.error).toBe('LOGIN_REQUIRED');
});


it('should allow page > 1 if user is authenticated', async () => {
  const user = await User.create({
    username: 'testuser',
    password: 'hash',
  });

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET
  );

  fetch.mockResolvedValueOnce({
    json: async () => ({
      status: 'ok',
      articles: mockArticles,
    }),
  });

  const res = await request(app)
    .get('/articles?page=2')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.page).toBe(2);
  expect(res.body.isAuthenticated).toBe(true);
});

it('should accept category filter', async () => {
  fetch.mockResolvedValueOnce({
    json: async () => ({
      status: 'ok',
      articles: mockArticles,
    }),
  });

  const res = await request(app)
    .get('/articles?category=technology&language=en&country=us');

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
});
});

afterAll(async () => {
  await mongoose.disconnect();
});