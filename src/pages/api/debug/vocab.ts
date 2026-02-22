import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all vocabulary
    const allVocab = await prisma.vocabulary.findMany({
      select: { id: true, word: true, topic: true, difficulty: true },
    });

    // Get unique topics
    const topics = [...new Set(allVocab.map(v => v.topic))];

    // Get unique difficulties
    const difficulties = [...new Set(allVocab.map(v => v.difficulty))];

    // Count by topic
    const countsByTopic = topics.map(topic => ({
      topic,
      count: allVocab.filter(v => v.topic === topic).length,
    }));

    res.json({
      total: allVocab.length,
      topics,
      difficulties,
      countsByTopic,
      sample: allVocab.slice(0, 5),
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Failed to fetch debug info' });
  }
}
