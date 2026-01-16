const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

jest.setTimeout(15000); // increase timeout for database operations

const User = require('../models/users');
const Bookmark = require('../models/bookmarks');
const jwt = require('jsonwebtoken');

afterEach(async () => {
  await User.deleteMany({});
  await Bookmark.deleteMany({});
});

const createUserAndGetToken = async () => {
    const user = await User.create({
      username: `testuser_${Date.now()}`,// create unique username for passing tests
      password: 'hash',
    });
  
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET
    );
  
    return token;
};

describe('POST /bookmarks', () => {
  it('should add a bookmark for authenticated user', async () => {
    const token = await createUserAndGetToken();

    const res = await request(app).post('/bookmarks').set('Authorization', `Bearer ${token}`).send({
      title: 'Test Bookmark',
      url: 'https://example.com',
      source: 'Example Source',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.result).toBe(true);
    expect(res.body.bookmark).toBeDefined();
    expect(res.body.bookmark.title).toBe('Test Bookmark');
    expect(res.body.bookmark.url).toBe('https://example.com');
    expect(res.body.bookmark.source).toBe('Example Source');
  });

  it('should not add bookmarks without authentification', async () => {
    const res = await request(app).post('/bookmarks').send({
      title: 'Test Bookmark',
      url: 'https://example.com',
      source: 'Example Source',
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.result).toBe(false);
  });

  it('should not add duplicate bookmarks for the same user', async () => {
    const token = await createUserAndGetToken();

    const bookmark = {
      title: 'Test Bookmark',
      url: 'https://example.com',
      source: 'Example Source',
    };

    await request(app).post('/bookmarks').set('Authorization', `Bearer ${token}`).send(bookmark);

    const res = await request(app)
      .post('/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .send(bookmark);

    expect(res.statusCode).toEqual(409);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('Bookmark already exists');
  });
});

describe('GET /bookmarks', () => {
  it('should return paginated bookmarks', async () => {
    const token = await createUserAndGetToken();

    // Add 15 bookmarks
    for (let i = 1; i <= 15; i++) {
      await request(app)
        .post('/bookmarks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: `Bookmark ${i}`,
          url: `https://example.com/${i}`,
          source: 'Example Source',
        });
    }

    const res = await request(app).get('/bookmarks?page=1').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.total).toBe(15);
    expect(res.body.totalPages).toBe(2);
  });
});

describe('DELETE /bookmarks/:id', () => {
  it('should delete a bookmark by id', async () => {
    const token = await createUserAndGetToken();

    const addRes = await request(app)
      .post('/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Bookmark to Delete',
        url: 'https://example.com/delete',
        source: 'Example Source',
      });

    const bookmarkId = addRes.body.bookmark._id;

    const res = await request(app)
      .delete(`/bookmarks/${bookmarkId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
