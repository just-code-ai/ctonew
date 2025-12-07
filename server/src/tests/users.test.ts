import { randomUUID } from 'crypto';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

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

describe('Users', () => {
  let accessToken: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({});

    const registerResponse = await request(app).post('/api/auth/register').send({
      email: 'user@example.com',
      password: 'Test1234',
      displayName: 'Test User',
    });

    accessToken = registerResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/users/me', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('user@example.com');
      expect(response.body.data.user.displayName).toBe('Test User');
      expect(response.body.data.user).not.toHaveProperty('hashedPassword');
    });

    it('should not get user without token', async () => {
      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should not get user with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', accessToken);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });
});
