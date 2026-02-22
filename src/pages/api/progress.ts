import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    // Get progress data
    const progress = await prisma.progress.findMany({
      where: { userId: user.userId },
      orderBy: { xp: 'desc' },
    });

    // Get recent quiz results to identify weak words
    const recentResults = await prisma.quizResult.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate weak words (vocab items answered incorrectly multiple times)
    const wrongCount = new Map<string, number>();
    for (const result of recentResults) {
      const details = result.details as Array<{
        vocabId: string;
        correct: boolean;
      }>;
      for (const detail of details) {
        if (!detail.correct) {
          wrongCount.set(detail.vocabId, (wrongCount.get(detail.vocabId) || 0) + 1);
        }
      }
    }

    // Get weak vocab items (wrong >= 2 times)
    const weakVocabIds = Array.from(wrongCount.entries())
      .filter(([, count]) => count >= 2)
      .map(([id]) => id);

    let weakWords: Array<{ id: string; word: string; meaning: string; topic: string }> = [];
    if (weakVocabIds.length > 0) {
      const vocabItems = await prisma.vocabulary.findMany({
        where: { id: { in: weakVocabIds } },
        select: { id: true, word: true, meaning: true, topic: true },
      });
      weakWords = vocabItems.map(v => ({
        ...v,
        wrongCount: wrongCount.get(v.id) || 0,
      })) as any;
    }

    // Calculate total stats
    const totalXp = progress.reduce((sum, p) => sum + p.xp, 0);
    const bestStreak = Math.max(0, ...progress.map(p => p.streak));

    res.json({
      totalXp,
      bestStreak,
      topics: progress.map(p => ({
        topic: p.topic,
        difficulty: p.difficulty,
        xp: p.xp,
        streak: p.streak,
        lastPracticed: p.lastPracticed,
      })),
      weakWords: weakWords.slice(0, 10), // Top 10 weak words
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
