const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const User = require('../models/User');

// Setup a minimal express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock process.env
process.env.JWT_SECRET = 'test-secret';

describe('Auth API Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    
    // Check if the user was actually saved to the database
    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).not.toBeNull();
  });

  it('should not register a user with an existing email', async () => {
    // First, create a user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    // Then, try to register with the same email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'password456'
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('should log in an existing user successfully', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'login@example.com',
        password: 'password123'
      });

    // Then, log in
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not log in with incorrect credentials', async () => {
    // Register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'login@example.com',
        password: 'password123'
      });
      
    // Try to log in with the wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword'
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Invalid credentials');
  });
}); 