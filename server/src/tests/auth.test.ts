import { randomUUID } from 'crypto';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';

vi.mock('../lib/prisma.js', () => {
  const users: any[] = [];

  const prismaMock = {
    user: {
      async findUnique({ where }: { where: { email?: string; id?: string } }) {
        if (where.email) {
          return users.find((user) => user.email === where.email) ?? null;
        }

        if (where.id) {
          return users.find((user) => user.id === where.id) ?? null;
        }

        return null;
      },
      async create({ data }: { data: { email: string; hashedPassword: string; displayName: string } }) {
        const user = {
          id: randomUUID(),
          email: data.email,
          hashedPassword: data.hashedPassword,
          displayName: data.displayName,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        users.push(user);
        return user;
      },
      async deleteMany() {
        const count = users.length;
        users.length = 0;
        return { count };
      },
    },
    async $disconnect() {
      users.length = 0;
    },
  };

  return { prisma: prismaMock };
});

import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('Authentication', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Test1234',
        displayName: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.displayName).toBe('Test User');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should not register a user with an existing email', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Test1234',
        displayName: 'Test User',
      });

      const response = await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Test1234',
        displayName: 'Another User',
      });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email already in use');
    });

    it('should validate email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'Test1234',
        displayName: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should validate password strength', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'weak@example.com',
        password: 'weak',
        displayName: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should validate displayName', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'noname@example.com',
        password: 'Test1234',
        displayName: 'T',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('Test1234', 10);
      await prisma.user.create({
        data: {
          email: 'login@example.com',
          hashedPassword,
          displayName: 'Login User',
        },
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Test1234',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('login@example.com');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should not login with incorrect email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'wrong@example.com',
        password: 'Test1234',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPassword123',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let validRefreshToken: string;

    beforeAll(async () => {
      const registerResponse = await request(app).post('/api/auth/register').send({
        email: 'refresh@example.com',
        password: 'Test1234',
        displayName: 'Refresh User',
      });

      validRefreshToken = registerResponse.body.data.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken: validRefreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should not refresh with invalid token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});
