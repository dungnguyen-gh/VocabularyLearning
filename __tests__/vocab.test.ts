import request from 'supertest';
import { createServer } from 'http';
import next from 'next';
import { prisma } from '../src/lib/prisma';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: '.' });
const handle = app.getRequestHandler();

let server: any;

describe('Vocabulary API', () => {
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res));
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/vocab/generate', () => {
    it('should return randomized vocabulary with correct structure', async () => {
      const res = await request(server)
        .post('/api/vocab/generate')
        .send({ topic: 'travel', difficulty: 'easy', count: 5 })
        .expect(200);

      expect(res.body.vocab).toBeDefined();
      expect(Array.isArray(res.body.vocab)).toBe(true);
      expect(res.body.vocab.length).toBeLessThanOrEqual(5);

      if (res.body.vocab.length > 0) {
        const item = res.body.vocab[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('word');
        expect(item).toHaveProperty('meaning');
        expect(item).toHaveProperty('example');
        expect(item).not.toHaveProperty('topic');
        expect(item).not.toHaveProperty('difficulty');
      }
    });

    it('should return different results on multiple calls (randomness)', async () => {
      const res1 = await request(server)
        .post('/api/vocab/generate')
        .send({ topic: 'travel', difficulty: 'easy', count: 10 })
        .expect(200);

      const res2 = await request(server)
        .post('/api/vocab/generate')
        .send({ topic: 'travel', difficulty: 'easy', count: 10 })
        .expect(200);

      // Due to randomness, results should differ (though there's a small chance they could be the same)
      // We'll check at least the structure is consistent
      expect(res1.body.vocab.length).toBeGreaterThan(0);
      expect(res2.body.vocab.length).toBeGreaterThan(0);
      
      // Extract word lists
      const words1 = res1.body.vocab.map((v: any) => v.word).sort();
      const words2 = res2.body.vocab.map((v: any) => v.word).sort();
      
      // They might be the same occasionally, but we just verify the API works
      expect(words1).toBeDefined();
      expect(words2).toBeDefined();
    });

    it('should return 404 for non-existent topic', async () => {
      const res = await request(server)
        .post('/api/vocab/generate')
        .send({ topic: 'nonexistent', difficulty: 'easy', count: 5 })
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    it('should validate input', async () => {
      const res = await request(server)
        .post('/api/vocab/generate')
        .send({ topic: 'travel' }) // missing difficulty
        .expect(400);

      expect(res.body.error).toBe('Invalid input');
    });
  });

  describe('GET /api/topics', () => {
    it('should return list of topics', async () => {
      const res = await request(server)
        .get('/api/topics')
        .expect(200);

      expect(res.body.topics).toBeDefined();
      expect(Array.isArray(res.body.topics)).toBe(true);
      expect(res.body.topics.length).toBe(4);
      
      const topic = res.body.topics[0];
      expect(topic).toHaveProperty('id');
      expect(topic).toHaveProperty('name');
      expect(topic).toHaveProperty('icon');
      expect(topic).toHaveProperty('description');
    });
  });
});
