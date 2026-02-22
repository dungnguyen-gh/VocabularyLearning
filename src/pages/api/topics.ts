import type { NextApiRequest, NextApiResponse } from 'next';

const TOPICS = [
  { id: 'travel', name: 'Travel', icon: '✈️', description: 'Words for traveling and tourism' },
  { id: 'business', name: 'Business', icon: '💼', description: 'Professional and workplace vocabulary' },
  { id: 'technology', name: 'Technology', icon: '💻', description: 'Digital and tech-related terms' },
  { id: 'daily life', name: 'Daily Life', icon: '🏠', description: 'Everyday activities and routines' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json({ topics: TOPICS });
}
