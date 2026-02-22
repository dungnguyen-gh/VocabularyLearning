import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { quizStore } from './generate';
import { getUserFromRequest } from '@/lib/auth';

const submitSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.object({
    vocabId: z.string(),
    answer: z.string(),
  })),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { quizId, answers, topic, difficulty } = submitSchema.parse(req.body);
    const user = getUserFromRequest(req);

    // Retrieve answer key
    const quizData = quizStore.get(quizId);
    if (!quizData) {
      return res.status(404).json({ error: 'Quiz not found or expired' });
    }

    // Validate user if quiz was created by authenticated user
    if (quizData.userId && (!user || user.userId !== quizData.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Evaluate answers
    const corrections = [];
    let correct = 0;
    const details = [];

    for (const question of quizData.questions) {
      const userAnswer = answers.find(a => a.vocabId === question.vocabId);
      const userAnswerText = userAnswer?.answer?.trim() || '';
      
      // Case-insensitive comparison for fill-in-blank
      const isCorrect = question.type === 'fill_blank'
        ? userAnswerText.toLowerCase() === question.correctAnswer.toLowerCase()
        : userAnswerText === question.correctAnswer;

      if (isCorrect) correct++;

      corrections.push({
        vocabId: question.vocabId,
        correct: isCorrect,
        userAnswer: userAnswerText,
        correctAnswer: question.correctAnswer,
        type: question.type,
      });

      details.push({
        vocabId: question.vocabId,
        correct: isCorrect,
        userAnswer: userAnswerText,
        correctAnswer: question.correctAnswer,
      });
    }

    const total = quizData.questions.length;
    const baseScore = correct * 10;
    const perfectBonus = correct === total ? 20 : 0;
    const score = baseScore + perfectBonus;

    // Save quiz result if user is authenticated
    if (user) {
      await prisma.quizResult.create({
        data: {
          userId: user.userId,
          topic,
          difficulty,
          total,
          correct,
          score,
          details,
        },
      });

      // Update progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingProgress = await prisma.progress.findUnique({
        where: {
          userId_topic_difficulty: {
            userId: user.userId,
            topic,
            difficulty,
          },
        },
      });

      if (existingProgress) {
        const lastPracticed = new Date(existingProgress.lastPracticed);
        lastPracticed.setHours(0, 0, 0, 0);
        
        const oneDayMs = 24 * 60 * 60 * 1000;
        const daysSinceLastPractice = Math.floor((today.getTime() - lastPracticed.getTime()) / oneDayMs);
        
        // Update streak: reset if more than 1 day gap, increment if practiced yesterday
        let newStreak = existingProgress.streak;
        if (daysSinceLastPractice === 1) {
          newStreak += 1;
        } else if (daysSinceLastPractice > 1) {
          newStreak = 1;
        }

        await prisma.progress.update({
          where: { id: existingProgress.id },
          data: {
            xp: { increment: score },
            streak: newStreak,
            lastPracticed: new Date(),
          },
        });
      } else {
        await prisma.progress.create({
          data: {
            userId: user.userId,
            topic,
            difficulty,
            xp: score,
            streak: 1,
            lastPracticed: new Date(),
          },
        });
      }
    }

    // Clean up quiz store
    quizStore.delete(quizId);

    res.json({
      total,
      correct,
      score,
      corrections,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Quiz submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
