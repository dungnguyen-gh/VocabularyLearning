import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { shuffle, sample } from '@/lib/shuffle';
import { getUserFromRequest } from '@/lib/auth';

const generateSchema = z.object({
  vocab: z.array(z.object({
    id: z.string(),
    word: z.string(),
    ipa: z.string().optional(),
    meaning: z.string(),
    example: z.string(),
  })).min(1).max(20),
});

// In-memory store for quiz answer keys (use Redis in production)
const quizStore = new Map<string, {
  userId: string | null;
  questions: {
    vocabId: string;
    correctAnswer: string;
    type: 'multiple_choice' | 'fill_blank';
  }[];
  createdAt: number;
}>();

// Cleanup old quizzes every hour
setInterval(() => {
  const now = Date.now();
  for (const [id, quiz] of quizStore.entries()) {
    if (now - quiz.createdAt > 60 * 60 * 1000) {
      quizStore.delete(id);
    }
  }
}, 60 * 60 * 1000);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vocab } = generateSchema.parse(req.body);
    const user = getUserFromRequest(req);

    // Get all meanings for distractors
    const allVocab = await prisma.vocabulary.findMany({
      select: { meaning: true },
    });
    const allMeanings = allVocab.map(v => v.meaning);

    const questions = [];
    const answerKey = [];

    for (let i = 0; i < vocab.length; i++) {
      const item = vocab[i];
      const isMultipleChoice = Math.random() > 0.5;

      if (isMultipleChoice) {
        // Multiple choice: select correct meaning
        const distractors = sample(
          allMeanings.filter(m => m !== item.meaning),
          3
        );
        const options = shuffle([item.meaning, ...distractors]);

        questions.push({
          type: 'multiple_choice',
          question: `What is the meaning of "${item.word}"?`,
          options,
          vocabId: item.id,
        });

        answerKey.push({
          vocabId: item.id,
          correctAnswer: item.meaning,
          type: 'multiple_choice',
        });
      } else {
        // Fill in blank: word removed from example
        const wordLower = item.word.toLowerCase();
        const blank = '_____';
        let questionText = item.example;

        // Replace word variations in example with blank
        const wordVariations = [
          item.word,
          wordLower,
          item.word.charAt(0).toUpperCase() + item.word.slice(1),
        ];
        
        for (const variation of wordVariations) {
          questionText = questionText.replace(new RegExp(`\\b${variation}\\b`, 'gi'), blank);
        }

        // If word not found in example, use generic question
        if (questionText === item.example) {
          questionText = `Complete: ${item.example} (Word: ${blank})`;
        }

        questions.push({
          type: 'fill_blank',
          question: questionText,
          hint: item.meaning,
          vocabId: item.id,
        });

        answerKey.push({
          vocabId: item.id,
          correctAnswer: item.word,
          type: 'fill_blank',
        });
      }
    }

    // Generate quiz ID and store answer key
    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    quizStore.set(quizId, {
      userId: user?.userId || null,
      questions: answerKey,
      createdAt: Date.now(),
    });

    res.json({
      quizId,
      questions: shuffle(questions),
      total: questions.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Quiz generate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export { quizStore };
