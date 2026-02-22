import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const generateSchema = z.object({
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().min(1).max(20).default(10),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, difficulty, count } = generateSchema.parse(req.body);

    console.log('Fetching vocab for:', { topic, difficulty, count });

    // Make topic lowercase for case-insensitive matching
    const normalizedTopic = topic.toLowerCase().trim();
    
    console.log('Searching for:', { normalizedTopic, difficulty, count });

    // Use raw query for RANDOM() ordering (PostgreSQL specific)
    // Use LOWER() for case-insensitive comparison
    const vocab = await prisma.$queryRaw`
      SELECT id, word, ipa, meaning, example, topic, difficulty
      FROM "Vocabulary"
      WHERE LOWER(topic) = ${normalizedTopic} AND difficulty = ${difficulty}
      ORDER BY RANDOM()
      LIMIT ${count}
    `;

    console.log('Found vocab count:', Array.isArray(vocab) ? vocab.length : 0);

    if (!Array.isArray(vocab) || vocab.length === 0) {
      return res.status(404).json({ error: 'No vocabulary found for this topic and difficulty' });
    }

    res.json({ 
      vocab: vocab.map((v: any) => ({
        id: v.id,
        word: v.word,
        ipa: v.ipa,
        meaning: v.meaning,
        example: v.example,
      }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Vocab generate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
