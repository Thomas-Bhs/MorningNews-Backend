const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/users');


afterEach(async () => {
  await User.deleteMany({});
});



describe('Authentication flow', () => {

  describe('POST /users/signup', () => {
    it ('should create a new user and return tokens', async () => {
      const res = await request(app)
        .post('/users/signup')
        .send({
          username: 'testuser',
          password:  'testpassword123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.result).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should not allow duplicate the same user', async () => {
      await request(app)
        .post('/users/signup')
        .send({
          username: 'testuser',
          password: 'testpassword123',
        });
      
      const res = await request(app)
      .post('/users/signup')
      .send({
        username: 'testuser',
        password: 'testpassword123',
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.result).toBe(false);
    });
  });

  describe('POST /users/signin', () => {
    beforeEach(async () => {
      await request(app)
        .post('/users/signup')
        .send({
          username: 'testuser',
          password: 'testpassword123',
        });
    });

    it('should signin user and return tokens', async () => {
      const res = await request(app)
        .post('/users/signin')
        .send({
          username: 'testuser',
          password: 'testpassword123',
        });
      
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/users/signin')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.result).toBe(false);
    });
  });

  describe ('POST /users/refresh-token', () => {
    it ('should return new access token with valid refresh token', async () => {
      const signupRes = await request(app)
      .post('/users/signup')
      .send({
        username: 'testuser',
        password: 'testpassword123',
      });
      const refreshToken = signupRes.body.refreshToken;

      const res = await request(app)
        .post('/users/refresh-token')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/users/refresh-token')
        .send({ refreshToken: 'wrongtoken' });

      expect(res.statusCode).toBe(401);
      expect(res.body.result).toBe(false);
    });
  });

  describe ('POST /users/logout', () => {
    it ('should cancel the refresh token and logout the user', async () => {
      const signupRes = await request(app)
      .post('/users/signup')
      .send({
        username: 'testuser',
        password: 'testpassword123',
      });

      const accessToken = signupRes.body.accessToken;
      const refreshToken = signupRes.body.refreshToken;

      const logoutRes = await request(app)
      .post('/users/logout')
      .set('Authorization', `Bearer ${accessToken}`)

      expect(logoutRes.statusCode).toBe(200);
      expect(logoutRes.body.result).toBe(true);

      const refreshRes = await request(app)
      .post('/users/refresh-token')
      .send({ refreshToken });

      expect(refreshRes.statusCode).toBe(401);
    });
  });

});

afterAll(async () => {
  await mongoose.disconnect();
});




