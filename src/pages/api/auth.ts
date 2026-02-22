import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, generateToken, setAuthCookie, clearAuthCookie, getUserFromRequest } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  try {
    if (req.method === 'POST' && action === 'register') {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      const hashedPassword = await hashPassword(data.password);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          displayName: data.displayName,
        },
      });
      
      const token = generateToken({ userId: user.id, email: user.email });
      setAuthCookie(res, token);
      
      return res.status(201).json({
        user: { id: user.id, email: user.email, displayName: user.displayName },
      });
    }

    if (req.method === 'POST' && action === 'login') {
      const data = loginSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });
      
      if (!user || !(await verifyPassword(data.password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = generateToken({ userId: user.id, email: user.email });
      setAuthCookie(res, token);
      
      return res.json({
        user: { id: user.id, email: user.email, displayName: user.displayName },
      });
    }

    if (req.method === 'POST' && action === 'logout') {
      clearAuthCookie(res);
      return res.json({ message: 'Logged out' });
    }

    if (req.method === 'GET' && action === 'me') {
      const userData = getUserFromRequest(req);
      if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userData.userId },
        select: { id: true, email: true, displayName: true },
      });
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      return res.json({ user });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
