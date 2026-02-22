import request from 'supertest';
import { createServer } from 'http';
import next from 'next';
import { prisma } from '../src/lib/prisma';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: '.' });
const handle = app.getRequestHandler();

let server: any;

// Sample vocab for testing
const sampleVocab = [
  { id: 'vocab-1', word: 'airport', ipa: '/ˈeə.pɔːt/', meaning: 'place for aircraft', example: 'We arrived at the airport.' },
  { id: 'vocab-2', word: 'hotel', ipa: '/həʊˈtel/', meaning: 'place to stay', example: 'We stayed at a hotel.' },
  { id: 'vocab-3', word: 'ticket', ipa: '/ˈtɪk.ɪt/', meaning: 'paper for entry', example: 'Show your ticket.' },
];

describe('Quiz API', () => {
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res));
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/quiz/generate', () => {
    it('should generate a quiz with questions and quizId', async () => {
      const res = await request(server)
        .post('/api/quiz/generate')
        .send({ vocab: sampleVocab })
        .expect(200);

      expect(res.body.quizId).toBeDefined();
      expect(res.body.questions).toBeDefined();
      expect(Array.isArray(res.body.questions)).toBe(true);
      expect(res.body.total).toBe(sampleVocab.length);

      const question = res.body.questions[0];
      expect(question).toHaveProperty('vocabId');
      expect(question).toHaveProperty('type');
      expect(question).toHaveProperty('question');
      expect(['multiple_choice', 'fill_blank']).toContain(question.type);

      // Should not include answer
      expect(question).not.toHaveProperty('correctAnswer');
    });

    it('should create multiple choice questions with options', async () => {
      const res = await request(server)
        .post('/api/quiz/generate')
        .send({ vocab: sampleVocab })
        .expect(200);

      const mcQuestions = res.body.questions.filter((q: any) => q.type === 'multiple_choice');
      
      if (mcQuestions.length > 0) {
        const mc = mcQuestions[0];
        expect(mc.options).toBeDefined();
        expect(Array.isArray(mc.options)).toBe(true);
        expect(mc.options.length).toBe(4); // 1 correct + 3 distractors
      }
    });

    it('should validate vocab input', async () => {
      const res = await request(server)
        .post('/api/quiz/generate')
        .send({ vocab: [] }) // empty vocab
        .expect(400);

      expect(res.body.error).toBe('Invalid input');
    });
  });

  describe('POST /api/quiz/submit', () => {
    let quizId: string;
    let questions: any[];

    beforeEach(async () => {
      // Generate a quiz first
      const res = await request(server)
        .post('/api/quiz/generate')
        .send({ vocab: sampleVocab })
        .expect(200);

      quizId = res.body.quizId;
      questions = res.body.questions;
    });

    it('should evaluate answers and return score', async () => {
      // Create answers - get all correct
      const answers = questions.map((q: any) => ({
        vocabId: q.vocabId,
        answer: q.type === 'multiple_choice' ? q.options[0] : sampleVocab.find(v => v.id === q.vocabId)?.word || '',
      }));

      const res = await request(server)
        .post('/api/quiz/submit')
        .send({
          quizId,
          answers,
          topic: 'travel',
          difficulty: 'easy',
        })
        .expect(200);

      expect(res.body.total).toBe(sampleVocab.length);
      expect(res.body.correct).toBeDefined();
      expect(res.body.score).toBeDefined();
      expect(res.body.corrections).toBeDefined();
      expect(Array.isArray(res.body.corrections)).toBe(true);

      // Score calculation: correct * 10 + perfect bonus
      const expectedScore = res.body.correct * 10 + (res.body.correct === res.body.total ? 20 : 0);
      expect(res.body.score).toBe(expectedScore);
    });

    it('should return corrections for wrong answers', async () => {
      // Submit with intentionally wrong answers
      const answers = questions.map((q: any) => ({
        vocabId: q.vocabId,
        answer: 'wrong-answer',
      }));

      const res = await request(server)
        .post('/api/quiz/submit')
        .send({
          quizId,
          answers,
          topic: 'travel',
          difficulty: 'easy',
        })
        .expect(200);

      expect(res.body.correct).toBe(0);
      expect(res.body.score).toBe(0);
      
      // Check corrections show correct answers
      const correction = res.body.corrections[0];
      expect(correction).toHaveProperty('vocabId');
      expect(correction).toHaveProperty('correct', false);
      expect(correction).toHaveProperty('userAnswer', 'wrong-answer');
      expect(correction).toHaveProperty('correctAnswer');
    });

    it('should return 404 for expired/invalid quizId', async () => {
      await request(server)
        .post('/api/quiz/submit')
        .send({
          quizId,
          answers: [],
          topic: 'travel',
          difficulty: 'easy',
        })
        .expect(200);

      // Second submit should fail - quiz was deleted
      const res = await request(server)
        .post('/api/quiz/submit')
        .send({
          quizId,
          answers: [],
          topic: 'travel',
          difficulty: 'easy',
        })
        .expect(404);

      expect(res.body.error).toContain('not found');
    });
  });
});
